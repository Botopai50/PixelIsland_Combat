import * as THREE from 'three';
import type { Tuning } from '../core/Tuning';
import { rand } from '../core/math';

/**
 * Motor de áudio 100% procedural (Web Audio API). Nenhum arquivo de som é
 * necessário: todos os efeitos são sintetizados, com pequenas variações
 * aleatórias de afinação/timbre em cada disparo para evitar repetição.
 *
 * Uso: `sound.play('hitWood', { pos, intensity: 0.8 })`.
 */
export type SoundName =
  | 'step' | 'jump' | 'land' | 'whoosh' | 'dodge'
  | 'hitFlesh' | 'hitWood' | 'hitStone' | 'hitMetal' | 'hitDummy'
  | 'block' | 'parry' | 'playerHurt' | 'guardBreak'
  | 'bowRelease' | 'arrowHit' | 'hitConfirm' | 'noAmmo'
  | 'pickup' | 'treeCreak' | 'treeFall' | 'rockBreak' | 'rockCrack'
  | 'equip' | 'unequip' | 'chargeReady' | 'chargeStart'
  | 'enemyWindup' | 'enemyDeath' | 'enemySpawn' | 'enemyHurt' | 'stagger'
  | 'flurry' | 'uiClick' | 'wallClank' | 'exhausted' | 'resetArena';

export interface PlayOpts {
  pos?: THREE.Vector3;
  vol?: number;
  pitch?: number;
  /** 0..1+ — força da ação (muda timbre, volume e grave). */
  intensity?: number;
  /** Variante (ex.: superfície do passo). */
  variant?: string;
}

export interface LoopHandle {
  set(v: number): void;
  stop(): void;
}

type Ctx = AudioContext;

export class SoundEngine {
  ctx: Ctx | null = null;
  private master!: GainNode;
  private sfx!: GainNode;
  private reverbSend!: GainNode;
  private noiseBuf!: AudioBuffer;
  private listenerPos = new THREE.Vector3();
  private listenerRight = new THREE.Vector3(1, 0, 0);
  private lastPlay = new Map<string, number>();

  constructor(private tuning: Tuning) {}

  /** Precisa ser chamado dentro de um gesto do usuário (clique/toque). */
  unlock() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return;
    const ctx: Ctx = new AC();
    this.ctx = ctx;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.ratio.value = 4;
    comp.attack.value = 0.003;
    comp.release.value = 0.15;
    this.master = ctx.createGain();
    this.master.gain.value = this.tuning.volume;
    this.master.connect(comp).connect(ctx.destination);
    this.sfx = ctx.createGain();
    this.sfx.connect(this.master);

    // ruído branco reutilizável
    const len = ctx.sampleRate * 2;
    this.noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = this.noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;

