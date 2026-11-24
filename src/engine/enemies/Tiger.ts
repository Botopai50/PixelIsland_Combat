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

// ============================================================================
// TIGRE DE BENGALA (Bengal Tiger) — Flagship 64×46 @ ANIMAL_PPU
// ============================================================================
export type TigerPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'prowl0' | 'prowl1' | 'prowl2' | 'prowl3' | 'prowl4' | 'prowl5'
  | 'roar0' | 'roar1' | 'roar2'
  | 'pounce0' | 'pounce1' | 'pounce2' | 'pounce3';

export const TIGER_PW = 64;
export const TIGER_PH = 46;
export const TIGER_W = TIGER_PW / ANIMAL_PPU;
export const TIGER_H = TIGER_PH / ANIMAL_PPU;

/** Fiery 5-tone orange-amber coat + jet-black stripes + snow-white cheek/belly + amber eyes. */
const TIGER_PAL: Record<string, [number, number, number]> = {
  k:  [0x14, 0x10, 0x0e], // crisp 1px outline / dark claws
  s0: [0x1c, 0x17, 0x15], // jet-black tiger stripes / ear backs / tail tip
  t0: [0x8c, 0x36, 0x0c], // deep burnt-orange shadow
  t1: [0xbd, 0x4f, 0x12], // rich orange-amber shadow
  t2: [0xe6, 0x70, 0x1a], // vibrant fiery Bengal orange midtone
  t3: [0xf7, 0x98, 0x34], // bright golden-orange highlight
  t4: [0xff, 0xc2, 0x62], // sunlit fiery-amber highlight
  w0: [0xc6, 0xbc, 0xb0], // snow-white belly/ruff shadow
  w1: [0xec, 0xe7, 0xde], // snow-white cheek/chest mid
  W:  [0xfd, 0xfc, 0xf8], // pure snow-white muzzle / fangs / eye glint / ear ocelli
  n:  [0xc8, 0x66, 0x6c], // dusty pink-black tiger nose
  e:  [0xff, 0xc2, 0x24], // piercing golden-amber eyes
  m:  [0x80, 0x20, 0x28], // open roar mouth interior
};

