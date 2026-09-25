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
  | 'none' | 'attack' | 'charge' | 'dodge' | 'bow' | 'equip' | 'hurt' | 'stagger' | 'dead' | 'spawn' | 'guardHit'
  | 'climb' | 'mantle';

export type DodgeType = 'hopL' | 'hopR' | 'hopF' | 'back' | 'flip';

export interface AnimInput {
  speed: number;
  runSpeed: number;
  walkSpeed?: number;
  /** Andando de lado/de costas de propósito (lock-on, defesa, mira, 1ª pessoa). */
  strafing?: boolean;
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
  /** Corpo no golpe: >0 comprometido no corte, <0 antecipação (peso atrás). */
  attackBody?: number;
  /** Direção lateral do corte (-1 = para a esquerda, 1 = para a direita). */
  attackSide?: number;
  /** Intensidade do corpo inteiro (0 = só tronco). */
  attackMotion?: number;
  attackOverhead?: boolean;
  /** Pose de trabalho com ferramenta. */
  attackWork?: 'chop' | 'mine';
  /** Golpe de salto no ar (pernas recolhidas, corpo gira para a frente no corte). */
  attackAir?: boolean;
  /** Ataque giratório (carga e giro). */
  attackSpin?: boolean;
  /** Esgueirando (agachado, passos cuidadosos). */
  sneak?: boolean;
  /** Levantar do esgueirar sem transição (consumido pelo animador). */
  sneakSnap?: boolean;
  /** Escalada: fase do ciclo, quanto se move (0..1) e salto na parede (0..1). */
  climbPhase?: number;
  climbMove?: number;
  climbJump?: number;
  /** Direção na parede (x: + direita, y: + cima). */
  climbDirX?: number;
  climbDirY?: number;
  /** Acabou de agarrar (0..1) e cansaço na parede (0..1). */
  climbGrab?: number;
  climbTired?: number;
  spinYaw: number;
  crouch: number;
  dodgeType: DodgeType;
  hurtX: number;
  hurtZ: number;
  bowDraw: number;
  aimPitch: number;
  exhausted: boolean;
  /** 1 = arma em mãos (idle de combate), 0 = relaxado. */
  ready?: number;
  hasShieldUp?: boolean;
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
  private sneakW = 0;
  private bodyY = 0;
  private lean = 0;
  private wasGrounded = true;
  private airVy = 0;
  private airT = 0;
  private airFromJump = false;
  private landLevel = 0;
  private landHold = 0;
  private squash = 1;
  private readyW = 0;
  private runW = 0;
  private hipYawS = 0;
  /** Mola de recuo (usada ao bater/bloquear): empurra tronco e braços. */
  recoil = 0;
  private recoilV = 0;
  onFootstep?: (foot: 'L' | 'R', intensity: number) => void;

  constructor(public rig: HumanoidRig) {
    this.pose = {} as Pose;
    this.fk = {} as Record<JointName, THREE.Quaternion>;
    for (const j of JOINTS) {
      this.pose[j] = new THREE.Euler();
      this.fk[j] = rig.joints[j].quaternion.clone();
    }
  }
  /**
   * Estado FK próprio do animador. O IK (pés, braços com arma) altera os ossos
   * DEPOIS de cada quadro; se a suavização partisse dos ossos, o resultado do IK
   * realimentaria o próximo quadro (pé "mole", perna balançando).
   */
  private fk: Record<JointName, THREE.Quaternion>;

