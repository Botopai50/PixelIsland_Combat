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
// JACARÉ (Flagship Armored Alligator / Caiman) — 76×32 @ 56 PPU
// ============================================================================
export type AlligatorPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'crawl0' | 'crawl1' | 'crawl2' | 'crawl3' | 'crawl4' | 'crawl5'
  | 'swim0' | 'swim1' | 'swim2' | 'swim3'
  | 'snap0' | 'snap1' | 'snap2';

export const ALLIGATOR_PW = 76;
export const ALLIGATOR_PH = 32;
export const ALLIGATOR_W = ALLIGATOR_PW / ANIMAL_PPU;
export const ALLIGATOR_H = ALLIGATOR_PH / ANIMAL_PPU;

const ALLIGATOR_PAL: Record<string, [number, number, number]> = {
  k:  [0x10, 0x13, 0x0e], // crisp 1px dark outline / eye slit / claws
  a0: [0x1c, 0x24, 0x18], // deep swamp olive-black shadow
  a1: [0x2e, 0x3b, 0x24], // dark moss-green armored scales
  a2: [0x46, 0x57, 0x34], // rich olive-green dorsal scutes
  a3: [0x65, 0x78, 0x48], // sunlit moss-olive ridge highlight
  a4: [0x8b, 0x9c, 0x67], // wet-scale specular sheen
  c0: [0xb8, 0xa5, 0x72], // warm cream-yellow belly shadow
  c1: [0xe6, 0xd6, 0x9e], // pale cream-yellow belly plates
  e:  [0xf2, 0xb8, 0x24], // golden-amber periscope eye
  m:  [0x8f, 0x2e, 0x36], // inner mouth / tongue in snap
  W:  [0xf7, 0xf5, 0xeb], // crisp white teeth & eye glint
};

interface AlligatorPose {
  bodyY: number;
  bodySway: number;
  jawOpen: number;
  headLift: number;
  flSwing: number;
  flLift: number;
  frSwing: number;
  frLift: number;
  blSwing: number;
  blLift: number;
  brSwing: number;
  brLift: number;
  tailSway: number;
  swimTuck: number;
}

