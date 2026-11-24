import { bendAnimal, quantizeTurnPose, type AnimalTurnPose, type animalTurnProfile } from './AnimalTurnPose';
import { registerAnimalSpritePack, getResolvedAnimalView, ensureAnimalSpriteView, getAnimalDensityTexture, getAnimalTurnTexture, isAnimalLocomotionPack, animalRestPack } from './AnimalSpriteCache';
import { AnimalMotionAnimation } from './AnimalMotionAnimation';
import { AnimalViewAngles } from './AnimalViewAngles';
import { AnimalTurnMotion } from './AnimalTurnMotion';
import { steerAnimalLocomotion } from './AnimalLocomotion';
import { keepAnimalAboveGround } from './AnimalGrounding';
import { sampleAnimalCycle } from './AnimalAnimation';
import * as THREE from 'three';
import { actorScreenPixelSize, actorSpriteResolution } from '../character/ActorPixelGrid';
import type { GameContext } from '../core/Context';
import type { Damageable, HitInfo, HitResult, Hurtbox, Team } from '../combat/types';
import { emptyResult, newId } from '../combat/types';
import type { EnemyTarget } from './Enemy';
import { CharacterMotor } from '../physics/CharacterMotor';
import { damp, rand } from '../core/math';

export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
export const angleDiff = (a: number, b: number) => Math.atan2(Math.sin(b - a), Math.cos(b - a));

export const ANIMAL_PPU = 38;

/** Material 3D invisível na câmera principal, mas 100% sólido no shadow map (sombra projetada só pelo Sol). */
export const SHADOW_ONLY_MAT = new THREE.MeshBasicMaterial({
  colorWrite: false,
  depthWrite: false,
  side: THREE.DoubleSide,
});

let contactShadowTex: THREE.CanvasTexture | null = null;
const CONTACT_SHADOW_GEO = new THREE.PlaneGeometry(1, 1);
CONTACT_SHADOW_GEO.rotateX(-Math.PI / 2);

/** Cria uma sombra de contato radial suave colada no chão (ancora visualmente os pés/patas). */
export function createContactShadow(radiusX: number, radiusZ: number): THREE.Mesh {
  if (!contactShadowTex) {
    const c = document.createElement('canvas');
    c.width = 64; c.height = 64;
    const ctx = c.getContext('2d')!;
    const g = ctx.createRadialGradient(32, 32, 4, 32, 32, 30);
    g.addColorStop(0, 'rgba(10, 18, 12, 0.34)');
    g.addColorStop(0.55, 'rgba(10, 18, 12, 0.16)');
    g.addColorStop(1, 'rgba(10, 18, 12, 0.0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    contactShadowTex = new THREE.CanvasTexture(c);
  }
  const mat = new THREE.MeshBasicMaterial({
    map: contactShadowTex,
    transparent: true,
    depthWrite: false,
  });
  const m = new THREE.Mesh(CONTACT_SHADOW_GEO, mat);
  m.scale.set(radiusX * 2, 1, radiusZ * 2);
  m.position.y = 0.016;
  m.renderOrder = 1;
  return m;
}

const DEFAULT_SUN_DIR = new THREE.Vector3(-14, 24, 10).normalize();
const cachedSunDir = new THREE.Vector3();
let sunCachedForScene: THREE.Scene | null = null;

/** Retorna o vetor unitário apontando DO mundo PARA o Sol (DirectionalLight com castShadow). */
export function getSunDir(scene: THREE.Scene, out: THREE.Vector3): THREE.Vector3 {
  if (sunCachedForScene !== scene) {
    sunCachedForScene = scene;
    cachedSunDir.copy(DEFAULT_SUN_DIR);
    for (const child of scene.children) {
      if ((child as THREE.DirectionalLight).isDirectionalLight && child.castShadow) {
        const dl = child as THREE.DirectionalLight;
        cachedSunDir.subVectors(dl.position, dl.target.position).normalize();
        break;
      }
    }
  }
  return out.copy(cachedSunDir);
}

const SUN_SHADOW_DEPTH_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const SUN_SHADOW_DEPTH_FRAG = /* glsl */ `
#include <packing>
uniform sampler2D uMap;
varying vec2 vUv;
void main() {
  if (texture2D(uMap, vUv).a < 0.5) discard;
  gl_FragColor = packDepthToRGBA(gl_FragCoord.z);
}
`;

/**
 * Cria um plano de sombra invisível para a câmera principal que sempre encara o Sol
 * e projeta a silhueta pixel-art exata do sprite visto pelo Sol (alfa descartado em GLSL).
 */
export function createSunShadowBillboard(
  geometry: THREE.PlaneGeometry,
  initialTex: THREE.CanvasTexture,
  name: string,
): { mesh: THREE.Mesh; depthMat: THREE.ShaderMaterial } {
  const depthMat = new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: initialTex },
    },
    vertexShader: SUN_SHADOW_DEPTH_VERT,
    fragmentShader: SUN_SHADOW_DEPTH_FRAG,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geometry, SHADOW_ONLY_MAT);
  mesh.name = `${name}_sunShadow`;
  mesh.castShadow = true;
  mesh.receiveShadow = false;
  mesh.customDepthMaterial = depthMat;
  mesh.frustumCulled = false;
  return { mesh, depthMat };
}

const _sUp = new THREE.Vector3(0, 1, 0);
const _sX = new THREE.Vector3();
const _sY = new THREE.Vector3();
const _sTmp = new THREE.Vector3();
const _sMat = new THREE.Matrix4();

// Orçamento de tempo por frame para baking lazy de sprites SDF (mantém 60 FPS lisos sem travar animações)
let bakeMsThisFrame = 0;
let bakeCountThisFrame = 0;
const MAX_BAKE_MS_PER_FRAME = 8.0;

export function beginBakeFrame() {
  bakeMsThisFrame = 0;
  bakeCountThisFrame = 0;
}

export function hasBakeBudget(): boolean {
  return bakeCountThisFrame === 0 || bakeMsThisFrame < MAX_BAKE_MS_PER_FRAME;
}

export function recordBakeCost(startMs: number) {
  const elapsed = performance.now() - startMs;
  bakeMsThisFrame += elapsed;
  bakeCountThisFrame++;
}

/**
 * Busca no cache uma vista vizinha muito próxima (±1 passo de ângulo) quando o orçamento do frame acabou.
 * Nunca retorna ângulos distantes (para evitar o animal virar bruscamente de frente/costas por 1 frame).
 */
export function findNearestCachedView(
  cache: Map<number, THREE.CanvasTexture>,
  t: number,
  d: number,
  maxT: number,
  maxD: number,
): THREE.CanvasTexture | null {
  if (cache.size === 0) return null;
  let best: THREE.CanvasTexture | null = null;
  let bestDist = 9999;
  for (let dt = -1; dt <= 1; dt++) {
    const nt = t + dt;
    if (nt < 0 || nt > maxT) continue;
    for (let dd = -1; dd <= 1; dd++) {
      const nd = d + dd;
      if (nd < 0 || nd > maxD) continue;
      const dist = Math.abs(dd) * 2 + Math.abs(dt) * 3;
      if (dist === 0 || dist >= bestDist) continue;
      const hit = cache.get(nt * 32 + nd);
      if (hit) {
        best = hit;
        bestDist = dist;
      }
    }
  }
  return best;
}

/** Orienta e atualiza o sprite do plano de sombra para o ângulo exato da câmera do Sol. */
export function updateSunShadowBillboard(
  shadowMesh: THREE.Mesh,
  depthMat: THREE.ShaderMaterial,
  pack: CreatureViewPack,
  worldPos: THREE.Vector3,
  centerY: number,
  worldW: number,
  worldH: number,
  fwd: THREE.Vector3,
  left: THREE.Vector3,
  up: THREE.Vector3,
  sunDir: THREE.Vector3,
) {
  const upDot = sunDir.dot(up);
  const fwdDot = sunDir.dot(fwd);
  const leftDot = sunDir.dot(left);

  // Sombra usa 8 direções horizontais (passo 45°, suavizado pelo PCFShadowMap) no pitch exato do Sol
  const sunPitchDeg = Math.asin(clamp(upDot, -1, 1)) * (180 / Math.PI);
  const isPolar = Math.abs(upDot) > 0.96;
  let tex: THREE.CanvasTexture | null = null;
  let flipX = false;
  if (isPolar) {
    tex = upDot > 0 ? pack.getTop() : pack.getBottom();
  } else {
    const absDeg = Math.abs(Math.atan2(leftDot, fwdDot)) * (180 / Math.PI);
    const maxDir = CREATURE_YAWS.length - 1; // 8
    const dirIdx = Math.min(maxDir, Math.round(absDeg / 22.5));
    const opposite = dirIdx > 0 && dirIdx < maxDir && leftDot > 0;
    flipX = opposite && !pack.asymmetric;
    tex = pack.getSunView(pack.asymmetric && opposite ? 16 - dirIdx : dirIdx, sunPitchDeg, true);
  }
  if (tex && depthMat.uniforms.uMap.value !== tex) {
    depthMat.uniforms.uMap.value = tex;
  }

  // Base ortogonal perpendicular ao raio do Sol (sunDir = +Z local do plano)
  if (isPolar) {
    _sTmp.copy(fwd).addScaledVector(sunDir, -fwd.dot(sunDir));
    if (_sTmp.lengthSq() > 1e-4) _sY.copy(_sTmp).normalize();
    else _sY.set(0, 0, 1);
  } else {
    _sY.copy(_sUp).addScaledVector(sunDir, -_sUp.dot(sunDir));
    if (_sY.lengthSq() > 1e-4) _sY.normalize();
    else _sY.set(0, 0, 1);
  }
  _sX.crossVectors(_sY, sunDir).normalize();
  _sMat.makeBasis(_sX, _sY, sunDir);
  shadowMesh.quaternion.setFromRotationMatrix(_sMat);

  // Posiciona exatamente no centro 3D real do animal (worldPos.x, centerY, worldPos.z)
  // deslocado apenas ao longo de +sunDir (paralelo aos raios ortográficos do Sol):
  // cada pata projeta exatamente na sua posição 3D real no chão e o plano nunca corta em y < 0!
  const liftAlongSun = worldH * 0.75;
  shadowMesh.position.set(
    worldPos.x + sunDir.x * liftAlongSun,
    centerY + sunDir.y * liftAlongSun,
    worldPos.z + sunDir.z * liftAlongSun,
  );
  shadowMesh.scale.set(flipX ? -worldW : worldW, worldH, 1);
}

export const CREATURE_VERTEX_SHADER = /* glsl */ `
uniform vec2 uTexelSize;
varying vec2 vUv;

void main() {
  vec2 pad = vec2(1.0) + 2.0 * uTexelSize;
  vec3 pos = vec3(position.xy * pad, position.z);
  vUv = (uv - 0.5) * pad + 0.5;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

export const CREATURE_FRAGMENT_SHADER = /* glsl */ `
uniform sampler2D uMap;
uniform float uPixelSize;
uniform vec2 uGridOrigin;
uniform vec3 uFlashColor;
uniform float uFlashAmount;
varying vec2 vUv;

