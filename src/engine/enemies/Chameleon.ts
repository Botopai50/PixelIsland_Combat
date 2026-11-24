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
// CAMALEÃO (Flagship Veiled Chameleon) — 34×26 @ 56 PPU
// ============================================================================
export type ChameleonPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'walk0' | 'walk1' | 'walk2' | 'walk3' | 'walk4' | 'walk5'
  | 'zap0' | 'zap1' | 'zap2';

export const CHAMELEON_PW = 34;
export const CHAMELEON_PH = 26;
export const CHAMELEON_W = CHAMELEON_PW / ANIMAL_PPU;
export const CHAMELEON_H = CHAMELEON_PH / ANIMAL_PPU;

const CHAMELEON_PAL: Record<string, [number, number, number]> = {
  k:  [0x0f, 0x16, 0x14], // crisp 1px dark outline / tiny pupil
  c0: [0x0e, 0x45, 0x3f], // deep teal-emerald shadow
  c1: [0x17, 0x7a, 0x62], // rich tropical turquoise-jade
  c2: [0x2c, 0xb5, 0x73], // vibrant emerald-jade midtone
  c3: [0x68, 0xe3, 0x7c], // sunlit lime-jade highlight
  c4: [0xb4, 0xf7, 0x9c], // glossy crest & turret rim highlight
  y0: [0xd4, 0xa2, 0x24], // warm golden-yellow flank bar shadow
  y1: [0xff, 0xd8, 0x45], // bright golden-yellow vertical flank bars
  o1: [0xf2, 0x72, 0x4e], // warm coral-orange flank bar accent
  t0: [0xc7, 0x3e, 0x64], // rosy-pink shooting tongue shadow
  t1: [0xff, 0x7a, 0x9c], // bright rosy-pink sticky tongue & pad
  W:  [0xff, 0xfb, 0xf2], // crisp white eye glint
};

interface ChameleonPose {
  bodyY: number;
  rockZ: number;
  flSwing: number;
  flLift: number;
  frSwing: number;
  frLift: number;
  blSwing: number;
  blLift: number;
  brSwing: number;
  brLift: number;
  tongueLen: number; // 0 = closed, 0.35 = aiming, 1.0 = full zap!
}

const CHAMELEON_POSES: Record<ChameleonPoseName, ChameleonPose> = {
  // Gentle leaf-sway rocking
  idle0: {
    bodyY: 0.00, rockZ: 0.00,
    flSwing: 0.02, flLift: 0.0, frSwing: -0.02, frLift: 0.0,
    blSwing: -0.02, blLift: 0.0, brSwing: 0.02, brLift: 0.0,
    tongueLen: 0.0,
  },
  idle1: {
    bodyY: 0.014, rockZ: 0.028,
    flSwing: 0.02, flLift: 0.0, frSwing: -0.02, frLift: 0.0,
    blSwing: -0.02, blLift: 0.0, brSwing: 0.02, brLift: 0.0,
    tongueLen: 0.0,
  },
  idle2: {
    bodyY: -0.01, rockZ: -0.024,
    flSwing: 0.02, flLift: 0.0, frSwing: -0.02, frLift: 0.0,
    blSwing: -0.02, blLift: 0.0, brSwing: 0.02, brLift: 0.0,
    tongueLen: 0.0,
  },

  // Slow deliberate rocking chameleon stalk
  walk0: {
    bodyY: 0.01, rockZ: 0.03,
    flSwing: 0.14, flLift: 0.08, frSwing: -0.08, frLift: 0.00,
    blSwing: -0.08, blLift: 0.00, brSwing: 0.14, brLift: 0.08,
    tongueLen: 0.0,
  },
  walk1: {
    bodyY: 0.02, rockZ: 0.01,
    flSwing: 0.08, flLift: 0.02, frSwing: -0.02, frLift: 0.04,
    blSwing: -0.02, blLift: 0.04, brSwing: 0.08, brLift: 0.02,
    tongueLen: 0.0,
  },
  walk2: {
    bodyY: 0.005, rockZ: -0.02,
    flSwing: -0.04, flLift: 0.00, frSwing: 0.10, frLift: 0.08,
    blSwing: 0.10, blLift: 0.08, brSwing: -0.04, brLift: 0.00,
    tongueLen: 0.0,
  },
  walk3: {
    bodyY: 0.01, rockZ: -0.03,
    flSwing: -0.08, flLift: 0.00, frSwing: 0.14, frLift: 0.08,
    blSwing: 0.14, blLift: 0.08, brSwing: -0.08, brLift: 0.00,
    tongueLen: 0.0,
  },
  walk4: {
    bodyY: 0.02, rockZ: -0.01,
    flSwing: -0.02, flLift: 0.04, frSwing: 0.08, frLift: 0.02,
    blSwing: 0.08, blLift: 0.02, brSwing: -0.02, brLift: 0.04,
    tongueLen: 0.0,
  },
  walk5: {
    bodyY: 0.005, rockZ: 0.02,
    flSwing: 0.10, flLift: 0.08, frSwing: -0.04, frLift: 0.00,
    blSwing: -0.04, blLift: 0.00, brSwing: 0.10, brLift: 0.08,
    tongueLen: 0.0,
  },

  // Long rosy-pink sticky tongue shooting out to catch a bug!
  zap0: {
    bodyY: 0.015, rockZ: 0.04,
    flSwing: 0.04, flLift: 0.0, frSwing: 0.04, frLift: 0.0,
    blSwing: -0.04, blLift: 0.0, brSwing: -0.04, brLift: 0.0,
    tongueLen: 0.30,
  },
  zap1: {
    bodyY: 0.025, rockZ: 0.07,
    flSwing: 0.06, flLift: 0.0, frSwing: 0.06, frLift: 0.0,
    blSwing: -0.06, blLift: 0.0, brSwing: -0.06, brLift: 0.0,
    tongueLen: 1.00,
  },
  zap2: {
    bodyY: 0.01, rockZ: 0.03,
    flSwing: 0.04, flLift: 0.0, frSwing: 0.04, frLift: 0.0,
    blSwing: -0.04, blLift: 0.0, brSwing: -0.04, brLift: 0.0,
    tongueLen: 0.45,
  },
};

