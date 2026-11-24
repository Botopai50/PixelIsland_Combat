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
// HIPOPÓTAMO (Hippopotamus) — 76×52 @ ANIMAL_PPU
// ============================================================================
export type HippoPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'walk0' | 'walk1' | 'walk2' | 'walk3' | 'walk4' | 'walk5'
  | 'yawn0' | 'yawn1' | 'yawn2'
  | 'charge0' | 'charge1' | 'charge2' | 'charge3';

export const HIPPO_PW = 76;
export const HIPPO_PH = 52;
export const HIPPO_W = HIPPO_PW / ANIMAL_PPU;
export const HIPPO_H = HIPPO_PH / ANIMAL_PPU;

const HIPPO_PAL: Record<string, [number, number, number]> = {
  k:  [0x18, 0x13, 0x1c], // 1px outline / pupils / nostrils
  h0: [0x36, 0x2d, 0x3d], // deep slate-plum shadow
  h1: [0x52, 0x46, 0x5c], // dark grey-mauve
  h2: [0x72, 0x64, 0x7d], // mid hippo slate-mauve
  h3: [0x94, 0x86, 0xa0], // lit lilac-grey
  h4: [0xb8, 0xac, 0xc4], // glossy wet dorsal highlight
  p0: [0x9a, 0x5c, 0x6c], // shaded rosy belly/cheek/ear
  p1: [0xc6, 0x80, 0x90], // warm rosy pink
  p2: [0xe4, 0xa6, 0xb2], // soft lit rosy pink
  m0: [0x9e, 0x2c, 0x48], // deep mouth interior
  m1: [0xe2, 0x5c, 0x78], // bright pink gums / tongue
  t0: [0xc8, 0xbe, 0xa4], // shaded ivory tusks / toenails
  t1: [0xf8, 0xf2, 0xe2], // bright ivory tusks / toenails
  w:  [0xff, 0xfc, 0xf8], // eye specular glint
};

