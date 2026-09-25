import * as THREE from 'three';
import type { GameContext } from '../core/Context';
import type { PlayerController } from '../character/PlayerController';
import { clamp, clamp01, damp, Spring } from '../core/math';

/**
 * Movimento de câmera "juicy" para ações que não tinham nenhum: molas de
 * pitch/yaw/roll, FOV e distância (dolly) disparadas por eventos de jogo, e
 * inclinações contínuas (strafe, curva correndo, carga, salto).
 * Não mexe no que já tinha movimento próprio (golpe em 1ª pessoa, esquiva
 * lateral em 1ª pessoa, mergulho da aterrissagem, balanço de cabeça).
 *
 * Saída: offsets somados pela CameraRig — rotação em rad, fov em graus,
 * dolly em metros (só 3ª pessoa) e lift (atraso vertical da 3ª pessoa).
 */
export class CameraJuice {
  readonly rot = new THREE.Vector3();
  fov = 0;
  dolly = 0;
  lift = 0;

  private pitch = new Spring(190, 15);
  private yaw = new Spring(170, 14);
  private roll = new Spring(170, 13);
  private fovS = new Spring(150, 13);
  private dollyS = new Spring(110, 13);
  private leanRoll = 0;
  private chargeW = 0;
  private sprintW = 0;
  private followY = NaN;
  /** 0 = 3ª pessoa, 1 = 1ª pessoa (atualizado pela CameraRig). */
  blend = 0;

  constructor(private ctx: GameContext, private player: () => PlayerController) {
    const ev = ctx.events;
    const k = () => ctx.tuning.camJuice;
    const third = () => 1 - this.blend;

    ev.on('swing', (e) => {
      if (e.source !== 'player') return;
      const a = this.player().attack;
      if (!a) return;
      // 3ª pessoa: a câmera acompanha o golpe (1ª pessoa já tem o seu)
      const side = Math.sign(a.def.arc[0] - a.def.arc[1]) || 1;
      const s = (0.4 + a.def.strength) * k() * third();
      if (a.def.overhead) this.pitch.impulse(-1.6 * s);
      else this.yaw.impulse(side * 1.9 * s);
      this.roll.impulse(-side * 0.6 * s);
      this.dollyS.impulse(-(2 + a.def.lunge * 0.4) * s);
    });
    ev.on('hit', (e) => {
      const p = this.player();
      if (e.source === 'player') {
        // acerto: "soco" de FOV + leve avanço
        const s = (0.5 + e.hit.strength) * k();
        this.fovS.impulse(-38 * s);
        this.dollyS.impulse(-1.2 * s * third());
        return;
      }
      if (e.target !== (p as unknown)) return;
      const r = e.result;
      if (r.parried) {
        this.fovS.impulse(-70 * k());
        this.pitch.impulse(0.9 * k());
      } else if (r.blocked) {
        // bloqueio: empurrão para trás
        this.pitch.impulse(1.6 * k());
        this.roll.impulse((Math.random() < 0.5 ? -1 : 1) * 0.8 * k());
        this.dollyS.impulse(3 * k() * third());
        this.fovS.impulse(18 * k());
      } else {
        // tomou dano: cabeça jogada para o lado
        this.roll.impulse((Math.random() < 0.5 ? -1 : 1) * 2.6 * k());
        this.pitch.impulse(1.8 * k());
        this.dollyS.impulse(2.5 * k() * third());
      }
    });
    ev.on('enemyDeath', () => {
      this.fovS.impulse(-45 * k());
      this.roll.impulse((Math.random() < 0.5 ? -1 : 1) * 0.6 * k());
    });
    ev.on('jump', () => {
      this.pitch.impulse(0.7 * k());
      this.dollyS.impulse(1.4 * k() * third());
    });
    ev.on('mantlePull', (e) => {
      // tranco para cima: cabeça dá um solavanco e a câmera "puxa"
      this.pitch.impulse((1.2 + 1.3 * e.intensity) * k());
      this.roll.impulse((Math.random() < 0.5 ? -1 : 1) * 0.5 * k());
      this.fovS.impulse(-14 * k());
      this.dollyS.impulse(-0.8 * k() * third());
      if (ctx.tuning.shakeEnabled) ctx.shake.add(0.12 + 0.1 * e.intensity);
      ctx.sound.play('jump', { pos: e.pos, vol: 0.55 });
    });
    ev.on('land', (e) => {
      if (!e.player) return;
      this.pitch.impulse(-(0.6 + e.intensity * 3) * k());
      this.dollyS.impulse(-(0.5 + e.intensity * 2) * k() * third());
    });
    ev.on('dodge', () => {
      const p = this.player();
      const d = p.dodgeType;
      if (d === 'hopF') this.pitch.impulse(-0.9 * k());
      if (d === 'back') this.pitch.impulse(0.9 * k());
      if (d === 'flip') this.pitch.impulse(1.6 * k());
      // 3ª pessoa: inclina junto com o salto lateral e abre a câmera
      if (d === 'hopL' || d === 'hopR') this.roll.impulse((d === 'hopL' ? 1 : -1) * 1.4 * k() * third());
      this.dollyS.impulse(2 * k() * third());
    });
    ev.on('perfectDodge', () => {
      this.fovS.impulse(-90 * k());
      this.roll.impulse(1.2 * k());
    });
    ev.on('chargeReady', () => this.fovS.impulse(-40 * k()));
    ev.on('bowFire', (e) => {
      this.pitch.impulse((0.6 + e.power * 1.4) * k());
      this.fovS.impulse(30 * e.power * k());
    });
    ev.on('treeFell', () => this.pitch.impulse(-0.8 * k()));
    ev.on('rockBroke', () => this.fovS.impulse(-35 * k()));
  }

