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
// SAPO (Frog) — Flagship 22×18 @ 56 PPU
// ============================================================================
const ANIMAL_PPU = 56;

export type FrogPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'croak0' | 'croak1' | 'croak2' | 'croak3'
  | 'jump0' | 'jump1' | 'jump2' | 'jump3';

export const FROG_PW = 22;
export const FROG_PH = 18;
export const FROG_W = FROG_PW / ANIMAL_PPU;
export const FROG_H = FROG_PH / ANIMAL_PPU;

const FROG_PAL: Record<string, [number, number, number]> = {
  k:  [0x12, 0x1a, 0x14], // 1px outline / pupil / smile line
  w:  [0xfc, 0xfc, 0xf4], // bright white eye highlight glint
  g0: [0x16, 0x45, 0x22], // deep forest shadow
  g1: [0x24, 0x6b, 0x2e], // dark leaf green
  g2: [0x3b, 0xa1, 0x3c], // vibrant emerald midtone
  g3: [0x67, 0xcf, 0x4a], // bright spring green
  g4: [0xa6, 0xed, 0x6b], // lime-green top specular
  sp: [0x1b, 0x52, 0x26], // subtle darker forest-green dorsal spots
  b0: [0xb8, 0xc4, 0x74], // warm yellow-green belly shadow
  b1: [0xdf, 0xe6, 0x9c], // pale cream/yellow-green belly & throat
  b2: [0xf7, 0xf5, 0xc8], // inflated vocal sac highlight
  e0: [0xd9, 0x8f, 0x18], // golden-amber iris shadow
  e1: [0xff, 0xd4, 0x3b], // bright golden-amber iris
};

interface FrogPose {
  bodyY: number;
  bodyPitch: number;   // positive = nose pitched up (launch/croak)
  throatScale: number; // 0 = flat, 1.2 = fully inflated vocal sac
  hindExtend: number;  // 0 = tightly folded against flanks, 1 = fully extended backward
  frontY: number;
  frontZ: number;
}

const FROG_POSES: Record<FrogPoseName, FrogPose> = {
  // Alert crouched sitting with gentle breathing
  idle0:  { bodyY: 0.0,    bodyPitch: 0.0,   throatScale: 0.08, hindExtend: 0.0,  frontY: -0.31, frontZ: 0.34 },
  idle1:  { bodyY: 0.015,  bodyPitch: 0.03,  throatScale: 0.34, hindExtend: 0.0,  frontY: -0.31, frontZ: 0.34 },
  idle2:  { bodyY: -0.012, bodyPitch: -0.02, throatScale: 0.05, hindExtend: 0.0,  frontY: -0.31, frontZ: 0.34 },

  // Expressive vocal sac inflation cycle
  croak0: { bodyY: 0.015,  bodyPitch: 0.06,  throatScale: 0.55, hindExtend: 0.0,  frontY: -0.31, frontZ: 0.34 },
  croak1: { bodyY: 0.032,  bodyPitch: 0.12,  throatScale: 1.00, hindExtend: 0.0,  frontY: -0.30, frontZ: 0.33 },
  croak2: { bodyY: 0.042,  bodyPitch: 0.15,  throatScale: 1.22, hindExtend: 0.0,  frontY: -0.29, frontZ: 0.33 },
  croak3: { bodyY: 0.012,  bodyPitch: 0.04,  throatScale: 0.42, hindExtend: 0.0,  frontY: -0.31, frontZ: 0.34 },

  // Crouch -> launch -> mid-air full stretch -> landing
  jump0:  { bodyY: -0.065, bodyPitch: -0.04, throatScale: 0.0,  hindExtend: 0.0,  frontY: -0.33, frontZ: 0.37 },
  jump1:  { bodyY: 0.045,  bodyPitch: 0.18,  throatScale: 0.0,  hindExtend: 0.72, frontY: -0.18, frontZ: 0.44 },
  jump2:  { bodyY: 0.065,  bodyPitch: 0.06,  throatScale: 0.0,  hindExtend: 1.00, frontY: -0.22, frontZ: 0.47 },
  jump3:  { bodyY: -0.020, bodyPitch: -0.10, throatScale: 0.0,  hindExtend: 0.32, frontY: -0.34, frontZ: 0.43 },
};

