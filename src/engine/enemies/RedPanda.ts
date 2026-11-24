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
// PANDA VERMELHO (Red Panda) — 44×32 @ 56 PPU (0.79m × 0.57m)
// ============================================================================
export type RedPandaPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'walk0' | 'walk1' | 'walk2' | 'walk3' | 'walk4' | 'walk5'
  | 'curious0' | 'curious1' | 'curious2'
  | 'flee0' | 'flee1' | 'flee2' | 'flee3';

export const RED_PANDA_PW = 44;
export const RED_PANDA_PH = 32;
export const RED_PANDA_W = RED_PANDA_PW / ANIMAL_PPU;
export const RED_PANDA_H = RED_PANDA_PH / ANIMAL_PPU;

const RED_PANDA_PAL: Record<string, [number, number, number]> = {
  k:  [0x17, 0x10, 0x0e], // crisp 1px dark outline / glossy eyes / button nose / tail tip
  b0: [0x24, 0x17, 0x14], // deep espresso-black belly & fuzzy legs shadow
  b1: [0x3b, 0x26, 0x20], // espresso-black belly & legs midtone
  r0: [0x6e, 0x25, 0x11], // deep mahogany-rust shadow & tear stripes
  r1: [0xa1, 0x39, 0x18], // rich chestnut-red coat
  r2: [0xcf, 0x52, 0x1d], // fiery rust-orange midtone
  r3: [0xeb, 0x73, 0x2a], // vibrant sunlit red-panda orange
  r4: [0xf7, 0x9b, 0x48], // warm golden-rust top rim highlight
  c0: [0xcf, 0xb8, 0x9c], // warm cream shadow (tail rings / mask edge)
  c1: [0xeb, 0xd9, 0xbe], // warm cream midtone (tail rings)
  W:  [0xfc, 0xf7, 0xec], // bright cream-white facial mask, ear rims & eye glint
};

interface RedPandaPose {
  bodyY: number;
  rearUp: number;
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
}

