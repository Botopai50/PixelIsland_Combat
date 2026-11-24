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
// BABUÍNO (Baboon) — 48×44 @ 56 PPU (0.86m × 0.79m)
// ============================================================================
export type BaboonPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'walk0' | 'walk1' | 'walk2' | 'walk3' | 'walk4' | 'walk5'
  | 'bark0' | 'bark1' | 'bark2'
  | 'lunge0' | 'lunge1' | 'lunge2' | 'lunge3';

export const BABOON_PW = 48;
export const BABOON_PH = 44;
export const BABOON_W = BABOON_PW / ANIMAL_PPU;
export const BABOON_H = BABOON_PH / ANIMAL_PPU;

const BABOON_PAL: Record<string, [number, number, number]> = {
  k:  [0x14, 0x12, 0x10], // crisp 1px dark outline / nose
  d0: [0x24, 0x20, 0x1e], // dark-charcoal muzzle & grasping hands shadow
  d1: [0x3d, 0x35, 0x32], // dark-charcoal muzzle & hands midtone
  f0: [0x4d, 0x45, 0x35], // deep olive-taupe shadow
  f1: [0x73, 0x67, 0x4f], // warm olive-taupe fur
  f2: [0x9c, 0x8e, 0x70], // silver-tan midtone
  f3: [0xc2, 0xb6, 0x98], // shaggy silver-ash shoulder cape highlight
  f4: [0xde, 0xd4, 0xbc], // bright silver-ash rim sheen
  r0: [0xb8, 0x32, 0x48], // rosy-red rump callosity shadow
  r1: [0xe8, 0x56, 0x6e], // vibrant rosy-pink/red rump callosity
  m:  [0x8a, 0x1e, 0x2e], // mouth interior on bark/lunge
  e:  [0xf2, 0xa8, 0x24], // intense amber eyes
  W:  [0xf7, 0xf4, 0xec], // sharp white canine fangs & eye glint
};

interface BaboonPose {
  bodyY: number;
  headY: number;
  headZ: number;
  headPitch: number;
  jawOpen: number;
  flSwing: number;
  flLift: number;
  frSwing: number;
  frLift: number;
  blSwing: number;
  blLift: number;
  brSwing: number;
  brLift: number;
  tailSway: number;
}

