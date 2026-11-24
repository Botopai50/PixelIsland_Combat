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
// ABELHA (Bumblebee) — 18×16 @ 56 PPU (0.32m × 0.29m)
// ============================================================================
export type BeePoseName = 'buzz0' | 'buzz1' | 'buzz2' | 'buzz3';

export const BEE_PW = 18;
export const BEE_PH = 16;
export const BEE_W = BEE_PW / ANIMAL_PPU;
export const BEE_H = BEE_PH / ANIMAL_PPU;

const BEE_PAL: Record<string, [number, number, number]> = {
  k:  [0x14, 0x11, 0x10], // crisp outline / black stripes / stinger / antennae
  s0: [0x2b, 0x24, 0x22], // dark charcoal-black head & stripe highlight
  y0: [0xb8, 0x74, 0x0e], // honey-amber shadow
  y1: [0xed, 0xa8, 0x1a], // warm golden-yellow midtone
  y2: [0xff, 0xd4, 0x3b], // bright sunlit golden-yellow
  y3: [0xff, 0xee, 0x88], // fuzzy golden top highlight
  w0: [0xb8, 0xd8, 0xe8], // pale sky-blue wing shadow
  W:  [0xf2, 0xf9, 0xff], // bright pale sky-white wing highlight
};

interface BeePose {
  bodyY: number;
  wingY: number;
  wingSpan: number;
  wingSweep: number;
}

const BEE_POSES: Record<BeePoseName, BeePose> = {
  buzz0: { bodyY: -0.02, wingY: 0.42,  wingSpan: 0.44, wingSweep: -0.06 },
  buzz1: { bodyY:  0.00, wingY: 0.18,  wingSpan: 0.54, wingSweep: -0.02 },
  buzz2: { bodyY:  0.03, wingY: -0.04, wingSpan: 0.46, wingSweep:  0.02 },
  buzz3: { bodyY:  0.01, wingY: 0.22,  wingSpan: 0.52, wingSweep: -0.04 },
};

const beeCache = new Map<BeePoseName, Boar27Pack>();
 function buildBeePosePack(pose: BeePoseName): Boar27Pack {
  let pack = beeCache.get(pose);
  if (!pack) {
    const P = BEE_POSES[pose];
    const by = P.bodyY;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // Plump fuzzy abdomen & thorax
      const abdomen = sdEllipsoid(x, y, z, 0, -0.04 + by, -0.18, 0.24, 0.23, 0.30);
      const thorax = sdEllipsoid(x, y, z, 0, -0.01 + by, 0.14, 0.22, 0.22, 0.20);
      const head = sdEllipsoid(x, y, z, 0, -0.02 + by, 0.36, 0.145, 0.145, 0.135);
      let body = smin(abdomen, thorax, 0.06);
      body = smin(body, head, 0.04);

      // Tiny pointed stinger at rear
      const stinger = sdCapsule(x, y, z, 0, -0.06 + by, -0.44, 0, -0.09 + by, -0.57, 0.045, 0.012);

      // Cute curved antennae
      const antL = sdCapsule(x, y, z, -0.06, 0.09 + by, 0.42, -0.13, 0.22 + by, 0.52, 0.024, 0.016);
      const antR = sdCapsule(x, y, z,  0.06, 0.09 + by, 0.42,  0.13, 0.22 + by, 0.52, 0.024, 0.016);
      const antennae = Math.min(antL, antR);

      // Rapid-fluttering pale sky-white wings
      const wingL = sdCapsule(
        x, y, z,
        -0.10, 0.14 + by, 0.10,
        -P.wingSpan, 0.14 + by + P.wingY, 0.02 + P.wingSweep,
        0.095, 0.115,
      );
      const wingR = sdCapsule(
        x, y, z,
        0.10, 0.14 + by, 0.10,
        P.wingSpan, 0.14 + by + P.wingY, 0.02 + P.wingSweep,
        0.095, 0.115,
      );
      const wings = Math.min(wingL, wingR);

      let d = body, mat = 'body';
      if (z > 0.26) mat = 'head';
      if (stinger < d) { d = stinger; mat = 'stinger'; }
      if (antennae < d) { d = antennae; mat = 'antenna'; }
      if (wings < d) { d = wings; mat = 'wing'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, _x, _y, z) => {
      if (mat === 'wing') return shade > 0.44 ? 'W' : 'w0';
      if (mat === 'stinger' || mat === 'antenna') return 'k';
      if (mat === 'head') return shade > 0.62 ? 's0' : 'k';

      // Crisp golden-yellow & dark-black bumblebee stripes along the abdomen/thorax
      const isBlackStripe =
        z < -0.34 ||
        (z > -0.22 && z < -0.11) ||
        (z > 0.00 && z < 0.09);
      if (isBlackStripe) {
        return shade > 0.68 ? 's0' : 'k';
      }
      return shade > 0.78 ? 'y3' : shade > 0.50 ? 'y2' : shade > 0.24 ? 'y1' : 'y0';
    };

    pack = build27Pack(BEE_PW, BEE_PH, 0.86, 0.74, BEE_PAL, evalFn, shadeFn);
    beeCache.set(pose, pack);
  }
  return pack;
}

