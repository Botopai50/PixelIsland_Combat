import { sampleAnimalCycle } from './AnimalAnimation';
import { registerAnimalSpritePack } from './AnimalSpriteCache';
import * as THREE from 'three';
import type { GameContext } from '../core/Context';
import type { HitInfo, HitResult } from '../combat/types';
import { emptyResult } from '../combat/types';
import type { EnemyTarget } from './Enemy';
import type { Boar27Pack } from './Boar';
import {
  ANIMAL_PPU,
  BasePixelAnimal,
  angleDiff,
  build27Pack,
  sdCapsule,
  sdEllipsoid,
  smin,
  type ColorShaper,
  type SdfEvaluator,
} from './Animals';
import { CharacterMotor } from '../physics/CharacterMotor';
import { damp, rand } from '../core/math';

function pickCycle<T>(frames: readonly T[], idx: number): T {
  return sampleAnimalCycle(frames, idx);
}

// ============================================================================
// 1. BESOURO ROLA-BOSTA (Flagship Dung Beetle) — 42×28
// ============================================================================
export type DungBeetlePoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'roll0' | 'roll1' | 'roll2' | 'roll3' | 'roll4' | 'roll5';

export const DUNG_BEETLE_PW = 42;
export const DUNG_BEETLE_PH = 28;
export const DUNG_BEETLE_W = DUNG_BEETLE_PW / ANIMAL_PPU;
export const DUNG_BEETLE_H = DUNG_BEETLE_PH / ANIMAL_PPU;

const DUNG_PAL: Record<string, [number, number, number]> = {
  k:  [0x09, 0x09, 0x0c], // crisp 1px dark outline / elytra seam / glossy eyes
  m0: [0x14, 0x13, 0x16], // deep obsidian scarab shadow
  m1: [0x24, 0x22, 0x28], // glossy black-gunmetal carapace
  m2: [0x3c, 0x38, 0x3e], // metallic charcoal-bronze midtone
  m3: [0x62, 0x5c, 0x62], // cool specular chitin sheen
  m4: [0xa4, 0xa2, 0xaa], // crisp sunlit glossy highlight
  d0: [0x2e, 0x1d, 0x10], // dark soil/dung crevice shadow
  d1: [0x4c, 0x31, 0x1b], // earthy brown dung ball midtone
  d2: [0x6c, 0x49, 0x29], // warm umber earth highlight
  d3: [0x96, 0x72, 0x42], // subtle dry straw flecks on dung ball
};

const DUNG_IDLE: readonly DungBeetlePoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const DUNG_ROLL: readonly DungBeetlePoseName[] = ['roll0', 'roll1', 'roll2', 'roll3', 'roll4', 'roll5'];

