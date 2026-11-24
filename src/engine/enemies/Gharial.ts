import { sampleAnimalCycle } from './AnimalAnimation';
import { registerAnimalSpritePack } from './AnimalSpriteCache';
import * as THREE from 'three';
import type { GameContext } from '../core/Context';
import type { HitInfo, HitResult } from '../combat/types';
import { emptyResult } from '../combat/types';
import type { EnemyTarget } from './Enemy';
import type { Boar27Pack } from './Boar';
import {
  BasePixelAnimal,
  angleDiff,
  build27Pack,
  sdCapsule,
  sdEllipsoid,
  smin,
  type ColorShaper,
  type SdfEvaluator,
} from './Animals';
import { damp, rand } from '../core/math';

// ============================================================================
// GAVIAL (Gharial) — Flagship 80×30 @ 56 PPU
// ============================================================================
const ANIMAL_PPU = 56;

export type GharialPoseName =
  | 'idle0' | 'idle1' | 'idle2'
  | 'crawl0' | 'crawl1' | 'crawl2' | 'crawl3' | 'crawl4' | 'crawl5'
  | 'swim0' | 'swim1' | 'swim2' | 'swim3'
  | 'snap0' | 'snap1' | 'snap2';

export const GHARIAL_PW = 80;
export const GHARIAL_PH = 30;
export const GHARIAL_W = GHARIAL_PW / ANIMAL_PPU;
export const GHARIAL_H = GHARIAL_PH / ANIMAL_PPU;

const GHARIAL_PAL: Record<string, [number, number, number]> = {
  k:  [0x12, 0x16, 0x10], // 1px dark outline / pupil / dark cross-bands
  w:  [0xfc, 0xfa, 0xf2], // fine white needle teeth & eye glint
  g0: [0x22, 0x33, 0x1b], // deep olive-moss shadow & dark tail bands
  g1: [0x3c, 0x54, 0x2a], // rich olive-moss midtone
  g2: [0x5c, 0x78, 0x38], // warm olive-green
  g3: [0x87, 0x9e, 0x4b], // sunlit olive-ochre
  g4: [0xb8, 0xc2, 0x6b], // warm golden-ochre highlight
  c0: [0xc4, 0xbe, 0x9b], // pale cream belly shadow
  c1: [0xeb, 0xe4, 0xc3], // pale cream belly
  e:  [0xf5, 0xb8, 0x24], // bright golden-amber eye
  m:  [0x8c, 0x32, 0x3c], // open jaw interior during fish snap
};

interface GharialPose {
  bodyY: number;
  headYaw: number;   // sideways fish-snatching swing!
  jawOpen: number;   // 0..1
  swimTuck: number;  // 0 = splayed feet, 1 = feet tucked back for sleek swim
  tailSway: number;
  fl: number;
  fr: number;
  bl: number;
  br: number;
}

