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
import { damp, rand } from '../core/math';

// ============================================================================
// POLVO (Octopus) — Flagship 48×40 @ 56 PPU
// ============================================================================
const ANIMAL_PPU = 56;

export type OctopusPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'crawl0' | 'crawl1' | 'crawl2' | 'crawl3' | 'crawl4' | 'crawl5'
  | 'jet0' | 'jet1' | 'jet2' | 'jet3';

export const OCTOPUS_PW = 48;
export const OCTOPUS_PH = 40;
export const OCTOPUS_W = OCTOPUS_PW / ANIMAL_PPU;
export const OCTOPUS_H = OCTOPUS_PH / ANIMAL_PPU;

const OCTOPUS_PAL: Record<string, [number, number, number]> = {
  k:  [0x1a, 0x0b, 0x16], // 1px dark outline / horizontal eye slit
  w:  [0xff, 0xf8, 0xf2], // crisp white eye glint
  o0: [0x4a, 0x12, 0x2a], // deep magenta-plum shadow
  o1: [0x7d, 0x1e, 0x3b], // rich plum-crimson
  o2: [0xb8, 0x32, 0x46], // vibrant coral-red midtone
  o3: [0xe0, 0x56, 0x58], // warm sunlit coral
  o4: [0xf7, 0x8e, 0x7c], // bright coral-peach highlight
  sp: [0x61, 0x16, 0x36], // mottled coral-magenta mantle spots
  s0: [0xd9, 0xa8, 0x96], // pale peach-cream sucker underside shadow
  s1: [0xf7, 0xd9, 0xc4], // pale peach-cream suction cups
  e0: [0xd4, 0x88, 0x18], // golden-amber eye shadow
  e1: [0xff, 0xd4, 0x3b], // bright golden-amber eye
};

interface OctopusPose {
  bodyY: number;
  mantleScale: number; // subtle breathing / jet contraction
  wavePhase: number;   // tentacle undulation phase
  jet: number;         // 0 = radial curling tentacles, 1 = streamlined trailing jet burst
}

const OCTOPUS_POSES: Record<OctopusPoseName, OctopusPose> = {
  // Gentle tentacle wave & mantle breathing
  idle0:  { bodyY: 0.0,    mantleScale: 1.00, wavePhase: 0.0,  jet: 0.0 },
  idle1:  { bodyY: 0.018,  mantleScale: 1.05, wavePhase: 1.8,  jet: 0.0 },
  idle2:  { bodyY: -0.012, mantleScale: 0.96, wavePhase: 3.6,  jet: 0.0 },

  // Curling tentacle crawl/swim cycle
  crawl0: { bodyY: 0.01,   mantleScale: 1.02, wavePhase: 0.0,  jet: 0.08 },
  crawl1: { bodyY: 0.03,   mantleScale: 1.05, wavePhase: 1.05, jet: 0.12 },
  crawl2: { bodyY: 0.02,   mantleScale: 1.00, wavePhase: 2.10, jet: 0.10 },
  crawl3: { bodyY: 0.0,    mantleScale: 0.97, wavePhase: 3.15, jet: 0.08 },
  crawl4: { bodyY: 0.02,   mantleScale: 1.03, wavePhase: 4.20, jet: 0.12 },
  crawl5: { bodyY: 0.01,   mantleScale: 1.01, wavePhase: 5.25, jet: 0.10 },

  // Streamlined jet-propulsion burst with tentacles trailing behind!
  jet0:   { bodyY: 0.02,   mantleScale: 1.08, wavePhase: 0.5,  jet: 0.55 },
  jet1:   { bodyY: 0.04,   mantleScale: 0.92, wavePhase: 1.8,  jet: 0.95 },
  jet2:   { bodyY: 0.03,   mantleScale: 0.95, wavePhase: 3.2,  jet: 1.00 },
  jet3:   { bodyY: 0.01,   mantleScale: 1.02, wavePhase: 4.6,  jet: 0.72 },
};

