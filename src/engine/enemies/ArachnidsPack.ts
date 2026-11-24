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

export type SpiderPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'scuttle0' | 'scuttle1' | 'scuttle2' | 'scuttle3' | 'scuttle4' | 'scuttle5'
  | 'threat0' | 'threat1' | 'threat2';

export type BlackWidowPoseName = SpiderPoseName;
export type TarantulaPoseName = SpiderPoseName;
export type WanderingSpiderPoseName = SpiderPoseName;
export type TrapdoorSpiderPoseName = SpiderPoseName;
export type GoliathSpiderPoseName = SpiderPoseName;

interface SpiderPose {
  bodyY: number;
  legWave: number;
  threatLift: number; // raises front 2 pairs of legs defensively!
  rearTilt: number;
}

const SPIDER_POSES: Record<SpiderPoseName, SpiderPose> = {
  idle0:    { bodyY: 0.00,  legWave: 0.00, threatLift: 0.00, rearTilt: 0.00 },
  idle1:    { bodyY: 0.015, legWave: 0.25, threatLift: 0.04, rearTilt: 0.01 },
  idle2:    { bodyY: -0.01, legWave: -0.25, threatLift: 0.00, rearTilt: -0.01 },

  scuttle0: { bodyY: 0.012, legWave: 0.00, threatLift: 0.02, rearTilt: 0.01 },
  scuttle1: { bodyY: 0.024, legWave: 1.05, threatLift: 0.04, rearTilt: 0.02 },
  scuttle2: { bodyY: 0.008, legWave: 2.09, threatLift: 0.01, rearTilt: 0.00 },
  scuttle3: { bodyY: 0.014, legWave: 3.14, threatLift: 0.02, rearTilt: 0.01 },
  scuttle4: { bodyY: 0.024, legWave: 4.19, threatLift: 0.04, rearTilt: 0.02 },
  scuttle5: { bodyY: 0.008, legWave: 5.24, threatLift: 0.01, rearTilt: 0.00 },

  threat0:  { bodyY: 0.03,  legWave: 0.10, threatLift: 0.65, rearTilt: 0.05 },
  threat1:  { bodyY: 0.05,  legWave: 0.35, threatLift: 1.00, rearTilt: 0.08 },
  threat2:  { bodyY: 0.035, legWave: -0.20, threatLift: 0.80, rearTilt: 0.06 },
};

interface SpiderSpec {
  pw: number;
  ph: number;
  boxW: number;
  boxH: number;
  pal: Record<string, [number, number, number]>;
  abdRx: number;
  abdRy: number;
  abdRz: number;
  abdY: number;
  abdZ: number;
  cephRx: number;
  cephRy: number;
  cephRz: number;
  legThick: number;
  legArchY: number;
  legSpanX: number;
  threatScale: number;
  shade: (mat: string, shade: number, x: number, y: number, z: number, by: number) => string;
}

