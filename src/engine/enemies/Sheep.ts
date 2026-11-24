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
// OVELHA (Sheep) — Flagship 48×40 @ ANIMAL_PPU
// ============================================================================
export type SheepPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'walk0' | 'walk1' | 'walk2' | 'walk3' | 'walk4' | 'walk5'
  | 'graze0' | 'graze1' | 'graze2'
  | 'flee0' | 'flee1' | 'flee2' | 'flee3';

export const SHEEP_PW = 48;
export const SHEEP_PH = 40;
export const SHEEP_W = SHEEP_PW / ANIMAL_PPU;
export const SHEEP_H = SHEEP_PH / ANIMAL_PPU;

/** Rich 5-tone warm cream/ivory wool + dark charcoal face/hoof ramp + eye glint. */
const SHEEP_PAL: Record<string, [number, number, number]> = {
  k:  [0x15, 0x13, 0x17], // 1px outline / hooves / nostrils / dark pupil
  f0: [0x22, 0x20, 0x26], // charcoal deep shadow (face, legs, outer ear)
  f1: [0x35, 0x32, 0x3b], // charcoal mid-dark
  f2: [0x4c, 0x48, 0x54], // charcoal midtone
  f3: [0x68, 0x63, 0x72], // charcoal brow/muzzle highlight
  ep: [0x6e, 0x56, 0x5c], // warm muted inner-ear tint
  w0: [0x9e, 0x91, 0x7d], // wool deep warm shadow (underbelly / tuft crevices)
  w1: [0xbf, 0xb3, 0x9e], // wool warm mid-shadow
  w2: [0xdd, 0xd4, 0xc2], // wool cream midtone
  w3: [0xf1, 0xea, 0xdc], // wool bright ivory
  W:  [0xfd, 0xfb, 0xf4], // wool sunlit snow-cream highlight / eye glint
  e0: [0x1c, 0x19, 0x1e], // dark expressive eye
};

interface SheepPose {
  bodyY: number;
  bodyPitch: number;
  headDip: number;
  headFwd: number;
  headSway: number;
  headPitch: number;
  earDroop: number;
  tailLift: number;
  fl: number;
  fr: number;
  bl: number;
  br: number;
  flLift: number;
  frLift: number;
  blLift: number;
  brLift: number;
}

