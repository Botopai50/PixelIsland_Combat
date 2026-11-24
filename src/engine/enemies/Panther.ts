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
// PANTERA NEGRA (Black Panther) — 56×42 @ 56 PPU (1.00m × 0.75m)
// ============================================================================
export type PantherPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'prowl0' | 'prowl1' | 'prowl2' | 'prowl3' | 'prowl4' | 'prowl5'
  | 'pounce0' | 'pounce1' | 'pounce2' | 'pounce3';

export const PANTHER_PW = 56;
export const PANTHER_PH = 42;
export const PANTHER_W = PANTHER_PW / ANIMAL_PPU;
export const PANTHER_H = PANTHER_PH / ANIMAL_PPU;

const PANTHER_PAL: Record<string, [number, number, number]> = {
  k:  [0x09, 0x0a, 0x10], // crisp 1px dark outline / eye slit / paw pads
  p0: [0x12, 0x14, 0x20], // deep obsidian shadow & melanistic ghost rosettes
  p1: [0x1d, 0x21, 0x33], // sleek midnight indigo-black coat base
  p2: [0x2e, 0x35, 0x4f], // cool slate-blue muscle midtone
  p3: [0x48, 0x54, 0x76], // steel-blue sheen on shoulders, spine & haunches
  p4: [0x6a, 0x7a, 0xa2], // crisp cool rim highlight along top musculature
  u0: [0x19, 0x1c, 0x2a], // charcoal-indigo belly / inner-ear shadow
  u1: [0x2a, 0x30, 0x45], // softer slate underside / throat / inner ear
  n0: [0x3d, 0x26, 0x2c], // dark dusty-rose/charcoal feline nose
  n1: [0x59, 0x37, 0x40], // nose bridge highlight
  e0: [0xd9, 0x7e, 0x0e], // deep amber eye rim
  e1: [0xff, 0xc8, 0x24], // glowing golden-amber iris
  e2: [0xff, 0xf2, 0x9c], // bright eye glint
  m:  [0x7d, 0x1f, 0x2d], // mouth interior on pounce / snarl
  W:  [0xf2, 0xef, 0xe6], // sharp white fangs & claw tips
};

interface PantherPose {
  bodyY: number;
  headY: number;
  headZ: number;
  headPitch: number;
  jawOpen: number;
  earBack: number;
  shoulderHunch: number;
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
  tailCurl: number;
}

