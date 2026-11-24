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
// PORCO (Pig) — 46×36 @ ANIMAL_PPU (Flagship Rebuild)
// ============================================================================
export type PigPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'walk0' | 'walk1' | 'walk2' | 'walk3' | 'walk4' | 'walk5'
  | 'sniff0' | 'sniff1' | 'sniff2'
  | 'flee0' | 'flee1' | 'flee2' | 'flee3';

export const PIG_PW = 46;
export const PIG_PH = 36;
export const PIG_W = PIG_PW / ANIMAL_PPU;
export const PIG_H = PIG_PH / ANIMAL_PPU;

const PIG_PAL: Record<string, [number, number, number]> = {
  k:  [0x24, 0x15, 0x1a], // 1px outline / cloven hooves / nostrils / pupils
  p0: [0x9c, 0x4c, 0x5c], // deep rose-plum shadow
  p1: [0xc8, 0x6f, 0x7f], // mid-dark dusty rose
  p2: [0xe5, 0x91, 0x9f], // classic warm pig pink
  p3: [0xf7, 0xb4, 0xbe], // soft light pink
  p4: [0xff, 0xd8, 0xd4], // warm peach-pink highlight
  s0: [0xb8, 0x54, 0x68], // rosy snout / inner-ear shadow
  s1: [0xe2, 0x78, 0x8c], // rosy snout mid
  s2: [0xf8, 0x9e, 0xae], // rosy snout highlight
  m0: [0x6a, 0x49, 0x3b], // dark mud speckle (belly / lower trotters)
  m1: [0x8c, 0x64, 0x50], // warm mud-dusted shading
  w:  [0xff, 0xf8, 0xf4], // eye specular glint
};

interface PigPose {
  bodyY: number;
  headY: number;
  headZ: number;
  headPitch: number; // negative = nose down (sniffing), positive = chin up
  headSway: number;
  earFlop: number;   // positive = flopped forward, negative = pinned back
  tailWag: number;
  flSwing: number;
  flLift: number;
  frSwing: number;
  frLift: number;
  blSwing: number;
  blLift: number;
  brSwing: number;
  brLift: number;
}

