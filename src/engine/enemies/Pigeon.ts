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
// POMBO (Rock Pigeon) — Flagship 26×24 @ 56 PPU
// ============================================================================
const ANIMAL_PPU = 56;

export type PigeonPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'walk0' | 'walk1' | 'walk2' | 'walk3' | 'walk4' | 'walk5'
  | 'peck0' | 'peck1' | 'peck2'
  | 'flap0' | 'flap1' | 'flap2' | 'flap3' | 'flap4' | 'flap5';

export const PIGEON_PW = 26;
export const PIGEON_PH = 24;
export const PIGEON_W = PIGEON_PW / ANIMAL_PPU;
export const PIGEON_H = PIGEON_PH / ANIMAL_PPU;

const PIGEON_PAL: Record<string, [number, number, number]> = {
  k:  [0x14, 0x16, 0x1c], // 1px dark outline / pupil / beak tip
  w:  [0xf7, 0xf9, 0xfc], // white fleshy nasal cere & eye glint
  b0: [0x24, 0x28, 0x33], // dark charcoal-black wing bars & terminal tail band
  b1: [0x3b, 0x41, 0x4f], // dark slate head/neck base & beak
  g0: [0x58, 0x62, 0x73], // powder-blue-grey shadow
  g1: [0x7c, 0x88, 0x9c], // medium blue-grey body
  g2: [0xa3, 0xb0, 0xc4], // soft powder-blue-grey wing shield
  g3: [0xc7, 0xd2, 0xe3], // pale silver-grey wing highlight
  g4: [0xe3, 0xeb, 0xf5], // crisp top plumage highlight
  m0: [0x1c, 0x7a, 0x5c], // iridescent emerald-green neck gorget shadow
  m1: [0x38, 0xc4, 0x8f], // iridescent emerald-green neck gorget highlight
  v0: [0x6e, 0x32, 0x82], // iridescent violet-purple lower gorget
  v1: [0xa6, 0x56, 0xbd], // iridescent magenta-violet neck sheen
  e:  [0xf5, 0x5a, 0x1d], // bright ruby-orange pigeon eye
  p0: [0xb8, 0x4b, 0x5a], // coral-pink legs shadow
  p1: [0xe8, 0x72, 0x82], // coral-pink legs & toes
};

interface PigeonPose {
  bodyY: number;
  bodyPitch: number; // tilts forward in peck0..2
  chestPuff: number; // puffed cooing breast
  headFwd: number;   // classic pigeon head-bobbing thrust
  headY: number;
  legL: number;
  legR: number;
  liftL: number;
  liftR: number;
  wingSpread: number; // 0 = folded against flank, 1 = spread in flap0..5
  wingLift: number;   // -0.4..+0.55 flap cycle
}

