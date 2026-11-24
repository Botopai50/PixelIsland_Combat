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

// ============================================================================
// BOTO-COR-DE-ROSA (Amazon River Dolphin) — 64×36 @ ANIMAL_PPU
// ============================================================================
export type PinkDolphinPoseName =
  | 'swim0' | 'swim1' | 'swim2' | 'swim3' | 'swim4' | 'swim5'
  | 'leap0' | 'leap1' | 'leap2' | 'leap3';

export const PINK_DOLPHIN_PW = 64;
export const PINK_DOLPHIN_PH = 36;
export const PINK_DOLPHIN_W = PINK_DOLPHIN_PW / ANIMAL_PPU;
export const PINK_DOLPHIN_H = PINK_DOLPHIN_PH / ANIMAL_PPU;

const PINK_DOLPHIN_PAL: Record<string, [number, number, number]> = {
  k:  [0x28, 0x16, 0x22], // 1px dark plum-charcoal outline / eyes
  p0: [0xa6, 0x4c, 0x68], // deep rose-coral shadow
  p1: [0xd4, 0x72, 0x8e], // rich boto rose-pink
  p2: [0xf2, 0x98, 0xb0], // luminous coral-blush pink
  p3: [0xff, 0xc2, 0xd2], // soft pearl-pink highlight
  p4: [0xff, 0xe4, 0xec], // wet glossy pearl specular
  g0: [0x9e, 0x88, 0xa2], // subtle pale-lavender-grey dorsal mottling shadow
  g1: [0xc4, 0xb0, 0xc8], // subtle pale-lavender-grey dorsal mottling lit
  b0: [0xe8, 0xb4, 0xbe], // warm cream-pink belly shadow
  b1: [0xff, 0xdc, 0xe0], // warm cream-pink belly lit
  w:  [0xff, 0xfc, 0xfa], // eye specular glint
};

interface PinkDolphinPose {
  bodyY: number;
  pitch: number;      // overall body pitch (+ = nose up, - = nose down)
  arch: number;       // spine flex (+ = arched up, - = curved down)
  headYaw: number;    // flexible river-dolphin neck turn
  tailBeat: number;   // vertical fluke undulation (-1..+1)
  flipperSweep: number;
}

const PINK_DOLPHIN_POSES: Record<PinkDolphinPoseName, PinkDolphinPose> = {
  // 6-frame graceful undulating river glide
  swim0: { bodyY:  0.00, pitch:  0.04, arch:  0.05, headYaw:  0.04, tailBeat:  0.14, flipperSweep:  0.05 },
  swim1: { bodyY:  0.02, pitch:  0.06, arch:  0.02, headYaw:  0.02, tailBeat:  0.04, flipperSweep:  0.02 },
  swim2: { bodyY:  0.01, pitch:  0.00, arch: -0.04, headYaw: -0.02, tailBeat: -0.10, flipperSweep: -0.04 },
  swim3: { bodyY: -0.01, pitch: -0.04, arch: -0.06, headYaw: -0.04, tailBeat: -0.16, flipperSweep: -0.06 },
  swim4: { bodyY: -0.02, pitch: -0.02, arch: -0.02, headYaw: -0.02, tailBeat: -0.04, flipperSweep: -0.02 },
  swim5: { bodyY:  0.00, pitch:  0.02, arch:  0.04, headYaw:  0.02, tailBeat:  0.10, flipperSweep:  0.04 },

  // 4-frame playful arcing surface breach
  leap0: { bodyY:  0.04, pitch:  0.46, arch:  0.10, headYaw:  0.03, tailBeat: -0.18, flipperSweep:  0.10 },
  leap1: { bodyY:  0.09, pitch:  0.18, arch:  0.16, headYaw:  0.00, tailBeat: -0.10, flipperSweep:  0.14 },
  leap2: { bodyY:  0.06, pitch: -0.22, arch:  0.14, headYaw: -0.03, tailBeat:  0.06, flipperSweep:  0.08 },
  leap3: { bodyY: -0.02, pitch: -0.50, arch:  0.06, headYaw:  0.00, tailBeat:  0.18, flipperSweep: -0.04 },
};

