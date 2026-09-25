import * as THREE from 'three';

const S = new THREE.Vector3(), T = new THREE.Vector3(), P = new THREE.Vector3();
const toT = new THREE.Vector3(), n = new THREE.Vector3(), e = new THREE.Vector3(), f = new THREE.Vector3();
const E = new THREE.Vector3();
const DOWN = new THREE.Vector3(0, -1, 0);
const qParent = new THREE.Quaternion(), qWorld = new THREE.Quaternion(), qLocal = new THREE.Quaternion();
const qUpperWorld = new THREE.Quaternion(), qFk = new THREE.Quaternion();

/**
 * IK analítico de dois ossos (braço/perna) com vetor polar (direção do cotovelo).
 * Ossos "pendem" em -Y no espaço local. `weight` mistura com a pose atual (FK).
 */
export function solveTwoBoneIK(
  upper: THREE.Object3D, lower: THREE.Object3D,
  lenA: number, lenB: number,
  target: THREE.Vector3, pole: THREE.Vector3, weight = 1,
) {
  if (weight <= 0.001) return;
  upper.parent!.updateWorldMatrix(true, false);
  upper.getWorldPosition(S);
  // escala do personagem
  const sc = upper.parent!.getWorldScale(P).x;
  const a = lenA * sc, b = lenB * sc;
  T.copy(target);
  toT.subVectors(T, S);
  let c = toT.length();
  c = Math.min(Math.max(c, Math.abs(a - b) + 1e-3), a + b - 1e-4);
  toT.normalize();
  const cosA = (a * a + c * c - b * b) / (2 * a * c);
  const angA = Math.acos(Math.min(1, Math.max(-1, cosA)));
  // plano de dobra
  P.subVectors(pole, S);
  n.crossVectors(toT, P);
  if (n.lengthSq() < 1e-8) n.set(1, 0, 0);
  n.normalize();
  // direção do osso superior: gira toT em direção ao polo por angA
  e.copy(toT).applyAxisAngle(n, angA);
  E.copy(S).addScaledVector(e, a);
  f.subVectors(T.copy(S).addScaledVector(toT, c), E).normalize();

  // osso superior
  upper.parent!.getWorldQuaternion(qParent);
  qWorld.setFromUnitVectors(DOWN, e);
  qLocal.copy(qParent).invert().multiply(qWorld);
  qFk.copy(upper.quaternion);
  upper.quaternion.copy(qFk).slerp(qLocal, weight);
  upper.updateWorldMatrix(false, false);
  // osso inferior
  upper.getWorldQuaternion(qUpperWorld);
  qWorld.setFromUnitVectors(DOWN, f);
  qLocal.copy(qUpperWorld).invert().multiply(qWorld);
  qFk.copy(lower.quaternion);
  lower.quaternion.copy(qFk).slerp(qLocal, weight);
  lower.updateWorldMatrix(false, true);
}