const PIGEON_POSES: Record<PigeonPoseName, PigeonPose> = {
  // Puffed chest cooing & subtle head turn
  idle0: { bodyY: 0.0,    bodyPitch: 0.0,   chestPuff: 0.02, headFwd: 0.0,   headY: 0.0,   legL: 0.0,   legR: 0.0,   liftL: 0.0,  liftR: 0.0,  wingSpread: 0.0, wingLift: 0.0  },
  idle1: { bodyY: 0.012,  bodyPitch: 0.02,  chestPuff: 0.06, headFwd: -0.02, headY: 0.02,  legL: 0.0,   legR: 0.0,   liftL: 0.0,  liftR: 0.0,  wingSpread: 0.0, wingLift: 0.0  },
  idle2: { bodyY: -0.006, bodyPitch: -0.01, chestPuff: 0.03, headFwd: 0.01,  headY: -0.01, legL: 0.0,   legR: 0.0,   liftL: 0.0,  liftR: 0.0,  wingSpread: 0.0, wingLift: 0.0  },

  // Classic head-bobbing pigeon strut!
  walk0: { bodyY: 0.014,  bodyPitch: -0.02, chestPuff: 0.02, headFwd: 0.08,  headY: -0.01, legL: 0.12,  legR: -0.10, liftL: 0.06, liftR: 0.0,  wingSpread: 0.0, wingLift: 0.0  },
  walk1: { bodyY: 0.022,  bodyPitch: 0.0,   chestPuff: 0.03, headFwd: 0.03,  headY: 0.01,  legL: 0.05,  legR: -0.03, liftL: 0.02, liftR: 0.03, wingSpread: 0.0, wingLift: 0.0  },
  walk2: { bodyY: 0.004,  bodyPitch: 0.01,  chestPuff: 0.02, headFwd: -0.04, headY: 0.02,  legL: -0.04, legR: 0.06,  liftL: 0.0,  liftR: 0.06, wingSpread: 0.0, wingLift: 0.0  },
  walk3: { bodyY: 0.014,  bodyPitch: -0.02, chestPuff: 0.02, headFwd: 0.08,  headY: -0.01, legL: -0.10, legR: 0.12,  liftL: 0.0,  liftR: 0.06, wingSpread: 0.0, wingLift: 0.0  },
  walk4: { bodyY: 0.022,  bodyPitch: 0.0,   chestPuff: 0.03, headFwd: 0.03,  headY: 0.01,  legL: -0.03, legR: 0.05,  liftL: 0.03, liftR: 0.02, wingSpread: 0.0, wingLift: 0.0  },
  walk5: { bodyY: 0.004,  bodyPitch: 0.01,  chestPuff: 0.02, headFwd: -0.04, headY: 0.02,  legL: 0.06,  legR: -0.04, liftL: 0.06, liftR: 0.0,  wingSpread: 0.0, wingLift: 0.0  },

  // Pecking seeds on the ground
  peck0: { bodyY: -0.02,  bodyPitch: -0.16, chestPuff: 0.0,  headFwd: 0.10,  headY: -0.16, legL: 0.02,  legR: -0.02, liftL: 0.0,  liftR: 0.0,  wingSpread: 0.0, wingLift: 0.0  },
  peck1: { bodyY: -0.04,  bodyPitch: -0.28, chestPuff: 0.0,  headFwd: 0.16,  headY: -0.32, legL: 0.03,  legR: -0.02, liftL: 0.0,  liftR: 0.0,  wingSpread: 0.0, wingLift: 0.0  },
  peck2: { bodyY: -0.02,  bodyPitch: -0.18, chestPuff: 0.0,  headFwd: 0.12,  headY: -0.20, legL: 0.02,  legR: -0.02, liftL: 0.0,  liftR: 0.0,  wingSpread: 0.0, wingLift: 0.0  },

  // Startled wing-clap takeoff & flight!
  flap0: { bodyY: 0.06,   bodyPitch: 0.08,  chestPuff: 0.03, headFwd: 0.04,  headY: 0.04,  legL: -0.06, legR: -0.06, liftL: 0.10, liftR: 0.10, wingSpread: 1.0, wingLift: 0.48 },
  flap1: { bodyY: 0.09,   bodyPitch: 0.06,  chestPuff: 0.03, headFwd: 0.05,  headY: 0.05,  legL: -0.08, legR: -0.08, liftL: 0.12, liftR: 0.12, wingSpread: 1.0, wingLift: 0.20 },
  flap2: { bodyY: 0.11,   bodyPitch: 0.04,  chestPuff: 0.02, headFwd: 0.05,  headY: 0.04,  legL: -0.08, legR: -0.08, liftL: 0.12, liftR: 0.12, wingSpread: 1.0, wingLift: -0.18 },
  flap3: { bodyY: 0.08,   bodyPitch: 0.03,  chestPuff: 0.02, headFwd: 0.04,  headY: 0.03,  legL: -0.08, legR: -0.08, liftL: 0.12, liftR: 0.12, wingSpread: 1.0, wingLift: -0.34 },
  flap4: { bodyY: 0.06,   bodyPitch: 0.05,  chestPuff: 0.02, headFwd: 0.04,  headY: 0.03,  legL: -0.08, legR: -0.08, liftL: 0.12, liftR: 0.12, wingSpread: 1.0, wingLift: 0.04 },
  flap5: { bodyY: 0.07,   bodyPitch: 0.07,  chestPuff: 0.03, headFwd: 0.04,  headY: 0.04,  legL: -0.06, legR: -0.06, liftL: 0.10, liftR: 0.10, wingSpread: 1.0, wingLift: 0.36 },
};

