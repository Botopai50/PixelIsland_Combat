import * as THREE from 'three';

/**
 * Modelos procedurais das armas em pixel art 3D (voxels extrudados a 48 PPU,
 * mesma densidade de pixel do herói para zero mixels).
 *
 * Convenção de eixos de TODAS as armas corpo a corpo:
 *   origem = empunhadura, +Y = em direção à ponta, +Z = gume/cabeça (sentido do corte).
 * Escudo: frente = +Z, alça na origem.
 * Arco: empunhadura na origem, arco no plano YZ, flecha dispara em +Z.
 */
export interface WeaponModel {
  root: THREE.Group;
  /** Brilho de carga (0..1). */
  setGlow(v: number): void;
  /** Só para o arco: tensão da corda (0..1) e flecha encaixada visível. */
  setDraw?(v: number, nocked: boolean): void;
  kind: string;
}

/** Mesma densidade de pixels do herói (48 texels/m -> 1 pixel = 0.02083m). */
const WEAPON_PPU = 48;
const PX = 1 / WEAPON_PPU;

/** Paleta pixel-art harmonizada com o herói (madeira quente, couro, latão, aço). */
const WEAPON_PALETTE: Record<string, string> = {
  // Contorno / sombra profunda
  k: '#1c1418',
  // Madeira (haste, escudo, arco)
  b: '#3b2419',
  B: '#593723',
  w: '#7d4e2d',
  W: '#a66d3c',
  p: '#c98f52',
  P: '#e6b873',
  // Couro & amarração bege
  l: '#472c22',
  L: '#6e442c',
  t: '#ba884b',
  T: '#dfae66',
  q: '#f5cf84',
  // Latão / ouro
  y: '#7a5c28',
  Y: '#d4ab4e',
  // Aço / ferro
  d: '#46505e',
  s: '#6f7c8f',
  S: '#9aa8ba',
  i: '#cbd5e1',
  I: '#eef4fa',
  // Pena / corda
  f: '#d8d4c8',
  F: '#f7f4eb',
};

interface VoxelBuildOpts {
  plane: 'YZ' | 'XY';
  originCol: number;
  originRow: number;
  thicknessPx?: number;
  offsetX?: number;
  offsetY?: number;
  offsetZ?: number;
  pixelSize?: number;
}

/**
 * Constrói uma única `BufferGeometry` voxelizada (com faces internas removidas)
 * a partir de uma matriz 2D de pixel art, com cores por vértice nítidas e
 * sombreamento sutil nas paredes laterais.
 */