  update(dt: number) {
    const T = this.ctx.tuning;
    const p = this.player();
    const k = T.camJuice;
    const third = 1 - this.blend;
    const sdt = Math.max(dt, 1 / 240);
    for (const s of [this.pitch, this.yaw, this.roll, this.fovS, this.dollyS]) s.update(sdt);

    // inclinação contínua: strafe (1ª pessoa) e curva correndo (as duas)
    const v = p.motor.velocity;
    const f = p.facing;
    const lateral = v.x * -Math.cos(f) + v.z * Math.sin(f); // + = direita
    const speed = Math.hypot(v.x, v.z);
    let lean = -lateral * 0.007 * this.blend;
    if (p.sprinting) lean += clamp(-p.turnRate * 0.012, -0.06, 0.06) * clamp01(speed / 6);
    this.leanRoll = damp(this.leanRoll, lean * k, 8, dt);

    // carga: aproxima devagar enquanto segura
    const charging = p.state === 'charge' ? clamp01(p.chargeT / T.chargeTime) : 0;
    this.chargeW = damp(this.chargeW, charging, 6, dt);
    // corrida: 3ª pessoa abre um pouco a distância
    this.sprintW = damp(this.sprintW, p.sprinting ? 1 : 0, 3, dt);

    // 3ª pessoa: no ar a câmera segue a altura com atraso (sensação de altura)
    const y = p.position.y;
    if (!Number.isFinite(this.followY) || Math.abs(this.followY - y) > 3) this.followY = y;
    this.followY = damp(this.followY, y, p.motor.grounded ? 14 : 5, dt);
    this.lift = (this.followY - y) * 0.35 * k * third;

    // escalas: picos ~2–5° de rotação, ~1,5–4° de FOV, ~0,2–0,4 m de distância
    // 3ª pessoa bem mais sutil (a câmera está longe; tudo parece maior)
    const m = 0.4 + 0.6 * this.blend;
    this.rot.set(this.pitch.value * 2.5 * m, this.yaw.value * 2.5 * m, (this.roll.value * 2.5 + this.leanRoll) * m);
    this.fov = (this.fovS.value * 1.5 - this.chargeW * 6 * k) * m;
    this.dolly = (this.dollyS.value * 6 - this.chargeW * 0.6 * k + this.sprintW * 0.35 * k) * third * 0.45;
  }
}
