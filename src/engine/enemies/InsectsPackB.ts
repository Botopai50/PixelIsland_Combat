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
// 1. MINHOCA (Earthworm) — 26×12
// ============================================================================
export type EarthwormPoseName = 'crawl0' | 'crawl1' | 'crawl2' | 'crawl3' | 'crawl4' | 'crawl5';
export const EARTHWORM_PW = 26;
export const EARTHWORM_PH = 12;
export const EARTHWORM_W = EARTHWORM_PW / ANIMAL_PPU;
export const EARTHWORM_H = EARTHWORM_PH / ANIMAL_PPU;

const EARTHWORM_PAL: Record<string, [number, number, number]> = {
  k:  [0x24, 0x0e, 0x12],
  p0: [0x82, 0x35, 0x42],
  p1: [0xb8, 0x56, 0x64],
  p2: [0xe0, 0x7c, 0x89],
  p3: [0xf7, 0xad, 0xb6],
  c0: [0xd9, 0x9c, 0x8c], // pale clitellum band shadow
  c1: [0xf7, 0xd4, 0xc6], // pale clitellum band
};

const earthwormCache = new Map<EarthwormPoseName, Boar27Pack>();
 function buildEarthwormPosePack(pose: EarthwormPoseName): Boar27Pack {
  let pack = earthwormCache.get(pose);
  if (!pack) {
    const idx = parseInt(pose.slice(5), 10);
    const ph = (idx / 6) * Math.PI * 2;
    const evalFn: SdfEvaluator = (x, y, z) => {
      const s0 = Math.sin(ph) * 0.08;
      const s1 = Math.sin(ph + 1.4) * 0.09;
      const s2 = Math.sin(ph + 2.8) * 0.08;
      const h1 = Math.max(0, Math.cos(ph + 1.0)) * 0.07;
      const seg1 = sdCapsule(x, y, z, s0, -0.06, 0.56, s1, -0.04 + h1, 0.14, 0.072, 0.088);
      const seg2 = sdCapsule(x, y, z, s1, -0.04 + h1, 0.14, s2, -0.06, -0.24, 0.086, 0.078);
      const seg3 = sdCapsule(x, y, z, s2, -0.06, -0.24, -s0 * 0.7, -0.07, -0.60, 0.076, 0.056);
      // Slight swollen clitellum collar near front third
      const clit = sdEllipsoid(x, y, z, (s0 + s1) * 0.5, -0.05 + h1 * 0.5, 0.24, 0.098, 0.092, 0.11);
      const d = smin(smin(seg1, seg2, 0.03), smin(seg3, clit, 0.025), 0.03);
      return { d, mat: 'worm' };
    };
    const shadeFn: ColorShaper = (_mat, shade, _x, _y, z) => {
      if (z > 0.15 && z < 0.34) return shade > 0.45 ? 'c1' : 'c0';
      if (Math.sin(z * 48) > 0.78) return 'p0';
      return shade > 0.76 ? 'p3' : shade > 0.48 ? 'p2' : shade > 0.22 ? 'p1' : 'p0';
    };
    pack = build27Pack(EARTHWORM_PW, EARTHWORM_PH, 0.86, 0.44, EARTHWORM_PAL, evalFn, shadeFn);
    earthwormCache.set(pose, pack);
  }
  return pack;
}

export function getEarthwormPosePack(...args: Parameters<typeof buildEarthwormPosePack>): ReturnType<typeof buildEarthwormPosePack> {
  return registerAnimalSpritePack(buildEarthwormPosePack(...args), { module: './InsectsPackB.ts', factory: 'getEarthwormPosePack', args }, buildEarthwormPosePack);
}

// ============================================================================
// 2. FORMIGA (Ant) — 20×14
// ============================================================================
export type AntPoseName = 'walk0' | 'walk1' | 'walk2' | 'walk3' | 'walk4' | 'walk5';
export const ANT_PW = 20;
export const ANT_PH = 14;
export const ANT_W = ANT_PW / ANIMAL_PPU;
export const ANT_H = ANT_PH / ANIMAL_PPU;

const ANT_PAL: Record<string, [number, number, number]> = {
  k:  [0x14, 0x08, 0x06],
  w:  [0xfc, 0xfa, 0xf2],
  a0: [0x3d, 0x11, 0x0b], // glossy crimson-brown shadow
  a1: [0x6e, 0x20, 0x14], // rich crimson-brown
  a2: [0xa6, 0x35, 0x21], // glossy red-chestnut midtone
  a3: [0xd9, 0x5e, 0x41], // specular carapace gleam
};

