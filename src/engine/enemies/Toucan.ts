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
// TUCANO (Flagship Toco Toucan) — 42×34
// ============================================================================
export type ToucanPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'hop0' | 'hop1' | 'hop2' | 'hop3'
  | 'flap0' | 'flap1' | 'flap2' | 'flap3' | 'flap4' | 'flap5'
  | 'glide0' | 'glide1' | 'glide2';

export const TOUCAN_PW = 42;
export const TOUCAN_PH = 34;
export const TOUCAN_W = TOUCAN_PW / ANIMAL_PPU;
export const TOUCAN_H = TOUCAN_PH / ANIMAL_PPU;

/**
 * Oversized tangerine-orange & golden-yellow bill with jet-black tip spot & base band,
 * snow-white throat bib with golden border, bright cyan eye ring, crimson undertail,
 * and glossy raven-black plumage with cool slate-blue sheen.
 */
const TOUCAN_PAL: Record<string, [number, number, number]> = {
  k:  [0x0c, 0x0d, 0x12], // crisp 1px dark outline / jet-black bill tip spot & base band / pupil
  b0: [0x14, 0x17, 0x22], // deep raven-black shadow
  b1: [0x24, 0x2a, 0x3b], // glossy raven-black plumage
  b2: [0x38, 0x42, 0x5c], // cool slate-blue plumage midtone & legs
  b3: [0x52, 0x62, 0x85], // glossy blue-slate highlight
  b4: [0x72, 0x86, 0xb0], // sunlit blue-silver feather rim
  o0: [0xd4, 0x48, 0x12], // rich tangerine-orange bill shadow
  o1: [0xf7, 0x76, 0x1b], // vibrant tangerine-orange bill midtone
  o2: [0xff, 0xa8, 0x26], // warm golden-orange bill upper & bib border
  y1: [0xff, 0xd8, 0x45], // bright sunlit golden-yellow bill ridge highlight
  w0: [0xd8, 0xde, 0xe8], // snow-white throat bib shadow
  W:  [0xfb, 0xfc, 0xff], // crisp snow-white throat bib & eye glint
  c:  [0x2e, 0xc8, 0xf6], // bright cyan / sky-blue eye ring
  r:  [0xd9, 0x26, 0x38], // crimson-red undertail accent
};

interface ToucanPose {
  bodyY: number;
  bodyPitch: number;
  headY: number;
  headPitch: number;
  billOpen: number;
  wingSpread: number;
  wingMidY: number;
  wingTipY: number;
  tailLift: number;
  legTuck: number;
  legBend: number;
}

