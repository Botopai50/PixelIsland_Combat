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
// BURRO (Donkey) — Flagship 62×58 @ 56 PPU
// ============================================================================
const ANIMAL_PPU = 56;

export type DonkeyPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'walk0' | 'walk1' | 'walk2' | 'walk3' | 'walk4' | 'walk5'
  | 'bray0' | 'bray1' | 'bray2'
  | 'kick0' | 'kick1' | 'kick2';

export const DONKEY_PW = 62;
export const DONKEY_PH = 58;
export const DONKEY_W = DONKEY_PW / ANIMAL_PPU;
export const DONKEY_H = DONKEY_PH / ANIMAL_PPU;

const DONKEY_PAL: Record<string, [number, number, number]> = {
  k:  [0x15, 0x13, 0x12], // 1px dark outline / nostrils / eyes / hooves
  w:  [0xfc, 0xfa, 0xf2], // crisp white eye glint
  s0: [0x2b, 0x26, 0x23], // dark dorsal & shoulder cross stripe / mane / ear tips / tail tuft
  s1: [0x42, 0x3b, 0x36], // dark stripe midtone
  d0: [0x4f, 0x48, 0x43], // warm ash-grey deep shadow
  d1: [0x6e, 0x65, 0x5d], // dusty-taupe shadow
  d2: [0x91, 0x86, 0x7b], // warm ash-grey midtone
  d3: [0xb3, 0xa8, 0x9c], // sunlit warm grey
  d4: [0xd1, 0xc7, 0xba], // soft top highlight
  c0: [0xc4, 0xbc, 0xae], // pale belly / eye ring / muzzle shadow
  c1: [0xe6, 0xe0, 0xd4], // soft cream-white muzzle, belly & inner ear
  c2: [0xf7, 0xf3, 0xe8], // bright cream muzzle highlight
  m:  [0x7a, 0x2a, 0x32], // open mouth interior when braying
};

interface DonkeyPose {
  bodyY: number;
  rumpLift: number;  // >0 when bucking/kicking
  headFwd: number;   // stretches forward in bray
  headY: number;
  jawOpen: number;   // 0..1 for braying
  earPin: number;    // 0 = tall upright ears, 1 = pinned back
  fl: number;
  fr: number;
  bl: number;
  br: number;
  flLift: number;
  frLift: number;
  blLift: number;
  brLift: number;
  kickExt: number;   // 0..1 hind-leg buck extension
  tailSway: number;
  tailLift: number;
}

