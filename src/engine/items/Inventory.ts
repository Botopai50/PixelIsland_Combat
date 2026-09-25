import { Emitter } from '../core/Events';
import { ITEMS, type ItemId, type Slot } from './Items';

type InvEvents = {
  changed: void;
  added: { id: ItemId; count: number };
  hotbar: number;
};

/**
 * Inventário com empilhamento por tipo + barra de acesso rápido.
 * A barra guarda referências por ID de item (não por slot), então reorganizar
 * o inventário não quebra os atalhos. Não conhece o jogador: quem decide o que
 * "equipar" significa é o controlador (via `equipRequest`).
 */
export class Inventory {
  readonly events = new Emitter<InvEvents>();
  slots: (Slot | null)[];
  hotbar: (ItemId | null)[];
  selected = 0;

  constructor(size = 20, hotbarSize = 6) {
    this.slots = new Array(size).fill(null);
    this.hotbar = new Array(hotbarSize).fill(null);
  }

  count(id: ItemId) {
    let n = 0;
    for (const s of this.slots) if (s?.id === id) n += s.count;
    return n;
  }
  has(id: ItemId) {
    return this.count(id) > 0;
  }

  /** Adiciona agrupando em pilhas existentes. Retorna quanto coube. */
  add(id: ItemId, count = 1): number {
    const def = ITEMS[id];
    let left = count;
    for (const s of this.slots) {
      if (left <= 0) break;
      if (s && s.id === id && s.count < def.stack) {
        const k = Math.min(def.stack - s.count, left);
        s.count += k;
        left -= k;
      }
    }
    for (let i = 0; i < this.slots.length && left > 0; i++) {
      if (!this.slots[i]) {
        const k = Math.min(def.stack, left);
        this.slots[i] = { id, count: k };
        left -= k;
      }
    }
    const added = count - left;
    if (added > 0) {
      this.events.emit('added', { id, count: added });
      this.events.emit('changed', undefined);
    }
    return added;
  }

  remove(id: ItemId, count = 1): boolean {
    if (this.count(id) < count) return false;
    let left = count;
    for (let i = this.slots.length - 1; i >= 0 && left > 0; i--) {
      const s = this.slots[i];
      if (s && s.id === id) {
        const k = Math.min(s.count, left);
        s.count -= k;
        left -= k;
        if (s.count <= 0) this.slots[i] = null;
      }
    }
    this.events.emit('changed', undefined);
    return true;
  }

  /** Agrupa pilhas do mesmo tipo e ordena por categoria. */
  sort() {
    const order = ['weapon', 'tool', 'bow', 'shield', 'ammo', 'resource'];
    const totals = new Map<ItemId, number>();
    for (const s of this.slots) if (s) totals.set(s.id, (totals.get(s.id) ?? 0) + s.count);
    const ids = [...totals.keys()].sort((a, b) => order.indexOf(ITEMS[a].kind) - order.indexOf(ITEMS[b].kind));
    this.slots.fill(null);
    let i = 0;
    for (const id of ids) {
      let n = totals.get(id)!;
      while (n > 0 && i < this.slots.length) {
        const k = Math.min(ITEMS[id].stack, n);
        this.slots[i++] = { id, count: k };
        n -= k;
      }
    }
    this.events.emit('changed', undefined);
  }

  swapSlots(a: number, b: number) {
    [this.slots[a], this.slots[b]] = [this.slots[b], this.slots[a]];
    this.events.emit('changed', undefined);
  }

  setHotbar(index: number, id: ItemId | null) {
    // um item aparece só uma vez na barra
    if (id) this.hotbar = this.hotbar.map((h) => (h === id ? null : h));
    this.hotbar[index] = id;
    this.events.emit('changed', undefined);
  }

  select(index: number) {
    this.selected = (index + this.hotbar.length) % this.hotbar.length;
    this.events.emit('hotbar', this.selected);
  }
}
