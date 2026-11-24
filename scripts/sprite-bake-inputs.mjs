import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { ANIMAL_SPRITE_POSES } from '../src/engine/enemies/AnimalSpritePoses.ts';
import {
  ANIMAL_ATLAS_BOTTOM, ASYMMETRIC_ATLAS_FACTORIES, FISH_ATLAS_SPECIES, animalAtlasFolder,
} from '../src/engine/enemies/AnimalSpriteAtlasLayout.ts';

const project = fileURLToPath(new URL('../', import.meta.url));
const enemies = join(project, 'src/engine/enemies');
const globalInputs = [
  'package-lock.json', 'tsconfig.json', 'vite.config.ts',
  'scripts/bake-animal-sprites.mjs', 'scripts/sprite-bake-inputs.mjs',
  'src/engine/enemies/AnimalSpriteWorker.ts',
];
const compilerOptions = { moduleResolution: ts.ModuleResolutionKind.Bundler };

export const atlasDigest = bytes => createHash('sha256').update(bytes).digest('hex');

function runtimeImports(file, contents) {
  const source = ts.createSourceFile(file, contents, ts.ScriptTarget.ESNext, true);
  const imports = [];
  function visit(node) {
    if (ts.isImportDeclaration(node) && !node.importClause?.isTypeOnly) imports.push(node.moduleSpecifier);
    if (ts.isExportDeclaration(node) && !node.isTypeOnly && node.moduleSpecifier) imports.push(node.moduleSpecifier);
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword && node.arguments.length) {
      imports.push(node.arguments[0]);
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return imports.filter(ts.isStringLiteralLike).map(specifier => specifier.text).filter(path => path.startsWith('.'));
}

export async function animalBakeInputs() {
  const files = new Map();
  const imports = new Map();
  async function input(file) {
    if (!files.has(file)) {
      const text = (await readFile(file, 'utf8')).replace(/\r\n/g, '\n');
      files.set(file, { text, hash: atlasDigest(text) });
    }
    return files.get(file);
  }
  async function visit(file, paths) {
    if (paths.has(file)) return;
    paths.add(file);
    const { text } = await input(file);
    if (!imports.has(file)) {
      imports.set(file, runtimeImports(file, text).map(specifier => {
        const dependency = ts.resolveModuleName(specifier, file, compilerOptions, ts.sys).resolvedModule;
        if (!dependency) throw new Error(`Cannot resolve sprite input ${specifier} from ${file}`);
        return resolve(dependency.resolvedFileName);
      }));
    }
    for (const dependency of imports.get(file)) await visit(dependency, paths);
  }

  const common = await Promise.all(globalInputs.map(async path => [path, (await input(join(project, path))).hash]));
  const families = [];
  for (const [key, poses] of Object.entries(ANIMAL_SPRITE_POSES)) {
    const [module, factory] = key.split(':');
    const paths = new Set();
    await visit(resolve(enemies, module), paths);
    const dependencies = [...paths].map(file => [
      relative(project, file).replaceAll('\\', '/'), files.get(file).hash,
    ]).sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0);
    const variants = factory === 'getFishPosePack' ? FISH_ATLAS_SPECIES.map(species => [species]) : [[]];
    for (const variant of variants) {
      const asymmetric = ASYMMETRIC_ATLAS_FACTORIES.has(factory);
      const folder = animalAtlasFolder(module, factory, variant);
      const fingerprint = atlasDigest(JSON.stringify([common, dependencies, module, factory, poses, variant, asymmetric]));
      families.push({ module, factory, poses, variant, asymmetric, folder, fingerprint });
    }
  }
  return families;
}

export const atlasFiles = Array.from({ length: ANIMAL_ATLAS_BOTTOM + 1 }, (_, tier) => `${tier}.rgba.gz`);

export async function readFamilyAtlases(root, folder) {
  return Promise.all(atlasFiles.map(file => readFile(join(root, folder, file))));
}

export function familyCacheEntry(family, atlases) {
  return { fingerprint: family.fingerprint, files: atlases.map(atlasDigest) };
}
