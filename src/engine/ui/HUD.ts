import * as THREE from 'three';
import type { ScreenFX } from '../combat/FeedbackDirector';
import type { PlayerController } from '../character/PlayerController';
import type { Inventory } from '../items/Inventory';
import { ITEMS } from '../items/Items';
import type { Damageable } from '../combat/types';
import type { GameContext } from '../core/Context';

const el = <K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, parent?: HTMLElement, html?: string) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  parent?.appendChild(e);
  return e;
};

interface Popup {
  div: HTMLDivElement;
  pos: THREE.Vector3;
  age: number;
  life: number;
  vx: number;
}

/**
 * HUD em HTML sobre o canvas: corações, roda de stamina (junto ao personagem),
 * barra rápida, mira/marcador de acerto, retícula de lock-on, notificações,
 * números de dano e efeitos de tela. Implementa `ScreenFX`.
 */
export class HUD implements ScreenFX {
  readonly root: HTMLDivElement;
  private hearts: HTMLDivElement;
  private staminaWrap: HTMLDivElement;
  private staminaArc: SVGCircleElement;
  private crosshair: HTMLDivElement;
  private hitmark: HTMLDivElement;
  private bowRet: HTMLDivElement;
  private lockRet: HTMLDivElement;
  private hotbar: HTMLDivElement;
  private slots: HTMLDivElement[] = [];
  private equipInfo: HTMLDivElement;
  private toasts: HTMLDivElement;
  private popupLayer: HTMLDivElement;
  private flashEl: HTMLDivElement;
  private vignetteEl: HTMLDivElement;
  private tintEl: HTMLDivElement;
  private modeLabel: HTMLDivElement;
  private statsEl: HTMLDivElement;
  private popups: Popup[] = [];
  private vignetteAmt = 0;
  private flashT = 0;
  private flashDur = 1;
  private tintT = 0;
  private hitmarkT = 0;
  private v = new THREE.Vector3();
  private lastHp = -1;
  onHotbarClick?: (i: number) => void;
  onHotbarLongPress?: (i: number) => void;

