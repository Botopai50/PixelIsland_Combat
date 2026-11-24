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
// 1. GUAXINIM (Raccoon) — 38×28 @ ANIMAL_PPU
// ============================================================================
export type RaccoonPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'walk0' | 'walk1' | 'walk2' | 'walk3' | 'walk4' | 'walk5';

export const RACCOON_PW = 38;
export const RACCOON_PH = 28;
export const RACCOON_W = RACCOON_PW / ANIMAL_PPU;
export const RACCOON_H = RACCOON_PH / ANIMAL_PPU;

const RACCOON_PAL: Record<string, [number, number, number]> = {
  k:  [0x14, 0x14, 0x18], // 1px outline / bandit eye mask / nose / tail rings
  g0: [0x3c, 0x38, 0x36], // dark grey-brown fur shadow
  g1: [0x62, 0x5c, 0x56], // grey-brown midtone
  g2: [0x8c, 0x84, 0x7b], // warm silver-grey fur highlight
  g3: [0xb8, 0xb0, 0xa4], // sunlit silver-grey ruff
  W:  [0xf6, 0xf4, 0xee], // white muzzle / brow trim / eye glint
};

interface QuadWalkPose {
  bodyY: number;
  headY: number;
  headSway: number;
  fl: number;
  fr: number;
  bl: number;
  br: number;
  flLift: number;
  frLift: number;
  blLift: number;
  brLift: number;
  tailSway: number;
}

const RACCOON_POSES: Record<RaccoonPoseName, QuadWalkPose> = {
  idle0: { bodyY: 0.0,   headY: 0.0,   headSway: 0.0,   fl: 0,     fr: 0,     bl: 0,     br: 0,     flLift: 0,    frLift: 0,    blLift: 0,    brLift: 0,    tailSway: 0.0 },
  idle1: { bodyY: 0.01,  headY: 0.02,  headSway: 0.03,  fl: 0,     fr: 0,     bl: 0,     br: 0,     flLift: 0,    frLift: 0,    blLift: 0,    brLift: 0,    tailSway: 0.05 },
  idle2: { bodyY: -0.01, headY: -0.01, headSway: -0.03, fl: 0,     fr: 0,     bl: 0,     br: 0,     flLift: 0,    frLift: 0,    blLift: 0,    brLift: 0,    tailSway: -0.05 },
  walk0: { bodyY: 0.012, headY: 0.0,   headSway: 0.01,  fl: 0.16,  fr: -0.12, bl: -0.14, br: 0.14,  flLift: 0.07, frLift: 0.0,  blLift: 0.0,  brLift: 0.06, tailSway: 0.06 },
  walk1: { bodyY: 0.02,  headY: 0.01,  headSway: 0.0,   fl: 0.08,  fr: -0.04, bl: -0.06, br: 0.07,  flLift: 0.03, frLift: 0.05, blLift: 0.05, brLift: 0.03, tailSway: 0.03 },
  walk2: { bodyY: -0.006,headY: 0.0,   headSway: -0.01, fl: -0.04, fr: 0.08,  bl: 0.06,  br: -0.04, flLift: 0.0,  frLift: 0.07, blLift: 0.06, brLift: 0.0,  tailSway: -0.03 },
  walk3: { bodyY: 0.012, headY: 0.0,   headSway: -0.01, fl: -0.12, fr: 0.16,  bl: 0.14,  br: -0.14, flLift: 0.0,  frLift: 0.07, blLift: 0.06, brLift: 0.0,  tailSway: -0.06 },
  walk4: { bodyY: 0.02,  headY: 0.01,  headSway: 0.0,   fl: -0.04, fr: 0.08,  bl: 0.07,  br: -0.06, flLift: 0.05, frLift: 0.03, blLift: 0.03, brLift: 0.05, tailSway: -0.03 },
  walk5: { bodyY: -0.006,headY: 0.0,   headSway: 0.01,  fl: 0.08,  fr: -0.04, bl: -0.04, br: 0.06,  flLift: 0.07, frLift: 0.0,  blLift: 0.0,  brLift: 0.06, tailSway: 0.03 },
};

const raccoonCache = new Map<RaccoonPoseName, Boar27Pack>();
 function buildRaccoonPosePack(pose: RaccoonPoseName): Boar27Pack {
  let pack = raccoonCache.get(pose);
  if (!pack) {
    const P = RACCOON_POSES[pose];
    const by = P.bodyY;
    const hy = 0.06 + by + P.headY;
    const hz = 0.38;
    const hx = P.headSway;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // Plump hunched bandit torso + bushy ringed tail
      const torso = sdEllipsoid(x, y, z, 0, 0.02 + by, -0.04, 0.24, 0.20, 0.34);
      const rump = sdEllipsoid(x, y, z, 0, 0.04 + by, -0.24, 0.22, 0.20, 0.22);
      const head = sdEllipsoid(x, y, z, hx, hy, hz, 0.15, 0.125, 0.15);
      const snout = sdCapsule(x, y, z, hx, hy - 0.02, hz + 0.08, hx, hy - 0.04, hz + 0.22, 0.075, 0.042);
      const earL = sdEllipsoid(x, y, z, hx - 0.11, hy + 0.12, hz - 0.02, 0.046, 0.052, 0.032);
      const earR = sdEllipsoid(x, y, z, hx + 0.11, hy + 0.12, hz - 0.02, 0.046, 0.052, 0.032);
      const tail = sdCapsule(x, y, z, 0, 0.02 + by, -0.38, P.tailSway, -0.02 + by, -0.82, 0.085, 0.105);

      const fl = sdCapsule(x, y, z, -0.14, -0.08 + by, 0.18, -0.14, -0.36 + P.flLift, 0.20 + P.fl, 0.058, 0.038);
      const fr = sdCapsule(x, y, z,  0.14, -0.08 + by, 0.18,  0.14, -0.36 + P.frLift, 0.20 + P.fr, 0.058, 0.038);
      const bl = sdCapsule(x, y, z, -0.15, -0.08 + by, -0.22, -0.15, -0.36 + P.blLift, -0.22 + P.bl, 0.065, 0.040);
      const br = sdCapsule(x, y, z,  0.15, -0.08 + by, -0.22,  0.15, -0.36 + P.brLift, -0.22 + P.br, 0.065, 0.040);

      let fur = smin(smin(torso, rump, 0.08), smin(smin(head, snout, 0.035), Math.min(earL, earR), 0.02), 0.06);
      fur = smin(fur, tail, 0.045);
      fur = smin(fur, Math.min(Math.min(fl, fr), Math.min(bl, br)), 0.035);

      const nose = sdEllipsoid(x, y, z, hx, hy - 0.04, hz + 0.25, 0.028, 0.024, 0.024);
      const glintL = sdEllipsoid(x, y, z, hx - 0.075, hy + 0.03, hz + 0.135, 0.012, 0.012, 0.012);
      const glintR = sdEllipsoid(x, y, z, hx + 0.075, hy + 0.03, hz + 0.135, 0.012, 0.012, 0.012);
      const glints = Math.min(glintL, glintR);

      let d = fur, mat = 'fur';
      if (tail < fur + 0.008 && z < -0.42) mat = 'tail';
      if (nose < d) { d = nose; mat = 'nose'; }
      if (glints < d) { d = glints; mat = 'glint'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'glint') return 'W';
      if (mat === 'nose') return 'k';
      if (mat === 'tail') {
        if (z < -0.76 || Math.sin(z * 32) > 0.28) return 'k';
        return shade > 0.55 ? 'g2' : 'g1';
      }
      // Iconic black bandit eye mask + white muzzle/brow trim!
      if (z > hz + 0.04 && y > hy - 0.02 && y < hy + 0.06 && Math.abs(x - hx) > 0.025) return 'k';
      if (z > hz + 0.12 && y <= hy - 0.02) return 'W';
      if (y < -0.28) return 'k'; // dark nimble paws
      return shade > 0.78 ? 'g3' : shade > 0.52 ? 'g2' : shade > 0.26 ? 'g1' : 'g0';
    };

    pack = build27Pack(RACCOON_PW, RACCOON_PH, 0.94, 0.68, RACCOON_PAL, evalFn, shadeFn);
    raccoonCache.set(pose, pack);
  }
  return pack;
}

