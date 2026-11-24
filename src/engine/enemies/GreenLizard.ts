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
// CALANGO VERDE (Brazilian Green Lizard / Ameiva) — Flagship 38×18 @ 56 PPU
// ============================================================================
const ANIMAL_PPU = 56;

export type GreenLizardPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'dart0' | 'dart1' | 'dart2' | 'dart3' | 'dart4' | 'dart5';

export const GREEN_LIZARD_PW = 38;
export const GREEN_LIZARD_PH = 18;
export const GREEN_LIZARD_W = GREEN_LIZARD_PW / ANIMAL_PPU;
export const GREEN_LIZARD_H = GREEN_LIZARD_PH / ANIMAL_PPU;

const GREEN_LIZARD_PAL: Record<string, [number, number, number]> = {
  k:  [0x0f, 0x1a, 0x13], // 1px dark outline / pupil / tiny claws
  w:  [0xfc, 0xfc, 0xf4], // eye glint
  g0: [0x13, 0x4f, 0x24], // deep emerald dorsal shadow
  g1: [0x21, 0x85, 0x35], // rich emerald green
  g2: [0x3b, 0xc4, 0x45], // vibrant neon-emerald midtone
  g3: [0x74, 0xe8, 0x54], // bright lime-green dorsal highlight
  g4: [0xb8, 0xfc, 0x7c], // sunlit lime specular
  t0: [0x14, 0x6e, 0x6b], // iridescent turquoise-teal flank shadow
  t1: [0x29, 0xb5, 0xa8], // iridescent turquoise-teal flank
  c:  [0xf2, 0xf5, 0xc6], // tiny cream flank speckles
  b0: [0xb2, 0xd4, 0x79], // pale yellow-green belly shadow
  b1: [0xde, 0xf2, 0xa5], // pale yellow-green belly
  e:  [0xff, 0xc4, 0x24], // alert golden-amber eye
};

interface GreenLizardPose {
  bodyY: number;
  headBob: number;   // classic sunbathing lizard push-up / head-bob!
  spineSway: number; // sinuous lateral S-curve during lightning scurry
  tailSway: number;
  fl: number;
  fr: number;
  bl: number;
  br: number;
}

const GREEN_LIZARD_POSES: Record<GreenLizardPoseName, GreenLizardPose> = {
  // Classic sunbathing lizard head-bob!
  idle0: { bodyY: 0.0,    headBob: 0.0,   spineSway: 0.0,   tailSway: 0.0,   fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0   },
  idle1: { bodyY: 0.025,  headBob: 0.07,  spineSway: 0.0,   tailSway: 0.04,  fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0   },
  idle2: { bodyY: -0.012, headBob: -0.03, spineSway: 0.0,   tailSway: -0.04, fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0   },

  // Lightning-fast sinuous lizard scurry!
  dart0: { bodyY: 0.012,  headBob: 0.02,  spineSway: 0.07,  tailSway: -0.16, fl: 0.16,  fr: -0.14, bl: -0.16, br: 0.16  },
  dart1: { bodyY: 0.018,  headBob: 0.03,  spineSway: 0.04,  tailSway: -0.08, fl: 0.08,  fr: -0.05, bl: -0.07, br: 0.08  },
  dart2: { bodyY: 0.008,  headBob: 0.01,  spineSway: -0.04, tailSway: 0.08,  fl: -0.05, fr: 0.08,  bl: 0.08,  br: -0.07 },
  dart3: { bodyY: 0.012,  headBob: 0.02,  spineSway: -0.07, tailSway: 0.16,  fl: -0.14, fr: 0.16,  bl: 0.16,  br: -0.16 },
  dart4: { bodyY: 0.018,  headBob: 0.03,  spineSway: -0.04, tailSway: 0.08,  fl: -0.05, fr: 0.08,  bl: 0.08,  br: -0.07 },
  dart5: { bodyY: 0.008,  headBob: 0.01,  spineSway: 0.04,  tailSway: -0.08, fl: 0.08,  fr: -0.05, bl: -0.07, br: 0.08  },
};

