import * as THREE from 'three';
import { HERO_PPU } from '../engine/character/HeroBillboardSprites';
import { PIXEL_ACTOR_LAYER } from '../engine/core/PixelActorLayer';
import { defaultTuning } from '../engine/core/Tuning';

const reference = defaultTuning();
const referencePixelsPerTexel = 1 / (2 * reference.camDistance * Math.tan(THREE.MathUtils.degToRad(reference.fov) / 2) * HERO_PPU);

export function actorPixelSize(bufferHeight: number) {
  return Math.max(1, Math.round(bufferHeight * referencePixelsPerTexel));
}

export class PixelActorRenderer {
  readonly camera = new THREE.PerspectiveCamera();
  readonly size = new THREE.Vector2();
  private readonly buffer = new THREE.Vector2();
  private readonly gridProjection = new THREE.Matrix4();
  private readonly target: THREE.WebGLRenderTarget;
  private readonly cell = { value: 1 };
  private readonly composite: THREE.Mesh;
  private readonly viewmodelComposite = new THREE.Scene();

  constructor(private readonly renderer: THREE.WebGLRenderer, scene: THREE.Scene) {
    renderer.info.autoReset = false;
    this.target = new THREE.WebGLRenderTarget(1, 1, {
      type: renderer.extensions.has('EXT_color_buffer_float') ? THREE.HalfFloatType : THREE.UnsignedByteType,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      depthTexture: new THREE.DepthTexture(1, 1, THREE.UnsignedIntType),
    });
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: this.target.texture },
        uDepth: { value: this.target.depthTexture },
        uSize: { value: this.size },
        uCell: this.cell,
      },
      vertexShader: 'void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader: /* glsl */ `
        uniform sampler2D uColor;
        uniform sampler2D uDepth;
        uniform vec2 uSize;
        uniform float uCell;
        void main() {
          vec2 uv = (floor(gl_FragCoord.xy / uCell) + 0.5) / uSize;
          vec4 color = texture2D(uColor, uv);
          if (color.a == 0.0) discard;
          gl_FragDepth = texture2D(uDepth, uv).r;
          gl_FragColor = vec4(color.rgb / color.a, color.a);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
      `,
    });
    const geometry = new THREE.PlaneGeometry(2, 2);
    this.composite = new THREE.Mesh(geometry, material);
    this.composite.frustumCulled = false;
    this.composite.renderOrder = -Infinity;
    scene.add(this.composite);
    scene.traverse(object => {
      if ((object as THREE.Light).isLight) object.layers.enable(PIXEL_ACTOR_LAYER);
    });

    const viewmodelMaterial = new THREE.ShaderMaterial({
      uniforms: material.uniforms,
      vertexShader: material.vertexShader,
      fragmentShader: material.fragmentShader,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    const viewmodelQuad = new THREE.Mesh(geometry, viewmodelMaterial);
    viewmodelQuad.frustumCulled = false;
    this.viewmodelComposite.add(viewmodelQuad);
  }

  prepare(camera: THREE.PerspectiveCamera) {
    this.renderer.getDrawingBufferSize(this.buffer);
    const cell = actorPixelSize(this.buffer.y);
    const width = Math.max(1, Math.ceil(this.buffer.x / cell));
    const height = Math.max(1, Math.ceil(this.buffer.y / cell));
    this.cell.value = cell;
    this.target.setSize(width, height);
    this.size.set(width, height);

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
