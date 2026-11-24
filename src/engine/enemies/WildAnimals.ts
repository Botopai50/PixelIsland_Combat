import { sampleAnimalCycle } from './AnimalAnimation';
import { registerAnimalSpritePack } from './AnimalSpriteCache';
﻿import * as THREE from 'three';
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
// 1. PATO (Mallard Duck) â€” 34Ã—30
// ============================================================================
export type DuckPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'quack0' | 'quack1' | 'quack2'
  | 'waddle0' | 'waddle1' | 'waddle2' | 'waddle3' | 'waddle4' | 'waddle5'
  | 'flap0' | 'flap1' | 'flap2' | 'flap3';

export const DUCK_PW = 34;
export const DUCK_PH = 30;
export const DUCK_W = DUCK_PW / ANIMAL_PPU;
export const DUCK_H = DUCK_PH / ANIMAL_PPU;

const DUCK_PAL: Record<string, [number, number, number]> = {
  k:  [0x14, 0x16, 0x1a], // crisp dark outline / eyes
  h0: [0x0f, 0x42, 0x2e], // emerald head shadow
  h1: [0x1b, 0x6e, 0x49], // emerald head mid
  h2: [0x33, 0x9c, 0x67], // emerald iridescent highlight
  W:  [0xf2, 0xf0, 0xe8], // white neck ring / tail edge
  r0: [0x4f, 0x26, 0x18], // chestnut breast shadow
  r1: [0x7a, 0x3b, 0x24], // chestnut breast mid
  b0: [0x4a, 0x43, 0x3d], // brown-grey body shadow
  b1: [0x78, 0x70, 0x68], // brown-grey body mid
  b2: [0xa6, 0x9e, 0x94], // light grey flank
  u0: [0x26, 0x4a, 0x8c], // blue speculum wing patch
  y0: [0xc4, 0x76, 0x18], // bill / feet shadow
  y1: [0xf2, 0xad, 0x24], // yellow-orange bill / feet
  y2: [0xff, 0xd4, 0x5c], // bill highlight
};

interface DuckPose {
  bodyY: number;
  bodyRoll: number;
  headY: number;
  headZ: number;
  billOpen: number;
  wingSpread: number;
  wingLift: number;
  fl: number;
  fr: number;
  flLift: number;
  frLift: number;
  tailWag: number;
}

