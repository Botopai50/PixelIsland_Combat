import * as THREE from 'three';
import type { GameContext } from '../core/Context';
import { CharacterMotor } from '../physics/CharacterMotor';
import {
  ATTACKS, WEAPONS, attackTiming, swingAngle, bladeSegmentWorld, swingDirLocal,
  type AttackDef, type WeaponDef, type Timing,
} from '../combat/Attacks';
import { emptyResult, newId, type Damageable, type HitInfo, type HitResult, type Hurtbox } from '../combat/types';
import type { Inventory } from '../items/Inventory';
import { ITEMS, type ItemId } from '../items/Items';
import type { ProjectileSystem } from '../combat/Projectiles';
import type { LoopHandle } from '../audio/SoundEngine';
import { angleDelta, approach, clamp, clamp01, damp, dampAngle, dirToYaw, lerp, wrapAngle, yawToDir } from '../core/math';
import type { AnimAction, AnimInput, DodgeType } from './HumanoidAnimator';
import { defaultAnimInput } from './HumanoidAnimator';

/** Fonte de mira (câmera). O controlador não conhece a implementação da câmera. */
export interface AimSource {
  yaw: number;
  pitch: number;
  readonly firstPerson: boolean;
  /** Ponto de mundo sob a mira (para o arco). */
  aimPoint(out: THREE.Vector3): THREE.Vector3;
  recenter(): void;
}

export type PlayerState =
  | 'move' | 'attack' | 'charge' | 'dodge' | 'bow' | 'bowRecover' | 'equip' | 'hurt' | 'stagger' | 'guardHit' | 'dead';

interface AttackRun {
  def: AttackDef;
  weapon: WeaponDef;
  timing: Timing;
  yaw: number;
  hitSet: Set<number>;
  prevT: number;
  swung: boolean;
  hitAny: boolean;
  charged: boolean;
  wallHit: boolean;
  flurry?: boolean;
  missed?: boolean;
}

type Buffered = { kind: 'attack' | 'dodge'; t: number } | null;

/**
 * Controlador do jogador: movimento, salto (coyote time + buffer), esquiva,
 * defesa/aparo, combo corpo a corpo com janelas de cancelamento, ataque
 * carregado, arco, troca de equipamento e recebimento de dano.
 * Não depende do modelo visual nem da câmera concreta (usa AimSource).
 */
export class PlayerController implements Damageable {
  readonly id = newId();
  team = 'player' as const;
  alive = true;
  material = 'flesh' as const;
  lockable = false;
  hurtboxes: Hurtbox[] = [{ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.36, tag: 'body' }];
  stickRoot: THREE.Object3D = new THREE.Group();

  motor: CharacterMotor;
  facing = 0;
  maxHp = 100;
  hp = 100;
  stamina = 100;
  exhausted = false;
  private staminaDelay = 0;

  state: PlayerState = 'move';
  stateT = 0;
  time = 0;

  // equipamento
  mainHand: ItemId | null = 'sword';
  offHand: ItemId | null = 'shield';
  private pendingEquip: { item: ItemId | null; slot: 'main' | 'off' } | null = null;
  private equipSwapDone = false;
  private equipTarget: { item: ItemId | null; slot: 'main' | 'off' } | null = null;

  // ataque
  attack: AttackRun | null = null;
  comboIndex = 0;
  private comboResetAt = 0;
  private buffered: Buffered = null;
  private attackPressAt = -10;
  private attackHeld = false;
  private airAttackUsed = false;
  chargeT = 0;
  private chargeReadyFired = false;
  private chargeLoop: LoopHandle | null = null;
  flurryHits = 0;

  // salto
  private jumpBufferedUntil = -10;
  private jumpedSinceGround = false;
  private jumpCut = false;

  // defesa
  guarding = false;
  guardAmount = 0;
  private guardPressAt = -10;

  // esquiva
  dodgeDir = new THREE.Vector3();
  dodgeType: DodgeType = 'hopL';
  private dodgeDur = 0.35;
  private dodgeReadyAt = 0;
  private iFramesUntil = -1;
  private iFramesFrom = -1;
  flurryWindowUntil = -1;

  // arco
  bowDraw = 0;
  private bowLoop: LoopHandle | null = null;

  // dano
  hurtDir = new THREE.Vector3();
  private hurtDur = 0.4;
  private respawnAt = 0;
  spawnPoint = new THREE.Vector3(0, 0, 6);

  // lock-on
  lockTarget: Damageable | null = null;

  // saída para a animação
  readonly anim: AnimInput = defaultAnimInput();
  turnRate = 0;
  private lastFacing = 0;
  sprinting = false;
  /** Ângulo atual do golpe (para views). */
  swingAngle = 0;
  swingPhase: 'windup' | 'active' | 'recovery' | 'done' = 'done';
  /** Impulso visual de recuo da arma (views leem e zeram). */
  recoilImpulse = 0;
  /** Recuo do escudo (views). */
  shieldImpulse = 0;
  /** Pulso de interface (ex.: sem munição). */

  private tmp = new THREE.Vector3();
  private tmp2 = new THREE.Vector3();
  private hand = new THREE.Vector3();
  private base = new THREE.Vector3();
  private tip = new THREE.Vector3();
  private bdir = new THREE.Vector3();
  private edge = new THREE.Vector3();

  constructor(
    private ctx: GameContext,
    public aim: AimSource,
    public inventory: Inventory,
    private projectiles: ProjectileSystem,
  ) {
    this.motor = new CharacterMotor(ctx.physics);
    this.motor.radius = 0.36;
    this.motor.height = 1.75;
  }

  get position() {
    return this.motor.position;
  }
  get weapon(): WeaponDef | null {
    const w = this.mainHand ? ITEMS[this.mainHand].weapon : undefined;
    return w ? WEAPONS[w] : null;
  }
  get hasShield() {
    return this.offHand === 'shield' && this.mainHand !== 'bow';
  }
  get invulnerable() {
    return this.time >= this.iFramesFrom && this.time < this.iFramesUntil;
  }
  get inFlurryWindow() {
    return this.time < this.flurryWindowUntil;
  }

  center(out: THREE.Vector3) {
    return out.copy(this.motor.position).setY(this.motor.position.y + 1);
  }

