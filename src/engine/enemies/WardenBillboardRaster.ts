import * as THREE from 'three';
import { actorSpriteResolution } from '../character/ActorPixelGrid';
import type { AnimalTurnPose } from './AnimalTurnPose';
import type { SpriteView } from './AnimalSpriteCache';
import {
  getAntlerWardenSculpture, WARDEN_SDF_EXTENT, WARDEN_SIZE, wardenPalette, wardenTones, type WardenPose,
} from './AntlerWardenSprites';

const tones = Object.keys(wardenTones);
const surfaces = [...tones, 'eye', 'cavity'];
const palette = surfaces.flatMap(name => [0, 1, 2].map(i => {
  const [r, g, b] = wardenPalette[name] ?? wardenPalette[name + i];
  return new THREE.Color().setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace);
}));
const geometryByPose = new Map<WardenPose, THREE.InstancedBufferGeometry>();

function geometryFor(pose: WardenPose) {
  const cached = geometryByPose.get(pose);
  if (cached) return cached;
  const shapes = getAntlerWardenSculpture(pose);
  const cube = new THREE.BoxGeometry(1, 1, 1);
  const geometry = new THREE.InstancedBufferGeometry();
  geometry.setIndex(cube.index);
  geometry.setAttribute('position', cube.attributes.position);
  const attribute = (data: number[][], size: number) => new THREE.InstancedBufferAttribute(new Float32Array(data.flat()), size);
  geometry.setAttribute('aLow', attribute(shapes.map(s => s.min.map(v => v - .025)), 3));
  geometry.setAttribute('aHigh', attribute(shapes.map(s => s.max.map(v => v + .025)), 3));
  geometry.setAttribute('aStart', attribute(shapes.map(s => [...s.a, s.kind]), 4));
  geometry.setAttribute('aEnd', attribute(shapes.map(s => [...s.b, surfaces.indexOf(s.material)]), 4));
  geometry.setAttribute('aShape', attribute(shapes.map(s => s.style), 3));
  geometry.instanceCount = shapes.length;
  geometryByPose.set(pose, geometry);
  return geometry;
}

const vertexShader = /* glsl */ `
attribute vec3 aLow;
attribute vec3 aHigh;
attribute vec4 aStart;
attribute vec4 aEnd;
attribute vec3 aShape;
uniform vec2 uTurn;
uniform float uExtent;
varying vec3 vPoint;
flat varying vec3 vLow;
flat varying vec3 vHigh;
flat varying vec4 vStart;
flat varying vec4 vEnd;
flat varying vec3 vShape;
flat varying vec2 vBend;

vec3 bend(vec3 p, float angle, float lift) {
  float c = cos(angle), s = sin(angle);
  float neck = uExtent * .035;
  vec2 xz = mat2(c, -s, s, c) * (p.xz - vec2(0, neck));
  return vec3(xz.x, p.y + lift, xz.y + neck);
}

void main() {
  vLow = aLow;
  vHigh = aHigh;
  vStart = aStart;
  vEnd = aEnd;
  vShape = aShape;
  vec3 center = (aLow + aHigh) * .5;
  float h = center.y / uExtent;
  float head = smoothstep(.20, .43, h);
  float shoulders = smoothstep(-.20, .29, h);
  float feet = 1.0 - smoothstep(-.85, -.28, h);
  vBend = vec2(uTurn.x * .44 * (head * .82 + shoulders * .18) - feet * uTurn.y * .19,
               feet * max(0.0, sign(center.x) * uTurn.y) * uExtent * .10);
  vPoint = mix(aLow, aHigh, position + .5);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(bend(vPoint, vBend.x, vBend.y), 1.0);
}
`;

