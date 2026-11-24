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
// PANDA GIGANTE (Giant Panda) — Flagship 64×56 @ ANIMAL_PPU
// ============================================================================
export type GiantPandaPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'walk0' | 'walk1' | 'walk2' | 'walk3' | 'walk4' | 'walk5'
  | 'sit0' | 'sit1' | 'sit2'
  | 'roll0' | 'roll1' | 'roll2' | 'roll3';

export const GIANT_PANDA_PW = 64;
export const GIANT_PANDA_PH = 56;
export const GIANT_PANDA_W = GIANT_PANDA_PW / ANIMAL_PPU;
export const GIANT_PANDA_H = GIANT_PANDA_PH / ANIMAL_PPU;

/** 4-tone warm ivory/white fur + 4-tone charcoal-black fur with cool blue-grey highlights + bamboo greens. */
const PANDA_PAL: Record<string, [number, number, number]> = {
  k:  [0x12, 0x13, 0x18], // crisp 1px outline / button nose / dark pupil
  w1: [0xb4, 0xad, 0x9e], // warm ivory deep shadow
  w2: [0xd6, 0xd0, 0xc3], // warm ivory mid-shadow
  w3: [0xee, 0xea, 0xe0], // warm cream-white midtone
  w4: [0xfd, 0xfc, 0xf7], // sunlit snow-ivory highlight / eye glint
  b0: [0x18, 0x1a, 0x22], // jet-black deep shadow
  b1: [0x27, 0x2b, 0x36], // charcoal-black mid-dark
  b2: [0x3c, 0x42, 0x52], // soft blue-grey charcoal highlight
  b3: [0x58, 0x61, 0x74], // rim highlight on black ears/shoulders/legs
  g0: [0x2a, 0x5c, 0x24], // bamboo stalk deep green
  g1: [0x4c, 0x94, 0x36], // bamboo stalk mid green
  g2: [0x82, 0xc9, 0x54], // bamboo leaf / sunlit highlight
};

interface PandaPose {
  mode: 'quad' | 'sit' | 'roll';
  bodyY: number;
  bodyRoll: number;
  headY: number;
  headZ: number;
  headSway: number;
  headPitch: number;
  fl: number;
  fr: number;
  bl: number;
  br: number;
  flLift: number;
  frLift: number;
  blLift: number;
  brLift: number;
  munchPhase?: number;
  tumbleAngle?: number;
}