const antCache = new Map<AntPoseName, Boar27Pack>();
 function buildAntPosePack(pose: AntPoseName): Boar27Pack {
  let pack = antCache.get(pose);
  if (!pack) {
    const idx = parseInt(pose.slice(4), 10);
    const ph = (idx / 6) * Math.PI * 2;
    const evalFn: SdfEvaluator = (x, y, z) => {
      // 3-segmented ant body: gaster (abdomen), thorax, head
      const gaster = sdEllipsoid(x, y, z, 0, 0.04, -0.32, 0.16, 0.15, 0.22);
      const thorax = sdEllipsoid(x, y, z, 0, 0.02, 0.02, 0.095, 0.095, 0.15);
      const head   = sdEllipsoid(x, y, z, 0, 0.05, 0.28, 0.125, 0.11, 0.125);
      // Mandibles & bent antennae
      const mandL = sdCapsule(x, y, z, -0.05, 0.00, 0.38, -0.02, -0.02, 0.48, 0.025, 0.012);
      const mandR = sdCapsule(x, y, z,  0.05, 0.00, 0.38,  0.02, -0.02, 0.48, 0.025, 0.012);
      const antL  = smin(
        sdCapsule(x, y, z, -0.05, 0.11, 0.34, -0.14, 0.24, 0.44, 0.018, 0.014),
        sdCapsule(x, y, z, -0.14, 0.24, 0.44, -0.22, 0.18, 0.56, 0.014, 0.010),
        0.01,
      );
      const antR  = smin(
        sdCapsule(x, y, z,  0.05, 0.11, 0.34,  0.14, 0.24, 0.44, 0.018, 0.014),
        sdCapsule(x, y, z,  0.14, 0.24, 0.44,  0.22, 0.18, 0.56, 0.014, 0.010),
        0.01,
      );
      // 6 tripod legs
      let legs = 99;
      const lz = [0.10, 0.0, -0.10];
      for (let i = 0; i < 3; i++) {
        for (let s = -1; s <= 1; s += 2) {
          const st = Math.sin(ph + (i % 2) * Math.PI + (s > 0 ? Math.PI : 0)) * 0.08;
          const lf = Math.max(0, Math.cos(ph + (i % 2) * Math.PI + (s > 0 ? Math.PI : 0))) * 0.05;
          const l = sdCapsule(x, y, z, s * 0.07, -0.02, lz[i], s * 0.28, -0.20 + lf, lz[i] + st, 0.026, 0.016);
          legs = Math.min(legs, l);
        }
      }
      let d = smin(smin(gaster, thorax, 0.025), head, 0.025);
      d = Math.min(d, Math.min(Math.min(mandL, mandR), Math.min(antL, antR)));
      d = Math.min(d, legs);
      const eyeL = sdEllipsoid(x, y, z, -0.095, 0.08, 0.33, 0.028, 0.028, 0.026);
      const eyeR = sdEllipsoid(x, y, z,  0.095, 0.08, 0.33, 0.028, 0.028, 0.026);
      if (Math.min(eyeL, eyeR) < d) return { d: Math.min(eyeL, eyeR), mat: 'eye' };
      return { d, mat: 'ant' };
    };
    const shadeFn: ColorShaper = (mat, shade) => {
      if (mat === 'eye') return 'k';
      return shade > 0.78 ? 'a3' : shade > 0.50 ? 'a2' : shade > 0.24 ? 'a1' : 'a0';
    };
    pack = build27Pack(ANT_PW, ANT_PH, 0.80, 0.56, ANT_PAL, evalFn, shadeFn);
    antCache.set(pose, pack);
  }
  return pack;
}

export function getAntPosePack(...args: Parameters<typeof buildAntPosePack>): ReturnType<typeof buildAntPosePack> {
  return registerAnimalSpritePack(buildAntPosePack(...args), { module: './InsectsPackB.ts', factory: 'getAntPosePack', args }, buildAntPosePack);
}

// ============================================================================
// 3. LAGARTA (Caterpillar) — 26×14
// ============================================================================
export type CaterpillarPoseName = 'crawl0' | 'crawl1' | 'crawl2' | 'crawl3' | 'crawl4' | 'crawl5';
export const CATERPILLAR_PW = 26;
export const CATERPILLAR_PH = 14;
export const CATERPILLAR_W = CATERPILLAR_PW / ANIMAL_PPU;
export const CATERPILLAR_H = CATERPILLAR_PH / ANIMAL_PPU;

const CATERPILLAR_PAL: Record<string, [number, number, number]> = {
  k:  [0x12, 0x1c, 0x10],
  w:  [0xfc, 0xfc, 0xf2],
  g0: [0x1c, 0x5c, 0x22],
  g1: [0x34, 0x9c, 0x35],
  g2: [0x5e, 0xd4, 0x44],
  g3: [0xa0, 0xf5, 0x62],
  y0: [0xd9, 0xa8, 0x1e], // yellow ring band
  y1: [0xff, 0xe4, 0x4d], // bright yellow ring band
};

const caterpillarCache = new Map<CaterpillarPoseName, Boar27Pack>();
 function buildCaterpillarPosePack(pose: CaterpillarPoseName): Boar27Pack {
  let pack = caterpillarCache.get(pose);
  if (!pack) {
    const idx = parseInt(pose.slice(5), 10);
    const ph = (idx / 6) * Math.PI * 2;
    const evalFn: SdfEvaluator = (x, y, z) => {
      let body = 99;
      for (let i = 0; i < 6; i++) {
        const tz = 0.42 - i * 0.175;
        const arch = Math.max(0, Math.sin(ph - i * 0.7)) * 0.11;
        const r = i === 0 ? 0.125 : 0.115 - Math.abs(i - 2.5) * 0.008;
        const seg = sdEllipsoid(x, y, z, 0, -0.02 + arch, tz, r, r * 0.96, 0.11);
        body = i === 0 ? seg : smin(body, seg, 0.025);
      }
      const eyeL = sdEllipsoid(x, y, z, -0.07, 0.02, 0.51, 0.026, 0.026, 0.024);
      const eyeR = sdEllipsoid(x, y, z,  0.07, 0.02, 0.51, 0.026, 0.026, 0.024);
      if (Math.min(eyeL, eyeR) < body) return { d: Math.min(eyeL, eyeR), mat: 'eye' };
      return { d: body, mat: 'cat' };
    };
    const shadeFn: ColorShaper = (mat, shade, _x, _y, z) => {
      if (mat === 'eye') return 'k';
      if (Math.sin(z * 36) > 0.55) return shade > 0.45 ? 'y1' : 'y0';
      return shade > 0.76 ? 'g3' : shade > 0.48 ? 'g2' : shade > 0.22 ? 'g1' : 'g0';
    };
    pack = build27Pack(CATERPILLAR_PW, CATERPILLAR_PH, 0.86, 0.48, CATERPILLAR_PAL, evalFn, shadeFn);
    caterpillarCache.set(pose, pack);
  }
  return pack;
}

