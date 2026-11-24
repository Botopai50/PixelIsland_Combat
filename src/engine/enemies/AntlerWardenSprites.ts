import { build27Pack, sdCapsule, sdEllipsoid, type SdfEvaluator } from './Animals';
import { registerAnimalSpritePack } from './AnimalSpriteCache';

export const WARDEN_IDLE = ['idle0', 'idle1', 'idle2'] as const;
export const WARDEN_WALK = ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'] as const;
export const WARDEN_SWEEP = ['sweep0', 'sweep1', 'sweep2', 'sweep3'] as const;
export const WARDEN_STOMP = ['stomp0', 'stomp1', 'stomp2', 'stomp3'] as const;
export const WARDEN_STONES = ['stones0', 'stones1', 'stones2', 'stones3'] as const;
export type WardenPose = typeof WARDEN_IDLE[number] | typeof WARDEN_WALK[number]
  | typeof WARDEN_SWEEP[number] | typeof WARDEN_STOMP[number] | typeof WARDEN_STONES[number];

export const WARDEN_PW = 65, WARDEN_PH = 65;
export const WARDEN_SIZE = 9.5, WARDEN_CENTER = 3.46;
const SIZE = WARDEN_SIZE * .25;

type Point = [number, number, number];
type Shape = { min: Point; max: Point; material: string; distance: (x: number, y: number, z: number) => number };

const tones = {
  bark: [[52, 42, 44], [91, 70, 64], [139, 108, 86]],
  splinter: [[84, 65, 60], [142, 108, 85], [192, 155, 112]],
  rock: [[49, 43, 49], [78, 67, 68], [122, 99, 87]],
  horn: [[67, 48, 41], [124, 86, 56], [187, 134, 83]],
  bone: [[127, 100, 79], [207, 174, 126], [249, 226, 169]],
  leaf: [[48, 51, 38], [83, 88, 49], [142, 140, 75]],
  moss: [[57, 57, 43], [93, 95, 56], [150, 140, 79]],
  cloth: [[75, 37, 41], [129, 55, 51], [182, 81, 63]],
} satisfies Record<string, [Point, Point, Point]>;
const palette: Record<string, Point> = {
  k: [30, 25, 31], eye: [235, 198, 89], cavity: [28, 24, 29],
};
for (const [name, shades] of Object.entries(tones)) {
  shades.forEach((rgb, i) => { palette[name + i] = rgb; });
}

const raw = new Map<WardenPose, ReturnType<typeof build27Pack>>();
const registered = new Map<WardenPose, ReturnType<typeof build27Pack>>();

