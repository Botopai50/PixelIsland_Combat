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
import { damp, rand } from '../core/math';

function pickCycle<T>(frames: readonly T[], idx: number): T {
  return sampleAnimalCycle(frames, idx);
}

// ============================================================================
// LULA (Flagship Reef Squid) — 48×30
// ============================================================================
export type SquidPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'swim0' | 'swim1' | 'swim2' | 'swim3' | 'swim4' | 'swim5'
  | 'dart0' | 'dart1' | 'dart2' | 'dart3';

export const SQUID_PW = 48;
export const SQUID_PH = 30;
export const SQUID_W = SQUID_PW / ANIMAL_PPU;
export const SQUID_H = SQUID_PH / ANIMAL_PPU;

/**
 * Iridescent pearlescent rose-pink / pale-coral / lavender-white palette
 * with subtle chromatophore speckles, translucent lateral fins, and
 * pale silver-gold iris rings + white eye glint.
 */
const SQUID_PAL: Record<string, [number, number, number]> = {
  k:  [0x14, 0x0e, 0x1a], // crisp 1px dark outline / glossy dark pupil
  s0: [0x7c, 0x2c, 0x4e], // deep plum-rose underside & chromatophore speckles
  s1: [0xb8, 0x4c, 0x72], // rich reef-squid rose-coral shadow
  s2: [0xe4, 0x7c, 0x9c], // luminous pearlescent rose-pink midtone
  s3: [0xf5, 0xb4, 0xc8], // pale coral-blush highlight
  s4: [0xf6, 0xe8, 0xf6], // iridescent lavender-white dorsal sheen
  f0: [0xc8, 0x8a, 0xb4], // translucent lavender-rose fin shadow
  f1: [0xf2, 0xd4, 0xeb], // translucent pearlescent lateral fin highlight
  e:  [0xf2, 0xdf, 0x98], // pale silver-gold iris ring
  W:  [0xff, 0xff, 0xff], // crisp white eye glint
};

interface SquidPose {
  bodyY: number;
  mantlePulse: number; // radial pulse of mantle during jet swim
  finWave: number;     // vertical ripple of diamond lateral fins
  finTuck: number;     // 0 = wide diamond fins, 1 = sleek folded fins for dart
  armSpread: number;   // how wide the trailing arms flare
  armWave: number;     // phase of undulating arms & feeding tentacles
}

const SQUID_POSES: Record<SquidPoseName, SquidPose> = {
  idle0: { bodyY: 0.00,  mantlePulse: 0.00,  finWave: 0.00,  finTuck: 0.0,  armSpread: 0.14, armWave: 0.00 },
  idle1: { bodyY: 0.02,  mantlePulse: 0.015, finWave: 0.05,  finTuck: 0.0,  armSpread: 0.16, armWave: 1.20 },
  idle2: { bodyY: -0.02, mantlePulse: -0.01, finWave: -0.05, finTuck: 0.0,  armSpread: 0.12, armWave: 2.40 },

  swim0: { bodyY: 0.00,  mantlePulse: 0.025, finWave: 0.07,  finTuck: 0.15, armSpread: 0.18, armWave: 0.00 },
  swim1: { bodyY: 0.015, mantlePulse: 0.010, finWave: 0.03,  finTuck: 0.25, armSpread: 0.13, armWave: 1.05 },
  swim2: { bodyY: 0.02,  mantlePulse: -0.02, finWave: -0.04, finTuck: 0.35, armSpread: 0.08, armWave: 2.09 },
  swim3: { bodyY: 0.00,  mantlePulse: -0.025,finWave: -0.07, finTuck: 0.30, armSpread: 0.09, armWave: 3.14 },
  swim4: { bodyY: -0.015,mantlePulse: 0.00,  finWave: -0.02, finTuck: 0.15, armSpread: 0.14, armWave: 4.19 },
  swim5: { bodyY: -0.01, mantlePulse: 0.020, finWave: 0.05,  finTuck: 0.10, armSpread: 0.17, armWave: 5.24 },

  dart0: { bodyY: 0.00,  mantlePulse: -0.025,finWave: 0.02,  finTuck: 0.72, armSpread: 0.04, armWave: 0.00 },
  dart1: { bodyY: 0.01,  mantlePulse: -0.030,finWave: -0.02, finTuck: 0.80, armSpread: 0.03, armWave: 1.57 },
  dart2: { bodyY: 0.00,  mantlePulse: -0.025,finWave: 0.02,  finTuck: 0.78, armSpread: 0.04, armWave: 3.14 },
  dart3: { bodyY: -0.01, mantlePulse: -0.020,finWave: -0.02, finTuck: 0.70, armSpread: 0.05, armWave: 4.71 },
};

