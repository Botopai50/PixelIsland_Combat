import { type animalTurnProfile, type AnimalTurnPose } from './AnimalTurnPose';
import * as THREE from 'three';
import { ANIMAL_SPRITE_POSES } from './AnimalSpritePoses';
import { sampleAnimalCycle } from './AnimalAnimation';

interface SpriteResolution { width: number; height: number }
export interface SpriteRecipe {
  module: string;
  factory: string;
  args: unknown[];
  asymmetric?: boolean;
  resolution?: SpriteResolution;
  turn?: AnimalTurnPose;
}
export interface SpriteView { tier: number; direction: number; sunPitch?: number }
export interface SpritePixels { data: Uint8Array; width: number; height: number }
interface SpritePack {
  renderView?(tier: number, direction: number, width: number, height: number, turn?: AnimalTurnPose, profile?: ReturnType<typeof animalTurnProfile>): THREE.CanvasTexture;
  getView(tier: number, direction: number, budgetAware?: boolean, allowNull?: boolean): THREE.CanvasTexture | null;
  getSunView?(direction: number, pitch: number, budgetAware?: boolean): THREE.CanvasTexture | null;
}
type Submit = (recipe: SpriteRecipe, view: SpriteView, done: (pixels: SpritePixels | null) => void, urgent: boolean) => boolean;
let submit: Submit | undefined;
const registered = new WeakSet<object>();
const sharedViews = new Map<string, Map<number, THREE.CanvasTexture>>();
const pendingViews = new WeakMap<Map<number, THREE.CanvasTexture>, Set<number>>();
const resolvedViews = new WeakMap<object, SpriteView>();
const families = new Map<string, SpriteFamily>();
const animationBanks = new Map<string, { recipes: SpriteRecipe[]; readyViews: Set<number> }>();
interface SpriteFamily {
  recipes: SpriteRecipe[];
  view: SpriteView;
  ready: Promise<void>;
  detail: Map<number, string>;
}
const packFamilies = new WeakMap<object, SpriteFamily>();
const packBanks = new WeakMap<object, { recipes: SpriteRecipe[]; readyViews: Set<number> }>();
const packRecipes = new WeakMap<object, SpriteRecipe>();
const factories = new Map<string, (args: unknown[]) => SpritePack>();
const restCycles = new Map<string, readonly string[]>();
const recipeKey = (recipe: SpriteRecipe) => JSON.stringify(recipe);
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

// Só as vistas detalhadas entram neste cache. As vistas leves continuam disponíveis
// durante uma troca de ângulo, mesmo quando o orçamento de textura está ocupado.
const densityViews = new Map<string, THREE.CanvasTexture>();
const densityPending = new Map<string, Promise<THREE.CanvasTexture | undefined>>();
const densityCacheLimit = 96 * 1024 * 1024;
// A textura precisa de pelo menos uma linha por célula na tela. Estes degraus
// evitam uma nova textura a cada movimento da câmera.
const densityLevels = [64, 96, 128, 160, 224, 320, 448, Infinity];
let densityBytes = 0;

function cacheDensityView(key: string, texture: THREE.CanvasTexture) {
  densityViews.set(key, texture);
  densityBytes += texture.image.width * texture.image.height * 4;
  for (const [oldKey, oldTexture] of densityViews) {
    if (densityBytes <= densityCacheLimit) break;
    densityBytes -= oldTexture.image.width * oldTexture.image.height * 4;
    densityViews.delete(oldKey);
    oldTexture.dispose();
  }
}

function requestDensityView(
  recipe: SpriteRecipe, view: SpriteView, key: string, resolution: SpriteResolution, urgent = false,
) {
  const pending = densityPending.get(key);
  if (pending) return pending;
  if (!submit || (!urgent && densityPending.size >= 12)) return undefined;
  let finish!: (texture: THREE.CanvasTexture | undefined) => void;
  const result = new Promise<THREE.CanvasTexture | undefined>(resolve => { finish = resolve; });
  densityPending.set(key, result);
  const accepted = submit({ ...recipe, resolution }, view, pixels => {
    densityPending.delete(key);
    if (!pixels || pixels.width !== resolution.width || pixels.height !== resolution.height) {
      finish(undefined);
      return;
    }
    const texture = textureFromPixels(pixels);
    cacheDensityView(key, texture);
    finish(texture);
  }, urgent || (!!recipe.turn && resolution.height <= 160));
  if (accepted) return result;
  densityPending.delete(key);
  finish(undefined);
  return undefined;
}