  spawn(p: THREE.Vector3, yaw = Math.PI) {
    this.spawnPoint.copy(p);
    this.motor.teleport(p);
    this.facing = yaw;
    this.aim.yaw = yaw;
    this.hp = this.maxHp;
    this.stamina = this.ctx.tuning.staminaMax;
    this.alive = true;
    this.setState('move');
  }

  /** Estado atual sem estreitamento de tipo do TS (muda dentro dos métodos). */
  private cur(): PlayerState {
    return this.state;
  }

  private setState(s: PlayerState) {
    if (this.state === 'charge' && s !== 'charge') this.stopChargeLoop();
    if (this.state === 'bow' && s !== 'bow') this.stopBowLoop();
    this.state = s;
    this.stateT = 0;
  }

  // ------------------------------------------------------------------ equipamento
  /** Pede para equipar um item. Respeita ações em andamento (fica pendente). */
  requestEquip(item: ItemId | null) {
    let slot: 'main' | 'off' = 'main';
    if (item && ITEMS[item].kind === 'shield') {
      slot = 'off';
      item = this.offHand === 'shield' ? null : 'shield';
    } else if (item && !ITEMS[item].weapon) {
      this.ctx.events.emit('toast', { text: `${ITEMS[item].name} ×${this.inventory.count(item)} (recurso)`, kind: 'info' });
      return;
    }
    if (item && !this.inventory.has(item)) return;
    if (slot === 'main' && item === this.mainHand) return;
    this.pendingEquip = { item, slot };
  }

  private tryStartEquip() {
    if (!this.pendingEquip || this.state !== 'move') return;
    this.equipTarget = this.pendingEquip;
    this.pendingEquip = null;
    this.equipSwapDone = false;
    this.attack = null;
    this.setState('equip');
    this.ctx.sound.play('unequip', { pos: this.position });
  }

  private applyEquipSwap() {
    const e = this.equipTarget!;
    if (e.slot === 'main') this.mainHand = e.item;
    else this.offHand = e.item;
    this.equipSwapDone = true;
    this.comboIndex = 0;
    const kind = e.item ? (e.item === 'bow' ? 'bow' : e.item === 'shield' ? 'shield' : e.item === 'sword' ? 'blade' : 'tool') : 'none';
    if (e.item) this.ctx.sound.play('equip', { pos: this.position, variant: kind });
    this.ctx.events.emit('equip', { item: e.item, slot: e.slot, kind });
  }

  // ------------------------------------------------------------------ dano recebido
  receiveHit(hit: HitInfo): HitResult {
    const r = emptyResult('flesh');
    if (!this.alive) {
      r.ignored = true;
      return r;
    }
    if (this.invulnerable) {
      // golpe atravessou durante a esquiva: se foi logo no início, é esquiva perfeita
      if (this.state === 'dodge' && this.stateT <= this.ctx.tuning.perfectDodgeWindow + 0.05) this.triggerPerfectDodge();
      r.ignored = true;
      return r;
    }
    const T = this.ctx.tuning;
    // direção do atacante em relação à frente do jogador
    this.tmp.subVectors(hit.origin, this.position).setY(0).normalize();
    const facingDir = yawToDir(this.facing, this.tmp2);
    const angle = Math.acos(clamp(this.tmp.dot(facingDir), -1, 1)) * (180 / Math.PI);
    const canGuard = this.guarding && (this.hasShield || this.weapon !== null) && this.mainHand !== 'bow';
    if (canGuard && angle <= T.blockAngle) {
      const sincePress = this.time - this.guardPressAt;
      if (this.hasShield && sincePress <= T.parryWindow) {
        // APARO
        r.parried = true;
        r.blocked = true;
        r.material = 'metal';
        this.shieldImpulse = 1.4;
        (hit.attacker as { onParried?: () => void })?.onParried?.();
        this.stamina = Math.min(T.staminaMax, this.stamina + 10);
        return r;
      }
      // BLOQUEIO
      r.blocked = true;
      r.material = this.hasShield ? 'metal' : 'metal';
      const reduction = this.hasShield ? 1 : (this.weapon?.weaponGuard ?? 0.4);
      r.damage = Math.round(hit.damage * (1 - reduction));
      this.stamina -= T.blockStaminaCost + hit.damage * 0.4;
      this.shieldImpulse = 1;
      this.motor.velocity.addScaledVector(hit.dir.clone().setY(0).normalize(), hit.knockback * 0.45 * T.knockbackMul);
      if (this.stamina <= 0) {
        // quebra de guarda
        this.stamina = 0;
        this.exhausted = true;
        this.ctx.sound.play('guardBreak', { pos: this.position });
        this.enterHurt(hit, 0.7);
        r.damage = Math.round(hit.damage * 0.5);
      } else {
        this.setState('guardHit');
      }
      if (r.damage > 0) this.hp -= r.damage;
      if (this.hp <= 0) this.die();
      return r;
    }
    r.damage = Math.round(hit.damage);
    this.hp -= r.damage;
    this.enterHurt(hit, 0.42);
    if (this.hp <= 0) {
      r.killed = true;
      this.die();
    }
    return r;
  }

  private enterHurt(hit: HitInfo, dur: number) {
    this.cancelActions();
    this.hurtDir.copy(hit.dir).setY(0).normalize();
    this.hurtDur = dur;
    this.setState('hurt');
    this.iFramesFrom = this.time;
    this.iFramesUntil = this.time + 0.55;
    const kb = hit.knockback * this.ctx.tuning.knockbackMul;
    this.motor.velocity.x = this.hurtDir.x * kb;
    this.motor.velocity.z = this.hurtDir.z * kb;
    if (hit.strength > 0.5) this.motor.velocity.y = 3;
  }

  private die() {
    this.hp = 0;
    this.alive = false;
    this.cancelActions();
    this.setState('dead');
    this.respawnAt = this.time + 3;
    this.lockTarget = null;
    this.ctx.events.emit('playerDeath', undefined);
  }

  private cancelActions() {
    this.attack = null;
    this.chargeT = 0;
    this.bowDraw = 0;
    this.stopBowLoop();
    this.stopChargeLoop();
    this.buffered = null;
  }

