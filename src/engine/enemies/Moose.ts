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
// ALCE (Bull Moose) — Flagship 80×72 @ ANIMAL_PPU
// ============================================================================
export type MoosePoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'walk0' | 'walk1' | 'walk2' | 'walk3' | 'walk4' | 'walk5'
  | 'graze0' | 'graze1' | 'graze2'
  | 'charge0' | 'charge1' | 'charge2' | 'charge3';

export const MOOSE_PW = 80;
export const MOOSE_PH = 72;
export const MOOSE_W = MOOSE_PW / ANIMAL_PPU;
export const MOOSE_H = MOOSE_PH / ANIMAL_PPU;

/** 5-tone dark espresso-chocolate/walnut coat + bone-ivory palmate antlers + pale cream lower-leg stockings. */
const MOOSE_PAL: Record<string, [number, number, number]> = {
  k:  [0x13, 0x10, 0x12], // crisp 1px outline / cloven hooves / eyes / nostrils
  m0: [0x24, 0x17, 0x12], // deep espresso-chocolate shadow / throat bell
  m1: [0x3d, 0x26, 0x1c], // dark walnut-brown mid-shadow
  m2: [0x59, 0x39, 0x28], // rich chocolate-walnut midtone
  m3: [0x7a, 0x52, 0x38], // warm chestnut-walnut highlight
  m4: [0x9c, 0x6d, 0x4c], // sunlit shoulder hump / Roman-nose highlight
  s0: [0x7e, 0x76, 0x6a], // pale cream-grey lower-leg stocking shadow
  s1: [0xb0, 0xa8, 0x98], // pale cream-grey stocking midtone
  s2: [0xd8, 0xd2, 0xc4], // bright cream lower-leg stocking highlight
  a0: [0x6e, 0x5c, 0x46], // palmate antler base / dish shadow
  a1: [0xa4, 0x90, 0x74], // bone-tan palmate antler mid
  a2: [0xd4, 0xc3, 0xa8], // bone-ivory palmate dish highlight
  a3: [0xf2, 0xe9, 0xd8], // polished ivory antler tine tips
  W:  [0xfd, 0xfc, 0xf8], // crisp white eye glint
};

interface MoosePose {
  bodyY: number;
  bodyPitch: number;
  headY: number;
  headZ: number;
  headSway: number;
  headPitch: number;
  fl: number;
  fr: number;
  bl: number;
  br: number;
  flLift: number;
  frLift: number;
  blLift: number;
  brLift: number;
}