interface TigerPose {
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

const TIGER_POSES: Record<TigerPoseName, TigerPose> = {
  idle0: {
    bodyY: 0.0, headY: 0.0, headZ: 0.0, headPitch: 0.0, jawOpen: 0.0,
    flSwing: 0.02, flLift: 0, frSwing: -0.02, frLift: 0, blSwing: -0.02, blLift: 0, brSwing: 0.02, brLift: 0,
    tailLift: 0.0, tailSway: 0.0,
  },
  idle1: {
    bodyY: 0.012, headY: 0.018, headZ: 0.01, headPitch: 0.05, jawOpen: 0.0,
    flSwing: 0.02, flLift: 0, frSwing: -0.02, frLift: 0, blSwing: -0.02, blLift: 0, brSwing: 0.02, brLift: 0,
    tailLift: 0.04, tailSway: 0.08,
  },
  idle2: {
    bodyY: -0.010, headY: -0.012, headZ: 0.02, headPitch: -0.04, jawOpen: 0.0,
    flSwing: 0.02, flLift: 0, frSwing: -0.02, frLift: 0, blSwing: -0.02, blLift: 0, brSwing: 0.02, brLift: 0,
    tailLift: -0.02, tailSway: -0.08,
  },

  // 6-frame powerful low jungle stalk
  prowl0: {
    bodyY: -0.04, headY: -0.06, headZ: 0.06, headPitch: -0.08, jawOpen: 0.0,
    flSwing: 0.24, flLift: 0.08, frSwing: -0.15, frLift: 0.0, blSwing: -0.17, blLift: 0.0, brSwing: 0.17, brLift: 0.07,
    tailLift: -0.05, tailSway: 0.07,
  },
  prowl1: {
    bodyY: -0.03, headY: -0.06, headZ: 0.07, headPitch: -0.09, jawOpen: 0.0,
    flSwing: 0.11, flLift: 0.03, frSwing: -0.04, frLift: 0.05, blSwing: -0.06, blLift: 0.05, brSwing: 0.08, brLift: 0.03,
    tailLift: -0.04, tailSway: 0.03,
  },
  prowl2: {
    bodyY: -0.05, headY: -0.07, headZ: 0.05, headPitch: -0.07, jawOpen: 0.0,
    flSwing: -0.04, flLift: 0.0, frSwing: 0.11, frLift: 0.08, blSwing: 0.08, blLift: 0.07, brSwing: -0.05, brLift: 0.0,
    tailLift: -0.06, tailSway: -0.03,
  },
  prowl3: {
    bodyY: -0.04, headY: -0.06, headZ: 0.06, headPitch: -0.08, jawOpen: 0.0,
    flSwing: -0.15, flLift: 0.0, frSwing: 0.24, frLift: 0.08, blSwing: 0.17, blLift: 0.07, brSwing: -0.17, brLift: 0.0,
    tailLift: -0.05, tailSway: -0.07,
  },
  prowl4: {
    bodyY: -0.03, headY: -0.06, headZ: 0.07, headPitch: -0.09, jawOpen: 0.0,
    flSwing: -0.04, flLift: 0.05, frSwing: 0.11, frLift: 0.03, blSwing: 0.08, blLift: 0.03, brSwing: -0.06, brLift: 0.05,
    tailLift: -0.04, tailSway: -0.03,
  },
  prowl5: {
    bodyY: -0.05, headY: -0.07, headZ: 0.05, headPitch: -0.07, jawOpen: 0.0,
    flSwing: 0.11, flLift: 0.08, frSwing: -0.04, frLift: 0.0, blSwing: -0.05, blLift: 0.0, brSwing: 0.08, brLift: 0.07,
    tailLift: -0.06, tailSway: 0.03,
  },

  // 3-frame wide fanged tiger roar
  roar0: {
    bodyY: 0.01, headY: 0.05, headZ: 0.02, headPitch: 0.18, jawOpen: 0.58,
    flSwing: 0.06, flLift: 0, frSwing: 0.02, frLift: 0, blSwing: -0.04, blLift: 0, brSwing: -0.04, brLift: 0,
    tailLift: 0.08, tailSway: 0.05,
  },
  roar1: {
    bodyY: 0.02, headY: 0.09, headZ: 0.03, headPitch: 0.30, jawOpen: 1.0,
    flSwing: 0.08, flLift: 0, frSwing: 0.04, frLift: 0, blSwing: -0.06, blLift: 0, brSwing: -0.06, brLift: 0,
    tailLift: 0.15, tailSway: -0.05,
  },
  roar2: {
    bodyY: 0.01, headY: 0.04, headZ: 0.02, headPitch: 0.14, jawOpen: 0.45,
    flSwing: 0.05, flLift: 0, frSwing: 0.02, frLift: 0, blSwing: -0.04, blLift: 0, brSwing: -0.04, brLift: 0,
    tailLift: 0.06, tailSway: 0.02,
  },

  // 4-frame apex predator pounce
  pounce0: {
    bodyY: -0.10, headY: -0.10, headZ: 0.06, headPitch: -0.10, jawOpen: 0.28,
    flSwing: 0.14, flLift: 0.0, frSwing: 0.08, frLift: 0.0, blSwing: 0.14, blLift: 0.0, brSwing: 0.10, brLift: 0.0,
    tailLift: -0.08, tailSway: 0.0,
  },
  pounce1: {
    bodyY: 0.06, headY: -0.02, headZ: 0.10, headPitch: 0.02, jawOpen: 0.80,
    flSwing: 0.34, flLift: 0.34, frSwing: 0.26, frLift: 0.26, blSwing: -0.28, blLift: 0.18, brSwing: -0.22, brLift: 0.12,
    tailLift: 0.18, tailSway: 0.0,
  },
  pounce2: {
    bodyY: 0.04, headY: -0.04, headZ: 0.12, headPitch: -0.04, jawOpen: 0.96,
    flSwing: 0.40, flLift: 0.38, frSwing: 0.32, frLift: 0.30, blSwing: -0.34, blLift: 0.24, brSwing: -0.26, brLift: 0.18,
    tailLift: 0.22, tailSway: 0.04,
  },
  pounce3: {
    bodyY: -0.06, headY: -0.06, headZ: 0.06, headPitch: -0.06, jawOpen: 0.35,
    flSwing: 0.12, flLift: 0.0, frSwing: 0.16, frLift: 0.04, blSwing: 0.08, blLift: 0.06, brSwing: 0.04, brLift: 0.0,
    tailLift: 0.06, tailSway: -0.04,
  },
};

const tigerCache = new Map<TigerPoseName, Boar27Pack>();

