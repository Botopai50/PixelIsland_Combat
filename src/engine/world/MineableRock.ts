import * as THREE from 'three';
import type { GameContext } from '../core/Context';
import { emptyResult, newId, toolEffectiveness, type Damageable, type HitInfo, type HitResult, type Hurtbox } from '../combat/types';
import { makeBoxCollider, type Collider } from '../physics/PhysicsWorld';
import type { PickupSystem } from '../items/Pickups';
import { Spring, clamp01, rand } from '../core/math';

/**
 * Rocha mineável. Cada golpe de picareta abre uma rachadura NO PONTO DE CONTATO
 * (linhas escuras que se ramificam), o bloco "pulsa" e escurece; a partir de
 * certos limiares aparecem rachaduras maiores. Ao quebrar: fragmentos, poeira,
 * pedras coletáveis. Ferramentas erradas ricocheteiam com faíscas.
 */
export class MineableRock implements Damageable {
  readonly id = newId();
  team = 'neutral' as const;
  alive = true;
  material = 'stone' as const;
  lockable = false;
  hurtboxes: Hurtbox[];
  readonly root = new THREE.Group();
  stickRoot: THREE.Object3D;
  maxHp = 70;
  hp = 70;
  private rock: THREE.Mesh;
  private rockMat: THREE.MeshStandardMaterial;
  private cracks = new THREE.Group();
  private crackMat = new THREE.MeshBasicMaterial({ color: 0x1b1a20 });
  private glowMat = new THREE.MeshBasicMaterial({ color: 0xffb070, transparent: true, opacity: 0 });
  private pulse = new Spring(300, 14);
  private collider: Collider;
  private stage = 0;
  private hint = 0;
  private radius = 1.05;

  constructor(private ctx: GameContext, private pickups: PickupSystem, public pos: THREE.Vector3) {
    this.root.position.copy(pos);
    const geo = new THREE.IcosahedronGeometry(this.radius, 1);
    const p = geo.attributes.position as THREE.BufferAttribute;
    // deformação determinística (mesma rocha a cada reset)
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const n = 1 + Math.sin(v.x * 5.1 + v.z * 3.3) * 0.08 + Math.cos(v.y * 4.7 + v.x * 2.1) * 0.07;
      v.multiplyScalar(n);
      v.y *= 0.78;
      p.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    this.rockMat = new THREE.MeshStandardMaterial({ color: 0x8d8f99, roughness: 0.95, flatShading: true });
    this.rock = new THREE.Mesh(geo, this.rockMat);
    this.rock.position.y = 0.62;
    this.rock.castShadow = this.rock.receiveShadow = true;
    // veios de minério
    const ore = new THREE.MeshStandardMaterial({ color: 0xd8c27a, roughness: 0.4, metalness: 0.5, flatShading: true });
    for (let i = 0; i < 5; i++) {
      const o = new THREE.Mesh(new THREE.OctahedronGeometry(0.1), ore);
      const a = i * 1.3;
      o.position.set(Math.cos(a) * 0.85, 0.2 + (i % 3) * 0.2, Math.sin(a) * 0.85);
      this.rock.add(o);
    }
    this.rock.add(this.cracks);
    this.root.add(this.rock);
    this.stickRoot = this.rock;
    ctx.scene.add(this.root);
    this.hurtboxes = [{ a: new THREE.Vector3(pos.x, pos.y + 0.55, pos.z), b: new THREE.Vector3(pos.x, pos.y + 0.75, pos.z), radius: 0.92 }];
    this.collider = ctx.physics.add({ ...makeBoxCollider(pos.x, pos.z, 0.78, 0.78, pos.y, pos.y + 1.15, 0.3, 'stone'), mesh: this.rock, owner: this });
    ctx.combat.add(this);
  }

  center(out: THREE.Vector3) {
    return out.copy(this.pos).setY(this.pos.y + 0.7);
  }

  /** Rachadura ramificada no ponto (espaço local da rocha), orientada pela normal. */
  private addCrack(worldPoint: THREE.Vector3, worldNormal: THREE.Vector3, size: number) {
    const local = this.rock.worldToLocal(worldPoint.clone());
    const n = worldNormal.clone().normalize();
    const g = new THREE.Group();
    g.position.copy(local).addScaledVector(n, 0.02);
    g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
    const branches = 3 + Math.floor(size * 3);
    for (let i = 0; i < branches; i++) {
      const len = rand(0.15, 0.35) * (0.6 + size);
      const a = (i / branches) * Math.PI * 2 + rand(-0.4, 0.4);
      const seg = new THREE.Mesh(new THREE.BoxGeometry(len, 0.03 + size * 0.02, 0.02), this.crackMat);
      seg.position.set(Math.cos(a) * len * 0.5, Math.sin(a) * len * 0.5, 0);
      seg.rotation.z = a;
      g.add(seg);
      // sub-ramo
      if (size > 0.4) {
        const l2 = len * 0.5;
        const b = a + rand(-0.8, 0.8);
        const s2 = new THREE.Mesh(new THREE.BoxGeometry(l2, 0.02, 0.02), this.crackMat);
        s2.position.set(Math.cos(a) * len + Math.cos(b) * l2 * 0.5, Math.sin(a) * len + Math.sin(b) * l2 * 0.5, 0);
        s2.rotation.z = b;
        g.add(s2);
      }
    }
    // brilho quente no centro da rachadura (some aos poucos)
    const glow = new THREE.Mesh(new THREE.CircleGeometry(0.06 + size * 0.05, 6), this.glowMat);
    g.add(glow);
    this.cracks.add(g);
  }