function densitySuffix(view: SpriteView, { width, height }: SpriteResolution) {
  return `:${width}x${height}:${view.tier}:${view.direction}`;
}

export function getReadyAnimalSprite(pack: SpritePack, view: SpriteView, resolution: SpriteResolution) {
  const recipe = packRecipes.get(pack);
  return recipe && densityViews.get(recipeKey(recipe) + densitySuffix(view, resolution));
}

export function requestAnimalSprite(
  pack: SpritePack, view: SpriteView, resolution: SpriteResolution,
): Promise<THREE.CanvasTexture | undefined> | undefined {
  const recipe = packRecipes.get(pack);
  if (!recipe || !pack.renderView) return undefined;
  const key = recipeKey(recipe) + densitySuffix(view, resolution);
  const ready = getReadyAnimalSprite(pack, view, resolution);
  if (ready) return Promise.resolve(ready);
  return requestDensityView(recipe, view, key, resolution, true);
}

export function getAnimalTurnTexture(
  pack: SpritePack,
  resolution: SpriteResolution,
  visibleRows: number,
  pose: AnimalTurnPose,
  mirrored: boolean,
) {
  const recipe = packRecipes.get(pack);
  const view = getResolvedAnimalView(pack);
  if (!recipe || !view || !pack.renderView || visibleRows < 12) return undefined;
  if (/^(bite|slam|stomp|attack|strike|swipe|roots|sweep|stones|charge|pounce|death|hurt|peck|snap)/i.test(String(recipe.args[0]))) return undefined;
  const { width, height } = resolution;
  const turn = mirrored ? { look: -pose.look, step: -pose.step } : pose;
  const keyFor = (value: AnimalTurnPose) =>
    `${recipeKey(recipe)}:turn:${width}x${height}:${view.tier}:${view.direction}:${value.look}:${value.step}`;
  const key = keyFor(turn);
  const cached = densityViews.get(key);
  if (cached) {
    densityViews.delete(key);
    densityViews.set(key, cached);
    return cached;
  }
  const glance = { look: turn.look, step: 0 };
  const glanceKey = keyFor(glance);
  const cachedGlance = densityViews.get(glanceKey);
  if (turn.step !== 0 && !cachedGlance) {
    requestDensityView({ ...recipe, turn: glance }, view, glanceKey, { width, height });
  }
  requestDensityView({ ...recipe, turn }, view, key, { width, height });
  const alternate = { look: Math.sign(turn.look) * (Math.abs(turn.look) === 2 ? 1 : 2), step: 0 };
  return cachedGlance ?? densityViews.get(keyFor(alternate));
}

