import * as THREE from 'three';
import type { GameContext, Threat } from '../core/Context';
import { CharacterMotor } from '../physics/CharacterMotor';
import { HumanoidRig, GOBLIN_STYLE, ARM_UPPER, ARM_FORE } from '../character/HumanoidRig';
import { HumanoidAnimator, defaultAnimInput, type AnimInput } from '../character/HumanoidAnimator';
import { solveTwoBoneIK } from '../character/IK';
import { FootIK } from '../character/FootIK';
import { weaponBasis } from '../character/PlayerView';
import { createWeaponModel, type WeaponModel } from '../items/WeaponModels';
import {
  ATTACKS, WEAPONS, ARM_REACH, SHOULDER_R, attackTiming, swingAngle, swingDirLocal, bladeSegmentWorld,
  type AttackDef, type Timing,
} from '../combat/Attacks';
import { emptyResult, newId, type Damageable, type HitInfo, type HitResult, type Hurtbox } from '../combat/types';
import { angleDelta, clamp01, damp, dampAngle, dirToYaw, pick, rand, yawToDir, Spring } from '../core/math';
import { SlashTrail } from '../vfx/Trail';

export type EnemyState = 'spawn' | 'idle' | 'chase' | 'strafe' | 'windup' | 'attack' | 'hurt' | 'stagger' | 'guard' | 'dead';

export interface EnemyTarget extends Damageable {
  position: THREE.Vector3;
}

export interface EnemyOptions {
  shielded?: boolean;
  hp?: number;
}

const REST_WEAPON = new THREE.Quaternion().setFromEuler(new THREE.Euler(1.9, 0, 0));

/**
 * Inimigo simples: persegue, cerca, telegrafa o ataque (preparação longa com
 * brilho/som), golpeia com a clava usando o MESMO sistema de golpes do jogador,
 * reage direcionalmente a golpes, pode ser aparado (desequilíbrio) e, na
 * variante com escudo de metal, bloqueia golpes frontais (ricochete).
 */
export class Enemy implements Damageable, Threat {
  readonly id = newId();
  team = 'enemy' as const;
  alive = true;
  material = 'flesh' as const;
  lockable = true;
  hurtboxes: Hurtbox[];
  stickRoot: THREE.Object3D;

  readonly rig: HumanoidRig;
  readonly animator: HumanoidAnimator;
  readonly motor: CharacterMotor;
  private club: WeaponModel;
  private shieldModel: WeaponModel | null = null;
  readonly trail = new SlashTrail(18);
  private footIK: FootIK;
  shielded: boolean;
  facing = 0;
  hp: number;
  maxHp: number;
  state: EnemyState = 'spawn';
  stateT = 0;
  private stateDur = 0;
  private attackDef: AttackDef = ATTACKS.club1;
  private timing: Timing = attackTiming(ATTACKS.club1, 1, 1);
  private hitSet = new Set<number>();
  private swung = false;
  private prevT = 0;
  private cooldown = rand(0.8, 1.6);
  private strafeDir = 1;
  private strafeT = 0;
  hasToken = false;
  private hurtDir = new THREE.Vector3();
  private anim: AnimInput = defaultAnimInput();
  private lastFacing = 0;
  private hpBar: THREE.Group;
  private hpFill: THREE.Sprite;
  private hpShowT = 0;
  private hpLag = 1;
  private hpLagSprite: THREE.Sprite;
  private weaponSpring = new Spring(260, 16);
  private shieldSpring = new Spring(220, 14);
  deadT = 0;
  removed = false;
  private tmp = new THREE.Vector3();
  private tmp2 = new THREE.Vector3();
  private hand = new THREE.Vector3();
  private base = new THREE.Vector3();
  private tip = new THREE.Vector3();
  private dir = new THREE.Vector3();
  private edge = new THREE.Vector3();
  private q = new THREE.Quaternion();
  private yawQ = new THREE.Quaternion();

