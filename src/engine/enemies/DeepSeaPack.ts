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
// 1. LULA-VAMPIRA (Vampire Squid) — 40×32 @ ANIMAL_PPU
// ============================================================================
export type VampireSquidPoseName = 'swim0' | 'swim1' | 'swim2' | 'swim3' | 'swim4' | 'swim5';
export const VAMPIRE_SQUID_PW = 40;
export const VAMPIRE_SQUID_PH = 32;
export const VAMPIRE_SQUID_W = VAMPIRE_SQUID_PW / ANIMAL_PPU;
export const VAMPIRE_SQUID_H = VAMPIRE_SQUID_PH / ANIMAL_PPU;

const VAMPIRE_SQUID_PAL: Record<string, [number, number, number]> = {
  k:  [0x16, 0x0a, 0x10], // 1px dark plum-black outline
  v0: [0x3c, 0x0c, 0x1c], // deep velvety burgundy shadow
  v1: [0x68, 0x14, 0x2c], // rich vampire crimson-burgundy
  v2: [0x96, 0x20, 0x3e], // velvety wine-red mid
  v3: [0xc4, 0x3a, 0x58], // soft crimson highlight
  c0: [0x1c, 0x9c, 0xb8], // glowing cyan eye outer
  c1: [0x5c, 0xf2, 0xff], // bright bioluminescent cyan eye
  w:  [0xf4, 0xff, 0xff], // eye specular glint & photophores
};

const VAMPIRE_SQUID_CACHE = new Map<VampireSquidPoseName, Boar27Pack>();

 function buildVampireSquidPosePack(pose: VampireSquidPoseName): Boar27Pack {
  let pack = VAMPIRE_SQUID_CACHE.get(pose);
  if (!pack) {
    const idx = Number(pose.slice(4));
    const phase = (idx / 6) * Math.PI * 2;
    const flare = Math.sin(phase) * 0.14;
    const finFlap = Math.cos(phase) * 0.12;
    const by = Math.sin(phase) * 0.04;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // Rounded velvety mantle dome + head
      const mantle = sdEllipsoid(x, y, z, 0, 0.14 + by, -0.04, 0.22, 0.20, 0.24);
      const head = sdEllipsoid(x, y, z, 0, 0.02 + by, 0.02, 0.19, 0.14, 0.19);

      // Pair of paddle-like ear-fins on sides of mantle
      const finL = sdEllipsoid(x, y, z, -0.25, 0.18 + by + finFlap, -0.06, 0.12, 0.036, 0.075);
      const finR = sdEllipsoid(x, y, z,  0.25, 0.18 + by + finFlap, -0.06, 0.12, 0.036, 0.075);

      // Webbed umbrella cloak of 8 arms flaring open/closed
      let cloak = 999;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const r0 = 0.14;
        const r1 = 0.26 + flare;
        const arm = sdCapsule(
          x, y, z,
          Math.cos(a) * r0, -0.02 + by, Math.sin(a) * r0,
          Math.cos(a) * r1, -0.32 + by, Math.sin(a) * r1,
          0.065, 0.042,
        );
        cloak = smin(cloak, arm, 0.06);
      }

      let body = smin(mantle, head, 0.07);
      body = smin(body, Math.min(finL, finR), 0.03);
      body = smin(body, cloak, 0.05);

      // Glowing cyan eyes + glint
      const eyeL = sdEllipsoid(x, y, z, -0.135, 0.05 + by, 0.155, 0.042, 0.042, 0.036);
      const eyeR = sdEllipsoid(x, y, z,  0.135, 0.05 + by, 0.155, 0.042, 0.042, 0.036);
      const eyes = Math.min(eyeL, eyeR);

      const glintL = sdEllipsoid(x, y, z, -0.145, 0.065 + by, 0.185, 0.015, 0.015, 0.015);
      const glintR = sdEllipsoid(x, y, z,  0.145, 0.065 + by, 0.185, 0.015, 0.015, 0.015);
      const glints = Math.min(glintL, glintR);

      let d = body, mat = 'cloak';
      if (eyes < d) { d = eyes; mat = 'eye'; }
      if (glints < d) { d = glints; mat = 'glint'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'glint') return 'w';
      if (mat === 'eye') return shade > 0.45 ? 'c1' : 'c0';
      // Tiny glowing photophore speckles along lower cloak rim
      if (y < -0.22 + by && Math.sin(x * 28 + z * 28) > 0.88) return 'c1';
      return shade > 0.76 ? 'v3' : shade > 0.50 ? 'v2' : shade > 0.25 ? 'v1' : 'v0';
    };

    pack = build27Pack(VAMPIRE_SQUID_PW, VAMPIRE_SQUID_PH, 0.88, 0.82, VAMPIRE_SQUID_PAL, evalFn, shadeFn);
    VAMPIRE_SQUID_CACHE.set(pose, pack);
  }
  return pack;
}