function buildSpiderPack(spec: SpiderSpec, pose: SpiderPoseName): Boar27Pack {
  const P = SPIDER_POSES[pose];
  const by = P.bodyY;

  const evalFn: SdfEvaluator = (x, y, z) => {
    // 1. Abdomen + cephalothorax
    const abdomen = sdEllipsoid(x, y, z, 0, spec.abdY + by - P.rearTilt * 0.4, spec.abdZ, spec.abdRx, spec.abdRy, spec.abdRz);
    const ceph = sdEllipsoid(x, y, z, 0, -0.04 + by + P.rearTilt * 0.3, 0.14, spec.cephRx, spec.cephRy, spec.cephRz);
    let body = smin(abdomen, ceph, 0.04);

    // Pedipalps / chelicerae fangs in front
    const fangL = sdCapsule(x, y, z, -0.055, -0.05 + by + P.rearTilt * 0.4, 0.24, -0.075, -0.09 + by + P.threatLift * 0.06, 0.34, spec.legThick * 0.95, spec.legThick * 0.55);
    const fangR = sdCapsule(x, y, z,  0.055, -0.05 + by + P.rearTilt * 0.4, 0.24,  0.075, -0.09 + by + P.threatLift * 0.06, 0.34, spec.legThick * 0.95, spec.legThick * 0.55);
    const fangs = Math.min(fangL, fangR);
    body = smin(body, fangs, 0.02);

    // 2. Eight sharply arched jointed spider legs (4 per side)
    let legs = 99;
    let knees = 99;
    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < 4; i++) {
        const baseZ = -0.04 + i * 0.075;
        const zFan = (i - 1.5) * 0.18;
        const phase = P.legWave + i * 1.57 + (side < 0 ? 0 : Math.PI);
        const lift = Math.max(0, Math.sin(phase)) * 0.085;
        const swing = Math.cos(phase) * 0.065;

        const isFrontThreat = i === 3 ? 1.0 : i === 2 ? 0.45 : 0.0;
        const tLift = P.threatLift * spec.threatScale * isFrontThreat;

        const hipX = side * (spec.cephRx * 0.85);
        const hipY = -0.05 + by;
        const kneeX = side * (spec.legSpanX * 0.66 - tLift * 0.10);
        const kneeY = spec.legArchY + by + lift + tLift * 0.24;
        const kneeZ = baseZ + zFan * 0.5 + swing * 0.45 + tLift * 0.14;

        const footX = side * (spec.legSpanX - tLift * 0.16);
        const footY = -0.28 + lift * 1.15 + tLift * 0.48;
        const footZ = baseZ + zFan + swing + tLift * 0.28;

        const femur = sdCapsule(x, y, z, hipX, hipY, baseZ, kneeX, kneeY, kneeZ, spec.legThick, spec.legThick * 0.82);
        const tibia = sdCapsule(x, y, z, kneeX, kneeY, kneeZ, footX, footY, footZ, spec.legThick * 0.80, spec.legThick * 0.42);
        legs = Math.min(legs, smin(femur, tibia, 0.014));

        const kn = sdEllipsoid(x, y, z, kneeX, kneeY, kneeZ, spec.legThick * 1.15, spec.legThick * 1.15, spec.legThick * 1.15);
        knees = Math.min(knees, kn);
      }
    }
    body = smin(body, legs, 0.02);

    // Tiny gleaming eyes
    const eyeL = sdEllipsoid(x, y, z, -0.042, 0.01 + by + P.rearTilt * 0.3, 0.25, 0.022, 0.022, 0.022);
    const eyeR = sdEllipsoid(x, y, z,  0.042, 0.01 + by + P.rearTilt * 0.3, 0.25, 0.022, 0.022, 0.022);
    const eyes = Math.min(eyeL, eyeR);

    let d = body;
    let mat = 'body';
    if (abdomen < ceph - 0.005) mat = 'abdomen';
    if (fangs < ceph + 0.005 && z > 0.24) mat = 'fang';
    if (legs < abdomen + 0.004 && legs < ceph + 0.004 && Math.abs(x) > spec.cephRx) mat = 'leg';
    if (knees < d + 0.005) mat = 'knee';
    if (eyes < d) { d = eyes; mat = 'eye'; }
    return { d, mat };
  };

  const shadeFn: ColorShaper = (mat, shade, x, y, z) => spec.shade(mat, shade, x, y, z, by);
  return build27Pack(spec.pw, spec.ph, spec.boxW, spec.boxH, spec.pal, evalFn, shadeFn);
}

const SPIDER_IDLE: readonly SpiderPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const SPIDER_SCUTTLE: readonly SpiderPoseName[] = ['scuttle0', 'scuttle1', 'scuttle2', 'scuttle3', 'scuttle4', 'scuttle5'];
const SPIDER_THREAT: readonly SpiderPoseName[] = ['threat0', 'threat1', 'threat2'];

