import * as THREE from 'three';
import { weaponBasis } from '../character/PlayerView';
import { clamp01, easeOutCubic, easeInOutSine } from '../core/math';

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
interface Style {
  W: Key;
  M: Key;
  F: Key;
  /** Segura a pose final por esta fração da recuperação (clareza). */
  hold: number;
  twoHanded?: boolean;
}

// Poses verificadas por projeção na câmera (FOV 70, 16:9): mão e lâmina ficam
// dentro do quadro em W, M e F — nada de preparação "fora da tela".
const S: Record<string, Style> = {
  // da direita para a esquerda: ergue à direita → cruza deitada → termina embaixo à esquerda
  slashRL: {
    W: { p: [0.36, -0.1, -0.5], d: [0.25, 0.75, -0.6] },
    M: { p: [0.06, -0.16, -0.52], d: [-0.72, 0.12, -0.68] },
    F: { p: [-0.24, -0.18, -0.5], d: [-0.72, -0.1, -0.68] },
    hold: 0.3,
  },
  // subindo da esquerda para a direita
  slashLR: {
    W: { p: [-0.22, -0.18, -0.5], d: [-0.75, -0.3, -0.58] },
    M: { p: [0.02, -0.12, -0.52], d: [0.72, 0.28, -0.64] },
    F: { p: [0.3, 0.0, -0.5], d: [0.45, 0.65, -0.6] },
    hold: 0.3,
  },
  // de cima para baixo
  overhead: {
    W: { p: [0.18, 0.12, -0.45], d: [0.15, 0.85, -0.5] },
    M: { p: [0.1, -0.06, -0.52], d: [0.2, 0.35, -0.92] },
    F: { p: [0.06, -0.2, -0.52], d: [0.05, -0.12, -0.99] },
    hold: 0.35,
  },
  // giratório: arco amplo da direita para a esquerda
  spin: {
    W: { p: [0.4, -0.18, -0.45], d: [0.6, 0.2, -0.77] },
    M: { p: [0.0, -0.2, -0.55], d: [-0.78, 0.05, -0.62] },
    F: { p: [-0.3, -0.18, -0.48], d: [-0.75, 0.05, -0.66] },
    hold: 0.15,
  },
  // machado: ergue à direita, corta de lado e PARA no alvo
  chop: {
    W: { p: [0.34, -0.2, -0.42], d: [0.45, 0.72, -0.53] },
    M: { p: [0.1, -0.22, -0.48], d: [-0.55, 0.22, -0.8] },
    F: { p: [-0.06, -0.25, -0.54], d: [-0.75, 0.12, -0.65] },
    hold: 0.45,
    twoHanded: true,
  },
  // picareta: ergue acima e desce até o chão à frente
  mine: {
    W: { p: [0.12, 0.05, -0.42], d: [0.1, 0.8, -0.6] },
    M: { p: [0.08, -0.08, -0.5], d: [0, 0.35, -0.94] },
    F: { p: [0.05, -0.2, -0.54], d: [0, -0.12, -0.99] },
    hold: 0.45,
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
  axe1: 'chop', axeCharged: 'chop', pick1: 'mine', pickCharged: 'mine',
};

export function viewmodelStyle(attackId: string): Style {
  return S[BY_ATTACK[attackId] ?? 'slashRL'];
}

const qa = new THREE.Quaternion(), qb = new THREE.Quaternion();
const va = new THREE.Vector3(), vb = new THREE.Vector3(), vc = new THREE.Vector3();

function keyQuat(k: Key, out: THREE.Quaternion) {
  return weaponBasis(va.set(...k.d).normalize(), vb.set(...(k.e as V3)).normalize(), out);
}
function blend(a: { p: THREE.Vector3; q: THREE.Quaternion }, bp: THREE.Vector3, bq: THREE.Quaternion, t: number) {
  a.p.lerp(bp, t);
  a.q.slerp(bq, t);
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
  const W = style.W, M = style.M, F = style.F;
  if (phase === 'windup' || phase === 'charge') {
    // antecipação: sai do descanso e recua para o canto (desacelera no fim = "carrega")
    const t = phase === 'charge' ? 1 : easeOutCubic(u);
    outP.copy(restP);
    outQ.copy(restQ);
    blend(cur, vc.set(...W.p), keyQuat(W, qa), t);
    return;
  }
  if (phase === 'active') {
    // golpe rápido: W → M → F (arco em dois trechos)
    const t = clamp01(u);
    if (t < 0.5) {
      const k = easeInOutSine(t / 0.5);
      outP.set(...W.p);
      keyQuat(W, outQ);
      blend(cur, vc.set(...M.p), keyQuat(M, qb), k);
    } else {
      const k = easeOutCubic((t - 0.5) / 0.5);
      outP.set(...M.p);
      keyQuat(M, outQ);
      blend(cur, vc.set(...F.p), keyQuat(F, qb), k);
    }
    return;
  }
  // recuperação: segura a pose final (leitura) e volta suave ao descanso
  outP.set(...F.p);
  keyQuat(F, outQ);
  const t = clamp01((u - style.hold) / (1 - style.hold));
  if (t > 0) blend(cur, restP, restQ, easeInOutSine(t));
}
