import * as THREE from 'three';
import { createCustomHeroOverrides } from './CustomHeroSprites';

/**
 * High-Detail Realistic 3D SDF Sculpted & Raymarched Sprites for the Hero (`HERO_PPU = 56`).
 *
 * Completely redesigned with:
 * - Higher pixel resolution (`HERO_PPU = 56`) so facial features, musculature, and clothing folds
 *   have true anatomical definition instead of blocky low-res shapes.
 * - Consistent 1px dark silhouette outline (`'0'`) across EVERY SINGLE PART (Head, Torso, Pelvis,
 *   UpperArm, Forearm, Hand, Thigh, and Shin+Boot), with open joint caps (`'openTop'` / `'openEnds'`)
 *   on limb junctions so the side outlines flow continuously along the arms and legs without horizontal
 *   black bars cutting through elbows or knees.
 * - Realistic heroic ranger design:
 *   • Head (24×24): defined jawline, cheekbones, brow ridges, nose bridge, lips, ears, expressive eyes
 *     with dark iris & white catchlight, and windswept layered chestnut hair with a ranger headband.
 *   • Torso (26×30): athletic V-tapered chest, sculpted leather brigandine/jerkin plates over a
 *     cream linen under-tunic, forest-green hooded ranger mantle & pauldron guards with golden leaf trim
 *     and brass throat clasp, diagonal leather baldric with ring buckle, and rolled canvas bedroll on back.
 *   • Pelvis (22×18): studded double-ring leather utility belt with ornate brass buckle, buttoned
 *     adventurer pouch on right hip, split linen tabard & green mantle tails over tailored breeches.
 *   • UpperArm (13×20), Forearm (12×18), Hand (10×10), Thigh (14×26), Shin+Boot (20×28):
 *     defined deltoid/bicep/tricep, forearm muscles + 3-strap buckled leather bracer, fingerless
 *     gauntlet glove with knuckles, muscular quadriceps breeches with stitched knee guard, and
 *     anatomical calf + cross-laced knee-high leather hunting boots with lugged soles.
 */

/** Uniform texels per world meter across every hero billboard part (56 PPU). */
export const HERO_PPU = 56;

export interface BillboardPartMeta {
  /** World-space width in meters (`pixelWidth / HERO_PPU`). */
  width: number;
  /** World-space height in meters (`pixelHeight / HERO_PPU`). */
  height: number;
  /**
   * Normalized anchor point within the sprite (0..1):
   * anchorX = 0.5 is horizontally centered; anchorY = 0 is bottom, 1 is top.
   */
  anchorX: number;
  anchorY: number;
  /** Pixel dimensions of the source offscreen canvas. */
  pixelWidth: number;
  pixelHeight: number;
}

export interface EightWayTier {
  front: THREE.CanvasTexture;
  frontSide: THREE.CanvasTexture;
  side: THREE.CanvasTexture;
  backSide: THREE.CanvasTexture;
  back: THREE.CanvasTexture;
}

export interface DirectionalTextures {
  // Level tier (0°–35°)
  front: THREE.CanvasTexture;
  frontSide: THREE.CanvasTexture;
  side: THREE.CanvasTexture;
  backSide: THREE.CanvasTexture;
  back: THREE.CanvasTexture;
  // High-angle transition tier (35°–60° looking down)
  highFront: THREE.CanvasTexture;
  highSide: THREE.CanvasTexture;
  highBack: THREE.CanvasTexture;
  // Full overhead tier (60°–90°): character forward (+Z) = sprite top (row 0 / +Y)
  top: THREE.CanvasTexture;
}

export interface HeadTextures extends DirectionalTextures {
  /** Halfway looking down (~13°–33°): full 8 horizontal directions. */
  midHigh: EightWayTier;
  /** Looking down (~33°–57°): full 8 horizontal directions. */
  high: EightWayTier;
  /** Halfway looking up (~-13° to -33°): full 8 horizontal directions. */
  midLow: EightWayTier;
  /** Looking up (~-33° to -57°): full 8 horizontal directions. */
  low: EightWayTier;
  /** Full under-view (~-57° to -90°): character forward (+Z) = sprite top (row 0 / +Y). */
  bottom: THREE.CanvasTexture;
}
export type CoreTextures = DirectionalTextures;
export type ShinTextures = DirectionalTextures;

export interface BillboardPartTextures<T = THREE.CanvasTexture> {
  textures: T;
  meta: BillboardPartMeta;
}

export interface HeroSpriteSet {
  head: BillboardPartTextures<HeadTextures>;
  torso: BillboardPartTextures<CoreTextures>;
  pelvis: BillboardPartTextures<CoreTextures>;
  upperArm: BillboardPartTextures<THREE.CanvasTexture>;
  forearm: BillboardPartTextures<THREE.CanvasTexture>;
  hand: BillboardPartTextures<THREE.CanvasTexture>;
  thigh: BillboardPartTextures<THREE.CanvasTexture>;
  /** Unified lower leg + boot + foot (9 directional views) — eliminates ankle seams & depth slicing. */
  shin: BillboardPartTextures<ShinTextures>;
  /** Flat list of all generated textures for convenience/disposal. */
  allTextures: THREE.CanvasTexture[];
}