    // reverb curto (sala pequena/ar livre) para dar corpo aos impactos
    const conv = ctx.createConvolver();
    const irLen = Math.floor(ctx.sampleRate * 1.1);
    const ir = ctx.createBuffer(2, irLen, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const ch = ir.getChannelData(c);
      for (let i = 0; i < irLen; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / irLen, 3.2);
    }
    conv.buffer = ir;
    this.reverbSend = ctx.createGain();
    this.reverbSend.gain.value = 0.22;
    this.reverbSend.connect(conv).connect(this.master);
  }

  setListener(pos: THREE.Vector3, right: THREE.Vector3) {
    this.listenerPos.copy(pos);
    this.listenerRight.copy(right);
    if (this.ctx) this.master.gain.value = this.tuning.soundEnabled ? this.tuning.volume : 0;
  }

  // ------------------------------------------------------------------ helpers
  private out(opts: PlayOpts, vol: number): { node: GainNode; t: number } | null {
    const ctx = this.ctx;
    if (!ctx || !this.tuning.soundEnabled) return null;
    const g = ctx.createGain();
    let v = vol * (opts.vol ?? 1);
    let pan = 0;
    if (opts.pos) {
      const dx = opts.pos.x - this.listenerPos.x;
      const dy = opts.pos.y - this.listenerPos.y;
      const dz = opts.pos.z - this.listenerPos.z;
      const dist = Math.hypot(dx, dy, dz);
      v *= 1 / (1 + Math.max(0, dist - 2) * 0.09);
      if (dist > 0.01) pan = (dx * this.listenerRight.x + dz * this.listenerRight.z) / dist;
    }
    g.gain.value = v;
    if (ctx.createStereoPanner) {
      const p = ctx.createStereoPanner();
      p.pan.value = Math.max(-0.85, Math.min(0.85, pan * 0.8));
      g.connect(p);
      p.connect(this.sfx);
      p.connect(this.reverbSend);
    } else {
      g.connect(this.sfx);
      g.connect(this.reverbSend);
    }
    return { node: g, t: ctx.currentTime };
  }

  private noise(
    out: AudioNode, t: number, dur: number,
    type: BiquadFilterType, f0: number, f1: number, q: number,
    gain: number, attack = 0.002,
  ) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    src.playbackRate.value = rand(0.9, 1.1);
    const flt = ctx.createBiquadFilter();
    flt.type = type;
    flt.Q.value = q;
    flt.frequency.setValueAtTime(f0, t);
    flt.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(flt).connect(g).connect(out);
    src.start(t, Math.random() * 1.5);
    src.stop(t + dur + 0.05);
  }

  private tone(
    out: AudioNode, t: number, dur: number, type: OscillatorType,
    f0: number, f1: number, gain: number, attack = 0.003,
  ) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  /** Sino inarmônico (metal, aparo). */
  private bell(out: AudioNode, t: number, f: number, ratios: number[], dur: number, gain: number) {
    ratios.forEach((r, i) => {
      this.tone(out, t, dur * (1 - i * 0.12), 'sine', f * r, f * r * 0.995, gain / (1 + i * 0.6), 0.001);
    });
  }

  // ------------------------------------------------------------------ API
  play(name: SoundName, opts: PlayOpts = {}) {
    // limita spam do mesmo som no mesmo instante
    const now = performance.now();
    const last = this.lastPlay.get(name) ?? 0;
    if (now - last < 18) return;
    this.lastPlay.set(name, now);

    const i = opts.intensity ?? 0.5;
    const p = (opts.pitch ?? 1) * rand(0.94, 1.06);
    const o = this.out(opts, 1);
    if (!o) return;
    const out = o.node;
    const t = o.t;

    switch (name) {
      case 'step': {
        const v = opts.variant ?? 'grass';
        if (v === 'stone') {
          this.noise(out, t, 0.07, 'bandpass', 2400 * p, 1500, 1.2, 0.18 * (0.6 + i));
          this.tone(out, t, 0.05, 'triangle', 160 * p, 90, 0.06);
        } else if (v === 'wood') {
          this.noise(out, t, 0.08, 'bandpass', 900 * p, 500, 2, 0.2 * (0.6 + i));
          this.tone(out, t, 0.08, 'sine', 140 * p, 90, 0.12);
        } else {
          this.noise(out, t, 0.11, 'lowpass', 1400 * p, 300, 0.7, 0.2 * (0.6 + i));
          this.noise(out, t + 0.02, 0.06, 'highpass', 4000, 3000, 0.5, 0.03);
        }
        break;
      }
      case 'jump':
        this.noise(out, t, 0.14, 'bandpass', 600 * p, 1800, 1, 0.12);
        this.tone(out, t, 0.12, 'sine', 180 * p, 260, 0.05);
        break;
      case 'land':
        this.noise(out, t, 0.12 + i * 0.15, 'lowpass', 900 * p, 120, 0.8, 0.25 + i * 0.4);
        this.tone(out, t, 0.14 + i * 0.1, 'sine', 110 * p, 45, 0.2 + i * 0.3);
        break;
      case 'whoosh': {
        const d = 0.16 + i * 0.22;
        this.noise(out, t, d, 'bandpass', (500 + i * 200) * p, (1800 - i * 700) * p, 2.2 - i, 0.16 + i * 0.22, d * 0.45);
        if (i > 0.6) this.noise(out, t, d * 1.2, 'lowpass', 400, 120, 1, 0.1 + (i - 0.6) * 0.4, d * 0.5);
        break;
      }
      case 'dodge':
        this.noise(out, t, 0.2, 'bandpass', 1200 * p, 500, 1.1, 0.16, 0.05);
        this.noise(out, t + 0.12, 0.12, 'lowpass', 700, 200, 0.7, 0.1);
        break;
      case 'hitFlesh': {
        this.tone(out, t, 0.12 + i * 0.18, 'sine', (150 + i * 30) * p, 45, 0.45 + i * 0.4);
        this.noise(out, t, 0.08 + i * 0.1, 'bandpass', 1300 * p, 400, 0.9, 0.35 + i * 0.3);
        this.noise(out, t, 0.04, 'highpass', 5000, 3000, 0.7, 0.12);
        if (i > 0.7) this.tone(out, t, 0.35, 'triangle', 70 * p, 35, 0.35);
        break;
      }
      case 'hitWood': {
        const f = rand(380, 520) * p;
        this.noise(out, t, 0.14 + i * 0.1, 'bandpass', f * 2, f, 6, 0.55 + i * 0.3);
        this.tone(out, t, 0.12 + i * 0.1, 'triangle', f * 0.5, f * 0.35, 0.28 + i * 0.2);
        this.noise(out, t, 0.03, 'highpass', 3500, 2500, 0.6, 0.18); // estalo
        if (i > 0.6) this.tone(out, t, 0.3, 'sine', 90 * p, 50, 0.3);
        break;
      }
      case 'hitStone': {
        this.noise(out, t, 0.06, 'highpass', 3800 * p, 2200, 0.8, 0.45);
        this.bell(out, t, rand(900, 1300) * p, [1, 2.3, 3.7], 0.12, 0.1);
        this.noise(out, t, 0.25 + i * 0.25, 'lowpass', 1800, 150, 0.6, 0.3 + i * 0.25); // poeira/esfarelar
        this.tone(out, t, 0.16, 'sine', 120 * p, 55, 0.25 + i * 0.2);
        break;
      }
      case 'hitMetal':
      case 'wallClank': {
        const f = rand(620, 820) * p;
        this.noise(out, t, 0.05, 'highpass', 6000, 3500, 0.7, 0.4);
        this.bell(out, t, f, [1, 2.76, 5.4, 8.93], 0.55 + i * 0.4, 0.28 + i * 0.12);
        this.tone(out, t, 0.12, 'square', f * 0.5, f * 0.3, 0.05);
        break;
      }
      case 'hitDummy':
        this.noise(out, t, 0.18, 'bandpass', 700 * p, 300, 1.4, 0.45 + i * 0.3);
        this.noise(out, t, 0.12, 'highpass', 3000, 1800, 0.6, 0.16); // palha
        this.tone(out, t, 0.14, 'sine', 130 * p, 70, 0.25 + i * 0.2);
        break;
      case 'block': {
        // escudo: pancada surda + clangor metálico curto
        this.tone(out, t, 0.16, 'sine', 160 * p, 70, 0.55);
        this.noise(out, t, 0.12, 'bandpass', 900 * p, 400, 1.3, 0.5);
        this.bell(out, t, 540 * p, [1, 2.4, 4.1], 0.3, 0.12);
        break;
      }
      case 'parry': {
        // aparo: "TING" brilhante + brilho descendente + reverso
        this.noise(out, t, 0.04, 'highpass', 7000, 5000, 0.7, 0.5);
        this.bell(out, t, 1320 * p, [1, 2.01, 3.03, 4.2], 1.2, 0.4);
        this.bell(out, t + 0.03, 1980 * p, [1, 1.5], 0.9, 0.16);
        this.tone(out, t, 0.5, 'sine', 3200, 800, 0.08, 0.001);
        this.noise(out, t, 0.35, 'bandpass', 3000, 9000, 1.2, 0.08, 0.2);
        break;
      }
      case 'guardBreak':
        this.bell(out, t, 420 * p, [1, 2.7, 4.3], 0.5, 0.3);
        this.noise(out, t, 0.3, 'lowpass', 2000, 200, 0.8, 0.5);
        this.tone(out, t, 0.3, 'sawtooth', 200, 60, 0.15);
        break;
      case 'playerHurt': {
        this.tone(out, t, 0.22, 'sine', 120, 40, 0.6);
        this.noise(out, t, 0.14, 'bandpass', 900, 300, 1, 0.5);
        // "grunhido" formântico
        const o2 = this.ctx!.createOscillator();
        o2.type = 'sawtooth';
        o2.frequency.setValueAtTime(190 * p, t);
        o2.frequency.exponentialRampToValueAtTime(120 * p, t + 0.22);
        const f = this.ctx!.createBiquadFilter();
        f.type = 'bandpass'; f.frequency.value = 700; f.Q.value = 5;
        const g = this.ctx!.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
        o2.connect(f).connect(g).connect(out);
        o2.start(t); o2.stop(t + 0.3);
        break;
      }
      case 'bowRelease': {
        // corda: "twang" (tom com queda rápida) + sopro
        this.tone(out, t, 0.28, 'triangle', (260 + i * 180) * p, 110, 0.4);
        this.tone(out, t, 0.09, 'square', 90 * p, 60, 0.15);
        this.noise(out, t, 0.2 + i * 0.1, 'bandpass', 2500, 900, 1.5, 0.16 + i * 0.12, 0.01);
        break;
      }
      case 'arrowHit': {
        const v = opts.variant ?? 'wood';
        this.tone(out, t, 0.1, 'triangle', 240 * p, 110, 0.35);
        this.noise(out, t, 0.08, 'bandpass', v === 'stone' ? 3000 : 1200, 500, 2, 0.35);
        if (v === 'metal') this.bell(out, t, 900 * p, [1, 2.7], 0.3, 0.16);
        // "zing" da haste vibrando
        this.tone(out, t + 0.02, 0.25, 'sine', 420 * p, 380, 0.05);
        break;
      }
      case 'hitConfirm':
        // "ding" audível à distância para confirmar acerto
        this.tone(out, t, 0.14, 'sine', 1400 * p, 1400, 0.22, 0.001);
        this.tone(out, t + 0.05, 0.2, 'sine', 2100 * p, 2100, 0.16, 0.001);
        break;
      case 'noAmmo':
        this.tone(out, t, 0.05, 'square', 180, 140, 0.08);
        this.tone(out, t + 0.08, 0.05, 'square', 140, 110, 0.08);
        break;
      case 'pickup': {
        const base = 660 * p;
        [1, 1.26, 1.5].forEach((r, k) => this.tone(out, t + k * 0.055, 0.2, 'sine', base * r, base * r, 0.16, 0.002));
        this.noise(out, t, 0.1, 'highpass', 6000, 8000, 0.6, 0.05);
        break;
      }
      case 'treeCreak': {
        const ctx = this.ctx!;
        const o2 = ctx.createOscillator();
        o2.type = 'sawtooth';
        o2.frequency.setValueAtTime(60 * p, t);
        o2.frequency.linearRampToValueAtTime(95 * p, t + 0.8);
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 22;
        const lg = ctx.createGain(); lg.gain.value = 18;
        lfo.connect(lg).connect(o2.frequency);
        const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 500; f.Q.value = 4;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.25, t + 0.2);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
        o2.connect(f).connect(g).connect(out);
        o2.start(t); lfo.start(t); o2.stop(t + 1); lfo.stop(t + 1);
        break;
      }
      case 'treeFall':
        this.tone(out, t, 0.7, 'sine', 70, 30, 0.7);
        this.noise(out, t, 0.9, 'lowpass', 1200, 80, 0.7, 0.6);
        this.noise(out, t + 0.05, 0.5, 'bandpass', 2500, 800, 0.8, 0.18); // folhas
        break;
      case 'rockCrack':
        this.noise(out, t, 0.08, 'highpass', 2500 * p, 1500, 0.8, 0.4);
        this.tone(out, t, 0.08, 'square', 300 * p, 120, 0.06);
        break;
      case 'rockBreak':
        this.noise(out, t, 0.7, 'lowpass', 2600, 100, 0.6, 0.7);
        this.tone(out, t, 0.5, 'sine', 90, 35, 0.55);
        for (let k = 0; k < 6; k++) this.noise(out, t + rand(0.05, 0.5), 0.05, 'bandpass', rand(1500, 3500), 1000, 3, 0.18);
        break;
      case 'equip': {
        const v = opts.variant ?? 'blade';
        if (v === 'blade') {
          this.noise(out, t, 0.25, 'bandpass', 4000 * p, 7000, 5, 0.18, 0.08); // "shing"
          this.bell(out, t + 0.05, 2400 * p, [1, 1.5], 0.25, 0.04);
        } else if (v === 'bow') {
          this.tone(out, t, 0.12, 'triangle', 330 * p, 300, 0.12);
          this.noise(out, t, 0.1, 'bandpass', 1200, 900, 1, 0.1);
        } else if (v === 'shield') {
          this.tone(out, t, 0.12, 'sine', 180 * p, 120, 0.25);
          this.bell(out, t, 500 * p, [1, 2.6], 0.2, 0.06);
        } else {
          this.tone(out, t, 0.1, 'sine', 160 * p, 100, 0.2);
          this.noise(out, t, 0.1, 'bandpass', 900, 600, 1, 0.12);
        }
        break;
      }
      case 'unequip':
        this.noise(out, t, 0.15, 'bandpass', 1500 * p, 700, 1, 0.1, 0.03);
        break;
      case 'chargeStart':
        this.tone(out, t, 0.6, 'sine', 300 * p, 600, 0.05, 0.3);
        break;
      case 'chargeReady':
        this.bell(out, t, 1760 * p, [1, 2, 3], 0.5, 0.12);
        this.noise(out, t, 0.2, 'highpass', 6000, 9000, 0.6, 0.06);
        break;
      case 'enemyWindup': {
        this.tone(out, t, 0.35, 'sawtooth', 110 * p, 170 * p, 0.09, 0.05);
        this.noise(out, t, 0.3, 'bandpass', 500, 900, 2, 0.1, 0.1);
        break;
      }
      case 'enemyHurt':
        this.tone(out, t, 0.18, 'sawtooth', 260 * p, 150 * p, 0.08);
        break;
      case 'enemyDeath':
        this.tone(out, t, 0.5, 'sawtooth', 220 * p, 60, 0.12);
        this.noise(out, t + 0.25, 0.5, 'lowpass', 3000, 300, 0.6, 0.3, 0.05); // "puf"
        this.bell(out, t + 0.3, 880, [1, 1.5, 2], 0.5, 0.05);
        break;
      case 'enemySpawn':
        this.noise(out, t, 0.6, 'bandpass', 200, 1400, 2, 0.2, 0.3);
        this.tone(out, t, 0.6, 'sine', 80, 200, 0.2, 0.3);
        break;
      case 'stagger':
        this.tone(out, t, 0.5, 'sine', 900, 300, 0.1);
        this.tone(out, t + 0.1, 0.4, 'sine', 700, 250, 0.08);
        break;
      case 'flurry':
        this.noise(out, t, 0.6, 'bandpass', 3000, 400, 1.5, 0.25, 0.02);
        this.bell(out, t, 660, [1, 1.5, 2, 3], 1.2, 0.12);
        break;
      case 'uiClick':
        this.tone(out, t, 0.04, 'triangle', 900 * p, 700, 0.08);
        break;
      case 'exhausted':
        this.tone(out, t, 0.4, 'sine', 300, 150, 0.12);
        break;
      case 'resetArena':
        this.bell(out, t, 523, [1, 1.26, 1.5, 2], 0.8, 0.1);
        break;
    }
  }

  /** Som contínuo com parâmetro (ex.: tensão da corda do arco, 0..1). */
  loop(name: 'bowDraw' | 'charge'): LoopHandle {
    const ctx = this.ctx;
    if (!ctx || !this.tuning.soundEnabled) return { set() {}, stop() {} };
    const out = this.out({}, 1)!;
    const g = ctx.createGain();
    g.gain.value = 0;
    g.connect(out.node);
    const osc = ctx.createOscillator();
    const flt = ctx.createBiquadFilter();
    const lfo = ctx.createOscillator();
    const lfoG = ctx.createGain();
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    src.loop = true;
    const nf = ctx.createBiquadFilter();
    const ng = ctx.createGain();
    if (name === 'bowDraw') {
      // rangido da madeira + corda: serra filtrada com modulação irregular
      osc.type = 'sawtooth';
      osc.frequency.value = 70;
      flt.type = 'bandpass'; flt.Q.value = 6; flt.frequency.value = 400;
      lfo.frequency.value = 17;
      lfoG.gain.value = 12;
      nf.type = 'bandpass'; nf.frequency.value = 1800; nf.Q.value = 3;
      ng.gain.value = 0.05;
    } else {
      osc.type = 'sine';
      osc.frequency.value = 220;
      flt.type = 'lowpass'; flt.frequency.value = 2000; flt.Q.value = 1;
      lfo.frequency.value = 9;
      lfoG.gain.value = 6;
      nf.type = 'highpass'; nf.frequency.value = 5000; nf.Q.value = 0.5;
      ng.gain.value = 0.015;
    }
    lfo.connect(lfoG).connect(osc.frequency);
    osc.connect(flt).connect(g);
    src.connect(nf).connect(ng).connect(g);
    const t = ctx.currentTime;
    osc.start(t); lfo.start(t); src.start(t);
    let stopped = false;
    return {
      set: (v: number) => {
        if (stopped) return;
        const now = ctx.currentTime;
        if (name === 'bowDraw') {
          osc.frequency.setTargetAtTime(70 + v * 110, now, 0.05);
          flt.frequency.setTargetAtTime(350 + v * 900, now, 0.05);
          lfo.frequency.setTargetAtTime(14 + v * 20, now, 0.05);
          g.gain.setTargetAtTime(0.05 + v * 0.22, now, 0.04);
          nf.frequency.setTargetAtTime(1500 + v * 2500, now, 0.05);
        } else {
          osc.frequency.setTargetAtTime(220 + v * 440, now, 0.05);
          g.gain.setTargetAtTime(0.03 + v * 0.07, now, 0.05);
        }
      },
      stop: () => {
        if (stopped) return;
        stopped = true;
        const now = ctx.currentTime;
        g.gain.cancelScheduledValues(now);
        g.gain.setTargetAtTime(0, now, 0.02);
        osc.stop(now + 0.15); lfo.stop(now + 0.15); src.stop(now + 0.15);
      },
    };
  }
}
