import * as THREE from 'three';
import type { GameContext } from '../core/Context';
import { emptyResult, type HitInfo } from '../combat/types';
import { angleDelta, damp, dampAngle } from '../core/math';
import { CharacterMotor } from '../physics/CharacterMotor';
import { BasePixelAnimal } from './Animals';
import { sampleAnimalCycle } from './AnimalAnimation';
import {
  getThornUrsaPosePack, URSA_CENTER, URSA_CHARGE, URSA_IDLE, URSA_PH, URSA_PW, URSA_ROOTS, URSA_SIZE, URSA_SLAM, URSA_WALK,
} from './ThornUrsaSprites';

type Target = NonNullable<Parameters<BasePixelAnimal['update']>[1]>;
type AttackName = 'charge' | 'slam' | 'roots';
const ATTACKS = {
  charge: { poses: URSA_CHARGE, range: 8, windup: .92, active: .66, damage: 28 },
  slam: { poses: URSA_SLAM, range: 3.25, windup: 1.14, active: .32, damage: 32 },
  roots: { poses: URSA_ROOTS, range: 10, windup: 1.22, active: .52, damage: 23 },
};
const PATTERN: readonly AttackName[] = ['charge', 'slam', 'roots'];
const FIERCE_PATTERN: readonly AttackName[] = ['roots', 'charge', 'slam', 'charge'];
const SPRINT_POSES = URSA_CHARGE.slice(2, 5);
const CHARGE_SPEED = 10.8;
const CHARGE_HALF_WIDTH = 1.13;
const SLAM_RADIUS = 3.6;
const ROOT_RADIUS = 1.1;
const ROOT_OFFSETS = [0, 1.78, -1.78, 3.56, -3.56];

interface Attack {
  name: AttackName;
  age: number;
  windup: number;
  fierce: boolean;
  hit: boolean;
  stopped: boolean;
}

export class ThornUrsa extends BasePixelAnimal {
  readonly bossName = 'Urso de Espinhos';
  engaged = false;
  get enraged() { return this.hp <= this.maxHp * .5; }
  get position() { return this.motor.position; }

