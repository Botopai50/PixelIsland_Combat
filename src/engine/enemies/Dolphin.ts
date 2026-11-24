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
// GOLFINHO (Bottlenose Dolphin) — 64×36 @ 56 PPU (1.14m × 0.64m)
// ============================================================================
export type DolphinPoseName =
  | 'swim0' | 'swim1' | 'swim2' | 'swim3' | 'swim4' | 'swim5'
  | 'leap0' | 'leap1' | 'leap2' | 'leap3';

export const DOLPHIN_PW = 64;
export const DOLPHIN_PH = 36;
export const DOLPHIN_W = DOLPHIN_PW / ANIMAL_PPU;
export const DOLPHIN_H = DOLPHIN_PH / ANIMAL_PPU;

const DOLPHIN_PAL: Record<string, [number, number, number]> = {
  k:  [0x12, 0x18, 0x24], // crisp 1px dark outline / glossy eye
  d0: [0x26, 0x42, 0x61], // deep ocean-slate shadow
  d1: [0x3c, 0x64, 0x8c], // rich dolphin slate-blue
  d2: [0x5a, 0x89, 0xb5], // glossy ocean-blue midtone
  d3: [0x83, 0xb3, 0xdc], // bright wet-skin highlight
  d4: [0xb8, 0xdc, 0xf5], // sunlit wet specular sheen
  w0: [0xa8, 0xbc, 0xcf], // silver-white belly shadow
  w1: [0xd6, 0xe2, 0xed], // silver-white belly midtone
  W:  [0xf4, 0xf8, 0xfc], // bright silver-white belly, lower jaw & eye glint
};

interface DolphinPose {
  bodyY: number;
  arch: number;
  tailMidY: number;
  flukeY: number;
  flipperLift: number;
}

const DOLPHIN_POSES: Record<DolphinPoseName, DolphinPose> = {
  // 6-frame graceful undulating tail-fluke swim
  swim0: { bodyY:  0.00, arch:  0.02, tailMidY:  0.05, flukeY:  0.14, flipperLift:  0.02 },
  swim1: { bodyY:  0.02, arch:  0.04, tailMidY:  0.00, flukeY:  0.04, flipperLift:  0.00 },
  swim2: { bodyY:  0.01, arch:  0.00, tailMidY: -0.06, flukeY: -0.14, flipperLift: -0.02 },
  swim3: { bodyY: -0.01, arch: -0.02, tailMidY: -0.08, flukeY: -0.20, flipperLift: -0.03 },
  swim4: { bodyY: -0.02, arch:  0.00, tailMidY: -0.03, flukeY: -0.06, flipperLift:  0.00 },
  swim5: { bodyY:  0.00, arch:  0.02, tailMidY:  0.04, flukeY:  0.10, flipperLift:  0.02 },

  // 4-frame arched acrobatic leap
  leap0: { bodyY:  0.02, arch:  0.06, tailMidY: -0.06, flukeY: -0.16, flipperLift: -0.04 },
  leap1: { bodyY:  0.05, arch:  0.14, tailMidY: -0.04, flukeY: -0.12, flipperLift:  0.02 },
  leap2: { bodyY:  0.04, arch:  0.12, tailMidY: -0.08, flukeY: -0.20, flipperLift:  0.00 },
  leap3: { bodyY:  0.00, arch:  0.04, tailMidY:  0.04, flukeY:  0.10, flipperLift: -0.03 },
};