export function getVampireSquidPosePack(...args: Parameters<typeof buildVampireSquidPosePack>): ReturnType<typeof buildVampireSquidPosePack> {
  return registerAnimalSpritePack(buildVampireSquidPosePack(...args), { module: './DeepSeaPack.ts', factory: 'getVampireSquidPosePack', args }, buildVampireSquidPosePack);
}

// ============================================================================
// 2. ÁGUA-VIVA (Bioluminescent Jellyfish) — 32×42 @ ANIMAL_PPU
// ============================================================================
export type JellyfishPoseName = 'pulse0' | 'pulse1' | 'pulse2' | 'pulse3' | 'pulse4' | 'pulse5';
export const JELLYFISH_PW = 32;
export const JELLYFISH_PH = 42;
export const JELLYFISH_W = JELLYFISH_PW / ANIMAL_PPU;
export const JELLYFISH_H = JELLYFISH_PH / ANIMAL_PPU;

const JELLYFISH_PAL: Record<string, [number, number, number]> = {
  k:  [0x1a, 0x16, 0x36], // 1px deep indigo outline
  j0: [0x5a, 0x42, 0xa8], // deep bioluminescent violet shadow
  j1: [0x88, 0x68, 0xdc], // glowing lavender-purple
  j2: [0xb4, 0x98, 0xff], // bright pastel lavender
  c0: [0x38, 0xb8, 0xd8], // glowing cyan fringe
  c1: [0x88, 0xf2, 0xff], // luminous aqua-cyan highlight
  w:  [0xf0, 0xfc, 0xff], // translucent specular glow
};

const JELLYFISH_CACHE = new Map<JellyfishPoseName, Boar27Pack>();

 function buildJellyfishPosePack(pose: JellyfishPoseName): Boar27Pack {
  let pack = JELLYFISH_CACHE.get(pose);
  if (!pack) {
    const idx = Number(pose.slice(5));
    const phase = (idx / 6) * Math.PI * 2;
    const squeeze = Math.sin(phase) * 0.055;
    const by = Math.cos(phase) * 0.05;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // Pulsing translucent dome bell
      const bellW = 0.27 - squeeze;
      const bellH = 0.21 + squeeze * 0.9;
      const dome = sdEllipsoid(x, y, z, 0, 0.22 + by, 0, bellW, bellH, bellW);
      const rim = sdEllipsoid(x, y, z, 0, 0.11 + by, 0, bellW * 1.04, 0.055, bellW * 1.04);
      const bell = smin(dome, rim, 0.04);

      // Trailing wavy tentacles & oral arms
      let tents = 999;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const r = i % 2 === 0 ? 0.14 : 0.08;
        const swayX = Math.sin(phase + i * 1.1) * 0.07;
        const swayZ = Math.cos(phase + i * 0.9) * 0.07;
        const t1 = sdCapsule(
          x, y, z,
          Math.cos(a) * r, 0.08 + by, Math.sin(a) * r,
          Math.cos(a) * r + swayX, -0.18 + by, Math.sin(a) * r + swayZ,
          0.026, 0.018,
        );
        const t2 = sdCapsule(
          x, y, z,
          Math.cos(a) * r + swayX, -0.18 + by, Math.sin(a) * r + swayZ,
          Math.cos(a) * r - swayX * 0.8, -0.44 + by, Math.sin(a) * r - swayZ * 0.8,
          0.018, 0.012,
        );
        tents = Math.min(tents, smin(t1, t2, 0.02));
      }

      if (tents < bell) return { d: tents, mat: 'tent' };
      return { d: bell, mat: 'bell' };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'tent') {
        return y < -0.22 + by ? 'c1' : shade > 0.5 ? 'j2' : 'c0';
      }
      // Glowing cyan lower bell rim + radiant lavender dome
      if (y < 0.14 + by) return shade > 0.55 ? 'c1' : 'c0';
      const glow = shade + (y > 0.28 + by ? 0.12 : 0) + Math.sin(x * 16 + z * 16) * 0.05;
      return glow > 0.86 ? 'w' : glow > 0.64 ? 'j2' : glow > 0.36 ? 'j1' : 'j0';
    };

    pack = build27Pack(JELLYFISH_PW, JELLYFISH_PH, 0.72, 1.02, JELLYFISH_PAL, evalFn, shadeFn);
    JELLYFISH_CACHE.set(pose, pack);
  }
  return pack;
}

export function getJellyfishPosePack(...args: Parameters<typeof buildJellyfishPosePack>): ReturnType<typeof buildJellyfishPosePack> {
  return registerAnimalSpritePack(buildJellyfishPosePack(...args), { module: './DeepSeaPack.ts', factory: 'getJellyfishPosePack', args }, buildJellyfishPosePack);
}

