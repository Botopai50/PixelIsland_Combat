import * as THREE from 'three';
import { ANIMAL_SPRITE_POSES } from './AnimalSpritePoses';
import { sampleAnimalCycle } from './AnimalAnimation';
import { hasAnimalSpriteAtlas, readAnimalSpriteAtlas } from './AnimalSpriteAtlas';
import { ANIMAL_ATLAS_TOP, ANIMAL_ATLAS_BOTTOM, animalAtlasDirectionCount } from './AnimalSpriteAtlasLayout';

export interface SpriteRecipe { module: string; factory: string; args: unknown[]; asymmetric?: boolean }
export interface SpriteView { tier: number; direction: number; sunPitch?: number }
export interface SpritePixels { data: Uint8Array; width: number; height: number }
interface SpritePack {
  getView(tier: number, direction: number, budgetAware?: boolean, allowNull?: boolean): THREE.CanvasTexture | null;
  getTop?(): THREE.CanvasTexture;
  getBottom?(): THREE.CanvasTexture;
  getSunView?(direction: number, pitch: number, budgetAware?: boolean): THREE.CanvasTexture | null;
}
const originalViews = new WeakMap<SpritePack, SpritePack>();
type Submit = (recipe: SpriteRecipe, view: SpriteView, done: (pixels: SpritePixels | null) => void, urgent: boolean) => boolean;
let submit: Submit | undefined;
let spriteStreamingStarted = false;
const registered = new WeakSet<object>();
const sharedViews = new Map<string, Map<number, THREE.CanvasTexture>>();
const pendingViews = new WeakMap<Map<number, THREE.CanvasTexture>, Set<number>>();
const resolvedViews = new WeakMap<object, SpriteView>();
const animationBanks = new Map<string, { recipes: SpriteRecipe[]; readyViews: Set<number> }>();
const packBanks = new WeakMap<object, { recipes: SpriteRecipe[]; readyViews: Set<number> }>();
const packRecipes = new WeakMap<object, SpriteRecipe>();
const factories = new Map<string, (args: unknown[]) => SpritePack>();
const restCycles = new Map<string, readonly string[]>();
const recipeKey = (recipe: SpriteRecipe) => JSON.stringify(recipe);
const loadingTexture = textureFromPixels({ data: new Uint8Array(4), width: 1, height: 1 });
function viewsFor(recipe: SpriteRecipe) {
  const key = recipeKey(recipe);
  let cache = sharedViews.get(key);
  if (!cache) { cache = new Map(); sharedViews.set(key, cache); }
  return cache;
}

function markReadyViews(bank: { recipes: SpriteRecipe[]; readyViews: Set<number> }) {
  const first = bank.recipes[0];
  if (!first) return;
  for (const key of viewsFor(first).keys()) {
    if (bank.recipes.every(next => viewsFor(next).has(key))) bank.readyViews.add(key);
  }
}

export function getResolvedAnimalView(pack: object) { return resolvedViews.get(pack); }

export function startAnimalSpriteStreaming() { spriteStreamingStarted = true; }

/** O mapa pede o ângulo exato para exportação, mesmo enquanto o jogo usa outro ângulo. */
export async function readAnimalCatalogView(pack: SpritePack, tier: number, direction: number) {
  const recipe = packRecipes.get(pack);
  if (recipe && hasAnimalSpriteAtlas(recipe, tier)) {
    const views = viewsFor(recipe);
    const key = tier * 32 + direction;
    const cached = views.get(key);
    if (cached) return cached;
    const pixels = await readAnimalSpriteAtlas(recipe, tier, direction);
    if (pixels) {
      const texture = views.get(key) ?? textureFromPixels(pixels);
      views.set(key, texture);
      return texture;
    }
  }
  const source = originalViews.get(pack) ?? pack;
  if (tier === ANIMAL_ATLAS_TOP) return source.getTop?.();
  if (tier === ANIMAL_ATLAS_BOTTOM) return source.getBottom?.();
  return source.getView(tier, direction);
}

export function isAnimalLocomotionPack(pack: object) {
  const pose = String(packRecipes.get(pack)?.args[0] ?? '');
  return /^(walk|run|trot|crawl|waddle|scuttle|slither|dash|flee|prowl|creep|move)/i.test(pose);
}