const chameleonCache = new Map<ChameleonPoseName, Boar27Pack>();
 function buildChameleonPosePack(pose: ChameleonPoseName): Boar27Pack {
  let pack = chameleonCache.get(pose);
  if (!pack) {
    const P = CHAMELEON_POSES[pose];
    const by = P.bodyY;
    const rz = P.rockZ;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // 1. High, arched, leaf-shaped laterally compressed body + dorsal crest ridge
      const torso = sdEllipsoid(x, y, z, 0, 0.05 + by, 0.00 + rz, 0.125, 0.195, 0.27);
      const dorsalArch = sdEllipsoid(x, y, z, 0, 0.15 + by, 0.02 + rz, 0.075, 0.12, 0.22);
      const rump = sdEllipsoid(x, y, z, 0, 0.02 + by, -0.22 + rz, 0.095, 0.135, 0.12);
      let body = smin(smin(torso, dorsalArch, 0.055), rump, 0.05);

      // 2. Angular head + tall pointed helmet-like casque crest + chin dewlap
      const hY = 0.10 + by;
      const hZ = 0.30 + rz;
      const skull = sdEllipsoid(x, y, z, 0, hY, hZ, 0.105, 0.105, 0.13);
      const snout = sdCapsule(x, y, z, 0, hY - 0.015, hZ + 0.05, 0, hY - 0.025, hZ + 0.17, 0.072, 0.048);
      // Iconic tall pointed Veiled Chameleon casque rising from the back of the skull!
      const casque = sdCapsule(x, y, z, 0, hY + 0.05, hZ - 0.02, 0, hY + 0.27, hZ - 0.10, 0.068, 0.020);
      const dewlap = sdEllipsoid(x, y, z, 0, hY - 0.085, hZ + 0.02, 0.058, 0.065, 0.085);
      const head = smin(smin(skull, snout, 0.03), smin(casque, dewlap, 0.03), 0.035);
      body = smin(body, head, 0.045);

      // 3. Protruding conical turret eyes with tiny dark pupil & white glint
      const turretL = sdEllipsoid(x, y, z, -0.105, hY + 0.025, hZ + 0.055, 0.052, 0.052, 0.052);
      const turretR = sdEllipsoid(x, y, z,  0.105, hY + 0.025, hZ + 0.055, 0.052, 0.052, 0.052);
      body = smin(body, Math.min(turretL, turretR), 0.015);

      const pupilL = sdEllipsoid(x, y, z, -0.145, hY + 0.028, hZ + 0.072, 0.024, 0.024, 0.024);
      const pupilR = sdEllipsoid(x, y, z,  0.145, hY + 0.028, hZ + 0.072, 0.024, 0.024, 0.024);
      const eyes = Math.min(pupilL, pupilR);

      // 4. Tightly coiled spiral prehensile tail curled behind the rump!
      const t0 = sdCapsule(x, y, z, 0, -0.01 + by, -0.28 + rz, 0, -0.09 + by, -0.44 + rz, 0.058, 0.044);
      const t1 = sdCapsule(x, y, z, 0, -0.09 + by, -0.44 + rz, 0, -0.20 + by, -0.40 + rz, 0.044, 0.036);
      const t2 = sdCapsule(x, y, z, 0, -0.20 + by, -0.40 + rz, 0, -0.19 + by, -0.29 + rz, 0.036, 0.030);
      const t3 = sdCapsule(x, y, z, 0, -0.19 + by, -0.29 + rz, 0, -0.12 + by, -0.32 + rz, 0.028, 0.020);
      const tail = smin(smin(t0, t1, 0.022), smin(t2, t3, 0.020), 0.022);
      body = smin(body, tail, 0.03);

      // 5. Slender legs with mitten-like grasping feet
      const leg = (sx: number, shZ: number, swing: number, lift: number) => {
        const kneeY = -0.11 + by + lift * 0.5;
        const fy = -0.27 + lift;
        const fz = shZ + rz + swing;
        const upper = sdCapsule(x, y, z, sx, -0.05 + by, shZ + rz, sx * 1.15, kneeY, shZ + rz + swing * 0.4, 0.038, 0.030);
        const lower = sdCapsule(x, y, z, sx * 1.15, kneeY, shZ + rz + swing * 0.4, sx * 1.05, fy + 0.02, fz, 0.028, 0.024);
        const mitten = sdEllipsoid(x, y, z, sx * 1.05, fy, fz + 0.015, 0.042, 0.024, 0.046);
        return smin(smin(upper, lower, 0.016), mitten, 0.016);
      };
      const legs = Math.min(
        Math.min(leg(-0.10, 0.14, P.flSwing, P.flLift), leg(0.10, 0.14, P.frSwing, P.frLift)),
        Math.min(leg(-0.095, -0.16, P.blSwing, P.blLift), leg(0.095, -0.16, P.brSwing, P.brLift))
      );
      body = smin(body, legs, 0.025);

      // 6. Long shooting rosy-pink sticky tongue in zap0..2!
      let tongue = 99;
      if (P.tongueLen > 0.01) {
        const tipZ = hZ + 0.16 + P.tongueLen * 0.44;
        const shaft = sdCapsule(x, y, z, 0, hY - 0.03, hZ + 0.14, 0, hY - 0.02, tipZ, 0.022, 0.018);
        const pad = sdEllipsoid(x, y, z, 0, hY - 0.02, tipZ + 0.025, 0.042, 0.036, 0.044);
        tongue = smin(shaft, pad, 0.015);
      }

      let d = body;
      let mat = 'scales';
      if (tongue < d) { d = tongue; mat = 'tongue'; }
      if (eyes < d) { d = eyes; mat = 'eye'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'eye') {
        const hY = 0.10 + by;
        const hZ = 0.30 + rz;
        if (y > hY + 0.032 && z > hZ + 0.076) return 'W';
        return 'k';
      }
      if (mat === 'tongue') {
        return shade > 0.42 ? 't1' : 't0';
      }

      // Golden-yellow & warm coral vertical flank bars on the leaf-shaped torso
      const onFlank = z > -0.20 + rz && z < 0.22 + rz && y > -0.06 + by && y < 0.20 + by && Math.abs(x) > 0.07;
      if (onFlank) {
        const bar = Math.sin((z - rz) * 28.0);
        if (bar > 0.55) return shade > 0.44 ? 'y1' : 'y0';
        if (bar < -0.78 && y > 0.04 + by && y < 0.14 + by) return 'o1';
      }

      return shade > 0.84 ? 'c4' : shade > 0.62 ? 'c3' : shade > 0.38 ? 'c2' : shade > 0.18 ? 'c1' : 'c0';
    };

    pack = build27Pack(CHAMELEON_PW, CHAMELEON_PH, 1.18, 0.84, CHAMELEON_PAL, evalFn, shadeFn);
    chameleonCache.set(pose, pack);
  }
  return pack;
}

