/** Integer screen pixels with a small deadband to prevent boundary chatter.
 * No temporal smoothing: intentional movement and camera cuts update immediately.
 */
export class StablePixelValue {
  private value = NaN;

  sample(input: number): number {
    if (!Number.isFinite(this.value) || Math.abs(input - this.value) > 0.68) {
      this.value = Math.round(input);
    }
    return this.value;
  }
}
