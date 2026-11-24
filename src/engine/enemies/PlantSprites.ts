import { build27Pack, sdCapsule, sdEllipsoid, smin, type ColorShaper, type SdfEvaluator } from './Animals';
import { registerAnimalSpritePack } from './AnimalSpriteCache';

export type PlantPose = 'idle0' | 'idle1' | 'idle2' | 'bite0' | 'bite1' | 'bite2' | 'bite3';
export const PLANT_PW = 62, PLANT_PH = 64, PLANT_W = 4.65, PLANT_H = 4.8;
export const PLANT_CENTER_Y = 1.55;

// Independent movement of the stalk and the hinged trap.
const poses: Record<PlantPose, { height: number; reach: number; opening: number }> = {
  idle0: { height: .36, reach: .06, opening: .32 },
  idle1: { height: .41, reach: .10, opening: .38 },
  idle2: { height: .30, reach: .01, opening: .27 },
  bite0: { height: .49, reach: -.14, opening: .52 },
  bite1: { height: .36, reach: .08, opening: .83 },
  bite2: { height: -.20, reach: .84, opening: .05 },
  bite3: { height: .13, reach: .35, opening: .27 },
};

const palette: Record<string, [number, number, number]> = {
  k: [26, 25, 29], leaf0: [34, 49, 36], leaf1: [66, 86, 45], leaf2: [115, 124, 51],
  leaf3: [170, 151, 54], leaf4: [207, 173, 63], vein: [168, 145, 58],
  jaw0: [69, 32, 47], jaw1: [122, 48, 48], jaw2: [172, 62, 44], jaw3: [214, 86, 48],
  jaw4: [235, 119, 62], flesh: [49, 23, 38], tongue: [118, 35, 43],
  gold0: [138, 77, 53], gold1: [195, 122, 65], gold2: [237, 168, 91], gold3: [255, 216, 146],
  soil0: [64, 47, 44], soil1: [113, 77, 57],
};

type LeafSpec = readonly [x: number, y: number, z: number, angle: number, length: number, width: number, rise: number];
const leaves: readonly LeafSpec[] = [
  [.02, -.82, .00, .28, .80, .20, .36],
  [-.04, -.85, .06, 1.36, .84, .23, .50],
  [.03, -.86, .03, 2.63, .79, .20, .38],
  [-.02, -.84, -.02, 3.56, .76, .22, .58],
  [.01, -.83, -.04, 4.48, .87, .25, .44],
  [.02, -.89, .10, 5.55, .68, .19, .31],
];

function makeLeaf([bx, by, bz, angle, length, width, rise]: LeafSpec) {
  const sin = Math.sin(angle);
  const cos = Math.cos(angle);
  return (x: number, y: number, z: number) => {
    const dx = x - bx;
    const dz = z - bz;
    const along = dx * sin + dz * cos;
    const across = dx * cos - dz * sin;
    const t = Math.max(0, Math.min(1, along / length));
    // A raised midrib and a drooping tip give each leaf a folded silhouette.
    const bladeY = by + rise * (2.9 * t - 2.5 * t * t) - Math.abs(across) * .36;
    const span = width * Math.max(.02, 1 - Math.abs((t - .46) / .54));
    const edge = Math.abs(across) - span;
    const ends = Math.max(-along, along - length);
    return Math.max(edge, ends, Math.abs(y - bladeY) - .027) * .68;
  };
}