const BABOON_POSES: Record<BaboonPoseName, BaboonPose> = {
  idle0: {
    bodyY: 0.0, headY: 0.0, headZ: 0.0, headPitch: 0.0, jawOpen: 0.0,
    flSwing: 0.02, flLift: 0.0, frSwing: -0.02, frLift: 0.0,
    blSwing: -0.02, blLift: 0.0, brSwing: 0.02, brLift: 0.0,
    tailSway: 0.04,
  },
  idle1: {
    bodyY: 0.014, headY: 0.02, headZ: 0.01, headPitch: 0.06, jawOpen: 0.0,
    flSwing: 0.02, flLift: 0.0, frSwing: -0.02, frLift: 0.0,
    blSwing: -0.02, blLift: 0.0, brSwing: 0.02, brLift: 0.0,
    tailSway: 0.12,
  },
  idle2: {
    bodyY: -0.01, headY: -0.01, headZ: 0.015, headPitch: -0.04, jawOpen: 0.06,
    flSwing: 0.02, flLift: 0.0, frSwing: -0.02, frLift: 0.0,
    blSwing: -0.02, blLift: 0.0, brSwing: 0.02, brLift: 0.0,
    tailSway: -0.10,
  },

  // 6-frame agile quadrupedal primate gait
  walk0: {
    bodyY: 0.0, headY: -0.01, headZ: 0.03, headPitch: -0.03, jawOpen: 0.0,
    flSwing: 0.24, flLift: 0.14, frSwing: -0.18, frLift: 0.0,
    blSwing: -0.20, blLift: 0.0, brSwing: 0.20, brLift: 0.12,
    tailSway: 0.08,
  },
  walk1: {
    bodyY: 0.02, headY: 0.0, headZ: 0.04, headPitch: -0.02, jawOpen: 0.0,
    flSwing: 0.12, flLift: 0.04, frSwing: -0.06, frLift: 0.08,
    blSwing: -0.08, blLift: 0.08, brSwing: 0.10, brLift: 0.04,
    tailSway: 0.03,
  },
  walk2: {
    bodyY: -0.015, headY: -0.02, headZ: 0.03, headPitch: -0.04, jawOpen: 0.0,
    flSwing: -0.05, flLift: 0.0, frSwing: 0.12, frLift: 0.16,
    blSwing: 0.10, blLift: 0.14, brSwing: -0.05, brLift: 0.0,
    tailSway: -0.04,
  },
  walk3: {
    bodyY: 0.0, headY: -0.01, headZ: 0.03, headPitch: -0.03, jawOpen: 0.0,
    flSwing: -0.18, flLift: 0.0, frSwing: 0.24, frLift: 0.14,
    blSwing: 0.20, blLift: 0.12, brSwing: -0.20, brLift: 0.0,
    tailSway: -0.08,
  },
  walk4: {
    bodyY: 0.02, headY: 0.0, headZ: 0.04, headPitch: -0.02, jawOpen: 0.0,
    flSwing: -0.06, flLift: 0.08, frSwing: 0.12, frLift: 0.04,
    blSwing: 0.10, blLift: 0.04, brSwing: -0.08, brLift: 0.08,
    tailSway: -0.03,
  },
  walk5: {
    bodyY: -0.015, headY: -0.02, headZ: 0.03, headPitch: -0.04, jawOpen: 0.0,
    flSwing: 0.12, flLift: 0.16, frSwing: -0.05, frLift: 0.0,
    blSwing: -0.05, blLift: 0.0, brSwing: 0.10, brLift: 0.14,
    tailSway: 0.04,
  },

  // 3-frame fierce fanged threat bark
  bark0: {
    bodyY: -0.02, headY: 0.03, headZ: 0.04, headPitch: 0.10, jawOpen: 0.55,
    flSwing: 0.08, flLift: 0.0, frSwing: 0.04, frLift: 0.0,
    blSwing: -0.04, blLift: 0.0, brSwing: -0.04, brLift: 0.0,
    tailSway: 0.10,
  },
  bark1: {
    bodyY: -0.03, headY: 0.06, headZ: 0.06, headPitch: 0.22, jawOpen: 1.0,
    flSwing: 0.12, flLift: 0.04, frSwing: 0.08, frLift: 0.0,
    blSwing: -0.06, blLift: 0.0, brSwing: -0.06, brLift: 0.0,
    tailSway: -0.10,
  },
  bark2: {
    bodyY: -0.02, headY: 0.04, headZ: 0.05, headPitch: 0.14, jawOpen: 0.80,
    flSwing: 0.10, flLift: 0.0, frSwing: 0.06, frLift: 0.0,
    blSwing: -0.05, blLift: 0.0, brSwing: -0.05, brLift: 0.0,
    tailSway: 0.06,
  },

  // 4-frame primate lunge
  lunge0: {
    bodyY: -0.09, headY: -0.07, headZ: 0.05, headPitch: -0.06, jawOpen: 0.45,
    flSwing: 0.12, flLift: 0.0, frSwing: 0.08, frLift: 0.0,
    blSwing: 0.14, blLift: 0.0, brSwing: 0.10, brLift: 0.0,
    tailSway: 0.10,
  },
  lunge1: {
    bodyY: 0.05, headY: 0.0, headZ: 0.10, headPitch: 0.02, jawOpen: 0.92,
    flSwing: 0.36, flLift: 0.42, frSwing: 0.28, frLift: 0.34,
    blSwing: -0.28, blLift: 0.20, brSwing: -0.24, brLift: 0.16,
    tailSway: 0.0,
  },
  lunge2: {
    bodyY: 0.03, headY: -0.02, headZ: 0.12, headPitch: -0.04, jawOpen: 1.0,
    flSwing: 0.42, flLift: 0.46, frSwing: 0.34, frLift: 0.38,
    blSwing: -0.32, blLift: 0.26, brSwing: -0.28, brLift: 0.20,
    tailSway: 0.0,
  },
  lunge3: {
    bodyY: -0.05, headY: -0.05, headZ: 0.06, headPitch: -0.06, jawOpen: 0.35,
    flSwing: 0.22, flLift: 0.04, frSwing: 0.18, frLift: 0.02,
    blSwing: -0.10, blLift: 0.14, brSwing: -0.06, brLift: 0.10,
    tailSway: -0.06,
  },
};

