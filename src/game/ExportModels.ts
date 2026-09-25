import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { HumanoidRig, HERO_STYLE, GOBLIN_STYLE } from '../engine/character/HumanoidRig';
import { createWeaponModel } from '../engine/items/WeaponModels';

/**
 * Exporta os modelos procedurais (herói, inimigo, armas) como .glb, para uso
 * em editores/outros motores. No Three.js, prefira importar os módulos direto
 * (as animações são procedurais e vêm junto do HumanoidAnimator).
 */
export function exportModelsGLB() {
  const root = new THREE.Scene();
  const hero = new HumanoidRig(HERO_STYLE);
  hero.root.name = 'Hero';
  const gob = new HumanoidRig(GOBLIN_STYLE);
  gob.root.name = 'Goblin';
  gob.root.position.x = 1.5;
  root.add(hero.root, gob.root);
  ['sword', 'axe', 'pickaxe', 'bow', 'shield', 'club'].forEach((id, i) => {
    const m = createWeaponModel(id);
    m.root.name = id;
    m.root.position.set(-1.5 - i * 0.6, 0.2, 0);
    root.add(m.root);
  });
  new GLTFExporter().parse(
    root,
    (res) => {
      const blob = new Blob([res as ArrayBuffer], { type: 'model/gltf-binary' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'pixelisland-combat-models.glb';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    },
    (err) => console.error(err),
    { binary: true },
  );
}
