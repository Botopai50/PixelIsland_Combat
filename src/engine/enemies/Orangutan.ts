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
// ORANGOTANGO DE BORNÉU (Bornean Orangutan) — Flagship 60×58 @ ANIMAL_PPU
// ============================================================================
export type OrangutanPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'walk0' | 'walk1' | 'walk2' | 'walk3' | 'walk4' | 'walk5'
  | 'sit0' | 'sit1' | 'sit2'
  | 'reach0' | 'reach1' | 'reach2';

export const ORANGUTAN_PW = 60;
export const ORANGUTAN_PH = 58;
export const ORANGUTAN_W = ORANGUTAN_PW / ANIMAL_PPU;
export const ORANGUTAN_H = ORANGUTAN_PH / ANIMAL_PPU;

/** 5-tone lush shaggy burnt-orange/copper-rust fur + dark-leather cheek flanges/face/hands. */
const ORANGUTAN_PAL: Record<string, [number, number, number]> = {
  k:  [0x14, 0x10, 0x11], // crisp 1px outline / gentle dark eyes / nostrils
  o0: [0x54, 0x1d, 0x0c], // deep copper-mahogany fur shadow
  o1: [0x82, 0x31, 0x12], // burnt-rust mid-shadow
  o2: [0xb4, 0x4b, 0x1a], // rich burnt-orange midtone
  o3: [0xdc, 0x6b, 0x28], // vibrant copper-orange highlight
  o4: [0xf4, 0x92, 0x48], // sunlit shaggy copper rim highlight
  f0: [0x1c, 0x19, 0x1e], // dark-charcoal cheek flanges / face / hands shadow
  f1: [0x30, 0x2b, 0x33], // dark-leather flange / muzzle midtone
  f2: [0x4a, 0x43, 0x4e], // flange / brow highlight
  W:  [0xfc, 0xfb, 0xf6], // crisp white eye glint
};

interface OrangutanPose {
  mode: 'walk' | 'sit' | 'reach';
  bodyY: number;
  headY: number;
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
  reachLift?: number;
}