void main() {
  float pixelSize = max(1.0, floor(uPixelSize + 0.5));
  vec2 origin = floor(uGridOrigin + 0.5);
  vec2 cellCenter = floor((gl_FragCoord.xy - origin) / pixelSize) * pixelSize + origin + 0.5 * pixelSize;
  vec2 delta = cellCenter - gl_FragCoord.xy;
  vec2 snappedUv = vUv + dFdx(vUv) * delta.x + dFdy(vUv) * delta.y;

  if (snappedUv.x < 0.0 || snappedUv.x > 1.0 || snappedUv.y < 0.0 || snappedUv.y > 1.0) discard;

  vec4 texel = texture2D(uMap, snappedUv);
  if (texel.a < 0.5) discard;

  vec3 col = texel.rgb;
  if (uFlashAmount > 0.001) {
    col = mix(col, uFlashColor * 1.4, uFlashAmount * 0.72);
  }

  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export function sdEllipsoid(
  px: number, py: number, pz: number,
  cx: number, cy: number, cz: number,
  rx: number, ry: number, rz: number,
) {
  const x = (px - cx) / rx, y = (py - cy) / ry, z = (pz - cz) / rz;
  const k0 = Math.sqrt(x * x + y * y + z * z);
  if (k0 < 1e-6) return -Math.min(rx, ry, rz);
  const a = x / rx, b = y / ry, c = z / rz;
  const k1 = Math.sqrt(a * a + b * b + c * c);
  return (k0 * (k0 - 1)) / k1;
}

export function sdCapsule(
  px: number, py: number, pz: number,
  ax: number, ay: number, az: number,
  bx: number, by: number, bz: number,
  rA: number, rB: number,
) {
  const pax = px - ax, pay = py - ay, paz = pz - az;
  const bax = bx - ax, bay = by - ay, baz = bz - az;
  const ba2 = bax * bax + bay * bay + baz * baz;
  const h = clamp((pax * bax + pay * bay + paz * baz) / (ba2 || 1), 0, 1);
  const dx = pax - bax * h, dy = pay - bay * h, dz = paz - baz * h;
  return Math.sqrt(dx * dx + dy * dy + dz * dz) - (rA + (rB - rA) * h);
}

export function smin(a: number, b: number, k: number) {
  const h = clamp(0.5 + (0.5 * (b - a)) / k, 0, 1);
  return b * (1 - h) + a * h - k * h * (1 - h);
}

export type SdfEvaluator = (x: number, y: number, z: number) => { d: number; mat: string };
export type ColorShaper = (mat: string, shade: number, x: number, y: number, z: number) => string;

export function raymarchCreatureView(
  pw: number,
  ph: number,
  ex: number,
  ey: number,
  yawDeg: number,
  pitchDeg: number,
  rollFwdTop: boolean,
  pal: Record<string, [number, number, number]>,
  evalFn: SdfEvaluator,
  shadeFn: ColorShaper,
  silhouetteOnly = false,
  detailScale = 1,
): THREE.CanvasTexture {
  const t0 = performance.now();
  const yaw = (yawDeg * Math.PI) / 180;
  const pitch = (pitchDeg * Math.PI) / 180;
  const cp = Math.cos(pitch), sp = Math.sin(pitch);
  const sx = -Math.sin(yaw) * cp;
  const sy = sp;
  const sz = Math.cos(yaw) * cp;
  const rdx = -sx, rdy = -sy, rdz = -sz;

  let ux: number, uy: number, uz: number;
  if (rollFwdTop) {
    ux = 0; uy = 0; uz = 1;
  } else {
    ux = 0; uy = 1; uz = 0;
  }
  const ud = ux * sx + uy * sy + uz * sz;
  ux -= sx * ud; uy -= sy * ud; uz -= sz * ud;
  const ul = Math.sqrt(ux * ux + uy * uy + uz * uz) || 1;
  ux /= ul; uy /= ul; uz /= ul;
  const rx = uy * sz - uz * sy;
  const ry = uz * sx - ux * sz;
  const rz = ux * sy - uy * sx;

  // Intervalo apertado de raymarch + early-out pela esfera envolvente (~4-6x mais rápido)
  const boundR = Math.max(ex, ey) * 1.25;
  const boundR2 = boundR * boundR;
  const tStart = Math.max(0, 3.0 - boundR);
  const tEnd = 3.0 + boundR;

  const grid: string[] = new Array(pw * ph).fill('.');
  const Lx = -0.35, Ly = 0.78, Lz = 0.52;
  const maxSteps = silhouetteOnly ? 14 : detailScale < 1 ? 24 : 18;
  const hitEps = (silhouetteOnly ? .022 : .018) * detailScale;
  const du = (2 * ex) / pw;
  const dv = (2 * ey) / ph;
  const skipDist = Math.max(du, dv) * 2.5;
  const skipMask = new Uint8Array(pw * ph);

  const evalPixel = (px: number, py: number, trackSkip: boolean) => {
    const v = (0.5 - (py + 0.5) / ph) * 2 * ey;
    const u = ((px + 0.5) / pw - 0.5) * 2 * ex;
    if (u * u + v * v > boundR2) {
      if (trackSkip && px + 1 < pw && py + 1 < ph) {
        const ro = py * pw + px;
        skipMask[ro + 1] = 1;
        skipMask[ro + pw] = 1;
        skipMask[ro + pw + 1] = 1;
      }
      return;
    }

    const ox = sx * 3.0 + rx * u + ux * v;
    const oy = sy * 3.0 + ry * u + uy * v;
    const oz = sz * 3.0 + rz * u + uz * v;

    let t = tStart;
    let hit = false;
    let hitMat = 'body';
    let hitD = 0;
    let minD = 999;
    let hx = 0, hy = 0, hz = 0;
    for (let i = 0; i < maxSteps; i++) {
      hx = ox + rdx * t;
      hy = oy + rdy * t;
      hz = oz + rdz * t;
      const r = evalFn(hx, hy, hz);
      if (r.d < minD) minD = r.d;
      if (r.d < hitEps) {
        hit = true;
        hitMat = r.mat;
        hitD = r.d;
        break;
      }
      t += r.d;
      if (t > tEnd) break;
    }
    if (!hit) {
      if (trackSkip && minD > skipDist && px + 1 < pw && py + 1 < ph) {
        const ro = py * pw + px;
        skipMask[ro + 1] = 1;
        skipMask[ro + pw] = 1;
        skipMask[ro + pw + 1] = 1;
      }
      return;
    }

    const rowOff = py * pw;
    if (silhouetteOnly) {
      grid[rowOff + px] = 'k';
      return;
    }

    const e = .02 * detailScale;
    const nx = evalFn(hx + e, hy, hz).d - hitD;
    const ny = evalFn(hx, hy + e, hz).d - hitD;
    const nz = evalFn(hx, hy, hz + e).d - hitD;
    const nl = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
    const ndl = (nx / nl) * Lx + (ny / nl) * Ly + (nz / nl) * Lz;
    const shade = clamp(ndl * 0.52 + 0.52, 0, 1);

    grid[rowOff + px] = shadeFn(hitMat, shade, hx, hy, hz);
  };

  for (let py = 0; py < ph; py += 2) {
    for (let px = 0; px < pw; px += 2) {
      evalPixel(px, py, true);
    }
  }
  for (let py = 0; py < ph; py++) {
    const ro = py * pw;
    const evenY = (py & 1) === 0;
    for (let px = 0; px < pw; px++) {
      if (evenY && (px & 1) === 0) continue;
      if (skipMask[ro + px]) continue;
      evalPixel(px, py, false);
    }
  }

  // Contorno de 1px nítido na silhueta (pula em silhouetteOnly de sombra)
  const out = silhouetteOnly ? grid : grid.slice();
  if (!silhouetteOnly) {
    for (let y = 0; y < ph; y++) {
      const ro = y * pw;
      for (let x = 0; x < pw; x++) {
        if (grid[ro + x] !== '.') continue;
        if (
          (x > 0 && grid[ro + x - 1] !== '.') ||
          (x < pw - 1 && grid[ro + x + 1] !== '.') ||
          (y > 0 && grid[ro - pw + x] !== '.') ||
          (y < ph - 1 && grid[ro + pw + x] !== '.')
        ) {
          out[ro + x] = 'k';
        }
      }
    }
  }

  const data = new Uint8Array(pw * ph * 4);
  for (let i = 0; i < out.length; i++) {
    const ch = out[i];
    if (ch === '.') continue;
    const rgb = pal[ch] ?? pal.k;
    const idx = i * 4;
    data[idx] = rgb[0];
    data[idx + 1] = rgb[1];
    data[idx + 2] = rgb[2];
    data[idx + 3] = 255;
  }
  const tex = new THREE.DataTexture(data, pw, ph, THREE.RGBAFormat);
  tex.flipY = true;
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  recordBakeCost(t0);
  return tex as unknown as THREE.CanvasTexture;
}

/** 16 direções horizontais (9 ângulos únicos de 0° a 180° a cada 22.5° + flipX). */
export const CREATURE_YAWS = [
  0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180,
] as const;
/** 9 faixas verticais não-polares (+80° a -80° a cada 20°) + topo (+88°) e baixo (-88°). */
export const CREATURE_PITCHES = [
  80, 60, 40, 20, 0, -20, -40, -60, -80,
] as const;

/**
 * Pacote de 155 vistas únicas (= 290 direções 3D com flipX) com cache lazy por vista:
 * só faz raymarch do ângulo exato que está sendo visto no momento (com orçamento por frame).
 */
export interface CreatureViewPack {
  readonly asymmetric?: boolean;
  renderView?(tier: number, direction: number, width: number, height: number, turn?: AnimalTurnPose, profile?: ReturnType<typeof animalTurnProfile>): THREE.CanvasTexture;
  getTop(): THREE.CanvasTexture;
  getBottom(): THREE.CanvasTexture;
  getView(tierIdx: number, dirIdx: number, budgetAware?: boolean, allowNullOnBudget?: boolean): THREE.CanvasTexture | null;
  /** Vista renderizada exatamente no pitch do Sol para que cada pata coincida com sua sombra no chão. */
  getSunView(dirIdx: number, sunPitchDeg: number, budgetAware?: boolean): THREE.CanvasTexture | null;
}

export function build27Pack(
  pw: number, ph: number, ex: number, ey: number,
  pal: Record<string, [number, number, number]>,
  evalFn: SdfEvaluator,
  shadeFn: ColorShaper,
  asymmetric = false,
): CreatureViewPack {
  // Vistas leves para a distância e para enquanto o worker prepara o sprite na escala do mundo.
  const bw = Math.min(96, Math.max(8, pw));
  const bh = Math.min(96, Math.max(8, ph));
  let topTex: THREE.CanvasTexture | null = null;
  let bottomTex: THREE.CanvasTexture | null = null;
  const cache = new Map<number, THREE.CanvasTexture>();
  const sunCache = new Map<number, THREE.CanvasTexture>();

  const maxDirection = asymmetric ? 15 : CREATURE_YAWS.length - 1;
  const yawDegrees = (direction: number) => direction <= 8 ? direction * 22.5 : (direction - 16) * 22.5;
  return {
    asymmetric,
    renderView(tier, direction, width, height, turn, profile) {
      const polar = tier >= CREATURE_PITCHES.length;
      const pitch = polar ? (tier === CREATURE_PITCHES.length ? 88 : -88) : CREATURE_PITCHES[tier];
      const sculpture = turn && profile ? bendAnimal(evalFn, ex, ey, profile, turn) : evalFn;
      return raymarchCreatureView(width, height, ex, ey, yawDegrees(direction), pitch, polar, pal, sculpture, shadeFn);
    },
    getTop() {
      if (!topTex) topTex = raymarchCreatureView(bw, bh, ex, ey, 0, 88, true, pal, evalFn, shadeFn);
      return topTex;
    },
    getBottom() {
      if (!bottomTex) bottomTex = raymarchCreatureView(bw, bh, ex, ey, 0, -88, true, pal, evalFn, shadeFn);
      return bottomTex;
    },
    getView(tierIdx: number, dirIdx: number, budgetAware = false, allowNullOnBudget = false) {
      const maxT = CREATURE_PITCHES.length - 1;
      const maxD = maxDirection;
      const t = clamp(tierIdx, 0, maxT);
      const d = clamp(dirIdx, 0, maxD);
      const key = t * 32 + d;
      let tex = cache.get(key);
      if (!tex) {
        // A pose visível tem de estar pronta neste frame; não reutilizar uma pose antiga.
        tex = raymarchCreatureView(bw, bh, ex, ey, yawDegrees(d), CREATURE_PITCHES[t], false, pal, evalFn, shadeFn);
        cache.set(key, tex);
      }
      return tex;
    },
    getSunView(dirIdx: number, sunPitchDeg: number, budgetAware = false) {
      const maxD = maxDirection;
      const d = clamp(dirIdx, 0, maxD);
      const pKey = Math.round(sunPitchDeg);
      const key = pKey * 32 + d;
      let tex = sunCache.get(key);
      if (!tex) {
        if (budgetAware && (bakeCountThisFrame > 0 || !hasBakeBudget())) {
          for (let dd = 1; dd <= 8; dd++) {
            const h1 = d - dd >= 0 ? sunCache.get(pKey * 32 + (d - dd)) : undefined;
            if (h1) return h1;
            const h2 = d + dd <= maxD ? sunCache.get(pKey * 32 + (d + dd)) : undefined;
            if (h2) return h2;
          }
          return sunCache.values().next().value ?? null;
        }
        // Sombra do Sol só precisa da silhueta alfa (4x mais rápido que raymarch colorido!)
        tex = raymarchCreatureView(bw, bh, ex, ey, yawDegrees(d), sunPitchDeg, false, pal, evalFn, shadeFn, true);
        sunCache.set(key, tex);
      }
      return tex;
    },
  };
}

/** Seleciona a textura correta do pacote de 32 direções horizontais (11.25°) × 19 alturas verticais (10°). */
export function pick27View(
  pack: CreatureViewPack,
  upDot: number,
  fwdDot: number,
  leftDot: number,
  budgetAware = false,
  allowNullOnBudget = false,
  angleState?: AnimalViewAngles,
  dt = 0,
  cameraChanged = false,
): { tex: THREE.CanvasTexture | null; flipX: boolean; isPolar: boolean } {
  const selected = (angleState ?? new AnimalViewAngles()).select(upDot, fwdDot, leftDot);
  if (selected.pole > 0) return { tex: pack.getTop(), flipX: false, isPolar: true };
  if (selected.pole < 0) return { tex: pack.getBottom(), flipX: false, isPolar: true };
  let planned = angleState?.plan(selected, dt, cameraChanged) ?? selected;
  const spriteDirection = (view: typeof planned) =>
    pack.asymmetric && view.mirrored && view.direction > 0 && view.direction < 8 ? 16 - view.direction : view.direction;
  if (angleState) {
    const ready = ensureAnimalSpriteView(pack, planned.tier, spriteDirection(planned));
    const ahead = angleState.stepFrom(planned, selected);
    ensureAnimalSpriteView(pack, ahead.tier, spriteDirection(ahead), false);
    if (!ready && angleState.current) planned = angleState.current;
  }
  const direction = spriteDirection(planned);
  const tex = pack.getView(planned.tier, direction, budgetAware, allowNullOnBudget);
  const resolved = getResolvedAnimalView(pack) ?? { tier: planned.tier, direction };
  const actual = pack.asymmetric && resolved.direction > 8
    ? { tier: resolved.tier, direction: 16 - resolved.direction }
    : resolved;
  if (tex && (angleState?.current || (actual.tier === planned.tier && actual.direction === planned.direction))) {
    angleState?.commit({ ...actual, mirrored: pack.asymmetric ? resolved.direction > 8 : planned.mirrored });
  }
  return { tex, flipX: !pack.asymmetric && actual.direction > 0 && actual.direction < 8 && planned.mirrored, isPolar: false };
}

// ============================================================================
// 1. PEIXE TROPICAL (Fish) — 24×16 @ 38 PPU (0.63m × 0.42m)
// ============================================================================
export type FishPoseName =
  | 'swim0' | 'swim1' | 'swim2' | 'swim3' | 'swim4' | 'swim5'
  | 'dart0' | 'dart1' | 'dart2' | 'dart3'
  | 'flop0' | 'flop1' | 'flop2' | 'flop3';

export const FISH_PW = 24;
export const FISH_PH = 16;
export const FISH_W = FISH_PW / ANIMAL_PPU;
export const FISH_H = FISH_PH / ANIMAL_PPU;

const FISH_PAL: Record<string, [number, number, number]> = {
  k: [0x14, 0x1a, 0x26], // contorno / pupila
  W: [0xf7, 0xfb, 0xff], // brilho do olho / barriga clara
  b0: [0x17, 0x4b, 0x7a], // dorso azul profundo
  b1: [0x22, 0x77, 0xb0], // lateral azul-turquesa
  b2: [0x45, 0xb5, 0xd9], // escamas ciano brilhante
  b3: [0x8c, 0xdf, 0xf0], // reflexo claro
  f0: [0xc4, 0x56, 0x1d], // nadadeiras laranja escuro
  f1: [0xeb, 0x86, 0x26], // nadadeiras dourado-laranja
  f2: [0xff, 0xc3, 0x4d], // ponta dourada
  s0: [0xdf, 0xec, 0xf2], // barriga prateada
};

interface FishPoseParams {
  tailSwing: number;  // dobra lateral X da cauda
  bodyCurve: number;  // leve curva S do tronco
  finSpread: number;  // abertura das nadadeiras peitorais
  finSweep: number;   // remada ântero-posterior das peitorais
  archY: number;      // arco vertical (salto/debate)
}

const FISH_POSES: Record<FishPoseName, FishPoseParams> = {
  // 6-frame smooth sinusoidal S-curve body + tail wave + fin motion
  swim0: { tailSwing: -0.14, bodyCurve:  0.00, finSpread:  0.04, finSweep:  0.05, archY:  0.00 },
  swim1: { tailSwing: -0.26, bodyCurve:  0.08, finSpread:  0.01, finSweep:  0.02, archY:  0.01 },
  swim2: { tailSwing: -0.12, bodyCurve:  0.09, finSpread: -0.02, finSweep: -0.04, archY:  0.00 },
  swim3: { tailSwing:  0.14, bodyCurve:  0.00, finSpread:  0.04, finSweep: -0.05, archY:  0.00 },
  swim4: { tailSwing:  0.26, bodyCurve: -0.08, finSpread:  0.01, finSweep: -0.02, archY: -0.01 },
  swim5: { tailSwing:  0.12, bodyCurve: -0.09, finSpread: -0.02, finSweep:  0.04, archY:  0.00 },
  // 4-frame rapid burst
  dart0: { tailSwing: -0.22, bodyCurve:  0.07, finSpread: -0.09, finSweep: -0.08, archY:  0.05 },
  dart1: { tailSwing:  0.04, bodyCurve:  0.02, finSpread: -0.10, finSweep: -0.10, archY:  0.07 },
  dart2: { tailSwing:  0.22, bodyCurve: -0.07, finSpread: -0.09, finSweep: -0.08, archY:  0.05 },
  dart3: { tailSwing: -0.04, bodyCurve: -0.02, finSpread: -0.10, finSweep: -0.10, archY:  0.03 },
  // 4-frame splash/arcing flop
  flop0: { tailSwing: -0.36, bodyCurve:  0.17, finSpread:  0.15, finSweep:  0.08, archY:  0.16 },
  flop1: { tailSwing: -0.10, bodyCurve:  0.05, finSpread:  0.08, finSweep:  0.02, archY: -0.06 },
  flop2: { tailSwing:  0.36, bodyCurve: -0.17, finSpread:  0.15, finSweep: -0.08, archY:  0.16 },
  flop3: { tailSwing:  0.10, bodyCurve: -0.05, finSpread:  0.08, finSweep: -0.02, archY: -0.06 },
};

const FISH_SWIM_FRAMES: readonly FishPoseName[] = ['swim0', 'swim1', 'swim2', 'swim3', 'swim4', 'swim5'];
const FISH_DART_FRAMES: readonly FishPoseName[] = ['dart0', 'dart1', 'dart2', 'dart3'];
const FISH_FLOP_FRAMES: readonly FishPoseName[] = ['flop0', 'flop1', 'flop2', 'flop3'];

export type FishSpecies = 'tropical' | 'clown' | 'koi' | 'puffer' | 'angelfish';

export const FISH_SPECIES_META: Record<FishSpecies, { label: string; pw: number; ph: number; w: number; h: number }> = {
  tropical:  { label: 'Peixe Tropical', pw: 24, ph: 16, w: 24 / ANIMAL_PPU, h: 16 / ANIMAL_PPU },
  clown:     { label: 'Peixe-Palhaço',  pw: 20, ph: 14, w: 19 / ANIMAL_PPU, h: 13 / ANIMAL_PPU },
  koi:       { label: 'Carpa Koi',      pw: 28, ph: 18, w: 29 / ANIMAL_PPU, h: 18 / ANIMAL_PPU },
  puffer:    { label: 'Baiacu',         pw: 24, ph: 24, w: 22 / ANIMAL_PPU, h: 22 / ANIMAL_PPU },
  angelfish: { label: 'Peixe-Anjo',     pw: 22, ph: 26, w: 21 / ANIMAL_PPU, h: 25 / ANIMAL_PPU },
};

const CLOWN_PAL: Record<string, [number, number, number]> = {
  k: [0x14, 0x14, 0x1c],
  W: [0xfc, 0xfc, 0xff],
  w0: [0xd4, 0xd9, 0xe2],
  o0: [0xb8, 0x38, 0x10],
  o1: [0xeb, 0x5c, 0x16],
  o2: [0xff, 0x85, 0x26],
  o3: [0xff, 0xb2, 0x52],
};

const KOI_PAL: Record<string, [number, number, number]> = {
  k: [0x17, 0x17, 0x20],
  W: [0xfc, 0xfa, 0xf5],
  w0: [0xd6, 0xd0, 0xc4],
  w1: [0xeb, 0xe6, 0xdc],
  r0: [0xb0, 0x28, 0x18],
  r1: [0xe6, 0x45, 0x22],
  r2: [0xff, 0x73, 0x3b],
  g0: [0x26, 0x26, 0x30],
};

const PUFFER_PAL: Record<string, [number, number, number]> = {
  k: [0x18, 0x18, 0x1c],
  W: [0xfc, 0xfa, 0xe8],
  y0: [0x9e, 0x85, 0x36],
  y1: [0xd4, 0xb6, 0x4c],
  y2: [0xf5, 0xdc, 0x76],
  g0: [0x59, 0x6b, 0x30],
  g1: [0x82, 0x99, 0x42],
  b0: [0xd9, 0xd2, 0xb2],
};

const ANGEL_PAL: Record<string, [number, number, number]> = {
  k: [0x14, 0x18, 0x26],
  W: [0xfc, 0xfa, 0xf2],
  y0: [0xb8, 0x82, 0x14],
  y1: [0xeb, 0xb3, 0x24],
  y2: [0xff, 0xd8, 0x4d],
  n0: [0x19, 0x2d, 0x5c],
  n1: [0x2a, 0x4e, 0x8f],
  c0: [0x6e, 0xc7, 0xe8],
};

const fishCache = new Map<string, CreatureViewPack>();

 function buildFishPosePack(pose: FishPoseName, species: FishSpecies = 'tropical'): CreatureViewPack {
  const cacheKey = `${species}:${pose}`;
  let pack = fishCache.get(cacheKey);
  if (!pack) {
    const P = FISH_POSES[pose];
    const meta = FISH_SPECIES_META[species];
    const isPuffed = species === 'puffer' && (pose.startsWith('dart') || pose.startsWith('flop'));

    const evalFish: SdfEvaluator = (x, y, z) => {
      const bend = P.bodyCurve * Math.sin((z + 0.2) * 3.0);
      const bx = x - bend;
      const by = y - P.archY * (0.25 - z * z * 0.7);
      const tx = P.tailSwing;
      const pSp = P.finSpread;
      const pSw = P.finSweep;

      if (species === 'puffer') {
        // Baiacu: peixinho gordinho normal; quando inflado vira uma BOLA cheia de espinhos 3D!
        const body = isPuffed
          ? sdEllipsoid(bx, by, z, 0, 0.0, 0.02, 0.48, 0.47, 0.50)
          : sdEllipsoid(bx, by, z, 0, 0.0, 0.06, 0.28, 0.27, 0.38);
        const tailBaseZ = isPuffed ? -0.44 : -0.28;
        const tailStem = sdCapsule(bx, by, z, 0, 0.0, tailBaseZ, tx * 0.45, 0.0, tailBaseZ - 0.22, 0.10, 0.045);
        const tailFin = Math.min(
          sdCapsule(bx, by, z, tx * 0.45, 0.02, tailBaseZ - 0.20, tx * 0.80, 0.19, tailBaseZ - 0.40, 0.048, 0.026),
          sdCapsule(bx, by, z, tx * 0.45, -0.02, tailBaseZ - 0.20, tx * 0.80, -0.17, tailBaseZ - 0.38, 0.048, 0.026),
        );
        const finX = isPuffed ? 0.44 : 0.25;
        const pecL = sdCapsule(bx, by, z, -finX, -0.04, 0.06, -finX - 0.22 - pSp, -0.10, -0.06 + pSw, 0.05, 0.028);
        const pecR = sdCapsule(bx, by, z,  finX, -0.04, 0.06,  finX + 0.22 + pSp, -0.10, -0.06 + pSw, 0.05, 0.028);

        let main = smin(body, tailStem, 0.07);
        let spikes = 99;
        if (isPuffed) {
          // 14 espinhos cônicos grossos distribuídos em 3D ao redor da bola!
          const dirs: [number, number, number][] = [
            [0, 1, 0], [0, -1, 0],
            [-1, 0, 0], [1, 0, 0],
            [-0.72, 0.70, 0.08], [0.72, 0.70, 0.08],
            [-0.72, -0.70, 0.08], [0.72, -0.70, 0.08],
            [0, 0.72, 0.68], [0, -0.68, 0.70],
            [0, 0.74, -0.66], [0, -0.70, -0.68],
            [-0.68, 0.12, -0.70], [0.68, 0.12, -0.70],
          ];
          for (let i = 0; i < dirs.length; i++) {
            const [dx, dy, dz] = dirs[i];
            const sp = sdCapsule(
              bx, by, z,
              dx * 0.40, dy * 0.39, 0.02 + dz * 0.42,
              dx * 0.70, dy * 0.69, 0.02 + dz * 0.72,
              0.072, 0.022,
            );
            if (sp < spikes) spikes = sp;
          }
        }

        const fins = Math.min(tailFin, Math.min(pecL, pecR));
        const eyeX = isPuffed ? 0.26 : 0.17;
        const eyeY = isPuffed ? 0.15 : 0.09;
        const eyeZ = isPuffed ? 0.42 : 0.33;
        const eyeL = sdEllipsoid(bx, by, z, -eyeX, eyeY, eyeZ, 0.082, 0.088, 0.078);
        const eyeR = sdEllipsoid(bx, by, z,  eyeX, eyeY, eyeZ, 0.082, 0.088, 0.078);
        const eyes = Math.min(eyeL, eyeR);
        // Boquinha redonda em "o" característica do baiacu
        const mouth = sdEllipsoid(bx, by, z, 0, -0.02, isPuffed ? 0.51 : 0.43, 0.068, 0.062, 0.055);

        let d = main, mat = 'body';
        if (spikes < d) { d = spikes; mat = 'spike'; }
        if (fins < d) { d = fins; mat = 'fin'; }
        if (mouth < d) { d = mouth; mat = 'mouth'; }
        if (eyes < d) { d = eyes; mat = 'eye'; }
        return { d, mat };
      }

      if (species === 'angelfish') {
        // Peixe-Anjo: corpo alto e fino em diamante com nadadeiras dorsal/ventral gigantes!
        const body = sdEllipsoid(bx, by, z, 0, 0.0, 0.10, 0.14, 0.38, 0.42);
        const snout = sdEllipsoid(bx, by, z, 0, -0.02, 0.48, 0.10, 0.14, 0.14);
        const dorsal = sdCapsule(bx, by, z, 0, 0.28, 0.14, tx * 0.22, 0.86, -0.34, 0.09, 0.025);
        const ventral = sdCapsule(bx, by, z, 0, -0.28, 0.12, tx * 0.22, -0.84, -0.34, 0.09, 0.025);
        const tailUp = sdCapsule(bx, by, z, tx * 0.35, 0.04, -0.30, tx * 0.85, 0.26, -0.66, 0.045, 0.022);
        const tailDn = sdCapsule(bx, by, z, tx * 0.35, -0.04, -0.30, tx * 0.85, -0.26, -0.66, 0.045, 0.022);
        const main = smin(body, snout, 0.08);
        const fins = Math.min(Math.min(dorsal, ventral), Math.min(tailUp, tailDn));
        const eyeL = sdEllipsoid(bx, by, z, -0.10, 0.08, 0.38, 0.048, 0.056, 0.048);
        const eyeR = sdEllipsoid(bx, by, z,  0.10, 0.08, 0.38, 0.048, 0.056, 0.048);
        const eyes = Math.min(eyeL, eyeR);
        let d = main, mat = 'body';
        if (fins < d) { d = fins; mat = 'fin'; }
        if (eyes < d) { d = eyes; mat = 'eye'; }
        return { d, mat };
      }

      // Tropical, Palhaço e Carpa Koi (proporções ajustadas por espécie)
      const isKoi = species === 'koi';
      const isClown = species === 'clown';
      const bodyLen = isKoi ? 0.64 : isClown ? 0.48 : 0.56;
      const bodyH = isClown ? 0.30 : isKoi ? 0.25 : 0.27;
      const body = sdEllipsoid(bx, by, z, 0, 0.0, 0.12, 0.23, bodyH, bodyLen);
      const snout = sdEllipsoid(bx, by, z, 0, -0.02, 0.12 + bodyLen * 0.78, 0.15, 0.16, 0.18);
      const tailStem = sdCapsule(bx, by, z, 0, 0.0, -0.32, tx * 0.55, 0.0, -0.64, 0.14, 0.06);
      let main = smin(body, snout, 0.10);
      main = smin(main, tailStem, 0.08);

      const tailLen = isKoi ? -0.96 : -0.86;
      const tailUp = sdCapsule(bx, by, z, tx * 0.55, 0.02, -0.60, tx, isKoi ? 0.30 : 0.26, tailLen, 0.055, 0.030);
      const tailDn = sdCapsule(bx, by, z, tx * 0.55, -0.02, -0.60, tx, isKoi ? -0.28 : -0.24, tailLen + 0.02, 0.055, 0.030);
      const tailFin = Math.min(tailUp, tailDn);
      const dorsal = sdCapsule(bx, by, z, 0, bodyH - 0.03, 0.18, tx * 0.18, bodyH + 0.16, -0.22, 0.045, 0.028);
      const pecL = sdCapsule(bx, by, z, -0.19, -0.08, 0.16, -0.44 - pSp, -0.20, -0.06 + pSw, 0.045, 0.026);
      const pecR = sdCapsule(bx, by, z,  0.19, -0.08, 0.16,  0.44 + pSp, -0.20, -0.06 + pSw, 0.045, 0.026);
      const fins = Math.min(tailFin, Math.min(dorsal, Math.min(pecL, pecR)));

      const eyeZ = 0.12 + bodyLen * 0.62;
      const eyeL = sdEllipsoid(bx, by, z, -0.15, 0.07, eyeZ, 0.055, 0.065, 0.055);
      const eyeR = sdEllipsoid(bx, by, z,  0.15, 0.07, eyeZ, 0.055, 0.065, 0.055);
      const eyes = Math.min(eyeL, eyeR);

      let d = main, mat = 'body';
      if (fins < d) { d = fins; mat = 'fin'; }
      if (eyes < d) { d = eyes; mat = 'eye'; }
      return { d, mat };
    };

    const shadeFish: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'eye') return y > 0.095 ? 'W' : 'k';

      if (species === 'clown') {
        // 3 faixas brancas contornadas de preto do Peixe-Palhaço
        const band1 = Math.abs(z - 0.34) < 0.075;
        const band2 = Math.abs(z - 0.02) < 0.085;
        const band3 = Math.abs(z + 0.40) < 0.07;
        if (band1 || band2 || band3) return shade > 0.45 ? 'W' : 'w0';
        const rim1 = Math.abs(z - 0.34) < 0.10;
        const rim2 = Math.abs(z - 0.02) < 0.11;
        if ((rim1 || rim2) && mat === 'body') return 'k';
        if (mat === 'fin') return shade > 0.5 ? 'o2' : 'o0';
        return shade > 0.72 ? 'o3' : shade > 0.46 ? 'o2' : shade > 0.24 ? 'o1' : 'o0';
      }

      if (species === 'koi') {
        if (mat === 'fin') return shade > 0.5 ? 'W' : 'w0';
        // Manchas orgânicas vermelhas e pretas típicas da Carpa Koi
        const redPatch =
          (Math.hypot(x * 1.1, z - 0.42) < 0.22 && y > -0.02) ||
          (Math.hypot(x - 0.06, z - 0.02) < 0.24 && y > -0.06) ||
          (Math.hypot(x + 0.04, z + 0.36) < 0.19 && y > -0.05);
        const blackSpot = Math.hypot(x + 0.08, z - 0.16) < 0.11 && y > 0.02;
        if (blackSpot) return 'g0';
        if (redPatch) return shade > 0.65 ? 'r2' : shade > 0.35 ? 'r1' : 'r0';
        return shade > 0.65 ? 'W' : shade > 0.36 ? 'w1' : 'w0';
      }

      if (species === 'puffer') {
        if (mat === 'mouth') return 'k';
        if (mat === 'spike') return shade > 0.45 ? 'W' : 'y2';
        if (mat === 'fin') return shade > 0.5 ? 'y2' : 'y0';
        if (y < -0.10) return shade > 0.45 ? 'W' : 'b0';
        if (y > 0.14) return shade > 0.55 ? 'g1' : 'g0';
        return shade > 0.68 ? 'y2' : shade > 0.38 ? 'y1' : 'y0';
      }

      if (species === 'angelfish') {
        // Listras verticais azul-marinho no corpo amarelo-ouro
        const stripe = Math.abs(z - 0.26) < 0.065 || Math.abs(z - 0.02) < 0.075 || Math.abs(z + 0.22) < 0.07;
        if (stripe) return shade > 0.48 ? 'n1' : 'n0';
        if (mat === 'fin') return Math.abs(y) > 0.55 ? 'c0' : shade > 0.5 ? 'y2' : 'y0';
        return shade > 0.66 ? 'y2' : shade > 0.36 ? 'y1' : 'y0';
      }

      // Tropical (padrão azul-turquesa + dourado)
      if (mat === 'fin') return shade > 0.64 ? 'f2' : shade > 0.36 ? 'f1' : 'f0';
      if (y < -0.14) return shade > 0.45 ? 'W' : 's0';
      if (y > 0.12) return shade > 0.58 ? 'b1' : 'b0';
      const stripe = Math.sin(z * 16) > 0.65;
      if (stripe) return shade > 0.55 ? 'f1' : 'b0';
      return shade > 0.72 ? 'b3' : shade > 0.44 ? 'b2' : 'b1';
    };

    const pal =
      species === 'clown' ? CLOWN_PAL :
      species === 'koi' ? KOI_PAL :
      species === 'puffer' ? PUFFER_PAL :
      species === 'angelfish' ? ANGEL_PAL : FISH_PAL;
    const ex = species === 'koi' ? 1.04 : species === 'angelfish' ? 0.78 : species === 'puffer' ? 0.88 : 0.96;
    const ey = species === 'angelfish' ? 0.94 : species === 'puffer' ? 0.88 : 0.68;

    pack = build27Pack(meta.pw, meta.ph, ex, ey, pal, evalFish, shadeFish);
    fishCache.set(cacheKey, pack);
  }
  return pack;
}

