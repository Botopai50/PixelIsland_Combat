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
// HIENA-MALHADA (Spotted Hyena) — 54×44 @ 56 PPU (0.96m × 0.79m)
// ============================================================================
export type HyenaPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'prowl0' | 'prowl1' | 'prowl2' | 'prowl3' | 'prowl4' | 'prowl5'
  | 'laugh0' | 'laugh1' | 'laugh2'
  | 'bite0' | 'bite1' | 'bite2' | 'bite3';

export const HYENA_PW = 54;
export const HYENA_PH = 44;
export const HYENA_W = HYENA_PW / ANIMAL_PPU;
export const HYENA_H = HYENA_PH / ANIMAL_PPU;

const HYENA_PAL: Record<string, [number, number, number]> = {
  k:  [0x14, 0x11, 0x0f], // crisp 1px dark outline / nose
  d0: [0x24, 0x1c, 0x18], // dark-charcoal muzzle, spots, mane, tail & paws shadow
  d1: [0x3d, 0x2f, 0x26], // dark brown/charcoal muzzle, spots & mane midtone
  h0: [0x7d, 0x5c, 0x36], // deep dusty-tan shadow
  h1: [0xa8, 0x80, 0x4d], // warm sandy-ochre coat
  h2: [0xc9, 0x9e, 0x67], // dusty savanna-tan midtone
  h3: [0xe3, 0xbc, 0x86], // sunlit sandy highlight
  h4: [0xf5, 0xd8, 0xa8], // top rim sheen & pale throat
  e:  [0xf2, 0xa6, 0x1d], // fierce amber eyes
  m:  [0x85, 0x1f, 0x2d], // mouth interior on laugh/bite
  W:  [0xf7, 0xf4, 0xeb], // sharp white fangs & eye glint
};

interface HyenaPose {
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
  tailLift: number;
}

