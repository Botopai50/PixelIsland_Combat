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
// BORBOLETA (Monarch Butterfly) — 22×20 @ ANIMAL_PPU
// ============================================================================
export type ButterflyPoseName =
  | 'flutter0' | 'flutter1' | 'flutter2' | 'flutter3' | 'flutter4' | 'flutter5';

export const BUTTERFLY_PW = 22;
export const BUTTERFLY_PH = 20;
export const BUTTERFLY_W = BUTTERFLY_PW / ANIMAL_PPU;
export const BUTTERFLY_H = BUTTERFLY_PH / ANIMAL_PPU;

const BUTTERFLY_PAL: Record<string, [number, number, number]> = {
  k:  [0x18, 0x13, 0x1a], // 1px outline / body / antennae / wing borders & veins
  b1: [0x38, 0x30, 0x3e], // subtle body highlight
  o0: [0xb8, 0x42, 0x0c], // deep monarch burnt-orange shadow
  o1: [0xe8, 0x6a, 0x14], // vibrant monarch orange
  o2: [0xff, 0x9b, 0x22], // warm tangerine-gold
  g:  [0xff, 0xd4, 0x4a], // bright golden-yellow center highlight
  w:  [0xff, 0xfa, 0xf2], // crisp white wing-edge dots
};

interface ButterflyPose {
  wingAngle: number; // radians: positive = wings raised up, negative = downstroke
  bodyY: number;     // vertical bob opposite wing stroke
  bodyPitch: number; // subtle nose pitch during flap
}

const BUTTERFLY_POSES: Record<ButterflyPoseName, ButterflyPose> = {
  flutter0: { wingAngle:  1.05, bodyY: -0.05, bodyPitch:  0.14 }, // full upstroke (V-shape)
  flutter1: { wingAngle:  0.55, bodyY: -0.02, bodyPitch:  0.08 }, // descending
  flutter2: { wingAngle: -0.05, bodyY:  0.02, bodyPitch:  0.02 }, // wide spread
  flutter3: { wingAngle: -0.72, bodyY:  0.06, bodyPitch: -0.06 }, // full downstroke
  flutter4: { wingAngle: -0.22, bodyY:  0.03, bodyPitch:  0.0  }, // recovering
  flutter5: { wingAngle:  0.48, bodyY: -0.01, bodyPitch:  0.08 }, // lifting
};

const butterflyCache = new Map<ButterflyPoseName, Boar27Pack>();

 function buildButterflyPosePack(pose: ButterflyPoseName): Boar27Pack {
  let pack = butterflyCache.get(pose);
  if (!pack) {
    const P = BUTTERFLY_POSES[pose];
    const by = P.bodyY;
    const cosA = Math.cos(P.wingAngle);
    const sinA = Math.sin(P.wingAngle);
    const cosP = Math.cos(P.bodyPitch);
    const sinP = Math.sin(P.bodyPitch);

    const evalFn: SdfEvaluator = (x, y, z) => {
      // Pitch entire butterfly subtly in local space
      const dy = y - by;
      const ly = dy * cosP - z * sinP;
      const lz = dy * sinP + z * cosP;

      // 1. Slender dark body: head, thorax, tapered abdomen, delicate antennae
      const head = sdEllipsoid(x, ly, lz, 0, 0.025, 0.24, 0.052, 0.050, 0.052);
      const thorax = sdEllipsoid(x, ly, lz, 0, 0.01, 0.07, 0.060, 0.058, 0.13);
      const abdomen = sdCapsule(x, ly, lz, 0, -0.005, -0.03, 0, -0.03, -0.32, 0.048, 0.024);
      const antL = sdCapsule(x, ly, lz, -0.022, 0.05, 0.27, -0.10, 0.16, 0.42, 0.014, 0.010);
      const antR = sdCapsule(x, ly, lz,  0.022, 0.05, 0.27,  0.10, 0.16, 0.42, 0.014, 0.010);

      let body = smin(head, thorax, 0.025);
      body = smin(body, abdomen, 0.025);
      body = smin(body, Math.min(antL, antR), 0.012);

      // 2. Mirrored Monarch forewings & hindwings rotated around body axis by wingAngle
      const ax = Math.abs(x) - 0.035;
      const u = ax * cosA + ly * sinA;
      const v = -ax * sinA + ly * cosA;

      // Broad swept monarch forewing + rounded scalloped hindwing
      const forewing = sdEllipsoid(u, v, lz, 0.28, 0.0, 0.12, 0.30, 0.028, 0.22);
      const hindwing = sdEllipsoid(u, v, lz, 0.21, 0.0, -0.17, 0.21, 0.026, 0.20);
      const wings = smin(forewing, hindwing, 0.06);

      if (wings < body) return { d: wings, mat: 'wing' };
      return { d: body, mat: 'body' };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'body') {
        return shade > 0.62 ? 'b1' : 'k';
      }

      // Compute local wing coordinates for crisp monarch pattern
      const dy = y - by;
      const ly = dy * cosP - z * sinP;
      const lz = dy * sinP + z * cosP;
      const ax = Math.abs(x) - 0.035;
      const u = ax * cosA + ly * sinA;

      // Normalized radial distance inside forewing & hindwing to detect outer border
      const fwR = Math.hypot((u - 0.28) / 0.30, (lz - 0.12) / 0.22);
      const hwR = Math.hypot((u - 0.21) / 0.21, (lz + 0.17) / 0.20);
      const rim = Math.min(fwR, hwR);

      // Outer dark monarch border with tiny white edge dots
      if (rim > 0.78) {
        const dotWave = Math.sin(u * 26 + lz * 26) * Math.cos(lz * 24 - u * 18);
        if (rim > 0.84 && dotWave > 0.58) return 'w';
        return 'k';
      }

      // Crisp dark wing veins radiating from thorax
      const ang = Math.atan2(lz - 0.02, Math.max(0.02, u));
      const vein = Math.abs(Math.sin(ang * 4.5));
      if (vein < 0.09 && u > 0.10) return 'k';

      // Vibrant monarch orange-and-gold gradient
      const glow = shade + (1.0 - rim) * 0.22;
      return glow > 0.82 ? 'g' : glow > 0.60 ? 'o2' : glow > 0.36 ? 'o1' : 'o0';
    };

    pack = build27Pack(BUTTERFLY_PW, BUTTERFLY_PH, 0.90, 0.78, BUTTERFLY_PAL, evalFn, shadeFn);
    butterflyCache.set(pose, pack);
  }
  return pack;
}

