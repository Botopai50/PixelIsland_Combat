import * as THREE from 'three';
import type { GameContext } from '../core/Context';
import { emptyResult } from '../combat/types';
import { dampAngle } from '../core/math';
import { BasePixelAnimal } from '../enemies/Animals';
import { sampleAnimalCycle } from '../enemies/AnimalAnimation';
import { getTravelerPosePack, TRAVELER_CENTER, TRAVELER_IDLE, TRAVELER_PH, TRAVELER_PW, TRAVELER_SIZE, TRAVELER_TALK } from '../enemies/TravelerSprites';

type PlayerTarget = Parameters<BasePixelAnimal['update']>[1];

const LINES = [
  'Sou Bento. A Flor-de-Espinhos ronda a clareira perto do lago. Já vi aquela coisa arrancar pedras do chão.',
  'Quando o chão acender, saia dos círculos. As raízes brotam onde você estava quando ela começou o ataque.',
  'Quando estiver ferida, a flor ataca mais depressa. Espere o golpe passar antes de chegar perto.',
];

export class Traveler extends BasePixelAnimal {
  readonly position: THREE.Vector3;
  private age = 0;
  private talkTime = 0;
  private readonly panel = document.createElement('aside');
  private readonly dialogue = document.createElement('p');
  private readonly button = document.createElement('button');
  private line = 0;

  constructor(ctx: GameContext, container: HTMLElement, position: THREE.Vector3, playerStart: THREE.Vector3) {
    super(ctx, getTravelerPosePack('idle0').getView(4, 0)!, TRAVELER_PW, TRAVELER_PH, TRAVELER_SIZE, TRAVELER_SIZE, 'BentoBillboard');
    const ground = ctx.physics.groundHeight(position.x, position.z, position.y, .25).y;
    this.position = position.clone();
    if (Number.isFinite(ground)) this.position.y = ground;
    this.facing = Math.atan2(playerStart.x - position.x, playerStart.z - position.z);
    this.team = 'neutral';
    this.lockable = false;

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
    this.talkTime = 1.5;
    this.dialogue.hidden = false;
    this.dialogue.textContent = LINES[this.line];
    this.line = (this.line + 1) % LINES.length;
  }

  center(out: THREE.Vector3) {
    return out.copy(this.position).setY(this.position.y + TRAVELER_CENTER);
  }

  receiveHit() {
    return { ...emptyResult(), ignored: true };
  }

  update(dt: number, player: PlayerTarget, camera: THREE.Camera, buffer?: THREE.Vector2, active = false, touch = false) {
    const dx = (player?.position.x ?? this.position.x) - this.position.x;
    const dz = (player?.position.z ?? this.position.z) - this.position.z;
    const distance = Math.hypot(dx, dz);
    if (player && active && distance > .07 && distance < 5) {
      this.facing = dampAngle(this.facing, Math.atan2(dx, dz), 5, dt);
    }
    const nearby = active && player && distance < 2.85 && Math.abs(player.position.y - this.position.y) < 1.25;
    this.panel.hidden = !nearby;
    if (!nearby) {
      this.dialogue.hidden = true;
      this.talkTime = 0;
    }
    const label = touch ? 'Conversar' : 'Conversar [E]';
    if (this.button.textContent !== label) this.button.textContent = label;

    this.age += dt;
    this.talkTime = Math.max(0, this.talkTime - dt);
    const pose = this.talkTime > 0
      ? sampleAnimalCycle(TRAVELER_TALK, (1.5 - this.talkTime) * 3)
      : sampleAnimalCycle(TRAVELER_IDLE, this.age * 1.05);
    this.renderBillboard(getTravelerPosePack(pose), this.position.y + TRAVELER_CENTER, camera, buffer);
  }

  dispose() {
    this.panel.remove();
    super.dispose();
  }
}
