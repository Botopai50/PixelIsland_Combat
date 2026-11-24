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
  bark: [[47, 39, 43], [91, 69, 62], [142, 110, 91]],
  splinter: [[71, 56, 54], [129, 98, 78], [181, 146, 113]],
  rock: [[49, 43, 49], [78, 67, 68], [122, 99, 87]],
  horn: [[50, 39, 41], [102, 73, 55], [158, 117, 80]],
  bone: [[116, 93, 77], [197, 170, 132], [236, 215, 175]],
  leaf: [[35, 43, 37], [70, 78, 51], [115, 117, 68]],
  moss: [[45, 49, 40], [93, 92, 56], [132, 127, 78]],
  cloth: [[59, 36, 42], [101, 48, 47], [154, 66, 53]],
} satisfies Record<string, [Point, Point, Point]>;
const palette: Record<string, Point> = {
  k: [24, 22, 29], eye: [221, 172, 75], cavity: [24, 21, 28],
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
  const stretching = (stomp || stones) && frame === 1;
  const hunch = stretching ? .065 : .33;
  const torso = ([x, y, z]: Point): Point => [
    x + lean * (y + .25), y + bodyY - Math.max(0, y) * (stretching ? 0 : .095),
    z + lurch * (y + .55) + Math.max(0, y + .22) * hunch,
  ];

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

  // Prisma afunilado com faces planas e quinas chanfradas. O perfil fino
  // dá às folhas e aos retalhos uma borda incisiva, visível de lado.
  function facet(a: Point, b: Point, start: number, end: number, material: string, thickness = 1) {
    const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2];
    const length = Math.hypot(dx, dy, dz);
    const tx = dx / length, ty = dy / length, tz = dz / length;
    const sideways = Math.hypot(tx, ty);
    const ux = sideways > .001 ? ty / sideways : 1;
    const uy = sideways > .001 ? -tx / sideways : 0;
    const vx = -tz * uy, vy = tz * ux, vz = tx * uy - ty * ux;
    const bound = Math.max(start, end) * 1.15;
    shapes.push({
      min: [Math.min(a[0], b[0]) - bound, Math.min(a[1], b[1]) - bound, Math.min(a[2], b[2]) - bound],
      max: [Math.max(a[0], b[0]) + bound, Math.max(a[1], b[1]) + bound, Math.max(a[2], b[2]) + bound],
      material,
      distance(x, y, z) {
        x -= a[0]; y -= a[1]; z -= a[2];
        const along = x * tx + y * ty + z * tz;
        const t = Math.max(0, Math.min(1, along / length));
        const radius = start + (end - start) * t;
        const u = Math.abs(x * ux + y * uy);
        const v = Math.abs(x * vx + y * vy + z * vz);
        return Math.max(-along - .024, along - length - .021,
          u - radius, v - radius * thickness, (u * thickness + v - radius * thickness * 1.35) * .72);
      },
    });
  }

  function blade(a: Point, tip: Point, width: number, material: string) {
    const mid: Point = [a[0] * .63 + tip[0] * .37, a[1] * .63 + tip[1] * .37, a[2] * .63 + tip[2] * .37];
    const thickness = material === 'cloth' ? .30 : material === 'leaf' || material === 'moss' ? .47 : .76;
    facet(a, mid, width * .65, width, material, thickness);
    facet(mid, tip, width, .014, material, thickness);
  }

  // Torso estreito na cintura, com placas e costelas de casca.
  oval(torso([0, -.41, -.08]), [.37, .29, .29], 'rock');
  branch(torso([0, -.29, -.10]), torso([0, .44, -.12]), .26, .44, 'bark');
  oval(torso([0, .43, -.12]), [.60, .37, .36], 'bark');
  oval(torso([0, .63, -.27]), [.41, .34, .34], 'rock');
  facet(torso([0, .80, -.31]), torso([0, -.15, -.46]), .206, .096, 'bark', .76);
  for (const side of [-1, 1]) {
    for (let rib = 0; rib < 3; rib++) {
      const y = .52 - rib * .18;
      blade(torso([side * (.50 - rib * .078), y + .075, .172]),
        torso([side * .069, y - .125, .326 - rib * .026]), .095 - rib * .012, rib === 1 ? 'bark' : 'splinter');
    }
  }
  blade(torso([0, .46, .294]), torso([0, -.33, .247]), .115, 'rock');

  // Pernas arqueadas e pés de raiz. O apoio acompanha as passadas.
  for (const side of [-1, 1]) {
    const s = walking ? Math.sin(stride + (side < 0 ? 0 : Math.PI)) : 0;
    const knee: Point = [side * (.55 + (stomp && frame === 2 ? .11 : 0)), -.89 + .06 * s, .195 + s * .13];
    const foot: Point = [side * .62, -1.585 + Math.max(0, s) * .22, -.12 + side * .085 + s * .34];
    branch(torso([side * .216, -.43, -.07]), knee, .235, .188, 'bark');
    facet(knee, [foot[0] - side * .12, foot[1] + .19, foot[2] - .067], .169, .103, 'rock');
    branch([foot[0] - side * .12, foot[1] + .22, foot[2] - .067], foot, .122, .11, 'bark');
    blade([knee[0] + side * .025, knee[1] + .08, knee[2] + .13],
      [foot[0], foot[1] + .19, foot[2] + .10], .122, 'splinter');
    facet([foot[0], foot[1] + .042, foot[2] - .116], [foot[0], foot[1] + .023, foot[2] + .17], .151, .181, 'moss', .57);
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
  facet(torso([-.011, -.40, .258]), torso([.082, -.553, .276]), .09, .076, 'cloth', .62);
  blade(torso([.047, -.45, .240]), [.034 + lean * .32, -1.31 + bodyY, .313 + lurch], .19, 'cloth');
  blade(torso([-.092, -.465, .230]), [-.111 + lean * .36, -1.025 + bodyY, .29 + lurch], .125, 'cloth');
  blade(torso([.122, -.48, .259]), [.193 + lean * .32, -1.047 + bodyY, .29 + lurch], .108, 'cloth');
  blade(torso([.029, -.417, -.230]), [-.11 + lean * .2, -1.13 + bodyY, -.30], .145, 'cloth');

  for (const side of [-1, 1]) {
    const k = side < 0 ? 0 : Math.PI;
    const pendulum = walking ? Math.sin(stride + k) * .19 : 0;
    let hand: Point = [side * 1.105, -.913 + side * .045, .22 + side * .12 + pendulum];
    let elbow: Point = [side * .92, -.154, -.045 + pendulum * .45];
    if (sweep && side > 0) {
      hand = [[1.03, -.73, .15], [1.39, -.17, -.44], [-.67, -.31, 1.40], [-.04, -.62, .69]][frame] as Point;
      elbow = [[.84, -.08, -.03], [1.11, .09, -.29], [.71, .05, .89], [.64, -.08, .50]][frame] as Point;
    }
    if (stomp || stones) {
      const up = stomp ? [.14, .83, -.20, .16][frame] : [.22, .79, .31, .08][frame];
      hand = [side * (1.00 + Math.max(0, up) * .35), -.76 + up * 1.8, .13 + Math.max(0, up) * .61];
      elbow = [side * 1.03, -.05 + up * .70, .02 + Math.max(0, up) * .40];
    }
    const shoulder = torso([side * .591, .49, -.105]);
    hand = torso(hand);
    elbow = torso(elbow);
    branch(shoulder, elbow, .236, .149, 'bark');
    facet(elbow, hand, .187, .120, 'bark', .84);
    const shard: Point = [elbow[0] + side * .115, elbow[1] - .055, elbow[2] + .026];
    blade(shard, [shard[0] + side * .105, shard[1] + .264, shard[2] - .047], .093, 'bark');
    blade([elbow[0] + side * .087, elbow[1] + .11, elbow[2] + .085],
      [hand[0], hand[1] + .105, hand[2] + .10], .145, 'splinter');
    blade([elbow[0] + side * .067, elbow[1] + .086, elbow[2] + .065],
      [elbow[0] + side * .211, elbow[1] + .325, elbow[2]], .105, 'leaf');
    facet([hand[0], hand[1] + .123, hand[2] - .018],
      [hand[0] - side * .02, hand[1] - .120, hand[2] + .028], .115, .159, 'bark', .61);
    const raised = (stomp || stones) && frame === 1;
    const fingers = raised ? 1 : -1;
    for (const i of [-1, 0, 1]) {
      const base: Point = [hand[0] + i * .113, hand[1] + .09 * fingers, hand[2] + .032];
      const bend: Point = [base[0] + i * .103, base[1] + fingers * (.236 - Math.abs(i) * .048), base[2] + .073];
      const hook: Point = [bend[0] - i * .057 - side * .037, bend[1] + fingers * .092, bend[2] + .169];
      facet(base, bend, .055, .046, 'bark');
      facet(bend, hook, .047, .012, 'rock');
    }
    branch([hand[0] - side * .106, hand[1] + .02, hand[2] + .045],
      [hand[0] - side * .207, hand[1] + .118 * fingers, hand[2] + .158], .061, .026, 'bark');

    // Manto de folhas sobre placas de madeira, com pontas irregulares
    // que descem pelas costas e ultrapassam os ombros.
    oval(torso([side * .412, .665, -.245]), [.385, .182, .31], 'moss');
    for (let i = 0; i < 4; i++) {
      const z = .135 - i * .155;
      blade(torso([side * (.22 + i * .037), .82 - i * .026, z]),
        torso([side * (1.025 - i * .057), .28 - i * .055, z + .125]), .145, i === 1 ? 'moss' : 'leaf');
    }
    blade(torso([side * .491, .744, -.274]), torso([side * .923, .501, -.205]), .118, 'moss');
    blade(torso([side * .571, .674, -.117]), torso([side * .749, .288, .256]), .094, 'leaf');
    for (let i = 0; i < 4; i++) {
      const leanOut = .11 + i * .154;
      blade(torso([side * leanOut * .62, .77 - i * .017, -.33]),
        torso([side * (leanOut + .075), .01 + i * .043, -.63 + i * .034]), .134, i % 2 ? 'moss' : 'leaf');
    }
  }

  // Crânio cervídeo. O focinho afunila para a frente e para baixo,
  // com o osso passando por cima das cavidades em vez de pintar um olho na testa.
  const head = ([x, y, z]: Point): Point => torso([x - .026, y - .06, z + .114]);
  oval(head([0, .84, .195]), [.268, .279, .197], 'rock');
  facet(head([0, 1.135, .305]), head([0, .91, .509]), .171, .208, 'bone', .63);
  facet(head([0, .995, .48]), head([0, .649, .776]), .158, .038, 'bone', .60);
  oval(head([0, .697, .563]), [.113, .165 + jaw * .27, .135], 'cavity');
  facet(head([0, .624 - jaw * .68, .455]), head([0, .547 - jaw, .668]), .081, .039, 'bone', .66);
  facet(head([0, .955, .567]), head([0, .667, .776]), .045, .017, 'bone', .60);
  for (const side of [-1, 1]) {
    oval(head([side * .144, .930, .551]), [.075, .087, .068], 'cavity');
    oval(head([side * .157, .929, .607]), [.016, .015, .012], 'eye');
    blade(head([side * .214, 1.107, .375]), head([side * .092, .961, .582]), .064, 'bone');
    blade(head([side * .222, .976, .468]), head([side * .117, .611 - jaw * .12, .626]), .047, 'bone');
    blade(head([side * .126, .775, .605]), head([side * .098, .644, .696]), .034, 'bone');

    const drift = side < 0 ? -.054 : .047;
    const a = head([side * .138, 1.122, .234]);
    const b = head([side * .368, 1.28, .153]);
    const c = head([side * .702, 1.428, .069 + drift]);
    const d = head([side * 1.030, 1.363 + drift, -.073]);
    const e = head([side * 1.285, 1.286 + drift, -.039]);
    facet(a, b, .120, .114, 'horn');
    facet(b, c, .110, .094, 'horn');
    facet(c, d, .091, .072, 'horn');
    facet(d, e, .071, .047, 'horn');
    facet(e, head([side * 1.352, 1.521 + drift, -.083]), .061, .017, 'horn');
    facet(b, head([side * .398, 1.508, .088]), .072, .045, 'horn');
    facet(head([side * .398, 1.508, .088]), head([side * .338, 1.629 + drift, .047]), .045, .010, 'horn');
    facet(d, head([side * 1.038, 1.649 + drift, -.163]), .075, .064, 'horn');
    facet(head([side * 1.038, 1.649 + drift, -.163]), head([side * .917, 1.835 + drift, -.219]), .064, .015, 'horn');
    facet(a, head([side * .299, 1.181, .512]), .074, .025, 'horn');
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
    const band = Math.floor(x * 10 + y * 7) * 11 + Math.floor(z * 11 - y * 12) * 5;
    const light = shade + Math.sin(band) * (mat === 'bone' ? .028 : .066);
    return mat + (light > .75 ? '2' : light > .435 ? '1' : '0');
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
