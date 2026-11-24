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
import { damp, rand } from '../core/math';

function pickCycle<T>(frames: readonly T[], idx: number): T {
  return sampleAnimalCycle(frames, idx);
}

// ============================================================================
// ÁGUIA-CARECA (Flagship Bald Eagle) — 64×46
// ============================================================================
export type EaglePoseName =
  | 'glide0' | 'glide1' | 'glide2'
  | 'flap0' | 'flap1' | 'flap2' | 'flap3' | 'flap4' | 'flap5'
  | 'swoop0' | 'swoop1' | 'swoop2';

export const EAGLE_PW = 64;
export const EAGLE_PH = 46;
export const EAGLE_W = EAGLE_PW / ANIMAL_PPU;
export const EAGLE_H = EAGLE_PH / ANIMAL_PPU;

/**
 * Rich 5-tone dark umber/chocolate feather palette + crisp snow-white head/tail
 * shading + golden beak/cere/leg ramp + piercing amber eye + 1px dark outline.
 */
const EAGLE_PAL: Record<string, [number, number, number]> = {
  k:  [0x10, 0x0c, 0x0b], // crisp 1px dark outline / pupil / nostrils / curved black talons
  b0: [0x1f, 0x13, 0x0d], // deepest espresso-umber primary tips & underwing shadow
  b1: [0x36, 0x20, 0x15], // dark chocolate plumage shadow
  b2: [0x52, 0x33, 0x20], // rich chocolate-umber midtone
  b3: [0x75, 0x4b, 0x2e], // warm chestnut-brown covert highlight
  b4: [0x9e, 0x6c, 0x45], // sunlit golden-bronze feather rim
  w0: [0xb0, 0xb6, 0xc0], // cool slate-white head/tail shadow
  w1: [0xdc, 0xde, 0xda], // soft off-white head/tail midtone
  W:  [0xfa, 0xf9, 0xf4], // crisp snow-white head, jagged ruff & fanned tail
  y0: [0xb2, 0x6f, 0x10], // deep ochre-gold beak/leg shadow
  y1: [0xec, 0xa8, 0x1e], // rich golden-yellow beak & scaled legs
  y2: [0xff, 0xd8, 0x52], // bright sunlit gold cere & beak ridge
  e:  [0xff, 0xb8, 0x1c], // piercing golden-amber raptor eye
};

interface EaglePose {
  bodyY: number;
  headY: number;
  headZ: number;
  beakOpen: number;
  wingMidY: number;
  wingTipY: number;
  wingSpan: number;
  wingSweep: number;
  primarySplay: number;
  tailSpread: number;
  tailPitch: number;
  talonReach: number; // 0 = tucked in flight, 1 = extended forward for swoop strike
}

