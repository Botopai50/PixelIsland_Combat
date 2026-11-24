import { sampleAnimalCycle } from './AnimalAnimation';
import { registerAnimalSpritePack } from './AnimalSpriteCache';
﻿import * as THREE from 'three';
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
// 1. LOBO (Wolf) â€” 64Ã—48 @ 38 PPU (1.68m Ã— 1.26m)
// ============================================================================
export type WolfPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'howl0' | 'howl1' | 'howl2' | 'howl3'
  | 'run0' | 'run1' | 'run2' | 'run3' | 'run4' | 'run5'
  | 'lunge0' | 'lunge1' | 'lunge2';

export const WOLF_PW = 52;
export const WOLF_PH = 40;
export const WOLF_W = 64 / ANIMAL_PPU;
export const WOLF_H = 48 / ANIMAL_PPU;

const WOLF_PAL: Record<string, [number, number, number]> = {
  k:  [0x14, 0x17, 0x1e], // contorno / nariz / marcas escuras
  g0: [0x2d, 0x34, 0x42], // cinza-carvÃ£o dorsal / costas das orelhas / topo da cauda
  g1: [0x4e, 0x58, 0x6b], // cinza-lobo escuro
  g2: [0x7c, 0x88, 0x9b], // cinza-prata mÃ©dio
  g3: [0xb4, 0xbe, 0xcc], // cinza-claro
  W:  [0xe8, 0xed, 0xf4], // peito / juba / barriga / orelha interna / presas
  e:  [0xff, 0xb8, 0x24], // olhos Ã¢mbar brilhantes
  m:  [0x73, 0x20, 0x2a], // interior da boca no uivo/bote
};

interface WolfPose {
  bodyY: number;
  headY: number;
  headZ: number;
  headPitch: number;
  jawOpen: number;
  earBack: number;
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

const WOLF_POSES: Record<WolfPoseName, WolfPose> = {
  // RespiraÃ§Ã£o e alerta sutil
  idle0: {
    bodyY: 0.0, headY: 0.0, headZ: 0.0, headPitch: 0.02, jawOpen: 0.0, earBack: 0.0,
    flSwing: 0.02, flLift: 0.0, frSwing: -0.02, frLift: 0.0,
    blSwing: -0.02, blLift: 0.0, brSwing: 0.02, brLift: 0.0,
    tailLift: 0.0, tailSway: 0.0,
  },
  idle1: {
    bodyY: 0.015, headY: 0.02, headZ: 0.01, headPitch: 0.07, jawOpen: 0.0, earBack: 0.08,
    flSwing: 0.02, flLift: 0.0, frSwing: -0.02, frLift: 0.0,
    blSwing: -0.02, blLift: 0.0, brSwing: 0.02, brLift: 0.0,
    tailLift: 0.04, tailSway: 0.05,
  },
  idle2: {
    bodyY: -0.01, headY: -0.01, headZ: 0.02, headPitch: -0.02, jawOpen: 0.05, earBack: 0.04,
    flSwing: 0.02, flLift: 0.0, frSwing: -0.02, frLift: 0.0,
    blSwing: -0.02, blLift: 0.0, brSwing: 0.02, brLift: 0.0,
    tailLift: -0.02, tailSway: -0.05,
  },

  // Uivo em 4 quadros (ergue cabeÃ§a -> uivo boca aberta -> pico -> abaixa)
  howl0: {
    bodyY: 0.01, headY: 0.07, headZ: -0.02, headPitch: 0.34, jawOpen: 0.28, earBack: 0.30,
    flSwing: 0.05, flLift: 0.0, frSwing: 0.02, frLift: 0.0,
    blSwing: -0.04, blLift: 0.0, brSwing: -0.05, brLift: 0.0,
    tailLift: -0.06, tailSway: 0.0,
  },
  howl1: {
    bodyY: 0.02, headY: 0.13, headZ: -0.06, headPitch: 0.68, jawOpen: 0.85, earBack: 0.60,
    flSwing: 0.08, flLift: 0.0, frSwing: 0.04, frLift: 0.0,
    blSwing: -0.06, blLift: 0.0, brSwing: -0.08, brLift: 0.0,
    tailLift: -0.10, tailSway: 0.0,
  },
  howl2: {
    bodyY: 0.03, headY: 0.15, headZ: -0.07, headPitch: 0.76, jawOpen: 0.95, earBack: 0.72,
    flSwing: 0.09, flLift: 0.0, frSwing: 0.05, frLift: 0.0,
    blSwing: -0.07, blLift: 0.0, brSwing: -0.09, brLift: 0.0,
    tailLift: -0.12, tailSway: 0.02,
  },
  howl3: {
    bodyY: 0.01, headY: 0.06, headZ: -0.02, headPitch: 0.28, jawOpen: 0.22, earBack: 0.25,
    flSwing: 0.04, flLift: 0.0, frSwing: 0.01, frLift: 0.0,
    blSwing: -0.04, blLift: 0.0, brSwing: -0.03, brLift: 0.0,
    tailLift: -0.05, tailSway: 0.0,
  },

  // Galope de lobo em 6 quadros (encolhe -> impulso -> voo estendido -> alcance -> apoio -> compressÃ£o)
  run0: {
    bodyY: -0.02, headY: -0.04, headZ: 0.05, headPitch: -0.06, jawOpen: 0.18, earBack: 0.45,
    flSwing: -0.12, flLift: 0.15, frSwing: -0.22, frLift: 0.05,
    blSwing: 0.24, blLift: 0.25, brSwing: 0.14, brLift: 0.12,
    tailLift: 0.12, tailSway: -0.03,
  },
  run1: {
    bodyY: 0.03, headY: -0.05, headZ: 0.07, headPitch: -0.08, jawOpen: 0.22, earBack: 0.50,
    flSwing: 0.18, flLift: 0.35, frSwing: 0.06, frLift: 0.20,
    blSwing: -0.14, blLift: 0.10, brSwing: -0.24, brLift: 0.22,
    tailLift: 0.18, tailSway: 0.0,
  },
  run2: {
    bodyY: 0.06, headY: -0.06, headZ: 0.09, headPitch: -0.10, jawOpen: 0.28, earBack: 0.58,
    flSwing: 0.34, flLift: 0.45, frSwing: 0.22, frLift: 0.32,
    blSwing: -0.30, blLift: 0.42, brSwing: -0.20, brLift: 0.28,
    tailLift: 0.22, tailSway: 0.03,
  },
  run3: {
    bodyY: 0.02, headY: -0.05, headZ: 0.07, headPitch: -0.08, jawOpen: 0.22, earBack: 0.50,
    flSwing: 0.26, flLift: 0.12, frSwing: 0.32, frLift: 0.28,
    blSwing: -0.16, blLift: 0.30, brSwing: -0.06, brLift: 0.18,
    tailLift: 0.16, tailSway: 0.03,
  },
  run4: {
    bodyY: -0.03, headY: -0.04, headZ: 0.05, headPitch: -0.05, jawOpen: 0.15, earBack: 0.42,
    flSwing: 0.04, flLift: 0.0, frSwing: 0.14, frLift: 0.04,
    blSwing: 0.10, blLift: 0.22, brSwing: 0.20, brLift: 0.30,
    tailLift: 0.10, tailSway: 0.0,
  },
  run5: {
    bodyY: -0.04, headY: -0.05, headZ: 0.04, headPitch: -0.04, jawOpen: 0.15, earBack: 0.45,
    flSwing: -0.22, flLift: 0.22, frSwing: -0.10, frLift: 0.08,
    blSwing: 0.28, blLift: 0.12, brSwing: 0.20, brLift: 0.04,
    tailLift: 0.08, tailSway: -0.03,
  },

  // Bote em 3 quadros (agacha -> salto -> mordida escancarada)
  lunge0: {
    bodyY: -0.09, headY: -0.10, headZ: 0.08, headPitch: -0.12, jawOpen: 0.35, earBack: 0.78,
    flSwing: 0.14, flLift: 0.0, frSwing: 0.08, frLift: 0.0,
    blSwing: 0.12, blLift: 0.0, brSwing: 0.08, brLift: 0.0,
    tailLift: -0.04, tailSway: 0.0,
  },
  lunge1: {
    bodyY: 0.05, headY: -0.05, headZ: 0.10, headPitch: -0.04, jawOpen: 0.72, earBack: 0.82,
    flSwing: 0.34, flLift: 0.48, frSwing: 0.26, frLift: 0.38,
    blSwing: -0.28, blLift: 0.20, brSwing: -0.22, brLift: 0.15,
    tailLift: 0.24, tailSway: 0.0,
  },
  lunge2: {
    bodyY: 0.04, headY: -0.08, headZ: 0.12, headPitch: -0.08, jawOpen: 1.0, earBack: 0.88,
    flSwing: 0.40, flLift: 0.55, frSwing: 0.32, frLift: 0.45,
    blSwing: -0.34, blLift: 0.28, brSwing: -0.28, brLift: 0.22,
    tailLift: 0.28, tailSway: 0.0,
  },
};

const wolfCache = new Map<WolfPoseName, Boar27Pack>();
 function buildWolfPosePack(pose: WolfPoseName): Boar27Pack {
  let pack = wolfCache.get(pose);
  if (!pack) {
    const P = WOLF_POSES[pose];
    const by = P.bodyY;
    const hPivotY = 0.27 + P.headY;
    const hPivotZ = 0.46 + P.headZ;
    const cosP = Math.cos(P.headPitch);
    const sinP = Math.sin(P.headPitch);
    const jawDrop = P.jawOpen * 0.15;
    const jawBack = P.jawOpen * 0.04;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // 1. Torso atlÃ©tico: peito musculoso, cernelha, cintura esguia, garupa inclinada
      const chest = sdEllipsoid(x, y, z, 0, 0.03 + by, 0.22, 0.225, 0.23, 0.27);
      const withers = sdEllipsoid(x, y, z, 0, 0.17 + by, 0.21, 0.175, 0.145, 0.20);
      const waist = sdEllipsoid(x, y, z, 0, 0.075 + by, -0.09, 0.142, 0.142, 0.24);
      const rump = sdEllipsoid(x, y, z, 0, 0.04 + by, -0.33, 0.18, 0.178, 0.21);

      // 2. PescoÃ§o espesso + juba/gola peluda de lobo-cinzento
      const neck = sdCapsule(x, y, z, 0, 0.12 + by, 0.30, 0, hPivotY - 0.01, hPivotZ - 0.01, 0.175, 0.135);
      const napeMane = sdCapsule(x, y, z, 0, 0.20 + by, 0.24, 0, hPivotY + 0.06, hPivotZ - 0.05, 0.155, 0.115);
      const chestRuff = sdEllipsoid(x, y, z, 0, 0.02 + by * 0.6 + P.headY * 0.4, 0.38 + P.headZ * 0.4, 0.20, 0.18, 0.165);
      const ruffL = sdEllipsoid(x, y, z, -0.15, 0.14 + by * 0.4 + P.headY * 0.6, 0.37 + P.headZ * 0.5, 0.115, 0.13, 0.14);
      const ruffR = sdEllipsoid(x, y, z,  0.15, 0.14 + by * 0.4 + P.headY * 0.6, 0.37 + P.headZ * 0.5, 0.115, 0.13, 0.14);

      let fur = smin(chest, withers, 0.08);
      fur = smin(fur, waist, 0.11);
      fur = smin(fur, rump, 0.11);
      fur = smin(fur, neck, 0.09);
      fur = smin(fur, napeMane, 0.07);
      fur = smin(fur, chestRuff, 0.08);
      fur = smin(fur, Math.min(ruffL, ruffR), 0.06);

      // 3. CabeÃ§a predatÃ³ria em espaÃ§o local rotacionado pelo headPitch
      const dy = y - hPivotY;
      const dz = z - hPivotZ;
      const lx = x;
      const lz = dz * cosP + dy * sinP;
      const ly = -dz * sinP + dy * cosP;

      const skull = sdEllipsoid(lx, ly, lz, 0, 0.02, 0.03, 0.142, 0.132, 0.162);
      const cheekL = sdEllipsoid(lx, ly, lz, -0.148, -0.02, -0.015, 0.10, 0.092, 0.11);
      const cheekR = sdEllipsoid(lx, ly, lz,  0.148, -0.02, -0.015, 0.10, 0.092, 0.11);
      const browL = sdCapsule(lx, ly, lz, -0.035, 0.098, 0.125, -0.125, 0.082, 0.105, 0.038, 0.032);
      const browR = sdCapsule(lx, ly, lz,  0.035, 0.098, 0.125,  0.125, 0.082, 0.105, 0.038, 0.032);
      const upperSnout = sdCapsule(lx, ly, lz, 0, 0.008, 0.11, 0, -0.012, 0.34, 0.08, 0.048);
      const lowerJaw = sdCapsule(lx, ly, lz, 0, -0.052, 0.10, 0, -0.055 - jawDrop, 0.30 - jawBack, 0.058, 0.034);

      let headD = smin(skull, Math.min(cheekL, cheekR), 0.05);
      headD = smin(headD, Math.min(browL, browR), 0.03);
      headD = smin(headD, upperSnout, 0.045);
      headD = smin(headD, lowerJaw, P.jawOpen > 0.2 ? 0.02 : 0.04);
      fur = smin(fur, headD, 0.06);

      // Orelhas pontudas triangulares (verso escuro, interior claro)
      const earTipZ = -0.04 - P.earBack * 0.08;
      const earL = sdCapsule(lx, ly, lz, -0.095, 0.105, -0.015, -0.145, 0.305, earTipZ, 0.062, 0.015);
      const earR = sdCapsule(lx, ly, lz,  0.095, 0.105, -0.015,  0.145, 0.305, earTipZ, 0.062, 0.015);
      const earBack = Math.min(earL, earR);
      fur = smin(fur, earBack, 0.025);

      const earInL = sdCapsule(lx, ly, lz, -0.095, 0.125, 0.024, -0.135, 0.265, earTipZ + 0.038, 0.036, 0.011);
      const earInR = sdCapsule(lx, ly, lz,  0.095, 0.125, 0.024,  0.135, 0.265, earTipZ + 0.038, 0.036, 0.011);
      const earInner = Math.min(earInL, earInR);

      // 4. Pernas articuladas em 2 segmentos + patas (ombro->cotovelo->pata / quadril->jarrete->pata)
      const frontLeg = (sx: number, swing: number, lift: number) => {
        const shY = 0.01 + by, shZ = 0.24;
        const elY = -0.24 + by * 0.5 + lift * 0.16;
        const elZ = 0.15 + swing * 0.52;
        const pwY = -0.54 + lift * 0.30;
        const pwZ = 0.24 + swing * 1.08;
        const upper = sdCapsule(x, y, z, sx, shY, shZ, sx, elY, elZ, 0.092, 0.058);
        const lower = sdCapsule(x, y, z, sx, elY, elZ, sx, pwY, pwZ, 0.056, 0.040);
        const paw = sdEllipsoid(x, y, z, sx, pwY - 0.01, pwZ + 0.042, 0.054, 0.034, 0.068);
        return smin(smin(upper, lower, 0.03), paw, 0.025);
      };
      const hindLeg = (sx: number, swing: number, lift: number) => {
        const hipY = 0.03 + by, hipZ = -0.30;
        const thigh = sdEllipsoid(x, y, z, sx * 1.04, -0.04 + by, -0.31 + swing * 0.18, 0.095, 0.138, 0.118);
        const hkY = -0.25 + by * 0.5 + lift * 0.16;
        const hkZ = -0.46 + (swing < 0 ? swing * 0.38 : swing * 0.65);
        const pwY = -0.54 + lift * 0.30;
        const pwZ = -0.36 + (swing < 0 ? swing * 1.25 : swing * 0.95);
        const upper = sdCapsule(x, y, z, sx, hipY, hipZ, sx, hkY, hkZ, 0.094, 0.052);
        const lower = sdCapsule(x, y, z, sx, hkY, hkZ, sx, pwY, pwZ, 0.050, 0.038);
        const paw = sdEllipsoid(x, y, z, sx, pwY - 0.01, pwZ + 0.042, 0.054, 0.034, 0.068);
        return smin(smin(thigh, upper, 0.04), smin(lower, paw, 0.025), 0.03);
      };

      const legs = Math.min(
        Math.min(frontLeg(-0.15, P.flSwing, P.flLift), frontLeg(0.15, P.frSwing, P.frLift)),
        Math.min(hindLeg(-0.158, P.blSwing, P.blLift), hindLeg(0.158, P.brSwing, P.brLift)),
      );
      fur = smin(fur, legs, 0.045);

      // 5. Cauda cheia e felpuda em curva dupla
      const tMidX = P.tailSway * 0.45;
      const tMidY = -0.08 + by * 0.5 + P.tailLift * 0.45;
      const tMidZ = -0.71;
      const tTipX = P.tailSway;
      const tTipY = -0.09 + P.tailLift * 1.05;
      const tTipZ = -0.96;
      const tail1 = sdCapsule(x, y, z, 0, 0.04 + by, -0.47, tMidX, tMidY, tMidZ, 0.075, 0.11);
      const tail2 = sdCapsule(x, y, z, tMidX, tMidY, tMidZ, tTipX, tTipY, tTipZ, 0.106, 0.044);
      const tailD = smin(tail1, tail2, 0.04);
      fur = smin(fur, tailD, 0.05);

      // Detalhes: olhos Ã¢mbar sob sobrancelha, focinho escuro, boca e presas
      const eyeL = sdEllipsoid(lx, ly, lz, -0.092, 0.048, 0.148, 0.038, 0.032, 0.036);
      const eyeR = sdEllipsoid(lx, ly, lz,  0.092, 0.048, 0.148, 0.038, 0.032, 0.036);
      const eyes = Math.min(eyeL, eyeR);
      const nose = sdEllipsoid(lx, ly, lz, 0, 0.002, 0.375, 0.044, 0.036, 0.036);

      let mouth = 99;
      let fangs = 99;
      if (P.jawOpen > 0.15) {
        mouth = sdEllipsoid(lx, ly, lz, 0, -0.032 - jawDrop * 0.42, 0.21, 0.048, 0.025 + jawDrop * 0.42, 0.088);
        const fL = sdCapsule(lx, ly, lz, -0.036, -0.035, 0.275, -0.036, -0.075, 0.275, 0.015, 0.006);
        const fR = sdCapsule(lx, ly, lz,  0.036, -0.035, 0.275,  0.036, -0.075, 0.275, 0.015, 0.006);
        fangs = Math.min(fL, fR);
      }

      let d = fur, mat = 'fur';
      if (tailD < fur + 0.004 && z < -0.52) mat = 'tail';
      if (earBack < fur + 0.004 && ly > 0.13) mat = 'earBack';
      if (earInner < d) { d = earInner; mat = 'earInner'; }
      if (mouth < d) { d = mouth; mat = 'mouth'; }
      if (fangs < d) { d = fangs; mat = 'fang'; }
      if (eyes < d) { d = eyes; mat = 'eye'; }
      if (nose < d) { d = nose; mat = 'nose'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'eye') return 'e';
      if (mat === 'nose') return 'k';
      if (mat === 'mouth') return 'm';
      if (mat === 'fang') return 'W';
      if (mat === 'earInner') return shade > 0.45 ? 'W' : 'g3';
      if (mat === 'earBack') return shade > 0.65 ? 'g1' : 'g0';

      if (mat === 'tail') {
        const tailCenterY = -0.07 + by * 0.5 + P.tailLift * 0.7;
        if (z < -0.89) return 'g0';
        if (y > tailCenterY + 0.02) return shade > 0.65 ? 'g1' : 'g0';
        return shade > 0.45 ? 'W' : 'g3';
      }

      const dy = y - hPivotY;
      const dz = z - hPivotZ;
      const lz = dz * cosP + dy * sinP;
      const ly = -dz * sinP + dy * cosP;

      if (dz > -0.14 && y > 0.14 + P.headY * 0.5) {
        if (ly > 0.06 && Math.abs(x) < 0.09) return shade > 0.68 ? 'g1' : 'g0';
        if (ly < -0.005 && lz > -0.05) return shade > 0.42 ? 'W' : 'g3';
      }

      if (z > 0.24 && y < 0.12 + by && y > -0.22 + by && Math.abs(x) < 0.18) return shade > 0.46 ? 'W' : 'g3';
      if (y < -0.05 + by && y > -0.22 + by && z > -0.34 && z < 0.32 && Math.abs(x) < 0.14) return shade > 0.48 ? 'W' : 'g3';
      if (y > 0.15 + by && z > -0.45 && z < 0.34) return shade > 0.62 ? 'g1' : 'g0';
      if (y < -0.50) return shade > 0.5 ? 'g2' : 'g1';

      return shade > 0.74 ? 'g3' : shade > 0.48 ? 'g2' : shade > 0.24 ? 'g1' : 'g0';
    };

    pack = build27Pack(WOLF_PW, WOLF_PH, 1.04, 0.78, WOLF_PAL, evalFn, shadeFn);
    wolfCache.set(pose, pack);
  }
  return pack;
}

