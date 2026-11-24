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
// GORILA COSTAS-PRATEADAS (Silverback Gorilla) — Flagship 66×62 @ ANIMAL_PPU
// ============================================================================
export type GorillaPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'walk0' | 'walk1' | 'walk2' | 'walk3' | 'walk4' | 'walk5'
  | 'beat0' | 'beat1' | 'beat2' | 'beat3'
  | 'charge0' | 'charge1' | 'charge2' | 'charge3';

export const GORILLA_PW = 66;
export const GORILLA_PH = 62;
export const GORILLA_W = GORILLA_PW / ANIMAL_PPU;
export const GORILLA_H = GORILLA_PH / ANIMAL_PPU;

/** 4-tone charcoal-black fur + silver-grey saddle ramp + dark-leather face/chest/hands. */
const GORILLA_PAL: Record<string, [number, number, number]> = {
  k:  [0x10, 0x10, 0x14], // crisp 1px outline / deep-set eyes / flared nostrils
  b0: [0x17, 0x18, 0x1e], // deep charcoal-black fur shadow
  b1: [0x26, 0x28, 0x32], // charcoal-black fur mid-dark
  b2: [0x3b, 0x3f, 0x4d], // cool slate-charcoal fur midtone
  b3: [0x54, 0x59, 0x6a], // cool slate fur highlight
  s0: [0x74, 0x79, 0x84], // silverback saddle shadow
  s1: [0x9c, 0xa2, 0xad], // silverback saddle mid-grey
  s2: [0xc4, 0xca, 0xd4], // bright silver-grey saddle
  s3: [0xe6, 0xea, 0xf0], // sunlit silverback highlight
  l0: [0x1e, 0x1b, 0x1f], // bare dark-leather face / pecs / knuckles shadow
  l1: [0x32, 0x2e, 0x35], // bare dark-leather midtone
  l2: [0x4c, 0x46, 0x50], // bare dark-leather brow / pec highlight
  W:  [0xfc, 0xfc, 0xf8], // crisp white eye glint
};

interface GorillaPose {
  mode: 'knuckle' | 'beat';
  bodyY: number;
  headY: number;
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
  beatPhase?: number; // alternating chest-pound fists
}