const HYENA_POSES: Record<HyenaPoseName, HyenaPose> = {
  // Alert sloped-back idle
  idle0: {
    bodyY: 0.0, headY: 0.0, headZ: 0.0, headPitch: 0.02, jawOpen: 0.0,
    flSwing: 0.02, flLift: 0.0, frSwing: -0.02, frLift: 0.0,
    blSwing: -0.02, blLift: 0.0, brSwing: 0.02, brLift: 0.0,
    tailLift: 0.0,
  },
  idle1: {
    bodyY: 0.015, headY: 0.02, headZ: 0.015, headPitch: 0.06, jawOpen: 0.0,
    flSwing: 0.02, flLift: 0.0, frSwing: -0.02, frLift: 0.0,
    blSwing: -0.02, blLift: 0.0, brSwing: 0.02, brLift: 0.0,
    tailLift: 0.05,
  },
  idle2: {
    bodyY: -0.01, headY: -0.015, headZ: 0.02, headPitch: -0.04, jawOpen: 0.08,
    flSwing: 0.02, flLift: 0.0, frSwing: -0.02, frLift: 0.0,
    blSwing: -0.02, blLift: 0.0, brSwing: 0.02, brLift: 0.0,
    tailLift: -0.03,
  },

  // 6-frame sloped-back loping stride
  prowl0: {
    bodyY: -0.02, headY: -0.03, headZ: 0.04, headPitch: -0.05, jawOpen: 0.12,
    flSwing: 0.24, flLift: 0.14, frSwing: -0.18, frLift: 0.0,
    blSwing: -0.20, blLift: 0.0, brSwing: 0.20, brLift: 0.12,
    tailLift: 0.04,
  },
  prowl1: {
    bodyY: 0.0, headY: -0.02, headZ: 0.05, headPitch: -0.03, jawOpen: 0.12,
    flSwing: 0.12, flLift: 0.04, frSwing: -0.06, frLift: 0.08,
    blSwing: -0.08, blLift: 0.08, brSwing: 0.10, brLift: 0.04,
    tailLift: 0.06,
  },
  prowl2: {
    bodyY: -0.03, headY: -0.04, headZ: 0.04, headPitch: -0.06, jawOpen: 0.12,
    flSwing: -0.05, flLift: 0.0, frSwing: 0.12, frLift: 0.16,
    blSwing: 0.10, blLift: 0.14, brSwing: -0.05, brLift: 0.0,
    tailLift: 0.02,
  },
  prowl3: {
    bodyY: -0.02, headY: -0.03, headZ: 0.04, headPitch: -0.05, jawOpen: 0.12,
    flSwing: -0.18, flLift: 0.0, frSwing: 0.24, frLift: 0.14,
    blSwing: 0.20, blLift: 0.12, brSwing: -0.20, brLift: 0.0,
    tailLift: 0.04,
  },
  prowl4: {
    bodyY: 0.0, headY: -0.02, headZ: 0.05, headPitch: -0.03, jawOpen: 0.12,
    flSwing: -0.06, flLift: 0.08, frSwing: 0.12, frLift: 0.04,
    blSwing: 0.10, blLift: 0.04, brSwing: -0.08, brLift: 0.08,
    tailLift: 0.06,
  },
  prowl5: {
    bodyY: -0.03, headY: -0.04, headZ: 0.04, headPitch: -0.06, jawOpen: 0.12,
    flSwing: 0.12, flLift: 0.16, frSwing: -0.05, frLift: 0.0,
    blSwing: -0.05, blLift: 0.0, brSwing: 0.10, brLift: 0.14,
    tailLift: 0.02,
  },

  // 3-frame iconic cackling hyena laugh (head bobs up & down with jaws wide open!)
  laugh0: {
    bodyY: -0.02, headY: -0.06, headZ: 0.06, headPitch: -0.08, jawOpen: 0.65,
    flSwing: 0.08, flLift: 0.0, frSwing: 0.04, frLift: 0.0,
    blSwing: -0.04, blLift: 0.0, brSwing: -0.04, brLift: 0.0,
    tailLift: 0.18,
  },
  laugh1: {
    bodyY: 0.02, headY: 0.05, headZ: 0.05, headPitch: 0.22, jawOpen: 1.0,
    flSwing: 0.10, flLift: 0.04, frSwing: 0.06, frLift: 0.0,
    blSwing: -0.06, blLift: 0.0, brSwing: -0.06, brLift: 0.0,
    tailLift: 0.28,
  },
  laugh2: {
    bodyY: 0.0, headY: -0.02, headZ: 0.07, headPitch: 0.06, jawOpen: 0.85,
    flSwing: 0.08, flLift: 0.0, frSwing: 0.06, frLift: 0.04,
    blSwing: -0.05, blLift: 0.0, brSwing: -0.05, brLift: 0.0,
    tailLift: 0.22,
  },

  // 4-frame bone-crushing bite lunge
  bite0: {
    bodyY: -0.08, headY: -0.08, headZ: 0.06, headPitch: -0.08, jawOpen: 0.50,
    flSwing: 0.14, flLift: 0.0, frSwing: 0.10, frLift: 0.0,
    blSwing: 0.14, blLift: 0.0, brSwing: 0.10, brLift: 0.0,
    tailLift: 0.14,
  },
  bite1: {
    bodyY: 0.04, headY: -0.01, headZ: 0.12, headPitch: 0.02, jawOpen: 0.95,
    flSwing: 0.36, flLift: 0.40, frSwing: 0.28, frLift: 0.34,
    blSwing: -0.28, blLift: 0.20, brSwing: -0.22, brLift: 0.16,
    tailLift: 0.26,
  },
  bite2: {
    bodyY: 0.03, headY: -0.03, headZ: 0.14, headPitch: -0.04, jawOpen: 1.0,
    flSwing: 0.42, flLift: 0.44, frSwing: 0.34, frLift: 0.38,
    blSwing: -0.32, blLift: 0.26, brSwing: -0.26, brLift: 0.20,
    tailLift: 0.30,
  },
  bite3: {
    bodyY: -0.04, headY: -0.06, headZ: 0.07, headPitch: -0.06, jawOpen: 0.35,
    flSwing: 0.22, flLift: 0.04, frSwing: 0.18, frLift: 0.02,
    blSwing: -0.10, blLift: 0.12, brSwing: -0.06, brLift: 0.08,
    tailLift: 0.16,
  },
};

