import { sampleAnimalCycle } from './AnimalAnimation';
import { registerAnimalSpritePack } from './AnimalSpriteCache';
import * as THREE from 'three';
import type { GameContext } from '../core/Context';
import type { HitInfo, HitResult } from '../combat/types';
import { emptyResult } from '../combat/types';
import type { EnemyTarget } from './Enemy';
import type { Boar27Pack } from './Boar';
import {
  ANIMAL_PPU,
  BasePixelAnimal,
  angleDiff,
  build27Pack,
  sdCapsule,
  sdEllipsoid,
  smin,
  type ColorShaper,
  type SdfEvaluator,
} from './Animals';
import { CharacterMotor } from '../physics/CharacterMotor';
import { damp, rand } from '../core/math';

function pickCycle<T>(frames: readonly T[], idx: number): T {
  return sampleAnimalCycle(frames, idx);
}

// ============================================================================
// EMA (Flagship South American Greater Rhea) — 48×62
// ============================================================================
export type RheaPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'walk0' | 'walk1' | 'walk2' | 'walk3' | 'walk4' | 'walk5'
  | 'sprint0' | 'sprint1' | 'sprint2' | 'sprint3' | 'sprint4' | 'sprint5'
  | 'peck0' | 'peck1' | 'peck2';

export const RHEA_PW = 48;
export const RHEA_PH = 62;
export const RHEA_W = RHEA_PW / ANIMAL_PPU;
export const RHEA_H = RHEA_PH / ANIMAL_PPU;

/**
 * Fluffy ash-grey / dusty-silver-taupe drooping plumage + feathered pale-grey neck +
 * signature dark charcoal-black crescent bib/collar at neck base & upper chest +
 * pale cream-white throat/belly + tan-grey bill & 3-toed legs.
 */
const RHEA_PAL: Record<string, [number, number, number]> = {
  k:  [0x10, 0x11, 0x15], // crisp 1px dark outline / dark eyes / claws
  c0: [0x1c, 0x1e, 0x26], // dark charcoal-black crescent bib/collar shadow
  c1: [0x2e, 0x32, 0x3e], // charcoal-black crescent bib/collar & crown stripe
  r0: [0x52, 0x50, 0x4c], // deep ash-taupe plumage shadow
  r1: [0x72, 0x6f, 0x68], // dusty ash-grey body plumage shadow
  r2: [0x94, 0x90, 0x88], // ash-grey / silver-taupe body & wing plume midtone
  r3: [0xb6, 0xb2, 0xa8], // warm silver-grey highlight & feathered neck
  r4: [0xd8, 0xd4, 0xca], // sunlit pale silver-cream plume rim
  W:  [0xf5, 0xf3, 0xec], // pale cream-white throat, lower belly & eye glint
  l0: [0x8a, 0x7a, 0x62], // tan-grey leg & bill shadow
  l1: [0xb8, 0xa6, 0x8a], // tan-grey legs & flat horn-grey bill
};

interface RheaPose {
  bodyY: number;
  neckDip: number;   // 0 = upright, 1 = dipped down pecking
  neckLean: number;  // forward lean during sprint
  wingFlare: number; // 0 = draped plumes, 1 = raised like sails when sprinting!
  lSwing: number;
  lLift: number;
  rSwing: number;
  rLift: number;
}

