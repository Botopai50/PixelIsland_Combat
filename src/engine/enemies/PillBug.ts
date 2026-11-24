import * as THREE from 'three';
import type { GameContext } from '../core/Context';
import type { EnemyTarget } from './Enemy';
import { emptyResult, type HitInfo, type HitResult } from '../combat/types';
import { damp, dampAngle } from '../core/math';
import { CharacterMotor } from '../physics/CharacterMotor';
import { BasePixelAnimal, build27Pack, sdCapsule, sdEllipsoid, type SdfEvaluator } from './Animals';
import { registerAnimalSpritePack } from './AnimalSpriteCache';
import { sampleAnimalCycle } from './AnimalAnimation';

export const PILLBUG_IDLE = ['idle0', 'idle1', 'idle2'] as const;
export const PILLBUG_WALK = ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'] as const;
export const PILLBUG_CURL = ['curl0', 'curl1', 'curl2', 'curl3'] as const;
export type PillBugPose = typeof PILLBUG_IDLE[number] | typeof PILLBUG_WALK[number] | typeof PILLBUG_CURL[number];
export const PILLBUG_PW = 36, PILLBUG_PH = 30, PILLBUG_W = .57, PILLBUG_H = .475;

const palette: Record<string, [number, number, number]> = {
  k: [19, 22, 27], seam: [37, 42, 52], shell0: [53, 61, 73],
  shell1: [82, 97, 113], shell2: [129, 147, 156], shell3: [170, 184, 185],
  leg: [148, 126, 109], eye: [12, 15, 20],
};
const packs = new Map<PillBugPose, ReturnType<typeof build27Pack>>();

function buildPillBugPosePack(pose: PillBugPose) {
  const cached = packs.get(pose);
  if (cached) return cached;
  const curled = pose.startsWith('curl');
  const walking = pose.startsWith('walk');
  const frame = Number(pose.at(-1));
  const curl = curled ? (frame + 1) / 4 : 0;
  const phase = walking ? frame * Math.PI / 3 : frame * 2;
  const shellY = -.15 + curl * .12;
  const bodyLength = .74 - curl * .31;
  const width = .34 + curl * .09;
  const height = .26 + curl * .17;

  const evaluate: SdfEvaluator = (x, y, z) => {
    const ax = Math.abs(x);
    let d = sdEllipsoid(x,y,z,0,shellY,0,width,height,bodyLength);
    let mat = 'shell';
    const add = (distance: number, kind: string) => {
      if (distance < d) { d = distance; mat = kind; }
    };

    if (curl < 1) {
      const exposed = 1 - curl;
      const headZ = bodyLength * .83;
      add(sdEllipsoid(x,y,z,0,shellY-.08,headZ,.23,.16,.20*exposed+.035),'shell');
      if (curl < .5 && z > headZ) {
        add(sdEllipsoid(ax,y,z,.16,shellY-.04,headZ+.10,.047,.044,.046),'eye');
        const feeler = Math.sin(phase + (x < 0 ? 1 : 0)) * .042;
        add(sdCapsule(ax,y,z,.085,shellY-.07,headZ+.12,.19,shellY+.01+feeler,headZ+.28,.041,.025),'leg');
        add(sdCapsule(ax,y,z,.19,shellY+.01+feeler,headZ+.28,.28,shellY+.025,headZ+.40,.025,.014),'leg');
      }
      if (y < shellY+.02) {
        // Seven pairs of short legs step in a travelling wave.
        for (let i = 0; i < 7; i++) {
          const legZ = (.47 - i * .15) * exposed;
          const swing = walking ? Math.sin(phase + i * 1.4 + (x < 0 ? Math.PI : 0)) : 0;
          const footY = -.53 + curl * .42 + Math.max(0, swing) * .075;
          add(sdCapsule(ax,y,z,.15,shellY-.12,legZ,.28+exposed*.09,footY,legZ+swing*.085,.034,.019),'leg');
        }
      }
    }
    return { d, mat };
  };

  const pack = build27Pack(PILLBUG_PW, PILLBUG_PH, 1.16, .967, palette, evaluate, (mat, shade, x, y, z) => {
    if (mat !== 'shell') return mat;
    const plate = (z + .11 * (x / width) ** 2) / bodyLength * 3.6;
    const band = Math.abs(plate - Math.round(plate));
    if (band < .105) return 'seam';
    if (band < .23 && shade > .50) return 'shell3';
    if (y < shellY - .04 || shade < .27) return 'shell0';
    return shade > .65 ? 'shell2' : 'shell1';
  });
  packs.set(pose, pack);
  return pack;
}