export function getRaccoonPosePack(...args: Parameters<typeof buildRaccoonPosePack>): ReturnType<typeof buildRaccoonPosePack> {
  return registerAnimalSpritePack(buildRaccoonPosePack(...args), { module: './SavannaPack.ts', factory: 'getRaccoonPosePack', args }, buildRaccoonPosePack);
}

// ============================================================================
// 2. GIRAFA (Giraffe) — 64×92 @ ANIMAL_PPU
// ============================================================================
export type GiraffePoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'walk0' | 'walk1' | 'walk2' | 'walk3' | 'walk4' | 'walk5'
  | 'graze0' | 'graze1' | 'graze2';

export const GIRAFFE_PW = 64;
export const GIRAFFE_PH = 92;
export const GIRAFFE_W = GIRAFFE_PW / ANIMAL_PPU;
export const GIRAFFE_H = GIRAFFE_PH / ANIMAL_PPU;

const GIRAFFE_PAL: Record<string, [number, number, number]> = {
  k:  [0x16, 0x12, 0x10], // 1px outline / hooves / eyes / ossicone tips / tail tuft
  y0: [0xb4, 0x86, 0x38], // golden coat shadow
  y1: [0xdc, 0xb0, 0x58], // golden-cream midtone
  y2: [0xf4, 0xd4, 0x82], // bright sunlit golden coat
  p0: [0x58, 0x2c, 0x14], // chestnut polygonal patch shadow
  p1: [0x82, 0x44, 0x1e], // rich chestnut patch midtone
  p2: [0xa6, 0x5c, 0x2c], // sunlit chestnut patch
  W:  [0xfc, 0xfa, 0xf2], // pale cream lower legs / belly / eye glint
};

interface GiraffePose extends QuadWalkPose {
  neckDip: number;
}

const GIRAFFE_POSES: Record<GiraffePoseName, GiraffePose> = {
  idle0:  { bodyY: 0,    headY: 0,     headSway: 0,     fl: 0,    fr: 0,     bl: 0,     br: 0,    flLift: 0,    frLift: 0,    blLift: 0,    brLift: 0,    tailSway: 0,    neckDip: 0 },
  idle1:  { bodyY: 0.01, headY: 0.03,  headSway: 0.03,  fl: 0,    fr: 0,     bl: 0,     br: 0,    flLift: 0,    frLift: 0,    blLift: 0,    brLift: 0,    tailSway: 0.06, neckDip: -0.02 },
  idle2:  { bodyY: -0.01,headY: -0.02, headSway: -0.03, fl: 0,    fr: 0,     bl: 0,     br: 0,    flLift: 0,    frLift: 0,    blLift: 0,    brLift: 0,    tailSway: -0.06,neckDip: 0.03 },
  walk0:  { bodyY: 0.01, headY: 0.0,   headSway: 0.01,  fl: 0.18, fr: -0.14, bl: -0.14, br: 0.14, flLift: 0.12, frLift: 0.0,  blLift: 0.0,  brLift: 0.10, tailSway: 0.05, neckDip: 0.04 },
  walk1:  { bodyY: 0.02, headY: 0.01,  headSway: 0.0,   fl: 0.09, fr: -0.04, bl: -0.06, br: 0.07, flLift: 0.04, frLift: 0.08, blLift: 0.07, brLift: 0.04, tailSway: 0.02, neckDip: 0.06 },
  walk2:  { bodyY: -0.01,headY: 0.0,   headSway: -0.01, fl: -0.04,fr: 0.09,  bl: 0.06,  br: -0.05,flLift: 0.0,  frLift: 0.12, blLift: 0.10, brLift: 0.0,  tailSway: -0.02,neckDip: 0.02 },
  walk3:  { bodyY: 0.01, headY: 0.0,   headSway: -0.01, fl: -0.14,fr: 0.18,  bl: 0.14,  br: -0.14,flLift: 0.0,  frLift: 0.12, blLift: 0.10, brLift: 0.0,  tailSway: -0.05,neckDip: 0.04 },
  walk4:  { bodyY: 0.02, headY: 0.01,  headSway: 0.0,   fl: -0.04,fr: 0.09,  bl: 0.07,  br: -0.06,flLift: 0.08, frLift: 0.04, blLift: 0.04, brLift: 0.07, tailSway: -0.02,neckDip: 0.06 },
  walk5:  { bodyY: -0.01,headY: 0.0,   headSway: 0.01,  fl: 0.09, fr: -0.04, bl: -0.05, br: 0.06, flLift: 0.12, frLift: 0.0,  blLift: 0.0,  brLift: 0.10, tailSway: 0.02, neckDip: 0.02 },
  graze0: { bodyY: -0.02,headY: -0.10, headSway: 0.0,   fl: 0.08, fr: -0.04, bl: 0,     br: 0,    flLift: 0,    frLift: 0,    blLift: 0,    brLift: 0,    tailSway: 0.04, neckDip: 0.35 },
  graze1: { bodyY: -0.03,headY: -0.20, headSway: -0.03, fl: 0.12, fr: -0.06, bl: 0,     br: 0,    flLift: 0,    frLift: 0,    blLift: 0,    brLift: 0,    tailSway: -0.04,neckDip: 0.65 },
  graze2: { bodyY: -0.02,headY: -0.16, headSway: 0.03,  fl: 0.10, fr: -0.05, bl: 0,     br: 0,    flLift: 0,    frLift: 0,    blLift: 0,    brLift: 0,    tailSway: 0.02, neckDip: 0.55 },
};

