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
// LEÃO AFRICANO (African Lion) — 64×48 @ 56 PPU (1.14m × 0.86m)
// ============================================================================
export type LionPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'walk0' | 'walk1' | 'walk2' | 'walk3' | 'walk4' | 'walk5'
  | 'roar0' | 'roar1' | 'roar2'
  | 'pounce0' | 'pounce1' | 'pounce2' | 'pounce3';

export const LION_PW = 64;
export const LION_PH = 48;
export const LION_W = LION_PW / ANIMAL_PPU;
export const LION_H = LION_PH / ANIMAL_PPU;

const LION_PAL: Record<string, [number, number, number]> = {
  k:  [0x17, 0x11, 0x0d], // crisp 1px dark outline / nose / eye pupil
  m0: [0x36, 0x17, 0x0b], // deep dark-mahogany mane shadow & tail tuft
  m1: [0x5e, 0x2a, 0x12], // rich chestnut mane
  m2: [0x8c, 0x43, 0x19], // burnt-sienna mane midtone
  m3: [0xb8, 0x61, 0x26], // sunlit warm-amber mane highlight
  g0: [0x96, 0x67, 0x28], // tawny-gold shadow
  g1: [0xc4, 0x8d, 0x3b], // rich tawny-gold base
  g2: [0xe0, 0xad, 0x55], // warm savanna-gold midtone
  g3: [0xf2, 0xc9, 0x79], // sunlit golden highlight
  g4: [0xfc, 0xe2, 0xa8], // top rim sheen
  c0: [0xd8, 0xc7, 0xa8], // pale cream belly & chin shadow
  W:  [0xf7, 0xf1, 0xe2], // bright cream chin, underbelly, fangs & eye glint
  e:  [0xff, 0xbf, 0x24], // fierce golden-amber eyes
  r:  [0x80, 0x1f, 0x2c], // deep crimson mouth interior on roar/pounce
};

interface LionPose {
  bodyY: number;
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
  tailLift: number;
  tailSway: number;
}