const PANTHER_POSES: Record<PantherPoseName, PantherPose> = {
  // Alert, breathing idle with sinuous tail sway
  idle0: {
    bodyY: 0.0, headY: 0.0, headZ: 0.0, headPitch: 0.02, jawOpen: 0.0, earBack: 0.0, shoulderHunch: 0.0,
    flSwing: 0.02, flLift: 0.0, frSwing: -0.02, frLift: 0.0,
    blSwing: -0.02, blLift: 0.0, brSwing: 0.02, brLift: 0.0,
    tailLift: -0.04, tailSway: 0.08, tailCurl: 0.10,
  },
  idle1: {
    bodyY: 0.014, headY: 0.018, headZ: 0.015, headPitch: 0.06, jawOpen: 0.0, earBack: 0.05, shoulderHunch: 0.01,
    flSwing: 0.02, flLift: 0.0, frSwing: -0.02, frLift: 0.0,
    blSwing: -0.02, blLift: 0.0, brSwing: 0.02, brLift: 0.0,
    tailLift: 0.04, tailSway: 0.18, tailCurl: 0.16,
  },
  idle2: {
    bodyY: -0.01, headY: -0.012, headZ: 0.01, headPitch: -0.03, jawOpen: 0.0, earBack: 0.08, shoulderHunch: 0.0,
    flSwing: 0.02, flLift: 0.0, frSwing: -0.02, frLift: 0.0,
    blSwing: -0.02, blLift: 0.0, brSwing: 0.02, brLift: 0.0,
    tailLift: -0.08, tailSway: -0.16, tailCurl: 0.06,
  },

  // 6-frame low stalking feline prowl
  prowl0: {
    bodyY: -0.045, headY: -0.065, headZ: 0.065, headPitch: -0.07, jawOpen: 0.0, earBack: 0.28, shoulderHunch: 0.035,
    flSwing: 0.26, flLift: 0.14, frSwing: -0.20, frLift: 0.0,
    blSwing: -0.22, blLift: 0.0, brSwing: 0.22, brLift: 0.12,
    tailLift: -0.06, tailSway: 0.12, tailCurl: 0.14,
  },
  prowl1: {
    bodyY: -0.025, headY: -0.055, headZ: 0.075, headPitch: -0.06, jawOpen: 0.0, earBack: 0.26, shoulderHunch: 0.025,
    flSwing: 0.14, flLift: 0.04, frSwing: -0.06, frLift: 0.08,
    blSwing: -0.08, blLift: 0.08, brSwing: 0.12, brLift: 0.04,
    tailLift: -0.04, tailSway: 0.05, tailCurl: 0.12,
  },
  prowl2: {
    bodyY: -0.055, headY: -0.075, headZ: 0.065, headPitch: -0.08, jawOpen: 0.0, earBack: 0.30, shoulderHunch: 0.04,
    flSwing: -0.05, flLift: 0.0, frSwing: 0.12, frLift: 0.16,
    blSwing: 0.10, blLift: 0.14, brSwing: -0.05, brLift: 0.0,
    tailLift: -0.08, tailSway: -0.05, tailCurl: 0.10,
  },
  prowl3: {
    bodyY: -0.045, headY: -0.065, headZ: 0.065, headPitch: -0.07, jawOpen: 0.0, earBack: 0.28, shoulderHunch: 0.035,
    flSwing: -0.20, flLift: 0.0, frSwing: 0.26, frLift: 0.14,
    blSwing: 0.22, blLift: 0.12, brSwing: -0.22, brLift: 0.0,
    tailLift: -0.06, tailSway: -0.12, tailCurl: 0.14,
  },
  prowl4: {
    bodyY: -0.025, headY: -0.055, headZ: 0.075, headPitch: -0.06, jawOpen: 0.0, earBack: 0.26, shoulderHunch: 0.025,
    flSwing: -0.06, flLift: 0.08, frSwing: 0.14, frLift: 0.04,
    blSwing: 0.12, blLift: 0.04, brSwing: -0.08, brLift: 0.08,
    tailLift: -0.04, tailSway: -0.05, tailCurl: 0.12,
  },
  prowl5: {
    bodyY: -0.055, headY: -0.075, headZ: 0.065, headPitch: -0.08, jawOpen: 0.0, earBack: 0.30, shoulderHunch: 0.04,
    flSwing: 0.12, flLift: 0.16, frSwing: -0.05, frLift: 0.0,
    blSwing: -0.05, blLift: 0.0, brSwing: 0.10, brLift: 0.14,
    tailLift: -0.08, tailSway: 0.05, tailCurl: 0.10,
  },

  // 4-frame predatory pounce: coiled crouch -> explosive launch -> apex strike -> landing
  pounce0: {
    bodyY: -0.13, headY: -0.14, headZ: 0.08, headPitch: -0.12, jawOpen: 0.38, earBack: 0.78, shoulderHunch: 0.05,
    flSwing: 0.16, flLift: 0.0, frSwing: 0.10, frLift: 0.0,
    blSwing: 0.18, blLift: 0.0, brSwing: 0.14, brLift: 0.0,
    tailLift: 0.14, tailSway: 0.18, tailCurl: 0.20,
  },
  pounce1: {
    bodyY: 0.055, headY: -0.035, headZ: 0.11, headPitch: -0.04, jawOpen: 0.80, earBack: 0.85, shoulderHunch: 0.02,
    flSwing: 0.38, flLift: 0.48, frSwing: 0.30, frLift: 0.40,
    blSwing: -0.34, blLift: 0.24, brSwing: -0.26, brLift: 0.18,
    tailLift: 0.26, tailSway: 0.04, tailCurl: 0.08,
  },
  pounce2: {
    bodyY: 0.04, headY: -0.06, headZ: 0.13, headPitch: -0.08, jawOpen: 1.0, earBack: 0.92, shoulderHunch: 0.02,
    flSwing: 0.44, flLift: 0.54, frSwing: 0.38, frLift: 0.46,
    blSwing: -0.38, blLift: 0.32, brSwing: -0.32, brLift: 0.26,
    tailLift: 0.30, tailSway: -0.04, tailCurl: 0.06,
  },
  pounce3: {
    bodyY: -0.07, headY: -0.10, headZ: 0.09, headPitch: -0.10, jawOpen: 0.45, earBack: 0.65, shoulderHunch: 0.04,
    flSwing: 0.28, flLift: 0.04, frSwing: 0.22, frLift: 0.02,
    blSwing: -0.14, blLift: 0.18, brSwing: -0.08, brLift: 0.12,
    tailLift: 0.18, tailSway: -0.10, tailCurl: 0.16,
  },
};

