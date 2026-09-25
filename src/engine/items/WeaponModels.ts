import * as THREE from 'three';

/**
 * Modelos procedurais das armas (low-poly, sem arquivos externos).
 * Convenção de eixos de TODAS as armas corpo a corpo:
 *   origem = empunhadura, +Y = em direção à ponta, +Z = gume/cabeça (sentido do corte).
 * Isso permite que a mesma arma seja usada na mão do corpo (3ª pessoa), no
 * viewmodel (1ª pessoa) e em qualquer personagem de outro projeto.
 */
export interface WeaponModel {
  root: THREE.Group;
  /** Brilho de carga (0..1). */
  setGlow(v: number): void;
  /** Só para o arco: tensão da corda (0..1) e flecha encaixada visível. */
  setDraw?(v: number, nocked: boolean): void;
  kind: string;
}

const mats = {
  steel: () => new THREE.MeshStandardMaterial({ color: 0xd6dee8, metalness: 0.75, roughness: 0.28, flatShading: true }),
  darkSteel: () => new THREE.MeshStandardMaterial({ color: 0x8e98a6, metalness: 0.7, roughness: 0.4, flatShading: true }),
  wood: () => new THREE.MeshStandardMaterial({ color: 0x8a5a2b, roughness: 0.85, flatShading: true }),
  lightWood: () => new THREE.MeshStandardMaterial({ color: 0xb98a55, roughness: 0.8, flatShading: true }),
  leather: () => new THREE.MeshStandardMaterial({ color: 0x5a3a24, roughness: 0.9, flatShading: true }),
  gold: () => new THREE.MeshStandardMaterial({ color: 0xd9b24a, metalness: 0.8, roughness: 0.3, flatShading: true }),
  blue: () => new THREE.MeshStandardMaterial({ color: 0x3b6ea8, roughness: 0.6, flatShading: true }),
  string: () => new THREE.MeshBasicMaterial({ color: 0xf2efe6 }),
};

function mesh(geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  return m;
}

function glowFn(mat: THREE.MeshStandardMaterial, color: number) {
  mat.emissive = new THREE.Color(color);
  mat.emissiveIntensity = 0;
  return (v: number) => {
    mat.emissiveIntensity = v * 1.6;
  };
}

export function createSword(): WeaponModel {
  const g = new THREE.Group();
  const blade = mats.steel();
  const grip = mesh(new THREE.CylinderGeometry(0.022, 0.024, 0.2, 6), mats.leather(), 0, -0.02, 0);
  const pommel = mesh(new THREE.OctahedronGeometry(0.035), mats.gold(), 0, -0.13, 0);
  const guard = mesh(new THREE.BoxGeometry(0.05, 0.035, 0.24), mats.gold(), 0, 0.095, 0);
  const b = mesh(new THREE.BoxGeometry(0.018, 0.78, 0.068), blade, 0, 0.5, 0);
  const tipGeo = new THREE.ConeGeometry(0.048, 0.14, 4);
  tipGeo.rotateY(Math.PI / 4);
  tipGeo.scale(0.38, 1, 1);
  const tip = mesh(tipGeo, blade, 0, 0.96, 0);
  const fuller = mesh(new THREE.BoxGeometry(0.02, 0.5, 0.014), mats.blue(), 0, 0.4, 0);
  g.add(grip, pommel, guard, b, tip, fuller);
  return { root: g, setGlow: glowFn(blade, 0x6fd0ff), kind: 'sword' };
}

export function createAxe(): WeaponModel {
  const g = new THREE.Group();
  const head = mats.darkSteel();
  g.add(mesh(new THREE.CylinderGeometry(0.026, 0.03, 0.95, 6), mats.wood(), 0, 0.36, 0));
  const shape = new THREE.Shape();
  shape.moveTo(0, -0.07);
  shape.lineTo(0.12, -0.13);
  shape.quadraticCurveTo(0.2, 0, 0.12, 0.13);
  shape.lineTo(0, 0.07);
  shape.lineTo(-0.05, 0.04);
  shape.lineTo(-0.05, -0.04);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.035, bevelEnabled: false });
  geo.translate(0, 0, -0.0175);
  // shape está no plano XY; queremos a lâmina para +Z e altura em Y
  geo.rotateY(-Math.PI / 2);
  const h = mesh(geo, head, 0, 0.74, 0);
  h.scale.set(1, 1, 1);
  const edge = mesh(new THREE.BoxGeometry(0.012, 0.25, 0.02), mats.steel(), 0, 0.74, 0.19);
  const wrap = mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.12, 6), mats.leather(), 0, 0.0, 0);
  g.add(h, edge, wrap);
  return { root: g, setGlow: glowFn(head, 0xffb050), kind: 'axe' };
}

