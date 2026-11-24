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
// FUINHA / DONINHA (Stone Marten / Weasel) — Flagship 34×22 @ 56 PPU
// ============================================================================
const ANIMAL_PPU = 56;

export type WeaselPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'bound0' | 'bound1' | 'bound2' | 'bound3' | 'bound4' | 'bound5'
  | 'perk0' | 'perk1' | 'perk2';

export const WEASEL_PW = 34;
export const WEASEL_PH = 22;
export const WEASEL_W = WEASEL_PW / ANIMAL_PPU;
export const WEASEL_H = WEASEL_PH / ANIMAL_PPU;

const WEASEL_PAL: Record<string, [number, number, number]> = {
  k:  [0x15, 0x0f, 0x0c], // 1px dark outline / bright dark eyes
  w:  [0xfc, 0xfa, 0xf2], // eye glint
  d0: [0x26, 0x17, 0x10], // darker brown paws & tail tip shadow
  d1: [0x3d, 0x25, 0x19], // darker brown paws & tail tip
  b0: [0x3b, 0x23, 0x16], // deep cocoa coat shadow
  b1: [0x5c, 0x38, 0x22], // rich cocoa brown
  b2: [0x82, 0x52, 0x32], // warm chestnut midtone
  b3: [0xa8, 0x71, 0x48], // warm sunlit chestnut
  b4: [0xc9, 0x94, 0x67], // soft golden-brown rim highlight
  c0: [0xcf, 0xc7, 0xb8], // white bib / ear rim shadow
  c1: [0xed, 0xe8, 0xdc], // crisp white throat & chest bib
  c2: [0xfc, 0xfa, 0xf4], // bright white bib highlight
  n:  [0x8f, 0x45, 0x4a], // dark-pink nose
};

interface WeaselPose {
  bodyY: number;
  arch: number;      // spine arch (+ = arched up in bound, - = stretched flat)
  perk: number;      // 0 = quadrupedal, 1 = upright periscope posture on hind legs
  headYaw: number;   // curious head look left/right
  headPitch: number; // nose up/down
  fl: number;
  fr: number;
  bl: number;
  br: number;
  flLift: number;
  frLift: number;
  blLift: number;
  brLift: number;
  tailLift: number;
  tailSway: number;
}

