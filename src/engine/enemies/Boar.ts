import { registerAnimalSpritePack, isAnimalLocomotionPack, animalRestPack } from './AnimalSpriteCache';
import { AnimalMotionAnimation } from './AnimalMotionAnimation';
import { AnimalViewAngles } from './AnimalViewAngles';
import { AnimalTurnMotion } from './AnimalTurnMotion';
import { steerAnimalLocomotion } from './AnimalLocomotion';
import { keepAnimalAboveGround } from './AnimalGrounding';
import { sampleAnimalCycle } from './AnimalAnimation';
import * as THREE from 'three';
import { addToPixelActorLayer } from '../core/PixelActorLayer';
import type { GameContext } from '../core/Context';
import type { Damageable, HitInfo, HitResult, Hurtbox, Team } from '../combat/types';
import { emptyResult, newId } from '../combat/types';
import type { EnemyTarget } from './Enemy';
import {
  CREATURE_PITCHES,
  CREATURE_YAWS,
  CREATURE_FRAGMENT_SHADER,
  CREATURE_VERTEX_SHADER,
  createContactShadow,
  createSunShadowBillboard,
  getSunDir,
  hasBakeBudget,
  pick27View,
  recordBakeCost,
  updateSunShadowBillboard,
  type CreatureViewPack,
} from './Animals';
import { CharacterMotor } from '../physics/CharacterMotor';
import { damp, rand } from '../core/math';

const angleDiff = (a: number, b: number) => Math.atan2(Math.sin(b - a), Math.cos(b - a));

/**
 * Javali selvagem adulto em Pixel Art 3D (46×36 a 38 PPU = 1.21m × 0.95m, zero mixels):
 * - Escultura 3D SDF completa (ombros largos, cabeça em cunha, focinho com narinas,
 *   presas de marfim, crina dorsal eriçada, rabinho + coxas musculosas, pernas e cascos)
 *   em **27 vistas** (7 faixas verticais × 8 direções horizontais).
 * - **23 poses animadas** (lazy-cached por pose):
 *   `idle0..idle3` (respiração/farejada 4f), `walk0..walk5` (trote diagonal 6f),
 *   `windup0..windup3` (cabeça baixa raspando o casco 4f),
 *   `dash0..dash5` (galope completo 6f), `jump0`/`jump1` (subida e descida), `hurt` (recuo).
 * - Mesmo shader de pixel snap inteiro e projeção de sombra do herói.
 */

const BOAR_PAL: Record<string, [number, number, number]> = {
  k: [0x1c, 0x14, 0x18], // contorno / olhos / narinas / cascos
  '0': [0x26, 0x1a, 0x1c],
  '1': [0x3d, 0x28, 0x22],
  '2': [0x5e, 0x3c, 0x2b],
  '3': [0x87, 0x57, 0x37],
  '4': [0xb5, 0x79, 0x48],
  m: [0x1f, 0x16, 0x1a], // crina dorsal escura
  M: [0x3a, 0x26, 0x20],
  s: [0x9c, 0x4b, 0x38], // focinho terracota/rosado
  d: [0xcf, 0x6e, 0x4e],
  f: [0xf0, 0x9c, 0x72],
  h: [0xfc, 0xc2, 0x9c],
  t: [0xd4, 0xc3, 0x9c], // presas de marfim
  T: [0xee, 0xe0, 0xb8],
  W: [0xfa, 0xf2, 0xd4],
};

export type BoarPoseName =
  | 'idle0' | 'idle1' | 'idle2' | 'idle3'
  | 'walk0' | 'walk1' | 'walk2' | 'walk3' | 'walk4' | 'walk5'
  | 'windup0' | 'windup1' | 'windup2' | 'windup3'
  | 'dash0' | 'dash1' | 'dash2' | 'dash3' | 'dash4' | 'dash5'
  | 'jump0' | 'jump1'
  | 'hurt';

const BOAR_IDLE_FRAMES: readonly BoarPoseName[] = ['idle0', 'idle1', 'idle2', 'idle3'];
const BOAR_WALK_FRAMES: readonly BoarPoseName[] = ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'];
const BOAR_WINDUP_FRAMES: readonly BoarPoseName[] = ['windup0', 'windup1', 'windup2', 'windup3'];
const BOAR_DASH_FRAMES: readonly BoarPoseName[] = ['dash0', 'dash1', 'dash2', 'dash3', 'dash4', 'dash5'];
const TWO_PI = Math.PI * 2;

interface BoarPoseParams {
  headDip: number;       // deslocamento Y da cabeça/focinho
  headFwd: number;       // avanço Z da cabeça
  earBack: number;       // orelhas puxadas para trás
  bodyLift: number;      // leve elevação/agachamento do tronco
  // Pernas [swingZ, liftY] para FL, FR, BL, BR
  fl: [number, number];
  fr: [number, number];
  bl: [number, number];
  br: [number, number];
}