const MOOSE_POSES: Record<MoosePoseName, MoosePose> = {
  idle0: {
    bodyY: 0.0, bodyPitch: 0.0, headY: 0.0, headZ: 0.0, headSway: 0.0, headPitch: 0.0,
    fl: 0, fr: 0, bl: 0, br: 0, flLift: 0, frLift: 0, blLift: 0, brLift: 0,
  },
  idle1: {
    bodyY: 0.012, bodyPitch: 0.01, headY: 0.025, headZ: 0.01, headSway: 0.035, headPitch: -0.05,
    fl: 0, fr: 0, bl: 0, br: 0, flLift: 0, frLift: 0, blLift: 0, brLift: 0,
  },
  idle2: {
    bodyY: -0.010, bodyPitch: -0.01, headY: -0.018, headZ: 0.015, headSway: -0.035, headPitch: 0.04,
    fl: 0, fr: 0, bl: 0, br: 0, flLift: 0, frLift: 0, blLift: 0, brLift: 0,
  },

  // 6-frame tall high-stepping forest stride
  walk0: {
    bodyY: 0.015, bodyPitch: 0.01, headY: -0.01, headZ: 0.02, headSway: 0.015, headPitch: 0.03,
    fl: 0.20, fr: -0.15, bl: -0.16, br: 0.16, flLift: 0.14, frLift: 0.0, blLift: 0.0, brLift: 0.12,
  },
  walk1: {
    bodyY: 0.025, bodyPitch: 0.02, headY: -0.015, headZ: 0.03, headSway: 0.0, headPitch: 0.04,
    fl: 0.10, fr: -0.04, bl: -0.07, br: 0.08, flLift: 0.05, frLift: 0.09, blLift: 0.08, brLift: 0.05,
  },
  walk2: {
    bodyY: -0.008, bodyPitch: 0.0, headY: 0.0, headZ: 0.01, headSway: -0.015, headPitch: 0.01,
    fl: -0.04, fr: 0.10, bl: 0.07, br: -0.05, flLift: 0.0, frLift: 0.14, blLift: 0.12, brLift: 0.0,
  },
  walk3: {
    bodyY: 0.015, bodyPitch: 0.01, headY: -0.01, headZ: 0.02, headSway: -0.015, headPitch: 0.03,
    fl: -0.15, fr: 0.20, bl: 0.16, br: -0.16, flLift: 0.0, frLift: 0.14, blLift: 0.12, brLift: 0.0,
  },
  walk4: {
    bodyY: 0.025, bodyPitch: 0.02, headY: -0.015, headZ: 0.03, headSway: 0.0, headPitch: 0.04,
    fl: -0.04, fr: 0.10, bl: 0.08, br: -0.07, flLift: 0.09, frLift: 0.05, blLift: 0.05, brLift: 0.08,
  },
  walk5: {
    bodyY: -0.008, bodyPitch: 0.0, headY: 0.0, headZ: 0.01, headSway: 0.015, headPitch: 0.01,
    fl: 0.10, fr: -0.04, bl: -0.05, br: 0.07, flLift: 0.14, frLift: 0.0, blLift: 0.0, brLift: 0.12,
  },

  // 3-frame grazing / browsing cycle
  graze0: {
    bodyY: -0.015, bodyPitch: 0.06, headY: -0.22, headZ: 0.10, headSway: 0.0, headPitch: 0.34,
    fl: 0.06, fr: -0.03, bl: 0, br: 0, flLift: 0, frLift: 0, blLift: 0, brLift: 0,
  },
  graze1: {
    bodyY: -0.030, bodyPitch: 0.10, headY: -0.40, headZ: 0.16, headSway: -0.035, headPitch: 0.58,
    fl: 0.10, fr: -0.04, bl: 0, br: 0, flLift: 0, frLift: 0, blLift: 0, brLift: 0,
  },
  graze2: {
    bodyY: -0.026, bodyPitch: 0.09, headY: -0.37, headZ: 0.18, headSway: 0.04, headPitch: 0.54,
    fl: 0.10, fr: -0.04, bl: 0, br: 0, flLift: 0, frLift: 0, blLift: 0, brLift: 0,
  },

  // 4-frame thundering charge with massive palmate antlers lowered forward!
  charge0: {
    bodyY: -0.03, bodyPitch: 0.09, headY: -0.18, headZ: 0.12, headSway: 0.0, headPitch: 0.62,
    fl: 0.24, fr: -0.18, bl: -0.22, br: 0.18, flLift: 0.16, frLift: 0.0, blLift: 0.0, brLift: 0.14,
  },
  charge1: {
    bodyY: 0.04, bodyPitch: 0.05, headY: -0.20, headZ: 0.14, headSway: 0.0, headPitch: 0.68,
    fl: 0.30, fr: 0.20, bl: -0.28, br: -0.18, flLift: 0.22, frLift: 0.16, blLift: 0.18, brLift: 0.12,
  },
  charge2: {
    bodyY: 0.01, bodyPitch: 0.08, headY: -0.19, headZ: 0.13, headSway: 0.0, headPitch: 0.64,
    fl: -0.20, fr: -0.10, bl: 0.22, br: 0.14, flLift: 0.04, frLift: 0.12, blLift: 0.14, brLift: 0.08,
  },
  charge3: {
    bodyY: -0.02, bodyPitch: 0.07, headY: -0.16, headZ: 0.11, headSway: 0.0, headPitch: 0.56,
    fl: -0.06, fr: 0.06, bl: 0.10, br: -0.02, flLift: 0.0, frLift: 0.05, blLift: 0.05, brLift: 0.0,
  },
};

