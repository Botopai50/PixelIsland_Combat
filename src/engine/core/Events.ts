/** Emissor de eventos tipado, minimalista. Usado para desacoplar lógica de feedback (som/VFX/UI). */
export class Emitter<M extends Record<string, any>> {
  private map = new Map<keyof M, Set<(p: any) => void>>();
  on<K extends keyof M>(k: K, fn: (p: M[K]) => void): () => void {
    let s = this.map.get(k);
    if (!s) this.map.set(k, (s = new Set()));
    s.add(fn);
    return () => s!.delete(fn);
  }
  emit<K extends keyof M>(k: K, p: M[K]) {
    this.map.get(k)?.forEach((fn) => fn(p));
  }
}
