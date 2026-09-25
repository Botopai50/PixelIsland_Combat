import * as THREE from 'three';
import type { GameContext } from '../core/Context';
import { HumanoidRig, HERO_STYLE, ARM_UPPER, ARM_FORE } from './HumanoidRig';
import { HumanoidAnimator } from './HumanoidAnimator';
import { solveTwoBoneIK } from './IK';
import { FootIK } from './FootIK';
import type { PlayerController } from './PlayerController';
import { createWeaponModel, BOW_DRAW_LEN, type WeaponModel } from '../items/WeaponModels';
import { ATTACKS, TWO_HAND_GRIP, pivotFor, swingDirLocal } from '../combat/Attacks';
import { SlashTrail } from '../vfx/Trail';
import { Spring, clamp01, damp, easeOutBack, yawToDir } from '../core/math';
import type { ItemId } from '../items/Items';

const REST_WEAPON = new THREE.Quaternion().setFromEuler(new THREE.Euler(1.9, 0, 0));
const REST_SHIELD = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI / 2, 0));
const REST_BOW = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2 + 0.3, 0, Math.PI / 2));
const BACK_SHIELD = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI, 0));
// guardadas nas costas (fora de combate): empunhadura sobre o ombro direito, lâmina na diagonal
const SHEATH_WEAPON = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.12, 0, 3.67));
const SHEATH_BOW = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI, -0.55));
const SHEATH_OFFSET = new THREE.Vector3(-0.1, 0.12, -0.02);
const SHIELD_BACK_OFFSET = new THREE.Vector3(0, -0.02, -0.07);

/** Monta a orientação de uma arma a partir da direção da lâmina (+Y) e do gume (+Z). */
export function weaponBasis(dir: THREE.Vector3, edge: THREE.Vector3, out: THREE.Quaternion) {
  const y = dir.clone().normalize();
  const z = edge.clone().addScaledVector(y, -edge.dot(y)).normalize();
  const x = new THREE.Vector3().crossVectors(y, z);
  const m = new THREE.Matrix4().makeBasis(x, y, z);
  return out.setFromRotationMatrix(m);
}

/**
 * Visual de 3ª pessoa do jogador: corpo completo, armas nas mãos, IK para
 * a mão acompanhar exatamente a arma lógica durante golpes, arco e escudo.
 */
export class PlayerView {
  readonly rig = new HumanoidRig(HERO_STYLE);
  readonly animator: HumanoidAnimator;
  readonly trail = new SlashTrail(26);
  private footIK: FootIK;
  private models = new Map<ItemId, WeaponModel>();
  private shield: WeaponModel;
  private lastMain: ItemId | null = null;
  private weaponSpring = new Spring(260, 16);
  private shieldSpring = new Spring(240, 15);
  private chargeGlow = 0;
  private equipScale = 1;
  private hurtFlashed = 0;
  private q = new THREE.Quaternion();
  private q2 = new THREE.Quaternion();
  private v = new THREE.Vector3();
  private v2 = new THREE.Vector3();
  private dir = new THREE.Vector3();
  private edge = new THREE.Vector3();
  private hand = new THREE.Vector3();
  private pole = new THREE.Vector3();
  private yawQ = new THREE.Quaternion();

  constructor(private ctx: GameContext, private player: PlayerController) {
    this.animator = new HumanoidAnimator(this.rig);
    this.footIK = new FootIK(ctx.physics);
    this.animator.onFootstep = (_foot, intensity) => {
      const p = player.position;
      ctx.events.emit('footstep', { pos: p.clone(), surface: player.motor.surface, intensity, player: true });
    };
    ctx.scene.add(this.rig.root);
    ctx.scene.add(this.trail.mesh);
    for (const id of ['sword', 'axe', 'pickaxe', 'bow'] as ItemId[]) {
      const m = createWeaponModel(id);
      m.root.visible = false;
      ctx.scene.add(m.root);
      this.models.set(id, m);
    }
    this.shield = createWeaponModel('shield');
    ctx.scene.add(this.shield.root);
    player.stickRoot = this.rig.root;
  }