const ALLIGATOR_POSES: Record<AlligatorPoseName, AlligatorPose> = {
  // Low basking lurk
  idle0: {
    bodyY: -0.02, bodySway: 0.00, jawOpen: 0.00, headLift: 0.00,
    flSwing: 0.02, flLift: 0.0, frSwing: -0.02, frLift: 0.0,
    blSwing: -0.02, blLift: 0.0, brSwing: 0.02, brLift: 0.0,
    tailSway: 0.00, swimTuck: 0.0,
  },
  idle1: {
    bodyY: -0.01, bodySway: 0.01, jawOpen: 0.04, headLift: 0.015,
    flSwing: 0.02, flLift: 0.0, frSwing: -0.02, frLift: 0.0,
    blSwing: -0.02, blLift: 0.0, brSwing: 0.02, brLift: 0.0,
    tailSway: 0.05, swimTuck: 0.0,
  },
  idle2: {
    bodyY: -0.025, bodySway: -0.01, jawOpen: 0.00, headLift: -0.005,
    flSwing: 0.02, flLift: 0.0, frSwing: -0.02, frLift: 0.0,
    blSwing: -0.02, blLift: 0.0, brSwing: 0.02, brLift: 0.0,
    tailSway: -0.05, swimTuck: 0.0,
  },

  // Sinuous reptilian belly-crawl
  crawl0: {
    bodyY: 0.01, bodySway: 0.04, jawOpen: 0.04, headLift: 0.02,
    flSwing: 0.14, flLift: 0.07, frSwing: -0.10, frLift: 0.00,
    blSwing: -0.10, blLift: 0.00, brSwing: 0.14, brLift: 0.07,
    tailSway: -0.14, swimTuck: 0.0,
  },
  crawl1: {
    bodyY: 0.02, bodySway: 0.02, jawOpen: 0.06, headLift: 0.025,
    flSwing: 0.08, flLift: 0.02, frSwing: -0.02, frLift: 0.04,
    blSwing: -0.02, blLift: 0.04, brSwing: 0.08, brLift: 0.02,
    tailSway: -0.06, swimTuck: 0.0,
  },
  crawl2: {
    bodyY: 0.01, bodySway: -0.02, jawOpen: 0.04, headLift: 0.015,
    flSwing: -0.06, flLift: 0.00, frSwing: 0.10, frLift: 0.08,
    blSwing: 0.10, blLift: 0.08, brSwing: -0.06, brLift: 0.00,
    tailSway: 0.06, swimTuck: 0.0,
  },
  crawl3: {
    bodyY: 0.01, bodySway: -0.04, jawOpen: 0.04, headLift: 0.02,
    flSwing: -0.10, flLift: 0.00, frSwing: 0.14, frLift: 0.07,
    blSwing: 0.14, blLift: 0.07, brSwing: -0.10, brLift: 0.00,
    tailSway: 0.14, swimTuck: 0.0,
  },
  crawl4: {
    bodyY: 0.02, bodySway: -0.02, jawOpen: 0.06, headLift: 0.025,
    flSwing: -0.02, flLift: 0.04, frSwing: 0.08, frLift: 0.02,
    blSwing: 0.08, blLift: 0.02, brSwing: -0.02, brLift: 0.04,
    tailSway: 0.06, swimTuck: 0.0,
  },
  crawl5: {
    bodyY: 0.01, bodySway: 0.02, jawOpen: 0.04, headLift: 0.015,
    flSwing: 0.10, flLift: 0.08, frSwing: -0.06, frLift: 0.00,
    blSwing: -0.06, blLift: 0.00, brSwing: 0.10, brLift: 0.08,
    tailSway: -0.06, swimTuck: 0.0,
  },

  // Tail-sweeping aquatic glide (legs tucked back)
  swim0: {
    bodyY: -0.04, bodySway: 0.05, jawOpen: 0.02, headLift: 0.01,
    flSwing: -0.14, flLift: 0.06, frSwing: -0.14, frLift: 0.06,
    blSwing: -0.16, blLift: 0.07, brSwing: -0.16, brLift: 0.07,
    tailSway: -0.22, swimTuck: 1.0,
  },
  swim1: {
    bodyY: -0.03, bodySway: 0.00, jawOpen: 0.02, headLift: 0.015,
    flSwing: -0.14, flLift: 0.06, frSwing: -0.14, frLift: 0.06,
    blSwing: -0.16, blLift: 0.07, brSwing: -0.16, brLift: 0.07,
    tailSway: 0.00, swimTuck: 1.0,
  },
  swim2: {
    bodyY: -0.04, bodySway: -0.05, jawOpen: 0.02, headLift: 0.01,
    flSwing: -0.14, flLift: 0.06, frSwing: -0.14, frLift: 0.06,
    blSwing: -0.16, blLift: 0.07, brSwing: -0.16, brLift: 0.07,
    tailSway: 0.22, swimTuck: 1.0,
  },
  swim3: {
    bodyY: -0.03, bodySway: 0.00, jawOpen: 0.02, headLift: 0.015,
    flSwing: -0.14, flLift: 0.06, frSwing: -0.14, frLift: 0.06,
    blSwing: -0.16, blLift: 0.07, brSwing: -0.16, brLift: 0.07,
    tailSway: 0.00, swimTuck: 1.0,
  },

  // Wide-open tooth-filled snapping jaws!
  snap0: {
    bodyY: 0.02, bodySway: 0.00, jawOpen: 0.72, headLift: 0.06,
    flSwing: 0.06, flLift: 0.0, frSwing: 0.06, frLift: 0.0,
    blSwing: -0.04, blLift: 0.0, brSwing: -0.04, brLift: 0.0,
    tailSway: 0.08, swimTuck: 0.0,
  },
  snap1: {
    bodyY: 0.04, bodySway: 0.00, jawOpen: 1.00, headLift: 0.09,
    flSwing: 0.10, flLift: 0.02, frSwing: 0.10, frLift: 0.02,
    blSwing: -0.06, blLift: 0.0, brSwing: -0.06, brLift: 0.0,
    tailSway: -0.08, swimTuck: 0.0,
  },
  snap2: {
    bodyY: 0.01, bodySway: 0.00, jawOpen: 0.04, headLift: 0.02,
    flSwing: 0.12, flLift: 0.0, frSwing: 0.12, frLift: 0.0,
    blSwing: -0.06, blLift: 0.0, brSwing: -0.06, brLift: 0.0,
    tailSway: 0.00, swimTuck: 0.0,
  },
};