const LION_POSES: Record<LionPoseName, LionPose> = {
  // Regal breathing idle
  idle0: {
    bodyY: 0.0, headY: 0.0, headZ: 0.0, headPitch: 0.02, jawOpen: 0.0,
    flSwing: 0.02, flLift: 0.0, frSwing: -0.02, frLift: 0.0,
    blSwing: -0.02, blLift: 0.0, brSwing: 0.02, brLift: 0.0,
    tailLift: -0.04, tailSway: 0.06,
  },
  idle1: {
    bodyY: 0.015, headY: 0.02, headZ: 0.01, headPitch: 0.06, jawOpen: 0.0,
    flSwing: 0.02, flLift: 0.0, frSwing: -0.02, frLift: 0.0,
    blSwing: -0.02, blLift: 0.0, brSwing: 0.02, brLift: 0.0,
    tailLift: 0.02, tailSway: 0.16,
  },
  idle2: {
    bodyY: -0.01, headY: -0.01, headZ: 0.015, headPitch: -0.03, jawOpen: 0.0,
    flSwing: 0.02, flLift: 0.0, frSwing: -0.02, frLift: 0.0,
    blSwing: -0.02, blLift: 0.0, brSwing: 0.02, brLift: 0.0,
    tailLift: -0.06, tailSway: -0.14,
  },

  // 6-frame proud stately savanna stride
  walk0: {
    bodyY: 0.0, headY: -0.01, headZ: 0.03, headPitch: -0.02, jawOpen: 0.0,
    flSwing: 0.24, flLift: 0.14, frSwing: -0.18, frLift: 0.0,
    blSwing: -0.20, blLift: 0.0, brSwing: 0.20, brLift: 0.12,
    tailLift: -0.04, tailSway: 0.10,
  },
  walk1: {
    bodyY: 0.02, headY: 0.0, headZ: 0.04, headPitch: 0.0, jawOpen: 0.0,
    flSwing: 0.12, flLift: 0.04, frSwing: -0.06, frLift: 0.08,
    blSwing: -0.08, blLift: 0.08, brSwing: 0.10, brLift: 0.04,
    tailLift: -0.02, tailSway: 0.04,
  },
  walk2: {
    bodyY: -0.015, headY: -0.02, headZ: 0.03, headPitch: -0.03, jawOpen: 0.0,
    flSwing: -0.05, flLift: 0.0, frSwing: 0.12, frLift: 0.15,
    blSwing: 0.10, blLift: 0.14, brSwing: -0.05, brLift: 0.0,
    tailLift: -0.06, tailSway: -0.04,
  },
  walk3: {
    bodyY: 0.0, headY: -0.01, headZ: 0.03, headPitch: -0.02, jawOpen: 0.0,
    flSwing: -0.18, flLift: 0.0, frSwing: 0.24, frLift: 0.14,
    blSwing: 0.20, blLift: 0.12, brSwing: -0.20, brLift: 0.0,
    tailLift: -0.04, tailSway: -0.10,
  },
  walk4: {
    bodyY: 0.02, headY: 0.0, headZ: 0.04, headPitch: 0.0, jawOpen: 0.0,
    flSwing: -0.06, flLift: 0.08, frSwing: 0.12, frLift: 0.04,
    blSwing: 0.10, blLift: 0.04, brSwing: -0.08, brLift: 0.08,
    tailLift: -0.02, tailSway: -0.04,
  },
  walk5: {
    bodyY: -0.015, headY: -0.02, headZ: 0.03, headPitch: -0.03, jawOpen: 0.0,
    flSwing: 0.12, flLift: 0.15, frSwing: -0.05, frLift: 0.0,
    blSwing: -0.05, blLift: 0.0, brSwing: 0.10, brLift: 0.14,
    tailLift: -0.06, tailSway: 0.04,
  },

  // 3-frame majestic savanna roar
  roar0: {
    bodyY: 0.01, headY: 0.05, headZ: 0.02, headPitch: 0.16, jawOpen: 0.55,
    flSwing: 0.08, flLift: 0.0, frSwing: 0.04, frLift: 0.0,
    blSwing: -0.06, blLift: 0.0, brSwing: -0.06, brLift: 0.0,
    tailLift: 0.06, tailSway: 0.12,
  },
  roar1: {
    bodyY: 0.025, headY: 0.09, headZ: 0.03, headPitch: 0.30, jawOpen: 1.0,
    flSwing: 0.10, flLift: 0.0, frSwing: 0.06, frLift: 0.0,
    blSwing: -0.08, blLift: 0.0, brSwing: -0.08, brLift: 0.0,
    tailLift: 0.14, tailSway: -0.10,
  },
  roar2: {
    bodyY: 0.015, headY: 0.06, headZ: 0.02, headPitch: 0.20, jawOpen: 0.80,
    flSwing: 0.08, flLift: 0.0, frSwing: 0.04, frLift: 0.0,
    blSwing: -0.06, blLift: 0.0, brSwing: -0.06, brLift: 0.0,
    tailLift: 0.10, tailSway: 0.08,
  },

  // 4-frame powerful ambush pounce
  pounce0: {
    bodyY: -0.12, headY: -0.12, headZ: 0.07, headPitch: -0.10, jawOpen: 0.38,
    flSwing: 0.14, flLift: 0.0, frSwing: 0.10, frLift: 0.0,
    blSwing: 0.16, blLift: 0.0, brSwing: 0.12, brLift: 0.0,
    tailLift: 0.10, tailSway: 0.16,
  },
  pounce1: {
    bodyY: 0.06, headY: -0.03, headZ: 0.11, headPitch: -0.04, jawOpen: 0.85,
    flSwing: 0.38, flLift: 0.46, frSwing: 0.30, frLift: 0.38,
    blSwing: -0.32, blLift: 0.24, brSwing: -0.26, brLift: 0.18,
    tailLift: 0.24, tailSway: 0.0,
  },
  pounce2: {
    bodyY: 0.04, headY: -0.05, headZ: 0.13, headPitch: -0.08, jawOpen: 1.0,
    flSwing: 0.44, flLift: 0.52, frSwing: 0.36, frLift: 0.44,
    blSwing: -0.36, blLift: 0.30, brSwing: -0.30, brLift: 0.24,
    tailLift: 0.28, tailSway: 0.0,
  },
  pounce3: {
    bodyY: -0.06, headY: -0.09, headZ: 0.08, headPitch: -0.08, jawOpen: 0.45,
    flSwing: 0.26, flLift: 0.04, frSwing: 0.20, frLift: 0.02,
    blSwing: -0.12, blLift: 0.16, brSwing: -0.06, brLift: 0.10,
    tailLift: 0.14, tailSway: -0.08,
  },
};

