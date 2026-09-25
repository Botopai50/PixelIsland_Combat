import * as THREE from 'three';
import { HumanoidRig, JOINTS, type JointName } from './HumanoidRig';
import { clamp, clamp01, damp, lerp, easeOutCubic, easeInOutSine, TAU } from '../core/math';

/**
 * Animador procedural em camadas para o HumanoidRig:
 *  1. Locomoção (parado/andar/correr/strafe) com fase guiada pela DISTÂNCIA
 *     percorrida → os pés não "patinam" e os passos sincronizam com o som.
 *  2. Ar (subida/queda) e aterrissagem (agachamento proporcional à queda).
 *  3. Camadas de ação (ataque, carga, defesa, arco, esquiva, dano, atordoamento,
 *     troca de equipamento, morte) com pesos suavizados.
 * Os braços que seguram arma/escudo/arco são finalizados por IK pelo "view"
 * (PlayerView/EnemyView), garantindo que a mão encontre a arma lógica.
 */
export type AnimAction =
  | 'none' | 'attack' | 'charge' | 'dodge' | 'bow' | 'equip' | 'hurt' | 'stagger' | 'dead' | 'spawn' | 'guardHit';

export type DodgeType = 'roll' | 'hopL' | 'hopR' | 'back' | 'flip';

export interface AnimInput {
  speed: number;
  runSpeed: number;
  /** Direção do movimento relativa à frente do personagem (rad). */
  moveAngle: number;
  grounded: boolean;
  vy: number;
  turnRate: number;
  guard: number;
  action: AnimAction;
  actionT: number;
  actionU: number;
  /** Para ataques: giro do tronco (rad) e se é giratório. */
  attackTwist: number;
  spinYaw: number;
  crouch: number;
  dodgeType: DodgeType;
  hurtX: number;
  hurtZ: number;
  bowDraw: number;
  aimPitch: number;
  exhausted: boolean;
  sprinting: boolean;
  /** Mão direita livre para balançar (sem IK de ataque)? */
  twoHandedIdle?: boolean;
}

export function defaultAnimInput(): AnimInput {
  return {
    speed: 0, runSpeed: 5, moveAngle: 0, grounded: true, vy: 0, turnRate: 0, guard: 0,
    action: 'none', actionT: 0, actionU: 0, attackTwist: 0, spinYaw: 0, crouch: 0, dodgeType: 'roll',
    hurtX: 0, hurtZ: 1, bowDraw: 0, aimPitch: 0, exhausted: false, sprinting: false,
  };
}

type Pose = Record<JointName, THREE.Euler>;

export class HumanoidAnimator {
  phase = 0;
  private lastStepSign = 0;
  private landImpact = 0;
  private t = 0;
  private pose: Pose;
  private targetQ = new THREE.Quaternion();
  private bodyRotX = 0;
  private bodyRotZ = 0;
  private bodyYaw = 0;
  private bodyY = 0;
  private lean = 0;
  private wasGrounded = true;
  private airVy = 0;
  /** Mola de recuo (usada ao bater/bloquear): empurra tronco e braços. */
  recoil = 0;
  private recoilV = 0;
  onFootstep?: (foot: 'L' | 'R', intensity: number) => void;

  constructor(public rig: HumanoidRig) {
    this.pose = {} as Pose;
    for (const j of JOINTS) this.pose[j] = new THREE.Euler();
  }

  land(intensity: number) {
    this.landImpact = Math.max(this.landImpact, clamp01(intensity));
  }
  kick(amount: number) {
    this.recoilV += amount;
  }

