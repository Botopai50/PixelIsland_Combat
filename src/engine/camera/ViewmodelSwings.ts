import * as THREE from 'three';
import { weaponBasis } from '../character/PlayerView';
import { clamp01, easeInOutSine } from '../core/math';

/**
 * Golpes da 1ª pessoa desenhados para LEITURA na câmera (espaço da câmera:
 * x = direita, y = cima, -z = frente). Cada estilo tem poses-chave:
 *   W = fim da preparação (antecipação, visível no canto da tela)
 *   M = meio do golpe (lâmina cruzando o centro, deitada: comprimento visível)
 *   F = fim do golpe (continuação), segurado um instante antes de voltar
 * O TEMPO vem da lógica (preparação / janela ativa / recuperação), então a
 * lâmina cruza o centro exatamente durante a janela de dano.
 */
type V3 = [number, number, number];
type Key = { p: V3; d: V3; e?: V3 };
/** Inclinação da câmera: [pitch, yaw, roll] em radianos. */
type Lean = [number, number, number];
interface Style {
  W: Key;
  M: Key;
  F: Key;
  /** Câmera acompanha o golpe: pose na preparação (W) e no fim (F). */
  camW: Lean;
  camF: Lean;
  /** Fração da recuperação usada para terminar o arco (continuação visível). */
  follow?: number;
  /** Segura a pose final até esta fração da recuperação. */
  hold: number;
  twoHanded?: boolean;
}

// Golpes EXAGERADOS: a preparação e a continuação podem sair do quadro por
// alguns frames — o que importa é o arco grande passando pelo centro.
const S: Record<string, Style> = {
  // da direita para a esquerda, LATERAL: lâmina deitada à direita → varre na horizontal → sai à esquerda
  slashRL: {
    W: { p: [0.44, -0.06, -0.4], d: [0.92, 0.18, 0.2] },
    M: { p: [0.02, -0.1, -0.64], d: [-0.86, 0.06, -0.5] },
    F: { p: [-0.46, -0.14, -0.4], d: [-0.92, 0.0, 0.25] },
    camW: [0.01, -0.1, -0.03], camF: [-0.01, 0.13, 0.04],
    follow: 0.4, hold: 0.55,
  },
  // subindo da esquerda para a direita
  slashLR: {
    W: { p: [-0.4, -0.24, -0.4], d: [-0.75, -0.45, -0.2] },
    M: { p: [0.02, -0.06, -0.64], d: [0.82, 0.3, -0.5] },
    F: { p: [0.44, 0.12, -0.4], d: [0.45, 0.85, -0.1] },
    camW: [-0.04, 0.08, 0.07], camF: [0.05, -0.1, -0.1],
    follow: 0.4, hold: 0.55,
  },
  // de cima para baixo: lâmina atrás da cabeça → racha o centro → crava embaixo
  overhead: {
    W: { p: [0.2, 0.17, -0.38], d: [0.1, 0.75, 0.55] },
    M: { p: [0.08, 0.02, -0.62], d: [0.05, 0.6, -0.8] },
    F: { p: [0.05, -0.34, -0.48], d: [0, -0.6, -0.8] },
    camW: [0.1, -0.02, -0.03], camF: [-0.16, 0, 0.02],
    follow: 0.35, hold: 0.55,
  },
  // giratório: arco de quase meia volta
  spin: {
    W: { p: [0.46, -0.12, -0.34], d: [0.9, 0.1, 0.25] },
    M: { p: [0, -0.18, -0.68], d: [-0.86, 0.05, -0.5] },
    F: { p: [-0.48, -0.18, -0.36], d: [-0.85, 0, 0.35] },
    camW: [0, -0.14, -0.06], camF: [0, 0.22, 0.08],
    follow: 0.2, hold: 0.3,
  },
  // machado: golpe LATERAL — lâmina deitada atrás à direita, varre na horizontal e PARA cravada no alvo
  chop: {
    W: { p: [0.42, -0.12, -0.38], d: [0.92, 0.2, 0.2] },
    M: { p: [0.12, -0.17, -0.56], d: [-0.6, 0.12, -0.8] },
    F: { p: [-0.06, -0.19, -0.58], d: [-0.86, 0.06, -0.5] },
    camW: [0, -0.1, -0.03], camF: [0, 0.07, 0.03],
    hold: 0.4,
    twoHanded: true,
  },
  // picareta: acima e atrás da cabeça → desce com tudo até o chão à frente
  mine: {
    W: { p: [0.14, 0.17, -0.38], d: [0.05, 0.75, 0.55] },
    M: { p: [0.08, -0.02, -0.58], d: [0, 0.5, -0.86] },
    F: { p: [0.05, -0.28, -0.55], d: [0, -0.4, -0.92] },
    camW: [0.12, 0, 0], camF: [-0.14, 0, 0],
    hold: 0.4,
    twoHanded: true,
  },
};

// gume = direção do movimento entre as poses (calculado uma vez)
{
  const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const len = (a: V3) => Math.hypot(a[0], a[1], a[2]);
  for (const st of Object.values(S)) {
    st.W.e = sub(st.M.d, st.W.d);
    st.M.e = sub(st.F.d, st.W.d);
    const fe = sub(st.F.d, st.M.d);
    st.F.e = len(fe) > 0.15 ? fe : st.M.e;
  }
}

