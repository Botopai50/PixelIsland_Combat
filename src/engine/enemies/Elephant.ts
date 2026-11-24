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
// ELEFANTE AFRICANO (African Elephant) — Flagship 88×74 @ ANIMAL_PPU
// ============================================================================
export type ElephantPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'walk0' | 'walk1' | 'walk2' | 'walk3' | 'walk4' | 'walk5'
  | 'trumpet0' | 'trumpet1' | 'trumpet2'
  | 'charge0' | 'charge1' | 'charge2' | 'charge3';

export const ELEPHANT_PW = 88;
export const ELEPHANT_PH = 74;
export const ELEPHANT_W = ELEPHANT_PW / ANIMAL_PPU;
export const ELEPHANT_H = ELEPHANT_PH / ANIMAL_PPU;

/** 5-tone warm slate-grey / dusty-ash skin + dusty-rose inner ear + gleaming ivory tusk ramp. */
const ELEPHANT_PAL: Record<string, [number, number, number]> = {
  k:  [0x15, 0x15, 0x19], // crisp 1px outline / dark eye / tail tuft
  g0: [0x38, 0x39, 0x40], // deep slate-grey skin shadow / fold crease
  g1: [0x54, 0x55, 0x5d], // warm slate-grey mid-shadow
  g2: [0x74, 0x75, 0x7d], // dusty-ash elephant midtone
  g3: [0x96, 0x97, 0x9e], // warm light-grey skin highlight
  g4: [0xb8, 0xb8, 0xbe], // sunlit dusty-ash rim highlight
  p0: [0x7c, 0x62, 0x64], // warm dusty-rose/taupe inner-ear shadow
  p1: [0xa6, 0x86, 0x86], // warm dusty-rose inner-ear highlight
  t0: [0xb4, 0xa4, 0x82], // ivory tusk shadow
  t1: [0xdf, 0xd4, 0xb6], // ivory tusk mid / toenails
  t2: [0xf7, 0xf2, 0xe2], // gleaming ivory tusk highlight
  W:  [0xfd, 0xfd, 0xf8], // crisp white eye glint
};

interface ElephantPose {
  bodyY: number;
  headY: number;
  headPitch: number;
  earFlare: number;   // 0 = relaxed back, 1 = wide flared out!
  trunkLift: number;  // 0 = hanging down, 1 = curled high into the air!
  trunkSway: number;
  tailSway: number;
  fl: number;
  fr: number;
  bl: number;
  br: number;
  flLift: number;
  frLift: number;
  blLift: number;
  brLift: number;
}

