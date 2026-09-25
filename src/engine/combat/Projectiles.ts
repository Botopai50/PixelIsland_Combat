import * as THREE from 'three';
import type { GameContext } from '../core/Context';
import type { Damageable, HitInfo, Team } from './types';
import { createArrowMesh } from '../items/WeaponModels';

interface Arrow {
  mesh: THREE.Group;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  team: Team;
  attacker: unknown;
  damage: number;
  power: number;
  flying: boolean;
  life: number;
  stuckIn: Damageable | null;
  collectable: boolean;
  wobble: number;
  wobbleAxis: THREE.Vector3;
  baseQuat: THREE.Quaternion;
}

const FWD = new THREE.Vector3(0, 0, 1);

/**
 * Flechas com trajetória balística, colisão contínua (segmento por frame) com
 * o cenário e com hurtboxes, e que ficam cravadas por um tempo limitado
 * (presas ao objeto atingido, acompanhando seu movimento).
 */
export class ProjectileSystem {
  arrows: Arrow[] = [];
  gravity = 9;
  stuckLifetime = 12;
  private tmpA = new THREE.Vector3();
  private tmpB = new THREE.Vector3();
  private dir = new THREE.Vector3();
  private q = new THREE.Quaternion();

  constructor(private ctx: GameContext) {}

  fire(origin: THREE.Vector3, velocity: THREE.Vector3, team: Team, attacker: unknown, damage: number, power: number) {
    const mesh = createArrowMesh();
    mesh.position.copy(origin);
    this.ctx.scene.add(mesh);
    const a: Arrow = {
      mesh, pos: origin.clone(), vel: velocity.clone(), team, attacker, damage, power,
      flying: true, life: 6, stuckIn: null, collectable: false, wobble: 0, wobbleAxis: new THREE.Vector3(1, 0, 0), baseQuat: new THREE.Quaternion(),
    };
    this.orient(a);
    this.arrows.push(a);
  }

  private orient(a: Arrow) {
    this.dir.copy(a.vel).normalize();
    a.mesh.quaternion.setFromUnitVectors(FWD, this.dir);
  }

  private stick(a: Arrow, point: THREE.Vector3, parent: THREE.Object3D, into: Damageable | null) {
    a.flying = false;
    a.life = this.stuckLifetime;
    a.stuckIn = into;
    a.collectable = !into;
    this.dir.copy(a.vel).normalize();
    // crava alguns centímetros na superfície
    a.mesh.position.copy(point).addScaledVector(this.dir, 0.1);
    a.mesh.quaternion.setFromUnitVectors(FWD, this.dir);
    parent.updateWorldMatrix(true, false);
    parent.attach(a.mesh);
    a.baseQuat.copy(a.mesh.quaternion);
    a.wobble = 0.35;
    a.wobbleAxis.set(Math.random() - 0.5, Math.random() - 0.5, 0).normalize();
  }

