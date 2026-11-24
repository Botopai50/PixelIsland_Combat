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
// 1. CORUJA (Owl) — 34×32 @ ANIMAL_PPU
// ============================================================================
export type OwlPoseName =
  | 'perch0' | 'perch1' | 'perch2'
  | 'hoot0' | 'hoot1' | 'hoot2' | 'hoot3'
  | 'flap0' | 'flap1' | 'flap2' | 'flap3'
  | 'glide0' | 'glide1';

export const OWL_PW = 34;
export const OWL_PH = 32;
export const OWL_W = OWL_PW / ANIMAL_PPU;
export const OWL_H = OWL_PH / ANIMAL_PPU;

const OWL_PAL: Record<string, [number, number, number]> = {
  k:  [0x18, 0x13, 0x12], // contorno / pupila / ponta das garras
  b0: [0x3d, 0x26, 0x19], // marrom-escuro dorsal / pontas das asas / tufos
  b1: [0x66, 0x41, 0x28], // marrom-quente médio
  b2: [0x8f, 0x60, 0x3b], // castanho-avelã iluminado
  b3: [0xb5, 0x82, 0x54], // brilho quente nas penas
  c0: [0xa6, 0x90, 0x72], // creme sombreado (disco facial / barriga)
  c1: [0xd4, 0xbe, 0x9c], // creme médio
  c2: [0xf2, 0xe4, 0xc9], // creme claro / sobrancelhas
  e:  [0xff, 0xb8, 0x20], // olhos grandes âmbar-dourados
  bk: [0xd8, 0xa8, 0x38], // bico curvo dourado
  ft: [0x8c, 0x6a, 0x3e], // patas/garras
};

interface OwlPose {
  bodyY: number;
  bodyPitch: number; // inclinação para frente no voo
  headYaw: number;
  headY: number;
  puff: number;      // estufa peito no pio
  wingSpread: number; // 0 = recolhida, 1 = aberta
  wingLift: number;   // -1 = batida p/ baixo, +1 = batida p/ cima
  tailFan: number;
  legsTuck: number;
}

const OWL_POSES: Record<OwlPoseName, OwlPose> = {
  perch0: { bodyY: 0.0,   bodyPitch: 0.0,  headYaw: 0.0,   headY: 0.0,   puff: 0.0,  wingSpread: 0.0,  wingLift: 0.0,   tailFan: 0.0,  legsTuck: 0.0 },
  perch1: { bodyY: 0.015, bodyPitch: 0.0,  headYaw: 0.16,  headY: 0.015, puff: 0.05, wingSpread: 0.0,  wingLift: 0.0,   tailFan: 0.0,  legsTuck: 0.0 },
  perch2: { bodyY: -0.01, bodyPitch: 0.0,  headYaw: -0.16, headY: -0.01, puff: 0.0,  wingSpread: 0.0,  wingLift: 0.0,   tailFan: 0.0,  legsTuck: 0.0 },

  hoot0:  { bodyY: 0.01,  bodyPitch: 0.06, headYaw: 0.0,   headY: 0.03,  puff: 0.25, wingSpread: 0.08, wingLift: -0.05, tailFan: 0.10, legsTuck: 0.0 },
  hoot1:  { bodyY: 0.025, bodyPitch: 0.10, headYaw: 0.0,   headY: 0.05,  puff: 0.55, wingSpread: 0.14, wingLift: -0.08, tailFan: 0.18, legsTuck: 0.0 },
  hoot2:  { bodyY: 0.03,  bodyPitch: 0.12, headYaw: 0.04,  headY: 0.055, puff: 0.65, wingSpread: 0.16, wingLift: -0.08, tailFan: 0.22, legsTuck: 0.0 },
  hoot3:  { bodyY: 0.01,  bodyPitch: 0.05, headYaw: -0.03, headY: 0.02,  puff: 0.20, wingSpread: 0.06, wingLift: -0.04, tailFan: 0.08, legsTuck: 0.0 },

  flap0:  { bodyY: 0.02,  bodyPitch: 0.48, headYaw: 0.0,   headY: -0.02, puff: 0.0,  wingSpread: 0.92, wingLift: 0.72,  tailFan: 0.45, legsTuck: 0.75 },
  flap1:  { bodyY: 0.05,  bodyPitch: 0.52, headYaw: 0.0,   headY: -0.02, puff: 0.0,  wingSpread: 1.0,  wingLift: 0.12,  tailFan: 0.52, legsTuck: 0.85 },
  flap2:  { bodyY: -0.02, bodyPitch: 0.56, headYaw: 0.0,   headY: -0.03, puff: 0.0,  wingSpread: 0.95, wingLift: -0.68, tailFan: 0.55, legsTuck: 0.90 },
  flap3:  { bodyY: 0.0,   bodyPitch: 0.50, headYaw: 0.0,   headY: -0.02, puff: 0.0,  wingSpread: 0.85, wingLift: -0.10, tailFan: 0.48, legsTuck: 0.80 },

  glide0: { bodyY: 0.02,  bodyPitch: 0.55, headYaw: 0.0,   headY: -0.02, puff: 0.0,  wingSpread: 1.0,  wingLift: 0.16,  tailFan: 0.60, legsTuck: 0.92 },
  glide1: { bodyY: 0.04,  bodyPitch: 0.52, headYaw: 0.05,  headY: -0.01, puff: 0.0,  wingSpread: 1.0,  wingLift: 0.24,  tailFan: 0.65, legsTuck: 0.92 },
};