// ============================================================================
// 3. POLVO-ELEFANTE (Dumbo Octopus) — 32×28 @ ANIMAL_PPU
// ============================================================================
export type DumboOctopusPoseName = 'swim0' | 'swim1' | 'swim2' | 'swim3' | 'swim4' | 'swim5';
export const DUMBO_OCTOPUS_PW = 32;
export const DUMBO_OCTOPUS_PH = 28;
export const DUMBO_OCTOPUS_W = DUMBO_OCTOPUS_PW / ANIMAL_PPU;
export const DUMBO_OCTOPUS_H = DUMBO_OCTOPUS_PH / ANIMAL_PPU;

const DUMBO_OCTOPUS_PAL: Record<string, [number, number, number]> = {
  k:  [0x2a, 0x16, 0x1e], // 1px outline / cute bead eyes
  p0: [0xc4, 0x76, 0x72], // warm peach-coral shadow
  p1: [0xec, 0x9c, 0x94], // pastel peach-pink mid
  p2: [0xff, 0xc2, 0xb8], // soft lit pastel peach
  p3: [0xff, 0xe2, 0xd8], // creamy peach highlight
  w:  [0xff, 0xff, 0xff], // eye specular glint
};

const DUMBO_OCTOPUS_CACHE = new Map<DumboOctopusPoseName, Boar27Pack>();

 function buildDumboOctopusPosePack(pose: DumboOctopusPoseName): Boar27Pack {
  let pack = DUMBO_OCTOPUS_CACHE.get(pose);
  if (!pack) {
    const idx = Number(pose.slice(4));
    const phase = (idx / 6) * Math.PI * 2;
    const flap = Math.sin(phase) * 0.14;
    const by = Math.cos(phase) * 0.04;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // Cute plump rounded bell-shaped body
      const dome = sdEllipsoid(x, y, z, 0, 0.06 + by, 0, 0.22, 0.22, 0.22);

      // Big adorable flapping Dumbo ear-like fins!
      const earL = sdCapsule(x, y, z, -0.18, 0.16 + by, 0, -0.36, 0.20 + by + flap, -0.02, 0.055, 0.042);
      const earR = sdCapsule(x, y, z,  0.18, 0.16 + by, 0,  0.36, 0.20 + by + flap, -0.02, 0.055, 0.042);

      // Short stubby webbed skirt of tentacles
      let skirt = 999;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const stub = sdEllipsoid(x, y, z, Math.cos(a) * 0.16, -0.13 + by, Math.sin(a) * 0.16, 0.085, 0.075, 0.085);
        skirt = smin(skirt, stub, 0.045);
      }

      let body = smin(dome, Math.min(earL, earR), 0.04);
      body = smin(body, skirt, 0.05);

      // Cute glossy dark eyes with crisp white glint
      const eyeL = sdEllipsoid(x, y, z, -0.11, 0.03 + by, 0.195, 0.032, 0.032, 0.028);
      const eyeR = sdEllipsoid(x, y, z,  0.11, 0.03 + by, 0.195, 0.032, 0.032, 0.028);
      const eyes = Math.min(eyeL, eyeR);

      const glintL = sdEllipsoid(x, y, z, -0.118, 0.042 + by, 0.218, 0.012, 0.012, 0.012);
      const glintR = sdEllipsoid(x, y, z,  0.118, 0.042 + by, 0.218, 0.012, 0.012, 0.012);
      const glints = Math.min(glintL, glintR);

      let d = body, mat = 'skin';
      if (eyes < d) { d = eyes; mat = 'eye'; }
      if (glints < d) { d = glints; mat = 'glint'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade) => {
      if (mat === 'glint') return 'w';
      if (mat === 'eye') return 'k';
      return shade > 0.78 ? 'p3' : shade > 0.50 ? 'p2' : shade > 0.24 ? 'p1' : 'p0';
    };

    pack = build27Pack(DUMBO_OCTOPUS_PW, DUMBO_OCTOPUS_PH, 0.84, 0.70, DUMBO_OCTOPUS_PAL, evalFn, shadeFn);
    DUMBO_OCTOPUS_CACHE.set(pose, pack);
  }
  return pack;
}

export function getDumboOctopusPosePack(...args: Parameters<typeof buildDumboOctopusPosePack>): ReturnType<typeof buildDumboOctopusPosePack> {
  return registerAnimalSpritePack(buildDumboOctopusPosePack(...args), { module: './DeepSeaPack.ts', factory: 'getDumboOctopusPosePack', args }, buildDumboOctopusPosePack);
}