const pantherCache = new Map<PantherPoseName, Boar27Pack>();
 function buildPantherPosePack(pose: PantherPoseName): Boar27Pack {
  let pack = pantherCache.get(pose);
  if (!pack) {
    const P = PANTHER_POSES[pose];
    const by = P.bodyY;
    const hPivotY = 0.20 + by + P.headY;
    const hPivotZ = 0.47 + P.headZ;
    const cosP = Math.cos(P.headPitch);
    const sinP = Math.sin(P.headPitch);
    const jawDrop = P.jawOpen * 0.13;
    const jawBack = P.jawOpen * 0.03;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // 1. Sleek, muscular feline torso: deep chest, sculpted shoulder blades, tapered athletic waist, powerful hindquarters
      const chest = sdEllipsoid(x, y, z, 0, 0.01 + by, 0.22, 0.195, 0.205, 0.255);
      const brisket = sdEllipsoid(x, y, z, 0, -0.09 + by, 0.26, 0.145, 0.115, 0.16);
      const scapulaL = sdEllipsoid(x, y, z, -0.105, 0.145 + by + P.shoulderHunch, 0.20, 0.095, 0.105, 0.165);
      const scapulaR = sdEllipsoid(x, y, z,  0.105, 0.145 + by + P.shoulderHunch, 0.20, 0.095, 0.105, 0.165);
      const waist = sdEllipsoid(x, y, z, 0, 0.055 + by, -0.08, 0.132, 0.132, 0.25);
      const rump = sdEllipsoid(x, y, z, 0, 0.045 + by, -0.34, 0.185, 0.18, 0.22);
      const hipL = sdEllipsoid(x, y, z, -0.115, 0.05 + by, -0.34, 0.095, 0.125, 0.145);
      const hipR = sdEllipsoid(x, y, z,  0.115, 0.05 + by, -0.34, 0.095, 0.125, 0.145);

      // Muscular feline neck
      const neck = sdCapsule(x, y, z, 0, 0.095 + by, 0.29, 0, hPivotY - 0.015, hPivotZ - 0.03, 0.148, 0.122);
      const throat = sdCapsule(x, y, z, 0, -0.01 + by, 0.31, 0, hPivotY - 0.065, hPivotZ - 0.01, 0.115, 0.088);

      let fur = smin(chest, brisket, 0.07);
      fur = smin(fur, Math.min(scapulaL, scapulaR), 0.065);
      fur = smin(fur, waist, 0.105);
      fur = smin(fur, rump, 0.105);
      fur = smin(fur, Math.min(hipL, hipR), 0.065);
      fur = smin(fur, smin(neck, throat, 0.06), 0.085);

      // 2. Predatory feline head in pitch-rotated local space
      const dy = y - hPivotY;
      const dz = z - hPivotZ;
      const lx = x;
      const lz = dz * cosP + dy * sinP;
      const ly = -dz * sinP + dy * cosP;

      const skull = sdEllipsoid(lx, ly, lz, 0, 0.012, 0.015, 0.138, 0.124, 0.152);
      const cheekL = sdEllipsoid(lx, ly, lz, -0.132, -0.022, -0.005, 0.088, 0.082, 0.098);
      const cheekR = sdEllipsoid(lx, ly, lz,  0.132, -0.022, -0.005, 0.088, 0.082, 0.098);
      const browL = sdCapsule(lx, ly, lz, -0.032, 0.088, 0.115, -0.115, 0.076, 0.095, 0.034, 0.028);
      const browR = sdCapsule(lx, ly, lz,  0.032, 0.088, 0.115,  0.115, 0.076, 0.095, 0.034, 0.028);
      const muzzle = sdCapsule(lx, ly, lz, 0, -0.008, 0.085, 0, -0.024, 0.235, 0.076, 0.056);
      const whiskerL = sdEllipsoid(lx, ly, lz, -0.044, -0.036, 0.215, 0.042, 0.032, 0.044);
      const whiskerR = sdEllipsoid(lx, ly, lz,  0.044, -0.036, 0.215, 0.042, 0.032, 0.044);
      const lowerJaw = sdCapsule(lx, ly, lz, 0, -0.055, 0.08, 0, -0.062 - jawDrop, 0.215 - jawBack, 0.054, 0.034);

      let headD = smin(skull, Math.min(cheekL, cheekR), 0.048);
      headD = smin(headD, Math.min(browL, browR), 0.028);
      headD = smin(headD, muzzle, 0.038);
      headD = smin(headD, Math.min(whiskerL, whiskerR), 0.022);
      headD = smin(headD, lowerJaw, P.jawOpen > 0.2 ? 0.018 : 0.035);
      fur = smin(fur, headD, 0.055);

      // Rounded feline ears with subtle ear-back pinning
      const earZ = -0.018 - P.earBack * 0.065;
      const earY = 0.125 - P.earBack * 0.022;
      const earL = sdEllipsoid(lx, ly, lz, -0.106, earY, earZ, 0.048, 0.052, 0.036);
      const earR = sdEllipsoid(lx, ly, lz,  0.106, earY, earZ, 0.048, 0.052, 0.036);
      const earBack = Math.min(earL, earR);
      fur = smin(fur, earBack, 0.022);

      const earInL = sdEllipsoid(lx, ly, lz, -0.104, earY + 0.002, earZ + 0.022, 0.028, 0.032, 0.018);
      const earInR = sdEllipsoid(lx, ly, lz,  0.104, earY + 0.002, earZ + 0.022, 0.028, 0.032, 0.018);
      const earInner = Math.min(earInL, earInR);

      // 3. Four muscular jointed feline legs with broad paws
      const frontLeg = (sx: number, swing: number, lift: number) => {
        const shY = 0.0 + by, shZ = 0.24;
        const elY = -0.24 + by * 0.45 + lift * 0.18;
        const elZ = 0.16 + swing * 0.50;
        const pwY = -0.52 + lift * 0.30;
        const pwZ = 0.25 + swing * 1.06;
        const upper = sdCapsule(x, y, z, sx, shY, shZ, sx, elY, elZ, 0.092, 0.060);
        const lower = sdCapsule(x, y, z, sx, elY, elZ, sx, pwY, pwZ, 0.056, 0.042);
        const paw = sdEllipsoid(x, y, z, sx, pwY - 0.012, pwZ + 0.046, 0.060, 0.035, 0.072);
        return smin(smin(upper, lower, 0.032), paw, 0.025);
      };
      const hindLeg = (sx: number, swing: number, lift: number) => {
        const hipY = 0.02 + by, hipZ = -0.32;
        const thigh = sdEllipsoid(x, y, z, sx * 1.04, -0.04 + by, -0.32 + swing * 0.16, 0.096, 0.135, 0.122);
        const hkY = -0.25 + by * 0.45 + lift * 0.18;
        const hkZ = -0.47 + (swing < 0 ? swing * 0.36 : swing * 0.62);
        const pwY = -0.52 + lift * 0.30;
        const pwZ = -0.36 + (swing < 0 ? swing * 1.22 : swing * 0.94);
        const upper = sdCapsule(x, y, z, sx, hipY, hipZ, sx, hkY, hkZ, 0.092, 0.054);
        const lower = sdCapsule(x, y, z, sx, hkY, hkZ, sx, pwY, pwZ, 0.052, 0.040);
        const paw = sdEllipsoid(x, y, z, sx, pwY - 0.012, pwZ + 0.046, 0.060, 0.035, 0.072);
        return smin(smin(thigh, upper, 0.04), smin(lower, paw, 0.025), 0.03);
      };

      const legs = Math.min(
        Math.min(frontLeg(-0.145, P.flSwing, P.flLift), frontLeg(0.145, P.frSwing, P.frLift)),
        Math.min(hindLeg(-0.15, P.blSwing, P.blLift), hindLeg(0.15, P.brSwing, P.brLift)),
      );
      fur = smin(fur, legs, 0.045);

      // 4. Long sinuous 3-segment S-curved panther tail
      const t1X = P.tailSway * 0.35;
      const t1Y = -0.09 + by * 0.55 + P.tailLift * 0.35;
      const t1Z = -0.68;
      const t2X = P.tailSway * 0.85;
      const t2Y = -0.11 + by * 0.35 + P.tailLift * 0.72;
      const t2Z = -0.92;
      const t3X = P.tailSway * 1.15;
      const t3Y = -0.02 + P.tailLift * 1.05 + P.tailCurl;
      const t3Z = -1.08;
      const tail1 = sdCapsule(x, y, z, 0, 0.04 + by, -0.48, t1X, t1Y, t1Z, 0.048, 0.042);
      const tail2 = sdCapsule(x, y, z, t1X, t1Y, t1Z, t2X, t2Y, t2Z, 0.040, 0.034);
      const tail3 = sdCapsule(x, y, z, t2X, t2Y, t2Z, t3X, t3Y, t3Z, 0.033, 0.024);
      const tailD = smin(smin(tail1, tail2, 0.03), tail3, 0.028);
      fur = smin(fur, tailD, 0.04);

      // 5. Facial features: glowing golden-amber eyes, feline nose, mouth & fangs
      const eyeL = sdEllipsoid(lx, ly, lz, -0.082, 0.036, 0.128, 0.035, 0.027, 0.032);
      const eyeR = sdEllipsoid(lx, ly, lz,  0.082, 0.036, 0.128, 0.035, 0.027, 0.032);
      const eyes = Math.min(eyeL, eyeR);
      const nose = sdEllipsoid(lx, ly, lz, 0, -0.010, 0.268, 0.038, 0.028, 0.030);

      let mouth = 99;
      let fangs = 99;
      if (P.jawOpen > 0.18) {
        mouth = sdEllipsoid(lx, ly, lz, 0, -0.046 - jawDrop * 0.42, 0.175, 0.048, 0.024 + jawDrop * 0.42, 0.068);
        const fUL = sdCapsule(lx, ly, lz, -0.036, -0.038, 0.212, -0.036, -0.082, 0.212, 0.013, 0.005);
        const fUR = sdCapsule(lx, ly, lz,  0.036, -0.038, 0.212,  0.036, -0.082, 0.212, 0.013, 0.005);
        fangs = Math.min(fUL, fUR);
      }

      let d = fur, mat = 'fur';
      if (earInner < d) { d = earInner; mat = 'earInner'; }
      if (mouth < d) { d = mouth; mat = 'mouth'; }
      if (fangs < d) { d = fangs; mat = 'fang'; }
      if (eyes < d) { d = eyes; mat = 'eye'; }
      if (nose < d) { d = nose; mat = 'nose'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'eye') {
        const dy = y - hPivotY;
        const dz = z - hPivotZ;
        const ly = -dz * sinP + dy * cosP;
        // Vertical feline pupil slit + bright upper glint
        const localEyeX = Math.abs(Math.abs(x) - 0.082);
        if (localEyeX < 0.007 && ly < 0.048) return 'k';
        if (ly > 0.044) return 'e2';
        return shade > 0.35 ? 'e1' : 'e0';
      }
      if (mat === 'nose') return shade > 0.52 ? 'n1' : 'n0';
      if (mat === 'mouth') return 'm';
      if (mat === 'fang') return 'W';
      if (mat === 'earInner') return shade > 0.45 ? 'u1' : 'u0';

      // Subtle underside / throat slate tone
      if (y < -0.07 + by && Math.abs(x) < 0.14 && z > -0.30 && z < 0.34) {
        return shade > 0.50 ? 'u1' : 'u0';
      }

      // Subtle melanistic leopard ghost-rosette shading on flanks, shoulders & haunches
      let s = shade;
      if (z > -0.46 && z < 0.32 && y > -0.22 + by) {
        const r1 = Math.sin(z * 21.0 + Math.cos(y * 18.0) * 1.35) * Math.cos(y * 20.0 + Math.abs(x) * 15.0);
        if (r1 > 0.46 && r1 < 0.78) {
          s -= 0.17;
        }
      }

      // Crisp cool slate-blue rim sheen along top musculature
      if (s > 0.84 && y > 0.02 + by) return 'p4';
      return s > 0.66 ? 'p3' : s > 0.42 ? 'p2' : s > 0.20 ? 'p1' : 'p0';
    };

    pack = build27Pack(PANTHER_PW, PANTHER_PH, 1.06, 0.78, PANTHER_PAL, evalFn, shadeFn);
    pantherCache.set(pose, pack);
  }
  return pack;
}

