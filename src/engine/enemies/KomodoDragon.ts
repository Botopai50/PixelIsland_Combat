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
// DRAGÃO-DE-KOMODO (Komodo Dragon) — Flagship 76×34 @ ANIMAL_PPU
// ============================================================================
export type KomodoDragonPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'walk0' | 'walk1' | 'walk2' | 'walk3' | 'walk4' | 'walk5'
  | 'hiss0' | 'hiss1' | 'hiss2'
  | 'lunge0' | 'lunge1' | 'lunge2' | 'lunge3';

export const KOMODO_PW = 76;
export const KOMODO_PH = 34;
export const KOMODO_W = KOMODO_PW / ANIMAL_PPU;
export const KOMODO_H = KOMODO_PH / ANIMAL_PPU;

/** 5-tone earthy ash-brown/dusty-slate pebbled scales + golden-yellow forked tongue + curved claws. */
const KOMODO_PAL: Record<string, [number, number, number]> = {
  k:  [0x14, 0x13, 0x12], // crisp 1px outline / dark eyes / nostrils
  k0: [0x2e, 0x2b, 0x26], // deep ash-brown scale shadow
  k1: [0x4b, 0x45, 0x3c], // dusty-slate scale mid-dark
  k2: [0x6c, 0x63, 0x54], // earthy ash-brown midtone
  k3: [0x92, 0x85, 0x6e], // warm ochre-mottled pebble highlight
  k4: [0xb8, 0xa8, 0x8c], // sunlit dusty-ochre scale peak
  y0: [0xd4, 0x9c, 0x18], // golden-yellow forked tongue shadow
  y1: [0xff, 0xd8, 0x38], // bright golden-yellow forked tongue!
  c0: [0x38, 0x32, 0x2c], // curved claw base
  c1: [0x9e, 0x92, 0x7e], // curved ivory-black claw highlight
  m:  [0x7c, 0x22, 0x2a], // open hissing mouth interior
  W:  [0xfc, 0xfb, 0xf6], // crisp white eye glint
};

interface KomodoPose {
  bodyY: number;
  sway: number;      // side-to-side monitor-lizard torso/tail sway
  headY: number;
  headZ: number;
  jawOpen: number;
  throatPuff: number;
  tongueOut: number; // 0..1 bright golden-yellow forked tongue flick!
  fl: number;
  fr: number;
  bl: number;
  br: number;
  flLift: number;
  frLift: number;
  blLift: number;
  brLift: number;
}

