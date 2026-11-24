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
// LONTRA (Flagship River Otter) — 44×26 @ 56 PPU
// ============================================================================
export type OtterPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'walk0' | 'walk1' | 'walk2' | 'walk3' | 'walk4' | 'walk5'
  | 'swim0' | 'swim1' | 'swim2' | 'swim3'
  | 'play0' | 'play1' | 'play2';

export const OTTER_PW = 44;
export const OTTER_PH = 26;
export const OTTER_W = OTTER_PW / ANIMAL_PPU;
export const OTTER_H = OTTER_PH / ANIMAL_PPU;

const OTTER_PAL: Record<string, [number, number, number]> = {
  k:  [0x14, 0x10, 0x10], // crisp 1px outline / big dark nose / glossy eyes
  b0: [0x2a, 0x1b, 0x14], // deep wet espresso shadow
  b1: [0x47, 0x2e, 0x20], // rich dark chocolate wet fur
  b2: [0x6b, 0x47, 0x33], // warm walnut midtone
  b3: [0x8f, 0x67, 0x4f], // sunlit chestnut fur
  b4: [0xb8, 0xa2, 0x92], // cool wet-fur specular sheen
  c0: [0xc7, 0xa5, 0x7d], // warm tan cheek/throat/chest shadow
  c1: [0xed, 0xd4, 0xae], // pale cream-tan cheeks, muzzle pads, throat & chest
  p0: [0x6a, 0x74, 0x82], // river pebble shadow (play pose)
  p1: [0x9e, 0xaa, 0xba], // river pebble highlight (play pose)
  W:  [0xff, 0xfb, 0xf4], // crisp white eye glint
};

interface OtterPose {
  bodyY: number;
  spineArch: number;
  upright: number; // 0 = horizontal, 1 = sitting up playfully
  headY: number;
  headZ: number;
  flSwing: number;
  flLift: number;
  frSwing: number;
  frLift: number;
  blSwing: number;
  blLift: number;
  brSwing: number;
  brLift: number;
  tailY: number;
  tailSway: number;
  pebble: boolean;
}

