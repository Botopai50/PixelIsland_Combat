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
// AXOLOTE (Leucistic Axolotl) — 34×20 @ ANIMAL_PPU
// ============================================================================
export type AxolotlPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'walk0' | 'walk1' | 'walk2' | 'walk3' | 'walk4' | 'walk5'
  | 'swim0' | 'swim1' | 'swim2' | 'swim3';

export const AXOLOTL_PW = 34;
export const AXOLOTL_PH = 20;
export const AXOLOTL_W = AXOLOTL_PW / ANIMAL_PPU;
export const AXOLOTL_H = AXOLOTL_PH / ANIMAL_PPU;

const AXOLOTL_PAL: Record<string, [number, number, number]> = {
  k:  [0x28, 0x16, 0x24], // 1px dark plum outline / glossy bead eyes / smile
  // Pearlescent pastel-pink / cream-blush salamander body
  p0: [0xd0, 0x90, 0xa8], // soft rose shadow
  p1: [0xeb, 0xb2, 0xc4], // pastel pink mid-shadow
  p2: [0xfb, 0xcf, 0xdc], // classic leucistic axolotl blush-pink
  p3: [0xff, 0xe6, 0xee], // cream-blush pearl
  p4: [0xff, 0xf6, 0xf9], // wet pearlescent highlight
  // Vibrant magenta-rose feathery external gill stalks
  g0: [0xa6, 0x22, 0x58], // deep magenta gill base
  g1: [0xdc, 0x3c, 0x7a], // vibrant rose-magenta gill stalks
  g2: [0xff, 0x6c, 0xa4], // bright feathery gill tips
  // Translucent rosy-pink dorsal & tail fin
  f0: [0xe8, 0x8a, 0xb0], // translucent fin shaded
  f1: [0xff, 0xb8, 0xd4], // translucent fin lit
  w:  [0xff, 0xff, 0xff], // crisp white eye specular glint
};

interface AxolotlPose {
  bodyY: number;
  gillWiggle: number; // gill fan oscillation
  tailSway: number;   // lateral wavy tail sweep
  bodySway: number;   // subtle S-curve body flex
  flSwing: number;
  frSwing: number;
  blSwing: number;
  brSwing: number;
  legTuck: number;    // 0 = splayed walking, 1 = tucked back swimming
}

const AXOLOTL_POSES: Record<AxolotlPoseName, AxolotlPose> = {
  // Cute breathing & gentle gill wiggle
  idle0: {
    bodyY: 0.0, gillWiggle: 0.0, tailSway: 0.0, bodySway: 0.0,
    flSwing: 0.0, frSwing: 0.0, blSwing: 0.0, brSwing: 0.0, legTuck: 0.0,
  },
  idle1: {
    bodyY: 0.01, gillWiggle: 0.06, tailSway: 0.05, bodySway: 0.015,
    flSwing: 0.0, frSwing: 0.0, blSwing: 0.0, brSwing: 0.0, legTuck: 0.0,
  },
  idle2: {
    bodyY: -0.008, gillWiggle: -0.06, tailSway: -0.05, bodySway: -0.015,
    flSwing: 0.0, frSwing: 0.0, blSwing: 0.0, brSwing: 0.0, legTuck: 0.0,
  },

  // 6-frame cute bottom-walking paddle
  walk0: {
    bodyY: 0.008, gillWiggle: 0.04, tailSway: 0.12, bodySway: 0.03,
    flSwing: 0.12, frSwing: -0.08, blSwing: -0.10, brSwing: 0.10, legTuck: 0.0,
  },
  walk1: {
    bodyY: 0.014, gillWiggle: 0.02, tailSway: 0.06, bodySway: 0.015,
    flSwing: 0.06, frSwing: -0.02, blSwing: -0.04, brSwing: 0.06, legTuck: 0.0,
  },
  walk2: {
    bodyY: -0.005, gillWiggle: -0.02, tailSway: -0.06, bodySway: -0.015,
    flSwing: -0.04, frSwing: 0.08, blSwing: 0.06, brSwing: -0.04, legTuck: 0.0,
  },
  walk3: {
    bodyY: 0.008, gillWiggle: -0.04, tailSway: -0.12, bodySway: -0.03,
    flSwing: -0.08, frSwing: 0.12, blSwing: 0.10, brSwing: -0.10, legTuck: 0.0,
  },
  walk4: {
    bodyY: 0.014, gillWiggle: -0.02, tailSway: -0.06, bodySway: -0.015,
    flSwing: -0.02, frSwing: 0.06, blSwing: 0.06, brSwing: -0.04, legTuck: 0.0,
  },
  walk5: {
    bodyY: -0.005, gillWiggle: 0.02, tailSway: 0.06, bodySway: 0.015,
    flSwing: 0.08, frSwing: -0.04, blSwing: -0.04, brSwing: 0.06, legTuck: 0.0,
  },

  // 4-frame wavy tail swimming glide (legs tucked back, undulating tail!)
  swim0: {
    bodyY: 0.03, gillWiggle: -0.05, tailSway: 0.22, bodySway: 0.06,
    flSwing: -0.12, frSwing: -0.12, blSwing: -0.14, brSwing: -0.14, legTuck: 0.85,
  },
  swim1: {
    bodyY: 0.05, gillWiggle: 0.0, tailSway: 0.04, bodySway: 0.01,
    flSwing: -0.14, frSwing: -0.14, blSwing: -0.15, brSwing: -0.15, legTuck: 0.90,
  },
  swim2: {
    bodyY: 0.03, gillWiggle: 0.05, tailSway: -0.22, bodySway: -0.06,
    flSwing: -0.12, frSwing: -0.12, blSwing: -0.14, brSwing: -0.14, legTuck: 0.85,
  },
  swim3: {
    bodyY: 0.01, gillWiggle: 0.0, tailSway: -0.04, bodySway: -0.01,
    flSwing: -0.14, frSwing: -0.14, blSwing: -0.15, brSwing: -0.15, legTuck: 0.90,
  },
};

