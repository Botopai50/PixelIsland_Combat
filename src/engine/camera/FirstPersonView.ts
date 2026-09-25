import * as THREE from 'three';
import type { GameContext } from '../core/Context';
import type { PlayerController } from '../character/PlayerController';
import { createWeaponModel, type WeaponModel } from '../items/WeaponModels';
import { ATTACKS, ARM_REACH, SHOULDER_R, SPIN_PIVOT, swingDirLocal } from '../combat/Attacks';
import { SlashTrail } from '../vfx/Trail';
import { Spring, Spring3, clamp01, damp, easeOutBack, lerp } from '../core/math';
import { weaponBasis } from '../character/PlayerView';
import type { ItemId } from '../items/Items';
import { HERO_STYLE } from '../character/HumanoidRig';

/** Altura/offset do olho em relação aos pés (espaço do personagem). */
const Z_AXIS = new THREE.Vector3(0, 0, 1);

export const EYE = new THREE.Vector3(0, 1.62, 0.1);

/**
 * Viewmodel da 1ª pessoa: braços e equipamento desenhados numa cena própria
 * (sem atravessar paredes). Os golpes usam a MESMA trajetória lógica da 3ª
 * pessoa, convertida para o espaço da câmera — o que se vê é o que acerta.
 */
export class FirstPersonView {
  readonly scene = new THREE.Scene();
  readonly root = new THREE.Group();
  readonly trail = new SlashTrail(22);
  private models = new Map<ItemId, WeaponModel>();
  private shield: WeaponModel;
  private armR: THREE.Group;
  private armL: THREE.Group;
  private sway = new Spring3(90, 11);
  private kick = new Spring(260, 15);
  private shieldKick = new Spring(240, 15);
  private bobPhase = 0;
  private attackW = 0;
  private equipScale = 1;
  private lastMain: ItemId | null = null;
  private lastYaw = 0;
  private lastPitch = 0;
  private glow = 0;
  private landDip = new Spring(160, 12);
  private q = new THREE.Quaternion();
  private qInv = new THREE.Quaternion();
  private qYaw = new THREE.Quaternion();
  private v = new THREE.Vector3();
  private v2 = new THREE.Vector3();
  private dir = new THREE.Vector3();
  private edge = new THREE.Vector3();
  private hand = new THREE.Vector3();
  private restPos = new THREE.Vector3();
  private restQ = new THREE.Quaternion();
  visible = false;

  constructor(private ctx: GameContext, private player: PlayerController) {
    this.scene.add(this.root);
    this.root.matrixAutoUpdate = false;
    const hemi = new THREE.HemisphereLight(0xdfefff, 0x5a6a3a, 1.4);
    const sun = new THREE.DirectionalLight(0xfff2d8, 2.2);
    sun.position.set(-3, 6, 2);
    this.scene.add(hemi, sun);
    for (const id of ['sword', 'axe', 'pickaxe', 'bow'] as ItemId[]) {
      const m = createWeaponModel(id);
      m.root.visible = false;
      this.root.add(m.root);
      this.models.set(id, m);
    }
    this.shield = createWeaponModel('shield');
    this.root.add(this.shield.root);
    this.armR = this.makeArm();
    this.armL = this.makeArm();
    this.root.add(this.armR, this.armL, this.trail.mesh);
    this.scene.traverse((o) => ((o as THREE.Mesh).castShadow = false));
    ctx.events.on('land', (e) => {
      if (e.player) this.landDip.impulse(-1.5 - e.intensity * 4);
    });
  }

