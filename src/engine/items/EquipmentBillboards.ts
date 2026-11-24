import { HERO_PIXEL_SAMPLING, HERO_PIXEL_VERTEX } from '../character/HeroPixelShader';
import * as THREE from 'three';
import { HERO_PPU } from '../character/HeroBillboardSprites';
import type { ItemId } from './Items';

/**
 * Full 27-view multi-angle pixel-art billboards for the hero's equipped weapons
 * (`sword`/spear, `axe`, `pickaxe`, `bow`) and round wooden `shield`.
 *
 * Matches the hero head's exact 27-view directional coverage:
 *   - `top` (+88° pole, aligned to item +Z)
 *   - `high` (+50°): 8 horizontal directions (5 sprites + flipX)
 *   - `midHigh` (+25°): 8 horizontal directions (5 sprites + flipX)
 *   - `level` (0°): 8 horizontal directions (5 sprites + flipX)
 *   - `midLow` (-25°): 8 horizontal directions (5 sprites + flipX)
 *   - `low` (-50°): 8 horizontal directions (5 sprites + flipX)
 *   - `bottom` (-88° pole, aligned to item +Z)
 *
 * All 27 views per item are baked once at startup from 3D voxel sculpts at exact
 * `HERO_PPU = 48` scale with crisp 1px dark outlines and rendered through the
 * same viewport-locked integer pixel-grid shader as `SkeletalBillboard`.
 */