const dungCache = new Map<DungBeetlePoseName, Boar27Pack>();
 function buildDungBeetlePosePack(pose: DungBeetlePoseName): Boar27Pack {
  let pack = dungCache.get(pose);
  if (!pack) {
    const isRoll = pose.startsWith('roll');
    const idx = parseInt(pose.slice(-1), 10) || 0;
    const phase = isRoll ? (idx / 6) * Math.PI * 2 : idx * 0.5;
    const bob = isRoll ? Math.sin(phase * 2) * 0.018 : (idx === 1 ? 0.012 : idx === 2 ? -0.01 : 0);
    const pushLean = isRoll ? 0.08 : 0.0;

    // Ball center in front (+Z), cleanly separated from scarab body in silhouette
    const ballZ = 0.48;
    const ballY = -0.04 + Math.abs(Math.sin(phase)) * (isRoll ? 0.015 : 0);

    const evalFn: SdfEvaluator = (x, y, z) => {
      // 1. Large, round, richly textured earthy-brown dung ball
      const ball = sdEllipsoid(x, y, z, 0, ballY, ballZ, 0.30, 0.29, 0.30);

      // 2. Iridescent scarab beetle body (cleanly positioned behind the ball)
      const elytra = sdEllipsoid(x, y, z, 0, -0.02 + bob + pushLean * 0.4, -0.44, 0.24, 0.175, 0.27);
      const pronotum = sdEllipsoid(x, y, z, 0, -0.05 + bob, -0.17, 0.21, 0.145, 0.145);
      // Scalloped shovel-shaped scarab head (clypeus)
      const head = sdEllipsoid(x, y, z, 0, -0.10 + bob, -0.02, 0.135, 0.075, 0.105);
      const clypeus = sdEllipsoid(x, y, z, 0, -0.12 + bob, 0.06, 0.12, 0.036, 0.065);
      // Small clubbed scarab antennae
      const antL = sdCapsule(x, y, z, -0.09, -0.10 + bob, 0.02, -0.18, -0.07 + bob, 0.10, 0.014, 0.022);
      const antR = sdCapsule(x, y, z,  0.09, -0.10 + bob, 0.02,  0.18, -0.07 + bob, 0.10, 0.014, 0.022);

      let beetle = smin(smin(elytra, pronotum, 0.032), smin(head, clypeus, 0.02), 0.025);
      beetle = Math.min(beetle, Math.min(antL, antR));

      // 3. 6 clearly sculpted, well-separated jointed scarab legs
      let legs = 99;
      for (let side = -1; side <= 1; side += 2) {
        // Front forelegs: reaching forward to push/roll the dung ball!
        const fStep = Math.sin(phase + (side < 0 ? 0 : Math.PI)) * (isRoll ? 0.07 : 0.01);
        const fLift = Math.max(0, Math.cos(phase + (side < 0 ? 0 : Math.PI))) * (isRoll ? 0.08 : 0.0);
        const fKneeX = side * 0.28;
        const fKneeY = -0.08 + bob + fLift * 0.5;
        const fKneeZ = -0.04 + fStep * 0.5;
        const fFootX = side * (isRoll ? 0.22 : 0.34);
        const fFootY = isRoll ? (-0.06 + fLift) : -0.32;
        const fFootZ = isRoll ? (0.20 + fStep) : 0.02;
        const fUpper = sdCapsule(x, y, z, side * 0.16, -0.09 + bob, -0.12, fKneeX, fKneeY, fKneeZ, 0.028, 0.022);
        const fLower = sdCapsule(x, y, z, fKneeX, fKneeY, fKneeZ, fFootX, fFootY, fFootZ, 0.022, 0.016);
        legs = Math.min(legs, smin(fUpper, fLower, 0.015));

        // Mid & hind walking legs (well spaced, crisp joints)
        for (let i = 0; i < 2; i++) {
          const baseZ = i === 0 ? -0.32 : -0.54;
          const legPhase = phase + (i + 1) * 2.1 + (side < 0 ? 0 : Math.PI);
          const step = Math.sin(legPhase) * (isRoll ? 0.09 : 0.01);
          const lift = Math.max(0, Math.cos(legPhase)) * (isRoll ? 0.08 : 0.0);
          const kneeX = side * 0.36;
          const kneeY = -0.06 + bob + lift * 0.6;
          const kneeZ = baseZ + step * 0.45;
          const footX = side * 0.44;
          const footY = -0.33 + lift;
          const footZ = baseZ + step;
          const upper = sdCapsule(x, y, z, side * 0.19, -0.09 + bob, baseZ, kneeX, kneeY, kneeZ, 0.028, 0.022);
          const lower = sdCapsule(x, y, z, kneeX, kneeY, kneeZ, footX, footY, footZ, 0.022, 0.015);
          legs = Math.min(legs, smin(upper, lower, 0.015));
        }
      }
      beetle = smin(beetle, legs, 0.018);

      // 4. Glossy dark scarab eyes
      const eyeL = sdEllipsoid(x, y, z, -0.105, -0.08 + bob, 0.01, 0.024, 0.022, 0.024);
      const eyeR = sdEllipsoid(x, y, z,  0.105, -0.08 + bob, 0.01, 0.024, 0.022, 0.024);
      const eyes = Math.min(eyeL, eyeR);

      let d = beetle;
      let mat = 'beetle';
      if (ball < d) { d = ball; mat = 'ball'; }
      if (eyes < d) { d = eyes; mat = 'eye'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'eye') return 'k';
      if (mat === 'ball') {
        // Rotating earthy-brown / ochre / straw / dark-soil mottling on the dung ball
        const ry = (y - ballY) * Math.cos(phase) - (z - ballZ) * Math.sin(phase);
        const rz = (y - ballY) * Math.sin(phase) + (z - ballZ) * Math.cos(phase);
        const mottle = Math.sin(x * 24 + rz * 20) * Math.cos(ry * 26 - x * 18);
        const straw = Math.sin(x * 46 - ry * 38 + rz * 32);
        if (straw > 0.84 && shade > 0.25) return 'd3';
        const s = shade + mottle * 0.16;
        return s > 0.66 ? 'd2' : s > 0.30 ? 'd1' : 'd0';
      }

      // Crisp dark elytra center seam & subtle longitudinal striations
      if (z < -0.22 && y > -0.08 + bob) {
        if (Math.abs(x) < 0.016) return 'k';
        const stria = Math.sin(Math.abs(x) * 62) * 0.06;
        const s = shade + stria;
        return s > 0.82 ? 'm4' : s > 0.60 ? 'm3' : s > 0.36 ? 'm2' : s > 0.16 ? 'm1' : 'm0';
      }
      return shade > 0.80 ? 'm4' : shade > 0.56 ? 'm3' : shade > 0.34 ? 'm2' : shade > 0.16 ? 'm1' : 'm0';
    };

    pack = build27Pack(DUNG_BEETLE_PW, DUNG_BEETLE_PH, 1.05, 0.70, DUNG_PAL, evalFn, shadeFn);
    dungCache.set(pose, pack);
  }
  return pack;
}

export function getDungBeetlePosePack(...args: Parameters<typeof buildDungBeetlePosePack>): ReturnType<typeof buildDungBeetlePosePack> {
  return registerAnimalSpritePack(buildDungBeetlePosePack(...args), { module: './InsectsPackA.ts', factory: 'getDungBeetlePosePack', args }, buildDungBeetlePosePack);
}

export class DungBeetle extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private readonly home = new THREE.Vector3();
  private state: 'idle' | 'roll' = 'roll';
  private stateT = 0;
  private stateDur = rand(2.0, 4.0);
  private targetYaw = rand(0, Math.PI * 2);
  private gaitPhase = rand(0, Math.PI * 2);

  constructor(ctx: GameContext, pos: THREE.Vector3) {
    super(ctx, getDungBeetlePosePack('idle0').getView(2, 0)!, DUNG_BEETLE_PW, DUNG_BEETLE_PH, DUNG_BEETLE_W, DUNG_BEETLE_H, 'DungBeetleBillboard');
    this.hp = 14;
    this.maxHp = 14;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.22;
    this.motor.height = 0.36;
    this.motor.teleport(pos);
    this.home.copy(pos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.26, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 { return out.set(this.position.x, this.position.y + 0.16, this.position.z); }
  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y + 0.06, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.24, this.position.z);
    this.hurtboxes[0].enabled = this.alive;
    this.stickRoot.position.set(this.position.x, this.position.y + 0.16, this.position.z);
    this.stickRoot.rotation.y = this.facing;
  }

  receiveHit(hit: HitInfo): HitResult {
    const res = emptyResult('flesh');
    if (!this.alive) { res.ignored = true; return res; }
    this.hp = Math.max(0, this.hp - hit.damage);
    res.damage = hit.damage;
    this.flash = 1.0;
    this.vel.x += hit.dir.x * 3.2; this.vel.z += hit.dir.z * 3.2; this.vel.y = 2.0;
    if (this.hp <= 0) { this.alive = false; res.killed = true; }
    return res;
  }

  update(dt: number, _target: EnemyTarget | null, camera: THREE.Camera, drawingBufferSize?: THREE.Vector2) {
    if (dt > 0) {
      this.stateT += dt;
      this.flash = Math.max(0, this.flash - dt * 4.5);
      if (!this.alive) {
        this.deadT += dt;
        this.vel.x = damp(this.vel.x, 0, 6, dt); this.vel.z = damp(this.vel.z, 0, 6, dt); this.vel.y -= 18 * dt;
        this.motor.update(dt);
      } else {
        if (this.stateT >= this.stateDur) {
          this.state = this.state === 'roll' ? 'idle' : 'roll';
          this.stateT = 0;
          this.stateDur = this.state === 'roll' ? rand(2.2, 4.2) : rand(1.0, 2.2);
          const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
          this.targetYaw = toHome > 6.0
            ? Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.6, 0.6)
            : this.facing + rand(-1.6, 1.6);
        }
        const speed = this.state === 'roll' ? 0.95 : 0;
        if (speed > 0) this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 5);
        this.vel.x = damp(this.vel.x, Math.sin(this.facing) * speed, 8, dt);
        this.vel.z = damp(this.vel.z, Math.cos(this.facing) * speed, 8, dt);
        this.vel.y -= 18 * dt;
        this.motor.update(dt);
        if (speed > 0 && this.motor.grounded) this.gaitPhase += dt * 7.0;
      }
      this.syncHurtbox();
    }
    const pose: DungBeetlePoseName = !this.alive ? 'idle0' : this.state === 'roll'
      ? pickCycle(DUNG_ROLL, (this.gaitPhase / Math.PI) * 3.0)
      : pickCycle(DUNG_IDLE, this.stateT * 2.0);
    const deathSink = this.alive ? 0 : Math.min(0.12, this.deadT * 0.35);
    this.renderBillboard(getDungBeetlePosePack(pose), this.position.y + 0.16 - deathSink, camera, drawingBufferSize);
  }
}