const greenLizardCache = new Map<GreenLizardPoseName, Boar27Pack>();
 function buildGreenLizardPosePack(pose: GreenLizardPoseName): Boar27Pack {
  let pack = greenLizardCache.get(pose);
  if (!pack) {
    const P = GREEN_LIZARD_POSES[pose];
    const by = P.bodyY;
    const hb = P.headBob;
    const sw = P.spineSway;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // --------------------------------------------------------------------
      // 1. SLENDER LITHE TORSO & POINTED TRIANGULAR LIZARD HEAD
      // --------------------------------------------------------------------
      const torso = sdCapsule(x, y, z, -sw * 0.5, -0.05 + by, -0.18, sw * 0.5, -0.02 + by + hb * 0.4, 0.22, 0.105, 0.095);
      const neck  = sdCapsule(x, y, z, sw * 0.5, -0.01 + by + hb * 0.4, 0.22, sw * 0.3, 0.04 + by + hb, 0.36, 0.076, 0.068);
      const head  = sdEllipsoid(x, y, z, sw * 0.3, 0.05 + by + hb, 0.42, 0.088, 0.064, 0.105);
      const snout = sdCapsule(x, y, z, sw * 0.3, 0.04 + by + hb, 0.46, sw * 0.25, 0.02 + by + hb, 0.62, 0.058, 0.022);

      // --------------------------------------------------------------------
      // 2. EXTRA-LONG GRACEFUL WHIP-LIKE TAPERING TAIL
      // --------------------------------------------------------------------
      const t1X = P.tailSway * 0.45;
      const t2X = P.tailSway;
      const tail1 = sdCapsule(x, y, z, -sw * 0.5, -0.05 + by, -0.18, t1X, -0.06 + by, -0.58, 0.078, 0.044);
      const tail2 = sdCapsule(x, y, z, t1X, -0.06 + by, -0.58, t2X, -0.07 + by, -0.98, 0.042, 0.014);
      const tail = smin(tail1, tail2, 0.02);

      // --------------------------------------------------------------------
      // 3. NIMBLE SPLAYED CLAWED LEGS
      // --------------------------------------------------------------------
      const fl = sdCapsule(x, y, z, -0.08 + sw * 0.4, -0.04 + by + hb * 0.3, 0.18, -0.22, -0.19, 0.22 + P.fl, 0.036, 0.024);
      const fr = sdCapsule(x, y, z,  0.08 + sw * 0.4, -0.04 + by + hb * 0.3, 0.18,  0.22, -0.19, 0.22 + P.fr, 0.036, 0.024);
      const bl = sdCapsule(x, y, z, -0.09 - sw * 0.4, -0.06 + by, -0.16, -0.24, -0.19, -0.18 + P.bl, 0.042, 0.026);
      const br = sdCapsule(x, y, z,  0.09 - sw * 0.4, -0.06 + by, -0.16,  0.24, -0.19, -0.18 + P.br, 0.042, 0.026);

      let body = smin(torso, neck, 0.035);
      body = smin(body, head, 0.03);
      body = smin(body, snout, 0.02);
      body = smin(body, tail, 0.03);
      body = smin(body, Math.min(Math.min(fl, fr), Math.min(bl, br)), 0.02);

      // Alert golden-amber eyes with white glint
      const eyeL = sdEllipsoid(x, y, z, sw * 0.3 - 0.068, 0.078 + by + hb, 0.45, 0.026, 0.026, 0.024);
      const eyeR = sdEllipsoid(x, y, z, sw * 0.3 + 0.068, 0.078 + by + hb, 0.45, 0.026, 0.026, 0.024);
      const glintL = sdEllipsoid(x, y, z, sw * 0.3 - 0.076, 0.090 + by + hb, 0.466, 0.011, 0.011, 0.011);
      const glintR = sdEllipsoid(x, y, z, sw * 0.3 + 0.076, 0.090 + by + hb, 0.466, 0.011, 0.011, 0.011);

      let d = body;
      let mat = 'scales';
      if (Math.min(eyeL, eyeR) < d) { d = Math.min(eyeL, eyeR); mat = 'eye'; }
      if (Math.min(glintL, glintR) < d) { d = Math.min(glintL, glintR); mat = 'glint'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'glint') return 'w';
      if (mat === 'eye') return 'e';

      // Pale yellow-green belly
      if (y < -0.10 + by && Math.abs(x) < 0.10 && z > -0.22 && z < 0.36) {
        return shade > 0.45 ? 'b1' : 'b0';
      }

      // Iridescent turquoise-teal flanks with tiny cream speckles!
      const onFlank = Math.abs(x) > 0.075 && y < 0.02 + by && z > -0.26 && z < 0.24;
      if (onFlank) {
        const speckle = Math.sin(z * 48 + y * 36) > 0.72;
        if (speckle) return 'c';
        return shade > 0.42 ? 't1' : 't0';
      }

      // Vibrant neon-emerald & bright lime-green dorsal scales
      if (shade > 0.80) return 'g4';
      if (shade > 0.58) return 'g3';
      if (shade > 0.36) return 'g2';
      if (shade > 0.18) return 'g1';
      return 'g0';
    };

    pack = build27Pack(GREEN_LIZARD_PW, GREEN_LIZARD_PH, 1.06, 0.56, GREEN_LIZARD_PAL, evalFn, shadeFn);
    greenLizardCache.set(pose, pack);
  }
  return pack;
}