const DUCK_POSES: Record<DuckPoseName, DuckPose> = {
  idle0:   { bodyY: 0.0,   bodyRoll: 0.0,   headY: 0.0,   headZ: 0.0,   billOpen: 0.0,  wingSpread: 0.0,  wingLift: 0.0,   fl: 0.0,   fr: 0.0,   flLift: 0.0,  frLift: 0.0,  tailWag: 0.0 },
  idle1:   { bodyY: 0.015, bodyRoll: 0.02,  headY: 0.03,  headZ: 0.02,  billOpen: 0.0,  wingSpread: 0.0,  wingLift: 0.0,   fl: 0.0,   fr: 0.0,   flLift: 0.0,  frLift: 0.0,  tailWag: 0.04 },
  idle2:   { bodyY: -0.01, bodyRoll: -0.02, headY: -0.02, headZ: -0.01, billOpen: 0.0,  wingSpread: 0.0,  wingLift: 0.0,   fl: 0.0,   fr: 0.0,   flLift: 0.0,  frLift: 0.0,  tailWag: -0.04 },

  quack0:  { bodyY: 0.01,  bodyRoll: 0.0,   headY: 0.06,  headZ: 0.05,  billOpen: 0.45, wingSpread: 0.10, wingLift: 0.05,  fl: 0.0,   fr: 0.0,   flLift: 0.0,  frLift: 0.0,  tailWag: 0.06 },
  quack1:  { bodyY: 0.02,  bodyRoll: 0.0,   headY: 0.10,  headZ: 0.08,  billOpen: 0.90, wingSpread: 0.18, wingLift: 0.10,  fl: 0.0,   fr: 0.0,   flLift: 0.0,  frLift: 0.0,  tailWag: -0.06 },
  quack2:  { bodyY: 0.0,   bodyRoll: 0.0,   headY: 0.04,  headZ: 0.03,  billOpen: 0.30, wingSpread: 0.08, wingLift: 0.04,  fl: 0.0,   fr: 0.0,   flLift: 0.0,  frLift: 0.0,  tailWag: 0.04 },

  waddle0: { bodyY: 0.02,  bodyRoll: 0.10,  headY: 0.01,  headZ: 0.04,  billOpen: 0.0,  wingSpread: 0.04, wingLift: 0.0,   fl: 0.22,  fr: -0.16, flLift: 0.12, frLift: 0.0,  tailWag: 0.08 },
  waddle1: { bodyY: 0.03,  bodyRoll: 0.06,  headY: 0.02,  headZ: 0.02,  billOpen: 0.0,  wingSpread: 0.04, wingLift: 0.0,   fl: 0.12,  fr: -0.06, flLift: 0.04, frLift: 0.06, tailWag: 0.04 },
  waddle2: { bodyY: -0.01, bodyRoll: -0.02, headY: -0.01, headZ: 0.0,   billOpen: 0.0,  wingSpread: 0.04, wingLift: 0.0,   fl: -0.04, fr: 0.08,  flLift: 0.0,  frLift: 0.12, tailWag: -0.02 },
  waddle3: { bodyY: 0.02,  bodyRoll: -0.10, headY: 0.01,  headZ: 0.04,  billOpen: 0.0,  wingSpread: 0.04, wingLift: 0.0,   fl: -0.16, fr: 0.22,  flLift: 0.0,  frLift: 0.12, tailWag: -0.08 },
  waddle4: { bodyY: 0.03,  bodyRoll: -0.06, headY: 0.02,  headZ: 0.02,  billOpen: 0.0,  wingSpread: 0.04, wingLift: 0.0,   fl: -0.06, fr: 0.12,  flLift: 0.06, frLift: 0.04, tailWag: -0.04 },
  waddle5: { bodyY: -0.01, bodyRoll: 0.02,  headY: -0.01, headZ: 0.0,   billOpen: 0.0,  wingSpread: 0.04, wingLift: 0.0,   fl: 0.08,  fr: -0.04, flLift: 0.12, frLift: 0.0,  tailWag: 0.02 },

  flap0:   { bodyY: 0.04,  bodyRoll: 0.0,   headY: 0.08,  headZ: 0.12,  billOpen: 0.65, wingSpread: 0.65, wingLift: 0.36,  fl: -0.18, fr: -0.12, flLift: 0.16, frLift: 0.14, tailWag: 0.0 },
  flap1:   { bodyY: 0.08,  bodyRoll: 0.0,   headY: 0.10,  headZ: 0.15,  billOpen: 0.85, wingSpread: 0.88, wingLift: 0.56,  fl: -0.22, fr: -0.18, flLift: 0.22, frLift: 0.20, tailWag: 0.0 },
  flap2:   { bodyY: 0.06,  bodyRoll: 0.0,   headY: 0.07,  headZ: 0.13,  billOpen: 0.70, wingSpread: 0.78, wingLift: -0.10, fl: -0.16, fr: -0.22, flLift: 0.18, frLift: 0.22, tailWag: 0.0 },
  flap3:   { bodyY: 0.03,  bodyRoll: 0.0,   headY: 0.06,  headZ: 0.10,  billOpen: 0.50, wingSpread: 0.52, wingLift: 0.16,  fl: -0.10, fr: -0.14, flLift: 0.12, frLift: 0.14, tailWag: 0.0 },
};

