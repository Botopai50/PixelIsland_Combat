const rates = new WeakMap<readonly unknown[], number>();

/** Ritmo apenas das poses: não acelera IA, deslocamento, gravidade ou janelas de dano. */
export function animalAnimationRate(frames: readonly unknown[]): number {
  const cached = rates.get(frames);
  if (cached !== undefined) return cached;
  const pose = String(frames[0] ?? '');
  let rate = 1.4;
  if (/^(idle|perch|rest|sit|stand|breathe)/i.test(pose)) rate = 2.5;
  else if (/^(walk|trot|crawl|waddle|scuttle|slither)/i.test(pose)) rate = 2.5;
  else if (/^(flap|fly|hover|glide)/i.test(pose)) rate = 1.2;
  else if (/^(attack|bite|snap|swipe|windup|charge|hurt|death|curl|leap|jump|land|breach|lunge|flop)/i.test(pose)) rate = 1;
  rates.set(frames, rate);
  return rate;
}

export function sampleAnimalCycle<T>(frames: readonly T[], phase: number): T {
  const frame = Math.floor(phase * animalAnimationRate(frames));
  return frames[((frame % frames.length) + frames.length) % frames.length];
}