export function getChameleonPosePack(...args: Parameters<typeof buildChameleonPosePack>): ReturnType<typeof buildChameleonPosePack> {
  return registerAnimalSpritePack(buildChameleonPosePack(...args), { module: './Chameleon.ts', factory: 'getChameleonPosePack', args }, buildChameleonPosePack);
}

const CHAMELEON_IDLE: readonly ChameleonPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const CHAMELEON_WALK: readonly ChameleonPoseName[] = ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'];
const CHAMELEON_ZAP: readonly ChameleonPoseName[] = ['zap0', 'zap1', 'zap2'];

/**
 * Veiled Chameleon (Camaleão): rocks gently like a leaf, stalks slowly,
 * and zaps bugs with its long rosy-pink sticky tongue.
 */
export class Chameleon extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private readonly home = new THREE.Vector3();
  private state: 'idle' | 'walk' | 'zap' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.6, 3.2);
  private gaitPhase = rand(0, Math.PI * 2);

  constructor(ctx: GameContext, pos: THREE.Vector3) {
    super(
      ctx,
      getChameleonPosePack('idle0').getView(2, 0)!,
      CHAMELEON_PW,
      CHAMELEON_PH,
      CHAMELEON_W,
      CHAMELEON_H,
      'ChameleonBillboard'
    );
    this.hp = 20;
    this.maxHp = 20;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.20;
    this.motor.height = 0.28;
    this.motor.teleport(pos);
    this.home.copy(pos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.25, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.set(this.position.x, this.position.y + 0.16, this.position.z);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y + 0.06, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.26, this.position.z);
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
    this.vel.x += hit.dir.x * 3.8;
    this.vel.z += hit.dir.z * 3.8;
    this.vel.y = 2.6;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.state = 'walk';
      this.stateT = 0;
      this.stateDur = 2.4;
      this.facing = Math.atan2(hit.dir.x, hit.dir.z);
    }
    return res;
  }

  update(dt: number, _target: EnemyTarget | null, camera: THREE.Camera, drawingBufferSize?: THREE.Vector2) {
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
        let vx = 0;
        let vz = 0;

        if (this.state === 'idle' || this.state === 'zap') {
          if (this.stateT >= this.stateDur) {
            if (this.state === 'idle' && Math.random() < 0.42) {
              this.state = 'zap';
              this.stateT = 0;
              this.stateDur = 0.9;
            } else {
              this.state = 'walk';
              this.stateT = 0;
              this.stateDur = rand(2.0, 3.6);
              const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
              if (toHome > 5.0) {
                this.facing = Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.4, 0.4);
              } else {
                this.facing += rand(-1.2, 1.2);
              }
            }
          }
        } else if (this.state === 'walk') {
          vx = Math.sin(this.facing) * 0.85;
          vz = Math.cos(this.facing) * 0.85;
          if (this.stateT >= this.stateDur) {
            this.state = Math.random() < 0.40 ? 'zap' : 'idle';
            this.stateT = 0;
            this.stateDur = this.state === 'zap' ? 0.9 : rand(1.6, 3.0);
          }
        }

        this.vel.x = damp(this.vel.x, vx, 8, dt);
        this.vel.z = damp(this.vel.z, vz, 8, dt);
        this.vel.y -= 20 * dt;
        this.motor.update(dt);

        const horiz = Math.hypot(this.vel.x, this.vel.z);
        if (horiz > 0.12 && this.motor.grounded) {
          this.gaitPhase += dt * 5.2 * (0.7 + horiz * 0.35);
        }
      }
      this.syncHurtbox();
    }

    let pose: ChameleonPoseName;
    if (!this.alive) pose = 'idle0';
    else if (this.state === 'zap') pose = pickCycle(CHAMELEON_ZAP, this.stateT * 4.5);
    else if (this.state === 'walk') pose = pickCycle(CHAMELEON_WALK, (this.gaitPhase / Math.PI) * 3.0);
    else pose = pickCycle(CHAMELEON_IDLE, this.stateT * 1.8);

    const deathSink = this.alive ? 0 : Math.min(0.12, this.deadT * 0.3);
    this.renderBillboard(getChameleonPosePack(pose), this.position.y + 0.16 - deathSink, camera, drawingBufferSize);
  }
}
