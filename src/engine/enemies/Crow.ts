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
// CORVO (Flagship Crow) — 30×26
// ============================================================================
export type CrowPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'hop0' | 'hop1' | 'hop2' | 'hop3'
  | 'peck0' | 'peck1' | 'peck2'
  | 'flap0' | 'flap1' | 'flap2' | 'flap3' | 'flap4' | 'flap5';

export const CROW_PW = 30;
export const CROW_PH = 26;
export const CROW_W = CROW_PW / ANIMAL_PPU;
export const CROW_H = CROW_PH / ANIMAL_PPU;

/**
 * Glossy raven-black plumage with iridescent blue-indigo sheen highlights,
 * sharp dark-slate beak & legs, and bright dark eyes with white glint.
 */
const CROW_PAL: Record<string, [number, number, number]> = {
  k:  [0x0a, 0x0b, 0x10], // crisp 1px dark outline / dark eye / claws
  c0: [0x14, 0x17, 0x22], // deep raven-black shadow
  c1: [0x22, 0x27, 0x38], // rich charcoal-indigo plumage
  c2: [0x35, 0x40, 0x5c], // iridescent slate-indigo midtone
  c3: [0x4e, 0x5f, 0x86], // glossy blue-violet sheen highlight
  c4: [0x6e, 0x84, 0xb0], // sunlit blue-silver rim sheen
  b0: [0x20, 0x24, 0x2d], // dark-slate beak/leg shadow
  b1: [0x3c, 0x44, 0x52], // sharp dark-slate beak midtone
  b2: [0x5e, 0x68, 0x7a], // beak ridge highlight
  W:  [0xf4, 0xf7, 0xff], // crisp white eye glint
};

interface CrowPose {
  bodyY: number;
  bodyPitch: number;  // positive = upright ground stance, 0 = level flight
  headY: number;
  headZ: number;
  headPitch: number;  // positive = dipping down to peck
  wingSpread: number; // 0 = folded neatly on flanks, 1 = full flight wingspan
  wingMidY: number;
  wingTipY: number;
  tailLift: number;
  tailSpread: number;
  legTuck: number;    // 0 = standing on ground, 1 = tucked in flight
  legBend: number;    // crouch/hop bend
}