  update(dt: number) {
    if (dt <= 0) return;
    const ctx = this.ctx;
    for (let i = this.arrows.length - 1; i >= 0; i--) {
      const a = this.arrows[i];
      a.life -= dt;
      if (a.flying) {
        const p0 = this.tmpA.copy(a.pos);
        a.vel.y -= this.gravity * dt;
        const p1 = this.tmpB.copy(a.pos).addScaledVector(a.vel, dt);
        const segLen = p0.distanceTo(p1);
        // 1) alvos
        const hits = ctx.combat.querySegment(p0, p1, 0.04, a.team);
        // 2) cenário
        this.dir.subVectors(p1, p0).normalize();
        const wall = ctx.physics.raycast(p0, this.dir, segLen + 0.05);
        const targetHit = hits[0];
        const targetDist = targetHit ? targetHit.t * segLen : Infinity;
        if (targetHit && targetDist <= (wall?.distance ?? Infinity)) {
          const hit: HitInfo = {
            attacker: a.attacker, team: a.team, tool: 'arrow', damage: a.damage, strength: 0.25 + a.power * 0.35,
            knockback: 1 + a.power * 2.5, point: targetHit.point.clone(), dir: this.dir.clone(), normal: targetHit.normal.clone(),
            hurtbox: targetHit.hurtbox, projectile: true, charged: a.power > 0.95, origin: p0.clone(),
          };
          const result = targetHit.target.receiveHit(hit);
          ctx.events.emit('hit', { hit, result, target: targetHit.target, source: a.team === 'player' ? 'player' : 'enemy' });
          if (result.ignored) {
            // atravessou (ex.: esquiva) — continua voando
          } else if (result.deflected) {
            // ricochete: cai girando
            a.vel.reflect(targetHit.normal).multiplyScalar(0.25);
            a.vel.y = 2;
            a.flying = false;
            a.life = 1.2;
            ctx.scene.attach(a.mesh);
            a.pos.copy(targetHit.point);
            a.collectable = false;
            (a as any).falling = true;
          } else if (result.killed || !targetHit.target.alive) {
            this.remove(i);
            continue;
          } else {
            this.stick(a, targetHit.point, targetHit.target.stickRoot, targetHit.target);
          }
          continue;
        }
        if (wall) {
          this.stick(a, wall.point, (wall.collider?.owner as Damageable | undefined)?.stickRoot ?? ctx.scene, (wall.collider?.owner as Damageable) ?? null);
          const matName = wall.material === 'wood' ? 'wood' : wall.material === 'metal' ? 'metal' : 'stone';
          ctx.sound.play('arrowHit', { pos: wall.point, variant: matName });
          const n = wall.normal;
          ctx.fx.impact(matName === 'wood' ? 'wood' : matName === 'metal' ? 'metal' : 'stone', wall.point, this.dir, n, 0.3, wall.point.y - 2);
          continue;
        }
        a.pos.copy(p1);
        a.mesh.position.copy(p1);
        this.orient(a);
        if (a.life <= 0 || a.pos.y < -10) this.remove(i);
      } else {
        if ((a as any).falling) {
          a.vel.y -= this.gravity * 2 * dt;
          a.pos.addScaledVector(a.vel, dt);
          a.mesh.position.copy(a.pos);
          a.mesh.rotateX(dt * 14);
        }
        // vibração ao cravar
        if (a.wobble > 0) {
          a.wobble = Math.max(0, a.wobble - dt * 0.9);
          const ang = Math.sin(a.wobble * 70) * a.wobble * 0.25;
          this.q.setFromAxisAngle(a.wobbleAxis, ang);
          a.mesh.quaternion.copy(a.baseQuat).multiply(this.q);
        }
        if (a.stuckIn && !a.stuckIn.alive) a.life = Math.min(a.life, 0.4);
        if (a.life < 0.5) a.mesh.scale.setScalar(Math.max(0.001, a.life / 0.5));
        if (a.life <= 0) this.remove(i);
      }
    }
  }

  /** Recolhe flechas cravadas no cenário perto de `pos`. */
  collectNear(pos: THREE.Vector3, radius: number): number {
    let n = 0;
    const w = new THREE.Vector3();
    for (let i = this.arrows.length - 1; i >= 0; i--) {
      const a = this.arrows[i];
      if (!a.collectable || a.flying || a.life < 1) continue;
      a.mesh.getWorldPosition(w);
      const dx = w.x - pos.x, dz = w.z - pos.z;
      if (dx * dx + dz * dz < radius * radius && Math.abs(w.y - pos.y - 0.5) < 1.6) {
        this.remove(i);
        n++;
      }
    }
    return n;
  }

  private remove(i: number) {
    const a = this.arrows[i];
    a.mesh.removeFromParent();
    this.arrows.splice(i, 1);
  }

  clear() {
    for (let i = this.arrows.length - 1; i >= 0; i--) this.remove(i);
  }
}