const SHEEP_POSES: Record<SheepPoseName, SheepPose> = {
  // Gentle breathing & ear/head sway
  idle0: {
    bodyY: 0.0, bodyPitch: 0.0, headDip: 0.0, headFwd: 0.0, headSway: 0.0, headPitch: 0.0,
    earDroop: 0.0, tailLift: 0.0,
    fl: 0.0, fr: 0.0, bl: 0.0, br: 0.0, flLift: 0, frLift: 0, blLift: 0, brLift: 0,
  },
  idle1: {
    bodyY: 0.012, bodyPitch: 0.01, headDip: 0.022, headFwd: 0.01, headSway: 0.032, headPitch: -0.04,
    earDroop: -0.02, tailLift: 0.02,
    fl: 0.0, fr: 0.0, bl: 0.0, br: 0.0, flLift: 0, frLift: 0, blLift: 0, brLift: 0,
  },
  idle2: {
    bodyY: -0.010, bodyPitch: -0.01, headDip: -0.018, headFwd: 0.015, headSway: -0.032, headPitch: 0.04,
    earDroop: 0.025, tailLift: -0.01,
    fl: 0.0, fr: 0.0, bl: 0.0, br: 0.0, flLift: 0, frLift: 0, blLift: 0, brLift: 0,
  },

  // 6-frame natural quadruped walk
  walk0: {
    bodyY: 0.014, bodyPitch: 0.01, headDip: -0.01, headFwd: 0.03, headSway: 0.01, headPitch: 0.02,
    earDroop: 0.01, tailLift: 0.02,
    fl: 0.16, fr: -0.12, bl: -0.14, br: 0.14, flLift: 0.09, frLift: 0.0, blLift: 0.0, brLift: 0.08,
  },
  walk1: {
    bodyY: 0.022, bodyPitch: 0.02, headDip: -0.015, headFwd: 0.04, headSway: 0.0, headPitch: 0.03,
    earDroop: 0.02, tailLift: 0.03,
    fl: 0.08, fr: -0.03, bl: -0.06, br: 0.07, flLift: 0.03, frLift: 0.06, blLift: 0.06, brLift: 0.03,
  },
  walk2: {
    bodyY: -0.005, bodyPitch: 0.0, headDip: 0.0, headFwd: 0.02, headSway: -0.01, headPitch: 0.01,
    earDroop: 0.0, tailLift: 0.01,
    fl: -0.04, fr: 0.08, bl: 0.06, br: -0.05, flLift: 0.0, frLift: 0.09, blLift: 0.08, brLift: 0.0,
  },
  walk3: {
    bodyY: 0.014, bodyPitch: 0.01, headDip: -0.01, headFwd: 0.03, headSway: -0.01, headPitch: 0.02,
    earDroop: 0.01, tailLift: 0.02,
    fl: -0.12, fr: 0.16, bl: 0.14, br: -0.14, flLift: 0.0, frLift: 0.09, blLift: 0.08, brLift: 0.0,
  },
  walk4: {
    bodyY: 0.022, bodyPitch: 0.02, headDip: -0.015, headFwd: 0.04, headSway: 0.0, headPitch: 0.03,
    earDroop: 0.02, tailLift: 0.03,
    fl: -0.03, fr: 0.08, bl: 0.07, br: -0.06, flLift: 0.06, frLift: 0.03, blLift: 0.03, brLift: 0.06,
  },
  walk5: {
    bodyY: -0.005, bodyPitch: 0.0, headDip: 0.0, headFwd: 0.02, headSway: 0.01, headPitch: 0.01,
    earDroop: 0.0, tailLift: 0.01,
    fl: 0.08, fr: -0.04, bl: -0.05, br: 0.06, flLift: 0.09, frLift: 0.0, blLift: 0.0, brLift: 0.08,
  },

  // 3-frame grazing cycle (dipping down, nibbling left/right)
  graze0: {
    bodyY: -0.012, bodyPitch: 0.06, headDip: -0.24, headFwd: 0.10, headSway: 0.0, headPitch: 0.34,
    earDroop: 0.05, tailLift: 0.02,
    fl: 0.05, fr: -0.02, bl: 0.0, br: 0.0, flLift: 0, frLift: 0, blLift: 0, brLift: 0,
  },
  graze1: {
    bodyY: -0.024, bodyPitch: 0.10, headDip: -0.44, headFwd: 0.16, headSway: -0.035, headPitch: 0.62,
    earDroop: 0.08, tailLift: 0.05,
    fl: 0.09, fr: -0.03, bl: 0.0, br: 0.0, flLift: 0, frLift: 0, blLift: 0, brLift: 0,
  },
  graze2: {
    bodyY: -0.022, bodyPitch: 0.09, headDip: -0.41, headFwd: 0.18, headSway: 0.04, headPitch: 0.58,
    earDroop: 0.07, tailLift: 0.06,
    fl: 0.09, fr: -0.03, bl: 0.0, br: 0.0, flLift: 0, frLift: 0, blLift: 0, brLift: 0,
  },

  // 4-frame bouncy fleeing gallop / pronk
  flee0: {
    bodyY: -0.015, bodyPitch: -0.06, headDip: 0.03, headFwd: 0.06, headSway: 0.0, headPitch: -0.08,
    earDroop: -0.04, tailLift: 0.10,
    fl: 0.24, fr: 0.16, bl: -0.22, br: -0.14, flLift: 0.16, frLift: 0.10, blLift: 0.04, brLift: 0.0,
  },
  flee1: {
    bodyY: 0.055, bodyPitch: 0.04, headDip: 0.05, headFwd: 0.08, headSway: 0.0, headPitch: -0.10,
    earDroop: -0.06, tailLift: 0.16,
    fl: 0.28, fr: 0.22, bl: -0.26, br: -0.20, flLift: 0.22, frLift: 0.18, blLift: 0.18, brLift: 0.14,
  },
  flee2: {
    bodyY: 0.015, bodyPitch: 0.08, headDip: 0.01, headFwd: 0.05, headSway: 0.0, headPitch: -0.04,
    earDroop: 0.02, tailLift: 0.12,
    fl: -0.18, fr: -0.10, bl: 0.22, br: 0.14, flLift: 0.02, frLift: 0.08, blLift: 0.14, brLift: 0.08,
  },
  flee3: {
    bodyY: -0.025, bodyPitch: 0.02, headDip: -0.01, headFwd: 0.04, headSway: 0.0, headPitch: -0.02,
    earDroop: 0.03, tailLift: 0.08,
    fl: -0.06, fr: 0.04, bl: 0.10, br: 0.02, flLift: 0.0, frLift: 0.02, blLift: 0.02, brLift: 0.0,
  },
};