abstract class BaseSpider extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private readonly home = new THREE.Vector3();
  private state: 'idle' | 'scuttle' | 'threat' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.1, 2.4);
  private gaitPhase = rand(0, Math.PI * 2);
  private readonly speed: number;
  private readonly centerY: number;
  private readonly getPack: (pose: SpiderPoseName) => Boar27Pack;

  constructor(
    ctx: GameContext,
    pos: THREE.Vector3,
    pw: number,
    ph: number,
    w: number,
    h: number,
    name: string,
    hp: number,
    radius: number,
    speed: number,
    centerY: number,
    getPack: (pose: SpiderPoseName) => Boar27Pack
  ) {
    super(ctx, getPack('idle0').getView(2, 0)!, pw, ph, w, h, name);
    this.hp = hp;
    this.maxHp = hp;
    this.speed = speed;
    this.centerY = centerY;
    this.getPack = getPack;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = radius;
    this.motor.height = radius * 1.25;
    this.motor.teleport(pos);
    this.home.copy(pos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: radius * 1.25, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.set(this.position.x, this.position.y + this.centerY, this.position.z);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y + 0.04, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + this.centerY * 1.6, this.position.z);
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
    this.vel.x += hit.dir.x * 4.0;
    this.vel.z += hit.dir.z * 4.0;
    this.vel.y = 2.6;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.state = 'threat';
      this.stateT = 0;
      this.stateDur = 1.6;
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

        if (dist < 2.6 && this.state !== 'threat') {
          this.state = 'threat';
          this.stateT = 0;
          this.stateDur = 1.5;
        }

        if (this.state === 'idle') {
          if (this.stateT >= this.stateDur) {
            this.state = 'scuttle';
            this.stateT = 0;
            this.stateDur = rand(1.3, 2.6);
            const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
            if (toHome > 5.0) {
              this.facing = Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.4, 0.4);
            } else {
              this.facing += rand(-1.3, 1.3);
            }
          }
        } else if (this.state === 'scuttle') {
          vx = Math.sin(this.facing) * this.speed;
          vz = Math.cos(this.facing) * this.speed;
          if (this.stateT >= this.stateDur) {
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.0, 2.2);
          }
        } else if (this.state === 'threat') {
          if (target && target.alive) {
            const toPlayer = Math.atan2(target.position.x - this.position.x, target.position.z - this.position.z);
            this.facing += angleDiff(this.facing, toPlayer) * Math.min(1, dt * 10);
          }
          if (this.stateT >= this.stateDur && dist > 3.4) {
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.0, 2.0);
          }
        }

        this.vel.x = damp(this.vel.x, vx, 9, dt);
        this.vel.z = damp(this.vel.z, vz, 9, dt);
        this.vel.y -= 20 * dt;
        this.motor.update(dt);

        const horiz = Math.hypot(this.vel.x, this.vel.z);
        if (horiz > 0.15 && this.motor.grounded) {
          this.gaitPhase += dt * 8.5 * (0.7 + horiz * 0.3);
        }
      }
      this.syncHurtbox();
    }

    let pose: SpiderPoseName;
    if (!this.alive) pose = 'idle0';
    else if (this.state === 'threat') pose = pickCycle(SPIDER_THREAT, this.stateT * 4.2);
    else if (this.state === 'scuttle') pose = pickCycle(SPIDER_SCUTTLE, (this.gaitPhase / Math.PI) * 3.0);
    else pose = pickCycle(SPIDER_IDLE, this.stateT * 2.0);

    const deathSink = this.alive ? 0 : Math.min(0.12, this.deadT * 0.3);
    this.renderBillboard(this.getPack(pose), this.position.y + this.centerY - deathSink, camera, drawingBufferSize);
  }
}

// ============================================================================
// 1. VIÚVA-NEGRA (Black Widow) — 26×20 @ 56 PPU
// ============================================================================
export const BLACK_WIDOW_PW = 26;
export const BLACK_WIDOW_PH = 20;
export const BLACK_WIDOW_W = BLACK_WIDOW_PW / ANIMAL_PPU;
export const BLACK_WIDOW_H = BLACK_WIDOW_PH / ANIMAL_PPU;