const BOAR_POSES: Record<BoarPoseName, BoarPoseParams> = {
  // --- Idle (4 frames: respiração + farejada suave) ---
  idle0: {
    headDip: 0.01, headFwd: 0, earBack: 0, bodyLift: 0.01,
    fl: [0, 0], fr: [0, 0], bl: [0, 0], br: [0, 0],
  },
  idle1: {
    headDip: -0.04, headFwd: 0.02, earBack: -0.02, bodyLift: -0.01,
    fl: [0.02, 0], fr: [-0.01, 0], bl: [0, 0], br: [0, 0],
  },
  idle2: {
    headDip: -0.09, headFwd: 0.04, earBack: -0.04, bodyLift: -0.025,
    fl: [0.03, 0], fr: [-0.02, 0], bl: [-0.01, 0], br: [0.01, 0],
  },
  idle3: {
    headDip: -0.03, headFwd: 0.015, earBack: 0.01, bodyLift: -0.005,
    fl: [0.01, 0], fr: [-0.01, 0], bl: [0, 0], br: [0, 0],
  },

  // --- Walk (6 frames: trote diagonal suave FL+BR / FR+BL) ---
  walk0: {
    // Contato A (FL + BR tocam à frente, FR + BL empurram atrás)
    headDip: -0.01, headFwd: 0.01, earBack: 0.02, bodyLift: -0.01,
    fl: [0.22, 0.03], fr: [-0.20, 0.02], bl: [-0.18, 0.02], br: [0.20, 0.03],
  },
  walk1: {
    // Apoio A + elevação B (FR + BL passam dobradas)
    headDip: -0.04, headFwd: 0.03, earBack: 0.04, bodyLift: 0.03,
    fl: [0.04, 0], fr: [-0.02, 0.14], bl: [-0.02, 0.14], br: [0.04, 0],
  },
  walk2: {
    // Alcance B + impulso A
    headDip: -0.02, headFwd: 0.02, earBack: 0.03, bodyLift: 0.02,
    fl: [-0.12, 0], fr: [0.16, 0.11], bl: [0.15, 0.11], br: [-0.12, 0],
  },
  walk3: {
    // Contato B (FR + BL tocam à frente, FL + BR empurram atrás)
    headDip: -0.01, headFwd: 0.01, earBack: 0.02, bodyLift: -0.01,
    fl: [-0.20, 0.02], fr: [0.22, 0.03], bl: [0.20, 0.03], br: [-0.18, 0.02],
  },
  walk4: {
    // Apoio B + elevação A (FL + BR passam dobradas)
    headDip: -0.04, headFwd: 0.03, earBack: 0.04, bodyLift: 0.03,
    fl: [-0.02, 0.14], fr: [0.04, 0], bl: [0.04, 0], br: [-0.02, 0.14],
  },
  walk5: {
    // Alcance A + impulso B
    headDip: -0.02, headFwd: 0.02, earBack: 0.03, bodyLift: 0.02,
    fl: [0.16, 0.11], fr: [-0.12, 0], bl: [-0.12, 0], br: [0.15, 0.11],
  },

  // --- Windup (4 frames: abaixando a cabeça + raspada de casco no chão) ---
  windup0: {
    headDip: -0.10, headFwd: 0.03, earBack: 0.06, bodyLift: -0.04,
    fl: [-0.06, 0], fr: [0.12, 0.08], bl: [-0.08, 0], br: [-0.06, 0],
  },
  windup1: {
    headDip: -0.15, headFwd: 0.05, earBack: 0.10, bodyLift: -0.06,
    fl: [-0.08, 0], fr: [0.26, 0.18], bl: [-0.12, 0], br: [-0.08, 0],
  },
  windup2: {
    headDip: -0.17, headFwd: 0.07, earBack: 0.12, bodyLift: -0.07,
    fl: [-0.08, 0], fr: [0.02, 0.01], bl: [-0.14, 0], br: [-0.10, 0],
  },
  windup3: {
    headDip: -0.13, headFwd: 0.04, earBack: 0.09, bodyLift: -0.05,
    fl: [-0.06, 0], fr: [-0.14, 0.07], bl: [-0.10, 0], br: [-0.08, 0],
  },

  // --- Dash (6 frames: galope poderoso — recolher -> empurrar -> voo -> impacto) ---
  dash0: {
    // Recolhido sob a barriga
    headDip: -0.09, headFwd: 0.05, earBack: 0.10, bodyLift: 0.05,
    fl: [-0.18, 0.13], fr: [-0.12, 0.10], bl: [0.20, 0.13], br: [0.15, 0.10],
  },
  dash1: {
    // Traseiras plantam e empurram
    headDip: -0.12, headFwd: 0.06, earBack: 0.11, bodyLift: 0,
    fl: [0.10, 0.14], fr: [0.04, 0.12], bl: [0.04, 0], br: [-0.04, 0],
  },
  dash2: {
    // Impulso explosivo
    headDip: -0.11, headFwd: 0.08, earBack: 0.12, bodyLift: 0.04,
    fl: [0.28, 0.16], fr: [0.22, 0.13], bl: [-0.22, 0.04], br: [-0.18, 0.02],
  },
  dash3: {
    // Voo estendido
    headDip: -0.10, headFwd: 0.09, earBack: 0.13, bodyLift: 0.07,
    fl: [0.36, 0.14], fr: [0.30, 0.11], bl: [-0.34, 0.12], br: [-0.28, 0.10],
  },
  dash4: {
    // Impacto frontal
    headDip: -0.14, headFwd: 0.06, earBack: 0.11, bodyLift: -0.02,
    fl: [0.22, 0], fr: [0.14, 0.02], bl: [-0.14, 0.14], br: [-0.08, 0.12],
  },
  dash5: {
    // Puxada frontal rumo ao recolhimento
    headDip: -0.12, headFwd: 0.05, earBack: 0.10, bodyLift: 0.01,
    fl: [-0.04, 0.04], fr: [-0.08, 0.06], bl: [0.08, 0.14], br: [0.04, 0.12],
  },

  // --- Jump (2 frames: subida / descida) ---
  jump0: {
    headDip: 0.08, headFwd: 0.03, earBack: 0.10, bodyLift: 0.07,
    fl: [0.26, 0.24], fr: [0.22, 0.22], bl: [-0.28, 0.04], br: [-0.24, 0.04],
  },
  jump1: {
    headDip: -0.06, headFwd: 0.05, earBack: 0.08, bodyLift: 0.02,
    fl: [0.22, 0.05], fr: [0.18, 0.04], bl: [-0.14, 0.16], br: [-0.10, 0.14],
  },

  // --- Hurt (recuo de impacto) ---
  hurt: {
    headDip: 0.14, headFwd: -0.06, earBack: 0.14, bodyLift: 0.05,
    fl: [0.16, 0.20], fr: [0.18, 0.22], bl: [-0.14, 0], br: [-0.14, 0],
  },
};

export type Boar27Pack = CreatureViewPack;

// Resolução pixel-art enxuta e marcante (46x36) em porte de javali adulto (1.22m x 0.95m),
// com BOAR_PPU sincronizado no shader para 1 texel === 1 célula quadrada perfeita (zero blur/stretch).
export const BOAR_PW = 46;
export const BOAR_PH = 36;
export const BOAR_PPU = 38;
export const BOAR_W = BOAR_PW / BOAR_PPU; // 1.211m
export const BOAR_H = BOAR_PH / BOAR_PPU; // 0.947m
const BOAR_EX = 1.00;
const BOAR_EY = 0.78;

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

