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
// BESOURO (Flagship Iridescent Rhinoceros Beetle) — 22×18 @ 56 PPU
// ============================================================================
export type BeetlePoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'walk0' | 'walk1' | 'walk2' | 'walk3' | 'walk4' | 'walk5';

export const BEETLE_PW = 22;
export const BEETLE_PH = 18;
export const BEETLE_W = BEETLE_PW / ANIMAL_PPU;
export const BEETLE_H = BEETLE_PH / ANIMAL_PPU;

const BEETLE_PAL: Record<string, [number, number, number]> = {
  k:  [0x10, 0x12, 0x1a], // crisp 1px outline / legs / deep groove
  b0: [0x14, 0x26, 0x48], // deep sapphire-indigo shadow
  t0: [0x12, 0x4f, 0x5c], // rich teal-blue iridescence
  e1: [0x1b, 0x8a, 0x6b], // vibrant emerald carapace
  e2: [0x3d, 0xc9, 0x82], // bright sunlit emerald-jade
  e3: [0x8f, 0xf5, 0xb8], // glossy specular shell highlight
  h0: [0x24, 0x2c, 0x3b], // dark metallic chitin horn / thorax base
  h1: [0x4a, 0x5b, 0x78], // metallic blue-slate horn rim
  g:  [0xe8, 0xb8, 0x42], // tiny golden-amber eye glint
};

interface BeetlePose {
  bodyY: number;
  hornLift: number;
  legWave: number;
}

const BEETLE_POSES: Record<BeetlePoseName, BeetlePose> = {
  idle0: { bodyY: 0.000, hornLift: 0.00, legWave: 0.00 },
  idle1: { bodyY: 0.014, hornLift: 0.04, legWave: 0.25 },
  idle2: { bodyY: -0.008, hornLift: -0.02, legWave: -0.25 },

  walk0: { bodyY: 0.012, hornLift: 0.02, legWave: 0.00 },
  walk1: { bodyY: 0.022, hornLift: 0.03, legWave: 1.05 },
  walk2: { bodyY: 0.008, hornLift: 0.01, legWave: 2.09 },
  walk3: { bodyY: 0.014, hornLift: 0.02, legWave: 3.14 },
  walk4: { bodyY: 0.022, hornLift: 0.03, legWave: 4.19 },
  walk5: { bodyY: 0.008, hornLift: 0.01, legWave: 5.24 },
};

const beetleCache = new Map<BeetlePoseName, Boar27Pack>();
 function buildBeetlePosePack(pose: BeetlePoseName): Boar27Pack {
  let pack = beetleCache.get(pose);
  if (!pack) {
    const P = BEETLE_POSES[pose];
    const by = P.bodyY;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // 1. Glossy armored elytra (abdomen dome) + sculpted pronotum (thorax)
      const elytra = sdEllipsoid(x, y, z, 0, 0.02 + by, -0.14, 0.30, 0.21, 0.35);
      const belly = sdEllipsoid(x, y, z, 0, -0.08 + by, -0.04, 0.25, 0.11, 0.36);
      const thorax = sdEllipsoid(x, y, z, 0, 0.01 + by, 0.17, 0.24, 0.17, 0.175);
      const head = sdEllipsoid(x, y, z, 0, -0.04 + by, 0.32, 0.145, 0.105, 0.11);

      let shell = smin(elytra, belly, 0.04);
      shell = smin(shell, thorax, 0.03);
      shell = smin(shell, head, 0.025);

      // 2. Curved rhinoceros horn + twin small stag mandibles
      const hornBase = sdCapsule(
        x, y, z,
        0, -0.02 + by, 0.35,
        0, 0.04 + by + P.hornLift * 0.5, 0.52,
        0.046, 0.032
      );
      const hornTip = sdCapsule(
        x, y, z,
        0, 0.04 + by + P.hornLift * 0.5, 0.52,
        0, 0.20 + by + P.hornLift, 0.57,
        0.030, 0.014
      );
      const mandL = sdCapsule(x, y, z, -0.07, -0.07 + by, 0.38, -0.11, -0.06 + by, 0.49, 0.022, 0.011);
      const mandR = sdCapsule(x, y, z,  0.07, -0.07 + by, 0.38,  0.11, -0.06 + by, 0.49, 0.022, 0.011);
      const horn = Math.min(smin(hornBase, hornTip, 0.018), Math.min(mandL, mandR));

      // 3. Six jointed walking legs (3 per side, alternating tripod gait)
      let legs = 99;
      for (let side = -1; side <= 1; side += 2) {
        for (let i = 0; i < 3; i++) {
          const baseZ = -0.22 + i * 0.19;
          const zBias = (i - 1) * 0.09;
          const phase = P.legWave + i * 2.094 + (side < 0 ? 0 : Math.PI);
          const lift = Math.max(0, Math.sin(phase)) * 0.095;
          const swing = Math.cos(phase) * 0.075;

          const hipX = side * 0.22;
          const hipY = -0.09 + by;
          const kneeX = side * 0.44;
          const kneeY = -0.01 + by + lift;
          const kneeZ = baseZ + zBias * 0.5 + swing * 0.45;
          const footX = side * 0.58;
          const footY = -0.27 + lift * 1.1;
          const footZ = baseZ + zBias + swing;

          const femur = sdCapsule(x, y, z, hipX, hipY, baseZ, kneeX, kneeY, kneeZ, 0.038, 0.028);
          const tibia = sdCapsule(x, y, z, kneeX, kneeY, kneeZ, footX, footY, footZ, 0.026, 0.014);
          legs = Math.min(legs, smin(femur, tibia, 0.014));
        }
      }

      // Tiny glossy amber eyes
      const eyeL = sdEllipsoid(x, y, z, -0.125, -0.015 + by, 0.355, 0.032, 0.032, 0.032);
      const eyeR = sdEllipsoid(x, y, z,  0.125, -0.015 + by, 0.355, 0.032, 0.032, 0.032);
      const eyes = Math.min(eyeL, eyeR);

      let body = smin(shell, horn, 0.018);
      body = smin(body, legs, 0.018);

      let d = body;
      let mat = 'elytra';
      if (z > 0.06) mat = 'thorax';
      if (horn < shell + 0.005 && z > 0.36) mat = 'horn';
      if (legs < shell + 0.004 && Math.abs(x) > 0.28) mat = 'leg';
      if (eyes < d) { d = eyes; mat = 'eye'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'eye') return 'g';
      if (mat === 'leg') return shade > 0.58 ? 'h1' : 'k';
      if (mat === 'horn') return shade > 0.64 ? 'h1' : shade > 0.28 ? 'h0' : 'k';

      // Dark underside chitin
      if (y < -0.10 + by) return shade > 0.50 ? 'h0' : 'k';

      // Crisp elytral center suture & thorax/elytra collar seam
      const centerSeam = z < 0.06 && Math.abs(x) < 0.020 && y > 0.04 + by;
      const collarSeam = Math.abs(z - 0.055) < 0.020 && y > -0.02 + by;
      if (centerSeam || collarSeam) return 'b0';

      // Iridescent sapphire -> teal -> emerald -> bright mint specular highlight
      const s = mat === 'thorax' ? shade - 0.08 : shade;
      return s > 0.84 ? 'e3' : s > 0.62 ? 'e2' : s > 0.40 ? 'e1' : s > 0.22 ? 't0' : 'b0';
    };

    pack = build27Pack(BEETLE_PW, BEETLE_PH, 0.78, 0.60, BEETLE_PAL, evalFn, shadeFn);
    beetleCache.set(pose, pack);
  }
  return pack;
}

