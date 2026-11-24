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
// LIBÉLULA (Dragonfly) — Flagship 26×18 @ 56 PPU
// ============================================================================
const ANIMAL_PPU = 56;

export type DragonflyPoseName =
  | 'hover0' | 'hover1' | 'hover2' | 'hover3'
  | 'dart0' | 'dart1' | 'dart2' | 'dart3';

export const DRAGONFLY_PW = 26;
export const DRAGONFLY_PH = 18;
export const DRAGONFLY_W = DRAGONFLY_PW / ANIMAL_PPU;
export const DRAGONFLY_H = DRAGONFLY_PH / ANIMAL_PPU;

const DRAGONFLY_PAL: Record<string, [number, number, number]> = {
  k:  [0x0e, 0x18, 0x20], // 1px dark outline / segment rings / tiny legs
  c0: [0x0f, 0x5c, 0x73], // deep metallic teal shadow
  c1: [0x18, 0x99, 0xb5], // metallic cyan midtone
  c2: [0x38, 0xd4, 0xe8], // bright turquoise highlight
  c3: [0x9c, 0xf5, 0xff], // specular cyan gleam
  t0: [0x11, 0x59, 0x42], // deep emerald thorax shadow
  t1: [0x1e, 0x96, 0x67], // glossy emerald thorax
  t2: [0x4c, 0xd6, 0x93], // bright emerald-mint highlight
  e0: [0x16, 0x3b, 0x7a], // compound eye deep sapphire
  e1: [0x2b, 0x7c, 0xd4], // compound eye bright blue
  w0: [0x8c, 0xc7, 0xd9], // wing vein / shadow
  w1: [0xc4, 0xec, 0xf7], // shimmering pale-cyan wing
  w2: [0xf0, 0xfc, 0xff], // crisp ice-white wing glint & eye specular
};

interface DragonflyPose {
  bodyY: number;
  pitch: number;      // tail/body pitch
  foreLift: number;   // forewing tip Y offset
  hindLift: number;   // hindwing tip Y offset
  wingSweep: number;  // backward sweep during fast dart
  tailBend: number;   // subtle abdomen flex
}

const DRAGONFLY_POSES: Record<DragonflyPoseName, DragonflyPose> = {
  // Rapid out-of-phase 4-wing hover beat
  hover0: { bodyY: 0.0,    pitch: 0.02,  foreLift:  0.22, hindLift: -0.14, wingSweep: 0.0,   tailBend: 0.0   },
  hover1: { bodyY: 0.014,  pitch: 0.03,  foreLift:  0.04, hindLift:  0.16, wingSweep: 0.0,   tailBend: 0.015 },
  hover2: { bodyY: 0.0,    pitch: 0.02,  foreLift: -0.18, hindLift:  0.20, wingSweep: 0.0,   tailBend: 0.0   },
  hover3: { bodyY: -0.012, pitch: 0.01,  foreLift:  0.06, hindLift: -0.08, wingSweep: 0.0,   tailBend: -0.01 },

  // Aerodynamic forward dart with swept-back shimmering wings
  dart0:  { bodyY: 0.008,  pitch: -0.04, foreLift:  0.18, hindLift: -0.10, wingSweep: 0.14,  tailBend: -0.02 },
  dart1:  { bodyY: 0.016,  pitch: -0.05, foreLift: -0.14, hindLift:  0.16, wingSweep: 0.16,  tailBend: -0.02 },
  dart2:  { bodyY: 0.008,  pitch: -0.04, foreLift:  0.14, hindLift: -0.12, wingSweep: 0.15,  tailBend: -0.01 },
  dart3:  { bodyY: 0.0,    pitch: -0.03, foreLift: -0.10, hindLift:  0.12, wingSweep: 0.13,  tailBend: -0.01 },
};

