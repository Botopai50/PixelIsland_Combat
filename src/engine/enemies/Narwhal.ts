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
// NARVAL (Arctic Narwhal) — 80×34 @ ANIMAL_PPU
// ============================================================================
export type NarwhalPoseName =
  | 'swim0' | 'swim1' | 'swim2' | 'swim3' | 'swim4' | 'swim5'
  | 'breach0' | 'breach1' | 'breach2' | 'breach3';

export const NARWHAL_PW = 80;
export const NARWHAL_PH = 34;
export const NARWHAL_W = NARWHAL_PW / ANIMAL_PPU;
export const NARWHAL_H = NARWHAL_PH / ANIMAL_PPU;

const NARWHAL_PAL: Record<string, [number, number, number]> = {
  k:  [0x12, 0x18, 0x24], // 1px dark Arctic slate outline / glossy eyes
  // Mottled Arctic blue-slate & frost-grey dappled back
  n0: [0x26, 0x35, 0x4c], // deep Arctic slate-navy shadow
  n1: [0x42, 0x58, 0x76], // cool blue-slate mid-dark
  n2: [0x6c, 0x84, 0xa2], // mottled Arctic blue-grey
  n3: [0x9e, 0xb2, 0xc8], // frost-grey dapple highlight
  n4: [0xc8, 0xd8, 0xe8], // pale icy dorsal sheen
  // Pure snow-white belly
  b0: [0xc4, 0xd2, 0xe0], // cool ice-blue belly shadow
  b1: [0xeb, 0xf2, 0xf8], // snow-white belly mid
  b2: [0xff, 0xff, 0xff], // pure snow-white belly & eye glint
  // Extra-long spiraled ivory-gold unicorn tusk
  t0: [0x9c, 0x82, 0x54], // helical spiral groove shadow
  t1: [0xd4, 0xbc, 0x86], // warm ivory-gold tusk mid
  t2: [0xfa, 0xee, 0xc8], // bright polished ivory-gold highlight
};

interface NarwhalPose {
  bodyY: number;
  pitch: number;      // overall body pitch (+ = nose/tusk raised up)
  arch: number;       // spine flex
  tailBeat: number;   // vertical fluke undulation (-1..+1)
  flipperSweep: number;
}

const NARWHAL_POSES: Record<NarwhalPoseName, NarwhalPose> = {
  // 6-frame graceful undulating Arctic whale glide
  swim0: { bodyY:  0.00, pitch:  0.03, arch:  0.04, tailBeat:  0.14, flipperSweep:  0.04 },
  swim1: { bodyY:  0.02, pitch:  0.05, arch:  0.02, tailBeat:  0.04, flipperSweep:  0.02 },
  swim2: { bodyY:  0.01, pitch:  0.00, arch: -0.03, tailBeat: -0.09, flipperSweep: -0.03 },
  swim3: { bodyY: -0.01, pitch: -0.03, arch: -0.05, tailBeat: -0.15, flipperSweep: -0.05 },
  swim4: { bodyY: -0.02, pitch: -0.01, arch: -0.02, tailBeat: -0.04, flipperSweep: -0.02 },
  swim5: { bodyY:  0.00, pitch:  0.02, arch:  0.03, tailBeat:  0.09, flipperSweep:  0.03 },

  // 4-frame playful arching surface breach raising the spiraled tusk!
  breach0: { bodyY:  0.03, pitch:  0.42, arch:  0.08, tailBeat: -0.16, flipperSweep:  0.08 },
  breach1: { bodyY:  0.08, pitch:  0.18, arch:  0.13, tailBeat: -0.08, flipperSweep:  0.12 },
  breach2: { bodyY:  0.05, pitch: -0.18, arch:  0.11, tailBeat:  0.06, flipperSweep:  0.06 },
  breach3: { bodyY: -0.02, pitch: -0.44, arch:  0.05, tailBeat:  0.16, flipperSweep: -0.04 },
};