export function getAnimalDensityTexture(
  pack: SpritePack,
  fallback: THREE.CanvasTexture,
  resolution: SpriteResolution,
  visibleRows: number,
  pole = 0,
) {
  const source = fallback.image;
  if (source.width === resolution.width && source.height === resolution.height) return fallback;
  // A versão leve tem detalhe suficiente se a projeção não ocupa suas linhas.
  if (source.height <= resolution.height && visibleRows < source.height * .85) return fallback;
  const recipe = packRecipes.get(pack);
  const view = pole ? { tier: pole > 0 ? 9 : 10, direction: 0 } : getResolvedAnimalView(pack);
  if (!submit || !pack.renderView || !recipe || !view) return fallback;

  const needed = densityLevels.find(limit => limit >= visibleRows / .85) ?? Infinity;
  // Idle, caminhada e ataques precisam trocar juntos. Se só o ciclo atual
  // promovesse, trocar de ação faria o mesmo ser voltar aos pixels grandes.
  const family = packFamilies.get(pack);
  const frames = family?.recipes.length ? family.recipes : [recipe];
  const nativeLevel = densityLevels.find(level => level >= resolution.height) ?? Infinity;
  const preferredLevel = Math.min(needed, nativeLevel);
  let ready: THREE.CanvasTexture | undefined;
  let displayedLevel = 0;
  for (let i = densityLevels.indexOf(preferredLevel); i >= 0; i--) {
    const level = densityLevels[i];
    const height = Math.min(resolution.height, level);
    if (height < source.height && height !== resolution.height) break;
    const width = Math.max(1, Math.round(resolution.width * height / resolution.height));
    if (height === source.height && width === source.width) continue;
    const size = { width, height };
    const suffix = densitySuffix(view, size);
    let complete = true;
    for (const frame of frames) {
      const frameKey = recipeKey(frame) + suffix;
      const texture = densityViews.get(frameKey);
      if (texture) {
        densityViews.delete(frameKey);
        densityViews.set(frameKey, texture);
      } else {
        complete = false;
      }
    }
    // A densidade vale para todos os quadros do ser neste ângulo.
    if (complete) {
      ready = densityViews.get(recipeKey(recipe) + suffix);
      if (ready) {
        displayedLevel = level;
        family?.detail.set(view.tier * 32 + view.direction, suffix);
        break;
      }
    }
  }
  // First make the same moderate detail available to every pose, then fill
  // the closest tier. This avoids queuing dozens of large renders on approach.
  const nextLevel = displayedLevel < 160 && source.height < 160 ? Math.min(preferredLevel, 160) : preferredLevel;
  if (nextLevel > displayedLevel) {
    const height = Math.min(resolution.height, nextLevel);
    const width = Math.max(1, Math.round(resolution.width * height / resolution.height));
    if (height !== source.height || width !== source.width) {
      const size = { width, height };
      const suffix = densitySuffix(view, size);
      let pending = 0;
      for (const frame of frames) {
        const key = recipeKey(frame) + suffix;
        if (densityPending.has(key)) pending++;
      }
      for (const frame of frames) {
        if (pending >= 4) break;
        const key = recipeKey(frame) + suffix;
        if (!densityViews.has(key) && !densityPending.has(key) && requestDensityView(frame, view, key, size)) pending++;
      }
    }
  }
  return ready ?? fallback;
}

function hasDetailedView(family: SpriteFamily | undefined, key: number) {
  const suffix = family?.detail.get(key);
  if (!suffix || !family) return undefined;
  if (family.recipes.every(frame => densityViews.has(recipeKey(frame) + suffix))) return suffix;
  family.detail.delete(key);
  return undefined;
}

export function getResolvedAnimalView(pack: object) { return resolvedViews.get(pack); }

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
  if (!submit || !family) return true;
  if (hasDetailedView(packFamilies.get(pack), tier * 32 + direction)) return true;
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
  if (!submit || tier < 0 || tier > 8 || direction < 0 || direction > (recipe.asymmetric ? 15 : 8)) return;
  const views = viewsFor(recipe), key = tier * 32 + direction;
  let pending = pendingViews.get(views);
  if (!pending) { pending = new Set(); pendingViews.set(views, pending); }
  if (views.has(key) || pending.has(key)) return;
  pending.add(key);
  const accepted = submit(recipe, { tier, direction }, pixels => {
    pending.delete(key);
    if (pixels && !views.has(key)) views.set(key, textureFromPixels(pixels));
  }, urgent);
  if (!accepted) pending.delete(key);
}

function prepareFamily(recipe: SpriteRecipe) {
  const key = `${recipe.module}:${recipe.factory}:${JSON.stringify(recipe.args.slice(1))}`;
  let family = families.get(key);
  if (family) return family;
  const recipes = (ANIMAL_SPRITE_POSES[`${recipe.module}:${recipe.factory}`] ?? [String(recipe.args[0])])
    .map(pose => ({ ...recipe, args: [pose, ...recipe.args.slice(1)] }));
  const state: SpriteFamily = { view: { tier: 4, direction: 0 }, ready: Promise.resolve(), recipes, detail: new Map() };
  family = state;
  families.set(key, state);
  state.ready = (async () => {
    // Deixa o primeiro frame escolher o ângulo real da câmera antes do aquecimento.
    await new Promise(resolve => setTimeout(resolve, 150));
    const view = { ...state.view };
    const warmView = async (next: SpriteRecipe, view: SpriteView) => {
      if (!submit) return;
      const cache = viewsFor(next);
      const viewKey = view.tier * 32 + view.direction;
      if (cache.has(viewKey)) return;
      await new Promise<void>(resolve => {
        const attempt = () => {
          if (!submit) { resolve(); return; }
          const accepted = submit(next, view, pixels => {
            if (pixels && !cache.has(viewKey)) cache.set(viewKey, textureFromPixels(pixels));
            resolve();
          }, false);
          if (!accepted) setTimeout(attempt, 25);
        };
        attempt();
      });
    };
    for (const next of recipes) await warmView(next, view);
    // Animal parado: preparar os lados e as costas, sem esperar por poses de salto/ataque.
    const resting = recipes.filter(next => /^(idle|rest|perch|stand|sit|breathe)\d+$/i.test(String(next.args[0])));
    for (let direction = 0; direction <= (recipe.asymmetric ? 15 : 8); direction++) {
      for (const next of resting) await warmView(next, { tier: view.tier, direction });
    }
    for (const [bankKey, bank] of animationBanks) {
      if (bankKey.startsWith(`${key}:`)) markReadyViews(bank);
    }
  })();
  return state;
}