const DONKEY_POSES: Record<DonkeyPoseName, DonkeyPose> = {
  // Calm breathing & subtle ear/tail movement
  idle0: { bodyY: 0.0,    rumpLift: 0.0,  headFwd: 0.0,  headY: 0.0,   jawOpen: 0.0, earPin: 0.0,  fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0,   flLift: 0.0,  frLift: 0.0,  blLift: 0.0,  brLift: 0.0,  kickExt: 0.0, tailSway: 0.0,   tailLift: 0.0  },
  idle1: { bodyY: 0.012,  rumpLift: 0.0,  headFwd: 0.02, headY: 0.02,  jawOpen: 0.0, earPin: 0.08, fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0,   flLift: 0.0,  frLift: 0.0,  blLift: 0.0,  brLift: 0.0,  kickExt: 0.0, tailSway: 0.06,  tailLift: 0.02 },
  idle2: { bodyY: -0.008, rumpLift: 0.0,  headFwd: 0.0,  headY: -0.02, jawOpen: 0.0, earPin: 0.04, fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0,   flLift: 0.0,  frLift: 0.0,  blLift: 0.0,  brLift: 0.0,  kickExt: 0.0, tailSway: -0.06, tailLift: 0.0  },

  // Steady stubborn 6-frame trot
  walk0: { bodyY: 0.014,  rumpLift: 0.0,  headFwd: 0.03, headY: -0.01, jawOpen: 0.0, earPin: 0.10, fl: 0.16,  fr: -0.12, bl: -0.14, br: 0.15,  flLift: 0.08, frLift: 0.0,  blLift: 0.0,  brLift: 0.07, kickExt: 0.0, tailSway: 0.03,  tailLift: 0.04 },
  walk1: { bodyY: 0.024,  rumpLift: 0.0,  headFwd: 0.04, headY: 0.0,   jawOpen: 0.0, earPin: 0.12, fl: 0.08,  fr: -0.04, bl: -0.06, br: 0.08,  flLift: 0.03, frLift: 0.05, blLift: 0.05, brLift: 0.03, kickExt: 0.0, tailSway: 0.05,  tailLift: 0.05 },
  walk2: { bodyY: 0.0,    rumpLift: 0.0,  headFwd: 0.02, headY: -0.02, jawOpen: 0.0, earPin: 0.10, fl: -0.04, fr: 0.08,  bl: 0.08,  br: -0.04, flLift: 0.0,  frLift: 0.08, blLift: 0.07, brLift: 0.0,  kickExt: 0.0, tailSway: 0.0,   tailLift: 0.03 },
  walk3: { bodyY: 0.014,  rumpLift: 0.0,  headFwd: 0.03, headY: -0.01, jawOpen: 0.0, earPin: 0.10, fl: -0.12, fr: 0.16,  bl: 0.15,  br: -0.14, flLift: 0.0,  frLift: 0.08, blLift: 0.07, brLift: 0.0,  kickExt: 0.0, tailSway: -0.03, tailLift: 0.04 },
  walk4: { bodyY: 0.024,  rumpLift: 0.0,  headFwd: 0.04, headY: 0.0,   jawOpen: 0.0, earPin: 0.12, fl: -0.04, fr: 0.08,  bl: 0.08,  br: -0.06, flLift: 0.05, frLift: 0.03, blLift: 0.03, brLift: 0.05, kickExt: 0.0, tailSway: -0.05, tailLift: 0.05 },
  walk5: { bodyY: 0.0,    rumpLift: 0.0,  headFwd: 0.02, headY: -0.02, jawOpen: 0.0, earPin: 0.10, fl: 0.08,  fr: -0.04, bl: -0.04, br: 0.08,  flLift: 0.08, frLift: 0.0,  blLift: 0.0,  brLift: 0.07, kickExt: 0.0, tailSway: 0.0,   tailLift: 0.03 },

  // Expressive bray: head stretched forward, jaw open, ears pinned back!
  bray0: { bodyY: 0.01,   rumpLift: 0.0,  headFwd: 0.10, headY: 0.04,  jawOpen: 0.45, earPin: 0.55, fl: 0.03,  fr: 0.02,  bl: -0.03, br: -0.03, flLift: 0.0,  frLift: 0.0,  blLift: 0.0,  brLift: 0.0,  kickExt: 0.0, tailSway: 0.04,  tailLift: 0.08 },
  bray1: { bodyY: 0.02,   rumpLift: 0.0,  headFwd: 0.16, headY: 0.08,  jawOpen: 0.95, earPin: 0.85, fl: 0.05,  fr: 0.04,  bl: -0.04, br: -0.04, flLift: 0.0,  frLift: 0.0,  blLift: 0.0,  brLift: 0.0,  kickExt: 0.0, tailSway: -0.04, tailLift: 0.12 },
  bray2: { bodyY: 0.01,   rumpLift: 0.0,  headFwd: 0.12, headY: 0.05,  jawOpen: 0.65, earPin: 0.70, fl: 0.03,  fr: 0.02,  bl: -0.03, br: -0.03, flLift: 0.0,  frLift: 0.0,  blLift: 0.0,  brLift: 0.0,  kickExt: 0.0, tailSway: 0.02,  tailLift: 0.09 },

  // Playful/defensive hind-leg buck!
  kick0: { bodyY: -0.02,  rumpLift: 0.06, headFwd: 0.04, headY: -0.10, jawOpen: 0.0, earPin: 0.65, fl: 0.06,  fr: 0.06,  bl: 0.04,  br: 0.04,  flLift: 0.0,  frLift: 0.0,  blLift: 0.10, brLift: 0.10, kickExt: 0.35, tailSway: 0.0,  tailLift: 0.14 },
  kick1: { bodyY: 0.0,    rumpLift: 0.15, headFwd: 0.06, headY: -0.18, jawOpen: 0.0, earPin: 0.90, fl: 0.08,  fr: 0.08,  bl: 0.0,   br: 0.0,   flLift: 0.0,  frLift: 0.0,  blLift: 0.0,  brLift: 0.0,  kickExt: 1.00, tailSway: 0.0,  tailLift: 0.24 },
  kick2: { bodyY: -0.01,  rumpLift: 0.08, headFwd: 0.04, headY: -0.11, jawOpen: 0.0, earPin: 0.70, fl: 0.06,  fr: 0.06,  bl: 0.02,  br: 0.02,  flLift: 0.0,  frLift: 0.0,  blLift: 0.08, brLift: 0.08, kickExt: 0.50, tailSway: 0.0,  tailLift: 0.16 },
};