const giraffeCache = new Map<GiraffePoseName, Boar27Pack>();
 function buildGiraffePosePack(pose: GiraffePoseName): Boar27Pack {
  let pack = giraffeCache.get(pose);
  if (!pack) {
    const P = GIRAFFE_POSES[pose];
    const by = P.bodyY;
    const nd = P.neckDip;
    const hy = 0.72 + by + P.headY - nd * 0.55;
    const hz = 0.32 + nd * 0.35;
    const hx = P.headSway;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // Sloped giraffe torso (high shoulders, lower rump) + towering long neck!
      const shoulders = sdEllipsoid(x, y, z, 0, 0.06 + by, 0.14, 0.19, 0.19, 0.22);
      const rump = sdEllipsoid(x, y, z, 0, -0.03 + by, -0.22, 0.17, 0.16, 0.20);
      const neck = sdCapsule(x, y, z, 0, 0.14 + by, 0.18, hx, hy - 0.04, hz - 0.04, 0.105, 0.064);
      const mane = sdCapsule(x, y, z, 0, 0.16 + by, 0.08, hx, hy - 0.02, hz - 0.11, 0.032, 0.022);

      // Refined giraffe head + ossicones + ears
      const head = sdEllipsoid(x, y, z, hx, hy, hz, 0.075, 0.068, 0.105);
      const snout = sdCapsule(x, y, z, hx, hy - 0.01, hz + 0.05, hx, hy - 0.04, hz + 0.19, 0.054, 0.036);
      const ossL = sdCapsule(x, y, z, hx - 0.036, hy + 0.055, hz - 0.02, hx - 0.042, hy + 0.155, hz - 0.03, 0.018, 0.014);
      const ossR = sdCapsule(x, y, z, hx + 0.036, hy + 0.055, hz - 0.02, hx + 0.042, hy + 0.155, hz - 0.03, 0.018, 0.014);
      const earL = sdCapsule(x, y, z, hx - 0.06, hy + 0.04, hz - 0.04, hx - 0.14, hy + 0.07, hz - 0.07, 0.024, 0.012);
      const earR = sdCapsule(x, y, z, hx + 0.06, hy + 0.04, hz - 0.04, hx + 0.14, hy + 0.07, hz - 0.07, 0.024, 0.012);

      // Very long slender stilt legs
      const leg = (sx: number, bz: number, sw: number, lf: number) =>
        sdCapsule(x, y, z, sx, -0.06 + by, bz, sx, -0.82 + lf, bz + sw, 0.052, 0.030);
      const legs = Math.min(
        Math.min(leg(-0.12, 0.16, P.fl, P.flLift), leg(0.12, 0.16, P.fr, P.frLift)),
        Math.min(leg(-0.12, -0.24, P.bl, P.blLift), leg(0.12, -0.24, P.br, P.brLift)),
      );
      const tail = sdCapsule(x, y, z, 0, -0.02 + by, -0.38, P.tailSway, -0.36 + by, -0.44, 0.022, 0.014);

      let coat = smin(smin(shoulders, rump, 0.08), neck, 0.07);
      coat = smin(coat, smin(head, snout, 0.03), 0.04);
      coat = smin(coat, Math.min(Math.min(ossL, ossR), Math.min(earL, earR)), 0.015);
      coat = smin(coat, legs, 0.035);
      coat = smin(coat, tail, 0.02);

      const eyeL = sdEllipsoid(x, y, z, hx - 0.058, hy + 0.02, hz + 0.06, 0.018, 0.018, 0.018);
      const eyeR = sdEllipsoid(x, y, z, hx + 0.058, hy + 0.02, hz + 0.06, 0.018, 0.018, 0.018);
      const eyes = Math.min(eyeL, eyeR);

      let d = coat, mat = 'coat';
      if (mane < d) { d = mane; mat = 'mane'; }
      if (eyes < d) { d = eyes; mat = 'eye'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'eye') return 'k';
      if (mat === 'mane') return 'p0';
      if (y < -0.76 || y > hy + 0.12) return 'k'; // dark hooves & ossicone tips
      if (y < -0.48) return shade > 0.45 ? 'W' : 'y1'; // pale cream lower legs
      // Iconic chestnut polygonal giraffe patches separated by narrow golden lines!
      const gx = x * 7.5, gy = (y - by) * 7.5, gz = z * 7.5;
      const cx = Math.floor(gx + 0.5), cy = Math.floor(gy + 0.5), cz = Math.floor(gz + 0.5);
      const dPatch = Math.max(Math.abs(gx - cx), Math.abs(gy - cy), Math.abs(gz - cz));
      if (dPatch < 0.36 && z < hz + 0.08) {
        return shade > 0.65 ? 'p2' : shade > 0.32 ? 'p1' : 'p0';
      }
      return shade > 0.68 ? 'y2' : shade > 0.34 ? 'y1' : 'y0';
    };

    pack = build27Pack(GIRAFFE_PW, GIRAFFE_PH, 1.06, 1.56, GIRAFFE_PAL, evalFn, shadeFn);
    giraffeCache.set(pose, pack);
  }
  return pack;
}

export function getGiraffePosePack(...args: Parameters<typeof buildGiraffePosePack>): ReturnType<typeof buildGiraffePosePack> {
  return registerAnimalSpritePack(buildGiraffePosePack(...args), { module: './SavannaPack.ts', factory: 'getGiraffePosePack', args }, buildGiraffePosePack);
}

// ============================================================================
// 3. ZEBRA (Zebra) — 68×60 @ ANIMAL_PPU
// ============================================================================
export type ZebraPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'trot0' | 'trot1' | 'trot2' | 'trot3' | 'trot4' | 'trot5'
  | 'gallop0' | 'gallop1' | 'gallop2' | 'gallop3' | 'gallop4' | 'gallop5';

export const ZEBRA_PW = 68;
export const ZEBRA_PH = 60;
export const ZEBRA_W = ZEBRA_PW / ANIMAL_PPU;
export const ZEBRA_H = ZEBRA_PH / ANIMAL_PPU;

const ZEBRA_PAL: Record<string, [number, number, number]> = {
  k:  [0x12, 0x12, 0x16], // 1px outline / crisp black stripes / hooves / muzzle / tail tuft
  b1: [0x2a, 0x2b, 0x34], // sunlit black stripe highlight
  w0: [0xa8, 0xa8, 0xb0], // white coat shadow
  w1: [0xdc, 0xdc, 0xe2], // white coat midtone
  W:  [0xfc, 0xfc, 0xfa], // bright snow-white coat / eye glint
};