const PANDA_POSES: Record<GiantPandaPoseName, PandaPose> = {
  // Gentle breathing & head sway
  idle0: {
    mode: 'quad', bodyY: 0.0, bodyRoll: 0.0, headY: 0.0, headZ: 0.0, headSway: 0.0, headPitch: 0.0,
    fl: 0.0, fr: 0.0, bl: 0.0, br: 0.0, flLift: 0, frLift: 0, blLift: 0, brLift: 0,
  },
  idle1: {
    mode: 'quad', bodyY: 0.014, bodyRoll: 0.015, headY: 0.02, headZ: 0.01, headSway: 0.04, headPitch: -0.05,
    fl: 0.0, fr: 0.0, bl: 0.0, br: 0.0, flLift: 0, frLift: 0, blLift: 0, brLift: 0,
  },
  idle2: {
    mode: 'quad', bodyY: -0.012, bodyRoll: -0.015, headY: -0.015, headZ: 0.015, headSway: -0.04, headPitch: 0.05,
    fl: 0.0, fr: 0.0, bl: 0.0, br: 0.0, flLift: 0, frLift: 0, blLift: 0, brLift: 0,
  },

  // 6-frame heavy gentle bear waddle
  walk0: {
    mode: 'quad', bodyY: 0.012, bodyRoll: 0.06, headY: -0.01, headZ: 0.02, headSway: 0.02, headPitch: 0.03,
    fl: 0.16, fr: -0.12, bl: -0.14, br: 0.14, flLift: 0.08, frLift: 0.0, blLift: 0.0, brLift: 0.07,
  },
  walk1: {
    mode: 'quad', bodyY: 0.020, bodyRoll: 0.04, headY: -0.015, headZ: 0.03, headSway: 0.01, headPitch: 0.04,
    fl: 0.08, fr: -0.04, bl: -0.06, br: 0.07, flLift: 0.03, frLift: 0.05, blLift: 0.05, brLift: 0.03,
  },
  walk2: {
    mode: 'quad', bodyY: -0.008, bodyRoll: -0.02, headY: 0.0, headZ: 0.01, headSway: -0.01, headPitch: 0.01,
    fl: -0.04, fr: 0.08, bl: 0.06, br: -0.04, flLift: 0.0, frLift: 0.08, blLift: 0.07, brLift: 0.0,
  },
  walk3: {
    mode: 'quad', bodyY: 0.012, bodyRoll: -0.06, headY: -0.01, headZ: 0.02, headSway: -0.02, headPitch: 0.03,
    fl: -0.12, fr: 0.16, bl: 0.14, br: -0.14, flLift: 0.0, frLift: 0.08, blLift: 0.07, brLift: 0.0,
  },
  walk4: {
    mode: 'quad', bodyY: 0.020, bodyRoll: -0.04, headY: -0.015, headZ: 0.03, headSway: -0.01, headPitch: 0.04,
    fl: -0.04, fr: 0.08, bl: 0.07, br: -0.06, flLift: 0.05, frLift: 0.03, blLift: 0.03, brLift: 0.05,
  },
  walk5: {
    mode: 'quad', bodyY: -0.008, bodyRoll: 0.02, headY: 0.0, headZ: 0.01, headSway: 0.01, headPitch: 0.01,
    fl: 0.08, fr: -0.04, bl: -0.04, br: 0.06, flLift: 0.08, frLift: 0.0, blLift: 0.0, brLift: 0.07,
  },

  // Sitting upright munching a green bamboo stalk!
  sit0: {
    mode: 'sit', bodyY: 0.0, bodyRoll: 0.0, headY: 0.0, headZ: 0.0, headSway: 0.0, headPitch: 0.06,
    fl: 0, fr: 0, bl: 0, br: 0, flLift: 0, frLift: 0, blLift: 0, brLift: 0, munchPhase: 0.0,
  },
  sit1: {
    mode: 'sit', bodyY: 0.01, bodyRoll: 0.02, headY: -0.02, headZ: 0.02, headSway: -0.03, headPitch: 0.14,
    fl: 0, fr: 0, bl: 0, br: 0, flLift: 0, frLift: 0, blLift: 0, brLift: 0, munchPhase: 1.0,
  },
  sit2: {
    mode: 'sit', bodyY: 0.0, bodyRoll: -0.02, headY: 0.01, headZ: 0.01, headSway: 0.03, headPitch: 0.02,
    fl: 0, fr: 0, bl: 0, br: 0, flLift: 0, frLift: 0, blLift: 0, brLift: 0, munchPhase: -0.5,
  },

  // 4-frame playful tumble roll!
  roll0: {
    mode: 'roll', bodyY: 0.02, bodyRoll: 0.0, headY: 0, headZ: 0, headSway: 0, headPitch: 0,
    fl: 0, fr: 0, bl: 0, br: 0, flLift: 0, frLift: 0, blLift: 0, brLift: 0, tumbleAngle: 0.0,
  },
  roll1: {
    mode: 'roll', bodyY: 0.04, bodyRoll: 0.0, headY: 0, headZ: 0, headSway: 0, headPitch: 0,
    fl: 0, fr: 0, bl: 0, br: 0, flLift: 0, frLift: 0, blLift: 0, brLift: 0, tumbleAngle: Math.PI * 0.5,
  },
  roll2: {
    mode: 'roll', bodyY: 0.02, bodyRoll: 0.0, headY: 0, headZ: 0, headSway: 0, headPitch: 0,
    fl: 0, fr: 0, bl: 0, br: 0, flLift: 0, frLift: 0, blLift: 0, brLift: 0, tumbleAngle: Math.PI,
  },
  roll3: {
    mode: 'roll', bodyY: 0.0, bodyRoll: 0.0, headY: 0, headZ: 0, headSway: 0, headPitch: 0,
    fl: 0, fr: 0, bl: 0, br: 0, flLift: 0, frLift: 0, blLift: 0, brLift: 0, tumbleAngle: Math.PI * 1.5,
  },
};

