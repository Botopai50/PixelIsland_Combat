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
// CARANGUEJO-REI (Flagship Alaskan King Crab) — 58×38 @ 56 PPU
// ============================================================================
export type KingCrabPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'scuttle0' | 'scuttle1' | 'scuttle2' | 'scuttle3' | 'scuttle4' | 'scuttle5'
  | 'snap0' | 'snap1' | 'snap2';

export const KING_CRAB_PW = 58;
export const KING_CRAB_PH = 38;
export const KING_CRAB_W = KING_CRAB_PW / ANIMAL_PPU;
export const KING_CRAB_H = KING_CRAB_PH / ANIMAL_PPU;

const KING_CRAB_PAL: Record<string, [number, number, number]> = {
  k:  [0x16, 0x0b, 0x0e], // crisp 1px dark outline / dark leg tips / glossy eyes
  r0: [0x59, 0x0e, 0x16], // deep burgundy-ruby shadow
  r1: [0x8f, 0x18, 0x1e], // rich ruby-crimson carapace
  r2: [0xc4, 0x2b, 0x22], // vibrant burnt-scarlet midtone
  r3: [0xe8, 0x56, 0x2c], // sunlit scarlet-orange
  r4: [0xff, 0x99, 0x52], // glossy orange-gold spine/shell highlight
  b0: [0xc4, 0x9c, 0x68], // warm tan underside / leg joint shadow
  b1: [0xf5, 0xe2, 0xb8], // pale ivory-cream underside / joint rings / pincer tips
  W:  [0xff, 0xfb, 0xf4], // crisp white eye glint
};

interface KingCrabPose {
  bodyY: number;
  bodyTilt: number;
  clawLiftL: number;
  clawLiftR: number;
  clawFwd: number;
  clawOpenL: number;
  clawOpenR: number;
  legWave: number;
  eyeBob: number;
}

const KING_CRAB_POSES: Record<KingCrabPoseName, KingCrabPose> = {
  idle0: {
    bodyY: 0.00, bodyTilt: 0.00,
    clawLiftL: 0.00, clawLiftR: 0.03, clawFwd: 0.00,
    clawOpenL: 0.14, clawOpenR: 0.20, legWave: 0.00, eyeBob: 0.00,
  },
  idle1: {
    bodyY: 0.02, bodyTilt: 0.015,
    clawLiftL: 0.06, clawLiftR: 0.09, clawFwd: 0.02,
    clawOpenL: 0.24, clawOpenR: 0.30, legWave: 0.22, eyeBob: 0.015,
  },
  idle2: {
    bodyY: -0.015, bodyTilt: -0.012,
    clawLiftL: -0.02, clawLiftR: 0.01, clawFwd: -0.01,
    clawOpenL: 0.08, clawOpenR: 0.12, legWave: -0.22, eyeBob: -0.01,
  },

  // Towering sideways spider-crab stride
  scuttle0: {
    bodyY: 0.025, bodyTilt: 0.032,
    clawLiftL: 0.07, clawLiftR: 0.10, clawFwd: 0.03,
    clawOpenL: 0.22, clawOpenR: 0.28, legWave: 0.00, eyeBob: 0.01,
  },
  scuttle1: {
    bodyY: 0.042, bodyTilt: 0.018,
    clawLiftL: 0.10, clawLiftR: 0.13, clawFwd: 0.04,
    clawOpenL: 0.28, clawOpenR: 0.32, legWave: 1.05, eyeBob: 0.02,
  },
  scuttle2: {
    bodyY: 0.012, bodyTilt: -0.018,
    clawLiftL: 0.05, clawLiftR: 0.08, clawFwd: 0.02,
    clawOpenL: 0.18, clawOpenR: 0.22, legWave: 2.09, eyeBob: 0.00,
  },
  scuttle3: {
    bodyY: 0.028, bodyTilt: -0.032,
    clawLiftL: 0.08, clawLiftR: 0.11, clawFwd: 0.03,
    clawOpenL: 0.24, clawOpenR: 0.28, legWave: 3.14, eyeBob: 0.01,
  },
  scuttle4: {
    bodyY: 0.044, bodyTilt: -0.015,
    clawLiftL: 0.11, clawLiftR: 0.14, clawFwd: 0.04,
    clawOpenL: 0.28, clawOpenR: 0.34, legWave: 4.19, eyeBob: 0.02,
  },
  scuttle5: {
    bodyY: 0.014, bodyTilt: 0.018,
    clawLiftL: 0.06, clawLiftR: 0.09, clawFwd: 0.02,
    clawOpenL: 0.18, clawOpenR: 0.22, legWave: 5.24, eyeBob: 0.00,
  },

  // Defensive threat: claws raised high & snapping wide
  snap0: {
    bodyY: 0.04, bodyTilt: -0.02,
    clawLiftL: 0.22, clawLiftR: 0.28, clawFwd: 0.06,
    clawOpenL: 0.76, clawOpenR: 0.88, legWave: 0.15, eyeBob: 0.02,
  },
  snap1: {
    bodyY: 0.065, bodyTilt: 0.02,
    clawLiftL: 0.32, clawLiftR: 0.40, clawFwd: 0.10,
    clawOpenL: 1.00, clawOpenR: 1.00, legWave: 0.45, eyeBob: 0.03,
  },
  snap2: {
    bodyY: 0.02, bodyTilt: 0.00,
    clawLiftL: 0.24, clawLiftR: 0.30, clawFwd: 0.13,
    clawOpenL: 0.02, clawOpenR: 0.02, legWave: -0.35, eyeBob: 0.005,
  },
};

