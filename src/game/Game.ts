import * as THREE from 'three';
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
import { HUD } from '../engine/ui/HUD';
import { InventoryPanel } from '../engine/ui/InventoryPanel';
import { TouchControls } from '../engine/ui/TouchControls';
import { TweakPanel } from '../engine/ui/TweakPanel';
import { bladeSegmentWorld } from '../engine/combat/Attacks';
import { TestArena } from '../arena/TestArena';
import { createHelpOverlay, createStartOverlay } from './Overlays';
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
  private arena: TestArena;
  private pickups: PickupSystem;
  private projectiles: ProjectileSystem;
  private inventory: Inventory;
  private hud: HUD;
  private invPanel: InventoryPanel;
  private tweak: TweakPanel;
  private touch: TouchControls;
  private rigViewer: RigViewer;
  private help: ReturnType<typeof createHelpOverlay>;
  private debug = new DebugDraw();
  private started = false;
  private paused = false;
  private last = performance.now();
  private isTouch: boolean;

  constructor(container: HTMLElement) {
    this.isTouch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
    const renderer = new THREE.WebGLRenderer({ antialias: !this.isTouch || devicePixelRatio < 2, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, this.isTouch ? 1.5 : 2));
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
    this.view = new PlayerView(ctx, this.player);
    this.rigViewer = new RigViewer(ctx.scene, this.view.rig);
    this.fpv = new FirstPersonView(ctx, this.player);
    this.enemies = new EnemyDirector(ctx);
    this.arena = new TestArena(ctx, this.pickups);
    this.player.spawn(this.arena.playerStart, 0);
    this.camRig.yaw = 0;

    // UI
    this.hud = new HUD(ctx, this.inventory);
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
    this.help = createHelpOverlay();
    this.touch = new TouchControls(input, renderer.domElement);
    this.touch.setActive(this.isTouch);
    this.tweak = new TweakPanel(tuning, {
      'Gerar inimigo': () => this.spawnEnemy(),
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
      if (!this.isTouch) renderer.domElement.requestPointerLock?.();
      else document.documentElement.requestFullscreen?.().catch(() => {});
      this.hud.toast('Bem-vindo! H = ajuda · P = ajustes', 'info');
    });
    window.addEventListener('pointerdown', () => ctx.sound.unlock(), { once: true });

    window.addEventListener('resize', () => this.resize());
    this.resize();
    this.spawnEnemy();
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
    this.invPanel.toggle();
    this.setPaused(this.invPanel.isOpen);
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

  resetArena() {
    this.arena.reset();
    this.enemies.clear();
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
    const wasBlocked = inp.blocked;
    inp.blocked = false;
    if (inp.consume('inventory')) {
      this.help.close();
      this.toggleInventory();
    }
    if (inp.consume('help')) {
      const open = this.help.toggle();
      if (this.invPanel.isOpen) this.invPanel.close();
      this.setPaused(open);
    } else inp.blocked = wasBlocked || this.paused;
    if (inp.consume('tweak')) {
      this.tweak.toggle();
      if (this.tweak.isOpen) document.exitPointerLock?.();
    }
    if (this.paused) return;
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
    const raw = (now - this.last) / 1000;
    this.last = now;
    const ctx = this.ctx;
    const clock = ctx.clock;
    ctx.input.update();
    if (this.started) this.handleGlobalInput();
    if (this.help.isOpen() === false && this.paused && !this.invPanel.isOpen) this.setPaused(false);

    clock.tick(this.paused || !this.started ? 0 : raw);
    const dt = clock.dt, pdt = clock.playerDt;

    // simulação
    this.player.update(pdt);
    this.enemies.update(dt, this.player);
    this.arena.update(dt, this.camRig.camera);
    this.projectiles.update(dt);
    this.pickups.update(dt, this.player.alive ? this.player.position : null);
    ctx.fx.update(dt, this.camRig.camera);

    // câmera e visuais
    ctx.shake.update(clock.realDt);
    this.camRig.update(clock.realDt, pdt);
    const cam = this.camRig.camera;
    const first = this.camRig.blend > 0.5;
    this.view.visible = !first && this.camRig.headDistance > 0.6;
    this.view.update(pdt);
    this.rigViewer.update();
    this.fpv.visible = first;
    this.fpv.update(pdt, cam);
    const right = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 0);
    ctx.sound.setListener(cam.position, right);

    // debug de hitboxes
    const blades: { base: THREE.Vector3; tip: THREE.Vector3 }[] = [];
    const a = this.player.attack;
    if (ctx.tuning.showHitboxes && a && this.player.state === 'attack') {
      const h = new THREE.Vector3(), b = new THREE.Vector3(), t = new THREE.Vector3(), d = new THREE.Vector3(), e = new THREE.Vector3();
      bladeSegmentWorld(a.def, a.weapon, this.player.swingAngle, ctx.tuning.rangeMul, this.player.position, a.yaw, 1, h, b, t, d, e, a.aimPitch);
      blades.push({ base: b, tip: t });
    }
    this.debug.update(ctx.tuning.showHitboxes, ctx.combat, blades);

    // HUD
    const d = this.arena.dummy;
    this.touch.setJumpIsDodge(!!this.player.lockTarget);
    this.hud.update(clock.realDt, cam, this.player, first, { lastDamage: d.lastDamage, combo: d.combo, dps: d.dps, pos: d.pos });

    // render: mundo + viewmodel (profundidade limpa → armas não atravessam paredes)
    const r = this.renderer;
    r.autoClear = true;
    r.render(ctx.scene, cam);
    if (first) {
      r.autoClear = false;
      r.clearDepth();
      r.render(this.fpv.scene, cam);
      r.autoClear = true;
    }
    ctx.input.endFrame();
  }
}