const ZEBRA_POSES: Record<ZebraPoseName, QuadWalkPose> = {
  idle0:   { bodyY: 0,    headY: 0,    headSway: 0,     fl: 0,     fr: 0,     bl: 0,     br: 0,     flLift: 0,    frLift: 0,    blLift: 0,    brLift: 0,    tailSway: 0 },
  idle1:   { bodyY: 0.01, headY: 0.02, headSway: 0.03,  fl: 0,     fr: 0,     bl: 0,     br: 0,     flLift: 0,    frLift: 0,    blLift: 0,    brLift: 0,    tailSway: 0.06 },
  idle2:   { bodyY: -0.01,headY: -0.01,headSway: -0.03, fl: 0,     fr: 0,     bl: 0,     br: 0,     flLift: 0,    frLift: 0,    blLift: 0,    brLift: 0,    tailSway: -0.06 },
  trot0:   { bodyY: 0.02, headY: 0.01, headSway: 0.0,   fl: 0.20,  fr: -0.16, bl: -0.18, br: 0.18,  flLift: 0.12, frLift: 0.0,  blLift: 0.0,  brLift: 0.10, tailSway: 0.05 },
  trot1:   { bodyY: 0.03, headY: 0.02, headSway: 0.0,   fl: 0.10,  fr: -0.04, bl: -0.08, br: 0.08,  flLift: 0.04, frLift: 0.08, blLift: 0.08, brLift: 0.04, tailSway: 0.02 },
  trot2:   { bodyY: -0.01,headY: 0.0,  headSway: 0.0,   fl: -0.04, fr: 0.10,  bl: 0.08,  br: -0.06, flLift: 0.0,  frLift: 0.12, blLift: 0.10, brLift: 0.0,  tailSway: -0.02 },
  trot3:   { bodyY: 0.02, headY: 0.01, headSway: 0.0,   fl: -0.16, fr: 0.20,  bl: 0.18,  br: -0.18, flLift: 0.0,  frLift: 0.12, blLift: 0.10, brLift: 0.0,  tailSway: -0.05 },
  trot4:   { bodyY: 0.03, headY: 0.02, headSway: 0.0,   fl: -0.04, fr: 0.10,  bl: 0.08,  br: -0.08, flLift: 0.08, frLift: 0.04, blLift: 0.04, brLift: 0.08, tailSway: -0.02 },
  trot5:   { bodyY: -0.01,headY: 0.0,  headSway: 0.0,   fl: 0.10,  fr: -0.04, bl: -0.06, br: 0.08,  flLift: 0.12, frLift: 0.0,  blLift: 0.0,  brLift: 0.10, tailSway: 0.02 },
  gallop0: { bodyY: -0.02,headY: -0.04,headSway: 0.0,   fl: -0.14, fr: -0.22, bl: 0.24,  br: 0.16,  flLift: 0.10, frLift: 0.04, blLift: 0.20, brLift: 0.10, tailSway: 0.0 },
  gallop1: { bodyY: 0.04, headY: -0.05,headSway: 0.0,   fl: 0.20,  fr: 0.10,  bl: -0.16, br: -0.24, flLift: 0.24, frLift: 0.14, blLift: 0.10, brLift: 0.18, tailSway: 0.02 },
  gallop2: { bodyY: 0.06, headY: -0.06,headSway: 0.0,   fl: 0.34,  fr: 0.24,  bl: -0.32, br: -0.22, flLift: 0.30, frLift: 0.22, blLift: 0.28, brLift: 0.20, tailSway: 0.0 },
  gallop3: { bodyY: 0.02, headY: -0.04,headSway: 0.0,   fl: 0.24,  fr: 0.30,  bl: -0.16, br: -0.08, flLift: 0.10, frLift: 0.20, blLift: 0.22, brLift: 0.12, tailSway: -0.02 },
  gallop4: { bodyY: -0.03,headY: -0.03,headSway: 0.0,   fl: 0.04,  fr: 0.14,  bl: 0.12,  br: 0.20,  flLift: 0.0,  frLift: 0.04, blLift: 0.16, brLift: 0.24, tailSway: 0.0 },
  gallop5: { bodyY: -0.04,headY: -0.04,headSway: 0.0,   fl: -0.20, fr: -0.10, bl: 0.28,  br: 0.18,  flLift: 0.16, frLift: 0.08, blLift: 0.10, brLift: 0.04, tailSway: 0.0 },
};

const zebraCache = new Map<ZebraPoseName, Boar27Pack>();
 function buildZebraPosePack(pose: ZebraPoseName): Boar27Pack {
  let pack = zebraCache.get(pose);
  if (!pack) {
    const P = ZEBRA_POSES[pose];
    const by = P.bodyY;
    const hy = 0.42 + by + P.headY;
    const hz = 0.46;
    const hx = P.headSway;

    const evalFn: SdfEvaluator = (x, y, z) => {
      const chest = sdEllipsoid(x, y, z, 0, 0.06 + by, 0.20, 0.21, 0.22, 0.25);
      const barrel = sdEllipsoid(x, y, z, 0, 0.08 + by, -0.06, 0.20, 0.20, 0.28);
      const rump = sdEllipsoid(x, y, z, 0, 0.10 + by, -0.32, 0.21, 0.20, 0.22);
      const neck = sdCapsule(x, y, z, 0, 0.16 + by, 0.24, hx, hy - 0.04, hz - 0.06, 0.145, 0.095);
      // Iconic stiff upright striped zebra mane!
      const mane = sdCapsule(x, y, z, 0, 0.28 + by, 0.18, hx, hy + 0.08, hz - 0.10, 0.042, 0.036);

      const head = sdEllipsoid(x, y, z, hx, hy, hz, 0.102, 0.105, 0.13);
      const snout = sdCapsule(x, y, z, hx, hy - 0.01, hz + 0.06, hx, hy - 0.10, hz + 0.26, 0.078, 0.054);
      const earL = sdCapsule(x, y, z, hx - 0.055, hy + 0.10, hz - 0.02, hx - 0.085, hy + 0.23, hz - 0.02, 0.032, 0.012);
      const earR = sdCapsule(x, y, z, hx + 0.055, hy + 0.10, hz - 0.02, hx + 0.085, hy + 0.23, hz - 0.02, 0.032, 0.012);

      const leg = (sx: number, bz: number, sw: number, lf: number) =>
        sdCapsule(x, y, z, sx, -0.02 + by, bz, sx, -0.60 + lf, bz + sw, 0.068, 0.034);
      const legs = Math.min(
        Math.min(leg(-0.145, 0.22, P.fl, P.flLift), leg(0.145, 0.22, P.fr, P.frLift)),
        Math.min(leg(-0.150, -0.32, P.bl, P.blLift), leg(0.150, -0.32, P.br, P.brLift)),
      );
      const tail = sdCapsule(x, y, z, 0, 0.10 + by, -0.50, P.tailSway, -0.26 + by, -0.62, 0.038, 0.044);

      let coat = smin(smin(chest, barrel, 0.09), rump, 0.09);
      coat = smin(coat, neck, 0.07);
      coat = smin(coat, mane, 0.02);
      coat = smin(coat, smin(smin(head, snout, 0.035), Math.min(earL, earR), 0.02), 0.05);
      coat = smin(coat, legs, 0.035);
      coat = smin(coat, tail, 0.03);

      const eyeL = sdEllipsoid(x, y, z, hx - 0.082, hy + 0.02, hz + 0.08, 0.022, 0.020, 0.020);
      const eyeR = sdEllipsoid(x, y, z, hx + 0.082, hy + 0.02, hz + 0.08, 0.022, 0.020, 0.020);
      const eyes = Math.min(eyeL, eyeR);

      let d = coat, mat = 'coat';
      if (eyes < d) { d = eyes; mat = 'eye'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'eye') return 'k';
      if (y < -0.54 || z > hz + 0.22 || z < -0.56) return 'k'; // dark hooves, muzzle & tail tuft
      // Crisp black-and-white zebra stripes (vertical on torso/neck, horizontal on legs/rump!)
      const isLeg = y < -0.18;
      const stripeVal = isLeg ? Math.sin(y * 38) : Math.sin((z + y * 0.35) * 32 + Math.abs(x) * 4);
      if (stripeVal > 0.15) return shade > 0.65 ? 'b1' : 'k';
      return shade > 0.72 ? 'W' : shade > 0.38 ? 'w1' : 'w0';
    };

    pack = build27Pack(ZEBRA_PW, ZEBRA_PH, 1.14, 1.04, ZEBRA_PAL, evalFn, shadeFn);
    zebraCache.set(pose, pack);
  }
  return pack;
}

