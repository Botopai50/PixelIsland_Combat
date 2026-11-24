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
// ONÇA-PINTADA (Brazilian Jaguar) — Flagship Rebuild 62×44 @ ANIMAL_PPU
// ============================================================================
export type JaguarPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'prowl0' | 'prowl1' | 'prowl2' | 'prowl3' | 'prowl4' | 'prowl5'
  | 'pounce0' | 'pounce1' | 'pounce2' | 'pounce3'
  | 'roar0' | 'roar1' | 'roar2';

export const JAGUAR_PW = 62;
export const JAGUAR_PH = 44;
export const JAGUAR_W = JAGUAR_PW / ANIMAL_PPU;
export const JAGUAR_H = JAGUAR_PH / ANIMAL_PPU;

/** Rich golden-ochre coat + large crisp dark rosettes with warm amber centers + snow-white underparts. */
const JAGUAR_PAL: Record<string, [number, number, number]> = {
  k:  [0x14, 0x10, 0x0d], // crisp 1px outline / nose / dark claws
  r0: [0x1f, 0x16, 0x11], // crisp dark rosette ring / ear backs / tail rings & tip
  o0: [0x82, 0x49, 0x18], // warm darker-amber rosette center / deep shadow
  o1: [0xb0, 0x69, 0x22], // warm golden-ochre shadow
  o2: [0xdc, 0x90, 0x32], // rich golden-ochre midtone
  o3: [0xf4, 0xb6, 0x4e], // bright amber-gold coat
  o4: [0xff, 0xd8, 0x7c], // sunlit golden-ochre highlight
  w0: [0xc4, 0xba, 0xa6], // snow-white underbelly/throat shadow
  w1: [0xec, 0xe5, 0xd6], // snow-white cheek/chest midtone
  W:  [0xfd, 0xfc, 0xf6], // pure snow-white muzzle / chin / fangs / eye glint
  ep: [0xd8, 0xa8, 0x92], // pale warm inner ear
  e:  [0x96, 0xdc, 0x38], // piercing golden-green jaguar eyes
  m:  [0x7e, 0x22, 0x2a], // open mouth interior in roar/pounce
};

