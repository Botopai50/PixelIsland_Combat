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
// ESCORPIÃO (Flagship Armored Scorpion) — 34×26 @ 56 PPU
// ============================================================================
export type ScorpionPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'scuttle0' | 'scuttle1' | 'scuttle2' | 'scuttle3' | 'scuttle4' | 'scuttle5'
  | 'sting0' | 'sting1' | 'sting2';

export const SCORPION_PW = 34;
export const SCORPION_PH = 26;
export const SCORPION_W = SCORPION_PW / ANIMAL_PPU;
export const SCORPION_H = SCORPION_PH / ANIMAL_PPU;

const SCORPION_PAL: Record<string, [number, number, number]> = {
  k:  [0x12, 0x0a, 0x0d], // crisp 1px dark outline / stinger tip
  s0: [0x29, 0x11, 0x18], // deep obsidian-burgundy shadow
  s1: [0x4d, 0x1b, 0x22], // dark mahogany chitin
  s2: [0x7d, 0x31, 0x24], // warm mahogany-rust midtone
  s3: [0xb8, 0x5c, 0x28], // burnt-amber chitin ridge
  s4: [0xf0, 0xa2, 0x42], // glossy bronze-gold specular highlight
  v0: [0xa8, 0x20, 0x1c], // crimson venom telson shadow
  v1: [0xf5, 0x4e, 0x24], // bright amber-crimson venom bulb
  W:  [0xff, 0xf7, 0xe8], // tiny gleaming eye glint
};

interface ScorpionPose {
  bodyY: number;
  tailFwd: number;  // 0 = poised high over back, 1 = whipping forward over head!
  clawLift: number;
  clawOpen: number;
  legWave: number;
}

const SCORPION_POSES: Record<ScorpionPoseName, ScorpionPose> = {
  // Tail poised & claws swaying
  idle0: { bodyY: 0.00, tailFwd: 0.00, clawLift: 0.00, clawOpen: 0.18, legWave: 0.00 },
  idle1: { bodyY: 0.015, tailFwd: 0.08, clawLift: 0.04, clawOpen: 0.28, legWave: 0.25 },
  idle2: { bodyY: -0.01, tailFwd: -0.05, clawLift: -0.02, clawOpen: 0.12, legWave: -0.25 },

  // Agile 8-legged arachnid scuttle
  scuttle0: { bodyY: 0.012, tailFwd: 0.05, clawLift: 0.04, clawOpen: 0.24, legWave: 0.00 },
  scuttle1: { bodyY: 0.022, tailFwd: 0.10, clawLift: 0.06, clawOpen: 0.28, legWave: 1.05 },
  scuttle2: { bodyY: 0.008, tailFwd: 0.02, clawLift: 0.03, clawOpen: 0.20, legWave: 2.09 },
  scuttle3: { bodyY: 0.014, tailFwd: 0.06, clawLift: 0.05, clawOpen: 0.26, legWave: 3.14 },
  scuttle4: { bodyY: 0.022, tailFwd: 0.10, clawLift: 0.06, clawOpen: 0.28, legWave: 4.19 },
  scuttle5: { bodyY: 0.008, tailFwd: 0.02, clawLift: 0.03, clawOpen: 0.20, legWave: 5.24 },

  // Tail whipping forward over the head to strike + claws open!
  sting0: { bodyY: 0.025, tailFwd: -0.22, clawLift: 0.14, clawOpen: 0.72, legWave: 0.20 },
  sting1: { bodyY: 0.040, tailFwd: 0.95, clawLift: 0.22, clawOpen: 1.00, legWave: 0.45 },
  sting2: { bodyY: 0.018, tailFwd: 0.55, clawLift: 0.16, clawOpen: 0.35, legWave: -0.20 },
};