// ============================================================================
// 4. CAMARÃO-BOXEADOR (Peacock Mantis Shrimp) — 38×24 @ ANIMAL_PPU
// ============================================================================
export type MantisShrimpPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'walk0' | 'walk1' | 'walk2' | 'walk3' | 'walk4' | 'walk5'
  | 'punch0' | 'punch1' | 'punch2';

export const MANTIS_SHRIMP_PW = 38;
export const MANTIS_SHRIMP_PH = 24;
export const MANTIS_SHRIMP_W = MANTIS_SHRIMP_PW / ANIMAL_PPU;
export const MANTIS_SHRIMP_H = MANTIS_SHRIMP_PH / ANIMAL_PPU;

const MANTIS_SHRIMP_PAL: Record<string, [number, number, number]> = {
  k:  [0x12, 0x16, 0x1a], // 1px dark outline / pupils
  e0: [0x0c, 0x62, 0x42], // deep emerald carapace shadow
  e1: [0x1c, 0xa8, 0x6e], // dazzling peacock emerald green
  e2: [0x54, 0xe4, 0x9c], // bright emerald-mint highlight
  r0: [0xb4, 0x1e, 0x2c], // crimson-scarlet smasher & legs
  r1: [0xf4, 0x48, 0x42], // bright scarlet-orange highlight
  b0: [0x1c, 0x4c, 0xb8], // electric cobalt blue tail/trim
  b1: [0x4c, 0x96, 0xff], // bright sky-cobalt highlight
  y:  [0xff, 0xd8, 0x42], // golden-yellow peacock spots
  w:  [0xff, 0xff, 0xff], // eye glint
};

const MANTIS_SHRIMP_CACHE = new Map<MantisShrimpPoseName, Boar27Pack>();

 function buildMantisShrimpPosePack(pose: MantisShrimpPoseName): Boar27Pack {
  let pack = MANTIS_SHRIMP_CACHE.get(pose);
  if (!pack) {
    let walkPhase = 0;
    let punchExt = 0;
    let by = 0;
    if (pose.startsWith('idle')) {
      const i = Number(pose.slice(4));
      by = i === 1 ? 0.01 : i === 2 ? -0.01 : 0;
    } else if (pose.startsWith('walk')) {
      const i = Number(pose.slice(4));
      walkPhase = (i / 6) * Math.PI * 2;
      by = Math.abs(Math.sin(walkPhase)) * 0.018;
    } else {
      const i = Number(pose.slice(5));
      punchExt = i === 0 ? -0.06 : i === 1 ? 0.24 : 0.14;
      by = i === 1 ? 0.03 : 0.01;
    }

    const evalFn: SdfEvaluator = (x, y, z) => {
      // Segmented armored stomatopod carapace + fanned uropod tail
      const thorax = sdEllipsoid(x, y, z, 0, 0.01 + by, 0.12, 0.16, 0.12, 0.22);
      const seg1 = sdEllipsoid(x, y, z, 0, 0.02 + by, -0.10, 0.15, 0.115, 0.14);
      const seg2 = sdEllipsoid(x, y, z, 0, 0.01 + by, -0.26, 0.14, 0.105, 0.13);
      const tailFanL = sdEllipsoid(x, y, z, -0.10, -0.01 + by, -0.42, 0.10, 0.035, 0.10);
      const tailFanR = sdEllipsoid(x, y, z,  0.10, -0.01 + by, -0.42, 0.10, 0.035, 0.10);

      let body = smin(thorax, seg1, 0.04);
      body = smin(body, seg2, 0.04);
      body = smin(body, Math.min(tailFanL, tailFanR), 0.03);

      // Pair of bulbous clubbed smasher arms (spring forward in punch0..2!)
      const clubL = sdCapsule(x, y, z, -0.12, -0.04 + by, 0.24, -0.13, -0.04 + by, 0.42 + punchExt, 0.055, 0.062);
      const clubR = sdCapsule(x, y, z,  0.12, -0.04 + by, 0.24,  0.13, -0.04 + by, 0.42 + punchExt, 0.055, 0.062);
      const clubs = Math.min(clubL, clubR);

      // 6 jointed scarlet walking legs
      let legs = 999;
      for (let i = 0; i < 3; i++) {
        const lz = 0.08 - i * 0.14;
        const sw = Math.sin(walkPhase + i * 1.4) * 0.07;
        const lL = sdCapsule(x, y, z, -0.12, -0.05 + by, lz, -0.22, -0.19, lz + sw, 0.028, 0.020);
        const lR = sdCapsule(x, y, z,  0.12, -0.05 + by, lz,  0.22, -0.19, lz - sw, 0.028, 0.020);
        legs = Math.min(legs, Math.min(lL, lR));
      }

      // Stalked compound eyes
      const eyeL = sdEllipsoid(x, y, z, -0.08, 0.14 + by, 0.30, 0.040, 0.040, 0.040);
      const eyeR = sdEllipsoid(x, y, z,  0.08, 0.14 + by, 0.30, 0.040, 0.040, 0.040);
      const eyes = Math.min(eyeL, eyeR);

      let d = body, mat = 'body';
      if (clubs < d) { d = clubs; mat = 'club'; }
      if (legs < d) { d = legs; mat = 'leg'; }
      if (eyes < d) { d = eyes; mat = 'eye'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'eye') return shade > 0.65 ? 'w' : shade > 0.3 ? 'b1' : 'k';
      if (mat === 'club' || mat === 'leg') return shade > 0.5 ? 'r1' : 'r0';
      // Cobalt-blue tail fan & golden-yellow peacock spots on emerald shell
      if (z < -0.32) return shade > 0.5 ? 'b1' : 'b0';
      if (Math.abs(x) > 0.10 && z > 0.02 && Math.sin(z * 28 + y * 24) > 0.65) return 'y';
      return shade > 0.72 ? 'e2' : shade > 0.38 ? 'e1' : 'e0';
    };

    pack = build27Pack(MANTIS_SHRIMP_PW, MANTIS_SHRIMP_PH, 1.02, 0.62, MANTIS_SHRIMP_PAL, evalFn, shadeFn);
    MANTIS_SHRIMP_CACHE.set(pose, pack);
  }
  return pack;
}

