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
// CAVALO (Thoroughbred Horse) — Flagship 74×68 @ ANIMAL_PPU
// ============================================================================
export type HorsePoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'trot0' | 'trot1' | 'trot2' | 'trot3' | 'trot4' | 'trot5'
  | 'gallop0' | 'gallop1' | 'gallop2' | 'gallop3' | 'gallop4' | 'gallop5'
  | 'rear0' | 'rear1' | 'rear2';

export const HORSE_PW = 74;
export const HORSE_PH = 68;
export const HORSE_W = HORSE_PW / ANIMAL_PPU;
export const HORSE_H = HORSE_PH / ANIMAL_PPU;

/** Glossy 5-tone warm bay/chestnut coat + dark espresso mane/tail/socks + white forehead blaze. */
const HORSE_PAL: Record<string, [number, number, number]> = {
  k:  [0x15, 0x11, 0x10], // crisp 1px outline / hooves / eyes / nostrils
  c0: [0x4c, 0x22, 0x12], // deep bay-chestnut shadow
  c1: [0x78, 0x38, 0x1c], // rich bay mid-shadow
  c2: [0xa6, 0x52, 0x28], // warm chestnut midtone
  c3: [0xd0, 0x72, 0x3c], // glossy sunlit bay highlight
  c4: [0xeb, 0x98, 0x5c], // sleek coat specular sheen
  m0: [0x1c, 0x16, 0x16], // dark espresso mane / tail / lower-leg socks shadow
  m1: [0x33, 0x28, 0x26], // espresso mane / velvety muzzle midtone
  m2: [0x50, 0x40, 0x3c], // espresso mane sheen highlight
  W:  [0xfc, 0xfa, 0xf2], // white forehead blaze & crisp eye glint
};

interface HorsePose {
  mode: 'quad' | 'rear';
  bodyY: number;
  headY: number;
  headZ: number;
  headPitch: number;
  tailLift: number;
  tailSway: number;
  fl: number;
  fr: number;
  bl: number;
  br: number;
  flLift: number;
  frLift: number;
  blLift: number;
  brLift: number;
  rearAmt?: number;
}