  constructor(private ctx: GameContext, private inventory: Inventory) {
    const root = el('div', 'hud');
    this.root = root;
    document.body.appendChild(root);
    this.hearts = el('div', 'hearts', root);
    this.staminaWrap = el('div', 'stamina', root);
    this.staminaWrap.innerHTML = `<svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="17" class="st-bg"/><circle cx="22" cy="22" r="17" class="st-fg"/></svg>`;
    this.staminaArc = this.staminaWrap.querySelector('.st-fg')!;
    this.crosshair = el('div', 'crosshair', root);
    this.hitmark = el('div', 'hitmarker', root, '<i></i><i></i><i></i><i></i>');
    this.bowRet = el('div', 'bow-reticle', root, '<i></i><i></i><i></i><i></i>');
    this.lockRet = el('div', 'lock-reticle', root, '<b></b><b></b><b></b>');
    this.hotbar = el('div', 'hotbar', root);
    for (let i = 0; i < inventory.hotbar.length; i++) {
      const s = el('div', 'slot', this.hotbar);
      s.dataset.i = String(i);
      let pressT = 0;
      let timer = 0;
      s.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        pressT = performance.now();
        timer = window.setTimeout(() => this.onHotbarLongPress?.(i), 500);
      });
      s.addEventListener('pointerup', (e) => {
        e.stopPropagation();
        clearTimeout(timer);
        if (performance.now() - pressT < 500) this.onHotbarClick?.(i);
      });
      s.addEventListener('pointercancel', () => clearTimeout(timer));
      this.slots.push(s);
    }
    this.equipInfo = el('div', 'equip-info', root);
    this.toasts = el('div', 'toasts', root);
    this.popupLayer = el('div', 'popups', root);
    this.flashEl = el('div', 'screen-flash', root);
    this.vignetteEl = el('div', 'screen-vignette', root);
    this.tintEl = el('div', 'screen-tint', root);
    this.modeLabel = el('div', 'mode-label', root);
    this.statsEl = el('div', 'dummy-stats', root);
    el('div', 'keyhints', root, '<kbd>G</kbd> inimigo · <kbd>R</kbd> restaurar · <kbd>V</kbd> 1ª/3ª · <kbd>T</kbd> ombro<br><kbd>Q</kbd> lock-on · <kbd>I</kbd> inventário · <kbd>P</kbd> ajustes · <kbd>B</kbd> juice · <kbd>H</kbd> ajuda');

    inventory.events.on('changed', () => this.renderHotbar());
    inventory.events.on('hotbar', () => this.renderHotbar());
    inventory.events.on('added', ({ id }) => {
      const idx = inventory.hotbar.indexOf(id);
      if (idx >= 0) {
        const s = this.slots[idx];
        s.classList.remove('pulse');
        void s.offsetWidth;
        s.classList.add('pulse');
      }
    });
    ctx.events.on('toast', ({ text, kind }) => this.toast(text, kind));
    ctx.events.on('pickup', ({ item, count }) => this.toast(`+${count} ${ITEMS[item].name}  (${inventory.count(item)})`, 'good', ITEMS[item].icon));
    ctx.events.on('noAmmo', () => {
      this.equipInfo.classList.remove('shake');
      void this.equipInfo.offsetWidth;
      this.equipInfo.classList.add('shake');
    });
    this.renderHotbar();
  }

  // ------------------------------------------------------------------ ScreenFX
  flash(color: string, alpha: number, duration: number) {
    if (alpha <= 0) return;
    this.flashEl.style.background = color;
    this.flashT = this.flashDur = duration;
    this.flashEl.dataset.a = String(alpha);
  }
  vignette(_color: string, amount: number) {
    this.vignetteAmt = Math.max(this.vignetteAmt, amount);
  }
  tint(color: string, duration: number) {
    if (!this.ctx.tuning.screenFx) return;
    this.tintEl.style.background = color;
    this.tintT = duration;
  }
  hitMarker(kill: boolean, ranged: boolean) {
    this.hitmarkT = 0.18;
    this.hitmark.classList.toggle('kill', kill);
    this.hitmark.classList.toggle('ranged', ranged);
  }
  popup(text: string, world: THREE.Vector3, color: string, scale: number) {
    const div = el('div', 'popup', this.popupLayer, text);
    div.style.color = color;
    div.style.fontSize = `${Math.round(18 * scale)}px`;
    this.popups.push({ div, pos: world.clone(), age: 0, life: 0.85, vx: (Math.random() - 0.5) * 40 });
    if (this.popups.length > 40) {
      const p = this.popups.shift()!;
      p.div.remove();
    }
  }

  toast(text: string, kind: 'info' | 'warn' | 'good' = 'info', icon?: string) {
    // agrupa mensagens repetidas
    const last = this.toasts.lastElementChild as HTMLDivElement | null;
    if (last && last.dataset.text === text) {
      last.classList.remove('bump');
      void last.offsetWidth;
      last.classList.add('bump');
      return;
    }
    const t = el('div', `toast ${kind}`, this.toasts);
    t.dataset.text = text;
    t.innerHTML = `${icon ? `<span class="ti">${icon}</span>` : ''}<span>${text}</span>`;
    setTimeout(() => t.classList.add('out'), 2200);
    setTimeout(() => t.remove(), 2700);
    while (this.toasts.children.length > 5) this.toasts.firstElementChild?.remove();
  }

  // ------------------------------------------------------------------ render
  renderHotbar() {
    const inv = this.inventory;
    this.slots.forEach((s, i) => {
      const id = inv.hotbar[i];
      const count = id ? inv.count(id) : 0;
      const def = id ? ITEMS[id] : null;
      const stack = def && def.stack > 1;
      s.innerHTML = `<span class="key">${i + 1}</span>${def ? def.icon : ''}${stack ? `<span class="count">${count}</span>` : ''}`;
      s.classList.toggle('sel', i === inv.selected);
      s.classList.toggle('empty', !!id && !stack && count === 0);
      s.title = def ? def.name : 'vazio';
    });
  }

  private renderHearts(hp: number, max: number) {
    const n = Math.ceil(max / 20);
    let html = '';
    for (let i = 0; i < n; i++) {
      const f = Math.max(0, Math.min(1, (hp - i * 20) / 20));
      html += `<div class="heart"><svg viewBox="0 0 24 22"><path class="h-bg" d="M12 21l-1.5-1.3C5 15 1.5 12 1.5 7.8 1.5 4.4 4.1 2 7.3 2c1.8 0 3.6.9 4.7 2.3C13.1 2.9 14.9 2 16.7 2c3.2 0 5.8 2.4 5.8 5.8 0 4.2-3.5 7.2-9 11.9z"/><clipPath id="hc${i}"><rect x="0" y="0" width="${24 * f}" height="22"/></clipPath><path class="h-fg" clip-path="url(#hc${i})" d="M12 21l-1.5-1.3C5 15 1.5 12 1.5 7.8 1.5 4.4 4.1 2 7.3 2c1.8 0 3.6.9 4.7 2.3C13.1 2.9 14.9 2 16.7 2c3.2 0 5.8 2.4 5.8 5.8 0 4.2-3.5 7.2-9 11.9z"/></svg></div>`;
    }
    this.hearts.innerHTML = html;
  }

  private project(p: THREE.Vector3, camera: THREE.Camera): { x: number; y: number; vis: boolean } {
    this.v.copy(p).project(camera);
    const vis = this.v.z < 1 && this.v.z > -1;
    return { x: (this.v.x * 0.5 + 0.5) * window.innerWidth, y: (-this.v.y * 0.5 + 0.5) * window.innerHeight, vis };
  }

  update(realDt: number, camera: THREE.PerspectiveCamera, player: PlayerController, firstPerson: boolean, dummy?: { lastDamage: number; combo: number; dps: number; pos: THREE.Vector3 }) {
    const T = this.ctx.tuning;
    // corações
    const hp = Math.max(0, Math.round(player.hp));
    if (hp !== this.lastHp) {
      if (hp < this.lastHp) {
        this.hearts.classList.remove('hurt');
        void this.hearts.offsetWidth;
        this.hearts.classList.add('hurt');
      }
      this.lastHp = hp;
      this.renderHearts(hp, player.maxHp);
    }
    this.hearts.classList.toggle('low', hp <= 20 && hp > 0);

    // stamina (roda ao lado do personagem, some quando cheia)
    const st = player.stamina / T.staminaMax;
    const circ = 2 * Math.PI * 17;
    this.staminaArc.style.strokeDasharray = `${circ * st} ${circ}`;
    const showSt = st < 0.995 || player.sprinting;
    this.staminaWrap.classList.toggle('show', showSt);
    this.staminaWrap.classList.toggle('exhausted', player.exhausted);
    const anchor = this.project(this.v.copy(player.position).setY(player.position.y + 1.5), camera);
    if (firstPerson) {
      this.staminaWrap.style.transform = `translate(${window.innerWidth / 2 + 70}px, ${window.innerHeight / 2 + 30}px)`;
    } else {
      this.staminaWrap.style.transform = `translate(${anchor.x + 50}px, ${anchor.y - 30}px)`;
    }

    // mira
    const aiming = player.state === 'bow';
    this.bowRet.classList.toggle('show', aiming);
    const spread = 26 - player.bowDraw * 20;
    this.bowRet.style.setProperty('--s', `${spread}px`);
    this.bowRet.classList.toggle('full', player.bowDraw >= 1);
    this.crosshair.classList.toggle('show', firstPerson || aiming || player.mainHand === 'bow');
    this.hitmarkT -= realDt;
    this.hitmark.classList.toggle('show', this.hitmarkT > 0);

    // lock-on
    const lt: Damageable | null = player.lockTarget;
    if (lt && lt.alive) {
      const c = this.project(lt.center(this.v), camera);
      this.lockRet.classList.toggle('show', c.vis);
      this.lockRet.style.transform = `translate(${c.x}px, ${c.y}px)`;
    } else this.lockRet.classList.remove('show');

    // info de equipamento
    const main = player.mainHand ? ITEMS[player.mainHand].name : 'Mãos vazias';
    const off = player.offHand ? ' + Escudo' : '';
    const arrows = player.inventory.count('arrow');
    const pend = '';
    this.equipInfo.innerHTML = `<b>${main}</b>${player.mainHand === 'bow' ? '' : off}${pend}<span class="arrows ${arrows === 0 ? 'zero' : ''}">${ITEMS.arrow.icon}<em>${arrows}</em></span>`;
    this.modeLabel.textContent = firstPerson ? '1ª pessoa' : '3ª pessoa';

    // boneco de treino
    if (dummy) {
      this.statsEl.innerHTML = `<b>Boneco</b> último <em>${dummy.lastDamage}</em> · combo <em>${dummy.combo}</em> · DPS <em>${dummy.dps.toFixed(1)}</em>`;
    }

    // popups (números de dano)
    for (let i = this.popups.length - 1; i >= 0; i--) {
      const p = this.popups[i];
      p.age += realDt;
      const k = p.age / p.life;
      if (k >= 1) {
        p.div.remove();
        this.popups.splice(i, 1);
        continue;
      }
      const s = this.project(p.pos, camera);
      const rise = 30 * Math.sqrt(k) + 20 * k;
      const pop = k < 0.12 ? 0.6 + (k / 0.12) * 0.7 : 1.3 - Math.min(0.3, (k - 0.12) * 1.5);
      p.div.style.opacity = s.vis ? String(k > 0.7 ? 1 - (k - 0.7) / 0.3 : 1) : '0';
      p.div.style.transform = `translate(${s.x + p.vx * k}px, ${s.y - rise}px) translate(-50%, -50%) scale(${pop})`;
    }

    // efeitos de tela
    this.flashT -= realDt;
    const fa = Math.max(0, this.flashT / this.flashDur) * Number(this.flashEl.dataset.a ?? 0);
    this.flashEl.style.opacity = String(fa);
    this.vignetteAmt = Math.max(0, this.vignetteAmt - realDt * 1.8);
    const lowHp = hp > 0 && hp <= 20 && T.screenFx ? 0.25 + Math.sin(performance.now() / 180) * 0.1 : 0;
    this.vignetteEl.style.opacity = String(Math.max(this.vignetteAmt, lowHp));
    this.tintT -= realDt;
    this.tintEl.style.opacity = this.tintT > 0 ? String(Math.min(1, this.tintT * 2)) : '0';
  }
}