const duckCache = new Map<DuckPoseName, Boar27Pack>();
 function buildDuckPosePack(pose: DuckPoseName): Boar27Pack {
  let pack = duckCache.get(pose);
  if (!pack) {
    const P = DUCK_POSES[pose];
    const by = P.bodyY;
    const hy = 0.36 + by + P.headY;
    const hz = 0.34 + P.headZ;
    const cosR = Math.cos(P.bodyRoll);
    const sinR = Math.sin(P.bodyRoll);

    const evalFn: SdfEvaluator = (x, y, z) => {
      // Roll subtle body coordinates for waddle
      const rx = x * cosR - (y - by) * sinR;
      const ry = x * sinR + (y - by) * cosR + by;

      // Plump boat-shaped mallard body
      const torso = sdEllipsoid(rx, ry, z, 0, -0.04 + by, -0.02, 0.26, 0.21, 0.38);
      const breast = sdEllipsoid(rx, ry, z, 0, -0.02 + by, 0.20, 0.22, 0.19, 0.22);
      const tail = sdCapsule(rx, ry, z, 0, 0.02 + by, -0.32, P.tailWag, 0.14 + by, -0.58, 0.12, 0.032);

      // Upright S-neck & rounded emerald head
      const neck = sdCapsule(x, y, z, 0, 0.08 + by, 0.24, 0, hy - 0.04, hz - 0.04, 0.115, 0.095);
      const head = sdEllipsoid(x, y, z, 0, hy, hz, 0.135, 0.125, 0.155);

      let body = smin(torso, breast, 0.08);
      body = smin(body, tail, 0.05);
      body = smin(body, smin(neck, head, 0.05), 0.07);

      // Wings (folded along flanks or spread wide when flapping)
      const ws = P.wingSpread;
      const wl = P.wingLift;
      const wBaseY = 0.02 + by;
      const wTipX = 0.25 + ws * 0.52;
      const wTipY = -0.02 + by + wl * 0.42;
      const wTipZ = -0.26 + ws * 0.16;
      const wingL = sdCapsule(rx, ry, z, -0.21, wBaseY, 0.06, -wTipX, wTipY, wTipZ, 0.095, 0.045);
      const wingR = sdCapsule(rx, ry, z,  0.21, wBaseY, 0.06,  wTipX, wTipY, wTipZ, 0.095, 0.045);
      const wings = Math.min(wingL, wingR);
      body = smin(body, wings, 0.04);

      // Flat duck bill (upper & lower mandible when quacking)
      const billTop = sdCapsule(x, y, z, 0, hy - 0.02, hz + 0.11, 0, hy - 0.035 + P.billOpen * 0.03, hz + 0.34, 0.062, 0.038);
      const billBot = P.billOpen > 0.1
        ? sdCapsule(x, y, z, 0, hy - 0.055, hz + 0.10, 0, hy - 0.075 - P.billOpen * 0.07, hz + 0.30, 0.048, 0.028)
        : 99;
      const bill = Math.min(billTop, billBot);

      // Webbed orange legs & feet
      const legL = sdCapsule(x, y, z, -0.11, -0.20 + by, -0.02, -0.12, -0.44 + P.flLift, 0.02 + P.fl, 0.040, 0.032);
      const footL = sdEllipsoid(x, y, z, -0.12, -0.46 + P.flLift, 0.09 + P.fl, 0.072, 0.024, 0.105);
      const legR = sdCapsule(x, y, z,  0.11, -0.20 + by, -0.02,  0.12, -0.44 + P.frLift, 0.02 + P.fr, 0.040, 0.032);
      const footR = sdEllipsoid(x, y, z,  0.12, -0.46 + P.frLift, 0.09 + P.fr, 0.072, 0.024, 0.105);
      const feet = Math.min(smin(legL, footL, 0.02), smin(legR, footR, 0.02));

      // Crisp dark eyes
      const eyeL = sdEllipsoid(x, y, z, -0.105, hy + 0.035, hz + 0.075, 0.032, 0.032, 0.032);
      const eyeR = sdEllipsoid(x, y, z,  0.105, hy + 0.035, hz + 0.075, 0.032, 0.032, 0.032);
      const eyes = Math.min(eyeL, eyeR);

      let d = body, mat = 'body';
      if (wings < body + 0.008 && Math.abs(rx) > 0.22) mat = 'wing';
      if (bill < d) { d = bill; mat = 'bill'; }
      if (feet < d) { d = feet; mat = 'foot'; }
      if (eyes < d) { d = eyes; mat = 'eye'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'eye') return 'k';
      if (mat === 'bill') return shade > 0.72 ? 'y2' : shade > 0.36 ? 'y1' : 'y0';
      if (mat === 'foot') return shade > 0.42 ? 'y1' : 'y0';

      // Emerald green mallard head & upper neck
      if (y > hy - 0.12 && z > 0.12) {
        return shade > 0.68 ? 'h2' : shade > 0.34 ? 'h1' : 'h0';
      }
      // Crisp white collar ring around lower neck
      if (y > hy - 0.18 && y <= hy - 0.12 && z > 0.10) {
        return 'W';
      }
      // Chestnut breast
      if (z > 0.10 && y <= hy - 0.18) {
        return shade > 0.45 ? 'r1' : 'r0';
      }
      // Wing with metallic blue speculum stripe
      if (mat === 'wing') {
        if (z < -0.02 && z > -0.22 && Math.abs(x) > 0.24) return 'u0';
        return shade > 0.62 ? 'b2' : shade > 0.34 ? 'b1' : 'b0';
      }
      // White-tipped upturned tail
      if (z < -0.44) return shade > 0.45 ? 'W' : 'b0';

      return shade > 0.65 ? 'b2' : shade > 0.34 ? 'b1' : 'b0';
    };

    pack = build27Pack(DUCK_PW, DUCK_PH, 0.90, 0.78, DUCK_PAL, evalFn, shadeFn);
    duckCache.set(pose, pack);
  }
  return pack;
}

