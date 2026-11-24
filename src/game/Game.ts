import * as THREE from 'three';
import { initAnimalSpriteWorkers } from '../engine/enemies/AnimalSpriteWorkers';
import { startAnimalSpriteStreaming } from '../engine/enemies/AnimalSpriteCache';
import { loadTuning } from '../engine/core/Tuning';
import { GameClock } from '../engine/core/GameClock';
import { Input } from '../engine/core/Input';
import { Emitter } from '../engine/core/Events';
import type { GameContext, GameEvents } from '../engine/core/Context';
import { PhysicsWorld } from '../engine/physics/PhysicsWorld';
import { CombatWorld } from '../engine/combat/CombatWorld';
import { SoundEngine } from '../engine/audio/SoundEngine';
import { ImpactFX } from '../engine/vfx/ImpactFX';
import { CameraShake } from '../engine/vfx/CameraShake';
import { DebugDraw } from '../engine/vfx/DebugDraw';
import { Inventory } from '../engine/items/Inventory';
import { PickupSystem } from '../engine/items/Pickups';
import { ProjectileSystem } from '../engine/combat/Projectiles';
import { FeedbackDirector } from '../engine/combat/FeedbackDirector';
import { PlayerController } from '../engine/character/PlayerController';
import { PlayerView } from '../engine/character/PlayerView';
import { CameraRig } from '../engine/camera/CameraRig';
import { FirstPersonView } from '../engine/camera/FirstPersonView';
import { EnemyDirector } from '../engine/enemies/EnemyDirector';
import { CarnivorousPlant } from '../engine/enemies/CarnivorousPlant';
import { BrambleMaw } from '../engine/enemies/BrambleMaw';
import { ThornUrsa } from '../engine/enemies/ThornUrsa';
import { AntlerWarden } from '../engine/enemies/AntlerWarden';
import { Traveler } from '../engine/npc/Traveler';
import { Boar } from '../engine/enemies/Boar';
import { beginBakeFrame, Chicken, Fish, Rabbit, type AnimalEntity, type FishSpecies } from '../engine/enemies/Animals';
import { Bear, Deer, Fox, Frog, Turtle, Wolf } from '../engine/enemies/MoreAnimals';
import { Badger, Owl, Squirrel } from '../engine/enemies/ForestAnimals';
import { Duck, Goat, Snake } from '../engine/enemies/WildAnimals';
import { Hedgehog, Pig, Sheep } from '../engine/enemies/MeadowAnimals';
import { Crab, Eagle, Panther } from '../engine/enemies/ExoticAnimals';
import { PillBug } from '../engine/enemies/PillBug';
import { Crow } from '../engine/enemies/Crow';
import { Beetle } from '../engine/enemies/Beetle';
import { Butterfly } from '../engine/enemies/Butterfly';
import { Bee } from '../engine/enemies/Bee';
import { Dragonfly } from '../engine/enemies/Dragonfly';
import { RedPanda } from '../engine/enemies/RedPanda';
import { GiantPanda } from '../engine/enemies/GiantPanda';
import { PolarBear } from '../engine/enemies/PolarBear';
import { SpectacledBear } from '../engine/enemies/SpectacledBear';
import { Cheetah } from '../engine/enemies/Cheetah';
import { Jaguar } from '../engine/enemies/Jaguar';
import { TasmanianDevil } from '../engine/enemies/TasmanianDevil';
import { Weasel } from '../engine/enemies/Weasel';
import { Otter } from '../engine/enemies/Otter';
import { Flamingo } from '../engine/enemies/Flamingo';
import { Hippo } from '../engine/enemies/Hippo';
import { Elephant } from '../engine/enemies/Elephant';
import { Lion } from '../engine/enemies/Lion';
import { Tiger } from '../engine/enemies/Tiger';
import { KingCrab } from '../engine/enemies/KingCrab';
import { Octopus } from '../engine/enemies/Octopus';
import { Squid } from '../engine/enemies/Squid';
import { Lobster } from '../engine/enemies/Lobster';
import { Dolphin } from '../engine/enemies/Dolphin';
import { PinkDolphin } from '../engine/enemies/PinkDolphin';
import { Horse } from '../engine/enemies/Horse';
import { Donkey } from '../engine/enemies/Donkey';
import { Baboon } from '../engine/enemies/Baboon';
import { Gorilla } from '../engine/enemies/Gorilla';
import { GoldenLionTamarin } from '../engine/enemies/GoldenLionTamarin';
import { Chimpanzee } from '../engine/enemies/Chimpanzee';
import { Orangutan } from '../engine/enemies/Orangutan';
import { Vulture } from '../engine/enemies/Vulture';
import { Anteater } from '../engine/enemies/Anteater';
import { MaryRiverTurtle } from '../engine/enemies/MaryRiverTurtle';
import { Hyena } from '../engine/enemies/Hyena';
import { Buffalo } from '../engine/enemies/Buffalo';
import { Bison } from '../engine/enemies/Bison';
import { Moose } from '../engine/enemies/Moose';
import { Toucan } from '../engine/enemies/Toucan';
import { Pigeon } from '../engine/enemies/Pigeon';
import { Parrot } from '../engine/enemies/Parrot';
import { Pelican } from '../engine/enemies/Pelican';
import { Penguin } from '../engine/enemies/Penguin';
import { Ostrich } from '../engine/enemies/Ostrich';
import { Rhea } from '../engine/enemies/Rhea';
import { Emu } from '../engine/enemies/Emu';
import { Alligator } from '../engine/enemies/Alligator';
import { Crocodile } from '../engine/enemies/Crocodile';
import { Gharial } from '../engine/enemies/Gharial';
import { KomodoDragon } from '../engine/enemies/KomodoDragon';
import { Axolotl } from '../engine/enemies/Axolotl';
import { GreenLizard } from '../engine/enemies/GreenLizard';
import { Chameleon } from '../engine/enemies/Chameleon';
import { Swordfish } from '../engine/enemies/Swordfish';
import { Stingray } from '../engine/enemies/Stingray';
import { Narwhal } from '../engine/enemies/Narwhal';
import { Scorpion } from '../engine/enemies/Scorpion';
import { BlackWidow, GoliathSpider, Tarantula, TrapdoorSpider, WanderingSpider } from '../engine/enemies/ArachnidsPack';
import { DungBeetle, HerculesBeetle, PrayingMantis, TarantulaHawk, Wasp } from '../engine/enemies/InsectsPackA';
import { Ant, Caterpillar, Earthworm, Firefly, Fly, Grasshopper, Ladybug, Moth } from '../engine/enemies/InsectsPackB';
import { Armadillo, Giraffe, Kiwi, Raccoon, ThreeBandedArmadillo, Zebra } from '../engine/enemies/SavannaPack';
import { DumboOctopus, Jellyfish, MantisShrimp, PistolShrimp, VampireSquid } from '../engine/enemies/DeepSeaPack';
import { HUD } from '../engine/ui/HUD';
import { InventoryPanel } from '../engine/ui/InventoryPanel';
import { SpriteInspector } from '../engine/ui/SpriteInspector';
import { TouchControls } from '../engine/ui/TouchControls';
import { TweakPanel } from '../engine/ui/TweakPanel';
import { bladeSegmentWorld } from '../engine/combat/Attacks';
import { TestArena } from '../arena/TestArena';
import { createHelpOverlay, createStartOverlay } from './Overlays';
import { ACTOR_SAMPLES_PER_CELL, PixelActorRenderer } from './PixelActorRenderer';
import { exportModelsGLB } from './ExportModels';
import { RigViewer } from '../engine/debug/RigViewer';
import { rand } from '../engine/core/math';