const baboonCache = new Map<BaboonPoseName, Boar27Pack>();
 function buildBaboonPosePack(pose: BaboonPoseName): Boar27Pack {
  let pack = baboonCache.get(pose);
  if (!pack) {
    const P = BABOON_POSES[pose];
    const by = P.bodyY;
    const hPivotY = 0.22 + by + P.headY;
    const hPivotZ = 0.36 + P.headZ;
    const cosP = Math.cos(P.headPitch);
    const sinP = Math.sin(P.headPitch);
    const jawDrop = P.jawOpen * 0.13;
    const jawBack = P.jawOpen * 0.03;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // 1. Quadrupedal primate torso: shaggy shoulder cape mane, narrow waist, sloping rump
      const cape = sdEllipsoid(x, y, z, 0, 0.10 + by, 0.16, 0.215, 0.21, 0.245);
      const waist = sdEllipsoid(x, y, z, 0, 0.04 + by, -0.10, 0.138, 0.142, 0.22);
      const rump = sdEllipsoid(x, y, z, 0, 0.02 + by, -0.32, 0.168, 0.172, 0.195);

      // Vibrant rosy-pink/red rump callosities
      const padL = sdEllipsoid(x, y, z, -0.068, 0.00 + by, -0.46, 0.068, 0.088, 0.052);
      const padR = sdEllipsoid(x, y, z,  0.068, 0.00 + by, -0.46, 0.068, 0.088, 0.052);
      const rumpPads = Math.min(padL, padR);

      let fur = smin(cape, waist, 0.09);
      fur = smin(fur, rump, 0.09);

      // 2. Baboon head in local pitch-rotated space: overhanging brow, cheek ruffs, long dog-like muzzle
      const dy = y - hPivotY;
      const dz = z - hPivotZ;
      const lx = x;
      const lz = dz * cosP + dy * sinP;
      const ly = -dz * sinP + dy * cosP;

      const skull = sdEllipsoid(lx, ly, lz, 0, 0.02, 0.0, 0.132, 0.128, 0.145);
      const cheekL = sdEllipsoid(lx, ly, lz, -0.125, -0.02, -0.01, 0.085, 0.088, 0.095);
      const cheekR = sdEllipsoid(lx, ly, lz,  0.125, -0.02, -0.01, 0.085, 0.088, 0.095);
      const brow = sdCapsule(lx, ly, lz, -0.085, 0.075, 0.115, 0.085, 0.075, 0.115, 0.040, 0.040);
      const earL = sdEllipsoid(lx, ly, lz, -0.125, 0.06, -0.03, 0.036, 0.044, 0.026);
      const earR = sdEllipsoid(lx, ly, lz,  0.125, 0.06, -0.03, 0.036, 0.044, 0.026);

      // Long dog-like dark-charcoal muzzle & hinged lower jaw
      const muzzle = sdCapsule(lx, ly, lz, 0, -0.005, 0.09, 0, -0.030, 0.305, 0.072, 0.046);
      const lowerJaw = sdCapsule(lx, ly, lz, 0, -0.055, 0.08, 0, -0.064 - jawDrop, 0.275 - jawBack, 0.054, 0.034);
      const snoutD = smin(muzzle, lowerJaw, P.jawOpen > 0.2 ? 0.018 : 0.036);

      let headD = smin(skull, Math.min(cheekL, cheekR), 0.045);
      headD = smin(headD, brow, 0.028);
      headD = smin(headD, Math.min(earL, earR), 0.02);
      headD = smin(headD, snoutD, 0.035);
      fur = smin(fur, headD, 0.055);

      // 3. Long agile primate arms & legs with dark grasping hands/feet
      let hands = 99;
      const limb = (sx: number, baseZ: number, swing: number, lift: number) => {
        const topY = 0.02 + by;
        const midY = -0.24 + by * 0.45 + lift * 0.18;
        const midZ = baseZ + swing * 0.46;
        const pawY = -0.52 + lift * 0.30;
        const pawZ = baseZ + swing * 1.00;
        const upper = sdCapsule(x, y, z, sx, topY, baseZ, sx, midY, midZ, 0.072, 0.048);
        const lower = sdCapsule(x, y, z, sx, midY, midZ, sx, pawY, pawZ, 0.046, 0.036);
        const hand = sdEllipsoid(x, y, z, sx, pawY - 0.012, pawZ + 0.042, 0.048, 0.030, 0.068);
        hands = Math.min(hands, hand);
        return smin(smin(upper, lower, 0.028), hand, 0.022);
      };
      const legs = Math.min(
        Math.min(limb(-0.145, 0.18, P.flSwing, P.flLift), limb(0.145, 0.18, P.frSwing, P.frLift)),
        Math.min(limb(-0.14, -0.30, P.blSwing, P.blLift), limb(0.14, -0.30, P.brSwing, P.brLift)),
      );
      fur = smin(fur, legs, 0.042);

      // 4. Iconic arched baboon tail (rises steeply from rump then curves down!)
      const tArchX = P.tailSway * 0.4;
      const tArchY = 0.28 + by * 0.6;
      const tArchZ = -0.54;
      const tTipX = P.tailSway;
      const tTipY = -0.14 + by * 0.3;
      const tTipZ = -0.76;
      const tailUp = sdCapsule(x, y, z, 0, 0.08 + by, -0.44, tArchX, tArchY, tArchZ, 0.044, 0.038);
      const tailDown = sdCapsule(x, y, z, tArchX, tArchY, tArchZ, tTipX, tTipY, tTipZ, 0.038, 0.026);
      fur = smin(fur, smin(tailUp, tailDown, 0.035), 0.04);

      // 5. Close-set intense amber eyes, dark nose, crimson mouth & sharp white canine fangs
      const eyeL = sdEllipsoid(lx, ly, lz, -0.048, 0.044, 0.132, 0.024, 0.022, 0.024);
      const eyeR = sdEllipsoid(lx, ly, lz,  0.048, 0.044, 0.132, 0.024, 0.022, 0.024);
      const eyes = Math.min(eyeL, eyeR);
      const nose = sdEllipsoid(lx, ly, lz, 0, -0.022, 0.335, 0.036, 0.026, 0.026);

      let mouth = 99;
      let fangs = 99;
      if (P.jawOpen > 0.18) {
        mouth = sdEllipsoid(lx, ly, lz, 0, -0.050 - jawDrop * 0.42, 0.21, 0.046, 0.024 + jawDrop * 0.44, 0.076);
        const fL = sdCapsule(lx, ly, lz, -0.032, -0.042, 0.265, -0.032, -0.095, 0.265, 0.013, 0.005);
        const fR = sdCapsule(lx, ly, lz,  0.032, -0.042, 0.265,  0.032, -0.095, 0.265, 0.013, 0.005);
        fangs = Math.min(fL, fR);
      }

      let d = fur, mat = 'fur';
      if (snoutD < fur + 0.006 && lz > 0.12) mat = 'muzzle';
      if (hands < fur + 0.006 && y < -0.44) mat = 'hand';
      if (rumpPads < d) { d = rumpPads; mat = 'rumpPad'; }
      if (mouth < d) { d = mouth; mat = 'mouth'; }
      if (fangs < d) { d = fangs; mat = 'fang'; }
      if (eyes < d) { d = eyes; mat = 'eye'; }
      if (nose < d) { d = nose; mat = 'nose'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'nose') return 'k';
      if (mat === 'mouth') return 'm';
      if (mat === 'fang') return 'W';
      if (mat === 'rumpPad') return shade > 0.42 ? 'r1' : 'r0';
      if (mat === 'muzzle' || mat === 'hand') return shade > 0.46 ? 'd1' : 'd0';
      if (mat === 'eye') {
        const dy = y - hPivotY;
        const dz = z - hPivotZ;
        const ly = -dz * sinP + dy * cosP;
        if (ly > 0.052 && Math.abs(x) > 0.042) return 'W';
        return 'e';
      }

      // Shaggy silver-ash shoulder cape highlight
      if (z > 0.0 && z < 0.34 && y > -0.04 + by) {
        return shade > 0.78 ? 'f4' : shade > 0.48 ? 'f3' : shade > 0.24 ? 'f2' : 'f1';
      }

      return shade > 0.80 ? 'f3' : shade > 0.50 ? 'f2' : shade > 0.24 ? 'f1' : 'f0';
    };

    pack = build27Pack(BABOON_PW, BABOON_PH, 1.02, 0.90, BABOON_PAL, evalFn, shadeFn);
    baboonCache.set(pose, pack);
  }
  return pack;
}