export function getDuckPosePack(...args: Parameters<typeof buildDuckPosePack>): ReturnType<typeof buildDuckPosePack> {
  return registerAnimalSpritePack(buildDuckPosePack(...args), { module: './WildAnimals.ts', factory: 'getDuckPosePack', args }, buildDuckPosePack);
}

// ============================================================================
// 2. COBRA (Emerald/Olive Banded Ground Viper) â€” 42Ã—28
// ============================================================================
export type SnakePoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'slither0' | 'slither1' | 'slither2' | 'slither3' | 'slither4' | 'slither5'
  | 'coil0' | 'coil1' | 'coil2'
  | 'strike0' | 'strike1' | 'strike2';

export const SNAKE_PW = 42;
export const SNAKE_PH = 28;
export const SNAKE_W = SNAKE_PW / ANIMAL_PPU;
export const SNAKE_H = SNAKE_PH / ANIMAL_PPU;

const SNAKE_PAL: Record<string, [number, number, number]> = {
  k:  [0x12, 0x17, 0x12], // dark outline / pupil
  g0: [0x1c, 0x3b, 0x20], // deep emerald/olive band
  g1: [0x2e, 0x63, 0x2d], // viper mid-green
  g2: [0x54, 0x94, 0x3e], // bright emerald scales
  g3: [0x8c, 0xc4, 0x56], // sunlit dorsal scale highlight
  b0: [0x9e, 0xa8, 0x62], // olive-yellow belly shadow
  b1: [0xd4, 0xdb, 0x86], // pale yellow-olive belly
  e:  [0xff, 0xc8, 0x24], // glowing amber viper eyes
  t:  [0xd9, 0x26, 0x32], // forked crimson tongue / mouth
  W:  [0xf4, 0xf2, 0xe8], // white fangs
};

interface SnakePose {
  phase: number;
  amp: number;
  coil: number;    // 0 = flat S-curve, 1 = tightly coiled defensive posture
  headLift: number;
  lungeZ: number;
  jawOpen: number;
  tongueOut: number;
}

const SNAKE_POSES: Record<SnakePoseName, SnakePose> = {
  idle0:    { phase: 0.0,  amp: 0.16, coil: 0.15, headLift: 0.06, lungeZ: 0.0,  jawOpen: 0.0,  tongueOut: 0.0 },
  idle1:    { phase: 0.4,  amp: 0.18, coil: 0.15, headLift: 0.10, lungeZ: 0.02, jawOpen: 0.0,  tongueOut: 1.0 },
  idle2:    { phase: -0.4, amp: 0.16, coil: 0.15, headLift: 0.05, lungeZ: 0.0,  jawOpen: 0.0,  tongueOut: 0.0 },

  slither0: { phase: 0.00, amp: 0.24, coil: 0.0,  headLift: 0.05, lungeZ: 0.04, jawOpen: 0.0,  tongueOut: 0.0 },
  slither1: { phase: 1.05, amp: 0.24, coil: 0.0,  headLift: 0.06, lungeZ: 0.04, jawOpen: 0.0,  tongueOut: 0.6 },
  slither2: { phase: 2.09, amp: 0.24, coil: 0.0,  headLift: 0.05, lungeZ: 0.04, jawOpen: 0.0,  tongueOut: 0.0 },
  slither3: { phase: 3.14, amp: 0.24, coil: 0.0,  headLift: 0.06, lungeZ: 0.04, jawOpen: 0.0,  tongueOut: 0.0 },
  slither4: { phase: 4.19, amp: 0.24, coil: 0.0,  headLift: 0.05, lungeZ: 0.04, jawOpen: 0.0,  tongueOut: 0.6 },
  slither5: { phase: 5.24, amp: 0.24, coil: 0.0,  headLift: 0.06, lungeZ: 0.04, jawOpen: 0.0,  tongueOut: 0.0 },

  coil0:    { phase: 0.2,  amp: 0.28, coil: 0.65, headLift: 0.24, lungeZ: -0.06, jawOpen: 0.20, tongueOut: 1.0 },
  coil1:    { phase: 0.6,  amp: 0.30, coil: 0.92, headLift: 0.36, lungeZ: -0.10, jawOpen: 0.45, tongueOut: 1.0 },
  coil2:    { phase: -0.3, amp: 0.30, coil: 1.00, headLift: 0.40, lungeZ: -0.12, jawOpen: 0.55, tongueOut: 0.5 },

  strike0:  { phase: 0.0,  amp: 0.22, coil: 0.55, headLift: 0.30, lungeZ: 0.14,  jawOpen: 0.85, tongueOut: 0.0 },
  strike1:  { phase: 0.0,  amp: 0.14, coil: 0.25, headLift: 0.22, lungeZ: 0.32,  jawOpen: 1.00, tongueOut: 0.0 },
  strike2:  { phase: 0.2,  amp: 0.20, coil: 0.45, headLift: 0.26, lungeZ: 0.10,  jawOpen: 0.50, tongueOut: 0.0 },
};

