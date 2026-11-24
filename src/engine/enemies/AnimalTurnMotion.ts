/** Virada visual com aceleração, freio e velocidade limitada, independente do FPS. */
export class AnimalTurnMotion {
  yaw = 0;
  velocity = 0;
  pivotPhase = 0;
  headYaw = 0;
  private initialized = false;
  readonly maxSpeed = Math.PI * 1.35;
  private readonly acceleration = Math.PI * 5;

  update(target: number, seconds: number) {
    if (!this.initialized) { this.yaw = target; this.initialized = true; }
    // Subpassos mantêm o mesmo arco de giro a 30, 60 ou 144 FPS.
    let remaining = Math.max(0, Math.min(seconds, .1));
    while (remaining > 0) {
      const dt = Math.min(remaining, 1 / 120);
      remaining -= dt;
      const delta = Math.atan2(Math.sin(target - this.yaw), Math.cos(target - this.yaw));
      const lookTarget = Math.max(-.82, Math.min(.82, delta));
      this.headYaw += (lookTarget - this.headYaw) * (1 - Math.exp(-17 * dt));
      const desired = Math.sign(delta) * Math.min(this.maxSpeed, Math.sqrt(2 * this.acceleration * Math.abs(delta)));
      this.velocity += Math.max(-this.acceleration * dt, Math.min(this.acceleration * dt, desired - this.velocity));
      let step = this.velocity * dt;
      if (Math.sign(step) === Math.sign(delta) && Math.abs(step) >= Math.abs(delta)) {
        step = delta; this.velocity = 0;
      }
      this.yaw += step;
      this.pivotPhase += Math.abs(step) * 4;
    }
    return this;
  }
}