const ELEPHANT_POSES: Record<ElephantPoseName, ElephantPose> = {
  // Gentle ear flap & trunk sway
  idle0: {
    bodyY: 0.0, headY: 0.0, headPitch: 0.0, earFlare: 0.15, trunkLift: 0.0, trunkSway: 0.0, tailSway: 0.0,
    fl: 0, fr: 0, bl: 0, br: 0, flLift: 0, frLift: 0, blLift: 0, brLift: 0,
  },
  idle1: {
    bodyY: 0.01, headY: 0.015, headPitch: -0.04, earFlare: 0.42, trunkLift: 0.08, trunkSway: 0.07, tailSway: 0.05,
    fl: 0, fr: 0, bl: 0, br: 0, flLift: 0, frLift: 0, blLift: 0, brLift: 0,
  },
  idle2: {
    bodyY: -0.008, headY: -0.01, headPitch: 0.03, earFlare: 0.10, trunkLift: 0.02, trunkSway: -0.07, tailSway: -0.05,
    fl: 0, fr: 0, bl: 0, br: 0, flLift: 0, frLift: 0, blLift: 0, brLift: 0,
  },

  // 6-frame heavy stately march
  walk0: {
    bodyY: 0.01, headY: 0.0, headPitch: 0.02, earFlare: 0.25, trunkLift: 0.06, trunkSway: 0.04, tailSway: 0.04,
    fl: 0.14, fr: -0.10, bl: -0.12, br: 0.12, flLift: 0.06, frLift: 0.0, blLift: 0.0, brLift: 0.05,
  },
  walk1: {
    bodyY: 0.016, headY: 0.01, headPitch: 0.03, earFlare: 0.30, trunkLift: 0.08, trunkSway: 0.02, tailSway: 0.02,
    fl: 0.07, fr: -0.03, bl: -0.05, br: 0.06, flLift: 0.02, frLift: 0.04, blLift: 0.04, brLift: 0.02,
  },
  walk2: {
    bodyY: -0.006, headY: -0.005, headPitch: 0.01, earFlare: 0.20, trunkLift: 0.04, trunkSway: -0.02, tailSway: -0.02,
    fl: -0.03, fr: 0.07, bl: 0.05, br: -0.04, flLift: 0.0, frLift: 0.06, blLift: 0.05, brLift: 0.0,
  },
  walk3: {
    bodyY: 0.01, headY: 0.0, headPitch: 0.02, earFlare: 0.25, trunkLift: 0.06, trunkSway: -0.04, tailSway: -0.04,
    fl: -0.10, fr: 0.14, bl: 0.12, br: -0.12, flLift: 0.0, frLift: 0.06, blLift: 0.05, brLift: 0.0,
  },
  walk4: {
    bodyY: 0.016, headY: 0.01, headPitch: 0.03, earFlare: 0.30, trunkLift: 0.08, trunkSway: -0.02, tailSway: -0.02,
    fl: -0.03, fr: 0.07, bl: 0.06, br: -0.05, flLift: 0.04, frLift: 0.02, blLift: 0.02, brLift: 0.04,
  },
  walk5: {
    bodyY: -0.006, headY: -0.005, headPitch: 0.01, earFlare: 0.20, trunkLift: 0.04, trunkSway: 0.02, tailSway: 0.02,
    fl: 0.07, fr: -0.03, bl: -0.04, br: 0.05, flLift: 0.06, frLift: 0.0, blLift: 0.0, brLift: 0.05,
  },

  // 3-frame majestic trumpet (ears flared wide + trunk curled high!)
  trumpet0: {
    bodyY: 0.01, headY: 0.04, headPitch: -0.12, earFlare: 0.72, trunkLift: 0.58, trunkSway: 0.0, tailSway: 0.04,
    fl: 0.05, fr: -0.02, bl: -0.02, br: 0.02, flLift: 0, frLift: 0, blLift: 0, brLift: 0,
  },
  trumpet1: {
    bodyY: 0.025, headY: 0.07, headPitch: -0.22, earFlare: 1.0, trunkLift: 1.0, trunkSway: 0.02, tailSway: -0.05,
    fl: 0.08, fr: -0.03, bl: -0.04, br: 0.03, flLift: 0.04, frLift: 0, blLift: 0, brLift: 0,
  },
  trumpet2: {
    bodyY: 0.015, headY: 0.05, headPitch: -0.15, earFlare: 0.85, trunkLift: 0.78, trunkSway: -0.02, tailSway: 0.03,
    fl: 0.06, fr: -0.02, bl: -0.02, br: 0.02, flLift: 0, frLift: 0, blLift: 0, brLift: 0,
  },

  // 4-frame thundering charge
  charge0: {
    bodyY: 0.02, headY: -0.03, headPitch: 0.14, earFlare: 0.95, trunkLift: 0.35, trunkSway: 0.0, tailSway: 0.06,
    fl: 0.20, fr: -0.14, bl: -0.18, br: 0.16, flLift: 0.10, frLift: 0.0, blLift: 0.0, brLift: 0.08,
  },
  charge1: {
    bodyY: 0.035, headY: -0.04, headPitch: 0.16, earFlare: 1.0, trunkLift: 0.42, trunkSway: 0.02, tailSway: -0.06,
    fl: 0.10, fr: 0.04, bl: -0.08, br: 0.08, flLift: 0.04, frLift: 0.08, blLift: 0.08, brLift: 0.04,
  },
  charge2: {
    bodyY: -0.01, headY: -0.03, headPitch: 0.14, earFlare: 0.95, trunkLift: 0.35, trunkSway: -0.02, tailSway: 0.04,
    fl: -0.14, fr: 0.20, bl: 0.16, br: -0.18, flLift: 0.0, frLift: 0.10, blLift: 0.08, brLift: 0.0,
  },
  charge3: {
    bodyY: 0.01, headY: -0.02, headPitch: 0.10, earFlare: 0.85, trunkLift: 0.30, trunkSway: 0.0, tailSway: -0.04,
    fl: 0.04, fr: 0.10, bl: 0.08, br: -0.08, flLift: 0.08, frLift: 0.04, blLift: 0.04, brLift: 0.08,
  },
};