export function getBaboonPosePack(...args: Parameters<typeof buildBaboonPosePack>): ReturnType<typeof buildBaboonPosePack> {
  return registerAnimalSpritePack(buildBaboonPosePack(...args), { module: './Baboon.ts', factory: 'getBaboonPosePack', args }, buildBaboonPosePack);
}

// ============================================================================
// INSTÂNCIA NA ARENA (Baboon)
// ============================================================================
const BABOON_IDLE: readonly BaboonPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const BABOON_WALK: readonly BaboonPoseName[] = ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'];
const BABOON_BARK: readonly BaboonPoseName[] = ['bark0', 'bark1', 'bark2', 'bark1'];
const BABOON_LUNGE: readonly BaboonPoseName[] = ['lunge0', 'lunge1', 'lunge2', 'lunge3'];

/**
 * Baboon: patrols on all fours, barks fiercely with bared fangs, and lunges if provoked.
 */
export class Baboon extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private readonly home = new THREE.Vector3();
  private state: 'idle' | 'walk' | 'bark' | 'lunge' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.4, 2.6);
  private targetYaw = rand(0, Math.PI * 2);
  private gaitPhase = rand(0, Math.PI * 2);
  private provoked = false;

  constructor(ctx: GameContext, pos: THREE.Vector3) {
    super(ctx, getBaboonPosePack('idle0').getView(2, 0)!, BABOON_PW, BABOON_PH, BABOON_W, BABOON_H, 'BaboonBillboard');
    this.hp = 60;
    this.maxHp = 60;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.38;
    this.motor.height = 0.76;
    this.motor.teleport(pos);
    this.home.copy(pos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.42, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.set(this.position.x, this.position.y + 0.38, this.position.z);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y + 0.18, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.58, this.position.z);
    this.hurtboxes[0].enabled = this.alive;
    this.stickRoot.position.set(this.position.x, this.position.y + 0.38, this.position.z);
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
    this.vel.y = 3.0;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.provoked = true;
      this.state = 'bark';
      this.stateT = 0;
      this.stateDur = 1.2;
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
        const aggroDist = this.provoked ? 6.0 : 3.2;
        if (dist < 2.0 && this.state !== 'lunge') {
          this.state = 'lunge';
          this.stateT = 0;
          this.stateDur = 0.95;
        } else if (dist < aggroDist && this.state === 'idle' && this.stateT > 0.5) {
          this.state = 'bark';
          this.stateT = 0;
          this.stateDur = 1.2;
        }

        if (this.state === 'idle') {
          if (this.stateT >= this.stateDur) {
            this.state = 'walk';
            this.stateT = 0;
            this.stateDur = rand(1.8, 3.4);
            const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
            this.targetYaw = toHome > 8.0
              ? Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.5, 0.5)
              : this.facing + rand(-1.5, 1.5);
          }
        } else if (this.state === 'walk') {
          if (this.provoked && target && target.alive && dist < 6.5) {
            this.targetYaw = Math.atan2(target.position.x - this.position.x, target.position.z - this.position.z);
            speed = 3.8;
          } else {
            speed = 2.2;
          }
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 7);
          if (this.stateT >= this.stateDur) {
            this.provoked = false;
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.2, 2.4);
          }
        } else if (this.state === 'bark') {
          if (target && target.alive) {
            const toPlayer = Math.atan2(target.position.x - this.position.x, target.position.z - this.position.z);
            this.facing += angleDiff(this.facing, toPlayer) * Math.min(1, dt * 9);
          }
          if (this.stateT >= this.stateDur) {
            this.state = this.provoked ? 'walk' : 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.4, 2.4);
          }
        } else if (this.state === 'lunge') {
          if (target && target.alive) {
            const toPlayer = Math.atan2(target.position.x - this.position.x, target.position.z - this.position.z);
            this.facing += angleDiff(this.facing, toPlayer) * Math.min(1, dt * 11);
          }
          speed = 4.6;
          if (this.stateT >= this.stateDur) {
            this.state = dist < aggroDist ? 'bark' : 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.0, 1.8);
          }
        }

        this.vel.x = damp(this.vel.x, Math.sin(this.facing) * speed, 9, dt);
        this.vel.z = damp(this.vel.z, Math.cos(this.facing) * speed, 9, dt);
        this.vel.y -= 20 * dt;
        this.motor.update(dt);

        const horiz = Math.hypot(this.vel.x, this.vel.z);
        if (horiz > 0.2 && this.motor.grounded) {
          this.gaitPhase += dt * 7.0 * (0.65 + horiz * 0.22);
        }
      }
      this.syncHurtbox();
    }

    let pose: BaboonPoseName;
    if (!this.alive) pose = 'idle0';
    else if (this.state === 'lunge') pose = pickCycle(BABOON_LUNGE, this.stateT * 5.0);
    else if (this.state === 'bark') pose = pickCycle(BABOON_BARK, this.stateT * 4.0);
    else if (this.state === 'walk') pose = pickCycle(BABOON_WALK, (this.gaitPhase / Math.PI) * 2.8);
    else pose = pickCycle(BABOON_IDLE, this.stateT * 2.0);

    const bob = this.alive && this.motor.grounded && (this.state === 'walk' || this.state === 'lunge')
      ? Math.abs(Math.sin(this.gaitPhase)) * 0.028
      : 0;
    const deathSink = this.alive ? 0 : Math.min(0.20, this.deadT * 0.4);
    this.renderBillboard(getBaboonPosePack(pose), this.position.y + 0.38 + bob - deathSink, camera, drawingBufferSize);
  }
}
