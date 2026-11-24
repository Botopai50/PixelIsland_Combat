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
// BISÃO AMERICANO (American Plains Bison) — 74×58 @ ANIMAL_PPU
// ============================================================================
export type BisonPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'walk0' | 'walk1' | 'walk2' | 'walk3' | 'walk4' | 'walk5'
  | 'graze0' | 'graze1' | 'graze2'
  | 'charge0' | 'charge1' | 'charge2' | 'charge3';

export const BISON_PW = 74;
export const BISON_PH = 58;
export const BISON_W = BISON_PW / ANIMAL_PPU;
export const BISON_H = BISON_PH / ANIMAL_PPU;

const BISON_PAL: Record<string, [number, number, number]> = {
  k:  [0x16, 0x11, 0x0f], // 1px outline / hooves / nose / horn tips / pupils
  // Shaggy golden-brown / amber shoulder cape & hump wool
  c0: [0x54, 0x32, 0x1a], // cape deep umber shadow
  c1: [0x7c, 0x4c, 0x26], // cape warm bronze-brown
  c2: [0xa8, 0x6c, 0x36], // cape golden-amber wool
  c3: [0xd2, 0x94, 0x4e], // cape sun-bleached golden highlight
  // Leaner cinnamon-tan hindquarters coat
  b0: [0x46, 0x2a, 0x1a], // hindquarters shadow
  b1: [0x6a, 0x40, 0x28], // hindquarters mid cinnamon-brown
  b2: [0x8e, 0x5a, 0x3a], // hindquarters warm cinnamon-tan
  b3: [0xb0, 0x76, 0x50], // hindquarters highlight
  // Dark-chocolate forehead wool crown, beard, chaps & tail tuft
  d0: [0x22, 0x16, 0x12], // deep espresso wool shadow
  d1: [0x38, 0x24, 0x1c], // dark chocolate wool mid
  d2: [0x52, 0x36, 0x2a], // chocolate wool lit curls
  // Curved horns & wet nose
  h0: [0x3c, 0x36, 0x32], // horn dark slate base
  h1: [0x78, 0x6e, 0x62], // horn weathered bone-grey highlight
  w:  [0xff, 0xfc, 0xf6], // eye specular glint
};

interface BisonPose {
  bodyY: number;
  headY: number;
  headZ: number;
  headPitch: number; // negative = head lowered (grazing/charging)
  headSway: number;
  tailLift: number;
  tailWag: number;
  flSwing: number;
  flLift: number;
  frSwing: number;
  frLift: number;
  blSwing: number;
  blLift: number;
  brSwing: number;
  brLift: number;
}