interface HippoPose {
  bodyY: number;
  headY: number;
  headPitch: number; // positive = head tilts up (yawn), negative = lowered (charge)
  jawOpen: number;   // 0..1 (1 = massive iconic hippo yawn)
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

const HIPPO_POSES: Record<HippoPoseName, HippoPose> = {
  // Heavy breathing & ear/tail swish
  idle0: {
    bodyY: 0.0, headY: 0.0, headPitch: 0.0, jawOpen: 0.0, tailWag: 0.0,
    flSwing: 0.0, flLift: 0.0, frSwing: 0.0, frLift: 0.0,
    blSwing: 0.0, blLift: 0.0, brSwing: 0.0, brLift: 0.0,
  },
  idle1: {
    bodyY: 0.012, headY: 0.015, headPitch: 0.04, jawOpen: 0.04, tailWag: 0.06,
    flSwing: 0.0, flLift: 0.0, frSwing: 0.0, frLift: 0.0,
    blSwing: 0.0, blLift: 0.0, brSwing: 0.0, brLift: 0.0,
  },
  idle2: {
    bodyY: -0.01, headY: -0.012, headPitch: -0.03, jawOpen: 0.0, tailWag: -0.06,
    flSwing: 0.0, flLift: 0.0, frSwing: 0.0, frLift: 0.0,
    blSwing: 0.0, blLift: 0.0, brSwing: 0.0, brLift: 0.0,
  },

  // 6-frame heavy lumbering stride
  walk0: {
    bodyY: 0.01, headY: -0.01, headPitch: -0.03, jawOpen: 0.0, tailWag: 0.05,
    flSwing: 0.14, flLift: 0.06, frSwing: -0.10, frLift: 0.0,
    blSwing: -0.12, blLift: 0.0, brSwing: 0.12, brLift: 0.05,
  },
  walk1: {
    bodyY: 0.02, headY: 0.0, headPitch: -0.02, jawOpen: 0.0, tailWag: 0.02,
    flSwing: 0.07, flLift: 0.02, frSwing: -0.03, frLift: 0.04,
    blSwing: -0.05, blLift: 0.04, brSwing: 0.06, brLift: 0.02,
  },
  walk2: {
    bodyY: -0.012, headY: -0.016, headPitch: -0.04, jawOpen: 0.0, tailWag: -0.03,
    flSwing: -0.04, flLift: 0.0, frSwing: 0.08, frLift: 0.06,
    blSwing: 0.06, blLift: 0.05, brSwing: -0.05, brLift: 0.0,
  },
  walk3: {
    bodyY: 0.01, headY: -0.01, headPitch: -0.03, jawOpen: 0.0, tailWag: -0.05,
    flSwing: -0.10, flLift: 0.0, frSwing: 0.14, frLift: 0.06,
    blSwing: 0.12, blLift: 0.05, brSwing: -0.12, brLift: 0.0,
  },
  walk4: {
    bodyY: 0.02, headY: 0.0, headPitch: -0.02, jawOpen: 0.0, tailWag: -0.02,
    flSwing: -0.03, flLift: 0.04, frSwing: 0.07, frLift: 0.02,
    blSwing: 0.06, blLift: 0.02, brSwing: -0.05, brLift: 0.04,
  },
  walk5: {
    bodyY: -0.012, headY: -0.016, headPitch: -0.04, jawOpen: 0.0, tailWag: 0.03,
    flSwing: 0.08, flLift: 0.06, frSwing: -0.04, frLift: 0.0,
    blSwing: -0.05, blLift: 0.0, brSwing: 0.06, brLift: 0.05,
  },

  // 3-frame iconic territorial tusk-yawn
  yawn0: {
    bodyY: 0.01, headY: 0.04, headPitch: 0.18, jawOpen: 0.45, tailWag: 0.04,
    flSwing: 0.03, flLift: 0.0, frSwing: -0.02, frLift: 0.0,
    blSwing: -0.02, blLift: 0.0, brSwing: 0.02, brLift: 0.0,
  },
  yawn1: {
    bodyY: 0.02, headY: 0.08, headPitch: 0.36, jawOpen: 0.92, tailWag: -0.05,
    flSwing: 0.05, flLift: 0.0, frSwing: -0.03, frLift: 0.0,
    blSwing: -0.03, blLift: 0.0, brSwing: 0.03, brLift: 0.0,
  },
  yawn2: {
    bodyY: 0.022, headY: 0.09, headPitch: 0.40, jawOpen: 1.0, tailWag: 0.06,
    flSwing: 0.05, flLift: 0.0, frSwing: -0.03, frLift: 0.0,
    blSwing: -0.03, blLift: 0.0, brSwing: 0.03, brLift: 0.0,
  },

  // 4-frame thundering charge with tusks bared
  charge0: {
    bodyY: -0.02, headY: -0.03, headPitch: -0.10, jawOpen: 0.55, tailWag: 0.08,
    flSwing: -0.14, flLift: 0.07, frSwing: -0.18, frLift: 0.03,
    blSwing: 0.18, blLift: 0.09, brSwing: 0.12, brLift: 0.04,
  },
  charge1: {
    bodyY: 0.035, headY: -0.02, headPitch: -0.06, jawOpen: 0.72, tailWag: 0.0,
    flSwing: 0.20, flLift: 0.12, frSwing: 0.14, frLift: 0.09,
    blSwing: -0.18, blLift: 0.10, brSwing: -0.12, brLift: 0.07,
  },
  charge2: {
    bodyY: 0.015, headY: -0.03, headPitch: -0.08, jawOpen: 0.65, tailWag: -0.08,
    flSwing: 0.14, flLift: 0.04, frSwing: 0.20, frLift: 0.11,
    blSwing: -0.12, blLift: 0.08, brSwing: -0.18, brLift: 0.11,
  },
  charge3: {
    bodyY: -0.022, headY: -0.04, headPitch: -0.12, jawOpen: 0.50, tailWag: 0.03,
    flSwing: -0.16, flLift: 0.08, frSwing: -0.06, frLift: 0.03,
    blSwing: 0.14, blLift: 0.04, brSwing: 0.18, brLift: 0.09,
  },
};

const hippoCache = new Map<HippoPoseName, Boar27Pack>();

