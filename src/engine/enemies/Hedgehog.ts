import { sampleAnimalCycle } from './AnimalAnimation';
import { registerAnimalSpritePack } from './AnimalSpriteCache';
import * as THREE from 'three';
import type { GameContext } from '../core/Context';
import type { HitInfo, HitResult } from '../combat/types';
import { emptyResult } from '../combat/types';
import type { EnemyTarget } from './Enemy';
import type { Boar27Pack } from './Boar';
import {
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
// OURIÇO (Hedgehog) — Flagship 28×24 @ 56 PPU
// ============================================================================
const ANIMAL_PPU = 56;

export type HedgehogPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'walk0' | 'walk1' | 'walk2' | 'walk3' | 'walk4' | 'walk5'
  | 'curl0' | 'curl1' | 'curl2';

export const HEDGEHOG_PW = 28;
export const HEDGEHOG_PH = 24;
export const HEDGEHOG_W = HEDGEHOG_PW / ANIMAL_PPU;
export const HEDGEHOG_H = HEDGEHOG_PH / ANIMAL_PPU;

const HEDGEHOG_PAL: Record<string, [number, number, number]> = {
  k:  [0x14, 0x0e, 0x0b], // 1px outline / glossy button nose / bead eyes
  w:  [0xf8, 0xf4, 0xec], // eye glint / nose highlight
  q0: [0x2e, 0x1c, 0x12], // dark chocolate quill base / deep shadow
  q1: [0x52, 0x34, 0x20], // rich espresso brown quills
  q2: [0x7d, 0x52, 0x33], // warm chestnut quill midtone
  q3: [0xb0, 0x84, 0x58], // warm tan quill band
  q4: [0xe2, 0xc9, 0xa2], // cream-banded quill tips
  f0: [0x8f, 0x6c, 0x4e], // soft tan underbelly & paw shadow
  f1: [0xbf, 0x99, 0x74], // furry cheek & belly midtone
  f2: [0xdf, 0xc0, 0x9a], // warm cream face
  f3: [0xf4, 0xe1, 0xc2], // bright cream muzzle & brow highlight
  p:  [0x6e, 0x46, 0x38], // inner ear / tiny paw toes
};

interface HedgehogPose {
  bodyY: number;
  nosePitch: number;
  noseSway: number;
  curl: number; // 0 = open, 1 = full armored quill ball
  fl: number;
  fr: number;
  bl: number;
  br: number;
  flLift: number;
  frLift: number;
  blLift: number;
  brLift: number;
}

const HEDGEHOG_POSES: Record<HedgehogPoseName, HedgehogPose> = {
  // Subtle breathing & curious nose-twitch sniffing
  idle0: { bodyY: 0.0,    nosePitch: 0.0,   noseSway: 0.0,   curl: 0.0, fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0,   flLift: 0.0,  frLift: 0.0,  blLift: 0.0,  brLift: 0.0  },
  idle1: { bodyY: 0.012,  nosePitch: 0.055, noseSway: 0.025, curl: 0.0, fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0,   flLift: 0.0,  frLift: 0.0,  blLift: 0.0,  brLift: 0.0  },
  idle2: { bodyY: -0.008, nosePitch: -0.03, noseSway: -0.02, curl: 0.0, fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0,   flLift: 0.0,  frLift: 0.0,  blLift: 0.0,  brLift: 0.0  },

  // Crisp 6-frame scurry cycle with alternating paw lifts
  walk0: { bodyY: 0.012,  nosePitch: 0.02,  noseSway: 0.015, curl: 0.0, fl: 0.11,  fr: -0.09, bl: -0.10, br: 0.10,  flLift: 0.05, frLift: 0.0,  blLift: 0.0,  brLift: 0.04 },
  walk1: { bodyY: 0.022,  nosePitch: 0.03,  noseSway: 0.01,  curl: 0.0, fl: 0.06,  fr: -0.03, bl: -0.04, br: 0.05,  flLift: 0.02, frLift: 0.03, blLift: 0.03, brLift: 0.02 },
  walk2: { bodyY: 0.004,  nosePitch: -0.01, noseSway: 0.0,   curl: 0.0, fl: -0.03, fr: 0.06,  bl: 0.05,  br: -0.04, flLift: 0.0,  frLift: 0.05, blLift: 0.04, brLift: 0.0  },
  walk3: { bodyY: 0.012,  nosePitch: 0.02,  noseSway: -0.015,curl: 0.0, fl: -0.09, fr: 0.11,  bl: 0.10,  br: -0.10, flLift: 0.0,  frLift: 0.05, blLift: 0.04, brLift: 0.0  },
  walk4: { bodyY: 0.022,  nosePitch: 0.03,  noseSway: -0.01, curl: 0.0, fl: -0.03, fr: 0.06,  bl: 0.05,  br: -0.04, flLift: 0.03, frLift: 0.02, blLift: 0.02, brLift: 0.03 },
  walk5: { bodyY: 0.004,  nosePitch: -0.01, noseSway: 0.0,   curl: 0.0, fl: 0.06,  fr: -0.03, bl: -0.04, br: 0.05,  flLift: 0.05, frLift: 0.0,  blLift: 0.0,  brLift: 0.04 },

  // Defensive curl into a spiky armored quill ball
  curl0: { bodyY: -0.018, nosePitch: -0.08, noseSway: 0.0,   curl: 0.45, fl: -0.05, fr: -0.05, bl: 0.05,  br: 0.05,  flLift: 0.03, frLift: 0.03, blLift: 0.03, brLift: 0.03 },
  curl1: { bodyY: -0.032, nosePitch: -0.14, noseSway: 0.0,   curl: 0.80, fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0,   flLift: 0.06, frLift: 0.06, blLift: 0.06, brLift: 0.06 },
  curl2: { bodyY: -0.040, nosePitch: 0.0,   noseSway: 0.0,   curl: 1.0,  fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0,   flLift: 0.0,  frLift: 0.0,  blLift: 0.0,  brLift: 0.0  },
};

// Precomputed unit directions for radiating spine clusters on the curled quill ball
const BALL_SPIKE_DIRS: readonly [number, number, number][] = [
  [0, 1, 0],
  [0, 0.72, 0.69], [0, 0.72, -0.69], [0.69, 0.72, 0], [-0.69, 0.72, 0],
  [0.54, 0.64, 0.54], [-0.54, 0.64, 0.54], [0.54, 0.64, -0.54], [-0.54, 0.64, -0.54],
  [0, 0.14, 0.99], [0, 0.14, -0.99], [0.99, 0.14, 0], [-0.99, 0.14, 0],
  [0.70, 0.14, 0.70], [-0.70, 0.14, 0.70], [0.70, 0.14, -0.70], [-0.70, 0.14, -0.70],
  [0.58, -0.45, 0.68], [-0.58, -0.45, 0.68], [0.58, -0.45, -0.68], [-0.58, -0.45, -0.68],
];

// Backward-swept spine clusters for the open hedgehog mantle: [ax, ay, az, bx, by, bz, rBase, rTip]
const MANTLE_SPINES: readonly [number, number, number, number, number, number, number, number][] = [
  // Forehead brow crest (swept up & back over the face)
  [0.0,   0.14,  0.14,  0.0,   0.26,  0.03,  0.068, 0.018],
  [-0.12, 0.12,  0.12, -0.17,  0.23,  0.00,  0.062, 0.016],
  [ 0.12, 0.12,  0.12,  0.17,  0.23,  0.00,  0.062, 0.016],

  // Upper dorsal ridge (prominent jagged silhouette along the spine)
  [0.0,   0.21,  0.02,  0.0,   0.34, -0.13,  0.072, 0.018],
  [0.0,   0.20, -0.14,  0.0,   0.31, -0.31,  0.070, 0.018],
  [0.0,   0.13, -0.28,  0.0,   0.20, -0.48,  0.066, 0.017],

  // Upper-flank layered rows (left & right)
  [-0.16, 0.17, -0.02, -0.25,  0.28, -0.16,  0.066, 0.017],
  [ 0.16, 0.17, -0.02,  0.25,  0.28, -0.16,  0.066, 0.017],
  [-0.18, 0.14, -0.19, -0.27,  0.23, -0.36,  0.064, 0.016],
  [ 0.18, 0.14, -0.19,  0.27,  0.23, -0.36,  0.064, 0.016],

  // Mid-flank lateral flare spines (gives wide spiky silhouette from front/back/top)
  [-0.24, 0.05,  0.02, -0.38,  0.11, -0.12,  0.062, 0.016],
  [ 0.24, 0.05,  0.02,  0.38,  0.11, -0.12,  0.062, 0.016],
  [-0.25, 0.03, -0.15, -0.39,  0.08, -0.31,  0.062, 0.016],
  [ 0.25, 0.03, -0.15,  0.39,  0.08, -0.31,  0.062, 0.016],

  // Rear rump skirt spines
  [-0.14, 0.03, -0.30, -0.22,  0.06, -0.49,  0.060, 0.016],
  [ 0.14, 0.03, -0.30,  0.22,  0.06, -0.49,  0.060, 0.016],
  [ 0.0, -0.02, -0.33,  0.0,  -0.02, -0.52,  0.058, 0.016],
];

const hedgehogCache = new Map<HedgehogPoseName, Boar27Pack>();
 function buildHedgehogPosePack(pose: HedgehogPoseName): Boar27Pack {
  let pack = hedgehogCache.get(pose);
  if (!pack) {
    const P = HEDGEHOG_POSES[pose];
    const by = P.bodyY;
    const c = P.curl;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // --------------------------------------------------------------------
      // FULL ARMORED QUILL BALL (curl2)
      // --------------------------------------------------------------------
      if (c >= 0.95) {
        const cy = -0.02 + by;
        let ball = sdEllipsoid(x, y, z, 0, cy, 0, 0.31, 0.28, 0.31);
        for (let i = 0; i < BALL_SPIKE_DIRS.length; i++) {
          const [dx, dy, dz] = BALL_SPIKE_DIRS[i];
          const sp = sdCapsule(
            x, y, z,
            dx * 0.20, cy + dy * 0.18, dz * 0.20,
            dx * 0.44, cy + dy * 0.40, dz * 0.44,
            0.062, 0.015,
          );
          ball = Math.min(ball, sp);
        }
        return { d: ball, mat: 'quills' };
      }

      // --------------------------------------------------------------------
      // 1. LAYERED QUILL MANTLE (inner dome + sculpted backward-swept spines)
      // --------------------------------------------------------------------
      const mantleZ = -0.08 + c * 0.08;
      const mantleY = 0.04 + by - c * 0.03;
      const ripple = 0.014 * Math.sin(x * 26 + z * 18) * Math.cos(y * 24 - z * 16);
      let quills = sdEllipsoid(x, y, z, 0, mantleY, mantleZ, 0.30, 0.24, 0.36 - c * 0.05) - Math.abs(ripple);

      // Sculpted backward-swept spine clusters jutting out of the silhouette
      const flare = 1.0 + c * 0.18;
      for (let i = 0; i < MANTLE_SPINES.length; i++) {
        const s = MANTLE_SPINES[i];
        const sp = sdCapsule(
          x, y, z,
          s[0], s[1] + by - c * 0.02, s[2] + c * 0.07,
          s[3] * flare, (s[4] + by - c * 0.02) * flare, (s[5] + c * 0.07) * (1 - c * 0.12),
          s[6], s[7],
        );
        quills = Math.min(quills, sp);
      }

      // --------------------------------------------------------------------
      // 2. SOFT CREAM/TAN FURRY FACE, POINTED SNOUT, UNDERBELLY & EARS
      // --------------------------------------------------------------------
      const fZ = 0.28 - c * 0.22;
      const fY = -0.055 + by + P.nosePitch * 0.25 - c * 0.04;
      const fX = P.noseSway * (1 - c);

      // Furry underbelly tucked beneath the quill mantle
      const belly = sdEllipsoid(x, y, z, 0, -0.12 + by, -0.02 + c * 0.04, 0.24, 0.13, 0.30 - c * 0.08);
      // Rounded furry cheeks & face
      const face = sdEllipsoid(x, y, z, fX, fY, fZ, 0.175, 0.135, 0.18);
      // Pointed tapering snout
      const snoutTipY = fY - 0.035 + P.nosePitch;
      const snoutTipZ = fZ + 0.24 - c * 0.07;
      const snout = sdCapsule(x, y, z, fX, fY - 0.01, fZ + 0.06, fX * 1.15, snoutTipY, snoutTipZ, 0.095, 0.034);

      // Round little ears peeking out behind the eyes
      const earL = sdEllipsoid(x, y, z, fX - 0.145, fY + 0.095, fZ - 0.03, 0.052, 0.055, 0.032);
      const earR = sdEllipsoid(x, y, z, fX + 0.145, fY + 0.095, fZ - 0.03, 0.052, 0.055, 0.032);
      const earInL = sdEllipsoid(x, y, z, fX - 0.145, fY + 0.092, fZ - 0.008, 0.030, 0.032, 0.020);
      const earInR = sdEllipsoid(x, y, z, fX + 0.145, fY + 0.092, fZ - 0.008, 0.030, 0.032, 0.020);

      let skin = smin(belly, face, 0.05);
      skin = smin(skin, snout, 0.035);
      skin = smin(skin, Math.min(earL, earR), 0.015);

      // --------------------------------------------------------------------
      // 3. FOUR TINY PAWS
      // --------------------------------------------------------------------
      const legY = -0.275 + c * 0.14;
      const fl = sdCapsule(x, y, z, -0.15, -0.14 + by,  0.14, -0.155, legY + P.flLift,  0.16 + P.fl, 0.048, 0.036);
      const fr = sdCapsule(x, y, z,  0.15, -0.14 + by,  0.14,  0.155, legY + P.frLift,  0.16 + P.fr, 0.048, 0.036);
      const bl = sdCapsule(x, y, z, -0.15, -0.14 + by, -0.17, -0.155, legY + P.blLift, -0.17 + P.bl, 0.048, 0.036);
      const br = sdCapsule(x, y, z,  0.15, -0.14 + by, -0.17,  0.155, legY + P.brLift, -0.17 + P.br, 0.048, 0.036);
      const paws = Math.min(Math.min(fl, fr), Math.min(bl, br));

      // --------------------------------------------------------------------
      // 4. BRIGHT BEAD EYES WITH GLINT + GLOSSY BLACK BUTTON NOSE
      // --------------------------------------------------------------------
      const eyeL = sdEllipsoid(x, y, z, fX - 0.105, fY + 0.032, fZ + 0.115, 0.034, 0.034, 0.032);
      const eyeR = sdEllipsoid(x, y, z, fX + 0.105, fY + 0.032, fZ + 0.115, 0.034, 0.034, 0.032);
      const glintL = sdEllipsoid(x, y, z, fX - 0.112, fY + 0.046, fZ + 0.138, 0.015, 0.015, 0.015);
      const glintR = sdEllipsoid(x, y, z, fX + 0.112, fY + 0.046, fZ + 0.138, 0.015, 0.015, 0.015);
      const nose = sdEllipsoid(x, y, z, fX * 1.15, snoutTipY + 0.004, snoutTipZ + 0.025, 0.038, 0.032, 0.034);

      let d = quills;
      let mat = 'quills';
      if (skin < d) { d = skin; mat = 'face'; }
      if (paws < d) { d = paws; mat = 'paw'; }
      if (Math.min(earInL, earInR) < d) { d = Math.min(earInL, earInR); mat = 'earIn'; }
      if (Math.min(eyeL, eyeR) < d) { d = Math.min(eyeL, eyeR); mat = 'eye'; }
      if (Math.min(glintL, glintR) < d) { d = Math.min(glintL, glintR); mat = 'glint'; }
      if (nose < d) { d = nose; mat = 'nose'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'glint') return 'w';
      if (mat === 'eye') return 'k';
      if (mat === 'nose') return shade > 0.82 ? 'w' : 'k';
      if (mat === 'earIn') return 'p';
      if (mat === 'paw') return shade > 0.45 ? 'p' : 'f0';
      if (mat === 'face') {
        if (shade > 0.72) return 'f3';
        if (shade > 0.48) return 'f2';
        if (shade > 0.25) return 'f1';
        return 'f0';
      }

      // Rich banded quill shading: outer tips cream-banded, mid-spines warm chestnut/tan, deep base dark chocolate
      const rad = Math.hypot(x, y - 0.02, z + (c >= 0.95 ? 0 : 0.08));
      const band = Math.sin(x * 30 + z * 26) * Math.cos(y * 28 - z * 20);
      if (rad > 0.36 || (rad > 0.30 && band > 0.28)) {
        return shade > 0.42 ? 'q4' : 'q3';
      }
      if (band > 0.38) return shade > 0.50 ? 'q3' : 'q2';
      if (shade > 0.68) return 'q3';
      if (shade > 0.44) return 'q2';
      if (shade > 0.22) return 'q1';
      return 'q0';
    };

    pack = build27Pack(HEDGEHOG_PW, HEDGEHOG_PH, 0.88, 0.76, HEDGEHOG_PAL, evalFn, shadeFn);
    hedgehogCache.set(pose, pack);
  }
  return pack;
}