const dragonflyCache = new Map<DragonflyPoseName, Boar27Pack>();
 function buildDragonflyPosePack(pose: DragonflyPoseName): Boar27Pack {
  let pack = dragonflyCache.get(pose);
  if (!pack) {
    const P = DRAGONFLY_POSES[pose];
    const by = P.bodyY;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // --------------------------------------------------------------------
      // 1. GLOSSY EMERALD THORAX & LONG SLENDER SEGMENTED ABDOMEN
      // --------------------------------------------------------------------
      const thorax = sdEllipsoid(x, y, z, 0, 0.02 + by, 0.14, 0.115, 0.11, 0.16);
      const abd1 = sdCapsule(x, y, z, 0, 0.01 + by, 0.02, 0, -0.01 + by + P.tailBend, -0.38, 0.062, 0.048);
      const abd2 = sdCapsule(x, y, z, 0, -0.01 + by + P.tailBend, -0.36, 0, -0.02 + by + P.tailBend * 1.5, -0.76, 0.048, 0.032);
      // Tiny forked tail claspers (cerci)
      const tailL = sdCapsule(x, y, z, -0.012, -0.02 + by + P.tailBend * 1.5, -0.75, -0.036, -0.015 + by + P.tailBend * 1.5, -0.84, 0.016, 0.009);
      const tailR = sdCapsule(x, y, z,  0.012, -0.02 + by + P.tailBend * 1.5, -0.75,  0.036, -0.015 + by + P.tailBend * 1.5, -0.84, 0.016, 0.009);
      const abdomen = Math.min(smin(abd1, abd2, 0.02), Math.min(tailL, tailR));

      // Tiny tucked legs beneath thorax
      const legL = sdCapsule(x, y, z, -0.06, -0.06 + by, 0.18, -0.09, -0.16 + by, 0.24, 0.018, 0.012);
      const legR = sdCapsule(x, y, z,  0.06, -0.06 + by, 0.18,  0.09, -0.16 + by, 0.24, 0.018, 0.012);
      const legs = Math.min(legL, legR);

      // --------------------------------------------------------------------
      // 2. HEAD & BIG WRAP-AROUND COMPOUND EYES
      // --------------------------------------------------------------------
      const headY = 0.04 + by + P.pitch * 0.2;
      const headZ = 0.34;
      const head = sdEllipsoid(x, y, z, 0, headY, headZ, 0.095, 0.09, 0.09);
      const eyeL = sdEllipsoid(x, y, z, -0.075, headY + 0.015, headZ + 0.025, 0.078, 0.088, 0.082);
      const eyeR = sdEllipsoid(x, y, z,  0.075, headY + 0.015, headZ + 0.025, 0.078, 0.088, 0.082);
      const glintL = sdEllipsoid(x, y, z, -0.095, headY + 0.055, headZ + 0.075, 0.026, 0.026, 0.026);
      const glintR = sdEllipsoid(x, y, z,  0.095, headY + 0.055, headZ + 0.075, 0.026, 0.026, 0.026);
      const eyes = Math.min(eyeL, eyeR);
      const glints = Math.min(glintL, glintR);

      // --------------------------------------------------------------------
      // 3. FOUR OUTSTRETCHED SHIMMERING PALE-CYAN WINGS (2 fore + 2 hind)
      // --------------------------------------------------------------------
      const sw = P.wingSweep;
      const fwY = 0.09 + by + P.foreLift;
      const hwY = 0.08 + by + P.hindLift;

      // Forewings (longer, slightly forward-angled)
      const fwL = sdCapsule(x, y, z, -0.08, 0.09 + by, 0.18, -0.78, fwY, 0.24 - sw, 0.062, 0.036);
      const fwR = sdCapsule(x, y, z,  0.08, 0.09 + by, 0.18,  0.78, fwY, 0.24 - sw, 0.062, 0.036);
      // Hindwings (slightly broader at base, angled back)
      const hwL = sdCapsule(x, y, z, -0.08, 0.08 + by, 0.06, -0.70, hwY, -0.10 - sw, 0.068, 0.036);
      const hwR = sdCapsule(x, y, z,  0.08, 0.08 + by, 0.06,  0.70, hwY, -0.10 - sw, 0.068, 0.036);

      // Flatten wings vertically slightly by blending cleanly without crevices
      const wings = Math.min(Math.min(fwL, fwR), Math.min(hwL, hwR));

      let d = thorax;
      let mat = 'thorax';
      if (abdomen < d) { d = abdomen; mat = 'abdomen'; }
      if (head < d) { d = head; mat = 'thorax'; }
      if (legs < d) { d = legs; mat = 'leg'; }
      if (wings < d) { d = wings; mat = 'wing'; }
      if (eyes < d) { d = eyes; mat = 'eye'; }
      if (glints < d) { d = glints; mat = 'glint'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, _y, z) => {
      if (mat === 'glint') return 'w2';
      if (mat === 'leg') return 'k';
      if (mat === 'eye') return shade > 0.50 ? 'e1' : 'e0';
      if (mat === 'wing') {
        // Shimmering pale-cyan wings with crisp leading-edge highlight
        if (Math.abs(x) > 0.62 || shade > 0.72) return 'w2';
        return shade > 0.35 ? 'w1' : 'w0';
      }
      if (mat === 'thorax') {
        if (shade > 0.72) return 't2';
        if (shade > 0.38) return 't1';
        return 't0';
      }
      // Segmented metallic cyan/turquoise abdomen with dark ring bands
      const seg = Math.sin(z * 44);
      if (seg > 0.76 && z < -0.04) return 'k';
      if (shade > 0.78) return 'c3';
      if (shade > 0.52) return 'c2';
      if (shade > 0.26) return 'c1';
      return 'c0';
    };

    pack = build27Pack(DRAGONFLY_PW, DRAGONFLY_PH, 0.96, 0.66, DRAGONFLY_PAL, evalFn, shadeFn);
    dragonflyCache.set(pose, pack);
  }
  return pack;
}

