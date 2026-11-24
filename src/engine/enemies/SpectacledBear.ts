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
// URSO DE ÓCULOS (Spectacled / Andean Bear) — Flagship 64×54 @ ANIMAL_PPU
// ============================================================================
export type SpectacledBearPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'walk0' | 'walk1' | 'walk2' | 'walk3' | 'walk4' | 'walk5'
  | 'forage0' | 'forage1' | 'forage2'
  | 'rear0' | 'rear1' | 'rear2' | 'rear3';

export const SPECTACLED_BEAR_PW = 64;
export const SPECTACLED_BEAR_PH = 54;
export const SPECTACLED_BEAR_W = SPECTACLED_BEAR_PW / ANIMAL_PPU;
export const SPECTACLED_BEAR_H = SPECTACLED_BEAR_PH / ANIMAL_PPU;

/** 5-tone shaggy charcoal-black coat (cool slate-brown highlights) + golden-cream spectacle/bib ramp. */
const SPECTACLED_PAL: Record<string, [number, number, number]> = {
  k:  [0x10, 0x0f, 0x13], // crisp 1px outline / dark eye / nose
  b0: [0x18, 0x17, 0x1c], // deep charcoal-black shadow
  b1: [0x26, 0x24, 0x2b], // dark charcoal-brown
  b2: [0x3b, 0x36, 0x3e], // shaggy slate-brown midtone
  b3: [0x54, 0x4d, 0x55], // warm slate-brown highlight
  b4: [0x70, 0x67, 0x6f], // sunlit shaggy rim highlight
  g0: [0xa6, 0x82, 0x48], // golden-cream spectacle/bib shadow
  g1: [0xd4, 0xae, 0x6c], // pale-amber spectacle/bib midtone
  g2: [0xf0, 0xd4, 0x98], // bright golden-cream highlight
  g3: [0xfc, 0xec, 0xc4], // sunlit spectacle/bib peak
  c0: [0x4c, 0x44, 0x3c], // climbing claw shadow
  c1: [0x8c, 0x7e, 0x6e], // climbing claw highlight
  W:  [0xfc, 0xfb, 0xf6], // bright white eye glint
};

interface SpectacledPose {
  mode: 'quad' | 'rear';
  bodyY: number;
  bodyPitch: number;
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
  rearAmt?: number; // 0..1 upright progress
}