const BISON_POSES: Record<BisonPoseName, BisonPose> = {
  // Powerful breathing & tail swish
  idle0: {
    bodyY: 0.0, headY: 0.0, headZ: 0.0, headPitch: -0.06, headSway: 0.0, tailLift: 0.0, tailWag: 0.0,
    flSwing: 0.0, flLift: 0.0, frSwing: 0.0, frLift: 0.0,
    blSwing: 0.0, blLift: 0.0, brSwing: 0.0, brLift: 0.0,
  },
  idle1: {
    bodyY: 0.015, headY: 0.014, headZ: 0.01, headPitch: -0.02, headSway: 0.02, tailLift: 0.03, tailWag: 0.07,
    flSwing: 0.0, flLift: 0.0, frSwing: 0.0, frLift: 0.0,
    blSwing: 0.0, blLift: 0.0, brSwing: 0.0, brLift: 0.0,
  },
  idle2: {
    bodyY: -0.012, headY: -0.014, headZ: 0.01, headPitch: -0.10, headSway: -0.02, tailLift: -0.02, tailWag: -0.07,
    flSwing: 0.0, flLift: 0.0, frSwing: 0.0, frLift: 0.0,
    blSwing: 0.0, blLift: 0.0, brSwing: 0.0, brLift: 0.0,
  },

  // 6-frame heavy plains march
  walk0: {
    bodyY: 0.012, headY: -0.015, headZ: 0.01, headPitch: -0.08, headSway: 0.015, tailLift: 0.04, tailWag: 0.06,
    flSwing: 0.16, flLift: 0.08, frSwing: -0.12, frLift: 0.0,
    blSwing: -0.14, blLift: 0.0, brSwing: 0.15, brLift: 0.07,
  },
  walk1: {
    bodyY: 0.024, headY: -0.005, headZ: 0.015, headPitch: -0.06, headSway: 0.0, tailLift: 0.05, tailWag: 0.03,
    flSwing: 0.08, flLift: 0.03, frSwing: -0.04, frLift: 0.05,
    blSwing: -0.06, blLift: 0.05, brSwing: 0.08, brLift: 0.02,
  },
  walk2: {
    bodyY: -0.012, headY: -0.022, headZ: 0.01, headPitch: -0.10, headSway: -0.015, tailLift: 0.02, tailWag: -0.03,
    flSwing: -0.04, flLift: 0.0, frSwing: 0.09, frLift: 0.08,
    blSwing: 0.07, blLift: 0.07, brSwing: -0.05, brLift: 0.0,
  },
  walk3: {
    bodyY: 0.012, headY: -0.015, headZ: 0.01, headPitch: -0.08, headSway: -0.015, tailLift: 0.04, tailWag: -0.06,
    flSwing: -0.12, flLift: 0.0, frSwing: 0.16, frLift: 0.08,
    blSwing: 0.15, blLift: 0.07, brSwing: -0.14, brLift: 0.0,
  },
  walk4: {
    bodyY: 0.024, headY: -0.005, headZ: 0.015, headPitch: -0.06, headSway: 0.0, tailLift: 0.05, tailWag: -0.03,
    flSwing: -0.04, flLift: 0.05, frSwing: 0.08, frLift: 0.03,
    blSwing: 0.08, blLift: 0.02, brSwing: -0.06, brLift: 0.05,
  },
  walk5: {
    bodyY: -0.012, headY: -0.022, headZ: 0.01, headPitch: -0.10, headSway: 0.015, tailLift: 0.02, tailWag: 0.03,
    flSwing: 0.09, flLift: 0.08, frSwing: -0.04, frLift: 0.0,
    blSwing: -0.05, blLift: 0.0, brSwing: 0.07, brLift: 0.07,
  },

  // 3-frame lowered head prairie grazing
  graze0: {
    bodyY: -0.015, headY: -0.12, headZ: 0.04, headPitch: -0.34, headSway: 0.0, tailLift: 0.02, tailWag: 0.05,
    flSwing: 0.06, flLift: 0.0, frSwing: -0.03, frLift: 0.0,
    blSwing: 0.0, blLift: 0.0, brSwing: 0.0, brLift: 0.0,
  },
  graze1: {
    bodyY: -0.024, headY: -0.20, headZ: 0.06, headPitch: -0.52, headSway: -0.04, tailLift: 0.04, tailWag: 0.09,
    flSwing: 0.08, flLift: 0.0, frSwing: -0.04, frLift: 0.0,
    blSwing: 0.0, blLift: 0.0, brSwing: 0.0, brLift: 0.0,
  },
  graze2: {
    bodyY: -0.022, headY: -0.19, headZ: 0.07, headPitch: -0.48, headSway: 0.04, tailLift: 0.03, tailWag: -0.09,
    flSwing: 0.08, flLift: 0.0, frSwing: -0.04, frLift: 0.0,
    blSwing: 0.0, blLift: 0.0, brSwing: 0.0, brLift: 0.0,
  },

  // 4-frame thunderous stampede charge (head dropped low, tail raised, legs driving)
  charge0: {
    bodyY: -0.025, headY: -0.11, headZ: 0.06, headPitch: -0.38, headSway: 0.0, tailLift: 0.24, tailWag: 0.06,
    flSwing: -0.16, flLift: 0.10, frSwing: -0.22, frLift: 0.04,
    blSwing: 0.22, blLift: 0.14, brSwing: 0.15, brLift: 0.06,
  },
  charge1: {
    bodyY: 0.045, headY: -0.08, headZ: 0.08, headPitch: -0.32, headSway: 0.015, tailLift: 0.30, tailWag: 0.0,
    flSwing: 0.26, flLift: 0.18, frSwing: 0.18, frLift: 0.13,
    blSwing: -0.24, blLift: 0.16, brSwing: -0.16, brLift: 0.11,
  },
  charge2: {
    bodyY: 0.02, headY: -0.09, headZ: 0.07, headPitch: -0.35, headSway: -0.015, tailLift: 0.28, tailWag: -0.06,
    flSwing: 0.18, flLift: 0.06, frSwing: 0.26, frLift: 0.16,
    blSwing: -0.15, blLift: 0.12, brSwing: -0.22, brLift: 0.16,
  },
  charge3: {
    bodyY: -0.028, headY: -0.12, headZ: 0.05, headPitch: -0.40, headSway: 0.0, tailLift: 0.22, tailWag: 0.02,
    flSwing: -0.20, flLift: 0.12, frSwing: -0.08, frLift: 0.04,
    blSwing: 0.18, blLift: 0.06, brSwing: 0.24, brLift: 0.12,
  },
};

