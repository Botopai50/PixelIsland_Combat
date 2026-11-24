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
// ABUTRE (Flagship Vulture) — 56×44
// ============================================================================
export type VulturePoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'hop0' | 'hop1' | 'hop2' | 'hop3'
  | 'flap0' | 'flap1' | 'flap2' | 'flap3' | 'flap4' | 'flap5'
  | 'glide0' | 'glide1' | 'glide2';

export const VULTURE_PW = 56;
export const VULTURE_PH = 44;
export const VULTURE_W = VULTURE_PW / ANIMAL_PPU;
export const VULTURE_H = VULTURE_PH / ANIMAL_PPU;

/**
 * Heavy dark-espresso / charcoal-brown plumage + bald dusty-rose bare head & neck
 * + fluffy snow-white downy neck ruff + hooked bone-ivory beak + pale grey feet.
 */
const VULTURE_PAL: Record<string, [number, number, number]> = {
  k:  [0x10, 0x0d, 0x0f], // crisp 1px dark outline / dark eyes / claws
  d0: [0x1c, 0x15, 0x14], // deepest charcoal-espresso shadow & primary tips
  d1: [0x30, 0x24, 0x20], // dark espresso-brown plumage
  d2: [0x48, 0x37, 0x30], // rich umber-charcoal midtone
  d3: [0x66, 0x50, 0x46], // warm taupe-brown covert highlight
  d4: [0x86, 0x6c, 0x5e], // sunlit dusty-brown feather rim
  r0: [0x8a, 0x38, 0x46], // bare wrinkled dusty-rose shadow
  r1: [0xb8, 0x56, 0x66], // bald dusty-rose / crimson-pink skin midtone
  r2: [0xde, 0x7c, 0x8a], // sunlit bare-skin highlight
  w0: [0xc6, 0xc4, 0xbe], // fluffy snow-white downy ruff shadow
  W:  [0xf8, 0xf6, 0xf0], // fluffy snow-white downy ruff highlight & eye glint
  b0: [0xb8, 0xa8, 0x8e], // bone-ivory beak shadow
  b1: [0xeb, 0xde, 0xc4], // hooked bone-ivory beak highlight
  g0: [0x6a, 0x6e, 0x74], // pale grey clawed feet shadow
  g1: [0x9a, 0xa0, 0xa8], // pale grey clawed feet highlight
};

interface VulturePose {
  bodyY: number;
  hunch: number;      // 1 = hunched perched scavenger, 0 = horizontal soaring
  wingSpread: number; // 0 = folded heavy wings, 1 = broad soaring wingspan
  wingMidY: number;
  wingTipY: number;
  tailSpread: number;
  legTuck: number;    // 0 = standing/hopping, 1 = tucked in flight
  legBend: number;
}

