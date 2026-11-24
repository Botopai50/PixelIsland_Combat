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
// URSO POLAR (Polar Bear) — 72×60 @ 56 PPU (1.29m × 1.07m)
// ============================================================================
export type PolarBearPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'walk0' | 'walk1' | 'walk2' | 'walk3' | 'walk4' | 'walk5'
  | 'rear0' | 'rear1' | 'rear2' | 'rear3'
  | 'swipe0' | 'swipe1' | 'swipe2' | 'swipe3';

export const POLAR_BEAR_PW = 72;
export const POLAR_BEAR_PH = 60;
export const POLAR_BEAR_W = POLAR_BEAR_PW / ANIMAL_PPU;
export const POLAR_BEAR_H = POLAR_BEAR_PH / ANIMAL_PPU;

const POLAR_BEAR_PAL: Record<string, [number, number, number]> = {
  k:  [0x15, 0x1a, 0x24], // crisp 1px dark outline / jet-black nose, lips, eyes & claws
  w0: [0x87, 0x9b, 0xb5], // cool glacier blue-grey deep shadow
  w1: [0xb2, 0xc3, 0xd9], // pale ice-blue shadow
  w2: [0xd8, 0xe1, 0xeb], // cool snow-white midtone
  w3: [0xef, 0xf2, 0xf5], // crisp snow-white fur
  w4: [0xff, 0xfd, 0xf7], // sunlit ivory-white top rim highlight
  c0: [0xe6, 0xdf, 0xce], // subtle warm-cream undercoat
  m:  [0x80, 0x22, 0x30], // mouth interior on roar/swipe
  W:  [0xfc, 0xfc, 0xf8], // fangs & eye glint
};

interface PolarBearPose {
  bodyY: number;
  rearUp: number;
  headY: number;
  headZ: number;
  headPitch: number;
  jawOpen: number;
  flSwing: number;
  flLift: number;
  frSwing: number;
  frLift: number;
  frSwipeX: number;
  blSwing: number;
  blLift: number;
  brSwing: number;
  brLift: number;
}

