import * as THREE from 'three';
import { clamp } from '../core/math';

export type SurfaceMaterial = 'grass' | 'stone' | 'wood' | 'metal' | 'flesh';

/**
 * Colisor estático simples: caixa orientada no eixo Y ("box") ou rampa ("ramp").
 * A rampa sobe de `minY` (lado -Z local) até `maxY` (lado +Z local).
 * É proposital ser simples: suficiente para personagens em arenas e barato
 * de reaproveitar. Para mundos grandes, troque por Rapier/Cannon mantendo a
 * mesma interface (groundHeight / resolveCylinder / raycast).
 */
export interface Collider {
  kind: 'box' | 'ramp';
  x: number;
  z: number;
  yaw: number;
  halfX: number;
  halfZ: number;
  minY: number;
  maxY: number;
  material: SurfaceMaterial;
  /** Malha usada para raycasts (câmera, flechas). */
  mesh?: THREE.Object3D;
  /** Objeto "dono" (ex.: árvore) — flechas se prendem a ele. */
  owner?: unknown;
  enabled: boolean;
  blocksCamera: boolean;
}

export interface RayHit {
  point: THREE.Vector3;
  normal: THREE.Vector3;
  distance: number;
  object: THREE.Object3D;
  collider?: Collider;
  material: SurfaceMaterial;
}

export function makeBoxCollider(
  x: number, z: number, halfX: number, halfZ: number, minY: number, maxY: number,
  yaw = 0, material: SurfaceMaterial = 'stone',
): Collider {
  return { kind: 'box', x, z, yaw, halfX, halfZ, minY, maxY, material, enabled: true, blocksCamera: true };
}

export class PhysicsWorld {
  colliders: Collider[] = [];
  private raycaster = new THREE.Raycaster();
  private meshCache: THREE.Object3D[] = [];
  private dirty = true;

  add(c: Collider) {
    this.colliders.push(c);
    if (c.mesh) c.mesh.userData.collider = c;
    this.dirty = true;
    return c;
  }
  remove(c: Collider) {
    const i = this.colliders.indexOf(c);
    if (i >= 0) this.colliders.splice(i, 1);
    this.dirty = true;
  }
  markDirty() {
    this.dirty = true;
  }

  private local(c: Collider, x: number, z: number, out: { x: number; z: number }) {
    const dx = x - c.x, dz = z - c.z;
    const cs = Math.cos(-c.yaw), sn = Math.sin(-c.yaw);
    // rotação em torno de Y: x' = x cos + z sin ; z' = -x sin + z cos
    out.x = dx * cs + dz * sn;
    out.z = -dx * sn + dz * cs;
    return out;
  }
  private world(c: Collider, lx: number, lz: number, out: { x: number; z: number }) {
    const cs = Math.cos(c.yaw), sn = Math.sin(c.yaw);
    out.x = c.x + lx * cs + lz * sn;
    out.z = c.z - lx * sn + lz * cs;
    return out;
  }

  /** Altura do topo do colisor num ponto local (já dentro da área). */
  private topAt(c: Collider, lz: number) {
    if (c.kind === 'box') return c.maxY;
    const t = clamp((lz + c.halfZ) / (2 * c.halfZ), 0, 1);
    return c.minY + t * (c.maxY - c.minY);
  }

  /**
   * Altura do chão sob (x,z) considerando apenas superfícies que o personagem
   * alcança a partir de `feetY` (subindo no máximo `stepUp`).
   */
  groundHeight(x: number, z: number, feetY: number, stepUp: number, inflate = 0): { y: number; material: SurfaceMaterial } {
    let best = -Infinity;
    let mat: SurfaceMaterial = 'grass';
    const l = { x: 0, z: 0 };
    for (const c of this.colliders) {
      if (!c.enabled) continue;
      this.local(c, x, z, l);
      if (Math.abs(l.x) > c.halfX + inflate || Math.abs(l.z) > c.halfZ + inflate) continue;
      const top = this.topAt(c, clamp(l.z, -c.halfZ, c.halfZ));
      if (top <= feetY + stepUp + 1e-4 && top > best) {
        best = top;
        mat = c.material;
      }
    }
    return { y: best, material: mat };
  }