const pigeonCache = new Map<PigeonPoseName, Boar27Pack>();
 function buildPigeonPosePack(pose: PigeonPoseName): Boar27Pack {
  let pack = pigeonCache.get(pose);
  if (!pack) {
    const P = PIGEON_POSES[pose];
    const by = P.bodyY;
    const bp = P.bodyPitch;
    const hy = 0.25 + by + P.headY;
    const hz = 0.20 + P.headFwd;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // --------------------------------------------------------------------
      // 1. PLUMP ROUNDED BREAST, TORSO, FANNED TAIL & NECK
      // --------------------------------------------------------------------
      const torso = sdEllipsoid(x, y, z, 0, 0.02 + by, -0.02, 0.21, 0.19, 0.27);
      const breast = sdEllipsoid(x, y, z, 0, 0.03 + by + bp * 0.10, 0.14 + P.chestPuff, 0.195 + P.chestPuff * 0.4, 0.18 + P.chestPuff * 0.3, 0.19 + P.chestPuff);
      const neck = sdCapsule(x, y, z, 0, 0.11 + by + bp * 0.12, 0.14, 0, hy - 0.03, hz - 0.02, 0.125, 0.105);
      const head = sdEllipsoid(x, y, z, 0, hy, hz, 0.115, 0.11, 0.125);

      // Fanned pigeon tail sloping backward
      const tailY = -0.04 + by - bp * 0.22;
      const tail = sdCapsule(x, y, z, 0, 0.00 + by, -0.22, 0, tailY, -0.50, 0.135, 0.115);

      // --------------------------------------------------------------------
      // 2. SMOOTH CONTINUOUS WINGS (folded shield or wide flapping wings)
      // --------------------------------------------------------------------
      let wings: number;
      if (P.wingSpread < 0.1) {
        // Folded smoothly against the flanks
        const wL = sdEllipsoid(x, y, z, -0.155, 0.04 + by, -0.04, 0.095, 0.145, 0.25);
        const wR = sdEllipsoid(x, y, z,  0.155, 0.04 + by, -0.04, 0.095, 0.145, 0.25);
        wings = Math.min(wL, wR);
      } else {
        // Smooth continuous outstretched wings (generous overlap, NO dark seam!)
        const wl = P.wingLift;
        const wInL = sdCapsule(x, y, z, -0.14, 0.08 + by, 0.02, -0.44, 0.14 + by + wl * 0.55, -0.02, 0.11, 0.095);
        const wOutL = sdCapsule(x, y, z, -0.40, 0.14 + by + wl * 0.50, -0.02, -0.72, 0.18 + by + wl, -0.10, 0.095, 0.055);
        const wInR = sdCapsule(x, y, z,  0.14, 0.08 + by, 0.02,  0.44, 0.14 + by + wl * 0.55, -0.02, 0.11, 0.095);
        const wOutR = sdCapsule(x, y, z,  0.40, 0.14 + by + wl * 0.50, -0.02,  0.72, 0.18 + by + wl, -0.10, 0.095, 0.055);
        wings = Math.min(smin(wInL, wOutL, 0.06), smin(wInR, wOutR, 0.06));
      }

      // --------------------------------------------------------------------
      // 3. SHORT DARK-SLATE BEAK WITH WHITE FLESHY CERE & RUBY-ORANGE EYES
      // --------------------------------------------------------------------
      const beak = sdCapsule(x, y, z, 0, hy - 0.015, hz + 0.09, 0, hy - 0.03 + bp * 0.18, hz + 0.23, 0.046, 0.018);
      // White fleshy nasal cere at base of upper beak!
      const cere = sdEllipsoid(x, y, z, 0, hy + 0.012, hz + 0.125, 0.042, 0.030, 0.032);

      const eyeL = sdEllipsoid(x, y, z, -0.092, hy + 0.018, hz + 0.055, 0.032, 0.032, 0.030);
      const eyeR = sdEllipsoid(x, y, z,  0.092, hy + 0.018, hz + 0.055, 0.032, 0.032, 0.030);
      const pupilL = sdEllipsoid(x, y, z, -0.104, hy + 0.018, hz + 0.065, 0.016, 0.016, 0.016);
      const pupilR = sdEllipsoid(x, y, z,  0.104, hy + 0.018, hz + 0.065, 0.016, 0.016, 0.016);
      const glintL = sdEllipsoid(x, y, z, -0.108, hy + 0.028, hz + 0.072, 0.011, 0.011, 0.011);
      const glintR = sdEllipsoid(x, y, z,  0.108, hy + 0.028, hz + 0.072, 0.011, 0.011, 0.011);

      // --------------------------------------------------------------------
      // 4. CORAL-PINK LEGS & TOES
      // --------------------------------------------------------------------
      const footYL = -0.34 + P.liftL;
      const footYR = -0.34 + P.liftR;
      const footZL = 0.02 + P.legL;
      const footZR = 0.02 + P.legR;
      const legL = sdCapsule(x, y, z, -0.085, -0.12 + by, 0.0, -0.09, footYL, footZL, 0.038, 0.026);
      const legR = sdCapsule(x, y, z,  0.085, -0.12 + by, 0.0,  0.09, footYR, footZR, 0.038, 0.026);
      const toeL = sdCapsule(x, y, z, -0.09, footYL, footZL - 0.02, -0.09, footYL - 0.01, footZL + 0.09, 0.028, 0.020);
      const toeR = sdCapsule(x, y, z,  0.09, footYR, footZR - 0.02,  0.09, footYR - 0.01, footZR + 0.09, 0.028, 0.020);
      const legs = Math.min(smin(legL, toeL, 0.015), smin(legR, toeR, 0.015));

      let body = smin(torso, breast, 0.06);
      body = smin(body, neck, 0.05);
      body = smin(body, head, 0.04);
      body = smin(body, tail, 0.04);
      body = smin(body, wings, 0.045);

      let d = body;
      let mat = 'plumage';
      if (legs < d) { d = legs; mat = 'leg'; }
      if (beak < d) { d = beak; mat = 'beak'; }
      if (cere < d) { d = cere; mat = 'cere'; }
      if (Math.min(eyeL, eyeR) < d) { d = Math.min(eyeL, eyeR); mat = 'eye'; }
      if (Math.min(pupilL, pupilR) < d) { d = Math.min(pupilL, pupilR); mat = 'pupil'; }
      if (Math.min(glintL, glintR) < d) { d = Math.min(glintL, glintR); mat = 'glint'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'glint' || mat === 'cere') return 'w';
      if (mat === 'pupil') return 'k';
      if (mat === 'eye') return 'e';
      if (mat === 'beak') return shade > 0.45 ? 'b1' : 'k';
      if (mat === 'leg') return shade > 0.42 ? 'p1' : 'p0';

      // Unmistakable iridescent emerald-green & violet-purple metallic neck/gorget sheen!
      const inGorget = y > 0.07 + by + P.headY * 0.4 && y < hy - 0.03 && z > 0.04 + P.headFwd * 0.4;
      if (inGorget) {
        if (y > 0.13 + by + P.headY * 0.5) {
          return shade > 0.48 ? 'm1' : 'm0'; // emerald-green upper gorget
        }
        return shade > 0.48 ? 'v1' : 'v0'; // violet-purple lower gorget
      }

      // Darker slate head & upper neck
      if (y > hy - 0.06 && z > hz - 0.12) {
        return shade > 0.62 ? 'g1' : shade > 0.30 ? 'g0' : 'b1';
      }

      // Dark terminal tail band
      if (z < -0.40) {
        return shade > 0.52 ? 'b1' : 'b0';
      }

      // Two crisp dark charcoal-black bars across the pale-grey wings!
      const onFoldedWing = P.wingSpread < 0.1 && Math.abs(x) > 0.13 && y > -0.06 + by && y < 0.16 + by;
      const onSpreadWing = P.wingSpread >= 0.1 && Math.abs(x) > 0.22;
      if (onFoldedWing) {
        const bar1 = Math.abs(z - (-0.06)) < 0.032;
        const bar2 = Math.abs(z - (-0.16)) < 0.032;
        if (bar1 || bar2) return shade > 0.55 ? 'b1' : 'b0';
        return shade > 0.68 ? 'g3' : shade > 0.36 ? 'g2' : 'g1';
      }
      if (onSpreadWing) {
        const bar1 = Math.abs(Math.abs(x) - 0.34) < 0.038;
        const bar2 = Math.abs(Math.abs(x) - 0.48) < 0.038;
        if (bar1 || bar2) return shade > 0.55 ? 'b1' : 'b0';
        if (Math.abs(x) > 0.58) return shade > 0.50 ? 'b1' : 'b0'; // dark primary tips
        return shade > 0.68 ? 'g3' : shade > 0.36 ? 'g2' : 'g1';
      }

      // Soft powder-blue-grey plumage
      if (shade > 0.80) return 'g4';
      if (shade > 0.58) return 'g3';
      if (shade > 0.38) return 'g2';
      if (shade > 0.20) return 'g1';
      return 'g0';
    };

    pack = build27Pack(PIGEON_PW, PIGEON_PH, 0.86, 0.76, PIGEON_PAL, evalFn, shadeFn);
    pigeonCache.set(pose, pack);
  }
  return pack;
}