const RHEA_POSES: Record<RheaPoseName, RheaPose> = {
  idle0:   { bodyY: 0.00,  neckDip: 0.0,  neckLean: 0.00, wingFlare: 0.0,  lSwing: 0.02,  lLift: 0.0,  rSwing: -0.02, rLift: 0.0 },
  idle1:   { bodyY: 0.015, neckDip: 0.0,  neckLean: 0.02, wingFlare: 0.04, lSwing: 0.02,  lLift: 0.0,  rSwing: -0.02, rLift: 0.0 },
  idle2:   { bodyY: -0.01, neckDip: 0.0,  neckLean: -0.02,wingFlare: 0.0,  lSwing: 0.02,  lLift: 0.0,  rSwing: -0.02, rLift: 0.0 },

  walk0:   { bodyY: 0.01,  neckDip: 0.0,  neckLean: 0.05, wingFlare: 0.08, lSwing: 0.24,  lLift: 0.18, rSwing: -0.18, rLift: 0.0 },
  walk1:   { bodyY: 0.03,  neckDip: 0.0,  neckLean: 0.07, wingFlare: 0.10, lSwing: 0.14,  lLift: 0.05, rSwing: -0.08, rLift: 0.0 },
  walk2:   { bodyY: 0.00,  neckDip: 0.0,  neckLean: 0.04, wingFlare: 0.06, lSwing: -0.04, lLift: 0.0,  rSwing: 0.08,  rLift: 0.12 },
  walk3:   { bodyY: 0.01,  neckDip: 0.0,  neckLean: 0.05, wingFlare: 0.08, lSwing: -0.18, lLift: 0.0,  rSwing: 0.24,  rLift: 0.18 },
  walk4:   { bodyY: 0.03,  neckDip: 0.0,  neckLean: 0.07, wingFlare: 0.10, lSwing: -0.08, lLift: 0.0,  rSwing: 0.14,  rLift: 0.05 },
  walk5:   { bodyY: 0.00,  neckDip: 0.0,  neckLean: 0.04, wingFlare: 0.06, lSwing: 0.08,  lLift: 0.12, rSwing: -0.04, rLift: 0.0 },

  sprint0: { bodyY: 0.02,  neckDip: 0.0,  neckLean: 0.16, wingFlare: 0.92, lSwing: 0.42,  lLift: 0.30, rSwing: -0.36, rLift: 0.10 },
  sprint1: { bodyY: 0.06,  neckDip: 0.0,  neckLean: 0.18, wingFlare: 1.00, lSwing: 0.24,  lLift: 0.10, rSwing: -0.18, rLift: 0.22 },
  sprint2: { bodyY: -0.02, neckDip: 0.0,  neckLean: 0.14, wingFlare: 0.85, lSwing: -0.10, lLift: 0.0,  rSwing: 0.16,  rLift: 0.26 },
  sprint3: { bodyY: 0.02,  neckDip: 0.0,  neckLean: 0.16, wingFlare: 0.92, lSwing: -0.36, lLift: 0.10, rSwing: 0.42,  rLift: 0.30 },
  sprint4: { bodyY: 0.06,  neckDip: 0.0,  neckLean: 0.18, wingFlare: 1.00, lSwing: -0.18, lLift: 0.22, rSwing: 0.24,  rLift: 0.10 },
  sprint5: { bodyY: -0.02, neckDip: 0.0,  neckLean: 0.14, wingFlare: 0.85, lSwing: 0.16,  lLift: 0.26, rSwing: -0.10, rLift: 0.0 },

  peck0:   { bodyY: -0.02, neckDip: 0.48, neckLean: 0.00, wingFlare: 0.0,  lSwing: 0.04,  lLift: 0.0,  rSwing: -0.04, rLift: 0.0 },
  peck1:   { bodyY: -0.04, neckDip: 1.00, neckLean: 0.00, wingFlare: 0.0,  lSwing: 0.04,  lLift: 0.0,  rSwing: -0.04, rLift: 0.0 },
  peck2:   { bodyY: -0.02, neckDip: 0.60, neckLean: 0.00, wingFlare: 0.0,  lSwing: 0.04,  lLift: 0.0,  rSwing: -0.04, rLift: 0.0 },
};

const RHEA_IDLE: readonly RheaPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const RHEA_WALK: readonly RheaPoseName[] = ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'];
const RHEA_SPRINT: readonly RheaPoseName[] = ['sprint0', 'sprint1', 'sprint2', 'sprint3', 'sprint4', 'sprint5'];
const RHEA_PECK: readonly RheaPoseName[] = ['peck0', 'peck1', 'peck2'];