export function getCaterpillarPosePack(...args: Parameters<typeof buildCaterpillarPosePack>): ReturnType<typeof buildCaterpillarPosePack> {
  return registerAnimalSpritePack(buildCaterpillarPosePack(...args), { module: './InsectsPackB.ts', factory: 'getCaterpillarPosePack', args }, buildCaterpillarPosePack);
}

// ============================================================================
// 4. MARIPOSA (Moth) — 26×22
// ============================================================================
export type MothPoseName = 'flutter0' | 'flutter1' | 'flutter2' | 'flutter3' | 'flutter4' | 'flutter5';
export const MOTH_PW = 26;
export const MOTH_PH = 22;
export const MOTH_W = MOTH_PW / ANIMAL_PPU;
export const MOTH_H = MOTH_PH / ANIMAL_PPU;

const MOTH_PAL: Record<string, [number, number, number]> = {
  k:  [0x1c, 0x16, 0x12],
  w:  [0xfc, 0xf8, 0xed],
  c0: [0x6e, 0x5c, 0x4b], // taupe shadow
  c1: [0x9e, 0x89, 0x73], // warm taupe
  c2: [0xd1, 0xc1, 0xa9], // fuzzy cream-taupe
  c3: [0xf2, 0xe9, 0xd8], // bright cream highlight
  e0: [0x42, 0x26, 0x1c], // dark eye-spot ring
  e1: [0xd9, 0x8a, 0x2b], // golden eye-spot center
};

const mothCache = new Map<MothPoseName, Boar27Pack>();
 function buildMothPosePack(pose: MothPoseName): Boar27Pack {
  let pack = mothCache.get(pose);
  if (!pack) {
    const idx = parseInt(pose.slice(7), 10);
    const flap = Math.sin((idx / 6) * Math.PI * 2);
    const wy = 0.06 + flap * 0.28;
    const evalFn: SdfEvaluator = (x, y, z) => {
      const body = sdCapsule(x, y, z, 0, 0.0, -0.26, 0, 0.03, 0.24, 0.095, 0.085);
      // Feathered antennae
      const antL = sdCapsule(x, y, z, -0.04, 0.06, 0.26, -0.15, 0.16, 0.42, 0.026, 0.018);
      const antR = sdCapsule(x, y, z,  0.04, 0.06, 0.26,  0.15, 0.16, 0.42, 0.026, 0.018);
      // Broad fuzzy forewings & hindwings
      const fwL = sdCapsule(x, y, z, -0.09, 0.03, 0.06, -0.58, wy, 0.14, 0.11, 0.08);
      const fwR = sdCapsule(x, y, z,  0.09, 0.03, 0.06,  0.58, wy, 0.14, 0.11, 0.08);
      const hwL = sdCapsule(x, y, z, -0.09, 0.01, -0.08, -0.46, wy * 0.85 - 0.04, -0.22, 0.10, 0.065);
      const hwR = sdCapsule(x, y, z,  0.09, 0.01, -0.08,  0.46, wy * 0.85 - 0.04, -0.22, 0.10, 0.065);
      const wings = Math.min(smin(fwL, hwL, 0.06), smin(fwR, hwR, 0.06));
      let d = smin(body, wings, 0.03);
      d = Math.min(d, Math.min(antL, antR));
      return { d, mat: wings < body ? 'wing' : 'body' };
    };
    const shadeFn: ColorShaper = (mat, shade, x, _y, z) => {
      if (mat === 'wing') {
        const spotDist = Math.hypot(Math.abs(x) - 0.38, z - 0.06);
        if (spotDist < 0.055) return 'e1';
        if (spotDist < 0.105) return 'e0';
        if (Math.abs(x) > 0.54) return 'c0';
      }
      return shade > 0.76 ? 'c3' : shade > 0.48 ? 'c2' : shade > 0.22 ? 'c1' : 'c0';
    };
    pack = build27Pack(MOTH_PW, MOTH_PH, 0.86, 0.72, MOTH_PAL, evalFn, shadeFn);
    mothCache.set(pose, pack);
  }
  return pack;
}

export function getMothPosePack(...args: Parameters<typeof buildMothPosePack>): ReturnType<typeof buildMothPosePack> {
  return registerAnimalSpritePack(buildMothPosePack(...args), { module: './InsectsPackB.ts', factory: 'getMothPosePack', args }, buildMothPosePack);
}

// ============================================================================
// 5. VAGALUME (Firefly) — 20×16
// ============================================================================
export type FireflyPoseName = 'glow0' | 'glow1' | 'glow2' | 'glow3';
export const FIREFLY_PW = 20;
export const FIREFLY_PH = 16;
export const FIREFLY_W = FIREFLY_PW / ANIMAL_PPU;
export const FIREFLY_H = FIREFLY_PH / ANIMAL_PPU;

const FIREFLY_PAL: Record<string, [number, number, number]> = {
  k:  [0x12, 0x10, 0x16],
  d0: [0x26, 0x22, 0x2e], // dark-winged beetle shell
  d1: [0x45, 0x3e, 0x52], // dark shell highlight
  r:  [0xb8, 0x42, 0x28], // warm red-orange pronotum collar
  w0: [0xa6, 0xb8, 0xc9], // translucent wings
  w1: [0xde, 0xeb, 0xf7],
  l0: [0x9e, 0xd4, 0x24], // glowing lime lantern
  l1: [0xdc, 0xff, 0x42], // bright neon-yellow/lime lantern
  l2: [0xff, 0xff, 0xb8], // radiant lantern core
};