const pinkDolphinCache = new Map<PinkDolphinPoseName, Boar27Pack>();

 function buildPinkDolphinPosePack(pose: PinkDolphinPoseName): Boar27Pack {
  let pack = pinkDolphinCache.get(pose);
  if (!pack) {
    const P = PINK_DOLPHIN_POSES[pose];
    const cosP = Math.cos(P.pitch);
    const sinP = Math.sin(P.pitch);

    const evalFn: SdfEvaluator = (x, y, z) => {
      // Rotate into pitched body space
      const dy = y - P.bodyY;
      const lz = z * cosP + dy * sinP;
      const ly = -z * sinP + dy * cosP;

      const arch = P.arch;
      const tb = P.tailBeat;
      const hy = P.headYaw;

      // 1. Sinuous flexible torso + neck + tapered peduncle
      const chest = sdEllipsoid(x, ly, lz, 0, 0.01 + arch * 0.25, 0.14, 0.175, 0.165, 0.27);
      const midBody = sdEllipsoid(x, ly, lz, 0, 0.015 + arch * 0.35, -0.10, 0.155, 0.150, 0.25);
      const peduncle = sdCapsule(
        x, ly, lz,
        0, 0.0 + arch * 0.15, -0.26,
        0, -0.02 + tb * 0.75 - arch * 0.35, -0.64,
        0.115, 0.042,
      );

      // Low smooth dorsal ridge (characteristic of Amazon River Dolphin, NOT a tall fin!)
      const dorsalRidge = sdEllipsoid(x, ly, lz, 0, 0.155 + arch * 0.32, -0.12, 0.032, 0.048, 0.20);

      // 2. Prominent bulbous rounded melon forehead + long slender narrow river-dolphin beak
      const neck = sdCapsule(x, ly, lz, 0, 0.01 + arch * 0.15, 0.26, hy * 0.6, 0.01 - arch * 0.1, 0.42, 0.145, 0.125);
      const melon = sdEllipsoid(x, ly, lz, hy, 0.055 - arch * 0.12, 0.48, 0.118, 0.122, 0.125);
      const jawBase = sdEllipsoid(x, ly, lz, hy, -0.025 - arch * 0.12, 0.47, 0.102, 0.072, 0.115);
      const beak = sdCapsule(
        x, ly, lz,
        hy, -0.020 - arch * 0.14, 0.54,
        hy * 1.25, -0.036 - arch * 0.18, 0.80,
        0.042, 0.022,
      );

      let body = smin(chest, midBody, 0.09);
      body = smin(body, peduncle, 0.08);
      body = smin(body, dorsalRidge, 0.04);
      body = smin(body, neck, 0.07);
      body = smin(body, melon, 0.05);
      body = smin(body, jawBase, 0.045);
      body = smin(body, beak, 0.03);

      // 3. Broad paddle-like pectoral flippers
      const fs = P.flipperSweep;
      const flipL = sdEllipsoid(x, ly, lz, -0.23, -0.07 + fs * 0.18, 0.14 - fs * 0.10, 0.145, 0.026, 0.105);
      const flipR = sdEllipsoid(x, ly, lz,  0.23, -0.07 + fs * 0.18, 0.14 - fs * 0.10, 0.145, 0.026, 0.105);
      body = smin(body, Math.min(flipL, flipR), 0.035);

      // 4. Wide horizontal notched tail flukes
      const ty = -0.02 + tb * 0.78 - arch * 0.35;
      const flukeL = sdEllipsoid(x, ly, lz, -0.14, ty, -0.68, 0.165, 0.022, 0.088);
      const flukeR = sdEllipsoid(x, ly, lz,  0.14, ty, -0.68, 0.165, 0.022, 0.088);
      body = smin(body, Math.min(flukeL, flukeR), 0.028);

      // 5. Cute small dark eyes with white glint
      const eyeL = sdEllipsoid(x, ly, lz, hy - 0.102, 0.028 - arch * 0.12, 0.49, 0.022, 0.022, 0.022);
      const eyeR = sdEllipsoid(x, ly, lz, hy + 0.102, 0.028 - arch * 0.12, 0.49, 0.022, 0.022, 0.022);
      const eyes = Math.min(eyeL, eyeR);

      const glintL = sdEllipsoid(x, ly, lz, hy - 0.110, 0.038 - arch * 0.12, 0.506, 0.010, 0.010, 0.010);
      const glintR = sdEllipsoid(x, ly, lz, hy + 0.110, 0.038 - arch * 0.12, 0.506, 0.010, 0.010, 0.010);
      const glints = Math.min(glintL, glintR);

      let d = body, mat = 'skin';
      if (eyes < d) { d = eyes; mat = 'eye'; }
      if (glints < d) { d = glints; mat = 'glint'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'glint') return 'w';
      if (mat === 'eye') return 'k';

      const dy = y - P.bodyY;
      const ly = -z * sinP + dy * cosP;

      // Warm cream-pink belly
      if (ly < -0.07 && Math.abs(x) < 0.15) {
        return shade > 0.45 ? 'b1' : 'b0';
      }

      // Subtle pale-lavender-grey dorsal mottling along upper back/ridge
      if (ly > 0.075 && Math.abs(x) < 0.11) {
        const mottle = Math.sin(z * 16 + x * 20) * Math.cos(z * 11 - ly * 18);
        if (mottle > 0.35) {
          return shade > 0.50 ? 'g1' : 'g0';
        }
      }

      // Luminous rose-pink / coral-blush / pearl-pink ramp with wet highlight
      const wet = ly > 0.06 ? 0.08 : 0;
      const s = shade + wet;
      return s > 0.84 ? 'p4'
        : s > 0.65 ? 'p3'
        : s > 0.44 ? 'p2'
        : s > 0.24 ? 'p1'
        : 'p0';
    };

    pack = build27Pack(PINK_DOLPHIN_PW, PINK_DOLPHIN_PH, 1.18, 0.68, PINK_DOLPHIN_PAL, evalFn, shadeFn);
    pinkDolphinCache.set(pose, pack);
  }
  return pack;
}