const BLACK_WIDOW_SPEC: SpiderSpec = {
  pw: BLACK_WIDOW_PW,
  ph: BLACK_WIDOW_PH,
  boxW: 1.08,
  boxH: 0.78,
  pal: {
    k:  [0x0c, 0x0c, 0x12], // crisp 1px outline
    b0: [0x14, 0x16, 0x22], // deep jet-black shadow
    b1: [0x24, 0x28, 0x3b], // glossy midnight-black chitin
    b2: [0x45, 0x4d, 0x6b], // cool indigo-slate sheen
    b3: [0x9e, 0xad, 0xd4], // polished specular highlight
    r0: [0xb8, 0x14, 0x20], // crimson hourglass shadow
    r1: [0xff, 0x29, 0x38], // bright scarlet-crimson hourglass
    W:  [0xff, 0xfb, 0xf4], // white glint
  },
  abdRx: 0.21, abdRy: 0.21, abdRz: 0.22, abdY: 0.04, abdZ: -0.15,
  cephRx: 0.105, cephRy: 0.085, cephRz: 0.115,
  legThick: 0.025, legArchY: 0.18, legSpanX: 0.56, threatScale: 0.85,
  shade: (mat, shade, x, y, z, by) => {
    if (mat === 'eye') return 'r1';
    if (mat === 'abdomen') {
      // Iconic bright crimson hourglass marking on the glossy spherical abdomen!
      const dz = z + 0.15;
      const inBand = y > 0.08 + by && Math.abs(dz) < 0.11;
      const pinch = Math.abs(x) < 0.022 + Math.abs(dz) * 0.65;
      if (inBand && pinch) return shade > 0.45 ? 'r1' : 'r0';
    }
    return shade > 0.86 ? 'b3' : shade > 0.60 ? 'b2' : shade > 0.28 ? 'b1' : 'b0';
  },
};

const blackWidowCache = new Map<BlackWidowPoseName, Boar27Pack>();
 function buildBlackWidowPosePack(pose: BlackWidowPoseName): Boar27Pack {
  let pack = blackWidowCache.get(pose);
  if (!pack) {
    pack = buildSpiderPack(BLACK_WIDOW_SPEC, pose);
    blackWidowCache.set(pose, pack);
  }
  return pack;
}

export function getBlackWidowPosePack(...args: Parameters<typeof buildBlackWidowPosePack>): ReturnType<typeof buildBlackWidowPosePack> {
  return registerAnimalSpritePack(buildBlackWidowPosePack(...args), { module: './ArachnidsPack.ts', factory: 'getBlackWidowPosePack', args }, buildBlackWidowPosePack);
}

export class BlackWidow extends BaseSpider {
  constructor(ctx: GameContext, pos: THREE.Vector3) {
    super(ctx, pos, BLACK_WIDOW_PW, BLACK_WIDOW_PH, BLACK_WIDOW_W, BLACK_WIDOW_H, 'BlackWidowBillboard', 18, 0.18, 1.85, 0.13, getBlackWidowPosePack);
  }
}

// ============================================================================
// 2. TARÂNTULA (Mexican Red-Knee Tarantula) — 34×24 @ 56 PPU
// ============================================================================
export const TARANTULA_PW = 34;
export const TARANTULA_PH = 24;
export const TARANTULA_W = TARANTULA_PW / ANIMAL_PPU;
export const TARANTULA_H = TARANTULA_PH / ANIMAL_PPU;

