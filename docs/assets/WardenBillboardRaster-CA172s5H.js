import{B as e,E as t,F as n,H as r,I as i,O as a,P as o,S as s,V as c,_ as l,s as u,t as d,v as f,x as p,y as m}from"./three.core-_hrjqzpF.js";import{y as h}from"./Animals-CIc6aLHH.js";import{WARDEN_SDF_EXTENT as g,WARDEN_SIZE as _,getAntlerWardenSculpture as v,wardenPalette as y,wardenTones as b}from"./AntlerWardenSprites-DiGQDpLi.js";const x=Object.keys(b),S=[...x,`eye`,`cavity`],C=S.flatMap(e=>[0,1,2].map(t=>{let[n,r,i]=y[e]??y[e+t];return new u().setRGB(n/255,r/255,i/255,o)})),w=/* @__PURE__ */ new Map;function T(e){let t=w.get(e);if(t)return t;let n=v(e),r=new d(1,1,1),i=new f;i.setIndex(r.index),i.setAttribute(`position`,r.attributes.position);let a=(e,t)=>new l(new Float32Array(e.flat()),t);return i.setAttribute(`aLow`,a(n.map(e=>e.min.map(e=>e-.025)),3)),i.setAttribute(`aHigh`,a(n.map(e=>e.max.map(e=>e+.025)),3)),i.setAttribute(`aStart`,a(n.map(e=>[...e.a,e.kind]),4)),i.setAttribute(`aEnd`,a(n.map(e=>[...e.b,S.indexOf(e.material)]),4)),i.setAttribute(`aShape`,a(n.map(e=>e.style),3)),i.instanceCount=n.length,w.set(e,i),i}const E=`
uniform mat4 uClip;
uniform vec3 uRay;
uniform float uExtent;
uniform vec3 uPalette[${C.length}];
varying vec3 vPoint;
flat varying vec3 vLow;
flat varying vec3 vHigh;
flat varying vec4 vStart;
flat varying vec4 vEnd;
flat varying vec3 vShape;
flat varying vec2 vBend;

float surfaceDistance(vec3 p) {
  vec3 q = p - vStart.xyz;
  vec3 b = vEnd.xyz;
  if (vStart.w < .5) {
    vec3 ratio = q / b;
    float k = length(ratio);
    return k < .000001 ? -min(b.x, min(b.y, b.z)) : k * (k - 1.0) / length(ratio / b);
  }
  vec3 axis = b - vStart.xyz;
  if (vStart.w < 1.5) {
    float h = clamp(dot(q, axis) / max(.000001, dot(axis, axis)), 0.0, 1.0);
    return length(q - axis * h) - mix(vShape.x, vShape.y, h);
  }
  float len = length(axis);
  vec3 t = axis / len;
  float sideways = length(t.xy);
  vec3 u = sideways > .001 ? vec3(t.y, -t.x, 0.0) / sideways : vec3(1, 0, 0);
  vec3 v = cross(t, u);
  float along = dot(q,t);
  float r = mix(vShape.x, vShape.y, clamp(along / len, 0.0, 1.0));
  float x = abs(dot(q,u)), y = abs(dot(q,v)), thickness = vShape.z;
  return max(max(-along - .024, along - len - .021),
             max(max(x - r, y - r * thickness), (x * thickness + y - r * thickness * 1.35) * .72));
}

void main() {
  float c = cos(vBend.x), s = sin(vBend.x);
  vec2 rayXZ = mat2(c, s, -s, c) * uRay.xz;
  vec3 ray = vec3(rayXZ.x, uRay.y, rayXZ.y);
  vec3 origin = vPoint - ray * 6.0;
  vec3 safeRay = mix(vec3(.000001), ray, greaterThan(abs(ray), vec3(.000001)));
  vec3 enter = min((vLow-origin)/safeRay, (vHigh-origin)/safeRay);
  vec3 exit = max((vLow-origin)/safeRay, (vHigh-origin)/safeRay);
  float t = max(enter.x, max(enter.y, enter.z));
  float end = min(exit.x, min(exit.y, exit.z));
  vec3 p;
  float d = 1.0;
  for (int i = 0; i < 32; i++) {
    if (t > end) discard;
    p = origin + t * ray;
    d = surfaceDistance(p);
    if (d < .007) break;
    t += max(.001, d * .84);
  }
  if (d >= .007) discard;

  const vec2 e = vec2(.008,0);
  vec3 normal = normalize(vec3(surfaceDistance(p+e.xyy), surfaceDistance(p+e.yxy), surfaceDistance(p+e.yyx)) - d);
  float shade = clamp(dot(normal, vec3(-.35,.78,.52)) * .52 + .52, 0.0, 1.0);
  int material = int(vEnd.w);
  float band = floor(p.x*10.0+p.y*7.0)*11.0 + floor(p.z*11.0-p.y*12.0)*5.0;
  shade += sin(band) * (material == ${x.indexOf(`bone`)} ? .028 : .066);
  int tone = shade > .75 ? 2 : shade > .435 ? 1 : 0;

  float neck = uExtent * .035;
  vec2 xz = mat2(c, -s, s, c) * (p.xz - vec2(0,neck));
  vec4 clip = uClip * vec4(xz.x, p.y + vBend.y, xz.y + neck, 1.0);
  gl_FragDepth = clip.z / clip.w * .5 + .5;
  gl_FragColor = vec4(uPalette[material * 3 + tone], 1.0);
}
`;var D=class{renderer;scene=new n;camera=new a(-g,g,g,-g,.01,12);target;clear=new u;material=new i({uniforms:{uClip:{value:new p},uRay:{value:new c},uTurn:{value:new e},uExtent:{value:g},uPalette:{value:C}},vertexShader:`
attribute vec3 aLow;
attribute vec3 aHigh;
attribute vec4 aStart;
attribute vec4 aEnd;
attribute vec3 aShape;
uniform vec2 uTurn;
uniform float uExtent;
varying vec3 vPoint;
flat varying vec3 vLow;
flat varying vec3 vHigh;
flat varying vec4 vStart;
flat varying vec4 vEnd;
flat varying vec3 vShape;
flat varying vec2 vBend;

vec3 bend(vec3 p, float angle, float lift) {
  float c = cos(angle), s = sin(angle);
  float neck = uExtent * .035;
  vec2 xz = mat2(c, -s, s, c) * (p.xz - vec2(0, neck));
  return vec3(xz.x, p.y + lift, xz.y + neck);
}

void main() {
  vLow = aLow;
  vHigh = aHigh;
  vStart = aStart;
  vEnd = aEnd;
  vShape = aShape;
  vec3 center = (aLow + aHigh) * .5;
  float h = center.y / uExtent;
  float head = smoothstep(.20, .43, h);
  float shoulders = smoothstep(-.20, .29, h);
  float feet = 1.0 - smoothstep(-.85, -.28, h);
  vBend = vec2(uTurn.x * .44 * (head * .82 + shoulders * .18) - feet * uTurn.y * .19,
               feet * max(0.0, sign(center.x) * uTurn.y) * uExtent * .10);
  vPoint = mix(aLow, aHigh, position + .5);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(bend(vPoint, vBend.x, vBend.y), 1.0);
}
`,fragmentShader:E,side:1,toneMapped:!1});mesh=new s(T(`idle0`),this.material);lastFrame=``;constructor(e){this.renderer=e;let{width:n,height:i}=h(_,_);this.target=new r(n,i,{magFilter:t,minFilter:t,generateMipmaps:!1}),this.mesh.frustumCulled=!1,this.scene.add(this.mesh)}render(e,t,n){let r=`${e}:${t.tier}:${t.direction}:${n?.look??0}:${n?.step??0}`;if(r!==this.lastFrame){let{renderer:i,camera:a,material:o}=this,s=m.degToRad((t.direction<=8?t.direction:t.direction-16)*22.5),c=m.degToRad(t.tier===9?88:t.tier===10?-88:80-t.tier*20),l=Math.cos(c);a.position.set(-Math.sin(s)*l,Math.sin(c),Math.cos(s)*l).multiplyScalar(6),a.up.set(0,t.tier>=9?0:1,+(t.tier>=9)),a.lookAt(0,0,0),a.updateMatrixWorld(!0),this.mesh.geometry=T(e),o.uniforms.uClip.value.multiplyMatrices(a.projectionMatrix,a.matrixWorldInverse),o.uniforms.uRay.value.copy(a.position).normalize().negate(),o.uniforms.uTurn.value.set(n?.look??0,n?.step??0);let u=i.getRenderTarget(),d=i.autoClear;i.getClearColor(this.clear);let f=i.getClearAlpha();i.setRenderTarget(this.target),i.setClearColor(0,0),i.autoClear=!0;try{i.render(this.scene,a)}finally{i.setRenderTarget(u),i.setClearColor(this.clear,f),i.autoClear=d}this.lastFrame=r}return this.target.texture}dispose(){this.target.dispose(),this.material.dispose()}};export{D as WardenBillboardRaster};