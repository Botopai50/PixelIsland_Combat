import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { availableParallelism } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { Worker, isMainThread, workerData } from 'node:worker_threads';
import { gzipSync } from 'node:zlib';
import { ANIMAL_ATLAS_HEADER_BYTES, ANIMAL_ATLAS_TOP, animalAtlasDirectionCount } from '../src/engine/enemies/AnimalSpriteAtlasLayout.ts';
import { animalBakeInputs, atlasFiles, familyCacheEntry, readFamilyAtlases } from './sprite-bake-inputs.mjs';

async function bakeFamily({ bundle, root, module, factory, poses, variant, folder, asymmetric }) {
  let complete;
  globalThis.self = { postMessage: message => complete(message) };
  await import(bundle);
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

  for (const [tier, filename] of atlasFiles.entries()) {
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

async function readManifest(root) {
  try {
    return JSON.parse(await readFile(join(root, 'manifest.json'), 'utf8')) ?? {};
  } catch (error) {
    if (error.code === 'ENOENT' || error instanceof SyntaxError) return {};
    throw error;
  }
}

async function reuseFamily(family, sources) {
  for (const { root, manifest } of sources) {
    const entry = manifest[family.folder];
    if (entry?.fingerprint !== family.fingerprint || entry.files?.length !== atlasFiles.length) continue;
    try {
      const atlases = await readFamilyAtlases(root, family.folder);
      const actual = familyCacheEntry(family, atlases);
      if (actual.files.every((hash, index) => hash === entry.files[index])) return { atlases, entry: actual };
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  return null;
}

export async function bake(output, sourceRoots) {
  const assets = join(output, 'assets');
  const workerFiles = (await readdir(assets)).filter(name => /^AnimalSpriteWorker-.*\.js$/.test(name));
  if (workerFiles.length !== 1) throw new Error(`Expected one sprite worker in ${assets}`);
  const bundle = pathToFileURL(join(assets, workerFiles[0])).href;
  const root = join(output, 'sprites');
  const families = await animalBakeInputs();
  if (new Set(families.map(family => family.folder)).size !== families.length) {
    throw new Error('Duplicate sprite atlas folders');
  }
  const sources = await Promise.all([...new Set(sourceRoots)].map(async root => ({ root, manifest: await readManifest(root) })));
  const entries = new Map();
  const workers = Math.min(8, Math.max(1, availableParallelism() - 1));
  let nextFamily = 0;
  let completed = 0;
  let reused = 0;
  const results = await Promise.allSettled(Array.from({ length: workers }, async () => {
    while (nextFamily < families.length) {
      const family = families[nextFamily++];
      const cached = await reuseFamily(family, sources);
      if (cached) {
        const directory = join(root, family.folder);
        await mkdir(directory, { recursive: true });
        await Promise.all(atlasFiles.map((file, index) => writeFile(join(directory, file), cached.atlases[index])));
        entries.set(family.folder, cached.entry);
        reused++;
      } else {
        await new Promise((done, fail) => {
          const worker = new Worker(new URL(import.meta.url), { workerData: { ...family, bundle, root } });
          worker.on('error', fail);
          worker.on('exit', code => code === 0 ? done() : fail(new Error(`Sprite baker exited with code ${code}`)));
        });
        entries.set(family.folder, familyCacheEntry(family, await readFamilyAtlases(root, family.folder)));
      }
      completed++;
      if (completed % 20 === 0 && reused !== completed) console.log(`Sprites: ${completed}/${families.length} prontos`);
    }
  }));
  const failed = results.find(result => result.status === 'rejected');
  if (failed) throw failed.reason;
  const manifest = Object.fromEntries(families.map(({ folder }) => [folder, entries.get(folder)]));
  await writeFile(join(root, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log(`Sprites: ${reused} grupos reaproveitados, ${families.length - reused} gerados`);
}

if (!isMainThread) await bakeFamily(workerData);