const TARANTULA_SPEC: SpiderSpec = {
  pw: TARANTULA_PW,
  ph: TARANTULA_PH,
  boxW: 1.24,
  boxH: 0.84,
  pal: {
    k:  [0x12, 0x0d, 0x0a], // crisp 1px outline
    b0: [0x26, 0x1b, 0x14], // deep fuzzy espresso shadow
    b1: [0x42, 0x2f, 0x22], // rich dark-brown hairy body
    b2: [0x66, 0x4b, 0x36], // warm brown bristle midtone
    b3: [0x8c, 0x6c, 0x50], // sunlit fuzzy highlight
    o0: [0xc4, 0x4d, 0x14], // burnt-orange knee shadow
    o1: [0xff, 0x7b, 0x24], // vibrant Mexican red-knee orange bands
    W:  [0xff, 0xfb, 0xf2], // eye glint
  },
  abdRx: 0.21, abdRy: 0.17, abdRz: 0.24, abdY: 0.02, abdZ: -0.17,
  cephRx: 0.145, cephRy: 0.105, cephRz: 0.15,
  legThick: 0.044, legArchY: 0.11, legSpanX: 0.62, threatScale: 0.90,
  shade: (mat, shade) => {
    if (mat === 'eye') return 'W';
    if (mat === 'knee') return shade > 0.40 ? 'o1' : 'o0';
    return shade > 0.78 ? 'b3' : shade > 0.48 ? 'b2' : shade > 0.22 ? 'b1' : 'b0';
  },
};

const tarantulaCache = new Map<TarantulaPoseName, Boar27Pack>();
 function buildTarantulaPosePack(pose: TarantulaPoseName): Boar27Pack {
  let pack = tarantulaCache.get(pose);
  if (!pack) {
    pack = buildSpiderPack(TARANTULA_SPEC, pose);
    tarantulaCache.set(pose, pack);
  }
  return pack;
}

export function getTarantulaPosePack(...args: Parameters<typeof buildTarantulaPosePack>): ReturnType<typeof buildTarantulaPosePack> {
  return registerAnimalSpritePack(buildTarantulaPosePack(...args), { module: './ArachnidsPack.ts', factory: 'getTarantulaPosePack', args }, buildTarantulaPosePack);
}

export class Tarantula extends BaseSpider {
  constructor(ctx: GameContext, pos: THREE.Vector3) {
    super(ctx, pos, TARANTULA_PW, TARANTULA_PH, TARANTULA_W, TARANTULA_H, 'TarantulaBillboard', 28, 0.22, 1.45, 0.14, getTarantulaPosePack);
  }
}

// ============================================================================
// 3. ARMADEIRA (Brazilian Wandering Spider) — 32×24 @ 56 PPU
// ============================================================================
export const WANDERING_SPIDER_PW = 32;
export const WANDERING_SPIDER_PH = 24;
export const WANDERING_SPIDER_W = WANDERING_SPIDER_PW / ANIMAL_PPU;
export const WANDERING_SPIDER_H = WANDERING_SPIDER_PH / ANIMAL_PPU;

const WANDERING_SPIDER_SPEC: SpiderSpec = {
  pw: WANDERING_SPIDER_PW,
  ph: WANDERING_SPIDER_PH,
  boxW: 1.24,
  boxH: 0.88,
  pal: {
    k:  [0x14, 0x0e, 0x0b], // crisp 1px outline / dark dorsal stripe
    t0: [0x4a, 0x34, 0x20], // tawny-brown shadow
    t1: [0x78, 0x57, 0x35], // warm tawny-ochre carapace
    t2: [0xa6, 0x7c, 0x4e], // light sandy-tawny midtone
    t3: [0xd4, 0xad, 0x77], // sunlit tan highlight
    r0: [0xb8, 0x16, 0x20], // crimson chelicerae shadow
    r1: [0xff, 0x32, 0x3c], // bright crimson warning chelicerae!
    W:  [0xff, 0xfb, 0xf2], // eye glint
  },
  abdRx: 0.165, abdRy: 0.145, abdRz: 0.22, abdY: 0.01, abdZ: -0.17,
  cephRx: 0.135, cephRy: 0.095, cephRz: 0.145,
  legThick: 0.032, legArchY: 0.16, legSpanX: 0.64, threatScale: 1.25,
  shade: (mat, shade, x, y, _z, by) => {
    if (mat === 'eye') return 'W';
    if (mat === 'fang') return shade > 0.42 ? 'r1' : 'r0';
    if (mat === 'body' || mat === 'abdomen') {
      // Iconic dark dorsal stripe down the tawny carapace & abdomen
      if (Math.abs(x) < 0.032 && y > 0.02 + by) return 'k';
    }
    return shade > 0.78 ? 't3' : shade > 0.48 ? 't2' : shade > 0.22 ? 't1' : 't0';
  },
};

