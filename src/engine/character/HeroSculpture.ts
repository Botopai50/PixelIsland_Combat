import * as THREE from 'three';
import type { HumanoidRig, JointName } from './HumanoidRig';

type Vec3 = [number, number, number];
type Surface = keyof typeof colors;
type Shape = { kind: number; a: Vec3; b: Vec3; detail: Vec3; surface: Surface };

const colors = {
  hair: [0x33201c, 0x633b24, 0x87512f],
  fringe: [0x45291d, 0x75452a, 0x9c6240],
  skin: [0x91492e, 0xcb7241, 0xe8a45d],
  eye: [0xd69b76, 0xffdcc4, 0xffead2],
  dark: [0x1b1215, 0x25171a, 0x3e2824],
  linen: [0x9f9071, 0xcebe9a, 0xebdabb],
  scarf: [0x385735, 0x547c38, 0x8da94d],
  scarfLight: [0x466235, 0x6c9243, 0xa0b957],
  leather: [0x6c422a, 0xa56a3c, 0xc88b4e],
  trousers: [0x2a2225, 0x44373a, 0x66524a],
  boots: [0x6e4229, 0xad7547, 0xd2a067],
  sole: [0x352125, 0x543229, 0x7c4e31],
} satisfies Record<string, [number, number, number]>;

const palette = Object.values(colors).flatMap(shades => shades.map(color => new THREE.Color(color)));
const surfaceIndex = (surface: Surface) => Object.keys(colors).indexOf(surface) * 3;

const ellipsoid = (a: Vec3, b: Vec3, surface: Surface): Shape =>
  ({ kind: 0, a, b, detail: [0, 0, 0], surface });
const capsule = (a: Vec3, b: Vec3, startRadius: number, endRadius: number, surface: Surface): Shape =>
  ({ kind: 1, a, b, detail: [startRadius, endRadius, 0], surface });
const panel = (a: Vec3, b: Vec3, bevel: number, angle: number, surface: Surface): Shape =>
  ({ kind: 2, a, b, detail: [bevel, Math.cos(angle), Math.sin(angle)], surface });

const head: Shape[] = [
  ellipsoid([0, .131, .019], [.127, .139, .111], 'skin'),
  ellipsoid([0, .061, .073], [.084, .075, .071], 'skin'),
  ellipsoid([0, .098, .133], [.022, .023, .023], 'skin'),
  ellipsoid([0, .206, -.014], [.165, .128, .134], 'hair'),
  ellipsoid([0, .24, .031], [.147, .107, .122], 'hair'),
  panel([.001, .051, .137], [.024, .004, .009], .003, 0, 'leather'),
];
for (const side of [-1, 1]) {
  head.push(
    ellipsoid([side * .120, .106, .030], [.032, .037, .026], 'skin'),
    panel([side * .047, .124, .130], [.018, .009, .008], .004, side * .09, 'eye'),
    panel([side * .046, .122, .141], [.011, .010, .006], .002, 0, 'dark'),
    capsule([side * .021, .151, .136], [side * .077, .150, .117], .008, .009, 'hair'),
  );
}
const spikes: [Vec3, Vec3, number, Surface][] = [
  [[-.128, .225, .040], [-.221, .217, .036], .048, 'hair'],
  [[-.115, .251, .056], [-.199, .298, .067], .052, 'hair'],
  [[-.094, .281, .035], [-.154, .355, .038], .060, 'hair'],
  [[-.059, .309, .010], [-.091, .403, .017], .055, 'hair'],
  [[-.011, .323, .019], [.002, .423, .017], .056, 'hair'],
  [[.047, .309, .019], [.085, .397, .031], .058, 'hair'],
  [[.099, .277, .029], [.164, .356, .047], .055, 'hair'],
  [[.122, .238, .029], [.204, .294, .03], .055, 'hair'],
  [[.124, .206, .021], [.204, .200, .026], .047, 'hair'],
  [[-.106, .225, .104], [-.105, .126, .112], .044, 'fringe'],
  [[-.059, .24, .126], [-.037, .176, .148], .048, 'hair'],
  [[-.007, .245, .129], [.024, .170, .150], .042, 'fringe'],
  [[.060, .23, .117], [.087, .160, .134], .047, 'hair'],
  [[-.050, .253, -.094], [-.083, .322, -.147], .053, 'hair'],
  [[.049, .24, -.093], [.104, .261, -.145], .052, 'hair'],
];
for (const [a, b, radius, surface] of spikes) head.push(capsule(a, b, radius, .005, surface));

