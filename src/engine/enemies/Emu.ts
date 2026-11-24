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
// EMU AUSTRALIANO (Australian Emu) — Flagship 48×62 @ 56 PPU
// ============================================================================
const ANIMAL_PPU = 56;

export type EmuPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'walk0' | 'walk1' | 'walk2' | 'walk3' | 'walk4' | 'walk5'
  | 'sprint0' | 'sprint1' | 'sprint2' | 'sprint3' | 'sprint4' | 'sprint5'
  | 'peck0' | 'peck1' | 'peck2';

export const EMU_PW = 48;
export const EMU_PH = 62;
export const EMU_W = EMU_PW / ANIMAL_PPU;
export const EMU_H = EMU_PH / ANIMAL_PPU;

const EMU_PAL: Record<string, [number, number, number]> = {
  k:  [0x13, 0x11, 0x10], // 1px dark outline / pupil / bill tip / claws
  w:  [0xfc, 0xfa, 0xf2], // crisp white eye glint
  n0: [0x1c, 0x19, 0x18], // shaggy charcoal-black lower-neck ruff & crown tuft shadow
  n1: [0x33, 0x2d, 0x2b], // dark charcoal-black neck ruff & bill highlight
  e0: [0x2e, 0x21, 0x18], // deep dark-umber shaggy plumage shadow
  e1: [0x4a, 0x36, 0x27], // rich walnut-brown plumage
  e2: [0x6b, 0x50, 0x3b], // warm grizzled walnut-umber midtone
  e3: [0x8f, 0x6f, 0x54], // sunlit shaggy tan-brown feather strands
  e4: [0xb3, 0x93, 0x76], // bright buff-tan dorsal highlight
  c0: [0x3b, 0x6e, 0x82], // bare slate-cyan neck skin shadow
  c1: [0x62, 0xa8, 0xc2], // unmistakable pale turquoise-blue upper neck & facial skin
  c2: [0x96, 0xd8, 0xed], // bright turquoise-cyan skin highlight
  a:  [0xf5, 0x6b, 0x16], // fiery orange-amber eye
  l0: [0x2f, 0x33, 0x38], // sturdy dark-slate scaly legs shadow
  l1: [0x4c, 0x52, 0x59], // dark-slate scaly legs highlight
};

interface EmuPose {
  bodyY: number;
  bodyPitch: number;
  bustleBounce: number; // shaggy tail bustle bounce
  headY: number;
  headZ: number;
  legL: number;
  legR: number;
  liftL: number;
  liftR: number;
  kneeL: number;
  kneeR: number;
}