export function getZebraPosePack(...args: Parameters<typeof buildZebraPosePack>): ReturnType<typeof buildZebraPosePack> {
  return registerAnimalSpritePack(buildZebraPosePack(...args), { module: './SavannaPack.ts', factory: 'getZebraPosePack', args }, buildZebraPosePack);
}

// ============================================================================
// 4. TATU (Armadillo) — 36×22 @ ANIMAL_PPU
// ============================================================================
export type ArmadilloPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'walk0' | 'walk1' | 'walk2' | 'walk3' | 'walk4' | 'walk5';

export const ARMADILLO_PW = 36;
export const ARMADILLO_PH = 22;
export const ARMADILLO_W = ARMADILLO_PW / ANIMAL_PPU;
export const ARMADILLO_H = ARMADILLO_PH / ANIMAL_PPU;

const ARMADILLO_PAL: Record<string, [number, number, number]> = {
  k:  [0x18, 0x15, 0x14], // 1px outline / eye / nose / digging claws
  a0: [0x4c, 0x42, 0x3b], // armored plate shadow / band groove
  a1: [0x78, 0x6a, 0x5e], // armored carapace midtone
  a2: [0xa4, 0x94, 0x84], // armored plate highlight
  a3: [0xcc, 0xbe, 0xac], // sunlit plate rim
  p0: [0xb4, 0x8a, 0x7e], // soft underbelly / ears
};