const PIG_POSES: Record<PigPoseName, PigPose> = {
  // Gentle breathing & ear/tail twitch
  idle0: {
    bodyY: 0.0, headY: 0.0, headZ: 0.0, headPitch: -0.04, headSway: 0.0, earFlop: 0.0, tailWag: 0.0,
    flSwing: 0.0, flLift: 0.0, frSwing: 0.0, frLift: 0.0,
    blSwing: 0.0, blLift: 0.0, brSwing: 0.0, brLift: 0.0,
  },
  idle1: {
    bodyY: 0.014, headY: 0.016, headZ: 0.01, headPitch: 0.02, headSway: 0.025, earFlop: 0.04, tailWag: 0.07,
    flSwing: 0.0, flLift: 0.0, frSwing: 0.0, frLift: 0.0,
    blSwing: 0.0, blLift: 0.0, brSwing: 0.0, brLift: 0.0,
  },
  idle2: {
    bodyY: -0.012, headY: -0.014, headZ: 0.01, headPitch: -0.08, headSway: -0.025, earFlop: -0.03, tailWag: -0.07,
    flSwing: 0.0, flLift: 0.0, frSwing: 0.0, frLift: 0.0,
    blSwing: 0.0, blLift: 0.0, brSwing: 0.0, brLift: 0.0,
  },

  // 6-frame jaunty pig trot
  walk0: {
    bodyY: 0.014, headY: -0.01, headZ: 0.02, headPitch: -0.06, headSway: 0.015, earFlop: 0.05, tailWag: 0.08,
    flSwing: 0.16, flLift: 0.09, frSwing: -0.12, frLift: 0.0,
    blSwing: -0.14, blLift: 0.0, brSwing: 0.15, brLift: 0.08,
  },
  walk1: {
    bodyY: 0.026, headY: 0.0, headZ: 0.025, headPitch: -0.04, headSway: 0.0, earFlop: 0.02, tailWag: 0.04,
    flSwing: 0.08, flLift: 0.04, frSwing: -0.04, frLift: 0.05,
    blSwing: -0.06, blLift: 0.05, brSwing: 0.08, brLift: 0.03,
  },
  walk2: {
    bodyY: -0.01, headY: -0.018, headZ: 0.015, headPitch: -0.08, headSway: -0.015, earFlop: 0.07, tailWag: -0.04,
    flSwing: -0.04, flLift: 0.0, frSwing: 0.09, frLift: 0.09,
    blSwing: 0.07, blLift: 0.08, brSwing: -0.05, brLift: 0.0,
  },
  walk3: {
    bodyY: 0.014, headY: -0.01, headZ: 0.02, headPitch: -0.06, headSway: -0.015, earFlop: 0.05, tailWag: -0.08,
    flSwing: -0.12, flLift: 0.0, frSwing: 0.16, frLift: 0.09,
    blSwing: 0.15, blLift: 0.08, brSwing: -0.14, brLift: 0.0,
  },
  walk4: {
    bodyY: 0.026, headY: 0.0, headZ: 0.025, headPitch: -0.04, headSway: 0.0, earFlop: 0.02, tailWag: -0.04,
    flSwing: -0.04, flLift: 0.05, frSwing: 0.08, frLift: 0.04,
    blSwing: 0.08, blLift: 0.03, brSwing: -0.06, brLift: 0.05,
  },
  walk5: {
    bodyY: -0.01, headY: -0.018, headZ: 0.015, headPitch: -0.08, headSway: 0.015, earFlop: 0.07, tailWag: 0.04,
    flSwing: 0.09, flLift: 0.09, frSwing: -0.04, frLift: 0.0,
    blSwing: -0.05, blLift: 0.0, brSwing: 0.07, brLift: 0.08,
  },

  // 3-frame ground-rooting / snuffling
  sniff0: {
    bodyY: -0.018, headY: -0.11, headZ: 0.05, headPitch: -0.34, headSway: 0.0, earFlop: 0.12, tailWag: 0.05,
    flSwing: 0.05, flLift: 0.0, frSwing: -0.02, frLift: 0.0,
    blSwing: 0.0, blLift: 0.0, brSwing: 0.0, brLift: 0.0,
  },
  sniff1: {
    bodyY: -0.028, headY: -0.19, headZ: 0.08, headPitch: -0.56, headSway: -0.045, earFlop: 0.18, tailWag: 0.11,
    flSwing: 0.07, flLift: 0.0, frSwing: -0.03, frLift: 0.0,
    blSwing: 0.0, blLift: 0.0, brSwing: 0.0, brLift: 0.0,
  },
  sniff2: {
    bodyY: -0.026, headY: -0.18, headZ: 0.09, headPitch: -0.52, headSway: 0.045, earFlop: 0.16, tailWag: -0.11,
    flSwing: 0.07, flLift: 0.0, frSwing: -0.03, frLift: 0.0,
    blSwing: 0.0, blLift: 0.0, brSwing: 0.0, brLift: 0.0,
  },

  // 4-frame frantic fleeing scamper
  flee0: {
    bodyY: -0.02, headY: -0.02, headZ: 0.04, headPitch: 0.04, headSway: 0.0, earFlop: -0.14, tailWag: 0.10,
    flSwing: -0.12, flLift: 0.08, frSwing: -0.18, frLift: 0.04,
    blSwing: 0.20, blLift: 0.12, brSwing: 0.14, brLift: 0.06,
  },
  flee1: {
    bodyY: 0.045, headY: 0.02, headZ: 0.06, headPitch: 0.10, headSway: 0.02, earFlop: -0.18, tailWag: 0.0,
    flSwing: 0.24, flLift: 0.18, frSwing: 0.16, frLift: 0.14,
    blSwing: -0.22, blLift: 0.16, brSwing: -0.16, brLift: 0.12,
  },
  flee2: {
    bodyY: 0.02, headY: 0.0, headZ: 0.05, headPitch: 0.06, headSway: -0.02, earFlop: -0.16, tailWag: -0.10,
    flSwing: 0.18, flLift: 0.06, frSwing: 0.24, frLift: 0.14,
    blSwing: -0.14, blLift: 0.12, brSwing: -0.20, brLift: 0.16,
  },
  flee3: {
    bodyY: -0.025, headY: -0.03, headZ: 0.03, headPitch: 0.02, headSway: 0.0, earFlop: -0.12, tailWag: 0.04,
    flSwing: -0.16, flLift: 0.10, frSwing: -0.06, frLift: 0.04,
    blSwing: 0.16, blLift: 0.06, brSwing: 0.22, brLift: 0.12,
  },
};