const rheaCache = new Map<RheaPoseName, Boar27Pack>();

 function buildRheaPosePack(pose: RheaPoseName): Boar27Pack {
  let pack = rheaCache.get(pose);
  if (!pack) {
    const P = RHEA_POSES[pose];
    const by = 0.06 + P.bodyY;
    const dip = P.neckDip;

    // Feathered pale-grey S-neck & head control points
    const nBaseY = by + 0.08;
    const nBaseZ = 0.24;

    const nMidY = by + 0.36 * (1 - dip) - 0.18 * dip;
    const nMidZ = 0.28 + P.neckLean * 0.5 + dip * 0.18;

    const hy = by + 0.72 * (1 - dip) - 0.68 * dip;
    const hz = 0.24 + P.neckLean + dip * 0.26;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // 1. Fluffy ash-grey drooping ratite body & draping rump plumes
      const torso = sdEllipsoid(x, y, z, 0, by + 0.02, -0.02, 0.23, 0.21, 0.34);
      const chest = sdEllipsoid(x, y, z, 0, by + 0.03, 0.18, 0.185, 0.175, 0.18);
      const rumpDrape = sdCapsule(x, y, z, 0, by + 0.02, -0.22, 0, by - 0.14, -0.46, 0.17, 0.075);
      let body = smin(smin(torso, chest, 0.08), rumpDrape, 0.07);

      // 2. Large loose grey wing plumes (draped at rest, raised like sails when sprinting!)
      const wf = P.wingFlare;
      let wings = 99;
      for (let side = -1; side <= 1; side += 2) {
        const wx = side * (0.21 + wf * 0.28);
        const wy = by + 0.03 + wf * 0.22;
        const wz = -0.06 - wf * 0.04;
        const plume1 = sdCapsule(x, y, z, side * 0.16, by + 0.08, 0.12, wx, wy, wz, 0.095, 0.075);
        const plume2 = sdCapsule(x, y, z, wx, wy, wz, side * (0.19 + wf * 0.34), by - 0.10 + wf * 0.24, -0.28, 0.085, 0.048);
        wings = Math.min(wings, smin(plume1, plume2, 0.05));
      }
      body = smin(body, wings, 0.055);

      // 3. Feathered pale-grey neck & small ratite head
      const neck1 = sdCapsule(x, y, z, 0, nBaseY, nBaseZ, 0, nMidY, nMidZ, 0.095, 0.068);
      const neck2 = sdCapsule(x, y, z, 0, nMidY, nMidZ, 0, hy - 0.02, hz - 0.02, 0.066, 0.058);
      const head = sdEllipsoid(x, y, z, 0, hy, hz, 0.082, 0.078, 0.105);
      body = smin(body, smin(smin(neck1, neck2, 0.045), head, 0.035), 0.055);

      // 4. Flat horn-grey ratite bill
      const billTipY = hy - 0.015 - dip * 0.08;
      const billTipZ = hz + 0.185 * (1 - dip * 0.35);
      const bill = sdCapsule(x, y, z, 0, hy - 0.008, hz + 0.07, 0, billTipY, billTipZ, 0.038, 0.018);

      // 5. Long slender 3-toed tan-grey legs
      let legs = 99;
      for (let side = -1; side <= 1; side += 2) {
        const isRight = side > 0;
        const swing = isRight ? P.rSwing : P.lSwing;
        const lift = isRight ? P.rLift : P.lLift;

        const hipX = side * 0.095;
        const hipY = by - 0.12;
        const hipZ = -0.04;

        const kneeX = side * 0.098;
        const kneeY = -0.38 + by * 0.35 + lift * 0.24;
        const kneeZ = -0.10 + swing * 0.50;

        const footX = side * 0.095;
        const footY = -0.92 + lift * 0.35;
        const footZ = 0.00 + swing;

        const thigh = sdCapsule(x, y, z, hipX, hipY, hipZ, kneeX, kneeY, kneeZ, 0.056, 0.032);
        const tarsus = sdCapsule(x, y, z, kneeX, kneeY, kneeZ, footX, footY, footZ, 0.028, 0.022);
        const toeM = sdCapsule(x, y, z, footX, footY, footZ, footX, footY, footZ + 0.12, 0.022, 0.015);
        const toeO = sdCapsule(x, y, z, footX, footY, footZ, footX + side * 0.045, footY, footZ + 0.08, 0.018, 0.013);
        legs = Math.min(legs, smin(smin(thigh, tarsus, 0.02), Math.min(toeM, toeO), 0.015));
      }

      // 6. Expressive dark eyes with white glint
      const eyeL = sdEllipsoid(x, y, z, -0.068, hy + 0.016, hz + 0.036, 0.024, 0.024, 0.024);
      const eyeR = sdEllipsoid(x, y, z,  0.068, hy + 0.016, hz + 0.036, 0.024, 0.024, 0.024);
      const eyes = Math.min(eyeL, eyeR);

      let d = body;
      let mat = 'body';
      if (legs < d) { d = legs; mat = 'leg'; }
      if (bill < d) { d = bill; mat = 'bill'; }
      if (eyes < d) { d = eyes; mat = 'eye'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'eye') {
        if (y > hy + 0.022 && z > hz + 0.040) return 'W';
        return 'k';
      }
      if (mat === 'bill' || mat === 'leg') {
        return shade > 0.44 ? 'l1' : 'l0';
      }

      // Signature dark charcoal-black crescent bib/collar at neck base & upper chest + dark crown stripe!
      if (z > 0.12 && y > by + 0.01 && y < by + 0.25 && Math.abs(x) < 0.165) {
        return shade > 0.42 ? 'c1' : 'c0';
      }
      if (y > hy + 0.045 && Math.abs(x) < 0.038 && z < hz + 0.04) {
        return 'c1';
      }

      // Pale cream-white upper throat & lower underbelly
      if ((y > by + 0.25 && z > nMidZ - 0.01 && Math.abs(x) < 0.06) || (y < by - 0.08 && Math.abs(x) < 0.14 && z > -0.15)) {
        return shade > 0.35 ? 'W' : 'r4';
      }

      // Feathered pale-grey neck
      if (y > by + 0.22 && z > 0.10) {
        return shade > 0.62 ? 'r4' : shade > 0.30 ? 'r3' : 'r2';
      }

      // Fluffy ash-grey / dusty-silver-taupe drooping body & wing plumes
      const plumeTex = Math.sin(z * 22 + y * 16) * 0.05;
      const s = shade + plumeTex;
      return s > 0.78 ? 'r4' : s > 0.56 ? 'r3' : s > 0.34 ? 'r2' : s > 0.16 ? 'r1' : 'r0';
    };

    pack = build27Pack(RHEA_PW, RHEA_PH, 0.85, 1.10, RHEA_PAL, evalFn, shadeFn);
    rheaCache.set(pose, pack);
  }
  return pack;
}

