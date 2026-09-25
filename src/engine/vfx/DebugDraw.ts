import * as THREE from 'three';
import type { CombatWorld } from '../combat/CombatWorld';

/** Desenha hurtboxes (cápsulas) e segmentos de lâmina para depurar alcance/colisão. */
export class DebugDraw {
  readonly lines: THREE.LineSegments;
  private pts: number[] = [];
  private cols: number[] = [];
  constructor() {
    const geo = new THREE.BufferGeometry();
    this.lines = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ vertexColors: true, depthTest: false, transparent: true }));
    this.lines.renderOrder = 50;
    this.lines.frustumCulled = false;
  }
  private seg(a: THREE.Vector3, b: THREE.Vector3, c: THREE.Color) {
    this.pts.push(a.x, a.y, a.z, b.x, b.y, b.z);
    this.cols.push(c.r, c.g, c.b, c.r, c.g, c.b);
  }
  private circle(center: THREE.Vector3, r: number, c: THREE.Color) {
    const n = 12;
    const a = new THREE.Vector3(), b = new THREE.Vector3();
    for (let i = 0; i < n; i++) {
      const t0 = (i / n) * Math.PI * 2, t1 = ((i + 1) / n) * Math.PI * 2;
      a.set(center.x + Math.cos(t0) * r, center.y, center.z + Math.sin(t0) * r);
      b.set(center.x + Math.cos(t1) * r, center.y, center.z + Math.sin(t1) * r);
      this.seg(a, b, c);
    }
  }
  update(enabled: boolean, combat: CombatWorld, blades: { base: THREE.Vector3; tip: THREE.Vector3 }[]) {
    this.lines.visible = enabled;
    if (!enabled) return;
    this.pts = [];
    this.cols = [];
    const green = new THREE.Color(0x40ff80), gray = new THREE.Color(0x808080), red = new THREE.Color(0xff3040), metal = new THREE.Color(0x60c0ff);
    for (const t of combat.targets) {
      for (const hb of t.hurtboxes) {
        const c = hb.enabled === false || !t.alive ? gray : hb.tag === 'shield' || hb.material === 'metal' ? metal : green;
        this.circle(hb.a, hb.radius, c);
        this.circle(hb.b, hb.radius, c);
        for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          this.seg(new THREE.Vector3(hb.a.x + dx * hb.radius, hb.a.y, hb.a.z + dz * hb.radius), new THREE.Vector3(hb.b.x + dx * hb.radius, hb.b.y, hb.b.z + dz * hb.radius), c);
        }
      }
    }
    for (const b of blades) this.seg(b.base, b.tip, red);
    const g = this.lines.geometry;
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pts, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.cols, 3));
  }
}