const donkeyCache = new Map<DonkeyPoseName, Boar27Pack>();
 function buildDonkeyPosePack(pose: DonkeyPoseName): Boar27Pack {
  let pack = donkeyCache.get(pose);
  if (!pack) {
    const P = DONKEY_POSES[pose];
    const by = P.bodyY;
    const rl = P.rumpLift;
    const hy = 0.30 + by + P.headY;
    const hz = 0.44 + P.headFwd;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // --------------------------------------------------------------------
      // 1. COMPACT STOCKY BARREL TORSO & SHORT STURDY NECK
      // --------------------------------------------------------------------
      const chest = sdEllipsoid(x, y, z, 0, 0.04 + by, 0.18, 0.21, 0.20, 0.22);
      const barrel = sdCapsule(x, y, z, 0, 0.03 + by, 0.16, 0, 0.05 + by + rl, -0.24, 0.205, 0.215);
      const rump = sdEllipsoid(x, y, z, 0, 0.06 + by + rl, -0.28, 0.20, 0.195, 0.20);
      const neck = sdCapsule(x, y, z, 0, 0.08 + by, 0.24, 0, hy - 0.02, hz - 0.06, 0.125, 0.105);

      // Short stiff upright dark mane along top of neck
      const mane = sdCapsule(x, y, z, 0, 0.22 + by, 0.20, 0, hy + 0.10, hz - 0.05, 0.048, 0.038);

      // --------------------------------------------------------------------
      // 2. EXPRESSIVE DONKEY HEAD, MUZZLE & HUGE LONG UPRIGHT EARS
      // --------------------------------------------------------------------
      const cranium = sdEllipsoid(x, y, z, 0, hy, hz, 0.12, 0.115, 0.13);
      const muzzle = sdCapsule(x, y, z, 0, hy - 0.02, hz + 0.06, 0, hy - 0.07 + P.jawOpen * 0.03, hz + 0.26, 0.088, 0.068);
      // Lower jaw opens when braying
      const jaw = P.jawOpen > 0.05
        ? sdCapsule(x, y, z, 0, hy - 0.06, hz + 0.06, 0, hy - 0.12 - P.jawOpen * 0.07, hz + 0.22, 0.062, 0.042)
        : 99;
      const mouthIn = P.jawOpen > 0.1
        ? sdEllipsoid(x, y, z, 0, hy - 0.09 - P.jawOpen * 0.02, hz + 0.17, 0.052, 0.035 * P.jawOpen, 0.065)
        : 99;

      // Huge unmistakable long upright donkey ears (pin back in bray/kick)
      const ep = P.earPin;
      const earTipX = 0.175 + ep * 0.04;
      const earTipY = hy + 0.36 - ep * 0.18;
      const earTipZ = hz - 0.04 - ep * 0.22;
      const earL = sdCapsule(x, y, z, -0.08, hy + 0.09, hz - 0.02, -earTipX, earTipY, earTipZ, 0.052, 0.024);
      const earR = sdCapsule(x, y, z,  0.08, hy + 0.09, hz - 0.02,  earTipX, earTipY, earTipZ, 0.052, 0.024);

      // --------------------------------------------------------------------
      // 3. THIN TAIL ENDING IN A DARK BRUSH TUFT
      // --------------------------------------------------------------------
      const tEndX = P.tailSway;
      const tEndY = -0.22 + by + rl + P.tailLift;
      const tEndZ = -0.52 - P.tailLift * 0.3;
      const tailStem = sdCapsule(x, y, z, 0, 0.04 + by + rl, -0.44, tEndX, tEndY, tEndZ, 0.030, 0.020);
      const tailTuft = sdEllipsoid(x, y, z, tEndX, tEndY - 0.05, tEndZ - 0.02, 0.048, 0.075, 0.048);
      const tail = smin(tailStem, tailTuft, 0.02);

      // --------------------------------------------------------------------
      // 4. FOUR STURDY LEGS & HOOVES (with hind-leg buck in kick0..2)
      // --------------------------------------------------------------------
      const fl = sdCapsule(x, y, z, -0.125, -0.08 + by, 0.22, -0.125, -0.52 + P.flLift, 0.23 + P.fl, 0.062, 0.044);
      const fr = sdCapsule(x, y, z,  0.125, -0.08 + by, 0.22,  0.125, -0.52 + P.frLift, 0.23 + P.fr, 0.062, 0.044);

      const ke = P.kickExt;
      const bKneeY = -0.24 + by + rl + ke * 0.16;
      const bKneeZ = -0.28 - ke * 0.22;
      const bFootY = (-0.52 + P.blLift) * (1 - ke) + (0.04 + by + rl) * ke;
      const bFootZ = (-0.28 + P.bl) * (1 - ke) + (-0.72) * ke;
      const bFootYR = (-0.52 + P.brLift) * (1 - ke) + (0.04 + by + rl) * ke;
      const bFootZR = (-0.28 + P.br) * (1 - ke) + (-0.72) * ke;

      const bl = smin(
        sdCapsule(x, y, z, -0.13, -0.06 + by + rl, -0.26, -0.13, bKneeY, bKneeZ, 0.072, 0.052),
        sdCapsule(x, y, z, -0.13, bKneeY, bKneeZ, -0.13, bFootY, bFootZ, 0.050, 0.042),
        0.02,
      );
      const br = smin(
        sdCapsule(x, y, z,  0.13, -0.06 + by + rl, -0.26,  0.13, bKneeY, bKneeZ, 0.072, 0.052),
        sdCapsule(x, y, z,  0.13, bKneeY, bKneeZ,  0.13, bFootYR, bFootZR, 0.050, 0.042),
        0.02,
      );

      let body = smin(chest, barrel, 0.06);
      body = smin(body, rump, 0.06);
      body = smin(body, neck, 0.05);
      body = smin(body, cranium, 0.04);
      body = smin(body, muzzle, 0.035);
      body = smin(body, jaw, 0.025);
      body = smin(body, Math.min(earL, earR), 0.02);
      body = smin(body, Math.min(Math.min(fl, fr), Math.min(bl, br)), 0.03);
      body = Math.min(body, tail);

      // Eyes with glint
      const eyeL = sdEllipsoid(x, y, z, -0.095, hy + 0.025, hz + 0.085, 0.028, 0.028, 0.026);
      const eyeR = sdEllipsoid(x, y, z,  0.095, hy + 0.025, hz + 0.085, 0.028, 0.028, 0.026);
      const glintL = sdEllipsoid(x, y, z, -0.102, hy + 0.038, hz + 0.104, 0.013, 0.013, 0.013);
      const glintR = sdEllipsoid(x, y, z,  0.102, hy + 0.038, hz + 0.104, 0.013, 0.013, 0.013);

      let d = body;
      let mat = 'coat';
      if (mane < d) { d = mane; mat = 'mane'; }
      if (tailTuft < d + 0.005) { d = Math.min(d, tailTuft); mat = 'tuft'; }
      if (mouthIn < d) { d = mouthIn; mat = 'mouth'; }
      if (Math.min(eyeL, eyeR) < d) { d = Math.min(eyeL, eyeR); mat = 'eye'; }
      if (Math.min(glintL, glintR) < d) { d = Math.min(glintL, glintR); mat = 'glint'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'glint') return 'w';
      if (mat === 'eye') return 'k';
      if (mat === 'mouth') return 'm';
      if (mat === 'mane' || mat === 'tuft') return shade > 0.55 ? 's1' : 's0';

      // Sturdy dark hooves at leg tips
      const isHoof = y < -0.45 || (P.kickExt > 0.6 && z < -0.64);
      if (isHoof) return 'k';

      // Dark nostrils on tip of muzzle
      if (z > hz + 0.24 && Math.abs(x) > 0.022 && Math.abs(x) < 0.052 && Math.abs(y - (hy - 0.055)) < 0.025) {
        return 'k';
      }

      // Soft cream-white muzzle
      if (z > hz + 0.14 && y < hy + 0.01) {
        return shade > 0.72 ? 'c2' : shade > 0.36 ? 'c1' : 'c0';
      }

      // Pale eye rings around the eyes
      const eyeDist = Math.hypot(Math.abs(x) - 0.095, y - (hy + 0.025), z - (hz + 0.085));
      if (eyeDist < 0.052) return shade > 0.45 ? 'c1' : 'c0';

      // Huge donkey ears: dark ear tips + pale inner ear
      if (y > hy + 0.10 && Math.abs(x) > 0.07) {
        if (y > hy + 0.29 - P.earPin * 0.14) return 's0'; // dark ear tips
        if (z > hz - 0.05 - P.earPin * 0.12) return shade > 0.42 ? 'c1' : 'c0'; // pale inner ear
      }

      // Pale belly
      if (y < -0.09 + by + rl * 0.5 && Math.abs(x) < 0.16 && z > -0.26 && z < 0.22) {
        return shade > 0.45 ? 'c1' : 'c0';
      }

      // Classic dark dorsal stripe & shoulder cross stripe!
      const isDorsalStripe = Math.abs(x) < 0.036 && y > 0.16 + by && z > -0.42 && z < 0.24;
      const isShoulderCross = Math.abs(z - 0.16) < 0.034 && y > -0.04 + by && y < 0.22 + by;
      if (isDorsalStripe || isShoulderCross) {
        return shade > 0.50 ? 's1' : 's0';
      }

      // Warm ash-grey / dusty-taupe coat
      if (shade > 0.80) return 'd4';
      if (shade > 0.58) return 'd3';
      if (shade > 0.36) return 'd2';
      if (shade > 0.18) return 'd1';
      return 'd0';
    };

    pack = build27Pack(DONKEY_PW, DONKEY_PH, 0.96, 0.88, DONKEY_PAL, evalFn, shadeFn);
    donkeyCache.set(pose, pack);
  }
  return pack;
}