export function getFishPosePack(...args: Parameters<typeof buildFishPosePack>): ReturnType<typeof buildFishPosePack> {
  return registerAnimalSpritePack(buildFishPosePack(...args), { module: './Animals.ts', factory: 'getFishPosePack', args }, buildFishPosePack);
}

// ============================================================================
// 2. COELHO SELVAGEM (Rabbit) — 20×22 @ 38 PPU (0.53m × 0.58m)
// ============================================================================
export type RabbitPoseName =
  | 'idle0' | 'idle1' | 'idle2' | 'idle3'
  | 'hop0' | 'hop1' | 'hop2' | 'hop3' | 'hop4' | 'hop5'
  | 'hurt';

export const RABBIT_PW = 20;
export const RABBIT_PH = 22;
export const RABBIT_W = RABBIT_PW / ANIMAL_PPU;
export const RABBIT_H = RABBIT_PH / ANIMAL_PPU;

const RABBIT_PAL: Record<string, [number, number, number]> = {
  k: [0x1e, 0x16, 0x1a],
  W: [0xfa, 0xf5, 0xeb], // rabinho algodão / barriga
  w0: [0xd9, 0xcd, 0xbc],
  c0: [0x6e, 0x4b, 0x34], // pelo caramelo escuro
  c1: [0x9e, 0x6f, 0x4c], // pelo caramelo médio
  c2: [0xc9, 0x98, 0x6e], // pelo caramelo claro
  c3: [0xe6, 0xc3, 0x9c], // destaque quente
  p0: [0xd9, 0x7b, 0x86], // orelha interna / narizinho rosa
  p1: [0xf7, 0xb0, 0xb8],
};

