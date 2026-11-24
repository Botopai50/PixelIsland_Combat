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
// PELICANO (Flagship Great White Pelican) — 52×44 @ 56 PPU
// ============================================================================
export type PelicanPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'walk0' | 'walk1' | 'walk2' | 'walk3' | 'walk4' | 'walk5'
  | 'gulp0' | 'gulp1' | 'gulp2'
  | 'flap0' | 'flap1' | 'flap2' | 'flap3' | 'flap4' | 'flap5';

export const PELICAN_PW = 52;
export const PELICAN_PH = 44;
export const PELICAN_W = PELICAN_PW / ANIMAL_PPU;
export const PELICAN_H = PELICAN_PH / ANIMAL_PPU;

const PELICAN_PAL: Record<string, [number, number, number]> = {
  k:  [0x14, 0x12, 0x16], // crisp 1px dark outline / glossy eye / black wingtip shadow
  b0: [0x26, 0x24, 0x2b], // jet-black primary flight feathers
  b1: [0x42, 0x3f, 0x4a], // sunlit dark-charcoal primary edge
  w0: [0xa6, 0xa8, 0xb5], // cool grey-white plumage shadow
  w1: [0xc7, 0xc9, 0xd4], // soft silver-white feather midtone
  w2: [0xe6, 0xe8, 0xf0], // bright white plumage
  w3: [0xf7, 0xf2, 0xe4], // warm peach-cream chest & crown wash
  w4: [0xff, 0xff, 0xff], // pure snow-white highlight & eye glint
  y0: [0xc9, 0x6b, 0x18], // golden-orange bill / webbed feet shadow
  y1: [0xf2, 0x99, 0x24], // vibrant golden-orange upper bill & feet
  y2: [0xff, 0xc9, 0x4a], // sunlit yellow-gold bill ridge
  p0: [0xc4, 0x52, 0x45], // coral-rose gular throat pouch shadow / bill hook tip
  p1: [0xeb, 0x7b, 0x5e], // warm coral-pink gular throat pouch
  p2: [0xff, 0xad, 0x82], // sunlit peach-amber inflated pouch highlight
};

interface PelicanPose {
  bodyY: number;
  headY: number;
  headZ: number;
  billOpen: number;
  pouchInflate: number; // 0 = normal hanging pouch, 1 = ballooned gulp pouch
  wingSpan: number;     // 0 = folded against flanks, >0 = outstretched flapping
  wingMidY: number;
  wingTipY: number;
  legSwingL: number;
  legLiftL: number;
  legSwingR: number;
  legLiftR: number;
}