const axolotlCache = new Map<AxolotlPoseName, Boar27Pack>();

 function buildAxolotlPosePack(pose: AxolotlPoseName): Boar27Pack {
  let pack = axolotlCache.get(pose);
  if (!pack) {
    const P = AXOLOTL_POSES[pose];
    const by = P.bodyY;
    const gw = P.gillWiggle;
    const ts = P.tailSway;
    const bs = P.bodySway;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // 1. Plump pearlescent salamander torso + broad flat smiling head
      const torso = sdEllipsoid(x, y, z, bs * 0.4, -0.04 + by, 0.02, 0.165, 0.125, 0.30);
      const head = sdEllipsoid(x, y, z, -bs * 0.5, -0.01 + by, 0.34, 0.195, 0.125, 0.175);
      const snout = sdEllipsoid(x, y, z, -bs * 0.6, -0.03 + by, 0.44, 0.165, 0.088, 0.115);

      let body = smin(torso, head, 0.06);
      body = smin(body, snout, 0.045);

      // 2. Long wavy finned tail (segmented S-curve core + translucent dorsal/ventral fin!)
      const t1x = ts * 0.45,  t1z = -0.28;
      const t2x = ts * 0.95,  t2z = -0.52;
      const t3x = ts * 1.15,  t3z = -0.74;

      const tailCore1 = sdCapsule(x, y, z, bs * 0.3, -0.04 + by, -0.18, t1x, -0.04 + by, t1z, 0.105, 0.072);
      const tailCore2 = sdCapsule(x, y, z, t1x, -0.04 + by, t1z, t2x, -0.04 + by, t2z, 0.072, 0.042);
      const tailCore3 = sdCapsule(x, y, z, t2x, -0.04 + by, t2z, t3x, -0.04 + by, t3z, 0.042, 0.018);
      const tailCore = smin(smin(tailCore1, tailCore2, 0.025), tailCore3, 0.02);
      body = smin(body, tailCore, 0.04);

      // Translucent dorsal/ventral tail fin ribbon running from back to tail tip
      const fin1 = sdEllipsoid(x, y, z, t1x * 0.6,  0.03 + by, -0.18, 0.022, 0.105, 0.24);
      const fin2 = sdEllipsoid(x, y, z, t2x * 0.85, -0.01 + by, -0.46, 0.020, 0.115, 0.24);
      const fin3 = sdEllipsoid(x, y, z, t3x * 0.95, -0.03 + by, -0.66, 0.018, 0.082, 0.14);
      const tailFin = smin(smin(fin1, fin2, 0.04), fin3, 0.03);

      // 3. Six feathery vibrant magenta-rose external gill stalks (3 fanning out on each side!)
      const hx = -bs * 0.5;
      const hy = 0.01 + by;
      const hz = 0.25;

      const gillPair = (side: number) => {
        const gTop = sdCapsule(
          x, y, z,
          hx + side * 0.15, hy + 0.06, hz,
          hx + side * 0.34, hy + 0.18 + gw * 0.5, hz - 0.06 + gw * 0.3,
          0.030, 0.018,
        );
        const gMid = sdCapsule(
          x, y, z,
          hx + side * 0.16, hy + 0.01, hz - 0.01,
          hx + side * 0.37, hy + 0.04 + gw * 0.3, hz - 0.09 - gw * 0.2,
          0.030, 0.018,
        );
        const gBot = sdCapsule(
          x, y, z,
          hx + side * 0.15, hy - 0.04, hz - 0.02,
          hx + side * 0.33, hy - 0.09 - gw * 0.4, hz - 0.10 + gw * 0.2,
          0.028, 0.016,
        );
        return Math.min(gTop, Math.min(gMid, gBot));
      };
      const gills = Math.min(gillPair(-1), gillPair(1));

      // 4. Tiny splayed pink legs with little toes
      const tuck = P.legTuck;
      const leg = (side: number, baseZ: number, swing: number) => {
        const sx = side * 0.13 + bs * 0.3;
        const sy = -0.08 + by;
        const ex = side * (0.24 - tuck * 0.08);
        const ey = -0.17 + by + tuck * 0.06;
        const ez = baseZ + swing * 0.65 - tuck * 0.14;
        const limb = sdCapsule(x, y, z, sx, sy, baseZ, ex, ey, ez, 0.042, 0.030);
        const paw = sdEllipsoid(x, y, z, ex + side * 0.02, ey - 0.01, ez + 0.02, 0.042, 0.024, 0.042);
        return smin(limb, paw, 0.018);
      };

      const fl = leg(-1,  0.14, P.flSwing);
      const fr = leg( 1,  0.14, P.frSwing);
      const bl = leg(-1, -0.14, P.blSwing);
      const br = leg( 1, -0.14, P.brSwing);
      body = smin(body, Math.min(Math.min(fl, fr), Math.min(bl, br)), 0.028);

      // 5. Cute glossy black bead eyes + crisp white specular glint
      const eyeL = sdEllipsoid(x, y, z, hx - 0.115, 0.035 + by, 0.455, 0.032, 0.032, 0.030);
      const eyeR = sdEllipsoid(x, y, z, hx + 0.115, 0.035 + by, 0.455, 0.032, 0.032, 0.030);
      const eyes = Math.min(eyeL, eyeR);

      const glintL = sdEllipsoid(x, y, z, hx - 0.124, 0.046 + by, 0.478, 0.012, 0.012, 0.012);
      const glintR = sdEllipsoid(x, y, z, hx + 0.124, 0.046 + by, 0.478, 0.012, 0.012, 0.012);
      const glints = Math.min(glintL, glintR);

      let d = body, mat = 'skin';
      if (tailFin < d) { d = tailFin; mat = 'fin'; }
      if (gills < d) { d = gills; mat = 'gill'; }
      if (eyes < d) { d = eyes; mat = 'eye'; }
      if (glints < d) { d = glints; mat = 'glint'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'glint') return 'w';
      if (mat === 'eye') return 'k';
      if (mat === 'gill') {
        // Feathery vibrant magenta-rose stalks with brighter tips
        return Math.abs(x) > 0.27 ? 'g2' : shade > 0.45 ? 'g1' : 'g0';
      }
      if (mat === 'fin') {
        return shade > 0.48 ? 'f1' : 'f0';
      }

      // Cute tiny dark smile line across the front of the flat snout
      if (z > 0.51 && y > -0.065 + by && y < -0.042 + by && Math.abs(x + bs * 0.6) < 0.095) {
        return 'k';
      }

      // Pearlescent pastel-pink / cream-blush salamander body ramp
      const wet = y > 0.02 + by ? 0.08 : 0;
      const s = shade + wet;
      return s > 0.84 ? 'p4'
        : s > 0.66 ? 'p3'
        : s > 0.44 ? 'p2'
        : s > 0.22 ? 'p1'
        : 'p0';
    };

    pack = build27Pack(AXOLOTL_PW, AXOLOTL_PH, 1.10, 0.58, AXOLOTL_PAL, evalFn, shadeFn);
    axolotlCache.set(pose, pack);
  }
  return pack;
}