interface JaguarPose {
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

const JAGUAR_POSES: Record<JaguarPoseName, JaguarPose> = {
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

  // 6-frame heavy compact jungle stalk
  prowl0: {
    bodyY: -0.04, headY: -0.06, headZ: 0.06, headPitch: -0.08, jawOpen: 0.0,
    flSwing: 0.22, flLift: 0.08, frSwing: -0.14, frLift: 0.0, blSwing: -0.16, blLift: 0.0, brSwing: 0.16, brLift: 0.07,
    tailLift: -0.06, tailSway: 0.06,
  },
  prowl1: {
    bodyY: -0.03, headY: -0.06, headZ: 0.07, headPitch: -0.09, jawOpen: 0.0,
    flSwing: 0.10, flLift: 0.03, frSwing: -0.04, frLift: 0.05, blSwing: -0.06, blLift: 0.05, brSwing: 0.08, brLift: 0.03,
    tailLift: -0.05, tailSway: 0.03,
  },
  prowl2: {
    bodyY: -0.05, headY: -0.07, headZ: 0.05, headPitch: -0.07, jawOpen: 0.0,
    flSwing: -0.04, flLift: 0.0, frSwing: 0.10, frLift: 0.08, blSwing: 0.08, blLift: 0.07, brSwing: -0.05, brLift: 0.0,
    tailLift: -0.07, tailSway: -0.03,
  },
  prowl3: {
    bodyY: -0.04, headY: -0.06, headZ: 0.06, headPitch: -0.08, jawOpen: 0.0,
    flSwing: -0.14, flLift: 0.0, frSwing: 0.22, frLift: 0.08, blSwing: 0.16, blLift: 0.07, brSwing: -0.16, brLift: 0.0,
    tailLift: -0.06, tailSway: -0.06,
  },
  prowl4: {
    bodyY: -0.03, headY: -0.06, headZ: 0.07, headPitch: -0.09, jawOpen: 0.0,
    flSwing: -0.04, flLift: 0.05, frSwing: 0.10, frLift: 0.03, blSwing: 0.08, blLift: 0.03, brSwing: -0.06, brLift: 0.05,
    tailLift: -0.05, tailSway: -0.03,
  },
  prowl5: {
    bodyY: -0.05, headY: -0.07, headZ: 0.05, headPitch: -0.07, jawOpen: 0.0,
    flSwing: 0.10, flLift: 0.08, frSwing: -0.04, frLift: 0.0, blSwing: -0.05, blLift: 0.0, brSwing: 0.08, brLift: 0.07,
    tailLift: -0.07, tailSway: 0.03,
  },

  // 4-frame powerful ambush pounce
  pounce0: {
    bodyY: -0.10, headY: -0.10, headZ: 0.06, headPitch: -0.10, jawOpen: 0.25,
    flSwing: 0.14, flLift: 0.0, frSwing: 0.08, frLift: 0.0, blSwing: 0.14, blLift: 0.0, brSwing: 0.10, brLift: 0.0,
    tailLift: -0.08, tailSway: 0.0,
  },
  pounce1: {
    bodyY: 0.06, headY: -0.02, headZ: 0.10, headPitch: 0.02, jawOpen: 0.78,
    flSwing: 0.32, flLift: 0.34, frSwing: 0.24, frLift: 0.26, blSwing: -0.26, blLift: 0.18, brSwing: -0.20, brLift: 0.12,
    tailLift: 0.18, tailSway: 0.0,
  },
  pounce2: {
    bodyY: 0.04, headY: -0.04, headZ: 0.12, headPitch: -0.04, jawOpen: 0.95,
    flSwing: 0.38, flLift: 0.38, frSwing: 0.30, frLift: 0.30, blSwing: -0.32, blLift: 0.24, brSwing: -0.24, brLift: 0.18,
    tailLift: 0.22, tailSway: 0.04,
  },
  pounce3: {
    bodyY: -0.06, headY: -0.06, headZ: 0.06, headPitch: -0.06, jawOpen: 0.35,
    flSwing: 0.12, flLift: 0.0, frSwing: 0.16, frLift: 0.04, blSwing: 0.08, blLift: 0.06, brSwing: 0.04, brLift: 0.0,
    tailLift: 0.06, tailSway: -0.04,
  },

  // 3-frame majestic jaguar roar
  roar0: {
    bodyY: 0.01, headY: 0.05, headZ: 0.02, headPitch: 0.18, jawOpen: 0.55,
    flSwing: 0.06, flLift: 0, frSwing: 0.02, frLift: 0, blSwing: -0.04, blLift: 0, brSwing: -0.04, brLift: 0,
    tailLift: 0.08, tailSway: 0.04,
  },
  roar1: {
    bodyY: 0.02, headY: 0.09, headZ: 0.03, headPitch: 0.30, jawOpen: 1.0,
    flSwing: 0.08, flLift: 0, frSwing: 0.04, frLift: 0, blSwing: -0.06, blLift: 0, brSwing: -0.06, brLift: 0,
    tailLift: 0.14, tailSway: -0.04,
  },
  roar2: {
    bodyY: 0.01, headY: 0.04, headZ: 0.02, headPitch: 0.14, jawOpen: 0.45,
    flSwing: 0.05, flLift: 0, frSwing: 0.02, frLift: 0, blSwing: -0.04, blLift: 0, brSwing: -0.04, brLift: 0,
    tailLift: 0.06, tailSway: 0.02,
  },
};

const jaguarCache = new Map<JaguarPoseName, Boar27Pack>();