const EMU_POSES: Record<EmuPoseName, EmuPose> = {
  // Alert upright outback posture
  idle0:   { bodyY: 0.0,    bodyPitch: 0.0,   bustleBounce: 0.0,   headY: 0.56,  headZ: 0.24, legL: 0.0,   legR: 0.0,   liftL: 0.0,  liftR: 0.0,  kneeL: 0.0,  kneeR: 0.0  },
  idle1:   { bodyY: 0.015,  bodyPitch: 0.01,  bustleBounce: 0.015, headY: 0.58,  headZ: 0.25, legL: 0.0,   legR: 0.0,   liftL: 0.0,  liftR: 0.0,  kneeL: 0.0,  kneeR: 0.0  },
  idle2:   { bodyY: -0.01,  bodyPitch: -0.01, bustleBounce: -0.01, headY: 0.54,  headZ: 0.23, legL: 0.0,   legR: 0.0,   liftL: 0.0,  liftR: 0.0,  kneeL: 0.0,  kneeR: 0.0  },

  // Bouncy shaggy-plumed stride
  walk0:   { bodyY: 0.015,  bodyPitch: -0.02, bustleBounce: 0.03,  headY: 0.55,  headZ: 0.28, legL: 0.18,  legR: -0.16, liftL: 0.10, liftR: 0.0,  kneeL: 0.08, kneeR: -0.04 },
  walk1:   { bodyY: 0.028,  bodyPitch: -0.01, bustleBounce: 0.05,  headY: 0.57,  headZ: 0.26, legL: 0.08,  legR: -0.06, liftL: 0.04, liftR: 0.05, kneeL: 0.04, kneeR: 0.02  },
  walk2:   { bodyY: 0.0,    bodyPitch: -0.02, bustleBounce: -0.02, headY: 0.53,  headZ: 0.27, legL: -0.06, legR: 0.08,  liftL: 0.0,  liftR: 0.10, kneeL: -0.02,kneeR: 0.08  },
  walk3:   { bodyY: 0.015,  bodyPitch: -0.02, bustleBounce: 0.03,  headY: 0.55,  headZ: 0.28, legL: -0.16, legR: 0.18,  liftL: 0.0,  liftR: 0.10, kneeL: -0.04,kneeR: 0.08  },
  walk4:   { bodyY: 0.028,  bodyPitch: -0.01, bustleBounce: 0.05,  headY: 0.57,  headZ: 0.26, legL: -0.06, legR: 0.08,  liftL: 0.05, liftR: 0.04, kneeL: 0.02, kneeR: 0.04  },
  walk5:   { bodyY: 0.0,    bodyPitch: -0.02, bustleBounce: -0.02, headY: 0.53,  headZ: 0.27, legL: 0.08,  legR: -0.06, liftL: 0.10, liftR: 0.0,  kneeL: 0.08, kneeR: -0.02 },

  // High-speed outback sprint with neck stretched forward & shaggy tail bustle bouncing!
  sprint0: { bodyY: 0.02,   bodyPitch: -0.08, bustleBounce: 0.06,  headY: 0.44,  headZ: 0.42, legL: 0.30,  legR: -0.28, liftL: 0.16, liftR: 0.04, kneeL: 0.14, kneeR: -0.10 },
  sprint1: { bodyY: 0.06,   bodyPitch: -0.06, bustleBounce: 0.10,  headY: 0.47,  headZ: 0.44, legL: 0.16,  legR: -0.14, liftL: 0.10, liftR: 0.12, kneeL: 0.08, kneeR: 0.04  },
  sprint2: { bodyY: 0.01,   bodyPitch: -0.09, bustleBounce: -0.04, headY: 0.42,  headZ: 0.41, legL: -0.12, legR: 0.16,  liftL: 0.02, liftR: 0.16, kneeL: -0.06,kneeR: 0.14  },
  sprint3: { bodyY: 0.02,   bodyPitch: -0.08, bustleBounce: 0.06,  headY: 0.44,  headZ: 0.42, legL: -0.28, legR: 0.30,  liftL: 0.04, liftR: 0.16, kneeL: -0.10,kneeR: 0.14  },
  sprint4: { bodyY: 0.06,   bodyPitch: -0.06, bustleBounce: 0.10,  headY: 0.47,  headZ: 0.44, legL: -0.14, legR: 0.16,  liftL: 0.12, liftR: 0.10, kneeL: 0.04, kneeR: 0.08  },
  sprint5: { bodyY: 0.01,   bodyPitch: -0.09, bustleBounce: -0.04, headY: 0.42,  headZ: 0.41, legL: 0.16,  legR: -0.12, liftL: 0.16, liftR: 0.02, kneeL: 0.14, kneeR: -0.06 },

  // Pecking at the ground
  peck0:   { bodyY: -0.02,  bodyPitch: -0.12, bustleBounce: 0.02,  headY: 0.18,  headZ: 0.44, legL: 0.04,  legR: -0.04, liftL: 0.0,  liftR: 0.0,  kneeL: 0.02, kneeR: -0.02 },
  peck1:   { bodyY: -0.04,  bodyPitch: -0.20, bustleBounce: 0.04,  headY: -0.16, headZ: 0.48, legL: 0.06,  legR: -0.04, liftL: 0.0,  liftR: 0.0,  kneeL: 0.03, kneeR: -0.02 },
  peck2:   { bodyY: -0.02,  bodyPitch: -0.14, bustleBounce: 0.02,  headY: 0.10,  headZ: 0.45, legL: 0.04,  legR: -0.04, liftL: 0.0,  liftR: 0.0,  kneeL: 0.02, kneeR: -0.02 },
};