interface RabbitPoseParams {
  bodyTiltY: number;
  earBack: number;
  earTwitch: number;
  hindExt: number;
  frontExt: number;
  headLift: number;
}

const RABBIT_POSES: Record<RabbitPoseName, RabbitPoseParams> = {
  // 4-frame breathing + ear twitch + nose dip
  idle0: { bodyTiltY:  0.00,  earBack: 0.00, earTwitch:  0.00, hindExt:  0.00, frontExt:  0.00, headLift:  0.00 },
  idle1: { bodyTiltY:  0.02,  earBack: 0.03, earTwitch:  0.14, hindExt:  0.00, frontExt:  0.01, headLift:  0.03 },
  idle2: { bodyTiltY: -0.025, earBack: 0.10, earTwitch:  0.04, hindExt:  0.00, frontExt:  0.03, headLift: -0.06 },
  idle3: { bodyTiltY: -0.01,  earBack: 0.05, earTwitch: -0.04, hindExt:  0.00, frontExt:  0.01, headLift: -0.02 },
  // 6-frame crouch -> launch -> rise -> apex -> descend -> land
  hop0:  { bodyTiltY: -0.08,  earBack: 0.16, earTwitch:  0.00, hindExt: -0.10, frontExt: -0.06, headLift: -0.08 },
  hop1:  { bodyTiltY:  0.08,  earBack: 0.22, earTwitch:  0.00, hindExt:  0.28, frontExt:  0.22, headLift:  0.12 },
  hop2:  { bodyTiltY:  0.12,  earBack: 0.30, earTwitch:  0.00, hindExt:  0.22, frontExt:  0.28, headLift:  0.10 },
  hop3:  { bodyTiltY:  0.06,  earBack: 0.34, earTwitch:  0.00, hindExt: -0.04, frontExt:  0.22, headLift:  0.05 },
  hop4:  { bodyTiltY:  0.00,  earBack: 0.24, earTwitch:  0.00, hindExt: -0.18, frontExt:  0.14, headLift: -0.02 },
  hop5:  { bodyTiltY: -0.06,  earBack: 0.08, earTwitch:  0.00, hindExt: -0.14, frontExt: -0.04, headLift: -0.06 },
  hurt:  { bodyTiltY:  0.08,  earBack: 0.36, earTwitch:  0.08, hindExt:  0.12, frontExt:  0.18, headLift:  0.10 },
};

const RABBIT_IDLE_FRAMES: readonly RabbitPoseName[] = ['idle0', 'idle1', 'idle2', 'idle3'];