// 8 radial tentacle base angles around the body (4 pairs: front-inner, front-outer, rear-outer, rear-inner)
const TENTACLE_ANGLES: readonly number[] = [
  0.38, -0.38,
  1.12, -1.12,
  1.92, -1.92,
  2.72, -2.72,
];

const octopusCache = new Map<OctopusPoseName, Boar27Pack>();
 function buildOctopusPosePack(pose: OctopusPoseName): Boar27Pack {
  let pack = octopusCache.get(pose);
  if (!pack) {
    const P = OCTOPUS_POSES[pose];
    const by = P.bodyY;
    const ms = P.mantleScale;
    const j = P.jet;
    const wp = P.wavePhase;

    // Head/mantle shifts slightly forward & tilts horizontally during streamlined jet burst
    const mantleY = 0.24 + by - j * 0.14;
    const mantleZ = -0.06 + j * 0.26;
    const headY   = 0.04 + by - j * 0.04;
    const headZ   = 0.10 + j * 0.10;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // --------------------------------------------------------------------
      // 1. LARGE BULBOUS TILTED CEPHALOPOD MANTLE & BROW COLLAR
      // --------------------------------------------------------------------
      const mantle = sdEllipsoid(
        x, y, z,
        0, mantleY, mantleZ,
        0.27 * ms, (0.28 - j * 0.06) * ms, (0.26 + j * 0.12) * ms,
      );
      const collar = sdEllipsoid(x, y, z, 0, headY, headZ, 0.22, 0.15, 0.21);
      // Raised brow ridges above the eyes
      const browL = sdEllipsoid(x, y, z, -0.15, headY + 0.09, headZ + 0.12, 0.085, 0.065, 0.085);
      const browR = sdEllipsoid(x, y, z,  0.15, headY + 0.09, headZ + 0.12, 0.085, 0.065, 0.085);

      let body = smin(mantle, collar, 0.10);
      body = smin(body, Math.min(browL, browR), 0.045);

      // --------------------------------------------------------------------
      // 2. EIGHT DISTINCT LUSH CURLING TENTACLES
      // --------------------------------------------------------------------
      let tentacles = 99;
      for (let i = 0; i < 8; i++) {
        const ang = TENTACLE_ANGLES[i];
        const sx = Math.sin(ang);
        const sz = Math.cos(ang);
        const wave = Math.sin(wp + i * 0.95);
        const wave2 = Math.cos(wp + i * 1.15);

        // Base under the collar
        const ax = sx * 0.14;
        const ay = headY - 0.10;
        const az = headZ + sz * 0.13 - j * 0.14;

        // Mid-tentacle arch (radially splayed when crawling/idle, trailing backward in jet)
        const mx = sx * (0.36 - j * 0.18) + wave2 * 0.035;
        const my = headY - 0.22 + wave * 0.045 + j * 0.14;
        const mz = (headZ + sz * 0.34) * (1 - j) + (-0.28 + sz * 0.08) * j;

        // Curled tip (curls gracefully outward/upward when open, streams behind in jet)
        const tx = sx * (0.52 - j * 0.34) + wave * 0.055;
        const ty = headY - 0.18 + wave2 * 0.065 + j * 0.16;
        const tz = (headZ + sz * 0.50) * (1 - j) + (-0.64 + wave * 0.06) * j;

        const seg1 = sdCapsule(x, y, z, ax, ay, az, mx, my, mz, 0.072, 0.052);
        const seg2 = sdCapsule(x, y, z, mx, my, mz, tx, ty, tz, 0.050, 0.022);
        const tent = smin(seg1, seg2, 0.025);
        tentacles = Math.min(tentacles, tent);
      }

      body = smin(body, tentacles, 0.04);

      // --------------------------------------------------------------------
      // 3. BRIGHT GOLDEN-AMBER HORIZONTAL-SLIT EYES & WHITE GLINT
      // --------------------------------------------------------------------
      const eyeY = headY + 0.055;
      const eyeZ = headZ + 0.165;
      const eyeL = sdEllipsoid(x, y, z, -0.145, eyeY, eyeZ, 0.062, 0.062, 0.058);
      const eyeR = sdEllipsoid(x, y, z,  0.145, eyeY, eyeZ, 0.062, 0.062, 0.058);
      // Iconic horizontal cephalopod pupil slit
      const slitL = sdEllipsoid(x, y, z, -0.155, eyeY, eyeZ + 0.046, 0.042, 0.016, 0.024);
      const slitR = sdEllipsoid(x, y, z,  0.155, eyeY, eyeZ + 0.046, 0.042, 0.016, 0.024);
      const glintL = sdEllipsoid(x, y, z, -0.162, eyeY + 0.026, eyeZ + 0.050, 0.017, 0.017, 0.017);
      const glintR = sdEllipsoid(x, y, z,  0.162, eyeY + 0.026, eyeZ + 0.050, 0.017, 0.017, 0.017);

      let d = body;
      let mat = 'skin';
      if (Math.min(eyeL, eyeR) < d) { d = Math.min(eyeL, eyeR); mat = 'eye'; }
      if (Math.min(slitL, slitR) < d) { d = Math.min(slitL, slitR); mat = 'slit'; }
      if (Math.min(glintL, glintR) < d) { d = Math.min(glintL, glintR); mat = 'glint'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'glint') return 'w';
      if (mat === 'slit') return 'k';
      if (mat === 'eye') return shade > 0.45 ? 'e1' : 'e0';

      // Pale peach-cream underside & suction-cup shading along the lower surface of tentacles
      const isUnderside = y < headY - 0.17 + j * 0.14;
      if (isUnderside) {
        const sucker = Math.sin(x * 36) * Math.sin(z * 36) > 0.25;
        return sucker || shade > 0.42 ? 's1' : 's0';
      }

      // Subtle mottled coral-magenta spots on the bulbous mantle head
      if (y > headY + 0.08) {
        const spot = Math.sin(x * 19 + 0.6) * Math.cos(y * 19 - 0.4) * Math.cos(z * 17) > 0.46;
        if (spot) return shade > 0.52 ? 'o1' : 'sp';
      }

      // Rich 5-tone coral-red / deep magenta-plum ramp
      if (shade > 0.80) return 'o4';
      if (shade > 0.58) return 'o3';
      if (shade > 0.36) return 'o2';
      if (shade > 0.18) return 'o1';
      return 'o0';
    };

    pack = build27Pack(OCTOPUS_PW, OCTOPUS_PH, 0.96, 0.80, OCTOPUS_PAL, evalFn, shadeFn);
    octopusCache.set(pose, pack);
  }
  return pack;
}

