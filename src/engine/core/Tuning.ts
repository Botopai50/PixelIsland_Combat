/**
 * Todos os parâmetros ajustáveis do protótipo em um único objeto de dados.
 * Os sistemas LEEM deste objeto a cada frame, então mudar um valor no painel
 * tem efeito imediato. Para reaproveitar em outro projeto, basta criar um
 * `defaultTuning()` e passar a referência aos sistemas.
 */
export interface Tuning {
  // Movimento
  walkSpeed: number;
  runSpeed: number;
  sprintSpeed: number;
  acceleration: number;
  deceleration: number;
  airControl: number;
  turnSpeed: number;
  jumpHeight: number;
  gravity: number;
  fallGravityMul: number;
  jumpCutMul: number;
  coyoteTime: number;
  jumpBuffer: number;
  // Esquiva
  dodgeDistance: number;
  dodgeDuration: number;
  dodgeIFrameStart: number;
  dodgeIFrameEnd: number;
  dodgeCooldown: number;
  perfectDodgeWindow: number;
  flurryEnabled: boolean;
  // Stamina
  staminaMax: number;
  staminaRegen: number;
  sprintCost: number;
  dodgeCost: number;
  chargeCost: number;
  // Combate
  damageMul: number;
  rangeMul: number;
  attackSpeedMul: number;
  recoveryMul: number;
  attackBuffer: number;
  cancelWindowMul: number;
  chargeTime: number;
  parryWindow: number;
  blockAngle: number;
  blockStaminaCost: number;
  enemyDamageMul: number;
  enemyAggression: number;
  // Feedback
  hitStopEnabled: boolean;
  hitStopMul: number;
  shakeEnabled: boolean;
  shakeMul: number;
  particlesEnabled: boolean;
  particleMul: number;
  trailsEnabled: boolean;
  hitFlashEnabled: boolean;
  damageNumbers: boolean;
  weaponRecoil: boolean;
  knockbackMul: number;
  screenFx: boolean;
  // Câmera
  fov: number;
  sensitivity: number;
  invertY: boolean;
  camDistance: number;
  camShoulder: number;
  camHeight: number;
  camBob: boolean;
  camBobAmount: number;
  weaponSway: boolean;
  weaponSwayAmount: number;
  fovKick: boolean;
  lockOnAssist: boolean;
  // Áudio
  soundEnabled: boolean;
  volume: number;
  // Debug
  timeScale: number;
  showHitboxes: boolean;
}

export function defaultTuning(): Tuning {
  return {
    walkSpeed: 2.2,
    runSpeed: 5.2,
    sprintSpeed: 7.6,
    acceleration: 38,
    deceleration: 46,
    airControl: 0.45,
    turnSpeed: 16,
    jumpHeight: 1.35,
    gravity: 26,
    fallGravityMul: 1.55,
    jumpCutMul: 0.45,
    coyoteTime: 0.12,
    jumpBuffer: 0.14,

    dodgeDistance: 3.4,
    dodgeDuration: 0.36,
    dodgeIFrameStart: 0.02,
    dodgeIFrameEnd: 0.26,
    dodgeCooldown: 0.12,
    perfectDodgeWindow: 0.2,
    flurryEnabled: true,

    staminaMax: 100,
    staminaRegen: 32,
    sprintCost: 18,
    dodgeCost: 12,
    chargeCost: 25,

    damageMul: 1,
    rangeMul: 1,
    attackSpeedMul: 1,
    recoveryMul: 1,
    attackBuffer: 0.28,
    cancelWindowMul: 1,
    chargeTime: 0.75,
    parryWindow: 0.2,
    blockAngle: 75,
    blockStaminaCost: 6,
    enemyDamageMul: 1,
    enemyAggression: 1,

    hitStopEnabled: true,
    hitStopMul: 1,
    shakeEnabled: true,
    shakeMul: 1,
    particlesEnabled: true,
    particleMul: 1,
    trailsEnabled: true,
    hitFlashEnabled: true,
    damageNumbers: true,
    weaponRecoil: true,
    knockbackMul: 1,
    screenFx: true,

    fov: 70,
    sensitivity: 1,
    invertY: false,
    camDistance: 4.2,
    camShoulder: 0.55,
    camHeight: 1.55,
    camBob: true,
    camBobAmount: 1,
    weaponSway: true,
    weaponSwayAmount: 1,
    fovKick: true,
    lockOnAssist: true,

    soundEnabled: true,
    volume: 0.8,

    timeScale: 1,
    showHitboxes: false,
  };
}

/** Preset "cru": mesmas regras de jogo, sem nenhum "juice" — para comparar a sensação. */
export function rawPreset(t: Tuning): Partial<Tuning> {
  return {
    hitStopEnabled: false,
    shakeEnabled: false,
    particlesEnabled: false,
    trailsEnabled: false,
    hitFlashEnabled: false,
    damageNumbers: false,
    weaponRecoil: false,
    screenFx: false,
    camBob: false,
    weaponSway: false,
    fovKick: false,
    knockbackMul: t.knockbackMul,
  };
}

const KEY = 'pixelisland-combat.tuning.v1';

export function saveTuning(t: Tuning) {
  try {
    localStorage.setItem(KEY, JSON.stringify(t));
  } catch {
    /* armazenamento indisponível: ignora */
  }
}

export function loadTuning(): Tuning {
  const base = defaultTuning();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) Object.assign(base, JSON.parse(raw));
  } catch {
    /* ignora */
  }
  return base;
}