  private stopBowLoop() {
    this.bowLoop?.stop();
    this.bowLoop = null;
  }
  private stopChargeLoop() {
    this.chargeLoop?.stop();
    this.chargeLoop = null;
  }

  onParried() {
    /* jogador não é aparado neste protótipo */
  }

  // ------------------------------------------------------------------ esquiva perfeita / rajada
  private triggerPerfectDodge() {
    if (!this.ctx.tuning.flurryEnabled || this.inFlurryWindow) return;
    this.flurryWindowUntil = this.time + 1.6;
    this.ctx.clock.slowWorld(0.12, 1.9);
    this.ctx.events.emit('perfectDodge', { pos: this.position.clone() });
  }

  // ------------------------------------------------------------------ ataque
  private canCancelAttack(): boolean {
    const a = this.attack;
    if (!a) return true;
    const T = this.ctx.tuning;
    const tm = a.timing;
    const t = this.stateT;
    if (t < tm.windup) return a.def.cancelWindup;
    if (t < tm.windup + tm.active) return false;
    return t - tm.windup - tm.active >= a.def.cancelAt * T.cancelWindowMul;
  }

  private remainingActionTime(): number {
    switch (this.state) {
      case 'attack': return this.attack ? this.attack.timing.total - this.stateT : 0;
      case 'dodge': return this.dodgeDur - this.stateT;
      case 'equip': return (this.weapon?.equipTime ?? 0.25) - this.stateT;
      case 'bowRecover': return 0.22 - this.stateT;
      case 'hurt': return this.hurtDur - this.stateT;
      case 'guardHit': return 0.25 - this.stateT;
      case 'stagger': return 0.35 - this.stateT;
      default: return 0;
    }
  }

  private pickFacingForAttack() {
    const T = this.ctx.tuning;
    if (this.aim.firstPerson) {
      this.facing = this.aim.yaw;
      return;
    }
    if (this.lockTarget) {
      this.lockTarget.center(this.tmp).sub(this.position);
      this.facing = dirToYaw(this.tmp.x, this.tmp.z);
      return;
    }
    const inp = this.ctx.input;
    if (Math.hypot(inp.moveX, inp.moveY) > 0.2) {
      this.facing = this.inputYaw();
      return;
    }
    if (T.lockOnAssist) {
      // assistência leve: vira para o inimigo mais próximo à frente
      const t = this.ctx.combat.findLockTarget(this.position, yawToDir(this.facing, this.tmp2), 3.2, 75, 'player');
      if (t) {
        t.center(this.tmp).sub(this.position);
        this.facing = dirToYaw(this.tmp.x, this.tmp.z);
      }
    }
  }

  private inputYaw() {
    const inp = this.ctx.input;
    return this.aim.yaw + Math.atan2(-inp.moveX, inp.moveY);
  }

  private startAttack(def: AttackDef, charged = false) {
    const w = this.weapon!;
    const cost = charged ? this.ctx.tuning.chargeCost : (def.stamina ?? 0);
    if (cost > 0 && this.stamina < cost) {
      this.ctx.sound.play('exhausted', { pos: this.position });
      this.ctx.events.emit('toast', { text: 'Stamina insuficiente', kind: 'warn' });
      return false;
    }
    if (cost > 0) this.useStamina(cost);
    this.pickFacingForAttack();
    const T = this.ctx.tuning;
    this.attack = {
      def, weapon: w, timing: attackTiming(def, T.attackSpeedMul, T.recoveryMul), yaw: this.facing,
      hitSet: new Set(), prevT: 0, swung: false, hitAny: false, charged, wallHit: false,
    };
    this.setState('attack');
    this.buffered = null;
    return true;
  }

  private startComboAttack() {
    const w = this.weapon;
    if (!w || w.combo.length === 0) return;
    if (!this.motor.grounded && this.motor.timeSinceGrounded > 0.1 && w.air) {
      if (this.airAttackUsed) return;
      this.airAttackUsed = true;
      this.startAttack(ATTACKS[w.air]);
      return;
    }
    if (this.time > this.comboResetAt) this.comboIndex = 0;
    const id = w.combo[this.comboIndex % w.combo.length];
    if (this.startAttack(ATTACKS[id])) this.comboIndex = (this.comboIndex + 1) % w.combo.length;
  }

  private startFlurry() {
    this.flurryHits = 0;
    this.flurryWindowUntil = -1;
    this.nextFlurrySwing();
  }
  private nextFlurrySwing() {
    const def = ATTACKS[this.flurryHits % 2 === 0 ? 'flurryA' : 'flurryB'];
    this.startAttack(def);
    if (this.attack) this.attack.flurry = true;
    // avança até o alvo
    if (this.lockTarget || this.flurryHits === 0) {
      const t = this.lockTarget ?? this.ctx.combat.findLockTarget(this.position, yawToDir(this.facing, this.tmp2), 6, 100, 'player');
      if (t) {
        t.center(this.tmp).sub(this.position).setY(0);
        const d = this.tmp.length();
        this.facing = dirToYaw(this.tmp.x, this.tmp.z);
        if (this.attack) this.attack.yaw = this.facing;
        if (d > 1.3) this.motor.velocity.addScaledVector(this.tmp.normalize(), Math.min(14, (d - 1.2) * 10));
      }
    }
    this.flurryHits++;
  }

  private startCharge() {
    this.attack = null;
    this.chargeT = 0;
    this.chargeReadyFired = false;
    this.setState('charge');
    this.chargeLoop = this.ctx.sound.loop('charge');
    this.ctx.events.emit('chargeStart', { pos: this.position.clone() });
  }

  private useStamina(n: number) {
    this.stamina = Math.max(0, this.stamina - n);
    this.staminaDelay = 0.7;
    if (this.stamina <= 0.01) {
      this.exhausted = true;
      this.ctx.sound.play('exhausted', { pos: this.position });
    }
  }

  // ------------------------------------------------------------------ esquiva
  private canDodge() {
    const onGround = this.motor.grounded || this.motor.timeSinceGrounded < this.ctx.tuning.coyoteTime;
    return onGround && this.time >= this.dodgeReadyAt && !this.exhausted && this.stamina >= this.ctx.tuning.dodgeCost * 0.5;
  }

