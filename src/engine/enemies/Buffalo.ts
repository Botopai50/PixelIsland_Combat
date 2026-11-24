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

// ============================================================================
// BÚFALO-AFRICANO (African Cape Buffalo) — Flagship 72×54 @ ANIMAL_PPU
// ============================================================================
export type BuffaloPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'walk0' | 'walk1' | 'walk2' | 'walk3' | 'walk4' | 'walk5'
  | 'snort0' | 'snort1' | 'snort2'
  | 'charge0' | 'charge1' | 'charge2' | 'charge3';

export const BUFFALO_PW = 72;
export const BUFFALO_PH = 54;
export const BUFFALO_W = BUFFALO_PW / ANIMAL_PPU;
export const BUFFALO_H = BUFFALO_PH / ANIMAL_PPU;

/** 5-tone deep charcoal-slate/espresso hide + ridged grey-ivory horn boss ramp + wet dark muzzle. */
const BUFFALO_PAL: Record<string, [number, number, number]> = {
  k:  [0x11, 0x10, 0x13], // crisp 1px outline / cloven hooves / nostrils / tail tuft
  b0: [0x1c, 0x19, 0x1d], // deep charcoal-espresso hide shadow
  b1: [0x2d, 0x28, 0x2d], // dark espresso-slate mid-dark
  b2: [0x42, 0x3b, 0x40], // slate-brown hide midtone
  b3: [0x5c, 0x53, 0x58], // warm slate-brown muscle highlight
  b4: [0x78, 0x6e, 0x73], // sunlit shoulder / back rim sheen
  h0: [0x40, 0x3c, 0x38], // horn boss deep ridge crease
  h1: [0x6e, 0x68, 0x60], // horn boss slate-grey mid
  h2: [0x9e, 0x97, 0x8a], // grey-ivory horn highlight
  h3: [0xce, 0xc7, 0xb8], // sunlit horn boss / tip highlight
  m0: [0x22, 0x20, 0x26], // wet dark bovine muzzle shadow
  m1: [0x48, 0x44, 0x50], // wet muzzle specular highlight
  W:  [0xfc, 0xfb, 0xf6], // crisp white eye glint
};

interface BuffaloPose {
  bodyY: number;
  bodyPitch: number;
  headY: number;
  headZ: number;
  headSway: number;
  headPitch: number;
  tailSway: number;
  tailLift: number;
  fl: number;
  fr: number;
  bl: number;
  br: number;
  flLift: number;
  frLift: number;
  blLift: number;
  brLift: number;
}

