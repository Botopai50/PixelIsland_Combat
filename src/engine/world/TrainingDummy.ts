import * as THREE from 'three';
import type { GameContext } from '../core/Context';
import { emptyResult, newId, type Damageable, type HitInfo, type HitResult, type Hurtbox } from '../combat/types';
import { makeBoxCollider } from '../physics/PhysicsWorld';
import { Spring } from '../core/math';

/**
 * Boneco de treino: nunca morre, balança na direção do golpe (mola 2D),
 * tem capacete de METAL (golpes na cabeça fazem clangor/faíscas) e mede
 * dano por golpe, combo e DPS para comparar ajustes.
 */
export class TrainingDummy implements Damageable {
  readonly id = newId();
  team = 'neutral' as const;
  alive = true;
  material = 'dummy' as const;
  lockable = true;
  hurtboxes: Hurtbox[];
  readonly root = new THREE.Group();
  private body = new THREE.Group();
  stickRoot: THREE.Object3D;
  private tiltX = new Spring(90, 5);
  private tiltZ = new Spring(90, 5);
  private twist = new Spring(120, 6);
  private flashT = 0;
  private mats: THREE.MeshStandardMaterial[] = [];
  // estatísticas
  lastDamage = 0;
  combo = 0;
  private comboT = 0;
  private dmgWindow: { t: number; d: number }[] = [];
  private time = 0;
  label: HTMLDivElement | null = null;

  constructor(private ctx: GameContext, public pos: THREE.Vector3, public yaw = 0) {
    this.root.position.copy(pos);
    this.root.rotation.y = yaw;
    const M = (c: number, metal = 0) => {
      const m = new THREE.MeshStandardMaterial({ color: c, roughness: metal ? 0.3 : 0.9, metalness: metal, flatShading: true });
      m.emissive = new THREE.Color(0);
      this.mats.push(m);
      return m;
    };
    const wood = M(0x7a5232), straw = M(0xd9bf6a), rope = M(0x8a6a3a), metal = M(0xaab2bd, 0.85), cloth = M(0xb03a3a);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 1.0, 6), wood);
    post.position.y = 0.5;
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 0.15, 8), wood);
    base.position.y = 0.07;
    this.root.add(post, base);
    this.body.position.y = 0.95;
    this.root.add(this.body);
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.24, 0.75, 8), straw);
    torso.position.y = 0.4;
    const band1 = new THREE.Mesh(new THREE.CylinderGeometry(0.285, 0.285, 0.05, 8), rope);
    band1.position.y = 0.2;
    const band2 = band1.clone();
    band2.position.y = 0.6;
    const arms = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.2, 6), wood);
    arms.rotation.z = Math.PI / 2;
    arms.position.y = 0.62;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), straw);
    head.position.y = 0.98;
    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.23, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.55), metal);
    helmet.position.y = 1.0;
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.03, 12), metal);
    brim.position.y = 0.98;
    const target = new THREE.Mesh(new THREE.CircleGeometry(0.14, 12), cloth);
    target.position.set(0, 0.45, 0.285);
    for (const m of [torso, band1, band2, arms, head, helmet, brim, target, post, base]) {
      m.castShadow = true;
      m.receiveShadow = true;
    }
    this.body.add(torso, band1, band2, arms, head, helmet, brim, target);
    this.stickRoot = this.body;
    ctx.scene.add(this.root);
    this.hurtboxes = [
      { a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.32, tag: 'body' },
      { a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.25, tag: 'head', material: 'metal' },
    ];
    ctx.physics.add({ ...makeBoxCollider(pos.x, pos.z, 0.3, 0.3, pos.y, pos.y + 1.7, yaw, 'wood'), mesh: torso, owner: this });
    ctx.combat.add(this);
    this.updateHurtboxes();
  }

  center(out: THREE.Vector3) {
    return out.copy(this.pos).setY(this.pos.y + 1.3);
  }

  private updateHurtboxes() {
    this.body.updateWorldMatrix(true, false);
    this.body.localToWorld(this.hurtboxes[0].a.set(0, 0.05, 0));
    this.body.localToWorld(this.hurtboxes[0].b.set(0, 0.7, 0));
    this.body.localToWorld(this.hurtboxes[1].a.set(0, 1.0, 0));
    this.hurtboxes[1].b.copy(this.hurtboxes[1].a);
  }

  receiveHit(hit: HitInfo): HitResult {
    const r = emptyResult(hit.hurtbox.tag === 'head' ? 'metal' : 'dummy');
    r.damage = Math.round(hit.damage * (hit.hurtbox.tag === 'head' ? 1.25 : 1));
    // inclina na direção do golpe (em espaço local do boneco)
    const d = hit.dir.clone().setY(0).normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), -this.yaw);
    const imp = 2 + hit.strength * 6 + (hit.projectile ? 1 : 0);
    this.tiltX.impulse(d.z * imp);
    this.tiltZ.impulse(-d.x * imp);
    this.twist.impulse((Math.random() - 0.5) * imp * 0.6);
    if (this.ctx.tuning.hitFlashEnabled) this.flashT = 0.08;
    this.lastDamage = r.damage;
    this.combo = this.comboT > 0 ? this.combo + 1 : 1;
    this.comboT = 1.5;
    this.dmgWindow.push({ t: this.time, d: r.damage });
    return r;
  }

  get dps() {
    const w = this.dmgWindow.filter((x) => this.time - x.t < 3);
    this.dmgWindow = w;
    return w.reduce((s, x) => s + x.d, 0) / 3;
  }

  update(dt: number) {
    this.time += dt;
    if (dt <= 0) return;
    this.tiltX.update(dt);
    this.tiltZ.update(dt);
    this.twist.update(dt);
    this.body.rotation.set(this.tiltX.value * 0.12, this.twist.value * 0.1, this.tiltZ.value * 0.12);
    this.comboT -= dt;
    this.flashT -= dt;
    const k = this.flashT > 0 ? 0.45 : 0;
    for (const m of this.mats) m.emissive.setScalar(k);
    this.updateHurtboxes();
  }
}