const EAGLE_POSES: Record<EaglePoseName, EaglePose> = {
  glide0: {
    bodyY: 0.00, headY: 0.01, headZ: 0.00, beakOpen: 0.00,
    wingMidY: 0.11, wingTipY: 0.15, wingSpan: 0.90, wingSweep: -0.02,
    primarySplay: 1.05, tailSpread: 0.28, tailPitch: 0.01, talonReach: 0.0,
  },
  glide1: {
    bodyY: 0.02, headY: 0.02, headZ: 0.01, beakOpen: 0.00,
    wingMidY: 0.15, wingTipY: 0.21, wingSpan: 0.90, wingSweep: -0.04,
    primarySplay: 1.12, tailSpread: 0.30, tailPitch: 0.02, talonReach: 0.0,
  },
  glide2: {
    bodyY: -0.02, headY: 0.00, headZ: 0.00, beakOpen: 0.00,
    wingMidY: 0.07, wingTipY: 0.09, wingSpan: 0.91, wingSweep: 0.00,
    primarySplay: 0.98, tailSpread: 0.26, tailPitch: -0.01, talonReach: 0.0,
  },

  flap0: {
    bodyY: -0.03, headY: 0.00, headZ: 0.00, beakOpen: 0.12,
    wingMidY: 0.30, wingTipY: 0.50, wingSpan: 0.76, wingSweep: -0.07,
    primarySplay: 0.90, tailSpread: 0.28, tailPitch: -0.02, talonReach: 0.05,
  },
  flap1: {
    bodyY: -0.01, headY: 0.01, headZ: 0.01, beakOpen: 0.14,
    wingMidY: 0.18, wingTipY: 0.28, wingSpan: 0.88, wingSweep: -0.02,
    primarySplay: 1.10, tailSpread: 0.27, tailPitch: 0.00, talonReach: 0.05,
  },
  flap2: {
    bodyY: 0.03, headY: 0.00, headZ: 0.02, beakOpen: 0.06,
    wingMidY: -0.06, wingTipY: -0.22, wingSpan: 0.89, wingSweep: 0.05,
    primarySplay: 1.04, tailSpread: 0.24, tailPitch: 0.03, talonReach: 0.0,
  },
  flap3: {
    bodyY: 0.05, headY: -0.01, headZ: 0.02, beakOpen: 0.00,
    wingMidY: -0.24, wingTipY: -0.46, wingSpan: 0.76, wingSweep: 0.09,
    primarySplay: 0.92, tailSpread: 0.23, tailPitch: 0.04, talonReach: 0.0,
  },
  flap4: {
    bodyY: 0.02, headY: 0.00, headZ: 0.01, beakOpen: 0.00,
    wingMidY: -0.08, wingTipY: -0.16, wingSpan: 0.83, wingSweep: 0.02,
    primarySplay: 0.85, tailSpread: 0.25, tailPitch: 0.02, talonReach: 0.0,
  },
  flap5: {
    bodyY: -0.02, headY: 0.01, headZ: 0.00, beakOpen: 0.08,
    wingMidY: 0.16, wingTipY: 0.32, wingSpan: 0.82, wingSweep: -0.04,
    primarySplay: 0.92, tailSpread: 0.28, tailPitch: -0.01, talonReach: 0.05,
  },

  swoop0: {
    bodyY: 0.00, headY: -0.03, headZ: 0.03, beakOpen: 0.28,
    wingMidY: 0.15, wingTipY: 0.26, wingSpan: 0.66, wingSweep: -0.24,
    primarySplay: 0.78, tailSpread: 0.18, tailPitch: 0.04, talonReach: 0.60,
  },
  swoop1: {
    bodyY: -0.02, headY: -0.05, headZ: 0.05, beakOpen: 0.48,
    wingMidY: 0.19, wingTipY: 0.30, wingSpan: 0.56, wingSweep: -0.34,
    primarySplay: 0.70, tailSpread: 0.15, tailPitch: 0.06, talonReach: 1.00,
  },
  swoop2: {
    bodyY: 0.01, headY: -0.02, headZ: 0.02, beakOpen: 0.22,
    wingMidY: 0.12, wingTipY: 0.18, wingSpan: 0.72, wingSweep: -0.18,
    primarySplay: 0.86, tailSpread: 0.22, tailPitch: 0.02, talonReach: 0.70,
  },
};

const EAGLE_GLIDE: readonly EaglePoseName[] = ['glide0', 'glide1', 'glide0', 'glide2'];
const EAGLE_FLAP: readonly EaglePoseName[] = ['flap0', 'flap1', 'flap2', 'flap3', 'flap4', 'flap5'];
const EAGLE_SWOOP: readonly EaglePoseName[] = ['swoop0', 'swoop1', 'swoop2'];