const mooseCache = new Map<MoosePoseName, Boar27Pack>();

 function buildMoosePosePack(pose: MoosePoseName): Boar27Pack {
  let pack = mooseCache.get(pose);
  if (!pack) {
    const P = MOOSE_POSES[pose];
    const by = P.bodyY;
    const hPivotY = 0.28 + by + P.headY;
    const hPivotZ = 0.44 + P.headZ;
    const hx = P.headSway;
    const cosP = Math.cos(P.headPitch);
    const sinP = Math.sin(P.headPitch);

    const evalFn: SdfEvaluator = (x, y, z) => {
      const py = y - z * P.bodyPitch * 0.24;

      // 1. Towering forest giant: high muscular shoulder hump sloping to lower hindquarters
      const shoulderHump = sdEllipsoid(x, py, z, 0, 0.27 + by, 0.18, 0.21, 0.17, 0.22);
      const chest = sdEllipsoid(x, py, z, 0, 0.10 + by, 0.18, 0.24, 0.24, 0.26);
      const barrel = sdEllipsoid(x, py, z, 0, 0.08 + by, -0.08, 0.22, 0.21, 0.28);
      const rump = sdEllipsoid(x, py, z, 0, 0.04 + by, -0.34, 0.20, 0.19, 0.22);
      const tail = sdCapsule(x, py, z, 0, 0.08 + by, -0.50, 0, 0.02 + by, -0.57, 0.042, 0.024);
      const neck = sdCapsule(x, y, z, 0, 0.18 + by, 0.24, hx * 0.5, hPivotY + 0.02, hPivotZ - 0.05, 0.175, 0.135);

      let coat = smin(chest, shoulderHump, 0.08);
      coat = smin(coat, barrel, 0.09);
      coat = smin(coat, rump, 0.09);
      coat = smin(coat, tail, 0.03);
      coat = smin(coat, neck, 0.075);

      // 2. Unmistakable Moose head: large bulbous overhanging Roman-nose muzzle + hanging throat "bell" (dewlap)
      const dx = x - hx;
      const dy = y - hPivotY;
      const dz = z - hPivotZ;
      const lx = dx;
      const ly = dy * cosP + dz * sinP;
      const lz = -dy * sinP + dz * cosP;

      const cranium = sdEllipsoid(lx, ly, lz, 0, 0.03, 0.0, 0.125, 0.125, 0.155);
      const bridge = sdCapsule(lx, ly, lz, 0, 0.02, 0.06, 0, -0.04, 0.26, 0.095, 0.085);
      // Bulbous overhanging Roman-nose muzzle!
      const romanNose = sdEllipsoid(lx, ly, lz, 0, -0.055, 0.295, 0.095, 0.088, 0.105);
      const chin = sdEllipsoid(lx, ly, lz, 0, -0.105, 0.20, 0.062, 0.045, 0.085);
      // Signature hanging furry throat "bell" (dewlap) dangling under the jaw!
      const bell = sdCapsule(lx, ly, lz, 0, -0.08, 0.06, 0, -0.26, 0.08, 0.048, 0.032);

      // Large mule-like ears
      const earL = sdCapsule(lx, ly, lz, -0.095, 0.06, -0.03, -0.235, 0.13, -0.08, 0.046, 0.024);
      const earR = sdCapsule(lx, ly, lz,  0.095, 0.06, -0.03,  0.235, 0.13, -0.08, 0.046, 0.024);
      const ears = Math.min(earL, earR);

      let headD = smin(smin(cranium, bridge, 0.04), romanNose, 0.045);
      headD = smin(headD, chin, 0.03);
      headD = smin(headD, bell, 0.03);
      headD = smin(headD, ears, 0.025);
      coat = smin(coat, headD, 0.06);

      // 3. Iconic broad palmate (wide flattened dish/paddle-shaped) bone-ivory antlers with 6 outer tines per side!
      const antlerSide = (s: number) => {
        // Thick pedicle beam sweeping outward from crown
        const beam = sdCapsule(lx, ly, lz, s * 0.065, 0.10, -0.01, s * 0.22, 0.16, -0.02, 0.034, 0.042);
        // Broad flattened palmate dish (wide along X/Z, thin along Y/Z)
        const palm1 = sdEllipsoid(lx, ly, lz, s * 0.32, 0.22, -0.02, 0.14, 0.085, 0.14);
        const palm2 = sdEllipsoid(lx, ly, lz, s * 0.39, 0.28, -0.06, 0.12, 0.095, 0.13);
        let dish = smin(smin(beam, palm1, 0.035), palm2, 0.04);

        // 6 distinct outer tines/points around the rim of the palmate dish!
        const browTine = sdCapsule(lx, ly, lz, s * 0.24, 0.18, 0.08, s * 0.30, 0.25, 0.22, 0.024, 0.011);
        const tine2 = sdCapsule(lx, ly, lz, s * 0.36, 0.23, 0.09, s * 0.48, 0.32, 0.16, 0.024, 0.011);
        const tine3 = sdCapsule(lx, ly, lz, s * 0.44, 0.27, 0.02, s * 0.57, 0.38, 0.04, 0.025, 0.011);
        const tine4 = sdCapsule(lx, ly, lz, s * 0.46, 0.31, -0.06, s * 0.58, 0.43, -0.07, 0.025, 0.011);
        const tine5 = sdCapsule(lx, ly, lz, s * 0.42, 0.33, -0.14, s * 0.51, 0.45, -0.18, 0.024, 0.011);
        const tine6 = sdCapsule(lx, ly, lz, s * 0.33, 0.31, -0.17, s * 0.38, 0.41, -0.25, 0.022, 0.011);
        const tines = Math.min(
          Math.min(Math.min(browTine, tine2), Math.min(tine3, tine4)),
          Math.min(tine5, tine6),
        );
        return smin(dish, tines, 0.02);
      };
      const antlers = Math.min(antlerSide(-1), antlerSide(1));

      // Dark eyes + white glint + wide moose nostrils
      const eyeL = sdEllipsoid(lx, ly, lz, -0.098, 0.036, 0.095, 0.026, 0.024, 0.024);
      const eyeR = sdEllipsoid(lx, ly, lz,  0.098, 0.036, 0.095, 0.026, 0.024, 0.024);
      const eyes = Math.min(eyeL, eyeR);

      const glintL = sdEllipsoid(lx, ly, lz, -0.108, 0.044, 0.112, 0.010, 0.010, 0.010);
      const glintR = sdEllipsoid(lx, ly, lz,  0.108, 0.044, 0.112, 0.010, 0.010, 0.010);
      const glints = Math.min(glintL, glintR);

      const nosL = sdEllipsoid(lx, ly, lz, -0.052, -0.048, 0.382, 0.020, 0.018, 0.016);
      const nosR = sdEllipsoid(lx, ly, lz,  0.052, -0.048, 0.382, 0.020, 0.018, 0.016);
      const nostrils = Math.min(nosL, nosR);

      // 4. Long slender legs with pale-cream lower stockings & dark cloven hooves
      const tallLeg = (sx: number, baseZ: number, swing: number, lift: number) => {
        const topY = -0.02 + by;
        const knY = -0.32 + by * 0.4 + lift * 0.45;
        const knZ = baseZ + swing * 0.52;
        const ftY = -0.66 + lift;
        const ftZ = baseZ + swing;
        const upper = sdCapsule(x, y, z, sx, topY, baseZ, sx, knY, knZ, 0.082, 0.048);
        const lower = sdCapsule(x, y, z, sx, knY, knZ, sx, ftY, ftZ, 0.044, 0.034);
        const hoof = sdEllipsoid(x, y, z, sx, ftY - 0.022, ftZ + 0.018, 0.044, 0.032, 0.052);
        return { leg: smin(upper, lower, 0.02), hoof };
      };

      const fl = tallLeg(-0.16, 0.20, P.fl, P.flLift);
      const fr = tallLeg( 0.16, 0.20, P.fr, P.frLift);
      const bl = tallLeg(-0.16, -0.32, P.bl, P.blLift);
      const br = tallLeg( 0.16, -0.32, P.br, P.brLift);

      const legs = Math.min(Math.min(fl.leg, fr.leg), Math.min(bl.leg, br.leg));
      const hooves = Math.min(Math.min(fl.hoof, fr.hoof), Math.min(bl.hoof, br.hoof));
      coat = smin(coat, legs, 0.04);

      let d = coat, mat = 'coat';
      if (antlers < d) { d = antlers; mat = 'antler'; }
      if (hooves < d) { d = hooves; mat = 'hoof'; }
      if (eyes < d) { d = eyes; mat = 'eye'; }
      if (glints < d) { d = glints; mat = 'glint'; }
      if (nostrils < d) { d = nostrils; mat = 'nostril'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'glint') return 'W';
      if (mat === 'eye' || mat === 'nostril' || mat === 'hoof') return 'k';
      if (mat === 'antler') {
        // Polished ivory tips on the outer antler tines!
        if (Math.abs(x) > 0.46 || y > 0.58 + by) return shade > 0.45 ? 'a3' : 'a2';
        return shade > 0.72 ? 'a3' : shade > 0.46 ? 'a2' : shade > 0.22 ? 'a1' : 'a0';
      }
      // Signature pale-grey/cream lower legs ("stockings") below the knees/hocks!
      if (y < -0.30) {
        return shade > 0.65 ? 's2' : shade > 0.34 ? 's1' : 's0';
      }
      const furTex = Math.sin(x * 20 + z * 16) * Math.cos(y * 20) * 0.045;
      const s = shade + furTex;
      return s > 0.80 ? 'm4' : s > 0.60 ? 'm3' : s > 0.40 ? 'm2' : s > 0.20 ? 'm1' : 'm0';
    };

    pack = build27Pack(MOOSE_PW, MOOSE_PH, 1.24, 1.14, MOOSE_PAL, evalFn, shadeFn);
    mooseCache.set(pose, pack);
  }
  return pack;
}