export function getGreenLizardPosePack(...args: Parameters<typeof buildGreenLizardPosePack>): ReturnType<typeof buildGreenLizardPosePack> {
  return registerAnimalSpritePack(buildGreenLizardPosePack(...args), { module: './GreenLizard.ts', factory: 'getGreenLizardPosePack', args }, buildGreenLizardPosePack);
}

// ============================================================================
// INSTÂNCIA NA ARENA (GreenLizard)
// ============================================================================
function pickCycle<T>(frames: readonly T[], idx: number): T {
  return sampleAnimalCycle(frames, idx);
}

const LIZARD_IDLE: readonly GreenLizardPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const LIZARD_DART: readonly GreenLizardPoseName[] = ['dart0', 'dart1', 'dart2', 'dart3', 'dart4', 'dart5'];

export class GreenLizard extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private home = new THREE.Vector3();
  private state: 'idle' | 'move' | 'react' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.0, 2.4);
  private targetYaw = rand(0, Math.PI * 2);
  private gaitPhase = rand(0, Math.PI * 2);
  private readonly centerY = 0.12;

  constructor(ctx: GameContext, startPos: THREE.Vector3) {
    super(
      ctx,
      getGreenLizardPosePack('idle0').getView(2, 0)!,
      GREEN_LIZARD_PW,
      GREEN_LIZARD_PH,
      GREEN_LIZARD_W,
      GREEN_LIZARD_H,
      'GreenLizardBillboard',
    );
    this.hp = 15;
    this.maxHp = 15;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.18;
    this.motor.height = 0.24;
    this.motor.teleport(startPos);
    this.home.copy(startPos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.24, tag: 'body', enabled: true });
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
    this.vel.x += hit.dir.x * 4.5;
    this.vel.z += hit.dir.z * 4.5;
    this.vel.y = 3.2;
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
          this.stateDur = 1.7;
        }

        if (this.state === 'idle') {
          if (this.stateT >= this.stateDur) {
            this.state = 'move';
            this.stateT = 0;
            this.stateDur = rand(0.9, 1.8);
            const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
            this.targetYaw = toHome > 7.5
              ? Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.5, 0.5)
              : this.facing + rand(-2.0, 2.0);
          }
        } else if (this.state === 'move') {
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 10);
          speed = 3.2;
          if (this.stateT >= this.stateDur && this.motor.grounded) {
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.4, 2.8);
          }
        } else if (this.state === 'react') {
          if (target && target.alive) {
            this.targetYaw = Math.atan2(this.position.x - target.position.x, this.position.z - target.position.z);
            this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 12);
            speed = 5.4;
          }
          if (this.stateT >= this.stateDur && dist > 5.2 && this.motor.grounded) {
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.2, 2.4);
          }
        }

        this.vel.x = damp(this.vel.x, Math.sin(this.facing) * speed, 11, dt);
        this.vel.z = damp(this.vel.z, Math.cos(this.facing) * speed, 11, dt);
        this.vel.y -= 20 * dt;
        this.motor.update(dt);

        const horiz = Math.hypot(this.vel.x, this.vel.z);
        if (horiz > 0.25 && this.motor.grounded) {
          this.gaitPhase += dt * 9.5 * (0.65 + horiz * 0.22);
        }
      }
      this.syncHurtbox();
    }

    const pose: GreenLizardPoseName = !this.alive
      ? 'idle0'
      : this.state === 'move' || this.state === 'react'
        ? pickCycle(LIZARD_DART, (this.gaitPhase / Math.PI) * 3.0)
        : pickCycle(LIZARD_IDLE, this.stateT * 2.8);
    const deathSink = this.alive ? 0 : Math.min(0.18, this.deadT * 0.4);
    this.renderBillboard(getGreenLizardPosePack(pose), this.position.y + this.centerY - deathSink, camera, drawingBufferSize);
  }
}
