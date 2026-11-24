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
// MICO-LEÃO-DOURADO (Golden Lion Tamarin) — Flagship 30×26 @ 56 PPU
// ============================================================================
const ANIMAL_PPU = 56;

export type GoldenLionTamarinPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'hop0' | 'hop1' | 'hop2' | 'hop3' | 'hop4' | 'hop5'
  | 'perch0' | 'perch1' | 'perch2';

export const TAMARIN_PW = 30;
export const TAMARIN_PH = 26;
export const TAMARIN_W = TAMARIN_PW / ANIMAL_PPU;
export const TAMARIN_H = TAMARIN_PH / ANIMAL_PPU;

const TAMARIN_PAL: Record<string, [number, number, number]> = {
  k:  [0x16, 0x0f, 0x0d], // 1px dark outline / bright dark eyes
  w:  [0xff, 0xfb, 0xf2], // crisp white eye glint
  f0: [0x24, 0x1a, 0x17], // hairless dark-charcoal/espresso face & hands shadow
  f1: [0x3d, 0x2c, 0x26], // dark-charcoal face & hands highlight
  g0: [0x7a, 0x30, 0x08], // deep burnt-saffron shadow
  g1: [0xb8, 0x52, 0x0e], // rich fiery saffron-orange
  g2: [0xe6, 0x83, 0x17], // warm honey-orange midtone
  g3: [0xff, 0xb8, 0x29], // radiant sunburst gold
  g4: [0xff, 0xe2, 0x6b], // bright sunlit golden silk highlight
};

interface TamarinPose {
  bodyY: number;
  perch: number;   // 0 = quadrupedal, 1 = cute upright alert crouch
  headYaw: number;
  fl: number;
  fr: number;
  bl: number;
  br: number;
  flLift: number;
  frLift: number;
  blLift: number;
  brLift: number;
  tailSway: number;
  tailLift: number;
}

const TAMARIN_POSES: Record<GoldenLionTamarinPoseName, TamarinPose> = {
  // Gentle tail sway & alert breathing
  idle0:  { bodyY: 0.0,    perch: 0.15, headYaw: 0.0,   fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0,   flLift: 0.0,  frLift: 0.0,  blLift: 0.0,  brLift: 0.0,  tailSway: 0.0,   tailLift: 0.0  },
  idle1:  { bodyY: 0.014,  perch: 0.18, headYaw: 0.05,  fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0,   flLift: 0.0,  frLift: 0.0,  blLift: 0.0,  brLift: 0.0,  tailSway: 0.08,  tailLift: 0.05 },
  idle2:  { bodyY: -0.01,  perch: 0.12, headYaw: -0.05, fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0,   flLift: 0.0,  frLift: 0.0,  blLift: 0.0,  brLift: 0.0,  tailSway: -0.08, tailLift: -0.02 },

  // Nimble bounding monkey hops
  hop0:   { bodyY: -0.02,  perch: 0.05, headYaw: 0.0,   fl: -0.06, fr: -0.06, bl: 0.10,  br: 0.10,  flLift: 0.0,  frLift: 0.0,  blLift: 0.0,  brLift: 0.0,  tailSway: 0.0,   tailLift: -0.06 },
  hop1:   { bodyY: 0.04,   perch: 0.0,  headYaw: 0.0,   fl: 0.14,  fr: 0.12,  bl: -0.10, br: -0.12, flLift: 0.10, frLift: 0.09, blLift: 0.05, brLift: 0.04, tailSway: 0.04,  tailLift: 0.04 },
  hop2:   { bodyY: 0.075,  perch: 0.0,  headYaw: 0.0,   fl: 0.20,  fr: 0.18,  bl: -0.20, br: -0.18, flLift: 0.14, frLift: 0.14, blLift: 0.14, brLift: 0.14, tailSway: 0.0,   tailLift: 0.12 },
  hop3:   { bodyY: 0.03,   perch: 0.05, headYaw: 0.0,   fl: 0.12,  fr: 0.10,  bl: -0.06, br: -0.08, flLift: 0.04, frLift: 0.05, blLift: 0.10, brLift: 0.09, tailSway: -0.04, tailLift: 0.08 },
  hop4:   { bodyY: -0.015, perch: 0.10, headYaw: 0.0,   fl: -0.04, fr: -0.06, bl: 0.08,  br: 0.06,  flLift: 0.0,  frLift: 0.0,  blLift: 0.04, brLift: 0.04, tailSway: 0.0,   tailLift: 0.0  },
  hop5:   { bodyY: 0.005,  perch: 0.12, headYaw: 0.0,   fl: 0.04,  fr: -0.02, bl: -0.02, br: 0.04,  flLift: 0.03, frLift: 0.0,  blLift: 0.0,  brLift: 0.03, tailSway: 0.03,  tailLift: 0.02 },

  // Cute upright alert crouch!
  perch0: { bodyY: 0.01,   perch: 0.65, headYaw: 0.0,   fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0,   flLift: 0.0,  frLift: 0.0,  blLift: 0.0,  brLift: 0.0,  tailSway: 0.04,  tailLift: 0.04 },
  perch1: { bodyY: 0.025,  perch: 1.00, headYaw: 0.06,  fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0,   flLift: 0.0,  frLift: 0.0,  blLift: 0.0,  brLift: 0.0,  tailSway: 0.08,  tailLift: 0.08 },
  perch2: { bodyY: 0.025,  perch: 1.00, headYaw: -0.06, fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0,   flLift: 0.0,  frLift: 0.0,  blLift: 0.0,  brLift: 0.0,  tailSway: -0.08, tailLift: 0.08 },
};