 function buildTigerPosePack(pose: TigerPoseName): Boar27Pack {
  let pack = tigerCache.get(pose);
  if (!pack) {
    const P = TIGER_POSES[pose];
    const by = P.bodyY;
    const hPivotY = 0.20 + by + P.headY;
    const hPivotZ = 0.48 + P.headZ;
    const cosP = Math.cos(P.headPitch);
    const sinP = Math.sin(P.headPitch);
    const jawDrop = P.jawOpen * 0.14;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // 1. Huge, long, deeply muscular apex-cat torso
      const chest = sdEllipsoid(x, y, z, 0, 0.04 + by, 0.22, 0.245, 0.235, 0.29);
      const shoulders = sdEllipsoid(x, y, z, 0, 0.16 + by, 0.20, 0.205, 0.145, 0.22);
      const barrel = sdEllipsoid(x, y, z, 0, 0.05 + by, -0.09, 0.205, 0.195, 0.30);
      const rump = sdEllipsoid(x, y, z, 0, 0.05 + by, -0.36, 0.215, 0.205, 0.23);
      const neck = sdCapsule(x, y, z, 0, 0.11 + by, 0.30, 0, hPivotY - 0.02, hPivotZ - 0.04, 0.18, 0.15);

      let fur = smin(chest, shoulders, 0.07);
      fur = smin(fur, barrel, 0.10);
      fur = smin(fur, rump, 0.10);
      fur = smin(fur, neck, 0.08);

      // 2. Broad powerful head with fluffy white-fringed cheek ruff
      const dy = y - hPivotY;
      const dz = z - hPivotZ;
      const lx = x;
      const lz = dz * cosP + dy * sinP;
      const ly = -dz * sinP + dy * cosP;

      const skull = sdEllipsoid(lx, ly, lz, 0, 0.02, 0.02, 0.172, 0.148, 0.168);
      const ruffL = sdEllipsoid(lx, ly, lz, -0.155, -0.025, 0.00, 0.112, 0.105, 0.105);
      const ruffR = sdEllipsoid(lx, ly, lz,  0.155, -0.025, 0.00, 0.112, 0.105, 0.105);
      const upperMuzzle = sdCapsule(lx, ly, lz, 0, -0.005, 0.09, 0, -0.025, 0.25, 0.098, 0.072);
      const lowerJaw = sdCapsule(lx, ly, lz, 0, -0.055, 0.08, 0, -0.065 - jawDrop, 0.23 - P.jawOpen * 0.03, 0.074, 0.050);

      // Rounded ears (black backs with white ocelli spots)
      const earL = sdEllipsoid(lx, ly, lz, -0.132, 0.148, -0.02, 0.058, 0.056, 0.036);
      const earR = sdEllipsoid(lx, ly, lz,  0.132, 0.148, -0.02, 0.058, 0.056, 0.036);
      const ears = Math.min(earL, earR);

      let headD = smin(skull, Math.min(ruffL, ruffR), 0.05);
      headD = smin(headD, upperMuzzle, 0.04);
      headD = smin(headD, lowerJaw, P.jawOpen > 0.2 ? 0.02 : 0.04);
      headD = smin(headD, ears, 0.02);
      fur = smin(fur, headD, 0.06);

      // 3. Massive muscular legs & big paws
      const frontLeg = (sx: number, swing: number, lift: number) => {
        const shY = -0.02 + by, shZ = 0.25;
        const elY = -0.25 + by * 0.5 + lift * 0.25;
        const elZ = 0.20 + swing * 0.50;
        const pwY = -0.52 + lift * 0.40;
        const pwZ = 0.27 + swing * 0.95;
        const upper = sdCapsule(x, y, z, sx, shY, shZ, sx, elY, elZ, 0.108, 0.076);
        const lower = sdCapsule(x, y, z, sx, elY, elZ, sx, pwY, pwZ, 0.074, 0.058);
        const paw = sdEllipsoid(x, y, z, sx, pwY - 0.01, pwZ + 0.048, 0.076, 0.044, 0.092);
        return smin(smin(upper, lower, 0.03), paw, 0.025);
      };

      const hindLeg = (sx: number, swing: number, lift: number) => {
        const hipY = 0.0 + by, hipZ = -0.32;
        const thigh = sdEllipsoid(x, y, z, sx * 1.03, -0.04 + by, -0.33 + swing * 0.16, 0.112, 0.148, 0.132);
        const hkY = -0.26 + by * 0.5 + lift * 0.25;
        const hkZ = -0.46 + swing * 0.45;
        const pwY = -0.52 + lift * 0.40;
        const pwZ = -0.36 + swing * 0.95;
        const upper = sdCapsule(x, y, z, sx, hipY, hipZ, sx, hkY, hkZ, 0.105, 0.068);
        const lower = sdCapsule(x, y, z, sx, hkY, hkZ, sx, pwY, pwZ, 0.066, 0.054);
        const paw = sdEllipsoid(x, y, z, sx, pwY - 0.01, pwZ + 0.048, 0.076, 0.044, 0.092);
        return smin(smin(thigh, upper, 0.04), smin(lower, paw, 0.025), 0.03);
      };

      const legs = Math.min(
        Math.min(frontLeg(-0.175, P.flSwing, P.flLift), frontLeg(0.175, P.frSwing, P.frLift)),
        Math.min(hindLeg(-0.180, P.blSwing, P.blLift), hindLeg(0.180, P.brSwing, P.brLift)),
      );
      fur = smin(fur, legs, 0.045);

      // 4. Long black-ringed tail with black tip
      const tMidX = P.tailSway * 0.5;
      const tMidY = -0.08 + by * 0.5 + P.tailLift * 0.4;
      const tMidZ = -0.74;
      const tTipX = P.tailSway;
      const tTipY = -0.04 + P.tailLift * 0.9;
      const tTipZ = -0.98;
      const tail1 = sdCapsule(x, y, z, 0, 0.04 + by, -0.50, tMidX, tMidY, tMidZ, 0.064, 0.052);
      const tail2 = sdCapsule(x, y, z, tMidX, tMidY, tMidZ, tTipX, tTipY, tTipZ, 0.050, 0.038);
      const tailD = smin(tail1, tail2, 0.03);
      fur = smin(fur, tailD, 0.045);

      // Piercing golden-amber eyes + white glint + pink-black nose + roar mouth/fangs
      const eyeL = sdEllipsoid(lx, ly, lz, -0.094, 0.046, 0.148, 0.034, 0.028, 0.030);
      const eyeR = sdEllipsoid(lx, ly, lz,  0.094, 0.046, 0.148, 0.034, 0.028, 0.030);
      const eyes = Math.min(eyeL, eyeR);

      const glintL = sdEllipsoid(lx, ly, lz, -0.103, 0.055, 0.168, 0.012, 0.012, 0.012);
      const glintR = sdEllipsoid(lx, ly, lz,  0.103, 0.055, 0.168, 0.012, 0.012, 0.012);
      const glints = Math.min(glintL, glintR);

      const nose = sdEllipsoid(lx, ly, lz, 0, -0.016, 0.295, 0.044, 0.030, 0.026);

      let mouth = 99;
      let fangs = 99;
      if (P.jawOpen > 0.2) {
        mouth = sdEllipsoid(lx, ly, lz, 0, -0.042 - jawDrop * 0.42, 0.18, 0.058, 0.026 + jawDrop * 0.42, 0.075);
        const fL = sdCapsule(lx, ly, lz, -0.042, -0.035, 0.235, -0.042, -0.085, 0.235, 0.015, 0.006);
        const fR = sdCapsule(lx, ly, lz,  0.042, -0.035, 0.235,  0.042, -0.085, 0.235, 0.015, 0.006);
        fangs = Math.min(fL, fR);
      }

      let d = fur, mat = 'fur';
      if (ears < fur + 0.005 && lz < -0.01 && ly > 0.12) mat = 'earBack';
      if (tailD < fur + 0.006 && z < -0.56) mat = 'tail';
      if (mouth < d) { d = mouth; mat = 'mouth'; }
      if (fangs < d) { d = fangs; mat = 'fang'; }
      if (eyes < d) { d = eyes; mat = 'eye'; }
      if (glints < d) { d = glints; mat = 'glint'; }
      if (nose < d) { d = nose; mat = 'nose'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'glint' || mat === 'fang') return 'W';
      if (mat === 'eye') return 'e';
      if (mat === 'nose') return 'n';
      if (mat === 'mouth') return 'm';
      if (mat === 'earBack') {
        // White ocelli spot on back of black ears!
        const ocelli = Math.abs(Math.abs(x) - 0.132) < 0.025 && y > hPivotY + 0.13 && y < hPivotY + 0.17;
        return ocelli ? 'W' : 's0';
      }

      // Black-ringed tail with black tip
      if (mat === 'tail') {
        if (z < -0.88) return 's0';
        const ring = Math.sin(z * 34);
        if (ring > 0.35) return 's0';
        return shade > 0.60 ? 't3' : shade > 0.30 ? 't2' : 't1';
      }

      // Snow-white muzzle, fluffy cheek ruff, throat, chest & belly!
      const isBelly = y < -0.08 + by && y > -0.26 + by && z > -0.36 && z < 0.38 && Math.abs(x) < 0.16;
      const isChest = z > 0.36 && y < 0.12 + by && y > -0.20 + by && Math.abs(x) < 0.16;
      const isCheekRuff = z > 0.42 && y < hPivotY + 0.01 && Math.abs(x) > 0.08;
      const isMuzzleWhite = z > 0.62 && y < hPivotY - 0.01;
      if (isBelly || isChest || isCheekRuff || isMuzzleWhite) {
        return shade > 0.65 ? 'W' : shade > 0.35 ? 'w1' : 'w0';
      }

      // Crisp vertical jet-black tiger stripes along flanks, back, legs & forehead!
      const wave = Math.sin(y * 7.5) * 0.035;
      const bodyStripe = z < 0.42 && Math.sin((z + wave) * 26) > 0.56;
      const legStripe = y < -0.18 && Math.sin(y * 32) > 0.52;
      const browStripe = z > 0.46 && y > hPivotY + 0.06 && Math.sin(x * 36) > 0.48;
      if (bodyStripe || legStripe || browStripe) return 's0';

      return shade > 0.80 ? 't4' : shade > 0.58 ? 't3' : shade > 0.36 ? 't2' : shade > 0.18 ? 't1' : 't0';
    };

    pack = build27Pack(TIGER_PW, TIGER_PH, 1.12, 0.88, TIGER_PAL, evalFn, shadeFn);
    tigerCache.set(pose, pack);
  }
  return pack;
}

