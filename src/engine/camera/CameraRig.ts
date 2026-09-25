import * as THREE from 'three';
import type { GameContext } from '../core/Context';
import type { AimSource, PlayerController } from '../character/PlayerController';
import { clamp, clamp01, damp, dampAngle, dirToYaw, lerp, easeInOutSine, Spring } from '../core/math';
import { EYE } from './FirstPersonView';
import { viewmodelCamLean, viewmodelStyle } from './ViewmodelSwings';
import { ATTACKS } from '../combat/Attacks';
import { CameraJuice } from './CameraJuice';

/**
 * Câmera de 1ª e 3ª pessoa com transição suave (mesma mira, mesmo yaw/pitch),
 * braço de mola com colisão (não atravessa paredes), troca de ombro, zoom de
 * mira do arco, assistência de lock-on, balanço de cabeça e tremor.
 */
export class CameraRig implements AimSource {
  readonly camera: THREE.PerspectiveCamera;
  yaw = Math.PI;
  pitch = -0.12;
  mode: 'first' | 'third' = 'third';
  /** 0 = 3ª pessoa, 1 = 1ª pessoa. */
  blend = 0;
  shoulderSide = 1;
  private shoulderBlend = 1;
  private dist = 4;
  private aimBlend = 0;
  private fovKick = 0;
  private recenterT = 0;
  private bobPhase = 0;
  private landDip = new Spring(170, 13);
  private pivot = new THREE.Vector3();
  private tmp = new THREE.Vector3();
  private swingLean = new THREE.Vector3();
  private lockFlick = 0;
  private lockFlickCd = 0;
  private leanSm = new THREE.Vector3();
  private juice: CameraJuice;
  private runSway = 0;
  private keepAimT = 0;
  private keepAimPt = new THREE.Vector3();
  private tmp2 = new THREE.Vector3();
  private dir = new THREE.Vector3();
  private raycaster = new THREE.Raycaster();
  player!: PlayerController;
  /** Alvos adicionais para o raycast da mira (inimigos, etc.). */
  aimTargets: () => THREE.Object3D[] = () => [];

  constructor(private ctx: GameContext) {
    this.camera = new THREE.PerspectiveCamera(ctx.tuning.fov, 1, 0.05, 400);
    this.camera.rotation.order = 'YXZ';
    this.juice = new CameraJuice(ctx, () => this.player);
    ctx.events.on('land', (e) => {
      if (e.player && this.ctx.tuning.camBob) this.landDip.impulse(-0.6 - e.intensity * 3);
    });
  }

  get firstPerson() {
    return this.mode === 'first';
  }

  toggleView() {
    this.holdAim();
    this.mode = this.mode === 'first' ? 'third' : 'first';
  }
  toggleShoulder() {
    this.holdAim();
    this.shoulderSide *= -1;
  }
  /**
   * Ao trocar de câmera (1ª/3ª, ombro) a mira continua no MESMO ponto do mundo:
   * as câmeras ficam em lugares diferentes, então o mesmo yaw/pitch apontaria
   * para outro lugar (paralaxe). Durante a transição o ângulo é corrigido.
   */
  private holdAim() {
    const pt = this.aimPoint(this.keepAimPt);
    this.keepAimT = pt.distanceTo(this.camera.position) < 90 ? 0.45 : 0;
  }
  recenter() {
    this.recenterT = 0.25;
  }

  aimRay(origin: THREE.Vector3, dir: THREE.Vector3) {
    origin.copy(this.camera.position);
    this.camera.getWorldDirection(dir);
  }

  aimPoint(out: THREE.Vector3): THREE.Vector3 {
    const cam = this.camera;
    cam.getWorldDirection(this.dir);
    const origin = this.tmp2.copy(cam.position);
    let best = 150;
    const w = this.ctx.physics.raycast(origin, this.dir, best);
    if (w) best = w.distance;
    // alvos (hurtboxes) — testa o segmento da mira
    const end = this.tmp.copy(origin).addScaledVector(this.dir, best);
    const hits = this.ctx.combat.querySegment(origin, end, 0.05, 'player');
    if (hits.length) best = Math.min(best, hits[0].t * best);
    // ignora pontos muito próximos da câmera em 3ª pessoa (atrás do personagem)
    best = Math.max(best, this.blend > 0.5 ? 1 : this.dist + 1);
    return out.copy(origin).addScaledVector(this.dir, best);
  }

