# PixelIsland Combat Lab

Protótipo 3D jogável em **Three.js + TypeScript** para desenvolver e testar a *sensação* de
movimentação e combate — inspirado no combate de aventura em 3ª pessoa estilo *Zelda: Breath of the Wild*
(lock-on, saltos laterais, mortal para trás, ataque giratório, aparo com escudo, esquiva perfeita com
rajada). Cenário e modelos são simples de propósito; o foco é o acabamento das interações:
peso, resposta imediata, impacto e clareza.

Roda no navegador de **desktop** (teclado + mouse) e de **celular** (controles de toque).

---

## Como rodar

Requisitos: Node.js 18+ (testado com Node 22).

```bash
npm install
npm run dev        # servidor de desenvolvimento (http://localhost:5173) — acessível na rede local
npm run build      # typecheck + build de produção em dist/
npm run preview    # serve o build (http://localhost:4173)
```

Para testar no celular: rode `npm run dev` e abra, no celular (mesma rede Wi-Fi), o endereço
"Network" que o Vite mostra no terminal. Use o aparelho na horizontal; o botão de início pede tela cheia.

**Online (GitHub Pages):** https://botopai50.github.io/PixelIsland_Combat/

- Com Pages em *GitHub Actions*: o workflow `.github/workflows/pages.yml` faz build e publica a cada push.
- Com Pages em *branch → /docs*: rode `npm run build:docs` e faça commit da pasta `docs/`.

O `dist/` é estático (caminhos relativos): pode ser publicado em qualquer hospedagem (GitHub Pages,
itch.io, Netlify…).

---

## Controles

### Teclado e mouse
| Tecla | Ação |
|---|---|
| W A S D | Andar (postura ereta) |
| Shift (segurar) | Correr (curvado para frente, gasta stamina) · **Z** / **Caps Lock** trava a corrida |
| Espaço | Pular — segurar = salto mais alto |
| Botão esquerdo / J | Atacar · **segurar** = ataque carregado · com arco: puxar e soltar |
| Botão direito / K | Defender · **no instante do golpe** = APARO · cancela o arco |
| C / Alt / L | Esquiva estilo BotW: ←/→ salto lateral · para trás ou parado = mortal para trás · para frente = salto curto |
| Q / botão do meio | Lock-on (travar no inimigo) · sem alvo: recentraliza a câmera |
| V | Alternar 1ª / 3ª pessoa |
| T | Trocar ombro da câmera |
| 1–6 / roda do mouse | Barra de acesso rápido |
| Tab / I | Inventário |
| G | Gerar inimigo |
| R | Restaurar arena (sem reiniciar) |
| P | Painel de ajustes |
| B | Comparar: juice ligado/desligado (atalho) |
| H | Ajuda |

### Toque (celular)
| Controle | Ação |
|---|---|
| Metade esquerda | Analógico dinâmico: andar |
| Metade direita | Arrastar para olhar/mirar |
| Atacar | Toque = golpe · segurar = carga · arco: segurar e soltar (arraste o próprio botão para mirar) |
| Defender | Segurar = bloquear · no tempo certo = aparo |
| Correr | Liga/desliga a corrida (curvado para frente) |
| Pular / Esquiva / Travar | Ações de movimento e lock-on |
| Barra rápida | Toque para equipar (toque longo abre o inventário) |
| Botões do topo | 1ª/3ª, ombro, itens, +inimigo, resetar, juice on/off, ajustes, ajuda |

A interface alterna sozinha entre modo toque e mouse conforme o dispositivo usado.

---

## O que testar na arena

- **Movimento**: aceleração/frenagem rápidas (sem patinar), inclinação nas curvas, degraus de
  0.2/0.35 m (sobe andando) e 0.6/0.95/1.3 m (precisa pular), rampa, plataformas com vão
  (tolerância de borda e buffer de salto), paredes (colisão e câmera).
- **Guardar armas (estilo BotW)**: fora de combate (2,5 s sem atacar/defender e sem inimigo a 9 m) a arma e o escudo vão para as costas e os braços balançam livres; qualquer ação de combate saca na hora.
- **Espada**: combo de 3 golpes (horizontal → diagonal ascendente → golpe final vertical);
  segure para o **Ataque Giratório**; golpe aéreo durante o salto.
- **Machado** (ferramenta, duas mãos, pés plantados): golpe de lenhador que para no tronco e é puxado de volta, repetido no ritmo; é a ferramenta da **árvore** (entalhe aprofunda a cada golpe, a
  árvore balança, solta lascas e folhas, tomba na direção do golpe e vira toras).