const CROW_POSES: Record<CrowPoseName, CrowPose> = {
  idle0: {
    bodyY: 0.00, bodyPitch: 0.25, headY: 0.00, headZ: 0.00, headPitch: 0.00,
    wingSpread: 0.0, wingMidY: 0.0, wingTipY: 0.0, tailLift: -0.05, tailSpread: 0.12, legTuck: 0.0, legBend: 0.0,
  },
  idle1: {
    bodyY: 0.02, bodyPitch: 0.28, headY: 0.03, headZ: 0.01, headPitch: -0.06,
    wingSpread: 0.0, wingMidY: 0.0, wingTipY: 0.0, tailLift: -0.02, tailSpread: 0.13, legTuck: 0.0, legBend: 0.0,
  },
  idle2: {
    bodyY: -0.01, bodyPitch: 0.22, headY: -0.01, headZ: 0.02, headPitch: 0.08,
    wingSpread: 0.0, wingMidY: 0.0, wingTipY: 0.0, tailLift: -0.06, tailSpread: 0.11, legTuck: 0.0, legBend: 0.04,
  },

  hop0: {
    bodyY: -0.07, bodyPitch: 0.16, headY: -0.04, headZ: 0.04, headPitch: 0.10,
    wingSpread: 0.18, wingMidY: 0.06, wingTipY: 0.08, tailLift: 0.04, tailSpread: 0.16, legTuck: 0.0, legBend: 0.35,
  },
  hop1: {
    bodyY: 0.10, bodyPitch: 0.22, headY: 0.04, headZ: 0.03, headPitch: -0.04,
    wingSpread: 0.45, wingMidY: 0.16, wingTipY: 0.24, tailLift: -0.04, tailSpread: 0.18, legTuck: 0.45, legBend: 0.0,
  },
  hop2: {
    bodyY: 0.14, bodyPitch: 0.18, headY: 0.03, headZ: 0.04, headPitch: 0.02,
    wingSpread: 0.35, wingMidY: 0.08, wingTipY: 0.10, tailLift: 0.00, tailSpread: 0.17, legTuck: 0.35, legBend: 0.0,
  },
  hop3: {
    bodyY: -0.04, bodyPitch: 0.24, headY: -0.02, headZ: 0.02, headPitch: 0.06,
    wingSpread: 0.12, wingMidY: 0.02, wingTipY: 0.02, tailLift: 0.02, tailSpread: 0.14, legTuck: 0.0, legBend: 0.22,
  },

  peck0: {
    bodyY: -0.04, bodyPitch: 0.06, headY: -0.10, headZ: 0.08, headPitch: 0.48,
    wingSpread: 0.0, wingMidY: 0.0, wingTipY: 0.0, tailLift: 0.10, tailSpread: 0.13, legTuck: 0.0, legBend: 0.15,
  },
  peck1: {
    bodyY: -0.08, bodyPitch: -0.06, headY: -0.22, headZ: 0.14, headPitch: 0.92,
    wingSpread: 0.0, wingMidY: 0.0, wingTipY: 0.0, tailLift: 0.18, tailSpread: 0.15, legTuck: 0.0, legBend: 0.22,
  },
  peck2: {
    bodyY: -0.03, bodyPitch: 0.12, headY: -0.06, headZ: 0.06, headPitch: 0.32,
    wingSpread: 0.0, wingMidY: 0.0, wingTipY: 0.0, tailLift: 0.06, tailSpread: 0.12, legTuck: 0.0, legBend: 0.10,
  },

  flap0: {
    bodyY: -0.03, bodyPitch: 0.02, headY: -0.04, headZ: 0.05, headPitch: 0.0,
    wingSpread: 0.90, wingMidY: 0.28, wingTipY: 0.48, tailLift: 0.02, tailSpread: 0.22, legTuck: 1.0, legBend: 0.0,
  },
  flap1: {
    bodyY: -0.01, bodyPitch: 0.02, headY: -0.04, headZ: 0.05, headPitch: 0.0,
    wingSpread: 1.00, wingMidY: 0.16, wingTipY: 0.26, tailLift: 0.01, tailSpread: 0.24, legTuck: 1.0, legBend: 0.0,
  },
  flap2: {
    bodyY: 0.03, bodyPitch: 0.00, headY: -0.05, headZ: 0.06, headPitch: 0.0,
    wingSpread: 1.00, wingMidY: -0.06, wingTipY: -0.20, tailLift: -0.01, tailSpread: 0.21, legTuck: 1.0, legBend: 0.0,
  },
  flap3: {
    bodyY: 0.05, bodyPitch: -0.02, headY: -0.05, headZ: 0.06, headPitch: 0.0,
    wingSpread: 0.88, wingMidY: -0.22, wingTipY: -0.42, tailLift: -0.02, tailSpread: 0.20, legTuck: 1.0, legBend: 0.0,
  },
  flap4: {
    bodyY: 0.02, bodyPitch: 0.00, headY: -0.04, headZ: 0.05, headPitch: 0.0,
    wingSpread: 0.94, wingMidY: -0.08, wingTipY: -0.15, tailLift: 0.00, tailSpread: 0.22, legTuck: 1.0, legBend: 0.0,
  },
  flap5: {
    bodyY: -0.02, bodyPitch: 0.02, headY: -0.04, headZ: 0.05, headPitch: 0.0,
    wingSpread: 0.92, wingMidY: 0.14, wingTipY: 0.30, tailLift: 0.02, tailSpread: 0.23, legTuck: 1.0, legBend: 0.0,
  },
};

const CROW_IDLE: readonly CrowPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const CROW_HOP: readonly CrowPoseName[] = ['hop0', 'hop1', 'hop2', 'hop3'];
const CROW_PECK: readonly CrowPoseName[] = ['peck0', 'peck1', 'peck2'];
const CROW_FLAP: readonly CrowPoseName[] = ['flap0', 'flap1', 'flap2', 'flap3', 'flap4', 'flap5'];

