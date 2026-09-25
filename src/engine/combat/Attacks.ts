import * as THREE from 'three';
import { DEG, easeOutCubic, easeOutQuad, clamp01, lerp } from '../core/math';
import type { ToolKind } from './types';

/**
 * Definição de um golpe corpo a corpo. Todo ataque tem:
 *  preparação (windup) → janela ativa (active, única fase que causa dano) → recuperação.
 *
 * A trajetória é um arco: a lâmina gira de `arc[0]` a `arc[1]` graus num plano
 * inclinado `roll` graus (0 = horizontal, 90 = vertical/de cima para baixo).
 * A MESMA função de trajetória alimenta: detecção de acerto, braço/arma da
 * 3ª pessoa (IK), viewmodel da 1ª pessoa e rastro. Por isso o dano coincide
 * com o contato visual nas duas perspectivas.
 */
export interface AttackDef {
  id: string;
  windup: number;
  active: number;
  recovery: number;
  damage: number;
  /** 0..1: leve → pesado (hit stop, tremor, partículas, reação do alvo). */
  strength: number;
  knockback: number;
  hitStop: number;
  shake: number;
  arc: [number, number];
  roll: number;
  /** Inclina o plano para frente/baixo (graus). */
  pitch: number;
  /** right = ombro direito (uma mão); center = giro do corpo; chest = ferramenta com as duas mãos. */
  pivot: 'right' | 'center' | 'chest';
  /** Velocidade de avanço durante preparação/golpe (m/s). */
  lunge: number;
  /** Segundos dentro da recuperação a partir dos quais defesa/esquiva cancelam. */
  cancelAt: number;
  /** Permite cancelar a preparação com defesa/esquiva (golpes leves). */
  cancelWindup: boolean;
  /** Segundos dentro da recuperação a partir dos quais o próximo golpe do combo pode sair. */
  chainAt: number;
  next?: string;
  stamina?: number;
  /** Intensidade do "whoosh" (0..1). */
  whoosh: number;
  /** Quanto o tronco gira acompanhando o golpe (0..1). */
  bodyTwist: number;
  /** Golpe giratório: o corpo inteiro gira junto. */
  spin?: boolean;
  /**
   * Quanto o CORPO participa do golpe (0 = só braço/tronco; 1 = corpo inteiro:
   * antecipação, passo à frente, inclinação no corte, agachamento no impacto).
   */
  bodyMotion?: number;
  /** Golpe vertical com pulinho na preparação e descida com o peso todo. */
  overhead?: boolean;
  /** Uso de ferramenta (pose de trabalho, duas mãos, pés plantados). */
  work?: 'chop' | 'mine';
  label: string;
}

export interface WeaponDef {
  id: 'sword' | 'axe' | 'pickaxe' | 'bow' | 'club';
  tool: ToolKind;
  /** Região de acerto ao longo da arma, a partir da empunhadura (m). */
  bladeStart: number;
  bladeEnd: number;
  hitRadius: number;
  combo: string[];
  charged?: string;
  air?: string;
  equipTime: number;
  trailColor: number;
  /** Redução de dano ao defender só com a arma (sem escudo). */
  weaponGuard: number;
  /** Superfície da arma ao bater em metal/parede. */
  sound: 'blade' | 'blunt';
}

const A = (d: Partial<AttackDef> & Pick<AttackDef, 'id' | 'label'>): AttackDef => ({
  windup: 0.1, active: 0.1, recovery: 0.3, damage: 10, strength: 0.3, knockback: 3, hitStop: 0.05, shake: 0.15,
  arc: [80, -80], roll: 0, pitch: 10, pivot: 'right', lunge: 2, cancelAt: 0.05, cancelWindup: false, chainAt: 0.02,
  whoosh: 0.3, bodyTwist: 0.35, ...d,
});

