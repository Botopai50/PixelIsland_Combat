import * as THREE from 'three';
import { HERO_PIXEL_SAMPLING, HERO_PIXEL_VERTEX } from './HeroPixelShader';
import { StablePixelValue } from './StablePixelValue';
import type { HumanoidRig, JointName } from './HumanoidRig';
import {
  createHeroSpriteSet,
  disposeHeroSpriteSet,
  type BillboardPartMeta,
  type CoreTextures,
  type EightWayTier,
  type HeadTextures,
  type HeroSpriteSet,
  type ShinTextures,
} from './HeroBillboardSprites';

const FRAGMENT_SHADER = /* glsl */ `
${HERO_PIXEL_SAMPLING}
uniform vec3 uFlashColor;
uniform float uFlashAmount;
uniform float uHighlight;

void main() {
  vec3 col = sampleHeroPixel();
  if (uFlashAmount > 0.001) {
    col = mix(col, uFlashColor * 1.4, uFlashAmount * 0.72);
  }
  if (uHighlight > 0.001) {
    col = mix(col * (1.0 + uHighlight * 0.32), vec3(0.35, 1.0, 0.92), uHighlight * 0.42);
  } else if (uHighlight < -0.001) {
    float luma = dot(col, vec3(0.299, 0.587, 0.114));
    vec3 muted = mix(col, vec3(luma), 0.55);
    col = muted * (1.0 + uHighlight * 0.65);
  }

  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export type HeroBodyPartKey = 'head' | 'torso' | 'pelvis' | 'upperArm' | 'forearm' | 'hand' | 'thigh' | 'shin';

type HeadPitchTier = 'bottom' | 'low' | 'midLow' | 'level' | 'midHigh' | 'high';

// Midpoints between the authored elevations: -88°, -48°, -24°, 0°, 24°, 48°.
const HEAD_PITCH_CUTS = [-68, -36, -12, 12, 36];
const HEAD_PITCH_TIERS: readonly HeadPitchTier[] = ['bottom', 'low', 'midLow', 'level', 'midHigh', 'high'];
const HEAD_PITCH_HYST = 1.5;

interface BillboardSlot {
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
  depthMaterial: THREE.MeshDepthMaterial;
  mapUniform: { value: THREE.CanvasTexture };
  highlightUniform: { value: number };
  meta: BillboardPartMeta;
  /** Small view-ray depth offset (meters toward camera) to prevent coplanar z-fighting. */
  depthBias: number;
  viewAngle: { value: number };
}

const LEVEL_AZIMUTH_CUTS = [0.125, 0.375, 0.625, 0.875];
const HIGH_AZIMUTH_CUTS = [0.16, 0.36, 0.64, 0.84];
const STEEP_AZIMUTH_CUTS = [0.28, 0.72];
const AZIMUTH_DEADBAND = THREE.MathUtils.degToRad(2.5);

function stableAzimuth(slot: BillboardSlot, angle: number, upDot: number) {
  const cuts = upDot > .78 ? STEEP_AZIMUTH_CUTS : upDot > .64 ? HIGH_AZIMUTH_CUTS : LEVEL_AZIMUTH_CUTS;
  const previous = slot.viewAngle.value;
  for (const fraction of cuts) {
    const boundary = fraction * Math.PI;
    if (Math.abs(angle - boundary) < AZIMUTH_DEADBAND && (angle < boundary) !== (previous < boundary) && Number.isFinite(previous)) {
      return previous < boundary ? boundary - 1e-5 : boundary;
    }
  }
  slot.viewAngle.value = angle;
  return angle;
}

interface CorePart extends BillboardSlot {
  joint: JointName;
  textures: HeadTextures | CoreTextures;
}

interface AxialLimbPart extends BillboardSlot {
  parentJoint: JointName;
  childJoint: JointName;
  /** Optional directional textures (front/side/back/high/top) for unified lower-leg+boot shins. */
  directional?: ShinTextures;
  /** Extra extension (meters) past childJoint along the bone axis (e.g. ankle -> boot sole). */
  extraBottom: number;
  /** Pull parentJoint horizontally inward toward chest (0..1) so upper arms tuck into slimmed torso. */
  tuckToChest: number;
  /** Mirror horizontally for left vs right side symmetry (used when non-directional). */
  mirrorX: boolean;
}

interface ExtremityPart extends BillboardSlot {
  joint: JointName;
  /** Optional local Y offset adjustment (meters) along bone up. */
  extraY: number;
  /** Horizontal flip for left/right symmetry. */
  defaultFlipX: boolean;
}

/**
 * Skeletal Billboarding (Bone-Attached Billboards) renderer for the hero.
 *
 * Hides the low-poly 3D body meshes on `HumanoidRig` while keeping the entire
 * joint hierarchy, sockets, FootIK, Arm IK, 3D weapons/shield, and RigViewer
 * intact. ALL 13 billboard parts stay strictly parallel to the camera plane
 * with smooth true 3D uniform-PPU world sizing (zero pop-up jumps) and render
 * through a pure whole-pixel viewport-locked integer grid shader (zero AA/blur,
 * zero mixels, zero diagonal shear), with `head` anchored to its own parity-
 * aligned grid origin for rock-solid symmetric 1x2 eyes.
 */
const SHADOW_ONLY_MAT = new THREE.MeshBasicMaterial({
  colorWrite: false,
  depthWrite: false,
});

export class SkeletalBillboard {
  readonly root = new THREE.Group();
  readonly sprites: HeroSpriteSet;
  private readonly geometry = new THREE.PlaneGeometry(1, 1);
  private readonly allSlots: BillboardSlot[] = [];
  private readonly coreParts: CorePart[] = [];
  private readonly limbParts: AxialLimbPart[] = [];
  private readonly extremityParts: ExtremityPart[] = [];

  // One screen lattice for body and equipment. Its step depends on the
  // framebuffer, so camera motion never changes the grid on individual parts.
  readonly pixelSizeUniform = { value: 2 };
  readonly bufferSizeUniform = { value: new THREE.Vector2(1280, 720) };
  readonly pixelOffsetUniform = { value: new THREE.Vector2() };
  private readonly anchorX = new StablePixelValue();
  private readonly anchorY = new StablePixelValue();
  private readonly anchorNdc = new THREE.Vector3();
  private readonly uFlashColor = { value: new THREE.Color(0xff3030) };
  private readonly uFlashAmount = { value: 0.0 };

  // Pre-allocated scratch math objects (zero per-frame allocations)
  private readonly camPos = new THREE.Vector3();
  private readonly camRight = new THREE.Vector3();
  private readonly camUp = new THREE.Vector3();
  private readonly camBack = new THREE.Vector3();
  private readonly camFwd = new THREE.Vector3();
  private readonly rootPos = new THREE.Vector3();
  private readonly chestPos = new THREE.Vector3();
  private readonly neckPos = new THREE.Vector3();
  private readonly torsoWorldPos = new THREE.Vector3();
  private readonly pelvisWorldPos = new THREE.Vector3();
  private readonly depthTmp = new THREE.Vector3();
  private readonly posA = new THREE.Vector3();
  private readonly posB = new THREE.Vector3();
  private readonly mid = new THREE.Vector3();
  private readonly toCam = new THREE.Vector3();
  private readonly proj = new THREE.Vector3();
  private readonly xAxis = new THREE.Vector3();
  private readonly yAxis = new THREE.Vector3();
  private readonly zAxis = new THREE.Vector3();
  private readonly boneFwd = new THREE.Vector3();
  private readonly boneLeft = new THREE.Vector3();
  private readonly boneUp = new THREE.Vector3();
  private readonly bodyUp = new THREE.Vector3();
  private readonly bodyFwd = new THREE.Vector3();
  private readonly bodyLeft = new THREE.Vector3();
  private bodyUpDot = 0;
  private headPitchIndex?: number;
  private readonly boneScale = new THREE.Vector3();
  private readonly basisMat = new THREE.Matrix4();

  constructor(private readonly rig: HumanoidRig) {
    this.root.name = 'HeroSkeletalBillboard';
    this.sprites = createHeroSpriteSet();

    // Keep the hero's 3D body meshes invisible to the main camera (`colorWrite/depthWrite: false`)
    // so they cast a true camera-independent 3D volumetric shadow while the 2D billboards render the pixel art!
    this.rig.body.traverse((obj) => {
      const m = obj as THREE.Mesh;
      if (m.isMesh) {
        m.visible = true;
        m.castShadow = true;
        m.receiveShadow = false;
        m.material = SHADOW_ONLY_MAT;
      }
    });

    // Core directional camera-plane-aligned parts (all 5-way horizontal + high-angle + top)
    // Register chest BEFORE pelvis so pelvis can stay ahead of torso's bottom hem at downward camera pitches.
    this.addCore('chest', this.sprites.torso.textures, this.sprites.torso.meta, 0.01);
    this.addCore('pelvis', this.sprites.pelvis.textures, this.sprites.pelvis.meta, 0.014);
    this.addCore('head', this.sprites.head.textures, this.sprites.head.meta, 0.032);

    // Camera-plane-aligned limb segments with 2D in-plane bone roll
    // Upper arms match fullbody.aseprite Layer 7 (L unflipped, R mirrored) in front of torso (0.014 > 0.01)
    this.addLimb('upperArmR', 'forearmR', this.sprites.upperArm.textures, this.sprites.upperArm.meta, 0.014, true, 0);
    this.addLimb('upperArmL', 'forearmL', this.sprites.upperArm.textures, this.sprites.upperArm.meta, 0.014, false, 0);
    this.addLimb('forearmR', 'handR', this.sprites.forearm.textures, this.sprites.forearm.meta, 0.016, true, 0);
    this.addLimb('forearmL', 'handL', this.sprites.forearm.textures, this.sprites.forearm.meta, 0.016, false, 0);
    // Thigh renders in front of both pelvis and shin so the shorts drape cleanly over waist & knee
    this.addLimb('thighR', 'shinR', this.sprites.thigh.textures, this.sprites.thigh.meta, 0.042, false, 0);
    this.addLimb('thighL', 'shinL', this.sprites.thigh.textures, this.sprites.thigh.meta, 0.042, true, 0);
    // Unified lower-leg + boot + foot directional billboards (zero ankle seam / zero floor sole clipping)
    this.addDirectionalLimb('shinR', 'footR', this.sprites.shin.textures, this.sprites.shin.meta, 0.006, 0.01);
    this.addDirectionalLimb('shinL', 'footL', this.sprites.shin.textures, this.sprites.shin.meta, 0.006, 0.01);

    // Extremities (hands — inverted so thumbs point naturally inward toward the body)
    this.addExtremity('handR', this.sprites.hand.textures, this.sprites.hand.meta, 0.022, 0.035, true);
    this.addExtremity('handL', this.sprites.hand.textures, this.sprites.hand.meta, 0.022, 0.035, false);
  }

  private createSlot(
    texture: THREE.CanvasTexture,
    meta: BillboardPartMeta,
    depthBias: number,
    name: string,
  ): BillboardSlot {
    const mapUniform = { value: texture };
    const highlightUniform = { value: 0.0 };
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uMap: mapUniform,
        uTexelSize: { value: new THREE.Vector2(1 / meta.pixelWidth, 1 / meta.pixelHeight) },
        uPixelSize: this.pixelSizeUniform,
        uBufferSize: this.bufferSizeUniform,
        uPixelOffsetNdc: this.pixelOffsetUniform,
        uFlashColor: this.uFlashColor,
        uFlashAmount: this.uFlashAmount,
        uHighlight: highlightUniform,
      },
      vertexShader: HERO_PIXEL_VERTEX,
      fragmentShader: FRAGMENT_SHADER,
      side: THREE.DoubleSide,
      transparent: false,
      depthWrite: true,
      depthTest: true,
    });
    const depthMaterial = new THREE.MeshDepthMaterial({
      depthPacking: THREE.RGBADepthPacking,
      map: texture,
      alphaTest: 0.5,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(this.geometry, material);
    mesh.name = name;
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.customDepthMaterial = depthMaterial;
    mesh.frustumCulled = false;
    this.root.add(mesh);
    const slot: BillboardSlot = {
      mesh, material, depthMaterial, mapUniform, highlightUniform, meta, depthBias,
      viewAngle: { value: NaN },
    };
    this.allSlots.push(slot);
    return slot;
  }

  private addCore(
    joint: JointName,
    textures: HeadTextures | CoreTextures,
    meta: BillboardPartMeta,
    depthBias: number,
  ) {
    const slot = this.createSlot(textures.front, meta, depthBias, `bb_${joint}`);
    this.coreParts.push({ ...slot, joint, textures });
  }

  private addLimb(
    parentJoint: JointName,
    childJoint: JointName,
    texture: THREE.CanvasTexture,
    meta: BillboardPartMeta,
    depthBias: number,
    mirrorX: boolean,
    tuckToChest: number,
  ) {
    const slot = this.createSlot(texture, meta, depthBias, `bb_${parentJoint}`);
    this.limbParts.push({ ...slot, parentJoint, childJoint, extraBottom: 0, tuckToChest, mirrorX });
  }

  private addDirectionalLimb(
    parentJoint: JointName,
    childJoint: JointName,
    textures: ShinTextures,
    meta: BillboardPartMeta,
    depthBias: number,
    extraBottom: number,
  ) {
    const slot = this.createSlot(textures.front, meta, depthBias, `bb_${parentJoint}`);
    this.limbParts.push({ ...slot, parentJoint, childJoint, directional: textures, extraBottom, tuckToChest: 0, mirrorX: false });
  }

  private addExtremity(
    joint: JointName,
    texture: THREE.CanvasTexture,
    meta: BillboardPartMeta,
    depthBias: number,
    extraY: number,
    defaultFlipX: boolean,
  ) {
    const slot = this.createSlot(texture, meta, depthBias, `bb_${joint}`);
    this.extremityParts.push({ ...slot, joint, extraY, defaultFlipX });
  }

  setVisible(visible: boolean) {
    this.root.visible = visible;
  }

  /**
   * Highlights a specific logical body part (bright cyan pulse) while dimming
   * all other parts so the Sprite Inspector can visually isolate any sprite's slot.
   * Pass `null` to restore normal rendering.
   */
  setHighlightPart(part: HeroBodyPartKey | null, pulse = 0.55) {
    if (!part) {
      for (let i = 0; i < this.allSlots.length; i++) {
        this.allSlots[i].highlightUniform.value = 0.0;
      }
      return;
    }
    const match = (name: string): boolean => {
      switch (part) {
        case 'head': return name === 'bb_head';
        case 'torso': return name === 'bb_chest';
        case 'pelvis': return name === 'bb_pelvis';
        case 'upperArm': return name === 'bb_upperArmR' || name === 'bb_upperArmL';
        case 'forearm': return name === 'bb_forearmR' || name === 'bb_forearmL';
        case 'hand': return name === 'bb_handR' || name === 'bb_handL';
        case 'thigh': return name === 'bb_thighR' || name === 'bb_thighL';
        case 'shin': return name === 'bb_shinR' || name === 'bb_shinL';
      }
    };
    for (let i = 0; i < this.allSlots.length; i++) {
      const slot = this.allSlots[i];
      slot.highlightUniform.value = match(slot.mesh.name) ? pulse : -0.85;
    }
  }

  /**
   * Updates all billboard transforms, viewport-locked integer grid uniforms,
   * directional textures, and hit-flash state. Call after `rig.root.updateMatrixWorld(true)`
   * and all IK passes.
   */
  update(camera: THREE.Camera, drawingBufferSize?: THREE.Vector2) {
    if (!this.root.visible) return;

    camera.getWorldPosition(this.camPos);
    this.camRight.setFromMatrixColumn(camera.matrixWorld, 0).normalize();
    this.camUp.setFromMatrixColumn(camera.matrixWorld, 1).normalize();
    this.camBack.setFromMatrixColumn(camera.matrixWorld, 2).normalize();
    this.camFwd.copy(this.camBack).negate();

    const dpr = typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1;
    const bufferWidth = Math.max(1, drawingBufferSize?.x ?? (typeof window === 'undefined' ? 1280 : window.innerWidth * dpr));
    const bufferHeight = Math.max(1, drawingBufferSize?.y ?? (typeof window === 'undefined' ? 720 : window.innerHeight * dpr));
    const pixelSize = bufferHeight >= 680 ? 2 : 1;
    this.pixelSizeUniform.value = pixelSize;
    this.bufferSizeUniform.value.set(bufferWidth, bufferHeight);

    this.rig.joints.pelvis.getWorldPosition(this.rootPos);
    // Anchor the whole sprite to the character's world origin. The animated
    // pelvis bobs during a step and would otherwise nudge every body part.
    this.rig.root.getWorldPosition(this.anchorNdc).project(camera);
    const cellX = (this.anchorNdc.x * .5 + .5) * bufferWidth / pixelSize - .5;
    const cellY = (this.anchorNdc.y * .5 + .5) * bufferHeight / pixelSize - .5;
    this.pixelOffsetUniform.value.set(
      (this.anchorX.sample(cellX) - cellX) * 2 * pixelSize / bufferWidth,
      (this.anchorY.sample(cellY) - cellY) * 2 * pixelSize / bufferHeight,
    );
    this.rig.joints.chest.getWorldPosition(this.chestPos);
    this.rig.joints.neck.getWorldPosition(this.neckPos);

    // Unified body elevation (upDot) and forward/left axes from pelvis so head, torso, pelvis, and shins
    // always switch between Level -> High-Angle -> Top-Down in complete lockstep (never half-top/half-side).
    const pm = this.rig.joints.pelvis.matrixWorld;
    this.bodyLeft.setFromMatrixColumn(pm, 0).normalize();
    this.bodyUp.setFromMatrixColumn(pm, 1).normalize();
    this.bodyFwd.setFromMatrixColumn(pm, 2).normalize();
    this.toCam.subVectors(this.camPos, this.rootPos);
    const rootDistSq = this.toCam.lengthSq();
    if (rootDistSq > 1e-6) {
      this.toCam.multiplyScalar(1 / Math.sqrt(rootDistSq));
      this.toCam.addScaledVector(this.camBack, 0.30).normalize();
    } else {
      this.toCam.copy(this.camBack);
    }
    this.bodyUpDot = this.toCam.dot(this.bodyUp);

    // Sync hit-flash uniforms
    this.uFlashAmount.value = this.rig.flashAmount;
    if (this.rig.flashAmount > 0) {
      this.uFlashColor.value.copy(this.rig.flashTint);
    }

    for (let i = 0; i < this.coreParts.length; i++) {
      this.updateCorePart(this.coreParts[i]);
    }
    for (let i = 0; i < this.limbParts.length; i++) {
      this.updateLimbPart(this.limbParts[i]);
    }
    for (let i = 0; i < this.extremityParts.length; i++) {
      this.updateExtremity(this.extremityParts[i]);
    }


  }

  private setSlotTexture(slot: BillboardSlot, tex: THREE.CanvasTexture) {
    if (slot.mapUniform.value !== tex) {
      slot.mapUniform.value = tex;
      const hadMap = !!slot.depthMaterial.map;
      slot.depthMaterial.map = tex;
      if (!hadMap) slot.depthMaterial.needsUpdate = true;
    }
  }

  /** Builds a camera-plane-parallel rotation basis with +Y aligned to `upDir` projected onto the camera plane. */
  private setCameraPlaneBasis(upDir: THREE.Vector3, outQuat: THREE.Quaternion) {
    this.zAxis.copy(this.camBack);
    this.yAxis.copy(upDir).addScaledVector(this.zAxis, -upDir.dot(this.zAxis));
    if (this.yAxis.lengthSq() < 1e-5) {
      this.yAxis.copy(this.camUp);
    } else {
      this.yAxis.normalize();
    }
    this.xAxis.crossVectors(this.yAxis, this.zAxis).normalize();
    this.basisMat.makeBasis(this.xAxis, this.yAxis, this.zAxis);
    outQuat.setFromRotationMatrix(this.basisMat);
  }

  private resolveHeadPitchTier(headUpDot: number): HeadPitchTier {
    const pitch = THREE.MathUtils.radToDeg(Math.asin(THREE.MathUtils.clamp(headUpDot, -1, 1)));
    const previous = this.headPitchIndex;
    if (previous !== undefined) {
      const lower = HEAD_PITCH_CUTS[previous - 1] ?? -Infinity;
      const upper = HEAD_PITCH_CUTS[previous] ?? Infinity;
      if (pitch >= lower - HEAD_PITCH_HYST && pitch <= upper + HEAD_PITCH_HYST) {
        return HEAD_PITCH_TIERS[previous];
      }
    }

    const next = HEAD_PITCH_CUTS.findIndex(cut => pitch < cut);
    this.headPitchIndex = next === -1 ? HEAD_PITCH_TIERS.length - 1 : next;
    return HEAD_PITCH_TIERS[this.headPitchIndex];
  }

  private updateCorePart(part: CorePart) {
    const joint = this.rig.joints[part.joint];
    const m = joint.matrixWorld;
    joint.getWorldPosition(this.posA);
    joint.getWorldScale(this.boneScale);

    // Bone world axes: +X = character left, +Y = bone up, +Z = character forward
    this.boneLeft.setFromMatrixColumn(m, 0).normalize();
    this.boneUp.setFromMatrixColumn(m, 1).normalize();
    this.boneFwd.setFromMatrixColumn(m, 2).normalize();

    let w = part.meta.width * this.boneScale.x;
    let h = part.meta.height * this.boneScale.y;

    // Anchor torso directly between pelvis and neck so it bridges belt-to-collar cleanly during leans/breathing
    if (part.joint === 'chest') {
      this.mid.lerpVectors(this.rootPos, this.neckPos, 0.70).addScaledVector(this.boneUp, 0.035 * this.boneScale.y);
    } else {
      const headDrop = part.joint === 'head' ? 0.14 * this.boneScale.y : 0;
      const pelvisLift = part.joint === 'pelvis' ? 0.11 * this.boneScale.y : 0;
      const anchorOffsetY = (0.5 - part.meta.anchorY) * h + headDrop + pelvisLift;
      this.mid.copy(this.posA).addScaledVector(this.boneUp, anchorOffsetY);
    }

    // Direction from sprite center toward camera (blended with camera-plane normal to eliminate camShoulder parallax)
    this.toCam.subVectors(this.camPos, this.mid);
    const distSq = this.toCam.lengthSq();
    if (distSq > 1e-6) {
      this.toCam.multiplyScalar(1 / Math.sqrt(distSq));
      this.toCam.addScaledVector(this.camBack, 0.30).normalize();
    } else {
      this.toCam.copy(this.camBack);
    }

    // Keep overhead poses together. At other elevations the head uses
    // its own angle so it can tilt independently of the torso.
    const upDot = this.bodyUpDot;
    const isHead = part.joint === 'head';
    const headUpDot = isHead ? this.toCam.dot(this.boneUp) : upDot;

    if (upDot > 0.94) {
      if (isHead) this.headPitchIndex = undefined;
      this.setCameraPlaneBasis(this.bodyFwd, part.mesh.quaternion);
      // In true overhead (70°–90°), layer cleanly from above: head (0.04) > torso (0.015) > pelvis (0.0).
      // Bridge torso cleanly between pelvis and neck so neither pelvis waist nor collar ever splits apart.
      const topBias = isHead ? 0.04 : part.joint === 'chest' ? 0.015 : 0;
      if (part.joint === 'chest') {
        this.mid.lerpVectors(this.rootPos, this.neckPos, 0.68);
      } else if (isHead) {
        this.mid.copy(this.posA);
      }
      part.mesh.position.copy(this.mid).addScaledVector(this.camBack, topBias);
      if (part.joint === 'chest') this.torsoWorldPos.copy(part.mesh.position);
    else if (part.joint === 'pelvis') this.pelvisWorldPos.copy(part.mesh.position);
      this.setSlotTexture(part, part.textures.top);
      const topH = part.joint === 'chest' ? h * 0.84 : h;
      part.mesh.scale.set(w, topH, 1);
      return;
    }

    const headTier: HeadPitchTier = isHead ? this.resolveHeadPitchTier(headUpDot) : 'level';
    if (isHead && headTier === 'bottom') {
      const headTex = part.textures as HeadTextures;
      this.setCameraPlaneBasis(this.boneFwd, part.mesh.quaternion);
      // Looking up from underneath: keep head/neck behind chest collar so the neck never paints over the torso
      part.mesh.position.copy(this.mid);
      const aheadOfTorso = this.depthTmp.subVectors(part.mesh.position, this.torsoWorldPos).dot(this.camBack);
      if (aheadOfTorso > -0.008) {
        part.mesh.position.addScaledVector(this.camBack, -(aheadOfTorso + 0.008));
      }
      this.setSlotTexture(part, headTex.bottom);
      part.mesh.scale.set(w, h, 1);
      return;
    }

    // Keep core billboards strictly upright (zero residual 2D roll) unless strongly tilted (rolls/flips)
    const screenRoll = Math.abs(this.boneUp.dot(this.camRight));
    const upright = screenRoll < 0.35;
    this.setCameraPlaneBasis(upright ? this.camUp : this.boneUp, part.mesh.quaternion);

    part.mesh.position.copy(this.mid).addScaledVector(this.camBack, part.depthBias);
    if (isHead) {
      // Keep head/neck cleanly in front of torso's scarf collar so the neck sits in its collar slot
      const aheadOfTorso = this.depthTmp.subVectors(part.mesh.position, this.torsoWorldPos).dot(this.camBack);
      if (aheadOfTorso < 0.022) {
        part.mesh.position.addScaledVector(this.camBack, 0.022 - aheadOfTorso);
      }
    }


    // Pull pelvis strictly along the camera ray so belt/pelvis stay ahead of the tunic hem,
    // while keeping thighs on top of the waist/pelvis.
    if (part.joint === 'pelvis' && upDot < 0.72) {
      const torsoAhead = Math.max(0, this.depthTmp.subVectors(this.torsoWorldPos, part.mesh.position).dot(this.camBack));
      const beltFrontWeight = 1 - THREE.MathUtils.smoothstep(upDot, 0.5, 0.72);
      const pull = Math.min(0.011, (torsoAhead + 0.005) * beltFrontWeight);
      if (pull > 0) {
        const origDepth = Math.max(0.5, this.depthTmp.subVectors(part.mesh.position, this.camPos).dot(this.camFwd));
        part.mesh.position.addScaledVector(this.toCam, pull);
        const newDepth = Math.max(0.5, this.depthTmp.subVectors(part.mesh.position, this.camPos).dot(this.camFwd));
        const perspComp = newDepth / origDepth;
        w *= perspComp;
        h *= perspComp;
      }
    }

    const anchorOffsetX = (0.5 - part.meta.anchorX) * w;
    if (anchorOffsetX !== 0) {
      part.mesh.position.addScaledVector(this.xAxis, anchorOffsetX);
    }
    if (part.joint === 'chest') this.torsoWorldPos.copy(part.mesh.position);
    else if (part.joint === 'pelvis') this.pelvisWorldPos.copy(part.mesh.position);

    // Dynamic directional texture selection based on camera azimuth relative to bone
    // Blend chest azimuth slightly with pelvis (0.45) so idle/walk torso sway doesn't desync torso vs pelvis sectors
    let fwdDot: number;
    let leftDot: number;
    if (part.joint === 'chest') {
      fwdDot = this.toCam.dot(this.boneFwd) * 0.55 + this.toCam.dot(this.bodyFwd) * 0.45;
      leftDot = this.toCam.dot(this.boneLeft) * 0.55 + this.toCam.dot(this.bodyLeft) * 0.45;
    } else {
      fwdDot = this.toCam.dot(this.boneFwd);
      leftDot = this.toCam.dot(this.boneLeft);
    }
    const absAngle = stableAzimuth(part, Math.abs(Math.atan2(leftDot, fwdDot)), isHead ? 0 : upDot);
    // Sprites for side/3-4 views face screen-right; flip when camera is on character's left
    let flipX = false;
    let tex: THREE.CanvasTexture;
    const t = part.textures;

    if (isHead) {
      const ht = t as HeadTextures;
      let tier: EightWayTier;
      switch (headTier) {
        case 'high':
          tier = ht.high;
          break;
        case 'midHigh':
          tier = ht.midHigh;
          break;
        case 'midLow':
          tier = ht.midLow;
          break;
        case 'low':
          tier = ht.low;
          break;
        default:
          tier = ht;
          break;
      }

      if (absAngle < Math.PI * 0.125) {
        tex = tier.front;
      } else if (absAngle < Math.PI * 0.375) {
        tex = tier.frontSide;
        flipX = leftDot > 0;
      } else if (absAngle < Math.PI * 0.625) {
        tex = tier.side;
        flipX = leftDot > 0;
      } else if (absAngle < Math.PI * 0.875) {
        tex = tier.backSide;
        flipX = leftDot > 0;
      } else {
        tex = tier.back;
      }
    } else if (upDot > 0.64) {
      // Preserve 3/4 diagonal sprites (`frontSide`/`backSide`) up to `upDot <= 0.78` (~51°) so torso/pelvis
      // never snap between 0° and 90° while the 5-way head is facing 45°.
      if (absAngle < Math.PI * 0.16 || (upDot > 0.78 && absAngle < Math.PI * 0.28)) {
        tex = t.highFront;
      } else if (upDot <= 0.78 && absAngle < Math.PI * 0.36) {
        tex = t.frontSide;
        flipX = leftDot > 0;
      } else if (absAngle < Math.PI * 0.64 || (upDot > 0.78 && absAngle < Math.PI * 0.72)) {
        tex = t.highSide;
        flipX = leftDot > 0;
      } else if (upDot <= 0.78 && absAngle < Math.PI * 0.84) {
        tex = t.backSide;
        flipX = leftDot > 0;
      } else {
        tex = t.highBack;
      }
    } else if (absAngle < Math.PI * 0.125) {
      tex = t.front;
    } else if (absAngle < Math.PI * 0.375) {
      tex = t.frontSide;
      flipX = leftDot > 0;
    } else if (absAngle < Math.PI * 0.625) {
      tex = t.side;
      flipX = leftDot > 0;
    } else if (absAngle < Math.PI * 0.875) {
      tex = t.backSide;
      flipX = leftDot > 0;
    } else {
      tex = t.back;
    }

    this.setSlotTexture(part, tex);
    part.mesh.scale.set(flipX ? -w : w, h, 1);
  }

  private updateLimbPart(part: AxialLimbPart) {
    const pJoint = this.rig.joints[part.parentJoint];
    const cJoint = this.rig.joints[part.childJoint];
    pJoint.getWorldPosition(this.posA);
    cJoint.getWorldPosition(this.posB);
    pJoint.getWorldScale(this.boneScale);

    // Pull upperArm shoulder start inward toward chest so sleeves tuck cleanly into the slimmed torso
    if (part.tuckToChest > 0) {
      this.posA.x += (this.chestPos.x - this.posA.x) * part.tuckToChest;
      this.posA.z += (this.chestPos.z - this.posA.z) * part.tuckToChest;
    }

    // Full overhead view (bodyUpDot > 0.84, ~57-90°): directional shins switch to compact top-down boots in lockstep
    const pelvisUpDot = this.bodyUpDot;
    if (part.directional) {
      this.toCam.subVectors(this.camPos, this.rootPos);
      const distSq = this.toCam.lengthSq();
      if (distSq > 1e-6) {
        this.toCam.multiplyScalar(1 / Math.sqrt(distSq));
        this.toCam.addScaledVector(this.camBack, 0.30).normalize();
      } else {
        this.toCam.copy(this.camBack);
      }

      if (pelvisUpDot > 0.94) {
        this.setCameraPlaneBasis(this.bodyFwd, part.mesh.quaternion);
        // Blend slightly toward knee (0.22) so trailing boot stays connected to shorts hem during strides
        this.mid.lerpVectors(this.posB, this.posA, 0.22);
        part.mesh.position
          .copy(this.mid)
          .addScaledVector(this.bodyUp, 0.03)
          .addScaledVector(this.bodyFwd, 0.04)
          .addScaledVector(this.camBack, part.depthBias);
        const w = part.meta.width * this.boneScale.x;
        // Compact front-to-back boot length in top-down (~0.31m instead of 0.50m standing shin height)
        const h = part.meta.height * this.boneScale.y * 0.62;
        this.setSlotTexture(part, part.directional.top);
        part.mesh.scale.set(w, h, 1);
        return;
      }
    }

    // Bone vector from child (+bottom) to parent (+top = sprite +Y)
    this.proj.subVectors(this.posA, this.posB);
    const rawLen = this.proj.length();
    if (rawLen < 1e-4) return;

    // Extend bottom endpoint past childJoint when needed (e.g. ankle -> boot sole on floor)
    if (part.extraBottom > 0) {
      const ext = part.extraBottom * this.boneScale.y;
      this.posB.addScaledVector(this.proj, -ext / rawLen);
      this.proj.subVectors(this.posA, this.posB);
    }
    const boneLen = this.proj.length();

    if (part.parentJoint === 'thighR' || part.parentJoint === 'thighL') {
      const thighLift = 0.035 * this.boneScale.y;
      this.posA.addScaledVector(this.bodyUp, thighLift);
      this.posB.addScaledVector(this.bodyUp, thighLift);
    } else if (part.parentJoint === 'upperArmR' || part.parentJoint === 'upperArmL') {
      const armLift = 0.095 * this.boneScale.y;
      this.posA.addScaledVector(this.bodyUp, armLift);
      this.posB.addScaledVector(this.bodyUp, armLift);
    } else if (part.parentJoint === 'forearmR' || part.parentJoint === 'forearmL') {
      const armLift = 0.035 * this.boneScale.y;
      this.posA.addScaledVector(this.bodyUp, armLift);
      this.posB.addScaledVector(this.bodyUp, armLift);
    }
    if (part.parentJoint === 'upperArmR' || part.parentJoint === 'forearmR') {
      const armOut = -0.012 * this.boneScale.x;
      this.posA.addScaledVector(this.bodyLeft, armOut);
      this.posB.addScaledVector(this.bodyLeft, armOut);
    } else if (part.parentJoint === 'upperArmL' || part.parentJoint === 'forearmL') {
      const armOut = 0.012 * this.boneScale.x;
      this.posA.addScaledVector(this.bodyLeft, armOut);
      this.posB.addScaledVector(this.bodyLeft, armOut);
    }

    // Midpoint between top and bottom endpoints (slight lift on boots so the dark sole never z-clips into the floor)
    this.mid.addVectors(this.posA, this.posB).multiplyScalar(0.5);
    if (part.directional) {
      this.mid.addScaledVector(this.bodyUp, 0.018 * this.boneScale.y);
    }

    // Perspective-exact projection of both bone endpoints onto the camera plane through `this.mid`.
    // Orthographic projection splits consecutive limb billboards (thigh/shin, upperArm/forearm) under
    // steep upward/downward close-up camera pitches due to depth parallax; ray-projecting `posA` and
    // `posB` onto the plane at `dMid` guarantees both segments meet at the exact same screen pixel.
    const dA = this.depthTmp.subVectors(this.posA, this.camPos).dot(this.camFwd);
    const dB = this.proj.subVectors(this.posB, this.camPos).dot(this.camFwd);
    const dMid = this.xAxis.subVectors(this.mid, this.camPos).dot(this.camFwd);
    if (dA > 0.15 && dB > 0.15 && dMid > 0.15) {
      this.depthTmp.subVectors(this.posA, this.camPos).multiplyScalar(dMid / dA).add(this.camPos);
      this.proj.subVectors(this.posB, this.camPos).multiplyScalar(dMid / dB).add(this.camPos);
      this.mid.addVectors(this.depthTmp, this.proj).multiplyScalar(0.5);
      this.yAxis.subVectors(this.depthTmp, this.proj);
    } else {
      const alongCam = this.proj.subVectors(this.posA, this.posB).dot(this.camBack);
      this.yAxis.copy(this.proj).addScaledVector(this.camBack, -alongCam);
    }
    const projLen = this.yAxis.length();
    let foreshorten = THREE.MathUtils.clamp(projLen / boneLen, 0, 1);

    if (projLen > 1e-4) {
      this.yAxis.multiplyScalar(1 / projLen);
    } else {
      this.yAxis.copy(this.camUp);
    }

    // Prevent wild 180°/360° sprite spinning when a running leg kicks directly toward/away from the
    // camera (singularity where projLen -> 0 and yAxis flips upside-down). Side views have high
    // foreshorten (~1.0) so full stride swing is preserved; front/back foreshortened kicks blend
    // smoothly toward upright camUp.
    const isLeg = part.directional !== undefined || part.parentJoint === 'thighR' || part.parentJoint === 'thighL';
    if (isLeg) {
      let rollWeight = THREE.MathUtils.smoothstep(foreshorten, 0.22, 0.58);
      if (foreshorten < 0.58 && this.yAxis.dot(this.camUp) < 0) {
        // Only prevent upside-down flip when foreshortened toward/away from camera (keep full >90° side-profile kick)
        rollWeight = 0;
      }
      if (rollWeight < 1) {
        this.yAxis.lerp(this.camUp, 1 - rollWeight);
        if (this.yAxis.lengthSq() > 1e-5) {
          this.yAxis.normalize();
        } else {
          this.yAxis.copy(this.camUp);
        }
      }
    }

    this.zAxis.copy(this.camBack);
    this.xAxis.crossVectors(this.yAxis, this.zAxis).normalize();

    this.basisMat.makeBasis(this.xAxis, this.yAxis, this.zAxis);
    part.mesh.quaternion.setFromRotationMatrix(this.basisMat);
    part.mesh.position.copy(this.mid).addScaledVector(this.camBack, part.depthBias);
    if (part.parentJoint === 'thighR' || part.parentJoint === 'thighL') {
      const aheadOfPelvis = this.depthTmp.subVectors(part.mesh.position, this.pelvisWorldPos).dot(this.camBack);
      if (aheadOfPelvis < 0.018) {
        part.mesh.position.addScaledVector(this.camBack, 0.018 - aheadOfPelvis);
      }
    }

    if (isLeg && (pelvisUpDot > 0.56 || pelvisUpDot < -0.32)) {
      // Gently limit vertical squash on steep downward AND upward camera pitches so thigh and shin
      // stay seamlessly connected at the knee and the boot stays crisp.
      foreshorten = Math.max(foreshorten, 0.82);
    }
    const w = part.meta.width * this.boneScale.x;
    const baseH = part.meta.height * this.boneScale.y;
    const kneeOverlap = isLeg ? 0.07 * this.boneScale.y : 0.04 * this.boneScale.y;
    const h = Math.max(THREE.MathUtils.lerp(w * 0.85, baseH, foreshorten), projLen + kneeOverlap);

    let flipX = part.mirrorX;
    let anchorOffsetX = 0;

    if (part.directional) {
      // Use pelvis world axes so both shins/boots switch cleanly in lockstep with the body
      const pm = this.rig.joints.pelvis.matrixWorld;
      this.boneLeft.setFromMatrixColumn(pm, 0).normalize();
      this.boneFwd.setFromMatrixColumn(pm, 2).normalize();

      const fwdDot = this.toCam.dot(this.boneFwd);
      const leftDot = this.toCam.dot(this.boneLeft);
      const absAngle = stableAzimuth(part, Math.abs(Math.atan2(leftDot, fwdDot)), pelvisUpDot);
      const t = part.directional;
      let tex: THREE.CanvasTexture;

      const isLeftShin = part.parentJoint === 'shinL';
      if (pelvisUpDot > 0.64) {
        if (absAngle < Math.PI * 0.16 || (pelvisUpDot > 0.78 && absAngle < Math.PI * 0.28)) {
          tex = t.highFront;
          flipX = isLeftShin;
          anchorOffsetX = 0;
        } else if (pelvisUpDot <= 0.78 && absAngle < Math.PI * 0.36) {
          tex = t.frontSide;
          flipX = leftDot > 0;
          anchorOffsetX = (0.5 - 0.41) * (flipX ? -w : w);
        } else if (absAngle < Math.PI * 0.64 || (pelvisUpDot > 0.78 && absAngle < Math.PI * 0.72)) {
          tex = t.highSide;
          flipX = leftDot > 0;
          // High-angle side calf/ankle column sits at anchorX = 0.34
          anchorOffsetX = (0.5 - 0.34) * (flipX ? -w : w);
        } else if (pelvisUpDot <= 0.78 && absAngle < Math.PI * 0.84) {
          tex = t.backSide;
          flipX = leftDot > 0;
          anchorOffsetX = (0.5 - 0.41) * (flipX ? -w : w);
        } else {
          tex = t.highBack;
          flipX = isLeftShin;
          anchorOffsetX = 0;
        }
      } else if (absAngle < Math.PI * 0.125) {
        tex = t.front;
        flipX = isLeftShin;
        anchorOffsetX = 0;
      } else if (absAngle < Math.PI * 0.375) {
        tex = t.frontSide;
        flipX = leftDot > 0;
        // 3/4 calf/ankle column sits at anchorX = 0.41
        anchorOffsetX = (0.5 - 0.41) * (flipX ? -w : w);
      } else if (absAngle < Math.PI * 0.625) {
        tex = t.side;
        flipX = leftDot > 0;
        // Side calf/ankle column sits at meta.anchorX = 0.28
        anchorOffsetX = (0.5 - part.meta.anchorX) * (flipX ? -w : w);
      } else if (absAngle < Math.PI * 0.875) {
        tex = t.backSide;
        flipX = leftDot > 0;
        // 3/4 back calf/ankle column sits at anchorX = 0.41
        anchorOffsetX = (0.5 - 0.41) * (flipX ? -w : w);
      } else {
        tex = t.back;
        flipX = isLeftShin;
        anchorOffsetX = 0;
      }
      this.setSlotTexture(part, tex);
    }

    if (anchorOffsetX !== 0) {
      part.mesh.position.addScaledVector(this.xAxis, anchorOffsetX);
    }
    part.mesh.scale.set(flipX ? -w : w, h, 1);
  }

  private updateExtremity(part: ExtremityPart) {
    const joint = this.rig.joints[part.joint];
    const m = joint.matrixWorld;
    joint.getWorldPosition(this.posA);
    joint.getWorldScale(this.boneScale);

    this.boneUp.setFromMatrixColumn(m, 1).normalize();

    const w = part.meta.width * this.boneScale.x;
    const h = part.meta.height * this.boneScale.y;

    const anchorOffsetY = (0.5 - part.meta.anchorY) * h + part.extraY;
    this.mid.copy(this.posA).addScaledVector(this.boneUp, anchorOffsetY);
    const handOut = part.joint === 'handR' ? -0.012 : part.joint === 'handL' ? 0.012 : 0;
    if (handOut !== 0) {
      this.mid.addScaledVector(this.bodyLeft, handOut * this.boneScale.x);
    }

    this.setCameraPlaneBasis(this.boneUp, part.mesh.quaternion);

    const flipX = part.defaultFlipX;
    const anchorOffsetX = (0.5 - part.meta.anchorX) * (flipX ? -w : w);

    part.mesh.position
      .copy(this.mid)
      .addScaledVector(this.xAxis, anchorOffsetX)
      .addScaledVector(this.camBack, part.depthBias);
    part.mesh.scale.set(flipX ? -w : w, h, 1);
  }

  dispose() {
    this.root.removeFromParent();
    this.geometry.dispose();
    for (let i = 0; i < this.allSlots.length; i++) {
      this.allSlots[i].material.dispose();
      this.allSlots[i].depthMaterial.dispose();
    }
    disposeHeroSpriteSet(this.sprites);
  }
}