  private makeArm(): THREE.Group {
    const g = new THREE.Group();
    const sleeve = new THREE.MeshStandardMaterial({ color: HERO_STYLE.tunic, roughness: 0.8, flatShading: true });
    const skin = new THREE.MeshStandardMaterial({ color: HERO_STYLE.skin, roughness: 0.7, flatShading: true });
    const bracer = new THREE.MeshStandardMaterial({ color: HERO_STYLE.boots, roughness: 0.9, flatShading: true });
    // antebraço ao longo de -Z (do cotovelo em direção à mão na origem)
    const fore = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.3, 3, 8), skin);
    fore.rotation.x = Math.PI / 2;
    fore.position.z = 0.19;
    const br = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.05, 0.1, 8), bracer);
    br.rotation.x = Math.PI / 2;
    br.position.z = 0.09;
    const sl = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.058, 0.14, 8), sleeve);
    sl.rotation.x = Math.PI / 2;
    sl.position.z = 0.36;
    const hand = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.075, 0.1), skin);
    hand.position.z = -0.02;
    g.add(fore, br, sl, hand);
    return g;
  }

  /** Posiciona o antebraço: mão em `hand`, cotovelo deslocado para trás/baixo. */
  private placeArm(arm: THREE.Group, hand: THREE.Vector3, side: 1 | -1) {
    const elbow = this.v2.set(hand.x + 0.12 * side, hand.y - 0.2, hand.z + 0.3);
    arm.position.copy(hand);
    // lookAt usa coordenadas de mundo; aqui estamos no espaço da câmera
    arm.quaternion.setFromUnitVectors(Z_AXIS, elbow.sub(hand).normalize());
    arm.visible = true;
  }

  update(dt: number, camera: THREE.PerspectiveCamera) {
    const p = this.player;
    const T = this.ctx.tuning;
    this.root.matrix.copy(camera.matrixWorld);
    this.root.matrixWorldNeedsUpdate = true;
    this.root.visible = this.visible;
    if (!this.visible) {
      this.trail.clear();
      this.trail.update(dt, false);
      return;
    }

    // ------------------------------------------------ balanço (sway) pela rotação da câmera
    const dyaw = p.aim.yaw - this.lastYaw;
    const dpitch = p.aim.pitch - this.lastPitch;
    this.lastYaw = p.aim.yaw;
    this.lastPitch = p.aim.pitch;
    if (T.weaponSway && dt > 0) {
      const k = 0.9 * T.weaponSwayAmount;
      this.sway.velocity.x += Math.max(-4, Math.min(4, dyaw)) * k * 3;
      this.sway.velocity.y += Math.max(-4, Math.min(4, -dpitch)) * k * 3;
    }
    this.sway.update(Math.max(dt, 1 / 240));
    this.sway.value.clampScalar(-0.08, 0.08);
    const speed = Math.hypot(p.motor.velocity.x, p.motor.velocity.z);
    if (p.motor.grounded) this.bobPhase += (speed * dt) / 1.9;
    const bobK = T.weaponSway ? T.weaponSwayAmount * clamp01(speed / 6) : 0;
    const bx = Math.sin(this.bobPhase * Math.PI * 2) * 0.018 * bobK;
    const by = -Math.abs(Math.cos(this.bobPhase * Math.PI * 2)) * 0.02 * bobK;
    this.landDip.update(Math.max(dt, 1 / 240));

    if (p.recoilImpulse > 0) this.kick.impulse(p.recoilImpulse * 8);
    if (p.shieldImpulse > 0) this.shieldKick.impulse(p.shieldImpulse * 8);
    this.kick.update(Math.max(dt, 1 / 240));
    this.shieldKick.update(Math.max(dt, 1 / 240));

    const sprint = p.sprinting ? 1 : 0;
    const offset = this.v.set(
      bx - this.sway.value.x,
      by - this.sway.value.y + this.landDip.value * 0.02 - sprint * 0.04,
      0,
    );

    // equip: abaixa e levanta
    const main = p.mainHand;
    if (main !== this.lastMain) {
      this.equipScale = 0;
      this.lastMain = main;
    }
    this.equipScale = damp(this.equipScale, 1, 12, dt);
    let lower = (1 - easeOutBack(this.equipScale)) * 0.35;
    if (p.state === 'equip' && p.stateT < 0.14) lower = (p.stateT / 0.14) * 0.35;
    if (p.state === 'hurt') lower += Math.sin(clamp01(p.stateT / 0.4) * Math.PI) * 0.06;
    offset.y -= lower;

    for (const [id, m] of this.models) m.root.visible = id === main;
    const model = main ? this.models.get(main) : undefined;

    // ------------------------------------------------ conversão personagem → câmera
    // câmera = R_y(yaw+π)·R_x(pitch); personagem = R_y(yaw) ⇒ local = qInv·R_y(yaw)·v
    camera.getWorldQuaternion(this.qInv).invert();
    this.qYaw.setFromAxisAngle(new THREE.Vector3(0, 1, 0), p.facing);
    const toCam = this.q.copy(this.qInv).multiply(this.qYaw);

    // ------------------------------------------------ arma principal
    this.armR.visible = false;
    this.armL.visible = false;
    const def = p.state === 'attack' && p.attack ? p.attack.def : p.state === 'charge' && p.weapon?.charged ? ATTACKS[p.weapon.charged] : null;
    const wantAttackW = def ? 1 : 0;
    this.attackW = def ? 1 : damp(this.attackW, 0, 14, dt);
    if (model && main !== 'bow') {
      model.root.scale.set(1, T.rangeMul, 1);
      // pose de descanso (espaço da câmera)
      this.restPos.set(0.27, -0.3, -0.42).add(offset);
      const restDir = this.dir.set(-0.12, 0.75, -0.6).normalize();
      const restEdge = this.edge.set(-0.9, 0.1, -0.2).normalize();
      weaponBasis(restDir, restEdge, this.restQ);
      if (sprint) this.restQ.premultiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.5, 0.3, 0)));
      if (def || this.attackW > 0.01) {
        const d = def ?? p.attack?.def ?? ATTACKS.sword1;
        let angle = p.swingAngle;
        if (p.state === 'charge') {
          const sgn = Math.sign(d.arc[1] - d.arc[0]) || 1;
          angle = d.arc[0] - sgn * 22 + Math.sin(p.time * 40) * 2 * clamp01(p.chargeT / T.chargeTime);
        }
        swingDirLocal(d, angle, this.dir, this.edge);
        const pivot = d.pivot === 'center' ? SPIN_PIVOT : SHOULDER_R;
        const reach = d.pivot === 'center' ? 0.7 : ARM_REACH;
        this.hand.copy(pivot).addScaledVector(this.dir, reach).sub(EYE).applyQuaternion(toCam);
        this.dir.applyQuaternion(toCam);
        this.edge.applyQuaternion(toCam);
        const q = weaponBasis(this.dir, this.edge, new THREE.Quaternion());
        if (this.kick.value) {
          const axis = this.v2.crossVectors(this.dir, this.edge).normalize();
          q.premultiply(new THREE.Quaternion().setFromAxisAngle(axis, -this.kick.value * 0.12));
        }
        // na preparação o braço lógico fica fora do campo de visão (atrás/ao lado):
        // mistura parcial com a pose de descanso para a antecipação ser visível.
        let w = wantAttackW ? 1 : this.attackW;
        if (p.state === 'charge') w = 0.6;
        else if (p.attack && p.swingPhase === 'windup') w = 0.5 + 0.5 * clamp01(p.stateT / Math.max(1e-3, p.attack.timing.windup));
        model.root.position.copy(this.restPos).lerp(this.hand, w);
        model.root.quaternion.copy(this.restQ).slerp(q, w);
      } else {
        model.root.position.copy(this.restPos);
        model.root.position.z += this.kick.value * 0.03;
        model.root.quaternion.copy(this.restQ);
        model.root.rotateX(-this.kick.value * 0.1);
      }
      this.placeArm(this.armR, model.root.position, 1);
      const charge = p.state === 'charge' ? clamp01(p.chargeT / T.chargeTime) : 0;
      this.glow = damp(this.glow, charge >= 1 ? 0.6 + Math.sin(p.time * 30) * 0.4 : charge * 0.35, 20, dt);
      model.setGlow(this.glow);
    }

    // ------------------------------------------------ arco
    if (main === 'bow' && model) {
      const drawing = p.state === 'bow';
      const draw = drawing ? p.bowDraw : 0;
      const nocked = drawing && p.inventory.count('arrow') > 0;
      model.setDraw?.(draw, nocked);
      model.root.scale.setScalar(1);
      const aimW = drawing || p.state === 'bowRecover' ? 1 : 0;
      const grip = this.hand.set(lerp(-0.2, -0.06, aimW), lerp(-0.3, -0.12, aimW), lerp(-0.45, -0.55, aimW)).add(offset);
      grip.z += this.kick.value * 0.03;
      model.root.position.copy(grip);
      model.root.quaternion.setFromEuler(new THREE.Euler(0, Math.PI, lerp(0.5, 0.2, aimW)));
      this.placeArm(this.armL, grip, -1);
      // mão direita na corda
      const stringPos = this.v2.set(0, 0, -0.1 - draw * 0.55).applyQuaternion(model.root.quaternion).add(grip);
      if (drawing) this.placeArm(this.armR, stringPos.clone(), 1);
    }

    // ------------------------------------------------ escudo
    const sh = this.shield;
    sh.root.visible = p.offHand === 'shield' && main !== 'bow';
    if (sh.root.visible) {
      const g = p.guardAmount;
      const pos = this.v2.set(lerp(-0.36, -0.13, g), lerp(-0.42, -0.2, g), lerp(-0.4, -0.46, g)).add(offset);
      pos.z += this.shieldKick.value * 0.05;
      pos.y -= lower * 0.5;
      sh.root.position.copy(pos);
      sh.root.quaternion.setFromEuler(new THREE.Euler(lerp(0.1, -0.08, g) - this.shieldKick.value * 0.1, Math.PI + lerp(-1.1, -0.15, g), lerp(0.2, 0.05, g)));
      sh.setGlow(p.state === 'guardHit' ? 0.3 : 0);
      if (!this.armL.visible) this.placeArm(this.armL, this.hand.copy(pos).add(new THREE.Vector3(0.02, -0.03, 0.06)), -1);
    }

    // ------------------------------------------------ rastro (espaço da câmera)
    const a = p.attack;
    if (model && a && p.state === 'attack' && main !== 'bow' && (p.swingPhase === 'active' || (p.swingPhase === 'recovery' && p.stateT - a.timing.windup - a.timing.active < 0.04))) {
      const base = this.v.set(0, a.weapon.bladeStart * T.rangeMul, 0).applyQuaternion(model.root.quaternion).add(model.root.position);
      const tip = this.v2.set(0, a.weapon.bladeEnd * T.rangeMul, 0).applyQuaternion(model.root.quaternion).add(model.root.position);
      this.trail.color.set(a.charged ? 0x9fe8ff : a.weapon.trailColor);
      this.trail.push(base, tip);
    }
    this.trail.update(dt, T.trailsEnabled, a ? 0.5 + a.def.strength * 0.5 : 1);
  }
}
