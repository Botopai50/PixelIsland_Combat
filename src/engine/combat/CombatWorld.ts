import * as THREE from 'three';
import type { Damageable, Hurtbox, Team } from './types';
import { closestSegmentSegment } from '../core/math';

export interface SegmentHit {
  target: Damageable;
  hurtbox: Hurtbox;
  /** Ponto na superfície da cápsula alvo. */
  point: THREE.Vector3;
  /** Normal de saída da superfície. */
  normal: THREE.Vector3;
  /** Parâmetro 0..1 ao longo do segmento de consulta. */
  t: number;
}

const c1 = new THREE.Vector3(), c2 = new THREE.Vector3(), seg = new THREE.Vector3();

/**
 * Registro de alvos atingíveis + consultas geométricas.
 * O mesmo teste é usado por golpes corpo a corpo (segmento da lâmina),
 * flechas (segmento percorrido no frame) e ataques inimigos.
 */
export class CombatWorld {
  targets: Damageable[] = [];

  add(d: Damageable) {
    if (!this.targets.includes(d)) this.targets.push(d);
  }
  remove(d: Damageable) {
    const i = this.targets.indexOf(d);
    if (i >= 0) this.targets.splice(i, 1);
  }

  /**
   * Testa um segmento com raio contra todas as hurtboxes de times diferentes.
   * Retorna no máximo 1 contato por alvo (o hurtbox mais próximo do início).
   */
  querySegment(
    a: THREE.Vector3, b: THREE.Vector3, radius: number, team: Team, exclude?: Set<number>,
    filter?: (d: Damageable) => boolean,
  ): SegmentHit[] {
    const out: SegmentHit[] = [];
    seg.subVectors(b, a);
    const segLen2 = Math.max(1e-9, seg.lengthSq());
    for (const target of this.targets) {
      if (!target.alive || target.team === team) continue;
      if (exclude?.has(target.id)) continue;
      if (filter && !filter(target)) continue;
      let best: (SegmentHit & { score: number }) | null = null;
      for (const hb of target.hurtboxes) {
        if (hb.enabled === false) continue;
        const d2 = closestSegmentSegment(a, b, hb.a, hb.b, c1, c2);
        const r = radius + hb.radius;
        if (d2 > r * r) continue;
        const t = seg.dot(new THREE.Vector3().subVectors(c1, a)) / segLen2;
        const normal = new THREE.Vector3().subVectors(c1, c2);
        if (normal.lengthSq() < 1e-8) normal.copy(seg).negate();
        normal.normalize();
        const point = c2.clone().addScaledVector(normal, hb.radius);
        // escudo tem prioridade se estiver sendo tocado (bloqueia o corpo)
        const score = t + (hb.tag === 'shield' ? -10 : 0);
        if (!best || score < best.score) best = { target, hurtbox: hb, point, normal, t, score };
      }
      if (best) out.push(best);
    }
    out.sort((x, y) => x.t - y.t);
    return out;
  }

  /** Alvos travaveis dentro de um cone, ordenados por pontuação (distância + ângulo). */
  findLockTarget(from: THREE.Vector3, forward: THREE.Vector3, maxDist: number, maxAngleDeg: number, team: Team): Damageable | null {
    let best: Damageable | null = null;
    let bestScore = Infinity;
    const cos = Math.cos((maxAngleDeg * Math.PI) / 180);
    const p = new THREE.Vector3();
    for (const t of this.targets) {
      if (!t.alive || !t.lockable || t.team === team) continue;
      t.center(p).sub(from);
      p.y = 0;
      const d = p.length();
      if (d > maxDist || d < 0.01) continue;
      const c = p.divideScalar(d).dot(forward);
      if (c < cos) continue;
      const score = d * (2 - c);
      if (score < bestScore) {
        bestScore = score;
        best = t;
      }
    }
    return best;
  }
}