export function getWolfPosePack(...args: Parameters<typeof buildWolfPosePack>): ReturnType<typeof buildWolfPosePack> {
  return registerAnimalSpritePack(buildWolfPosePack(...args), { module: './MoreAnimals.ts', factory: 'getWolfPosePack', args }, buildWolfPosePack);
}

// ============================================================================
// 2. CERVO REALISTA (Red Deer Stag) â€” 54Ã—56 grid @ 2.05m Ã— 2.11m
// ============================================================================
export type DeerPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'graze0' | 'graze1' | 'graze2' | 'graze3'
  | 'trot0' | 'trot1' | 'trot2' | 'trot3' | 'trot4' | 'trot5'
  | 'leap0' | 'leap1' | 'leap2' | 'leap3';

export const DEER_PW = 54;
export const DEER_PH = 56;
export const DEER_W = 78 / ANIMAL_PPU;
export const DEER_H = 80 / ANIMAL_PPU;

const DEER_PAL: Record<string, [number, number, number]> = {
  k:  [0x1a, 0x13, 0x11], // contorno / cascos fendidos / focinho Ãºmido / pupila
  d0: [0x47, 0x26, 0x14], // sombra profunda / juba do pescoÃ§o / canelas escuras
  d1: [0x70, 0x3e, 0x20], // castanho-avermelhado escuro
  d2: [0x9e, 0x5c, 0x2e], // pelagem cervo-vermelho mÃ©dio
  d3: [0xc4, 0x7c, 0x44], // pelagem dourada iluminada
  d4: [0xde, 0x9e, 0x62], // brilho quente no dorso / garupa
  w0: [0x9e, 0x8e, 0x78], // pelagem creme na sombra (barriga/garganta/espelho)
  w1: [0xc7, 0xb8, 0xa1], // pelagem creme tom mÃ©dio
  W:  [0xf0, 0xe5, 0xd1], // pelagem creme iluminada / interior das orelhas
  a0: [0x6e, 0x5c, 0x46], // galhada base/sombra Ã³ssea
  a1: [0xa6, 0x92, 0x76], // galhada haste mÃ©dia
  a2: [0xdc, 0xcb, 0xb2], // pontas de marfim polido
};