const KOMODO_POSES: Record<KomodoDragonPoseName, KomodoPose> = {
  // Tongue flicking tasting the air!
  idle0: {
    bodyY: 0.0, sway: 0.0, headY: 0.0, headZ: 0.0, jawOpen: 0.0, throatPuff: 0.0, tongueOut: 0.0,
    fl: 0, fr: 0, bl: 0, br: 0, flLift: 0, frLift: 0, blLift: 0, brLift: 0,
  },
  idle1: {
    bodyY: 0.01, sway: 0.03, headY: 0.02, headZ: 0.02, jawOpen: 0.06, throatPuff: 0.1, tongueOut: 1.0,
    fl: 0, fr: 0, bl: 0, br: 0, flLift: 0, frLift: 0, blLift: 0, brLift: 0,
  },
  idle2: {
    bodyY: -0.008, sway: -0.03, headY: -0.01, headZ: 0.01, jawOpen: 0.0, throatPuff: 0.0, tongueOut: 0.45,
    fl: 0, fr: 0, bl: 0, br: 0, flLift: 0, frLift: 0, blLift: 0, brLift: 0,
  },

  // 6-frame heavy side-to-side swaying monitor-lizard stride
  walk0: {
    bodyY: 0.01, sway: 0.08, headY: 0.0, headZ: 0.02, jawOpen: 0.0, throatPuff: 0.0, tongueOut: 0.0,
    fl: 0.18, fr: -0.14, bl: -0.16, br: 0.16, flLift: 0.07, frLift: 0.0, blLift: 0.0, brLift: 0.06,
  },
  walk1: {
    bodyY: 0.015, sway: 0.05, headY: 0.01, headZ: 0.03, jawOpen: 0.0, throatPuff: 0.0, tongueOut: 0.75,
    fl: 0.09, fr: -0.04, bl: -0.07, br: 0.08, flLift: 0.03, frLift: 0.05, blLift: 0.05, brLift: 0.03,
  },
  walk2: {
    bodyY: -0.005, sway: -0.03, headY: 0.0, headZ: 0.01, jawOpen: 0.0, throatPuff: 0.0, tongueOut: 0.0,
    fl: -0.04, fr: 0.09, bl: 0.07, br: -0.05, flLift: 0.0, frLift: 0.07, blLift: 0.06, brLift: 0.0,
  },
  walk3: {
    bodyY: 0.01, sway: -0.08, headY: 0.0, headZ: 0.02, jawOpen: 0.0, throatPuff: 0.0, tongueOut: 0.0,
    fl: -0.14, fr: 0.18, bl: 0.16, br: -0.16, flLift: 0.0, frLift: 0.07, blLift: 0.06, brLift: 0.0,
  },
  walk4: {
    bodyY: 0.015, sway: -0.05, headY: 0.01, headZ: 0.03, jawOpen: 0.0, throatPuff: 0.0, tongueOut: 0.75,
    fl: -0.04, fr: 0.09, bl: 0.08, br: -0.07, flLift: 0.05, frLift: 0.03, blLift: 0.03, brLift: 0.05,
  },
  walk5: {
    bodyY: -0.005, sway: 0.03, headY: 0.0, headZ: 0.01, jawOpen: 0.0, throatPuff: 0.0, tongueOut: 0.0,
    fl: 0.09, fr: -0.04, bl: -0.05, br: 0.07, flLift: 0.07, frLift: 0.0, blLift: 0.0, brLift: 0.06,
  },

  // 3-frame aggressive hiss (throat puffed & jaws wide open!)
  hiss0: {
    bodyY: 0.02, sway: 0.0, headY: 0.05, headZ: 0.03, jawOpen: 0.55, throatPuff: 0.65, tongueOut: 0.0,
    fl: 0.06, fr: 0.02, bl: -0.04, br: -0.02, flLift: 0, frLift: 0, blLift: 0, brLift: 0,
  },
  hiss1: {
    bodyY: 0.04, sway: 0.02, headY: 0.08, headZ: 0.05, jawOpen: 1.0, throatPuff: 1.0, tongueOut: 0.0,
    fl: 0.08, fr: 0.04, bl: -0.06, br: -0.04, flLift: 0, frLift: 0, blLift: 0, brLift: 0,
  },
  hiss2: {
    bodyY: 0.02, sway: -0.02, headY: 0.04, headZ: 0.03, jawOpen: 0.45, throatPuff: 0.55, tongueOut: 0.0,
    fl: 0.05, fr: 0.02, bl: -0.04, br: -0.02, flLift: 0, frLift: 0, blLift: 0, brLift: 0,
  },

  // 4-frame fierce predatory lunge!
  lunge0: {
    bodyY: -0.04, sway: -0.04, headY: -0.02, headZ: 0.02, jawOpen: 0.35, throatPuff: 0.4, tongueOut: 0.0,
    fl: -0.08, fr: -0.06, bl: 0.14, br: 0.12, flLift: 0, frLift: 0, blLift: 0, brLift: 0,
  },
  lunge1: {
    bodyY: 0.04, sway: 0.04, headY: 0.02, headZ: 0.16, jawOpen: 0.95, throatPuff: 0.6, tongueOut: 0.0,
    fl: 0.28, fr: 0.22, bl: -0.24, br: -0.18, flLift: 0.14, frLift: 0.10, blLift: 0.08, brLift: 0.04,
  },
  lunge2: {
    bodyY: 0.02, sway: 0.02, headY: 0.0, headZ: 0.20, jawOpen: 1.0, throatPuff: 0.5, tongueOut: 0.0,
    fl: 0.32, fr: 0.26, bl: -0.28, br: -0.22, flLift: 0.12, frLift: 0.08, blLift: 0.06, brLift: 0.02,
  },
  lunge3: {
    bodyY: -0.02, sway: 0.0, headY: -0.01, headZ: 0.08, jawOpen: 0.30, throatPuff: 0.2, tongueOut: 0.0,
    fl: 0.12, fr: 0.14, bl: 0.04, br: 0.02, flLift: 0, frLift: 0, blLift: 0, brLift: 0,
  },
};

