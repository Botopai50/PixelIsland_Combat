import * as THREE from 'three';
import type { PhysicsWorld } from '../physics/PhysicsWorld';
import type { HumanoidRig } from './HumanoidRig';
import { solveTwoBoneIK } from './IK';
import { clamp, damp } from '../core/math';

const THIGH = 0.43;
const SHIN = 0.42;

/**
 * IK de pés: cada pé se ajusta à altura real do chão embaixo dele (degraus,
 * rampas, bordas). O quadril desce o necessário para o pé mais baixo alcançar
 * o chão, e cada perna é resolvida por IK (o joelho do pé mais alto dobra).
 * Os pés ficam rentes ao chão. Funciona por cima da animação (passos, idle).
 */
export class FootIK {
  private offL = 0;
  private offR = 0;
  private pelvis = 0;
  private w = 0;
  private flat = 0.5;
  private p = new THREE.Vector3();
  private t = new THREE.Vector3();
  private pole = new THREE.Vector3();
  private fwd = new THREE.Vector3();
  private qRoot = new THREE.Quaternion();
  private qFoot = new THREE.Quaternion();
  private qParent = new THREE.Quaternion();

  constructor(private physics: PhysicsWorld) {}

  /** Chamar depois do animador (FK) e antes do IK dos braços. */
  /** @param flatten quanto o pé é alinhado ao chão (1 parado; baixo andando, para manter calcanhar/ponta). */
  update(dt: number, rig: HumanoidRig, enabled: boolean, flatten = 0.5) {
    this.flat = flatten;
    if (dt <= 0) return;
    this.w = damp(this.w, enabled ? 1 : 0, 12, dt);
    if (this.w < 0.01) {
      this.offL = this.offR = this.pelvis = 0;
      return;
    }
    const root = rig.root;
    root.updateMatrixWorld(true);
    const rootY = root.position.y;
    const J = rig.joints;
    const moving = this.flat < 0.5;
    const ground = (foot: THREE.Object3D) => {
      foot.getWorldPosition(this.p);
      const g = this.physics.groundHeight(this.p.x, this.p.z, rootY + 0.2, 0, 0);
      if (!Number.isFinite(g.y)) return 0;
      const d = g.y - rootY;
      // só DESCE o pé até um chão mais baixo (borda de degrau). Nunca levanta:
      // o corpo já se apoia na superfície mais alta, levantar só criava pernas estranhas.
      return clamp(d, -0.3, 0) * (moving ? 0.5 : 1);
    };
    this.offL = damp(this.offL, ground(J.footL) * this.w, 12, dt);
    this.offR = damp(this.offR, ground(J.footR) * this.w, 12, dt);
    // o quadril desce para o pé mais baixo alcançar o chão (nunca sobe)
    this.pelvis = damp(this.pelvis, Math.min(this.offL, this.offR, 0), 14, dt);
    rig.body.position.y += this.pelvis;
    root.updateMatrixWorld(true);

    root.getWorldQuaternion(this.qRoot);
    this.fwd.set(0, 0, 1).applyQuaternion(this.qRoot);
    this.leg(J.thighL, J.shinL, J.footL, this.offL - this.pelvis);
    this.leg(J.thighR, J.shinR, J.footR, this.offR - this.pelvis);
  }

  private leg(thigh: THREE.Object3D, shin: THREE.Object3D, foot: THREE.Object3D, lift: number) {
    if (Math.abs(lift) > 0.004) {
      foot.getWorldPosition(this.t);
      this.t.y += lift;
      // joelho sempre para frente do corpo (direção estável, não depende da pose animada)
      thigh.getWorldPosition(this.pole);
      this.pole.addScaledVector(this.fwd, 1.0);
      this.pole.y -= 0.3;
      solveTwoBoneIK(thigh, shin, THIGH, SHIN, this.t, this.pole, 1);
    }
    // pé rente ao chão: puxa a orientação do pé para "plana" (só o giro do corpo)
    foot.parent!.updateWorldMatrix(true, false);
    foot.parent!.getWorldQuaternion(this.qParent);
    this.qFoot.copy(this.qParent).invert().multiply(this.qRoot);
    foot.quaternion.slerp(this.qFoot, this.flat * this.w);
  }
}