export function getPinkDolphinPosePack(...args: Parameters<typeof buildPinkDolphinPosePack>): ReturnType<typeof buildPinkDolphinPosePack> {
  return registerAnimalSpritePack(buildPinkDolphinPosePack(...args), { module: './PinkDolphin.ts', factory: 'getPinkDolphinPosePack', args }, buildPinkDolphinPosePack);
}

function pickCycle<T>(frames: readonly T[], idx: number): T {
  return sampleAnimalCycle(frames, idx);
}

const PINK_DOLPHIN_SWIM: readonly PinkDolphinPoseName[] = ['swim0', 'swim1', 'swim2', 'swim3', 'swim4', 'swim5'];
const PINK_DOLPHIN_LEAP: readonly PinkDolphinPoseName[] = ['leap0', 'leap1', 'leap2', 'leap3'];

export class PinkDolphin extends BasePixelAnimal {
  readonly position = new THREE.Vector3();
  private readonly vel = new THREE.Vector3();
  private readonly pondCenter = new THREE.Vector3();
  private orbitAngle = rand(0, Math.PI * 2);
  private orbitRadius = rand(1.4, 3.2);
  private orbitDir = Math.random() < 0.5 ? 1 : -1;
  private swimT = rand(0, 6.0);
  private leapTimer = rand(3.0, 6.5);
  private leaping = false;
  private leapT = 0;
  private readonly leapDur = 1.05;