const TOUCAN_POSES: Record<ToucanPoseName, ToucanPose> = {
  idle0:  { bodyY: 0.00,  bodyPitch: 0.20, headY: 0.00,  headPitch: 0.00,  billOpen: 0.00, wingSpread: 0.0,  wingMidY: 0.0,   wingTipY: 0.0,   tailLift: 0.04,  legTuck: 0.0, legBend: 0.0 },
  idle1:  { bodyY: 0.02,  bodyPitch: 0.22, headY: 0.03,  headPitch: -0.06, billOpen: 0.06, wingSpread: 0.0,  wingMidY: 0.0,   wingTipY: 0.0,   tailLift: 0.08,  legTuck: 0.0, legBend: 0.0 },
  idle2:  { bodyY: -0.01, bodyPitch: 0.18, headY: -0.01, headPitch: 0.05,  billOpen: 0.00, wingSpread: 0.0,  wingMidY: 0.0,   wingTipY: 0.0,   tailLift: 0.01,  legTuck: 0.0, legBend: 0.04 },

  hop0:   { bodyY: -0.06, bodyPitch: 0.14, headY: -0.03, headPitch: 0.06,  billOpen: 0.05, wingSpread: 0.18, wingMidY: 0.06,  wingTipY: 0.08,  tailLift: 0.12,  legTuck: 0.0, legBend: 0.32 },
  hop1:   { bodyY: 0.11,  bodyPitch: 0.20, headY: 0.04,  headPitch: -0.05, billOpen: 0.15, wingSpread: 0.45, wingMidY: 0.16,  wingTipY: 0.24,  tailLift: -0.02, legTuck: 0.4, legBend: 0.0 },
  hop2:   { bodyY: 0.14,  bodyPitch: 0.16, headY: 0.03,  headPitch: 0.00,  billOpen: 0.10, wingSpread: 0.35, wingMidY: 0.08,  wingTipY: 0.10,  tailLift: 0.02,  legTuck: 0.3, legBend: 0.0 },
  hop3:   { bodyY: -0.04, bodyPitch: 0.20, headY: -0.02, headPitch: 0.04,  billOpen: 0.00, wingSpread: 0.12, wingMidY: 0.02,  wingTipY: 0.02,  tailLift: 0.08,  legTuck: 0.0, legBend: 0.20 },

  flap0:  { bodyY: -0.03, bodyPitch: 0.02, headY: -0.03, headPitch: 0.00,  billOpen: 0.08, wingSpread: 0.88, wingMidY: 0.28,  wingTipY: 0.46,  tailLift: 0.02,  legTuck: 1.0, legBend: 0.0 },
  flap1:  { bodyY: -0.01, bodyPitch: 0.02, headY: -0.03, headPitch: 0.00,  billOpen: 0.10, wingSpread: 0.98, wingMidY: 0.16,  wingTipY: 0.26,  tailLift: 0.01,  legTuck: 1.0, legBend: 0.0 },
  flap2:  { bodyY: 0.03,  bodyPitch: 0.00, headY: -0.04, headPitch: 0.02,  billOpen: 0.04, wingSpread: 1.00, wingMidY: -0.06, wingTipY: -0.20, tailLift: -0.01, legTuck: 1.0, legBend: 0.0 },
  flap3:  { bodyY: 0.05,  bodyPitch: -0.02,headY: -0.04, headPitch: 0.02,  billOpen: 0.00, wingSpread: 0.86, wingMidY: -0.22, wingTipY: -0.40, tailLift: -0.02, legTuck: 1.0, legBend: 0.0 },
  flap4:  { bodyY: 0.02,  bodyPitch: 0.00, headY: -0.03, headPitch: 0.00,  billOpen: 0.00, wingSpread: 0.92, wingMidY: -0.08, wingTipY: -0.14, tailLift: 0.00,  legTuck: 1.0, legBend: 0.0 },
  flap5:  { bodyY: -0.02, bodyPitch: 0.02, headY: -0.03, headPitch: 0.00,  billOpen: 0.06, wingSpread: 0.90, wingMidY: 0.14,  wingTipY: 0.28,  tailLift: 0.02,  legTuck: 1.0, legBend: 0.0 },

  glide0: { bodyY: 0.00,  bodyPitch: 0.00, headY: -0.03, headPitch: 0.00,  billOpen: 0.00, wingSpread: 1.00, wingMidY: 0.08,  wingTipY: 0.14,  tailLift: 0.02,  legTuck: 1.0, legBend: 0.0 },
  glide1: { bodyY: 0.02,  bodyPitch: 0.01, headY: -0.02, headPitch: -0.02, billOpen: 0.00, wingSpread: 1.00, wingMidY: 0.12,  wingTipY: 0.19,  tailLift: 0.04,  legTuck: 1.0, legBend: 0.0 },
  glide2: { bodyY: -0.02, bodyPitch: -0.01,headY: -0.04, headPitch: 0.02,  billOpen: 0.00, wingSpread: 1.00, wingMidY: 0.05,  wingTipY: 0.09,  tailLift: 0.00,  legTuck: 1.0, legBend: 0.0 },
};

const TOUCAN_IDLE: readonly ToucanPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const TOUCAN_HOP: readonly ToucanPoseName[] = ['hop0', 'hop1', 'hop2', 'hop3'];
const TOUCAN_FLAP: readonly ToucanPoseName[] = ['flap0', 'flap1', 'flap2', 'flap3', 'flap4', 'flap5'];
const TOUCAN_GLIDE: readonly ToucanPoseName[] = ['glide0', 'glide1', 'glide0', 'glide2'];