const pandaCache = new Map<GiantPandaPoseName, Boar27Pack>();

 function buildGiantPandaPosePack(pose: GiantPandaPoseName): Boar27Pack {
  let pack = pandaCache.get(pose);
  if (!pack) {
    const P = PANDA_POSES[pose];
    const by = P.bodyY;

    // Helper for big round panda head in local pitched coordinates
    const evalHead = (lx: number, ly: number, lz: number) => {
      const cranium = sdEllipsoid(lx, ly, lz, 0, 0.02, 0.0, 0.215, 0.195, 0.205);
      const cheekL = sdEllipsoid(lx, ly, lz, -0.145, -0.045, 0.045, 0.125, 0.115, 0.125);
      const cheekR = sdEllipsoid(lx, ly, lz,  0.145, -0.045, 0.045, 0.125, 0.115, 0.125);
      const muzzle = sdEllipsoid(lx, ly, lz, 0, -0.055, 0.185, 0.105, 0.082, 0.095);
      const headWhite = smin(smin(cranium, Math.min(cheekL, cheekR), 0.06), muzzle, 0.045);

      // Iconic round black ears
      const earL = sdEllipsoid(lx, ly, lz, -0.175, 0.185, -0.025, 0.082, 0.080, 0.052);
      const earR = sdEllipsoid(lx, ly, lz,  0.175, 0.185, -0.025, 0.082, 0.080, 0.052);
      const ears = Math.min(earL, earR);

      // Iconic tilted oval black eye patches
      const pL = sdEllipsoid(
        (lx + 0.092) * 0.92 + (ly - 0.015) * 0.39,
        -(lx + 0.092) * 0.39 + (ly - 0.015) * 0.92,
        lz - 0.155,
        0, 0, 0, 0.068, 0.050, 0.045,
      );
      const pR = sdEllipsoid(
        (lx - 0.092) * 0.92 - (ly - 0.015) * 0.39,
        (lx - 0.092) * 0.39 + (ly - 0.015) * 0.92,
        lz - 0.155,
        0, 0, 0, 0.068, 0.050, 0.045,
      );
      const patches = Math.min(pL, pR);

      // Expressive dark eyes + crisp white highlight glint
      const eyeL = sdEllipsoid(lx, ly, lz, -0.088, 0.020, 0.186, 0.026, 0.026, 0.024);
      const eyeR = sdEllipsoid(lx, ly, lz,  0.088, 0.020, 0.186, 0.026, 0.026, 0.024);
      const eyes = Math.min(eyeL, eyeR);

      const glintL = sdEllipsoid(lx, ly, lz, -0.096, 0.030, 0.202, 0.012, 0.012, 0.012);
      const glintR = sdEllipsoid(lx, ly, lz,  0.096, 0.030, 0.202, 0.012, 0.012, 0.012);
      const glints = Math.min(glintL, glintR);

      // Dark button nose
      const nose = sdEllipsoid(lx, ly, lz, 0, -0.036, 0.270, 0.046, 0.032, 0.028);

      return { headWhite, ears, patches, eyes, glints, nose };
    };

    const evalFn: SdfEvaluator = (x, y, z) => {
      if (P.mode === 'roll') {
        // Playful curled panda tumble ball rotating around X axis!
        const ang = P.tumbleAngle ?? 0;
        const cA = Math.cos(ang);
        const sA = Math.sin(ang);
        const ry = (y + 0.06 - by) * cA - z * sA;
        const rz = (y + 0.06 - by) * sA + z * cA;

        const ball = sdEllipsoid(x, ry, rz, 0, 0, 0, 0.36, 0.34, 0.36);
        const headB = sdEllipsoid(x, ry, rz, 0, 0.10, 0.24, 0.20, 0.19, 0.19);
        const earL = sdEllipsoid(x, ry, rz, -0.16, 0.25, 0.20, 0.075, 0.075, 0.05);
        const earR = sdEllipsoid(x, ry, rz,  0.16, 0.25, 0.20, 0.075, 0.075, 0.05);
        const pawFL = sdEllipsoid(x, ry, rz, -0.24, -0.12, 0.20, 0.12, 0.12, 0.13);
        const pawFR = sdEllipsoid(x, ry, rz,  0.24, -0.12, 0.20, 0.12, 0.12, 0.13);
        const pawBL = sdEllipsoid(x, ry, rz, -0.23, -0.16, -0.18, 0.13, 0.12, 0.14);
        const pawBR = sdEllipsoid(x, ry, rz,  0.23, -0.16, -0.18, 0.13, 0.12, 0.14);

        const white = smin(ball, headB, 0.07);
        const black = Math.min(Math.min(earL, earR), Math.min(Math.min(pawFL, pawFR), Math.min(pawBL, pawBR)));

        // Shoulder saddle stripe around the ball
        const isSaddle = rz > -0.04 && rz < 0.16;
        let d = smin(white, black, 0.04);
        let mat = black < white + 0.015 || isSaddle ? 'black' : 'white';
        return { d, mat };
      }

      if (P.mode === 'sit') {
        // Sitting upright cuddly panda munching a green bamboo stalk!
        const mp = P.munchPhase ?? 0;
        const belly = sdEllipsoid(x, y, z, 0, -0.16 + by, -0.02, 0.35, 0.32, 0.31);
        const chest = sdEllipsoid(x, y, z, 0, 0.08 + by, -0.02, 0.29, 0.24, 0.25);
        const tail = sdEllipsoid(x, y, z, 0, -0.34 + by, -0.32, 0.085, 0.080, 0.085);
        let whiteBody = smin(smin(belly, chest, 0.09), tail, 0.03);

        // Head perched on top
        const hy = 0.34 + by + P.headY;
        const hz = 0.04 + P.headZ;
        const cosP = Math.cos(P.headPitch);
        const sinP = Math.sin(P.headPitch);
        const dx = x - P.headSway;
        const dy = y - hy;
        const dz = z - hz;
        const lx = dx;
        const ly = dy * cosP + dz * sinP;
        const lz = -dy * sinP + dz * cosP;
        const H = evalHead(lx, ly, lz);
        whiteBody = smin(whiteBody, H.headWhite, 0.05);

        // Black shoulder saddle & arms holding bamboo up to mouth
        const saddle = sdEllipsoid(x, y, z, 0, 0.12 + by, -0.03, 0.31, 0.15, 0.26);
        const armL = sdCapsule(x, y, z, -0.25, 0.08 + by, 0.02, -0.14, 0.08 + by + mp * 0.03, 0.28, 0.105, 0.085);
        const armR = sdCapsule(x, y, z,  0.25, 0.08 + by, 0.02,  0.14, 0.10 + by - mp * 0.02, 0.28, 0.105, 0.085);

        // Chunky black hind legs splayed forward on ground
        const legL = sdCapsule(x, y, z, -0.22, -0.34 + by, 0.04, -0.26, -0.44, 0.30, 0.115, 0.095);
        const legR = sdCapsule(x, y, z,  0.22, -0.34 + by, 0.04,  0.26, -0.44, 0.30, 0.115, 0.095);

        const blackParts = Math.min(
          Math.min(H.ears, saddle),
          Math.min(Math.min(armL, armR), Math.min(legL, legR)),
        );

        // Green bamboo stalk + little leaves held in paws!
        const stalk = sdCapsule(x, y, z, -0.20, -0.14 + by, 0.31, 0.16, 0.24 + by + mp * 0.03, 0.32, 0.026, 0.024);
        const leaf1 = sdEllipsoid(x, y, z, 0.20, 0.27 + by + mp * 0.03, 0.32, 0.075, 0.028, 0.030);
        const leaf2 = sdEllipsoid(x, y, z, 0.14, 0.32 + by + mp * 0.03, 0.31, 0.055, 0.026, 0.028);
        const bamboo = Math.min(stalk, Math.min(leaf1, leaf2));

        let d = smin(whiteBody, blackParts, 0.035);
        let mat = blackParts < whiteBody + 0.008 ? 'black' : 'white';
        if (H.patches < d + 0.006) { d = Math.min(d, H.patches); mat = 'black'; }
        if (bamboo < d) { d = bamboo; mat = 'bamboo'; }
        if (H.eyes < d) { d = H.eyes; mat = 'eye'; }
        if (H.glints < d) { d = H.glints; mat = 'glint'; }
        if (H.nose < d) { d = H.nose; mat = 'nose'; }
        return { d, mat };
      }

      // Quadruped mode (idle / walk)
      const cosR = Math.cos(P.bodyRoll);
      const sinR = Math.sin(P.bodyRoll);
      const rx = x * cosR - (y - by) * sinR;
      const ry = x * sinR + (y - by) * cosR + by;

      // 1. Plump cuddly bear torso + white bob-tail
      const torso = sdEllipsoid(rx, ry, z, 0, 0.02 + by, -0.05, 0.33, 0.29, 0.42);
      const rump = sdEllipsoid(rx, ry, z, 0, 0.01 + by, -0.32, 0.30, 0.27, 0.24);
      const tail = sdEllipsoid(rx, ry, z, 0, 0.04 + by, -0.54, 0.088, 0.082, 0.085);
      let whiteBody = smin(smin(torso, rump, 0.10), tail, 0.035);

      // 2. Big round panda head
      const hy = 0.18 + by + P.headY;
      const hz = 0.44 + P.headZ;
      const cosP = Math.cos(P.headPitch);
      const sinP = Math.sin(P.headPitch);
      const dx = x - P.headSway;
      const dy = y - hy;
      const dz = z - hz;
      const lx = dx;
      const ly = dy * cosP + dz * sinP;
      const lz = -dy * sinP + dz * cosP;
      const H = evalHead(lx, ly, lz);
      whiteBody = smin(whiteBody, H.headWhite, 0.07);

      // 3. Iconic jet-black shoulder saddle wrapping over shoulders + chunky black legs
      const saddle = sdEllipsoid(rx, ry, z, 0, 0.06 + by, 0.20, 0.34, 0.28, 0.17);

      const fl = sdCapsule(x, y, z, -0.21, -0.06 + by, 0.22, -0.21, -0.49 + P.flLift, 0.24 + P.fl, 0.115, 0.090);
      const fr = sdCapsule(x, y, z,  0.21, -0.06 + by, 0.22,  0.21, -0.49 + P.frLift, 0.24 + P.fr, 0.115, 0.090);
      const bl = sdCapsule(x, y, z, -0.22, -0.08 + by, -0.26, -0.22, -0.49 + P.blLift, -0.25 + P.bl, 0.125, 0.092);
      const br = sdCapsule(x, y, z,  0.22, -0.08 + by, -0.26,  0.22, -0.49 + P.brLift, -0.25 + P.br, 0.125, 0.092);

      const pawFL = sdEllipsoid(x, y, z, -0.21, -0.50 + P.flLift, 0.28 + P.fl, 0.095, 0.052, 0.115);
      const pawFR = sdEllipsoid(x, y, z,  0.21, -0.50 + P.frLift, 0.28 + P.fr, 0.095, 0.052, 0.115);
      const pawBL = sdEllipsoid(x, y, z, -0.22, -0.50 + P.blLift, -0.21 + P.bl, 0.098, 0.052, 0.118);
      const pawBR = sdEllipsoid(x, y, z,  0.22, -0.50 + P.brLift, -0.21 + P.br, 0.098, 0.052, 0.118);

      const legs = Math.min(
        Math.min(smin(fl, pawFL, 0.03), smin(fr, pawFR, 0.03)),
        Math.min(smin(bl, pawBL, 0.03), smin(br, pawBR, 0.03)),
      );
      const blackParts = Math.min(H.ears, smin(saddle, legs, 0.05));

      let d = smin(whiteBody, blackParts, 0.045);
      let mat = blackParts < whiteBody + 0.012 ? 'black' : 'white';
      if (H.patches < d + 0.006) { d = Math.min(d, H.patches); mat = 'black'; }
      if (H.eyes < d) { d = H.eyes; mat = 'eye'; }
      if (H.glints < d) { d = H.glints; mat = 'glint'; }
      if (H.nose < d) { d = H.nose; mat = 'nose'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'glint') return 'w4';
      if (mat === 'eye' || mat === 'nose') return 'k';
      if (mat === 'bamboo') {
        const node = Math.sin(y * 38 + x * 18) > 0.72;
        if (node) return 'g0';
        return shade > 0.62 ? 'g2' : shade > 0.30 ? 'g1' : 'g0';
      }
      // Subtle plush bear fur texture
      const fur = Math.sin(x * 20 + z * 16) * Math.cos(y * 20) * 0.045;
      const s = shade + fur;
      if (mat === 'black') {
        return s > 0.76 ? 'b3' : s > 0.50 ? 'b2' : s > 0.24 ? 'b1' : 'b0';
      }
      return s > 0.76 ? 'w4' : s > 0.50 ? 'w3' : s > 0.25 ? 'w2' : 'w1';
    };

    pack = build27Pack(GIANT_PANDA_PW, GIANT_PANDA_PH, 1.06, 0.96, PANDA_PAL, evalFn, shadeFn);
    pandaCache.set(pose, pack);
  }
  return pack;
}

