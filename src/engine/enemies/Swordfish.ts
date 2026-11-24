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
// PEIXE-ESPADA (Flagship Swordfish) — 76×32
// ============================================================================
export type SwordfishPoseName =
  | 'swim0' | 'swim1' | 'swim2' | 'swim3' | 'swim4' | 'swim5'
  | 'dart0' | 'dart1' | 'dart2' | 'dart3';

export const SWORDFISH_PW = 76;
export const SWORDFISH_PH = 32;
export const SWORDFISH_W = SWORDFISH_PW / ANIMAL_PPU;
export const SWORDFISH_H = SWORDFISH_PH / ANIMAL_PPU;

/**
 * Metallic deep cobalt-indigo / sapphire-blue dorsal sheen countershaded into
 * gleaming silver-pearl flanks & snow-white belly + dark-slate sword bill.
 */
const SWORDFISH_PAL: Record<string, [number, number, number]> = {
  k:  [0x0b, 0x0f, 0x18], // crisp 1px dark outline / glossy dark-blue pupil
  b0: [0x12, 0x20, 0x42], // deep midnight-cobalt dorsal & fin shadow
  b1: [0x1d, 0x38, 0x70], // rich cobalt-indigo dorsal shadow
  b2: [0x2e, 0x58, 0xa2], // metallic sapphire-blue dorsal midtone
  b3: [0x4c, 0x82, 0xd0], // bright pelagic azure-blue highlight
  b4: [0x82, 0xb4, 0xec], // sunlit icy-blue dorsal rim sheen
  s0: [0x8a, 0x98, 0xae], // silver-pearl flank shadow
  s1: [0xc4, 0xd0, 0xe0], // gleaming silver-pearl flank & iris ring
  W:  [0xf4, 0xf8, 0xff], // snow-white belly & eye glint
  w0: [0x2a, 0x32, 0x44], // dark-slate sword bill shadow
  w1: [0x4c, 0x58, 0x70], // dark-slate sword bill metallic edge
};

interface SwordfishPose {
  bodyY: number;
  tailSway: number; // lateral sweep of tail peduncle & lunate tail fin
  finTuck: number;  // 0 = flared pectorals, 1 = tucked sleek for high-speed dart
}

const SWORDFISH_POSES: Record<SwordfishPoseName, SwordfishPose> = {
  swim0: { bodyY: 0.00,  tailSway: 0.00,  finTuck: 0.0 },
  swim1: { bodyY: 0.01,  tailSway: 0.14,  finTuck: 0.05 },
  swim2: { bodyY: 0.015, tailSway: 0.22,  finTuck: 0.10 },
  swim3: { bodyY: 0.00,  tailSway: 0.00,  finTuck: 0.0 },
  swim4: { bodyY: -0.01, tailSway: -0.14, finTuck: 0.05 },
  swim5: { bodyY: -0.015,tailSway: -0.22, finTuck: 0.10 },

  dart0: { bodyY: 0.00,  tailSway: 0.16,  finTuck: 0.72 },
  dart1: { bodyY: 0.01,  tailSway: 0.00,  finTuck: 0.80 },
  dart2: { bodyY: 0.00,  tailSway: -0.16, finTuck: 0.72 },
  dart3: { bodyY: -0.01, tailSway: 0.00,  finTuck: 0.80 },
};

const SWORDFISH_SWIM: readonly SwordfishPoseName[] = ['swim0', 'swim1', 'swim2', 'swim3', 'swim4', 'swim5'];
const SWORDFISH_DART: readonly SwordfishPoseName[] = ['dart0', 'dart1', 'dart2', 'dart3'];