function sdEllipsoid(px: number, py: number, pz: number, cx: number, cy: number, cz: number, rx: number, ry: number, rz: number) {
  const x = (px - cx) / rx, y = (py - cy) / ry, z = (pz - cz) / rz;
  const k0 = Math.sqrt(x * x + y * y + z * z);
  if (k0 < 1e-6) return -Math.min(rx, ry, rz);
  const a = x / rx, b = y / ry, c = z / rz;
  const k1 = Math.sqrt(a * a + b * b + c * c);
  return (k0 * (k0 - 1)) / k1;
}

function sdCapsule(
  px: number, py: number, pz: number,
  ax: number, ay: number, az: number,
  bx: number, by: number, bz: number,
  rA: number, rB: number,
) {
  const pax = px - ax, pay = py - ay, paz = pz - az;
  const bax = bx - ax, bay = by - ay, baz = bz - az;
  const ba2 = bax * bax + bay * bay + baz * baz;
  const h = clamp((pax * bax + pay * bay + paz * baz) / (ba2 || 1), 0, 1);
  const dx = pax - bax * h, dy = pay - bay * h, dz = paz - baz * h;
  return Math.sqrt(dx * dx + dy * dy + dz * dz) - (rA + (rB - rA) * h);
}

function smin(a: number, b: number, k: number) {
  const h = clamp(0.5 + (0.5 * (b - a)) / k, 0, 1);
  return b * (1 - h) + a * h - k * h * (1 - h);
}

/** Escultura 3D completa do javali para uma pose específica. */
function evalBoarPose(x: number, y: number, z: number, P: BoarPoseParams): { d: number; mat: string } {
  const by = P.bodyLift;
  const hy = P.headDip + by;
  const hz = P.headFwd;

  const shoulder = sdEllipsoid(x, y, z, 0, 0.12 + by, 0.16, 0.35, 0.35, 0.37);
  const chest = sdEllipsoid(x, y, z, 0, -0.02 + by, 0.22, 0.31, 0.25, 0.31);
  const midBody = sdEllipsoid(x, y, z, 0, 0.06 + by, -0.10, 0.32, 0.30, 0.35);
  const rump = sdEllipsoid(x, y, z, 0, 0.03 + by, -0.36, 0.28, 0.27, 0.29);

  const cranium = sdEllipsoid(x, y, z, 0, 0.11 + hy, 0.46 + hz, 0.27, 0.26, 0.29);
  const jaw = sdEllipsoid(x, y, z, 0, -0.06 + hy, 0.48 + hz, 0.25, 0.17, 0.25);
  const bridge = sdCapsule(x, y, z, 0, 0.12 + hy, 0.48 + hz, 0, -0.03 + hy, 0.80 + hz, 0.19, 0.12);

  let fur = smin(shoulder, chest, 0.14);
  fur = smin(fur, midBody, 0.16);
  fur = smin(fur, rump, 0.14);
  fur = smin(fur, cranium, 0.14);
  fur = smin(fur, jaw, 0.10);
  fur = smin(fur, bridge, 0.08);

  const earL = sdCapsule(x, y, z, -0.16, 0.28 + hy, 0.38 + hz, -0.28, 0.48 + hy - P.earBack * 0.4, 0.34 + hz - P.earBack, 0.08, 0.028);
  const earR = sdCapsule(x, y, z, 0.16, 0.28 + hy, 0.38 + hz, 0.28, 0.48 + hy - P.earBack * 0.4, 0.34 + hz - P.earBack, 0.08, 0.028);
  fur = smin(fur, Math.min(earL, earR), 0.04);

  const tail1 = sdCapsule(x, y, z, 0, 0.12 + by, -0.58, 0.04, 0.19 + by, -0.73, 0.046, 0.032);
  const tail2 = sdCapsule(x, y, z, 0.04, 0.19 + by, -0.73, -0.02, 0.08 + by, -0.77, 0.032, 0.022);
  fur = smin(fur, smin(tail1, tail2, 0.02), 0.03);

  const evalLeg = (lx: number, hipY: number, hipZ: number, leg: [number, number], isBack: boolean) => {
    const [swing, lift] = leg;
    const kneeZ = hipZ + (isBack ? -0.07 : 0.05) + swing * 0.55;
    const kneeY = hipY - 0.22 + lift * 0.55;
    const footZ = hipZ + swing;
    const footY = -0.55 + lift;
    const thigh = sdCapsule(x, y, z, lx, hipY + by, hipZ, lx, kneeY, kneeZ, isBack ? 0.15 : 0.135, 0.095);
    const shin = sdCapsule(x, y, z, lx, kneeY, kneeZ, lx, footY + 0.07, footZ, 0.088, 0.066);
    const hoof = sdCapsule(x, y, z, lx, footY + 0.06, footZ, lx, footY, footZ + 0.03, 0.068, 0.07);
    return { upper: smin(thigh, shin, 0.04), hoof };
  };

  const fl = evalLeg(0.21, -0.04, 0.22, P.fl, false);
  const fr = evalLeg(-0.21, -0.04, 0.22, P.fr, false);
  const bl = evalLeg(0.20, -0.05, -0.32, P.bl, true);
  const br = evalLeg(-0.20, -0.05, -0.32, P.br, true);

  const legsUpper = Math.min(Math.min(fl.upper, fr.upper), Math.min(bl.upper, br.upper));
  const hooves = Math.min(Math.min(fl.hoof, fr.hoof), Math.min(bl.hoof, br.hoof));
  fur = smin(fur, legsUpper, 0.08);

  let mane = sdCapsule(x, y, z, 0, 0.36 + by, 0.36 + hz * 0.5, 0, 0.54 + by, 0.26 + hz * 0.5, 0.088, 0.035);
  mane = smin(mane, sdCapsule(x, y, z, 0, 0.42 + by, 0.16, 0, 0.57 + by, 0.04, 0.088, 0.035), 0.04);
  mane = smin(mane, sdCapsule(x, y, z, 0, 0.36 + by, -0.06, 0, 0.48 + by, -0.18, 0.078, 0.03), 0.04);
  mane = smin(mane, sdCapsule(x, y, z, 0, 0.28 + by, -0.26, 0, 0.38 + by, -0.36, 0.068, 0.025), 0.04);

  const snout = sdEllipsoid(x, y, z, 0, -0.04 + hy, 0.86 + hz, 0.145, 0.125, 0.08);
  const tL = smin(
    sdCapsule(x, y, z, -0.11, -0.11 + hy, 0.57 + hz, -0.26, -0.07 + hy, 0.72 + hz, 0.048, 0.036),
    sdCapsule(x, y, z, -0.26, -0.07 + hy, 0.72 + hz, -0.29, 0.13 + hy, 0.76 + hz, 0.036, 0.015),
    0.025,
  );
  const tR = smin(
    sdCapsule(x, y, z, 0.11, -0.11 + hy, 0.57 + hz, 0.26, -0.07 + hy, 0.72 + hz, 0.048, 0.036),
    sdCapsule(x, y, z, 0.26, -0.07 + hy, 0.72 + hz, 0.29, 0.13 + hy, 0.76 + hz, 0.036, 0.015),
    0.025,
  );
  const tusks = Math.min(tL, tR);

  const dm = Math.min(fur, mane, snout, tusks, hooves);
  if (dm === hooves) return { d: hooves, mat: 'hoof' };
  if (dm === tusks) return { d: tusks, mat: 'tusk' };
  if (dm === snout) return { d: snout, mat: 'snout' };
  if (dm === mane) return { d: mane, mat: 'mane' };
  return { d: fur, mat: 'fur' };
}

