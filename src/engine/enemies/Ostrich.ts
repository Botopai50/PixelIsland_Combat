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

// ============================================================================
// AVESTRUZ (African Male Ostrich) — Flagship 52×72 @ ANIMAL_PPU
// ============================================================================
export type OstrichPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'walk0' | 'walk1' | 'walk2' | 'walk3' | 'walk4' | 'walk5'
  | 'sprint0' | 'sprint1' | 'sprint2' | 'sprint3' | 'sprint4' | 'sprint5'
  | 'peck0' | 'peck1' | 'peck2';

export const OSTRICH_PW = 52;
export const OSTRICH_PH = 72;
export const OSTRICH_W = OSTRICH_PW / ANIMAL_PPU;
export const OSTRICH_H = OSTRICH_PH / ANIMAL_PPU;

/** 4-tone jet-black body plumage + snow-white wing/tail plumes + pinkish-tan bare neck/legs + golden bill. */
const OSTRICH_PAL: Record<string, [number, number, number]> = {
  k:  [0x12, 0x12, 0x16], // crisp 1px outline / huge dark eyes / toe claws
  b0: [0x18, 0x19, 0x20], // jet-black body plumage deep shadow
  b1: [0x28, 0x2a, 0x35], // charcoal-black body plumage mid-dark
  b2: [0x3e, 0x41, 0x50], // charcoal-slate feather midtone
  b3: [0x58, 0x5c, 0x6e], // glossy black plumage highlight
  w0: [0xb8, 0xb4, 0xa8], // white wing/tail plume shadow
  w1: [0xe0, 0xdd, 0xd4], // white plume midtone
  W:  [0xfd, 0xfc, 0xf8], // snow-white wing/tail plumes / neck ring / eye glint
  p0: [0xa8, 0x76, 0x68], // bare pinkish-tan neck & leg shadow
  p1: [0xd4, 0x9e, 0x8c], // bare pinkish-tan neck & leg midtone
  p2: [0xee, 0xc2, 0xb0], // bare pinkish-tan sunlit highlight
  y0: [0xb8, 0x86, 0x28], // golden-horn bill shadow
  y1: [0xe8, 0xb8, 0x48], // golden-horn bill highlight
};

interface OstrichPose {
  bodyY: number;
  bodyPitch: number;
  headY: number;
  headZ: number;
  headSway: number;
  wingFlare: number; // 0 = folded against flanks, 1 = flared out while sprinting!
  lSwing: number;
  rSwing: number;
  lLift: number;
  rLift: number;
}