const alligatorCache = new Map<AlligatorPoseName, Boar27Pack>();
 function buildAlligatorPosePack(pose: AlligatorPoseName): Boar27Pack {
  let pack = alligatorCache.get(pose);
  if (!pack) {
    const P = ALLIGATOR_POSES[pose];
    const by = P.bodyY;
    const sw = P.bodySway;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // 1. Heavy, low-slung armored crocodilian torso & neck
      const chest = sdEllipsoid(x, y, z, sw * 0.4, -0.03 + by, 0.24, 0.21, 0.135, 0.24);
      const belly = sdEllipsoid(x, y, z, 0, -0.03 + by, -0.04, 0.23, 0.14, 0.28);
      const hips = sdEllipsoid(x, y, z, -sw * 0.4, -0.04 + by, -0.32, 0.19, 0.13, 0.22);
      const neck = sdCapsule(x, y, z, sw * 0.4, -0.02 + by, 0.34, sw * 0.5, 0.01 + by + P.headLift * 0.5, 0.54, 0.145, 0.13);
      let body = smin(smin(chest, belly, 0.07), smin(hips, neck, 0.06), 0.07);

      // 2. Broad, rounded U-shaped Alligator snout & snapping lower jaw
      const hX = sw * 0.5;
      const hY = 0.02 + by + P.headLift;
      const hZ = 0.58;
      const skull = sdEllipsoid(x, y, z, hX, hY + 0.02, hZ, 0.145, 0.095, 0.135);

      const upperTilt = P.jawOpen * 0.11;
      const lowerDrop = P.jawOpen * 0.13;

      // Broad rounded U-shaped upper jaw (wider & blunter than a crocodile!)
      const upperBase = sdEllipsoid(x, y, z, hX, hY + 0.01 + upperTilt * 0.5, hZ + 0.17, 0.132, 0.062, 0.165);
      const upperTip = sdEllipsoid(x, y, z, hX, hY + 0.005 + upperTilt, hZ + 0.30, 0.105, 0.048, 0.082);
      const nostrils = sdEllipsoid(x, y, z, hX, hY + 0.045 + upperTilt, hZ + 0.32, 0.055, 0.028, 0.036);
      const upperJaw = smin(smin(upperBase, upperTip, 0.035), nostrils, 0.02);

      // Lower jaw opening cleanly in snap0..2
      const lowerJaw = sdCapsule(
        x, y, z,
        hX, hY - 0.045, hZ + 0.04,
        hX, hY - 0.048 - lowerDrop, hZ + 0.29 - P.jawOpen * 0.03,
        0.105, 0.072
      );

      let head = smin(skull, upperJaw, 0.035);
      head = smin(head, lowerJaw, P.jawOpen > 0.2 ? 0.015 : 0.035);
      body = smin(body, head, 0.045);

      // Raised periscope brow ridges & golden-amber eyes
      const browL = sdEllipsoid(x, y, z, hX - 0.088, hY + 0.105 + upperTilt * 0.2, hZ + 0.04, 0.042, 0.036, 0.048);
      const browR = sdEllipsoid(x, y, z, hX + 0.088, hY + 0.105 + upperTilt * 0.2, hZ + 0.04, 0.042, 0.036, 0.048);
      body = smin(body, Math.min(browL, browR), 0.02);

      const eyeL = sdEllipsoid(x, y, z, hX - 0.098, hY + 0.108 + upperTilt * 0.2, hZ + 0.055, 0.030, 0.030, 0.030);
      const eyeR = sdEllipsoid(x, y, z, hX + 0.098, hY + 0.108 + upperTilt * 0.2, hZ + 0.055, 0.030, 0.030, 0.030);
      const eyes = Math.min(eyeL, eyeR);

      // 3. Long muscular ridged tail sweeping behind
      const t1X = -sw * 0.4 + P.tailSway * 0.32;
      const t2X = P.tailSway * 0.72;
      const t3X = P.tailSway;
      const tail1 = sdCapsule(x, y, z, -sw * 0.4, -0.04 + by, -0.44, t1X, -0.06 + by, -0.76, 0.135, 0.095);
      const tail2 = sdCapsule(x, y, z, t1X, -0.06 + by, -0.76, t2X, -0.08 + by, -1.06, 0.092, 0.058);
      const tail3 = sdCapsule(x, y, z, t2X, -0.08 + by, -1.06, t3X, -0.09 + by, -1.32, 0.056, 0.024);
      const tail = smin(smin(tail1, tail2, 0.04), tail3, 0.035);
      body = smin(body, tail, 0.055);

      // 4. Sculpted armored dorsal scutes / osteoderms along back & tail crest
      let scutes = 99;
      for (let i = 0; i < 6; i++) {
        const sz = 0.34 - i * 0.145;
        const sxOff = sw * (0.4 - i * 0.16);
        const sL = sdEllipsoid(x, y, z, sxOff - 0.065, 0.105 + by, sz, 0.034, 0.038, 0.055);
        const sR = sdEllipsoid(x, y, z, sxOff + 0.065, 0.105 + by, sz, 0.034, 0.038, 0.055);
        scutes = Math.min(scutes, Math.min(sL, sR));
      }
      // Tall single caudal ridge scutes along tail
      for (let i = 0; i < 4; i++) {
        const t = (i + 1) / 4;
        const sz = -0.52 - i * 0.19;
        const sx = t1X * (1 - t) + t3X * t;
        const sc = sdEllipsoid(x, y, z, sx, 0.035 + by - i * 0.015, sz, 0.024, 0.048 - i * 0.006, 0.068);
        scutes = Math.min(scutes, sc);
      }
      body = smin(body, scutes, 0.02);

      // 5. Sturdy splayed clawed legs
      const leg = (sx: number, shZ: number, swing: number, lift: number) => {
        const sign = sx < 0 ? -1 : 1;
        const outX = sx + sign * (0.14 - P.swimTuck * 0.06);
        const fy = -0.22 + lift;
        const fz = shZ + swing;
        const upper = sdCapsule(x, y, z, sx, -0.06 + by, shZ, outX, -0.10 + by + lift * 0.5, shZ + swing * 0.4, 0.064, 0.050);
        const lower = sdCapsule(x, y, z, outX, -0.10 + by + lift * 0.5, shZ + swing * 0.4, outX + sign * 0.03, fy + 0.02, fz, 0.048, 0.036);
        const foot = sdEllipsoid(x, y, z, outX + sign * 0.04, fy, fz + 0.035, 0.062, 0.028, 0.068);
        return smin(smin(upper, lower, 0.02), foot, 0.02);
      };
      const legs = Math.min(
        Math.min(leg(-0.18, 0.24, P.flSwing, P.flLift), leg(0.18, 0.24, P.frSwing, P.frLift)),
        Math.min(leg(-0.17, -0.30, P.blSwing, P.blLift), leg(0.17, -0.30, P.brSwing, P.brLift))
      );
      body = smin(body, legs, 0.03);

      // 6. Visible mouth interior & crisp white teeth when jaws open in snap0..2
      let mouth = 99;
      let teeth = 99;
      if (P.jawOpen > 0.25) {
        mouth = sdEllipsoid(x, y, z, hX, hY - 0.015, hZ + 0.16, 0.088, 0.055 * P.jawOpen, 0.12);
        for (let i = 0; i < 3; i++) {
          const tz = hZ + 0.13 + i * 0.075;
          const tUL = sdCapsule(x, y, z, hX - 0.085, hY - 0.01 + upperTilt * 0.7, tz, hX - 0.082, hY - 0.052 + upperTilt * 0.7, tz, 0.015, 0.007);
          const tUR = sdCapsule(x, y, z, hX + 0.085, hY - 0.01 + upperTilt * 0.7, tz, hX + 0.082, hY - 0.052 + upperTilt * 0.7, tz, 0.015, 0.007);
          teeth = Math.min(teeth, Math.min(tUL, tUR));
        }
      }

      let d = body;
      let mat = 'scales';
      if (scutes < body + 0.005 && y > 0.05 + by) mat = 'scute';
      if (mouth < d) { d = mouth; mat = 'mouth'; }
      if (teeth < d) { d = teeth; mat = 'tooth'; }
      if (eyes < d) { d = eyes; mat = 'eye'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'eye') {
        const hY = 0.02 + by + P.headLift;
        const hZ = 0.58;
        const upperTilt = P.jawOpen * 0.11;
        if (y > hY + 0.114 + upperTilt * 0.2 && z > hZ + 0.062) return 'W';
        if (Math.abs(Math.abs(x) - 0.098) < 0.008) return 'k';
        return 'e';
      }
      if (mat === 'mouth') return 'm';
      if (mat === 'tooth') return 'W';
      if (mat === 'scute') {
        return shade > 0.76 ? 'a4' : shade > 0.48 ? 'a3' : shade > 0.22 ? 'a2' : 'a0';
      }

      // Pale warm cream-yellow belly & lower jaw underside
      if (y < -0.105 + by) return shade > 0.44 ? 'c1' : 'c0';

      // Subtle armored transverse band mottling along back & tail
      const band = Math.sin(z * 20.0) > 0.35 ? -0.12 : 0.0;
      const s = shade + band;
      return s > 0.84 ? 'a4' : s > 0.62 ? 'a3' : s > 0.38 ? 'a2' : s > 0.18 ? 'a1' : 'a0';
    };

    pack = build27Pack(ALLIGATOR_PW, ALLIGATOR_PH, 1.88, 0.84, ALLIGATOR_PAL, evalFn, shadeFn);
    alligatorCache.set(pose, pack);
  }
  return pack;
}