const PELICAN_POSES: Record<PelicanPoseName, PelicanPose> = {
  // Proud waterbird stance with prominent hanging throat pouch
  idle0: {
    bodyY: 0.00, headY: 0.00, headZ: 0.00, billOpen: 0.00, pouchInflate: 0.25,
    wingSpan: 0.0, wingMidY: 0.0, wingTipY: 0.0,
    legSwingL: 0.02, legLiftL: 0.0, legSwingR: -0.02, legLiftR: 0.0,
  },
  idle1: {
    bodyY: 0.02, headY: 0.03, headZ: 0.01, billOpen: 0.04, pouchInflate: 0.35,
    wingSpan: 0.0, wingMidY: 0.0, wingTipY: 0.0,
    legSwingL: 0.02, legLiftL: 0.0, legSwingR: -0.02, legLiftR: 0.0,
  },
  idle2: {
    bodyY: -0.015, headY: -0.02, headZ: 0.02, billOpen: 0.00, pouchInflate: 0.20,
    wingSpan: 0.0, wingMidY: 0.0, wingTipY: 0.0,
    legSwingL: 0.02, legLiftL: 0.0, legSwingR: -0.02, legLiftR: 0.0,
  },

  // Webbed-foot shore waddle
  walk0: {
    bodyY: 0.01, headY: 0.01, headZ: 0.02, billOpen: 0.02, pouchInflate: 0.28,
    wingSpan: 0.0, wingMidY: 0.0, wingTipY: 0.0,
    legSwingL: 0.16, legLiftL: 0.10, legSwingR: -0.14, legLiftR: 0.00,
  },
  walk1: {
    bodyY: 0.03, headY: 0.02, headZ: 0.03, billOpen: 0.04, pouchInflate: 0.32,
    wingSpan: 0.0, wingMidY: 0.0, wingTipY: 0.0,
    legSwingL: 0.08, legLiftL: 0.02, legSwingR: -0.04, legLiftR: 0.05,
  },
  walk2: {
    bodyY: 0.00, headY: -0.01, headZ: 0.01, billOpen: 0.02, pouchInflate: 0.26,
    wingSpan: 0.0, wingMidY: 0.0, wingTipY: 0.0,
    legSwingL: -0.06, legLiftL: 0.00, legSwingR: 0.10, legLiftR: 0.10,
  },
  walk3: {
    bodyY: 0.01, headY: 0.01, headZ: 0.02, billOpen: 0.02, pouchInflate: 0.28,
    wingSpan: 0.0, wingMidY: 0.0, wingTipY: 0.0,
    legSwingL: -0.14, legLiftL: 0.00, legSwingR: 0.16, legLiftR: 0.10,
  },
  walk4: {
    bodyY: 0.03, headY: 0.02, headZ: 0.03, billOpen: 0.04, pouchInflate: 0.32,
    wingSpan: 0.0, wingMidY: 0.0, wingTipY: 0.0,
    legSwingL: -0.04, legLiftL: 0.05, legSwingR: 0.08, legLiftR: 0.02,
  },
  walk5: {
    bodyY: 0.00, headY: -0.01, headZ: 0.01, billOpen: 0.02, pouchInflate: 0.26,
    wingSpan: 0.0, wingMidY: 0.0, wingTipY: 0.0,
    legSwingL: 0.10, legLiftL: 0.10, legSwingR: -0.06, legLiftR: 0.00,
  },

  // Giant gular throat pouch puffed out scooping & gulping!
  gulp0: {
    bodyY: -0.02, headY: -0.06, headZ: 0.07, billOpen: 0.55, pouchInflate: 0.85,
    wingSpan: 0.0, wingMidY: 0.0, wingTipY: 0.0,
    legSwingL: 0.04, legLiftL: 0.0, legSwingR: -0.04, legLiftR: 0.0,
  },
  gulp1: {
    bodyY: 0.02, headY: 0.04, headZ: 0.03, billOpen: 0.85, pouchInflate: 1.00,
    wingSpan: 0.0, wingMidY: 0.0, wingTipY: 0.0,
    legSwingL: 0.04, legLiftL: 0.0, legSwingR: -0.04, legLiftR: 0.0,
  },
  gulp2: {
    bodyY: 0.04, headY: 0.09, headZ: -0.02, billOpen: 0.20, pouchInflate: 0.72,
    wingSpan: 0.0, wingMidY: 0.0, wingTipY: 0.0,
    legSwingL: 0.02, legLiftL: 0.0, legSwingR: -0.02, legLiftR: 0.0,
  },

  // Broad wings spread & flapping (smooth continuous wings with black primaries!)
  flap0: {
    bodyY: 0.02, headY: 0.02, headZ: 0.04, billOpen: 0.15, pouchInflate: 0.35,
    wingSpan: 0.76, wingMidY: 0.24, wingTipY: 0.42,
    legSwingL: -0.10, legLiftL: 0.12, legSwingR: -0.08, legLiftR: 0.10,
  },
  flap1: {
    bodyY: 0.04, headY: 0.03, headZ: 0.05, billOpen: 0.18, pouchInflate: 0.38,
    wingSpan: 0.84, wingMidY: 0.12, wingTipY: 0.20,
    legSwingL: -0.12, legLiftL: 0.15, legSwingR: -0.10, legLiftR: 0.14,
  },
  flap2: {
    bodyY: 0.06, headY: 0.02, headZ: 0.05, billOpen: 0.15, pouchInflate: 0.35,
    wingSpan: 0.84, wingMidY: -0.06, wingTipY: -0.16,
    legSwingL: -0.14, legLiftL: 0.16, legSwingR: -0.12, legLiftR: 0.15,
  },
  flap3: {
    bodyY: 0.07, headY: 0.01, headZ: 0.04, billOpen: 0.12, pouchInflate: 0.32,
    wingSpan: 0.74, wingMidY: -0.20, wingTipY: -0.36,
    legSwingL: -0.14, legLiftL: 0.16, legSwingR: -0.12, legLiftR: 0.15,
  },
  flap4: {
    bodyY: 0.04, headY: 0.02, headZ: 0.04, billOpen: 0.14, pouchInflate: 0.34,
    wingSpan: 0.80, wingMidY: -0.06, wingTipY: -0.12,
    legSwingL: -0.12, legLiftL: 0.14, legSwingR: -0.10, legLiftR: 0.12,
  },
  flap5: {
    bodyY: 0.02, headY: 0.02, headZ: 0.04, billOpen: 0.15, pouchInflate: 0.35,
    wingSpan: 0.80, wingMidY: 0.12, wingTipY: 0.24,
    legSwingL: -0.10, legLiftL: 0.12, legSwingR: -0.08, legLiftR: 0.10,
  },
};