const OSTRICH_POSES: Record<OstrichPoseName, OstrichPose> = {
  idle0: {
    bodyY: 0.0, bodyPitch: 0.0, headY: 0.0, headZ: 0.0, headSway: 0.0, wingFlare: 0.0,
    lSwing: 0.0, rSwing: 0.0, lLift: 0.0, rLift: 0.0,
  },
  idle1: {
    bodyY: 0.012, bodyPitch: 0.01, headY: 0.025, headZ: 0.01, headSway: 0.035, wingFlare: 0.04,
    lSwing: 0.0, rSwing: 0.0, lLift: 0.0, rLift: 0.0,
  },
  idle2: {
    bodyY: -0.010, bodyPitch: -0.01, headY: -0.018, headZ: 0.015, headSway: -0.035, wingFlare: 0.0,
    lSwing: 0.0, rSwing: 0.0, lLift: 0.0, rLift: 0.0,
  },

  // 6-frame high-stepping savanna walk
  walk0: {
    bodyY: 0.015, bodyPitch: 0.02, headY: -0.01, headZ: 0.04, headSway: 0.01, wingFlare: 0.08,
    lSwing: 0.22, rSwing: -0.18, lLift: 0.16, rLift: 0.0,
  },
  walk1: {
    bodyY: 0.025, bodyPitch: 0.03, headY: 0.01, headZ: 0.05, headSway: 0.0, wingFlare: 0.10,
    lSwing: 0.10, rSwing: -0.06, lLift: 0.06, rLift: 0.10,
  },
  walk2: {
    bodyY: -0.008, bodyPitch: 0.01, headY: -0.02, headZ: 0.03, headSway: -0.01, wingFlare: 0.06,
    lSwing: -0.06, rSwing: 0.12, lLift: 0.0, rLift: 0.16,
  },
  walk3: {
    bodyY: 0.015, bodyPitch: 0.02, headY: -0.01, headZ: 0.04, headSway: -0.01, wingFlare: 0.08,
    lSwing: -0.18, rSwing: 0.22, lLift: 0.0, rLift: 0.16,
  },
  walk4: {
    bodyY: 0.025, bodyPitch: 0.03, headY: 0.01, headZ: 0.05, headSway: 0.0, wingFlare: 0.10,
    lSwing: -0.06, rSwing: 0.10, lLift: 0.10, rLift: 0.06,
  },
  walk5: {
    bodyY: -0.008, bodyPitch: 0.01, headY: -0.02, headZ: 0.03, headSway: 0.01, wingFlare: 0.06,
    lSwing: 0.12, rSwing: -0.06, lLift: 0.16, rLift: 0.0,
  },

  // 6-frame fast long-striding sprint with white wing plumes flared!
  sprint0: {
    bodyY: 0.03, bodyPitch: 0.08, headY: -0.04, headZ: 0.12, headSway: 0.0, wingFlare: 0.85,
    lSwing: 0.36, rSwing: -0.32, lLift: 0.24, rLift: 0.12,
  },
  sprint1: {
    bodyY: 0.06, bodyPitch: 0.06, headY: -0.02, headZ: 0.14, headSway: 0.0, wingFlare: 1.0,
    lSwing: 0.22, rSwing: -0.14, lLift: 0.14, rLift: 0.22,
  },
  sprint2: {
    bodyY: -0.01, bodyPitch: 0.09, headY: -0.05, headZ: 0.11, headSway: 0.0, wingFlare: 0.78,
    lSwing: -0.14, rSwing: 0.24, lLift: 0.04, rLift: 0.26,
  },
  sprint3: {
    bodyY: 0.03, bodyPitch: 0.08, headY: -0.04, headZ: 0.12, headSway: 0.0, wingFlare: 0.85,
    lSwing: -0.32, rSwing: 0.36, lLift: 0.12, rLift: 0.24,
  },
  sprint4: {
    bodyY: 0.06, bodyPitch: 0.06, headY: -0.02, headZ: 0.14, headSway: 0.0, wingFlare: 1.0,
    lSwing: -0.14, rSwing: 0.22, lLift: 0.22, rLift: 0.14,
  },
  sprint5: {
    bodyY: -0.01, bodyPitch: 0.09, headY: -0.05, headZ: 0.11, headSway: 0.0, wingFlare: 0.78,
    lSwing: 0.24, rSwing: -0.14, lLift: 0.26, rLift: 0.04,
  },

  // 3-frame pecking at the ground
  peck0: {
    bodyY: -0.01, bodyPitch: 0.10, headY: -0.32, headZ: 0.16, headSway: 0.0, wingFlare: 0.05,
    lSwing: 0.04, rSwing: -0.04, lLift: 0.0, rLift: 0.0,
  },
  peck1: {
    bodyY: -0.02, bodyPitch: 0.15, headY: -0.68, headZ: 0.24, headSway: -0.02, wingFlare: 0.08,
    lSwing: 0.06, rSwing: -0.04, lLift: 0.0, rLift: 0.0,
  },
  peck2: {
    bodyY: -0.015, bodyPitch: 0.12, headY: -0.46, headZ: 0.20, headSway: 0.02, wingFlare: 0.06,
    lSwing: 0.05, rSwing: -0.04, lLift: 0.0, rLift: 0.0,
  },
};