  constructor(ctx: GameContext, startPos: THREE.Vector3, pondCenter?: THREE.Vector3) {
    super(
      ctx,
      getPinkDolphinPosePack('swim0').getView(2, 0)!,
      PINK_DOLPHIN_PW,
      PINK_DOLPHIN_PH,
      PINK_DOLPHIN_W,
      PINK_DOLPHIN_H,
      'PinkDolphinBillboard',
    );
    this.hp = 85;
    this.maxHp = 85;
    this.pondCenter.copy(pondCenter ?? startPos);
    this.position.set(
      this.pondCenter.x + Math.cos(this.orbitAngle) * this.orbitRadius,
      this.pondCenter.y + 0.14,
      this.pondCenter.z + Math.sin(this.orbitAngle) * this.orbitRadius,
    );
    this.facing = this.orbitAngle + (this.orbitDir > 0 ? Math.PI * 0.5 : -Math.PI * 0.5);
    this.hurtboxes.push({
      a: new THREE.Vector3(),
      b: new THREE.Vector3(),
      radius: 0.42,
      tag: 'body',
      enabled: true,
    });
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
    this.vel.x += hit.dir.x * 2.5;
    this.vel.z += hit.dir.z * 2.5;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else if (!this.leaping) {
      // Playful/startled breach away
      this.leaping = true;
      this.leapT = 0;
    }
    return res;
  }

  update(dt: number, _target: EnemyTarget | null, camera: THREE.Camera, drawingBufferSize?: THREE.Vector2) {
    if (dt > 0) {
      this.flash = Math.max(0, this.flash - dt * 4.5);

      if (!this.alive) {
        this.deadT += dt;
        this.position.y = damp(this.position.y, this.pondCenter.y - 0.18, 3, dt);
      } else {
        const angularSpeed = (this.leaping ? 0.95 : 0.62) * this.orbitDir;
        this.orbitAngle += angularSpeed * dt;
        this.swimT += dt * 4.8;

        const targetX = this.pondCenter.x + Math.cos(this.orbitAngle) * this.orbitRadius;
        const targetZ = this.pondCenter.z + Math.sin(this.orbitAngle) * this.orbitRadius;
        const dx = targetX - this.position.x;
        const dz = targetZ - this.position.z;
        const desiredYaw = Math.atan2(dx, dz);
        this.facing += angleDiff(this.facing, desiredYaw) * Math.min(1, dt * 6.0);

        this.position.x = damp(this.position.x, targetX, 4.0, dt);
        this.position.z = damp(this.position.z, targetZ, 4.0, dt);

        if (this.leaping) {
          this.leapT += dt;
          const u = Math.min(1, this.leapT / this.leapDur);
          const arc = Math.sin(u * Math.PI) * 0.78;
          this.position.y = this.pondCenter.y + 0.12 + arc;
          if (this.leapT >= this.leapDur) {
            this.leaping = false;
            this.leapTimer = rand(3.2, 6.8);
            this.orbitRadius = rand(1.4, 3.2);
          }
        } else {
          this.leapTimer -= dt;
          if (this.leapTimer <= 0) {
            this.leaping = true;
            this.leapT = 0;
          }
          const bob = Math.sin(this.swimT * 0.9) * 0.06;
          this.position.y = damp(this.position.y, this.pondCenter.y + 0.14 + bob, 5.0, dt);
        }
      }
      this.syncHurtbox();
    }

    let pose: PinkDolphinPoseName;
    if (!this.alive) {
      pose = 'swim0';
    } else if (this.leaping) {
      const idx = Math.min(PINK_DOLPHIN_LEAP.length - 1, Math.floor((this.leapT / this.leapDur) * PINK_DOLPHIN_LEAP.length));
      pose = PINK_DOLPHIN_LEAP[idx];
    } else {
      pose = pickCycle(PINK_DOLPHIN_SWIM, this.swimT);
    }

    this.renderBillboard(getPinkDolphinPosePack(pose), this.position.y, camera, drawingBufferSize);
  }
}