  private startDodge() {
    const T = this.ctx.tuning;
    const inp = this.ctx.input;
    const hasInput = Math.hypot(inp.moveX, inp.moveY) > 0.25;
    this.cancelActions();
    this.guarding = false;
    // Esquiva estilo BotW: sem rolamento. Saltos laterais para os lados,
    // mortal para trás (sem direção ou para trás) e um salto curto para frente.
    // Referência: o alvo travado ou, sem lock, a direção da câmera.
    const refYaw = this.lockTarget ? this.facing : this.aim.yaw;
    let type: DodgeType;
    let dirYaw: number;
    let durMul: number;
    if (!hasInput || inp.moveY < -0.5) {
      type = this.aim.firstPerson ? 'back' : 'flip';
      dirYaw = refYaw + Math.PI;
      durMul = type === 'flip' ? 1.1 : 0.8;
    } else if (Math.abs(inp.moveX) >= Math.abs(inp.moveY) * 0.8) {
      type = inp.moveX < 0 ? 'hopL' : 'hopR';
      dirYaw = refYaw + (inp.moveX < 0 ? Math.PI / 2 : -Math.PI / 2);
      durMul = 0.85;
    } else {
      type = 'hopF';
      dirYaw = refYaw;
      durMul = 0.8;
    }
    if (!this.lockTarget) this.facing = refYaw;
    this.dodgeType = type;
    yawToDir(dirYaw, this.dodgeDir);
    this.dodgeDur = T.dodgeDuration * durMul;
    this.setState('dodge');
    this.iFramesUntil = this.time + T.dodgeIFrameEnd * durMul;
    this.iFramesFrom = this.time + T.dodgeIFrameStart;
    this.useStamina(T.dodgeCost);
    if (type === 'flip') this.motor.velocity.y = 6.4;
    if (type === 'hopL' || type === 'hopR' || type === 'back' || type === 'hopF') this.motor.velocity.y = 4.2;
    this.ctx.events.emit('dodge', { pos: this.position.clone() });
    // esquiva perfeita: algum inimigo prestes a acertar?
    for (const th of this.ctx.threats()) {
      if (th.isThreatening(this.position, T.perfectDodgeWindow + 0.1)) {
        this.triggerPerfectDodge();
        break;
      }
    }
  }

  // ------------------------------------------------------------------ arco
  private startBow() {
    if (this.inventory.count('arrow') <= 0) {
      this.ctx.sound.play('noAmmo');
      this.ctx.events.emit('noAmmo', undefined);
      this.ctx.events.emit('toast', { text: 'Sem flechas!', kind: 'warn' });
      return;
    }
    this.bowDraw = 0;
    this.setState('bow');
    this.bowLoop = this.ctx.sound.loop('bowDraw');
  }

  bowOrigin(out: THREE.Vector3) {
    // mão do arco (lógica): à frente do ombro esquerdo, na altura do peito
    const f = yawToDir(this.aim.yaw, this.tmp2);
    out.copy(this.position);
    out.y += 1.45;
    out.addScaledVector(f, 0.45);
    return out;
  }

  private fireBow() {
    const T = this.ctx.tuning;
    const draw = this.bowDraw;
    this.stopBowLoop();
    if (draw < 0.12) {
      this.setState('move');
      return;
    }
    if (!this.inventory.remove('arrow', 1)) {
      this.setState('move');
      return;
    }
    const origin = this.bowOrigin(new THREE.Vector3());
    const target = this.aim.aimPoint(new THREE.Vector3());
    const dir = target.sub(origin).normalize();
    const speed = lerp(16, 58, Math.pow(draw, 1.2));
    const dmg = lerp(6, 24, draw) * T.damageMul;
    this.projectiles.fire(origin, dir.multiplyScalar(speed), 'player', this, dmg, draw);
    this.ctx.events.emit('bowFire', { pos: origin, power: draw });
    this.recoilImpulse = 0.4 + draw * 0.6;
    this.bowDraw = 0;
    this.setState('bowRecover');
  }

