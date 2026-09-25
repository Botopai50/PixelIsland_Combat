import * as THREE from 'three';
import type { GameContext } from '../core/Context';
import type { PlayerController } from '../character/PlayerController';
import { createWeaponModel, createShieldBacking, BOW_DRAW_LEN, type WeaponModel } from '../items/WeaponModels';
import { ATTACKS, TWO_HAND_GRIP } from '../combat/Attacks';
import { viewmodelStyle, viewmodelSwingPose } from './ViewmodelSwings';
import { SlashTrail } from '../vfx/Trail';
import { Spring, Spring3, clamp, clamp01, damp, easeOutBack, lerp } from '../core/math';
import { weaponBasis } from '../character/PlayerView';
import type { ItemId } from '../items/Items';
import { HERO_STYLE } from '../character/HumanoidRig';

/** Altura/offset do olho em relação aos pés (espaço do personagem). */
const Z_AXIS = new THREE.Vector3(0, 0, 1);

export const EYE = new THREE.Vector3(0, 1.62, 0.1);

/**
 * Viewmodel da 1ª pessoa: braços e equipamento desenhados numa cena própria
 * (sem atravessar paredes). Os golpes usam poses desenhadas para leitura na
 * câmera (ViewmodelSwings), sincronizadas com as fases lógicas do golpe: a
 * lâmina cruza o centro da tela durante a janela de dano.
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
  /** Escudo recolhe para baixo durante o golpe: o arco da lâmina fica legível. */
  private shieldTuck = 0;
  private guardS = new Spring(300, 21);
  private wasGuarding = false;
  /** Tela estreita (celular em pé): armas menores e mais perto do centro. */
  private vmScale = 1;
  private equipScale = 1;
  private lastMain: ItemId | null = null;
  private lastYaw = 0;
  private lastPitch = 0;
  private glow = 0;
  private landDip = new Spring(160, 12);
  private q2 = new THREE.Quaternion();
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
    this.shield.root.add(createShieldBacking());
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
  private placeArm(arm: THREE.Group, hand: THREE.Vector3, side: 1 | -1, elbowAt?: THREE.Vector3) {
    const elbow = elbowAt ? this.v2.copy(elbowAt) : this.v2.set(hand.x + 0.12 * side, hand.y - 0.2, hand.z + 0.3);
    arm.position.copy(hand);
    // lookAt usa coordenadas de mundo; aqui estamos no espaço da câmera
    arm.quaternion.setFromUnitVectors(Z_AXIS, elbow.sub(hand).normalize());
    arm.scale.setScalar(this.vmScale);
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
    const aspectK = clamp(camera.aspect / 1.78, 0.55, 1);
    this.vmScale = aspectK;
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

    // ------------------------------------------------ arma principal
    this.armR.visible = false;
    this.armL.visible = false;
    const def = p.state === 'attack' && p.attack ? p.attack.def : p.state === 'charge' && p.weapon?.charged ? ATTACKS[p.weapon.charged] : null;
    this.attackW = def ? 1 : damp(this.attackW, 0, 14, dt);
    if (model && main !== 'bow') {
      model.root.scale.set(aspectK, T.rangeMul * aspectK, aspectK);
      // pose de descanso (espaço da câmera)
      this.restPos.set(0.27, -0.3, -0.42).add(offset);
      const restDir = this.dir.set(-0.12, 0.75, -0.6).normalize();
      const restEdge = this.edge.set(-0.9, 0.1, -0.2).normalize();
      weaponBasis(restDir, restEdge, this.restQ);
      if (sprint) this.restQ.premultiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.5, 0.3, 0)));
      if (def || this.attackW > 0.01) {
        // golpes desenhados para a câmera (clareza), no mesmo tempo da lógica
        const d = def ?? p.attack?.def ?? ATTACKS.sword1;
        const style = viewmodelStyle(d.id);
        let phase: 'windup' | 'active' | 'recovery' | 'done' | 'charge' = p.swingPhase;
        let u = p.swingU;
        if (p.state === 'charge') phase = 'charge';
        else if (!def) { phase = 'recovery'; u = 1; }
        viewmodelSwingPose(style, phase, u, this.restPos, this.restQ, this.hand, this.q2);
        if (p.state === 'charge') {
          // tremor crescente segurando a carga
          const c = clamp01(p.chargeT / T.chargeTime);
          this.hand.x += Math.sin(p.time * 47) * 0.004 * c;
          this.hand.y += Math.sin(p.time * 53) * 0.004 * c;
        }
        if (this.kick.value) {
          // recuo no impacto: a arma volta um pouco contra o sentido do golpe
          this.hand.z += this.kick.value * 0.025;
          this.q2.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -this.kick.value * 0.08));
        }
        this.hand.add(offset);
        const w = def ? 1 : this.attackW;
        model.root.position.copy(this.restPos).lerp(this.hand, w);
        model.root.quaternion.copy(this.restQ).slerp(this.q2, w);
      } else {
        model.root.position.copy(this.restPos);
        model.root.position.z += this.kick.value * 0.03;
        model.root.quaternion.copy(this.restQ);
        model.root.rotateX(-this.kick.value * 0.1);
        const g = p.guardAmount;
        if (main === 'sword' && g > 0.01) {
          // defendendo: espada abaixada ao lado, fora do caminho do escudo
          const gp = this.v2.set(0.36, -0.4, -0.42).add(offset);
          const gq = weaponBasis(this.dir.set(0.35, 0.45, -0.82).normalize(), this.edge.set(-0.6, 0.3, -0.3).normalize(), new THREE.Quaternion());
          model.root.position.lerp(gp, g);
          model.root.quaternion.slerp(gq, g);
        }
        if ((main === 'axe' || main === 'pickaxe') && g > 0.01) {
          // defesa com ferramenta: cabo atravessado na frente da câmera
          const gp = this.v2.set(0.24, -0.2, -0.42).add(offset);
          gp.z += this.shieldKick.value * 0.04;
          const gq = weaponBasis(this.dir.set(-1, 0.28, -0.1).normalize(), this.edge.set(0, 1, 0.2).normalize(), new THREE.Quaternion());
          model.root.position.lerp(gp, g);
          model.root.quaternion.slerp(gq, g);
        }
      }
      // tela estreita (celular em pé): aproxima tudo do centro horizontalmente
      model.root.position.x *= aspectK;
      this.placeArm(this.armR, model.root.position, 1);
      const work = (def ?? (this.attackW > 0.01 ? p.attack?.def : null))?.work;
      if (work || main === 'axe' || main === 'pickaxe') {
        // pegada de duas mãos no cabo
        const g = this.v2.set(0, TWO_HAND_GRIP * aspectK, 0).applyQuaternion(model.root.quaternion).add(model.root.position);
        this.placeArm(this.armL, g.clone(), -1);
      }
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
      const stringPos = this.v2.set(0, 0, -0.1 - draw * BOW_DRAW_LEN).applyQuaternion(model.root.quaternion).add(grip);
      if (drawing) this.placeArm(this.armR, stringPos.clone(), 1);
    }

    // ------------------------------------------------ escudo
    const sh = this.shield;
    const toolMain = main === 'axe' || main === 'pickaxe';
    sh.root.visible = p.offHand === 'shield' && main !== 'bow' && !toolMain;
    if (sh.root.visible) {
      // levantar/abaixar com mola (sobe rápido e "assenta" com leve passagem)
      const guardOn = p.guarding || p.state === 'guardHit';
      if (guardOn && !this.wasGuarding) this.guardS.impulse(4);
      this.wasGuarding = guardOn;
      this.guardS.target = guardOn ? 1 : 0;
      this.guardS.update(Math.max(dt, 1 / 240));
      const g = clamp(this.guardS.value, -0.1, 1.15);
      const tuckTo = p.state === 'attack' ? 1 : 0;
      this.shieldTuck += (tuckTo - this.shieldTuck) * (1 - Math.exp(-dt * (tuckTo ? 18 : 7)));
      const tk = this.shieldTuck * (1 - clamp01(g));
      // descanso: canto inferior esquerdo, DE FRENTE (vê-se a borda e o lado de
      // dentro) | defesa: à frente, levemente à esquerda, borda de cima logo
      // abaixo da mira — dá para ver o inimigo por cima do escudo
      const arc = Math.sin(clamp01(g) * Math.PI);
      // altura pela metade do escudo em tela: a borda de cima fica sempre no mesmo lugar
      // escudo GRANDE (encolhe pouco em tela estreita) e mais baixo: parece do
      // tamanho real sem tapar a mira
      const shScale = 1.05 * lerp(1, aspectK, 0.4);
      const half = 0.36 * shScale;
      const pos = this.v2.set(lerp(-0.42, -0.15, g), lerp(-0.2 - half, -0.07 - half, g) + arc * 0.03, lerp(-0.56, -0.54, g) - arc * 0.05).add(offset);
      pos.y += Math.sin(p.time * 2.1) * 0.004 * clamp01(g);
      pos.z += this.shieldKick.value * 0.06;
      pos.y -= lower * 0.5 + tk * 0.22 - this.shieldKick.value * 0.015;
      pos.x -= tk * 0.08;
      pos.x *= aspectK;
      sh.root.position.copy(pos);
      sh.root.scale.setScalar(shScale);
      sh.root.quaternion.setFromEuler(new THREE.Euler(
        lerp(-0.3, -0.1, g) - this.shieldKick.value * 0.14,
        Math.PI + lerp(-0.5, -0.1, g),
        lerp(0.16, 0.03, g) + this.shieldKick.value * 0.03,
      ));
      sh.setGlow(p.state === 'guardHit' ? 0.3 : 0);
      if (!this.armL.visible) {
        // mão na alça (centro), antebraço vem de baixo passando pelas tiras
        sh.root.updateMatrix();
        const grip = this.hand.set(0, -0.02, -0.05).applyMatrix4(sh.root.matrix);
        const elbow = this.dir.set(0.08, -0.45, -0.16).applyMatrix4(sh.root.matrix);
        this.placeArm(this.armL, grip, -1, elbow);
      }
    }

    // ------------------------------------------------ rastro (espaço da câmera)
    const a = p.attack;
    if (model && a && p.state === 'attack' && main !== 'bow' && (p.swingPhase === 'active' || (p.swingPhase === 'recovery' && p.stateT - a.timing.windup - a.timing.active < Math.max(0.04, (viewmodelStyle(a.def.id).follow ?? 0) * a.timing.recovery * 0.8)))) {
      const base = this.v.set(0, a.weapon.bladeStart * T.rangeMul * this.vmScale, 0).applyQuaternion(model.root.quaternion).add(model.root.position);
      const tip = this.v2.set(0, a.weapon.bladeEnd * T.rangeMul * this.vmScale, 0).applyQuaternion(model.root.quaternion).add(model.root.position);
      this.trail.color.set(a.charged ? 0x9fe8ff : a.weapon.trailColor);
      this.trail.push(base, tip);
    }
    this.trail.update(dt, T.trailsEnabled, a ? 0.5 + a.def.strength * 0.5 : 1);
  }
}