const POLAR_BEAR_POSES: Record<PolarBearPoseName, PolarBearPose> = {
  // Calm Arctic breathing
  idle0: {
    bodyY: 0.0, rearUp: 0.0, headY: 0.0, headZ: 0.0, headPitch: 0.0, jawOpen: 0.0,
    flSwing: 0.02, flLift: 0.0, frSwing: -0.02, frLift: 0.0, frSwipeX: 0.0,
    blSwing: -0.02, blLift: 0.0, brSwing: 0.02, brLift: 0.0,
  },
  idle1: {
    bodyY: 0.016, rearUp: 0.0, headY: 0.02, headZ: 0.015, headPitch: 0.05, jawOpen: 0.0,
    flSwing: 0.02, flLift: 0.0, frSwing: -0.02, frLift: 0.0, frSwipeX: 0.0,
    blSwing: -0.02, blLift: 0.0, brSwing: 0.02, brLift: 0.0,
  },
  idle2: {
    bodyY: -0.012, rearUp: 0.0, headY: -0.015, headZ: 0.02, headPitch: -0.04, jawOpen: 0.0,
    flSwing: 0.02, flLift: 0.0, frSwing: -0.02, frLift: 0.0, frSwipeX: 0.0,
    blSwing: -0.02, blLift: 0.0, brSwing: 0.02, brLift: 0.0,
  },

  // 6-frame heavy lumbering Arctic stride
  walk0: {
    bodyY: 0.0, rearUp: 0.0, headY: -0.01, headZ: 0.03, headPitch: -0.03, jawOpen: 0.0,
    flSwing: 0.22, flLift: 0.14, frSwing: -0.18, frLift: 0.0, frSwipeX: 0.0,
    blSwing: -0.18, blLift: 0.0, brSwing: 0.20, brLift: 0.12,
  },
  walk1: {
    bodyY: 0.02, rearUp: 0.0, headY: 0.0, headZ: 0.04, headPitch: -0.02, jawOpen: 0.0,
    flSwing: 0.10, flLift: 0.04, frSwing: -0.06, frLift: 0.08, frSwipeX: 0.0,
    blSwing: -0.06, blLift: 0.08, brSwing: 0.10, brLift: 0.04,
  },
  walk2: {
    bodyY: -0.015, rearUp: 0.0, headY: -0.02, headZ: 0.03, headPitch: -0.04, jawOpen: 0.0,
    flSwing: -0.05, flLift: 0.0, frSwing: 0.10, frLift: 0.15, frSwipeX: 0.0,
    blSwing: 0.08, blLift: 0.14, brSwing: -0.05, brLift: 0.0,
  },
  walk3: {
    bodyY: 0.0, rearUp: 0.0, headY: -0.01, headZ: 0.03, headPitch: -0.03, jawOpen: 0.0,
    flSwing: -0.18, flLift: 0.0, frSwing: 0.22, frLift: 0.14, frSwipeX: 0.0,
    blSwing: 0.20, blLift: 0.12, brSwing: -0.18, brLift: 0.0,
  },
  walk4: {
    bodyY: 0.02, rearUp: 0.0, headY: 0.0, headZ: 0.04, headPitch: -0.02, jawOpen: 0.0,
    flSwing: -0.06, flLift: 0.08, frSwing: 0.10, frLift: 0.04, frSwipeX: 0.0,
    blSwing: 0.10, blLift: 0.04, brSwing: -0.06, brLift: 0.08,
  },
  walk5: {
    bodyY: -0.015, rearUp: 0.0, headY: -0.02, headZ: 0.03, headPitch: -0.04, jawOpen: 0.0,
    flSwing: 0.10, flLift: 0.15, frSwing: -0.05, frLift: 0.0, frSwipeX: 0.0,
    blSwing: -0.05, blLift: 0.0, brSwing: 0.08, brLift: 0.14,
  },

  // 4-frame towering roar on hind legs
  rear0: {
    bodyY: 0.04, rearUp: 0.35, headY: 0.06, headZ: -0.05, headPitch: 0.14, jawOpen: 0.35,
    flSwing: 0.16, flLift: 0.32, frSwing: 0.16, frLift: 0.30, frSwipeX: 0.02,
    blSwing: 0.04, blLift: 0.0, brSwing: 0.04, brLift: 0.0,
  },
  rear1: {
    bodyY: 0.08, rearUp: 0.68, headY: 0.14, headZ: -0.10, headPitch: 0.28, jawOpen: 0.88,
    flSwing: 0.26, flLift: 0.62, frSwing: 0.26, frLift: 0.60, frSwipeX: 0.06,
    blSwing: 0.08, blLift: 0.0, brSwing: 0.08, brLift: 0.0,
  },
  rear2: {
    bodyY: 0.09, rearUp: 0.74, headY: 0.16, headZ: -0.11, headPitch: 0.34, jawOpen: 1.0,
    flSwing: 0.30, flLift: 0.68, frSwing: 0.30, frLift: 0.66, frSwipeX: 0.08,
    blSwing: 0.08, blLift: 0.0, brSwing: 0.08, brLift: 0.0,
  },
  rear3: {
    bodyY: 0.03, rearUp: 0.30, headY: 0.05, headZ: -0.04, headPitch: 0.10, jawOpen: 0.30,
    flSwing: 0.14, flLift: 0.24, frSwing: 0.14, frLift: 0.22, frSwipeX: 0.0,
    blSwing: 0.04, blLift: 0.0, brSwing: 0.04, brLift: 0.0,
  },

  // 4-frame powerful right-paw swipe
  swipe0: {
    bodyY: -0.03, rearUp: 0.18, headY: 0.02, headZ: -0.02, headPitch: 0.04, jawOpen: 0.40,
    flSwing: 0.08, flLift: 0.0, frSwing: -0.08, frLift: 0.42, frSwipeX: 0.18,
    blSwing: 0.02, blLift: 0.0, brSwing: -0.04, brLift: 0.0,
  },
  swipe1: {
    bodyY: 0.01, rearUp: 0.22, headY: 0.0, headZ: 0.05, headPitch: -0.04, jawOpen: 0.85,
    flSwing: 0.04, flLift: 0.0, frSwing: 0.38, frLift: 0.44, frSwipeX: -0.14,
    blSwing: -0.04, blLift: 0.0, brSwing: 0.06, brLift: 0.0,
  },
  swipe2: {
    bodyY: -0.02, rearUp: 0.12, headY: -0.02, headZ: 0.06, headPitch: -0.06, jawOpen: 0.70,
    flSwing: 0.02, flLift: 0.0, frSwing: 0.42, frLift: 0.22, frSwipeX: -0.22,
    blSwing: -0.04, blLift: 0.0, brSwing: 0.06, brLift: 0.0,
  },
  swipe3: {
    bodyY: -0.01, rearUp: 0.04, headY: -0.01, headZ: 0.02, headPitch: -0.02, jawOpen: 0.20,
    flSwing: 0.02, flLift: 0.0, frSwing: 0.16, frLift: 0.06, frSwipeX: -0.04,
    blSwing: -0.02, blLift: 0.0, brSwing: 0.02, brLift: 0.0,
  },
};

