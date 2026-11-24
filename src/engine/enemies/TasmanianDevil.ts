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
// DIABO-DA-TASMÂNIA (Tasmanian Devil) — 38×28 @ 56 PPU (0.68m × 0.50m)
// ============================================================================
export type TasmanianDevilPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'walk0' | 'walk1' | 'walk2' | 'walk3' | 'walk4' | 'walk5'
  | 'snarl0' | 'snarl1' | 'snarl2'
  | 'lunge0' | 'lunge1' | 'lunge2' | 'lunge3';

export const TASMANIAN_DEVIL_PW = 38;
export const TASMANIAN_DEVIL_PH = 28;
export const TASMANIAN_DEVIL_W = TASMANIAN_DEVIL_PW / ANIMAL_PPU;
export const TASMANIAN_DEVIL_H = TASMANIAN_DEVIL_PH / ANIMAL_PPU;

const DEVIL_PAL: Record<string, [number, number, number]> = {
  k:  [0x0c, 0x0c, 0x10], // crisp 1px dark outline / glossy eye
  b0: [0x18, 0x18, 0x22], // deep charcoal-black shadow
  b1: [0x28, 0x2a, 0x38], // glossy charcoal-black base
  b2: [0x3e, 0x42, 0x54], // cool dark-slate muscle midtone
  b3: [0x59, 0x60, 0x76], // sleek slate highlight
  b4: [0x78, 0x82, 0x9c], // crisp top rim sheen
  p0: [0xb8, 0x44, 0x56], // pinkish-red ear / nose shadow
  p1: [0xe8, 0x6b, 0x7d], // bright pinkish-red ears & nose
  m:  [0x9e, 0x24, 0x38], // wide pink/crimson mouth interior
  W:  [0xf6, 0xf4, 0xee], // crisp white chest crescent, rump mark, fangs & eye glint
};

interface TasmanianDevilPose {
  bodyY: number;
  headY: number;
  headZ: number;
  headPitch: number;
  jawOpen: number;
  flSwing: number;
  flLift: number;
  frSwing: number;
  frLift: number;
  blSwing: number;
  blLift: number;
  brSwing: number;
  brLift: number;
  tailLift: number;
  tailSway: number;
}

