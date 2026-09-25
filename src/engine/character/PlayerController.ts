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
  /** Raio da mira (posição e direção da câmera). */
  aimRay(origin: THREE.Vector3, dir: THREE.Vector3): void;
  recenter(): void;
}

export type PlayerState =
  | 'move' | 'attack' | 'charge' | 'dodge' | 'bow' | 'bowRecover' | 'equip' | 'hurt' | 'stagger' | 'guardHit' | 'dead'
  | 'climb' | 'mantle';

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
  /** Inclinação do golpe seguindo a mira (rad, + = para cima). */
  aimPitch: number;
  /** Golpe de salto (começou no ar). */
  air?: boolean;
  /** Já bateu no chão (golpe de salto). */
  slammed?: boolean;
  plunged?: boolean;
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
  /** Esgueirando (Ctrl liga/desliga, como no BotW): agachado, lento e silencioso. */
  sneaking = false;
  /** 0..1 suavizado (câmera, sons). */
  sneakAmount = 0;
  // ---- escalada (estilo BotW)
  /** Normal da parede sendo escalada (aponta para fora). */
  readonly climbN = new THREE.Vector3();
  /** Ponto na superfície da parede (x,z) com y = topo do bloco (para as mãos). */
  readonly climbWall = new THREE.Vector3();
  /** Fase do ciclo de escalada (braços/pernas alternando). */
  climbPhase = 0;
  /** 0..1: quanto está se movendo na parede. */
  climbMove = 0;
  /** Direção de movimento na parede (x: + direita, y: + cima), suavizada. */
  readonly climbDir = new THREE.Vector2();
  /** Salto na parede (tempo restante). */
  climbJumpT = 0;
  private climbJumpDir = new THREE.Vector2();
  private climbTop = 0;
  private climbPushT = 0;
  private mantleFrom = new THREE.Vector3();
  private mantleTo = new THREE.Vector3();
  private mantleDur = 0.5;
  /** Agarrou a parede agora (corpo cede com o peso). */
  climbGrabT = 0;
  /** Preparação do salto na parede (junta forças antes do impulso). */
  private climbGatherT = 0;
  private mantleH = 1;
  private mantleJerked = false;
  /** Recuperação da aterrissagem pesada (anda devagar). */
  private landLagT = 0;
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
  private airSpeed = 0;
  private airSprint = false;
  /** Ângulo atual do golpe (para views). */
  swingAngle = 0;
  swingPhase: 'windup' | 'active' | 'recovery' | 'done' = 'done';
  swingU = 0;
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
    // arco e ferramentas de duas mãos guardam o escudo nas costas
    return this.offHand === 'shield' && this.mainHand !== 'bow' && this.mainHand !== 'axe' && this.mainHand !== 'pickaxe';
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
    this.sneaking = false;
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

  // ------------------------------------------------------------------ escalada
  /**
   * Andando contra uma parede: beirada baixa → sobe direto; beirada ao alcance
   * no ar → agarra e sobe; parede alta → gruda e escala (como no BotW).
   */
  private tryClimb(dt: number, mag: number, inYaw: number) {
    const m = this.motor;
    if (mag < 0.5 || this.lockTarget) {
      this.climbPushT = 0;
      return;
    }
    const dx = Math.sin(inYaw), dz = Math.cos(inYaw);
    const reach = m.radius + 0.3;
    const W = this.ctx.physics;
    const p = this.position;
    const hit = W.probeWall(p.x, p.z, p.y + 1.1, dx, dz, reach) ?? W.probeWall(p.x, p.z, p.y + 0.5, dx, dz, reach);
    // precisa estar indo DE ENCONTRO à parede
    if (!hit || dx * -hit.nx + dz * -hit.nz < 0.6) {
      this.climbPushT = 0;
      return;
    }
    const h = hit.top - p.y;
    if (h <= m.stepUp + 0.02) return;
    this.climbPushT += dt;
    const air = !m.grounded;
    if (h <= 1.25) {
      // beirada baixa: sobe andando (no ar, na hora)
      if (air || this.climbPushT > 0.12) this.startMantle(hit.x, hit.z, hit.nx, hit.nz, hit.top);
    } else if (air && h <= 2.15) {
      // beirada ao alcance das mãos no pulo: agarra e sobe
      this.startMantle(hit.x, hit.z, hit.nx, hit.nz, hit.top);
    } else if (!this.exhausted && this.stamina > 1 && (air || this.climbPushT > 0.2)) {
      this.startClimb(hit.x, hit.z, hit.nx, hit.nz, hit.top);
    }
  }

  /** Sai do esgueirar NA HORA (atacar/mirar levanta o personagem instantaneamente). */
  private standUp() {
    if (!this.sneaking && this.sneakAmount < 0.01) return;
    this.sneaking = false;
    this.sneakAmount = 0;
    this.anim.sneakSnap = true;
  }

  private faceWall(nx: number, nz: number) {
    this.facing = dirToYaw(-nx, -nz);
  }

  private startClimb(x: number, z: number, nx: number, nz: number, top: number) {
    this.cancelActions();
    this.guarding = false;
    this.sneaking = false;
    this.climbN.set(nx, 0, nz).normalize();
    this.climbTop = top;
    this.climbWall.set(x, top, z);
    this.climbJumpT = 0;
    const r = this.motor.radius * 0.85;
    this.position.x = x + nx * r;
    this.position.z = z + nz * r;
    this.motor.velocity.set(0, 0, 0);
    this.motor.grounded = false;
    this.faceWall(nx, nz);
    this.setState('climb');
    // agarrou: o corpo "cai" um pouco e segura (peso)
    this.climbGrabT = 0.35;
    if (this.ctx.tuning.shakeEnabled) this.ctx.shake.add(0.12);
    this.ctx.events.emit('footstep', { pos: this.position.clone(), surface: 'stone', intensity: 0.5, player: true });
  }

  private startMantle(x: number, z: number, nx: number, nz: number, top: number) {
    this.cancelActions();
    this.guarding = false;
    this.mantleFrom.copy(this.position);
    // ponto em cima do bloco, um pouco para dentro da borda
    const inside = this.motor.radius + 0.22;
    this.mantleTo.set(x - nx * inside, top, z - nz * inside);
    const h = Math.max(0, top - this.position.y);
    this.mantleH = h;
    // subir tem esforço: quanto mais alto, mais demora (pendura → puxa → joelho → de pé)
    this.mantleDur = clamp(0.42 + h * 0.3, 0.5, 1.05);
    this.climbN.set(nx, 0, nz).normalize();
    this.climbWall.set(x, top, z);
    this.mantleJerked = false;
    this.motor.velocity.set(0, 0, 0);
    this.faceWall(nx, nz);
    this.setState('mantle');
  }

  private detachClimb(push: number, up: number) {
    const n = this.climbN;
    this.motor.velocity.set(n.x * push, up, n.z * push);
    this.motor.grounded = false;
    this.climbPushT = -0.35; // não gruda de novo na hora
    this.setState('move');
  }

  private updateClimb(dt: number) {
    const T = this.ctx.tuning;
    const inp = this.ctx.input;
    const W = this.ctx.physics;
    const p = this.position;
    const n = this.climbN;
    this.staminaDelay = Math.max(this.staminaDelay, 0.5); // sem recuperar pendurado
    inp.consume('attack');
    inp.consume('dodge');
    // soltar (Ctrl) · pular para longe (pulo segurando para trás)
    if (inp.consume('sneak')) return this.detachClimb(1.2, 0);
    let mx = inp.moveX, my = inp.moveY;
    const len = Math.hypot(mx, my);
    if (len > 1) { mx /= len; my /= len; }
    if (inp.wasPressed('jump')) {
      if (my < -0.5) {
        this.faceWall(-n.x, -n.z);
        return this.detachClimb(5.5, 5.5);
      }
      if (this.climbJumpT <= 0 && this.climbGatherT <= 0 && this.stamina >= 8) {
        // salto na parede: junta forças (agacha na parede) e só então dá o impulso
        this.climbGatherT = 0.16;
        if (len < 0.2) this.climbJumpDir.set(0, 1);
        else this.climbJumpDir.set(mx, my).normalize();
        this.useStamina(T.dodgeCost * 1.4);
        this.ctx.events.emit('jump', { pos: p.clone() });
      }
    }
    if (this.climbGatherT > 0) {
      this.climbGatherT -= dt;
      if (this.climbGatherT <= 0) this.climbJumpT = 0.32;
    }
    this.climbGrabT = Math.max(0, this.climbGrabT - dt);
    // velocidade na parede: ritmo de braçadas (estica devagar → PUXA com força)
    const tired = clamp01(1 - this.stamina / (T.staminaMax * 0.3));
    // pico da puxada no meio de cada braçada (mesma fase da animação)
    const pull = Math.pow(Math.cos(this.climbPhase * Math.PI * 2), 2);
    const rhythm = (0.28 + 1.45 * pull) * (1 - 0.35 * tired) * (this.climbGrabT > 0.15 ? 0.2 : 1);
    let vx = mx * 1.35 * rhythm, vy = my * 1.5 * rhythm;
    if (this.climbGatherT > 0) { vx = 0; vy = -0.25; }
    if (this.climbJumpT > 0) {
      const k = this.climbJumpT / 0.32;
      vx = this.climbJumpDir.x * 6.5 * k;
      vy = this.climbJumpDir.y * 7.5 * k;
      this.climbJumpT -= dt;
    }
    const moving = Math.hypot(vx, vy) > 0.1;
    this.climbMove = damp(this.climbMove, moving ? 1 : 0, 10, dt);
    if (len > 0.2) this.climbDir.lerp(new THREE.Vector2(mx, my), 1 - Math.exp(-dt * 8));
    if (moving && this.climbJumpT <= 0) this.useStamina(9 * dt);
    if (this.stamina <= 0) {
      this.exhausted = true;
      return this.detachClimb(0.8, 0);
    }
    // direita do personagem (olhando para a parede)
    const fy = dirToYaw(-n.x, -n.z);
    const rx = -Math.cos(fy), rz = Math.sin(fy);
    // lateral: só se ainda houver parede no novo ponto
    const nxp = p.x + rx * vx * dt, nzp = p.z + rz * vx * dt;
    const probeFrom = (px: number, pz: number, y: number) => W.probeWall(px + n.x * 0.3, pz + n.z * 0.3, y, -n.x, -n.z, 0.3 + this.motor.radius + 0.4);
    let hit = Math.abs(vx) > 1e-4 ? probeFrom(nxp, nzp, p.y + 1.1) : null;
    if (hit) {
      p.x = nxp;
      p.z = nzp;
    } else {
      hit = probeFrom(p.x, p.z, p.y + 1.1);
    }
    // vertical
    p.y += vy * dt;
    // chão embaixo: descendo até o chão → solta de pé
    const g = W.groundHeight(p.x + n.x * 0.1, p.z + n.z * 0.1, p.y, 0.05);
    if (p.y <= g.y + 0.02) {
      p.y = g.y;
      if (my < -0.3 || !hit) {
        this.motor.grounded = true;
        this.climbPushT = -0.4;
        this.setState('move');
        return;
      }
    }
    hit = probeFrom(p.x, p.z, p.y + 1.1) ?? probeFrom(p.x, p.z, p.y + 0.4);
    if (!hit) return this.detachClimb(0.5, 0);
    // gruda na parede (segue ângulos e troca de bloco)
    n.lerp(new THREE.Vector3(hit.nx, 0, hit.nz), 1 - Math.exp(-dt * 20)).normalize();
    const r = this.motor.radius * 0.85;
    p.x = hit.x + hit.nx * r;
    p.z = hit.z + hit.nz * r;
    this.climbTop = hit.top;
    this.climbWall.set(hit.x, hit.top, hit.z);
    this.faceWall(n.x, n.z);
    // a fase avança com a intenção de mover (não com a velocidade instantânea)
    this.climbPhase += (Math.abs(my) * 1.5 + Math.abs(mx) * 1.35) * (1 - 0.35 * tired) * dt / 0.95;
    // chegou ao topo: as mãos passam da borda → sobe
    if (this.climbTop - p.y < 1.3 && vy >= -0.05) {
      return this.startMantle(hit.x, hit.z, hit.nx, hit.nz, this.climbTop);
    }
    this.motor.velocity.set(0, 0, 0);
    this.motor.grounded = false;
    this.motor.timeSinceGrounded = 0;
  }

  private updateMantle(dt: number) {
    const u = clamp01(this.stateT / this.mantleDur);
    const a = this.mantleFrom, b = this.mantleTo;
    // pendura e JUNTA FORÇA (cede um pouco) → TRANCO: puxão rápido que passa um
    // pouco do ponto → assenta → passa o joelho pela borda → levanta em cima
    const PULL = 0.22;
    const lift = clamp01((u - PULL) / 0.3);
    const jerk = 1 - Math.pow(1 - lift, 3); // sai rápido, desacelera
    const over = Math.sin(lift * Math.PI) * 0.07 * Math.min(1, this.mantleH);
    const up = Math.min(1, jerk);
    const sag = Math.sin(clamp01(u / PULL) * Math.PI * 0.5) * 0.09 * Math.min(1, this.mantleH) * (1 - lift);
    if (u >= PULL && !this.mantleJerked) {
      this.mantleJerked = true;
      this.ctx.events.emit('mantlePull', { pos: this.position.clone(), intensity: Math.min(1, this.mantleH / 1.8) });
    }
    const fw = clamp01((u - 0.5) / 0.4);
    const fws = fw * fw * (3 - 2 * fw);
    this.position.set(lerp(a.x, b.x, fws), lerp(a.y, b.y + 0.04, up) + over - sag, lerp(a.z, b.z, fws));
    this.motor.velocity.set(0, 0, 0);
    this.staminaDelay = Math.max(this.staminaDelay, 0.2);
    if (u >= 1) {
      this.position.copy(b);
      this.motor.grounded = true;
      this.motor.groundY = b.y;
      this.motor.timeSinceGrounded = 0;
      this.climbPushT = 0;
      this.setState('move');
      // pisa em cima com peso (poeira, som, câmera)
      this.ctx.events.emit('land', { pos: this.position.clone(), intensity: 0.25, surface: this.motor.surface, player: true });
    }
  }

  /** Troca o alvo travado para o próximo à esquerda (-1) ou direita (+1). */
  switchLock(side: 1 | -1): boolean {
    if (!this.lockTarget) return false;
    const t = this.ctx.combat.findSideTarget(this.position, this.lockTarget, side, 20, 'player');
    if (t) this.lockTarget = t;
    return !!t;
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
    this.standUp();
    this.pickFacingForAttack();
    const T = this.ctx.tuning;
    this.attack = {
      def, weapon: w, timing: attackTiming(def, T.attackSpeedMul, T.recoveryMul), yaw: this.facing,
      hitSet: new Set(), prevT: 0, swung: false, hitAny: false, charged, wallHit: false,
      aimPitch: def.spin ? 0 : this.attackAimPitch(),
    };
    this.setState('attack');
    this.buffered = null;
    return true;
  }

  private startComboAttack() {
    const w = this.weapon;
    if (!w || w.combo.length === 0) return;
    if (!this.motor.grounded && (this.jumpedSinceGround || this.motor.timeSinceGrounded > 0.1) && w.air) {
      if (this.airAttackUsed) return;
      this.airAttackUsed = true;
      if (this.startAttack(ATTACKS[w.air]) && this.attack) {
        // golpe de salto: pulinho para ganhar altura e ERGUER a arma
        this.attack.air = true;
        // segurar o botão depois do golpe aéreo não vira carga (sem espada "flutuando")
        this.attackHeld = false;
        this.attackPressAt = -1e9;
        const v = this.motor.velocity;
        v.y = Math.max(v.y, 3.2);
        this.airSpeed = Math.max(this.airSpeed * 0.9, 2.2);
      }
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
    this.standUp();
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
    // sem esquiva para a frente: só para frente não faz nada (nem gasta stamina);
    // na diagonal para frente vale o salto lateral
    const sideways = Math.abs(inp.moveX) > 0.3;
    if (hasInput && inp.moveY > 0.25 && !sideways) return;
    this.cancelActions();
    this.guarding = false;
    // Esquiva estilo BotW: sem rolamento. Saltos laterais para os lados,
    // pulo para trás (sem direção ou para trás). Para a frente não há esquiva.
    // Referência: o alvo travado ou, sem lock, a direção da câmera.
    const refYaw = this.lockTarget ? this.facing : this.aim.yaw;
    let type: DodgeType;
    let dirYaw: number;
    let durMul: number;
    if (!hasInput || inp.moveY < -0.5) {
      type = 'back';
      dirYaw = refYaw + Math.PI;
      durMul = 1.35; // cobre o tempo no ar (~0,46 s) até a aterrissagem
    } else {
      type = inp.moveX < 0 ? 'hopL' : 'hopR';
      dirYaw = refYaw + (inp.moveX < 0 ? Math.PI / 2 : -Math.PI / 2);
      durMul = 0.85;
    }
    if (!this.lockTarget) this.facing = refYaw;
    this.dodgeType = type;
    yawToDir(dirYaw, this.dodgeDir);
    this.dodgeDur = T.dodgeDuration * durMul;
    this.setState('dodge');
    this.iFramesUntil = this.time + T.dodgeIFrameEnd * durMul;
    this.iFramesFrom = this.time + T.dodgeIFrameStart;
    this.useStamina(T.dodgeCost);
    if (type === 'back') this.motor.velocity.y = 6.6;
    else if (type === 'hopL' || type === 'hopR' || type === 'hopF') this.motor.velocity.y = 4.2;
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
    this.standUp();
    this.setState('bow');
    this.bowLoop = this.ctx.sound.loop('bowDraw');
  }

  bowOrigin(out: THREE.Vector3) {
    // mão do arco (lógica): braço esquerdo esticado na direção da mira, na altura do ombro
    // (com o corpo de lado, o ombro esquerdo fica praticamente na linha da mira)
    const cp = Math.cos(this.aim.pitch);
    this.tmp2.set(Math.sin(this.aim.yaw) * cp, Math.sin(this.aim.pitch), Math.cos(this.aim.yaw) * cp);
    out.copy(this.position);
    out.y += 1.47;
    out.addScaledVector(this.tmp2, 0.7);
    // linha do tiro ao lado do rosto (mesmo deslocamento do visual)
    out.x += -Math.cos(this.aim.yaw) * 0.2;
    out.z += Math.sin(this.aim.yaw) * 0.2;
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
    const target = this.aim.aimPoint(new THREE.Vector3());
    const origin = this.bowOrigin(new THREE.Vector3());
    if (this.aim.firstPerson) {
      // 1ª pessoa: a flecha sai NA linha da mira (sem paralaxe do lado do rosto)
      const ro = new THREE.Vector3(), rd = new THREE.Vector3();
      this.aim.aimRay(ro, rd);
      origin.copy(ro).addScaledVector(rd, 0.6);
    }
    const speed = lerp(16, 58, Math.pow(draw, 1.2));
    const dir = ballisticDir(origin, target, speed, this.projectiles.gravity);
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
      if (!this.lockTarget.alive) {
        // alvo caiu: passa para o próximo inimigo à vista (como no Zelda)
        const fwd = yawToDir(this.aim.yaw, this.tmp2);
        this.lockTarget = ctx.combat.findLockTarget(this.position, fwd, 18, 90, 'player');
      } else if (this.tmp.distanceTo(this.position) > 26) this.lockTarget = null;
    }

    // ---------------------------------------------- stamina
    this.staminaDelay -= dt;
    if (this.staminaDelay <= 0 && !this.sprinting) {
      this.stamina = Math.min(T.staminaMax, this.stamina + T.staminaRegen * dt * (this.exhausted ? 0.8 : 1));
    }
    if (this.exhausted && this.stamina >= T.staminaMax * 0.999) this.exhausted = false;

    // ---------------------------------------------- escalada: estado próprio
    if (this.state === 'climb' || this.state === 'mantle') {
      if (this.state === 'climb') this.updateClimb(dt);
      else this.updateMantle(dt);
      this.buildAnim(dt);
      return;
    }

    // ---------------------------------------------- inputs de ação (com buffer)
    const attackPressed = inp.consume('attack');
    const attackReleased = inp.wasReleased('attack');
    // Esquiva como no BotW: só com a mira travada, e aí o botão de PULAR esquiva
    // (Ctrl/C/L também, mas só travado). Sem travar, pular pula.
    // esgueirar: Ctrl liga/desliga; correr, pular ou esquivar saem
    if (inp.consume('sneak')) this.sneaking = !this.sneaking;
    if (this.sneaking && (inp.wasPressed('sprint') || (inp.runLock && Math.hypot(inp.moveX, inp.moveY) > 0.3) || inp.wasPressed('jump') || this.state === 'dodge')) this.sneaking = false;
    this.sneakAmount = damp(this.sneakAmount, this.sneaking ? 1 : 0, 8, dt);
    const locked = !!this.lockTarget;
    const dodgeKey = inp.consume('dodge');
    // travado + só para frente: pular é pulo normal (não há esquiva para a frente)
    const fwdOnly = inp.moveY > 0.25 && Math.abs(inp.moveX) <= 0.3;
    const jumpDodges = locked && !fwdOnly;
    const dodgePressed = locked && (dodgeKey || (jumpDodges && inp.wasPressed('jump')));
    const guardPressed = inp.wasPressed('guard');
    const guardHeld = inp.isHeld('guard');
    if (attackPressed) {
      this.attackPressAt = this.time;
      this.attackHeld = true;
    }
    if (!inp.isHeld('attack')) this.attackHeld = false;
    if (guardPressed) this.guardPressAt = this.time;
    if (inp.wasPressed('jump') && !jumpDodges) this.jumpBufferedUntil = this.time + T.jumpBuffer;
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
        if (this.attackHeld && this.weapon?.charged && this.time - this.attackPressAt > 0.3 && this.motor.grounded && this.landLagT <= 0) {
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
        // caiu/saiu do chão carregando: cancela (nada de arma parada no ar)
        if (!this.motor.grounded && this.motor.timeSinceGrounded > 0.15) {
          this.setState('move');
          break;
        }
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
    const lockedB = !!this.lockTarget;
    const dodgeKeyB = inp.consume('dodge');
    const jumpDodgesB = lockedB && !(inp.moveY > 0.25 && Math.abs(inp.moveX) <= 0.3);
    if (lockedB && (dodgeKeyB || (jumpDodgesB && inp.wasPressed('jump')))) this.buffered = { kind: 'dodge', t: this.time };
    if (inp.wasPressed('guard')) this.guardPressAt = this.time;
    if (inp.wasPressed('jump') && !jumpDodgesB) this.jumpBufferedUntil = this.time + T.jumpBuffer;
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
    this.landLagT = Math.max(0, this.landLagT - dt);
    const mag = Math.min(1, Math.hypot(inp.moveX, inp.moveY));
    const inYaw = this.inputYaw();
    // travado no alvo não corre (andaria de costas/de lado em disparada)
    const wantSprint = (inp.isHeld('sprint') || inp.runLock) && mag > 0.3 && !this.exhausted && !this.lockTarget;

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
          // dois estados claros: ANDAR (padrão) e CORRER (segurando Correr/Shift)
          maxSpeed = T.walkSpeed * Math.min(1, mag / 0.8) * (this.exhausted ? 0.75 : 1);
          if (this.landLagT > 0) maxSpeed *= 0.15;
          if (this.sneaking) maxSpeed *= 0.55;
          else if (wantSprint && m.grounded) {
            maxSpeed = T.runSpeed;
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
        maxSpeed = T.walkSpeed;
        faceMode = this.lockTarget ? 'lock' : 'move';
        break;
      case 'attack': {
        steer = false;
        faceMode = 'none';
        const a = this.attack!;
        const t = this.stateT;
        const tm = a.timing;
        if (a.air) {
          // no ar: mantém o embalo para a frente (não "trava" no ar)
          const fwdA = yawToDir(a.yaw, this.tmp);
          const sp = a.slammed ? 0 : this.airSpeed;
          v.x = approach(v.x, fwdA.x * sp, decel * dt * 0.5);
          v.z = approach(v.z, fwdA.z * sp, decel * dt * 0.5);
          // começa o corte: mergulha em direção ao chão
          if (t >= tm.windup && !a.plunged && !m.grounded) {
            a.plunged = true;
            v.y = Math.min(v.y, -11);
          }
          this.facing = dampAngle(this.facing, a.yaw, 30, dt);
          break;
        }
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
        const dist = T.dodgeDistance * (this.dodgeType === 'back' ? 1.15 : this.dodgeType === 'flip' ? 0.9 : this.dodgeType === 'hopF' ? 0.75 : 1);
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

    // momento no ar: o salto mantém a velocidade de decolagem (correndo continua rápido)
    if (m.grounded) {
      this.airSpeed = Math.hypot(v.x, v.z);
      this.airSprint = this.sprinting;
    } else if (steer && this.state === 'move' && !this.guarding) {
      maxSpeed = Math.max(maxSpeed, this.airSpeed);
      this.sprinting = this.airSprint;
    }
    if (steer) {
      if (!m.grounded) accel *= T.airControl;
      const tx = mag > 0.05 ? Math.sin(inYaw) * maxSpeed : 0;
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
      // colado no alvo a direção fica instável: mantém a atual
      if (Math.hypot(this.tmp.x, this.tmp.z) > 0.6) this.facing = dampAngle(this.facing, dirToYaw(this.tmp.x, this.tmp.z), T2, dt);
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
      // golpe de salto: quase para no alto enquanto ergue a arma, depois despenca
      const air = this.state === 'attack' && this.attack?.air ? this.attack : null;
      const floaty = air ? (this.stateT < air.timing.windup ? 0.3 : 1.6) : 1;
      v.y -= T.gravity * gMul * floaty * dt;
      v.y = Math.max(v.y, -40);
    }

    m.update(dt);

    // parede/beirada à frente? (escalar ou subir na beirada)
    if (this.state === 'move' && !this.guarding) this.tryClimb(dt, mag, inYaw);

    if (m.landedThisFrame && this.state === 'attack' && this.attack?.air && !this.attack.slammed) {
      // pancada no chão: impacto forte e recuperação curta
      const a = this.attack;
      a.slammed = true;
      v.x *= 0.2;
      v.z *= 0.2;
      this.ctx.events.emit('land', { pos: this.position.clone(), intensity: 0.85, surface: m.surface, player: true });
      this.ctx.shake.add(0.35);
    } else if (m.landedThisFrame) {
      const intensity = clamp01((m.landSpeed - 3) / 14);
      // queda alta: o impacto prende o personagem um instante
      if (intensity > 0.45) this.landLagT = 0.12 + 0.4 * (intensity - 0.45);
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
    this.swingU = sa.u;

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
      bladeSegmentWorld(a.def, a.weapon, ang, T.rangeMul, this.position, a.yaw, 1, this.hand, this.base, this.tip, this.bdir, this.edge, a.aimPitch);
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
    }
  }

  /**
   * Altura do golpe pela mira: 1ª pessoa usa o pitch da câmera; 3ª pessoa
   * desconta a inclinação padrão da câmera (que olha um pouco para baixo);
   * travado, aponta para o centro do alvo.
   */
  private attackAimPitch(): number {
    let pitch: number;
    if (this.lockTarget) {
      this.lockTarget.center(this.tmp).sub(this.position);
      pitch = Math.atan2(this.tmp.y - 1.3, Math.max(0.8, Math.hypot(this.tmp.x, this.tmp.z)));
    } else pitch = this.aim.firstPerson ? this.aim.pitch : this.aim.pitch + 0.15;
    return clamp(pitch, -0.7, 0.9);
  }

  /** Arma ricocheteia (escudo de metal, pedra com ferramenta errada). */
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
    // na esquiva nada de torção de strafe no quadril: travado fica igual a destravado
    s.sneak = this.sneaking;
    s.strafing = this.state !== 'dodge' && (this.aim.firstPerson || !!this.lockTarget || this.guarding || this.state === 'bow' || this.state === 'bowRecover' || this.state === 'charge');
    s.grounded = this.motor.grounded;
    s.vy = v.y;
    s.turnRate = this.turnRate;
    s.guard = this.guardAmount;
    s.exhausted = this.exhausted;
    s.sprinting = this.sprinting;
    s.aimPitch = this.aim.pitch;
    s.crouch = damp(s.crouch, this.state === 'charge' ? 0.55 : this.guarding ? 0.25 : 0, 12, dt);
    s.attackTwist = 0;
    s.attackMotion = 0;
    s.attackWork = undefined;
    s.attackAir = false;
    s.attackSpin = false;
    s.climbPhase = this.climbPhase;
    s.climbMove = this.climbMove;
    s.climbDirX = this.climbDir.x;
    s.climbDirY = this.climbDir.y;
    s.climbJump = this.state === 'climb' ? clamp01(this.climbJumpT / 0.32) - clamp01(this.climbGatherT / 0.16) : 0;
    s.climbGrab = clamp01(this.climbGrabT / 0.35);
    s.climbTired = this.state === 'climb' ? clamp01(1 - this.stamina / (this.ctx.tuning.staminaMax * 0.3)) : 0;
    s.spinYaw = 0;
    const map: Record<PlayerState, AnimAction> = {
      move: 'none', attack: 'attack', charge: 'charge', dodge: 'dodge', bow: 'bow', bowRecover: 'bow', climb: 'climb', mantle: 'mantle',
      equip: 'equip', hurt: 'hurt', stagger: 'guardHit', guardHit: 'guardHit', dead: 'dead',
    };
    s.action = map[this.state];
    s.actionT = this.stateT;
    s.actionU = 0;
    if (this.state === 'mantle') s.actionU = clamp01(this.stateT / this.mantleDur);
    switch (this.state) {
      case 'attack': {
        const a = this.attack!;
        s.actionU = clamp01(this.stateT / a.timing.total);
        s.attackTwist = -(this.swingAngle * Math.PI / 180) * a.def.bodyTwist * 0.6;
        // curva do corpo: antecipação (−) na preparação → comprometimento (+) no golpe → volta
        const u = this.swingU;
        let k: number;
        if (this.swingPhase === 'windup') k = -0.9 * (1 - (1 - u) * (1 - u));
        else if (this.swingPhase === 'active') k = -0.9 + 1.9 * (1 - (1 - u) * (1 - u));
        else k = 1 - u * u * (3 - 2 * u);
        s.attackBody = k;
        s.attackSide = Math.sign(a.def.arc[1] - a.def.arc[0]) * (a.def.roll > 60 ? 0 : 1);
        s.attackMotion = a.def.bodyMotion ?? 0;
        s.attackOverhead = !!a.def.overhead;
        s.attackWork = a.def.work;
        s.attackAir = !!a.air && !a.slammed;
        s.attackSpin = !!a.def.spin;
        if (a.def.spin) {
          const ang = this.swingAngle;
          s.spinYaw = ((60 - ang) * Math.PI) / 180;
          s.attackTwist = 0;
        }
        break;
      }
      case 'charge': {
        s.attackMotion = 0;
        const cd = this.weapon?.charged ? ATTACKS[this.weapon.charged] : null;
        s.attackWork = cd?.work;
        s.attackSpin = !!cd?.spin;
        s.attackBody = -0.9;
        s.actionU = clamp01(this.chargeT / this.ctx.tuning.chargeTime);
        // ferramentas: sem torcer o tronco para trás na carga
        s.attackTwist = cd?.work ? 0 : 0.5;
        break;
      }
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
      swingDirLocal(this.attack.def, this.swingAngle, outDirLocal, outEdgeLocal, this.attack.aimPitch);
      return this.attack.def;
    }
    return null;
  }
}

/**
 * Direção de lançamento que ACERTA `target` com a gravidade (arco baixo).
 * Sem solução (longe demais para a força) → reta até o alvo.
 */
function ballisticDir(origin: THREE.Vector3, target: THREE.Vector3, speed: number, g: number): THREE.Vector3 {
  const d = new THREE.Vector3().subVectors(target, origin);
  const h = d.y;
  const flat = Math.hypot(d.x, d.z);
  const v2 = speed * speed;
  const disc = v2 * v2 - g * (g * flat * flat + 2 * h * v2);
  // alvo "no infinito" (a mira não acertou nada) ou sem solução: reto
  if (flat < 0.01 || flat > 100 || disc < 0) return d.normalize();
  const ang = Math.atan2(v2 - Math.sqrt(disc), g * flat);
  const out = new THREE.Vector3(d.x / flat * Math.cos(ang), Math.sin(ang), d.z / flat * Math.cos(ang));
  return out.normalize();
}
