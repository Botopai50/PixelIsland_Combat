import * as THREE from 'three';

interface Column { x0: number; x1: number; y0: number; y1: number }
const silhouettes = new WeakMap<THREE.Texture, Column[]>();
const inverseParent = new THREE.Matrix4();
const parentLinear = new THREE.Matrix3();
const liftVector = new THREE.Vector3();

/** Borda opaca real; a margem transparente do arquivo não é um pé nem um ponto de apoio. */
function silhouette(texture: THREE.Texture): Column[] {
  const cached = silhouettes.get(texture);
  if (cached) return cached;
  const { data, width, height } = texture.image as { data?: ArrayLike<number>; width: number; height: number };
  const columns: Column[] = [];
  if (!data) return columns;
  for (let x = 0; x < width; x++) {
    let top = height, bottom = -1;
    for (let y = 0; y < height; y++) {
      if (data[(y * width + x) * 4 + 3] < 128) continue;
      top = Math.min(top, y); bottom = y;
    }
    if (bottom < 0) continue;
    const a = texture.flipY ? .5 - top / height : top / height - .5;
    const b = texture.flipY ? .5 - (bottom + 1) / height : (bottom + 1) / height - .5;
    columns.push({ x0: x / width - .5, x1: (x + 1) / width - .5, y0: Math.min(a, b), y1: Math.max(a, b) });
  }
  silhouettes.set(texture, columns);
  return columns;
}

export function lowestOpaqueY(mesh: THREE.Mesh, texture: THREE.Texture): number {
  mesh.updateWorldMatrix(true, false);
  const m = mesh.matrixWorld.elements;
  let lowest = Infinity;
  for (const column of silhouette(texture)) {
    const x = m[1] >= 0 ? column.x0 : column.x1;
    const y = m[5] >= 0 ? column.y0 : column.y1;
    lowest = Math.min(lowest, m[1] * x + m[5] * y + m[13]);
  }
  return lowest;
}

/** Levanta só o desenho, preservando posição física, colisões, pulos e profundidade. */
export function keepAnimalAboveGround(mesh: THREE.Mesh, texture: THREE.Texture, groundY: number, margin = .012): number {
  if (!Number.isFinite(groundY)) return 0;
  const lowest = lowestOpaqueY(mesh, texture);
  const lift = Math.max(0, groundY + margin - lowest);
  if (!Number.isFinite(lift) || lift === 0) return 0;
  liftVector.set(0, lift, 0);
  if (mesh.parent) {
    inverseParent.copy(mesh.parent.matrixWorld).invert();
    parentLinear.setFromMatrix4(inverseParent);
    liftVector.applyMatrix3(parentLinear);
  }
  mesh.position.add(liftVector);
  return lift;
}