  constructor(private ctx: GameContext, pos: THREE.Vector3, opts: EnemyOptions = {}) {
    this.shielded = !!opts.shielded;
    this.maxHp = this.hp = opts.hp ?? (this.shielded ? 80 : 60);
    const style = { ...GOBLIN_STYLE };
    if (this.shielded) {
      style.skin = 0x5a6ec2;
      style.tunic = 0x3a3f4a;
      style.tunicDark = 0x2a2e36;
    }
    this.rig = new HumanoidRig(style);
    this.animator = new HumanoidAnimator(this.rig);
    this.footIK = new FootIK(ctx.physics);
    this.animator.onFootstep = (_f, intensity) => {
      ctx.events.emit('footstep', { pos: this.motor.position.clone(), surface: this.motor.surface, intensity: intensity * 0.6, player: false });
    };
    this.stickRoot = this.rig.root;
    this.motor = new CharacterMotor(ctx.physics);
    this.motor.radius = 0.4;
    this.motor.teleport(pos);
    ctx.scene.add(this.rig.root);
    this.club = createWeaponModel('club');
    ctx.scene.add(this.club.root);
    ctx.scene.add(this.trail.mesh);
    this.hurtboxes = [
      { a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.42, tag: 'body' },
      { a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.2, tag: 'head' },
    ];
    if (this.shielded) {
      this.shieldModel = createWeaponModel('shield');
      // escudo de metal escuro
      this.shieldModel.root.traverse((o) => {
        const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
        if (m && 'metalness' in m) {
          m.color.set(0x8a929e);
          m.metalness = 0.9;
          m.roughness = 0.35;
        }
      });
      this.shieldModel.root.scale.setScalar(1.15);
      ctx.scene.add(this.shieldModel.root);
      this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.34, tag: 'shield', material: 'metal' });
    }
    // barra de vida
    this.hpBar = new THREE.Group();
    const mk = (color: number) => {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ color, depthTest: false, transparent: true }));
      s.center.set(0, 0.5);
      s.renderOrder = 20;
      return s;
    };
    const bg = mk(0x1a1016);
    bg.scale.set(0.84, 0.1, 1);
    bg.position.x = -0.42;
    this.hpLagSprite = mk(0xffe0a0);
    this.hpLagSprite.position.x = -0.4;
    this.hpFill = mk(0xe8384f);
    this.hpFill.position.x = -0.4;
    this.hpBar.add(bg, this.hpLagSprite, this.hpFill);
    this.hpBar.visible = false;
    ctx.scene.add(this.hpBar);
    this.setState('spawn', 0.9);
    this.facing = rand(-Math.PI, Math.PI);
    ctx.events.emit('enemySpawn', { pos: pos.clone() });
  }

  get position() {
    return this.motor.position;
  }

  center(out: THREE.Vector3) {
    return out.copy(this.motor.position).setY(this.motor.position.y + 1.3 * this.rig.style.scale);
  }

  private setState(s: EnemyState, dur = 0) {
    this.state = s;
    this.stateT = 0;
    this.stateDur = dur;
  }

  isThreatening(pos: THREE.Vector3, lookahead: number): boolean {
    if (!this.alive) return false;
    if (this.motor.position.distanceTo(pos) > 3.6) return false;
    if (this.state === 'windup') return this.timing.windup - this.stateT <= lookahead;
    if (this.state === 'attack') return this.stateT < this.timing.active;
    return false;
  }

  // ------------------------------------------------------------------ dano
  receiveHit(hit: HitInfo): HitResult {
    const r = emptyResult('flesh');
    if (!this.alive || this.state === 'spawn') {
      r.ignored = true;
      return r;
    }
    const T = this.ctx.tuning;
    const toAttacker = this.tmp.subVectors(hit.origin, this.motor.position).setY(0).normalize();
    const fwd = yawToDir(this.facing, this.tmp2);
    const frontal = toAttacker.dot(fwd) > 0.2;

    // escudo de metal: bloqueia golpes frontais
    if (hit.hurtbox.tag === 'shield' && frontal && this.state !== 'stagger' && !hit.unblockable) {
      r.material = 'metal';
      r.blocked = true;
      this.shieldSpring.impulse(6 + hit.strength * 6);
      this.hpShowT = 2;
      if (!hit.projectile && (hit.charged || hit.strength >= 0.85)) {
        // quebra de guarda: golpe carregado atravessa a defesa
        r.damage = Math.round(hit.damage * 0.35);
        this.hp -= r.damage;
        this.stagger(1.3);
        this.ctx.sound.play('guardBreak', { pos: hit.point });
      } else if (!hit.projectile) {
        r.deflected = true;
        this.setState('guard', 0.35);
      }
      if (this.hp <= 0) this.die(r);
      return r;
    }
    if (hit.hurtbox.tag === 'shield') {
      // pelas costas: acerta o corpo
      hit.hurtbox = this.hurtboxes[0];
    }
    const head = hit.hurtbox.tag === 'head';
    const crit = this.state === 'stagger';
    let dmg = hit.damage * (crit ? 1.5 : 1) * (head ? (hit.projectile ? 2 : 1.25) : 1);
    dmg = Math.round(dmg);
    r.damage = dmg;
    this.hp -= dmg;
    this.hpShowT = 3;
    if (T.hitFlashEnabled) this.rig.flash(0xffffff, 0.09);

    // reação direcional (empurrão na direção do golpe + para longe do atacante)
    const push = this.tmp2.copy(hit.dir).setY(0).normalize().multiplyScalar(0.5).addScaledVector(toAttacker, -1).setY(0).normalize();
    this.hurtDir.copy(push);
    const kb = hit.knockback * T.knockbackMul;
    this.motor.velocity.x = push.x * kb;
    this.motor.velocity.z = push.z * kb;
    if (hit.strength >= 0.8) this.motor.velocity.y = 3.5 + hit.strength * 1.5;

    if (this.hp <= 0) {
      this.die(r);
      return r;
    }
    if (head && hit.projectile) {
      this.stagger(1.1); // flecha na cabeça atordoa
    } else if (this.state === 'stagger') {
      // continua atordoado
    } else {
      const armored = this.state === 'attack' && this.stateT < this.timing.active && hit.strength < 0.5;
      if (!armored) {
        this.releaseToken();
        this.setState('hurt', 0.25 + hit.strength * 0.35);
        this.ctx.sound.play('enemyHurt', { pos: this.motor.position, pitch: rand(0.9, 1.2) });
      }
    }
    return r;
  }

  private die(r: HitResult) {
    r.killed = true;
    this.hp = 0;
    this.alive = false;
    this.releaseToken();
    this.setState('dead', 1.1);
    this.hpBar.visible = false;
    this.club.setGlow(0);
  }

  stagger(dur: number) {
    this.releaseToken();
    this.setState('stagger', dur);
    this.club.setGlow(0);
    this.ctx.sound.play('stagger', { pos: this.motor.position });
  }

  /** Chamado pelo jogador quando este inimigo é aparado. */
  onParried() {
    this.stagger(1.6);
    this.weaponSpring.impulse(-10);
    const back = yawToDir(this.facing, this.tmp).multiplyScalar(-4.5);
    this.motor.velocity.x = back.x;
    this.motor.velocity.z = back.z;
  }

  private releaseToken() {
    this.hasToken = false;
  }

  // ------------------------------------------------------------------ IA
  update(dt: number, target: EnemyTarget | null, requestToken: (e: Enemy) => boolean) {
    const T = this.ctx.tuning;
    this.stateT += dt;
    const m = this.motor;
    const v = m.velocity;
    let desired = new THREE.Vector3();
    let face: number | null = null;
    let faceRate = 8;
    const agg = Math.max(0.2, T.enemyAggression);

    const toT = this.tmp.set(0, 0, 0);
    let dist = 999;
    if (target && target.alive) {
      toT.subVectors(target.position, m.position).setY(0);
      dist = toT.length();
      toT.normalize();
    }

    switch (this.state) {
      case 'spawn':
        if (this.stateT >= this.stateDur) this.setState('idle');
        break;
      case 'idle':
        // jogador esgueirando só é percebido de perto
        const sight = (target as { sneaking?: boolean } | null)?.sneaking ? 8 : 22;
        if (target?.alive && dist < sight) this.setState('chase');
        break;
      case 'chase': {
        if (!target?.alive) {
          this.setState('idle');
          break;
        }
        face = dirToYaw(toT.x, toT.z);
        this.cooldown -= dt * agg;
        if (dist > 2.3) {
          desired.copy(toT).multiplyScalar(dist > 5 ? 3.6 : 2.6);
        } else if (this.cooldown <= 0 && requestToken(this)) {
          this.hasToken = true;
          this.beginAttack();
        } else {
          this.setState('strafe');
          this.strafeT = rand(0.8, 1.8);
          this.strafeDir = Math.random() < 0.5 ? -1 : 1;
        }
        break;
      }
      case 'strafe': {
        if (!target?.alive) {
          this.setState('idle');
          break;
        }
        face = dirToYaw(toT.x, toT.z);
        this.cooldown -= dt * agg;
        const side = this.tmp2.set(-toT.z, 0, toT.x).multiplyScalar(this.strafeDir * 1.4);
        const keep = (dist - 2.6) * 1.5;
        desired.copy(side).addScaledVector(toT, keep);
        if (this.stateT > this.strafeT || (this.cooldown <= 0 && dist < 2.4)) this.setState('chase');
        break;
      }
      case 'windup': {
        // acompanha o alvo, mas "trava" perto do golpe (dá para esquivar para o lado)
        const left = this.timing.windup - this.stateT;
        if (target?.alive) face = dirToYaw(toT.x, toT.z);
        faceRate = left > 0.2 ? 7 : 0.5;
        if (this.stateT >= this.timing.windup) {
          this.setState('attack');
          this.prevT = 0;
        }
        break;
      }
      case 'attack': {
        const t = this.stateT;
        if (t < this.timing.active) {
          const fwd = yawToDir(this.facing, this.tmp2);
          desired.copy(fwd).multiplyScalar(dist > 1.3 ? this.attackDef.lunge : 0);
        }
        if (t >= this.timing.active + this.timing.recovery) {
          this.releaseToken();
          this.cooldown = rand(1.0, 2.2);
          this.setState('strafe');
          this.strafeT = rand(0.6, 1.4);
          this.strafeDir = Math.random() < 0.5 ? -1 : 1;
        }
        break;
      }
      case 'hurt':
      case 'guard':
        if (this.stateT >= this.stateDur) this.setState('chase');
        break;
      case 'stagger':
        if (this.stateT >= this.stateDur) {
          this.cooldown = rand(0.3, 0.8);
          this.setState('chase');
        }
        break;
      case 'dead':
        this.deadT += dt;
        break;
    }

    // separação de outros inimigos / do alvo é feita pelo diretor
    const control = this.state === 'chase' || this.state === 'strafe' || this.state === 'attack' || this.state === 'idle' || this.state === 'windup';
    if (control) {
      const rate = m.grounded ? 14 : 3;
      v.x = damp(v.x, desired.x, rate, dt);
      v.z = damp(v.z, desired.z, rate, dt);
    } else {
      v.x = damp(v.x, 0, m.grounded ? 6 : 1, dt);
      v.z = damp(v.z, 0, m.grounded ? 6 : 1, dt);
    }
    v.y -= T.gravity * (v.y < 0 ? 1.4 : 1) * dt;
    if (face !== null) this.facing = dampAngle(this.facing, face, faceRate, dt);
    m.update(dt);
    if (m.landedThisFrame && m.landSpeed > 5) this.animator.land(0.6);

    // hurtboxes
    const p = m.position;
    const s = this.rig.style.scale;
    const lying = this.state === 'dead';
    this.hurtboxes[0].a.set(p.x, p.y + 0.35, p.z);
    this.hurtboxes[0].b.set(p.x, p.y + (lying ? 0.4 : 1.3) * s, p.z);
    this.rig.joints.head.getWorldPosition(this.hurtboxes[1].a);
    this.hurtboxes[1].a.y += 0.12;
    this.hurtboxes[1].b.copy(this.hurtboxes[1].a);
    if (this.shielded) {
      const hb = this.hurtboxes[2];
      hb.enabled = this.state !== 'stagger' && this.state !== 'dead' && this.state !== 'spawn';
      const f = yawToDir(this.facing, this.tmp2);
      const r = this.tmp.set(Math.cos(this.facing), 0, -Math.sin(this.facing)); // esquerda do personagem
      hb.a.copy(p).addScaledVector(f, 0.55).addScaledVector(r, 0.12).setY(p.y + 0.55);
      hb.b.copy(hb.a).setY(p.y + 1.45);
    }

    this.updateAttackHits(target);
    this.updateVisual(dt);
  }

  private beginAttack() {
    this.attackDef = pick([ATTACKS.club1, ATTACKS.club2]);
    const agg = Math.max(0.3, this.ctx.tuning.enemyAggression);
    this.timing = attackTiming(this.attackDef, 1, 1);
    this.timing.windup /= Math.sqrt(agg);
    this.timing.total = this.timing.windup + this.timing.active + this.timing.recovery;
    this.hitSet.clear();
    this.swung = false;
    this.setState('windup');
    this.ctx.events.emit('enemyWindup', { pos: this.motor.position.clone().setY(this.motor.position.y + 1.6) });
  }

  private attackTime() {
    // tempo desde o início do ataque (preparação + golpe)
    if (this.state === 'windup') return this.stateT;
    if (this.state === 'attack') return this.timing.windup + this.stateT;
    return 0;
  }

  private updateAttackHits(target: EnemyTarget | null) {
    if (this.state !== 'attack') return;
    const tm = this.timing;
    const t = this.attackTime();
    if (!this.swung) {
      this.swung = true;
      this.ctx.events.emit('swing', { pos: this.motor.position.clone().setY(this.motor.position.y + 1.3), intensity: this.attackDef.whoosh, source: 'enemy' });
    }
    const t0 = Math.max(this.prevT, tm.windup);
    const t1 = Math.min(t, tm.windup + tm.active);
    this.prevT = t;
    if (t1 <= t0 || !target) return;
    const w = WEAPONS.club;
    const steps = 6;
    for (let i = 1; i <= steps; i++) {
      const ts = t0 + ((t1 - t0) * i) / steps;
      const ang = swingAngle(this.attackDef, tm, ts).angle;
      bladeSegmentWorld(this.attackDef, w, ang, 1, this.motor.position, this.facing, this.rig.style.scale, this.hand, this.base, this.tip, this.dir, this.edge);
      const hits = this.ctx.combat.querySegment(this.base, this.tip, w.hitRadius, 'enemy', this.hitSet, (d) => d.team === 'player');
      for (const h of hits) {
        this.hitSet.add(h.target.id);
        const hit: HitInfo = {
          attacker: this, team: 'enemy', tool: 'club', damage: this.attackDef.damage * this.ctx.tuning.enemyDamageMul,
          strength: this.attackDef.strength, knockback: this.attackDef.knockback, point: h.point, dir: this.edge.clone(),
          normal: h.normal, hurtbox: h.hurtbox, projectile: false, charged: false, origin: this.motor.position.clone(),
        };
        const res = h.target.receiveHit(hit);
        this.ctx.events.emit('hit', { hit, result: res, target: h.target, source: 'enemy' });
        if (res.blocked && !res.parried) {
          // clava ricocheteia no escudo
          this.weaponSpring.impulse(-8);
        }
      }
    }
  }

  // ------------------------------------------------------------------ visual
  private updateVisual(dt: number) {
    const rig = this.rig;
    const m = this.motor;
    rig.root.position.copy(m.position);
    rig.root.position.y += m.visualStepOffset;
    rig.root.rotation.y = this.facing;
    const a = this.anim;
    const v = m.velocity;
    a.speed = this.state === 'hurt' || this.state === 'stagger' ? 0 : Math.hypot(v.x, v.z);
    a.runSpeed = 3.6;
    a.walkSpeed = 1.8;
    a.ready = 1;
    a.hasShieldUp = this.shielded;
    a.moveAngle = a.speed > 0.2 ? angleDelta(this.facing, dirToYaw(v.x, v.z)) : 0;
    a.strafing = this.state === 'strafe' || this.state === 'windup';
    a.grounded = m.grounded;
    a.vy = v.y;
    a.turnRate = dt > 0 ? angleDelta(this.lastFacing, this.facing) / dt : 0;
    this.lastFacing = this.facing;
    a.guard = this.state === 'guard' ? 1 : 0;
    a.attackTwist = 0;
    a.spinYaw = 0;
    a.crouch = 0;
    const map: Record<EnemyState, AnimInput['action']> = {
      spawn: 'spawn', idle: 'none', chase: 'none', strafe: 'none', windup: 'attack', attack: 'attack',
      hurt: 'hurt', stagger: 'stagger', guard: 'guardHit', dead: 'dead',
    };
    a.action = map[this.state];
    a.actionT = this.stateT;
    a.actionU = this.stateDur > 0 ? clamp01(this.stateT / this.stateDur) : 0;
    let swingAng = 0;
    if (this.state === 'windup' || this.state === 'attack') {
      const sa = swingAngle(this.attackDef, this.timing, this.attackTime());
      swingAng = sa.angle;
      a.attackTwist = -(swingAng * Math.PI) / 180 * 0.3;
      a.crouch = this.state === 'windup' ? 0.3 : 0.1;
    }
    if (this.state === 'hurt') {
      const f = yawToDir(this.facing, this.tmp);
      a.hurtZ = -this.hurtDir.dot(f);
      a.hurtX = this.hurtDir.x * f.z - this.hurtDir.z * f.x;
    }
    this.animator.update(dt, a);
    this.footIK.update(dt, rig, m.grounded && this.state !== 'dead' && this.state !== 'spawn' && this.state !== 'stagger' && Math.hypot(v.x, v.z) < 0.6, 1, !m.grounded);
    rig.updateFlash(dt);
    this.weaponSpring.update(dt);
    this.shieldSpring.update(dt);
    rig.root.updateMatrixWorld(true);

    // clava: segue a trajetória lógica durante o ataque
    const club = this.club.root;
    const attacking = this.state === 'windup' || this.state === 'attack';
    this.yawQ.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.facing);
    if (attacking) {
      swingDirLocal(this.attackDef, swingAng, this.dir, this.edge);
      const s = rig.style.scale;
      this.hand.copy(SHOULDER_R).multiplyScalar(s).addScaledVector(this.dir, ARM_REACH * s).applyQuaternion(this.yawQ).add(m.position);
      this.dir.applyQuaternion(this.yawQ);
      this.edge.applyQuaternion(this.yawQ);
      weaponBasis(this.dir, this.edge, this.q);
      club.position.copy(this.hand);
      club.quaternion.copy(this.q);
      const pole = rig.joints.upperArmR.getWorldPosition(new THREE.Vector3());
      pole.add(new THREE.Vector3(-Math.cos(this.facing) * 0.5, -0.6, Math.sin(this.facing) * 0.5));
      solveTwoBoneIK(rig.joints.upperArmR, rig.joints.forearmR, ARM_UPPER, ARM_FORE, this.hand, pole, 1);
      // telegrafia: clava brilha durante a preparação
      const glow = this.state === 'windup' ? clamp01(this.stateT / this.timing.windup) : 0;
      this.club.setGlow(glow * (0.6 + Math.sin(this.stateT * 40) * 0.4));
      if (this.state === 'attack' && this.stateT < this.timing.active + 0.03) {
        const w = WEAPONS.club;
        this.trail.color.set(0xff9a7a);
        this.trail.push(
          this.base.set(0, w.bladeStart, 0).applyQuaternion(this.q).add(club.position),
          this.tip.set(0, w.bladeEnd, 0).applyQuaternion(this.q).add(club.position),
        );
      }
    } else {
      rig.sockets.handR.getWorldPosition(club.position);
      rig.sockets.handR.getWorldQuaternion(club.quaternion);
      club.quaternion.multiply(REST_WEAPON);
      if (this.weaponSpring.value) club.rotateX(this.weaponSpring.value * 0.12);
      this.club.setGlow(0);
    }
    this.trail.update(dt, this.ctx.tuning.trailsEnabled, 0.8);

    if (this.shieldModel) {
      const sh = this.shieldModel.root;
      const guardPos = this.tmp.set(0.12, 1.02, 0.5 - this.shieldSpring.value * 0.04).applyQuaternion(this.yawQ).add(m.position);
      sh.position.copy(guardPos);
      sh.quaternion.setFromEuler(new THREE.Euler(-0.1 - this.shieldSpring.value * 0.06, this.facing, 0.05, 'YXZ'));
      if (this.state === 'stagger' || this.state === 'dead') {
        rig.sockets.handL.getWorldPosition(sh.position);
        rig.sockets.handL.getWorldQuaternion(sh.quaternion);
        sh.quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI / 2, 0)));
      } else {
        const pole = rig.joints.upperArmL.getWorldPosition(new THREE.Vector3());
        pole.add(new THREE.Vector3(Math.cos(this.facing) * 0.6, -0.5, -Math.sin(this.facing) * 0.6));
        const grip = new THREE.Vector3(0, 0, -0.04).applyQuaternion(sh.quaternion).add(sh.position);
        solveTwoBoneIK(rig.joints.upperArmL, rig.joints.forearmL, ARM_UPPER, ARM_FORE, grip, pole, 1);
      }
      sh.visible = !this.removed;
    }

    // barra de vida
    this.hpShowT -= dt;
    const frac = clamp01(this.hp / this.maxHp);
    this.hpLag = this.hpLag > frac ? damp(this.hpLag, frac, 3, dt) : frac;
    this.hpBar.visible = this.alive && this.hpShowT > 0;
    this.hpBar.position.copy(m.position).setY(m.position.y + 2.25);
    this.hpFill.scale.set(0.8 * frac + 1e-4, 0.07, 1);
    this.hpLagSprite.scale.set(0.8 * this.hpLag + 1e-4, 0.07, 1);
  }

  dispose() {
    this.removed = true;
    this.rig.root.removeFromParent();
    this.club.root.removeFromParent();
    this.shieldModel?.root.removeFromParent();
    this.trail.mesh.removeFromParent();
    this.hpBar.removeFromParent();
    this.rig.dispose();
  }
}