const pelicanCache = new Map<PelicanPoseName, Boar27Pack>();
 function buildPelicanPosePack(pose: PelicanPoseName): Boar27Pack {
  let pack = pelicanCache.get(pose);
  if (!pack) {
    const P = PELICAN_POSES[pose];
    const by = P.bodyY;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // 1. Plump snow-white waterbird body + breast + short fanned white tail
      const torso = sdEllipsoid(x, y, z, 0, -0.04 + by, -0.08, 0.23, 0.20, 0.30);
      const breast = sdEllipsoid(x, y, z, 0, -0.01 + by, 0.10, 0.21, 0.19, 0.20);
      const tail = sdCapsule(x, y, z, 0, -0.02 + by, -0.30, 0, 0.02 + by, -0.50, 0.11, 0.055);
      let body = smin(smin(torso, breast, 0.07), tail, 0.05);

      // 2. Graceful S-curved neck + head with occipital crest tuft
      const hY = 0.31 + by + P.headY;
      const hZ = 0.20 + P.headZ;
      const neckLow = sdCapsule(x, y, z, 0, 0.06 + by, 0.16, 0, 0.17 + by + P.headY * 0.4, 0.09 + P.headZ * 0.4, 0.115, 0.092);
      const neckHigh = sdCapsule(x, y, z, 0, 0.17 + by + P.headY * 0.4, 0.09 + P.headZ * 0.4, 0, hY - 0.02, hZ - 0.02, 0.092, 0.085);
      const skull = sdEllipsoid(x, y, z, 0, hY, hZ, 0.105, 0.102, 0.125);
      const crest = sdCapsule(x, y, z, 0, hY + 0.04, hZ - 0.07, 0, hY + 0.09, hZ - 0.19, 0.048, 0.020);
      const headGroup = smin(smin(neckLow, neckHigh, 0.045), smin(skull, crest, 0.03), 0.045);
      body = smin(body, headGroup, 0.06);

      // 3. Wings: either folded cleanly against the flanks or spread wide in flight (NO dark seam!)
      let wings = 99;
      let wingTips = 99;
      if (P.wingSpan <= 0.01) {
        const foldL = sdEllipsoid(x, y, z, -0.20, -0.01 + by, -0.10, 0.085, 0.145, 0.28);
        const foldR = sdEllipsoid(x, y, z,  0.20, -0.01 + by, -0.10, 0.085, 0.145, 0.28);
        const tipL = sdCapsule(x, y, z, -0.19, -0.03 + by, -0.24, -0.14, -0.01 + by, -0.48, 0.068, 0.035);
        const tipR = sdCapsule(x, y, z,  0.19, -0.03 + by, -0.24,  0.14, -0.01 + by, -0.48, 0.068, 0.035);
        wings = smin(Math.min(foldL, foldR), Math.min(tipL, tipR), 0.04);
        wingTips = Math.min(tipL, tipR);
      } else {
        const midX = P.wingSpan * 0.50;
        const tipX = P.wingSpan;
        const midY = by + P.wingMidY;
        const tipY = by + P.wingTipY;
        // Solid continuous single-sheet wing web from leading edge to trailing edge
        const inL = sdCapsule(x, y, z, -0.18, 0.03 + by, 0.02, -midX, midY, -0.02, 0.115, 0.092);
        const outL = sdCapsule(x, y, z, -midX, midY, -0.02, -tipX, tipY, -0.10, 0.090, 0.046);
        const trailL = sdCapsule(x, y, z, -0.20, 0.01 + by, -0.14, -midX * 0.96, midY - 0.01, -0.16, 0.095, 0.068);

        const inR = sdCapsule(x, y, z,  0.18, 0.03 + by, 0.02,  midX, midY, -0.02, 0.115, 0.092);
        const outR = sdCapsule(x, y, z,  midX, midY, -0.02,  tipX, tipY, -0.10, 0.090, 0.046);
        const trailR = sdCapsule(x, y, z,  0.20, 0.01 + by, -0.14,  midX * 0.96, midY - 0.01, -0.16, 0.095, 0.068);

        const wL = smin(smin(inL, outL, 0.055), trailL, 0.065);
        const wR = smin(smin(inR, outR, 0.055), trailR, 0.065);
        wings = Math.min(wL, wR);
        wingTips = Math.min(outL, outR);
      }
      body = smin(body, wings, 0.045);

      // 4. Huge long flat golden-orange upper bill with hooked tip + massive coral-pink gular throat pouch!
      const billTipY = hY - 0.02 + P.billOpen * 0.07;
      const billTipZ = hZ + 0.50;
      const upperBill = sdCapsule(x, y, z, 0, hY + 0.005, hZ + 0.08, 0, billTipY, billTipZ, 0.058, 0.038);
      const billHook = sdCapsule(x, y, z, 0, billTipY, billTipZ - 0.01, 0, billTipY - 0.045, billTipZ + 0.02, 0.032, 0.016);
      const bill = smin(upperBill, billHook, 0.018);

      // Massive expandable gular throat pouch hanging under the bill
      const inf = P.pouchInflate;
      const lowerRim = sdCapsule(
        x, y, z,
        0, hY - 0.035, hZ + 0.08,
        0, hY - 0.06 - P.billOpen * 0.12, billTipZ - 0.03,
        0.052, 0.032
      );
      const pouchBelly = sdEllipsoid(
        x, y, z,
        0,
        hY - 0.115 - inf * 0.085 - P.billOpen * 0.06,
        hZ + 0.25,
        0.072 + inf * 0.058,
        0.078 + inf * 0.082,
        0.185 + inf * 0.035
      );
      const pouch = smin(lowerRim, pouchBelly, 0.045);

      // 5. Webbed golden-orange legs & feet
      const leg = (sx: number, swing: number, lift: number) => {
        const fy = -0.35 + lift;
        const fz = -0.05 + swing;
        const shin = sdCapsule(x, y, z, sx, -0.17 + by, -0.06, sx, fy + 0.03, fz, 0.042, 0.030);
        const webFoot = sdEllipsoid(x, y, z, sx, fy, fz + 0.055, 0.062, 0.024, 0.078);
        return smin(shin, webFoot, 0.02);
      };
      const legs = Math.min(
        leg(-0.095, P.legSwingL, P.legLiftL),
        leg( 0.095, P.legSwingR, P.legLiftR)
      );

      // Bright dark eyes with white glint
      const eyeL = sdEllipsoid(x, y, z, -0.082, hY + 0.028, hZ + 0.065, 0.028, 0.028, 0.028);
      const eyeR = sdEllipsoid(x, y, z,  0.082, hY + 0.028, hZ + 0.065, 0.028, 0.028, 0.028);
      const eyes = Math.min(eyeL, eyeR);

      let d = smin(body, smin(bill, pouch, 0.02), 0.025);
      d = smin(d, legs, 0.025);

      let mat = 'plumage';
      if (wingTips < body + 0.008 && (Math.abs(x) > 0.36 || z < -0.26)) mat = 'wingTip';
      if (pouch < bill + 0.005 && pouch < body + 0.01) mat = 'pouch';
      if (bill < pouch + 0.004 && bill < body + 0.008) mat = 'bill';
      if (billHook < upperBill + 0.005 && z > billTipZ - 0.04) mat = 'hook';
      if (legs < body + 0.006 && y < -0.18 + by) mat = 'foot';
      if (eyes < d) { d = eyes; mat = 'eye'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, x, y, z) => {
      if (mat === 'eye') {
        const hY = 0.31 + by + P.headY;
        const hZ = 0.20 + P.headZ;
        if (y > hY + 0.032 && z > hZ + 0.070 && Math.abs(x) < 0.088) return 'w4';
        return 'k';
      }
      if (mat === 'hook') return 'p0';
      if (mat === 'bill') {
        return shade > 0.72 ? 'y2' : shade > 0.38 ? 'y1' : 'y0';
      }
      if (mat === 'pouch') {
        return shade > 0.72 ? 'p2' : shade > 0.36 ? 'p1' : 'p0';
      }
      if (mat === 'foot') {
        return shade > 0.45 ? 'y1' : 'y0';
      }
      if (mat === 'wingTip') {
        return shade > 0.52 ? 'b1' : 'b0';
      }

      // Warm peach-cream wash on the breast & crown
      const onChest = z > 0.06 && z < 0.26 && y > -0.08 + by && y < 0.16 + by && Math.abs(x) < 0.16;
      if (onChest && shade > 0.48) return 'w3';

      return shade > 0.82 ? 'w4' : shade > 0.56 ? 'w2' : shade > 0.30 ? 'w1' : 'w0';
    };

    pack = build27Pack(PELICAN_PW, PELICAN_PH, 1.24, 1.04, PELICAN_PAL, evalFn, shadeFn);
    pelicanCache.set(pose, pack);
  }
  return pack;
}