// ============================================================================
// 2. BESOURO-HÉRCULES (Hercules Beetle) — 38×24
// ============================================================================
export type HerculesBeetlePoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'walk0' | 'walk1' | 'walk2' | 'walk3' | 'walk4' | 'walk5';

export const HERCULES_BEETLE_PW = 38;
export const HERCULES_BEETLE_PH = 24;
export const HERCULES_BEETLE_W = HERCULES_BEETLE_PW / ANIMAL_PPU;
export const HERCULES_BEETLE_H = HERCULES_BEETLE_PH / ANIMAL_PPU;

const HERC_PAL: Record<string, [number, number, number]> = {
  k:  [0x0c, 0x0c, 0x10], // crisp 1px outline / elytra spots / horns
  h0: [0x1b, 0x1c, 0x24], // glossy jet-black thorax & pincer horn shadow
  h1: [0x34, 0x38, 0x46], // glossy black horn & pronotum highlight
  o0: [0x6e, 0x5e, 0x20], // olive-gold elytra shadow
  o1: [0xa6, 0x92, 0x30], // rich olive-gold elytra midtone
  o2: [0xd6, 0xc2, 0x48], // sunlit olive-gold elytra highlight
  o3: [0xf2, 0xe4, 0x7c], // bright specular gold sheen
};

const HERC_IDLE: readonly HerculesBeetlePoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const HERC_WALK: readonly HerculesBeetlePoseName[] = ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'];

const hercCache = new Map<HerculesBeetlePoseName, Boar27Pack>();
 function buildHerculesBeetlePosePack(pose: HerculesBeetlePoseName): Boar27Pack {
  let pack = hercCache.get(pose);
  if (!pack) {
    const isWalk = pose.startsWith('walk');
    const idx = parseInt(pose.slice(-1), 10) || 0;
    const phase = isWalk ? (idx / 6) * Math.PI * 2 : idx * 0.4;
    const bob = isWalk ? Math.sin(phase * 2) * 0.015 : 0;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // Giant olive-gold black-spotted elytra shell
      const elytra = sdEllipsoid(x, y, z, 0, 0.02 + bob, -0.22, 0.26, 0.19, 0.36);
      // Glossy black armored thorax (pronotum)
      const thorax = sdEllipsoid(x, y, z, 0, 0.00 + bob, 0.16, 0.22, 0.16, 0.18);
      // Huge curved black thoracic upper pincer horn!
      const topHorn1 = sdCapsule(x, y, z, 0, 0.08 + bob, 0.22, 0, 0.16 + bob, 0.56, 0.048, 0.030);
      const topHorn2 = sdCapsule(x, y, z, 0, 0.16 + bob, 0.56, 0, 0.08 + bob, 0.86, 0.028, 0.012);
      // Curved black lower cephalic pincer horn!
      const lowHorn1 = sdCapsule(x, y, z, 0, -0.06 + bob, 0.26, 0, -0.09 + bob, 0.54, 0.036, 0.022);
      const lowHorn2 = sdCapsule(x, y, z, 0, -0.09 + bob, 0.54, 0, 0.01 + bob, 0.74, 0.022, 0.011);
      const horns = Math.min(smin(topHorn1, topHorn2, 0.02), smin(lowHorn1, lowHorn2, 0.02));

      let body = smin(smin(elytra, thorax, 0.04), horns, 0.025);

      // 6 sturdy black legs
      let legs = 99;
      for (let side = -1; side <= 1; side += 2) {
        for (let i = 0; i < 3; i++) {
          const lz = -0.34 + i * 0.22;
          const step = Math.sin(phase + i * 2.1 + (side < 0 ? 0 : Math.PI)) * (isWalk ? 0.08 : 0.01);
          const lift = Math.max(0, Math.cos(phase + i * 2.1 + (side < 0 ? 0 : Math.PI))) * (isWalk ? 0.06 : 0.0);
          const leg = sdCapsule(x, y, z, side * 0.20, -0.08 + bob, lz, side * 0.40, -0.26 + lift, lz + step, 0.032, 0.018);
          legs = Math.min(legs, leg);
        }
      }
      body = smin(body, legs, 0.02);

      let mat = 'elytra';
      if (z > 0.04 || y < -0.14 || Math.abs(x) > 0.26) mat = 'black';
      return { d: body, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, _y, z) => {
      if (mat === 'black') return shade > 0.55 ? 'h1' : 'h0';
      // Crisp black spots on olive-gold elytra
      const spot = Math.sin(x * 28) * Math.cos(z * 26);
      if (spot > 0.72) return 'k';
      return shade > 0.80 ? 'o3' : shade > 0.54 ? 'o2' : shade > 0.26 ? 'o1' : 'o0';
    };

    pack = build27Pack(HERCULES_BEETLE_PW, HERCULES_BEETLE_PH, 1.04, 0.66, HERC_PAL, evalFn, shadeFn);
    hercCache.set(pose, pack);
  }
  return pack;
}