const hyenaCache = new Map<HyenaPoseName, Boar27Pack>();
 function buildHyenaPosePack(pose: HyenaPoseName): Boar27Pack {
  let pack = hyenaCache.get(pose);
  if (!pack) {
    const P = HYENA_POSES[pose];
    const by = P.bodyY;
    const hPivotY = 0.29 + by + P.headY;
    const hPivotZ = 0.44 + P.headZ;
    const cosP = Math.cos(P.headPitch);
    const sinP = Math.sin(P.headPitch);
    const jawDrop = P.jawOpen * 0.14;
    const jawBack = P.jawOpen * 0.03;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // 1. Unmistakable sloped-back hyena silhouette: high massive shoulders sloping down to low hindquarters!
      const chest = sdEllipsoid(x, y, z, 0, 0.08 + by, 0.20, 0.215, 0.225, 0.245);
      const withers = sdEllipsoid(x, y, z, 0, 0.22 + by, 0.18, 0.165, 0.145, 0.195);
      const mid = sdEllipsoid(x, y, z, 0, 0.03 + by, -0.08, 0.165, 0.165, 0.23);
      const rump = sdEllipsoid(x, y, z, 0, -0.05 + by, -0.32, 0.168, 0.162, 0.195);

      // Thick muscular upright hyena neck & spiky dorsal mane crest
      const neck = sdCapsule(x, y, z, 0, 0.16 + by, 0.26, 0, hPivotY - 0.01, hPivotZ - 0.02, 0.165, 0.138);
      const mane = sdCapsule(x, y, z, 0, 0.28 + by, 0.14, 0, hPivotY + 0.10, hPivotZ - 0.06, 0.075, 0.068);

      let fur = smin(chest, withers, 0.08);
      fur = smin(fur, mid, 0.10);
      fur = smin(fur, rump, 0.10);
      fur = smin(fur, neck, 0.08);
      fur = smin(fur, mane, 0.05);

      // 2. Heavy hyena head with LARGE rounded dish-like ears & bone-crushing jaws (local pitch-rotated space)
      const dy = y - hPivotY;
      const dz = z - hPivotZ;
      const lx = x;
      const lz = dz * cosP + dy * sinP;
      const ly = -dz * sinP + dy * cosP;

      const skull = sdEllipsoid(lx, ly, lz, 0, 0.015, 0.015, 0.145, 0.135, 0.158);
      const cheekL = sdEllipsoid(lx, ly, lz, -0.138, -0.02, 0.0, 0.092, 0.088, 0.098);
      const cheekR = sdEllipsoid(lx, ly, lz,  0.138, -0.02, 0.0, 0.092, 0.088, 0.098);
      const snout = sdCapsule(lx, ly, lz, 0, 0.005, 0.09, 0, -0.015, 0.285, 0.088, 0.060);
      const lowerJaw = sdCapsule(lx, ly, lz, 0, -0.055, 0.08, 0, -0.062 - jawDrop, 0.265 - jawBack, 0.068, 0.044);

      // Large rounded dish-like hyena ears
      const earL = sdEllipsoid(lx, ly, lz, -0.135, 0.155, -0.025, 0.062, 0.078, 0.036);
      const earR = sdEllipsoid(lx, ly, lz,  0.135, 0.155, -0.025, 0.062, 0.078, 0.036);

      let headD = smin(skull, Math.min(cheekL, cheekR), 0.048);
      headD = smin(headD, snout, 0.042);
      headD = smin(headD, lowerJaw, P.jawOpen > 0.2 ? 0.018 : 0.038);
      headD = smin(headD, Math.min(earL, earR), 0.022);
      fur = smin(fur, headD, 0.06);

      // 3. Long muscular front legs & shorter crouched hind legs
      const frontLeg = (sx: number, swing: number, lift: number) => {
        const shY = 0.04 + by, shZ = 0.22;
        const elY = -0.22 + by * 0.45 + lift * 0.18;
        const elZ = 0.15 + swing * 0.50;
        const pwY = -0.52 + lift * 0.30;
        const pwZ = 0.23 + swing * 1.04;
        const upper = sdCapsule(x, y, z, sx, shY, shZ, sx, elY, elZ, 0.088, 0.056);
        const lower = sdCapsule(x, y, z, sx, elY, elZ, sx, pwY, pwZ, 0.054, 0.040);
        const paw = sdEllipsoid(x, y, z, sx, pwY - 0.01, pwZ + 0.042, 0.054, 0.034, 0.068);
        return smin(smin(upper, lower, 0.03), paw, 0.024);
      };
      const hindLeg = (sx: number, swing: number, lift: number) => {
        const hipY = -0.04 + by, hipZ = -0.30;
        const hkY = -0.27 + by * 0.45 + lift * 0.16;
        const hkZ = -0.42 + swing * 0.44;
        const pwY = -0.52 + lift * 0.28;
        const pwZ = -0.33 + swing * 0.94;
        const upper = sdCapsule(x, y, z, sx, hipY, hipZ, sx, hkY, hkZ, 0.086, 0.052);
        const lower = sdCapsule(x, y, z, sx, hkY, hkZ, sx, pwY, pwZ, 0.048, 0.038);
        const paw = sdEllipsoid(x, y, z, sx, pwY - 0.01, pwZ + 0.040, 0.052, 0.032, 0.066);
        return smin(smin(upper, lower, 0.03), paw, 0.024);
      };

      const legs = Math.min(
        Math.min(frontLeg(-0.145, P.flSwing, P.flLift), frontLeg(0.145, P.frSwing, P.frLift)),
        Math.min(hindLeg(-0.145, P.blSwing, P.blLift), hindLeg(0.145, P.brSwing, P.brLift)),
      );
      fur = smin(fur, legs, 0.045);

      // 4. Short dark bushy hyena tail
      const tail = sdCapsule(x, y, z, 0, -0.04 + by, -0.46, 0, -0.18 + by * 0.4 + P.tailLift * 0.85, -0.74, 0.058, 0.076);
      fur = smin(fur, tail, 0.04);

      // 5. Fierce amber eyes, dark nose, wide cackling mouth & sharp white fangs
      const eyeL = sdEllipsoid(lx, ly, lz, -0.084, 0.042, 0.132, 0.032, 0.026, 0.030);
      const eyeR = sdEllipsoid(lx, ly, lz,  0.084, 0.042, 0.132, 0.032, 0.026, 0.030);
      const eyes = Math.min(eyeL, eyeR);
      const nose = sdEllipsoid(lx, ly, lz, 0, -0.006, 0.322, 0.042, 0.032, 0.032);

      let mouth = 99;
      let fangs = 99;
      if (P.jawOpen > 0.18) {
        mouth = sdEllipsoid(lx, ly, lz, 0, -0.045 - jawDrop * 0.42, 0.20, 0.056, 0.026 + jawDrop * 0.44, 0.082);
        const fL = sdCapsule(lx, ly, lz, -0.038, -0.038, 0.252, -0.038, -0.086, 0.252, 0.015, 0.006);
        const fR = sdCapsule(lx, ly, lz,  0.038, -0.038, 0.252,  0.038, -0.086, 0.252, 0.015, 0.006);
        fangs = Math.min(fL, fR);
      }

      let d = fur, mat = 'fur';
      if (mane < fur + 0.008 && Math.abs(x) < 0.075) mat = 'dark';
      if (tail < fur + 0.006 && z < -0.56) mat = 'dark';
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
      if (mat === 'dark') return shade > 0.50 ? 'd1' : 'd0';
      if (mat === 'eye') {
        const dy = y - hPivotY;
        const dz = z - hPivotZ;
        const ly = -dz * sinP + dy * cosP;
        if (ly > 0.050 && Math.abs(x) > 0.078) return 'W';
        return 'e';
      }

      // Dark-charcoal hyena muzzle & dark rounded ears
      const dy = y - hPivotY;
      const dz = z - hPivotZ;
      const lz = dz * cosP + dy * sinP;
      const ly = -dz * sinP + dy * cosP;
      if (dz > -0.10) {
        if (lz > 0.13 && ly < 0.035) return shade > 0.48 ? 'd1' : 'd0';
        if (ly > 0.11) return shade > 0.50 ? 'd1' : 'd0';
      }

      // Dark lower paws
      if (y < -0.40) return shade > 0.50 ? 'd1' : 'd0';

      // Irregular dark brown/black hyena spots across flanks, shoulders & haunches
      if (z > -0.45 && z < 0.28 && y > -0.26 + by && y < 0.20 + by) {
        const s1 = Math.sin(z * 23.0 + 0.5) * Math.sin(y * 24.0 + Math.abs(x) * 16.0);
        const s2 = Math.cos(z * 18.0 - 0.8) * Math.cos(y * 21.0 - Math.abs(x) * 14.0);
        if (s1 > 0.56 || s2 > 0.65) {
          return shade > 0.45 ? 'd1' : 'd0';
        }
      }

      return shade > 0.82 ? 'h4' : shade > 0.58 ? 'h3' : shade > 0.34 ? 'h2' : shade > 0.16 ? 'h1' : 'h0';
    };

    pack = build27Pack(HYENA_PW, HYENA_PH, 1.06, 0.86, HYENA_PAL, evalFn, shadeFn);
    hyenaCache.set(pose, pack);
  }
  return pack;
}