const DEVIL_POSES: Record<TasmanianDevilPoseName, TasmanianDevilPose> = {
  idle0: {
    bodyY: 0.0, headY: 0.0, headZ: 0.0, headPitch: 0.02, jawOpen: 0.0,
    flSwing: 0.02, flLift: 0.0, frSwing: -0.02, frLift: 0.0,
    blSwing: -0.02, blLift: 0.0, brSwing: 0.02, brLift: 0.0,
    tailLift: -0.04, tailSway: 0.04,
  },
  idle1: {
    bodyY: 0.014, headY: 0.018, headZ: 0.01, headPitch: 0.06, jawOpen: 0.0,
    flSwing: 0.02, flLift: 0.0, frSwing: -0.02, frLift: 0.0,
    blSwing: -0.02, blLift: 0.0, brSwing: 0.02, brLift: 0.0,
    tailLift: 0.0, tailSway: 0.10,
  },
  idle2: {
    bodyY: -0.01, headY: -0.01, headZ: 0.015, headPitch: -0.03, jawOpen: 0.08,
    flSwing: 0.02, flLift: 0.0, frSwing: -0.02, frLift: 0.0,
    blSwing: -0.02, blLift: 0.0, brSwing: 0.02, brLift: 0.0,
    tailLift: -0.06, tailSway: -0.10,
  },

  // 6-frame sturdy prowling marsupial trot
  walk0: {
    bodyY: 0.0, headY: -0.01, headZ: 0.03, headPitch: -0.03, jawOpen: 0.0,
    flSwing: 0.22, flLift: 0.14, frSwing: -0.18, frLift: 0.0,
    blSwing: -0.18, blLift: 0.0, brSwing: 0.20, brLift: 0.12,
    tailLift: -0.02, tailSway: 0.06,
  },
  walk1: {
    bodyY: 0.02, headY: 0.0, headZ: 0.04, headPitch: -0.02, jawOpen: 0.0,
    flSwing: 0.10, flLift: 0.04, frSwing: -0.06, frLift: 0.08,
    blSwing: -0.06, blLift: 0.08, brSwing: 0.10, brLift: 0.04,
    tailLift: 0.0, tailSway: 0.02,
  },
  walk2: {
    bodyY: -0.015, headY: -0.02, headZ: 0.03, headPitch: -0.04, jawOpen: 0.0,
    flSwing: -0.05, flLift: 0.0, frSwing: 0.10, frLift: 0.15,
    blSwing: 0.08, blLift: 0.14, brSwing: -0.05, brLift: 0.0,
    tailLift: -0.04, tailSway: -0.04,
  },
  walk3: {
    bodyY: 0.0, headY: -0.01, headZ: 0.03, headPitch: -0.03, jawOpen: 0.0,
    flSwing: -0.18, flLift: 0.0, frSwing: 0.22, frLift: 0.14,
    blSwing: 0.20, blLift: 0.12, brSwing: -0.18, brLift: 0.0,
    tailLift: -0.02, tailSway: -0.06,
  },
  walk4: {
    bodyY: 0.02, headY: 0.0, headZ: 0.04, headPitch: -0.02, jawOpen: 0.0,
    flSwing: -0.06, flLift: 0.08, frSwing: 0.10, frLift: 0.04,
    blSwing: 0.10, blLift: 0.04, brSwing: -0.06, brLift: 0.08,
    tailLift: 0.0, tailSway: -0.02,
  },
  walk5: {
    bodyY: -0.015, headY: -0.02, headZ: 0.03, headPitch: -0.04, jawOpen: 0.0,
    flSwing: 0.10, flLift: 0.15, frSwing: -0.05, frLift: 0.0,
    blSwing: -0.05, blLift: 0.0, brSwing: 0.08, brLift: 0.14,
    tailLift: -0.04, tailSway: 0.04,
  },

  // 3-frame fierce jaw-wide threat display
  snarl0: {
    bodyY: -0.03, headY: 0.01, headZ: 0.04, headPitch: 0.08, jawOpen: 0.55,
    flSwing: 0.08, flLift: 0.0, frSwing: 0.06, frLift: 0.0,
    blSwing: -0.04, blLift: 0.0, brSwing: -0.04, brLift: 0.0,
    tailLift: 0.04, tailSway: 0.08,
  },
  snarl1: {
    bodyY: -0.04, headY: 0.03, headZ: 0.06, headPitch: 0.16, jawOpen: 1.0,
    flSwing: 0.12, flLift: 0.02, frSwing: 0.10, frLift: 0.02,
    blSwing: -0.06, blLift: 0.0, brSwing: -0.06, brLift: 0.0,
    tailLift: 0.08, tailSway: -0.08,
  },
  snarl2: {
    bodyY: -0.035, headY: 0.02, headZ: 0.05, headPitch: 0.12, jawOpen: 0.88,
    flSwing: 0.10, flLift: 0.0, frSwing: 0.08, frLift: 0.0,
    blSwing: -0.05, blLift: 0.0, brSwing: -0.05, brLift: 0.0,
    tailLift: 0.06, tailSway: 0.06,
  },

  // 4-frame ferocious bite lunge
  lunge0: {
    bodyY: -0.08, headY: -0.06, headZ: 0.05, headPitch: -0.06, jawOpen: 0.55,
    flSwing: 0.12, flLift: 0.0, frSwing: 0.08, frLift: 0.0,
    blSwing: 0.12, blLift: 0.0, brSwing: 0.10, brLift: 0.0,
    tailLift: 0.06, tailSway: 0.10,
  },
  lunge1: {
    bodyY: 0.04, headY: 0.0, headZ: 0.10, headPitch: 0.02, jawOpen: 0.95,
    flSwing: 0.34, flLift: 0.36, frSwing: 0.28, frLift: 0.30,
    blSwing: -0.26, blLift: 0.18, brSwing: -0.22, brLift: 0.14,
    tailLift: 0.16, tailSway: 0.0,
  },
  lunge2: {
    bodyY: 0.03, headY: -0.02, headZ: 0.12, headPitch: -0.04, jawOpen: 1.0,
    flSwing: 0.38, flLift: 0.40, frSwing: 0.32, frLift: 0.34,
    blSwing: -0.30, blLift: 0.24, brSwing: -0.26, brLift: 0.18,
    tailLift: 0.20, tailSway: 0.0,
  },
  lunge3: {
    bodyY: -0.04, headY: -0.04, headZ: 0.06, headPitch: -0.06, jawOpen: 0.40,
    flSwing: 0.20, flLift: 0.04, frSwing: 0.16, frLift: 0.02,
    blSwing: -0.10, blLift: 0.12, brSwing: -0.06, brLift: 0.08,
    tailLift: 0.10, tailSway: -0.06,
  },
};