export function getRheaPosePack(...args: Parameters<typeof buildRheaPosePack>): ReturnType<typeof buildRheaPosePack> {
  return registerAnimalSpritePack(buildRheaPosePack(...args), { module: './Rhea.ts', factory: 'getRheaPosePack', args }, buildRheaPosePack);
}

/**
 * Greater Rhea (Ema): strides gracefully across the grassland, pecks, and
 * sprints with its large grey wing plumes raised like sails when startled.
 */
export class Rhea extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private readonly home = new THREE.Vector3();
  private state: 'idle' | 'walk' | 'sprint' | 'peck' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.6, 3.2);
  private targetYaw = rand(0, Math.PI * 2);
  private gaitPhase = rand(0, Math.PI * 2);

  constructor(ctx: GameContext, pos: THREE.Vector3) {
    super(ctx, getRheaPosePack('idle0').getView(2, 0)!, RHEA_PW, RHEA_PH, RHEA_W, RHEA_H, 'RheaBillboard');
    this.hp = 55;
    this.maxHp = 55;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.36;
    this.motor.height = 1.10;
    this.motor.teleport(pos);
    this.home.copy(pos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.42, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.set(this.position.x, this.position.y + 0.55, this.position.z);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y + 0.25, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.90, this.position.z);
    this.hurtboxes[0].enabled = this.alive;
    this.stickRoot.position.set(this.position.x, this.position.y + 0.55, this.position.z);
    this.stickRoot.rotation.y = this.facing;
  }

  receiveHit(hit: HitInfo): HitResult {
    const res = emptyResult('flesh');
    if (!this.alive) { res.ignored = true; return res; }
    this.hp = Math.max(0, this.hp - hit.damage);
    res.damage = hit.damage;
    this.flash = 1.0;
    this.vel.x += hit.dir.x * 4.2;
    this.vel.z += hit.dir.z * 4.2;
    this.vel.y = 2.6;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.state = 'sprint';
      this.stateT = 0;
      this.stateDur = rand(2.4, 3.8);
      this.targetYaw = Math.atan2(hit.dir.x, hit.dir.z);
    }
    return res;
  }

  update(dt: number, target: EnemyTarget | null, camera: THREE.Camera, drawingBufferSize?: THREE.Vector2) {
    if (dt > 0) {
      this.stateT += dt;
      this.flash = Math.max(0, this.flash - dt * 4.5);

      if (!this.alive) {
        this.deadT += dt;
        this.vel.x = damp(this.vel.x, 0, 5, dt);
        this.vel.z = damp(this.vel.z, 0, 5, dt);
        this.vel.y -= 18 * dt;
        this.motor.update(dt);
      } else {
        const dist = target && target.alive
          ? Math.hypot(target.position.x - this.position.x, target.position.z - this.position.z)
          : 999;

        if (dist < 3.6 && this.state !== 'sprint') {
          this.state = 'sprint';
          this.stateT = 0;
          this.stateDur = rand(2.2, 3.6);
          if (target) {
            this.targetYaw = Math.atan2(this.position.x - target.position.x, this.position.z - target.position.z) + rand(-0.5, 0.5);
          }
        }

        let speed = 0;
        if (this.state === 'idle' || this.state === 'peck') {
          if (this.stateT >= this.stateDur) {
            const r = Math.random();
            if (r < 0.55) {
              this.state = 'walk';
              this.stateDur = rand(2.2, 4.0);
              const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);
              this.targetYaw = toHome > 7.5
                ? Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.6, 0.6)
                : this.facing + rand(-1.6, 1.6);
            } else {
              this.state = this.state === 'idle' ? 'peck' : 'idle';
              this.stateDur = rand(1.6, 2.8);
            }
            this.stateT = 0;
          }
        } else if (this.state === 'walk') {
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 5);
          speed = 1.8;
          if (this.stateT >= this.stateDur) {
            this.state = Math.random() < 0.5 ? 'peck' : 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.6, 3.0);
          }
        } else if (this.state === 'sprint') {
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 7);
          speed = 5.2;
          if (this.stateT >= this.stateDur) {
            this.state = 'walk';
            this.stateT = 0;
            this.stateDur = rand(1.8, 3.0);
          }
        }

        this.vel.x = damp(this.vel.x, Math.sin(this.facing) * speed, 8, dt);
        this.vel.z = damp(this.vel.z, Math.cos(this.facing) * speed, 8, dt);
        this.vel.y -= 18 * dt;
        this.motor.update(dt);

        const horiz = Math.hypot(this.vel.x, this.vel.z);
        if (horiz > 0.2 && this.motor.grounded) {
          this.gaitPhase += dt * 5.2 * (0.65 + horiz * 0.25);
        }
      }
      this.syncHurtbox();
    }

    let pose: RheaPoseName;
    if (!this.alive) pose = 'idle0';
    else if (this.state === 'sprint') pose = pickCycle(RHEA_SPRINT, (this.gaitPhase / Math.PI) * 3.0);
    else if (this.state === 'walk') pose = pickCycle(RHEA_WALK, (this.gaitPhase / Math.PI) * 3.0);
    else if (this.state === 'peck') pose = pickCycle(RHEA_PECK, this.stateT * 2.5);
    else pose = pickCycle(RHEA_IDLE, this.stateT * 1.8);

    const deathSink = this.alive ? 0 : Math.min(0.42, this.deadT * 0.55);
    this.renderBillboard(getRheaPosePack(pose), this.position.y + 0.55 - deathSink, camera, drawingBufferSize);
  }
}