export function getPigeonPosePack(...args: Parameters<typeof buildPigeonPosePack>): ReturnType<typeof buildPigeonPosePack> {
  return registerAnimalSpritePack(buildPigeonPosePack(...args), { module: './Pigeon.ts', factory: 'getPigeonPosePack', args }, buildPigeonPosePack);
}

// ============================================================================
// INSTÂNCIA NA ARENA (Pigeon)
// ============================================================================
function pickCycle<T>(frames: readonly T[], idx: number): T {
  return sampleAnimalCycle(frames, idx);
}

const PIGEON_IDLE: readonly PigeonPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const PIGEON_WALK: readonly PigeonPoseName[] = ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'];
const PIGEON_PECK: readonly PigeonPoseName[] = ['peck0', 'peck1', 'peck2', 'peck1', 'peck0'];
const PIGEON_FLAP: readonly PigeonPoseName[] = ['flap0', 'flap1', 'flap2', 'flap3', 'flap4', 'flap5'];

export class Pigeon extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private home = new THREE.Vector3();
  private state: 'idle' | 'special' | 'move' | 'react' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.2, 2.5);
  private targetYaw = rand(0, Math.PI * 2);
  private gaitPhase = rand(0, Math.PI * 2);
  private flapCooldown = 0;
  private readonly centerY = 0.17;

  constructor(ctx: GameContext, startPos: THREE.Vector3) {
    super(
      ctx,
      getPigeonPosePack('idle0').getView(2, 0)!,
      PIGEON_PW,
      PIGEON_PH,
      PIGEON_W,
      PIGEON_H,
      'PigeonBillboard',
    );
    this.hp = 18;
    this.maxHp = 18;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.18;
    this.motor.height = 0.32;
    this.motor.teleport(startPos);
    this.home.copy(startPos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.25, tag: 'body', enabled: true });
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
    this.vel.x += hit.dir.x * 4.2;
    this.vel.z += hit.dir.z * 4.2;
    this.vel.y = 4.2;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.state = 'react';
      this.stateT = 0;
      this.stateDur = 1.8;
    }
    return res;
  }

  update(dt: number, target: EnemyTarget | null, camera: THREE.Camera, drawingBufferSize?: THREE.Vector2) {
    if (dt > 0) {
      this.stateT += dt;
      this.flapCooldown = Math.max(0, this.flapCooldown - dt);
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
        if (dist < 3.0 && this.state !== 'react') {
          this.state = 'react';
          this.stateT = 0;
          this.stateDur = 1.7;
        }

        if (this.state === 'idle') {
          if (this.stateT >= this.stateDur) {
            this.state = Math.random() < 0.48 ? 'special' : 'move';
            this.stateT = 0;
            this.stateDur = rand(1.4, 2.6);
            const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
            this.targetYaw = toHome > 7.5
              ? Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.5, 0.5)
              : this.facing + rand(-1.8, 1.8);
          }
        } else if (this.state === 'special') {
          if (this.stateT >= this.stateDur) {
            this.state = 'move';
            this.stateT = 0;
            this.stateDur = rand(1.5, 2.6);
          }
        } else if (this.state === 'move') {
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 7);
          speed = 1.55;
          if (this.stateT >= this.stateDur && this.motor.grounded) {
            this.state = Math.random() < 0.50 ? 'special' : 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.3, 2.4);
          }
        } else if (this.state === 'react') {
          // Startled wing-clap flutter takeoff!
          if (target && target.alive) {
            this.targetYaw = Math.atan2(this.position.x - target.position.x, this.position.z - target.position.z);
            this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 10);
            speed = 4.6;
            if (this.motor.grounded && this.flapCooldown <= 0) {
              this.vel.y = 4.8;
              this.flapCooldown = 0.55;
            }
          }
          if (this.stateT >= this.stateDur && dist > 4.4 && this.motor.grounded) {
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.2, 2.2);
          }
        }

        this.vel.x = damp(this.vel.x, Math.sin(this.facing) * speed, 9, dt);
        this.vel.z = damp(this.vel.z, Math.cos(this.facing) * speed, 9, dt);
        this.vel.y -= 18 * dt;
        this.motor.update(dt);

        const horiz = Math.hypot(this.vel.x, this.vel.z);
        if (horiz > 0.25 && this.motor.grounded) {
          this.gaitPhase += dt * 7.2 * (0.65 + horiz * 0.22);
        }
      }
      this.syncHurtbox();
    }

    const horiz = Math.hypot(this.vel.x, this.vel.z);
    const bob = this.alive && this.motor.grounded && horiz > 0.25
      ? Math.abs(Math.sin(this.gaitPhase)) * 0.02
      : 0;
    const pose: PigeonPoseName = !this.alive
      ? 'idle0'
      : !this.motor.grounded || this.state === 'react'
        ? pickCycle(PIGEON_FLAP, this.stateT * 14.0)
        : this.state === 'special'
          ? pickCycle(PIGEON_PECK, this.stateT * 4.2)
          : this.state === 'move'
            ? pickCycle(PIGEON_WALK, (this.gaitPhase / Math.PI) * 3.0)
            : pickCycle(PIGEON_IDLE, this.stateT * 2.2);
    const deathSink = this.alive ? 0 : Math.min(0.20, this.deadT * 0.4);
    this.renderBillboard(getPigeonPosePack(pose), this.position.y + this.centerY + bob - deathSink, camera, drawingBufferSize);
  }
}