interface DeerPose {
  bodyY: number;
  headDip: number;
  headFwd: number;
  headSway: number;
  headPitch: number;
  tailLift: number;
  fl: number;
  fr: number;
  bl: number;
  br: number;
  flLift: number;
  frLift: number;
  blLift: number;
  brLift: number;
}

const DEER_POSES: Record<DeerPoseName, DeerPose> = {
  idle0:  { bodyY: 0.0,   headDip: 0.0,   headFwd: 0.0,  headSway: 0.0,   headPitch: 0.0,   tailLift: 0.0,  fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0,   flLift: 0,    frLift: 0,    blLift: 0,    brLift: 0 },
  idle1:  { bodyY: 0.012, headDip: 0.025, headFwd: 0.01, headSway: 0.035, headPitch: -0.05, tailLift: 0.04, fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0,   flLift: 0,    frLift: 0,    blLift: 0,    brLift: 0 },
  idle2:  { bodyY: -0.01, headDip: -0.02, headFwd: 0.02, headSway: -0.035,headPitch: 0.05,  tailLift: 0.02, fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0,   flLift: 0,    frLift: 0,    blLift: 0,    brLift: 0 },

  graze0: { bodyY: -0.01, headDip: -0.34, headFwd: 0.16, headSway: 0.0,   headPitch: 0.38,  tailLift: 0.05, fl: 0.06,  fr: -0.03, bl: 0.0,   br: 0.0,   flLift: 0,    frLift: 0,    blLift: 0,    brLift: 0 },
  graze1: { bodyY: -0.02, headDip: -0.64, headFwd: 0.28, headSway: -0.03, headPitch: 0.72,  tailLift: 0.08, fl: 0.10,  fr: -0.04, bl: 0.0,   br: 0.0,   flLift: 0,    frLift: 0,    blLift: 0,    brLift: 0 },
  graze2: { bodyY: -0.02, headDip: -0.60, headFwd: 0.30, headSway: 0.04,  headPitch: 0.68,  tailLift: 0.12, fl: 0.10,  fr: -0.04, bl: 0.0,   br: 0.0,   flLift: 0,    frLift: 0,    blLift: 0,    brLift: 0 },
  graze3: { bodyY: 0.0,   headDip: -0.28, headFwd: 0.14, headSway: 0.01,  headPitch: 0.30,  tailLift: 0.04, fl: 0.05,  fr: -0.02, bl: 0.0,   br: 0.0,   flLift: 0,    frLift: 0,    blLift: 0,    brLift: 0 },

  trot0:  { bodyY: 0.02,  headDip: -0.02, headFwd: 0.04, headSway: 0.0,   headPitch: 0.04,  tailLift: 0.35, fl: 0.28,  fr: -0.20, bl: -0.24, br: 0.24,  flLift: 0.16, frLift: 0.0,  blLift: 0.0,  brLift: 0.14 },
  trot1:  { bodyY: 0.04,  headDip: -0.04, headFwd: 0.05, headSway: 0.0,   headPitch: 0.06,  tailLift: 0.42, fl: 0.15,  fr: -0.06, bl: -0.10, br: 0.14,  flLift: 0.06, frLift: 0.10, blLift: 0.10, brLift: 0.05 },
  trot2:  { bodyY: 0.0,   headDip: -0.01, headFwd: 0.04, headSway: 0.0,   headPitch: 0.02,  tailLift: 0.32, fl: -0.05, fr: 0.12,  bl: 0.10,  br: -0.06, flLift: 0.0,  frLift: 0.18, blLift: 0.16, brLift: 0.0 },
  trot3:  { bodyY: 0.02,  headDip: -0.02, headFwd: 0.04, headSway: 0.0,   headPitch: 0.04,  tailLift: 0.35, fl: -0.20, fr: 0.28,  bl: 0.24,  br: -0.24, flLift: 0.0,  frLift: 0.16, blLift: 0.14, brLift: 0.0 },
  trot4:  { bodyY: 0.04,  headDip: -0.04, headFwd: 0.05, headSway: 0.0,   headPitch: 0.06,  tailLift: 0.42, fl: -0.06, fr: 0.15,  bl: 0.14,  br: -0.10, flLift: 0.10, frLift: 0.06, blLift: 0.05, brLift: 0.10 },
  trot5:  { bodyY: 0.0,   headDip: -0.01, headFwd: 0.04, headSway: 0.0,   headPitch: 0.02,  tailLift: 0.32, fl: 0.12,  fr: -0.05, bl: -0.06, br: 0.10,  flLift: 0.18, frLift: 0.0,  blLift: 0.0,  brLift: 0.16 },

  leap0:  { bodyY: -0.05, headDip: -0.05, headFwd: 0.06, headSway: 0.0,   headPitch: -0.08, tailLift: 0.55, fl: 0.22,  fr: 0.14,  bl: 0.12,  br: 0.08,  flLift: 0.22, frLift: 0.16, blLift: 0.0,  brLift: 0.0 },
  leap1:  { bodyY: 0.07,  headDip: 0.06,  headFwd: 0.10, headSway: 0.0,   headPitch: -0.14, tailLift: 0.75, fl: 0.40,  fr: 0.32,  bl: -0.38, br: -0.32, flLift: 0.32, frLift: 0.26, blLift: 0.26, brLift: 0.22 },
  leap2:  { bodyY: 0.08,  headDip: 0.04,  headFwd: 0.08, headSway: 0.0,   headPitch: -0.06, tailLift: 0.70, fl: 0.26,  fr: 0.20,  bl: -0.20, br: -0.14, flLift: 0.38, frLift: 0.34, blLift: 0.34, brLift: 0.30 },
  leap3:  { bodyY: -0.02, headDip: -0.02, headFwd: 0.06, headSway: 0.0,   headPitch: 0.06,  tailLift: 0.45, fl: 0.30,  fr: 0.22,  bl: -0.12, br: -0.06, flLift: 0.06, frLift: 0.10, blLift: 0.18, brLift: 0.16 },
};