export function animalRestPack<T extends SpritePack>(pack: T, elapsed: number): T {
  const recipe = packRecipes.get(pack);
  if (!recipe) return pack;
  const familyKey = `${recipe.module}:${recipe.factory}`;
  const build = factories.get(familyKey);
  let frames = restCycles.get(familyKey);
  if (!frames) {
    const available = ANIMAL_SPRITE_POSES[familyKey] ?? [];
    const idle = available.filter(pose => /^(idle|rest|perch|stand|sit|breathe)\d+$/i.test(pose));
    frames = idle.length === 3 ? [idle[0], idle[1], idle[0], idle[2]] : idle;
    // Espécies sem arte de repouso própria pousam na pose neutra, em vez de prender uma passada.
    if (!frames.length) frames = available.filter(pose => /^(walk|crawl|move)0$/i.test(pose)).slice(0, 1);
    restCycles.set(familyKey, frames);
  }
  if (!build || !frames.length) return pack;
  const pose = sampleAnimalCycle(frames, elapsed * 2);
  const next = { ...recipe, args: [pose, ...recipe.args.slice(1)] };
  return registerAnimalSpritePack(build(next.args) as T, next);
}

/** Aquecer o próximo ângulo sem abandonar o ângulo que a instância está desenhando. */
export function ensureAnimalSpriteView(pack: object, tier: number, direction: number, urgent = true) {
  const family = packBanks.get(pack);
  if (!family) return true;
  const first = family.recipes[0];
  if (!submit && (!first || !hasAnimalSpriteAtlas(first, tier))) return true;
  const key = tier * 32 + direction;
  if (family.readyViews.has(key)) return true;
  if (family.recipes.every(next => viewsFor(next).has(key))) {
    family.readyViews.add(key);
    return true;
  }
  for (const next of family.recipes) requestView(next, tier, direction, urgent);
  return false;
}

function requestView(recipe: SpriteRecipe, tier: number, direction: number, urgent: boolean) {
  if (tier < 0 || tier > ANIMAL_ATLAS_BOTTOM || direction < 0 || direction >= animalAtlasDirectionCount(tier, recipe.asymmetric)) return;
  const stored = hasAnimalSpriteAtlas(recipe, tier);
  if (!stored && !submit) return;
  const views = viewsFor(recipe), key = tier * 32 + direction;
  let pending = pendingViews.get(views);
  if (!pending) { pending = new Set(); pendingViews.set(views, pending); }
  if (views.has(key) || pending.has(key)) return;
  pending.add(key);
  const publish = (pixels: SpritePixels | null) => {
    pending.delete(key);
    if (pixels && !views.has(key)) views.set(key, textureFromPixels(pixels));
  };
  if (stored) {
    void readAnimalSpriteAtlas(recipe, tier, direction).then(publish);
    return;
  }
  const accepted = submit?.(recipe, { tier, direction }, publish, urgent);
  if (!accepted) pending.delete(key);
}

/** Sem workers (incluindo testes e o próprio worker), usa o renderizador original. */
export function setAnimalSpriteWorker(provider: Submit | undefined) { submit = provider; }

function textureFromPixels(pixels: SpritePixels): THREE.CanvasTexture {
  const tex = new THREE.DataTexture(pixels.data, pixels.width, pixels.height, THREE.RGBAFormat);
  tex.flipY = true;
  tex.magFilter = tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex as unknown as THREE.CanvasTexture;
}