export const ATTACKS: Record<string, AttackDef> = {
  // --------------------------------------------------------- espada: rápida, combo de 3
  sword1: A({ id: 'sword1', label: 'Corte 1', windup: 0.09, active: 0.09, recovery: 0.26, damage: 12, strength: 0.28, knockback: 2.5, hitStop: 0.045, shake: 0.12, arc: [80, -85], roll: -8, pitch: 12, lunge: 2.6, cancelAt: 0, cancelWindup: true, chainAt: 0.0, next: 'sword2', whoosh: 0.3, bodyTwist: 0.55, bodyMotion: 0.5 }),
  sword2: A({ id: 'sword2', label: 'Corte 2', windup: 0.08, active: 0.09, recovery: 0.28, damage: 12, strength: 0.32, knockback: 2.8, hitStop: 0.05, shake: 0.14, arc: [-85, 75], roll: 38, pitch: 8, lunge: 2.6, cancelAt: 0, cancelWindup: true, chainAt: 0.0, next: 'sword3', whoosh: 0.35, bodyTwist: 0.55, bodyMotion: 0.5 }),
  sword3: A({ id: 'sword3', label: 'Golpe Final', windup: 0.16, active: 0.1, recovery: 0.42, damage: 22, strength: 0.65, knockback: 6, hitStop: 0.085, shake: 0.3, arc: [120, -30], roll: 90, pitch: 0, lunge: 4.5, cancelAt: 0.14, cancelWindup: false, chainAt: 0.3, whoosh: 0.6, bodyTwist: 0.25, bodyMotion: 0.6, overhead: true }),
  swordSpin: A({ id: 'swordSpin', label: 'Ataque Giratório', windup: 0.05, active: 0.42, recovery: 0.36, damage: 28, strength: 0.85, knockback: 7, hitStop: 0.1, shake: 0.4, arc: [100, -460], roll: 0, pitch: 6, pivot: 'center', lunge: 0, cancelAt: 0.2, whoosh: 0.9, spin: true, stamina: 25 }),
  swordAir: A({ id: 'swordAir', label: 'Corte Aéreo', windup: 0.07, active: 0.11, recovery: 0.22, damage: 15, strength: 0.5, knockback: 4, hitStop: 0.06, shake: 0.2, arc: [125, -45], roll: 90, pitch: 0, lunge: 0, cancelAt: 0.1, whoosh: 0.5, bodyMotion: 0.35 }),
  flurryA: A({ id: 'flurryA', label: 'Rajada', windup: 0.02, active: 0.06, recovery: 0.03, damage: 8, strength: 0.35, knockback: 1, hitStop: 0.03, shake: 0.12, arc: [80, -80], roll: 20, pitch: 10, lunge: 0, whoosh: 0.35, bodyTwist: 0.5, bodyMotion: 0.4 }),
  flurryB: A({ id: 'flurryB', label: 'Rajada', windup: 0.02, active: 0.06, recovery: 0.03, damage: 8, strength: 0.35, knockback: 1, hitStop: 0.03, shake: 0.12, arc: [-80, 80], roll: -25, pitch: 10, lunge: 0, whoosh: 0.35, bodyTwist: 0.5, bodyMotion: 0.4 }),

  // --------------------------------------------------------- machado: lento, pesado
  // Ferramentas: golpes de TRABALHO. Duas mãos no cabo, pés plantados, ritmo repetido.
  // Machado: corte horizontal de lenhador que PARA no tronco (não atravessa o corpo) e é puxado de volta.
  axe1: A({ id: 'axe1', label: 'Machadada', windup: 0.3, active: 0.1, recovery: 0.4, damage: 17, strength: 0.55, knockback: 3, hitStop: 0.08, shake: 0.22, arc: [120, -12], roll: -4, pitch: 18, pivot: 'chest', lunge: 0, cancelAt: 0.14, chainAt: 0.16, next: 'axe1', whoosh: 0.55, bodyTwist: 0.45, work: 'chop' }),
  axeCharged: A({ id: 'axeCharged', label: 'Machadada Carregada', windup: 0.08, active: 0.12, recovery: 0.55, damage: 45, strength: 1, knockback: 6, hitStop: 0.15, shake: 0.6, arc: [150, -20], roll: -4, pitch: 22, pivot: 'chest', lunge: 0, cancelAt: 0.3, whoosh: 1, bodyTwist: 0.6, stamina: 25, work: 'chop' }),

  // --------------------------------------------------------- picareta: golpes verticais
  // Picareta: ergue acima da cabeça e desce até o chão à frente, dobrando o tronco.
  pick1: A({ id: 'pick1', label: 'Picaretada', windup: 0.32, active: 0.1, recovery: 0.42, damage: 14, strength: 0.55, knockback: 2, hitStop: 0.08, shake: 0.22, arc: [155, -62], roll: 90, pitch: 0, pivot: 'chest', lunge: 0, cancelAt: 0.14, chainAt: 0.16, next: 'pick1', whoosh: 0.5, bodyTwist: 0, work: 'mine' }),
  pickCharged: A({ id: 'pickCharged', label: 'Picaretada Carregada', windup: 0.08, active: 0.11, recovery: 0.55, damage: 38, strength: 0.95, knockback: 4, hitStop: 0.13, shake: 0.55, arc: [165, -66], roll: 90, pitch: 0, pivot: 'chest', lunge: 0, cancelAt: 0.3, whoosh: 0.95, bodyTwist: 0, stamina: 25, work: 'mine' }),

  // --------------------------------------------------------- clava (inimigo): preparação longa e legível
  club1: A({ id: 'club1', label: 'Clava', windup: 0.55, active: 0.14, recovery: 0.6, damage: 18, strength: 0.6, knockback: 6, hitStop: 0.08, shake: 0.35, arc: [125, -35], roll: 70, pitch: 0, lunge: 3.2, whoosh: 0.7 }),
  club2: A({ id: 'club2', label: 'Clava lateral', windup: 0.45, active: 0.14, recovery: 0.55, damage: 16, strength: 0.55, knockback: 6, hitStop: 0.08, shake: 0.3, arc: [95, -75], roll: 0, pitch: 14, lunge: 3.2, whoosh: 0.65 }),
};

