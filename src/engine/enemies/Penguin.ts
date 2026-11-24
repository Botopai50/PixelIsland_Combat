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
// PINGUIM-IMPERADOR (Emperor Penguin) — 30×38 @ ANIMAL_PPU
// ============================================================================
export type PenguinPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'waddle0' | 'waddle1' | 'waddle2' | 'waddle3' | 'waddle4' | 'waddle5'
  | 'slide0' | 'slide1' | 'slide2' | 'slide3';

export const PENGUIN_PW = 30;
export const PENGUIN_PH = 38;
export const PENGUIN_W = PENGUIN_PW / ANIMAL_PPU;
export const PENGUIN_H = PENGUIN_PH / ANIMAL_PPU;

const PENGUIN_PAL: Record<string, [number, number, number]> = {
  k:  [0x12, 0x15, 0x1e], // 1px outline / pupils / claws / upper beak
  // Glossy deep navy-charcoal tuxedo back, head & flippers
  b0: [0x1c, 0x22, 0x30], // deep navy-slate shadow
  b1: [0x2e, 0x37, 0x4c], // dark tuxedo navy-charcoal
  b2: [0x45, 0x52, 0x6c], // glossy slate-blue mid
  b3: [0x68, 0x78, 0x96], // cool blue-slate sheen highlight
  // Snow-white belly plumage
  w0: [0xb4, 0xc0, 0xd0], // cool ice-blue belly shadow
  w1: [0xd8, 0xe2, 0xee], // soft snow mid
  w2: [0xf2, 0xf6, 0xfc], // crisp snow-white belly
  w3: [0xff, 0xff, 0xff], // pure white chest highlight & eye glint
  // Emperor Penguin golden-yellow / warm orange auricular neck & upper-chest patches
  g0: [0xd9, 0x72, 0x18], // warm orange patch base
  g1: [0xf8, 0xa8, 0x24], // vibrant golden-amber patch
  g2: [0xff, 0xdc, 0x58], // soft lemon-gold upper chest fade
  // Coral-orange lower-mandible beak stripe
  c:  [0xf2, 0x64, 0x38], // coral-orange beak stripe
};

interface PenguinPose {
  bodyY: number;
  bodyRoll: number;    // side-to-side waddle tilt (radians)
  bodyPitch: number;   // 0 = upright, ~1.35 = horizontal belly toboggan slide!
  headPitch: number;
  headYaw: number;
  flipperOut: number;  // how far flipper wings spread out from sides
  flipperSweep: number;// fore-aft flipper angle
  lFootZ: number;
  lFootLift: number;
  rFootZ: number;
  rFootLift: number;
}