export function getAlligatorPosePack(...args: Parameters<typeof buildAlligatorPosePack>): ReturnType<typeof buildAlligatorPosePack> {
  return registerAnimalSpritePack(buildAlligatorPosePack(...args), { module: './Alligator.ts', factory: 'getAlligatorPosePack', args }, buildAlligatorPosePack);
}

const ALLIGATOR_IDLE: readonly AlligatorPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const ALLIGATOR_CRAWL: readonly AlligatorPoseName[] = ['crawl0', 'crawl1', 'crawl2', 'crawl3', 'crawl4', 'crawl5'];
const ALLIGATOR_SWIM: readonly AlligatorPoseName[] = ['swim0', 'swim1', 'swim2', 'swim3'];
const ALLIGATOR_SNAP: readonly AlligatorPoseName[] = ['snap0', 'snap1', 'snap2'];

/**
 * Armored Alligator / Caiman (Jacaré): lurks and swims near pondCenter,
 * lunging with a snapping bite if provoked.
 */
export class Alligator extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private readonly home = new THREE.Vector3();
  private state: 'idle' | 'crawl' | 'swim' | 'snap' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.8, 3.6);
  private gaitPhase = rand(0, Math.PI * 2);

  constructor(ctx: GameContext, pos: THREE.Vector3, pondCenter?: THREE.Vector3) {
    super(
      ctx,
      getAlligatorPosePack('idle0').getView(2, 0)!,
      ALLIGATOR_PW,
      ALLIGATOR_PH,
      ALLIGATOR_W,
      ALLIGATOR_H,
      'AlligatorBillboard'
    );
    this.hp = 90;
    this.maxHp = 90;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.42;
    this.motor.height = 0.38;
    this.motor.teleport(pos);
    this.home.copy(pondCenter ?? pos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.46, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.set(this.position.x, this.position.y + 0.20, this.position.z);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y + 0.08, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.34, this.position.z);
    this.hurtboxes[0].enabled = this.alive;
    this.stickRoot.position.set(this.position.x, this.position.y + 0.20, this.position.z);
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
      this.state = 'snap';
      this.stateT = 0;
      this.stateDur = 2.2;
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

        let vx = 0;
        let vz = 0;

        if (dist < 3.4 && this.state !== 'snap') {
          this.state = 'snap';
          this.stateT = 0;
          this.stateDur = 2.0;
        }

        const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);

        if (this.state === 'idle') {
          if (this.stateT >= this.stateDur) {
            this.state = toHome < 3.8 && Math.random() < 0.55 ? 'swim' : 'crawl';
            this.stateT = 0;
            this.stateDur = rand(2.0, 3.8);
            if (toHome > 6.2) {
              this.facing = Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.4, 0.4);
            } else {
              this.facing += rand(-1.0, 1.0);
            }
          }
        } else if (this.state === 'crawl' || this.state === 'swim') {
          const speed = this.state === 'swim' ? 1.85 : 1.25;
          vx = Math.sin(this.facing) * speed;
          vz = Math.cos(this.facing) * speed;
          if (this.stateT >= this.stateDur) {
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.8, 3.5);
          }
        } else if (this.state === 'snap') {
          if (target && target.alive) {
            const toPlayer = Math.atan2(target.position.x - this.position.x, target.position.z - this.position.z);
            this.facing += angleDiff(this.facing, toPlayer) * Math.min(1, dt * 6);
            if (dist > 1.3 && dist < 4.2) {
              vx = Math.sin(this.facing) * 2.4;
              vz = Math.cos(this.facing) * 2.4;
            }
          }
          if (this.stateT >= this.stateDur && dist > 4.6) {
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.5, 2.8);
          }
        }

        this.vel.x = damp(this.vel.x, vx, 8, dt);
        this.vel.z = damp(this.vel.z, vz, 8, dt);
        this.vel.y -= 20 * dt;
        this.motor.update(dt);

        const horiz = Math.hypot(this.vel.x, this.vel.z);
        if (horiz > 0.15 && this.motor.grounded) {
          this.gaitPhase += dt * 5.8 * (0.7 + horiz * 0.25);
        }
      }
      this.syncHurtbox();
    }

    let pose: AlligatorPoseName;
    if (!this.alive) pose = 'idle0';
    else if (this.state === 'snap') pose = pickCycle(ALLIGATOR_SNAP, this.stateT * 4.2);
    else if (this.state === 'swim') pose = pickCycle(ALLIGATOR_SWIM, this.stateT * 4.6);
    else if (this.state === 'crawl') pose = pickCycle(ALLIGATOR_CRAWL, (this.gaitPhase / Math.PI) * 3.0);
    else pose = pickCycle(ALLIGATOR_IDLE, this.stateT * 1.8);

    const deathSink = this.alive ? 0 : Math.min(0.16, this.deadT * 0.35);
    this.renderBillboard(getAlligatorPosePack(pose), this.position.y + 0.20 - deathSink, camera, drawingBufferSize);
  }
}