const OTTER_POSES: Record<OtterPoseName, OtterPose> = {
  // Alert shore stance with subtle breathing
  idle0: {
    bodyY: 0.00, spineArch: 0.03, upright: 0.0, headY: 0.00, headZ: 0.00,
    flSwing: 0.02, flLift: 0.0, frSwing: -0.02, frLift: 0.0,
    blSwing: -0.02, blLift: 0.0, brSwing: 0.02, brLift: 0.0,
    tailY: -0.04, tailSway: 0.00, pebble: false,
  },
  idle1: {
    bodyY: 0.015, spineArch: 0.04, upright: 0.0, headY: 0.025, headZ: 0.01,
    flSwing: 0.02, flLift: 0.0, frSwing: -0.02, frLift: 0.0,
    blSwing: -0.02, blLift: 0.0, brSwing: 0.02, brLift: 0.0,
    tailY: -0.03, tailSway: 0.05, pebble: false,
  },
  idle2: {
    bodyY: -0.01, spineArch: 0.02, upright: 0.0, headY: -0.015, headZ: 0.02,
    flSwing: 0.02, flLift: 0.0, frSwing: -0.02, frLift: 0.0,
    blSwing: -0.02, blLift: 0.0, brSwing: 0.02, brLift: 0.0,
    tailY: -0.05, tailSway: -0.05, pebble: false,
  },

  // Bounding shore waddle (arched spine + alternating short webbed paws)
  walk0: {
    bodyY: 0.00, spineArch: 0.06, upright: 0.0, headY: 0.01, headZ: 0.02,
    flSwing: 0.14, flLift: 0.08, frSwing: -0.10, frLift: 0.00,
    blSwing: -0.10, blLift: 0.00, brSwing: 0.14, brLift: 0.08,
    tailY: -0.02, tailSway: -0.06, pebble: false,
  },
  walk1: {
    bodyY: 0.03, spineArch: 0.10, upright: 0.0, headY: 0.02, headZ: 0.03,
    flSwing: 0.06, flLift: 0.02, frSwing: 0.06, frLift: 0.06,
    blSwing: 0.06, blLift: 0.06, brSwing: 0.04, brLift: 0.02,
    tailY: 0.01, tailSway: -0.03, pebble: false,
  },
  walk2: {
    bodyY: 0.04, spineArch: 0.08, upright: 0.0, headY: 0.00, headZ: 0.04,
    flSwing: -0.08, flLift: 0.00, frSwing: 0.15, frLift: 0.09,
    blSwing: 0.15, blLift: 0.09, brSwing: -0.08, brLift: 0.00,
    tailY: 0.02, tailSway: 0.03, pebble: false,
  },
  walk3: {
    bodyY: 0.00, spineArch: 0.04, upright: 0.0, headY: -0.01, headZ: 0.02,
    flSwing: -0.14, flLift: 0.02, frSwing: 0.10, frLift: 0.00,
    blSwing: 0.10, blLift: 0.00, brSwing: -0.14, brLift: 0.02,
    tailY: -0.02, tailSway: 0.06, pebble: false,
  },
  walk4: {
    bodyY: -0.01, spineArch: 0.05, upright: 0.0, headY: 0.00, headZ: 0.01,
    flSwing: -0.04, flLift: 0.06, frSwing: -0.04, frLift: 0.02,
    blSwing: -0.04, blLift: 0.02, brSwing: -0.04, brLift: 0.06,
    tailY: -0.03, tailSway: 0.03, pebble: false,
  },
  walk5: {
    bodyY: 0.01, spineArch: 0.07, upright: 0.0, headY: 0.01, headZ: 0.02,
    flSwing: 0.10, flLift: 0.09, frSwing: -0.12, frLift: 0.00,
    blSwing: -0.12, blLift: 0.00, brSwing: 0.10, brLift: 0.09,
    tailY: -0.01, tailSway: -0.03, pebble: false,
  },

  // Sleek undulating aquatic glide
  swim0: {
    bodyY: -0.05, spineArch: -0.02, upright: 0.0, headY: -0.03, headZ: 0.06,
    flSwing: -0.14, flLift: 0.06, frSwing: -0.08, frLift: 0.05,
    blSwing: -0.18, blLift: 0.08, brSwing: -0.12, brLift: 0.07,
    tailY: 0.03, tailSway: -0.12, pebble: false,
  },
  swim1: {
    bodyY: -0.03, spineArch: 0.02, upright: 0.0, headY: -0.01, headZ: 0.07,
    flSwing: -0.10, flLift: 0.07, frSwing: -0.14, frLift: 0.06,
    blSwing: -0.14, blLift: 0.07, brSwing: -0.18, brLift: 0.08,
    tailY: 0.05, tailSway: 0.00, pebble: false,
  },
  swim2: {
    bodyY: -0.05, spineArch: -0.02, upright: 0.0, headY: -0.03, headZ: 0.06,
    flSwing: -0.08, flLift: 0.05, frSwing: -0.14, frLift: 0.06,
    blSwing: -0.12, blLift: 0.07, brSwing: -0.18, brLift: 0.08,
    tailY: 0.01, tailSway: 0.12, pebble: false,
  },
  swim3: {
    bodyY: -0.04, spineArch: 0.01, upright: 0.0, headY: -0.02, headZ: 0.06,
    flSwing: -0.14, flLift: 0.06, frSwing: -0.10, frLift: 0.07,
    blSwing: -0.18, blLift: 0.08, brSwing: -0.14, brLift: 0.07,
    tailY: 0.03, tailSway: 0.00, pebble: false,
  },

  // Upright curious bob holding a smooth shiny river pebble
  play0: {
    bodyY: 0.02, spineArch: 0.04, upright: 0.88, headY: 0.02, headZ: 0.00,
    flSwing: 0.0, flLift: 0.0, frSwing: 0.0, frLift: 0.0,
    blSwing: 0.04, blLift: 0.0, brSwing: 0.04, brLift: 0.0,
    tailY: -0.09, tailSway: 0.00, pebble: true,
  },
  play1: {
    bodyY: 0.045, spineArch: 0.05, upright: 0.96, headY: 0.045, headZ: 0.01,
    flSwing: 0.0, flLift: 0.0, frSwing: 0.0, frLift: 0.0,
    blSwing: 0.04, blLift: 0.0, brSwing: 0.04, brLift: 0.0,
    tailY: -0.08, tailSway: 0.04, pebble: true,
  },
  play2: {
    bodyY: 0.01, spineArch: 0.03, upright: 0.84, headY: 0.01, headZ: -0.01,
    flSwing: 0.0, flLift: 0.0, frSwing: 0.0, frLift: 0.0,
    blSwing: 0.04, blLift: 0.0, brSwing: 0.04, brLift: 0.0,
    tailY: -0.09, tailSway: -0.04, pebble: true,
  },
};

