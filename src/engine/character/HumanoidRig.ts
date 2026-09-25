import * as THREE from 'three';

/**
 * Esqueleto humanoide procedural (hierarquia de Object3D) com malhas low-poly.
 * O mesmo esqueleto serve para o herói e para os inimigos (variações de estilo),
 * então TODAS as animações procedurais funcionam em qualquer um deles.
 *
 * Convenções: personagem olha para +Z, direita = -X. Membros "pendem" em -Y.
 */
export type JointName =
  | 'pelvis' | 'spine' | 'chest' | 'neck' | 'head'
  | 'upperArmR' | 'forearmR' | 'handR' | 'upperArmL' | 'forearmL' | 'handL'
  | 'thighR' | 'shinR' | 'footR' | 'thighL' | 'shinL' | 'footL';

export const JOINTS: JointName[] = [
  'pelvis', 'spine', 'chest', 'neck', 'head',
  'upperArmR', 'forearmR', 'handR', 'upperArmL', 'forearmL', 'handL',
  'thighR', 'shinR', 'footR', 'thighL', 'shinL', 'footL',
];

export interface RigStyle {
  variant: 'hero' | 'goblin';
  skin: number;
  tunic: number;
  tunicDark: number;
  pants: number;
  boots: number;
  hair: number;
  belt: number;
  eye: number;
  /** Largura extra de tronco/braços. */
  bulk: number;
  scale: number;
}

export const HERO_STYLE: RigStyle = {
  variant: 'hero', skin: 0xf2c9a0, tunic: 0x2f6fb0, tunicDark: 0x1f4c7c, pants: 0xe8dcc0,
  boots: 0x5a3a24, hair: 0xe6c35c, belt: 0x6b4428, eye: 0x1c3c6c, bulk: 1, scale: 1,
};

export const GOBLIN_STYLE: RigStyle = {
  variant: 'goblin', skin: 0xc2545a, tunic: 0x4a3526, tunicDark: 0x35251a, pants: 0x3a2b20,
  boots: 0x2a1d14, hair: 0x2a1d14, belt: 0x8a6a3a, eye: 0xfff080, bulk: 1.25, scale: 1.02,
};

export const ARM_UPPER = 0.29;
export const ARM_FORE = 0.27;

export class HumanoidRig {
  readonly root = new THREE.Group();
  /** Pivô do corpo inteiro (rolamentos, mortais, giros). Fica na altura do quadril. */
  readonly body = new THREE.Group();
  readonly joints = {} as Record<JointName, THREE.Object3D>;
  /** Sockets para itens. */
  readonly sockets: { handR: THREE.Group; handL: THREE.Group; back: THREE.Group; hip: THREE.Group; shieldArm: THREE.Group };
  readonly materials: THREE.MeshStandardMaterial[] = [];
  readonly bodyPivotY = 0.62;
  private flashT = 0;
  private flashColor = new THREE.Color();

