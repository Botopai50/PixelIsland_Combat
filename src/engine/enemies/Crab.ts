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
// CARANGUEJO (Flagship Pond-Shore Crab) — 38×28 @ 56 PPU
// ============================================================================
export type CrabPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'scuttle0' | 'scuttle1' | 'scuttle2' | 'scuttle3' | 'scuttle4' | 'scuttle5'
  | 'snap0' | 'snap1' | 'snap2';

export const CRAB_PW = 38;
export const CRAB_PH = 28;
export const CRAB_W = CRAB_PW / ANIMAL_PPU;
export const CRAB_H = CRAB_PH / ANIMAL_PPU;

const CRAB_PAL: Record<string, [number, number, number]> = {
  k:  [0x18, 0x0d, 0x10], // 1px dark outline / glossy eye
  r0: [0x78, 0x14, 0x14], // deep crimson shadow / carapace grooves
  r1: [0xb8, 0x24, 0x1a], // rich crimson carapace
  r2: [0xe6, 0x4b, 0x22], // vibrant vermilion midtone
  r3: [0xff, 0x7c, 0x36], // sunlit orange-red rim
  r4: [0xff, 0xb8, 0x6c], // glossy shell highlight
  b0: [0xc9, 0x99, 0x62], // warm tan underside / leg joint shadow
  b1: [0xf5, 0xdd, 0xa8], // pale cream-yellow underside & pincer tips
  W:  [0xff, 0xfb, 0xf2], // crisp white eye glint
};

interface CrabPose {
  bodyY: number;
  bodyTilt: number;
  clawLiftL: number;
  clawLiftR: number;
  clawFwd: number;
  clawOpenL: number;
  clawOpenR: number;
  legWave: number;
  eyeBob: number;
}

const CRAB_POSES: Record<CrabPoseName, CrabPose> = {
  // Subtle breathing, eye-stalk bob, and gentle claw poise
  idle0: {
    bodyY: 0.0, bodyTilt: 0.0,
    clawLiftL: 0.0, clawLiftR: 0.02, clawFwd: 0.0,
    clawOpenL: 0.14, clawOpenR: 0.18, legWave: 0.0, eyeBob: 0.0,
  },
  idle1: {
    bodyY: 0.018, bodyTilt: 0.012,
    clawLiftL: 0.06, clawLiftR: 0.08, clawFwd: 0.02,
    clawOpenL: 0.24, clawOpenR: 0.30, legWave: 0.25, eyeBob: 0.016,
  },
  idle2: {
    bodyY: -0.012, bodyTilt: -0.01,
    clawLiftL: -0.02, clawLiftR: 0.0, clawFwd: -0.01,
    clawOpenL: 0.08, clawOpenR: 0.12, legWave: -0.25, eyeBob: -0.01,
  },

  // Crisp 6-frame sideways scuttle with alternating tripod leg waves
  scuttle0: {
    bodyY: 0.020, bodyTilt: 0.028,
    clawLiftL: 0.08, clawLiftR: 0.10, clawFwd: 0.03,
    clawOpenL: 0.22, clawOpenR: 0.26, legWave: 0.00, eyeBob: 0.01,
  },
  scuttle1: {
    bodyY: 0.035, bodyTilt: 0.015,
    clawLiftL: 0.11, clawLiftR: 0.12, clawFwd: 0.04,
    clawOpenL: 0.28, clawOpenR: 0.30, legWave: 1.05, eyeBob: 0.02,
  },
  scuttle2: {
    bodyY: 0.010, bodyTilt: -0.015,
    clawLiftL: 0.06, clawLiftR: 0.08, clawFwd: 0.02,
    clawOpenL: 0.18, clawOpenR: 0.22, legWave: 2.09, eyeBob: 0.0,
  },
  scuttle3: {
    bodyY: 0.022, bodyTilt: -0.028,
    clawLiftL: 0.09, clawLiftR: 0.11, clawFwd: 0.03,
    clawOpenL: 0.24, clawOpenR: 0.28, legWave: 3.14, eyeBob: 0.01,
  },
  scuttle4: {
    bodyY: 0.036, bodyTilt: -0.012,
    clawLiftL: 0.12, clawLiftR: 0.13, clawFwd: 0.04,
    clawOpenL: 0.28, clawOpenR: 0.32, legWave: 4.19, eyeBob: 0.02,
  },
  scuttle5: {
    bodyY: 0.012, bodyTilt: 0.016,
    clawLiftL: 0.07, clawLiftR: 0.09, clawFwd: 0.02,
    clawOpenL: 0.18, clawOpenR: 0.22, legWave: 5.24, eyeBob: 0.0,
  },

  // Expressive defensive snap: raise & spread -> wide-open threat -> crisp clamp shut
  snap0: {
    bodyY: 0.032, bodyTilt: -0.02,
    clawLiftL: 0.20, clawLiftR: 0.26, clawFwd: 0.05,
    clawOpenL: 0.72, clawOpenR: 0.85, legWave: 0.15, eyeBob: 0.02,
  },
  snap1: {
    bodyY: 0.052, bodyTilt: 0.02,
    clawLiftL: 0.30, clawLiftR: 0.36, clawFwd: 0.09,
    clawOpenL: 1.00, clawOpenR: 1.00, legWave: 0.45, eyeBob: 0.03,
  },
  snap2: {
    bodyY: 0.018, bodyTilt: 0.0,
    clawLiftL: 0.22, clawLiftR: 0.26, clawFwd: 0.12,
    clawOpenL: 0.02, clawOpenR: 0.02, legWave: -0.35, eyeBob: 0.005,
  },
};

