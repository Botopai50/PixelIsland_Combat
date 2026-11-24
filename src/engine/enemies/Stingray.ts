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
// ARRAIA-DE-PINTAS-AZUIS (Blue-Spotted Stingray) — 64×32 @ 56 PPU (1.14m × 0.57m)
// ============================================================================
export type StingrayPoseName =
  | 'glide0' | 'glide1' | 'glide2' | 'glide3' | 'glide4' | 'glide5'
  | 'rest0' | 'rest1' | 'rest2';

export const STINGRAY_PW = 64;
export const STINGRAY_PH = 32;
export const STINGRAY_W = STINGRAY_PW / ANIMAL_PPU;
export const STINGRAY_H = STINGRAY_PH / ANIMAL_PPU;

const STINGRAY_PAL: Record<string, [number, number, number]> = {
  k:  [0x10, 0x16, 0x1e], // crisp 1px dark outline / glossy eye
  r0: [0x1d, 0x36, 0x3d], // deep ocean-slate shadow
  r1: [0x2e, 0x52, 0x57], // rich olive-teal disc base
  r2: [0x44, 0x73, 0x75], // warm ocean-teal midtone
  r3: [0x63, 0x99, 0x96], // sunlit teal highlight
  r4: [0x8a, 0xc2, 0xba], // crisp wet top sheen
  c0: [0x18, 0xb8, 0xd8], // electric turquoise-cyan spot edge
  c1: [0x66, 0xf2, 0xff], // luminous electric turquoise-cyan spot center
  w0: [0xc7, 0xd2, 0xd9], // cream-white underside shadow
  W:  [0xf6, 0xf7, 0xf2], // pure cream-white underside, venomous barb & eye glint
};

interface StingrayPose {
  bodyY: number;
  wavePhase: number;
  waveAmp: number;
  tailSway: number;
  tailLift: number;
}

const STINGRAY_POSES: Record<StingrayPoseName, StingrayPose> = {
  // 6-frame graceful undulating wing-wave swimming
  glide0: { bodyY:  0.00, wavePhase: 0.00, waveAmp: 0.14, tailSway:  0.06, tailLift:  0.02 },
  glide1: { bodyY:  0.02, wavePhase: 1.05, waveAmp: 0.14, tailSway:  0.10, tailLift:  0.04 },
  glide2: { bodyY:  0.01, wavePhase: 2.09, waveAmp: 0.14, tailSway:  0.04, tailLift:  0.02 },
  glide3: { bodyY: -0.01, wavePhase: 3.14, waveAmp: 0.14, tailSway: -0.06, tailLift: -0.02 },
  glide4: { bodyY: -0.02, wavePhase: 4.19, waveAmp: 0.14, tailSway: -0.10, tailLift: -0.04 },
  glide5: { bodyY:  0.00, wavePhase: 5.24, waveAmp: 0.14, tailSway: -0.04, tailLift: -0.01 },

  // 3-frame flat calm rest on the pond floor
  rest0:  { bodyY: -0.04, wavePhase: 0.0,  waveAmp: 0.01, tailSway:  0.02, tailLift: -0.03 },
  rest1:  { bodyY: -0.03, wavePhase: 1.5,  waveAmp: 0.02, tailSway:  0.06, tailLift: -0.02 },
  rest2:  { bodyY: -0.04, wavePhase: 3.0,  waveAmp: 0.01, tailSway: -0.04, tailLift: -0.03 },
};