const deerCache = new Map<DeerPoseName, Boar27Pack>();
 function buildDeerPosePack(pose: DeerPoseName): Boar27Pack {
  let pack = deerCache.get(pose);
  if (!pack) {
    const P = DEER_POSES[pose];
    const by = P.bodyY;
    const hPivotX = P.headSway;
    const hPivotY = 0.44 + P.headDip + by;
    const hPivotZ = 0.42 + P.headFwd;
    const cosP = Math.cos(P.headPitch);
    const sinP = Math.sin(P.headPitch);

    const evalFn: SdfEvaluator = (x, y, z) => {
      // 1. Anatomia realista de cervo-vermelho (Cervus elaphus):
      // Peito profundo (brisket), cernelha marcada (withers), cintura esguia (flank tuck) e garupa forte
      const chest = sdEllipsoid(x, y, z, 0, -0.02 + by, 0.20, 0.205, 0.23, 0.24);
      const brisket = sdEllipsoid(x, y, z, 0, -0.14 + by, 0.27, 0.135, 0.125, 0.15);
      const withers = sdEllipsoid(x, y, z, 0, 0.15 + by, 0.18, 0.155, 0.13, 0.19);
      const waist = sdEllipsoid(x, y, z, 0, 0.01 + by, -0.06, 0.175, 0.175, 0.23);
      const rump = sdEllipsoid(x, y, z, 0, 0.04 + by, -0.29, 0.195, 0.20, 0.20);

      // 2. PescoÃ§o elegante em S com juba espessa na garganta (stag neck mane)
      const nMidX = hPivotX * 0.45;
      const nMidY = 0.22 + by + P.headDip * 0.42;
      const nMidZ = 0.35 + P.headFwd * 0.45;
      const neckLow = sdCapsule(x, y, z, 0, 0.05 + by, 0.24, nMidX, nMidY, nMidZ, 0.155, 0.122);
      const neckHigh = sdCapsule(x, y, z, nMidX, nMidY, nMidZ, hPivotX, hPivotY, hPivotZ, 0.118, 0.092);
      const throatMane = sdCapsule(x, y, z, 0, -0.05 + by, 0.30, nMidX, nMidY - 0.05, nMidZ + 0.05, 0.125, 0.088);

      let fur = smin(chest, brisket, 0.07);
      fur = smin(fur, withers, 0.08);
      fur = smin(fur, waist, 0.10);
      fur = smin(fur, rump, 0.10);
      fur = smin(fur, smin(neckLow, neckHigh, 0.06), 0.09);
      fur = smin(fur, throatMane, 0.06);

      // 3. CabeÃ§a cervÃ­dea esculpida em espaÃ§o local (rotacionada por headPitch):
      // CrÃ¢nio alongado, maÃ§Ã£s do rosto/arcos orbitais, ponte nasal afilada e mandÃ­bula fina
      const lx = x - hPivotX;
      const dy = y - hPivotY;
      const dz = z - hPivotZ;
      const lz = dz * cosP + dy * sinP;
      const ly = -dz * sinP + dy * cosP;

      const cranium = sdEllipsoid(lx, ly, lz, 0, 0.04, 0.03, 0.108, 0.105, 0.135);
      const cheekL = sdEllipsoid(lx, ly, lz, -0.082, 0.005, 0.06, 0.062, 0.068, 0.085);
      const cheekR = sdEllipsoid(lx, ly, lz,  0.082, 0.005, 0.06, 0.062, 0.068, 0.085);
      const bridge = sdCapsule(lx, ly, lz, 0, 0.025, 0.08, 0, -0.008, 0.27, 0.070, 0.044);
      const jaw = sdCapsule(lx, ly, lz, 0, -0.032, 0.05, 0, -0.038, 0.23, 0.054, 0.030);

      let headD = smin(cranium, Math.min(cheekL, cheekR), 0.035);
      headD = smin(headD, bridge, 0.035);
      headD = smin(headD, jaw, 0.03);
      fur = smin(fur, headD, 0.05);

      // Orelhas grandes lanceoladas (foliculares, abertas para os lados/trÃ¡s, com interior cÃ´ncavo claro)
      const earBackL = sdCapsule(lx, ly, lz, -0.085, 0.08, -0.01, -0.235, 0.185, -0.07, 0.034, 0.044);
      const earTipL  = sdCapsule(lx, ly, lz, -0.235, 0.185, -0.07, -0.275, 0.22, -0.085, 0.040, 0.015);
      const earBackR = sdCapsule(lx, ly, lz,  0.085, 0.08, -0.01,  0.235, 0.185, -0.07, 0.034, 0.044);
      const earTipR  = sdCapsule(lx, ly, lz,  0.235, 0.185, -0.07,  0.275, 0.22, -0.085, 0.040, 0.015);
      const earsOuter = Math.min(smin(earBackL, earTipL, 0.02), smin(earBackR, earTipR, 0.02));
      fur = smin(fur, earsOuter, 0.022);

      const earInL = sdCapsule(lx, ly, lz, -0.105, 0.09, 0.015, -0.235, 0.185, -0.045, 0.020, 0.024);
      const earInR = sdCapsule(lx, ly, lz,  0.105, 0.09, 0.015,  0.235, 0.185, -0.045, 0.020, 0.024);
      const earInner = Math.min(earInL, earInR);

      // 4. Pernas articuladas realistas de ungulado (ombro -> joelho/carpo -> canela fina -> boleto -> casco fendido)
      const frontLeg = (sx: number, swing: number, lift: number) => {
        const shY = -0.04 + by, shZ = 0.22;
        const knY = -0.35 + by * 0.4 + lift * 0.42;
        const knZ = 0.20 + swing * 0.48 + lift * 0.18;
        const hfY = -0.73 + lift * 0.78;
        const hfZ = 0.22 + swing * 1.05 - lift * 0.16;
        const shoulder = sdEllipsoid(x, y, z, sx * 1.06, -0.04 + by, 0.21 + swing * 0.12, 0.075, 0.125, 0.10);
        const upper = sdCapsule(x, y, z, sx, shY, shZ, sx, knY, knZ, 0.072, 0.044);
        const knee = sdEllipsoid(x, y, z, sx, knY, knZ + 0.01, 0.046, 0.048, 0.048);
        const cannon = sdCapsule(x, y, z, sx, knY, knZ, sx, hfY, hfZ, 0.038, 0.030);
        const hoof = sdEllipsoid(x, y, z, sx, hfY - 0.012, hfZ + 0.024, 0.040, 0.032, 0.052);
        return smin(smin(shoulder, upper, 0.04), smin(smin(knee, cannon, 0.02), hoof, 0.018), 0.025);
      };
      const hindLeg = (sx: number, swing: number, lift: number) => {
        const hipY = 0.01 + by, hipZ = -0.27;
        const thigh = sdEllipsoid(x, y, z, sx * 1.08, -0.06 + by, -0.28 + swing * 0.18, 0.088, 0.155, 0.13);
        const hkY = -0.34 + by * 0.4 + lift * 0.36;
        const hkZ = -0.40 + (swing < 0 ? swing * 0.42 : swing * 0.65);
        const hfY = -0.73 + lift * 0.76;
        const hfZ = -0.31 + (swing < 0 ? swing * 1.15 : swing * 0.92);
        const upper = sdCapsule(x, y, z, sx, hipY, hipZ, sx, hkY, hkZ, 0.085, 0.046);
        const hock = sdEllipsoid(x, y, z, sx, hkY, hkZ - 0.012, 0.046, 0.052, 0.052);
        const cannon = sdCapsule(x, y, z, sx, hkY, hkZ, sx, hfY, hfZ, 0.038, 0.030);
        const hoof = sdEllipsoid(x, y, z, sx, hfY - 0.012, hfZ + 0.024, 0.040, 0.032, 0.052);
        return smin(smin(thigh, upper, 0.045), smin(smin(hock, cannon, 0.02), hoof, 0.018), 0.025);
      };

      const legs = Math.min(
        Math.min(frontLeg(-0.125, P.fl, P.flLift), frontLeg(0.125, P.fr, P.frLift)),
        Math.min(hindLeg(-0.135, P.bl, P.blLift), hindLeg(0.135, P.br, P.brLift)),
      );
      fur = smin(fur, legs, 0.04);

      // 5. Cauda de gamo/cervo (levanta no trote/salto exibindo a bandeira branca inferior)
      const tTipY = 0.01 + by + P.tailLift * 0.24;
      const tTipZ = -0.55 - P.tailLift * 0.08;
      const tailD = sdCapsule(x, y, z, 0, 0.08 + by, -0.45, 0, tTipY, tTipZ, 0.056, 0.038);
      fur = smin(fur, tailD, 0.03);

      // 6. Galhada imperial realista (8 pontas = 4 por haste: haste principal curva + brow tine + trez tine + coroa bifurcada)
      const antlerSide = (s: number) => {
        const ax = lx * s;
        // Haste principal (main beam): sobe para trÃ¡s/fora e depois arqueia para frente/cima
        const b1 = sdCapsule(ax, ly, lz, 0.052, 0.095, 0.01, 0.175, 0.245, -0.085, 0.027, 0.023);
        const b2 = sdCapsule(ax, ly, lz, 0.175, 0.245, -0.085, 0.265, 0.415, -0.035, 0.023, 0.020);
        const b3 = sdCapsule(ax, ly, lz, 0.265, 0.415, -0.035, 0.225, 0.545, 0.105, 0.020, 0.013);
        // 1Âª ponta: Brow tine (defesa frontal logo acima da testa, curvada para frente/cima)
        const browTine = sdCapsule(ax, ly, lz, 0.095, 0.145, -0.02, 0.115, 0.235, 0.135, 0.020, 0.011);
        // 2Âª ponta: Trez tine (ramo mÃ©dio apontando para frente/cima/dentro)
        const trezTine = sdCapsule(ax, ly, lz, 0.215, 0.315, -0.065, 0.185, 0.455, 0.095, 0.019, 0.011);
        // 3Âª ponta: Ramo traseiro da coroa real (back royal tine)
        const crownBack = sdCapsule(ax, ly, lz, 0.255, 0.395, -0.045, 0.305, 0.535, -0.105, 0.018, 0.011);
        const beam = smin(smin(b1, b2, 0.015), b3, 0.015);
        return smin(beam, Math.min(browTine, Math.min(trezTine, crownBack)), 0.012);
      };
      const antlers = Math.min(antlerSide(-1), antlerSide(1));

      // Olhos laterais escuros expressivos + focinho Ãºmido (rhinarium)
      const eyeL = sdEllipsoid(lx, ly, lz, -0.088, 0.042, 0.085, 0.030, 0.028, 0.032);
      const eyeR = sdEllipsoid(lx, ly, lz,  0.088, 0.042, 0.085, 0.030, 0.028, 0.032);
      const eyes = Math.min(eyeL, eyeR);
      const nose = sdEllipsoid(lx, ly, lz, 0, -0.004, 0.285, 0.036, 0.030, 0.030);

      let d = fur, mat = 'fur';
      if (tailD < fur + 0.005 && z < -0.44) mat = 'tail';
      if (earInner < d) { d = earInner; mat = 'earInner'; }
      if (antlers < d) { d = antlers; mat = 'antler'; }
      if (eyes < d) { d = eyes; mat = 'eye'; }
      if (nose < d) { d = nose; mat = 'nose'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'eye' || mat === 'nose') return 'k';
      if (mat === 'earInner') return shade > 0.45 ? 'W' : 'w1';

      const lx = x - hPivotX;
      const dy = y - hPivotY;
      const dz = z - hPivotZ;
      const lz = dz * cosP + dy * sinP;
      const ly = -dz * sinP + dy * cosP;

      if (mat === 'antler') {
        // Pontas superiores da galhada polidas como marfim claro; base Ã³ssea mais escura
        if (ly > 0.38 || (ly > 0.19 && lz > 0.07)) return shade > 0.38 ? 'a2' : 'a1';
        return shade > 0.68 ? 'a2' : shade > 0.36 ? 'a1' : 'a0';
      }

      if (mat === 'tail') {
        // Parte superior da cauda castanha; parte inferior/lateral ("bandeira") branco-creme sombreada
        const tailMidY = 0.05 + by + P.tailLift * 0.14;
        if (y > tailMidY + 0.02 && P.tailLift < 0.3) return shade > 0.55 ? 'd2' : 'd1';
        return shade > 0.62 ? 'W' : shade > 0.34 ? 'w1' : 'w0';
      }

      // Cascos fendidos escuros na ponta inferior de cada perna (acompanhando a elevaÃ§Ã£o da pata)
      if (y < -0.64 + Math.max(P.flLift, P.frLift, P.blLift, P.brLift) * 0.18 && y < -0.52) return 'k';

      // Detalhes faciais realistas: chanfro nasal escuro, anel orbital claro e queixo/garganta creme
      if (dz > -0.10 && y > 0.12 + by + P.headDip * 0.6) {
        if (ly < -0.022 && lz > 0.02 && Math.abs(lx) < 0.055) {
          return shade > 0.60 ? 'W' : shade > 0.32 ? 'w1' : 'w0';
        }
        if (ly > 0.015 && lz > 0.04 && lz < 0.24 && Math.abs(lx) < 0.042) {
          return shade > 0.55 ? 'd1' : 'd0';
        }
      }

      // Espelho traseiro creme (rump patch caracterÃ­stico dos cervÃ­deos ao redor da cauda)
      const isRumpPatch = z < -0.39 && y > -0.08 + by && y < 0.14 + by && Math.abs(x) < 0.135;
      // Barriga e garganta/peito creme com sombreamento volumÃ©trico de 3 tons (sem vazar para as pernas)
      const isBelly = y < -0.14 + by && y > -0.26 + by && Math.abs(x) < 0.125 && z > -0.25 && z < 0.30;
      const isThroatPatch = z > 0.32 + P.headFwd * 0.35 && y > 0.12 + by + P.headDip * 0.3 && y < 0.38 + by + P.headDip * 0.7 && Math.abs(x - hPivotX * 0.5) < 0.075;
      if (isRumpPatch || isBelly || isThroatPatch) {
        return shade > 0.64 ? 'W' : shade > 0.35 ? 'w1' : 'w0';
      }

      // Juba espessa escura do pescoÃ§o/peito (stag neck mane) e linha dorsal de sela
      const isNeckMane = z > 0.22 && z < 0.46 + P.headFwd * 0.5 && y > -0.14 + by && y < 0.22 + by + P.headDip * 0.4 && Math.abs(x) < 0.145;
      const isDorsalStripe = y > 0.14 + by && z > -0.32 && z < 0.24 && Math.abs(x) < 0.07;
      if (isNeckMane || isDorsalStripe) {
        return shade > 0.68 ? 'd2' : shade > 0.38 ? 'd1' : 'd0';
      }

      // Canelas inferiores levemente mais escuras (meias castanho-escuras tÃ­picas do cervo-vermelho)
      if (y < -0.36 + by * 0.3) {
        return shade > 0.62 ? 'd2' : shade > 0.32 ? 'd1' : 'd0';
      }

      return shade > 0.78 ? 'd4' : shade > 0.54 ? 'd3' : shade > 0.30 ? 'd2' : shade > 0.14 ? 'd1' : 'd0';
    };
    pack = build27Pack(DEER_PW, DEER_PH, 0.96, 0.96, DEER_PAL, evalFn, shadeFn);
    deerCache.set(pose, pack);
  }
  return pack;
}

export function getDeerPosePack(...args: Parameters<typeof buildDeerPosePack>): ReturnType<typeof buildDeerPosePack> {
  return registerAnimalSpritePack(buildDeerPosePack(...args), { module: './MoreAnimals.ts', factory: 'getDeerPosePack', args }, buildDeerPosePack);
}

// ============================================================================
// 3. URSO PARDO (Bear) â€” 112Ã—110 @ 38 PPU (2.95m Ã— 2.89m, mesma densidade dos outros bichos)
// ============================================================================
export type BearPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'walk0' | 'walk1' | 'walk2' | 'walk3' | 'walk4' | 'walk5'
  | 'rear0' | 'rear1' | 'rear2' | 'rear3'
  | 'swipe0' | 'swipe1' | 'swipe2' | 'swipe3';

export const BEAR_PW = 112;
export const BEAR_PH = 110;
export const BEAR_W = BEAR_PW / ANIMAL_PPU;
export const BEAR_H = BEAR_PH / ANIMAL_PPU;