const BUFFALO_POSES: Record<BuffaloPoseName, BuffaloPose> = {
  idle0: {
    bodyY: 0.0, bodyPitch: 0.0, headY: 0.0, headZ: 0.0, headSway: 0.0, headPitch: 0.0, tailSway: 0.0, tailLift: 0.0,
    fl: 0, fr: 0, bl: 0, br: 0, flLift: 0, frLift: 0, blLift: 0, brLift: 0,
  },
  idle1: {
    bodyY: 0.012, bodyPitch: 0.01, headY: 0.02, headZ: 0.01, headSway: 0.035, headPitch: -0.05, tailSway: 0.07, tailLift: 0.02,
    fl: 0, fr: 0, bl: 0, br: 0, flLift: 0, frLift: 0, blLift: 0, brLift: 0,
  },
  idle2: {
    bodyY: -0.010, bodyPitch: -0.01, headY: -0.015, headZ: 0.015, headSway: -0.035, headPitch: 0.04, tailSway: -0.07, tailLift: 0.0,
    fl: 0, fr: 0, bl: 0, br: 0, flLift: 0, frLift: 0, blLift: 0, brLift: 0,
  },

  // 6-frame heavy powerful march
  walk0: {
    bodyY: 0.012, bodyPitch: 0.01, headY: -0.01, headZ: 0.02, headSway: 0.015, headPitch: 0.03, tailSway: 0.05, tailLift: 0.03,
    fl: 0.16, fr: -0.12, bl: -0.14, br: 0.14, flLift: 0.08, frLift: 0.0, blLift: 0.0, brLift: 0.07,
  },
  walk1: {
    bodyY: 0.020, bodyPitch: 0.02, headY: -0.015, headZ: 0.03, headSway: 0.0, headPitch: 0.04, tailSway: 0.02, tailLift: 0.04,
    fl: 0.08, fr: -0.03, bl: -0.06, br: 0.07, flLift: 0.03, frLift: 0.05, blLift: 0.05, brLift: 0.03,
  },
  walk2: {
    bodyY: -0.008, bodyPitch: 0.0, headY: 0.0, headZ: 0.01, headSway: -0.015, headPitch: 0.01, tailSway: -0.02, tailLift: 0.02,
    fl: -0.04, fr: 0.08, bl: 0.06, br: -0.04, flLift: 0.0, frLift: 0.08, blLift: 0.07, brLift: 0.0,
  },
  walk3: {
    bodyY: 0.012, bodyPitch: 0.01, headY: -0.01, headZ: 0.02, headSway: -0.015, headPitch: 0.03, tailSway: -0.05, tailLift: 0.03,
    fl: -0.12, fr: 0.16, bl: 0.14, br: -0.14, flLift: 0.0, frLift: 0.08, blLift: 0.07, brLift: 0.0,
  },
  walk4: {
    bodyY: 0.020, bodyPitch: 0.02, headY: -0.015, headZ: 0.03, headSway: 0.0, headPitch: 0.04, tailSway: -0.02, tailLift: 0.04,
    fl: -0.03, fr: 0.08, bl: 0.07, br: -0.06, flLift: 0.05, frLift: 0.03, blLift: 0.03, brLift: 0.05,
  },
  walk5: {
    bodyY: -0.008, bodyPitch: 0.0, headY: 0.0, headZ: 0.01, headSway: 0.015, headPitch: 0.01, tailSway: 0.02, tailLift: 0.02,
    fl: 0.08, fr: -0.04, bl: -0.04, br: 0.06, flLift: 0.08, frLift: 0.0, blLift: 0.0, brLift: 0.07,
  },

  // 3-frame aggressive snort (head lowered, pawing the ground!)
  snort0: {
    bodyY: -0.02, bodyPitch: 0.08, headY: -0.12, headZ: 0.06, headSway: -0.03, headPitch: 0.34, tailSway: 0.08, tailLift: 0.10,
    fl: -0.16, fr: 0.04, bl: 0.0, br: 0.0, flLift: 0.12, frLift: 0.0, blLift: 0, brLift: 0,
  },
  snort1: {
    bodyY: -0.03, bodyPitch: 0.10, headY: -0.16, headZ: 0.08, headSway: 0.03, headPitch: 0.44, tailSway: -0.08, tailLift: 0.14,
    fl: -0.26, fr: 0.06, bl: -0.04, br: 0.02, flLift: 0.06, frLift: 0.0, blLift: 0, brLift: 0,
  },
  snort2: {
    bodyY: -0.015, bodyPitch: 0.07, headY: -0.10, headZ: 0.05, headSway: 0.0, headPitch: 0.28, tailSway: 0.05, tailLift: 0.08,
    fl: 0.08, fr: 0.04, bl: 0.0, br: 0.0, flLift: 0.04, frLift: 0.0, blLift: 0, brLift: 0,
  },

  // 4-frame full-speed Cape Buffalo horn charge!
  charge0: {
    bodyY: -0.03, bodyPitch: 0.10, headY: -0.14, headZ: 0.10, headSway: 0.0, headPitch: 0.52, tailSway: 0.0, tailLift: 0.20,
    fl: 0.24, fr: 0.14, bl: -0.22, br: -0.14, flLift: 0.16, frLift: 0.10, blLift: 0.04, brLift: 0.0,
  },
  charge1: {
    bodyY: 0.04, bodyPitch: 0.05, headY: -0.16, headZ: 0.12, headSway: 0.0, headPitch: 0.58, tailSway: 0.02, tailLift: 0.24,
    fl: 0.30, fr: 0.22, bl: -0.26, br: -0.18, flLift: 0.22, frLift: 0.16, blLift: 0.18, brLift: 0.12,
  },
  charge2: {
    bodyY: 0.01, bodyPitch: 0.08, headY: -0.15, headZ: 0.11, headSway: 0.0, headPitch: 0.54, tailSway: -0.02, tailLift: 0.22,
    fl: -0.18, fr: -0.10, bl: 0.22, br: 0.14, flLift: 0.04, frLift: 0.10, blLift: 0.14, brLift: 0.08,
  },
  charge3: {
    bodyY: -0.02, bodyPitch: 0.08, headY: -0.12, headZ: 0.09, headSway: 0.0, headPitch: 0.48, tailSway: 0.0, tailLift: 0.18,
    fl: -0.06, fr: 0.06, bl: 0.10, br: -0.02, flLift: 0.0, frLift: 0.04, blLift: 0.04, brLift: 0.0,
  },
};

