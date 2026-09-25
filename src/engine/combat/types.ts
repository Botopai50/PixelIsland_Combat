import * as THREE from 'three';
import type { ImpactMaterial } from '../vfx/ImpactFX';

export type Team = 'player' | 'enemy' | 'neutral';
export type ToolKind = 'sword' | 'axe' | 'pickaxe' | 'arrow' | 'club' | 'shield';

/** Cápsula (a→b, raio) em coordenadas de mundo, atualizada pelo dono a cada frame. */
export interface Hurtbox {
  a: THREE.Vector3;
  b: THREE.Vector3;
  radius: number;
  tag?: 'body' | 'head' | 'shield';
  /** Sobrescreve o material do dono (ex.: escudo metálico de um inimigo). */
  material?: ImpactMaterial;
  enabled?: boolean;
}

export interface HitInfo {
  attacker: unknown;
  team: Team;
  tool: ToolKind;
  damage: number;
  /** 0..1 (leve → pesado). Controla hit stop, tremor, partículas e reação. */
  strength: number;
  knockback: number;
  point: THREE.Vector3;
  /** Direção de deslocamento do golpe (normalizada). */
  dir: THREE.Vector3;
  /** Normal da superfície no ponto (para fora do alvo). */
  normal: THREE.Vector3;
  hurtbox: Hurtbox;
  projectile: boolean;
  charged: boolean;
  /** Origem do atacante (para testes de direção de bloqueio). */
  origin: THREE.Vector3;
  /** Ignora escudos (ex.: rajada após esquiva perfeita). */
  unblockable?: boolean;
}

export interface HitResult {
  material: ImpactMaterial;
  damage: number;
  /** 0 = ferramenta errada, 1 = normal, >1 = muito eficaz. */
  effectiveness: number;
  /** O golpe ricocheteou (metal/pedra com ferramenta errada) → recuo da arma. */
  deflected: boolean;
  blocked: boolean;
  parried: boolean;
  killed: boolean;
  /** Sem som/partícula (ex.: esquiva com invulnerabilidade). */
  ignored: boolean;
}

export function emptyResult(material: ImpactMaterial = 'flesh'): HitResult {
  return { material, damage: 0, effectiveness: 1, deflected: false, blocked: false, parried: false, killed: false, ignored: false };
}

/** Qualquer coisa que pode ser atingida: inimigos, jogador, árvore, pedra, boneco. */
export interface Damageable {
  readonly id: number;
  team: Team;
  alive: boolean;
  hurtboxes: Hurtbox[];
  material: ImpactMaterial;
  /** Objeto 3D onde flechas se prendem. */
  stickRoot: THREE.Object3D;
  /** Centro aproximado (lock-on, assistência de mira). */
  center(out: THREE.Vector3): THREE.Vector3;
  receiveHit(hit: HitInfo): HitResult;
  /** Pode ser alvo de lock-on? */
  lockable?: boolean;
}

let nextId = 1;
export const newId = () => nextId++;

/**
 * Eficácia de ferramenta por material. É aqui que "o machado é a ferramenta
 * certa para árvores" e "a picareta para pedras" viram regra de jogo.
 */
export function toolEffectiveness(tool: ToolKind, mat: ImpactMaterial): number {
  const T: Record<string, Partial<Record<ToolKind, number>>> = {
    wood: { axe: 1, sword: 0.2, pickaxe: 0.3, arrow: 0, club: 0, shield: 0 },
    stone: { pickaxe: 1, axe: 0.12, sword: 0, arrow: 0, club: 0, shield: 0 },
    metal: { pickaxe: 0.2, axe: 0.2, sword: 0, arrow: 0, club: 0 },
  };
  return T[mat]?.[tool] ?? 1;
}