/** Todas as fases dos animais presentes ficam prontas antes de habilitar Jogar. */
export async function waitForAnimalSprites() {
  await Promise.all([...families.values()].map(family => family.ready));
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
  if (!submit || registered.has(pack)) return pack;
  registered.add(pack);
  const family = prepareFamily(recipe);
  if (!family.recipes.some(frame => recipeKey(frame) === recipeKey(recipe))) family.recipes.push(recipe);
  packFamilies.set(pack, family);
  const cycle = String(recipe.args[0]).replace(/\d+$/, '');
  const bankKey = `${recipe.module}:${recipe.factory}:${JSON.stringify(recipe.args.slice(1))}:${cycle}`;
  let bank = animationBanks.get(bankKey);
  if (!bank) {
    bank = { recipes: family.recipes.filter(next => String(next.args[0]).replace(/\d+$/, '') === cycle), readyViews: new Set() };
    markReadyViews(bank);
    animationBanks.set(bankKey, bank);
  }
  packBanks.set(pack, bank);
  const original = pack.getView.bind(pack);
  // Cada pose tem seu próprio cache. Nunca buscar um quadro de outra fase da animação.
  const views = viewsFor(recipe);
  const request = (tier: number, direction: number, urgent: boolean) => {
    requestView(recipe, tier, direction, urgent);
  };
  const prefetch = (tier: number, direction: number) => {
    request(tier, recipe.asymmetric ? (direction + 15) % 16 : direction - 1, false);
    request(tier, recipe.asymmetric ? (direction + 1) % 16 : direction + 1, false);
    request(tier - 1, direction, false);
    request(tier + 1, direction, false);
  };
  const viewDistance = (candidate: number, tier: number, direction: number) => {
    const horizontal = Math.abs(candidate % 32 - direction);
    return Math.abs(Math.floor(candidate / 32) - tier) * 2
      + (recipe.asymmetric ? Math.min(horizontal, 16 - horizontal) : horizontal);
  };
  pack.getView = (tier, direction, budgetAware, allowNull) => {
    if (!submit) return original(tier, direction, budgetAware, allowNull);
    family.view = { tier, direction };
    const key = tier * 32 + direction;
    if (!bank.readyViews.has(key) && bank.recipes.every(next => viewsFor(next).has(key))) bank.readyViews.add(key);
    const exact = views.get(key);
    if (exact && bank.readyViews.has(key)) {
      resolvedViews.set(pack, { tier, direction });
      prefetch(tier, direction);
      return exact;
    }
    // A vista detalhada já contém a ação no ângulo certo, mesmo se a fila
    // das miniaturas ainda estiver preparando a versão leve desta ação.
    const suffix = hasDetailedView(family, key);
    const detailed = suffix && densityViews.get(recipeKey(recipe) + suffix);
    if (detailed) {
      resolvedViews.set(pack, { tier, direction });
      return detailed;
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
    // Só durante a preparação inicial, antes de Jogar, ainda pode faltar uma vista comum.
    if (exact) { resolvedViews.set(pack, { tier, direction }); return exact; }
    for (const [candidate, tex] of views) {
      const delta = viewDistance(candidate, tier, direction);
      if (delta < distance) {
        distance = delta; nearest = tex;
        resolvedViews.set(pack, { tier: Math.floor(candidate / 32), direction: candidate % 32 });
      }
    }
    if (nearest) return nearest;
    // Primeira vista desta pose: publicar um quadro correto, nunca congelar a animação.
    const initial = original(tier, direction, false, false);
    if (initial) { views.set(key, initial); resolvedViews.set(pack, { tier, direction }); prefetch(tier, direction); }
    return initial;
  };
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