const frogCache = new Map<FrogPoseName, Boar27Pack>();
 function buildFrogPosePack(pose: FrogPoseName): Boar27Pack {
  let pack = frogCache.get(pose);
  if (!pack) {
    const P = FROG_POSES[pose];
    const by = P.bodyY;
    const pitch = P.bodyPitch;
    const ext = P.hindExtend;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // --------------------------------------------------------------------
      // 1. PLUMP CROUCHED TORSO WITH SLOPED BACK & WIDE SNOUT
      // --------------------------------------------------------------------
      const rump = sdEllipsoid(x, y, z, 0, -0.09 + by - pitch * 0.12, -0.14, 0.30, 0.21, 0.28);
      const chest = sdEllipsoid(x, y, z, 0, -0.01 + by + pitch * 0.08, 0.12, 0.27, 0.21, 0.25);
      const snout = sdEllipsoid(x, y, z, 0, 0.03 + by + pitch * 0.16, 0.34, 0.23, 0.125, 0.17);

      // Inflatable vocal throat sac
      const ts = P.throatScale;
      const throat = ts > 0.05
        ? sdEllipsoid(x, y, z, 0, -0.12 + by + pitch * 0.10, 0.34 + ts * 0.05, 0.19 * ts, 0.155 * ts, 0.185 * ts)
        : 99;

      // --------------------------------------------------------------------
      // 2. MUSCULAR HIND LEGS (folded against flanks -> extended backward)
      // --------------------------------------------------------------------
      const hipY = -0.12 + by - pitch * 0.10;
      const hipZ = -0.22;
      // Knee moves from tucked forward-up against the flank to stretched backward
      const kneeX = 0.33 - ext * 0.07;
      const kneeY = -0.04 + by - ext * 0.16;
      const kneeZ = 0.02 - ext * 0.48;
      // Ankle / webbed foot
      const footX = 0.31 - ext * 0.05;
      const footY = -0.30 - ext * 0.10;
      const footZ = -0.18 - ext * 0.56;

      const thighL = sdCapsule(x, y, z, -0.22, hipY, hipZ, -kneeX, kneeY, kneeZ, 0.105, 0.085);
      const thighR = sdCapsule(x, y, z,  0.22, hipY, hipZ,  kneeX, kneeY, kneeZ, 0.105, 0.085);
      const calfL  = sdCapsule(x, y, z, -kneeX, kneeY, kneeZ, -footX, footY, footZ, 0.075, 0.052);
      const calfR  = sdCapsule(x, y, z,  kneeX, kneeY, kneeZ,  footX, footY, footZ, 0.075, 0.052);

      // Webbed hind feet (3 fanned toes per foot)
      const toeDirZ = ext > 0.4 ? -0.15 : 0.16;
      const hToeL1 = sdCapsule(x, y, z, -footX, footY, footZ, -footX - 0.08, footY - 0.01, footZ + toeDirZ, 0.032, 0.020);
      const hToeL2 = sdCapsule(x, y, z, -footX, footY, footZ, -footX + 0.02, footY - 0.01, footZ + toeDirZ * 1.15, 0.032, 0.020);
      const hToeR1 = sdCapsule(x, y, z,  footX, footY, footZ,  footX + 0.08, footY - 0.01, footZ + toeDirZ, 0.032, 0.020);
      const hToeR2 = sdCapsule(x, y, z,  footX, footY, footZ,  footX - 0.02, footY - 0.01, footZ + toeDirZ * 1.15, 0.032, 0.020);

      // Front arms + splayed hands
      const fArmL = sdCapsule(x, y, z, -0.21, -0.09 + by, 0.22, -0.24, P.frontY, P.frontZ, 0.062, 0.044);
      const fArmR = sdCapsule(x, y, z,  0.21, -0.09 + by, 0.22,  0.24, P.frontY, P.frontZ, 0.062, 0.044);
      const fHandL = sdEllipsoid(x, y, z, -0.25, P.frontY - 0.01, P.frontZ + 0.05, 0.065, 0.026, 0.055);
      const fHandR = sdEllipsoid(x, y, z,  0.25, P.frontY - 0.01, P.frontZ + 0.05, 0.065, 0.026, 0.055);

      // Bulging green eye sockets perched on top of the head
      const eyeY = 0.21 + by + pitch * 0.18;
      const eyeZ = 0.27;
      const browL = sdEllipsoid(x, y, z, -0.155, eyeY + 0.01, eyeZ - 0.01, 0.105, 0.102, 0.105);
      const browR = sdEllipsoid(x, y, z,  0.155, eyeY + 0.01, eyeZ - 0.01, 0.105, 0.102, 0.105);

      let skin = smin(rump, chest, 0.09);
      skin = smin(skin, snout, 0.07);
      skin = smin(skin, Math.min(browL, browR), 0.04);
      const hindLegs = smin(Math.min(thighL, thighR), Math.min(calfL, calfR), 0.035);
      const hindFeet = Math.min(Math.min(hToeL1, hToeL2), Math.min(hToeR1, hToeR2));
      const frontLimbs = Math.min(Math.min(fArmL, fArmR), Math.min(fHandL, fHandR));
      skin = smin(skin, hindLegs, 0.045);
      skin = Math.min(skin, Math.min(hindFeet, frontLimbs));

      // --------------------------------------------------------------------
      // 3. BULGING GOLDEN EYES WITH DARK PUPIL & WHITE GLINT
      // --------------------------------------------------------------------
      const eyeL = sdEllipsoid(x, y, z, -0.165, eyeY + 0.005, eyeZ + 0.025, 0.085, 0.085, 0.085);
      const eyeR = sdEllipsoid(x, y, z,  0.165, eyeY + 0.005, eyeZ + 0.025, 0.085, 0.085, 0.085);
      const pupilL = sdEllipsoid(x, y, z, -0.178, eyeY + 0.002, eyeZ + 0.078, 0.045, 0.042, 0.042);
      const pupilR = sdEllipsoid(x, y, z,  0.178, eyeY + 0.002, eyeZ + 0.078, 0.045, 0.042, 0.042);
      const glintL = sdEllipsoid(x, y, z, -0.188, eyeY + 0.036, eyeZ + 0.092, 0.022, 0.022, 0.022);
      const glintR = sdEllipsoid(x, y, z,  0.188, eyeY + 0.036, eyeZ + 0.092, 0.022, 0.022, 0.022);

      let d = skin;
      let mat = 'skin';
      if (throat < d) { d = throat; mat = 'throat'; }
      if (Math.min(eyeL, eyeR) < d) { d = Math.min(eyeL, eyeR); mat = 'eye'; }
      if (Math.min(pupilL, pupilR) < d) { d = Math.min(pupilL, pupilR); mat = 'pupil'; }
      if (Math.min(glintL, glintR) < d) { d = Math.min(glintL, glintR); mat = 'glint'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'glint') return 'w';
      if (mat === 'pupil') return 'k';
      if (mat === 'eye') return shade > 0.45 ? 'e1' : 'e0';
      if (mat === 'throat') return shade > 0.62 ? 'b2' : shade > 0.32 ? 'b1' : 'b0';

      // Subtle dark smile line along the front snout
      if (z > 0.36 && Math.abs(x) < 0.20 && Math.abs(y - (-0.015 + by + pitch * 0.15)) < 0.022) {
        return 'k';
      }

      // Pale cream/yellow-green belly
      if (y < -0.14 + by && Math.abs(x) < 0.24 && z > -0.18) {
        return shade > 0.45 ? 'b1' : 'b0';
      }

      // Subtle darker forest-green dorsal spots on the back & thighs
      const spot = Math.sin(x * 20 + 0.8) * Math.cos(z * 18 - 0.5) > 0.58 && y > -0.04 + by && z < 0.16;
      if (spot) return shade > 0.55 ? 'g1' : 'sp';

      if (shade > 0.78) return 'g4';
      if (shade > 0.56) return 'g3';
      if (shade > 0.36) return 'g2';
      if (shade > 0.18) return 'g1';
      return 'g0';
    };

    pack = build27Pack(FROG_PW, FROG_PH, 0.88, 0.74, FROG_PAL, evalFn, shadeFn);
    frogCache.set(pose, pack);
  }
  return pack;
}