const bisonCache = new Map<BisonPoseName, Boar27Pack>();

 function buildBisonPosePack(pose: BisonPoseName): Boar27Pack {
  let pack = bisonCache.get(pose);
  if (!pack) {
    const P = BISON_POSES[pose];
    const by = P.bodyY;
    const hPivotX = P.headSway;
    const hPivotY = 0.02 + P.headY + by;
    const hPivotZ = 0.44 + P.headZ;
    const cosP = Math.cos(P.headPitch);
    const sinP = Math.sin(P.headPitch);

    const evalFn: SdfEvaluator = (x, y, z) => {
      // 1. Towering woolly shoulder hump & thick shaggy golden-brown shoulder cape
      const humpPeak = sdEllipsoid(x, y, z, 0, 0.25 + by, 0.18, 0.25, 0.24, 0.25);
      const shoulderCape = sdEllipsoid(x, y, z, 0, 0.08 + by, 0.17, 0.30, 0.27, 0.27);
      const capeL = sdEllipsoid(x, y, z, -0.18, 0.04 + by, 0.18, 0.16, 0.23, 0.23);
      const capeR = sdEllipsoid(x, y, z,  0.18, 0.04 + by, 0.18, 0.16, 0.23, 0.23);
      const dewlap = sdCapsule(x, y, z, 0, -0.06 + by, 0.32, hPivotX * 0.5, hPivotY - 0.12, hPivotZ - 0.05, 0.19, 0.15);

      let cape = smin(humpPeak, shoulderCape, 0.09);
      cape = smin(cape, Math.min(capeL, capeR), 0.07);
      cape = smin(cape, dewlap, 0.08);

      // 2. Contrasting leaner, shorter-furred cinnamon-tan hindquarters & waist
      const midRibs = sdEllipsoid(x, y, z, 0, 0.05 + by, -0.08, 0.235, 0.215, 0.25);
      const rump = sdEllipsoid(x, y, z, 0, 0.06 + by, -0.32, 0.21, 0.195, 0.22);
      const hipL = sdEllipsoid(x, y, z, -0.13, 0.02 + by, -0.31, 0.115, 0.155, 0.16);
      const hipR = sdEllipsoid(x, y, z,  0.13, 0.02 + by, -0.31, 0.115, 0.155, 0.16);

      let body = smin(midRibs, rump, 0.08);
      body = smin(body, Math.min(hipL, hipR), 0.05);

      // Short tufted tail (raises during stampede charge!)
      const tw = P.tailWag;
      const tl = P.tailLift;
      const tailStem = sdCapsule(x, y, z, 0, 0.10 + by, -0.50, tw * 0.5, -0.06 + tl * 0.55 + by, -0.60 - tl * 0.15, 0.030, 0.022);
      const tailTuft = sdEllipsoid(x, y, z, tw * 0.6, -0.10 + tl * 0.60 + by, -0.62 - tl * 0.18, 0.046, 0.058, 0.044);
      body = smin(body, tailStem, 0.02);

      // 3. Massive low-slung head in local pitched space
      const lx = x - hPivotX;
      const dy = y - hPivotY;
      const dz = z - hPivotZ;
      const lz = dz * cosP + dy * sinP;
      const ly = -dz * sinP + dy * cosP;

      // Huge fluffy dark-chocolate afro-like forehead wool crown & long shaggy chin beard
      const woolCrown = sdEllipsoid(lx, ly, lz, 0, 0.145, 0.07, 0.20, 0.155, 0.165);
      const crownPuffL = sdEllipsoid(lx, ly, lz, -0.11, 0.13, 0.08, 0.115, 0.125, 0.125);
      const crownPuffR = sdEllipsoid(lx, ly, lz,  0.11, 0.13, 0.08, 0.115, 0.125, 0.125);
      const cheekWoolL = sdEllipsoid(lx, ly, lz, -0.135, 0.0, 0.05, 0.095, 0.115, 0.115);
      const cheekWoolR = sdEllipsoid(lx, ly, lz,  0.135, 0.0, 0.05, 0.095, 0.115, 0.115);
      const beard = sdCapsule(lx, ly, lz, 0, -0.07, 0.12, 0, -0.25, 0.08, 0.082, 0.036);

      let darkWool = smin(woolCrown, Math.min(crownPuffL, crownPuffR), 0.05);
      darkWool = smin(darkWool, Math.min(cheekWoolL, cheekWoolR), 0.045);
      darkWool = smin(darkWool, beard, 0.04);
      darkWool = Math.min(darkWool, tailTuft);

      // Broad bison skull & snout bridge + dark wet muzzle
      const skull = sdEllipsoid(lx, ly, lz, 0, 0.01, 0.09, 0.155, 0.135, 0.165);
      const snout = sdCapsule(lx, ly, lz, 0, -0.02, 0.14, 0, -0.055, 0.28, 0.115, 0.088);
      const headFace = smin(skull, snout, 0.045);
      darkWool = smin(darkWool, headFace, 0.04);

      const wetNose = sdEllipsoid(lx, ly, lz, 0, -0.055, 0.315, 0.088, 0.064, 0.052);

      // Short upward-curving horns emerging from the sides of the wool crown
      const hornBaseL = sdCapsule(lx, ly, lz, -0.15, 0.10, 0.04, -0.255, 0.12, 0.05, 0.044, 0.032);
      const hornTipL  = sdCapsule(lx, ly, lz, -0.255, 0.12, 0.05, -0.235, 0.225, 0.07, 0.032, 0.015);
      const hornBaseR = sdCapsule(lx, ly, lz,  0.15, 0.10, 0.04,  0.255, 0.12, 0.05, 0.044, 0.032);
      const hornTipR  = sdCapsule(lx, ly, lz,  0.255, 0.12, 0.05,  0.235, 0.225, 0.07, 0.032, 0.015);
      const horns = Math.min(smin(hornBaseL, hornTipL, 0.018), smin(hornBaseR, hornTipR, 0.018));

      // 4. Four jointed legs: woolly foreleg chaps ("pantaloons") + slender lower legs + cloven hooves
      let hooves = 999;
      const frontLeg = (sx: number, swing: number, lift: number) => {
        const shY = -0.05 + by, shZ = 0.20;
        const knY = -0.25 + by * 0.4 + lift * 0.14;
        const knZ = 0.20 + swing * 0.48;
        const hfY = -0.46 + lift * 0.24;
        const hfZ = 0.20 + swing * 0.96;

        // Shaggy woolly foreleg chap ("pantaloon")
        const chap = sdCapsule(x, y, z, sx, shY, shZ, sx, knY - 0.02, knZ, 0.108, 0.082);
        darkWool = smin(darkWool, chap, 0.035);

        const lower = sdCapsule(x, y, z, sx, knY, knZ, sx, hfY + 0.03, hfZ, 0.048, 0.040);
        const hoof = sdEllipsoid(x, y, z, sx, hfY, hfZ + 0.015, 0.048, 0.038, 0.052);
        hooves = Math.min(hooves, hoof);
        return lower;
      };

      const hindLeg = (sx: number, swing: number, lift: number) => {
        const hpY = -0.04 + by, hpZ = -0.32;
        const hkY = -0.25 + by * 0.4 + lift * 0.14;
        const hkZ = -0.35 + swing * 0.48;
        const hfY = -0.46 + lift * 0.24;
        const hfZ = -0.32 + swing * 0.96;

        const upper = sdCapsule(x, y, z, sx, hpY, hpZ, sx, hkY, hkZ, 0.085, 0.056);
        const lower = sdCapsule(x, y, z, sx, hkY, hkZ, sx, hfY + 0.03, hfZ, 0.048, 0.040);
        const hoof = sdEllipsoid(x, y, z, sx, hfY, hfZ + 0.015, 0.048, 0.038, 0.052);
        hooves = Math.min(hooves, hoof);
        return smin(upper, lower, 0.025);
      };

      const fl = frontLeg(-0.155, P.flSwing, P.flLift);
      const fr = frontLeg( 0.155, P.frSwing, P.frLift);
      const bl = hindLeg(-0.145, P.blSwing, P.blLift);
      const br = hindLeg( 0.145, P.brSwing, P.brLift);
      body = smin(body, Math.min(Math.min(fl, fr), Math.min(bl, br)), 0.035);

      // Blend shoulder cape smoothly over mid-body
      const torsoBlend = smin(cape, body, 0.06);

      // 5. Intense dark eyes with white glint
      const eyeL = sdEllipsoid(lx, ly, lz, -0.142, 0.035, 0.155, 0.030, 0.030, 0.030);
      const eyeR = sdEllipsoid(lx, ly, lz,  0.142, 0.035, 0.155, 0.030, 0.030, 0.030);
      const eyes = Math.min(eyeL, eyeR);

      const glintL = sdEllipsoid(lx, ly, lz, -0.152, 0.046, 0.178, 0.012, 0.012, 0.012);
      const glintR = sdEllipsoid(lx, ly, lz,  0.152, 0.046, 0.178, 0.012, 0.012, 0.012);
      const glints = Math.min(glintL, glintR);

      let d = torsoBlend;
      let mat = cape < body + 0.02 ? 'cape' : 'body';
      if (darkWool < d) { d = darkWool; mat = 'darkWool'; }
      if (horns < d) { d = horns; mat = 'horn'; }
      if (wetNose < d) { d = wetNose; mat = 'nose'; }
      if (hooves < d) { d = hooves; mat = 'hoof'; }
      if (eyes < d) { d = eyes; mat = 'eye'; }
      if (glints < d) { d = glints; mat = 'glint'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'glint') return 'w';
      if (mat === 'eye' || mat === 'nose' || mat === 'hoof') return 'k';
      if (mat === 'horn') {
        if (Math.abs(x) > 0.22 && y > 0.16 + by) return 'k'; // dark horn tips
        return shade > 0.48 ? 'h1' : 'h0';
      }
      if (mat === 'darkWool') {
        const curl = Math.sin(x * 26 + z * 22) * Math.cos(y * 26) * 0.08;
        const s = shade + curl;
        return s > 0.62 ? 'd2' : s > 0.30 ? 'd1' : 'd0';
      }
      if (mat === 'cape') {
        // Shaggy golden-brown / amber shoulder cape texture
        const shag = Math.sin(x * 20 + z * 18) * Math.cos(y * 22 - z * 16) * 0.09;
        const s = shade + shag + (y > 0.18 + by ? 0.07 : 0);
        return s > 0.76 ? 'c3' : s > 0.52 ? 'c2' : s > 0.26 ? 'c1' : 'c0';
      }
      // Shorter-furred cinnamon-tan hindquarters
      return shade > 0.74 ? 'b3' : shade > 0.48 ? 'b2' : shade > 0.24 ? 'b1' : 'b0';
    };

    pack = build27Pack(BISON_PW, BISON_PH, 1.12, 0.90, BISON_PAL, evalFn, shadeFn);
    bisonCache.set(pose, pack);
  }
  return pack;
}