const swordfishCache = new Map<SwordfishPoseName, Boar27Pack>();

 function buildSwordfishPosePack(pose: SwordfishPoseName): Boar27Pack {
  let pack = swordfishCache.get(pose);
  if (!pack) {
    const P = SWORDFISH_POSES[pose];
    const by = P.bodyY;
    const sw = P.tailSway;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // 1. Sleek, muscular torpedo predator torso & tapered tail peduncle
      const frontTorso = sdEllipsoid(x, y, z, 0, by, 0.16, 0.155, 0.175, 0.42);
      const midBody = sdCapsule(x, y, z, 0, by, 0.06, sw * 0.35, by, -0.44, 0.155, 0.088);
      const peduncle = sdCapsule(x, y, z, sw * 0.35, by, -0.44, sw * 0.75, by, -0.84, 0.085, 0.036);
      const lowerJaw = sdCapsule(x, y, z, 0, by - 0.045, 0.46, 0, by - 0.048, 0.66, 0.046, 0.018);
      let body = smin(smin(frontTorso, midBody, 0.07), peduncle, 0.05);
      body = smin(body, lowerJaw, 0.03);

      // 2. Extra-long, razor-straight, flattened dark-slate sword bill!
      const swordBase = sdCapsule(x, y, z, 0, by + 0.015, 0.48, 0, by + 0.012, 0.88, 0.042, 0.026);
      const swordTip = sdCapsule(x, y, z, 0, by + 0.012, 0.88, 0, by + 0.008, 1.34, 0.026, 0.009);
      const sword = smin(swordBase, swordTip, 0.02);

      // 3. Tall, dramatic, swept-back sickle/crescent dorsal fin!
      const dorsalLead = sdCapsule(x, y, z, 0, by + 0.14, 0.28, 0, by + 0.49, 0.02, 0.032, 0.016);
      const dorsalCurve = sdCapsule(x, y, z, 0, by + 0.49, 0.02, 0, by + 0.42, -0.14, 0.016, 0.012);
      const dorsalWeb = sdCapsule(x, y, z, 0, by + 0.14, 0.14, 0, by + 0.34, -0.02, 0.028, 0.016);
      const dorsal = smin(smin(dorsalLead, dorsalCurve, 0.03), dorsalWeb, 0.04);

      // Small rear second dorsal & anal fin
      const rearDorsal = sdCapsule(x, y, z, sw * 0.55, by + 0.05, -0.60, sw * 0.62, by + 0.13, -0.70, 0.018, 0.010);
      const analFin = sdCapsule(x, y, z, sw * 0.48, by - 0.06, -0.52, sw * 0.58, by - 0.19, -0.66, 0.020, 0.011);

      // 4. Swept-back pectoral fins
      const pecSpan = 0.32 - P.finTuck * 0.12;
      const pecBack = -0.06 - P.finTuck * 0.10;
      const pecL = sdCapsule(x, y, z, -0.12, by - 0.08, 0.20, -pecSpan, by - 0.20, pecBack, 0.026, 0.012);
      const pecR = sdCapsule(x, y, z,  0.12, by - 0.08, 0.20,  pecSpan, by - 0.20, pecBack, 0.026, 0.012);
      const pectorals = Math.min(pecL, pecR);

      // 5. Wide, deeply-forked crescent (lunate) tail fin!
      const tx = sw * 0.75;
      const tailTipX = sw * 1.15;
      const tailUp = sdCapsule(x, y, z, tx, by + 0.01, -0.82, tailTipX, by + 0.38, -1.08, 0.028, 0.012);
      const tailLow = sdCapsule(x, y, z, tx, by - 0.01, -0.82, tailTipX, by - 0.36, -1.08, 0.028, 0.012);
      const tailFork = smin(tailUp, tailLow, 0.035);

      const fins = Math.min(Math.min(dorsal, tailFork), Math.min(pectorals, Math.min(rearDorsal, analFin)));
      body = smin(body, fins, 0.032);

      // 6. Large glossy dark-blue eyes with silvery iris ring
      const eyeL = sdEllipsoid(x, y, z, -0.112, by + 0.042, 0.42, 0.042, 0.042, 0.042);
      const eyeR = sdEllipsoid(x, y, z,  0.112, by + 0.042, 0.42, 0.042, 0.042, 0.042);
      const eyes = Math.min(eyeL, eyeR);

      let d = body;
      let mat = 'body';
      if (fins < body + 0.006 && (y > by + 0.16 || y < by - 0.13 || z < -0.82 || Math.abs(x) > 0.16)) mat = 'fin';
      if (sword < d) { d = sword; mat = 'sword'; }
      if (eyes < d) { d = eyes; mat = 'eye'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, _x, y, z) => {
      if (mat === 'eye') {
        const dy = y - (by + 0.042);
        const dz = z - 0.42;
        if (dy > 0.010 && dz > 0.008) return 'W';
        if (dy * dy + dz * dz < 0.00072) return 'k';
        return 's1'; // silvery iris ring
      }
      if (mat === 'sword') {
        return shade > 0.44 ? 'w1' : 'w0';
      }
      if (mat === 'fin') {
        return shade > 0.68 ? 'b3' : shade > 0.36 ? 'b2' : shade > 0.16 ? 'b1' : 'b0';
      }

      // Countershading: metallic cobalt-indigo/sapphire dorsal -> gleaming silver-pearl flanks -> snow-white belly
      if (y < by - 0.065) {
        return shade > 0.30 ? 'W' : 's1';
      }
      if (y < by + 0.025) {
        return shade > 0.56 ? 'W' : shade > 0.24 ? 's1' : 's0';
      }
      return shade > 0.78 ? 'b4' : shade > 0.56 ? 'b3' : shade > 0.34 ? 'b2' : shade > 0.16 ? 'b1' : 'b0';
    };

    pack = build27Pack(SWORDFISH_PW, SWORDFISH_PH, 1.48, 0.625, SWORDFISH_PAL, evalFn, shadeFn);
    swordfishCache.set(pose, pack);
  }
  return pack;
}