const rabbitCache = new Map<RabbitPoseName, CreatureViewPack>();

 function buildRabbitPosePack(pose: RabbitPoseName): CreatureViewPack {
  let pack = rabbitCache.get(pose);
  if (!pack) {
    const P = RABBIT_POSES[pose];
    const evalRabbit: SdfEvaluator = (x, y, z) => {
      const by = P.bodyTiltY;
      const hy = P.headLift + by;

      // Corpo fofinho arredondado + quadril traseiro forte
      const rump = sdEllipsoid(x, y, z, 0, -0.08 + by, -0.14, 0.29, 0.27, 0.32);
      const chest = sdEllipsoid(x, y, z, 0, -0.02 + by, 0.16, 0.23, 0.23, 0.24);
      const head = sdEllipsoid(x, y, z, 0, 0.24 + hy, 0.30, 0.22, 0.20, 0.23);
      let fur = smin(rump, chest, 0.12);
      fur = smin(fur, head, 0.10);

      // Orelhas compridas características (orelha direita tem twitch independente no idle)
      const earRBack = P.earBack + P.earTwitch;
      const earL = sdCapsule(x, y, z, -0.11, 0.40 + hy, 0.26, -0.16, 0.78 + hy - P.earBack * 0.25, 0.18 - P.earBack, 0.075, 0.048);
      const earR = sdCapsule(x, y, z, 0.11, 0.40 + hy, 0.26, 0.16, 0.78 + hy - earRBack * 0.25, 0.18 - earRBack, 0.075, 0.048);
      fur = smin(fur, Math.min(earL, earR), 0.04);

      // Patas dianteiras e traseiras
      const fL = sdCapsule(x, y, z, -0.12, -0.18 + by, 0.24, -0.12, -0.44 + P.frontExt * 0.4, 0.32 + P.frontExt, 0.07, 0.055);
      const fR = sdCapsule(x, y, z, 0.12, -0.18 + by, 0.24, 0.12, -0.44 + P.frontExt * 0.4, 0.32 + P.frontExt, 0.07, 0.055);
      const bL = sdCapsule(x, y, z, -0.19, -0.22 + by, -0.18, -0.20, -0.46 - P.hindExt * 0.25, -0.04 - P.hindExt, 0.10, 0.07);
      const bR = sdCapsule(x, y, z, 0.19, -0.22 + by, -0.18, 0.20, -0.46 - P.hindExt * 0.25, -0.04 - P.hindExt, 0.10, 0.07);
      fur = smin(fur, Math.min(Math.min(fL, fR), Math.min(bL, bR)), 0.04);

      // Rabinho pompom branco
      const tail = sdEllipsoid(x, y, z, 0, -0.08 + by, -0.48, 0.13, 0.13, 0.13);
      // Narizinho rosa
      const nose = sdEllipsoid(x, y, z, 0, 0.22 + hy, 0.52, 0.055, 0.045, 0.045);
      // Olhos escuros
      const eyeL = sdEllipsoid(x, y, z, -0.15, 0.28 + hy, 0.43, 0.048, 0.055, 0.048);
      const eyeR = sdEllipsoid(x, y, z, 0.15, 0.28 + hy, 0.43, 0.048, 0.055, 0.048);
      const eyes = Math.min(eyeL, eyeR);

      let d = fur, mat = 'fur';
      if (tail < d) { d = tail; mat = 'tail'; }
      if (nose < d) { d = nose; mat = 'nose'; }
      if (eyes < d) { d = eyes; mat = 'eye'; }
      return { d, mat };
    };

    const shadeRabbit: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'eye') return 'k';
      if (mat === 'tail') return shade > 0.42 ? 'W' : 'w0';
      if (mat === 'nose') return shade > 0.5 ? 'p1' : 'p0';
      // Interior rosado das orelhas na frente
      if (y > 0.46 && z > 0.14 && Math.abs(x) > 0.08 && Math.abs(x) < 0.19) {
        return shade > 0.5 ? 'p1' : 'p0';
      }
      if (y < -0.20 && Math.abs(x) < 0.16) return shade > 0.45 ? 'W' : 'w0';
      return shade > 0.72 ? 'c3' : shade > 0.48 ? 'c2' : shade > 0.26 ? 'c1' : 'c0';
    };

    pack = build27Pack(RABBIT_PW, RABBIT_PH, 0.78, 0.78, RABBIT_PAL, evalRabbit, shadeRabbit);
    rabbitCache.set(pose, pack);
  }
  return pack;
}

export function getRabbitPosePack(...args: Parameters<typeof buildRabbitPosePack>): ReturnType<typeof buildRabbitPosePack> {
  return registerAnimalSpritePack(buildRabbitPosePack(...args), { module: './Animals.ts', factory: 'getRabbitPosePack', args }, buildRabbitPosePack);
}

// ============================================================================
// 3. GALINHA DA ILHA (Chicken) — 20×20 @ 38 PPU (0.53m × 0.53m)
// ============================================================================
export type ChickenPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'peck0' | 'peck1' | 'peck2' | 'peck3'
  | 'walk0' | 'walk1' | 'walk2' | 'walk3' | 'walk4' | 'walk5'
  | 'flap0' | 'flap1' | 'flap2' | 'flap3';

export const CHICKEN_PW = 20;
export const CHICKEN_PH = 20;
export const CHICKEN_W = CHICKEN_PW / ANIMAL_PPU;
export const CHICKEN_H = CHICKEN_PH / ANIMAL_PPU;

const CHICKEN_PAL: Record<string, [number, number, number]> = {
  k: [0x1c, 0x16, 0x1a],
  w0: [0xa6, 0x9d, 0x8e], // sombra pena
  w1: [0xd6, 0xcd, 0xbc], // pena média
  w2: [0xf2, 0xec, 0xde], // pena branca
  w3: [0xff, 0xfc, 0xf2], // destaque pena
  r0: [0xa6, 0x1f, 0x26], // crista / barbela vermelho escuro
  r1: [0xe6, 0x35, 0x38], // crista vermelho vivo
  y0: [0xc4, 0x71, 0x18], // bico / pé laranja escuro
  y1: [0xf5, 0xa6, 0x23], // bico / pé dourado
};

interface ChickenPoseParams {
  headDip: number;
  headFwd: number;
  headTurn: number;
  wingLift: number;
  wingOut: number;
  legL: number;
  legR: number;
  legLiftL: number;
  legLiftR: number;
}

const CHICKEN_POSES: Record<ChickenPoseName, ChickenPoseParams> = {
  // 3-frame subtle head bob/look
  idle0: { headDip:  0.00, headFwd:  0.00, headTurn:  0.00, wingLift:  0.00, wingOut: 0.00, legL:  0.00, legR:  0.00, legLiftL: 0.00, legLiftR: 0.00 },
  idle1: { headDip: -0.03, headFwd:  0.04, headTurn:  0.04, wingLift:  0.02, wingOut: 0.01, legL:  0.00, legR:  0.00, legLiftL: 0.00, legLiftR: 0.00 },
  idle2: { headDip:  0.03, headFwd: -0.02, headTurn: -0.04, wingLift:  0.00, wingOut: 0.00, legL:  0.00, legR:  0.00, legLiftL: 0.00, legLiftR: 0.00 },
  // 4-frame dip -> tap ground -> peck -> lift
  peck0: { headDip: -0.18, headFwd:  0.10, headTurn:  0.00, wingLift:  0.04, wingOut: 0.03, legL:  0.00, legR:  0.00, legLiftL: 0.00, legLiftR: 0.00 },
  peck1: { headDip: -0.38, headFwd:  0.18, headTurn:  0.00, wingLift:  0.07, wingOut: 0.05, legL:  0.00, legR:  0.00, legLiftL: 0.00, legLiftR: 0.00 },
  peck2: { headDip: -0.30, headFwd:  0.15, headTurn:  0.02, wingLift:  0.05, wingOut: 0.04, legL:  0.00, legR:  0.00, legLiftL: 0.00, legLiftR: 0.00 },
  peck3: { headDip: -0.10, headFwd:  0.06, headTurn:  0.00, wingLift:  0.02, wingOut: 0.02, legL:  0.00, legR:  0.00, legLiftL: 0.00, legLiftR: 0.00 },
  // 6-frame strutting walk with alternating legs + head bob
  walk0: { headDip: -0.05, headFwd:  0.07, headTurn:  0.00, wingLift:  0.04, wingOut: 0.03, legL:  0.16, legR: -0.14, legLiftL: 0.00, legLiftR: 0.02 },
  walk1: { headDip:  0.01, headFwd:  0.01, headTurn:  0.00, wingLift:  0.02, wingOut: 0.02, legL:  0.04, legR: -0.04, legLiftL: 0.00, legLiftR: 0.10 },
  walk2: { headDip: -0.02, headFwd:  0.05, headTurn:  0.00, wingLift:  0.05, wingOut: 0.04, legL: -0.08, legR:  0.10, legLiftL: 0.00, legLiftR: 0.07 },
  walk3: { headDip: -0.05, headFwd:  0.07, headTurn:  0.00, wingLift:  0.04, wingOut: 0.03, legL: -0.14, legR:  0.16, legLiftL: 0.02, legLiftR: 0.00 },
  walk4: { headDip:  0.01, headFwd:  0.01, headTurn:  0.00, wingLift:  0.02, wingOut: 0.02, legL: -0.04, legR:  0.04, legLiftL: 0.10, legLiftR: 0.00 },
  walk5: { headDip: -0.02, headFwd:  0.05, headTurn:  0.00, wingLift:  0.05, wingOut: 0.04, legL:  0.10, legR: -0.08, legLiftL: 0.07, legLiftR: 0.00 },
  // 4-frame full wing-beat cycle up/mid/down/mid
  flap0: { headDip:  0.07, headFwd:  0.04, headTurn:  0.00, wingLift:  0.36, wingOut: 0.34, legL: -0.12, legR:  0.10, legLiftL: 0.06, legLiftR: 0.02 },
  flap1: { headDip:  0.03, headFwd:  0.05, headTurn:  0.00, wingLift:  0.08, wingOut: 0.38, legL:  0.06, legR: -0.08, legLiftL: 0.04, legLiftR: 0.06 },
  flap2: { headDip: -0.02, headFwd:  0.06, headTurn:  0.00, wingLift: -0.22, wingOut: 0.32, legL:  0.12, legR: -0.12, legLiftL: 0.02, legLiftR: 0.08 },
  flap3: { headDip:  0.04, headFwd:  0.04, headTurn:  0.00, wingLift:  0.12, wingOut: 0.28, legL: -0.06, legR:  0.08, legLiftL: 0.06, legLiftR: 0.04 },
};

const CHICKEN_IDLE_FRAMES: readonly ChickenPoseName[] = ['idle0', 'idle1', 'idle2'];
const CHICKEN_PECK_FRAMES: readonly ChickenPoseName[] = ['peck0', 'peck1', 'peck2', 'peck3'];
const CHICKEN_WALK_FRAMES: readonly ChickenPoseName[] = ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'];
const CHICKEN_FLAP_FRAMES: readonly ChickenPoseName[] = ['flap0', 'flap1', 'flap2', 'flap3'];

const chickenCache = new Map<ChickenPoseName, CreatureViewPack>();

 function buildChickenPosePack(pose: ChickenPoseName): CreatureViewPack {
  let pack = chickenCache.get(pose);
  if (!pack) {
    const P = CHICKEN_POSES[pose];
    const evalChicken: SdfEvaluator = (x, y, z) => {
      const hy = P.headDip;
      const hz = P.headFwd;
      const hx = P.headTurn;

      // Corpo rechonchudo + pescoço + cabeça + cauda em leque
      const body = sdEllipsoid(x, y, z, 0, -0.04, -0.02, 0.28, 0.26, 0.34);
      const neck = sdCapsule(x, y, z, 0, 0.10, 0.18, hx * 0.7, 0.32 + hy, 0.26 + hz, 0.14, 0.11);
      const head = sdEllipsoid(x, y, z, hx, 0.36 + hy, 0.28 + hz, 0.15, 0.15, 0.16);
      const tail = sdCapsule(x, y, z, 0, 0.04, -0.28, 0, 0.32, -0.48, 0.13, 0.06);

      // Asas laterais (fechadas ou batendo em ciclo completo up/mid/down/mid!)
      const wingL = sdCapsule(x, y, z, -0.24, 0.02, 0.02, -0.34 - P.wingOut * 0.85, -0.04 + P.wingLift * 1.1, -0.10, 0.11, 0.06);
      const wingR = sdCapsule(x, y, z, 0.24, 0.02, 0.02, 0.34 + P.wingOut * 0.85, -0.04 + P.wingLift * 1.1, -0.10, 0.11, 0.06);

      let feather = smin(body, neck, 0.08);
      feather = smin(feather, head, 0.06);
      feather = smin(feather, tail, 0.07);
      feather = smin(feather, Math.min(wingL, wingR), 0.05);

      // Crista vermelha no topo + barbela abaixo do bico
      const comb1 = sdEllipsoid(x, y, z, hx, 0.54 + hy, 0.28 + hz, 0.05, 0.09, 0.12);
      const wattle = sdEllipsoid(x, y, z, hx, 0.22 + hy, 0.40 + hz, 0.05, 0.07, 0.05);
      const red = Math.min(comb1, wattle);

      // Bico dourado
      const beak = sdCapsule(x, y, z, hx, 0.34 + hy, 0.40 + hz, hx * 1.15, 0.31 + hy, 0.54 + hz, 0.065, 0.02);

      // Pernas e pés laranja (com elevação do pé na passada)
      const lyL = -0.54 + P.legLiftL;
      const lyR = -0.54 + P.legLiftR;
      const legL = sdCapsule(x, y, z, -0.11, -0.24, 0.0, -0.11, lyL, P.legL, 0.045, 0.038);
      const legR = sdCapsule(x, y, z, 0.11, -0.24, 0.0, 0.11, lyR, P.legR, 0.045, 0.038);
      const footL = sdCapsule(x, y, z, -0.11, lyL, P.legL - 0.04, -0.11, lyL, P.legL + 0.12, 0.04, 0.03);
      const footR = sdCapsule(x, y, z, 0.11, lyR, P.legR - 0.04, 0.11, lyR, P.legR + 0.12, 0.04, 0.03);
      const orange = Math.min(beak, Math.min(Math.min(legL, legR), Math.min(footL, footR)));

      // Olhos
      const eyeL = sdEllipsoid(x, y, z, -0.12 + hx, 0.39 + hy, 0.36 + hz, 0.042, 0.046, 0.042);
      const eyeR = sdEllipsoid(x, y, z, 0.12 + hx, 0.39 + hy, 0.36 + hz, 0.042, 0.046, 0.042);
      const eyes = Math.min(eyeL, eyeR);

      let d = feather, mat = 'feather';
      if (red < d) { d = red; mat = 'red'; }
      if (orange < d) { d = orange; mat = 'orange'; }
      if (eyes < d) { d = eyes; mat = 'eye'; }
      return { d, mat };
    };

    const shadeChicken: ColorShaper = (mat, shade) => {
      if (mat === 'eye') return 'k';
      if (mat === 'red') return shade > 0.45 ? 'r1' : 'r0';
      if (mat === 'orange') return shade > 0.48 ? 'y1' : 'y0';
      return shade > 0.72 ? 'w3' : shade > 0.48 ? 'w2' : shade > 0.26 ? 'w1' : 'w0';
    };

    pack = build27Pack(CHICKEN_PW, CHICKEN_PH, 0.76, 0.76, CHICKEN_PAL, evalChicken, shadeChicken);
    chickenCache.set(pose, pack);
  }
  return pack;
}