const stingrayCache = new Map<StingrayPoseName, Boar27Pack>();
 function buildStingrayPosePack(pose: StingrayPoseName): Boar27Pack {
  let pack = stingrayCache.get(pose);
  if (!pack) {
    const P = STINGRAY_POSES[pose];
    const by = P.bodyY;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // Smooth travelling wing-wave across the pectoral disc (NO gaps or dark seams!)
      const edgeFactor = Math.min(1.0, Math.max(0.0, (Math.abs(x) - 0.08) * 1.45));
      const wingWave = Math.sin(z * 4.4 + P.wavePhase) * edgeFactor * P.waveAmp;
      const wy = y - by - wingWave;

      // 1. Wide diamond / wing-shaped continuous pectoral disc + raised central dorsal ridge
      const disc = sdEllipsoid(x, wy, z, 0, 0.0, 0.06, 0.72, 0.065, 0.44);
      const nose = sdEllipsoid(x, wy, z, 0, 0.0, 0.36, 0.24, 0.058, 0.22);
      const core = sdEllipsoid(x, y - by, z, 0, 0.045, 0.08, 0.22, 0.095, 0.34);

      let body = smin(disc, nose, 0.10);
      body = smin(body, core, 0.08);

      // 2. Long slender whip-like tail with sharp pale venomous barb spine!
      const t1X = P.tailSway * 0.45;
      const t1Y = -0.01 + by + P.tailLift * 0.45;
      const t1Z = -0.70;
      const t2X = P.tailSway;
      const t2Y = -0.02 + by + P.tailLift * 0.90;
      const t2Z = -1.16;
      const tail1 = sdCapsule(x, y, z, 0, 0.0 + by, -0.30, t1X, t1Y, t1Z, 0.056, 0.032);
      const tail2 = sdCapsule(x, y, z, t1X, t1Y, t1Z, t2X, t2Y, t2Z, 0.030, 0.014);
      const tailD = smin(tail1, tail2, 0.03);
      body = smin(body, tailD, 0.05);

      // Sharp venomous barb spine rising cleanly from the upper tail
      const barb = sdCapsule(x, y, z, t1X * 0.85, t1Y + 0.02, -0.62, t1X * 1.05, t1Y + 0.10, -0.82, 0.018, 0.006);

      // 3. Prominent raised periscope eyes
      const eyeL = sdEllipsoid(x, y, z, -0.095, 0.105 + by, 0.24, 0.034, 0.032, 0.036);
      const eyeR = sdEllipsoid(x, y, z,  0.095, 0.105 + by, 0.24, 0.034, 0.032, 0.036);
      const eyes = Math.min(eyeL, eyeR);

      let d = body, mat = 'body';
      if (barb < d) { d = barb; mat = 'barb'; }
      if (eyes < d) { d = eyes; mat = 'eye'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'barb') return 'W';
      if (mat === 'eye') {
        if (y > 0.115 + by && Math.abs(x) > 0.088) return 'W';
        return 'k';
      }

      // Pure cream-white underside
      const edgeFactor = Math.min(1.0, Math.max(0.0, (Math.abs(x) - 0.08) * 1.45));
      const wingWave = Math.sin(z * 4.4 + P.wavePhase) * edgeFactor * P.waveAmp;
      if (y - by - wingWave < -0.028) {
        return shade > 0.42 ? 'W' : 'w0';
      }

      // Luminous electric turquoise-cyan spots across the dorsal disc!
      if (z > -0.34 && z < 0.46 && Math.abs(x) < 0.64) {
        const s1 = Math.sin(x * 22.0) * Math.sin(z * 22.0 + 0.5);
        const s2 = Math.cos(x * 16.0 + 0.8) * Math.cos(z * 17.0 - 0.4);
        if (s1 > 0.68 || s2 > 0.74) return 'c1';
        if (s1 > 0.56 || s2 > 0.64) return 'c0';
      }

      // Rich deep ocean-slate / warm olive-teal dorsal disc
      if (shade > 0.84) return 'r4';
      return shade > 0.60 ? 'r3' : shade > 0.36 ? 'r2' : shade > 0.16 ? 'r1' : 'r0';
    };

    pack = build27Pack(STINGRAY_PW, STINGRAY_PH, 1.24, 0.60, STINGRAY_PAL, evalFn, shadeFn);
    stingrayCache.set(pose, pack);
  }
  return pack;
}

export function getStingrayPosePack(...args: Parameters<typeof buildStingrayPosePack>): ReturnType<typeof buildStingrayPosePack> {
  return registerAnimalSpritePack(buildStingrayPosePack(...args), { module: './Stingray.ts', factory: 'getStingrayPosePack', args }, buildStingrayPosePack);
}

// ============================================================================
// INSTÂNCIA NA ARENA (Stingray)
// ============================================================================
const STINGRAY_GLIDE: readonly StingrayPoseName[] = ['glide0', 'glide1', 'glide2', 'glide3', 'glide4', 'glide5'];
const STINGRAY_REST: readonly StingrayPoseName[] = ['rest0', 'rest1', 'rest0', 'rest2'];

/**
 * Blue-Spotted Stingray: glides gracefully like an underwater bird around pondCenter.
 */