const SPECTACLED_POSES: Record<SpectacledBearPoseName, SpectacledPose> = {
  idle0: {
    mode: 'quad', bodyY: 0.0, bodyPitch: 0.0, headY: 0.0, headZ: 0.0, headSway: 0.0, headPitch: 0.0,
    fl: 0.0, fr: 0.0, bl: 0.0, br: 0.0, flLift: 0, frLift: 0, blLift: 0, brLift: 0,
  },
  idle1: {
    mode: 'quad', bodyY: 0.014, bodyPitch: 0.01, headY: 0.022, headZ: 0.01, headSway: 0.035, headPitch: -0.05,
    fl: 0.0, fr: 0.0, bl: 0.0, br: 0.0, flLift: 0, frLift: 0, blLift: 0, brLift: 0,
  },
  idle2: {
    mode: 'quad', bodyY: -0.010, bodyPitch: -0.01, headY: -0.016, headZ: 0.015, headSway: -0.035, headPitch: 0.04,
    fl: 0.0, fr: 0.0, bl: 0.0, br: 0.0, flLift: 0, frLift: 0, blLift: 0, brLift: 0,
  },

  // 6-frame agile Andean bear walk
  walk0: {
    mode: 'quad', bodyY: 0.012, bodyPitch: 0.01, headY: -0.01, headZ: 0.03, headSway: 0.015, headPitch: 0.03,
    fl: 0.18, fr: -0.14, bl: -0.16, br: 0.16, flLift: 0.09, frLift: 0.0, blLift: 0.0, brLift: 0.08,
  },
  walk1: {
    mode: 'quad', bodyY: 0.022, bodyPitch: 0.02, headY: -0.015, headZ: 0.04, headSway: 0.0, headPitch: 0.04,
    fl: 0.09, fr: -0.04, bl: -0.07, br: 0.08, flLift: 0.04, frLift: 0.06, blLift: 0.06, brLift: 0.04,
  },
  walk2: {
    mode: 'quad', bodyY: -0.006, bodyPitch: 0.0, headY: 0.0, headZ: 0.02, headSway: -0.015, headPitch: 0.01,
    fl: -0.04, fr: 0.09, bl: 0.07, br: -0.05, flLift: 0.0, frLift: 0.09, blLift: 0.08, brLift: 0.0,
  },
  walk3: {
    mode: 'quad', bodyY: 0.012, bodyPitch: 0.01, headY: -0.01, headZ: 0.03, headSway: -0.015, headPitch: 0.03,
    fl: -0.14, fr: 0.18, bl: 0.16, br: -0.16, flLift: 0.0, frLift: 0.09, blLift: 0.08, brLift: 0.0,
  },
  walk4: {
    mode: 'quad', bodyY: 0.022, bodyPitch: 0.02, headY: -0.015, headZ: 0.04, headSway: 0.0, headPitch: 0.04,
    fl: -0.04, fr: 0.09, bl: 0.08, br: -0.07, flLift: 0.06, frLift: 0.04, blLift: 0.04, brLift: 0.06,
  },
  walk5: {
    mode: 'quad', bodyY: -0.006, bodyPitch: 0.0, headY: 0.0, headZ: 0.02, headSway: 0.015, headPitch: 0.01,
    fl: 0.09, fr: -0.04, bl: -0.05, br: 0.07, flLift: 0.09, frLift: 0.0, blLift: 0.0, brLift: 0.08,
  },

  // 3-frame foraging (sniffing/reaching low for forest fruit)
  forage0: {
    mode: 'quad', bodyY: -0.015, bodyPitch: 0.08, headY: -0.18, headZ: 0.10, headSway: 0.0, headPitch: 0.36,
    fl: 0.10, fr: -0.04, bl: 0.0, br: 0.0, flLift: 0.04, frLift: 0.0, blLift: 0, brLift: 0,
  },
  forage1: {
    mode: 'quad', bodyY: -0.028, bodyPitch: 0.12, headY: -0.32, headZ: 0.16, headSway: -0.04, headPitch: 0.56,
    fl: 0.16, fr: -0.06, bl: 0.0, br: 0.0, flLift: 0.08, frLift: 0.0, blLift: 0, brLift: 0,
  },
  forage2: {
    mode: 'quad', bodyY: -0.024, bodyPitch: 0.10, headY: -0.28, headZ: 0.18, headSway: 0.045, headPitch: 0.50,
    fl: 0.12, fr: 0.06, bl: 0.0, br: 0.0, flLift: 0.02, frLift: 0.07, blLift: 0, brLift: 0,
  },

  // 4-frame rearing up proudly showing off the broad golden-cream chest bib!
  rear0: {
    mode: 'rear', bodyY: 0.0, bodyPitch: 0, headY: 0.0, headZ: 0, headSway: 0, headPitch: -0.08,
    fl: 0, fr: 0, bl: 0, br: 0, flLift: 0, frLift: 0, blLift: 0, brLift: 0, rearAmt: 0.55,
  },
  rear1: {
    mode: 'rear', bodyY: 0.02, bodyPitch: 0, headY: 0.03, headZ: 0, headSway: -0.02, headPitch: -0.14,
    fl: 0, fr: 0, bl: 0, br: 0, flLift: 0, frLift: 0, blLift: 0, brLift: 0, rearAmt: 0.92,
  },
  rear2: {
    mode: 'rear', bodyY: 0.03, bodyPitch: 0, headY: 0.04, headZ: 0, headSway: 0.02, headPitch: -0.16,
    fl: 0, fr: 0, bl: 0, br: 0, flLift: 0, frLift: 0, blLift: 0, brLift: 0, rearAmt: 1.0,
  },
  rear3: {
    mode: 'rear', bodyY: 0.01, bodyPitch: 0, headY: 0.01, headZ: 0, headSway: 0, headPitch: -0.06,
    fl: 0, fr: 0, bl: 0, br: 0, flLift: 0, frLift: 0, blLift: 0, brLift: 0, rearAmt: 0.65,
  },
};

