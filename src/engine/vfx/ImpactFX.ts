import * as THREE from 'three';
import { ParticleSystem } from './Particles';
import type { Tuning } from '../core/Tuning';
import { rand, pick } from '../core/math';

export type ImpactMaterial = 'flesh' | 'wood' | 'stone' | 'metal' | 'dummy' | 'leaf';

function makeStarTexture(): THREE.Texture {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.18, 'rgba(255,255,255,0.9)');
  grd.addColorStop(0.4, 'rgba(255,255,255,0.18)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  // raios
  g.globalCompositeOperation = 'lighter';
  g.fillStyle = 'rgba(255,255,255,0.85)';
  for (let i = 0; i < 4; i++) {
    g.save();
    g.translate(64, 64);
    g.rotate((i * Math.PI) / 4 + 0.2);
    g.beginPath();
    g.moveTo(-60, 0); g.lineTo(0, 3.5); g.lineTo(60, 0); g.lineTo(0, -3.5);
    g.closePath();
    g.fill();
    g.restore();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function makeRingTexture(): THREE.Texture {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(64, 64, 40, 64, 64, 62);
  grd.addColorStop(0, 'rgba(255,255,255,0)');
  grd.addColorStop(0.55, 'rgba(255,255,255,1)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

interface Flash {
  sprite: THREE.Sprite;
  life: number;
  max: number;
  size0: number;
  size1: number;
  alive: boolean;
}

/**
 * Receitas de impacto por material + flashes/anéis. Todos os efeitos saem no
 * ponto real de contato, orientados pela direção do golpe e pela normal.
 */
export class ImpactFX {
  readonly group = new THREE.Group();
  readonly particles = new ParticleSystem();
  private flashes: Flash[] = [];
  private starTex = makeStarTexture();
  private ringTex = makeRingTexture();
  private tmp = new THREE.Vector3();
  private tmp2 = new THREE.Vector3();

  constructor(private tuning: Tuning) {
    this.group.add(this.particles.group);
    for (let i = 0; i < 24; i++) {
      const mat = new THREE.SpriteMaterial({
        map: this.starTex, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: true, transparent: true, toneMapped: false,
      });
      const sprite = new THREE.Sprite(mat);
      sprite.visible = false;
      sprite.renderOrder = 10;
      this.group.add(sprite);
      this.flashes.push({ sprite, life: 0, max: 1, size0: 1, size1: 1, alive: false });
    }
  }

  private get on() {
    return this.tuning.particlesEnabled;
  }
  private n(base: number, intensity: number) {
    return Math.max(1, Math.round(base * intensity * this.tuning.particleMul));
  }

  /** Clarão curtíssimo no ponto de contato (estrela / anel). */
  flash(pos: THREE.Vector3, color: number, size: number, life = 0.09, ring = false, grow = 1.6) {
    if (!this.on) return;
    const f = this.flashes.find((x) => !x.alive) ?? this.flashes[0];
    f.alive = true;
    f.life = f.max = life;
    f.size0 = size;
    f.size1 = size * grow;
    const m = f.sprite.material as THREE.SpriteMaterial;
    m.map = ring ? this.ringTex : this.starTex;
    m.color.set(color);
    m.rotation = Math.random() * Math.PI;
    f.sprite.position.copy(pos);
    f.sprite.scale.setScalar(size);
    f.sprite.visible = true;
  }

  /** Direção de espalhamento: mistura normal da superfície e direção do golpe. */
  private sprayDir(n: THREE.Vector3, d: THREE.Vector3, wn: number, wd: number, spread: number, out: THREE.Vector3) {
    out.copy(n).multiplyScalar(wn).addScaledVector(d, wd);
    out.x += rand(-spread, spread);
    out.y += rand(-spread, spread) + spread * 0.4;
    out.z += rand(-spread, spread);
    return out.normalize();
  }

  /**
   * Impacto de golpe/flecha.
   * @param dir direção de deslocamento do golpe
   * @param normal normal aproximada da superfície atingida (apontando para fora)
   * @param intensity 0..1.5 força da ação
   */
  impact(mat: ImpactMaterial, pos: THREE.Vector3, dir: THREE.Vector3, normal: THREE.Vector3, intensity: number, floorY = 0) {
    if (!this.on) return;
    const P = this.particles;
    const t = this.tmp;
    const I = intensity;
    switch (mat) {
      case 'flesh': {
        this.flash(pos, 0xfff1d0, 0.55 + I * 0.5, 0.07 + I * 0.03);
        for (let i = 0; i < this.n(10, I); i++) {
          this.sprayDir(normal, dir, 0.6, 0.8, 0.6, t);
          P.spawn('glow', { pos, vel: t.multiplyScalar(rand(4, 9) * (0.6 + I)), color: pick([0xffd28a, 0xffffff, 0xff9f5a]), size: rand(0.03, 0.06), life: rand(0.12, 0.25), drag: 6, stretch: 3, gravity: 6 });
        }
        for (let i = 0; i < this.n(7, I); i++) {
          this.sprayDir(normal, dir, 0.7, 0.6, 0.7, t);
          P.spawn('solid', { pos, vel: t.multiplyScalar(rand(2, 5) * (0.6 + I)), color: pick([0x5a1e3a, 0x7a2c4e, 0x3c1428]), size: rand(0.04, 0.09), life: rand(0.35, 0.6), gravity: 14, drag: 1, floorY, endScale: 0 });
        }
        break;
      }
      case 'dummy': {
        this.flash(pos, 0xfff4c8, 0.5 + I * 0.4, 0.07);
        for (let i = 0; i < this.n(14, I); i++) {
          this.sprayDir(normal, dir, 0.7, 0.7, 0.8, t);
          P.spawn('solid', { pos, vel: t.multiplyScalar(rand(2, 6) * (0.6 + I)), color: pick([0xe8cf7a, 0xd4b45c, 0xf2e2a0]), size: rand(0.12, 0.2), shape: [0.12, 0.12, 1], life: rand(0.6, 1.1), gravity: 7, drag: 2.5, floorY, spin: 10, endScale: 0.6 });
        }
        break;
      }
      case 'wood':
      case 'leaf': {
        // lascas alongadas + serragem
        this.flash(pos, 0xfff0c0, 0.35 + I * 0.3, 0.06);
        for (let i = 0; i < this.n(12, I); i++) {
          this.sprayDir(normal, dir, 0.9, 0.5, 0.55, t);
          P.spawn('solid', { pos, vel: t.multiplyScalar(rand(3, 7) * (0.6 + I * 0.8)), color: pick([0xc8914f, 0xe0b57a, 0x9c6a3a, 0xf0d2a0]), size: rand(0.1, 0.2), shape: [0.35, 0.18, 1], life: rand(0.8, 1.4), gravity: 16, drag: 0.8, floorY, spin: 14, endScale: 0.8, bounce: 0.3 });
        }
        for (let i = 0; i < this.n(6, I); i++) {
          this.sprayDir(normal, dir, 1, 0.2, 0.9, t);
          P.spawn('puff', { pos, vel: t.multiplyScalar(rand(0.6, 1.8)), color: 0xd9bc8c, size: rand(0.1, 0.2), life: rand(0.4, 0.7), drag: 3, gravity: -0.3, endScale: 2.4 });
        }
        break;
      }
      case 'stone': {
        // fragmentos + poeira + faíscas curtas
        this.flash(pos, 0xffffff, 0.4 + I * 0.3, 0.06);
        for (let i = 0; i < this.n(10, I); i++) {
          this.sprayDir(normal, dir, 1, 0.4, 0.6, t);
          P.spawn('solid', { pos, vel: t.multiplyScalar(rand(3, 7) * (0.6 + I * 0.7)), color: pick([0x8d8f99, 0x6f717b, 0xa6a8b2, 0x5c5e66]), size: rand(0.07, 0.16), life: rand(0.8, 1.3), gravity: 18, drag: 0.5, floorY, spin: 10, endScale: 0.7, bounce: 0.4 });
        }
        for (let i = 0; i < this.n(8, I); i++) {
          this.sprayDir(normal, dir, 1, 0.1, 1, t);
          P.spawn('puff', { pos: this.tmp2.copy(pos).addScaledVector(t, 0.1), vel: t.multiplyScalar(rand(0.5, 2)), color: 0xbdb7ad, size: rand(0.15, 0.3), life: rand(0.6, 1.1), drag: 2.5, gravity: -0.2, endScale: 3 });
        }
        for (let i = 0; i < this.n(5, I); i++) {
          this.sprayDir(normal, dir, 1, 0.3, 0.8, t);
          P.spawn('glow', { pos, vel: t.multiplyScalar(rand(5, 10)), color: 0xffe9b0, size: rand(0.02, 0.035), life: rand(0.1, 0.2), stretch: 4, gravity: 10 });
        }
        break;
      }
      case 'metal': {
        // muitas faíscas refletidas + clarão forte
        this.flash(pos, 0xfff2b0, 0.6 + I * 0.4, 0.08);
        this.flash(pos, 0xffc860, 0.35, 0.16, true, 3);
        // reflexão do golpe na superfície
        const r = this.tmp2.copy(dir).addScaledVector(normal, -2 * dir.dot(normal)).normalize();
        for (let i = 0; i < this.n(22, I); i++) {
          this.sprayDir(normal, r, 0.7, 0.9, 0.7, t);
          P.spawn('glow', { pos, vel: t.multiplyScalar(rand(5, 13) * (0.7 + I * 0.5)), color: pick([0xffe08a, 0xffb347, 0xffffff]), size: rand(0.02, 0.04), life: rand(0.15, 0.4), stretch: 5, gravity: 14, drag: 1.5, floorY, bounce: 0.5 });
        }
        break;
      }
    }
  }

  /** Aparo: anel ciano + estrela dourada + faíscas em leque. */
  parry(pos: THREE.Vector3, dir: THREE.Vector3) {
    if (!this.on) return;
    this.flash(pos, 0xffffff, 1.4, 0.12);
    this.flash(pos, 0x7ff6ff, 0.6, 0.3, true, 5);
    this.flash(pos, 0xffe07a, 0.4, 0.22, true, 3.5);
    const t = this.tmp;
    for (let i = 0; i < this.n(36, 1); i++) {
      const a = (i / 36) * Math.PI * 2;
      t.set(Math.cos(a), Math.sin(a) * 0.8 + 0.2, Math.sin(a * 1.3)).normalize().addScaledVector(dir, -0.6).normalize();
      this.particles.spawn('glow', { pos, vel: t.multiplyScalar(rand(6, 12)), color: pick([0x9ffcff, 0xffffff, 0xffe07a]), size: rand(0.025, 0.045), life: rand(0.2, 0.45), stretch: 4, drag: 3, gravity: 3 });
    }
  }

  /** Bloqueio normal: faíscas contidas e poeira de impacto no escudo. */
  block(pos: THREE.Vector3, dir: THREE.Vector3, normal: THREE.Vector3) {
    if (!this.on) return;
    this.flash(pos, 0xffe8b0, 0.55, 0.07);
    const t = this.tmp;
    for (let i = 0; i < this.n(12, 1); i++) {
      this.sprayDir(normal, dir, 1, -0.3, 0.7, t);
      this.particles.spawn('glow', { pos, vel: t.multiplyScalar(rand(3, 7)), color: pick([0xffd580, 0xffffff]), size: rand(0.02, 0.035), life: rand(0.1, 0.25), stretch: 4, gravity: 10 });
    }
    for (let i = 0; i < this.n(4, 1); i++) {
      this.sprayDir(normal, dir, 1, 0, 1, t);
      this.particles.spawn('puff', { pos, vel: t.multiplyScalar(rand(0.5, 1.5)), color: 0xd8d2c6, size: 0.15, life: 0.5, drag: 3, endScale: 2.2 });
    }
  }

  /** Poeira no chão (aterrissagem, passos fortes, queda de árvore). */
  dust(pos: THREE.Vector3, amount: number, radius = 0.4, color = 0xcfc6b0) {
    if (!this.on) return;
    const t = this.tmp;
    for (let i = 0; i < this.n(8, amount); i++) {
      const a = Math.random() * Math.PI * 2;
      t.set(Math.cos(a), 0.15, Math.sin(a));
      this.particles.spawn('puff', {
        pos: this.tmp2.copy(pos).addScaledVector(t, radius * rand(0.3, 1)).setY(pos.y + 0.05),
        vel: t.multiplyScalar(rand(0.8, 2.2) * (0.5 + amount)), color, size: rand(0.12, 0.25) * (0.6 + amount * 0.5),
        life: rand(0.4, 0.8), drag: 3.5, gravity: -0.4, endScale: 2.6,
      });
    }
  }

  /** Brilhos coloridos (coleta, carga completa, spawn). */
  sparkle(pos: THREE.Vector3, color: number, count = 12, speed = 2.5) {
    if (!this.on) return;
    const t = this.tmp;
    for (let i = 0; i < this.n(count, 1); i++) {
      t.set(rand(-1, 1), rand(0.2, 1.4), rand(-1, 1)).normalize();
      this.particles.spawn('glow', { pos, vel: t.multiplyScalar(rand(0.5, 1) * speed), color, size: rand(0.03, 0.06), life: rand(0.3, 0.6), drag: 3, gravity: -1, endScale: 0 });
    }
  }

  /** Fumaça de morte/desaparecimento. */
  poof(pos: THREE.Vector3, color = 0x2a1f33, amount = 1) {
    if (!this.on) return;
    const t = this.tmp;
    for (let i = 0; i < this.n(18, amount); i++) {
      t.set(rand(-1, 1), rand(0, 1.2), rand(-1, 1)).normalize();
      this.particles.spawn('puff', { pos: this.tmp2.copy(pos).addScaledVector(t, rand(0, 0.5)), vel: t.multiplyScalar(rand(1, 3)), color: pick([color, 0x4b3a5c, 0x6a5a7a]), size: rand(0.25, 0.45), life: rand(0.6, 1.1), drag: 3, gravity: -1.2, endScale: 2.2 });
    }
    this.sparkle(pos, 0xc28cff, 10, 3);
  }

  update(dt: number, camera: THREE.Camera) {
    this.particles.update(dt, camera);
    for (const f of this.flashes) {
      if (!f.alive) continue;
      f.life -= dt;
      if (f.life <= 0) {
        f.alive = false;
        f.sprite.visible = false;
        continue;
      }
      const k = 1 - f.life / f.max;
      f.sprite.scale.setScalar(f.size0 + (f.size1 - f.size0) * k);
      (f.sprite.material as THREE.SpriteMaterial).opacity = 1 - k * k;
    }
  }

  clear() {
    this.particles.clear();
    for (const f of this.flashes) {
      f.alive = false;
      f.sprite.visible = false;
    }
  }
}