function buildPixelVoxelGeometry(rows: string[], opts: VoxelBuildOpts): THREE.BufferGeometry {
  const h = rows.length;
  const w = rows[0]?.length ?? 0;
  const s = opts.pixelSize ?? PX;
  const thick = (opts.thicknessPx ?? 1) * s;
  const halfT = thick * 0.5;
  const ox = opts.offsetX ?? 0;
  const oy = opts.offsetY ?? 0;
  const oz = opts.offsetZ ?? 0;

  const isSolid = (r: number, c: number) => {
    if (r < 0 || r >= h || c < 0 || c >= w) return false;
    const ch = rows[r][c];
    return ch !== '.' && ch !== ' ' && ch in WEAPON_PALETTE;
  };

  const positions: number[] = [];
  const normals: number[] = [];
  const colors: number[] = [];
  const tmpColor = new THREE.Color();

  const pushQuad = (
    p0: [number, number, number],
    p1: [number, number, number],
    p2: [number, number, number],
    p3: [number, number, number],
    n: [number, number, number],
    cr: number,
    cg: number,
    cb: number,
  ) => {
    positions.push(...p0, ...p1, ...p2, ...p0, ...p2, ...p3);
    for (let i = 0; i < 6; i++) {
      normals.push(n[0], n[1], n[2]);
      colors.push(cr, cg, cb);
    }
  };

  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      if (!isSolid(r, c)) continue;
      tmpColor.setStyle(WEAPON_PALETTE[rows[r][c]]);
      const cr = tmpColor.r;
      const cg = tmpColor.g;
      const cb = tmpColor.b;
      const sideMul = 0.82;

      // Coordenadas locais do pixel no plano 2D (u = coluna, v = linha invertida para +Y)
      const u0 = (c - opts.originCol) * s;
      const u1 = u0 + s;
      const v1 = (opts.originRow - r) * s;
      const v0 = v1 - s;

      if (opts.plane === 'YZ') {
        // u -> +Z, v -> +Y, espessura em X
        const x0 = ox - halfT;
        const x1 = ox + halfT;
        const y0 = oy + v0;
        const y1 = oy + v1;
        const z0 = oz + u0;
        const z1 = oz + u1;

        // +X face
        pushQuad([x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [1, 0, 0], cr, cg, cb);
        // -X face
        pushQuad([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [-1, 0, 0], cr, cg, cb);

        // +Y (acima = r - 1)
        if (!isSolid(r - 1, c)) {
          pushQuad([x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0], [0, 1, 0], cr * 1.04, cg * 1.04, cb * 1.04);
        }
        // -Y (abaixo = r + 1)
        if (!isSolid(r + 1, c)) {
          pushQuad([x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [0, -1, 0], cr * sideMul, cg * sideMul, cb * sideMul);
        }
        // +Z (direita = c + 1)
        if (!isSolid(r, c + 1)) {
          pushQuad([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [0, 0, 1], cr * sideMul, cg * sideMul, cb * sideMul);
        }
        // -Z (esquerda = c - 1)
        if (!isSolid(r, c - 1)) {
          pushQuad([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [0, 0, -1], cr * sideMul, cg * sideMul, cb * sideMul);
        }
      } else {
        // XY plane: u -> +X, v -> +Y, espessura em Z
        const x0 = ox + u0;
        const x1 = ox + u1;
        const y0 = oy + v0;
        const y1 = oy + v1;
        const z0 = oz - halfT;
        const z1 = oz + halfT;

        // +Z face (frente)
        pushQuad([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [0, 0, 1], cr, cg, cb);
        // -Z face (costas)
        pushQuad([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [0, 0, -1], cr * 0.9, cg * 0.9, cb * 0.9);

        // +Y
        if (!isSolid(r - 1, c)) {
          pushQuad([x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0], [0, 1, 0], cr * 1.04, cg * 1.04, cb * 1.04);
        }
        // -Y
        if (!isSolid(r + 1, c)) {
          pushQuad([x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [0, -1, 0], cr * sideMul, cg * sideMul, cb * sideMul);
        }
        // +X
        if (!isSolid(r, c + 1)) {
          pushQuad([x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [1, 0, 0], cr * sideMul, cg * sideMul, cb * sideMul);
        }
        // -X
        if (!isSolid(r, c - 1)) {
          pushQuad([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [-1, 0, 0], cr * sideMul, cg * sideMul, cb * sideMul);
        }
      }
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  return geo;
}

function makePixelMat(glowColor: number) {
  const mat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.78,
    metalness: 0.12,
    flatShading: true,
    emissive: new THREE.Color(glowColor),
    emissiveIntensity: 0,
  });
  return mat;
}

function makePixelMesh(rows: string[], opts: VoxelBuildOpts, mat: THREE.Material) {
  const m = new THREE.Mesh(buildPixelVoxelGeometry(rows, opts), mat);
  m.castShadow = true;
  m.receiveShadow = false;
  return m;
}

// ============================================================================
// ESPADA / LANÇA DA REF (7 x 54 em YZ, esguia e afiada, empunhadura em row 43)
// Haste fina de madeira com amarração de couro/bege e ponta de lança afiada
// ============================================================================
const SPEAR_SWORD_ROWS: string[] = [
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

export function createSword(): WeaponModel {
  const g = new THREE.Group();
  const mat = makePixelMat(0x6fd0ff);
  g.add(
    makePixelMesh(
      SPEAR_SWORD_ROWS,
      { plane: 'YZ', originCol: 3.5, originRow: 43, thicknessPx: 0.8 },
      mat,
    ),
  );
  return {
    root: g,
    setGlow: (v: number) => {
      mat.emissiveIntensity = v * 1.4;
    },
    kind: 'sword',
  };
}

// ============================================================================
// MACHADO PIXEL ART (16 x 48 em YZ, empunhadura em row 40, col 4)
// ============================================================================
const AXE_ROWS: string[] = [
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

export function createAxe(): WeaponModel {
  const g = new THREE.Group();
  const mat = makePixelMat(0xffb050);
  g.add(
    makePixelMesh(
      AXE_ROWS,
      { plane: 'YZ', originCol: 4.5, originRow: 40, thicknessPx: 1.35 },
      mat,
    ),
  );
  return {
    root: g,
    setGlow: (v: number) => {
      mat.emissiveIntensity = v * 1.4;
    },
    kind: 'axe',
  };
}

// ============================================================================
// PICARETA PIXEL ART (27 x 48 em YZ, empunhadura em row 40, col 13)
// ============================================================================
const PICKAXE_ROWS: string[] = [
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

export function createPickaxe(): WeaponModel {
  const g = new THREE.Group();
  const mat = makePixelMat(0x9fb8ff);
  g.add(
    makePixelMesh(
      PICKAXE_ROWS,
      { plane: 'YZ', originCol: 13, originRow: 40, thicknessPx: 1.35 },
      mat,
    ),
  );
  return {
    root: g,
    setGlow: (v: number) => {
      mat.emissiveIntensity = v * 1.4;
    },
    kind: 'pickaxe',
  };
}

// ============================================================================
// CLAVA PIXEL ART (11 x 45 em YZ, usada por inimigos)
// ============================================================================
const CLUB_ROWS: string[] = [
  '....kkk....',
  '...kBWWk...',
  '..kBWWpWk..',
  '.kIBWWpWIk.',
  '..kBWWpWk..',
  '..kBWWpWk..',
  '..kBWWpWk..',
  '.kIBWWpWk..',
  '..kBWWpWIk.',
  '..kBWWpWk..',
  '..kBWWpWk..',
  '..kBWWpWk..',
  '.kIBWWpWk..',
  '..kBWWpWk..',
  '...kBWpk...',
  '...kBWpIk..',
  '...kBWpk...',
  '...kBWpk...',
  '...kBWpk...',
  '...kBWpk...',
  '...kBWpk...',
  '....kWk....',
  '....bWp....',
  '....bWp....',
  '....bWp....',
  '....bWp....',
  '....bWp....',
  '....bWp....',
  '....bWp....',
  '....bWp....',
  '....bWp....',
  '....bWp....',
  '....bWp....',
  '....bWp....',
  '....bWp....',
  '....bWp....',
  '...kLtlk...',
  '...kTtlk...',
  '...klLtk...',
  '...kLtlk...',
  '...kTtlk...',
  '....bWp....',
  '....bWp....',
  '....kBk....',
  '.....k.....',
];

export function createClub(): WeaponModel {
  const g = new THREE.Group();
  const mat = makePixelMat(0xff4040);
  g.add(
    makePixelMesh(
      CLUB_ROWS,
      { plane: 'YZ', originCol: 5.5, originRow: 38, thicknessPx: 2.2 },
      mat,
    ),
  );
  return {
    root: g,
    setGlow: (v: number) => {
      mat.emissiveIntensity = v * 1.4;
    },
    kind: 'club',
  };
}

// ============================================================================
// ESCUDO DE MADEIRA REDONDO PIXEL ART (24 x 24 em XY -> 0.50m de diâmetro)
// Aro de ferro rebitado + tábuas verticais de madeira quente + umbo central
// ============================================================================
function buildRoundWoodShieldRows(isBack: boolean): string[] {
  const N = 24;
  const cx = (N - 1) * 0.5;
  const cy = (N - 1) * 0.5;
  const rows: string[] = [];

  for (let r = 0; r < N; r++) {
    let line = '';
    for (let c = 0; c < N; c++) {
      const dx = c - cx;
      const dy = r - cy;
      const dist = Math.hypot(dx, dy);

      if (dist > 11.7) {
        line += '.';
        continue;
      }
      // Contorno escuro externo
      if (dist > 10.65) {
        line += 'k';
        continue;
      }
      // Aro externo de ferro / madeira escura com rebites
      if (dist > 9.35) {
        if (isBack) {
          line += 'b';
        } else {
          const ang = Math.atan2(dy, dx);
          // 8 rebites claros distribuídos no aro
          const sector = Math.abs((((ang + Math.PI) / (Math.PI / 4)) % 1) - 0.5);
          if (sector < 0.08 && dist > 9.7 && dist < 10.35) {
            line += 'i';
          } else {
            line += dy < 0 && dx > -4 ? 'S' : 's';
          }
        }
        continue;
      }

      if (isBack) {
        // Costas: tábuas horizontais + 2 tiras horizontais de couro
        if (r === 8 || r === 9 || r === 14 || r === 15) {
          line += r === 8 || r === 14 ? 'L' : 'l';
        } else if (c === 6 || c === 12 || c === 17) {
          line += 'b';
        } else {
          line += (r + c) % 7 === 0 ? 'B' : 'w';
        }
        continue;
      }

      // Frente: tábuas verticais de madeira quente com juntas e veio
      if (c === 6 || c === 11 || c === 12 || c === 17) {
        // Junta entre tábuas (1px escuro, centralizada em 11/12)
        if (c === 6 || c === 11 || c === 17) {
          line += 'b';
          continue;
        }
      }
      // Iluminação superior-direita nas tábuas de madeira
      const light = dx * 0.055 - dy * 0.075;
      const grain = ((r * 3 + c * 7) % 11 === 0) ? -0.18 : 0;
      const v = light + grain;
      if (v > 0.42) line += 'P';
      else if (v > 0.14) line += 'p';
      else if (v > -0.18) line += 'W';
      else if (v > -0.48) line += 'w';
      else line += 'B';
    }
    rows.push(line);
  }
  return rows;
}

const SHIELD_BOSS_ROWS: string[] = [
  '..kkkk..',
  '.kSIIsk.',
  'kSIIiSsk',
  'kSIiSSdk',
  'kSiSSddk',
  'kSSsdddk',
  '.ksdddk.',
  '..kkkk..',
];

const SHIELD_HANDLE_ROWS: string[] = [
  'kk',
  'lL',
  'lL',
  'lL',
  'lL',
  'lL',
  'lL',
  'kk',
];

/**
 * Lado de dentro do escudo redondo de madeira (tábuas + tiras de couro),
 * usado no viewmodel de 1ª pessoa.
 */
export function createShieldBacking(): THREE.Group {
  const g = new THREE.Group();
  const mat = makePixelMat(0x000000);
  const backRows = buildRoundWoodShieldRows(true);
  g.add(
    makePixelMesh(
      backRows,
      { plane: 'XY', originCol: 12, originRow: 12, thicknessPx: 0.7, offsetZ: 0.015 },
      mat,
    ),
  );
  return g;
}

/** Escudo redondo de madeira em pixel art: frente = +Z, alça na origem. */
export function createShield(): WeaponModel {
  const g = new THREE.Group();
  const mat = makePixelMat(0x7ff6ff);
  const faceRows = buildRoundWoodShieldRows(false);

  // Corpo redondo de tábuas de madeira + aro de ferro
  const body = makePixelMesh(
    faceRows,
    { plane: 'XY', originCol: 12, originRow: 12, thicknessPx: 1.6, offsetZ: 0.048 },
    mat,
  );
  // Umbo metálico central em relevo (+Z)
  const boss = makePixelMesh(
    SHIELD_BOSS_ROWS,
    { plane: 'XY', originCol: 4, originRow: 4, thicknessPx: 1.2, offsetZ: 0.072 },
    mat,
  );
  // Alça de couro atrás (-Z / origem)
  const handle = makePixelMesh(
    SHIELD_HANDLE_ROWS,
    { plane: 'XY', originCol: 1, originRow: 4, thicknessPx: 1.5, offsetZ: 0.012 },
    mat,
  );

  g.add(body, boss, handle);
  return {
    root: g,
    setGlow: (v: number) => {
      mat.emissiveIntensity = v * 1.4;
    },
    kind: 'shield',
  };
}

// ============================================================================
// ARCO E FLECHA PIXEL ART
// ============================================================================
/** Quanto a corda recua na puxada completa (m). Usado pelo modelo e pelas mãos (IK). */
export const BOW_DRAW_LEN = 0.45;

const BOW_UPPER_ROWS: string[] = [
  'kk..........',
  'kpk.........',
  '.kWpk.......',
  '..kWpk......',
  '...kWpk.....',
  '....kWpk....',
  '.....kWpk...',
  '......kWpk..',
  '.......kWpk.',
  '.......kWpk.',
  '........kWpk',
  '........kWpk',
  '.........bWp',
  '.........bWp',
  '.........bWp',
  '.........bWp',
  '.........bWp',
  '.........bWp',
  '.........bWp',
  '.........bWp',
  '.........bWp',
  '.........bWp',
  '.........bWp',
  '.........bWp',
  '........kLtl',
  '........kTtl',
  '........klLt',
];

const BOW_LOWER_ROWS: string[] = [...BOW_UPPER_ROWS].reverse();

export function createBow(): WeaponModel {
  const g = new THREE.Group();
  const mat = makePixelMat(0xffe0a0);

  // Haste superior (+Y) e inferior (-Y) em pixel art (flexionam na puxada)
  const upper = makePixelMesh(
    BOW_UPPER_ROWS,
    { plane: 'YZ', originCol: 10, originRow: 27, thicknessPx: 1.3 },
    mat,
  );
  const lower = makePixelMesh(
    BOW_LOWER_ROWS,
    { plane: 'YZ', originCol: 10, originRow: 0, thicknessPx: 1.3 },
    mat,
  );
  g.add(upper, lower);

  const topTip = new THREE.Vector3(0, 26 * PX, -9 * PX);
  const botTip = new THREE.Vector3(0, -26 * PX, -9 * PX);
  const sMat = new THREE.MeshBasicMaterial({ color: 0xf7f4eb });
  const s1 = new THREE.Mesh(new THREE.BoxGeometry(0.009, 1, 0.009), sMat);
  const s2 = new THREE.Mesh(new THREE.BoxGeometry(0.009, 1, 0.009), sMat);
  g.add(s1, s2);

  const arrow = createArrowMesh();
  g.add(arrow);

  const mid = new THREE.Vector3();
  const placeString = (s: THREE.Mesh, a: THREE.Vector3, b: THREE.Vector3) => {
    s.position.copy(a).add(b).multiplyScalar(0.5);
    const d = new THREE.Vector3().subVectors(b, a);
    s.scale.set(1, d.length(), 1);
    s.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  };

  const setDraw = (v: number, nocked: boolean) => {
    mid.set(0, 0, -9 * PX - v * BOW_DRAW_LEN);
    placeString(s1, topTip, mid);
    placeString(s2, mid, botTip);
    upper.scale.set(1, 1 - v * 0.08, 1 + v * 0.25);
    lower.scale.set(1, 1 - v * 0.08, 1 + v * 0.25);
    arrow.visible = nocked;
    arrow.position.set(0.02, 0, mid.z + 0.78);
  };
  setDraw(0, false);

  return {
    root: g,
    setGlow: (v: number) => {
      mat.emissiveIntensity = v * 1.4;
    },
    setDraw,
    kind: 'bow',
  };
}

// Flecha pixel art (38 x 5 em YZ, ponta em +Z = 0, haste indo para -Z)
const ARROW_ROWS: string[] = [
  '.kFFk............................kk...',
  '..kFFk..........................kSIk..',
  'kbbWWWWWWWWWWWWWWWWWWWWWWWWWWWWkdSIIk.',
  '..kFFk..........................kSIk..',
  '.kFFk............................kk...',
];

/** Flecha em pixel art com origem na PONTA e haste para -Z (facilita cravar em superfícies). */
export function createArrowMesh(): THREE.Group {
  const g = new THREE.Group();
  const mat = makePixelMat(0x000000);
  g.add(
    makePixelMesh(
      ARROW_ROWS,
      { plane: 'YZ', originCol: 37, originRow: 2.5, thicknessPx: 0.75 },
      mat,
    ),
  );
  return g;
}

export function createWeaponModel(id: string): WeaponModel {
  switch (id) {
    case 'sword': return createSword();
    case 'axe': return createAxe();
    case 'pickaxe': return createPickaxe();
    case 'bow': return createBow();
    case 'club': return createClub();
    case 'shield': return createShield();
    default: return createSword();
  }
}