export function getMantisShrimpPosePack(...args: Parameters<typeof buildMantisShrimpPosePack>): ReturnType<typeof buildMantisShrimpPosePack> {
  return registerAnimalSpritePack(buildMantisShrimpPosePack(...args), { module: './DeepSeaPack.ts', factory: 'getMantisShrimpPosePack', args }, buildMantisShrimpPosePack);
}

// ============================================================================
// 5. LAGOSTA-PISTOLA (Pistol Shrimp) — 36×24 @ ANIMAL_PPU
// ============================================================================
export type PistolShrimpPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'walk0' | 'walk1' | 'walk2' | 'walk3' | 'walk4' | 'walk5'
  | 'snap0' | 'snap1' | 'snap2';

export const PISTOL_SHRIMP_PW = 36;
export const PISTOL_SHRIMP_PH = 24;
export const PISTOL_SHRIMP_W = PISTOL_SHRIMP_PW / ANIMAL_PPU;
export const PISTOL_SHRIMP_H = PISTOL_SHRIMP_PH / ANIMAL_PPU;

const PISTOL_SHRIMP_PAL: Record<string, [number, number, number]> = {
  k:  [0x22, 0x10, 0x10], // 1px outline / dark bead eyes
  r0: [0xa6, 0x20, 0x1c], // deep coral-red shadow
  r1: [0xe4, 0x3e, 0x2c], // vibrant coral-red bands
  r2: [0xff, 0x74, 0x52], // bright vermilion-coral highlight
  w0: [0xd4, 0xc8, 0xc0], // cream-white band shadow
  w1: [0xff, 0xf6, 0xee], // crisp white bands
  c:  [0x7a, 0xf4, 0xff], // sonic cavitation bubble flash in snap1!
};