const crabCache = new Map<CrabPoseName, Boar27Pack>();
 function buildCrabPosePack(pose: CrabPoseName): Boar27Pack {
  let pack = crabCache.get(pose);
  if (!pack) {
    const P = CRAB_POSES[pose];
    const by = P.bodyY;

    const evalFn: SdfEvaluator = (x, y, z) => {
      const tiltY = by + x * P.bodyTilt;

      // 1. Wide ridged armored carapace with gill domes, dorsal plate & underside sternum
      const mainShell = sdEllipsoid(x, y, z, 0, -0.02 + tiltY, -0.01, 0.36, 0.165, 0.265);
      const dorsalRidge = sdEllipsoid(x, y, z, 0, 0.055 + tiltY, -0.01, 0.22, 0.11, 0.185);
      const gillL = sdEllipsoid(x, y, z, -0.22, -0.01 + tiltY, -0.02, 0.175, 0.125, 0.19);
      const gillR = sdEllipsoid(x, y, z,  0.22, -0.01 + tiltY, -0.02, 0.175, 0.125, 0.19);
      const flankRim = sdEllipsoid(x, y, z, 0, -0.075 + tiltY, 0.0, 0.42, 0.078, 0.29);
      const sternum = sdEllipsoid(x, y, z, 0, -0.135 + tiltY, -0.01, 0.31, 0.072, 0.22);

      let shell = smin(mainShell, dorsalRidge, 0.045);
      shell = smin(shell, Math.min(gillL, gillR), 0.05);
      shell = smin(shell, flankRim, 0.04);
      shell = smin(shell, sternum, 0.04);

      // Frontal serrations (rostral spines) + lateral carapace edge spines
      const spineF0 = sdCapsule(x, y, z,  0.00, -0.04 + tiltY, 0.24,  0.00, -0.02 + tiltY, 0.32, 0.032, 0.014);
      const spineFL = sdCapsule(x, y, z, -0.10, -0.04 + tiltY, 0.23, -0.12, -0.02 + tiltY, 0.31, 0.030, 0.013);
      const spineFR = sdCapsule(x, y, z,  0.10, -0.04 + tiltY, 0.23,  0.12, -0.02 + tiltY, 0.31, 0.030, 0.013);
      const spineSideL1 = sdCapsule(x, y, z, -0.34, -0.06 + tiltY, 0.11, -0.45, -0.04 + tiltY, 0.17, 0.032, 0.013);
      const spineSideR1 = sdCapsule(x, y, z,  0.34, -0.06 + tiltY, 0.11,  0.45, -0.04 + tiltY, 0.17, 0.032, 0.013);
      const spineSideL2 = sdCapsule(x, y, z, -0.37, -0.06 + tiltY, -0.02, -0.47, -0.05 + tiltY, -0.01, 0.030, 0.012);
      const spineSideR2 = sdCapsule(x, y, z,  0.37, -0.06 + tiltY, -0.02,  0.47, -0.05 + tiltY, -0.01, 0.030, 0.012);
      const spines = Math.min(
        spineF0,
        Math.min(spineFL, spineFR),
        Math.min(Math.min(spineSideL1, spineSideR1), Math.min(spineSideL2, spineSideR2))
      );
      shell = smin(shell, spines, 0.02);

      // 2. Six jointed walking legs (3 per side, bent sharply at the knee!)
      let legs = 99;
      for (let side = -1; side <= 1; side += 2) {
        for (let i = 0; i < 3; i++) {
          const baseZ = -0.17 + i * 0.135;
          const zSpread = (i - 1) * 0.055;
          const phase = P.legWave + i * 2.094 + (side < 0 ? 0 : Math.PI);
          const lift = Math.max(0, Math.sin(phase)) * 0.115;
          const swing = Math.cos(phase) * 0.068;

          const hipX = side * 0.33;
          const hipY = -0.095 + tiltY;
          const kneeX = side * (0.56 + (i === 1 ? 0.04 : 0.0));
          const kneeY = 0.025 + tiltY + lift;
          const kneeZ = baseZ + zSpread * 0.5 + swing * 0.45;
          const footX = side * (0.76 + (i === 1 ? 0.05 : 0.0));
          const footY = -0.345 + lift * 1.15;
          const footZ = baseZ + zSpread + swing;

          const femur = sdCapsule(x, y, z, hipX, hipY, baseZ, kneeX, kneeY, kneeZ, 0.046, 0.034);
          const tibia = sdCapsule(x, y, z, kneeX, kneeY, kneeZ, footX, footY, footZ, 0.033, 0.016);
          const leg = smin(femur, tibia, 0.016);
          legs = Math.min(legs, leg);
        }
      }

      // 3. Two huge asymmetric articulated claws (right crusher > left cutter)
      let claws = 99;
      let clawTips = 99;
      for (let side = -1; side <= 1; side += 2) {
        const isCrusher = side > 0;
        const scale = isCrusher ? 1.18 : 0.94;
        const lift = isCrusher ? P.clawLiftR : P.clawLiftL;
        const open = (isCrusher ? P.clawOpenR : P.clawOpenL) * 0.115 * scale;

        const shX = side * 0.25;
        const shY = -0.05 + tiltY;
        const shZ = 0.19;

        const elbowX = side * (0.44 + (isCrusher ? 0.03 : 0.0));
        const elbowY = 0.01 + tiltY + lift * 0.55;
        const elbowZ = 0.31 + P.clawFwd * 0.45;

        const palmX = side * (0.40 + (isCrusher ? 0.03 : 0.0));
        const palmY = 0.055 + tiltY + lift;
        const palmZ = 0.45 + P.clawFwd;

        const merus = sdCapsule(x, y, z, shX, shY, shZ, elbowX, elbowY, elbowZ, 0.054 * scale, 0.062 * scale);
        const carpus = sdCapsule(x, y, z, elbowX, elbowY, elbowZ, palmX, palmY, palmZ, 0.060 * scale, 0.072 * scale);
        const palm = sdEllipsoid(x, y, z, palmX, palmY + 0.01, palmZ + 0.03, 0.118 * scale, 0.098 * scale, 0.132 * scale);

        // Articulated upper dactyl (movable finger) & lower fixed finger
        const tipX = side * (0.21 + (isCrusher ? 0.01 : 0.0));
        const tipZ = palmZ + 0.21 * scale;
        const upperJaw = sdCapsule(
          x, y, z,
          palmX - side * 0.03, palmY + 0.052 * scale + open * 0.35, palmZ + 0.08 * scale,
          tipX, palmY + 0.068 * scale + open, tipZ,
          0.044 * scale, 0.018 * scale
        );
        const lowerJaw = sdCapsule(
          x, y, z,
          palmX - side * 0.02, palmY - 0.038 * scale - open * 0.25, palmZ + 0.08 * scale,
          tipX + side * 0.02, palmY - 0.048 * scale - open * 0.72, tipZ - 0.01,
          0.040 * scale, 0.017 * scale
        );

        const jaws = Math.min(upperJaw, lowerJaw);
        const claw = smin(smin(merus, carpus, 0.025), smin(palm, jaws, 0.022), 0.025);
        claws = Math.min(claws, claw);
        clawTips = Math.min(clawTips, jaws);
      }

      // 4. Two raised eyestalks with glossy black eyes & white glint
      const eyeY = 0.255 + tiltY + P.eyeBob;
      const stalkL = sdCapsule(x, y, z, -0.125, 0.065 + tiltY, 0.20, -0.165, eyeY - 0.02, 0.265, 0.028, 0.024);
      const stalkR = sdCapsule(x, y, z,  0.125, 0.065 + tiltY, 0.20,  0.165, eyeY - 0.02, 0.265, 0.028, 0.024);
      const stalks = Math.min(stalkL, stalkR);

      const eyeL = sdEllipsoid(x, y, z, -0.170, eyeY + 0.008, 0.285, 0.044, 0.044, 0.044);
      const eyeR = sdEllipsoid(x, y, z,  0.170, eyeY + 0.008, 0.285, 0.044, 0.044, 0.044);
      const eyes = Math.min(eyeL, eyeR);

      let body = smin(shell, legs, 0.025);
      body = smin(body, claws, 0.025);

      let d = body;
      let mat = 'shell';
      if (legs < shell + 0.004 && Math.abs(x) > 0.42) mat = 'leg';
      if (claws < shell + 0.006 && z > 0.28) mat = 'claw';
      if (clawTips < d + 0.004 && z > 0.50 + P.clawFwd) mat = 'clawTip';
      if (stalks < d) { d = stalks; mat = 'stalk'; }
      if (eyes < d) { d = eyes; mat = 'eye'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'eye') {
        // Glossy white glint on the upper-front-left of each black eye
        const localX = Math.abs(x) - 0.170;
        const localY = y - (0.263 + by + P.eyeBob);
        if (localY > 0.012 && localX < 0.012 && z > 0.295) return 'W';
        return 'k';
      }
      if (mat === 'stalk') {
        return shade > 0.50 ? 'r3' : 'r1';
      }
      if (mat === 'clawTip') {
        return shade > 0.42 ? 'b1' : 'b0';
      }
      if (mat === 'leg') {
        // Cream lower leg tips & warm joints
        if (y < -0.24) return shade > 0.45 ? 'b1' : 'b0';
        return shade > 0.72 ? 'r3' : shade > 0.44 ? 'r2' : shade > 0.20 ? 'r1' : 'r0';
      }
      if (mat === 'claw') {
        if (y < -0.06 + by) return shade > 0.45 ? 'b1' : 'b0';
        return shade > 0.84 ? 'r4' : shade > 0.64 ? 'r3' : shade > 0.40 ? 'r2' : shade > 0.18 ? 'r1' : 'r0';
      }

      // Pale cream/yellow underside sternum
      if (y < -0.115 + by) return shade > 0.45 ? 'b1' : 'b0';

      // Carapace H-groove / armored plate seam accents
      const groove =
        (Math.abs(Math.abs(x) - 0.15) < 0.022 && z > -0.12 && z < 0.12 && y > 0.02 + by) ||
        (Math.abs(z + 0.02) < 0.020 && Math.abs(x) < 0.16 && y > 0.04 + by);
      const s = groove ? shade - 0.24 : shade;

      return s > 0.84 ? 'r4' : s > 0.66 ? 'r3' : s > 0.42 ? 'r2' : s > 0.20 ? 'r1' : 'r0';
    };

    pack = build27Pack(CRAB_PW, CRAB_PH, 0.98, 0.74, CRAB_PAL, evalFn, shadeFn);
    crabCache.set(pose, pack);
  }
  return pack;
}