const narwhalCache = new Map<NarwhalPoseName, Boar27Pack>();

 function buildNarwhalPosePack(pose: NarwhalPoseName): Boar27Pack {
  let pack = narwhalCache.get(pose);
  if (!pack) {
    const P = NARWHAL_POSES[pose];
    const cosP = Math.cos(P.pitch);
    const sinP = Math.sin(P.pitch);

    const evalFn: SdfEvaluator = (x, y, z) => {
      // Transform into pitched whale space (shifted slightly back so the long front tusk fits cleanly!)
      const dy = y - P.bodyY;
      const lz = z * cosP + dy * sinP;
      const ly = -z * sinP + dy * cosP;

      const arch = P.arch;
      const tb = P.tailBeat;

      // 1. Plump rounded Arctic whale body: smooth bulbous forehead, NO dorsal fin (low dorsal ridge)
      const headMelon = sdEllipsoid(x, ly, lz, 0, 0.015 - arch * 0.08, 0.24, 0.165, 0.160, 0.175);
      const chest = sdEllipsoid(x, ly, lz, 0, 0.01 + arch * 0.20, 0.02, 0.205, 0.195, 0.28);
      const midBody = sdEllipsoid(x, ly, lz, 0, 0.01 + arch * 0.26, -0.24, 0.175, 0.165, 0.26);
      const peduncle = sdCapsule(
        x, ly, lz,
        0, 0.0 + arch * 0.10, -0.40,
        0, -0.02 + tb * 0.72 - arch * 0.28, -0.78,
        0.125, 0.046,
      );
      const dorsalRidge = sdEllipsoid(x, ly, lz, 0, 0.165 + arch * 0.24, -0.22, 0.032, 0.036, 0.22);

      let body = smin(headMelon, chest, 0.08);
      body = smin(body, midBody, 0.09);
      body = smin(body, peduncle, 0.08);
      body = smin(body, dorsalRidge, 0.035);

      // 2. Short curved pectoral flippers
      const fs = P.flipperSweep;
      const flipL = sdEllipsoid(x, ly, lz, -0.23, -0.08 + fs * 0.14, 0.04 - fs * 0.08, 0.12, 0.028, 0.085);
      const flipR = sdEllipsoid(x, ly, lz,  0.23, -0.08 + fs * 0.14, 0.04 - fs * 0.08, 0.12, 0.028, 0.085);
      body = smin(body, Math.min(flipL, flipR), 0.035);

      // 3. Wide convex notched tail flukes
      const ty = -0.02 + tb * 0.76 - arch * 0.28;
      const flukeL = sdEllipsoid(x, ly, lz, -0.155, ty, -0.82, 0.175, 0.024, 0.092);
      const flukeR = sdEllipsoid(x, ly, lz,  0.155, ty, -0.82, 0.175, 0.024, 0.092);
      body = smin(body, Math.min(flukeL, flukeR), 0.028);

      // 4. Extra-long, straight, tapered spiraled ivory-gold unicorn tusk!
      const tusk = sdCapsule(
        x, ly, lz,
        0, 0.005 - arch * 0.08, 0.36,
        0, 0.020 - arch * 0.10, 1.06,
        0.036, 0.010,
      );

      // 5. Friendly glossy dark eyes with white glint
      const eyeL = sdEllipsoid(x, ly, lz, -0.145, 0.015 - arch * 0.08, 0.27, 0.026, 0.026, 0.026);
      const eyeR = sdEllipsoid(x, ly, lz,  0.145, 0.015 - arch * 0.08, 0.27, 0.026, 0.026, 0.026);
      const eyes = Math.min(eyeL, eyeR);

      const glintL = sdEllipsoid(x, ly, lz, -0.155, 0.025 - arch * 0.08, 0.288, 0.011, 0.011, 0.011);
      const glintR = sdEllipsoid(x, ly, lz,  0.155, 0.025 - arch * 0.08, 0.288, 0.011, 0.011, 0.011);
      const glints = Math.min(glintL, glintR);

      let d = body, mat = 'skin';
      if (tusk < d) { d = tusk; mat = 'tusk'; }
      if (eyes < d) { d = eyes; mat = 'eye'; }
      if (glints < d) { d = glints; mat = 'glint'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'glint') return 'b2';
      if (mat === 'eye') return 'k';

      const dy = y - P.bodyY;
      const lz = z * cosP + dy * sinP;
      const ly = -z * sinP + dy * cosP;

      if (mat === 'tusk') {
        // Helical spiral groove shading bands along the unicorn tusk!
        const ang = Math.atan2(ly - 0.01, x);
        const spiral = Math.sin(lz * 26.0 + ang * 2.0);
        if (spiral < -0.45) return 't0';
        return shade > 0.56 ? 't2' : 't1';
      }

      // Pure snow-white belly fading smoothly from the mottled Arctic back
      if (ly < -0.055) {
        return shade > 0.62 ? 'b2' : shade > 0.30 ? 'b1' : 'b0';
      }

      // Mottled Arctic blue-slate & frost-grey dappled back
      const dapple = Math.sin(lz * 20 + x * 24) * Math.cos(ly * 22 - lz * 15);
      const wet = ly > 0.08 ? 0.08 : 0;
      const s = shade + wet + dapple * 0.14;
      return s > 0.84 ? 'n4'
        : s > 0.64 ? 'n3'
        : s > 0.44 ? 'n2'
        : s > 0.24 ? 'n1'
        : 'n0';
    };

    pack = build27Pack(NARWHAL_PW, NARWHAL_PH, 1.48, 0.66, NARWHAL_PAL, evalFn, shadeFn);
    narwhalCache.set(pose, pack);
  }
  return pack;
}

export function getNarwhalPosePack(...args: Parameters<typeof buildNarwhalPosePack>): ReturnType<typeof buildNarwhalPosePack> {
  return registerAnimalSpritePack(buildNarwhalPosePack(...args), { module: './Narwhal.ts', factory: 'getNarwhalPosePack', args }, buildNarwhalPosePack);
}

