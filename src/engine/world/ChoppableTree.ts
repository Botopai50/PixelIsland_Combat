import * as THREE from 'three';
import type { GameContext } from '../core/Context';
import { emptyResult, newId, toolEffectiveness, type Damageable, type HitInfo, type HitResult, type Hurtbox } from '../combat/types';
import { makeBoxCollider, type Collider } from '../physics/PhysicsWorld';
import type { PickupSystem } from '../items/Pickups';
import { Spring, clamp01, rand, pick } from '../core/math';

/**
 * Árvore que pode ser derrubada. Cada golpe: balança (mola), solta lascas e
 * folhas, aprofunda o entalhe no tronco. Ao zerar a vida, a parte de cima tomba
 * na direção do golpe com aceleração angular, bate no chão (poeira, tremor) e
 * vira toras coletáveis. O toco permanece. `reset()` restaura tudo.
 */
export class ChoppableTree implements Damageable {
  readonly id = newId();
  team = 'neutral' as const;
  alive = true;
  material = 'wood' as const;
  lockable = false;
  hurtboxes: Hurtbox[];
  readonly root = new THREE.Group();
  stickRoot: THREE.Object3D;
  maxHp = 80;
  hp = 80;
  private upper = new THREE.Group(); // pivota no entalhe
  private notch: THREE.Mesh;
  private stump: THREE.Mesh;
  private canopy = new THREE.Group();
  private swayX = new Spring(60, 3.5);
  private swayZ = new Spring(60, 3.5);
  private falling = false;
  private fallAngle = 0;
  private fallVel = 0;
  private fallAxis = new THREE.Vector3(1, 0, 0);
  private fallDir = new THREE.Vector3();
  private landed = false;
  private landedT = 0;
  private collider: Collider;
  private notchY = 0.95;
  private trunkR = 0.3;
  private hintShown = 0;
  private barT = 0;
  private bar: THREE.Mesh;
  private barFill: THREE.Mesh;

