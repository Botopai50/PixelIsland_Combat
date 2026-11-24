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
// VIÚVA-NEGRA (Black Widow Spider) — Flagship 26×20 @ 56 PPU
// ============================================================================
const ANIMAL_PPU = 56;

export type BlackWidowPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'scuttle0' | 'scuttle1' | 'scuttle2' | 'scuttle3' | 'scuttle4' | 'scuttle5'
  | 'threat0' | 'threat1' | 'threat2';

export const BLACK_WIDOW_PW = 26;
export const BLACK_WIDOW_PH = 20;
export const BLACK_WIDOW_W = BLACK_WIDOW_PW / ANIMAL_PPU;
export const BLACK_WIDOW_H = BLACK_WIDOW_PH / ANIMAL_PPU;

const BLACK_WIDOW_PAL: Record<string, [number, number, number]> = {
  k:  [0x07, 0x05, 0x0a], // 1px dark outline / deepest shadow
  b0: [0x0d, 0x0b, 0x14], // jet-black abdomen shadow
  b1: [0x1a, 0x16, 0x26], // glossy jet-black base
  b2: [0x2b, 0x27, 0x42], // cool deep-indigo sheen
  b3: [0x4a, 0x4a, 0x78], // glossy blue-indigo gleam
  b4: [0xa6, 0xb0, 0xe0], // bright polished white-indigo specular
  w:  [0xf6, 0xf8, 0xff], // crisp white specular glint & eye gleam
  r0: [0x8a, 0x0e, 0x1c], // deep crimson hourglass shadow
  r1: [0xd1, 0x1a, 0x2a], // vibrant scarlet-crimson hourglass
  r2: [0xff, 0x4a, 0x4a], // bright scarlet hourglass highlight
};

interface BlackWidowPose {
  bodyY: number;
  abdomenBob: number;  // slight abdomen pulse
  legPhase: number;    // 0..2π scuttle phase for alternating leg tetrapods
  scuttle: number;     // 0 = relaxed idle stance, 1 = active scuttle stride
  threat: number;      // 0..1 front legs raised defensively
}

const BLACK_WIDOW_POSES: Record<BlackWidowPoseName, BlackWidowPose> = {
  idle0:    { bodyY: 0.0,    abdomenBob: 0.0,   legPhase: 0.0,  scuttle: 0.0, threat: 0.0 },
  idle1:    { bodyY: 0.012,  abdomenBob: 0.02,  legPhase: 0.4,  scuttle: 0.0, threat: 0.0 },
  idle2:    { bodyY: -0.008, abdomenBob: -0.01, legPhase: -0.4, scuttle: 0.0, threat: 0.0 },

  scuttle0: { bodyY: 0.006,  abdomenBob: 0.0,   legPhase: 0.0,  scuttle: 1.0, threat: 0.0 },
  scuttle1: { bodyY: 0.016,  abdomenBob: 0.015, legPhase: 1.05, scuttle: 1.0, threat: 0.0 },
  scuttle2: { bodyY: 0.006,  abdomenBob: 0.0,   legPhase: 2.09, scuttle: 1.0, threat: 0.0 },
  scuttle3: { bodyY: 0.006,  abdomenBob: 0.0,   legPhase: 3.14, scuttle: 1.0, threat: 0.0 },
  scuttle4: { bodyY: 0.016,  abdomenBob: 0.015, legPhase: 4.19, scuttle: 1.0, threat: 0.0 },
  scuttle5: { bodyY: 0.006,  abdomenBob: 0.0,   legPhase: 5.24, scuttle: 1.0, threat: 0.0 },

  // Front pair of legs raised defensively!
  threat0:  { bodyY: 0.016,  abdomenBob: 0.01,  legPhase: 0.0,  scuttle: 0.0, threat: 0.55 },
  threat1:  { bodyY: 0.030,  abdomenBob: 0.02,  legPhase: 0.0,  scuttle: 0.0, threat: 1.00 },
  threat2:  { bodyY: 0.024,  abdomenBob: 0.015, legPhase: 0.0,  scuttle: 0.0, threat: 0.80 },
};

