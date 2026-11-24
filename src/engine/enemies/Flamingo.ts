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
// FLAMINGO (Flagship Greater Flamingo) — 42×64
// ============================================================================
export type FlamingoPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'oneleg0' | 'oneleg1' | 'oneleg2'
  | 'walk0' | 'walk1' | 'walk2' | 'walk3' | 'walk4' | 'walk5'
  | 'dip0' | 'dip1' | 'dip2';

export const FLAMINGO_PW = 42;
export const FLAMINGO_PH = 64;
export const FLAMINGO_W = FLAMINGO_PW / ANIMAL_PPU;
export const FLAMINGO_H = FLAMINGO_PH / ANIMAL_PPU;

/**
 * Vibrant coral-pink & rose-crimson plumage + pale blush bill base + jet-black
 * downward-bent bill tip + piercing pale-yellow eye + 1px dark outline.
 */
const FLAMINGO_PAL: Record<string, [number, number, number]> = {
  k:  [0x14, 0x0d, 0x12], // crisp 1px dark outline / pupil / jet-black bill tip
  p0: [0x9c, 0x2a, 0x46], // deep rose-crimson shadow
  p1: [0xd2, 0x46, 0x66], // rich coral-rose wing coverts & shadow
  p2: [0xf4, 0x72, 0x90], // vibrant flamingo coral-pink midtone
  p3: [0xff, 0x9e, 0xb4], // warm salmon-pink highlight
  p4: [0xff, 0xc8, 0xd8], // sunlit blush-pink rim
  l0: [0xae, 0x3a, 0x56], // stilt-leg shadow
  l1: [0xea, 0x6e, 0x8a], // stilt-leg pink
  W:  [0xf9, 0xf2, 0xf0], // pale white-blush bill base
  e:  [0xff, 0xe4, 0x64], // piercing pale-yellow eye
};

interface FlamingoPose {
  bodyY: number;
  neckSway: number;   // subtle graceful neck sway
  neckDip: number;    // 0 = upright S-curve, 1 = dipped down filter-feeding
  lSwing: number;     // left leg forward/back swing
  lLift: number;      // left leg lift
  rSwing: number;     // right leg forward/back swing
  rLift: number;      // right leg lift
  rTuck: number;      // 0 = standing, 1 = iconic one-leg tuck under belly
}

