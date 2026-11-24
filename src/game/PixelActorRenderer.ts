import * as THREE from 'three';
import { HERO_PPU } from '../engine/character/HeroBillboardSprites';
import { PIXEL_ACTOR_LAYER } from '../engine/core/PixelActorLayer';
import { defaultTuning } from '../engine/core/Tuning';

const reference = defaultTuning();
const referencePixelsPerTexel = 1 / (2 * reference.camDistance * Math.tan(THREE.MathUtils.degToRad(reference.fov) / 2) * HERO_PPU);

export function actorPixelSize(bufferHeight: number) {
  return Math.max(1, Math.round(bufferHeight * referencePixelsPerTexel));
}

export const ACTOR_SAMPLES_PER_CELL = 2;

const QUAD_VERTEX = 'void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }';
const COMPOSITE_FRAGMENT = /* glsl */ `
  uniform sampler2D uColor;
  uniform sampler2D uDepth;
  uniform vec2 uSize;
  uniform float uCell;
  void main() {
    vec2 uv = (floor(gl_FragCoord.xy / uCell) + 0.5) / uSize;
    vec4 color = texture2D(uColor, uv);
    if (color.a == 0.0) discard;
    gl_FragDepth = texture2D(uDepth, uv).r;
    gl_FragColor = color;
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const RESOLVE_FRAGMENT = /* glsl */ `
  uniform sampler2D uColor;
  uniform sampler2D uDepth;
  uniform vec2 uSize;
  uniform float uCell;
  #ifdef SOLID_ACTORS
    uniform sampler2D uPrevious;
    uniform bool uHasPrevious;
  #endif

  bool sameColor(vec3 a, vec3 b) {
    return all(lessThanEqual(abs(a - b), vec3(0.0001)));
  }

  bool sameOpaqueSample(vec4 a, vec4 b) {
    return a.a == 1.0 && b.a == 1.0 && sameColor(a.rgb, b.rgb);
  }

  void consider(vec4 sampleColor, vec2 uv, vec3 average, vec4 previous,
                inout float bestError, inout vec3 chosenColor, inout vec2 chosenUv) {
    if (sampleColor.a == 0.0) return;
    vec3 color = sampleColor.rgb / sampleColor.a;
    vec3 delta = color - average;
    float error = dot(delta, delta);
    // A cor anterior precisa estar entre as amostras deste quadro.
    if (previous.a > 0.0 && sameColor(color, previous.rgb)) error = -1.0;
    if (error + 0.000001 < bestError) {
      bestError = error;
      chosenColor = color;
      chosenUv = uv;
    }
  }

  void main() {
    vec2 cell = floor(gl_FragCoord.xy / uCell);
    vec2 step = 0.5 / uSize;
    vec2 a = (cell + 0.25) / uSize;
    vec2 b = a + vec2(step.x, 0.0);
    vec2 c = a + vec2(0.0, step.y);
    vec2 d = a + step;
    vec4 ca = texture2D(uColor, a);
    vec4 cb = texture2D(uColor, b);
    vec4 cc = texture2D(uColor, c);
    vec4 cd = texture2D(uColor, d);
    vec4 total = ca + cb + cc + cd;
    vec4 previous = vec4(0.0);
    #ifdef SOLID_ACTORS
      if (total.a < 2.0) discard;
      if (uHasPrevious) previous = texture2D(uPrevious, (cell + 0.5) / uSize);
      // Três amostras iguais já indicam que o detalhe avançou para a célula.
      if (previous.a > 0.0 && total.a >= 3.0) {
        bool ab = sameOpaqueSample(ca, cb);
        bool ac = sameOpaqueSample(ca, cc);
        bool ad = sameOpaqueSample(ca, cd);
        bool bcd = sameOpaqueSample(cb, cc) && sameOpaqueSample(cb, cd);
        if ((ab && (ac || ad)) || (ac && ad) || bcd) previous.a = 0.0;
      }
    #else
      if (total.a == 0.0) discard;
    #endif
    vec3 average = total.rgb / total.a;
    vec3 chosenColor = vec3(0.0);
    vec2 chosenUv = a;
    float bestError = 1e20;
    consider(ca, a, average, previous, bestError, chosenColor, chosenUv);
    consider(cb, b, average, previous, bestError, chosenColor, chosenUv);
    consider(cc, c, average, previous, bestError, chosenColor, chosenUv);
    consider(cd, d, average, previous, bestError, chosenColor, chosenUv);
    #ifdef SOLID_ACTORS
      gl_FragDepth = texture2D(uDepth, chosenUv).r;
      gl_FragColor = vec4(chosenColor, 1.0);
    #else
      gl_FragColor = vec4(chosenColor, total.a * 0.25);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    #endif
  }