  // ------------------------------------------------------------------ update principal
  update(dt: number) {
    const ctx = this.ctx;
    const T = ctx.tuning;
    const inp = ctx.input;
    this.time += dt;
    this.stateT += dt;
    if (dt <= 0) {
      // hit stop / pausa: o tempo congela, mas comandos não podem se perder
      this.captureFrozenInput();
      return;
    }

    // ---------------------------------------------- morte / respawn
    if (this.state === 'dead') {
      this.motor.velocity.x = damp(this.motor.velocity.x, 0, 6, dt);
      this.motor.velocity.z = damp(this.motor.velocity.z, 0, 6, dt);
      this.motor.velocity.y -= T.gravity * dt;
      this.motor.update(dt);
      if (this.time > this.respawnAt) {
        this.spawn(this.spawnPoint, this.facing);
        ctx.events.emit('playerRespawn', undefined);
      }
      this.buildAnim(dt);
      return;
    }

    // ---------------------------------------------- troca de item pela barra
    for (let i = 0; i < 6; i++) {
      if (inp.consume(`slot${i + 1}` as 'slot1')) {
        this.inventory.select(i);
        this.requestEquip(this.inventory.hotbar[i]);
      }
    }
    if (inp.consume('nextItem') || inp.consume('prevItem')) {
      // roda do mouse: percorre só itens equipáveis da barra
      const dirN = inp.wasReleased('prevItem') ? -1 : 1;
      const hb = this.inventory.hotbar;
      for (let k = 1; k <= hb.length; k++) {
        const idx = (this.inventory.selected + dirN * k + hb.length * 2) % hb.length;
        const id = hb[idx];
        if (id && ITEMS[id].weapon) {
          this.inventory.select(idx);
          this.requestEquip(id);
          break;
        }
      }
    }

    // ---------------------------------------------- lock-on
    if (inp.consume('lock')) {
      if (this.lockTarget) this.lockTarget = null;
      else {
        const fwd = yawToDir(this.aim.yaw, this.tmp2);
        this.lockTarget = ctx.combat.findLockTarget(this.position, fwd, 18, 70, 'player');
        if (!this.lockTarget) this.aim.recenter();
      }
    }
    if (this.lockTarget) {
      this.lockTarget.center(this.tmp);
      if (!this.lockTarget.alive || this.tmp.distanceTo(this.position) > 26) this.lockTarget = null;
    }

    // ---------------------------------------------- stamina
    this.staminaDelay -= dt;
    if (this.staminaDelay <= 0 && !this.sprinting) {
      this.stamina = Math.min(T.staminaMax, this.stamina + T.staminaRegen * dt * (this.exhausted ? 0.8 : 1));
    }
    if (this.exhausted && this.stamina >= T.staminaMax * 0.999) this.exhausted = false;

    // ---------------------------------------------- inputs de ação (com buffer)
    const attackPressed = inp.consume('attack');
    const attackReleased = inp.wasReleased('attack');
    const dodgePressed = inp.consume('dodge');
    const guardPressed = inp.wasPressed('guard');
    const guardHeld = inp.isHeld('guard');
    if (attackPressed) {
      this.attackPressAt = this.time;
      this.attackHeld = true;
    }
    if (!inp.isHeld('attack')) this.attackHeld = false;
    if (guardPressed) this.guardPressAt = this.time;
    if (inp.wasPressed('jump')) this.jumpBufferedUntil = this.time + T.jumpBuffer;
    if (inp.wasReleased('jump') && this.motor.velocity.y > 0 && this.jumpedSinceGround && !this.jumpCut) {
      this.motor.velocity.y *= T.jumpCutMul;
      this.jumpCut = true;
    }

    // registra comandos pressionados perto do fim da ação atual (1 slot, sem fila)
    const bufWindow = T.attackBuffer;
    if (attackPressed && this.state !== 'move' && this.state !== 'bow' && this.state !== 'charge') {
      if (this.remainingActionTime() <= bufWindow || (this.state === 'attack' && this.inChainWindow())) {
        this.buffered = { kind: 'attack', t: this.time };
      }
    }
    if (dodgePressed && this.state !== 'move' && !this.dodgeAllowedNow()) {
      if (this.remainingActionTime() <= bufWindow) this.buffered = { kind: 'dodge', t: this.time };
    }
    if (this.buffered && this.time - this.buffered.t > bufWindow + 0.1) this.buffered = null;

    // ---------------------------------------------- máquina de estados
    this.guarding = false;
    switch (this.state) {
      case 'move': {
        const wantAttack = attackPressed || this.buffered?.kind === 'attack';
        const wantDodge = dodgePressed || this.buffered?.kind === 'dodge';
        if (wantDodge && this.canDodge()) {
          this.buffered = null;
          this.startDodge();
          break;
        }
        if (this.pendingEquip) {
          this.tryStartEquip();
          if (this.cur() === 'equip') break;
        }
        if (wantAttack) {
          this.buffered = null;
          if (this.mainHand === 'bow') this.startBow();
          else if (this.inFlurryWindow && this.weapon) this.startFlurry();
          else if (this.weapon) this.startComboAttack();
          if (this.cur() !== 'move') break;
        }
        // segurar ataque parado (sem golpe em andamento) → carga
        if (this.attackHeld && this.weapon?.charged && this.time - this.attackPressAt > 0.3 && this.motor.grounded) {
          this.startCharge();
          break;
        }
        this.guarding = guardHeld && this.mainHand !== 'bow' && (this.hasShield || !!this.weapon);
        break;
      }
      case 'attack': {
        const a = this.attack!;
        const tm = a.timing;
        const tRec = this.stateT - tm.windup - tm.active;
        const flurry = a.flurry;
        // cancelamento com defesa/esquiva nas janelas configuradas
        if ((dodgePressed || this.buffered?.kind === 'dodge') && this.canCancelAttack() && this.canDodge() && !flurry) {
          this.buffered = null;
          this.startDodge();
          break;
        }
        if (guardPressed && this.canCancelAttack() && !flurry) {
          this.attack = null;
          this.setState('move');
          this.guarding = true;
          break;
        }
        if (flurry) {
          if (this.stateT >= tm.total) {
            if (this.flurryHits < 6) this.nextFlurrySwing();
            else {
              this.ctx.clock.slowWorld(1, 0.01);
              this.attack = null;
              this.setState('move');
            }
          }
          break;
        }
        // segurou o botão desde o golpe → vira carga após a janela ativa
        if (this.attackHeld && tRec >= 0 && this.time - this.attackPressAt > 0.3 && a.weapon.charged && !a.charged && this.motor.grounded && a.def.id !== a.weapon.air) {
          this.startCharge();
          break;
        }
        // próximo golpe do combo (buffer)
        // (com troca de item pendente o golpe termina a recuperação inteira antes de trocar)
        if (this.buffered?.kind === 'attack' && tRec >= a.def.chainAt && a.def.next && !a.charged && !this.pendingEquip) {
          this.buffered = null;
          this.comboResetAt = this.time + 0.5;
          this.startComboAttack();
          break;
        }
        if (this.stateT >= tm.total) {
          this.comboResetAt = this.time + 0.35;
          if (!a.def.next || a.charged) this.comboIndex = 0;
          this.attack = null;
          this.setState('move');
        }
        break;
      }
      case 'charge': {
        this.chargeT += dt;
        const full = this.chargeT >= T.chargeTime;
        this.chargeLoop?.set(clamp01(this.chargeT / T.chargeTime));
        if (full && !this.chargeReadyFired) {
          this.chargeReadyFired = true;
          ctx.events.emit('chargeReady', { pos: this.position.clone().setY(this.position.y + 1.2) });
        }
        if (dodgePressed && this.canDodge()) {
          this.startDodge();
          break;
        }
        if (guardPressed) {
          this.setState('move');
          break;
        }
        if (!inp.isHeld('attack') || attackReleased) {
          const w = this.weapon;
          if (full && w?.charged) {
            this.startAttack(ATTACKS[w.charged], true);
            if (this.cur() !== 'attack') this.setState('move');
          } else {
            this.setState('move');
          }
          this.chargeT = 0;
        }
        break;
      }
      case 'dodge': {
        if (this.stateT >= this.dodgeDur) {
          this.dodgeReadyAt = this.time + T.dodgeCooldown;
          this.setState('move');
        }
        break;
      }
      case 'bow': {
        if (dodgePressed && this.canDodge()) {
          this.startDodge();
          break;
        }
        if (guardPressed) {
          // cancelar antes de soltar: não consome flecha
          this.bowDraw = 0;
          this.setState('move');
          ctx.sound.play('unequip', { pos: this.position });
          break;
        }
        this.bowDraw = Math.min(1, this.bowDraw + dt / 0.85);
        this.bowLoop?.set(this.bowDraw);
        this.facing = this.aim.yaw;
        if (!inp.isHeld('attack')) this.fireBow();
        break;
      }
      case 'bowRecover': {
        if (this.stateT >= 0.22) {
          this.setState('move');
          if (this.buffered?.kind === 'attack' && inp.isHeld('attack')) {
            this.buffered = null;
            this.startBow();
          }
        }
        break;
      }
      case 'equip': {
        const dur = this.equipTarget?.slot === 'off' ? 0.22 : (this.equipTarget?.item ? WEAPONS[ITEMS[this.equipTarget.item].weapon ?? 'sword']?.equipTime ?? 0.25 : 0.2);
        if (!this.equipSwapDone && this.stateT >= dur * 0.5) this.applyEquipSwap();
        if (this.stateT >= dur) {
          this.setState('move');
          this.equipTarget = null;
        }
        break;
      }
      case 'hurt': {
        if (this.stateT >= this.hurtDur) this.setState('move');
        break;
      }
      case 'guardHit': {
        this.guarding = guardHeld;
        if (this.stateT >= 0.25) this.setState('move');
        break;
      }
      case 'stagger': {
        if (this.stateT >= 0.35) {
          this.attack = null;
          this.setState('move');
        }
        break;
      }
    }

    // ---------------------------------------------- movimento
    this.updateMovement(dt);

    // ---------------------------------------------- acerto corpo a corpo
    this.updateAttackHits();

    // flechas cravadas: recolher ao passar por cima
    const got = this.projectiles.collectNear(this.position, 0.9);
    if (got > 0) {
      this.inventory.add('arrow', got);
      ctx.events.emit('pickup', { item: 'arrow', count: got, pos: this.position.clone().setY(this.position.y + 0.3) });
    }

    // hurtbox (cápsula do corpo)
    const p = this.position;
    const crouch = this.state === 'dodge' && this.dodgeType === 'flip' ? 0.75 : 1;
    this.hurtboxes[0].a.set(p.x, p.y + 0.35, p.z);
    this.hurtboxes[0].b.set(p.x, p.y + 1.45 * crouch, p.z);

    this.guardAmount = damp(this.guardAmount, this.guarding || this.state === 'guardHit' ? 1 : 0, 22, dt);
    this.buildAnim(dt);
  }