function raymarchBoarView(yawDeg: number, pitchDeg: number, isPole: boolean, P: BoarPoseParams, silhouetteOnly = false): THREE.CanvasTexture {
  const pw = BOAR_PW, ph = BOAR_PH, ex = BOAR_EX, ey = BOAR_EY;
  const yaw = (yawDeg * Math.PI) / 180;
  const pitch = (pitchDeg * Math.PI) / 180;
  const cbX = -Math.sin(yaw) * Math.cos(pitch);
  const cbY = Math.sin(pitch);
  const cbZ = Math.cos(yaw) * Math.cos(pitch);

  let crX: number, crY: number, crZ: number;
  let cuX: number, cuY: number, cuZ: number;

  if (isPole) {
    const dot = cbZ;
    cuX = -dot * cbX;
    cuY = -dot * cbY;
    cuZ = 1 - dot * cbZ;
    const cul = Math.hypot(cuX, cuY, cuZ) || 1;
    cuX /= cul; cuY /= cul; cuZ /= cul;
    crX = cuY * cbZ - cuZ * cbY;
    crY = cuZ * cbX - cuX * cbZ;
    crZ = cuX * cbY - cuY * cbX;
  } else {
    crX = cbZ; crY = 0; crZ = -cbX;
    const crl = Math.hypot(crX, crY, crZ) || 1;
    crX /= crl; crY /= crl; crZ /= crl;
    cuX = cbY * crZ - cbZ * crY;
    cuY = cbZ * crX - cbX * crZ;
    cuZ = cbX * crY - cbY * crX;
  }

  const lLen = Math.hypot(0.36, 0.78, 0.5);
  const lx = (0.36 * crX + 0.78 * cuX + 0.5 * cbX) / lLen;
  const ly = (0.36 * crY + 0.78 * cuY + 0.5 * cbY) / lLen;
  const lz = (0.36 * crZ + 0.78 * cuZ + 0.5 * cbZ) / lLen;

  const rgba = new Uint8ClampedArray(pw * ph * 4);
  const eps = 0.016;
  const hy = P.headDip + P.bodyLift;
  const hz = P.headFwd;
  const maxSteps = silhouetteOnly ? 20 : 26;
  const hitEps = silhouetteOnly ? 0.015 : 0.011;
  const boundR2 = 1.28 * 1.28;

  for (let py = 0; py < ph; py++) {
    const v = (((ph - 1) * 0.5 - py) / (ph * 0.5)) * ey;
    const v2 = v * v;
    for (let px = 0; px < pw; px++) {
      const u = ((px - (pw - 1) * 0.5) / (pw * 0.5)) * ex;
      if (u * u + v2 > boundR2) continue;

      const rx = cbX * 2.5 + crX * u + cuX * v;
      const ry = cbY * 2.5 + crY * u + cuY * v - 0.02;
      const rz = cbZ * 2.5 + crZ * u + cuZ * v + 0.06;

      let hitMat = '';
      let hitD = 0;
      let hx = 0, hyHit = 0, hzHit = 0;
      let t = 1.22;
      for (let step = 0; step < maxSteps; step++) {
        const px3 = rx - cbX * t;
        const py3 = ry - cbY * t;
        const pz3 = rz - cbZ * t;
        const res = evalBoarPose(px3, py3, pz3, P);
        if (res.d < hitEps) {
          hitMat = res.mat;
          hitD = res.d;
          hx = px3; hyHit = py3; hzHit = pz3;
          break;
        }
        t += Math.max(res.d * 0.92, 0.02);
        if (t > 3.8) break;
      }
      if (!hitMat) continue;

      if (silhouetteOnly) {
        const o = (py * pw + px) * 4;
        rgba[o] = 0x1c; rgba[o + 1] = 0x14; rgba[o + 2] = 0x18; rgba[o + 3] = 255;
        continue;
      }

      let key = '2';
      if (hitMat === 'hoof') {
        key = 'k';
      } else if (hitMat === 'fur' && hzHit > 0.42 + hz && hzHit < 0.70 + hz && !isPole) {
        const exL = (hx + 0.19) / 0.048;
        const exR = (hx - 0.19) / 0.048;
        const ey0 = (hyHit - (0.10 + hy)) / 0.055;
        if (exL * exL + ey0 * ey0 < 1.0 || exR * exR + ey0 * ey0 < 1.0) key = 'k';
      } else if (hitMat === 'snout' && hzHit > 0.83 + hz) {
        const nxL = (hx + 0.052) / 0.032;
        const nxR = (hx - 0.052) / 0.032;
        const ny0 = (hyHit + 0.04 - hy) / 0.038;
        if (nxL * nxL + ny0 * ny0 < 1.0 || nxR * nxR + ny0 * ny0 < 1.0) key = 'k';
      }

      if (key !== 'k') {
        const dx = evalBoarPose(hx + eps, hyHit, hzHit, P).d - hitD;
        const dy = evalBoarPose(hx, hyHit + eps, hzHit, P).d - hitD;
        const dz = evalBoarPose(hx, hyHit, hzHit + eps, P).d - hitD;
        const nl = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
        const ndl = (dx * lx + dy * ly + dz * lz) / nl;

        if (hitMat === 'tusk') {
          key = ndl > 0.38 ? 'W' : ndl > 0.0 ? 'T' : 't';
        } else if (hitMat === 'snout') {
          key = ndl > 0.58 ? 'h' : ndl > 0.22 ? 'f' : ndl > -0.12 ? 'd' : 's';
        } else if (hitMat === 'mane') {
          key = ndl > 0.30 ? 'M' : 'm';
        } else {
          const shade = ndl * 0.65 + clamp(hyHit * 0.50, -0.28, 0.28) + 0.18;
          if (shade > 0.74) key = '4';
          else if (shade > 0.46) key = '3';
          else if (shade > 0.18) key = '2';
          else if (shade > -0.10) key = '1';
          else key = '0';
        }
      }

      const rgb = BOAR_PAL[key];
      const o = (py * pw + px) * 4;
      rgba[o] = rgb[0];
      rgba[o + 1] = rgb[1];
      rgba[o + 2] = rgb[2];
      rgba[o + 3] = 255;
    }
  }

  // Contorno pixel-art escuro de 1px ao redor da silhueta (pula em silhouetteOnly)
  const out = silhouetteOnly ? rgba : new Uint8ClampedArray(rgba);
  if (!silhouetteOnly) {
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (let y = 0; y < ph; y++) {
      for (let x = 0; x < pw; x++) {
        const i = (y * pw + x) * 4;
        if (rgba[i + 3] > 0) continue;
        for (let d = 0; d < 4; d++) {
          const nx = x + dirs[d][0], ny = y + dirs[d][1];
          if (nx < 0 || nx >= pw || ny < 0 || ny >= ph) continue;
          if (rgba[(ny * pw + nx) * 4 + 3] > 0) {
            out[i] = 0x1c; out[i + 1] = 0x14; out[i + 2] = 0x18; out[i + 3] = 255;
            break;
          }
        }
      }
    }
  }

  const tex = new THREE.DataTexture(new Uint8Array(out.buffer), pw, ph, THREE.RGBAFormat);
  tex.flipY = true;
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex as unknown as THREE.CanvasTexture;
}