export function getPantherPosePack(...args: Parameters<typeof buildPantherPosePack>): ReturnType<typeof buildPantherPosePack> {
  return registerAnimalSpritePack(buildPantherPosePack(...args), { module: './Panther.ts', factory: 'getPantherPosePack', args }, buildPantherPosePack);
}

// ============================================================================
// INSTÂNCIA NA ARENA (Panther)
// ============================================================================
const PANTHER_IDLE: readonly PantherPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const PANTHER_PROWL: readonly PantherPoseName[] = ['prowl0', 'prowl1', 'prowl2', 'prowl3', 'prowl4', 'prowl5'];

/**
 * Black Panther: prowls stealthily and pounces if provoked.
 */
export class Panther extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private readonly home = new THREE.Vector3();
  private state: 'idle' | 'prowl' | 'pounce' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.4, 2.8);
  private targetYaw = rand(0, Math.PI * 2);
  private gaitPhase = rand(0, Math.PI * 2);
  private pounceCooldown = 0;
  private provoked = false;

  constructor(ctx: GameContext, pos: THREE.Vector3) {
    super(ctx, getPantherPosePack('idle0').getView(2, 0)!, PANTHER_PW, PANTHER_PH, PANTHER_W, PANTHER_H, 'PantherBillboard');
    this.hp = 85;
    this.maxHp = 85;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.48;
    this.motor.height = 0.90;
    this.motor.teleport(pos);
    this.home.copy(pos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.54, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.set(this.position.x, this.position.y + 0.44, this.position.z);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y + 0.24, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.64, this.position.z);
    this.hurtboxes[0].enabled = this.alive;
    this.stickRoot.position.set(this.position.x, this.position.y + 0.44, this.position.z);
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
      this.provoked = true;
      this.state = 'pounce';
      this.stateT = 0;
      this.stateDur = 2.4;
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
        const triggerDist = this.provoked ? 6.0 : 3.2;
        if (dist < triggerDist && this.state !== 'pounce') {
          this.state = 'pounce';
          this.stateT = 0;
          this.stateDur = 2.2;
        }

        if (this.state === 'idle') {
          if (this.stateT >= this.stateDur) {
            this.state = 'prowl';
            this.stateT = 0;
            this.stateDur = rand(2.0, 3.6);
            const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
            this.targetYaw = toHome > 8.0
              ? Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.5, 0.5)
              : this.facing + rand(-1.5, 1.5);
          }
        } else if (this.state === 'prowl') {
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 5.5);
          speed = 2.3;
          if (this.stateT >= this.stateDur) {
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.4, 2.6);
          }
        } else if (this.state === 'pounce') {
          if (target && target.alive) {
            this.targetYaw = Math.atan2(target.position.x - this.position.x, target.position.z - this.position.z);
            this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 10);
          }
          speed = 5.4;
          if (this.motor.grounded && this.pounceCooldown <= 0 && dist < 3.6) {
            this.vel.y = 4.6;
            this.pounceCooldown = 1.05;
          }
          if (this.stateT >= this.stateDur && dist > triggerDist + 1.5 && this.motor.grounded) {
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

        const targetPitch = !this.motor.grounded ? Math.max(-0.28, Math.min(0.28, this.vel.y * 0.045)) : 0;
        this.bodyPitch = damp(this.bodyPitch, targetPitch, 10, dt);

        const horiz = Math.hypot(this.vel.x, this.vel.z);
        if (horiz > 0.25 && this.motor.grounded) {
          this.gaitPhase += dt * 6.2 * (0.65 + horiz * 0.22);
        }
      }
      this.syncHurtbox();
    }

    let pose: PantherPoseName;
    if (!this.alive) pose = 'idle0';
    else if (!this.motor.grounded) {
      pose = this.vel.y > 1.8 ? 'pounce1' : this.vel.y > -0.6 ? 'pounce2' : 'pounce3';
    } else if (this.state === 'pounce') {
      pose = this.pounceCooldown > 0.85 ? 'pounce0' : pickCycle(PANTHER_PROWL, (this.gaitPhase / Math.PI) * 3.2);
    } else if (this.state === 'prowl') {
      pose = pickCycle(PANTHER_PROWL, (this.gaitPhase / Math.PI) * 2.4);
    } else {
      pose = pickCycle(PANTHER_IDLE, this.stateT * 2.0);
    }

    const bob = this.alive && this.motor.grounded && (this.state === 'prowl' || this.state === 'pounce')
      ? Math.abs(Math.sin(this.gaitPhase)) * 0.035
      : 0;
    const deathSink = this.alive ? 0 : Math.min(0.22, this.deadT * 0.4);
    this.renderBillboard(getPantherPosePack(pose), this.position.y + 0.44 + bob - deathSink, camera, drawingBufferSize);
  }
}