const RED_PANDA_POSES: Record<RedPandaPoseName, RedPandaPose> = {
  // Gentle breathing + lush bushy tail sway
  idle0: {
    bodyY: 0.0, rearUp: 0.0, headY: 0.0, headZ: 0.0, headPitch: 0.02,
    flSwing: 0.02, flLift: 0.0, frSwing: -0.02, frLift: 0.0,
    blSwing: -0.02, blLift: 0.0, brSwing: 0.02, brLift: 0.0,
    tailLift: 0.02, tailSway: 0.06,
  },
  idle1: {
    bodyY: 0.015, rearUp: 0.0, headY: 0.02, headZ: 0.01, headPitch: 0.07,
    flSwing: 0.02, flLift: 0.0, frSwing: -0.02, frLift: 0.0,
    blSwing: -0.02, blLift: 0.0, brSwing: 0.02, brLift: 0.0,
    tailLift: 0.07, tailSway: 0.16,
  },
  idle2: {
    bodyY: -0.01, rearUp: 0.0, headY: -0.01, headZ: 0.015, headPitch: -0.03,
    flSwing: 0.02, flLift: 0.0, frSwing: -0.02, frLift: 0.0,
    blSwing: -0.02, blLift: 0.0, brSwing: 0.02, brLift: 0.0,
    tailLift: -0.02, tailSway: -0.14,
  },

  // 6-frame agile low-slung trot
  walk0: {
    bodyY: 0.0, rearUp: 0.0, headY: -0.01, headZ: 0.03, headPitch: -0.02,
    flSwing: 0.22, flLift: 0.14, frSwing: -0.18, frLift: 0.0,
    blSwing: -0.18, blLift: 0.0, brSwing: 0.20, brLift: 0.12,
    tailLift: 0.04, tailSway: 0.08,
  },
  walk1: {
    bodyY: 0.02, rearUp: 0.0, headY: 0.0, headZ: 0.04, headPitch: 0.0,
    flSwing: 0.10, flLift: 0.04, frSwing: -0.06, frLift: 0.08,
    blSwing: -0.06, blLift: 0.08, brSwing: 0.10, brLift: 0.04,
    tailLift: 0.06, tailSway: 0.03,
  },
  walk2: {
    bodyY: -0.015, rearUp: 0.0, headY: -0.02, headZ: 0.03, headPitch: -0.03,
    flSwing: -0.05, flLift: 0.0, frSwing: 0.10, frLift: 0.15,
    blSwing: 0.08, blLift: 0.14, brSwing: -0.05, brLift: 0.0,
    tailLift: 0.02, tailSway: -0.04,
  },
  walk3: {
    bodyY: 0.0, rearUp: 0.0, headY: -0.01, headZ: 0.03, headPitch: -0.02,
    flSwing: -0.18, flLift: 0.0, frSwing: 0.22, frLift: 0.14,
    blSwing: 0.20, blLift: 0.12, brSwing: -0.18, brLift: 0.0,
    tailLift: 0.04, tailSway: -0.08,
  },
  walk4: {
    bodyY: 0.02, rearUp: 0.0, headY: 0.0, headZ: 0.04, headPitch: 0.0,
    flSwing: -0.06, flLift: 0.08, frSwing: 0.10, frLift: 0.04,
    blSwing: 0.10, blLift: 0.04, brSwing: -0.06, brLift: 0.08,
    tailLift: 0.06, tailSway: -0.03,
  },
  walk5: {
    bodyY: -0.015, rearUp: 0.0, headY: -0.02, headZ: 0.03, headPitch: -0.03,
    flSwing: 0.10, flLift: 0.15, frSwing: -0.05, frLift: 0.0,
    blSwing: -0.05, blLift: 0.0, brSwing: 0.08, brLift: 0.14,
    tailLift: 0.02, tailSway: 0.04,
  },

  // Classic red panda curious/startled stand-up pose with raised front paws!
  curious0: {
    bodyY: 0.03, rearUp: 0.30, headY: 0.06, headZ: -0.04, headPitch: 0.10,
    flSwing: 0.14, flLift: 0.28, frSwing: 0.12, frLift: 0.24,
    blSwing: 0.04, blLift: 0.0, brSwing: 0.04, brLift: 0.0,
    tailLift: -0.06, tailSway: 0.04,
  },
  curious1: {
    bodyY: 0.06, rearUp: 0.58, headY: 0.13, headZ: -0.09, headPitch: 0.16,
    flSwing: 0.22, flLift: 0.56, frSwing: 0.20, frLift: 0.52,
    blSwing: 0.08, blLift: 0.0, brSwing: 0.08, brLift: 0.0,
    tailLift: -0.10, tailSway: 0.08,
  },
  curious2: {
    bodyY: 0.055, rearUp: 0.54, headY: 0.12, headZ: -0.08, headPitch: 0.12,
    flSwing: 0.20, flLift: 0.52, frSwing: 0.24, frLift: 0.58,
    blSwing: 0.08, blLift: 0.0, brSwing: 0.08, brLift: 0.0,
    tailLift: -0.09, tailSway: -0.08,
  },

  // 4-frame bounding flee
  flee0: {
    bodyY: -0.03, rearUp: 0.0, headY: -0.02, headZ: 0.06, headPitch: -0.06,
    flSwing: -0.16, flLift: 0.10, frSwing: -0.22, frLift: 0.04,
    blSwing: 0.24, blLift: 0.18, brSwing: 0.18, brLift: 0.12,
    tailLift: 0.14, tailSway: -0.06,
  },
  flee1: {
    bodyY: 0.05, rearUp: 0.0, headY: 0.01, headZ: 0.08, headPitch: -0.04,
    flSwing: 0.30, flLift: 0.30, frSwing: 0.22, frLift: 0.24,
    blSwing: -0.26, blLift: 0.26, brSwing: -0.20, brLift: 0.20,
    tailLift: 0.20, tailSway: 0.04,
  },
  flee2: {
    bodyY: 0.03, rearUp: 0.0, headY: -0.01, headZ: 0.07, headPitch: -0.05,
    flSwing: 0.24, flLift: 0.08, frSwing: 0.28, frLift: 0.18,
    blSwing: -0.14, blLift: 0.22, brSwing: -0.06, brLift: 0.14,
    tailLift: 0.16, tailSway: 0.06,
  },
  flee3: {
    bodyY: -0.04, rearUp: 0.0, headY: -0.03, headZ: 0.05, headPitch: -0.06,
    flSwing: -0.20, flLift: 0.16, frSwing: -0.10, frLift: 0.06,
    blSwing: 0.26, blLift: 0.10, brSwing: 0.18, brLift: 0.04,
    tailLift: 0.10, tailSway: -0.04,
  },
};

