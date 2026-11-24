/** Evita manter uma passada congelada quando a física interrompe o deslocamento. */
export class AnimalMotionAnimation {
  private stoppedFor = 0;
  useRestPose(locomotionPose: boolean, speed: number, grounded: boolean, alive: boolean, dt: number) {
    if (!locomotionPose || !grounded || !alive || speed >= .28) {
      this.stoppedFor = 0;
      return false;
    }
    this.stoppedFor += Math.max(0, dt);
    return this.stoppedFor >= .1;
  }
}