const BY_ATTACK: Record<string, string> = {
  sword1: 'slashRL', flurryA: 'slashRL', sword2: 'slashLR', flurryB: 'slashLR',
  sword3: 'overhead', swordAir: 'overhead', swordSpin: 'spin',
  axe1: 'chop', axeCharged: 'mine', pick1: 'mine', pickCharged: 'mine',
};

export function viewmodelStyle(attackId: string): Style {
  return S[BY_ATTACK[attackId] ?? 'slashRL'];
}

const qb = new THREE.Quaternion();
const va = new THREE.Vector3(), vb = new THREE.Vector3(), vc = new THREE.Vector3();

function keyQuat(k: Key, out: THREE.Quaternion) {
  return weaponBasis(va.set(...k.d).normalize(), vb.set(...(k.e as V3)).normalize(), out);
}
function blend(a: { p: THREE.Vector3; q: THREE.Quaternion }, bp: THREE.Vector3, bq: THREE.Quaternion, t: number) {
  a.p.lerp(bp, t);
  a.q.slerp(bq, t);
}

/** Aceleração forte (smear) e passagem além do ponto com retorno. */
const easeInQuad = (t: number) => t * t;
const easeOutBack = (t: number, s = 1.9) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);

/**
 * Onde o golpe está: 0 = descanso, 1 = W, 2 = M, 3 = F (com overshoot).
 * Mesmo mapa para a arma e para a câmera.
 */
function track(style: Style, phase: string, u: number): { seg: 0 | 1 | 2 | 3; k: number } {
  if (phase === 'charge') return { seg: 0, k: 1 };
  const t = clamp01(u);
  const fol = style.follow ?? 0;
  if (phase === 'windup') {
    // chega ao W em 65% da preparação e já começa a andar devagar para o
    // centro: o olho acompanha o arco desde o início, sem teleporte
    if (t < 0.65) return { seg: 0, k: easeOutBack(t / 0.65, 1.3) };
    return { seg: 1, k: 0.22 * easeInQuad((t - 0.65) / 0.35) };
  }
  if (phase === 'active') {
    // cruza o centro no meio da janela de dano (momento do acerto intacto)
    if (t < 0.5) return { seg: 1, k: 0.22 + 0.78 * easeInOutSine(t / 0.5) };
    const k = (t - 0.5) / 0.5;
    return { seg: 2, k: fol > 0 ? 0.4 * k : easeOutBack(k, 1.2) };
  }
  // continuação desacelerando dentro da recuperação: é aqui que o golpe "lê"
  if (fol > 0 && t < fol) return { seg: 2, k: 0.4 + 0.6 * easeOutBack(t / fol, 1.1) };
  const r = clamp01((t - style.hold) / (1 - style.hold));
  return { seg: 3, k: easeInOutSine(r) };
}

/**
 * Pose da arma no viewmodel.
 * @param phase fase lógica do golpe; u = progresso 0..1 dentro da fase
 * @param rest pose de descanso (posição/orientação em espaço de câmera)
 */
export function viewmodelSwingPose(
  style: Style, phase: 'windup' | 'active' | 'recovery' | 'done' | 'charge', u: number,
  restP: THREE.Vector3, restQ: THREE.Quaternion,
  outP: THREE.Vector3, outQ: THREE.Quaternion,
) {
  const cur = { p: outP, q: outQ };
  const { seg, k } = track(style, phase, u);
  const [A, B] = seg === 0 ? [null, style.W] : seg === 1 ? [style.W, style.M] : seg === 2 ? [style.M, style.F] : [style.F, null];
  if (A && B) {
    // entre poses-chave: interpola a DIREÇÃO da lâmina (arco plano, como um
    // golpe de verdade) em vez do caminho mais curto da rotação, que em arcos
    // grandes passava por cima da cabeça
    outP.set(...A.p).lerp(vc.set(...B.p), k);
    va.set(...A.d).normalize().lerp(vb.set(...B.d).normalize(), k);
    vc.set(...(A.e as V3)).normalize().lerp(vb.set(...(B.e as V3)).normalize(), k);
    weaponBasis(va, vc, outQ);
    return;
  }
  if (A) { outP.set(...A.p); keyQuat(A, outQ); } else { outP.copy(restP); outQ.copy(restQ); }
  if (B) blend(cur, vc.set(...B.p), keyQuat(B, qb), k);
  else if (k > 0) blend(cur, restP, restQ, k);
}

/** Inclinação da câmera acompanhando o golpe (1ª pessoa). */
export function viewmodelCamLean(style: Style, phase: string, u: number, out: THREE.Vector3) {
  const { seg, k } = track(style, phase, u);
  const W = style.camW, F = style.camF;
  const mid: Lean = [(W[0] + F[0]) * 0.3, (W[1] + F[1]) * 0.3, (W[2] + F[2]) * 0.3];
  const [a, b]: [Lean, Lean] = seg === 0 ? [[0, 0, 0], W] : seg === 1 ? [W, mid] : seg === 2 ? [mid, F] : [F, [0, 0, 0]];
  return out.set(a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k);
}