const otterCache = new Map<OtterPoseName, Boar27Pack>();
 function buildOtterPosePack(pose: OtterPoseName): Boar27Pack {
  let pack = otterCache.get(pose);
  if (!pack) {
    const P = OTTER_POSES[pose];
    const by = P.bodyY;
    const u = P.upright;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // 1. Sleek elongated aquatic torso (tilts upright in play0..2)
      const chestY = -0.02 + by + u * 0.14;
      const chestZ = 0.20 - u * 0.12;
      const midY = 0.00 + by + P.spineArch * 0.6 + u * 0.06;
      const midZ = -0.02 - u * 0.06;
      const rumpY = -0.04 + by - u * 0.06;
      const rumpZ = -0.26 - u * 0.02;

      const chest = sdEllipsoid(x, y, z, 0, chestY, chestZ, 0.155, 0.145, 0.21);
      const midBack = sdEllipsoid(x, y, z, 0, midY, midZ, 0.165, 0.145, 0.23);
      const rump = sdEllipsoid(x, y, z, 0, rumpY, rumpZ, 0.17, 0.15, 0.19);
      let body = smin(smin(chest, midBack, 0.08), rump, 0.08);

      // 2. Thick muscular neck & broad flattened otter head
      const hY = 0.07 + by + P.headY + u * 0.25;
      const hZ = 0.44 + P.headZ - u * 0.24;
      const neck = sdCapsule(x, y, z, 0, chestY + 0.03, chestZ + 0.07, 0, hY - 0.02, hZ - 0.05, 0.125, 0.105);
      const skull = sdEllipsoid(x, y, z, 0, hY, hZ, 0.135, 0.102, 0.135);

      // Adorable round whiskered muzzle pads + chin
      const muzzleL = sdEllipsoid(x, y, z, -0.052, hY - 0.025, hZ + 0.105, 0.062, 0.048, 0.068);
      const muzzleR = sdEllipsoid(x, y, z,  0.052, hY - 0.025, hZ + 0.105, 0.062, 0.048, 0.068);
      const chin = sdEllipsoid(x, y, z, 0, hY - 0.058, hZ + 0.085, 0.068, 0.035, 0.065);
      const head = smin(smin(skull, Math.min(muzzleL, muzzleR), 0.035), chin, 0.03);

      // Tiny low-set round ears
      const earL = sdEllipsoid(x, y, z, -0.125, hY + 0.045, hZ - 0.035, 0.036, 0.036, 0.026);
      const earR = sdEllipsoid(x, y, z,  0.125, hY + 0.045, hZ - 0.035, 0.036, 0.036, 0.026);
      body = smin(body, smin(neck, head, 0.045), 0.06);
      body = smin(body, Math.min(earL, earR), 0.015);

      // Big dark wet otter nose
      const nose = sdEllipsoid(x, y, z, 0, hY - 0.008, hZ + 0.158, 0.042, 0.032, 0.032);

      // Bright dark eyes with white glint
      const eyeL = sdEllipsoid(x, y, z, -0.088, hY + 0.022, hZ + 0.092, 0.030, 0.030, 0.030);
      const eyeR = sdEllipsoid(x, y, z,  0.088, hY + 0.022, hZ + 0.092, 0.030, 0.030, 0.030);
      const eyes = Math.min(eyeL, eyeR);

      // 3. Long thick muscular tapering rudder tail
      const tailMidX = P.tailSway * 0.45;
      const tailMidY = rumpY - 0.03 + P.tailY * 0.5;
      const tailMidZ = rumpZ - 0.28;
      const tailTipX = P.tailSway;
      const tailTipY = rumpY - 0.07 + P.tailY;
      const tailTipZ = rumpZ - 0.62;
      const tail1 = sdCapsule(x, y, z, 0, rumpY - 0.01, rumpZ - 0.06, tailMidX, tailMidY, tailMidZ, 0.115, 0.072);
      const tail2 = sdCapsule(x, y, z, tailMidX, tailMidY, tailMidZ, tailTipX, tailTipY, tailTipZ, 0.070, 0.028);
      const tail = smin(tail1, tail2, 0.04);
      body = smin(body, tail, 0.06);

      // 4. Short webbed paws (or front paws cupped around a pebble in play0..2)
      let paws = 99;
      let pebble = 99;
      if (P.pebble) {
        // Front paws raised holding a smooth river pebble against chest
        const pawL = sdCapsule(x, y, z, -0.13, chestY + 0.02, chestZ + 0.04, -0.065, chestY + 0.05, chestZ + 0.19, 0.046, 0.038);
        const pawR = sdCapsule(x, y, z,  0.13, chestY + 0.02, chestZ + 0.04,  0.065, chestY + 0.05, chestZ + 0.19, 0.046, 0.038);
        pebble = sdEllipsoid(x, y, z, 0, chestY + 0.055, chestZ + 0.21, 0.058, 0.045, 0.048);
        // Hind legs planted firmly as a tripod with tail
        const hindL = sdCapsule(x, y, z, -0.14, rumpY - 0.02, rumpZ + 0.05, -0.15, -0.25, rumpZ + 0.16, 0.062, 0.046);
        const hindR = sdCapsule(x, y, z,  0.14, rumpY - 0.02, rumpZ + 0.05,  0.15, -0.25, rumpZ + 0.16, 0.062, 0.046);
        paws = Math.min(Math.min(pawL, pawR), Math.min(hindL, hindR));
      } else {
        const leg = (sx: number, shY: number, shZ: number, swing: number, lift: number, r0: number, r1: number) => {
          const fy = -0.25 + lift;
          const fz = shZ + swing;
          const limb = sdCapsule(x, y, z, sx, shY, shZ, sx, fy + 0.03, fz, r0, r1);
          const web = sdEllipsoid(x, y, z, sx, fy, fz + 0.035, 0.052, 0.026, 0.064);
          return smin(limb, web, 0.02);
        };
        const fl = leg(-0.125, chestY - 0.04, chestZ + 0.02, P.flSwing, P.flLift, 0.058, 0.042);
        const fr = leg( 0.125, chestY - 0.04, chestZ + 0.02, P.frSwing, P.frLift, 0.058, 0.042);
        const bl = leg(-0.135, rumpY - 0.03, rumpZ + 0.02, P.blSwing, P.blLift, 0.066, 0.046);
        const br = leg( 0.135, rumpY - 0.03, rumpZ + 0.02, P.brSwing, P.brLift, 0.066, 0.046);
        paws = Math.min(Math.min(fl, fr), Math.min(bl, br));
      }
      body = smin(body, paws, 0.035);

      let d = body;
      let mat = 'fur';
      if (nose < d) { d = nose; mat = 'nose'; }
      if (eyes < d) { d = eyes; mat = 'eye'; }
      if (pebble < d) { d = pebble; mat = 'pebble'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'nose') return 'k';
      if (mat === 'eye') {
        const hY = 0.07 + by + P.headY + u * 0.25;
        const hZ = 0.44 + P.headZ - u * 0.24;
        if (y > hY + 0.026 && z > hZ + 0.098 && Math.abs(x) < 0.095) return 'W';
        return 'k';
      }
      if (mat === 'pebble') return shade > 0.50 ? 'p1' : 'p0';

      // Pale cream-tan cheeks, muzzle pads, throat & chest bib
      const hY = 0.07 + by + P.headY + u * 0.25;
      const hZ = 0.44 + P.headZ - u * 0.24;
      const onMuzzle = z > hZ + 0.04 && y < hY + 0.005 && Math.abs(x) < 0.125;
      const onThroat = z > 0.08 - u * 0.12 && y < hY - 0.03 && Math.abs(x) < 0.135;
      if (onMuzzle || onThroat) {
        return shade > 0.40 ? 'c1' : 'c0';
      }

      // Glossy wet chocolate/walnut fur with cool sheen highlight
      return shade > 0.85 ? 'b4' : shade > 0.66 ? 'b3' : shade > 0.42 ? 'b2' : shade > 0.20 ? 'b1' : 'b0';
    };

    pack = build27Pack(OTTER_PW, OTTER_PH, 1.12, 0.68, OTTER_PAL, evalFn, shadeFn);
    otterCache.set(pose, pack);
  }
  return pack;
}