  private readonly motor: CharacterMotor;
  private readonly home: THREE.Vector3;
  private readonly previous = new THREE.Vector3();
  private readonly forward = new THREE.Vector3();
  private readonly delta = new THREE.Vector3();
  private readonly point = new THREE.Vector3();
  private readonly origin = new THREE.Vector3();
  private readonly attacks = new THREE.Group();
  private readonly ringGeometry = new THREE.RingGeometry(.89, 1, 36);
  private readonly laneGeometry = new THREE.BoxGeometry(CHARGE_HALF_WIDTH * 2, .018, 1);
  private readonly rootGeometry = new THREE.ConeGeometry(.135, 1.16, 5);
  private readonly warningMaterial = new THREE.MeshBasicMaterial({
    color: 0xffac43, side: THREE.DoubleSide, transparent: true, depthWrite: false, opacity: .65,
  });
  private readonly rootMaterial = new THREE.MeshStandardMaterial({
    color: 0x675c29, emissive: 0x838e28, emissiveIntensity: .28, flatShading: true,
  });
  private readonly lane = new THREE.Mesh(this.laneGeometry, this.warningMaterial);
  private readonly rings = ROOT_OFFSETS.map(() => new THREE.Mesh(this.ringGeometry, this.warningMaterial));
  private readonly roots = ROOT_OFFSETS.map(() => {
    const cluster = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const thorn = new THREE.Mesh(this.rootGeometry, this.rootMaterial);
      const a = i * Math.PI * 2 / 3;
      thorn.position.set(Math.cos(a) * .32, .53, Math.sin(a) * .32);
      thorn.rotation.set(Math.sin(a) * .21, 0, -Math.cos(a) * .21);
      cluster.add(thorn);
    }
    return cluster;
  });
  private attack?: Attack;
  private age = 0;
  private stride = 0;
  private turn = 0;
  private cooldown = 0;

  constructor(ctx: GameContext, start: THREE.Vector3) {
    super(ctx, getThornUrsaPosePack('idle0').getView(4, 0)!, URSA_PW, URSA_PH, URSA_SIZE, URSA_SIZE, 'ThornUrsaBillboard');
    this.hp = this.maxHp = 420;
    this.motor = new CharacterMotor(ctx.physics);
    this.motor.height = 2.6;
    this.motor.radius = .95;
    this.motor.teleport(start);
    this.bindAnimalMotor(this.motor);
    this.home = start.clone();
    this.facing = Math.PI;
    this.hurtboxes.push(
      { a: new THREE.Vector3(), b: new THREE.Vector3(), radius: .94, tag: 'body' },
      { a: new THREE.Vector3(), b: new THREE.Vector3(), radius: .64, tag: 'body' },
    );
    for (const ring of this.rings) ring.rotation.x = -Math.PI / 2;
    this.attacks.add(this.lane, ...this.rings, ...this.roots);
    this.attacks.visible = false;
    this.ctx.scene.add(this.attacks);
    this.syncBody();
  }

  center(out: THREE.Vector3) {
    return out.copy(this.position).setY(this.position.y + 1.43);
  }

  receiveHit(hit: HitInfo) {
    const result = emptyResult();
    if (!this.alive) return { ...result, ignored: true };
    result.damage = Math.min(this.hp, hit.damage);
    this.hp -= result.damage;
    this.flash = 1;
    this.engaged = true;
    this.alive = this.hp > 0;
    result.killed = !this.alive;
    this.syncBody();
    return result;
  }

  update(dt: number, target: Target | null, camera: THREE.Camera, buffer?: THREE.Vector2) {
    if (dt > 0 && this.alive) {
      this.age += dt;
      this.cooldown = Math.max(0, this.cooldown - dt);
      this.flash = Math.max(0, this.flash - dt * 4.5);
      if (!target?.alive && this.attack) this.finishAttack();
      const speed = this.attack ? this.advanceAttack(dt, target) : this.pursue(dt, target);
      const dashing = speed === CHARGE_SPEED;
      const velocity = this.motor.velocity;
      this.forward.set(Math.sin(this.facing), 0, Math.cos(this.facing));
      velocity.x = dashing ? this.forward.x * speed : damp(velocity.x, this.forward.x * speed, 12, dt);
      velocity.z = dashing ? this.forward.z * speed : damp(velocity.z, this.forward.z * speed, 12, dt);
      velocity.y -= 22 * dt;
      this.previous.copy(this.position);
      this.motor.update(dt);
      if (dashing && this.attack) {
        if (target?.alive && this.chargeTouches(target)) this.dealDamage(this.attack, target);
        const forwardDistance = this.delta.subVectors(this.position, this.previous).dot(this.forward);
        if (forwardDistance < speed * dt * .35) {
          this.attack.stopped = true;
          this.motor.velocity.setX(0).setZ(0);
        }
      }
      this.stride += this.motor.horizontalSpeed * dt * 2.15;
      this.syncBody();
    }
    this.renderWarnings();
    const attack = this.attack;
    const pose = attack
      ? this.attackPose(attack)
      : this.motor.horizontalSpeed > .25
        ? sampleAnimalCycle(URSA_WALK, this.stride)
        : sampleAnimalCycle(URSA_IDLE, this.age);
    this.renderBillboard(getThornUrsaPosePack(pose), this.position.y + URSA_CENTER, camera, buffer);
  }

  private attackPose(attack: Attack) {
    const definition = ATTACKS[attack.name];
    if (attack.age < attack.windup) return definition.poses[attack.age < attack.windup * .31 ? 0 : 1];
    const elapsed = attack.age - attack.windup;
    if (attack.stopped || elapsed >= definition.active) return definition.poses.at(-1)!;
    return attack.name === 'charge'
      ? SPRINT_POSES[Math.floor(elapsed * 12) % SPRINT_POSES.length]
      : definition.poses[2];
  }

  private syncBody() {
    this.forward.set(Math.sin(this.facing), 0, Math.cos(this.facing));
    const [body, head] = this.hurtboxes;
    body.a.copy(this.position).addScaledVector(this.forward, -.50).y += .9;
    body.b.copy(this.position).addScaledVector(this.forward, .41).y += 1.22;
    head.a.copy(this.position).addScaledVector(this.forward, .86).y += 1.47;
    head.b.copy(this.position).addScaledVector(this.forward, 1.45).y += 1.53;
    body.enabled = head.enabled = this.alive;
    this.center(this.stickRoot.position);
    this.stickRoot.rotation.y = this.facing;
  }

  private pursue(dt: number, target: Target | null) {
    const inTerritory = target?.alive && target.position.distanceToSquared(this.home) < 16 ** 2
      && target.position.distanceToSquared(this.position) < 12 ** 2;
    this.engaged = !!inTerritory;
    const goal = inTerritory ? target.position : this.home;
    const delta = this.delta.subVectors(goal, this.position);
    const range = Math.hypot(delta.x, delta.z);
    if (!inTerritory && range < .45) return 0;
    const yaw = Math.atan2(delta.x, delta.z);
    this.facing = dampAngle(this.facing, yaw, 5, dt);
    if (!inTerritory) return 1.7;

    const pattern = this.enraged ? FIERCE_PATTERN : PATTERN;
    const next = pattern[this.turn % pattern.length];
    if (this.cooldown > 0) return range > 4.1 ? 1.9 : 0;
    if (range < ATTACKS[next].range) {
      if (Math.abs(delta.y) < 1.25 && this.motor.grounded && Math.abs(angleDelta(this.facing, yaw)) < .27) {
        this.beginAttack(next, target);
      }
      return 0;
    }
    return this.enraged ? 3.05 : 2.5;
  }

  private beginAttack(name: AttackName, target: Target) {
    const fierce = this.enraged;
    this.attack = { name, fierce, windup: ATTACKS[name].windup * (fierce ? .80 : 1), age: 0, hit: false, stopped: false };
    this.turn++;
    this.motor.velocity.setX(0).setZ(0);
    if (name === 'charge') {
      const length = CHARGE_SPEED * ATTACKS.charge.active;
      const distance = length * .5;
      this.lane.position.set(this.position.x + Math.sin(this.facing) * distance, this.position.y + .065,
        this.position.z + Math.cos(this.facing) * distance);
      this.lane.rotation.y = this.facing;
      this.lane.scale.z = length;
      return;
    }
    const x = Math.cos(this.facing), z = -Math.sin(this.facing);
    const count = name === 'slam' ? 1 : fierce ? 5 : 3;
    for (let i = 0; i < count; i++) {
      const ring = this.rings[i];
      ring.position.copy(name === 'slam' ? this.position : target.position);
      if (name === 'roots') {
        ring.position.x += x * ROOT_OFFSETS[i];
        ring.position.z += z * ROOT_OFFSETS[i];
      }
      const ground = this.ctx.physics.groundHeight(ring.position.x, ring.position.z, ring.position.y, .2).y;
      if (Number.isFinite(ground)) ring.position.y = ground;
      ring.position.y += .075;
    }
  }

  private advanceAttack(dt: number, target: Target | null) {
    const attack = this.attack!;
    const def = ATTACKS[attack.name];
    const elapsed = attack.age;
    attack.age += dt;
    if (target?.alive && attack.name !== 'charge' && elapsed < attack.windup && attack.age >= attack.windup) {
      const count = attack.name === 'slam' ? 1 : attack.fierce ? 5 : 3;
      const radius = attack.name === 'slam' ? SLAM_RADIUS : ROOT_RADIUS;
      const inside = this.rings.slice(0, count).some(({ position }) =>
        Math.abs(target.position.y - position.y) < 1.05 &&
        Math.hypot(target.position.x - position.x, target.position.z - position.z) < radius);
      if (inside) this.dealDamage(attack, target);
    }
    if (attack.age >= attack.windup + def.active + (attack.fierce ? .33 : .61)) this.finishAttack();
    if (attack.name !== 'charge') return 0;
    if (attack.age < attack.windup || elapsed >= attack.windup + def.active || attack.stopped) {
      this.motor.velocity.setX(0).setZ(0);
      return 0;
    }
    return CHARGE_SPEED;
  }

  private finishAttack() {
    this.attack = undefined;
    this.cooldown = this.enraged ? .58 : .96;
  }

  private chargeTouches(target: Target) {
    if (Math.abs(target.position.y - this.position.y) > 1.15) return false;
    const step = this.delta.subVectors(this.position, this.previous).dot(this.forward);
    const offset = this.point.subVectors(target.position, this.previous);
    const along = offset.dot(this.forward);
    const across = Math.abs(offset.x * this.forward.z - offset.z * this.forward.x);
    return along >= -.40 && along <= Math.max(0, step) + .92 && across <= CHARGE_HALF_WIDTH;
  }

  private dealDamage(attack: Attack, target: Target) {
    if (attack.hit) return;
    const origin = this.center(this.origin);
    const point = target.center(this.point);
    const offset = this.delta.subVectors(point, origin);
    const distance = offset.length();
    if (attack.name !== 'roots' && distance > 0 &&
        this.ctx.physics.raycast(origin, offset.divideScalar(distance), distance)) return;
    attack.hit = true;
    const direction = point.clone().sub(origin).setY(0).normalize();
    if (direction.lengthSq() === 0) direction.copy(this.forward);
    const hit: HitInfo = {
      attacker: this, team: 'enemy', tool: 'club', damage: ATTACKS[attack.name].damage + (attack.fierce ? 7 : 0),
      knockback: attack.name === 'charge' ? 8.2 : 5.5, strength: .91,
      point: point.clone(), dir: direction, normal: direction.clone().negate(), hurtbox: target.hurtboxes[0],
      projectile: false, charged: attack.name === 'charge', origin: origin.clone(),
    };
    const result = target.receiveHit(hit);
    if (!result.ignored) this.ctx.events.emit('hit', { hit, result, target, source: 'enemy' });
  }

  private renderWarnings() {
    const attack = this.attack;
    this.attacks.visible = !!attack && this.alive;
    if (!attack || !this.alive) return;
    const progress = attack.age - attack.windup;
    const roots = attack.name === 'roots';
    const count = attack.name === 'charge' ? 0 : roots ? attack.fierce ? 5 : 3 : 1;
    this.warningMaterial.color.setHex(attack.fierce ? 0xff6252 : 0xffb849);
    this.warningMaterial.opacity = .48 + .29 * Math.sin(attack.age * 17) ** 2;
    this.lane.visible = attack.name === 'charge' && progress < 0;
    this.rings.forEach((ring, i) => {
      const burst = !roots && progress >= 0 && progress < .23;
      ring.visible = i < count && (progress < 0 || burst);
      ring.scale.setScalar(roots ? ROOT_RADIUS : burst ? SLAM_RADIUS * (.35 + .65 * progress / .23) : SLAM_RADIUS);
      const cluster = this.roots[i];
      cluster.visible = roots && i < count && progress >= 0 && progress < ATTACKS.roots.active;
      if (cluster.visible) {
        cluster.position.copy(ring.position);
        const height = Math.sin(Math.PI * progress / ATTACKS.roots.active);
        cluster.scale.set(1, Math.max(.02, height), 1);
      }
    });
  }

  dispose() {
    this.attacks.removeFromParent();
    this.ringGeometry.dispose();
    this.laneGeometry.dispose();
    this.rootGeometry.dispose();
    this.warningMaterial.dispose();
    this.rootMaterial.dispose();
    super.dispose();
  }
}