const PENGUIN_POSES: Record<PenguinPoseName, PenguinPose> = {
  // Upright breathing & curious head tilt
  idle0: {
    bodyY: 0.0, bodyRoll: 0.0, bodyPitch: 0.0, headPitch: 0.0, headYaw: 0.0,
    flipperOut: 0.05, flipperSweep: 0.0,
    lFootZ: 0.0, lFootLift: 0.0, rFootZ: 0.0, rFootLift: 0.0,
  },
  idle1: {
    bodyY: 0.012, bodyRoll: 0.03, bodyPitch: -0.02, headPitch: 0.05, headYaw: 0.06,
    flipperOut: 0.12, flipperSweep: 0.04,
    lFootZ: 0.0, lFootLift: 0.0, rFootZ: 0.0, rFootLift: 0.0,
  },
  idle2: {
    bodyY: -0.008, bodyRoll: -0.03, bodyPitch: 0.02, headPitch: -0.04, headYaw: -0.06,
    flipperOut: 0.08, flipperSweep: -0.03,
    lFootZ: 0.0, lFootLift: 0.0, rFootZ: 0.0, rFootLift: 0.0,
  },

  // 6-frame iconic side-to-side penguin waddle with flippers out for balance
  waddle0: {
    bodyY: 0.015, bodyRoll: 0.14, bodyPitch: 0.06, headPitch: 0.0, headYaw: -0.04,
    flipperOut: 0.32, flipperSweep: 0.10,
    lFootZ: 0.12, lFootLift: 0.07, rFootZ: -0.10, rFootLift: 0.0,
  },
  waddle1: {
    bodyY: 0.024, bodyRoll: 0.18, bodyPitch: 0.07, headPitch: 0.02, headYaw: -0.05,
    flipperOut: 0.38, flipperSweep: 0.06,
    lFootZ: 0.06, lFootLift: 0.03, rFootZ: -0.04, rFootLift: 0.03,
  },
  waddle2: {
    bodyY: -0.006, bodyRoll: 0.04, bodyPitch: 0.05, headPitch: -0.02, headYaw: 0.0,
    flipperOut: 0.26, flipperSweep: -0.04,
    lFootZ: -0.04, lFootLift: 0.0, rFootZ: 0.07, rFootLift: 0.06,
  },
  waddle3: {
    bodyY: 0.015, bodyRoll: -0.14, bodyPitch: 0.06, headPitch: 0.0, headYaw: 0.04,
    flipperOut: 0.32, flipperSweep: -0.10,
    lFootZ: -0.10, lFootLift: 0.0, rFootZ: 0.12, rFootLift: 0.07,
  },
  waddle4: {
    bodyY: 0.024, bodyRoll: -0.18, bodyPitch: 0.07, headPitch: 0.02, headYaw: 0.05,
    flipperOut: 0.38, flipperSweep: -0.06,
    lFootZ: -0.04, lFootLift: 0.03, rFootZ: 0.06, rFootLift: 0.03,
  },
  waddle5: {
    bodyY: -0.006, bodyRoll: -0.04, bodyPitch: 0.05, headPitch: -0.02, headYaw: 0.0,
    flipperOut: 0.26, flipperSweep: 0.04,
    lFootZ: 0.07, lFootLift: 0.06, rFootZ: -0.04, rFootLift: 0.0,
  },

  // 4-frame playful belly toboggan slide (pitched forward on belly, flippers rowing!)
  slide0: {
    bodyY: -0.18, bodyRoll: 0.0, bodyPitch: 1.32, headPitch: -0.58, headYaw: 0.0,
    flipperOut: 0.45, flipperSweep: 0.22,
    lFootZ: -0.12, lFootLift: 0.04, rFootZ: -0.08, rFootLift: 0.02,
  },
  slide1: {
    bodyY: -0.19, bodyRoll: 0.03, bodyPitch: 1.36, headPitch: -0.62, headYaw: 0.03,
    flipperOut: 0.52, flipperSweep: 0.0,
    lFootZ: -0.14, lFootLift: 0.06, rFootZ: -0.14, rFootLift: 0.06,
  },
  slide2: {
    bodyY: -0.18, bodyRoll: 0.0, bodyPitch: 1.34, headPitch: -0.60, headYaw: 0.0,
    flipperOut: 0.42, flipperSweep: -0.22,
    lFootZ: -0.08, lFootLift: 0.02, rFootZ: -0.12, rFootLift: 0.04,
  },
  slide3: {
    bodyY: -0.19, bodyRoll: -0.03, bodyPitch: 1.36, headPitch: -0.62, headYaw: -0.03,
    flipperOut: 0.48, flipperSweep: 0.04,
    lFootZ: -0.12, lFootLift: 0.05, rFootZ: -0.12, rFootLift: 0.05,
  },
};

