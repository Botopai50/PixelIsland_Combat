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
// TARTARUGA-DO-RIO-MARY (Flagship Mary River "Punk Rock" Turtle) — 34×24 @ 56 PPU
// ============================================================================
export type MaryRiverTurtlePoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'walk0' | 'walk1' | 'walk2' | 'walk3' | 'walk4' | 'walk5'
  | 'swim0' | 'swim1' | 'swim2' | 'swim3';

export const MARY_TURTLE_PW = 34;
export const MARY_TURTLE_PH = 24;
export const MARY_TURTLE_W = MARY_TURTLE_PW / ANIMAL_PPU;
export const MARY_TURTLE_H = MARY_TURTLE_PH / ANIMAL_PPU;

const MARY_TURTLE_PAL: Record<string, [number, number, number]> = {
  k:  [0x12, 0x14, 0x10], // crisp 1px dark outline / glossy eye
  s0: [0x2e, 0x26, 0x1a], // deep umber-olive carapace shadow
  s1: [0x4c, 0x41, 0x2b], // rich olive-umber carapace
  s2: [0x6e, 0x60, 0x40], // warm olive-bronze scute midtone
  s3: [0x94, 0x84, 0x5c], // sunlit shell highlight
  p0: [0xba, 0xa8, 0x7c], // warm cream plastron / chin barbel shadow
  p1: [0xe6, 0xd6, 0xa8], // pale cream plastron & chin barbels
  g0: [0x3d, 0x47, 0x3b], // dark grey-olive skin shadow
  g1: [0x5e, 0x6b, 0x58], // warm grey-olive head/flipper/tail skin
  g2: [0x82, 0x91, 0x78], // sunlit skin highlight
  a0: [0x18, 0x5c, 0x24], // deep emerald algae base
  a1: [0x2e, 0x9e, 0x38], // vibrant emerald algae mohawk
  a2: [0x64, 0xd9, 0x45], // bright lime-green spiky mohawk tips
  a3: [0xa8, 0xf7, 0x6e], // sunlit neon-lime mohawk highlight
  W:  [0xff, 0xfb, 0xf2], // crisp white eye glint
};

interface MaryTurtlePose {
  bodyY: number;
  headY: number;
  headZ: number;
  mohawkSway: number;
  flSwing: number;
  flLift: number;
  frSwing: number;
  frLift: number;
  blSwing: number;
  blLift: number;
  brSwing: number;
  brLift: number;
  tailSway: number;
  swimOut: number;
}

