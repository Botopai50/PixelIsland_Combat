import * as THREE from 'three';

/**
 * Sistema de partículas por instâncias (um draw call por tipo).
 * - "solid": lascas, fragmentos, pedaços (iluminados, com colisão no chão).
 * - "glow": faíscas, brilhos, estrelas (aditivos, podem esticar na direção do movimento).
 * - "puff": poeira/fumaça (esferas low-poly que crescem e somem).
 */
export type ParticleLayer = 'solid' | 'glow' | 'puff';

export interface ParticleSpawn {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  color: THREE.Color | number;
  size: number;
  life: number;
  gravity?: number;
  drag?: number;
  /** Estica o sprite na direção da velocidade (faíscas). */
  stretch?: number;
  spin?: number;
  /** Tamanho final relativo (1 = mantém; 0 = some encolhendo; >1 cresce). */
  endScale?: number;
  bounce?: number;
  floorY?: number;
  /** Forma alongada (lascas): escala x,y,z relativa. */
  shape?: [number, number, number];
}

interface P {
  alive: boolean;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  rot: THREE.Euler;
  spinAxis: THREE.Vector3;
  spin: number;
  size: number;
  life: number;
  maxLife: number;
  gravity: number;
  drag: number;
  stretch: number;
  endScale: number;
  bounce: number;
  floorY: number;
  shape: THREE.Vector3;
  color: THREE.Color;
}

class Pool {
  mesh: THREE.InstancedMesh;
  items: P[] = [];
  private cursor = 0;
  private m = new THREE.Matrix4();
  private q = new THREE.Quaternion();
  private s = new THREE.Vector3();
  private tmp = new THREE.Vector3();
  private fwd = new THREE.Vector3(0, 0, 1);
  private fadeColor: boolean;
  private col = new THREE.Color();
  private qs = new THREE.Quaternion();

  constructor(geo: THREE.BufferGeometry, mat: THREE.Material, public count: number, fadeColor: boolean) {
    this.fadeColor = fadeColor;
    this.mesh = new THREE.InstancedMesh(geo, mat, count);
    this.mesh.frustumCulled = false;
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    const white = new THREE.Color(1, 1, 1);
    for (let i = 0; i < count; i++) {
      this.items.push({
        alive: false, pos: new THREE.Vector3(), vel: new THREE.Vector3(), rot: new THREE.Euler(),
        spinAxis: new THREE.Vector3(1, 0, 0), spin: 0, size: 0, life: 0, maxLife: 1, gravity: 0, drag: 0,
        stretch: 0, endScale: 0, bounce: 0, floorY: -999, shape: new THREE.Vector3(1, 1, 1), color: new THREE.Color(),
      });
      this.mesh.setColorAt(i, white);
      this.m.makeScale(0, 0, 0);
      this.mesh.setMatrixAt(i, this.m);
    }
    this.mesh.count = count;
  }

  spawn(s: ParticleSpawn) {
    const p = this.items[this.cursor];
    this.cursor = (this.cursor + 1) % this.count;
    p.alive = true;
    p.pos.copy(s.pos);
    p.vel.copy(s.vel);
    p.rot.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
    p.spinAxis.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
    p.spin = s.spin ?? 8;
    p.size = s.size;
    p.life = p.maxLife = s.life;
    p.gravity = s.gravity ?? 0;
    p.drag = s.drag ?? 0;
    p.stretch = s.stretch ?? 0;
    p.endScale = s.endScale ?? 0;
    p.bounce = s.bounce ?? 0.35;
    p.floorY = s.floorY ?? -999;
    if (s.shape) p.shape.set(s.shape[0], s.shape[1], s.shape[2]);
    else p.shape.set(1, 1, 1);
    p.color.set(s.color as THREE.ColorRepresentation);
  }

  update(dt: number, camera: THREE.Camera) {
    const quatSpin = this.qs;
    for (let i = 0; i < this.count; i++) {
      const p = this.items[i];
      if (!p.alive) continue;
      p.life -= dt;
      if (p.life <= 0) {
        p.alive = false;
        this.m.makeScale(0, 0, 0);
        this.mesh.setMatrixAt(i, this.m);
        continue;
      }
      p.vel.y -= p.gravity * dt;
      if (p.drag > 0) p.vel.multiplyScalar(Math.exp(-p.drag * dt));
      p.pos.addScaledVector(p.vel, dt);
      if (p.pos.y < p.floorY) {
        p.pos.y = p.floorY;
        if (p.vel.y < 0) p.vel.y = -p.vel.y * p.bounce;
        p.vel.x *= 0.6;
        p.vel.z *= 0.6;
        p.spin *= 0.6;
      }
      const k = 1 - p.life / p.maxLife; // 0 -> 1
      const sc = p.size * (1 + (p.endScale - 1) * k);
      if (p.stretch > 0) {
        const speed = p.vel.length();
        this.tmp.copy(p.vel).normalize();
        if (speed > 1e-4) this.q.setFromUnitVectors(this.fwd, this.tmp);
        this.s.set(sc, sc, sc + speed * p.stretch * 0.02);
      } else {
        quatSpin.setFromAxisAngle(p.spinAxis, p.spin * (p.maxLife - p.life));
        this.q.setFromEuler(p.rot).multiply(quatSpin);
        this.s.set(sc * p.shape.x, sc * p.shape.y, sc * p.shape.z);
      }
      this.m.compose(p.pos, this.q, this.s);
      this.mesh.setMatrixAt(i, this.m);
      if (this.fadeColor) {
        // aditivos: "some" escurecendo a cor
        const f = Math.min(1, (p.life / p.maxLife) * 1.6);
        this.col.setRGB(p.color.r * f, p.color.g * f, p.color.b * f);
        this.mesh.setColorAt(i, this.col);
      } else {
        this.mesh.setColorAt(i, p.color);
      }
    }
    void camera;
    this.mesh.instanceMatrix.needsUpdate = true;
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
  }

  clear() {
    for (let i = 0; i < this.count; i++) {
      this.items[i].alive = false;
      this.m.makeScale(0, 0, 0);
      this.mesh.setMatrixAt(i, this.m);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}

export class ParticleSystem {
  readonly group = new THREE.Group();
  private pools: Record<ParticleLayer, Pool>;

  constructor() {
    const solidGeo = new THREE.BoxGeometry(1, 1, 1);
    const solidMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const glowGeo = new THREE.BoxGeometry(0.35, 0.35, 1);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xffffff, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, toneMapped: false,
    });
    const puffGeo = new THREE.IcosahedronGeometry(0.5, 0);
    const puffMat = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, depthWrite: false });
    this.pools = {
      solid: new Pool(solidGeo, solidMat, 700, false),
      glow: new Pool(glowGeo, glowMat, 600, true),
      puff: new Pool(puffGeo, puffMat, 260, false),
    };
    for (const p of Object.values(this.pools)) this.group.add(p.mesh);
    this.group.name = 'particles';
  }

  spawn(layer: ParticleLayer, s: ParticleSpawn) {
    this.pools[layer].spawn(s);
  }

  update(dt: number, camera: THREE.Camera) {
    for (const p of Object.values(this.pools)) p.update(dt, camera);
  }

  clear() {
    for (const p of Object.values(this.pools)) p.clear();
  }
}