`;

export class PixelActorRenderer {
  readonly camera = new THREE.PerspectiveCamera();
  readonly size = new THREE.Vector2();
  readonly sampleSize = new THREE.Vector2();
  private readonly buffer = new THREE.Vector2();
  private readonly gridProjection = new THREE.Matrix4();
  private readonly target: THREE.WebGLRenderTarget;
  private readonly cell = { value: 1 };
  private readonly history: [THREE.WebGLRenderTarget, THREE.WebGLRenderTarget];
  private readonly resolveScene = new THREE.Scene();
  private readonly resolveMaterial: THREE.ShaderMaterial;
  private readonly compositeMaterial: THREE.ShaderMaterial;
  private readonly viewmodelComposite = new THREE.Scene();
  private historyIndex = 0;
  private hasHistory = false;

  constructor(private readonly renderer: THREE.WebGLRenderer, scene: THREE.Scene) {
    renderer.info.autoReset = false;
    const type = renderer.extensions.has('EXT_color_buffer_float') ? THREE.HalfFloatType : THREE.UnsignedByteType;
    const makeTarget = () => new THREE.WebGLRenderTarget(1, 1, {
      type,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      depthTexture: new THREE.DepthTexture(1, 1, THREE.UnsignedIntType),
    });
    this.target = makeTarget();
    this.history = [makeTarget(), makeTarget()];
    const geometry = new THREE.PlaneGeometry(2, 2);
    const addQuad = (destination: THREE.Scene, material: THREE.ShaderMaterial) => {
      const quad = new THREE.Mesh(geometry, material);
      quad.frustumCulled = false;
      quad.renderOrder = -Infinity;
      destination.add(quad);
    };
    const source = {
      uColor: { value: this.target.texture },
      uDepth: { value: this.target.depthTexture },
      uSize: { value: this.size },
      uCell: this.cell,
    };
    this.resolveMaterial = new THREE.ShaderMaterial({
      uniforms: {
        ...source,
        uCell: { value: 1 },
        uPrevious: { value: this.history[0].texture },
        uHasPrevious: { value: false },
      },
      defines: { SOLID_ACTORS: 1 },
      vertexShader: QUAD_VERTEX,
      fragmentShader: RESOLVE_FRAGMENT,
      toneMapped: false,
    });
    addQuad(this.resolveScene, this.resolveMaterial);
    this.compositeMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: this.history[0].texture },
        uDepth: { value: this.history[0].depthTexture },
        uSize: { value: this.size },
        uCell: this.cell,
      },
      vertexShader: QUAD_VERTEX,
      fragmentShader: COMPOSITE_FRAGMENT,
    });
    addQuad(scene, this.compositeMaterial);
    scene.traverse(object => {
      if ((object as THREE.Light).isLight) object.layers.enable(PIXEL_ACTOR_LAYER);
    });

    addQuad(this.viewmodelComposite, new THREE.ShaderMaterial({
      uniforms: source,
      vertexShader: QUAD_VERTEX,
      fragmentShader: RESOLVE_FRAGMENT,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    }));
  }

  prepare(camera: THREE.PerspectiveCamera) {
    this.renderer.getDrawingBufferSize(this.buffer);
    const cell = actorPixelSize(this.buffer.y);
    const width = Math.max(1, Math.ceil(this.buffer.x / cell));
    const height = Math.max(1, Math.ceil(this.buffer.y / cell));
    if (this.size.x !== width || this.size.y !== height) {
      for (const target of this.history) target.setSize(width, height);
      this.hasHistory = false;
    }
    this.cell.value = cell;
    this.size.set(width, height);
    this.sampleSize.copy(this.size).multiplyScalar(ACTOR_SAMPLES_PER_CELL);
    this.target.setSize(this.sampleSize.x, this.sampleSize.y);

    // A última célula pode ficar parcialmente fora da tela sem mudar o tamanho de nenhuma outra.
    const x = this.buffer.x / (width * cell);
    const y = this.buffer.y / (height * cell);
    this.gridProjection.set(x, 0, 0, x - 1, 0, y, 0, y - 1, 0, 0, 1, 0, 0, 0, 0, 1);
    this.camera.copy(camera, false);
    this.camera.projectionMatrix.premultiply(this.gridProjection);
    this.camera.projectionMatrixInverse.copy(this.camera.projectionMatrix).invert();
  }

  render(scene: THREE.Scene, camera: THREE.PerspectiveCamera, viewmodel?: THREE.Scene) {
    const renderer = this.renderer;
    renderer.info.reset();
    this.camera.layers.set(PIXEL_ACTOR_LAYER);
    this.renderActors(scene);
    this.resolveActors(camera);
    // O quad escreve a profundidade dos seres antes de desenhar o cenário opaco e transparente.
    renderer.render(scene, camera);
    if (viewmodel) {
      this.camera.layers.mask = camera.layers.mask;
      this.renderActors(viewmodel);
      const autoClear = renderer.autoClear;
      renderer.autoClear = false;
      try {
        renderer.render(this.viewmodelComposite, camera);
      } finally {
        renderer.autoClear = autoClear;
      }
    }
  }

  private resolveActors(camera: THREE.Camera) {
    const renderer = this.renderer;
    const clearAlpha = renderer.getClearAlpha();
    const previous = this.history[this.historyIndex];
    this.historyIndex = 1 - this.historyIndex;
    const current = this.history[this.historyIndex];
    this.resolveMaterial.uniforms.uPrevious.value = previous.texture;
    this.resolveMaterial.uniforms.uHasPrevious.value = this.hasHistory;
    renderer.setClearAlpha(0);
    renderer.setRenderTarget(current);
    try {
      renderer.render(this.resolveScene, camera);
    } finally {
      renderer.setRenderTarget(null);
      renderer.setClearAlpha(clearAlpha);
    }
    this.hasHistory = true;
    this.compositeMaterial.uniforms.uColor.value = current.texture;
    this.compositeMaterial.uniforms.uDepth.value = current.depthTexture;
  }

  private renderActors(scene: THREE.Scene) {
    const renderer = this.renderer;
    const background = scene.background;
    const clearAlpha = renderer.getClearAlpha();
    const updateShadows = renderer.shadowMap.autoUpdate;
    scene.background = null;
    renderer.setClearAlpha(0);
    renderer.shadowMap.autoUpdate = false;
    renderer.setRenderTarget(this.target);
    try {
      renderer.render(scene, this.camera);
    } finally {
      renderer.setRenderTarget(null);
      renderer.shadowMap.autoUpdate = updateShadows;
      renderer.setClearAlpha(clearAlpha);
      scene.background = background;
    }
  }
}