export function getHerculesBeetlePosePack(...args: Parameters<typeof buildHerculesBeetlePosePack>): ReturnType<typeof buildHerculesBeetlePosePack> {
  return registerAnimalSpritePack(buildHerculesBeetlePosePack(...args), { module: './InsectsPackA.ts', factory: 'getHerculesBeetlePosePack', args }, buildHerculesBeetlePosePack);
}

export class HerculesBeetle extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private readonly home = new THREE.Vector3();
  private state: 'idle' | 'walk' = 'walk';
  private stateT = 0;
  private stateDur = rand(2.0, 4.0);
  private targetYaw = rand(0, Math.PI * 2);
  private gaitPhase = rand(0, Math.PI * 2);

  constructor(ctx: GameContext, pos: THREE.Vector3) {
    super(ctx, getHerculesBeetlePosePack('idle0').getView(2, 0)!, HERCULES_BEETLE_PW, HERCULES_BEETLE_PH, HERCULES_BEETLE_W, HERCULES_BEETLE_H, 'HerculesBeetleBillboard');
    this.hp = 22;
    this.maxHp = 22;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.26;
    this.motor.height = 0.38;
    this.motor.teleport(pos);
    this.home.copy(pos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.30, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 { return out.set(this.position.x, this.position.y + 0.18, this.position.z); }
  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y + 0.08, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.26, this.position.z);
    this.hurtboxes[0].enabled = this.alive;
    this.stickRoot.position.set(this.position.x, this.position.y + 0.18, this.position.z);
    this.stickRoot.rotation.y = this.facing;
  }

  receiveHit(hit: HitInfo): HitResult {
    const res = emptyResult('flesh');
    if (!this.alive) { res.ignored = true; return res; }
    this.hp = Math.max(0, this.hp - hit.damage);
    res.damage = hit.damage;
    this.flash = 1.0;
    this.vel.x += hit.dir.x * 3.0; this.vel.z += hit.dir.z * 3.0; this.vel.y = 2.0;
    if (this.hp <= 0) { this.alive = false; res.killed = true; }
    return res;
  }

  update(dt: number, _target: EnemyTarget | null, camera: THREE.Camera, drawingBufferSize?: THREE.Vector2) {
    if (dt > 0) {
      this.stateT += dt;
      this.flash = Math.max(0, this.flash - dt * 4.5);
      if (!this.alive) {
        this.deadT += dt;
        this.vel.x = damp(this.vel.x, 0, 6, dt); this.vel.z = damp(this.vel.z, 0, 6, dt); this.vel.y -= 18 * dt;
        this.motor.update(dt);
      } else {
        if (this.stateT >= this.stateDur) {
          this.state = this.state === 'walk' ? 'idle' : 'walk';
          this.stateT = 0;
          this.stateDur = this.state === 'walk' ? rand(2.2, 4.0) : rand(1.2, 2.4);
          const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
          this.targetYaw = toHome > 6.5
            ? Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.6, 0.6)
            : this.facing + rand(-1.6, 1.6);
        }
        const speed = this.state === 'walk' ? 1.05 : 0;
        if (speed > 0) this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 5);
        this.vel.x = damp(this.vel.x, Math.sin(this.facing) * speed, 8, dt);
        this.vel.z = damp(this.vel.z, Math.cos(this.facing) * speed, 8, dt);
        this.vel.y -= 18 * dt;
        this.motor.update(dt);
        if (speed > 0 && this.motor.grounded) this.gaitPhase += dt * 6.5;
      }
      this.syncHurtbox();
    }
    const pose: HerculesBeetlePoseName = !this.alive ? 'idle0' : this.state === 'walk'
      ? pickCycle(HERC_WALK, (this.gaitPhase / Math.PI) * 3.0)
      : pickCycle(HERC_IDLE, this.stateT * 2.0);
    const deathSink = this.alive ? 0 : Math.min(0.14, this.deadT * 0.35);
    this.renderBillboard(getHerculesBeetlePosePack(pose), this.position.y + 0.18 - deathSink, camera, drawingBufferSize);
  }
}

// ============================================================================
// 3. LOUVA-DEUS (Praying Mantis) — 32×30
// ============================================================================
export type PrayingMantisPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'walk0' | 'walk1' | 'walk2' | 'walk3' | 'walk4' | 'walk5'
  | 'strike0' | 'strike1' | 'strike2';

export const PRAYING_MANTIS_PW = 32;
export const PRAYING_MANTIS_PH = 30;
export const PRAYING_MANTIS_W = PRAYING_MANTIS_PW / ANIMAL_PPU;
export const PRAYING_MANTIS_H = PRAYING_MANTIS_PH / ANIMAL_PPU;

const MANTIS_PAL: Record<string, [number, number, number]> = {
  k:  [0x0c, 0x14, 0x0e], // crisp 1px outline / eye pseudopupil
  g0: [0x1c, 0x5a, 0x22], // deep leaf-green shadow
  g1: [0x32, 0x8e, 0x34], // emerald-green mantis midtone
  g2: [0x58, 0xc4, 0x46], // bright lime-emerald highlight
  g3: [0x9c, 0xeb, 0x6e], // sunlit spring-green rim
  e:  [0xd8, 0xf6, 0x72], // bright yellow-green compound eyes
};

const MANTIS_IDLE: readonly PrayingMantisPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const MANTIS_WALK: readonly PrayingMantisPoseName[] = ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'];
const MANTIS_STRIKE: readonly PrayingMantisPoseName[] = ['strike0', 'strike1', 'strike2'];