export function getTigerPosePack(...args: Parameters<typeof buildTigerPosePack>): ReturnType<typeof buildTigerPosePack> {
  return registerAnimalSpritePack(buildTigerPosePack(...args), { module: './Tiger.ts', factory: 'getTigerPosePack', args }, buildTigerPosePack);
}

// ============================================================================
// INSTÂNCIA NA ARENA (Tiger)
// ============================================================================
const TIG_IDLE: readonly TigerPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const TIG_PROWL: readonly TigerPoseName[] = ['prowl0', 'prowl1', 'prowl2', 'prowl3', 'prowl4', 'prowl5'];
const TIG_ROAR: readonly TigerPoseName[] = ['roar0', 'roar1', 'roar2'];
const TIG_POUNCE: readonly TigerPoseName[] = ['pounce0', 'pounce1', 'pounce2', 'pounce3'];

function pickCycle<T>(frames: readonly T[], idx: number): T {
  return sampleAnimalCycle(frames, idx);
}

export class Tiger extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private readonly home = new THREE.Vector3();
  private state: 'idle' | 'prowl' | 'roar' | 'pounce' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.4, 2.8);
  private targetYaw = rand(0, Math.PI * 2);
  private gaitPhase = rand(0, Math.PI * 2);
  private provoked = false;

  private readonly centerY = 0.44;

  constructor(ctx: GameContext, startPos: THREE.Vector3) {
    super(ctx, getTigerPosePack('idle0').getView(2, 0)!, TIGER_PW, TIGER_PH, TIGER_W, TIGER_H, 'TigerBillboard');
    this.hp = 105;
    this.maxHp = 105;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.48;
    this.motor.height = 0.90;
    this.motor.teleport(startPos);
    this.home.copy(startPos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.54, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.set(this.position.x, this.position.y + this.centerY, this.position.z);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y + 0.24, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.68, this.position.z);
    this.hurtboxes[0].enabled = this.alive;
    this.stickRoot.position.set(this.position.x, this.position.y + this.centerY, this.position.z);
    this.stickRoot.rotation.y = this.facing;
  }

  receiveHit(hit: HitInfo): HitResult {
    const res = emptyResult('flesh');
    if (!this.alive) { res.ignored = true; return res; }
    this.hp = Math.max(0, this.hp - hit.damage);
    res.damage = hit.damage;
    this.flash = 1.0;
    this.vel.x += hit.dir.x * 3.6;
    this.vel.z += hit.dir.z * 3.6;
    this.vel.y = 2.8;
    this.provoked = true;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.state = 'roar';
      this.stateT = 0;
      this.stateDur = 1.0;
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

        if (this.state === 'idle') {
          if (this.stateT >= this.stateDur) {
            this.state = Math.random() < 0.25 ? 'roar' : 'prowl';
            this.stateT = 0;
            this.stateDur = this.state === 'roar' ? 1.1 : rand(2.2, 3.8);
            const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
            this.targetYaw = toHome > 8.5
              ? Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.5, 0.5)
              : this.facing + rand(-1.6, 1.6);
          }
        } else if (this.state === 'prowl') {
          if (this.provoked && target && target.alive && dist < 6.0) {
            this.targetYaw = Math.atan2(target.position.x - this.position.x, target.position.z - this.position.z);
            if (dist < 3.0 && this.motor.grounded) {
              this.state = 'pounce';
              this.stateT = 0;
              this.stateDur = 0.85;
              this.vel.y = 4.5;
            }
          }
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 6);
          speed = this.provoked ? 4.2 : 2.3;
          if (this.stateT >= this.stateDur && this.motor.grounded) {
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.4, 2.6);
          }
        } else if (this.state === 'roar') {
          if (target && target.alive) {
            this.targetYaw = Math.atan2(target.position.x - this.position.x, target.position.z - this.position.z);
            this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 7);
          }
          if (this.stateT >= this.stateDur) {
            this.state = this.provoked ? 'prowl' : 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.8, 3.0);
          }
        } else if (this.state === 'pounce') {
          speed = this.stateT < 0.5 ? 6.2 : 1.5;
          if (this.stateT >= this.stateDur && this.motor.grounded) {
            this.state = 'prowl';
            this.stateT = 0;
            this.stateDur = 1.8;
          }
        }

        this.vel.x = damp(this.vel.x, Math.sin(this.facing) * speed, 9, dt);
        this.vel.z = damp(this.vel.z, Math.cos(this.facing) * speed, 9, dt);
        this.vel.y -= 20 * dt;
        this.motor.update(dt);

        const targetPitch = !this.motor.grounded ? Math.max(-0.24, Math.min(0.24, this.vel.y * 0.045)) : 0;
        this.bodyPitch = damp(this.bodyPitch, targetPitch, 10, dt);

        const horiz = Math.hypot(this.vel.x, this.vel.z);
        if (horiz > 0.25 && this.motor.grounded) {
          this.gaitPhase += dt * 5.6 * (0.65 + horiz * 0.22);
        }
      }
      this.syncHurtbox();
    }

    const horiz = Math.hypot(this.vel.x, this.vel.z);
    const bob = this.alive && this.motor.grounded && horiz > 0.25 && this.state === 'prowl'
      ? Math.abs(Math.sin(this.gaitPhase)) * 0.026
      : 0;

    let pose: TigerPoseName;
    if (!this.alive) pose = 'idle0';
    else if (this.state === 'pounce') pose = pickCycle(TIG_POUNCE, this.stateT * 4.8);
    else if (this.state === 'roar') pose = pickCycle(TIG_ROAR, this.stateT * 3.2);
    else if (this.state === 'prowl') pose = pickCycle(TIG_PROWL, (this.gaitPhase / Math.PI) * 2.6);
    else pose = pickCycle(TIG_IDLE, this.stateT * 2.0);

    const deathSink = this.alive ? 0 : Math.min(0.24, this.deadT * 0.4);
    this.renderBillboard(getTigerPosePack(pose), this.position.y + this.centerY + bob - deathSink, camera, drawingBufferSize);
  }
}
