import * as THREE from 'three';
import type { Tuning } from './Tuning';
import type { GameClock } from './GameClock';
import type { Input } from './Input';
import type { Emitter } from './Events';
import type { PhysicsWorld } from '../physics/PhysicsWorld';
import type { CombatWorld } from '../combat/CombatWorld';
import type { SoundEngine } from '../audio/SoundEngine';
import type { ImpactFX } from '../vfx/ImpactFX';
import type { CameraShake } from '../vfx/CameraShake';
import type { Damageable, HitInfo, HitResult } from '../combat/types';
import type { ItemId } from '../items/Items';

/**
 * Eventos de jogo. A lógica (jogador, inimigos, objetos) só EMITE eventos;
 * o FeedbackDirector transforma eventos em som, partículas, tremor, hit stop,
 * números de dano e UI. Assim a regra e o "juice" ficam desacoplados.
 */
export type GameEvents = {
  hit: { hit: HitInfo; result: HitResult; target: Damageable; source: 'player' | 'enemy' };
  swing: { pos: THREE.Vector3; intensity: number; source: 'player' | 'enemy' };
  miss: { pos: THREE.Vector3; intensity: number };
  wallHit: { pos: THREE.Vector3; dir: THREE.Vector3; normal: THREE.Vector3; material: string; intensity: number };
  footstep: { pos: THREE.Vector3; surface: string; intensity: number; player: boolean };
  jump: { pos: THREE.Vector3 };
  land: { pos: THREE.Vector3; intensity: number; surface: string; player: boolean };
  dodge: { pos: THREE.Vector3 };
  perfectDodge: { pos: THREE.Vector3 };
  flurryHit: { pos: THREE.Vector3 };
  chargeStart: { pos: THREE.Vector3 };
  chargeReady: { pos: THREE.Vector3 };
  bowFire: { pos: THREE.Vector3; power: number };
  noAmmo: void;
  equip: { item: ItemId | null; slot: 'main' | 'off'; kind: string };
  pickup: { item: ItemId; count: number; pos: THREE.Vector3 };
  toast: { text: string; kind?: 'info' | 'warn' | 'good' };
  treeFell: { pos: THREE.Vector3; dir: THREE.Vector3 };
  treeLanded: { pos: THREE.Vector3; dir: THREE.Vector3 };
  rockBroke: { pos: THREE.Vector3 };
  rockCrack: { pos: THREE.Vector3; stage: number };
  enemyWindup: { pos: THREE.Vector3 };
  enemyDeath: { pos: THREE.Vector3 };
  enemySpawn: { pos: THREE.Vector3 };
  playerDeath: void;
  playerRespawn: void;
  hitConfirm: { pos: THREE.Vector3; kill: boolean; ranged: boolean };
};

/** Algo que pode ser "ameaça iminente" (usado para detectar esquiva perfeita). */
export interface Threat {
  isThreatening(pos: THREE.Vector3, lookahead: number): boolean;
}

/** Dependências compartilhadas entre sistemas. Nenhum sistema conhece a arena. */
export interface GameContext {
  tuning: Tuning;
  clock: GameClock;
  input: Input;
  events: Emitter<GameEvents>;
  physics: PhysicsWorld;
  combat: CombatWorld;
  sound: SoundEngine;
  fx: ImpactFX;
  shake: CameraShake;
  scene: THREE.Scene;
  threats: () => Iterable<Threat>;
}