export function getBeetlePosePack(...args: Parameters<typeof buildBeetlePosePack>): ReturnType<typeof buildBeetlePosePack> {
  return registerAnimalSpritePack(buildBeetlePosePack(...args), { module: './Beetle.ts', factory: 'getBeetlePosePack', args }, buildBeetlePosePack);
}

const BEETLE_IDLE: readonly BeetlePoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const BEETLE_WALK: readonly BeetlePoseName[] = ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'];

/**
 * Iridescent Rhinoceros Beetle: scuttles across the grass around its home patch.
 */
export class Beetle extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private readonly home = new THREE.Vector3();
  private state: 'idle' | 'walk' | 'flee' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.0, 2.4);
  private gaitPhase = rand(0, Math.PI * 2);

  constructor(ctx: GameContext, pos: THREE.Vector3) {
    super(ctx, getBeetlePosePack('idle0').getView(2, 0)!, BEETLE_PW, BEETLE_PH, BEETLE_W, BEETLE_H, 'BeetleBillboard');
    this.hp = 15;
    this.maxHp = 15;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.18;
    this.motor.height = 0.22;
    this.motor.teleport(pos);
    this.home.copy(pos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.22, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.set(this.position.x, this.position.y + 0.11, this.position.z);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y + 0.04, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.18, this.position.z);
    this.hurtboxes[0].enabled = this.alive;
    this.stickRoot.position.set(this.position.x, this.position.y + 0.11, this.position.z);
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
    this.vel.y = 2.8;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.state = 'flee';
      this.stateT = 0;
      this.stateDur = 2.2;
      this.facing = Math.atan2(hit.dir.x, hit.dir.z);
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

        if (dist < 2.2 && this.state !== 'flee') {
          this.state = 'flee';
          this.stateT = 0;
          this.stateDur = 1.8;
        }

        if (this.state === 'idle') {
          if (this.stateT >= this.stateDur) {
            this.state = 'walk';
            this.stateT = 0;
            this.stateDur = rand(1.6, 3.2);
            const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
            if (toHome > 5.0) {
              this.facing = Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.4, 0.4);
            } else {
              this.facing += rand(-1.2, 1.2);
            }
          }
        } else if (this.state === 'walk') {
          vx = Math.sin(this.facing) * 1.15;
          vz = Math.cos(this.facing) * 1.15;
          if (this.stateT >= this.stateDur) {
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.0, 2.5);
          }
        } else if (this.state === 'flee') {
          if (target && target.alive) {
            const away = Math.atan2(this.position.x - target.position.x, this.position.z - target.position.z);
            this.facing += angleDiff(this.facing, away) * Math.min(1, dt * 8);
          }
          vx = Math.sin(this.facing) * 2.1;
          vz = Math.cos(this.facing) * 2.1;
          if (this.stateT >= this.stateDur && dist > 3.5) {
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
        if (horiz > 0.15 && this.motor.grounded) {
          this.gaitPhase += dt * 8.5 * (0.7 + horiz * 0.35);
        }
      }
      this.syncHurtbox();
    }

    let pose: BeetlePoseName;
    if (!this.alive) pose = 'idle0';
    else if (this.state === 'walk' || this.state === 'flee') pose = pickCycle(BEETLE_WALK, (this.gaitPhase / Math.PI) * 3.0);
    else pose = pickCycle(BEETLE_IDLE, this.stateT * 2.0);

    const deathSink = this.alive ? 0 : Math.min(0.10, this.deadT * 0.3);
    this.renderBillboard(getBeetlePosePack(pose), this.position.y + 0.11 - deathSink, camera, drawingBufferSize);
  }
}
