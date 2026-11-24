import { build27Pack, sdCapsule, sdEllipsoid, type SdfEvaluator } from './Animals';
import { registerAnimalSpritePack } from './AnimalSpriteCache';

export const MAW_IDLE = ['idle0', 'idle1', 'idle2'] as const;
export const MAW_WALK = ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'] as const;
export const MAW_BITE = ['bite0', 'bite1', 'bite2', 'bite3'] as const;
export const MAW_SWEEP = ['sweep0', 'sweep1', 'sweep2', 'sweep3'] as const;
export const MAW_ROOTS = ['roots0', 'roots1', 'roots2', 'roots3'] as const;
export type MawPose = typeof MAW_IDLE[number] | typeof MAW_WALK[number]
  | typeof MAW_BITE[number] | typeof MAW_SWEEP[number] | typeof MAW_ROOTS[number];
export const MAW_PW = 64, MAW_PH = 64, MAW_SIZE = 5.4, MAW_CENTER = 1.66;

type Point = [number, number, number];
type Shape = { a: Point; b: Point; ra: number; rb: number; mat: string; min: Point; max: Point };
const palette: Record<string, [number, number, number]> = {
  k: [30, 25, 31], bark0: [59, 36, 40], bark1: [113, 52, 44], bark2: [181, 74, 48], bark3: [223, 111, 63],
  gold0: [168, 105, 59], gold1: [231, 164, 91], gold2: [255, 220, 145],
  leaf0: [52, 60, 35], leaf1: [111, 115, 44], leaf2: [189, 173, 59],
  core0: [229, 102, 24], core1: [255, 174, 34], core2: [255, 230, 107], throat: [43, 23, 32],
};

