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
// PAPAGAIO (Flagship Brazilian Amazon Parrot) — 42×36
// ============================================================================
export type ParrotPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'hop0' | 'hop1' | 'hop2' | 'hop3'
  | 'flap0' | 'flap1' | 'flap2' | 'flap3' | 'flap4' | 'flap5'
  | 'glide0' | 'glide1' | 'glide2';

export const PARROT_PW = 42;
export const PARROT_PH = 36;
export const PARROT_W = PARROT_PW / ANIMAL_PPU;
export const PARROT_H = PARROT_PH / ANIMAL_PPU;

/**
 * Lush emerald-green plumage + turquoise forehead + golden-yellow face/cheeks +
 * two-tone hooked parrot beak (bone-ivory upper, dark charcoal lower) +
 * crimson-red wing shoulder/speculum + royal-blue primary flight feathers.
 */
const PARROT_PAL: Record<string, [number, number, number]> = {
  k:  [0x0d, 0x10, 0x14], // crisp 1px dark outline / pupil / claws
  g0: [0x0f, 0x45, 0x1e], // deep forest-emerald shadow
  g1: [0x1b, 0x72, 0x2e], // rich emerald-green plumage shadow
  g2: [0x2e, 0xa4, 0x3e], // vibrant Amazon emerald-green midtone
  g3: [0x52, 0xd0, 0x54], // bright lime-emerald highlight
  g4: [0x8c, 0xee, 0x76], // sunlit tropical green rim
  c:  [0x20, 0xc4, 0xee], // turquoise-blue forehead patch
  y0: [0xd8, 0x9c, 0x14], // golden-yellow cheek/tail-tip shadow
  y1: [0xff, 0xdc, 0x2c], // bright golden-yellow face, cheeks & tail tips
  r0: [0xb0, 0x1c, 0x28], // crimson-red wing shoulder/speculum shadow
  r1: [0xf2, 0x32, 0x3c], // vivid crimson-red wing shoulder & speculum
  b0: [0x18, 0x38, 0x8a], // royal-blue primary flight feather shadow
  b1: [0x2c, 0x62, 0xd8], // vivid royal-blue primary flight feathers
  i0: [0xc4, 0xb8, 0x9e], // bone-ivory upper beak shadow & grey feet
  i1: [0xf2, 0xe8, 0xd2], // bone-ivory hooked upper mandible
  d:  [0x32, 0x36, 0x42], // dark charcoal lower mandible & feet shadow
  W:  [0xfb, 0xfc, 0xff], // crisp white eye ring & eye glint
};

interface ParrotPose {
  bodyY: number;
  bodyPitch: number;
  headY: number;
  headTilt: number;
  beakOpen: number;
  wingSpread: number;
  wingMidY: number;
  wingTipY: number;
  tailSpread: number;
  tailLift: number;
  legTuck: number;
  legBend: number;
}

