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
  vScreenAxes = vec4(xAxis, yAxis);

  // A cell sampled inside the texture can extend outside the quad. Express
  // one screen cell in local units, accounting for rotation and foreshortening.
  float det = abs(xAxis.x * yAxis.y - xAxis.y * yAxis.x);
  vec2 cellPadding = uPixelSize * vec2(abs(yAxis.x) + abs(yAxis.y),
                                       abs(xAxis.x) + abs(xAxis.y)) / max(0.0001, det);
  vec2 pad = 1.0 + max(2.0 * uTexelSize, min(cellPadding, vec2(1.0)));
  gl_Position = clipFromLocal * vec4(position.xy * pad, position.z, 1.0);
  gl_Position.xy += uPixelOffsetNdc * gl_Position.w;
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