  /** Durante o congelamento (hit stop), guarda os comandos para o próximo frame válido. */
  private captureFrozenInput() {
    const inp = this.ctx.input;
    const T = this.ctx.tuning;
    if (inp.consume('attack')) {
      this.attackPressAt = this.time;
      this.attackHeld = true;
      this.buffered = { kind: 'attack', t: this.time };
    }
    if (!inp.isHeld('attack')) this.attackHeld = false;
    if (inp.consume('dodge')) this.buffered = { kind: 'dodge', t: this.time };
    if (inp.wasPressed('guard')) this.guardPressAt = this.time;
    if (inp.wasPressed('jump')) this.jumpBufferedUntil = this.time + T.jumpBuffer;
  }

  private inChainWindow() {
    const a = this.attack;
    if (!a) return false;
    const tRec = this.stateT - a.timing.windup - a.timing.active;
    return tRec >= -a.timing.active; // a partir da janela ativa aceita o próximo comando
  }

  private dodgeAllowedNow() {
    return this.state === 'attack' && this.canCancelAttack();
  }

  // ------------------------------------------------------------------ locomoção
  private updateMovement(dt: number) {
    const ctx = this.ctx;
    const T = ctx.tuning;
    const inp = ctx.input;
    const m = this.motor;
    const v = m.velocity;
    const mag = Math.min(1, Math.hypot(inp.moveX, inp.moveY));
    const inYaw = this.inputYaw();
    const wantSprint = inp.isHeld('sprint') && mag > 0.3 && !this.exhausted;

    let maxSpeed = 0;
    let steer = true;
    let faceMode: 'move' | 'aim' | 'lock' | 'none' = 'move';
    let accel = T.acceleration;
    const decel = T.deceleration;
    this.sprinting = false;

    switch (this.state) {
      case 'move': {
        if (this.guarding) {
          maxSpeed = T.walkSpeed * 0.95;
          faceMode = this.lockTarget ? 'lock' : 'aim';
          if (!this.lockTarget && T.lockOnAssist && !this.aim.firstPerson) {
            // assistência: com o escudo erguido, vira para a ameaça mais próxima
            const near = ctx.combat.findLockTarget(this.position, yawToDir(this.aim.yaw, this.tmp2), 4.5, 80, 'player');
            if (near && near.team === 'enemy') {
              near.center(this.tmp).sub(this.position);
              this.facing = dampAngle(this.facing, dirToYaw(this.tmp.x, this.tmp.z), T.turnSpeed, dt);
              faceMode = 'none';
            }
          }
        } else {
          const runSp = mag < 0.55 ? T.walkSpeed * (mag / 0.55) : lerp(T.walkSpeed, T.runSpeed, (mag - 0.55) / 0.45);
          maxSpeed = this.exhausted ? T.walkSpeed * 0.8 : runSp;
          if (wantSprint && m.grounded) {
            maxSpeed = T.sprintSpeed;
            this.sprinting = true;
            this.useStamina(T.sprintCost * dt);
            this.staminaDelay = 0.5;
          }
          faceMode = this.lockTarget ? 'lock' : 'move';
        }
        break;
      }
      case 'charge':
        maxSpeed = T.walkSpeed * 0.55;
        faceMode = this.lockTarget ? 'lock' : 'aim';
        break;
      case 'bow':
      case 'bowRecover':
        maxSpeed = T.walkSpeed * 0.7;
        faceMode = 'aim';
        break;
      case 'equip':
        maxSpeed = T.runSpeed * 0.8;
        faceMode = this.lockTarget ? 'lock' : 'move';
        break;
      case 'attack': {
        steer = false;
        faceMode = 'none';
        const a = this.attack!;
        const t = this.stateT;
        const tm = a.timing;
        // avanço (lunge) na preparação/golpe, travado no fim
        let lunge = 0;
        if (t < tm.windup + tm.active) lunge = a.def.lunge * (t < tm.windup ? 0.6 : 1);
        const fwd = yawToDir(a.yaw, this.tmp);
        // não avança "dentro" do alvo
        if (lunge > 0) {
          const near = ctx.combat.findLockTarget(this.position, fwd, 1.1, 60, 'player');
          if (near) lunge = 0;
        }
        const targetVx = fwd.x * lunge, targetVz = fwd.z * lunge;
        v.x = approach(v.x, targetVx, decel * dt * 1.2);
        v.z = approach(v.z, targetVz, decel * dt * 1.2);
        this.facing = dampAngle(this.facing, a.yaw, 30, dt);
        break;
      }
      case 'dodge': {
        steer = false;
        faceMode = 'none';
        const u = clamp01(this.stateT / this.dodgeDur);
        const dist = T.dodgeDistance * (this.dodgeType === 'back' ? 0.6 : this.dodgeType === 'flip' ? 0.9 : this.dodgeType === 'hopF' ? 0.75 : 1);
        const sp = (dist / this.dodgeDur) * (1.4 - 0.8 * u);
        v.x = this.dodgeDir.x * sp;
        v.z = this.dodgeDir.z * sp;
        break;
      }
      case 'hurt':
      case 'guardHit':
      case 'stagger':
        steer = false;
        faceMode = 'none';
        v.x = damp(v.x, 0, 7, dt);
        v.z = damp(v.z, 0, 7, dt);
        break;
    }

    if (steer) {
      if (!m.grounded) accel *= T.airControl;
      const tx = mag > 0.05 ? Math.sin(inYaw) * maxSpeed * Math.min(1, mag / 0.55 > 1 ? 1 : 1) : 0;
      const tz = mag > 0.05 ? Math.cos(inYaw) * maxSpeed : 0;
      const speedNow = Math.hypot(v.x, v.z);
      const targetSpeed = Math.hypot(tx, tz);
      // acelera rápido, freia ainda mais rápido (sem "patinar")
      const rate = targetSpeed > speedNow + 0.01 ? accel : (m.grounded ? decel : decel * T.airControl);
      // curva fechada: freia antes de trocar de direção
      const dx = tx - v.x, dz = tz - v.z;
      const dl = Math.hypot(dx, dz);
      const step = rate * dt;
      if (dl <= step) {
        v.x = tx;
        v.z = tz;
      } else {
        v.x += (dx / dl) * step;
        v.z += (dz / dl) * step;
      }
    }

    // orientação do corpo
    const T2 = T.turnSpeed;
    if (this.aim.firstPerson && this.state !== 'dodge') {
      this.facing = this.aim.yaw;
    } else if (faceMode === 'move' && mag > 0.1) {
      this.facing = dampAngle(this.facing, inYaw, T2, dt);
    } else if (faceMode === 'aim') {
      this.facing = dampAngle(this.facing, this.aim.yaw, T2 * 1.3, dt);
    } else if (faceMode === 'lock' && this.lockTarget) {
      this.lockTarget.center(this.tmp).sub(this.position);
      this.facing = dampAngle(this.facing, dirToYaw(this.tmp.x, this.tmp.z), T2, dt);
    }
    this.facing = wrapAngle(this.facing);
    this.turnRate = angleDelta(this.lastFacing, this.facing) / dt;
    this.lastFacing = this.facing;

    // ---------------------------------------------- salto: coyote time + buffer
    if (m.grounded) {
      this.jumpedSinceGround = false;
      this.jumpCut = false;
      this.airAttackUsed = false;
    }
    const canJumpState = this.state === 'move' || this.state === 'equip';
    const coyoteOk = m.grounded || (m.timeSinceGrounded <= T.coyoteTime && !this.jumpedSinceGround && v.y <= 0.01);
    if (this.time < this.jumpBufferedUntil && coyoteOk && canJumpState) {
      v.y = Math.sqrt(2 * T.gravity * T.jumpHeight);
      m.grounded = false;
      this.jumpedSinceGround = true;
      this.jumpBufferedUntil = -10;
      this.ctx.events.emit('jump', { pos: this.position.clone() });
      if (!this.ctx.input.isHeld('jump')) {
        // salto bufferizado com botão já solto: salto curto
        v.y *= Math.max(T.jumpCutMul, 0.7);
        this.jumpCut = true;
      }
    }

    // gravidade (queda mais pesada que subida → salto com peso)
    if (!m.grounded || v.y > 0) {
      const gMul = v.y < 0 ? T.fallGravityMul : 1;
      const floaty = this.state === 'attack' && this.attack?.def.id === this.weapon?.air ? 0.4 : 1;
      v.y -= T.gravity * gMul * floaty * dt;
      v.y = Math.max(v.y, -40);
    }

    m.update(dt);

    if (m.landedThisFrame) {
      const intensity = clamp01((m.landSpeed - 3) / 14);
      this.ctx.events.emit('land', { pos: this.position.clone(), intensity, surface: m.surface, player: true });
    }
  }