export function getBeePosePack(...args: Parameters<typeof buildBeePosePack>): ReturnType<typeof buildBeePosePack> {
  return registerAnimalSpritePack(buildBeePosePack(...args), { module: './Bee.ts', factory: 'getBeePosePack', args }, buildBeePosePack);
}

// ============================================================================
// INSTÂNCIA NA ARENA (Bee)
// ============================================================================
const BEE_BUZZ: readonly BeePoseName[] = ['buzz0', 'buzz1', 'buzz2', 'buzz3'];

/**
 * Bumblebee: hovers and buzzes 0.5–1.6m above the ground, weaving in small loops.
 */
export class Bee extends BasePixelAnimal {
  readonly position = new THREE.Vector3();
  private readonly home = new THREE.Vector3();
  private readonly vel = new THREE.Vector3();
  private loopAngle = rand(0, Math.PI * 2);
  private loopRadius = rand(0.9, 2.0);
  private hoverAlt = rand(0.65, 1.35);
  private buzzT = rand(0, 10);

  constructor(ctx: GameContext, pos: THREE.Vector3) {
    super(ctx, getBeePosePack('buzz0').getView(2, 0)!, BEE_PW, BEE_PH, BEE_W, BEE_H, 'BeeBillboard');
    this.hp = 10;
    this.maxHp = 10;
    this.home.copy(pos);
    this.position.set(pos.x, pos.y + this.hoverAlt, pos.z);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.22, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.copy(this.position);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y - 0.10, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.10, this.position.z);
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
    this.vel.y = 2.0;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    }
    return res;
  }

  update(dt: number, _target: EnemyTarget | null, camera: THREE.Camera, drawingBufferSize?: THREE.Vector2) {
    if (dt > 0) {
      this.buzzT += dt;
      this.flash = Math.max(0, this.flash - dt * 4.5);

      if (!this.alive) {
        this.deadT += dt;
        this.vel.x = damp(this.vel.x, 0, 5, dt);
        this.vel.z = damp(this.vel.z, 0, 5, dt);
        this.vel.y -= 16 * dt;
        this.position.addScaledVector(this.vel, dt);
        if (this.position.y < this.home.y + 0.10) {
          this.position.y = this.home.y + 0.10;
          this.vel.y = 0;
        }
      } else {
        // Figure-8 / small weaving loops 0.5–1.6m above ground
        this.loopAngle += dt * 1.45;
        const targetX = this.home.x + Math.cos(this.loopAngle) * this.loopRadius;
        const targetZ = this.home.z + Math.sin(this.loopAngle * 2.0) * (this.loopRadius * 0.65);
        const bobY = Math.sin(this.buzzT * 3.4) * 0.22 + Math.cos(this.buzzT * 1.9) * 0.10;
        const targetY = this.home.y + Math.max(0.5, Math.min(1.6, this.hoverAlt + bobY));

        this.vel.x = damp(this.vel.x, (targetX - this.position.x) * 3.2, 5.5, dt);
        this.vel.y = damp(this.vel.y, (targetY - this.position.y) * 3.6, 6.0, dt);
        this.vel.z = damp(this.vel.z, (targetZ - this.position.z) * 3.2, 5.5, dt);
        this.position.addScaledVector(this.vel, dt);

        if (Math.hypot(this.vel.x, this.vel.z) > 0.12) {
          const desiredYaw = Math.atan2(this.vel.x, this.vel.z);
          this.facing += angleDiff(this.facing, desiredYaw) * Math.min(1, dt * 8);
        }
        this.bodyPitch = damp(this.bodyPitch, Math.max(-0.25, Math.min(0.25, this.vel.y * 0.08)), 8, dt);
      }
      this.syncHurtbox();
    }

    const pose: BeePoseName = this.alive ? pickCycle(BEE_BUZZ, this.buzzT * 22.0) : 'buzz2';
    this.renderBillboard(getBeePosePack(pose), this.position.y, camera, drawingBufferSize);
  }
}