const kingCrabCache = new Map<KingCrabPoseName, Boar27Pack>();
 function buildKingCrabPosePack(pose: KingCrabPoseName): Boar27Pack {
  let pack = kingCrabCache.get(pose);
  if (!pack) {
    const P = KING_CRAB_POSES[pose];
    const by = P.bodyY;

    const evalFn: SdfEvaluator = (x, y, z) => {
      const tiltY = by + x * P.bodyTilt;

      // 1. Spiny, ridged heart-shaped armored carapace (broader rear lobes, tapered rostral front)
      const rearL = sdEllipsoid(x, y, z, -0.15, -0.01 + tiltY, -0.11, 0.21, 0.16, 0.21);
      const rearR = sdEllipsoid(x, y, z,  0.15, -0.01 + tiltY, -0.11, 0.21, 0.16, 0.21);
      const frontCore = sdEllipsoid(x, y, z, 0, -0.02 + tiltY, 0.10, 0.24, 0.145, 0.20);
      const dorsalDome = sdEllipsoid(x, y, z, 0, 0.065 + tiltY, -0.03, 0.20, 0.11, 0.21);
      const sternum = sdEllipsoid(x, y, z, 0, -0.135 + tiltY, -0.02, 0.26, 0.075, 0.22);

      let shell = smin(Math.min(rearL, rearR), frontCore, 0.07);
      shell = smin(shell, dorsalDome, 0.05);
      shell = smin(shell, sternum, 0.045);

      // Sculpted dorsal spines, rostral horn & lateral carapace horns
      const rostrum = sdCapsule(x, y, z, 0, -0.01 + tiltY, 0.24, 0, 0.03 + tiltY, 0.37, 0.036, 0.014);
      const dSpineC = sdCapsule(x, y, z, 0, 0.12 + tiltY, -0.02, 0, 0.22 + tiltY, -0.04, 0.032, 0.012);
      const dSpineL = sdCapsule(x, y, z, -0.16, 0.09 + tiltY, -0.10, -0.22, 0.19 + tiltY, -0.14, 0.030, 0.011);
      const dSpineR = sdCapsule(x, y, z,  0.16, 0.09 + tiltY, -0.10,  0.22, 0.19 + tiltY, -0.14, 0.030, 0.011);
      const fSpineL = sdCapsule(x, y, z, -0.14, 0.06 + tiltY, 0.12, -0.19, 0.14 + tiltY, 0.18, 0.028, 0.011);
      const fSpineR = sdCapsule(x, y, z,  0.14, 0.06 + tiltY, 0.12,  0.19, 0.14 + tiltY, 0.18, 0.028, 0.011);
      const latSpineL = sdCapsule(x, y, z, -0.30, -0.02 + tiltY, -0.06, -0.41, 0.02 + tiltY, -0.08, 0.030, 0.012);
      const latSpineR = sdCapsule(x, y, z,  0.30, -0.02 + tiltY, -0.06,  0.41, 0.02 + tiltY, -0.08, 0.030, 0.012);
      const spines = Math.min(
        Math.min(rostrum, dSpineC),
        Math.min(Math.min(dSpineL, dSpineR), Math.min(fSpineL, fSpineR)),
        Math.min(latSpineL, latSpineR)
      );
      shell = smin(shell, spines, 0.02);

      // 2. Six EXTRA-LONG, towering, arched multi-segment walking legs (3 per side)
      let legs = 99;
      let legJoints = 99;
      for (let side = -1; side <= 1; side += 2) {
        for (let i = 0; i < 3; i++) {
          const baseZ = -0.19 + i * 0.15;
          const zSpread = (i - 1) * 0.12;
          const phase = P.legWave + i * 2.094 + (side < 0 ? 0 : Math.PI);
          const lift = Math.max(0, Math.sin(phase)) * 0.14;
          const swing = Math.cos(phase) * 0.095;

          const hipX = side * 0.27;
          const hipY = -0.07 + tiltY;

          // Towering elevated knee rising high above the carapace!
          const kneeX = side * (0.64 + (i === 1 ? 0.05 : 0.0));
          const kneeY = 0.26 + tiltY + lift * 0.8 + (i === 1 ? 0.04 : 0.0);
          const kneeZ = baseZ + zSpread * 0.45 + swing * 0.4;

          // Mid-shin ankle joint
          const ankleX = side * (0.88 + (i === 1 ? 0.06 : 0.0));
          const ankleY = -0.10 + lift * 0.9;
          const ankleZ = baseZ + zSpread * 0.85 + swing * 0.75;

          // Pointed dark dactyl tip
          const footX = side * (0.98 + (i === 1 ? 0.06 : 0.0));
          const footY = -0.45 + lift * 1.15;
          const footZ = baseZ + zSpread + swing;

          const merus = sdCapsule(x, y, z, hipX, hipY, baseZ, kneeX, kneeY, kneeZ, 0.048, 0.036);
          const propodus = sdCapsule(x, y, z, kneeX, kneeY, kneeZ, ankleX, ankleY, ankleZ, 0.035, 0.026);
          const dactyl = sdCapsule(x, y, z, ankleX, ankleY, ankleZ, footX, footY, footZ, 0.025, 0.013);
          const leg = smin(smin(merus, propodus, 0.016), dactyl, 0.014);
          legs = Math.min(legs, leg);

          const jKnee = sdEllipsoid(x, y, z, kneeX, kneeY, kneeZ, 0.044, 0.044, 0.044);
          const jAnkle = sdEllipsoid(x, y, z, ankleX, ankleY, ankleZ, 0.034, 0.034, 0.034);
          legJoints = Math.min(legJoints, Math.min(jKnee, jAnkle));
        }
      }

      // 3. Asymmetric spiny crusher (right) & cutter (left) claws
      let claws = 99;
      let clawTips = 99;
      for (let side = -1; side <= 1; side += 2) {
        const isCrusher = side > 0;
        const scale = isCrusher ? 1.20 : 0.92;
        const lift = isCrusher ? P.clawLiftR : P.clawLiftL;
        const open = (isCrusher ? P.clawOpenR : P.clawOpenL) * 0.125 * scale;

        const shX = side * 0.21;
        const shY = -0.04 + tiltY;
        const shZ = 0.20;

        const elbowX = side * (0.42 + (isCrusher ? 0.04 : 0.0));
        const elbowY = 0.03 + tiltY + lift * 0.55;
        const elbowZ = 0.36 + P.clawFwd * 0.45;

        const palmX = side * (0.37 + (isCrusher ? 0.03 : 0.0));
        const palmY = 0.07 + tiltY + lift;
        const palmZ = 0.52 + P.clawFwd;

        const merus = sdCapsule(x, y, z, shX, shY, shZ, elbowX, elbowY, elbowZ, 0.050 * scale, 0.058 * scale);
        const carpus = sdCapsule(x, y, z, elbowX, elbowY, elbowZ, palmX, palmY, palmZ, 0.056 * scale, 0.068 * scale);
        const palm = sdEllipsoid(x, y, z, palmX, palmY + 0.01, palmZ + 0.03, 0.105 * scale, 0.088 * scale, 0.125 * scale);

        const tipX = side * (0.19 + (isCrusher ? 0.01 : 0.0));
        const tipZ = palmZ + 0.21 * scale;
        const upperJaw = sdCapsule(
          x, y, z,
          palmX - side * 0.03, palmY + 0.050 * scale + open * 0.35, palmZ + 0.08 * scale,
          tipX, palmY + 0.065 * scale + open, tipZ,
          0.040 * scale, 0.016 * scale
        );
        const lowerJaw = sdCapsule(
          x, y, z,
          palmX - side * 0.02, palmY - 0.036 * scale - open * 0.25, palmZ + 0.08 * scale,
          tipX + side * 0.02, palmY - 0.046 * scale - open * 0.72, tipZ - 0.01,
          0.036 * scale, 0.015 * scale
        );

        const jaws = Math.min(upperJaw, lowerJaw);
        const claw = smin(smin(merus, carpus, 0.024), smin(palm, jaws, 0.020), 0.024);
        claws = Math.min(claws, claw);
        clawTips = Math.min(clawTips, jaws);
      }

      // 4. Raised stalked eyes with glossy black spheres & white glint
      const eyeY = 0.21 + tiltY + P.eyeBob;
      const stalkL = sdCapsule(x, y, z, -0.095, 0.06 + tiltY, 0.22, -0.125, eyeY - 0.02, 0.29, 0.025, 0.022);
      const stalkR = sdCapsule(x, y, z,  0.095, 0.06 + tiltY, 0.22,  0.125, eyeY - 0.02, 0.29, 0.025, 0.022);
      const stalks = Math.min(stalkL, stalkR);

      const eyeL = sdEllipsoid(x, y, z, -0.130, eyeY + 0.008, 0.31, 0.040, 0.040, 0.040);
      const eyeR = sdEllipsoid(x, y, z,  0.130, eyeY + 0.008, 0.31, 0.040, 0.040, 0.040);
      const eyes = Math.min(eyeL, eyeR);

      let body = smin(shell, legs, 0.024);
      body = smin(body, claws, 0.024);

      let d = body;
      let mat = 'shell';
      if (spines < shell + 0.004 && y > 0.10 + by) mat = 'spine';
      if (legs < shell + 0.004 && Math.abs(x) > 0.34) mat = 'leg';
      if (legJoints < d + 0.005) mat = 'joint';
      if (claws < shell + 0.006 && z > 0.30) mat = 'claw';
      if (clawTips < d + 0.004 && z > 0.56 + P.clawFwd) mat = 'clawTip';
      if (stalks < d) { d = stalks; mat = 'stalk'; }
      if (eyes < d) { d = eyes; mat = 'eye'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'eye') {
        const localX = Math.abs(x) - 0.130;
        const localY = y - (0.218 + by + P.eyeBob);
        if (localY > 0.010 && localX < 0.012 && z > 0.318) return 'W';
        return 'k';
      }
      if (mat === 'stalk') return shade > 0.50 ? 'r3' : 'r1';
      if (mat === 'spine') return shade > 0.55 ? 'r4' : 'r3';
      if (mat === 'joint' || mat === 'clawTip') return shade > 0.42 ? 'b1' : 'b0';
      if (mat === 'leg') {
        // Pointed dark tips at the very bottom
        if (y < -0.34) return 'k';
        return shade > 0.78 ? 'r4' : shade > 0.56 ? 'r3' : shade > 0.34 ? 'r2' : shade > 0.16 ? 'r1' : 'r0';
      }
      if (mat === 'claw') {
        if (y < -0.05 + by) return shade > 0.45 ? 'b1' : 'b0';
        return shade > 0.84 ? 'r4' : shade > 0.64 ? 'r3' : shade > 0.40 ? 'r2' : shade > 0.18 ? 'r1' : 'r0';
      }

      // Pale cream underside sternum
      if (y < -0.115 + by) return shade > 0.45 ? 'b1' : 'b0';

      // Heart-carapace dorsal groove accents
      const groove = Math.abs(x) < 0.022 && z < 0.04 && z > -0.22 && y > 0.03 + by;
      const s = groove ? shade - 0.24 : shade;
      return s > 0.84 ? 'r4' : s > 0.64 ? 'r3' : s > 0.40 ? 'r2' : s > 0.18 ? 'r1' : 'r0';
    };

    pack = build27Pack(KING_CRAB_PW, KING_CRAB_PH, 1.32, 0.90, KING_CRAB_PAL, evalFn, shadeFn);
    kingCrabCache.set(pose, pack);
  }
  return pack;
}