const PARROT_POSES: Record<ParrotPoseName, ParrotPose> = {
  idle0:  { bodyY: 0.00,  bodyPitch: 0.24, headY: 0.00,  headTilt: 0.00,  beakOpen: 0.00, wingSpread: 0.0,  wingMidY: 0.0,   wingTipY: 0.0,   tailSpread: 0.10, tailLift: -0.04, legTuck: 0.0, legBend: 0.0 },
  idle1:  { bodyY: 0.02,  bodyPitch: 0.26, headY: 0.03,  headTilt: 0.03,  beakOpen: 0.22, wingSpread: 0.0,  wingMidY: 0.0,   wingTipY: 0.0,   tailSpread: 0.12, tailLift: 0.00,  legTuck: 0.0, legBend: 0.0 },
  idle2:  { bodyY: -0.01, bodyPitch: 0.22, headY: -0.01, headTilt: -0.02, beakOpen: 0.00, wingSpread: 0.0,  wingMidY: 0.0,   wingTipY: 0.0,   tailSpread: 0.09, tailLift: -0.06, legTuck: 0.0, legBend: 0.04 },

  hop0:   { bodyY: -0.06, bodyPitch: 0.16, headY: -0.03, headTilt: 0.00,  beakOpen: 0.10, wingSpread: 0.20, wingMidY: 0.06,  wingTipY: 0.08,  tailSpread: 0.14, tailLift: 0.06,  legTuck: 0.0, legBend: 0.32 },
  hop1:   { bodyY: 0.11,  bodyPitch: 0.22, headY: 0.04,  headTilt: 0.02,  beakOpen: 0.30, wingSpread: 0.48, wingMidY: 0.16,  wingTipY: 0.24,  tailSpread: 0.18, tailLift: -0.04, legTuck: 0.4, legBend: 0.0 },
  hop2:   { bodyY: 0.14,  bodyPitch: 0.18, headY: 0.03,  headTilt: -0.02, beakOpen: 0.18, wingSpread: 0.36, wingMidY: 0.08,  wingTipY: 0.10,  tailSpread: 0.16, tailLift: 0.00,  legTuck: 0.3, legBend: 0.0 },
  hop3:   { bodyY: -0.04, bodyPitch: 0.22, headY: -0.02, headTilt: 0.00,  beakOpen: 0.00, wingSpread: 0.14, wingMidY: 0.02,  wingTipY: 0.02,  tailSpread: 0.12, tailLift: 0.04,  legTuck: 0.0, legBend: 0.20 },

  flap0:  { bodyY: -0.03, bodyPitch: 0.02, headY: -0.04, headTilt: 0.00,  beakOpen: 0.16, wingSpread: 0.88, wingMidY: 0.28,  wingTipY: 0.46,  tailSpread: 0.22, tailLift: 0.02,  legTuck: 1.0, legBend: 0.0 },
  flap1:  { bodyY: -0.01, bodyPitch: 0.02, headY: -0.04, headTilt: 0.00,  beakOpen: 0.20, wingSpread: 0.98, wingMidY: 0.16,  wingTipY: 0.26,  tailSpread: 0.24, tailLift: 0.01,  legTuck: 1.0, legBend: 0.0 },
  flap2:  { bodyY: 0.03,  bodyPitch: 0.00, headY: -0.05, headTilt: 0.00,  beakOpen: 0.08, wingSpread: 1.00, wingMidY: -0.06, wingTipY: -0.20, tailSpread: 0.20, tailLift: -0.01, legTuck: 1.0, legBend: 0.0 },
  flap3:  { bodyY: 0.05,  bodyPitch: -0.02,headY: -0.05, headTilt: 0.00,  beakOpen: 0.00, wingSpread: 0.86, wingMidY: -0.22, wingTipY: -0.40, tailSpread: 0.19, tailLift: -0.02, legTuck: 1.0, legBend: 0.0 },
  flap4:  { bodyY: 0.02,  bodyPitch: 0.00, headY: -0.04, headTilt: 0.00,  beakOpen: 0.00, wingSpread: 0.92, wingMidY: -0.08, wingTipY: -0.14, tailSpread: 0.21, tailLift: 0.00,  legTuck: 1.0, legBend: 0.0 },
  flap5:  { bodyY: -0.02, bodyPitch: 0.02, headY: -0.04, headTilt: 0.00,  beakOpen: 0.12, wingSpread: 0.90, wingMidY: 0.14,  wingTipY: 0.28,  tailSpread: 0.23, tailLift: 0.02,  legTuck: 1.0, legBend: 0.0 },

  glide0: { bodyY: 0.00,  bodyPitch: 0.00, headY: -0.04, headTilt: 0.00,  beakOpen: 0.00, wingSpread: 1.00, wingMidY: 0.08,  wingTipY: 0.14,  tailSpread: 0.22, tailLift: 0.02,  legTuck: 1.0, legBend: 0.0 },
  glide1: { bodyY: 0.02,  bodyPitch: 0.01, headY: -0.03, headTilt: 0.00,  beakOpen: 0.00, wingSpread: 1.00, wingMidY: 0.12,  wingTipY: 0.19,  tailSpread: 0.24, tailLift: 0.04,  legTuck: 1.0, legBend: 0.0 },
  glide2: { bodyY: -0.02, bodyPitch: -0.01,headY: -0.05, headTilt: 0.00,  beakOpen: 0.00, wingSpread: 1.00, wingMidY: 0.05,  wingTipY: 0.09,  tailSpread: 0.20, tailLift: 0.00,  legTuck: 1.0, legBend: 0.0 },
};