const ORANGUTAN_POSES: Record<OrangutanPoseName, OrangutanPose> = {
  idle0: {
    mode: 'walk', bodyY: 0.0, headY: 0.0, headSway: 0.0, headPitch: 0.0,
    fl: 0, fr: 0, bl: 0, br: 0, flLift: 0, frLift: 0, blLift: 0, brLift: 0,
  },
  idle1: {
    mode: 'walk', bodyY: 0.012, headY: 0.018, headSway: 0.035, headPitch: -0.04,
    fl: 0, fr: 0, bl: 0, br: 0, flLift: 0, frLift: 0, blLift: 0, brLift: 0,
  },
  idle2: {
    mode: 'walk', bodyY: -0.010, headY: -0.014, headSway: -0.035, headPitch: 0.04,
    fl: 0, fr: 0, bl: 0, br: 0, flLift: 0, frLift: 0, blLift: 0, brLift: 0,
  },

  // 6-frame slow dignified fist-walking gait
  walk0: {
    mode: 'walk', bodyY: 0.012, headY: 0.0, headSway: 0.02, headPitch: 0.02,
    fl: 0.18, fr: -0.14, bl: -0.14, br: 0.14, flLift: 0.09, frLift: 0.0, blLift: 0.0, brLift: 0.07,
  },
  walk1: {
    mode: 'walk', bodyY: 0.020, headY: 0.01, headSway: 0.01, headPitch: 0.03,
    fl: 0.09, fr: -0.04, bl: -0.06, br: 0.07, flLift: 0.04, frLift: 0.05, blLift: 0.05, brLift: 0.03,
  },
  walk2: {
    mode: 'walk', bodyY: -0.008, headY: -0.005, headSway: -0.01, headPitch: 0.01,
    fl: -0.04, fr: 0.09, bl: 0.06, br: -0.05, flLift: 0.0, frLift: 0.09, blLift: 0.07, brLift: 0.0,
  },
  walk3: {
    mode: 'walk', bodyY: 0.012, headY: 0.0, headSway: -0.02, headPitch: 0.02,
    fl: -0.14, fr: 0.18, bl: 0.14, br: -0.14, flLift: 0.0, frLift: 0.09, blLift: 0.07, brLift: 0.0,
  },
  walk4: {
    mode: 'walk', bodyY: 0.020, headY: 0.01, headSway: -0.01, headPitch: 0.03,
    fl: -0.04, fr: 0.09, bl: 0.07, br: -0.06, flLift: 0.05, frLift: 0.04, blLift: 0.03, brLift: 0.05,
  },
  walk5: {
    mode: 'walk', bodyY: -0.008, headY: -0.005, headSway: 0.01, headPitch: 0.01,
    fl: 0.09, fr: -0.04, bl: -0.05, br: 0.06, flLift: 0.09, frLift: 0.0, blLift: 0.0, brLift: 0.07,
  },

  // 3-frame wise seated posture
  sit0: {
    mode: 'sit', bodyY: 0.0, headY: 0.0, headSway: 0.0, headPitch: 0.04,
    fl: 0, fr: 0, bl: 0, br: 0, flLift: 0, frLift: 0, blLift: 0, brLift: 0,
  },
  sit1: {
    mode: 'sit', bodyY: 0.01, headY: 0.015, headSway: 0.035, headPitch: -0.03,
    fl: 0, fr: 0, bl: 0, br: 0, flLift: 0, frLift: 0, blLift: 0, brLift: 0,
  },
  sit2: {
    mode: 'sit', bodyY: -0.008, headY: -0.01, headSway: -0.035, headPitch: 0.06,
    fl: 0, fr: 0, bl: 0, br: 0, flLift: 0, frLift: 0, blLift: 0, brLift: 0,
  },

  // 3-frame stretching one enormously long arm upward!
  reach0: {
    mode: 'reach', bodyY: 0.0, headY: 0.02, headSway: 0.0, headPitch: -0.14,
    fl: 0, fr: 0, bl: 0, br: 0, flLift: 0, frLift: 0, blLift: 0, brLift: 0, reachLift: 0.55,
  },
  reach1: {
    mode: 'reach', bodyY: 0.02, headY: 0.04, headSway: 0.02, headPitch: -0.24,
    fl: 0, fr: 0, bl: 0, br: 0, flLift: 0, frLift: 0, blLift: 0, brLift: 0, reachLift: 1.0,
  },
  reach2: {
    mode: 'reach', bodyY: 0.01, headY: 0.03, headSway: -0.02, headPitch: -0.18,
    fl: 0, fr: 0, bl: 0, br: 0, flLift: 0, frLift: 0, blLift: 0, brLift: 0, reachLift: 0.78,
  },
};