export function buildAntlerWardenPosePack(pose: WardenPose) {
  const cached = raw.get(pose);
  if (cached) return cached;
  const frame = Number(pose.at(-1));
  const walking = pose.startsWith('walk');
  const sweep = pose.startsWith('sweep');
  const stomp = pose.startsWith('stomp');
  const stones = pose.startsWith('stones');
  const stride = walking ? frame * Math.PI / 3 : 0;
  const bodyY = walking ? Math.cos(stride * 2) * .026
    : sweep ? [0, -.11, -.23, -.11][frame]
    : stomp ? [-.05, .17, -.26, -.08][frame]
    : stones ? [-.06, .10, .01, -.07][frame] : [0, .023, -.02][frame];
  const lean = sweep ? [-.075, -.22, .30, .13][frame] : stones ? [0, -.085, .035, 0][frame] : 0;
  const lurch = sweep ? [.02, .04, .32, .13][frame] : stomp ? [0, -.08, .19, .07][frame] : 0;
  const jaw = stomp || stones ? [.025, .135, .11, .05][frame] : sweep ? [.025, .08, .13, .05][frame] : .032;
  const shapes: Shape[] = [];
  const torso = ([x, y, z]: Point): Point => [x + lean * (y + .25), y + bodyY, z + lurch * (y + .55)];

  function oval([cx, cy, cz]: Point, [rx, ry, rz]: Point, material: string) {
    shapes.push({
      min: [cx - rx, cy - ry, cz - rz], max: [cx + rx, cy + ry, cz + rz], material,
      distance: (x, y, z) => sdEllipsoid(x, y, z, cx, cy, cz, rx, ry, rz),
    });
  }

  function branch(a: Point, b: Point, ra: number, rb: number, material: string) {
    const r = Math.max(ra, rb);
    shapes.push({
      min: [Math.min(a[0], b[0]) - r, Math.min(a[1], b[1]) - r, Math.min(a[2], b[2]) - r],
      max: [Math.max(a[0], b[0]) + r, Math.max(a[1], b[1]) + r, Math.max(a[2], b[2]) + r],
      material, distance: (x, y, z) => sdCapsule(x, y, z, ...a, ...b, ra, rb),
    });
  }

  function blade(a: Point, tip: Point, width: number, material: string) {
    const mid: Point = [a[0] * .61 + tip[0] * .39, a[1] * .61 + tip[1] * .39, a[2] * .61 + tip[2] * .39];
    branch(a, mid, width * .54, width, material);
    branch(mid, tip, width, .015, material);
  }

  // Torso estreito na cintura, com placas e costelas de casca.
  oval(torso([0, -.41, -.08]), [.37, .29, .29], 'rock');
  branch(torso([0, -.29, -.10]), torso([0, .44, -.12]), .26, .44, 'bark');
  oval(torso([0, .46, -.08]), [.54, .34, .36], 'bark');
  oval(torso([0, .66, -.20]), [.33, .32, .30], 'rock');
  for (const side of [-1, 1]) {
    for (let rib = 0; rib < 3; rib++) {
      const y = .52 - rib * .18;
      blade(torso([side * (.49 - rib * .073), y + .075, .11]),
        torso([side * .055, y - .155, .245 - rib * .028]), .095 - rib * .012, 'splinter');
    }
  }
  blade(torso([0, .49, .13]), torso([0, -.30, .19]), .106, 'rock');

  // Pernas arqueadas e pés de raiz. O apoio acompanha as passadas.
  for (const side of [-1, 1]) {
    const s = walking ? Math.sin(stride + (side < 0 ? 0 : Math.PI)) : 0;
    const knee: Point = [side * (.42 + (stomp && frame === 2 ? .14 : 0)), -.93 + .06 * s, .16 + s * .13];
    const foot: Point = [side * .53, -1.585 + Math.max(0, s) * .22, -.03 + s * .34];
    branch(torso([side * .216, -.43, -.07]), knee, .235, .188, 'bark');
    branch(knee, foot, .188, .122, 'rock');
    blade([knee[0] + side * .025, knee[1] + .08, knee[2] + .13],
      [foot[0], foot[1] + .19, foot[2] + .10], .122, 'splinter');
    oval([foot[0], foot[1] + .028, foot[2] + .052], [.159, .116, .217], 'moss');
    for (const toe of [-.105, 0, .108]) {
      branch([foot[0] + toe, foot[1] - .007, foot[2] + .08],
        [foot[0] + toe * 1.25, foot[1] - .097, foot[2] + .302], .064, .025, 'splinter');
    }
    blade(torso([side * .245, -.40, .03]),
      [side * .52, -.93 + s * .05, .06 + s * .09], .13, 'leaf');
  }

  // Faixa rubra e tecido rasgado em dois painéis.
  branch(torso([-.345, -.42, .163]), torso([.345, -.39, .158]), .083, .078, 'cloth');
  branch(torso([-.29, -.43, -.15]), torso([.30, -.42, -.15]), .084, .082, 'cloth');
  oval(torso([.054, -.479, .247]), [.114, .108, .070], 'cloth');
  blade(torso([.047, -.45, .240]), [.085 + lean * .32, -1.23 + bodyY, .306 + lurch], .15, 'cloth');
  blade(torso([-.092, -.465, .230]), [-.111 + lean * .36, -1.025 + bodyY, .29 + lurch], .125, 'cloth');
  blade(torso([.029, -.417, -.230]), [-.11 + lean * .2, -1.13 + bodyY, -.30], .145, 'cloth');

  for (const side of [-1, 1]) {
    const k = side < 0 ? 0 : Math.PI;
    const pendulum = walking ? Math.sin(stride + k) * .19 : 0;
    let hand: Point = [side * 1.00, -.76, .12 + pendulum];
    let elbow: Point = [side * .83, -.07, -.03 + pendulum * .45];
    if (sweep && side > 0) {
      hand = [[1.03, -.73, .15], [1.39, -.17, -.44], [-.67, -.31, 1.40], [-.04, -.62, .69]][frame] as Point;
      elbow = [[.84, -.08, -.03], [1.11, .09, -.29], [.71, .05, .89], [.64, -.08, .50]][frame] as Point;
    }
    if (stomp || stones) {
      const up = stomp ? [.14, .83, -.20, .16][frame] : [.22, .79, .31, .08][frame];
      hand = [side * (1.00 + Math.max(0, up) * .35), -.76 + up * 1.8, .13 + Math.max(0, up) * .61];
      elbow = [side * 1.03, -.05 + up * .70, .02 + Math.max(0, up) * .40];
    }
    const shoulder = torso([side * .52, .50, -.04]);
    hand = torso(hand);
    elbow = torso(elbow);
    branch(shoulder, elbow, .236, .149, 'bark');
    branch(elbow, hand, .186, .119, 'bark');
    blade([elbow[0] + side * .087, elbow[1] + .11, elbow[2] + .085],
      [hand[0], hand[1] + .105, hand[2] + .10], .145, 'splinter');
    blade([elbow[0] + side * .067, elbow[1] + .086, elbow[2] + .065],
      [elbow[0] + side * .211, elbow[1] + .325, elbow[2]], .105, 'leaf');
    oval(hand, [.157, .155, .105], 'bark');
    const raised = (stomp || stones) && frame === 1;
    const fingers = raised ? 1 : -1;
    for (const i of [-1, 0, 1]) {
      const base: Point = [hand[0] + i * .094, hand[1] + .09 * fingers, hand[2] + .032];
      const bend: Point = [base[0] + i * .068, base[1] + fingers * (.17 - Math.abs(i) * .025), base[2] + .073];
      const hook: Point = [bend[0] - i * .028, bend[1] + fingers * .085, bend[2] + .124];
      branch(base, bend, .056, .046, 'rock');
      branch(bend, hook, .046, .012, 'splinter');
    }
    branch([hand[0] - side * .106, hand[1] + .02, hand[2] + .045],
      [hand[0] - side * .207, hand[1] + .118 * fingers, hand[2] + .158], .061, .026, 'bark');

    // Camadas de folhas sobre os ombros e a parte alta das costas.
    for (let i = 0; i < 4; i++) {
      const z = .13 - i * .155;
      blade(torso([side * (.27 + i * .025), .74 - i * .026, z]),
        torso([side * (.88 - i * .045), .30 - i * .045, z + .16]), .143, 'leaf');
    }
    blade(torso([side * .23, .75, -.28]), torso([side * .38, .18, -.55]), .154, 'moss');
    blade(torso([side * .075, .78, -.31]), torso([side * .105, .10, -.57]), .136, 'leaf');
  }

  // Crânio comprido, olhos no fundo das órbitas, mandíbula e galhadas ramificadas.
  const head = ([x, y, z]: Point): Point => torso([x, y, z + .025]);
  oval(head([0, .86, .16]), [.271, .306, .258], 'rock');
  oval(head([0, 1.010, .358]), [.235, .218, .169], 'bone');
  oval(head([0, .772, .493]), [.142, .192, .103], 'cavity');
  oval(head([0, .662 - jaw, .510]), [.118, .063, .121], 'bone');
  blade(head([0, 1.054, .481]), head([0, .756, .620]), .090, 'bone');
  for (const side of [-1, 1]) {
    oval(head([side * .135, .946, .493]), [.092, .083, .064], 'cavity');
    oval(head([side * .144, .946, .546]), [.022, .022, .017], 'eye');
    blade(head([side * .224, 1.092, .378]), head([side * .054, .753, .560]), .088, 'bone');
    blade(head([side * .179, .882, .423]), head([side * .137, .663, .481]), .055, 'bone');
    const a = head([side * .159, 1.10, .234]), b = head([side * .373, 1.27, .207]);
    const c = head([side * .655, 1.39, .150]), d = head([side * .889, 1.36, .107]), e = head([side * 1.04, 1.49, .101]);
    branch(a, b, .128, .108, 'horn');
    branch(b, c, .106, .084, 'horn');
    branch(c, d, .088, .079, 'horn');
    branch(d, e, .083, .039, 'horn');
    branch(e, head([side * 1.028, 1.715, .058]), .055, .012, 'horn');
    blade(b, head([side * .417, 1.67, .184]), .086, 'horn');
    branch(c, head([side * .722, 1.645, .061]), .078, .063, 'horn');
    branch(head([side * .722, 1.645, .061]), head([side * .642, 1.81, .014]), .069, .012, 'horn');
    blade(a, head([side * .228, 1.48, .158]), .081, 'splinter');
  }

  const evaluate: SdfEvaluator = (x, y, z) => {
    let d = Infinity;
    let mat = 'k';
    for (const shape of shapes) {
      const { min, max } = shape;
      const bound = Math.max(min[0] - x, x - max[0], min[1] - y, y - max[1], min[2] - z, z - max[2]);
      if (bound > 0 && bound >= d) continue;
      const next = shape.distance(x, y, z);
      if (next < d) { d = next; mat = shape.material; }
    }
    return { d, mat };
  };
  const pack = build27Pack(WARDEN_PW, WARDEN_PH, SIZE, SIZE, palette, evaluate, (mat, shade, x, y, z) => {
    if (!(mat in tones)) return mat;
    const band = Math.floor(x * 17 + y * 9) * 11 + Math.floor(z * 13 - y * 16) * 5;
    const light = shade + Math.sin(band) * .112;
    return mat + (light > .78 ? '2' : light > .41 ? '1' : '0');
  }, true);
  raw.set(pose, pack);
  return pack;
}

export function getAntlerWardenPosePack(pose: WardenPose) {
  const cached = registered.get(pose);
  if (cached) return cached;
  const pack = registerAnimalSpritePack({ ...buildAntlerWardenPosePack(pose) }, {
    module: './AntlerWardenSprites.ts', factory: 'getAntlerWardenPosePack', args: [pose], asymmetric: true,
  });
  registered.set(pose, pack);
  return pack;
}