export function getKingCrabPosePack(...args: Parameters<typeof buildKingCrabPosePack>): ReturnType<typeof buildKingCrabPosePack> {
  return registerAnimalSpritePack(buildKingCrabPosePack(...args), { module: './KingCrab.ts', factory: 'getKingCrabPosePack', args }, buildKingCrabPosePack);
}

const KING_CRAB_IDLE: readonly KingCrabPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const KING_CRAB_SCUTTLE: readonly KingCrabPoseName[] = ['scuttle0', 'scuttle1', 'scuttle2', 'scuttle3', 'scuttle4', 'scuttle5'];
const KING_CRAB_SNAP: readonly KingCrabPoseName[] = ['snap0', 'snap1', 'snap2'];

/**
 * Alaskan King Crab (Caranguejo-Rei): strides sideways on towering legs near pondCenter
 * and raises its huge spiny claws defensively if provoked.
 */
export class KingCrab extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private readonly home = new THREE.Vector3();
  private state: 'idle' | 'scuttle' | 'snap' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.4, 2.8);
  private moveDir = 1;
  private gaitPhase = rand(0, Math.PI * 2);

  constructor(ctx: GameContext, pos: THREE.Vector3, pondCenter?: THREE.Vector3) {
    super(ctx, getKingCrabPosePack('idle0').getView(2, 0)!, KING_CRAB_PW, KING_CRAB_PH, KING_CRAB_W, KING_CRAB_H, 'KingCrabBillboard');
    this.hp = 55;
    this.maxHp = 55;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.36;
    this.motor.height = 0.44;
    this.motor.teleport(pos);
    this.home.copy(pondCenter ?? pos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.42, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.set(this.position.x, this.position.y + 0.24, this.position.z);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y + 0.10, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.36, this.position.z);
    this.hurtboxes[0].enabled = this.alive;
    this.stickRoot.position.set(this.position.x, this.position.y + 0.24, this.position.z);
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
    this.vel.y = 2.6;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.state = 'snap';
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

        let vx = 0;
        let vz = 0;
        if (dist < 3.4 && this.state !== 'snap') {
          this.state = 'snap';
          this.stateT = 0;
          this.stateDur = 1.8;
        }

        if (this.state === 'idle') {
          if (this.stateT >= this.stateDur) {
            this.state = 'scuttle';
            this.stateT = 0;
            this.stateDur = rand(1.6, 3.2);
            this.moveDir = Math.random() < 0.5 ? 1 : -1;
            const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
            if (toHome > 5.8) {
              this.facing = Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) - this.moveDir * Math.PI * 0.5;
            } else {
              this.facing += rand(-0.9, 0.9);
            }
          }
        } else if (this.state === 'scuttle') {
          const sideYaw = this.facing + this.moveDir * Math.PI * 0.5;
          vx = Math.sin(sideYaw) * 1.55;
          vz = Math.cos(sideYaw) * 1.55;
          if (this.stateT >= this.stateDur) {
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.2, 2.4);
          }
        } else if (this.state === 'snap') {
          if (target && target.alive) {
            const toPlayer = Math.atan2(target.position.x - this.position.x, target.position.z - this.position.z);
            this.facing += angleDiff(this.facing, toPlayer) * Math.min(1, dt * 8);
          }
          if (this.stateT >= this.stateDur && dist > 4.2) {
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.2, 2.2);
          }
        }

        this.vel.x = damp(this.vel.x, vx, 9, dt);
        this.vel.z = damp(this.vel.z, vz, 9, dt);
        this.vel.y -= 20 * dt;
        this.motor.update(dt);

        const horiz = Math.hypot(this.vel.x, this.vel.z);
        if (horiz > 0.2 && this.motor.grounded) {
          this.gaitPhase += dt * 6.0 * (0.7 + horiz * 0.25);
        }
      }
      this.syncHurtbox();
    }

    let pose: KingCrabPoseName;
    if (!this.alive) pose = 'idle0';
    else if (this.state === 'snap') pose = pickCycle(KING_CRAB_SNAP, this.stateT * 4.8);
    else if (this.state === 'scuttle') pose = pickCycle(KING_CRAB_SCUTTLE, (this.gaitPhase / Math.PI) * 3.0);
    else pose = pickCycle(KING_CRAB_IDLE, this.stateT * 2.0);

    const deathSink = this.alive ? 0 : Math.min(0.18, this.deadT * 0.35);
    this.renderBillboard(getKingCrabPosePack(pose), this.position.y + 0.26 - deathSink, camera, drawingBufferSize);
  }
}