export function getSwordfishPosePack(...args: Parameters<typeof buildSwordfishPosePack>): ReturnType<typeof buildSwordfishPosePack> {
  return registerAnimalSpritePack(buildSwordfishPosePack(...args), { module: './Swordfish.ts', factory: 'getSwordfishPosePack', args }, buildSwordfishPosePack);
}

/**
 * Swordfish: cruises swiftly around the pond and darts in high-speed pelagic bursts.
 */
export class Swordfish extends BasePixelAnimal {
  readonly position = new THREE.Vector3();
  private readonly home = new THREE.Vector3();
  private readonly pondCenter = new THREE.Vector3();
  private readonly vel = new THREE.Vector3();
  private state: 'swim' | 'dart' = 'swim';
  private stateT = 0;
  private stateDur = rand(2.2, 4.0);
  private targetYaw = rand(0, Math.PI * 2);
  private swimAlt = rand(0.28, 0.56);

  constructor(ctx: GameContext, pos: THREE.Vector3, pondCenter?: THREE.Vector3) {
    super(ctx, getSwordfishPosePack('swim0').getView(2, 0)!, SWORDFISH_PW, SWORDFISH_PH, SWORDFISH_W, SWORDFISH_H, 'SwordfishBillboard');
    this.hp = 42;
    this.maxHp = 42;
    this.home.copy(pos);
    this.pondCenter.copy(pondCenter ?? pos);
    this.position.set(pos.x, pos.y + this.swimAlt, pos.z);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.38, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.copy(this.position);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y - 0.15, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.15, this.position.z);
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
    this.vel.x += hit.dir.x * 4.5;
    this.vel.z += hit.dir.z * 4.5;
    this.vel.y = 1.4;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.state = 'dart';
      this.stateT = 0;
      this.stateDur = 1.6;
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
        this.vel.y = damp(this.vel.y, -0.5, 3, dt);
        this.position.addScaledVector(this.vel, dt);
        if (this.position.y < this.home.y + 0.12) {
          this.position.y = this.home.y + 0.12;
          this.vel.y = 0;
        }
      } else {
        const dist = target && target.alive
          ? Math.hypot(target.position.x - this.position.x, target.position.z - this.position.z)
          : 999;

        if (dist < 3.6 && this.state !== 'dart') {
          this.state = 'dart';
          this.stateT = 0;
          this.stateDur = rand(1.1, 1.8);
          if (target) {
            this.targetYaw = Math.atan2(this.position.x - target.position.x, this.position.z - target.position.z) + rand(-0.4, 0.4);
          }
        } else if (this.stateT >= this.stateDur) {
          this.state = this.state === 'dart' ? 'swim' : (Math.random() < 0.35 ? 'dart' : 'swim');
          this.stateT = 0;
          this.stateDur = this.state === 'dart' ? rand(1.0, 1.6) : rand(2.2, 4.0);
          const toPond = Math.hypot(this.pondCenter.x - this.position.x, this.pondCenter.z - this.position.z);
          this.targetYaw = toPond > 4.8
            ? Math.atan2(this.pondCenter.x - this.position.x, this.pondCenter.z - this.position.z) + rand(-0.5, 0.5)
            : this.facing + rand(-1.4, 1.4);
        }

        this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 6.5);
        const speed = this.state === 'dart' ? 5.6 : 2.6;
        this.vel.x = damp(this.vel.x, Math.sin(this.facing) * speed, 6, dt);
        this.vel.z = damp(this.vel.z, Math.cos(this.facing) * speed, 6, dt);
        const desiredY = this.home.y + this.swimAlt + Math.sin(this.stateT * 2.5) * 0.06;
        this.vel.y = damp(this.vel.y, (desiredY - this.position.y) * 3.0, 5, dt);
        this.position.addScaledVector(this.vel, dt);
      }
      this.syncHurtbox();
    }

    let pose: SwordfishPoseName;
    if (!this.alive) pose = 'swim0';
    else if (this.state === 'dart') pose = pickCycle(SWORDFISH_DART, this.stateT * 11.0);
    else pose = pickCycle(SWORDFISH_SWIM, this.stateT * 6.5);

    this.renderBillboard(getSwordfishPosePack(pose), this.position.y, camera, drawingBufferSize);
  }
}