export function getDragonflyPosePack(...args: Parameters<typeof buildDragonflyPosePack>): ReturnType<typeof buildDragonflyPosePack> {
  return registerAnimalSpritePack(buildDragonflyPosePack(...args), { module: './Dragonfly.ts', factory: 'getDragonflyPosePack', args }, buildDragonflyPosePack);
}

// ============================================================================
// INSTÂNCIA NA ARENA (Dragonfly — Pond-darting AI)
// ============================================================================
function pickCycle<T>(frames: readonly T[], idx: number): T {
  return sampleAnimalCycle(frames, idx);
}

const DRAGONFLY_HOVER: readonly DragonflyPoseName[] = ['hover0', 'hover1', 'hover2', 'hover3'];
const DRAGONFLY_DART: readonly DragonflyPoseName[] = ['dart0', 'dart1', 'dart2', 'dart3'];

export class Dragonfly extends BasePixelAnimal {
  readonly position = new THREE.Vector3();
  private readonly vel = new THREE.Vector3();
  private readonly anchor = new THREE.Vector3();
  private readonly goal = new THREE.Vector3();
  private state: 'hover' | 'dart' = 'hover';
  private stateT = 0;
  private stateDur = rand(0.9, 2.0);
  private wingPhase = rand(0, 10);
  private groundY = 0;