const torso: Shape[] = [
  ellipsoid([0, -.054, .004], [.181, .213, .119], 'linen'),
  panel([0, -.161, -.005], [.142, .085, .099], .028, -.06, 'linen'),
  ellipsoid([0, .101, -.028], [.215, .143, .121], 'scarf'),
  ellipsoid([0, .091, .089], [.173, .106, .057], 'scarf'),
  capsule([-.170, .115, .060], [-.151, -.051, .091], .063, .018, 'scarfLight'),
  capsule([.151, .109, .083], [.174, -.037, .103], .062, .019, 'scarf'),
  capsule([-.142, .136, .036], [.125, .145, .050], .057, .061, 'scarfLight'),
  capsule([-.125, .138, .088], [.117, .057, .116], .052, .041, 'scarf'),
  capsule([.122, .145, .086], [-.083, .038, .122], .058, .030, 'scarfLight'),
  ellipsoid([.092, .026, .116], [.066, .085, .026], 'scarf'),
  capsule([.091, .064, .123], [.121, -.068, .121], .047, .014, 'scarfLight'),
  capsule([-.154, .151, .127], [-.057, .020, .155], .024, .022, 'leather'),
  capsule([-.057, .020, .155], [.112, -.184, .127], .022, .026, 'leather'),
  panel([-.026, -.025, .172], [.021, .017, .009], .004, -.62, 'boots'),
  capsule([-.131, .1, -.111], [.094, -.186, -.105], .021, .024, 'leather'),
  ellipsoid([-.099, .099, -.117], [.068, .062, .035], 'scarf'),
  capsule([-.126, .101, -.104], [-.221, -.047, -.087], .048, .010, 'scarfLight'),
  capsule([-.095, .088, -.117], [-.037, -.077, -.102], .041, .009, 'scarf'),
];

const pelvis: Shape[] = [
  panel([0, .003, .004], [.145, .088, .090], .031, .035, 'trousers'),
  panel([0, .088, .010], [.155, .021, .100], .013, .035, 'leather'),
  panel([.010, .075, .124], [.024, .018, .007], .005, .061, 'boots'),
  capsule([-.145, .092, .044], [-.168, -.054, .057], .028, .008, 'scarf'),
];

const upperArm = [
  ellipsoid([0, -.057, 0], [.077, .105, .068], 'linen'),
  ellipsoid([0, .002, .005], [.082, .070, .073], 'scarfLight'),
  capsule([0, -.110, 0], [0, -.150, 0], .064, .059, 'linen'),
  capsule([0, -.147, 0], [0, -.289, 0], .050, .043, 'skin'),
];
const forearm = [
  capsule([0, -.005, 0], [0, -.254, 0], .047, .034, 'skin'),
  capsule([0, -.156, 0], [0, -.223, 0], .043, .040, 'leather'),
  panel([.011, -.179, .038], [.028, .027, .009], .006, .13, 'boots'),
];
const hand = [
  ellipsoid([0, -.025, .007], [.042, .053, .044], 'skin'),
  capsule([.027, -.009, .027], [.039, -.035, .037], .018, .014, 'skin'),
];
const thigh = [
  capsule([0, -.025, 0], [0, -.309, .003], .090, .070, 'trousers'),
  panel([0, -.302, .002], [.058, .044, .052], .014, .06, 'trousers'),
  capsule([0, -.301, 0], [0, -.435, .002], .052, .044, 'skin'),
];
const shin = [
  capsule([0, -.004, .001], [0, -.229, .006], .048, .037, 'skin'),
  capsule([0, -.150, .005], [0, -.412, .006], .053, .047, 'boots'),
  capsule([0, -.173, .005], [0, -.202, .005], .064, .061, 'leather'),
  panel([.005, -.179, .06], [.028, .023, .012], .007, -.13, 'boots'),
  panel([0, -.300, .050], [.048, .021, .009], .010, .16, 'leather'),
];
const foot = [
  ellipsoid([0, .006, .044], [.061, .056, .103], 'boots'),
  panel([0, -.027, .047], [.057, .016, .089], .007, 0, 'sole'),
  panel([0, .010, .086], [.053, .024, .049], .011, .03, 'boots'),
];