const redPandaCache = new Map<RedPandaPoseName, Boar27Pack>();
 function buildRedPandaPosePack(pose: RedPandaPoseName): Boar27Pack {
  let pack = redPandaCache.get(pose);
  if (!pack) {
    const P = RED_PANDA_POSES[pose];
    const by = P.bodyY;
    const ru = P.rearUp;
    const hPivotY = 0.17 + by + P.headY + ru * 0.24;
    const hPivotZ = 0.38 + P.headZ - ru * 0.16;
    const cosP = Math.cos(P.headPitch);
    const sinP = Math.sin(P.headPitch);

    const evalFn: SdfEvaluator = (x, y, z) => {
      // 1. Plump, agile red panda torso (rears up smoothly in curious poses)
      const chest = sdEllipsoid(x, y, z, 0, -0.01 + by + ru * 0.18, 0.16 - ru * 0.10, 0.205, 0.195, 0.235);
      const back = sdEllipsoid(x, y, z, 0, 0.04 + by + ru * 0.09, -0.04 - ru * 0.04, 0.20, 0.185, 0.24);
      const rump = sdEllipsoid(x, y, z, 0, -0.02 + by, -0.26, 0.205, 0.195, 0.215);
      const neck = sdCapsule(x, y, z, 0, 0.05 + by + ru * 0.16, 0.24 - ru * 0.10, 0, hPivotY - 0.02, hPivotZ - 0.03, 0.145, 0.125);

      let fur = smin(chest, back, 0.10);
      fur = smin(fur, rump, 0.10);
      fur = smin(fur, neck, 0.08);

      // 2. Iconic round fluffy red panda head in pitch-rotated local space
      const dy = y - hPivotY;
      const dz = z - hPivotZ;
      const lx = x;
      const lz = dz * cosP + dy * sinP;
      const ly = -dz * sinP + dy * cosP;

      const skull = sdEllipsoid(lx, ly, lz, 0, 0.01, 0.0, 0.155, 0.145, 0.155);
      const cheekL = sdEllipsoid(lx, ly, lz, -0.128, -0.025, 0.025, 0.092, 0.082, 0.088);
      const cheekR = sdEllipsoid(lx, ly, lz,  0.128, -0.025, 0.025, 0.092, 0.082, 0.088);
      const muzzle = sdEllipsoid(lx, ly, lz, 0, -0.032, 0.145, 0.082, 0.064, 0.086);

      let headD = smin(skull, Math.min(cheekL, cheekR), 0.045);
      headD = smin(headD, muzzle, 0.035);
      fur = smin(fur, headD, 0.055);

      // Pointed white-rimmed ears
      const earL = sdCapsule(lx, ly, lz, -0.105, 0.115, -0.015, -0.165, 0.255, -0.025, 0.060, 0.020);
      const earR = sdCapsule(lx, ly, lz,  0.105, 0.115, -0.015,  0.165, 0.255, -0.025, 0.060, 0.020);
      const earBack = Math.min(earL, earR);
      fur = smin(fur, earBack, 0.025);

      const earInL = sdCapsule(lx, ly, lz, -0.102, 0.125, 0.018, -0.155, 0.235, 0.010, 0.042, 0.016);
      const earInR = sdCapsule(lx, ly, lz,  0.102, 0.125, 0.018,  0.155, 0.235, 0.010, 0.042, 0.016);
      const earInner = Math.min(earInL, earInR);

      // 3. Four short, fuzzy espresso-black legs with paws
      const frontLeg = (sx: number, swing: number, lift: number) => {
        const shY = -0.04 + by + ru * 0.18;
        const shZ = 0.19 - ru * 0.10;
        const elY = -0.22 + by * 0.5 + lift * 0.22 + ru * 0.16;
        const elZ = 0.16 + swing * 0.42 - ru * 0.04;
        const pwY = -0.40 + lift * 0.36 + ru * 0.14;
        const pwZ = 0.20 + swing * 0.85 + ru * 0.08;
        const upper = sdCapsule(x, y, z, sx, shY, shZ, sx, elY, elZ, 0.084, 0.062);
        const lower = sdCapsule(x, y, z, sx, elY, elZ, sx, pwY, pwZ, 0.058, 0.046);
        const paw = sdEllipsoid(x, y, z, sx, pwY - 0.01, pwZ + 0.036, 0.060, 0.036, 0.068);
        return smin(smin(upper, lower, 0.03), paw, 0.025);
      };
      const hindLeg = (sx: number, swing: number, lift: number) => {
        const hipY = -0.04 + by;
        const hipZ = -0.24;
        const hkY = -0.22 + by * 0.5 + lift * 0.18;
        const hkZ = -0.32 + swing * 0.40;
        const pwY = -0.40 + lift * 0.28;
        const pwZ = -0.25 + swing * 0.85;
        const upper = sdCapsule(x, y, z, sx, hipY, hipZ, sx, hkY, hkZ, 0.088, 0.062);
        const lower = sdCapsule(x, y, z, sx, hkY, hkZ, sx, pwY, pwZ, 0.058, 0.046);
        const paw = sdEllipsoid(x, y, z, sx, pwY - 0.01, pwZ + 0.040, 0.062, 0.036, 0.072);
        return smin(smin(upper, lower, 0.03), paw, 0.025);
      };

      const legs = Math.min(
        Math.min(frontLeg(-0.145, P.flSwing, P.flLift), frontLeg(0.145, P.frSwing, P.frLift)),
        Math.min(hindLeg(-0.15, P.blSwing, P.blLift), hindLeg(0.15, P.brSwing, P.brLift)),
      );
      fur = smin(fur, legs, 0.045);

      // 4. Huge, lush, thick bushy ringed tail (as long as the body!)
      const tMidX = P.tailSway * 0.45;
      const tMidY = -0.06 + by * 0.5 + P.tailLift * 0.45;
      const tMidZ = -0.68;
      const tTipX = P.tailSway;
      const tTipY = -0.04 + P.tailLift * 0.95;
      const tTipZ = -1.02;
      const tail1 = sdCapsule(x, y, z, 0, -0.02 + by, -0.36, tMidX, tMidY, tMidZ, 0.108, 0.132);
      const tail2 = sdCapsule(x, y, z, tMidX, tMidY, tMidZ, tTipX, tTipY, tTipZ, 0.130, 0.092);
      const tailD = smin(tail1, tail2, 0.045);
      fur = smin(fur, tailD, 0.05);

      // 5. Bright glossy dark eyes & tiny black button nose
      const eyeL = sdEllipsoid(lx, ly, lz, -0.082, 0.028, 0.125, 0.034, 0.034, 0.032);
      const eyeR = sdEllipsoid(lx, ly, lz,  0.082, 0.028, 0.125, 0.034, 0.034, 0.032);
      const eyes = Math.min(eyeL, eyeR);
      const nose = sdEllipsoid(lx, ly, lz, 0, -0.024, 0.228, 0.032, 0.026, 0.028);

      let d = fur, mat = 'fur';
      if (tailD < fur + 0.005 && z < -0.40) mat = 'tail';
      if (legs < fur + 0.005 && y < -0.14 + by + ru * 0.12) mat = 'leg';
      if (earInner < d) { d = earInner; mat = 'earInner'; }
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
        // Crisp white eye glint on upper pixel
        if (ly > 0.040 && Math.abs(x) > 0.075) return 'W';
        return 'k';
      }
      if (mat === 'earInner') return shade > 0.35 ? 'W' : 'c1';
      if (mat === 'leg') return shade > 0.55 ? 'b1' : 'b0';

      // Lush alternating rust-orange & warm-cream/dark ringed tail with dark tip
      if (mat === 'tail') {
        if (z < -0.94) return shade > 0.65 ? 'b1' : 'k';
        const band = Math.floor((-z - 0.40) / 0.105);
        if (band % 2 === 1) {
          return shade > 0.50 ? 'c1' : 'c0';
        }
        return shade > 0.72 ? 'r3' : shade > 0.42 ? 'r2' : 'r1';
      }

      // Iconic white facial mask, white eyebrow spots, cheek patches & reddish-brown tear stripes
      const dy = y - hPivotY;
      const dz = z - hPivotZ;
      const lz = dz * cosP + dy * sinP;
      const ly = -dz * sinP + dy * cosP;
      if (dz > -0.12 && ly > -0.16 && lz > -0.08) {
        // White muzzle
        if (lz > 0.115 && ly < 0.005 && Math.abs(x) < 0.09) return shade > 0.38 ? 'W' : 'c1';
        // Cute reddish-brown tear stripes under eyes
        if (lz > 0.07 && Math.abs(x) > 0.055 && Math.abs(x) < 0.105 && ly < 0.015 && ly > -0.065) {
          return shade > 0.50 ? 'r1' : 'r0';
        }
        // White cheek patches
        if (Math.abs(x) > 0.095 && ly < 0.025 && ly > -0.075 && lz > -0.03) {
          return shade > 0.38 ? 'W' : 'c1';
        }
        // Cute white eyebrow dots above eyes
        if (lz > 0.085 && ly > 0.055 && ly < 0.095 && Math.abs(x) > 0.045 && Math.abs(x) < 0.095) {
          return 'W';
        }
        // White ear rim / dark ear back
        if (ly > 0.11) {
          return lz > -0.005 ? 'W' : (shade > 0.55 ? 'r1' : 'r0');
        }
      }

      // Deep espresso-black belly & lower chest
      if (y < -0.07 + by + ru * 0.08 && z > -0.34 && z < 0.30) {
        return shade > 0.52 ? 'b1' : 'b0';
      }

      // Rich fiery chestnut / rust-orange dorsal coat
      return shade > 0.80 ? 'r4' : shade > 0.56 ? 'r3' : shade > 0.32 ? 'r2' : shade > 0.16 ? 'r1' : 'r0';
    };

    pack = build27Pack(RED_PANDA_PW, RED_PANDA_PH, 1.04, 0.76, RED_PANDA_PAL, evalFn, shadeFn);
    redPandaCache.set(pose, pack);
  }
  return pack;
}