const fireflyCache = new Map<FireflyPoseName, Boar27Pack>();
 function buildFireflyPosePack(pose: FireflyPoseName): Boar27Pack {
  let pack = fireflyCache.get(pose);
  if (!pack) {
    const idx = parseInt(pose.slice(4), 10);
    const flap = Math.sin((idx / 4) * Math.PI * 2) * 0.22;
    const bright = idx === 1 || idx === 2;
    const evalFn: SdfEvaluator = (x, y, z) => {
      const thorax = sdEllipsoid(x, y, z, 0, 0.04, 0.16, 0.12, 0.10, 0.15);
      const lantern = sdEllipsoid(x, y, z, 0, -0.01, -0.18, 0.135, 0.125, 0.20);
      const wL = sdCapsule(x, y, z, -0.09, 0.08, 0.08, -0.46, 0.16 + flap, -0.08, 0.06, 0.036);
      const wR = sdCapsule(x, y, z,  0.09, 0.08, 0.08,  0.46, 0.16 + flap, -0.08, 0.06, 0.036);
      const wings = Math.min(wL, wR);
      let d = smin(thorax, lantern, 0.03);
      let mat = lantern < thorax ? 'lantern' : 'shell';
      if (wings < d) { d = wings; mat = 'wing'; }
      return { d, mat };
    };
    const shadeFn: ColorShaper = (mat, shade, _x, _y, z) => {
      if (mat === 'wing') return shade > 0.45 ? 'w1' : 'w0';
      if (mat === 'lantern') return bright ? (shade > 0.45 ? 'l2' : 'l1') : (shade > 0.50 ? 'l1' : 'l0');
      if (z > 0.18) return 'r';
      return shade > 0.50 ? 'd1' : 'd0';
    };
    pack = build27Pack(FIREFLY_PW, FIREFLY_PH, 0.78, 0.62, FIREFLY_PAL, evalFn, shadeFn);
    fireflyCache.set(pose, pack);
  }
  return pack;
}

export function getFireflyPosePack(...args: Parameters<typeof buildFireflyPosePack>): ReturnType<typeof buildFireflyPosePack> {
  return registerAnimalSpritePack(buildFireflyPosePack(...args), { module: './InsectsPackB.ts', factory: 'getFireflyPosePack', args }, buildFireflyPosePack);
}

// ============================================================================
// 6. JOANINHA (Ladybug) — 18×14
// ============================================================================
export type LadybugPoseName = 'walk0' | 'walk1' | 'walk2' | 'walk3' | 'walk4' | 'walk5';
export const LADYBUG_PW = 18;
export const LADYBUG_PH = 14;
export const LADYBUG_W = LADYBUG_PW / ANIMAL_PPU;
export const LADYBUG_H = LADYBUG_PH / ANIMAL_PPU;

const LADYBUG_PAL: Record<string, [number, number, number]> = {
  k:  [0x12, 0x0d, 0x0f], // black head, spots, suture line & outline
  w:  [0xff, 0xf8, 0xf4], // glossy shell specular & tiny head dots
  r0: [0x8c, 0x11, 0x1a], // deep scarlet shadow
  r1: [0xd9, 0x1e, 0x2a], // glossy scarlet dome
  r2: [0xff, 0x45, 0x45], // bright scarlet highlight
};

const ladybugCache = new Map<LadybugPoseName, Boar27Pack>();
 function buildLadybugPosePack(pose: LadybugPoseName): Boar27Pack {
  let pack = ladybugCache.get(pose);
  if (!pack) {
    const idx = parseInt(pose.slice(4), 10);
    const ph = (idx / 6) * Math.PI * 2;
    const evalFn: SdfEvaluator = (x, y, z) => {
      const dome = sdEllipsoid(x, y, z, 0, 0.04, -0.04, 0.26, 0.20, 0.30);
      const head = sdEllipsoid(x, y, z, 0, -0.02, 0.27, 0.13, 0.10, 0.10);
      let legs = 99;
      for (let i = 0; i < 3; i++) {
        for (let s = -1; s <= 1; s += 2) {
          const st = Math.sin(ph + i * 2.1 + (s > 0 ? Math.PI : 0)) * 0.05;
          const lz = 0.12 - i * 0.14;
          legs = Math.min(legs, sdCapsule(x, y, z, s * 0.18, -0.08, lz, s * 0.28, -0.18, lz + st, 0.026, 0.016));
        }
      }
      let d = smin(dome, head, 0.02);
      let mat = head < dome ? 'head' : 'shell';
      if (legs < d) { d = legs; mat = 'leg'; }
      return { d, mat };
    };
    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'leg' || mat === 'head') return 'k';
      // Crisp black center seam & ladybug spots!
      if (Math.abs(x) < 0.025 && y > 0.02) return 'k';
      const s1 = Math.hypot(Math.abs(x) - 0.13, z - 0.08) < 0.068;
      const s2 = Math.hypot(Math.abs(x) - 0.15, z + 0.12) < 0.068;
      if (s1 || s2) return 'k';
      if (shade > 0.86) return 'w';
      return shade > 0.56 ? 'r2' : shade > 0.26 ? 'r1' : 'r0';
    };
    pack = build27Pack(LADYBUG_PW, LADYBUG_PH, 0.72, 0.56, LADYBUG_PAL, evalFn, shadeFn);
    ladybugCache.set(pose, pack);
  }
  return pack;
}