const VULTURE_POSES: Record<VulturePoseName, VulturePose> = {
  idle0:  { bodyY: 0.00,  hunch: 1.0, wingSpread: 0.0,  wingMidY: 0.0,   wingTipY: 0.0,   tailSpread: 0.14, legTuck: 0.0, legBend: 0.0 },
  idle1:  { bodyY: 0.02,  hunch: 0.9, wingSpread: 0.0,  wingMidY: 0.0,   wingTipY: 0.0,   tailSpread: 0.15, legTuck: 0.0, legBend: 0.0 },
  idle2:  { bodyY: -0.02, hunch: 1.1, wingSpread: 0.0,  wingMidY: 0.0,   wingTipY: 0.0,   tailSpread: 0.13, legTuck: 0.0, legBend: 0.05 },

  hop0:   { bodyY: -0.06, hunch: 1.0, wingSpread: 0.20, wingMidY: 0.06,  wingTipY: 0.08,  tailSpread: 0.18, legTuck: 0.0, legBend: 0.30 },
  hop1:   { bodyY: 0.10,  hunch: 0.8, wingSpread: 0.48, wingMidY: 0.18,  wingTipY: 0.26,  tailSpread: 0.20, legTuck: 0.4, legBend: 0.0 },
  hop2:   { bodyY: 0.12,  hunch: 0.85,wingSpread: 0.36, wingMidY: 0.10,  wingTipY: 0.12,  tailSpread: 0.19, legTuck: 0.3, legBend: 0.0 },
  hop3:   { bodyY: -0.04, hunch: 1.0, wingSpread: 0.14, wingMidY: 0.02,  wingTipY: 0.02,  tailSpread: 0.15, legTuck: 0.0, legBend: 0.20 },

  flap0:  { bodyY: -0.03, hunch: 0.0, wingSpread: 0.88, wingMidY: 0.28,  wingTipY: 0.48,  tailSpread: 0.24, legTuck: 1.0, legBend: 0.0 },
  flap1:  { bodyY: -0.01, hunch: 0.0, wingSpread: 0.98, wingMidY: 0.16,  wingTipY: 0.26,  tailSpread: 0.23, legTuck: 1.0, legBend: 0.0 },
  flap2:  { bodyY: 0.03,  hunch: 0.0, wingSpread: 1.00, wingMidY: -0.06, wingTipY: -0.20, tailSpread: 0.21, legTuck: 1.0, legBend: 0.0 },
  flap3:  { bodyY: 0.05,  hunch: 0.0, wingSpread: 0.86, wingMidY: -0.22, wingTipY: -0.42, tailSpread: 0.20, legTuck: 1.0, legBend: 0.0 },
  flap4:  { bodyY: 0.02,  hunch: 0.0, wingSpread: 0.92, wingMidY: -0.08, wingTipY: -0.15, tailSpread: 0.22, legTuck: 1.0, legBend: 0.0 },
  flap5:  { bodyY: -0.02, hunch: 0.0, wingSpread: 0.90, wingMidY: 0.14,  wingTipY: 0.30,  tailSpread: 0.24, legTuck: 1.0, legBend: 0.0 },

  glide0: { bodyY: 0.00,  hunch: 0.0, wingSpread: 1.00, wingMidY: 0.12,  wingTipY: 0.20,  tailSpread: 0.24, legTuck: 1.0, legBend: 0.0 },
  glide1: { bodyY: 0.02,  hunch: 0.0, wingSpread: 1.00, wingMidY: 0.16,  wingTipY: 0.25,  tailSpread: 0.26, legTuck: 1.0, legBend: 0.0 },
  glide2: { bodyY: -0.02, hunch: 0.0, wingSpread: 1.00, wingMidY: 0.09,  wingTipY: 0.15,  tailSpread: 0.22, legTuck: 1.0, legBend: 0.0 },
};

const VULTURE_IDLE: readonly VulturePoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const VULTURE_HOP: readonly VulturePoseName[] = ['hop0', 'hop1', 'hop2', 'hop3'];
const VULTURE_FLAP: readonly VulturePoseName[] = ['flap0', 'flap1', 'flap2', 'flap3', 'flap4', 'flap5'];
const VULTURE_GLIDE: readonly VulturePoseName[] = ['glide0', 'glide1', 'glide0', 'glide2'];