const armadilloCache = new Map<ArmadilloPoseName, Boar27Pack>();
 function buildArmadilloPosePack(pose: ArmadilloPoseName): Boar27Pack {
  let pack = armadilloCache.get(pose);
  if (!pack) {
    const P = RACCOON_POSES[pose];
    const by = P.bodyY;

    const evalFn: SdfEvaluator = (x, y, z) => {
      const shell = sdEllipsoid(x, y, z, 0, 0.02 + by, -0.02, 0.24, 0.19, 0.36);
      const head = sdCapsule(x, y, z, 0, -0.04 + by, 0.30, 0, -0.08 + by, 0.54, 0.095, 0.036);
      const earL = sdCapsule(x, y, z, -0.07, 0.04 + by, 0.30, -0.11, 0.15 + by, 0.27, 0.028, 0.014);
      const earR = sdCapsule(x, y, z,  0.07, 0.04 + by, 0.30,  0.11, 0.15 + by, 0.27, 0.028, 0.014);
      const tail = sdCapsule(x, y, z, 0, -0.06 + by, -0.34, P.tailSway * 0.5, -0.16 + by, -0.78, 0.065, 0.020);
      const leg = (sx: number, bz: number, sw: number, lf: number) =>
        sdCapsule(x, y, z, sx, -0.10 + by, bz, sx, -0.26 + lf, bz + sw, 0.052, 0.036);
      const legs = Math.min(
        Math.min(leg(-0.14, 0.16, P.fl, P.flLift), leg(0.14, 0.16, P.fr, P.frLift)),
        Math.min(leg(-0.14, -0.18, P.bl, P.blLift), leg(0.14, -0.18, P.br, P.brLift)),
      );
      let body = smin(smin(shell, head, 0.04), Math.min(earL, earR), 0.015);
      body = smin(body, tail, 0.035);
      body = smin(body, legs, 0.03);

      const eyeL = sdEllipsoid(x, y, z, -0.065, -0.02 + by, 0.40, 0.018, 0.018, 0.018);
      const eyeR = sdEllipsoid(x, y, z,  0.065, -0.02 + by, 0.40, 0.018, 0.018, 0.018);
      const eyes = Math.min(eyeL, eyeR);

      let d = body, mat = 'shell';
      if (Math.min(earL, earR) < body + 0.008 && y > 0.06 + by) mat = 'ear';
      if (eyes < d) { d = eyes; mat = 'eye'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, _x, y, z) => {
      if (mat === 'eye') return 'k';
      if (mat === 'ear') return 'p0';
      if (y < -0.22) return 'k'; // digging claws
      // Armored banded carapace plates across the middle!
      if (z > -0.22 && z < 0.22 && Math.sin(z * 42) > 0.55) return 'a0';
      return shade > 0.78 ? 'a3' : shade > 0.50 ? 'a2' : shade > 0.24 ? 'a1' : 'a0';
    };

    pack = build27Pack(ARMADILLO_PW, ARMADILLO_PH, 0.96, 0.54, ARMADILLO_PAL, evalFn, shadeFn);
    armadilloCache.set(pose, pack);
  }
  return pack;
}

export function getArmadilloPosePack(...args: Parameters<typeof buildArmadilloPosePack>): ReturnType<typeof buildArmadilloPosePack> {
  return registerAnimalSpritePack(buildArmadilloPosePack(...args), { module: './SavannaPack.ts', factory: 'getArmadilloPosePack', args }, buildArmadilloPosePack);
}

// ============================================================================
// 5. TATU-BOLINHA (Three-Banded Armadillo) — 30×22 @ ANIMAL_PPU
// ============================================================================
export type ThreeBandedArmadilloPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'walk0' | 'walk1' | 'walk2' | 'walk3' | 'walk4' | 'walk5'
  | 'curl0' | 'curl1' | 'curl2';

export const THREE_BANDED_ARMADILLO_PW = 30;
export const THREE_BANDED_ARMADILLO_PH = 22;
export const THREE_BANDED_ARMADILLO_W = THREE_BANDED_ARMADILLO_PW / ANIMAL_PPU;
export const THREE_BANDED_ARMADILLO_H = THREE_BANDED_ARMADILLO_PH / ANIMAL_PPU;

const TATU_BOLA_PAL: Record<string, [number, number, number]> = {
  k:  [0x16, 0x13, 0x11], // 1px outline / eye / claws / band seams
  b0: [0x4e, 0x3b, 0x2a], // warm bronze-tan armor shadow
  b1: [0x7e, 0x62, 0x46], // warm ochre-tan armor midtone
  b2: [0xb2, 0x90, 0x6a], // golden-tan armor highlight
  b3: [0xdc, 0xc0, 0x9a], // sunlit armor peak
  s0: [0x9c, 0x7a, 0x62], // snout / ears
};

const tatuBolaCache = new Map<ThreeBandedArmadilloPoseName, Boar27Pack>();
 function buildThreeBandedArmadilloPosePack(pose: ThreeBandedArmadilloPoseName): Boar27Pack {
  let pack = tatuBolaCache.get(pose);
  if (!pack) {
    const isCurl = pose.startsWith('curl');
    const curlAmt = pose === 'curl0' ? 0.45 : pose === 'curl1' ? 0.80 : pose === 'curl2' ? 1.0 : 0.0;
    const P = isCurl ? RACCOON_POSES.idle0 : RACCOON_POSES[pose as ArmadilloPoseName];
    const by = P.bodyY;

    const evalFn: SdfEvaluator = (x, y, z) => {
      if (curlAmt >= 0.95) {
        // Tight armored sphere!
        const ball = sdEllipsoid(x, y, z, 0, -0.02, 0, 0.30, 0.29, 0.30);
        return { d: ball, mat: 'shell' };
      }
      const c = curlAmt;
      const shell = sdEllipsoid(x, y, z, 0, 0.03 + by, -0.02, 0.24 + c * 0.05, 0.20 + c * 0.07, 0.30 - c * 0.02);
      const head = sdCapsule(x, y, z, 0, -0.04 + by, 0.22 - c * 0.16, 0, -0.08 + by, 0.42 - c * 0.22, 0.085, 0.034);
      const tail = sdCapsule(x, y, z, 0, -0.06 + by, -0.28 + c * 0.12, 0, -0.14 + by, -0.46 + c * 0.20, 0.055, 0.024);
      const legY = -0.25 + c * 0.14;
      const leg = (sx: number, bz: number, sw: number, lf: number) =>
        sdCapsule(x, y, z, sx, -0.08 + by, bz, sx, legY + lf, bz + sw, 0.048, 0.032);
      const legs = Math.min(
        Math.min(leg(-0.13, 0.13, P.fl, P.flLift), leg(0.13, 0.13, P.fr, P.frLift)),
        Math.min(leg(-0.13, -0.14, P.bl, P.blLift), leg(0.13, -0.14, P.br, P.brLift)),
      );
      let body = smin(smin(shell, head, 0.035), tail, 0.03);
      body = smin(body, legs, 0.03);

      const eyeL = sdEllipsoid(x, y, z, -0.058, -0.02 + by, 0.30 - c * 0.18, 0.016, 0.016, 0.016);
      const eyeR = sdEllipsoid(x, y, z,  0.058, -0.02 + by, 0.30 - c * 0.18, 0.016, 0.016, 0.016);
      const eyes = Math.min(eyeL, eyeR);

      let d = body, mat = 'shell';
      if (eyes < d) { d = eyes; mat = 'eye'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, _x, y, z) => {
      if (mat === 'eye') return 'k';
      if (y < -0.21 && curlAmt < 0.5) return 'k';
      // 3 distinct movable armor bands across the center of the shell!
      if (Math.abs(z) < 0.12 && Math.sin(z * 54) > 0.58) return 'b0';
      return shade > 0.78 ? 'b3' : shade > 0.50 ? 'b2' : shade > 0.24 ? 'b1' : 'b0';
    };

    pack = build27Pack(THREE_BANDED_ARMADILLO_PW, THREE_BANDED_ARMADILLO_PH, 0.80, 0.56, TATU_BOLA_PAL, evalFn, shadeFn);
    tatuBolaCache.set(pose, pack);
  }
  return pack;
}

export function getThreeBandedArmadilloPosePack(...args: Parameters<typeof buildThreeBandedArmadilloPosePack>): ReturnType<typeof buildThreeBandedArmadilloPosePack> {
  return registerAnimalSpritePack(buildThreeBandedArmadilloPosePack(...args), { module: './SavannaPack.ts', factory: 'getThreeBandedArmadilloPosePack', args }, buildThreeBandedArmadilloPosePack);
}

// ============================================================================
// 6. KIWI (Kiwi) — 26×24 @ ANIMAL_PPU
// ============================================================================
export type KiwiPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'walk0' | 'walk1' | 'walk2' | 'walk3' | 'walk4' | 'walk5'
  | 'peck0' | 'peck1' | 'peck2';

export const KIWI_PW = 26;
export const KIWI_PH = 24;
export const KIWI_W = KIWI_PW / ANIMAL_PPU;
export const KIWI_H = KIWI_PH / ANIMAL_PPU;

const KIWI_PAL: Record<string, [number, number, number]> = {
  k:  [0x15, 0x12, 0x10], // 1px outline / beady dark eye
  f0: [0x3c, 0x28, 0x1a], // fuzzy brown plumage shadow
  f1: [0x5e, 0x40, 0x2a], // fuzzy warm-brown midtone
  f2: [0x84, 0x5c, 0x3e], // fuzzy golden-brown highlight
  f3: [0xa8, 0x7c, 0x56], // sunlit fuzzy rim
  b0: [0xc4, 0xa2, 0x74], // long slender curved ivory-tan beak shadow
  b1: [0xeb, 0xd4, 0xaa], // beak highlight
  W:  [0xfc, 0xfb, 0xf6], // tiny white eye glint
};

interface KiwiPose {
  bodyY: number;
  headDip: number;
  lSwing: number;
  rSwing: number;
  lLift: number;
  rLift: number;
}

const KIWI_POSES: Record<KiwiPoseName, KiwiPose> = {
  idle0: { bodyY: 0,    headDip: 0,    lSwing: 0,     rSwing: 0,     lLift: 0,    rLift: 0 },
  idle1: { bodyY: 0.01, headDip: -0.02,lSwing: 0,     rSwing: 0,     lLift: 0,    rLift: 0 },
  idle2: { bodyY: -0.01,headDip: 0.03, lSwing: 0,     rSwing: 0,     lLift: 0,    rLift: 0 },
  walk0: { bodyY: 0.01, headDip: 0.02, lSwing: 0.14,  rSwing: -0.10, lLift: 0.07, rLift: 0 },
  walk1: { bodyY: 0.02, headDip: 0.03, lSwing: 0.07,  rSwing: -0.03, lLift: 0.03, rLift: 0.05 },
  walk2: { bodyY: -0.01,headDip: 0.01, lSwing: -0.03, rSwing: 0.08,  lLift: 0,    rLift: 0.07 },
  walk3: { bodyY: 0.01, headDip: 0.02, lSwing: -0.10, rSwing: 0.14,  lLift: 0,    rLift: 0.07 },
  walk4: { bodyY: 0.02, headDip: 0.03, lSwing: -0.03, rSwing: 0.07,  lLift: 0.05, rLift: 0.03 },
  walk5: { bodyY: -0.01,headDip: 0.01, lSwing: 0.08,  rSwing: -0.03, lLift: 0.07, rLift: 0 },
  peck0: { bodyY: -0.01,headDip: 0.18, lSwing: 0.03,  rSwing: -0.03, lLift: 0,    rLift: 0 },
  peck1: { bodyY: -0.02,headDip: 0.34, lSwing: 0.04,  rSwing: -0.03, lLift: 0,    rLift: 0 },
  peck2: { bodyY: -0.01,headDip: 0.22, lSwing: 0.03,  rSwing: -0.03, lLift: 0,    rLift: 0 },
};

const kiwiCache = new Map<KiwiPoseName, Boar27Pack>();
 function buildKiwiPosePack(pose: KiwiPoseName): Boar27Pack {
  let pack = kiwiCache.get(pose);
  if (!pack) {
    const P = KIWI_POSES[pose];
    const by = P.bodyY;
    const hy = 0.10 + by - P.headDip * 0.5;
    const hz = 0.22 + P.headDip * 0.18;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // Pear-shaped round fuzzy flightless NZ bird (NO tail, NO wings!)
      const body = sdEllipsoid(x, y, z, 0, 0.02 + by, -0.04, 0.24, 0.23, 0.26);
      const head = sdEllipsoid(x, y, z, 0, hy, hz, 0.115, 0.105, 0.115);
      const fuzz = smin(body, head, 0.07);

      // Very long slender downward-curved kiwi beak!
      const bMidY = hy - 0.05 - P.headDip * 0.4;
      const bMidZ = hz + 0.22;
      const bTipY = hy - 0.14 - P.headDip * 0.7;
      const bTipZ = hz + 0.42;
      const beak1 = sdCapsule(x, y, z, 0, hy - 0.01, hz + 0.08, 0, bMidY, bMidZ, 0.026, 0.018);
      const beak2 = sdCapsule(x, y, z, 0, bMidY, bMidZ, 0, bTipY, bTipZ, 0.018, 0.010);
      const beak = smin(beak1, beak2, 0.01);

      // Sturdy brown kiwi legs
      const legL = sdCapsule(x, y, z, -0.09, -0.14 + by, -0.02, -0.09, -0.34 + P.lLift, 0.0 + P.lSwing, 0.036, 0.024);
      const legR = sdCapsule(x, y, z,  0.09, -0.14 + by, -0.02,  0.09, -0.34 + P.rLift, 0.0 + P.rSwing, 0.036, 0.024);
      const legs = Math.min(legL, legR);

      const eyeL = sdEllipsoid(x, y, z, -0.078, hy + 0.025, hz + 0.055, 0.022, 0.022, 0.022);
      const eyeR = sdEllipsoid(x, y, z,  0.078, hy + 0.025, hz + 0.055, 0.022, 0.022, 0.022);
      const eyes = Math.min(eyeL, eyeR);

      let d = fuzz, mat = 'fuzz';
      if (legs < d) { d = legs; mat = 'leg'; }
      if (beak < d) { d = beak; mat = 'beak'; }
      if (eyes < d) { d = eyes; mat = 'eye'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'eye') return 'k';
      if (mat === 'beak' || mat === 'leg') return shade > 0.48 ? 'b1' : 'b0';
      const hair = Math.sin(x * 30 + z * 26) * Math.cos(y * 28) * 0.07;
      const s = shade + hair;
      return s > 0.78 ? 'f3' : s > 0.50 ? 'f2' : s > 0.24 ? 'f1' : 'f0';
    };

    pack = build27Pack(KIWI_PW, KIWI_PH, 0.88, 0.64, KIWI_PAL, evalFn, shadeFn);
    kiwiCache.set(pose, pack);
  }
  return pack;
}

export function getKiwiPosePack(...args: Parameters<typeof buildKiwiPosePack>): ReturnType<typeof buildKiwiPosePack> {
  return registerAnimalSpritePack(buildKiwiPosePack(...args), { module: './SavannaPack.ts', factory: 'getKiwiPosePack', args }, buildKiwiPosePack);
}

// ============================================================================
// INSTÂNCIAS NA ARENA (SavannaPack)
// ============================================================================
class SavannaWildlife<TPose extends string> extends BasePixelAnimal {
  protected readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  protected get vel() { return this.motor.velocity; }
  protected home = new THREE.Vector3();
  protected state: 'idle' | 'special' | 'move' | 'react' = 'idle';
  protected stateT = 0;
  protected stateDur = rand(1.4, 2.8);
  protected targetYaw = rand(0, Math.PI * 2);
  protected gaitPhase = rand(0, Math.PI * 2);

  constructor(
    ctx: GameContext,
    startPos: THREE.Vector3,
    private readonly cfg: {
      name: string;
      hp: number;
      radius: number;
      height: number;
      centerY: number;
      pw: number;
      ph: number;
      w: number;
      h: number;
      walkSpeed: number;
      reactSpeed: number;
      reactDist: number;
      curlInBall?: boolean;
      getPack: (p: TPose) => Boar27Pack;
      pickPose: (s: 'idle' | 'special' | 'move' | 'react', t: number, gait: number, alive: boolean) => TPose;
    },
  ) {
    const firstPose = cfg.pickPose('idle', 0, 0, true);
    super(ctx, cfg.getPack(firstPose).getView(2, 0)!, cfg.pw, cfg.ph, cfg.w, cfg.h, cfg.name);
    this.hp = cfg.hp;
    this.maxHp = cfg.hp;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = cfg.radius;
    this.motor.height = cfg.height;
    this.motor.teleport(startPos);
    this.home.copy(startPos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: cfg.radius + 0.08, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.set(this.position.x, this.position.y + this.cfg.centerY, this.position.z);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y + this.cfg.centerY * 0.5, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + this.cfg.centerY * 1.4, this.position.z);
    this.hurtboxes[0].enabled = this.alive;
    this.stickRoot.position.set(this.position.x, this.position.y + this.cfg.centerY, this.position.z);
    this.stickRoot.rotation.y = this.facing;
  }

  receiveHit(hit: HitInfo): HitResult {
    const res = emptyResult('flesh');
    if (!this.alive) { res.ignored = true; return res; }
    const dmg = this.cfg.curlInBall && this.state === 'react' ? Math.max(2, Math.round(hit.damage * 0.3)) : hit.damage;
    this.hp = Math.max(0, this.hp - dmg);
    res.damage = dmg;
    this.flash = 1.0;
    this.vel.x += hit.dir.x * 3.6;
    this.vel.z += hit.dir.z * 3.6;
    this.vel.y = 2.6;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.state = 'react';
      this.stateT = 0;
      this.stateDur = 2.2;
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
        if (dist < this.cfg.reactDist && this.state !== 'react') {
          this.state = 'react';
          this.stateT = 0;
          this.stateDur = 2.0;
        }

        if (this.state === 'idle') {
          if (this.stateT >= this.stateDur) {
            this.state = Math.random() < 0.35 ? 'special' : 'move';
            this.stateT = 0;
            this.stateDur = rand(1.8, 3.4);
            const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
            this.targetYaw = toHome > 8.5
              ? Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.5, 0.5)
              : this.facing + rand(-1.6, 1.6);
          }
        } else if (this.state === 'special') {
          if (this.stateT >= this.stateDur) {
            this.state = 'move';
            this.stateT = 0;
            this.stateDur = rand(1.8, 3.2);
          }
        } else if (this.state === 'move') {
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 5.5);
          speed = this.cfg.walkSpeed;
          if (this.stateT >= this.stateDur && this.motor.grounded) {
            this.state = Math.random() < 0.4 ? 'special' : 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.5, 2.8);
          }
        } else if (this.state === 'react') {
          if (this.cfg.curlInBall) {
            speed = 0;
          } else if (target && target.alive) {
            this.targetYaw = Math.atan2(this.position.x - target.position.x, this.position.z - target.position.z);
            this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 8);
            speed = this.cfg.reactSpeed;
          }
          if (this.stateT >= this.stateDur && dist > this.cfg.reactDist + 1.5) {
            this.state = 'idle';
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
          this.gaitPhase += dt * 5.5 * (0.65 + horiz * 0.22);
        }
      }
      this.syncHurtbox();
    }

    const pose = this.cfg.pickPose(this.state, this.stateT, this.gaitPhase, this.alive);
    const deathSink = this.alive ? 0 : Math.min(0.22, this.deadT * 0.4);
    this.renderBillboard(this.cfg.getPack(pose), this.position.y + this.cfg.centerY - deathSink, camera, drawingBufferSize);
  }
}