export function getLadybugPosePack(...args: Parameters<typeof buildLadybugPosePack>): ReturnType<typeof buildLadybugPosePack> {
  return registerAnimalSpritePack(buildLadybugPosePack(...args), { module: './InsectsPackB.ts', factory: 'getLadybugPosePack', args }, buildLadybugPosePack);
}

// ============================================================================
// 7. GAFANHOTO (Grasshopper) — 28×20
// ============================================================================
export type GrasshopperPoseName = 'idle0' | 'idle1' | 'idle2' | 'hop0' | 'hop1' | 'hop2' | 'hop3';
export const GRASSHOPPER_PW = 28;
export const GRASSHOPPER_PH = 20;
export const GRASSHOPPER_W = GRASSHOPPER_PW / ANIMAL_PPU;
export const GRASSHOPPER_H = GRASSHOPPER_PH / ANIMAL_PPU;

const GRASSHOPPER_PAL: Record<string, [number, number, number]> = {
  k:  [0x12, 0x1a, 0x10],
  w:  [0xfc, 0xfc, 0xf2],
  g0: [0x26, 0x4a, 0x18],
  g1: [0x45, 0x82, 0x26],
  g2: [0x6e, 0xb8, 0x32],
  g3: [0xa4, 0xe3, 0x4b],
  y:  [0xe8, 0xd4, 0x56], // belly & hind-leg accent
  e:  [0xd9, 0x7c, 0x1a], // big amber compound eye
};

const grasshopperCache = new Map<GrasshopperPoseName, Boar27Pack>();
 function buildGrasshopperPosePack(pose: GrasshopperPoseName): Boar27Pack {
  let pack = grasshopperCache.get(pose);
  if (!pack) {
    const isHop = pose.startsWith('hop');
    const idx = parseInt(pose.slice(isHop ? 3 : 4), 10);
    const ext = isHop ? (idx === 1 ? 0.85 : idx === 2 ? 1.0 : idx === 3 ? 0.4 : 0.0) : 0.0;
    const by = isHop ? (idx === 1 || idx === 2 ? 0.08 : -0.02) : (idx === 1 ? 0.015 : 0.0);
    const evalFn: SdfEvaluator = (x, y, z) => {
      const body = sdCapsule(x, y, z, 0, 0.02 + by, -0.44, 0, 0.06 + by, 0.22, 0.085, 0.105);
      const head = sdEllipsoid(x, y, z, 0, 0.09 + by, 0.34, 0.095, 0.115, 0.095);
      const antL = sdCapsule(x, y, z, -0.04, 0.16 + by, 0.40, -0.14, 0.28 + by, 0.56, 0.016, 0.010);
      const antR = sdCapsule(x, y, z,  0.04, 0.16 + by, 0.40,  0.14, 0.28 + by, 0.56, 0.016, 0.010);
      // Huge folded/extended jumping hind legs!
      const kneeY = 0.28 + by - ext * 0.22;
      const kneeZ = -0.16 - ext * 0.32;
      const footY = -0.22 - ext * 0.12;
      const footZ = -0.42 - ext * 0.48;
      const hL = smin(
        sdCapsule(x, y, z, -0.10, 0.02 + by, -0.02, -0.18, kneeY, kneeZ, 0.056, 0.036),
        sdCapsule(x, y, z, -0.18, kneeY, kneeZ, -0.18, footY, footZ, 0.032, 0.018),
        0.015,
      );
      const hR = smin(
        sdCapsule(x, y, z,  0.10, 0.02 + by, -0.02,  0.18, kneeY, kneeZ, 0.056, 0.036),
        sdCapsule(x, y, z,  0.18, kneeY, kneeZ,  0.18, footY, footZ, 0.032, 0.018),
        0.015,
      );
      const fL = sdCapsule(x, y, z, -0.08, 0.0 + by, 0.18, -0.16, -0.20 + by, 0.26, 0.026, 0.016);
      const fR = sdCapsule(x, y, z,  0.08, 0.0 + by, 0.18,  0.16, -0.20 + by, 0.26, 0.026, 0.016);
      let d = smin(body, head, 0.03);
      d = Math.min(d, Math.min(Math.min(hL, hR), Math.min(fL, fR)));
      d = Math.min(d, Math.min(antL, antR));
      const eyeL = sdEllipsoid(x, y, z, -0.075, 0.12 + by, 0.37, 0.036, 0.044, 0.036);
      const eyeR = sdEllipsoid(x, y, z,  0.075, 0.12 + by, 0.37, 0.036, 0.044, 0.036);
      if (Math.min(eyeL, eyeR) < d) return { d: Math.min(eyeL, eyeR), mat: 'eye' };
      return { d, mat: 'hop' };
    };
    const shadeFn: ColorShaper = (mat, shade, _x, y) => {
      if (mat === 'eye') return 'e';
      if (y < -0.04 + by) return 'y';
      return shade > 0.76 ? 'g3' : shade > 0.48 ? 'g2' : shade > 0.22 ? 'g1' : 'g0';
    };
    pack = build27Pack(GRASSHOPPER_PW, GRASSHOPPER_PH, 0.96, 0.68, GRASSHOPPER_PAL, evalFn, shadeFn);
    grasshopperCache.set(pose, pack);
  }
  return pack;
}

export function getGrasshopperPosePack(...args: Parameters<typeof buildGrasshopperPosePack>): ReturnType<typeof buildGrasshopperPosePack> {
  return registerAnimalSpritePack(buildGrasshopperPosePack(...args), { module: './InsectsPackB.ts', factory: 'getGrasshopperPosePack', args }, buildGrasshopperPosePack);
}

