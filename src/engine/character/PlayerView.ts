import * as THREE from 'three';
import type { GameContext } from '../core/Context';
import { HumanoidRig, HERO_STYLE, ARM_UPPER, ARM_FORE } from './HumanoidRig';
import { HumanoidAnimator } from './HumanoidAnimator';
import { solveTwoBoneIK } from './IK';
import type { PlayerController } from './PlayerController';
import { createWeaponModel, type WeaponModel } from '../items/WeaponModels';
import { ATTACKS, ARM_REACH, SHOULDER_R, SPIN_PIVOT, swingDirLocal } from '../combat/Attacks';
import { SlashTrail } from '../vfx/Trail';
import { Spring, clamp01, damp, easeOutBack, yawToDir } from '../core/math';
import type { ItemId } from '../items/Items';

const REST_WEAPON = new THREE.Quaternion().setFromEuler(new THREE.Euler(1.9, 0, 0));
const REST_SHIELD = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI / 2, 0));
const REST_BOW = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2 + 0.3, 0, Math.PI / 2));
const BACK_SHIELD = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI, 0));

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

    this.animator.update(dt, p.anim);
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
        swingDirLocal(def, angle, this.dir, this.edge);
        const pivot = def.pivot === 'center' ? SPIN_PIVOT : SHOULDER_R;
        const reach = def.pivot === 'center' ? 0.7 : ARM_REACH;
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
      } else {
        // segue a mão (pose de descanso)
        rig.sockets.handR.getWorldPosition(model.root.position);
        rig.sockets.handR.getWorldQuaternion(this.q);
        model.root.quaternion.copy(this.q).multiply(REST_WEAPON);
        if (this.weaponSpring.value !== 0) model.root.rotateX(-this.weaponSpring.value * 0.1);
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
        const grip = p.bowOrigin(this.hand);
        grip.y += p.motor.visualStepOffset;
        const up = this.v2.set(0, 1, 0).addScaledVector(aimDir, -aimDir.y).normalize();
        // leve inclinação do arco
        up.applyAxisAngle(aimDir, -0.25);
        const x = new THREE.Vector3().crossVectors(up, aimDir);
        this.q.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, up, aimDir));
        model.root.position.copy(grip);
        model.root.quaternion.copy(this.q);
        rig.joints.upperArmL.getWorldPosition(this.pole);
        this.pole.y -= 0.6;
        solveTwoBoneIK(rig.joints.upperArmL, rig.joints.forearmL, ARM_UPPER, ARM_FORE, grip, this.pole, 1);
        const stringPos = this.v2.copy(grip).addScaledVector(aimDir, -0.1 - p.bowDraw * 0.55);
        rig.joints.upperArmR.getWorldPosition(this.pole);
        this.pole.addScaledVector(yawToDir(p.aim.yaw, new THREE.Vector3()), -0.6).y += 0.1;
        solveTwoBoneIK(rig.joints.upperArmR, rig.joints.forearmR, ARM_UPPER, ARM_FORE, stringPos, this.pole, 1);
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
      if (main === 'bow') {
        rig.sockets.back.getWorldPosition(sh.root.position);
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
          const guardPos = this.v2.set(0.1, 1.28, 0.44 - this.shieldSpring.value * 0.05).applyQuaternion(this.yawQ).add(p.position);
          guardPos.y += p.motor.visualStepOffset;
          this.q2.setFromEuler(new THREE.Euler(-0.12 - this.shieldSpring.value * 0.08, yaw, 0.1, 'YXZ'));
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