const MARY_TURTLE_POSES: Record<MaryRiverTurtlePoseName, MaryTurtlePose> = {
  idle0: {
    bodyY: 0.00, headY: 0.00, headZ: 0.00, mohawkSway: 0.00,
    flSwing: 0.02, flLift: 0.0, frSwing: -0.02, frLift: 0.0,
    blSwing: -0.02, blLift: 0.0, brSwing: 0.02, brLift: 0.0,
    tailSway: 0.00, swimOut: 0.0,
  },
  idle1: {
    bodyY: 0.014, headY: 0.025, headZ: 0.015, mohawkSway: 0.02,
    flSwing: 0.02, flLift: 0.0, frSwing: -0.02, frLift: 0.0,
    blSwing: -0.02, blLift: 0.0, brSwing: 0.02, brLift: 0.0,
    tailSway: 0.04, swimOut: 0.0,
  },
  idle2: {
    bodyY: -0.01, headY: -0.012, headZ: 0.00, mohawkSway: -0.02,
    flSwing: 0.02, flLift: 0.0, frSwing: -0.02, frLift: 0.0,
    blSwing: -0.02, blLift: 0.0, brSwing: 0.02, brLift: 0.0,
    tailSway: -0.04, swimOut: 0.0,
  },

  // Shore waddle
  walk0: {
    bodyY: 0.01, headY: 0.01, headZ: 0.02, mohawkSway: 0.02,
    flSwing: 0.14, flLift: 0.07, frSwing: -0.12, frLift: 0.0,
    blSwing: -0.12, blLift: 0.0, brSwing: 0.14, brLift: 0.07,
    tailSway: -0.05, swimOut: 0.0,
  },
  walk1: {
    bodyY: 0.02, headY: 0.02, headZ: 0.03, mohawkSway: 0.03,
    flSwing: 0.08, flLift: 0.02, frSwing: -0.04, frLift: 0.04,
    blSwing: -0.04, blLift: 0.04, brSwing: 0.08, brLift: 0.02,
    tailSway: -0.02, swimOut: 0.0,
  },
  walk2: {
    bodyY: 0.005, headY: 0.00, headZ: 0.02, mohawkSway: 0.00,
    flSwing: -0.06, flLift: 0.0, frSwing: 0.10, frLift: 0.08,
    blSwing: 0.10, blLift: 0.08, brSwing: -0.06, brLift: 0.0,
    tailSway: 0.02, swimOut: 0.0,
  },
  walk3: {
    bodyY: 0.01, headY: 0.01, headZ: 0.02, mohawkSway: -0.02,
    flSwing: -0.12, flLift: 0.0, frSwing: 0.14, frLift: 0.07,
    blSwing: 0.14, blLift: 0.07, brSwing: -0.12, brLift: 0.0,
    tailSway: 0.05, swimOut: 0.0,
  },
  walk4: {
    bodyY: 0.02, headY: 0.02, headZ: 0.03, mohawkSway: -0.03,
    flSwing: -0.04, flLift: 0.04, frSwing: 0.08, frLift: 0.02,
    blSwing: 0.08, blLift: 0.02, brSwing: -0.04, brLift: 0.04,
    tailSway: 0.02, swimOut: 0.0,
  },
  walk5: {
    bodyY: 0.005, headY: 0.00, headZ: 0.02, mohawkSway: 0.00,
    flSwing: 0.10, flLift: 0.08, frSwing: -0.06, frLift: 0.0,
    blSwing: -0.06, blLift: 0.0, brSwing: 0.10, brLift: 0.08,
    tailSway: -0.02, swimOut: 0.0,
  },

  // Aquatic flipper-paddling glide
  swim0: {
    bodyY: -0.02, headY: 0.01, headZ: 0.04, mohawkSway: -0.03,
    flSwing: 0.16, flLift: 0.08, frSwing: 0.16, frLift: 0.08,
    blSwing: -0.12, blLift: 0.06, brSwing: -0.12, brLift: 0.06,
    tailSway: -0.08, swimOut: 0.10,
  },
  swim1: {
    bodyY: 0.00, headY: 0.02, headZ: 0.05, mohawkSway: 0.00,
    flSwing: 0.00, flLift: 0.04, frSwing: 0.00, frLift: 0.04,
    blSwing: -0.04, blLift: 0.05, brSwing: -0.04, brLift: 0.05,
    tailSway: 0.00, swimOut: 0.14,
  },
  swim2: {
    bodyY: -0.02, headY: 0.01, headZ: 0.04, mohawkSway: 0.03,
    flSwing: -0.16, flLift: 0.06, frSwing: -0.16, frLift: 0.06,
    blSwing: 0.08, blLift: 0.07, brSwing: 0.08, brLift: 0.07,
    tailSway: 0.08, swimOut: 0.08,
  },
  swim3: {
    bodyY: -0.01, headY: 0.02, headZ: 0.04, mohawkSway: 0.00,
    flSwing: 0.02, flLift: 0.10, frSwing: 0.02, frLift: 0.10,
    blSwing: -0.08, blLift: 0.05, brSwing: -0.08, brLift: 0.05,
    tailSway: 0.00, swimOut: 0.12,
  },
};