// ============================================================================
// 8. MOSCA (Fly) — 18×16
// ============================================================================
export type FlyPoseName = 'buzz0' | 'buzz1' | 'buzz2' | 'buzz3';
export const FLY_PW = 18;
export const FLY_PH = 16;
export const FLY_W = FLY_PW / ANIMAL_PPU;
export const FLY_H = FLY_PH / ANIMAL_PPU;

const FLY_PAL: Record<string, [number, number, number]> = {
  k:  [0x0c, 0x12, 0x16],
  b0: [0x12, 0x3b, 0x45], // iridescent blue-green bottle fly shadow
  b1: [0x1c, 0x73, 0x75], // metallic teal-green
  b2: [0x38, 0xb8, 0xa8], // bright iridescent bottle-green gleam
  e0: [0x99, 0x18, 0x24], // huge crimson compound eye shadow
  e1: [0xeb, 0x34, 0x40], // huge crimson compound eye
  w0: [0xa8, 0xc2, 0xd4], // buzzing translucent wings
  w1: [0xe6, 0xf2, 0xfa],
};

const flyCache = new Map<FlyPoseName, Boar27Pack>();
 function buildFlyPosePack(pose: FlyPoseName): Boar27Pack {
  let pack = flyCache.get(pose);
  if (!pack) {
    const idx = parseInt(pose.slice(4), 10);
    const flap = Math.sin((idx / 4) * Math.PI * 2) * 0.24;
    const evalFn: SdfEvaluator = (x, y, z) => {
      const abd = sdEllipsoid(x, y, z, 0, 0.0, -0.14, 0.16, 0.145, 0.18);
      const thx = sdEllipsoid(x, y, z, 0, 0.03, 0.08, 0.14, 0.135, 0.14);
      const eyeL = sdEllipsoid(x, y, z, -0.075, 0.05, 0.22, 0.085, 0.095, 0.085);
      const eyeR = sdEllipsoid(x, y, z,  0.075, 0.05, 0.22, 0.085, 0.095, 0.085);
      const wL = sdCapsule(x, y, z, -0.10, 0.10, 0.06, -0.44, 0.18 + flap, -0.10, 0.07, 0.04);
      const wR = sdCapsule(x, y, z,  0.10, 0.10, 0.06,  0.44, 0.18 + flap, -0.10, 0.07, 0.04);
      const body = smin(abd, thx, 0.03);
      const eyes = Math.min(eyeL, eyeR);
      const wings = Math.min(wL, wR);
      let d = body;
      let mat = 'body';
      if (wings < d) { d = wings; mat = 'wing'; }
      if (eyes < d) { d = eyes; mat = 'eye'; }
      return { d, mat };
    };
    const shadeFn: ColorShaper = (mat, shade) => {
      if (mat === 'wing') return shade > 0.45 ? 'w1' : 'w0';
      if (mat === 'eye') return shade > 0.45 ? 'e1' : 'e0';
      return shade > 0.65 ? 'b2' : shade > 0.32 ? 'b1' : 'b0';
    };
    pack = build27Pack(FLY_PW, FLY_PH, 0.74, 0.62, FLY_PAL, evalFn, shadeFn);
    flyCache.set(pose, pack);
  }
  return pack;
}

export function getFlyPosePack(...args: Parameters<typeof buildFlyPosePack>): ReturnType<typeof buildFlyPosePack> {
  return registerAnimalSpritePack(buildFlyPosePack(...args), { module: './InsectsPackB.ts', factory: 'getFlyPosePack', args }, buildFlyPosePack);
}

// ============================================================================
// SHARED GROUND & FLYING BUG BASES
// ============================================================================
class GroundBug<TPose extends string> extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private home = new THREE.Vector3();
  private state: 'idle' | 'move' = 'move';
  private stateT = 0;
  private stateDur = rand(1.2, 2.8);
  private targetYaw = rand(0, Math.PI * 2);
  private gaitPhase = rand(0, Math.PI * 2);
  private hopCd = 0;

  constructor(
    ctx: GameContext,
    startPos: THREE.Vector3,
    private readonly cfg: {
      name: string; pw: number; ph: number; w: number; h: number; centerY: number;
      speed: number; hopVel?: number;
      getPack: (p: TPose) => Boar27Pack;
      pickPose: (moving: boolean, grounded: boolean, vy: number, t: number, g: number) => TPose;
    },
  ) {
    super(ctx, cfg.getPack(cfg.pickPose(false, true, 0, 0, 0)).getView(2, 0)!, cfg.pw, cfg.ph, cfg.w, cfg.h, cfg.name);
    this.hp = 8;
    this.maxHp = 8;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.14;
    this.motor.height = 0.18;
    this.motor.teleport(startPos);
    this.home.copy(startPos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.20, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.set(this.position.x, this.position.y + this.cfg.centerY, this.position.z);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y + 0.04, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.16, this.position.z);
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
    if (this.hp <= 0) { this.alive = false; res.killed = true; }
    return res;
  }

  update(dt: number, target: EnemyTarget | null, camera: THREE.Camera, drawingBufferSize?: THREE.Vector2) {
    if (dt > 0) {
      this.stateT += dt;
      this.hopCd = Math.max(0, this.hopCd - dt);
      this.flash = Math.max(0, this.flash - dt * 4.5);
      if (!this.alive) {
        this.deadT += dt;
        this.vel.set(0, this.vel.y - 20 * dt, 0);
        this.motor.update(dt);
      } else {
        const dist = target && target.alive
          ? Math.hypot(target.position.x - this.position.x, target.position.z - this.position.z)
          : 999;
        let speed = 0;
        if (dist < 2.4 && target) {
          this.targetYaw = Math.atan2(this.position.x - target.position.x, this.position.z - target.position.z);
          this.state = 'move';
          speed = this.cfg.speed * 1.6;
          if (this.cfg.hopVel && this.motor.grounded && this.hopCd <= 0) {
            this.vel.y = this.cfg.hopVel;
            this.hopCd = 0.6;
          }
        } else if (this.state === 'idle') {
          if (this.stateT >= this.stateDur) {
            this.state = 'move';
            this.stateT = 0;
            this.stateDur = rand(1.4, 3.0);
            const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
            this.targetYaw = toHome > 6.0
              ? Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.5, 0.5)
              : this.facing + rand(-1.8, 1.8);
          }
        } else {
          speed = this.cfg.speed;
          if (this.cfg.hopVel && this.motor.grounded && this.hopCd <= 0) {
            this.vel.y = this.cfg.hopVel * 0.85;
            this.hopCd = 0.85;
          }
          if (this.stateT >= this.stateDur && this.motor.grounded) {
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.0, 2.2);
          }
        }
        this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 8);
        this.vel.x = damp(this.vel.x, Math.sin(this.facing) * speed, 9, dt);
        this.vel.z = damp(this.vel.z, Math.cos(this.facing) * speed, 9, dt);
        this.vel.y -= 20 * dt;
        this.motor.update(dt);
        const horiz = Math.hypot(this.vel.x, this.vel.z);
        if (horiz > 0.12 && this.motor.grounded) this.gaitPhase += dt * 8.5;
      }
      this.syncHurtbox();
    }
    const pose = this.cfg.pickPose(this.state === 'move', this.motor.grounded, this.vel.y, this.stateT, this.gaitPhase);
    const deathSink = this.alive ? 0 : Math.min(0.12, this.deadT * 0.4);
    this.renderBillboard(this.cfg.getPack(pose), this.position.y + this.cfg.centerY - deathSink, camera, drawingBufferSize);
  }
}