  update(realDt: number, playerDt: number) {
    const T = this.ctx.tuning;
    const inp = this.ctx.input;
    const p = this.player;

    // ------------------------------------------------ olhar
    const sens = 0.0022 * T.sensitivity;
    const aimSlow = p.state === 'bow' ? 0.6 : 1;
    const locked = !!p.lockTarget && p.state !== 'bow';
    if (locked) {
      // travado: a câmera é do alvo. Um movimento rápido para o lado troca de alvo
      // (antes o mouse brigava com a trava e a câmera ficava puxando/tremendo)
      this.lockFlick = this.lockFlick * Math.exp(-realDt * 6) + inp.lookX * sens;
      this.lockFlickCd -= realDt;
      if (Math.abs(this.lockFlick) > 0.12 && this.lockFlickCd <= 0) {
        p.switchLock(this.lockFlick > 0 ? 1 : -1);
        this.lockFlick = 0;
        this.lockFlickCd = 0.35;
      }
    } else {
      this.lockFlick = 0;
      this.yaw -= inp.lookX * sens * aimSlow;
      this.pitch -= inp.lookY * sens * aimSlow * (T.invertY ? -1 : 1);
    }
    const maxPitch = this.blend > 0.5 ? 1.45 : 1.05;
    this.pitch = clamp(this.pitch, -1.3, maxPitch);

    if (inp.consume('view')) this.toggleView();
    if (inp.consume('shoulder')) this.toggleShoulder();

    // lock-on: gira a câmera para enquadrar o alvo
    if (locked && p.lockTarget) {
      p.lockTarget.center(this.tmp).sub(p.position);
      const dist = Math.hypot(this.tmp.x, this.tmp.z);
      // colado no alvo o ângulo gira sem controle: segura o yaw atual
      if (dist > 0.8) {
        const targetYaw = dirToYaw(this.tmp.x, this.tmp.z);
        this.yaw = dampAngle(this.yaw, targetYaw, this.blend > 0.5 ? 12 : 6, realDt);
      }
      // 1ª pessoa: mira no peito do alvo a partir da altura do OLHO (a mira central cai no alvo).
      // 3ª pessoa: enquadra de cima, com o alvo um pouco abaixo do centro.
      // mira exatamente no ponto da retícula, medido da posição real da câmera (olho)
      p.lockTarget.center(this.tmp2).sub(this.camera.position);
      const firstP = Math.atan2(this.tmp2.y, Math.max(1.0, Math.hypot(this.tmp2.x, this.tmp2.z)));
      const thirdP = Math.atan2(this.tmp.y - 0.6, Math.max(dist, 3.5)) - 0.18;
      const wantPitch = this.blend > 0.5 ? firstP : thirdP;
      this.pitch = damp(this.pitch, wantPitch, this.blend > 0.5 ? 10 : 4, realDt);
    }
    if (this.recenterT > 0) {
      this.recenterT -= realDt;
      this.yaw = dampAngle(this.yaw, p.facing, 18, realDt);
      this.pitch = damp(this.pitch, -0.12, 18, realDt);
    }

    // ------------------------------------------------ blends
    const target = this.mode === 'first' ? 1 : 0;
    this.blend = clamp01(this.blend + Math.sign(target - this.blend) * realDt / 0.22);
    if (Math.abs(target - this.blend) < 0.01) this.blend = target;
    const b = easeInOutSine(this.blend);
    this.juice.blend = b;
    this.juice.update(realDt);
    const J = this.juice;
    this.shoulderBlend = damp(this.shoulderBlend, this.shoulderSide, 8, realDt);
    const aiming = p.state === 'bow' ? 1 : 0;
    this.aimBlend = damp(this.aimBlend, aiming, 9, realDt);

    // balanço da corrida (as duas visões; amplitude escolhida mais abaixo)
    const spd0 = Math.hypot(p.motor.velocity.x, p.motor.velocity.z);
    this.runSway = damp(this.runSway, p.motor.grounded ? (p.sprinting ? 1 : clamp01(spd0 / 6) * 0.3) : 0, 6, realDt);
    if (b < 0.5 && p.motor.grounded) this.bobPhase += (spd0 * playerDt) / 1.9;

    // ------------------------------------------------ 3ª pessoa
    const cp = Math.cos(this.pitch), sp = Math.sin(this.pitch);
    this.dir.set(Math.sin(this.yaw) * cp, sp, Math.cos(this.yaw) * cp);
    const right = this.tmp.set(-Math.cos(this.yaw), 0, Math.sin(this.yaw));
    const vis = p.motor.visualStepOffset;
    this.pivot.copy(p.position);
    this.pivot.y += T.camHeight + vis + this.landDip.value * 0.03 + J.lift - p.sneakAmount * 0.5;
    // pisadas da corrida: o pivô sobe/desce um pouco (3ª pessoa)
    if (T.camBob) this.pivot.y += (Math.abs(Math.sin(this.bobPhase * Math.PI * 2)) - 0.64) * 0.05 * this.runSway * T.camBobAmount * (1 - b);
    const shoulder = lerp(T.camShoulder, Math.max(T.camShoulder, 0.55) * 1.45, this.aimBlend) * this.shoulderBlend;
    const wantDist = lerp(T.camDistance, 2.5, this.aimBlend) * (p.lockTarget ? 1.08 : 1);
    // colisão: primeiro para o lado (ombro), depois para trás
    const sideHit = this.ctx.physics.raycast(this.pivot, this.tmp2.copy(right).multiplyScalar(Math.sign(shoulder) || 1), Math.abs(shoulder) + 0.2, (c) => c.blocksCamera);
    const sideLen = sideHit ? Math.max(0, sideHit.distance - 0.2) * Math.sign(shoulder) : shoulder;
    const shoulderPos = this.tmp2.copy(this.pivot).addScaledVector(right, sideLen);
    let allowed = wantDist;
    const back = this.dir.clone().negate();
    // "sphere cast" aproximado com 5 raios
    const offs = [[0, 0], [0.18, 0], [-0.18, 0], [0, 0.15], [0, -0.15]];
    const up = new THREE.Vector3().crossVectors(right, back).normalize();
    for (const [ox, oy] of offs) {
      const o = new THREE.Vector3().copy(shoulderPos).addScaledVector(right, ox).addScaledVector(up, oy);
      const h = this.ctx.physics.raycast(o, back, wantDist + 0.3, (c) => c.blocksCamera);
      if (h) allowed = Math.min(allowed, Math.max(0.35, h.distance - 0.3));
    }
    // encolhe instantâneo, estica devagar (evita "estalos")
    this.dist = allowed < this.dist ? allowed : damp(this.dist, allowed, 4, realDt);
    const thirdPos = new THREE.Vector3().copy(shoulderPos).addScaledVector(back, clamp(this.dist + J.dolly, 0.35, Math.max(0.35, allowed)));
    const g = this.ctx.physics.groundHeight(thirdPos.x, thirdPos.z, thirdPos.y, 0, 0);
    if (Number.isFinite(g.y)) thirdPos.y = Math.max(thirdPos.y, g.y + 0.2);

    // ------------------------------------------------ 1ª pessoa
    const speed = Math.hypot(p.motor.velocity.x, p.motor.velocity.z);
    if (b >= 0.5 && p.motor.grounded) this.bobPhase += (speed * playerDt) / 1.9;
    const bobAmt = T.camBob ? T.camBobAmount * clamp01(speed / 6) : 0;
    const eye = new THREE.Vector3(0, EYE.y, EYE.z).applyAxisAngle(new THREE.Vector3(0, 1, 0), p.facing).add(p.position);
    eye.y -= p.sneakAmount * 0.6;
    eye.y += vis + Math.abs(Math.sin(this.bobPhase * Math.PI * 2)) * 0.018 * bobAmt + this.landDip.value * 0.05;
    eye.addScaledVector(right, Math.sin(this.bobPhase * Math.PI * 2) * 0.008 * bobAmt);
    // escalando: olho um pouco afastado da parede (vê as mãos e a parede subindo)
    if (p.state === 'climb' || p.state === 'mantle') eye.addScaledVector(p.climbN, 0.24);
    if (p.state === 'dodge') eye.y -= Math.sin(clamp01(p.stateT / 0.35) * Math.PI) * (p.dodgeType === 'flip' ? 0.25 : 0.12);
    if (p.state === 'dead') eye.y -= clamp01(p.stateT) * 1.2;

    this.landDip.update(Math.max(realDt, 1 / 240));
    const cam = this.camera;
    cam.position.copy(thirdPos).lerp(eye, b);
    if (this.keepAimT > 0) {
      // aponta a câmera (já na posição nova) para o ponto que estava na mira;
      // a posição depende do ângulo, então converge ao longo da transição
      this.keepAimT -= realDt;
      if (p.lockTarget || p.state === 'dead') this.keepAimT = 0;
      const d = this.tmp2.subVectors(this.keepAimPt, cam.position);
      if (d.lengthSq() > 0.25) {
        this.yaw = Math.atan2(d.x, d.z);
        this.pitch = clamp(Math.atan2(d.y, Math.hypot(d.x, d.z)), -1.3, this.blend > 0.5 ? 1.45 : 1.05);
      }
    }

    // ------------------------------------------------ FOV
    let kick = 0;
    if (T.fovKick) {
      if (p.sprinting) kick += 6;
      if (p.state === 'dodge') kick += 4;
      if (p.state === 'attack' && p.attack?.def.spin) kick += 4;
    }
    this.fovKick = damp(this.fovKick, kick, 6, realDt);
    cam.fov = T.fov + this.fovKick + J.fov - this.aimBlend * (b > 0.5 ? 18 : 12) * (0.5 + 0.5 * p.bowDraw);
    cam.updateProjectionMatrix();

    // ------------------------------------------------ orientação + tremor
    const sh = this.ctx.shake;
    const roll = b > 0.5 && p.state === 'dodge' && (p.dodgeType === 'hopL' || p.dodgeType === 'hopR')
      ? Math.sin(clamp01(p.stateT / 0.3) * Math.PI) * 0.08 * (p.dodgeType === 'hopL' ? 1 : -1) : 0;
    // 1ª pessoa: a cabeça acompanha o golpe (inclina/gira junto com a arma)
    const lean = this.swingLean.set(0, 0, 0);
    if (b > 0.5 && T.fpSwingLean > 0) {
      const d = p.state === 'attack' && p.attack ? p.attack.def : p.state === 'charge' && p.weapon?.charged ? ATTACKS[p.weapon.charged] : null;
      if (d && p.mainHand !== 'bow') viewmodelCamLean(viewmodelStyle(d.id), p.state === 'charge' ? 'charge' : p.swingPhase, p.swingU, lean);
      lean.multiplyScalar(T.fpSwingLean * b);
    }
    this.leanSm.lerp(lean, 1 - Math.exp(-realDt * 30));
    // 1ª pessoa correndo: a câmera balança (rola de um lado a outro a cada
    // passada e acena a cada pisada); andando, só um resto disso
    // 3ª pessoa correndo: balanço leve (rola + acena), menor que na 1ª
    const sw = this.runSway * (T.camBob ? T.camBobAmount : 0) * lerp(0.35, 1, b);
    const ph = this.bobPhase * Math.PI * 2;
    const swRoll = Math.sin(ph) * lerp(0.013, 0.007, b) * sw;
    const swPitch = (Math.abs(Math.cos(ph)) - 0.64) * lerp(0.014, 0.006, b) * sw;
    const swYaw = Math.sin(ph) * lerp(0.004, 0.002, b) * sw;
    // 1ª pessoa escalando: cabeça acompanha as braçadas (rola de leve para o lado da mão que puxa)
    const climbRoll = p.state === 'climb' ? Math.sin(p.climbPhase * Math.PI * 2) * p.climbMove * 0.035 * b : 0;
    // 1ª pessoa subindo a beirada: a cabeça olha para a borda/mãos e depois volta
    const mantlePitch = p.state === 'mantle' ? -0.5 * Math.sin(clamp01(p.anim.actionU / 0.85) * Math.PI) * b : 0;
    cam.rotation.set(this.pitch + sh.rot.x + this.leanSm.x + J.rot.x + swPitch + mantlePitch, this.yaw + Math.PI + sh.rot.y + this.leanSm.y + J.rot.y + swYaw, sh.rot.z + roll + this.leanSm.z + J.rot.z + swRoll + climbRoll, 'YXZ');
    cam.updateMatrixWorld();
    // deslocamento do tremor em espaço de câmera
    this.tmp.set(sh.offset.x, sh.offset.y, 0).applyQuaternion(cam.quaternion);
    cam.position.add(this.tmp);
    cam.updateMatrixWorld();
    this.raycaster.far = 0;
  }

  /** Distância atual da câmera até a cabeça (para esconder o corpo quando muito perto). */
  get headDistance() {
    return this.camera.position.distanceTo(this.pivot);
  }
}