const PISTOL_SHRIMP_CACHE = new Map<PistolShrimpPoseName, Boar27Pack>();

 function buildPistolShrimpPosePack(pose: PistolShrimpPoseName): Boar27Pack {
  let pack = PISTOL_SHRIMP_CACHE.get(pose);
  if (!pack) {
    let walkPhase = 0;
    let clawOpen = 0;
    let flashBubble = false;
    let by = 0;
    if (pose.startsWith('idle')) {
      const i = Number(pose.slice(4));
      by = i === 1 ? 0.01 : i === 2 ? -0.01 : 0;
    } else if (pose.startsWith('walk')) {
      const i = Number(pose.slice(4));
      walkPhase = (i / 6) * Math.PI * 2;
      by = Math.abs(Math.sin(walkPhase)) * 0.016;
    } else {
      const i = Number(pose.slice(4));
      clawOpen = i === 0 ? 0.10 : i === 1 ? 0.0 : 0.03;
      flashBubble = i === 1;
      by = i === 1 ? 0.02 : 0.0;
    }

    const evalFn: SdfEvaluator = (x, y, z) => {
      // Segmented coral-red & white banded shrimp body
      const thorax = sdEllipsoid(x, y, z, 0, 0.01 + by, 0.06, 0.145, 0.12, 0.20);
      const abd1 = sdEllipsoid(x, y, z, 0, 0.01 + by, -0.14, 0.13, 0.11, 0.14);
      const abd2 = sdEllipsoid(x, y, z, 0, -0.01 + by, -0.30, 0.10, 0.09, 0.12);
      const tail = sdEllipsoid(x, y, z, 0, -0.02 + by, -0.42, 0.13, 0.032, 0.085);

      let body = smin(thorax, abd1, 0.04);
      body = smin(body, abd2, 0.04);
      body = smin(body, tail, 0.03);

      // ONE GIANT OVERSIZED SONIC SNAPPING CLAW (right side) + small normal left claw!
      const bigClawPalm = sdEllipsoid(x, y, z, 0.17, 0.0 + by, 0.34, 0.125, 0.105, 0.165);
      const bigClawTop = sdCapsule(x, y, z, 0.17, 0.04 + by, 0.42, 0.17, 0.05 + by + clawOpen, 0.56, 0.042, 0.024);
      const bigClawBot = sdCapsule(x, y, z, 0.17, -0.04 + by, 0.42, 0.17, -0.04 + by, 0.55, 0.040, 0.022);
      const smallClaw = sdCapsule(x, y, z, -0.13, -0.03 + by, 0.20, -0.16, -0.04 + by, 0.38, 0.038, 0.026);
      body = smin(body, smin(bigClawPalm, Math.min(bigClawTop, bigClawBot), 0.02), 0.03);
      body = smin(body, smallClaw, 0.025);

      // 6 walking legs
      let legs = 999;
      for (let i = 0; i < 3; i++) {
        const lz = 0.04 - i * 0.13;
        const sw = Math.sin(walkPhase + i * 1.4) * 0.06;
        const lL = sdCapsule(x, y, z, -0.11, -0.05 + by, lz, -0.20, -0.18, lz + sw, 0.024, 0.018);
        const lR = sdCapsule(x, y, z,  0.11, -0.05 + by, lz,  0.20, -0.18, lz - sw, 0.024, 0.018);
        legs = Math.min(legs, Math.min(lL, lR));
      }
      body = smin(body, legs, 0.02);

      // Eyes
      const eyeL = sdEllipsoid(x, y, z, -0.065, 0.08 + by, 0.24, 0.026, 0.026, 0.026);
      const eyeR = sdEllipsoid(x, y, z,  0.065, 0.08 + by, 0.24, 0.026, 0.026, 0.026);
      const eyes = Math.min(eyeL, eyeR);

      // Sonic cavitation bubble flash at tip of giant claw in snap1!
      const bubble = flashBubble ? sdEllipsoid(x, y, z, 0.17, 0.01 + by, 0.62, 0.065, 0.065, 0.065) : 999;

      let d = body, mat = 'body';
      if (eyes < d) { d = eyes; mat = 'eye'; }
      if (bubble < d) { d = bubble; mat = 'bubble'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, _x, _y, z) => {
      if (mat === 'eye') return 'k';
      if (mat === 'bubble') return 'c';
      // Crisp coral-red & white transverse bands
      const band = Math.sin(z * 26) > 0.25;
      if (band) return shade > 0.45 ? 'w1' : 'w0';
      return shade > 0.72 ? 'r2' : shade > 0.36 ? 'r1' : 'r0';
    };

    pack = build27Pack(PISTOL_SHRIMP_PW, PISTOL_SHRIMP_PH, 1.04, 0.62, PISTOL_SHRIMP_PAL, evalFn, shadeFn);
    PISTOL_SHRIMP_CACHE.set(pose, pack);
  }
  return pack;
}

export function getPistolShrimpPosePack(...args: Parameters<typeof buildPistolShrimpPosePack>): ReturnType<typeof buildPistolShrimpPosePack> {
  return registerAnimalSpritePack(buildPistolShrimpPosePack(...args), { module: './DeepSeaPack.ts', factory: 'getPistolShrimpPosePack', args }, buildPistolShrimpPosePack);
}

// ============================================================================
// SHARED BASES & EXPORTED CLASSES (all accept pondCenter?: THREE.Vector3)
// ============================================================================
class PondFloater<TPose extends string> extends BasePixelAnimal {
  readonly position = new THREE.Vector3();
  private readonly pondCenter = new THREE.Vector3();
  private orbitAngle = rand(0, Math.PI * 2);
  private orbitRadius = rand(1.0, 2.8);
  private orbitDir = Math.random() < 0.5 ? 1 : -1;
  private animT = rand(0, 6.0);

  constructor(
    ctx: GameContext,
    startPos: THREE.Vector3,
    pondCenter: THREE.Vector3 | undefined,
    private readonly cfg: {
      name: string;
      hp: number;
      pw: number;
      ph: number;
      w: number;
      h: number;
      alt: number;
      speed: number;
      animRate: number;
      poses: readonly TPose[];
      getPack: (p: TPose) => Boar27Pack;
    },
  ) {
    super(ctx, cfg.getPack(cfg.poses[0]).getView(2, 0)!, cfg.pw, cfg.ph, cfg.w, cfg.h, cfg.name);
    this.hp = cfg.hp;
    this.maxHp = cfg.hp;
    this.pondCenter.copy(pondCenter ?? startPos);
    this.position.set(
      this.pondCenter.x + Math.cos(this.orbitAngle) * this.orbitRadius,
      this.pondCenter.y + cfg.alt,
      this.pondCenter.z + Math.sin(this.orbitAngle) * this.orbitRadius,
    );
    this.facing = this.orbitAngle + (this.orbitDir > 0 ? Math.PI * 0.5 : -Math.PI * 0.5);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.28, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 { return out.copy(this.position); }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y - 0.14, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.14, this.position.z);
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

  update(dt: number, _target: EnemyTarget | null, camera: THREE.Camera, drawingBufferSize?: THREE.Vector2) {
    if (dt > 0) {
      this.flash = Math.max(0, this.flash - dt * 4.5);
      if (!this.alive) {
        this.deadT += dt;
        this.position.y = damp(this.position.y, this.pondCenter.y - 0.15, 3, dt);
      } else {
        this.orbitAngle += this.cfg.speed * this.orbitDir * dt;
        this.animT += dt * this.cfg.animRate;
        const tx = this.pondCenter.x + Math.cos(this.orbitAngle) * this.orbitRadius;
        const tz = this.pondCenter.z + Math.sin(this.orbitAngle) * this.orbitRadius;
        this.facing += angleDiff(this.facing, Math.atan2(tx - this.position.x, tz - this.position.z)) * Math.min(1, dt * 5);
        this.position.x = damp(this.position.x, tx, 3.5, dt);
        this.position.z = damp(this.position.z, tz, 3.5, dt);
        this.position.y = damp(this.position.y, this.pondCenter.y + this.cfg.alt + Math.sin(this.animT * 0.8) * 0.08, 4, dt);
      }
      this.syncHurtbox();
    }
    const pose = this.alive ? pickCycle(this.cfg.poses, this.animT) : this.cfg.poses[0];
    this.renderBillboard(this.cfg.getPack(pose), this.position.y, camera, drawingBufferSize);
  }
}

class PondCrustacean<TPose extends string> extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private readonly home = new THREE.Vector3();
  private state: 'idle' | 'walk' | 'strike' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.4, 2.6);
  private targetYaw = rand(0, Math.PI * 2);
  private gaitPhase = rand(0, Math.PI * 2);

  constructor(
    ctx: GameContext,
    startPos: THREE.Vector3,
    pondCenter: THREE.Vector3 | undefined,
    private readonly cfg: {
      name: string;
      hp: number;
      pw: number;
      ph: number;
      w: number;
      h: number;
      idle: readonly TPose[];
      walk: readonly TPose[];
      strike: readonly TPose[];
      getPack: (p: TPose) => Boar27Pack;
    },
  ) {
    super(ctx, cfg.getPack(cfg.idle[0]).getView(2, 0)!, cfg.pw, cfg.ph, cfg.w, cfg.h, cfg.name);
    this.hp = cfg.hp;
    this.maxHp = cfg.hp;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.24;
    this.motor.height = 0.30;
    this.motor.teleport(startPos);
    this.home.copy(pondCenter ?? startPos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.30, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 { return out.set(this.position.x, this.position.y + 0.16, this.position.z); }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y + 0.08, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.24, this.position.z);
    this.hurtboxes[0].enabled = this.alive;
    this.stickRoot.position.set(this.position.x, this.position.y + 0.16, this.position.z);
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
    this.vel.y = 2.2;
    if (this.hp <= 0) { this.alive = false; res.killed = true; }
    else { this.state = 'strike'; this.stateT = 0; this.stateDur = 1.0; }
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
        if (dist < 2.6 && this.state !== 'strike') {
          this.state = 'strike';
          this.stateT = 0;
          this.stateDur = 1.1;
        }

        if (this.state === 'idle') {
          if (this.stateT >= this.stateDur) {
            this.state = 'walk';
            this.stateT = 0;
            this.stateDur = rand(1.6, 2.8);
            const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
            this.targetYaw = toHome > 4.5
              ? Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.5, 0.5)
              : this.facing + rand(-1.8, 1.8);
          }
        } else if (this.state === 'walk') {
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 6.0);
          speed = 1.4;
          if (this.stateT >= this.stateDur) {
            this.state = Math.random() < 0.35 ? 'strike' : 'idle';
            this.stateT = 0;
            this.stateDur = this.state === 'strike' ? 1.0 : rand(1.2, 2.2);
          }
        } else if (this.state === 'strike') {
          if (target && target.alive && dist < 4.0) {
            this.targetYaw = Math.atan2(target.position.x - this.position.x, target.position.z - this.position.z);
            this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 8.0);
          }
          if (this.stateT >= this.stateDur) {
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.2, 2.2);
          }
        }

        this.vel.x = damp(this.vel.x, Math.sin(this.facing) * speed, 8.0, dt);
        this.vel.z = damp(this.vel.z, Math.cos(this.facing) * speed, 8.0, dt);
        this.vel.y -= 20 * dt;
        this.motor.update(dt);

        const horiz = Math.hypot(this.vel.x, this.vel.z);
        if (horiz > 0.15) this.gaitPhase += dt * 7.0;
      }
      this.syncHurtbox();
    }

    let pose: TPose;
    if (!this.alive) pose = this.cfg.idle[0];
    else if (this.state === 'strike') pose = pickCycle(this.cfg.strike, this.stateT * 4.5);
    else if (this.state === 'walk') pose = pickCycle(this.cfg.walk, (this.gaitPhase / Math.PI) * 2.8);
    else pose = pickCycle(this.cfg.idle, this.stateT * 2.2);

    const deathSink = this.alive ? 0 : Math.min(0.12, this.deadT * 0.35);
    this.renderBillboard(this.cfg.getPack(pose), this.position.y + 0.16 - deathSink, camera, drawingBufferSize);
  }
}