const sheepCache = new Map<SheepPoseName, Boar27Pack>();

 function buildSheepPosePack(pose: SheepPoseName): Boar27Pack {
  let pack = sheepCache.get(pose);
  if (!pack) {
    const P = SHEEP_POSES[pose];
    const by = P.bodyY;
    const hPivotY = 0.17 + P.headDip + by;
    const hPivotZ = 0.43 + P.headFwd;
    const hx = P.headSway;
    const cosP = Math.cos(P.headPitch);
    const sinP = Math.sin(P.headPitch);

    const evalFn: SdfEvaluator = (x, y, z) => {
      // Subtle body pitch offset along z for grazing/fleeing
      const py = y - z * P.bodyPitch * 0.28;

      // 1. Rich multi-tuft fluffy wool coat (sculpted overlapping cloud puffs)
      const core = sdEllipsoid(x, py, z, 0, 0.02 + by, -0.02, 0.29, 0.25, 0.37);

      // Dorsal back tufts (withers, mid-back, loin)
      const backF = sdEllipsoid(x, py, z, 0, 0.18 + by, 0.18, 0.21, 0.16, 0.18);
      const backM = sdEllipsoid(x, py, z, 0, 0.20 + by, -0.03, 0.22, 0.17, 0.19);
      const backR = sdEllipsoid(x, py, z, 0, 0.17 + by, -0.24, 0.21, 0.16, 0.18);

      // Chest bib & neck ruff puffs
      const chestBib = sdEllipsoid(x, py, z, 0, 0.02 + by, 0.30, 0.23, 0.20, 0.18);
      const neckRuff = sdEllipsoid(x, py, z, hx * 0.35, 0.14 + by + P.headDip * 0.35, 0.33 + P.headFwd * 0.35, 0.19, 0.17, 0.15);

      // Left & right flank puffs (upper & lower, fore & aft)
      const flankFL = sdEllipsoid(x, py, z, -0.20, 0.07 + by, 0.16, 0.17, 0.17, 0.18);
      const flankFR = sdEllipsoid(x, py, z,  0.20, 0.07 + by, 0.16, 0.17, 0.17, 0.18);
      const flankML = sdEllipsoid(x, py, z, -0.22, 0.03 + by, -0.05, 0.18, 0.18, 0.20);
      const flankMR = sdEllipsoid(x, py, z,  0.22, 0.03 + by, -0.05, 0.18, 0.18, 0.20);
      const flankRL = sdEllipsoid(x, py, z, -0.19, 0.05 + by, -0.25, 0.17, 0.17, 0.18);
      const flankRR = sdEllipsoid(x, py, z,  0.19, 0.05 + by, -0.25, 0.17, 0.17, 0.18);

      // Rump & underbelly puffs
      const rump = sdEllipsoid(x, py, z, 0, 0.04 + by, -0.34, 0.24, 0.21, 0.18);
      const bellyF = sdEllipsoid(x, py, z, 0, -0.10 + by, 0.10, 0.22, 0.14, 0.20);
      const bellyR = sdEllipsoid(x, py, z, 0, -0.10 + by, -0.15, 0.22, 0.14, 0.20);

      // Cute fluffy bob-tail
      const tailY = 0.01 + by + P.tailLift;
      const tail1 = sdEllipsoid(x, py, z, 0, tailY, -0.49, 0.095, 0.105, 0.105);
      const tail2 = sdEllipsoid(x, py, z, 0, tailY - 0.06, -0.53, 0.072, 0.078, 0.072);
      const tail = smin(tail1, tail2, 0.03);

      let wool = smin(core, backF, 0.06);
      wool = smin(wool, backM, 0.06);
      wool = smin(wool, backR, 0.06);
      wool = smin(wool, chestBib, 0.06);
      wool = smin(wool, neckRuff, 0.05);
      wool = smin(wool, Math.min(flankFL, flankFR), 0.055);
      wool = smin(wool, Math.min(flankML, flankMR), 0.055);
      wool = smin(wool, Math.min(flankRL, flankRR), 0.055);
      wool = smin(wool, rump, 0.06);
      wool = smin(wool, Math.min(bellyF, bellyR), 0.05);
      wool = smin(wool, tail, 0.035);

      // 2. Sculpted dark charcoal head in local pitched head space
      const dx = x - hx;
      const dy = y - hPivotY;
      const dz = z - hPivotZ;
      const lx = dx;
      const ly = dy * cosP + dz * sinP;
      const lz = -dy * sinP + dz * cosP;

      const cranium = sdEllipsoid(lx, ly, lz, 0, 0.01, 0.01, 0.125, 0.115, 0.145);
      const bridge = sdCapsule(lx, ly, lz, 0, 0.015, 0.06, 0, -0.025, 0.23, 0.088, 0.058);
      const muzzle = sdEllipsoid(lx, ly, lz, 0, -0.032, 0.235, 0.066, 0.054, 0.064);
      const chin = sdEllipsoid(lx, ly, lz, 0, -0.072, 0.18, 0.052, 0.036, 0.065);

      // Fluffy forehead crown tuft (3 overlapping little wool curls on top of head)
      const crownC = sdEllipsoid(lx, ly, lz, 0, 0.115, 0.005, 0.105, 0.075, 0.105);
      const crownL = sdEllipsoid(lx, ly, lz, -0.065, 0.102, 0.03, 0.068, 0.056, 0.072);
      const crownR = sdEllipsoid(lx, ly, lz,  0.065, 0.102, 0.03, 0.068, 0.056, 0.072);
      const crownTuft = smin(crownC, Math.min(crownL, crownR), 0.03);
      wool = Math.min(wool, crownTuft);

      // Drooping side ears (outer charcoal + subtle inner ear recess)
      const earTipY = -0.045 - P.earDroop;
      const earL = sdCapsule(lx, ly, lz, -0.105, 0.042, -0.015, -0.245, earTipY, -0.055, 0.046, 0.024);
      const earR = sdCapsule(lx, ly, lz,  0.105, 0.042, -0.015,  0.245, earTipY, -0.055, 0.046, 0.024);
      const ears = Math.min(earL, earR);

      const earInL = sdCapsule(lx, ly, lz, -0.115, 0.034, 0.004, -0.215, earTipY + 0.006, -0.028, 0.026, 0.012);
      const earInR = sdCapsule(lx, ly, lz,  0.115, 0.034, 0.004,  0.215, earTipY + 0.006, -0.028, 0.026, 0.012);
      const earInner = Math.min(earInL, earInR);

      let dark = smin(cranium, bridge, 0.04);
      dark = smin(dark, muzzle, 0.03);
      dark = smin(dark, chin, 0.025);
      dark = smin(dark, ears, 0.02);

      // Expressive dark eyes with white glint + sculpted nostrils
      const eyeL = sdEllipsoid(lx, ly, lz, -0.090, 0.032, 0.095, 0.032, 0.030, 0.030);
      const eyeR = sdEllipsoid(lx, ly, lz,  0.090, 0.032, 0.095, 0.032, 0.030, 0.030);
      const eyes = Math.min(eyeL, eyeR);

      const glintL = sdEllipsoid(lx, ly, lz, -0.100, 0.044, 0.116, 0.013, 0.013, 0.013);
      const glintR = sdEllipsoid(lx, ly, lz,  0.100, 0.044, 0.116, 0.013, 0.013, 0.013);
      const glints = Math.min(glintL, glintR);

      const nosL = sdEllipsoid(lx, ly, lz, -0.026, -0.024, 0.292, 0.015, 0.013, 0.014);
      const nosR = sdEllipsoid(lx, ly, lz,  0.026, -0.024, 0.292, 0.015, 0.013, 0.014);
      const nostrils = Math.min(nosL, nosR);

      // 3. Slender jointed 2-segment legs with distinct dark hooves
      const frontLeg = (sx: number, swing: number, lift: number) => {
        const topY = -0.12 + by;
        const topZ = 0.19;
        const kneeY = -0.32 + by * 0.4 + lift * 0.45;
        const kneeZ = 0.20 + swing * 0.55;
        const footY = -0.52 + lift;
        const footZ = 0.21 + swing;
        const upper = sdCapsule(x, y, z, sx, topY, topZ, sx, kneeY, kneeZ, 0.056, 0.042);
        const lower = sdCapsule(x, y, z, sx, kneeY, kneeZ, sx, footY, footZ, 0.040, 0.034);
        const hoof = sdEllipsoid(x, y, z, sx, footY - 0.018, footZ + 0.016, 0.038, 0.030, 0.048);
        return { leg: smin(upper, lower, 0.02), hoof };
      };

      const hindLeg = (sx: number, swing: number, lift: number) => {
        const topY = -0.12 + by;
        const topZ = -0.21;
        const hockY = -0.32 + by * 0.4 + lift * 0.45;
        const hockZ = -0.27 + swing * 0.50;
        const footY = -0.52 + lift;
        const footZ = -0.22 + swing;
        const upper = sdCapsule(x, y, z, sx, topY, topZ, sx, hockY, hockZ, 0.062, 0.042);
        const lower = sdCapsule(x, y, z, sx, hockY, hockZ, sx, footY, footZ, 0.040, 0.034);
        const hoof = sdEllipsoid(x, y, z, sx, footY - 0.018, footZ + 0.016, 0.038, 0.030, 0.048);
        return { leg: smin(upper, lower, 0.02), hoof };
      };

      const fl = frontLeg(-0.145, P.fl, P.flLift);
      const fr = frontLeg( 0.145, P.fr, P.frLift);
      const bl = hindLeg(-0.155, P.bl, P.blLift);
      const br = hindLeg( 0.155, P.br, P.brLift);

      const legs = Math.min(Math.min(fl.leg, fr.leg), Math.min(bl.leg, br.leg));
      const hooves = Math.min(Math.min(fl.hoof, fr.hoof), Math.min(bl.hoof, br.hoof));
      dark = Math.min(dark, legs);

      let d = wool, mat = 'wool';
      if (dark < d) { d = dark; mat = 'dark'; }
      if (earInner < d) { d = earInner; mat = 'earInner'; }
      if (hooves < d) { d = hooves; mat = 'hoof'; }
      if (eyes < d) { d = eyes; mat = 'eye'; }
      if (glints < d) { d = glints; mat = 'glint'; }
      if (nostrils < d) { d = nostrils; mat = 'nostril'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'glint') return 'W';
      if (mat === 'eye') return 'e0';
      if (mat === 'nostril' || mat === 'hoof') return 'k';
      if (mat === 'earInner') return shade > 0.45 ? 'ep' : 'f1';
      if (mat === 'dark') {
        return shade > 0.78 ? 'f3' : shade > 0.52 ? 'f2' : shade > 0.28 ? 'f1' : 'f0';
      }
      // Subtle multi-frequency wool-tuft curl variation + warm 5-tone ramp
      const curl =
        Math.sin(x * 19 + z * 11) * Math.cos(y * 19 - z * 15) * 0.085 +
        Math.sin((x - y) * 31 + z * 23) * 0.035;
      const under = y < -0.06 + by ? -0.10 : 0;
      const s = shade + curl + under;
      return s > 0.80 ? 'W' : s > 0.60 ? 'w3' : s > 0.40 ? 'w2' : s > 0.22 ? 'w1' : 'w0';
    };

    pack = build27Pack(SHEEP_PW, SHEEP_PH, 0.96, 0.86, SHEEP_PAL, evalFn, shadeFn);
    sheepCache.set(pose, pack);
  }
  return pack;
}