const scorpionCache = new Map<ScorpionPoseName, Boar27Pack>();
 function buildScorpionPosePack(pose: ScorpionPoseName): Boar27Pack {
  let pack = scorpionCache.get(pose);
  if (!pack) {
    const P = SCORPION_POSES[pose];
    const by = P.bodyY;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // 1. Segmented glossy armored arachnid body (prosoma + mesosoma)
      const headShield = sdEllipsoid(x, y, z, 0, -0.05 + by, 0.14, 0.145, 0.088, 0.155);
      const midBody = sdEllipsoid(x, y, z, 0, -0.04 + by, -0.08, 0.165, 0.095, 0.19);
      const rearBody = sdEllipsoid(x, y, z, 0, -0.05 + by, -0.25, 0.125, 0.080, 0.12);
      let body = smin(smin(headShield, midBody, 0.045), rearBody, 0.04);

      // 2. Iconic 5-segment curved tail arching high over the back + bulbous venom telson & sharp stinger!
      const fwd = P.tailFwd;
      const p0z = -0.32, p0y = -0.03 + by;
      const p1z = -0.44 + fwd * 0.06, p1y = 0.08 + by + fwd * 0.02;
      const p2z = -0.45 + fwd * 0.18, p2y = 0.24 + by + fwd * 0.04;
      const p3z = -0.33 + fwd * 0.34, p3y = 0.36 + by + fwd * 0.03;
      const p4z = -0.15 + fwd * 0.48, p4y = 0.39 + by - fwd * 0.04;
      const p5z =  0.04 + fwd * 0.54, p5y = 0.33 + by - fwd * 0.12;

      const t1 = sdCapsule(x, y, z, 0, p0y, p0z, 0, p1y, p1z, 0.072, 0.064);
      const t2 = sdCapsule(x, y, z, 0, p1y, p1z, 0, p2y, p2z, 0.062, 0.055);
      const t3 = sdCapsule(x, y, z, 0, p2y, p2z, 0, p3y, p3z, 0.054, 0.048);
      const t4 = sdCapsule(x, y, z, 0, p3y, p3z, 0, p4y, p4z, 0.046, 0.042);
      const t5 = sdCapsule(x, y, z, 0, p4y, p4z, 0, p5y, p5z, 0.040, 0.036);
      const tail = smin(smin(t1, t2, 0.02), smin(smin(t3, t4, 0.02), t5, 0.02), 0.02);
      body = smin(body, tail, 0.025);

      // Bulbous amber-crimson venom telson & sharp curved stinger
      const bulbZ = p5z + 0.055;
      const bulbY = p5y - 0.015 - fwd * 0.03;
      const telson = sdEllipsoid(x, y, z, 0, bulbY, bulbZ, 0.052, 0.048, 0.062);
      const stinger = sdCapsule(
        x, y, z,
        0, bulbY - 0.01, bulbZ + 0.04,
        0, bulbY - 0.085 - fwd * 0.04, bulbZ + 0.125,
        0.022, 0.008
      );

      // 3. Two heavy forward-reaching articulated pincer claws (pedipalps)
      let claws = 99;
      const open = P.clawOpen * 0.075;
      for (let side = -1; side <= 1; side += 2) {
        const shX = side * 0.12;
        const shY = -0.04 + by;
        const shZ = 0.22;
        const elX = side * 0.26;
        const elY = -0.01 + by + P.clawLift * 0.5;
        const elZ = 0.34;
        const pX = side * 0.22;
        const pY = 0.02 + by + P.clawLift;
        const pZ = 0.46;

        const arm = sdCapsule(x, y, z, shX, shY, shZ, elX, elY, elZ, 0.036, 0.040);
        const wrist = sdCapsule(x, y, z, elX, elY, elZ, pX, pY, pZ, 0.038, 0.052);
        const palm = sdEllipsoid(x, y, z, pX, pY, pZ + 0.03, 0.068, 0.056, 0.088);

        const tipX = side * 0.12;
        const tipZ = pZ + 0.18;
        const upperPinc = sdCapsule(x, y, z, pX - side * 0.01, pY + 0.024 + open * 0.4, pZ + 0.06, tipX, pY + 0.035 + open, tipZ, 0.026, 0.012);
        const lowerPinc = sdCapsule(x, y, z, pX - side * 0.01, pY - 0.020 - open * 0.3, pZ + 0.06, tipX + side * 0.02, pY - 0.028 - open * 0.7, tipZ - 0.01, 0.024, 0.011);

        const claw = smin(smin(arm, wrist, 0.018), smin(palm, Math.min(upperPinc, lowerPinc), 0.015), 0.018);
        claws = Math.min(claws, claw);
      }
      body = smin(body, claws, 0.02);

      // 4. Eight splayed jointed legs (4 per side)
      let legs = 99;
      for (let side = -1; side <= 1; side += 2) {
        for (let i = 0; i < 4; i++) {
          const baseZ = -0.22 + i * 0.12;
          const zBias = (i - 1.5) * 0.04;
          const phase = P.legWave + i * 1.57 + (side < 0 ? 0 : Math.PI);
          const lift = Math.max(0, Math.sin(phase)) * 0.065;
          const swing = Math.cos(phase) * 0.055;

          const hipX = side * 0.14;
          const hipY = -0.08 + by;
          const kneeX = side * 0.31;
          const kneeY = -0.02 + by + lift;
          const kneeZ = baseZ + zBias * 0.5 + swing * 0.45;
          const footX = side * 0.44;
          const footY = -0.24 + lift * 1.1;
          const footZ = baseZ + zBias + swing;

          const femur = sdCapsule(x, y, z, hipX, hipY, baseZ, kneeX, kneeY, kneeZ, 0.028, 0.022);
          const tibia = sdCapsule(x, y, z, kneeX, kneeY, kneeZ, footX, footY, footZ, 0.020, 0.012);
          legs = Math.min(legs, smin(femur, tibia, 0.012));
        }
      }
      body = smin(body, legs, 0.018);

      // Tiny gleaming eyes on front of prosoma
      const eyeL = sdEllipsoid(x, y, z, -0.045, 0.015 + by, 0.24, 0.020, 0.020, 0.020);
      const eyeR = sdEllipsoid(x, y, z,  0.045, 0.015 + by, 0.24, 0.020, 0.020, 0.020);
      const eyes = Math.min(eyeL, eyeR);

      let d = smin(body, telson, 0.016);
      d = smin(d, stinger, 0.010);

      let mat = 'chitin';
      if (telson < body + 0.005) mat = 'telson';
      if (stinger < telson + 0.004 && stinger < body + 0.004) mat = 'stinger';
      if (eyes < d) { d = eyes; mat = 'eye'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, _x, y, z) => {
      if (mat === 'eye') return 'W';
      if (mat === 'stinger') return 'k';
      if (mat === 'telson') return shade > 0.45 ? 'v1' : 'v0';

      // Subtle dorsal mesosoma plate grooves
      let groove = false;
      if (z < 0.08 && z > -0.26 && y > -0.04 + by) {
        const seg = Math.abs(((z + 0.26) % 0.085) - 0.0425);
        if (seg > 0.034) groove = true;
      }
      const s = groove ? shade - 0.24 : shade;
      return s > 0.84 ? 's4' : s > 0.62 ? 's3' : s > 0.38 ? 's2' : s > 0.18 ? 's1' : 's0';
    };

    pack = build27Pack(SCORPION_PW, SCORPION_PH, 1.18, 0.88, SCORPION_PAL, evalFn, shadeFn);
    scorpionCache.set(pose, pack);
  }
  return pack;
}