export class VampireSquid extends PondFloater<VampireSquidPoseName> {
  constructor(ctx: GameContext, startPos: THREE.Vector3, pondCenter?: THREE.Vector3) {
    super(ctx, startPos, pondCenter, {
      name: 'VampireSquidBillboard', hp: 45,
      pw: VAMPIRE_SQUID_PW, ph: VAMPIRE_SQUID_PH, w: VAMPIRE_SQUID_W, h: VAMPIRE_SQUID_H,
      alt: 0.34, speed: 0.45, animRate: 4.5,
      poses: ['swim0', 'swim1', 'swim2', 'swim3', 'swim4', 'swim5'],
      getPack: getVampireSquidPosePack,
    });
  }
}

export class Jellyfish extends PondFloater<JellyfishPoseName> {
  constructor(ctx: GameContext, startPos: THREE.Vector3, pondCenter?: THREE.Vector3) {
    super(ctx, startPos, pondCenter, {
      name: 'JellyfishBillboard', hp: 30,
      pw: JELLYFISH_PW, ph: JELLYFISH_PH, w: JELLYFISH_W, h: JELLYFISH_H,
      alt: 0.44, speed: 0.32, animRate: 3.8,
      poses: ['pulse0', 'pulse1', 'pulse2', 'pulse3', 'pulse4', 'pulse5'],
      getPack: getJellyfishPosePack,
    });
  }
}

