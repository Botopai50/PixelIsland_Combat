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
// CHIMPANZÉ (Chimpanzee) — 48×48 @ 56 PPU (0.86m × 0.86m)
// ============================================================================
export type ChimpanzeePoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'walk0' | 'walk1' | 'walk2' | 'walk3' | 'walk4' | 'walk5'
  | 'hoot0' | 'hoot1' | 'hoot2'
  | 'leap0' | 'leap1' | 'leap2' | 'leap3';

export const CHIMP_PW = 48;
export const CHIMP_PH = 48;
export const CHIMP_W = CHIMP_PW / ANIMAL_PPU;
export const CHIMP_H = CHIMP_PH / ANIMAL_PPU;

const CHIMP_PAL: Record<string, [number, number, number]> = {
  k:  [0x10, 0x10, 0x14], // crisp 1px dark outline / glossy eyes / nostrils
  b0: [0x1a, 0x1b, 0x24], // deep charcoal-black fur shadow
  b1: [0x2a, 0x2c, 0x38], // glossy charcoal-black fur base
  b2: [0x3f, 0x43, 0x54], // cool slate-black muscle midtone
  b3: [0x5a, 0x60, 0x74], // sleek slate highlight
  b4: [0x78, 0x80, 0x98], // crisp top rim sheen
  s0: [0xa6, 0x74, 0x56], // warm tan-peach skin shadow (face/ears/hands)
  s1: [0xd4, 0x9c, 0x79], // warm tan-peach skin midtone
  s2: [0xed, 0xbd, 0x9b], // bright pale-peach highlight
  m:  [0x80, 0x22, 0x32], // open hooting mouth interior
  W:  [0xf8, 0xf6, 0xf0], // eye glint & teeth
};

interface ChimpPose {
  bodyY: number;
  standUp: number;
  headY: number;
  headZ: number;
  headPitch: number;
  jawOpen: number;
  flSwing: number;
  flLift: number;
  frSwing: number;
  frLift: number;
  blSwing: number;
  blLift: number;
  brSwing: number;
  brLift: number;
}

