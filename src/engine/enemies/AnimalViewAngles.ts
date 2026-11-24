/** Seleção por instância: a troca de pose não reinicia a estabilidade do ângulo. */
export class AnimalViewAngles {
  private yaw = 0;
  private tier = 4;
  private pole = 0;
  private initialized = false;
  private mirrored = false;
  private rendered?: { tier: number; direction: number; mirrored: boolean };
  private stepWait = 0;
  private readonly lastCamera = new Float64Array(6);
  private cameraInitialized = false;
  private pendingCameraView?: { tier: number; direction: number; mirrored: boolean };

  observeCamera(x: number, y: number, z: number, backX: number, backY: number, backZ: number) {
    const previous = this.lastCamera;
    const changed = this.cameraInitialized && (
      (x - previous[0]) ** 2 + (y - previous[1]) ** 2 + (z - previous[2]) ** 2 > 1e-6 ||
      (backX - previous[3]) ** 2 + (backY - previous[4]) ** 2 + (backZ - previous[5]) ** 2 > 1e-8
    );
    previous[0] = x; previous[1] = y; previous[2] = z;
    previous[3] = backX; previous[4] = backY; previous[5] = backZ;
    this.cameraInitialized = true;
    return changed;
  }

  get current() { return this.rendered; }
  /** Diferença entre o rumo visual solicitado e a vista que já está na tela. */
  get yawLag() {
    if (!this.rendered || this.pole) return 0;
    const displayed = this.rendered.direction * (this.rendered.mirrored ? 1 : -1) * Math.PI / 8;
    const target = this.yaw * Math.PI / 180;
    return Math.atan2(Math.sin(target - displayed), Math.cos(target - displayed));
  }

  /** Um setor por passo: mesmo se a IA mudar 180°, não saltar direto para as costas. */
  stepFrom(from: { tier: number; direction: number; mirrored: boolean }, to: { tier: number; direction: number; mirrored: boolean }) {
    const sector = (view: typeof from) => (view.direction * (view.mirrored ? 1 : -1) + 16) % 16;
    const start = sector(from), target = sector(to);
    const delta = ((target - start + 24) % 16) - 8;
    const next = (start + Math.sign(delta) + 16) % 16;
    return {
      tier: from.tier + Math.sign(to.tier - from.tier),
      direction: next <= 8 ? next : 16 - next,
      mirrored: next === 0 || next === 8 ? from.mirrored : next < 8,
    };
  }

  plan(wanted: { tier: number; direction: number; mirrored: boolean }, dt: number, cameraChanged = false) {
    this.stepWait = Math.max(0, this.stepWait - Math.max(0, dt));
    // Girar a câmera muda o ponto de vista; não é uma virada física do animal.
    if (cameraChanged || this.pendingCameraView) {
      this.pendingCameraView = { ...wanted };
      this.stepWait = 0;
      return wanted;
    }
    if (!this.rendered) return wanted;
    if (this.stepWait > 0 || dt <= 0) return this.rendered;
    return this.stepFrom(this.rendered, wanted);
  }

  commit(view: { tier: number; direction: number; mirrored: boolean }) {
    if (this.rendered && (view.tier !== this.rendered.tier || view.direction !== this.rendered.direction || view.mirrored !== this.rendered.mirrored)) {
      this.stepWait = .065;
    }
    this.rendered = { ...view };
    const pending = this.pendingCameraView;
    if (pending && pending.tier === view.tier && pending.direction === view.direction &&
        (view.direction === 0 || view.direction === 8 || pending.mirrored === view.mirrored)) {
      this.pendingCameraView = undefined;
    }
  }

  select(upDot: number, fwdDot: number, leftDot: number) {
    const yaw = Math.atan2(leftDot, fwdDot) * 180 / Math.PI;
    const pitch = Math.asin(Math.max(-1, Math.min(1, upDot))) * 180 / Math.PI;
    const delta = Math.atan2(Math.sin((yaw - this.yaw) * Math.PI / 180), Math.cos((yaw - this.yaw) * Math.PI / 180)) * 180 / Math.PI;
    // 4 graus de margem além da metade de cada setor; sem atraso para giros grandes.
    if (!this.initialized || Math.abs(delta) > 11.25 + 4) this.yaw = Math.round(yaw / 22.5) * 22.5;
    if (!this.initialized || Math.abs(pitch - (80 - this.tier * 20)) > 10 + 4) {
      this.tier = Math.max(0, Math.min(8, Math.round((80 - pitch) / 20)));
    }
    if (Math.abs(upDot) > 0.992) this.pole = Math.sign(upDot);
    else if (Math.abs(upDot) < 0.982 || Math.sign(upDot) !== this.pole) this.pole = 0;
    this.initialized = true;
    const direction = Math.min(8, Math.round(Math.abs(this.yaw) / 22.5));
    if (direction > 0 && direction < 8) this.mirrored = this.yaw > 0;
    return { tier: this.tier, direction, mirrored: this.mirrored, pole: this.pole };
  }
}