const GHARIAL_POSES: Record<GharialPoseName, GharialPose> = {
  idle0:  { bodyY: 0.0,    headYaw: 0.0,   jawOpen: 0.0,  swimTuck: 0.0, tailSway: 0.0,   fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0   },
  idle1:  { bodyY: 0.008,  headYaw: 0.03,  jawOpen: 0.0,  swimTuck: 0.0, tailSway: 0.05,  fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0   },
  idle2:  { bodyY: -0.006, headYaw: -0.03, jawOpen: 0.0,  swimTuck: 0.0, tailSway: -0.05, fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0   },

  crawl0: { bodyY: 0.01,   headYaw: 0.04,  jawOpen: 0.0,  swimTuck: 0.0, tailSway: -0.08, fl: 0.12,  fr: -0.08, bl: -0.10, br: 0.10  },
  crawl1: { bodyY: 0.014,  headYaw: 0.02,  jawOpen: 0.0,  swimTuck: 0.0, tailSway: -0.04, fl: 0.06,  fr: -0.02, bl: -0.04, br: 0.05  },
  crawl2: { bodyY: 0.006,  headYaw: -0.02, jawOpen: 0.0,  swimTuck: 0.0, tailSway: 0.04,  fl: -0.02, fr: 0.06,  bl: 0.05,  br: -0.04 },
  crawl3: { bodyY: 0.01,   headYaw: -0.04, jawOpen: 0.0,  swimTuck: 0.0, tailSway: 0.08,  fl: -0.08, fr: 0.12,  bl: 0.10,  br: -0.10 },
  crawl4: { bodyY: 0.014,  headYaw: -0.02, jawOpen: 0.0,  swimTuck: 0.0, tailSway: 0.04,  fl: -0.02, fr: 0.06,  bl: 0.05,  br: -0.04 },
  crawl5: { bodyY: 0.006,  headYaw: 0.02,  jawOpen: 0.0,  swimTuck: 0.0, tailSway: -0.04, fl: 0.06,  fr: -0.02, bl: -0.04, br: 0.05  },

  // Sleek aquatic glide with rudder tail sweeping
  swim0:  { bodyY: 0.0,    headYaw: 0.04,  jawOpen: 0.0,  swimTuck: 1.0, tailSway: -0.18, fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0   },
  swim1:  { bodyY: 0.006,  headYaw: 0.0,   jawOpen: 0.0,  swimTuck: 1.0, tailSway: 0.0,   fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0   },
  swim2:  { bodyY: 0.0,    headYaw: -0.04, jawOpen: 0.0,  swimTuck: 1.0, tailSway: 0.18,  fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0   },
  swim3:  { bodyY: 0.006,  headYaw: 0.0,   jawOpen: 0.0,  swimTuck: 1.0, tailSway: 0.0,   fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0   },

  // Quick sideways fish-snatching jaw snap!
  snap0:  { bodyY: 0.01,   headYaw: -0.16, jawOpen: 0.70, swimTuck: 0.3, tailSway: 0.10,  fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0   },
  snap1:  { bodyY: 0.015,  headYaw: 0.22,  jawOpen: 1.00, swimTuck: 0.3, tailSway: -0.14, fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0   },
  snap2:  { bodyY: 0.005,  headYaw: 0.10,  jawOpen: 0.15, swimTuck: 0.3, tailSway: -0.06, fl: 0.0,   fr: 0.0,   bl: 0.0,   br: 0.0   },
};