export function getRedPandaPosePack(...args: Parameters<typeof buildRedPandaPosePack>): ReturnType<typeof buildRedPandaPosePack> {
  return registerAnimalSpritePack(buildRedPandaPosePack(...args), { module: './RedPanda.ts', factory: 'getRedPandaPosePack', args }, buildRedPandaPosePack);
}

// ============================================================================
// INSTÂNCIA NA ARENA (RedPanda)
// ============================================================================
const RED_PANDA_IDLE: readonly RedPandaPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const RED_PANDA_WALK: readonly RedPandaPoseName[] = ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'];
const RED_PANDA_CURIOUS: readonly RedPandaPoseName[] = ['curious0', 'curious1', 'curious2', 'curious1'];
const RED_PANDA_FLEE: readonly RedPandaPoseName[] = ['flee0', 'flee1', 'flee2', 'flee3'];

/**
 * Red Panda: trots around, stands up curiously on hind legs, and bounds away if startled.
 */
export class RedPanda extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private readonly home = new THREE.Vector3();
  private state: 'idle' | 'walk' | 'curious' | 'flee' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.4, 2.8);
  private targetYaw = rand(0, Math.PI * 2);
  private gaitPhase = rand(0, Math.PI * 2);

  constructor(ctx: GameContext, pos: THREE.Vector3) {
    super(ctx, getRedPandaPosePack('idle0').getView(2, 0)!, RED_PANDA_PW, RED_PANDA_PH, RED_PANDA_W, RED_PANDA_H, 'RedPandaBillboard');
    this.hp = 35;
    this.maxHp = 35;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.32;
    this.motor.height = 0.58;
    this.motor.teleport(pos);
    this.home.copy(pos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.36, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.set(this.position.x, this.position.y + 0.28, this.position.z);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y + 0.14, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.42, this.position.z);
    this.hurtboxes[0].enabled = this.alive;
    this.stickRoot.position.set(this.position.x, this.position.y + 0.28, this.position.z);
    this.stickRoot.rotation.y = this.facing;
  }

  receiveHit(hit: HitInfo): HitResult {
    const res = emptyResult('flesh');
    if (!this.alive) { res.ignored = true; return res; }
    this.hp = Math.max(0, this.hp - hit.damage);
    res.damage = hit.damage;
    this.flash = 1.0;
    this.vel.x += hit.dir.x * 4.2;
    this.vel.z += hit.dir.z * 4.2;
    this.vel.y = 3.0;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.state = 'flee';
      this.stateT = 0;
      this.stateDur = 2.6;
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
        if (dist < 2.2 && this.state !== 'flee') {
          this.state = 'flee';
          this.stateT = 0;
          this.stateDur = 2.2;
          if (target) {
            this.targetYaw = Math.atan2(this.position.x - target.position.x, this.position.z - target.position.z);
          }
        } else if (dist < 4.2 && dist >= 2.2 && this.state === 'idle' && this.stateT > 0.6) {
          this.state = 'curious';
          this.stateT = 0;
          this.stateDur = 1.8;
        }

        if (this.state === 'idle') {
          if (this.stateT >= this.stateDur) {
            const r = Math.random();
            this.state = r < 0.65 ? 'walk' : 'curious';
            this.stateT = 0;
            this.stateDur = this.state === 'walk' ? rand(2.0, 3.6) : rand(1.4, 2.2);
            const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
            this.targetYaw = toHome > 7.0
              ? Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.5, 0.5)
              : this.facing + rand(-1.6, 1.6);
          }
        } else if (this.state === 'walk') {
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 6);
          speed = 1.9;
          if (this.stateT >= this.stateDur) {
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.2, 2.4);
          }
        } else if (this.state === 'curious') {
          if (target && target.alive && dist < 5.5) {
            const toPlayer = Math.atan2(target.position.x - this.position.x, target.position.z - this.position.z);
            this.facing += angleDiff(this.facing, toPlayer) * Math.min(1, dt * 7);
          }
          if (this.stateT >= this.stateDur) {
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.0, 2.0);
          }
        } else if (this.state === 'flee') {
          if (target && target.alive && dist < 4.5) {
            this.targetYaw = Math.atan2(this.position.x - target.position.x, this.position.z - target.position.z);
          }
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 10);
          speed = 4.2;
          if (this.stateT >= this.stateDur && dist > 4.5) {
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.2, 2.2);
          }
        }

        this.vel.x = damp(this.vel.x, Math.sin(this.facing) * speed, 9, dt);
        this.vel.z = damp(this.vel.z, Math.cos(this.facing) * speed, 9, dt);
        this.vel.y -= 20 * dt;
        this.motor.update(dt);

        const horiz = Math.hypot(this.vel.x, this.vel.z);
        if (horiz > 0.2 && this.motor.grounded) {
          this.gaitPhase += dt * 6.8 * (0.65 + horiz * 0.25);
        }
      }
      this.syncHurtbox();
    }

    let pose: RedPandaPoseName;
    if (!this.alive) pose = 'idle0';
    else if (this.state === 'flee') pose = pickCycle(RED_PANDA_FLEE, (this.gaitPhase / Math.PI) * 3.0);
    else if (this.state === 'curious') pose = pickCycle(RED_PANDA_CURIOUS, this.stateT * 3.2);
    else if (this.state === 'walk') pose = pickCycle(RED_PANDA_WALK, (this.gaitPhase / Math.PI) * 2.8);
    else pose = pickCycle(RED_PANDA_IDLE, this.stateT * 2.0);

    const bob = this.alive && this.motor.grounded && (this.state === 'walk' || this.state === 'flee')
      ? Math.abs(Math.sin(this.gaitPhase)) * 0.028
      : 0;
    const deathSink = this.alive ? 0 : Math.min(0.16, this.deadT * 0.38);
    this.renderBillboard(getRedPandaPosePack(pose), this.position.y + 0.28 + bob - deathSink, camera, drawingBufferSize);
  }
}
