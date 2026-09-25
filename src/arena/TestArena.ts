import * as THREE from 'three';
import type { GameContext } from '../engine/core/Context';
import { makeBoxCollider, type Collider, type SurfaceMaterial } from '../engine/physics/PhysicsWorld';
import { ChoppableTree } from '../engine/world/ChoppableTree';
import { MineableRock } from '../engine/world/MineableRock';
import { TrainingDummy } from '../engine/world/TrainingDummy';
import type { PickupSystem } from '../engine/items/Pickups';
import { rand } from '../engine/core/math';

/**
 * Arena de testes (só cenário + posicionamento). Os sistemas reutilizáveis
 * (árvore, pedra, boneco, inimigos...) não dependem desta classe.
 */
export class TestArena {
  tree: ChoppableTree;
  rock: MineableRock;
  dummy: TrainingDummy;
  readonly spawnPoint = new THREE.Vector3(0, 0, -13);
  readonly playerStart = new THREE.Vector3(0, 0, 4);
  private spawnRing: THREE.Mesh;
  private t = 0;

  constructor(private ctx: GameContext, pickups: PickupSystem) {
    const scene = ctx.scene;
    this.buildSky(scene);
    this.buildLights(scene);

    // ---------------------------------------------------------------- chão
    const size = 64;
    const groundGeo = new THREE.PlaneGeometry(size, size, 48, 48);
    groundGeo.rotateX(-Math.PI / 2);
    const colors: number[] = [];
    const c = new THREE.Color();
    const pos = groundGeo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      const n = Math.sin(x * 0.35) * Math.cos(z * 0.3) * 0.5 + Math.sin(x * 1.3 + z * 0.7) * 0.25;
      c.setHSL(0.27 + n * 0.02, 0.45, 0.4 + n * 0.05);
      colors.push(c.r, c.g, c.b);
    }
    groundGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const ground = new THREE.Mesh(groundGeo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, flatShading: true }));
    ground.receiveShadow = true;
    scene.add(ground);
    ctx.physics.add({ ...makeBoxCollider(0, 0, size / 2, size / 2, -2, 0, 0, 'grass'), mesh: ground, blocksCamera: true });
    // limites invisíveis + cercas
    const B = 26;
    for (const [x, z, hx, hz] of [[0, B, B, 0.5], [0, -B, B, 0.5], [B, 0, 0.5, B], [-B, 0, 0.5, B]] as const) {
      ctx.physics.add({ ...makeBoxCollider(x, z, hx, hz, -1, 6, 0, 'wood'), blocksCamera: false });
    }
    this.buildFence(B);
    this.buildGrass(B);

    // ---------------------------------------------------------------- geometria de teste
    const stone = new THREE.MeshStandardMaterial({ color: 0xb8b2a6, roughness: 0.95, flatShading: true });
    const darkStone = new THREE.MeshStandardMaterial({ color: 0x8d877c, roughness: 0.95, flatShading: true });
    const wood = new THREE.MeshStandardMaterial({ color: 0xa47a4c, roughness: 0.85, flatShading: true });
    const metal = new THREE.MeshStandardMaterial({ color: 0x9aa4b0, roughness: 0.35, metalness: 0.8, flatShading: true });

    // parede alta (colisão + câmera)
    this.box(-9, -3, 0.35, 4, 0, 3.2, 0, stone, 'stone');
    this.box(-11.5, 0.5, 2.5, 0.35, 0, 3.2, 0, stone, 'stone');
    // parede de metal (clangor)
    this.box(-12, -8, 1.5, 0.2, 0, 2.4, 0.4, metal, 'metal');

    // rampa + plataforma (com borda para testar tolerância de salto)
    this.ramp(9, -2, 1.6, 3.2, 0, 1.8, 0, wood);
    this.box(9, 3.2, 2.2, 2, 0, 1.8, 0, wood, 'wood');
    this.box(9, 3.2, 2.25, 2.05, 1.8, 1.9, 0, darkStone, 'stone');
    // plataforma flutuante à frente (salto entre plataformas)
    this.box(9, 8.4, 1.4, 1.2, 1.2, 1.9, 0, darkStone, 'stone');
    this.box(9, 12.2, 1.4, 1.2, 0, 1.3, 0, darkStone, 'stone');

    // degraus / desníveis: 0.2, 0.35 (sobe andando), 0.6, 0.95, 1.3 (precisa pular)
    const steps = [0.2, 0.35, 0.6, 0.95, 1.3];
    steps.forEach((h, i) => this.box(-3 + i * 1.6, -7, 0.8, 1.4, 0, h, 0, i % 2 ? stone : darkStone, 'stone'));
    // pequenos blocos soltos
    this.box(3.5, -1.5, 0.6, 0.6, 0, 0.5, 0.5, darkStone, 'stone');
    this.box(-4, 2.5, 0.9, 0.5, 0, 0.3, -0.3, darkStone, 'stone');

    // plataforma de spawn
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.4, 0.12, 24), darkStone);
    pad.position.copy(this.spawnPoint).setY(0.06);
    pad.receiveShadow = true;
    scene.add(pad);
    this.spawnRing = new THREE.Mesh(
      new THREE.RingGeometry(1.7, 2.0, 32),
      new THREE.MeshBasicMaterial({ color: 0xb06cff, transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthWrite: false }),
    );
    this.spawnRing.rotation.x = -Math.PI / 2;
    this.spawnRing.position.copy(this.spawnPoint).setY(0.14);
    scene.add(this.spawnRing);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const pil = this.box(this.spawnPoint.x + Math.cos(a) * 2.8, this.spawnPoint.z + Math.sin(a) * 2.8, 0.25, 0.25, 0, 1.6, a, stone, 'stone');
      void pil;
    }

    // ---------------------------------------------------------------- objetos interativos
    this.tree = new ChoppableTree(ctx, pickups, new THREE.Vector3(-7, 0, 8));
    this.rock = new MineableRock(ctx, pickups, new THREE.Vector3(6, 0, 7));
    this.dummy = new TrainingDummy(ctx, new THREE.Vector3(0, 0, 10), Math.PI);

    // placas
    this.label('Árvore — use o MACHADO', new THREE.Vector3(-7, 5.4, 8));
    this.label('Pedra — use a PICARETA', new THREE.Vector3(6, 2.4, 7));
    this.label('Boneco de treino (capacete de metal)', new THREE.Vector3(0, 2.7, 10));
    this.label('Spawn de inimigos [G]', new THREE.Vector3(0, 2.4, -13));
    this.label('Rampa → plataforma (teste a tolerância de borda)', new THREE.Vector3(9, 3.4, 0));
    this.label('Degraus: 0.2 · 0.35 · 0.6 · 0.95 · 1.3 m', new THREE.Vector3(0.2, 2.3, -7));
    this.label('Parede (câmera/colisão)', new THREE.Vector3(-9, 3.8, -3));
    this.label('Metal', new THREE.Vector3(-12, 2.9, -8));
    this.buildScenery(scene);
  }

  private box(x: number, z: number, hx: number, hz: number, y0: number, y1: number, yaw: number, mat: THREE.Material, surf: SurfaceMaterial): Collider {
    const m = new THREE.Mesh(new THREE.BoxGeometry(hx * 2, y1 - y0, hz * 2), mat);
    m.position.set(x, (y0 + y1) / 2, z);
    m.rotation.y = yaw;
    m.castShadow = m.receiveShadow = true;
    this.ctx.scene.add(m);
    return this.ctx.physics.add({ ...makeBoxCollider(x, z, hx, hz, y0, y1, yaw, surf), mesh: m });
  }

  private ramp(x: number, z: number, hx: number, hz: number, y0: number, y1: number, yaw: number, mat: THREE.Material) {
    // cunha: base retangular, sobe no sentido +Z local
    const shape = new THREE.Shape();
    shape.moveTo(-hz, 0);
    shape.lineTo(hz, y1 - y0);
    shape.lineTo(hz, 0);
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, { depth: hx * 2, bevelEnabled: false });
    geo.translate(0, 0, -hx);
    geo.rotateY(-Math.PI / 2);
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y0, z);
    m.rotation.y = yaw;
    m.castShadow = m.receiveShadow = true;
    this.ctx.scene.add(m);
    const c = makeBoxCollider(x, z, hx, hz, y0, y1, yaw, 'wood');
    c.kind = 'ramp';
    this.ctx.physics.add({ ...c, mesh: m });
  }

  private label(text: string, pos: THREE.Vector3) {
    const cv = document.createElement('canvas');
    const ctx2 = cv.getContext('2d')!;
    const font = 'bold 34px system-ui, sans-serif';
    ctx2.font = font;
    const w = Math.ceil(ctx2.measureText(text).width) + 40;
    cv.width = w;
    cv.height = 60;
    ctx2.font = font;
    ctx2.fillStyle = 'rgba(20,24,32,0.72)';
    ctx2.beginPath();
    ctx2.roundRect(0, 0, w, 60, 16);
    ctx2.fill();
    ctx2.fillStyle = '#fff6dc';
    ctx2.textBaseline = 'middle';
    ctx2.fillText(text, 20, 32);
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
    s.scale.set((w / 60) * 0.42, 0.42, 1);
    s.position.copy(pos);
    this.ctx.scene.add(s);
  }

  private buildSky(scene: THREE.Scene) {
    const geo = new THREE.SphereGeometry(300, 24, 12);
    const mat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: { top: { value: new THREE.Color(0x4f8fd8) }, mid: { value: new THREE.Color(0xa9d4f5) }, bot: { value: new THREE.Color(0xe9e2c8) } },
      vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: 'uniform vec3 top; uniform vec3 mid; uniform vec3 bot; varying vec3 vP; void main(){ float h = vP.y; vec3 c = h > 0.0 ? mix(mid, top, pow(h, 0.6)) : mix(mid, bot, pow(-h, 0.4)); gl_FragColor = vec4(c,1.0); }',
    });
    scene.add(new THREE.Mesh(geo, mat));
    scene.fog = new THREE.Fog(0xb8d8ee, 45, 140);
  }

  private buildLights(scene: THREE.Scene) {
    scene.add(new THREE.HemisphereLight(0xcfe8ff, 0x5a6a3a, 1.2));
    const sun = new THREE.DirectionalLight(0xfff0d6, 2.6);
    sun.position.set(-14, 24, 10);
    sun.castShadow = true;
    const mobile = matchMedia('(pointer: coarse)').matches;
    sun.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048);
    const s = sun.shadow.camera;
    s.left = -30; s.right = 30; s.top = 30; s.bottom = -30; s.near = 1; s.far = 80;
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.03;
    scene.add(sun, sun.target);
  }

  private buildFence(B: number) {
    const post = new THREE.MeshStandardMaterial({ color: 0x7a5232, roughness: 0.9, flatShading: true });
    const geo = new THREE.BoxGeometry(0.2, 1.1, 0.2);
    const rail = new THREE.BoxGeometry(1, 0.1, 0.08);
    const count = 4 * 26;
    const posts = new THREE.InstancedMesh(geo, post, count);
    const rails = new THREE.InstancedMesh(rail, post, count * 2);
    const m = new THREE.Matrix4();
    let i = 0, r = 0;
    for (let side = 0; side < 4; side++) {
      for (let k = 0; k < 26; k++) {
        const t = -B + k * ((2 * B) / 26);
        const [x, z, yaw] = side === 0 ? [t, B, 0] : side === 1 ? [t, -B, 0] : side === 2 ? [B, t, Math.PI / 2] : [-B, t, Math.PI / 2];
        m.makeRotationY(yaw).setPosition(x, 0.55, z);
        posts.setMatrixAt(i++, m);
        const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
        const off = new THREE.Vector3(1, 0, 0).applyQuaternion(q).multiplyScalar(((2 * B) / 26) * 0.5);
        for (const h of [0.45, 0.85]) {
          m.compose(new THREE.Vector3(x + off.x, h, z + off.z), q, new THREE.Vector3((2 * B) / 26, 1, 1));
          rails.setMatrixAt(r++, m);
        }
      }
    }
    posts.castShadow = rails.castShadow = true;
    this.ctx.scene.add(posts, rails);
  }

  private buildGrass(B: number) {
    const geo = new THREE.ConeGeometry(0.06, 0.4, 3);
    geo.translate(0, 0.2, 0);
    const mat = new THREE.MeshStandardMaterial({ color: 0x6fae4a, roughness: 1, flatShading: true });
    const N = 1400;
    const inst = new THREE.InstancedMesh(geo, mat, N);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const col = new THREE.Color();
    let n = 0;
    for (let i = 0; i < N * 3 && n < N; i++) {
      const x = rand(-B + 1, B - 1), z = rand(-B + 1, B - 1);
      // evita a área central de testes
      if (Math.abs(x) < 13 && Math.abs(z) < 15) continue;
      q.setFromEuler(new THREE.Euler(rand(-0.3, 0.3), rand(0, 6), rand(-0.3, 0.3)));
      m.compose(new THREE.Vector3(x, 0, z), q, new THREE.Vector3(1, rand(0.6, 1.5), 1));
      inst.setMatrixAt(n, m);
      inst.setColorAt(n, col.setHSL(0.25 + rand(-0.03, 0.03), 0.5, rand(0.35, 0.5)));
      n++;
    }
    inst.count = n;
    this.ctx.scene.add(inst);
  }

  private buildScenery(scene: THREE.Scene) {
    // montanhas distantes e árvores decorativas fora da arena (escala e horizonte)
    const mMat = new THREE.MeshStandardMaterial({ color: 0x7d8fa0, roughness: 1, flatShading: true });
    const snow = new THREE.MeshStandardMaterial({ color: 0xf2f4f8, roughness: 1, flatShading: true });
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2 + rand(-0.1, 0.1);
      const d = rand(90, 130);
      const h = rand(25, 55);
      const mnt = new THREE.Mesh(new THREE.ConeGeometry(rand(18, 30), h, 6), mMat);
      mnt.position.set(Math.cos(a) * d, h / 2 - 2, Math.sin(a) * d);
      scene.add(mnt);
      const cap = new THREE.Mesh(new THREE.ConeGeometry(6, h * 0.25, 6), snow);
      cap.position.set(mnt.position.x, h - 2 - h * 0.125 - 0.5, mnt.position.z);
      cap.scale.setScalar(1);
      scene.add(cap);
    }
    const leaf = new THREE.MeshStandardMaterial({ color: 0x3f7a33, roughness: 1, flatShading: true });
    const trunk = new THREE.MeshStandardMaterial({ color: 0x6b4a2e, roughness: 1, flatShading: true });
    for (let i = 0; i < 40; i++) {
      const a = rand(0, Math.PI * 2);
      const d = rand(30, 55);
      const g = new THREE.Group();
      const t = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 2, 5), trunk);
      t.position.y = 1;
      const c = new THREE.Mesh(new THREE.ConeGeometry(rand(1.5, 2.4), rand(4, 6), 6), leaf);
      c.position.y = 4;
      g.add(t, c);
      g.position.set(Math.cos(a) * d, 0, Math.sin(a) * d);
      g.scale.setScalar(rand(0.8, 1.5));
      scene.add(g);
    }
    // chão externo
    const outer = new THREE.Mesh(new THREE.CircleGeometry(200, 32), new THREE.MeshStandardMaterial({ color: 0x6d9a4a, roughness: 1 }));
    outer.rotation.x = -Math.PI / 2;
    outer.position.y = -0.02;
    scene.add(outer);
  }

  update(dt: number, camera: THREE.Camera) {
    this.t += dt;
    this.tree.update(dt, camera);
    this.rock.update(dt);
    this.dummy.update(dt);
    this.spawnRing.rotation.z += dt * 0.6;
    (this.spawnRing.material as THREE.MeshBasicMaterial).opacity = 0.45 + Math.sin(this.t * 3) * 0.15;
  }

  reset() {
    this.tree.reset();
    this.rock.reset();
    this.dummy.combo = 0;
    this.dummy.lastDamage = 0;
  }
}
