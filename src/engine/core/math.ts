import * as THREE from 'three';

export const TAU = Math.PI * 2;
export const DEG = Math.PI / 180;

export const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
export const clamp01 = (v: number) => clamp(v, 0, 1);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const invLerp = (a: number, b: number, v: number) => (b === a ? 0 : (v - a) / (b - a));
export const rand = (a = 0, b = 1) => a + Math.random() * (b - a);
export const randSign = () => (Math.random() < 0.5 ? -1 : 1);
export const pick = <T>(arr: readonly T[]): T => arr[(Math.random() * arr.length) | 0];

/** Suavização exponencial independente de framerate (lambda ~ "velocidade"). */
export const damp = (a: number, b: number, lambda: number, dt: number) =>
  lerp(a, b, 1 - Math.exp(-lambda * dt));

export function wrapAngle(a: number): number {
  a = (a + Math.PI) % TAU;
  if (a < 0) a += TAU;
  return a - Math.PI;
}

export const angleDelta = (from: number, to: number) => wrapAngle(to - from);

export function dampAngle(a: number, b: number, lambda: number, dt: number): number {
  return a + angleDelta(a, b) * (1 - Math.exp(-lambda * dt));
}

/** Move `current` em direção a `target` no máximo `maxDelta`. */
export function approach(current: number, target: number, maxDelta: number): number {
  if (current < target) return Math.min(current + maxDelta, target);
  return Math.max(current - maxDelta, target);
}

export function dampVec3(v: THREE.Vector3, target: THREE.Vector3, lambda: number, dt: number) {
  const t = 1 - Math.exp(-lambda * dt);
  v.x += (target.x - v.x) * t;
  v.y += (target.y - v.y) * t;
  v.z += (target.z - v.z) * t;
  return v;
}

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
export const easeInCubic = (t: number) => Math.pow(clamp01(t), 3);
export const easeInOutSine = (t: number) => -(Math.cos(Math.PI * clamp01(t)) - 1) / 2;
export const easeOutBack = (t: number, s = 1.70158) => {
  t = clamp01(t) - 1;
  return t * t * ((s + 1) * t + s) + 1;
};
export const easeInQuad = (t: number) => clamp01(t) ** 2;
export const easeOutQuad = (t: number) => 1 - (1 - clamp01(t)) ** 2;
/** Curva de golpe: acelera forte no meio (sensação de peso). */
export const easeSwing = (t: number) => {
  t = clamp01(t);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

/** Mola amortecida 1D (para balanços: árvore, boneco, recuo de arma). */
export class Spring {
  value = 0;
  velocity = 0;
  constructor(public stiffness = 120, public damping = 10, public target = 0) {}
  impulse(v: number) {
    this.velocity += v;
  }
  update(dt: number) {
    const f = -this.stiffness * (this.value - this.target) - this.damping * this.velocity;
    this.velocity += f * dt;
    this.value += this.velocity * dt;
    return this.value;
  }
  reset() {
    this.value = this.velocity = 0;
  }
}

/** Mola 3D (Vector3). */
export class Spring3 {
  value = new THREE.Vector3();
  velocity = new THREE.Vector3();
  private tmp = new THREE.Vector3();
  constructor(public stiffness = 150, public damping = 12) {}
  impulse(v: THREE.Vector3, scale = 1) {
    this.velocity.addScaledVector(v, scale);
  }
  update(dt: number) {
    this.tmp.copy(this.value).multiplyScalar(-this.stiffness).addScaledVector(this.velocity, -this.damping);
    this.velocity.addScaledVector(this.tmp, dt);
    this.value.addScaledVector(this.velocity, dt);
    return this.value;
  }
  reset() {
    this.value.set(0, 0, 0);
    this.velocity.set(0, 0, 0);
  }
}

/** Ruído suave barato (soma de senos) para tremores. */
export function smoothNoise(t: number, seed: number): number {
  return (
    Math.sin(t * 1.0 + seed * 12.9898) * 0.5 +
    Math.sin(t * 2.3 + seed * 78.233) * 0.3 +
    Math.sin(t * 4.7 + seed * 37.719) * 0.2
  );
}

const _v = new THREE.Vector3();
/** Ponto mais próximo em um segmento AB a partir de P. Retorna parâmetro t. */
export function closestPointOnSegment(p: THREE.Vector3, a: THREE.Vector3, b: THREE.Vector3, out: THREE.Vector3): number {
  _v.subVectors(b, a);
  const len2 = _v.lengthSq();
  let t = len2 > 1e-9 ? _v.dot(out.subVectors(p, a)) / len2 : 0;
  t = clamp01(t);
  out.copy(a).addScaledVector(_v, t);
  return t;
}

const d1 = new THREE.Vector3(), d2 = new THREE.Vector3(), r = new THREE.Vector3();
/** Pontos mais próximos entre dois segmentos (p1-q1, p2-q2). Retorna distância ao quadrado. */
export function closestSegmentSegment(
  p1: THREE.Vector3, q1: THREE.Vector3, p2: THREE.Vector3, q2: THREE.Vector3,
  c1: THREE.Vector3, c2: THREE.Vector3,
): number {
  d1.subVectors(q1, p1);
  d2.subVectors(q2, p2);
  r.subVectors(p1, p2);
  const a = d1.dot(d1), e = d2.dot(d2), f = d2.dot(r);
  let s: number, t: number;
  if (a <= 1e-9 && e <= 1e-9) {
    c1.copy(p1); c2.copy(p2);
    return c1.distanceToSquared(c2);
  }
  if (a <= 1e-9) {
    s = 0; t = clamp01(f / e);
  } else {
    const c = d1.dot(r);
    if (e <= 1e-9) {
      t = 0; s = clamp01(-c / a);
    } else {
      const b = d1.dot(d2);
      const denom = a * e - b * b;
      s = denom !== 0 ? clamp01((b * f - c * e) / denom) : 0;
      t = (b * s + f) / e;
      if (t < 0) { t = 0; s = clamp01(-c / a); }
      else if (t > 1) { t = 1; s = clamp01((b - c) / a); }
    }
  }
  c1.copy(p1).addScaledVector(d1, s);
  c2.copy(p2).addScaledVector(d2, t);
  return c1.distanceToSquared(c2);
}

/** Direção horizontal (XZ) a partir de um yaw (0 = +Z). */
export function yawToDir(yaw: number, out = new THREE.Vector3()) {
  return out.set(Math.sin(yaw), 0, Math.cos(yaw));
}
export function dirToYaw(x: number, z: number) {
  return Math.atan2(x, z);
}
