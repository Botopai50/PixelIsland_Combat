import type { Action, Input } from '../core/Input';

interface BtnDef {
  action: Action;
  label: string;
  cls: string;
  hold?: boolean;
  toggle?: boolean;
}

/**
 * Controles de toque para celular: analógico virtual dinâmico (lado esquerdo),
 * arrastar para olhar (lado direito) e botões de ação em "leque" inspirados em
 * jogos de aventura de console. Multitoque real via Pointer Events.
 */
export class TouchControls {
  readonly root: HTMLDivElement;
  private stick: HTMLDivElement;
  private knob: HTMLDivElement;
  private stickId = -1;
  private stickOrigin = { x: 0, y: 0 };
  private lookId = -1;
  private lookLast = { x: 0, y: 0 };
  private sprintOn = false;
  lookSensitivity = 2.1;
  active = false;

  constructor(private input: Input, private canvas: HTMLCanvasElement) {
    const r = document.createElement('div');
    r.className = 'touch';
    r.innerHTML = `
      <div class="t-look"></div>
      <div class="t-move"><div class="t-stick"><div class="t-knob"></div></div></div>
      <div class="t-buttons"></div>
      <div class="t-top"></div>`;
    document.body.appendChild(r);
    this.root = r;
    this.stick = r.querySelector('.t-stick')!;
    this.knob = r.querySelector('.t-knob')!;

    const buttons: BtnDef[] = [
      { action: 'attack', label: 'Atacar', cls: 'b-attack', hold: true },
      { action: 'guard', label: 'Defender', cls: 'b-guard', hold: true },
      { action: 'jump', label: 'Pular', cls: 'b-jump', hold: true },
      { action: 'dodge', label: 'Esquiva', cls: 'b-dodge', hold: true },
      { action: 'sprint', label: 'Correr', cls: 'b-sprint', toggle: true },
      { action: 'lock', label: 'Travar', cls: 'b-lock', hold: true },
    ];
    const wrap = r.querySelector('.t-buttons')!;
    for (const b of buttons) {
      const e = document.createElement('div');
      e.className = `t-btn ${b.cls}`;
      e.innerHTML = `<span>${b.label}</span>`;
      e.addEventListener('pointerdown', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        e.setPointerCapture(ev.pointerId);
        if (b.toggle) {
          this.sprintOn = !this.sprintOn;
          e.classList.toggle('on', this.sprintOn);
          input.setButton(b.action, this.sprintOn);
        } else {
          input.setButton(b.action, true);
          e.classList.add('on');
        }
        navigator.vibrate?.(8);
      });
      // arrastar a partir de Atacar/Defender também mira (dá para puxar o arco e mirar com o mesmo dedo)
      let last: { x: number; y: number } | null = null;
      if (b.action === 'attack' || b.action === 'guard') {
        e.addEventListener('pointerdown', (ev) => (last = { x: ev.clientX, y: ev.clientY }));
        e.addEventListener('pointermove', (ev) => {
          if (!last) return;
          input.addLook((ev.clientX - last.x) * this.lookSensitivity * 0.8, (ev.clientY - last.y) * this.lookSensitivity * 0.8);
          last = { x: ev.clientX, y: ev.clientY };
        });
      }
      const up = (ev: PointerEvent) => {
        ev.preventDefault();
        last = null;
        if (b.toggle) return;
        input.setButton(b.action, false);
        e.classList.remove('on');
      };
      e.addEventListener('pointerup', up);
      e.addEventListener('pointercancel', up);
      wrap.appendChild(e);
    }
    const top = r.querySelector('.t-top')!;
    const topBtns: [Action, string][] = [['view', '1ª/3ª'], ['shoulder', 'Ombro'], ['inventory', 'Itens'], ['spawn', '+Inimigo'], ['reset', 'Resetar'], ['juice', 'Juice'], ['tweak', 'Ajustes'], ['help', '?']];
    for (const [a, label] of topBtns) {
      const e = document.createElement('button');
      e.className = 't-small';
      e.textContent = label;
      e.addEventListener('pointerdown', (ev) => {
        ev.stopPropagation();
        ev.preventDefault();
        input.tap(a);
      });
      top.appendChild(e);
    }

    // analógico (esquerda) — aparece onde o dedo toca
    const moveZone = r.querySelector<HTMLDivElement>('.t-move')!;
    moveZone.addEventListener('pointerdown', (e) => {
      if (this.stickId !== -1) return;
      e.preventDefault();
      this.stickId = e.pointerId;
      moveZone.setPointerCapture(e.pointerId);
      this.stickOrigin = { x: e.clientX, y: e.clientY };
      this.stick.style.left = `${e.clientX}px`;
      this.stick.style.top = `${e.clientY}px`;
      this.stick.classList.add('on');
      this.moveStick(e.clientX, e.clientY);
    });
    moveZone.addEventListener('pointermove', (e) => {
      if (e.pointerId === this.stickId) this.moveStick(e.clientX, e.clientY);
    });
    const endStick = (e: PointerEvent) => {
      if (e.pointerId !== this.stickId) return;
      this.stickId = -1;
      this.stick.classList.remove('on');
      this.knob.style.transform = 'translate(-50%,-50%)';
      input.setTouchMove(0, 0);
    };
    moveZone.addEventListener('pointerup', endStick);
    moveZone.addEventListener('pointercancel', endStick);

    // olhar (direita)
    const look = r.querySelector<HTMLDivElement>('.t-look')!;
    look.addEventListener('pointerdown', (e) => {
      if (this.lookId !== -1) return;
      this.lookId = e.pointerId;
      look.setPointerCapture(e.pointerId);
      this.lookLast = { x: e.clientX, y: e.clientY };
    });
    look.addEventListener('pointermove', (e) => {
      if (e.pointerId !== this.lookId) return;
      const dx = e.clientX - this.lookLast.x, dy = e.clientY - this.lookLast.y;
      this.lookLast = { x: e.clientX, y: e.clientY };
      input.addLook(dx * this.lookSensitivity, dy * this.lookSensitivity);
    });
    const endLook = (e: PointerEvent) => {
      if (e.pointerId === this.lookId) this.lookId = -1;
    };
    look.addEventListener('pointerup', endLook);
    look.addEventListener('pointercancel', endLook);
    void this.canvas;
  }

  private moveStick(x: number, y: number) {
    const R = 56;
    let dx = x - this.stickOrigin.x, dy = y - this.stickOrigin.y;
    const d = Math.hypot(dx, dy);
    if (d > R) {
      // o analógico "segue" o dedo se passar do limite
      this.stickOrigin.x += (dx / d) * (d - R);
      this.stickOrigin.y += (dy / d) * (d - R);
      this.stick.style.left = `${this.stickOrigin.x}px`;
      this.stick.style.top = `${this.stickOrigin.y}px`;
      dx = (dx / d) * R;
      dy = (dy / d) * R;
    }
    this.knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    let mx = dx / R, my = -dy / R;
    const m = Math.hypot(mx, my);
    if (m < 0.12) mx = my = 0; // zona morta
    this.input.setTouchMove(mx, my);
  }

  setActive(v: boolean) {
    this.active = v;
    this.root.classList.toggle('on', v);
    document.body.classList.toggle('touch-mode', v);
    this.input.touchMode = v;
  }
}