const devilCache = new Map<TasmanianDevilPoseName, Boar27Pack>();
 function buildTasmanianDevilPosePack(pose: TasmanianDevilPoseName): Boar27Pack {
  let pack = devilCache.get(pose);
  if (!pack) {
    const P = DEVIL_POSES[pose];
    const by = P.bodyY;
    const hPivotY = 0.08 + by + P.headY;
    const hPivotZ = 0.34 + P.headZ;
    const cosP = Math.cos(P.headPitch);
    const sinP = Math.sin(P.headPitch);
    const jawDrop = P.jawOpen * 0.14;
    const jawBack = P.jawOpen * 0.03;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // 1. Stocky, muscular low-slung marsupial build: heavy forequarters, shorter hindquarters
      const chest = sdEllipsoid(x, y, z, 0, 0.01 + by, 0.14, 0.235, 0.215, 0.245);
      const shoulders = sdEllipsoid(x, y, z, 0, 0.10 + by, 0.14, 0.205, 0.155, 0.195);
      const mid = sdEllipsoid(x, y, z, 0, 0.0 + by, -0.08, 0.215, 0.195, 0.22);
      const rump = sdEllipsoid(x, y, z, 0, -0.02 + by, -0.28, 0.185, 0.175, 0.195);

      let fur = smin(chest, shoulders, 0.08);
      fur = smin(fur, mid, 0.10);
      fur = smin(fur, rump, 0.09);

      // 2. Oversized broad head & powerful bone-crushing jaws in local pitch-rotated space
      const dy = y - hPivotY;
      const dz = z - hPivotZ;
      const lx = x;
      const lz = dz * cosP + dy * sinP;
      const ly = -dz * sinP + dy * cosP;

      const skull = sdEllipsoid(lx, ly, lz, 0, 0.02, 0.02, 0.175, 0.152, 0.175);
      const cheekL = sdEllipsoid(lx, ly, lz, -0.155, -0.02, 0.01, 0.105, 0.095, 0.105);
      const cheekR = sdEllipsoid(lx, ly, lz,  0.155, -0.02, 0.01, 0.105, 0.095, 0.105);
      const snout = sdCapsule(lx, ly, lz, 0, 0.005, 0.10, 0, -0.012, 0.265, 0.095, 0.062);
      const lowerJaw = sdCapsule(lx, ly, lz, 0, -0.055, 0.08, 0, -0.062 - jawDrop, 0.245 - jawBack, 0.074, 0.044);

      let headD = smin(skull, Math.min(cheekL, cheekR), 0.05);
      headD = smin(headD, snout, 0.04);
      headD = smin(headD, lowerJaw, P.jawOpen > 0.2 ? 0.018 : 0.038);
      fur = smin(fur, headD, 0.06);

      // Pinkish-red rounded ears
      const earL = sdEllipsoid(lx, ly, lz, -0.145, 0.135, -0.025, 0.056, 0.062, 0.036);
      const earR = sdEllipsoid(lx, ly, lz,  0.145, 0.135, -0.025, 0.056, 0.062, 0.036);
      const ears = Math.min(earL, earR);

      // 3. Four sturdy low-slung muscular legs
      const leg = (sx: number, baseZ: number, swing: number, lift: number) => {
        const topY = -0.06 + by;
        const midY = -0.22 + by * 0.45 + lift * 0.18;
        const midZ = baseZ + swing * 0.42;
        const pawY = -0.38 + lift * 0.28;
        const pawZ = baseZ + swing * 0.88;
        const upper = sdCapsule(x, y, z, sx, topY, baseZ, sx, midY, midZ, 0.082, 0.058);
        const lower = sdCapsule(x, y, z, sx, midY, midZ, sx, pawY, pawZ, 0.054, 0.044);
        const paw = sdEllipsoid(x, y, z, sx, pawY - 0.01, pawZ + 0.038, 0.058, 0.034, 0.066);
        return smin(smin(upper, lower, 0.028), paw, 0.024);
      };
      const legs = Math.min(
        Math.min(leg(-0.165, 0.16, P.flSwing, P.flLift), leg(0.165, 0.16, P.frSwing, P.frLift)),
        Math.min(leg(-0.155, -0.26, P.blSwing, P.blLift), leg(0.155, -0.26, P.brSwing, P.brLift)),
      );
      fur = smin(fur, legs, 0.045);

      // 4. Thick tapering black tail
      const tMidX = P.tailSway * 0.45;
      const tMidY = -0.08 + by * 0.5 + P.tailLift * 0.45;
      const tMidZ = -0.58;
      const tTipX = P.tailSway;
      const tTipY = -0.10 + P.tailLift * 0.90;
      const tTipZ = -0.82;
      const tail1 = sdCapsule(x, y, z, 0, -0.03 + by, -0.40, tMidX, tMidY, tMidZ, 0.072, 0.054);
      const tail2 = sdCapsule(x, y, z, tMidX, tMidY, tMidZ, tTipX, tTipY, tTipZ, 0.052, 0.028);
      fur = smin(fur, smin(tail1, tail2, 0.03), 0.045);

      // 5. Bright dark eyes, pink nose, wide pink mouth & sharp white fangs
      const eyeL = sdEllipsoid(lx, ly, lz, -0.095, 0.048, 0.132, 0.030, 0.028, 0.030);
      const eyeR = sdEllipsoid(lx, ly, lz,  0.095, 0.048, 0.132, 0.030, 0.028, 0.030);
      const eyes = Math.min(eyeL, eyeR);
      const nose = sdEllipsoid(lx, ly, lz, 0, -0.008, 0.305, 0.042, 0.032, 0.032);

      let mouth = 99;
      let fangs = 99;
      if (P.jawOpen > 0.18) {
        mouth = sdEllipsoid(lx, ly, lz, 0, -0.046 - jawDrop * 0.42, 0.19, 0.068, 0.028 + jawDrop * 0.44, 0.082);
        const fL = sdCapsule(lx, ly, lz, -0.046, -0.036, 0.242, -0.046, -0.086, 0.242, 0.015, 0.006);
        const fR = sdCapsule(lx, ly, lz,  0.046, -0.036, 0.242,  0.046, -0.086, 0.242, 0.015, 0.006);
        fangs = Math.min(fL, fR);
      }

      let d = fur, mat = 'fur';
      if (ears < d) { d = ears; mat = 'ear'; }
      if (mouth < d) { d = mouth; mat = 'mouth'; }
      if (fangs < d) { d = fangs; mat = 'fang'; }
      if (eyes < d) { d = eyes; mat = 'eye'; }
      if (nose < d) { d = nose; mat = 'nose'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'ear' || mat === 'nose') return shade > 0.42 ? 'p1' : 'p0';
      if (mat === 'mouth') return 'm';
      if (mat === 'fang') return 'W';
      if (mat === 'eye') {
        const dy = y - hPivotY;
        const dz = z - hPivotZ;
        const ly = -dz * sinP + dy * cosP;
        if (ly > 0.056 && Math.abs(x) > 0.088) return 'W';
        return 'k';
      }

      // Unmistakable crisp white crescent band across the chest!
      if (z > 0.18 && z < 0.34 && y < 0.02 + by && y > -0.14 + by && Math.abs(x) < 0.20) {
        return 'W';
      }
      // Small white rump marking
      if (z < -0.34 && z > -0.44 && y > -0.06 + by && y < 0.08 + by && Math.abs(x) < 0.11) {
        return 'W';
      }

      // Glossy charcoal-black coat with cool dark-slate muscle highlights
      if (shade > 0.84) return 'b4';
      return shade > 0.64 ? 'b3' : shade > 0.40 ? 'b2' : shade > 0.20 ? 'b1' : 'b0';
    };

    pack = build27Pack(TASMANIAN_DEVIL_PW, TASMANIAN_DEVIL_PH, 0.98, 0.72, DEVIL_PAL, evalFn, shadeFn);
    devilCache.set(pose, pack);
  }
  return pack;
}