const owlCache = new Map<OwlPoseName, Boar27Pack>();
 function buildOwlPosePack(pose: OwlPoseName): Boar27Pack {
  let pack = owlCache.get(pose);
  if (!pack) {
    const P = OWL_POSES[pose];
    const cosB = Math.cos(P.bodyPitch);
    const sinB = Math.sin(P.bodyPitch);
    const cosH = Math.cos(P.headYaw);
    const sinH = Math.sin(P.headYaw);
    const by = P.bodyY;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // Rotaciona tronco para frente durante voo/planagem
      const dy = y - by;
      const bz = z * cosB - dy * sinB;
      const byr = z * sinB + dy * cosB;

      // 1. Torso roliço de coruja + peito estufado
      const puffR = P.puff * 0.05;
      const torso = sdEllipsoid(x, byr, bz, 0, -0.02, 0.0, 0.23 + puffR, 0.30, 0.21 + puffR);
      const chest = sdEllipsoid(x, byr, bz, 0, 0.05, 0.10, 0.19 + puffR, 0.20, 0.15 + puffR);

      // 2. Cauda em leque
      const tailW = 0.12 + P.tailFan * 0.12;
      const tail = sdEllipsoid(x, byr, bz, 0, -0.26, -0.18 - P.tailFan * 0.06, tailW, 0.08, 0.20);

      let bodyD = smin(torso, chest, 0.08);
      bodyD = smin(bodyD, tail, 0.05);

      // 3. Cabeça redonda com tufos de orelha (coruja-orelhuda)
      const hY0 = 0.31 + P.headY;
      const hZ0 = 0.04;
      const hx0 = x;
      const hy0 = byr - hY0;
      const hz0 = bz - hZ0;
      const hx = hx0 * cosH - hz0 * sinH;
      const hz = hx0 * sinH + hz0 * cosH;
      const hy = hy0;

      const head = sdEllipsoid(hx, hy, hz, 0, 0.0, 0.0, 0.22, 0.19, 0.20);
      const tuftL = sdCapsule(hx, hy, hz, -0.13, 0.13, 0.02, -0.21, 0.27, -0.03, 0.045, 0.014);
      const tuftR = sdCapsule(hx, hy, hz,  0.13, 0.13, 0.02,  0.21, 0.27, -0.03, 0.045, 0.014);
      const headFull = smin(head, Math.min(tuftL, tuftR), 0.03);
      bodyD = smin(bodyD, headFull, 0.06);

      // 4. Asas (recolhidas junto ao corpo ou abertas batendo/planando)
      let wingsD: number;
      if (P.wingSpread < 0.2) {
        const wOff = P.wingSpread * 0.12;
        const wL = sdEllipsoid(x, byr, bz, -0.22 - wOff, -0.03, -0.03, 0.085, 0.25, 0.16);
        const wR = sdEllipsoid(x, byr, bz,  0.22 + wOff, -0.03, -0.03, 0.085, 0.25, 0.16);
        wingsD = Math.min(wL, wR);
      } else {
        const sp = P.wingSpread;
        const wl = P.wingLift;
        const midX = 0.44 * sp;
        const midY = 0.08 + wl * 0.24;
        const tipX = 0.78 * sp;
        const tipY = 0.04 + wl * 0.46;
        const wInL = sdCapsule(x, byr, bz, -0.18, 0.06, -0.02, -midX, midY, -0.05, 0.10, 0.085);
        const wOutL = sdCapsule(x, byr, bz, -midX, midY, -0.05, -tipX, tipY, -0.12, 0.082, 0.035);
        const wInR = sdCapsule(x, byr, bz,  0.18, 0.06, -0.02,  midX, midY, -0.05, 0.10, 0.085);
        const wOutR = sdCapsule(x, byr, bz,  midX, midY, -0.05,  tipX, tipY, -0.12, 0.082, 0.035);
        wingsD = Math.min(smin(wInL, wOutL, 0.04), smin(wInR, wOutR, 0.04));
      }
      bodyD = smin(bodyD, wingsD, 0.04);

      // 5. Patas e garras
      const footY = -0.34 + P.legsTuck * 0.12;
      const footZ = 0.04 - P.legsTuck * 0.12;
      const legL = sdCapsule(x, byr, bz, -0.09, -0.24, 0.02, -0.10, footY, footZ, 0.045, 0.032);
      const legR = sdCapsule(x, byr, bz,  0.09, -0.24, 0.02,  0.10, footY, footZ, 0.045, 0.032);
      const feetD = Math.min(legL, legR);

      // 6. Olhos grandes âmbar + bico curvo
      const eyeL = sdEllipsoid(hx, hy, hz, -0.088, 0.025, 0.165, 0.058, 0.058, 0.042);
      const eyeR = sdEllipsoid(hx, hy, hz,  0.088, 0.025, 0.165, 0.058, 0.058, 0.042);
      const eyesD = Math.min(eyeL, eyeR);
      const beakD = sdCapsule(hx, hy, hz, 0, 0.0, 0.17, 0, -0.055, 0.245, 0.042, 0.014);

      let d = bodyD, mat = 'plumage';
      if (wingsD < bodyD + 0.004 && Math.abs(x) > 0.20) mat = 'wing';
      if (feetD < d) { d = feetD; mat = 'foot'; }
      if (beakD < d) { d = beakD; mat = 'beak'; }
      if (eyesD < d) { d = eyesD; mat = 'eye'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      const dy = y - by;
      const bz = z * cosB - dy * sinB;
      const byr = z * sinB + dy * cosB;
      const hx0 = x;
      const hy = byr - (0.31 + P.headY);
      const hz0 = bz - 0.04;
      const hx = hx0 * cosH - hz0 * sinH;
      const hz = hx0 * sinH + hz0 * cosH;

      if (mat === 'eye') {
        // Pupila escura central no olho grande âmbar
        const distEye = Math.min(
          Math.hypot(hx + 0.088, hy - 0.025),
          Math.hypot(hx - 0.088, hy - 0.025),
        );
        return distEye < 0.028 && hz > 0.175 ? 'k' : 'e';
      }
      if (mat === 'beak') return shade > 0.45 ? 'bk' : 'b1';
      if (mat === 'foot') return 'ft';

      if (mat === 'wing') {
        const stripe = Math.sin(Math.abs(x) * 18 + bz * 10) > 0.35;
        if (stripe) return 'b0';
        return shade > 0.65 ? 'b2' : shade > 0.35 ? 'b1' : 'b0';
      }

      // Disco facial creme ao redor dos olhos
      if (hz > 0.08 && Math.abs(hx) < 0.17 && hy > -0.10 && hy < 0.12) {
        return shade > 0.60 ? 'c2' : shade > 0.32 ? 'c1' : 'c0';
      }

      // Peito/barriga creme com pintinhas marrons
      if (bz > 0.04 && byr < 0.20 && byr > -0.24 && Math.abs(x) < 0.17) {
        const speck = Math.sin(x * 26) * Math.cos(byr * 24) > 0.48;
        if (speck) return 'b1';
        return shade > 0.62 ? 'c2' : shade > 0.34 ? 'c1' : 'c0';
      }

      // Tufos das orelhas mais escuros
      if (hy > 0.16) return shade > 0.6 ? 'b1' : 'b0';

      return shade > 0.74 ? 'b3' : shade > 0.48 ? 'b2' : shade > 0.24 ? 'b1' : 'b0';
    };

    pack = build27Pack(OWL_PW, OWL_PH, 0.90, 0.84, OWL_PAL, evalFn, shadeFn);
    owlCache.set(pose, pack);
  }
  return pack;
}

