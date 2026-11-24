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
// CROCODILO-DO-NILO (Nile Crocodile) — 80×32 @ 56 PPU (1.43m × 0.57m)
// ============================================================================
export type CrocodilePoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'crawl0' | 'crawl1' | 'crawl2' | 'crawl3' | 'crawl4' | 'crawl5'
  | 'swim0' | 'swim1' | 'swim2' | 'swim3'
  | 'snap0' | 'snap1' | 'snap2';

export const CROCODILE_PW = 80;
export const CROCODILE_PH = 32;
export const CROCODILE_W = CROCODILE_PW / ANIMAL_PPU;
export const CROCODILE_H = CROCODILE_PH / ANIMAL_PPU;

const CROC_PAL: Record<string, [number, number, number]> = {
  k:  [0x14, 0x16, 0x10], // crisp 1px dark outline / eye slit / claws
  d0: [0x29, 0x30, 0x1c], // dark mottled cross-band shadow
  d1: [0x3f, 0x4a, 0x2b], // dark olive cross-band midtone
  c0: [0x54, 0x5c, 0x34], // olive-bronze armored scale shadow
  c1: [0x75, 0x7d, 0x48], // warm olive-bronze scale base
  c2: [0x99, 0x9e, 0x62], // sandy-khaki armored scale midtone
  c3: [0xbc, 0xbe, 0x80], // sunlit khaki highlight
  c4: [0xdc, 0xdb, 0xa2], // crisp dorsal ridge rim sheen
  b0: [0xc7, 0xbe, 0x99], // pale cream belly shadow
  b1: [0xeb, 0xe4, 0xc5], // pale cream belly scales
  e:  [0xc8, 0xe8, 0x42], // fierce pale yellow-green crocodile eyes
  m:  [0x9e, 0x38, 0x44], // mouth interior on snap
  W:  [0xf8, 0xf6, 0xec], // interlocking ivory teeth & eye glint
};

interface CrocPose {
  bodyY: number;
  headY: number;
  jawOpen: number;
  swimTuck: number;
  flSwing: number;
  frSwing: number;
  blSwing: number;
  brSwing: number;
  tailSway: number;
  bodySway: number;
}