const wanderingSpiderCache = new Map<WanderingSpiderPoseName, Boar27Pack>();
 function buildWanderingSpiderPosePack(pose: WanderingSpiderPoseName): Boar27Pack {
  let pack = wanderingSpiderCache.get(pose);
  if (!pack) {
    pack = buildSpiderPack(WANDERING_SPIDER_SPEC, pose);
    wanderingSpiderCache.set(pose, pack);
  }
  return pack;
}

export function getWanderingSpiderPosePack(...args: Parameters<typeof buildWanderingSpiderPosePack>): ReturnType<typeof buildWanderingSpiderPosePack> {
  return registerAnimalSpritePack(buildWanderingSpiderPosePack(...args), { module: './ArachnidsPack.ts', factory: 'getWanderingSpiderPosePack', args }, buildWanderingSpiderPosePack);
}

export class WanderingSpider extends BaseSpider {
  constructor(ctx: GameContext, pos: THREE.Vector3) {
    super(ctx, pos, WANDERING_SPIDER_PW, WANDERING_SPIDER_PH, WANDERING_SPIDER_W, WANDERING_SPIDER_H, 'WanderingSpiderBillboard', 26, 0.21, 2.05, 0.15, getWanderingSpiderPosePack);
  }
}

// ============================================================================
// 4. ARANHA-ALÇAPÃO (Trapdoor Spider) — 28×20 @ 56 PPU
// ============================================================================
export const TRAPDOOR_SPIDER_PW = 28;
export const TRAPDOOR_SPIDER_PH = 20;
export const TRAPDOOR_SPIDER_W = TRAPDOOR_SPIDER_PW / ANIMAL_PPU;
export const TRAPDOOR_SPIDER_H = TRAPDOOR_SPIDER_PH / ANIMAL_PPU;

const TRAPDOOR_SPIDER_SPEC: SpiderSpec = {
  pw: TRAPDOOR_SPIDER_PW,
  ph: TRAPDOOR_SPIDER_PH,
  boxW: 1.12,
  boxH: 0.76,
  pal: {
    k:  [0x12, 0x0a, 0x08], // crisp 1px outline
    m0: [0x33, 0x16, 0x10], // deep glossy mahogany shadow
    m1: [0x59, 0x26, 0x19], // rich armored mahogany carapace
    m2: [0x85, 0x3d, 0x26], // warm chestnut-mahogany midtone
    m3: [0xb5, 0x62, 0x3f], // glossy polished carapace highlight
    m4: [0xe0, 0x9c, 0x72], // specular shine on armored dome
    W:  [0xff, 0xfb, 0xf2], // eye glint
  },
  abdRx: 0.20, abdRy: 0.165, abdRz: 0.21, abdY: 0.01, abdZ: -0.15,
  cephRx: 0.155, cephRy: 0.115, cephRz: 0.155,
  legThick: 0.048, legArchY: 0.08, legSpanX: 0.54, threatScale: 0.75,
  shade: (mat, shade) => {
    if (mat === 'eye') return 'W';
    return shade > 0.85 ? 'm4' : shade > 0.62 ? 'm3' : shade > 0.36 ? 'm2' : shade > 0.18 ? 'm1' : 'm0';
  },
};

const trapdoorSpiderCache = new Map<TrapdoorSpiderPoseName, Boar27Pack>();
 function buildTrapdoorSpiderPosePack(pose: TrapdoorSpiderPoseName): Boar27Pack {
  let pack = trapdoorSpiderCache.get(pose);
  if (!pack) {
    pack = buildSpiderPack(TRAPDOOR_SPIDER_SPEC, pose);
    trapdoorSpiderCache.set(pose, pack);
  }
  return pack;
}