const buffaloCache = new Map<BuffaloPoseName, Boar27Pack>();

 function buildBuffaloPosePack(pose: BuffaloPoseName): Boar27Pack {
  let pack = buffaloCache.get(pose);
  if (!pack) {
    const P = BUFFALO_POSES[pose];
    const by = P.bodyY;
    const hPivotY = 0.14 + by + P.headY;
    const hPivotZ = 0.48 + P.headZ;
    const hx = P.headSway;
    const cosP = Math.cos(P.headPitch);
    const sinP = Math.sin(P.headPitch);

    const evalFn: SdfEvaluator = (x, y, z) => {
      const py = y - z * P.bodyPitch * 0.25;

      // 1. Massive heavy-shouldered bovine powerhouse: high shoulder hump, broad barrel, throat dewlap
      const shoulderHump = sdEllipsoid(x, py, z, 0, 0.22 + by, 0.20, 0.26, 0.18, 0.24);
      const chest = sdEllipsoid(x, py, z, 0, 0.04 + by, 0.20, 0.31, 0.27, 0.29);
      const barrel = sdEllipsoid(x, py, z, 0, 0.05 + by, -0.08, 0.30, 0.26, 0.31);
      const rump = sdEllipsoid(x, py, z, 0, 0.05 + by, -0.35, 0.27, 0.25, 0.24);
      const neck = sdCapsule(x, y, z, 0, 0.12 + by, 0.28, hx * 0.5, hPivotY + 0.02, hPivotZ - 0.05, 0.22, 0.175);
      // Hanging throat dewlap fold under neck
      const dewlap = sdCapsule(x, y, z, 0, -0.06 + by, 0.28, hx * 0.4, hPivotY - 0.12, hPivotZ - 0.06, 0.095, 0.075);

      let hide = smin(chest, shoulderHump, 0.08);
      hide = smin(hide, barrel, 0.10);
      hide = smin(hide, rump, 0.10);
      hide = smin(hide, neck, 0.08);
      hide = smin(hide, dewlap, 0.05);

      // 2. Heavy bovine head + Cape Buffalo fused horn "boss" helmet in local pitched space
      const dx = x - hx;
      const dy = y - hPivotY;
      const dz = z - hPivotZ;
      const lx = dx;
      const ly = dy * cosP + dz * sinP;
      const lz = -dy * sinP + dz * cosP;

      const skull = sdEllipsoid(lx, ly, lz, 0, 0.02, 0.01, 0.165, 0.155, 0.175);
      const snout = sdCapsule(lx, ly, lz, 0, -0.01, 0.07, 0, -0.055, 0.25, 0.125, 0.095);
      const muzzle = sdEllipsoid(lx, ly, lz, 0, -0.060, 0.265, 0.102, 0.074, 0.072);

      // Large drooping ears hanging BELOW the horn bases!
      const earL = sdCapsule(lx, ly, lz, -0.145, -0.01, -0.01, -0.285, -0.085, -0.03, 0.052, 0.028);
      const earR = sdCapsule(lx, ly, lz,  0.145, -0.01, -0.01,  0.285, -0.085, -0.03, 0.052, 0.028);
      const ears = Math.min(earL, earR);

      const headD = smin(smin(skull, snout, 0.045), ears, 0.025);
      hide = smin(hide, headD, 0.065);

      // Unmistakable Cape Buffalo fused horn "boss" helmet across the forehead:
      // Sweeps outward & downward from the brow, then hooks sharply upward to pointed tips!
      const bossCenter = sdEllipsoid(lx, ly, lz, 0, 0.135, 0.035, 0.165, 0.075, 0.115);
      const hornSide = (s: number) => {
        // 1. Thick base sweeping outward and downward from boss
        const h1 = sdCapsule(lx, ly, lz, s * 0.10, 0.125, 0.03, s * 0.27, 0.025, 0.02, 0.068, 0.052);
        // 2. Bottom curve sweeping outward
        const h2 = sdCapsule(lx, ly, lz, s * 0.27, 0.025, 0.02, s * 0.35, 0.095, 0.03, 0.050, 0.036);
        // 3. Upward & slightly inward hook to sharp point!
        const h3 = sdCapsule(lx, ly, lz, s * 0.35, 0.095, 0.03, s * 0.30, 0.245, 0.04, 0.034, 0.014);
        return smin(smin(h1, h2, 0.02), h3, 0.015);
      };
      const horns = smin(bossCenter, Math.min(hornSide(-1), hornSide(1)), 0.03);

      // Fierce dark eyes under the horn boss + white glint + nostrils
      const eyeL = sdEllipsoid(lx, ly, lz, -0.125, 0.022, 0.125, 0.028, 0.026, 0.026);
      const eyeR = sdEllipsoid(lx, ly, lz,  0.125, 0.022, 0.125, 0.028, 0.026, 0.026);
      const eyes = Math.min(eyeL, eyeR);

      const glintL = sdEllipsoid(lx, ly, lz, -0.135, 0.030, 0.142, 0.011, 0.011, 0.011);
      const glintR = sdEllipsoid(lx, ly, lz,  0.135, 0.030, 0.142, 0.011, 0.011, 0.011);
      const glints = Math.min(glintL, glintR);

      const nosL = sdEllipsoid(lx, ly, lz, -0.048, -0.052, 0.325, 0.020, 0.016, 0.016);
      const nosR = sdEllipsoid(lx, ly, lz,  0.048, -0.052, 0.325, 0.020, 0.016, 0.016);
      const nostrils = Math.min(nosL, nosR);

      // 3. Sturdy muscular bovine legs with cloven hooves
      const legCol = (sx: number, baseZ: number, swing: number, lift: number) => {
        const topY = -0.06 + by;
        const knY = -0.30 + by * 0.4 + lift * 0.45;
        const knZ = baseZ + swing * 0.50;
        const ftY = -0.53 + lift;
        const ftZ = baseZ + swing;
        const upper = sdCapsule(x, y, z, sx, topY, baseZ, sx, knY, knZ, 0.105, 0.072);
        const lower = sdCapsule(x, y, z, sx, knY, knZ, sx, ftY, ftZ, 0.068, 0.054);
        const hoof = sdEllipsoid(x, y, z, sx, ftY - 0.02, ftZ + 0.02, 0.058, 0.036, 0.068);
        return { leg: smin(upper, lower, 0.025), hoof };
      };

      const fl = legCol(-0.185, 0.22, P.fl, P.flLift);
      const fr = legCol( 0.185, 0.22, P.fr, P.frLift);
      const bl = legCol(-0.190, -0.32, P.bl, P.blLift);
      const br = legCol( 0.190, -0.32, P.br, P.brLift);

      const legs = Math.min(Math.min(fl.leg, fr.leg), Math.min(bl.leg, br.leg));
      const hooves = Math.min(Math.min(fl.hoof, fr.hoof), Math.min(bl.hoof, br.hoof));
      hide = smin(hide, legs, 0.045);

      // 4. Swishing tail ending in a dark hair tuft
      const tTipX = P.tailSway;
      const tTipY = -0.26 + by + P.tailLift;
      const tTipZ = -0.66 - P.tailLift * 0.25;
      const tail = sdCapsule(x, y, z, 0, 0.06 + by, -0.55, tTipX, tTipY, tTipZ, 0.034, 0.022);
      const tailTuft = sdEllipsoid(x, y, z, tTipX, tTipY - 0.05, tTipZ - 0.02, 0.044, 0.068, 0.044);
      hide = smin(hide, tail, 0.03);

      let d = hide, mat = 'hide';
      if (muzzle < d) { d = muzzle; mat = 'muzzle'; }
      if (horns < d) { d = horns; mat = 'horn'; }
      if (hooves < d) { d = hooves; mat = 'hoof'; }
      if (tailTuft < d) { d = tailTuft; mat = 'tuft'; }
      if (eyes < d) { d = eyes; mat = 'eye'; }
      if (glints < d) { d = glints; mat = 'glint'; }
      if (nostrils < d) { d = nostrils; mat = 'nostril'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'glint') return 'W';
      if (mat === 'eye' || mat === 'nostril' || mat === 'hoof' || mat === 'tuft') return 'k';
      if (mat === 'muzzle') return shade > 0.62 ? 'm1' : 'm0';
      if (mat === 'horn') {
        // Heavy keratin ridges across the Cape Buffalo horn boss!
        const ridge = Math.sin(x * 36 + y * 24) * 0.08;
        const s = shade + ridge;
        return s > 0.76 ? 'h3' : s > 0.50 ? 'h2' : s > 0.25 ? 'h1' : 'h0';
      }
      // Subtle coarse hide texture
      const hideTex = Math.sin(x * 18 + z * 14) * Math.cos(y * 18) * 0.04;
      const s = shade + hideTex;
      return s > 0.80 ? 'b4' : s > 0.60 ? 'b3' : s > 0.40 ? 'b2' : s > 0.20 ? 'b1' : 'b0';
    };

    pack = build27Pack(BUFFALO_PW, BUFFALO_PH, 1.18, 0.94, BUFFALO_PAL, evalFn, shadeFn);
    buffaloCache.set(pose, pack);
  }
  return pack;
}