const komodoCache = new Map<KomodoDragonPoseName, Boar27Pack>();

 function buildKomodoDragonPosePack(pose: KomodoDragonPoseName): Boar27Pack {
  let pack = komodoCache.get(pose);
  if (!pack) {
    const P = KOMODO_POSES[pose];
    const by = P.bodyY;
    const sw = P.sway;
    const hy = 0.05 + by + P.headY;
    const hz = 0.52 + P.headZ;
    const hx = sw * 0.45;
    const jawDrop = P.jawOpen * 0.10;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // 1. Massive heavy-bodied monitor lizard torso + wrinkled thick neck & throat folds
      const chest = sdEllipsoid(x, y, z, sw * 0.2, -0.02 + by, 0.18, 0.22, 0.155, 0.26);
      const belly = sdEllipsoid(x, y, z, -sw * 0.15, -0.03 + by, -0.06, 0.24, 0.165, 0.30);
      const hips = sdEllipsoid(x, y, z, -sw * 0.35, -0.02 + by, -0.32, 0.20, 0.145, 0.22);
      const neck = sdCapsule(x, y, z, sw * 0.2, 0.0 + by, 0.28, hx, hy - 0.01, hz - 0.04, 0.145, 0.115);
      // Wrinkled throat pouch (puffs out dramatically in hiss!)
      const throat = sdEllipsoid(x, y, z, hx * 0.8, hy - 0.075 - P.throatPuff * 0.035, hz - 0.09, 0.115 + P.throatPuff * 0.035, 0.085 + P.throatPuff * 0.04, 0.14);

      let scales = smin(chest, belly, 0.09);
      scales = smin(scales, hips, 0.09);
      scales = smin(scales, neck, 0.075);
      scales = smin(scales, throat, 0.05);

      // 2. Sturdy broad rounded lizard head + jaws
      const cranium = sdEllipsoid(x, y, z, hx, hy + 0.01, hz + 0.02, 0.115, 0.085, 0.145);
      const upperSnout = sdCapsule(x, y, z, hx, hy, hz + 0.08, hx, hy - 0.01, hz + 0.26, 0.082, 0.056);
      const lowerJaw = sdCapsule(x, y, z, hx, hy - 0.035, hz + 0.06, hx, hy - 0.045 - jawDrop, hz + 0.24, 0.068, 0.044);
      const head = smin(smin(cranium, upperSnout, 0.035), lowerJaw, P.jawOpen > 0.2 ? 0.018 : 0.03);
      scales = smin(scales, head, 0.05);

      // 3. Huge thick muscular tapering tail swaying behind!
      const t1x = -sw * 0.7;
      const t2x = sw * 0.8;
      const tail1 = sdCapsule(x, y, z, -sw * 0.35, -0.02 + by, -0.44, t1x, -0.06 + by, -0.82, 0.135, 0.085);
      const tail2 = sdCapsule(x, y, z, t1x, -0.06 + by, -0.82, t2x, -0.10 + by, -1.16, 0.082, 0.032);
      const tail = smin(tail1, tail2, 0.04);
      scales = smin(scales, tail, 0.06);

      // 4. Heavy bowed muscular sprawled monitor-lizard legs with long curved claws!
      const lizardLeg = (sx: number, baseZ: number, swing: number, lift: number) => {
        const s = sx < 0 ? -1 : 1;
        const shY = -0.04 + by;
        const elX = sx + s * 0.12;
        const elY = -0.10 + by + lift * 0.4;
        const elZ = baseZ + swing * 0.45;
        const ftX = sx + s * 0.13;
        const ftY = -0.28 + lift;
        const ftZ = baseZ + swing;
        const upper = sdCapsule(x, y, z, sx, shY, baseZ, elX, elY, elZ, 0.075, 0.060);
        const lower = sdCapsule(x, y, z, elX, elY, elZ, ftX, ftY, ftZ, 0.058, 0.045);
        const foot = sdEllipsoid(x, y, z, ftX, ftY - 0.01, ftZ + 0.04, 0.064, 0.032, 0.078);
        const claws = sdEllipsoid(x, y, z, ftX, ftY - 0.02, ftZ + 0.115, 0.052, 0.018, 0.042);
        return { leg: smin(smin(upper, lower, 0.025), foot, 0.025), claws };
      };

      const fl = lizardLeg(-0.18, 0.20, P.fl, P.flLift);
      const fr = lizardLeg( 0.18, 0.20, P.fr, P.frLift);
      const bl = lizardLeg(-0.18, -0.28, P.bl, P.blLift);
      const br = lizardLeg( 0.18, -0.28, P.br, P.brLift);

      const legs = Math.min(Math.min(fl.leg, fr.leg), Math.min(bl.leg, br.leg));
      const claws = Math.min(Math.min(fl.claws, fr.claws), Math.min(bl.claws, br.claws));
      scales = smin(scales, legs, 0.04);

      // 5. Long bright golden-yellow forked tongue flicking out from the snout!
      let tongue = 99;
      if (P.tongueOut > 0.15) {
        const tLen = 0.18 * P.tongueOut;
        const stem = sdCapsule(x, y, z, hx, hy - 0.025, hz + 0.26, hx, hy - 0.035, hz + 0.26 + tLen, 0.014, 0.010);
        const forkL = sdCapsule(x, y, z, hx, hy - 0.035, hz + 0.26 + tLen, hx - 0.045, hy - 0.045, hz + 0.33 + tLen, 0.010, 0.007);
        const forkR = sdCapsule(x, y, z, hx, hy - 0.035, hz + 0.26 + tLen, hx + 0.045, hy - 0.045, hz + 0.33 + tLen, 0.010, 0.007);
        tongue = Math.min(stem, Math.min(forkL, forkR));
      }

      let mouth = 99;
      if (P.jawOpen > 0.25) {
        mouth = sdEllipsoid(x, y, z, hx, hy - 0.028 - jawDrop * 0.4, hz + 0.16, 0.056, 0.022 + jawDrop * 0.4, 0.085);
      }

      // Dark lizard eyes + crisp white glint + nostrils
      const eyeL = sdEllipsoid(x, y, z, hx - 0.082, hy + 0.032, hz + 0.11, 0.024, 0.022, 0.024);
      const eyeR = sdEllipsoid(x, y, z, hx + 0.082, hy + 0.032, hz + 0.11, 0.024, 0.022, 0.024);
      const eyes = Math.min(eyeL, eyeR);

      const glintL = sdEllipsoid(x, y, z, hx - 0.090, hy + 0.040, hz + 0.125, 0.009, 0.009, 0.009);
      const glintR = sdEllipsoid(x, y, z, hx + 0.090, hy + 0.040, hz + 0.125, 0.009, 0.009, 0.009);
      const glints = Math.min(glintL, glintR);

      let d = scales, mat = 'scales';
      if (claws < d) { d = claws; mat = 'claw'; }
      if (mouth < d) { d = mouth; mat = 'mouth'; }
      if (tongue < d) { d = tongue; mat = 'tongue'; }
      if (eyes < d) { d = eyes; mat = 'eye'; }
      if (glints < d) { d = glints; mat = 'glint'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'glint') return 'W';
      if (mat === 'eye') return 'k';
      if (mat === 'mouth') return 'm';
      if (mat === 'tongue') return shade > 0.42 ? 'y1' : 'y0';
      if (mat === 'claw') return shade > 0.45 ? 'c1' : 'c0';

      // Rugged pebbled monitor-lizard scales + ochre-mottled cross-banding
      const pebble = Math.sin(x * 34 + z * 28) * Math.cos(y * 32 - z * 24) * 0.075;
      const mottle = Math.sin(z * 14 + x * 6) * 0.06;
      const s = shade + pebble + mottle;
      return s > 0.80 ? 'k4' : s > 0.60 ? 'k3' : s > 0.40 ? 'k2' : s > 0.20 ? 'k1' : 'k0';
    };

    pack = build27Pack(KOMODO_PW, KOMODO_PH, 1.32, 0.64, KOMODO_PAL, evalFn, shadeFn);
    komodoCache.set(pose, pack);
  }
  return pack;
}