const toucanCache = new Map<ToucanPoseName, Boar27Pack>();

 function buildToucanPosePack(pose: ToucanPoseName): Boar27Pack {
  let pack = toucanCache.get(pose);
  if (!pack) {
    const P = TOUCAN_POSES[pose];
    const by = P.bodyY;
    const hy = 0.18 + by + P.bodyPitch * 0.22 + P.headY;
    const hz = 0.18;
    const billDip = P.headPitch * 0.15;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // 1. Plump, compact glossy raven-black torso & snow-white throat bib area
      const chest = sdEllipsoid(x, y, z, 0, 0.02 + by + P.bodyPitch * 0.08, 0.02, 0.185, 0.175, 0.25);
      const rump = sdEllipsoid(x, y, z, 0, -0.02 + by - P.bodyPitch * 0.06, -0.18, 0.145, 0.135, 0.20);
      const neck = sdCapsule(x, y, z, 0, 0.08 + by + P.bodyPitch * 0.12, 0.10, 0, hy - 0.02, hz - 0.02, 0.135, 0.122);
      const head = sdEllipsoid(x, y, z, 0, hy, hz, 0.132, 0.125, 0.142);
      let body = smin(smin(chest, rump, 0.08), smin(neck, head, 0.045), 0.06);

      // 2. Long squared-off tail with crimson undertail covert
      const tailY = -0.03 + by - P.bodyPitch * 0.16 + P.tailLift;
      const tailL = sdCapsule(x, y, z, -0.04, -0.02 + by, -0.26, -0.09, tailY, -0.68, 0.055, 0.034);
      const tailM = sdCapsule(x, y, z,  0.00, -0.02 + by, -0.26,  0.00, tailY, -0.70, 0.062, 0.038);
      const tailR = sdCapsule(x, y, z,  0.04, -0.02 + by, -0.26,  0.09, tailY, -0.68, 0.055, 0.034);
      const tail = smin(tailM, Math.min(tailL, tailR), 0.032);
      body = smin(body, tail, 0.04);

      // 3. Folded or spread smooth continuous wings (NO dark seam in the middle!)
      if (P.wingSpread < 0.08) {
        const foldL = sdEllipsoid(x, y, z, -0.17, 0.02 + by, -0.08, 0.070, 0.125, 0.26);
        const foldR = sdEllipsoid(x, y, z,  0.17, 0.02 + by, -0.08, 0.070, 0.125, 0.26);
        body = smin(body, Math.min(foldL, foldR), 0.045);
      } else {
        const span = 0.26 + P.wingSpread * 0.56;
        const midX = span * 0.48;
        const tipX = span;
        const midY = 0.04 + by + P.wingMidY;
        const tipY = 0.04 + by + P.wingTipY;

        let wings = 99;
        for (let side = -1; side <= 1; side += 2) {
          const leadIn = sdCapsule(x, y, z, side * 0.13, 0.05 + by, 0.06, side * midX, midY + 0.01, 0.04, 0.082, 0.064);
          const leadOut = sdCapsule(x, y, z, side * midX, midY + 0.01, 0.04, side * tipX, tipY, -0.04, 0.062, 0.036);
          // Solid middle web bridging leading & trailing edge seamlessly
          const webIn = sdCapsule(x, y, z, side * 0.14, 0.03 + by, -0.03, side * (midX * 0.96), midY, -0.06, 0.078, 0.058);
          const webOut = sdCapsule(x, y, z, side * (midX * 0.90), midY, -0.06, side * (tipX * 0.94), tipY - 0.01, -0.11, 0.058, 0.034);
          const trail = sdCapsule(x, y, z, side * 0.15, 0.01 + by, -0.12, side * (midX * 0.92), midY - 0.01, -0.15, 0.068, 0.044);

          const w = smin(
            smin(smin(leadIn, leadOut, 0.045), smin(webIn, webOut, 0.045), 0.065),
            trail,
            0.065,
          );
          wings = Math.min(wings, w);
        }
        body = smin(body, wings, 0.045);
      }

      // 4. Unmistakable oversized arched tangerine-orange & golden-yellow toucan bill!
      const billMidY = hy + 0.028 - billDip * 0.4;
      const billMidZ = hz + 0.28;
      const billTipY = hy - 0.038 - billDip;
      const billTipZ = hz + 0.50;

      const upperArch1 = sdCapsule(x, y, z, 0, hy + 0.022, hz + 0.08, 0, billMidY, billMidZ, 0.082, 0.074);
      const upperArch2 = sdCapsule(x, y, z, 0, billMidY, billMidZ, 0, billTipY, billTipZ, 0.074, 0.026);
      const upperBill = smin(upperArch1, upperArch2, 0.035);

      const lowTipY = billTipY - 0.022 - P.billOpen * 0.06;
      const lowerBill = sdCapsule(
        x, y, z,
        0, hy - 0.035, hz + 0.08,
        0, lowTipY, billTipZ - 0.03,
        0.052, 0.020,
      );
      const bill = smin(upperBill, lowerBill, 0.016);

      // 5. Slate-blue legs & toes
      let legs = 99;
      for (let side = -1; side <= 1; side += 2) {
        const hipX = side * 0.085;
        const hipY = -0.11 + by;
        if (P.legTuck > 0.7) {
          const tucked = sdCapsule(x, y, z, hipX, hipY, -0.03, hipX, hipY - 0.06, -0.16, 0.026, 0.018);
          legs = Math.min(legs, tucked);
        } else {
          const footY = -0.35 + P.legTuck * 0.14;
          const kneeY = -0.22 + by * 0.5 + P.legBend * 0.06;
          const upper = sdCapsule(x, y, z, hipX, hipY, -0.02, hipX, kneeY, -0.05, 0.028, 0.020);
          const lower = sdCapsule(x, y, z, hipX, kneeY, -0.05, hipX, footY, 0.02, 0.019, 0.016);
          const toes = sdCapsule(x, y, z, hipX, footY, -0.04, hipX, footY, 0.09, 0.016, 0.013);
          legs = Math.min(legs, smin(smin(upper, lower, 0.015), toes, 0.012));
        }
      }

      // 6. Bright cyan eye ring + glossy dark eye
      const eyeRingL = sdEllipsoid(x, y, z, -0.108, hy + 0.020, hz + 0.040, 0.042, 0.042, 0.042);
      const eyeRingR = sdEllipsoid(x, y, z,  0.108, hy + 0.020, hz + 0.040, 0.042, 0.042, 0.042);
      const eyeRings = Math.min(eyeRingL, eyeRingR);

      let d = body;
      let mat = 'body';
      if (bill < d) { d = bill; mat = 'bill'; }
      if (legs < d) { d = legs; mat = 'leg'; }
      if (eyeRings < d + 0.008) { d = Math.min(d, eyeRings); mat = 'eye'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'eye') {
        const dy = y - (hy + 0.020);
        const dz = z - (hz + 0.040);
        const r2 = dy * dy + dz * dz;
        if (dy > 0.006 && dz > 0.004 && r2 < 0.00045) return 'W';
        if (r2 < 0.00055) return 'k';
        return 'c'; // bright cyan eye ring!
      }
      if (mat === 'bill') {
        // Dark vertical band at the base of the bill
        if (z < hz + 0.118) return 'k';
        // Iconic jet-black oval spot at the tip of the upper bill!
        if (z > hz + 0.40 && y > hy - 0.045 - billDip * 0.7) return 'k';
        // Bright golden-yellow dorsal culmen ridge -> tangerine-orange sides
        if (y > hy + 0.025 - billDip * 0.4) return shade > 0.45 ? 'y1' : 'o2';
        return shade > 0.68 ? 'o2' : shade > 0.34 ? 'o1' : 'o0';
      }
      if (mat === 'leg') return shade > 0.45 ? 'b3' : 'b2';

      // Snow-white throat & upper chest bib edged with a golden-orange border!
      if (z > 0.05 && y > -0.03 + by && y < hy + 0.03 && Math.abs(x) < 0.148) {
        if (y < 0.005 + by || z < 0.075) return 'o2';
        return shade > 0.35 ? 'W' : 'w0';
      }

      // Crimson-red undertail accent at the base of the tail
      if (z < -0.22 && z > -0.38 && y < -0.02 + by) {
        return 'r';
      }

      // Glossy raven-black plumage with cool slate-blue sheen (no harsh wing seam)
      return shade > 0.78 ? 'b4' : shade > 0.56 ? 'b3' : shade > 0.34 ? 'b2' : shade > 0.16 ? 'b1' : 'b0';
    };

    pack = build27Pack(TOUCAN_PW, TOUCAN_PH, 1.02, 0.825, TOUCAN_PAL, evalFn, shadeFn);
    toucanCache.set(pose, pack);
  }
  return pack;
}

