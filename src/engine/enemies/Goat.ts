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
// CABRA MONTANHA (Mountain Goat) — Flagship 52×46 @ ANIMAL_PPU
// ============================================================================
export type GoatPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'walk0' | 'walk1' | 'walk2' | 'walk3' | 'walk4' | 'walk5'
  | 'graze0' | 'graze1' | 'graze2'
  | 'charge0' | 'charge1' | 'charge2' | 'charge3';

export const GOAT_PW = 52;
export const GOAT_PH = 46;
export const GOAT_W = GOAT_PW / ANIMAL_PPU;
export const GOAT_H = GOAT_PH / ANIMAL_PPU;

/** Rich 5-tone ivory/warm-grey coat + slate/brown markings + ridged horn ramp. */
const GOAT_PAL: Record<string, [number, number, number]> = {
  k:  [0x17, 0x15, 0x18], // 1px outline / cloven hooves / nose / horizontal pupil
  w0: [0x7e, 0x76, 0x6b], // warm-grey deep shadow
  w1: [0xa6, 0x9e, 0x90], // warm-grey mid-shadow
  w2: [0xcf, 0xc8, 0xb9], // ivory-grey midtone
  w3: [0xeb, 0xe5, 0xd8], // bright ivory coat
  W:  [0xfc, 0xfa, 0xf2], // sunlit snow-ivory highlight / eye glint
  m0: [0x38, 0x31, 0x2d], // dark slate-brown dorsal / lower-leg / muzzle shadow
  m1: [0x59, 0x4f, 0x47], // slate-brown marking midtone
  m2: [0x7c, 0x6f, 0x63], // slate-brown marking highlight
  h0: [0x2e, 0x28, 0x24], // dark charcoal horn ridge groove
  h1: [0x5c, 0x4f, 0x42], // tan-charcoal horn mid
  h2: [0x8c, 0x7a, 0x65], // warm tan horn ridge highlight
  e:  [0xe8, 0xb8, 0x32], // rectangular amber goat iris
  p:  [0xc8, 0x94, 0x8e], // soft inner ear
};