const crowCache = new Map<CrowPoseName, Boar27Pack>();

 function buildCrowPosePack(pose: CrowPoseName): Boar27Pack {
  let pack = crowCache.get(pose);
  if (!pack) {
    const P = CROW_POSES[pose];
    const by = P.bodyY;
    const hy = 0.22 + by + P.bodyPitch * 0.22 + P.headY;
    const hz = 0.26 + P.headZ;
    const beakDip = P.headPitch * 0.18;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // 1. Sleek, glossy corvid torso & breast
      const chest = sdEllipsoid(x, y, z, 0, 0.02 + by + P.bodyPitch * 0.08, 0.06, 0.17, 0.16, 0.25);
      const rump = sdEllipsoid(x, y, z, 0, -0.02 + by - P.bodyPitch * 0.06, -0.16, 0.135, 0.125, 0.20);
      const neck = sdCapsule(x, y, z, 0, 0.08 + by + P.bodyPitch * 0.12, 0.16, 0, hy - 0.02, hz - 0.03, 0.115, 0.095);
      const head = sdEllipsoid(x, y, z, 0, hy, hz, 0.112, 0.106, 0.128);
      let body = smin(smin(chest, rump, 0.08), smin(neck, head, 0.04), 0.06);

      // 2. Fanned wedge-shaped tail (3 overlapping tail feathers)
      const tailY = -0.05 + by - P.bodyPitch * 0.18 + P.tailLift;
      const tailL = sdCapsule(x, y, z, -0.04, -0.03 + by, -0.24, -P.tailSpread, tailY, -0.58, 0.058, 0.030);
      const tailM = sdCapsule(x, y, z,  0.00, -0.03 + by, -0.24,  0.00,        tailY, -0.62, 0.064, 0.032);
      const tailR = sdCapsule(x, y, z,  0.04, -0.03 + by, -0.24,  P.tailSpread, tailY, -0.58, 0.058, 0.030);
      const tail = smin(tailM, Math.min(tailL, tailR), 0.032);
      body = smin(body, tail, 0.04);

      // 3. Folded or spread smooth continuous wings (NO dark seam down the middle!)
      if (P.wingSpread < 0.08) {
        // Sleek folded wings hugging the flanks
        const foldL = sdEllipsoid(x, y, z, -0.15, 0.02 + by, -0.06, 0.065, 0.115, 0.26);
        const foldR = sdEllipsoid(x, y, z,  0.15, 0.02 + by, -0.06, 0.065, 0.115, 0.26);
        body = smin(body, Math.min(foldL, foldR), 0.045);
      } else {
        const span = 0.26 + P.wingSpread * 0.60;
        const midX = span * 0.48;
        const tipX = span;
        const midY = 0.04 + by + P.wingMidY;
        const tipY = 0.04 + by + P.wingTipY;

        let wings = 99;
        for (let side = -1; side <= 1; side += 2) {
          const leadIn = sdCapsule(x, y, z, side * 0.12, 0.05 + by, 0.09, side * midX, midY + 0.01, 0.06, 0.076, 0.060);
          const leadOut = sdCapsule(x, y, z, side * midX, midY + 0.01, 0.06, side * tipX, tipY, -0.02, 0.058, 0.032);
          // Solid middle web bridging leading edge & trailing edge seamlessly
          const webIn = sdCapsule(x, y, z, side * 0.13, 0.03 + by, -0.01, side * (midX * 0.96), midY, -0.04, 0.074, 0.054);
          const webOut = sdCapsule(x, y, z, side * (midX * 0.90), midY, -0.04, side * (tipX * 0.94), tipY - 0.01, -0.09, 0.054, 0.030);
          const trail = sdCapsule(x, y, z, side * 0.14, 0.01 + by, -0.10, side * (midX * 0.92), midY - 0.01, -0.13, 0.064, 0.042);

          const w = smin(
            smin(smin(leadIn, leadOut, 0.04), smin(webIn, webOut, 0.04), 0.06),
            trail,
            0.06,
          );
          wings = Math.min(wings, w);
        }
        body = smin(body, wings, 0.045);
      }

      // 4. Sharp dark-slate corvid beak
      const beakTipY = hy - 0.03 - beakDip;
      const beakTipZ = hz + 0.25 - beakDip * 0.22;
      const beak = sdCapsule(x, y, z, 0, hy - 0.005, hz + 0.09, 0, beakTipY, beakTipZ, 0.044, 0.012);

      // 5. Slender dark-slate legs & toes (standing/hopping on ground or tucked in flight)
      let legs = 99;
      for (let side = -1; side <= 1; side += 2) {
        const hipX = side * 0.078;
        const hipY = -0.10 + by;
        const hipZ = -0.02;

        if (P.legTuck > 0.7) {
          // Tucked neatly under belly in flight
          const tucked = sdCapsule(x, y, z, hipX, hipY, hipZ, hipX, hipY - 0.07, hipZ - 0.14, 0.024, 0.018);
          legs = Math.min(legs, tucked);
        } else {
          const footY = -0.34 + P.legTuck * 0.14;
          const kneeY = -0.21 + by * 0.5 + P.legBend * 0.06 + P.legTuck * 0.08;
          const kneeZ = -0.05 - P.legBend * 0.05;
          const upper = sdCapsule(x, y, z, hipX, hipY, hipZ, hipX, kneeY, kneeZ, 0.026, 0.018);
          const lower = sdCapsule(x, y, z, hipX, kneeY, kneeZ, hipX, footY, 0.02, 0.017, 0.015);
          const toes = sdCapsule(x, y, z, hipX, footY, -0.03, hipX, footY, 0.09, 0.015, 0.012);
          legs = Math.min(legs, smin(smin(upper, lower, 0.015), toes, 0.012));
        }
      }

      // 6. Bright dark eyes with crisp white highlight glint
      const eyeL = sdEllipsoid(x, y, z, -0.088, hy + 0.024, hz + 0.044, 0.026, 0.026, 0.026);
      const eyeR = sdEllipsoid(x, y, z,  0.088, hy + 0.024, hz + 0.044, 0.026, 0.026, 0.026);
      const eyes = Math.min(eyeL, eyeR);

      let d = body;
      let mat = 'body';
      if (beak < d) { d = beak; mat = 'beak'; }
      if (legs < d) { d = legs; mat = 'leg'; }
      if (eyes < d) { d = eyes; mat = 'eye'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, _x, y, z) => {
      if (mat === 'eye') {
        // Dark glossy eye with bright upper-front white glint
        if (y > hy + 0.030 && z > hz + 0.048) return 'W';
        return 'k';
      }
      if (mat === 'beak') return shade > 0.66 ? 'b2' : shade > 0.34 ? 'b1' : 'b0';
      if (mat === 'leg') return shade > 0.45 ? 'b1' : 'b0';

      // Glossy raven-black plumage with smooth iridescent blue-indigo sheen
      return shade > 0.78 ? 'c4' : shade > 0.56 ? 'c3' : shade > 0.34 ? 'c2' : shade > 0.16 ? 'c1' : 'c0';
    };

    pack = build27Pack(CROW_PW, CROW_PH, 0.96, 0.83, CROW_PAL, evalFn, shadeFn);
    crowCache.set(pose, pack);
  }
  return pack;
}