export function getGiantPandaPosePack(...args: Parameters<typeof buildGiantPandaPosePack>): ReturnType<typeof buildGiantPandaPosePack> {
  return registerAnimalSpritePack(buildGiantPandaPosePack(...args), { module: './GiantPanda.ts', factory: 'getGiantPandaPosePack', args }, buildGiantPandaPosePack);
}

// ============================================================================
// INSTÂNCIA NA ARENA (GiantPanda)
// ============================================================================
const PANDA_IDLE: readonly GiantPandaPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const PANDA_WALK: readonly GiantPandaPoseName[] = ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'];
const PANDA_SIT: readonly GiantPandaPoseName[] = ['sit0', 'sit1', 'sit2', 'sit1'];
const PANDA_ROLL: readonly GiantPandaPoseName[] = ['roll0', 'roll1', 'roll2', 'roll3'];

function pickCycle<T>(frames: readonly T[], idx: number): T {
  return sampleAnimalCycle(frames, idx);
}

export class GiantPanda extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private readonly home = new THREE.Vector3();
  private state: 'idle' | 'sit' | 'walk' | 'roll' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.6, 3.2);
  private targetYaw = rand(0, Math.PI * 2);
  private gaitPhase = rand(0, Math.PI * 2);

  private readonly centerY = 0.48;

  constructor(ctx: GameContext, startPos: THREE.Vector3) {
    super(ctx, getGiantPandaPosePack('idle0').getView(2, 0)!, GIANT_PANDA_PW, GIANT_PANDA_PH, GIANT_PANDA_W, GIANT_PANDA_H, 'GiantPandaBillboard');
    this.hp = 90;
    this.maxHp = 90;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.52;
    this.motor.height = 1.02;
    this.motor.teleport(startPos);
    this.home.copy(startPos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.58, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.set(this.position.x, this.position.y + this.centerY, this.position.z);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y + 0.28, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.78, this.position.z);
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
    this.vel.x += hit.dir.x * 3.2;
    this.vel.z += hit.dir.z * 3.2;
    this.vel.y = 2.6;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      // Playfully tumbles away when startled!
      this.state = 'roll';
      this.stateT = 0;
      this.stateDur = 1.6;
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
        let speed = 0;

        if (this.state === 'idle') {
          if (this.stateT >= this.stateDur) {
            const r = Math.random();
            this.state = r < 0.42 ? 'sit' : r < 0.85 ? 'walk' : 'roll';
            this.stateT = 0;
            this.stateDur = this.state === 'sit' ? rand(3.0, 5.2) : this.state === 'roll' ? rand(1.1, 1.8) : rand(2.2, 3.8);
            const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
            this.targetYaw = toHome > 8.0
              ? Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.5, 0.5)
              : this.facing + rand(-1.6, 1.6);
          }
        } else if (this.state === 'sit') {
          if (this.stateT >= this.stateDur) {
            this.state = 'walk';
            this.stateT = 0;
            this.stateDur = rand(2.0, 3.6);
          }
        } else if (this.state === 'walk') {
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 4.5);
          speed = 1.55;
          if (this.stateT >= this.stateDur && this.motor.grounded) {
            this.state = Math.random() < 0.5 ? 'sit' : 'idle';
            this.stateT = 0;
            this.stateDur = this.state === 'sit' ? rand(3.0, 5.0) : rand(1.6, 2.8);
          }
        } else if (this.state === 'roll') {
          if (target && target.alive) {
            const dist = Math.hypot(target.position.x - this.position.x, target.position.z - this.position.z);
            if (dist < 3.5) {
              this.targetYaw = Math.atan2(this.position.x - target.position.x, this.position.z - target.position.z);
            }
          }
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 7);
          speed = 3.4;
          if (this.stateT >= this.stateDur && this.motor.grounded) {
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
        if (horiz > 0.2 && this.motor.grounded) {
          this.gaitPhase += dt * 4.8 * (0.65 + horiz * 0.25);
        }
      }
      this.syncHurtbox();
    }

    const horiz = Math.hypot(this.vel.x, this.vel.z);
    const bob = this.alive && this.motor.grounded && horiz > 0.2 && this.state === 'walk'
      ? Math.abs(Math.sin(this.gaitPhase)) * 0.028
      : 0;

    let pose: GiantPandaPoseName;
    if (!this.alive) pose = 'idle0';
    else if (this.state === 'roll') pose = pickCycle(PANDA_ROLL, this.stateT * 6.0);
    else if (this.state === 'sit') pose = pickCycle(PANDA_SIT, this.stateT * 2.4);
    else if (this.state === 'walk') pose = pickCycle(PANDA_WALK, (this.gaitPhase / Math.PI) * 2.4);
    else pose = pickCycle(PANDA_IDLE, this.stateT * 1.8);

    const deathSink = this.alive ? 0 : Math.min(0.24, this.deadT * 0.4);
    this.renderBillboard(getGiantPandaPosePack(pose), this.position.y + this.centerY + bob - deathSink, camera, drawingBufferSize);
  }
}