const orangutanCache = new Map<OrangutanPoseName, Boar27Pack>();

 function buildOrangutanPosePack(pose: OrangutanPoseName): Boar27Pack {
  let pack = orangutanCache.get(pose);
  if (!pack) {
    const P = ORANGUTAN_POSES[pose];
    const by = P.bodyY;

    // Unmistakable flanged male orangutan head in local pitched coordinates
    const evalHead = (lx: number, ly: number, lz: number) => {
      const cranium = sdEllipsoid(lx, ly, lz, 0, 0.04, -0.01, 0.145, 0.155, 0.145);
      // Wide flat dark-charcoal cheek pads (flanges) framing the face!
      const flangeL = sdEllipsoid(lx, ly, lz, -0.145, 0.01, 0.065, 0.072, 0.135, 0.048);
      const flangeR = sdEllipsoid(lx, ly, lz,  0.145, 0.01, 0.065, 0.072, 0.135, 0.048);
      const faceCore = sdEllipsoid(lx, ly, lz, 0, 0.01, 0.095, 0.115, 0.125, 0.085);
      // Prominent rounded muzzle
      const muzzle = sdEllipsoid(lx, ly, lz, 0, -0.055, 0.155, 0.092, 0.078, 0.085);
      // Long shaggy burnt-orange chin beard!
      const beard = sdCapsule(lx, ly, lz, 0, -0.10, 0.11, 0, -0.22, 0.13, 0.082, 0.045);

      const headFur = smin(cranium, beard, 0.04);
      const headLeather = smin(smin(faceCore, muzzle, 0.035), Math.min(flangeL, flangeR), 0.03);

      // Close-set gentle dark eyes + crisp white glint
      const eyeL = sdEllipsoid(lx, ly, lz, -0.042, 0.038, 0.165, 0.020, 0.020, 0.018);
      const eyeR = sdEllipsoid(lx, ly, lz,  0.042, 0.038, 0.165, 0.020, 0.020, 0.018);
      const eyes = Math.min(eyeL, eyeR);

      const glintL = sdEllipsoid(lx, ly, lz, -0.048, 0.045, 0.180, 0.009, 0.009, 0.009);
      const glintR = sdEllipsoid(lx, ly, lz,  0.048, 0.045, 0.180, 0.009, 0.009, 0.009);
      const glints = Math.min(glintL, glintR);

      return { headFur, headLeather, eyes, glints };
    };

    const evalFn: SdfEvaluator = (x, y, z) => {
      if (P.mode === 'sit' || P.mode === 'reach') {
        const rl = P.reachLift ?? 0;
        // Wise seated posture with rounded belly, broad draped shoulders, shorter curved hind legs
        const belly = sdEllipsoid(x, y, z, 0, -0.18 + by, 0.02, 0.30, 0.27, 0.28);
        const shoulders = sdEllipsoid(x, y, z, 0, 0.12 + by, -0.02, 0.30, 0.20, 0.22);
        // Shaggy shoulder mantle hair draping down
        const drapeL = sdCapsule(x, y, z, -0.26, 0.14 + by, -0.02, -0.32, -0.18 + by, -0.02, 0.11, 0.08);
        const drapeR = sdCapsule(x, y, z,  0.26, 0.14 + by, -0.02,  0.32, -0.18 + by, -0.02, 0.11, 0.08);

        const hy = 0.34 + by + P.headY;
        const hz = 0.06;
        const cosP = Math.cos(P.headPitch);
        const sinP = Math.sin(P.headPitch);
        const dx = x - P.headSway;
        const dy = y - hy;
        const dz = z - hz;
        const lx = dx;
        const ly = dy * cosP + dz * sinP;
        const lz = -dy * sinP + dz * cosP;
        const H = evalHead(lx, ly, lz);

        // Enormous extra-long arms (left rests on knee/ground, right stretches high in reach!)
        const armL = sdCapsule(x, y, z, -0.26, 0.12 + by, 0.0, -0.32, -0.44, 0.22, 0.105, 0.075);
        const handL = sdEllipsoid(x, y, z, -0.32, -0.46, 0.26, 0.072, 0.045, 0.088);

        const rTipY = P.mode === 'reach' ? 0.16 + rl * 0.56 : -0.44;
        const rTipX = P.mode === 'reach' ? 0.34 - rl * 0.10 : 0.32;
        const rTipZ = P.mode === 'reach' ? 0.16 + rl * 0.14 : 0.22;
        const armR = sdCapsule(x, y, z, 0.26, 0.12 + by, 0.0, rTipX, rTipY, rTipZ, 0.105, 0.072);
        const handR = sdEllipsoid(x, y, z, rTipX, rTipY + (P.mode === 'reach' ? 0.04 : -0.02), rTipZ + 0.02, 0.072, 0.055, 0.078);

        // Shorter curved hind legs tucked forward
        const legL = sdCapsule(x, y, z, -0.20, -0.32 + by, 0.04, -0.22, -0.46, 0.28, 0.105, 0.075);
        const legR = sdCapsule(x, y, z,  0.20, -0.32 + by, 0.04,  0.22, -0.46, 0.28, 0.105, 0.075);
        const footL = sdEllipsoid(x, y, z, -0.22, -0.48, 0.33, 0.075, 0.042, 0.095);
        const footR = sdEllipsoid(x, y, z,  0.22, -0.48, 0.33, 0.075, 0.042, 0.095);

        let fur = smin(belly, shoulders, 0.09);
        fur = smin(fur, Math.min(drapeL, drapeR), 0.06);
        fur = smin(fur, H.headFur, 0.06);
        fur = smin(fur, Math.min(armL, armR), 0.05);
        fur = smin(fur, Math.min(legL, legR), 0.05);

        const leather = Math.min(H.headLeather, Math.min(Math.min(handL, handR), Math.min(footL, footR)));

        let d = smin(fur, leather, 0.03);
        let mat = leather < fur + 0.01 ? 'leather' : 'fur';
        if (H.eyes < d) { d = H.eyes; mat = 'eye'; }
        if (H.glints < d) { d = H.glints; mat = 'glint'; }
        return { d, mat };
      }

      // Dignified fist-walking stance: broad shaggy shoulders, rounded belly, enormous extra-long arms, NO tail
      const shoulders = sdEllipsoid(x, y, z, 0, 0.16 + by, 0.16, 0.30, 0.23, 0.25);
      const belly = sdEllipsoid(x, y, z, 0, 0.02 + by, -0.08, 0.29, 0.26, 0.29);
      const hips = sdEllipsoid(x, y, z, 0, -0.08 + by, -0.30, 0.24, 0.20, 0.21);

      const hy = 0.27 + by + P.headY;
      const hz = 0.40;
      const cosP = Math.cos(P.headPitch);
      const sinP = Math.sin(P.headPitch);
      const dx = x - P.headSway;
      const dy = y - hy;
      const dz = z - hz;
      const lx = dx;
      const ly = dy * cosP + dz * sinP;
      const lz = -dy * sinP + dz * cosP;
      const H = evalHead(lx, ly, lz);

      // Enormous extra-long shaggy arms reaching all the way down to fists
      const armL = sdCapsule(x, y, z, -0.27, 0.14 + by, 0.20, -0.27, -0.52 + P.flLift, 0.26 + P.fl, 0.115, 0.082);
      const armR = sdCapsule(x, y, z,  0.27, 0.14 + by, 0.20,  0.27, -0.52 + P.frLift, 0.26 + P.fr, 0.115, 0.082);
      const fistL = sdEllipsoid(x, y, z, -0.27, -0.53 + P.flLift, 0.28 + P.fl, 0.082, 0.052, 0.088);
      const fistR = sdEllipsoid(x, y, z,  0.27, -0.53 + P.frLift, 0.28 + P.fr, 0.082, 0.052, 0.088);

      // Shorter curved hind legs
      const legL = sdCapsule(x, y, z, -0.20, -0.12 + by, -0.28, -0.20, -0.52 + P.blLift, -0.26 + P.bl, 0.108, 0.076);
      const legR = sdCapsule(x, y, z,  0.20, -0.12 + by, -0.28,  0.20, -0.52 + P.brLift, -0.26 + P.br, 0.108, 0.076);
      const footL = sdEllipsoid(x, y, z, -0.20, -0.53 + P.blLift, -0.20 + P.bl, 0.078, 0.044, 0.102);
      const footR = sdEllipsoid(x, y, z,  0.20, -0.53 + P.brLift, -0.20 + P.br, 0.078, 0.044, 0.102);

      let fur = smin(smin(shoulders, belly, 0.10), hips, 0.09);
      fur = smin(fur, H.headFur, 0.065);
      fur = smin(fur, Math.min(armL, armR), 0.055);
      fur = smin(fur, Math.min(legL, legR), 0.045);

      const leather = Math.min(H.headLeather, Math.min(Math.min(fistL, fistR), Math.min(footL, footR)));

      let d = smin(fur, leather, 0.03);
      let mat = leather < fur + 0.01 ? 'leather' : 'fur';
      if (H.eyes < d) { d = H.eyes; mat = 'eye'; }
      if (H.glints < d) { d = H.glints; mat = 'glint'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'glint') return 'W';
      if (mat === 'eye') return 'k';
      if (mat === 'leather') {
        return shade > 0.65 ? 'f2' : shade > 0.32 ? 'f1' : 'f0';
      }
      // Long vertical shaggy copper-rust hair strands
      const strand = Math.sin(x * 28 + z * 24) * 0.065 + Math.cos(y * 14) * 0.03;
      const s = shade + strand;
      return s > 0.80 ? 'o4' : s > 0.58 ? 'o3' : s > 0.36 ? 'o2' : s > 0.18 ? 'o1' : 'o0';
    };

    pack = build27Pack(ORANGUTAN_PW, ORANGUTAN_PH, 1.08, 1.06, ORANGUTAN_PAL, evalFn, shadeFn);
    orangutanCache.set(pose, pack);
  }
  return pack;
}