const CHIMP_POSES: Record<ChimpanzeePoseName, ChimpPose> = {
  // Relaxed crouched ape stance
  idle0: {
    bodyY: 0.0, standUp: 0.0, headY: 0.0, headZ: 0.0, headPitch: 0.02, jawOpen: 0.0,
    flSwing: 0.02, flLift: 0.0, frSwing: -0.02, frLift: 0.0,
    blSwing: -0.02, blLift: 0.0, brSwing: 0.02, brLift: 0.0,
  },
  idle1: {
    bodyY: 0.015, standUp: 0.04, headY: 0.02, headZ: 0.01, headPitch: 0.07, jawOpen: 0.0,
    flSwing: 0.02, flLift: 0.0, frSwing: -0.02, frLift: 0.0,
    blSwing: -0.02, blLift: 0.0, brSwing: 0.02, brLift: 0.0,
  },
  idle2: {
    bodyY: -0.01, standUp: 0.0, headY: -0.01, headZ: 0.015, headPitch: -0.04, jawOpen: 0.08,
    flSwing: 0.02, flLift: 0.0, frSwing: -0.02, frLift: 0.0,
    blSwing: -0.02, blLift: 0.0, brSwing: 0.02, brLift: 0.0,
  },

  // 6-frame nimble knuckle-walk
  walk0: {
    bodyY: 0.0, standUp: 0.0, headY: -0.01, headZ: 0.03, headPitch: -0.02, jawOpen: 0.0,
    flSwing: 0.24, flLift: 0.14, frSwing: -0.18, frLift: 0.0,
    blSwing: -0.18, blLift: 0.0, brSwing: 0.20, brLift: 0.12,
  },
  walk1: {
    bodyY: 0.02, standUp: 0.0, headY: 0.0, headZ: 0.04, headPitch: 0.0, jawOpen: 0.0,
    flSwing: 0.12, flLift: 0.04, frSwing: -0.06, frLift: 0.08,
    blSwing: -0.06, blLift: 0.08, brSwing: 0.10, brLift: 0.04,
  },
  walk2: {
    bodyY: -0.015, standUp: 0.0, headY: -0.02, headZ: 0.03, headPitch: -0.03, jawOpen: 0.0,
    flSwing: -0.05, flLift: 0.0, frSwing: 0.12, frLift: 0.16,
    blSwing: 0.08, blLift: 0.14, brSwing: -0.05, brLift: 0.0,
  },
  walk3: {
    bodyY: 0.0, standUp: 0.0, headY: -0.01, headZ: 0.03, headPitch: -0.02, jawOpen: 0.0,
    flSwing: -0.18, flLift: 0.0, frSwing: 0.24, frLift: 0.14,
    blSwing: 0.20, blLift: 0.12, brSwing: -0.18, brLift: 0.0,
  },
  walk4: {
    bodyY: 0.02, standUp: 0.0, headY: 0.0, headZ: 0.04, headPitch: 0.0, jawOpen: 0.0,
    flSwing: -0.06, flLift: 0.08, frSwing: 0.12, frLift: 0.04,
    blSwing: 0.10, blLift: 0.04, brSwing: -0.06, brLift: 0.08,
  },
  walk5: {
    bodyY: -0.015, standUp: 0.0, headY: -0.02, headZ: 0.03, headPitch: -0.03, jawOpen: 0.0,
    flSwing: 0.12, flLift: 0.16, frSwing: -0.05, frLift: 0.0,
    blSwing: -0.05, blLift: 0.0, brSwing: 0.08, brLift: 0.14,
  },

  // 3-frame standing upright hooting with arms raised!
  hoot0: {
    bodyY: 0.04, standUp: 0.45, headY: 0.06, headZ: -0.05, headPitch: 0.12, jawOpen: 0.55,
    flSwing: 0.18, flLift: 0.50, frSwing: 0.16, frLift: 0.48,
    blSwing: 0.04, blLift: 0.0, brSwing: 0.04, brLift: 0.0,
  },
  hoot1: {
    bodyY: 0.08, standUp: 0.85, headY: 0.12, headZ: -0.10, headPitch: 0.22, jawOpen: 1.0,
    flSwing: 0.22, flLift: 0.88, frSwing: 0.22, frLift: 0.86,
    blSwing: 0.08, blLift: 0.0, brSwing: 0.08, brLift: 0.0,
  },
  hoot2: {
    bodyY: 0.06, standUp: 0.78, headY: 0.10, headZ: -0.09, headPitch: 0.16, jawOpen: 0.82,
    flSwing: 0.26, flLift: 0.80, frSwing: 0.18, frLift: 0.88,
    blSwing: 0.08, blLift: 0.0, brSwing: 0.08, brLift: 0.0,
  },

  // 4-frame agile ape leap
  leap0: {
    bodyY: -0.10, standUp: 0.0, headY: -0.08, headZ: 0.05, headPitch: -0.06, jawOpen: 0.20,
    flSwing: 0.14, flLift: 0.0, frSwing: 0.10, frLift: 0.0,
    blSwing: 0.16, blLift: 0.0, brSwing: 0.12, brLift: 0.0,
  },
  leap1: {
    bodyY: 0.06, standUp: 0.20, headY: 0.02, headZ: 0.08, headPitch: 0.04, jawOpen: 0.45,
    flSwing: 0.36, flLift: 0.56, frSwing: 0.30, frLift: 0.48,
    blSwing: -0.28, blLift: 0.22, brSwing: -0.24, brLift: 0.18,
  },
  leap2: {
    bodyY: 0.04, standUp: 0.15, headY: 0.0, headZ: 0.10, headPitch: 0.0, jawOpen: 0.35,
    flSwing: 0.42, flLift: 0.50, frSwing: 0.36, frLift: 0.44,
    blSwing: -0.32, blLift: 0.28, brSwing: -0.28, brLift: 0.24,
  },
  leap3: {
    bodyY: -0.05, standUp: 0.0, headY: -0.05, headZ: 0.05, headPitch: -0.06, jawOpen: 0.10,
    flSwing: 0.24, flLift: 0.04, frSwing: 0.18, frLift: 0.02,
    blSwing: -0.10, blLift: 0.14, brSwing: -0.06, brLift: 0.10,
  },
};