export function getHyenaPosePack(...args: Parameters<typeof buildHyenaPosePack>): ReturnType<typeof buildHyenaPosePack> {
  return registerAnimalSpritePack(buildHyenaPosePack(...args), { module: './Hyena.ts', factory: 'getHyenaPosePack', args }, buildHyenaPosePack);
}

// ============================================================================
// INSTÂNCIA NA ARENA (Hyena)
// ============================================================================
const HYENA_IDLE: readonly HyenaPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const HYENA_PROWL: readonly HyenaPoseName[] = ['prowl0', 'prowl1', 'prowl2', 'prowl3', 'prowl4', 'prowl5'];
const HYENA_LAUGH: readonly HyenaPoseName[] = ['laugh0', 'laugh1', 'laugh2', 'laugh1'];
const HYENA_BITE: readonly HyenaPoseName[] = ['bite0', 'bite1', 'bite2', 'bite3'];

/**
 * Spotted Hyena: prowls with its sloped-back loping gait, cackles fiercely, and lunges to bite if provoked.
 */
export class Hyena extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private readonly home = new THREE.Vector3();
  private state: 'idle' | 'prowl' | 'laugh' | 'bite' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.4, 2.8);
  private targetYaw = rand(0, Math.PI * 2);
  private gaitPhase = rand(0, Math.PI * 2);
  private provoked = false;

  constructor(ctx: GameContext, pos: THREE.Vector3) {
    super(ctx, getHyenaPosePack('idle0').getView(2, 0)!, HYENA_PW, HYENA_PH, HYENA_W, HYENA_H, 'HyenaBillboard');
    this.hp = 75;
    this.maxHp = 75;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.44;
    this.motor.height = 0.84;
    this.motor.teleport(pos);
    this.home.copy(pos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.48, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.set(this.position.x, this.position.y + 0.42, this.position.z);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y + 0.22, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.62, this.position.z);
    this.hurtboxes[0].enabled = this.alive;
    this.stickRoot.position.set(this.position.x, this.position.y + 0.42, this.position.z);
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
      this.state = 'laugh';
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
        const aggroDist = this.provoked ? 6.5 : 3.2;
        if (dist < 2.1 && this.state !== 'bite') {
          this.state = 'bite';
          this.stateT = 0;
          this.stateDur = 0.95;
        } else if (dist < aggroDist && this.state === 'idle' && this.stateT > 0.5) {
          this.state = 'laugh';
          this.stateT = 0;
          this.stateDur = 1.2;
        }

        if (this.state === 'idle') {
          if (this.stateT >= this.stateDur) {
            this.state = Math.random() < 0.72 ? 'prowl' : 'laugh';
            this.stateT = 0;
            this.stateDur = this.state === 'laugh' ? 1.2 : rand(2.0, 3.6);
            const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
            this.targetYaw = toHome > 8.0
              ? Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.5, 0.5)
              : this.facing + rand(-1.5, 1.5);
          }
        } else if (this.state === 'prowl') {
          if (this.provoked && target && target.alive && dist < 7.0) {
            this.targetYaw = Math.atan2(target.position.x - this.position.x, target.position.z - this.position.z);
            speed = 4.2;
          } else {
            speed = 2.4;
          }
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 6.5);
          if (this.stateT >= this.stateDur) {
            this.provoked = false;
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.2, 2.4);
          }
        } else if (this.state === 'laugh') {
          if (target && target.alive && dist < 7.0) {
            const toPlayer = Math.atan2(target.position.x - this.position.x, target.position.z - this.position.z);
            this.facing += angleDiff(this.facing, toPlayer) * Math.min(1, dt * 8);
          }
          if (this.stateT >= this.stateDur) {
            this.state = this.provoked ? 'prowl' : 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.4, 2.4);
          }
        } else if (this.state === 'bite') {
          if (target && target.alive) {
            const toPlayer = Math.atan2(target.position.x - this.position.x, target.position.z - this.position.z);
            this.facing += angleDiff(this.facing, toPlayer) * Math.min(1, dt * 10);
          }
          speed = 4.8;
          if (this.stateT >= this.stateDur) {
            this.state = dist < aggroDist ? 'laugh' : 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.0, 1.8);
          }
        }

        this.vel.x = damp(this.vel.x, Math.sin(this.facing) * speed, 9, dt);
        this.vel.z = damp(this.vel.z, Math.cos(this.facing) * speed, 9, dt);
        this.vel.y -= 20 * dt;
        this.motor.update(dt);

        const horiz = Math.hypot(this.vel.x, this.vel.z);
        if (horiz > 0.25 && this.motor.grounded) {
          this.gaitPhase += dt * 6.6 * (0.65 + horiz * 0.22);
        }
      }
      this.syncHurtbox();
    }

    let pose: HyenaPoseName;
    if (!this.alive) pose = 'idle0';
    else if (this.state === 'bite') pose = pickCycle(HYENA_BITE, this.stateT * 5.0);
    else if (this.state === 'laugh') pose = pickCycle(HYENA_LAUGH, this.stateT * 4.5);
    else if (this.state === 'prowl') pose = pickCycle(HYENA_PROWL, (this.gaitPhase / Math.PI) * 2.6);
    else pose = pickCycle(HYENA_IDLE, this.stateT * 2.0);

    const bob = this.alive && this.motor.grounded && (this.state === 'prowl' || this.state === 'bite')
      ? Math.abs(Math.sin(this.gaitPhase)) * 0.030
      : 0;
    const deathSink = this.alive ? 0 : Math.min(0.22, this.deadT * 0.4);
    this.renderBillboard(getHyenaPosePack(pose), this.position.y + 0.42 + bob - deathSink, camera, drawingBufferSize);
  }
}