const BEAR_PAL: Record<string, [number, number, number]> = {
  k:  [0x16, 0x10, 0x12], // contorno / nariz / olhos / boca
  b0: [0x2b, 0x1a, 0x12], // sombra profunda pelo
  b1: [0x47, 0x2c, 0x1d], // pelo escuro
  b2: [0x6b, 0x43, 0x2b], // pelo mÃ©dio castanho
  b3: [0x8f, 0x5d, 0x3c], // destaque ombros/dorso
  b4: [0xb0, 0x78, 0x50], // luz quente no topo
  s0: [0x9e, 0x78, 0x54], // focinho bege sombra
  s1: [0xc9, 0xa2, 0x79], // focinho bege claro
  c0: [0x26, 0x20, 0x1e], // garras escuras
  W:  [0xf2, 0xeb, 0xd8], // presas no rugido
};

interface BearQuadPose {
  bodyY: number;
  headY: number;
  headX: number;
  fl: number;
  fr: number;
  bl: number;
  br: number;
  flLift: number;
  frLift: number;
  blLift: number;
  brLift: number;
}

interface BearRearPose {
  bodyY: number;
  headY: number;
  roar: number;
  armL: [number, number, number, number, number, number]; // elbow xyz, hand xyz
  armR: [number, number, number, number, number, number];
}

const BEAR_QUAD_POSES: Record<'idle0' | 'idle1' | 'idle2' | 'walk0' | 'walk1' | 'walk2' | 'walk3' | 'walk4' | 'walk5', BearQuadPose> = {
  idle0: { bodyY: 0.0,   headY: 0.0,   headX: 0.0,   fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0,   flLift: 0,    frLift: 0,    blLift: 0,    brLift: 0 },
  idle1: { bodyY: 0.018, headY: 0.02,  headX: 0.025, fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0,   flLift: 0,    frLift: 0,    blLift: 0,    brLift: 0 },
  idle2: { bodyY: -0.012,headY: -0.02, headX: -0.025,fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0,   flLift: 0,    frLift: 0,    blLift: 0,    brLift: 0 },

  walk0: { bodyY: 0.015, headY: 0.01,  headX: 0.02,  fl: 0.18,  fr: -0.14, bl: -0.16, br: 0.16,  flLift: 0.08, frLift: 0.0,  blLift: 0.0,  brLift: 0.06 },
  walk1: { bodyY: 0.025, headY: 0.02,  headX: 0.01,  fl: 0.10,  fr: -0.04, bl: -0.06, br: 0.08,  flLift: 0.02, frLift: 0.06, blLift: 0.05, brLift: 0.02 },
  walk2: { bodyY: -0.01, headY: -0.01, headX: -0.01, fl: -0.04, fr: 0.08,  bl: 0.06,  br: -0.04, flLift: 0.0,  frLift: 0.09, blLift: 0.08, brLift: 0.0 },
  walk3: { bodyY: 0.015, headY: 0.01,  headX: -0.02, fl: -0.16, fr: 0.18,  bl: 0.16,  br: -0.16, flLift: 0.0,  frLift: 0.08, blLift: 0.06, brLift: 0.0 },
  walk4: { bodyY: 0.025, headY: 0.02,  headX: -0.01, fl: -0.06, fr: 0.10,  bl: 0.08,  br: -0.06, flLift: 0.06, frLift: 0.02, blLift: 0.02, brLift: 0.05 },
  walk5: { bodyY: -0.01, headY: -0.01, headX: 0.01,  fl: 0.08,  fr: -0.04, bl: -0.04, br: 0.06,  flLift: 0.09, frLift: 0.0,  blLift: 0.0,  brLift: 0.08 },
};

const BEAR_REAR_POSES: Record<'rear0' | 'rear1' | 'rear2' | 'rear3' | 'swipe0' | 'swipe1' | 'swipe2' | 'swipe3', BearRearPose> = {
  rear0:  { bodyY: -0.04, headY: -0.03, roar: 0.45, armL: [-0.42, 0.10, 0.18, -0.34, 0.16, 0.40], armR: [0.42, 0.10, 0.18, 0.34, 0.16, 0.40] },
  rear1:  { bodyY: 0.01,  headY: 0.01,  roar: 0.85, armL: [-0.45, 0.17, 0.18, -0.38, 0.30, 0.42], armR: [0.45, 0.17, 0.18, 0.38, 0.30, 0.42] },
  rear2:  { bodyY: 0.04,  headY: 0.04,  roar: 1.0,  armL: [-0.48, 0.22, 0.16, -0.42, 0.38, 0.38], armR: [0.48, 0.22, 0.16, 0.42, 0.38, 0.38] },
  rear3:  { bodyY: 0.0,   headY: 0.0,   roar: 0.65, armL: [-0.44, 0.15, 0.18, -0.35, 0.24, 0.42], armR: [0.44, 0.15, 0.18, 0.35, 0.24, 0.42] },

  swipe0: { bodyY: 0.02,  headY: 0.01,  roar: 0.75, armL: [-0.44, 0.16, 0.18, -0.36, 0.26, 0.40], armR: [0.50, 0.30, 0.06, 0.56, 0.48, 0.18] },
  swipe1: { bodyY: 0.0,   headY: -0.01, roar: 1.0,  armL: [-0.44, 0.14, 0.18, -0.38, 0.22, 0.38], armR: [0.38, 0.26, 0.28, 0.14, 0.20, 0.56] },
  swipe2: { bodyY: -0.02, headY: -0.02, roar: 0.85, armL: [-0.42, 0.14, 0.16, -0.36, 0.20, 0.36], armR: [0.32, 0.18, 0.30, -0.10, 0.06, 0.52] },
  swipe3: { bodyY: 0.0,   headY: 0.0,   roar: 0.55, armL: [-0.44, 0.16, 0.18, -0.36, 0.26, 0.42], armR: [0.40, 0.14, 0.22, 0.26, 0.18, 0.44] },
};

