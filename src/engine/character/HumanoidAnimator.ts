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

export type DodgeType = 'hopL' | 'hopR' | 'hopF' | 'back' | 'flip';

export interface AnimInput {
  speed: number;
  runSpeed: number;
  walkSpeed?: number;
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
    action: 'none', actionT: 0, actionU: 0, attackTwist: 0, spinYaw: 0, crouch: 0, dodgeType: 'hopL',
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
  private squash = 1;
  private runW = 0;
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
    // ANDAR x CORRER: estado explícito (botão Correr) ou velocidade bem acima da de andar.
    // A mistura é rápida, mas suave, para a troca de postura ser bem visível.
    const walkSp = s.walkSpeed ?? 2.2;
    const wantRun = (s.sprinting || speed > walkSp * 1.45) && speed > 0.5 ? 1 : 0;
    this.runW = damp(this.runW, wantRun, 9, dt);
    const run = this.runW;
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
    // dois ciclos distintos, misturados pelo peso `run`:
    //  ANDAR  — postura ereta, sempre um pé no chão, braços soltos quase esticados,
    //           quadril balança de lado, corpo desce no apoio duplo.
    //  CORRER — tronco inclinado, fase de voo (corpo sobe), joelhos altos,
    //           cotovelos a 90°, braços bombeando, quique forte.
    const stride = lerp(1.6, 2.7, run);
    if (s.grounded) this.phase += (dirSign * speed * dt) / stride;
    const ph = this.phase * TAU;
    const sn = Math.sin(ph), cs = Math.cos(ph);
    const W = (1 - run) * moving, R = run * moving;

    const pos = (v: number) => (v > 0 ? v : 0);
    // ---------------- ANDAR: ciclo de marcha (calcanhar → apoio → ponta do pé → balanço)
    // Perna direita à frente quando sn = 1 (contato do calcanhar); balanço quando cs > 0.
    const wSwingR = Math.pow(pos(cs), 1.4), wSwingL = Math.pow(pos(-cs), 1.4);
    const wThighR = -sn * 0.42 - 0.05, wThighL = sn * 0.42 - 0.05;
    // joelho: dobra no meio do balanço; flexão leve de absorção logo após o calcanhar tocar
    const wShinR = 0.08 + wSwingR * 0.8 + pos(-cs) * pos(sn) * 0.22;
    const wShinL = 0.08 + wSwingL * 0.8 + pos(cs) * pos(-sn) * 0.22;
    // pé: ponta sobe antes do contato (calcanhar primeiro) e empurra o chão atrás
    const wFootR = -(wThighR + wShinR) - pos(sn) * pos(cs) * 0.5 + pos(-sn) * pos(-cs) * 0.55;
    const wFootL = -(wThighL + wShinL) - pos(-sn) * pos(-cs) * 0.5 + pos(sn) * pos(cs) * 0.55;

    // ---------------- CORRER: tronco inclinado, joelhos altos, calcanhar no glúteo
    const rThighR = -sn * 1.2 - 0.3, rThighL = sn * 1.2 - 0.3;
    const rShinR = 0.34 + pos(cs) * 2.2, rShinL = 0.34 + pos(-cs) * 2.2;
    const rFootR = -(rThighR + rShinR) * 0.6, rFootL = -(rThighL + rShinL) * 0.6;

    const bl = (w: number, r: number) => w * W + r * R;
    P.thighR.x = bl(wThighR, rThighR);
    P.thighL.x = bl(wThighL, rThighL);
    P.shinR.x = bl(wShinR, rShinR) + (1 - moving) * 0.04;
    P.shinL.x = bl(wShinL, rShinL) + (1 - moving) * 0.04;
    P.footR.x = bl(wFootR, rFootR);
    P.footL.x = bl(wFootL, rFootL);