const fragmentShader = /* glsl */ `
uniform mat4 uClip;
uniform vec3 uRay;
uniform float uExtent;
uniform vec3 uPalette[${palette.length}];
varying vec3 vPoint;
flat varying vec3 vLow;
flat varying vec3 vHigh;
flat varying vec4 vStart;
flat varying vec4 vEnd;
flat varying vec3 vShape;
flat varying vec2 vBend;

float surfaceDistance(vec3 p) {
  vec3 q = p - vStart.xyz;
  vec3 b = vEnd.xyz;
  if (vStart.w < .5) {
    vec3 ratio = q / b;
    float k = length(ratio);
    return k < .000001 ? -min(b.x, min(b.y, b.z)) : k * (k - 1.0) / length(ratio / b);
  }
  vec3 axis = b - vStart.xyz;
  if (vStart.w < 1.5) {
    float h = clamp(dot(q, axis) / max(.000001, dot(axis, axis)), 0.0, 1.0);
    return length(q - axis * h) - mix(vShape.x, vShape.y, h);
  }
  float len = length(axis);
  vec3 t = axis / len;
  float sideways = length(t.xy);
  vec3 u = sideways > .001 ? vec3(t.y, -t.x, 0.0) / sideways : vec3(1, 0, 0);
  vec3 v = cross(t, u);
  float along = dot(q,t);
  float r = mix(vShape.x, vShape.y, clamp(along / len, 0.0, 1.0));
  float x = abs(dot(q,u)), y = abs(dot(q,v)), thickness = vShape.z;
  return max(max(-along - .024, along - len - .021),
             max(max(x - r, y - r * thickness), (x * thickness + y - r * thickness * 1.35) * .72));
}

void main() {
  float c = cos(vBend.x), s = sin(vBend.x);
  vec2 rayXZ = mat2(c, s, -s, c) * uRay.xz;
  vec3 ray = vec3(rayXZ.x, uRay.y, rayXZ.y);
  vec3 origin = vPoint - ray * 6.0;
  vec3 safeRay = mix(vec3(.000001), ray, greaterThan(abs(ray), vec3(.000001)));
  vec3 enter = min((vLow-origin)/safeRay, (vHigh-origin)/safeRay);
  vec3 exit = max((vLow-origin)/safeRay, (vHigh-origin)/safeRay);
  float t = max(enter.x, max(enter.y, enter.z));
  float end = min(exit.x, min(exit.y, exit.z));
  vec3 p;
  float d = 1.0;
  for (int i = 0; i < 32; i++) {
    if (t > end) discard;
    p = origin + t * ray;
    d = surfaceDistance(p);
    if (d < .007) break;
    t += max(.001, d * .84);
  }
  if (d >= .007) discard;

  const vec2 e = vec2(.008,0);
  vec3 normal = normalize(vec3(surfaceDistance(p+e.xyy), surfaceDistance(p+e.yxy), surfaceDistance(p+e.yyx)) - d);
  float shade = clamp(dot(normal, vec3(-.35,.78,.52)) * .52 + .52, 0.0, 1.0);
  int material = int(vEnd.w);
  float band = floor(p.x*10.0+p.y*7.0)*11.0 + floor(p.z*11.0-p.y*12.0)*5.0;
  shade += sin(band) * (material == ${tones.indexOf('bone')} ? .028 : .066);
  int tone = shade > .75 ? 2 : shade > .435 ? 1 : 0;

  float neck = uExtent * .035;
  vec2 xz = mat2(c, -s, s, c) * (p.xz - vec2(0,neck));
  vec4 clip = uClip * vec4(xz.x, p.y + vBend.y, xz.y + neck, 1.0);
  gl_FragDepth = clip.z / clip.w * .5 + .5;
  gl_FragColor = vec4(uPalette[material * 3 + tone], 1.0);
}
`;

/** Rasteriza a mesma escultura que o mapa usa, com um texel por célula da arte. */
export class WardenBillboardRaster {
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.OrthographicCamera(
    -WARDEN_SDF_EXTENT, WARDEN_SDF_EXTENT, WARDEN_SDF_EXTENT, -WARDEN_SDF_EXTENT, .01, 12,
  );
  private readonly target: THREE.WebGLRenderTarget;
  private readonly clear = new THREE.Color();
  private readonly material = new THREE.ShaderMaterial({
    uniforms: {
      uClip: { value: new THREE.Matrix4() },
      uRay: { value: new THREE.Vector3() },
      uTurn: { value: new THREE.Vector2() },
      uExtent: { value: WARDEN_SDF_EXTENT },
      uPalette: { value: palette },
    },
    vertexShader,
    fragmentShader,
    side: THREE.BackSide,
    toneMapped: false,
  });
  private readonly mesh = new THREE.Mesh(geometryFor('idle0'), this.material);
  private lastFrame = '';

  constructor(private readonly renderer: THREE.WebGLRenderer) {
    const { width, height } = actorSpriteResolution(WARDEN_SIZE, WARDEN_SIZE);
    this.target = new THREE.WebGLRenderTarget(width, height, {
      magFilter: THREE.NearestFilter,
      minFilter: THREE.NearestFilter,
      generateMipmaps: false,
    });
    this.mesh.frustumCulled = false;
    this.scene.add(this.mesh);
  }

  render(pose: WardenPose, view: SpriteView, turn?: AnimalTurnPose) {
    const frame = `${pose}:${view.tier}:${view.direction}:${turn?.look ?? 0}:${turn?.step ?? 0}`;
    if (frame !== this.lastFrame) {
      const { renderer, camera, material } = this;
      const yaw = THREE.MathUtils.degToRad((view.direction <= 8 ? view.direction : view.direction - 16) * 22.5);
      const pitch = THREE.MathUtils.degToRad(view.tier === 9 ? 88 : view.tier === 10 ? -88 : 80 - view.tier * 20);
      const cp = Math.cos(pitch);
      camera.position.set(-Math.sin(yaw) * cp, Math.sin(pitch), Math.cos(yaw) * cp).multiplyScalar(6);
      camera.up.set(0, view.tier >= 9 ? 0 : 1, view.tier >= 9 ? 1 : 0);
      camera.lookAt(0, 0, 0);
      camera.updateMatrixWorld(true);
      this.mesh.geometry = geometryFor(pose);
      material.uniforms.uClip.value.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
      material.uniforms.uRay.value.copy(camera.position).normalize().negate();
      material.uniforms.uTurn.value.set(turn?.look ?? 0, turn?.step ?? 0);

      const target = renderer.getRenderTarget();
      const autoClear = renderer.autoClear;
      renderer.getClearColor(this.clear);
      const alpha = renderer.getClearAlpha();
      renderer.setRenderTarget(this.target);
      renderer.setClearColor(0, 0);
      renderer.autoClear = true;
      try {
        renderer.render(this.scene, camera);
      } finally {
        renderer.setRenderTarget(target);
        renderer.setClearColor(this.clear, alpha);
        renderer.autoClear = autoClear;
      }
      this.lastFrame = frame;
    }
    return this.target.texture as unknown as THREE.CanvasTexture;
  }

  dispose() {
    this.target.dispose();
    this.material.dispose();
  }
}