const GORILLA_POSES: Record<GorillaPoseName, GorillaPose> = {
  idle0: {
    mode: 'knuckle', bodyY: 0.0, headY: 0.0, headSway: 0.0, headPitch: 0.0,
    fl: 0, fr: 0, bl: 0, br: 0, flLift: 0, frLift: 0, blLift: 0, brLift: 0,
  },
  idle1: {
    mode: 'knuckle', bodyY: 0.015, headY: 0.02, headSway: 0.035, headPitch: -0.05,
    fl: 0, fr: 0, bl: 0, br: 0, flLift: 0, frLift: 0, blLift: 0, brLift: 0,
  },
  idle2: {
    mode: 'knuckle', bodyY: -0.012, headY: -0.015, headSway: -0.035, headPitch: 0.04,
    fl: 0, fr: 0, bl: 0, br: 0, flLift: 0, frLift: 0, blLift: 0, brLift: 0,
  },

  // 6-frame authentic heavy knuckle-walk
  walk0: {
    mode: 'knuckle', bodyY: 0.015, headY: 0.0, headSway: 0.02, headPitch: 0.02,
    fl: 0.20, fr: -0.14, bl: -0.16, br: 0.16, flLift: 0.10, frLift: 0.0, blLift: 0.0, brLift: 0.08,
  },
  walk1: {
    mode: 'knuckle', bodyY: 0.025, headY: 0.01, headSway: 0.01, headPitch: 0.03,
    fl: 0.10, fr: -0.04, bl: -0.07, br: 0.08, flLift: 0.04, frLift: 0.06, blLift: 0.06, brLift: 0.04,
  },
  walk2: {
    mode: 'knuckle', bodyY: -0.008, headY: -0.005, headSway: -0.01, headPitch: 0.01,
    fl: -0.04, fr: 0.10, bl: 0.07, br: -0.05, flLift: 0.0, frLift: 0.10, blLift: 0.08, brLift: 0.0,
  },
  walk3: {
    mode: 'knuckle', bodyY: 0.015, headY: 0.0, headSway: -0.02, headPitch: 0.02,
    fl: -0.14, fr: 0.20, bl: 0.16, br: -0.16, flLift: 0.0, frLift: 0.10, blLift: 0.08, brLift: 0.0,
  },
  walk4: {
    mode: 'knuckle', bodyY: 0.025, headY: 0.01, headSway: -0.01, headPitch: 0.03,
    fl: -0.04, fr: 0.10, bl: 0.08, br: -0.07, flLift: 0.06, frLift: 0.04, blLift: 0.04, brLift: 0.06,
  },
  walk5: {
    mode: 'knuckle', bodyY: -0.008, headY: -0.005, headSway: 0.01, headPitch: 0.01,
    fl: 0.10, fr: -0.04, bl: -0.05, br: 0.07, flLift: 0.10, frLift: 0.0, blLift: 0.0, brLift: 0.08,
  },

  // 4-frame rearing upright pounding its bare muscular chest with both fists!
  beat0: {
    mode: 'beat', bodyY: 0.0, headY: 0.0, headSway: 0.0, headPitch: -0.08,
    fl: 0, fr: 0, bl: 0, br: 0, flLift: 0, frLift: 0, blLift: 0, brLift: 0, beatPhase: 0,
  },
  beat1: {
    mode: 'beat', bodyY: 0.025, headY: 0.03, headSway: -0.03, headPitch: -0.14,
    fl: 0, fr: 0, bl: 0, br: 0, flLift: 0, frLift: 0, blLift: 0, brLift: 0, beatPhase: 1,
  },
  beat2: {
    mode: 'beat', bodyY: 0.015, headY: 0.02, headSway: 0.03, headPitch: -0.12,
    fl: 0, fr: 0, bl: 0, br: 0, flLift: 0, frLift: 0, blLift: 0, brLift: 0, beatPhase: 2,
  },
  beat3: {
    mode: 'beat', bodyY: 0.030, headY: 0.035, headSway: 0.0, headPitch: -0.16,
    fl: 0, fr: 0, bl: 0, br: 0, flLift: 0, frLift: 0, blLift: 0, brLift: 0, beatPhase: 3,
  },

  // 4-frame thundering knuckle-gallop charge!
  charge0: {
    mode: 'knuckle', bodyY: 0.03, headY: -0.03, headSway: 0.0, headPitch: 0.08,
    fl: 0.28, fr: 0.18, bl: -0.24, br: -0.14, flLift: 0.16, frLift: 0.10, blLift: 0.04, brLift: 0.0,
  },
  charge1: {
    mode: 'knuckle', bodyY: 0.06, headY: -0.04, headSway: 0.0, headPitch: 0.10,
    fl: 0.34, fr: 0.26, bl: -0.28, br: -0.20, flLift: 0.22, frLift: 0.18, blLift: 0.18, brLift: 0.12,
  },
  charge2: {
    mode: 'knuckle', bodyY: -0.01, headY: -0.02, headSway: 0.0, headPitch: 0.06,
    fl: -0.20, fr: -0.10, bl: 0.24, br: 0.16, flLift: 0.04, frLift: 0.10, blLift: 0.14, brLift: 0.08,
  },
  charge3: {
    mode: 'knuckle', bodyY: -0.03, headY: -0.03, headSway: 0.0, headPitch: 0.08,
    fl: -0.08, fr: 0.04, bl: 0.12, br: 0.02, flLift: 0.0, frLift: 0.04, blLift: 0.04, brLift: 0.0,
  },
};