    // --- quadril e tronco (andar: giro suave do quadril compensado pelo peito)
    P.pelvis.y = hipYaw + sn * bl(0.1, 0.28);
    P.pelvis.z = sn * 0.045 * W;
    P.spine.y = -hipYaw * 0.55;
    P.chest.y = -hipYaw * 0.35 - sn * bl(0.14, 0.4);
    P.spine.z = -sn * 0.035 * W;
    P.spine.x = bl(0.03, 0.62) + (s.exhausted ? 0.25 : 0);
    P.head.x = -P.spine.x * 0.55 + Math.abs(cs) * 0.08 * R;
    P.head.y = sn * 0.06 * W; // cabeça compensa o giro do tronco (olhar estável)

    // --- braços (andar: pendulares, cotovelo dobra mais quando o braço vai à frente)
    P.upperArmR.x = sn * bl(0.42, 1.35) - 0.2 * R;
    P.upperArmL.x = -sn * bl(0.42, 1.35) - 0.2 * R;
    P.upperArmR.z = -0.07 * W - 0.3 * R - 0.05 * (1 - moving);
    P.upperArmL.z = 0.07 * W + 0.3 * R + 0.05 * (1 - moving);
    P.forearmR.x = -bl(0.18 + pos(-sn) * 0.4, 1.6 + pos(-sn) * 0.35) - 0.1 * (1 - moving);
    P.forearmL.x = -bl(0.18 + pos(sn) * 0.4, 1.6 + pos(sn) * 0.35) - 0.1 * (1 - moving);

    // --- sobe e desce: andar é mais alto com a perna vertical e desce no apoio duplo;
    //     correr sobe na fase de voo
    let bob = (Math.abs(cs) - 1) * 0.028 * W + Math.abs(cs) * 0.15 * R - 0.06 * R;