export function getScorpionPosePack(...args: Parameters<typeof buildScorpionPosePack>): ReturnType<typeof buildScorpionPosePack> {
  return registerAnimalSpritePack(buildScorpionPosePack(...args), { module: './Scorpion.ts', factory: 'getScorpionPosePack', args }, buildScorpionPosePack);
}

const SCORPION_IDLE: readonly ScorpionPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const SCORPION_SCUTTLE: readonly ScorpionPoseName[] = ['scuttle0', 'scuttle1', 'scuttle2', 'scuttle3', 'scuttle4', 'scuttle5'];
const SCORPION_STING: readonly ScorpionPoseName[] = ['sting0', 'sting1', 'sting2'];

/**
 * Armored Scorpion (Escorpião): scuttles across the ground and whips its venomous tail
 * forward to strike if approached or provoked.
 */
export class Scorpion extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private readonly home = new THREE.Vector3();
  private state: 'idle' | 'scuttle' | 'sting' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.2, 2.6);
  private gaitPhase = rand(0, Math.PI * 2);

  constructor(ctx: GameContext, pos: THREE.Vector3) {
    super(
      ctx,
      getScorpionPosePack('idle0').getView(2, 0)!,
      SCORPION_PW,
      SCORPION_PH,
      SCORPION_W,
      SCORPION_H,
      'ScorpionBillboard'
    );
    this.hp = 25;
    this.maxHp = 25;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.20;
    this.motor.height = 0.26;
    this.motor.teleport(pos);
    this.home.copy(pos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.26, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.set(this.position.x, this.position.y + 0.14, this.position.z);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y + 0.05, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.24, this.position.z);
    this.hurtboxes[0].enabled = this.alive;
    this.stickRoot.position.set(this.position.x, this.position.y + 0.14, this.position.z);
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
      this.state = 'sting';
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

        if (dist < 2.6 && this.state !== 'sting') {
          this.state = 'sting';
          this.stateT = 0;
          this.stateDur = 1.5;
        }

        if (this.state === 'idle') {
          if (this.stateT >= this.stateDur) {
            this.state = 'scuttle';
            this.stateT = 0;
            this.stateDur = rand(1.4, 2.8);
            const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
            if (toHome > 5.2) {
              this.facing = Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.4, 0.4);
            } else {
              this.facing += rand(-1.2, 1.2);
            }
          }
        } else if (this.state === 'scuttle') {
          vx = Math.sin(this.facing) * 1.65;
          vz = Math.cos(this.facing) * 1.65;
          if (this.stateT >= this.stateDur) {
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.0, 2.2);
          }
        } else if (this.state === 'sting') {
          if (target && target.alive) {
            const toPlayer = Math.atan2(target.position.x - this.position.x, target.position.z - this.position.z);
            this.facing += angleDiff(this.facing, toPlayer) * Math.min(1, dt * 10);
          }
          if (this.stateT >= this.stateDur && dist > 3.4) {
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
          this.gaitPhase += dt * 8.2 * (0.7 + horiz * 0.3);
        }
      }
      this.syncHurtbox();
    }

    let pose: ScorpionPoseName;
    if (!this.alive) pose = 'idle0';
    else if (this.state === 'sting') pose = pickCycle(SCORPION_STING, this.stateT * 4.8);
    else if (this.state === 'scuttle') pose = pickCycle(SCORPION_SCUTTLE, (this.gaitPhase / Math.PI) * 3.0);
    else pose = pickCycle(SCORPION_IDLE, this.stateT * 2.0);

    const deathSink = this.alive ? 0 : Math.min(0.12, this.deadT * 0.3);
    this.renderBillboard(getScorpionPosePack(pose), this.position.y + 0.15 - deathSink, camera, drawingBufferSize);
  }
}