const HORSE_POSES: Record<HorsePoseName, HorsePose> = {
  idle0: {
    mode: 'quad', bodyY: 0.0, headY: 0.0, headZ: 0.0, headPitch: 0.0, tailLift: 0.0, tailSway: 0.0,
    fl: 0, fr: 0, bl: 0, br: 0, flLift: 0, frLift: 0, blLift: 0, brLift: 0,
  },
  idle1: {
    mode: 'quad', bodyY: 0.012, headY: 0.025, headZ: 0.01, headPitch: -0.06, tailLift: 0.03, tailSway: 0.06,
    fl: 0, fr: 0, bl: 0, br: 0, flLift: 0, frLift: 0, blLift: 0, brLift: 0,
  },
  idle2: {
    mode: 'quad', bodyY: -0.010, headY: -0.015, headZ: 0.015, headPitch: 0.05, tailLift: -0.02, tailSway: -0.06,
    fl: 0, fr: 0, bl: 0, br: 0, flLift: 0, frLift: 0, blLift: 0, brLift: 0,
  },

  // 6-frame springy rhythmic diagonal trot
  trot0: {
    mode: 'quad', bodyY: 0.025, headY: 0.01, headZ: 0.02, headPitch: 0.04, tailLift: 0.08, tailSway: 0.04,
    fl: 0.22, fr: -0.18, bl: -0.20, br: 0.20, flLift: 0.14, frLift: 0.0, blLift: 0.0, brLift: 0.12,
  },
  trot1: {
    mode: 'quad', bodyY: 0.035, headY: 0.015, headZ: 0.03, headPitch: 0.05, tailLift: 0.10, tailSway: 0.02,
    fl: 0.10, fr: -0.04, bl: -0.08, br: 0.09, flLift: 0.05, frLift: 0.09, blLift: 0.09, brLift: 0.05,
  },
  trot2: {
    mode: 'quad', bodyY: -0.005, headY: 0.0, headZ: 0.01, headPitch: 0.02, tailLift: 0.06, tailSway: -0.02,
    fl: -0.05, fr: 0.12, bl: 0.10, br: -0.06, flLift: 0.0, frLift: 0.14, blLift: 0.12, brLift: 0.0,
  },
  trot3: {
    mode: 'quad', bodyY: 0.025, headY: 0.01, headZ: 0.02, headPitch: 0.04, tailLift: 0.08, tailSway: -0.04,
    fl: -0.18, fr: 0.22, bl: 0.20, br: -0.20, flLift: 0.0, frLift: 0.14, blLift: 0.12, brLift: 0.0,
  },
  trot4: {
    mode: 'quad', bodyY: 0.035, headY: 0.015, headZ: 0.03, headPitch: 0.05, tailLift: 0.10, tailSway: -0.02,
    fl: -0.04, fr: 0.10, bl: 0.09, br: -0.08, flLift: 0.09, frLift: 0.05, blLift: 0.05, brLift: 0.09,
  },
  trot5: {
    mode: 'quad', bodyY: -0.005, headY: 0.0, headZ: 0.01, headPitch: 0.02, tailLift: 0.06, tailSway: 0.02,
    fl: 0.12, fr: -0.05, bl: -0.06, br: 0.10, flLift: 0.14, frLift: 0.0, blLift: 0.0, brLift: 0.12,
  },

  // 6-frame full-stride stretched thoroughbred gallop!
  gallop0: {
    mode: 'quad', bodyY: -0.02, headY: -0.04, headZ: 0.08, headPitch: 0.08, tailLift: 0.22, tailSway: 0.0,
    fl: -0.14, fr: -0.24, bl: 0.26, br: 0.18, flLift: 0.12, frLift: 0.04, blLift: 0.22, brLift: 0.12,
  },
  gallop1: {
    mode: 'quad', bodyY: 0.04, headY: -0.05, headZ: 0.10, headPitch: 0.10, tailLift: 0.28, tailSway: 0.02,
    fl: 0.22, fr: 0.10, bl: -0.16, br: -0.26, flLift: 0.26, frLift: 0.16, blLift: 0.10, brLift: 0.20,
  },
  gallop2: {
    mode: 'quad', bodyY: 0.07, headY: -0.06, headZ: 0.12, headPitch: 0.12, tailLift: 0.32, tailSway: 0.0,
    fl: 0.38, fr: 0.26, bl: -0.34, br: -0.24, flLift: 0.34, frLift: 0.24, blLift: 0.32, brLift: 0.22,
  },
  gallop3: {
    mode: 'quad', bodyY: 0.02, headY: -0.04, headZ: 0.09, headPitch: 0.08, tailLift: 0.24, tailSway: -0.02,
    fl: 0.26, fr: 0.34, bl: -0.18, br: -0.08, flLift: 0.10, frLift: 0.22, blLift: 0.24, brLift: 0.14,
  },
  gallop4: {
    mode: 'quad', bodyY: -0.03, headY: -0.03, headZ: 0.07, headPitch: 0.06, tailLift: 0.18, tailSway: 0.0,
    fl: 0.04, fr: 0.16, bl: 0.12, br: 0.22, flLift: 0.0, frLift: 0.04, blLift: 0.18, brLift: 0.26,
  },
  gallop5: {
    mode: 'quad', bodyY: -0.04, headY: -0.04, headZ: 0.06, headPitch: 0.07, tailLift: 0.16, tailSway: 0.0,
    fl: -0.22, fr: -0.10, bl: 0.30, br: 0.20, flLift: 0.18, frLift: 0.08, blLift: 0.10, brLift: 0.04,
  },

  // 3-frame dramatic rearing up on hind legs!
  rear0: {
    mode: 'rear', bodyY: 0.0, headY: 0.0, headZ: 0.0, headPitch: 0.15, tailLift: -0.10, tailSway: 0.0,
    fl: 0, fr: 0, bl: 0, br: 0, flLift: 0, frLift: 0, blLift: 0, brLift: 0, rearAmt: 0.65,
  },
  rear1: {
    mode: 'rear', bodyY: 0.03, headY: 0.04, headZ: 0.0, headPitch: 0.24, tailLift: -0.14, tailSway: 0.04,
    fl: 0, fr: 0, bl: 0, br: 0, flLift: 0, frLift: 0, blLift: 0, brLift: 0, rearAmt: 1.0,
  },
  rear2: {
    mode: 'rear', bodyY: 0.01, headY: 0.02, headZ: 0.0, headPitch: 0.18, tailLift: -0.12, tailSway: -0.04,
    fl: 0, fr: 0, bl: 0, br: 0, flLift: 0, frLift: 0, blLift: 0, brLift: 0, rearAmt: 0.80,
  },
};