const gorillaCache = new Map<GorillaPoseName, Boar27Pack>();

 function buildGorillaPosePack(pose: GorillaPoseName): Boar27Pack {
  let pack = gorillaCache.get(pose);
  if (!pack) {
    const P = GORILLA_POSES[pose];
    const by = P.bodyY;

    // Iconic domed sagittal-crest gorilla head in local pitched coordinates
    const evalHead = (lx: number, ly: number, lz: number) => {
      const cranium = sdEllipsoid(lx, ly, lz, 0, 0.04, 0.0, 0.165, 0.165, 0.175);
      // Prominent domed sagittal crest on top of skull!
      const crest = sdEllipsoid(lx, ly, lz, 0, 0.165, -0.035, 0.105, 0.105, 0.125);
      // Heavy overhanging brow ridge
      const brow = sdCapsule(lx, ly, lz, -0.105, 0.068, 0.135, 0.105, 0.068, 0.135, 0.046, 0.046);
      // Strong protruding jaw & face
      const face = sdEllipsoid(lx, ly, lz, 0, -0.045, 0.125, 0.125, 0.115, 0.120);
      const earL = sdEllipsoid(lx, ly, lz, -0.165, 0.02, -0.01, 0.032, 0.048, 0.028);
      const earR = sdEllipsoid(lx, ly, lz,  0.165, 0.02, -0.01, 0.032, 0.048, 0.028);

      let headFur = smin(smin(cranium, crest, 0.05), Math.min(earL, earR), 0.02);
      const headLeather = smin(brow, face, 0.04);

      // Deep-set intense dark eyes under brow ridge + crisp white glint + broad flared nostrils
      const eyeL = sdEllipsoid(lx, ly, lz, -0.058, 0.026, 0.162, 0.022, 0.020, 0.020);
      const eyeR = sdEllipsoid(lx, ly, lz,  0.058, 0.026, 0.162, 0.022, 0.020, 0.020);
      const eyes = Math.min(eyeL, eyeR);

      const glintL = sdEllipsoid(lx, ly, lz, -0.064, 0.033, 0.178, 0.010, 0.010, 0.010);
      const glintR = sdEllipsoid(lx, ly, lz,  0.064, 0.033, 0.178, 0.010, 0.010, 0.010);
      const glints = Math.min(glintL, glintR);

      const nosL = sdEllipsoid(lx, ly, lz, -0.034, -0.026, 0.236, 0.022, 0.016, 0.016);
      const nosR = sdEllipsoid(lx, ly, lz,  0.034, -0.026, 0.236, 0.022, 0.016, 0.016);
      const nostrils = Math.min(nosL, nosR);

      return { headFur, headLeather, eyes, glints, nostrils };
    };

    const evalFn: SdfEvaluator = (x, y, z) => {
      if (P.mode === 'beat') {
        // Rearing upright pounding its bare muscular chest with both fists!
        const bp = P.beatPhase ?? 0;
        const lHit = bp === 1 || bp === 3;
        const rHit = bp === 2 || bp === 3;

        const hips = sdEllipsoid(x, y, z, 0, -0.22 + by, -0.04, 0.28, 0.22, 0.24);
        const belly = sdEllipsoid(x, y, z, 0, -0.06 + by, 0.02, 0.30, 0.24, 0.25);
        const shoulders = sdEllipsoid(x, y, z, 0, 0.18 + by, -0.02, 0.34, 0.22, 0.24);
        const pecs = sdEllipsoid(x, y, z, 0, 0.14 + by, 0.16, 0.24, 0.16, 0.14);

        const hy = 0.42 + by + P.headY;
        const hz = 0.05;
        const cosP = Math.cos(P.headPitch);
        const sinP = Math.sin(P.headPitch);
        const dx = x - P.headSway;
        const dy = y - hy;
        const dz = z - hz;
        const lx = dx;
        const ly = dy * cosP + dz * sinP;
        const lz = -dy * sinP + dz * cosP;
        const H = evalHead(lx, ly, lz);

        // Massive arms bending inward to pound the chest!
        const lFistX = lHit ? -0.14 : -0.34;
        const lFistZ = lHit ? 0.28 : 0.24;
        const rFistX = rHit ? 0.14 : 0.34;
        const rFistZ = rHit ? 0.28 : 0.24;

        const armLU = sdCapsule(x, y, z, -0.30, 0.20 + by, -0.02, -0.40, 0.04 + by, 0.10, 0.115, 0.095);
        const armLL = sdCapsule(x, y, z, -0.40, 0.04 + by, 0.10, lFistX, 0.14 + by, lFistZ, 0.092, 0.082);
        const fistL = sdEllipsoid(x, y, z, lFistX, 0.14 + by, lFistZ + 0.03, 0.088, 0.082, 0.082);

        const armRU = sdCapsule(x, y, z,  0.30, 0.20 + by, -0.02,  0.40, 0.04 + by, 0.10, 0.115, 0.095);
        const armRL = sdCapsule(x, y, z,  0.40, 0.04 + by, 0.10, rFistX, 0.14 + by, rFistZ, 0.092, 0.082);
        const fistR = sdEllipsoid(x, y, z, rFistX, 0.14 + by, rFistZ + 0.03, 0.088, 0.082, 0.082);

        // Stocky braced hind legs
        const legL = sdCapsule(x, y, z, -0.20, -0.24 + by, -0.04, -0.22, -0.56, 0.02, 0.125, 0.090);
        const legR = sdCapsule(x, y, z,  0.20, -0.24 + by, -0.04,  0.22, -0.56, 0.02, 0.125, 0.090);
        const footL = sdEllipsoid(x, y, z, -0.22, -0.57, 0.08, 0.095, 0.045, 0.125);
        const footR = sdEllipsoid(x, y, z,  0.22, -0.57, 0.08, 0.095, 0.045, 0.125);

        let fur = smin(smin(hips, belly, 0.09), shoulders, 0.09);
        fur = smin(fur, H.headFur, 0.06);
        fur = smin(fur, Math.min(smin(armLU, armLL, 0.04), smin(armRU, armRL, 0.04)), 0.05);
        fur = smin(fur, Math.min(smin(legL, footL, 0.03), smin(legR, footR, 0.03)), 0.045);

        const leather = Math.min(Math.min(H.headLeather, pecs), Math.min(fistL, fistR));

        let d = smin(fur, leather, 0.035);
        let mat = leather < fur + 0.01 ? 'leather' : 'fur';
        // Distinctive silver-grey saddle across back & flanks!
        if (mat === 'fur' && z < -0.10 && y > -0.26 + by && y < 0.20 + by) mat = 'silver';
        if (H.eyes < d) { d = H.eyes; mat = 'eye'; }
        if (H.glints < d) { d = H.glints; mat = 'glint'; }
        if (H.nostrils < d) { d = H.nostrils; mat = 'nostril'; }
        return { d, mat };
      }

      // Classic knuckle-walking great-ape stance (high broad shoulders sloping down to stocky hips, NO tail!)
      const shoulders = sdEllipsoid(x, y, z, 0, 0.18 + by, 0.18, 0.34, 0.25, 0.27);
      const back = sdEllipsoid(x, y, z, 0, 0.06 + by, -0.10, 0.31, 0.25, 0.30);
      const hips = sdEllipsoid(x, y, z, 0, -0.06 + by, -0.32, 0.27, 0.22, 0.22);
      const pecs = sdEllipsoid(x, y, z, 0, 0.06 + by, 0.36, 0.24, 0.16, 0.13);

      // Head nestled into massive hunched shoulders
      const hy = 0.28 + by + P.headY;
      const hz = 0.42;
      const cosP = Math.cos(P.headPitch);
      const sinP = Math.sin(P.headPitch);
      const dx = x - P.headSway;
      const dy = y - hy;
      const dz = z - hz;
      const lx = dx;
      const ly = dy * cosP + dz * sinP;
      const lz = -dy * sinP + dz * cosP;
      const H = evalHead(lx, ly, lz);

      // Long massive arms supporting knuckle-walking stance
      const armL = sdCapsule(x, y, z, -0.29, 0.14 + by, 0.22, -0.28, -0.52 + P.flLift, 0.28 + P.fl, 0.125, 0.095);
      const armR = sdCapsule(x, y, z,  0.29, 0.14 + by, 0.22,  0.28, -0.52 + P.frLift, 0.28 + P.fr, 0.125, 0.095);
      const knuckL = sdEllipsoid(x, y, z, -0.28, -0.53 + P.flLift, 0.30 + P.fl, 0.098, 0.056, 0.098);
      const knuckR = sdEllipsoid(x, y, z,  0.28, -0.53 + P.frLift, 0.30 + P.fr, 0.098, 0.056, 0.098);

      // Stocky hind legs
      const legL = sdCapsule(x, y, z, -0.22, -0.10 + by, -0.28, -0.22, -0.52 + P.blLift, -0.26 + P.bl, 0.122, 0.086);
      const legR = sdCapsule(x, y, z,  0.22, -0.10 + by, -0.28,  0.22, -0.52 + P.brLift, -0.26 + P.br, 0.122, 0.086);
      const footL = sdEllipsoid(x, y, z, -0.22, -0.53 + P.blLift, -0.20 + P.bl, 0.092, 0.046, 0.115);
      const footR = sdEllipsoid(x, y, z,  0.22, -0.53 + P.brLift, -0.20 + P.br, 0.092, 0.046, 0.115);

      let fur = smin(smin(shoulders, back, 0.10), hips, 0.09);
      fur = smin(fur, H.headFur, 0.07);
      fur = smin(fur, Math.min(armL, armR), 0.055);
      fur = smin(fur, Math.min(smin(legL, footL, 0.03), smin(legR, footR, 0.03)), 0.045);

      const leather = Math.min(Math.min(H.headLeather, pecs), Math.min(knuckL, knuckR));

      let d = smin(fur, leather, 0.035);
      let mat = leather < fur + 0.01 ? 'leather' : 'fur';
      // True Silverback: distinctive silver-grey saddle across the back & upper flanks!
      if (mat === 'fur' && z > -0.38 && z < 0.10 && y > -0.02 + by) mat = 'silver';
      if (H.eyes < d) { d = H.eyes; mat = 'eye'; }
      if (H.glints < d) { d = H.glints; mat = 'glint'; }
      if (H.nostrils < d) { d = H.nostrils; mat = 'nostril'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'glint') return 'W';
      if (mat === 'eye' || mat === 'nostril') return 'k';
      if (mat === 'leather') {
        return shade > 0.65 ? 'l2' : shade > 0.32 ? 'l1' : 'l0';
      }
      const shag = Math.sin(x * 22 + z * 16) * Math.cos(y * 22) * 0.05;
      const s = shade + shag;
      if (mat === 'silver') {
        return s > 0.78 ? 's3' : s > 0.52 ? 's2' : s > 0.26 ? 's1' : 's0';
      }
      return s > 0.76 ? 'b3' : s > 0.50 ? 'b2' : s > 0.24 ? 'b1' : 'b0';
    };

    pack = build27Pack(GORILLA_PW, GORILLA_PH, 1.12, 1.04, GORILLA_PAL, evalFn, shadeFn);
    gorillaCache.set(pose, pack);
  }
  return pack;
}