const gharialCache = new Map<GharialPoseName, Boar27Pack>();
 function buildGharialPosePack(pose: GharialPoseName): Boar27Pack {
  let pack = gharialCache.get(pose);
  if (!pack) {
    const P = GHARIAL_POSES[pose];
    const by = P.bodyY;
    const hy = P.headYaw;
    const jo = P.jawOpen;
    const st = P.swimTuck;

    const evalFn: SdfEvaluator = (x, y, z) => {
      // --------------------------------------------------------------------
      // 1. SLEEK CROCODILIAN TORSO & LONG LATERALLY-FLATTENED RUDDER TAIL
      // --------------------------------------------------------------------
      const torso = sdCapsule(x, y, z, 0, -0.04 + by, -0.22, 0, -0.02 + by, 0.24, 0.155, 0.15);
      const tail1 = sdCapsule(x, y, z, 0, -0.04 + by, -0.22, P.tailSway * 0.45, -0.05 + by, -0.58, 0.13, 0.085);
      const tail2 = sdCapsule(x, y, z, P.tailSway * 0.45, -0.05 + by, -0.58, P.tailSway, -0.05 + by, -0.96, 0.082, 0.032);
      // Dorsal scute ridge along back and rudder tail
      const crest = sdCapsule(x, y, z, P.tailSway * 0.4, 0.04 + by, -0.58, 0, 0.08 + by, 0.16, 0.035, 0.042);

      // --------------------------------------------------------------------
      // 2. BROAD CRANIUM + EXTRAORDINARILY LONG RAZOR-NARROW TUBULAR SNOUT + GHARA KNOB!
      // --------------------------------------------------------------------
      const headX = hy * 0.35;
      const head = sdEllipsoid(x, y, z, headX, 0.01 + by, 0.34, 0.125, 0.085, 0.12);

      // Upper slender tubular snout
      const tipX = hy * 1.15;
      const upTipY = -0.01 + by + jo * 0.11;
      const tipZ = 0.94;
      const upperSnout = sdCapsule(x, y, z, headX, 0.00 + by, 0.40, tipX, upTipY, tipZ, 0.048, 0.030);

      // Lower slender jaw (opens in snap0..2)
      const lowTipY = -0.045 + by - jo * 0.10;
      const lowerJaw = sdCapsule(x, y, z, headX, -0.035 + by, 0.38, tipX, lowTipY, tipZ - 0.02, 0.044, 0.026);

      // Famous male bulbous rounded "ghara" knob perched right at the tip of the snout!
      const ghara = sdEllipsoid(x, y, z, tipX, upTipY + 0.035, tipZ + 0.01, 0.052, 0.046, 0.050);

      // --------------------------------------------------------------------
      // 3. WEBBED SPLAYED FEET (tuck cleanly against flanks when swimming)
      // --------------------------------------------------------------------
      const fOutX = 0.25 - st * 0.10;
      const fEndZ = 0.18 - st * 0.24;
      const bEndZ = -0.22 - st * 0.24;
      const fl = sdCapsule(x, y, z, -0.12, -0.06 + by, 0.18, -fOutX, -0.18 + by + st * 0.08, fEndZ + P.fl, 0.052, 0.040);
      const fr = sdCapsule(x, y, z,  0.12, -0.06 + by, 0.18,  fOutX, -0.18 + by + st * 0.08, fEndZ + P.fr, 0.052, 0.040);
      const bl = sdCapsule(x, y, z, -0.12, -0.07 + by, -0.20, -fOutX, -0.18 + by + st * 0.08, bEndZ + P.bl, 0.058, 0.042);
      const br = sdCapsule(x, y, z,  0.12, -0.07 + by, -0.20,  fOutX, -0.18 + by + st * 0.08, bEndZ + P.br, 0.058, 0.042);

      let body = smin(torso, tail1, 0.05);
      body = smin(body, tail2, 0.035);
      body = smin(body, crest, 0.025);
      body = smin(body, head, 0.045);
      body = smin(body, upperSnout, 0.025);
      body = smin(body, lowerJaw, 0.02);
      body = smin(body, ghara, 0.018);
      body = smin(body, Math.min(Math.min(fl, fr), Math.min(bl, br)), 0.03);

      // Bright golden-amber bulging crocodilian eyes + glint
      const eyeL = sdEllipsoid(x, y, z, headX - 0.082, 0.075 + by, 0.36, 0.034, 0.034, 0.032);
      const eyeR = sdEllipsoid(x, y, z, headX + 0.082, 0.075 + by, 0.36, 0.034, 0.034, 0.032);
      const glintL = sdEllipsoid(x, y, z, headX - 0.090, 0.090 + by, 0.38, 0.014, 0.014, 0.014);
      const glintR = sdEllipsoid(x, y, z, headX + 0.090, 0.090 + by, 0.38, 0.014, 0.014, 0.014);

      let d = body;
      let mat = 'skin';
      if (Math.min(eyeL, eyeR) < d) { d = Math.min(eyeL, eyeR); mat = 'eye'; }
      if (Math.min(glintL, glintR) < d) { d = Math.min(glintL, glintR); mat = 'glint'; }
      return { d, mat };
    };

    const shadeFn: ColorShaper = (mat, shade, _x, y, z) => {
      if (mat === 'glint') return 'w';
      if (mat === 'eye') return 'e';

      // Fine white needle teeth lining the long narrow snout!
      if (z > 0.44 && z < 0.90) {
        const toothWave = Math.sin(z * 58) > 0.35;
        const seamY = -0.025 + by;
        if (toothWave && Math.abs(y - seamY) < 0.028 + jo * 0.03) return 'w';
      }

      // Pale cream belly
      if (y < -0.10 + by && z > -0.40 && z < 0.32) {
        return shade > 0.45 ? 'c1' : 'c0';
      }

      // Dark cross-bands along the olive-moss / golden-ochre back & rudder tail
      const band = Math.sin(z * 16) > 0.42 && z < 0.28;
      if (band) return shade > 0.55 ? 'g1' : 'g0';

      if (shade > 0.78) return 'g4';
      if (shade > 0.56) return 'g3';
      if (shade > 0.34) return 'g2';
      if (shade > 0.16) return 'g1';
      return 'g0';
    };

    pack = build27Pack(GHARIAL_PW, GHARIAL_PH, 1.12, 0.58, GHARIAL_PAL, evalFn, shadeFn);
    gharialCache.set(pose, pack);
  }
  return pack;
}

