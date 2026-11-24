import * as THREE from 'three';
import type { GameContext } from '../core/Context';
import { TravelerView } from './TravelerView';

const LINES = [
  'Sou Bento. A Flor-de-Espinhos ronda a clareira perto do lago. Já vi aquela coisa arrancar pedras do chão.',
  'Quando o chão acender, saia dos círculos. As raízes brotam onde você estava quando ela começou o ataque.',
  'Quando estiver ferida, a flor ataca mais depressa. Espere o golpe passar antes de chegar perto.',
];

export class Traveler {
  private readonly view: TravelerView;
  private readonly position: THREE.Vector3;
  private readonly panel = document.createElement('aside');
  private readonly dialogue = document.createElement('p');
  private readonly button = document.createElement('button');
  private line = 0;

  constructor(ctx: GameContext, container: HTMLElement, position: THREE.Vector3, playerStart: THREE.Vector3) {
    const ground = ctx.physics.groundHeight(position.x, position.z, position.y, .25).y;
    this.position = position.clone();
    if (Number.isFinite(ground)) this.position.y = ground;
    this.view = new TravelerView(ctx, this.position, playerStart);

    this.panel.className = 'traveler-dialogue';
    this.panel.hidden = true;
    const name = document.createElement('strong');
    name.textContent = 'Bento, o viajante';
    this.dialogue.setAttribute('aria-live', 'polite');
    this.dialogue.hidden = true;
    this.button.type = 'button';
    this.button.textContent = 'Conversar';
    this.button.addEventListener('click', () => this.talk());
    this.panel.append(name, this.dialogue, this.button);
    container.append(this.panel);
  }

  talk() {
    if (this.panel.hidden) return;
    this.view.startTalking();
    this.dialogue.hidden = false;
    this.dialogue.textContent = LINES[this.line];
    this.line = (this.line + 1) % LINES.length;
  }

  update(dt: number, player: { position: THREE.Vector3 } | null, camera: THREE.Camera, buffer: THREE.Vector2, active: boolean, touch: boolean) {
    const dx = (player?.position.x ?? this.position.x) - this.position.x;
    const dz = (player?.position.z ?? this.position.z) - this.position.z;
    const distance = Math.hypot(dx, dz);
    const nearby = active && player && distance < 2.85 && Math.abs(player.position.y - this.position.y) < 1.25;
    this.panel.hidden = !nearby;
    if (!nearby) {
      this.dialogue.hidden = true;
      this.view.stopTalking();
    }
    const label = touch ? 'Conversar' : 'Conversar [E]';
    if (this.button.textContent !== label) this.button.textContent = label;

    this.view.update(dt, active ? player : null, camera, buffer);
  }

  dispose() {
    this.panel.remove();
    this.view.dispose();
  }
}
