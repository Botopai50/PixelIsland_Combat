import { ANIMAL_ATLAS_HEADER_BYTES, ANIMAL_ATLAS_TOP, ANIMAL_ATLAS_BOTTOM, animalAtlasDirectionCount, animalAtlasFolder } from './AnimalSpriteAtlasLayout';
import type { SpritePixels, SpriteRecipe } from './AnimalSpriteCache';
import { ANIMAL_SPRITE_POSES } from './AnimalSpritePoses';

const MAX_ATLAS_BYTES = 96 * 1024 * 1024;
const pending = new Map<string, Promise<Uint8Array | null>>();
const decoded = new Map<string, Uint8Array>();
const unavailable = new Set<string>();
let decodedBytes = 0;

function atlasPath(recipe: SpriteRecipe, tier: number) {
  const folder = animalAtlasFolder(recipe.module, recipe.factory, recipe.args.slice(1));
  return `${folder}/${tier}.rgba.gz`;
}

export function hasAnimalSpriteAtlas(recipe: SpriteRecipe, tier: number) {
  return import.meta.env.PROD && typeof document !== 'undefined' && typeof DecompressionStream !== 'undefined' &&
    tier >= 0 && tier <= ANIMAL_ATLAS_BOTTOM &&
    !!ANIMAL_SPRITE_POSES[`${recipe.module}:${recipe.factory}`]?.includes(String(recipe.args[0])) &&
    !unavailable.has(atlasPath(recipe, tier));
}

async function loadAtlas(path: string): Promise<Uint8Array | null> {
  try {
    const url = new URL(`sprites/${path}`, new URL(import.meta.env.BASE_URL, document.baseURI));
    // O hash do bundle muda junto com a arte e a ordem dos quadros.
    url.searchParams.set('v', new URL(import.meta.url).pathname.split('/').at(-1) ?? '');
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!response.ok || !response.body) throw new Error(`Sprite atlas HTTP ${response.status}`);
    const stream = response.body.pipeThrough(new DecompressionStream('gzip'));
    const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
    if (bytes.length <= ANIMAL_ATLAS_HEADER_BYTES) throw new Error('Empty sprite atlas');
    decoded.set(path, bytes);
    decodedBytes += bytes.byteLength;
    for (const [key, old] of decoded) {
      if (decodedBytes <= MAX_ATLAS_BYTES) break;
      decoded.delete(key);
      decodedBytes -= old.byteLength;
    }
    return bytes;
  } catch {
    unavailable.add(path);
    return null;
  }
}

export function readAnimalSpriteAtlas(recipe: SpriteRecipe, tier: number, direction: number): Promise<SpritePixels | null> {
  const path = atlasPath(recipe, tier);
  const cached = decoded.get(path);
  let source: Promise<Uint8Array | null>;
  if (cached) {
    decoded.delete(path);
    decoded.set(path, cached);
    source = Promise.resolve(cached);
  } else {
    source = pending.get(path) ?? loadAtlas(path).finally(() => pending.delete(path));
    pending.set(path, source);
  }
  return source.then(bytes => {
    if (!bytes) return null;
    const layout = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const poses = ANIMAL_SPRITE_POSES[`${recipe.module}:${recipe.factory}`];
    const poseIndex = poses.indexOf(String(recipe.args[0]));
    if (tier >= ANIMAL_ATLAS_TOP) {
      let offset = 0;
      for (let i = 0; i <= poseIndex && offset + ANIMAL_ATLAS_HEADER_BYTES <= bytes.length; i++) {
        const width = layout.getUint16(offset, true), height = layout.getUint16(offset + 2, true);
        const start = offset + ANIMAL_ATLAS_HEADER_BYTES;
        offset = start + width * height * 4;
        if (i === poseIndex && offset <= bytes.length) return { width, height, data: bytes.slice(start, offset) };
      }
      unavailable.add(path);
      return null;
    }
    const width = layout.getUint16(0, true), height = layout.getUint16(2, true);
    const directions = animalAtlasDirectionCount(tier, recipe.asymmetric);
    const size = width * height * 4;
    if (!size || bytes.length !== ANIMAL_ATLAS_HEADER_BYTES + size * poses.length * directions) {
      unavailable.add(path);
      return null;
    }
    const offset = ANIMAL_ATLAS_HEADER_BYTES + size * (poseIndex * directions + direction);
    return { width, height, data: bytes.slice(offset, offset + size) };
  });
}