const PARROT_IDLE: readonly ParrotPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const PARROT_HOP: readonly ParrotPoseName[] = ['hop0', 'hop1', 'hop2', 'hop3'];
const PARROT_FLAP: readonly ParrotPoseName[] = ['flap0', 'flap1', 'flap2', 'flap3', 'flap4', 'flap5'];
const PARROT_GLIDE: readonly ParrotPoseName[] = ['glide0', 'glide1', 'glide0', 'glide2'];

const parrotCache = new Map<ParrotPoseName, Boar27Pack>();

 function buildParrotPosePack(pose: ParrotPoseName): Boar27Pack {
  let pack = parrotCache.get(pose);
  if (!pack) {
    const P = PARROT_POSES[pose];
    const by = P.bodyY;
    const hx = P.headTilt;
    const hy = 0.20 + by + P.bodyPitch * 0.22 + P.headY;
    const hz = 0.22;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // 1. Plump, proud Amazon parrot chest, belly & rounded head
      const chest = sdEllipsoid(x, y, z, 0, 0.03 + by + P.bodyPitch * 0.08, 0.06, 0.185, 0.178, 0.25);
      const rump = sdEllipsoid(x, y, z, 0, -0.02 + by - P.bodyPitch * 0.06, -0.16, 0.148, 0.138, 0.20);
      const neck = sdCapsule(x, y, z, 0, 0.09 + by + P.bodyPitch * 0.12, 0.14, hx, hy - 0.02, hz - 0.02, 0.138, 0.128);
      const head = sdEllipsoid(x, y, z, hx, hy, hz, 0.136, 0.132, 0.144);
      let body = smin(smin(chest, rump, 0.08), smin(neck, head, 0.045), 0.06);

      // 2. Long graduated green-and-gold tail feathers
      const tailY = -0.05 + by - P.bodyPitch * 0.18 + P.tailLift;
      const tailL = sdCapsule(x, y, z, -0.04, -0.03 + by, -0.24, -P.tailSpread, tailY, -0.60, 0.056, 0.030);
      const tailM = sdCapsule(x, y, z,  0.00, -0.03 + by, -0.24,  0.00,         tailY, -0.68, 0.064, 0.034);
      const tailR = sdCapsule(x, y, z,  0.04, -0.03 + by, -0.24,  P.tailSpread, tailY, -0.60, 0.056, 0.030);
      const tail = smin(tailM, Math.min(tailL, tailR), 0.032);
      body = smin(body, tail, 0.04);

      // 3. Folded or spread smooth continuous wings (NO dark seam in the middle!)
      if (P.wingSpread < 0.08) {
        const foldL = sdEllipsoid(x, y, z, -0.17, 0.03 + by, -0.05, 0.072, 0.128, 0.26);
        const foldR = sdEllipsoid(x, y, z,  0.17, 0.03 + by, -0.05, 0.072, 0.128, 0.26);
        body = smin(body, Math.min(foldL, foldR), 0.045);
      } else {
        const span = 0.26 + P.wingSpread * 0.58;
        const midX = span * 0.48;
        const tipX = span;
        const midY = 0.05 + by + P.wingMidY;
        const tipY = 0.05 + by + P.wingTipY;

        let wings = 99;
        for (let side = -1; side <= 1; side += 2) {
          const leadIn = sdCapsule(x, y, z, side * 0.13, 0.05 + by, 0.08, side * midX, midY + 0.01, 0.05, 0.084, 0.066);
          const leadOut = sdCapsule(x, y, z, side * midX, midY + 0.01, 0.05, side * tipX, tipY, -0.03, 0.064, 0.036);
          // Solid middle web bridging leading & trailing edge seamlessly
          const webIn = sdCapsule(x, y, z, side * 0.14, 0.03 + by, -0.02, side * (midX * 0.96), midY, -0.05, 0.080, 0.060);
          const webOut = sdCapsule(x, y, z, side * (midX * 0.90), midY, -0.05, side * (tipX * 0.94), tipY - 0.01, -0.10, 0.060, 0.034);
          const trail = sdCapsule(x, y, z, side * 0.15, 0.01 + by, -0.11, side * (midX * 0.92), midY - 0.01, -0.14, 0.070, 0.046);

          const w = smin(
            smin(smin(leadIn, leadOut, 0.045), smin(webIn, webOut, 0.045), 0.065),
            trail,
            0.065,
          );
          wings = Math.min(wings, w);
        }
        body = smin(body, wings, 0.045);
      }

      // 4. Deeply curved hooked two-tone parrot beak (bone-ivory upper, dark charcoal lower)
      const upperBridge = sdCapsule(x, y, z, hx, hy + 0.015, hz + 0.11, hx, hy - 0.008, hz + 0.215, 0.056, 0.036);
      const upperHook = sdCapsule(x, y, z, hx, hy - 0.006, hz + 0.205, hx, hy - 0.082, hz + 0.212, 0.032, 0.012);
      const upperBeak = smin(upperBridge, upperHook, 0.018);

      const lowerBeak = sdCapsule(
        x, y, z,
        hx, hy - 0.036 - P.beakOpen * 0.015, hz + 0.10,
        hx, hy - 0.052 - P.beakOpen * 0.045, hz + 0.165,
        0.040, 0.022,
      );

      // 5. Grey zygodactyl gripping feet
      let legs = 99;
      for (let side = -1; side <= 1; side += 2) {
        const hipX = side * 0.085;
        const hipY = -0.11 + by;
        if (P.legTuck > 0.7) {
          const tucked = sdCapsule(x, y, z, hipX, hipY, -0.03, hipX, hipY - 0.06, -0.16, 0.028, 0.020);
          legs = Math.min(legs, tucked);
        } else {
          const footY = -0.35 + P.legTuck * 0.14;
          const kneeY = -0.22 + by * 0.5 + P.legBend * 0.06;
          const upper = sdCapsule(x, y, z, hipX, hipY, -0.02, hipX, kneeY, -0.05, 0.032, 0.022);
          const lower = sdCapsule(x, y, z, hipX, kneeY, -0.05, hipX, footY, 0.02, 0.022, 0.018);
          const toes = sdCapsule(x, y, z, hipX, footY, -0.04, hipX, footY, 0.09, 0.018, 0.014);
          legs = Math.min(legs, smin(smin(upper, lower, 0.016), toes, 0.014));
        }
      }

      // 6. White eye ring + glossy dark eye
      const eyeRingL = sdEllipsoid(x, y, z, hx - 0.112, hy + 0.022, hz + 0.046, 0.038, 0.038, 0.038);
      const eyeRingR = sdEllipsoid(x, y, z, hx + 0.112, hy + 0.022, hz + 0.046, 0.038, 0.038, 0.038);
      const eyeRings = Math.min(eyeRingL, eyeRingR);

      let d = body;
      let mat = 'body';
      if (tail < body + 0.008 && z < -0.32) mat = 'tail';
      if (lowerBeak < d) { d = lowerBeak; mat = 'lowerBeak'; }
      if (upperBeak < d) { d = upperBeak; mat = 'upperBeak'; }
      if (legs < d) { d = legs; mat = 'leg'; }
      if (eyeRings < d + 0.008) { d = Math.min(d, eyeRings); mat = 'eye'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'eye') {
        const dy = y - (hy + 0.022);
        const dz = z - (hz + 0.046);
        const r2 = dy * dy + dz * dz;
        if (dy > 0.006 && dz > 0.004 && r2 < 0.00040) return 'W';
        if (r2 < 0.00050) return 'k';
        return 'W'; // white parrot eye ring
      }
      if (mat === 'upperBeak') return shade > 0.38 ? 'i1' : 'i0';
      if (mat === 'lowerBeak') return 'd';
      if (mat === 'leg') return shade > 0.42 ? 'i0' : 'd';

      if (mat === 'tail') {
        // Long graduated green-and-gold tail feathers with crimson base flash
        if (Math.abs(x) > 0.055 && z < -0.46) return shade > 0.42 ? 'y1' : 'y0';
        if (z > -0.42 && Math.abs(x) > 0.04) return shade > 0.42 ? 'r1' : 'r0';
        return shade > 0.68 ? 'g3' : shade > 0.36 ? 'g2' : 'g1';
      }

      // Turquoise-blue forehead patch & golden-yellow face/cheeks/crown
      if (z > hz - 0.02 && y > hy - 0.06) {
        if (y > hy + 0.055 && z > hz + 0.04 && Math.abs(x - hx) < 0.075) {
          return 'c';
        }
        if (z > hz + 0.01 || y > hy + 0.03) {
          return shade > 0.36 ? 'y1' : 'y0';
        }
      }

      // Folded or spread wing markings: crimson-red shoulder/speculum & royal-blue primaries!
      const ax = Math.abs(x);
      if (P.wingSpread < 0.08) {
        if (ax > 0.145 && z > 0.02 && z < 0.16 && y > 0.02 + by) {
          return shade > 0.40 ? 'r1' : 'r0';
        }
        if (ax > 0.145 && z < -0.14) {
          return shade > 0.42 ? 'b1' : 'b0';
        }
      } else {
        const span = 0.26 + P.wingSpread * 0.58;
        // Crimson-red wing shoulder & speculum patch
        if ((ax > 0.18 && ax < 0.36 && z > 0.01) || (ax > 0.34 && ax < 0.52 && z < -0.05)) {
          return shade > 0.40 ? 'r1' : 'r0';
        }
        // Royal-blue primary flight feathers along outer wingtips
        if (ax > span * 0.68 || (ax > 0.32 && z < -0.11)) {
          return shade > 0.42 ? 'b1' : 'b0';
        }
      }

      // Lush Amazon emerald-green body & wing coverts (smooth, zero dark seam)
      return shade > 0.78 ? 'g4' : shade > 0.56 ? 'g3' : shade > 0.34 ? 'g2' : shade > 0.16 ? 'g1' : 'g0';
    };

    pack = build27Pack(PARROT_PW, PARROT_PH, 0.98, 0.84, PARROT_PAL, evalFn, shadeFn);
    parrotCache.set(pose, pack);
  }
  return pack;
}