export function getPelicanPosePack(...args: Parameters<typeof buildPelicanPosePack>): ReturnType<typeof buildPelicanPosePack> {
  return registerAnimalSpritePack(buildPelicanPosePack(...args), { module: './Pelican.ts', factory: 'getPelicanPosePack', args }, buildPelicanPosePack);
}

const PELICAN_IDLE: readonly PelicanPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const PELICAN_WALK: readonly PelicanPoseName[] = ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'];
const PELICAN_GULP: readonly PelicanPoseName[] = ['gulp0', 'gulp1', 'gulp2'];
const PELICAN_FLAP: readonly PelicanPoseName[] = ['flap0', 'flap1', 'flap2', 'flap3', 'flap4', 'flap5'];

/**
 * Great White Pelican (Pelicano): waddles near pondCenter, scoops with its giant gular throat pouch,
 * and flaps its broad black-tipped white wings.
 */
export class Pelican extends BasePixelAnimal {
  private readonly motor: CharacterMotor;
  get position() { return this.motor.position; }
  private get vel() { return this.motor.velocity; }
  private readonly home = new THREE.Vector3();
  private state: 'idle' | 'walk' | 'gulp' | 'flap' = 'idle';
  private stateT = 0;
  private stateDur = rand(1.5, 3.0);
  private gaitPhase = rand(0, Math.PI * 2);

