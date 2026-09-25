import type { WeaponDef } from '../combat/Attacks';

export type ItemId = 'sword' | 'axe' | 'pickaxe' | 'bow' | 'shield' | 'arrow' | 'wood' | 'stone';
export type ItemKind = 'weapon' | 'tool' | 'bow' | 'shield' | 'ammo' | 'resource';

export interface ItemDef {
  id: ItemId;
  name: string;
  kind: ItemKind;
  stack: number;
  icon: string;
  desc: string;
  weapon?: WeaponDef['id'];
}

/** SVGs simples inline para ícones (sem arquivos externos). */
const svg = (body: string) =>
  `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;

export const ITEMS: Record<ItemId, ItemDef> = {
  sword: {
    id: 'sword', name: 'Espada', kind: 'weapon', stack: 1, weapon: 'sword',
    desc: 'Rápida e precisa. Combo de 3 golpes; segure para o Ataque Giratório.',
    icon: svg('<path d="M24 3l5 0 0 5-13 13-5-5z" fill="#dfe8f2" stroke="#6a7a8c"/><path d="M8 17l7 7-2 2-2-2-4 4-2-2 4-4-2-2z" fill="#8a5a2b" stroke="#3b2612"/><rect x="7" y="18" width="9" height="3" transform="rotate(45 11.5 19.5)" fill="#d9b24a"/>'),
  },
  axe: {
    id: 'axe', name: 'Machado', kind: 'tool', stack: 1, weapon: 'axe',
    desc: 'Lento e pesado. Ferramenta certa para derrubar árvores.',
    icon: svg('<rect x="14" y="4" width="3.5" height="25" rx="1.5" transform="rotate(35 16 16)" fill="#9c6a3a" stroke="#4a2f16"/><path d="M17 4c6 0 10 4 10 9l-8 1-3-6z" fill="#c9d1dc" stroke="#5b6573"/>'),
  },
  pickaxe: {
    id: 'pickaxe', name: 'Picareta', kind: 'tool', stack: 1, weapon: 'pickaxe',
    desc: 'Golpes verticais. Ferramenta certa para quebrar pedras.',
    icon: svg('<rect x="14.5" y="6" width="3" height="24" rx="1.5" transform="rotate(20 16 16)" fill="#9c6a3a" stroke="#4a2f16"/><path d="M4 11c7-7 17-7 24 0l-2 2c-6-5-14-5-20 0z" fill="#b9c2cf" stroke="#4c5563"/>'),
  },
  bow: {
    id: 'bow', name: 'Arco', kind: 'bow', stack: 1, weapon: 'bow',
    desc: 'Segure para puxar a corda; solte para disparar. Defender/esquivar cancela.',
    icon: svg('<path d="M9 3c12 4 12 22 0 26" fill="none" stroke="#8a5a2b" stroke-width="3"/><line x1="9" y1="3" x2="9" y2="29" stroke="#eee" stroke-width="1"/><line x1="6" y1="16" x2="29" y2="16" stroke="#c9a46a" stroke-width="1.6"/><path d="M29 16l-4-2 0 4z" fill="#ccd"/>'),
  },
  shield: {
    id: 'shield', name: 'Escudo', kind: 'shield', stack: 1,
    desc: 'Mão secundária. Segure defesa para bloquear; defenda no tempo certo para APARAR.',
    icon: svg('<path d="M16 3l11 4v8c0 7-5 12-11 14C10 27 5 22 5 15V7z" fill="#3b6ea8" stroke="#c9d1dc" stroke-width="2"/><path d="M16 8l6 2v5c0 4-3 7-6 8z" fill="#e0b640"/>'),
  },
  arrow: {
    id: 'arrow', name: 'Flecha', kind: 'ammo', stack: 99,
    desc: 'Munição do arco. Consumida a cada disparo; flechas cravadas podem ser recolhidas.',
    icon: svg('<line x1="5" y1="27" x2="25" y2="7" stroke="#b58a52" stroke-width="2.2"/><path d="M27 5l-7 2 5 5z" fill="#cfd6df"/><path d="M5 27l1-5 3 3zM8 24l1-5 3 3z" fill="#e8e8e8"/>'),
  },
  wood: {
    id: 'wood', name: 'Madeira', kind: 'resource', stack: 99,
    desc: 'Recurso obtido ao derrubar árvores.',
    icon: svg('<rect x="4" y="10" width="24" height="12" rx="6" fill="#9c6a3a" stroke="#4a2f16"/><ellipse cx="25" cy="16" rx="4" ry="6" fill="#e0b57a" stroke="#7a522a"/><ellipse cx="25" cy="16" rx="1.6" ry="2.6" fill="none" stroke="#9c6a3a"/>'),
  },
  stone: {
    id: 'stone', name: 'Pedra', kind: 'resource', stack: 99,
    desc: 'Recurso obtido ao minerar rochas.',
    icon: svg('<path d="M6 22l3-10 8-5 8 4 3 10-7 5H11z" fill="#8d8f99" stroke="#44464e"/><path d="M11 13l5 3 7-3" fill="none" stroke="#b9bcc6"/>'),
  },
};

export interface Slot {
  id: ItemId;
  count: number;
}
