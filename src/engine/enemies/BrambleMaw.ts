import * as THREE from 'three';
import type { GameContext } from '../core/Context';
import { emptyResult, type HitInfo, type HitResult } from '../combat/types';
import { angleDelta, damp, dampAngle } from '../core/math';
import { CharacterMotor } from '../physics/CharacterMotor';
import { BasePixelAnimal } from './Animals';
import { sampleAnimalCycle } from './AnimalAnimation';
import { getBrambleMawPosePack, MAW_BITE, MAW_CENTER, MAW_IDLE, MAW_PH, MAW_PW, MAW_ROOTS, MAW_SIZE, MAW_SWEEP, MAW_WALK } from './BrambleMawSprites';

type Target = Parameters<BasePixelAnimal['update']>[1];
const BITE_RANGE = 2.15;
const BITE_INTERVAL = .235;
type BossAttack = 'bite' | 'sweep' | 'roots';
const ATTACKS = {
  bite: { windup: BITE_INTERVAL * 2, duration: BITE_INTERVAL * MAW_BITE.length },
  sweep: { windup: .85, duration: 1.26 },
  roots: { windup: 1.05, duration: 1.5 },
};
const ATTACK_POSES = { bite: MAW_BITE, sweep: MAW_SWEEP, roots: MAW_ROOTS };
const PATTERN: readonly BossAttack[] = ['bite', 'sweep', 'roots'];
const FINAL_PATTERN: readonly BossAttack[] = ['roots', 'bite', 'sweep', 'bite'];