- **Picareta** (ferramenta, duas mãos): ergue acima da cabeça e desce até o chão curvando o tronco; é a ferramenta da **pedra** (rachaduras no ponto de contato,
  rachaduras estruturais em limiares, escurece, explode em fragmentos e poeira).
  Espada na pedra **ricocheteia** com faíscas.
- **Arco**: tensão progressiva (som + animação + retícula), força/queda variam com a puxada,
  cancelar com defesa ou esquiva (não gasta flecha). Flechas ficam cravadas por 12 s e podem ser
  **recolhidas** passando por cima. Acerto à distância: "ding", marcador na mira, clarão escalado pela
  distância. Flecha na cabeça atordoa.
- **Escudo**: bloqueio direcional (ângulo ajustável), **aparo** no instante certo (anel ciano,
  "TING", câmera lenta curta, inimigo desequilibrado — golpes nele causam crítico).
- **Esquiva perfeita**: esquive no último instante do golpe inimigo → câmera lenta → ataque para
  uma **rajada** de 6 golpes.
- **Inimigos**: telegrafam o golpe (brilho na clava + som), atacam um por vez, reagem na direção do
  golpe. A variante azul tem **escudo de metal**: golpes frontais ricocheteiam (clangor e faíscas);
  o ataque carregado quebra a defesa; flanqueie ou ataque pelas costas.
- **Boneco de treino**: capacete de metal (clangor ao acertar a cabeça), mostra último dano, combo e DPS.

---

## Painel de ajustes (P)

Todos os parâmetros têm efeito imediato e ficam salvos no navegador:

- **Movimento**: velocidade de andar e de correr, aceleração, desaceleração, controle no ar, giro, altura do salto,
  gravidade (subida/queda), corte do salto, tolerância de borda (*coyote time*), buffer de salto.
- **Esquiva e stamina**: distância, duração, janela de invulnerabilidade, recarga, janela da
  esquiva perfeita, rajada on/off, custos de stamina.
- **Combate**: dano, alcance (a arma cresce visualmente junto), velocidade dos golpes, recuperação,
  janela de cancelamento, buffer de ataque, tempo de carga, empurrão, assistência de mira.
- **Defesa e aparo**: janela de aparo, ângulo protegido, custo de bloqueio, dano e agressividade inimiga.
- **Feedback / "juice"**: hit stop (on/off e escala), tremor (on/off e escala), partículas
  (on/off e intensidade), rastro, flash no alvo, números de dano, recuo da arma, efeitos de tela.
- **Câmera**: FOV, sensibilidade, inverter Y, distância/ombro/altura, balanço da cabeça e da arma
  (on/off e escala), FOV dinâmico.
- **Áudio e debug**: som, volume, **câmera lenta** (1×/0.5×/0.25×/0.1×), **mostrar hitboxes**.
- **Presets**: "Juicy", "Cru (sem efeitos)", "Arcade rápido", "Pesado/realista" e o botão
  **"Juice: comparar (liga/desliga)"** para sentir a diferença na hora. "Copiar JSON" exporta os valores.

---

## Arquitetura

```
src/
  engine/                 ← sistemas reutilizáveis (NÃO conhecem a arena)
    core/                 Tuning, GameClock (hit stop/câmera lenta), Input (ações), Events, Context, math
    physics/              PhysicsWorld (caixas/rampas, raycast), CharacterMotor (degraus, rampas, aterrissagem)
    character/            PlayerController (lógica), PlayerView (3ª pessoa), HumanoidRig (modelo),
                          HumanoidAnimator (animação procedural), IK (dois ossos)
    camera/               CameraRig (1ª/3ª, colisão, ombro, lock-on), FirstPersonView (braços/armas)
    combat/               Attacks (golpes e trajetórias), CombatWorld (hurtboxes/consultas),
                          Projectiles (flechas), FeedbackDirector ("juice"), types (Damageable, eficácia)
    items/                Items, Inventory, Pickups (coleta), WeaponModels (modelos procedurais)
    enemies/              Enemy (IA, escudo de metal, aparo), EnemyDirector (spawn, fichas de ataque)
    world/                ChoppableTree, MineableRock, TrainingDummy
    vfx/                  Particles (instanciadas), ImpactFX (por material), CameraShake, Trail, DebugDraw
    audio/                SoundEngine (100% procedural, Web Audio)
    ui/                   HUD, InventoryPanel, TouchControls, TweakPanel
  arena/TestArena.ts      ← só cenário e posicionamento
  game/Game.ts            ← raiz de composição (único lugar que junta tudo)
```