const lionCache = new Map<LionPoseName, Boar27Pack>();
 function buildLionPosePack(pose: LionPoseName): Boar27Pack {
  let pack = lionCache.get(pose);
  if (!pack) {
    const P = LION_POSES[pose];
    const by = P.bodyY;
    const hPivotY = 0.22 + by + P.headY;
    const hPivotZ = 0.46 + P.headZ;
    const cosP = Math.cos(P.headPitch);
    const sinP = Math.sin(P.headPitch);
    const jawDrop = P.jawOpen * 0.13;
    const jawBack = P.jawOpen * 0.03;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // 1. Muscular tawny-gold savanna king torso
      const chest = sdEllipsoid(x, y, z, 0, 0.02 + by, 0.20, 0.22, 0.22, 0.27);
      const waist = sdEllipsoid(x, y, z, 0, 0.05 + by, -0.10, 0.155, 0.155, 0.25);
      const rump = sdEllipsoid(x, y, z, 0, 0.04 + by, -0.36, 0.195, 0.19, 0.22);

      let body = smin(chest, waist, 0.10);
      body = smin(body, rump, 0.10);

      // 2. Huge lush layered mane wrapping head, neck & chest!
      const maneCrown = sdEllipsoid(x, y, z, 0, hPivotY + 0.05, hPivotZ - 0.06, 0.255, 0.255, 0.225);
      const maneChest = sdEllipsoid(x, y, z, 0, 0.01 + by * 0.5 + P.headY * 0.5, 0.35 + P.headZ * 0.5, 0.255, 0.25, 0.22);
      const maneBack = sdEllipsoid(x, y, z, 0, 0.17 + by * 0.6 + P.headY * 0.4, 0.24 + P.headZ * 0.4, 0.225, 0.185, 0.22);
      const maneD = smin(smin(maneCrown, maneChest, 0.08), maneBack, 0.08);
      let fur = smin(body, maneD, 0.08);

      // 3. Noble broad golden face peeking cleanly out of the mane (local pitch-rotated space)
      const dy = y - hPivotY;
      const dz = z - hPivotZ;
      const lx = x;
      const lz = dz * cosP + dy * sinP;
      const ly = -dz * sinP + dy * cosP;

      const skull = sdEllipsoid(lx, ly, lz, 0, 0.01, 0.04, 0.142, 0.132, 0.155);
      const muzzle = sdCapsule(lx, ly, lz, 0, -0.008, 0.10, 0, -0.025, 0.265, 0.084, 0.062);
      const lowerJaw = sdCapsule(lx, ly, lz, 0, -0.058, 0.09, 0, -0.064 - jawDrop, 0.245 - jawBack, 0.062, 0.040);
      const earL = sdEllipsoid(lx, ly, lz, -0.125, 0.135, -0.02, 0.048, 0.052, 0.036);
      const earR = sdEllipsoid(lx, ly, lz,  0.125, 0.135, -0.02, 0.048, 0.052, 0.036);

      let faceD = smin(skull, muzzle, 0.038);
      faceD = smin(faceD, lowerJaw, P.jawOpen > 0.2 ? 0.018 : 0.036);
      faceD = smin(faceD, Math.min(earL, earR), 0.022);
      fur = smin(fur, faceD, 0.05);

      // 4. Strong muscular pawed legs
      const frontLeg = (sx: number, swing: number, lift: number) => {
        const shY = 0.0 + by, shZ = 0.24;
        const elY = -0.25 + by * 0.45 + lift * 0.18;
        const elZ = 0.16 + swing * 0.50;
        const pwY = -0.54 + lift * 0.30;
        const pwZ = 0.25 + swing * 1.04;
        const upper = sdCapsule(x, y, z, sx, shY, shZ, sx, elY, elZ, 0.100, 0.066);
        const lower = sdCapsule(x, y, z, sx, elY, elZ, sx, pwY, pwZ, 0.064, 0.048);
        const paw = sdEllipsoid(x, y, z, sx, pwY - 0.012, pwZ + 0.048, 0.068, 0.038, 0.078);
        return smin(smin(upper, lower, 0.034), paw, 0.026);
      };
      const hindLeg = (sx: number, swing: number, lift: number) => {
        const hipY = 0.02 + by, hipZ = -0.34;
        const thigh = sdEllipsoid(x, y, z, sx * 1.04, -0.04 + by, -0.34 + swing * 0.16, 0.104, 0.145, 0.128);
        const hkY = -0.26 + by * 0.45 + lift * 0.18;
        const hkZ = -0.48 + (swing < 0 ? swing * 0.36 : swing * 0.62);
        const pwY = -0.54 + lift * 0.30;
        const pwZ = -0.36 + (swing < 0 ? swing * 1.20 : swing * 0.92);
        const upper = sdCapsule(x, y, z, sx, hipY, hipZ, sx, hkY, hkZ, 0.100, 0.060);
        const lower = sdCapsule(x, y, z, sx, hkY, hkZ, sx, pwY, pwZ, 0.058, 0.046);
        const paw = sdEllipsoid(x, y, z, sx, pwY - 0.012, pwZ + 0.048, 0.068, 0.038, 0.078);
        return smin(smin(thigh, upper, 0.042), smin(lower, paw, 0.026), 0.032);
      };

      const legs = Math.min(
        Math.min(frontLeg(-0.155, P.flSwing, P.flLift), frontLeg(0.155, P.frSwing, P.frLift)),
        Math.min(hindLeg(-0.16, P.blSwing, P.blLift), hindLeg(0.16, P.brSwing, P.brLift)),
      );
      fur = smin(fur, legs, 0.048);

      // 5. Long swishing lion tail ending in a distinct dark-mahogany hair tuft!
      const t1X = P.tailSway * 0.45;
      const t1Y = -0.08 + by * 0.5 + P.tailLift * 0.4;
      const t1Z = -0.74;
      const t2X = P.tailSway;
      const t2Y = -0.04 + P.tailLift * 0.95;
      const t2Z = -1.04;
      const tail1 = sdCapsule(x, y, z, 0, 0.04 + by, -0.50, t1X, t1Y, t1Z, 0.044, 0.036);
      const tail2 = sdCapsule(x, y, z, t1X, t1Y, t1Z, t2X, t2Y, t2Z, 0.034, 0.026);
      const tailTuft = sdEllipsoid(x, y, z, t2X, t2Y, t2Z - 0.06, 0.064, 0.056, 0.095);
      const tailD = smin(smin(tail1, tail2, 0.03), tailTuft, 0.025);
      fur = smin(fur, tailD, 0.04);

      // 6. Fierce golden-amber eyes, dark triangular nose, roaring mouth & white fangs
      const eyeL = sdEllipsoid(lx, ly, lz, -0.084, 0.038, 0.145, 0.032, 0.026, 0.030);
      const eyeR = sdEllipsoid(lx, ly, lz,  0.084, 0.038, 0.145, 0.032, 0.026, 0.030);
      const eyes = Math.min(eyeL, eyeR);
      const nose = sdEllipsoid(lx, ly, lz, 0, -0.012, 0.302, 0.042, 0.030, 0.032);

      let mouth = 99;
      let fangs = 99;
      if (P.jawOpen > 0.18) {
        mouth = sdEllipsoid(lx, ly, lz, 0, -0.048 - jawDrop * 0.42, 0.20, 0.054, 0.026 + jawDrop * 0.44, 0.072);
        const fL = sdCapsule(lx, ly, lz, -0.038, -0.040, 0.242, -0.038, -0.088, 0.242, 0.014, 0.006);
        const fR = sdCapsule(lx, ly, lz,  0.038, -0.040, 0.242,  0.038, -0.088, 0.242, 0.014, 0.006);
        fangs = Math.min(fL, fR);
      }

      let d = fur, mat = 'fur';
      if (maneD < fur + 0.010 && faceD > maneD + 0.006) mat = 'mane';
      if (tailTuft < fur + 0.008 && z < -1.00) mat = 'tuft';
      if (mouth < d) { d = mouth; mat = 'mouth'; }
      if (fangs < d) { d = fangs; mat = 'fang'; }
      if (eyes < d) { d = eyes; mat = 'eye'; }
      if (nose < d) { d = nose; mat = 'nose'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'nose') return 'k';
      if (mat === 'mouth') return 'r';
      if (mat === 'fang') return 'W';
      if (mat === 'eye') {
        const dy = y - hPivotY;
        const dz = z - hPivotZ;
        const ly = -dz * sinP + dy * cosP;
        if (ly > 0.046 && Math.abs(x) > 0.078) return 'W';
        return 'e';
      }
      if (mat === 'tuft') return shade > 0.60 ? 'm1' : 'm0';
      if (mat === 'mane') {
        // Layered burnt-sienna / chestnut / dark-mahogany mane tufts
        const tuft = Math.sin(x * 24.0 + y * 20.0) * 0.08;
        const s = shade + tuft;
        return s > 0.74 ? 'm3' : s > 0.46 ? 'm2' : s > 0.22 ? 'm1' : 'm0';
      }

      // Pale cream chin
      const dy = y - hPivotY;
      const dz = z - hPivotZ;
      const lz = dz * cosP + dy * sinP;
      const ly = -dz * sinP + dy * cosP;
      if (dz > -0.05 && lz > 0.14 && ly < -0.045) {
        return shade > 0.40 ? 'W' : 'c0';
      }

      // Pale cream underbelly
      if (y < -0.08 + by && Math.abs(x) < 0.15 && z > -0.34 && z < 0.24) {
        return shade > 0.45 ? 'W' : 'c0';
      }

      return shade > 0.84 ? 'g4' : shade > 0.58 ? 'g3' : shade > 0.34 ? 'g2' : shade > 0.16 ? 'g1' : 'g0';
    };

    pack = build27Pack(LION_PW, LION_PH, 1.12, 0.84, LION_PAL, evalFn, shadeFn);
    lionCache.set(pose, pack);
  }
  return pack;
}