export function getBuffaloPosePack(...args: Parameters<typeof buildBuffaloPosePack>): ReturnType<typeof buildBuffaloPosePack> {
  return registerAnimalSpritePack(buildBuffaloPosePack(...args), { module: './Buffalo.ts', factory: 'getBuffaloPosePack', args }, buildBuffaloPosePack);
}

// ============================================================================
// INSTÂNCIA NA ARENA (Buffalo)
// ============================================================================
const BUF_IDLE: readonly BuffaloPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const BUF_WALK: readonly BuffaloPoseName[] = ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'];
const BUF_SNORT: readonly BuffaloPoseName[] = ['snort0', 'snort1', 'snort2', 'snort1'];
const BUF_CHARGE: readonly BuffaloPoseName[] = ['charge0', 'charge1', 'charge2', 'charge3'];

function pickCycle<T>(frames: readonly T[], idx: number): T {
  return sampleAnimalCycle(frames, idx);
}

export class Buffalo extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private readonly home = new THREE.Vector3();
  private state: 'idle' | 'walk' | 'snort' | 'charge' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.8, 3.4);
  private targetYaw = rand(0, Math.PI * 2);
  private gaitPhase = rand(0, Math.PI * 2);
  private provoked = false;

  private readonly centerY = 0.48;

  constructor(ctx: GameContext, startPos: THREE.Vector3) {
    super(ctx, getBuffaloPosePack('idle0').getView(2, 0)!, BUFFALO_PW, BUFFALO_PH, BUFFALO_W, BUFFALO_H, 'BuffaloBillboard');
    this.hp = 135;
    this.maxHp = 135;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.56;
    this.motor.height = 1.04;
    this.motor.teleport(startPos);
    this.home.copy(startPos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.62, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.set(this.position.x, this.position.y + this.centerY, this.position.z);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y + 0.26, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.80, this.position.z);
    this.hurtboxes[0].enabled = this.alive;
    this.stickRoot.position.set(this.position.x, this.position.y + this.centerY, this.position.z);
    this.stickRoot.rotation.y = this.facing;
  }

  receiveHit(hit: HitInfo): HitResult {
    const res = emptyResult('flesh');
    if (!this.alive) { res.ignored = true; return res; }
    this.hp = Math.max(0, this.hp - hit.damage);
    res.damage = hit.damage;
    this.flash = 1.0;
    this.vel.x += hit.dir.x * 2.5;
    this.vel.z += hit.dir.z * 2.5;
    this.vel.y = 2.0;
    this.provoked = true;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.state = 'snort';
      this.stateT = 0;
      this.stateDur = 0.9;
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

        let speed = 0;

        if (this.state === 'idle') {
          if (this.stateT >= this.stateDur) {
            this.state = Math.random() < 0.30 ? 'snort' : 'walk';
            this.stateT = 0;
            this.stateDur = this.state === 'snort' ? rand(1.2, 2.0) : rand(2.2, 3.8);
            const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
            this.targetYaw = toHome > 8.5
              ? Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.5, 0.5)
              : this.facing + rand(-1.5, 1.5);
          }
        } else if (this.state === 'walk') {
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 4.5);
          speed = 1.9;
          if (this.stateT >= this.stateDur && this.motor.grounded) {
            this.state = Math.random() < 0.35 ? 'snort' : 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.6, 2.8);
          }
        } else if (this.state === 'snort') {
          if (target && target.alive) {
            this.targetYaw = Math.atan2(target.position.x - this.position.x, target.position.z - this.position.z);
            this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 6);
          }
          if (this.stateT >= this.stateDur) {
            this.state = this.provoked && dist < 7.0 ? 'charge' : 'idle';
            this.stateT = 0;
            this.stateDur = this.state === 'charge' ? 2.4 : rand(1.6, 2.8);
          }
        } else if (this.state === 'charge') {
          if (target && target.alive) {
            this.targetYaw = Math.atan2(target.position.x - this.position.x, target.position.z - this.position.z);
            this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 6.5);
            speed = 5.4;
          }
          if (this.stateT >= this.stateDur && dist > 6.5) {
            this.provoked = false;
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.6, 2.8);
          }
        }

        this.vel.x = damp(this.vel.x, Math.sin(this.facing) * speed, 8, dt);
        this.vel.z = damp(this.vel.z, Math.cos(this.facing) * speed, 8, dt);
        this.vel.y -= 20 * dt;
        this.motor.update(dt);

        const horiz = Math.hypot(this.vel.x, this.vel.z);
        if (horiz > 0.2 && this.motor.grounded) {
          this.gaitPhase += dt * 5.2 * (0.65 + horiz * 0.24);
        }
      }
      this.syncHurtbox();
    }

    const horiz = Math.hypot(this.vel.x, this.vel.z);
    const bob = this.alive && this.motor.grounded && horiz > 0.2
      ? Math.abs(Math.sin(this.gaitPhase)) * 0.028
      : 0;

    let pose: BuffaloPoseName;
    if (!this.alive) pose = 'idle0';
    else if (this.state === 'charge') pose = pickCycle(BUF_CHARGE, (this.gaitPhase / Math.PI) * 2.6);
    else if (this.state === 'snort') pose = pickCycle(BUF_SNORT, this.stateT * 3.4);
    else if (this.state === 'walk') pose = pickCycle(BUF_WALK, (this.gaitPhase / Math.PI) * 2.4);
    else pose = pickCycle(BUF_IDLE, this.stateT * 1.8);

    const deathSink = this.alive ? 0 : Math.min(0.28, this.deadT * 0.45);
    this.renderBillboard(getBuffaloPosePack(pose), this.position.y + this.centerY + bob - deathSink, camera, drawingBufferSize);
  }
}