// Radiating silky mane tuft directions around the face [dx, dy]
const MANE_TUFTS: readonly [number, number][] = [
  [0.0, 1.0],
  [0.52, 0.85], [-0.52, 0.85],
  [0.90, 0.42], [-0.90, 0.42],
  [0.95, -0.15], [-0.95, -0.15],
  [0.65, -0.72], [-0.65, -0.72],
  [0.0, -0.88],
];

const tamarinCache = new Map<GoldenLionTamarinPoseName, Boar27Pack>();
 function buildGoldenLionTamarinPosePack(pose: GoldenLionTamarinPoseName): Boar27Pack {
  let pack = tamarinCache.get(pose);
  if (!pack) {
    const P = TAMARIN_POSES[pose];
    const by = P.bodyY;
    const pr = P.perch;

    // Spine lifts upright in perch0..2
    const hipY = -0.08 + by - pr * 0.06;
    const hipZ = -0.18 + pr * 0.12;
    const shY  =  0.02 + by + pr * 0.18;
    const shZ  =  0.14 - pr * 0.12;

    const headX = P.headYaw;
    const headY =  0.14 + by + pr * 0.22;
    const headZ =  0.26 - pr * 0.18;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // --------------------------------------------------------------------
      // 1. SLENDER GOLDEN-AMBER BODY & RADIATING SILKY LION MANE
      // --------------------------------------------------------------------
      const torso = sdCapsule(x, y, z, 0, hipY, hipZ, 0, shY, shZ, 0.115, 0.105);
      const maneCore = sdEllipsoid(x, y, z, headX, headY, headZ - 0.02, 0.175, 0.175, 0.145);

      let mane = maneCore;
      for (let i = 0; i < MANE_TUFTS.length; i++) {
        const [dx, dy] = MANE_TUFTS[i];
        const tuft = sdCapsule(
          x, y, z,
          headX + dx * 0.10, headY + dy * 0.10, headZ - 0.01,
          headX + dx * 0.22, headY + dy * 0.22, headZ - 0.06,
          0.062, 0.022,
        );
        mane = smin(mane, tuft, 0.025);
      }

      // --------------------------------------------------------------------
      // 2. VERY LONG, GRACEFUL CURVED GOLDEN TAIL (longer than its body!)
      // --------------------------------------------------------------------
      const t1Y = hipY + 0.08 + P.tailLift * 0.4;
      const t1Z = hipZ - 0.26;
      const t2Y = hipY + 0.24 + P.tailLift * 0.8;
      const t2Z = hipZ - 0.52;
      const t3Y = hipY + 0.18 + P.tailLift;
      const t3Z = hipZ - 0.76;

      const tail1 = sdCapsule(x, y, z, 0, hipY, hipZ - 0.04, P.tailSway * 0.4, t1Y, t1Z, 0.048, 0.044);
      const tail2 = sdCapsule(x, y, z, P.tailSway * 0.4, t1Y, t1Z, P.tailSway * 0.8, t2Y, t2Z, 0.044, 0.038);
      const tail3 = sdCapsule(x, y, z, P.tailSway * 0.8, t2Y, t2Z, P.tailSway, t3Y, t3Z, 0.038, 0.028);
      const tail = smin(smin(tail1, tail2, 0.025), tail3, 0.025);

      // --------------------------------------------------------------------
      // 3. AGILE LIMBS & DELICATE GRASPING HANDS
      // --------------------------------------------------------------------
      const flEndY = pr > 0.35 ? shY - 0.10 : -0.26 + P.flLift;
      const frEndY = pr > 0.35 ? shY - 0.10 : -0.26 + P.frLift;
      const flEndZ = pr > 0.35 ? shZ + 0.13 : shZ + 0.06 + P.fl;
      const frEndZ = pr > 0.35 ? shZ + 0.13 : shZ + 0.06 + P.fr;

      const fl = sdCapsule(x, y, z, -0.09, shY - 0.03, shZ, -0.095 + pr * 0.025, flEndY, flEndZ, 0.042, 0.028);
      const fr = sdCapsule(x, y, z,  0.09, shY - 0.03, shZ,  0.095 - pr * 0.025, frEndY, frEndZ, 0.042, 0.028);

      const bl = sdCapsule(x, y, z, -0.10, hipY - 0.02, hipZ, -0.105, -0.26 + (1 - pr) * P.blLift, hipZ + 0.04 + (1 - pr) * P.bl, 0.052, 0.030);
      const br = sdCapsule(x, y, z,  0.10, hipY - 0.02, hipZ,  0.105, -0.26 + (1 - pr) * P.brLift, hipZ + 0.04 + (1 - pr) * P.br, 0.052, 0.030);

      let fur = smin(torso, mane, 0.05);
      fur = smin(fur, tail, 0.03);
      fur = smin(fur, Math.min(Math.min(fl, fr), Math.min(bl, br)), 0.025);

      // --------------------------------------------------------------------
      // 4. SMALL HAIRLESS DARK-CHARCOAL FACE, EYES WITH GLINT & TINY NOSE
      // --------------------------------------------------------------------
      const face = sdEllipsoid(x, y, z, headX, headY - 0.008, headZ + 0.075, 0.092, 0.088, 0.078);
      const eyeL = sdEllipsoid(x, y, z, headX - 0.044, headY + 0.014, headZ + 0.135, 0.024, 0.024, 0.022);
      const eyeR = sdEllipsoid(x, y, z, headX + 0.044, headY + 0.014, headZ + 0.135, 0.024, 0.024, 0.022);
      const glintL = sdEllipsoid(x, y, z, headX - 0.049, headY + 0.025, headZ + 0.150, 0.011, 0.011, 0.011);
      const glintR = sdEllipsoid(x, y, z, headX + 0.049, headY + 0.025, headZ + 0.150, 0.011, 0.011, 0.011);

      let d = fur;
      let mat = 'fur';
      if (face < d) { d = face; mat = 'face'; }
      if (Math.min(eyeL, eyeR) < d) { d = Math.min(eyeL, eyeR); mat = 'eye'; }
      if (Math.min(glintL, glintR) < d) { d = Math.min(glintL, glintR); mat = 'glint'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, _x, y, z) => {
      if (mat === 'glint') return 'w';
      if (mat === 'eye') return 'k';
      if (mat === 'face') return shade > 0.50 ? 'f1' : 'f0';

      // Delicate dark-charcoal grasping hands & feet
      const isHandOrFoot = y < -0.20 || (pr > 0.35 && y < shY - 0.07 && z > shZ + 0.08);
      if (isHandOrFoot) return shade > 0.48 ? 'f1' : 'f0';

      // Rich 5-tone sunburst gold / fiery saffron-orange / warm honey ramp
      if (shade > 0.80) return 'g4';
      if (shade > 0.58) return 'g3';
      if (shade > 0.36) return 'g2';
      if (shade > 0.18) return 'g1';
      return 'g0';
    };

    pack = build27Pack(TAMARIN_PW, TAMARIN_PH, 0.96, 0.78, TAMARIN_PAL, evalFn, shadeFn);
    tamarinCache.set(pose, pack);
  }
  return pack;
}