export function getChickenPosePack(...args: Parameters<typeof buildChickenPosePack>): ReturnType<typeof buildChickenPosePack> {
  return registerAnimalSpritePack(buildChickenPosePack(...args), { module: './Animals.ts', factory: 'getChickenPosePack', args }, buildChickenPosePack);
}

// ============================================================================
// CLASSE BASE DE BILLBOARD PIXEL-ART 1:1 PARA ANIMAIS
// ============================================================================
export interface AnimalEntity extends Damageable {
  deadT: number;
  removed: boolean;
  readonly position: THREE.Vector3;
  update(dt: number, target: EnemyTarget | null, camera: THREE.Camera, drawingBufferSize?: THREE.Vector2): void;
  dispose(): void;
}

export /**
 * Altura real aproximada do sprite (em metros, relativo ao herói de ~1.80m) por nome da espécie.
 * Desacopla o tamanho físico no mundo da resolução em pixels (PW/PH), garantindo proporções reais.
 */
const REAL_WORLD_HEIGHT_M: Record<string, number> = {
  giraffe: 4.8,
  elephant: 3.5,
  moose: 2.5,
  ostrich: 2.4,
  polarbear: 2.2,
  bear: 2.1,
  horse: 2.1,
  bison: 2.1,
  buffalo: 1.95,
  hippo: 1.85,
  zebra: 1.85,
  gorilla: 1.8,
  emu: 1.8,
  rhea: 1.7,
  deer: 1.7,
  narwhal: 1.65,
  dolphin: 1.55,
  donkey: 1.55,
  giantpanda: 1.55,
  spectacledbear: 1.5,
  orangutan: 1.5,
  lion: 1.48,
  tiger: 1.48,
  flamingo: 1.45,
  pinkdolphin: 1.45,
  swordfish: 1.4,
  stingray: 1.3,
  crocodile: 1.25,
  chimpanzee: 1.25,
  cheetah: 1.2,
  jaguar: 1.2,
  panther: 1.2,
  alligator: 1.15,
  gharial: 1.15,
  komododragon: 1.15,
  wolf: 1.12,
  hyena: 1.12,
  anteater: 1.12,
  penguin: 1.1,
  pelican: 1.1,
  sheep: 0.85,
  goat: 0.82,
  eagle: 0.95,
  vulture: 0.95,
  pig: 0.78,
  baboon: 0.95,
  fox: 0.78,
  octopus: 0.75,
  jellyfish: 0.75,
  kingcrab: 0.72,
  redpanda: 0.68,
  raccoon: 0.68,
  squid: 0.65,
  tasmaniandevil: 0.62,
  otter: 0.62,
  owl: 0.6,
  badger: 0.58,
  armadillo: 0.56,
  toucan: 0.56,
  lobster: 0.55,
  vampiresquid: 0.55,
  snake: 0.55,
  parrot: 0.52,
  duck: 0.52,
  maryriverturtle: 0.5,
  chicken: 0.48,
  goldenliontamarin: 0.48,
  crow: 0.46,
  kiwi: 0.46,
  threebandedarmadillo: 0.46,
  dumbooctopus: 0.46,
  rabbit: 0.45,
  turtle: 0.45,
  weasel: 0.42,
  squirrel: 0.38,
  pigeon: 0.38,
  crab: 0.35,
  greenlizard: 0.35,
  chameleon: 0.35,
  hedgehog: 0.32,
  axolotl: 0.32,
  mantisshrimp: 0.32,
  goliathspider: 0.3,
  pistolshrimp: 0.28,
  frog: 0.26,
  tarantula: 0.25,
  scorpion: 0.25,
  herculesbeetle: 0.24,
  prayingmantis: 0.24,
  wanderingspider: 0.23,
  dungbeetle: 0.22,
  dragonfly: 0.22,
  butterfly: 0.21,
  moth: 0.21,
  trapdoorspider: 0.2,
  tarantulahawk: 0.2,
  grasshopper: 0.2,
  blackwidow: 0.18,
  beetle: 0.18,
  caterpillar: 0.18,
  earthworm: 0.18,
  wasp: 0.16,
  bee: 0.15,
  firefly: 0.15,
  ladybug: 0.14,
  ant: 0.14,
  fly: 0.14,
};

/**
 * Os canvases SDF dos animais possuem margem transparente (~30–40%) para não cortar
 * patas/cabeça/cauda nos 27 ângulos de câmera. Este fator compensa a margem para que
 * a altura VISÍVEL do animal bata com REAL_WORLD_HEIGHT_M em relação ao herói (~1.65m).
 */
const SPRITE_PADDING_FACTOR = 1.45;

export function getRealWorldScale(name: string, origH: number, className = ''): number {
  const clean = (s: string) =>
    s.toLowerCase().replace(/(billboard|animal|entity|mesh)$/i, '').replace(/[^a-z]/g, '');
  const targetH = REAL_WORLD_HEIGHT_M[clean(name)] ?? REAL_WORLD_HEIGHT_M[clean(className)];
  if (!targetH || origH <= 0.01) return 1;
  return (targetH * SPRITE_PADDING_FACTOR) / origH;
}

export abstract class BasePixelAnimal implements AnimalEntity {
  readonly id = newId();
  team: Team = 'enemy';
  material = 'flesh' as const;
  lockable = true;
  alive = true;
  hp = 35;
  maxHp = 35;
  deadT = 0;
  removed = false;

  readonly root = new THREE.Group();
  readonly stickRoot = new THREE.Object3D();
  readonly hurtboxes: Hurtbox[] = [];

  protected readonly geometry = new THREE.PlaneGeometry(1, 1);
  protected readonly uFlashColor = { value: new THREE.Color(0xff3030) };
  protected readonly uFlashAmount = { value: 0 };
  protected readonly mapUniform: { value: THREE.CanvasTexture };
  protected readonly pixelSizeUniform = { value: 3.0 };
  protected readonly gridOriginUniform = { value: new THREE.Vector2(0, 0) };
  protected readonly materialShader: THREE.ShaderMaterial;
  protected readonly depthMaterial: THREE.MeshDepthMaterial;
  protected readonly mesh: THREE.Mesh;
  protected readonly sunShadowMesh: THREE.Mesh;
  protected readonly sunShadowDepthMat: THREE.ShaderMaterial;
  protected readonly contactShadow: THREE.Mesh;
  private readonly baseContactRx: number;
  private readonly baseContactRz: number;
  private readonly sunDir = new THREE.Vector3();

  protected facing = rand(0, Math.PI * 2);
  private readonly bodyTurn = new AnimalTurnMotion();
  private lastTurnTime = NaN;
  private renderedFacing?: number;
  private groundMotor?: CharacterMotor;
  private readonly motionAnimation = new AnimalMotionAnimation();
  protected flash = 0;
  protected bodyPitch = 0;

  protected readonly camPos = new THREE.Vector3();
  protected readonly camBack = new THREE.Vector3();
  protected readonly camFwd = new THREE.Vector3();
  protected readonly camUp = new THREE.Vector3();
  protected readonly toCam = new THREE.Vector3();
  protected readonly xAxis = new THREE.Vector3();
  protected readonly yAxis = new THREE.Vector3();
  protected readonly zAxis = new THREE.Vector3();
  protected readonly fwd = new THREE.Vector3();
  protected readonly left = new THREE.Vector3();
  protected readonly up = new THREE.Vector3();
  protected readonly tmp = new THREE.Vector3();
  protected readonly ndc = new THREE.Vector3();
  protected readonly basisMat = new THREE.Matrix4();

  abstract readonly position: THREE.Vector3;

  protected readonly worldW: number;
  protected readonly worldH: number;
  private readonly origWorldH: number;
  private readonly spriteResolution: ReturnType<typeof actorSpriteResolution>;
  private readonly texelSize = new THREE.Vector2();

  constructor(
    protected readonly ctx: GameContext,
    initialTex: THREE.CanvasTexture,
    protected readonly pw: number,
    protected readonly ph: number,
    worldW: number,
    worldH: number,
    name: string,
  ) {
    const realScale = getRealWorldScale(name, worldH, new.target?.name ?? '');
    this.origWorldH = worldH;
    this.worldW = worldW * realScale;
    this.worldH = worldH * realScale;
    this.spriteResolution = actorSpriteResolution(this.worldW, this.worldH);
    this.texelSize.set(1 / initialTex.image.width, 1 / initialTex.image.height);
    this.root.name = name;
    this.mapUniform = { value: initialTex };
    this.materialShader = new THREE.ShaderMaterial({
      uniforms: {
        uMap: this.mapUniform,
        uTexelSize: { value: this.texelSize },
        uPixelSize: this.pixelSizeUniform,
        uGridOrigin: this.gridOriginUniform,
        uFlashColor: this.uFlashColor,
        uFlashAmount: this.uFlashAmount,
      },
      vertexShader: CREATURE_VERTEX_SHADER,
      fragmentShader: CREATURE_FRAGMENT_SHADER,
      side: THREE.DoubleSide,
      transparent: false,
      depthWrite: true,
      depthTest: true,
    });
    this.depthMaterial = new THREE.MeshDepthMaterial({
      depthPacking: THREE.RGBADepthPacking,
      map: initialTex,
      alphaTest: 0.5,
      side: THREE.DoubleSide,
    });
    this.mesh = new THREE.Mesh(this.geometry, this.materialShader);
    this.mesh.name = `${name}_mesh`;
    this.mesh.castShadow = false;
    this.mesh.receiveShadow = false;
    this.mesh.customDepthMaterial = this.depthMaterial;
    this.mesh.frustumCulled = false;
    this.root.add(this.mesh);

    const sunSh = createSunShadowBillboard(this.geometry, initialTex, name);
    this.sunShadowMesh = sunSh.mesh;
    this.sunShadowDepthMat = sunSh.depthMat;
    this.root.add(this.sunShadowMesh);

    this.baseContactRx = worldW * 0.36;
    this.baseContactRz = worldW * 0.42;
    this.contactShadow = createContactShadow(this.baseContactRx, this.baseContactRz);
    this.root.add(this.contactShadow);

    ctx.scene.add(this.root);
    ctx.scene.add(this.stickRoot);
  }

  protected hasTex = false;
  private readonly viewAngles = new AnimalViewAngles();

  private updateBodyTurn(dt: number) {
    if (this.lastTurnTime !== this.ctx.clock.time) {
      this.bodyTurn.update(this.facing, dt);
      this.lastTurnTime = this.ctx.clock.time;
    }
    return this.bodyTurn;
  }

  protected bindAnimalMotor(motor: CharacterMotor) {
    this.groundMotor = motor;
    motor.beforeMove = dt => {
      // Recuo de golpes, saltos e a marcha lateral dos caranguejos mantêm sua física.
      if (!motor.grounded || this.root.name.includes('Crab')) return;
      this.steerAnimalMovement(motor.velocity, dt);
    };
  }

  protected steerAnimalMovement(velocity: { x: number; z: number }, dt: number) {
    const turn = this.updateBodyTurn(dt);
    if (this.alive && this.flash <= .35) {
      steerAnimalLocomotion(velocity, this.facing, this.renderedFacing ?? turn.yaw);
    }
  }

