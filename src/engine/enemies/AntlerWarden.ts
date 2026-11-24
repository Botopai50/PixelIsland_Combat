import * as THREE from 'three';
import type { GameContext } from '../core/Context';
import { emptyResult, type HitInfo } from '../combat/types';
import { angleDelta, damp, dampAngle } from '../core/math';
import { CharacterMotor } from '../physics/CharacterMotor';
import { BasePixelAnimal } from './Animals';
import { sampleAnimalCycle } from './AnimalAnimation';
import {
  getAntlerWardenPosePack, WARDEN_CENTER, WARDEN_IDLE, WARDEN_PH, WARDEN_PW,
  WARDEN_SIZE, WARDEN_STOMP, WARDEN_STONES, WARDEN_SWEEP, WARDEN_WALK,
} from './AntlerWardenSprites';

type Target = NonNullable<Parameters<BasePixelAnimal['update']>[1]>;
type Attack = keyof typeof MOVES;

const SWEEP_SPREAD = Math.PI * .39;
const MOVES = {
  sweep: { frames: WARDEN_SWEEP, range: 4.15, radius: 5, cue: .98, travel: 0, damage: 28, recovery: .57 },
  stomp: { frames: WARDEN_STOMP, range: 5.0, radius: 5.75, cue: 1.24, travel: 0, damage: 35, recovery: .64 },
  stones: { frames: WARDEN_STONES, range: 10, radius: 1.53, cue: .80, travel: .65, damage: 25, recovery: .70 },
};
const NORMAL: readonly Attack[] = ['sweep', 'stomp', 'stones'];
const FURY: readonly Attack[] = ['stones', 'sweep', 'stomp', 'sweep'];
const IMPACTS = [[0, 0], [-2.55, .85], [2.55, -.85], [0, -2.8], [0, 2.8]] as const;

interface Windup {
  move: Attack;
  elapsed: number;
  release: number;
  impact: number;
  end: number;
  count: number;
  enraged: boolean;
}

export class AntlerWarden extends BasePixelAnimal {
  readonly bossName = 'Guardião Galhudo';
  engaged = false;
  get enraged() { return this.hp <= this.maxHp * .5; }
  get position() { return this.motor.position; }

  private readonly motor: CharacterMotor;
  private readonly home: THREE.Vector3;
  private readonly offset = new THREE.Vector3();
  private readonly ahead = new THREE.Vector3();
  private readonly origin = new THREE.Vector3();
  private readonly point = new THREE.Vector3();
  private readonly throwFrom = new THREE.Vector3();

  private readonly effects = new THREE.Group();
  private readonly circleGeometry = new THREE.RingGeometry(.89, 1, 42);
  private readonly sweepGeometry = new THREE.CircleGeometry(MOVES.sweep.radius, 36, -Math.PI / 2 - SWEEP_SPREAD, SWEEP_SPREAD * 2);
  private readonly rubbleGeometry = new THREE.DodecahedronGeometry(.50);
  private readonly markerMaterial = new THREE.MeshBasicMaterial({
    color: 0xf6bf62, side: THREE.DoubleSide, transparent: true, opacity: .75, depthWrite: false,
  });
  private readonly fanMaterial = this.markerMaterial.clone();
  private readonly rubbleMaterial = new THREE.MeshStandardMaterial({ color: 0x6d5650, roughness: 1, flatShading: true });
  private readonly arc = new THREE.Mesh(this.sweepGeometry, this.fanMaterial);
  private readonly rings = IMPACTS.map(() => new THREE.Mesh(this.circleGeometry, this.markerMaterial));
  private readonly stones = IMPACTS.map(() => new THREE.Mesh(this.rubbleGeometry, this.rubbleMaterial));

  private windup?: Windup;
  private age = 0;
  private stride = 0;
  private cycle = 0;
  private cooldown = 0;

  constructor(ctx: GameContext, start: THREE.Vector3) {
    super(ctx, getAntlerWardenPosePack('idle0').getView(4, 0)!, WARDEN_PW, WARDEN_PH,
      WARDEN_SIZE, WARDEN_SIZE, 'AntlerWardenBillboard');
    this.hp = this.maxHp = 560;
    this.motor = new CharacterMotor(ctx.physics);
    this.motor.height = 4.7;
    this.motor.radius = 1.15;
    this.motor.teleport(start);
    this.bindAnimalMotor(this.motor);
    this.home = start.clone();
    this.facing = .68;
    this.hurtboxes.push(
      { a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 1.29, tag: 'body' },
      { a: new THREE.Vector3(), b: new THREE.Vector3(), radius: .77, tag: 'body' },
    );
    for (const ring of this.rings) ring.rotation.x = -Math.PI / 2;
    this.arc.rotation.x = -Math.PI / 2;
    for (const rock of this.stones) rock.castShadow = true;
    this.effects.add(this.arc, ...this.rings, ...this.stones);
    this.effects.visible = false;
    ctx.scene.add(this.effects);
    this.syncBody();
  }

