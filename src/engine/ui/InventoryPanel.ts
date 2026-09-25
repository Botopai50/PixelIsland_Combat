import type { Inventory } from '../items/Inventory';
import { ITEMS, type ItemId } from '../items/Items';

/**
 * Painel de inventário: grade com pilhas agrupadas por tipo, detalhes do item,
 * equipar e atribuir à barra de acesso rápido. Funciona com mouse e toque.
 */
export class InventoryPanel {
  readonly root: HTMLDivElement;
  private grid: HTMLDivElement;
  private details: HTMLDivElement;
  private selected = -1;
  isOpen = false;
  onEquip?: (id: ItemId) => void;
  onClose?: () => void;
  getEquipped: () => { main: ItemId | null; off: ItemId | null } = () => ({ main: null, off: null });

  constructor(private inventory: Inventory) {
    this.root = document.createElement('div');
    this.root.className = 'modal inventory';
    this.root.innerHTML = `
      <div class="panel">
        <header><h2>Inventário</h2><div class="hdr-btns"><button class="sort">Organizar</button><button class="close" aria-label="Fechar">✕</button></div></header>
        <div class="inv-body"><div class="grid"></div><div class="details"></div></div>
        <footer>Toque/clique num item para ver detalhes, equipar ou colocar na barra rápida. Recursos iguais são agrupados automaticamente.</footer>
      </div>`;
    document.body.appendChild(this.root);
    this.grid = this.root.querySelector('.grid')!;
    this.details = this.root.querySelector('.details')!;
    this.root.querySelector('.close')!.addEventListener('click', () => this.close());
    this.root.querySelector('.sort')!.addEventListener('click', () => inventory.sort());
    this.root.addEventListener('pointerdown', (e) => {
      if (e.target === this.root) this.close();
    });
    inventory.events.on('changed', () => this.isOpen && this.render());
  }

  open() {
    this.isOpen = true;
    this.root.classList.add('open');
    this.render();
  }
  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.root.classList.remove('open');
    this.onClose?.();
  }
  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  private render() {
    const inv = this.inventory;
    const eq = this.getEquipped();
    this.grid.innerHTML = '';
    inv.slots.forEach((s, i) => {
      const d = document.createElement('button');
      d.className = 'islot' + (i === this.selected ? ' sel' : '') + (!s ? ' empty' : '');
      if (s) {
        const def = ITEMS[s.id];
        const equipped = eq.main === s.id || eq.off === s.id;
        const hb = inv.hotbar.indexOf(s.id);
        d.innerHTML = `${def.icon}${def.stack > 1 ? `<span class="count">${s.count}</span>` : ''}${equipped ? '<span class="eq">E</span>' : ''}${hb >= 0 ? `<span class="hb">${hb + 1}</span>` : ''}`;
        d.title = def.name;
      }
      d.addEventListener('click', () => {
        this.selected = i;
        this.render();
      });
      this.grid.appendChild(d);
    });
    const s = inv.slots[this.selected];
    if (!s) {
      this.details.innerHTML = '<p class="muted">Selecione um item.</p>';
      return;
    }
    const def = ITEMS[s.id];
    const equipable = !!def.weapon || def.kind === 'shield';
    const equipped = eq.main === s.id || eq.off === s.id;
    this.details.innerHTML = `
      <div class="big">${def.icon}</div>
      <h3>${def.name} <small>×${inv.count(s.id)}</small></h3>
      <p>${def.desc}</p>
      ${equipable ? `<button class="equip">${def.kind === 'shield' ? (equipped ? 'Guardar escudo' : 'Equipar escudo') : equipped ? 'Equipado' : 'Equipar'}</button>` : ''}
      <div class="assign"><span>Barra rápida:</span>${inv.hotbar.map((h, i) => `<button data-i="${i}" class="${h === s.id ? 'on' : ''}">${i + 1}</button>`).join('')}</div>`;
    this.details.querySelector('.equip')?.addEventListener('click', () => {
      this.onEquip?.(s.id);
      setTimeout(() => this.render(), 350);
    });
    this.details.querySelectorAll<HTMLButtonElement>('.assign button').forEach((b) =>
      b.addEventListener('click', () => {
        const i = Number(b.dataset.i);
        inv.setHotbar(i, inv.hotbar[i] === s.id ? null : s.id);
      }),
    );
  }
}