class FlyingBug<TPose extends string> extends BasePixelAnimal {
  readonly position = new THREE.Vector3();
  private readonly vel = new THREE.Vector3();
  private readonly home = new THREE.Vector3();
  private readonly goal = new THREE.Vector3();
  private stateT = 0;
  private stateDur = rand(1.2, 2.5);
  private wingPhase = rand(0, 10);
  private groundY = 0;

  constructor(
    ctx: GameContext,
    startPos: THREE.Vector3,
    private readonly cfg: {
      name: string; pw: number; ph: number; w: number; h: number;
      speed: number; wingRate: number;
      frames: readonly TPose[];
      getPack: (p: TPose) => Boar27Pack;
    },
  ) {
    super(ctx, cfg.getPack(cfg.frames[0]).getView(2, 0)!, cfg.pw, cfg.ph, cfg.w, cfg.h, cfg.name);
    this.hp = 8;
    this.maxHp = 8;
    this.groundY = startPos.y;
    this.home.copy(startPos);
    this.position.set(startPos.x, this.groundY + rand(0.55, 1.35), startPos.z);
    this.goal.copy(this.position);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.20, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 { return out.copy(this.position); }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y - 0.06, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.06, this.position.z);
    this.hurtboxes[0].enabled = this.alive;
    this.stickRoot.position.copy(this.position);
    this.stickRoot.rotation.y = this.facing;
  }

  receiveHit(hit: HitInfo): HitResult {
    const res = emptyResult('flesh');
    if (!this.alive) { res.ignored = true; return res; }
    this.hp = Math.max(0, this.hp - hit.damage);
    res.damage = hit.damage;
    this.flash = 1.0;
    if (this.hp <= 0) { this.alive = false; res.killed = true; }
    return res;
  }

  update(dt: number, target: EnemyTarget | null, camera: THREE.Camera, drawingBufferSize?: THREE.Vector2) {
    if (dt > 0) {
      this.stateT += dt;
      this.wingPhase += dt * this.cfg.wingRate;
      this.flash = Math.max(0, this.flash - dt * 4.5);
      if (!this.alive) {
        this.deadT += dt;
        this.vel.y -= 12 * dt;
        this.position.addScaledVector(this.vel, dt);
        if (this.position.y < this.groundY + 0.05) { this.position.y = this.groundY + 0.05; this.vel.set(0, 0, 0); }
      } else {
        if (this.stateT >= this.stateDur) {
          this.stateT = 0;
          this.stateDur = rand(1.0, 2.4);
          const ang = rand(0, Math.PI * 2);
          const rad = rand(0.8, 3.8);
          this.goal.set(this.home.x + Math.sin(ang) * rad, this.groundY + rand(0.5, 1.5), this.home.z + Math.cos(ang) * rad);
        }
        if (target && target.alive && Math.hypot(target.position.x - this.position.x, target.position.z - this.position.z) < 2.2) {
          const ang = Math.atan2(this.position.x - target.position.x, this.position.z - target.position.z);
          this.goal.set(this.position.x + Math.sin(ang) * 2.5, this.groundY + rand(0.7, 1.5), this.position.z + Math.cos(ang) * 2.5);
        }
        const dx = this.goal.x - this.position.x;
        const dy = this.goal.y + Math.sin(this.wingPhase * 0.4) * 0.08 - this.position.y;
        const dz = this.goal.z - this.position.z;
        const d = Math.hypot(dx, dy, dz);
        if (d > 0.1) {
          this.vel.x = damp(this.vel.x, (dx / d) * this.cfg.speed, 6, dt);
          this.vel.y = damp(this.vel.y, (dy / d) * this.cfg.speed * 0.6, 6, dt);
          this.vel.z = damp(this.vel.z, (dz / d) * this.cfg.speed, 6, dt);
          this.facing += angleDiff(this.facing, Math.atan2(dx, dz)) * Math.min(1, dt * 10);
        }
        this.position.addScaledVector(this.vel, dt);
      }
      this.syncHurtbox();
    }
    const pose = pickCycle(this.cfg.frames, this.wingPhase);
    this.renderBillboard(this.cfg.getPack(pose), this.position.y, camera, drawingBufferSize);
  }
}