const eagleCache = new Map<EaglePoseName, Boar27Pack>();

 function buildEaglePosePack(pose: EaglePoseName): Boar27Pack {
  let pack = eagleCache.get(pose);
  if (!pack) {
    const P = EAGLE_POSES[pose];
    const by = P.bodyY;
    const hy = 0.125 + by + P.headY;
    const hz = 0.48 + P.headZ;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // 1. Broad, powerful dark-chocolate chest & streamlined raptor torso
      const chest = sdEllipsoid(x, y, z, 0, -0.01 + by, 0.08, 0.195, 0.172, 0.29);
      const belly = sdEllipsoid(x, y, z, 0, -0.02 + by, -0.15, 0.150, 0.128, 0.24);
      const torso = smin(chest, belly, 0.08);

      // 2. Crisp snowy-white feathered head & sculpted jagged neck-ruff transition
      const ruffBase = sdEllipsoid(x, y, z, 0, 0.05 + by + P.headY * 0.35, 0.27 + P.headZ * 0.4, 0.158, 0.145, 0.145);
      // 6 sculpted overlapping feather tufts forming the jagged white mantle collar
      let ruffTufts = ruffBase;
      for (let t = 0; t < 6; t++) {
        const ang = (t / 6) * Math.PI * 2 + 0.3;
        const tx = Math.cos(ang) * 0.135;
        const ty = 0.045 + by + P.headY * 0.35 + Math.sin(ang) * 0.125;
        const tuft = sdCapsule(
          x, y, z,
          tx * 0.72, ty, 0.28 + P.headZ * 0.4,
          tx, ty - 0.015, 0.17 + P.headZ * 0.3,
          0.042, 0.018,
        );
        ruffTufts = smin(ruffTufts, tuft, 0.018);
      }

      const neck = sdCapsule(
        x, y, z,
        0, 0.05 + by + P.headY * 0.35, 0.25 + P.headZ * 0.4,
        0, hy - 0.01, hz - 0.03,
        0.128, 0.102,
      );
      // Flat-topped regal eagle skull + fuller cheeks
      const skull = sdEllipsoid(x, y, z, 0, hy, hz, 0.110, 0.098, 0.134);
      const crown = sdEllipsoid(x, y, z, 0, hy + 0.036, hz - 0.01, 0.088, 0.056, 0.118);

      // Fierce overhanging supraorbital brow ridges
      const browL = sdCapsule(x, y, z, -0.046, hy + 0.046, hz + 0.03, -0.104, hy + 0.038, hz + 0.075, 0.026, 0.017);
      const browR = sdCapsule(x, y, z,  0.046, hy + 0.046, hz + 0.03,  0.104, hy + 0.038, hz + 0.075, 0.026, 0.017);
      const brows = Math.min(browL, browR);

      const head = smin(smin(skull, crown, 0.03), brows, 0.015);
      let body = smin(torso, smin(ruffTufts, smin(neck, head, 0.035), 0.038), 0.05);

      // 3. Wide fanned snowy-white tail (5 overlapping tail feathers with distinct fanned tips)
      let tail = 99;
      for (let i = -2; i <= 2; i++) {
        const t = i * 0.5; // -1..1
        const tx = t * P.tailSpread * 1.22;
        const tz = -0.71 + Math.abs(t) * 0.062;
        const ty = by + P.tailPitch - Math.abs(t) * 0.012;
        const feather = sdCapsule(
          x, y, z,
          t * 0.048, -0.01 + by, -0.27,
          tx, ty, tz,
          0.056, 0.030,
        );
        // Smooth blend at base, crisp feather separation near tips
        tail = z > -0.52 ? smin(tail, feather, 0.022) : Math.min(tail, feather);
      }
      body = smin(body, tail, 0.035);

      // 4. Wider, dramatic arched wingspan: shoulder -> arm -> hand + 5 splayed primary "finger" feathers
      const midX = P.wingSpan * 0.46;
      const tipX = P.wingSpan * 0.84;
      const midY = by + P.wingMidY;
      const tipY = by + P.wingTipY * 0.88;
      // Arched raptor leading edge: wrist sweeps slightly forward, hand sweeps back
      const midZ = 0.11 + P.wingSweep * 0.38;
      const tipZ = -0.02 + P.wingSweep;

      let wings = 99;
      let primaries = 99;

      for (let side = -1; side <= 1; side += 2) {
        // Muscular shoulder/arm leading edge (humerus + ulna)
        const wingArm = sdCapsule(
          x, y, z,
          side * 0.14, 0.04 + by, 0.11,
          side * midX, midY + 0.015, midZ + 0.04,
          0.095, 0.074,
        );
        // Outer hand leading edge (manus)
        const wingHand = sdCapsule(
          x, y, z,
          side * midX, midY + 0.015, midZ + 0.04,
          side * tipX, tipY, tipZ + 0.02,
          0.072, 0.048,
        );
        // Solid middle wing covert web (bridges leading edge to secondaries with zero crevice)
        const wingWebIn = sdCapsule(
          x, y, z,
          side * 0.15, 0.025 + by, 0.01,
          side * (midX * 0.98), midY + 0.002, midZ - 0.045,
          0.088, 0.068,
        );
        const wingWebOut = sdCapsule(
          x, y, z,
          side * (midX * 0.92), midY + 0.002, midZ - 0.045,
          side * (tipX * 0.96), tipY - 0.004, tipZ - 0.055,
          0.066, 0.044,
        );
        // Broad layered secondary flight feathers (trailing edge)
        const secInner = sdCapsule(
          x, y, z,
          side * 0.16, 0.01 + by, -0.08,
          side * (midX * 0.96), midY - 0.010, midZ - 0.135,
          0.076, 0.054,
        );
        const secOuter = sdCapsule(
          x, y, z,
          side * (midX * 0.88), midY - 0.008, midZ - 0.125,
          side * (tipX * 0.92), tipY - 0.014, tipZ - 0.125,
          0.058, 0.036,
        );

        const leading = smin(wingArm, wingHand, 0.045);
        const middle = smin(wingWebIn, wingWebOut, 0.045);
        const trailing = smin(secInner, secOuter, 0.045);
        let wing = smin(smin(leading, middle, 0.065), trailing, 0.065);

        // 5 individually splayed primary wingtip "finger" feathers (clearly separated in silhouette!)
        for (let p = 0; p < 5; p++) {
          const frac = p / 4; // 0 = leading primary, 1 = trailing primary
          const baseX = side * (tipX - frac * 0.055);
          const baseY = tipY - frac * 0.012;
          const baseZ = tipZ + 0.03 - frac * 0.14;

          // Wide radial fan so each finger feather projects cleanly with open air slots
          const fanZ = (0.11 - frac * 0.24) * P.primarySplay;
          const fanY = (0.08 - frac * 0.09) * P.primarySplay + (P.wingTipY - P.wingMidY) * 0.24;
          const extLen = (0.23 - Math.abs(frac - 0.35) * 0.045) * (0.84 + P.primarySplay * 0.18);

          const endX = baseX + side * extLen * (1.0 - frac * 0.18);
          const endY = baseY + fanY;
          const endZ = baseZ + fanZ;

          const feather = sdCapsule(x, y, z, baseX, baseY, baseZ, endX, endY, endZ, 0.022, 0.011);
          primaries = Math.min(primaries, feather);
          // Hard min keeps the finger slots crisp and unmistakable!
          wing = Math.min(wing, feather);
        }

        wings = Math.min(wings, wing);
      }
      body = smin(body, wings, 0.045);

      // 5. Strong hooked golden-yellow beak with fleshy cere & nostrils
      const cere = sdEllipsoid(x, y, z, 0, hy + 0.012, hz + 0.118, 0.052, 0.042, 0.036);
      const beakBridge = sdCapsule(x, y, z, 0, hy + 0.012, hz + 0.122, 0, hy - 0.014, hz + 0.245, 0.046, 0.022);
      const beakHook = sdCapsule(x, y, z, 0, hy - 0.012, hz + 0.235, 0, hy - 0.074, hz + 0.255, 0.022, 0.009);
      const lowerBeak = sdCapsule(
        x, y, z,
        0, hy - 0.022 - P.beakOpen * 0.02, hz + 0.115,
        0, hy - 0.038 - P.beakOpen * 0.06, hz + 0.210,
        0.028, 0.014,
      );
      const beak = smin(smin(cere, beakBridge, 0.014), Math.min(beakHook, lowerBeak), 0.012);

      // 6. Feathered dark-chocolate thighs, golden-yellow legs/toes & curved black talons
      const tr = P.talonReach;
      let thighs = 99;
      let feet = 99;
      let talons = 99;

      for (let side = -1; side <= 1; side += 2) {
        const hipX = side * 0.088;
        const hipY = -0.10 + by;
        const hipZ = -0.05 + tr * 0.08;

        const kneeX = side * (0.095 + tr * 0.02);
        const kneeY = -0.18 + by - tr * 0.05;
        const kneeZ = -0.14 + tr * 0.26;

        const ankleX = side * (0.092 + tr * 0.025);
        const ankleY = -0.22 + by - tr * 0.12;
        const ankleZ = -0.22 + tr * 0.42;

        const thigh = sdCapsule(x, y, z, hipX, hipY, hipZ, kneeX, kneeY, kneeZ, 0.054, 0.036);
        const tarsus = sdCapsule(x, y, z, kneeX, kneeY, kneeZ, ankleX, ankleY, ankleZ, 0.025, 0.020);

        // Spread golden-yellow toes (center + outer + inner)
        const toeLen = 0.062 * (0.42 + tr * 0.85);
        const toeC = sdCapsule(x, y, z, ankleX, ankleY, ankleZ, ankleX, ankleY - 0.014 - tr * 0.02, ankleZ + toeLen, 0.016, 0.012);
        const toeO = sdCapsule(x, y, z, ankleX, ankleY, ankleZ, ankleX + side * 0.032 * (0.4 + tr * 0.8), ankleY - 0.016 - tr * 0.02, ankleZ + toeLen * 0.82, 0.014, 0.010);

        // Curved black talons (front center, front outer, and rear hallux)
        const clawC = sdCapsule(
          x, y, z,
          ankleX, ankleY - 0.014 - tr * 0.02, ankleZ + toeLen * 0.92,
          ankleX, ankleY - 0.058 - tr * 0.032, ankleZ + toeLen * 0.72,
          0.012, 0.005,
        );
        const clawO = sdCapsule(
          x, y, z,
          ankleX + side * 0.032 * (0.4 + tr * 0.8), ankleY - 0.016 - tr * 0.02, ankleZ + toeLen * 0.78,
          ankleX + side * 0.034 * (0.4 + tr * 0.8), ankleY - 0.054 - tr * 0.028, ankleZ + toeLen * 0.60,
          0.011, 0.005,
        );
        const clawB = sdCapsule(
          x, y, z,
          ankleX, ankleY - 0.01, ankleZ - 0.016,
          ankleX, ankleY - 0.048 - tr * 0.018, ankleZ - 0.038,
          0.011, 0.005,
        );

        thighs = Math.min(thighs, thigh);
        feet = Math.min(feet, smin(tarsus, Math.min(toeC, toeO), 0.01));
        talons = Math.min(talons, Math.min(clawC, Math.min(clawO, clawB)));
      }
      body = smin(body, thighs, 0.028);

      // 7. Piercing golden-amber eyes tucked under the sharp brow ridge
      const eyeL = sdEllipsoid(x, y, z, -0.084, hy + 0.016, hz + 0.050, 0.027, 0.025, 0.026);
      const eyeR = sdEllipsoid(x, y, z,  0.084, hy + 0.016, hz + 0.050, 0.027, 0.025, 0.026);
      const eyes = Math.min(eyeL, eyeR);

      let d = body;
      let mat = 'body';
      if (tail < body + 0.008 && z < -0.32) mat = 'tail';
      if (primaries < d + 0.006 && Math.abs(x) > P.wingSpan * 0.70) mat = 'primary';
      if (beak < d) { d = beak; mat = cere < beak + 0.009 ? 'cere' : 'beak'; }
      if (feet < d) { d = feet; mat = 'foot'; }
      if (talons < d) { d = talons; mat = 'talon'; }
      if (eyes < d) { d = eyes; mat = 'eye'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'talon') return 'k';
      if (mat === 'eye') {
        // Piercing golden-amber iris with crisp dark pupil
        const dz = z - (hz + 0.060);
        const dy = y - (hy + 0.016);
        if (dz * dz + dy * dy < 0.00022) return 'k';
        return 'e';
      }
      if (mat === 'cere') {
        // Subtle dark nostril dots on the golden cere
        if (Math.abs(Math.abs(x) - 0.032) < 0.012 && Math.abs(y - (hy + 0.014)) < 0.012 && z > hz + 0.112) {
          return 'k';
        }
        return shade > 0.36 ? 'y2' : 'y1';
      }
      if (mat === 'beak') return shade > 0.66 ? 'y2' : shade > 0.34 ? 'y1' : 'y0';
      if (mat === 'foot') return shade > 0.44 ? 'y1' : 'y0';

      if (mat === 'tail') {
        // Crisp snow-white fanned tail with subtle feather-shaft separation
        const featherRib = Math.sin(x * 36) * 0.065;
        const s = shade + featherRib;
        return s > 0.56 ? 'W' : s > 0.28 ? 'w1' : 'w0';
      }

      // Iconic snowy-white bald eagle head & jagged feathered neck-ruff transition
      const ruffAngle = Math.atan2(y - by, x);
      const ruffJagged = Math.cos(ruffAngle * 6) * 0.038 + Math.sin(ruffAngle * 12) * 0.014;
      if (z > 0.195 + ruffJagged && Math.abs(x) < 0.185) {
        return shade > 0.56 ? 'W' : shade > 0.26 ? 'w1' : 'w0';
      }

      // Splayed dark-umber primary wingtip "finger" feathers
      if (mat === 'primary' || Math.abs(x) > P.wingSpan * 0.72) {
        return shade > 0.68 ? 'b2' : shade > 0.36 ? 'b1' : 'b0';
      }

      // Smooth, natural covert-to-secondary plumage shading (no harsh dark seam down center of wing)
      if (Math.abs(x) > 0.18) {
        const wingMidZ = 0.11 + P.wingSweep * 0.38;
        const covertLift = Math.max(-0.06, Math.min(0.08, (z - (wingMidZ - 0.05)) * 0.45));
        const s = shade + covertLift;
        return s > 0.76 ? 'b4' : s > 0.52 ? 'b3' : s > 0.28 ? 'b2' : 'b1';
      }

      const chestTex = Math.sin(z * 20 + y * 12) * 0.035;
      const s = shade + chestTex;
      return s > 0.78 ? 'b4' : s > 0.56 ? 'b3' : s > 0.34 ? 'b2' : s > 0.15 ? 'b1' : 'b0';
    };

    pack = build27Pack(EAGLE_PW, EAGLE_PH, 1.16, 0.835, EAGLE_PAL, evalFn, shadeFn);
    eagleCache.set(pose, pack);
  }
  return pack;
}