export function getTasmanianDevilPosePack(...args: Parameters<typeof buildTasmanianDevilPosePack>): ReturnType<typeof buildTasmanianDevilPosePack> {
  return registerAnimalSpritePack(buildTasmanianDevilPosePack(...args), { module: './TasmanianDevil.ts', factory: 'getTasmanianDevilPosePack', args }, buildTasmanianDevilPosePack);
}

// ============================================================================
// INSTÂNCIA NA ARENA (TasmanianDevil)
// ============================================================================
const DEVIL_IDLE: readonly TasmanianDevilPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const DEVIL_WALK: readonly TasmanianDevilPoseName[] = ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'];
const DEVIL_SNARL: readonly TasmanianDevilPoseName[] = ['snarl0', 'snarl1', 'snarl2', 'snarl1'];
const DEVIL_LUNGE: readonly TasmanianDevilPoseName[] = ['lunge0', 'lunge1', 'lunge2', 'lunge3'];

/**
 * Tasmanian Devil: prowls sturdily, snarls fiercely with jaws wide, and lunges if provoked.
 */
export class TasmanianDevil extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private readonly home = new THREE.Vector3();
  private state: 'idle' | 'walk' | 'snarl' | 'lunge' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.4, 2.6);
  private targetYaw = rand(0, Math.PI * 2);
  private gaitPhase = rand(0, Math.PI * 2);
  private provoked = false;

  constructor(ctx: GameContext, pos: THREE.Vector3) {
    super(ctx, getTasmanianDevilPosePack('idle0').getView(2, 0)!, TASMANIAN_DEVIL_PW, TASMANIAN_DEVIL_PH, TASMANIAN_DEVIL_W, TASMANIAN_DEVIL_H, 'TasmanianDevilBillboard');
    this.hp = 50;
    this.maxHp = 50;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.30;
    this.motor.height = 0.50;
    this.motor.teleport(pos);
    this.home.copy(pos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.34, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.set(this.position.x, this.position.y + 0.24, this.position.z);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y + 0.12, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.36, this.position.z);
    this.hurtboxes[0].enabled = this.alive;
    this.stickRoot.position.set(this.position.x, this.position.y + 0.24, this.position.z);
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
    this.vel.y = 3.0;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.provoked = true;
      this.state = 'snarl';
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
        const aggroDist = this.provoked ? 5.5 : 2.8;
        if (dist < 1.8 && this.state !== 'lunge') {
          this.state = 'lunge';
          this.stateT = 0;
          this.stateDur = 0.9;
        } else if (dist < aggroDist && this.state === 'idle' && this.stateT > 0.5) {
          this.state = 'snarl';
          this.stateT = 0;
          this.stateDur = 1.2;
        }

        if (this.state === 'idle') {
          if (this.stateT >= this.stateDur) {
            this.state = 'walk';
            this.stateT = 0;
            this.stateDur = rand(1.8, 3.2);
            const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
            this.targetYaw = toHome > 7.5
              ? Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.5, 0.5)
              : this.facing + rand(-1.5, 1.5);
          }
        } else if (this.state === 'walk') {
          if (this.provoked && target && target.alive && dist < 6.0) {
            this.targetYaw = Math.atan2(target.position.x - this.position.x, target.position.z - this.position.z);
            speed = 3.4;
          } else {
            speed = 2.0;
          }
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 7);
          if (this.stateT >= this.stateDur) {
            this.provoked = false;
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.2, 2.2);
          }
        } else if (this.state === 'snarl') {
          if (target && target.alive) {
            const toPlayer = Math.atan2(target.position.x - this.position.x, target.position.z - this.position.z);
            this.facing += angleDiff(this.facing, toPlayer) * Math.min(1, dt * 9);
          }
          if (this.stateT >= this.stateDur) {
            this.state = this.provoked ? 'walk' : 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.4, 2.4);
          }
        } else if (this.state === 'lunge') {
          if (target && target.alive) {
            const toPlayer = Math.atan2(target.position.x - this.position.x, target.position.z - this.position.z);
            this.facing += angleDiff(this.facing, toPlayer) * Math.min(1, dt * 11);
          }
          speed = 4.2;
          if (this.stateT >= this.stateDur) {
            this.state = dist < aggroDist ? 'snarl' : 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.0, 1.8);
          }
        }

        this.vel.x = damp(this.vel.x, Math.sin(this.facing) * speed, 9, dt);
        this.vel.z = damp(this.vel.z, Math.cos(this.facing) * speed, 9, dt);
        this.vel.y -= 20 * dt;
        this.motor.update(dt);

        const horiz = Math.hypot(this.vel.x, this.vel.z);
        if (horiz > 0.2 && this.motor.grounded) {
          this.gaitPhase += dt * 7.2 * (0.65 + horiz * 0.22);
        }
      }
      this.syncHurtbox();
    }

    let pose: TasmanianDevilPoseName;
    if (!this.alive) pose = 'idle0';
    else if (this.state === 'lunge') pose = pickCycle(DEVIL_LUNGE, this.stateT * 5.2);
    else if (this.state === 'snarl') pose = pickCycle(DEVIL_SNARL, this.stateT * 4.0);
    else if (this.state === 'walk') pose = pickCycle(DEVIL_WALK, (this.gaitPhase / Math.PI) * 2.8);
    else pose = pickCycle(DEVIL_IDLE, this.stateT * 2.0);

    const bob = this.alive && this.motor.grounded && (this.state === 'walk' || this.state === 'lunge')
      ? Math.abs(Math.sin(this.gaitPhase)) * 0.025
      : 0;
    const deathSink = this.alive ? 0 : Math.min(0.15, this.deadT * 0.38);
    this.renderBillboard(getTasmanianDevilPosePack(pose), this.position.y + 0.24 + bob - deathSink, camera, drawingBufferSize);
  }
}