 function buildHippoPosePack(pose: HippoPoseName): Boar27Pack {
  let pack = hippoCache.get(pose);
  if (!pack) {
    const P = HIPPO_POSES[pose];
    const by = P.bodyY;
    const hPivotY = 0.09 + P.headY + by;
    const hPivotZ = 0.42;
    const cosP = Math.cos(P.headPitch);
    const sinP = Math.sin(P.headPitch);
    const jawAng = P.jawOpen * 0.92;
    const cosJ = Math.cos(jawAng);
    const sinJ = Math.sin(jawAng);

    const evalFn: SdfEvaluator = (x, y, z) => {
      // 1. Massive heavy barrel torso, rounded rump, thick neck folds, short tufted tail
      const barrel = sdEllipsoid(x, y, z, 0, 0.01 + by, -0.04, 0.34, 0.28, 0.44);
      const belly = sdEllipsoid(x, y, z, 0, -0.11 + by, -0.02, 0.32, 0.19, 0.36);
      const shoulders = sdEllipsoid(x, y, z, 0, 0.08 + by, 0.18, 0.30, 0.24, 0.24);
      const rump = sdEllipsoid(x, y, z, 0, 0.03 + by, -0.36, 0.30, 0.25, 0.25);
      const neckFold1 = sdEllipsoid(x, y, z, 0, 0.07 + by, 0.32, 0.27, 0.21, 0.13);
      const neckFold2 = sdEllipsoid(x, y, z, 0, 0.04 + by, 0.38, 0.24, 0.19, 0.10);

      const tw = P.tailWag;
      const tailStem = sdCapsule(x, y, z, 0, 0.02 + by, -0.56, tw * 0.5, -0.10 + by, -0.64, 0.034, 0.022);
      const tailTuft = sdEllipsoid(x, y, z, tw * 0.6, -0.14 + by, -0.66, 0.038, 0.048, 0.032);
      const tail = smin(tailStem, tailTuft, 0.015);

      let skin = smin(barrel, belly, 0.09);
      skin = smin(skin, shoulders, 0.10);
      skin = smin(skin, rump, 0.10);
      skin = smin(skin, neckFold1, 0.07);
      skin = smin(skin, neckFold2, 0.06);
      skin = smin(skin, tail, 0.025);

      // 2. Huge hippo head in local pitched space
      const dy = y - hPivotY;
      const dz = z - hPivotZ;
      const lz = dz * cosP + dy * sinP;
      const ly = -dz * sinP + dy * cosP;

      const cranium = sdEllipsoid(x, ly, lz, 0, 0.04, 0.06, 0.22, 0.18, 0.20);
      const cheekL = sdEllipsoid(x, ly, lz, -0.19, -0.02, 0.08, 0.12, 0.11, 0.14);
      const cheekR = sdEllipsoid(x, ly, lz,  0.19, -0.02, 0.08, 0.12, 0.11, 0.14);

      // Raised brow domes for high-set hippo eyes
      const browL = sdEllipsoid(x, ly, lz, -0.135, 0.155, 0.12, 0.068, 0.058, 0.072);
      const browR = sdEllipsoid(x, ly, lz,  0.135, 0.155, 0.12, 0.068, 0.058, 0.072);

      // Small high-set rounded ears
      const earL = sdEllipsoid(x, ly, lz, -0.155, 0.215, -0.01, 0.044, 0.058, 0.034);
      const earR = sdEllipsoid(x, ly, lz,  0.155, 0.215, -0.01, 0.044, 0.058, 0.034);
      const earInL = sdEllipsoid(x, ly, lz, -0.155, 0.212, 0.018, 0.026, 0.036, 0.018);
      const earInR = sdEllipsoid(x, ly, lz,  0.155, 0.212, 0.018, 0.026, 0.036, 0.018);
      const earInner = Math.min(earInL, earInR);

      // Huge broad squared-off upper snout + raised nostril domes
      const upperSnout = sdEllipsoid(x, ly, lz, 0, 0.015, 0.27, 0.215, 0.115, 0.19);
      const muzzleL = sdEllipsoid(x, ly, lz, -0.135, -0.01, 0.34, 0.105, 0.095, 0.125);
      const muzzleR = sdEllipsoid(x, ly, lz,  0.135, -0.01, 0.34, 0.105, 0.095, 0.125);
      const nDomeL = sdEllipsoid(x, ly, lz, -0.095, 0.095, 0.36, 0.054, 0.045, 0.058);
      const nDomeR = sdEllipsoid(x, ly, lz,  0.095, 0.095, 0.36, 0.054, 0.045, 0.058);

      let headD = smin(cranium, Math.min(cheekL, cheekR), 0.06);
      headD = smin(headD, Math.min(browL, browR), 0.035);
      headD = smin(headD, Math.min(earL, earR), 0.02);
      headD = smin(headD, upperSnout, 0.06);
      headD = smin(headD, Math.min(muzzleL, muzzleR), 0.05);
      headD = smin(headD, Math.min(nDomeL, nDomeR), 0.025);

      // Hinged massive lower jaw (rotates down around jaw hinge at ly=-0.06, lz=0.10)
      const jdy = ly - (-0.06);
      const jdz = lz - 0.10;
      const jz = jdz * cosJ - jdy * sinJ;
      const jy = jdz * sinJ + jdy * cosJ;

      const lowerJaw = sdEllipsoid(x, jy, jz, 0, -0.045, 0.16, 0.195, 0.075, 0.185);
      const lowerLipL = sdEllipsoid(x, jy, jz, -0.12, -0.035, 0.24, 0.088, 0.068, 0.098);
      const lowerLipR = sdEllipsoid(x, jy, jz,  0.12, -0.035, 0.24, 0.088, 0.068, 0.098);
      const jawD = smin(lowerJaw, Math.min(lowerLipL, lowerLipR), 0.045);

      headD = smin(headD, jawD, P.jawOpen > 0.2 ? 0.025 : 0.05);
      skin = smin(skin, headD, 0.07);

      // Bright pink mouth interior & huge curved ivory lower tusks (visible when yawning/charging)
      let mouthIn = 999;
      let tusks = 999;
      if (P.jawOpen > 0.15) {
        const throat = sdEllipsoid(x, ly, lz, 0, -0.035, 0.15, 0.145, 0.095, 0.125);
        const tongue = sdEllipsoid(x, jy, jz, 0, 0.01, 0.15, 0.135, 0.045, 0.14);
        mouthIn = smin(throat, tongue, 0.04);

        const tuskL = sdCapsule(x, jy, jz, -0.115, 0.005, 0.25, -0.128, 0.125, 0.28, 0.030, 0.015);
        const tuskR = sdCapsule(x, jy, jz,  0.115, 0.005, 0.25,  0.128, 0.125, 0.28, 0.030, 0.015);
        const incL  = sdCapsule(x, jy, jz, -0.045, 0.005, 0.27, -0.048, 0.065, 0.29, 0.020, 0.012);
        const incR  = sdCapsule(x, jy, jz,  0.045, 0.005, 0.27,  0.048, 0.065, 0.29, 0.020, 0.012);
        tusks = Math.min(Math.min(tuskL, tuskR), Math.min(incL, incR));
      }

      // 3. Four thick pillar legs with pale toenails
      let nails = 999;
      const pillarLeg = (sx: number, baseZ: number, swing: number, lift: number) => {
        const hipY = -0.08 + by;
        const kneeY = -0.27 + by * 0.4 + lift * 0.10;
        const kneeZ = baseZ + swing * 0.42;
        const footY = -0.45 + lift * 0.18;
        const footZ = baseZ + swing * 0.90;

        const upper = sdCapsule(x, y, z, sx, hipY, baseZ, sx, kneeY, kneeZ, 0.118, 0.092);
        const lower = sdCapsule(x, y, z, sx, kneeY, kneeZ, sx, footY + 0.03, footZ, 0.092, 0.086);
        const foot = sdEllipsoid(x, y, z, sx, footY, footZ + 0.015, 0.095, 0.042, 0.102);

        // 3 pale toenails on the front rim of each pillar foot
        const n1 = sdEllipsoid(x, y, z, sx - 0.045, footY - 0.012, footZ + 0.102, 0.020, 0.022, 0.022);
        const n2 = sdEllipsoid(x, y, z, sx,         footY - 0.012, footZ + 0.112, 0.022, 0.022, 0.022);
        const n3 = sdEllipsoid(x, y, z, sx + 0.045, footY - 0.012, footZ + 0.102, 0.020, 0.022, 0.022);
        nails = Math.min(nails, Math.min(n1, Math.min(n2, n3)));

        return smin(smin(upper, lower, 0.035), foot, 0.03);
      };

      const fl = pillarLeg(-0.195,  0.22, P.flSwing, P.flLift);
      const fr = pillarLeg( 0.195,  0.22, P.frSwing, P.frLift);
      const bl = pillarLeg(-0.205, -0.28, P.blSwing, P.blLift);
      const br = pillarLeg( 0.205, -0.28, P.brSwing, P.brLift);
      skin = smin(skin, Math.min(Math.min(fl, fr), Math.min(bl, br)), 0.05);

      // 4. Raised nostrils + glossy eyes with white glint
      const nostrilL = sdEllipsoid(x, ly, lz, -0.095, 0.112, 0.405, 0.024, 0.020, 0.022);
      const nostrilR = sdEllipsoid(x, ly, lz,  0.095, 0.112, 0.405, 0.024, 0.020, 0.022);
      const nostrils = Math.min(nostrilL, nostrilR);

      const eyeL = sdEllipsoid(x, ly, lz, -0.145, 0.155, 0.175, 0.032, 0.032, 0.030);
      const eyeR = sdEllipsoid(x, ly, lz,  0.145, 0.155, 0.175, 0.032, 0.032, 0.030);
      const eyes = Math.min(eyeL, eyeR);

      const glintL = sdEllipsoid(x, ly, lz, -0.154, 0.168, 0.200, 0.013, 0.013, 0.013);
      const glintR = sdEllipsoid(x, ly, lz,  0.154, 0.168, 0.200, 0.013, 0.013, 0.013);
      const glints = Math.min(glintL, glintR);

      let d = skin, mat = 'skin';
      if (earInner < d) { d = earInner; mat = 'rosy'; }
      if (mouthIn < d) { d = mouthIn; mat = 'mouth'; }
      if (tusks < d) { d = tusks; mat = 'ivory'; }
      if (nails < d) { d = nails; mat = 'ivory'; }
      if (eyes < d) { d = eyes; mat = 'eye'; }
      if (glints < d) { d = glints; mat = 'glint'; }
      if (nostrils < d) { d = nostrils; mat = 'nostril'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'glint') return 'w';
      if (mat === 'eye' || mat === 'nostril') return 'k';
      if (mat === 'mouth') return shade > 0.44 ? 'm1' : 'm0';
      if (mat === 'ivory') return shade > 0.42 ? 't1' : 't0';
      if (mat === 'rosy') return shade > 0.62 ? 'p2' : shade > 0.34 ? 'p1' : 'p0';

      // Warm rosy-pink belly and lower cheek accents
      const onBelly = y < -0.14 + by && Math.abs(x) < 0.26 && z > -0.34 && z < 0.34;
      const onCheek = z > 0.42 && y < 0.04 + by && Math.abs(x) > 0.12;
      if (onBelly || onCheek) {
        return shade > 0.65 ? 'p2' : shade > 0.35 ? 'p1' : 'p0';
      }

      // Glossy slate-plum / grey-mauve skin ramp with wet dorsal sheen
      const wetHighlight = y > 0.14 + by ? 0.08 : 0;
      const s = shade + wetHighlight;
      return s > 0.82 ? 'h4'
        : s > 0.64 ? 'h3'
        : s > 0.44 ? 'h2'
        : s > 0.24 ? 'h1'
        : 'h0';
    };

    pack = build27Pack(HIPPO_PW, HIPPO_PH, 1.12, 0.84, HIPPO_PAL, evalFn, shadeFn);
    hippoCache.set(pose, pack);
  }
  return pack;
}

export function getHippoPosePack(...args: Parameters<typeof buildHippoPosePack>): ReturnType<typeof buildHippoPosePack> {
  return registerAnimalSpritePack(buildHippoPosePack(...args), { module: './Hippo.ts', factory: 'getHippoPosePack', args }, buildHippoPosePack);
}

function pickCycle<T>(frames: readonly T[], idx: number): T {
  return sampleAnimalCycle(frames, idx);
}

const HIPPO_IDLE: readonly HippoPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const HIPPO_WALK: readonly HippoPoseName[] = ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'];
const HIPPO_YAWN: readonly HippoPoseName[] = ['yawn0', 'yawn1', 'yawn2', 'yawn1', 'yawn0'];
const HIPPO_CHARGE: readonly HippoPoseName[] = ['charge0', 'charge1', 'charge2', 'charge3'];

export class Hippo extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private readonly home = new THREE.Vector3();
  private state: 'idle' | 'walk' | 'yawn' | 'charge' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.6, 3.2);
  private targetYaw = rand(0, Math.PI * 2);
  private gaitPhase = rand(0, Math.PI * 2);
  private provokedT = 0;

  private static readonly RADIUS = 0.54;
  private static readonly HEIGHT = 0.92;
  private static readonly CENTER_Y = 0.44;

  constructor(ctx: GameContext, startPos: THREE.Vector3, pondCenter?: THREE.Vector3) {
    super(
      ctx,
      getHippoPosePack('idle0').getView(2, 0)!,
      HIPPO_PW,
      HIPPO_PH,
      HIPPO_W,
      HIPPO_H,
      'HippoBillboard',
    );
    this.hp = 160;
    this.maxHp = 160;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = Hippo.RADIUS;
    this.motor.height = Hippo.HEIGHT;
    this.motor.teleport(startPos);
    this.home.copy(pondCenter ?? startPos);
    this.hurtboxes.push({
      a: new THREE.Vector3(),
      b: new THREE.Vector3(),
      radius: Hippo.RADIUS + 0.12,
      tag: 'body',
      enabled: true,
    });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.set(this.position.x, this.position.y + Hippo.CENTER_Y, this.position.z);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y + Hippo.CENTER_Y * 0.55, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + Hippo.CENTER_Y * 1.45, this.position.z);
    this.hurtboxes[0].enabled = this.alive;
    this.stickRoot.position.set(this.position.x, this.position.y + Hippo.CENTER_Y, this.position.z);
    this.stickRoot.rotation.y = this.facing;
  }

  receiveHit(hit: HitInfo): HitResult {
    const res = emptyResult('flesh');
    if (!this.alive) { res.ignored = true; return res; }
    this.hp = Math.max(0, this.hp - hit.damage);
    res.damage = hit.damage;
    this.flash = 1.0;
    this.vel.x += hit.dir.x * 2.2;
    this.vel.z += hit.dir.z * 2.2;
    this.vel.y = 1.8;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.provokedT = 5.5;
      this.state = 'charge';
      this.stateT = 0;
      this.stateDur = 3.2;
    }
    return res;
  }

  update(dt: number, target: EnemyTarget | null, camera: THREE.Camera, drawingBufferSize?: THREE.Vector2) {
    if (dt > 0) {
      this.stateT += dt;
      this.provokedT = Math.max(0, this.provokedT - dt);
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

        // Territorial warning yawn if player gets close, or charge if provoked
        if (dist < 3.6 && this.state !== 'charge' && this.state !== 'yawn') {
          this.state = this.provokedT > 0 ? 'charge' : 'yawn';
          this.stateT = 0;
          this.stateDur = this.state === 'charge' ? 2.8 : 1.7;
        }

        if (this.state === 'idle') {
          if (this.stateT >= this.stateDur) {
            this.state = Math.random() < 0.35 ? 'yawn' : 'walk';
            this.stateT = 0;
            this.stateDur = this.state === 'yawn' ? 1.8 : rand(2.0, 3.8);
            const toPond = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
            this.targetYaw = toPond > 6.5
              ? Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.4, 0.4)
              : this.facing + rand(-1.5, 1.5);
          }
        } else if (this.state === 'yawn') {
          if (target && target.alive && dist < 5.0) {
            this.targetYaw = Math.atan2(target.position.x - this.position.x, target.position.z - this.position.z);
            this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 4.5);
          }
          if (this.stateT >= this.stateDur) {
            this.state = dist < 3.2 ? 'charge' : 'idle';
            this.stateT = 0;
            this.stateDur = this.state === 'charge' ? 2.4 : rand(1.6, 2.8);
          }
        } else if (this.state === 'walk') {
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 3.8);
          speed = 1.45;
          if (this.stateT >= this.stateDur && this.motor.grounded) {
            this.state = Math.random() < 0.38 ? 'yawn' : 'idle';
            this.stateT = 0;
            this.stateDur = this.state === 'yawn' ? 1.7 : rand(1.6, 3.0);
          }
        } else if (this.state === 'charge') {
          if (target && target.alive) {
            this.targetYaw = Math.atan2(target.position.x - this.position.x, target.position.z - this.position.z);
            this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 6.5);
            speed = dist > 1.3 ? 4.3 : 1.2;
          }
          if (this.stateT >= this.stateDur && (dist > 5.5 || this.provokedT <= 0)) {
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.4, 2.4);
          }
        }

        this.vel.x = damp(this.vel.x, Math.sin(this.facing) * speed, 7.5, dt);
        this.vel.z = damp(this.vel.z, Math.cos(this.facing) * speed, 7.5, dt);
        this.vel.y -= 20 * dt;
        this.motor.update(dt);

        const targetPitch = !this.motor.grounded ? Math.max(-0.20, Math.min(0.20, this.vel.y * 0.04)) : 0;
        this.bodyPitch = damp(this.bodyPitch, targetPitch, 8, dt);

        const horiz = Math.hypot(this.vel.x, this.vel.z);
        if (horiz > 0.20 && this.motor.grounded) {
          this.gaitPhase += dt * 4.8 * (0.6 + horiz * 0.22);
        }
      }
      this.syncHurtbox();
    }

    const horiz = Math.hypot(this.vel.x, this.vel.z);
    const bob = this.alive && this.motor.grounded && horiz > 0.20
      ? Math.abs(Math.sin(this.gaitPhase)) * 0.025
      : 0;

    let pose: HippoPoseName;
    if (!this.alive) {
      pose = 'idle0';
    } else if (this.state === 'yawn') {
      pose = pickCycle(HIPPO_YAWN, this.stateT * 2.8);
    } else if (this.state === 'charge') {
      pose = pickCycle(HIPPO_CHARGE, (this.gaitPhase / Math.PI) * 2.4);
    } else if (this.state === 'walk') {
      pose = pickCycle(HIPPO_WALK, (this.gaitPhase / Math.PI) * 2.4);
    } else {
      pose = pickCycle(HIPPO_IDLE, this.stateT * 1.8);
    }

    const deathSink = this.alive ? 0 : Math.min(0.24, this.deadT * 0.4);
    this.renderBillboard(getHippoPosePack(pose), this.position.y + Hippo.CENTER_Y + bob - deathSink, camera, drawingBufferSize);
  }
}
