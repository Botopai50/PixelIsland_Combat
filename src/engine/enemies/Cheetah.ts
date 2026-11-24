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

function pickCycle<T>(frames: readonly T[], idx: number): T {
  return sampleAnimalCycle(frames, idx);
}

// ============================================================================
// GUEPARDO (Cheetah) — 62×46 @ 56 PPU (1.11m × 0.82m)
// ============================================================================
export type CheetahPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'walk0' | 'walk1' | 'walk2' | 'walk3' | 'walk4' | 'walk5'
  | 'sprint0' | 'sprint1' | 'sprint2' | 'sprint3' | 'sprint4' | 'sprint5';

export const CHEETAH_PW = 62;
export const CHEETAH_PH = 46;
export const CHEETAH_W = CHEETAH_PW / ANIMAL_PPU;
export const CHEETAH_H = CHEETAH_PH / ANIMAL_PPU;

const CHEETAH_PAL: Record<string, [number, number, number]> = {
  k:  [0x14, 0x10, 0x0d], // crisp 1px dark outline / solid round spots / tear marks / tail rings / nose
  g0: [0x9a, 0x6b, 0x2d], // deep honey-tan shadow
  g1: [0xc7, 0x92, 0x42], // warm golden-buff coat
  g2: [0xe3, 0xb3, 0x62], // bright honey-tan midtone
  g3: [0xf4, 0xce, 0x82], // sunlit golden-buff highlight
  g4: [0xfc, 0xe4, 0xae], // crisp sunlit top rim sheen
  c0: [0xd9, 0xcc, 0xb2], // cream-white belly / throat shadow
  W:  [0xfa, 0xf6, 0xea], // pure cream-white throat, chest, belly, tail tip & eye glint
  e:  [0xff, 0xb4, 0x22], // bright amber-gold eyes
};

interface CheetahPose {
  bodyY: number;
  spineFlex: number;
  headY: number;
  headZ: number;
  headPitch: number;
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
  tailStraight: number;
}

