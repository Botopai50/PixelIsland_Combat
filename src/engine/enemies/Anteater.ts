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
// TAMANDUÁ-BANDEIRA (Giant Anteater) — Flagship 70×38 @ 56 PPU
// ============================================================================
const ANIMAL_PPU = 56;

export type AnteaterPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'walk0' | 'walk1' | 'walk2' | 'walk3' | 'walk4' | 'walk5'
  | 'lick0' | 'lick1' | 'lick2'
  | 'defend0' | 'defend1' | 'defend2';

export const ANTEATER_PW = 70;
export const ANTEATER_PH = 38;
export const ANTEATER_W = ANTEATER_PW / ANIMAL_PPU;
export const ANTEATER_H = ANTEATER_PH / ANIMAL_PPU;

const ANTEATER_PAL: Record<string, [number, number, number]> = {
  k:  [0x14, 0x11, 0x10], // 1px dark outline / tiny nose / eye
  w:  [0xfc, 0xfa, 0xf2], // eye glint
  b0: [0x1c, 0x18, 0x16], // jet-black diagonal wedge stripe & ankle bands
  b1: [0x33, 0x2c, 0x28], // dark charcoal highlight on stripe
  g0: [0x47, 0x3e, 0x37], // grizzled ash-taupe deep shadow
  g1: [0x66, 0x5a, 0x50], // warm grey-brown shadow
  g2: [0x87, 0x79, 0x6c], // grizzled ash-taupe midtone
  g3: [0xa8, 0x9b, 0x8d], // sunlit shaggy grey-brown
  g4: [0xc7, 0xbc, 0xae], // bright grizzled rim highlight
  c0: [0xc9, 0xc3, 0xb7], // white foreleg / stripe edge shadow
  c1: [0xeb, 0xe7, 0xdc], // crisp white stripe border & forelegs
  c2: [0xfc, 0xfa, 0xf4], // ivory digging claws & bright white highlight
  t0: [0xc9, 0x4b, 0x6e], // pink tongue shadow
  t1: [0xf5, 0x7a, 0x9c], // bright pink flicking tongue
};

interface AnteaterPose {
  bodyY: number;
  defend: number;  // 0 = quadrupedal, 1 = classic upright defensive stance with claws out
  headDip: number; // dips snout toward ground in lick0..2
  tongue: number;  // 0..1 pink tongue extension
  fl: number;
  fr: number;
  bl: number;
  br: number;
  flLift: number;
  frLift: number;
  blLift: number;
  brLift: number;
  tailSway: number;
}

