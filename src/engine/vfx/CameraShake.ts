import * as THREE from 'three';
import type { Tuning } from '../core/Tuning';
import { smoothNoise } from '../core/math';

/**
 * Tremor de câmera baseado em "trauma" (Squirrel Eiserloh): intensidade =
 * trauma², decai com o tempo. Também aceita "kick" direcional (empurrão curto
 * na direção do golpe), que comunica de onde veio o impacto.
 */
export class CameraShake {
  private trauma = 0;
  private t = 0;
  readonly rot = new THREE.Euler();
  readonly offset = new THREE.Vector3();
  private kick = new THREE.Vector3();
  private kickVel = new THREE.Vector3();

  constructor(private tuning: Tuning) {}

  add(amount: number) {
    if (!this.tuning.shakeEnabled) return;
    this.trauma = Math.min(1, this.trauma + amount * this.tuning.shakeMul);
  }

  /** Empurrão direcional em espaço de câmera (x = direita, y = cima). */
  push(x: number, y: number, amount: number) {
    if (!this.tuning.shakeEnabled) return;
    this.kickVel.x += x * amount * 6 * this.tuning.shakeMul;
    this.kickVel.y += y * amount * 6 * this.tuning.shakeMul;
  }

  update(dt: number) {
    this.t += dt;
    this.trauma = Math.max(0, this.trauma - dt * 1.6);
    const s = this.trauma * this.trauma;
    const f = 28;
    this.rot.set(
      smoothNoise(this.t * f, 1) * 0.045 * s,
      smoothNoise(this.t * f, 2) * 0.045 * s,
      smoothNoise(this.t * f, 3) * 0.06 * s,
    );
    // mola do kick
    this.kickVel.addScaledVector(this.kick, -260 * dt);
    this.kickVel.multiplyScalar(Math.exp(-18 * dt));
    this.kick.addScaledVector(this.kickVel, dt);
    this.offset.set(
      smoothNoise(this.t * f, 4) * 0.05 * s + this.kick.x,
      smoothNoise(this.t * f, 5) * 0.05 * s + this.kick.y,
      0,
    );
    if (!this.tuning.shakeEnabled) {
      this.rot.set(0, 0, 0);
      this.offset.set(0, 0, 0);
    }
  }
}