export function getGharialPosePack(...args: Parameters<typeof buildGharialPosePack>): ReturnType<typeof buildGharialPosePack> {
  return registerAnimalSpritePack(buildGharialPosePack(...args), { module: './Gharial.ts', factory: 'getGharialPosePack', args }, buildGharialPosePack);
}

// ============================================================================
// INSTÂNCIA NA ARENA (Gharial — Pond-gliding fish hunter)
// ============================================================================
function pickCycle<T>(frames: readonly T[], idx: number): T {
  return sampleAnimalCycle(frames, idx);
}

const GHARIAL_IDLE: readonly GharialPoseName[] = ['idle0', 'idle1', 'idle0', 'idle2'];
const GHARIAL_CRAWL: readonly GharialPoseName[] = ['crawl0', 'crawl1', 'crawl2', 'crawl3', 'crawl4', 'crawl5'];
const GHARIAL_SWIM: readonly GharialPoseName[] = ['swim0', 'swim1', 'swim2', 'swim3'];
const GHARIAL_SNAP: readonly GharialPoseName[] = ['snap0', 'snap1', 'snap2'];

export class Gharial extends BasePixelAnimal {
  readonly position = new THREE.Vector3();
  private readonly vel = new THREE.Vector3();
  private readonly anchor = new THREE.Vector3();
  private state: 'idle' | 'swim' | 'snap' | 'flee' = 'swim';
  private stateT = 0;
  private stateDur = rand(1.8, 3.6);
  private targetYaw = rand(0, Math.PI * 2);
  private swimPhase = rand(0, Math.PI * 2);
  private waterY = 0;
  private readonly centerY = 0.22;

  constructor(ctx: GameContext, startPos: THREE.Vector3, pondCenter?: THREE.Vector3) {
    super(
      ctx,
      getGharialPosePack('idle0').getView(2, 0)!,
      GHARIAL_PW,
      GHARIAL_PH,
      GHARIAL_W,
      GHARIAL_H,
      'GharialBillboard',
    );
    this.hp = 95;
    this.maxHp = 95;
    this.waterY = startPos.y;
    this.anchor.copy(pondCenter ?? startPos);
    this.anchor.y = this.waterY;
    this.position.copy(startPos);
    this.hurtboxes.push({ a: new THREE.Vector3(), b: new THREE.Vector3(), radius: 0.48, tag: 'body', enabled: true });
    this.syncHurtbox();
  }

  center(out: THREE.Vector3): THREE.Vector3 {
    return out.set(this.position.x, this.position.y + this.centerY, this.position.z);
  }