const chimpCache = new Map<ChimpanzeePoseName, Boar27Pack>();
 function buildChimpanzeePosePack(pose: ChimpanzeePoseName): Boar27Pack {
  let pack = chimpCache.get(pose);
  if (!pack) {
    const P = CHIMP_POSES[pose];
    const by = P.bodyY;
    const su = P.standUp;
    const hPivotY = 0.24 + by + P.headY + su * 0.26;
    const hPivotZ = 0.26 + P.headZ - su * 0.22;
    const cosP = Math.cos(P.headPitch);
    const sinP = Math.sin(P.headPitch);
    const jawDrop = P.jawOpen * 0.09;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // 1. Lean, athletic chimpanzee torso (NO silver back, NO tail!)
      const chest = sdEllipsoid(x, y, z, 0, 0.06 + by + su * 0.18, 0.10 - su * 0.12, 0.175, 0.175, 0.195);
      const belly = sdEllipsoid(x, y, z, 0, -0.01 + by + su * 0.07, -0.08 - su * 0.05, 0.158, 0.162, 0.185);
      const hips = sdEllipsoid(x, y, z, 0, -0.05 + by, -0.22, 0.160, 0.155, 0.165);

      let fur = smin(chest, belly, 0.08);
      fur = smin(fur, hips, 0.08);

      // 2. Expressive chimpanzee head with LARGE prominent rounded pale-tan ears!
      const dy = y - hPivotY;
      const dz = z - hPivotZ;
      const lx = x;
      const lz = dz * cosP + dy * sinP;
      const ly = -dz * sinP + dy * cosP;

      const skull = sdEllipsoid(lx, ly, lz, 0, 0.02, -0.01, 0.132, 0.132, 0.138);
      const faceMask = sdEllipsoid(lx, ly, lz, 0, 0.0, 0.075, 0.108, 0.102, 0.082);
      const muzzle = sdEllipsoid(lx, ly, lz, 0, -0.042, 0.145, 0.074, 0.062 + jawDrop * 0.4, 0.075);

      // Large prominent rounded pale-tan/peach ears sticking out from both sides!
      const earL = sdEllipsoid(lx, ly, lz, -0.158, 0.025, 0.0, 0.058, 0.068, 0.028);
      const earR = sdEllipsoid(lx, ly, lz,  0.158, 0.025, 0.0, 0.058, 0.068, 0.028);
      const ears = Math.min(earL, earR);

      let headD = smin(skull, faceMask, 0.035);
      headD = smin(headD, muzzle, 0.03);
      fur = smin(fur, headD, 0.05);

      // 3. Long nimble arms (for knuckle-walking or raised when hooting!) & athletic legs
      let skinHands = 99;
      const arm = (sx: number, swing: number, lift: number) => {
        const shY = 0.08 + by + su * 0.18;
        const shZ = 0.14 - su * 0.12;
        const elY = -0.20 + by * 0.4 + lift * 0.38 + su * 0.22;
        const elZ = 0.14 + swing * 0.42 - su * 0.06;
        const hdY = -0.50 + lift * 0.88 + su * 0.18;
        const hdZ = 0.20 + swing * 0.90 - su * 0.04;
        const upper = sdCapsule(x, y, z, sx, shY, shZ, sx * 1.12, elY, elZ, 0.068, 0.052);
        const lower = sdCapsule(x, y, z, sx * 1.12, elY, elZ, sx * 1.06, hdY, hdZ, 0.050, 0.040);
        const hand = sdEllipsoid(x, y, z, sx * 1.06, hdY - 0.01, hdZ + 0.035, 0.052, 0.036, 0.064);
        skinHands = Math.min(skinHands, hand);
        return smin(smin(upper, lower, 0.028), hand, 0.022);
      };
      const leg = (sx: number, swing: number, lift: number) => {
        const hipY = -0.06 + by;
        const hipZ = -0.20;
        const knY = -0.28 + by * 0.45 + lift * 0.18;
        const knZ = -0.14 + swing * 0.36;
        const ftY = -0.50 + lift * 0.28;
        const ftZ = -0.20 + swing * 0.84;
        const upper = sdCapsule(x, y, z, sx, hipY, hipZ, sx, knY, knZ, 0.074, 0.052);
        const lower = sdCapsule(x, y, z, sx, knY, knZ, sx, ftY, ftZ, 0.050, 0.040);
        const foot = sdEllipsoid(x, y, z, sx, ftY - 0.01, ftZ + 0.042, 0.052, 0.032, 0.072);
        skinHands = Math.min(skinHands, foot);
        return smin(smin(upper, lower, 0.028), foot, 0.022);
      };

      const limbs = Math.min(
        Math.min(arm(-0.165, P.flSwing, P.flLift), arm(0.165, P.frSwing, P.frLift)),
        Math.min(leg(-0.135, P.blSwing, P.blLift), leg(0.135, P.brSwing, P.brLift)),
      );
      fur = smin(fur, limbs, 0.04);

      // 4. Expressive dark eyes & open hooting mouth
      const eyeL = sdEllipsoid(lx, ly, lz, -0.050, 0.036, 0.135, 0.024, 0.022, 0.024);
      const eyeR = sdEllipsoid(lx, ly, lz,  0.050, 0.036, 0.135, 0.024, 0.022, 0.024);
      const eyes = Math.min(eyeL, eyeR);

      let mouth = 99;
      if (P.jawOpen > 0.2) {
        mouth = sdEllipsoid(lx, ly, lz, 0, -0.055 - jawDrop * 0.3, 0.195, 0.038, 0.024 + jawDrop * 0.45, 0.042);
      }

      let d = fur, mat = 'fur';
      if (ears < d) { d = ears; mat = 'skin'; }
      if (skinHands < fur + 0.006 && (y < -0.42 || P.flLift > 0.45)) mat = 'skin';
      if ((faceMask < fur + 0.006 || muzzle < fur + 0.006) && lz > 0.065 && ly < 0.075) mat = 'skin';
      if (mouth < d) { d = mouth; mat = 'mouth'; }
      if (eyes < d) { d = eyes; mat = 'eye'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'mouth') return 'm';
      if (mat === 'eye') {
        const dy = y - hPivotY;
        const dz = z - hPivotZ;
        const ly = -dz * sinP + dy * cosP;
        if (ly > 0.044 && Math.abs(x) > 0.044) return 'W';
        return 'k';
      }
      if (mat === 'skin') {
        return shade > 0.68 ? 's2' : shade > 0.36 ? 's1' : 's0';
      }
      // Glossy charcoal-black chimpanzee fur with cool slate highlights
      if (shade > 0.84) return 'b4';
      return shade > 0.62 ? 'b3' : shade > 0.38 ? 'b2' : shade > 0.20 ? 'b1' : 'b0';
    };

    pack = build27Pack(CHIMP_PW, CHIMP_PH, 0.96, 0.96, CHIMP_PAL, evalFn, shadeFn);
    chimpCache.set(pose, pack);
  }
  return pack;
}

