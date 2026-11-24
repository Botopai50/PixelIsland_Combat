import { build27Pack, sdCapsule, sdEllipsoid, type CreatureViewPack } from '../enemies/Animals';

type Vec3 = [number, number, number];

interface Part {
  min: Vec3;
  max: Vec3;
  material: string;
  distance: (x: number, y: number, z: number) => number;
}

export const TRAVELER_IDLE = ["idle0", "idle1", "idle2"] as const;
export const TRAVELER_TALK = ["talk0", "talk1", "talk2"] as const;
export type TravelerPose = typeof TRAVELER_IDLE[number] | typeof TRAVELER_TALK[number];
export const TRAVELER_SIZE = 2.46;
export const TRAVELER_CENTER = 1.04;
export const TRAVELER_PX = 66;
export const TRAVELER_TALK_FPS = 2;
export const TRAVELER_IDLE_FPS = 2;
const colors: Record<string, Vec3[]> = {
  hair: [
    [30, 22, 25],
    [62, 41, 34],
    [106, 70, 44]
  ],
  beard: [
    [35, 25, 28],
    [67, 45, 37],
    [104, 71, 51]
  ],
  skin: [
    [150, 65, 40],
    [222, 126, 65],
    [255, 177, 103]
  ],
  scarf: [
    [142, 68, 13],
    [221, 129, 15],
    [255, 193, 33]
  ],
  linen: [
    [93, 74, 60],
    [168, 144, 103],
    [225, 202, 153]
  ],
  leather: [
    [77, 43, 29],
    [125, 73, 43],
    [169, 109, 63]
  ],
  boot: [
    [43, 29, 28],
    [94, 52, 29],
    [144, 84, 40]
  ],
  teal: [
    [23, 41, 43],
    [42, 76, 74],
    [70, 111, 95]
  ],
  roll: [
    [25, 55, 54],
    [50, 91, 78],
    [102, 140, 105]
  ],
  metal: [
    [57, 53, 54],
    [120, 118, 106],
    [204, 201, 178]
  ],
  rust: [
    [78, 46, 38],
    [144, 80, 49],
    [182, 110, 61]
  ],
  rope: [
    [103, 72, 43],
    [177, 132, 68],
    [239, 202, 121]
  ]
};
const palette: Record<string, Vec3> = {
  k: [24, 20, 24],
  eyes: [255, 232, 198],
  pupil: [29, 21, 24]
};
for (const [name, shades] of Object.entries(colors)) shades.forEach((color, i) => {
  palette[name + i] = color;
});
const rawPacks = new Map<TravelerPose, CreatureViewPack>();
export function buildTravelerPosePack(pose: TravelerPose) {
  const cached = rawPacks.get(pose);
  if (cached) return cached;
  const frame = Number(pose.at(-1));
  const talking = pose.startsWith("talk");
  const breathe = [0, .018, -.009][frame];
  const tilt = talking ? [.015, -.035, .022][frame] : 0;
  const gesture = talking ? [.045, .3, .14][frame] : 0;
  const parts: Part[] = [];
  function ellipsoid(center: Vec3, radii: Vec3, material: string) {
    const [cx, cy, cz] = center;
    const [rx, ry, rz] = radii;
    parts.push({
      min: [cx - rx, cy - ry, cz - rz],
      max: [cx + rx, cy + ry, cz + rz],
      material,
      distance: (x, y, z) => sdEllipsoid(x, y, z, cx, cy, cz, rx, ry, rz)
    });
  }
  function limb(a: Vec3, b: Vec3, ra: number, rb: number, material: string) {
    const r = Math.max(ra, rb);
    parts.push({
      min: [
        Math.min(a[0], b[0]) - r,
        Math.min(a[1], b[1]) - r,
        Math.min(a[2], b[2]) - r
      ],
      max: [
        Math.max(a[0], b[0]) + r,
        Math.max(a[1], b[1]) + r,
        Math.max(a[2], b[2]) + r
      ],
      material,
      distance: (x, y, z) => sdCapsule(x, y, z, ...a, ...b, ra, rb)
    });
  }
  function panel(center: Vec3, size: Vec3, material: string, angle = 0, bevel = .022) {
    const [cx, cy, cz] = center;
    const [hx, hy, hz] = size;
    const c = Math.cos(angle), s = Math.sin(angle);
    const dx = Math.abs(c) * hx + Math.abs(s) * hy + bevel;
    const dy = Math.abs(s) * hx + Math.abs(c) * hy + bevel;
    parts.push({
      min: [cx - dx, cy - dy, cz - hz - bevel],
      max: [cx + dx, cy + dy, cz + hz + bevel],
      material,
      distance: (x, y, z) => {
        x -= cx;
        y -= cy;
        z -= cz;
        const u = Math.abs(x * c + y * s) - hx;
        const v = Math.abs(y * c - x * s) - hy;
        const w = Math.abs(z) - hz;
        const bevelCorner = bevel * .32;
        return Math.max(u, v, w, (u + v) * .707 + bevelCorner, (u + w) * .707 + bevelCorner, (v + w) * .707 + bevelCorner) - bevel;
      }
    });
  }
  for (const side of [-1, 1]) {
    const x = side * .18;
    const z = side * .095;
    limb([side * .13, -.19, 0], [x, -.51, z], .134, .113, "teal");
    limb([x, -.51, z], [side * .2, -.78, z - .014], .109, .077, "teal");
    panel([x, -.611, z + .1], [.075, .048, .02], "linen", side * .22);
    panel([side * .201, -.81, z + .013], [.092, .093, .101], "boot", side * .04);
    panel([side * .201, -.844, z + .114], [.092, .025, .017], "leather");
    panel([side * .226, -.843, z + .139], [.028, .022, .01], "metal", .15);
    panel([side * .204, -.93, z + .033], [.09, .077, .102], "boot", side * .1);
    panel([side * .21, -.969, z + .174], [.087, .041, .06], "boot", side * .035, .026);
    panel([side * .205, -.922, z + .11], [.09, .018, .018], "leather", side * .13);
    panel([side * .207, -1.009, z + .089], [.104, .017, .158], "hair", 0, .012);
  }
  const chest = .28 + breathe;
  ellipsoid([0, .106 + breathe, 0], [.276, .305, .175], "linen");
  panel([0, -.048 + breathe, .055], [.193, .174, .143], "linen", .06, .034);
  panel([.063, -.257, .166], [.145, .156, .045], "linen", .22);
  panel([-.113, -.197, .184], [.045, .098, .041], "scarf", -.16);
  panel([0, -.133, .069], [.229, .032, .157], "leather", .035);
  panel([.012, -.13, .258], [.048, .037, .013], "metal", .04, .012);
  panel([.012, -.131, .278], [.023, .014, .013], "hair", .04, .008);
  limb([-.2, chest + .045, .177], [.166, -.119, .245], .04, .03, "leather");
  limb([.212, chest + .09, .128], [.157, -.123, .17], .036, .027, "leather");
  panel([.192, .235 + breathe, .183], [.041, .028, .009], "metal", -.24, .01);
  panel([.209, -.191, .132], [.062, .085, .065], "leather", .18);
  panel([.218, -.167, .204], [.05, .019, .009], "boot", .18);
  panel([-.067, .178 + breathe, -.241], [.223, .278, .127], "leather", -.08, .043);
  panel([-.105, .282 + breathe, -.383], [.182, .129, .019], "boot", -.1, .026);
  panel([-.104, .086 + breathe, -.382], [.134, .06, .019], "boot", -.08, .025);
  for (const x of [-.213, .031]) {
    panel([x, .238 + breathe, -.426], [.02, .168, .011], "leather", -.1, .009);
    panel([x - .004, .15 + breathe, -.453], [.028, .031, .01], "metal", -.1, .008);
    panel([x - .004, .151 + breathe, -.467], [.014, .017, .01], "hair", -.1, .004);
  }
  const rollY = .481 + breathe;
  limb([-.31, rollY, -.3], [.131, rollY + .043, -.3], .097, .099, "roll");
  for (const x of [-.233, .056]) {
    panel([x, rollY + .015, -.298], [.018, .101, .09], "leather", -.07, .015);
    panel([x, rollY + .017, -.197], [.022, .021, .009], "metal", -.07, .005);
  }
  ellipsoid([-.402, rollY, -.3], [.019, .049, .05], "teal");
  panel([-.299, .004, -.293], [.06, .096, .072], "roll", -.14, .03);
  ellipsoid([-.326, .205 + breathe, -.324], [.039, .136, .127], "metal");
  ellipsoid([-.363, .209 + breathe, -.324], [.021, .101, .098], "hair");
  limb([-.257, chest, .007], [-.308, .101 + breathe, .025], .103, .085, "linen");
  limb([-.307, .09 + breathe, .04], [-.382, -.103, .085], .078, .054, "skin");
  limb([-.379, -.102, .086], [-.424, -.185, .112], .06, .05, "leather");
  ellipsoid([-.436, -.203, .125], [.057, .076, .048], "skin");
  const leftWrist: Vec3 = [.381 - gesture * .19, -.081 + gesture, .085 + gesture * .77];
  limb([.244, chest + .02, 0], [.32, .128, .033], .105, .096, "linen");
  panel([.265, chest + .041, .104], [.103, .086, .045], "metal", .39, .039);
  panel([.295, chest - .016, .148], [.07, .023, .018], "rust", .39, .015);
  ellipsoid([.219, chest + .043, .157], [.021, .022, .017], "metal");
  limb([.32, .107, .038], leftWrist, .078, .051, "skin");
  limb([
    leftWrist[0],
    leftWrist[1] + .04,
    leftWrist[2] - .01
  ], leftWrist, .06, .062, "leather");
  ellipsoid([
    leftWrist[0],
    leftWrist[1] - .045,
    leftWrist[2] + .018
  ], [.054, .058, .044], "skin");
  limb([-.387, -.114, .097], [-.752, -.805, .227], .034, .036, "leather");
  limb([-.503, -.362, .149], [-.583, -.525, .176], .048, .043, "rope");
  panel([-.725, -.69, .206], [.085, .124, .041], "rust", -.44, .02);
  panel([-.79, -.705, .231], [.065, .137, .039], "metal", -.43, .022);
  panel([-.789, -.72, .275], [.022, .086, .008], "rust", -.43, .009);
  panel([-.854, -.764, .253], [.022, .095, .026], "metal", -.48, .016);
  const scarfY = .36 + breathe;
  limb([-.214, scarfY + .023, .04], [.208, scarfY + .045, .043], .084, .07, "scarf");
  limb([-.177, scarfY + .029, .115], [.185, scarfY - .101, .162], .061, .069, "scarf");
  limb([.202, scarfY + .043, .13], [-.141, scarfY - .098, .17], .064, .041, "scarf");
  panel([.122, scarfY - .19, .212], [.048, .118, .025], "scarf", -.26 - tilt);
  panel([.065, scarfY - .242, .226], [.02, .068, .018], "scarf", -.36 - tilt);
  const headY = .605 + breathe;
  const hx = tilt;
  limb([0, .349 + breathe, .021], [hx, headY - .089, .025], .073, .084, "skin");
  ellipsoid([hx, headY, .047], [.137, .166, .116], "skin");
  ellipsoid([hx, headY - .088, .112], [.128, .089, .099], "beard");
  panel([hx, headY - .1, .18], [.064, .043, .028], "beard", -.11, .02);
  ellipsoid([hx, headY - .023, .189], [.039, .044, .045], "skin");
  for (const side of [-1, 1]) {
    ellipsoid([hx + side * .135, headY - .009, .049], [.032, .051, .036], "skin");
    limb([hx + side * .106, headY + .016, .109], [hx + side * .114, headY - .065, .118], .036, .032, "beard");
    panel([hx + side * .059, headY + .029, .152], [.021, .012, .013], "eyes", side * .05, .009);
    panel([hx + side * .058 + .006, headY + .029, .19], [.011, .013, .008], "pupil", 0, .004);
    panel([hx + side * .054, headY + .069, .151], [.036, .01, .013], "hair", side * .2, .009);
  }
  if (talking && frame === 1) panel([hx, headY - .075, .211], [.042, .012, .01], "pupil", -.06, .007);
  ellipsoid([hx, headY + .104, .007], [.162, .13, .139], "hair");
  ellipsoid([hx, headY + .021, -.065], [.143, .113, .093], "hair");
  for (const [x, y, z, ex, ey, ez] of [
    [-.096, .079, .074, -.183, .103, .098],
    [-.109, .142, .054, -.186, .194, .08],
    [-.067, .178, .035, -.108, .257, .046],
    [0, .182, .036, .039, .265, .062],
    [.083, .155, .046, .147, .221, .05],
    [.113, .1, .069, .179, .113, .101],
    [-.047, .121, .094, -.017, .092, .144],
    [.069, .126, .086, .115, .081, .135]
  ]) limb([hx + x, headY + y, z], [hx + ex, headY + ey, ez], .055, .009, "hair");
  const evaluate = (x: number, y: number, z: number) => {
    let d = Infinity;
    let mat = "k";
    for (const part of parts) {
      const { min, max } = part;
      const bound = Math.max(min[0] - x, x - max[0], min[1] - y, y - max[1], min[2] - z, z - max[2]);
      if (bound > 0 && bound >= d) continue;
      const distance = part.distance(x, y, z);
      if (distance < d) {
        d = distance;
        mat = part.material;
      }
    }
    return {
      d,
      mat
    };
  };
  const extent = TRAVELER_SIZE / 2;
  const pack = build27Pack(TRAVELER_PX, TRAVELER_PX, extent, extent, palette, evaluate, (mat, shade, x, y, z) => {
    if (mat === "eyes" || mat === "pupil" || mat === "k") return mat;
    const patch = Math.floor(x * 16 + z * 7) + 3 * Math.floor(y * 20 - z * 5);
    const grain = Math.sin(patch * 3.1);
    const light = shade + grain * .105;
    if (mat === "metal" && grain > .91 && y > -.8 && z > 0) return light > .68 ? "rust2" : "rust1";
    if (mat === "linen" && grain > .87 && y < -.22 && y > -.44 && z > .14) return "scarf0";
    return mat + (light > .8 ? "2" : light > .44 ? "1" : "0");
  }, true);
  rawPacks.set(pose, pack);
  return pack;
}