interface GoatPose {
  bodyY: number;
  bodyPitch: number;
  headY: number;
  headZ: number;
  headSway: number;
  headPitch: number; // + pitches nose down (graze/charge), - tilts head up
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

const GOAT_POSES: Record<GoatPoseName, GoatPose> = {
  // Alert mountain stance with gentle breathing & head sway
  idle0: {
    bodyY: 0.0, bodyPitch: 0.0, headY: 0.0, headZ: 0.0, headSway: 0.0, headPitch: 0.0, tailLift: 0.0,
    fl: 0.0, fr: 0.0, bl: 0.0, br: 0.0, flLift: 0, frLift: 0, blLift: 0, brLift: 0,
  },
  idle1: {
    bodyY: 0.012, bodyPitch: 0.01, headY: 0.025, headZ: 0.01, headSway: 0.032, headPitch: -0.06, tailLift: 0.04,
    fl: 0.0, fr: 0.0, bl: 0.0, br: 0.0, flLift: 0, frLift: 0, blLift: 0, brLift: 0,
  },
  idle2: {
    bodyY: -0.010, bodyPitch: -0.01, headY: -0.018, headZ: 0.015, headSway: -0.032, headPitch: 0.05, tailLift: -0.02,
    fl: 0.0, fr: 0.0, bl: 0.0, br: 0.0, flLift: 0, frLift: 0, blLift: 0, brLift: 0,
  },

  // 6-frame athletic quadruped walk
  walk0: {
    bodyY: 0.014, bodyPitch: 0.01, headY: -0.01, headZ: 0.03, headSway: 0.01, headPitch: 0.03, tailLift: 0.03,
    fl: 0.18, fr: -0.14, bl: -0.16, br: 0.16, flLift: 0.10, frLift: 0.0, blLift: 0.0, brLift: 0.09,
  },
  walk1: {
    bodyY: 0.024, bodyPitch: 0.02, headY: -0.015, headZ: 0.04, headSway: 0.0, headPitch: 0.04, tailLift: 0.04,
    fl: 0.09, fr: -0.04, bl: -0.07, br: 0.08, flLift: 0.04, frLift: 0.07, blLift: 0.07, brLift: 0.04,
  },
  walk2: {
    bodyY: -0.006, bodyPitch: 0.0, headY: 0.0, headZ: 0.02, headSway: -0.01, headPitch: 0.01, tailLift: 0.02,
    fl: -0.04, fr: 0.09, bl: 0.07, br: -0.06, flLift: 0.0, frLift: 0.10, blLift: 0.09, brLift: 0.0,
  },
  walk3: {
    bodyY: 0.014, bodyPitch: 0.01, headY: -0.01, headZ: 0.03, headSway: -0.01, headPitch: 0.03, tailLift: 0.03,
    fl: -0.14, fr: 0.18, bl: 0.16, br: -0.16, flLift: 0.0, frLift: 0.10, blLift: 0.09, brLift: 0.0,
  },
  walk4: {
    bodyY: 0.024, bodyPitch: 0.02, headY: -0.015, headZ: 0.04, headSway: 0.0, headPitch: 0.04, tailLift: 0.04,
    fl: -0.04, fr: 0.09, bl: 0.08, br: -0.07, flLift: 0.07, frLift: 0.04, blLift: 0.04, brLift: 0.07,
  },
  walk5: {
    bodyY: -0.006, bodyPitch: 0.0, headY: 0.0, headZ: 0.02, headSway: 0.01, headPitch: 0.01, tailLift: 0.02,
    fl: 0.09, fr: -0.04, bl: -0.06, br: 0.07, flLift: 0.10, frLift: 0.0, blLift: 0.0, brLift: 0.09,
  },

  // 3-frame grazing cycle
  graze0: {
    bodyY: -0.012, bodyPitch: 0.07, headY: -0.26, headZ: 0.12, headSway: 0.0, headPitch: 0.42, tailLift: 0.04,
    fl: 0.06, fr: -0.03, bl: 0.0, br: 0.0, flLift: 0, frLift: 0, blLift: 0, brLift: 0,
  },
  graze1: {
    bodyY: -0.024, bodyPitch: 0.11, headY: -0.46, headZ: 0.20, headSway: -0.035, headPitch: 0.72, tailLift: 0.07,
    fl: 0.10, fr: -0.04, bl: 0.0, br: 0.0, flLift: 0, frLift: 0, blLift: 0, brLift: 0,
  },
  graze2: {
    bodyY: -0.022, bodyPitch: 0.10, headY: -0.43, headZ: 0.22, headSway: 0.04, headPitch: 0.68, tailLift: 0.09,
    fl: 0.10, fr: -0.04, bl: 0.0, br: 0.0, flLift: 0, frLift: 0, blLift: 0, brLift: 0,
  },

  // 4-frame headbutt charge with lowered horns aimed forward!
  charge0: {
    bodyY: -0.05, bodyPitch: 0.12, headY: -0.20, headZ: 0.10, headSway: 0.0, headPitch: 0.78, tailLift: 0.14,
    fl: 0.22, fr: -0.18, bl: -0.24, br: 0.18, flLift: 0.14, frLift: 0.0, blLift: 0.0, brLift: 0.12,
  },
  charge1: {
    bodyY: 0.04, bodyPitch: 0.06, headY: -0.22, headZ: 0.14, headSway: 0.0, headPitch: 0.86, tailLift: 0.18,
    fl: 0.30, fr: 0.20, bl: -0.28, br: -0.18, flLift: 0.22, frLift: 0.16, blLift: 0.16, brLift: 0.10,
  },
  charge2: {
    bodyY: 0.01, bodyPitch: 0.10, headY: -0.24, headZ: 0.16, headSway: 0.0, headPitch: 0.92, tailLift: 0.16,
    fl: -0.20, fr: -0.12, bl: 0.24, br: 0.16, flLift: 0.04, frLift: 0.10, blLift: 0.16, brLift: 0.10,
  },
  charge3: {
    bodyY: -0.03, bodyPitch: 0.08, headY: -0.18, headZ: 0.12, headSway: 0.0, headPitch: 0.74, tailLift: 0.12,
    fl: -0.06, fr: 0.06, bl: 0.10, br: -0.04, flLift: 0.0, frLift: 0.04, blLift: 0.04, brLift: 0.0,
  },
};

const goatCache = new Map<GoatPoseName, Boar27Pack>();