const snakeCache = new Map<SnakePoseName, Boar27Pack>();
 function buildSnakePosePack(pose: SnakePoseName): Boar27Pack {
  let pack = snakeCache.get(pose);
  if (!pack) {
    const P = SNAKE_POSES[pose];
    const groundY = -0.26;

    // Precompute 8 spine points from tail (i=0) to neck (i=7)
    const pts: Array<[number, number, number, number]> = [];
    const segs = 7;
    for (let i = 0; i <= segs; i++) {
      const t = i / segs; // 0 = tail tip, 1 = head base
      let px: number;
      let py: number;
      let pz: number;
      if (P.coil > 0.01) {
        // Blend between S-curve and circular defensive coil
        const sX = Math.sin(t * Math.PI * 2.2 - P.phase) * P.amp * (0.35 + 0.65 * Math.sin(t * Math.PI));
        const sZ = -0.64 + t * 1.18 + (t > 0.7 ? P.lungeZ * ((t - 0.7) / 0.3) : 0);
        const sY = groundY + (t > 0.65 ? Math.pow((t - 0.65) / 0.35, 1.5) * P.headLift : 0);

        const ang = (1 - t) * Math.PI * 2.3 + P.phase * 0.25;
        const rad = 0.12 + (1 - t) * 0.24;
        const cX = Math.sin(ang) * rad;
        const cZ = Math.cos(ang) * rad - 0.10 + (t > 0.72 ? P.lungeZ * ((t - 0.72) / 0.28) : 0);
        const cY = groundY + (t > 0.55 ? Math.pow((t - 0.55) / 0.45, 1.4) * P.headLift : (1 - t) * 0.03);

        px = sX * (1 - P.coil) + cX * P.coil;
        py = sY * (1 - P.coil) + cY * P.coil;
        pz = sZ * (1 - P.coil) + cZ * P.coil;
      } else {
        px = Math.sin(t * Math.PI * 2.4 - P.phase) * P.amp * (0.25 + 0.75 * Math.sin(t * Math.PI));
        pz = -0.66 + t * 1.24 + (t > 0.75 ? P.lungeZ * ((t - 0.75) / 0.25) : 0);
        py = groundY + (t > 0.7 ? Math.pow((t - 0.7) / 0.3, 1.5) * P.headLift : 0);
      }
      // Radius tapers smoothly from tail tip -> thick mid-body -> sleek neck
      const r = t < 0.25 ? 0.024 + t * 0.22 : t < 0.78 ? 0.082 : 0.082 - (t - 0.78) * 0.08;
      pts.push([px, py, pz, r]);
    }

    const headBase = pts[segs];
    const hx = headBase[0];
    const hy = headBase[1] + 0.02;
    const hz = headBase[2] + 0.09;

    const evalFn: SdfEvaluator = (x, y, z) => {
      let body = 99;
      for (let i = 0; i < segs; i++) {
        const a = pts[i];
        const b = pts[i + 1];
        const seg = sdCapsule(x, y, z, a[0], a[1], a[2], b[0], b[1], b[2], a[3], b[3]);
        body = i === 0 ? seg : smin(body, seg, 0.035);
      }

      // Triangular viper head (wider cheeks, pointed snout)
      const cranium = sdEllipsoid(x, y, z, hx, hy, hz, 0.115, 0.070, 0.135);
      const snout = sdCapsule(x, y, z, hx, hy - 0.005, hz + 0.06, hx, hy - 0.015, hz + 0.20, 0.068, 0.036);
      const jawDrop = P.jawOpen * 0.09;
      const lowerJaw = P.jawOpen > 0.15
        ? sdCapsule(x, y, z, hx, hy - 0.035, hz + 0.04, hx, hy - 0.045 - jawDrop, hz + 0.17, 0.052, 0.026)
        : 99;
      const head = smin(smin(cranium, snout, 0.03), lowerJaw, 0.02);
      body = smin(body, head, 0.04);

      // Amber viper eyes on brow ridges
      const eyeL = sdEllipsoid(x, y, z, hx - 0.072, hy + 0.034, hz + 0.07, 0.030, 0.026, 0.030);
      const eyeR = sdEllipsoid(x, y, z, hx + 0.072, hy + 0.034, hz + 0.07, 0.030, 0.026, 0.030);
      const eyes = Math.min(eyeL, eyeR);

      // Forked crimson tongue or open strike mouth + fangs
      let tongue = 99;
      let fangs = 99;
      if (P.tongueOut > 0.2 && P.jawOpen < 0.6) {
        const tLen = 0.14 * P.tongueOut;
        const stem = sdCapsule(x, y, z, hx, hy - 0.02, hz + 0.20, hx, hy - 0.03, hz + 0.20 + tLen, 0.014, 0.010);
        const forkL = sdCapsule(x, y, z, hx, hy - 0.03, hz + 0.20 + tLen, hx - 0.035, hy - 0.04, hz + 0.25 + tLen, 0.010, 0.007);
        const forkR = sdCapsule(x, y, z, hx, hy - 0.03, hz + 0.20 + tLen, hx + 0.035, hy - 0.04, hz + 0.25 + tLen, 0.010, 0.007);
        tongue = Math.min(stem, Math.min(forkL, forkR));
      }
      if (P.jawOpen > 0.35) {
        const mouth = sdEllipsoid(x, y, z, hx, hy - 0.03 - jawDrop * 0.4, hz + 0.12, 0.048, 0.025 + jawDrop * 0.4, 0.065);
        tongue = Math.min(tongue, mouth);
        const fL = sdCapsule(x, y, z, hx - 0.034, hy - 0.025, hz + 0.16, hx - 0.034, hy - 0.075, hz + 0.165, 0.013, 0.006);
        const fR = sdCapsule(x, y, z, hx + 0.034, hy - 0.025, hz + 0.16, hx + 0.034, hy - 0.075, hz + 0.165, 0.013, 0.006);
        fangs = Math.min(fL, fR);
      }

      let d = body, mat = 'body';
      if (tongue < d) { d = tongue; mat = 'tongue'; }
      if (fangs < d) { d = fangs; mat = 'fang'; }
      if (eyes < d) { d = eyes; mat = 'eye'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'eye') return 'e';
      if (mat === 'tongue') return 't';
      if (mat === 'fang') return 'W';

      // Pale olive-yellow underbelly
      if (y < groundY - 0.035) return shade > 0.45 ? 'b1' : 'b0';

      // Dark emerald/olive crossbands along the spine
      const band = Math.sin((z * 17.5 + x * 4.0));
      if (band > 0.38) return shade > 0.65 ? 'g1' : 'g0';

      return shade > 0.72 ? 'g3' : shade > 0.44 ? 'g2' : shade > 0.22 ? 'g1' : 'g0';
    };

    pack = build27Pack(SNAKE_PW, SNAKE_PH, 0.94, 0.64, SNAKE_PAL, evalFn, shadeFn);
    snakeCache.set(pose, pack);
  }
  return pack;
}