export function getChimpanzeePosePack(...args: Parameters<typeof buildChimpanzeePosePack>): ReturnType<typeof buildChimpanzeePosePack> {
  return registerAnimalSpritePack(buildChimpanzeePosePack(...args), { module: './Chimpanzee.ts', factory: 'getChimpanzeePosePack', args }, buildChimpanzeePosePack);
}

// ============================================================================
// INSTÂNCIA NA ARENA (Chimpanzee)
// ============================================================================
const CHIMP_IDLE: readonly ChimpanzeePoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const CHIMP_WALK: readonly ChimpanzeePoseName[] = ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'];
const CHIMP_HOOT: readonly ChimpanzeePoseName[] = ['hoot0', 'hoot1', 'hoot2', 'hoot1'];
const CHIMP_LEAP: readonly ChimpanzeePoseName[] = ['leap0', 'leap1', 'leap2', 'leap3'];

/**
 * Chimpanzee: knuckle-walks nimbly, stands upright hooting with raised arms, and leaps playfully.
 */
export class Chimpanzee extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private readonly home = new THREE.Vector3();
  private state: 'idle' | 'walk' | 'hoot' | 'leap' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.4, 2.6);
  private targetYaw = rand(0, Math.PI * 2);
  private gaitPhase = rand(0, Math.PI * 2);

  constructor(ctx: GameContext, pos: THREE.Vector3) {
    super(ctx, getChimpanzeePosePack('idle0').getView(2, 0)!, CHIMP_PW, CHIMP_PH, CHIMP_W, CHIMP_H, 'ChimpanzeeBillboard');
    this.hp = 65;
    this.maxHp = 65;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.38;
    this.motor.height = 0.80;
    this.motor.teleport(pos);
    this.home.copy(pos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.42, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.set(this.position.x, this.position.y + 0.40, this.position.z);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y + 0.18, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.62, this.position.z);
    this.hurtboxes[0].enabled = this.alive;
    this.stickRoot.position.set(this.position.x, this.position.y + 0.40, this.position.z);
    this.stickRoot.rotation.y = this.facing;
  }

  receiveHit(hit: HitInfo): HitResult {
    const res = emptyResult('flesh');
    if (!this.alive) { res.ignored = true; return res; }
    this.hp = Math.max(0, this.hp - hit.damage);
    res.damage = hit.damage;
    this.flash = 1.0;
    this.vel.x += hit.dir.x * 4.2;
    this.vel.z += hit.dir.z * 4.2;
    this.vel.y = 3.2;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.state = 'leap';
      this.stateT = 0;
      this.stateDur = 1.4;
      this.targetYaw = Math.atan2(hit.dir.x, hit.dir.z);
    }
    return res;
  }

  update(dt: number, target: EnemyTarget | null, camera: THREE.Camera, drawingBufferSize?: THREE.Vector2) {
    if (dt > 0) {
      this.stateT += dt;
      this.flash = Math.max(0, this.flash - dt * 4.5);

      if (!this.alive) {
        this.deadT += dt;
        this.vel.x = damp(this.vel.x, 0, 6, dt);
        this.vel.z = damp(this.vel.z, 0, 6, dt);
        this.vel.y -= 20 * dt;
        this.motor.update(dt);
      } else {
        const dist = target && target.alive
          ? Math.hypot(target.position.x - this.position.x, target.position.z - this.position.z)
          : 999;

        let speed = 0;
        if (dist < 2.4 && this.state !== 'leap') {
          this.state = 'leap';
          this.stateT = 0;
          this.stateDur = 1.2;
          if (target) {
            this.targetYaw = Math.atan2(this.position.x - target.position.x, this.position.z - target.position.z);
          }
          if (this.motor.grounded) this.vel.y = 4.2;
        } else if (dist < 4.5 && dist >= 2.4 && this.state === 'idle' && this.stateT > 0.6) {
          this.state = 'hoot';
          this.stateT = 0;
          this.stateDur = 1.5;
        }

        if (this.state === 'idle') {
          if (this.stateT >= this.stateDur) {
            this.state = Math.random() < 0.68 ? 'walk' : 'hoot';
            this.stateT = 0;
            this.stateDur = this.state === 'hoot' ? rand(1.2, 1.8) : rand(2.0, 3.6);
            const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
            this.targetYaw = toHome > 8.0
              ? Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.5, 0.5)
              : this.facing + rand(-1.6, 1.6);
          }
        } else if (this.state === 'walk') {
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 6.5);
          speed = 2.4;
          if (this.stateT >= this.stateDur) {
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.2, 2.4);
          }
        } else if (this.state === 'hoot') {
          if (target && target.alive && dist < 6.0) {
            const toPlayer = Math.atan2(target.position.x - this.position.x, target.position.z - this.position.z);
            this.facing += angleDiff(this.facing, toPlayer) * Math.min(1, dt * 8);
          }
          if (this.stateT >= this.stateDur) {
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.0, 2.0);
          }
        } else if (this.state === 'leap') {
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 10);
          speed = 4.6;
          if (this.stateT >= this.stateDur && this.motor.grounded) {
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.0, 2.0);
          }
        }

        this.vel.x = damp(this.vel.x, Math.sin(this.facing) * speed, 9, dt);
        this.vel.z = damp(this.vel.z, Math.cos(this.facing) * speed, 9, dt);
        this.vel.y -= 20 * dt;
        this.motor.update(dt);

        const horiz = Math.hypot(this.vel.x, this.vel.z);
        if (horiz > 0.2 && this.motor.grounded) {
          this.gaitPhase += dt * 6.8 * (0.65 + horiz * 0.22);
        }
      }
      this.syncHurtbox();
    }

    let pose: ChimpanzeePoseName;
    if (!this.alive) pose = 'idle0';
    else if (this.state === 'leap' || !this.motor.grounded) {
      pose = pickCycle(CHIMP_LEAP, this.stateT * 4.5);
    } else if (this.state === 'hoot') pose = pickCycle(CHIMP_HOOT, this.stateT * 3.8);
    else if (this.state === 'walk') pose = pickCycle(CHIMP_WALK, (this.gaitPhase / Math.PI) * 2.8);
    else pose = pickCycle(CHIMP_IDLE, this.stateT * 2.0);

    const bob = this.alive && this.motor.grounded && this.state === 'walk'
      ? Math.abs(Math.sin(this.gaitPhase)) * 0.028
      : 0;
    const deathSink = this.alive ? 0 : Math.min(0.20, this.deadT * 0.4);
    this.renderBillboard(getChimpanzeePosePack(pose), this.position.y + 0.40 + bob - deathSink, camera, drawingBufferSize);
  }
}
