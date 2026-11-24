export interface AnimalTurnPose {
  look: number;
  step: number;
}

type TurnProfile = 'upright' | 'bird' | 'crawler' | 'quadruped' | 'swimmer';

export function animalTurnProfile(factory: string): TurnProfile {
  if (/Warden|Traveler|Gorilla|Chimpanzee|Orangutan|Baboon|Tamarin|Ostrich|Emu|Rhea|Flamingo|Penguin/i.test(factory)) return 'upright';
  if (/Chicken|Vulture|Crow|Parrot|Owl|Pigeon|Pelican|Kiwi|Eagle|Duck|Toucan/i.test(factory)) return 'bird';
  if (/Fish|Dolphin|Narwhal|Squid|Ray|Snake|Worm|Eel/i.test(factory)) return 'swimmer';
  if (/Maw|Plant|Crab|Spider|Insect|Beetle|Butterfly|Dragonfly|Moth|Bee|Wasp|PillBug|Scorpion/i.test(factory)) return 'crawler';
  return 'quadruped';
}

const ramp = (a: number, b: number, value: number) => {
  const t = Math.max(0, Math.min(1, (value - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Inverse warping of the sculpture, before shading and projection. */
export function bendAnimal<T>(
  evaluate: (x: number, y: number, z: number) => T,
  ex: number, ey: number, profile: TurnProfile, pose: AnimalTurnPose,
) {
  const upright = profile === 'upright';
  const bird = profile === 'bird';
  const swimmer = profile === 'swimmer';
  const crawler = profile === 'crawler';
  const neck = ex * (upright ? .035 : bird ? .19 : .14);
  const look = pose.look * (crawler ? .34 : .44);
  return (x: number, y: number, z: number): T => {
    const h = y / ey, front = z / ex;
    const head = upright ? ramp(.20, .43, h)
      : bird ? ramp(.12, .40, h)
      : (swimmer ? 1 : ramp(-.48, -.07, h)) * ramp(.05, .48, front);
    const feet = swimmer ? 0 : 1 - ramp(-.85, -.28, h);
    const shoulders = upright ? ramp(-.20, .29, h) : ramp(-.25, .18, front) * (1 - feet);
    const angle = look * (head * .82 + shoulders * .18) - feet * pose.step * .19;
    const side = x < 0 ? -1 : 1;
    const lift = feet * Math.max(0, side * pose.step) * ey * .10;
    if (angle === 0 && lift === 0) return evaluate(x, y, z);
    const c = Math.cos(angle), s = Math.sin(angle);
    const dz = z - neck;
    return evaluate(x * c - dz * s, y - lift, x * s + dz * c + neck);
  };
}

export function quantizeTurnPose(heading: number, phase: number): AnimalTurnPose | undefined {
  if (Math.abs(heading) < .13) return undefined;
  const look = Math.sign(heading) * (Math.abs(heading) > .44 ? 2 : 1);
  const step = Math.abs(heading) > .32 && Math.abs(Math.sin(phase)) > .38 ? Math.sign(Math.sin(phase)) : 0;
  return { look, step };
}

export function previewAnimalTurn(seconds: number, direction: number) {
  const elapsed = seconds % 3.6;
  const reverse = elapsed >= 1.8;
  const time = elapsed % 1.8;
  const body = ramp(.30, 1.14, time);
  const sign = reverse ? -direction : direction;
  const yaw = (reverse ? 1 - body : body) * direction * Math.PI / 2;
  const look = sign * .80 * ramp(.04, .23, time) * (1 - ramp(.68, 1.30, time));
  return { yaw, pose: quantizeTurnPose(look, body * Math.PI * 2) };
}
