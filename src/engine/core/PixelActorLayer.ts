import * as THREE from 'three';

export const PIXEL_ACTOR_LAYER = 1;

const shadowOnly = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false });

/** O render em baixa resolução recebe a cor. O render do mundo recebe as sombras. */
export function addToPixelActorLayer(root: THREE.Object3D) {
  const casters: THREE.Mesh[] = [];
  root.traverse(object => {
    object.layers.set(PIXEL_ACTOR_LAYER);
    const mesh = object as THREE.Mesh;
    if (mesh.isMesh && mesh.castShadow) casters.push(mesh);
  });
  for (const mesh of casters) {
    const proxy = new THREE.Mesh(mesh.geometry, shadowOnly);
    proxy.castShadow = true;
    proxy.customDepthMaterial = mesh.customDepthMaterial;
    mesh.castShadow = false;
    mesh.add(proxy);
  }
}