  land(intensity: number) {
    const k = clamp01(intensity);
    if (k < 0.04) return;
    // mínimo visível mesmo em quedas pequenas; quedas altas seguram mais tempo
    this.landImpact = Math.max(this.landImpact, 0.2 + 0.8 * k);
    this.landLevel = Math.max(k, this.landImpact > 0.3 ? this.landLevel * 0.5 : 0);
    this.landHold = 0.03 + 0.32 * k * k;
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
    // só em strafe: numa curva normal a velocidade e o corpo se separam por um instante,
    // e usar essa diferença fazia o quadril "estalar" para o lado (ou para trás na inversão)
    if (s.strafing && moving > 0.05 && Math.abs(s.moveAngle) > 0.2) {
      let a = s.moveAngle;
      if (Math.abs(a) > Math.PI * 0.62) {
        dirSign = -1; // andando de costas
        a = a > 0 ? a - Math.PI : a + Math.PI;
      }
      hipYaw = clamp(a, -1.1, 1.1);
    }
    // suaviza a torção do quadril (sem estalos ao trocar de direção)
    this.hipYawS = damp(this.hipYawS, hipYaw, 10, dt);
    hipYaw = this.hipYawS;
    // dois ciclos distintos, misturados pelo peso `run`:
    //  ANDAR  — postura ereta, sempre um pé no chão, braços soltos quase esticados,
    //           quadril balança de lado, corpo desce no apoio duplo.
    //  CORRER — tronco inclinado, fase de voo (corpo sobe), joelhos altos,
    //           cotovelos a 90°, braços bombeando, quique forte.
    const stride = lerp(1.6, 3.0, run);
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

    // ---------------- CORRER: ciclo por POSES-CHAVE (como animação feita à mão)
    // p = 0 no contato do pé direito. 8 poses por passada, interpoladas com
    // Catmull-Rom: contato → compressão → apoio → impulso → saída do pé →
    // calcanhar alto → passagem (perna recolhida) → joelho alto → contato.
    const pR = ((this.phase - 0.25) % 1 + 1) % 1, pL = (pR + 0.5) % 1;
    const legR = runLeg(pR), legL = runLeg(pL);
    const rThighR = legR.thigh, rThighL = legL.thigh;
    const rShinR = legR.shin, rShinL = legL.shin;
    const rFootR = legR.foot, rFootL = legL.foot;
    // 1 quando a perna direita está à frente (contato), −1 quando a esquerda
    const legFwdR = Math.cos(pR * TAU);

    const bl = (w: number, r: number) => w * W + r * R;
    P.thighR.x = bl(wThighR, rThighR);
    P.thighL.x = bl(wThighL, rThighL);
    P.shinR.x = bl(wShinR, rShinR) + (1 - moving) * 0.04;
    P.shinL.x = bl(wShinL, rShinL) + (1 - moving) * 0.04;
    P.footR.x = bl(wFootR, rFootR);
    P.footL.x = bl(wFootL, rFootL);

    // --- quadril e tronco (andar: giro suave do quadril compensado pelo peito)
    // quadril gira com a perna que vai à frente; ombros giram ao contrário
    P.pelvis.y = hipYaw + sn * 0.1 * W + legFwdR * 0.16 * R;
    P.pelvis.z = sn * 0.045 * W;
    // correr: a cintura também inclina para frente (as coxas saem da pélvis → compensa)
    const hipTilt = 0.14 * R;
    P.pelvis.x += hipTilt;
    P.thighR.x -= hipTilt;
    P.thighL.x -= hipTilt;
    P.spine.y = -hipYaw * 0.55;
    P.chest.y = -hipYaw * 0.35 - sn * 0.14 * W - legFwdR * 0.22 * R;
    P.spine.z = -sn * 0.035 * W;
    // corrida: ~28° à frente no total (tronco firme, peito aberto)
    P.spine.x = bl(0.03, 0.3) + (s.exhausted ? 0.25 : 0);
    P.chest.x += 0.04 * R;
    P.head.x = -P.spine.x * 0.78;
    // cabeça compensa o giro do tronco (olhar estável, apontando à frente)
    P.head.y = sn * 0.06 * W - P.chest.y * 0.8 * R;

    // --- braços (andar: pendulares, cotovelo dobra mais quando o braço vai à frente)
    // correr: braços bombeando forte, cotovelos dobrados
    // correr: braços bombeando AMPLOS (punho à frente na altura do peito, o outro bem atrás)
    // correr: opostos às pernas, cotovelo ~90°; a mão vai do quadril (atrás)
    // até a altura do queixo (à frente), com pausa curta nos extremos
    const armS = Math.sin(legFwdR * Math.PI * 0.5); // "segura" um pouco nos extremos
    P.upperArmR.x = sn * 0.42 * W + (0.75 * armS - 0.2) * R;
    P.upperArmL.x = -sn * 0.42 * W + (-0.75 * armS - 0.2) * R;
    P.upperArmR.z = -0.07 * W - 0.12 * R - 0.05 * (1 - moving);
    P.upperArmL.z = 0.07 * W + 0.12 * R + 0.05 * (1 - moving);
    P.forearmR.x = -(0.18 + pos(-sn) * 0.4) * W - (1.35 + 0.35 * pos(-armS)) * R - 0.1 * (1 - moving);
    P.forearmL.x = -(0.18 + pos(sn) * 0.4) * W - (1.35 + 0.35 * pos(armS)) * R - 0.1 * (1 - moving);

    // --- sobe e desce: andar é mais alto com a perna vertical e desce no apoio duplo;
    //     correr sobe na fase de voo
    // corrida: mais baixo na compressão (logo após o contato), mais alto no voo
    let bob = (Math.abs(cs) - 1) * 0.028 * W - 0.065 * Math.cos(TAU * (2 * pR - 0.24)) * R - 0.03 * R;

    // ---------------------------------------------------------------- parado (idle)
    const idle = 1 - moving;
    this.readyW = damp(this.readyW, s.ready ?? 0, 6, dt);
    const rdy = this.readyW * idle * (1 - s.guard), rlx = (1 - this.readyW) * idle * (1 - s.guard);
    // em movimento com a arma na mão: o braço ARMADO quase não bombeia — fica
    // baixo, um pouco atrás e afastado do corpo (a arma não fica balançando);
    // o outro braço continua o ciclo normal
    const armed = this.readyW * moving * (1 - s.guard);
    if (armed > 0.001) {
      P.upperArmR.x = lerp(P.upperArmR.x, 0.6 + sn * lerp(0.1, 0.16, run), armed);
      P.upperArmR.z = lerp(P.upperArmR.z, -0.28, armed);
      P.forearmR.x = lerp(P.forearmR.x, -0.5 - 0.15 * run, armed);
    }
    const breathe = Math.sin(this.t * (s.exhausted ? 6 : 2.1));
    P.chest.x += breathe * (s.exhausted ? 0.06 : 0.025) * idle;
    P.upperArmR.z -= breathe * 0.02 * idle;
    P.upperArmL.z += breathe * 0.02 * idle;

    // RELAXADO: pés afastados, peso num lado (o outro joelho solto), troca de lado devagar,
    // braços levemente dobrados e a cabeça olhando em volta de vez em quando
    if (rlx > 0.001) {
      const shift = Math.sin(this.t * 0.45); // -1..1: lado do peso
      const wR = 0.5 + 0.5 * shift, wL = 1 - wR;
      P.pelvis.z += shift * 0.06 * rlx;
      P.spine.z += -shift * 0.05 * rlx;
      P.thighR.z += (-0.08 - 0.04 * wL) * rlx;
      P.thighL.z += (0.08 + 0.04 * wR) * rlx;
      // perna sem peso: joelho solto e pé levemente à frente
      P.thighR.x += -0.1 * wL * rlx; P.shinR.x += 0.22 * wL * rlx; P.footR.x -= 0.1 * wL * rlx;
      P.thighL.x += -0.1 * wR * rlx; P.shinL.x += 0.22 * wR * rlx; P.footL.x -= 0.1 * wR * rlx;
      P.upperArmR.z += -0.1 * rlx; P.upperArmL.z += 0.1 * rlx;
      P.upperArmR.x += 0.05 * rlx; P.upperArmL.x += 0.05 * rlx;
      P.forearmR.x += -0.22 * rlx; P.forearmL.x += -0.22 * rlx;
      // olhar em volta: pausas longas, viradas suaves
      const look = Math.sin(this.t * 0.31) * Math.max(0, Math.sin(this.t * 0.17));
      P.head.y += look * 0.55 * rlx;
      P.neck.y += look * 0.15 * rlx;
      P.head.x += (Math.sin(this.t * 0.23) * 0.06 - 0.02) * rlx;
    }
    // PRONTO (arma em mãos): perna esquerda à frente, joelhos dobrados, ombro esquerdo adiantado,
    // arma baixa apontada para frente e escudo junto ao corpo; leve "respiração" nos joelhos
    if (rdy > 0.001) {
      const kb = Math.sin(this.t * 2.6) * 0.03;
      P.thighL.x += -0.35 * rdy; P.shinL.x += (0.4 + kb) * rdy;
      P.thighR.x += 0.28 * rdy; P.shinR.x += (0.42 + kb) * rdy;
      P.thighL.z += 0.12 * rdy; P.thighR.z += -0.14 * rdy;
      P.footR.x += -0.25 * rdy; P.footL.x += -0.1 * rdy;
      P.pelvis.y += -0.35 * rdy;
      P.spine.y += 0.2 * rdy; P.chest.y += 0.1 * rdy;
      P.head.y += 0.12 * rdy;
      P.spine.x += 0.1 * rdy;
      // braço da arma: à frente e baixo
      P.upperArmR.x += -0.55 * rdy; P.upperArmR.z += -0.18 * rdy;
      P.forearmR.x += -0.55 * rdy;
      // braço do escudo: dobrado à frente do corpo
      if (s.hasShieldUp) {
        P.upperArmL.x += -0.4 * rdy; P.upperArmL.z += 0.25 * rdy;
        P.forearmL.x += -1.0 * rdy;
      } else {
        P.upperArmL.x += -0.25 * rdy; P.upperArmL.z += 0.2 * rdy; P.forearmL.x += -0.6 * rdy;
      }
      bob -= (0.07 + kb) * rdy;
    }
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
    // fases: IMPULSO (sai empurrando) → SUBIDA (joelho da frente alto, braços
    // sobem) → ÁPICE (recolhido) → QUEDA (pernas descem se preparando, braços
    // abrem para equilibrar) → QUEDA LONGA (pedala e gira os braços, desesperado)
    if (!s.grounded) {
      this.airT += dt;
      const t = this.airT;
      const up = clamp01(s.vy / 6);
      const down = clamp01(-s.vy / 9);
      const apex = 1 - clamp01(Math.abs(s.vy) / 3.5);
      const push = this.airFromJump ? 1 - clamp01(t / 0.16) : 0;
      const longFall = clamp01((-s.vy - 8.5) / 7);
      const pedal = Math.sin(t * 13), wind = Math.sin(t * 9);
      // pernas
      P.thighR.x = -0.35 - 0.95 * up - 0.5 * apex + 0.45 * down;
      P.shinR.x = 0.55 + 1.2 * up + 0.7 * apex - 0.25 * down;
      P.thighL.x = 0.15 * push - 0.35 * apex - 0.1 * up + 0.2 * down;
      P.shinL.x = 0.3 + 0.35 * up + 0.9 * apex + 0.05 * down - 0.1 * push;
      P.footR.x = 0.2 * up - 0.25 * down; P.footL.x = 0.35 * push - 0.2 * down;
      P.thighR.z = -0.08 * down; P.thighL.z = 0.08 * down;
      // braços: sobem com o impulso, abrem no ápice e na queda
      P.upperArmR.x = -1.1 * push - 0.7 * up - 0.3 * apex - 0.35 * down;
      P.upperArmL.x = -0.9 * push - 0.5 * up - 0.3 * apex - 0.3 * down;
      P.upperArmR.z = -0.35 - 0.35 * apex - 1.0 * down;
      P.upperArmL.z = 0.35 + 0.35 * apex + 1.0 * down;
      P.forearmR.x = -0.9 + 0.4 * down; P.forearmL.x = -0.9 + 0.4 * down;
      // tronco: arqueia no impulso, recolhe no ápice, cabeça olha o chão na queda
      P.spine.x = -0.12 * push + 0.15 * up + 0.3 * apex - 0.1 * down;
      P.head.x = -0.1 * up + 0.35 * down;
      // queda longa: pedala as pernas e gira os braços
      if (longFall > 0) {
        P.thighR.x += pedal * 0.55 * longFall; P.thighL.x -= pedal * 0.55 * longFall;
        P.shinR.x += (0.5 + Math.max(0, -pedal) * 0.6) * longFall; P.shinL.x += (0.5 + Math.max(0, pedal) * 0.6) * longFall;
        P.upperArmR.x += wind * 0.9 * longFall; P.upperArmL.x -= wind * 0.9 * longFall;
        P.upperArmR.z -= 0.3 * longFall; P.upperArmL.z += 0.3 * longFall;
        P.spine.x -= 0.25 * longFall;
        P.head.x += 0.15 * longFall;
      }
      bob = 0;
    } else {
      this.airT = 0;
    }
    this.airFromJump = !s.grounded && (this.airFromJump || (this.wasGrounded && s.vy > 2));
    // aterrissagem proporcional à velocidade de queda (≈ altura)
    if (!s.grounded) this.airVy = s.vy;
    if (s.grounded && !this.wasGrounded) this.land(clamp01((-this.airVy - 2) / 13));
    this.wasGrounded = s.grounded;

    // aterrissagem em níveis: leve (dobra os joelhos) · média (agacha, braços à
    // frente) · pesada (agacha fundo, mão direita no chão, cabeça baixa, segura
    // um instante antes de levantar)
    if (this.landHold > 0) this.landHold -= dt;
    else this.landImpact = damp(this.landImpact, 0, lerp(9, 3.2, this.landLevel), dt);
    const li = this.landImpact;
    const hv = clamp01((this.landLevel - 0.5) / 0.4) * li; // pesada
    P.thighR.x -= li * 0.95; P.thighL.x -= li * 1.05;
    P.shinR.x += li * 1.6; P.shinL.x += li * 1.7;
    P.footR.x -= li * 0.5; P.footL.x -= li * 0.55;
    P.spine.x += li * 0.5 + hv * 0.35;
    P.head.x -= hv * 0.35;
    P.upperArmR.z -= li * 0.4; P.upperArmL.z += li * 0.5;
    P.upperArmR.x -= li * 0.45 * (1 - hv); P.upperArmL.x -= li * 0.35;
    P.forearmR.x -= li * 0.5 * (1 - hv); P.forearmL.x -= li * 0.6;
    // pesada: joelho de trás quase no chão, mão direita apoiada à frente
    P.thighR.x += hv * 0.55; P.shinR.x += hv * 0.35;
    P.upperArmR.x += hv * (-0.45 - P.upperArmR.x * 0.6); P.upperArmR.z -= hv * 0.15;
    P.forearmR.x += hv * (-0.15 - P.forearmR.x * 0.6);

    // agachamento genérico (defesa, carga)
    const cr = s.crouch;
    P.thighR.x -= cr * 0.5; P.thighL.x -= cr * 0.5;
    P.shinR.x += cr * 0.9; P.shinL.x += cr * 0.9;
    P.footR.x -= cr * 0.4; P.footL.x -= cr * 0.4;

    // ---------------------------------------------------------------- esgueirar
    // agachado, tronco à frente, cabeça erguida olhando adiante, braços dobrados
    // à frente e pisando na ponta dos pés (o ciclo de marcha continua por cima)
    if (s.sneakSnap) {
      this.sneakW = 0;
      s.sneakSnap = false;
    }
    this.sneakW = damp(this.sneakW, s.sneak && s.action !== 'dodge' ? 1 : 0, 8, dt);
    const sk = this.sneakW;
    if (sk > 0.001) {
      P.thighR.x -= 1.1 * sk; P.thighL.x -= 1.1 * sk;
      P.shinR.x += 1.7 * sk; P.shinL.x += 1.7 * sk;
      P.footR.x -= 0.6 * sk; P.footL.x -= 0.6 * sk;
      P.spine.x += 0.55 * sk; P.chest.x += 0.12 * sk;
      P.head.x -= 0.5 * sk;
      P.upperArmR.x -= 0.3 * sk; P.upperArmL.x -= 0.3 * sk;
      P.upperArmR.z -= 0.22 * sk; P.upperArmL.z += 0.22 * sk;
      P.forearmR.x -= 0.8 * sk; P.forearmL.x -= 0.8 * sk;
    }

    // ---------------------------------------------------------------- defesa
    const g = s.guard;
    if (g > 0.01) {
      // escudo erguido (IK finaliza o braço esquerdo): base baixa com perna esquerda à frente,
      // ombro esquerdo adiantado, cabeça "espiando" por cima do escudo
      P.upperArmL.x = lerp(P.upperArmL.x, -1.25, g);
      P.upperArmL.z = lerp(P.upperArmL.z, 0.35, g);
      P.upperArmL.y = lerp(0, -0.5, g);
      P.forearmL.x = lerp(P.forearmL.x, -1.2, g);
      const st = g * idle; // base só parado (andando com escudo mantém o passo)
      P.thighL.x += -0.3 * st; P.shinL.x += 0.35 * st;
      P.thighR.x += 0.3 * st; P.shinR.x += 0.35 * st;
      P.thighR.z += -0.12 * st; P.thighL.z += 0.1 * st;
      P.pelvis.y += -0.3 * g;
      P.spine.y += 0.18 * g; P.chest.y += 0.08 * g;
      P.head.y += 0.1 * g;
      P.spine.x += g * 0.2;
      P.head.x += -g * 0.1;
      // espada recolhida na lateral, apontando para frente (pronta para contra-atacar)
      P.upperArmR.x = lerp(P.upperArmR.x, 0.05, g);
      P.upperArmR.z = lerp(P.upperArmR.z, -0.35, g);
      P.forearmR.x = lerp(P.forearmR.x, -1.15, g);
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
        P.spine.y += s.attackTwist * 0.6;
        P.pelvis.y += s.attackTwist * 0.45;
        P.spine.x += 0.12;
        // base firme: pernas abertas
        P.thighR.x = lerp(P.thighR.x, 0.35, 0.6);
        P.thighL.x = lerp(P.thighL.x, -0.45, 0.6);
        P.shinR.x = lerp(P.shinR.x, 0.35, 0.6);
        P.shinL.x = lerp(P.shinL.x, 0.3, 0.6);
        // ---- ataque giratório: base baixa e larga; na carga o tronco torce para
        // trás "enrolando a mola"; no giro o corpo inclina para dentro, a cabeça
        // puxa o giro e o braço livre abre para equilibrar
        if (s.attackSpin) {
          const k = s.attackBody ?? 0;
          const charging = s.action === 'charge' ? 1 : 0;
          const wind = Math.max(charging, Math.max(0, -k));
          const spin = s.action === 'attack' ? Math.max(0, k) : 0;
          const low = Math.max(wind, spin);
          P.thighR.z = -0.34 * low; P.thighL.z = 0.34 * low;
          P.thighR.x = 0.05 - 0.2 * low; P.thighL.x = -0.3 * low;
          P.shinR.x = 0.65 * low + 0.2 * spin; P.shinL.x = 0.6 * low + 0.2 * spin;
          P.footR.x = -0.3 * low; P.footL.x = -0.2 * low;
          bodyYOffset -= 0.16 * low + 0.06 * spin;
          // carga: torce para a direita, olhar fica à frente, braço do escudo à frente
          P.pelvis.y += -0.25 * wind;
          P.spine.y += -0.55 * wind; P.chest.y += -0.35 * wind;
          P.head.y += 0.8 * wind;
          P.spine.x += 0.3 * wind + 0.28 * spin;
          P.upperArmL.x += -0.7 * wind; P.upperArmL.z += 0.35 * wind;
          P.forearmL.x -= 0.4 * wind;
          // giro: cabeça adianta, peito puxa, corpo inclina para dentro
          P.head.y += 0.4 * spin;
          P.chest.y += 0.25 * spin;
          P.spine.z += 0.12 * spin;
          targetBodyRotZ += 0.26 * spin;
          // braço do escudo ARRASTADO para trás e para fora (contrapeso, não cobre o corpo)
          P.upperArmL.z += 0.75 * spin; P.upperArmL.x += 0.75 * spin;
          P.forearmL.x -= 0.25 * spin;
          // passinhos de pivô: a cada meia volta um pé sobe e reposiciona
          if (spin > 0.05) {
            const st = Math.sin(s.spinYaw * 2);
            const up = Math.max(0, st), dn = Math.max(0, -st);
            P.thighR.x += -0.35 * up * spin; P.shinR.x += 0.5 * up * spin;
            P.thighL.x += -0.35 * dn * spin; P.shinL.x += 0.5 * dn * spin;
            bodyYOffset += 0.03 * Math.abs(st) * spin;
          }
          targetBodyYaw = s.spinYaw;
          break;
        }
        // ---- golpe de salto: nada de base firme; pernas recolhidas e o corpo
        // inteiro "fecha" para a frente acompanhando o corte de cima para baixo
        if (s.attackAir) {
          const k = s.attackBody ?? 0;
          const commit = Math.max(0, k), antic = Math.max(0, -k);
          P.thighR.x = -0.35 - 0.75 * commit + 0.2 * antic;
          P.thighL.x = -1.0 - 0.3 * commit + 0.15 * antic;
          P.shinR.x = 0.9 + 0.5 * commit;
          P.shinL.x = 1.3 + 0.2 * commit;
          P.thighR.z = -0.1; P.thighL.z = 0.12;
          // ergue (arqueia para trás) e depois dobra forte para a frente
          P.spine.x += -0.35 * antic + 0.55 * commit;
          P.chest.x += -0.2 * antic + 0.25 * commit;
          P.head.x += 0.25 * antic - 0.15 * commit;
          targetBodyRotX = -0.25 * antic + 0.35 * commit;
          bodyYOffset += 0.1 * antic;
          // braço livre abre para equilibrar
          P.upperArmL.z += 0.6 * antic + 0.3 * commit;
          P.upperArmL.x += -0.5 * antic + 0.4 * commit;
          break;
        }
        // ---- corpo inteiro no golpe (espada)
        const M = s.attackMotion ?? 0;
        if (M > 0) {
          const k = s.attackBody ?? 0; // -1..1
          const commit = Math.max(0, k), antic = Math.max(0, -k);
          const side = s.attackSide ?? 0;
          const ov = s.attackOverhead ? 1 : 0;
          // antecipação: peso para trás, tronco recua (e sobe no golpe vertical)
          P.spine.x += (-0.3 * antic - 0.25 * antic * ov + 0.42 * commit + 0.3 * commit * ov) * M;
          P.chest.x += (-0.12 * antic + 0.15 * commit) * M;
          P.head.x += (0.1 * antic - 0.25 * commit) * M;
          // passo: perna esquerda avança e dobra; perna de trás estica e empurra
          P.thighL.x += (-0.55 * commit + 0.25 * antic) * M;
          P.shinL.x += (0.55 * commit) * M;
          P.thighR.x += (0.5 * commit - 0.2 * antic) * M;
          P.shinR.x += (0.25 * commit + 0.3 * antic) * M;
          P.footR.x += 0.35 * commit * M;
          // inclina na direção do corte
          targetBodyRotZ += side * 0.22 * commit * M;
          P.spine.z += side * 0.12 * commit * M;
          // braço do escudo contrabalança
          P.upperArmL.z += (0.35 * commit + 0.15 * antic) * M;
          P.upperArmL.x += (0.45 * commit - 0.3 * antic) * M;
          P.forearmL.x -= 0.5 * commit * M;
          // agacha no impacto; no vertical, pulinho na preparação
          bodyYOffset += (-0.16 * commit - 0.12 * commit * ov + 0.1 * antic * ov) * M;
        }
        // ---- pose de TRABALHO (machado / picareta): pés plantados e afastados, joelhos dobrados
        if (s.attackWork) {
          const k = s.attackBody ?? 0;
          const commit = Math.max(0, k), antic = Math.max(0, -k);
          // base larga e estável, sem passo
          P.thighR.x = 0.15; P.thighL.x = -0.25;
          P.thighR.z = -0.22; P.thighL.z = 0.22;
          P.shinR.x = 0.45; P.shinL.x = 0.4;
          P.footR.x = -0.3; P.footL.x = -0.1;
          bodyYOffset -= 0.08;
          if (s.attackWork === 'chop') {
            // lenhador: carrega o peso na perna de trás e gira; no corte inclina e transfere o peso
            P.spine.x += 0.12 - 0.08 * antic + 0.2 * commit;
            P.pelvis.y += (s.action === 'charge' ? 0.05 : 0.25) * antic - 0.15 * commit;
            P.thighR.x += -0.15 * antic;
            P.shinR.x += 0.2 * antic;
            P.shinL.x += 0.2 * commit;
            P.head.y = -s.attackTwist * 0.5; // olhar fica no alvo
          } else {
            // mineração: ergue o corpo na preparação, dobra na cintura e nos joelhos no golpe
            P.spine.x += -0.22 * antic + 0.55 * commit;
            P.chest.x += -0.1 * antic + 0.15 * commit;
            P.head.x += 0.15 * antic + 0.1 * commit;
            P.shinR.x += 0.35 * commit;
            P.shinL.x += 0.35 * commit;
            P.thighR.x -= 0.25 * commit;
            P.thighL.x -= 0.25 * commit;
            bodyYOffset += 0.04 * antic - 0.14 * commit;
          }
        }
        if (s.action === 'charge') {
          P.thighR.z = -0.2; P.thighL.z = 0.2;
          P.spine.x += 0.15;
        }
        targetBodyYaw = s.spinYaw;
        break;
      }
      case 'climb': {
        // escalada COM PESO: cada braçada estica (mão alta, cotovelo reto) e
        // puxa (cotovelo dobra, corpo sobe e encosta); quadril balança de lado;
        // ao agarrar o corpo cede; cansado, treme
        snappy = true;
        const cp = (s.climbPhase ?? 0) * TAU;
        const mv = s.climbMove ?? 0;
        const jp = s.climbJump ?? 0; // + impulso · − preparação (agacha)
        const gr = s.climbGrab ?? 0;
        const tr = s.climbTired ?? 0;
        const a = Math.sin(cp) * mv; // + = mão direita alta
        const pullR = Math.max(0, -Math.cos(cp)) * mv, pullL = Math.max(0, Math.cos(cp)) * mv;
        const effort = Math.pow(Math.cos(cp), 2) * mv; // pico no meio da puxada
        const shake = Math.sin(this.t * 38) * 0.05 * tr + Math.sin(this.t * 27) * 0.03 * tr;
        const breath = Math.sin(this.t * (2 + 4 * tr)) * (0.03 + 0.04 * tr) * (1 - mv);
        const gather = Math.max(0, -jp), launch = Math.max(0, jp);
        P.pelvis.x = 0.1 + 0.12 * gather;
        P.spine.x = 0.05 - 0.12 * effort + 0.25 * gather - 0.1 * launch + breath;
        P.chest.x = -0.08 - 0.08 * effort;
        P.head.x = -0.5 + 0.15 * effort + shake * 0.4; P.neck.x = -0.1;
        P.head.y = a * 0.12;
        P.spine.z = a * 0.1; P.pelvis.z = -a * 0.14;
        targetBodyRotZ = a * 0.07;
        // braços: mão alta com cotovelo quase reto; a que puxa dobra forte
        P.upperArmR.x = -2.6 - 0.35 * a + 0.35 * pullR - 0.5 * launch + 0.35 * gather + shake;
        P.upperArmL.x = -2.6 + 0.35 * a + 0.35 * pullL - 0.5 * launch + 0.35 * gather - shake;
        P.upperArmR.z = -0.42 - 0.1 * pullR; P.upperArmL.z = 0.42 + 0.1 * pullL;
        P.upperArmR.y = 0; P.upperArmL.y = 0;
        P.forearmR.x = -0.3 - 1.25 * pullR - 0.9 * gather + 0.2 * launch - 0.3 * gr;
        P.forearmL.x = -0.3 - 1.25 * pullL - 0.9 * gather + 0.2 * launch - 0.3 * gr;
        // pernas: a do lado da mão baixa sobe e empurra
        P.thighR.x = -0.8 - 0.5 * pullL + 0.35 * pullR - 0.5 * gather + 0.5 * launch - 0.2 * gr;
        P.thighL.x = -0.8 - 0.5 * pullR + 0.35 * pullL - 0.5 * gather + 0.5 * launch - 0.2 * gr;
        P.thighR.z = -0.2; P.thighL.z = 0.2;
        P.shinR.x = 1.15 + 0.5 * pullL - 0.3 * pullR + 0.6 * gather - 0.7 * launch + 0.3 * gr + shake;
        P.shinL.x = 1.15 + 0.5 * pullR - 0.3 * pullL + 0.6 * gather - 0.7 * launch + 0.3 * gr - shake;
        P.footR.x = -0.35; P.footL.x = -0.35;
        // ---- por direção
        const dx = clamp(s.climbDirX ?? 0, -1, 1), dy = clamp(s.climbDirY ?? 1, -1, 1);
        const wDown = Math.max(0, -dy) * mv, wSide = Math.abs(dx) * mv;
        // DESCENDO: olha para baixo, mãos descem (menos altas), pernas esticam
        // procurando apoio embaixo, corpo afasta um pouco da parede
        if (wDown > 0.001) {
          P.head.x += 0.75 * wDown;
          P.upperArmR.x += 0.75 * wDown; P.upperArmL.x += 0.75 * wDown;
          P.forearmR.x -= 0.35 * wDown; P.forearmL.x -= 0.35 * wDown;
          P.thighR.x += 0.45 * wDown * (1 + 0.6 * pullR); P.thighL.x += 0.45 * wDown * (1 + 0.6 * pullL);
          P.shinR.x -= 0.5 * wDown; P.shinL.x -= 0.5 * wDown;
          P.spine.x -= 0.12 * wDown;
        }
        // PARA OS LADOS: a mão da frente estica para o lado, a de trás recolhe;
        // pernas abrem e fecham (passo lateral), corpo inclina e olha para lá
        if (wSide > 0.001) {
          const lead = Math.sign(dx);
          const reach = 0.5 + 0.5 * Math.sin(cp); // mão da frente alcançando
          const gatherS = 1 - reach;
          const outR = lead > 0 ? reach : -0.4 * gatherS, outL = lead < 0 ? reach : -0.4 * gatherS;
          P.upperArmR.z -= 0.9 * outR * wSide; P.upperArmL.z += 0.9 * outL * wSide;
          P.upperArmR.x += 0.55 * Math.max(0, outR) * wSide; P.upperArmL.x += 0.55 * Math.max(0, outL) * wSide;
          P.forearmR.x += 0.25 * Math.max(0, outR) * wSide; P.forearmL.x += 0.25 * Math.max(0, outL) * wSide;
          // pernas: a do lado do movimento abre quando as mãos se juntam
          const legR = lead > 0 ? gatherS : reach * 0.4, legL = lead < 0 ? gatherS : reach * 0.4;
          P.thighR.z -= 0.5 * legR * wSide; P.thighL.z += 0.5 * legL * wSide;
          P.thighR.x += 0.3 * legR * wSide; P.thighL.x += 0.3 * legL * wSide;
          P.head.y -= lead * 0.55 * wSide;
          P.spine.z -= lead * 0.1 * wSide;
          targetBodyRotZ += lead * 0.1 * wSide;
        }
        // corpo: sobe na puxada, agacha na preparação, cede ao agarrar
        bodyYOffset = 0.05 * effort * (1 - wDown) - 0.14 * gather - 0.12 * gr;
        break;
      }
      case 'mantle': {
        // subir a beirada com esforço: pendura com braços esticados → puxa
        // (cotovelos dobram, peito passa a borda) → apoia as mãos e empurra
        // para baixo, joelho direito sobe na borda → levanta
        snappy = true;
        const hangK = 1 - clamp01((u - 0.1) / 0.14);
        // junta força pendurado e dá o TRANCO (puxão rápido em ~0,2 s)
        const pullK = 1 - Math.pow(1 - clamp01((u - 0.2) / 0.25), 3);
        const press = Math.sin(clamp01((u - 0.45) / 0.45) * Math.PI);
        const stand = clamp01((u - 0.78) / 0.22);
        const pre = 1 - clamp01((u - 0.45) / 0.15); // antes de apoiar as mãos
        P.upperArmR.x = P.upperArmL.x = (-2.7 + 1.1 * pullK) * pre + (0.25 * press) * (1 - pre);
        P.upperArmR.z = -0.4; P.upperArmL.z = 0.4;
        P.forearmR.x = P.forearmL.x = (-0.15 - 1.5 * pullK * (1 - hangK)) * pre + (-0.25 * press) * (1 - pre);
        P.spine.x = 0.1 + 0.35 * pullK * pre + 0.55 * press;
        P.chest.x = -0.1 * hangK;
        P.head.x = -0.5 * hangK - 0.2 * pullK * pre + 0.15 * press;
        P.thighR.x = (-1.6 * press - 0.3 * hangK) * (1 - stand); P.thighL.x = (-0.4 * press + 0.15 * hangK) * (1 - stand);
        P.shinR.x = (2.0 * press + 0.4 * hangK) * (1 - stand) + 0.05; P.shinL.x = (1.0 * press + 0.3 * hangK) * (1 - stand) + 0.05;
        P.footR.x = -0.3 * press; P.footL.x = -0.2 * press;
        bodyYOffset = -0.12 * press * (1 - stand);
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
          // pulo para trás EXAGERADO: agacha e explode para trás arqueando o
          // corpo, braços jogados para cima/à frente, joelhos no peito no alto,
          // e aterrissa agachado fundo
          const k = Math.sin(u * Math.PI);
          const push = u < 0.3 ? Math.sin((u / 0.3) * Math.PI) : 0;
          const tuck = Math.sin(clamp01((u - 0.2) / 0.6) * Math.PI);
          const land = clamp01((u - 0.78) / 0.22);
          const arch = Math.sin(clamp01(u / 0.55) * Math.PI);
          P.spine.x = -0.18 * arch + 0.3 * tuck * (u > 0.45 ? 1 : 0.3) + 0.35 * land;
          P.chest.x = -0.06 * arch;
          P.head.x = 0.12 * arch - 0.1 * land;
          P.thighR.x = -1.35 * tuck + 0.2 * push; P.shinR.x = 1.7 * tuck + 0.5 * land;
          P.thighL.x = -1.1 * tuck + 0.3 * push; P.shinL.x = 1.5 * tuck + 0.5 * land;
          P.thighR.x -= 0.5 * land; P.thighL.x -= 0.5 * land;
          P.footR.x = P.footL.x = 0.35 * tuck;
          // braços: lançados para cima/à frente no impulso, abertos no ar
          P.upperArmR.x = P.upperArmL.x = -1.1 * arch - 0.5 * tuck;
          P.upperArmR.z = -0.55 * k; P.upperArmL.z = 0.55 * k;
          P.forearmR.x = P.forearmL.x = -0.3 * k;
          targetBodyRotX = -0.14 * arch + 0.2 * land;
          bodyYOffset = 0.22 * tuck - 0.25 * land - 0.12 * push;
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
        // postura de arqueiro: corpo de lado (ombro esquerdo para o alvo), pés afastados,
        // cabeça virada para o alvo; os braços são posicionados por IK no PlayerView
        targetBodyYaw = -1.42;
        P.pelvis.y += 0.1;
        P.chest.y += -0.12;
        P.neck.y = 0.65;
        P.head.y = 0.7;
        P.head.x = -s.aimPitch * 0.35;
        P.head.z = 0.08;
        // mirar para cima/baixo inclina o tronco para o lado (o ombro esquerdo sobe/desce)
        P.spine.z = s.aimPitch * 0.45;
        P.chest.z = s.aimPitch * 0.2;
        P.spine.x = 0.04;
        // base: pés afastados, joelhos levemente dobrados
        P.thighR.x = 0.05; P.thighL.x = -0.05;
        P.thighR.z = -0.2; P.thighL.z = 0.2;
        P.shinR.x = 0.18; P.shinL.x = 0.18;
        P.footR.z = 0.15; P.footL.z = -0.15;
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
    // inclinação na curva: limitada e suave (giros rápidos não dão "tranco")
    this.lean = damp(this.lean, clamp(-s.turnRate * 0.045 * clamp01((speed - 1) / 4), -0.22, 0.22), 5, dt);
    targetBodyRotZ += s.grounded && s.action === 'none' ? this.lean : 0;

    // ---------------------------------------------------------------- aplica com suavização
    // locomoção rápida precisa de pouca suavização, senão o ciclo de corrida perde amplitude
    const rate = snappy ? 34 : lerp(16, 38, moving);
    const k = 1 - Math.exp(-rate * dt);
    for (const j of JOINTS) {
      this.targetQ.setFromEuler(P[j]);
      this.fk[j].slerp(this.targetQ, k);
      this.rig.joints[j].quaternion.copy(this.fk[j]);
    }
    // corpo: rotações grandes (rolamento) aplicadas direto para não "desenrolar" pelo caminho curto
    if (s.action === 'dodge' && s.dodgeType === 'flip') this.bodyRotX = targetBodyRotX;
    else this.bodyRotX = damp(this.bodyRotX, targetBodyRotX, snappy ? 25 : 12, dt);
    this.bodyRotZ = damp(this.bodyRotZ, targetBodyRotZ, 12, dt);
    if (s.action === 'attack' && Math.abs(targetBodyYaw) > 0.01) this.bodyYaw = targetBodyYaw;
    else {
      // depois de um giro o corpo pode estar em 2π: equivale a 0, nunca "desgira"
      this.bodyYaw = Math.atan2(Math.sin(this.bodyYaw), Math.cos(this.bodyYaw));
      this.bodyYaw = damp(this.bodyYaw, targetBodyYaw, 10, dt);
    }
    this.bodyY = damp(this.bodyY, bodyYOffset, 20, dt);
    const b = this.rig.body;
    b.rotation.set(this.bodyRotX, this.bodyYaw, this.bodyRotZ, 'YXZ');
    // estica no ar (subindo rápido) e achata na aterrissagem
    const stretch = s.grounded ? 0 : clamp(Math.abs(s.vy) * 0.012, 0, 0.1);
    const sy = 1 + stretch - li * (0.12 + 0.1 * this.landLevel);
    this.squash = damp(this.squash, sy, 25, dt);
    b.scale.set(1 / Math.sqrt(this.squash), this.squash, 1 / Math.sqrt(this.squash));
    b.position.y = this.rig.bodyPivotY + this.bodyY - li * (0.16 + 0.26 * this.landLevel) - cr * 0.12 - this.sneakW * 0.32 + bob;
  }
}

// ---------------------------------------------------------------- ciclo de corrida
// [coxa, canela] por pose-chave (rad; coxa − = à frente, canela + = dobra)
const RUN_KEYS: [number, number][] = [
  [-0.7, 0.3], // contato: pé pousa pouco à frente do quadril, joelho quase reto
  [-0.3, 0.72], // compressão: joelho de apoio dobra e absorve
  [0.12, 0.55], // apoio: corpo passa por cima do pé
  [0.58, 0.25], // impulso: perna estende atrás e empurra
  [0.66, 0.9], // saída do pé: joelho começa a dobrar
  [0.35, 1.9], // calcanhar alto atrás
  [-0.45, 2.1], // passagem: calcanhar junto ao quadril, joelho vem à frente
  [-1.2, 1.3], // joelho alto, pé embaixo do joelho
];
function catmull(a: number, b: number, c: number, d: number, t: number) {
  const t2 = t * t, t3 = t2 * t;
  return 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
}
/** Pose de uma perna na corrida para a fase p ∈ [0,1) (0 = contato). */
function runLeg(p: number) {
  const n = RUN_KEYS.length;
  const f = p * n;
  const i = Math.floor(f), t = f - i;
  const k = (j: number) => RUN_KEYS[((j % n) + n) % n];
  const thigh = catmull(k(i - 1)[0], k(i)[0], k(i + 1)[0], k(i + 2)[0], t);
  const shin = catmull(k(i - 1)[1], k(i)[1], k(i + 1)[1], k(i + 2)[1], t);
  // apoio (p < ~0.45): pé plano no chão; balanço: ponta do pé estendida
  const stance = p < 0.42 ? 1 : p < 0.52 ? 1 - (p - 0.42) / 0.1 : p > 0.94 ? (p - 0.94) / 0.06 : 0;
  const flat = -(thigh + shin);
  const foot = flat * stance + (flat * 0.4 + 0.45) * (1 - stance);
  return { thigh, shin, foot };
}