const vultureCache = new Map<VulturePoseName, Boar27Pack>();

 function buildVulturePosePack(pose: VulturePoseName): Boar27Pack {
  let pack = vultureCache.get(pose);
  if (!pack) {
    const P = VULTURE_POSES[pose];
    const by = P.bodyY;
    const h = P.hunch;

    // Bare S-curved neck & bald head positions (hunched forward on ground, outstretched in flight)
    const ruffY = 0.10 + by + h * 0.12;
    const ruffZ = 0.22 - h * 0.04;

    const neckMidY = ruffY + 0.06 - h * 0.08;
    const neckMidZ = ruffZ + 0.13;

    const hy = ruffY + 0.03 - h * 0.04;
    const hz = ruffZ + 0.26;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // 1. Heavy, broad dark-espresso scavenger torso
      const chest = sdEllipsoid(x, y, z, 0, 0.00 + by + h * 0.04, 0.06, 0.21, 0.18, 0.29);
      const belly = sdEllipsoid(x, y, z, 0, -0.03 + by - h * 0.06, -0.16, 0.16, 0.14, 0.24);
      let body = smin(chest, belly, 0.08);

      // 2. Huge fluffy snow-white downy neck ruff collar!
      const ruffCore = sdEllipsoid(x, y, z, 0, ruffY, ruffZ, 0.175, 0.145, 0.125);
      const ruffL = sdEllipsoid(x, y, z, -0.11, ruffY + 0.02, ruffZ + 0.02, 0.095, 0.095, 0.095);
      const ruffR = sdEllipsoid(x, y, z,  0.11, ruffY + 0.02, ruffZ + 0.02, 0.095, 0.095, 0.095);
      const ruffTop = sdEllipsoid(x, y, z, 0, ruffY + 0.09, ruffZ - 0.02, 0.13, 0.08, 0.10);
      const ruff = smin(smin(ruffCore, ruffTop, 0.04), Math.min(ruffL, ruffR), 0.04);
      body = smin(body, ruff, 0.04);

      // 3. Bald wrinkled dusty-rose/crimson-pink S-curved bare neck & head
      const neck1 = sdCapsule(x, y, z, 0, ruffY, ruffZ + 0.02, 0, neckMidY, neckMidZ, 0.062, 0.052);
      const neck2 = sdCapsule(x, y, z, 0, neckMidY, neckMidZ, 0, hy - 0.01, hz - 0.03, 0.052, 0.058);
      const head = sdEllipsoid(x, y, z, 0, hy, hz, 0.088, 0.082, 0.108);
      const bareHead = smin(smin(neck1, neck2, 0.035), head, 0.03);
      body = smin(body, bareHead, 0.025);

      // 4. Strong hooked bone-ivory beak
      const beakBridge = sdCapsule(x, y, z, 0, hy + 0.005, hz + 0.085, 0, hy - 0.018, hz + 0.215, 0.040, 0.020);
      const beakHook = sdCapsule(x, y, z, 0, hy - 0.016, hz + 0.205, 0, hy - 0.072, hz + 0.222, 0.020, 0.008);
      const beak = smin(beakBridge, beakHook, 0.014);

      // 5. Dark fanned tail
      const tailY = -0.04 + by - h * 0.14;
      const tailL = sdCapsule(x, y, z, -0.05, -0.03 + by, -0.26, -P.tailSpread, tailY, -0.60, 0.060, 0.032);
      const tailM = sdCapsule(x, y, z,  0.00, -0.03 + by, -0.26,  0.00,        tailY, -0.64, 0.068, 0.034);
      const tailR = sdCapsule(x, y, z,  0.05, -0.03 + by, -0.26,  P.tailSpread, tailY, -0.60, 0.060, 0.032);
      const tail = smin(tailM, Math.min(tailL, tailR), 0.034);
      body = smin(body, tail, 0.04);

      // 6. Heavy folded wings OR broad, smooth, solid continuous soaring wings (NO dark seam!)
      let primaries = 99;
      if (P.wingSpread < 0.08) {
        // Heavy hunched folded wings
        const foldL = sdEllipsoid(x, y, z, -0.18, 0.03 + by + h * 0.05, -0.06, 0.085, 0.145, 0.30);
        const foldR = sdEllipsoid(x, y, z,  0.18, 0.03 + by + h * 0.05, -0.06, 0.085, 0.145, 0.30);
        body = smin(body, Math.min(foldL, foldR), 0.05);
      } else {
        const span = 0.28 + P.wingSpread * 0.62;
        const midX = span * 0.46;
        const tipX = span * 0.84;
        const midY = 0.04 + by + P.wingMidY;
        const tipY = 0.04 + by + P.wingTipY * 0.88;

        let wings = 99;
        for (let side = -1; side <= 1; side += 2) {
          const leadIn = sdCapsule(x, y, z, side * 0.14, 0.04 + by, 0.10, side * midX, midY + 0.015, 0.08, 0.092, 0.072);
          const leadOut = sdCapsule(x, y, z, side * midX, midY + 0.015, 0.08, side * tipX, tipY, 0.02, 0.070, 0.046);
          // Solid middle web bridging leading edge to trailing edge seamlessly
          const webIn = sdCapsule(x, y, z, side * 0.15, 0.025 + by, 0.00, side * (midX * 0.98), midY, -0.02, 0.086, 0.066);
          const webOut = sdCapsule(x, y, z, side * (midX * 0.92), midY, -0.02, side * (tipX * 0.96), tipY - 0.005, -0.06, 0.064, 0.042);
          const trailIn = sdCapsule(x, y, z, side * 0.16, 0.01 + by, -0.09, side * (midX * 0.96), midY - 0.01, -0.12, 0.074, 0.052);
          const trailOut = sdCapsule(x, y, z, side * (midX * 0.88), midY - 0.01, -0.11, side * (tipX * 0.92), tipY - 0.012, -0.13, 0.056, 0.034);

          const lead = smin(leadIn, leadOut, 0.045);
          const web = smin(webIn, webOut, 0.045);
          const trail = smin(trailIn, trailOut, 0.045);
          let w = smin(smin(lead, web, 0.065), trail, 0.065);

          // 5 splayed primary wingtip feathers
          for (let p = 0; p < 5; p++) {
            const frac = p / 4;
            const bx = side * (tipX - frac * 0.05);
            const byp = tipY - frac * 0.01;
            const bz = 0.03 - frac * 0.15;
            const ex = bx + side * (0.19 - Math.abs(frac - 0.35) * 0.04) * P.wingSpread;
            const ey = byp + (0.07 - frac * 0.08) * P.wingSpread + (P.wingTipY - P.wingMidY) * 0.20;
            const ez = bz + (0.09 - frac * 0.20) * P.wingSpread;
            const f = sdCapsule(x, y, z, bx, byp, bz, ex, ey, ez, 0.020, 0.010);
            primaries = Math.min(primaries, f);
            w = Math.min(w, f);
          }
          wings = Math.min(wings, w);
        }
        body = smin(body, wings, 0.045);
      }

      // 7. Pale grey clawed feet (standing/hopping or tucked in flight)
      let feet = 99;
      for (let side = -1; side <= 1; side += 2) {
        const hipX = side * 0.09;
        const hipY = -0.12 + by;
        if (P.legTuck > 0.7) {
          const tucked = sdCapsule(x, y, z, hipX, hipY, -0.04, hipX, hipY - 0.07, -0.18, 0.028, 0.020);
          feet = Math.min(feet, tucked);
        } else {
          const footY = -0.40 + P.legTuck * 0.16;
          const kneeY = -0.25 + by * 0.5 + P.legBend * 0.06;
          const upper = sdCapsule(x, y, z, hipX, hipY, -0.02, hipX, kneeY, -0.06, 0.032, 0.022);
          const lower = sdCapsule(x, y, z, hipX, kneeY, -0.06, hipX, footY, 0.02, 0.022, 0.018);
          const toes = sdCapsule(x, y, z, hipX, footY, -0.04, hipX, footY, 0.11, 0.018, 0.014);
          feet = Math.min(feet, smin(smin(upper, lower, 0.016), toes, 0.014));
        }
      }

      // 8. Piercing dark eyes with white glint
      const eyeL = sdEllipsoid(x, y, z, -0.072, hy + 0.018, hz + 0.042, 0.024, 0.024, 0.024);
      const eyeR = sdEllipsoid(x, y, z,  0.072, hy + 0.018, hz + 0.042, 0.024, 0.024, 0.024);
      const eyes = Math.min(eyeL, eyeR);

      let d = body;
      let mat = 'body';
      if (ruff < body + 0.012 && z > ruffZ - 0.11 && z < ruffZ + 0.11 && Math.abs(x) < 0.21) mat = 'ruff';
      if (bareHead < body + 0.010 && z > ruffZ + 0.06) mat = 'bare';
      if (primaries < d + 0.006 && Math.abs(x) > 0.65) mat = 'primary';
      if (beak < d) { d = beak; mat = 'beak'; }
      if (feet < d) { d = feet; mat = 'foot'; }
      if (eyes < d) { d = eyes; mat = 'eye'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'eye') {
        if (y > hy + 0.024 && z > hz + 0.046) return 'W';
        return 'k';
      }
      if (mat === 'beak') return shade > 0.38 ? 'b1' : 'b0';
      if (mat === 'foot') return shade > 0.42 ? 'g1' : 'g0';
      if (mat === 'ruff') return shade > 0.40 ? 'W' : 'w0';
      if (mat === 'bare') {
        // Subtle wrinkled bare-skin texture
        const wrinkle = Math.sin(z * 48 + y * 24) * 0.08;
        const s = shade + wrinkle;
        return s > 0.62 ? 'r2' : s > 0.28 ? 'r1' : 'r0';
      }
      if (mat === 'primary') {
        return shade > 0.62 ? 'd2' : shade > 0.32 ? 'd1' : 'd0';
      }
      // Smooth dark-espresso / charcoal-brown plumage (no harsh wing seam)
      if (Math.abs(x) > 0.20) {
        return shade > 0.76 ? 'd4' : shade > 0.52 ? 'd3' : shade > 0.28 ? 'd2' : 'd1';
      }
      return shade > 0.78 ? 'd4' : shade > 0.56 ? 'd3' : shade > 0.34 ? 'd2' : shade > 0.16 ? 'd1' : 'd0';
    };

    pack = build27Pack(VULTURE_PW, VULTURE_PH, 1.12, 0.88, VULTURE_PAL, evalFn, shadeFn);
    vultureCache.set(pose, pack);
  }
  return pack;
}