export function getOtterPosePack(...args: Parameters<typeof buildOtterPosePack>): ReturnType<typeof buildOtterPosePack> {
  return registerAnimalSpritePack(buildOtterPosePack(...args), { module: './Otter.ts', factory: 'getOtterPosePack', args }, buildOtterPosePack);
}

const OTTER_IDLE: readonly OtterPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const OTTER_WALK: readonly OtterPoseName[] = ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'];
const OTTER_SWIM: readonly OtterPoseName[] = ['swim0', 'swim1', 'swim2', 'swim3'];
const OTTER_PLAY: readonly OtterPoseName[] = ['play0', 'play1', 'play0', 'play2'];

/**
 * River Otter (Lontra): waddles, swims, and plays with pebbles around pondCenter or home.
 */
export class Otter extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private readonly home = new THREE.Vector3();
  private state: 'idle' | 'walk' | 'swim' | 'play' | 'flee' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.4, 2.8);
  private gaitPhase = rand(0, Math.PI * 2);

  constructor(ctx: GameContext, pos: THREE.Vector3, pondCenter?: THREE.Vector3) {
    super(ctx, getOtterPosePack('idle0').getView(2, 0)!, OTTER_PW, OTTER_PH, OTTER_W, OTTER_H, 'OtterBillboard');
    this.hp = 35;
    this.maxHp = 35;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.26;
    this.motor.height = 0.34;
    this.motor.teleport(pos);
    this.home.copy(pondCenter ?? pos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.34, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.set(this.position.x, this.position.y + 0.18, this.position.z);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y + 0.08, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.28, this.position.z);
    this.hurtboxes[0].enabled = this.alive;
    this.stickRoot.position.set(this.position.x, this.position.y + 0.18, this.position.z);
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
    this.vel.y = 3.2;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.state = 'flee';
      this.stateT = 0;
      this.stateDur = 2.6;
      this.facing = Math.atan2(hit.dir.x, hit.dir.z);
    }
    return res;
  }

  update(dt: number, target: EnemyTarget | null, camera: THREE.Camera, drawingBufferSize?: THREE.Vector2) {
    if (dt > 0) {
      this.stateT += dt;
      this.flash = Math.max(0, this.flash - dt * 4.5);

      if (!this.alive) {
        this.deadT += dt;
        this.vel.x = damp(this.vel.x, 0, 6, dt);
        this.vel.z = damp(this.vel.z, 0, 6, dt);
        this.vel.y -= 20 * dt;
        this.motor.update(dt);
      } else {
        const dist = target && target.alive
          ? Math.hypot(target.position.x - this.position.x, target.position.z - this.position.z)
          : 999;

        let vx = 0;
        let vz = 0;

        if (dist < 2.6 && this.state !== 'flee') {
          this.state = 'flee';
          this.stateT = 0;
          this.stateDur = 2.2;
        }

        const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);

        if (this.state === 'idle' || this.state === 'play') {
          if (this.stateT >= this.stateDur) {
            const r = Math.random();
            if (r < 0.28 && this.state !== 'play') {
              this.state = 'play';
              this.stateT = 0;
              this.stateDur = rand(2.0, 3.6);
            } else {
              this.state = toHome < 3.6 && Math.random() < 0.55 ? 'swim' : 'walk';
              this.stateT = 0;
              this.stateDur = rand(1.8, 3.4);
              if (toHome > 5.5) {
                this.facing = Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.4, 0.4);
              } else {
                this.facing += rand(-1.3, 1.3);
              }
            }
          }
        } else if (this.state === 'walk' || this.state === 'swim') {
          const speed = this.state === 'swim' ? 2.25 : 1.85;
          vx = Math.sin(this.facing) * speed;
          vz = Math.cos(this.facing) * speed;
          if (this.stateT >= this.stateDur) {
            this.state = Math.random() < 0.45 ? 'play' : 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.4, 2.8);
          }
        } else if (this.state === 'flee') {
          if (target && target.alive) {
            const away = Math.atan2(this.position.x - target.position.x, this.position.z - target.position.z);
            this.facing += angleDiff(this.facing, away) * Math.min(1, dt * 8);
          }
          vx = Math.sin(this.facing) * 3.2;
          vz = Math.cos(this.facing) * 3.2;
          if (this.stateT >= this.stateDur && dist > 4.8) {
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.2, 2.2);
          }
        }

        this.vel.x = damp(this.vel.x, vx, 9, dt);
        this.vel.z = damp(this.vel.z, vz, 9, dt);
        this.vel.y -= 20 * dt;
        this.motor.update(dt);

        const horiz = Math.hypot(this.vel.x, this.vel.z);
        if (horiz > 0.2 && this.motor.grounded) {
          this.gaitPhase += dt * 6.5 * (0.7 + horiz * 0.25);
        }
      }
      this.syncHurtbox();
    }

    let pose: OtterPoseName;
    if (!this.alive) pose = 'idle0';
    else if (this.state === 'play') pose = pickCycle(OTTER_PLAY, this.stateT * 2.6);
    else if (this.state === 'swim') pose = pickCycle(OTTER_SWIM, this.stateT * 5.2);
    else if (this.state === 'walk' || this.state === 'flee') pose = pickCycle(OTTER_WALK, (this.gaitPhase / Math.PI) * 3.0);
    else pose = pickCycle(OTTER_IDLE, this.stateT * 2.0);

    const deathSink = this.alive ? 0 : Math.min(0.14, this.deadT * 0.35);
    this.renderBillboard(getOtterPosePack(pose), this.position.y + 0.18 - deathSink, camera, drawingBufferSize);
  }
}