const RAC_IDLE: readonly RaccoonPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const RAC_WALK: readonly RaccoonPoseName[] = ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'];

export class Raccoon extends SavannaWildlife<RaccoonPoseName> {
  constructor(ctx: GameContext, pos: THREE.Vector3) {
    super(ctx, pos, {
      name: 'RaccoonBillboard', hp: 35, radius: 0.28, height: 0.48, centerY: 0.22,
      pw: RACCOON_PW, ph: RACCOON_PH, w: RACCOON_W, h: RACCOON_H,
      walkSpeed: 2.0, reactSpeed: 4.5, reactDist: 3.4,
      getPack: getRaccoonPosePack,
      pickPose: (s, t, g, alive) => !alive ? 'idle0' : (s === 'move' || s === 'react') ? pickCycle(RAC_WALK, (g / Math.PI) * 2.6) : pickCycle(RAC_IDLE, t * 2.0),
    });
  }
}

const GIR_IDLE: readonly GiraffePoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const GIR_WALK: readonly GiraffePoseName[] = ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'];
const GIR_GRAZE: readonly GiraffePoseName[] = ['graze0', 'graze1', 'graze2', 'graze1'];

export class Giraffe extends SavannaWildlife<GiraffePoseName> {
  constructor(ctx: GameContext, pos: THREE.Vector3) {
    super(ctx, pos, {
      name: 'GiraffeBillboard', hp: 130, radius: 0.50, height: 1.75, centerY: 0.84,
      pw: GIRAFFE_PW, ph: GIRAFFE_PH, w: GIRAFFE_W, h: GIRAFFE_H,
      walkSpeed: 2.2, reactSpeed: 4.8, reactDist: 3.6,
      getPack: getGiraffePosePack,
      pickPose: (s, t, g, alive) => {
        if (!alive) return 'idle0';
        if (s === 'special') return pickCycle(GIR_GRAZE, t * 2.0);
        if (s === 'move' || s === 'react') return pickCycle(GIR_WALK, (g / Math.PI) * 2.4);
        return pickCycle(GIR_IDLE, t * 1.8);
      },
    });
  }
}