const ostrichCache = new Map<OstrichPoseName, Boar27Pack>();

 function buildOstrichPosePack(pose: OstrichPoseName): Boar27Pack {
  let pack = ostrichCache.get(pose);
  if (!pack) {
    const P = OSTRICH_POSES[pose];
    const by = P.bodyY;

    const evalFn: SdfEvaluator = (x, y, z) => {
      const py = y - z * P.bodyPitch * 0.25;

      // 1. Plump rounded jet-black feathered body + fluffy snow-white wing-tip & tail plumes!
      const torso = sdEllipsoid(x, py, z, 0, 0.04 + by, -0.04, 0.23, 0.22, 0.30);
      const breast = sdEllipsoid(x, py, z, 0, 0.06 + by, 0.16, 0.20, 0.19, 0.18);
      // Crisp white feather collar ring at base of neck
      const neckCollar = sdEllipsoid(x, py, z, 0, 0.17 + by, 0.21, 0.095, 0.065, 0.095);

      // Fluffy wing-tip plumes (folded along flanks or flared out wide when sprinting!)
      const wf = P.wingFlare;
      const wOutX = 0.21 + wf * 0.18;
      const wOutY = 0.04 + by + wf * 0.10;
      const wingBlackL = sdCapsule(x, py, z, -0.18, 0.08 + by, 0.10, -wOutX, wOutY + 0.02, -0.06, 0.085, 0.075);
      const wingBlackR = sdCapsule(x, py, z,  0.18, 0.08 + by, 0.10,  wOutX, wOutY + 0.02, -0.06, 0.085, 0.075);
      const wingPlumeL = sdEllipsoid(x, py, z, -wOutX - 0.02, wOutY - 0.02, -0.16, 0.082 + wf * 0.04, 0.115, 0.145);
      const wingPlumeR = sdEllipsoid(x, py, z,  wOutX + 0.02, wOutY - 0.02, -0.16, 0.082 + wf * 0.04, 0.115, 0.145);

      // Fluffy snow-white tail plume on the rump!
      const tailPlume1 = sdEllipsoid(x, py, z, 0, 0.05 + by, -0.34, 0.145, 0.135, 0.145);
      const tailPlume2 = sdEllipsoid(x, py, z, 0, 0.01 + by, -0.44, 0.115, 0.105, 0.115);
      const tailPlume = smin(tailPlume1, tailPlume2, 0.04);

      const blackBody = smin(smin(torso, breast, 0.08), Math.min(wingBlackL, wingBlackR), 0.045);
      const whitePlumes = Math.min(neckCollar, Math.min(Math.min(wingPlumeL, wingPlumeR), tailPlume));

      // 2. Long upright bare pale pinkish-tan neck & small flat head
      const hy = 0.56 + by + P.headY;
      const hz = 0.25 + P.headZ;
      const hx = P.headSway;
      const nMidX = hx * 0.5;
      const nMidY = 0.36 + by + P.headY * 0.45;
      const nMidZ = 0.25 + P.headZ * 0.45;

      const neck1 = sdCapsule(x, y, z, 0, 0.17 + by, 0.21, nMidX, nMidY, nMidZ, 0.056, 0.046);
      const neck2 = sdCapsule(x, y, z, nMidX, nMidY, nMidZ, hx, hy - 0.02, hz - 0.02, 0.045, 0.042);
      const head = sdEllipsoid(x, y, z, hx, hy, hz, 0.072, 0.062, 0.088);
      const neckAndHead = smin(smin(neck1, neck2, 0.025), head, 0.025);

      // Flat golden-horn ostrich bill + huge expressive dark eyes with white glint
      const billDip = P.headY < -0.2 ? -0.05 : -0.015;
      const bill = sdCapsule(x, y, z, hx, hy - 0.015, hz + 0.06, hx, hy + billDip, hz + 0.18, 0.040, 0.024);

      const eyeL = sdEllipsoid(x, y, z, hx - 0.056, hy + 0.015, hz + 0.035, 0.024, 0.024, 0.024);
      const eyeR = sdEllipsoid(x, y, z, hx + 0.056, hy + 0.015, hz + 0.035, 0.024, 0.024, 0.024);
      const eyes = Math.min(eyeL, eyeR);

      const glintL = sdEllipsoid(x, y, z, hx - 0.064, hy + 0.024, hz + 0.050, 0.010, 0.010, 0.010);
      const glintR = sdEllipsoid(x, y, z, hx + 0.064, hy + 0.024, hz + 0.050, 0.010, 0.010, 0.010);
      const glints = Math.min(glintL, glintR);

      // 3. Long powerful bare pinkish-tan thighs & shins with strong 2-toed runner feet
      const ratiteLeg = (sx: number, swing: number, lift: number) => {
        const hipY = -0.06 + by, hipZ = -0.02;
        const hockY = -0.32 + by * 0.4 + lift * 0.45;
        const hockZ = -0.08 + swing * 0.45;
        const footY = -0.64 + lift;
        const footZ = -0.02 + swing;
        const thigh = sdCapsule(x, y, z, sx, hipY, hipZ, sx, hockY, hockZ, 0.072, 0.044);
        const shin = sdCapsule(x, y, z, sx, hockY, hockZ, sx, footY, footZ, 0.040, 0.030);
        const toeMain = sdCapsule(x, y, z, sx, footY - 0.01, footZ, sx, footY - 0.02, footZ + 0.11, 0.032, 0.022);
        return smin(smin(thigh, shin, 0.02), toeMain, 0.02);
      };

      const legs = Math.min(ratiteLeg(-0.11, P.lSwing, P.lLift), ratiteLeg(0.11, P.rSwing, P.rLift));
      const bareSkin = Math.min(neckAndHead, legs);

      let d = smin(blackBody, whitePlumes, 0.035);
      let mat = whitePlumes < blackBody + 0.01 ? 'white' : 'black';
      if (bareSkin < d) { d = bareSkin; mat = 'skin'; }
      if (bill < d) { d = bill; mat = 'bill'; }
      if (eyes < d) { d = eyes; mat = 'eye'; }
      if (glints < d) { d = glints; mat = 'glint'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'glint') return 'W';
      if (mat === 'eye') return 'k';
      if (mat === 'bill') return shade > 0.48 ? 'y1' : 'y0';
      if (mat === 'skin') {
        if (y < -0.63) return 'k'; // dark toe claw tips
        return shade > 0.68 ? 'p2' : shade > 0.34 ? 'p1' : 'p0';
      }
      const fluff = Math.sin(x * 24 + z * 18) * Math.cos(y * 22) * 0.055;
      const s = shade + fluff;
      if (mat === 'white') {
        return s > 0.65 ? 'W' : s > 0.34 ? 'w1' : 'w0';
      }
      return s > 0.78 ? 'b3' : s > 0.52 ? 'b2' : s > 0.25 ? 'b1' : 'b0';
    };

    pack = build27Pack(OSTRICH_PW, OSTRICH_PH, 0.98, 1.18, OSTRICH_PAL, evalFn, shadeFn);
    ostrichCache.set(pose, pack);
  }
  return pack;
}