const penguinCache = new Map<PenguinPoseName, Boar27Pack>();

 function buildPenguinPosePack(pose: PenguinPoseName): Boar27Pack {
  let pack = penguinCache.get(pose);
  if (!pack) {
    const P = PENGUIN_POSES[pose];
    const cosR = Math.cos(P.bodyRoll);
    const sinR = Math.sin(P.bodyRoll);
    const cosP = Math.cos(P.bodyPitch);
    const sinP = Math.sin(P.bodyPitch);
    const cosHP = Math.cos(P.headPitch);
    const sinHP = Math.sin(P.headPitch);

    const evalFn: SdfEvaluator = (x, y, z) => {
      // Transform world (x, y, z) into pitched & rolled upright penguin torso space (tx, ty, tz)
      const dy0 = y - P.bodyY;
      // Pitch forward around X (positive bodyPitch tips head toward +Z and belly toward -Y)
      const py = dy0 * cosP + z * sinP;
      const pz = -dy0 * sinP + z * cosP;
      // Roll around Z for waddle
      const tx = x * cosR - py * sinR;
      const ty = x * sinR + py * cosR;
      const tz = pz;

      // 1. Plump upright Emperor Penguin torso + short wedge tail
      const lowerBelly = sdEllipsoid(tx, ty, tz, 0, -0.11, 0.02, 0.215, 0.25, 0.205);
      const upperChest = sdEllipsoid(tx, ty, tz, 0,  0.09, 0.01, 0.185, 0.20, 0.175);
      const tailWedge = sdCapsule(tx, ty, tz, 0, -0.26, -0.10, 0, -0.34, -0.24, 0.075, 0.032);

      let body = smin(lowerBelly, upperChest, 0.09);
      body = smin(body, tailWedge, 0.04);

      // 2. Head & neck in local head-pitched space
      const hPivotY = 0.28;
      const hPivotZ = 0.01;
      const hdx = tx - P.headYaw * 0.4;
      const hdy = ty - hPivotY;
      const hdz = tz - hPivotZ;
      const hlz = hdz * cosHP + hdy * sinHP;
      const hly = -hdz * sinHP + hdy * cosHP;

      const neck = sdCapsule(tx, ty, tz, 0, 0.20, 0.01, P.headYaw * 0.3, 0.30, 0.02, 0.155, 0.135);
      const cranium = sdEllipsoid(hdx, hly, hlz, 0, 0.05, 0.01, 0.138, 0.132, 0.148);
      const cheekL = sdEllipsoid(hdx, hly, hlz, -0.09, 0.01, 0.03, 0.075, 0.075, 0.085);
      const cheekR = sdEllipsoid(hdx, hly, hlz,  0.09, 0.01, 0.03, 0.075, 0.075, 0.085);
      const head = smin(cranium, Math.min(cheekL, cheekR), 0.04);

      body = smin(body, neck, 0.06);
      body = smin(body, head, 0.05);

      // Sleek slender curved Emperor Penguin beak (upper black mandible + coral-orange lower stripe)
      const upperBeak = sdCapsule(hdx, hly, hlz, 0, 0.035, 0.12, 0, 0.005, 0.30, 0.042, 0.016);
      const lowerBeak = sdCapsule(hdx, hly, hlz, 0, 0.008, 0.11, 0, -0.012, 0.27, 0.036, 0.014);

      // 3. Stiff paddle-like flipper wings
      const fo = P.flipperOut;
      const fs = P.flipperSweep;
      const flipL = sdCapsule(
        tx, ty, tz,
        -0.175, 0.15, 0.0,
        -0.22 - fo * 0.34, -0.14 + fo * 0.16, fs * 0.28,
        0.052, 0.028,
      );
      const flipR = sdCapsule(
        tx, ty, tz,
        0.175, 0.15, 0.0,
        0.22 + fo * 0.34, -0.14 + fo * 0.16, -fs * 0.28,
        0.052, 0.028,
      );
      const flippers = Math.min(flipL, flipR);
      body = smin(body, flippers, 0.03);

      // 4. Sturdy dark webbed feet
      const footL = sdEllipsoid(
        tx, ty, tz,
        -0.095, -0.37 + P.lFootLift, 0.07 + P.lFootZ,
        0.068, 0.038, 0.105,
      );
      const footR = sdEllipsoid(
        tx, ty, tz,
         0.095, -0.37 + P.rFootLift, 0.07 + P.rFootZ,
        0.068, 0.038, 0.105,
      );
      const feet = Math.min(footL, footR);

      // 5. Expressive dark eyes with white glint
      const eyeL = sdEllipsoid(hdx, hly, hlz, -0.112, 0.058, 0.085, 0.026, 0.026, 0.026);
      const eyeR = sdEllipsoid(hdx, hly, hlz,  0.112, 0.058, 0.085, 0.026, 0.026, 0.026);
      const eyes = Math.min(eyeL, eyeR);

      const glintL = sdEllipsoid(hdx, hly, hlz, -0.120, 0.068, 0.104, 0.011, 0.011, 0.011);
      const glintR = sdEllipsoid(hdx, hly, hlz,  0.120, 0.068, 0.104, 0.011, 0.011, 0.011);
      const glints = Math.min(glintL, glintR);

      let d = body, mat = 'body';
      if (flippers < d + 0.008) { mat = 'flipper'; }
      if (feet < d) { d = feet; mat = 'foot'; }
      if (lowerBeak < d) { d = lowerBeak; mat = 'coralBeak'; }
      if (upperBeak < d) { d = upperBeak; mat = 'darkBeak'; }
      if (eyes < d) { d = eyes; mat = 'eye'; }
      if (glints < d) { d = glints; mat = 'glint'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'glint') return 'w3';
      if (mat === 'eye' || mat === 'darkBeak') return 'k';
      if (mat === 'coralBeak') return 'c';
      if (mat === 'foot') return shade > 0.55 ? 'b1' : 'k';
      if (mat === 'flipper') {
        return shade > 0.72 ? 'b3' : shade > 0.45 ? 'b2' : shade > 0.22 ? 'b1' : 'b0';
      }

      // Recompute local penguin torso coordinates (tx, ty, tz) for crisp Emperor Penguin markings
      const dy0 = y - P.bodyY;
      const py = dy0 * cosP + z * sinP;
      const pz = -dy0 * sinP + z * cosP;
      const tx = x * cosR - py * sinR;
      const ty = x * sinR + py * cosR;
      const tz = pz;

      // 1. Bright golden-yellow / warm orange auricular cheek-to-upper-chest patches!
      // Side tear-drop patches on neck/cheek (ty in [0.16..0.31], |tx| > 0.065, tz > -0.02)
      const isAuricularPatch =
        ty > 0.16 && ty < 0.31 &&
        Math.abs(tx) > 0.065 &&
        tz > -0.02 && tz < 0.13;
      if (isAuricularPatch) {
        return ty > 0.25 ? 'g0' : shade > 0.45 ? 'g2' : 'g1';
      }

      // Warm golden-yellow upper chest wash where the white belly meets the dark throat
      const isGoldenChest =
        ty > 0.08 && ty <= 0.18 &&
        Math.abs(tx) < 0.135 &&
        tz > 0.04;
      if (isGoldenChest) {
        return shade > 0.55 ? 'g2' : 'g1';
      }

      // 2. Plump rounded snow-white tuxedo belly oval (front of torso below throat)
      const bellyCurveW = 0.165 - Math.max(0, ty + 0.05) * 0.22;
      const isWhiteBelly =
        ty < 0.12 && ty > -0.34 &&
        tz > 0.01 &&
        Math.abs(tx) < bellyCurveW;
      if (isWhiteBelly) {
        return shade > 0.78 ? 'w3' : shade > 0.50 ? 'w2' : shade > 0.25 ? 'w1' : 'w0';
      }

      // 3. Glossy deep navy-charcoal tuxedo hood, back, and sides
      return shade > 0.76 ? 'b3' : shade > 0.50 ? 'b2' : shade > 0.25 ? 'b1' : 'b0';
    };

    pack = build27Pack(PENGUIN_PW, PENGUIN_PH, 0.72, 0.88, PENGUIN_PAL, evalFn, shadeFn);
    penguinCache.set(pose, pack);
  }
  return pack;
}