export function getKomodoDragonPosePack(...args: Parameters<typeof buildKomodoDragonPosePack>): ReturnType<typeof buildKomodoDragonPosePack> {
  return registerAnimalSpritePack(buildKomodoDragonPosePack(...args), { module: './KomodoDragon.ts', factory: 'getKomodoDragonPosePack', args }, buildKomodoDragonPosePack);
}

// ============================================================================
// INSTÂNCIA NA ARENA (KomodoDragon)
// ============================================================================
const KOM_IDLE: readonly KomodoDragonPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const KOM_WALK: readonly KomodoDragonPoseName[] = ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'];
const KOM_HISS: readonly KomodoDragonPoseName[] = ['hiss0', 'hiss1', 'hiss2'];
const KOM_LUNGE: readonly KomodoDragonPoseName[] = ['lunge0', 'lunge1', 'lunge2', 'lunge3'];

function pickCycle<T>(frames: readonly T[], idx: number): T {
  return sampleAnimalCycle(frames, idx);
}

export class KomodoDragon extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private readonly home = new THREE.Vector3();
  private state: 'idle' | 'walk' | 'hiss' | 'lunge' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.6, 3.2);
  private targetYaw = rand(0, Math.PI * 2);
  private gaitPhase = rand(0, Math.PI * 2);
  private provoked = false;

  private readonly centerY = 0.26;

  constructor(ctx: GameContext, startPos: THREE.Vector3) {
    super(ctx, getKomodoDragonPosePack('idle0').getView(2, 0)!, KOMODO_PW, KOMODO_PH, KOMODO_W, KOMODO_H, 'KomodoDragonBillboard');
    this.hp = 100;
    this.maxHp = 100;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.48;
    this.motor.height = 0.54;
    this.motor.teleport(startPos);
    this.home.copy(startPos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.54, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.set(this.position.x, this.position.y + this.centerY, this.position.z);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y + 0.14, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.40, this.position.z);
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
    this.vel.x += hit.dir.x * 3.2;
    this.vel.z += hit.dir.z * 3.2;
    this.vel.y = 2.4;
    this.provoked = true;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.state = 'hiss';
      this.stateT = 0;
      this.stateDur = 1.0;
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
            this.state = Math.random() < 0.25 ? 'hiss' : 'walk';
            this.stateT = 0;
            this.stateDur = this.state === 'hiss' ? 1.1 : rand(2.2, 3.8);
            const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
            this.targetYaw = toHome > 8.5
              ? Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.5, 0.5)
              : this.facing + rand(-1.5, 1.5);
          }
        } else if (this.state === 'walk') {
          if (this.provoked && target && target.alive && dist < 5.5) {
            this.targetYaw = Math.atan2(target.position.x - this.position.x, target.position.z - this.position.z);
            if (dist < 2.6 && this.motor.grounded) {
              this.state = 'lunge';
              this.stateT = 0;
              this.stateDur = 0.8;
            }
          }
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 5);
          speed = this.provoked ? 3.2 : 1.75;
          if (this.stateT >= this.stateDur && this.motor.grounded) {
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.6, 2.8);
          }
        } else if (this.state === 'hiss') {
          if (target && target.alive) {
            this.targetYaw = Math.atan2(target.position.x - this.position.x, target.position.z - this.position.z);
            this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 6);
          }
          if (this.stateT >= this.stateDur) {
            this.state = this.provoked ? 'walk' : 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.8, 3.0);
          }
        } else if (this.state === 'lunge') {
          speed = this.stateT < 0.4 ? 5.2 : 1.0;
          if (this.stateT >= this.stateDur && this.motor.grounded) {
            this.state = 'walk';
            this.stateT = 0;
            this.stateDur = 1.8;
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

    let pose: KomodoDragonPoseName;
    if (!this.alive) pose = 'idle0';
    else if (this.state === 'lunge') pose = pickCycle(KOM_LUNGE, this.stateT * 5.0);
    else if (this.state === 'hiss') pose = pickCycle(KOM_HISS, this.stateT * 3.0);
    else if (this.state === 'walk') pose = pickCycle(KOM_WALK, (this.gaitPhase / Math.PI) * 2.5);
    else pose = pickCycle(KOM_IDLE, this.stateT * 2.2);

    const deathSink = this.alive ? 0 : Math.min(0.18, this.deadT * 0.4);
    this.renderBillboard(getKomodoDragonPosePack(pose), this.position.y + this.centerY - deathSink, camera, drawingBufferSize);
  }
}