export function getEaglePosePack(...args: Parameters<typeof buildEaglePosePack>): ReturnType<typeof buildEaglePosePack> {
  return registerAnimalSpritePack(buildEaglePosePack(...args), { module: './Eagle.ts', factory: 'getEaglePosePack', args }, buildEaglePosePack);
}

/**
 * Bald Eagle: soars, glides, flaps, and swoops majestically above the arena.
 */
export class Eagle extends BasePixelAnimal {
  readonly position = new THREE.Vector3();
  private readonly home = new THREE.Vector3();
  private readonly vel = new THREE.Vector3();
  private orbitAngle = rand(0, Math.PI * 2);
  private orbitRadius = rand(5.5, 9.5);
  private cruiseAlt = rand(3.6, 5.2);
  private state: 'glide' | 'flap' | 'swoop' = 'glide';
  private stateT = 0;
  private stateDur = rand(2.5, 4.5);

  constructor(ctx: GameContext, pos: THREE.Vector3) {
    super(ctx, getEaglePosePack('glide0').getView(2, 0)!, EAGLE_PW, EAGLE_PH, EAGLE_W, EAGLE_H, 'EagleBillboard');
    this.hp = 45;
    this.maxHp = 45;
    this.home.copy(pos);
    this.position.set(pos.x, pos.y + this.cruiseAlt, pos.z);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.45, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.copy(this.position);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y - 0.20, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.20, this.position.z);
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
    this.vel.x += hit.dir.x * 4.5;
    this.vel.z += hit.dir.z * 4.5;
    this.vel.y = 3.2;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.state = 'flap';
      this.stateT = 0;
      this.stateDur = 2.0;
    }
    return res;
  }

  update(dt: number, _target: EnemyTarget | null, camera: THREE.Camera, drawingBufferSize?: THREE.Vector2) {
    if (dt > 0) {
      this.stateT += dt;
      this.flash = Math.max(0, this.flash - dt * 4.5);

      if (!this.alive) {
        this.deadT += dt;
        this.vel.x = damp(this.vel.x, 0, 4, dt);
        this.vel.z = damp(this.vel.z, 0, 4, dt);
        this.vel.y -= 18 * dt;
        this.position.addScaledVector(this.vel, dt);
        if (this.position.y < this.home.y + 0.25) {
          this.position.y = this.home.y + 0.25;
          this.vel.y = 0;
        }
      } else {
        if (this.stateT >= this.stateDur) {
          const r = Math.random();
          this.state = r < 0.45 ? 'glide' : r < 0.82 ? 'flap' : 'swoop';
          this.stateT = 0;
          this.stateDur = this.state === 'swoop' ? rand(1.4, 2.2) : rand(2.2, 4.2);
        }

        const angularSpeed = this.state === 'swoop' ? 0.85 : this.state === 'flap' ? 0.62 : 0.48;
        this.orbitAngle += angularSpeed * dt;
        const targetX = this.home.x + Math.cos(this.orbitAngle) * this.orbitRadius;
        const targetZ = this.home.z + Math.sin(this.orbitAngle) * this.orbitRadius;
        const altOffset = this.state === 'swoop' ? -1.4 : this.state === 'flap' ? 0.45 : 0.0;
        const targetY = this.home.y + this.cruiseAlt + altOffset + Math.sin(this.orbitAngle * 2.0) * 0.35;

        const dx = targetX - this.position.x;
        const dy = targetY - this.position.y;
        const dz = targetZ - this.position.z;
        this.vel.x = damp(this.vel.x, dx * 2.4, 4.5, dt);
        this.vel.y = damp(this.vel.y, dy * 2.2, 4.5, dt);
        this.vel.z = damp(this.vel.z, dz * 2.4, 4.5, dt);
        this.position.addScaledVector(this.vel, dt);

        if (Math.hypot(this.vel.x, this.vel.z) > 0.2) {
          const desiredYaw = Math.atan2(this.vel.x, this.vel.z);
          this.facing += angleDiff(this.facing, desiredYaw) * Math.min(1, dt * 6);
        }
        this.bodyPitch = damp(this.bodyPitch, Math.max(-0.35, Math.min(0.35, this.vel.y * 0.08)), 6, dt);
      }
      this.syncHurtbox();
    }

    let pose: EaglePoseName;
    if (!this.alive) pose = 'glide0';
    else if (this.state === 'flap') pose = pickCycle(EAGLE_FLAP, this.stateT * 7.5);
    else if (this.state === 'swoop') pose = pickCycle(EAGLE_SWOOP, this.stateT * 3.5);
    else pose = pickCycle(EAGLE_GLIDE, this.stateT * 2.0);

    this.renderBillboard(getEaglePosePack(pose), this.position.y, camera, drawingBufferSize);
  }
}