const spectacledCache = new Map<SpectacledBearPoseName, Boar27Pack>();

 function buildSpectacledBearPosePack(pose: SpectacledBearPoseName): Boar27Pack {
  let pack = spectacledCache.get(pose);
  if (!pack) {
    const P = SPECTACLED_POSES[pose];
    const by = P.bodyY;

    // Shared head evaluator in local pitched coordinates
    const evalHead = (lx: number, ly: number, lz: number) => {
      const cranium = sdEllipsoid(lx, ly, lz, 0, 0.02, 0.0, 0.185, 0.165, 0.185);
      const cheekL = sdEllipsoid(lx, ly, lz, -0.125, -0.035, 0.03, 0.105, 0.098, 0.105);
      const cheekR = sdEllipsoid(lx, ly, lz,  0.125, -0.035, 0.03, 0.105, 0.098, 0.105);
      const muzzle = sdCapsule(lx, ly, lz, 0, -0.032, 0.08, 0, -0.048, 0.245, 0.092, 0.068);
      const earL = sdEllipsoid(lx, ly, lz, -0.155, 0.155, -0.02, 0.068, 0.066, 0.044);
      const earR = sdEllipsoid(lx, ly, lz,  0.155, 0.155, -0.02, 0.068, 0.066, 0.044);

      let headD = smin(cranium, Math.min(cheekL, cheekR), 0.05);
      headD = smin(headD, muzzle, 0.04);
      headD = smin(headD, Math.min(earL, earR), 0.025);

      // Expressive dark eyes + crisp white glint + dark button nose
      const eyeL = sdEllipsoid(lx, ly, lz, -0.078, 0.026, 0.164, 0.024, 0.024, 0.022);
      const eyeR = sdEllipsoid(lx, ly, lz,  0.078, 0.026, 0.164, 0.024, 0.024, 0.022);
      const eyes = Math.min(eyeL, eyeR);

      const glintL = sdEllipsoid(lx, ly, lz, -0.086, 0.036, 0.180, 0.011, 0.011, 0.011);
      const glintR = sdEllipsoid(lx, ly, lz,  0.086, 0.036, 0.180, 0.011, 0.011, 0.011);
      const glints = Math.min(glintL, glintR);

      const nose = sdEllipsoid(lx, ly, lz, 0, -0.036, 0.298, 0.044, 0.032, 0.026);

      // Golden-cream spectacle rings circling both eyes + muzzle bridge + throat!
      const dEyeL = Math.hypot((lx + 0.078) * 0.92, (ly - 0.026) * 1.05);
      const dEyeR = Math.hypot((lx - 0.078) * 0.92, (ly - 0.026) * 1.05);
      const ringL = dEyeL > 0.028 && dEyeL < 0.072 && lz > 0.11;
      const ringR = dEyeR > 0.028 && dEyeR < 0.072 && lz > 0.11;
      const bridge = Math.abs(lx) < 0.044 && ly < 0.035 && ly > -0.095 && lz > 0.16;
      const throat = Math.abs(lx) < 0.105 && ly < -0.065 && lz > 0.03;
      const isSpectacle = ringL || ringR || bridge || throat;

      return { headD, eyes, glints, nose, isSpectacle };
    };

    const evalFn: SdfEvaluator = (x, y, z) => {
      if (P.mode === 'rear') {
        // Upright Andean bear proudly displaying the broad golden-cream chest bib!
        const r = P.rearAmt ?? 1.0;
        const hips = sdEllipsoid(x, y, z, 0, -0.22 + by, -0.08, 0.30, 0.26, 0.27);
        const chest = sdEllipsoid(x, y, z, 0, 0.08 + by + r * 0.06, -0.02, 0.28, 0.26, 0.24);
        const tail = sdEllipsoid(x, y, z, 0, -0.32 + by, -0.36, 0.075, 0.070, 0.075);

        const hy = 0.34 + by + r * 0.08 + P.headY;
        const hz = 0.06 + (1 - r) * 0.10;
        const cosP = Math.cos(P.headPitch);
        const sinP = Math.sin(P.headPitch);
        const dx = x - P.headSway;
        const dy = y - hy;
        const dz = z - hz;
        const lx = dx;
        const ly = dy * cosP + dz * sinP;
        const lz = -dy * sinP + dz * cosP;
        const H = evalHead(lx, ly, lz);

        // Raised strong forelegs with climbing claws
        const armL = sdCapsule(x, y, z, -0.24, 0.14 + by, 0.02, -0.30, 0.10 + by + r * 0.14, 0.26, 0.10, 0.078);
        const armR = sdCapsule(x, y, z,  0.24, 0.14 + by, 0.02,  0.30, 0.10 + by + r * 0.14, 0.26, 0.10, 0.078);
        const legL = sdCapsule(x, y, z, -0.19, -0.26 + by, -0.05, -0.21, -0.54, 0.02, 0.11, 0.085);
        const legR = sdCapsule(x, y, z,  0.19, -0.26 + by, -0.05,  0.21, -0.54, 0.02, 0.11, 0.085);

        const clawsL = sdEllipsoid(x, y, z, -0.31, 0.08 + by + r * 0.14, 0.33, 0.055, 0.028, 0.048);
        const clawsR = sdEllipsoid(x, y, z,  0.31, 0.08 + by + r * 0.14, 0.33, 0.055, 0.028, 0.048);
        const claws = Math.min(clawsL, clawsR);

        let body = smin(smin(hips, chest, 0.09), tail, 0.03);
        body = smin(body, H.headD, 0.06);
        body = smin(body, Math.min(Math.min(armL, armR), Math.min(legL, legR)), 0.045);

        // Broad golden-cream chest bib on front of chest!
        const inBib = z > 0.11 && Math.abs(x) < 0.19 && y > -0.16 + by && y < 0.28 + by + r * 0.06;
        let d = body;
        let mat = (H.isSpectacle && H.headD < body + 0.02) || inBib ? 'cream' : 'coat';
        if (claws < d) { d = claws; mat = 'claw'; }
        if (H.eyes < d) { d = H.eyes; mat = 'eye'; }
        if (H.glints < d) { d = H.glints; mat = 'glint'; }
        if (H.nose < d) { d = H.nose; mat = 'nose'; }
        return { d, mat };
      }

      // Quadruped mode (idle / walk / forage)
      const py = y - z * P.bodyPitch * 0.26;

      // Compact agile Andean bear build with strong shoulders & shaggy coat
      const chest = sdEllipsoid(x, py, z, 0, 0.04 + by, 0.20, 0.28, 0.25, 0.28);
      const withers = sdEllipsoid(x, py, z, 0, 0.16 + by, 0.14, 0.23, 0.16, 0.22);
      const torso = sdEllipsoid(x, py, z, 0, 0.03 + by, -0.08, 0.27, 0.24, 0.30);
      const rump = sdEllipsoid(x, py, z, 0, 0.02 + by, -0.32, 0.25, 0.23, 0.22);
      const tail = sdEllipsoid(x, py, z, 0, 0.04 + by, -0.52, 0.075, 0.068, 0.072);

      let body = smin(chest, withers, 0.07);
      body = smin(body, torso, 0.09);
      body = smin(body, rump, 0.09);
      body = smin(body, tail, 0.03);

      // Head in local pitched space
      const hy = 0.17 + by + P.headY;
      const hz = 0.45 + P.headZ;
      const cosP = Math.cos(P.headPitch);
      const sinP = Math.sin(P.headPitch);
      const dx = x - P.headSway;
      const dy = y - hy;
      const dz = z - hz;
      const lx = dx;
      const ly = dy * cosP + dz * sinP;
      const lz = -dy * sinP + dz * cosP;
      const H = evalHead(lx, ly, lz);
      body = smin(body, H.headD, 0.065);

      // Strong forelegs & hind legs with climbing claws
      const fl = sdCapsule(x, y, z, -0.20, -0.06 + by, 0.22, -0.20, -0.50 + P.flLift, 0.24 + P.fl, 0.102, 0.078);
      const fr = sdCapsule(x, y, z,  0.20, -0.06 + by, 0.22,  0.20, -0.50 + P.frLift, 0.24 + P.fr, 0.102, 0.078);
      const bl = sdCapsule(x, y, z, -0.21, -0.07 + by, -0.26, -0.21, -0.50 + P.blLift, -0.25 + P.bl, 0.108, 0.080);
      const br = sdCapsule(x, y, z,  0.21, -0.07 + by, -0.26,  0.21, -0.50 + P.brLift, -0.25 + P.br, 0.108, 0.080);

      const pawFL = sdEllipsoid(x, y, z, -0.20, -0.51 + P.flLift, 0.28 + P.fl, 0.086, 0.048, 0.106);
      const pawFR = sdEllipsoid(x, y, z,  0.20, -0.51 + P.frLift, 0.28 + P.fr, 0.086, 0.048, 0.106);
      const pawBL = sdEllipsoid(x, y, z, -0.21, -0.51 + P.blLift, -0.21 + P.bl, 0.088, 0.048, 0.108);
      const pawBR = sdEllipsoid(x, y, z,  0.21, -0.51 + P.brLift, -0.21 + P.br, 0.088, 0.048, 0.108);

      const legs = Math.min(
        Math.min(smin(fl, pawFL, 0.025), smin(fr, pawFR, 0.025)),
        Math.min(smin(bl, pawBL, 0.025), smin(br, pawBR, 0.025)),
      );
      body = smin(body, legs, 0.045);

      // Curved climbing claws on front paws
      const cFL = sdEllipsoid(x, y, z, -0.20, -0.52 + P.flLift, 0.37 + P.fl, 0.056, 0.024, 0.036);
      const cFR = sdEllipsoid(x, y, z,  0.20, -0.52 + P.frLift, 0.37 + P.fr, 0.056, 0.024, 0.036);
      const claws = Math.min(cFL, cFR);

      // Broad golden-cream chest bib extending down from throat
      const inBib = z > 0.28 && Math.abs(x) < 0.17 && y < 0.10 + by && y > -0.18 + by;

      let d = body;
      let mat = (H.isSpectacle && H.headD < body + 0.02) || inBib ? 'cream' : 'coat';
      if (claws < d) { d = claws; mat = 'claw'; }
      if (H.eyes < d) { d = H.eyes; mat = 'eye'; }
      if (H.glints < d) { d = H.glints; mat = 'glint'; }
      if (H.nose < d) { d = H.nose; mat = 'nose'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'glint') return 'W';
      if (mat === 'eye' || mat === 'nose') return 'k';
      if (mat === 'claw') return shade > 0.45 ? 'c1' : 'c0';

      // Subtle shaggy Andean bear fur texture
      const shag = Math.sin(x * 22 + z * 18) * Math.cos(y * 22) * 0.055;
      const s = shade + shag;
      if (mat === 'cream') {
        return s > 0.78 ? 'g3' : s > 0.52 ? 'g2' : s > 0.26 ? 'g1' : 'g0';
      }
      return s > 0.80 ? 'b4' : s > 0.60 ? 'b3' : s > 0.40 ? 'b2' : s > 0.20 ? 'b1' : 'b0';
    };

    pack = build27Pack(SPECTACLED_BEAR_PW, SPECTACLED_BEAR_PH, 1.04, 0.94, SPECTACLED_PAL, evalFn, shadeFn);
    spectacledCache.set(pose, pack);
  }
  return pack;
}