export function getSheepPosePack(...args: Parameters<typeof buildSheepPosePack>): ReturnType<typeof buildSheepPosePack> {
  return registerAnimalSpritePack(buildSheepPosePack(...args), { module: './Sheep.ts', factory: 'getSheepPosePack', args }, buildSheepPosePack);
}

// ============================================================================
// INSTÂNCIA NA ARENA (Sheep)
// ============================================================================
const SHEEP_IDLE: readonly SheepPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const SHEEP_WALK: readonly SheepPoseName[] = ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'];
const SHEEP_GRAZE: readonly SheepPoseName[] = ['graze0', 'graze1', 'graze2', 'graze1', 'graze0'];
const SHEEP_FLEE: readonly SheepPoseName[] = ['flee0', 'flee1', 'flee2', 'flee3'];

function pickCycle<T>(frames: readonly T[], idx: number): T {
  return sampleAnimalCycle(frames, idx);
}

export class Sheep extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }

  private home = new THREE.Vector3();
  private state: 'idle' | 'graze' | 'walk' | 'flee' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.4, 2.8);
  private targetYaw = rand(0, Math.PI * 2);
  private gaitPhase = rand(0, Math.PI * 2);
  private hopCooldown = 0;

  private readonly centerY = 0.36;

  constructor(ctx: GameContext, startPos: THREE.Vector3) {
    super(ctx, getSheepPosePack('idle0').getView(2, 0)!, SHEEP_PW, SHEEP_PH, SHEEP_W, SHEEP_H, 'SheepBillboard');
    this.hp = 45;
    this.maxHp = 45;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.36;
    this.motor.height = 0.74;
    this.motor.teleport(startPos);
    this.home.copy(startPos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.44, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.set(this.position.x, this.position.y + this.centerY, this.position.z);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y + this.centerY * 0.6, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + this.centerY * 1.4, this.position.z);
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
    this.vel.x += hit.dir.x * 4.0;
    this.vel.z += hit.dir.z * 4.0;
    this.vel.y = 3.0;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.state = 'flee';
      this.stateT = 0;
      this.stateDur = 2.2;
    }
    return res;
  }

  update(dt: number, target: EnemyTarget | null, camera: THREE.Camera, drawingBufferSize?: THREE.Vector2) {
    if (dt > 0) {
      this.stateT += dt;
      this.hopCooldown = Math.max(0, this.hopCooldown - dt);
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
        if (dist < 3.8 && this.state !== 'flee') {
          this.state = 'flee';
          this.stateT = 0;
          this.stateDur = 2.1;
        }

        if (this.state === 'idle') {
          if (this.stateT >= this.stateDur) {
            this.state = Math.random() < 0.45 ? 'graze' : 'walk';
            this.stateT = 0;
            this.stateDur = rand(1.8, 3.2);
            const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
            this.targetYaw = toHome > 7.5
              ? Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.5, 0.5)
              : this.facing + rand(-1.6, 1.6);
          }
        } else if (this.state === 'graze') {
          if (this.stateT >= this.stateDur) {
            this.state = 'walk';
            this.stateT = 0;
            this.stateDur = rand(1.6, 2.8);
          }
        } else if (this.state === 'walk') {
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 6);
          speed = 1.85;
          if (this.stateT >= this.stateDur && this.motor.grounded) {
            this.state = Math.random() < 0.48 ? 'graze' : 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.5, 2.6);
          }
        } else if (this.state === 'flee') {
          if (target && target.alive) {
            this.targetYaw = Math.atan2(this.position.x - target.position.x, this.position.z - target.position.z);
            this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 9);
            speed = 4.6;
            if (this.motor.grounded && this.hopCooldown <= 0) {
              this.vel.y = 4.0;
              this.hopCooldown = 0.78;
            }
          }
          if (this.stateT >= this.stateDur && dist > 5.2 && this.motor.grounded) {
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.2, 2.2);
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
          this.gaitPhase += dt * 5.8 * (0.65 + horiz * 0.22);
        }
      }
      this.syncHurtbox();
    }

    const horiz = Math.hypot(this.vel.x, this.vel.z);
    const bob = this.alive && this.motor.grounded && horiz > 0.25
      ? Math.abs(Math.sin(this.gaitPhase)) * 0.032
      : 0;

    let pose: SheepPoseName;
    if (!this.alive) {
      pose = 'idle0';
    } else if (this.state === 'graze') {
      pose = pickCycle(SHEEP_GRAZE, this.stateT * 2.2);
    } else if (this.state === 'flee') {
      pose = pickCycle(SHEEP_FLEE, (this.gaitPhase / Math.PI) * 2.4);
    } else if (this.state === 'walk') {
      pose = pickCycle(SHEEP_WALK, (this.gaitPhase / Math.PI) * 2.6);
    } else {
      pose = pickCycle(SHEEP_IDLE, this.stateT * 2.0);
    }

    const deathSink = this.alive ? 0 : Math.min(0.20, this.deadT * 0.4);
    this.renderBillboard(getSheepPosePack(pose), this.position.y + this.centerY + bob - deathSink, camera, drawingBufferSize);
  }
}