export const WEAPONS: Record<WeaponDef['id'], WeaponDef> = {
  sword: { id: 'sword', tool: 'sword', bladeStart: 0.1, bladeEnd: 1.0, hitRadius: 0.08, combo: ['sword1', 'sword2', 'sword3'], charged: 'swordSpin', air: 'swordAir', equipTime: 0.22, trailColor: 0xcfe8ff, weaponGuard: 0.5, sound: 'blade' },
  axe: { id: 'axe', tool: 'axe', bladeStart: 0.3, bladeEnd: 0.85, hitRadius: 0.13, combo: ['axe1'], charged: 'axeCharged', air: 'swordAir', equipTime: 0.3, trailColor: 0xffd9a0, weaponGuard: 0.35, sound: 'blunt' },
  pickaxe: { id: 'pickaxe', tool: 'pickaxe', bladeStart: 0.3, bladeEnd: 0.85, hitRadius: 0.11, combo: ['pick1'], charged: 'pickCharged', air: 'swordAir', equipTime: 0.3, trailColor: 0xd8e0ff, weaponGuard: 0.3, sound: 'blunt' },
  bow: { id: 'bow', tool: 'arrow', bladeStart: 0, bladeEnd: 0, hitRadius: 0, combo: [], equipTime: 0.25, trailColor: 0xffffff, weaponGuard: 0, sound: 'blunt' },
  club: { id: 'club', tool: 'club', bladeStart: 0.25, bladeEnd: 0.95, hitRadius: 0.13, combo: ['club1', 'club2'], equipTime: 0.3, trailColor: 0xff8080, weaponGuard: 0.3, sound: 'blunt' },
};

/** Durações efetivas com os multiplicadores do painel. */
export interface Timing {
  windup: number;
  active: number;
  recovery: number;
  total: number;
}
export function attackTiming(def: AttackDef, speedMul: number, recoveryMul: number): Timing {
  const s = 1 / Math.max(0.1, speedMul);
  const windup = def.windup * s;
  const active = def.active * s;
  const recovery = def.recovery * s * recoveryMul;
  return { windup, active, recovery, total: windup + active + recovery };
}

export type SwingPhase = 'windup' | 'active' | 'recovery' | 'done';