const ZEB_IDLE: readonly ZebraPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const ZEB_TROT: readonly ZebraPoseName[] = ['trot0', 'trot1', 'trot2', 'trot3', 'trot4', 'trot5'];
const ZEB_GALLOP: readonly ZebraPoseName[] = ['gallop0', 'gallop1', 'gallop2', 'gallop3', 'gallop4', 'gallop5'];

export class Zebra extends SavannaWildlife<ZebraPoseName> {
  constructor(ctx: GameContext, pos: THREE.Vector3) {
    super(ctx, pos, {
      name: 'ZebraBillboard', hp: 85, radius: 0.46, height: 1.12, centerY: 0.54,
      pw: ZEBRA_PW, ph: ZEBRA_PH, w: ZEBRA_W, h: ZEBRA_H,
      walkSpeed: 2.6, reactSpeed: 5.8, reactDist: 4.0,
      getPack: getZebraPosePack,
      pickPose: (s, t, g, alive) => {
        if (!alive) return 'idle0';
        if (s === 'react') return pickCycle(ZEB_GALLOP, (g / Math.PI) * 2.8);
        if (s === 'move') return pickCycle(ZEB_TROT, (g / Math.PI) * 2.6);
        return pickCycle(ZEB_IDLE, t * 1.8);
      },
    });
  }
}

const ARM_IDLE: readonly ArmadilloPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const ARM_WALK: readonly ArmadilloPoseName[] = ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'];

export class Armadillo extends SavannaWildlife<ArmadilloPoseName> {
  constructor(ctx: GameContext, pos: THREE.Vector3) {
    super(ctx, pos, {
      name: 'ArmadilloBillboard', hp: 40, radius: 0.26, height: 0.36, centerY: 0.17,
      pw: ARMADILLO_PW, ph: ARMADILLO_PH, w: ARMADILLO_W, h: ARMADILLO_H,
      walkSpeed: 1.8, reactSpeed: 4.2, reactDist: 3.0,
      getPack: getArmadilloPosePack,
      pickPose: (s, t, g, alive) => !alive ? 'idle0' : (s === 'move' || s === 'react') ? pickCycle(ARM_WALK, (g / Math.PI) * 2.8) : pickCycle(ARM_IDLE, t * 2.0),
    });
  }
}

const TB_IDLE: readonly ThreeBandedArmadilloPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const TB_WALK: readonly ThreeBandedArmadilloPoseName[] = ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'];

export class ThreeBandedArmadillo extends SavannaWildlife<ThreeBandedArmadilloPoseName> {
  constructor(ctx: GameContext, pos: THREE.Vector3) {
    super(ctx, pos, {
      name: 'ThreeBandedArmadilloBillboard', hp: 45, radius: 0.24, height: 0.34, centerY: 0.16,
      pw: THREE_BANDED_ARMADILLO_PW, ph: THREE_BANDED_ARMADILLO_PH, w: THREE_BANDED_ARMADILLO_W, h: THREE_BANDED_ARMADILLO_H,
      walkSpeed: 1.5, reactSpeed: 0, reactDist: 2.8, curlInBall: true,
      getPack: getThreeBandedArmadilloPosePack,
      pickPose: (s, t, g, alive) => {
        if (!alive) return 'curl2';
        if (s === 'react') return t < 0.14 ? 'curl0' : t < 0.28 ? 'curl1' : 'curl2';
        if (s === 'move') return pickCycle(TB_WALK, (g / Math.PI) * 2.8);
        return pickCycle(TB_IDLE, t * 2.0);
      },
    });
  }
}

const KIW_IDLE: readonly KiwiPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const KIW_WALK: readonly KiwiPoseName[] = ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'];
const KIW_PECK: readonly KiwiPoseName[] = ['peck0', 'peck1', 'peck2', 'peck1'];

export class Kiwi extends SavannaWildlife<KiwiPoseName> {
  constructor(ctx: GameContext, pos: THREE.Vector3) {
    super(ctx, pos, {
      name: 'KiwiBillboard', hp: 25, radius: 0.22, height: 0.36, centerY: 0.18,
      pw: KIWI_PW, ph: KIWI_PH, w: KIWI_W, h: KIWI_H,
      walkSpeed: 1.7, reactSpeed: 3.8, reactDist: 3.0,
      getPack: getKiwiPosePack,
      pickPose: (s, t, g, alive) => {
        if (!alive) return 'idle0';
        if (s === 'special') return pickCycle(KIW_PECK, t * 3.0);
        if (s === 'move' || s === 'react') return pickCycle(KIW_WALK, (g / Math.PI) * 2.8);
        return pickCycle(KIW_IDLE, t * 2.2);
      },
    });
  }
}