const CROC_POSES: Record<CrocodilePoseName, CrocPose> = {
  // Low basking lurk
  idle0: { bodyY: 0.0,   headY: 0.0,   jawOpen: 0.0,  swimTuck: 0.0, flSwing: 0.0,   frSwing: 0.0,   blSwing: 0.0,   brSwing: 0.0,   tailSway: 0.04,  bodySway: 0.0 },
  idle1: { bodyY: 0.01,  headY: 0.015, jawOpen: 0.05, swimTuck: 0.0, flSwing: 0.0,   frSwing: 0.0,   blSwing: 0.0,   brSwing: 0.0,   tailSway: 0.12,  bodySway: 0.02 },
  idle2: { bodyY: -0.01, headY: -0.01, jawOpen: 0.0,  swimTuck: 0.0, flSwing: 0.0,   frSwing: 0.0,   blSwing: 0.0,   brSwing: 0.0,   tailSway: -0.10, bodySway: -0.02 },

  // 6-frame high-walk / sinuous reptilian crawl
  crawl0: { bodyY: 0.05, headY: 0.02, jawOpen: 0.0, swimTuck: 0.0, flSwing: 0.22,  frSwing: -0.18, blSwing: -0.18, brSwing: 0.20,  tailSway: 0.16,  bodySway: 0.04 },
  crawl1: { bodyY: 0.06, headY: 0.03, jawOpen: 0.0, swimTuck: 0.0, flSwing: 0.10,  frSwing: -0.06, blSwing: -0.06, brSwing: 0.10,  tailSway: 0.08,  bodySway: 0.02 },
  crawl2: { bodyY: 0.04, headY: 0.01, jawOpen: 0.0, swimTuck: 0.0, flSwing: -0.06, frSwing: 0.12,  blSwing: 0.10,  brSwing: -0.06, tailSway: -0.08, bodySway: -0.02 },
  crawl3: { bodyY: 0.05, headY: 0.02, jawOpen: 0.0, swimTuck: 0.0, flSwing: -0.18, frSwing: 0.22,  blSwing: 0.20,  brSwing: -0.18, tailSway: -0.16, bodySway: -0.04 },
  crawl4: { bodyY: 0.06, headY: 0.03, jawOpen: 0.0, swimTuck: 0.0, flSwing: -0.06, frSwing: 0.10,  blSwing: 0.10,  brSwing: -0.06, tailSway: -0.08, bodySway: -0.02 },
  crawl5: { bodyY: 0.04, headY: 0.01, jawOpen: 0.0, swimTuck: 0.0, flSwing: 0.12,  frSwing: -0.06, blSwing: -0.06, brSwing: 0.10,  tailSway: 0.08,  bodySway: 0.02 },

  // 4-frame tail-sweeping aquatic glide with legs tucked back
  swim0: { bodyY: 0.02, headY: 0.01, jawOpen: 0.0, swimTuck: 1.0, flSwing: -0.25, frSwing: -0.25, blSwing: -0.28, brSwing: -0.28, tailSway: 0.24,  bodySway: 0.05 },
  swim1: { bodyY: 0.02, headY: 0.01, jawOpen: 0.0, swimTuck: 1.0, flSwing: -0.25, frSwing: -0.25, blSwing: -0.28, brSwing: -0.28, tailSway: 0.06,  bodySway: 0.01 },
  swim2: { bodyY: 0.02, headY: 0.01, jawOpen: 0.0, swimTuck: 1.0, flSwing: -0.25, frSwing: -0.25, blSwing: -0.28, brSwing: -0.28, tailSway: -0.24, bodySway: -0.05 },
  swim3: { bodyY: 0.02, headY: 0.01, jawOpen: 0.0, swimTuck: 1.0, flSwing: -0.25, frSwing: -0.25, blSwing: -0.28, brSwing: -0.28, tailSway: -0.06, bodySway: -0.01 },

  // 3-frame massive jagged toothed jaw lunge!
  snap0: { bodyY: 0.04, headY: 0.06, jawOpen: 0.65, swimTuck: 0.0, flSwing: 0.10,  frSwing: 0.10,  blSwing: -0.10, brSwing: -0.10, tailSway: 0.14,  bodySway: 0.03 },
  snap1: { bodyY: 0.06, headY: 0.08, jawOpen: 1.0,  swimTuck: 0.0, flSwing: 0.22,  frSwing: 0.22,  blSwing: -0.20, brSwing: -0.20, tailSway: -0.14, bodySway: -0.03 },
  snap2: { bodyY: 0.03, headY: 0.02, jawOpen: 0.12, swimTuck: 0.0, flSwing: 0.16,  frSwing: 0.16,  blSwing: -0.12, brSwing: -0.12, tailSway: 0.06,  bodySway: 0.0 },
};