export function getVulturePosePack(...args: Parameters<typeof buildVulturePosePack>): ReturnType<typeof buildVulturePosePack> {
  return registerAnimalSpritePack(buildVulturePosePack(...args), { module: './Vulture.ts', factory: 'getVulturePosePack', args }, buildVulturePosePack);
}

/**
 * Vulture: circles slowly on thermals high above the arena, occasionally flapping.
 */
export class Vulture extends BasePixelAnimal {
  readonly position = new THREE.Vector3();
  private readonly home = new THREE.Vector3();
  private readonly vel = new THREE.Vector3();
  private orbitAngle = rand(0, Math.PI * 2);
  private orbitRadius = rand(6.0, 10.5);
  private cruiseAlt = rand(4.0, 5.8);
  private state: 'glide' | 'flap' = 'glide';
  private stateT = 0;
  private stateDur = rand(3.0, 5.5);

  constructor(ctx: GameContext, pos: THREE.Vector3) {
    super(ctx, getVulturePosePack('glide0').getView(2, 0)!, VULTURE_PW, VULTURE_PH, VULTURE_W, VULTURE_H, 'VultureBillboard');
    this.hp = 48;
    this.maxHp = 48;
    this.home.copy(pos);
    this.position.set(pos.x, pos.y + this.cruiseAlt, pos.z);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.44, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.copy(this.position);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y - 0.20, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.20, this.position.z);
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
    this.vel.x += hit.dir.x * 4.2;
    this.vel.z += hit.dir.z * 4.2;
    this.vel.y = 3.0;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.state = 'flap';
      this.stateT = 0;
      this.stateDur = 2.4;
    }
    return res;
  }

  update(dt: number, _target: EnemyTarget | null, camera: THREE.Camera, drawingBufferSize?: THREE.Vector2) {
    if (dt > 0) {
      this.stateT += dt;
      this.flash = Math.max(0, this.flash - dt * 4.5);

      if (!this.alive) {
        this.deadT += dt;
        this.vel.x = damp(this.vel.x, 0, 4, dt);
        this.vel.z = damp(this.vel.z, 0, 4, dt);
        this.vel.y -= 18 * dt;
        this.position.addScaledVector(this.vel, dt);
        if (this.position.y < this.home.y + 0.28) {
          this.position.y = this.home.y + 0.28;
          this.vel.y = 0;
        }
      } else {
        if (this.stateT >= this.stateDur) {
          this.state = this.state === 'glide' ? 'flap' : 'glide';
          this.stateT = 0;
          this.stateDur = this.state === 'glide' ? rand(3.2, 5.8) : rand(1.8, 3.0);
        }

        const angularSpeed = this.state === 'flap' ? 0.56 : 0.42;
        this.orbitAngle += angularSpeed * dt;
        const targetX = this.home.x + Math.cos(this.orbitAngle) * this.orbitRadius;
        const targetZ = this.home.z + Math.sin(this.orbitAngle) * this.orbitRadius;
        const targetY = this.home.y + this.cruiseAlt + (this.state === 'flap' ? 0.4 : 0.0) + Math.sin(this.orbitAngle * 1.5) * 0.35;

        this.vel.x = damp(this.vel.x, (targetX - this.position.x) * 2.2, 4.2, dt);
        this.vel.y = damp(this.vel.y, (targetY - this.position.y) * 2.0, 4.2, dt);
        this.vel.z = damp(this.vel.z, (targetZ - this.position.z) * 2.2, 4.2, dt);
        this.position.addScaledVector(this.vel, dt);

        if (Math.hypot(this.vel.x, this.vel.z) > 0.2) {
          const desiredYaw = Math.atan2(this.vel.x, this.vel.z);
          this.facing += angleDiff(this.facing, desiredYaw) * Math.min(1, dt * 5.5);
        }
        this.bodyPitch = damp(this.bodyPitch, Math.max(-0.3, Math.min(0.3, this.vel.y * 0.08)), 6, dt);
      }
      this.syncHurtbox();
    }

    let pose: VulturePoseName;
    if (!this.alive) pose = 'idle0';
    else if (this.state === 'flap') pose = pickCycle(VULTURE_FLAP, this.stateT * 6.8);
    else pose = pickCycle(VULTURE_GLIDE, this.stateT * 1.8);

    this.renderBillboard(getVulturePosePack(pose), this.position.y, camera, drawingBufferSize);
  }
}

export { VULTURE_IDLE, VULTURE_HOP };