  protected setTex(tex: THREE.CanvasTexture) {
    this.hasTex = true;
    if (this.mapUniform.value !== tex) {
      this.mapUniform.value = tex;
      this.texelSize.set(1 / tex.image.width, 1 / tex.image.height);
      const hadMap = !!this.depthMaterial.map;
      this.depthMaterial.map = tex;
      if (!hadMap) this.depthMaterial.needsUpdate = true;
    }
  }

  protected renderBillboard(
    pack: CreatureViewPack,
    centerY: number,
    camera: THREE.Camera,
    drawingBufferSize?: THREE.Vector2,
  ) {
    if (this.ctx.tuning.freezeBillboards) return;
    const motor = this.groundMotor;
    if (this.motionAnimation.useRestPose(
      isAnimalLocomotionPack(pack), motor?.horizontalSpeed ?? Infinity,
      motor?.grounded ?? false, this.alive, this.ctx.clock.dt,
    )) pack = animalRestPack(pack, this.ctx.clock.time);
    centerY += (this.worldH - this.origWorldH) * 0.46;
    camera.getWorldPosition(this.camPos);
    this.camUp.setFromMatrixColumn(camera.matrixWorld, 1).normalize();
    this.camBack.setFromMatrixColumn(camera.matrixWorld, 2).normalize();
    this.camFwd.copy(this.camBack).negate();
    const cameraChanged = this.viewAngles.observeCamera(
      this.camPos.x, this.camPos.y, this.camPos.z, this.camBack.x, this.camBack.y, this.camBack.z,
    );

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const bufW = drawingBufferSize ? drawingBufferSize.x : (typeof window !== 'undefined' ? window.innerWidth * dpr : 1280);
    const bufH = drawingBufferSize ? drawingBufferSize.y : (typeof window !== 'undefined' ? window.innerHeight * dpr : 720);
    const fovDeg = (camera as THREE.PerspectiveCamera).fov || 70;
    const tanHalfFov = Math.tan(THREE.MathUtils.degToRad(fovDeg) * 0.5);

    this.uFlashAmount.value = this.flash;

    const turn = this.updateBodyTurn(this.ctx.clock.dt);
    const fx = Math.sin(turn.yaw);
    const fz = Math.cos(turn.yaw);
    const lx = fz;
    const lz = -fx;

    // atenua bodyPitch na escolha do tier vertical para que pulos/mergulhos não troquem
    // falsamente para sprites de topo/baixo quando a câmera está nivelada
    const viewPitch = this.bodyPitch * 0.22;
    const cp = Math.cos(viewPitch), sp = Math.sin(viewPitch);
    this.fwd.set(fx * cp, sp, fz * cp).normalize();
    this.left.set(lx, 0, lz).normalize();
    this.up.crossVectors(this.fwd, this.left).normalize();

    this.toCam.set(this.camPos.x - this.position.x, this.camPos.y - centerY, this.camPos.z - this.position.z);
    const dSq = this.toCam.lengthSq();
    if (dSq > 1e-6) {
      this.toCam.multiplyScalar(1 / Math.sqrt(dSq));
      // Combina o raio da câmera com a normal do plano do billboard (camBack) para eliminar
      // distorção de paralaxe lateral quando o animal está próximo das bordas da tela
      this.toCam.addScaledVector(this.camBack, 0.35).normalize();
    } else {
      this.toCam.copy(this.camBack);
    }

    const upDot = this.toCam.dot(this.up);
    const fwdDot = this.toCam.dot(this.fwd);
    const leftDot = this.toCam.dot(this.left);

    // O worker cuida das vistas distantes também; distância não pode prender um sprite frontal.
    const { tex, flipX, isPolar } = pick27View(
      pack, upDot, fwdDot, leftDot, true, this.hasTex, this.viewAngles, this.ctx.clock.dt, cameraChanged,
    );
    this.renderedFacing = turn.yaw + this.viewAngles.yawLag;
    if (isPolar) {
      this.tmp.copy(this.fwd).addScaledVector(this.camBack, -this.fwd.dot(this.camBack));
      if (this.tmp.lengthSq() > 1e-4) this.yAxis.copy(this.tmp).normalize();
      else this.yAxis.copy(this.camUp);
    } else {
      this.yAxis.copy(this.camUp);
    }

    this.zAxis.copy(this.camBack);
    this.xAxis.crossVectors(this.yAxis, this.zAxis).normalize();
    this.basisMat.makeBasis(this.xAxis, this.yAxis, this.zAxis);
    this.mesh.quaternion.setFromRotationMatrix(this.basisMat);
    this.mesh.position.set(this.position.x, centerY, this.position.z).addScaledVector(this.camBack, 0.02);
    const p = actorScreenPixelSize(bufH);
    const depth = Math.max(.5, this.tmp.subVectors(this.mesh.position, this.camPos).dot(this.camFwd));
    const pixelsPerMeter = bufH / (2 * depth * tanHalfFov);
    this.ndc.copy(this.mesh.position).project(camera);
    if (tex) {
      const visible = Math.abs(this.ndc.x) < 1 + this.worldW * pixelsPerMeter / bufW
        && Math.abs(this.ndc.y) < 1 + this.worldH * pixelsPerMeter / bufH && Math.abs(this.ndc.z) <= 1;
      const rows = this.worldH * pixelsPerMeter / p;
      const pose = visible && !isPolar && this.alive && this.flash < .35
        ? quantizeTurnPose(turn.headYaw, turn.pivotPhase) : undefined;
      const normal = visible ? getAnimalDensityTexture(pack, tex, this.spriteResolution, rows, isPolar ? Math.sign(upDot) : 0) : tex;
      const turning = pose && getAnimalTurnTexture(pack, normal.image, rows, pose, flipX);
      this.setTex(turning ?? normal);
    }
    this.mesh.scale.set(flipX ? -this.worldW : this.worldW, this.worldH, 1);
    const supportY = this.groundMotor?.groundY ?? this.ctx.physics.groundHeight(
      this.position.x, this.position.z, this.position.y, 0,
    ).y;
    const groundY = Number.isFinite(supportY) ? supportY : 0;
    const onGround = this.groundMotor ? this.groundMotor.grounded : Number.isFinite(supportY);
    const groundLift = onGround
      ? keepAnimalAboveGround(this.mesh, this.mapUniform.value, groundY)
      : 0;

    // Atualiza o plano de sombra virado para o Sol usando o sprite da pose atual visto pelo ângulo do Sol
    getSunDir(this.ctx.scene, this.sunDir);
    updateSunShadowBillboard(
      this.sunShadowMesh, this.sunShadowDepthMat, pack,
      this.position, centerY + groundLift, this.worldW, this.worldH,
      this.fwd, this.left, this.up, this.sunDir,
    );

    // Sombra de contato suave no chão (encolhe e suaviza ao pular)
    const airFade = clamp(1 - Math.max(0, this.position.y - groundY) * 0.45, 0.25, 1);
    this.contactShadow.position.set(this.position.x, groundY + 0.016, this.position.z);
    this.contactShadow.rotation.y = turn.yaw;
    this.contactShadow.scale.set(this.baseContactRx * 2 * airFade, 1, this.baseContactRz * 2 * airFade);
    (this.contactShadow.material as THREE.MeshBasicMaterial).opacity = airFade;

    this.pixelSizeUniform.value = p;
    this.ndc.copy(this.mesh.position).project(camera);
    const sxScreen = (this.ndc.x * 0.5 + 0.5) * bufW;
    const syScreen = (this.ndc.y * 0.5 + 0.5) * bufH;
    this.gridOriginUniform.value.set(
      sxScreen - ((this.pw & 1) ? 0.5 * p : 0),
      syScreen - ((this.ph & 1) ? 0.5 * p : 0),
    );
  }

  abstract center(out: THREE.Vector3): THREE.Vector3;
  abstract receiveHit(hit: HitInfo): HitResult;
  abstract update(dt: number, target: EnemyTarget | null, camera: THREE.Camera, drawingBufferSize?: THREE.Vector2): void;

  dispose() {
    this.root.removeFromParent();
    this.stickRoot.removeFromParent();
    this.geometry.dispose();
    this.materialShader.dispose();
    this.depthMaterial.dispose();
    this.sunShadowDepthMat.dispose();
    (this.contactShadow.material as THREE.Material).dispose();
  }
}

// ============================================================================
// INSTÂNCIA: PEIXE NO LAGO
// ============================================================================
export class Fish extends BasePixelAnimal {
  readonly position = new THREE.Vector3();
  private readonly vel = new THREE.Vector3();
  private readonly pondCenter: THREE.Vector3;
  private readonly pondRadius: number;
  private swimPhase = rand(0, Math.PI * 2);
  private targetYaw = rand(0, Math.PI * 2);
  private turnTimer = rand(0.8, 2.2);
  private jumpTimer = rand(3.5, 8.0);
  private dartT = 0;
  private flopT = 0;

  constructor(
    ctx: GameContext,
    pondCenter: THREE.Vector3,
    pondRadius: number,
    readonly species: FishSpecies = 'tropical',
  ) {
    const meta = FISH_SPECIES_META[species];
    const pack = getFishPosePack('swim0', species);
    super(ctx, pack.getView(2, 0)!, meta.pw, meta.ph, meta.w, meta.h, `Fish_${species}`);
    this.hp = 25;
    this.maxHp = 25;
    this.pondCenter = pondCenter.clone();
    this.pondRadius = Math.max(1.2, pondRadius - 0.55);

    const a = rand(0, Math.PI * 2);
    const r = rand(0.3, this.pondRadius * 0.75);
    this.position.set(pondCenter.x + Math.cos(a) * r, 0.28, pondCenter.z + Math.sin(a) * r);
    this.facing = a + Math.PI * 0.5;
    this.targetYaw = this.facing;

    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.36, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.copy(this.position);
  }

  private syncHurtbox() {
    const fx = Math.sin(this.facing), fz = Math.cos(this.facing);
    this.hurtboxes[0].a.set(this.position.x - fx * 0.25, this.position.y, this.position.z - fz * 0.25);
    this.hurtboxes[0].b.set(this.position.x + fx * 0.25, this.position.y, this.position.z + fz * 0.25);
    this.hurtboxes[0].enabled = this.alive;
    this.stickRoot.position.copy(this.position);
    this.stickRoot.rotation.y = this.facing;
  }

  receiveHit(hit: HitInfo): HitResult {
    const res = emptyResult('flesh');
    if (!this.alive) { res.ignored = true; return res; }
    this.hp = Math.max(0, this.hp - hit.damage);
    res.damage = hit.damage;
    this.flash = 1.0;
    this.flopT = 0.65;
    this.vel.x += hit.dir.x * 4.5;
    this.vel.z += hit.dir.z * 4.5;
    this.vel.y = 4.2;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    }
    return res;
  }

  update(dt: number, target: EnemyTarget | null, camera: THREE.Camera, drawingBufferSize?: THREE.Vector2) {
    if (dt > 0) {
      this.flash = Math.max(0, this.flash - dt * 4.5);
      this.flopT = Math.max(0, this.flopT - dt);
      this.dartT = Math.max(0, this.dartT - dt);

      if (!this.alive) {
        this.deadT += dt;
        this.position.y = Math.max(0.18, this.position.y - dt * 0.4);
      } else {
        const dxHome = this.position.x - this.pondCenter.x;
        const dzHome = this.position.z - this.pondCenter.z;
        const distHome = Math.hypot(dxHome, dzHome);

        // Foge rápido (dart) se o jogador chegar muito perto
        let speed = 1.45;
        if (target && target.alive) {
          const td = Math.hypot(target.position.x - this.position.x, target.position.z - this.position.z);
          if (td < 2.6 && this.dartT <= 0) {
            this.dartT = 0.9;
            this.targetYaw = Math.atan2(this.position.x - target.position.x, this.position.z - target.position.z);
          }
        }
        if (this.dartT > 0) speed = 3.2;

        // Mantém o peixe dentro do lago
        if (distHome > this.pondRadius) {
          this.targetYaw = Math.atan2(-dxHome, -dzHome) + rand(-0.35, 0.35);
          this.turnTimer = rand(0.6, 1.4);
        } else {
          this.turnTimer -= dt;
          if (this.turnTimer <= 0) {
            this.turnTimer = rand(1.0, 2.6);
            this.targetYaw = this.facing + rand(-1.3, 1.3);
          }
        }

        // Saltinho alegre fora d'água de vez em quando
        this.jumpTimer -= dt;
        if (this.jumpTimer <= 0 && this.position.y <= 0.34) {
          this.jumpTimer = rand(4.0, 9.0);
          this.vel.y = 4.6;
          this.dartT = 0.65;
        }

        this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 4.8);
        this.vel.x = damp(this.vel.x, Math.sin(this.facing) * speed, 6, dt);
        this.vel.z = damp(this.vel.z, Math.cos(this.facing) * speed, 6, dt);

        if (this.position.y > 0.30 || this.vel.y > 0) {
          this.vel.y -= 14.5 * dt;
          this.position.y += this.vel.y * dt;
          if (this.position.y < 0.28) {
            this.position.y = 0.28;
            this.vel.y = 0;
          }
        } else {
          this.position.y = 0.28 + Math.sin(this.swimPhase * 0.7) * 0.04;
        }

        this.steerAnimalMovement(this.vel, dt);
        this.position.x += this.vel.x * dt;
        this.position.z += this.vel.z * dt;
        this.bodyPitch = clamp(this.vel.y * 0.12, -0.55, 0.55);
        this.swimPhase += dt * (this.dartT > 0 ? 15 : 7.5);
      }
      this.syncHurtbox();
    }

    let pose: FishPoseName;
    if (!this.alive || this.flopT > 0) {
      pose = sampleAnimalCycle(FISH_FLOP_FRAMES, !this.alive ? this.deadT * 9 : this.swimPhase * 1.4);
    } else if (this.position.y > 0.46 || this.dartT > 0) {
      pose = sampleAnimalCycle(FISH_DART_FRAMES, (this.swimPhase / (Math.PI * 2)) * 4);
    } else {
      pose = sampleAnimalCycle(FISH_SWIM_FRAMES, (this.swimPhase / (Math.PI * 2)) * 6);
    }

    const pack = getFishPosePack(pose, this.species);
    this.renderBillboard(pack, this.position.y, camera, drawingBufferSize);
  }
}