const ANTEATER_POSES: Record<AnteaterPoseName, AnteaterPose> = {
  idle0:   { bodyY: 0.0,    defend: 0.0,  headDip: 0.0,   tongue: 0.0,  fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0,   flLift: 0.0,  frLift: 0.0,  blLift: 0.0,  brLift: 0.0,  tailSway: 0.0   },
  idle1:   { bodyY: 0.012,  defend: 0.0,  headDip: -0.02, tongue: 0.0,  fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0,   flLift: 0.0,  frLift: 0.0,  blLift: 0.0,  brLift: 0.0,  tailSway: 0.04  },
  idle2:   { bodyY: -0.008, defend: 0.0,  headDip: 0.02,  tongue: 0.0,  fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0,   flLift: 0.0,  frLift: 0.0,  blLift: 0.0,  brLift: 0.0,  tailSway: -0.04 },

  // Steady knuckle-clawed stroll
  walk0:   { bodyY: 0.012,  defend: 0.0,  headDip: 0.01,  tongue: 0.0,  fl: 0.14,  fr: -0.10, bl: -0.12, br: 0.12,  flLift: 0.06, frLift: 0.0,  blLift: 0.0,  brLift: 0.05, tailSway: 0.02  },
  walk1:   { bodyY: 0.020,  defend: 0.0,  headDip: 0.0,   tongue: 0.0,  fl: 0.07,  fr: -0.03, bl: -0.05, br: 0.06,  flLift: 0.03, frLift: 0.04, blLift: 0.04, brLift: 0.02, tailSway: 0.04  },
  walk2:   { bodyY: 0.0,    defend: 0.0,  headDip: 0.02,  tongue: 0.0,  fl: -0.03, fr: 0.07,  bl: 0.06,  br: -0.04, flLift: 0.0,  frLift: 0.06, blLift: 0.05, brLift: 0.0,  tailSway: 0.0   },
  walk3:   { bodyY: 0.012,  defend: 0.0,  headDip: 0.01,  tongue: 0.0,  fl: -0.10, fr: 0.14,  bl: 0.12,  br: -0.12, flLift: 0.0,  frLift: 0.06, blLift: 0.05, brLift: 0.0,  tailSway: -0.02 },
  walk4:   { bodyY: 0.020,  defend: 0.0,  headDip: 0.0,   tongue: 0.0,  fl: -0.03, fr: 0.07,  bl: 0.06,  br: -0.05, flLift: 0.04, frLift: 0.03, blLift: 0.02, brLift: 0.04, tailSway: -0.04 },
  walk5:   { bodyY: 0.0,    defend: 0.0,  headDip: 0.02,  tongue: 0.0,  fl: 0.07,  fr: -0.03, bl: -0.04, br: 0.06,  flLift: 0.06, frLift: 0.0,  blLift: 0.0,  brLift: 0.05, tailSway: 0.0   },

  // Snout dipped with long bright-pink flicking tongue extended!
  lick0:   { bodyY: -0.01,  defend: 0.0,  headDip: 0.10,  tongue: 0.55, fl: 0.03,  fr: -0.02, bl: 0.0,   br: 0.0,   flLift: 0.0,  frLift: 0.0,  blLift: 0.0,  brLift: 0.0,  tailSway: 0.02  },
  lick1:   { bodyY: -0.015, defend: 0.0,  headDip: 0.14,  tongue: 1.00, fl: 0.04,  fr: -0.02, bl: 0.0,   br: 0.0,   flLift: 0.0,  frLift: 0.0,  blLift: 0.0,  brLift: 0.0,  tailSway: -0.02 },
  lick2:   { bodyY: -0.01,  defend: 0.0,  headDip: 0.11,  tongue: 0.70, fl: 0.03,  fr: -0.02, bl: 0.0,   br: 0.0,   flLift: 0.0,  frLift: 0.0,  blLift: 0.0,  brLift: 0.0,  tailSway: 0.02  },

  // Classic upright defensive stance with big curved claws out!
  defend0: { bodyY: 0.02,   defend: 0.55, headDip: -0.04, tongue: 0.0,  fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0,   flLift: 0.0,  frLift: 0.0,  blLift: 0.0,  brLift: 0.0,  tailSway: 0.0   },
  defend1: { bodyY: 0.04,   defend: 1.00, headDip: -0.06, tongue: 0.0,  fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0,   flLift: 0.0,  frLift: 0.0,  blLift: 0.0,  brLift: 0.0,  tailSway: 0.03  },
  defend2: { bodyY: 0.03,   defend: 0.90, headDip: -0.05, tongue: 0.0,  fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0,   flLift: 0.0,  frLift: 0.0,  blLift: 0.0,  brLift: 0.0,  tailSway: -0.03 },
};