const cache = new Map<MawPose, ReturnType<typeof build27Pack>>();
function buildMawPack(pose: MawPose) {
  const cached = cache.get(pose);
  if (cached) return cached;
  const frame = Number(pose.at(-1));
  const walk = pose.startsWith('walk');
  const bite = pose.startsWith('bite');
  const sweep = pose.startsWith('sweep');
  const roots = pose.startsWith('roots');
  const bob = walk ? Math.cos(frame * Math.PI * 2 / 3) * .035
    : roots ? [-.05, .19, -.19, -.06][frame] : [0, .025, -.018][frame] ?? 0;
  const reach = bite ? [0, -.08, .22, .07][frame] : 0;
  const gape = bite ? [.16, .29, .05, .11][frame] : .14;
  const headX = sweep ? [-.14, -.44, .52, .20][frame] : 0;
  const headY = -.12 + bob + (sweep ? -.17 : 0);
  const headZ = .57 + reach;
  const shapes: Shape[] = [];
  const branch = (a: Point, b: Point, ra: number, rb: number, mat: string) => {
    const r = Math.max(ra, rb);
    const min: Point = [Math.min(a[0], b[0]) - r, Math.min(a[1], b[1]) - r, Math.min(a[2], b[2]) - r];
    const max: Point = [Math.max(a[0], b[0]) + r, Math.max(a[1], b[1]) + r, Math.max(a[2], b[2]) + r];
    shapes.push({ a, b, ra, rb, mat, min, max });
  };

  for (const side of [-1, 1]) for (const fore of [-1, 1]) {
    const step = walk ? Math.sin(frame * Math.PI / 3 + (side === fore ? 0 : Math.PI)) : 0;
    const knee: Point = [side * (.85 + Math.abs(bob) * 1.1), -.21 + bob, fore * .42 + step * .13];
    const ankle: Point = [side * 1.07, -.59 + Math.max(0, step) * .12, fore * .60 + step * .20];
    const foot: Point = [side * 1.05, -.94 + Math.max(0, step) * .20, fore * .65 + step * .25];
    branch([side * .25, -.35 + bob, fore * .29], knee, .135, .12, 'vine');
    branch(knee, ankle, .19, .11, 'bark');
    branch([side * .98, ankle[1] + .11, ankle[2] - fore * .05], ankle, .13, .112, 'gold');
    branch(ankle, foot, .11, .014, 'bark');
    branch([side * 1.065, foot[1] + .17, foot[2]], foot, .063, .013, 'gold');
  }

  for (let i = 0; i < 7; i++) {
    const angle = i * Math.PI * 2 / 7;
    const radial = (r: number, y: number): Point => [Math.sin(angle) * r, y + bob, Math.cos(angle) * r - .16];
    branch(radial(.15, .20), radial(.46, .38), .16, .15, 'bark');
    branch(radial(.46, .38), radial(.44, .79 - .11 * Math.cos(angle)), .15, .026, 'bark');
    branch(radial(.49, .44), radial(.45, .79 - .11 * Math.cos(angle)), .047, .019, 'gold');
    branch(radial(.28, .04), radial(.65, .00 + .09 * Math.sin(angle)), .125, .013, 'vine');
  }

  // Three hooked tendrils grow around the blossom.
  for (const [x, y, z, side] of [[-.40, .25, -.26, -1], [.41, .37, -.30, 1], [-.13, .58, -.51, -1]]) {
    const points: Point[] = [[x, y + bob, z]];
    for (let i = 0; i <= 4; i++) {
      const t = i / 4;
      const theta = t * Math.PI * 1.47;
      points.push([x + side * (.16 + .23 * Math.sin(theta)), y + bob + .04 + .29 * (1 - Math.cos(theta)), z - t * .09]);
    }
    for (let i = 1; i < points.length; i++) branch(points[i - 1], points[i], .069 - i * .008, .061 - i * .008, 'vine');
  }

  for (const side of [-1, 1]) for (const x of [-.25, -.09, .09, .25]) {
    const z = headZ + .30 - Math.abs(x) * .45;
    branch([headX + x, headY + side * gape, z], [headX + x * .90, headY + side * (gape - .105), z - .03], .062, .012, 'gold');
  }

  const evaluate: SdfEvaluator = (x, y, z) => {
    let d = sdEllipsoid(x, y, z, 0, -.22 + bob, -.12, .49, .41, .55);
    let mat = 'bark';
    const add = (distance: number, material: string) => {
      if (distance < d) { d = distance; mat = material; }
    };
    add(sdEllipsoid(x, y, z, 0, .48 + bob, -.15, .30, .44, .32), 'core');
    add(sdEllipsoid(x, y, z, headX, headY, headZ - .09, .37, .27, .28), 'throat');
    for (const side of [-1, 1]) {
      const jawY = headY + side * (gape + .065);
      add(sdEllipsoid(x, y, z, headX, jawY, headZ, .39, .148, .33), 'bark');
      add(sdEllipsoid(x, y, z, headX, jawY - side * .08, headZ + .027, .37, .065, .322), 'gold');
    }
    for (const { a, b, ra, rb, mat, min, max } of shapes) {
      const bound = Math.max(min[0] - x, x - max[0], min[1] - y, y - max[1], min[2] - z, z - max[2]);
      if (bound >= d && bound > 0) continue;
      add(sdCapsule(x, y, z, a[0], a[1], a[2], b[0], b[1], b[2], ra, rb), mat);
    }
    return { d, mat };
  };
  const pack = build27Pack(MAW_PW, MAW_PH, 1.56, 1.56, palette, evaluate, (mat, light, x, y, z) => {
    const patch = Math.floor(x * 10 + z * 3) + 2 * Math.floor(y * 10 - z * 4);
    const l = light + Math.cos(patch * 2.4) * .11;
    if (mat === 'core') return l > .57 ? 'core2' : l > .3 ? 'core1' : 'core0';
    if (mat === 'gold') return l > .62 ? 'gold2' : l > .37 ? 'gold1' : 'gold0';
    if (mat === 'vine') return l > .68 ? 'leaf2' : l > .40 ? 'leaf1' : 'leaf0';
    if (mat === 'bark') return l > .72 ? 'bark3' : l > .51 ? 'bark2' : l > .28 ? 'bark1' : 'bark0';
    return mat;
  });
  cache.set(pose, pack);
  return pack;
}

export function getBrambleMawPosePack(pose: MawPose) {
  return registerAnimalSpritePack(buildMawPack(pose), {
    module: './BrambleMawSprites.ts', factory: 'getBrambleMawPosePack', args: [pose],
  }, buildMawPack);
}