  receiveHit(hit: HitInfo): HitResult {
    const r = emptyResult('stone');
    if (!this.alive) {
      r.ignored = true;
      return r;
    }
    const eff = toolEffectiveness(hit.tool, 'stone');
    r.effectiveness = eff;
    this.pulse.impulse(2 + hit.strength * 4);
    if (hit.projectile) return r;
    if (eff <= 0.01) {
      r.deflected = true; // espada ricocheteia na pedra
      if (this.hint++ % 2 === 0) this.ctx.events.emit('toast', { text: 'Use a PICARETA para quebrar a pedra', kind: 'warn' });
      return r;
    }
    if (eff < 0.5 && this.hint++ % 3 === 0) this.ctx.events.emit('toast', { text: 'Pouco eficaz — a picareta quebra muito melhor', kind: 'info' });
    const dmg = hit.damage * eff * (hit.charged ? 1.3 : 1);
    r.damage = Math.round(dmg);
    this.hp -= dmg;
    const f = clamp01(1 - this.hp / this.maxHp);
    this.addCrack(hit.point, hit.normal, f);
    this.glowMat.opacity = 0.9;
    // escurece e ganha rachaduras "estruturais" em limiares
    this.rockMat.color.setHex(0x8d8f99).lerp(new THREE.Color(0x55565e), f * 0.7);
    const stage = Math.floor(f * 3);
    if (stage > this.stage && this.hp > 0) {
      this.stage = stage;
      const dirs = [new THREE.Vector3(1, 0.3, 0), new THREE.Vector3(-0.6, 0.5, 0.7), new THREE.Vector3(0.1, 0.9, -0.5)];
      const dn = dirs[(stage - 1) % dirs.length].normalize();
      const wp = this.rock.localToWorld(dn.clone().multiplyScalar(this.radius * 0.85));
      this.addCrack(wp, dn, 1);
      this.ctx.events.emit('rockCrack', { pos: wp, stage });
    }
    if (this.hp <= 0) {
      r.killed = true;
      this.shatter(hit);
    }
    return r;
  }

  private shatter(hit: HitInfo) {
    this.alive = false;
    this.rock.visible = false;
    this.collider.enabled = false;
    this.ctx.physics.markDirty();
    this.hurtboxes[0].enabled = false;
    const c = this.pos.clone().setY(this.pos.y + 0.6);
    // fragmentos grandes (usa camada de partículas sólidas, com quique no chão)
    const P = this.ctx.fx.particles;
    if (this.ctx.tuning.particlesEnabled) {
      for (let i = 0; i < Math.round(26 * this.ctx.tuning.particleMul); i++) {
        const d = new THREE.Vector3(rand(-1, 1), rand(0.3, 1.2), rand(-1, 1)).normalize().addScaledVector(hit.dir, 0.4);
        P.spawn('solid', {
          pos: c.clone().addScaledVector(d, rand(0.2, 0.6)), vel: d.multiplyScalar(rand(3, 8)),
          color: [0x8d8f99, 0x6f717b, 0x55565e, 0xa6a8b2][i % 4], size: rand(0.14, 0.34), life: rand(1.4, 2.4),
          gravity: 20, drag: 0.3, floorY: this.pos.y + 0.05, spin: 8, endScale: 0.5, bounce: 0.35,
        });
      }
      this.ctx.fx.dust(this.pos.clone().setY(this.pos.y + 0.1), 2, 1.2, 0xb8b2a6);
      this.ctx.fx.dust(this.pos.clone().setY(this.pos.y + 0.6), 1.5, 0.8, 0xc9c3b8);
    }
    for (let i = 0; i < 3; i++) {
      this.pickups.spawn('stone', c.clone(), new THREE.Vector3(rand(-2.5, 2.5), rand(4, 6), rand(-2.5, 2.5)));
    }
    // flechas presas caem
    for (const ch of [...this.rock.children]) if (ch.type === 'Group' && ch !== this.cracks) ch.removeFromParent();
    this.ctx.events.emit('rockBroke', { pos: c });
  }

  update(dt: number) {
    if (dt <= 0) return;
    this.pulse.update(dt);
    const s = 1 + this.pulse.value * 0.025;
    this.rock.scale.set(s, 1 - this.pulse.value * 0.02, s);
    this.glowMat.opacity = Math.max(0, this.glowMat.opacity - dt * 1.5);
  }

  reset() {
    this.hp = this.maxHp;
    this.alive = true;
    this.stage = 0;
    this.rock.visible = true;
    this.collider.enabled = true;
    this.ctx.physics.markDirty();
    this.hurtboxes[0].enabled = true;
    this.rockMat.color.setHex(0x8d8f99);
    this.cracks.clear();
    for (const ch of [...this.rock.children]) if (ch.type === 'Group' && ch !== this.cracks) ch.removeFromParent();
  }
}