const cache = new Map<PlantPose, ReturnType<typeof build27Pack>>();
function buildPlantPosePack(pose: PlantPose) {
  const cached = cache.get(pose);
  if (cached) return cached;
  const { height, reach, opening } = poses[pose];
  const upperCos = Math.cos(opening);
  const upperSin = Math.sin(opening);
  const lowerCos = Math.cos(-opening * .46);
  const lowerSin = Math.sin(-opening * .46);
  const toothOffsets = [-.40, -.29, -.16, 0, .16, .29, .40];
  const stemBend = -.36 + reach * .36;
  const leafShapes = [
    ...leaves.map(makeLeaf),
    makeLeaf([-.04, height - .09, reach - .05, 4.5, .48, .145, .18]),
    makeLeaf([.04, height - .11, reach - .08, 1.8, .43, .135, .16]),
    makeLeaf([0, -.38, stemBend, 5.2, .31, .09, .19]),
  ];

  const evaluate: SdfEvaluator = (x, y, z) => {
    const stemRoot = sdCapsule(x, y, z, 0, -.91, .15, 0, -.64, .04, .175, .145);
    const stemMiddle = sdCapsule(x, y, z, 0, -.64, .04, 0, -.24, stemBend, .145, .11);
    const stemNeck = sdCapsule(x, y, z, 0, -.24, stemBend, 0, height, reach, .11, .135);
    let d = smin(smin(stemRoot, stemMiddle, .12), stemNeck, .15);
    let mat = 'stem';
    const add = (distance: number, part: string) => {
      if (distance < d) { d = distance; mat = part; }
    };

    for (const shape of leafShapes) add(shape(x, y, z), 'leaf');
    add(sdEllipsoid(x, y, z, 0, -.94, .04, .34, .09, .29), 'soil');

    // Rotate each jaw around the same hinge, including its rim and teeth.
    const hy = y - height;
    const hz = z - reach;
    for (let jaw = 0; jaw < 2; jaw++) {
      const upper = jaw === 0;
      const cos = upper ? upperCos : lowerCos;
      const sin = upper ? upperSin : lowerSin;
      const jy = hy * cos - hz * sin;
      const jz = hy * sin + hz * cos;
      const side = upper ? 1 : -1;
      const breadth = upper ? .53 : .49;
      const outer = sdEllipsoid(x, jy, jz, 0, side * .12, .34, breadth, .23, .49);
      const hollow = sdEllipsoid(x, jy, jz, 0, -side * .12, .40, breadth - .05, .21, .43);
      const jawDistance = Math.max(outer, -hollow);
      const lip = Math.abs(jy - side * .01) < .070 && jz > .09;
      add(jawDistance, lip ? 'gold' : -hollow > outer ? 'flesh' : 'jaw');
      if (!upper) add(sdEllipsoid(x, jy, jz, 0, -.058, .48, .22, .067, .26), 'tongue');
      if (upper) {
        // The reference's red crown bracts end in pale, recurved tips.
        const ax = Math.abs(x);
        add(sdCapsule(ax, jy, jz, .22, .11, .03, .36, .33, -.13, .13, .103), 'jaw');
        add(sdCapsule(ax, jy, jz, .36, .33, -.13, .49, .40, -.31, .102, .012), 'gold');
        add(sdCapsule(x, jy, jz, 0, .18, .04, 0, .40, -.13, .13, .09), 'jaw');
        add(sdCapsule(x, jy, jz, 0, .40, -.13, 0, .45, -.37, .091, .012), 'gold');
      }
      if (jz > .47 && Math.abs(jy) < .25) {
        for (const tx of toothOffsets) {
          const tz = .80 - Math.abs(tx) * .55;
          const fangLength = .16 + .035 * Math.cos(tx * 20);
          add(sdCapsule(x, jy, jz, tx, side * .025, tz, tx * .89, -side * fangLength, tz - .060, .058, .009), 'gold');
        }
      }
    }
    return { d, mat };
  };

  const shade: ColorShaper = (mat, light, x, y, z) => {
    // Step the light in angular patches to suggest low-poly facets in pixel art.
    const facet = Math.floor(x * 9 + z * 4) + 2 * Math.floor(y * 9 - z * 5);
    const value = light + (Math.cos(facet * 2.39996) * .145);
    if (mat === 'jaw') {
      return value > .77 ? 'jaw4' : value > .60 ? 'jaw3' : value > .42 ? 'jaw2' : value > .23 ? 'jaw1' : 'jaw0';
    }
    if (mat === 'leaf') return value > .76 ? 'leaf4' : value > .60 ? 'leaf3' : value > .44 ? 'leaf2' : value > .28 ? 'leaf1' : 'leaf0';
    if (mat === 'stem') {
      const stripe = Math.cos(Math.atan2(x, z + .12) * 2 - y * 10);
      return stripe > .52 && light > .35 ? 'vein' : value > .54 ? 'leaf2' : value > .32 ? 'leaf1' : 'leaf0';
    }
    if (mat === 'gold') return value > .66 ? 'gold3' : value > .45 ? 'gold2' : value > .27 ? 'gold1' : 'gold0';
    if (mat === 'soil') return value > .48 ? 'soil1' : 'soil0';
    return mat;
  };

  const pack = build27Pack(PLANT_PW, PLANT_PH, 1.55, 1.6, palette, evaluate, shade);
  cache.set(pose, pack);
  return pack;
}

export function getPlantPosePack(pose: PlantPose) {
  const recipe = { module: './PlantSprites.ts', factory: 'getPlantPosePack', args: [pose] };
  return registerAnimalSpritePack(buildPlantPosePack(pose), recipe, buildPlantPosePack);
}