/** Master RGB palette for the hero's sculpted anatomy and ranger armor/attire. */
const HERO_PAL: Record<string, [number, number, number]> = {
  // 0: 1px crisp dark silhouette outline & deep crevice
  '0': [0x14, 0x0f, 0x12],

  // Hair: deep espresso -> rich chestnut -> warm golden-amber highlights
  h0: [0x22, 0x15, 0x14],
  h1: [0x3d, 0x24, 0x1b],
  h2: [0x63, 0x3b, 0x24],
  h3: [0x94, 0x5a, 0x30],
  h4: [0xc9, 0x82, 0x40],

  // Skin: warm terracotta shadow -> muscular mid-tone -> sunlit peach highlight
  s0: [0x87, 0x40, 0x28],
  s1: [0xb5, 0x5c, 0x36],
  s2: [0xdc, 0x84, 0x49],
  s3: [0xf2, 0xaf, 0x63],
  s4: [0xfc, 0xd9, 0x8d],
  ew: [0xf5, 0xf2, 0xe8], // eye sclera catchlight
  ep: [0x17, 0x11, 0x16], // dark iris/pupil

  // Forest ranger hooded mantle & cloak: deep pine -> moss green -> sunlit leaf tip
  g0: [0x19, 0x2b, 0x20],
  g1: [0x2c, 0x48, 0x2e],
  g2: [0x47, 0x6e, 0x3a],
  g3: [0x6f, 0x96, 0x46],
  g4: [0xa3, 0xc0, 0x56],

  // Pleated cream linen under-tunic
  t0: [0x6c, 0x60, 0x4d],
  t1: [0x99, 0x8a, 0x6f],
  t2: [0xc7, 0xb6, 0x91],
  t3: [0xe6, 0xd8, 0xb3],
  t4: [0xfa, 0xf2, 0xd6],

  // Rich saddle leather: jerkin vest, baldric, utility belt, pouch, bracers, gloves, boots
  l0: [0x24, 0x16, 0x14],
  l1: [0x44, 0x29, 0x1f],
  l2: [0x6c, 0x42, 0x2a],
  l3: [0x99, 0x61, 0x39],
  l4: [0xc4, 0x88, 0x4d],

  // Aged brass: buckles, cloak clasp, belt studs, mantle trim
  y0: [0x5e, 0x45, 0x28],
  y1: [0xad, 0x85, 0x42],
  y2: [0xeb, 0xc6, 0x6a],

  // Tan canvas: bedroll, padded knee guard, cross-laced boot wraps
  p0: [0x57, 0x3b, 0x24],
  p1: [0x87, 0x5f, 0x37],
  p2: [0xb8, 0x86, 0x4a],
  p3: [0xde, 0xad, 0x65],
  p4: [0xf5, 0xcf, 0x84],

  // Charcoal-brown ranger breeches
  x0: [0x19, 0x16, 0x1e],
  x1: [0x2d, 0x25, 0x28],
  x2: [0x47, 0x39, 0x33],
  x3: [0x66, 0x51, 0x42],
};

function makeMeta(
  pixelWidth: number,
  pixelHeight: number,
  anchorX: number,
  anchorY: number,
): BillboardPartMeta {
  return {
    width: pixelWidth / HERO_PPU,
    height: pixelHeight / HERO_PPU,
    anchorX,
    anchorY,
    pixelWidth,
    pixelHeight,
  };
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};

function sdEllipsoid(
  px: number, py: number, pz: number,
  cx: number, cy: number, cz: number,
  rx: number, ry: number, rz: number,
): number {
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
): number {
  const pax = px - ax, pay = py - ay, paz = pz - az;
  const bax = bx - ax, bay = by - ay, baz = bz - az;
  const ba2 = bax * bax + bay * bay + baz * baz;
  const h = clamp((pax * bax + pay * bay + paz * baz) / (ba2 || 1), 0, 1);
  const dx = pax - bax * h, dy = pay - bay * h, dz = paz - baz * h;
  return Math.sqrt(dx * dx + dy * dy + dz * dz) - (rA + (rB - rA) * h);
}

function sdRoundBox(
  px: number, py: number, pz: number,
  cx: number, cy: number, cz: number,
  bx: number, by: number, bz: number,
  r: number,
): number {
  const qx = Math.abs(px - cx) - bx;
  const qy = Math.abs(py - cy) - by;
  const qz = Math.abs(pz - cz) - bz;
  const ox = Math.max(qx, 0), oy = Math.max(qy, 0), oz = Math.max(qz, 0);
  return Math.sqrt(ox * ox + oy * oy + oz * oz) + Math.min(Math.max(qx, Math.max(qy, qz)), 0) - r;
}

function smin(a: number, b: number, k: number): number {
  const h = clamp(0.5 + (0.5 * (b - a)) / k, 0, 1);
  return b * (1 - h) + a * h - k * h * (1 - h);
}

type HeroSdfEval = (x: number, y: number, z: number) => { d: number; mat: string };
type HeroColorShaper = (
  mat: string,
  shade: number,
  x: number, y: number, z: number,
  nx: number, ny: number, nz: number,
  isPole: boolean,
  lx: number, ly: number, lz: number,
) => string;

/**
 * Raymarches an orthographic 3D SDF part into a crisp pixel-art CanvasTexture with
 * view-consistent key lighting + ambient occlusion and a 1px dark outline (`0`) on EVERY part:
 * - `'full'`: complete 1px dark silhouette outline on all sides (Head, Torso, Pelvis, Hand, Top views).
 * - `'openTop'`: 1px dark outline on left, right, and bottom, leaving only row 0..1 open so forearm/shin
 *   connect seamlessly into elbow/knee without a horizontal black line across the joint.
 * - `'openEnds'`: 1px dark outline on left and right edges, leaving only the top and bottom joint rows open
 *   (UpperArm and Thigh).
 */