const CHEETAH_POSES: Record<CheetahPoseName, CheetahPose> = {
  // Noble poised alert idle
  idle0: {
    bodyY: 0.0, spineFlex: 0.0, headY: 0.0, headZ: 0.0, headPitch: 0.02,
    flSwing: 0.02, flLift: 0.0, frSwing: -0.02, frLift: 0.0,
    blSwing: -0.02, blLift: 0.0, brSwing: 0.02, brLift: 0.0,
    tailLift: -0.06, tailSway: 0.06, tailStraight: 0.0,
  },
  idle1: {
    bodyY: 0.014, spineFlex: 0.0, headY: 0.02, headZ: 0.01, headPitch: 0.06,
    flSwing: 0.02, flLift: 0.0, frSwing: -0.02, frLift: 0.0,
    blSwing: -0.02, blLift: 0.0, brSwing: 0.02, brLift: 0.0,
    tailLift: 0.02, tailSway: 0.14, tailStraight: 0.0,
  },
  idle2: {
    bodyY: -0.01, spineFlex: 0.0, headY: -0.01, headZ: 0.015, headPitch: -0.03,
    flSwing: 0.02, flLift: 0.0, frSwing: -0.02, frLift: 0.0,
    blSwing: -0.02, blLift: 0.0, brSwing: 0.02, brLift: 0.0,
    tailLift: -0.09, tailSway: -0.14, tailStraight: 0.0,
  },

  // 6-frame graceful long-legged stalking stride
  walk0: {
    bodyY: -0.015, spineFlex: 0.0, headY: -0.025, headZ: 0.04, headPitch: -0.03,
    flSwing: 0.24, flLift: 0.14, frSwing: -0.18, frLift: 0.0,
    blSwing: -0.20, blLift: 0.0, brSwing: 0.20, brLift: 0.12,
    tailLift: -0.04, tailSway: 0.08, tailStraight: 0.25,
  },
  walk1: {
    bodyY: 0.005, spineFlex: 0.0, headY: -0.015, headZ: 0.05, headPitch: -0.02,
    flSwing: 0.12, flLift: 0.04, frSwing: -0.06, frLift: 0.08,
    blSwing: -0.08, blLift: 0.08, brSwing: 0.10, brLift: 0.04,
    tailLift: -0.02, tailSway: 0.03, tailStraight: 0.25,
  },
  walk2: {
    bodyY: -0.025, spineFlex: 0.0, headY: -0.035, headZ: 0.04, headPitch: -0.04,
    flSwing: -0.05, flLift: 0.0, frSwing: 0.12, frLift: 0.16,
    blSwing: 0.10, blLift: 0.14, brSwing: -0.05, brLift: 0.0,
    tailLift: -0.06, tailSway: -0.04, tailStraight: 0.25,
  },
  walk3: {
    bodyY: -0.015, spineFlex: 0.0, headY: -0.025, headZ: 0.04, headPitch: -0.03,
    flSwing: -0.18, flLift: 0.0, frSwing: 0.24, frLift: 0.14,
    blSwing: 0.20, blLift: 0.12, brSwing: -0.20, brLift: 0.0,
    tailLift: -0.04, tailSway: -0.08, tailStraight: 0.25,
  },
  walk4: {
    bodyY: 0.005, spineFlex: 0.0, headY: -0.015, headZ: 0.05, headPitch: -0.02,
    flSwing: -0.06, flLift: 0.08, frSwing: 0.12, frLift: 0.04,
    blSwing: 0.10, blLift: 0.04, brSwing: -0.08, brLift: 0.08,
    tailLift: -0.02, tailSway: -0.03, tailStraight: 0.25,
  },
  walk5: {
    bodyY: -0.025, spineFlex: 0.0, headY: -0.035, headZ: 0.04, headPitch: -0.04,
    flSwing: 0.12, flLift: 0.16, frSwing: -0.05, frLift: 0.0,
    blSwing: -0.05, blLift: 0.0, brSwing: 0.10, brLift: 0.14,
    tailLift: -0.06, tailSway: 0.04, tailStraight: 0.25,
  },

  // 6-frame full-extension high-speed cheetah gallop with long tail streaming straight behind
  sprint0: {
    bodyY: -0.03, spineFlex: 0.07, headY: -0.05, headZ: 0.08, headPitch: -0.06,
    flSwing: -0.22, flLift: 0.18, frSwing: -0.30, frLift: 0.08,
    blSwing: 0.34, blLift: 0.26, brSwing: 0.24, brLift: 0.16,
    tailLift: 0.14, tailSway: -0.03, tailStraight: 0.95,
  },
  sprint1: {
    bodyY: 0.04, spineFlex: -0.04, headY: -0.06, headZ: 0.12, headPitch: -0.08,
    flSwing: 0.28, flLift: 0.36, frSwing: 0.16, frLift: 0.24,
    blSwing: -0.24, blLift: 0.14, brSwing: -0.34, brLift: 0.24,
    tailLift: 0.18, tailSway: 0.0, tailStraight: 1.0,
  },
  sprint2: {
    bodyY: 0.07, spineFlex: -0.08, headY: -0.07, headZ: 0.15, headPitch: -0.10,
    flSwing: 0.46, flLift: 0.46, frSwing: 0.36, frLift: 0.36,
    blSwing: -0.42, blLift: 0.42, brSwing: -0.34, brLift: 0.32,
    tailLift: 0.20, tailSway: 0.02, tailStraight: 1.0,
  },
  sprint3: {
    bodyY: 0.02, spineFlex: -0.02, headY: -0.06, headZ: 0.12, headPitch: -0.08,
    flSwing: 0.34, flLift: 0.12, frSwing: 0.40, frLift: 0.28,
    blSwing: -0.22, blLift: 0.30, brSwing: -0.12, brLift: 0.18,
    tailLift: 0.16, tailSway: 0.02, tailStraight: 0.95,
  },
  sprint4: {
    bodyY: -0.04, spineFlex: 0.05, headY: -0.05, headZ: 0.09, headPitch: -0.05,
    flSwing: 0.06, flLift: 0.0, frSwing: 0.16, frLift: 0.05,
    blSwing: 0.18, blLift: 0.24, brSwing: 0.28, brLift: 0.32,
    tailLift: 0.12, tailSway: 0.0, tailStraight: 0.90,
  },
  sprint5: {
    bodyY: -0.05, spineFlex: 0.08, headY: -0.05, headZ: 0.07, headPitch: -0.04,
    flSwing: -0.28, flLift: 0.24, frSwing: -0.14, frLift: 0.10,
    blSwing: 0.36, blLift: 0.14, brSwing: 0.26, brLift: 0.06,
    tailLift: 0.10, tailSway: -0.02, tailStraight: 0.90,
  },
};