  // ------------------------------------------------------------------ detecção de acerto
  private updateAttackHits() {
    const a = this.attack;
    if (!a || this.state !== 'attack') {
      this.swingPhase = 'done';
      return;
    }
    const T = this.ctx.tuning;
    const tm = a.timing;
    const t = this.stateT;
    const sa = swingAngle(a.def, tm, t);
    this.swingAngle = sa.angle;
    this.swingPhase = sa.phase;

    // som do golpe sincronizado com o início da janela ativa
    if (!a.swung && t >= tm.windup) {
      a.swung = true;
      this.ctx.events.emit('swing', { pos: this.position.clone().setY(this.position.y + 1.3), intensity: a.def.whoosh, source: 'player' });
    }

    const t0 = Math.max(a.prevT, tm.windup);
    const t1 = Math.min(t, tm.windup + tm.active);
    a.prevT = t;
    if (t1 <= t0 || a.wallHit) {
      if (t > tm.windup + tm.active && !a.hitAny && !a.missed) {
        a.missed = true;
        this.ctx.events.emit('miss', { pos: this.position.clone(), intensity: a.def.strength });
      }
      return;
    }
    // sub-amostragem angular: no máximo ~6° por amostra (golpes rápidos não "pulam" alvos)
    const a0 = swingAngle(a.def, tm, t0).angle, a1 = swingAngle(a.def, tm, t1).angle;
    const steps = Math.max(1, Math.ceil(Math.abs(a1 - a0) / 6));
    for (let i = 1; i <= steps; i++) {
      const ts = t0 + ((t1 - t0) * i) / steps;
      const ang = swingAngle(a.def, tm, ts).angle;
      bladeSegmentWorld(a.def, a.weapon, ang, T.rangeMul, this.position, a.yaw, 1, this.hand, this.base, this.tip, this.bdir, this.edge);
      const hits = this.ctx.combat.querySegment(this.base, this.tip, a.weapon.hitRadius, 'player', a.hitSet);
      for (const h of hits) {
        a.hitSet.add(h.target.id);
        a.hitAny = true;
        const hit: HitInfo = {
          attacker: this, team: 'player', tool: a.weapon.tool,
          damage: a.def.damage * T.damageMul,
          strength: a.def.strength, knockback: a.def.knockback,
          point: h.point, dir: this.edge.clone(), normal: h.normal, hurtbox: h.hurtbox,
          projectile: false, charged: a.charged, origin: this.position.clone(),
          unblockable: !!a.flurry,
        };
        const result = h.target.receiveHit(hit);
        this.ctx.events.emit('hit', { hit, result, target: h.target, source: 'player' });
        if (a.flurry) this.ctx.events.emit('flurryHit', { pos: h.point });
        if (result.deflected) {
          this.bounce();
          return;
        }
        if (T.weaponRecoil) this.recoilImpulse = 0.35 + a.def.strength * 0.8;
      }
      // lâmina bateu em parede/cenário sólido?
      const wall = this.ctx.physics.pointInside(this.tip);
      if (wall && !a.hitAny) {
        a.wallHit = true;
        this.ctx.events.emit('wallHit', {
          pos: this.tip.clone(), dir: this.edge.clone(), normal: this.edge.clone().negate(),
          material: wall.material, intensity: a.def.strength,
        });
        this.bounce();
        return;
      }
    }
  }