function raymarchHeroPart(
  pw: number,
  ph: number,
  ex: number,
  ey: number,
  yawDeg: number,
  pitchDeg: number,
  rollFwdTop: boolean,
  evalFn: HeroSdfEval,
  shadeFn: HeroColorShaper,
  screenShiftX = 0,
  outlineMode: 'full' | 'openTop' | 'openBottom' | 'openEnds' = 'full',
): THREE.CanvasTexture {
  const yaw = (yawDeg * Math.PI) / 180;
  const pitch = (pitchDeg * Math.PI) / 180;
  const cp = Math.cos(pitch), sp = Math.sin(pitch);
  const sx = -Math.sin(yaw) * cp;
  const sy = sp;
  const sz = Math.cos(yaw) * cp;
  const rdx = -sx, rdy = -sy, rdz = -sz;

  let ux = 0;
  let uy = rollFwdTop ? 0 : 1;
  let uz = rollFwdTop ? 1 : 0;
  const ud = ux * sx + uy * sy + uz * sz;
  ux -= sx * ud; uy -= sy * ud; uz -= sz * ud;
  const ul = Math.sqrt(ux * ux + uy * uy + uz * uz) || 1;
  ux /= ul; uy /= ul; uz /= ul;
  const rx = uy * sz - uz * sy;
  const ry = uz * sx - ux * sz;
  const rz = ux * sy - uy * sx;

  // View-relative key light (top-right-front in camera space) so every angle has rich 3D volume
  const lvX = 0.36, lvY = 0.74, lvZ = 0.56;
  const Lx = lvX * rx + lvY * ux + lvZ * sx;
  const Ly = lvX * ry + lvY * uy + lvZ * sy;
  const Lz = lvX * rz + lvY * uz + lvZ * sz;

  const boundR = Math.max(ex, ey) * 1.48;
  const boundR2 = boundR * boundR;
  const tStart = Math.max(0, 2.5 - boundR);
  const tEnd = 2.5 + boundR;

  const grid: string[] = new Array(pw * ph).fill('.');

  for (let py = 0; py < ph; py++) {
    const v = (1 - (py + 0.5) / ph) * 2 - 1;
    const syWorld = v * ey;
    const rowOff = py * pw;
    for (let px = 0; px < pw; px++) {
      const u = ((px + 0.5) / pw) * 2 - 1 - screenShiftX;
      const sxWorld = u * ex;
      if (sxWorld * sxWorld + syWorld * syWorld > boundR2) continue;

      const rox = sx * 2.5 + rx * sxWorld + ux * syWorld;
      const roy = sy * 2.5 + ry * sxWorld + uy * syWorld;
      const roz = sz * 2.5 + rz * sxWorld + uz * syWorld;

      let t = tStart;
      let hit = false;
      let hitMat = 'skin';
      let hx = 0, hy = 0, hz = 0;
      for (let s = 0; s < 36; s++) {
        hx = rox + rdx * t;
        hy = roy + rdy * t;
        hz = roz + rdz * t;
        const res = evalFn(hx, hy, hz);
        if (res.d < 0.0032) {
          hit = true;
          hitMat = res.mat;
          break;
        }
        t += res.d * 0.9;
        if (t > tEnd) break;
      }
      if (!hit) continue;

      const eps = 0.0065;
      const d0 = evalFn(hx, hy, hz).d;
      const nx = evalFn(hx + eps, hy, hz).d - d0;
      const ny = evalFn(hx, hy + eps, hz).d - d0;
      const nz = evalFn(hx, hy, hz + eps).d - d0;
      const nl = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
      const nnx = nx / nl, nny = ny / nl, nnz = nz / nl;

      const ndl = nnx * Lx + nny * Ly + nnz * Lz;
      const hemi = nny * 0.5 + 0.5;
      const shade = clamp(ndl * 0.56 + hemi * 0.24 + 0.28, 0, 1);

      grid[rowOff + px] = shadeFn(hitMat, shade, hx, hy, hz, nnx, nny, nnz, rollFwdTop, Lx, Ly, Lz);
    }
  }

  // Consistent 1px dark outline ('0') across ALL parts
  const out = grid.slice();
  const checkTopNeighbor = outlineMode === 'full' || outlineMode === 'openBottom';
  const checkBottomNeighbor = outlineMode === 'full' || outlineMode === 'openTop';

  for (let y = 0; y < ph; y++) {
    const ro = y * pw;
    for (let x = 0; x < pw; x++) {
      if (grid[ro + x] !== '.') continue;
      if (
        (x > 0 && grid[ro + x - 1] !== '.') ||
        (x < pw - 1 && grid[ro + x + 1] !== '.') ||
        (checkTopNeighbor && y > 0 && grid[ro - pw + x] !== '.') ||
        (checkBottomNeighbor && y < ph - 1 && grid[ro + pw + x] !== '.')
      ) {
        // For 'openBottom' (head), skip only the 4-pixel-wide neck bottom cap at y >= ph - 2
        if (outlineMode === 'openBottom' && y >= ph - 2 && Math.abs(x - pw * 0.5) < 3.5) continue;
        out[ro + x] = '0';
      }
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = pw;
  canvas.height = ph;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const img = ctx.createImageData(pw, ph);
    const data = img.data;
    for (let i = 0; i < out.length; i++) {
      const ch = out[i];
      if (ch === '.') continue;
      const rgb = HERO_PAL[ch] ?? HERO_PAL['0'];
      const idx = i * 4;
      data[idx] = rgb[0];
      data[idx + 1] = rgb[1];
      data[idx + 2] = rgb[2];
      data[idx + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

// ============================================================================
// 1. REALISTIC 3D SDF HEAD (24×24 @ 56 PPU = 0.4286m × 0.4286m)
// Smooth, balanced oval face with subtle jaw & chin, sculpted nose bridge, ears,
// muscular neck, crisp 1×3 vertical pixel eyes, radial-blended studio skin shading,
// and swept multi-layered chestnut hair locks with full 1px dark outline!
// ============================================================================
const HEAD_HAIR_TUFTS: readonly [number, number, number, number, number, number, number, number][] = [
  // Crown & top windswept locks
  [0.004, 0.105, 0.005, 0.012, 0.168, -0.018, 0.046, 0.018],
  [-0.042, 0.098, -0.004, -0.086, 0.150, -0.015, 0.042, 0.018],
  [0.042, 0.098, -0.004, 0.086, 0.150, -0.015, 0.042, 0.018],
  // Side swept locks
  [-0.076, 0.045, 0.000, -0.118, 0.072, -0.010, 0.036, 0.017],
  [0.076, 0.045, 0.000, 0.118, 0.072, -0.010, 0.036, 0.017],
  [-0.084, 0.005, 0.022, -0.096, -0.040, 0.028, 0.024, 0.012],
  [0.084, 0.005, 0.022, 0.096, -0.040, 0.028, 0.024, 0.012],
  // Parted forehead bangs framing the brow (lifted slightly so forehead & eyes are clean!)
  [-0.016, 0.090, 0.072, -0.046, 0.050, 0.098, 0.024, 0.012],
  [0.016, 0.090, 0.072, 0.050, 0.052, 0.098, 0.024, 0.012],
  [-0.055, 0.082, 0.058, -0.078, 0.035, 0.078, 0.023, 0.011],
  [0.055, 0.082, 0.058, 0.078, 0.035, 0.078, 0.023, 0.011],
  // Back & nape layered locks
  [0.000, 0.052, -0.074, 0.000, 0.076, -0.122, 0.042, 0.018],
  [-0.046, 0.034, -0.068, -0.084, 0.042, -0.112, 0.036, 0.018],
  [0.046, 0.034, -0.068, 0.084, 0.042, -0.112, 0.036, 0.018],
  [-0.035, -0.038, -0.065, -0.052, -0.082, -0.098, 0.028, 0.014],
  [0.035, -0.038, -0.065, 0.052, -0.082, -0.098, 0.028, 0.014],
];

const evalHeroHead: HeroSdfEval = (x, y, z) => {
  const sy = y + 0.018;
  const ax = Math.abs(x);

  const cranium = sdEllipsoid(x, sy, z, 0, 0.014, -0.002, 0.096, 0.114, 0.100);
  const jaw = sdEllipsoid(x, sy, z, 0, -0.052, 0.016, 0.072, 0.058, 0.076);
  const chin = sdEllipsoid(x, sy, z, 0, -0.090, 0.034, 0.036, 0.026, 0.038);
  let skin = smin(cranium, jaw, 0.034);
  skin = smin(skin, chin, 0.022);

  const nose = sdCapsule(x, sy, z, 0, -0.018, 0.088, 0, -0.038, 0.106, 0.014, 0.012);
  skin = smin(skin, nose, 0.010);

  const ear = sdEllipsoid(ax, sy, z, 0.094, -0.020, -0.005, 0.017, 0.027, 0.015);
  const neck = sdCapsule(x, sy, z, 0, -0.085, -0.006, 0, -0.132, -0.012, 0.034, 0.036);
  skin = smin(skin, ear, 0.007);
  skin = smin(skin, neck, 0.011);

  const hairCap = sdEllipsoid(x, sy, z, 0, 0.048, -0.014, 0.110, 0.116, 0.112);
  const faceCut = sdEllipsoid(x, sy, z, 0, -0.032, 0.082, 0.086, 0.094, 0.092);
  let hair = Math.max(hairCap, -faceCut);

  const backHair = sdEllipsoid(x, sy, z, 0, -0.020, -0.046, 0.098, 0.088, 0.086);
  hair = smin(hair, backHair, 0.024);

  for (let i = 0; i < HEAD_HAIR_TUFTS.length; i++) {
    const s = HEAD_HAIR_TUFTS[i];
    hair = smin(hair, sdCapsule(x, sy, z, s[0], s[1], s[2], s[3], s[4], s[5], s[6], s[7]), 0.022);
  }

  return { d: Math.min(hair, skin), mat: hair < skin ? 'hair' : 'skin' };
};

const shadeHeroHead: HeroColorShaper = (mat, _shade, x, y, z, snx, sny, snz, isPole, lx, ly, lz) => {
  const sy = y + 0.018;
  const ax = Math.abs(x);
  if (mat === 'skin' && z > 0.042 && !isPole) {
    // Crisp 1×3 vertical dark eyes at 24×24 (never 2px wide and never touching bangs)
    const ex = (ax - 0.041) / 0.0082;
    const ey = (sy + 0.025) / 0.030;
    if (sy < 0.002 && ex * ex + ey * ey < 1.0) {
      return 'ep';
    }
  }

  // Blend true surface normal with radial spherical normal so the face has clean,
  // studio-lit pixel-art skin bands instead of noisy micro-shadows
  const rl = Math.hypot(x, sy - 0.01, z) || 1;
  const rnx = x / rl, rny = (sy - 0.01) / rl, rnz = z / rl;
  const blend = mat === 'hair' ? 0.58 : 0.48;
  let nx = snx * (1 - blend) + rnx * blend;
  let ny = sny * (1 - blend) + rny * blend;
  let nz = snz * (1 - blend) + rnz * blend;
  const nl = Math.hypot(nx, ny, nz) || 1;
  nx /= nl; ny /= nl; nz /= nl;
  const ndl = nx * lx + ny * ly + nz * lz;

  if (mat === 'hair') {
    const heightBias = clamp((sy - 0.026) * 2.7, -0.42, 0.40);
    const s = ndl * 0.56 + heightBias + 0.04;
    return s > 0.82 ? 'h4' : s > 0.56 ? 'h3' : s > 0.28 ? 'h2' : s > -0.02 ? 'h1' : 'h0';
  }

  const underJaw = -0.34 * smoothstep(-0.048, -0.105, sy) * smoothstep(0.1, -0.5, ny);
  const neckShade = -0.28 * smoothstep(-0.088, -0.128, sy);
  const s = ndl * 0.66 + underJaw + neckShade + 0.30;
  return s > 0.88 ? 's4' : s > 0.58 ? 's3' : s > 0.30 ? 's2' : s > 0.02 ? 's1' : 's0';
};

// ============================================================================
// 2. REALISTIC 3D SDF TORSO (26×30 @ 56 PPU = 0.4643m × 0.5357m)
// Sculpted heroic V-tapered upper body with defined pectoral plates, fitted
// leather ranger jerkin flanks over a pleated cream linen under-tunic, layered
// forest-green hooded mantle with gold-embroidered trim & brass throat clasp,
// diagonal leather baldric with brass ring buckle, and rolled bedroll on back.
// ============================================================================
const evalHeroTorso: HeroSdfEval = (x, y, z) => {
  const ax = Math.abs(x);

  // Exposed upper neck / collarbone skin in the front V-neck opening
  const neckCollarSkin = sdCapsule(x, y, z, 0, 0.20, 0.025, 0, 0.162, 0.048, 0.036, 0.028);

  // Heroic V-tapered muscular chest & waist:
  // Defined left/right pectorals separated by a sternum groove, tapered ribcage, and slim waist
  const pecSlab = sdEllipsoid(ax, y, z, 0.050, 0.055, 0.042, 0.066, 0.064, 0.060);
  const ribcage = sdEllipsoid(x, y, z, 0, 0.042, 0.005, 0.134, 0.112, 0.090);
  const waistTaper = sdCapsule(x, y, z, 0, 0.03, 0.008, 0, -0.195, 0.008, 0.114, 0.078);
  const obliques = sdEllipsoid(ax, y, z, 0.062, -0.09, 0.015, 0.040, 0.082, 0.058);
  let tunic = smin(smin(pecSlab, ribcage, 0.024), smin(waistTaper, obliques, 0.028), 0.028);
  const sternumGroove = sdCapsule(x, y, z, 0, 0.10, 0.102, 0, -0.16, 0.088, 0.014, 0.012);
  tunic = Math.max(tunic, -sternumGroove * 0.48);

  // Fitted brown leather ranger jerkin / side-corset panels hugging the outer ribs & obliques
  const jerkinFlank = sdEllipsoid(ax, y, z, 0.086, -0.075, 0.018, 0.042, 0.095, 0.066);

  // Sculpted multi-layered leafy shoulder mantle & hooded cowl:
  // Carved with a deep central neck opening so top/high views show the collar ring & inner linen tunic
  const cowlBack = sdEllipsoid(x, y, z, 0, 0.188, -0.028, 0.142, 0.060, 0.105);
  const cowlSide = sdCapsule(ax, y, z, 0.046, 0.185, 0.042, 0.135, 0.115, 0.018, 0.056, 0.062);
  const pauldronUpper = sdEllipsoid(ax, y, z, 0.120, 0.105, 0.005, 0.074, 0.076, 0.095);
  const pauldronLower = sdEllipsoid(ax, y, z, 0.112, 0.035, -0.005, 0.062, 0.065, 0.085);
  const chestVFlap = sdCapsule(ax, y, z, 0.022, 0.085, 0.066, 0.102, 0.035, 0.050, 0.054, 0.050);
  const neckHole = sdEllipsoid(x, y, z, 0, 0.215, 0.005, 0.066, 0.075, 0.066);

  // Draped back cloak with 3 vertical fabric folds and ragged leaf-point hem
  const backFold = Math.cos(x * 44) * 0.011;
  const hemJagged = Math.sin(x * 38) * 0.022;
  const backCloak = sdRoundBox(
    x,
    y - hemJagged,
    z - backFold,
    0, -0.015, -0.082,
    0.120 - Math.max(0, -y) * 0.15,
    0.184,
    0.030,
    0.020,
  );
  let mantle = smin(smin(cowlBack, cowlSide, 0.024), smin(pauldronUpper, pauldronLower, 0.024), 0.024);
  mantle = smin(mantle, chestVFlap, 0.024);
  mantle = smin(mantle, backCloak, 0.026);
  mantle = Math.max(mantle, -neckHole);

  // Brass cloak pin / clasp at the base of the V-throat
  const cloakPin = sdEllipsoid(x, y, z, 0, 0.112, 0.102, 0.022, 0.020, 0.016);

  const bodySurface = Math.min(tunic, mantle);

  // Diagonal brown leather baldric strap across chest + brass buckle ring on left pectoral
  const baldricDiag = sdCapsule(x, y, z, -0.088, 0.148, -0.015, 0.088, -0.158, 0.092, 0.042, 0.040);
  const baldricFront = sdRoundBox(
    (x + y * 0.62) * 0.85,
    y,
    z,
    0.0, -0.005, 0.045,
    0.023, 0.175, 0.076,
    0.007,
  );
  const baldricBand = Math.max(Math.min(baldricDiag, baldricFront), Math.abs(bodySurface) - 0.019);
  const baldricBuckle = sdRoundBox(x, y, z, -0.018, 0.025, 0.100, 0.024, 0.022, 0.014, 0.005);

  // Rolled tan canvas bedroll horizontally strapped across the upper back (y = +0.122, z = -0.122)
  const bedroll = sdCapsule(x, y, z, -0.140, 0.122, -0.122, 0.140, 0.122, -0.122, 0.045, 0.045);
  const strapRing = sdCapsule(ax, y, z, 0.062, 0.122, -0.122, 0.062, 0.122, -0.126, 0.051, 0.051);
  const strapRingClip = Math.max(strapRing, Math.abs(ax - 0.062) - 0.018);
  const strapTail = sdCapsule(ax, y, z, 0.062, 0.085, -0.156, 0.062, 0.015, -0.144, 0.017, 0.014);
  const bedStraps = Math.min(strapRingClip, strapTail);

  let d = tunic, mat = 'tunic';
  if (jerkinFlank < d + 0.003 && y < 0.01 && z > -0.02) { d = Math.min(d, jerkinFlank); mat = 'jerkin'; }
  if (neckCollarSkin < d && z > 0.0) { d = neckCollarSkin; mat = 'skin'; }
  if (mantle < d) { d = mantle; mat = 'mantle'; }
  if (cloakPin < d + 0.003) { d = Math.min(d, cloakPin); mat = 'brass'; }
  if (baldricBand < d + 0.005 && z > -0.035 && y < 0.155 && y > -0.18) {
    d = Math.min(d, baldricBand);
    mat = 'leather';
  }
  if (baldricBuckle < d + 0.003 && z > 0.08) {
    d = Math.min(d, baldricBuckle);
    mat = 'brass';
  }
  if (bedroll < d) { d = bedroll; mat = 'bedroll'; }
  if (bedStraps < d + 0.003) { d = Math.min(d, bedStraps); mat = 'leather'; }
  return { d, mat };
};

const shadeHeroTorso: HeroColorShaper = (mat, shade, x, y, z) => {
  if (mat === 'skin') {
    return shade > 0.65 ? 's3' : shade > 0.35 ? 's2' : 's1';
  }
  if (mat === 'brass') {
    return shade > 0.62 ? 'y2' : shade > 0.32 ? 'y1' : 'y0';
  }
  if (mat === 'jerkin') {
    // Segmented leather rib-armor plates on flanks
    const ribPlate = Math.sin(y * 85) > 0.55 ? -0.14 : 0.04;
    const s = clamp(shade + ribPlate, 0, 1);
    return s > 0.72 ? 'l3' : s > 0.46 ? 'l2' : s > 0.22 ? 'l1' : 'l0';
  }
  if (mat === 'leather') {
    return shade > 0.74 ? 'l4' : shade > 0.50 ? 'l3' : shade > 0.28 ? 'l2' : shade > 0.12 ? 'l1' : 'l0';
  }
  if (mat === 'bedroll') {
    const rEnd = Math.hypot(y - 0.122, z + 0.122);
    if (Math.abs(x) > 0.120 && rEnd < 0.033 && rEnd > 0.011) return '0';
    return shade > 0.76 ? 'p4' : shade > 0.52 ? 'p3' : shade > 0.30 ? 'p2' : shade > 0.14 ? 'p1' : 'p0';
  }
  if (mat === 'mantle') {
    const leafCluster = Math.sin(x * 46 + y * 30) * Math.cos(x * 30 - y * 38) * 0.15;
    const tieredSeam = Math.abs(y - 0.085 - Math.abs(x) * 0.25) < 0.011 ? -0.16 : 0;
    const s = clamp(shade + leafCluster + tieredSeam, 0, 1);
    return s > 0.78 ? 'g4' : s > 0.56 ? 'g3' : s > 0.34 ? 'g2' : s > 0.16 ? 'g1' : 'g0';
  }
  // Pleated linen tunic with pectoral contour shadow, center V-lacing & vertical folds
  const ax = Math.abs(x);
  if (z > 0.05 && y > 0.01 && y < 0.09 && ax < 0.016 && Math.sin(y * 160) > 0.2) {
    return 't0';
  }
  const pecUnderShadow = z > 0.04 && Math.abs(y - 0.008) < 0.013 && ax > 0.016 && ax < 0.085 ? -0.18 : 0;
  const pleat = Math.cos(x * 48) * 0.08 + pecUnderShadow - (y < -0.14 ? 0.08 : 0);
  const s = clamp(shade + pleat, 0, 1);
  return s > 0.76 ? 't4' : s > 0.54 ? 't3' : s > 0.32 ? 't2' : s > 0.14 ? 't1' : 't0';
};

// ============================================================================
// 3. REALISTIC 3D SDF PELVIS (22×18 @ 56 PPU = 0.3929m × 0.3214m)
// Sculpted hip & glute anatomy, studded leather utility belt RING with brass
// center buckle, buttoned right-hip pouch, pleated center linen tabard flanked
// by green mantle tails, and tailored dark ranger breeches.
// ============================================================================
const evalHeroPelvis: HeroSdfEval = (x, y, z) => {
  const ax = Math.abs(x);

  const hipCore = sdEllipsoid(x, y, z, 0, -0.015, -0.005, 0.112, 0.095, 0.088);
  const glutes = sdEllipsoid(ax, y, z, 0.046, -0.025, -0.035, 0.054, 0.068, 0.056);
  const legSplit = sdCapsule(ax, y, z, 0.054, -0.02, 0.005, 0.060, -0.108, 0.005, 0.048, 0.040);
  const shorts = smin(smin(hipCore, glutes, 0.02), legSplit, 0.02);

  // Waist linen core visible inside the belt ring from above (`top`/`high` views)
  const waistCore = sdEllipsoid(x, y, z, 0, 0.045, 0.0, 0.102, 0.048, 0.078);
  const tabardW = 0.028 - Math.max(0, -y) * 0.10;
  const tabard = Math.min(waistCore, sdRoundBox(x, y, z, 0, -0.015, 0.004, tabardW, 0.095, 0.090, 0.010));
  const greenFlaps = sdRoundBox(x, y, z, 0, -0.005, -0.012, 0.084 - Math.max(0, -y) * 0.12, 0.080, 0.084, 0.014);

  // Hollow leather belt ring wrapping around the waist perimeter so top/high views show the belt rim
  const beltOuter = sdRoundBox(x, y, z, 0, 0.060, 0.0, 0.114, 0.024, 0.092, 0.012);
  const beltInner = sdRoundBox(x, y, z, 0, 0.060, 0.0, 0.086, 0.040, 0.066, 0.010);
  const belt = Math.max(beltOuter, -beltInner);
  const buckle = sdRoundBox(x, y, z, 0, 0.060, 0.096, 0.024, 0.022, 0.012, 0.005);
  const pouch = sdRoundBox(x, y, z, -0.090, 0.004, 0.042, 0.034, 0.046, 0.044, 0.012);
  const pouchStud = sdEllipsoid(x, y, z, -0.112, -0.006, 0.064, 0.015, 0.015, 0.015);

  let d = shorts, mat = 'shorts';
  if (greenFlaps < d) { d = greenFlaps; mat = 'mantle'; }
  if (tabard < d) { d = tabard; mat = 'tunic'; }
  if (pouch < d) { d = pouch; mat = 'pouch'; }
  if (belt < d) { d = belt; mat = 'belt'; }
  if (buckle < d + 0.003) { d = Math.min(d, buckle); mat = 'brass'; }
  if (pouchStud < d + 0.003) { d = Math.min(d, pouchStud); mat = 'brass'; }
  return { d, mat };
};

const shadeHeroPelvis: HeroColorShaper = (mat, shade, x, y, z) => {
  if (mat === 'brass') return shade > 0.62 ? 'y2' : shade > 0.32 ? 'y1' : 'y0';
  if (mat === 'belt') {
    if (y < 0.036) return 'l0';
    return shade > 0.72 ? 'l4' : shade > 0.48 ? 'l3' : shade > 0.24 ? 'l2' : 'l1';
  }
  if (mat === 'pouch') {
    if (Math.abs(y - 0.008) < 0.010 && z > 0.01) return 'l0';
    if (Math.hypot(x + 0.090, y + 0.008) < 0.016 && z > 0.045) return 'y2';
    return shade > 0.74 ? 'l4' : shade > 0.50 ? 'l3' : shade > 0.28 ? 'l2' : 'l1';
  }
  if (mat === 'mantle') return shade > 0.72 ? 'g3' : shade > 0.45 ? 'g2' : shade > 0.22 ? 'g1' : 'g0';
  if (mat === 'tunic') return shade > 0.72 ? 't4' : shade > 0.45 ? 't3' : shade > 0.22 ? 't2' : 't1';
  return shade > 0.72 ? 'x3' : shade > 0.46 ? 'x2' : shade > 0.22 ? 'x1' : 'x0';
};

// ============================================================================
// 4. REALISTIC 3D SDF SHIN + STRAPPED LEATHER BOOT (20×28 @ 56 PPU = 0.3571m × 0.5000m)
// Sculpted gastrocnemius calf muscle & shinbone ridge (with continuous side outlines
// and open top joint cap) + flared leather boot cuff + criss-cross tan ankle wraps
// + sculpted vamp, rounded toe box, heel & lug sole.
// ============================================================================
const evalHeroShin: HeroSdfEval = (x, y, z) => {
  const shinShaft = sdCapsule(x, y, z, 0, 0.25, -0.035, 0, -0.14, -0.035, 0.042, 0.036);
  const calfBelly = sdEllipsoid(x, y, z, 0, 0.135, -0.050, 0.043, 0.080, 0.052);
  const bareLeg = smin(shinShaft, calfBelly, 0.016);

  const bootCuff = sdRoundBox(x, y, z, 0, 0.048, -0.035, 0.054, 0.020, 0.054, 0.011);
  const bootShaft = sdCapsule(x, y, z, 0, 0.042, -0.035, 0, -0.165, -0.035, 0.050, 0.045);
  const ankleWraps = sdRoundBox(x, y, z, 0, -0.038, -0.035, 0.048, 0.040, 0.050, 0.011);
  const instep = sdCapsule(x, y, z, 0, -0.140, -0.035, 0, -0.172, 0.075, 0.050, 0.044);
  const toeBox = sdEllipsoid(x, y, z, 0, -0.168, 0.096, 0.052, 0.044, 0.066);
  const heel = sdEllipsoid(x, y, z, 0, -0.174, -0.052, 0.048, 0.042, 0.046);
  const boot = smin(smin(bootCuff, bootShaft, 0.014), smin(smin(instep, toeBox, 0.022), heel, 0.018), 0.018);

  let d = bareLeg, mat = 'skin';
  if (boot < d) {
    d = boot;
    mat = y < -0.196 ? 'sole' : 'leather';
  }
  if (ankleWraps < d + 0.004 && y > -0.090 && y < 0.010) {
    d = Math.min(d, ankleWraps);
    mat = 'wrap';
  }
  return { d, mat };
};

/** Pure top-down boot/foot evaluator (`SHIN_TOP`) without upper calf skin obscuring the boot. */
const evalHeroBootTop: HeroSdfEval = (x, y, z) => {
  const bootCuff = sdRoundBox(x, y, z, 0, 0.02, -0.045, 0.052, 0.035, 0.052, 0.012);
  const ankleWraps = sdRoundBox(x, y, z, 0, -0.04, 0.005, 0.048, 0.045, 0.048, 0.012);
  const instep = sdCapsule(x, y, z, 0, -0.12, -0.045, 0, -0.16, 0.085, 0.052, 0.048);
  const toeBox = sdEllipsoid(x, y, z, 0, -0.16, 0.105, 0.054, 0.046, 0.068);
  const heel = sdEllipsoid(x, y, z, 0, -0.16, -0.065, 0.050, 0.044, 0.050);
  const boot = smin(bootCuff, smin(smin(instep, toeBox, 0.024), heel, 0.020), 0.018);
  let d = boot, mat = 'leather';
  if (ankleWraps < d + 0.004 && z > -0.03 && z < 0.045) {
    d = Math.min(d, ankleWraps);
    mat = 'wrap';
  }
  return { d, mat };
};

const shadeHeroShin: HeroColorShaper = (mat, shade, _x, y, z) => {
  if (mat === 'sole') return 'l0';
  if (mat === 'wrap') {
    const d1 = Math.sin((y + z * 0.55) * 115);
    const d2 = Math.sin((y - z * 0.55) * 115);
    const cross = Math.max(d1, d2) > 0.15 ? 0.10 : -0.08;
    const s = clamp(shade + cross, 0, 1);
    return s > 0.74 ? 'p4' : s > 0.50 ? 'p3' : s > 0.28 ? 'p2' : 'p1';
  }
  if (mat === 'leather') {
    if (Math.abs(y - 0.024) < 0.009) return 'l0';
    return shade > 0.76 ? 'l4' : shade > 0.52 ? 'l3' : shade > 0.28 ? 'l2' : shade > 0.12 ? 'l1' : 'l0';
  }
  return shade > 0.76 ? 's4' : shade > 0.52 ? 's3' : shade > 0.28 ? 's2' : 's1';
};

/**
 * Raymarches all 58 hero pixel-art billboard textures from 3D SDF sculptures at uniform
 * `HERO_PPU` (56) (with user-edited front & limb sprites from `CustomHeroSprites.ts`)
 * and returns them with world-space dimensions and anchors for `HumanoidRig`.
 */
export function createHeroSpriteSet(): HeroSpriteSet {
  const allTextures: THREE.CanvasTexture[] = [];
  const reg = (tex: THREE.CanvasTexture) => {
    allTextures.push(tex);
    return tex;
  };
  const custom = createCustomHeroOverrides();

  // Head uses a 26×26 grid (0.4643m × 0.4643m) so the user's 25×26 spiky-haired front face
  // fits with its full 1px dark outline and all other 26 views match at uniform 56 PPU!
  const bakeHeadTier = (pitchDeg: number): EightWayTier => ({
    front: reg(raymarchHeroPart(26, 26, 0.232, 0.232, 0, pitchDeg, false, evalHeroHead, shadeHeroHead, 0, 'openBottom')),
    frontSide: reg(raymarchHeroPart(26, 26, 0.232, 0.232, 45, pitchDeg, false, evalHeroHead, shadeHeroHead, 0, 'openBottom')),
    side: reg(raymarchHeroPart(26, 26, 0.232, 0.232, 90, pitchDeg, false, evalHeroHead, shadeHeroHead, 0, 'openBottom')),
    backSide: reg(raymarchHeroPart(26, 26, 0.232, 0.232, 135, pitchDeg, false, evalHeroHead, shadeHeroHead, 0, 'openBottom')),
    back: reg(raymarchHeroPart(26, 26, 0.232, 0.232, 180, pitchDeg, false, evalHeroHead, shadeHeroHead, 0, 'openBottom')),
  });

  const headLevel = bakeHeadTier(0);
  headLevel.front.dispose();
  headLevel.front = reg(custom.headFront);
  headLevel.frontSide.dispose();
  headLevel.frontSide = reg(custom.headFrontSide);
  headLevel.side.dispose();
  headLevel.side = reg(custom.headSide);
  headLevel.backSide.dispose();
  headLevel.backSide = reg(custom.headBackSide);
  headLevel.back.dispose();
  headLevel.back = reg(custom.headBack);
  const headMidHigh = bakeHeadTier(24);
  const headHigh = bakeHeadTier(48);
  const headMidLow = bakeHeadTier(-24);
  const headLow = bakeHeadTier(-48);

  const head: BillboardPartTextures<HeadTextures> = {
    textures: {
      ...headLevel,
      highFront: headHigh.front,
      highSide: headHigh.side,
      highBack: headHigh.back,
      top: reg(raymarchHeroPart(26, 26, 0.232, 0.232, 0, 88, true, evalHeroHead, shadeHeroHead, 0, 'full')),
      midHigh: headMidHigh,
      high: headHigh,
      midLow: headMidLow,
      low: headLow,
      bottom: reg(raymarchHeroPart(26, 26, 0.232, 0.232, 0, -88, true, evalHeroHead, shadeHeroHead, 0, 'full')),
    },
    meta: makeMeta(26, 26, 0.5, 0.22),
  };

  const torso: BillboardPartTextures<CoreTextures> = {
    textures: {
      front: reg(custom.torsoFront),
      frontSide: reg(raymarchHeroPart(26, 33, 0.232, 0.295, 45, 4, false, evalHeroTorso, shadeHeroTorso)),
      side: reg(raymarchHeroPart(26, 33, 0.232, 0.295, 90, 4, false, evalHeroTorso, shadeHeroTorso)),
      backSide: reg(raymarchHeroPart(26, 33, 0.232, 0.295, 135, 4, false, evalHeroTorso, shadeHeroTorso)),
      back: reg(raymarchHeroPart(26, 33, 0.232, 0.295, 180, 4, false, evalHeroTorso, shadeHeroTorso)),
      highFront: reg(raymarchHeroPart(26, 33, 0.232, 0.295, 0, 46, false, evalHeroTorso, shadeHeroTorso)),
      highSide: reg(raymarchHeroPart(26, 33, 0.232, 0.295, 90, 46, false, evalHeroTorso, shadeHeroTorso)),
      highBack: reg(raymarchHeroPart(26, 33, 0.232, 0.295, 180, 46, false, evalHeroTorso, shadeHeroTorso)),
      top: reg(raymarchHeroPart(26, 33, 0.232, 0.295, 0, 86, true, evalHeroTorso, shadeHeroTorso)),
    },
    meta: makeMeta(26, 33, 0.5, 0.46),
  };

  const pelvis: BillboardPartTextures<CoreTextures> = {
    textures: {
      front: reg(custom.pelvisFront),
      frontSide: reg(raymarchHeroPart(24, 15, 0.214, 0.134, 45, 4, false, evalHeroPelvis, shadeHeroPelvis)),
      side: reg(raymarchHeroPart(24, 15, 0.214, 0.134, 90, 4, false, evalHeroPelvis, shadeHeroPelvis)),
      backSide: reg(raymarchHeroPart(24, 15, 0.214, 0.134, 135, 4, false, evalHeroPelvis, shadeHeroPelvis)),
      back: reg(raymarchHeroPart(24, 15, 0.214, 0.134, 180, 4, false, evalHeroPelvis, shadeHeroPelvis)),
      highFront: reg(raymarchHeroPart(24, 15, 0.214, 0.134, 0, 46, false, evalHeroPelvis, shadeHeroPelvis)),
      highSide: reg(raymarchHeroPart(24, 15, 0.214, 0.134, 90, 46, false, evalHeroPelvis, shadeHeroPelvis)),
      highBack: reg(raymarchHeroPart(24, 15, 0.214, 0.134, 180, 46, false, evalHeroPelvis, shadeHeroPelvis)),
      top: reg(raymarchHeroPart(24, 15, 0.214, 0.134, 0, 86, true, evalHeroPelvis, shadeHeroPelvis)),
    },
    meta: makeMeta(24, 15, 0.5, 0.58),
  };

  const upperArm: BillboardPartTextures<THREE.CanvasTexture> = {
    textures: reg(custom.upperArm),
    meta: makeMeta(9, 22, 0.5, 0.5),
  };

  const forearm: BillboardPartTextures<THREE.CanvasTexture> = {
    textures: reg(custom.forearm),
    meta: makeMeta(8, 16, 0.5, 0.5),
  };

  const hand: BillboardPartTextures<THREE.CanvasTexture> = {
    textures: reg(custom.hand),
    meta: makeMeta(10, 9, 0.5, 0.6),
  };

  const thigh: BillboardPartTextures<THREE.CanvasTexture> = {
    textures: reg(custom.thigh),
    meta: makeMeta(13, 28, 0.5, 0.5),
  };

  const shin: BillboardPartTextures<ShinTextures> = {
    textures: {
      front: reg(custom.shinFront),
      frontSide: reg(raymarchHeroPart(20, 28, 0.178, 0.250, 45, 6, false, evalHeroShin, shadeHeroShin, -0.04, 'openTop')),
      side: reg(raymarchHeroPart(20, 28, 0.178, 0.250, 90, 6, false, evalHeroShin, shadeHeroShin, -0.20, 'openTop')),
      backSide: reg(raymarchHeroPart(20, 28, 0.178, 0.250, 135, 6, false, evalHeroShin, shadeHeroShin, -0.04, 'openTop')),
      back: reg(raymarchHeroPart(20, 28, 0.178, 0.250, 180, 6, false, evalHeroShin, shadeHeroShin, 0, 'openTop')),
      highFront: reg(raymarchHeroPart(20, 28, 0.178, 0.250, 0, 46, false, evalHeroShin, shadeHeroShin, 0, 'openTop')),
      highSide: reg(raymarchHeroPart(20, 28, 0.178, 0.250, 90, 46, false, evalHeroShin, shadeHeroShin, -0.12, 'openTop')),
      highBack: reg(raymarchHeroPart(20, 28, 0.178, 0.250, 180, 46, false, evalHeroShin, shadeHeroShin, 0, 'openTop')),
      top: reg(raymarchHeroPart(20, 28, 0.178, 0.250, 0, 86, true, evalHeroBootTop, shadeHeroShin, 0, 'full')),
    },
    meta: makeMeta(20, 28, 0.28, 0.5),
  };

  return {
    head,
    torso,
    pelvis,
    upperArm,
    forearm,
    hand,
    thigh,
    shin,
    allTextures,
  };
}

/** Disposes all GPU textures allocated by `createHeroSpriteSet()`. */
export function disposeHeroSpriteSet(set: HeroSpriteSet): void {
  for (const tex of set.allTextures) {
    tex.dispose();
  }
}