  update(dt: number, s: AnimInput) {
    if (dt <= 0) return;
    this.t += dt;
    const P = this.pose;
    for (const j of JOINTS) P[j].set(0, 0, 0);
    const speed = s.speed;
    const run = clamp01((speed - 2) / Math.max(0.1, s.runSpeed - 2));
    const moving = clamp01(speed / 1.2);

    // ---------------------------------------------------------------- locomoção
    // estratégia de strafe: quadril aponta para a direção do movimento
    let hipYaw = 0;
    let dirSign = 1;
    if (moving > 0.05 && Math.abs(s.moveAngle) > 0.2) {
      let a = s.moveAngle;
      if (Math.abs(a) > Math.PI * 0.62) {
        dirSign = -1; // andando de costas
        a = a > 0 ? a - Math.PI : a + Math.PI;
      }
      hipYaw = clamp(a, -1.1, 1.1);
    }
    const stride = lerp(1.25, 2.3, run) * (s.sprinting ? 1.12 : 1);
    if (s.grounded) this.phase += (dirSign * speed * dt) / stride;
    const ph = this.phase * TAU;
    const sn = Math.sin(ph), cs = Math.cos(ph);
    const amp = lerp(0.42, 0.85, run) * moving;
    const k1 = lerp(0.5, 1.35, run) * moving;

    P.thighR.x = -sn * amp;
    P.thighL.x = sn * amp;
    P.shinR.x = 0.08 + Math.max(0, cs) * k1 + (1 - moving) * 0.04;
    P.shinL.x = 0.08 + Math.max(0, -cs) * k1 + (1 - moving) * 0.04;
    P.footR.x = -(P.thighR.x + P.shinR.x) * 0.6;
    P.footL.x = -(P.thighL.x + P.shinL.x) * 0.6;
    P.pelvis.y = hipYaw + sn * 0.12 * moving;
    P.spine.y = -hipYaw * 0.55;
    P.chest.y = -hipYaw * 0.35 - sn * 0.14 * moving;
    P.spine.x = run * 0.22 + (s.sprinting ? 0.1 : 0) + (s.exhausted ? 0.25 : 0);
    P.head.x = -P.spine.x * 0.6;
    const armAmp = lerp(0.35, 0.85, run) * moving;
    P.upperArmR.x = sn * armAmp;
    P.upperArmL.x = -sn * armAmp;
    P.upperArmR.z = -0.1 - run * 0.1;
    P.upperArmL.z = 0.1 + run * 0.1;
    P.forearmR.x = -lerp(0.2, 1.3, run * moving) - 0.1;
    P.forearmL.x = -lerp(0.2, 1.3, run * moving) - 0.1;
    let bob = Math.abs(cs) * lerp(0.025, 0.06, run) * moving;

    // parado: respiração e peso
    const idle = 1 - moving;
    const breathe = Math.sin(this.t * (s.exhausted ? 6 : 2.1));
    P.chest.x += breathe * (s.exhausted ? 0.06 : 0.025) * idle;
    P.upperArmR.z -= breathe * 0.02 * idle;
    P.upperArmL.z += breathe * 0.02 * idle;
    P.pelvis.z = Math.sin(this.t * 0.7) * 0.02 * idle;
    if (s.exhausted) {
      P.spine.x += 0.3 * idle;
      P.head.x -= 0.1;
      P.thighR.x -= 0.25 * idle; P.shinR.x += 0.4 * idle;
      P.thighL.x -= 0.25 * idle; P.shinL.x += 0.4 * idle;
      bob -= 0.06 * idle;
    }

    // passos → som/poeira sincronizados com a animação
    const stepSign = Math.sign(sn);
    if (s.grounded && moving > 0.25 && stepSign !== this.lastStepSign && this.lastStepSign !== 0) {
      this.onFootstep?.(stepSign > 0 ? 'L' : 'R', clamp01(speed / 7));
    }
    this.lastStepSign = stepSign;

    // ---------------------------------------------------------------- ar
    if (!s.grounded) {
      const up = clamp01(s.vy / 6);
      const down = clamp01(-s.vy / 10);
      P.thighR.x = lerp(-0.2, -0.9, up) + down * 0.3;
      P.shinR.x = lerp(0.4, 1.3, up) - down * 0.2;
      P.thighL.x = lerp(0.1, 0.25, up) - down * 0.2;
      P.shinL.x = lerp(0.3, 0.5, up) + down * 0.2;
      P.upperArmR.z = -0.35 - down * 0.5;
      P.upperArmL.z = 0.35 + down * 0.5;
      P.upperArmR.x = -0.3;
      P.upperArmL.x = -0.3;
      P.forearmR.x = -0.6;
      P.forearmL.x = -0.6;
      P.spine.x = 0.1 - down * 0.15;
      bob = 0;
    }
    // aterrissagem proporcional à velocidade de queda
    if (!s.grounded) this.airVy = s.vy;
    if (s.grounded && !this.wasGrounded) this.land(clamp01((-this.airVy - 2) / 12) * 0.9 + 0.15);
    this.wasGrounded = s.grounded;

    // aterrissagem: agacha proporcional ao impacto
    this.landImpact = damp(this.landImpact, 0, 7, dt);
    const li = this.landImpact;
    P.thighR.x -= li * 0.7; P.thighL.x -= li * 0.7;
    P.shinR.x += li * 1.2; P.shinL.x += li * 1.2;
    P.footR.x -= li * 0.5; P.footL.x -= li * 0.5;
    P.spine.x += li * 0.35;

    // agachamento genérico (defesa, carga)
    const cr = s.crouch;
    P.thighR.x -= cr * 0.5; P.thighL.x -= cr * 0.5;
    P.shinR.x += cr * 0.9; P.shinL.x += cr * 0.9;
    P.footR.x -= cr * 0.4; P.footL.x -= cr * 0.4;

    // ---------------------------------------------------------------- defesa
    const g = s.guard;
    if (g > 0.01) {
      P.upperArmL.x = lerp(P.upperArmL.x, -1.25, g);
      P.upperArmL.z = lerp(P.upperArmL.z, 0.35, g);
      P.upperArmL.y = lerp(0, -0.5, g);
      P.forearmL.x = lerp(P.forearmL.x, -1.2, g);
      P.spine.x += g * 0.12;
      P.head.x += g * 0.05;
    }

    // ---------------------------------------------------------------- ações
    let targetBodyRotX = 0, targetBodyRotZ = 0, targetBodyYaw = 0, bodyYOffset = 0;
    let snappy = false;
    const u = s.actionU;
    switch (s.action) {
      case 'attack':
      case 'charge': {
        snappy = true;
        P.chest.y += s.attackTwist;
        P.spine.y += s.attackTwist * 0.5;
        P.pelvis.y += s.attackTwist * 0.25;
        P.spine.x += 0.12;
        // base firme: pernas abertas
        P.thighR.x = lerp(P.thighR.x, 0.35, 0.6);
        P.thighL.x = lerp(P.thighL.x, -0.45, 0.6);
        P.shinR.x = lerp(P.shinR.x, 0.35, 0.6);
        P.shinL.x = lerp(P.shinL.x, 0.3, 0.6);
        if (s.action === 'charge') {
          P.thighR.z = -0.2; P.thighL.z = 0.2;
          P.spine.x += 0.15;
        }
        targetBodyYaw = s.spinYaw;
        break;
      }
      case 'dodge': {
        snappy = true;
        const e = easeInOutSine(u);
        if (s.dodgeType === 'roll') {
          targetBodyRotX = e * TAU;
          const tuck = Math.sin(u * Math.PI);
          P.thighR.x = P.thighL.x = -1.7 * tuck;
          P.shinR.x = P.shinL.x = 2.1 * tuck;
          P.spine.x = 0.7 * tuck;
          P.head.x = 0.5 * tuck;
          P.upperArmR.x = P.upperArmL.x = -1.0 * tuck;
          P.forearmR.x = P.forearmL.x = -1.4 * tuck;
          bodyYOffset = -0.3 * tuck;
        } else if (s.dodgeType === 'flip') {
          targetBodyRotX = -e * TAU;
          const tuck = Math.sin(u * Math.PI);
          P.thighR.x = P.thighL.x = -1.4 * tuck;
          P.shinR.x = P.shinL.x = 1.8 * tuck;
          P.upperArmR.z = -1.2 * tuck; P.upperArmL.z = 1.2 * tuck;
          bodyYOffset = 0.2 * tuck;
        } else if (s.dodgeType === 'back') {
          const k = Math.sin(u * Math.PI);
          P.spine.x = -0.35 * k;
          P.thighR.x = -0.5 * k; P.shinR.x = 0.7 * k;
          P.thighL.x = 0.3 * k; P.shinL.x = 0.5 * k;
          P.upperArmR.x = P.upperArmL.x = -0.6 * k;
          bodyYOffset = 0.08 * k;
        } else {
          const side = s.dodgeType === 'hopL' ? 1 : -1;
          const k = Math.sin(u * Math.PI);
          targetBodyRotZ = -side * 0.45 * k;
          P.thighR.z = -0.4 * k; P.thighL.z = 0.4 * k;
          P.shinR.x = 0.6 * k; P.shinL.x = 0.6 * k;
          P.upperArmR.z = -0.8 * k; P.upperArmL.z = 0.8 * k;
          bodyYOffset = 0.12 * k;
        }
        break;
      }
      case 'bow': {
        P.chest.y += -0.95;
        P.spine.y += -0.3;
        P.neck.y = 0.7;
        P.head.y = 0.45;
        P.head.x = -s.aimPitch * 0.5;
        P.chest.x = -s.aimPitch * 0.5;
        P.thighR.x = lerp(P.thighR.x, 0.25, 0.5);
        P.thighL.x = lerp(P.thighL.x, -0.3, 0.5);
        break;
      }
      case 'equip': {
        const k = Math.sin(clamp01(u) * Math.PI);
        P.upperArmR.x = lerp(P.upperArmR.x, -2.6, k);
        P.upperArmR.z = lerp(P.upperArmR.z, -0.3, k);
        P.forearmR.x = lerp(P.forearmR.x, -1.2, k);
        P.chest.y += -0.25 * k;
        P.head.y = -0.2 * k;
        break;
      }
      case 'hurt': {
        snappy = true;
        const k = Math.sin(clamp01(u) * Math.PI) * (1 - u * 0.3);
        // reação direcional: tronco é empurrado na direção do golpe
        P.spine.x += -s.hurtZ * 0.5 * k;
        P.spine.z += s.hurtX * 0.5 * k;
        P.head.x += -s.hurtZ * 0.4 * k;
        P.upperArmR.z -= 0.6 * k; P.upperArmL.z += 0.6 * k;
        P.upperArmR.x -= 0.4 * k; P.upperArmL.x -= 0.4 * k;
        P.thighR.x -= 0.3 * k; P.shinR.x += 0.5 * k;
        break;
      }
      case 'guardHit': {
        snappy = true;
        const k = Math.sin(clamp01(u) * Math.PI);
        P.spine.x -= 0.25 * k;
        P.thighL.x -= 0.4 * k; P.shinL.x += 0.4 * k;
        P.thighR.x += 0.3 * k;
        bodyYOffset = -0.05 * k;
        break;
      }
      case 'stagger': {
        // desequilíbrio: inclina para trás, braços abertos, balanço
        const k = Math.min(1, u * 6) * (1 - easeOutCubic(Math.max(0, u - 0.7) / 0.3));
        const wob = Math.sin(this.t * 9) * 0.15;
        P.spine.x -= 0.55 * k;
        P.chest.x -= 0.2 * k;
        P.head.x -= 0.3 * k;
        P.spine.z = wob * k;
        P.upperArmR.z = lerp(P.upperArmR.z, -1.4, k);
        P.upperArmL.z = lerp(P.upperArmL.z, 1.4, k);
        P.forearmR.x = -0.8 * k; P.forearmL.x = -0.8 * k;
        P.thighR.x = -0.5 * k; P.shinR.x = 0.6 * k;
        P.thighL.x = 0.4 * k;
        break;
      }
      case 'dead': {
        const k = easeOutCubic(clamp01(u * 1.4));
        targetBodyRotX = -1.45 * k;
        bodyYOffset = -0.45 * k;
        P.upperArmR.z = -1.2 * k; P.upperArmL.z = 1.2 * k;
        P.head.x = -0.3 * k;
        P.thighR.x = -0.3 * k; P.shinR.x = 0.5 * k;
        snappy = true;
        break;
      }
      case 'spawn': {
        const k = 1 - easeOutCubic(u);
        bodyYOffset = -1.2 * k;
        P.upperArmR.z = -1.3 * k; P.upperArmL.z = 1.3 * k;
        break;
      }
    }

    // recuo (mola)
    this.recoilV += -this.recoil * 220 * dt;
    this.recoilV *= Math.exp(-14 * dt);
    this.recoil += this.recoilV * dt;
    P.spine.x -= this.recoil * 0.5;
    P.upperArmR.x -= this.recoil * 0.6;

    // inclinação nas curvas (estilo corrida de aventura)
    this.lean = damp(this.lean, clamp(-s.turnRate * 0.07 * clamp01(speed / 4), -0.35, 0.35), 8, dt);
    targetBodyRotZ += s.grounded && s.action === 'none' ? this.lean : 0;

    // ---------------------------------------------------------------- aplica com suavização
    const rate = snappy ? 34 : 16;
    const k = 1 - Math.exp(-rate * dt);
    for (const j of JOINTS) {
      this.targetQ.setFromEuler(P[j]);
      this.rig.joints[j].quaternion.slerp(this.targetQ, k);
    }
    // corpo: rotações grandes (rolamento) aplicadas direto para não "desenrolar" pelo caminho curto
    if (s.action === 'dodge' && (s.dodgeType === 'roll' || s.dodgeType === 'flip')) this.bodyRotX = targetBodyRotX;
    else this.bodyRotX = damp(this.bodyRotX, targetBodyRotX, snappy ? 25 : 12, dt);
    this.bodyRotZ = damp(this.bodyRotZ, targetBodyRotZ, 12, dt);
    if (s.action === 'attack' && Math.abs(targetBodyYaw) > 0.01) this.bodyYaw = targetBodyYaw;
    else this.bodyYaw = damp(this.bodyYaw, targetBodyYaw, 10, dt);
    this.bodyY = damp(this.bodyY, bodyYOffset, 20, dt);
    const b = this.rig.body;
    b.rotation.set(this.bodyRotX, this.bodyYaw, this.bodyRotZ, 'YXZ');
    b.position.y = this.rig.bodyPivotY + this.bodyY - li * 0.14 - cr * 0.12 + bob;
  }
}
