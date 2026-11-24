export const ACTOR_PIXELS_PER_METER = 56;

export function actorScreenPixelSize(bufferHeight: number): number {
  if (bufferHeight >= 680) return 3;
  return bufferHeight >= 450 ? 2 : 1;
}

export function actorSpriteResolution(worldWidth: number, worldHeight: number) {
  return {
    width: Math.max(1, Math.round(worldWidth * ACTOR_PIXELS_PER_METER)),
    height: Math.max(1, Math.round(worldHeight * ACTOR_PIXELS_PER_METER)),
  };
}