export function getOwlPosePack(...args: Parameters<typeof buildOwlPosePack>): ReturnType<typeof buildOwlPosePack> {
  return registerAnimalSpritePack(buildOwlPosePack(...args), { module: './ForestAnimals.ts', factory: 'getOwlPosePack', args }, buildOwlPosePack);
}

// ============================================================================
// 2. ESQUILO (Squirrel) — 28×26 @ ANIMAL_PPU
// ============================================================================
export type SquirrelPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'nibble0' | 'nibble1' | 'nibble2' | 'nibble3'
  | 'hop0' | 'hop1' | 'hop2' | 'hop3';

export const SQUIRREL_PW = 28;
export const SQUIRREL_PH = 26;
export const SQUIRREL_W = SQUIRREL_PW / ANIMAL_PPU;
export const SQUIRREL_H = SQUIRREL_PH / ANIMAL_PPU;

const SQUIRREL_PAL: Record<string, [number, number, number]> = {
  k:  [0x1b, 0x12, 0x11], // contorno / olhos brilhantes / nariz
  r0: [0x6e, 0x29, 0x14], // castanho-avermelhado escuro
  r1: [0xa6, 0x42, 0x1e], // ruivo médio
  r2: [0xd4, 0x61, 0x2b], // ruivo vivo
  r3: [0xf0, 0x8b, 0x48], // destaque quente
  c0: [0xc9, 0xb8, 0x9c], // barriga creme sombra
  c1: [0xf2, 0xe8, 0xd5], // barriga/peito creme claro
  t0: [0x82, 0x32, 0x16], // cauda felpuda sombra
  t1: [0xc4, 0x56, 0x24], // cauda felpuda média
  t2: [0xeb, 0x85, 0x44], // ponta iluminada da cauda
  ac: [0x6b, 0x45, 0x22], // bolota (nibble)
};

interface SquirrelPose {
  bodyY: number;
  upright: number;  // 0 = quadrúpede, 1 = sentado comendo
  headY: number;
  tailCurl: number;
  tailSway: number;
  fl: number;
  fr: number;
  bl: number;
  br: number;
  holdingAcorn: boolean;
}

const SQUIRREL_POSES: Record<SquirrelPoseName, SquirrelPose> = {
  idle0:   { bodyY: 0.0,   upright: 0.15, headY: 0.0,   tailCurl: 0.0,  tailSway: 0.0,   fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0,   holdingAcorn: false },
  idle1:   { bodyY: 0.015, upright: 0.22, headY: 0.025, tailCurl: 0.08, tailSway: 0.07,  fl: 0.02,  fr: -0.02, bl: 0.0,   br: 0.0,   holdingAcorn: false },
  idle2:   { bodyY: -0.01, upright: 0.12, headY: -0.01, tailCurl: -0.04,tailSway: -0.07, fl: -0.02, fr: 0.02,  bl: 0.0,   br: 0.0,   holdingAcorn: false },

  nibble0: { bodyY: 0.02,  upright: 0.90, headY: 0.0,   tailCurl: 0.14, tailSway: 0.03,  fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0,   holdingAcorn: true },
  nibble1: { bodyY: 0.03,  upright: 0.95, headY: -0.03, tailCurl: 0.18, tailSway: -0.03, fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0,   holdingAcorn: true },
  nibble2: { bodyY: 0.025, upright: 0.92, headY: 0.01,  tailCurl: 0.12, tailSway: 0.04,  fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0,   holdingAcorn: true },
  nibble3: { bodyY: 0.02,  upright: 0.90, headY: -0.02, tailCurl: 0.16, tailSway: -0.02, fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0,   holdingAcorn: true },

  hop0:    { bodyY: -0.04, upright: 0.0,  headY: -0.03, tailCurl: -0.10,tailSway: 0.0,   fl: 0.12,  fr: 0.10,  bl: 0.14,  br: 0.12,  holdingAcorn: false },
  hop1:    { bodyY: 0.05,  upright: 0.0,  headY: 0.02,  tailCurl: -0.25,tailSway: 0.04,  fl: 0.28,  fr: 0.24,  bl: -0.26, br: -0.22, holdingAcorn: false },
  hop2:    { bodyY: 0.07,  upright: 0.0,  headY: 0.01,  tailCurl: -0.32,tailSway: 0.0,   fl: 0.32,  fr: 0.28,  bl: -0.32, br: -0.28, holdingAcorn: false },
  hop3:    { bodyY: -0.01, upright: 0.0,  headY: -0.02, tailCurl: -0.08,tailSway: -0.04, fl: 0.20,  fr: 0.18,  bl: -0.06, br: -0.04, holdingAcorn: false },
};