export function getSnakePosePack(...args: Parameters<typeof buildSnakePosePack>): ReturnType<typeof buildSnakePosePack> {
  return registerAnimalSpritePack(buildSnakePosePack(...args), { module: './WildAnimals.ts', factory: 'getSnakePosePack', args }, buildSnakePosePack);
}

// ============================================================================
// 3. CABRA (Goat) — re-exported from ./Goat (flagship rebuild)
// ============================================================================
export {
  Goat,
  getGoatPosePack,
  GOAT_PW,
  GOAT_PH,
  GOAT_W,
  GOAT_H,
  type GoatPoseName,
} from './Goat';

// ============================================================================
// INSTÃ‚NCIAS NA ARENA (Duck, Snake, Goat)
// ============================================================================
const DUCK_IDLE: readonly DuckPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const DUCK_QUACK: readonly DuckPoseName[] = ['quack0', 'quack1', 'quack2', 'quack1'];
const DUCK_WADDLE: readonly DuckPoseName[] = ['waddle0', 'waddle1', 'waddle2', 'waddle3', 'waddle4', 'waddle5'];
const DUCK_FLAP: readonly DuckPoseName[] = ['flap0', 'flap1', 'flap2', 'flap3'];

const SNAKE_IDLE: readonly SnakePoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const SNAKE_SLITHER: readonly SnakePoseName[] = ['slither0', 'slither1', 'slither2', 'slither3', 'slither4', 'slither5'];
const SNAKE_COIL: readonly SnakePoseName[] = ['coil0', 'coil1', 'coil2', 'coil1'];
const SNAKE_STRIKE: readonly SnakePoseName[] = ['strike0', 'strike1', 'strike2'];


/**
 * Mallard Duck: waddles near/around the pond (or spawn pos) and flaps away if startled.
 */
