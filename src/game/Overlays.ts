/** Telas de início e ajuda (textos dos controles). */
export const CONTROLS_DESKTOP: [string, string][] = [
  ['W A S D', 'Andar'],
  ['Shift', 'Correr (segure) · Z / Caps Lock trava a corrida'],
  ['Espaço', 'Pular (segure = mais alto)'],
  ['Botão esq. / J', 'Atacar · segure = ataque carregado · arco: puxar/soltar'],
  ['Botão dir. / K', 'Defender (no tempo certo = APARO) · cancela o arco'],
  ['C / Alt / L', 'Esquiva: ←/→ salto lateral · parado/trás = mortal para trás'],
  ['Q / botão do meio', 'Travar mira (lock-on) / recentralizar câmera'],
  ['V', 'Alternar 1ª / 3ª pessoa'],
  ['T', 'Trocar ombro da câmera'],
  ['1–6 / roda', 'Barra rápida (equipar)'],
  ['Tab / I', 'Inventário'],
  ['G', 'Gerar inimigo'],
  ['R', 'Restaurar arena'],
  ['P', 'Painel de ajustes'],
  ['B', 'Comparar: juice ligado/desligado'],
  ['H', 'Ajuda'],
];

export const CONTROLS_TOUCH: [string, string][] = [
  ['Lado esquerdo', 'Analógico: andar'],
  ['Lado direito', 'Arrastar: olhar/mirar'],
  ['Atacar', 'Toque = golpe · segure = carga · arco: segure e solte (arraste o botão para mirar)'],
  ['Defender', 'Segure para bloquear; toque no tempo certo = aparo'],
  ['Esquiva', 'Analógico para o lado = salto lateral · solto = mortal para trás'],
  ['Correr', 'Liga/desliga a corrida'],
  ['Pular', 'Salto (segure = mais alto)'],
  ['Travar', 'Lock-on no inimigo mais próximo'],
  ['Barra rápida', 'Toque para equipar'],
  ['Topo', '1ª/3ª, ombro, itens, inimigo, reset, juice on/off, ajustes'],
];

const table = (rows: [string, string][]) =>
  `<table>${rows.map(([k, v]) => `<tr><td><kbd>${k}</kbd></td><td>${v}</td></tr>`).join('')}</table>`;

export function createStartOverlay(isTouch: boolean, onStart: () => void): HTMLDivElement {
  const d = document.createElement('div');
  d.className = 'start';
  d.innerHTML = `
    <div class="start-card">
      <h1>PixelIsland <span>Combat Lab</span></h1>
      <p class="sub">Protótipo de movimentação e combate "juicy" — Three.js</p>
      <div class="cols">
        <div><h3>${isTouch ? 'Toque' : 'Teclado e mouse'}</h3>${table(isTouch ? CONTROLS_TOUCH : CONTROLS_DESKTOP)}</div>
        <div class="tips"><h3>Experimente</h3><ul>
          <li>Combo de 3 golpes com a espada; segure para o <b>Ataque Giratório</b>.</li>
          <li>Derrube a <b>árvore</b> com o machado e quebre a <b>pedra</b> com a picareta.</li>
          <li>Defenda no instante do golpe inimigo para <b>APARAR</b>.</li>
          <li>Esquive no último instante: <b>esquiva perfeita</b> + rajada.</li>
          <li>Painel <b>Ajustes</b>: compare "Juicy" × "Cru".</li>
        </ul></div>
      </div>
      <p class="compact">Analógico à esquerda · arraste à direita para olhar · botões de ação à direita · <b>?</b> mostra todos os controles</p>
      <button class="go">${isTouch ? 'Tocar para jogar' : 'Clique para jogar'}</button>
      ${isTouch ? '<p class="hint">Dica: gire o celular (paisagem) e use tela cheia.</p>' : ''}
    </div>`;
  document.body.appendChild(d);
  d.querySelector('.go')!.addEventListener('click', () => onStart());
  return d;
}

export function createHelpOverlay(): { el: HTMLDivElement; toggle: () => boolean; close: () => void; isOpen: () => boolean } {
  const d = document.createElement('div');
  d.className = 'modal help';
  d.innerHTML = `<div class="panel"><header><h2>Controles</h2><button class="close">✕</button></header>
    <div class="cols"><div><h3>Teclado e mouse</h3>${table(CONTROLS_DESKTOP)}</div><div><h3>Toque</h3>${table(CONTROLS_TOUCH)}</div></div></div>`;
  document.body.appendChild(d);
  let open = false;
  const api = {
    el: d,
    isOpen: () => open,
    close: () => {
      open = false;
      d.classList.remove('open');
    },
    toggle: () => {
      open = !open;
      d.classList.toggle('open', open);
      return open;
    },
  };
  d.querySelector('.close')!.addEventListener('click', () => api.close());
  d.addEventListener('pointerdown', (e) => e.target === d && api.close());
  return api;
}
