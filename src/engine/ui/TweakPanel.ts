import GUI from 'lil-gui';
import { defaultTuning, rawPreset, saveTuning, type Tuning } from '../core/Tuning';

/**
 * Painel de ajustes em tempo real (lil-gui). Todos os valores alteram o
 * objeto `Tuning` compartilhado — efeito imediato, sem reiniciar.
 * Inclui comparação "Juicy x Cru" e persistência local.
 */
export class TweakPanel {
  readonly gui: GUI;
  private juiceBackup: Partial<Tuning> | null = null;
  readonly wrap: HTMLDivElement;
  extraActions: Record<string, () => void> = {};

  constructor(private t: Tuning, actions: Record<string, () => void> = {}) {
    this.extraActions = actions;
    // container próprio: posicionamento controlado pelo CSS (desktop e celular)
    this.wrap = document.createElement('div');
    this.wrap.className = 'tweak-wrap';
    document.body.appendChild(this.wrap);
    const gui = new GUI({ title: 'Ajustes de sensação (P)', width: 300, container: this.wrap });
    this.gui = gui;
    gui.domElement.classList.add('tweak');

    const presets = {
      'Juice: comparar (liga/desliga)': () => this.toggleJuice(),
      'Preset: Juicy (padrão)': () => this.apply(defaultTuning()),
      'Preset: Cru (sem efeitos)': () => this.apply({ ...this.t, ...rawPreset(this.t) }),
      'Preset: Arcade rápido': () => this.apply({ ...this.t, runSpeed: 7.6, walkSpeed: 3.2, acceleration: 60, deceleration: 70, attackSpeedMul: 1.35, recoveryMul: 0.7, hitStopMul: 0.7, dodgeDuration: 0.28 }),
      'Preset: Pesado/realista': () => this.apply({ ...this.t, runSpeed: 5.4, walkSpeed: 2.2, acceleration: 22, deceleration: 30, attackSpeedMul: 0.8, recoveryMul: 1.3, hitStopMul: 1.4, shakeMul: 1.3, cancelWindowMul: 1.6 }),
      'Salvar no navegador': () => saveTuning(this.t),
      'Copiar JSON': () => navigator.clipboard?.writeText(JSON.stringify(this.t, null, 2)),
    };
    const fp = gui.addFolder('Presets e comparação');
    for (const [k, fn] of Object.entries(presets)) fp.add({ [k]: fn }, k);
    for (const [k, fn] of Object.entries(actions)) fp.add({ [k]: fn }, k);

    const f = (name: string, closed = true) => {
      const folder = gui.addFolder(name);
      if (closed) folder.close();
      return folder;
    };
    const mv = f('Movimento', false);
    mv.add(t, 'walkSpeed', 0.5, 5, 0.1).name('Andar (m/s)');
    mv.add(t, 'runSpeed', 2, 12, 0.1).name('Correr — Shift (m/s)');
    mv.add(t, 'acceleration', 5, 120, 1).name('Aceleração');
    mv.add(t, 'deceleration', 5, 140, 1).name('Desaceleração');
    mv.add(t, 'airControl', 0, 1, 0.05).name('Controle no ar');
    mv.add(t, 'turnSpeed', 4, 40, 1).name('Velocidade de giro');
    mv.add(t, 'jumpHeight', 0.4, 3, 0.05).name('Altura do salto');
    mv.add(t, 'gravity', 8, 60, 1).name('Gravidade');
    mv.add(t, 'fallGravityMul', 1, 3, 0.05).name('Gravidade na queda ×');
    mv.add(t, 'jumpCutMul', 0.1, 1, 0.05).name('Corte do salto (soltar)');
    mv.add(t, 'coyoteTime', 0, 0.4, 0.01).name('Tolerância de borda (s)');
    mv.add(t, 'jumpBuffer', 0, 0.4, 0.01).name('Buffer de salto (s)');

    const dg = f('Esquiva e stamina');
    dg.add(t, 'dodgeDistance', 1, 7, 0.1).name('Distância');
    dg.add(t, 'dodgeDuration', 0.15, 0.8, 0.01).name('Duração (s)');
    dg.add(t, 'dodgeIFrameStart', 0, 0.3, 0.01).name('Invulnerável de (s)');
    dg.add(t, 'dodgeIFrameEnd', 0, 0.8, 0.01).name('Invulnerável até (s)');
    dg.add(t, 'dodgeCooldown', 0, 1, 0.01).name('Recarga (s)');
    dg.add(t, 'perfectDodgeWindow', 0, 0.5, 0.01).name('Janela esquiva perfeita');
    dg.add(t, 'flurryEnabled').name('Rajada após esquiva perfeita');
    dg.add(t, 'staminaMax', 30, 300, 5).name('Stamina máx.');
    dg.add(t, 'staminaRegen', 5, 100, 1).name('Regeneração/s');
    dg.add(t, 'sprintCost', 0, 60, 1).name('Custo de correr/s');
    dg.add(t, 'dodgeCost', 0, 50, 1).name('Custo esquiva');

    const cb = f('Combate', false);
    cb.add(t, 'damageMul', 0.1, 5, 0.05).name('Dano ×');
    cb.add(t, 'rangeMul', 0.5, 2, 0.05).name('Alcance ×');
    cb.add(t, 'attackSpeedMul', 0.3, 2.5, 0.05).name('Velocidade dos golpes ×');
    cb.add(t, 'recoveryMul', 0.2, 2.5, 0.05).name('Recuperação ×');
    cb.add(t, 'cancelWindowMul', 0, 3, 0.05).name('Janela de cancelamento ×');
    cb.add(t, 'attackBuffer', 0, 0.6, 0.01).name('Buffer de ataque (s)');
    cb.add(t, 'chargeTime', 0.2, 2, 0.05).name('Tempo de carga (s)');
    cb.add(t, 'chargeCost', 0, 60, 1).name('Custo ataque carregado');
    cb.add(t, 'knockbackMul', 0, 3, 0.05).name('Empurrão ×');
    cb.add(t, 'lockOnAssist').name('Assistência de mira/lock');

    const pr = f('Defesa e aparo', false);
    pr.add(t, 'parryWindow', 0, 0.6, 0.01).name('Janela de aparo (s)');
    pr.add(t, 'blockAngle', 20, 180, 1).name('Ângulo protegido (°)');
    pr.add(t, 'blockStaminaCost', 0, 40, 1).name('Custo de bloqueio');
    pr.add(t, 'enemyDamageMul', 0, 4, 0.1).name('Dano inimigo ×');
    pr.add(t, 'enemyAggression', 0.2, 3, 0.1).name('Agressividade inimiga');

    const fx = f('Feedback / "juice"', false);
    fx.add(t, 'hitStopEnabled').name('Hit stop');
    fx.add(t, 'hitStopMul', 0, 4, 0.05).name('Hit stop ×');
    fx.add(t, 'shakeEnabled').name('Tremor de câmera');
    fx.add(t, 'shakeMul', 0, 3, 0.05).name('Tremor ×');
    fx.add(t, 'particlesEnabled').name('Partículas');
    fx.add(t, 'particleMul', 0, 3, 0.05).name('Intensidade partículas ×');
    fx.add(t, 'trailsEnabled').name('Rastro dos golpes');
    fx.add(t, 'hitFlashEnabled').name('Flash no alvo');
    fx.add(t, 'damageNumbers').name('Números de dano');
    fx.add(t, 'weaponRecoil').name('Recuo da arma');
    fx.add(t, 'screenFx').name('Efeitos de tela');

    const cam = f('Câmera');
    cam.add(t, 'fov', 50, 110, 1).name('Campo de visão');
    cam.add(t, 'sensitivity', 0.1, 4, 0.05).name('Sensibilidade');
    cam.add(t, 'invertY').name('Inverter Y');
    cam.add(t, 'camDistance', 1.5, 9, 0.1).name('Distância (3ª)');
    cam.add(t, 'camShoulder', 0, 1.5, 0.05).name('Deslocamento ombro');
    cam.add(t, 'camHeight', 0.8, 2.5, 0.05).name('Altura (3ª)');
    cam.add(t, 'camBob').name('Balanço da cabeça');
    cam.add(t, 'camBobAmount', 0, 3, 0.05).name('Balanço ×');
    cam.add(t, 'weaponSway').name('Balanço da arma (1ª)');
    cam.add(t, 'weaponSwayAmount', 0, 3, 0.05).name('Balanço da arma ×');
    cam.add(t, 'fovKick').name('FOV dinâmico');

    const au = f('Áudio e debug');
    au.add(t, 'soundEnabled').name('Som');
    au.add(t, 'volume', 0, 1.5, 0.05).name('Volume');
    au.add(t, 'timeScale', { '1× normal': 1, '0.5×': 0.5, '0.25×': 0.25, '0.1× (quadro a quadro)': 0.1 }).name('Câmera lenta');
    au.add(t, 'showHitboxes').name('Mostrar hitboxes');

    gui.onChange(() => saveTuning(this.t));
    gui.close();
  }

  private apply(v: Partial<Tuning>) {
    Object.assign(this.t, v);
    this.juiceBackup = null;
    this.refresh();
    saveTuning(this.t);
  }

  toggleJuice() {
    if (this.juiceBackup) {
      Object.assign(this.t, this.juiceBackup);
      this.juiceBackup = null;
    } else {
      const raw = rawPreset(this.t);
      this.juiceBackup = {};
      for (const k of Object.keys(raw) as (keyof Tuning)[]) (this.juiceBackup as Record<string, unknown>)[k] = this.t[k];
      Object.assign(this.t, raw);
    }
    this.refresh();
    return !this.juiceBackup;
  }

  refresh() {
    this.gui.controllersRecursive().forEach((c) => c.updateDisplay());
  }

  get isOpen() {
    return !this.gui._closed;
  }

  toggle() {
    if (this.gui._closed) this.gui.open();
    else this.gui.close();
    this.wrap.classList.toggle('open', !this.gui._closed);
  }
}