const bearCache = new Map<BearPoseName, Boar27Pack>();
 function buildBearPosePack(pose: BearPoseName): Boar27Pack {
  let pack = bearCache.get(pose);
  if (!pack) {
    const isRear = pose.startsWith('rear') || pose.startsWith('swipe');
    const evalFn: SdfEvaluator = (x, y, z) => {
      let fur: number;
      let snoutD: number;
      let noseD: number;
      let eyeD: number;
      let clawD = 99;
      let mouthD = 99;
      let fangD = 99;

      if (isRear) {
        const P = BEAR_REAR_POSES[pose as keyof typeof BEAR_REAR_POSES];
        const by = P.bodyY;
        const hy = P.headY + by;
        const [elLx, elLy, elLz, haLx, haLy, haLz] = P.armL;
        const [elRx, elRy, elRz, haRx, haRy, haRz] = P.armR;

        const pelvis = sdEllipsoid(x, y, z, 0, -0.26 + by * 0.5, -0.06, 0.34, 0.28, 0.28);
        const belly = sdEllipsoid(x, y, z, 0, -0.04 + by, 0.02, 0.33, 0.32, 0.29);
        const chest = sdEllipsoid(x, y, z, 0, 0.24 + by, -0.02, 0.36, 0.28, 0.27);
        const hump = sdEllipsoid(x, y, z, 0, 0.38 + by, -0.14, 0.26, 0.18, 0.20);
        const neck = sdCapsule(x, y, z, 0, 0.36 + by, 0.02, 0, 0.54 + hy, 0.12, 0.22, 0.19);
        const head = sdEllipsoid(x, y, z, 0, 0.58 + hy, 0.16, 0.23, 0.20, 0.22);
        const cheekL = sdEllipsoid(x, y, z, -0.16, 0.53 + hy, 0.14, 0.12, 0.11, 0.12);
        const cheekR = sdEllipsoid(x, y, z,  0.16, 0.53 + hy, 0.14, 0.12, 0.11, 0.12);
        const earL = sdEllipsoid(x, y, z, -0.18, 0.75 + hy, 0.10, 0.072, 0.072, 0.055);
        const earR = sdEllipsoid(x, y, z,  0.18, 0.75 + hy, 0.10, 0.072, 0.072, 0.055);
        const tail = sdEllipsoid(x, y, z, 0, -0.32 + by * 0.5, -0.34, 0.08, 0.08, 0.08);

        const shL = sdCapsule(x, y, z, -0.30, 0.28 + by, 0.02, elLx, elLy + by, elLz, 0.14, 0.115);
        const faL = sdCapsule(x, y, z, elLx, elLy + by, elLz, haLx, haLy + by, haLz, 0.115, 0.095);
        const shR = sdCapsule(x, y, z,  0.30, 0.28 + by, 0.02, elRx, elRy + by, elRz, 0.14, 0.115);
        const faR = sdCapsule(x, y, z, elRx, elRy + by, elRz, haRx, haRy + by, haRz, 0.115, 0.095);

        const thL = sdCapsule(x, y, z, -0.22, -0.32 + by * 0.4, -0.06, -0.25, -0.58, -0.04, 0.165, 0.125);
        const thR = sdCapsule(x, y, z,  0.22, -0.32 + by * 0.4, -0.06,  0.25, -0.58, -0.04, 0.165, 0.125);
        const ftL = sdCapsule(x, y, z, -0.25, -0.68, -0.06, -0.25, -0.68, 0.16, 0.115, 0.095);
        const ftR = sdCapsule(x, y, z,  0.25, -0.68, -0.06,  0.25, -0.68, 0.16, 0.115, 0.095);

        fur = smin(pelvis, belly, 0.14);
        fur = smin(fur, chest, 0.14);
        fur = smin(fur, hump, 0.12);
        fur = smin(fur, neck, 0.10);
        fur = smin(fur, head, 0.08);
        fur = smin(fur, Math.min(cheekL, cheekR), 0.06);
        fur = smin(fur, Math.min(earL, earR), 0.03);
        fur = smin(fur, tail, 0.04);
        fur = smin(fur, smin(shL, faL, 0.06), 0.07);
        fur = smin(fur, smin(shR, faR, 0.06), 0.07);
        fur = smin(fur, smin(thL, ftL, 0.05), 0.08);
        fur = smin(fur, smin(thR, ftR, 0.05), 0.08);

        const cHandL = sdEllipsoid(x, y, z, haLx, haLy + by - 0.03, haLz + 0.08, 0.075, 0.055, 0.055);
        const cHandR = sdEllipsoid(x, y, z, haRx, haRy + by - 0.03, haRz + 0.08, 0.08, 0.06, 0.06);
        const cFootL = sdEllipsoid(x, y, z, -0.25, -0.71, 0.24, 0.075, 0.045, 0.045);
        const cFootR = sdEllipsoid(x, y, z,  0.25, -0.71, 0.24, 0.075, 0.045, 0.045);
        clawD = Math.min(Math.min(cHandL, cHandR), Math.min(cFootL, cFootR));

        snoutD = sdCapsule(x, y, z, 0, 0.54 + hy, 0.28, 0, 0.52 + hy, 0.44, 0.115, 0.085);
        noseD = sdEllipsoid(x, y, z, 0, 0.55 + hy, 0.48, 0.058, 0.045, 0.045);
        const mRy = 0.03 + P.roar * 0.035;
        mouthD = sdEllipsoid(x, y, z, 0, 0.46 + hy - P.roar * 0.015, 0.39, 0.075, mRy, 0.06);
        fangD = Math.min(
          sdCapsule(x, y, z, -0.05, 0.49 + hy, 0.42, -0.05, 0.44 + hy - P.roar * 0.015, 0.43, 0.018, 0.008),
          sdCapsule(x, y, z,  0.05, 0.49 + hy, 0.42,  0.05, 0.44 + hy - P.roar * 0.015, 0.43, 0.018, 0.008),
        );
        eyeD = Math.min(
          sdEllipsoid(x, y, z, -0.105, 0.62 + hy, 0.34, 0.036, 0.036, 0.036),
          sdEllipsoid(x, y, z,  0.105, 0.62 + hy, 0.34, 0.036, 0.036, 0.036),
        );
      } else {
        const P = BEAR_QUAD_POSES[pose as keyof typeof BEAR_QUAD_POSES];
        const by = P.bodyY;
        const hy = P.headY + by;
        const hx = P.headX;

        const hump = sdEllipsoid(x, y, z, 0, 0.22 + by, 0.22, 0.30, 0.26, 0.28);
        const chest = sdEllipsoid(x, y, z, 0, 0.04 + by, 0.22, 0.35, 0.31, 0.34);
        const belly = sdEllipsoid(x, y, z, 0, 0.01 + by, -0.10, 0.36, 0.31, 0.36);
        const rump = sdEllipsoid(x, y, z, 0, 0.02 + by, -0.38, 0.33, 0.29, 0.28);
        const neck = sdCapsule(x, y, z, 0, 0.08 + by, 0.36, hx, 0.06 + hy, 0.56, 0.23, 0.20);
        const head = sdEllipsoid(x, y, z, hx, 0.07 + hy, 0.62, 0.22, 0.20, 0.22);
        const cheekL = sdEllipsoid(x, y, z, hx - 0.15, 0.02 + hy, 0.59, 0.11, 0.10, 0.11);
        const cheekR = sdEllipsoid(x, y, z, hx + 0.15, 0.02 + hy, 0.59, 0.11, 0.10, 0.11);
        const earL = sdEllipsoid(x, y, z, hx - 0.17, 0.24 + hy, 0.57, 0.07, 0.07, 0.05);
        const earR = sdEllipsoid(x, y, z, hx + 0.17, 0.24 + hy, 0.57, 0.07, 0.07, 0.05);
        const tail = sdEllipsoid(x, y, z, 0, 0.06 + by, -0.64, 0.085, 0.085, 0.085);

        const fl = sdCapsule(x, y, z, -0.23, -0.06 + by, 0.28, -0.23, -0.58 + P.flLift, 0.30 + P.fl, 0.145, 0.105);
        const fr = sdCapsule(x, y, z,  0.23, -0.06 + by, 0.28,  0.23, -0.58 + P.frLift, 0.30 + P.fr, 0.145, 0.105);
        const bl = sdCapsule(x, y, z, -0.24, -0.06 + by, -0.38, -0.24, -0.58 + P.blLift, -0.38 + P.bl, 0.155, 0.105);
        const br = sdCapsule(x, y, z,  0.24, -0.06 + by, -0.38,  0.24, -0.58 + P.brLift, -0.38 + P.br, 0.155, 0.105);

        const pawFL = sdEllipsoid(x, y, z, -0.23, -0.60 + P.flLift, 0.38 + P.fl, 0.105, 0.065, 0.12);
        const pawFR = sdEllipsoid(x, y, z,  0.23, -0.60 + P.frLift, 0.38 + P.fr, 0.105, 0.065, 0.12);
        const pawBL = sdEllipsoid(x, y, z, -0.24, -0.60 + P.blLift, -0.30 + P.bl, 0.105, 0.065, 0.13);
        const pawBR = sdEllipsoid(x, y, z,  0.24, -0.60 + P.brLift, -0.30 + P.br, 0.105, 0.065, 0.13);

        fur = smin(hump, chest, 0.14);
        fur = smin(fur, belly, 0.16);
        fur = smin(fur, rump, 0.14);
        fur = smin(fur, neck, 0.10);
        fur = smin(fur, head, 0.08);
        fur = smin(fur, Math.min(cheekL, cheekR), 0.06);
        fur = smin(fur, Math.min(earL, earR), 0.03);
        fur = smin(fur, tail, 0.05);
        fur = smin(fur, smin(fl, pawFL, 0.04), 0.08);
        fur = smin(fur, smin(fr, pawFR, 0.04), 0.08);
        fur = smin(fur, smin(bl, pawBL, 0.04), 0.08);
        fur = smin(fur, smin(br, pawBR, 0.04), 0.08);

        clawD = Math.min(
          Math.min(
            sdEllipsoid(x, y, z, -0.23, -0.62 + P.flLift, 0.49 + P.fl, 0.075, 0.038, 0.038),
            sdEllipsoid(x, y, z,  0.23, -0.62 + P.frLift, 0.49 + P.fr, 0.075, 0.038, 0.038),
          ),
          Math.min(
            sdEllipsoid(x, y, z, -0.24, -0.62 + P.blLift, -0.18 + P.bl, 0.075, 0.038, 0.038),
            sdEllipsoid(x, y, z,  0.24, -0.62 + P.brLift, -0.18 + P.br, 0.075, 0.038, 0.038),
          ),
        );

        snoutD = sdCapsule(x, y, z, hx, 0.03 + hy, 0.74, hx, 0.01 + hy, 0.90, 0.11, 0.078);
        noseD = sdEllipsoid(x, y, z, hx, 0.04 + hy, 0.94, 0.055, 0.042, 0.042);
        eyeD = Math.min(
          sdEllipsoid(x, y, z, hx - 0.105, 0.12 + hy, 0.79, 0.036, 0.036, 0.036),
          sdEllipsoid(x, y, z, hx + 0.105, 0.12 + hy, 0.79, 0.036, 0.036, 0.036),
        );
      }

      let d = fur, mat = 'fur';
      if (snoutD < d) { d = snoutD; mat = 'snout'; }
      if (mouthD < d) { d = mouthD; mat = 'mouth'; }
      if (fangD < d) { d = fangD; mat = 'fang'; }
      if (noseD < d) { d = noseD; mat = 'nose'; }
      if (clawD < d) { d = clawD; mat = 'claw'; }
      if (eyeD < d) { d = eyeD; mat = 'eye'; }
      return { d, mat };
    };
    const shadeFn: ColorShaper = (mat, shade) => {
      if (mat === 'eye' || mat === 'nose' || mat === 'mouth') return 'k';
      if (mat === 'fang') return 'W';
      if (mat === 'claw') return 'c0';
      if (mat === 'snout') return shade > 0.48 ? 's1' : 's0';
      return shade > 0.80 ? 'b4' : shade > 0.58 ? 'b3' : shade > 0.36 ? 'b2' : shade > 0.18 ? 'b1' : 'b0';
    };
    pack = build27Pack(BEAR_PW, BEAR_PH, 0.94, 0.92, BEAR_PAL, evalFn, shadeFn);
    bearCache.set(pose, pack);
  }
  return pack;
}

export function getBearPosePack(...args: Parameters<typeof buildBearPosePack>): ReturnType<typeof buildBearPosePack> {
  return registerAnimalSpritePack(buildBearPosePack(...args), { module: './MoreAnimals.ts', factory: 'getBearPosePack', args }, buildBearPosePack);
}

// ============================================================================
// 4. RAPOSA (Fox) â€” 44Ã—30 @ 38 PPU (1.16m Ã— 0.79m)
// ============================================================================
export type FoxPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'sniff0' | 'sniff1' | 'sniff2' | 'sniff3'
  | 'run0' | 'run1' | 'run2' | 'run3' | 'run4' | 'run5'
  | 'pounce0' | 'pounce1' | 'pounce2' | 'pounce3';

export const FOX_PW = 44;
export const FOX_PH = 30;
export const FOX_W = FOX_PW / ANIMAL_PPU;
export const FOX_H = FOX_PH / ANIMAL_PPU;

const FOX_PAL: Record<string, [number, number, number]> = {
  k:  [0x1c, 0x13, 0x16],
  o0: [0x8f, 0x34, 0x16], // laranja escuro
  o1: [0xc9, 0x52, 0x1e], // laranja vivo
  o2: [0xed, 0x7b, 0x2f], // laranja claro
  o3: [0xfc, 0xab, 0x53], // destaque dourado
  W:  [0xf7, 0xf2, 0xe8], // ponta da cauda / peito branco
  w0: [0xd6, 0xce, 0xc0],
};

interface FoxPose {
  bodyY: number;
  headDip: number;
  headSway: number;
  fl: number;
  fr: number;
  bl: number;
  br: number;
  tailLift: number;
  tailSway: number;
}

const FOX_POSES: Record<FoxPoseName, FoxPose> = {
  idle0:   { bodyY: 0.0,   headDip: 0.0,   headSway: 0.0,   fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0,   tailLift: 0.0,  tailSway: 0.0 },
  idle1:   { bodyY: 0.01,  headDip: 0.02,  headSway: 0.02,  fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0,   tailLift: 0.05, tailSway: 0.08 },
  idle2:   { bodyY: -0.01, headDip: -0.01, headSway: -0.02, fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0,   tailLift: 0.02, tailSway: -0.08 },

  sniff0:  { bodyY: -0.01, headDip: -0.15, headSway: 0.0,   fl: 0.04,  fr: -0.02, bl: 0.0,   br: 0.0,   tailLift: 0.10, tailSway: 0.06 },
  sniff1:  { bodyY: -0.02, headDip: -0.28, headSway: -0.04, fl: 0.06,  fr: -0.03, bl: 0.0,   br: 0.0,   tailLift: 0.16, tailSway: 0.14 },
  sniff2:  { bodyY: -0.02, headDip: -0.26, headSway: 0.04,  fl: 0.06,  fr: -0.03, bl: 0.0,   br: 0.0,   tailLift: 0.16, tailSway: -0.14 },
  sniff3:  { bodyY: 0.0,   headDip: -0.12, headSway: 0.01,  fl: 0.03,  fr: -0.01, bl: 0.0,   br: 0.0,   tailLift: 0.08, tailSway: -0.05 },

  run0:    { bodyY: 0.01,  headDip: -0.04, headSway: 0.0,   fl: 0.26,  fr: -0.16, bl: -0.24, br: 0.18,  tailLift: 0.12, tailSway: 0.06 },
  run1:    { bodyY: 0.03,  headDip: -0.05, headSway: 0.0,   fl: 0.14,  fr: -0.04, bl: -0.12, br: 0.08,  tailLift: 0.16, tailSway: 0.09 },
  run2:    { bodyY: -0.01, headDip: -0.03, headSway: 0.0,   fl: -0.04, fr: 0.12,  bl: 0.08,  br: -0.08, tailLift: 0.10, tailSway: 0.04 },
  run3:    { bodyY: 0.01,  headDip: -0.04, headSway: 0.0,   fl: -0.18, fr: 0.26,  bl: 0.20,  br: -0.24, tailLift: 0.06, tailSway: -0.06 },
  run4:    { bodyY: 0.03,  headDip: -0.05, headSway: 0.0,   fl: -0.06, fr: 0.14,  bl: 0.10,  br: -0.12, tailLift: 0.10, tailSway: -0.09 },
  run5:    { bodyY: -0.01, headDip: -0.03, headSway: 0.0,   fl: 0.12,  fr: -0.04, bl: -0.08, br: 0.08,  tailLift: 0.14, tailSway: -0.03 },

  pounce0: { bodyY: -0.07, headDip: -0.12, headSway: 0.0,   fl: 0.10,  fr: 0.06,  bl: 0.10,  br: 0.08,  tailLift: 0.20, tailSway: 0.08 },
  pounce1: { bodyY: 0.06,  headDip: 0.02,  headSway: 0.0,   fl: 0.34,  fr: 0.28,  bl: -0.32, br: -0.26, tailLift: 0.14, tailSway: 0.0 },
  pounce2: { bodyY: 0.03,  headDip: -0.20, headSway: 0.0,   fl: 0.30,  fr: 0.26,  bl: -0.24, br: -0.20, tailLift: 0.34, tailSway: 0.0 },
  pounce3: { bodyY: -0.04, headDip: -0.18, headSway: 0.0,   fl: 0.22,  fr: 0.18,  bl: -0.06, br: -0.04, tailLift: 0.22, tailSway: -0.04 },
};