export function getGoldenLionTamarinPosePack(...args: Parameters<typeof buildGoldenLionTamarinPosePack>): ReturnType<typeof buildGoldenLionTamarinPosePack> {
  return registerAnimalSpritePack(buildGoldenLionTamarinPosePack(...args), { module: './GoldenLionTamarin.ts', factory: 'getGoldenLionTamarinPosePack', args }, buildGoldenLionTamarinPosePack);
}

// ============================================================================
// INSTÂNCIA NA ARENA (GoldenLionTamarin)
// ============================================================================
function pickCycle<T>(frames: readonly T[], idx: number): T {
  return sampleAnimalCycle(frames, idx);
}

const TAMARIN_IDLE: readonly GoldenLionTamarinPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const TAMARIN_HOP: readonly GoldenLionTamarinPoseName[] = ['hop0', 'hop1', 'hop2', 'hop3', 'hop4', 'hop5'];
const TAMARIN_PERCH: readonly GoldenLionTamarinPoseName[] = ['perch0', 'perch1', 'perch2', 'perch1', 'perch0'];

export class GoldenLionTamarin extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private home = new THREE.Vector3();
  private state: 'idle' | 'special' | 'move' | 'react' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.1, 2.4);
  private targetYaw = rand(0, Math.PI * 2);
  private gaitPhase = rand(0, Math.PI * 2);
  private readonly centerY = 0.18;

  constructor(ctx: GameContext, startPos: THREE.Vector3) {
    super(
      ctx,
      getGoldenLionTamarinPosePack('idle0').getView(2, 0)!,
      TAMARIN_PW,
      TAMARIN_PH,
      TAMARIN_W,
      TAMARIN_H,
      'GoldenLionTamarinBillboard',
    );
    this.hp = 20;
    this.maxHp = 20;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.20;
    this.motor.height = 0.34;
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
    this.vel.x += hit.dir.x * 4.5;
    this.vel.z += hit.dir.z * 4.5;
    this.vel.y = 3.8;
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
        if (dist < 3.5 && this.state !== 'react') {
          this.state = 'react';
          this.stateT = 0;
          this.stateDur = 1.9;
        }

        if (this.state === 'idle') {
          if (this.stateT >= this.stateDur) {
            this.state = Math.random() < 0.45 ? 'special' : 'move';
            this.stateT = 0;
            this.stateDur = rand(1.4, 2.5);
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
          speed = 2.6;
          if (this.stateT >= this.stateDur && this.motor.grounded) {
            this.state = Math.random() < 0.50 ? 'special' : 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.3, 2.4);
          }
        } else if (this.state === 'react') {
          if (target && target.alive) {
            this.targetYaw = Math.atan2(this.position.x - target.position.x, this.position.z - target.position.z);
            this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 10);
            speed = 4.6;
          }
          if (this.stateT >= this.stateDur && dist > 5.0 && this.motor.grounded) {
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
          this.gaitPhase += dt * 7.6 * (0.65 + horiz * 0.22);
        }
      }
      this.syncHurtbox();
    }

    const horiz = Math.hypot(this.vel.x, this.vel.z);
    const bob = this.alive && this.motor.grounded && horiz > 0.25
      ? Math.abs(Math.sin(this.gaitPhase)) * 0.04
      : 0;
    const pose: GoldenLionTamarinPoseName = !this.alive
      ? 'idle0'
      : this.state === 'special'
        ? pickCycle(TAMARIN_PERCH, this.stateT * 2.2)
        : this.state === 'move' || this.state === 'react'
          ? pickCycle(TAMARIN_HOP, (this.gaitPhase / Math.PI) * 3.0)
          : pickCycle(TAMARIN_IDLE, this.stateT * 2.2);
    const deathSink = this.alive ? 0 : Math.min(0.20, this.deadT * 0.4);
    this.renderBillboard(getGoldenLionTamarinPosePack(pose), this.position.y + this.centerY + bob - deathSink, camera, drawingBufferSize);
  }
}
