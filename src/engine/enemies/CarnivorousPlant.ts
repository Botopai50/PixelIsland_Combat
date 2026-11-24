import * as THREE from 'three';
import type { GameContext } from '../core/Context';
import { emptyResult, type HitInfo, type HitResult } from '../combat/types';
import { angleDelta, dampAngle } from '../core/math';
import { BasePixelAnimal } from './Animals';
import { getPlantPosePack, PLANT_CENTER_Y, PLANT_H, PLANT_PH, PLANT_PW, PLANT_W, type PlantPose } from './PlantSprites';

type Target = Parameters<BasePixelAnimal['update']>[1];
const IDLE = ['idle0', 'idle1', 'idle0', 'idle2'] as const;
const BITE = ['bite0', 'bite1', 'bite2', 'bite3'] as const;
const BITE_RANGE = 2.45;
const FRAME_TIME = .20;
const STRIKE_TIME = FRAME_TIME * 2;

/** Rooted ambush enemy. It commits to a direction before snapping its trap. */
export class CarnivorousPlant extends BasePixelAnimal {
  readonly position: THREE.Vector3;
  private idleTime = 0;
  private attackTime = -1;
  private cooldown = 0;
  private readonly offset = new THREE.Vector3();
  private readonly origin = new THREE.Vector3();
  private readonly impact = new THREE.Vector3();

  constructor(ctx: GameContext, position: THREE.Vector3) {
    super(ctx, getPlantPosePack('idle0').getView(4, 0)!, PLANT_PW, PLANT_PH, PLANT_W, PLANT_H, 'CarnivorousPlantBillboard');
    this.position = position.clone();
    const ground = ctx.physics.groundHeight(position.x, position.z, position.y, .4).y;
    if (Number.isFinite(ground)) this.position.y = ground;

    this.hp = this.maxHp = 100;
    this.stickRoot.position.copy(this.position);
    this.hurtboxes.push({
      a: this.position.clone().add(new THREE.Vector3(0, .25, 0)),
      b: this.position.clone().add(new THREE.Vector3(0, 1.75, 0)),
      radius: .43, tag: 'body',
    });
  }

  center(out: THREE.Vector3) {
    out.copy(this.position);
    out.y += 1.45;
    return out;
  }

  receiveHit(hit: HitInfo): HitResult {
    const result = emptyResult();
    if (!this.alive) {
      result.ignored = true;
      return result;
    }
    result.damage = Math.min(this.hp, hit.damage);
    this.hp -= result.damage;
    this.flash = 1;
    if (this.hp <= 0) {
      this.alive = false;
      this.hurtboxes[0].enabled = false;
      result.killed = true;
    }
    return result;
  }

  update(dt: number, target: Target, camera: THREE.Camera, buffer?: THREE.Vector2) {
    if (!this.alive) return;
    if (dt > 0) {
      this.flash = Math.max(0, this.flash - dt * 5);
      this.idleTime += dt;
      this.cooldown = Math.max(0, this.cooldown - dt);
      if (this.attackTime < 0) {
        if (target?.alive) {
          const toTarget = this.offset.subVectors(target.position, this.position);
          const range = Math.hypot(toTarget.x, toTarget.z);
          if (range < 5) {
            const aim = Math.atan2(toTarget.x, toTarget.z);
            this.facing = dampAngle(this.facing, aim, 5, dt);
            if (this.cooldown === 0 && range < BITE_RANGE && Math.abs(toTarget.y) < 1.25 &&
                Math.abs(angleDelta(this.facing, aim)) < .28) this.attackTime = 0;
          }
        }
      } else {
        const before = this.attackTime;
        this.attackTime += dt;
        if (before < STRIKE_TIME && this.attackTime >= STRIKE_TIME && target?.alive) this.bite(target);
        if (this.attackTime >= FRAME_TIME * BITE.length) {
          this.attackTime = -1;
          this.cooldown = 1.5;
        }
      }
    }
    const pose: PlantPose = this.attackTime < 0
      ? IDLE[Math.floor(this.idleTime * 3) % IDLE.length]
      : BITE[Math.floor(this.attackTime / FRAME_TIME)];
    this.renderBillboard(getPlantPosePack(pose), this.position.y + PLANT_CENTER_Y, camera, buffer);
  }

  private bite(target: NonNullable<Target>) {
    const offset = this.offset.subVectors(target.position, this.position);
    const forward = offset.x * Math.sin(this.facing) + offset.z * Math.cos(this.facing);
    const sideways = offset.x * Math.cos(this.facing) - offset.z * Math.sin(this.facing);
    if (forward < -.1 || forward > BITE_RANGE || Math.abs(sideways) > .83 || Math.abs(offset.y) >= 1.25) return;
    const origin = this.center(this.origin);
    const point = target.center(this.impact);
    const distance = offset.subVectors(point, origin).length();
    if (distance > 0 && this.ctx.physics.raycast(origin, offset.divideScalar(distance), distance)) return;
    const dir = new THREE.Vector3(Math.sin(this.facing), 0, Math.cos(this.facing));
    const hit: HitInfo = {
      attacker: this, team: 'enemy', tool: 'club', damage: 20, strength: .8, knockback: 6,
      point: point.clone(), dir, normal: dir.clone().negate(), hurtbox: target.hurtboxes[0],
      projectile: false, charged: false, origin: origin.clone(),
    };
    const result = target.receiveHit(hit);
    if (!result.ignored) this.ctx.events.emit('hit', { hit, result, target, source: 'enemy' });
  }
}