const SQUID_IDLE: readonly SquidPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const SQUID_SWIM: readonly SquidPoseName[] = ['swim0', 'swim1', 'swim2', 'swim3', 'swim4', 'swim5'];
const SQUID_DART: readonly SquidPoseName[] = ['dart0', 'dart1', 'dart2', 'dart3'];

const squidCache = new Map<SquidPoseName, Boar27Pack>();

 function buildSquidPosePack(pose: SquidPoseName): Boar27Pack {
  let pack = squidCache.get(pose);
  if (!pack) {
    const P = SQUID_POSES[pose];
    const by = P.bodyY;
    const mp = P.mantlePulse;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // 1. Sleek aerodynamic torpedo-shaped conical mantle tapering to a point (+Z)
      const mantleBase = sdCapsule(x, y, z, 0, by, -0.04, 0, by, 0.44, 0.155 + mp, 0.105 + mp * 0.5);
      const mantleTip = sdCapsule(x, y, z, 0, by, 0.42, 0, by, 0.78, 0.105 + mp * 0.5, 0.022);
      const mantle = smin(mantleBase, mantleTip, 0.05);

      // 2. Translucent diamond-shaped lateral fins flanking the rear/tapered mantle
      const finSpan = 0.34 - P.finTuck * 0.13;
      const finMidZ = 0.46 - P.finTuck * 0.06;
      const finY = by + P.finWave;
      let fins = 99;
      for (let side = -1; side <= 1; side += 2) {
        const finLead = sdCapsule(x, y, z, side * 0.05, by, 0.72, side * finSpan, finY, finMidZ, 0.024, 0.020);
        const finTrail = sdCapsule(x, y, z, side * finSpan, finY, finMidZ, side * 0.11, by, 0.24, 0.020, 0.022);
        const finWeb = sdCapsule(x, y, z, side * 0.09, by, 0.54, side * (finSpan * 0.65), finY * 0.6 + by * 0.4, finMidZ, 0.026, 0.022);
        const f = smin(smin(finLead, finTrail, 0.035), finWeb, 0.04);
        fins = Math.min(fins, f);
      }

      // 3. Distinct head collar & streamlined head
      const collar = sdEllipsoid(x, y, z, 0, by, -0.05, 0.155, 0.140, 0.055);
      const head = sdEllipsoid(x, y, z, 0, by, -0.17, 0.135, 0.125, 0.135);
      let body = smin(smin(mantle, collar, 0.03), head, 0.04);
      body = smin(body, fins, 0.03);

      // 4. Huge glossy dark eyes with pale silver-gold iris rings
      const eyeL = sdEllipsoid(x, y, z, -0.118, by + 0.015, -0.17, 0.052, 0.050, 0.050);
      const eyeR = sdEllipsoid(x, y, z,  0.118, by + 0.015, -0.17, 0.052, 0.050, 0.050);
      const eyes = Math.min(eyeL, eyeR);

      // 5. Streamlined cluster of 6 arms undulating behind (-Z)
      let arms = 99;
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2 + 0.52;
        const ax = Math.cos(ang);
        const ay = Math.sin(ang);
        const wave = Math.sin(P.armWave + i * 1.1) * 0.055;
        const midX = ax * (0.07 + P.armSpread * 0.55);
        const midY = by + ay * (0.06 + P.armSpread * 0.45) + wave * 0.5;
        const endX = ax * (0.04 + P.armSpread);
        const endY = by + ay * (0.04 + P.armSpread * 0.8) + wave;
        const seg1 = sdCapsule(x, y, z, ax * 0.055, by + ay * 0.05, -0.27, midX, midY, -0.46, 0.026, 0.020);
        const seg2 = sdCapsule(x, y, z, midX, midY, -0.46, endX, endY, -0.64, 0.020, 0.010);
        arms = Math.min(arms, smin(seg1, seg2, 0.016));
      }

      // 6. 2 longer club-tipped feeding tentacles undulating behind!
      let tentacles = 99;
      for (let side = -1; side <= 1; side += 2) {
        const w1 = Math.sin(P.armWave + side * 0.8) * 0.065;
        const w2 = Math.cos(P.armWave + side * 0.8) * 0.085;
        const mx = side * (0.07 + P.armSpread * 0.4);
        const my = by - 0.02 + w1;
        const ex = side * (0.09 + P.armSpread * 0.75);
        const ey = by - 0.01 + w2;
        const stalk1 = sdCapsule(x, y, z, side * 0.045, by - 0.02, -0.28, mx, my, -0.58, 0.020, 0.015);
        const stalk2 = sdCapsule(x, y, z, mx, my, -0.58, ex, ey, -0.84, 0.015, 0.013);
        // Distinctive club-shaped feeding tip!
        const club = sdEllipsoid(x, y, z, ex, ey, -0.88, 0.032, 0.024, 0.052);
        const tent = smin(smin(stalk1, stalk2, 0.015), club, 0.016);
        tentacles = Math.min(tentacles, tent);
      }

      body = smin(body, Math.min(arms, tentacles), 0.025);

      let d = body;
      let mat = 'body';
      if (fins < mantle + 0.008 && Math.abs(x) > 0.14 && z > 0.22) mat = 'fin';
      if (eyes < d) { d = eyes; mat = 'eye'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'eye') {
        // Huge glossy dark pupil + pale silver-gold iris ring + crisp white glint
        const dy = y - (by + 0.015);
        const dz = z - (-0.17);
        if (dy > 0.012 && dz > 0.006) return 'W';
        const r2 = dy * dy + dz * dz;
        if (r2 < 0.00085) return 'k';
        return 'e';
      }
      if (mat === 'fin') {
        return shade > 0.44 ? 'f1' : 'f0';
      }

      // Subtle chromatophore speckles along the dorsal mantle
      if (z > -0.02 && z < 0.68 && y > by - 0.02) {
        const speck = Math.sin(x * 46 + z * 34) * Math.cos(z * 52 - x * 28);
        if (speck > 0.72) return 's0';
      }

      // Iridescent pearlescent rose-pink / pale-coral / lavender-white shading
      return shade > 0.78 ? 's4' : shade > 0.56 ? 's3' : shade > 0.34 ? 's2' : shade > 0.16 ? 's1' : 's0';
    };

    pack = build27Pack(SQUID_PW, SQUID_PH, 1.04, 0.65, SQUID_PAL, evalFn, shadeFn);
    squidCache.set(pose, pack);
  }
  return pack;
}