const WEASEL_POSES: Record<WeaselPoseName, WeaselPose> = {
  // Sleek alert breathing & sniffing
  idle0:  { bodyY: 0.0,    arch: 0.02,  perk: 0.0,  headYaw: 0.0,   headPitch: 0.0,   fl: 0.02,  fr: -0.02, bl: -0.02, br: 0.02,  flLift: 0.0,  frLift: 0.0,  blLift: 0.0,  brLift: 0.0,  tailLift: 0.02,  tailSway: 0.0   },
  idle1:  { bodyY: 0.012,  arch: 0.03,  perk: 0.0,  headYaw: 0.05,  headPitch: 0.04,  fl: 0.02,  fr: -0.02, bl: -0.02, br: 0.02,  flLift: 0.0,  frLift: 0.0,  blLift: 0.0,  brLift: 0.0,  tailLift: 0.06,  tailSway: 0.04  },
  idle2:  { bodyY: -0.008, arch: 0.01,  perk: 0.0,  headYaw: -0.04, headPitch: -0.03, fl: 0.02,  fr: -0.02, bl: -0.02, br: 0.02,  flLift: 0.0,  frLift: 0.0,  blLift: 0.0,  brLift: 0.0,  tailLift: 0.0,   tailSway: -0.04 },

  // Agile undulating mustelid bounding lope (coil -> launch -> airborne stretch -> reach -> gather -> compress)
  bound0: { bodyY: -0.01,  arch: 0.14,  perk: 0.0,  headYaw: 0.0,   headPitch: 0.03,  fl: -0.10, fr: -0.08, bl: 0.14,  br: 0.12,  flLift: 0.02, frLift: 0.02, blLift: 0.0,  brLift: 0.0,  tailLift: -0.04, tailSway: 0.0   },
  bound1: { bodyY: 0.035,  arch: 0.06,  perk: 0.0,  headYaw: 0.0,   headPitch: 0.05,  fl: 0.14,  fr: 0.12,  bl: -0.12, br: -0.10, flLift: 0.10, frLift: 0.09, blLift: 0.04, brLift: 0.03, tailLift: 0.05,  tailSway: 0.03  },
  bound2: { bodyY: 0.065,  arch: -0.04, perk: 0.0,  headYaw: 0.0,   headPitch: 0.02,  fl: 0.22,  fr: 0.20,  bl: -0.22, br: -0.20, flLift: 0.12, frLift: 0.12, blLift: 0.12, brLift: 0.12, tailLift: 0.12,  tailSway: 0.0   },
  bound3: { bodyY: 0.025,  arch: 0.02,  perk: 0.0,  headYaw: 0.0,   headPitch: -0.02, fl: 0.14,  fr: 0.10,  bl: -0.06, br: -0.08, flLift: 0.03, frLift: 0.04, blLift: 0.09, brLift: 0.08, tailLift: 0.08,  tailSway: -0.03 },
  bound4: { bodyY: -0.015, arch: 0.11,  perk: 0.0,  headYaw: 0.0,   headPitch: 0.0,   fl: -0.06, fr: -0.08, bl: 0.10,  br: 0.08,  flLift: 0.0,  frLift: 0.0,  blLift: 0.05, brLift: 0.04, tailLift: 0.02,  tailSway: 0.0   },
  bound5: { bodyY: -0.02,  arch: 0.16,  perk: 0.0,  headYaw: 0.0,   headPitch: 0.02,  fl: -0.12, fr: -0.10, bl: 0.16,  br: 0.14,  flLift: 0.0,  frLift: 0.0,  blLift: 0.0,  brLift: 0.0,  tailLift: -0.03, tailSway: 0.02  },

  // Alert upright periscope posture standing on hind legs!
  perk0:  { bodyY: 0.02,   arch: 0.05,  perk: 0.55, headYaw: 0.0,   headPitch: 0.06,  fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0,   flLift: 0.0,  frLift: 0.0,  blLift: 0.0,  brLift: 0.0,  tailLift: -0.12, tailSway: 0.0   },
  perk1:  { bodyY: 0.04,   arch: 0.02,  perk: 1.0,  headYaw: 0.08,  headPitch: 0.08,  fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0,   flLift: 0.0,  frLift: 0.0,  blLift: 0.0,  brLift: 0.0,  tailLift: -0.16, tailSway: 0.04  },
  perk2:  { bodyY: 0.04,   arch: 0.02,  perk: 1.0,  headYaw: -0.08, headPitch: 0.07,  fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0,   flLift: 0.0,  frLift: 0.0,  blLift: 0.0,  brLift: 0.0,  tailLift: -0.16, tailSway: -0.04 },
};