  constructor(private ctx: GameContext, private pickups: PickupSystem, public pos: THREE.Vector3) {
    this.root.position.copy(pos);
    const bark = new THREE.MeshStandardMaterial({ color: 0x7a5232, roughness: 0.95, flatShading: true });
    const inner = new THREE.MeshStandardMaterial({ color: 0xe8c48a, roughness: 0.9, flatShading: true });
    const R = this.trunkR;
    this.stump = new THREE.Mesh(new THREE.CylinderGeometry(R, R * 1.25, this.notchY - 0.1, 9), bark);
    this.stump.position.y = (this.notchY - 0.1) / 2;
    this.stump.castShadow = this.stump.receiveShadow = true;
    // raízes
    for (let i = 0; i < 5; i++) {
      const r = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.5, 4), bark);
      const a = (i / 5) * Math.PI * 2 + 0.3;
      r.position.set(Math.cos(a) * 0.32, 0.08, Math.sin(a) * 0.32);
      r.rotation.set(0, -a, Math.PI / 2 + 0.5);
      r.castShadow = true;
      this.root.add(r);
    }
    this.notch = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 0.2, 9), inner);
    this.notch.position.y = this.notchY;
    this.upper.position.y = this.notchY + 0.1;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.8, R, 3.2, 9), bark);
    trunk.position.y = 1.6;
    trunk.castShadow = true;
    this.upper.add(trunk);
    const leafMats = [0x4f9a3c, 0x5fae45, 0x3f8a33].map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.8, flatShading: true }));
    const blobs: [number, number, number, number][] = [[0, 3.6, 0, 1.4], [0.8, 3.1, 0.3, 1], [-0.7, 3.2, -0.3, 1.05], [0.2, 4.4, -0.2, 1], [-0.3, 3.0, 0.8, 0.9], [0.3, 3.2, -0.8, 0.9]];
    for (const [x, y, z, s] of blobs) {
      const b = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 0), pick(leafMats));
      b.position.set(x, y, z);
      b.rotation.set(rand(0, 3), rand(0, 3), 0);
      b.castShadow = true;
      this.canopy.add(b);
    }
    this.upper.add(this.canopy);
    this.root.add(this.stump, this.notch, this.upper);
    this.stickRoot = this.upper;

    // barra de progresso (anel acima do entalhe)
    this.bar = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.08), new THREE.MeshBasicMaterial({ color: 0x1a1016, depthTest: false, transparent: true, opacity: 0.8 }));
    this.barFill = new THREE.Mesh(new THREE.PlaneGeometry(0.86, 0.05), new THREE.MeshBasicMaterial({ color: 0xffc860, depthTest: false }));
    this.barFill.geometry.translate(0.43, 0, 0);
    this.barFill.position.set(-0.43, 0, 0.001);
    this.bar.add(this.barFill);
    this.bar.renderOrder = this.barFill.renderOrder = 20;
    this.bar.position.y = 2.2;
    this.bar.visible = false;
    this.root.add(this.bar);

    ctx.scene.add(this.root);
    this.hurtboxes = [{ a: new THREE.Vector3(pos.x, pos.y + 0.2, pos.z), b: new THREE.Vector3(pos.x, pos.y + 3.3, pos.z), radius: R + 0.02 }];
    this.collider = ctx.physics.add({ ...makeBoxCollider(pos.x, pos.z, R * 0.85, R * 0.85, pos.y, pos.y + 4, 0, 'wood'), mesh: trunk, owner: this });
    ctx.physics.add({ ...makeBoxCollider(pos.x, pos.z, R * 0.9, R * 0.9, pos.y, pos.y + this.notchY - 0.05, 0, 'wood'), mesh: this.stump, owner: this, blocksCamera: true });
    ctx.combat.add(this);
  }

  center(out: THREE.Vector3) {
    return out.copy(this.pos).setY(this.pos.y + 1.2);
  }

  receiveHit(hit: HitInfo): HitResult {
    const r = emptyResult('wood');
    if (!this.alive) {
      r.ignored = true;
      return r;
    }
    const eff = toolEffectiveness(hit.tool, 'wood');
    r.effectiveness = eff;
    // balança na direção do golpe (mesmo sem dano)
    const d = hit.dir.clone().setY(0).normalize();
    const imp = (0.35 + hit.strength * 0.9) * (0.4 + eff);
    this.swayX.impulse(d.z * imp);
    this.swayZ.impulse(-d.x * imp);
    this.ctx.fx.impact('leaf', new THREE.Vector3(this.pos.x + rand(-1, 1), this.pos.y + 3.2, this.pos.z + rand(-1, 1)), new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, -1, 0), 0.4);
    if (hit.projectile) return r;
    if (eff <= 0.01) {
      if (this.hintShown++ % 3 === 0) this.ctx.events.emit('toast', { text: 'Use o MACHADO para derrubar a árvore', kind: 'warn' });
      return r;
    }
    if (eff < 0.5 && this.hintShown++ % 4 === 0) this.ctx.events.emit('toast', { text: 'Pouco eficaz — o machado corta muito melhor', kind: 'info' });
    const dmg = hit.damage * eff * (hit.charged ? 1.3 : 1);
    r.damage = Math.round(dmg);
    this.hp -= dmg;
    this.barT = 3;
    this.updateNotch();
    if (this.hp <= 0) {
      r.killed = true;
      this.fell(d);
    }
    return r;
  }

  private updateNotch() {
    const f = clamp01(1 - this.hp / this.maxHp);
    // o entalhe afina: fica visível que cada golpe progride
    this.notch.scale.set(1 - f * 0.62, 1 + f * 0.3, 1 - f * 0.62);
    (this.barFill as THREE.Mesh).scale.x = Math.max(0.001, this.hp / this.maxHp);
  }

  private fell(dir: THREE.Vector3) {
    this.alive = false;
    this.falling = true;
    this.fallDir.copy(dir);
    // eixo de queda: perpendicular à direção do golpe
    this.fallAxis.set(dir.z, 0, -dir.x).normalize();
    this.fallVel = 0.25;
    this.hurtboxes[0].enabled = false;
    this.collider.enabled = false;
    this.ctx.physics.markDirty();
    this.bar.visible = false;
    this.ctx.events.emit('treeFell', { pos: this.pos.clone().setY(this.pos.y + 1), dir: dir.clone() });
  }

  update(dt: number, camera: THREE.Camera) {
    if (dt <= 0) return;
    if (!this.falling) {
      this.swayX.update(dt);
      this.swayZ.update(dt);
      this.upper.rotation.set(this.swayX.value * 0.12, 0, this.swayZ.value * 0.12);
      this.canopy.rotation.set(this.swayX.value * 0.08, 0, this.swayZ.value * 0.08);
    } else if (!this.landed) {
      // queda com aceleração (torque da gravidade cresce com o ângulo)
      this.fallVel += (1.2 + Math.sin(this.fallAngle) * 5.5) * dt;
      this.fallAngle += this.fallVel * dt;
      if (this.fallAngle >= Math.PI / 2 - 0.08) {
        this.fallAngle = Math.PI / 2 - 0.08;
        this.fallVel *= -0.18; // quique
        if (Math.abs(this.fallVel) < 0.12 || this.landedT > 0) {
          this.landed = true;
        }
        if (this.landedT === 0) {
          this.landedT = 0.0001;
          const tip = this.pos.clone().addScaledVector(this.fallDir, 2.5);
          this.ctx.events.emit('treeLanded', { pos: tip, dir: this.fallDir.clone() });
          for (let i = 0; i < 4; i++) this.ctx.fx.dust(this.pos.clone().addScaledVector(this.fallDir, 1 + i * 0.9), 1.2, 0.6);
          for (let i = 0; i < 3; i++) this.ctx.fx.impact('leaf', this.pos.clone().addScaledVector(this.fallDir, 3.2 + i * 0.4).setY(this.pos.y + 1), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 1, 0), 1.2);
        }
      }
      this.upper.quaternion.setFromAxisAngle(this.fallAxis, this.fallAngle);
    }
    if (this.landedT > 0) {
      this.landedT += dt;
      if (this.landedT > 1.1 && this.upper.visible) {
        // vira toras
        this.upper.visible = false;
        for (let i = 0; i < 3; i++) {
          const p = this.pos.clone().addScaledVector(this.fallDir, 1.2 + i * 1.1).setY(this.pos.y + 0.4);
          this.pickups.spawn('wood', p, new THREE.Vector3(rand(-1, 1), rand(3, 4.5), rand(-1, 1)));
          this.ctx.fx.poof(p, 0x6aa84f, 0.5);
        }
        this.ctx.sound.play('rockBreak', { pos: this.pos, pitch: 0.7, vol: 0.5 });
        // flechas presas somem junto
        for (const c of [...this.upper.children]) if (c.type === 'Group' && c !== this.canopy) c.removeFromParent();
      }
    }
    this.barT -= dt;
    this.bar.visible = this.alive && this.barT > 0 && this.hp < this.maxHp;
    if (this.bar.visible) this.bar.quaternion.copy(camera.quaternion);
  }

  reset() {
    this.hp = this.maxHp;
    this.alive = true;
    this.falling = this.landed = false;
    this.fallAngle = this.fallVel = 0;
    this.landedT = 0;
    this.upper.visible = true;
    this.upper.quaternion.identity();
    this.hurtboxes[0].enabled = true;
    this.collider.enabled = true;
    this.ctx.physics.markDirty();
    this.swayX.reset();
    this.swayZ.reset();
    this.updateNotch();
    for (const c of [...this.upper.children]) if (c.type === 'Group' && c !== this.canopy) c.removeFromParent();
  }
}