export function getToucanPosePack(...args: Parameters<typeof buildToucanPosePack>): ReturnType<typeof buildToucanPosePack> {
  return registerAnimalSpritePack(buildToucanPosePack(...args), { module: './Toucan.ts', factory: 'getToucanPosePack', args }, buildToucanPosePack);
}

/**
 * Toco Toucan: hops playfully on the ground and flutters into tropical flight when approached.
 */
export class Toucan extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private readonly home = new THREE.Vector3();
  private state: 'idle' | 'hop' | 'fly' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.4, 2.8);
  private targetYaw = rand(0, Math.PI * 2);
  private flyAlt = rand(2.4, 3.6);
  private hopCooldown = 0;

  constructor(ctx: GameContext, pos: THREE.Vector3) {
    super(ctx, getToucanPosePack('idle0').getView(2, 0)!, TOUCAN_PW, TOUCAN_PH, TOUCAN_W, TOUCAN_H, 'ToucanBillboard');
    this.hp = 26;
    this.maxHp = 26;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.26;
    this.motor.height = 0.50;
    this.motor.teleport(pos);
    this.home.copy(pos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.30, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.set(this.position.x, this.position.y + 0.25, this.position.z);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y + 0.10, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.40, this.position.z);
    this.hurtboxes[0].enabled = this.alive;
    this.stickRoot.position.set(this.position.x, this.position.y + 0.25, this.position.z);
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
    this.vel.y = 3.2;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.state = 'fly';
      this.stateT = 0;
      this.stateDur = rand(3.0, 4.6);
      this.targetYaw = Math.atan2(hit.dir.x, hit.dir.z);
    }
    return res;
  }

  update(dt: number, target: EnemyTarget | null, camera: THREE.Camera, drawingBufferSize?: THREE.Vector2) {
    if (dt > 0) {
      this.stateT += dt;
      this.hopCooldown = Math.max(0, this.hopCooldown - dt);
      this.flash = Math.max(0, this.flash - dt * 4.5);

      if (!this.alive) {
        this.deadT += dt;
        this.vel.x = damp(this.vel.x, 0, 5, dt);
        this.vel.z = damp(this.vel.z, 0, 5, dt);
        this.vel.y -= 18 * dt;
        this.motor.update(dt);
      } else {
        const dist = target && target.alive
          ? Math.hypot(target.position.x - this.position.x, target.position.z - this.position.z)
          : 999;

        if (dist < 3.6 && this.state !== 'fly') {
          this.state = 'fly';
          this.stateT = 0;
          this.stateDur = rand(3.0, 4.8);
          this.flyAlt = rand(2.4, 3.6);
          if (target) {
            this.targetYaw = Math.atan2(this.position.x - target.position.x, this.position.z - target.position.z) + rand(-0.4, 0.4);
          }
        }

        if (this.state === 'fly') {
          const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
          if (toHome > 9.5) {
            this.targetYaw = Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z);
          } else {
            this.targetYaw += dt * 0.45;
          }
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 6);

          const descending = this.stateT > this.stateDur - 1.2 && dist > 4.5;
          const desiredY = descending ? this.home.y : this.home.y + this.flyAlt;
          const speed = 4.2;
          this.vel.x = damp(this.vel.x, Math.sin(this.facing) * speed, 5, dt);
          this.vel.z = damp(this.vel.z, Math.cos(this.facing) * speed, 5, dt);
          this.vel.y = damp(this.vel.y, (desiredY - this.position.y) * 2.2, 5, dt);
          this.position.addScaledVector(this.vel, dt);

          if (descending && this.position.y <= this.home.y + 0.15) {
            this.position.y = this.home.y;
            this.vel.y = 0;
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.4, 2.6);
          }
          this.bodyPitch = damp(this.bodyPitch, Math.max(-0.3, Math.min(0.3, this.vel.y * 0.08)), 6, dt);
        } else {
          let speed = 0;
          if (this.state === 'idle') {
            if (this.stateT >= this.stateDur) {
              this.state = 'hop';
              this.stateT = 0;
              this.stateDur = rand(1.4, 2.6);
              const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
              this.targetYaw = toHome > 6.5
                ? Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.6, 0.6)
                : this.facing + rand(-1.6, 1.6);
            }
          } else if (this.state === 'hop') {
            this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 8);
            speed = 1.6;
            if (this.motor.grounded && this.hopCooldown <= 0) {
              this.vel.y = 2.5;
              this.hopCooldown = 0.44;
            }
            if (this.stateT >= this.stateDur && this.motor.grounded) {
              this.state = 'idle';
              this.stateT = 0;
              this.stateDur = rand(1.4, 2.6);
            }
          }

          this.vel.x = damp(this.vel.x, Math.sin(this.facing) * speed, 8, dt);
          this.vel.z = damp(this.vel.z, Math.cos(this.facing) * speed, 8, dt);
          this.vel.y -= 18 * dt;
          this.motor.update(dt);
          this.bodyPitch = damp(this.bodyPitch, 0, 8, dt);
        }
      }
      this.syncHurtbox();
    }

    let pose: ToucanPoseName;
    if (!this.alive) pose = 'idle0';
    else if (this.state === 'fly') pose = (Math.floor(this.stateT * 1.5) % 2 === 0)
      ? pickCycle(TOUCAN_FLAP, this.stateT * 8.0)
      : pickCycle(TOUCAN_GLIDE, this.stateT * 2.2);
    else if (this.state === 'hop') pose = pickCycle(TOUCAN_HOP, this.stateT * 6.5);
    else pose = pickCycle(TOUCAN_IDLE, this.stateT * 2.0);

    const deathSink = this.alive ? 0 : Math.min(0.16, this.deadT * 0.35);
    this.renderBillboard(getToucanPosePack(pose), this.position.y + 0.25 - deathSink, camera, drawingBufferSize);
  }
}