export class Duck extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private readonly home = new THREE.Vector3();
  private state: 'idle' | 'quack' | 'waddle' | 'flee' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.4, 2.8);
  private targetYaw = rand(0, Math.PI * 2);
  private gaitPhase = rand(0, Math.PI * 2);
  private flapCooldown = 0;

  constructor(ctx: GameContext, pos: THREE.Vector3, pondCenter?: THREE.Vector3) {
    super(ctx, getDuckPosePack('idle0').getView(2, 0)!, DUCK_PW, DUCK_PH, DUCK_W, DUCK_H, 'DuckBillboard');
    this.hp = 20;
    this.maxHp = 20;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.24;
    this.motor.height = 0.45;
    this.motor.teleport(pos);
    this.home.copy(pondCenter ?? pos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.30, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.set(this.position.x, this.position.y + 0.24, this.position.z);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y + 0.14, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.36, this.position.z);
    this.hurtboxes[0].enabled = this.alive;
    this.stickRoot.position.set(this.position.x, this.position.y + 0.24, this.position.z);
    this.stickRoot.rotation.y = this.facing;
  }

  receiveHit(hit: HitInfo): HitResult {
    const res = emptyResult('flesh');
    if (!this.alive) { res.ignored = true; return res; }
    this.hp = Math.max(0, this.hp - hit.damage);
    res.damage = hit.damage;
    this.flash = 1.0;
    this.vel.x += hit.dir.x * 4.5;
    this.vel.z += hit.dir.z * 4.5;
    this.vel.y = 3.8;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.state = 'flee';
      this.stateT = 0;
      this.stateDur = 2.4;
    }
    return res;
  }

  update(dt: number, target: EnemyTarget | null, camera: THREE.Camera, drawingBufferSize?: THREE.Vector2) {
    if (dt > 0) {
      this.stateT += dt;
      this.flapCooldown = Math.max(0, this.flapCooldown - dt);
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
        if (dist < 3.4 && this.state !== 'flee') {
          this.state = 'flee';
          this.stateT = 0;
          this.stateDur = 2.2;
        }

        if (this.state === 'idle') {
          if (this.stateT >= this.stateDur) {
            this.state = Math.random() < 0.35 ? 'quack' : 'waddle';
            this.stateT = 0;
            this.stateDur = rand(1.6, 3.0);
            const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
            this.targetYaw = toHome > 5.5
              ? Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.6, 0.6)
              : this.facing + rand(-1.5, 1.5);
          }
        } else if (this.state === 'quack') {
          if (this.stateT >= this.stateDur) {
            this.state = 'waddle';
            this.stateT = 0;
            this.stateDur = rand(1.8, 3.2);
          }
        } else if (this.state === 'waddle') {
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 5.5);
          speed = 1.45;
          if (this.stateT >= this.stateDur) {
            this.state = Math.random() < 0.45 ? 'quack' : 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.2, 2.4);
          }
        } else if (this.state === 'flee') {
          if (target && target.alive) {
            this.targetYaw = Math.atan2(this.position.x - target.position.x, this.position.z - target.position.z);
            this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 9);
          }
          speed = 4.4;
          if (this.motor.grounded && this.flapCooldown <= 0) {
            this.vel.y = 4.2;
            this.flapCooldown = 0.52;
          }
          if (this.stateT >= this.stateDur && dist > 5.0 && this.motor.grounded) {
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.2, 2.2);
          }
        }

        this.vel.x = damp(this.vel.x, Math.sin(this.facing) * speed, 8, dt);
        this.vel.z = damp(this.vel.z, Math.cos(this.facing) * speed, 8, dt);
        this.vel.y -= 18 * dt;
        this.motor.update(dt);

        const horiz = Math.hypot(this.vel.x, this.vel.z);
        if (horiz > 0.2 && this.motor.grounded) {
          this.gaitPhase += dt * 6.0 * (0.7 + horiz * 0.25);
        }
      }
      this.syncHurtbox();
    }

    let pose: DuckPoseName;
    if (!this.alive) pose = 'idle0';
    else if (this.state === 'flee' || !this.motor.grounded) pose = pickCycle(DUCK_FLAP, this.stateT * 10.0);
    else if (this.state === 'quack') pose = pickCycle(DUCK_QUACK, this.stateT * 4.5);
    else if (this.state === 'waddle') pose = pickCycle(DUCK_WADDLE, (this.gaitPhase / Math.PI) * 2.8);
    else pose = pickCycle(DUCK_IDLE, this.stateT * 2.0);

    const bob = this.alive && this.motor.grounded && this.state === 'waddle'
      ? Math.abs(Math.sin(this.gaitPhase)) * 0.025
      : 0;
    const deathSink = this.alive ? 0 : Math.min(0.18, this.deadT * 0.4);
    this.renderBillboard(getDuckPosePack(pose), this.position.y + 0.24 + bob - deathSink, camera, drawingBufferSize);
  }
}