const vertexShader = /* glsl */ `
varying vec3 vLocal;
uniform vec2 uOffset;
void main() {
  vLocal = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_Position.xy += uOffset * gl_Position.w;
}
`;

const fragmentShader = /* glsl */ `
varying vec3 vLocal;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform vec3 uEye;
uniform vec3 uLow;
uniform vec3 uHigh;
uniform vec4 uA[SHAPES];
uniform vec4 uB[SHAPES];
uniform vec3 uDetail[SHAPES];
uniform vec3 uPalette[${palette.length}];
uniform vec3 uLight;
uniform vec3 uFlash;
uniform float uFlashAmount;

float shapeDistance(vec3 p, int i) {
  vec3 b = uB[i].xyz;
  vec3 detail = uDetail[i];
  vec3 point = p - uA[i].xyz;
  if (uA[i].w < 0.5) {
    vec3 q = point / b;
    float k0 = length(q);
    return k0 < 0.00001 ? -min(b.x, min(b.y, b.z)) : k0 * (k0 - 1.0) / length(q / b);
  }
  if (uA[i].w < 1.5) {
    vec3 ab = b - uA[i].xyz;
    float h = clamp(dot(point, ab) / max(0.00001, dot(ab, ab)), 0.0, 1.0);
    return length(point - ab * h) - mix(detail.x, detail.y, h);
  }
  vec3 q = abs(vec3(point.x * detail.y + point.y * detail.z,
                    point.y * detail.y - point.x * detail.z, point.z)) - b;
  return max(max(q.x, q.y), max(q.z, max(q.x + q.y, max(q.x + q.z, q.y + q.z)) * 0.707 + detail.x * 0.32)) - detail.x;
}

float field(vec3 p, out int shape) {
  float closest = 10.0;
  shape = 0;
  for (int i = 0; i < SHAPES; i++) {
    float distance = shapeDistance(p, i);
    if (distance < closest) {
      closest = distance;
      shape = i;
    }
  }
  return closest;
}

void main() {
  vec3 ray = normalize(vLocal - uEye);
  vec3 safeRay = mix(vec3(0.000001), ray, greaterThan(abs(ray), vec3(0.000001)));
  vec3 entry = min((uLow - uEye) / safeRay, (uHigh - uEye) / safeRay);
  vec3 exit = max((uLow - uEye) / safeRay, (uHigh - uEye) / safeRay);
  float t = max(0.0, max(entry.x, max(entry.y, entry.z)));
  float end = min(exit.x, min(exit.y, exit.z));
  int shape;
  vec3 p;
  bool hit = false;
  for (int step = 0; step < 30; step++) {
    if (t > end) break;
    p = uEye + ray * t;
    float d = field(p, shape);
    if (d < 0.0011) { hit = true; break; }
    t += max(0.001, d * 0.78);
  }
  if (!hit) discard;
  int surface = int(uB[shape].w);
  vec2 e = vec2(0.0022, 0);
  vec3 normal = normalize(vec3(shapeDistance(p + e.xyy, shape) - shapeDistance(p - e.xyy, shape),
    shapeDistance(p + e.yxy, shape) - shapeDistance(p - e.yxy, shape),
    shapeDistance(p + e.yyx, shape) - shapeDistance(p - e.yyx, shape)));
  float shade = dot(round(normal * 4.0) * .25, uLight);
  // Small palette variation is pinned to the sculpt, so it moves with the cloth.
  shade += 0.06 * sin(dot(floor(p * 38.0), vec3(1.7, 2.9, 3.1)));
  int tone = shade > 0.68 ? 2 : shade > -0.20 ? 1 : 0;
  if (surface == ${surfaceIndex('eye')} && tone == 0) tone = 1;
  vec3 color = uPalette[surface + tone];
  vec4 clip = projectionMatrix * modelViewMatrix * vec4(p, 1);
  gl_FragDepth = clip.z / clip.w * .5 + .5;
  gl_FragColor = vec4(mix(color, uFlash * 1.25, uFlashAmount * .70), 1.0);
}
`;

