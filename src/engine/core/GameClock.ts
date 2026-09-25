import type { Tuning } from './Tuning';

/**
 * Relógio do jogo com suporte a hit stop (congelamento curto), câmera lenta
 * temporária (ex.: esquiva perfeita) e escala global de tempo (debug).
 *
 * - `dt`: tempo do mundo (inimigos, física, partículas) — congela no hit stop.
 * - `playerDt`: tempo do jogador — também congela no hit stop, mas não sofre a
 *   câmera lenta de "flurry" (o jogador age em velocidade normal).
 * - `realDt`: tempo real (UI, câmera, som).
 */
export class GameClock {
  realDt = 0;
  dt = 0;
  playerDt = 0;
  time = 0;
  realTime = 0;
  private hitStopLeft = 0;
  private slowLeft = 0;
  private slowScale = 1;
  private slowDur = 1;
  constructor(private tuning: Tuning) {}

  hitStop(seconds: number) {
    if (!this.tuning.hitStopEnabled) return;
    this.hitStopLeft = Math.max(this.hitStopLeft, seconds * this.tuning.hitStopMul);
  }

  /** Câmera lenta aplicada ao mundo (não ao jogador). */
  slowWorld(scale: number, duration: number) {
    this.slowScale = scale;
    this.slowLeft = duration;
    this.slowDur = duration;
  }

  get inHitStop() {
    return this.hitStopLeft > 0;
  }
  get worldSlow() {
    return this.slowLeft > 0 ? this.slowScale : 1;
  }
  get slowProgress() {
    return this.slowLeft > 0 ? 1 - this.slowLeft / this.slowDur : 1;
  }

  tick(rawSeconds: number) {
    const real = Math.min(rawSeconds, 1 / 20); // evita saltos enormes após travadas
    this.realDt = real;
    this.realTime += real;
    const scaled = real * this.tuning.timeScale;
    if (this.hitStopLeft > 0) {
      this.hitStopLeft -= real;
      this.dt = 0;
      this.playerDt = 0;
    } else {
      let world = 1;
      if (this.slowLeft > 0) {
        this.slowLeft -= real;
        // volta suavemente ao normal no final
        const k = this.slowLeft < 0.25 ? 1 - this.slowLeft / 0.25 : 0;
        world = this.slowScale + (1 - this.slowScale) * k;
      }
      this.playerDt = scaled;
      this.dt = scaled * world;
    }
    this.time += this.dt;
  }
}