const maryTurtleCache = new Map<MaryRiverTurtlePoseName, Boar27Pack>();
 function buildMaryRiverTurtlePosePack(pose: MaryRiverTurtlePoseName): Boar27Pack {
  let pack = maryTurtleCache.get(pose);
  if (!pack) {
    const P = MARY_TURTLE_POSES[pose];
    const by = P.bodyY;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // 1. Sleek low-profile streamlined aquatic carapace + cream plastron
      const dome = sdEllipsoid(x, y, z, 0, -0.01 + by, -0.03, 0.31, 0.155, 0.35);
      const rim = sdEllipsoid(x, y, z, 0, -0.065 + by, -0.03, 0.34, 0.068, 0.38);
      const plastron = sdEllipsoid(x, y, z, 0, -0.115 + by, -0.03, 0.27, 0.065, 0.31);
      const shell = smin(smin(dome, rim, 0.04), plastron, 0.035);

      // Subtle mossy algae patches growing on the dorsal carapace ridge
      const moss1 = sdEllipsoid(x, y, z, 0, 0.135 + by, 0.04, 0.075, 0.042, 0.095);
      const moss2 = sdEllipsoid(x, y, z, 0, 0.125 + by, -0.12, 0.068, 0.038, 0.085);
      const shellMoss = smin(moss1, moss2, 0.03);

      // 2. Extended neck & expressive turtle head
      const hY = 0.06 + by + P.headY;
      const hZ = 0.44 + P.headZ;
      const neck = sdCapsule(x, y, z, 0, -0.03 + by, 0.24, 0, hY - 0.02, hZ - 0.04, 0.088, 0.078);
      const head = sdEllipsoid(x, y, z, 0, hY, hZ, 0.105, 0.092, 0.125);
      const snout = sdEllipsoid(x, y, z, 0, hY - 0.01, hZ + 0.09, 0.072, 0.062, 0.068);
      const headGroup = smin(neck, smin(head, snout, 0.03), 0.035);

      // Two iconic fleshy chin barbels (tubercles) under the lower jaw!
      const barbelL = sdCapsule(x, y, z, -0.038, hY - 0.065, hZ + 0.05, -0.046, hY - 0.145, hZ + 0.065, 0.022, 0.014);
      const barbelR = sdCapsule(x, y, z,  0.038, hY - 0.065, hZ + 0.05,  0.046, hY - 0.145, hZ + 0.065, 0.022, 0.014);
      const barbels = Math.min(barbelL, barbelR);

      // 3. Iconic spiky bright-green ALGAE "PUNK MOHAWK" tuft on top of the head!
      const sw = P.mohawkSway;
      const spike1 = sdCapsule(x, y, z, 0, hY + 0.055, hZ + 0.04, sw * 0.5, hY + 0.24, hZ + 0.07, 0.044, 0.018);
      const spike2 = sdCapsule(x, y, z, 0, hY + 0.060, hZ - 0.01, sw, hY + 0.28, hZ - 0.02, 0.048, 0.020);
      const spike3 = sdCapsule(x, y, z, 0, hY + 0.050, hZ - 0.06, sw * 0.8, hY + 0.22, hZ - 0.11, 0.042, 0.016);
      const tuftL = sdCapsule(x, y, z, -0.03, hY + 0.055, hZ + 0.01, -0.08 + sw * 0.4, hY + 0.20, hZ + 0.01, 0.036, 0.015);
      const tuftR = sdCapsule(x, y, z,  0.03, hY + 0.055, hZ + 0.01,  0.08 + sw * 0.4, hY + 0.20, hZ + 0.01, 0.036, 0.015);
      const mohawk = smin(
        smin(spike1, spike2, 0.025),
        smin(spike3, Math.min(tuftL, tuftR), 0.025),
        0.025
      );
      const algae = Math.min(mohawk, shellMoss);

      // 4. Long thick muscular aquatic tail (famous Mary River Turtle trait!)
      const tail1 = sdCapsule(x, y, z, 0, -0.06 + by, -0.34, P.tailSway * 0.5, -0.09 + by, -0.54, 0.075, 0.052);
      const tail2 = sdCapsule(x, y, z, P.tailSway * 0.5, -0.09 + by, -0.54, P.tailSway, -0.11 + by, -0.72, 0.050, 0.022);
      const tail = smin(tail1, tail2, 0.03);

      // 5. Streamlined aquatic flipper-legs with webbed toes
      const flipper = (sx: number, shZ: number, swing: number, lift: number) => {
        const sign = sx < 0 ? -1 : 1;
        const outX = sx + sign * (0.14 + P.swimOut);
        const fy = -0.22 + lift;
        const fz = shZ + swing;
        const arm = sdCapsule(x, y, z, sx, -0.08 + by, shZ, outX, fy + 0.02, fz, 0.056, 0.044);
        const pad = sdEllipsoid(x, y, z, outX + sign * 0.02, fy, fz + 0.02, 0.068, 0.026, 0.062);
        return smin(arm, pad, 0.02);
      };
      const fl = flipper(-0.22, 0.16, P.flSwing, P.flLift);
      const fr = flipper( 0.22, 0.16, P.frSwing, P.frLift);
      const bl = flipper(-0.22, -0.20, P.blSwing, P.blLift);
      const br = flipper( 0.22, -0.20, P.brSwing, P.brLift);
      const legs = Math.min(Math.min(fl, fr), Math.min(bl, br));

      // Bright expressive eyes with white glint
      const eyeL = sdEllipsoid(x, y, z, -0.078, hY + 0.022, hZ + 0.072, 0.030, 0.030, 0.030);
      const eyeR = sdEllipsoid(x, y, z,  0.078, hY + 0.022, hZ + 0.072, 0.030, 0.030, 0.030);
      const eyes = Math.min(eyeL, eyeR);

      const skin = smin(smin(headGroup, tail, 0.03), legs, 0.03);
      let d = smin(shell, skin, 0.025);
      d = smin(d, barbels, 0.015);
      d = smin(d, algae, 0.018);

      let mat = 'shell';
      if (skin < shell - 0.005) mat = 'skin';
      if (barbels < d + 0.005) mat = 'barbel';
      if (algae < d + 0.006) mat = 'algae';
      if (eyes < d) { d = eyes; mat = 'eye'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'eye') {
        const hY = 0.06 + by + P.headY;
        const hZ = 0.44 + P.headZ;
        if (y > hY + 0.026 && z > hZ + 0.078 && Math.abs(x) < 0.084) return 'W';
        return 'k';
      }
      if (mat === 'algae') {
        return shade > 0.78 ? 'a3' : shade > 0.50 ? 'a2' : shade > 0.24 ? 'a1' : 'a0';
      }
      if (mat === 'barbel') {
        return shade > 0.45 ? 'p1' : 'p0';
      }
      if (mat === 'skin') {
        // Pale underside of chin/neck
        if (y < -0.03 + by && z > 0.25) return shade > 0.45 ? 'p1' : 'p0';
        return shade > 0.66 ? 'g2' : shade > 0.34 ? 'g1' : 'g0';
      }

      // Pale cream plastron underside
      if (y < -0.095 + by) return shade > 0.45 ? 'p1' : 'p0';

      // Carapace scute grid seams
      const scuteSeam =
        (Math.abs(Math.abs(x) - 0.13) < 0.018 && y > -0.02 + by) ||
        (Math.abs(((z + 0.30) % 0.16) - 0.08) > 0.065 && y > -0.02 + by);
      const s = scuteSeam ? shade - 0.22 : shade;
      return s > 0.74 ? 's3' : s > 0.48 ? 's2' : s > 0.24 ? 's1' : 's0';
    };

    pack = build27Pack(MARY_TURTLE_PW, MARY_TURTLE_PH, 1.04, 0.74, MARY_TURTLE_PAL, evalFn, shadeFn);
    maryTurtleCache.set(pose, pack);
  }
  return pack;
}