const blackWidowCache = new Map<BlackWidowPoseName, Boar27Pack>();
 function buildBlackWidowPosePack(pose: BlackWidowPoseName): Boar27Pack {
  let pack = blackWidowCache.get(pose);
  if (!pack) {
    const P = BLACK_WIDOW_POSES[pose];
    const by = P.bodyY;
    const ab = P.abdomenBob;
    const th = P.threat;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // --------------------------------------------------------------------
      // 1. GLEAMING SPHERICAL JET-BLACK ABDOMEN & COMPACT CEPHALOTHORAX
      // --------------------------------------------------------------------
      const abdomen = sdEllipsoid(x, y, z, 0, 0.06 + by + ab, -0.20, 0.215, 0.215, 0.235);
      const waist = sdEllipsoid(x, y, z, 0, 0.03 + by, 0.02, 0.07, 0.065, 0.075);
      const cephalo = sdEllipsoid(x, y, z, 0, 0.03 + by, 0.17, 0.115, 0.095, 0.125);
      // Tiny chelicerae (fangs) at the front of the face
      const cheL = sdCapsule(x, y, z, -0.035, 0.00 + by, 0.27, -0.032, -0.07 + by, 0.31, 0.022, 0.012);
      const cheR = sdCapsule(x, y, z,  0.035, 0.00 + by, 0.27,  0.032, -0.07 + by, 0.31, 0.022, 0.012);

      let body = smin(abdomen, waist, 0.04);
      body = smin(body, cephalo, 0.035);
      body = smin(body, Math.min(cheL, cheR), 0.015);

      // --------------------------------------------------------------------
      // 2. EIGHT SLENDER, SHARPLY ARCHED, JOINTED SPIDER LEGS (4 per side)
      // --------------------------------------------------------------------
      let legs = 99;
      const baseZ = [0.21, 0.15, 0.08, 0.02];
      for (let i = 0; i < 4; i++) {
        for (let side = -1; side <= 1; side += 2) {
          // Alternating tetrapod gait phase offsets
          const gaitOff = (i % 2 === 0 ? 0 : Math.PI) + (side > 0 ? Math.PI : 0);
          const stride = P.scuttle > 0.5 ? Math.sin(P.legPhase + gaitOff) : 0;
          const lift = P.scuttle > 0.5 ? Math.max(0, Math.cos(P.legPhase + gaitOff)) * 0.07 : 0;

          // Fan out legs: front legs reach forward, rear legs sweep back
          const fan = (i - 1.5) * -0.17;
          // Front pair raised high defensively in threat poses!
          const raise = i === 0 ? th : 0;

          const bx = side * 0.075;
          const by0 = 0.04 + by;
          const bz = baseZ[i];

          // Knee arches sharply high above the body
          const kx = side * (0.30 + (i === 0 ? th * 0.06 : 0));
          const ky = 0.30 + by + raise * 0.22 + lift * 0.4;
          const kz = bz + fan * 0.9 + stride * 0.04 + (i === 0 ? th * 0.14 : 0);

          // Delicate tip angles down to the ground
          const tx = side * (0.52 + (i === 0 ? th * 0.10 : 0));
          const ty = (-0.19 + lift) + raise * 0.62;
          const tz = bz + fan * 1.8 + stride * 0.10 + (i === 0 ? th * 0.28 : 0);

          const femur = sdCapsule(x, y, z, bx, by0, bz, kx, ky, kz, 0.030, 0.022);
          const tibia = sdCapsule(x, y, z, kx, ky, kz, tx, ty, tz, 0.022, 0.012);
          legs = Math.min(legs, Math.min(femur, tibia));
        }
      }

      // Tiny gleaming eyes
      const eyeL = sdEllipsoid(x, y, z, -0.040, 0.075 + by, 0.265, 0.017, 0.017, 0.016);
      const eyeR = sdEllipsoid(x, y, z,  0.040, 0.075 + by, 0.265, 0.017, 0.017, 0.016);

      // Scarlet-crimson hourglass marking on the underside facing forward-down (visible)
      let d = smin(body, legs, 0.012);
      let mat = 'chitin';
      if (Math.min(eyeL, eyeR) < d) { d = Math.min(eyeL, eyeR); mat = 'eye'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'eye') return 'w';

      // Vibrant scarlet-crimson hourglass marking prominently on the abdomen!
      // Two triangles meeting at a narrow waist, centred on the abdomen face (+z side & top-front)
      const aY = 0.06 + by + ab;
      const onAbdomen = z < -0.04 && z > -0.46;
      if (onAbdomen && Math.abs(x) < 0.16) {
        const dy = y - aY;                         // vertical offset from abdomen centre
        const dz = z + 0.20;                       // along abdomen axis
        // Hourglass runs along the abdomen's belly-front surface (-y / +z facing camera)
        const along = dy * 0.9 + dz * 0.35;        // blended axis so it reads from the side view
        const halfW = 0.026 + Math.abs(along) * 0.50;
        if (Math.abs(along) < 0.15 && Math.abs(x) < halfW && y < aY + 0.06) {
          return shade > 0.62 ? 'r2' : shade > 0.34 ? 'r1' : 'r0';
        }
      }

      // Polished jet-black chitin with cool indigo/white specular gleam
      const onSpherical = z < -0.03;
      if (onSpherical) {
        // Bright polished specular highlight on upper-left-front of the abdomen sphere
        const hx = x + 0.07;
        const hy = y - (0.17 + by + ab);
        const hz = z + 0.15;
        if (Math.hypot(hx, hy, hz) < 0.058) return 'w';
        if (Math.hypot(hx, hy, hz) < 0.115) return shade > 0.40 ? 'b4' : 'b3';
      }
      if (shade > 0.82) return 'b4';
      if (shade > 0.62) return 'b3';
      if (shade > 0.40) return 'b2';
      if (shade > 0.20) return 'b1';
      return 'b0';
    };

    pack = build27Pack(BLACK_WIDOW_PW, BLACK_WIDOW_PH, 0.92, 0.72, BLACK_WIDOW_PAL, evalFn, shadeFn);
    blackWidowCache.set(pose, pack);
  }
  return pack;
}