  /** Arma ricocheteia (parede, escudo de metal, pedra com ferramenta errada). */
  private bounce() {
    if (this.ctx.tuning.weaponRecoil) this.recoilImpulse = 1.4;
    if (this.attack) this.attack.wallHit = true;
    this.setState('stagger');
    this.motor.velocity.addScaledVector(yawToDir(this.facing, this.tmp), -3);
  }

  // ------------------------------------------------------------------ entrada da animação
  private buildAnim(dt: number) {
    const s = this.anim;
    const v = this.motor.velocity;
    s.speed = Math.hypot(v.x, v.z);
    s.runSpeed = this.ctx.tuning.runSpeed;
    s.walkSpeed = this.ctx.tuning.walkSpeed;
    s.moveAngle = s.speed > 0.2 ? angleDelta(this.facing, dirToYaw(v.x, v.z)) : 0;
    s.grounded = this.motor.grounded;
    s.vy = v.y;
    s.turnRate = this.turnRate;
    s.guard = this.guardAmount;
    s.exhausted = this.exhausted;
    s.sprinting = this.sprinting;
    s.aimPitch = this.aim.pitch;
    s.crouch = damp(s.crouch, this.state === 'charge' ? 0.55 : this.guarding ? 0.25 : 0, 12, dt);
    s.attackTwist = 0;
    s.spinYaw = 0;
    const map: Record<PlayerState, AnimAction> = {
      move: 'none', attack: 'attack', charge: 'charge', dodge: 'dodge', bow: 'bow', bowRecover: 'bow',
      equip: 'equip', hurt: 'hurt', stagger: 'guardHit', guardHit: 'guardHit', dead: 'dead',
    };
    s.action = map[this.state];
    s.actionT = this.stateT;
    s.actionU = 0;
    switch (this.state) {
      case 'attack': {
        const a = this.attack!;
        s.actionU = clamp01(this.stateT / a.timing.total);
        s.attackTwist = -(this.swingAngle * Math.PI / 180) * a.def.bodyTwist * 0.6;
        if (a.def.spin) {
          const ang = this.swingAngle;
          s.spinYaw = ((60 - ang) * Math.PI) / 180;
          s.attackTwist = 0;
        }
        break;
      }
      case 'charge':
        s.actionU = clamp01(this.chargeT / this.ctx.tuning.chargeTime);
        s.attackTwist = 0.5;
        break;
      case 'dodge':
        s.actionU = clamp01(this.stateT / this.dodgeDur);
        s.dodgeType = this.dodgeType;
        break;
      case 'equip':
        s.actionU = clamp01(this.stateT / 0.3);
        break;
      case 'hurt': {
        s.actionU = clamp01(this.stateT / this.hurtDur);
        // direção do empurrão em espaço local
        const f = yawToDir(this.facing, this.tmp);
        s.hurtZ = this.hurtDir.dot(f) * -1;
        s.hurtX = this.hurtDir.x * f.z - this.hurtDir.z * f.x;
        break;
      }
      case 'stagger':
      case 'guardHit':
        s.actionU = clamp01(this.stateT / 0.3);
        break;
      case 'dead':
        s.actionU = clamp01(this.stateT / 1);
        break;
      case 'bow':
        s.bowDraw = this.bowDraw;
        break;
    }
    if (this.state !== 'bow') s.bowDraw = damp(s.bowDraw, 0, 20, dt);
  }

  /** Pose lógica da arma no golpe atual (para views). */
  swingPose(outDirLocal: THREE.Vector3, outEdgeLocal: THREE.Vector3): AttackDef | null {
    if (this.state === 'attack' && this.attack) {
      swingDirLocal(this.attack.def, this.swingAngle, outDirLocal, outEdgeLocal);
      return this.attack.def;
    }
    return null;
  }
}