export function getTrapdoorSpiderPosePack(...args: Parameters<typeof buildTrapdoorSpiderPosePack>): ReturnType<typeof buildTrapdoorSpiderPosePack> {
  return registerAnimalSpritePack(buildTrapdoorSpiderPosePack(...args), { module: './ArachnidsPack.ts', factory: 'getTrapdoorSpiderPosePack', args }, buildTrapdoorSpiderPosePack);
}

export class TrapdoorSpider extends BaseSpider {
  constructor(ctx: GameContext, pos: THREE.Vector3) {
    super(ctx, pos, TRAPDOOR_SPIDER_PW, TRAPDOOR_SPIDER_PH, TRAPDOOR_SPIDER_W, TRAPDOOR_SPIDER_H, 'TrapdoorSpiderBillboard', 30, 0.20, 1.55, 0.13, getTrapdoorSpiderPosePack);
  }
}

// ============================================================================
// 5. ARANHA-GOLIAS (Goliath Birdeater Giant Tarantula) — 42×28 @ 56 PPU
// ============================================================================
export const GOLIATH_SPIDER_PW = 42;
export const GOLIATH_SPIDER_PH = 28;
export const GOLIATH_SPIDER_W = GOLIATH_SPIDER_PW / ANIMAL_PPU;
export const GOLIATH_SPIDER_H = GOLIATH_SPIDER_PH / ANIMAL_PPU;

const GOLIATH_SPIDER_SPEC: SpiderSpec = {
  pw: GOLIATH_SPIDER_PW,
  ph: GOLIATH_SPIDER_PH,
  boxW: 1.38,
  boxH: 0.90,
  pal: {
    k:  [0x14, 0x0b, 0x08], // crisp 1px outline
    r0: [0x38, 0x1a, 0x10], // deep chestnut-russet shadow
    r1: [0x61, 0x2d, 0x18], // rich Goliath chestnut-russet fur
    r2: [0x8c, 0x45, 0x24], // warm russet-copper midtone
    r3: [0xb8, 0x67, 0x39], // sunlit copper-tan bristle highlight
    r4: [0xdb, 0x94, 0x63], // pale fuzzy leg-hair rim
    W:  [0xff, 0xfb, 0xf2], // eye glint
  },
  abdRx: 0.24, abdRy: 0.19, abdRz: 0.27, abdY: 0.03, abdZ: -0.19,
  cephRx: 0.17, cephRy: 0.12, cephRz: 0.175,
  legThick: 0.052, legArchY: 0.13, legSpanX: 0.72, threatScale: 0.95,
  shade: (mat, shade) => {
    if (mat === 'eye') return 'W';
    return shade > 0.84 ? 'r4' : shade > 0.62 ? 'r3' : shade > 0.38 ? 'r2' : shade > 0.18 ? 'r1' : 'r0';
  },
};

const goliathSpiderCache = new Map<GoliathSpiderPoseName, Boar27Pack>();
 function buildGoliathSpiderPosePack(pose: GoliathSpiderPoseName): Boar27Pack {
  let pack = goliathSpiderCache.get(pose);
  if (!pack) {
    pack = buildSpiderPack(GOLIATH_SPIDER_SPEC, pose);
    goliathSpiderCache.set(pose, pack);
  }
  return pack;
}

export function getGoliathSpiderPosePack(...args: Parameters<typeof buildGoliathSpiderPosePack>): ReturnType<typeof buildGoliathSpiderPosePack> {
  return registerAnimalSpritePack(buildGoliathSpiderPosePack(...args), { module: './ArachnidsPack.ts', factory: 'getGoliathSpiderPosePack', args }, buildGoliathSpiderPosePack);
}

export class GoliathSpider extends BaseSpider {
  constructor(ctx: GameContext, pos: THREE.Vector3) {
    super(ctx, pos, GOLIATH_SPIDER_PW, GOLIATH_SPIDER_PH, GOLIATH_SPIDER_W, GOLIATH_SPIDER_H, 'GoliathSpiderBillboard', 45, 0.28, 1.35, 0.16, getGoliathSpiderPosePack);
  }
}