const dolphinCache = new Map<DolphinPoseName, Boar27Pack>();
 function buildDolphinPosePack(pose: DolphinPoseName): Boar27Pack {
  let pack = dolphinCache.get(pose);
  if (!pack) {
    const P = DOLPHIN_POSES[pose];
    const by = P.bodyY;
    const arch = P.arch;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // 1. Sleek hydrodynamic arched cetacean body
      const torso = sdEllipsoid(x, y, z, 0, 0.02 + by + arch * 0.45, 0.06, 0.185, 0.175, 0.44);
      const melon = sdEllipsoid(x, y, z, 0, 0.01 + by - arch * 0.25, 0.48, 0.135, 0.132, 0.175);
      // Iconic smiling tapered bottlenose rostrum
      const rostrum = sdCapsule(x, y, z, 0, -0.045 + by - arch * 0.35, 0.56, 0, -0.055 + by - arch * 0.45, 0.80, 0.062, 0.026);

      // Narrow tapering tailstock
      const t1Y = -0.01 + by + P.tailMidY - arch * 0.25;
      const t2Y = -0.02 + by + P.flukeY - arch * 0.45;
      const tail1 = sdCapsule(x, y, z, 0, 0.01 + by + arch * 0.2, -0.30, 0, t1Y, -0.66, 0.128, 0.068);
      const tail2 = sdCapsule(x, y, z, 0, t1Y, -0.66, 0, t2Y, -0.94, 0.064, 0.036);

      let body = smin(torso, melon, 0.08);
      body = smin(body, rostrum, 0.035);
      body = smin(body, smin(tail1, tail2, 0.05), 0.07);

      // 2. Curved falcate dorsal fin
      const dBaseY = 0.16 + by + arch * 0.45;
      const dorsal1 = sdCapsule(x, y, z, 0, dBaseY, 0.04, 0, dBaseY + 0.18, -0.08, 0.042, 0.026);
      const dorsal2 = sdCapsule(x, y, z, 0, dBaseY + 0.16, -0.07, 0, dBaseY + 0.24, -0.22, 0.026, 0.012);
      const dorsalFin = smin(dorsal1, dorsal2, 0.025);
      body = smin(body, dorsalFin, 0.035);

      // 3. Swept-back pectoral flippers
      const flY = -0.06 + by + P.flipperLift;
      const flipL = sdCapsule(x, y, z, -0.14, flY, 0.22, -0.34, flY - 0.10, -0.02, 0.052, 0.018);
      const flipR = sdCapsule(x, y, z,  0.14, flY, 0.22,  0.34, flY - 0.10, -0.02, 0.052, 0.018);
      body = smin(body, Math.min(flipL, flipR), 0.03);

      // 4. Wide horizontal notched tail flukes
      const flukeL = sdCapsule(x, y, z, -0.02, t2Y, -0.92, -0.28, t2Y - 0.01, -1.06, 0.044, 0.016);
      const flukeR = sdCapsule(x, y, z,  0.02, t2Y, -0.92,  0.28, t2Y - 0.01, -1.06, 0.044, 0.016);
      body = smin(body, Math.min(flukeL, flukeR), 0.025);

      // 5. Dark glossy eyes
      const eyeY = -0.015 + by - arch * 0.28;
      const eyeL = sdEllipsoid(x, y, z, -0.112, eyeY, 0.50, 0.024, 0.022, 0.024);
      const eyeR = sdEllipsoid(x, y, z,  0.112, eyeY, 0.50, 0.024, 0.022, 0.024);
      const eyes = Math.min(eyeL, eyeR);

      let d = body, mat = 'body';
      if (eyes < d) { d = eyes; mat = 'eye'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'eye') {
        const eyeY = -0.015 + by - arch * 0.28;
        if (y > eyeY + 0.008 && Math.abs(x) > 0.105) return 'W';
        return 'k';
      }

      // Crisp countershaded silver-white belly, throat & lower jaw
      const bellyLine = -0.05 + by + arch * 0.25 * (1 - Math.min(1, Math.abs(z) * 1.1));
      if (y < bellyLine && Math.abs(x) < 0.19 && z > -0.55) {
        return shade > 0.52 ? 'W' : shade > 0.26 ? 'w1' : 'w0';
      }

      // Rich glossy ocean-blue / cool-slate dorsal ramp with bright wet-skin sheen
      if (shade > 0.85) return 'd4';
      return shade > 0.62 ? 'd3' : shade > 0.38 ? 'd2' : shade > 0.18 ? 'd1' : 'd0';
    };

    pack = build27Pack(DOLPHIN_PW, DOLPHIN_PH, 1.16, 0.66, DOLPHIN_PAL, evalFn, shadeFn);
    dolphinCache.set(pose, pack);
  }
  return pack;
}

export function getDolphinPosePack(...args: Parameters<typeof buildDolphinPosePack>): ReturnType<typeof buildDolphinPosePack> {
  return registerAnimalSpritePack(buildDolphinPosePack(...args), { module: './Dolphin.ts', factory: 'getDolphinPosePack', args }, buildDolphinPosePack);
}