export function getHedgehogPosePack(...args: Parameters<typeof buildHedgehogPosePack>): ReturnType<typeof buildHedgehogPosePack> {
  return registerAnimalSpritePack(buildHedgehogPosePack(...args), { module: './Hedgehog.ts', factory: 'getHedgehogPosePack', args }, buildHedgehogPosePack);
}

// ============================================================================
// INSTÂNCIA NA ARENA (Hedgehog)
// ============================================================================
function pickCycle<T>(frames: readonly T[], idx: number): T {
  return sampleAnimalCycle(frames, idx);
}

const HEDGEHOG_IDLE: readonly HedgehogPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const HEDGEHOG_WALK: readonly HedgehogPoseName[] = ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'];

export class Hedgehog extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private home = new THREE.Vector3();
  private state: 'idle' | 'move' | 'react' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.2, 2.6);
  private targetYaw = rand(0, Math.PI * 2);
  private gaitPhase = rand(0, Math.PI * 2);
  private readonly centerY = 0.14;

  constructor(ctx: GameContext, startPos: THREE.Vector3) {
    super(
      ctx,
      getHedgehogPosePack('idle0').getView(2, 0)!,
      HEDGEHOG_PW,
      HEDGEHOG_PH,
      HEDGEHOG_W,
      HEDGEHOG_H,
      'HedgehogBillboard',
    );
    this.hp = 25;
    this.maxHp = 25;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.20;
    this.motor.height = 0.28;
    this.motor.teleport(startPos);
    this.home.copy(startPos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.28, tag: 'body', enabled: true });
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
    // Armored quill ball reduces incoming damage to 35%
    const dmg = this.state === 'react' ? Math.max(2, Math.round(hit.damage * 0.35)) : hit.damage;
    this.hp = Math.max(0, this.hp - dmg);
    res.damage = dmg;
    this.flash = 1.0;
    this.vel.x += hit.dir.x * 4.0;
    this.vel.z += hit.dir.z * 4.0;
    this.vel.y = 3.0;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.state = 'react';
      this.stateT = 0;
      this.stateDur = 2.1;
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
        if (dist < 2.8 && this.state !== 'react') {
          this.state = 'react';
          this.stateT = 0;
          this.stateDur = 2.0;
        }

        if (this.state === 'idle') {
          if (this.stateT >= this.stateDur) {
            this.state = 'move';
            this.stateT = 0;
            this.stateDur = rand(1.6, 3.0);
            const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
            this.targetYaw = toHome > 7.5
              ? Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.5, 0.5)
              : this.facing + rand(-1.6, 1.6);
          }
        } else if (this.state === 'move') {
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 6);
          speed = 1.25;
          if (this.stateT >= this.stateDur && this.motor.grounded) {
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.4, 2.6);
          }
        } else if (this.state === 'react') {
          speed = 0;
          if (this.stateT >= this.stateDur && dist > 4.2 && this.motor.grounded) {
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.2, 2.2);
          }
        }

        this.vel.x = damp(this.vel.x, Math.sin(this.facing) * speed, 9, dt);
        this.vel.z = damp(this.vel.z, Math.cos(this.facing) * speed, 9, dt);
        this.vel.y -= 20 * dt;
        this.motor.update(dt);

        const targetPitch = !this.motor.grounded ? Math.max(-0.26, Math.min(0.26, this.vel.y * 0.045)) : 0;
        this.bodyPitch = damp(this.bodyPitch, targetPitch, 10, dt);

        const horiz = Math.hypot(this.vel.x, this.vel.z);
        if (horiz > 0.25 && this.motor.grounded) {
          this.gaitPhase += dt * 6.5 * (0.65 + horiz * 0.22);
        }
      }
      this.syncHurtbox();
    }

    const horiz = Math.hypot(this.vel.x, this.vel.z);
    const bob = this.alive && this.motor.grounded && horiz > 0.25
      ? Math.abs(Math.sin(this.gaitPhase)) * 0.015
      : 0;
    const pose: HedgehogPoseName = !this.alive
      ? 'curl2'
      : this.state === 'react'
        ? (this.stateT < 0.14 ? 'curl0' : this.stateT < 0.28 ? 'curl1' : 'curl2')
        : this.state === 'move'
          ? pickCycle(HEDGEHOG_WALK, (this.gaitPhase / Math.PI) * 3.0)
          : pickCycle(HEDGEHOG_IDLE, this.stateT * 2.0);
    const deathSink = this.alive ? 0 : Math.min(0.20, this.deadT * 0.4);
    this.renderBillboard(getHedgehogPosePack(pose), this.position.y + this.centerY + bob - deathSink, camera, drawingBufferSize);
  }
}
