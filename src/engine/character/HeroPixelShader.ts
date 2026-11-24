export const HERO_PIXEL_VERTEX = /* glsl */ `
uniform vec2 uTexelSize;
uniform vec2 uPixelOffsetNdc;
uniform vec2 uBufferSize;
uniform float uPixelSize;
flat varying vec2 vScreenCenter;
flat varying vec4 vScreenAxes;

void main() {
  mat4 clipFromLocal = projectionMatrix * modelViewMatrix;
  vec4 center = clipFromLocal[3];
  // These planes are parallel to the camera: the texture-to-screen map
  // is affine. Share the exact coefficients across every fragment.
  vec2 ndcToPixels = uBufferSize * (0.5 / center.w);
  vScreenCenter = ((center.xy / center.w + uPixelOffsetNdc) * 0.5 + 0.5) * uBufferSize;
  vec2 xAxis = clipFromLocal[0].xy * ndcToPixels;
  vec2 yAxis = clipFromLocal[1].xy * ndcToPixels;
  #ifdef HEAD_GRID_CELL
    float cell = float(HEAD_GRID_CELL);
    vec2 texelCount = 1.0 / uTexelSize;
    vec2 nativeSize = texelCount * cell;
    vec2 ratio = vec2(length(xAxis), length(yAxis)) / nativeSize;
    vec2 fit = smoothstep(vec2(0.65), vec2(0.84), ratio)
             * (1.0 - smoothstep(vec2(1.28), vec2(1.55), ratio));
    float roll = max(abs(xAxis.y), abs(yAxis.x)) / max(0.001, max(length(xAxis), length(yAxis)));
    float alignment = min(fit.x, fit.y) * (1.0 - smoothstep(0.025, 0.20, roll));
    // Near the reference scale, the whole 26×26 face moves from cell to cell.
    // Keep the collar anchor centered and fade the alignment out during zoom and rolls.
    vec2 nativeY = vec2(0.0, sign(yAxis.y) * nativeSize.y);
    vec2 neckAlignedCenter = vScreenCenter + 0.5 * (nativeY - yAxis);
    vec2 nativeOrigin = floor((neckAlignedCenter - 0.5 * nativeSize) / cell + 0.5) * cell;
    vScreenCenter = mix(vScreenCenter, nativeOrigin + 0.5 * nativeSize, alignment);
    xAxis = mix(xAxis, vec2(sign(xAxis.x) * nativeSize.x, 0.0), alignment);
    yAxis = mix(yAxis, nativeY, alignment);
  #endif
  vScreenAxes = vec4(xAxis, yAxis);

  // A cell sampled inside the texture can extend outside the quad. Express
  // one screen cell in local units, accounting for rotation and foreshortening.
  float det = abs(xAxis.x * yAxis.y - xAxis.y * yAxis.x);
  vec2 cellPadding = uPixelSize * vec2(abs(yAxis.x) + abs(yAxis.y),
                                       abs(xAxis.x) + abs(xAxis.y)) / max(0.0001, det);
  vec2 pad = 1.0 + max(2.0 * uTexelSize, min(cellPadding, vec2(1.0)));
  gl_Position = clipFromLocal * vec4(position.xy * pad, position.z, 1.0);
  #ifdef HEAD_GRID_CELL
    vec2 screen = vScreenCenter + xAxis * position.x * pad.x + yAxis * position.y * pad.y;
    gl_Position.xy = (2.0 * screen / uBufferSize - 1.0) * gl_Position.w;
  #else
    gl_Position.xy += uPixelOffsetNdc * gl_Position.w;
  #endif
}
`;

export const HERO_PIXEL_SAMPLING = /* glsl */ `
uniform sampler2D uMap;
uniform float uPixelSize;
flat varying vec2 vScreenCenter;
flat varying vec4 vScreenAxes;

vec3 sampleHeroPixel() {
  float pixelSize = max(1.0, floor(uPixelSize + 0.5));
  vec2 cellCenter = floor(gl_FragCoord.xy / pixelSize) * pixelSize + 0.5 * pixelSize;
  vec2 delta = cellCenter - vScreenCenter;
  vec2 xAxis = vScreenAxes.xy;
  vec2 yAxis = vScreenAxes.zw;
  float determinant = xAxis.x * yAxis.y - xAxis.y * yAxis.x;
  if (abs(determinant) < 0.0001) discard;
  vec2 snappedUv = 0.5 + vec2(delta.x * yAxis.y - delta.y * yAxis.x,
                             xAxis.x * delta.y - xAxis.y * delta.x) / determinant;

  if (snappedUv.x < 0.0 || snappedUv.x > 1.0 || snappedUv.y < 0.0 || snappedUv.y > 1.0) discard;

  vec4 texel = texture2D(uMap, snappedUv);
  if (texel.a < 0.5) discard;
  return texel.rgb;
}
`;
