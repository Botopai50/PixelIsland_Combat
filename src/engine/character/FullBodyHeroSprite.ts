import * as THREE from 'three';
import type { EquipmentBillboards } from '../items/EquipmentBillboards';
import type { SkeletalBillboard } from './SkeletalBillboard';
import type { HumanoidRig } from './HumanoidRig';
import { HeroSculpture } from './HeroSculpture';

const vertexShader = /* glsl */ `
uniform vec2 uBuffer;
uniform vec2 uOrigin;
uniform float uExtent;

void main() {
  vec2 screen = uOrigin + uv * uExtent;
  gl_Position = vec4(screen * 2.0 / uBuffer - 1.0, 0.0, 1.0);
}
`;

const fragmentShader = /* glsl */ `
uniform sampler2D uColor;
uniform sampler2D uDepth;
uniform vec2 uOrigin;
uniform float uCell;
uniform float uExtent;

void main() {
  vec2 pixel = (floor((gl_FragCoord.xy - uOrigin) / uCell) + 0.5) * (uCell / uExtent);
  vec4 color = texture2D(uColor, pixel);
  float depth = texture2D(uDepth, pixel).r;
  if (color.a < 0.5) {
    // Build the outline after depth has united the sculpture and equipment.
    float texel = uCell / uExtent;
    depth = 1.0;
    for (int i = 0; i < 4; i++) {
      vec2 direction = i == 0 ? vec2(1,0) : i == 1 ? vec2(-1,0) : i == 2 ? vec2(0,1) : vec2(0,-1);
      vec2 neighbor = pixel + direction * texel;
      vec4 sampleColor = texture2D(uColor, neighbor);
      if (sampleColor.a > 0.5 && dot(sampleColor.rgb, vec3(.3,.59,.11)) > .025) {
        depth = min(depth, texture2D(uDepth, neighbor).r);
      }
    }
    if (depth >= 1.0) discard;
    color = vec4(.011, .007, .008, 1.0);
  }
  gl_FragDepth = depth;
  gl_FragColor = color;
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export class FullBodyHeroSprite {
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera();
  private readonly target = new THREE.WebGLRenderTarget(192, 192, {
    magFilter: THREE.NearestFilter,
    minFilter: THREE.NearestFilter,
    type: THREE.HalfFloatType,
    depthTexture: new THREE.DepthTexture(192, 192, THREE.UnsignedIntType),
  });
  private readonly origin = new THREE.Vector2();
  private readonly buffer = new THREE.Vector2();
  private readonly projected = new THREE.Vector3();
  private readonly crop = new THREE.Matrix4();
  private readonly previousClear = new THREE.Color();
  private readonly previousBuffer = new THREE.Vector2();
  private readonly previousOffset = new THREE.Vector2();
  private readonly material = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: this.target.texture },
      uDepth: { value: this.target.depthTexture },
      uOrigin: { value: this.origin },
      uBuffer: { value: this.buffer },
      uCell: { value: 3 },
      uExtent: { value: 576 },
    },
    vertexShader,
    fragmentShader,
  });
  private readonly sculpture: HeroSculpture;
  readonly mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.material);

  constructor(
    private readonly body: SkeletalBillboard,
    private readonly equipment: EquipmentBillboards,
    rig: HumanoidRig,
  ) {
    this.sculpture = new HeroSculpture(rig);
    this.scene.add(this.sculpture.root);
    this.camera.matrixAutoUpdate = false;
    this.mesh.name = 'HeroFullBodySprite';
    this.mesh.frustumCulled = false;
    this.mesh.visible = false;
  }

  setEnabled(enabled: boolean, world: THREE.Scene) {
    const destination = enabled ? this.scene : world;
    if (this.equipment.root.parent === destination) return;
    destination.add(this.equipment.root);
    if (enabled) {
      this.body.root.removeFromParent();
    } else {
      world.add(this.body.root);
      this.mesh.visible = false;
    }
  }

  update(renderer: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera, buffer: THREE.Vector2, feet: THREE.Vector3) {
    this.projected.copy(feet);
    this.projected.y += 1;
    this.projected.applyMatrix4(camera.matrixWorldInverse);
    const distance = -this.projected.z;
    this.mesh.visible = distance > camera.near;
    if (!this.mesh.visible) return;

    const { pixelSizeUniform, bufferSizeUniform, pixelOffsetUniform } = this.body;
    const cell = pixelSizeUniform.value;
    const pxPerMeter = buffer.y * camera.projectionMatrix.elements[5] / (2 * distance);
    const viewportCells = Math.ceil(Math.max(buffer.x, buffer.y) / cell) + 2;
    const desiredCells = Math.max(192, 32 * Math.ceil(5 * pxPerMeter / (cell * 32)));
    const resolution = Math.min(desiredCells, viewportCells);
    const extent = cell * resolution;
    if (this.target.width !== resolution) this.target.setSize(resolution, resolution);
    this.buffer.copy(buffer);
    this.projected.applyMatrix4(camera.projectionMatrix);
    this.origin.set(
      cropStart((this.projected.x * .5 + .5) * buffer.x, buffer.x, extent, cell),
      cropStart((this.projected.y * .5 + .5) * buffer.y, buffer.y, extent, cell),
    );
    this.material.uniforms.uCell.value = cell;
    this.material.uniforms.uExtent.value = extent;

    // Render the sculpture and equipment into a single depth-tested sprite
    // on the same screen grid as the rest of the scene.
    this.camera.matrix.copy(camera.matrixWorld);
    this.camera.updateMatrixWorld(true);
    this.crop.set(
      buffer.x / extent, 0, 0, (buffer.x - 2 * this.origin.x) / extent - 1,
      0, buffer.y / extent, 0, (buffer.y - 2 * this.origin.y) / extent - 1,
      0, 0, 1, 0,
      0, 0, 0, 1,
    );
    this.camera.projectionMatrix.multiplyMatrices(this.crop, camera.projectionMatrix);
    this.camera.projectionMatrixInverse.copy(this.camera.projectionMatrix).invert();

    const previousTarget = renderer.getRenderTarget();
    renderer.getClearColor(this.previousClear);
    const previousAlpha = renderer.getClearAlpha();
    const previousAutoClear = renderer.autoClear;
    this.previousBuffer.copy(bufferSizeUniform.value);
    this.previousOffset.copy(pixelOffsetUniform.value);
    bufferSizeUniform.value.set(resolution, resolution);
    pixelOffsetUniform.value.multiply(buffer).multiplyScalar(1 / extent);
    this.sculpture.update(camera, pixelOffsetUniform.value);
    pixelSizeUniform.value = 1;
    renderer.setRenderTarget(this.target);
    renderer.setClearColor(0, 0);
    renderer.autoClear = true;
    try {
      renderer.render(this.scene, this.camera);
    } finally {
      pixelSizeUniform.value = cell;
      pixelOffsetUniform.value.copy(this.previousOffset);
      bufferSizeUniform.value.copy(this.previousBuffer);
      renderer.setRenderTarget(previousTarget);
      renderer.setClearColor(this.previousClear, previousAlpha);
      renderer.autoClear = previousAutoClear;
    }
  }
}

function cropStart(center: number, viewport: number, extent: number, cell: number) {
  const lastCell = Math.ceil((viewport - extent) / cell);
  return Math.min(Math.max(0, lastCell), Math.max(0, Math.round((center - extent * .5) / cell))) * cell;
}