const mantisCache = new Map<PrayingMantisPoseName, Boar27Pack>();
 function buildPrayingMantisPosePack(pose: PrayingMantisPoseName): Boar27Pack {
  let pack = mantisCache.get(pose);
  if (!pack) {
    const isWalk = pose.startsWith('walk');
    const isStrike = pose.startsWith('strike');
    const idx = parseInt(pose.slice(-1), 10) || 0;
    const phase = isWalk ? (idx / 6) * Math.PI * 2 : idx * 0.6;
    const strikeReach = isStrike ? (idx === 1 ? 1.0 : 0.45) : 0.0;
    const sway = pose === 'idle1' ? 0.04 : pose === 'idle2' ? -0.04 : 0;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // Slender leaf-like abdomen & elongated upright prothorax
      const abdomen = sdEllipsoid(x, y, z, 0, -0.04, -0.22, 0.12, 0.09, 0.30);
      const thorax = sdCapsule(x, y, z, 0, -0.02, 0.02, sway, 0.36, 0.24, 0.052, 0.042);
      // Iconic triangular mantis head
      const head = sdEllipsoid(x, y, z, sway, 0.42, 0.28, 0.11, 0.068, 0.062);
      const antL = sdCapsule(x, y, z, sway - 0.04, 0.46, 0.30, sway - 0.12, 0.60, 0.42, 0.012, 0.008);
      const antR = sdCapsule(x, y, z, sway + 0.04, 0.46, 0.30, sway + 0.12, 0.60, 0.42, 0.012, 0.008);
      let body = smin(smin(abdomen, thorax, 0.04), head, 0.025);
      body = Math.min(body, Math.min(antL, antR));

      // Folded raptorial forelegs (or lunging forward in strike0..2!)
      let arms = 99;
      for (let side = -1; side <= 1; side += 2) {
        const elbowX = sway + side * (0.10 + strikeReach * 0.04);
        const elbowY = 0.20 + strikeReach * 0.08;
        const elbowZ = 0.34 + strikeReach * 0.22;
        const tipY = 0.12 + strikeReach * 0.08;
        const tipZ = 0.26 + strikeReach * 0.44;
        const upper = sdCapsule(x, y, z, sway + side * 0.04, 0.32, 0.22, elbowX, elbowY, elbowZ, 0.028, 0.026);
        const lower = sdCapsule(x, y, z, elbowX, elbowY, elbowZ, sway + side * 0.08, tipY, tipZ, 0.024, 0.014);
        arms = Math.min(arms, smin(upper, lower, 0.015));
      }
      body = smin(body, arms, 0.02);

      // 4 slender walking legs
      let legs = 99;
      for (let side = -1; side <= 1; side += 2) {
        for (let i = 0; i < 2; i++) {
          const lz = -0.24 + i * 0.24;
          const step = Math.sin(phase + i * 3.1 + (side < 0 ? 0 : Math.PI)) * (isWalk ? 0.10 : 0.01);
          const lift = Math.max(0, Math.cos(phase + i * 3.1 + (side < 0 ? 0 : Math.PI))) * (isWalk ? 0.08 : 0.0);
          const knee = sdCapsule(x, y, z, side * 0.08, -0.06, lz, side * 0.28, 0.06 + lift, lz + step * 0.5, 0.022, 0.018);
          const foot = sdCapsule(x, y, z, side * 0.28, 0.06 + lift, lz + step * 0.5, side * 0.36, -0.34 + lift, lz + step, 0.018, 0.012);
          legs = Math.min(legs, smin(knee, foot, 0.014));
        }
      }
      body = smin(body, legs, 0.02);

      // Big bulging triangular corner eyes
      const eyeL = sdEllipsoid(x, y, z, sway - 0.095, 0.44, 0.29, 0.036, 0.034, 0.034);
      const eyeR = sdEllipsoid(x, y, z, sway + 0.095, 0.44, 0.29, 0.036, 0.034, 0.034);
      const eyes = Math.min(eyeL, eyeR);

      let d = body;
      let mat = 'body';
      if (eyes < d) { d = eyes; mat = 'eye'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, _x, y, z) => {
      if (mat === 'eye') {
        if (Math.abs(y - 0.44) < 0.012 && z > 0.30) return 'k';
        return 'e';
      }
      return shade > 0.78 ? 'g3' : shade > 0.50 ? 'g2' : shade > 0.24 ? 'g1' : 'g0';
    };

    pack = build27Pack(PRAYING_MANTIS_PW, PRAYING_MANTIS_PH, 0.84, 0.79, MANTIS_PAL, evalFn, shadeFn);
    mantisCache.set(pose, pack);
  }
  return pack;
}

export function getPrayingMantisPosePack(...args: Parameters<typeof buildPrayingMantisPosePack>): ReturnType<typeof buildPrayingMantisPosePack> {
  return registerAnimalSpritePack(buildPrayingMantisPosePack(...args), { module: './InsectsPackA.ts', factory: 'getPrayingMantisPosePack', args }, buildPrayingMantisPosePack);
}