// ============================================================================
// INSTÂNCIA NA ARENA (Dolphin)
// ============================================================================
const DOLPHIN_SWIM: readonly DolphinPoseName[] = ['swim0', 'swim1', 'swim2', 'swim3', 'swim4', 'swim5'];
const DOLPHIN_LEAP: readonly DolphinPoseName[] = ['leap0', 'leap1', 'leap2', 'leap3'];

/**
 * Bottlenose Dolphin: swims smoothly around pondCenter and periodically performs graceful arcing leaps.
 */
export class Dolphin extends BasePixelAnimal {
  readonly position = new THREE.Vector3();
  private readonly home = new THREE.Vector3();
  private readonly vel = new THREE.Vector3();
  private orbitAngle = rand(0, Math.PI * 2);
  private orbitRadius = rand(1.8, 3.2);
  private state: 'swim' | 'leap' = 'swim';
  private stateT = 0;
  private stateDur = rand(3.0, 5.5);
  private swimT = rand(0, 10);

  constructor(ctx: GameContext, pos: THREE.Vector3, pondCenter?: THREE.Vector3) {
    super(ctx, getDolphinPosePack('swim0').getView(2, 0)!, DOLPHIN_PW, DOLPHIN_PH, DOLPHIN_W, DOLPHIN_H, 'DolphinBillboard');
    this.hp = 80;
    this.maxHp = 80;
    this.home.copy(pondCenter ?? pos);
    this.position.set(
      this.home.x + Math.cos(this.orbitAngle) * this.orbitRadius,
      this.home.y + 0.18,
      this.home.z + Math.sin(this.orbitAngle) * this.orbitRadius,
    );
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.46, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.copy(this.position);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y - 0.18, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.18, this.position.z);
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
    this.vel.y = 2.6;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.state = 'leap';
      this.stateT = 0;
      this.stateDur = 1.15;
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
        this.position.y = damp(this.position.y, this.home.y + 0.10, 4, dt);
      } else {
        if (this.state === 'swim' && this.stateT >= this.stateDur) {
          this.state = 'leap';
          this.stateT = 0;
          this.stateDur = 1.25;
        } else if (this.state === 'leap' && this.stateT >= this.stateDur) {
          this.state = 'swim';
          this.stateT = 0;
          this.stateDur = rand(3.0, 5.5);
        }

        const angularSpeed = this.state === 'leap' ? 1.05 : 0.72;
        this.orbitAngle += angularSpeed * dt;
        const targetX = this.home.x + Math.cos(this.orbitAngle) * this.orbitRadius;
        const targetZ = this.home.z + Math.sin(this.orbitAngle) * this.orbitRadius;

        let targetY = this.home.y + 0.18 + Math.sin(this.swimT * 2.8) * 0.08;
        if (this.state === 'leap') {
          const u = Math.min(1, this.stateT / this.stateDur);
          targetY = this.home.y + 0.16 + Math.sin(u * Math.PI) * 1.15;
        }

        this.vel.x = damp(this.vel.x, (targetX - this.position.x) * 3.4, 5.5, dt);
        this.vel.y = damp(this.vel.y, (targetY - this.position.y) * 5.0, 6.5, dt);
        this.vel.z = damp(this.vel.z, (targetZ - this.position.z) * 3.4, 5.5, dt);
        this.position.addScaledVector(this.vel, dt);

        if (Math.hypot(this.vel.x, this.vel.z) > 0.15) {
          const desiredYaw = Math.atan2(this.vel.x, this.vel.z);
          this.facing += angleDiff(this.facing, desiredYaw) * Math.min(1, dt * 8);
        }
        const desiredPitch = Math.max(-0.42, Math.min(0.42, this.vel.y * 0.14));
        this.bodyPitch = damp(this.bodyPitch, desiredPitch, 8, dt);
      }
      this.syncHurtbox();
    }

    let pose: DolphinPoseName;
    if (!this.alive) pose = 'swim0';
    else if (this.state === 'leap') {
      const idx = Math.min(3, Math.floor((this.stateT / Math.max(0.01, this.stateDur)) * 4));
      pose = DOLPHIN_LEAP[idx];
    } else {
      pose = pickCycle(DOLPHIN_SWIM, this.swimT * 6.5);
    }

    this.renderBillboard(getDolphinPosePack(pose), this.position.y, camera, drawingBufferSize);
  }
}