/** Ângulo da lâmina (graus) no tempo `t` desde o início do ataque. */
export function swingAngle(def: AttackDef, tm: Timing, t: number): { angle: number; phase: SwingPhase; u: number } {
  const [a0, a1] = def.arc;
  const sgn = Math.sign(a1 - a0) || 1;
  if (t < tm.windup) {
    const u = t / tm.windup;
    // preparação: puxa a arma para trás do início do arco (antecipação)
    return { angle: lerp(a0 * 0.45, a0 - sgn * 14, easeOutCubic(u)), phase: 'windup', u };
  }
  if (t < tm.windup + tm.active) {
    const u = (t - tm.windup) / tm.active;
    return { angle: lerp(a0 - sgn * 14, a1, easeOutQuad(u)), phase: 'active', u };
  }
  const u = clamp01((t - tm.windup - tm.active) / Math.max(1e-4, tm.recovery));
  // continuação (follow-through) curta e acomodação
  const over = Math.sin(Math.min(1, u * 2.2) * Math.PI) * 9 * (1 - u);
  return { angle: a1 + sgn * over, phase: u >= 1 ? 'done' : 'recovery', u };
}

const _q = new THREE.Quaternion();
const _axis = new THREE.Vector3();
const F = new THREE.Vector3(0, 0, 1);
const R = new THREE.Vector3(-1, 0, 0); // direita do personagem (olhando +Z)
const U = new THREE.Vector3(0, 1, 0);

/**
 * Direção da lâmina no espaço LOCAL do personagem (frente +Z, direita -X).
 * Também devolve a direção do "gume" (tangente do movimento).
 */
export function swingDirLocal(def: AttackDef, angleDeg: number, outDir: THREE.Vector3, outEdge: THREE.Vector3) {
  const th = angleDeg * DEG;
  const roll = def.roll * DEG;
  // eixo "lateral" do plano de golpe, inclinado pelo roll
  const side = _axis.copy(R).multiplyScalar(Math.cos(roll)).addScaledVector(U, Math.sin(roll));
  outDir.copy(F).multiplyScalar(Math.cos(th)).addScaledVector(side, Math.sin(th));
  const sgn = Math.sign(def.arc[1] - def.arc[0]) || 1;
  outEdge.copy(F).multiplyScalar(-Math.sin(th)).addScaledVector(side, Math.cos(th)).multiplyScalar(sgn);
  if (def.pitch) {
    // inclina o plano para baixo ao redor do eixo lateral do personagem
    _q.setFromAxisAngle(R, def.pitch * DEG);
    outDir.applyQuaternion(_q);
    outEdge.applyQuaternion(_q);
  }
  outDir.normalize();
  outEdge.normalize();
}

export const SHOULDER_R = new THREE.Vector3(-0.2, 1.38, 0.04);
export const SPIN_PIVOT = new THREE.Vector3(0, 1.12, 0);
export const ARM_REACH = 0.56;
export const CHEST_PIVOT = new THREE.Vector3(0, 1.28, 0.1);
/** Ponto em que a mão esquerda segura o cabo nas ferramentas de duas mãos (m, ao longo da arma). */
export const TWO_HAND_GRIP = 0.3;

/** Pivô e alcance do braço para um golpe (usado por lógica, 3ª e 1ª pessoa). */
export function pivotFor(def: AttackDef): { pivot: THREE.Vector3; reach: number } {
  if (def.pivot === 'center') return { pivot: SPIN_PIVOT, reach: 0.7 };
  if (def.pivot === 'chest') return { pivot: CHEST_PIVOT, reach: 0.5 };
  return { pivot: SHOULDER_R, reach: ARM_REACH };
}

/**
 * Segmento de acerto da arma em coordenadas de MUNDO, a partir da posição/rotação
 * lógica do personagem (pés + yaw). Não depende do modelo visual.
 */
export function bladeSegmentWorld(
  def: AttackDef, weapon: WeaponDef, angleDeg: number, rangeMul: number,
  feet: THREE.Vector3, yaw: number, scale: number,
  outHand: THREE.Vector3, outBase: THREE.Vector3, outTip: THREE.Vector3, outDir: THREE.Vector3, outEdge: THREE.Vector3,
) {
  swingDirLocal(def, angleDeg, outDir, outEdge);
  const { pivot, reach } = pivotFor(def);
  outHand.copy(pivot).multiplyScalar(scale).addScaledVector(outDir, reach * scale);
  _q.setFromAxisAngle(U, yaw);
  outHand.applyQuaternion(_q).add(feet);
  outDir.applyQuaternion(_q);
  outEdge.applyQuaternion(_q);
  outBase.copy(outHand).addScaledVector(outDir, weapon.bladeStart * rangeMul * scale);
  outTip.copy(outHand).addScaledVector(outDir, weapon.bladeEnd * rangeMul * scale);
}