const anteaterCache = new Map<AnteaterPoseName, Boar27Pack>();
 function buildAnteaterPosePack(pose: AnteaterPoseName): Boar27Pack {
  let pack = anteaterCache.get(pose);
  if (!pack) {
    const P = ANTEATER_POSES[pose];
    const by = P.bodyY;
    const df = P.defend;
    const dip = P.headDip;

    // Spine rears up in defend0..2
    const rumpY = -0.02 + by - df * 0.10;
    const rumpZ = -0.18 + df * 0.14;
    const shY   =  0.04 + by + df * 0.24;
    const shZ   =  0.22 - df * 0.16;

    const headY =  0.03 + by + df * 0.30 - dip * 0.45;
    const headZ =  0.40 - df * 0.22;
    const snoutMidY = headY - 0.05 - dip * 0.55;
    const snoutMidZ = headZ + 0.22;
    const snoutTipY = headY - 0.12 - dip * 0.80;
    const snoutTipZ = headZ + 0.44;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // --------------------------------------------------------------------
      // 1. SHAGGY TORSO & ULTRA-LONG NARROW TUBULAR DOWNWARD-CURVED SNOUT
      // --------------------------------------------------------------------
      const torso = sdCapsule(x, y, z, 0, rumpY, rumpZ, 0, shY, shZ, 0.17, 0.185);
      const neck  = sdCapsule(x, y, z, 0, shY, shZ, 0, headY, headZ, 0.135, 0.095);
      const snout1 = sdCapsule(x, y, z, 0, headY, headZ, 0, snoutMidY, snoutMidZ, 0.088, 0.052);
      const snout2 = sdCapsule(x, y, z, 0, snoutMidY, snoutMidZ, 0, snoutTipY, snoutTipZ, 0.050, 0.028);

      // Tiny round ears
      const earL = sdEllipsoid(x, y, z, -0.085, headY + 0.075, headZ - 0.02, 0.032, 0.036, 0.024);
      const earR = sdEllipsoid(x, y, z,  0.085, headY + 0.075, headZ - 0.02, 0.032, 0.036, 0.024);

      // Long bright-pink flicking tongue in lick0..2!
      const tLen = P.tongue;
      const tongue = tLen > 0.05
        ? sdCapsule(
            x, y, z,
            0, snoutTipY, snoutTipZ,
            0, snoutTipY - 0.08 * tLen, snoutTipZ + 0.24 * tLen,
            0.016, 0.011,
          )
        : 99;

      // --------------------------------------------------------------------
      // 2. ENORMOUS LUSH FLOWING BUSHY BANNER TAIL
      // --------------------------------------------------------------------
      const tailSpine = sdCapsule(x, y, z, 0, rumpY, rumpZ - 0.06, P.tailSway, rumpY - 0.04, rumpZ - 0.66, 0.12, 0.08);
      // Draping long shaggy banner hair hanging down from the tail!
      const tailCurtain1 = sdEllipsoid(x, y, z, P.tailSway * 0.4, rumpY - 0.12, rumpZ - 0.30, 0.11, 0.17, 0.22);
      const tailCurtain2 = sdEllipsoid(x, y, z, P.tailSway * 0.8, rumpY - 0.14, rumpZ - 0.56, 0.10, 0.18, 0.24);
      const tail = smin(tailSpine, smin(tailCurtain1, tailCurtain2, 0.06), 0.05);

      // --------------------------------------------------------------------
      // 3. STURDY WHITE FORELEG + CURVED IVORY CLAWS & HIND LEGS
      // --------------------------------------------------------------------
      // Forelegs spread wide & forward with big claws out in defend0..2!
      const flX = -0.14 - df * 0.12;
      const frX =  0.14 + df * 0.12;
      const flY = df > 0.3 ? shY - 0.04 : -0.34 + P.flLift;
      const frY = df > 0.3 ? shY - 0.04 : -0.34 + P.frLift;
      const flZ = df > 0.3 ? shZ + 0.22 : shZ + 0.04 + P.fl;
      const frZ = df > 0.3 ? shZ + 0.22 : shZ + 0.04 + P.fr;

      const fl = sdCapsule(x, y, z, -0.12, shY - 0.06, shZ, flX, flY, flZ, 0.072, 0.056);
      const fr = sdCapsule(x, y, z,  0.12, shY - 0.06, shZ, frX, frY, frZ, 0.072, 0.056);

      // Curved ivory digging claws on forepaws!
      const clawL = sdCapsule(x, y, z, flX, flY - 0.01, flZ + 0.02, flX + (df > 0.3 ? 0.03 : 0), flY - 0.04, flZ + 0.09, 0.026, 0.012);
      const clawR = sdCapsule(x, y, z, frX, frY - 0.01, frZ + 0.02, frX - (df > 0.3 ? 0.03 : 0), frY - 0.04, frZ + 0.09, 0.026, 0.012);
      const claws = Math.min(clawL, clawR);

      // Hind legs
      const bl = sdCapsule(x, y, z, -0.13, rumpY - 0.04, rumpZ, -0.135, -0.34 + (1 - df) * P.blLift, rumpZ + 0.02 + (1 - df) * P.bl, 0.074, 0.054);
      const br = sdCapsule(x, y, z,  0.13, rumpY - 0.04, rumpZ,  0.135, -0.34 + (1 - df) * P.brLift, rumpZ + 0.02 + (1 - df) * P.br, 0.074, 0.054);

      let body = smin(torso, neck, 0.06);
      body = smin(body, snout1, 0.04);
      body = smin(body, snout2, 0.025);
      body = smin(body, Math.min(earL, earR), 0.015);
      body = smin(body, tail, 0.05);
      body = smin(body, Math.min(Math.min(fl, fr), Math.min(bl, br)), 0.035);

      // Small dark eye with white glint + tiny dark nose
      const eyeL = sdEllipsoid(x, y, z, -0.068, headY + 0.012, headZ + 0.085, 0.022, 0.022, 0.020);
      const eyeR = sdEllipsoid(x, y, z,  0.068, headY + 0.012, headZ + 0.085, 0.022, 0.022, 0.020);
      const glintL = sdEllipsoid(x, y, z, -0.073, headY + 0.021, headZ + 0.098, 0.010, 0.010, 0.010);
      const glintR = sdEllipsoid(x, y, z,  0.073, headY + 0.021, headZ + 0.098, 0.010, 0.010, 0.010);
      const nose = sdEllipsoid(x, y, z, 0, snoutTipY, snoutTipZ + 0.018, 0.026, 0.024, 0.024);

      let d = body;
      let mat = 'coat';
      if (claws < d) { d = claws; mat = 'claw'; }
      if (tongue < d) { d = tongue; mat = 'tongue'; }
      if (Math.min(eyeL, eyeR) < d) { d = Math.min(eyeL, eyeR); mat = 'eye'; }
      if (Math.min(glintL, glintR) < d) { d = Math.min(glintL, glintR); mat = 'glint'; }
      if (nose < d) { d = nose; mat = 'nose'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, _x, y, z) => {
      if (mat === 'glint' || mat === 'claw') return 'c2';
      if (mat === 'eye' || mat === 'nose') return 'k';
      if (mat === 'tongue') return shade > 0.45 ? 't1' : 't0';

      // Sturdy white forelegs with black ankle bands!
      const isForeleg = z > shZ - 0.08 && z < headZ - 0.02 && y < shY - 0.08;
      if (isForeleg) {
        if (y < -0.25 && y > -0.32 && df < 0.3) return 'b0'; // black ankle band
        return shade > 0.65 ? 'c2' : shade > 0.32 ? 'c1' : 'c0';
      }

      // Iconic bold jet-black diagonal wedge stripe edged in crisp white!
      // Sweeps diagonally from throat/chest (z ~ shZ+0.08, low y) back-upward over shoulder to mid-flank (z ~ rumpZ+0.08, high y)
      const diag = (z - (shZ - 0.04)) * 0.72 + (y - (shY - 0.06)) * 0.85;
      if (z > rumpZ - 0.02 && z < headZ - 0.04) {
        if (Math.abs(diag) < 0.085) return shade > 0.55 ? 'b1' : 'b0';
        if (Math.abs(diag) < 0.118) return shade > 0.45 ? 'c1' : 'c0';
      }

      // Grizzled warm grey-brown / ash-taupe shaggy coat & banner tail
      if (shade > 0.80) return 'g4';
      if (shade > 0.58) return 'g3';
      if (shade > 0.36) return 'g2';
      if (shade > 0.18) return 'g1';
      return 'g0';
    };

    pack = build27Pack(ANTEATER_PW, ANTEATER_PH, 1.06, 0.72, ANTEATER_PAL, evalFn, shadeFn);
    anteaterCache.set(pose, pack);
  }
  return pack;
}