### Princípios

1. **Uma única verdade para o golpe.** `Attacks.ts` define cada golpe como preparação → janela
   ativa → recuperação e uma trajetória em arco (`arc`, `roll`, `pitch`). A mesma função
   (`bladeSegmentWorld` / `swingDirLocal`) alimenta a detecção de acerto, o braço+arma da 3ª pessoa (via IK),
   o viewmodel da 1ª pessoa e o rastro. Por isso **o dano acontece exatamente quando a arma
   visualmente toca o alvo**, e as duas perspectivas têm as mesmas regras de alcance/dano/colisão.
2. **Varredura contínua**: a lâmina é amostrada a cada ~6° entre frames (golpes rápidos não
   "pulam" alvos) e cada alvo é atingido **uma vez por golpe** (`hitSet`).
3. **Lógica emite eventos, o FeedbackDirector faz o "juice".** Jogador, inimigos, flechas e objetos
   só emitem `hit`, `swing`, `land`, `pickup`… O `FeedbackDirector` traduz em hit stop proporcional
   à força, tremor direcional, partículas por material no ponto de contato, som com variação,
   números de dano e efeitos de tela — tudo controlado pelo `Tuning`.
4. **Tempo com camadas** (`GameClock`): `dt` do mundo (congela no hit stop, desacelera na esquiva
   perfeita), `playerDt` (congela no hit stop, mas não desacelera na rajada) e `realDt` (câmera, UI).
5. **Input por ações** (`Input`): teclado/mouse e toque escrevem ações; a lógica só lê ações.
6. **Buffers sem fila**: um único comando guardado (`attack`/`dodge`) aceito só perto do fim da
   ação atual e executado na primeira oportunidade válida; troca de item fica pendente até a ação
   terminar (sem pular recuperação nem duplicar golpes).

### Tabela de "peso" (valores padrão)

| Golpe | Preparação | Ativo | Recuperação | Dano | Força | Hit stop* |
|---|---|---|---|---|---|---|
| Espada 1/2 | 0.09/0.08 s | 0.09 s | 0.26/0.28 s | 12 | 0.28–0.32 | ~45 ms |
| Espada final | 0.16 s | 0.10 s | 0.42 s | 22 | 0.65 | ~85 ms |
| Ataque giratório | 0.05 s | 0.42 s | 0.36 s | 28 | 0.85 | ~120 ms |
| Machado | 0.30 s | 0.10 s | 0.40 s | 17 | 0.55 | ~80 ms |
| Machadada carregada | 0.07 s | 0.13 s | 0.60 s | 45 | 1.0 | ~150 ms (+60% no abate) |
| Picareta | 0.32 s | 0.10 s | 0.42 s | 14 | 0.55 | ~80 ms |
| Flecha | — | — | — | 6–24 | 0.25–0.6 | 20–40 ms + "ding" |

\* hit stop = `0.02 + força^1.3 × 0.13` s, reduzido com ferramenta errada, ampliado no abate.

---

## Integrando em outro projeto Three.js

Copie `src/engine/` (sem dependência da arena). Dependências: `three` (e `lil-gui` só se usar o painel).

### Mínimo: personagem jogável com câmera