export class PrayingMantis extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private readonly home = new THREE.Vector3();
  private state: 'idle' | 'walk' | 'strike' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.6, 3.2);
  private targetYaw = rand(0, Math.PI * 2);
  private gaitPhase = rand(0, Math.PI * 2);

  constructor(ctx: GameContext, pos: THREE.Vector3) {
    super(ctx, getPrayingMantisPosePack('idle0').getView(2, 0)!, PRAYING_MANTIS_PW, PRAYING_MANTIS_PH, PRAYING_MANTIS_W, PRAYING_MANTIS_H, 'PrayingMantisBillboard');
    this.hp = 18;
    this.maxHp = 18;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.22;
    this.motor.height = 0.46;
    this.motor.teleport(pos);
    this.home.copy(pos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.26, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 { return out.set(this.position.x, this.position.y + 0.22, this.position.z); }
  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y + 0.08, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.36, this.position.z);
    this.hurtboxes[0].enabled = this.alive;
    this.stickRoot.position.set(this.position.x, this.position.y + 0.22, this.position.z);
    this.stickRoot.rotation.y = this.facing;
  }

  receiveHit(hit: HitInfo): HitResult {
    const res = emptyResult('flesh');
    if (!this.alive) { res.ignored = true; return res; }
    this.hp = Math.max(0, this.hp - hit.damage);
    res.damage = hit.damage;
    this.flash = 1.0;
    this.vel.x += hit.dir.x * 3.5; this.vel.z += hit.dir.z * 3.5; this.vel.y = 2.4;
    if (this.hp <= 0) { this.alive = false; res.killed = true; }
    else { this.state = 'strike'; this.stateT = 0; this.stateDur = 1.0; }
    return res;
  }

  update(dt: number, target: EnemyTarget | null, camera: THREE.Camera, drawingBufferSize?: THREE.Vector2) {
    if (dt > 0) {
      this.stateT += dt;
      this.flash = Math.max(0, this.flash - dt * 4.5);
      if (!this.alive) {
        this.deadT += dt;
        this.vel.x = damp(this.vel.x, 0, 6, dt); this.vel.z = damp(this.vel.z, 0, 6, dt); this.vel.y -= 18 * dt;
        this.motor.update(dt);
      } else {
        const dist = target && target.alive
          ? Math.hypot(target.position.x - this.position.x, target.position.z - this.position.z)
          : 999;
        if (dist < 2.2 && this.state !== 'strike') {
          this.state = 'strike'; this.stateT = 0; this.stateDur = 0.9;
          if (target) this.targetYaw = Math.atan2(target.position.x - this.position.x, target.position.z - this.position.z);
        } else if (this.stateT >= this.stateDur) {
          this.state = this.state === 'walk' ? 'idle' : 'walk';
          this.stateT = 0;
          this.stateDur = this.state === 'walk' ? rand(1.8, 3.2) : rand(1.4, 2.8);
          const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
          this.targetYaw = toHome > 6.0
            ? Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.6, 0.6)
            : this.facing + rand(-1.6, 1.6);
        }
        const speed = this.state === 'walk' ? 1.1 : 0;
        this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 6);
        this.vel.x = damp(this.vel.x, Math.sin(this.facing) * speed, 8, dt);
        this.vel.z = damp(this.vel.z, Math.cos(this.facing) * speed, 8, dt);
        this.vel.y -= 18 * dt;
        this.motor.update(dt);
        if (speed > 0 && this.motor.grounded) this.gaitPhase += dt * 6.5;
      }
      this.syncHurtbox();
    }
    const pose: PrayingMantisPoseName = !this.alive ? 'idle0'
      : this.state === 'strike' ? pickCycle(MANTIS_STRIKE, this.stateT * 5.0)
      : this.state === 'walk' ? pickCycle(MANTIS_WALK, (this.gaitPhase / Math.PI) * 3.0)
      : pickCycle(MANTIS_IDLE, this.stateT * 2.0);
    const deathSink = this.alive ? 0 : Math.min(0.16, this.deadT * 0.35);
    this.renderBillboard(getPrayingMantisPosePack(pose), this.position.y + 0.22 - deathSink, camera, drawingBufferSize);
  }
}

// ============================================================================
// 4. VESPA (Wasp) — 22×18
// ============================================================================
export type WaspPoseName = 'buzz0' | 'buzz1' | 'buzz2' | 'buzz3';

export const WASP_PW = 22;
export const WASP_PH = 18;
export const WASP_W = WASP_PW / ANIMAL_PPU;
export const WASP_H = WASP_PH / ANIMAL_PPU;

const WASP_PAL: Record<string, [number, number, number]> = {
  k:  [0x0c, 0x0c, 0x10], // crisp 1px outline / black stripes / eyes
  y0: [0xc4, 0x8e, 0x10], // golden-yellow shadow
  y1: [0xff, 0xd4, 0x24], // bright wasp yellow
  y2: [0xff, 0xf0, 0x76], // sunlit yellow highlight
  w0: [0xc4, 0xd8, 0xe8], // translucent wing shadow
  W:  [0xf2, 0xf9, 0xff], // translucent fluttering wings
};

const WASP_BUZZ: readonly WaspPoseName[] = ['buzz0', 'buzz1', 'buzz2', 'buzz3'];