const cheetahCache = new Map<CheetahPoseName, Boar27Pack>();
 function buildCheetahPosePack(pose: CheetahPoseName): Boar27Pack {
  let pack = cheetahCache.get(pose);
  if (!pack) {
    const P = CHEETAH_POSES[pose];
    const by = P.bodyY;
    const hPivotY = 0.27 + by + P.headY;
    const hPivotZ = 0.50 + P.headZ;
    const cosP = Math.cos(P.headPitch);
    const sinP = Math.sin(P.headPitch);

    const evalFn: SdfEvaluator = (x, y, z) => {
      // 1. Greyhound-like big-cat proportions: deep narrow chest, sharply tucked slender waist, lean haunches
      const chest = sdEllipsoid(x, y, z, 0, 0.02 + by, 0.22, 0.155, 0.195, 0.245);
      const brisket = sdEllipsoid(x, y, z, 0, -0.09 + by, 0.26, 0.115, 0.105, 0.15);
      const scapulaL = sdEllipsoid(x, y, z, -0.085, 0.14 + by, 0.20, 0.075, 0.095, 0.15);
      const scapulaR = sdEllipsoid(x, y, z,  0.085, 0.14 + by, 0.20, 0.075, 0.095, 0.15);
      const waist = sdEllipsoid(x, y, z, 0, 0.085 + by + P.spineFlex, -0.09, 0.102, 0.102, 0.26);
      const rump = sdEllipsoid(x, y, z, 0, 0.06 + by, -0.35, 0.148, 0.155, 0.21);
      const neck = sdCapsule(x, y, z, 0, 0.11 + by, 0.29, 0, hPivotY - 0.01, hPivotZ - 0.02, 0.112, 0.088);

      let fur = smin(chest, brisket, 0.06);
      fur = smin(fur, Math.min(scapulaL, scapulaR), 0.055);
      fur = smin(fur, waist, 0.095);
      fur = smin(fur, rump, 0.095);
      fur = smin(fur, neck, 0.075);

      // 2. Small refined rounded feline head in pitch-rotated local space
      const dy = y - hPivotY;
      const dz = z - hPivotZ;
      const lx = x;
      const lz = dz * cosP + dy * sinP;
      const ly = -dz * sinP + dy * cosP;

      const skull = sdEllipsoid(lx, ly, lz, 0, 0.012, 0.01, 0.106, 0.100, 0.122);
      const muzzle = sdCapsule(lx, ly, lz, 0, -0.012, 0.07, 0, -0.026, 0.192, 0.058, 0.042);
      const earL = sdEllipsoid(lx, ly, lz, -0.084, 0.095, -0.018, 0.034, 0.038, 0.026);
      const earR = sdEllipsoid(lx, ly, lz,  0.084, 0.095, -0.018, 0.034, 0.038, 0.026);

      let headD = smin(skull, muzzle, 0.030);
      headD = smin(headD, Math.min(earL, earR), 0.016);
      fur = smin(fur, headD, 0.048);

      // 3. Long thin athletic legs with distinct knees/hocks, ankles & sleek paws
      const frontLeg = (sx: number, swing: number, lift: number) => {
        const shY = 0.01 + by, shZ = 0.24;
        const elY = -0.26 + by * 0.45 + lift * 0.18;
        const elZ = 0.16 + swing * 0.52;
        const pwY = -0.58 + lift * 0.34;
        const pwZ = 0.25 + swing * 1.14;
        const upper = sdCapsule(x, y, z, sx, shY, shZ, sx, elY, elZ, 0.068, 0.040);
        const lower = sdCapsule(x, y, z, sx, elY, elZ, sx, pwY, pwZ, 0.038, 0.028);
        const paw = sdEllipsoid(x, y, z, sx, pwY - 0.01, pwZ + 0.038, 0.044, 0.026, 0.058);
        return smin(smin(upper, lower, 0.024), paw, 0.020);
      };
      const hindLeg = (sx: number, swing: number, lift: number) => {
        const hipY = 0.04 + by, hipZ = -0.33;
        const thigh = sdEllipsoid(x, y, z, sx * 1.04, -0.03 + by, -0.33 + swing * 0.16, 0.076, 0.122, 0.105);
        const hkY = -0.27 + by * 0.45 + lift * 0.18;
        const hkZ = -0.47 + (swing < 0 ? swing * 0.38 : swing * 0.65);
        const pwY = -0.58 + lift * 0.34;
        const pwZ = -0.36 + (swing < 0 ? swing * 1.26 : swing * 0.96);
        const upper = sdCapsule(x, y, z, sx, hipY, hipZ, sx, hkY, hkZ, 0.070, 0.038);
        const lower = sdCapsule(x, y, z, sx, hkY, hkZ, sx, pwY, pwZ, 0.036, 0.026);
        const paw = sdEllipsoid(x, y, z, sx, pwY - 0.01, pwZ + 0.038, 0.044, 0.026, 0.058);
        return smin(smin(thigh, upper, 0.032), smin(lower, paw, 0.020), 0.024);
      };

      const legs = Math.min(
        Math.min(frontLeg(-0.118, P.flSwing, P.flLift), frontLeg(0.118, P.frSwing, P.frLift)),
        Math.min(hindLeg(-0.124, P.blSwing, P.blLift), hindLeg(0.124, P.brSwing, P.brLift)),
      );
      fur = smin(fur, legs, 0.036);

      // 4. Long sleek balance tail with crisp black rings and bright white tip
      const drop = (1.0 - P.tailStraight) * 0.14;
      const t1X = P.tailSway * 0.35;
      const t1Y = 0.02 + by * 0.5 - drop + P.tailLift * 0.40;
      const t1Z = -0.72;
      const t2X = P.tailSway * 0.85;
      const t2Y = 0.02 - drop * 0.7 + P.tailLift * 0.85;
      const t2Z = -1.02;
      const t3X = P.tailSway * 1.1;
      const t3Y = 0.05 - drop * 0.2 + P.tailLift * 1.05;
      const t3Z = -1.20;
      const tail1 = sdCapsule(x, y, z, 0, 0.06 + by, -0.47, t1X, t1Y, t1Z, 0.038, 0.034);
      const tail2 = sdCapsule(x, y, z, t1X, t1Y, t1Z, t2X, t2Y, t2Z, 0.033, 0.030);
      const tail3 = sdCapsule(x, y, z, t2X, t2Y, t2Z, t3X, t3Y, t3Z, 0.030, 0.026);
      const tailD = smin(smin(tail1, tail2, 0.026), tail3, 0.024);
      fur = smin(fur, tailD, 0.036);

      // 5. Bright amber eyes & dark feline nose
      const eyeL = sdEllipsoid(lx, ly, lz, -0.064, 0.030, 0.102, 0.025, 0.022, 0.025);
      const eyeR = sdEllipsoid(lx, ly, lz,  0.064, 0.030, 0.102, 0.025, 0.022, 0.025);
      const eyes = Math.min(eyeL, eyeR);
      const nose = sdEllipsoid(lx, ly, lz, 0, -0.015, 0.222, 0.028, 0.020, 0.022);

      let d = fur, mat = 'fur';
      if (tailD < fur + 0.005 && z < -0.50) mat = 'tail';
      if (eyes < d) { d = eyes; mat = 'eye'; }
      if (nose < d) { d = nose; mat = 'nose'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'nose') return 'k';
      if (mat === 'eye') {
        const dy = y - hPivotY;
        const dz = z - hPivotZ;
        const ly = -dz * sinP + dy * cosP;
        if (ly > 0.038 && Math.abs(x) > 0.058) return 'W';
        return 'e';
      }

      // Long sleek ringed tail with crisp black rings and bright white tip
      if (mat === 'tail') {
        if (z < -1.07) return shade > 0.30 ? 'W' : 'c0';
        if (z < -0.68) {
          const ring = Math.floor((-z - 0.68) / 0.072);
          if (ring % 2 === 0) return 'k';
        }
        return shade > 0.72 ? 'g3' : shade > 0.42 ? 'g2' : 'g1';
      }

      // Face: crystal-clear jet-black tear marks curving from inner eyes down to mouth
      const dy = y - hPivotY;
      const dz = z - hPivotZ;
      const lz = dz * cosP + dy * sinP;
      const ly = -dz * sinP + dy * cosP;
      if (dz > -0.10 && ly > -0.12 && lz > -0.06) {
        // Curved jet-black tear marks
        const tearX = 0.044 + Math.max(0, 0.022 - ly) * 0.22;
        if (lz > 0.088 && ly < 0.024 && ly > -0.056 && Math.abs(Math.abs(x) - tearX) < 0.015) {
          return 'k';
        }
        // Dark ear backs
        if (ly > 0.082 && lz < -0.012) return 'k';
        // Pure cream-white chin & lower muzzle
        if (ly < -0.030 && lz > 0.03) return shade > 0.36 ? 'W' : 'c0';
      }

      // Pure cream-white throat, chest & belly
      if (y < -0.065 + by && Math.abs(x) < 0.125 && z > -0.34 && z < 0.38) {
        return shade > 0.40 ? 'W' : 'c0';
      }
      if (z > 0.26 && z < 0.44 && y < 0.14 + by && y > -0.14 + by && Math.abs(x) < 0.095) {
        return shade > 0.40 ? 'W' : 'c0';
      }

      // Realistic organic cheetah spots (2-3px readable solid dark spots with natural stagger)
      if (z > -0.52 && z < 0.36 && y > -0.38) {
        const cellS = 0.125;
        const row = Math.round(y / cellS);
        const jitterZ = Math.sin(row * 7.3 + Math.round(z / cellS) * 3.1) * 0.018;
        const zOff = (row & 1) !== 0 ? cellS * 0.5 : 0;
        const dzCell = (z + zOff + jitterZ) - Math.round((z + zOff + jitterZ) / cellS) * cellS;
        const dyCell = y - row * cellS;
        if (dzCell * dzCell + dyCell * dyCell < 0.00145) {
          return 'k';
        }
      }

      return shade > 0.82 ? 'g4' : shade > 0.58 ? 'g3' : shade > 0.34 ? 'g2' : shade > 0.16 ? 'g1' : 'g0';
    };

    pack = build27Pack(CHEETAH_PW, CHEETAH_PH, 1.16, 0.86, CHEETAH_PAL, evalFn, shadeFn);
    cheetahCache.set(pose, pack);
  }
  return pack;
}