export function registerAnimalSpritePack<T extends SpritePack, A extends unknown[] = unknown[]>(pack: T, recipe: SpriteRecipe, build?: (...args: A) => T): T {
  packRecipes.set(pack, recipe);
  const factoryKey = `${recipe.module}:${recipe.factory}`;
  if (build && !factories.has(factoryKey)) factories.set(factoryKey, args => build(...args as A));
  if ((!submit && !hasAnimalSpriteAtlas(recipe, 4)) || registered.has(pack)) return pack;
  registered.add(pack);
  const pose = String(recipe.args[0]);
  const cycle = pose.replace(/\d+$/, '');
  const bankKey = `${factoryKey}:${JSON.stringify(recipe.args.slice(1))}:${cycle}`;
  let bank = animationBanks.get(bankKey);
  if (!bank) {
    const poses = ANIMAL_SPRITE_POSES[factoryKey] ?? [];
    const frames = poses.includes(pose) ? poses.filter(next => next.replace(/\d+$/, '') === cycle) : [pose];
    bank = { recipes: frames.map(next => ({ ...recipe, args: [next, ...recipe.args.slice(1)] })), readyViews: new Set() };
    markReadyViews(bank);
    animationBanks.set(bankKey, bank);
  }
  packBanks.set(pack, bank);
  const original = pack.getView.bind(pack);
  originalViews.set(pack, {
    getView: original,
    getTop: pack.getTop?.bind(pack),
    getBottom: pack.getBottom?.bind(pack),
  });
  // Cada pose tem seu próprio cache. Nunca buscar um quadro de outra fase da animação.
  const views = viewsFor(recipe);
  const request = (tier: number, direction: number, urgent: boolean) => {
    requestView(recipe, tier, direction, urgent);
  };
  const prefetch = (tier: number, direction: number) => {
    request(tier, recipe.asymmetric ? (direction + 15) % 16 : direction - 1, false);
    request(tier, recipe.asymmetric ? (direction + 1) % 16 : direction + 1, false);
    if (hasAnimalSpriteAtlas(recipe, tier)) return;
    request(tier - 1, direction, false);
    request(tier + 1, direction, false);
  };
  const viewDistance = (candidate: number, tier: number, direction: number) => {
    const horizontal = Math.abs(candidate % 32 - direction);
    return Math.abs(Math.floor(candidate / 32) - tier) * 2
      + (recipe.asymmetric ? Math.min(horizontal, 16 - horizontal) : horizontal);
  };
  pack.getView = (tier, direction, budgetAware, allowNull) => {
    const stored = hasAnimalSpriteAtlas(recipe, tier);
    // Os construtores usam uma vista provisória. A câmera escolhe a primeira vista a baixar.
    if (stored && !spriteStreamingStarted) return allowNull ? null : loadingTexture;
    if (!submit && !stored && !views.size) return original(tier, direction, budgetAware, allowNull);
    const key = tier * 32 + direction;
    if (!bank.readyViews.has(key) && bank.recipes.every(next => viewsFor(next).has(key))) bank.readyViews.add(key);
    const exact = views.get(key);
    if (exact && bank.readyViews.has(key)) {
      resolvedViews.set(pack, { tier, direction });
      prefetch(tier, direction);
      return exact;
    }
    // Preparar o ciclo atual em background; poses de outras ações não bloqueiam esta vista.
    for (const next of bank.recipes) requestView(next, tier, direction, true);
    let nearest: THREE.CanvasTexture | undefined;
    let distance = Infinity;
    for (const candidate of bank.readyViews) {
      const delta = viewDistance(candidate, tier, direction);
      if (delta < distance && views.has(candidate)) {
        distance = delta; nearest = views.get(candidate);
        resolvedViews.set(pack, { tier: Math.floor(candidate / 32), direction: candidate % 32 });
      }
    }
    if (nearest) {
      return nearest;
    }
    // Enquanto o ciclo é preparado, ainda pode faltar um ângulo comum a todas as poses.
    if (exact) { resolvedViews.set(pack, { tier, direction }); return exact; }
    for (const [candidate, tex] of views) {
      if (candidate >= ANIMAL_ATLAS_TOP * 32) continue;
      const delta = viewDistance(candidate, tier, direction);
      if (delta < distance) {
        distance = delta; nearest = tex;
        resolvedViews.set(pack, { tier: Math.floor(candidate / 32), direction: candidate % 32 });
      }
    }
    if (nearest) return nearest;
    if (stored) return allowNull ? null : loadingTexture;
    // Primeira vista desta pose: publicar um quadro correto, nunca congelar a animação.
    const initial = original(tier, direction, false, false);
    if (initial) { views.set(key, initial); resolvedViews.set(pack, { tier, direction }); prefetch(tier, direction); }
    return initial;
  };
  const readPole = (tier: number, render: () => THREE.CanvasTexture) => {
    const stored = views.get(tier * 32);
    if (stored) return stored;
    if (!hasAnimalSpriteAtlas(recipe, tier)) return render();
    request(tier, 0, true);
    return loadingTexture;
  };
  if (pack.getTop) {
    const render = pack.getTop.bind(pack);
    pack.getTop = () => readPole(ANIMAL_ATLAS_TOP, render);
  }
  if (pack.getBottom) {
    const render = pack.getBottom.bind(pack);
    pack.getBottom = () => readPole(ANIMAL_ATLAS_BOTTOM, render);
  }
  if (pack.getSunView) {
    const originalShadow = pack.getSunView.bind(pack);
    const shadows = new Map<number, THREE.CanvasTexture>();
    const shadowPending = new Set<number>();
    pack.getSunView = (direction, pitch, budgetAware) => {
      if (!submit) return originalShadow(direction, pitch, budgetAware);
      const key = Math.round(pitch) * 32 + direction;
      const exact = shadows.get(key);
      if (exact) return exact;
      if (!shadowPending.has(key)) {
        shadowPending.add(key);
        const accepted = submit(recipe, { tier: 0, direction, sunPitch: pitch }, pixels => {
          shadowPending.delete(key);
          if (pixels) shadows.set(key, textureFromPixels(pixels));
        }, false);
        if (!accepted) shadowPending.delete(key);
      }
      // Enquanto prepara a silhueta do Sol, usar a mesma pose que já está pronta.
      return shadows.values().next().value ?? views.values().next().value ?? null;
    };
  }
  return pack;
}