export function getSpectacledBearPosePack(...args: Parameters<typeof buildSpectacledBearPosePack>): ReturnType<typeof buildSpectacledBearPosePack> {
  return registerAnimalSpritePack(buildSpectacledBearPosePack(...args), { module: './SpectacledBear.ts', factory: 'getSpectacledBearPosePack', args }, buildSpectacledBearPosePack);
}

// ============================================================================
// INSTÂNCIA NA ARENA (SpectacledBear)
// ============================================================================
const SB_IDLE: readonly SpectacledBearPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const SB_WALK: readonly SpectacledBearPoseName[] = ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'];
const SB_FORAGE: readonly SpectacledBearPoseName[] = ['forage0', 'forage1', 'forage2', 'forage1'];
const SB_REAR: readonly SpectacledBearPoseName[] = ['rear0', 'rear1', 'rear2', 'rear3'];

function pickCycle<T>(frames: readonly T[], idx: number): T {
  return sampleAnimalCycle(frames, idx);
}

export class SpectacledBear extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private readonly home = new THREE.Vector3();
  private state: 'idle' | 'forage' | 'walk' | 'rear' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.6, 3.0);
  private targetYaw = rand(0, Math.PI * 2);
  private gaitPhase = rand(0, Math.PI * 2);

  private readonly centerY = 0.46;

  constructor(ctx: GameContext, startPos: THREE.Vector3) {
    super(ctx, getSpectacledBearPosePack('idle0').getView(2, 0)!, SPECTACLED_BEAR_PW, SPECTACLED_BEAR_PH, SPECTACLED_BEAR_W, SPECTACLED_BEAR_H, 'SpectacledBearBillboard');
    this.hp = 95;
    this.maxHp = 95;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.48;
    this.motor.height = 0.98;
    this.motor.teleport(startPos);
    this.home.copy(startPos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.54, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.set(this.position.x, this.position.y + this.centerY, this.position.z);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y + 0.26, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.74, this.position.z);
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
    this.vel.x += hit.dir.x * 3.4;
    this.vel.z += hit.dir.z * 3.4;
    this.vel.y = 2.8;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.state = 'rear';
      this.stateT = 0;
      this.stateDur = 1.6;
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
            this.state = r < 0.40 ? 'forage' : r < 0.85 ? 'walk' : 'rear';
            this.stateT = 0;
            this.stateDur = this.state === 'rear' ? rand(1.4, 2.2) : rand(2.0, 3.6);
            const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
            this.targetYaw = toHome > 8.0
              ? Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.5, 0.5)
              : this.facing + rand(-1.6, 1.6);
          }
        } else if (this.state === 'forage') {
          if (this.stateT >= this.stateDur) {
            this.state = 'walk';
            this.stateT = 0;
            this.stateDur = rand(2.0, 3.4);
          }
        } else if (this.state === 'walk') {
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 5.0);
          speed = 1.85;
          if (this.stateT >= this.stateDur && this.motor.grounded) {
            this.state = Math.random() < 0.5 ? 'forage' : 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.8, 3.2);
          }
        } else if (this.state === 'rear') {
          if (target && target.alive) {
            this.targetYaw = Math.atan2(target.position.x - this.position.x, target.position.z - this.position.z);
            this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 6);
          }
          if (this.stateT >= this.stateDur) {
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
          this.gaitPhase += dt * 5.2 * (0.65 + horiz * 0.24);
        }
      }
      this.syncHurtbox();
    }

    const horiz = Math.hypot(this.vel.x, this.vel.z);
    const bob = this.alive && this.motor.grounded && horiz > 0.2 && this.state === 'walk'
      ? Math.abs(Math.sin(this.gaitPhase)) * 0.028
      : 0;

    let pose: SpectacledBearPoseName;
    if (!this.alive) pose = 'idle0';
    else if (this.state === 'rear') pose = pickCycle(SB_REAR, this.stateT * 2.4);
    else if (this.state === 'forage') pose = pickCycle(SB_FORAGE, this.stateT * 2.4);
    else if (this.state === 'walk') pose = pickCycle(SB_WALK, (this.gaitPhase / Math.PI) * 2.6);
    else pose = pickCycle(SB_IDLE, this.stateT * 1.9);

    const deathSink = this.alive ? 0 : Math.min(0.24, this.deadT * 0.4);
    this.renderBillboard(getSpectacledBearPosePack(pose), this.position.y + this.centerY + bob - deathSink, camera, drawingBufferSize);
  }
}
