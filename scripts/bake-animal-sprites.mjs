import { mkdir, readdir, writeFile } from 'node:fs/promises';
import { availableParallelism } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { Worker, isMainThread, workerData } from 'node:worker_threads';
import { gzipSync } from 'node:zlib';
import { ANIMAL_SPRITE_POSES } from '../src/engine/enemies/AnimalSpritePoses.ts';
import {
  ANIMAL_ATLAS_HEADER_BYTES, ANIMAL_ATLAS_TOP, ANIMAL_ATLAS_BOTTOM, ASYMMETRIC_ATLAS_FACTORIES,
  FISH_ATLAS_SPECIES, animalAtlasDirectionCount, animalAtlasFolder,
} from '../src/engine/enemies/AnimalSpriteAtlasLayout.ts';

async function bakeFamily({ bundle, root, module, factory, poses, variant, folder }) {
  let complete;
  globalThis.self = { postMessage: message => complete(message) };
  await import(bundle);
  const asymmetric = ASYMMETRIC_ATLAS_FACTORIES.has(factory);
  const directory = join(root, folder);
  await mkdir(directory, { recursive: true });
  async function render(pose, tier, direction) {
    const recipe = { module, factory, args: [pose, ...variant], asymmetric };
    const result = await new Promise(resolveFrame => {
      complete = resolveFrame;
      self.onmessage({ data: { id: 0, recipe, view: { tier, direction } } });
    });
    if (result.error) throw new Error(`${folder}/${pose}/${tier}/${direction}: ${result.error}`);
    return result.pixels;
  }

  for (let tier = 0; tier <= ANIMAL_ATLAS_BOTTOM; tier++) {
    const filename = `${tier}.rgba.gz`;
    const directions = animalAtlasDirectionCount(tier, asymmetric);
    if (tier >= ANIMAL_ATLAS_TOP) {
      const frames = [];
      for (const pose of poses) {
        const frame = await render(pose, tier, 0);
        const header = Buffer.alloc(ANIMAL_ATLAS_HEADER_BYTES);
        header.writeUInt16LE(frame.width, 0);
        header.writeUInt16LE(frame.height, 2);
        frames.push(header, frame.data);
      }
      await writeFile(join(directory, filename), gzipSync(Buffer.concat(frames)));
      continue;
    }
    const first = await render(poses[0], tier, 0);
    const { width, height } = first;
    const frameSize = width * height * 4;
    const atlas = Buffer.alloc(ANIMAL_ATLAS_HEADER_BYTES + poses.length * directions * frameSize);
    atlas.writeUInt16LE(width, 0);
    atlas.writeUInt16LE(height, 2);
    let offset = ANIMAL_ATLAS_HEADER_BYTES;
    for (const pose of poses) {
      for (let direction = 0; direction < directions; direction++) {
        const frame = offset === ANIMAL_ATLAS_HEADER_BYTES ? first : await render(pose, tier, direction);
        if (frame.width !== width || frame.height !== height || frame.data.length !== frameSize) {
          throw new Error(`Inconsistent sprite size: ${folder}/${pose}`);
        }
        atlas.set(frame.data, offset);
        offset += frameSize;
      }
    }
    await writeFile(join(directory, filename), gzipSync(atlas));
  }
}

async function bake() {
  const output = resolve(process.argv[2] ?? 'dist');
  const assets = join(output, 'assets');
  const workerFiles = (await readdir(assets)).filter(name => /^AnimalSpriteWorker-.*\.js$/.test(name));
  if (workerFiles.length !== 1) throw new Error(`Expected one sprite worker in ${assets}`);
  const bundle = pathToFileURL(join(assets, workerFiles[0])).href;
  const root = join(output, 'sprites');
  const families = Object.entries(ANIMAL_SPRITE_POSES).flatMap(([key, poses]) => {
    const [module, factory] = key.split(':');
    const variants = factory === 'getFishPosePack' ? FISH_ATLAS_SPECIES.map(species => [species]) : [[]];
    return variants.map(variant => ({
      module, factory, poses, variant, folder: animalAtlasFolder(module, factory, variant), bundle, root,
    }));
  });
  if (new Set(families.map(family => family.folder)).size !== families.length) {
    throw new Error('Duplicate sprite atlas folders');
  }
  const workers = Math.min(8, Math.max(1, availableParallelism() - 1));
  let nextFamily = 0;
  let completed = 0;
  await Promise.all(Array.from({ length: workers }, async () => {
    while (nextFamily < families.length) {
      const family = families[nextFamily++];
      await new Promise((done, fail) => {
        const worker = new Worker(new URL(import.meta.url), { workerData: family });
        worker.on('error', fail);
        worker.on('exit', code => code === 0 ? done() : fail(new Error(`Sprite baker exited with code ${code}`)));
      });
      completed++;
      if (completed % 10 === 0 || completed === families.length) {
        console.log(`Sprites: ${completed}/${families.length} species`);
      }
    }
  }));
}

if (isMainThread) await bake();
else await bakeFamily(workerData);