// ============================================================================
// EXPORTED CLASSES (8 bugs)
// ============================================================================
const WORM_FRAMES: readonly EarthwormPoseName[] = ['crawl0', 'crawl1', 'crawl2', 'crawl3', 'crawl4', 'crawl5'];
const ANT_FRAMES: readonly AntPoseName[] = ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'];
const CAT_FRAMES: readonly CaterpillarPoseName[] = ['crawl0', 'crawl1', 'crawl2', 'crawl3', 'crawl4', 'crawl5'];
const MOTH_FRAMES: readonly MothPoseName[] = ['flutter0', 'flutter1', 'flutter2', 'flutter3', 'flutter4', 'flutter5'];
const FIREFLY_FRAMES: readonly FireflyPoseName[] = ['glow0', 'glow1', 'glow2', 'glow3'];
const LADYBUG_FRAMES: readonly LadybugPoseName[] = ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'];
const HOPPER_IDLE: readonly GrasshopperPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const FLY_FRAMES: readonly FlyPoseName[] = ['buzz0', 'buzz1', 'buzz2', 'buzz3'];

export class Earthworm extends GroundBug<EarthwormPoseName> {
  constructor(ctx: GameContext, pos: THREE.Vector3) {
    super(ctx, pos, {
      name: 'EarthwormBillboard', pw: EARTHWORM_PW, ph: EARTHWORM_PH, w: EARTHWORM_W, h: EARTHWORM_H,
      centerY: 0.08, speed: 0.75, getPack: getEarthwormPosePack,
      pickPose: (_m, _gr, _vy, t, g) => pickCycle(WORM_FRAMES, g + t),
    });
  }
}

export class Ant extends GroundBug<AntPoseName> {
  constructor(ctx: GameContext, pos: THREE.Vector3) {
    super(ctx, pos, {
      name: 'AntBillboard', pw: ANT_PW, ph: ANT_PH, w: ANT_W, h: ANT_H,
      centerY: 0.09, speed: 1.45, getPack: getAntPosePack,
      pickPose: (m, _gr, _vy, _t, g) => (m ? pickCycle(ANT_FRAMES, g) : 'walk0'),
    });
  }
}

export class Caterpillar extends GroundBug<CaterpillarPoseName> {
  constructor(ctx: GameContext, pos: THREE.Vector3) {
    super(ctx, pos, {
      name: 'CaterpillarBillboard', pw: CATERPILLAR_PW, ph: CATERPILLAR_PH, w: CATERPILLAR_W, h: CATERPILLAR_H,
      centerY: 0.09, speed: 0.65, getPack: getCaterpillarPosePack,
      pickPose: (_m, _gr, _vy, t, g) => pickCycle(CAT_FRAMES, g + t),
    });
  }
}

export class Moth extends FlyingBug<MothPoseName> {
  constructor(ctx: GameContext, pos: THREE.Vector3) {
    super(ctx, pos, {
      name: 'MothBillboard', pw: MOTH_PW, ph: MOTH_PH, w: MOTH_W, h: MOTH_H,
      speed: 2.2, wingRate: 14, frames: MOTH_FRAMES, getPack: getMothPosePack,
    });
  }
}

export class Firefly extends FlyingBug<FireflyPoseName> {
  constructor(ctx: GameContext, pos: THREE.Vector3) {
    super(ctx, pos, {
      name: 'FireflyBillboard', pw: FIREFLY_PW, ph: FIREFLY_PH, w: FIREFLY_W, h: FIREFLY_H,
      speed: 1.8, wingRate: 12, frames: FIREFLY_FRAMES, getPack: getFireflyPosePack,
    });
  }
}

export class Ladybug extends GroundBug<LadybugPoseName> {
  constructor(ctx: GameContext, pos: THREE.Vector3) {
    super(ctx, pos, {
      name: 'LadybugBillboard', pw: LADYBUG_PW, ph: LADYBUG_PH, w: LADYBUG_W, h: LADYBUG_H,
      centerY: 0.09, speed: 1.1, getPack: getLadybugPosePack,
      pickPose: (m, _gr, _vy, _t, g) => (m ? pickCycle(LADYBUG_FRAMES, g) : 'walk0'),
    });
  }
}

export class Grasshopper extends GroundBug<GrasshopperPoseName> {
  constructor(ctx: GameContext, pos: THREE.Vector3) {
    super(ctx, pos, {
      name: 'GrasshopperBillboard', pw: GRASSHOPPER_PW, ph: GRASSHOPPER_PH, w: GRASSHOPPER_W, h: GRASSHOPPER_H,
      centerY: 0.12, speed: 1.9, hopVel: 4.8, getPack: getGrasshopperPosePack,
      pickPose: (m, gr, vy, t) => (!gr ? (vy > 2.0 ? 'hop1' : vy > -1.0 ? 'hop2' : 'hop3') : m ? 'hop0' : pickCycle(HOPPER_IDLE, t * 2.0)),
    });
  }
}

export class Fly extends FlyingBug<FlyPoseName> {
  constructor(ctx: GameContext, pos: THREE.Vector3) {
    super(ctx, pos, {
      name: 'FlyBillboard', pw: FLY_PW, ph: FLY_PH, w: FLY_W, h: FLY_H,
      speed: 3.1, wingRate: 24, frames: FLY_FRAMES, getPack: getFlyPosePack,
    });
  }
}