  center(out: THREE.Vector3) {
    return out.copy(this.position).setY(this.position.y + 2.75);
  }

  receiveHit(hit: HitInfo) {
    const result = emptyResult();
    if (!this.alive) return { ...result, ignored: true };
    result.damage = Math.min(this.hp, hit.damage);
    this.hp -= result.damage;
    this.flash = 1;
    this.alive = this.hp > 0;
    this.engaged = this.alive;
    result.killed = !this.alive;
    this.syncBody();
    return result;
  }

  update(dt: number, target: Target | null, camera: THREE.Camera, buffer?: THREE.Vector2) {
    if (dt > 0 && this.alive) {
      this.age += dt;
      this.cooldown = Math.max(0, this.cooldown - dt);
      this.flash = Math.max(0, this.flash - 4.6 * dt);
      if (this.windup && !target?.alive) this.windup = undefined;
      const speed = this.windup ? 0 : this.chooseMove(dt, target);
      const velocity = this.motor.velocity;
      velocity.x = damp(velocity.x, Math.sin(this.facing) * speed, 11, dt);
      velocity.z = damp(velocity.z, Math.cos(this.facing) * speed, 11, dt);
      velocity.y -= 22 * dt;
      this.motor.update(dt);
      this.stride += this.motor.horizontalSpeed * dt * 1.5;
      this.syncBody();
      if (this.windup && target?.alive) this.advance(dt, this.windup, target);
    }

    this.drawEffects();
    const attack = this.windup;
    const pose = attack
      ? MOVES[attack.move].frames[attack.elapsed < attack.release * .34 ? 0 : attack.elapsed < attack.release ? 1
        : attack.elapsed < attack.impact + .29 ? 2 : 3]
      : this.motor.horizontalSpeed > .25
        ? sampleAnimalCycle(WARDEN_WALK, this.stride)
        : sampleAnimalCycle(WARDEN_IDLE, this.age * .8);
    this.renderBillboard(getAntlerWardenPosePack(pose), this.position.y + WARDEN_CENTER, camera, buffer);
  }

  private syncBody() {
    const [body, chest] = this.hurtboxes;
    body.a.copy(this.position).y += .86;
    body.b.copy(this.position).y += 2.70;
    chest.a.copy(this.position).y += 3.47;
    chest.b.copy(this.position).y += 5.17;
    body.enabled = chest.enabled = this.alive;
    this.center(this.stickRoot.position);
    this.stickRoot.rotation.y = this.facing;
  }

  private chooseMove(dt: number, target: Target | null) {
    const nearby = target?.alive && target.position.distanceToSquared(this.home) < 13.5 ** 2
      && target.position.distanceToSquared(this.position) < 12 ** 2;
    this.engaged = !!nearby;
    const destination = nearby ? target.position : this.home;
    const offset = this.offset.subVectors(destination, this.position);
    const range = Math.hypot(offset.x, offset.z);
    if (!nearby && range < .46) return 0;
    const yaw = Math.atan2(offset.x, offset.z);
    this.facing = dampAngle(this.facing, yaw, 4.3, dt);
    if (!nearby) return 1.7;

    const pattern = this.enraged ? FURY : NORMAL;
    const move = pattern[this.cycle % pattern.length];
    if (range > MOVES[move].range) return this.enraged ? 3.28 : 2.65;
    if (this.motor.grounded && this.cooldown === 0 &&
      Math.abs(offset.y) < 2.15 && Math.abs(angleDelta(this.facing, yaw)) < .30) {
      this.startMove(move, target);
    }
    return 0;
  }

  private startMove(move: Attack, target: Target) {
    this.cycle++;
    const def = MOVES[move];
    const enraged = this.enraged;
    const release = def.cue * (enraged ? .77 : 1);
    const impact = release + def.travel;
    const count = move === 'stones' ? (enraged ? 5 : 3) : 1;
    this.windup = { move, elapsed: 0, release, impact, count, enraged, end: impact + def.recovery };

    this.motor.velocity.setX(0).setZ(0);
    this.ahead.set(Math.sin(this.facing), 0, Math.cos(this.facing));
    this.throwFrom.copy(this.position).addScaledVector(this.ahead, 1.44).y += 4.2;
    for (let i = 0; i < count; i++) {
      const point = this.rings[i].position;
      point.copy(move === 'stones' ? target.position : this.position);
      if (move === 'stones') {
        const [lateral, forward] = IMPACTS[i];
        point.x += this.ahead.z * lateral + this.ahead.x * forward;
        point.z += -this.ahead.x * lateral + this.ahead.z * forward;
      }
      const ground = this.ctx.physics.groundHeight(point.x, point.z, point.y, .3).y;
      if (Number.isFinite(ground)) point.y = ground;
      point.y += .075;
    }
    this.arc.position.copy(this.rings[0].position);
    this.arc.rotation.set(-Math.PI / 2, 0, this.facing, 'YXZ');
  }

