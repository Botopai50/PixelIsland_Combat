import { build27Pack, sdCapsule, sdEllipsoid, type SdfEvaluator } from './Animals';
import { registerAnimalSpritePack } from './AnimalSpriteCache';

export const URSA_IDLE = ['idle0', 'idle1', 'idle2'] as const;
export const URSA_WALK = ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'] as const;
export const URSA_CHARGE = ['charge0', 'charge1', 'charge2', 'charge3', 'charge4', 'charge5'] as const;
export const URSA_SLAM = ['slam0', 'slam1', 'slam2', 'slam3'] as const;
export const URSA_ROOTS = ['roots0', 'roots1', 'roots2', 'roots3'] as const;
export type UrsaPose = typeof URSA_IDLE[number] | typeof URSA_WALK[number] | typeof URSA_CHARGE[number]
  | typeof URSA_SLAM[number] | typeof URSA_ROOTS[number];
export const URSA_PW = 65, URSA_PH = 65, URSA_SIZE = 5.65, URSA_CENTER = 1.63;

type Point = [number, number, number];
type Part = {
  min: Point;
  max: Point;
  sdf: (x: number, y: number, z: number) => number;
  mat: string;
};

const pigment = {
  fur: [[43, 29, 36], [84, 52, 49], [133, 83, 63]],
  face: [[72, 44, 44], [133, 80, 58], [192, 127, 81]],
  muzzle: [[109, 65, 48], [170, 112, 74], [221, 165, 112]],
  bark: [[80, 49, 42], [145, 92, 59], [221, 162, 109]],
  vine: [[52, 54, 32], [90, 94, 42], [155, 148, 67]],
  leaf: [[54, 55, 31], [104, 105, 47], [173, 159, 74]],
  thorn: [[129, 76, 56], [187, 127, 82], [240, 193, 139]],
  petal: [[80, 31, 51], [145, 55, 81], [209, 94, 117]],
  bud: [[121, 116, 44], [197, 184, 56], [248, 228, 114]],
} satisfies Record<string, [Point, Point, Point]>;
const palette: Record<string, Point> = {
  k: [25, 20, 26], mouth: [48, 20, 28], gum: [122, 48, 52], glow: [237, 253, 113],
};
for (const [material, shades] of Object.entries(pigment)) {
  shades.forEach((rgb, index) => { palette[material + index] = rgb; });
}