export function getOctopusPosePack(...args: Parameters<typeof buildOctopusPosePack>): ReturnType<typeof buildOctopusPosePack> {
  return registerAnimalSpritePack(buildOctopusPosePack(...args), { module: './Octopus.ts', factory: 'getOctopusPosePack', args }, buildOctopusPosePack);
}

// ============================================================================
// INSTÂNCIA NA ARENA (Octopus — Pond-gliding & jet-burst AI)
// ============================================================================
function pickCycle<T>(frames: readonly T[], idx: number): T {
  return sampleAnimalCycle(frames, idx);
}

const OCTOPUS_IDLE: readonly OctopusPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const OCTOPUS_CRAWL: readonly OctopusPoseName[] = ['crawl0', 'crawl1', 'crawl2', 'crawl3', 'crawl4', 'crawl5'];
const OCTOPUS_JET: readonly OctopusPoseName[] = ['jet0', 'jet1', 'jet2', 'jet3'];

export class Octopus extends BasePixelAnimal {
  readonly position = new THREE.Vector3();
  private readonly vel = new THREE.Vector3();
  private readonly anchor = new THREE.Vector3();
  private state: 'idle' | 'crawl' | 'jet' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.4, 2.8);
  private targetYaw = rand(0, Math.PI * 2);
  private swimPhase = rand(0, Math.PI * 2);
  private waterY = 0;
  private readonly centerY = 0.24;

  constructor(ctx: GameContext, startPos: THREE.Vector3, pondCenter?: THREE.Vector3) {
    super(
      ctx,
      getOctopusPosePack('idle0').getView(2, 0)!,
      OCTOPUS_PW,
      OCTOPUS_PH,
      OCTOPUS_W,
      OCTOPUS_H,
      'OctopusBillboard',
    );
    this.hp = 45;
    this.maxHp = 45;
    this.waterY = startPos.y;
    this.anchor.copy(pondCenter ?? startPos);
    this.anchor.y = this.waterY;
    this.position.copy(startPos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.36, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.set(this.position.x, this.position.y + this.centerY, this.position.z);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y + 0.12, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.42, this.position.z);
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
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.state = 'jet';
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
        this.vel.x = damp(this.vel.x, 0, 5, dt);
        this.vel.z = damp(this.vel.z, 0, 5, dt);
        this.position.addScaledVector(this.vel, dt);
      } else {
        const dist = target && target.alive
          ? Math.hypot(target.position.x - this.position.x, target.position.z - this.position.z)
          : 999;

        if (dist < 3.2 && this.state !== 'jet' && target) {
          this.state = 'jet';
          this.stateT = 0;
          this.stateDur = 1.3;
          this.targetYaw = Math.atan2(this.position.x - target.position.x, this.position.z - target.position.z);
        }

        let speed = 0;
        if (this.state === 'idle') {
          if (this.stateT >= this.stateDur) {
            this.state = 'crawl';
            this.stateT = 0;
            this.stateDur = rand(1.8, 3.4);
            const dx = this.anchor.x - this.position.x;
            const dz = this.anchor.z - this.position.z;
            const toPond = Math.hypot(dx, dz);
            this.targetYaw = toPond > 3.6
              ? Math.atan2(dx, dz) + rand(-0.6, 0.6)
              : this.facing + rand(-1.8, 1.8);
          }
        } else if (this.state === 'crawl') {
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 5);
          speed = 1.35;
          if (this.stateT >= this.stateDur) {
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.2, 2.5);
          }
        } else if (this.state === 'jet') {
          if (target && target.alive && dist < 4.5) {
            this.targetYaw = Math.atan2(this.position.x - target.position.x, this.position.z - target.position.z);
          }
          // Keep near pond if drifting too far
          const dx = this.anchor.x - this.position.x;
          const dz = this.anchor.z - this.position.z;
          if (Math.hypot(dx, dz) > 5.0) {
            this.targetYaw = Math.atan2(dx, dz);
          }
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 9);
          speed = 3.9;
          if (this.stateT >= this.stateDur && dist > 4.2) {
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.2, 2.2);
          }
        }

        this.vel.x = damp(this.vel.x, Math.sin(this.facing) * speed, 7, dt);
        this.vel.z = damp(this.vel.z, Math.cos(this.facing) * speed, 7, dt);
        this.steerAnimalMovement(this.vel, dt);
        this.position.x += this.vel.x * dt;
        this.position.z += this.vel.z * dt;
        this.position.y = this.waterY;

        const horiz = Math.hypot(this.vel.x, this.vel.z);
        if (horiz > 0.15) {
          this.swimPhase += dt * (this.state === 'jet' ? 8.5 : 5.2);
        }
        this.bodyPitch = damp(this.bodyPitch, this.state === 'jet' ? -0.14 : 0, 8, dt);
      }
      this.syncHurtbox();
    }

    const bob = this.alive ? Math.sin(this.stateT * 3.0) * 0.025 : 0;
    const pose: OctopusPoseName = !this.alive
      ? 'idle0'
      : this.state === 'jet'
        ? pickCycle(OCTOPUS_JET, this.swimPhase)
        : this.state === 'crawl'
          ? pickCycle(OCTOPUS_CRAWL, this.swimPhase)
          : pickCycle(OCTOPUS_IDLE, this.stateT * 2.0);
    const deathSink = this.alive ? 0 : Math.min(0.22, this.deadT * 0.4);
    this.renderBillboard(getOctopusPosePack(pose), this.position.y + this.centerY + bob - deathSink, camera, drawingBufferSize);
  }
}