export function getMaryRiverTurtlePosePack(...args: Parameters<typeof buildMaryRiverTurtlePosePack>): ReturnType<typeof buildMaryRiverTurtlePosePack> {
  return registerAnimalSpritePack(buildMaryRiverTurtlePosePack(...args), { module: './MaryRiverTurtle.ts', factory: 'getMaryRiverTurtlePosePack', args }, buildMaryRiverTurtlePosePack);
}

const MARY_TURTLE_IDLE: readonly MaryRiverTurtlePoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const MARY_TURTLE_WALK: readonly MaryRiverTurtlePoseName[] = ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'];
const MARY_TURTLE_SWIM: readonly MaryRiverTurtlePoseName[] = ['swim0', 'swim1', 'swim2', 'swim3'];

/**
 * Mary River Turtle (Tartaruga-do-Rio-Mary): Australian "punk rock turtle" with green algae mohawk
 * and chin barbels that swims and waddles near pondCenter.
 */
export class MaryRiverTurtle extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private readonly home = new THREE.Vector3();
  private state: 'idle' | 'walk' | 'swim' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.5, 3.0);
  private gaitPhase = rand(0, Math.PI * 2);

  constructor(ctx: GameContext, pos: THREE.Vector3, pondCenter?: THREE.Vector3) {
    super(
      ctx,
      getMaryRiverTurtlePosePack('idle0').getView(2, 0)!,
      MARY_TURTLE_PW,
      MARY_TURTLE_PH,
      MARY_TURTLE_W,
      MARY_TURTLE_H,
      'MaryRiverTurtleBillboard'
    );
    this.hp = 40;
    this.maxHp = 40;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.24;
    this.motor.height = 0.28;
    this.motor.teleport(pos);
    this.home.copy(pondCenter ?? pos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.30, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.set(this.position.x, this.position.y + 0.15, this.position.z);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y + 0.06, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.24, this.position.z);
    this.hurtboxes[0].enabled = this.alive;
    this.stickRoot.position.set(this.position.x, this.position.y + 0.15, this.position.z);
    this.stickRoot.rotation.y = this.facing;
  }

  receiveHit(hit: HitInfo): HitResult {
    const res = emptyResult('flesh');
    if (!this.alive) { res.ignored = true; return res; }
    this.hp = Math.max(0, this.hp - hit.damage);
    res.damage = hit.damage;
    this.flash = 1.0;
    this.vel.x += hit.dir.x * 3.2;
    this.vel.z += hit.dir.z * 3.2;
    this.vel.y = 2.4;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.state = 'swim';
      this.stateT = 0;
      this.stateDur = 2.4;
      this.facing = Math.atan2(hit.dir.x, hit.dir.z);
    }
    return res;
  }

  update(dt: number, _target: EnemyTarget | null, camera: THREE.Camera, drawingBufferSize?: THREE.Vector2) {
    if (dt > 0) {
      this.stateT += dt;
      this.flash = Math.max(0, this.flash - dt * 4.5);

      if (!this.alive) {
        this.deadT += dt;
        this.vel.x = damp(this.vel.x, 0, 6, dt);
        this.vel.z = damp(this.vel.z, 0, 6, dt);
        this.vel.y -= 20 * dt;
        this.motor.update(dt);
      } else {
        let vx = 0;
        let vz = 0;
        const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);

        if (this.state === 'idle') {
          if (this.stateT >= this.stateDur) {
            this.state = toHome < 3.5 && Math.random() < 0.55 ? 'swim' : 'walk';
            this.stateT = 0;
            this.stateDur = rand(2.0, 3.8);
            if (toHome > 5.2) {
              this.facing = Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.4, 0.4);
            } else {
              this.facing += rand(-1.2, 1.2);
            }
          }
        } else if (this.state === 'walk' || this.state === 'swim') {
          const speed = this.state === 'swim' ? 1.45 : 0.95;
          vx = Math.sin(this.facing) * speed;
          vz = Math.cos(this.facing) * speed;
          if (this.stateT >= this.stateDur) {
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.4, 2.8);
          }
        }

        this.vel.x = damp(this.vel.x, vx, 8, dt);
        this.vel.z = damp(this.vel.z, vz, 8, dt);
        this.vel.y -= 20 * dt;
        this.motor.update(dt);

        const horiz = Math.hypot(this.vel.x, this.vel.z);
        if (horiz > 0.15 && this.motor.grounded) {
          this.gaitPhase += dt * 6.5 * (0.7 + horiz * 0.35);
        }
      }
      this.syncHurtbox();
    }

    let pose: MaryRiverTurtlePoseName;
    if (!this.alive) pose = 'idle0';
    else if (this.state === 'swim') pose = pickCycle(MARY_TURTLE_SWIM, this.stateT * 4.5);
    else if (this.state === 'walk') pose = pickCycle(MARY_TURTLE_WALK, (this.gaitPhase / Math.PI) * 3.0);
    else pose = pickCycle(MARY_TURTLE_IDLE, this.stateT * 2.0);

    const deathSink = this.alive ? 0 : Math.min(0.12, this.deadT * 0.3);
    this.renderBillboard(getMaryRiverTurtlePosePack(pose), this.position.y + 0.15 - deathSink, camera, drawingBufferSize);
  }
}