const squirrelCache = new Map<SquirrelPoseName, Boar27Pack>();
 function buildSquirrelPosePack(pose: SquirrelPoseName): Boar27Pack {
  let pack = squirrelCache.get(pose);
  if (!pack) {
    const P = SQUIRREL_POSES[pose];
    const by = P.bodyY;
    const up = P.upright;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // 1. Corpo ágil (levanta o tronco na pose sentado/nibble)
      const bodyY = -0.08 + by + up * 0.10;
      const bodyZ = 0.0 - up * 0.06;
      const rump = sdEllipsoid(x, y, z, 0, -0.12 + by, -0.14, 0.19, 0.18, 0.20);
      const torso = sdEllipsoid(x, y, z, 0, bodyY, bodyZ + 0.06, 0.16, 0.16 + up * 0.05, 0.22 - up * 0.05);

      // 2. Cabeça expressiva + orelhas pontudas
      const hY = 0.12 + by + up * 0.20 + P.headY;
      const hZ = 0.26 - up * 0.14;
      const head = sdEllipsoid(x, y, z, 0, hY, hZ, 0.14, 0.125, 0.15);
      const snout = sdEllipsoid(x, y, z, 0, hY - 0.02, hZ + 0.13, 0.075, 0.06, 0.085);
      const earL = sdCapsule(x, y, z, -0.09, hY + 0.08, hZ - 0.02, -0.12, hY + 0.21, hZ - 0.04, 0.042, 0.016);
      const earR = sdCapsule(x, y, z,  0.09, hY + 0.08, hZ - 0.02,  0.12, hY + 0.21, hZ - 0.04, 0.042, 0.016);

      let fur = smin(rump, torso, 0.08);
      fur = smin(fur, head, 0.06);
      fur = smin(fur, snout, 0.035);
      fur = smin(fur, Math.min(earL, earR), 0.02);

      // 3. Cauda enorme, felpuda e enrolada em S (marca registrada do esquilo)
      const tc = P.tailCurl;
      const ts = P.tailSway;
      const t1 = sdCapsule(x, y, z, 0, -0.10 + by, -0.28, ts * 0.4, 0.10 + by + tc * 0.12, -0.44, 0.09, 0.145);
      const t2 = sdCapsule(x, y, z, ts * 0.4, 0.10 + by + tc * 0.12, -0.44, ts * 0.85, 0.36 + by + tc * 0.18, -0.34 + tc * 0.14, 0.145, 0.155);
      const t3 = sdCapsule(x, y, z, ts * 0.85, 0.36 + by + tc * 0.18, -0.34 + tc * 0.14, ts, 0.44 + by + tc * 0.10, -0.14 + tc * 0.24, 0.14, 0.095);
      const tailD = smin(smin(t1, t2, 0.06), t3, 0.06);
      fur = smin(fur, tailD, 0.05);

      // 4. Patinhas
      let frontLegs: number;
      if (P.holdingAcorn) {
        const fl = sdCapsule(x, y, z, -0.10, 0.06 + by, 0.06, -0.06, hY - 0.10, hZ + 0.12, 0.045, 0.032);
        const fr = sdCapsule(x, y, z,  0.10, 0.06 + by, 0.06,  0.06, hY - 0.10, hZ + 0.12, 0.045, 0.032);
        frontLegs = Math.min(fl, fr);
      } else {
        const fl = sdCapsule(x, y, z, -0.10, -0.10 + by, 0.16, -0.10, -0.34, 0.20 + P.fl, 0.048, 0.032);
        const fr = sdCapsule(x, y, z,  0.10, -0.10 + by, 0.16,  0.10, -0.34, 0.20 + P.fr, 0.048, 0.032);
        frontLegs = Math.min(fl, fr);
      }
      const bl = sdCapsule(x, y, z, -0.12, -0.14 + by, -0.14, -0.12, -0.34, -0.08 + P.bl, 0.065, 0.038);
      const br = sdCapsule(x, y, z,  0.12, -0.14 + by, -0.14,  0.12, -0.34, -0.08 + P.br, 0.065, 0.038);
      fur = smin(fur, Math.min(frontLegs, Math.min(bl, br)), 0.035);

      // 5. Olhos, nariz e bolota opcional
      const eyeL = sdEllipsoid(x, y, z, -0.095, hY + 0.025, hZ + 0.085, 0.034, 0.034, 0.034);
      const eyeR = sdEllipsoid(x, y, z,  0.095, hY + 0.025, hZ + 0.085, 0.034, 0.034, 0.034);
      const nose = sdEllipsoid(x, y, z, 0, hY - 0.015, hZ + 0.205, 0.028, 0.024, 0.024);
      const acorn = P.holdingAcorn
        ? sdEllipsoid(x, y, z, 0, hY - 0.10, hZ + 0.16, 0.052, 0.058, 0.052)
        : 99;

      let d = fur, mat = 'fur';
      if (tailD < fur + 0.005 && z < -0.22) mat = 'tail';
      if (acorn < d) { d = acorn; mat = 'acorn'; }
      if (Math.min(eyeL, eyeR) < d) { d = Math.min(eyeL, eyeR); mat = 'eye'; }
      if (nose < d) { d = nose; mat = 'nose'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'eye' || mat === 'nose') return 'k';
      if (mat === 'acorn') return 'ac';
      if (mat === 'tail') {
        return shade > 0.66 ? 't2' : shade > 0.34 ? 't1' : 't0';
      }
      // Barriga e peito creme claro
      if (y < -0.08 + by + up * 0.14 && z > -0.14 && Math.abs(x) < 0.11) {
        return shade > 0.48 ? 'c1' : 'c0';
      }
      return shade > 0.74 ? 'r3' : shade > 0.48 ? 'r2' : shade > 0.24 ? 'r1' : 'r0';
    };

    pack = build27Pack(SQUIRREL_PW, SQUIRREL_PH, 0.76, 0.72, SQUIRREL_PAL, evalFn, shadeFn);
    squirrelCache.set(pose, pack);
  }
  return pack;
}