const weaselCache = new Map<WeaselPoseName, Boar27Pack>();
 function buildWeaselPosePack(pose: WeaselPoseName): Boar27Pack {
  let pack = weaselCache.get(pose);
  if (!pack) {
    const P = WEASEL_POSES[pose];
    const by = P.bodyY;
    const pk = P.perk;
    const arch = P.arch;

    // Spine anchor points morph smoothly from sinuous horizontal mustelid to upright periscope!
    const rumpY = -0.06 + by - pk * 0.08;
    const rumpZ = -0.26 + pk * 0.14;
    const midY  = -0.02 + by + arch + pk * 0.10;
    const midZ  = -0.02 + pk * 0.04;
    const shY   =  0.00 + by + pk * 0.24;
    const shZ   =  0.24 - pk * 0.16;

    const headX = P.headYaw;
    const headY =  0.08 + by + pk * 0.30 + P.headPitch * 0.2;
    const headZ =  0.42 - pk * 0.26;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // --------------------------------------------------------------------
      // 1. LONG, SLENDER, SINUOUS MUSTELID SPINE & NECK
      // --------------------------------------------------------------------
      const backSeg  = sdCapsule(x, y, z, 0, rumpY, rumpZ, 0, midY, midZ, 0.125, 0.108);
      const frontSeg = sdCapsule(x, y, z, 0, midY, midZ, 0, shY, shZ, 0.108, 0.115);
      const neck     = sdCapsule(x, y, z, 0, shY + 0.01, shZ, headX * 0.6, headY - 0.02, headZ - 0.06, 0.095, 0.082);

      // Sleek mustelid head & pointed snout
      const head  = sdEllipsoid(x, y, z, headX, headY, headZ, 0.105, 0.092, 0.125);
      const snout = sdCapsule(x, y, z, headX, headY - 0.015, headZ + 0.05, headX * 1.15, headY - 0.03 + P.headPitch * 0.35, headZ + 0.20, 0.065, 0.032);

      // Small rounded cream-rimmed ears
      const earL = sdEllipsoid(x, y, z, headX - 0.088, headY + 0.082, headZ - 0.02, 0.038, 0.045, 0.024);
      const earR = sdEllipsoid(x, y, z, headX + 0.088, headY + 0.082, headZ - 0.02, 0.038, 0.045, 0.024);

      let body = smin(backSeg, frontSeg, 0.055);
      body = smin(body, neck, 0.045);
      body = smin(body, head, 0.04);
      body = smin(body, snout, 0.03);
      body = smin(body, Math.min(earL, earR), 0.015);

      // --------------------------------------------------------------------
      // 2. LONG LUSH BUSHY TAIL
      // --------------------------------------------------------------------
      const t1Y = rumpY + 0.02 + P.tailLift * 0.4;
      const t1Z = rumpZ - 0.24;
      const t2Y = rumpY + 0.04 + P.tailLift;
      const t2Z = rumpZ - 0.56;
      const tail1 = sdCapsule(x, y, z, 0, rumpY, rumpZ - 0.04, P.tailSway * 0.5, t1Y, t1Z, 0.072, 0.088);
      const tail2 = sdCapsule(x, y, z, P.tailSway * 0.5, t1Y, t1Z, P.tailSway, t2Y, t2Z, 0.086, 0.055);
      const tail = smin(tail1, tail2, 0.035);
      body = smin(body, tail, 0.035);

      // --------------------------------------------------------------------
      // 3. FOUR AGILE LEGS & DARKER BROWN PAWS
      // --------------------------------------------------------------------
      // Front legs tuck cutely against the white chest bib when perking!
      const flEndY = pk > 0.2 ? shY - 0.11 : -0.25 + P.flLift;
      const frEndY = pk > 0.2 ? shY - 0.11 : -0.25 + P.frLift;
      const flEndZ = pk > 0.2 ? shZ + 0.12 : shZ + 0.04 + P.fl;
      const frEndZ = pk > 0.2 ? shZ + 0.12 : shZ + 0.04 + P.fr;

      const fl = sdCapsule(x, y, z, -0.09, shY - 0.04, shZ, -0.095 + pk * 0.02, flEndY, flEndZ, 0.046, 0.036);
      const fr = sdCapsule(x, y, z,  0.09, shY - 0.04, shZ,  0.095 - pk * 0.02, frEndY, frEndZ, 0.046, 0.036);

      const blEndY = -0.25 + (1 - pk) * P.blLift;
      const brEndY = -0.25 + (1 - pk) * P.brLift;
      const blEndZ = rumpZ + 0.02 + (1 - pk) * P.bl + pk * 0.06;
      const brEndZ = rumpZ + 0.02 + (1 - pk) * P.br + pk * 0.06;

      const bl = sdCapsule(x, y, z, -0.10, rumpY - 0.02, rumpZ, -0.105, blEndY, blEndZ, 0.056, 0.038);
      const br = sdCapsule(x, y, z,  0.10, rumpY - 0.02, rumpZ,  0.105, brEndY, brEndZ, 0.056, 0.038);

      const legs = Math.min(Math.min(fl, fr), Math.min(bl, br));
      body = smin(body, legs, 0.025);

      // --------------------------------------------------------------------
      // 4. BRIGHT DARK EYES WITH WHITE GLINT & DARK-PINK NOSE
      // --------------------------------------------------------------------
      const eyeL = sdEllipsoid(x, y, z, headX - 0.072, headY + 0.022, headZ + 0.088, 0.026, 0.026, 0.025);
      const eyeR = sdEllipsoid(x, y, z, headX + 0.072, headY + 0.022, headZ + 0.088, 0.026, 0.026, 0.025);
      const glintL = sdEllipsoid(x, y, z, headX - 0.078, headY + 0.034, headZ + 0.106, 0.012, 0.012, 0.012);
      const glintR = sdEllipsoid(x, y, z, headX + 0.078, headY + 0.034, headZ + 0.106, 0.012, 0.012, 0.012);
      const nose = sdEllipsoid(x, y, z, headX * 1.15, headY - 0.026 + P.headPitch * 0.35, headZ + 0.215, 0.030, 0.024, 0.026);

      let d = body;
      let mat = 'coat';
      if (Math.min(eyeL, eyeR) < d) { d = Math.min(eyeL, eyeR); mat = 'eye'; }
      if (Math.min(glintL, glintR) < d) { d = Math.min(glintL, glintR); mat = 'glint'; }
      if (nose < d) { d = nose; mat = 'nose'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'glint') return 'w';
      if (mat === 'eye') return 'k';
      if (mat === 'nose') return 'n';

      // Cream-rimmed small rounded ears
      const nearEar = Math.abs(Math.abs(x - headX) - 0.088) < 0.048 && y > headY + 0.065 && Math.abs(z - (headZ - 0.02)) < 0.035;
      if (nearEar && y > headY + 0.095) return shade > 0.45 ? 'c1' : 'c0';

      // Iconic crisp white throat & chest bib (Portuguese fuinha!)
      const inBib = pk > 0.35
        ? (z > shZ - 0.02 && y > rumpY + 0.08 && y < headY - 0.02 && Math.abs(x) < 0.11)
        : (z > shZ - 0.10 && z < headZ + 0.12 && y < headY - 0.035 && Math.abs(x) < 0.105);
      if (inBib) {
        if (shade > 0.72) return 'c2';
        return shade > 0.34 ? 'c1' : 'c0';
      }

      // Darker brown paws & lush tail tip
      const isPaw = (pk < 0.3 && y < -0.17) || (pk >= 0.3 && y < -0.17 && z < rumpZ + 0.12);
      const isTailTip = z < rumpZ - 0.40;
      if (isPaw || isTailTip) {
        return shade > 0.42 ? 'd1' : 'd0';
      }

      // Rich warm cocoa/chestnut-brown coat
      if (shade > 0.80) return 'b4';
      if (shade > 0.58) return 'b3';
      if (shade > 0.36) return 'b2';
      if (shade > 0.18) return 'b1';
      return 'b0';
    };

    pack = build27Pack(WEASEL_PW, WEASEL_PH, 0.98, 0.68, WEASEL_PAL, evalFn, shadeFn);
    weaselCache.set(pose, pack);
  }
  return pack;
}