export function getAnteaterPosePack(...args: Parameters<typeof buildAnteaterPosePack>): ReturnType<typeof buildAnteaterPosePack> {
  return registerAnimalSpritePack(buildAnteaterPosePack(...args), { module: './Anteater.ts', factory: 'getAnteaterPosePack', args }, buildAnteaterPosePack);
}

// ============================================================================
// INSTÂNCIA NA ARENA (Anteater)
// ============================================================================
function pickCycle<T>(frames: readonly T[], idx: number): T {
  return sampleAnimalCycle(frames, idx);
}

const ANTEATER_IDLE: readonly AnteaterPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const ANTEATER_WALK: readonly AnteaterPoseName[] = ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'];
const ANTEATER_LICK: readonly AnteaterPoseName[] = ['lick0', 'lick1', 'lick2', 'lick1', 'lick0'];
const ANTEATER_DEFEND: readonly AnteaterPoseName[] = ['defend0', 'defend1', 'defend2', 'defend1'];

export class Anteater extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private home = new THREE.Vector3();
  private state: 'idle' | 'special' | 'move' | 'react' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.6, 3.0);
  private targetYaw = rand(0, Math.PI * 2);
  private gaitPhase = rand(0, Math.PI * 2);
  private readonly centerY = 0.34;

  constructor(ctx: GameContext, startPos: THREE.Vector3) {
    super(
      ctx,
      getAnteaterPosePack('idle0').getView(2, 0)!,
      ANTEATER_PW,
      ANTEATER_PH,
      ANTEATER_W,
      ANTEATER_H,
      'AnteaterBillboard',
    );
    this.hp = 80;
    this.maxHp = 80;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.42;
    this.motor.height = 0.72;
    this.motor.teleport(startPos);
    this.home.copy(startPos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.48, tag: 'body', enabled: true });
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
    this.vel.x += hit.dir.x * 3.2;
    this.vel.z += hit.dir.z * 3.2;
    this.vel.y = 2.4;
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
          this.stateDur = 1.8;
        }

        if (this.state === 'idle') {
          if (this.stateT >= this.stateDur) {
            this.state = Math.random() < 0.45 ? 'special' : 'move';
            this.stateT = 0;
            this.stateDur = rand(1.8, 3.2);
            const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
            this.targetYaw = toHome > 8.0
              ? Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.5, 0.5)
              : this.facing + rand(-1.5, 1.5);
          }
        } else if (this.state === 'special') {
          if (this.stateT >= this.stateDur) {
            this.state = 'move';
            this.stateT = 0;
            this.stateDur = rand(1.8, 3.0);
          }
        } else if (this.state === 'move') {
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 5);
          speed = 1.7;
          if (this.stateT >= this.stateDur && this.motor.grounded) {
            this.state = Math.random() < 0.48 ? 'special' : 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.5, 2.8);
          }
        } else if (this.state === 'react') {
          // Face the threat and rear up in classic defensive stance!
          if (target && target.alive) {
            this.targetYaw = Math.atan2(target.position.x - this.position.x, target.position.z - this.position.z);
            this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 8);
          }
          speed = 0;
          if (this.stateT >= this.stateDur && dist > 3.8 && this.motor.grounded) {
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.4, 2.4);
          }
        }

        this.vel.x = damp(this.vel.x, Math.sin(this.facing) * speed, 8, dt);
        this.vel.z = damp(this.vel.z, Math.cos(this.facing) * speed, 8, dt);
        this.vel.y -= 20 * dt;
        this.motor.update(dt);

        const horiz = Math.hypot(this.vel.x, this.vel.z);
        if (horiz > 0.25 && this.motor.grounded) {
          this.gaitPhase += dt * 5.2 * (0.65 + horiz * 0.22);
        }
      }
      this.syncHurtbox();
    }

    const horiz = Math.hypot(this.vel.x, this.vel.z);
    const bob = this.alive && this.motor.grounded && horiz > 0.25
      ? Math.abs(Math.sin(this.gaitPhase)) * 0.025
      : 0;
    const pose: AnteaterPoseName = !this.alive
      ? 'idle0'
      : this.state === 'react'
        ? pickCycle(ANTEATER_DEFEND, this.stateT * 3.0)
        : this.state === 'special'
          ? pickCycle(ANTEATER_LICK, this.stateT * 3.5)
          : this.state === 'move'
            ? pickCycle(ANTEATER_WALK, (this.gaitPhase / Math.PI) * 2.6)
            : pickCycle(ANTEATER_IDLE, this.stateT * 2.0);
    const deathSink = this.alive ? 0 : Math.min(0.22, this.deadT * 0.4);
    this.renderBillboard(getAnteaterPosePack(pose), this.position.y + this.centerY + bob - deathSink, camera, drawingBufferSize);
  }
}