export function getButterflyPosePack(...args: Parameters<typeof buildButterflyPosePack>): ReturnType<typeof buildButterflyPosePack> {
  return registerAnimalSpritePack(buildButterflyPosePack(...args), { module: './Butterfly.ts', factory: 'getButterflyPosePack', args }, buildButterflyPosePack);
}

const BUTTERFLY_FLUTTER: readonly ButterflyPoseName[] = [
  'flutter0', 'flutter1', 'flutter2', 'flutter3', 'flutter4', 'flutter5',
];

export class Butterfly extends BasePixelAnimal {
  readonly position = new THREE.Vector3();
  private readonly vel = new THREE.Vector3();
  private readonly home = new THREE.Vector3();
  private targetYaw = rand(0, Math.PI * 2);
  private targetAlt = rand(0.75, 1.55);
  private flutterT = rand(0, 6.0);
  private wanderT = 0;
  private wanderDur = rand(1.4, 3.2);
  private bobPhase = rand(0, Math.PI * 2);

  constructor(ctx: GameContext, startPos: THREE.Vector3) {
    super(
      ctx,
      getButterflyPosePack('flutter2').getView(2, 0)!,
      BUTTERFLY_PW,
      BUTTERFLY_PH,
      BUTTERFLY_W,
      BUTTERFLY_H,
      'ButterflyBillboard',
    );
    this.hp = 10;
    this.maxHp = 10;
    this.home.copy(startPos);
    this.position.set(startPos.x, startPos.y + this.targetAlt, startPos.z);
    this.facing = this.targetYaw;
    this.hurtboxes.push({
      a: new THREE.Vector3(),
      b: new THREE.Vector3(),
      radius: 0.22,
      tag: 'body',
      enabled: true,
    });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.copy(this.position);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y - 0.08, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.08, this.position.z);
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
    this.vel.x += hit.dir.x * 3.0;
    this.vel.z += hit.dir.z * 3.0;
    this.vel.y = 1.5;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    }
    return res;
  }

  update(dt: number, target: EnemyTarget | null, camera: THREE.Camera, drawingBufferSize?: THREE.Vector2) {
    if (dt > 0) {
      this.flash = Math.max(0, this.flash - dt * 4.5);

      if (!this.alive) {
        this.deadT += dt;
        this.vel.x = damp(this.vel.x, 0, 5, dt);
        this.vel.z = damp(this.vel.z, 0, 5, dt);
        this.vel.y = damp(this.vel.y, -1.6, 4, dt);
        this.position.addScaledVector(this.vel, dt);
        if (this.position.y < this.home.y + 0.04) {
          this.position.y = this.home.y + 0.04;
          this.vel.set(0, 0, 0);
        }
      } else {
        this.wanderT += dt;
        this.bobPhase += dt * 3.4;

        const dist = target && target.alive
          ? Math.hypot(target.position.x - this.position.x, target.position.z - this.position.z)
          : 999;

        const fleeing = dist < 2.8;
        if (fleeing && target) {
          this.targetYaw = Math.atan2(this.position.x - target.position.x, this.position.z - target.position.z)
            + Math.sin(this.bobPhase * 1.3) * 0.35;
          this.targetAlt = 1.55;
        } else if (this.wanderT >= this.wanderDur) {
          this.wanderT = 0;
          this.wanderDur = rand(1.4, 3.0);
          const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
          this.targetYaw = toHome > 6.0
            ? Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.6, 0.6)
            : this.facing + rand(-1.8, 1.8);
          this.targetAlt = rand(0.65, 1.75);
        }

        this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * (fleeing ? 7.5 : 3.5));
        const speed = fleeing ? 2.6 : 0.95;
        this.vel.x = damp(this.vel.x, Math.sin(this.facing) * speed, 4.5, dt);
        this.vel.z = damp(this.vel.z, Math.cos(this.facing) * speed, 4.5, dt);

        const desiredY = this.home.y + this.targetAlt + Math.sin(this.bobPhase) * 0.14;
        this.vel.y = damp(this.vel.y, (desiredY - this.position.y) * 2.4, 4.0, dt);

        this.position.addScaledVector(this.vel, dt);
        this.position.y = Math.max(this.home.y + 0.55, Math.min(this.home.y + 1.95, this.position.y));

        this.flutterT += dt * (fleeing ? 16.0 : 10.5);
        this.bodyPitch = damp(this.bodyPitch, Math.max(-0.2, Math.min(0.2, this.vel.y * 0.12)), 8, dt);
      }

      this.syncHurtbox();
    }

    const poseIdx = ((Math.floor(this.flutterT) % BUTTERFLY_FLUTTER.length) + BUTTERFLY_FLUTTER.length) % BUTTERFLY_FLUTTER.length;
    const pose: ButterflyPoseName = this.alive ? BUTTERFLY_FLUTTER[poseIdx] : 'flutter2';
    this.renderBillboard(getButterflyPosePack(pose), this.position.y, camera, drawingBufferSize);
  }
}