const elephantCache = new Map<ElephantPoseName, Boar27Pack>();

 function buildElephantPosePack(pose: ElephantPoseName): Boar27Pack {
  let pack = elephantCache.get(pose);
  if (!pack) {
    const P = ELEPHANT_POSES[pose];
    const by = P.bodyY;
    const hPivotY = 0.24 + by + P.headY;
    const hPivotZ = 0.40;
    const cosP = Math.cos(P.headPitch);
    const sinP = Math.sin(P.headPitch);

    const evalFn: SdfEvaluator = (x, y, z) => {
      // 1. Majestic towering body: broad sloped back, deep barrel belly, heavy hindquarters
      const shoulders = sdEllipsoid(x, y, z, 0, 0.14 + by, 0.16, 0.34, 0.31, 0.32);
      const midBack = sdEllipsoid(x, y, z, 0, 0.10 + by, -0.08, 0.35, 0.30, 0.34);
      const rump = sdEllipsoid(x, y, z, 0, 0.04 + by, -0.34, 0.31, 0.28, 0.26);
      const belly = sdEllipsoid(x, y, z, 0, -0.06 + by, -0.06, 0.33, 0.22, 0.36);

      let skin = smin(shoulders, midBack, 0.10);
      skin = smin(skin, rump, 0.10);
      skin = smin(skin, belly, 0.08);

      // 2. High domed forehead & massive head in local pitched space
      const dy = y - hPivotY;
      const dz = z - hPivotZ;
      const lx = x;
      const ly = dy * cosP + dz * sinP;
      const lz = -dy * sinP + dz * cosP;

      const cranium = sdEllipsoid(lx, ly, lz, 0, 0.06, 0.02, 0.22, 0.23, 0.21);
      const dome = sdEllipsoid(lx, ly, lz, 0, 0.19, -0.01, 0.17, 0.13, 0.16);
      const cheeks = sdEllipsoid(lx, ly, lz, 0, -0.05, 0.07, 0.18, 0.15, 0.17);
      let headD = smin(smin(cranium, dome, 0.06), cheeks, 0.06);
      skin = smin(skin, headD, 0.08);

      // 3. Huge wide fanned African ears (smooth solid overlapping lobes — NO holes/crevices!)
      const ef = P.earFlare;
      const eOutX = 0.28 + ef * 0.22;
      const eOutZ = -0.14 + ef * 0.10;
      const earSide = (s: number) => {
        const upper = sdEllipsoid(lx, ly, lz, s * eOutX, 0.06, eOutZ, 0.18 + ef * 0.06, 0.24, 0.065);
        const lower = sdEllipsoid(lx, ly, lz, s * (eOutX - 0.04), -0.11, eOutZ + 0.02, 0.14 + ef * 0.04, 0.16, 0.055);
        const bridge = sdEllipsoid(lx, ly, lz, s * 0.20, 0.02, -0.05, 0.12, 0.18, 0.075);
        return smin(smin(upper, lower, 0.07), bridge, 0.06);
      };
      const ears = Math.min(earSide(-1), earSide(1));
      skin = smin(skin, ears, 0.05);

      // 4. Long sinuous 4-segment articulated trunk (hangs/sways or curls high in trumpet!)
      const tl = P.trunkLift;
      const ts = P.trunkSway;
      const t0y = -0.06, t0z = 0.18;
      const t1x = ts * 0.25;
      const t1y = -0.22 + tl * 0.30;
      const t1z = 0.28 + tl * 0.14;
      const t2x = ts * 0.65;
      const t2y = -0.44 + tl * 0.68;
      const t2z = 0.30 + tl * 0.20;
      const t3x = ts;
      const t3y = -0.58 + tl * 1.00;
      const t3z = 0.24 + tl * 0.06;

      const tr1 = sdCapsule(lx, ly, lz, 0, t0y, t0z, t1x, t1y, t1z, 0.105, 0.082);
      const tr2 = sdCapsule(lx, ly, lz, t1x, t1y, t1z, t2x, t2y, t2z, 0.080, 0.062);
      const tr3 = sdCapsule(lx, ly, lz, t2x, t2y, t2z, t3x, t3y, t3z, 0.060, 0.042);
      const trunk = smin(smin(tr1, tr2, 0.03), tr3, 0.03);
      skin = smin(skin, trunk, 0.045);

      // 5. Two long curved gleaming ivory tusks flanking the trunk!
      const tuskSide = (s: number) => {
        const k1 = sdCapsule(lx, ly, lz, s * 0.10, -0.10, 0.15, s * 0.14, -0.20, 0.36, 0.038, 0.028);
        const k2 = sdCapsule(lx, ly, lz, s * 0.14, -0.20, 0.36, s * 0.16, -0.12, 0.56, 0.028, 0.012);
        return smin(k1, k2, 0.015);
      };
      const tusks = Math.min(tuskSide(-1), tuskSide(1));

      // 6. 4 massive columnar legs with pale ivory toenails
      const colLeg = (sx: number, baseZ: number, swing: number, lift: number) => {
        const topY = -0.08 + by;
        const botY = -0.60 + lift;
        const leg = sdCapsule(x, y, z, sx, topY, baseZ, sx, botY, baseZ + swing, 0.135, 0.112);
        const foot = sdEllipsoid(x, y, z, sx, botY - 0.01, baseZ + swing + 0.02, 0.122, 0.055, 0.130);
        const nails = sdEllipsoid(x, y, z, sx, botY - 0.03, baseZ + swing + 0.125, 0.088, 0.026, 0.032);
        return { leg: smin(leg, foot, 0.03), nails };
      };

      const fl = colLeg(-0.21, 0.20, P.fl, P.flLift);
      const fr = colLeg( 0.21, 0.20, P.fr, P.frLift);
      const bl = colLeg(-0.21, -0.30, P.bl, P.blLift);
      const br = colLeg( 0.21, -0.30, P.br, P.brLift);

      const legs = Math.min(Math.min(fl.leg, fr.leg), Math.min(bl.leg, br.leg));
      const nails = Math.min(Math.min(fl.nails, fr.nails), Math.min(bl.nails, br.nails));
      skin = smin(skin, legs, 0.05);

      // 7. Thin tail with dark hair tuft
      const tail = sdCapsule(x, y, z, 0, 0.02 + by, -0.56, P.tailSway, -0.34 + by, -0.64, 0.030, 0.018);
      const tailTuft = sdEllipsoid(x, y, z, P.tailSway, -0.38 + by, -0.65, 0.034, 0.055, 0.034);
      skin = smin(skin, tail, 0.025);

      // Expressive dark eyes + crisp white glint
      const eyeL = sdEllipsoid(lx, ly, lz, -0.145, 0.045, 0.135, 0.028, 0.026, 0.026);
      const eyeR = sdEllipsoid(lx, ly, lz,  0.145, 0.045, 0.135, 0.028, 0.026, 0.026);
      const eyes = Math.min(eyeL, eyeR);

      const glintL = sdEllipsoid(lx, ly, lz, -0.155, 0.055, 0.152, 0.011, 0.011, 0.011);
      const glintR = sdEllipsoid(lx, ly, lz,  0.155, 0.055, 0.152, 0.011, 0.011, 0.011);
      const glints = Math.min(glintL, glintR);

      let d = skin, mat = 'skin';
      if (ears < skin + 0.008 && lz > eOutZ - 0.01 && Math.abs(lx) > 0.24) mat = 'earInner';
      if (tusks < d) { d = tusks; mat = 'tusk'; }
      if (nails < d) { d = nails; mat = 'nail'; }
      if (tailTuft < d) { d = tailTuft; mat = 'tuft'; }
      if (eyes < d) { d = eyes; mat = 'eye'; }
      if (glints < d) { d = glints; mat = 'glint'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'glint') return 'W';
      if (mat === 'eye' || mat === 'tuft') return 'k';
      if (mat === 'nail') return shade > 0.45 ? 't2' : 't1';
      if (mat === 'tusk') return shade > 0.65 ? 't2' : shade > 0.32 ? 't1' : 't0';
      if (mat === 'earInner') return shade > 0.48 ? 'p1' : 'p0';

      // Subtle horizontal skin-fold shading on trunk & columnar legs
      const isTrunkOrLeg = z > 0.56 || y < -0.22;
      const fold = isTrunkOrLeg ? Math.sin(y * 34 + z * 12) * 0.07 : Math.sin(x * 16 + z * 14) * 0.03;
      const s = shade + fold;
      return s > 0.80 ? 'g4' : s > 0.60 ? 'g3' : s > 0.40 ? 'g2' : s > 0.20 ? 'g1' : 'g0';
    };

    pack = build27Pack(ELEPHANT_PW, ELEPHANT_PH, 1.24, 1.14, ELEPHANT_PAL, evalFn, shadeFn);
    elephantCache.set(pose, pack);
  }
  return pack;
}