export function getCrowPosePack(...args: Parameters<typeof buildCrowPosePack>): ReturnType<typeof buildCrowPosePack> {
  return registerAnimalSpritePack(buildCrowPosePack(...args), { module: './Crow.ts', factory: 'getCrowPosePack', args }, buildCrowPosePack);
}

/**
 * Crow: hops and pecks on the ground, then takes flight when the player approaches.
 */
export class Crow extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private readonly home = new THREE.Vector3();
  private state: 'idle' | 'hop' | 'peck' | 'fly' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.4, 3.0);
  private targetYaw = rand(0, Math.PI * 2);
  private flyAlt = rand(2.6, 3.8);
  private hopCooldown = 0;

  constructor(ctx: GameContext, pos: THREE.Vector3) {
    super(ctx, getCrowPosePack('idle0').getView(2, 0)!, CROW_PW, CROW_PH, CROW_W, CROW_H, 'CrowBillboard');
    this.hp = 22;
    this.maxHp = 22;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.24;
    this.motor.height = 0.44;
    this.motor.teleport(pos);
    this.home.copy(pos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.28, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.set(this.position.x, this.position.y + 0.22, this.position.z);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y + 0.08, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.34, this.position.z);
    this.hurtboxes[0].enabled = this.alive;
    this.stickRoot.position.set(this.position.x, this.position.y + 0.22, this.position.z);
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
    this.vel.y = 3.5;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.state = 'fly';
      this.stateT = 0;
      this.stateDur = rand(3.0, 4.8);
      this.targetYaw = Math.atan2(hit.dir.x, hit.dir.z);
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
        this.vel.x = damp(this.vel.x, 0, 5, dt);
        this.vel.z = damp(this.vel.z, 0, 5, dt);
        this.vel.y -= 18 * dt;
        this.motor.update(dt);
      } else {
        const dist = target && target.alive
          ? Math.hypot(target.position.x - this.position.x, target.position.z - this.position.z)
          : 999;

        // Flutter away if the player gets too close
        if (dist < 4.0 && this.state !== 'fly') {
          this.state = 'fly';
          this.stateT = 0;
          this.stateDur = rand(3.2, 5.2);
          this.flyAlt = rand(2.5, 3.8);
          if (target) {
            this.targetYaw = Math.atan2(this.position.x - target.position.x, this.position.z - target.position.z) + rand(-0.4, 0.4);
          }
        }

        if (this.state === 'fly') {
          const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
          if (toHome > 10.0) {
            this.targetYaw = Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z);
          } else {
            this.targetYaw += dt * 0.45;
          }
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 6);

          const descending = this.stateT > this.stateDur - 1.2 && dist > 5.0;
          const desiredY = descending ? this.home.y : this.home.y + this.flyAlt;
          const speed = 4.6;
          this.vel.x = damp(this.vel.x, Math.sin(this.facing) * speed, 5, dt);
          this.vel.z = damp(this.vel.z, Math.cos(this.facing) * speed, 5, dt);
          this.vel.y = damp(this.vel.y, (desiredY - this.position.y) * 2.2, 5, dt);
          this.position.addScaledVector(this.vel, dt);

          if (descending && this.position.y <= this.home.y + 0.15) {
            this.position.y = this.home.y;
            this.vel.y = 0;
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.2, 2.4);
          }
          this.bodyPitch = damp(this.bodyPitch, Math.max(-0.3, Math.min(0.3, this.vel.y * 0.08)), 6, dt);
        } else {
          let speed = 0;
          if (this.state === 'idle') {
            if (this.stateT >= this.stateDur) {
              const r = Math.random();
              this.state = r < 0.55 ? 'hop' : 'peck';
              this.stateT = 0;
              this.stateDur = this.state === 'peck' ? rand(1.0, 2.0) : rand(1.4, 2.6);
              const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
              this.targetYaw = toHome > 6.5
                ? Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.6, 0.6)
                : this.facing + rand(-1.8, 1.8);
            }
          } else if (this.state === 'hop') {
            this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 8);
            speed = 1.65;
            if (this.motor.grounded && this.hopCooldown <= 0) {
              this.vel.y = 2.4;
              this.hopCooldown = 0.42;
            }
            if (this.stateT >= this.stateDur && this.motor.grounded) {
              this.state = Math.random() < 0.5 ? 'peck' : 'idle';
              this.stateT = 0;
              this.stateDur = rand(1.2, 2.2);
            }
          } else if (this.state === 'peck') {
            if (this.stateT >= this.stateDur) {
              this.state = 'idle';
              this.stateT = 0;
              this.stateDur = rand(1.0, 2.2);
            }
          }

          this.vel.x = damp(this.vel.x, Math.sin(this.facing) * speed, 8, dt);
          this.vel.z = damp(this.vel.z, Math.cos(this.facing) * speed, 8, dt);
          this.vel.y -= 18 * dt;
          this.motor.update(dt);
          this.bodyPitch = damp(this.bodyPitch, 0, 8, dt);
        }
      }
      this.syncHurtbox();
    }

    let pose: CrowPoseName;
    if (!this.alive) pose = 'idle0';
    else if (this.state === 'fly') pose = pickCycle(CROW_FLAP, this.stateT * 8.5);
    else if (this.state === 'peck') pose = pickCycle(CROW_PECK, this.stateT * 4.5);
    else if (this.state === 'hop') pose = pickCycle(CROW_HOP, this.stateT * 6.5);
    else pose = pickCycle(CROW_IDLE, this.stateT * 2.0);

    const deathSink = this.alive ? 0 : Math.min(0.14, this.deadT * 0.35);
    this.renderBillboard(getCrowPosePack(pose), this.position.y + 0.22 - deathSink, camera, drawingBufferSize);
  }
}