/**
 * Raiz de composição: cria os sistemas reutilizáveis, liga-os por eventos e
 * monta a arena de testes. É o ÚNICO lugar que conhece a arena.
 */
export class Game {
  readonly renderer: THREE.WebGLRenderer;
  readonly ctx: GameContext;
  private camRig: CameraRig;
  private player: PlayerController;
  private view: PlayerView;
  private fpv: FirstPersonView;
  private enemies: EnemyDirector;
  private monsters: (CarnivorousPlant | BrambleMaw | ThornUrsa | AntlerWarden)[] = [];
  private readonly traveler: Traveler;
  private readonly bossPanel = document.createElement('section');
  private readonly bossName = document.createElement('strong');
  private readonly bossHealth = document.createElement('progress');
  private readonly bossPhase = document.createElement('span');
  private boars: Boar[] = [];
  private animals: AnimalEntity[] = [];
  private arena: TestArena;
  private pickups: PickupSystem;
  private projectiles: ProjectileSystem;
  private inventory: Inventory;
  private hud: HUD;
  private invPanel: InventoryPanel;
  private spriteInspector: SpriteInspector;
  private tweak: TweakPanel;
  private touch: TouchControls;
  private rigViewer: RigViewer;
  private help: ReturnType<typeof createHelpOverlay>;
  private debug = new DebugDraw();
  private started = false;
  private paused = false;
  private last = performance.now();
  private isTouch: boolean;
  private readonly actorRenderer: PixelActorRenderer;
  private camRightTmp = new THREE.Vector3();
  private bladesTmp: { base: THREE.Vector3; tip: THREE.Vector3 }[] = [];
  private animalBakeCursor = 0;
  private perfAcc = { frames: 0, dt: 0, sim: 0, anim: 0, ren: 0, maxFrame: 0 };