const pigCache = new Map<PigPoseName, Boar27Pack>();

 function buildPigPosePack(pose: PigPoseName): Boar27Pack {
  let pack = pigCache.get(pose);
  if (!pack) {
    const P = PIG_POSES[pose];
    const by = P.bodyY;
    const hPivotX = P.headSway;
    const hPivotY = 0.07 + P.headY + by;
    const hPivotZ = 0.36 + P.headZ;
    const cosP = Math.cos(P.headPitch);
    const sinP = Math.sin(P.headPitch);

    const evalFn: SdfEvaluator = (x, y, z) => {
      // 1. Sculpted plump barrel torso: ribcage, shoulder hump, soft belly, chunky haunches
      const barrel = sdEllipsoid(x, y, z, 0, 0.01 + by, -0.02, 0.285, 0.235, 0.37);
      const shoulderHump = sdEllipsoid(x, y, z, 0, 0.13 + by, 0.14, 0.225, 0.155, 0.21);
      const softBelly = sdEllipsoid(x, y, z, 0, -0.095 + by, -0.01, 0.265, 0.165, 0.30);
      const rump = sdEllipsoid(x, y, z, 0, 0.02 + by, -0.29, 0.245, 0.215, 0.22);
      const hamL = sdEllipsoid(x, y, z, -0.145, -0.04 + by, -0.28, 0.135, 0.155, 0.16);
      const hamR = sdEllipsoid(x, y, z,  0.145, -0.04 + by, -0.28, 0.135, 0.155, 0.16);
      const neck = sdCapsule(x, y, z, 0, 0.06 + by, 0.22, hPivotX * 0.6, hPivotY, hPivotZ - 0.02, 0.20, 0.17);

      let skin = smin(barrel, shoulderHump, 0.08);
      skin = smin(skin, softBelly, 0.09);
      skin = smin(skin, rump, 0.10);
      skin = smin(skin, Math.min(hamL, hamR), 0.06);
      skin = smin(skin, neck, 0.08);

      // 2. Expressive Head in local pitched space (cranium, cheek jowls, floppy folded-forward ears)
      const lx = x - hPivotX;
      const dy = y - hPivotY;
      const dz = z - hPivotZ;
      const lz = dz * cosP + dy * sinP;
      const ly = -dz * sinP + dy * cosP;

      const cranium = sdEllipsoid(lx, ly, lz, 0, 0.02, 0.06, 0.175, 0.162, 0.185);
      const cheekL = sdEllipsoid(lx, ly, lz, -0.145, -0.045, 0.05, 0.105, 0.095, 0.115);
      const cheekR = sdEllipsoid(lx, ly, lz,  0.145, -0.045, 0.05, 0.105, 0.095, 0.115);
      const jaw = sdEllipsoid(lx, ly, lz, 0, -0.095, 0.11, 0.115, 0.068, 0.115);
      const snoutBridge = sdCapsule(lx, ly, lz, 0, -0.02, 0.14, 0, -0.032, 0.275, 0.115, 0.096);

      let headD = smin(cranium, Math.min(cheekL, cheekR), 0.055);
      headD = smin(headD, jaw, 0.045);
      headD = smin(headD, snoutBridge, 0.04);
      skin = smin(skin, headD, 0.06);

      // Floppy folded-forward ears (rise from crown, fold forward & slightly out over brow)
      const ef = P.earFlop;
      const earBaseL = sdCapsule(lx, ly, lz, -0.105, 0.125, 0.01, -0.175, 0.185 - ef * 0.05, 0.04 + ef * 0.08, 0.056, 0.044);
      const earTipL  = sdCapsule(lx, ly, lz, -0.175, 0.185 - ef * 0.05, 0.04 + ef * 0.08, -0.205, 0.095 - ef * 0.08, 0.155 + ef * 0.10, 0.046, 0.024);
      const earBaseR = sdCapsule(lx, ly, lz,  0.105, 0.125, 0.01,  0.175, 0.185 - ef * 0.05, 0.04 + ef * 0.08, 0.056, 0.044);
      const earTipR  = sdCapsule(lx, ly, lz,  0.175, 0.185 - ef * 0.05, 0.04 + ef * 0.08,  0.205, 0.095 - ef * 0.08, 0.155 + ef * 0.10, 0.046, 0.024);
      const ears = Math.min(smin(earBaseL, earTipL, 0.025), smin(earBaseR, earTipR, 0.025));
      skin = smin(skin, ears, 0.025);

      const earInL = sdCapsule(lx, ly, lz, -0.165, 0.155 - ef * 0.05, 0.075 + ef * 0.08, -0.190, 0.095 - ef * 0.08, 0.148 + ef * 0.10, 0.028, 0.015);
      const earInR = sdCapsule(lx, ly, lz,  0.165, 0.155 - ef * 0.05, 0.075 + ef * 0.08,  0.190, 0.095 - ef * 0.08, 0.148 + ef * 0.10, 0.028, 0.015);
      const earInner = Math.min(earInL, earInR);

      // 3. True 3D corkscrew curly tail (4-segment helix spiraling in X, Y, Z)
      const tw = P.tailWag;
      const t0x = 0,               t0y = 0.07 + by, t0z = -0.46;
      const t1x = tw * 0.4 + 0.05, t1y = 0.12 + by, t1z = -0.53;
      const t2x = tw * 0.8 + 0.01, t2y = 0.18 + by, t2z = -0.57;
      const t3x = tw * 1.0 - 0.05, t3y = 0.15 + by, t3z = -0.53;
      const t4x = tw * 1.1 - 0.02, t4y = 0.11 + by, t4z = -0.58;
      const tc1 = sdCapsule(x, y, z, t0x, t0y, t0z, t1x, t1y, t1z, 0.032, 0.026);
      const tc2 = sdCapsule(x, y, z, t1x, t1y, t1z, t2x, t2y, t2z, 0.026, 0.022);
      const tc3 = sdCapsule(x, y, z, t2x, t2y, t2z, t3x, t3y, t3z, 0.022, 0.019);
      const tc4 = sdCapsule(x, y, z, t3x, t3y, t3z, t4x, t4y, t4z, 0.019, 0.014);
      const tail = smin(smin(tc1, tc2, 0.015), smin(tc3, tc4, 0.015), 0.015);
      skin = smin(skin, tail, 0.02);

      // 4. Four jointed trotters with dark cloven hooves
      let hooves = 999;
      const trotter = (sx: number, baseZ: number, swing: number, lift: number, isHind: boolean) => {
        const hipY = -0.08 + by;
        const kneeY = -0.27 + by * 0.4 + lift * 0.14;
        const kneeZ = baseZ + (isHind ? -0.035 : 0.02) + swing * 0.48;
        const hoofY = -0.45 + lift * 0.24;
        const hoofZ = baseZ + swing * 1.02;

        const upper = sdCapsule(x, y, z, sx, hipY, baseZ, sx, kneeY, kneeZ, isHind ? 0.082 : 0.074, 0.052);
        const lower = sdCapsule(x, y, z, sx, kneeY, kneeZ, sx, hoofY + 0.04, hoofZ, 0.050, 0.040);
        const leg = smin(upper, lower, 0.025);

        // Cloven hoof (pair of small dark toes)
        const toeL = sdEllipsoid(x, y, z, sx - 0.018, hoofY, hoofZ + 0.014, 0.022, 0.036, 0.036);
        const toeR = sdEllipsoid(x, y, z, sx + 0.018, hoofY, hoofZ + 0.014, 0.022, 0.036, 0.036);
        hooves = Math.min(hooves, Math.min(toeL, toeR));
        return leg;
      };

      const fl = trotter(-0.155,  0.20, P.flSwing, P.flLift, false);
      const fr = trotter( 0.155,  0.20, P.frSwing, P.frLift, false);
      const bl = trotter(-0.165, -0.24, P.blSwing, P.blLift, true);
      const br = trotter( 0.165, -0.24, P.brSwing, P.brLift, true);
      skin = smin(skin, Math.min(Math.min(fl, fr), Math.min(bl, br)), 0.035);

      // 5. Flat-ended snout disc + two dark nostrils + expressive eyes with specular glint
      const snoutDisc = sdEllipsoid(lx, ly, lz, 0, -0.034, 0.305, 0.106, 0.084, 0.046);
      const nostrilL = sdEllipsoid(lx, ly, lz, -0.038, -0.030, 0.348, 0.019, 0.025, 0.018);
      const nostrilR = sdEllipsoid(lx, ly, lz,  0.038, -0.030, 0.348, 0.019, 0.025, 0.018);
      const nostrils = Math.min(nostrilL, nostrilR);

      const eyeL = sdEllipsoid(lx, ly, lz, -0.118, 0.045, 0.205, 0.034, 0.034, 0.032);
      const eyeR = sdEllipsoid(lx, ly, lz,  0.118, 0.045, 0.205, 0.034, 0.034, 0.032);
      const eyes = Math.min(eyeL, eyeR);

      const glintL = sdEllipsoid(lx, ly, lz, -0.128, 0.058, 0.232, 0.013, 0.013, 0.013);
      const glintR = sdEllipsoid(lx, ly, lz,  0.128, 0.058, 0.232, 0.013, 0.013, 0.013);
      const glints = Math.min(glintL, glintR);

      let d = skin, mat = 'skin';
      if (earInner < d) { d = earInner; mat = 'earIn'; }
      if (snoutDisc < d) { d = snoutDisc; mat = 'snout'; }
      if (hooves < d) { d = hooves; mat = 'hoof'; }
      if (eyes < d) { d = eyes; mat = 'eye'; }
      if (glints < d) { d = glints; mat = 'glint'; }
      if (nostrils < d) { d = nostrils; mat = 'nostril'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'glint') return 'w';
      if (mat === 'eye' || mat === 'nostril' || mat === 'hoof') return 'k';
      if (mat === 'snout') {
        return shade > 0.68 ? 's2' : shade > 0.34 ? 's1' : 's0';
      }
      if (mat === 'earIn') {
        return shade > 0.45 ? 's1' : 's0';
      }

      // Subtle mud-speckled belly & lower-trotter shading
      if (y < -0.22) {
        const speckle = Math.sin(x * 34 + z * 29) * Math.cos(y * 32 - z * 21);
        if (y < -0.35 && speckle > 0.15) return 'm0';
        if (speckle > 0.45) return shade > 0.4 ? 'm1' : 'm0';
      }

      // 5-tone rosy-pink skin palette + warm peach highlights on top
      const s = shade + (y > 0.10 ? 0.06 : 0);
      return s > 0.80 ? 'p4'
        : s > 0.62 ? 'p3'
        : s > 0.42 ? 'p2'
        : s > 0.22 ? 'p1'
        : 'p0';
    };

    pack = build27Pack(PIG_PW, PIG_PH, 0.94, 0.80, PIG_PAL, evalFn, shadeFn);
    pigCache.set(pose, pack);
  }
  return pack;
}