export function getDonkeyPosePack(...args: Parameters<typeof buildDonkeyPosePack>): ReturnType<typeof buildDonkeyPosePack> {
  return registerAnimalSpritePack(buildDonkeyPosePack(...args), { module: './Donkey.ts', factory: 'getDonkeyPosePack', args }, buildDonkeyPosePack);
}

// ============================================================================
// INSTÂNCIA NA ARENA (Donkey)
// ============================================================================
function pickCycle<T>(frames: readonly T[], idx: number): T {
  return sampleAnimalCycle(frames, idx);
}

const DONKEY_IDLE: readonly DonkeyPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const DONKEY_WALK: readonly DonkeyPoseName[] = ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'];
const DONKEY_BRAY: readonly DonkeyPoseName[] = ['bray0', 'bray1', 'bray2', 'bray1', 'bray0'];
const DONKEY_KICK: readonly DonkeyPoseName[] = ['kick0', 'kick1', 'kick2'];

export class Donkey extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private home = new THREE.Vector3();
  private state: 'idle' | 'special' | 'move' | 'react' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.6, 3.2);
  private targetYaw = rand(0, Math.PI * 2);
  private gaitPhase = rand(0, Math.PI * 2);
  private readonly centerY = 0.52;

  constructor(ctx: GameContext, startPos: THREE.Vector3) {
    super(
      ctx,
      getDonkeyPosePack('idle0').getView(2, 0)!,
      DONKEY_PW,
      DONKEY_PH,
      DONKEY_W,
      DONKEY_H,
      'DonkeyBillboard',
    );
    this.hp = 85;
    this.maxHp = 85;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.44;
    this.motor.height = 1.05;
    this.motor.teleport(startPos);
    this.home.copy(startPos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.52, tag: 'body', enabled: true });
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
    this.vel.x += hit.dir.x * 3.5;
    this.vel.z += hit.dir.z * 3.5;
    this.vel.y = 2.6;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.state = 'react';
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
        const dist = target && target.alive
          ? Math.hypot(target.position.x - this.position.x, target.position.z - this.position.z)
          : 999;

        let speed = 0;
        if (dist < 2.6 && this.state !== 'react') {
          this.state = 'react';
          this.stateT = 0;
          this.stateDur = 1.4;
        }

        if (this.state === 'idle') {
          if (this.stateT >= this.stateDur) {
            this.state = Math.random() < 0.40 ? 'special' : 'move';
            this.stateT = 0;
            this.stateDur = rand(1.8, 3.2);
            const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
            this.targetYaw = toHome > 8.0
              ? Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.5, 0.5)
              : this.facing + rand(-1.5, 1.5);
          }
        } else if (this.state === 'special') {
          // Stubbornly braying in place
          if (this.stateT >= this.stateDur) {
            this.state = 'move';
            this.stateT = 0;
            this.stateDur = rand(1.8, 3.0);
          }
        } else if (this.state === 'move') {
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 5);
          speed = 2.0;
          if (this.stateT >= this.stateDur && this.motor.grounded) {
            this.state = Math.random() < 0.45 ? 'special' : 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.6, 2.8);
          }
        } else if (this.state === 'react') {
          // Turn rear slightly toward player and deliver a defensive hind-leg buck, then trot off
          if (this.stateT < 0.75) {
            speed = 0;
          } else if (target && target.alive) {
            this.targetYaw = Math.atan2(this.position.x - target.position.x, this.position.z - target.position.z);
            this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 7);
            speed = 3.8;
          }
          if (this.stateT >= this.stateDur && dist > 3.8 && this.motor.grounded) {
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.4, 2.6);
          }
        }

        this.vel.x = damp(this.vel.x, Math.sin(this.facing) * speed, 8, dt);
        this.vel.z = damp(this.vel.z, Math.cos(this.facing) * speed, 8, dt);
        this.vel.y -= 20 * dt;
        this.motor.update(dt);

        const horiz = Math.hypot(this.vel.x, this.vel.z);
        if (horiz > 0.25 && this.motor.grounded) {
          this.gaitPhase += dt * 5.6 * (0.65 + horiz * 0.22);
        }
      }
      this.syncHurtbox();
    }

    const horiz = Math.hypot(this.vel.x, this.vel.z);
    const bob = this.alive && this.motor.grounded && horiz > 0.25
      ? Math.abs(Math.sin(this.gaitPhase)) * 0.035
      : 0;
    const pose: DonkeyPoseName = !this.alive
      ? 'idle0'
      : this.state === 'react' && this.stateT < 0.75
        ? pickCycle(DONKEY_KICK, this.stateT * 4.5)
        : this.state === 'special'
          ? pickCycle(DONKEY_BRAY, this.stateT * 3.0)
          : this.state === 'move' || this.state === 'react'
            ? pickCycle(DONKEY_WALK, (this.gaitPhase / Math.PI) * 2.6)
            : pickCycle(DONKEY_IDLE, this.stateT * 2.0);
    const deathSink = this.alive ? 0 : Math.min(0.24, this.deadT * 0.4);
    this.renderBillboard(getDonkeyPosePack(pose), this.position.y + this.centerY + bob - deathSink, camera, drawingBufferSize);
  }
}