export function createPickaxe(): WeaponModel {
  const g = new THREE.Group();
  const head = mats.darkSteel();
  g.add(mesh(new THREE.CylinderGeometry(0.025, 0.029, 0.95, 6), mats.lightWood(), 0, 0.36, 0));
  // cabeça curva: dois braços pontiagudos (+Z e -Z) levemente para baixo
  const makeArm = (dir: number) => {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0, 0.8, 0),
      new THREE.Vector3(0, 0.84, 0.16 * dir),
      new THREE.Vector3(0, 0.72, 0.32 * dir),
    );
    const tube = new THREE.TubeGeometry(curve, 6, 0.028, 5, false);
    // afina a ponta
    const pos = tube.attributes.position as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const t = Math.min(1, Math.abs(v.z) / 0.32);
      const c = curve.getPoint(t);
      v.sub(c).multiplyScalar(1 - t * 0.85).add(c);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    tube.computeVertexNormals();
    return mesh(tube, head);
  };
  g.add(makeArm(1), makeArm(-1));
  g.add(mesh(new THREE.BoxGeometry(0.07, 0.09, 0.08), head, 0, 0.8, 0));
  g.add(mesh(new THREE.CylinderGeometry(0.031, 0.031, 0.12, 6), mats.leather(), 0, 0.0, 0));
  return { root: g, setGlow: glowFn(head, 0x9fb8ff), kind: 'pickaxe' };
}

export function createClub(): WeaponModel {
  const g = new THREE.Group();
  const w = new THREE.MeshStandardMaterial({ color: 0x6b4a2e, roughness: 0.9, flatShading: true });
  g.add(mesh(new THREE.CylinderGeometry(0.1, 0.035, 0.95, 7), w, 0, 0.42, 0));
  const spike = new THREE.MeshStandardMaterial({ color: 0xd8d0c0, roughness: 0.6, flatShading: true });
  for (let i = 0; i < 6; i++) {
    const s = mesh(new THREE.ConeGeometry(0.025, 0.09, 4), spike);
    const a = (i / 6) * Math.PI * 2;
    s.position.set(Math.cos(a) * 0.09, 0.62 + (i % 2) * 0.16, Math.sin(a) * 0.09);
    s.lookAt(Math.cos(a) * 2, s.position.y, Math.sin(a) * 2);
    s.rotateX(Math.PI / 2);
    g.add(s);
  }
  return { root: g, setGlow: glowFn(w, 0xff4040), kind: 'club' };
}

/** Escudo: frente = +Z, alça na origem. */
export function createShield(): WeaponModel {
  const g = new THREE.Group();
  const face = new THREE.MeshStandardMaterial({ color: 0x3b6ea8, roughness: 0.5, metalness: 0.3, flatShading: true });
  const rim = new THREE.MeshStandardMaterial({ color: 0xc9d1dc, roughness: 0.3, metalness: 0.85, flatShading: true });
  const shape = new THREE.Shape();
  shape.moveTo(0, 0.34);
  shape.lineTo(0.26, 0.26);
  shape.lineTo(0.25, -0.05);
  shape.quadraticCurveTo(0.2, -0.28, 0, -0.38);
  shape.quadraticCurveTo(-0.2, -0.28, -0.25, -0.05);
  shape.lineTo(-0.26, 0.26);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.04, bevelEnabled: true, bevelSize: 0.025, bevelThickness: 0.02, bevelSegments: 1 });
  const body = mesh(geo, face, 0, 0, 0.04);
  const rimGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.02, bevelEnabled: false });
  const r = mesh(rimGeo, rim, 0, 0, 0.03);
  r.scale.set(1.1, 1.1, 1);
  const emblem = mesh(new THREE.OctahedronGeometry(0.08), mats.gold(), 0, 0.02, 0.12);
  emblem.scale.set(1, 1.3, 0.4);
  const boss = mesh(new THREE.SphereGeometry(0.05, 6, 4), rim, 0, 0.2, 0.11);
  const handle = mesh(new THREE.BoxGeometry(0.04, 0.16, 0.04), mats.leather(), 0, 0, 0.0);
  g.add(r, body, emblem, boss, handle);
  return { root: g, setGlow: glowFn(face, 0x7ff6ff), kind: 'shield' };
}