export function getSquirrelPosePack(...args: Parameters<typeof buildSquirrelPosePack>): ReturnType<typeof buildSquirrelPosePack> {
  return registerAnimalSpritePack(buildSquirrelPosePack(...args), { module: './ForestAnimals.ts', factory: 'getSquirrelPosePack', args }, buildSquirrelPosePack);
}

// ============================================================================
// 3. TEXUGO (Badger) — 42×28 @ ANIMAL_PPU
// ============================================================================
export type BadgerPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'dig0' | 'dig1' | 'dig2' | 'dig3'
  | 'walk0' | 'walk1' | 'walk2' | 'walk3' | 'walk4' | 'walk5'
  | 'hiss0' | 'hiss1' | 'hiss2';

export const BADGER_PW = 42;
export const BADGER_PH = 28;
export const BADGER_W = BADGER_PW / ANIMAL_PPU;
export const BADGER_H = BADGER_PH / ANIMAL_PPU;

const BADGER_PAL: Record<string, [number, number, number]> = {
  k:  [0x14, 0x15, 0x18], // contorno / listras faciais pretas / patas / barriga
  b0: [0x22, 0x24, 0x2b], // preto-carvão sombreado
  b1: [0x38, 0x3b, 0x45], // cinza-chumbo escuro
  g0: [0x5c, 0x60, 0x6b], // dorso grisalho escuro
  g1: [0x88, 0x8d, 0x99], // dorso grisalho médio
  g2: [0xb8, 0xbd, 0xc7], // dorso prateado iluminado
  w0: [0xc4, 0xc9, 0xd4], // listra branca sombreada
  W:  [0xef, 0xf1, 0xf5], // branco puro da face e pontas das orelhas
  c0: [0x9e, 0x96, 0x88], // garras de escavação
  m:  [0x78, 0x22, 0x2b], // interior da boca no rosnado
};

interface BadgerPose {
  bodyY: number;
  headY: number;
  headZ: number;
  headX: number;
  snarl: number;
  fl: number;
  fr: number;
  bl: number;
  br: number;
  flLift: number;
  frLift: number;
}

const BADGER_POSES: Record<BadgerPoseName, BadgerPose> = {
  idle0: { bodyY: 0.0,   headY: 0.0,   headZ: 0.0,  headX: 0.0,   snarl: 0.0, fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0,   flLift: 0.0,  frLift: 0.0 },
  idle1: { bodyY: 0.012, headY: 0.015, headZ: 0.01, headX: 0.025, snarl: 0.0, fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0,   flLift: 0.0,  frLift: 0.0 },
  idle2: { bodyY: -0.01, headY: -0.015,headZ: 0.02, headX: -0.025,snarl: 0.0, fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0,   flLift: 0.0,  frLift: 0.0 },

  dig0:  { bodyY: -0.02, headY: -0.10, headZ: 0.04, headX: 0.0,   snarl: 0.0, fl: 0.18,  fr: -0.02, bl: 0.0,   br: 0.0,   flLift: 0.14, frLift: 0.0 },
  dig1:  { bodyY: -0.03, headY: -0.12, headZ: 0.05, headX: -0.02, snarl: 0.0, fl: -0.06, fr: 0.16,  bl: 0.0,   br: 0.0,   flLift: 0.0,  frLift: 0.14 },
  dig2:  { bodyY: -0.02, headY: -0.11, headZ: 0.04, headX: 0.02,  snarl: 0.0, fl: 0.16,  fr: -0.05, bl: 0.0,   br: 0.0,   flLift: 0.12, frLift: 0.0 },
  dig3:  { bodyY: -0.01, headY: -0.08, headZ: 0.03, headX: 0.0,   snarl: 0.0, fl: 0.02,  fr: 0.04,  bl: 0.0,   br: 0.0,   flLift: 0.0,  frLift: 0.04 },

  walk0: { bodyY: 0.01,  headY: 0.0,   headZ: 0.02, headX: 0.015, snarl: 0.0, fl: 0.16,  fr: -0.12, bl: -0.14, br: 0.14,  flLift: 0.06, frLift: 0.0 },
  walk1: { bodyY: 0.02,  headY: 0.01,  headZ: 0.02, headX: 0.01,  snarl: 0.0, fl: 0.08,  fr: -0.04, bl: -0.06, br: 0.08,  flLift: 0.02, frLift: 0.04 },
  walk2: { bodyY: -0.01, headY: -0.01, headZ: 0.01, headX: -0.01, snarl: 0.0, fl: -0.04, fr: 0.08,  bl: 0.06,  br: -0.04, flLift: 0.0,  frLift: 0.06 },
  walk3: { bodyY: 0.01,  headY: 0.0,   headZ: 0.02, headX: -0.015,snarl: 0.0, fl: -0.12, fr: 0.16,  bl: 0.14,  br: -0.14, flLift: 0.0,  frLift: 0.06 },
  walk4: { bodyY: 0.02,  headY: 0.01,  headZ: 0.02, headX: -0.01, snarl: 0.0, fl: -0.04, fr: 0.08,  bl: 0.08,  br: -0.06, flLift: 0.04, frLift: 0.02 },
  walk5: { bodyY: -0.01, headY: -0.01, headZ: 0.01, headX: 0.01,  snarl: 0.0, fl: 0.08,  fr: -0.04, bl: -0.04, br: 0.06,  flLift: 0.06, frLift: 0.0 },

  hiss0: { bodyY: -0.04, headY: -0.04, headZ: 0.06, headX: 0.0,   snarl: 0.55,fl: 0.10,  fr: 0.08,  bl: -0.04, br: -0.04, flLift: 0.0,  frLift: 0.0 },
  hiss1: { bodyY: 0.02,  headY: 0.0,   headZ: 0.10, headX: 0.0,   snarl: 1.0, fl: 0.22,  fr: 0.18,  bl: -0.14, br: -0.12, flLift: 0.12, frLift: 0.08 },
  hiss2: { bodyY: -0.02, headY: -0.03, headZ: 0.08, headX: 0.0,   snarl: 0.85,fl: 0.14,  fr: 0.12,  bl: -0.08, br: -0.08, flLift: 0.04, frLift: 0.04 },
};