export function getAxolotlPosePack(...args: Parameters<typeof buildAxolotlPosePack>): ReturnType<typeof buildAxolotlPosePack> {
  return registerAnimalSpritePack(buildAxolotlPosePack(...args), { module: './Axolotl.ts', factory: 'getAxolotlPosePack', args }, buildAxolotlPosePack);
}

function pickCycle<T>(frames: readonly T[], idx: number): T {
  return sampleAnimalCycle(frames, idx);
}

const AXOLOTL_IDLE: readonly AxolotlPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const AXOLOTL_WALK: readonly AxolotlPoseName[] = ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'];
const AXOLOTL_SWIM: readonly AxolotlPoseName[] = ['swim0', 'swim1', 'swim2', 'swim3'];

export class Axolotl extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private readonly home = new THREE.Vector3();
  private state: 'idle' | 'walk' | 'swim' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.4, 2.8);
  private targetYaw = rand(0, Math.PI * 2);
  private gaitPhase = rand(0, Math.PI * 2);

  private static readonly RADIUS = 0.24;
  private static readonly HEIGHT = 0.30;
  private static readonly CENTER_Y = 0.14;

  constructor(ctx: GameContext, startPos: THREE.Vector3, pondCenter?: THREE.Vector3) {
    super(
      ctx,
      getAxolotlPosePack('idle0').getView(2, 0)!,
      AXOLOTL_PW,
      AXOLOTL_PH,
      AXOLOTL_W,
      AXOLOTL_H,
      'AxolotlBillboard',
    );
    this.hp = 30;
    this.maxHp = 30;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = Axolotl.RADIUS;
    this.motor.height = Axolotl.HEIGHT;
    this.motor.teleport(startPos);
    this.home.copy(pondCenter ?? startPos);
    this.hurtboxes.push({
      a: new THREE.Vector3(),
      b: new THREE.Vector3(),
      radius: Axolotl.RADIUS + 0.06,
      tag: 'body',
      enabled: true,
    });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.set(this.position.x, this.position.y + Axolotl.CENTER_Y, this.position.z);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y + Axolotl.CENTER_Y * 0.5, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + Axolotl.CENTER_Y * 1.5, this.position.z);
    this.hurtboxes[0].enabled = this.alive;
    this.stickRoot.position.set(this.position.x, this.position.y + Axolotl.CENTER_Y, this.position.z);
    this.stickRoot.rotation.y = this.facing;
  }

  receiveHit(hit: HitInfo): HitResult {
    const res = emptyResult('flesh');
    if (!this.alive) { res.ignored = true; return res; }
    this.hp = Math.max(0, this.hp - hit.damage);
    res.damage = hit.damage;
    this.flash = 1.0;
    this.vel.x += hit.dir.x * 3.4;
    this.vel.z += hit.dir.z * 3.4;
    this.vel.y = 2.2;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.state = 'swim';
      this.stateT = 0;
      this.stateDur = 2.0;
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
        this.vel.x = damp(this.vel.x, 0, 6, dt);
        this.vel.z = damp(this.vel.z, 0, 6, dt);
        this.vel.y -= 20 * dt;
        this.motor.update(dt);
      } else {
        const dist = target && target.alive
          ? Math.hypot(target.position.x - this.position.x, target.position.z - this.position.z)
          : 999;

        let speed = 0;
        if (dist < 2.8 && this.state !== 'swim') {
          this.state = 'swim';
          this.stateT = 0;
          this.stateDur = 1.8;
          if (target) {
            this.targetYaw = Math.atan2(this.position.x - target.position.x, this.position.z - target.position.z);
          }
        }

        if (this.state === 'idle') {
          if (this.stateT >= this.stateDur) {
            this.state = Math.random() < 0.50 ? 'swim' : 'walk';
            this.stateT = 0;
            this.stateDur = rand(1.6, 3.0);
            const toPond = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
            this.targetYaw = toPond > 4.5
              ? Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.5, 0.5)
              : this.facing + rand(-1.8, 1.8);
          }
        } else if (this.state === 'walk') {
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 5.0);
          speed = 1.15;
          if (this.stateT >= this.stateDur) {
            this.state = Math.random() < 0.45 ? 'swim' : 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.4, 2.6);
          }
        } else if (this.state === 'swim') {
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 6.5);
          speed = 2.45;
          if (this.stateT >= this.stateDur) {
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.2, 2.2);
          }
        }

        this.vel.x = damp(this.vel.x, Math.sin(this.facing) * speed, 7.0, dt);
        this.vel.z = damp(this.vel.z, Math.cos(this.facing) * speed, 7.0, dt);
        this.vel.y -= 20 * dt;
        this.motor.update(dt);

        const horiz = Math.hypot(this.vel.x, this.vel.z);
        if (horiz > 0.15) {
          this.gaitPhase += dt * 6.2 * (0.65 + horiz * 0.25);
        }
      }
      this.syncHurtbox();
    }

    const bob = this.alive && this.state === 'swim'
      ? 0.04 + Math.sin(this.gaitPhase) * 0.025
      : 0;

    let pose: AxolotlPoseName;
    if (!this.alive) {
      pose = 'idle0';
    } else if (this.state === 'swim') {
      pose = pickCycle(AXOLOTL_SWIM, (this.gaitPhase / Math.PI) * 2.4);
    } else if (this.state === 'walk') {
      pose = pickCycle(AXOLOTL_WALK, (this.gaitPhase / Math.PI) * 2.6);
    } else {
      pose = pickCycle(AXOLOTL_IDLE, this.stateT * 2.2);
    }

    const deathSink = this.alive ? 0 : Math.min(0.12, this.deadT * 0.35);
    this.renderBillboard(getAxolotlPosePack(pose), this.position.y + Axolotl.CENTER_Y + bob - deathSink, camera, drawingBufferSize);
  }
}