/** Arco: empunhadura na origem, arco no plano YZ, flecha dispara em +Z. */
/** Quanto a corda recua na puxada completa (m). Usado pelo modelo e pelas mãos (IK). */
export const BOW_DRAW_LEN = 0.45;

export function createBow(): WeaponModel {
  const g = new THREE.Group();
  const wood = new THREE.MeshStandardMaterial({ color: 0x7a4a24, roughness: 0.7, flatShading: true });
  const limbCurve = (dir: number) =>
    new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 0.05 * dir, 0), new THREE.Vector3(0, 0.36 * dir, 0.08), new THREE.Vector3(0, 0.6 * dir, -0.1));
  const upper = limbCurve(1), lower = limbCurve(-1);
  g.add(mesh(new THREE.TubeGeometry(upper, 8, 0.02, 5), wood));
  g.add(mesh(new THREE.TubeGeometry(lower, 8, 0.02, 5), wood));
  g.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.16, 6), mats.leather()));
  const topTip = new THREE.Vector3(0, 0.6, -0.1);
  const botTip = new THREE.Vector3(0, -0.6, -0.1);
  const sMat = mats.string();
  const s1 = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 1, 3), sMat);
  const s2 = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 1, 3), sMat);
  g.add(s1, s2);
  const arrow = createArrowMesh();
  g.add(arrow);
  const mid = new THREE.Vector3();
  const placeString = (s: THREE.Mesh, a: THREE.Vector3, b: THREE.Vector3) => {
    s.position.copy(a).add(b).multiplyScalar(0.5);
    const d = new THREE.Vector3().subVectors(b, a);
    s.scale.set(1, d.length(), 1);
    s.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  };
  const setDraw = (v: number, nocked: boolean) => {
    mid.set(0, 0, -0.1 - v * BOW_DRAW_LEN);
    placeString(s1, topTip, mid);
    placeString(s2, mid, botTip);
    // limbs flexionam um pouco
    g.children[0].scale.set(1, 1 - v * 0.08, 1 + v * 0.25);
    g.children[1].scale.set(1, 1 - v * 0.08, 1 + v * 0.25);
    arrow.visible = nocked;
    // flecha: ponta em +Z, nock no meio da corda
    arrow.position.set(0.02, 0, mid.z + 0.8);
  };
  setDraw(0, false);
  return { root: g, setGlow: glowFn(wood, 0xffe0a0), setDraw, kind: 'bow' };
}

/** Flecha com origem na PONTA e haste para -Z (facilita cravar em superfícies). */
export function createArrowMesh(): THREE.Group {
  const g = new THREE.Group();
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.78, 4), new THREE.MeshStandardMaterial({ color: 0xc9a46a, roughness: 0.8 }));
  shaft.rotation.x = Math.PI / 2;
  shaft.position.z = -0.4;
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.07, 4), new THREE.MeshStandardMaterial({ color: 0xcfd6df, metalness: 0.8, roughness: 0.3 }));
  tip.rotation.x = Math.PI / 2;
  tip.position.z = -0.02;
  const fl = new THREE.MeshStandardMaterial({ color: 0xf2f2f2, side: THREE.DoubleSide, roughness: 1 });
  for (let i = 0; i < 3; i++) {
    const f = new THREE.Mesh(new THREE.PlaneGeometry(0.035, 0.12), fl);
    f.position.z = -0.72;
    f.rotation.set(Math.PI / 2, 0, (i / 3) * Math.PI * 2);
    f.translateX(0.02);
    g.add(f);
  }
  g.add(shaft, tip);
  g.traverse((o) => ((o as THREE.Mesh).castShadow = true));
  return g;
}

export function createWeaponModel(id: string): WeaponModel {
  switch (id) {
    case 'sword': return createSword();
    case 'axe': return createAxe();
    case 'pickaxe': return createPickaxe();
    case 'bow': return createBow();
    case 'club': return createClub();
    case 'shield': return createShield();
    default: return createSword();
  }
}