export function getOstrichPosePack(...args: Parameters<typeof buildOstrichPosePack>): ReturnType<typeof buildOstrichPosePack> {
  return registerAnimalSpritePack(buildOstrichPosePack(...args), { module: './Ostrich.ts', factory: 'getOstrichPosePack', args }, buildOstrichPosePack);
}

// ============================================================================
// INSTÂNCIA NA ARENA (Ostrich)
// ============================================================================
const OST_IDLE: readonly OstrichPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const OST_WALK: readonly OstrichPoseName[] = ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'];
const OST_SPRINT: readonly OstrichPoseName[] = ['sprint0', 'sprint1', 'sprint2', 'sprint3', 'sprint4', 'sprint5'];
const OST_PECK: readonly OstrichPoseName[] = ['peck0', 'peck1', 'peck2', 'peck1'];

function pickCycle<T>(frames: readonly T[], idx: number): T {
  return sampleAnimalCycle(frames, idx);
}

export class Ostrich extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private readonly home = new THREE.Vector3();
  private state: 'idle' | 'peck' | 'walk' | 'sprint' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.6, 3.0);
  private targetYaw = rand(0, Math.PI * 2);
  private gaitPhase = rand(0, Math.PI * 2);

  private readonly centerY = 0.60;

  constructor(ctx: GameContext, startPos: THREE.Vector3) {
    super(ctx, getOstrichPosePack('idle0').getView(2, 0)!, OSTRICH_PW, OSTRICH_PH, OSTRICH_W, OSTRICH_H, 'OstrichBillboard');
    this.hp = 65;
    this.maxHp = 65;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.40;
    this.motor.height = 1.24;
    this.motor.teleport(startPos);
    this.home.copy(startPos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.46, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.set(this.position.x, this.position.y + this.centerY, this.position.z);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y + 0.28, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.96, this.position.z);
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
    this.vel.x += hit.dir.x * 4.2;
    this.vel.z += hit.dir.z * 4.2;
    this.vel.y = 3.2;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.state = 'sprint';
      this.stateT = 0;
      this.stateDur = 2.4;
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
        if (dist < 4.0 && this.state !== 'sprint') {
          this.state = 'sprint';
          this.stateT = 0;
          this.stateDur = 2.4;
        }

        if (this.state === 'idle') {
          if (this.stateT >= this.stateDur) {
            this.state = Math.random() < 0.42 ? 'peck' : 'walk';
            this.stateT = 0;
            this.stateDur = this.state === 'peck' ? rand(1.4, 2.4) : rand(2.2, 3.8);
            const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
            this.targetYaw = toHome > 9.0
              ? Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.5, 0.5)
              : this.facing + rand(-1.6, 1.6);
          }
        } else if (this.state === 'peck') {
          if (this.stateT >= this.stateDur) {
            this.state = 'walk';
            this.stateT = 0;
            this.stateDur = rand(2.0, 3.4);
          }
        } else if (this.state === 'walk') {
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 6);
          speed = 2.5;
          if (this.stateT >= this.stateDur && this.motor.grounded) {
            this.state = Math.random() < 0.45 ? 'peck' : 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.5, 2.8);
          }
        } else if (this.state === 'sprint') {
          if (target && target.alive) {
            this.targetYaw = Math.atan2(this.position.x - target.position.x, this.position.z - target.position.z);
            this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 9);
          }
          speed = 6.4;
          if (this.stateT >= this.stateDur && dist > 6.0 && this.motor.grounded) {
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.5, 2.6);
          }
        }

        this.vel.x = damp(this.vel.x, Math.sin(this.facing) * speed, 9, dt);
        this.vel.z = damp(this.vel.z, Math.cos(this.facing) * speed, 9, dt);
        this.vel.y -= 20 * dt;
        this.motor.update(dt);

        const horiz = Math.hypot(this.vel.x, this.vel.z);
        if (horiz > 0.25 && this.motor.grounded) {
          this.gaitPhase += dt * 6.0 * (0.65 + horiz * 0.22);
        }
      }
      this.syncHurtbox();
    }

    const horiz = Math.hypot(this.vel.x, this.vel.z);
    const bob = this.alive && this.motor.grounded && horiz > 0.25
      ? Math.abs(Math.sin(this.gaitPhase)) * 0.032
      : 0;

    let pose: OstrichPoseName;
    if (!this.alive) pose = 'idle0';
    else if (this.state === 'sprint') pose = pickCycle(OST_SPRINT, (this.gaitPhase / Math.PI) * 2.8);
    else if (this.state === 'peck') pose = pickCycle(OST_PECK, this.stateT * 2.8);
    else if (this.state === 'walk') pose = pickCycle(OST_WALK, (this.gaitPhase / Math.PI) * 2.6);
    else pose = pickCycle(OST_IDLE, this.stateT * 1.8);

    const deathSink = this.alive ? 0 : Math.min(0.28, this.deadT * 0.45);
    this.renderBillboard(getOstrichPosePack(pose), this.position.y + this.centerY + bob - deathSink, camera, drawingBufferSize);
  }
}