  constructor(ctx: GameContext, startPos: THREE.Vector3, pondCenter?: THREE.Vector3) {
    super(
      ctx,
      getDragonflyPosePack('hover0').getView(2, 0)!,
      DRAGONFLY_PW,
      DRAGONFLY_PH,
      DRAGONFLY_W,
      DRAGONFLY_H,
      'DragonflyBillboard',
    );
    this.hp = 10;
    this.maxHp = 10;
    this.groundY = startPos.y;
    this.anchor.copy(pondCenter ?? startPos);
    this.anchor.y = this.groundY;
    this.position.set(startPos.x, this.groundY + rand(0.55, 1.15), startPos.z);
    this.goal.copy(this.position);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.24, tag: 'body', enabled: true });
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

  private pickDartGoal(awayFrom?: THREE.Vector3) {
    let angle = rand(0, Math.PI * 2);
    if (awayFrom) {
      angle = Math.atan2(this.position.x - awayFrom.x, this.position.z - awayFrom.z) + rand(-0.6, 0.6);
    }
    const radius = rand(1.0, 4.4);
    this.goal.set(
      this.anchor.x + Math.sin(angle) * radius,
      this.groundY + rand(0.42, 1.28),
      this.anchor.z + Math.cos(angle) * radius,
    );
  }

  receiveHit(hit: HitInfo): HitResult {
    const res = emptyResult('flesh');
    if (!this.alive) { res.ignored = true; return res; }
    this.hp = Math.max(0, this.hp - hit.damage);
    res.damage = hit.damage;
    this.flash = 1.0;
    this.vel.x += hit.dir.x * 3.5;
    this.vel.z += hit.dir.z * 3.5;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.state = 'dart';
      this.stateT = 0;
      this.stateDur = 0.85;
      this.pickDartGoal();
    }
    return res;
  }

  update(dt: number, target: EnemyTarget | null, camera: THREE.Camera, drawingBufferSize?: THREE.Vector2) {
    if (dt > 0) {
      this.stateT += dt;
      this.wingPhase += dt * (this.state === 'dart' ? 28 : 22);
      this.flash = Math.max(0, this.flash - dt * 4.5);

      if (!this.alive) {
        this.deadT += dt;
        this.vel.x = damp(this.vel.x, 0, 5, dt);
        this.vel.z = damp(this.vel.z, 0, 5, dt);
        this.vel.y -= 14 * dt;
        this.position.addScaledVector(this.vel, dt);
        if (this.position.y < this.groundY + 0.05) {
          this.position.y = this.groundY + 0.05;
          this.vel.set(0, 0, 0);
        }
      } else {
        const distToPlayer = target && target.alive
          ? Math.hypot(target.position.x - this.position.x, target.position.z - this.position.z)
          : 999;

        // Startle & dart away if player gets close
        if (distToPlayer < 2.5 && this.state === 'hover' && target) {
          this.state = 'dart';
          this.stateT = 0;
          this.stateDur = rand(0.65, 1.05);
          this.pickDartGoal(target.position);
        }

        if (this.state === 'hover') {
          const bobY = this.goal.y + Math.sin(this.stateT * 4.2) * 0.06;
          this.vel.x = damp(this.vel.x, (this.goal.x - this.position.x) * 1.4, 8, dt);
          this.vel.y = damp(this.vel.y, (bobY - this.position.y) * 4.0, 8, dt);
          this.vel.z = damp(this.vel.z, (this.goal.z - this.position.z) * 1.4, 8, dt);

          if (this.stateT >= this.stateDur) {
            this.state = 'dart';
            this.stateT = 0;
            this.stateDur = rand(0.55, 1.05);
            this.pickDartGoal();
          }
        } else {
          const dx = this.goal.x - this.position.x;
          const dy = this.goal.y - this.position.y;
          const dz = this.goal.z - this.position.z;
          const d = Math.hypot(dx, dy, dz);
          if (d > 0.15) {
            const dartSpeed = 5.4;
            this.vel.x = damp(this.vel.x, (dx / d) * dartSpeed, 10, dt);
            this.vel.y = damp(this.vel.y, (dy / d) * dartSpeed * 0.7, 10, dt);
            this.vel.z = damp(this.vel.z, (dz / d) * dartSpeed, 10, dt);
            const desiredYaw = Math.atan2(dx, dz);
            this.facing += angleDiff(this.facing, desiredYaw) * Math.min(1, dt * 14);
          }
          if (d < 0.25 || this.stateT >= this.stateDur) {
            this.state = 'hover';
            this.stateT = 0;
            this.stateDur = rand(0.85, 2.1);
            this.goal.copy(this.position);
          }
        }

        this.position.addScaledVector(this.vel, dt);
        this.position.y = Math.max(this.groundY + 0.35, Math.min(this.groundY + 1.45, this.position.y));
        this.bodyPitch = damp(this.bodyPitch, this.state === 'dart' ? -0.10 : 0.02, 10, dt);
      }
      this.syncHurtbox();
    }

    const pose: DragonflyPoseName = !this.alive
      ? 'hover0'
      : this.state === 'dart'
        ? pickCycle(DRAGONFLY_DART, this.wingPhase)
        : pickCycle(DRAGONFLY_HOVER, this.wingPhase);
    this.renderBillboard(getDragonflyPosePack(pose), this.position.y, camera, drawingBufferSize);
  }
}
