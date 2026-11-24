import * as THREE from 'three';
import { emptyResult, type Team } from '../combat/types';
import type { GameContext } from '../core/Context';
import { dampAngle } from '../core/math';
import { BasePixelAnimal } from '../enemies/Animals';
import {
  getTravelerPosePack, TRAVELER_CENTER, TRAVELER_IDLE, TRAVELER_IDLE_FPS,
  TRAVELER_PX, TRAVELER_SIZE, TRAVELER_TALK, TRAVELER_TALK_FPS,
} from './TravelerSprites';

export class TravelerView extends BasePixelAnimal {
  override team: Team = 'neutral';
  override lockable = false;
  readonly position: THREE.Vector3;
  private idleTime = 0;
  private talkTime = 0;

  constructor(ctx: GameContext, position: THREE.Vector3, playerStart: THREE.Vector3) {
    super(ctx, getTravelerPosePack('idle0').getView(4, 0)!, TRAVELER_PX, TRAVELER_PX,
      TRAVELER_SIZE, TRAVELER_SIZE, 'Bento');
    this.position = position;
    this.facing = Math.atan2(playerStart.x - position.x, playerStart.z - position.z);
  }

  startTalking() {
    this.talkTime = TRAVELER_TALK.length / TRAVELER_TALK_FPS;
  }

  stopTalking() {
    this.talkTime = 0;
  }

  update(dt: number, player: { position: THREE.Vector3 } | null, camera: THREE.Camera, buffer?: THREE.Vector2) {
    if (player) {
      const dx = player.position.x - this.position.x;
      const dz = player.position.z - this.position.z;
      const distance = Math.hypot(dx, dz);
      if (distance > .07 && distance < 5) {
        this.facing = dampAngle(this.facing, Math.atan2(dx, dz), 4, dt);
      }
    }

    this.idleTime += dt;
    const idleFrame = Math.floor(this.idleTime * TRAVELER_IDLE_FPS) % TRAVELER_IDLE.length;
    const talkFrame = Math.max(0, TRAVELER_TALK.length - Math.ceil(this.talkTime * TRAVELER_TALK_FPS));
    const pose = this.talkTime > 0 ? TRAVELER_TALK[talkFrame] : TRAVELER_IDLE[idleFrame];
    this.renderBillboard(getTravelerPosePack(pose), this.position.y + TRAVELER_CENTER, camera, buffer);
    this.talkTime = Math.max(0, this.talkTime - dt);
  }

  center(out: THREE.Vector3) {
    out.copy(this.position);
    out.y += TRAVELER_CENTER;
    return out;
  }

  receiveHit() {
    return { ...emptyResult(), ignored: true };
  }
}
