import { copyFile, lstat, mkdir, mkdtemp, readFile, readdir, rename, rm, rmdir, unlink, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';
import { bake } from './bake-animal-sprites.mjs';

const project = fileURLToPath(new URL('../', import.meta.url));
const target = process.argv[2] ?? 'dist';
if (!['dist', 'docs'].includes(target)) throw new Error(`Unknown build directory: ${target}`);

const output = join(project, target);
const existing = await lstat(output).catch(error => {
  if (error.code === 'ENOENT') return null;
  throw error;
});
if (existing && !existing.isDirectory()) throw new Error(`Expected a regular directory: ${output}`);

async function outputEntries(root) {
  const entries = await readdir(root, { recursive: true, withFileTypes: true });
  return new Map(entries.map(entry => [relative(root, join(entry.parentPath, entry.name)), entry]));
}

async function updateWindowsOutput(from, to) {
  await mkdir(to, { recursive: true });
  const next = await outputEntries(from);
  const previous = await outputEntries(to);
  if ([...previous.values()].some(entry => entry.isSymbolicLink())) throw new Error(`Unexpected link in ${to}`);
  const publishLast = ['index.html', join('sprites', 'manifest.json')];
  async function copyIfChanged(path) {
    const source = join(from, path);
    const dest = join(to, path);
    if (previous.has(path) && (await readFile(source)).equals(await readFile(dest))) return;
    await mkdir(dirname(dest), { recursive: true });
    await copyFile(source, dest);
  }
  // Mantém os arquivos abertos pelo preview e publica o índice depois dos assets.
  for (const [path, entry] of next) {
    if (entry.isFile() && !publishLast.includes(path)) await copyIfChanged(path);
  }
  for (const path of publishLast) await copyIfChanged(path);
  const obsolete = [...previous.keys()].filter(path => !next.has(path)).sort((a, b) => b.length - a.length);
  for (const path of obsolete) {
    const remove = previous.get(path).isDirectory() ? rmdir : unlink;
    await remove(join(to, path));
  }
}

// Preserva o build anterior como cache até que o próximo esteja completo.
const stage = await mkdtemp(join(project, '.pixelisland-build-'));
const next = join(stage, 'next');
const previous = join(stage, 'previous');
let keepBackup = false;
try {
  await build({ root: project, build: { outDir: next } });
  await bake(next, [join(output, 'sprites'), join(project, 'docs', 'sprites')]);
  if (target === 'docs') await writeFile(join(next, '.nojekyll'), '');
  if (process.platform === 'win32') {
    await updateWindowsOutput(next, output);
  } else {
    if (existing) {
      await rename(output, previous);
      keepBackup = true;
    }
    try {
      await rename(next, output);
    } catch (error) {
      if (keepBackup) {
        await rename(previous, output);
        keepBackup = false;
      }
      throw error;
    }
    keepBackup = false;
  }
} finally {
  if (!keepBackup) await rm(stage, { recursive: true, force: true, maxRetries: 4, retryDelay: 100 });
}