export function getCheetahPosePack(...args: Parameters<typeof buildCheetahPosePack>): ReturnType<typeof buildCheetahPosePack> {
  return registerAnimalSpritePack(buildCheetahPosePack(...args), { module: './Cheetah.ts', factory: 'getCheetahPosePack', args }, buildCheetahPosePack);
}

// ============================================================================
// INSTÂNCIA NA ARENA (Cheetah)
// ============================================================================
const CHEETAH_IDLE: readonly CheetahPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const CHEETAH_WALK: readonly CheetahPoseName[] = ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'];
const CHEETAH_SPRINT: readonly CheetahPoseName[] = ['sprint0', 'sprint1', 'sprint2', 'sprint3', 'sprint4', 'sprint5'];

/**
 * Cheetah: stalks gracefully and bursts into high-speed sprints across the arena.
 */
export class Cheetah extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private readonly home = new THREE.Vector3();
  private state: 'idle' | 'walk' | 'sprint' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.4, 2.6);
  private targetYaw = rand(0, Math.PI * 2);
  private gaitPhase = rand(0, Math.PI * 2);

  constructor(ctx: GameContext, pos: THREE.Vector3) {
    super(ctx, getCheetahPosePack('idle0').getView(2, 0)!, CHEETAH_PW, CHEETAH_PH, CHEETAH_W, CHEETAH_H, 'CheetahBillboard');
    this.hp = 65;
    this.maxHp = 65;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.44;
    this.motor.height = 0.86;
    this.motor.teleport(pos);
    this.home.copy(pos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.48, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.set(this.position.x, this.position.y + 0.44, this.position.z);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y + 0.22, this.position.z);
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
    this.vel.x += hit.dir.x * 4.5;
    this.vel.z += hit.dir.z * 4.5;
    this.vel.y = 3.2;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.state = 'sprint';
      this.stateT = 0;
      this.stateDur = 2.4;
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
        const dist = target && target.alive
          ? Math.hypot(target.position.x - this.position.x, target.position.z - this.position.z)
          : 999;

        let speed = 0;
        if (dist < 3.4 && this.state !== 'sprint') {
          this.state = 'sprint';
          this.stateT = 0;
          this.stateDur = 2.2;
          if (target) {
            this.targetYaw = Math.atan2(this.position.x - target.position.x, this.position.z - target.position.z);
          }
        }

        if (this.state === 'idle') {
          if (this.stateT >= this.stateDur) {
            this.state = Math.random() < 0.72 ? 'walk' : 'sprint';
            this.stateT = 0;
            this.stateDur = this.state === 'sprint' ? rand(1.4, 2.2) : rand(2.0, 3.6);
            const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
            this.targetYaw = toHome > 9.0
              ? Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.4, 0.4)
              : this.facing + rand(-1.5, 1.5);
          }
        } else if (this.state === 'walk') {
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 6);
          speed = 2.6;
          if (this.stateT >= this.stateDur) {
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.2, 2.4);
          }
        } else if (this.state === 'sprint') {
          if (target && target.alive && dist < 4.5) {
            this.targetYaw = Math.atan2(this.position.x - target.position.x, this.position.z - target.position.z);
          }
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 11);
          speed = 7.4;
          if (this.stateT >= this.stateDur && dist > 4.5) {
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.2, 2.2);
          }
        }

        this.vel.x = damp(this.vel.x, Math.sin(this.facing) * speed, 10, dt);
        this.vel.z = damp(this.vel.z, Math.cos(this.facing) * speed, 10, dt);
        this.vel.y -= 20 * dt;
        this.motor.update(dt);

        const horiz = Math.hypot(this.vel.x, this.vel.z);
        if (horiz > 0.25 && this.motor.grounded) {
          this.gaitPhase += dt * 7.0 * (0.65 + horiz * 0.22);
        }
      }
      this.syncHurtbox();
    }

    let pose: CheetahPoseName;
    if (!this.alive) pose = 'idle0';
    else if (this.state === 'sprint') pose = pickCycle(CHEETAH_SPRINT, (this.gaitPhase / Math.PI) * 3.0);
    else if (this.state === 'walk') pose = pickCycle(CHEETAH_WALK, (this.gaitPhase / Math.PI) * 2.5);
    else pose = pickCycle(CHEETAH_IDLE, this.stateT * 2.0);

    const bob = this.alive && this.motor.grounded && (this.state === 'walk' || this.state === 'sprint')
      ? Math.abs(Math.sin(this.gaitPhase)) * (this.state === 'sprint' ? 0.05 : 0.03)
      : 0;
    const deathSink = this.alive ? 0 : Math.min(0.22, this.deadT * 0.4);
    this.renderBillboard(getCheetahPosePack(pose), this.position.y + 0.44 + bob - deathSink, camera, drawingBufferSize);
  }
}