  constructor(container: HTMLElement) {
    this.isTouch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
    // 1 pixel do framebuffer = 1 pixel CSS: a grade dos sprites não é reescalada em frações.
    renderer.setPixelRatio(1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);
    this.renderer = renderer;

    const tuning = loadTuning();
    const scene = new THREE.Scene();
    const input = new Input();
    initAnimalSpriteWorkers();
    input.attachKeyboardMouse(renderer.domElement);
    const events = new Emitter<GameEvents>();
    const fx = new ImpactFX(tuning);
    scene.add(fx.group);
    scene.add(this.debug.lines);
    this.ctx = {
      tuning, input, events, scene, fx,
      clock: new GameClock(tuning),
      physics: new PhysicsWorld(),
      combat: new CombatWorld(),
      sound: new SoundEngine(tuning),
      shake: new CameraShake(tuning),
      threats: () => this.enemies.enemies,
    };
    const ctx = this.ctx;

    // inventário inicial + barra rápida
    this.inventory = new Inventory(20, 6);
    for (const id of ['sword', 'axe', 'pickaxe', 'bow', 'shield'] as const) this.inventory.add(id, 1);
    this.inventory.add('arrow', 20);
    ['sword', 'axe', 'pickaxe', 'bow', 'shield', 'arrow'].forEach((id, i) => this.inventory.setHotbar(i, id as never));

    this.camRig = new CameraRig(ctx);
    this.projectiles = new ProjectileSystem(ctx);
    this.pickups = new PickupSystem(ctx, this.inventory);
    this.player = new PlayerController(ctx, this.camRig, this.inventory, this.projectiles);
    this.camRig.player = this.player;
    ctx.combat.add(this.player);
    this.view = new PlayerView(ctx, this.player, ACTOR_SAMPLES_PER_CELL);
    this.rigViewer = new RigViewer(ctx.scene, this.view.rig);
    this.fpv = new FirstPersonView(ctx, this.player);
    this.enemies = new EnemyDirector(ctx);
    this.arena = new TestArena(ctx, this.pickups);
    this.actorRenderer = new PixelActorRenderer(renderer, scene);
    this.player.spawn(this.arena.playerStart, 0);
    this.camRig.yaw = 0;
    const travelerStart = this.arena.playerStart.clone().add(new THREE.Vector3(1.5, 0, 2.35));
    this.traveler = new Traveler(ctx, container, travelerStart, this.arena.playerStart);
    this.bossPanel.className = 'boss-health';
    this.bossPanel.hidden = true;
    this.bossPanel.append(this.bossName, this.bossPhase, this.bossHealth);
    container.append(this.bossPanel);

    // UI
    this.hud = new HUD(ctx, this.inventory);
    input.onPointerLockError = () => {
      const hint = document.createElement('div');
      hint.className = 'free-mouse-hint';
      hint.textContent = 'Mouse livre: arraste para olhar · clique para atacar · J segura o ataque · botão direito defende';
      document.body.appendChild(hint);
      this.hud.toast('Mouse ativado nesta aba! Arraste no cenário para mover a câmera.', 'info');
    };
    new FeedbackDirector(ctx, this.camRig.camera, this.hud);
    this.hud.onHotbarClick = (i) => {
      this.inventory.select(i);
      this.player.requestEquip(this.inventory.hotbar[i]);
      ctx.sound.play('uiClick');
    };
    this.hud.onHotbarLongPress = () => this.toggleInventory();
    this.invPanel = new InventoryPanel(this.inventory);
    this.invPanel.getEquipped = () => ({ main: this.player.mainHand, off: this.player.offHand });
    this.invPanel.onEquip = (id) => this.player.requestEquip(id);
    this.invPanel.onClose = () => this.setPaused(false);
    this.spriteInspector = new SpriteInspector();
    this.spriteInspector.onClose = () => this.setPaused(false);
    this.help = createHelpOverlay();
    this.touch = new TouchControls(input, renderer.domElement);
    this.touch.setActive(this.isTouch);
    this.tweak = new TweakPanel(tuning, {
      'Gerar inimigo': () => this.spawnEnemy(),
      'Gerar planta carnívora': () => this.spawnPlant(),
      'Gerar Flor-de-Espinhos': () => this.spawnBrambleMaw(),
      'Gerar Urso de Espinhos': () => this.spawnThornUrsa(),
      'Gerar Guardião Galhudo': () => this.spawnAntlerWarden(),
      'Gerar javali': () => this.spawnBoar(),
      'Gerar peixe': () => this.spawnFish(),
      'Gerar coelho': () => this.spawnRabbit(),
      'Gerar galinha': () => this.spawnChicken(),
      'Gerar lobo': () => this.spawnWildlife('wolf'),
      'Gerar cervo': () => this.spawnWildlife('deer'),
      'Gerar urso': () => this.spawnWildlife('bear'),
      'Gerar raposa': () => this.spawnWildlife('fox'),
      'Gerar sapo': () => this.spawnWildlife('frog'),
      'Gerar tartaruga': () => this.spawnWildlife('turtle'),
      'Gerar coruja': () => this.spawnWildlife('owl'),
      'Gerar esquilo': () => this.spawnWildlife('squirrel'),
      'Gerar texugo': () => this.spawnWildlife('badger'),
      'Gerar pato': () => this.spawnWildlife('duck'),
      'Gerar cobra': () => this.spawnWildlife('snake'),
      'Gerar cabra': () => this.spawnWildlife('goat'),
      'Gerar ovelha': () => this.spawnWildlife('sheep'),
      'Gerar porco': () => this.spawnWildlife('pig'),
      'Gerar ouriço': () => this.spawnWildlife('hedgehog'),
      'Gerar caranguejo': () => this.spawnWildlife('crab'),
      'Gerar águia': () => this.spawnWildlife('eagle'),
      'Gerar pantera': () => this.spawnWildlife('panther'),
      'Gerar corvo': () => this.spawnWildlife('crow'),
      'Gerar tatuzinho-de-jardim': () => this.spawnWildlife('pill_bug'),
      'Gerar besouro': () => this.spawnWildlife('beetle'),
      'Gerar borboleta': () => this.spawnWildlife('butterfly'),
      'Gerar abelha': () => this.spawnWildlife('bee'),
      'Gerar libélula': () => this.spawnWildlife('dragonfly'),
      'Gerar panda vermelho': () => this.spawnWildlife('red_panda'),
      'Gerar panda': () => this.spawnWildlife('giant_panda'),
      'Gerar urso polar': () => this.spawnWildlife('polar_bear'),
      'Gerar urso de óculos': () => this.spawnWildlife('spectacled_bear'),
      'Gerar guepardo': () => this.spawnWildlife('cheetah'),
      'Gerar onça': () => this.spawnWildlife('jaguar'),
      'Gerar diabo-da-tasmânia': () => this.spawnWildlife('tasmanian_devil'),
      'Gerar fuinha': () => this.spawnWildlife('weasel'),
      'Gerar lontra': () => this.spawnWildlife('otter'),
      'Gerar flamingo': () => this.spawnWildlife('flamingo'),
      'Gerar hipopótamo': () => this.spawnWildlife('hippo'),
      'Gerar elefante': () => this.spawnWildlife('elephant'),
      'Gerar leão': () => this.spawnWildlife('lion'),
      'Gerar tigre': () => this.spawnWildlife('tiger'),
      'Gerar caranguejo-rei': () => this.spawnWildlife('king_crab'),
      'Gerar polvo': () => this.spawnWildlife('octopus'),
      'Gerar lula': () => this.spawnWildlife('squid'),
      'Gerar lagosta': () => this.spawnWildlife('lobster'),
      'Gerar golfinho': () => this.spawnWildlife('dolphin'),
      'Gerar boto-cor-de-rosa': () => this.spawnWildlife('pink_dolphin'),
      'Gerar cavalo': () => this.spawnWildlife('horse'),
      'Gerar burro': () => this.spawnWildlife('donkey'),
      'Gerar babuíno': () => this.spawnWildlife('baboon'),
      'Gerar gorila': () => this.spawnWildlife('gorilla'),
      'Gerar mico-leão-dourado': () => this.spawnWildlife('golden_lion_tamarin'),
      'Gerar chimpanzé': () => this.spawnWildlife('chimpanzee'),
      'Gerar orangotango': () => this.spawnWildlife('orangutan'),
      'Gerar urubu': () => this.spawnWildlife('vulture'),
      'Gerar tamanduá': () => this.spawnWildlife('anteater'),
      'Gerar tartaruga-do-rio-mary': () => this.spawnWildlife('mary_river_turtle'),
      'Gerar hiena': () => this.spawnWildlife('hyena'),
      'Gerar búfalo': () => this.spawnWildlife('buffalo'),
      'Gerar bisão': () => this.spawnWildlife('bison'),
      'Gerar alce': () => this.spawnWildlife('moose'),
      'Gerar tucano': () => this.spawnWildlife('toucan'),
      'Gerar pombo': () => this.spawnWildlife('pigeon'),
      'Gerar papagaio': () => this.spawnWildlife('parrot'),
      'Gerar pelicano': () => this.spawnWildlife('pelican'),
      'Gerar pinguim': () => this.spawnWildlife('penguin'),
      'Gerar avestruz': () => this.spawnWildlife('ostrich'),
      'Gerar ema': () => this.spawnWildlife('rhea'),
      'Gerar emu': () => this.spawnWildlife('emu'),
      'Gerar jacaré': () => this.spawnWildlife('alligator'),
      'Gerar crocodilo': () => this.spawnWildlife('crocodile'),
      'Gerar gavial': () => this.spawnWildlife('gharial'),
      'Gerar dragão-de-komodo': () => this.spawnWildlife('komodo_dragon'),
      'Gerar axolote': () => this.spawnWildlife('axolotl'),
      'Gerar calango verde': () => this.spawnWildlife('green_lizard'),
      'Gerar camaleão': () => this.spawnWildlife('chameleon'),
      'Gerar peixe-espada': () => this.spawnWildlife('swordfish'),
      'Gerar arraia': () => this.spawnWildlife('stingray'),
      'Gerar narval': () => this.spawnWildlife('narwhal'),
      'Gerar escorpião': () => this.spawnWildlife('scorpion'),
      'Gerar viúva-negra': () => this.spawnWildlife('black_widow'),
      'Gerar tarântula': () => this.spawnWildlife('tarantula'),
      'Gerar armadeira': () => this.spawnWildlife('wandering_spider'),
      'Gerar aranha-alçapão': () => this.spawnWildlife('trapdoor_spider'),
      'Gerar aranha-golias': () => this.spawnWildlife('goliath_spider'),
      'Gerar rola-bosta': () => this.spawnWildlife('dung_beetle'),
      'Gerar besouro-hércules': () => this.spawnWildlife('hercules_beetle'),
      'Gerar louva-deus': () => this.spawnWildlife('praying_mantis'),
      'Gerar vespa': () => this.spawnWildlife('wasp'),
      'Gerar vespa-do-cão': () => this.spawnWildlife('tarantula_hawk'),
      'Gerar minhoca': () => this.spawnWildlife('earthworm'),
      'Gerar formiga': () => this.spawnWildlife('ant'),
      'Gerar lagarta': () => this.spawnWildlife('caterpillar'),
      'Gerar mariposa': () => this.spawnWildlife('moth'),
      'Gerar vagalume': () => this.spawnWildlife('firefly'),
      'Gerar joaninha': () => this.spawnWildlife('ladybug'),
      'Gerar gafanhoto': () => this.spawnWildlife('grasshopper'),
      'Gerar mosca': () => this.spawnWildlife('fly'),
      'Gerar guaxinim': () => this.spawnWildlife('raccoon'),
      'Gerar girafa': () => this.spawnWildlife('giraffe'),
      'Gerar zebra': () => this.spawnWildlife('zebra'),
      'Gerar tatu': () => this.spawnWildlife('armadillo'),
      'Gerar tatu-bolinha': () => this.spawnWildlife('three_banded_armadillo'),
      'Gerar kiwi': () => this.spawnWildlife('kiwi'),
      'Gerar lula-vampira': () => this.spawnWildlife('vampire_squid'),
      'Gerar água-viva': () => this.spawnWildlife('jellyfish'),
      'Gerar polvo-elefante': () => this.spawnWildlife('dumbo_octopus'),
      'Gerar camarão-boxeador': () => this.spawnWildlife('mantis_shrimp'),
      'Gerar lagosta-pistola': () => this.spawnWildlife('pistol_shrimp'),
      'Mapa de sprites (M)': () => this.toggleSpriteInspector(),
      'Restaurar arena': () => this.resetArena(),
      'Exportar modelos (.glb)': () => exportModelsGLB(),
      'Ver rig (X)': () => this.toggleRig(),
    });
    if (this.isTouch) this.tweak.gui.domElement.classList.add('touch');

    // troca para toque/mouse automaticamente conforme o dispositivo usado
    window.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch' && !this.touch.active) this.touch.setActive(true);
    });
    window.addEventListener('mousemove', (e) => {
      if (this.touch.active && (e.movementX || e.movementY) && !this.isTouch) this.touch.setActive(false);
    });

    // loot: inimigos às vezes deixam flechas
    ctx.events.on('enemyDeath', ({ pos }) => {
      if (Math.random() < 0.7) this.pickups.spawn('arrow', pos.clone(), new THREE.Vector3(rand(-1, 1), 4, rand(-1, 1)), 3);
    });
    ctx.events.on('playerRespawn', () => this.hud.toast('Você se levantou de novo!', 'info'));

    // início
    const start = createStartOverlay(this.isTouch, () => {
      ctx.sound.unlock();
      start.remove();
      this.started = true;
      if (!this.isTouch) input.captureMouse(renderer.domElement);
      else document.documentElement.requestFullscreen?.().catch(() => {});
      this.hud.toast('Bem-vindo! H = ajuda · P = ajustes · M = sprites', 'info');
    });
    window.addEventListener('pointerdown', () => ctx.sound.unlock(), { once: true });

    window.addEventListener('resize', () => this.resize());
    this.resize();
    this.spawnEnemy();
    this.spawnPlant(this.arena.playerStart.clone().add(new THREE.Vector3(7, 0, 5)));
    this.spawnBrambleMaw();
    this.spawnThornUrsa();
    this.spawnAntlerWarden();
    this.spawnInitialWildlife();
    startAnimalSpriteStreaming();
    renderer.setAnimationLoop(() => this.frame());
  }

  private resize() {
    const w = window.innerWidth, h = window.innerHeight;
    this.renderer.setSize(w, h);
    this.camRig.camera.aspect = w / h;
    this.camRig.camera.updateProjectionMatrix();
  }

  private setPaused(p: boolean) {
    this.paused = p;
    this.ctx.input.blocked = p;
    if (p) {
      this.ctx.input.releaseAll();
      document.exitPointerLock?.();
    }
  }

  private toggleInventory() {
    if (this.spriteInspector.isOpen) this.spriteInspector.close();
    this.invPanel.toggle();
    this.setPaused(this.invPanel.isOpen);
  }

  private toggleSpriteInspector() {
    if (this.invPanel.isOpen) this.invPanel.close();
    this.help.close();
    this.spriteInspector.toggle();
    this.setPaused(this.spriteInspector.isOpen);
  }

  /** Mostra o esqueleto do personagem (e depois a pose de repouso). */
  toggleRig() {
    const msg = this.rigViewer.cycle();
    this.view.hideGear = this.rigViewer.mode !== 'off';
    if (this.rigViewer.mode !== 'off' && this.camRig.mode === 'first') this.camRig.toggleView();
    this.hud.toast(msg, 'info');
  }

  spawnEnemy() {
    if (this.enemies.enemies.filter((e) => e.alive).length >= 8) {
      this.hud.toast('Limite de 8 inimigos', 'warn');
      return;
    }
    this.enemies.spawn(this.arena.spawnPoint);
  }

  spawnPlant(at?: THREE.Vector3) {
    const plant = new CarnivorousPlant(this.ctx, at ?? this.arena.spawnPoint);
    this.monsters.push(plant);
    this.ctx.combat.add(plant);
  }

  private updateBossHud(active: boolean) {
    let boss: BrambleMaw | ThornUrsa | AntlerWarden | undefined;
    let closest = Infinity;
    if (active) {
      for (const monster of this.monsters) {
        if (!('bossName' in monster) || !monster.alive || !monster.engaged) continue;
        const distance = monster.position.distanceToSquared(this.player.position);
        if (distance < closest) {
          closest = distance;
          boss = monster;
        }
      }
    }
    this.bossPanel.hidden = !boss;
    if (!boss) return;
    if (this.bossName.textContent !== boss.bossName) {
      this.bossName.textContent = boss.bossName;
      this.bossHealth.setAttribute('aria-label', `Vida: ${boss.bossName}`);
    }
    this.bossHealth.max = boss.maxHp;
    this.bossHealth.value = boss.hp;
    this.bossPanel.classList.toggle('enraged', boss.enraged);
    const phase = boss.enraged ? (boss instanceof BrambleMaw ? 'Enfurecida' : 'Enfurecido') : 'Fase 1';
    if (this.bossPhase.textContent !== phase) this.bossPhase.textContent = phase;
  }

  private spawnBrambleMaw() {
    const start = this.arena.playerStart.clone().add(new THREE.Vector3(-9, 0, 8));
    const enemy = new BrambleMaw(this.ctx, start);
    this.monsters.push(enemy);
    this.ctx.combat.add(enemy);
  }

  private spawnThornUrsa() {
    if (this.monsters.some(monster => monster instanceof ThornUrsa && monster.alive)) return;
    const enemy = new ThornUrsa(this.ctx, this.arena.playerStart.clone().add(new THREE.Vector3(15, 0, 11)));
    this.monsters.push(enemy);
    this.ctx.combat.add(enemy);
  }

  private spawnAntlerWarden() {
    if (this.monsters.some(monster => monster instanceof AntlerWarden && monster.alive)) return;
    const enemy = new AntlerWarden(this.ctx, new THREE.Vector3(-17, 0, -15));
    this.monsters.push(enemy);
    this.ctx.combat.add(enemy);
  }

  spawnBoar(at?: THREE.Vector3) {
    if (this.boars.filter((b) => b.alive).length >= 6) {
      this.hud.toast('Limite de 6 javalis', 'warn');
      return;
    }
    const pos = at ? at.clone() : this.arena.spawnPoint.clone().add(new THREE.Vector3(rand(-1.8, 1.8), 0, rand(-1.8, 1.8)));
    const b = new Boar(this.ctx, pos);
    this.boars.push(b);
    this.ctx.combat.add(b);
  }

  spawnFish(species?: FishSpecies) {
    if (this.animals.filter((a) => a.alive).length >= 90) {
      this.hud.toast('Limite de 90 animais', 'warn');
      return;
    }
    const all: FishSpecies[] = ['tropical', 'clown', 'koi', 'puffer', 'angelfish'];
    const kind = species ?? all[Math.floor(Math.random() * all.length)];
    const f = new Fish(this.ctx, this.arena.pondCenter, this.arena.pondRadius, kind);
    this.animals.push(f);
    this.ctx.combat.add(f);
  }

  spawnRabbit(at?: THREE.Vector3) {
    if (this.animals.filter((a) => a.alive).length >= 16) {
      this.hud.toast('Limite de 16 animais', 'warn');
      return;
    }
    const pos = at ? at.clone() : this.arena.playerStart.clone().add(new THREE.Vector3(rand(-4, 4), 0, rand(2.5, 6.5)));
    const r = new Rabbit(this.ctx, pos);
    this.animals.push(r);
    this.ctx.combat.add(r);
  }

  spawnChicken(at?: THREE.Vector3) {
    if (this.animals.filter((a) => a.alive).length >= 16) {
      this.hud.toast('Limite de 16 animais', 'warn');
      return;
    }
    const pos = at ? at.clone() : this.arena.playerStart.clone().add(new THREE.Vector3(rand(-4, 4), 0, rand(2.5, 6.5)));
    const c = new Chicken(this.ctx, pos);
    this.animals.push(c);
    this.ctx.combat.add(c);
  }

  spawnWildlife(
    kind:
      | 'wolf' | 'deer' | 'bear' | 'fox' | 'frog' | 'turtle'
      | 'owl' | 'squirrel' | 'badger' | 'duck' | 'snake' | 'goat'
      | 'sheep' | 'pig' | 'hedgehog' | 'crab' | 'eagle' | 'panther'
      | 'crow' | 'pill_bug' | 'beetle' | 'butterfly' | 'bee' | 'dragonfly' | 'red_panda' | 'giant_panda' | 'polar_bear' | 'spectacled_bear' | 'cheetah' | 'jaguar' | 'tasmanian_devil' | 'weasel' | 'otter' | 'flamingo' | 'hippo' | 'elephant' | 'lion' | 'tiger' | 'king_crab' | 'octopus' | 'squid' | 'lobster' | 'dolphin' | 'pink_dolphin' | 'horse' | 'donkey' | 'baboon' | 'gorilla' | 'golden_lion_tamarin' | 'chimpanzee' | 'orangutan' | 'vulture' | 'anteater' | 'mary_river_turtle' | 'hyena' | 'buffalo' | 'bison' | 'moose' | 'toucan' | 'pigeon' | 'parrot' | 'pelican' | 'penguin' | 'ostrich' | 'rhea' | 'emu' | 'alligator' | 'crocodile' | 'gharial' | 'komodo_dragon' | 'axolotl' | 'green_lizard' | 'chameleon' | 'swordfish' | 'stingray' | 'narwhal' | 'scorpion'
      | 'black_widow' | 'tarantula' | 'wandering_spider' | 'trapdoor_spider' | 'goliath_spider'
      | 'dung_beetle' | 'hercules_beetle' | 'praying_mantis' | 'wasp' | 'tarantula_hawk'
      | 'earthworm' | 'ant' | 'caterpillar' | 'moth' | 'firefly' | 'ladybug' | 'grasshopper' | 'fly'
      | 'raccoon' | 'giraffe' | 'zebra' | 'armadillo' | 'three_banded_armadillo' | 'kiwi'
      | 'vampire_squid' | 'jellyfish' | 'dumbo_octopus' | 'mantis_shrimp' | 'pistol_shrimp',
    at?: THREE.Vector3,
  ) {
    if (this.animals.filter((a) => a.alive).length >= 90) {
      this.hud.toast('Limite de 90 animais', 'warn');
      return;
    }
    const pos = at ? at.clone() : this.arena.playerStart.clone().add(new THREE.Vector3(rand(-7, 7), 0, rand(2, 10)));
    const map = {
      wolf: Wolf,
      deer: Deer,
      bear: Bear,
      fox: Fox,
      frog: Frog,
      turtle: Turtle,
      owl: Owl,
      squirrel: Squirrel,
      badger: Badger,
      snake: Snake,
      goat: Goat,
      sheep: Sheep,
      pig: Pig,
      hedgehog: Hedgehog,
      eagle: Eagle,
      panther: Panther,
      crow: Crow,
      beetle: Beetle,
      pill_bug: PillBug,
      butterfly: Butterfly,
      bee: Bee,
      red_panda: RedPanda,
      giant_panda: GiantPanda,
      polar_bear: PolarBear,
      spectacled_bear: SpectacledBear,
      cheetah: Cheetah,
      jaguar: Jaguar,
      tasmanian_devil: TasmanianDevil,
      weasel: Weasel,
      elephant: Elephant,
      lion: Lion,
      tiger: Tiger,
      horse: Horse,
      donkey: Donkey,
      baboon: Baboon,
      gorilla: Gorilla,
      golden_lion_tamarin: GoldenLionTamarin,
      chimpanzee: Chimpanzee,
      orangutan: Orangutan,
      vulture: Vulture,
      anteater: Anteater,
      hyena: Hyena,
      buffalo: Buffalo,
      bison: Bison,
      moose: Moose,
      toucan: Toucan,
      pigeon: Pigeon,
      parrot: Parrot,
      ostrich: Ostrich,
      rhea: Rhea,
      emu: Emu,
      komodo_dragon: KomodoDragon,
      green_lizard: GreenLizard,
      chameleon: Chameleon,
      scorpion: Scorpion,
      black_widow: BlackWidow,
      tarantula: Tarantula,
      wandering_spider: WanderingSpider,
      trapdoor_spider: TrapdoorSpider,
      goliath_spider: GoliathSpider,
      dung_beetle: DungBeetle,
      hercules_beetle: HerculesBeetle,
      praying_mantis: PrayingMantis,
      wasp: Wasp,
      tarantula_hawk: TarantulaHawk,
      earthworm: Earthworm,
      ant: Ant,
      caterpillar: Caterpillar,
      moth: Moth,
      firefly: Firefly,
      ladybug: Ladybug,
      grasshopper: Grasshopper,
      fly: Fly,
      raccoon: Raccoon,
      giraffe: Giraffe,
      zebra: Zebra,
      armadillo: Armadillo,
      three_banded_armadillo: ThreeBandedArmadillo,
      kiwi: Kiwi,
    };
    const animal = kind === 'duck'
      ? new Duck(this.ctx, pos, this.arena.pondCenter)
      : kind === 'crab'
        ? new Crab(this.ctx, pos, this.arena.pondCenter)
        : kind === 'dragonfly'
          ? new Dragonfly(this.ctx, pos, this.arena.pondCenter)
          : kind === 'otter'
            ? new Otter(this.ctx, pos, this.arena.pondCenter)
            : kind === 'flamingo'
              ? new Flamingo(this.ctx, pos, this.arena.pondCenter)
              : kind === 'hippo'
                ? new Hippo(this.ctx, pos, this.arena.pondCenter)
                : kind === 'king_crab'
                  ? new KingCrab(this.ctx, pos, this.arena.pondCenter)
                  : kind === 'octopus'
                    ? new Octopus(this.ctx, pos, this.arena.pondCenter)
                    : kind === 'squid'
                      ? new Squid(this.ctx, pos, this.arena.pondCenter)
                      : kind === 'lobster'
                        ? new Lobster(this.ctx, pos, this.arena.pondCenter)
                        : kind === 'dolphin'
                          ? new Dolphin(this.ctx, pos, this.arena.pondCenter)
                          : kind === 'pink_dolphin'
                            ? new PinkDolphin(this.ctx, pos, this.arena.pondCenter)
                            : kind === 'mary_river_turtle'
                              ? new MaryRiverTurtle(this.ctx, pos, this.arena.pondCenter)
                              : kind === 'pelican'
                                ? new Pelican(this.ctx, pos, this.arena.pondCenter)
                                : kind === 'penguin'
                                  ? new Penguin(this.ctx, pos, this.arena.pondCenter)
                                  : kind === 'alligator'
                                    ? new Alligator(this.ctx, pos, this.arena.pondCenter)
                                    : kind === 'crocodile'
                                      ? new Crocodile(this.ctx, pos, this.arena.pondCenter)
                                      : kind === 'gharial'
                                        ? new Gharial(this.ctx, pos, this.arena.pondCenter)
                                        : kind === 'axolotl'
                                          ? new Axolotl(this.ctx, pos, this.arena.pondCenter)
                                          : kind === 'swordfish'
                                            ? new Swordfish(this.ctx, pos, this.arena.pondCenter)
                                            : kind === 'stingray'
                                              ? new Stingray(this.ctx, pos, this.arena.pondCenter)
                                              : kind === 'narwhal'
                                                ? new Narwhal(this.ctx, pos, this.arena.pondCenter)
                                                : kind === 'vampire_squid'
                                                  ? new VampireSquid(this.ctx, pos, this.arena.pondCenter)
                                                  : kind === 'jellyfish'
                                                    ? new Jellyfish(this.ctx, pos, this.arena.pondCenter)
                                                    : kind === 'dumbo_octopus'
                                                      ? new DumboOctopus(this.ctx, pos, this.arena.pondCenter)
                                                      : kind === 'mantis_shrimp'
                                                        ? new MantisShrimp(this.ctx, pos, this.arena.pondCenter)
                                                        : kind === 'pistol_shrimp'
                                                          ? new PistolShrimp(this.ctx, pos, this.arena.pondCenter)
                                                          : new map[kind](this.ctx, pos);
    this.animals.push(animal);
    this.ctx.combat.add(animal);
  }

  private spawnInitialWildlife() {
    this.spawnBoar(this.arena.playerStart.clone().add(new THREE.Vector3(3.2, 0, 5.2)));
    this.spawnFish('tropical');
    this.spawnFish('clown');
    this.spawnFish('koi');
    this.spawnFish('puffer');
    this.spawnFish('angelfish');
    this.spawnRabbit(this.arena.playerStart.clone().add(new THREE.Vector3(-3.0, 0, 4.8)));
    this.spawnChicken(this.arena.playerStart.clone().add(new THREE.Vector3(2.4, 0, 3.0)));
    this.spawnWildlife('wolf', this.arena.playerStart.clone().add(new THREE.Vector3(-8.5, 0, 3.5)));
    this.spawnWildlife('deer', this.arena.playerStart.clone().add(new THREE.Vector3(6.5, 0, 11.5)));
    this.spawnWildlife('bear', this.arena.playerStart.clone().add(new THREE.Vector3(-11.0, 0, 11.0)));
    this.spawnWildlife('fox', this.arena.playerStart.clone().add(new THREE.Vector3(4.8, 0, -2.5)));
    this.spawnWildlife('frog', this.arena.pondCenter.clone().add(new THREE.Vector3(3.4, 0, -1.8)));
    this.spawnWildlife('turtle', this.arena.pondCenter.clone().add(new THREE.Vector3(-3.2, 0, -2.2)));
    this.spawnWildlife('owl', this.arena.playerStart.clone().add(new THREE.Vector3(-5.5, 0, 8.5)));
    this.spawnWildlife('squirrel', this.arena.playerStart.clone().add(new THREE.Vector3(7.5, 0, 4.2)));
    this.spawnWildlife('badger', this.arena.playerStart.clone().add(new THREE.Vector3(-6.2, 0, -3.5)));
    this.spawnWildlife('duck', this.arena.pondCenter.clone().add(new THREE.Vector3(2.4, 0, 2.2)));
    this.spawnWildlife('snake', this.arena.playerStart.clone().add(new THREE.Vector3(9.5, 0, 7.8)));
    this.spawnWildlife('goat', this.arena.playerStart.clone().add(new THREE.Vector3(-2.5, 0, 12.5)));
    this.spawnWildlife('sheep', this.arena.playerStart.clone().add(new THREE.Vector3(1.5, 0, 9.5)));
    this.spawnWildlife('pig', this.arena.playerStart.clone().add(new THREE.Vector3(-4.2, 0, 1.8)));
    this.spawnWildlife('hedgehog', this.arena.playerStart.clone().add(new THREE.Vector3(5.8, 0, 1.5)));
    this.spawnWildlife('crab', this.arena.pondCenter.clone().add(new THREE.Vector3(-2.6, 0, 2.0)));
    this.spawnWildlife('eagle', this.arena.playerStart.clone().add(new THREE.Vector3(-1.5, 0, 7.0)));
    this.spawnWildlife('panther', this.arena.playerStart.clone().add(new THREE.Vector3(10.5, 0, -1.5)));
    this.spawnWildlife('crow', this.arena.playerStart.clone().add(new THREE.Vector3(-4.5, 0, 6.2)));
    this.spawnWildlife('vulture', this.arena.playerStart.clone().add(new THREE.Vector3(5.5, 0, 8.0)));
    this.spawnWildlife('pill_bug', this.arena.playerStart.clone().add(new THREE.Vector3(2.4, 0, 2.8)));
    this.spawnWildlife('beetle', this.arena.playerStart.clone().add(new THREE.Vector3(3.6, 0, 1.4)));
    this.spawnWildlife('butterfly', this.arena.playerStart.clone().add(new THREE.Vector3(-1.8, 0, 3.6)));
    this.spawnWildlife('bee', this.arena.playerStart.clone().add(new THREE.Vector3(2.2, 0, 6.4)));
    this.spawnWildlife('dragonfly', this.arena.pondCenter.clone().add(new THREE.Vector3(1.2, 0, -0.8)));
    this.spawnWildlife('red_panda', this.arena.playerStart.clone().add(new THREE.Vector3(-7.2, 0, 5.4)));
    this.spawnWildlife('giant_panda', this.arena.playerStart.clone().add(new THREE.Vector3(8.2, 0, 10.2)));
  }

  private clearBoars() {
    for (const b of this.boars) {
      this.ctx.combat.remove(b);
      b.dispose();
    }
    this.boars = [];
    for (const a of this.animals) {
      this.ctx.combat.remove(a);
      a.dispose();
    }
    this.animals = [];
  }

  resetArena() {
    this.arena.reset();
    this.enemies.clear();
    for (const monster of this.monsters) { this.ctx.combat.remove(monster); monster.dispose(); }
    this.monsters = [];
    this.spawnPlant(this.arena.playerStart.clone().add(new THREE.Vector3(7, 0, 5)));
    this.spawnBrambleMaw();
    this.spawnThornUrsa();
    this.spawnAntlerWarden();
    this.clearBoars();
    this.spawnInitialWildlife();
    this.pickups.clear();
    this.projectiles.clear();
    this.ctx.fx.clear();
    const p = this.player;
    p.hp = p.maxHp;
    p.stamina = this.ctx.tuning.staminaMax;
    p.exhausted = false;
    p.lockTarget = null;
    const arrows = this.inventory.count('arrow');
    if (arrows < 20) this.inventory.add('arrow', 20 - arrows);
    if (!p.alive) p.spawn(this.arena.playerStart);
    this.ctx.sound.play('resetArena');
    this.hud.toast('Arena restaurada', 'good');
  }

  private handleGlobalInput() {
    const inp = this.ctx.input;
    // ações de menu funcionam mesmo com input bloqueado
    inp.blocked = false;
    if (inp.consume('inventory')) {
      this.help.close();
      this.toggleInventory();
    }
    if (inp.consume('spriteMap')) {
      this.toggleSpriteInspector();
    }
    if (inp.consume('help')) {
      const open = this.help.toggle();
      if (this.invPanel.isOpen) this.invPanel.close();
      if (this.spriteInspector.isOpen) this.spriteInspector.close();
      this.setPaused(open);
    }
    if (inp.consume('tweak')) {
      this.tweak.toggle();
      if (this.tweak.isOpen) document.exitPointerLock?.();
    }
    // O estado atual dos menus decide o bloqueio, inclusive ao fechar por atalho.
    inp.blocked = this.paused;
    if (this.paused) return;
    if (inp.consume('interact') && this.player.alive) this.traveler.talk();
    if (inp.consume('juice')) {
      const on = this.tweak.toggleJuice();
      this.hud.toast(on ? 'Juice LIGADO (hit stop, tremor, partículas…)' : 'Juice DESLIGADO — sinta a diferença', on ? 'good' : 'warn');
    }
    if (inp.consume('spawn')) this.spawnEnemy();
    if (inp.consume('reset')) this.resetArena();
    if (inp.consume('rigView')) this.toggleRig();
    if (inp.consume('runToggle')) this.hud.toast(inp.runLock ? 'Correr travado (Z para soltar)' : 'Andando', 'info');
  }

  private frame() {
    const now = performance.now();
    beginBakeFrame();
    const raw = (now - this.last) / 1000;
    this.last = now;
    const ctx = this.ctx;
    const clock = ctx.clock;
    ctx.input.update();
    if (this.started) this.handleGlobalInput();
    if (this.help.isOpen() === false && this.paused && !this.invPanel.isOpen && !this.spriteInspector.isOpen) this.setPaused(false);

    clock.tick(this.paused || !this.started ? 0 : raw);
    const dt = clock.dt, pdt = clock.playerDt;

    // simulação
    const t0 = performance.now();
    this.player.update(pdt);
    this.enemies.update(dt, this.player);
    for (let i = this.monsters.length - 1; i >= 0; i--) {
      const monster = this.monsters[i];
      if (monster.alive) continue;
      if (monster instanceof ThornUrsa || monster instanceof AntlerWarden) this.hud.toast(`${monster.bossName} derrotado`, 'good');
      this.ctx.combat.remove(monster);
      monster.dispose();
      this.monsters.splice(i, 1);
    }
    this.arena.update(dt, this.camRig.camera);
    this.projectiles.update(dt);
    this.pickups.update(dt, this.player.alive ? this.player.position : null);
    ctx.fx.update(dt, this.camRig.camera);

    // câmera e visuais
    ctx.shake.update(clock.realDt);
    this.camRig.update(clock.realDt, pdt);
    const cam = this.camRig.camera;
    this.actorRenderer.prepare(cam);
    const actorCamera = this.actorRenderer.camera;
    const actorSize = this.actorRenderer.sampleSize;
    const first = this.camRig.blend > 0.5;
    this.view.visible = !first && this.camRig.headDistance > 0.6;
    this.view.update(pdt, actorCamera, actorSize);
    const t1 = performance.now();
    for (const monster of this.monsters) monster.update(dt, this.player.alive ? this.player : null, cam);
    const active = this.started && !this.paused && this.player.alive;
    this.traveler.update(dt, this.player, cam, undefined, active, this.isTouch);
    this.updateBossHud(active);
    const animalTarget = ctx.tuning.peacefulAnimals ? null : this.player;
    for (let i = this.boars.length - 1; i >= 0; i--) {
      const b = this.boars[i];
      b.update(dt, animalTarget, cam);
      if (!b.alive && b.deadT > 1.1 && !b.removed) {
        b.removed = true;
        this.ctx.events.emit('enemyDeath', { pos: b.position.clone().setY(b.position.y + 0.5) });
        this.ctx.combat.remove(b);
        b.dispose();
        this.boars.splice(i, 1);
      }
    }
    const nAnim = this.animals.length;
    if (nAnim > 0) {
      const start = this.animalBakeCursor++ % nAnim;
      for (let k = 0; k < nAnim; k++) {
        const a = this.animals[(start + k) % nAnim];
        a.update(dt, animalTarget, cam);
      }
      for (let i = nAnim - 1; i >= 0; i--) {
        const a = this.animals[i];
        if (!a.alive && a.deadT > 1.1 && !a.removed) {
          a.removed = true;
          this.ctx.events.emit('enemyDeath', { pos: a.position.clone().setY(a.position.y + 0.35) });
          this.ctx.combat.remove(a);
          a.dispose();
          this.animals.splice(i, 1);
        }
      }
    }
    const t2 = performance.now();
    this.rigViewer.update();
    if (this.rigViewer.mode === 'rest') this.view.updateBillboards(actorCamera, actorSize);
    this.fpv.visible = first;
    this.fpv.update(pdt, cam);
    this.camRightTmp.setFromMatrixColumn(cam.matrixWorld, 0);
    ctx.sound.setListener(cam.position, this.camRightTmp);

    // debug de hitboxes
    this.bladesTmp.length = 0;
    const a = this.player.attack;
    if (ctx.tuning.showHitboxes && a && this.player.state === 'attack') {
      const h = new THREE.Vector3(), b = new THREE.Vector3(), t = new THREE.Vector3(), d = new THREE.Vector3(), e = new THREE.Vector3();
      bladeSegmentWorld(a.def, a.weapon, this.player.swingAngle, ctx.tuning.rangeMul, this.player.position, a.yaw, 1, h, b, t, d, e, a.aimPitch);
      this.bladesTmp.push({ base: b, tip: t });
    }
    this.debug.update(ctx.tuning.showHitboxes, ctx.combat, this.bladesTmp);

    // HUD
    const d = this.arena.dummy;
    this.touch.setJumpIsDodge(!!this.player.lockTarget);
    this.hud.update(clock.realDt, cam, this.player, first, { lastDamage: d.lastDamage, combo: d.combo, dps: d.dps, pos: d.pos });

    // render: mundo + viewmodel (profundidade limpa → armas não atravessam paredes)
    const t3 = performance.now();
    const r = this.renderer;
    this.actorRenderer.render(ctx.scene, cam, first ? this.fpv.scene : undefined);
    const t4 = performance.now();
    const pa = this.perfAcc;
    pa.frames++;
    pa.dt += raw;
    pa.sim += t1 - t0;
    pa.anim += t2 - t1;
    pa.ren += t4 - t3;
    const totalMs = t4 - now;
    if (totalMs > pa.maxFrame) pa.maxFrame = totalMs;
    if (pa.dt >= 0.5) {
      const n = pa.frames || 1;
      const fps = Math.round(n / pa.dt);
      this.hud.setPerf(`${fps} FPS | max ${pa.maxFrame.toFixed(0)}ms | sim ${(pa.sim / n).toFixed(1)} anim ${(pa.anim / n).toFixed(1)} ren ${(pa.ren / n).toFixed(1)} | dc ${r.info.render.calls} tri ${r.info.render.triangles}`);
      pa.frames = 0; pa.dt = 0; pa.sim = 0; pa.anim = 0; pa.ren = 0; pa.maxFrame = 0;
    }
    ctx.input.endFrame();
  }
}