const FLAMINGO_POSES: Record<FlamingoPoseName, FlamingoPose> = {
  idle0:   { bodyY: 0.00,  neckSway: 0.00,  neckDip: 0.0,  lSwing: 0.02,  lLift: 0.0,  rSwing: -0.02, rLift: 0.0,  rTuck: 0.0 },
  idle1:   { bodyY: 0.015, neckSway: 0.03,  neckDip: 0.0,  lSwing: 0.02,  lLift: 0.0,  rSwing: -0.02, rLift: 0.0,  rTuck: 0.0 },
  idle2:   { bodyY: -0.01, neckSway: -0.03, neckDip: 0.0,  lSwing: 0.02,  lLift: 0.0,  rSwing: -0.02, rLift: 0.0,  rTuck: 0.0 },

  oneleg0: { bodyY: 0.00,  neckSway: 0.00,  neckDip: 0.0,  lSwing: 0.00,  lLift: 0.0,  rSwing: 0.00,  rLift: 0.0,  rTuck: 1.0 },
  oneleg1: { bodyY: 0.02,  neckSway: 0.04,  neckDip: 0.0,  lSwing: 0.00,  lLift: 0.0,  rSwing: 0.00,  rLift: 0.0,  rTuck: 1.0 },
  oneleg2: { bodyY: -0.01, neckSway: -0.03, neckDip: 0.0,  lSwing: 0.00,  lLift: 0.0,  rSwing: 0.00,  rLift: 0.0,  rTuck: 1.0 },

  walk0:   { bodyY: 0.01,  neckSway: 0.02,  neckDip: 0.0,  lSwing: 0.24,  lLift: 0.22, rSwing: -0.16, rLift: 0.0,  rTuck: 0.0 },
  walk1:   { bodyY: 0.03,  neckSway: 0.01,  neckDip: 0.0,  lSwing: 0.14,  lLift: 0.06, rSwing: -0.08, rLift: 0.0,  rTuck: 0.0 },
  walk2:   { bodyY: 0.00,  neckSway: 0.00,  neckDip: 0.0,  lSwing: -0.04, lLift: 0.0,  rSwing: 0.06,  rLift: 0.14, rTuck: 0.0 },
  walk3:   { bodyY: 0.01,  neckSway: -0.02, neckDip: 0.0,  lSwing: -0.16, lLift: 0.0,  rSwing: 0.24,  rLift: 0.22, rTuck: 0.0 },
  walk4:   { bodyY: 0.03,  neckSway: -0.01, neckDip: 0.0,  lSwing: -0.08, lLift: 0.0,  rSwing: 0.14,  rLift: 0.06, rTuck: 0.0 },
  walk5:   { bodyY: 0.00,  neckSway: 0.00,  neckDip: 0.0,  lSwing: 0.06,  lLift: 0.14, rSwing: -0.04, rLift: 0.0,  rTuck: 0.0 },

  dip0:    { bodyY: -0.02, neckSway: 0.00,  neckDip: 0.48, lSwing: 0.04,  lLift: 0.0,  rSwing: -0.04, rLift: 0.0,  rTuck: 0.0 },
  dip1:    { bodyY: -0.04, neckSway: 0.02,  neckDip: 1.00, lSwing: 0.04,  lLift: 0.0,  rSwing: -0.04, rLift: 0.0,  rTuck: 0.0 },
  dip2:    { bodyY: -0.02, neckSway: -0.02, neckDip: 0.62, lSwing: 0.04,  lLift: 0.0,  rSwing: -0.04, rLift: 0.0,  rTuck: 0.0 },
};

const FLAMINGO_IDLE: readonly FlamingoPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const FLAMINGO_ONELEG: readonly FlamingoPoseName[] = ['oneleg0', 'oneleg1', 'oneleg0', 'oneleg2'];
const FLAMINGO_WALK: readonly FlamingoPoseName[] = ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'];
const FLAMINGO_DIP: readonly FlamingoPoseName[] = ['dip0', 'dip1', 'dip2'];