  set visible(v: boolean) {
    this.rig.root.visible = v;
    for (const m of this.models.values()) if (!v) m.root.visible = false;
    if (!v) this.shield.root.visible = false;
    this.hidden = !v;
  }
  private hidden = false;
  /** Tempo desde a última ação de combate (arma volta às costas depois de um tempo). */
  private calmT = 0;
  sheathed = false;

  update(dt: number) {
    const p = this.player;
    const T = this.ctx.tuning;
    const rig = this.rig;
    rig.root.position.copy(p.position);
    rig.root.position.y += p.motor.visualStepOffset;
    rig.root.rotation.y = p.facing;

    if (p.recoilImpulse > 0) {
      this.weaponSpring.impulse(p.recoilImpulse * 9);
      this.animator.kick(p.recoilImpulse * 3);
      p.recoilImpulse = 0;
    }
    if (p.shieldImpulse > 0) {
      this.shieldSpring.impulse(p.shieldImpulse * 7);
      this.animator.kick(p.shieldImpulse * 2);
      p.shieldImpulse = 0;
    }
    this.weaponSpring.update(dt);
    this.shieldSpring.update(dt);

    if (p.state === 'hurt' && this.hurtFlashed !== p.time - p.stateT) {
      this.hurtFlashed = p.time - p.stateT;
      if (T.hitFlashEnabled) rig.flash(0xff3030, 0.12);
    }
    rig.updateFlash(dt);

    // ---------------------------------------------------------------- guardar/sacar (estilo BotW)
    const combatState = p.state !== 'move' && p.state !== 'equip' && p.state !== 'dodge';
    let enemyNear = false;
    for (const t of this.ctx.combat.targets) {
      if (t.team === 'enemy' && t.alive && t.center(this.v).distanceTo(p.position) < 9) {
        enemyNear = true;
        break;
      }
    }
    if (combatState || p.guardAmount > 0.05 || p.lockTarget || enemyNear) this.calmT = 0;
    else this.calmT += dt;
    const wantSheath = this.calmT > 2.5;
    if (wantSheath !== this.sheathed) {
      this.sheathed = wantSheath;
      this.equipScale = 0.35;
      if (p.mainHand) this.ctx.sound.play(wantSheath ? 'unequip' : 'equip', { pos: p.position, vol: 0.5, variant: 'blade' });
    }
    const sheathed = this.sheathed;
    // postura de prontidão (idle de combate) quando a arma corpo a corpo está em mãos
    p.anim.ready = !sheathed && (p.mainHand === 'sword' || p.mainHand === 'axe' || p.mainHand === 'pickaxe') ? 1 : 0;
    p.anim.hasShieldUp = p.hasShield;
    this.animator.update(dt, p.anim);
    // pés se ajustam ao chão (degraus, bordas, rampas) quando apoiado
    const feetOnGround = p.motor.grounded && p.state !== 'dodge' && p.state !== 'dead' && !(p.state === 'attack' && p.attack?.def.spin);
    // só parado/quase parado: andando/correndo quem manda é a passada animada
    const spd = Math.hypot(p.motor.velocity.x, p.motor.velocity.z);
    this.footIK.update(dt, rig, feetOnGround && spd < 0.6, 1, !p.motor.grounded);
    rig.root.updateMatrixWorld(true);


    // ---------------------------------------------------------------- equipamento visível
    const main = p.mainHand;
    if (main !== this.lastMain) {
      this.equipScale = 0.15;
      this.lastMain = main;
    }
    this.equipScale = damp(this.equipScale, 1, 14, dt);
    let mainScale = easeOutBack(clamp01(this.equipScale));
    if (p.state === 'equip' && p.stateT < 0.12) mainScale = Math.max(0.05, 1 - p.stateT / 0.12);
    for (const [id, m] of this.models) m.root.visible = !this.hidden && id === main;
    const model = main ? this.models.get(main) : undefined;

    // ---------------------------------------------------------------- arma principal
    const yaw = p.facing;
    this.yawQ.setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
    const def = p.state === 'attack' && p.attack ? p.attack.def : p.state === 'charge' && p.weapon?.charged ? ATTACKS[p.weapon.charged] : null;
    if (model && main !== 'bow') {
      model.root.scale.setScalar(mainScale * (main && T.rangeMul !== 1 ? 1 : 1));
      model.root.scale.y = mainScale * T.rangeMul;
      if (def) {
        // pose LÓGICA do golpe (mesma usada no dano)
        let angle = p.swingAngle;
        if (p.state === 'charge') {
          const sgn = Math.sign(def.arc[1] - def.arc[0]) || 1;
          angle = def.arc[0] - sgn * 22 + Math.sin(p.time * 40) * 2 * clamp01(p.chargeT / T.chargeTime);
        }
        swingDirLocal(def, angle, this.dir, this.edge, p.state === 'attack' ? p.attack?.aimPitch ?? 0 : 0);
        const { pivot, reach } = pivotFor(def);
        this.hand.copy(pivot).addScaledVector(this.dir, reach).applyQuaternion(this.yawQ).add(p.position);
        this.hand.y += p.motor.visualStepOffset;
        this.dir.applyQuaternion(this.yawQ);
        this.edge.applyQuaternion(this.yawQ);
        weaponBasis(this.dir, this.edge, this.q);
        // recuo: gira a arma contra o sentido do golpe
        if (this.weaponSpring.value !== 0) {
          const axis = this.v.crossVectors(this.dir, this.edge).normalize();
          this.q2.setFromAxisAngle(axis, -this.weaponSpring.value * 0.12);
          this.q.premultiply(this.q2);
        }
        model.root.position.copy(this.hand);
        model.root.quaternion.copy(this.q);
        // IK do braço direito até a empunhadura
        rig.joints.upperArmR.getWorldPosition(this.pole);
        const right = this.v2.set(-Math.cos(yaw), 0, Math.sin(yaw));
        this.pole.addScaledVector(right, 0.5).add(this.v.set(0, -0.6, 0)).addScaledVector(yawToDir(yaw, this.v), -0.3);
        solveTwoBoneIK(rig.joints.upperArmR, rig.joints.forearmR, ARM_UPPER, ARM_FORE, this.hand, this.pole, 1);
        if (def.work) {
          // ferramenta: mão esquerda também no cabo (pegada de duas mãos)
          const grip = this.v2.copy(this.hand).addScaledVector(this.dir, TWO_HAND_GRIP);
          rig.joints.upperArmL.getWorldPosition(this.pole);
          this.pole.add(this.v.set(Math.cos(yaw) * 0.5, -0.6, -Math.sin(yaw) * 0.5));
          solveTwoBoneIK(rig.joints.upperArmL, rig.joints.forearmL, ARM_UPPER, ARM_FORE, grip, this.pole, 1);
        }
      } else if (sheathed) {
        // nas costas
        rig.sockets.back.localToWorld(model.root.position.copy(SHEATH_OFFSET));
        rig.sockets.back.getWorldQuaternion(this.q);
        model.root.quaternion.copy(this.q).multiply(SHEATH_WEAPON);
      } else {
        // segue a mão (pose de descanso)
        rig.sockets.handR.getWorldPosition(model.root.position);
        rig.sockets.handR.getWorldQuaternion(this.q);
        model.root.quaternion.copy(this.q).multiply(REST_WEAPON);
        if (this.weaponSpring.value !== 0) model.root.rotateX(-this.weaponSpring.value * 0.1);
        const g = p.guardAmount;
        if ((main === 'axe' || main === 'pickaxe') && g > 0.01) {
          // defesa com ferramenta: cabo na horizontal à frente do peito, duas mãos
          const hand = this.v2.set(-0.22, 1.3 - this.shieldSpring.value * 0.03, 0.38).applyQuaternion(this.yawQ).add(p.position);
          hand.y += p.motor.visualStepOffset;
          const dir = this.dir.set(1, 0.3, 0.1).normalize().applyQuaternion(this.yawQ);
          const edge = this.edge.set(0, 1, 0);
          weaponBasis(dir, edge, this.q2);
          model.root.position.lerp(hand, g);
          model.root.quaternion.slerp(this.q2, g);
          rig.joints.upperArmR.getWorldPosition(this.pole);
          this.pole.add(this.v.set(-Math.cos(yaw) * 0.5, -0.6, Math.sin(yaw) * 0.5));
          solveTwoBoneIK(rig.joints.upperArmR, rig.joints.forearmR, ARM_UPPER, ARM_FORE, model.root.position, this.pole, g);
          const grip = this.v.copy(dir).multiplyScalar(0.45).add(model.root.position);
          rig.joints.upperArmL.getWorldPosition(this.pole);
          this.pole.add(this.hand.set(Math.cos(yaw) * 0.5, -0.6, -Math.sin(yaw) * 0.5));
          solveTwoBoneIK(rig.joints.upperArmL, rig.joints.forearmL, ARM_UPPER, ARM_FORE, grip, this.pole, g);
        }
      }
      // brilho de carga
      const charge = p.state === 'charge' ? clamp01(p.chargeT / T.chargeTime) : 0;
      const full = charge >= 1 ? 0.6 + Math.sin(p.time * 30) * 0.4 : charge * 0.35;
      this.chargeGlow = damp(this.chargeGlow, full, 20, dt);
      model.setGlow(this.chargeGlow);
    }

    // ---------------------------------------------------------------- arco (IK das duas mãos)
    if (main === 'bow' && model) {
      model.root.scale.setScalar(mainScale);
      const drawing = p.state === 'bow' || p.state === 'bowRecover';
      const nocked = p.state === 'bow' && p.inventory.count('arrow') > 0;
      model.setDraw?.(p.state === 'bow' ? p.bowDraw : 0, nocked);
      if (drawing) {
        const aimDir = this.v.set(Math.sin(p.aim.yaw) * Math.cos(p.aim.pitch), Math.sin(p.aim.pitch), Math.cos(p.aim.yaw) * Math.cos(p.aim.pitch));
        const leftOfAim = new THREE.Vector3(aimDir.z, 0, -aimDir.x).normalize();
        // braço esquerdo esticado a partir do OMBRO real (corpo já girado de lado pelo animador).
        // A linha do tiro fica deslocada para o lado do ROSTO (-leftOfAim): arco e flecha passam
        // ao lado da cabeça e a mão da corda não entra no pescoço.
        const grip = rig.joints.upperArmL.getWorldPosition(this.hand).addScaledVector(aimDir, 0.5).addScaledVector(leftOfAim, -0.2);
        grip.y += 0.07; // braço levemente erguido: a linha da flecha passa na altura do queixo
        const up = this.v2.set(0, 1, 0).addScaledVector(aimDir, -aimDir.y).normalize();
        // leve inclinação do arco (cantado para fora)
        up.applyAxisAngle(aimDir, -0.18);
        const x = new THREE.Vector3().crossVectors(up, aimDir);
        this.q.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, up, aimDir));
        model.root.position.copy(grip);
        model.root.quaternion.copy(this.q);
        // cotovelo esquerdo quase reto, levemente para baixo e para fora
        rig.joints.upperArmL.getWorldPosition(this.pole);
        this.pole.addScaledVector(leftOfAim, 0.4).y -= 0.5;
        solveTwoBoneIK(rig.joints.upperArmL, rig.joints.forearmL, ARM_UPPER, ARM_FORE, grip, this.pole, 1);
        // mão direita na corda; na puxada completa chega perto da bochecha
        // a mão fica do lado do PEITO (à direita da linha da mira), nunca dentro do tronco
        const stringPos = this.v2.copy(grip).addScaledVector(aimDir, -0.1 - p.bowDraw * BOW_DRAW_LEN);
        // cotovelo direito alto, atrás e para fora do corpo
        this.pole.copy(stringPos).addScaledVector(aimDir, -0.5).addScaledVector(leftOfAim, -0.45).y += 0.3;
        solveTwoBoneIK(rig.joints.upperArmR, rig.joints.forearmR, ARM_UPPER, ARM_FORE, stringPos, this.pole, 1);
      } else if (sheathed) {
        rig.sockets.back.localToWorld(model.root.position.copy(SHEATH_OFFSET).setX(0.05));
        rig.sockets.back.getWorldQuaternion(this.q);
        model.root.quaternion.copy(this.q).multiply(SHEATH_BOW);
      } else {
        rig.sockets.handL.getWorldPosition(model.root.position);
        rig.sockets.handL.getWorldQuaternion(this.q);
        model.root.quaternion.copy(this.q).multiply(REST_BOW);
      }
    }

    // ---------------------------------------------------------------- escudo
    const sh = this.shield;
    sh.root.visible = !this.hidden && p.offHand === 'shield';
    if (sh.root.visible) {
      // com ferramenta (duas mãos) o escudo fica nas costas, exceto ao defender
      const toolInHands = main === 'axe' || main === 'pickaxe';
      if (main === 'bow' || sheathed || toolInHands) {
        rig.sockets.back.localToWorld(sh.root.position.copy(SHIELD_BACK_OFFSET));
        rig.sockets.back.getWorldQuaternion(this.q);
        sh.root.quaternion.copy(this.q).multiply(BACK_SHIELD);
      } else {
        // pose de descanso: no antebraço
        rig.sockets.shieldArm.getWorldPosition(this.v);
        rig.sockets.shieldArm.getWorldQuaternion(this.q);
        this.q.multiply(REST_SHIELD);
        const g = p.guardAmount;
        if (g > 0.01) {
          // pose de defesa: à frente do peito, voltado para frente
          const guardPos = this.v2.set(0.02, 1.2, 0.46 - this.shieldSpring.value * 0.05).applyQuaternion(this.yawQ).add(p.position);
          guardPos.y += p.motor.visualStepOffset;
          this.q2.setFromEuler(new THREE.Euler(-0.08 - this.shieldSpring.value * 0.08, yaw - 0.18, 0.06, 'YXZ'));
          this.v.lerp(guardPos, g);
          this.q.slerp(this.q2, g);
          sh.root.position.copy(this.v);
          sh.root.quaternion.copy(this.q);
          // mão esquerda segura a alça
          rig.joints.upperArmL.getWorldPosition(this.pole);
          this.pole.addScaledVector(this.v2.set(Math.cos(yaw), -0.8, -Math.sin(yaw)), 0.6);
          const grip = this.v2.set(0, 0, -0.03).applyQuaternion(this.q).add(this.v);
          solveTwoBoneIK(rig.joints.upperArmL, rig.joints.forearmL, ARM_UPPER, ARM_FORE, grip, this.pole, g);
        } else {
          sh.root.position.copy(this.v);
          sh.root.quaternion.copy(this.q);
        }
      }
      sh.setGlow(p.state === 'guardHit' ? 0.3 : 0);
    }

    // ---------------------------------------------------------------- rastro do golpe
    const a = p.attack;
    const emitting = !!(model && a && p.state === 'attack' && (p.swingPhase === 'active' || (p.swingPhase === 'recovery' && p.stateT - a.timing.windup - a.timing.active < 0.04)));
    if (emitting && model && a) {
      const base = this.v.set(0, a.weapon.bladeStart, 0).applyQuaternion(model.root.quaternion).multiplyScalar(T.rangeMul).add(model.root.position);
      const tip = this.v2.set(0, a.weapon.bladeEnd, 0).applyQuaternion(model.root.quaternion).multiplyScalar(T.rangeMul).add(model.root.position);
      this.trail.color.set(a.charged ? 0x9fe8ff : a.weapon.trailColor);
      this.trail.push(base, tip);
    }
    this.trail.update(dt, T.trailsEnabled && !this.hidden, a ? 0.6 + a.def.strength * 0.6 : 1);
  }
}