  private advance(dt: number, attack: Windup, target: Target) {
    const previous = attack.elapsed;
    attack.elapsed += dt;
    if (previous < attack.impact && attack.elapsed >= attack.impact) this.strike(attack, target);
    if (attack.elapsed >= attack.end) {
      this.windup = undefined;
      this.cooldown = this.enraged ? .58 : .94;
    }
  }

  private strike(attack: Windup, target: Target) {
    const def = MOVES[attack.move];
    let center: THREE.Vector3 | undefined;
    for (let i = 0; i < attack.count; i++) {
      const candidate = this.rings[i].position;
      const delta = this.offset.subVectors(target.position, candidate);
      if (Math.abs(delta.y) < (attack.move === 'stones' ? 1.35 : 1.06) && Math.hypot(delta.x, delta.z) <= def.radius) {
        center = candidate;
        break;
      }
    }
    if (!center) return;
    const heading = this.offset.subVectors(target.position, center);
    if (attack.move === 'sweep' &&
      Math.abs(angleDelta(this.facing, Math.atan2(heading.x, heading.z))) > SWEEP_SPREAD) return;

    const origin = this.center(this.origin);
    const point = target.center(this.point);
    const ray = this.offset.subVectors(point, origin);
    const distance = ray.length();
    if (attack.move !== 'stones' && distance > 0 && this.ctx.physics.raycast(origin, ray.divideScalar(distance), distance)) return;
    const dir = point.clone().sub(attack.move === 'stones' ? center : origin).setY(0).normalize();
    if (dir.lengthSq() === 0) dir.copy(this.ahead);
    const hit: HitInfo = {
      attacker: this, team: 'enemy', tool: 'club', damage: def.damage + (attack.enraged ? 7 : 0),
      knockback: attack.move === 'stomp' ? 8.5 : 6.3, strength: .9,
      point: point.clone(), dir, normal: dir.clone().negate(), hurtbox: target.hurtboxes[0],
      projectile: false, charged: attack.move === 'stomp', origin: origin.clone(),
    };
    const result = target.receiveHit(hit);
    if (!result.ignored) this.ctx.events.emit('hit', { hit, result, target, source: 'enemy' });
  }

  private drawEffects() {
    const attack = this.windup;
    this.effects.visible = !!attack && this.alive;
    if (!attack || !this.alive) return;
    const color = attack.enraged ? 0xff654c : 0xffbd62;
    const pulse = Math.sin(attack.elapsed * 15) ** 2;
    const impactAge = attack.elapsed - attack.impact;
    const warning = impactAge < 0;
    const burst = impactAge >= 0 && impactAge < .24;
    const thrown = attack.move === 'stones';
    this.markerMaterial.color.setHex(color);
    this.markerMaterial.opacity = warning ? .60 + pulse * .27 : Math.max(0, .95 - impactAge * 3.4);
    this.fanMaterial.color.setHex(color);
    this.fanMaterial.opacity = warning ? .23 + pulse * .21 : Math.max(0, .65 - impactAge * 2.8);
    this.arc.visible = attack.move === 'sweep' && (warning || burst);
    for (let i = 0; i < this.rings.length; i++) {
      const ring = this.rings[i];
      ring.visible = attack.move !== 'sweep' && i < attack.count && (warning || burst);
      const radius = MOVES[attack.move].radius;
      ring.scale.setScalar(burst ? radius * (.72 + impactAge * 1.16) : radius);
      const rock = this.stones[i];
      rock.visible = thrown && i < attack.count && attack.elapsed >= attack.release && warning;
      if (rock.visible) {
        const flight = (attack.elapsed - attack.release) / MOVES.stones.travel;
        rock.position.lerpVectors(this.throwFrom, ring.position, flight);
        rock.position.y += 4.1 * Math.sin(Math.PI * flight);
        rock.rotation.set(flight * 4 + i, flight * 5, i * .73);
      }
    }
  }

  dispose() {
    this.effects.removeFromParent();
    this.circleGeometry.dispose();
    this.sweepGeometry.dispose();
    this.rubbleGeometry.dispose();
    this.markerMaterial.dispose();
    this.fanMaterial.dispose();
    this.rubbleMaterial.dispose();
    super.dispose();
  }
}