export class Stingray extends BasePixelAnimal {
  readonly position = new THREE.Vector3();
  private readonly home = new THREE.Vector3();
  private readonly vel = new THREE.Vector3();
  private orbitAngle = rand(0, Math.PI * 2);
  private orbitRadius = rand(1.6, 3.0);
  private state: 'glide' | 'rest' = 'glide';
  private stateT = 0;
  private stateDur = rand(3.5, 6.0);
  private swimT = rand(0, 10);

  constructor(ctx: GameContext, pos: THREE.Vector3, pondCenter?: THREE.Vector3) {
    super(ctx, getStingrayPosePack('glide0').getView(2, 0)!, STINGRAY_PW, STINGRAY_PH, STINGRAY_W, STINGRAY_H, 'StingrayBillboard');
    this.hp = 55;
    this.maxHp = 55;
    this.home.copy(pondCenter ?? pos);
    this.position.set(
      this.home.x + Math.cos(this.orbitAngle) * this.orbitRadius,
      this.home.y + 0.16,
      this.home.z + Math.sin(this.orbitAngle) * this.orbitRadius,
    );
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.42, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.copy(this.position);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y - 0.14, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.14, this.position.z);
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
    this.vel.x += hit.dir.x * 3.5;
    this.vel.z += hit.dir.z * 3.5;
    this.vel.y = 1.8;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.state = 'glide';
      this.stateT = 0;
      this.stateDur = 3.5;
    }
    return res;
  }

  update(dt: number, _target: EnemyTarget | null, camera: THREE.Camera, drawingBufferSize?: THREE.Vector2) {
    if (dt > 0) {
      this.stateT += dt;
      this.swimT += dt;
      this.flash = Math.max(0, this.flash - dt * 4.5);

      if (!this.alive) {
        this.deadT += dt;
        this.vel.x = damp(this.vel.x, 0, 5, dt);
        this.vel.z = damp(this.vel.z, 0, 5, dt);
        this.vel.y = damp(this.vel.y, 0, 5, dt);
        this.position.addScaledVector(this.vel, dt);
        this.position.y = damp(this.position.y, this.home.y + 0.08, 4, dt);
      } else {
        if (this.state === 'glide' && this.stateT >= this.stateDur) {
          this.state = 'rest';
          this.stateT = 0;
          this.stateDur = rand(1.8, 3.2);
        } else if (this.state === 'rest' && this.stateT >= this.stateDur) {
          this.state = 'glide';
          this.stateT = 0;
          this.stateDur = rand(3.5, 6.0);
        }

        if (this.state === 'glide') {
          this.orbitAngle += 0.56 * dt;
          const targetX = this.home.x + Math.cos(this.orbitAngle) * this.orbitRadius;
          const targetZ = this.home.z + Math.sin(this.orbitAngle) * this.orbitRadius;
          const targetY = this.home.y + 0.18 + Math.sin(this.swimT * 2.4) * 0.07;

          this.vel.x = damp(this.vel.x, (targetX - this.position.x) * 2.8, 5, dt);
          this.vel.y = damp(this.vel.y, (targetY - this.position.y) * 4.0, 5, dt);
          this.vel.z = damp(this.vel.z, (targetZ - this.position.z) * 2.8, 5, dt);
          this.position.addScaledVector(this.vel, dt);

          if (Math.hypot(this.vel.x, this.vel.z) > 0.12) {
            const desiredYaw = Math.atan2(this.vel.x, this.vel.z);
            this.facing += angleDiff(this.facing, desiredYaw) * Math.min(1, dt * 6);
          }
          this.bodyPitch = damp(this.bodyPitch, Math.max(-0.22, Math.min(0.22, this.vel.y * 0.12)), 6, dt);
        } else {
          this.vel.x = damp(this.vel.x, 0, 5, dt);
          this.vel.z = damp(this.vel.z, 0, 5, dt);
          this.vel.y = damp(this.vel.y, (this.home.y + 0.10 - this.position.y) * 3.0, 5, dt);
          this.position.addScaledVector(this.vel, dt);
          this.bodyPitch = damp(this.bodyPitch, 0, 6, dt);
        }
      }
      this.syncHurtbox();
    }

    let pose: StingrayPoseName;
    if (!this.alive) pose = 'rest0';
    else if (this.state === 'rest') pose = pickCycle(STINGRAY_REST, this.stateT * 1.8);
    else pose = pickCycle(STINGRAY_GLIDE, this.swimT * 6.0);

    this.renderBillboard(getStingrayPosePack(pose), this.position.y, camera, drawingBufferSize);
  }
}