export function getBlackWidowPosePack(...args: Parameters<typeof buildBlackWidowPosePack>): ReturnType<typeof buildBlackWidowPosePack> {
  return registerAnimalSpritePack(buildBlackWidowPosePack(...args), { module: './BlackWidow.ts', factory: 'getBlackWidowPosePack', args }, buildBlackWidowPosePack);
}

// ============================================================================
// INSTÂNCIA NA ARENA (BlackWidow)
// ============================================================================
function pickCycle<T>(frames: readonly T[], idx: number): T {
  return sampleAnimalCycle(frames, idx);
}

const WIDOW_IDLE: readonly BlackWidowPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const WIDOW_SCUTTLE: readonly BlackWidowPoseName[] = ['scuttle0', 'scuttle1', 'scuttle2', 'scuttle3', 'scuttle4', 'scuttle5'];
const WIDOW_THREAT: readonly BlackWidowPoseName[] = ['threat0', 'threat1', 'threat2', 'threat1'];

export class BlackWidow extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private home = new THREE.Vector3();
  private state: 'idle' | 'move' | 'react' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.2, 2.6);
  private targetYaw = rand(0, Math.PI * 2);
  private gaitPhase = rand(0, Math.PI * 2);
  private readonly centerY = 0.11;

  constructor(ctx: GameContext, startPos: THREE.Vector3) {
    super(
      ctx,
      getBlackWidowPosePack('idle0').getView(2, 0)!,
      BLACK_WIDOW_PW,
      BLACK_WIDOW_PH,
      BLACK_WIDOW_W,
      BLACK_WIDOW_H,
      'BlackWidowBillboard',
    );
    this.hp = 12;
    this.maxHp = 12;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.17;
    this.motor.height = 0.22;
    this.motor.teleport(startPos);
    this.home.copy(startPos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.22, tag: 'body', enabled: true });
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
    this.vel.x += hit.dir.x * 3.8;
    this.vel.z += hit.dir.z * 3.8;
    this.vel.y = 2.8;
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
        if (dist < 2.6 && this.state !== 'react') {
          this.state = 'react';
          this.stateT = 0;
          this.stateDur = 1.8;
        }

        if (this.state === 'idle') {
          if (this.stateT >= this.stateDur) {
            this.state = 'move';
            this.stateT = 0;
            this.stateDur = rand(1.2, 2.4);
            const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
            this.targetYaw = toHome > 6.5
              ? Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.5, 0.5)
              : this.facing + rand(-1.8, 1.8);
          }
        } else if (this.state === 'move') {
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 8);
          speed = 1.7;
          if (this.stateT >= this.stateDur && this.motor.grounded) {
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.2, 2.6);
          }
        } else if (this.state === 'react') {
          // Rear up front legs defensively and hold ground facing the intruder
          if (target && target.alive) {
            this.targetYaw = Math.atan2(target.position.x - this.position.x, target.position.z - this.position.z);
            this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 9);
          }
          speed = 0;
          if (this.stateT >= this.stateDur && dist > 3.4 && this.motor.grounded) {
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.2, 2.2);
          }
        }

        this.vel.x = damp(this.vel.x, Math.sin(this.facing) * speed, 10, dt);
        this.vel.z = damp(this.vel.z, Math.cos(this.facing) * speed, 10, dt);
        this.vel.y -= 20 * dt;
        this.motor.update(dt);

        const horiz = Math.hypot(this.vel.x, this.vel.z);
        if (horiz > 0.2 && this.motor.grounded) {
          this.gaitPhase += dt * 9.0 * (0.65 + horiz * 0.2);
        }
      }
      this.syncHurtbox();
    }

    const pose: BlackWidowPoseName = !this.alive
      ? 'idle0'
      : this.state === 'react'
        ? pickCycle(WIDOW_THREAT, this.stateT * 3.5)
        : this.state === 'move'
          ? pickCycle(WIDOW_SCUTTLE, (this.gaitPhase / Math.PI) * 3.0)
          : pickCycle(WIDOW_IDLE, this.stateT * 2.0);
    const deathSink = this.alive ? 0 : Math.min(0.10, this.deadT * 0.3);
    this.renderBillboard(getBlackWidowPosePack(pose), this.position.y + this.centerY - deathSink, camera, drawingBufferSize);
  }
}