const foxCache = new Map<FoxPoseName, Boar27Pack>();
 function buildFoxPosePack(pose: FoxPoseName): Boar27Pack {
  let pack = foxCache.get(pose);
  if (!pack) {
    const P = FOX_POSES[pose];
    const evalFn: SdfEvaluator = (x, y, z) => {
      const by = P.bodyY;
      const hy = P.headDip + by;
      const hx = P.headSway;
      const body = sdEllipsoid(x, y, z, 0, -0.02 + by, 0.0, 0.20, 0.19, 0.38);
      const head = sdEllipsoid(x, y, z, hx, 0.18 + hy, 0.42, 0.16, 0.14, 0.17);
      const snout = sdCapsule(x, y, z, hx, 0.15 + hy, 0.48, hx, 0.12 + hy, 0.72, 0.085, 0.035);
      const earL = sdCapsule(x, y, z, hx - 0.10, 0.28 + hy, 0.38, hx - 0.15, 0.48 + hy, 0.36, 0.058, 0.02);
      const earR = sdCapsule(x, y, z, hx + 0.10, 0.28 + hy, 0.38, hx + 0.15, 0.48 + hy, 0.36, 0.058, 0.02);
      const tail = sdCapsule(x, y, z, 0, 0.0 + by, -0.34, P.tailSway, 0.06 + by + P.tailLift, -0.84, 0.13, 0.09);

      let fur = smin(body, head, 0.10);
      fur = smin(fur, snout, 0.04);
      fur = smin(fur, Math.min(earL, earR), 0.03);
      fur = smin(fur, tail, 0.06);

      const fl = sdCapsule(x, y, z, -0.12, -0.08 + by, 0.22, -0.12, -0.48, 0.24 + P.fl, 0.068, 0.042);
      const fr = sdCapsule(x, y, z,  0.12, -0.08 + by, 0.22,  0.12, -0.48, 0.24 + P.fr, 0.068, 0.042);
      const bl = sdCapsule(x, y, z, -0.13, -0.08 + by, -0.24, -0.13, -0.48, -0.24 + P.bl, 0.075, 0.042);
      const br = sdCapsule(x, y, z,  0.13, -0.08 + by, -0.24,  0.13, -0.48, -0.24 + P.br, 0.075, 0.042);
      fur = smin(fur, Math.min(Math.min(fl, fr), Math.min(bl, br)), 0.04);

      const eyeL = sdEllipsoid(x, y, z, hx - 0.10, 0.22 + hy, 0.52, 0.036, 0.036, 0.036);
      const eyeR = sdEllipsoid(x, y, z, hx + 0.10, 0.22 + hy, 0.52, 0.036, 0.036, 0.036);
      const nose = sdEllipsoid(x, y, z, hx, 0.12 + hy, 0.74, 0.038, 0.034, 0.034);

      let d = fur, mat = 'fur';
      if (Math.min(eyeL, eyeR) < d) { d = Math.min(eyeL, eyeR); mat = 'eye'; }
      if (nose < d) { d = nose; mat = 'nose'; }
      return { d, mat };
    };
    const shadeFn: ColorShaper = (mat, shade, _x, y, z) => {
      if (mat === 'eye' || mat === 'nose') return 'k';
      if (y < -0.34) return 'k'; // patinhas pretas
      if (y > 0.39 + P.headDip + P.bodyY && z > 0.25) return 'k'; // pontas pretas das orelhas
      if (z < -0.66) return shade > 0.45 ? 'W' : 'w0'; // ponta branca da cauda
      if (y < 0.08 + P.headDip + P.bodyY && z > 0.26) return shade > 0.45 ? 'W' : 'w0'; // bochecha/peito branco
      return shade > 0.72 ? 'o3' : shade > 0.48 ? 'o2' : shade > 0.25 ? 'o1' : 'o0';
    };
    pack = build27Pack(FOX_PW, FOX_PH, 0.94, 0.74, FOX_PAL, evalFn, shadeFn);
    foxCache.set(pose, pack);
  }
  return pack;
}

export function getFoxPosePack(...args: Parameters<typeof buildFoxPosePack>): ReturnType<typeof buildFoxPosePack> {
  return registerAnimalSpritePack(buildFoxPosePack(...args), { module: './MoreAnimals.ts', factory: 'getFoxPosePack', args }, buildFoxPosePack);
}

// ============================================================================
// 5. SAPO (Frog) — re-exported from ./Frog (flagship rebuild)
// ============================================================================
export {
  Frog,
  getFrogPosePack,
  FROG_PW,
  FROG_PH,
  FROG_W,
  FROG_H,
  type FrogPoseName,
} from './Frog';

// ============================================================================
// 6. TARTARUGA (Turtle) â€” 22Ã—16 @ 38 PPU (0.58m Ã— 0.42m)
// ============================================================================
export type TurtlePoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'walk0' | 'walk1' | 'walk2' | 'walk3' | 'walk4' | 'walk5'
  | 'shell0' | 'shell1' | 'shell2';

export const TURTLE_PW = 22;
export const TURTLE_PH = 16;
export const TURTLE_W = TURTLE_PW / ANIMAL_PPU;
export const TURTLE_H = TURTLE_PH / ANIMAL_PPU;

const TURTLE_PAL: Record<string, [number, number, number]> = {
  k:  [0x17, 0x1c, 0x16],
  s0: [0x2f, 0x45, 0x26], // casco verde-oliva escuro
  s1: [0x4c, 0x6b, 0x34], // casco mÃ©dio
  s2: [0x70, 0x94, 0x46], // casco claro
  r0: [0xb8, 0x9b, 0x56], // borda do casco / barriga
  r1: [0xe3, 0xc7, 0x7d],
  g0: [0x48, 0x7a, 0x45], // pele cabeÃ§a/patas sombra
  g1: [0x73, 0xb0, 0x62], // pele cabeÃ§a/patas clara
};

interface TurtlePose {
  bodyY: number;
  headY: number;
  retract: number; // 0 = fora, 1 = totalmente recolhida
  fl: number;
  fr: number;
  bl: number;
  br: number;
}

const TURTLE_POSES: Record<TurtlePoseName, TurtlePose> = {
  idle0:  { bodyY: 0.0,   headY: 0.0,   retract: 0.0,  fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0 },
  idle1:  { bodyY: 0.006, headY: 0.025, retract: 0.0,  fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0 },
  idle2:  { bodyY: -0.005,headY: -0.02, retract: 0.0,  fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0 },

  walk0:  { bodyY: 0.008, headY: 0.01,  retract: 0.0,  fl: 0.14,  fr: -0.10, bl: -0.12, br: 0.12 },
  walk1:  { bodyY: 0.012, headY: 0.015, retract: 0.0,  fl: 0.08,  fr: -0.04, bl: -0.06, br: 0.06 },
  walk2:  { bodyY: 0.0,   headY: 0.0,   retract: 0.0,  fl: -0.04, fr: 0.06,  bl: 0.06,  br: -0.04 },
  walk3:  { bodyY: 0.008, headY: 0.01,  retract: 0.0,  fl: -0.12, fr: 0.14,  bl: 0.12,  br: -0.12 },
  walk4:  { bodyY: 0.012, headY: 0.015, retract: 0.0,  fl: -0.06, fr: 0.08,  bl: 0.06,  br: -0.06 },
  walk5:  { bodyY: 0.0,   headY: 0.0,   retract: 0.0,  fl: 0.06,  fr: -0.04, bl: -0.04, br: 0.06 },

  shell0: { bodyY: -0.02, headY: -0.03, retract: 0.45, fl: -0.04, fr: -0.04, bl: 0.04,  br: 0.04 },
  shell1: { bodyY: -0.04, headY: -0.05, retract: 0.80, fl: -0.06, fr: -0.06, bl: 0.06,  br: 0.06 },
  shell2: { bodyY: -0.05, headY: -0.06, retract: 1.0,  fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0 },
};

const turtleCache = new Map<TurtlePoseName, Boar27Pack>();
 function buildTurtlePosePack(pose: TurtlePoseName): Boar27Pack {
  let pack = turtleCache.get(pose);
  if (!pack) {
    const P = TURTLE_POSES[pose];
    const evalFn: SdfEvaluator = (x, y, z) => {
      const by = P.bodyY;
      const dome = sdEllipsoid(x, y, z, 0, 0.04 + by, -0.02, 0.42, 0.30, 0.48);
      const rim = sdEllipsoid(x, y, z, 0, -0.14 + by, -0.02, 0.45, 0.10, 0.51);
      const shellD = smin(dome, rim, 0.06);

      if (P.retract >= 0.99) return { d: shellD, mat: y < -0.10 + by ? 'rim' : 'shell' };

      const pull = P.retract;
      const hZ = 0.68 - pull * 0.28;
      const nZ = 0.62 - pull * 0.26;
      const legPull = pull * 0.12;
      const legY = -0.34 + pull * 0.14;

      const neck = sdCapsule(x, y, z, 0, -0.06 + by, 0.36 - pull * 0.12, 0, 0.04 + by + P.headY, nZ, 0.09, 0.085);
      const head = sdEllipsoid(x, y, z, 0, 0.06 + by + P.headY, hZ, 0.12, 0.11, 0.14);
      const tail = sdCapsule(x, y, z, 0, -0.12 + by, -0.44, 0, -0.14 + by, -0.62 + pull * 0.18, 0.06, 0.025);
      const fl = sdCapsule(x, y, z, -0.28, -0.16 + by, 0.24, -0.34 + legPull, legY, 0.28 + P.fl, 0.095, 0.08);
      const fr = sdCapsule(x, y, z,  0.28, -0.16 + by, 0.24,  0.34 - legPull, legY, 0.28 + P.fr, 0.095, 0.08);
      const bl = sdCapsule(x, y, z, -0.28, -0.16 + by, -0.26, -0.34 + legPull, legY, -0.26 + P.bl, 0.095, 0.08);
      const br = sdCapsule(x, y, z,  0.28, -0.16 + by, -0.26,  0.34 - legPull, legY, -0.26 + P.br, 0.095, 0.08);
      const skin = Math.min(smin(neck, head, 0.05), Math.min(tail, Math.min(Math.min(fl, fr), Math.min(bl, br))));

      const eyeL = sdEllipsoid(x, y, z, -0.09, 0.10 + by + P.headY, hZ + 0.07, 0.034, 0.034, 0.034);
      const eyeR = sdEllipsoid(x, y, z,  0.09, 0.10 + by + P.headY, hZ + 0.07, 0.034, 0.034, 0.034);

      let d = shellD, mat = y < -0.10 + by ? 'rim' : 'shell';
      if (skin < d) { d = skin; mat = 'skin'; }
      if (Math.min(eyeL, eyeR) < d) { d = Math.min(eyeL, eyeR); mat = 'eye'; }
      return { d, mat };
    };
    const shadeFn: ColorShaper = (mat, shade, x, _y, z) => {
      if (mat === 'eye') return 'k';
      if (mat === 'rim') return shade > 0.48 ? 'r1' : 'r0';
      if (mat === 'skin') return shade > 0.48 ? 'g1' : 'g0';
      const pat = (Math.sin(x * 14) * Math.cos(z * 14)) > 0.35;
      if (pat) return 's0';
      return shade > 0.62 ? 's2' : shade > 0.34 ? 's1' : 's0';
    };
    pack = build27Pack(TURTLE_PW, TURTLE_PH, 0.86, 0.64, TURTLE_PAL, evalFn, shadeFn);
    turtleCache.set(pose, pack);
  }
  return pack;
}