export function getPenguinPosePack(...args: Parameters<typeof buildPenguinPosePack>): ReturnType<typeof buildPenguinPosePack> {
  return registerAnimalSpritePack(buildPenguinPosePack(...args), { module: './Penguin.ts', factory: 'getPenguinPosePack', args }, buildPenguinPosePack);
}

function pickCycle<T>(frames: readonly T[], idx: number): T {
  return sampleAnimalCycle(frames, idx);
}

const PENGUIN_IDLE: readonly PenguinPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const PENGUIN_WADDLE: readonly PenguinPoseName[] = ['waddle0', 'waddle1', 'waddle2', 'waddle3', 'waddle4', 'waddle5'];
const PENGUIN_SLIDE: readonly PenguinPoseName[] = ['slide0', 'slide1', 'slide2', 'slide3'];

export class Penguin extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private readonly home = new THREE.Vector3();
  private state: 'idle' | 'waddle' | 'slide' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.4, 2.8);
  private targetYaw = rand(0, Math.PI * 2);
  private gaitPhase = rand(0, Math.PI * 2);

  private static readonly RADIUS = 0.26;
  private static readonly HEIGHT = 0.62;
  private static readonly CENTER_Y = 0.30;

  constructor(ctx: GameContext, startPos: THREE.Vector3, pondCenter?: THREE.Vector3) {
    super(
      ctx,
      getPenguinPosePack('idle0').getView(2, 0)!,
      PENGUIN_PW,
      PENGUIN_PH,
      PENGUIN_W,
      PENGUIN_H,
      'PenguinBillboard',
    );
    this.hp = 45;
    this.maxHp = 45;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = Penguin.RADIUS;
    this.motor.height = Penguin.HEIGHT;
    this.motor.teleport(startPos);
    this.home.copy(pondCenter ?? startPos);
    this.hurtboxes.push({
      a: new THREE.Vector3(),
      b: new THREE.Vector3(),
      radius: Penguin.RADIUS + 0.08,
      tag: 'body',
      enabled: true,
    });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.set(this.position.x, this.position.y + Penguin.CENTER_Y, this.position.z);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y + Penguin.CENTER_Y * 0.5, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + Penguin.CENTER_Y * 1.5, this.position.z);
    this.hurtboxes[0].enabled = this.alive;
    this.stickRoot.position.set(this.position.x, this.position.y + Penguin.CENTER_Y, this.position.z);
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
    this.vel.y = 2.8;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      // Escape with a fast belly toboggan slide!
      this.state = 'slide';
      this.stateT = 0;
      this.stateDur = 2.0;
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
        if (dist < 3.0 && this.state !== 'slide') {
          this.state = 'slide';
          this.stateT = 0;
          this.stateDur = 1.8;
          if (target) {
            this.targetYaw = Math.atan2(this.position.x - target.position.x, this.position.z - target.position.z);
          }
        }

        if (this.state === 'idle') {
          if (this.stateT >= this.stateDur) {
            this.state = Math.random() < 0.28 ? 'slide' : 'waddle';
            this.stateT = 0;
            this.stateDur = this.state === 'slide' ? rand(1.4, 2.2) : rand(1.8, 3.2);
            const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
            this.targetYaw = toHome > 6.5
              ? Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.5, 0.5)
              : this.facing + rand(-1.6, 1.6);
          }
        } else if (this.state === 'waddle') {
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 5.5);
          speed = 1.45;
          if (this.stateT >= this.stateDur && this.motor.grounded) {
            this.state = Math.random() < 0.30 ? 'slide' : 'idle';
            this.stateT = 0;
            this.stateDur = this.state === 'slide' ? rand(1.3, 2.0) : rand(1.4, 2.6);
          }
        } else if (this.state === 'slide') {
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 7.5);
          speed = 3.8;
          if (this.stateT >= this.stateDur && this.motor.grounded) {
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.2, 2.2);
          }
        }

        this.vel.x = damp(this.vel.x, Math.sin(this.facing) * speed, this.state === 'slide' ? 5.5 : 8.5, dt);
        this.vel.z = damp(this.vel.z, Math.cos(this.facing) * speed, this.state === 'slide' ? 5.5 : 8.5, dt);
        this.vel.y -= 20 * dt;
        this.motor.update(dt);

        const targetPitch = !this.motor.grounded ? Math.max(-0.24, Math.min(0.24, this.vel.y * 0.045)) : 0;
        this.bodyPitch = damp(this.bodyPitch, targetPitch, 10, dt);

        const horiz = Math.hypot(this.vel.x, this.vel.z);
        if (horiz > 0.18 && this.motor.grounded) {
          this.gaitPhase += dt * 6.4 * (0.65 + horiz * 0.22);
        }
      }
      this.syncHurtbox();
    }

    const horiz = Math.hypot(this.vel.x, this.vel.z);
    const bob = this.alive && this.motor.grounded && horiz > 0.18 && this.state === 'waddle'
      ? Math.abs(Math.sin(this.gaitPhase)) * 0.025
      : 0;

    let pose: PenguinPoseName;
    if (!this.alive) {
      pose = 'slide0';
    } else if (this.state === 'slide') {
      pose = pickCycle(PENGUIN_SLIDE, (this.gaitPhase / Math.PI) * 2.2);
    } else if (this.state === 'waddle') {
      pose = pickCycle(PENGUIN_WADDLE, (this.gaitPhase / Math.PI) * 2.6);
    } else {
      pose = pickCycle(PENGUIN_IDLE, this.stateT * 2.0);
    }

    const deathSink = this.alive ? 0 : Math.min(0.18, this.deadT * 0.4);
    this.renderBillboard(getPenguinPosePack(pose), this.position.y + Penguin.CENTER_Y + bob - deathSink, camera, drawingBufferSize);
  }
}