function region(shapes: Shape[]) {
  const low = new THREE.Vector3(Infinity, Infinity, Infinity);
  const high = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  for (const shape of shapes) {
    a.fromArray(shape.a);
    b.fromArray(shape.b);
    if (shape.kind === 1) {
      const radius = Math.max(shape.detail[0], shape.detail[1]);
      low.min(a.addScalar(-radius)).min(b.addScalar(-radius));
      high.max(a.addScalar(radius * 2)).max(b.addScalar(radius * 2));
    } else {
      if (shape.kind === 2) {
        const [bevel, cosine, sine] = shape.detail;
        const { x, y, z } = b;
        b.set(Math.abs(cosine) * x + Math.abs(sine) * y,
          Math.abs(sine) * x + Math.abs(cosine) * y, z).addScalar(bevel);
      }
      low.min(a.clone().sub(b));
      high.max(a.add(b));
    }
  }
  low.addScalar(-.006);
  high.addScalar(.006);
  const size = high.clone().sub(low);
  const center = low.clone().add(high).multiplyScalar(.5);
  const geometry = new THREE.BoxGeometry(size.x, size.y, size.z).translate(center.x, center.y, center.z);
  const material = new THREE.ShaderMaterial({
    defines: { SHAPES: shapes.length },
    uniforms: {
      uEye: { value: new THREE.Vector3() },
      uOffset: { value: new THREE.Vector2() },
      uLow: { value: low },
      uHigh: { value: high },
      uA: { value: shapes.map(s => new THREE.Vector4(...s.a, s.kind)) },
      uB: { value: shapes.map(s => new THREE.Vector4(...s.b, surfaceIndex(s.surface))) },
      uDetail: { value: shapes.map(s => new THREE.Vector3(...s.detail)) },
      uPalette: { value: palette },
      uLight: { value: new THREE.Vector3() },
      uFlash: { value: new THREE.Color() },
      uFlashAmount: { value: 0 },
    },
    vertexShader,
    fragmentShader,
    side: THREE.BackSide,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.matrixAutoUpdate = false;
  return mesh;
}

/** Animated signed-distance sculpture, rendered to one sprite with shared depth. */
export class HeroSculpture {
  readonly root = new THREE.Group();
  private readonly regions: { joint: THREE.Object3D; mesh: ReturnType<typeof region> }[] = [];
  private readonly invert = new THREE.Matrix4();
  private readonly keyLight = new THREE.Vector3(-.46, .64, .62).normalize();
  private readonly cameraPosition = new THREE.Vector3();

  constructor(private readonly rig: HumanoidRig) {
    const add = (joint: JointName, shapes: Shape[]) => {
      const mesh = region(shapes);
      this.root.add(mesh);
      this.regions.push({ joint: rig.joints[joint], mesh });
    };
    const liftHead = ([x, y, z]: Vec3): Vec3 => [x, y + .051, z];
    add('head', head.map(shape => ({
      ...shape, a: liftHead(shape.a), b: shape.kind === 1 ? liftHead(shape.b) : shape.b,
    })));
    add('chest', torso);
    add('neck', [
      capsule([0, -.055, 0], [0, .100, .013], .055, .054, 'skin'),
      ellipsoid([0, -.004, .010], [.085, .047, .082], 'scarf'),
      capsule([-.067, .007, .055], [.062, .002, .067], .024, .019, 'scarfLight'),
    ]);
    add('pelvis', pelvis);
    for (const side of ['R', 'L'] as const) {
      add(`upperArm${side}`, upperArm);
      add(`forearm${side}`, forearm);
      const mirror = (point: Vec3): Vec3 => [-point[0], point[1], point[2]];
      add(`hand${side}`, side === 'L' ? hand.map(shape => ({
        ...shape, a: mirror(shape.a), b: shape.kind === 1 ? mirror(shape.b) : shape.b,
      })) : hand);
      add(`thigh${side}`, thigh);
      add(`shin${side}`, shin);
      add(`foot${side}`, foot);
    }
  }

  update(camera: THREE.Camera, offset: THREE.Vector2) {
    this.cameraPosition.setFromMatrixPosition(camera.matrixWorld);
    for (const { joint, mesh } of this.regions) {
      mesh.matrix.copy(joint.matrixWorld);
      mesh.matrixWorldNeedsUpdate = true;
      this.invert.copy(joint.matrixWorld).invert();
      const uniforms = mesh.material.uniforms;
      uniforms.uOffset.value.copy(offset);
      uniforms.uEye.value.copy(this.cameraPosition).applyMatrix4(this.invert);
      uniforms.uLight.value.copy(this.keyLight).transformDirection(this.rig.root.matrixWorld).transformDirection(this.invert);
      uniforms.uFlash.value.copy(this.rig.flashTint);
      uniforms.uFlashAmount.value = this.rig.flashAmount;
    }
  }
}