export function getParrotPosePack(...args: Parameters<typeof buildParrotPosePack>): ReturnType<typeof buildParrotPosePack> {
  return registerAnimalSpritePack(buildParrotPosePack(...args), { module: './Parrot.ts', factory: 'getParrotPosePack', args }, buildParrotPosePack);
}

/**
 * Tropical Parrot: waddles/hops playfully and takes off in vivid tropical flight when approached.
 */
export class Parrot extends BasePixelAnimal {
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
    super(ctx, getParrotPosePack('idle0').getView(2, 0)!, PARROT_PW, PARROT_PH, PARROT_W, PARROT_H, 'ParrotBillboard');
    this.hp = 25;
    this.maxHp = 25;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.25;
    this.motor.height = 0.50;
    this.motor.teleport(pos);
    this.home.copy(pos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.30, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.set(this.position.x, this.position.y + 0.26, this.position.z);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y + 0.10, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.42, this.position.z);
    this.hurtboxes[0].enabled = this.alive;
    this.stickRoot.position.set(this.position.x, this.position.y + 0.26, this.position.z);
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
            this.targetYaw += dt * 0.48;
          }
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 6);

          const descending = this.stateT > this.stateDur - 1.2 && dist > 4.5;
          const desiredY = descending ? this.home.y : this.home.y + this.flyAlt;
          const speed = 4.3;
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
            speed = 1.55;
            if (this.motor.grounded && this.hopCooldown <= 0) {
              this.vel.y = 2.4;
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

    let pose: ParrotPoseName;
    if (!this.alive) pose = 'idle0';
    else if (this.state === 'fly') pose = (Math.floor(this.stateT * 1.5) % 2 === 0)
      ? pickCycle(PARROT_FLAP, this.stateT * 8.2)
      : pickCycle(PARROT_GLIDE, this.stateT * 2.2);
    else if (this.state === 'hop') pose = pickCycle(PARROT_HOP, this.stateT * 6.5);
    else pose = pickCycle(PARROT_IDLE, this.stateT * 2.0);

    const deathSink = this.alive ? 0 : Math.min(0.16, this.deadT * 0.35);
    this.renderBillboard(getParrotPosePack(pose), this.position.y + 0.26 - deathSink, camera, drawingBufferSize);
  }
}
