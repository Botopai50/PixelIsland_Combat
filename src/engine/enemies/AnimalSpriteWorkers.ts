import { setAnimalSpriteWorker, type SpritePixels, type SpriteRecipe, type SpriteView } from './AnimalSpriteCache';

interface Job { id: number; recipe: SpriteRecipe; view: SpriteView; done: (pixels: SpritePixels | null) => void }

/** Dois núcleos no máximo; deixa a thread principal livre para movimento, câmera e desenho. */
export function initAnimalSpriteWorkers() {
  if (typeof Worker === 'undefined') return;
  const urgent: Job[] = [], ahead: Job[] = [];
  const slots: { worker: Worker; job: Job | null }[] = [];
  let nextId = 0;
  let failed = false;
  const stop = () => {
    if (failed) return;
    failed = true;
    document.documentElement.dataset.animalSpriteWorkers = 'fallback';
    setAnimalSpriteWorker(undefined);
    for (const slot of slots) { slot.worker.terminate(); slot.job?.done(null); }
    for (const job of [...urgent, ...ahead]) job.done(null);
    urgent.length = ahead.length = 0;
  };
  const pump = () => {
    if (failed) return;
    for (const slot of slots) {
      if (slot.job) continue;
      // Reservar o segundo worker para vistas e poses de gameplay enquanto
      // uma textura maior é calculada.
      const detailRunning = slots.some(other => other.job?.recipe.resolution);
      const next = ahead.findIndex(job => !job.recipe.resolution || !detailRunning);
      const job = urgent.shift() ?? (next < 0 ? undefined : ahead.splice(next, 1)[0]);
      if (!job) break;
      slot.job = job;
      slot.worker.postMessage({ id: job.id, recipe: job.recipe, view: job.view });
    }
  };
  try {
    const count = Math.min(2, Math.max(1, (navigator.hardwareConcurrency || 2) - 1));
    for (let i = 0; i < count; i++) {
      const worker = new Worker(new URL('./AnimalSpriteWorker.ts', import.meta.url), { type: 'module' });
      const slot = { worker, job: null as Job | null };
      let ready = false;
      worker.onmessage = event => {
        const job = slot.job;
        if (!job || event.data.id !== job.id) return;
        slot.job = null;
        if (event.data.error) { job.done(null); stop(); return; }
        if (!ready) { ready = true; document.documentElement.dataset.animalSpriteWorkers = 'ready'; }
        job.done(event.data.pixels);
        pump();
      };
      worker.onerror = stop;
      slots.push(slot);
    }
    setAnimalSpriteWorker((recipe, view, done, priority) => {
      if (failed || urgent.length + ahead.length >= (priority ? 256 : 96)) return false;
      (priority ? urgent : ahead).push({ id: ++nextId, recipe, view, done });
      pump();
      return true;
    });
    document.documentElement.dataset.animalSpriteWorkers = 'starting';
    if (import.meta.hot) import.meta.hot.dispose(stop);
    window.addEventListener('pagehide', stop, { once: true });
  } catch { stop(); }
}
