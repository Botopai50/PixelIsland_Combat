import * as THREE from 'three';
import type { GameContext } from '../core/Context';
import type { AimSource, PlayerController } from '../character/PlayerController';
import { clamp, clamp01, damp, dampAngle, dirToYaw, lerp, easeInOutSine, Spring } from '../core/math';
import { EYE } from './FirstPersonView';

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
  private tmp2 = new THREE.Vector3();
  private dir = new THREE.Vector3();
  private raycaster = new THREE.Raycaster();
  player!: PlayerController;
  /** Alvos adicionais para o raycast da mira (inimigos, etc.). */
  aimTargets: () => THREE.Object3D[] = () => [];

  constructor(private ctx: GameContext) {
    this.camera = new THREE.PerspectiveCamera(ctx.tuning.fov, 1, 0.05, 400);
    this.camera.rotation.order = 'YXZ';
    ctx.events.on('land', (e) => {
      if (e.player && this.ctx.tuning.camBob) this.landDip.impulse(-0.6 - e.intensity * 3);
    });
  }

  get firstPerson() {
    return this.mode === 'first';
  }

  toggleView() {
    this.mode = this.mode === 'first' ? 'third' : 'first';
  }
  toggleShoulder() {
    this.shoulderSide *= -1;
  }
  recenter() {
    this.recenterT = 0.25;
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
    this.yaw -= inp.lookX * sens * aimSlow;
    this.pitch -= inp.lookY * sens * aimSlow * (T.invertY ? -1 : 1);
    const maxPitch = this.blend > 0.5 ? 1.45 : 1.05;
    this.pitch = clamp(this.pitch, -1.3, maxPitch);

    if (inp.consume('view')) this.toggleView();
    if (inp.consume('shoulder')) this.toggleShoulder();

    // lock-on: gira a câmera para enquadrar o alvo
    if (p.lockTarget && T.lockOnAssist) {
      p.lockTarget.center(this.tmp).sub(p.position);
      const targetYaw = dirToYaw(this.tmp.x, this.tmp.z);
      this.yaw = dampAngle(this.yaw, targetYaw, this.blend > 0.5 ? 10 : 5, realDt);
      const dist = Math.hypot(this.tmp.x, this.tmp.z);
      const wantPitch = Math.atan2(this.tmp.y - 0.6, dist) - (this.blend > 0.5 ? 0 : 0.18);
      this.pitch = damp(this.pitch, wantPitch, 4, realDt);
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
    this.shoulderBlend = damp(this.shoulderBlend, this.shoulderSide, 8, realDt);
    const aiming = p.state === 'bow' ? 1 : 0;
    this.aimBlend = damp(this.aimBlend, aiming, 9, realDt);

    // ------------------------------------------------ 3ª pessoa
    const cp = Math.cos(this.pitch), sp = Math.sin(this.pitch);
    this.dir.set(Math.sin(this.yaw) * cp, sp, Math.cos(this.yaw) * cp);
    const right = this.tmp.set(-Math.cos(this.yaw), 0, Math.sin(this.yaw));
    const vis = p.motor.visualStepOffset;
    this.pivot.copy(p.position);
    this.pivot.y += T.camHeight + vis + this.landDip.value * 0.03;
    const shoulder = T.camShoulder * lerp(1, 1.25, this.aimBlend) * this.shoulderBlend;
    const wantDist = lerp(T.camDistance, 1.9, this.aimBlend) * (p.lockTarget ? 1.08 : 1);
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
    const thirdPos = new THREE.Vector3().copy(shoulderPos).addScaledVector(back, this.dist);
    const g = this.ctx.physics.groundHeight(thirdPos.x, thirdPos.z, thirdPos.y, 0, 0);
    if (Number.isFinite(g.y)) thirdPos.y = Math.max(thirdPos.y, g.y + 0.2);

    // ------------------------------------------------ 1ª pessoa
    const speed = Math.hypot(p.motor.velocity.x, p.motor.velocity.z);
    if (p.motor.grounded) this.bobPhase += (speed * playerDt) / 1.9;
    const bobAmt = T.camBob ? T.camBobAmount * clamp01(speed / 6) : 0;
    const eye = new THREE.Vector3(0, EYE.y, EYE.z).applyAxisAngle(new THREE.Vector3(0, 1, 0), p.facing).add(p.position);
    eye.y += vis + Math.abs(Math.sin(this.bobPhase * Math.PI * 2)) * 0.045 * bobAmt + this.landDip.value * 0.05;
    eye.addScaledVector(right, Math.sin(this.bobPhase * Math.PI * 2) * 0.02 * bobAmt);
    if (p.state === 'dodge') eye.y -= Math.sin(clamp01(p.stateT / 0.35) * Math.PI) * (p.dodgeType === 'flip' ? 0.25 : 0.12);
    if (p.state === 'dead') eye.y -= clamp01(p.stateT) * 1.2;

    this.landDip.update(Math.max(realDt, 1 / 240));
    const cam = this.camera;
    cam.position.copy(thirdPos).lerp(eye, b);

    // ------------------------------------------------ FOV
    let kick = 0;
    if (T.fovKick) {
      if (p.sprinting) kick += 6;
      if (p.state === 'dodge') kick += 4;
      if (p.state === 'attack' && p.attack?.def.spin) kick += 4;
    }
    this.fovKick = damp(this.fovKick, kick, 6, realDt);
    cam.fov = T.fov + this.fovKick - this.aimBlend * (b > 0.5 ? 18 : 12) * (0.5 + 0.5 * p.bowDraw);
    cam.updateProjectionMatrix();

    // ------------------------------------------------ orientação + tremor
    const sh = this.ctx.shake;
    const roll = b > 0.5 && p.state === 'dodge' && (p.dodgeType === 'hopL' || p.dodgeType === 'hopR')
      ? Math.sin(clamp01(p.stateT / 0.3) * Math.PI) * 0.08 * (p.dodgeType === 'hopL' ? 1 : -1) : 0;
    cam.rotation.set(this.pitch + sh.rot.x, this.yaw + Math.PI + sh.rot.y, sh.rot.z + roll, 'YXZ');
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
