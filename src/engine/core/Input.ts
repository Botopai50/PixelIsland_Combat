/**
 * Camada de input abstrata baseada em AÇÕES. Teclado/mouse e controles de toque
 * escrevem aqui; a lógica de jogo só lê ações — assim o mesmo personagem funciona
 * em desktop e celular (ou gamepad, se alguém adicionar uma fonte nova).
 */
export type Action =
  | 'attack' | 'guard' | 'jump' | 'dodge' | 'sprint' | 'lock'
  | 'view' | 'shoulder' | 'inventory' | 'tweak' | 'spawn' | 'reset' | 'help'
  | 'walkToggle' | 'nextItem' | 'prevItem' | 'juice'
  | 'slot1' | 'slot2' | 'slot3' | 'slot4' | 'slot5' | 'slot6';

export class Input {
  /** Eixo de movimento: x = direita, y = frente. Magnitude 0..1. */
  moveX = 0;
  moveY = 0;
  /** Delta de olhar acumulado no frame (pixels-equivalentes). */
  lookX = 0;
  lookY = 0;
  /** True quando o jogador está usando controles de toque (ajusta UI/assistências). */
  touchMode = false;
  /** Bloqueia input de jogo (menus abertos). */
  blocked = false;

  private held = new Set<Action>();
  private pressed = new Set<Action>();
  private released = new Set<Action>();
  private keyMove = { f: 0, b: 0, l: 0, r: 0 };
  private touchMoveX = 0;
  private touchMoveY = 0;
  walkMode = false;

  setButton(a: Action, down: boolean) {
    if (down) {
      if (!this.held.has(a)) {
        this.held.add(a);
        this.pressed.add(a);
      }
    } else if (this.held.has(a)) {
      this.held.delete(a);
      this.released.add(a);
    }
  }
  /** Pulso de botão (toque rápido em UI). */
  tap(a: Action) {
    this.pressed.add(a);
    this.released.add(a);
  }

  isHeld(a: Action) {
    return !this.blocked && this.held.has(a);
  }
  wasPressed(a: Action) {
    return !this.blocked && this.pressed.has(a);
  }
  wasReleased(a: Action) {
    return this.released.has(a);
  }
  /** Consome o "pressionado" para que outro sistema não o use no mesmo frame. */
  consume(a: Action) {
    const had = this.pressed.has(a);
    this.pressed.delete(a);
    return !this.blocked && had;
  }

  setTouchMove(x: number, y: number) {
    this.touchMoveX = x;
    this.touchMoveY = y;
  }
  addLook(dx: number, dy: number) {
    if (this.blocked) return;
    this.lookX += dx;
    this.lookY += dy;
  }

  /** Chamado no início do frame: compõe os eixos a partir das fontes. */
  update() {
    let x = this.keyMove.r - this.keyMove.l;
    let y = this.keyMove.f - this.keyMove.b;
    const len = Math.hypot(x, y);
    if (len > 1) {
      x /= len;
      y /= len;
    }
    if (len > 0 && this.walkMode) {
      // 0.55 = limite do analógico em que o personagem anda na velocidade de andar
      x *= 0.55;
      y *= 0.55;
    }
    if (Math.abs(this.touchMoveX) + Math.abs(this.touchMoveY) > 0.001) {
      x = this.touchMoveX;
      y = this.touchMoveY;
    }
    if (this.blocked) x = y = 0;
    this.moveX = x;
    this.moveY = y;
  }

  /** Chamado no final do frame. */
  endFrame() {
    this.pressed.clear();
    this.released.clear();
    this.lookX = 0;
    this.lookY = 0;
  }

  releaseAll() {
    for (const a of [...this.held]) this.setButton(a, false);
    this.keyMove = { f: 0, b: 0, l: 0, r: 0 };
  }

  // ---------------------------------------------------------------- teclado/mouse
  attachKeyboardMouse(canvas: HTMLCanvasElement) {
    const keyMap: Record<string, Action> = {
      Space: 'jump', ShiftLeft: 'sprint', ShiftRight: 'sprint',
      KeyC: 'dodge', AltLeft: 'dodge', AltRight: 'dodge',
      KeyQ: 'lock', KeyV: 'view', KeyT: 'shoulder', Tab: 'inventory', KeyI: 'inventory',
      KeyP: 'tweak', KeyB: 'juice', KeyG: 'spawn', KeyR: 'reset', KeyH: 'help', KeyZ: 'walkToggle', CapsLock: 'walkToggle',
      KeyJ: 'attack', KeyK: 'guard', KeyL: 'dodge',
      Digit1: 'slot1', Digit2: 'slot2', Digit3: 'slot3', Digit4: 'slot4', Digit5: 'slot5', Digit6: 'slot6',
    };
    const onKey = (e: KeyboardEvent, down: boolean) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      const c = e.code;
      if (c === 'KeyW' || c === 'ArrowUp') this.keyMove.f = down ? 1 : 0;
      else if (c === 'KeyS' || c === 'ArrowDown') this.keyMove.b = down ? 1 : 0;
      else if (c === 'KeyA' || c === 'ArrowLeft') this.keyMove.l = down ? 1 : 0;
      else if (c === 'KeyD' || c === 'ArrowRight') this.keyMove.r = down ? 1 : 0;
      const a = keyMap[c];
      if (a) {
        if (e.repeat) {
          e.preventDefault();
          return;
        }
        this.setButton(a, down);
        if (down && a === 'walkToggle') this.walkMode = !this.walkMode;
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', (e) => onKey(e, true));
    window.addEventListener('keyup', (e) => onKey(e, false));
    window.addEventListener('blur', () => this.releaseAll());

    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    canvas.addEventListener('mousedown', (e) => {
      if (this.touchMode) return;
      if (document.pointerLockElement !== canvas) {
        if (!this.blocked) canvas.requestPointerLock?.();
        return;
      }
      if (e.button === 0) this.setButton('attack', true);
      if (e.button === 2) this.setButton('guard', true);
      if (e.button === 1) {
        this.setButton('lock', true);
        e.preventDefault();
      }
    });
    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.setButton('attack', false);
      if (e.button === 2) this.setButton('guard', false);
      if (e.button === 1) this.setButton('lock', false);
    });
    let lockedAt = 0;
    window.addEventListener('mousemove', (e) => {
      if (document.pointerLockElement !== canvas) return;
      // alguns navegadores geram saltos enormes logo após travar o ponteiro
      if (performance.now() - lockedAt < 120 || Math.abs(e.movementX) > 350 || Math.abs(e.movementY) > 350) return;
      this.addLook(e.movementX, e.movementY);
    });
    canvas.addEventListener('wheel', (e) => {
      if (document.pointerLockElement !== canvas) return;
      this.tap(e.deltaY > 0 ? 'nextItem' : 'prevItem');
    }, { passive: true });
    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement === canvas) lockedAt = performance.now();
      if (document.pointerLockElement !== canvas) {
        this.setButton('attack', false);
        this.setButton('guard', false);
      }
    });
  }
}