 function buildJaguarPosePack(pose: JaguarPoseName): Boar27Pack {
  let pack = jaguarCache.get(pose);
  if (!pack) {
    const P = JAGUAR_POSES[pose];
    const by = P.bodyY;
    const hPivotY = 0.18 + by + P.headY;
    const hPivotZ = 0.43 + P.headZ;
    const cosP = Math.cos(P.headPitch);
    const sinP = Math.sin(P.headPitch);
    const jawDrop = P.jawOpen * 0.13;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // 1. Heavy, compact, deeply muscular powerhouse silhouette (visually distinct from sleek Cheetah!)
      const chest = sdEllipsoid(x, y, z, 0, 0.03 + by, 0.20, 0.27, 0.245, 0.28);
      const withers = sdEllipsoid(x, y, z, 0, 0.16 + by, 0.17, 0.225, 0.15, 0.21);
      const barrel = sdEllipsoid(x, y, z, 0, 0.04 + by, -0.08, 0.235, 0.21, 0.27);
      const rump = sdEllipsoid(x, y, z, 0, 0.04 + by, -0.32, 0.24, 0.215, 0.22);
      const neck = sdCapsule(x, y, z, 0, 0.10 + by, 0.27, 0, hPivotY - 0.01, hPivotZ - 0.04, 0.195, 0.165);

      let fur = smin(chest, withers, 0.07);
      fur = smin(fur, barrel, 0.10);
      fur = smin(fur, rump, 0.10);
      fur = smin(fur, neck, 0.08);

      // 2. Massive broad feline head & jaw with fluffy white-edged cheeks
      const dy = y - hPivotY;
      const dz = z - hPivotZ;
      const lx = x;
      const lz = dz * cosP + dy * sinP;
      const ly = -dz * sinP + dy * cosP;

      const skull = sdEllipsoid(lx, ly, lz, 0, 0.02, 0.02, 0.182, 0.155, 0.172);
      const cheekL = sdEllipsoid(lx, ly, lz, -0.148, -0.025, 0.015, 0.112, 0.102, 0.110);
      const cheekR = sdEllipsoid(lx, ly, lz,  0.148, -0.025, 0.015, 0.112, 0.102, 0.110);
      const upperMuzzle = sdCapsule(lx, ly, lz, 0, -0.005, 0.09, 0, -0.025, 0.245, 0.102, 0.075);
      const lowerJaw = sdCapsule(lx, ly, lz, 0, -0.058, 0.08, 0, -0.068 - jawDrop, 0.225 - P.jawOpen * 0.03, 0.078, 0.052);

      // Rounded ears with dark backs & pale inner ear
      const earL = sdEllipsoid(lx, ly, lz, -0.138, 0.148, -0.02, 0.058, 0.056, 0.038);
      const earR = sdEllipsoid(lx, ly, lz,  0.138, 0.148, -0.02, 0.058, 0.056, 0.038);
      const ears = Math.min(earL, earR);

      const earInL = sdEllipsoid(lx, ly, lz, -0.138, 0.146, 0.006, 0.034, 0.034, 0.020);
      const earInR = sdEllipsoid(lx, ly, lz,  0.138, 0.146, 0.006, 0.034, 0.034, 0.020);
      const earInner = Math.min(earInL, earInR);

      let headD = smin(skull, Math.min(cheekL, cheekR), 0.05);
      headD = smin(headD, upperMuzzle, 0.04);
      headD = smin(headD, lowerJaw, P.jawOpen > 0.2 ? 0.02 : 0.04);
      headD = smin(headD, ears, 0.02);
      fur = smin(fur, headD, 0.06);

      // 3. Shorter thick muscular legs with big wide paws
      const frontLeg = (sx: number, swing: number, lift: number) => {
        const shY = -0.02 + by, shZ = 0.23;
        const elY = -0.23 + by * 0.5 + lift * 0.25;
        const elZ = 0.18 + swing * 0.50;
        const pwY = -0.47 + lift * 0.40;
        const pwZ = 0.25 + swing * 0.92;
        const upper = sdCapsule(x, y, z, sx, shY, shZ, sx, elY, elZ, 0.115, 0.082);
        const lower = sdCapsule(x, y, z, sx, elY, elZ, sx, pwY, pwZ, 0.080, 0.062);
        const paw = sdEllipsoid(x, y, z, sx, pwY - 0.01, pwZ + 0.048, 0.080, 0.044, 0.094);
        return smin(smin(upper, lower, 0.03), paw, 0.025);
      };

      const hindLeg = (sx: number, swing: number, lift: number) => {
        const hipY = 0.0 + by, hipZ = -0.29;
        const thigh = sdEllipsoid(x, y, z, sx * 1.03, -0.04 + by, -0.30 + swing * 0.16, 0.118, 0.150, 0.132);
        const hkY = -0.24 + by * 0.5 + lift * 0.25;
        const hkZ = -0.42 + swing * 0.45;
        const pwY = -0.47 + lift * 0.40;
        const pwZ = -0.33 + swing * 0.92;
        const upper = sdCapsule(x, y, z, sx, hipY, hipZ, sx, hkY, hkZ, 0.110, 0.072);
        const lower = sdCapsule(x, y, z, sx, hkY, hkZ, sx, pwY, pwZ, 0.070, 0.056);
        const paw = sdEllipsoid(x, y, z, sx, pwY - 0.01, pwZ + 0.048, 0.080, 0.044, 0.094);
        return smin(smin(thigh, upper, 0.04), smin(lower, paw, 0.025), 0.03);
      };

      const legs = Math.min(
        Math.min(frontLeg(-0.18, P.flSwing, P.flLift), frontLeg(0.18, P.frSwing, P.frLift)),
        Math.min(hindLeg(-0.185, P.blSwing, P.blLift), hindLeg(0.185, P.brSwing, P.brLift)),
      );
      fur = smin(fur, legs, 0.045);

      // 4. Medium-length thick muscular tail with dark rings & tip
      const tMidX = P.tailSway * 0.5;
      const tMidY = -0.07 + by * 0.5 + P.tailLift * 0.4;
      const tMidZ = -0.66;
      const tTipX = P.tailSway;
      const tTipY = -0.04 + P.tailLift * 0.9;
      const tTipZ = -0.88;
      const tail1 = sdCapsule(x, y, z, 0, 0.04 + by, -0.46, tMidX, tMidY, tMidZ, 0.072, 0.060);
      const tail2 = sdCapsule(x, y, z, tMidX, tMidY, tMidZ, tTipX, tTipY, tTipZ, 0.058, 0.044);
      const tailD = smin(tail1, tail2, 0.03);
      fur = smin(fur, tailD, 0.045);

      // Piercing golden-green eyes + white glint + nose + open roar mouth/fangs
      const eyeL = sdEllipsoid(lx, ly, lz, -0.098, 0.046, 0.152, 0.035, 0.028, 0.030);
      const eyeR = sdEllipsoid(lx, ly, lz,  0.098, 0.046, 0.152, 0.035, 0.028, 0.030);
      const eyes = Math.min(eyeL, eyeR);

      const glintL = sdEllipsoid(lx, ly, lz, -0.108, 0.055, 0.172, 0.012, 0.012, 0.012);
      const glintR = sdEllipsoid(lx, ly, lz,  0.108, 0.055, 0.172, 0.012, 0.012, 0.012);
      const glints = Math.min(glintL, glintR);

      const nose = sdEllipsoid(lx, ly, lz, 0, -0.016, 0.292, 0.046, 0.030, 0.026);

      let mouth = 99;
      let fangs = 99;
      if (P.jawOpen > 0.2) {
        mouth = sdEllipsoid(lx, ly, lz, 0, -0.044 - jawDrop * 0.42, 0.18, 0.058, 0.028 + jawDrop * 0.42, 0.075);
        const fL = sdCapsule(lx, ly, lz, -0.044, -0.035, 0.23, -0.044, -0.085, 0.23, 0.016, 0.006);
        const fR = sdCapsule(lx, ly, lz,  0.044, -0.035, 0.23,  0.044, -0.085, 0.23, 0.016, 0.006);
        fangs = Math.min(fL, fR);
      }

      let d = fur, mat = 'fur';
      if (ears < fur + 0.006 && lz < -0.005 && ly > 0.12) mat = 'earBack';
      if (tailD < fur + 0.008 && z < -0.54) mat = 'tail';
      if (earInner < d) { d = earInner; mat = 'earInner'; }
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
      if (mat === 'nose') return 'k';
      if (mat === 'mouth') return 'm';
      if (mat === 'earBack') return 'r0';
      if (mat === 'earInner') return 'ep';

      // Dark-ringed tail with dark tip
      if (mat === 'tail') {
        if (z < -0.78 || Math.sin(z * 32) > 0.32) return 'r0';
        return shade > 0.55 ? 'o3' : shade > 0.28 ? 'o2' : 'o1';
      }

      // Clean snow-white muzzle, chin, fluffy cheek edge, throat, chest & belly!
      const isBelly = y < -0.08 + by && y > -0.26 + by && z > -0.34 && z < 0.36 && Math.abs(x) < 0.17;
      const isChest = z > 0.34 && y < 0.10 + by && y > -0.19 + by && Math.abs(x) < 0.16;
      const isMuzzleChin = z > 0.54 && y < hPivotY - 0.015;
      const isCheekEdge = z > 0.38 && z < 0.56 && y < hPivotY - 0.01 && Math.abs(x) > 0.11;
      if (isBelly || isChest || isMuzzleChin || isCheekEdge) {
        return shade > 0.65 ? 'W' : shade > 0.35 ? 'w1' : 'w0';
      }

      // Realistic organic jaguar rosettes (continuous 3D mapping, thick readable dark ring + warm amber center + central dot)
      if (z < 0.44 && y > -0.22 + by) {
        const u = z * 3.0 + Math.sin((y - by) * 6.5) * 0.18;
        const v = (y - by) * 3.2 + Math.abs(x) * 1.35;
        const row = Math.floor(v + 0.5);
        const uOff = (row & 1) * 0.5;
        const cu = Math.floor(u + uOff + 0.5) - uOff;
        const cv = row;
        const rDist = Math.hypot(u - cu, v - cv);
        if ((rDist >= 0.23 && rDist <= 0.41) || rDist < 0.09) return 'r0';
        if (rDist < 0.23) return shade > 0.50 ? 'o1' : 'o0';
      } else if (y <= -0.22 + by) {
        // Realistic solid dark spots on muscular lower legs
        const lu = (y - by) * 5.2;
        const lv = z * 5.2;
        const rLeg = Math.hypot(lu - Math.floor(lu + 0.5), lv - Math.floor(lv + 0.5));
        if (rLeg < 0.28) return 'r0';
      }

      return shade > 0.80 ? 'o4' : shade > 0.56 ? 'o3' : shade > 0.32 ? 'o2' : 'o1';
    };

    pack = build27Pack(JAGUAR_PW, JAGUAR_PH, 1.06, 0.86, JAGUAR_PAL, evalFn, shadeFn);
    jaguarCache.set(pose, pack);
  }
  return pack;
}