  constructor(public style: RigStyle = HERO_STYLE) {
    const s = style;
    const M = (color: number, rough = 0.8) => {
      const m = new THREE.MeshStandardMaterial({ color, roughness: rough, flatShading: true });
      m.emissive = new THREE.Color(0);
      this.materials.push(m);
      return m;
    };
    const skin = M(s.skin, 0.7), tunic = M(s.tunic), tunicD = M(s.tunicDark), pants = M(s.pants), boots = M(s.boots, 0.9), hair = M(s.hair, 0.6), belt = M(s.belt), eye = M(s.eye, 0.3);
    const add = (parent: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.castShadow = true;
      m.receiveShadow = false;
      parent.add(m);
      return m;
    };
    const J = (name: JointName, parent: THREE.Object3D, x: number, y: number, z: number) => {
      const j = new THREE.Group();
      j.name = name;
      j.position.set(x, y, z);
      parent.add(j);
      this.joints[name] = j;
      return j;
    };
    const B = s.bulk;
    const gob = s.variant === 'goblin';

    this.root.add(this.body);
    this.body.position.y = this.bodyPivotY;
    const pelvis = J('pelvis', this.body, 0, 0.95 - this.bodyPivotY, 0);
    const spine = J('spine', pelvis, 0, 0.08, 0);
    const chest = J('chest', spine, 0, 0.18, 0);
    const neck = J('neck', chest, 0, 0.26, 0);
    const head = J('head', neck, 0, 0.07, 0.01);

    // quadril / saia da túnica
    add(pelvis, new THREE.CylinderGeometry(0.15 * B, 0.17 * B, 0.16, 8), pants, 0, 0, 0);
    const skirt = add(pelvis, new THREE.CylinderGeometry(0.17 * B, 0.23 * B, 0.26, 8, 1, true), gob ? tunicD : tunic, 0, -0.1, 0);
    (skirt.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide;
    add(pelvis, new THREE.CylinderGeometry(0.165 * B, 0.165 * B, 0.05, 8), belt, 0, 0.06, 0);
    // tronco
    const torso = add(spine, new THREE.CylinderGeometry(0.2 * B, 0.155 * B, 0.36, 8), tunic, 0, 0.16, 0);
    torso.scale.z = 0.72;
    if (!gob) add(chest, new THREE.BoxGeometry(0.06, 0.34, 0.02), belt, -0.06, -0.02, 0.12).rotation.z = 0.5; // alça da bainha
    // gola / ombros
    add(chest, new THREE.SphereGeometry(0.1 * B, 8, 6), gob ? skin : tunicD, 0.19 * B, 0.15, 0).scale.set(1, 0.8, 0.9);
    add(chest, new THREE.SphereGeometry(0.1 * B, 8, 6), gob ? skin : tunicD, -0.19 * B, 0.15, 0).scale.set(1, 0.8, 0.9);
    add(neck, new THREE.CylinderGeometry(0.055, 0.065, 0.1, 6), skin, 0, 0.0, 0);
    // cabeça
    const headSize = gob ? 0.16 : 0.135;
    const h = add(head, new THREE.IcosahedronGeometry(headSize, 1), skin, 0, 0.12, 0);
    h.scale.set(1, 1.08, 1);
    add(head, new THREE.SphereGeometry(0.022, 6, 4), eye, 0.05, 0.13, headSize * 0.88);
    add(head, new THREE.SphereGeometry(0.022, 6, 4), eye, -0.05, 0.13, headSize * 0.88);
    if (!gob) {
      // cabelo + franja + rabo + orelhas pontudas
      const hairCap = add(head, new THREE.SphereGeometry(0.145, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.55), hair, 0, 0.14, -0.01);
      hairCap.scale.set(1.02, 1.05, 1.06);
      add(head, new THREE.ConeGeometry(0.05, 0.14, 4), hair, 0.05, 0.19, 0.11).rotation.set(1.9, 0, 0.3);
      add(head, new THREE.ConeGeometry(0.05, 0.14, 4), hair, -0.06, 0.2, 0.11).rotation.set(1.9, 0, -0.3);
      add(head, new THREE.ConeGeometry(0.045, 0.22, 5), hair, 0, 0.1, -0.15).rotation.x = -0.4;
      const earGeo = new THREE.ConeGeometry(0.025, 0.12, 4);
      add(head, earGeo, skin, 0.14, 0.12, -0.01).rotation.set(0, 0, -1.2);
      add(head, earGeo, skin, -0.14, 0.12, -0.01).rotation.set(0, 0, 1.2);
    } else {
      // focinho, chifre e orelhas grandes (inimigo tipo goblin)
      add(head, new THREE.SphereGeometry(0.075, 7, 5), skin, 0, 0.07, 0.14).scale.set(1.2, 0.8, 1);
      add(head, new THREE.SphereGeometry(0.015, 4, 3), M(0x2a1010), 0.03, 0.08, 0.215);
      add(head, new THREE.SphereGeometry(0.015, 4, 3), M(0x2a1010), -0.03, 0.08, 0.215);
      add(head, new THREE.ConeGeometry(0.035, 0.16, 5), M(0xf0e6c8, 0.5), 0, 0.3, 0.04).rotation.x = -0.25;
      const earGeo = new THREE.ConeGeometry(0.05, 0.2, 4);
      add(head, earGeo, skin, 0.17, 0.14, 0).rotation.set(0, 0, -1.35);
      add(head, earGeo, skin, -0.17, 0.14, 0).rotation.set(0, 0, 1.35);
      add(head, new THREE.ConeGeometry(0.012, 0.05, 3), M(0xffffff, 0.4), 0.04, 0.02, 0.19).rotation.x = Math.PI;
      add(head, new THREE.ConeGeometry(0.012, 0.05, 3), M(0xffffff, 0.4), -0.04, 0.02, 0.19).rotation.x = Math.PI;
    }

    // braços
    const arm = (side: 1 | -1) => {
      const R = side === -1;
      const up = J(R ? 'upperArmR' : 'upperArmL', chest, 0.2 * B * side, 0.17, 0.04);
      add(up, new THREE.CapsuleGeometry(0.055 * B, ARM_UPPER - 0.08, 3, 6), gob ? skin : tunic, 0, -ARM_UPPER / 2, 0);
      const fo = J(R ? 'forearmR' : 'forearmL', up, 0, -ARM_UPPER, 0);
      add(fo, new THREE.CapsuleGeometry(0.047 * B, ARM_FORE - 0.08, 3, 6), skin, 0, -ARM_FORE / 2, 0);
      if (!gob) add(fo, new THREE.CylinderGeometry(0.056, 0.052, 0.1, 6), boots, 0, -ARM_FORE + 0.08, 0); // bracelete
      const hand = J(R ? 'handR' : 'handL', fo, 0, -ARM_FORE, 0);
      add(hand, new THREE.BoxGeometry(0.07 * B, 0.09, 0.08), skin, 0, -0.03, 0);
    };
    arm(-1);
    arm(1);

    // pernas
    const leg = (side: 1 | -1) => {
      const R = side === -1;
      const th = J(R ? 'thighR' : 'thighL', pelvis, 0.095 * side * B, -0.04, 0);
      add(th, new THREE.CapsuleGeometry(0.07 * B, 0.28, 3, 6), pants, 0, -0.21, 0);
      const sh = J(R ? 'shinR' : 'shinL', th, 0, -0.43, 0);
      add(sh, new THREE.CapsuleGeometry(0.06 * B, 0.26, 3, 6), gob ? skin : boots, 0, -0.2, 0);
      if (!gob) add(sh, new THREE.CylinderGeometry(0.075, 0.068, 0.08, 6), boots, 0, -0.02, 0);
      const ft = J(R ? 'footR' : 'footL', sh, 0, -0.42, 0);
      add(ft, new THREE.BoxGeometry(0.1 * B, 0.07, 0.2), boots, 0, -0.03, 0.04);
    };
    leg(-1);
    leg(1);

    // sockets
    const handR = new THREE.Group();
    handR.position.set(0, -0.04, 0.0);
    this.joints.handR.add(handR);
    const handL = new THREE.Group();
    handL.position.set(0, -0.04, 0.0);
    this.joints.handL.add(handL);
    const back = new THREE.Group();
    back.position.set(0, 0.12, -0.16);
    chest.add(back);
    const hip = new THREE.Group();
    hip.position.set(0.2, 0, -0.05);
    pelvis.add(hip);
    const shieldArm = new THREE.Group();
    shieldArm.position.set(0.07, -ARM_FORE * 0.55, 0);
    this.joints.forearmL.add(shieldArm);
    this.sockets = { handR, handL, back, hip, shieldArm };

    this.root.scale.setScalar(s.scale);
  }

  /** Pisca o corpo (feedback de dano). */
  flash(color: number, duration = 0.12) {
    this.flashT = duration;
    this.flashColor.set(color);
  }

  updateFlash(dt: number) {
    if (this.flashT <= 0) return;
    this.flashT -= dt;
    const k = Math.max(0, this.flashT) > 0 ? 1 : 0;
    for (const m of this.materials) {
      m.emissive.copy(this.flashColor).multiplyScalar(k * 0.9);
    }
  }

  setVisible(v: boolean) {
    this.root.visible = v;
  }

  dispose() {
    this.root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
    });
    for (const m of this.materials) m.dispose();
  }
}