const polarBearCache = new Map<PolarBearPoseName, Boar27Pack>();
 function buildPolarBearPosePack(pose: PolarBearPoseName): Boar27Pack {
  let pack = polarBearCache.get(pose);
  if (!pack) {
    const P = POLAR_BEAR_POSES[pose];
    const by = P.bodyY;
    const ru = P.rearUp;
    // Polar bears have a longer, sleeker Arctic neck extending forward
    const hPivotY = 0.20 + by + P.headY + ru * 0.34;
    const hPivotZ = 0.56 + P.headZ - ru * 0.22;
    const cosP = Math.cos(P.headPitch);
    const sinP = Math.sin(P.headPitch);
    const jawDrop = P.jawOpen * 0.12;
    const jawBack = P.jawOpen * 0.03;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // 1. Massive polar bear torso: broad shoulders, deep chest, heavy high hindquarters
      const chest = sdEllipsoid(x, y, z, 0, 0.02 + by + ru * 0.22, 0.20 - ru * 0.12, 0.255, 0.245, 0.285);
      const shoulders = sdEllipsoid(x, y, z, 0, 0.15 + by + ru * 0.24, 0.18 - ru * 0.12, 0.22, 0.175, 0.22);
      const mid = sdEllipsoid(x, y, z, 0, 0.04 + by + ru * 0.11, -0.06 - ru * 0.05, 0.245, 0.23, 0.27);
      const rump = sdEllipsoid(x, y, z, 0, 0.06 + by, -0.32, 0.25, 0.245, 0.25);

      // Longer, sleeker Arctic neck
      const neck = sdCapsule(x, y, z, 0, 0.10 + by + ru * 0.22, 0.30 - ru * 0.12, 0, hPivotY - 0.02, hPivotZ - 0.04, 0.175, 0.132);
      const throat = sdCapsule(x, y, z, 0, -0.02 + by + ru * 0.18, 0.32 - ru * 0.10, 0, hPivotY - 0.07, hPivotZ - 0.02, 0.145, 0.105);

      // Short fluffy white tail
      const tail = sdEllipsoid(x, y, z, 0, 0.04 + by, -0.56, 0.068, 0.068, 0.078);

      let fur = smin(chest, shoulders, 0.09);
      fur = smin(fur, mid, 0.11);
      fur = smin(fur, rump, 0.11);
      fur = smin(fur, smin(neck, throat, 0.07), 0.09);
      fur = smin(fur, tail, 0.04);

      // 2. Streamlined polar bear head & narrower tapered snout in pitch-rotated local space
      const dy = y - hPivotY;
      const dz = z - hPivotZ;
      const lx = x;
      const lz = dz * cosP + dy * sinP;
      const ly = -dz * sinP + dy * cosP;

      const skull = sdEllipsoid(lx, ly, lz, 0, 0.015, 0.01, 0.126, 0.116, 0.155);
      const snout = sdCapsule(lx, ly, lz, 0, 0.0, 0.08, 0, -0.018, 0.275, 0.082, 0.052);
      const lowerJaw = sdCapsule(lx, ly, lz, 0, -0.052, 0.08, 0, -0.056 - jawDrop, 0.245 - jawBack, 0.060, 0.038);

      // Small rounded Arctic ears
      const earL = sdEllipsoid(lx, ly, lz, -0.098, 0.105, -0.045, 0.038, 0.040, 0.032);
      const earR = sdEllipsoid(lx, ly, lz,  0.098, 0.105, -0.045, 0.038, 0.040, 0.032);

      let headD = smin(skull, snout, 0.045);
      headD = smin(headD, lowerJaw, P.jawOpen > 0.2 ? 0.02 : 0.038);
      headD = smin(headD, Math.min(earL, earR), 0.022);
      fur = smin(fur, headD, 0.06);

      // 3. Thick fluffy legs with wide snowshoe paws & dark claws
      let claws = 99;
      const frontLeg = (sx: number, swing: number, lift: number, swipeX: number) => {
        const shY = -0.02 + by + ru * 0.22;
        const shZ = 0.24 - ru * 0.12;
        const elY = -0.26 + by * 0.45 + lift * 0.24 + ru * 0.18;
        const elZ = 0.20 + swing * 0.46 - ru * 0.04;
        const pwX = sx + swipeX;
        const pwY = -0.52 + lift * 0.44 + ru * 0.14;
        const pwZ = 0.25 + swing * 0.96 + ru * 0.10;
        const upper = sdCapsule(x, y, z, sx, shY, shZ, sx + swipeX * 0.4, elY, elZ, 0.115, 0.086);
        const lower = sdCapsule(x, y, z, sx + swipeX * 0.4, elY, elZ, pwX, pwY, pwZ, 0.084, 0.072);
        const paw = sdEllipsoid(x, y, z, pwX, pwY - 0.015, pwZ + 0.055, 0.088, 0.046, 0.098);
        const claw = sdEllipsoid(x, y, z, pwX, pwY - 0.028, pwZ + 0.135, 0.066, 0.022, 0.026);
        claws = Math.min(claws, claw);
        return smin(smin(upper, lower, 0.04), paw, 0.032);
      };
      const hindLeg = (sx: number, swing: number, lift: number) => {
        const hipY = 0.0 + by;
        const hipZ = -0.32;
        const hkY = -0.26 + by * 0.45 + lift * 0.20;
        const hkZ = -0.40 + swing * 0.42;
        const pwY = -0.52 + lift * 0.30;
        const pwZ = -0.32 + swing * 0.92;
        const upper = sdCapsule(x, y, z, sx, hipY, hipZ, sx, hkY, hkZ, 0.122, 0.086);
        const lower = sdCapsule(x, y, z, sx, hkY, hkZ, sx, pwY, pwZ, 0.084, 0.072);
        const paw = sdEllipsoid(x, y, z, sx, pwY - 0.015, pwZ + 0.055, 0.090, 0.046, 0.102);
        const claw = sdEllipsoid(x, y, z, sx, pwY - 0.028, pwZ + 0.138, 0.068, 0.022, 0.026);
        claws = Math.min(claws, claw);
        return smin(smin(upper, lower, 0.04), paw, 0.032);
      };

      const legs = Math.min(
        Math.min(frontLeg(-0.185, P.flSwing, P.flLift, 0), frontLeg(0.185, P.frSwing, P.frLift, P.frSwipeX)),
        Math.min(hindLeg(-0.19, P.blSwing, P.blLift), hindLeg(0.19, P.brSwing, P.brLift)),
      );
      fur = smin(fur, legs, 0.055);

      // 4. Jet-black nose, expressive dark eyes, mouth & fangs
      const eyeL = sdEllipsoid(lx, ly, lz, -0.074, 0.042, 0.112, 0.026, 0.024, 0.026);
      const eyeR = sdEllipsoid(lx, ly, lz,  0.074, 0.042, 0.112, 0.026, 0.024, 0.026);
      const eyes = Math.min(eyeL, eyeR);
      const nose = sdEllipsoid(lx, ly, lz, 0, -0.008, 0.312, 0.044, 0.034, 0.032);

      let mouth = 99;
      let fangs = 99;
      if (P.jawOpen > 0.18) {
        mouth = sdEllipsoid(lx, ly, lz, 0, -0.042 - jawDrop * 0.42, 0.185, 0.048, 0.025 + jawDrop * 0.42, 0.078);
        const fL = sdCapsule(lx, ly, lz, -0.034, -0.038, 0.232, -0.034, -0.078, 0.232, 0.014, 0.006);
        const fR = sdCapsule(lx, ly, lz,  0.034, -0.038, 0.232,  0.034, -0.078, 0.232, 0.014, 0.006);
        fangs = Math.min(fL, fR);
      }

      let d = fur, mat = 'fur';
      if (claws < d) { d = claws; mat = 'claw'; }
      if (mouth < d) { d = mouth; mat = 'mouth'; }
      if (fangs < d) { d = fangs; mat = 'fang'; }
      if (eyes < d) { d = eyes; mat = 'eye'; }
      if (nose < d) { d = nose; mat = 'nose'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'nose' || mat === 'claw') return 'k';
      if (mat === 'mouth') return 'm';
      if (mat === 'fang') return 'W';
      if (mat === 'eye') {
        const dy = y - hPivotY;
        const dz = z - hPivotZ;
        const ly = -dz * sinP + dy * cosP;
        if (ly > 0.050 && Math.abs(x) > 0.068) return 'W';
        return 'k';
      }

      // Subtle warm-cream undercoat on belly/flanks
      if (y < -0.10 + by + ru * 0.10 && z > -0.36 && z < 0.28 && shade > 0.28 && shade < 0.56) {
        return 'c0';
      }

      // 5-tone glacier-white / pale-ice-blue shadow fur ramp
      if (shade > 0.84) return 'w4';
      return shade > 0.62 ? 'w3' : shade > 0.40 ? 'w2' : shade > 0.20 ? 'w1' : 'w0';
    };

    pack = build27Pack(POLAR_BEAR_PW, POLAR_BEAR_PH, 1.16, 0.96, POLAR_BEAR_PAL, evalFn, shadeFn);
    polarBearCache.set(pose, pack);
  }
  return pack;
}