export function getFrogPosePack(...args: Parameters<typeof buildFrogPosePack>): ReturnType<typeof buildFrogPosePack> {
  return registerAnimalSpritePack(buildFrogPosePack(...args), { module: './Frog.ts', factory: 'getFrogPosePack', args }, buildFrogPosePack);
}

// ============================================================================
// INSTÂNCIA NA ARENA (Frog)
// ============================================================================
function pickCycle<T>(frames: readonly T[], idx: number): T {
  return sampleAnimalCycle(frames, idx);
}

const FROG_IDLE: readonly FrogPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const FROG_CROAK: readonly FrogPoseName[] = ['croak0', 'croak1', 'croak2', 'croak3'];

export class Frog extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private home = new THREE.Vector3();
  private state: 'idle' | 'special' | 'move' | 'react' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.2, 2.8);
  private targetYaw = rand(0, Math.PI * 2);
  private hopCooldown = 0;
  private readonly centerY = 0.10;

  constructor(ctx: GameContext, startPos: THREE.Vector3) {
    super(
      ctx,
      getFrogPosePack('idle0').getView(2, 0)!,
      FROG_PW,
      FROG_PH,
      FROG_W,
      FROG_H,
      'FrogBillboard',
    );
    this.hp = 15;
    this.maxHp = 15;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.18;
    this.motor.height = 0.25;
    this.motor.teleport(startPos);
    this.home.copy(startPos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.26, tag: 'body', enabled: true });
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
    this.vel.y = 3.2;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.state = 'react';
      this.stateT = 0;
      this.stateDur = 2.0;
    }
    return res;
  }

  update(dt: number, target: EnemyTarget | null, camera: THREE.Camera, drawingBufferSize?: THREE.Vector2) {
    if (dt > 0) {
      this.stateT += dt;
      this.hopCooldown = Math.max(0, this.hopCooldown - dt);
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
          this.stateDur = 1.9;
        }

        if (this.state === 'idle') {
          if (this.stateT >= this.stateDur) {
            this.state = Math.random() < 0.38 ? 'special' : 'move';
            this.stateT = 0;
            this.stateDur = rand(1.6, 3.0);
            const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
            this.targetYaw = toHome > 7.5
              ? Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.5, 0.5)
              : this.facing + rand(-1.6, 1.6);
          }
        } else if (this.state === 'special') {
          if (this.stateT >= this.stateDur) {
            this.state = 'move';
            this.stateT = 0;
            this.stateDur = rand(1.6, 2.8);
          }
        } else if (this.state === 'move') {
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 6);
          if (this.motor.grounded) {
            if (this.hopCooldown <= 0) {
              this.vel.y = 4.6;
              this.hopCooldown = 0.42;
              speed = 2.1;
            } else {
              speed = 0;
            }
          } else {
            speed = 2.1;
          }
          if (this.stateT >= this.stateDur && this.motor.grounded) {
            this.state = Math.random() < 0.45 ? 'special' : 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.4, 2.6);
          }
        } else if (this.state === 'react') {
          if (target && target.alive) {
            this.targetYaw = Math.atan2(this.position.x - target.position.x, this.position.z - target.position.z);
            this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 9);
            if (this.motor.grounded) {
              if (this.hopCooldown <= 0) {
                this.vel.y = 5.1;
                this.hopCooldown = 0.19;
                speed = 3.6;
              } else {
                speed = 0;
              }
            } else {
              speed = 3.6;
            }
          }
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

        const targetPitch = !this.motor.grounded ? Math.max(-0.28, Math.min(0.28, this.vel.y * 0.045)) : 0;
        this.bodyPitch = damp(this.bodyPitch, targetPitch, 10, dt);
      }
      this.syncHurtbox();
    }

    const pose: FrogPoseName = !this.alive
      ? 'idle0'
      : !this.motor.grounded
        ? (this.vel.y > 2.4 ? 'jump1' : this.vel.y > -1.0 ? 'jump2' : 'jump3')
        : this.state === 'special'
          ? pickCycle(FROG_CROAK, this.stateT * 4.0)
          : this.state === 'move' || this.state === 'react'
            ? 'jump0'
            : pickCycle(FROG_IDLE, this.stateT * 2.4);
    const deathSink = this.alive ? 0 : Math.min(0.22, this.deadT * 0.4);
    this.renderBillboard(getFrogPosePack(pose), this.position.y + this.centerY - deathSink, camera, drawingBufferSize);
  }
}
