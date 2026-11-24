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
// LAGOSTA (Flagship Armored Lobster) — 48×26 @ 56 PPU
// ============================================================================
export type LobsterPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'walk0' | 'walk1' | 'walk2' | 'walk3' | 'walk4' | 'walk5'
  | 'snap0' | 'snap1' | 'snap2';

export const LOBSTER_PW = 48;
export const LOBSTER_PH = 26;
export const LOBSTER_W = LOBSTER_PW / ANIMAL_PPU;
export const LOBSTER_H = LOBSTER_PH / ANIMAL_PPU;

const LOBSTER_PAL: Record<string, [number, number, number]> = {
  k:  [0x16, 0x0b, 0x0d], // crisp 1px dark outline / glossy eyes
  l0: [0x6b, 0x11, 0x14], // deep scarlet-maroon shadow / segment grooves
  l1: [0xa8, 0x1e, 0x18], // rich deep scarlet carapace
  l2: [0xdb, 0x3b, 0x1e], // vibrant vermilion-orange midtone
  l3: [0xf7, 0x6c, 0x2a], // sunlit tangerine-orange
  l4: [0xff, 0xb2, 0x5c], // glossy orange-gold specular shell highlight
  a0: [0xc4, 0x82, 0x42], // warm amber underside shadow
  a1: [0xf2, 0xbe, 0x74], // bright warm amber underside & pincer teeth
  W:  [0xff, 0xfb, 0xf4], // crisp white eye glint
};

interface LobsterPose {
  bodyY: number;
  tailCurl: number;
  clawLiftL: number;
  clawLiftR: number;
  clawFwd: number;
  clawOpenL: number;
  clawOpenR: number;
  legWave: number;
  antWave: number;
}

const LOBSTER_POSES: Record<LobsterPoseName, LobsterPose> = {
  idle0: {
    bodyY: 0.00, tailCurl: 0.00,
    clawLiftL: 0.00, clawLiftR: 0.02, clawFwd: 0.00,
    clawOpenL: 0.14, clawOpenR: 0.18, legWave: 0.00, antWave: 0.00,
  },
  idle1: {
    bodyY: 0.014, tailCurl: 0.03,
    clawLiftL: 0.04, clawLiftR: 0.06, clawFwd: 0.02,
    clawOpenL: 0.24, clawOpenR: 0.28, legWave: 0.25, antWave: 0.05,
  },
  idle2: {
    bodyY: -0.01, tailCurl: -0.02,
    clawLiftL: -0.02, clawLiftR: 0.00, clawFwd: -0.01,
    clawOpenL: 0.08, clawOpenR: 0.12, legWave: -0.25, antWave: -0.05,
  },

  // Forward crustacean crawl (8 jointed legs waving)
  walk0: {
    bodyY: 0.012, tailCurl: 0.02,
    clawLiftL: 0.05, clawLiftR: 0.07, clawFwd: 0.03,
    clawOpenL: 0.20, clawOpenR: 0.24, legWave: 0.00, antWave: 0.03,
  },
  walk1: {
    bodyY: 0.022, tailCurl: 0.04,
    clawLiftL: 0.07, clawLiftR: 0.09, clawFwd: 0.04,
    clawOpenL: 0.24, clawOpenR: 0.28, legWave: 1.05, antWave: 0.06,
  },
  walk2: {
    bodyY: 0.008, tailCurl: 0.01,
    clawLiftL: 0.04, clawLiftR: 0.06, clawFwd: 0.02,
    clawOpenL: 0.16, clawOpenR: 0.20, legWave: 2.09, antWave: 0.02,
  },
  walk3: {
    bodyY: 0.014, tailCurl: 0.02,
    clawLiftL: 0.06, clawLiftR: 0.08, clawFwd: 0.03,
    clawOpenL: 0.22, clawOpenR: 0.26, legWave: 3.14, antWave: -0.03,
  },
  walk4: {
    bodyY: 0.024, tailCurl: 0.04,
    clawLiftL: 0.08, clawLiftR: 0.10, clawFwd: 0.04,
    clawOpenL: 0.26, clawOpenR: 0.30, legWave: 4.19, antWave: -0.06,
  },
  walk5: {
    bodyY: 0.008, tailCurl: 0.01,
    clawLiftL: 0.04, clawLiftR: 0.06, clawFwd: 0.02,
    clawOpenL: 0.18, clawOpenR: 0.22, legWave: 5.24, antWave: -0.02,
  },

  // Defensive snap: claws raised high & snapping wide
  snap0: {
    bodyY: 0.028, tailCurl: 0.08,
    clawLiftL: 0.18, clawLiftR: 0.24, clawFwd: 0.06,
    clawOpenL: 0.72, clawOpenR: 0.86, legWave: 0.2, antWave: 0.08,
  },
  snap1: {
    bodyY: 0.045, tailCurl: 0.14,
    clawLiftL: 0.28, clawLiftR: 0.34, clawFwd: 0.10,
    clawOpenL: 1.00, clawOpenR: 1.00, legWave: 0.5, antWave: 0.12,
  },
  snap2: {
    bodyY: 0.015, tailCurl: 0.04,
    clawLiftL: 0.20, clawLiftR: 0.24, clawFwd: 0.13,
    clawOpenL: 0.02, clawOpenR: 0.02, legWave: -0.3, antWave: -0.04,
  },
};