/**
 * Ground Viper (Snake): slithers in S-curves; coils in a strike telegraph and lunges if provoked.
 */
export class Snake extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private readonly home = new THREE.Vector3();
  private state: 'idle' | 'slither' | 'coil' | 'strike' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.4, 2.8);
  private targetYaw = rand(0, Math.PI * 2);
  private gaitPhase = rand(0, Math.PI * 2);
  private provoked = false;

  constructor(ctx: GameContext, pos: THREE.Vector3) {
    super(ctx, getSnakePosePack('idle0').getView(2, 0)!, SNAKE_PW, SNAKE_PH, SNAKE_W, SNAKE_H, 'SnakeBillboard');
    this.hp = 30;
    this.maxHp = 30;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.28;
    this.motor.height = 0.34;
    this.motor.teleport(pos);
    this.home.copy(pos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.34, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.set(this.position.x, this.position.y + 0.18, this.position.z);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y + 0.08, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.28, this.position.z);
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
    this.vel.x += hit.dir.x * 3.8;
    this.vel.z += hit.dir.z * 3.8;
    this.vel.y = 2.6;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.provoked = true;
      this.state = 'coil';
      this.stateT = 0;
      this.stateDur = 0.85;
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
        const triggerDist = this.provoked ? 4.2 : 2.6;
        if (dist < triggerDist && this.state !== 'coil' && this.state !== 'strike') {
          this.state = 'coil';
          this.stateT = 0;
          this.stateDur = 0.9;
        }

        if (this.state === 'idle') {
          if (this.stateT >= this.stateDur) {
            this.state = 'slither';
            this.stateT = 0;
            this.stateDur = rand(2.0, 3.6);
            const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
            this.targetYaw = toHome > 6.5
              ? Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.5, 0.5)
              : this.facing + rand(-1.4, 1.4);
          }
        } else if (this.state === 'slither') {
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 5.0);
          speed = 1.65;
          if (this.stateT >= this.stateDur) {
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.4, 2.8);
          }
        } else if (this.state === 'coil') {
          if (target && target.alive) {
            this.targetYaw = Math.atan2(target.position.x - this.position.x, target.position.z - this.position.z);
            this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 10);
          }
          speed = 0;
          if (this.stateT >= this.stateDur) {
            if (dist < triggerDist + 0.8) {
              this.state = 'strike';
              this.stateT = 0;
              this.stateDur = 0.55;
            } else {
              this.state = 'idle';
              this.stateT = 0;
              this.stateDur = rand(1.2, 2.2);
            }
          }
        } else if (this.state === 'strike') {
          speed = this.stateT < 0.25 ? 5.2 : 0.6;
          if (this.stateT >= this.stateDur) {
            this.state = dist < triggerDist ? 'coil' : 'idle';
            this.stateT = 0;
            this.stateDur = dist < triggerDist ? 1.0 : rand(1.4, 2.4);
          }
        }

        this.vel.x = damp(this.vel.x, Math.sin(this.facing) * speed, 9, dt);
        this.vel.z = damp(this.vel.z, Math.cos(this.facing) * speed, 9, dt);
        this.vel.y -= 20 * dt;
        this.motor.update(dt);

        const horiz = Math.hypot(this.vel.x, this.vel.z);
        if (horiz > 0.2 && this.motor.grounded) {
          this.gaitPhase += dt * 6.5 * (0.65 + horiz * 0.25);
        }
      }
      this.syncHurtbox();
    }

    let pose: SnakePoseName;
    if (!this.alive) pose = 'idle0';
    else if (this.state === 'strike') pose = pickCycle(SNAKE_STRIKE, this.stateT * 5.8);
    else if (this.state === 'coil') pose = pickCycle(SNAKE_COIL, this.stateT * 3.8);
    else if (this.state === 'slither') pose = pickCycle(SNAKE_SLITHER, (this.gaitPhase / Math.PI) * 2.8);
    else pose = pickCycle(SNAKE_IDLE, this.stateT * 2.2);

    const deathSink = this.alive ? 0 : Math.min(0.14, this.deadT * 0.35);
    this.renderBillboard(getSnakePosePack(pose), this.position.y + 0.18 - deathSink, camera, drawingBufferSize);
  }
}