export function getTurtlePosePack(...args: Parameters<typeof buildTurtlePosePack>): ReturnType<typeof buildTurtlePosePack> {
  return registerAnimalSpritePack(buildTurtlePosePack(...args), { module: './MoreAnimals.ts', factory: 'getTurtlePosePack', args }, buildTurtlePosePack);
}

// ============================================================================
// INSTÃ‚NCIAS NA ARENA (Wolf, Deer, Bear, Fox, Frog, Turtle)
// ============================================================================
class LandWildlife<TPose extends string> extends BasePixelAnimal {
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
  protected animClock = rand(0, 10);

  constructor(
    ctx: GameContext,
    startPos: THREE.Vector3,
    private readonly cfg: {
      name: string;
      hp: number;
      radius: number;
      height: number;
      centerY: number;
      altCenterY?: (pose: TPose) => number;
      pw: number;
      ph: number;
      w: number;
      h: number;
      walkSpeed: number;
      reactSpeed: number;
      reactDist: number;
      bobAmp?: number;
      gaitRate?: number;
      hopMove?: boolean;
      hopVel?: number;
      hopPause?: number;
      reactHop?: boolean;
      fleeFromPlayer?: boolean;
      hideInShell?: boolean;
      standStillOnReact?: boolean;
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
    const dmg = this.cfg.hideInShell && this.state === 'react' ? Math.max(2, Math.round(hit.damage * 0.25)) : hit.damage;
    this.hp = Math.max(0, this.hp - dmg);
    res.damage = dmg;
    this.flash = 1.0;
    this.vel.x += hit.dir.x * 4.2;
    this.vel.z += hit.dir.z * 4.2;
    this.vel.y = 3.2;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.state = 'react';
      this.stateT = 0;
      this.stateDur = 2.0;
    }
    return res;
  }

  update(dt: number, target: EnemyTarget | null, camera: THREE.Camera, drawingBufferSize?: THREE.Vector2) {
    if (dt > 0) {
      this.stateT += dt;
      this.animClock += dt;
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
          this.stateDur = 1.9;
        }

        if (this.state === 'idle') {
          if (this.stateT >= this.stateDur) {
            this.state = Math.random() < 0.35 ? 'special' : 'move';
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
            this.stateDur = rand(1.6, 2.8);
          }
        } else if (this.state === 'move') {
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 6);
          if (this.cfg.hopMove) {
            if (this.motor.grounded) {
              if (this.hopCooldown <= 0) {
                this.vel.y = this.cfg.hopVel ?? 4.6;
                this.hopCooldown = this.cfg.hopPause ?? 0.35;
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
            this.stateDur = rand(1.4, 2.6);
          }
        } else if (this.state === 'react') {
          if (this.cfg.hideInShell) {
            speed = 0;
          } else if (target && target.alive) {
            this.targetYaw = this.cfg.fleeFromPlayer
              ? Math.atan2(this.position.x - target.position.x, this.position.z - target.position.z)
              : Math.atan2(target.position.x - this.position.x, target.position.z - this.position.z);
            this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 9);
            if (this.cfg.standStillOnReact) {
              speed = 0;
            } else if (this.cfg.hopMove) {
              if (this.motor.grounded) {
                if (this.hopCooldown <= 0) {
                  this.vel.y = (this.cfg.hopVel ?? 4.8) + 0.5;
                  this.hopCooldown = (this.cfg.hopPause ?? 0.35) * 0.45;
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
                this.vel.y = this.cfg.hopVel ?? 5.0;
                this.hopCooldown = 0.72;
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
        this.vel.y -= 20 * dt;
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
    const cy = this.cfg.altCenterY ? this.cfg.altCenterY(pose) : this.cfg.centerY;
    const deathSink = this.alive ? 0 : Math.min(0.22, this.deadT * 0.4);
    this.renderBillboard(this.cfg.getPack(pose), this.position.y + cy + bob - deathSink, camera, drawingBufferSize);
  }
}

function pickCycle<T>(frames: readonly T[], idx: number): T {
  return sampleAnimalCycle(frames, idx);
}

const WOLF_IDLE: readonly WolfPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const WOLF_HOWL: readonly WolfPoseName[] = ['howl0', 'howl1', 'howl2', 'howl3'];
const WOLF_RUN: readonly WolfPoseName[] = ['run0', 'run1', 'run2', 'run3', 'run4', 'run5'];

const DEER_IDLE: readonly DeerPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const DEER_GRAZE: readonly DeerPoseName[] = ['graze0', 'graze1', 'graze2', 'graze3'];
const DEER_TROT: readonly DeerPoseName[] = ['trot0', 'trot1', 'trot2', 'trot3', 'trot4', 'trot5'];

const BEAR_IDLE: readonly BearPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const BEAR_WALK: readonly BearPoseName[] = ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'];
const BEAR_REAR: readonly BearPoseName[] = ['rear0', 'rear1', 'rear2', 'rear3'];
const BEAR_SWIPE: readonly BearPoseName[] = ['swipe0', 'swipe1', 'swipe2', 'swipe3'];

const FOX_IDLE: readonly FoxPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const FOX_SNIFF: readonly FoxPoseName[] = ['sniff0', 'sniff1', 'sniff2', 'sniff3'];
const FOX_RUN: readonly FoxPoseName[] = ['run0', 'run1', 'run2', 'run3', 'run4', 'run5'];

const TURTLE_IDLE: readonly TurtlePoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const TURTLE_WALK: readonly TurtlePoseName[] = ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'];

export class Wolf extends LandWildlife<WolfPoseName> {
  constructor(ctx: GameContext, pos: THREE.Vector3) {
    super(ctx, pos, {
      name: 'WolfBillboard', hp: 65, radius: 0.48, height: 0.95, centerY: 0.47,
      pw: WOLF_PW, ph: WOLF_PH, w: WOLF_W, h: WOLF_H,
      walkSpeed: 2.6, reactSpeed: 5.0, reactDist: 4.5,
      bobAmp: 0.04, gaitRate: 6.2, reactHop: true, hopVel: 3.8, fleeFromPlayer: false,
      getPack: getWolfPosePack,
      pickPose: (s, t, g, gr, vy, alive) => {
        if (!alive) return 'idle0';
        if (!gr) return vy > 1.6 ? 'lunge1' : vy > -1.0 ? 'lunge2' : 'lunge0';
        if (s === 'special') return pickCycle(WOLF_HOWL, t * 2.8);
        if (s === 'react') return pickCycle(WOLF_RUN, (g / Math.PI) * 3.2);
        if (s === 'move') return pickCycle(WOLF_RUN, (g / Math.PI) * 2.4);
        return pickCycle(WOLF_IDLE, t * 2.2);
      },
    });
  }
}

export class Deer extends LandWildlife<DeerPoseName> {
  constructor(ctx: GameContext, pos: THREE.Vector3) {
    super(ctx, pos, {
      name: 'DeerBillboard', hp: 55, radius: 0.55, height: 1.75, centerY: 0.86,
      pw: DEER_PW, ph: DEER_PH, w: DEER_W, h: DEER_H,
      walkSpeed: 2.2, reactSpeed: 5.6, reactDist: 4.4,
      bobAmp: 0.045, gaitRate: 5.4, reactHop: true, hopVel: 5.4, fleeFromPlayer: true,
      getPack: getDeerPosePack,
      pickPose: (s, t, g, gr, vy, alive) => {
        if (!alive) return 'idle0';
        if (!gr) return vy > 2.8 ? 'leap0' : vy > 0.6 ? 'leap1' : vy > -1.8 ? 'leap2' : 'leap3';
        if (s === 'special') return pickCycle(DEER_GRAZE, t * 2.4);
        if (s === 'move' || s === 'react') return pickCycle(DEER_TROT, (g / Math.PI) * 2.6);
        return pickCycle(DEER_IDLE, t * 2.0);
      },
    });
  }
}

export class Bear extends LandWildlife<BearPoseName> {
  constructor(ctx: GameContext, pos: THREE.Vector3) {
    super(ctx, pos, {
      name: 'BearBillboard', hp: 200, radius: 1.05, height: 2.40, centerY: 1.00,
      altCenterY: (pose) => (pose.startsWith('rear') || pose.startsWith('swipe') ? 1.18 : 1.00),
      pw: BEAR_PW, ph: BEAR_PH, w: BEAR_W, h: BEAR_H,
      walkSpeed: 2.1, reactSpeed: 0, reactDist: 4.8,
      bobAmp: 0.05, gaitRate: 4.0, standStillOnReact: true, fleeFromPlayer: false,
      getPack: getBearPosePack,
      pickPose: (s, t, g, _gr, _vy, alive) => {
        if (!alive) return 'idle0';
        if (s === 'react') return pickCycle(BEAR_SWIPE, t * 5.2);
        if (s === 'special') return pickCycle(BEAR_REAR, t * 3.0);
        if (s === 'move') return pickCycle(BEAR_WALK, (g / Math.PI) * 2.4);
        return pickCycle(BEAR_IDLE, t * 1.8);
      },
    });
  }
}

export class Fox extends LandWildlife<FoxPoseName> {
  constructor(ctx: GameContext, pos: THREE.Vector3) {
    super(ctx, pos, {
      name: 'FoxBillboard', hp: 40, radius: 0.34, height: 0.60, centerY: 0.28,
      pw: FOX_PW, ph: FOX_PH, w: FOX_W, h: FOX_H,
      walkSpeed: 2.5, reactSpeed: 5.2, reactDist: 3.8,
      bobAmp: 0.035, gaitRate: 6.5, reactHop: true, hopVel: 4.4, fleeFromPlayer: true,
      getPack: getFoxPosePack,
      pickPose: (s, t, g, gr, vy, alive) => {
        if (!alive) return 'idle0';
        if (!gr) return vy > 2.2 ? 'pounce1' : vy > -0.8 ? 'pounce2' : 'pounce3';
        if (s === 'special') return pickCycle(FOX_SNIFF, t * 3.4);
        if (s === 'move' || s === 'react') return pickCycle(FOX_RUN, (g / Math.PI) * 2.8);
        return pickCycle(FOX_IDLE, t * 2.4);
      },
    });
  }
}

export class Turtle extends LandWildlife<TurtlePoseName> {
  constructor(ctx: GameContext, pos: THREE.Vector3) {
    super(ctx, pos, {
      name: 'TurtleBillboard', hp: 70, radius: 0.28, height: 0.34, centerY: 0.13,
      pw: TURTLE_PW, ph: TURTLE_PH, w: TURTLE_W, h: TURTLE_H,
      walkSpeed: 0.85, reactSpeed: 0, reactDist: 2.6,
      bobAmp: 0.01, gaitRate: 3.6, hideInShell: true,
      getPack: getTurtlePosePack,
      pickPose: (s, t, g, _gr, _vy, alive) => {
        if (!alive) return 'shell2';
        if (s === 'react') return t < 0.14 ? 'shell0' : t < 0.28 ? 'shell1' : 'shell2';
        if (s === 'move') return pickCycle(TURTLE_WALK, (g / Math.PI) * 2.2);
        return pickCycle(TURTLE_IDLE, t * 1.6);
      },
    });
  }
}