  private syncHurtbox() {
    this.hurtboxes[0].a.set(this.position.x, this.position.y + 0.10, this.position.z);
    this.hurtboxes[0].b.set(this.position.x, this.position.y + 0.36, this.position.z);
    this.hurtboxes[0].enabled = this.alive;
    this.stickRoot.position.set(this.position.x, this.position.y + this.centerY, this.position.z);
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
    if (this.hp <= 0) {
      this.alive = false;
      res.killed = true;
    } else {
      this.state = 'flee';
      this.stateT = 0;
      this.stateDur = 1.8;
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
        this.position.addScaledVector(this.vel, dt);
      } else {
        const dist = target && target.alive
          ? Math.hypot(target.position.x - this.position.x, target.position.z - this.position.z)
          : 999;

        if (dist < 3.0 && this.state !== 'flee' && target) {
          this.state = 'flee';
          this.stateT = 0;
          this.stateDur = 1.8;
          this.targetYaw = Math.atan2(this.position.x - target.position.x, this.position.z - target.position.z);
        }

        let speed = 0;
        if (this.state === 'idle') {
          if (this.stateT >= this.stateDur) {
            this.state = Math.random() < 0.35 ? 'snap' : 'swim';
            this.stateT = 0;
            this.stateDur = this.state === 'snap' ? 0.85 : rand(2.0, 3.8);
            const dx = this.anchor.x - this.position.x;
            const dz = this.anchor.z - this.position.z;
            this.targetYaw = Math.hypot(dx, dz) > 4.2
              ? Math.atan2(dx, dz) + rand(-0.6, 0.6)
              : this.facing + rand(-1.6, 1.6);
          }
        } else if (this.state === 'snap') {
          speed = 0.25;
          if (this.stateT >= this.stateDur) {
            this.state = 'swim';
            this.stateT = 0;
            this.stateDur = rand(2.0, 3.4);
          }
        } else if (this.state === 'swim') {
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 4.5);
          speed = 1.65;
          if (this.stateT >= this.stateDur) {
            this.state = Math.random() < 0.45 ? 'snap' : 'idle';
            this.stateT = 0;
            this.stateDur = this.state === 'snap' ? 0.85 : rand(1.4, 2.8);
          }
        } else if (this.state === 'flee') {
          const dx = this.anchor.x - this.position.x;
          const dz = this.anchor.z - this.position.z;
          if (Math.hypot(dx, dz) > 5.5) this.targetYaw = Math.atan2(dx, dz);
          this.facing += angleDiff(this.facing, this.targetYaw) * Math.min(1, dt * 8);
          speed = 3.4;
          if (this.stateT >= this.stateDur && dist > 4.2) {
            this.state = 'idle';
            this.stateT = 0;
            this.stateDur = rand(1.4, 2.4);
          }
        }

        this.vel.x = damp(this.vel.x, Math.sin(this.facing) * speed, 7, dt);
        this.vel.z = damp(this.vel.z, Math.cos(this.facing) * speed, 7, dt);
        this.steerAnimalMovement(this.vel, dt);
        this.position.x += this.vel.x * dt;
        this.position.z += this.vel.z * dt;
        this.position.y = this.waterY;

        const horiz = Math.hypot(this.vel.x, this.vel.z);
        if (horiz > 0.2) this.swimPhase += dt * (this.state === 'flee' ? 8.0 : 5.0);
      }
      this.syncHurtbox();
    }

    const distFromPond = Math.hypot(this.position.x - this.anchor.x, this.position.z - this.anchor.z);
    const inWater = distFromPond < 3.8;
    const pose: GharialPoseName = !this.alive
      ? 'idle0'
      : this.state === 'snap'
        ? pickCycle(GHARIAL_SNAP, this.stateT * 4.5)
        : this.state === 'swim' || this.state === 'flee'
          ? (inWater ? pickCycle(GHARIAL_SWIM, this.swimPhase) : pickCycle(GHARIAL_CRAWL, this.swimPhase))
          : pickCycle(GHARIAL_IDLE, this.stateT * 1.8);
    const deathSink = this.alive ? 0 : Math.min(0.20, this.deadT * 0.4);
    this.renderBillboard(getGharialPosePack(pose), this.position.y + this.centerY - deathSink, camera, drawingBufferSize);
  }
}