export function getGorillaPosePack(...args: Parameters<typeof buildGorillaPosePack>): ReturnType<typeof buildGorillaPosePack> {
  return registerAnimalSpritePack(buildGorillaPosePack(...args), { module: './Gorilla.ts', factory: 'getGorillaPosePack', args }, buildGorillaPosePack);
}

// ============================================================================
// INSTÂNCIA NA ARENA (Gorilla)
// ============================================================================
const GOR_IDLE: readonly GorillaPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const GOR_WALK: readonly GorillaPoseName[] = ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'];
const GOR_BEAT: readonly GorillaPoseName[] = ['beat0', 'beat1', 'beat2', 'beat3'];
const GOR_CHARGE: readonly GorillaPoseName[] = ['charge0', 'charge1', 'charge2', 'charge3'];

function pickCycle<T>(frames: readonly T[], idx: number): T {
  return sampleAnimalCycle(frames, idx);
}

export class Gorilla extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private readonly home = new THREE.Vector3();
  private state: 'idle' | 'walk' | 'beat' | 'charge' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.6, 3.0);
  private targetYaw = rand(0, Math.PI * 2);
  private gaitPhase = rand(0, Math.PI * 2);
  private provoked = false;

  private readonly centerY = 0.52;

  constructor(ctx: GameContext, startPos: THREE.Vector3) {
    super(ctx, getGorillaPosePack('idle0').getView(2, 0)!, GORILLA_PW, GORILLA_PH, GORILLA_W, GORILLA_H, 'GorillaBillboard');
    this.hp = 130;
    this.maxHp = 130;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.54;
    this.motor.height = 1.12;
    this.motor.teleport(startPos);
    this.home.copy(startPos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.60, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.set(this.position.x, this.position.y + this.centerY, this.position.z);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y + 0.28, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.86, this.position.z);
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
    this.vel.x += hit.dir.x * 2.6;
    this.vel.z += hit.dir.z * 2.6;
    this.vel.y = 2.2;
    this.provoked = true;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.state = 'beat';
      this.stateT = 0;
      this.stateDur = 1.2;
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
            this.state = Math.random() < 0.30 ? 'beat' : 'walk';
            this.stateT = 0;
            this.stateDur = this.state === 'beat' ? rand(1.4, 2.2) : rand(2.2, 3.8);
            const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
            this.targetYaw = toHome > 8.5
              ? Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.5, 0.5)
              : this.facing + rand(-1.6, 1.6);
          }
        } else if (this.state === 'walk') {
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 4.5);
          speed = 1.9;
          if (this.stateT >= this.stateDur && this.motor.grounded) {
            this.state = Math.random() < 0.35 ? 'beat' : 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.5, 2.8);
          }
        } else if (this.state === 'beat') {
          if (target && target.alive) {
            this.targetYaw = Math.atan2(target.position.x - this.position.x, target.position.z - this.position.z);
            this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 6);
          }
          if (this.stateT >= this.stateDur) {
            this.state = this.provoked && dist < 6.5 ? 'charge' : 'idle';
            this.stateT = 0;
            this.stateDur = this.state === 'charge' ? 2.2 : rand(1.5, 2.6);
          }
        } else if (this.state === 'charge') {
          if (target && target.alive) {
            this.targetYaw = Math.atan2(target.position.x - this.position.x, target.position.z - this.position.z);
            this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 7);
            speed = 4.8;
          }
          if (this.stateT >= this.stateDur && dist > 6.5) {
            this.provoked = false;
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
          this.gaitPhase += dt * 5.0 * (0.65 + horiz * 0.24);
        }
      }
      this.syncHurtbox();
    }

    const horiz = Math.hypot(this.vel.x, this.vel.z);
    const bob = this.alive && this.motor.grounded && horiz > 0.2
      ? Math.abs(Math.sin(this.gaitPhase)) * 0.030
      : 0;

    let pose: GorillaPoseName;
    if (!this.alive) pose = 'idle0';
    else if (this.state === 'beat') pose = pickCycle(GOR_BEAT, this.stateT * 5.5);
    else if (this.state === 'charge') pose = pickCycle(GOR_CHARGE, (this.gaitPhase / Math.PI) * 2.6);
    else if (this.state === 'walk') pose = pickCycle(GOR_WALK, (this.gaitPhase / Math.PI) * 2.4);
    else pose = pickCycle(GOR_IDLE, this.stateT * 1.8);

    const deathSink = this.alive ? 0 : Math.min(0.28, this.deadT * 0.45);
    this.renderBillboard(getGorillaPosePack(pose), this.position.y + this.centerY + bob - deathSink, camera, drawingBufferSize);
  }
}