const emuCache = new Map<EmuPoseName, Boar27Pack>();
 function buildEmuPosePack(pose: EmuPoseName): Boar27Pack {
  let pack = emuCache.get(pose);
  if (!pack) {
    const P = EMU_POSES[pose];
    const by = P.bodyY;
    const bp = P.bodyPitch;
    const bb = P.bustleBounce;
    const hy = P.headY + by;
    const hz = P.headZ;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // --------------------------------------------------------------------
      // 1. SHAGGY DROOPING TEARDROP RATITE BODY & BOUNCY RUMP BUSTLE (No wings!)
      // --------------------------------------------------------------------
      const ripple = 0.012 * Math.sin(x * 24 + z * 20) * Math.cos(y * 22);
      const core = sdEllipsoid(x, y, z, 0, 0.08 + by, -0.04, 0.23, 0.22, 0.30) - Math.abs(ripple);
      // Shaggy drooping feather skirt on flanks & chest
      const skirtL = sdEllipsoid(x, y, z, -0.13, 0.00 + by, -0.02, 0.13, 0.18, 0.26);
      const skirtR = sdEllipsoid(x, y, z,  0.13, 0.00 + by, -0.02, 0.13, 0.18, 0.26);
      // Shaggy drooping tail bustle
      const bustle1 = sdEllipsoid(x, y, z, 0, 0.05 + by - bp * 0.2 + bb * 0.5, -0.26, 0.20, 0.20, 0.20);
      const bustle2 = sdCapsule(x, y, z, 0, 0.04 + by + bb * 0.5, -0.24, 0, -0.12 + by + bb, -0.44, 0.16, 0.095);

      let plumage = smin(core, Math.min(skirtL, skirtR), 0.05);
      plumage = smin(plumage, bustle1, 0.06);
      plumage = smin(plumage, bustle2, 0.05);

      // --------------------------------------------------------------------
      // 2. SHAGGY DARK LOWER-NECK RUFF & BARE TURQUOISE-BLUE UPPER NECK
      // --------------------------------------------------------------------
      const neckMidY = (0.14 + by + hy) * 0.48;
      const neckMidZ = (0.18 + hz) * 0.52;
      const neckLow = sdCapsule(x, y, z, 0, 0.12 + by, 0.16, 0, neckMidY, neckMidZ, 0.115, 0.072);
      const neckHigh = sdCapsule(x, y, z, 0, neckMidY, neckMidZ, 0, hy - 0.02, hz - 0.02, 0.065, 0.052);
      const head = sdEllipsoid(x, y, z, 0, hy, hz, 0.078, 0.072, 0.088);
      // Dark fuzzy head crown tuft on top of head!
      const crownTuft = sdEllipsoid(x, y, z, 0, hy + 0.055, hz - 0.01, 0.058, 0.042, 0.065);
      const bill = sdCapsule(x, y, z, 0, hy - 0.012, hz + 0.06, 0, hy - 0.024, hz + 0.19, 0.036, 0.015);

      plumage = smin(plumage, neckLow, 0.05);
      const upperNeckHead = smin(neckHigh, head, 0.03);

      // --------------------------------------------------------------------
      // 3. STURDY DARK-SLATE SCALY 3-TOED LEGS
      // --------------------------------------------------------------------
      const kneeYL = -0.22 + by + P.liftL * 0.5;
      const kneeYR = -0.22 + by + P.liftR * 0.5;
      const kneeZL = -0.04 + P.kneeL;
      const kneeZR = -0.04 + P.kneeR;
      const footYL = -0.52 + P.liftL;
      const footYR = -0.52 + P.liftR;
      const footZL = -0.02 + P.legL;
      const footZR = -0.02 + P.legR;

      const thighL = sdCapsule(x, y, z, -0.105, -0.04 + by, -0.04, -0.105, kneeYL, kneeZL, 0.068, 0.048);
      const thighR = sdCapsule(x, y, z,  0.105, -0.04 + by, -0.04,  0.105, kneeYR, kneeZR, 0.068, 0.048);
      const shinL  = sdCapsule(x, y, z, -0.105, kneeYL, kneeZL, -0.105, footYL, footZL, 0.044, 0.034);
      const shinR  = sdCapsule(x, y, z,  0.105, kneeYR, kneeZR,  0.105, footYR, footZR, 0.044, 0.034);
      const footL  = sdCapsule(x, y, z, -0.105, footYL, footZL - 0.02, -0.105, footYL - 0.01, footZL + 0.11, 0.036, 0.024);
      const footR  = sdCapsule(x, y, z,  0.105, footYR, footZR - 0.02,  0.105, footYR - 0.01, footZR + 0.11, 0.036, 0.024);
      const legs = Math.min(
        smin(smin(thighL, shinL, 0.02), footL, 0.015),
        smin(smin(thighR, shinR, 0.02), footR, 0.015),
      );

      // Fiery orange-amber eyes with white glint
      const eyeL = sdEllipsoid(x, y, z, -0.064, hy + 0.01, hz + 0.035, 0.025, 0.025, 0.024);
      const eyeR = sdEllipsoid(x, y, z,  0.064, hy + 0.01, hz + 0.035, 0.025, 0.025, 0.024);
      const glintL = sdEllipsoid(x, y, z, -0.072, hy + 0.02, hz + 0.048, 0.011, 0.011, 0.011);
      const glintR = sdEllipsoid(x, y, z,  0.072, hy + 0.02, hz + 0.048, 0.011, 0.011, 0.011);

      let d = smin(plumage, upperNeckHead, 0.035);
      let mat = upperNeckHead < plumage - 0.01 ? 'cyanSkin' : 'plumage';
      if (crownTuft < d) { d = crownTuft; mat = 'crown'; }
      if (bill < d) { d = bill; mat = 'bill'; }
      if (legs < d) { d = legs; mat = 'leg'; }
      if (Math.min(eyeL, eyeR) < d) { d = Math.min(eyeL, eyeR); mat = 'eye'; }
      if (Math.min(glintL, glintR) < d) { d = Math.min(glintL, glintR); mat = 'glint'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'glint') return 'w';
      if (mat === 'eye') return 'a';
      if (mat === 'bill') return shade > 0.45 ? 'n1' : 'k';
      if (mat === 'crown') return shade > 0.50 ? 'n1' : 'n0';
      if (mat === 'leg') return shade > 0.45 ? 'l1' : 'l0';
      if (mat === 'cyanSkin') {
        // Bare pale turquoise-blue / slate-cyan upper neck and facial skin!
        if (shade > 0.72) return 'c2';
        return shade > 0.34 ? 'c1' : 'c0';
      }

      // Shaggy dark charcoal-black feathered lower-neck ruff!
      if (z > 0.14 && y > 0.10 + by) {
        return shade > 0.52 ? 'n1' : 'n0';
      }

      // Shaggy, hair-like, drooping walnut-brown / dark-umber body plumage
      const strand = Math.sin(x * 32 + z * 24) * Math.cos(y * 20) > 0.38;
      if (strand && shade > 0.35) return shade > 0.65 ? 'e4' : 'e3';
      if (shade > 0.80) return 'e4';
      if (shade > 0.58) return 'e3';
      if (shade > 0.36) return 'e2';
      if (shade > 0.18) return 'e1';
      return 'e0';
    };

    pack = build27Pack(EMU_PW, EMU_PH, 0.84, 0.94, EMU_PAL, evalFn, shadeFn);
    emuCache.set(pose, pack);
  }
  return pack;
}