    // parado: respiração e peso
    const idle = 1 - moving;
    const breathe = Math.sin(this.t * (s.exhausted ? 6 : 2.1));
    P.chest.x += breathe * (s.exhausted ? 0.06 : 0.025) * idle;
    P.upperArmR.z -= breathe * 0.02 * idle;
    P.upperArmL.z += breathe * 0.02 * idle;
    P.pelvis.z += Math.sin(this.t * 0.7) * 0.02 * idle;
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
      P.thighR.x = lerp(-0.35, -1.35, up) + down * 0.5;
      P.shinR.x = lerp(0.6, 1.9, up) - down * 0.4;
      P.thighL.x = lerp(0.2, 0.55, up) - down * 0.35;
      P.shinL.x = lerp(0.4, 0.9, up) + down * 0.3;
      P.upperArmR.z = -0.55 - up * 0.3 - down * 0.8;
      P.upperArmL.z = 0.55 + up * 0.3 + down * 0.8;
      P.upperArmR.x = -0.6 * up + 0.2 * down;
      P.upperArmL.x = -0.3 * up - 0.3 * down;
      P.forearmR.x = -0.9;
      P.forearmL.x = -0.9;
      P.spine.x = 0.2 * up - down * 0.3;
      P.head.x = -0.15 * up + down * 0.2;
      bob = 0;
    }
    // aterrissagem proporcional à velocidade de queda
    if (!s.grounded) this.airVy = s.vy;
    if (s.grounded && !this.wasGrounded) this.land(clamp01((-this.airVy - 2) / 12) * 0.9 + 0.15);
    this.wasGrounded = s.grounded;

    // aterrissagem: agacha proporcional ao impacto
    this.landImpact = damp(this.landImpact, 0, 7, dt);
    const li = this.landImpact;
    P.thighR.x -= li * 0.95; P.thighL.x -= li * 0.95;
    P.shinR.x += li * 1.6; P.shinL.x += li * 1.6;
    P.footR.x -= li * 0.5; P.footL.x -= li * 0.5;
    P.spine.x += li * 0.5;
    P.upperArmR.z -= li * 0.5; P.upperArmL.z += li * 0.5;

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
        if (s.dodgeType === 'hopF') {
          // salto curto para frente: joelhos recolhidos, braços para trás
          const k = Math.sin(u * Math.PI);
          P.spine.x = 0.25 * k;
          P.thighR.x = P.thighL.x = -1.1 * k;
          P.shinR.x = P.shinL.x = 1.6 * k;
          P.upperArmR.x = P.upperArmL.x = 0.9 * k;
          bodyYOffset = 0.12 * k;
        } else if (s.dodgeType === 'flip') {
          targetBodyRotX = -e * TAU;
          const tuck = Math.sin(u * Math.PI);
          P.thighR.x = P.thighL.x = -1.9 * tuck;
          P.shinR.x = P.shinL.x = 2.3 * tuck;
          P.spine.x = 0.5 * tuck;
          P.head.x = 0.4 * tuck;
          P.upperArmR.z = -1.5 * tuck; P.upperArmL.z = 1.5 * tuck;
          bodyYOffset = 0.3 * tuck;
        } else if (s.dodgeType === 'back') {
          const k = Math.sin(u * Math.PI);
          P.spine.x = -0.35 * k;
          P.thighR.x = -0.5 * k; P.shinR.x = 0.7 * k;
          P.thighL.x = 0.3 * k; P.shinL.x = 0.5 * k;
          P.upperArmR.x = P.upperArmL.x = -0.6 * k;
          bodyYOffset = 0.08 * k;
        } else {
          // salto lateral (BotW): corpo inclina para o lado do salto, pernas juntas recolhidas
          const side = s.dodgeType === 'hopL' ? 1 : -1;
          const k = Math.sin(u * Math.PI);
          targetBodyRotZ = -side * 0.55 * k;
          P.spine.z = side * 0.25 * k;
          P.thighR.x = P.thighL.x = -0.9 * k;
          P.shinR.x = P.shinL.x = 1.5 * k;
          P.thighR.z = side * 0.18 * k; P.thighL.z = side * 0.18 * k;
          P.upperArmR.z = -0.9 * k; P.upperArmL.z = 0.9 * k;
          P.upperArmR.x = P.upperArmL.x = -0.4 * k;
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
    this.lean = damp(this.lean, clamp(-s.turnRate * 0.1 * clamp01(speed / 4), -0.5, 0.5), 8, dt);
    targetBodyRotZ += s.grounded && s.action === 'none' ? this.lean : 0;

    // ---------------------------------------------------------------- aplica com suavização
    // locomoção rápida precisa de pouca suavização, senão o ciclo de corrida perde amplitude
    const rate = snappy ? 34 : lerp(16, 38, moving);
    const k = 1 - Math.exp(-rate * dt);
    for (const j of JOINTS) {
      this.targetQ.setFromEuler(P[j]);
      this.rig.joints[j].quaternion.slerp(this.targetQ, k);
    }
    // corpo: rotações grandes (rolamento) aplicadas direto para não "desenrolar" pelo caminho curto
    if (s.action === 'dodge' && s.dodgeType === 'flip') this.bodyRotX = targetBodyRotX;
    else this.bodyRotX = damp(this.bodyRotX, targetBodyRotX, snappy ? 25 : 12, dt);
    this.bodyRotZ = damp(this.bodyRotZ, targetBodyRotZ, 12, dt);
    if (s.action === 'attack' && Math.abs(targetBodyYaw) > 0.01) this.bodyYaw = targetBodyYaw;
    else this.bodyYaw = damp(this.bodyYaw, targetBodyYaw, 10, dt);
    this.bodyY = damp(this.bodyY, bodyYOffset, 20, dt);
    const b = this.rig.body;
    b.rotation.set(this.bodyRotX, this.bodyYaw, this.bodyRotZ, 'YXZ');
    // estica no ar (subindo rápido) e achata na aterrissagem
    const stretch = s.grounded ? 0 : clamp(Math.abs(s.vy) * 0.012, 0, 0.1);
    const sy = 1 + stretch - li * 0.16;
    this.squash = damp(this.squash, sy, 25, dt);
    b.scale.set(1 / Math.sqrt(this.squash), this.squash, 1 / Math.sqrt(this.squash));
    b.position.y = this.rig.bodyPivotY + this.bodyY - li * 0.2 - cr * 0.12 + bob;
  }
}