const badgerCache = new Map<BadgerPoseName, Boar27Pack>();
 function buildBadgerPosePack(pose: BadgerPoseName): Boar27Pack {
  let pack = badgerCache.get(pose);
  if (!pack) {
    const P = BADGER_POSES[pose];
    const by = P.bodyY;
    const hy = P.headY + by;
    const hz = P.headZ;
    const hx = P.headX;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // 1. Corpo baixo, largo e atarracado (wedge-shaped woodland badger)
      const back = sdEllipsoid(x, y, z, 0, -0.02 + by, -0.06, 0.31, 0.23, 0.42);
      const rump = sdEllipsoid(x, y, z, 0, -0.04 + by, -0.34, 0.28, 0.21, 0.24);
      const shoulders = sdEllipsoid(x, y, z, 0, -0.03 + by, 0.22, 0.27, 0.21, 0.22);
      const tail = sdCapsule(x, y, z, 0, -0.06 + by, -0.50, 0, -0.12 + by, -0.66, 0.08, 0.045);

      // 2. Pescoço grosso + cabeça cônica com orelhas arredondadas
      const neck = sdCapsule(x, y, z, 0, -0.02 + by, 0.30, hx, 0.01 + hy, 0.48 + hz, 0.18, 0.145);
      const head = sdEllipsoid(x, y, z, hx, 0.01 + hy, 0.54 + hz, 0.155, 0.135, 0.175);
      const snout = sdCapsule(x, y, z, hx, -0.01 + hy, 0.62 + hz, hx, -0.03 + hy, 0.80 + hz, 0.09, 0.048);
      const earL = sdEllipsoid(x, y, z, hx - 0.115, 0.13 + hy, 0.49 + hz, 0.048, 0.048, 0.035);
      const earR = sdEllipsoid(x, y, z, hx + 0.115, 0.13 + hy, 0.49 + hz, 0.048, 0.048, 0.035);

      let fur = smin(back, rump, 0.10);
      fur = smin(fur, shoulders, 0.09);
      fur = smin(fur, tail, 0.05);
      fur = smin(fur, neck, 0.07);
      fur = smin(fur, head, 0.06);
      fur = smin(fur, snout, 0.04);
      fur = smin(fur, Math.min(earL, earR), 0.02);

      // 3. Pernas curtas e musculosas + garras longas de escavação
      const fl = sdCapsule(x, y, z, -0.19, -0.12 + by, 0.22, -0.20, -0.36 + P.flLift, 0.26 + P.fl, 0.095, 0.072);
      const fr = sdCapsule(x, y, z,  0.19, -0.12 + by, 0.22,  0.20, -0.36 + P.frLift, 0.26 + P.fr, 0.095, 0.072);
      const bl = sdCapsule(x, y, z, -0.20, -0.12 + by, -0.26, -0.20, -0.36, -0.24 + P.bl, 0.10, 0.074);
      const br = sdCapsule(x, y, z,  0.20, -0.12 + by, -0.26,  0.20, -0.36, -0.24 + P.br, 0.10, 0.074);
      fur = smin(fur, Math.min(Math.min(fl, fr), Math.min(bl, br)), 0.045);

      const clawFL = sdEllipsoid(x, y, z, -0.20, -0.38 + P.flLift, 0.34 + P.fl, 0.058, 0.028, 0.042);
      const clawFR = sdEllipsoid(x, y, z,  0.20, -0.38 + P.frLift, 0.34 + P.fr, 0.058, 0.028, 0.042);
      const clawsD = Math.min(clawFL, clawFR);

      // 4. Olhos, nariz e boca rosnando
      const eyeL = sdEllipsoid(x, y, z, hx - 0.088, 0.045 + hy, 0.65 + hz, 0.028, 0.026, 0.028);
      const eyeR = sdEllipsoid(x, y, z, hx + 0.088, 0.045 + hy, 0.65 + hz, 0.028, 0.026, 0.028);
      const nose = sdEllipsoid(x, y, z, hx, -0.025 + hy, 0.83 + hz, 0.036, 0.030, 0.028);
      const mouthD = P.snarl > 0.2
        ? sdEllipsoid(x, y, z, hx, -0.07 + hy, 0.72 + hz, 0.055, 0.025 + P.snarl * 0.025, 0.065)
        : 99;

      let d = fur, mat = 'fur';
      if (clawsD < d) { d = clawsD; mat = 'claw'; }
      if (mouthD < d) { d = mouthD; mat = 'mouth'; }
      if (Math.min(eyeL, eyeR) < d) { d = Math.min(eyeL, eyeR); mat = 'eye'; }
      if (nose < d) { d = nose; mat = 'nose'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'eye' || mat === 'nose') return 'k';
      if (mat === 'claw') return 'c0';
      if (mat === 'mouth') return 'm';

      // Cabeça: padrão icônico preto-e-branco listrado do texugo
      if (z > 0.38 + hz) {
        const ax = Math.abs(x - hx);
        // Pontas brancas das orelhas
        if (y > 0.145 + hy && ax > 0.08) return shade > 0.45 ? 'W' : 'w0';
        // Faixa branca central da testa até o focinho
        if (ax < 0.048 && y > -0.03 + hy) return shade > 0.45 ? 'W' : 'w0';
        // Listras pretas marcantes passando pelos olhos
        if (ax >= 0.048 && ax < 0.115 && y > -0.05 + hy) return shade > 0.65 ? 'b1' : 'b0';
        // Bochechas brancas abaixo da máscara
        if (y > -0.08 + hy) return shade > 0.48 ? 'W' : 'w0';
        return 'b0';
      }

      // Pernas e barriga pretas (contraste clássico com o dorso grisalho)
      if (y < -0.14 + by) return shade > 0.62 ? 'b1' : 'b0';

      // Dorso grisalho prateado
      return shade > 0.70 ? 'g2' : shade > 0.40 ? 'g1' : 'g0';
    };

    pack = build27Pack(BADGER_PW, BADGER_PH, 0.94, 0.72, BADGER_PAL, evalFn, shadeFn);
    badgerCache.set(pose, pack);
  }
  return pack;
}