export function getPigPosePack(...args: Parameters<typeof buildPigPosePack>): ReturnType<typeof buildPigPosePack> {
  return registerAnimalSpritePack(buildPigPosePack(...args), { module: './Pig.ts', factory: 'getPigPosePack', args }, buildPigPosePack);
}

function pickCycle<T>(frames: readonly T[], idx: number): T {
  return sampleAnimalCycle(frames, idx);
}

const PIG_IDLE: readonly PigPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const PIG_WALK: readonly PigPoseName[] = ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'];
const PIG_SNIFF: readonly PigPoseName[] = ['sniff0', 'sniff1', 'sniff2', 'sniff1'];
const PIG_FLEE: readonly PigPoseName[] = ['flee0', 'flee1', 'flee2', 'flee3'];

export class Pig extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private home = new THREE.Vector3();
  private state: 'idle' | 'sniff' | 'walk' | 'flee' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.2, 2.6);
  private targetYaw = rand(0, Math.PI * 2);
  private gaitPhase = rand(0, Math.PI * 2);
  private hopCooldown = 0;

  private static readonly RADIUS = 0.36;
  private static readonly HEIGHT = 0.64;
  private static readonly CENTER_Y = 0.30;

  constructor(ctx: GameContext, startPos: THREE.Vector3) {
    super(
      ctx,
      getPigPosePack('idle0').getView(2, 0)!,
      PIG_PW,
      PIG_PH,
      PIG_W,
      PIG_H,
      'PigBillboard',
    );
    this.hp = 50;
    this.maxHp = 50;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = Pig.RADIUS;
    this.motor.height = Pig.HEIGHT;
    this.motor.teleport(startPos);
    this.home.copy(startPos);
    this.hurtboxes.push({
      a: new THREE.Vector3(),
      b: new THREE.Vector3(),
      radius: Pig.RADIUS + 0.08,
      tag: 'body',
      enabled: true,
    });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.set(this.position.x, this.position.y + Pig.CENTER_Y, this.position.z);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y + Pig.CENTER_Y * 0.6, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + Pig.CENTER_Y * 1.4, this.position.z);
    this.hurtboxes[0].enabled = this.alive;
    this.stickRoot.position.set(this.position.x, this.position.y + Pig.CENTER_Y, this.position.z);
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
    this.vel.y = 3.2;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.state = 'flee';
      this.stateT = 0;
      this.stateDur = 2.4;
    }
    return res;
  }

  update(dt: number, target: EnemyTarget | null, camera: THREE.Camera, drawingBufferSize?: THREE.Vector2) {
    if (dt > 0) {
      this.stateT += dt;
      this.hopCooldown = Math.max(0, this.hopCooldown - dt);
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
        if (dist < 3.4 && this.state !== 'flee') {
          this.state = 'flee';
          this.stateT = 0;
          this.stateDur = 2.2;
        }

        if (this.state === 'idle') {
          if (this.stateT >= this.stateDur) {
            this.state = Math.random() < 0.46 ? 'sniff' : 'walk';
            this.stateT = 0;
            this.stateDur = rand(1.6, 3.0);
            const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
            this.targetYaw = toHome > 7.5
              ? Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.5, 0.5)
              : this.facing + rand(-1.6, 1.6);
          }
        } else if (this.state === 'sniff') {
          if (this.stateT >= this.stateDur) {
            this.state = 'walk';
            this.stateT = 0;
            this.stateDur = rand(1.6, 2.8);
          }
        } else if (this.state === 'walk') {
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 6);
          speed = 2.0;
          if (this.stateT >= this.stateDur && this.motor.grounded) {
            this.state = Math.random() < 0.48 ? 'sniff' : 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.4, 2.6);
          }
        } else if (this.state === 'flee') {
          if (target && target.alive) {
            this.targetYaw = Math.atan2(this.position.x - target.position.x, this.position.z - target.position.z);
            this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 9.5);
            speed = 4.6;
            if (this.motor.grounded && this.hopCooldown <= 0) {
              this.vel.y = 3.4;
              this.hopCooldown = 0.95;
            }
          }
          if (this.stateT >= this.stateDur && dist > 4.8 && this.motor.grounded) {
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.2, 2.2);
          }
        }

        this.vel.x = damp(this.vel.x, Math.sin(this.facing) * speed, 9, dt);
        this.vel.z = damp(this.vel.z, Math.cos(this.facing) * speed, 9, dt);
        this.vel.y -= 20 * dt;
        this.motor.update(dt);

        const targetPitch = !this.motor.grounded ? Math.max(-0.26, Math.min(0.26, this.vel.y * 0.045)) : 0;
        this.bodyPitch = damp(this.bodyPitch, targetPitch, 10, dt);

        const horiz = Math.hypot(this.vel.x, this.vel.z);
        if (horiz > 0.25 && this.motor.grounded) {
          this.gaitPhase += dt * 6.0 * (0.65 + horiz * 0.22);
        }
      }
      this.syncHurtbox();
    }

    const horiz = Math.hypot(this.vel.x, this.vel.z);
    const bob = this.alive && this.motor.grounded && horiz > 0.25
      ? Math.abs(Math.sin(this.gaitPhase)) * 0.032
      : 0;

    let pose: PigPoseName;
    if (!this.alive) {
      pose = 'idle0';
    } else if (this.state === 'sniff') {
      pose = pickCycle(PIG_SNIFF, this.stateT * 3.2);
    } else if (this.state === 'flee') {
      pose = pickCycle(PIG_FLEE, (this.gaitPhase / Math.PI) * 2.4);
    } else if (this.state === 'walk') {
      pose = pickCycle(PIG_WALK, (this.gaitPhase / Math.PI) * 2.6);
    } else {
      pose = pickCycle(PIG_IDLE, this.stateT * 2.2);
    }

    const deathSink = this.alive ? 0 : Math.min(0.20, this.deadT * 0.4);
    this.renderBillboard(getPigPosePack(pose), this.position.y + Pig.CENTER_Y + bob - deathSink, camera, drawingBufferSize);
  }
}