  constructor(ctx: GameContext, pos: THREE.Vector3, pondCenter?: THREE.Vector3) {
    super(ctx, getPelicanPosePack('idle0').getView(2, 0)!, PELICAN_PW, PELICAN_PH, PELICAN_W, PELICAN_H, 'PelicanBillboard');
    this.hp = 40;
    this.maxHp = 40;
    this.motor = new CharacterMotor(ctx.physics);
    this.bindAnimalMotor(this.motor);
    this.motor.radius = 0.28;
    this.motor.height = 0.52;
    this.motor.teleport(pos);
    this.home.copy(pondCenter ?? pos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.36, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.set(this.position.x, this.position.y + 0.34, this.position.z);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y + 0.12, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.56, this.position.z);
    this.hurtboxes[0].enabled = this.alive;
    this.stickRoot.position.set(this.position.x, this.position.y + 0.34, this.position.z);
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
    this.vel.y = 3.5;
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.state = 'flap';
      this.stateT = 0;
      this.stateDur = 2.2;
      this.facing = Math.atan2(hit.dir.x, hit.dir.z);
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

        if (dist < 2.6 && this.state !== 'flap') {
          this.state = 'flap';
          this.stateT = 0;
          this.stateDur = 2.0;
        }

        const toHome = Math.hypot(this.home.x - this.position.x, this.home.z - this.position.z);

        if (this.state === 'idle' || this.state === 'gulp') {
          if (this.stateT >= this.stateDur) {
            if (this.state === 'idle' && Math.random() < 0.42) {
              this.state = 'gulp';
              this.stateT = 0;
              this.stateDur = rand(1.6, 2.6);
            } else {
              this.state = 'walk';
              this.stateT = 0;
              this.stateDur = rand(1.8, 3.4);
              if (toHome > 5.8) {
                this.facing = Math.atan2(this.home.x - this.position.x, this.home.z - this.position.z) + rand(-0.4, 0.4);
              } else {
                this.facing += rand(-1.2, 1.2);
              }
            }
          }
        } else if (this.state === 'walk') {
          vx = Math.sin(this.facing) * 1.35;
          vz = Math.cos(this.facing) * 1.35;
          if (this.stateT >= this.stateDur) {
            this.state = Math.random() < 0.45 ? 'gulp' : 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.5, 2.8);
          }
        } else if (this.state === 'flap') {
          if (target && target.alive && dist < 4.5) {
            const away = Math.atan2(this.position.x - target.position.x, this.position.z - target.position.z);
            this.facing += angleDiff(this.facing, away) * Math.min(1, dt * 7);
          }
          vx = Math.sin(this.facing) * 3.1;
          vz = Math.cos(this.facing) * 3.1;
          if (this.stateT >= this.stateDur && dist > 4.5) {
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.4, 2.6);
          }
        }

        this.vel.x = damp(this.vel.x, vx, 8, dt);
        this.vel.z = damp(this.vel.z, vz, 8, dt);
        this.vel.y -= 20 * dt;
        this.motor.update(dt);

        const horiz = Math.hypot(this.vel.x, this.vel.z);
        if (horiz > 0.2 && this.motor.grounded) {
          this.gaitPhase += dt * 6.2 * (0.7 + horiz * 0.25);
        }
      }
      this.syncHurtbox();
    }

    let pose: PelicanPoseName;
    if (!this.alive) pose = 'idle0';
    else if (this.state === 'flap') pose = pickCycle(PELICAN_FLAP, this.stateT * 7.5);
    else if (this.state === 'gulp') pose = pickCycle(PELICAN_GULP, this.stateT * 2.4);
    else if (this.state === 'walk') pose = pickCycle(PELICAN_WALK, (this.gaitPhase / Math.PI) * 3.0);
    else pose = pickCycle(PELICAN_IDLE, this.stateT * 2.0);

    const deathSink = this.alive ? 0 : Math.min(0.22, this.deadT * 0.4);
    this.renderBillboard(getPelicanPosePack(pose), this.position.y + 0.34 - deathSink, camera, drawingBufferSize);
  }
}