export function getPolarBearPosePack(...args: Parameters<typeof buildPolarBearPosePack>): ReturnType<typeof buildPolarBearPosePack> {
  return registerAnimalSpritePack(buildPolarBearPosePack(...args), { module: './PolarBear.ts', factory: 'getPolarBearPosePack', args }, buildPolarBearPosePack);
}

// ============================================================================
// INSTÂNCIA NA ARENA (PolarBear)
// ============================================================================
const POLAR_BEAR_IDLE: readonly PolarBearPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const POLAR_BEAR_WALK: readonly PolarBearPoseName[] = ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'];
const POLAR_BEAR_REAR: readonly PolarBearPoseName[] = ['rear0', 'rear1', 'rear2', 'rear1', 'rear3'];
const POLAR_BEAR_SWIPE: readonly PolarBearPoseName[] = ['swipe0', 'swipe1', 'swipe2', 'swipe3'];

/**
 * Polar Bear: patrols with a heavy Arctic stride, rears up roaring, and swipes if provoked.
 */
export class PolarBear extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private readonly home = new THREE.Vector3();
  private state: 'idle' | 'walk' | 'rear' | 'swipe' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.6, 3.0);
  private targetYaw = rand(0, Math.PI * 2);
  private gaitPhase = rand(0, Math.PI * 2);
  private provoked = false;

  constructor(ctx: GameContext, pos: THREE.Vector3) {
    super(ctx, getPolarBearPosePack('idle0').getView(2, 0)!, POLAR_BEAR_PW, POLAR_BEAR_PH, POLAR_BEAR_W, POLAR_BEAR_H, 'PolarBearBillboard');
    this.hp = 150;
    this.maxHp = 150;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.62;
    this.motor.height = 1.10;
    this.motor.teleport(pos);
    this.home.copy(pos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.68, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.set(this.position.x, this.position.y + 0.54, this.position.z);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y + 0.28, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.80, this.position.z);
    this.hurtboxes[0].enabled = this.alive;
    this.stickRoot.position.set(this.position.x, this.position.y + 0.54, this.position.z);
    this.stickRoot.rotation.y = this.facing;
  }

  receiveHit(hit: HitInfo): HitResult {
    const res = emptyResult('flesh');
    if (!this.alive) { res.ignored = true; return res; }
    this.hp = Math.max(0, this.hp - hit.damage);
    res.damage = hit.damage;
    this.flash = 1.0;
    this.vel.x += hit.dir.x * 2.8;
    this.vel.z += hit.dir.z * 2.8;
    this.vel.y = 2.2;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.provoked = true;
      this.state = 'rear';
      this.stateT = 0;
      this.stateDur = 1.4;
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
        const aggroDist = this.provoked ? 7.5 : 3.8;
        if (dist < 2.2 && this.state !== 'swipe') {
          this.state = 'swipe';
          this.stateT = 0;
          this.stateDur = 1.1;
        } else if (dist < aggroDist && this.state === 'idle' && this.stateT > 0.6) {
          this.state = 'rear';
          this.stateT = 0;
          this.stateDur = 1.4;
        }

        if (this.state === 'idle') {
          if (this.stateT >= this.stateDur) {
            this.state = 'walk';
            this.stateT = 0;
            this.stateDur = rand(2.2, 4.0);
            const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
            this.targetYaw = toHome > 8.5
              ? Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.5, 0.5)
              : this.facing + rand(-1.4, 1.4);
          }
        } else if (this.state === 'walk') {
          if (this.provoked && target && target.alive && dist < 8.0) {
            this.targetYaw = Math.atan2(target.position.x - this.position.x, target.position.z - this.position.z);
            speed = 3.4;
          } else {
            speed = 2.0;
          }
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 5);
          if (this.stateT >= this.stateDur) {
            this.provoked = false;
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.4, 2.8);
          }
        } else if (this.state === 'rear') {
          if (target && target.alive) {
            const toPlayer = Math.atan2(target.position.x - this.position.x, target.position.z - this.position.z);
            this.facing += angleDiff(this.facing, toPlayer) * Math.min(1, dt * 6);
          }
          if (this.stateT >= this.stateDur) {
            this.state = this.provoked ? 'walk' : 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.6, 2.8);
          }
        } else if (this.state === 'swipe') {
          if (target && target.alive) {
            const toPlayer = Math.atan2(target.position.x - this.position.x, target.position.z - this.position.z);
            this.facing += angleDiff(this.facing, toPlayer) * Math.min(1, dt * 8);
          }
          if (this.stateT >= this.stateDur) {
            this.state = dist < aggroDist ? 'walk' : 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.4, 2.4);
          }
        }

        this.vel.x = damp(this.vel.x, Math.sin(this.facing) * speed, 8, dt);
        this.vel.z = damp(this.vel.z, Math.cos(this.facing) * speed, 8, dt);
        this.vel.y -= 20 * dt;
        this.motor.update(dt);

        const horiz = Math.hypot(this.vel.x, this.vel.z);
        if (horiz > 0.2 && this.motor.grounded) {
          this.gaitPhase += dt * 5.2 * (0.65 + horiz * 0.20);
        }
      }
      this.syncHurtbox();
    }

    let pose: PolarBearPoseName;
    if (!this.alive) pose = 'idle0';
    else if (this.state === 'swipe') pose = pickCycle(POLAR_BEAR_SWIPE, this.stateT * 4.5);
    else if (this.state === 'rear') pose = pickCycle(POLAR_BEAR_REAR, this.stateT * 3.6);
    else if (this.state === 'walk') pose = pickCycle(POLAR_BEAR_WALK, (this.gaitPhase / Math.PI) * 2.6);
    else pose = pickCycle(POLAR_BEAR_IDLE, this.stateT * 1.8);

    const bob = this.alive && this.motor.grounded && this.state === 'walk'
      ? Math.abs(Math.sin(this.gaitPhase)) * 0.032
      : 0;
    const deathSink = this.alive ? 0 : Math.min(0.28, this.deadT * 0.42);
    this.renderBillboard(getPolarBearPosePack(pose), this.position.y + 0.54 + bob - deathSink, camera, drawingBufferSize);
  }
}