const horseCache = new Map<HorsePoseName, Boar27Pack>();

 function buildHorsePosePack(pose: HorsePoseName): Boar27Pack {
  let pack = horseCache.get(pose);
  if (!pack) {
    const P = HORSE_POSES[pose];
    const by = P.bodyY;

    // Refined elongated equine head helper in local pitched space
    const evalHead = (lx: number, ly: number, lz: number) => {
      const cranium = sdEllipsoid(lx, ly, lz, 0, 0.03, 0.0, 0.108, 0.112, 0.135);
      const cheek = sdEllipsoid(lx, ly, lz, 0, -0.03, 0.02, 0.102, 0.095, 0.115);
      const snout = sdCapsule(lx, ly, lz, 0, 0.01, 0.06, 0, -0.095, 0.30, 0.082, 0.056);
      const muzzle = sdEllipsoid(lx, ly, lz, 0, -0.105, 0.31, 0.060, 0.054, 0.062);

      // Upright pointed equine ears
      const earL = sdCapsule(lx, ly, lz, -0.058, 0.115, -0.02, -0.082, 0.255, -0.01, 0.034, 0.011);
      const earR = sdCapsule(lx, ly, lz,  0.058, 0.115, -0.02,  0.082, 0.255, -0.01, 0.034, 0.011);
      const ears = Math.min(earL, earR);

      // Forelock tuft between ears
      const forelock = sdCapsule(lx, ly, lz, 0, 0.135, 0.02, 0, 0.085, 0.12, 0.036, 0.018);

      let headD = smin(smin(cranium, cheek, 0.04), snout, 0.04);
      headD = smin(headD, muzzle, 0.03);
      headD = smin(headD, ears, 0.02);

      // Expressive dark eyes + white glint + nostrils
      const eyeL = sdEllipsoid(lx, ly, lz, -0.086, 0.032, 0.095, 0.026, 0.024, 0.024);
      const eyeR = sdEllipsoid(lx, ly, lz,  0.086, 0.032, 0.095, 0.026, 0.024, 0.024);
      const eyes = Math.min(eyeL, eyeR);

      const glintL = sdEllipsoid(lx, ly, lz, -0.096, 0.040, 0.112, 0.010, 0.010, 0.010);
      const glintR = sdEllipsoid(lx, ly, lz,  0.096, 0.040, 0.112, 0.010, 0.010, 0.010);
      const glints = Math.min(glintL, glintR);

      const nosL = sdEllipsoid(lx, ly, lz, -0.034, -0.098, 0.362, 0.016, 0.014, 0.014);
      const nosR = sdEllipsoid(lx, ly, lz,  0.034, -0.098, 0.362, 0.016, 0.014, 0.014);
      const nostrils = Math.min(nosL, nosR);

      // Crisp white forehead blaze running down the bridge of the nose!
      const isBlaze = Math.abs(lx) < 0.028 && ly > -0.055 && ly < 0.085 && lz > 0.08 && lz < 0.27;
      const isMuzzle = lz > 0.25;

      return { headD, forelock, eyes, glints, nostrils, isBlaze, isMuzzle };
    };

    const evalFn: SdfEvaluator = (x, y, z) => {
      if (P.mode === 'rear') {
        // Dramatic rearing thoroughbred on hind legs!
        const r = P.rearAmt ?? 1.0;
        const hips = sdEllipsoid(x, y, z, 0, -0.20 + by, -0.14, 0.23, 0.22, 0.24);
        const chest = sdEllipsoid(x, y, z, 0, 0.12 + by + r * 0.08, 0.04, 0.22, 0.24, 0.23);
        const neck = sdCapsule(x, y, z, 0, 0.22 + by + r * 0.08, 0.06, 0, 0.46 + by + r * 0.10, 0.18, 0.145, 0.095);
        const mane = sdCapsule(x, y, z, 0, 0.24 + by + r * 0.08, -0.04, 0, 0.48 + by + r * 0.10, 0.08, 0.068, 0.048);

        const hy = 0.50 + by + r * 0.10 + P.headY;
        const hz = 0.22;
        const cosP = Math.cos(P.headPitch);
        const sinP = Math.sin(P.headPitch);
        const dy = y - hy;
        const dz = z - hz;
        const lx = x;
        const ly = dy * cosP + dz * sinP;
        const lz = -dy * sinP + dz * cosP;
        const H = evalHead(lx, ly, lz);

        // Pawing forelegs raised high in the air
        const flU = sdCapsule(x, y, z, -0.16, 0.14 + by + r * 0.06, 0.12, -0.17, 0.10 + by + r * 0.12, 0.36, 0.072, 0.046);
        const flL = sdCapsule(x, y, z, -0.17, 0.10 + by + r * 0.12, 0.36, -0.17, -0.06 + by + r * 0.10, 0.44, 0.044, 0.034);
        const frU = sdCapsule(x, y, z,  0.16, 0.14 + by + r * 0.06, 0.12,  0.17, 0.16 + by + r * 0.14, 0.38, 0.072, 0.046);
        const frL = sdCapsule(x, y, z,  0.17, 0.16 + by + r * 0.14, 0.38,  0.17, 0.02 + by + r * 0.12, 0.48, 0.044, 0.034);

        // Braced muscular hind legs
        const bl = sdCapsule(x, y, z, -0.16, -0.22 + by, -0.16, -0.17, -0.62, -0.10, 0.088, 0.042);
        const br = sdCapsule(x, y, z,  0.16, -0.22 + by, -0.16,  0.17, -0.62, -0.10, 0.088, 0.042);

        const tail = sdCapsule(x, y, z, 0, -0.22 + by, -0.36, P.tailSway, -0.58 + by, -0.48, 0.065, 0.048);

        let coat = smin(hips, chest, 0.09);
        coat = smin(coat, neck, 0.07);
        coat = smin(coat, H.headD, 0.05);
        coat = smin(coat, Math.min(Math.min(smin(flU, flL, 0.02), smin(frU, frL, 0.02)), Math.min(bl, br)), 0.04);

        const hair = Math.min(Math.min(mane, H.forelock), tail);

        let d = coat, mat = 'coat';
        if (H.isBlaze && H.headD < coat + 0.02) mat = 'blaze';
        else if (H.isMuzzle && H.headD < coat + 0.02) mat = 'muzzle';
        if (hair < d) { d = hair; mat = 'hair'; }
        if (H.eyes < d) { d = H.eyes; mat = 'eye'; }
        if (H.glints < d) { d = H.glints; mat = 'glint'; }
        if (H.nostrils < d) { d = H.nostrils; mat = 'nostril'; }
        return { d, mat };
      }

      // Quadruped thoroughbred mode (idle / trot / gallop)
      const chest = sdEllipsoid(x, y, z, 0, 0.06 + by, 0.22, 0.225, 0.235, 0.26);
      const withers = sdEllipsoid(x, y, z, 0, 0.22 + by, 0.18, 0.165, 0.135, 0.19);
      const barrel = sdEllipsoid(x, y, z, 0, 0.08 + by, -0.06, 0.205, 0.205, 0.29);
      const rump = sdEllipsoid(x, y, z, 0, 0.11 + by, -0.34, 0.225, 0.215, 0.23);

      // Muscular arched thoroughbred neck
      const hPivotY = 0.46 + by + P.headY;
      const hPivotZ = 0.48 + P.headZ;
      const neck = sdCapsule(x, y, z, 0, 0.16 + by, 0.26, 0, hPivotY - 0.04, hPivotZ - 0.06, 0.155, 0.098);

      // Lush flowing dark-espresso mane along neck crest
      const mane1 = sdCapsule(x, y, z, 0, 0.25 + by, 0.18, 0, hPivotY + 0.05, hPivotZ - 0.12, 0.072, 0.052);
      const mane2 = sdCapsule(x, y, z, 0, 0.28 + by, 0.22, 0, hPivotY + 0.02, hPivotZ - 0.15, 0.058, 0.044);
      const mane = smin(mane1, mane2, 0.03);

      let coat = smin(chest, withers, 0.07);
      coat = smin(coat, barrel, 0.10);
      coat = smin(coat, rump, 0.10);
      coat = smin(coat, neck, 0.08);

      // Head in local pitched space
      const cosP = Math.cos(P.headPitch);
      const sinP = Math.sin(P.headPitch);
      const dy = y - hPivotY;
      const dz = z - hPivotZ;
      const lx = x;
      const ly = dy * cosP + dz * sinP;
      const lz = -dy * sinP + dz * cosP;
      const H = evalHead(lx, ly, lz);
      coat = smin(coat, H.headD, 0.055);

      // Slender jointed thoroughbred legs with dark socks & hooves
      const frontLeg = (sx: number, swing: number, lift: number) => {
        const shY = -0.02 + by, shZ = 0.24;
        const knY = -0.32 + by * 0.4 + lift * 0.45;
        const knZ = 0.24 + swing * 0.55;
        const ftY = -0.64 + lift;
        const ftZ = 0.25 + swing;
        const upper = sdCapsule(x, y, z, sx, shY, shZ, sx, knY, knZ, 0.076, 0.046);
        const lower = sdCapsule(x, y, z, sx, knY, knZ, sx, ftY, ftZ, 0.042, 0.034);
        const hoof = sdEllipsoid(x, y, z, sx, ftY - 0.022, ftZ + 0.018, 0.042, 0.034, 0.050);
        return { leg: smin(upper, lower, 0.02), hoof };
      };

      const hindLeg = (sx: number, swing: number, lift: number) => {
        const hpY = 0.02 + by, hpZ = -0.32;
        const thigh = sdEllipsoid(x, y, z, sx * 1.02, -0.02 + by, -0.34 + swing * 0.16, 0.095, 0.145, 0.125);
        const hkY = -0.30 + by * 0.4 + lift * 0.45;
        const hkZ = -0.44 + swing * 0.50;
        const ftY = -0.64 + lift;
        const ftZ = -0.36 + swing;
        const upper = sdCapsule(x, y, z, sx, hpY, hpZ, sx, hkY, hkZ, 0.082, 0.046);
        const lower = sdCapsule(x, y, z, sx, hkY, hkZ, sx, ftY, ftZ, 0.042, 0.034);
        const hoof = sdEllipsoid(x, y, z, sx, ftY - 0.022, ftZ + 0.018, 0.042, 0.034, 0.050);
        return { leg: smin(smin(thigh, upper, 0.035), lower, 0.02), hoof };
      };

      const fl = frontLeg(-0.155, P.fl, P.flLift);
      const fr = frontLeg( 0.155, P.fr, P.frLift);
      const bl = hindLeg(-0.160, P.bl, P.blLift);
      const br = hindLeg( 0.160, P.br, P.brLift);

      const legs = Math.min(Math.min(fl.leg, fr.leg), Math.min(bl.leg, br.leg));
      const hooves = Math.min(Math.min(fl.hoof, fr.hoof), Math.min(bl.hoof, br.hoof));
      coat = smin(coat, legs, 0.04);

      // Long sweeping dark-espresso tail streaming behind!
      const tMidX = P.tailSway * 0.45;
      const tMidY = -0.08 + by + P.tailLift * 0.65;
      const tMidZ = -0.68 - P.tailLift * 0.25;
      const tTipX = P.tailSway;
      const tTipY = -0.44 + by + P.tailLift * 1.10;
      const tTipZ = -0.76 - P.tailLift * 0.50;
      const tail1 = sdCapsule(x, y, z, 0, 0.12 + by, -0.52, tMidX, tMidY, tMidZ, 0.058, 0.072);
      const tail2 = sdCapsule(x, y, z, tMidX, tMidY, tMidZ, tTipX, tTipY, tTipZ, 0.070, 0.040);
      const tail = smin(tail1, tail2, 0.035);

      const hair = Math.min(Math.min(mane, H.forelock), tail);

      let d = coat, mat = 'coat';
      if (H.isBlaze && H.headD < coat + 0.02) mat = 'blaze';
      else if (H.isMuzzle && H.headD < coat + 0.02) mat = 'muzzle';
      if (hair < d) { d = hair; mat = 'hair'; }
      if (hooves < d) { d = hooves; mat = 'hoof'; }
      if (H.eyes < d) { d = H.eyes; mat = 'eye'; }
      if (H.glints < d) { d = H.glints; mat = 'glint'; }
      if (H.nostrils < d) { d = H.nostrils; mat = 'nostril'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, _x, y) => {
      if (mat === 'glint' || mat === 'blaze') return 'W';
      if (mat === 'eye' || mat === 'nostril' || mat === 'hoof') return 'k';
      if (mat === 'hair' || mat === 'muzzle') {
        return shade > 0.68 ? 'm2' : shade > 0.34 ? 'm1' : 'm0';
      }
      // Classic bay horse dark lower-leg "points" (black socks/fetlocks)
      if (y < -0.36) {
        return shade > 0.65 ? 'm2' : shade > 0.32 ? 'm1' : 'm0';
      }
      return shade > 0.82 ? 'c4' : shade > 0.60 ? 'c3' : shade > 0.38 ? 'c2' : shade > 0.18 ? 'c1' : 'c0';
    };

    pack = build27Pack(HORSE_PW, HORSE_PH, 1.18, 1.08, HORSE_PAL, evalFn, shadeFn);
    horseCache.set(pose, pack);
  }
  return pack;
}

export function getHorsePosePack(...args: Parameters<typeof buildHorsePosePack>): ReturnType<typeof buildHorsePosePack> {
  return registerAnimalSpritePack(buildHorsePosePack(...args), { module: './Horse.ts', factory: 'getHorsePosePack', args }, buildHorsePosePack);
}

// ============================================================================
// INSTÂNCIA NA ARENA (Horse)
// ============================================================================
const HORSE_IDLE: readonly HorsePoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const HORSE_TROT: readonly HorsePoseName[] = ['trot0', 'trot1', 'trot2', 'trot3', 'trot4', 'trot5'];
const HORSE_GALLOP: readonly HorsePoseName[] = ['gallop0', 'gallop1', 'gallop2', 'gallop3', 'gallop4', 'gallop5'];
const HORSE_REAR: readonly HorsePoseName[] = ['rear0', 'rear1', 'rear2'];

function pickCycle<T>(frames: readonly T[], idx: number): T {
  return sampleAnimalCycle(frames, idx);
}

export class Horse extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private readonly home = new THREE.Vector3();
  private state: 'idle' | 'trot' | 'gallop' | 'rear' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.6, 3.2);
  private targetYaw = rand(0, Math.PI * 2);
  private gaitPhase = rand(0, Math.PI * 2);

  private readonly centerY = 0.60;

  constructor(ctx: GameContext, startPos: THREE.Vector3) {
    super(ctx, getHorsePosePack('idle0').getView(2, 0)!, HORSE_PW, HORSE_PH, HORSE_W, HORSE_H, 'HorseBillboard');
    this.hp = 95;
    this.maxHp = 95;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.50;
    this.motor.height = 1.24;
    this.motor.teleport(startPos);
    this.home.copy(startPos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.56, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.set(this.position.x, this.position.y + this.centerY, this.position.z);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y + 0.30, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.94, this.position.z);
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
    this.vel.x += hit.dir.x * 3.8;
    this.vel.z += hit.dir.z * 3.8;
    this.vel.y = 3.0;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.state = 'rear';
      this.stateT = 0;
      this.stateDur = 0.9;
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
        if (dist < 3.6 && this.state !== 'gallop' && this.state !== 'rear') {
          this.state = 'gallop';
          this.stateT = 0;
          this.stateDur = 2.4;
        }

        if (this.state === 'idle') {
          if (this.stateT >= this.stateDur) {
            this.state = Math.random() < 0.2 ? 'rear' : 'trot';
            this.stateT = 0;
            this.stateDur = this.state === 'rear' ? 1.1 : rand(2.4, 4.0);
            const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
            this.targetYaw = toHome > 9.5
              ? Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.5, 0.5)
              : this.facing + rand(-1.6, 1.6);
          }
        } else if (this.state === 'trot') {
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 5.5);
          speed = 2.8;
          if (this.stateT >= this.stateDur && this.motor.grounded) {
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.6, 3.0);
          }
        } else if (this.state === 'rear') {
          if (this.stateT >= this.stateDur) {
            this.state = 'gallop';
            this.stateT = 0;
            this.stateDur = 2.2;
          }
        } else if (this.state === 'gallop') {
          if (target && target.alive) {
            this.targetYaw = Math.atan2(this.position.x - target.position.x, this.position.z - target.position.z);
            this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 8);
          }
          speed = 6.2;
          if (this.stateT >= this.stateDur && dist > 5.8 && this.motor.grounded) {
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.5, 2.6);
          }
        }

        this.vel.x = damp(this.vel.x, Math.sin(this.facing) * speed, 8, dt);
        this.vel.z = damp(this.vel.z, Math.cos(this.facing) * speed, 8, dt);
        this.vel.y -= 20 * dt;
        this.motor.update(dt);

        const horiz = Math.hypot(this.vel.x, this.vel.z);
        if (horiz > 0.25 && this.motor.grounded) {
          this.gaitPhase += dt * 5.6 * (0.65 + horiz * 0.22);
        }
      }
      this.syncHurtbox();
    }

    const horiz = Math.hypot(this.vel.x, this.vel.z);
    const bob = this.alive && this.motor.grounded && horiz > 0.25
      ? Math.abs(Math.sin(this.gaitPhase)) * 0.032
      : 0;

    let pose: HorsePoseName;
    if (!this.alive) pose = 'idle0';
    else if (this.state === 'rear') pose = pickCycle(HORSE_REAR, this.stateT * 3.0);
    else if (this.state === 'gallop') pose = pickCycle(HORSE_GALLOP, (this.gaitPhase / Math.PI) * 2.8);
    else if (this.state === 'trot') pose = pickCycle(HORSE_TROT, (this.gaitPhase / Math.PI) * 2.6);
    else pose = pickCycle(HORSE_IDLE, this.stateT * 1.8);

    const deathSink = this.alive ? 0 : Math.min(0.28, this.deadT * 0.45);
    this.renderBillboard(getHorsePosePack(pose), this.position.y + this.centerY + bob - deathSink, camera, drawingBufferSize);
  }
}