export function getCrabPosePack(...args: Parameters<typeof buildCrabPosePack>): ReturnType<typeof buildCrabPosePack> {
  return registerAnimalSpritePack(buildCrabPosePack(...args), { module: './Crab.ts', factory: 'getCrabPosePack', args }, buildCrabPosePack);
}

const CRAB_IDLE: readonly CrabPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const CRAB_SCUTTLE: readonly CrabPoseName[] = ['scuttle0', 'scuttle1', 'scuttle2', 'scuttle3', 'scuttle4', 'scuttle5'];
const CRAB_SNAP: readonly CrabPoseName[] = ['snap0', 'snap1', 'snap2'];

/**
 * Pond-Shore Crab: scuttles sideways near pondCenter (or spawn pos) and snaps if approached.
 */
export class Crab extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private readonly home = new THREE.Vector3();
  private state: 'idle' | 'scuttle' | 'snap' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.2, 2.4);
  private moveDir = 1; // +1 or -1 sideways scuttle
  private gaitPhase = rand(0, Math.PI * 2);

  constructor(ctx: GameContext, pos: THREE.Vector3, pondCenter?: THREE.Vector3) {
    super(ctx, getCrabPosePack('idle0').getView(2, 0)!, CRAB_PW, CRAB_PH, CRAB_W, CRAB_H, 'CrabBillboard');
    this.hp = 25;
    this.maxHp = 25;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.24;
    this.motor.height = 0.30;
    this.motor.teleport(pos);
    this.home.copy(pondCenter ?? pos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.30, tag: 'body', enabled: true });
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
    this.vel.x += hit.dir.x * 4.0;
    this.vel.z += hit.dir.z * 4.0;
    this.vel.y = 3.0;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.state = 'snap';
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

        let vx = 0;
        let vz = 0;
        if (dist < 2.8 && this.state !== 'snap') {
          this.state = 'snap';
          this.stateT = 0;
          this.stateDur = 1.5;
        }

        if (this.state === 'idle') {
          if (this.stateT >= this.stateDur) {
            this.state = 'scuttle';
            this.stateT = 0;
            this.stateDur = rand(1.4, 2.8);
            this.moveDir = Math.random() < 0.5 ? 1 : -1;
            const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
            if (toHome > 5.2) {
              // Face perpendicular to home so sideways scuttle heads back toward pond
              this.facing = Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) - this.moveDir * Math.PI * 0.5;
            } else {
              this.facing += rand(-0.9, 0.9);
            }
          }
        } else if (this.state === 'scuttle') {
          const sideYaw = this.facing + this.moveDir * Math.PI * 0.5;
          vx = Math.sin(sideYaw) * 1.7;
          vz = Math.cos(sideYaw) * 1.7;
          if (this.stateT >= this.stateDur) {
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.0, 2.2);
          }
        } else if (this.state === 'snap') {
          if (target && target.alive) {
            const toPlayer = Math.atan2(target.position.x - this.position.x, target.position.z - this.position.z);
            this.facing += angleDiff(this.facing, toPlayer) * Math.min(1, dt * 10);
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
          this.gaitPhase += dt * 7.2 * (0.7 + horiz * 0.25);
        }
      }
      this.syncHurtbox();
    }

    let pose: CrabPoseName;
    if (!this.alive) pose = 'idle0';
    else if (this.state === 'snap') pose = pickCycle(CRAB_SNAP, this.stateT * 5.2);
    else if (this.state === 'scuttle') pose = pickCycle(CRAB_SCUTTLE, (this.gaitPhase / Math.PI) * 3.0);
    else pose = pickCycle(CRAB_IDLE, this.stateT * 2.2);

    const deathSink = this.alive ? 0 : Math.min(0.14, this.deadT * 0.35);
    this.renderBillboard(getCrabPosePack(pose), this.position.y + 0.16 - deathSink, camera, drawingBufferSize);
  }
}