export function getBisonPosePack(...args: Parameters<typeof buildBisonPosePack>): ReturnType<typeof buildBisonPosePack> {
  return registerAnimalSpritePack(buildBisonPosePack(...args), { module: './Bison.ts', factory: 'getBisonPosePack', args }, buildBisonPosePack);
}

function pickCycle<T>(frames: readonly T[], idx: number): T {
  return sampleAnimalCycle(frames, idx);
}

const BISON_IDLE: readonly BisonPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const BISON_WALK: readonly BisonPoseName[] = ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'];
const BISON_GRAZE: readonly BisonPoseName[] = ['graze0', 'graze1', 'graze2', 'graze1'];
const BISON_CHARGE: readonly BisonPoseName[] = ['charge0', 'charge1', 'charge2', 'charge3'];

export class Bison extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private readonly home = new THREE.Vector3();
  private state: 'idle' | 'graze' | 'walk' | 'charge' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.6, 3.2);
  private targetYaw = rand(0, Math.PI * 2);
  private gaitPhase = rand(0, Math.PI * 2);
  private provokedT = 0;

  private static readonly RADIUS = 0.52;
  private static readonly HEIGHT = 0.98;
  private static readonly CENTER_Y = 0.46;

  constructor(ctx: GameContext, startPos: THREE.Vector3) {
    super(
      ctx,
      getBisonPosePack('idle0').getView(2, 0)!,
      BISON_PW,
      BISON_PH,
      BISON_W,
      BISON_H,
      'BisonBillboard',
    );
    this.hp = 150;
    this.maxHp = 150;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = Bison.RADIUS;
    this.motor.height = Bison.HEIGHT;
    this.motor.teleport(startPos);
    this.home.copy(startPos);
    this.hurtboxes.push({
      a: new THREE.Vector3(),
      b: new THREE.Vector3(),
      radius: Bison.RADIUS + 0.12,
      tag: 'body',
      enabled: true,
    });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.set(this.position.x, this.position.y + Bison.CENTER_Y, this.position.z);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y + Bison.CENTER_Y * 0.55, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + Bison.CENTER_Y * 1.45, this.position.z);
    this.hurtboxes[0].enabled = this.alive;
    this.stickRoot.position.set(this.position.x, this.position.y + Bison.CENTER_Y, this.position.z);
    this.stickRoot.rotation.y = this.facing;
  }

  receiveHit(hit: HitInfo): HitResult {
    const res = emptyResult('flesh');
    if (!this.alive) { res.ignored = true; return res; }
    this.hp = Math.max(0, this.hp - hit.damage);
    res.damage = hit.damage;
    this.flash = 1.0;
    this.vel.x += hit.dir.x * 2.4;
    this.vel.z += hit.dir.z * 2.4;
    this.vel.y = 2.0;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.provokedT = 5.5;
      this.state = 'charge';
      this.stateT = 0;
      this.stateDur = 3.0;
    }
    return res;
  }

  update(dt: number, target: EnemyTarget | null, camera: THREE.Camera, drawingBufferSize?: THREE.Vector2) {
    if (dt > 0) {
      this.stateT += dt;
      this.provokedT = Math.max(0, this.provokedT - dt);
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
        if (dist < 3.4 && this.state !== 'charge') {
          this.state = 'charge';
          this.stateT = 0;
          this.stateDur = 2.6;
        }

        if (this.state === 'idle') {
          if (this.stateT >= this.stateDur) {
            this.state = Math.random() < 0.45 ? 'graze' : 'walk';
            this.stateT = 0;
            this.stateDur = rand(1.8, 3.4);
            const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
            this.targetYaw = toHome > 8.0
              ? Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.5, 0.5)
              : this.facing + rand(-1.6, 1.6);
          }
        } else if (this.state === 'graze') {
          if (this.stateT >= this.stateDur) {
            this.state = 'walk';
            this.stateT = 0;
            this.stateDur = rand(1.8, 3.2);
          }
        } else if (this.state === 'walk') {
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 4.2);
          speed = 1.65;
          if (this.stateT >= this.stateDur && this.motor.grounded) {
            this.state = Math.random() < 0.48 ? 'graze' : 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.6, 3.0);
          }
        } else if (this.state === 'charge') {
          if (target && target.alive) {
            this.targetYaw = Math.atan2(target.position.x - this.position.x, target.position.z - this.position.z);
            this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 6.5);
            speed = dist > 1.3 ? 4.8 : 1.5;
          }
          if (this.stateT >= this.stateDur && (dist > 5.2 || this.provokedT <= 0)) {
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.4, 2.4);
          }
        }

        this.vel.x = damp(this.vel.x, Math.sin(this.facing) * speed, 8.0, dt);
        this.vel.z = damp(this.vel.z, Math.cos(this.facing) * speed, 8.0, dt);
        this.vel.y -= 20 * dt;
        this.motor.update(dt);

        const targetPitch = !this.motor.grounded ? Math.max(-0.22, Math.min(0.22, this.vel.y * 0.04)) : 0;
        this.bodyPitch = damp(this.bodyPitch, targetPitch, 8, dt);

        const horiz = Math.hypot(this.vel.x, this.vel.z);
        if (horiz > 0.22 && this.motor.grounded) {
          this.gaitPhase += dt * 5.2 * (0.62 + horiz * 0.22);
        }
      }
      this.syncHurtbox();
    }

    const horiz = Math.hypot(this.vel.x, this.vel.z);
    const bob = this.alive && this.motor.grounded && horiz > 0.22
      ? Math.abs(Math.sin(this.gaitPhase)) * 0.028
      : 0;

    let pose: BisonPoseName;
    if (!this.alive) {
      pose = 'idle0';
    } else if (this.state === 'graze') {
      pose = pickCycle(BISON_GRAZE, this.stateT * 2.5);
    } else if (this.state === 'charge') {
      pose = pickCycle(BISON_CHARGE, (this.gaitPhase / Math.PI) * 2.4);
    } else if (this.state === 'walk') {
      pose = pickCycle(BISON_WALK, (this.gaitPhase / Math.PI) * 2.5);
    } else {
      pose = pickCycle(BISON_IDLE, this.stateT * 2.0);
    }

    const deathSink = this.alive ? 0 : Math.min(0.24, this.deadT * 0.4);
    this.renderBillboard(getBisonPosePack(pose), this.position.y + Bison.CENTER_Y + bob - deathSink, camera, drawingBufferSize);
  }
}