export function getMoosePosePack(...args: Parameters<typeof buildMoosePosePack>): ReturnType<typeof buildMoosePosePack> {
  return registerAnimalSpritePack(buildMoosePosePack(...args), { module: './Moose.ts', factory: 'getMoosePosePack', args }, buildMoosePosePack);
}

// ============================================================================
// INSTÂNCIA NA ARENA (Moose)
// ============================================================================
const MOOSE_IDLE: readonly MoosePoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const MOOSE_WALK: readonly MoosePoseName[] = ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'];
const MOOSE_GRAZE: readonly MoosePoseName[] = ['graze0', 'graze1', 'graze2', 'graze1'];
const MOOSE_CHARGE: readonly MoosePoseName[] = ['charge0', 'charge1', 'charge2', 'charge3'];

function pickCycle<T>(frames: readonly T[], idx: number): T {
  return sampleAnimalCycle(frames, idx);
}

export class Moose extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private readonly home = new THREE.Vector3();
  private state: 'idle' | 'graze' | 'walk' | 'charge' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.8, 3.4);
  private targetYaw = rand(0, Math.PI * 2);
  private gaitPhase = rand(0, Math.PI * 2);
  private provoked = false;

  private readonly centerY = 0.64;

  constructor(ctx: GameContext, startPos: THREE.Vector3) {
    super(ctx, getMoosePosePack('idle0').getView(2, 0)!, MOOSE_PW, MOOSE_PH, MOOSE_W, MOOSE_H, 'MooseBillboard');
    this.hp = 125;
    this.maxHp = 125;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.54;
    this.motor.height = 1.28;
    this.motor.teleport(startPos);
    this.home.copy(startPos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.60, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.set(this.position.x, this.position.y + this.centerY, this.position.z);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y + 0.34, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.98, this.position.z);
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
    this.vel.x += hit.dir.x * 2.8;
    this.vel.z += hit.dir.z * 2.8;
    this.vel.y = 2.2;
    this.provoked = true;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.state = 'charge';
      this.stateT = 0;
      this.stateDur = 2.4;
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
        if (this.provoked && dist < 6.5 && this.state !== 'charge') {
          this.state = 'charge';
          this.stateT = 0;
          this.stateDur = 2.4;
        }

        if (this.state === 'idle') {
          if (this.stateT >= this.stateDur) {
            this.state = Math.random() < 0.42 ? 'graze' : 'walk';
            this.stateT = 0;
            this.stateDur = rand(2.0, 3.6);
            const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
            this.targetYaw = toHome > 8.5
              ? Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.5, 0.5)
              : this.facing + rand(-1.5, 1.5);
          }
        } else if (this.state === 'graze') {
          if (this.stateT >= this.stateDur) {
            this.state = 'walk';
            this.stateT = 0;
            this.stateDur = rand(2.0, 3.6);
          }
        } else if (this.state === 'walk') {
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 4.5);
          speed = 2.0;
          if (this.stateT >= this.stateDur && this.motor.grounded) {
            this.state = Math.random() < 0.45 ? 'graze' : 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.8, 3.2);
          }
        } else if (this.state === 'charge') {
          if (target && target.alive) {
            this.targetYaw = Math.atan2(target.position.x - this.position.x, target.position.z - this.position.z);
            this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 7);
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
      ? Math.abs(Math.sin(this.gaitPhase)) * 0.030
      : 0;

    let pose: MoosePoseName;
    if (!this.alive) pose = 'idle0';
    else if (this.state === 'charge') pose = pickCycle(MOOSE_CHARGE, (this.gaitPhase / Math.PI) * 2.6);
    else if (this.state === 'graze') pose = pickCycle(MOOSE_GRAZE, this.stateT * 2.2);
    else if (this.state === 'walk') pose = pickCycle(MOOSE_WALK, (this.gaitPhase / Math.PI) * 2.4);
    else pose = pickCycle(MOOSE_IDLE, this.stateT * 1.8);

    const deathSink = this.alive ? 0 : Math.min(0.30, this.deadT * 0.45);
    this.renderBillboard(getMoosePosePack(pose), this.position.y + this.centerY + bob - deathSink, camera, drawingBufferSize);
  }
}