export function getBadgerPosePack(...args: Parameters<typeof buildBadgerPosePack>): ReturnType<typeof buildBadgerPosePack> {
  return registerAnimalSpritePack(buildBadgerPosePack(...args), { module: './ForestAnimals.ts', factory: 'getBadgerPosePack', args }, buildBadgerPosePack);
}

// ============================================================================
// INSTÂNCIAS NA ARENA (Owl, Squirrel, Badger)
// ============================================================================
class ForestWildlife<TPose extends string> extends BasePixelAnimal {
  protected readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  protected get vel() { return this.motor.velocity; }
  protected home = new THREE.Vector3();
  protected state: 'idle' | 'special' | 'move' | 'react' = 'idle';
  protected stateT = 0;
  protected stateDur = rand(1.2, 2.8);
  protected targetYaw = rand(0, Math.PI * 2);
  protected gaitPhase = rand(0, Math.PI * 2);
  protected hopCooldown = 0;

  constructor(
    ctx: GameContext,
    startPos: THREE.Vector3,
    private readonly cfg: {
      name: string;
      hp: number;
      radius: number;
      height: number;
      centerY: number;
      pw: number;
      ph: number;
      w: number;
      h: number;
      walkSpeed: number;
      reactSpeed: number;
      reactDist: number;
      bobAmp?: number;
      gaitRate?: number;
      gravity?: number;
      glideGravity?: number;
      hopMove?: boolean;
      hopVel?: number;
      hopPause?: number;
      reactHop?: boolean;
      reactHopVel?: number;
      fleeFromPlayer?: boolean;
      getPack: (p: TPose) => Boar27Pack;
      pickPose: (s: 'idle' | 'special' | 'move' | 'react', t: number, gait: number, grounded: boolean, vy: number, alive: boolean) => TPose;
    },
  ) {
    const firstPose = cfg.pickPose('idle', 0, 0, true, 0, true);
    super(ctx, cfg.getPack(firstPose).getView(2, 0)!, cfg.pw, cfg.ph, cfg.w, cfg.h, cfg.name);
    this.hp = cfg.hp;
    this.maxHp = cfg.hp;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = cfg.radius;
    this.motor.height = cfg.height;
    this.motor.teleport(startPos);
    this.home.copy(startPos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: cfg.radius + 0.08, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.set(this.position.x, this.position.y + this.cfg.centerY, this.position.z);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y + this.cfg.centerY * 0.6, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + this.cfg.centerY * 1.4, this.position.z);
    this.hurtboxes[0].enabled = this.alive;
    this.stickRoot.position.set(this.position.x, this.position.y + this.cfg.centerY, this.position.z);
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
    this.vel.y = 3.2;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.state = 'react';
      this.stateT = 0;
      this.stateDur = 2.2;
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
        if (dist < this.cfg.reactDist && this.state !== 'react') {
          this.state = 'react';
          this.stateT = 0;
          this.stateDur = 2.0;
        }

        if (this.state === 'idle') {
          if (this.stateT >= this.stateDur) {
            this.state = Math.random() < 0.38 ? 'special' : 'move';
            this.stateT = 0;
            this.stateDur = rand(1.6, 3.0);
            const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
            this.targetYaw = toHome > 7.5
              ? Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.5, 0.5)
              : this.facing + rand(-1.6, 1.6);
          }
        } else if (this.state === 'special') {
          if (this.stateT >= this.stateDur) {
            this.state = 'move';
            this.stateT = 0;
            this.stateDur = rand(1.5, 2.6);
          }
        } else if (this.state === 'move') {
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 6.5);
          if (this.cfg.hopMove) {
            if (this.motor.grounded) {
              if (this.hopCooldown <= 0) {
                this.vel.y = this.cfg.hopVel ?? 4.4;
                this.hopCooldown = this.cfg.hopPause ?? 0.34;
                speed = this.cfg.walkSpeed;
              } else {
                speed = 0;
              }
            } else {
              speed = this.cfg.walkSpeed;
            }
          } else {
            speed = this.cfg.walkSpeed;
          }
          if (this.stateT >= this.stateDur && this.motor.grounded) {
            this.state = Math.random() < 0.45 ? 'special' : 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.3, 2.5);
          }
        } else if (this.state === 'react') {
          if (target && target.alive) {
            this.targetYaw = this.cfg.fleeFromPlayer
              ? Math.atan2(this.position.x - target.position.x, this.position.z - target.position.z)
              : Math.atan2(target.position.x - this.position.x, target.position.z - this.position.z);
            this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 9);
            if (this.cfg.hopMove) {
              if (this.motor.grounded) {
                if (this.hopCooldown <= 0) {
                  this.vel.y = this.cfg.reactHopVel ?? ((this.cfg.hopVel ?? 4.6) + 0.6);
                  this.hopCooldown = (this.cfg.hopPause ?? 0.32) * 0.45;
                  speed = this.cfg.reactSpeed;
                } else {
                  speed = 0;
                }
              } else {
                speed = this.cfg.reactSpeed;
              }
            } else {
              speed = this.cfg.reactSpeed;
              if (this.cfg.reactHop && this.motor.grounded && this.hopCooldown <= 0) {
                this.vel.y = this.cfg.reactHopVel ?? 4.2;
                this.hopCooldown = 0.85;
              }
            }
          }
          if (this.stateT >= this.stateDur && dist > this.cfg.reactDist + 1.4 && this.motor.grounded) {
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.2, 2.2);
          }
        }

        this.vel.x = damp(this.vel.x, Math.sin(this.facing) * speed, 9, dt);
        this.vel.z = damp(this.vel.z, Math.cos(this.facing) * speed, 9, dt);
        const grav = (!this.motor.grounded && this.vel.y < 0 && this.cfg.glideGravity != null)
          ? this.cfg.glideGravity
          : (this.cfg.gravity ?? 20);
        this.vel.y -= grav * dt;
        this.motor.update(dt);

        const targetPitch = !this.motor.grounded ? Math.max(-0.28, Math.min(0.28, this.vel.y * 0.045)) : 0;
        this.bodyPitch = damp(this.bodyPitch, targetPitch, 10, dt);

        const horiz = Math.hypot(this.vel.x, this.vel.z);
        if (horiz > 0.25 && this.motor.grounded) {
          this.gaitPhase += dt * (this.cfg.gaitRate ?? 5.5) * (0.65 + horiz * 0.22);
        }
      }
      this.syncHurtbox();
    }

    const horiz = Math.hypot(this.vel.x, this.vel.z);
    const bobAmp = this.cfg.bobAmp ?? 0.03;
    const bob = this.alive && this.motor.grounded && horiz > 0.25
      ? Math.abs(Math.sin(this.gaitPhase)) * bobAmp
      : 0;
    const pose = this.cfg.pickPose(this.state, this.stateT, this.gaitPhase, this.motor.grounded, this.vel.y, this.alive);
    const deathSink = this.alive ? 0 : Math.min(0.20, this.deadT * 0.4);
    this.renderBillboard(this.cfg.getPack(pose), this.position.y + this.cfg.centerY + bob - deathSink, camera, drawingBufferSize);
  }
}