const lobsterCache = new Map<LobsterPoseName, Boar27Pack>();
 function buildLobsterPosePack(pose: LobsterPoseName): Boar27Pack {
  let pack = lobsterCache.get(pose);
  if (!pack) {
    const P = LOBSTER_POSES[pose];
    const by = P.bodyY;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // 1. Elongated armored cephalothorax + pointed rostrum
      const thorax = sdEllipsoid(x, y, z, 0, 0.00 + by, 0.16, 0.165, 0.135, 0.25);
      const rostrum = sdCapsule(x, y, z, 0, 0.02 + by, 0.36, 0, 0.04 + by, 0.52, 0.044, 0.014);
      let body = smin(thorax, rostrum, 0.03);

      // 2. Five segmented curved tail plates (abdominal somites)
      let tailSegs = 99;
      for (let i = 0; i < 5; i++) {
        const t = i / 4;
        const sz = -0.08 - i * 0.115;
        const sy = -0.01 + by - t * t * (0.07 + P.tailCurl * 0.22);
        const rx = 0.145 * (1 - t * 0.34);
        const ry = 0.105 * (1 - t * 0.34);
        const seg = sdEllipsoid(x, y, z, 0, sy, sz, rx, ry, 0.082);
        tailSegs = smin(tailSegs, seg, 0.022);
      }
      body = smin(body, tailSegs, 0.035);

      // 3. Broad 5-blade fanned tail (central telson + 2 pairs of uropods)
      const fanY = -0.09 + by - P.tailCurl * 0.25;
      const fanZ = -0.60;
      const telson = sdEllipsoid(x, y, z, 0, fanY, fanZ - 0.11, 0.068, 0.026, 0.11);
      const uroInL = sdEllipsoid(x, y, z, -0.095, fanY - 0.005, fanZ - 0.09, 0.062, 0.024, 0.10);
      const uroInR = sdEllipsoid(x, y, z,  0.095, fanY - 0.005, fanZ - 0.09, 0.062, 0.024, 0.10);
      const uroOutL = sdEllipsoid(x, y, z, -0.175, fanY - 0.01, fanZ - 0.05, 0.056, 0.022, 0.085);
      const uroOutR = sdEllipsoid(x, y, z,  0.175, fanY - 0.01, fanZ - 0.05, 0.056, 0.022, 0.085);
      const tailFan = smin(
        telson,
        smin(Math.min(uroInL, uroInR), Math.min(uroOutL, uroOutR), 0.02),
        0.025
      );
      body = smin(body, tailFan, 0.03);

      // 4. Eight small jointed walking legs underneath (4 per side)
      let legs = 99;
      for (let side = -1; side <= 1; side += 2) {
        for (let i = 0; i < 4; i++) {
          const baseZ = -0.06 + i * 0.115;
          const phase = P.legWave + i * 1.57 + (side < 0 ? 0 : Math.PI);
          const lift = Math.max(0, Math.sin(phase)) * 0.065;
          const swing = Math.cos(phase) * 0.055;

          const hipX = side * 0.14;
          const hipY = -0.07 + by;
          const kneeX = side * 0.27;
          const kneeY = -0.05 + by + lift;
          const kneeZ = baseZ + swing * 0.45;
          const footX = side * 0.34;
          const footY = -0.23 + lift * 1.1;
          const footZ = baseZ + swing;

          const femur = sdCapsule(x, y, z, hipX, hipY, baseZ, kneeX, kneeY, kneeZ, 0.028, 0.021);
          const tibia = sdCapsule(x, y, z, kneeX, kneeY, kneeZ, footX, footY, footZ, 0.020, 0.012);
          legs = Math.min(legs, smin(femur, tibia, 0.012));
        }
      }
      body = smin(body, legs, 0.02);

      // 5. Two huge, heavy forward-reaching articulated pincer claws (right crusher > left cutter)
      let claws = 99;
      let clawTips = 99;
      for (let side = -1; side <= 1; side += 2) {
        const isCrusher = side > 0;
        const scale = isCrusher ? 1.15 : 0.94;
        const lift = isCrusher ? P.clawLiftR : P.clawLiftL;
        const open = (isCrusher ? P.clawOpenR : P.clawOpenL) * 0.105 * scale;

        const shX = side * 0.13;
        const shY = -0.03 + by;
        const shZ = 0.32;

        const elbowX = side * (0.25 + (isCrusher ? 0.02 : 0.0));
        const elbowY = 0.00 + by + lift * 0.5;
        const elbowZ = 0.48 + P.clawFwd * 0.5;

        const palmX = side * (0.23 + (isCrusher ? 0.02 : 0.0));
        const palmY = 0.03 + by + lift;
        const palmZ = 0.64 + P.clawFwd;

        const arm = sdCapsule(x, y, z, shX, shY, shZ, elbowX, elbowY, elbowZ, 0.044 * scale, 0.052 * scale);
        const wrist = sdCapsule(x, y, z, elbowX, elbowY, elbowZ, palmX, palmY, palmZ, 0.050 * scale, 0.062 * scale);
        const palm = sdEllipsoid(x, y, z, palmX, palmY, palmZ + 0.04, 0.095 * scale, 0.072 * scale, 0.135 * scale);

        const tipX = side * (0.14 + (isCrusher ? 0.01 : 0.0));
        const tipZ = palmZ + 0.25 * scale;
        const upperJaw = sdCapsule(
          x, y, z,
          palmX - side * 0.02, palmY + 0.038 * scale + open * 0.35, palmZ + 0.10 * scale,
          tipX, palmY + 0.048 * scale + open, tipZ,
          0.036 * scale, 0.015 * scale
        );
        const lowerJaw = sdCapsule(
          x, y, z,
          palmX - side * 0.01, palmY - 0.028 * scale - open * 0.25, palmZ + 0.10 * scale,
          tipX + side * 0.02, palmY - 0.036 * scale - open * 0.70, tipZ - 0.01,
          0.032 * scale, 0.014 * scale
        );

        const jaws = Math.min(upperJaw, lowerJaw);
        const claw = smin(smin(arm, wrist, 0.022), smin(palm, jaws, 0.018), 0.022);
        claws = Math.min(claws, claw);
        clawTips = Math.min(clawTips, jaws);
      }
      body = smin(body, claws, 0.022);

      // 6. Two long graceful swept-back crimson antennae
      const antMidY = 0.11 + by + P.antWave * 0.5;
      const antTipY = 0.08 + by + P.antWave;
      const antL1 = sdCapsule(x, y, z, -0.06, 0.05 + by, 0.38, -0.22, antMidY, 0.22, 0.016, 0.012);
      const antL2 = sdCapsule(x, y, z, -0.22, antMidY, 0.22, -0.34, antTipY, -0.24, 0.012, 0.008);
      const antR1 = sdCapsule(x, y, z,  0.06, 0.05 + by, 0.38,  0.22, antMidY, 0.22, 0.016, 0.012);
      const antR2 = sdCapsule(x, y, z,  0.22, antMidY, 0.22,  0.34, antTipY, -0.24, 0.012, 0.008);
      const antennae = Math.min(smin(antL1, antL2, 0.015), smin(antR1, antR2, 0.015));

      // 7. Glossy black eyes with white glint
      const eyeL = sdEllipsoid(x, y, z, -0.078, 0.095 + by, 0.385, 0.034, 0.034, 0.034);
      const eyeR = sdEllipsoid(x, y, z,  0.078, 0.095 + by, 0.385, 0.034, 0.034, 0.034);
      const eyes = Math.min(eyeL, eyeR);

      let d = body;
      let mat = 'shell';
      if (clawTips < d + 0.004 && z > 0.72 + P.clawFwd) mat = 'clawTip';
      if (antennae < d) { d = antennae; mat = 'antenna'; }
      if (eyes < d) { d = eyes; mat = 'eye'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'eye') {
        const localX = Math.abs(x) - 0.078;
        const localY = y - (0.095 + by);
        if (localY > 0.008 && localX < 0.010 && z > 0.392) return 'W';
        return 'k';
      }
      if (mat === 'antenna') return shade > 0.50 ? 'l3' : 'l1';
      if (mat === 'clawTip') return shade > 0.42 ? 'a1' : 'a0';

      // Warm amber underside
      if (y < -0.09 + by && z > -0.52) return shade > 0.44 ? 'a1' : 'a0';

      // Crisp inter-segment shadow grooves along the 5 tail plates
      let groove = false;
      if (z < -0.02 && z > -0.58 && y > -0.08 + by) {
        const segPhase = Math.abs(((-z - 0.02) % 0.115) - 0.0575);
        if (segPhase > 0.047) groove = true;
      }
      const s = groove ? shade - 0.28 : shade;
      return s > 0.84 ? 'l4' : s > 0.64 ? 'l3' : s > 0.40 ? 'l2' : s > 0.18 ? 'l1' : 'l0';
    };

    pack = build27Pack(LOBSTER_PW, LOBSTER_PH, 1.48, 0.76, LOBSTER_PAL, evalFn, shadeFn);
    lobsterCache.set(pose, pack);
  }
  return pack;
}