 function buildGoatPosePack(pose: GoatPoseName): Boar27Pack {
  let pack = goatCache.get(pose);
  if (!pack) {
    const P = GOAT_POSES[pose];
    const by = P.bodyY;
    const hPivotY = 0.29 + P.headY + by;
    const hPivotZ = 0.44 + P.headZ;
    const hx = P.headSway;
    const cosP = Math.cos(P.headPitch);
    const sinP = Math.sin(P.headPitch);

    const evalFn: SdfEvaluator = (x, y, z) => {
      const py = y - z * P.bodyPitch * 0.24;

      // 1. Athletic mountain-goat torso: defined withers, slim barrel, angular rump, shaggy chest/belly tufts
      const chest = sdEllipsoid(x, py, z, 0, 0.03 + by, 0.20, 0.21, 0.21, 0.25);
      const withers = sdEllipsoid(x, py, z, 0, 0.17 + by, 0.17, 0.155, 0.135, 0.19);
      const barrel = sdEllipsoid(x, py, z, 0, 0.05 + by, -0.06, 0.185, 0.185, 0.28);
      const rump = sdEllipsoid(x, py, z, 0, 0.06 + by, -0.31, 0.195, 0.185, 0.20);

      // Tufted shaggy chest & belly fur
      const chestTuft = sdEllipsoid(x, py, z, 0, -0.06 + by, 0.29, 0.17, 0.145, 0.15);
      const bellyTuft1 = sdEllipsoid(x, py, z, 0, -0.10 + by, 0.06, 0.16, 0.11, 0.16);
      const bellyTuft2 = sdEllipsoid(x, py, z, 0, -0.09 + by, -0.14, 0.155, 0.105, 0.15);

      // Strong upright mountain-goat neck
      const neck = sdCapsule(x, y, z, 0, 0.11 + by, 0.27, hx * 0.6, hPivotY - 0.03, hPivotZ - 0.05, 0.14, 0.105);

      // Short upturned goat tail
      const tail = sdCapsule(x, py, z, 0, 0.10 + by, -0.45, 0, 0.21 + by + P.tailLift, -0.57, 0.055, 0.028);

      let coat = smin(chest, withers, 0.07);
      coat = smin(coat, barrel, 0.09);
      coat = smin(coat, rump, 0.09);
      coat = smin(coat, chestTuft, 0.06);
      coat = smin(coat, Math.min(bellyTuft1, bellyTuft2), 0.05);
      coat = smin(coat, neck, 0.07);
      coat = smin(coat, tail, 0.035);

      // 2. Expressive head in local pitched space
      const dx = x - hx;
      const dy = y - hPivotY;
      const dz = z - hPivotZ;
      const lx = dx;
      const ly = dy * cosP + dz * sinP;
      const lz = -dy * sinP + dz * cosP;

      const skull = sdEllipsoid(lx, ly, lz, 0, 0.02, 0.01, 0.118, 0.112, 0.145);
      const snout = sdCapsule(lx, ly, lz, 0, 0.005, 0.07, 0, -0.038, 0.27, 0.082, 0.048);
      const muzzleTip = sdEllipsoid(lx, ly, lz, 0, -0.044, 0.275, 0.054, 0.046, 0.052);

      // Distinct tufted chin beard!
      const beard1 = sdCapsule(lx, ly, lz, 0, -0.075, 0.17, 0, -0.185, 0.19, 0.048, 0.024);
      const beard2 = sdCapsule(lx, ly, lz, 0, -0.13, 0.18, 0, -0.23, 0.20, 0.032, 0.012);
      const beard = smin(beard1, beard2, 0.02);

      // Pointed horizontal ears
      const earL = sdCapsule(lx, ly, lz, -0.095, 0.055, -0.02, -0.245, 0.068, -0.065, 0.042, 0.016);
      const earR = sdCapsule(lx, ly, lz,  0.095, 0.055, -0.02,  0.245, 0.068, -0.065, 0.042, 0.016);
      const ears = Math.min(earL, earR);

      const earInL = sdCapsule(lx, ly, lz, -0.105, 0.052, 0.002, -0.215, 0.062, -0.038, 0.022, 0.009);
      const earInR = sdCapsule(lx, ly, lz,  0.105, 0.052, 0.002,  0.215, 0.062, -0.038, 0.022, 0.009);
      const earInner = Math.min(earInL, earInR);

      let headD = smin(skull, snout, 0.04);
      headD = smin(headD, muzzleTip, 0.025);
      headD = smin(headD, beard, 0.025);
      headD = smin(headD, ears, 0.02);
      coat = smin(coat, headD, 0.05);

      // Prominent swept-back curved ridged horns (3-segment arc on each side)
      const hornSide = (s: number) => {
        const h1 = sdCapsule(lx, ly, lz, s * 0.048, 0.105, -0.01, s * 0.095, 0.245, -0.095, 0.040, 0.032);
        const h2 = sdCapsule(lx, ly, lz, s * 0.095, 0.245, -0.095, s * 0.135, 0.315, -0.235, 0.032, 0.022);
        const h3 = sdCapsule(lx, ly, lz, s * 0.135, 0.315, -0.235, s * 0.155, 0.275, -0.355, 0.022, 0.010);
        return smin(smin(h1, h2, 0.015), h3, 0.015);
      };
      const horns = Math.min(hornSide(-1), hornSide(1));

      // Rectangular amber goat eyes + dark horizontal pupil + glint + dark nose
      const eyeL = sdEllipsoid(lx, ly, lz, -0.086, 0.034, 0.098, 0.032, 0.026, 0.030);
      const eyeR = sdEllipsoid(lx, ly, lz,  0.086, 0.034, 0.098, 0.032, 0.026, 0.030);
      const eyes = Math.min(eyeL, eyeR);

      const pupilL = sdEllipsoid(lx, ly, lz, -0.098, 0.034, 0.112, 0.018, 0.009, 0.020);
      const pupilR = sdEllipsoid(lx, ly, lz,  0.098, 0.034, 0.112, 0.018, 0.009, 0.020);
      const pupils = Math.min(pupilL, pupilR);

      const glintL = sdEllipsoid(lx, ly, lz, -0.096, 0.045, 0.118, 0.010, 0.010, 0.010);
      const glintR = sdEllipsoid(lx, ly, lz,  0.096, 0.045, 0.118, 0.010, 0.010, 0.010);
      const glints = Math.min(glintL, glintR);

      const nose = sdEllipsoid(lx, ly, lz, 0, -0.040, 0.320, 0.038, 0.028, 0.024);

      // 3. Slender jointed 2-segment legs with dark cloven hooves
      const frontLeg = (sx: number, swing: number, lift: number) => {
        const shY = -0.06 + by;
        const shZ = 0.20;
        const knY = -0.31 + by * 0.4 + lift * 0.45;
        const knZ = 0.20 + swing * 0.52;
        const ftY = -0.56 + lift;
        const ftZ = 0.22 + swing;
        const upper = sdCapsule(x, y, z, sx, shY, shZ, sx, knY, knZ, 0.064, 0.042);
        const lower = sdCapsule(x, y, z, sx, knY, knZ, sx, ftY, ftZ, 0.040, 0.032);
        const hoof = sdEllipsoid(x, y, z, sx, ftY - 0.020, ftZ + 0.020, 0.036, 0.030, 0.048);
        return { leg: smin(upper, lower, 0.02), hoof };
      };

      const hindLeg = (sx: number, swing: number, lift: number) => {
        const hpY = -0.04 + by;
        const hpZ = -0.26;
        const hkY = -0.31 + by * 0.4 + lift * 0.45;
        const hkZ = -0.34 + swing * 0.48;
        const ftY = -0.56 + lift;
        const ftZ = -0.26 + swing;
        const thigh = sdEllipsoid(x, y, z, sx * 1.02, -0.06 + by, -0.28 + swing * 0.15, 0.085, 0.125, 0.11);
        const upper = sdCapsule(x, y, z, sx, hpY, hpZ, sx, hkY, hkZ, 0.066, 0.042);
        const lower = sdCapsule(x, y, z, sx, hkY, hkZ, sx, ftY, ftZ, 0.040, 0.032);
        const hoof = sdEllipsoid(x, y, z, sx, ftY - 0.020, ftZ + 0.020, 0.036, 0.030, 0.048);
        return { leg: smin(smin(thigh, upper, 0.035), lower, 0.02), hoof };
      };

      const fl = frontLeg(-0.145, P.fl, P.flLift);
      const fr = frontLeg( 0.145, P.fr, P.frLift);
      const bl = hindLeg(-0.155, P.bl, P.blLift);
      const br = hindLeg( 0.155, P.br, P.brLift);

      const legs = Math.min(Math.min(fl.leg, fr.leg), Math.min(bl.leg, br.leg));
      const hooves = Math.min(Math.min(fl.hoof, fr.hoof), Math.min(bl.hoof, br.hoof));
      coat = smin(coat, legs, 0.035);

      let d = coat, mat = 'coat';
      if (earInner < d) { d = earInner; mat = 'earInner'; }
      if (horns < d) { d = horns; mat = 'horn'; }
      if (hooves < d) { d = hooves; mat = 'hoof'; }
      if (eyes < d) { d = eyes; mat = 'eye'; }
      if (pupils < d) { d = pupils; mat = 'pupil'; }
      if (glints < d) { d = glints; mat = 'glint'; }
      if (nose < d) { d = nose; mat = 'nose'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'glint') return 'W';
      if (mat === 'eye') return 'e';
      if (mat === 'pupil' || mat === 'nose' || mat === 'hoof') return 'k';
      if (mat === 'earInner') return shade > 0.45 ? 'p' : 'm1';

      // Ridged horn rings along the curved horn length
      if (mat === 'horn') {
        const ring = Math.sin((y * 42 - z * 34));
        if (ring > 0.45) return 'h0';
        return shade > 0.62 ? 'h2' : shade > 0.30 ? 'h1' : 'h0';
      }

      // Darker slate-brown dorsal stripe & lower-leg markings
      const dorsal = y > 0.16 + by && Math.abs(x) < 0.095 && z > -0.42 && z < 0.28;
      const lowerLeg = y < -0.34;
      if (dorsal || lowerLeg) {
        return shade > 0.68 ? 'm2' : shade > 0.36 ? 'm1' : 'm0';
      }

      // Subtle shaggy fur texture on 5-tone ivory/warm-grey coat
      const shag = Math.sin(x * 22 + z * 16) * Math.cos(y * 24) * 0.05;
      const s = shade + shag;
      return s > 0.80 ? 'W' : s > 0.60 ? 'w3' : s > 0.40 ? 'w2' : s > 0.22 ? 'w1' : 'w0';
    };

    pack = build27Pack(GOAT_PW, GOAT_PH, 0.98, 0.90, GOAT_PAL, evalFn, shadeFn);
    goatCache.set(pose, pack);
  }
  return pack;
}

export function getGoatPosePack(...args: Parameters<typeof buildGoatPosePack>): ReturnType<typeof buildGoatPosePack> {
  return registerAnimalSpritePack(buildGoatPosePack(...args), { module: './Goat.ts', factory: 'getGoatPosePack', args }, buildGoatPosePack);
}

// ============================================================================
// INSTÂNCIA NA ARENA (Goat)
// ============================================================================
const GOAT_IDLE: readonly GoatPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const GOAT_WALK: readonly GoatPoseName[] = ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'];
const GOAT_GRAZE: readonly GoatPoseName[] = ['graze0', 'graze1', 'graze2', 'graze1', 'graze0'];
const GOAT_CHARGE: readonly GoatPoseName[] = ['charge0', 'charge1', 'charge2', 'charge3'];

function pickCycle<T>(frames: readonly T[], idx: number): T {
  return sampleAnimalCycle(frames, idx);
}

/**
 * Goat (Cabra): grazes peacefully and charges/headbutts if provoked.
 */
export class Goat extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private readonly home = new THREE.Vector3();
  private state: 'idle' | 'graze' | 'walk' | 'charge' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.5, 3.0);
  private targetYaw = rand(0, Math.PI * 2);
  private gaitPhase = rand(0, Math.PI * 2);
  private hopCooldown = 0;
  private provoked = false;

  constructor(ctx: GameContext, pos: THREE.Vector3) {
    super(ctx, getGoatPosePack('idle0').getView(2, 0)!, GOAT_PW, GOAT_PH, GOAT_W, GOAT_H, 'GoatBillboard');
    this.hp = 50;
    this.maxHp = 50;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.42;
    this.motor.height = 0.90;
    this.motor.teleport(pos);
    this.home.copy(pos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.48, tag: 'body', enabled: true });
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
    this.vel.x += hit.dir.x * 4.0;
    this.vel.z += hit.dir.z * 4.0;
    this.vel.y = 3.2;
    this.provoked = true;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.state = 'charge';
      this.stateT = 0;
      this.stateDur = 2.4;
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
        if (this.provoked && dist < 5.5 && this.state !== 'charge') {
          this.state = 'charge';
          this.stateT = 0;
          this.stateDur = 2.2;
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
          speed = 2.0;
          if (this.stateT >= this.stateDur && this.motor.grounded) {
            this.state = Math.random() < 0.45 ? 'graze' : 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.4, 2.6);
          }
        } else if (this.state === 'charge') {
          if (target && target.alive) {
            this.targetYaw = Math.atan2(target.position.x - this.position.x, target.position.z - this.position.z);
            this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 8);
            speed = 5.2;
            if (this.motor.grounded && this.hopCooldown <= 0 && dist < 3.4) {
              this.vel.y = 4.2;
              this.hopCooldown = 0.9;
            }
          }
          if (this.stateT >= this.stateDur && dist > 6.5 && this.motor.grounded) {
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

    let pose: GoatPoseName;
    if (!this.alive) pose = 'idle0';
    else if (this.state === 'charge') pose = pickCycle(GOAT_CHARGE, (this.gaitPhase / Math.PI) * 2.5);
    else if (this.state === 'graze') pose = pickCycle(GOAT_GRAZE, this.stateT * 2.2);
    else if (this.state === 'walk') pose = pickCycle(GOAT_WALK, (this.gaitPhase / Math.PI) * 2.6);
    else pose = pickCycle(GOAT_IDLE, this.stateT * 2.0);

    const deathSink = this.alive ? 0 : Math.min(0.20, this.deadT * 0.4);
    this.renderBillboard(getGoatPosePack(pose), this.position.y + 0.44 + bob - deathSink, camera, drawingBufferSize);
  }
}