  /**
   * Empurra um cilindro vertical (pés em pos.y) para fora dos colisores que
   * ele não consegue "subir". Retorna true se houve contato lateral.
   */
  resolveCylinder(pos: THREE.Vector3, radius: number, height: number, stepUp: number, hitNormal?: THREE.Vector3): boolean {
    let touched = false;
    const l = { x: 0, z: 0 };
    const w = { x: 0, z: 0 };
    for (let iter = 0; iter < 3; iter++) {
      let any = false;
      for (const c of this.colliders) {
        if (!c.enabled) continue;
        if (pos.y + height <= c.minY || pos.y >= c.maxY - 1e-3) continue;
        this.local(c, pos.x, pos.z, l);
        const cx = clamp(l.x, -c.halfX, c.halfX);
        const cz = clamp(l.z, -c.halfZ, c.halfZ);
        const top = this.topAt(c, cz);
        if (pos.y + stepUp >= top) continue; // dá para subir: não é parede
        let dx = l.x - cx, dz = l.z - cz;
        const d2 = dx * dx + dz * dz;
        if (d2 >= radius * radius) continue;
        let nx: number, nz: number, push: number;
        if (d2 > 1e-8) {
          const d = Math.sqrt(d2);
          nx = dx / d; nz = dz / d;
          push = radius - d;
        } else {
          // centro dentro da caixa: sai pelo lado mais próximo
          const px = c.halfX - Math.abs(l.x), pz = c.halfZ - Math.abs(l.z);
          if (px < pz) { nx = Math.sign(l.x) || 1; nz = 0; push = px + radius; }
          else { nx = 0; nz = Math.sign(l.z) || 1; push = pz + radius; }
        }
        // normal para o mundo
        this.world(c, nx, nz, w);
        const wnx = w.x - c.x, wnz = w.z - c.z;
        pos.x += wnx * push;
        pos.z += wnz * push;
        if (hitNormal) hitNormal.set(wnx, 0, wnz);
        touched = any = true;
      }
      if (!any) break;
    }
    return touched;
  }

  /** Ponto dentro de algum colisor sólido (sem dono)? Usado para golpes que batem em paredes. */
  pointInside(p: THREE.Vector3, ignoreOwned = true): Collider | null {
    const l = { x: 0, z: 0 };
    for (const c of this.colliders) {
      if (!c.enabled || (ignoreOwned && c.owner)) continue;
      if (p.y < c.minY) continue;
      this.local(c, p.x, p.z, l);
      if (Math.abs(l.x) > c.halfX || Math.abs(l.z) > c.halfZ) continue;
      if (p.y < this.topAt(c, l.z) - 0.02) return c;
    }
    return null;
  }

  private meshes() {
    if (this.dirty) {
      this.meshCache = this.colliders.filter((c) => c.enabled && c.mesh).map((c) => c.mesh!);
      this.dirty = false;
    }
    return this.meshCache;
  }

  raycast(origin: THREE.Vector3, dir: THREE.Vector3, maxDist: number, filter?: (c: Collider) => boolean): RayHit | null {
    this.raycaster.set(origin, dir);
    this.raycaster.near = 0;
    this.raycaster.far = maxDist;
    const hits = this.raycaster.intersectObjects(this.meshes(), true);
    for (const h of hits) {
      let o: THREE.Object3D | null = h.object;
      let col: Collider | undefined;
      while (o && !col) {
        col = o.userData.collider;
        o = o.parent;
      }
      if (!col || !col.enabled) continue;
      if (filter && !filter(col)) continue;
      const n = h.face ? h.face.normal.clone().transformDirection(h.object.matrixWorld) : dir.clone().negate();
      return { point: h.point.clone(), normal: n, distance: h.distance, object: h.object, collider: col, material: col.material };
    }
    return null;
  }
}