const poseCache = new Map<BoarPoseName, CreatureViewPack>();

 function buildBoarPosePack(pose: BoarPoseName): CreatureViewPack {
  let pack = poseCache.get(pose);
  if (!pack) {
    const P = BOAR_POSES[pose] ?? BOAR_POSES.idle0;
    let topTex: THREE.CanvasTexture | null = null;
    let bottomTex: THREE.CanvasTexture | null = null;
    const cache = new Map<number, THREE.CanvasTexture>();
    const sunCache = new Map<number, THREE.CanvasTexture>();
    pack = {
      getTop() {
        if (!topTex) topTex = raymarchBoarView(0, 88, true, P);
        return topTex;
      },
      getBottom() {
        if (!bottomTex) bottomTex = raymarchBoarView(0, -88, true, P);
        return bottomTex;
      },
      getView(tierIdx: number, dirIdx: number, budgetAware = false, allowNullOnBudget = false) {
        const maxT = CREATURE_PITCHES.length - 1;
        const maxD = CREATURE_YAWS.length - 1;
        const t = clamp(tierIdx, 0, maxT);
        const d = clamp(dirIdx, 0, maxD);
        const key = t * 32 + d;
        let tex = cache.get(key);
        if (!tex) {
          // A troca de pose nunca espera por orçamento nem retorna uma vista antiga.
          const t0 = performance.now();
          tex = raymarchBoarView(CREATURE_YAWS[d], CREATURE_PITCHES[t], false, P);
          recordBakeCost(t0);
          cache.set(key, tex);
        }
        return tex;
      },
      getSunView(dirIdx: number, sunPitchDeg: number, budgetAware = false) {
        const maxD = CREATURE_YAWS.length - 1;
        const d = clamp(dirIdx, 0, maxD);
        const pKey = Math.round(sunPitchDeg);
        const key = pKey * 32 + d;
        let tex = sunCache.get(key);
        if (!tex) {
          if (budgetAware && !hasBakeBudget()) {
            for (let dd = 1; dd <= 8; dd++) {
              const h1 = d - dd >= 0 ? sunCache.get(pKey * 32 + (d - dd)) : undefined;
              if (h1) return h1;
              const h2 = d + dd <= maxD ? sunCache.get(pKey * 32 + (d + dd)) : undefined;
              if (h2) return h2;
            }
            return null;
          }
          const t0 = performance.now();
          tex = raymarchBoarView(CREATURE_YAWS[d], sunPitchDeg, false, P, true);
          recordBakeCost(t0);
          sunCache.set(key, tex);
        }
        return tex;
      },
    };
    poseCache.set(pose, pack);
  }
  return pack;
}

export function getBoarPosePack(...args: Parameters<typeof buildBoarPosePack>): ReturnType<typeof buildBoarPosePack> {
  return registerAnimalSpritePack(buildBoarPosePack(...args), { module: './Boar.ts', factory: 'getBoarPosePack', args }, buildBoarPosePack);
}

interface BoarSlot {
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
  depthMaterial: THREE.MeshDepthMaterial;
  mapUniform: { value: THREE.CanvasTexture };
}

type BoarState = 'idle' | 'wander' | 'windup' | 'dash' | 'recover' | 'hurt' | 'dead';

export class Boar implements Damageable {
  readonly id = newId();
  team: Team = 'enemy';
  material = 'flesh' as const;
  lockable = true;
  alive = true;
  hp = 80;
  maxHp = 80;
  deadT = 0;
  removed = false;

  readonly root = new THREE.Group();
  readonly stickRoot = new THREE.Object3D();
  readonly hurtboxes: Hurtbox[] = [];

  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private readonly geometry = new THREE.PlaneGeometry(1, 1);
  private readonly uFlashColor = { value: new THREE.Color(0xff3030) };
  private readonly uFlashAmount = { value: 0 };

  private readonly bodySlot: BoarSlot;
  private readonly sunShadowMesh: THREE.Mesh;
  private readonly sunShadowDepthMat: THREE.ShaderMaterial;
  private readonly contactShadow: THREE.Mesh;
  private readonly sunDir = new THREE.Vector3();

  private state: BoarState = 'idle';
  private stateT = 0;
  private stateDur = 1.6;
  private facing = 0;
  private readonly bodyTurn = new AnimalTurnMotion();
  private lastTurnTime = NaN;
  private renderedFacing?: number;
  private readonly motionAnimation = new AnimalMotionAnimation();
  private readonly turnQuat = new THREE.Quaternion();
  private moveYaw = 0;
  private gaitPhase = rand(0, Math.PI * 2);
  private idleClock = rand(0, 10);
  private stepDustT = 0;
  private flash = 0;
  private bodyPitch = 0;
  private chargeHitDone = false;
  private home = new THREE.Vector3();