const flamingoCache = new Map<FlamingoPoseName, Boar27Pack>();

 function buildFlamingoPosePack(pose: FlamingoPoseName): Boar27Pack {
  let pack = flamingoCache.get(pose);
  if (!pack) {
    const P = FLAMINGO_POSES[pose];
    const by = 0.10 + P.bodyY;
    const dip = P.neckDip;

    // Graceful S-curved neck control points (upright vs dipped filter-feeding)
    const n0y = by + 0.06;
    const n0z = 0.22;

    const n1y = by + 0.28 * (1 - dip) - 0.16 * dip;
    const n1z = 0.30 + dip * 0.14;

    const n2y = by + 0.56 * (1 - dip) - 0.52 * dip;
    const n2z = 0.14 + dip * 0.30;

    const hy = by + 0.74 * (1 - dip) - 0.78 * dip;
    const hz = 0.26 + dip * 0.16;
    const hx = P.neckSway;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // 1. Plump teardrop coral-pink body + tapered tail
      const torso = sdEllipsoid(x, y, z, 0, by, 0.0, 0.19, 0.17, 0.30);
      const breast = sdEllipsoid(x, y, z, 0, by + 0.02, 0.16, 0.155, 0.145, 0.16);
      const tail = sdCapsule(x, y, z, 0, by + 0.01, -0.22, 0, by - 0.09, -0.42, 0.11, 0.032);
      let body = smin(smin(torso, breast, 0.07), tail, 0.06);

      // 2. Smooth layered folded wings (darker rose-crimson coverts, NO dark seam!)
      const wingL = sdEllipsoid(x, y, z, -0.155, by + 0.02, -0.04, 0.075, 0.125, 0.26);
      const wingR = sdEllipsoid(x, y, z,  0.155, by + 0.02, -0.04, 0.075, 0.125, 0.26);
      const wings = Math.min(wingL, wingR);
      body = smin(body, wings, 0.055);

      // 3. Long slender graceful S-curved pink neck
      const neck1 = sdCapsule(x, y, z, 0, n0y, n0z, hx * 0.3, n1y, n1z, 0.072, 0.052);
      const neck2 = sdCapsule(x, y, z, hx * 0.3, n1y, n1z, hx * 0.7, n2y, n2z, 0.050, 0.044);
      const neck3 = sdCapsule(x, y, z, hx * 0.7, n2y, n2z, hx, hy - 0.02, hz - 0.02, 0.044, 0.046);
      const neck = smin(smin(neck1, neck2, 0.045), neck3, 0.045);

      // 4. Small refined flamingo head
      const head = sdEllipsoid(x, y, z, hx, hy, hz, 0.078, 0.076, 0.096);
      body = smin(body, smin(neck, head, 0.032), 0.05);

      // 5. Unmistakable downward-bent flamingo bill (white/blush base + jet-black bent tip)
      const billDirZ = 1 - dip * 0.6;
      const billBaseEndY = hy - 0.015 - dip * 0.02;
      const billBaseEndZ = hz + 0.145 * billDirZ;
      const billBase = sdCapsule(x, y, z, hx, hy - 0.005, hz + 0.065, hx, billBaseEndY, billBaseEndZ, 0.038, 0.030);

      const billTipEndY = billBaseEndY - 0.105 * (1 - dip * 0.3);
      const billTipEndZ = billBaseEndZ + 0.028;
      const billTip = sdCapsule(x, y, z, hx, billBaseEndY, billBaseEndZ, hx, billTipEndY, billTipEndZ, 0.028, 0.011);

      // 6. Long slender stilt-like pink legs with distinct ankle/knee joints & webbed feet
      let legs = 99;
      for (let side = -1; side <= 1; side += 2) {
        const isRight = side > 0;
        const hipX = side * 0.072;
        const hipY = by - 0.12;
        const hipZ = -0.02;

        if (isRight && P.rTuck > 0.5) {
          // Iconic flamingo one-leg balance: right leg bent sharply upward & tucked under belly!
          const kneeX = side * 0.088;
          const kneeY = by - 0.36;
          const kneeZ = -0.10;
          const footX = side * 0.055;
          const footY = by - 0.16;
          const footZ = 0.04;
          const upper = sdCapsule(x, y, z, hipX, hipY, hipZ, kneeX, kneeY, kneeZ, 0.026, 0.020);
          const joint = sdEllipsoid(x, y, z, kneeX, kneeY, kneeZ, 0.028, 0.026, 0.028);
          const lower = sdCapsule(x, y, z, kneeX, kneeY, kneeZ, footX, footY, footZ, 0.019, 0.016);
          const web = sdEllipsoid(x, y, z, footX, footY, footZ + 0.02, 0.032, 0.016, 0.042);
          legs = Math.min(legs, smin(smin(smin(upper, joint, 0.014), lower, 0.014), web, 0.012));
        } else {
          const swing = isRight ? P.rSwing : P.lSwing;
          const lift = isRight ? P.rLift : P.lLift;
          const kneeX = side * 0.075;
          const kneeY = -0.34 + by * 0.35 + lift * 0.20;
          const kneeZ = -0.06 + swing * 0.45;
          const footX = side * 0.072;
          const footY = -0.94 + lift * 0.28;
          const footZ = 0.00 + swing;

          const upper = sdCapsule(x, y, z, hipX, hipY, hipZ, kneeX, kneeY, kneeZ, 0.026, 0.019);
          const joint = sdEllipsoid(x, y, z, kneeX, kneeY, kneeZ, 0.027, 0.025, 0.027);
          const lower = sdCapsule(x, y, z, kneeX, kneeY, kneeZ, footX, footY, footZ, 0.019, 0.016);
          const web = sdEllipsoid(x, y, z, footX, footY, footZ + 0.05, 0.044, 0.016, 0.068);
          legs = Math.min(legs, smin(smin(smin(upper, joint, 0.014), lower, 0.014), web, 0.012));
        }
      }

      // 7. Piercing pale-yellow eyes
      const eyeL = sdEllipsoid(x, y, z, hx - 0.062, hy + 0.016, hz + 0.032, 0.021, 0.021, 0.021);
      const eyeR = sdEllipsoid(x, y, z, hx + 0.062, hy + 0.016, hz + 0.032, 0.021, 0.021, 0.021);
      const eyes = Math.min(eyeL, eyeR);

      let d = body;
      let mat = 'body';
      if (wings < body + 0.012 && Math.abs(x) > 0.115 && z < 0.16 && z > -0.28) mat = 'wing';
      if (legs < d) { d = legs; mat = 'leg'; }
      if (billBase < d) { d = billBase; mat = 'billBase'; }
      if (billTip < d) { d = billTip; mat = 'billTip'; }
      if (eyes < d) { d = eyes; mat = 'eye'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, _x, y, z) => {
      if (mat === 'billTip') return 'k';
      if (mat === 'billBase') return shade > 0.35 ? 'W' : 'p4';
      if (mat === 'eye') {
        const dz = z - (hz + 0.040);
        const dy = y - (hy + 0.016);
        if (dz * dz + dy * dy < 0.00014) return 'k';
        return 'e';
      }
      if (mat === 'leg') return shade > 0.42 ? 'l1' : 'l0';
      if (mat === 'wing') {
        // Richer rose-crimson folded wing coverts
        return shade > 0.74 ? 'p3' : shade > 0.46 ? 'p2' : shade > 0.22 ? 'p1' : 'p0';
      }
      // Vibrant coral-pink body & graceful S-curved neck
      return shade > 0.78 ? 'p4' : shade > 0.56 ? 'p3' : shade > 0.34 ? 'p2' : shade > 0.16 ? 'p1' : 'p0';
    };

    pack = build27Pack(FLAMINGO_PW, FLAMINGO_PH, 0.72, 1.10, FLAMINGO_PAL, evalFn, shadeFn);
    flamingoCache.set(pose, pack);
  }
  return pack;
}

