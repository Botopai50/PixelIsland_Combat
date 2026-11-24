import type { SpriteRecipe, SpriteView } from './AnimalSpriteCache';
import { ANIMAL_ATLAS_TOP, ANIMAL_ATLAS_BOTTOM } from './AnimalSpriteAtlasLayout';

// Apenas módulos locais conhecidos; o worker executa o mesmo gerador de pixels do jogo.
const modules = import.meta.glob(['./*.ts', '!./AnimalSprite*.ts']);
type Texture = { image: { data: Uint8Array; width: number; height: number } };
type Pack = {
  getView(tier: number, direction: number): Texture;
  getSunView(direction: number, pitch: number): Texture;
  getTop(): Texture;
  getBottom(): Texture;
};
let jobs = Promise.resolve();
self.onmessage = event => {
  const { id, recipe, view } = event.data as { id: number; recipe: SpriteRecipe; view: SpriteView };
  // Serializa mensagens mesmo durante o carregamento do módulo da espécie.
  jobs = jobs.then(async () => {
    try {
      const load = modules[recipe.module];
      if (!load) throw new Error('Unknown animal module');
      const mod = await load() as Record<string, (...args: unknown[]) => Pack>;
      const pack = mod[recipe.factory](...recipe.args);
      let tex: Texture;
      if (view.sunPitch !== undefined) tex = pack.getSunView(view.direction, view.sunPitch);
      else if (view.tier === ANIMAL_ATLAS_TOP) tex = pack.getTop();
      else if (view.tier === ANIMAL_ATLAS_BOTTOM) tex = pack.getBottom();
      else tex = pack.getView(view.tier, view.direction);
      const { width, height } = tex.image;
      // Copiar preserva o cache do worker; transferir evita cópia na thread de renderização.
      const data = new Uint8Array(tex.image.data).slice();
      self.postMessage({ id, pixels: { data, width, height } }, { transfer: [data.buffer] });
    } catch (error) { self.postMessage({ id, error: String(error) }); }
  });
};