const waspCache = new Map<WaspPoseName, Boar27Pack>();
 function buildWaspPosePack(pose: WaspPoseName): Boar27Pack {
  let pack = waspCache.get(pose);
  if (!pack) {
    const idx = parseInt(pose.slice(-1), 10) || 0;
    const wingY = [0.28, 0.04, -0.22, 0.06][idx];

    const evalFn: SdfEvaluator = (x, y, z) => {
      // Sleek wasp: pointed striped abdomen + narrow waist + thorax + head
      const abdomen = sdCapsule(x, y, z, 0, -0.02, -0.08, 0, -0.08, -0.44, 0.11, 0.022);
      const waist = sdCapsule(x, y, z, 0, -0.01, -0.06, 0, 0.02, 0.06, 0.036, 0.036);
      const thorax = sdEllipsoid(x, y, z, 0, 0.04, 0.14, 0.105, 0.10, 0.13);
      const head = sdEllipsoid(x, y, z, 0, 0.02, 0.30, 0.085, 0.085, 0.08);
      let body = smin(smin(abdomen, waist, 0.02), smin(thorax, head, 0.025), 0.025);

      // Fluttering translucent wings
      const wingL = sdCapsule(x, y, z, -0.08, 0.10, 0.12, -0.46, 0.12 + wingY, -0.06, 0.055, 0.026);
      const wingR = sdCapsule(x, y, z,  0.08, 0.10, 0.12,  0.46, 0.12 + wingY, -0.06, 0.055, 0.026);
      const wings = Math.min(wingL, wingR);

      let d = body;
      let mat = 'body';
      if (wings < d) { d = wings; mat = 'wing'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, _x, _y, z) => {
      if (mat === 'wing') return shade > 0.42 ? 'W' : 'w0';
      // Crisp bright-yellow & black wasp stripes
      if (z < -0.06) {
        const stripe = Math.sin(z * 48);
        if (stripe < 0.0) return 'k';
      } else if (z > 0.06 && z < 0.24) {
        return shade > 0.65 ? 'y1' : 'k';
      }
      return shade > 0.72 ? 'y2' : shade > 0.35 ? 'y1' : 'y0';
    };

    pack = build27Pack(WASP_PW, WASP_PH, 0.72, 0.59, WASP_PAL, evalFn, shadeFn);
    waspCache.set(pose, pack);
  }
  return pack;
}

export function getWaspPosePack(...args: Parameters<typeof buildWaspPosePack>): ReturnType<typeof buildWaspPosePack> {
  return registerAnimalSpritePack(buildWaspPosePack(...args), { module: './InsectsPackA.ts', factory: 'getWaspPosePack', args }, buildWaspPosePack);
}

export class Wasp extends BasePixelAnimal {
  readonly position = new THREE.Vector3();
  private readonly home = new THREE.Vector3();
  private readonly vel = new THREE.Vector3();
  private stateT = 0;
  private orbitAngle = rand(0, Math.PI * 2);
  private hoverAlt = rand(0.7, 1.8);

  constructor(ctx: GameContext, pos: THREE.Vector3) {
    super(ctx, getWaspPosePack('buzz0').getView(2, 0)!, WASP_PW, WASP_PH, WASP_W, WASP_H, 'WaspBillboard');
    this.hp = 10;
    this.maxHp = 10;
    this.home.copy(pos);
    this.position.set(pos.x, pos.y + this.hoverAlt, pos.z);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.20, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 { return out.copy(this.position); }
  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y - 0.08, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.08, this.position.z);
    this.hurtboxes[0].enabled = this.alive;
    this.stickRoot.position.copy(this.position);
    this.stickRoot.rotation.y = this.facing;
  }

  receiveHit(hit: HitInfo): HitResult {
    const res = emptyResult('flesh');
    if (!this.alive) { res.ignored = true; return res; }
    this.hp = Math.max(0, this.hp - hit.damage);
    res.damage = hit.damage;
    this.flash = 1.0;
    this.vel.x += hit.dir.x * 4.0; this.vel.z += hit.dir.z * 4.0; this.vel.y = 2.0;
    if (this.hp <= 0) { this.alive = false; res.killed = true; }
    return res;
  }

  update(dt: number, _target: EnemyTarget | null, camera: THREE.Camera, drawingBufferSize?: THREE.Vector2) {
    if (dt > 0) {
      this.stateT += dt;
      this.flash = Math.max(0, this.flash - dt * 4.5);
      if (!this.alive) {
        this.deadT += dt;
        this.vel.x = damp(this.vel.x, 0, 5, dt); this.vel.z = damp(this.vel.z, 0, 5, dt); this.vel.y -= 16 * dt;
        this.position.addScaledVector(this.vel, dt);
        if (this.position.y < this.home.y + 0.10) { this.position.y = this.home.y + 0.10; this.vel.y = 0; }
      } else {
        this.orbitAngle += dt * 1.6;
        const tx = this.home.x + Math.cos(this.orbitAngle) * 2.2;
        const tz = this.home.z + Math.sin(this.orbitAngle * 1.4) * 2.2;
        const ty = this.home.y + this.hoverAlt + Math.sin(this.stateT * 4.5) * 0.22;
        this.vel.x = damp(this.vel.x, (tx - this.position.x) * 3.0, 5, dt);
        this.vel.y = damp(this.vel.y, (ty - this.position.y) * 3.5, 5, dt);
        this.vel.z = damp(this.vel.z, (tz - this.position.z) * 3.0, 5, dt);
        this.position.addScaledVector(this.vel, dt);
        if (Math.hypot(this.vel.x, this.vel.z) > 0.15) {
          this.facing += angleDiff(this.facing, Math.atan2(this.vel.x, this.vel.z)) * Math.min(1, dt * 8);
        }
      }
      this.syncHurtbox();
    }
    const pose: WaspPoseName = !this.alive ? 'buzz0' : pickCycle(WASP_BUZZ, this.stateT * 18.0);
    this.renderBillboard(getWaspPosePack(pose), this.position.y, camera, drawingBufferSize);
  }
}

// ============================================================================
// 5. VESPA-DO-CÃO (Tarantula Hawk) — 28×22
// ============================================================================
export type TarantulaHawkPoseName =
  | 'buzz0' | 'buzz1' | 'buzz2' | 'buzz3'
  | 'dart0' | 'dart1' | 'dart2' | 'dart3';

export const TARANTULA_HAWK_PW = 28;
export const TARANTULA_HAWK_PH = 22;
export const TARANTULA_HAWK_W = TARANTULA_HAWK_PW / ANIMAL_PPU;
export const TARANTULA_HAWK_H = TARANTULA_HAWK_PH / ANIMAL_PPU;

const THAWK_PAL: Record<string, [number, number, number]> = {
  k:  [0x09, 0x0b, 0x16], // crisp 1px dark outline
  b0: [0x12, 0x1c, 0x42], // deep metallic indigo-blue shadow
  b1: [0x1e, 0x36, 0x78], // metallic indigo-blue body
  b2: [0x36, 0x62, 0xb8], // electric cobalt-blue sheen
  b3: [0x6e, 0x9e, 0xe8], // specular sapphire rim
  o0: [0xa6, 0x32, 0x0c], // burnt-orange wing border/shadow
  o1: [0xe6, 0x58, 0x14], // fiery burnt-orange wing midtone
  o2: [0xff, 0x8e, 0x26], // sunlit fiery-orange wing highlight
};

const THAWK_BUZZ: readonly TarantulaHawkPoseName[] = ['buzz0', 'buzz1', 'buzz2', 'buzz3'];
const THAWK_DART: readonly TarantulaHawkPoseName[] = ['dart0', 'dart1', 'dart2', 'dart3'];

