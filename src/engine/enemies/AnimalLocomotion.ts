/** Deslocamento voluntário segue a frente visível; curvas fechadas viram antes de avançar. */
export function steerAnimalLocomotion(velocity: { x: number; z: number }, desiredYaw: number, visibleYaw: number) {
  const alignment = Math.cos(desiredYaw - visibleYaw);
  const forwardScale = Math.max(0, Math.min(1, (alignment - .35) / .5));
  const speed = Math.hypot(velocity.x, velocity.z) * forwardScale;
  velocity.x = Math.sin(visibleYaw) * speed;
  velocity.z = Math.cos(visibleYaw) * speed;
}