export function getWeaselPosePack(...args: Parameters<typeof buildWeaselPosePack>): ReturnType<typeof buildWeaselPosePack> {
  return registerAnimalSpritePack(buildWeaselPosePack(...args), { module: './Weasel.ts', factory: 'getWeaselPosePack', args }, buildWeaselPosePack);
}

// ============================================================================
// INSTÂNCIA NA ARENA (Weasel — Agile bounding & periscoping mustelid)
// ============================================================================
function pickCycle<T>(frames: readonly T[], idx: number): T {
  return sampleAnimalCycle(frames, idx);
}

const WEASEL_IDLE: readonly WeaselPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const WEASEL_BOUND: readonly WeaselPoseName[] = ['bound0', 'bound1', 'bound2', 'bound3', 'bound4', 'bound5'];
const WEASEL_PERK: readonly WeaselPoseName[] = ['perk0', 'perk1', 'perk2', 'perk1', 'perk0'];

export class Weasel extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private home = new THREE.Vector3();
  private state: 'idle' | 'special' | 'move' | 'react' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.1, 2.4);
  private targetYaw = rand(0, Math.PI * 2);
  private gaitPhase = rand(0, Math.PI * 2);
  private readonly centerY = 0.16;

  constructor(ctx: GameContext, startPos: THREE.Vector3) {
    super(
      ctx,
      getWeaselPosePack('idle0').getView(2, 0)!,
      WEASEL_PW,
      WEASEL_PH,
      WEASEL_W,
      WEASEL_H,
      'WeaselBillboard',
    );
    this.hp = 25;
    this.maxHp = 25;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.22;
    this.motor.height = 0.36;
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
    this.hp = Math.max(0, this.hp - hit.damage);
    res.damage = hit.damage;
    this.flash = 1.0;
    this.vel.x += hit.dir.x * 4.5;
    this.vel.z += hit.dir.z * 4.5;
    this.vel.y = 3.4;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.state = 'react';
      this.stateT = 0;
      this.stateDur = 2.2;
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
        if (dist < 3.6 && this.state !== 'react') {
          this.state = 'react';
          this.stateT = 0;
          this.stateDur = 2.0;
        }

        if (this.state === 'idle') {
          if (this.stateT >= this.stateDur) {
            this.state = Math.random() < 0.42 ? 'special' : 'move';
            this.stateT = 0;
            this.stateDur = rand(1.4, 2.6);
            const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
            this.targetYaw = toHome > 8.0
              ? Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.5, 0.5)
              : this.facing + rand(-1.8, 1.8);
          }
        } else if (this.state === 'special') {
          if (this.stateT >= this.stateDur) {
            this.state = 'move';
            this.stateT = 0;
            this.stateDur = rand(1.5, 2.8);
          }
        } else if (this.state === 'move') {
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 7);
          speed = 2.7;
          if (this.stateT >= this.stateDur && this.motor.grounded) {
            this.state = Math.random() < 0.48 ? 'special' : 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.3, 2.4);
          }
        } else if (this.state === 'react') {
          if (target && target.alive) {
            this.targetYaw = Math.atan2(this.position.x - target.position.x, this.position.z - target.position.z);
            this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 10);
            speed = 4.9;
          }
          if (this.stateT >= this.stateDur && dist > 5.2 && this.motor.grounded) {
            this.state = 'special';
            this.stateT = 0;
            this.stateDur = rand(1.2, 2.0);
          }
        }

        this.vel.x = damp(this.vel.x, Math.sin(this.facing) * speed, 10, dt);
        this.vel.z = damp(this.vel.z, Math.cos(this.facing) * speed, 10, dt);
        this.vel.y -= 20 * dt;
        this.motor.update(dt);

        const targetPitch = !this.motor.grounded ? Math.max(-0.26, Math.min(0.26, this.vel.y * 0.045)) : 0;
        this.bodyPitch = damp(this.bodyPitch, targetPitch, 10, dt);

        const horiz = Math.hypot(this.vel.x, this.vel.z);
        if (horiz > 0.25 && this.motor.grounded) {
          this.gaitPhase += dt * 7.2 * (0.65 + horiz * 0.22);
        }
      }
      this.syncHurtbox();
    }

    const horiz = Math.hypot(this.vel.x, this.vel.z);
    const bob = this.alive && this.motor.grounded && horiz > 0.25
      ? Math.abs(Math.sin(this.gaitPhase)) * 0.032
      : 0;
    const pose: WeaselPoseName = !this.alive
      ? 'idle0'
      : this.state === 'special'
        ? pickCycle(WEASEL_PERK, this.stateT * 2.2)
        : this.state === 'move' || this.state === 'react'
          ? pickCycle(WEASEL_BOUND, (this.gaitPhase / Math.PI) * 3.0)
          : pickCycle(WEASEL_IDLE, this.stateT * 2.2);
    const deathSink = this.alive ? 0 : Math.min(0.20, this.deadT * 0.4);
    this.renderBillboard(getWeaselPosePack(pose), this.position.y + this.centerY + bob - deathSink, camera, drawingBufferSize);
  }
}