export function getJaguarPosePack(...args: Parameters<typeof buildJaguarPosePack>): ReturnType<typeof buildJaguarPosePack> {
  return registerAnimalSpritePack(buildJaguarPosePack(...args), { module: './Jaguar.ts', factory: 'getJaguarPosePack', args }, buildJaguarPosePack);
}

// ============================================================================
// INSTÂNCIA NA ARENA (Jaguar)
// ============================================================================
const JAG_IDLE: readonly JaguarPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const JAG_PROWL: readonly JaguarPoseName[] = ['prowl0', 'prowl1', 'prowl2', 'prowl3', 'prowl4', 'prowl5'];
const JAG_POUNCE: readonly JaguarPoseName[] = ['pounce0', 'pounce1', 'pounce2', 'pounce3'];
const JAG_ROAR: readonly JaguarPoseName[] = ['roar0', 'roar1', 'roar2'];

function pickCycle<T>(frames: readonly T[], idx: number): T {
  return sampleAnimalCycle(frames, idx);
}

export class Jaguar extends BasePixelAnimal {
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

  private readonly centerY = 0.42;

  constructor(ctx: GameContext, startPos: THREE.Vector3) {
    super(ctx, getJaguarPosePack('idle0').getView(2, 0)!, JAGUAR_PW, JAGUAR_PH, JAGUAR_W, JAGUAR_H, 'JaguarBillboard');
    this.hp = 85;
    this.maxHp = 85;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.46;
    this.motor.height = 0.86;
    this.motor.teleport(startPos);
    this.home.copy(startPos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.52, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.set(this.position.x, this.position.y + this.centerY, this.position.z);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y + 0.22, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.64, this.position.z);
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
    this.provoked = true;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.state = 'roar';
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
          if (this.provoked && target && target.alive && dist < 5.5) {
            this.targetYaw = Math.atan2(target.position.x - this.position.x, target.position.z - this.position.z);
            if (dist < 2.8 && this.motor.grounded) {
              this.state = 'pounce';
              this.stateT = 0;
              this.stateDur = 0.85;
              this.vel.y = 4.4;
            }
          }
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 6);
          speed = this.provoked ? 3.8 : 2.2;
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
          speed = this.stateT < 0.5 ? 6.0 : 1.5;
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
          this.gaitPhase += dt * 5.8 * (0.65 + horiz * 0.22);
        }
      }
      this.syncHurtbox();
    }

    const horiz = Math.hypot(this.vel.x, this.vel.z);
    const bob = this.alive && this.motor.grounded && horiz > 0.25 && this.state === 'prowl'
      ? Math.abs(Math.sin(this.gaitPhase)) * 0.026
      : 0;

    let pose: JaguarPoseName;
    if (!this.alive) pose = 'idle0';
    else if (this.state === 'pounce') pose = pickCycle(JAG_POUNCE, this.stateT * 4.8);
    else if (this.state === 'roar') pose = pickCycle(JAG_ROAR, this.stateT * 3.2);
    else if (this.state === 'prowl') pose = pickCycle(JAG_PROWL, (this.gaitPhase / Math.PI) * 2.6);
    else pose = pickCycle(JAG_IDLE, this.stateT * 2.0);

    const deathSink = this.alive ? 0 : Math.min(0.22, this.deadT * 0.4);
    this.renderBillboard(getJaguarPosePack(pose), this.position.y + this.centerY + bob - deathSink, camera, drawingBufferSize);
  }
}
