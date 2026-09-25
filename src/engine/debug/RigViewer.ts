import * as THREE from 'three';
import { JOINTS, type HumanoidRig, type JointName } from '../character/HumanoidRig';

/** Nome equivalente no padrão Mixamo (referência para montar um rig no Blender). */
const MIXAMO: Record<JointName, string> = {
  pelvis: 'Hips', spine: 'Spine', chest: 'Spine2', neck: 'Neck', head: 'Head',
  upperArmR: 'RightArm', forearmR: 'RightForeArm', handR: 'RightHand',
  upperArmL: 'LeftArm', forearmL: 'LeftForeArm', handL: 'LeftHand',
  thighR: 'RightUpLeg', shinR: 'RightLeg', footR: 'RightFoot',
  thighL: 'LeftUpLeg', shinL: 'LeftLeg', footL: 'LeftFoot',
};

export type RigViewMode = 'off' | 'rig' | 'rest';

/**
 * Visualizador do esqueleto: ossos (linhas pai → filho), articulações (bolinhas),
 * nomes (nosso + Mixamo) e corpo semitransparente. Modo "rest" congela o
 * personagem na pose de repouso (a pose de ligação do rig).
 */
export class RigViewer {
  mode: RigViewMode = 'off';
  private group = new THREE.Group();
  private dots = new Map<JointName, THREE.Mesh>();
  private labels = new Map<JointName, THREE.Sprite>();
  private lines: THREE.LineSegments;
  private pairs: [JointName, JointName | 'tipHead' | 'tipFootR' | 'tipFootL'][] = [];
  private tips: Record<string, THREE.Object3D> = {};
  private v = new THREE.Vector3();
  private savedOpacity = new Map<THREE.Material, [boolean, number, boolean]>();

  constructor(scene: THREE.Scene, private rig: HumanoidRig) {
    this.group.visible = false;
    this.group.renderOrder = 999;
    scene.add(this.group);
    const dotGeo = new THREE.SphereGeometry(0.028, 10, 8);
    for (const j of JOINTS) {
      const color = j.endsWith('R') ? 0xff5a5a : j.endsWith('L') ? 0x5aa8ff : 0xffd24a;
      const dot = new THREE.Mesh(dotGeo, new THREE.MeshBasicMaterial({ color, depthTest: false, transparent: true }));
      dot.renderOrder = 1000;
      this.group.add(dot);
      this.dots.set(j, dot);
      const lab = this.makeLabel(`${j}  ·  ${MIXAMO[j]}`, color, j.endsWith('L'));
      this.group.add(lab);
      this.labels.set(j, lab);
      const parent = this.rig.joints[j].parent;
      const pj = JOINTS.find((k) => this.rig.joints[k] === parent);
      if (pj) this.pairs.push([pj, j]);
    }
    // pontas (topo da cabeça, ponta dos pés) para os ossos terminais terem comprimento
    const tip = (name: string, parent: JointName, x: number, y: number, z: number) => {
      const o = new THREE.Object3D();
      o.position.set(x, y, z);
      this.rig.joints[parent].add(o);
      this.tips[name] = o;
    };
    tip('tipHead', 'head', 0, 0.26, 0);
    tip('tipFootR', 'footR', 0, -0.06, 0.16);
    tip('tipFootL', 'footL', 0, -0.06, 0.16);
    this.pairs.push(['head', 'tipHead'], ['footR', 'tipFootR'], ['footL', 'tipFootL']);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(this.pairs.length * 6), 3));
    this.lines = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: 0xffffff, depthTest: false, transparent: true }));
    this.lines.renderOrder = 999;
    this.lines.frustumCulled = false;
    this.group.add(this.lines);
  }

  private makeLabel(text: string, color: number, leftSide: boolean) {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 64;
    const g = c.getContext('2d')!;
    g.font = 'bold 30px sans-serif';
    const w = g.measureText(text).width + 24;
    g.fillStyle = 'rgba(10,14,22,0.78)';
    g.fillRect(0, 8, w, 48);
    g.fillStyle = '#' + color.toString(16).padStart(6, '0');
    g.fillText(text, 12, 43);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true, sizeAttenuation: false }));
    // lado direito do corpo: nome à direita; esquerdo: à esquerda (sem sobrepor)
    s.center.set(leftSide ? 1.04 - (1 - w / 512) : -0.04, 0.5);
    s.scale.set(0.24, 0.03, 1);
    s.renderOrder = 1001;
    return s;
  }

  /** off → rig → pose de repouso → off. Retorna o texto do modo novo. */
  cycle(): string {
    this.mode = this.mode === 'off' ? 'rig' : this.mode === 'rig' ? 'rest' : 'off';
    this.group.visible = this.mode !== 'off';
    this.setGhost(this.mode !== 'off');
    return this.mode === 'off' ? 'Rig: desligado' : this.mode === 'rig' ? 'Rig: esqueleto (animado)' : 'Rig: pose de repouso';
  }

  private setGhost(on: boolean) {
    for (const m of this.rig.materials) {
      if (on) {
        if (!this.savedOpacity.has(m)) this.savedOpacity.set(m, [m.transparent, m.opacity, m.depthWrite]);
        m.transparent = true;
        m.opacity = 0.28;
        m.depthWrite = false;
      } else {
        const s = this.savedOpacity.get(m);
        if (s) [m.transparent, m.opacity, m.depthWrite] = s;
      }
      m.needsUpdate = true;
    }
    if (!on) this.savedOpacity.clear();
  }

  /** Chamar depois da animação/IK e antes de renderizar. */
  update() {
    if (this.mode === 'off') return;
    const rig = this.rig;
    if (this.mode === 'rest') {
      for (const j of JOINTS) rig.joints[j].quaternion.identity();
      rig.body.rotation.set(0, 0, 0);
      rig.body.scale.set(1, 1, 1);
      rig.body.position.y = rig.bodyPivotY;
    }
    rig.root.updateMatrixWorld(true);
    const pos = (n: string) => (n in this.tips ? this.tips[n] : rig.joints[n as JointName]).getWorldPosition(this.v);
    const arr = this.lines.geometry.getAttribute('position') as THREE.BufferAttribute;
    this.pairs.forEach(([a, b], i) => {
      const pa = pos(a);
      arr.setXYZ(i * 2, pa.x, pa.y, pa.z);
      const pb = pos(b);
      arr.setXYZ(i * 2 + 1, pb.x, pb.y, pb.z);
    });
    arr.needsUpdate = true;
    for (const j of JOINTS) {
      const p = rig.joints[j].getWorldPosition(this.v);
      this.dots.get(j)!.position.copy(p);
      this.labels.get(j)!.position.copy(p);
    }
  }
}
