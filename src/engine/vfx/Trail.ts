import * as THREE from 'three';

/**
 * Rastro de golpe (fita) gerado a partir das posições base/ponta da lâmina.
 * Os pontos são dados no espaço local do `parent` (mundo para 3ª pessoa,
 * espaço da câmera para o viewmodel da 1ª pessoa).
 */
export class SlashTrail {
  readonly mesh: THREE.Mesh;
  private max: number;
  private bases: THREE.Vector3[] = [];
  private tips: THREE.Vector3[] = [];
  private ages: number[] = [];
  private geo: THREE.BufferGeometry;
  private pos: Float32Array;
  private alpha: Float32Array;
  emitting = false;
  lifetime = 0.14;
  color = new THREE.Color(0xffffff);
  private mat: THREE.ShaderMaterial;

  constructor(maxPoints = 24) {
    this.max = maxPoints;
    this.geo = new THREE.BufferGeometry();
    this.pos = new Float32Array(maxPoints * 2 * 3);
    this.alpha = new Float32Array(maxPoints * 2);
    const idx: number[] = [];
    for (let i = 0; i < maxPoints - 1; i++) {
      const a = i * 2, b = a + 1, c = a + 2, d = a + 3;
      idx.push(a, b, c, b, d, c);
    }
    this.geo.setIndex(idx);
    this.geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    this.geo.setAttribute('alpha', new THREE.BufferAttribute(this.alpha, 1).setUsage(THREE.DynamicDrawUsage));
    this.mat = new THREE.ShaderMaterial({
      uniforms: { uColor: { value: this.color } },
      vertexShader: `attribute float alpha; varying float vA; void main(){ vA = alpha; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `uniform vec3 uColor; varying float vA; void main(){ gl_FragColor = vec4(uColor * vA, vA); }`,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    this.mesh = new THREE.Mesh(this.geo, this.mat);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 5;
  }

  push(base: THREE.Vector3, tip: THREE.Vector3) {
    this.bases.unshift(base.clone());
    this.tips.unshift(tip.clone());
    this.ages.unshift(0);
    if (this.bases.length > this.max) {
      this.bases.pop();
      this.tips.pop();
      this.ages.pop();
    }
  }

  clear() {
    this.bases.length = this.tips.length = this.ages.length = 0;
  }

  update(dt: number, enabled: boolean, intensity = 1) {
    for (let i = 0; i < this.ages.length; i++) this.ages[i] += dt;
    while (this.ages.length && this.ages[this.ages.length - 1] > this.lifetime) {
      this.ages.pop();
      this.bases.pop();
      this.tips.pop();
    }
    const n = this.bases.length;
    this.mesh.visible = enabled && n >= 2;
    if (!this.mesh.visible) return;
    for (let i = 0; i < this.max; i++) {
      const j = Math.min(i, n - 1);
      const b = this.bases[j], t = this.tips[j];
      // a base do rastro fica mais estreita (perto da empunhadura)
      const k = 0.35;
      this.pos.set([b.x + (t.x - b.x) * k, b.y + (t.y - b.y) * k, b.z + (t.z - b.z) * k], i * 6);
      this.pos.set([t.x, t.y, t.z], i * 6 + 3);
      const a = i < n ? Math.max(0, 1 - this.ages[j] / this.lifetime) * (1 - i / n) : 0;
      this.alpha[i * 2] = a * 0.1 * intensity;
      this.alpha[i * 2 + 1] = a * 0.75 * intensity;
    }
    this.geo.attributes.position.needsUpdate = true;
    this.geo.attributes.alpha.needsUpdate = true;
  }
}