function pickCycle<T>(frames: readonly T[], idx: number): T {
  return sampleAnimalCycle(frames, idx);
}

const OWL_PERCH: readonly OwlPoseName[] = ['perch0', 'perch1', 'perch0', 'perch2'];
const OWL_HOOT: readonly OwlPoseName[] = ['hoot0', 'hoot1', 'hoot2', 'hoot3'];
const OWL_FLAP: readonly OwlPoseName[] = ['flap0', 'flap1', 'flap2', 'flap3'];
const OWL_GLIDE: readonly OwlPoseName[] = ['glide0', 'glide1'];

const SQUIRREL_IDLE: readonly SquirrelPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const SQUIRREL_NIBBLE: readonly SquirrelPoseName[] = ['nibble0', 'nibble1', 'nibble2', 'nibble3'];

const BADGER_IDLE: readonly BadgerPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const BADGER_DIG: readonly BadgerPoseName[] = ['dig0', 'dig1', 'dig2', 'dig3'];
const BADGER_WALK: readonly BadgerPoseName[] = ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'];
const BADGER_HISS: readonly BadgerPoseName[] = ['hiss0', 'hiss1', 'hiss2'];

export class Owl extends ForestWildlife<OwlPoseName> {
  constructor(ctx: GameContext, pos: THREE.Vector3) {
    super(ctx, pos, {
      name: 'OwlBillboard', hp: 30, radius: 0.26, height: 0.56, centerY: 0.28,
      pw: OWL_PW, ph: OWL_PH, w: OWL_W, h: OWL_H,
      walkSpeed: 2.4, reactSpeed: 5.2, reactDist: 4.2,
      bobAmp: 0, hopMove: true, hopVel: 4.8, reactHopVel: 6.2, hopPause: 0.55,
      gravity: 16, glideGravity: 6.5, fleeFromPlayer: true,
      getPack: getOwlPosePack,
      pickPose: (s, t, _g, gr, vy, alive) => {
        if (!alive) return 'perch0';
        if (!gr) {
          if (vy > -0.6) return pickCycle(OWL_FLAP, t * 9.0);
          return pickCycle(OWL_GLIDE, t * 3.0);
        }
        if (s === 'special') return pickCycle(OWL_HOOT, t * 2.8);
        return pickCycle(OWL_PERCH, t * 1.8);
      },
    });
  }
}

export class Squirrel extends ForestWildlife<SquirrelPoseName> {
  constructor(ctx: GameContext, pos: THREE.Vector3) {
    super(ctx, pos, {
      name: 'SquirrelBillboard', hp: 18, radius: 0.20, height: 0.36, centerY: 0.17,
      pw: SQUIRREL_PW, ph: SQUIRREL_PH, w: SQUIRREL_W, h: SQUIRREL_H,
      walkSpeed: 2.8, reactSpeed: 5.4, reactDist: 3.6,
      bobAmp: 0, hopMove: true, hopVel: 4.4, reactHopVel: 5.2, hopPause: 0.22,
      fleeFromPlayer: true,
      getPack: getSquirrelPosePack,
      pickPose: (s, t, _g, gr, vy, alive) => {
        if (!alive) return 'idle0';
        if (!gr) return vy > 2.0 ? 'hop1' : vy > -1.0 ? 'hop2' : 'hop3';
        if (s === 'special') return pickCycle(SQUIRREL_NIBBLE, t * 4.5);
        if (s === 'move' || s === 'react') return 'hop0';
        return pickCycle(SQUIRREL_IDLE, t * 2.6);
      },
    });
  }
}

export class Badger extends ForestWildlife<BadgerPoseName> {
  constructor(ctx: GameContext, pos: THREE.Vector3) {
    super(ctx, pos, {
      name: 'BadgerBillboard', hp: 60, radius: 0.36, height: 0.48, centerY: 0.22,
      pw: BADGER_PW, ph: BADGER_PH, w: BADGER_W, h: BADGER_H,
      walkSpeed: 1.8, reactSpeed: 3.8, reactDist: 3.8,
      bobAmp: 0.025, gaitRate: 5.2, reactHop: true, reactHopVel: 3.6,
      fleeFromPlayer: false,
      getPack: getBadgerPosePack,
      pickPose: (s, t, g, _gr, _vy, alive) => {
        if (!alive) return 'idle0';
        if (s === 'react') return pickCycle(BADGER_HISS, t * 5.0);
        if (s === 'special') return pickCycle(BADGER_DIG, t * 4.2);
        if (s === 'move') return pickCycle(BADGER_WALK, (g / Math.PI) * 2.5);
        return pickCycle(BADGER_IDLE, t * 2.0);
      },
    });
  }
}