function pickCycle<T>(frames: readonly T[], idx: number): T {
  return sampleAnimalCycle(frames, idx);
}

const NARWHAL_SWIM: readonly NarwhalPoseName[] = ['swim0', 'swim1', 'swim2', 'swim3', 'swim4', 'swim5'];
const NARWHAL_BREACH: readonly NarwhalPoseName[] = ['breach0', 'breach1', 'breach2', 'breach3'];

export class Narwhal extends BasePixelAnimal {
  readonly position = new THREE.Vector3();
  private readonly vel = new THREE.Vector3();
  private readonly pondCenter = new THREE.Vector3();
  private orbitAngle = rand(0, Math.PI * 2);
  private orbitRadius = rand(1.6, 3.4);
  private orbitDir = Math.random() < 0.5 ? 1 : -1;
  private swimT = rand(0, 6.0);
  private breachTimer = rand(3.5, 7.0);
  private breaching = false;
  private breachT = 0;
  private readonly breachDur = 1.15;

  constructor(ctx: GameContext, startPos: THREE.Vector3, pondCenter?: THREE.Vector3) {
    super(
      ctx,
      getNarwhalPosePack('swim0').getView(2, 0)!,
      NARWHAL_PW,
      NARWHAL_PH,
      NARWHAL_W,
      NARWHAL_H,
      'NarwhalBillboard',
    );
    this.hp = 120;
    this.maxHp = 120;
    this.pondCenter.copy(pondCenter ?? startPos);
    this.position.set(
      this.pondCenter.x + Math.cos(this.orbitAngle) * this.orbitRadius,
      this.pondCenter.y + 0.15,
      this.pondCenter.z + Math.sin(this.orbitAngle) * this.orbitRadius,
    );
    this.facing = this.orbitAngle + (this.orbitDir > 0 ? Math.PI * 0.5 : -Math.PI * 0.5);
    this.hurtboxes.push({
      a: new THREE.Vector3(),
      b: new THREE.Vector3(),
      radius: 0.48,
      tag: 'body',
      enabled: true,
    });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.copy(this.position);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y - 0.16, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.16, this.position.z);
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
    this.vel.x += hit.dir.x * 2.2;
    this.vel.z += hit.dir.z * 2.2;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else if (!this.breaching) {
      this.breaching = true;
      this.breachT = 0;
    }
    return res;
  }

  update(dt: number, _target: EnemyTarget | null, camera: THREE.Camera, drawingBufferSize?: THREE.Vector2) {
    if (dt > 0) {
      this.flash = Math.max(0, this.flash - dt * 4.5);

      if (!this.alive) {
        this.deadT += dt;
        this.position.y = damp(this.position.y, this.pondCenter.y - 0.20, 3, dt);
      } else {
        const angularSpeed = (this.breaching ? 0.85 : 0.52) * this.orbitDir;
        this.orbitAngle += angularSpeed * dt;
        this.swimT += dt * 4.2;

        const targetX = this.pondCenter.x + Math.cos(this.orbitAngle) * this.orbitRadius;
        const targetZ = this.pondCenter.z + Math.sin(this.orbitAngle) * this.orbitRadius;
        const dx = targetX - this.position.x;
        const dz = targetZ - this.position.z;
        const desiredYaw = Math.atan2(dx, dz);
        this.facing += angleDiff(this.facing, desiredYaw) * Math.min(1, dt * 5.0);

        this.position.x = damp(this.position.x, targetX, 3.6, dt);
        this.position.z = damp(this.position.z, targetZ, 3.6, dt);

        if (this.breaching) {
          this.breachT += dt;
          const u = Math.min(1, this.breachT / this.breachDur);
          const arc = Math.sin(u * Math.PI) * 0.82;
          this.position.y = this.pondCenter.y + 0.14 + arc;
          if (this.breachT >= this.breachDur) {
            this.breaching = false;
            this.breachTimer = rand(3.5, 7.2);
            this.orbitRadius = rand(1.6, 3.4);
          }
        } else {
          this.breachTimer -= dt;
          if (this.breachTimer <= 0) {
            this.breaching = true;
            this.breachT = 0;
          }
          const bob = Math.sin(this.swimT * 0.85) * 0.06;
          this.position.y = damp(this.position.y, this.pondCenter.y + 0.15 + bob, 4.5, dt);
        }
      }
      this.syncHurtbox();
    }

    let pose: NarwhalPoseName;
    if (!this.alive) {
      pose = 'swim0';
    } else if (this.breaching) {
      const idx = Math.min(NARWHAL_BREACH.length - 1, Math.floor((this.breachT / this.breachDur) * NARWHAL_BREACH.length));
      pose = NARWHAL_BREACH[idx];
    } else {
      pose = pickCycle(NARWHAL_SWIM, this.swimT);
    }

    this.renderBillboard(getNarwhalPosePack(pose), this.position.y, camera, drawingBufferSize);
  }
}