export function getOrangutanPosePack(...args: Parameters<typeof buildOrangutanPosePack>): ReturnType<typeof buildOrangutanPosePack> {
  return registerAnimalSpritePack(buildOrangutanPosePack(...args), { module: './Orangutan.ts', factory: 'getOrangutanPosePack', args }, buildOrangutanPosePack);
}

// ============================================================================
// INSTÂNCIA NA ARENA (Orangutan)
// ============================================================================
const ORA_IDLE: readonly OrangutanPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const ORA_WALK: readonly OrangutanPoseName[] = ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'];
const ORA_SIT: readonly OrangutanPoseName[] = ['sit0', 'sit1', 'sit0', 'sit2'];
const ORA_REACH: readonly OrangutanPoseName[] = ['reach0', 'reach1', 'reach2', 'reach1'];

function pickCycle<T>(frames: readonly T[], idx: number): T {
  return sampleAnimalCycle(frames, idx);
}

export class Orangutan extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private readonly home = new THREE.Vector3();
  private state: 'idle' | 'walk' | 'sit' | 'reach' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.8, 3.4);
  private targetYaw = rand(0, Math.PI * 2);
  private gaitPhase = rand(0, Math.PI * 2);

  private readonly centerY = 0.48;

  constructor(ctx: GameContext, startPos: THREE.Vector3) {
    super(ctx, getOrangutanPosePack('idle0').getView(2, 0)!, ORANGUTAN_PW, ORANGUTAN_PH, ORANGUTAN_W, ORANGUTAN_H, 'OrangutanBillboard');
    this.hp = 95;
    this.maxHp = 95;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.48;
    this.motor.height = 1.04;
    this.motor.teleport(startPos);
    this.home.copy(startPos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.54, tag: 'body', enabled: true });
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
    this.vel.x += hit.dir.x * 3.0;
    this.vel.z += hit.dir.z * 3.0;
    this.vel.y = 2.4;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.state = 'walk';
      this.stateT = 0;
      this.stateDur = 2.2;
      this.targetYaw = Math.atan2(hit.dir.x, hit.dir.z);
    }
    return res;
  }

  update(dt: number, _target: EnemyTarget | null, camera: THREE.Camera, drawingBufferSize?: THREE.Vector2) {
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
        let speed = 0;

        if (this.state === 'idle') {
          if (this.stateT >= this.stateDur) {
            const r = Math.random();
            this.state = r < 0.38 ? 'sit' : r < 0.62 ? 'reach' : 'walk';
            this.stateT = 0;
            this.stateDur = this.state === 'sit' ? rand(3.0, 5.0) : this.state === 'reach' ? rand(1.8, 2.8) : rand(2.2, 3.8);
            const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
            this.targetYaw = toHome > 8.0
              ? Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.5, 0.5)
              : this.facing + rand(-1.5, 1.5);
          }
        } else if (this.state === 'sit' || this.state === 'reach') {
          if (this.stateT >= this.stateDur) {
            this.state = 'walk';
            this.stateT = 0;
            this.stateDur = rand(2.0, 3.6);
          }
        } else if (this.state === 'walk') {
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 4.5);
          speed = 1.65;
          if (this.stateT >= this.stateDur && this.motor.grounded) {
            this.state = Math.random() < 0.55 ? 'sit' : 'idle';
            this.stateT = 0;
            this.stateDur = this.state === 'sit' ? rand(2.8, 4.8) : rand(1.6, 2.8);
          }
        }

        this.vel.x = damp(this.vel.x, Math.sin(this.facing) * speed, 8, dt);
        this.vel.z = damp(this.vel.z, Math.cos(this.facing) * speed, 8, dt);
        this.vel.y -= 20 * dt;
        this.motor.update(dt);

        const horiz = Math.hypot(this.vel.x, this.vel.z);
        if (horiz > 0.2 && this.motor.grounded) {
          this.gaitPhase += dt * 4.6 * (0.65 + horiz * 0.25);
        }
      }
      this.syncHurtbox();
    }

    const horiz = Math.hypot(this.vel.x, this.vel.z);
    const bob = this.alive && this.motor.grounded && horiz > 0.2 && this.state === 'walk'
      ? Math.abs(Math.sin(this.gaitPhase)) * 0.025
      : 0;

    let pose: OrangutanPoseName;
    if (!this.alive) pose = 'idle0';
    else if (this.state === 'reach') pose = pickCycle(ORA_REACH, this.stateT * 2.2);
    else if (this.state === 'sit') pose = pickCycle(ORA_SIT, this.stateT * 1.8);
    else if (this.state === 'walk') pose = pickCycle(ORA_WALK, (this.gaitPhase / Math.PI) * 2.4);
    else pose = pickCycle(ORA_IDLE, this.stateT * 1.8);

    const deathSink = this.alive ? 0 : Math.min(0.26, this.deadT * 0.45);
    this.renderBillboard(getOrangutanPosePack(pose), this.position.y + this.centerY + bob - deathSink, camera, drawingBufferSize);
  }
}