export function getElephantPosePack(...args: Parameters<typeof buildElephantPosePack>): ReturnType<typeof buildElephantPosePack> {
  return registerAnimalSpritePack(buildElephantPosePack(...args), { module: './Elephant.ts', factory: 'getElephantPosePack', args }, buildElephantPosePack);
}

// ============================================================================
// INSTÂNCIA NA ARENA (Elephant)
// ============================================================================
const ELE_IDLE: readonly ElephantPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const ELE_WALK: readonly ElephantPoseName[] = ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'];
const ELE_TRUMPET: readonly ElephantPoseName[] = ['trumpet0', 'trumpet1', 'trumpet2', 'trumpet1'];
const ELE_CHARGE: readonly ElephantPoseName[] = ['charge0', 'charge1', 'charge2', 'charge3'];

function pickCycle<T>(frames: readonly T[], idx: number): T {
  return sampleAnimalCycle(frames, idx);
}

export class Elephant extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private readonly home = new THREE.Vector3();
  private state: 'idle' | 'walk' | 'trumpet' | 'charge' = 'idle';
  private stateT = 0;
  private stateDur = rand(2.0, 3.8);
  private targetYaw = rand(0, Math.PI * 2);
  private gaitPhase = rand(0, Math.PI * 2);
  private provoked = false;

  private readonly centerY = 0.68;

  constructor(ctx: GameContext, startPos: THREE.Vector3) {
    super(ctx, getElephantPosePack('idle0').getView(2, 0)!, ELEPHANT_PW, ELEPHANT_PH, ELEPHANT_W, ELEPHANT_H, 'ElephantBillboard');
    this.hp = 180;
    this.maxHp = 180;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.68;
    this.motor.height = 1.42;
    this.motor.teleport(startPos);
    this.home.copy(startPos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.76, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.set(this.position.x, this.position.y + this.centerY, this.position.z);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y + 0.36, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 1.08, this.position.z);
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
    this.vel.x += hit.dir.x * 1.8;
    this.vel.z += hit.dir.z * 1.8;
    this.vel.y = 1.4;
    this.provoked = true;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.state = 'trumpet';
      this.stateT = 0;
      this.stateDur = 1.2;
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
            this.state = Math.random() < 0.28 ? 'trumpet' : 'walk';
            this.stateT = 0;
            this.stateDur = this.state === 'trumpet' ? rand(1.4, 2.2) : rand(2.6, 4.4);
            const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
            this.targetYaw = toHome > 9.0
              ? Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.5, 0.5)
              : this.facing + rand(-1.4, 1.4);
          }
        } else if (this.state === 'walk') {
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 3.5);
          speed = 1.6;
          if (this.stateT >= this.stateDur && this.motor.grounded) {
            this.state = Math.random() < 0.3 ? 'trumpet' : 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.8, 3.2);
          }
        } else if (this.state === 'trumpet') {
          if (target && target.alive && this.provoked) {
            this.targetYaw = Math.atan2(target.position.x - this.position.x, target.position.z - this.position.z);
            this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 5);
          }
          if (this.stateT >= this.stateDur) {
            this.state = this.provoked && dist < 7.0 ? 'charge' : 'idle';
            this.stateT = 0;
            this.stateDur = this.state === 'charge' ? 2.4 : rand(1.8, 3.0);
          }
        } else if (this.state === 'charge') {
          if (target && target.alive) {
            this.targetYaw = Math.atan2(target.position.x - this.position.x, target.position.z - this.position.z);
            this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 5.5);
            speed = 4.2;
          }
          if (this.stateT >= this.stateDur && dist > 6.5) {
            this.provoked = false;
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.8, 3.0);
          }
        }

        this.vel.x = damp(this.vel.x, Math.sin(this.facing) * speed, 7, dt);
        this.vel.z = damp(this.vel.z, Math.cos(this.facing) * speed, 7, dt);
        this.vel.y -= 20 * dt;
        this.motor.update(dt);

        const horiz = Math.hypot(this.vel.x, this.vel.z);
        if (horiz > 0.2 && this.motor.grounded) {
          this.gaitPhase += dt * 4.2 * (0.65 + horiz * 0.25);
        }
      }
      this.syncHurtbox();
    }

    const horiz = Math.hypot(this.vel.x, this.vel.z);
    const bob = this.alive && this.motor.grounded && horiz > 0.2
      ? Math.abs(Math.sin(this.gaitPhase)) * 0.025
      : 0;

    let pose: ElephantPoseName;
    if (!this.alive) pose = 'idle0';
    else if (this.state === 'charge') pose = pickCycle(ELE_CHARGE, (this.gaitPhase / Math.PI) * 2.4);
    else if (this.state === 'trumpet') pose = pickCycle(ELE_TRUMPET, this.stateT * 2.4);
    else if (this.state === 'walk') pose = pickCycle(ELE_WALK, (this.gaitPhase / Math.PI) * 2.2);
    else pose = pickCycle(ELE_IDLE, this.stateT * 1.6);

    const deathSink = this.alive ? 0 : Math.min(0.32, this.deadT * 0.45);
    this.renderBillboard(getElephantPosePack(pose), this.position.y + this.centerY + bob - deathSink, camera, drawingBufferSize);
  }
}