const thawkCache = new Map<TarantulaHawkPoseName, Boar27Pack>();
 function buildTarantulaHawkPosePack(pose: TarantulaHawkPoseName): Boar27Pack {
  let pack = thawkCache.get(pose);
  if (!pack) {
    const isDart = pose.startsWith('dart');
    const idx = parseInt(pose.slice(-1), 10) || 0;
    const wingY = isDart ? [0.18, -0.06, -0.20, 0.02][idx] : [0.32, 0.05, -0.24, 0.08][idx];
    const sweep = isDart ? -0.14 : -0.04;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // Dramatic metallic indigo-blue wasp body with long dangling legs & curled antennae
      const abdomen = sdCapsule(x, y, z, 0, -0.02, -0.08, 0, -0.08, -0.50, 0.11, 0.024);
      const waist = sdCapsule(x, y, z, 0, 0.00, -0.06, 0, 0.03, 0.08, 0.036, 0.036);
      const thorax = sdEllipsoid(x, y, z, 0, 0.05, 0.16, 0.11, 0.105, 0.14);
      const head = sdEllipsoid(x, y, z, 0, 0.03, 0.34, 0.09, 0.09, 0.085);
      const antL = sdCapsule(x, y, z, -0.04, 0.07, 0.38, -0.14, 0.12, 0.56, 0.014, 0.010);
      const antR = sdCapsule(x, y, z,  0.04, 0.07, 0.38,  0.14, 0.12, 0.56, 0.014, 0.010);
      const legL = sdCapsule(x, y, z, -0.07, -0.04, 0.06, -0.12, -0.28, -0.24, 0.018, 0.012);
      const legR = sdCapsule(x, y, z,  0.07, -0.04, 0.06,  0.12, -0.28, -0.24, 0.018, 0.012);
      let body = smin(smin(abdomen, waist, 0.02), smin(thorax, head, 0.025), 0.025);
      body = Math.min(body, Math.min(Math.min(antL, antR), Math.min(legL, legR)));

      // Dramatic fiery burnt-orange wings!
      const wingL = sdCapsule(x, y, z, -0.09, 0.11, 0.14, -0.56, 0.12 + wingY, -0.08 + sweep, 0.068, 0.034);
      const wingR = sdCapsule(x, y, z,  0.09, 0.11, 0.14,  0.56, 0.12 + wingY, -0.08 + sweep, 0.068, 0.034);
      const wings = Math.min(wingL, wingR);

      let d = body;
      let mat = 'body';
      if (wings < d) { d = wings; mat = 'wing'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x) => {
      if (mat === 'wing') {
        if (Math.abs(x) > 0.48) return 'o0';
        return shade > 0.62 ? 'o2' : shade > 0.28 ? 'o1' : 'o0';
      }
      return shade > 0.78 ? 'b3' : shade > 0.50 ? 'b2' : shade > 0.24 ? 'b1' : 'b0';
    };

    pack = build27Pack(TARANTULA_HAWK_PW, TARANTULA_HAWK_PH, 0.84, 0.66, THAWK_PAL, evalFn, shadeFn);
    thawkCache.set(pose, pack);
  }
  return pack;
}

export function getTarantulaHawkPosePack(...args: Parameters<typeof buildTarantulaHawkPosePack>): ReturnType<typeof buildTarantulaHawkPosePack> {
  return registerAnimalSpritePack(buildTarantulaHawkPosePack(...args), { module: './InsectsPackA.ts', factory: 'getTarantulaHawkPosePack', args }, buildTarantulaHawkPosePack);
}

export class TarantulaHawk extends BasePixelAnimal {
  readonly position = new THREE.Vector3();
  private readonly home = new THREE.Vector3();
  private readonly vel = new THREE.Vector3();
  private state: 'buzz' | 'dart' = 'buzz';
  private stateT = 0;
  private stateDur = rand(1.6, 3.2);
  private targetYaw = rand(0, Math.PI * 2);
  private hoverAlt = rand(0.9, 2.2);

  constructor(ctx: GameContext, pos: THREE.Vector3) {
    super(ctx, getTarantulaHawkPosePack('buzz0').getView(2, 0)!, TARANTULA_HAWK_PW, TARANTULA_HAWK_PH, TARANTULA_HAWK_W, TARANTULA_HAWK_H, 'TarantulaHawkBillboard');
    this.hp = 16;
    this.maxHp = 16;
    this.home.copy(pos);
    this.position.set(pos.x, pos.y + this.hoverAlt, pos.z);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.24, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 { return out.copy(this.position); }
  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y - 0.10, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.10, this.position.z);
    this.hurtboxes[0].enabled = this.alive;
    this.stickRoot.position.copy(this.position);
    this.stickRoot.rotation.y = this.facing;
  }

  receiveHit(hit: HitInfo): HitResult {
    const res = emptyResult('flesh');
    if (!this.alive) { res.ignored = true; return res; }
    this.hp = Math.max(0, this.hp - hit.damage);
    res.damage = hit.damage;
    this.flash = 1.0;
    this.vel.x += hit.dir.x * 4.2; this.vel.z += hit.dir.z * 4.2; this.vel.y = 2.4;
    if (this.hp <= 0) { this.alive = false; res.killed = true; }
    else { this.state = 'dart'; this.stateT = 0; this.stateDur = 1.2; this.targetYaw = Math.atan2(hit.dir.x, hit.dir.z); }
    return res;
  }

  update(dt: number, _target: EnemyTarget | null, camera: THREE.Camera, drawingBufferSize?: THREE.Vector2) {
    if (dt > 0) {
      this.stateT += dt;
      this.flash = Math.max(0, this.flash - dt * 4.5);
      if (!this.alive) {
        this.deadT += dt;
        this.vel.x = damp(this.vel.x, 0, 5, dt); this.vel.z = damp(this.vel.z, 0, 5, dt); this.vel.y -= 16 * dt;
        this.position.addScaledVector(this.vel, dt);
        if (this.position.y < this.home.y + 0.12) { this.position.y = this.home.y + 0.12; this.vel.y = 0; }
      } else {
        if (this.stateT >= this.stateDur) {
          this.state = this.state === 'dart' ? 'buzz' : 'dart';
          this.stateT = 0;
          this.stateDur = this.state === 'dart' ? rand(0.9, 1.6) : rand(1.6, 3.0);
          const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
          this.targetYaw = toHome > 6.5
            ? Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.6, 0.6)
            : this.facing + rand(-1.8, 1.8);
        }
        this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 8);
        const speed = this.state === 'dart' ? 5.0 : 1.8;
        this.vel.x = damp(this.vel.x, Math.sin(this.facing) * speed, 6, dt);
        this.vel.z = damp(this.vel.z, Math.cos(this.facing) * speed, 6, dt);
        const ty = this.home.y + this.hoverAlt + Math.sin(this.stateT * 4.0) * 0.24;
        this.vel.y = damp(this.vel.y, (ty - this.position.y) * 3.0, 5, dt);
        this.position.addScaledVector(this.vel, dt);
      }
      this.syncHurtbox();
    }
    const pose: TarantulaHawkPoseName = !this.alive ? 'buzz0'
      : this.state === 'dart' ? pickCycle(THAWK_DART, this.stateT * 20.0)
      : pickCycle(THAWK_BUZZ, this.stateT * 16.0);
    this.renderBillboard(getTarantulaHawkPosePack(pose), this.position.y, camera, drawingBufferSize);
  }
}