  private readonly camPos = new THREE.Vector3();
  private readonly camBack = new THREE.Vector3();
  private readonly camUp = new THREE.Vector3();
  private readonly toCam = new THREE.Vector3();
  private readonly xAxis = new THREE.Vector3();
  private readonly yAxis = new THREE.Vector3();
  private readonly zAxis = new THREE.Vector3();
  private readonly fwd = new THREE.Vector3();
  private readonly left = new THREE.Vector3();
  private readonly up = new THREE.Vector3();
  private readonly tmp = new THREE.Vector3();
  private readonly basisMat = new THREE.Matrix4();

  constructor(private readonly ctx: GameContext, startPos: THREE.Vector3) {
    this.motor = new CharacterMotor(ctx.physics);
    this.motor.beforeMove = dt => {
      const turn = this.updateBodyTurn(dt);
      if (this.alive && this.motor.grounded && this.flash <= .35) {
        steerAnimalLocomotion(this.motor.velocity, this.facing, this.renderedFacing ?? turn.yaw);
      }
    };
    this.motor.radius = 0.56;
    this.motor.height = 0.98;
    this.motor.teleport(startPos);
    this.home.copy(startPos);
    this.facing = rand(0, Math.PI * 2);

    this.root.name = 'BoarBillboardGroup';
    this.stickRoot.position.copy(startPos);
    ctx.scene.add(this.root);
    ctx.scene.add(this.stickRoot);

    // Pré-aquece apenas 1 vista inicial no spawn (demais 46 vistas são cacheadas sob demanda)
    const initialPack = getBoarPosePack('idle0');
    const initialTex = initialPack.getView(2, 0)!;
    this.bodySlot = this.createSlot(initialTex, BOAR_PW, BOAR_PH, 'boar_body');
    const sunSh = createSunShadowBillboard(this.geometry, initialTex, 'boar_body');
    this.sunShadowMesh = sunSh.mesh;
    this.sunShadowDepthMat = sunSh.depthMat;
    this.root.add(this.sunShadowMesh);
    this.contactShadow = createContactShadow(0.42, 0.56);
    this.root.add(this.contactShadow);

    this.hurtboxes.push({
      a: new THREE.Vector3(),
      b: new THREE.Vector3(),
      radius: 0.56,
      tag: 'body',
      enabled: true,
    });
    this.syncHurtbox();
  }