// ============================================================================
// INSTÂNCIA: COELHO SELVAGEM
// ============================================================================
export class Rabbit extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private home = new THREE.Vector3();
  private state: 'idle' | 'hop' | 'flee' | 'hurt' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.0, 2.5);
  private targetYaw = rand(0, Math.PI * 2);
  private idleClock = rand(0, 10);
  private hopCooldown = 0;
  private wasGrounded = true;
  private landT = 0;

  constructor(ctx: GameContext, startPos: THREE.Vector3) {
    const pack = getRabbitPosePack('idle0');
    super(ctx, pack.getView(2, 0)!, RABBIT_PW, RABBIT_PH, RABBIT_W, RABBIT_H, 'RabbitBillboard');
    this.hp = 30;
    this.maxHp = 30;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.24;
    this.motor.height = 0.45;
    this.motor.teleport(startPos);
    this.home.copy(startPos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.28, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.set(this.position.x, this.position.y + 0.19, this.position.z);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y + 0.12, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.34, this.position.z);
    this.hurtboxes[0].enabled = this.alive;
    this.stickRoot.position.set(this.position.x, this.position.y + 0.19, this.position.z);
    this.stickRoot.rotation.y = this.facing;
  }

  receiveHit(hit: HitInfo): HitResult {
    const res = emptyResult('flesh');
    if (!this.alive) { res.ignored = true; return res; }
    this.hp = Math.max(0, this.hp - hit.damage);
    res.damage = hit.damage;
    this.flash = 1.0;
    this.vel.x += hit.dir.x * 5.0;
    this.vel.z += hit.dir.z * 5.0;
    this.vel.y = 4.2;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.state = 'hurt';
      this.stateT = 0;
      this.stateDur = 0.35;
    }
    return res;
  }

  update(dt: number, target: EnemyTarget | null, camera: THREE.Camera, drawingBufferSize?: THREE.Vector2) {
    if (dt > 0) {
      this.stateT += dt;
      this.idleClock += dt;
      this.hopCooldown = Math.max(0, this.hopCooldown - dt);
      this.landT = Math.max(0, this.landT - dt);
      this.flash = Math.max(0, this.flash - dt * 4.5);

      if (!this.alive) {
        this.deadT += dt;
        this.vel.x = damp(this.vel.x, 0, 6, dt);
        this.vel.z = damp(this.vel.z, 0, 6, dt);
        this.vel.y -= 20 * dt;
        this.motor.update(dt);
      } else {
        const dist = target && target.alive
          ? Math.hypot(target.position.x - this.position.x, target.position.z - this.position.z)
          : 999;

        let speed = 0;
        if (this.state === 'hurt') {
          if (this.stateT >= this.stateDur) { this.state = 'flee'; this.stateT = 0; this.stateDur = 1.8; }
        } else if (dist < 3.6 && this.state !== 'flee') {
          this.state = 'flee';
          this.stateT = 0;
          this.stateDur = 1.6;
        }

        if (this.state === 'idle') {
          if (this.stateT >= this.stateDur) {
            this.state = 'hop';
            this.stateT = 0;
            this.stateDur = rand(1.2, 2.2);
            this.hopCooldown = Math.max(this.hopCooldown, 0.10);
            const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
            this.targetYaw = toHome > 7.5
              ? Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.5, 0.5)
              : this.facing + rand(-1.6, 1.6);
          }
        } else if (this.state === 'hop') {
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 8);
          if (this.motor.grounded) {
            if (this.hopCooldown <= 0) {
              this.vel.y = 4.4;
              this.hopCooldown = 0.28;
              speed = 2.5;
            } else {
              speed = 0;
            }
          } else {
            speed = 2.5;
          }
          if (this.stateT >= this.stateDur && this.motor.grounded) {
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.2, 2.8);
          }
        } else if (this.state === 'flee') {
          if (target && target.alive) {
            this.targetYaw = Math.atan2(this.position.x - target.position.x, this.position.z - target.position.z);
          }
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 11);
          if (this.motor.grounded) {
            if (this.hopCooldown <= 0) {
              this.vel.y = 5.2;
              this.hopCooldown = 0.14;
              speed = 4.8;
            } else {
              speed = 0.8;
            }
          } else {
            speed = 4.8;
          }
          if (this.stateT >= this.stateDur && dist > 5.0 && this.motor.grounded) {
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.0, 2.0);
          }
        }

        this.vel.x = damp(this.vel.x, Math.sin(this.facing) * speed, 9, dt);
        this.vel.z = damp(this.vel.z, Math.cos(this.facing) * speed, 9, dt);
        this.vel.y -= 20 * dt;
        this.motor.update(dt);
        if (!this.wasGrounded && this.motor.grounded) {
          this.landT = 0.11;
        }
        this.wasGrounded = this.motor.grounded;
        const targetPitch = !this.motor.grounded ? clamp(this.vel.y * 0.055, -0.28, 0.28) : 0;
        this.bodyPitch = damp(this.bodyPitch, targetPitch, 10, dt);
      }
      this.syncHurtbox();
    }

    let pose: RabbitPoseName;
    if (!this.alive || this.state === 'hurt') {
      pose = 'hurt';
    } else if (!this.motor.grounded) {
      if (this.vel.y > 2.8) pose = 'hop1';
      else if (this.vel.y > 1.0) pose = 'hop2';
      else if (this.vel.y > -1.0) pose = 'hop3';
      else pose = 'hop4';
    } else if (this.landT > 0) {
      pose = 'hop5';
    } else if (this.state === 'hop' || this.state === 'flee') {
      pose = 'hop0';
    } else {
      pose = sampleAnimalCycle(RABBIT_IDLE_FRAMES, this.idleClock * 2.4);
    }

    const deathSink = this.alive ? 0 : Math.min(0.14, this.deadT * 0.35);
    this.renderBillboard(getRabbitPosePack(pose), this.position.y + 0.19 - deathSink, camera, drawingBufferSize);
  }
}

// ============================================================================
// INSTÂNCIA: GALINHA DA ILHA
// ============================================================================
export class Chicken extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private home = new THREE.Vector3();
  private state: 'idle' | 'peck' | 'walk' | 'flee' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.0, 2.4);
  private targetYaw = rand(0, Math.PI * 2);
  private gaitPhase = rand(0, Math.PI * 2);
  private idleClock = rand(0, 10);

  constructor(ctx: GameContext, startPos: THREE.Vector3) {
    const pack = getChickenPosePack('idle0');
    super(ctx, pack.getView(2, 0)!, CHICKEN_PW, CHICKEN_PH, CHICKEN_W, CHICKEN_H, 'ChickenBillboard');
    this.hp = 25;
    this.maxHp = 25;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.22;
    this.motor.height = 0.42;
    this.motor.teleport(startPos);
    this.home.copy(startPos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.26, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.set(this.position.x, this.position.y + 0.20, this.position.z);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y + 0.12, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.34, this.position.z);
    this.hurtboxes[0].enabled = this.alive;
    this.stickRoot.position.set(this.position.x, this.position.y + 0.20, this.position.z);
    this.stickRoot.rotation.y = this.facing;
  }

  receiveHit(hit: HitInfo): HitResult {
    const res = emptyResult('flesh');
    if (!this.alive) { res.ignored = true; return res; }
    this.hp = Math.max(0, this.hp - hit.damage);
    res.damage = hit.damage;
    this.flash = 1.0;
    this.vel.x += hit.dir.x * 4.5;
    this.vel.z += hit.dir.z * 4.5;
    this.vel.y = 4.6;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.state = 'flee';
      this.stateT = 0;
      this.stateDur = 2.0;
    }
    return res;
  }

  update(dt: number, target: EnemyTarget | null, camera: THREE.Camera, drawingBufferSize?: THREE.Vector2) {
    if (dt > 0) {
      this.stateT += dt;
      this.idleClock += dt;
      this.flash = Math.max(0, this.flash - dt * 4.5);

      if (!this.alive) {
        this.deadT += dt;
        this.vel.x = damp(this.vel.x, 0, 6, dt);
        this.vel.z = damp(this.vel.z, 0, 6, dt);
        this.vel.y -= 18 * dt;
        this.motor.update(dt);
      } else {
        const dist = target && target.alive
          ? Math.hypot(target.position.x - this.position.x, target.position.z - this.position.z)
          : 999;

        let speed = 0;
        if (dist < 2.8 && this.state !== 'flee') {
          this.state = 'flee';
          this.stateT = 0;
          this.stateDur = 1.8;
          if (this.motor.grounded) this.vel.y = 4.2;
        }

        if (this.state === 'idle') {
          if (this.stateT >= this.stateDur) {
            this.state = Math.random() < 0.45 ? 'peck' : 'walk';
            this.stateT = 0;
            this.stateDur = rand(1.0, 2.4);
            const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
            this.targetYaw = toHome > 7.5
              ? Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.5, 0.5)
              : this.facing + rand(-1.8, 1.8);
          }
        } else if (this.state === 'peck') {
          if (this.stateT >= this.stateDur) {
            this.state = 'walk';
            this.stateT = 0;
            this.stateDur = rand(1.2, 2.4);
            this.targetYaw = this.facing + rand(-1.5, 1.5);
          }
        } else if (this.state === 'walk') {
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 6);
          speed = 1.6;
          if (this.stateT >= this.stateDur) {
            this.state = Math.random() < 0.5 ? 'peck' : 'idle';
            this.stateT = 0;
            this.stateDur = rand(0.9, 2.0);
          }
        } else if (this.state === 'flee') {
          if (target && target.alive) {
            this.targetYaw = Math.atan2(this.position.x - target.position.x, this.position.z - target.position.z);
          }
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 10);
          speed = 4.2;
          if (this.motor.grounded && Math.random() < dt * 2.5) this.vel.y = 3.8;
          if (this.stateT >= this.stateDur && dist > 4.2 && this.motor.grounded) {
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.0, 2.0);
          }
        }

        this.vel.x = damp(this.vel.x, Math.sin(this.facing) * speed, 8, dt);
        this.vel.z = damp(this.vel.z, Math.cos(this.facing) * speed, 8, dt);
        // Queda mais lenta quando bate asas
        const grav = !this.motor.grounded && this.vel.y < 0 ? 9.5 : 19;
        this.vel.y -= grav * dt;
        this.motor.update(dt);

        const horiz = Math.hypot(this.vel.x, this.vel.z);
        if (horiz > 0.2) this.gaitPhase += dt * (this.state === 'flee' ? 12 : 7.5);
      }
      this.syncHurtbox();
    }

    let pose: ChickenPoseName;
    if (!this.alive || !this.motor.grounded || this.state === 'flee') {
      pose = sampleAnimalCycle(CHICKEN_FLAP_FRAMES, this.idleClock * 11);
    } else if (this.state === 'peck') {
      pose = sampleAnimalCycle(CHICKEN_PECK_FRAMES, this.stateT * 5.0);
    } else if (this.state === 'walk') {
      pose = sampleAnimalCycle(CHICKEN_WALK_FRAMES, (this.gaitPhase / (Math.PI * 2)) * 6);
    } else {
      pose = sampleAnimalCycle(CHICKEN_IDLE_FRAMES, this.idleClock * 2.2);
    }

    const horiz = Math.hypot(this.vel.x, this.vel.z);
    const bob = this.alive && this.motor.grounded && horiz > 0.2 ? Math.abs(Math.sin(this.gaitPhase)) * 0.022 : 0;
    const deathSink = this.alive ? 0 : Math.min(0.14, this.deadT * 0.35);
    this.renderBillboard(getChickenPosePack(pose), this.position.y + 0.20 + bob - deathSink, camera, drawingBufferSize);
  }
}