export function getLobsterPosePack(...args: Parameters<typeof buildLobsterPosePack>): ReturnType<typeof buildLobsterPosePack> {
  return registerAnimalSpritePack(buildLobsterPosePack(...args), { module: './Lobster.ts', factory: 'getLobsterPosePack', args }, buildLobsterPosePack);
}

const LOBSTER_IDLE: readonly LobsterPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const LOBSTER_WALK: readonly LobsterPoseName[] = ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'];
const LOBSTER_SNAP: readonly LobsterPoseName[] = ['snap0', 'snap1', 'snap2'];

/**
 * Armored Lobster (Lagosta): prowls near pondCenter, snaps its huge claws if approached,
 * and tail-flips backward when provoked!
 */
export class Lobster extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private readonly home = new THREE.Vector3();
  private state: 'idle' | 'walk' | 'snap' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.3, 2.5);
  private gaitPhase = rand(0, Math.PI * 2);

  constructor(ctx: GameContext, pos: THREE.Vector3, pondCenter?: THREE.Vector3) {
    super(ctx, getLobsterPosePack('idle0').getView(2, 0)!, LOBSTER_PW, LOBSTER_PH, LOBSTER_W, LOBSTER_H, 'LobsterBillboard');
    this.hp = 35;
    this.maxHp = 35;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.28;
    this.motor.height = 0.30;
    this.motor.teleport(pos);
    this.home.copy(pondCenter ?? pos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.34, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.set(this.position.x, this.position.y + 0.16, this.position.z);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y + 0.06, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.24, this.position.z);
    this.hurtboxes[0].enabled = this.alive;
    this.stickRoot.position.set(this.position.x, this.position.y + 0.16, this.position.z);
    this.stickRoot.rotation.y = this.facing;
  }

  receiveHit(hit: HitInfo): HitResult {
    const res = emptyResult('flesh');
    if (!this.alive) { res.ignored = true; return res; }
    this.hp = Math.max(0, this.hp - hit.damage);
    res.damage = hit.damage;
    this.flash = 1.0;
    // Tail-flip backward burst on hit!
    this.vel.x += hit.dir.x * 4.8;
    this.vel.z += hit.dir.z * 4.8;
    this.vel.y = 3.2;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.state = 'snap';
      this.stateT = 0;
      this.stateDur = 1.8;
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

        let vx = 0;
        let vz = 0;

        if (dist < 2.8 && this.state !== 'snap') {
          this.state = 'snap';
          this.stateT = 0;
          this.stateDur = 1.6;
        }

        if (this.state === 'idle') {
          if (this.stateT >= this.stateDur) {
            this.state = 'walk';
            this.stateT = 0;
            this.stateDur = rand(1.6, 3.0);
            const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
            if (toHome > 5.4) {
              this.facing = Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.4, 0.4);
            } else {
              this.facing += rand(-1.1, 1.1);
            }
          }
        } else if (this.state === 'walk') {
          vx = Math.sin(this.facing) * 1.45;
          vz = Math.cos(this.facing) * 1.45;
          if (this.stateT >= this.stateDur) {
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.1, 2.2);
          }
        } else if (this.state === 'snap') {
          if (target && target.alive) {
            const toPlayer = Math.atan2(target.position.x - this.position.x, target.position.z - this.position.z);
            this.facing += angleDiff(this.facing, toPlayer) * Math.min(1, dt * 9);
            // Back up slightly like a defensive lobster tail-flip if player gets very close
            if (dist < 1.6) {
              vx = -Math.sin(this.facing) * 2.2;
              vz = -Math.cos(this.facing) * 2.2;
            }
          }
          if (this.stateT >= this.stateDur && dist > 3.6) {
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.0, 2.0);
          }
        }

        this.vel.x = damp(this.vel.x, vx, 9, dt);
        this.vel.z = damp(this.vel.z, vz, 9, dt);
        this.vel.y -= 20 * dt;
        this.motor.update(dt);

        const horiz = Math.hypot(this.vel.x, this.vel.z);
        if (horiz > 0.2 && this.motor.grounded) {
          this.gaitPhase += dt * 7.0 * (0.7 + horiz * 0.25);
        }
      }
      this.syncHurtbox();
    }

    let pose: LobsterPoseName;
    if (!this.alive) pose = 'idle0';
    else if (this.state === 'snap') pose = pickCycle(LOBSTER_SNAP, this.stateT * 5.0);
    else if (this.state === 'walk') pose = pickCycle(LOBSTER_WALK, (this.gaitPhase / Math.PI) * 3.0);
    else pose = pickCycle(LOBSTER_IDLE, this.stateT * 2.0);

    const deathSink = this.alive ? 0 : Math.min(0.14, this.deadT * 0.35);
    this.renderBillboard(getLobsterPosePack(pose), this.position.y + 0.16 - deathSink, camera, drawingBufferSize);
  }
}