const crocCache = new Map<CrocodilePoseName, Boar27Pack>();
 function buildCrocodilePosePack(pose: CrocodilePoseName): Boar27Pack {
  let pack = crocCache.get(pose);
  if (!pack) {
    const P = CROC_POSES[pose];
    const by = P.bodyY;
    const hy = 0.02 + by + P.headY;
    const jawLift = P.jawOpen * 0.16;
    const jawDrop = P.jawOpen * 0.08;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // 1. Long sleek armored crocodilian torso
      const chest = sdEllipsoid(x, y, z, P.bodySway * 0.5, -0.02 + by, 0.22, 0.205, 0.135, 0.30);
      const mid = sdEllipsoid(x, y, z, -P.bodySway * 0.4, -0.02 + by, -0.10, 0.215, 0.138, 0.30);
      const pelvis = sdEllipsoid(x, y, z, P.bodySway * 0.3, -0.03 + by, -0.38, 0.175, 0.125, 0.22);
      const neck = sdCapsule(x, y, z, P.bodySway * 0.5, -0.01 + by, 0.40, 0, hy, 0.56, 0.145, 0.132);

      let body = smin(chest, mid, 0.10);
      body = smin(body, pelvis, 0.09);
      body = smin(body, neck, 0.07);

      // 2. Narrower V-shaped tapered Nile crocodile snout & hinged jaws
      const skull = sdEllipsoid(x, y, z, 0, hy + 0.01, 0.62, 0.138, 0.092, 0.145);
      const upperJaw = sdCapsule(x, y, z, 0, hy + 0.015 + jawLift * 0.25, 0.68, 0, hy + 0.005 + jawLift, 1.06, 0.105, 0.044);
      const lowerJaw = sdCapsule(x, y, z, 0, hy - 0.045, 0.66, 0, hy - 0.042 - jawDrop, 1.03, 0.090, 0.038);
      const head = smin(smin(skull, upperJaw, 0.04), lowerJaw, P.jawOpen > 0.2 ? 0.015 : 0.035);
      body = smin(body, head, 0.05);

      // 3. Long muscular tall serrated double-ridged tail
      const t1X = P.tailSway * 0.45;
      const t2X = P.tailSway * 1.05;
      const t3X = P.tailSway * 1.45;
      const tail1 = sdCapsule(x, y, z, 0, -0.03 + by, -0.48, t1X, -0.03 + by, -0.78, 0.132, 0.092);
      const tail2 = sdCapsule(x, y, z, t1X, -0.03 + by, -0.78, t2X, -0.03 + by, -1.04, 0.088, 0.054);
      const tail3 = sdCapsule(x, y, z, t2X, -0.03 + by, -1.04, t3X, -0.03 + by, -1.24, 0.050, 0.022);
      // Tall serrated dorsal tail crest
      const crest = sdCapsule(x, y, z, t1X * 0.5, 0.06 + by, -0.56, t2X, 0.05 + by, -1.10, 0.032, 0.018);
      const tailD = smin(smin(tail1, tail2, 0.04), smin(tail3, crest, 0.03), 0.04);
      body = smin(body, tailD, 0.06);

      // 4. Sturdy splayed clawed legs (tucked back when swimming)
      const leg = (sx: number, baseZ: number, swing: number) => {
        const sgn = sx < 0 ? -1 : 1;
        const tuck = P.swimTuck;
        const outX = sx + sgn * (0.14 - tuck * 0.06);
        const kneeY = -0.08 + by;
        const footY = -0.22 + tuck * 0.12;
        const kneeZ = baseZ + swing * 0.25 - tuck * 0.12;
        const footZ = baseZ + swing * 0.55 - tuck * 0.22;
        const upper = sdCapsule(x, y, z, sx, -0.05 + by, baseZ, outX, kneeY, kneeZ, 0.064, 0.048);
        const lower = sdCapsule(x, y, z, outX, kneeY, kneeZ, outX + sgn * 0.04, footY, footZ, 0.046, 0.036);
        const foot = sdEllipsoid(x, y, z, outX + sgn * 0.04, footY - 0.01, footZ + 0.04, 0.058, 0.026, 0.068);
        return smin(smin(upper, lower, 0.025), foot, 0.02);
      };
      const legs = Math.min(
        Math.min(leg(-0.18, 0.26, P.flSwing), leg(0.18, 0.26, P.frSwing)),
        Math.min(leg(-0.17, -0.32, P.blSwing), leg(0.17, -0.32, P.brSwing)),
      );
      body = smin(body, legs, 0.04);

      // 5. Raised periscope pale yellow-green eyes
      const eyeY = hy + 0.095 + jawLift * 0.15;
      const eyeL = sdEllipsoid(x, y, z, -0.082, eyeY, 0.64, 0.032, 0.028, 0.034);
      const eyeR = sdEllipsoid(x, y, z,  0.082, eyeY, 0.64, 0.032, 0.028, 0.034);
      const eyes = Math.min(eyeL, eyeR);

      // 6. Interlocking ivory teeth visibly jutting out along both sides of the jawline!
      let teeth = 99;
      for (let side = -1; side <= 1; side += 2) {
        // Iconic protruding 4th lower tooth + interlocking jagged teeth
        const t1 = sdEllipsoid(x, y, z, side * 0.072, hy - 0.018 - jawDrop * 0.3, 0.80, 0.016, 0.024, 0.016);
        const t2 = sdEllipsoid(x, y, z, side * 0.056, hy - 0.016 + jawLift * 0.5, 0.90, 0.014, 0.022, 0.014);
        const t3 = sdEllipsoid(x, y, z, side * 0.044, hy - 0.016 - jawDrop * 0.6, 0.99, 0.014, 0.024, 0.014);
        teeth = Math.min(teeth, Math.min(t1, Math.min(t2, t3)));
      }

      let mouth = 99;
      if (P.jawOpen > 0.2) {
        mouth = sdEllipsoid(x, y, z, 0, hy - 0.015 + (jawLift - jawDrop) * 0.3, 0.84, 0.058, 0.025 + P.jawOpen * 0.06, 0.16);
      }

      let d = body, mat = 'body';
      if (mouth < d) { d = mouth; mat = 'mouth'; }
      if (teeth < d) { d = teeth; mat = 'tooth'; }
      if (eyes < d) { d = eyes; mat = 'eye'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'tooth') return 'W';
      if (mat === 'mouth') return 'm';
      if (mat === 'eye') {
        const eyeY = hy + 0.095 + jawLift * 0.15;
        const localX = Math.abs(Math.abs(x) - 0.082);
        if (localX < 0.006 && y < eyeY + 0.012) return 'k';
        if (y > eyeY + 0.010) return 'W';
        return 'e';
      }

      // Pale cream belly scales
      if (y < -0.09 + by && Math.abs(x) < 0.20) {
        return shade > 0.42 ? 'b1' : 'b0';
      }

      // Dark mottled cross-bands along the back & serrated tail
      if (z < 0.45 && y > -0.06 + by) {
        const band = Math.sin(z * 16.0);
        if (band > 0.42) {
          return shade > 0.52 ? 'd1' : 'd0';
        }
      }

      // Lighter olive-bronze / sandy-khaki armored scales
      if (shade > 0.84) return 'c4';
      return shade > 0.62 ? 'c3' : shade > 0.38 ? 'c2' : shade > 0.18 ? 'c1' : 'c0';
    };

    pack = build27Pack(CROCODILE_PW, CROCODILE_PH, 1.38, 0.56, CROC_PAL, evalFn, shadeFn);
    crocCache.set(pose, pack);
  }
  return pack;
}

