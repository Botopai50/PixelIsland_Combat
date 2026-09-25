import * as THREE from 'three';
import type { GameContext } from '../core/Context';
import type { Inventory } from './Inventory';
import type { ItemId } from './Items';
import { rand } from '../core/math';

interface Pickup {
  id: ItemId;
  count: number;
  mesh: THREE.Group;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  age: number;
  settled: boolean;
  spin: number;
  collecting: number;
}

function makePickupMesh(id: ItemId): THREE.Group {
  const g = new THREE.Group();
  const M = (c: number, r = 0.8) => new THREE.MeshStandardMaterial({ color: c, roughness: r, flatShading: true });
  if (id === 'wood') {
    const log = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.14, 0.6, 7), M(0x8a5a2b));
    log.rotation.z = Math.PI / 2;
    const cap1 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.02, 7), M(0xe0b57a));
    cap1.rotation.z = Math.PI / 2;
    cap1.position.x = 0.3;
    const cap2 = cap1.clone();
    cap2.position.x = -0.3;
    g.add(log, cap1, cap2);
  } else if (id === 'stone') {
    const geo = new THREE.IcosahedronGeometry(0.17, 0);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) pos.setXYZ(i, pos.getX(i) * rand(0.8, 1.2), pos.getY(i) * rand(0.7, 1), pos.getZ(i) * rand(0.8, 1.2));
    geo.computeVertexNormals();
    g.add(new THREE.Mesh(geo, M(0x8d8f99)));
  } else if (id === 'arrow') {
    for (let i = 0; i < 3; i++) {
      const s = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.6, 4), M(0xc9a46a));
      s.rotation.z = Math.PI / 2;
      s.position.set(0, i * 0.03, (i - 1) * 0.04);
      g.add(s);
    }
    const band = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.1, 0.16), M(0x7a2c2c));
    g.add(band);
  } else {
    g.add(new THREE.Mesh(new THREE.OctahedronGeometry(0.15), M(0xffd24a, 0.4)));
  }
  g.traverse((o) => ((o as THREE.Mesh).castShadow = true));
  // aura brilhante para ler de longe
  const glow = new THREE.Mesh(
    new THREE.RingGeometry(0.28, 0.36, 20),
    new THREE.MeshBasicMaterial({ color: 0xfff2b0, transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false }),
  );
  glow.rotation.x = -Math.PI / 2;
  glow.name = 'glow';
  g.add(glow);
  return g;
}

/**
 * Recursos no chão: "pulam" do objeto destruído com física simples, ficam
 * girando/flutuando, são atraídos pelo jogador (ímã) e entram no inventário
 * com som, brilho e atualização imediata da interface.
 */
export class PickupSystem {
  items: Pickup[] = [];
  magnetRadius = 2.6;
  collectRadius = 0.9;
  private tmp = new THREE.Vector3();

  constructor(private ctx: GameContext, private inventory: Inventory) {}

  spawn(id: ItemId, pos: THREE.Vector3, vel?: THREE.Vector3, count = 1) {
    const mesh = makePickupMesh(id);
    mesh.position.copy(pos);
    this.ctx.scene.add(mesh);
    this.items.push({
      id, count, mesh, pos: pos.clone(), vel: vel?.clone() ?? new THREE.Vector3(rand(-2, 2), rand(3, 5), rand(-2, 2)),
      age: 0, settled: false, spin: rand(-6, 6), collecting: 0,
    });
  }

  update(dt: number, playerPos: THREE.Vector3 | null) {
    if (dt <= 0) return;
    const phys = this.ctx.physics;
    for (let i = this.items.length - 1; i >= 0; i--) {
      const it = this.items[i];
      it.age += dt;
      if (it.collecting > 0) {
        // animação de coleta: encolhe voando até o jogador
        it.collecting += dt;
        const k = Math.min(1, it.collecting / 0.18);
        if (playerPos) it.mesh.position.lerp(this.tmp.copy(playerPos).setY(playerPos.y + 1), k);
        it.mesh.scale.setScalar(1 - k * 0.9);
        if (k >= 1) {
          it.mesh.removeFromParent();
          this.items.splice(i, 1);
        }
        continue;
      }
      if (!it.settled) {
        it.vel.y -= 18 * dt;
        it.pos.addScaledVector(it.vel, dt);
        const g = phys.groundHeight(it.pos.x, it.pos.z, it.pos.y + 0.3, 0.3, 0);
        const floor = (Number.isFinite(g.y) ? g.y : 0) + 0.2;
        if (it.pos.y < floor) {
          it.pos.y = floor;
          if (Math.abs(it.vel.y) > 1.5) {
            it.vel.y = -it.vel.y * 0.35;
            it.vel.x *= 0.6;
            it.vel.z *= 0.6;
          } else {
            it.settled = true;
            it.vel.set(0, 0, 0);
          }
        }
        it.mesh.position.copy(it.pos);
        it.mesh.rotation.y += it.spin * dt;
        it.mesh.rotation.x += it.spin * 0.5 * dt;
      } else {
        it.mesh.rotation.x = 0;
        it.mesh.rotation.y += dt * 1.6;
        it.mesh.position.set(it.pos.x, it.pos.y + 0.1 + Math.sin(it.age * 3) * 0.06, it.pos.z);
      }
      const glow = it.mesh.getObjectByName('glow');
      if (glow) {
        glow.rotation.set(-Math.PI / 2 - it.mesh.rotation.x, 0, 0);
        glow.position.y = -0.12 - Math.sin(it.age * 3) * 0.06;
        (glow as THREE.Mesh).scale.setScalar(1 + Math.sin(it.age * 4) * 0.1);
      }
      if (!playerPos || it.age < 0.45) continue;
      const d = this.tmp.set(playerPos.x - it.pos.x, playerPos.y + 0.6 - it.pos.y, playerPos.z - it.pos.z);
      const dist = d.length();
      if (dist < this.magnetRadius) {
        // ímã: puxa cada vez mais rápido
        const pull = (1 - dist / this.magnetRadius) * 10 + 2;
        it.pos.addScaledVector(d.normalize(), pull * dt);
        it.settled = true;
      }
      if (dist < this.collectRadius) {
        const got = this.inventory.add(it.id, it.count);
        if (got > 0) {
          it.collecting = 0.0001;
          this.ctx.events.emit('pickup', { item: it.id, count: got, pos: it.mesh.position.clone() });
        }
      }
    }
  }

  clear() {
    for (const it of this.items) it.mesh.removeFromParent();
    this.items = [];
  }
}
