import * as THREE from 'three';
import type { PhysicsWorld, SurfaceMaterial } from './PhysicsWorld';

/**
 * Motor cinemático de personagem (jogador e inimigos usam o mesmo).
 * Integra velocidade, resolve paredes, sobe degraus pequenos, gruda no chão
 * em descidas/rampas e informa aterrissagens (para som, poeira e squash).
 */
export class CharacterMotor {
  position = new THREE.Vector3();
  velocity = new THREE.Vector3();
  radius = 0.38;
  height = 1.75;
  stepUp = 0.36;
  snapDown = 0.35;

  grounded = false;
  groundY = 0;
  surface: SurfaceMaterial = 'grass';
  timeSinceGrounded = 0;
  landedThisFrame = false;
  landSpeed = 0;
  hitWall = false;
  wallNormal = new THREE.Vector3();
  /** Deslocamento visual para suavizar degraus (o corpo "sobe" em vez de teleportar). */
  visualStepOffset = 0;

  constructor(public world: PhysicsWorld) {}

  teleport(p: THREE.Vector3) {
    this.position.copy(p);
    this.velocity.set(0, 0, 0);
    this.visualStepOffset = 0;
  }

  update(dt: number) {
    this.landedThisFrame = false;
    this.hitWall = false;
    if (dt <= 0) return;

    // --- horizontal com sub-passos para não atravessar paredes finas
    const hx = this.velocity.x * dt, hz = this.velocity.z * dt;
    const dist = Math.hypot(hx, hz);
    const steps = Math.max(1, Math.ceil(dist / (this.radius * 0.5)));
    for (let i = 0; i < steps; i++) {
      this.position.x += hx / steps;
      this.position.z += hz / steps;
      if (this.world.resolveCylinder(this.position, this.radius, this.height, this.grounded ? this.stepUp : 0.08, this.wallNormal)) {
        this.hitWall = true;
      }
    }
    if (this.hitWall) {
      // remove componente de velocidade contra a parede
      const vn = this.velocity.x * this.wallNormal.x + this.velocity.z * this.wallNormal.z;
      if (vn < 0) {
        this.velocity.x -= this.wallNormal.x * vn;
        this.velocity.z -= this.wallNormal.z * vn;
      }
    }

    // --- vertical
    const prevY = this.position.y;
    const g = this.world.groundHeight(this.position.x, this.position.z, prevY, this.grounded ? this.stepUp : 0.05, this.radius * 0.55);
    const groundY = g.y;
    const newY = prevY + this.velocity.y * dt;
    const wasGrounded = this.grounded;

    if (wasGrounded && this.velocity.y <= 0.01 && groundY >= prevY - this.snapDown) {
      // grudado no chão (subindo degrau ou descendo rampa)
      const delta = groundY - prevY;
      if (Math.abs(delta) > 0.05) this.visualStepOffset -= delta;
      this.position.y = groundY;
      this.velocity.y = 0;
      this.grounded = true;
    } else if (newY <= groundY) {
      this.landSpeed = -this.velocity.y;
      this.position.y = groundY;
      this.velocity.y = 0;
      this.grounded = true;
      if (!wasGrounded) this.landedThisFrame = true;
    } else {
      this.position.y = newY;
      this.grounded = false;
    }
    if (this.grounded) {
      this.groundY = groundY;
      this.surface = g.material;
      this.timeSinceGrounded = 0;
    } else {
      this.timeSinceGrounded += dt;
    }
    // queda para fora do mundo
    if (this.position.y < -30) {
      this.position.set(0, 2, 0);
      this.velocity.set(0, 0, 0);
    }
    this.visualStepOffset *= Math.exp(-18 * dt);
  }
}
