import * as THREE from 'three';
import type { GameContext } from '../core/Context';
import { Enemy, type EnemyTarget } from './Enemy';
import { rand } from '../core/math';

/**
 * Gerencia inimigos: spawn, "fichas" de ataque (só N atacam ao mesmo tempo,
 * como em jogos de ação), separação entre corpos e remoção após a morte.
 */
export class EnemyDirector {
  enemies: Enemy[] = [];
  maxAttackers = 1;
  private spawnCount = 0;
  onEnemyRemoved?: (e: Enemy) => void;

  constructor(private ctx: GameContext) {}

  spawn(at: THREE.Vector3, shielded?: boolean): Enemy {
    const pos = at.clone().add(new THREE.Vector3(rand(-1.2, 1.2), 0, rand(-1.2, 1.2)));
    const e = new Enemy(this.ctx, pos, { shielded: shielded ?? this.spawnCount % 2 === 1 });
    this.spawnCount++;
    this.enemies.push(e);
    this.ctx.combat.add(e);
    return e;
  }

  private requestToken = (e: Enemy) => {
    const n = this.enemies.filter((x) => x.hasToken && x.alive).length;
    const max = Math.max(1, Math.round(this.maxAttackers * Math.max(1, this.ctx.tuning.enemyAggression)));
    return e.hasToken || n < max;
  };

  update(dt: number, target: EnemyTarget | null) {
    if (dt <= 0) return;
    for (const e of this.enemies) e.update(dt, target, this.requestToken);
    // separação simples entre inimigos e do jogador
    const list = this.enemies;
    for (let i = 0; i < list.length; i++) {
      const a = list[i];
      if (!a.alive) continue;
      for (let j = i + 1; j < list.length; j++) {
        const b = list[j];
        if (!b.alive) continue;
        const dx = b.position.x - a.position.x, dz = b.position.z - a.position.z;
        const d = Math.hypot(dx, dz);
        const min = 0.9;
        if (d < min && d > 1e-4) {
          const push = (min - d) * 0.5;
          a.position.x -= (dx / d) * push;
          a.position.z -= (dz / d) * push;
          b.position.x += (dx / d) * push;
          b.position.z += (dz / d) * push;
        }
      }
      if (target && target.alive) {
        const dx = a.position.x - target.position.x, dz = a.position.z - target.position.z;
        const d = Math.hypot(dx, dz);
        const min = 0.8;
        if (d < min && d > 1e-4 && Math.abs(a.position.y - target.position.y) < 1.2) {
          a.position.x += (dx / d) * (min - d);
          a.position.z += (dz / d) * (min - d);
        }
      }
    }
    // remoção
    for (let i = list.length - 1; i >= 0; i--) {
      const e = list[i];
      if (!e.alive && e.deadT > 1.1 && !e.removed) {
        this.ctx.events.emit('enemyDeath', { pos: e.position.clone().setY(e.position.y + 0.6) });
        this.ctx.combat.remove(e);
        e.dispose();
        list.splice(i, 1);
        this.onEnemyRemoved?.(e);
      }
    }
  }

  clear() {
    for (const e of this.enemies) {
      this.ctx.combat.remove(e);
      e.dispose();
    }
    this.enemies = [];
  }
}