export function getSquidPosePack(...args: Parameters<typeof buildSquidPosePack>): ReturnType<typeof buildSquidPosePack> {
  return registerAnimalSpritePack(buildSquidPosePack(...args), { module: './Squid.ts', factory: 'getSquidPosePack', args }, buildSquidPosePack);
}

/**
 * Reef Squid: hovers gracefully and jets in quick darting bursts around the pond.
 */
export class Squid extends BasePixelAnimal {
  readonly position = new THREE.Vector3();
  private readonly home = new THREE.Vector3();
  private readonly pondCenter = new THREE.Vector3();
  private readonly vel = new THREE.Vector3();
  private state: 'idle' | 'swim' | 'dart' = 'swim';
  private stateT = 0;
  private stateDur = rand(1.8, 3.4);
  private targetYaw = rand(0, Math.PI * 2);
  private swimAlt = rand(0.32, 0.62);

  constructor(ctx: GameContext, pos: THREE.Vector3, pondCenter?: THREE.Vector3) {
    super(ctx, getSquidPosePack('idle0').getView(2, 0)!, SQUID_PW, SQUID_PH, SQUID_W, SQUID_H, 'SquidBillboard');
    this.hp = 24;
    this.maxHp = 24;
    this.home.copy(pos);
    this.pondCenter.copy(pondCenter ?? pos);
    this.position.set(pos.x, pos.y + this.swimAlt, pos.z);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.30, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.copy(this.position);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y - 0.12, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.12, this.position.z);
    this.hurtboxes[0].enabled = this.alive;
    this.stickRoot.position.copy(this.position);
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
    this.vel.y = 1.5;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.state = 'dart';
      this.stateT = 0;
      this.stateDur = 1.4;
      this.targetYaw = Math.atan2(hit.dir.x, hit.dir.z);
    }
    return res;
  }

  update(dt: number, target: EnemyTarget | null, camera: THREE.Camera, drawingBufferSize?: THREE.Vector2) {
    if (dt > 0) {
      this.stateT += dt;
      this.flash = Math.max(0, this.flash - dt * 4.5);

      if (!this.alive) {
        this.deadT += dt;
        this.vel.x = damp(this.vel.x, 0, 4, dt);
        this.vel.z = damp(this.vel.z, 0, 4, dt);
        this.vel.y = damp(this.vel.y, -0.6, 3, dt);
        this.position.addScaledVector(this.vel, dt);
        if (this.position.y < this.home.y + 0.12) {
          this.position.y = this.home.y + 0.12;
          this.vel.y = 0;
        }
      } else {
        const dist = target && target.alive
          ? Math.hypot(target.position.x - this.position.x, target.position.z - this.position.z)
          : 999;

        if (dist < 3.4 && this.state !== 'dart') {
          this.state = 'dart';
          this.stateT = 0;
          this.stateDur = rand(1.0, 1.8);
          if (target) {
            this.targetYaw = Math.atan2(this.position.x - target.position.x, this.position.z - target.position.z) + rand(-0.4, 0.4);
          }
        } else if (this.stateT >= this.stateDur) {
          const r = Math.random();
          this.state = r < 0.25 ? 'idle' : r < 0.72 ? 'swim' : 'dart';
          this.stateT = 0;
          this.stateDur = this.state === 'dart' ? rand(0.9, 1.5) : rand(1.8, 3.2);
          const toPond = Math.hypot(this.pondCenter.x - this.position.x, this.pondCenter.z - this.position.z);
          this.targetYaw = toPond > 4.5
            ? Math.atan2(this.pondCenter.x - this.position.x, this.pondCenter.z - this.position.z) + rand(-0.6, 0.6)
            : this.facing + rand(-1.8, 1.8);
        }

        this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 7);
        const speed = this.state === 'dart' ? 4.4 : this.state === 'swim' ? 1.8 : 0.25;
        this.vel.x = damp(this.vel.x, Math.sin(this.facing) * speed, 6, dt);
        this.vel.z = damp(this.vel.z, Math.cos(this.facing) * speed, 6, dt);
        const desiredY = this.home.y + this.swimAlt + Math.sin(this.stateT * 2.8) * 0.08;
        this.vel.y = damp(this.vel.y, (desiredY - this.position.y) * 3.0, 5, dt);
        this.position.addScaledVector(this.vel, dt);
      }
      this.syncHurtbox();
    }

    let pose: SquidPoseName;
    if (!this.alive) pose = 'idle0';
    else if (this.state === 'dart') pose = pickCycle(SQUID_DART, this.stateT * 9.0);
    else if (this.state === 'swim') pose = pickCycle(SQUID_SWIM, this.stateT * 5.2);
    else pose = pickCycle(SQUID_IDLE, this.stateT * 2.2);

    this.renderBillboard(getSquidPosePack(pose), this.position.y, camera, drawingBufferSize);
  }
}