const FRAGMENT_SHADER = /* glsl */ `
${HERO_PIXEL_SAMPLING}
uniform vec3 uFlashColor;
uniform float uFlashAmount;

void main() {
  vec3 col = sampleHeroPixel();
  if (uFlashAmount > 0.001) {
    col = mix(col, uFlashColor * 1.4, uFlashAmount * 0.72);
  }

  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

const PALETTE: Record<string, [number, number, number]> = {
  k: [0x1c, 0x14, 0x18], // dark espresso outline
  b: [0x3b, 0x24, 0x19], // dark wood / plank seam
  B: [0x59, 0x37, 0x23], // shaded wood
  w: [0x7d, 0x4e, 0x2d], // mid wood
  W: [0xa6, 0x6d, 0x3c], // warm wood
  p: [0xc9, 0x8f, 0x52], // light wood
  P: [0xe6, 0xb8, 0x73], // sunlit wood highlight
  l: [0x47, 0x2c, 0x22], // dark leather
  L: [0x6e, 0x44, 0x2c], // mid leather
  t: [0xba, 0x88, 0x4b], // tan binding
  T: [0xdf, 0xae, 0x66], // light tan binding
  q: [0xf5, 0xcf, 0x84], // bright tan highlight
  y: [0x7a, 0x5c, 0x28], // shaded brass
  Y: [0xd4, 0xab, 0x4e], // bright brass
  d: [0x46, 0x50, 0x5e], // dark steel
  s: [0x6f, 0x7c, 0x8f], // mid steel
  S: [0x9a, 0xa8, 0xba], // light steel
  i: [0xcb, 0xd5, 0xe1], // bright steel edge
  I: [0xee, 0xf4, 0xfa], // gleaming steel highlight
  f: [0xd8, 0xd4, 0xc8], // bowstring / feather
  F: [0xf7, 0xf4, 0xeb], // bright bowstring / feather
};

interface Voxel {
  x: number;
  y: number;
  z: number;
  r: number;
  g: number;
  b: number;
  isOutline?: boolean;
}

interface EightWayTier {
  front: THREE.CanvasTexture;
  frontSide: THREE.CanvasTexture;
  side: THREE.CanvasTexture;
  backSide: THREE.CanvasTexture;
  back: THREE.CanvasTexture;
}

interface Item27ViewPack {
  top: THREE.CanvasTexture;
  steepHigh: EightWayTier;
  high: EightWayTier;
  midHigh: EightWayTier;
  level: EightWayTier;
  midLow: EightWayTier;
  low: EightWayTier;
  steepLow: EightWayTier;
  bottom: THREE.CanvasTexture;
  pixelWidth: number;
  pixelHeight: number;
  width: number;
  height: number;
  /** Offset along local +Y (meters) from anchor origin (grip) to 3D voxel center. */
  centerOffsetY: number;
  /** Offset along local +Z (meters) from anchor origin to 3D voxel center (e.g. shield face). */
  centerOffsetZ: number;
  glowColor: number;
}

/**
 * Converts a 2D pixel-art blueprint into centered 3D voxels (in pixel units).
 * - plane 'YZ': col -> +Z (cutting edge), -row -> +Y (shaft), thickness -> X
 * - plane 'XY': col -> +X, -row -> +Y, thickness -> Z
 */
function extrudeBlueprint(
  rows: string[],
  plane: 'YZ' | 'XY',
  centerCol: number,
  centerRow: number,
  thickness: number,
  zOffset = 0,
): Voxel[] {
  const out: Voxel[] = [];
  const halfT = (thickness - 1) * 0.5;
  for (let r = 0; r < rows.length; r++) {
    const line = rows[r];
    for (let c = 0; c < line.length; c++) {
      const ch = line[c];
      // Skip 2D 'k' outline chars in the 3D voxel volume so edge-on views show real steel/wood/leather
      // instead of a solid black rim; bakeVoxelView adds a crisp 1px dark outline from every camera angle.
      if (ch === '.' || ch === ' ' || ch === 'k') continue;
      const rgb = PALETTE[ch];
      if (!rgb) continue;
      const u = c - centerCol;
      const v = centerRow - r;
      for (let t = 0; t < thickness; t++) {
        const w = t - halfT;
        if (plane === 'YZ') {
          out.push({ x: w, y: v, z: u + zOffset, r: rgb[0], g: rgb[1], b: rgb[2] });
        } else {
          out.push({ x: u, y: v, z: w + zOffset, r: rgb[0], g: rgb[1], b: rgb[2] });
        }
      }
    }
  }
  return out;
}

/**
 * Orthographically rasterizes a 3D voxel model from `(yawDeg, pitchDeg)` into a
 * crisp `pixelWidth x pixelHeight` pixel-art CanvasTexture with Z-buffer,
 * subtle directional depth shading, and a clean 1px espresso silhouette outline.
 *
 * Orientation convention matches `SkeletalBillboard` & `HeroBillboardSprites`:
 *   - yaw = 0°: looking at +Z (front / cutting edge)
 *   - yaw = 90°: camera on -X so +Z faces SCREEN-RIGHT (`flipX = leftDot > 0`)
 *   - poles (top / bottom): sprite row 0 (+Y) points along +Z
 */
function bakeVoxelView(
  voxels: Voxel[],
  pw: number,
  ph: number,
  yawDeg: number,
  pitchDeg: number,
  isPole: boolean,
): THREE.CanvasTexture {
  const yaw = (yawDeg * Math.PI) / 180;
  const pitch = (pitchDeg * Math.PI) / 180;

  // Camera back axis (from model center toward camera)
  const cbX = -Math.sin(yaw) * Math.cos(pitch);
  const cbY = Math.sin(pitch);
  const cbZ = Math.cos(yaw) * Math.cos(pitch);

  let crX: number, crY: number, crZ: number;
  let cuX: number, cuY: number, cuZ: number;

  if (isPole) {
    // Align sprite +Y (row 0) with item +Z (forward / cutting edge)
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
    // Right = cross(worldUp(0,1,0), camBack)
    crX = cbZ;
    crY = 0;
    crZ = -cbX;
    const crl = Math.hypot(crX, crY, crZ) || 1;
    crX /= crl; crY /= crl; crZ /= crl;
    // Up = cross(camBack, camRight)
    cuX = cbY * crZ - cbZ * crY;
    cuY = cbZ * crX - cbX * crZ;
    cuZ = cbX * crY - cbY * crX;
  }

  const total = pw * ph;
  const zBuf = new Float32Array(total).fill(-1e9);
  const rgba = new Uint8ClampedArray(total * 4);
  const cx = (pw - 1) * 0.5;
  const cy = (ph - 1) * 0.5;

  // Sub-sample each 1x1x1 voxel at 2x2x2 corners so rotated views have zero pinhole gaps
  const sub = [-0.28, 0.28];
  for (let i = 0; i < voxels.length; i++) {
    const v = voxels[i];
    for (let sx = 0; sx < 2; sx++) {
      const vx = v.x + sub[sx];
      for (let sy = 0; sy < 2; sy++) {
        const vy = v.y + sub[sy];
        for (let sz = 0; sz < 2; sz++) {
          const vz = v.z + sub[sz];
          const depth = vx * cbX + vy * cbY + vz * cbZ;
          const u = vx * crX + vy * crY + vz * crZ;
          const w = vx * cuX + vy * cuY + vz * cuZ;
          const px = Math.round(cx + u);
          const py = Math.round(cy - w);
          if (px < 0 || px >= pw || py < 0 || py >= ph) continue;
          const idx = py * pw + px;
          if (depth > zBuf[idx]) {
            zBuf[idx] = depth;
            const o = idx * 4;
            rgba[o] = v.r;
            rgba[o + 1] = v.g;
            rgba[o + 2] = v.b;
            rgba[o + 3] = 255;
          }
        }
      }
    }
  }

  // Crisp 1px dark espresso outline around outer silhouette pixels that aren't already outlined
  const outCopy = new Uint8ClampedArray(rgba);
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (let y = 0; y < ph; y++) {
    for (let x = 0; x < pw; x++) {
      const idx = (y * pw + x) * 4;
      if (rgba[idx + 3] > 0) continue;
      let touchesInterior = false;
      for (let d = 0; d < 4; d++) {
        const nx = x + dirs[d][0];
        const ny = y + dirs[d][1];
        if (nx < 0 || nx >= pw || ny < 0 || ny >= ph) continue;
        const ni = (ny * pw + nx) * 4;
        if (rgba[ni + 3] > 0) {
          // Only add outer outline if neighbor isn't already dark outline color
          if (rgba[ni] > 42 || rgba[ni + 1] > 32 || rgba[ni + 2] > 36) {
            touchesInterior = true;
            break;
          }
        }
      }
      if (touchesInterior) {
        outCopy[idx] = 0x1c;
        outCopy[idx + 1] = 0x14;
        outCopy[idx + 2] = 0x18;
        outCopy[idx + 3] = 255;
      }
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = pw;
  canvas.height = ph;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const img = ctx.createImageData(pw, ph);
    img.data.set(outCopy);
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

function bake27Views(
  voxels: Voxel[],
  pw: number,
  ph: number,
  centerOffsetY: number,
  centerOffsetZ: number,
  glowColor: number,
  allTextures: THREE.CanvasTexture[],
): Item27ViewPack {
  const reg = (tex: THREE.CanvasTexture) => {
    allTextures.push(tex);
    return tex;
  };
  const bakeTier = (pitchDeg: number): EightWayTier => ({
    front: reg(bakeVoxelView(voxels, pw, ph, 0, pitchDeg, false)),
    frontSide: reg(bakeVoxelView(voxels, pw, ph, 45, pitchDeg, false)),
    side: reg(bakeVoxelView(voxels, pw, ph, 90, pitchDeg, false)),
    backSide: reg(bakeVoxelView(voxels, pw, ph, 135, pitchDeg, false)),
    back: reg(bakeVoxelView(voxels, pw, ph, 180, pitchDeg, false)),
  });

  return {
    top: reg(bakeVoxelView(voxels, pw, ph, 0, 88, true)),
    steepHigh: bakeTier(70),
    high: bakeTier(46),
    midHigh: bakeTier(22),
    level: bakeTier(0),
    midLow: bakeTier(-22),
    low: bakeTier(-46),
    steepLow: bakeTier(-70),
    bottom: reg(bakeVoxelView(voxels, pw, ph, 0, -88, true)),
    pixelWidth: pw,
    pixelHeight: ph,
    width: pw / HERO_PPU,
    height: ph / HERO_PPU,
    centerOffsetY,
    centerOffsetZ,
    glowColor,
  };
}

// ============================================================================
// 3D VOXEL BLUEPRINTS (same pixel-art designs, baked into 27 views each!)
// ============================================================================

const SPEAR_BLUEPRINT: string[] = [
  '...I...',
  '...I...',
  '..SI...',
  '..SI...',
  '..sSI..',
  '.dsSI..',
  '.dsSIi.',
  '.dsSIi.',
  '.dsSIi.',
  '.dsSIi.',
  '..sSI..',
  '..dsS..',
  '...ds..',
  '..tTq..',
  '..tTq..',
  '...L...',
  '...Wp..',
  '...Wp..',
  '...Wp..',
  '...Wp..',
  '...Wp..',
  '...Wp..',
  '...Wp..',
  '...Wp..',
  '...Wp..',
  '...Wp..',
  '...Wp..',
  '...Wp..',
  '...Wp..',
  '...Wp..',
  '...Wp..',
  '...Wp..',
  '...Wp..',
  '...Wp..',
  '...Wp..',
  '...Wp..',
  '...Wp..',
  '...Wp..',
  '...Wp..',
  '...Wp..',
  '..lTl..',
  '..Ltl..',
  '..lTl..',
  '..Ltl..',
  '..lTl..',
  '..Ltl..',
  '...Wp..',
  '...Wp..',
  '...Wp..',
  '...Wp..',
  '...Wp..',
  '...Wp..',
  '...Y...',
  '...d...',
];

const AXE_BLUEPRINT: string[] = [
  '....kk..........',
  '...kBpk.........',
  '...kBpk..kkk....',
  '...kBpk.kdSIk...',
  '..kkBpkksSSIik..',
  '..kdddkdsSSIik..',
  '..kdsdkdsSSIik..',
  '..kdsdkdsSSIik..',
  '..kdsdkdsSSIik..',
  '..kdsdkdsSSIik..',
  '..kdsdkdsSSIik..',
  '..kdddkdsSSIik..',
  '..kkBpkksSSIik..',
  '...kBpk.kdSIik..',
  '...kBpk..kdSIk..',
  '...kBpk...kkIk..',
  '...kBpk....kk...',
  '...kBpk.........',
  '...bWp..........',
  '...bWp..........',
  '...bWp..........',
  '...bWp..........',
  '...bWp..........',
  '...bWp..........',
  '...bWp..........',
  '...bWp..........',
  '...bWp..........',
  '...bWp..........',
  '...bWp..........',
  '...bWp..........',
  '...bWp..........',
  '...bWp..........',
  '...bWp..........',
  '...bWp..........',
  '...bWp..........',
  '...bWp..........',
  '..kLtlk.........',
  '..kTtlk.........',
  '..klLtk.........',
  '..kLtlk.........',
  '..kTtlk.........',
  '..klLtk.........',
  '...bWp..........',
  '...bWp..........',
  '...bWp..........',
  '...bWp..........',
  '...kBk..........',
  '....k...........',
];

const PICKAXE_BLUEPRINT: string[] = [
  '............kkk............',
  '.........kkkSSSkkk.........',
  '......kkkddSSSSSddkkk......',
  '....kkddSSSIkkISSSddkk.....',
  '...kdSSSIkdkBpkdkISSSdk....',
  '..kdSIkk..kkBpk..kkISdk....',
  '.kdIk......kBpk......kdk...',
  '.kIk.......kBpk.......kk...',
  '.kk........bWp.............',
  '...........bWp.............',
  '...........bWp.............',
  '...........bWp.............',
  '...........bWp.............',
  '...........bWp.............',
  '...........bWp.............',
  '...........bWp.............',
  '...........bWp.............',
  '...........bWp.............',
  '...........bWp.............',
  '...........bWp.............',
  '...........bWp.............',
  '...........bWp.............',
  '...........bWp.............',
  '...........bWp.............',
  '...........bWp.............',
  '...........bWp.............',
  '...........bWp.............',
  '...........bWp.............',
  '...........bWp.............',
  '...........bWp.............',
  '...........bWp.............',
  '...........bWp.............',
  '...........bWp.............',
  '...........bWp.............',
  '...........bWp.............',
  '...........bWp.............',
  '..........kLtlk............',
  '..........kTtlk............',
  '..........klLtk............',
  '..........kLtlk............',
  '..........kTtlk............',
  '..........klLtk............',
  '...........bWp.............',
  '...........bWp.............',
  '...........bWp.............',
  '...........bWp.............',
  '...........kBk.............',
  '............k..............',
];

function buildBowVoxels(): Voxel[] {
  const rows: string[] = [];
  const W = 15, H = 54, midY = (H - 1) * 0.5;
  for (let r = 0; r < H; r++) {
    const absT = Math.abs((r - midY) / midY);
    const woodX = 7 + (3.2 - 6.8 * absT * absT);
    const strX = 7 - 3.6;
    let line = '';
    for (let c = 0; c < W; c++) {
      const dWood = Math.abs(c - woodX);
      const dStr = Math.abs(c - strX);
      if (dWood < 0.75) line += absT < 0.14 ? (c > woodX ? 'T' : 'L') : c > woodX ? 'p' : 'W';
      else if (dWood < 1.45) line += 'k';
      else if (absT < 0.96 && dStr < 0.45) line += 'f';
      else line += '.';
    }
    rows.push(line);
  }
  return extrudeBlueprint(rows, 'YZ', 7, 26.5, 2);
}

function buildRoundShieldVoxels(): Voxel[] {
  const N = 24;
  const cx = (N - 1) * 0.5;
  const cy = (N - 1) * 0.5;
  const voxels: Voxel[] = [];

  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const dx = c - cx;
      const dy = r - cy;
      const dist = Math.hypot(dx, dy);
      if (dist > 11.4) continue;

      const x = dx;
      const y = -dy;

      // Front face (z = +1) — no baked 'k' rim so edge-on views show metallic/wood thickness + auto 1px outline
      let frontCh = 'W';
      if (dist > 9.1) {
        const ang = Math.atan2(dy, dx);
        const sector = Math.abs((((ang + Math.PI) / (Math.PI / 4)) % 1) - 0.5);
        frontCh = sector < 0.09 && dist > 9.4 && dist < 10.3 ? 'I' : dy < 0 && dx > -4 ? 'S' : 's';
      } else if (c === 6 || c === 11 || c === 17) {
        frontCh = 'b';
      } else {
        const light = dx * 0.055 - dy * 0.075 + ((r * 3 + c * 7) % 11 === 0 ? -0.18 : 0);
        if (light > 0.40) frontCh = 'P';
        else if (light > 0.14) frontCh = 'p';
        else if (light > -0.18) frontCh = 'W';
        else if (light > -0.46) frontCh = 'w';
        else frontCh = 'B';
      }
      const fc = PALETTE[frontCh];
      voxels.push({ x, y, z: 1, r: fc[0], g: fc[1], b: fc[2] });

      // Back face (z = 0): wooden planks + horizontal leather straps
      let backCh = (r + c) % 7 === 0 ? 'B' : 'w';
      if (dist > 9.1) backCh = 'b';
      else if (r === 8 || r === 9 || r === 14 || r === 15) backCh = r === 8 || r === 14 ? 'L' : 'l';
      else if (c === 6 || c === 12 || c === 17) backCh = 'b';
      const bc = PALETTE[backCh];
      voxels.push({ x, y, z: 0, r: bc[0], g: bc[1], b: bc[2] });

      // Central domed iron boss (z = +2, +3)
      if (dist <= 3.3) {
        let bossCh = 'S';
        if (dx > 0 && dy < 0) bossCh = 'I';
        else if (dx >= -0.5 && dy <= 0.5) bossCh = 'i';
        else if (dist > 2.2) bossCh = 'd';
        const m = PALETTE[bossCh];
        voxels.push({ x, y, z: 2, r: m[0], g: m[1], b: m[2] });
        if (dist <= 2.1) {
          voxels.push({ x, y, z: 3, r: m[0], g: m[1], b: m[2] });
        }
      }

      // Back leather handle (z = -1, -2)
      if (Math.abs(dx) <= 1.0 && Math.abs(dy) <= 3.2) {
        const hCol = PALETTE[Math.abs(dy) > 2.3 ? 'l' : 'L'];
        voxels.push({ x, y, z: -1, r: hCol[0], g: hCol[1], b: hCol[2] });
        if (Math.abs(dy) <= 2.4) {
          voxels.push({ x, y, z: -2, r: hCol[0], g: hCol[1], b: hCol[2] });
        }
      }
    }
  }
  return voxels;
}

// ============================================================================
// SLOT & RENDERER
// ============================================================================

interface GearSlot {
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
  depthMaterial: THREE.MeshDepthMaterial;
  mapUniform: { value: THREE.CanvasTexture };
  texelSizeUniform: { value: THREE.Vector2 };
  flashColorUniform: { value: THREE.Color };
  flashAmountUniform: { value: number };
}

export class EquipmentBillboards {
  readonly root = new THREE.Group();
  private readonly geometry = new THREE.PlaneGeometry(1, 1);
  private readonly weaponPacks = new Map<ItemId, Item27ViewPack>();
  private readonly shieldPack: Item27ViewPack;
  private readonly allTextures: THREE.CanvasTexture[] = [];

  private readonly weaponSlot: GearSlot;
  private readonly shieldSlot: GearSlot;

  // Scratch vectors (zero per-frame allocations)
  private readonly camPos = new THREE.Vector3();
  private readonly camBack = new THREE.Vector3();
  private readonly camUp = new THREE.Vector3();
  private readonly posA = new THREE.Vector3();
  private readonly mid = new THREE.Vector3();
  private readonly toCam = new THREE.Vector3();
  private readonly objX = new THREE.Vector3();
  private readonly objY = new THREE.Vector3();
  private readonly objZ = new THREE.Vector3();
  private readonly objScale = new THREE.Vector3();
  private readonly xAxis = new THREE.Vector3();
  private readonly yAxis = new THREE.Vector3();
  private readonly zAxis = new THREE.Vector3();
  private readonly proj = new THREE.Vector3();
  private readonly tmp = new THREE.Vector3();
  private readonly basisMat = new THREE.Matrix4();

  constructor(
    private readonly pixelSizeUniform: { value: number },
    private readonly bufferSizeUniform: { value: THREE.Vector2 },
    private readonly pixelOffsetUniform: { value: THREE.Vector2 },
  ) {
    this.root.name = 'HeroEquipmentBillboards';

    // Bake 27 views (7 pitch tiers x 8 horizontal directions) for each weapon & shield
    this.weaponPacks.set(
      'sword',
      bake27Views(
        extrudeBlueprint(SPEAR_BLUEPRINT, 'YZ', 3.5, 27, 1),
        18,
        58,
        (43 - 27) / HERO_PPU,
        0,
        0x6fd0ff,
        this.allTextures,
      ),
    );
    this.weaponPacks.set(
      'axe',
      bake27Views(
        extrudeBlueprint(AXE_BLUEPRINT, 'YZ', 4.5, 24, 2),
        28,
        52,
        (40 - 24) / HERO_PPU,
        0,
        0xffb050,
        this.allTextures,
      ),
    );
    this.weaponPacks.set(
      'pickaxe',
      bake27Views(
        extrudeBlueprint(PICKAXE_BLUEPRINT, 'YZ', 13, 24, 2),
        32,
        52,
        (40 - 24) / HERO_PPU,
        0,
        0x9fb8ff,
        this.allTextures,
      ),
    );
    this.weaponPacks.set(
      'bow',
      bake27Views(
        buildBowVoxels(),
        24,
        58,
        0,
        0,
        0xffe0a0,
        this.allTextures,
      ),
    );
    this.shieldPack = bake27Views(
      buildRoundShieldVoxels(),
      28,
      28,
      0,
      0.048,
      0x7ff6ff,
      this.allTextures,
    );

    const swordPack = this.weaponPacks.get('sword')!;
    this.weaponSlot = this.createSlot(swordPack.level.side, swordPack.pixelWidth, swordPack.pixelHeight, 'bb_weapon');
    this.shieldSlot = this.createSlot(this.shieldPack.level.front, this.shieldPack.pixelWidth, this.shieldPack.pixelHeight, 'bb_shield');
  }

  private createSlot(tex: THREE.CanvasTexture, pw: number, ph: number, name: string): GearSlot {
    const mapUniform = { value: tex };
    const texelSizeUniform = { value: new THREE.Vector2(1 / pw, 1 / ph) };
    const flashColorUniform = { value: new THREE.Color(0x6fd0ff) };
    const flashAmountUniform = { value: 0.0 };

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uMap: mapUniform,
        uTexelSize: texelSizeUniform,
        uPixelSize: this.pixelSizeUniform,
        uBufferSize: this.bufferSizeUniform,
        uPixelOffsetNdc: this.pixelOffsetUniform,
        uFlashColor: flashColorUniform,
        uFlashAmount: flashAmountUniform,
      },
      vertexShader: HERO_PIXEL_VERTEX,
      fragmentShader: FRAGMENT_SHADER,
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
    mesh.visible = false;
    this.root.add(mesh);
    return {
      mesh,
      material,
      depthMaterial,
      mapUniform,
      texelSizeUniform,
      flashColorUniform,
      flashAmountUniform,
    };
  }

  private setSlotTex(slot: GearSlot, tex: THREE.CanvasTexture, pw: number, ph: number) {
    if (slot.mapUniform.value !== tex) {
      slot.mapUniform.value = tex;
      const hadMap = !!slot.depthMaterial.map;
      slot.depthMaterial.map = tex;
      if (!hadMap) slot.depthMaterial.needsUpdate = true;
    }
    slot.texelSizeUniform.value.set(1 / pw, 1 / ph);
  }

  setVisible(visible: boolean) {
    this.root.visible = visible;
  }

  private update27ViewSlot(
    slot: GearSlot,
    pack: Item27ViewPack,
    anchor: THREE.Object3D,
    glow: number,
    depthBias: number,
  ) {
    anchor.updateMatrixWorld(true);
    const m = anchor.matrixWorld;
    anchor.getWorldPosition(this.posA);
    anchor.getWorldScale(this.objScale);

    this.objX.setFromMatrixColumn(m, 0).normalize();
    this.objY.setFromMatrixColumn(m, 1).normalize();
    this.objZ.setFromMatrixColumn(m, 2).normalize();

    const scaleX = Math.max(0.05, Math.abs(this.objScale.x));
    const scaleY = Math.max(0.05, Math.abs(this.objScale.y));

    this.mid
      .copy(this.posA)
      .addScaledVector(this.objY, pack.centerOffsetY * scaleY)
      .addScaledVector(this.objZ, pack.centerOffsetZ * scaleX);

    this.toCam.subVectors(this.camPos, this.mid);
    const dSq = this.toCam.lengthSq();
    if (dSq > 1e-6) this.toCam.multiplyScalar(1 / Math.sqrt(dSq));
    else this.toCam.copy(this.camBack);

    const upDot = this.toCam.dot(this.objY);
    const fwdDot = this.toCam.dot(this.objZ);
    const leftDot = this.toCam.dot(this.objX);
    const absAngle = Math.abs(Math.atan2(leftDot, fwdDot));

    let tex: THREE.CanvasTexture;
    let flipX = false;
    let tierPitchRad = 0;

    // 9 vertical pitch tiers: top (+88°) -> steepHigh (+70°) -> high (+46°) -> midHigh (+22°) ->
    // level (0°) -> midLow (-22°) -> low (-46°) -> steepLow (-70°) -> bottom (-88°)
    const poleThresh = 0.94;
    if (upDot > poleThresh || upDot < -poleThresh) {
      this.proj.copy(this.objZ).addScaledVector(this.camBack, -this.objZ.dot(this.camBack));
      if (this.proj.lengthSq() > 1e-4) this.yAxis.copy(this.proj).normalize();
      else this.yAxis.copy(this.camUp);
      tex = upDot > poleThresh ? pack.top : pack.bottom;
      tierPitchRad = (88 * Math.PI) / 180;
    } else {
      // Non-pole view: align sprite +Y with item +Y projected onto camera plane
      this.proj.copy(this.objY).addScaledVector(this.camBack, -this.objY.dot(this.camBack));
      if (this.proj.lengthSq() > 1e-4) this.yAxis.copy(this.proj).normalize();
      else this.yAxis.copy(this.camUp);

      let tier: EightWayTier;
      if (upDot > 0.80) { tier = pack.steepHigh; tierPitchRad = (70 * Math.PI) / 180; }
      else if (upDot > 0.54) { tier = pack.high; tierPitchRad = (46 * Math.PI) / 180; }
      else if (upDot > 0.20) { tier = pack.midHigh; tierPitchRad = (22 * Math.PI) / 180; }
      else if (upDot >= -0.20) { tier = pack.level; tierPitchRad = 0; }
      else if (upDot >= -0.54) { tier = pack.midLow; tierPitchRad = (22 * Math.PI) / 180; }
      else if (upDot >= -0.80) { tier = pack.low; tierPitchRad = (46 * Math.PI) / 180; }
      else { tier = pack.steepLow; tierPitchRad = (70 * Math.PI) / 180; }

      // Select 8-way horizontal direction
      if (absAngle < Math.PI * 0.15) {
        tex = tier.front;
      } else if (absAngle < Math.PI * 0.38) {
        tex = tier.frontSide;
        flipX = leftDot > 0;
      } else if (absAngle < Math.PI * 0.62) {
        tex = tier.side;
        flipX = leftDot > 0;
      } else if (absAngle < Math.PI * 0.85) {
        tex = tier.backSide;
        flipX = leftDot > 0;
      } else {
        tex = tier.back;
      }
    }

    this.zAxis.copy(this.camBack);
    this.xAxis.crossVectors(this.yAxis, this.zAxis).normalize();
    this.basisMat.makeBasis(this.xAxis, this.yAxis, this.zAxis);
    slot.mesh.quaternion.setFromRotationMatrix(this.basisMat);

    // Anchor the quad strictly in-plane from the grip (`this.posA`) using the exact foreshortened
    // grip offset (`centerOffsetY * cos(tierPitchRad)`) of the selected sprite, so the weapon grip
    // stays pixel-locked to the hero's hand at every pitch and camera angle (zero floating!).
    if (pack.centerOffsetY !== 0) {
      slot.mesh.position
        .copy(this.posA)
        .addScaledVector(this.yAxis, pack.centerOffsetY * scaleY * Math.cos(tierPitchRad))
        .addScaledVector(this.objZ, pack.centerOffsetZ * scaleX)
        .addScaledVector(this.camBack, depthBias);
    } else {
      slot.mesh.position.copy(this.mid).addScaledVector(this.camBack, depthBias);
    }

    this.setSlotTex(slot, tex, pack.pixelWidth, pack.pixelHeight);
    const w = pack.width * scaleX;
    const h = pack.height * scaleY;
    slot.mesh.scale.set(flipX ? -w : w, h, 1);
    slot.flashColorUniform.value.setHex(pack.glowColor);
    slot.flashAmountUniform.value = glow;

    slot.mesh.visible = true;
  }

  /**
   * Syncs both weapon and shield 37-view pixel-art billboards from the 3D
   * anchor roots positioned by `PlayerView`.
   */
  update(
    camera: THREE.Camera,
    mainId: ItemId | null,
    weaponAnchor: THREE.Object3D | undefined,
    weaponVisible: boolean,
    weaponGlow: number,
    weaponOnBack: boolean,
    shieldAnchor: THREE.Object3D,
    shieldVisible: boolean,
    shieldGlow: number,
    shieldOnBack: boolean,
    chestJoint?: THREE.Object3D,
  ) {
    if (!this.root.visible) return;

    camera.getWorldPosition(this.camPos);
    this.camUp.setFromMatrixColumn(camera.matrixWorld, 1).normalize();
    this.camBack.setFromMatrixColumn(camera.matrixWorld, 2).normalize();
    // Determine whether camera is viewing the hero from the front or back for sheathed gear depth sorting
    let frontFacing = 0;
    if (chestJoint) {
      chestJoint.getWorldPosition(this.tmp);
      this.toCam.subVectors(this.camPos, this.tmp).normalize();
      this.proj.setFromMatrixColumn(chestJoint.matrixWorld, 2).normalize();
      frontFacing = this.toCam.dot(this.proj);
    }

    const pack = mainId ? this.weaponPacks.get(mainId) : undefined;
    if (weaponVisible && weaponAnchor && pack) {
      const weaponBias = weaponOnBack ? (frontFacing > 0.05 ? -0.24 : 0.045) : 0.025;
      this.update27ViewSlot(this.weaponSlot, pack, weaponAnchor, weaponGlow, weaponBias);
    } else {
      this.weaponSlot.mesh.visible = false;
    }

    if (shieldVisible) {
      const shieldBias = shieldOnBack ? (frontFacing > 0.05 ? -0.28 : 0.055) : 0.028;
      this.update27ViewSlot(this.shieldSlot, this.shieldPack, shieldAnchor, shieldGlow, shieldBias);
    } else {
      this.shieldSlot.mesh.visible = false;
    }
  }

  dispose() {
    this.root.removeFromParent();
    this.geometry.dispose();
    for (const slot of [this.weaponSlot, this.shieldSlot]) {
      slot.material.dispose();
      slot.depthMaterial.dispose();
    }
    for (const tex of this.allTextures) tex.dispose();
  }
}