export function getLionPosePack(...args: Parameters<typeof buildLionPosePack>): ReturnType<typeof buildLionPosePack> {
  return registerAnimalSpritePack(buildLionPosePack(...args), { module: './Lion.ts', factory: 'getLionPosePack', args }, buildLionPosePack);
}

// ============================================================================
// INSTÂNCIA NA ARENA (Lion)
// ============================================================================
const LION_IDLE: readonly LionPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const LION_WALK: readonly LionPoseName[] = ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'];
const LION_ROAR: readonly LionPoseName[] = ['roar0', 'roar1', 'roar2', 'roar1'];

/**
 * African Lion: patrols proudly, unleashes a majestic roar, and pounces if provoked.
 */
export class Lion extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private readonly home = new THREE.Vector3();
  private state: 'idle' | 'walk' | 'roar' | 'pounce' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.6, 3.0);
  private targetYaw = rand(0, Math.PI * 2);
  private gaitPhase = rand(0, Math.PI * 2);
  private pounceCooldown = 0;
  private provoked = false;

  constructor(ctx: GameContext, pos: THREE.Vector3) {
    super(ctx, getLionPosePack('idle0').getView(2, 0)!, LION_PW, LION_PH, LION_W, LION_H, 'LionBillboard');
    this.hp = 120;
    this.maxHp = 120;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.52;
    this.motor.height = 0.96;
    this.motor.teleport(pos);
    this.home.copy(pos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.58, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.set(this.position.x, this.position.y + 0.48, this.position.z);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y + 0.26, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.70, this.position.z);
    this.hurtboxes[0].enabled = this.alive;
    this.stickRoot.position.set(this.position.x, this.position.y + 0.48, this.position.z);
    this.stickRoot.rotation.y = this.facing;
  }

  receiveHit(hit: HitInfo): HitResult {
    const res = emptyResult('flesh');
    if (!this.alive) { res.ignored = true; return res; }
    this.hp = Math.max(0, this.hp - hit.damage);
    res.damage = hit.damage;
    this.flash = 1.0;
    this.vel.x += hit.dir.x * 3.5;
    this.vel.z += hit.dir.z * 3.5;
    this.vel.y = 2.6;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.provoked = true;
      this.state = 'roar';
      this.stateT = 0;
      this.stateDur = 1.2;
    }
    return res;
  }

  update(dt: number, target: EnemyTarget | null, camera: THREE.Camera, drawingBufferSize?: THREE.Vector2) {
    if (dt > 0) {
      this.stateT += dt;
      this.pounceCooldown = Math.max(0, this.pounceCooldown - dt);
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
        const aggroDist = this.provoked ? 7.0 : 3.6;
        if (dist < aggroDist && this.state !== 'pounce' && this.state !== 'roar') {
          this.state = 'roar';
          this.stateT = 0;
          this.stateDur = 1.1;
        }

        if (this.state === 'idle') {
          if (this.stateT >= this.stateDur) {
            this.state = Math.random() < 0.78 ? 'walk' : 'roar';
            this.stateT = 0;
            this.stateDur = this.state === 'roar' ? 1.2 : rand(2.2, 3.8);
            const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
            this.targetYaw = toHome > 8.5
              ? Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.5, 0.5)
              : this.facing + rand(-1.4, 1.4);
          }
        } else if (this.state === 'walk') {
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 5.5);
          speed = 2.2;
          if (this.stateT >= this.stateDur) {
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.4, 2.8);
          }
        } else if (this.state === 'roar') {
          if (target && target.alive && dist < 8.0) {
            const toPlayer = Math.atan2(target.position.x - this.position.x, target.position.z - this.position.z);
            this.facing += angleDiff(this.facing, toPlayer) * Math.min(1, dt * 7);
          }
          if (this.stateT >= this.stateDur) {
            this.state = dist < aggroDist ? 'pounce' : 'idle';
            this.stateT = 0;
            this.stateDur = this.state === 'pounce' ? 2.2 : rand(1.4, 2.4);
          }
        } else if (this.state === 'pounce') {
          if (target && target.alive) {
            this.targetYaw = Math.atan2(target.position.x - this.position.x, target.position.z - this.position.z);
            this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 10);
          }
          speed = 5.2;
          if (this.motor.grounded && this.pounceCooldown <= 0 && dist < 3.6) {
            this.vel.y = 4.5;
            this.pounceCooldown = 1.1;
          }
          if (this.stateT >= this.stateDur && dist > aggroDist + 1.5 && this.motor.grounded) {
            this.provoked = false;
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.4, 2.4);
          }
        }

        this.vel.x = damp(this.vel.x, Math.sin(this.facing) * speed, 9, dt);
        this.vel.z = damp(this.vel.z, Math.cos(this.facing) * speed, 9, dt);
        this.vel.y -= 20 * dt;
        this.motor.update(dt);

        const targetPitch = !this.motor.grounded ? Math.max(-0.26, Math.min(0.26, this.vel.y * 0.045)) : 0;
        this.bodyPitch = damp(this.bodyPitch, targetPitch, 10, dt);

        const horiz = Math.hypot(this.vel.x, this.vel.z);
        if (horiz > 0.25 && this.motor.grounded) {
          this.gaitPhase += dt * 6.0 * (0.65 + horiz * 0.20);
        }
      }
      this.syncHurtbox();
    }

    let pose: LionPoseName;
    if (!this.alive) pose = 'idle0';
    else if (!this.motor.grounded) {
      pose = this.vel.y > 1.8 ? 'pounce1' : this.vel.y > -0.6 ? 'pounce2' : 'pounce3';
    } else if (this.state === 'roar') pose = pickCycle(LION_ROAR, this.stateT * 3.8);
    else if (this.state === 'pounce') {
      pose = this.pounceCooldown > 0.85 ? 'pounce0' : pickCycle(LION_WALK, (this.gaitPhase / Math.PI) * 3.0);
    } else if (this.state === 'walk') pose = pickCycle(LION_WALK, (this.gaitPhase / Math.PI) * 2.4);
    else pose = pickCycle(LION_IDLE, this.stateT * 1.8);

    const bob = this.alive && this.motor.grounded && (this.state === 'walk' || this.state === 'pounce')
      ? Math.abs(Math.sin(this.gaitPhase)) * 0.032
      : 0;
    const deathSink = this.alive ? 0 : Math.min(0.24, this.deadT * 0.4);
    this.renderBillboard(getLionPosePack(pose), this.position.y + 0.48 + bob - deathSink, camera, drawingBufferSize);
  }
}