export function getPillBugPosePack(pose: PillBugPose) {
  return registerAnimalSpritePack(buildPillBugPosePack(pose), {
    module: './PillBug.ts', factory: 'getPillBugPosePack', args: [pose],
  }, buildPillBugPosePack);
}

export class PillBug extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  private readonly home: THREE.Vector3;
  private readonly direction: number;
  private curl = 0;
  private alarm = 0;
  private clock = 0;
  private gait = 0;
  get position() { return this.motor.position; }

  constructor(ctx: GameContext, start: THREE.Vector3) {
    super(ctx, getPillBugPosePack('idle0').getView(4, 0)!, PILLBUG_PW, PILLBUG_PH, PILLBUG_W, PILLBUG_H, 'PillBugBillboard');
    this.team = 'neutral';
    this.lockable = false;
    this.hp = this.maxHp = 12;
    this.motor = new CharacterMotor(ctx.physics);
    this.motor.height = .19;
    this.motor.radius = .10;
    this.motor.teleport(start);
    this.bindAnimalMotor(this.motor);
    this.home = start.clone();
    this.direction = this.facing;
    this.hurtboxes.push({ a: start.clone(), b: start.clone(), radius: .14, tag: 'body' });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3) {
    out.copy(this.position);
    out.y += .13;
    return out;
  }

  private syncHurtbox() {
    const body = this.hurtboxes[0];
    this.center(body.a);
    body.b.copy(body.a);
    body.enabled = this.alive;
    this.stickRoot.position.copy(body.a);
  }

  receiveHit(hit: HitInfo): HitResult {
    const result = emptyResult();
    if (!this.alive) { result.ignored = true; return result; }
    result.damage = Math.min(this.hp, hit.damage * (this.curl >= .75 ? .35 : 1));
    this.hp -= result.damage;
    this.alive = this.hp > 0;
    result.killed = !this.alive;
    this.flash = 1;
    this.alarm = 1.5;
    this.syncHurtbox();
    return result;
  }

  update(dt: number, target: EnemyTarget | null, camera: THREE.Camera, buffer?: THREE.Vector2) {
    if (dt > 0) {
      this.clock += dt;
      if (!this.alive) this.deadT += dt;
      this.flash = Math.max(0, this.flash - dt * 5);
      const nearby = target?.alive && this.position.distanceToSquared(target.position) < 1.25 ** 2;
      this.alarm = nearby ? 1.25 : Math.max(0, this.alarm - dt);
      const curling = !this.alive || this.alarm > 0;
      this.curl = THREE.MathUtils.clamp(this.curl + dt * (curling ? 3.8 : -2.6), 0, 1);

      const vel = this.motor.velocity;
      const roam = this.alive && !curling && this.curl === 0 && this.clock % 4 < 3;
      if (roam) {
        const dx = this.home.x - this.position.x, dz = this.home.z - this.position.z;
        const yaw = dx*dx + dz*dz > 1.8 ** 2 ? Math.atan2(dx, dz) : this.direction + 1.7 * Math.sin(this.clock * .72);
        this.facing = dampAngle(this.facing, yaw, 3.5, dt);
      }
      const speed = roam ? .53 : 0;
      vel.x = damp(vel.x, Math.sin(this.facing) * speed, 14, dt);
      vel.z = damp(vel.z, Math.cos(this.facing) * speed, 14, dt);
      vel.y -= 20 * dt;
      this.motor.update(dt);
      this.gait += dt * this.motor.horizontalSpeed * 8;
      this.syncHurtbox();
    }

    const pose = this.curl > 0
      ? PILLBUG_CURL[Math.min(3, Math.floor(this.curl * 4))]
      : this.motor.horizontalSpeed > .12
        ? sampleAnimalCycle(PILLBUG_WALK, this.gait)
        : sampleAnimalCycle(PILLBUG_IDLE, this.clock * 2);
    this.renderBillboard(getPillBugPosePack(pose), this.position.y + .15, camera, buffer);
  }
}