export function getFlamingoPosePack(...args: Parameters<typeof buildFlamingoPosePack>): ReturnType<typeof buildFlamingoPosePack> {
  return registerAnimalSpritePack(buildFlamingoPosePack(...args), { module: './Flamingo.ts', factory: 'getFlamingoPosePack', args }, buildFlamingoPosePack);
}

/**
 * Greater Flamingo: wades gracefully near the pond, dips to filter-feed,
 * and occasionally balances on one leg.
 */
export class Flamingo extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private readonly home = new THREE.Vector3();
  private readonly pondCenter = new THREE.Vector3();
  private state: 'idle' | 'oneleg' | 'walk' | 'dip' = 'idle';
  private stateT = 0;
  private stateDur = rand(2.0, 4.0);
  private targetYaw = rand(0, Math.PI * 2);
  private gaitPhase = rand(0, Math.PI * 2);

  constructor(ctx: GameContext, pos: THREE.Vector3, pondCenter?: THREE.Vector3) {
    super(ctx, getFlamingoPosePack('idle0').getView(2, 0)!, FLAMINGO_PW, FLAMINGO_PH, FLAMINGO_W, FLAMINGO_H, 'FlamingoBillboard');
    this.hp = 35;
    this.maxHp = 35;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.30;
    this.motor.height = 1.10;
    this.motor.teleport(pos);
    this.home.copy(pos);
    this.pondCenter.copy(pondCenter ?? pos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.36, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.set(this.position.x, this.position.y + 0.56, this.position.z);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y + 0.25, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.90, this.position.z);
    this.hurtboxes[0].enabled = this.alive;
    this.stickRoot.position.set(this.position.x, this.position.y + 0.56, this.position.z);
    this.stickRoot.rotation.y = this.facing;
  }

  receiveHit(hit: HitInfo): HitResult {
    const res = emptyResult('flesh');
    if (!this.alive) { res.ignored = true; return res; }
    this.hp = Math.max(0, this.hp - hit.damage);
    res.damage = hit.damage;
    this.flash = 1.0;
    this.vel.x += hit.dir.x * 3.8;
    this.vel.z += hit.dir.z * 3.8;
    this.vel.y = 2.6;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.state = 'walk';
      this.stateT = 0;
      this.stateDur = 2.4;
      this.targetYaw = Math.atan2(hit.dir.x, hit.dir.z);
    }
    return res;
  }

  update(dt: number, _target: EnemyTarget | null, camera: THREE.Camera, drawingBufferSize?: THREE.Vector2) {
    if (dt > 0) {
      this.stateT += dt;
      this.flash = Math.max(0, this.flash - dt * 4.5);

      if (!this.alive) {
        this.deadT += dt;
        this.vel.x = damp(this.vel.x, 0, 5, dt);
        this.vel.z = damp(this.vel.z, 0, 5, dt);
        this.vel.y -= 18 * dt;
        this.motor.update(dt);
      } else {
        let speed = 0;

        if (this.state === 'idle' || this.state === 'oneleg' || this.state === 'dip') {
          if (this.stateT >= this.stateDur) {
            const r = Math.random();
            if (r < 0.42) {
              this.state = 'walk';
              this.stateDur = rand(2.2, 4.0);
              const toPond = Math.hypot(this.pondCenter.x - this.position.x, this.pondCenter.z - this.position.z);
              this.targetYaw = toPond > 6.5
                ? Math.atan2(this.pondCenter.x - this.position.x, this.pondCenter.z - this.position.z) + rand(-0.6, 0.6)
                : this.facing + rand(-1.6, 1.6);
            } else if (r < 0.72) {
              this.state = 'oneleg';
              this.stateDur = rand(2.8, 5.2);
            } else {
              this.state = 'dip';
              this.stateDur = rand(1.8, 3.2);
            }
            this.stateT = 0;
          }
        } else if (this.state === 'walk') {
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 4.5);
          speed = 1.25;
          if (this.stateT >= this.stateDur) {
            const r = Math.random();
            this.state = r < 0.45 ? 'oneleg' : r < 0.75 ? 'dip' : 'idle';
            this.stateT = 0;
            this.stateDur = rand(2.2, 4.5);
          }
        }

        this.vel.x = damp(this.vel.x, Math.sin(this.facing) * speed, 7, dt);
        this.vel.z = damp(this.vel.z, Math.cos(this.facing) * speed, 7, dt);
        this.vel.y -= 18 * dt;
        this.motor.update(dt);

        const horiz = Math.hypot(this.vel.x, this.vel.z);
        if (horiz > 0.15 && this.motor.grounded) {
          this.gaitPhase += dt * 4.8 * (0.7 + horiz * 0.25);
        }
      }
      this.syncHurtbox();
    }

    let pose: FlamingoPoseName;
    if (!this.alive) pose = 'idle0';
    else if (this.state === 'walk') pose = pickCycle(FLAMINGO_WALK, (this.gaitPhase / Math.PI) * 3.0);
    else if (this.state === 'oneleg') pose = pickCycle(FLAMINGO_ONELEG, this.stateT * 1.6);
    else if (this.state === 'dip') pose = pickCycle(FLAMINGO_DIP, this.stateT * 2.2);
    else pose = pickCycle(FLAMINGO_IDLE, this.stateT * 1.8);

    const deathSink = this.alive ? 0 : Math.min(0.45, this.deadT * 0.55);
    this.renderBillboard(getFlamingoPosePack(pose), this.position.y + 0.56 - deathSink, camera, drawingBufferSize);
  }
}