  private createSlot(tex: THREE.CanvasTexture, pw: number, ph: number, name: string): BoarSlot {
    const mapUniform = { value: tex };
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uMap: mapUniform,
        uTexelSize: { value: new THREE.Vector2(1 / pw, 1 / ph) },
        uPixelSize: { value: 1 },
        uGridOrigin: { value: new THREE.Vector2() },
        uFlashColor: this.uFlashColor,
        uFlashAmount: this.uFlashAmount,
      },
      vertexShader: CREATURE_VERTEX_SHADER,
      fragmentShader: CREATURE_FRAGMENT_SHADER,
      side: THREE.DoubleSide,
      transparent: false,
      depthWrite: true,
      depthTest: true,
    });
    const depthMaterial = new THREE.MeshDepthMaterial({
      depthPacking: THREE.RGBADepthPacking,
      map: tex,
      alphaTest: 0.5,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(this.geometry, material);
    mesh.name = name;
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.customDepthMaterial = depthMaterial;
    mesh.frustumCulled = false;
    addToPixelActorLayer(mesh);
    this.root.add(mesh);
    return { mesh, material, depthMaterial, mapUniform };
  }

  private hasTex = false;
  private readonly viewAngles = new AnimalViewAngles();

  private setSlotTex(slot: BoarSlot, tex: THREE.CanvasTexture) {
    this.hasTex = true;
    if (slot.mapUniform.value !== tex) {
      slot.mapUniform.value = tex;
      const hadMap = !!slot.depthMaterial.map;
      slot.depthMaterial.map = tex;
      if (!hadMap) slot.depthMaterial.needsUpdate = true;
    }
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.set(this.position.x, this.position.y + 0.50, this.position.z);
  }

  private syncHurtbox() {
    const fx = Math.sin(this.facing), fz = Math.cos(this.facing);
    this.hurtboxes[0].a.set(this.position.x - fx * 0.36, this.position.y + 0.50, this.position.z - fz * 0.36);
    this.hurtboxes[0].b.set(this.position.x + fx * 0.46, this.position.y + 0.50, this.position.z + fz * 0.46);
    this.hurtboxes[0].enabled = this.alive;
    this.stickRoot.position.set(this.position.x, this.position.y + 0.50, this.position.z);
    this.stickRoot.rotation.y = this.facing;
  }

  receiveHit(hit: HitInfo): HitResult {
    const res = emptyResult('flesh');
    if (!this.alive) {
      res.ignored = true;
      return res;
    }
    this.hp = Math.max(0, this.hp - hit.damage);
    res.damage = hit.damage;
    this.flash = 1.0;
    this.uFlashColor.value.setHex(0xff3030);
    this.vel.x += hit.dir.x * hit.knockback * 0.7;
    this.vel.z += hit.dir.z * hit.knockback * 0.7;
    this.vel.y = Math.max(this.vel.y, hit.strength >= 0.7 ? 4.4 : 2.6);

    if (this.hp <= 0) {
      this.alive = false;
      this.state = 'dead';
      this.stateT = 0;
      res.killed = true;
    } else {
      this.state = 'hurt';
      this.stateT = 0;
      this.stateDur = 0.32;
      this.facing = Math.atan2(hit.origin.x - this.position.x, hit.origin.z - this.position.z);
    }
    return res;
  }

  update(dt: number, target: EnemyTarget | null, camera: THREE.Camera, _drawingBufferSize?: THREE.Vector2) {
    if (dt > 0) {
      this.stateT += dt;
      this.idleClock += dt;
      this.flash = Math.max(0, this.flash - dt * 4.5);

      if (!this.alive) {
        this.deadT += dt;
        this.vel.x = damp(this.vel.x, 0, 6, dt);
        this.vel.z = damp(this.vel.z, 0, 6, dt);
        this.vel.y -= 20 * dt;
        this.motor.update(dt);
        this.syncHurtbox();
        this.updateVisuals(camera);
        return;
      }

      const toTargetX = target && target.alive ? target.position.x - this.position.x : 0;
      const toTargetZ = target && target.alive ? target.position.z - this.position.z : 0;
      const dist = target && target.alive ? Math.hypot(toTargetX, toTargetZ) : 999;

      let speed = 0;
      if (this.state === 'idle') {
        this.bodyPitch = damp(this.bodyPitch, 0, 6, dt);
        if (dist < 5.0) {
          this.state = 'windup';
          this.stateT = 0;
          this.stateDur = 0.62;
        } else if (this.stateT >= this.stateDur) {
          this.state = 'wander';
          this.stateT = 0;
          this.stateDur = rand(1.8, 3.2);
          const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
          this.moveYaw = toHome > 7.5
            ? Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.4, 0.4)
            : this.facing + rand(-1.4, 1.4);
        }
      } else if (this.state === 'wander') {
        this.facing += angleDiff(this.facing, this.moveYaw) * Math.min(1, dt * 5);
        speed = 2.4;
        this.bodyPitch = damp(this.bodyPitch, 0, 8, dt);
        // Se bater em obstáculo/degrau andando, dá um pulinho!
        if (this.motor.hitWall && this.motor.grounded) {
          this.vel.y = 5.4;
        }
        if (dist < 4.8) {
          this.state = 'windup';
          this.stateT = 0;
          this.stateDur = 0.62;
        } else if (this.stateT >= this.stateDur) {
          this.state = 'idle';
          this.stateT = 0;
          this.stateDur = rand(1.4, 2.6);
        }
      } else if (this.state === 'windup') {
        const aimYaw = Math.atan2(toTargetX, toTargetZ);
        this.facing += angleDiff(this.facing, aimYaw) * Math.min(1, dt * 9);
        this.bodyPitch = damp(this.bodyPitch, -0.18, 10, dt);
        this.uFlashColor.value.setHex(0xff9840);
        this.flash = 0.2 + 0.25 * Math.sin(this.stateT * 28);
        this.stepDustT -= dt;
        if (this.stepDustT <= 0 && this.motor.grounded) {
          this.stepDustT = 0.22;
          this.ctx.events.emit('footstep', { pos: this.position.clone(), surface: this.motor.surface, intensity: 0.7, player: false });
        }
        if (this.stateT >= this.stateDur) {
          this.state = 'dash';
          this.stateT = 0;
          this.stateDur = 0.78;
          this.chargeHitDone = false;
          this.flash = 0;
          // Impulso inicial com pequeno salto de arrancada!
          if (this.motor.grounded) {
            this.vel.y = 4.0;
          }
        }
      } else if (this.state === 'dash') {
        speed = 8.4;
        this.bodyPitch = damp(this.bodyPitch, -0.14, 10, dt);
        this.stepDustT -= dt;
        if (this.stepDustT <= 0 && this.motor.grounded) {
          this.stepDustT = 0.14;
          this.ctx.events.emit('footstep', { pos: this.position.clone(), surface: this.motor.surface, intensity: 0.9, player: false });
        }
        if (!this.chargeHitDone && target && target.alive && dist < 1.15 && Math.abs(target.position.y - this.position.y) < 1.1) {
          this.chargeHitDone = true;
          const dir = new THREE.Vector3(Math.sin(this.facing), 0, Math.cos(this.facing));
          const hit: HitInfo = {
            attacker: this,
            team: 'enemy',
            tool: 'club',
            damage: 16,
            strength: 0.75,
            knockback: 7.2,
            point: target.position.clone().setY(target.position.y + 0.65),
            dir,
            normal: dir.clone().negate(),
            hurtbox: target.hurtboxes[0],
            projectile: false,
            charged: false,
            origin: this.position.clone(),
          };
          const res = target.receiveHit(hit);
          if (!res.ignored) this.ctx.events.emit('hit', { hit, result: res, target, source: 'enemy' });
        }
        if (this.stateT >= this.stateDur) {
          this.state = 'recover';
          this.stateT = 0;
          this.stateDur = 0.9;
        }
      } else if (this.state === 'recover') {
        this.bodyPitch = damp(this.bodyPitch, 0.04, 6, dt);
        if (this.stateT >= this.stateDur) {
          this.state = 'idle';
          this.stateT = 0;
          this.stateDur = 1.0;
        }
      } else if (this.state === 'hurt') {
        if (this.stateT >= this.stateDur) {
          this.state = 'windup';
          this.stateT = 0;
          this.stateDur = 0.5;
        }
      }

      const desiredX = Math.sin(this.facing) * speed;
      const desiredZ = Math.cos(this.facing) * speed;
      const accel = this.state === 'hurt' ? 5 : 11;
      this.vel.x = damp(this.vel.x, desiredX, accel, dt);
      this.vel.z = damp(this.vel.z, desiredZ, accel, dt);
      this.vel.y -= 24 * dt;
      this.motor.update(dt);
      if (this.motor.landedThisFrame && this.motor.landSpeed > 2.0) {
        this.ctx.events.emit('footstep', { pos: this.position.clone(), surface: this.motor.surface, intensity: 1.0, player: false });
      }

      const horizSpeed = Math.hypot(this.vel.x, this.vel.z);
      if (horizSpeed > 0.25) {
        this.gaitPhase += dt * (this.state === 'dash' ? 16 : 4.8 + horizSpeed * 2.0);
      }
      this.syncHurtbox();
    }

    this.updateVisuals(camera);
  }

  private pickPose(horizSpeed: number): BoarPoseName {
    if (!this.alive) return 'hurt';
    if (this.state === 'hurt') return 'hurt';
    if (!this.motor.grounded) {
      return this.vel.y >= 0 ? 'jump0' : 'jump1';
    }
    if (this.state === 'windup') {
      return sampleAnimalCycle(BOAR_WINDUP_FRAMES, this.stateT * 8.5);
    }
    if (this.state === 'dash') {
      return sampleAnimalCycle(BOAR_DASH_FRAMES, (this.gaitPhase / TWO_PI) * BOAR_DASH_FRAMES.length);
    }
    if (horizSpeed > 0.35) {
      return sampleAnimalCycle(BOAR_WALK_FRAMES, (this.gaitPhase / TWO_PI) * BOAR_WALK_FRAMES.length);
    }
    return sampleAnimalCycle(BOAR_IDLE_FRAMES, this.idleClock * 3.2);
  }

  private updateBodyTurn(dt: number) {
    if (this.lastTurnTime !== this.ctx.clock.time) {
      this.bodyTurn.update(this.facing, dt);
      this.lastTurnTime = this.ctx.clock.time;
    }
    return this.bodyTurn;
  }

  private updateVisuals(camera: THREE.Camera) {
    if (this.ctx.tuning.freezeBillboards) return;
    camera.getWorldPosition(this.camPos);
    this.camUp.setFromMatrixColumn(camera.matrixWorld, 1).normalize();
    this.camBack.setFromMatrixColumn(camera.matrixWorld, 2).normalize();
    const cameraChanged = this.viewAngles.observeCamera(
      this.camPos.x, this.camPos.y, this.camPos.z, this.camBack.x, this.camBack.y, this.camBack.z,
    );

    this.uFlashAmount.value = this.flash;

    const turn = this.updateBodyTurn(this.ctx.clock.dt);
    const fx = Math.sin(turn.yaw);
    const fz = Math.cos(turn.yaw);
    const lx = fz;
    const lz = -fx;

    const horizSpeed = Math.hypot(this.vel.x, this.vel.z);
    const runAmp = clamp(horizSpeed / 6, 0, 1);
    const bob = this.alive && this.motor.grounded ? Math.abs(Math.sin(this.gaitPhase)) * 0.04 * runAmp : 0;
    const deathSink = this.alive ? 0 : Math.min(0.24, this.deadT * 0.45);
    const turnAmount = Math.abs(turn.velocity) / turn.maxSpeed;
    const pivotBob = Math.abs(Math.sin(turn.pivotPhase)) * turnAmount * BOAR_H * .026;
    const baseY = this.position.y + 0.44 + bob + pivotBob - deathSink;

    const poseName = this.pickPose(horizSpeed);
    let pack = getBoarPosePack(poseName);
    if (this.motionAnimation.useRestPose(isAnimalLocomotionPack(pack), this.motor.horizontalSpeed, this.motor.grounded, this.alive, this.ctx.clock.dt)) {
      pack = animalRestPack(pack, this.ctx.clock.time);
    }

    const viewPitch = this.bodyPitch * 0.22;
    const cp = Math.cos(viewPitch), sp = Math.sin(viewPitch);
    this.fwd.set(fx * cp, sp, fz * cp).normalize();
    this.left.set(lx, 0, lz).normalize();
    this.up.crossVectors(this.fwd, this.left).normalize();

    this.toCam.set(this.camPos.x - this.position.x, this.camPos.y - baseY, this.camPos.z - this.position.z);
    const dSq = this.toCam.lengthSq();
    if (dSq > 1e-6) {
      this.toCam.multiplyScalar(1 / Math.sqrt(dSq));
      this.toCam.addScaledVector(this.camBack, 0.35).normalize();
    } else {
      this.toCam.copy(this.camBack);
    }

    const upDot = this.toCam.dot(this.up);
    const fwdDot = this.toCam.dot(this.fwd);
    const leftDot = this.toCam.dot(this.left);

    const { tex, flipX, isPolar } = pick27View(pack, upDot, fwdDot, leftDot, true, this.hasTex, this.viewAngles, this.ctx.clock.dt, cameraChanged);
    this.renderedFacing = turn.yaw + this.viewAngles.yawLag;
    if (isPolar) {
      this.tmp.copy(this.fwd).addScaledVector(this.camBack, -this.fwd.dot(this.camBack));
      if (this.tmp.lengthSq() > 1e-4) this.yAxis.copy(this.tmp).normalize();
      else this.yAxis.copy(this.camUp);
    } else {
      this.yAxis.copy(this.camUp);
    }

    this.zAxis.copy(this.camBack);
    this.xAxis.crossVectors(this.yAxis, this.zAxis).normalize();
    this.basisMat.makeBasis(this.xAxis, this.yAxis, this.zAxis);
    this.bodySlot.mesh.quaternion.setFromRotationMatrix(this.basisMat);
    if (!isPolar) {
      const bank = (fwdDot >= 0 ? -1 : 1) * (turn.velocity / turn.maxSpeed) * .12;
      this.turnQuat.setFromAxisAngle(this.camBack, bank);
      this.bodySlot.mesh.quaternion.premultiply(this.turnQuat);
    }
    this.bodySlot.mesh.position.set(this.position.x, baseY, this.position.z).addScaledVector(this.camBack, 0.02);
    if (tex) {
      this.setSlotTex(this.bodySlot, tex);
    }
    // Mantém escala 1:1 uniforme para cada texel casar exatamente com 1 célula quadrada do grid pixel-snap
    this.bodySlot.mesh.scale.set(flipX ? -BOAR_W : BOAR_W, BOAR_H, 1);
    const groundLift = this.motor.grounded
      ? keepAnimalAboveGround(this.bodySlot.mesh, this.bodySlot.mapUniform.value, this.motor.groundY)
      : 0;

    // Plano de sombra virado para o Sol com o sprite exato da pose atual visto pelo Sol (alfa recortado)
    getSunDir(this.ctx.scene, this.sunDir);
    updateSunShadowBillboard(
      this.sunShadowMesh, this.sunShadowDepthMat, pack,
      this.position, baseY + groundLift, BOAR_W, BOAR_H,
      this.fwd, this.left, this.up, this.sunDir,
    );
    const airFade = clamp(1 - Math.max(0, this.position.y) * 0.45, 0.25, 1);
    this.contactShadow.position.set(this.position.x, this.motor.groundY + 0.016, this.position.z);
    this.contactShadow.rotation.y = this.facing;
    this.contactShadow.scale.set(0.84 * airFade, 1, 1.12 * airFade);
    (this.contactShadow.material as THREE.MeshBasicMaterial).opacity = airFade;

  }

  dispose() {
    this.root.removeFromParent();
    this.stickRoot.removeFromParent();
    this.geometry.dispose();
    this.bodySlot.material.dispose();
    this.bodySlot.depthMaterial.dispose();
    this.sunShadowDepthMat.dispose();
    (this.contactShadow.material as THREE.Material).dispose();
  }
}