const packs = new Map<UrsaPose, ReturnType<typeof build27Pack>>();
const registeredPacks = new Map<UrsaPose, ReturnType<typeof build27Pack>>();
export function buildThornUrsaPosePack(pose: UrsaPose) {
  const cached = packs.get(pose);
  if (cached) return cached;

  const frame = Number(pose.at(-1));
  const walking = pose.startsWith('walk');
  const charging = pose.startsWith('charge');
  const slamming = pose.startsWith('slam');
  const roots = pose.startsWith('roots');
  const stride = walking ? frame * Math.PI / 3 : charging ? (frame - 2) * Math.PI * .65 : 0;
  const bob = walking ? Math.cos(stride * 2) * .04
    : charging ? [-.16, -.105, .05, -.055, .045, -.08][frame]
    : roots ? [-.045, .03, -.16, -.07][frame] : [0, .04, -.022, 0][frame];
  const rise = slamming ? [.17, .76, -.12, .04][frame] : 0;
  const gape = slamming ? [.12, .30, .11, .07][frame]
    : roots ? [.07, .19, .23, .14][frame] : charging ? [.07, .14, .15, .13, .15, .11][frame] : .10;
  const sin = Math.sin(rise), cos = Math.cos(rise);
  const parts: Part[] = [];

  const body = (p: Point): Point => {
    const y = p[1] + 1.20;
    const z = p[2] + .69;
    return [p[0], y * cos + z * sin - 1.20 + bob, z * cos - y * sin - .69];
  };

  function orb([cx, cy, cz]: Point, [rx, ry, rz]: Point, mat: string) {
    parts.push({
      min: [cx - rx, cy - ry, cz - rz], max: [cx + rx, cy + ry, cz + rz], mat,
      sdf: (x, y, z) => sdEllipsoid(x, y, z, cx, cy, cz, rx, ry, rz),
    });
  }

  function twig(a: Point, b: Point, ra: number, rb: number, mat: string) {
    const radius = Math.max(ra, rb);
    parts.push({
      min: [Math.min(a[0], b[0]) - radius, Math.min(a[1], b[1]) - radius, Math.min(a[2], b[2]) - radius],
      max: [Math.max(a[0], b[0]) + radius, Math.max(a[1], b[1]) + radius, Math.max(a[2], b[2]) + radius],
      mat, sdf: (x, y, z) => sdCapsule(x, y, z, ...a, ...b, ra, rb),
    });
  }

  function vine(points: Point[], radii: number[], mat: string) {
    for (let i = 1; i < points.length; i++) twig(points[i - 1], points[i], radii[i - 1], radii[i], mat);
  }

  function leaf(base: Point, tip: Point, width: number) {
    const a = body(base), b = body(tip);
    const middle: Point = [(a[0] + b[0]) * .5, (a[1] + b[1]) * .5 + .055, (a[2] + b[2]) * .5];
    twig(a, middle, .045, width, 'leaf');
    twig(middle, b, width, .010, 'leaf');
  }

  function flower(x: number, y: number, z: number, size: number) {
    const core = body([x, y + (roots && frame === 2 ? .065 : 0), z]);
    for (let i = 0; i < 5; i++) {
      const a = i * Math.PI * 2 / 5 + .62;
      const dx = Math.cos(a), dz = Math.sin(a);
      const lobe: Point = [core[0] + dx * size * .57, core[1] - size * (.08 + dz * .31), core[2] + dz * size * .56];
      twig(core, lobe, .045, size * .26, 'petal');
      twig(lobe, [core[0] + dx * size, core[1] - size * (.28 + dz * .43), core[2] + dz * size], size * .26, .014, 'petal');
    }
    orb(core, [size * .28, size * .21, size * .27], roots && frame >= 1 ? 'glow' : 'bud');
    for (const s of [-1, 1]) twig(core, [core[0] + s * size * .18, core[1] + size * .27, core[2] + size * .055], .022, .028, 'bud');
  }

  orb(body([0, -.40, -.68]), [.67, .69, .73], 'fur');
  orb(body([0, -.31, .02]), [.73, .75, .96], 'fur');
  orb(body([0, -.18, .60]), [.82, .85, .69], 'fur');
  orb(body([0, .21, .26]), [.68, .56, .70], 'fur');

  // Four planted paws, individual claws and curling vines around the forelegs.
  for (const side of [-1, 1]) for (const front of [false, true]) {
    const step = walking || (charging && frame >= 2 && frame <= 4) ? Math.sin(stride + (front === (side > 0) ? 0 : Math.PI)) : 0;
    const shoulder = body([side * (front ? .55 : .49), front ? -.16 : -.47, front ? .55 : -.69]);
    const reach = front && charging ? [.05, .12, .43, .22, .34, .08][frame] : 0;
    const rearUp = front && slamming ? Math.max(0, rise) : 0;
    const paw: Point = [side * (front ? .64 : .60) + side * rearUp * .31,
      -1.395 + Math.max(0, step) * (charging ? .26 : .16) + rearUp * 1.75,
      (front ? .77 : -.85) + step * (charging ? .45 : .26) + reach + rearUp * .36];
    const knee: Point = [side * .68, (paw[1] + shoulder[1]) * .53, paw[2] - (front ? .18 : -.13)];
    twig(shoulder, knee, front ? .36 : .32, .27, 'fur');
    twig(knee, paw, .26, front ? .22 : .20, 'fur');
    orb(paw, [front ? .26 : .23, .22, .33], 'fur');
    for (const toe of [-.15, -.049, .055, .153]) {
      const z = paw[2] + .23 - Math.abs(toe) * .29;
      twig([paw[0] + toe, paw[1] + .025, z], [paw[0] + toe * 1.1, paw[1] - .135, z + .19], .066, .012, 'thorn');
    }
    if (!front) continue;
    for (let wrap = 0; wrap < 2; wrap++) {
      const points: Point[] = Array.from({ length: 7 }, (_, i) => {
        const a = i * Math.PI / 3;
        return [paw[0] + Math.cos(a) * .262, paw[1] + .21 + wrap * .27 + i * .028, paw[2] + Math.sin(a) * .245 - .06];
      });
      vine(points, [.078, .075, .071, .069, .063, .059, .046], 'vine');
    }
    twig([paw[0] + side * .18, paw[1] + .42, paw[2] + .085],
      [paw[0] + side * .37, paw[1] + .67, paw[2] + .057], .12, .016, 'thorn');
  }

  // Broad muzzle, bioluminescent eyes and visible fangs in the roar poses.
  const hz = charging ? .19 : 0;
  orb(body([0, .09, .99 + hz]), [.535, .49, .48], 'face');
  orb(body([0, -.14, 1.28 + hz]), [.33, .20 + gape * .72, .40], 'mouth');
  orb(body([0, -.28 - gape * .6, 1.34 + hz]), [.30, .123, .35], 'muzzle');
  orb(body([0, -.052 + gape * .25, 1.46 + hz]), [.323, .156, .31], 'muzzle');
  orb(body([0, .009 + gape * .25, 1.725 + hz]), [.171, .099, .111], 'k');
  orb(body([0, -.239 - gape * .18, 1.57 + hz]), [.115, .043, .135], 'gum');
  for (const side of [-1, 1]) {
    orb(body([side * .37, .34, 1.04 + hz]), [.161, .174, .111], 'face');
    orb(body([side * .387, .355, 1.136 + hz]), [.095, .095, .046], 'fur');
    orb(body([side * .265, .171, 1.401 + hz]), [.088, .054, .052], 'glow');
    twig(body([side * .12, .17, 1.42 + hz]), body([side * .43, .29, 1.24 + hz]), .077, .056, 'bark');
    twig(body([side * .207, -.14, 1.56 + hz]), body([side * .17, -.30 - gape * .30, 1.62 + hz]), .054, .009, 'thorn');
    twig(body([side * .19, -.29 - gape * .48, 1.52 + hz]), body([side * .15, -.19 - gape * .30, 1.57 + hz]), .045, .008, 'thorn');
    twig(body([side * .39, .05, 1.16 + hz]), body([side * .65, -.19, .99 + hz]), .139, .031, 'face');

    const horn = [[side * .32, .37, 1.14], [side * .56, .59, 1.02], [side * .65, .94, .71],
      [side * .51, 1.28, .49], [side * .32, 1.50, .48]] as Point[];
    vine(horn.map(body), [.18, .152, .117, .082, .017], 'bark');
    twig(body(horn[2]), body([side * .77, 1.16, .79]), .101, .014, 'bark');
    twig(body(horn[1]), body([side * .67, .85, 1.09]), .09, .019, 'thorn');

    for (let i = 0; i < 4; i++) {
      const z = .45 - i * .40;
      leaf([side * .33, .63, z - .16], [side * (1.02 - i * .055), .13 - i * .022, z + .26], .15);
      leaf([side * .22, .64, z], [side * .61, .33, z + .42], .133);
    }
    vine(([ [side * .80, -.42, .28], [side * .81, -.14, -.05], [side * .73, .14, -.39],
      [side * .53, .53, -.56] ] as Point[]).map(body), [.043, .08, .079, .063], 'vine');
  }
  vine(([[0, -.22, -1.10], [.11, -.14, -1.52], [.16, .12, -1.77], [.08, .39, -1.81], [-.07, .47, -1.66]] as Point[]).map(body),
    [.156, .127, .089, .056, .014], 'vine');
  flower(-.56, 1.00, -.43, .62);
  flower(.53, .63, -.70, .39);
  flower(.41, .70, .23, .32);

  const evaluate: SdfEvaluator = (x, y, z) => {
    let d = Infinity;
    let mat = 'k';
    for (const part of parts) {
      const { min, max } = part;
      const bound = Math.max(min[0] - x, x - max[0], min[1] - y, y - max[1], min[2] - z, z - max[2]);
      if (bound > 0 && bound >= d) continue;
      const distance = part.sdf(x, y, z);
      if (distance < d) { d = distance; mat = part.mat; }
    }
    return { d, mat };
  };

  const extent = URSA_SIZE / 2;
  const pack = build27Pack(URSA_PW, URSA_PH, extent, extent, palette, evaluate, (mat, shade, x, y, z) => {
    if (!(mat in pigment)) return mat;
    const grain = Math.sin(Math.floor(x * 9 - y * 6) * 13 + Math.floor(z * 9 + y * 8) * 7);
    const light = shade + grain * .094;
    return mat + (light > .77 ? '2' : light > .39 ? '1' : '0');
  }, true);
  packs.set(pose, pack);
  return pack;
}

export function getThornUrsaPosePack(pose: UrsaPose) {
  const cached = registeredPacks.get(pose);
  if (cached) return cached;
  const pack = registerAnimalSpritePack({ ...buildThornUrsaPosePack(pose) }, {
    module: './ThornUrsaSprites.ts', factory: 'getThornUrsaPosePack', args: [pose], asymmetric: true,
  });
  registeredPacks.set(pose, pack);
  return pack;
}