export function getEmuPosePack(...args: Parameters<typeof buildEmuPosePack>): ReturnType<typeof buildEmuPosePack> {
  return registerAnimalSpritePack(buildEmuPosePack(...args), { module: './Emu.ts', factory: 'getEmuPosePack', args }, buildEmuPosePack);
}

// ============================================================================
// INSTÂNCIA NA ARENA (Emu)
// ============================================================================
function pickCycle<T>(frames: readonly T[], idx: number): T {
  return sampleAnimalCycle(frames, idx);
}

const EMU_IDLE: readonly EmuPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const EMU_WALK: readonly EmuPoseName[] = ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'];
const EMU_SPRINT: readonly EmuPoseName[] = ['sprint0', 'sprint1', 'sprint2', 'sprint3', 'sprint4', 'sprint5'];
const EMU_PECK: readonly EmuPoseName[] = ['peck0', 'peck1', 'peck2', 'peck1', 'peck0'];

export class Emu extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private home = new THREE.Vector3();
  private state: 'idle' | 'special' | 'move' | 'react' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.4, 2.8);
  private targetYaw = rand(0, Math.PI * 2);
  private gaitPhase = rand(0, Math.PI * 2);
  private readonly centerY = 0.54;

  constructor(ctx: GameContext, startPos: THREE.Vector3) {
    super(
      ctx,
      getEmuPosePack('idle0').getView(2, 0)!,
      EMU_PW,
      EMU_PH,
      EMU_W,
      EMU_H,
      'EmuBillboard',
    );
    this.hp = 70;
    this.maxHp = 70;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.38;
    this.motor.height = 1.10;
    this.motor.teleport(startPos);
    this.home.copy(startPos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.46, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.set(this.position.x, this.position.y + this.centerY, this.position.z);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y + this.centerY * 0.5, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + this.centerY * 1.5, this.position.z);
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
    this.vel.x += hit.dir.x * 4.2;
    this.vel.z += hit.dir.z * 4.2;
    this.vel.y = 3.0;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.state = 'react';
      this.stateT = 0;
      this.stateDur = 2.4;
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
        if (dist < 4.0 && this.state !== 'react') {
          this.state = 'react';
          this.stateT = 0;
          this.stateDur = 2.2;
        }

        if (this.state === 'idle') {
          if (this.stateT >= this.stateDur) {
            this.state = Math.random() < 0.42 ? 'special' : 'move';
            this.stateT = 0;
            this.stateDur = rand(1.6, 3.0);
            const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
            this.targetYaw = toHome > 8.5
              ? Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.5, 0.5)
              : this.facing + rand(-1.6, 1.6);
          }
        } else if (this.state === 'special') {
          if (this.stateT >= this.stateDur) {
            this.state = 'move';
            this.stateT = 0;
            this.stateDur = rand(1.8, 3.0);
          }
        } else if (this.state === 'move') {
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 6);
          speed = 2.3;
          if (this.stateT >= this.stateDur && this.motor.grounded) {
            this.state = Math.random() < 0.45 ? 'special' : 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.5, 2.6);
          }
        } else if (this.state === 'react') {
          // High-speed outback sprint away!
          if (target && target.alive) {
            this.targetYaw = Math.atan2(this.position.x - target.position.x, this.position.z - target.position.z);
            this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 9);
            speed = 5.6;
          }
          if (this.stateT >= this.stateDur && dist > 5.5 && this.motor.grounded) {
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.4, 2.4);
          }
        }

        this.vel.x = damp(this.vel.x, Math.sin(this.facing) * speed, 9, dt);
        this.vel.z = damp(this.vel.z, Math.cos(this.facing) * speed, 9, dt);
        this.vel.y -= 20 * dt;
        this.motor.update(dt);

        const horiz = Math.hypot(this.vel.x, this.vel.z);
        if (horiz > 0.25 && this.motor.grounded) {
          this.gaitPhase += dt * 6.0 * (0.65 + horiz * 0.22);
        }
      }
      this.syncHurtbox();
    }

    const horiz = Math.hypot(this.vel.x, this.vel.z);
    const bob = this.alive && this.motor.grounded && horiz > 0.25
      ? Math.abs(Math.sin(this.gaitPhase)) * 0.042
      : 0;
    const pose: EmuPoseName = !this.alive
      ? 'idle0'
      : this.state === 'react'
        ? pickCycle(EMU_SPRINT, (this.gaitPhase / Math.PI) * 3.0)
        : this.state === 'special'
          ? pickCycle(EMU_PECK, this.stateT * 3.0)
          : this.state === 'move'
            ? pickCycle(EMU_WALK, (this.gaitPhase / Math.PI) * 2.6)
            : pickCycle(EMU_IDLE, this.stateT * 2.0);
    const deathSink = this.alive ? 0 : Math.min(0.24, this.deadT * 0.4);
    this.renderBillboard(getEmuPosePack(pose), this.position.y + this.centerY + bob - deathSink, camera, drawingBufferSize);
  }
}