export function getCrocodilePosePack(...args: Parameters<typeof buildCrocodilePosePack>): ReturnType<typeof buildCrocodilePosePack> {
  return registerAnimalSpritePack(buildCrocodilePosePack(...args), { module: './Crocodile.ts', factory: 'getCrocodilePosePack', args }, buildCrocodilePosePack);
}

// ============================================================================
// INSTÂNCIA NA ARENA (Crocodile)
// ============================================================================
const CROC_IDLE: readonly CrocodilePoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const CROC_CRAWL: readonly CrocodilePoseName[] = ['crawl0', 'crawl1', 'crawl2', 'crawl3', 'crawl4', 'crawl5'];
const CROC_SWIM: readonly CrocodilePoseName[] = ['swim0', 'swim1', 'swim2', 'swim3'];
const CROC_SNAP: readonly CrocodilePoseName[] = ['snap0', 'snap1', 'snap2'];

/**
 * Nile Crocodile: lurks/swims near pondCenter and lunges aggressively with a snapping bite if approached.
 */
export class Crocodile extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private readonly home = new THREE.Vector3();
  private state: 'idle' | 'crawl' | 'swim' | 'snap' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.8, 3.4);
  private targetYaw = rand(0, Math.PI * 2);
  private gaitPhase = rand(0, Math.PI * 2);
  private provoked = false;

  constructor(ctx: GameContext, pos: THREE.Vector3, pondCenter?: THREE.Vector3) {
    super(ctx, getCrocodilePosePack('idle0').getView(2, 0)!, CROCODILE_PW, CROCODILE_PH, CROCODILE_W, CROCODILE_H, 'CrocodileBillboard');
    this.hp = 110;
    this.maxHp = 110;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.54;
    this.motor.height = 0.56;
    this.motor.teleport(pos);
    this.home.copy(pondCenter ?? pos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.58, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.set(this.position.x, this.position.y + 0.26, this.position.z);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y + 0.12, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.40, this.position.z);
    this.hurtboxes[0].enabled = this.alive;
    this.stickRoot.position.set(this.position.x, this.position.y + 0.26, this.position.z);
    this.stickRoot.rotation.y = this.facing;
  }

  receiveHit(hit: HitInfo): HitResult {
    const res = emptyResult('flesh');
    if (!this.alive) { res.ignored = true; return res; }
    this.hp = Math.max(0, this.hp - hit.damage);
    res.damage = hit.damage;
    this.flash = 1.0;
    this.vel.x += hit.dir.x * 2.8;
    this.vel.z += hit.dir.z * 2.8;
    this.vel.y = 2.0;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.provoked = true;
      this.state = 'snap';
      this.stateT = 0;
      this.stateDur = 1.0;
    }
    return res;
  }

  update(dt: number, target: EnemyTarget | null, camera: THREE.Camera, drawingBufferSize?: THREE.Vector2) {
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
        const dist = target && target.alive
          ? Math.hypot(target.position.x - this.position.x, target.position.z - this.position.z)
          : 999;

        let speed = 0;
        const aggroDist = this.provoked ? 6.5 : 3.4;
        if (dist < 2.2 && this.state !== 'snap') {
          this.state = 'snap';
          this.stateT = 0;
          this.stateDur = 0.9;
        } else if (dist < aggroDist && this.state === 'idle' && this.stateT > 0.5) {
          this.state = 'crawl';
          this.stateT = 0;
          this.stateDur = 2.0;
        }

        const toPond = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);

        if (this.state === 'idle') {
          if (this.stateT >= this.stateDur) {
            this.state = toPond < 3.6 ? 'swim' : 'crawl';
            this.stateT = 0;
            this.stateDur = rand(2.2, 4.0);
            this.targetYaw = toPond > 6.0
              ? Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.5, 0.5)
              : this.facing + rand(-1.4, 1.4);
          }
        } else if (this.state === 'crawl' || this.state === 'swim') {
          if ((this.provoked || dist < aggroDist) && target && target.alive && dist < 7.0) {
            this.targetYaw = Math.atan2(target.position.x - this.position.x, target.position.z - this.position.z);
            speed = 3.2;
          } else {
            speed = this.state === 'swim' ? 2.1 : 1.7;
          }
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 5.5);
          if (this.stateT >= this.stateDur) {
            this.provoked = false;
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.6, 3.0);
          }
        } else if (this.state === 'snap') {
          if (target && target.alive) {
            const toPlayer = Math.atan2(target.position.x - this.position.x, target.position.z - this.position.z);
            this.facing += angleDiff(this.facing, toPlayer) * Math.min(1, dt * 9);
          }
          speed = 3.6;
          if (this.stateT >= this.stateDur) {
            this.state = dist < aggroDist ? 'crawl' : 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.2, 2.2);
          }
        }

        this.vel.x = damp(this.vel.x, Math.sin(this.facing) * speed, 8, dt);
        this.vel.z = damp(this.vel.z, Math.cos(this.facing) * speed, 8, dt);
        this.vel.y -= 20 * dt;
        this.motor.update(dt);

        const horiz = Math.hypot(this.vel.x, this.vel.z);
        if (horiz > 0.2) {
          this.gaitPhase += dt * 5.6 * (0.65 + horiz * 0.22);
        }
      }
      this.syncHurtbox();
    }

    let pose: CrocodilePoseName;
    if (!this.alive) pose = 'idle0';
    else if (this.state === 'snap') pose = pickCycle(CROC_SNAP, this.stateT * 4.5);
    else if (this.state === 'swim') pose = pickCycle(CROC_SWIM, (this.gaitPhase / Math.PI) * 2.4);
    else if (this.state === 'crawl') pose = pickCycle(CROC_CRAWL, (this.gaitPhase / Math.PI) * 2.6);
    else pose = pickCycle(CROC_IDLE, this.stateT * 1.8);

    const deathSink = this.alive ? 0 : Math.min(0.18, this.deadT * 0.38);
    this.renderBillboard(getCrocodilePosePack(pose), this.position.y + 0.26 - deathSink, camera, drawingBufferSize);
  }
}