export class DumboOctopus extends PondFloater<DumboOctopusPoseName> {
  constructor(ctx: GameContext, startPos: THREE.Vector3, pondCenter?: THREE.Vector3) {
    super(ctx, startPos, pondCenter, {
      name: 'DumboOctopusBillboard', hp: 35,
      pw: DUMBO_OCTOPUS_PW, ph: DUMBO_OCTOPUS_PH, w: DUMBO_OCTOPUS_W, h: DUMBO_OCTOPUS_H,
      alt: 0.32, speed: 0.42, animRate: 5.0,
      poses: ['swim0', 'swim1', 'swim2', 'swim3', 'swim4', 'swim5'],
      getPack: getDumboOctopusPosePack,
    });
  }
}

export class MantisShrimp extends PondCrustacean<MantisShrimpPoseName> {
  constructor(ctx: GameContext, startPos: THREE.Vector3, pondCenter?: THREE.Vector3) {
    super(ctx, startPos, pondCenter, {
      name: 'MantisShrimpBillboard', hp: 50,
      pw: MANTIS_SHRIMP_PW, ph: MANTIS_SHRIMP_PH, w: MANTIS_SHRIMP_W, h: MANTIS_SHRIMP_H,
      idle: ['idle0', 'idle1', 'idle0', 'idle2'],
      walk: ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'],
      strike: ['punch0', 'punch1', 'punch2'],
      getPack: getMantisShrimpPosePack,
    });
  }
}

export class PistolShrimp extends PondCrustacean<PistolShrimpPoseName> {
  constructor(ctx: GameContext, startPos: THREE.Vector3, pondCenter?: THREE.Vector3) {
    super(ctx, startPos, pondCenter, {
      name: 'PistolShrimpBillboard', hp: 40,
      pw: PISTOL_SHRIMP_PW, ph: PISTOL_SHRIMP_PH, w: PISTOL_SHRIMP_W, h: PISTOL_SHRIMP_H,
      idle: ['idle0', 'idle1', 'idle0', 'idle2'],
      walk: ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'],
      strike: ['snap0', 'snap1', 'snap2'],
      getPack: getPistolShrimpPosePack,
    });
  }
}