export class BrambleMaw extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  private readonly home: THREE.Vector3;
  private readonly offset = new THREE.Vector3();
  private readonly origin = new THREE.Vector3();
  private readonly point = new THREE.Vector3();
  private age = 0;
  private stride = 0;
  private attackTime = -1;
  private cooldown = 0;
  private attack: BossAttack = 'bite';
  private turn = 0;
  readonly bossName = 'Flor-de-Espinhos';
  engaged = false;
  private fierceAttack = false;
  get enraged() { return this.hp <= this.maxHp * .5; }
  private readonly ringGeometry = new THREE.RingGeometry(.90, 1, 48);
  private readonly ringMaterial = new THREE.MeshBasicMaterial({
    color: 0xffb03f, side: THREE.DoubleSide, transparent: true, opacity: .8, depthWrite: false,
  });
  private readonly hazardGeometry = new THREE.ConeGeometry(.20, .95, 5);
  private readonly hazardMaterial = new THREE.MeshStandardMaterial({ color: 0x7d522c, flatShading: true });
  private readonly markers: THREE.Mesh[] = [];
  private readonly spikes: THREE.Mesh[] = [];

  get position() { return this.motor.position; }

  constructor(ctx: GameContext, start: THREE.Vector3) {
    super(ctx, getBrambleMawPosePack('idle0').getView(4, 0)!, MAW_PW, MAW_PH, MAW_SIZE, MAW_SIZE, 'BrambleMawBillboard');
    this.hp = this.maxHp = 300;
    this.motor = new CharacterMotor(ctx.physics);
    this.motor.radius = .70;
    this.motor.height = 2.1;
    this.motor.teleport(start);
    this.bindAnimalMotor(this.motor);
    this.home = start.clone();
    this.facing = Math.PI;
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: .70, tag: 'body' });
    for (let i = 0; i < 5; i++) {
      const ring = new THREE.Mesh(this.ringGeometry, this.ringMaterial);
      ring.rotation.x = -Math.PI / 2;
      ring.visible = false;
      this.markers.push(ring);
      const spike = new THREE.Mesh(this.hazardGeometry, this.hazardMaterial);
      spike.visible = false;
      this.spikes.push(spike);
      ctx.scene.add(ring, spike);
    }
    this.syncBody();
  }

  center(out: THREE.Vector3) {
    out.copy(this.position);
    out.y += 1.42;
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
    this.engaged = true;
    this.alive = this.hp > 0;
    result.killed = !this.alive;
    this.syncBody();
    return result;
  }

  update(dt: number, target: Target, camera: THREE.Camera, buffer?: THREE.Vector2) {
    if (dt > 0) {
      this.age += dt;
      this.flash = Math.max(0, this.flash - 5 * dt);
      this.cooldown = Math.max(0, this.cooldown - dt);
      const speed = this.alive ? this.advanceBehavior(dt, target) : 0;
      if (!this.alive) this.deadT += dt;
      const vel = this.motor.velocity;
      vel.x = damp(vel.x, Math.sin(this.facing) * speed, 12, dt);
      vel.z = damp(vel.z, Math.cos(this.facing) * speed, 12, dt);
      vel.y -= 22 * dt;
      this.motor.update(dt);
      this.stride += this.motor.horizontalSpeed * dt * 2.4;
      this.syncBody();
    }
    this.updateTelegraph();
    const progress = this.attackTime / this.attackDuration;
    const pose = this.attackTime >= 0 && this.alive
      ? ATTACK_POSES[this.attack][progress < .22 ? 0 : this.attackTime < this.windup ? 1 : progress < .76 ? 2 : 3]
      : this.motor.horizontalSpeed > .22 && this.alive
        ? sampleAnimalCycle(MAW_WALK, this.stride)
        : sampleAnimalCycle(MAW_IDLE, this.age * 1.4);
    this.renderBillboard(getBrambleMawPosePack(pose), this.position.y + MAW_CENTER, camera, buffer);
  }

  private get windup() { return ATTACKS[this.attack].windup * (this.fierceAttack ? .78 : 1); }
  private get attackDuration() { return ATTACKS[this.attack].duration * (this.fierceAttack ? .82 : 1); }

  private updateTelegraph() {
    const active = this.alive && this.attackTime >= 0 && this.attack !== 'bite';
    const size = this.attack === 'sweep' ? 3 : .85;
    const count = this.attack === 'sweep' ? 1 : this.fierceAttack ? 5 : 3;
    this.ringMaterial.color.setHex(this.fierceAttack ? 0xff6044 : 0xffb03f);
    this.ringMaterial.opacity = .58 + .32 * Math.sin(Math.max(0, this.attackTime) * 18) ** 2;
    this.markers.forEach((ring, i) => {
      const sweeping = this.attack === 'sweep' && this.attackTime >= this.windup;
      ring.visible = active && i < count && (!sweeping ? this.attackTime < this.windup : this.attackTime < this.windup + .21);
      ring.scale.setScalar(sweeping ? size * THREE.MathUtils.clamp((this.attackTime - this.windup) / .18, .27, 1) : size);
      const spike = this.spikes[i];
      spike.visible = active && this.attack === 'roots' && i < count && this.attackTime >= this.windup;
      if (spike.visible) {
        const rise = Math.sin(THREE.MathUtils.clamp((this.attackTime - this.windup) / (this.attackDuration - this.windup), 0, 1) * Math.PI);
        spike.scale.set(1, Math.max(.01, rise), 1);
        spike.position.copy(ring.position).y += rise * .45;
      }
    });
  }

  private syncBody() {
    const body = this.hurtboxes[0];
    body.a.copy(this.position).y += .65;
    body.b.copy(this.position).y += 1.85;
    body.enabled = this.alive;
    this.center(this.stickRoot.position);
    this.stickRoot.rotation.y = this.facing;
  }

  private advanceBehavior(dt: number, target: Target) {
    if (this.attackTime >= 0) {
      const before = this.attackTime;
      this.attackTime += dt;
      if (before < this.windup && this.attackTime >= this.windup && target?.alive) this.strike(target);
      if (this.attackTime >= this.attackDuration) {
        this.cooldown = this.enraged ? .64 : 1.07;
        this.attackTime = -1;
      }
      return 0;
    }

    const nearby = target?.alive && target.position.distanceToSquared(this.position) < 9 ** 2;
    const destination = nearby && this.position.distanceToSquared(this.home) < 12 ** 2 ? target.position : this.home;
    const chasing = destination !== this.home;
    this.engaged = chasing;
    const delta = this.offset.subVectors(destination, this.position);
    const range = Math.hypot(delta.x, delta.z);
    if (range < .5 && !chasing) return 0;
    const yaw = Math.atan2(delta.x, delta.z);
    this.facing = dampAngle(this.facing, yaw, 5, dt);
    const pattern = this.enraged ? FINAL_PATTERN : PATTERN;
    const next = pattern[this.turn % pattern.length];
    const attackRange = next === 'roots' ? 7 : next === 'sweep' ? 2.75 : BITE_RANGE;
    if (chasing && range < attackRange) {
      if (target?.alive && this.motor.grounded && this.cooldown === 0 &&
          Math.abs(delta.y) < 1.1 && Math.abs(angleDelta(this.facing, yaw)) < .36) {
        this.attack = next;
        this.fierceAttack = this.enraged;
        this.attackTime = 0;
        this.turn++;
        this.placeMarkers(target);
      }
      return 0;
    }
    return chasing ? 2.2 : 1.4;
  }

  private placeMarkers(target: NonNullable<Target>) {
    const sideX = Math.cos(this.facing);
    const sideZ = -Math.sin(this.facing);
    this.markers.forEach((ring, i) => {
      ring.position.copy(this.attack === 'sweep' ? this.position : target.position);
      if (this.attack === 'roots') {
        const offset = [0, 1.18, -1.18, 2.36, -2.36][i];
        ring.position.x += sideX * offset;
        ring.position.z += sideZ * offset;
      }
      const ground = this.ctx.physics.groundHeight(ring.position.x, ring.position.z, ring.position.y, .3).y;
      ring.position.y = (Number.isFinite(ground) ? ground : ring.position.y) + .08;
    });
  }

  private strike(target: NonNullable<Target>) {
    const offset = this.offset.subVectors(target.position, this.position);
    const dir = new THREE.Vector3(Math.sin(this.facing), 0, Math.cos(this.facing));
    if (this.attack === 'bite') {
      const forward = offset.dot(dir);
      const lateral = Math.abs(offset.x * dir.z - offset.z * dir.x);
      if (forward < 0 || forward > BITE_RANGE + .18 || lateral > 1.03 || Math.abs(offset.y) > 1.15) return;
    } else if (this.attack === 'sweep') {
      if (Math.hypot(offset.x, offset.z) > 3 || Math.abs(offset.y) > .92) return;
      dir.copy(offset).setY(0).normalize();
    } else {
      const count = this.fierceAttack ? 5 : 3;
      const root = this.markers.slice(0, count).find(({ position: p }) =>
        Math.hypot(p.x - target.position.x, p.z - target.position.z) <= .85 &&
        Math.abs(p.y - target.position.y) < 1.15);
      if (!root) return;
      dir.subVectors(target.position, root.position).setY(0).normalize();
      if (dir.lengthSq() < .001) dir.set(Math.sin(this.facing), 0, Math.cos(this.facing));
    }
    const origin = this.center(this.origin);
    const point = target.center(this.point);
    const distance = offset.subVectors(point, origin).length();
    if (this.attack !== 'roots' && distance > 0 && this.ctx.physics.raycast(origin, offset.divideScalar(distance), distance)) return;
    const baseDamage = this.attack === 'bite' ? 24 : this.attack === 'sweep' ? 18 : 20;
    const hit: HitInfo = {
      attacker: this, team: 'enemy', tool: 'club', damage: baseDamage + (this.fierceAttack ? 6 : 0), strength: .82, knockback: 5.8,
      point: point.clone(), dir, normal: dir.clone().negate(), hurtbox: target.hurtboxes[0],
      projectile: false, charged: false, origin: origin.clone(),
    };
    const result = target.receiveHit(hit);
    if (!result.ignored) this.ctx.events.emit('hit', { hit, result, target, source: 'enemy' });
  }

  dispose() {
    for (const mesh of [...this.markers, ...this.spikes]) mesh.removeFromParent();
    this.ringGeometry.dispose();
    this.ringMaterial.dispose();
    this.hazardGeometry.dispose();
    this.hazardMaterial.dispose();
    super.dispose();
  }
}