```ts
import * as THREE from 'three';
import { defaultTuning } from './engine/core/Tuning';
import { GameClock } from './engine/core/GameClock';
import { Input } from './engine/core/Input';
import { Emitter } from './engine/core/Events';
import type { GameContext, GameEvents } from './engine/core/Context';
import { PhysicsWorld, makeBoxCollider } from './engine/physics/PhysicsWorld';
import { CombatWorld } from './engine/combat/CombatWorld';
import { SoundEngine } from './engine/audio/SoundEngine';
import { ImpactFX } from './engine/vfx/ImpactFX';
import { CameraShake } from './engine/vfx/CameraShake';
import { Inventory } from './engine/items/Inventory';
import { ProjectileSystem } from './engine/combat/Projectiles';
import { FeedbackDirector } from './engine/combat/FeedbackDirector';
import { PlayerController } from './engine/character/PlayerController';
import { PlayerView } from './engine/character/PlayerView';
import { CameraRig } from './engine/camera/CameraRig';
import { FirstPersonView } from './engine/camera/FirstPersonView';

const tuning = defaultTuning();
const scene = new THREE.Scene();
const input = new Input();
input.attachKeyboardMouse(renderer.domElement);
const fx = new ImpactFX(tuning);
scene.add(fx.group);
const ctx: GameContext = {
  tuning, input, scene, fx, events: new Emitter<GameEvents>(), clock: new GameClock(tuning),
  physics: new PhysicsWorld(), combat: new CombatWorld(), sound: new SoundEngine(tuning),
  shake: new CameraShake(tuning), threats: () => [],       // inimigos, se houver
};
// seu chão/paredes: colisores simples (ou adapte PhysicsWorld para Rapier/Cannon)
ctx.physics.add({ ...makeBoxCollider(0, 0, 50, 50, -1, 0, 0, 'grass'), mesh: groundMesh });

const inventory = new Inventory();
inventory.add('sword'); inventory.add('shield'); inventory.add('bow'); inventory.add('arrow', 20);
const cam = new CameraRig(ctx);
const player = new PlayerController(ctx, cam, inventory, new ProjectileSystem(ctx));
cam.player = player;
ctx.combat.add(player);
const view = new PlayerView(ctx, player);       // corpo + armas (3ª pessoa)
const fpv = new FirstPersonView(ctx, player);   // braços + armas (1ª pessoa)
new FeedbackDirector(ctx, cam.camera);          // "juice" (ScreenFX opcional: passe um HUD)
player.spawn(new THREE.Vector3(0, 0, 0));

// no loop:
input.update();
ctx.clock.tick(rawDt);
player.update(ctx.clock.playerDt);
ctx.fx.update(ctx.clock.dt, cam.camera);
ctx.shake.update(ctx.clock.realDt);
cam.update(ctx.clock.realDt, ctx.clock.playerDt);
fpv.visible = cam.blend > 0.5; view.visible = !fpv.visible;
view.update(ctx.clock.playerDt); fpv.update(ctx.clock.playerDt, cam.camera);
renderer.render(scene, cam.camera);
if (fpv.visible) { renderer.autoClear = false; renderer.clearDepth(); renderer.render(fpv.scene, cam.camera); renderer.autoClear = true; }
input.endFrame();
ctx.sound.unlock(); // dentro de um gesto do usuário (clique/toque)
```

### Peças avulsas

- **Qualquer coisa atingível**: implemente `Damageable` (`hurtboxes` em cápsulas, `receiveHit`) e
  registre em `ctx.combat.add(obj)`. Use `toolEffectiveness(tool, material)` para regras de ferramenta.
- **Novos golpes/armas**: adicione entradas em `ATTACKS`/`WEAPONS` (`Attacks.ts`) — a trajetória,
  a animação, o viewmodel, o rastro e a detecção de acerto se ajustam sozinhos.
- **Inimigos**: `EnemyDirector.spawn(pos, shielded)`; o alvo precisa de `position` + `Damageable`.
  Passe `threats: () => director.enemies` no contexto para habilitar a esquiva perfeita.
- **Objetos coletáveis/destrutíveis**: `ChoppableTree`, `MineableRock`, `TrainingDummy` e
  `PickupSystem` recebem apenas `GameContext` (+ `PickupSystem`) e uma posição.
- **Modelos**: `HumanoidRig` (estilos `HERO_STYLE`/`GOBLIN_STYLE` ou o seu) + `HumanoidAnimator`
  (animações procedurais em camadas, reaproveitáveis em qualquer rig com os mesmos nomes de juntas)
  e `createWeaponModel(id)`. O painel tem **"Exportar modelos (.glb)"** para levar as malhas a um editor.
- **Áudio**: `SoundEngine.play(nome, { pos, intensity, variant })` e `loop('bowDraw' | 'charge')`.
- **Tudo ajustável**: o objeto `Tuning` é lido a cada frame — conecte-o ao seu próprio menu.

---

## Recursos utilizados

- **Código**: TypeScript, [Three.js](https://threejs.org) (MIT), [lil-gui](https://lil-gui.georgealways.com) (MIT), Vite.
- **Modelos**: 100% procedurais (primitivas do Three.js) — personagem, inimigos, armas, árvore,
  pedra, boneco, cenário. Nenhum arquivo externo.
- **Animações**: procedurais (`HumanoidAnimator` + IK de dois ossos), guiadas pela lógica.
- **Sons**: 100% sintetizados em tempo real com Web Audio (`SoundEngine`), com variação de
  afinação/timbre a cada disparo. Nenhum arquivo de áudio.
- **Texturas**: geradas em canvas (clarões, anéis, placas).

Fora de escopo por decisão do protótipo: missões, crafting, progressão, mundo aberto.
