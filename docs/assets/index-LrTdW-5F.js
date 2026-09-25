(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=1e3,t=1001,n=1002,r=1003,i=1004,a=1005,o=1006,s=1007,c=1008,l=1009,u=1010,d=1011,f=1012,p=1013,m=1014,h=1015,g=1016,_=1017,v=1018,y=1020,b=35902,x=35899,S=1021,C=1022,w=1023,T=1026,E=1027,D=1028,O=1029,k=1030,A=1031,j=1033,M=33776,ee=33777,N=33778,te=33779,P=35840,ne=35841,F=35842,re=35843,ie=36196,I=37492,ae=37496,oe=37488,L=37489,se=37490,ce=37491,le=37808,ue=37809,de=37810,fe=37811,pe=37812,me=37813,he=37814,ge=37815,_e=37816,ve=37817,ye=37818,be=37819,xe=37820,Se=37821,Ce=36492,we=36494,Te=36495,Ee=36283,De=36284,Oe=36285,ke=36286,Ae=2300,R=2301,je=2302,Me=2303,Ne=2400,z=2401,Pe=2402,B=3200,Fe=`srgb`,Ie=`srgb-linear`,Le=`linear`,Re=`srgb`,ze=7680,Be=35044,Ve=35048,He=2e3;function Ue(e){for(let t=e.length-1;t>=0;--t)if(e[t]>=65535)return!0;return!1}function We(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}function Ge(e){return document.createElementNS(`http://www.w3.org/1999/xhtml`,e)}function Ke(){let e=Ge(`canvas`);return e.style.display=`block`,e}var qe={};function Je(...e){let t=`THREE.`+e.shift();console.log(t,...e)}function Ye(e){let t=e[0];if(typeof t==`string`&&t.startsWith(`TSL:`)){let t=e[1];t&&t.isStackTrace?e[0]+=` `+t.getLocation():e[1]=`Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.`}return e}function V(...e){e=Ye(e);let t=`THREE.`+e.shift();{let n=e[0];n&&n.isStackTrace?console.warn(n.getError(t)):console.warn(t,...e)}}function H(...e){e=Ye(e);let t=`THREE.`+e.shift();{let n=e[0];n&&n.isStackTrace?console.error(n.getError(t)):console.error(t,...e)}}function Xe(...e){let t=e.join(` `);t in qe||(qe[t]=!0,V(...e))}function Ze(e,t,n){return new Promise(function(r,i){function a(){switch(e.clientWaitSync(t,e.SYNC_FLUSH_COMMANDS_BIT,0)){case e.WAIT_FAILED:i();break;case e.TIMEOUT_EXPIRED:setTimeout(a,n);break;default:r()}}setTimeout(a,n)})}var Qe={0:1,2:6,4:7,3:5,1:0,6:2,7:4,5:3},$e=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n!==void 0&&n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let r=n[e];if(r!==void 0){let e=r.indexOf(t);e!==-1&&r.splice(e,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let t=n.slice(0);for(let n=0,r=t.length;n<r;n++)t[n].call(this,e);e.target=null}}},et=`00.01.02.03.04.05.06.07.08.09.0a.0b.0c.0d.0e.0f.10.11.12.13.14.15.16.17.18.19.1a.1b.1c.1d.1e.1f.20.21.22.23.24.25.26.27.28.29.2a.2b.2c.2d.2e.2f.30.31.32.33.34.35.36.37.38.39.3a.3b.3c.3d.3e.3f.40.41.42.43.44.45.46.47.48.49.4a.4b.4c.4d.4e.4f.50.51.52.53.54.55.56.57.58.59.5a.5b.5c.5d.5e.5f.60.61.62.63.64.65.66.67.68.69.6a.6b.6c.6d.6e.6f.70.71.72.73.74.75.76.77.78.79.7a.7b.7c.7d.7e.7f.80.81.82.83.84.85.86.87.88.89.8a.8b.8c.8d.8e.8f.90.91.92.93.94.95.96.97.98.99.9a.9b.9c.9d.9e.9f.a0.a1.a2.a3.a4.a5.a6.a7.a8.a9.aa.ab.ac.ad.ae.af.b0.b1.b2.b3.b4.b5.b6.b7.b8.b9.ba.bb.bc.bd.be.bf.c0.c1.c2.c3.c4.c5.c6.c7.c8.c9.ca.cb.cc.cd.ce.cf.d0.d1.d2.d3.d4.d5.d6.d7.d8.d9.da.db.dc.dd.de.df.e0.e1.e2.e3.e4.e5.e6.e7.e8.e9.ea.eb.ec.ed.ee.ef.f0.f1.f2.f3.f4.f5.f6.f7.f8.f9.fa.fb.fc.fd.fe.ff`.split(`.`),tt=1234567,nt=Math.PI/180,rt=180/Math.PI;function it(){let e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0,r=Math.random()*4294967295|0;return(et[e&255]+et[e>>8&255]+et[e>>16&255]+et[e>>24&255]+`-`+et[t&255]+et[t>>8&255]+`-`+et[t>>16&15|64]+et[t>>24&255]+`-`+et[n&63|128]+et[n>>8&255]+`-`+et[n>>16&255]+et[n>>24&255]+et[r&255]+et[r>>8&255]+et[r>>16&255]+et[r>>24&255]).toLowerCase()}function U(e,t,n){return Math.max(t,Math.min(n,e))}function at(e,t){return(e%t+t)%t}function ot(e,t,n,r,i){return r+(e-t)*(i-r)/(n-t)}function st(e,t,n){return e===t?0:(n-e)/(t-e)}function ct(e,t,n){return(1-n)*e+n*t}function lt(e,t,n,r){return ct(e,t,1-Math.exp(-n*r))}function ut(e,t=1){return t-Math.abs(at(e,t*2)-t)}function dt(e,t,n){return e<=t?0:e>=n?1:(e=(e-t)/(n-t),e*e*(3-2*e))}function ft(e,t,n){return e<=t?0:e>=n?1:(e=(e-t)/(n-t),e*e*e*(e*(e*6-15)+10))}function pt(e,t){return e+Math.floor(Math.random()*(t-e+1))}function mt(e,t){return e+Math.random()*(t-e)}function ht(e){return e*(.5-Math.random())}function gt(e){e!==void 0&&(tt=e);let t=tt+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function _t(e){return e*nt}function vt(e){return e*rt}function yt(e){return e>0&&Number.isInteger(e)&&2**Math.round(Math.log2(e))===e}function bt(e){return 2**Math.ceil(Math.log(e)/Math.LN2)}function xt(e){return 2**Math.floor(Math.log(e)/Math.LN2)}function St(e,t,n,r,i){let a=Math.cos,o=Math.sin,s=a(n/2),c=o(n/2),l=a((t+r)/2),u=o((t+r)/2),d=a((t-r)/2),f=o((t-r)/2),p=a((r-t)/2),m=o((r-t)/2);switch(i){case`XYX`:e.set(s*u,c*d,c*f,s*l);break;case`YZY`:e.set(c*f,s*u,c*d,s*l);break;case`ZXZ`:e.set(c*d,c*f,s*u,s*l);break;case`XZX`:e.set(s*u,c*m,c*p,s*l);break;case`YXY`:e.set(c*p,s*u,c*m,s*l);break;case`ZYZ`:e.set(c*m,c*p,s*u,s*l);break;default:V(`MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: `+i)}}function Ct(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return e/4294967295;case Uint16Array:return e/65535;case Uint8Array:case Uint8ClampedArray:return e/255;case Int32Array:return Math.max(e/2147483647,-1);case Int16Array:return Math.max(e/32767,-1);case Int8Array:return Math.max(e/127,-1);default:throw Error(`THREE.MathUtils: Invalid component type.`)}}function wt(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return Math.round(e*4294967295);case Uint16Array:return Math.round(e*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(e*255);case Int32Array:return Math.round(e*2147483647);case Int16Array:return Math.round(e*32767);case Int8Array:return Math.round(e*127);default:throw Error(`THREE.MathUtils: Invalid component type.`)}}var Tt={DEG2RAD:nt,RAD2DEG:rt,generateUUID:it,clamp:U,euclideanModulo:at,mapLinear:ot,inverseLerp:st,lerp:ct,damp:lt,pingpong:ut,smoothstep:dt,smootherstep:ft,randInt:pt,randFloat:mt,randFloatSpread:ht,seededRandom:gt,degToRad:_t,radToDeg:vt,isPowerOfTwo:yt,ceilPowerOfTwo:bt,floorPowerOfTwo:xt,setQuaternionFromProperEuler:St,normalize:wt,denormalize:Ct},W=class e{static{e.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw Error(`THREE.Vector2: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw Error(`THREE.Vector2: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=U(this.x,e.x,t.x),this.y=U(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=U(this.x,e,t),this.y=U(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(U(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(U(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),r=Math.sin(t),i=this.x-e.x,a=this.y-e.y;return this.x=i*n-a*r+e.x,this.y=i*r+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},G=class{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,i,a,o){let s=n[r+0],c=n[r+1],l=n[r+2],u=n[r+3],d=i[a+0],f=i[a+1],p=i[a+2],m=i[a+3];if(u!==m||s!==d||c!==f||l!==p){let e=s*d+c*f+l*p+u*m;e<0&&(d=-d,f=-f,p=-p,m=-m,e=-e);let t=1-o;if(e<.9995){let n=Math.acos(e),r=Math.sin(n);t=Math.sin(t*n)/r,o=Math.sin(o*n)/r,s=s*t+d*o,c=c*t+f*o,l=l*t+p*o,u=u*t+m*o}else{s=s*t+d*o,c=c*t+f*o,l=l*t+p*o,u=u*t+m*o;let e=1/Math.sqrt(s*s+c*c+l*l+u*u);s*=e,c*=e,l*=e,u*=e}}e[t]=s,e[t+1]=c,e[t+2]=l,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,r,i,a){let o=n[r],s=n[r+1],c=n[r+2],l=n[r+3],u=i[a],d=i[a+1],f=i[a+2],p=i[a+3];return e[t]=o*p+l*u+s*f-c*d,e[t+1]=s*p+l*d+c*u-o*f,e[t+2]=c*p+l*f+o*d-s*u,e[t+3]=l*p-o*u-s*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,r=e._y,i=e._z,a=e._order,o=Math.cos,s=Math.sin,c=o(n/2),l=o(r/2),u=o(i/2),d=s(n/2),f=s(r/2),p=s(i/2);switch(a){case`XYZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`YXZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`ZXY`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`ZYX`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`YZX`:this._x=d*l*u+c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u-d*f*p;break;case`XZY`:this._x=d*l*u-c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u+d*f*p;break;default:V(`Quaternion: .setFromEuler() encountered an unknown order: `+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],r=t[4],i=t[8],a=t[1],o=t[5],s=t[9],c=t[2],l=t[6],u=t[10],d=n+o+u;if(d>0){let e=.5/Math.sqrt(d+1);this._w=.25/e,this._x=(l-s)*e,this._y=(i-c)*e,this._z=(a-r)*e}else if(n>o&&n>u){let e=2*Math.sqrt(1+n-o-u);this._w=(l-s)/e,this._x=.25*e,this._y=(r+a)/e,this._z=(i+c)/e}else if(o>u){let e=2*Math.sqrt(1+o-n-u);this._w=(i-c)/e,this._x=(r+a)/e,this._y=.25*e,this._z=(s+l)/e}else{let e=2*Math.sqrt(1+u-n-o);this._w=(a-r)/e,this._x=(i+c)/e,this._y=(s+l)/e,this._z=.25*e}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(U(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x*=e,this._y*=e,this._z*=e,this._w*=e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=t._x,s=t._y,c=t._z,l=t._w;return this._x=n*l+a*o+r*c-i*s,this._y=r*l+a*s+i*o-n*c,this._z=i*l+a*c+n*s-r*o,this._w=a*l-n*o-r*s-i*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,r=-r,i=-i,a=-a,o=-o);let s=1-t;if(o<.9995){let e=Math.acos(o),c=Math.sin(e);s=Math.sin(s*e)/c,t=Math.sin(t*e)/c,this._x=this._x*s+n*t,this._y=this._y*s+r*t,this._z=this._z*s+i*t,this._w=this._w*s+a*t,this._onChangeCallback()}else this._x=this._x*s+n*t,this._y=this._y*s+r*t,this._z=this._z*s+i*t,this._w=this._w*s+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),i=Math.sqrt(n);return this.set(r*Math.sin(e),r*Math.cos(e),i*Math.sin(t),i*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},K=class e{static{e.prototype.isVector3=!0}constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw Error(`THREE.Vector3: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw Error(`THREE.Vector3: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Dt.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Dt.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6]*r,this.y=i[1]*t+i[4]*n+i[7]*r,this.z=i[2]*t+i[5]*n+i[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=e.elements,a=1/(i[3]*t+i[7]*n+i[11]*r+i[15]);return this.x=(i[0]*t+i[4]*n+i[8]*r+i[12])*a,this.y=(i[1]*t+i[5]*n+i[9]*r+i[13])*a,this.z=(i[2]*t+i[6]*n+i[10]*r+i[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,r=this.z,i=e.x,a=e.y,o=e.z,s=e.w,c=2*(a*r-o*n),l=2*(o*t-i*r),u=2*(i*n-a*t);return this.x=t+s*c+a*u-o*l,this.y=n+s*l+o*c-i*u,this.z=r+s*u+i*l-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[4]*n+i[8]*r,this.y=i[1]*t+i[5]*n+i[9]*r,this.z=i[2]*t+i[6]*n+i[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=U(this.x,e.x,t.x),this.y=U(this.y,e.y,t.y),this.z=U(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=U(this.x,e,t),this.y=U(this.y,e,t),this.z=U(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(U(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,r=e.y,i=e.z,a=t.x,o=t.y,s=t.z;return this.x=r*s-i*o,this.y=i*a-n*s,this.z=n*o-r*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Et.copy(this).projectOnVector(e),this.sub(Et)}reflect(e){return this.sub(Et.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(U(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Et=new K,Dt=new G,Ot=class e{static{e.prototype.isMatrix3=!0}constructor(e,t,n,r,i,a,o,s,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,r,i,a,o,s,c)}set(e,t,n,r,i,a,o,s,c){let l=this.elements;return l[0]=e,l[1]=r,l[2]=o,l[3]=t,l[4]=i,l[5]=s,l[6]=n,l[7]=a,l[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[3],s=n[6],c=n[1],l=n[4],u=n[7],d=n[2],f=n[5],p=n[8],m=r[0],h=r[3],g=r[6],_=r[1],v=r[4],y=r[7],b=r[2],x=r[5],S=r[8];return i[0]=a*m+o*_+s*b,i[3]=a*h+o*v+s*x,i[6]=a*g+o*y+s*S,i[1]=c*m+l*_+u*b,i[4]=c*h+l*v+u*x,i[7]=c*g+l*y+u*S,i[2]=d*m+f*_+p*b,i[5]=d*h+f*v+p*x,i[8]=d*g+f*y+p*S,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8];return t*a*l-t*o*c-n*i*l+n*o*s+r*i*c-r*a*s}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=l*a-o*c,d=o*s-l*i,f=c*i-a*s,p=t*u+n*d+r*f;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);let m=1/p;return e[0]=u*m,e[1]=(r*c-l*n)*m,e[2]=(o*n-r*a)*m,e[3]=d*m,e[4]=(l*t-r*s)*m,e[5]=(r*i-o*t)*m,e[6]=f*m,e[7]=(n*s-c*t)*m,e[8]=(a*t-n*i)*m,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,i,a,o){let s=Math.cos(i),c=Math.sin(i);return this.set(n*s,n*c,-n*(s*a+c*o)+a+e,-r*c,r*s,-r*(-c*a+s*o)+o+t,0,0,1),this}scale(e,t){return Xe(`Matrix3: .scale() is deprecated. Use .makeScale() instead.`),this.premultiply(kt.makeScale(e,t)),this}rotate(e){return Xe(`Matrix3: .rotate() is deprecated. Use .makeRotation() instead.`),this.premultiply(kt.makeRotation(-e)),this}translate(e,t){return Xe(`Matrix3: .translate() is deprecated. Use .makeTranslation() instead.`),this.premultiply(kt.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<9;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},kt=new Ot,At=new Ot().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),jt=new Ot().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Mt(){let e={enabled:!0,workingColorSpace:Ie,spaces:{},convert:function(e,t,n){return this.enabled===!1||t===n||!t||!n?e:(this.spaces[t].transfer===`srgb`&&(e.r=Pt(e.r),e.g=Pt(e.g),e.b=Pt(e.b)),this.spaces[t].primaries!==this.spaces[n].primaries&&(e.applyMatrix3(this.spaces[t].toXYZ),e.applyMatrix3(this.spaces[n].fromXYZ)),this.spaces[n].transfer===`srgb`&&(e.r=Ft(e.r),e.g=Ft(e.g),e.b=Ft(e.b)),e)},workingToColorSpace:function(e,t){return this.convert(e,this.workingColorSpace,t)},colorSpaceToWorking:function(e,t){return this.convert(e,t,this.workingColorSpace)},getPrimaries:function(e){return this.spaces[e].primaries},getTransfer:function(e){return e===``?Le:this.spaces[e].transfer},getToneMappingMode:function(e){return this.spaces[e].outputColorSpaceConfig.toneMappingMode||`standard`},getLuminanceCoefficients:function(e,t=this.workingColorSpace){return e.fromArray(this.spaces[t].luminanceCoefficients)},define:function(e){Object.assign(this.spaces,e)},_getMatrix:function(e,t,n){return e.copy(this.spaces[t].toXYZ).multiply(this.spaces[n].fromXYZ)},_getDrawingBufferColorSpace:function(e){return this.spaces[e].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(e=this.workingColorSpace){return this.spaces[e].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(t,n){return Xe(`ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace().`),e.workingToColorSpace(t,n)},toWorkingColorSpace:function(t,n){return Xe(`ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking().`),e.colorSpaceToWorking(t,n)}},t=[.64,.33,.3,.6,.15,.06],n=[.2126,.7152,.0722],r=[.3127,.329];return e.define({[Ie]:{primaries:t,whitePoint:r,transfer:Le,toXYZ:At,fromXYZ:jt,luminanceCoefficients:n,workingColorSpaceConfig:{unpackColorSpace:Fe},outputColorSpaceConfig:{drawingBufferColorSpace:Fe}},[Fe]:{primaries:t,whitePoint:r,transfer:Re,toXYZ:At,fromXYZ:jt,luminanceCoefficients:n,outputColorSpaceConfig:{drawingBufferColorSpace:Fe}}}),e}var Nt=Mt();function Pt(e){return e<.04045?e*.0773993808:(e*.9478672986+.0521327014)**2.4}function Ft(e){return e<.0031308?e*12.92:1.055*e**.41666-.055}var It,Lt=class{static getDataURL(e,t=`image/png`){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>`u`)return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{It===void 0&&(It=Ge(`canvas`)),It.width=e.width,It.height=e.height;let t=It.getContext(`2d`);e instanceof ImageData?t.putImageData(e,0,0):t.drawImage(e,0,0,e.width,e.height),n=It}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap){let t=Ge(`canvas`);t.width=e.width,t.height=e.height;let n=t.getContext(`2d`);n.drawImage(e,0,0,e.width,e.height);let r=n.getImageData(0,0,e.width,e.height),i=r.data;for(let e=0;e<i.length;e++)i[e]=Pt(i[e]/255)*255;return n.putImageData(r,0,0),t}if(e.data){let t=e.data.slice(0);for(let e=0;e<t.length;e++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[e]=Math.floor(Pt(t[e]/255)*255):t[e]=Pt(t[e]);return{data:t,width:e.width,height:e.height}}return V(`ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied.`),e}},Rt=0,zt=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Rt++}),this.uuid=it(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<`u`&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<`u`&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t===null?e.set(0,0,0):e.set(t.width,t.height,t.depth||0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:``},r=this.data;if(r!==null){let e;if(Array.isArray(r)){e=[];for(let t=0,n=r.length;t<n;t++)r[t].isDataTexture?e.push(Bt(r[t].image)):e.push(Bt(r[t]))}else e=Bt(r);n.url=e}return t||(e.images[this.uuid]=n),n}};function Bt(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap?Lt.getDataURL(e):e.data?{data:Array.from(e.data),width:e.width,height:e.height,type:e.data.constructor.name}:(V(`Texture: Unable to serialize Texture.`),{})}var Vt=0,Ht=new K,Ut=class r extends $e{constructor(e=r.DEFAULT_IMAGE,n=r.DEFAULT_MAPPING,i=t,a=t,s=o,u=c,d=w,f=l,p=r.DEFAULT_ANISOTROPY,m=``){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Vt++}),this.uuid=it(),this.name=``,this.source=new zt(e),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=i,this.wrapT=a,this.magFilter=s,this.minFilter=u,this.anisotropy=p,this.format=d,this.internalFormat=null,this.type=f,this.offset=new W(0,0),this.repeat=new W(1,1),this.center=new W(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ot,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=m,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(Ht).x}get height(){return this.source.getSize(Ht).y}get depth(){return this.source.getSize(Ht).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){V(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){V(`Texture.setValues(): property '${t}' does not exist.`);continue}r&&n&&r.isVector2&&n.isVector2||r&&n&&r.isVector3&&n.isVector3||r&&n&&r.isMatrix3&&n.isMatrix3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:`Texture`,generator:`Texture.toJSON`},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:`dispose`})}transformUv(r){if(this.mapping!==300)return r;if(r.applyMatrix3(this.matrix),r.x<0||r.x>1)switch(this.wrapS){case e:r.x-=Math.floor(r.x);break;case t:r.x=r.x<0?0:1;break;case n:Math.abs(Math.floor(r.x)%2)===1?r.x=Math.ceil(r.x)-r.x:r.x-=Math.floor(r.x)}if(r.y<0||r.y>1)switch(this.wrapT){case e:r.y-=Math.floor(r.y);break;case t:r.y=r.y<0?0:1;break;case n:Math.abs(Math.floor(r.y)%2)===1?r.y=Math.ceil(r.y)-r.y:r.y-=Math.floor(r.y)}return this.flipY&&(r.y=1-r.y),r}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Ut.DEFAULT_IMAGE=null,Ut.DEFAULT_MAPPING=300,Ut.DEFAULT_ANISOTROPY=1;var Wt=class e{static{e.prototype.isVector4=!0}constructor(e=0,t=0,n=0,r=1){this.x=e,this.y=t,this.z=n,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw Error(`THREE.Vector4: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw Error(`THREE.Vector4: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w===void 0?1:e.w,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*r+a[12]*i,this.y=a[1]*t+a[5]*n+a[9]*r+a[13]*i,this.z=a[2]*t+a[6]*n+a[10]*r+a[14]*i,this.w=a[3]*t+a[7]*n+a[11]*r+a[15]*i,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,i,a=.01,o=.1,s=e.elements,c=s[0],l=s[4],u=s[8],d=s[1],f=s[5],p=s[9],m=s[2],h=s[6],g=s[10];if(Math.abs(l-d)<a&&Math.abs(u-m)<a&&Math.abs(p-h)<a){if(Math.abs(l+d)<o&&Math.abs(u+m)<o&&Math.abs(p+h)<o&&Math.abs(c+f+g-3)<o)return this.set(1,0,0,0),this;t=Math.PI;let e=(c+1)/2,s=(f+1)/2,_=(g+1)/2,v=(l+d)/4,y=(u+m)/4,b=(p+h)/4;return e>s&&e>_?e<a?(n=0,r=.707106781,i=.707106781):(n=Math.sqrt(e),r=v/n,i=y/n):s>_?s<a?(n=.707106781,r=0,i=.707106781):(r=Math.sqrt(s),n=v/r,i=b/r):_<a?(n=.707106781,r=.707106781,i=0):(i=Math.sqrt(_),n=y/i,r=b/i),this.set(n,r,i,t),this}let _=Math.sqrt((h-p)*(h-p)+(u-m)*(u-m)+(d-l)*(d-l));return Math.abs(_)<.001&&(_=1),this.x=(h-p)/_,this.y=(u-m)/_,this.z=(d-l)/_,this.w=Math.acos((c+f+g-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=U(this.x,e.x,t.x),this.y=U(this.y,e.y,t.y),this.z=U(this.z,e.z,t.z),this.w=U(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=U(this.x,e,t),this.y=U(this.y,e,t),this.z=U(this.z,e,t),this.w=U(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(U(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Gt=class extends $e{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:o,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new Wt(0,0,e,t),this.scissorTest=!1,this.viewport=new Wt(0,0,e,t),this.textures=[];let r=new Ut({width:e,height:t,depth:n.depth}),i=n.count;for(let e=0;e<i;e++)this.textures[e]=r.clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:o,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let e=0;e<this.textures.length;e++)this.textures[e].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let r=0,i=this.textures.length;r<i;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=n,this.textures[r].isData3DTexture!==!0&&(this.textures[r].isArrayTexture=this.textures[r].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let n=Object.assign({},e.textures[t].image);this.textures[t].source=new zt(n)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null){if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture}return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:`dispose`})}},Kt=class extends Gt{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},qt=class extends Ut{constructor(e=null,n=1,i=1,a=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:n,height:i,depth:a},this.magFilter=r,this.minFilter=r,this.wrapR=t,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}},Jt=class extends Ut{constructor(e=null,n=1,i=1,a=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:n,height:i,depth:a},this.magFilter=r,this.minFilter=r,this.wrapR=t,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}},Yt=class e{static{e.prototype.isMatrix4=!0}constructor(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h)}set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){let g=this.elements;return g[0]=e,g[4]=t,g[8]=n,g[12]=r,g[1]=i,g[5]=a,g[9]=o,g[13]=s,g[2]=c,g[6]=l,g[10]=u,g[14]=d,g[3]=f,g[7]=p,g[11]=m,g[15]=h,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new e().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,r=1/Xt.setFromMatrixColumn(e,0).length(),i=1/Xt.setFromMatrixColumn(e,1).length(),a=1/Xt.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*i,t[5]=n[5]*i,t[6]=n[6]*i,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,r=e.y,i=e.z,a=Math.cos(n),o=Math.sin(n),s=Math.cos(r),c=Math.sin(r),l=Math.cos(i),u=Math.sin(i);if(e.order===`XYZ`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=-s*u,t[8]=c,t[1]=n+r*c,t[5]=e-i*c,t[9]=-o*s,t[2]=i-e*c,t[6]=r+n*c,t[10]=a*s}else if(e.order===`YXZ`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e+i*o,t[4]=r*o-n,t[8]=a*c,t[1]=a*u,t[5]=a*l,t[9]=-o,t[2]=n*o-r,t[6]=i+e*o,t[10]=a*s}else if(e.order===`ZXY`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e-i*o,t[4]=-a*u,t[8]=r+n*o,t[1]=n+r*o,t[5]=a*l,t[9]=i-e*o,t[2]=-a*c,t[6]=o,t[10]=a*s}else if(e.order===`ZYX`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=r*c-n,t[8]=e*c+i,t[1]=s*u,t[5]=i*c+e,t[9]=n*c-r,t[2]=-c,t[6]=o*s,t[10]=a*s}else if(e.order===`YZX`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=i-e*u,t[8]=r*u+n,t[1]=u,t[5]=a*l,t[9]=-o*l,t[2]=-c*l,t[6]=n*u+r,t[10]=e-i*u}else if(e.order===`XZY`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=-u,t[8]=c*l,t[1]=e*u+i,t[5]=a*l,t[9]=n*u-r,t[2]=r*u-n,t[6]=o*l,t[10]=i*u+e}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Qt,e,$t)}lookAt(e,t,n){let r=this.elements;return nn.subVectors(e,t),nn.lengthSq()===0&&(nn.z=1),nn.normalize(),en.crossVectors(n,nn),en.lengthSq()===0&&(Math.abs(n.z)===1?nn.x+=1e-4:nn.z+=1e-4,nn.normalize(),en.crossVectors(n,nn)),en.normalize(),tn.crossVectors(nn,en),r[0]=en.x,r[4]=tn.x,r[8]=nn.x,r[1]=en.y,r[5]=tn.y,r[9]=nn.y,r[2]=en.z,r[6]=tn.z,r[10]=nn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[4],s=n[8],c=n[12],l=n[1],u=n[5],d=n[9],f=n[13],p=n[2],m=n[6],h=n[10],g=n[14],_=n[3],v=n[7],y=n[11],b=n[15],x=r[0],S=r[4],C=r[8],w=r[12],T=r[1],E=r[5],D=r[9],O=r[13],k=r[2],A=r[6],j=r[10],M=r[14],ee=r[3],N=r[7],te=r[11],P=r[15];return i[0]=a*x+o*T+s*k+c*ee,i[4]=a*S+o*E+s*A+c*N,i[8]=a*C+o*D+s*j+c*te,i[12]=a*w+o*O+s*M+c*P,i[1]=l*x+u*T+d*k+f*ee,i[5]=l*S+u*E+d*A+f*N,i[9]=l*C+u*D+d*j+f*te,i[13]=l*w+u*O+d*M+f*P,i[2]=p*x+m*T+h*k+g*ee,i[6]=p*S+m*E+h*A+g*N,i[10]=p*C+m*D+h*j+g*te,i[14]=p*w+m*O+h*M+g*P,i[3]=_*x+v*T+y*k+b*ee,i[7]=_*S+v*E+y*A+b*N,i[11]=_*C+v*D+y*j+b*te,i[15]=_*w+v*O+y*M+b*P,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[12],a=e[1],o=e[5],s=e[9],c=e[13],l=e[2],u=e[6],d=e[10],f=e[14],p=e[3],m=e[7],h=e[11],g=e[15],_=s*f-c*d,v=o*f-c*u,y=o*d-s*u,b=a*f-c*l,x=a*d-s*l,S=a*u-o*l;return t*(m*_-h*v+g*y)-n*(p*_-h*b+g*x)+r*(p*v-m*b+g*S)-i*(p*y-m*x+h*S)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[1],a=e[5],o=e[9],s=e[2],c=e[6],l=e[10];return t*(a*l-o*c)-n*(i*l-o*s)+r*(i*c-a*s)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=e[9],d=e[10],f=e[11],p=e[12],m=e[13],h=e[14],g=e[15],_=t*o-n*a,v=t*s-r*a,y=t*c-i*a,b=n*s-r*o,x=n*c-i*o,S=r*c-i*s,C=l*m-u*p,w=l*h-d*p,T=l*g-f*p,E=u*h-d*m,D=u*g-f*m,O=d*g-f*h,k=_*O-v*D+y*E+b*T-x*w+S*C;if(k===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let A=1/k;return e[0]=(o*O-s*D+c*E)*A,e[1]=(r*D-n*O-i*E)*A,e[2]=(m*S-h*x+g*b)*A,e[3]=(d*x-u*S-f*b)*A,e[4]=(s*T-a*O-c*w)*A,e[5]=(t*O-r*T+i*w)*A,e[6]=(h*y-p*S-g*v)*A,e[7]=(l*S-d*y+f*v)*A,e[8]=(a*D-o*T+c*C)*A,e[9]=(n*T-t*D-i*C)*A,e[10]=(p*x-m*y+g*_)*A,e[11]=(u*y-l*x-f*_)*A,e[12]=(o*w-a*E-s*C)*A,e[13]=(t*E-n*w+r*C)*A,e[14]=(m*v-p*b-h*_)*A,e[15]=(l*b-u*v+d*_)*A,this}scale(e){let t=this.elements,n=e.x,r=e.y,i=e.z;return t[0]*=n,t[4]*=r,t[8]*=i,t[1]*=n,t[5]*=r,t[9]*=i,t[2]*=n,t[6]*=r,t[10]*=i,t[3]*=n,t[7]*=r,t[11]*=i,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),r=Math.sin(t),i=1-n,a=e.x,o=e.y,s=e.z,c=i*a,l=i*o;return this.set(c*a+n,c*o-r*s,c*s+r*o,0,c*o+r*s,l*o+n,l*s-r*a,0,c*s-r*o,l*s+r*a,i*s*s+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,i,a){return this.set(1,n,i,0,e,1,a,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){let r=this.elements,i=t._x,a=t._y,o=t._z,s=t._w,c=i+i,l=a+a,u=o+o,d=i*c,f=i*l,p=i*u,m=a*l,h=a*u,g=o*u,_=s*c,v=s*l,y=s*u,b=n.x,x=n.y,S=n.z;return r[0]=(1-(m+g))*b,r[1]=(f+y)*b,r[2]=(p-v)*b,r[3]=0,r[4]=(f-y)*x,r[5]=(1-(d+g))*x,r[6]=(h+_)*x,r[7]=0,r[8]=(p+v)*S,r[9]=(h-_)*S,r[10]=(1-(d+m))*S,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){let r=this.elements;e.x=r[12],e.y=r[13],e.z=r[14];let i=this.determinantAffine();if(i===0)return n.set(1,1,1),t.identity(),this;let a=Xt.set(r[0],r[1],r[2]).length(),o=Xt.set(r[4],r[5],r[6]).length(),s=Xt.set(r[8],r[9],r[10]).length();i<0&&(a=-a),Zt.copy(this);let c=1/a,l=1/o,u=1/s;return Zt.elements[0]*=c,Zt.elements[1]*=c,Zt.elements[2]*=c,Zt.elements[4]*=l,Zt.elements[5]*=l,Zt.elements[6]*=l,Zt.elements[8]*=u,Zt.elements[9]*=u,Zt.elements[10]*=u,t.setFromRotationMatrix(Zt),n.x=a,n.y=o,n.z=s,this}makePerspective(e,t,n,r,i,a,o=He,s=!1){let c=this.elements,l=2*i/(t-e),u=2*i/(n-r),d=(t+e)/(t-e),f=(n+r)/(n-r),p,m;if(s)p=i/(a-i),m=a*i/(a-i);else if(o===2e3)p=-(a+i)/(a-i),m=-2*a*i/(a-i);else if(o===2001)p=-a/(a-i),m=-a*i/(a-i);else throw Error(`THREE.Matrix4.makePerspective(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,r,i,a,o=He,s=!1){let c=this.elements,l=2/(t-e),u=2/(n-r),d=-(t+e)/(t-e),f=-(n+r)/(n-r),p,m;if(s)p=1/(a-i),m=a/(a-i);else if(o===2e3)p=-2/(a-i),m=-(a+i)/(a-i);else if(o===2001)p=-1/(a-i),m=-i/(a-i);else throw Error(`THREE.Matrix4.makeOrthographic(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<16;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},Xt=new K,Zt=new Yt,Qt=new K(0,0,0),$t=new K(1,1,1),en=new K,tn=new K,nn=new K,rn=new Yt,an=new G,on=class e{constructor(t=0,n=0,r=0,i=e.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=n,this._z=r,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let r=e.elements,i=r[0],a=r[4],o=r[8],s=r[1],c=r[5],l=r[9],u=r[2],d=r[6],f=r[10];switch(t){case`XYZ`:this._y=Math.asin(U(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-l,f),this._z=Math.atan2(-a,i)):(this._x=Math.atan2(d,c),this._z=0);break;case`YXZ`:this._x=Math.asin(-U(l,-1,1)),Math.abs(l)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(s,c)):(this._y=Math.atan2(-u,i),this._z=0);break;case`ZXY`:this._x=Math.asin(U(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(s,i));break;case`ZYX`:this._y=Math.asin(-U(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(s,i)):(this._x=0,this._z=Math.atan2(-a,c));break;case`YZX`:this._z=Math.asin(U(s,-1,1)),Math.abs(s)<.9999999?(this._x=Math.atan2(-l,c),this._y=Math.atan2(-u,i)):(this._x=0,this._y=Math.atan2(o,f));break;case`XZY`:this._z=Math.asin(-U(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,i)):(this._x=Math.atan2(-l,f),this._y=0);break;default:V(`Euler: .setFromRotationMatrix() encountered an unknown order: `+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return rn.makeRotationFromQuaternion(e),this.setFromRotationMatrix(rn,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return an.setFromEuler(this),this.setFromQuaternion(an,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};on.DEFAULT_ORDER=`XYZ`;var sn=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return!!(this.mask&(1<<e|0))}},cn=0,ln=new K,un=new G,dn=new Yt,fn=new K,pn=new K,mn=new K,hn=new G,gn=new K(1,0,0),_n=new K(0,1,0),vn=new K(0,0,1),yn={type:`added`},bn={type:`removed`},xn={type:`childadded`,child:null},Sn={type:`childremoved`,child:null},Cn=class e extends $e{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:cn++}),this.uuid=it(),this.name=``,this.type=`Object3D`,this.parent=null,this.children=[],this.up=e.DEFAULT_UP.clone();let t=new K,n=new on,r=new G,i=new K(1,1,1);function a(){r.setFromEuler(n,!1)}function o(){n.setFromQuaternion(r,void 0,!1)}n._onChange(a),r._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:r},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new Yt},normalMatrix:{value:new Ot}}),this.matrix=new Yt,this.matrixWorld=new Yt,this.matrixAutoUpdate=e.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new sn,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return un.setFromAxisAngle(e,t),this.quaternion.multiply(un),this}rotateOnWorldAxis(e,t){return un.setFromAxisAngle(e,t),this.quaternion.premultiply(un),this}rotateX(e){return this.rotateOnAxis(gn,e)}rotateY(e){return this.rotateOnAxis(_n,e)}rotateZ(e){return this.rotateOnAxis(vn,e)}translateOnAxis(e,t){return ln.copy(e).applyQuaternion(this.quaternion),this.position.add(ln.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(gn,e)}translateY(e){return this.translateOnAxis(_n,e)}translateZ(e){return this.translateOnAxis(vn,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(dn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?fn.copy(e):fn.set(e,t,n);let r=this.parent;this.updateWorldMatrix(!0,!1),pn.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?dn.lookAt(pn,fn,this.up):dn.lookAt(fn,pn,this.up),this.quaternion.setFromRotationMatrix(dn),r&&(dn.extractRotation(r.matrixWorld),un.setFromRotationMatrix(dn),this.quaternion.premultiply(un.invert()))}add(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return e===this?(H(`Object3D.add: object can't be added as a child of itself.`,e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(yn),xn.child=e,this.dispatchEvent(xn),xn.child=null):H(`Object3D.add: object not an instance of THREE.Object3D.`,e),this)}remove(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.remove(arguments[e]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(bn),Sn.child=e,this.dispatchEvent(Sn),Sn.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),dn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),dn.multiply(e.parent.matrixWorld)),e.applyMatrix4(dn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(yn),xn.child=e,this.dispatchEvent(xn),xn.child=null,this}getObjectById(e){return this.getObjectByProperty(`id`,e)}getObjectByName(e){return this.getObjectByProperty(`name`,e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){let r=this.children[n].getObjectByProperty(e,t);if(r!==void 0)return r}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let r=this.children;for(let i=0,a=r.length;i<a;i++)r[i].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(pn,e,mn),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(pn,hn,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(e){e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,r=e.z,i=this.matrix.elements;i[12]+=t-i[0]*t-i[4]*n-i[8]*r,i[13]+=n-i[1]*t-i[5]*n-i[9]*r,i[14]+=r-i[2]*t-i[6]*n-i[10]*r}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let r=this.parent;if(e===!0&&r!==null&&r.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let e=this.children;for(let t=0,r=e.length;t<r;t++)e[t].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e==`string`,n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:`Object`,generator:`Object3D.toJSON`});let r={};r.uuid=this.uuid,r.type=this.type,r.name=this.name,r.castShadow=this.castShadow,r.receiveShadow=this.receiveShadow,r.visible=this.visible,r.frustumCulled=this.frustumCulled,r.renderOrder=this.renderOrder,r.static=this.static,r.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.pivot!==null&&(r.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(r.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(r.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(r.type=`InstancedMesh`,r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type=`BatchedMesh`,r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(e=>({...e,boundingBox:e.boundingBox?e.boundingBox.toJSON():void 0,boundingSphere:e.boundingSphere?e.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(e=>({...e})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function i(t,n){return t[n.uuid]===void 0&&(t[n.uuid]=n.toJSON(e)),n.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=i(e.geometries,this.geometry);let t=this.geometry.parameters;if(t!==void 0&&t.shapes!==void 0){let n=t.shapes;if(Array.isArray(n))for(let t=0,r=n.length;t<r;t++){let r=n[t];i(e.shapes,r)}else i(e.shapes,n)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(i(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0){if(Array.isArray(this.material)){let t=[];for(let n=0,r=this.material.length;n<r;n++)t.push(i(e.materials,this.material[n]));r.material=t}else r.material=i(e.materials,this.material)}if(this.children.length>0){r.children=[];for(let t=0;t<this.children.length;t++)r.children.push(this.children[t].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let t=0;t<this.animations.length;t++){let n=this.animations[t];r.animations.push(i(e.animations,n))}}if(t){let t=a(e.geometries),r=a(e.materials),i=a(e.textures),o=a(e.images),s=a(e.shapes),c=a(e.skeletons),l=a(e.animations),u=a(e.nodes);t.length>0&&(n.geometries=t),r.length>0&&(n.materials=r),i.length>0&&(n.textures=i),o.length>0&&(n.images=o),s.length>0&&(n.shapes=s),c.length>0&&(n.skeletons=c),l.length>0&&(n.animations=l),u.length>0&&(n.nodes=u)}return n.object=r,n;function a(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot===null?null:e.pivot.clone(),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let t=0;t<e.children.length;t++){let n=e.children[t];this.add(n.clone())}return this}dispose(){this.dispatchEvent({type:`dispose`})}};Cn.DEFAULT_UP=new K(0,1,0),Cn.DEFAULT_MATRIX_AUTO_UPDATE=!0,Cn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var wn=class extends Cn{constructor(){super(),this.isGroup=!0,this.type=`Group`}},Tn={type:`move`},En=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new wn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new wn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new K,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new K),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new wn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new K,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new K,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:`connected`,data:e}),this}disconnect(e){return this.dispatchEvent({type:`disconnected`,data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,i=null,a=null,o=this._targetRay,s=this._grip,c=this._hand;if(e&&t.session.visibilityState!==`visible-blurred`){if(c&&e.hand){a=!0;for(let r of e.hand.values()){let e=t.getJointPose(r,n),i=this._getHandJoint(c,r);e!==null&&(i.matrix.fromArray(e.transform.matrix),i.matrix.decompose(i.position,i.rotation,i.scale),i.matrixWorldNeedsUpdate=!0,i.jointRadius=e.radius),i.visible=e!==null}let r=c.joints[`index-finger-tip`],i=c.joints[`thumb-tip`],o=r.position.distanceTo(i.position);c.inputState.pinching&&o>.025?(c.inputState.pinching=!1,this.dispatchEvent({type:`pinchend`,handedness:e.handedness,target:this})):!c.inputState.pinching&&o<=.015&&(c.inputState.pinching=!0,this.dispatchEvent({type:`pinchstart`,handedness:e.handedness,target:this}))}else s!==null&&e.gripSpace&&(i=t.getPose(e.gripSpace,n),i!==null&&(s.matrix.fromArray(i.transform.matrix),s.matrix.decompose(s.position,s.rotation,s.scale),s.matrixWorldNeedsUpdate=!0,i.linearVelocity?(s.hasLinearVelocity=!0,s.linearVelocity.copy(i.linearVelocity)):s.hasLinearVelocity=!1,i.angularVelocity?(s.hasAngularVelocity=!0,s.angularVelocity.copy(i.angularVelocity)):s.hasAngularVelocity=!1,s.eventsEnabled&&s.dispatchEvent({type:`gripUpdated`,data:e,target:this})));o!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&i!==null&&(r=i),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Tn)))}return o!==null&&(o.visible=r!==null),s!==null&&(s.visible=i!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new wn;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},Dn={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},On={h:0,s:0,l:0},kn={h:0,s:0,l:0};function An(e,t,n){return n<0&&(n+=1),n>1&&--n,n<1/6?e+(t-e)*6*n:n<1/2?t:n<2/3?e+(t-e)*6*(2/3-n):e}var q=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let t=e;t&&t.isColor?this.copy(t):typeof t==`number`?this.setHex(t):typeof t==`string`&&this.setStyle(t)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Fe){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Nt.colorSpaceToWorking(this,t),this}setRGB(e,t,n,r=Nt.workingColorSpace){return this.r=e,this.g=t,this.b=n,Nt.colorSpaceToWorking(this,r),this}setHSL(e,t,n,r=Nt.workingColorSpace){if(e=at(e,1),t=U(t,0,1),n=U(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,i=2*n-r;this.r=An(i,r,e+1/3),this.g=An(i,r,e),this.b=An(i,r,e-1/3)}return Nt.colorSpaceToWorking(this,r),this}setStyle(e,t=Fe){function n(t){t!==void 0&&parseFloat(t)<1&&V(`Color: Alpha component of `+e+` will be ignored.`)}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let i,a=r[1],o=r[2];switch(a){case`rgb`:case`rgba`:if(i=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(255,parseInt(i[1],10))/255,Math.min(255,parseInt(i[2],10))/255,Math.min(255,parseInt(i[3],10))/255,t);if(i=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(100,parseInt(i[1],10))/100,Math.min(100,parseInt(i[2],10))/100,Math.min(100,parseInt(i[3],10))/100,t);break;case`hsl`:case`hsla`:if(i=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setHSL(parseFloat(i[1])/360,parseFloat(i[2])/100,parseFloat(i[3])/100,t);break;default:V(`Color: Unknown color model `+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let n=r[1],i=n.length;if(i===3)return this.setRGB(parseInt(n.charAt(0),16)/15,parseInt(n.charAt(1),16)/15,parseInt(n.charAt(2),16)/15,t);if(i===6)return this.setHex(parseInt(n,16),t);V(`Color: Invalid hex color `+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Fe){let n=Dn[e.toLowerCase()];return n===void 0?V(`Color: Unknown color `+e):this.setHex(n,t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Pt(e.r),this.g=Pt(e.g),this.b=Pt(e.b),this}copyLinearToSRGB(e){return this.r=Ft(e.r),this.g=Ft(e.g),this.b=Ft(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Fe){return Nt.workingToColorSpace(jn.copy(this),e),Math.round(U(jn.r*255,0,255))*65536+Math.round(U(jn.g*255,0,255))*256+Math.round(U(jn.b*255,0,255))}getHexString(e=Fe){return(`000000`+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Nt.workingColorSpace){Nt.workingToColorSpace(jn.copy(this),t);let n=jn.r,r=jn.g,i=jn.b,a=Math.max(n,r,i),o=Math.min(n,r,i),s,c,l=(o+a)/2;if(o===a)s=0,c=0;else{let e=a-o;switch(c=l<=.5?e/(a+o):e/(2-a-o),a){case n:s=(r-i)/e+(r<i?6:0);break;case r:s=(i-n)/e+2;break;case i:s=(n-r)/e+4}s/=6}return e.h=s,e.s=c,e.l=l,e}getRGB(e,t=Nt.workingColorSpace){return Nt.workingToColorSpace(jn.copy(this),t),e.r=jn.r,e.g=jn.g,e.b=jn.b,e}getStyle(e=Fe){Nt.workingToColorSpace(jn.copy(this),e);let t=jn.r,n=jn.g,r=jn.b;return e===`srgb`?`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`:`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`}offsetHSL(e,t,n){return this.getHSL(On),this.setHSL(On.h+e,On.s+t,On.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(On),e.getHSL(kn);let n=ct(On.h,kn.h,t),r=ct(On.s,kn.s,t),i=ct(On.l,kn.l,t);return this.setHSL(n,r,i),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,r=this.b,i=e.elements;return this.r=i[0]*t+i[3]*n+i[6]*r,this.g=i[1]*t+i[4]*n+i[7]*r,this.b=i[2]*t+i[5]*n+i[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},jn=new q;q.NAMES=Dn;var Mn=class e{constructor(e,t=1,n=1e3){this.isFog=!0,this.name=``,this.color=new q(e),this.near=t,this.far=n}clone(){return new e(this.color,this.near,this.far)}toJSON(){return{type:`Fog`,name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}},Nn=class extends Cn{constructor(){super(),this.isScene=!0,this.type=`Scene`,this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new on,this.environmentIntensity=1,this.environmentRotation=new on,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},Pn=new K,Fn=new K,In=new K,Ln=new K,Rn=new K,zn=new K,Bn=new K,Vn=new K,Hn=new K,Un=new K,Wn=new Wt,Gn=new Wt,Kn=new Wt,qn=class e{constructor(e=new K,t=new K,n=new K){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),Pn.subVectors(e,t),r.cross(Pn);let i=r.lengthSq();return i>0?r.multiplyScalar(1/Math.sqrt(i)):r.set(0,0,0)}static getBarycoord(e,t,n,r,i){Pn.subVectors(r,t),Fn.subVectors(n,t),In.subVectors(e,t);let a=Pn.dot(Pn),o=Pn.dot(Fn),s=Pn.dot(In),c=Fn.dot(Fn),l=Fn.dot(In),u=a*c-o*o;if(u===0)return i.set(0,0,0),null;let d=1/u,f=(c*s-o*l)*d,p=(a*l-o*s)*d;return i.set(1-f-p,p,f)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,Ln)!==null&&Ln.x>=0&&Ln.y>=0&&Ln.x+Ln.y<=1}static getInterpolation(e,t,n,r,i,a,o,s){return this.getBarycoord(e,t,n,r,Ln)===null?(s.x=0,s.y=0,`z`in s&&(s.z=0),`w`in s&&(s.w=0),null):(s.setScalar(0),s.addScaledVector(i,Ln.x),s.addScaledVector(a,Ln.y),s.addScaledVector(o,Ln.z),s)}static getInterpolatedAttribute(e,t,n,r,i,a){return Wn.setScalar(0),Gn.setScalar(0),Kn.setScalar(0),Wn.fromBufferAttribute(e,t),Gn.fromBufferAttribute(e,n),Kn.fromBufferAttribute(e,r),a.setScalar(0),a.addScaledVector(Wn,i.x),a.addScaledVector(Gn,i.y),a.addScaledVector(Kn,i.z),a}static isFrontFacing(e,t,n,r){return Pn.subVectors(n,t),Fn.subVectors(e,t),Pn.cross(Fn).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Pn.subVectors(this.c,this.b),Fn.subVectors(this.a,this.b),Pn.cross(Fn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return e.getNormal(this.a,this.b,this.c,t)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,n){return e.getBarycoord(t,this.a,this.b,this.c,n)}getInterpolation(t,n,r,i,a){return e.getInterpolation(t,this.a,this.b,this.c,n,r,i,a)}containsPoint(t){return e.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return e.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,r=this.b,i=this.c,a,o;Rn.subVectors(r,n),zn.subVectors(i,n),Vn.subVectors(e,n);let s=Rn.dot(Vn),c=zn.dot(Vn);if(s<=0&&c<=0)return t.copy(n);Hn.subVectors(e,r);let l=Rn.dot(Hn),u=zn.dot(Hn);if(l>=0&&u<=l)return t.copy(r);let d=s*u-l*c;if(d<=0&&s>=0&&l<=0)return a=s/(s-l),t.copy(n).addScaledVector(Rn,a);Un.subVectors(e,i);let f=Rn.dot(Un),p=zn.dot(Un);if(p>=0&&f<=p)return t.copy(i);let m=f*c-s*p;if(m<=0&&c>=0&&p<=0)return o=c/(c-p),t.copy(n).addScaledVector(zn,o);let h=l*p-f*u;if(h<=0&&u-l>=0&&f-p>=0)return Bn.subVectors(i,r),o=(u-l)/(u-l+(f-p)),t.copy(r).addScaledVector(Bn,o);let g=1/(h+m+d);return a=m*g,o=d*g,t.copy(n).addScaledVector(Rn,a).addScaledVector(zn,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},Jn=class{constructor(e=new K(1/0,1/0,1/0),t=new K(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Xn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Xn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=Xn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute(`position`);if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let t=0,n=r.count;t<n;t++)e.isMesh===!0?e.getVertexPosition(t,Xn):Xn.fromBufferAttribute(r,t),Xn.applyMatrix4(e.matrixWorld),this.expandByPoint(Xn);else e.boundingBox===void 0?(n.boundingBox===null&&n.computeBoundingBox(),Zn.copy(n.boundingBox)):(e.boundingBox===null&&e.computeBoundingBox(),Zn.copy(e.boundingBox)),Zn.applyMatrix4(e.matrixWorld),this.union(Zn)}let r=e.children;for(let e=0,n=r.length;e<n;e++)this.expandByObject(r[e],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Xn),Xn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(ir),ar.subVectors(this.max,ir),Qn.subVectors(e.a,ir),$n.subVectors(e.b,ir),er.subVectors(e.c,ir),tr.subVectors($n,Qn),nr.subVectors(er,$n),rr.subVectors(Qn,er);let t=[0,-tr.z,tr.y,0,-nr.z,nr.y,0,-rr.z,rr.y,tr.z,0,-tr.x,nr.z,0,-nr.x,rr.z,0,-rr.x,-tr.y,tr.x,0,-nr.y,nr.x,0,-rr.y,rr.x,0];return!cr(t,Qn,$n,er,ar)||(t=[1,0,0,0,1,0,0,0,1],!cr(t,Qn,$n,er,ar))?!1:(or.crossVectors(tr,nr),t=[or.x,or.y,or.z],cr(t,Qn,$n,er,ar))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Xn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Xn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Yn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Yn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Yn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Yn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Yn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Yn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Yn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Yn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Yn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},Yn=[new K,new K,new K,new K,new K,new K,new K,new K],Xn=new K,Zn=new Jn,Qn=new K,$n=new K,er=new K,tr=new K,nr=new K,rr=new K,ir=new K,ar=new K,or=new K,sr=new K;function cr(e,t,n,r,i){for(let a=0,o=e.length-3;a<=o;a+=3){sr.fromArray(e,a);let o=i.x*Math.abs(sr.x)+i.y*Math.abs(sr.y)+i.z*Math.abs(sr.z),s=t.dot(sr),c=n.dot(sr),l=r.dot(sr);if(Math.max(-Math.max(s,c,l),Math.min(s,c,l))>o)return!1}return!0}var lr=new K,ur=new W,dr=0,fr=class extends $e{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw TypeError(`THREE.BufferAttribute: array should be a Typed Array.`);this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:dr++}),this.name=``,this.array=e,this.itemSize=t,this.count=e===void 0?0:e.length/t,this.normalized=n,this.usage=Be,this.updateRanges=[],this.gpuType=h,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,i=this.itemSize;r<i;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)ur.fromBufferAttribute(this,t),ur.applyMatrix3(e),this.setXY(t,ur.x,ur.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)lr.fromBufferAttribute(this,t),lr.applyMatrix3(e),this.setXYZ(t,lr.x,lr.y,lr.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)lr.fromBufferAttribute(this,t),lr.applyMatrix4(e),this.setXYZ(t,lr.x,lr.y,lr.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)lr.fromBufferAttribute(this,t),lr.applyNormalMatrix(e),this.setXYZ(t,lr.x,lr.y,lr.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)lr.fromBufferAttribute(this,t),lr.transformDirection(e),this.setXYZ(t,lr.x,lr.y,lr.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=Ct(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=wt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Ct(t,this.array)),t}setX(e,t){return this.normalized&&(t=wt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Ct(t,this.array)),t}setY(e,t){return this.normalized&&(t=wt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Ct(t,this.array)),t}setZ(e,t){return this.normalized&&(t=wt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Ct(t,this.array)),t}setW(e,t){return this.normalized&&(t=wt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=wt(t,this.array),n=wt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=wt(t,this.array),n=wt(n,this.array),r=wt(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,i){return e*=this.itemSize,this.normalized&&(t=wt(t,this.array),n=wt(n,this.array),r=wt(r,this.array),i=wt(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=i,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:`dispose`})}},pr=class extends fr{constructor(e,t,n){super(new Uint16Array(e),t,n)}},mr=class extends fr{constructor(e,t,n){super(new Uint32Array(e),t,n)}},hr=class extends fr{constructor(e,t,n){super(new Float32Array(e),t,n)}},gr=new Jn,_r=new K,vr=new K,yr=class{constructor(e=new K,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t===void 0?gr.setFromPoints(e).getCenter(n):n.copy(t);let r=0;for(let t=0,i=e.length;t<i;t++)r=Math.max(r,n.distanceToSquared(e[t]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius*=e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;_r.subVectors(e,this.center);let t=_r.lengthSq();if(t>this.radius*this.radius){let e=Math.sqrt(t),n=(e-this.radius)*.5;this.center.addScaledVector(_r,n/e),this.radius+=n}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(vr.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(_r.copy(e.center).add(vr)),this.expandByPoint(_r.copy(e.center).sub(vr))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},br=0,xr=new Yt,Sr=new Cn,Cr=new K,wr=new Jn,Tr=new Jn,Er=new K,Dr=class e extends $e{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:br++}),this.uuid=it(),this.name=``,this.type=`BufferGeometry`,this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return this.index=Array.isArray(e)?new(Ue(e)?mr:pr)(e,1):e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let t=new Ot().getNormalMatrix(e);n.applyNormalMatrix(t),n.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return xr.makeRotationFromQuaternion(e),this.applyMatrix4(xr),this}rotateX(e){return xr.makeRotationX(e),this.applyMatrix4(xr),this}rotateY(e){return xr.makeRotationY(e),this.applyMatrix4(xr),this}rotateZ(e){return xr.makeRotationZ(e),this.applyMatrix4(xr),this}translate(e,t,n){return xr.makeTranslation(e,t,n),this.applyMatrix4(xr),this}scale(e,t,n){return xr.makeScale(e,t,n),this.applyMatrix4(xr),this}lookAt(e){return Sr.lookAt(e),Sr.updateMatrix(),this.applyMatrix4(Sr.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Cr).negate(),this.translate(Cr.x,Cr.y,Cr.z),this}setFromPoints(e){let t=this.getAttribute(`position`);if(t===void 0){let t=[];for(let n=0,r=e.length;n<r;n++){let r=e[n];t.push(r.x,r.y,r.z||0)}this.setAttribute(`position`,new hr(t,3))}else{let n=Math.min(e.length,t.count);for(let r=0;r<n;r++){let n=e[r];t.setXYZ(r,n.x,n.y,n.z||0)}e.length>t.count&&V(`BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.`),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Jn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){H(`BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.`,this),this.boundingBox.set(new K(-1/0,-1/0,-1/0),new K(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];wr.setFromBufferAttribute(n),this.morphTargetsRelative?(Er.addVectors(this.boundingBox.min,wr.min),this.boundingBox.expandByPoint(Er),Er.addVectors(this.boundingBox.max,wr.max),this.boundingBox.expandByPoint(Er)):(this.boundingBox.expandByPoint(wr.min),this.boundingBox.expandByPoint(wr.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&H(`BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.`,this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new yr);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){H(`BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.`,this),this.boundingSphere.set(new K,1/0);return}if(e){let n=this.boundingSphere.center;if(wr.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];Tr.setFromBufferAttribute(n),this.morphTargetsRelative?(Er.addVectors(wr.min,Tr.min),wr.expandByPoint(Er),Er.addVectors(wr.max,Tr.max),wr.expandByPoint(Er)):(wr.expandByPoint(Tr.min),wr.expandByPoint(Tr.max))}wr.getCenter(n);let r=0;for(let t=0,i=e.count;t<i;t++)Er.fromBufferAttribute(e,t),r=Math.max(r,n.distanceToSquared(Er));if(t)for(let i=0,a=t.length;i<a;i++){let a=t[i],o=this.morphTargetsRelative;for(let t=0,i=a.count;t<i;t++)Er.fromBufferAttribute(a,t),o&&(Cr.fromBufferAttribute(e,t),Er.add(Cr)),r=Math.max(r,n.distanceToSquared(Er))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&H(`BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.`,this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){H(`BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)`);return}let n=t.position,r=t.normal,i=t.uv,a=this.getAttribute(`tangent`);(a===void 0||a.count!==n.count)&&(a=new fr(new Float32Array(4*n.count),4),this.setAttribute(`tangent`,a));let o=[],s=[];for(let e=0;e<n.count;e++)o[e]=new K,s[e]=new K;let c=new K,l=new K,u=new K,d=new W,f=new W,p=new W,m=new K,h=new K;function g(e,t,r){c.fromBufferAttribute(n,e),l.fromBufferAttribute(n,t),u.fromBufferAttribute(n,r),d.fromBufferAttribute(i,e),f.fromBufferAttribute(i,t),p.fromBufferAttribute(i,r),l.sub(c),u.sub(c),f.sub(d),p.sub(d);let a=1/(f.x*p.y-p.x*f.y);isFinite(a)&&(m.copy(l).multiplyScalar(p.y).addScaledVector(u,-f.y).multiplyScalar(a),h.copy(u).multiplyScalar(f.x).addScaledVector(l,-p.x).multiplyScalar(a),o[e].add(m),o[t].add(m),o[r].add(m),s[e].add(h),s[t].add(h),s[r].add(h))}let _=this.groups;_.length===0&&(_=[{start:0,count:e.count}]);for(let t=0,n=_.length;t<n;++t){let n=_[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)g(e.getX(t+0),e.getX(t+1),e.getX(t+2))}let v=new K,y=new K,b=new K,x=new K;function S(e){b.fromBufferAttribute(r,e),x.copy(b);let t=o[e];v.copy(t),v.sub(b.multiplyScalar(b.dot(t))).normalize(),y.crossVectors(x,t);let n=y.dot(s[e])<0?-1:1;a.setXYZW(e,v.x,v.y,v.z,n)}for(let t=0,n=_.length;t<n;++t){let n=_[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)S(e.getX(t+0)),S(e.getX(t+1)),S(e.getX(t+2))}this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute(`position`);if(t!==void 0){let n=this.getAttribute(`normal`);if(n===void 0||n.count!==t.count)n=new fr(new Float32Array(t.count*3),3),this.setAttribute(`normal`,n);else for(let e=0,t=n.count;e<t;e++)n.setXYZ(e,0,0,0);let r=new K,i=new K,a=new K,o=new K,s=new K,c=new K,l=new K,u=new K;if(e)for(let d=0,f=e.count;d<f;d+=3){let f=e.getX(d+0),p=e.getX(d+1),m=e.getX(d+2);r.fromBufferAttribute(t,f),i.fromBufferAttribute(t,p),a.fromBufferAttribute(t,m),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),o.fromBufferAttribute(n,f),s.fromBufferAttribute(n,p),c.fromBufferAttribute(n,m),o.add(l),s.add(l),c.add(l),n.setXYZ(f,o.x,o.y,o.z),n.setXYZ(p,s.x,s.y,s.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let e=0,o=t.count;e<o;e+=3)r.fromBufferAttribute(t,e+0),i.fromBufferAttribute(t,e+1),a.fromBufferAttribute(t,e+2),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),n.setXYZ(e+0,l.x,l.y,l.z),n.setXYZ(e+1,l.x,l.y,l.z),n.setXYZ(e+2,l.x,l.y,l.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Er.fromBufferAttribute(e,t),Er.normalize(),e.setXYZ(t,Er.x,Er.y,Er.z)}toNonIndexed(){function t(e,t){let n=e.array,r=e.itemSize,i=e.normalized,a=new n.constructor(t.length*r),o=0,s=0;for(let i=0,c=t.length;i<c;i++){o=e.isInterleavedBufferAttribute?t[i]*e.data.stride+e.offset:t[i]*r;for(let e=0;e<r;e++)a[s++]=n[o++]}return new fr(a,r,i)}if(this.index===null)return V(`BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed.`),this;let n=new e,r=this.index.array,i=this.attributes;for(let e in i){let a=i[e],o=t(a,r);n.setAttribute(e,o)}let a=this.morphAttributes;for(let e in a){let i=[],o=a[e];for(let e=0,n=o.length;e<n;e++){let n=o[e],a=t(n,r);i.push(a)}n.morphAttributes[e]=i}n.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let e=0,t=o.length;e<t;e++){let t=o[e];n.addGroup(t.start,t.count,t.materialIndex)}return n}toJSON(){let e={metadata:{version:4.7,type:`BufferGeometry`,generator:`BufferGeometry.toJSON`}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?`BufferGeometry`:this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let t=this.parameters;for(let n in t)t[n]!==void 0&&(e[n]=t[n]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let t in n){let r=n[t];e.data.attributes[t]=r.toJSON(e.data)}let r={},i=!1;for(let t in this.morphAttributes){let n=this.morphAttributes[t],a=[];for(let t=0,r=n.length;t<r;t++){let r=n[t];a.push(r.toJSON(e.data))}a.length>0&&(r[t]=a,i=!0)}i&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let r=e.attributes;for(let e in r){let n=r[e];this.setAttribute(e,n.clone(t))}let i=e.morphAttributes;for(let e in i){let n=[],r=i[e];for(let e=0,i=r.length;e<i;e++)n.push(r[e].clone(t));this.morphAttributes[e]=n}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let e=0,t=a.length;e<t;e++){let t=a[e];this.addGroup(t.start,t.count,t.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let s=e.boundingSphere;return s!==null&&(this.boundingSphere=s.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:`dispose`})}},Or=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e===void 0?0:e.length/t,this.usage=Be,this.updateRanges=[],this.version=0,this.uuid=it()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let r=0,i=this.stride;r<i;r++)this.array[e+r]=t.array[n+r];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=it()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=it()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer)));let t={uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride};return t.usage=this.usage,t}},kr=new K,Ar=class e{constructor(e,t,n,r=!1){this.isInterleavedBufferAttribute=!0,this.name=``,this.data=e,this.itemSize=t,this.offset=n,this.normalized=r}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)kr.fromBufferAttribute(this,t),kr.applyMatrix4(e),this.setXYZ(t,kr.x,kr.y,kr.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)kr.fromBufferAttribute(this,t),kr.applyNormalMatrix(e),this.setXYZ(t,kr.x,kr.y,kr.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)kr.fromBufferAttribute(this,t),kr.transformDirection(e),this.setXYZ(t,kr.x,kr.y,kr.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=Ct(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=wt(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=wt(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=wt(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=wt(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=wt(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=Ct(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=Ct(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=Ct(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=Ct(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=wt(t,this.array),n=wt(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=wt(t,this.array),n=wt(n,this.array),r=wt(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this}setXYZW(e,t,n,r,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=wt(t,this.array),n=wt(n,this.array),r=wt(r,this.array),i=wt(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this.data.array[e+3]=i,this}clone(t){if(t===void 0){Je(`InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.`);let e=[];for(let t=0;t<this.count;t++){let n=t*this.data.stride+this.offset;for(let t=0;t<this.itemSize;t++)e.push(this.data.array[n+t])}return new fr(new this.array.constructor(e),this.itemSize,this.normalized)}return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new e(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){Je(`InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.`);let e=[];for(let t=0;t<this.count;t++){let n=t*this.data.stride+this.offset;for(let t=0;t<this.itemSize;t++)e.push(this.data.array[n+t])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},jr=new K,Mr=new K,Nr=new Ot,Pr=class{constructor(e=new K(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let r=jr.subVectors(n,t).cross(Mr.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let r=e.delta(jr),i=this.normal.dot(r);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let a=-(e.start.dot(this.normal)+this.constant)/i;return n===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(r,a)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||Nr.getNormalMatrix(e),r=this.coplanarPoint(jr).applyMatrix4(e),i=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(i),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},Fr=0,Ir=class extends $e{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Fr++}),this.uuid=it(),this.name=``,this.type=`Material`,this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new q(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=ze,this.stencilZFail=ze,this.stencilZPass=ze,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){V(`Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){V(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(n):r&&r.isVector2&&n&&n.isVector2||r&&r.isEuler&&n&&n.isEuler||r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:`Material`,generator:`Material.toJSON`}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(e=>e.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}if(t){let t=r(e.textures),i=r(e.images);t.length>0&&(n.textures=t),i.length>0&&(n.images=i)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new q().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(e=>new Pr().fromJSON(e))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(this.vertexColors=typeof e.vertexColors==`number`?e.vertexColors>0:e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let t=e.normalScale;Array.isArray(t)===!1&&(t=[t,t]),this.normalScale=new W().fromArray(t)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new W().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let e=t.length;n=Array(e);for(let r=0;r!==e;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:`dispose`})}set needsUpdate(e){e===!0&&this.version++}},Lr=class extends Ir{constructor(e){super(),this.isSpriteMaterial=!0,this.type=`SpriteMaterial`,this.color=new q(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},Rr,zr=new K,Br=new K,Vr=new K,Hr=new W,Ur=new W,Wr=new Yt,Gr=new K,Kr=new K,qr=new K,Jr=new W,Yr=new W,Xr=new W,Zr=class extends Cn{constructor(e=new Lr){if(super(),this.isSprite=!0,this.type=`Sprite`,Rr===void 0){Rr=new Dr;let e=new Or(new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),5);Rr.setIndex([0,1,2,0,2,3]),Rr.setAttribute(`position`,new Ar(e,3,0,!1)),Rr.setAttribute(`uv`,new Ar(e,2,3,!1))}this.geometry=Rr,this.material=e,this.center=new W(.5,.5),this.count=1}intersectsFrustum(e){return e.intersectsSprite(this)}raycast(e,t){e.camera===null&&H(`Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.`),Br.setFromMatrixScale(this.matrixWorld),Wr.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),Vr.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Br.multiplyScalar(-Vr.z);let n=this.material.rotation,r,i;n!==0&&(i=Math.cos(n),r=Math.sin(n));let a=this.center;Qr(Gr.set(-.5,-.5,0),Vr,a,Br,r,i),Qr(Kr.set(.5,-.5,0),Vr,a,Br,r,i),Qr(qr.set(.5,.5,0),Vr,a,Br,r,i),Jr.set(0,0),Yr.set(1,0),Xr.set(1,1);let o=e.ray.intersectTriangle(Gr,Kr,qr,!1,zr);if(o===null&&(Qr(Kr.set(-.5,.5,0),Vr,a,Br,r,i),Yr.set(0,1),o=e.ray.intersectTriangle(Gr,qr,Kr,!1,zr),o===null))return;let s=e.ray.origin.distanceTo(zr);s<e.near||s>e.far||t.push({distance:s,point:zr.clone(),uv:qn.getInterpolation(zr,Gr,Kr,qr,Jr,Yr,Xr,new W),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}};function Qr(e,t,n,r,i,a){Hr.subVectors(e,n).addScalar(.5).multiply(r),i===void 0?Ur.copy(Hr):(Ur.x=a*Hr.x-i*Hr.y,Ur.y=i*Hr.x+a*Hr.y),e.copy(t),e.x+=Ur.x,e.y+=Ur.y,e.applyMatrix4(Wr)}var $r=new K,ei=new K,ti=new K,ni=new K,ri=class{constructor(e=new K,t=new K(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,$r)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=$r.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):($r.copy(this.origin).addScaledVector(this.direction,t),$r.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){ei.copy(e).add(t).multiplyScalar(.5),ti.copy(t).sub(e).normalize(),ni.copy(this.origin).sub(ei);let i=e.distanceTo(t)*.5,a=-this.direction.dot(ti),o=ni.dot(this.direction),s=-ni.dot(ti),c=ni.lengthSq(),l=Math.abs(1-a*a),u,d,f,p;if(l>0){if(u=a*s-o,d=a*o-s,p=i*l,u>=0){if(d>=-p){if(d<=p){let e=1/l;u*=e,d*=e,f=u*(u+a*d+2*o)+d*(a*u+d+2*s)+c}else d=i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d=-i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d<=-p?(u=Math.max(0,-(-a*i+o)),d=u>0?-i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c):d<=p?(u=0,d=Math.min(Math.max(-i,-s),i),f=d*(d+2*s)+c):(u=Math.max(0,-(a*i+o)),d=u>0?i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c)}else d=a>0?-i:i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),r&&r.copy(ei).addScaledVector(ti,d),f}intersectSphere(e,t){if(e.radius<0)return null;$r.subVectors(e.center,this.origin);let n=$r.dot(this.direction),r=$r.dot($r)-n*n,i=e.radius*e.radius;if(r>i)return null;let a=Math.sqrt(i-r),o=n-a,s=n+a;return s<0?null:o<0?this.at(s,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,i,a,o,s,c=1/this.direction.x,l=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,r=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,r=(e.min.x-d.x)*c),l>=0?(i=(e.min.y-d.y)*l,a=(e.max.y-d.y)*l):(i=(e.max.y-d.y)*l,a=(e.min.y-d.y)*l),n>a||i>r||((i>n||isNaN(n))&&(n=i),(a<r||isNaN(r))&&(r=a),u>=0?(o=(e.min.z-d.z)*u,s=(e.max.z-d.z)*u):(o=(e.max.z-d.z)*u,s=(e.min.z-d.z)*u),n>s||o>r)||((o>n||n!==n)&&(n=o),(s<r||r!==r)&&(r=s),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,$r)!==null}intersectTriangle(e,t,n,r,i){let a=this.origin,o=this.direction,s=o.x,c=o.y,l=o.z,u=e.x-a.x,d=e.y-a.y,f=e.z-a.z,p=t.x-a.x,m=t.y-a.y,h=t.z-a.z,g=n.x-a.x,_=n.y-a.y,v=n.z-a.z,y=Math.abs(s),b=Math.abs(c),x=Math.abs(l),S,C,w,T,E,D,O,k,A,j,M,ee;if(y>=b&&y>=x?(w=s,D=u,A=p,ee=g,s>=0?(S=c,C=l,T=d,E=f,O=m,k=h,j=_,M=v):(S=l,C=c,T=f,E=d,O=h,k=m,j=v,M=_)):b>=x?(w=c,D=d,A=m,ee=_,c>=0?(S=l,C=s,T=f,E=u,O=h,k=p,j=v,M=g):(S=s,C=l,T=u,E=f,O=p,k=h,j=g,M=v)):(w=l,D=f,A=h,ee=v,l>=0?(S=s,C=c,T=u,E=d,O=p,k=m,j=g,M=_):(S=c,C=s,T=d,E=u,O=m,k=p,j=_,M=g)),w===0)return null;let N=S/w,te=C/w,P=1/w,ne=T-N*D,F=E-te*D,re=O-N*A,ie=k-te*A,I=j-N*ee,ae=M-te*ee,oe=I*ie-ae*re,L=ne*ae-F*I,se=re*F-ie*ne;if(r){if(oe<0||L<0||se<0)return null}else if((oe<0||L<0||se<0)&&(oe>0||L>0||se>0))return null;let ce=oe+L+se;if(ce===0)return null;let le=P*(oe*D+L*A+se*ee);return(ce>0?le<0:le>0)?null:this.at(le/ce,i)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},ii=class extends Ir{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type=`MeshBasicMaterial`,this.color=new q(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new on,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},ai=new Yt,oi=new ri,si=new yr,ci=new K,li=new K,ui=new K,di=new K,fi=new K,pi=new K,mi=new K,hi=new K,J=class extends Cn{constructor(e=new Dr,t=new ii){super(),this.isMesh=!0,this.type=`Mesh`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}getVertexPosition(e,t){let n=this.geometry,r=n.attributes.position,i=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(r,e);let o=this.morphTargetInfluences;if(i&&o){pi.set(0,0,0);for(let n=0,r=i.length;n<r;n++){let r=o[n],s=i[n];r!==0&&(fi.fromBufferAttribute(s,e),a?pi.addScaledVector(fi,r):pi.addScaledVector(fi.sub(t),r))}t.add(pi)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,r=this.material,i=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),si.copy(n.boundingSphere),si.applyMatrix4(i),oi.copy(e.ray).recast(e.near),!(si.containsPoint(oi.origin)===!1&&(oi.intersectSphere(si,ci)===null||oi.origin.distanceToSquared(ci)>(e.far-e.near)**2))&&(ai.copy(i).invert(),oi.copy(e.ray).applyMatrix4(ai),(n.boundingBox===null||oi.intersectsBox(n.boundingBox)!==!1)&&this._computeIntersections(e,t,oi)))}_computeIntersections(e,t,n){let r,i=this.geometry,a=this.material,o=i.index,s=i.attributes.position,c=i.attributes.uv,l=i.attributes.uv1,u=i.attributes.normal,d=i.groups,f=i.drawRange;if(o!==null){if(Array.isArray(a))for(let i=0,s=d.length;i<s;i++){let s=d[i],p=a[s.materialIndex],m=Math.max(s.start,f.start),h=Math.min(o.count,Math.min(s.start+s.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=o.getX(i),d=o.getX(i+1),f=o.getX(i+2);r=_i(this,p,e,n,c,l,u,a,d,f),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=s.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),s=Math.min(o.count,f.start+f.count);for(let d=i,f=s;d<f;d+=3){let i=o.getX(d),s=o.getX(d+1),f=o.getX(d+2);r=_i(this,a,e,n,c,l,u,i,s,f),r&&(r.faceIndex=Math.floor(d/3),t.push(r))}}}else if(s!==void 0){if(Array.isArray(a))for(let i=0,o=d.length;i<o;i++){let o=d[i],p=a[o.materialIndex],m=Math.max(o.start,f.start),h=Math.min(s.count,Math.min(o.start+o.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=i,s=i+1,d=i+2;r=_i(this,p,e,n,c,l,u,a,s,d),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=o.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),o=Math.min(s.count,f.start+f.count);for(let s=i,d=o;s<d;s+=3){let i=s,o=s+1,d=s+2;r=_i(this,a,e,n,c,l,u,i,o,d),r&&(r.faceIndex=Math.floor(s/3),t.push(r))}}}}};function gi(e,t,n,r,i,a,o,s){let c;if(c=t.side===1?r.intersectTriangle(o,a,i,!0,s):r.intersectTriangle(i,a,o,t.side===0,s),c===null)return null;hi.copy(s),hi.applyMatrix4(e.matrixWorld);let l=n.ray.origin.distanceTo(hi);return l<n.near||l>n.far?null:{distance:l,point:hi.clone(),object:e}}function _i(e,t,n,r,i,a,o,s,c,l){e.getVertexPosition(s,li),e.getVertexPosition(c,ui),e.getVertexPosition(l,di);let u=gi(e,t,n,r,li,ui,di,mi);if(u){let e=new K;qn.getBarycoord(mi,li,ui,di,e),i&&(u.uv=qn.getInterpolatedAttribute(i,s,c,l,e,new W)),a&&(u.uv1=qn.getInterpolatedAttribute(a,s,c,l,e,new W)),o&&(u.normal=qn.getInterpolatedAttribute(o,s,c,l,e,new K),u.normal.dot(r.direction)>0&&u.normal.multiplyScalar(-1));let t={a:s,b:c,c:l,normal:new K,materialIndex:0};qn.getNormal(li,ui,di,t.normal),u.face=t,u.barycoord=e}return u}var vi=class extends Ut{constructor(e=null,t=1,n=1,i,a,o,s,c,l=r,u=r,d,f){super(null,o,s,c,l,u,i,a,d,f),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},yi=class extends fr{constructor(e,t,n,r=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},bi=new Yt,xi=new Yt,Si=[],Ci=new Jn,wi=new Yt,Ti=new J,Ei=new yr,Di=class extends J{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new yi(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let e=0;e<n;e++)this.setMatrixAt(e,wi)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Jn),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,bi),Ci.copy(e.boundingBox).applyMatrix4(bi),this.boundingBox.union(Ci)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new yr),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,bi),Ei.copy(e.boundingSphere).applyMatrix4(bi),this.boundingSphere.union(Ei)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,r=this.morphTexture.source.data.data,i=e*(n.length+1)+1;for(let e=0;e<n.length;e++)n[e]=r[i+e]}raycast(e,t){let n=this.matrixWorld,r=this.count;if(Ti.geometry=this.geometry,Ti.material=this.material,Ti.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Ei.copy(this.boundingSphere),Ei.applyMatrix4(n),e.ray.intersectsSphere(Ei)!==!1))for(let i=0;i<r;i++){this.getMatrixAt(i,bi),xi.multiplyMatrices(n,bi),Ti.matrixWorld=xi,Ti.raycast(e,Si);for(let e=0,n=Si.length;e<n;e++){let n=Si[e];n.instanceId=i,n.object=this,t.push(n)}Si.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new yi(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){let n=t.morphTargetInfluences,r=n.length+1;this.morphTexture===null&&(this.morphTexture=new vi(new Float32Array(r*this.count),r,this.count,D,h));let i=this.morphTexture.source.data.data,a=0;for(let e=0;e<n.length;e++)a+=n[e];let o=this.geometry.morphTargetsRelative?1:1-a,s=r*e;return i[s]=o,i.set(n,s+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},Oi=new yr,ki=new W(.5,.5),Ai=new K,ji=class{constructor(e=new Pr,t=new Pr,n=new Pr,r=new Pr,i=new Pr,a=new Pr){this.planes=[e,t,n,r,i,a]}set(e,t,n,r,i,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(r),o[4].copy(i),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=He,n=!1){let r=this.planes,i=e.elements,a=i[0],o=i[1],s=i[2],c=i[3],l=i[4],u=i[5],d=i[6],f=i[7],p=i[8],m=i[9],h=i[10],g=i[11],_=i[12],v=i[13],y=i[14],b=i[15];if(r[0].setComponents(c-a,f-l,g-p,b-_).normalize(),r[1].setComponents(c+a,f+l,g+p,b+_).normalize(),r[2].setComponents(c+o,f+u,g+m,b+v).normalize(),r[3].setComponents(c-o,f-u,g-m,b-v).normalize(),n)r[4].setComponents(s,d,h,y).normalize(),r[5].setComponents(c-s,f-d,g-h,b-y).normalize();else if(r[4].setComponents(c-s,f-d,g-h,b-y).normalize(),t===2e3)r[5].setComponents(c+s,f+d,g+h,b+y).normalize();else if(t===2001)r[5].setComponents(s,d,h,y).normalize();else throw Error(`THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: `+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Oi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Oi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Oi)}intersectsSprite(e){return Oi.center.set(0,0,0),Oi.radius=.7071067811865476+ki.distanceTo(e.center),Oi.applyMatrix4(e.matrixWorld),this.intersectsSphere(Oi)}intersectsSphere(e){let t=this.planes,n=e.center,r=-e.radius;for(let e=0;e<6;e++)if(t[e].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let r=t[n];if(Ai.x=r.normal.x>0?e.max.x:e.min.x,Ai.y=r.normal.y>0?e.max.y:e.min.y,Ai.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(Ai)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},Mi=class extends Ir{constructor(e){super(),this.isLineBasicMaterial=!0,this.type=`LineBasicMaterial`,this.color=new q(16777215),this.map=null,this.linewidth=1,this.linecap=`round`,this.linejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},Ni=new K,Pi=new K,Fi=new Yt,Ii=new ri,Li=new yr,Ri=new K,zi=new K,Bi=class extends Cn{constructor(e=new Dr,t=new Mi){super(),this.isLine=!0,this.type=`Line`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let e=1,r=t.count;e<r;e++)Ni.fromBufferAttribute(t,e-1),Pi.fromBufferAttribute(t,e),n[e]=n[e-1],n[e]+=Ni.distanceTo(Pi);e.setAttribute(`lineDistance`,new hr(n,1))}else V(`Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.`);return this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,r=this.matrixWorld,i=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Li.copy(n.boundingSphere),Li.applyMatrix4(r),Li.radius+=i,e.ray.intersectsSphere(Li)===!1)return;Fi.copy(r).invert(),Ii.copy(e.ray).applyMatrix4(Fi);let o=i/((this.scale.x+this.scale.y+this.scale.z)/3),s=o*o,c=this.isLineSegments?2:1,l=n.index,u=n.attributes.position;if(l!==null){let n=Math.max(0,a.start),r=Math.min(l.count,a.start+a.count);for(let i=n,a=r-1;i<a;i+=c){let n=l.getX(i),r=l.getX(i+1),a=Vi(this,e,Ii,s,n,r,i);a&&t.push(a)}if(this.isLineLoop){let i=l.getX(r-1),a=l.getX(n),o=Vi(this,e,Ii,s,i,a,r-1);o&&t.push(o)}}else{let n=Math.max(0,a.start),r=Math.min(u.count,a.start+a.count);for(let i=n,a=r-1;i<a;i+=c){let n=Vi(this,e,Ii,s,i,i+1,i);n&&t.push(n)}if(this.isLineLoop){let i=Vi(this,e,Ii,s,r-1,n,r-1);i&&t.push(i)}}}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}};function Vi(e,t,n,r,i,a,o){let s=e.geometry.attributes.position;if(Ni.fromBufferAttribute(s,i),Pi.fromBufferAttribute(s,a),n.distanceSqToSegment(Ni,Pi,Ri,zi)>r)return;Ri.applyMatrix4(e.matrixWorld);let c=t.ray.origin.distanceTo(Ri);if(!(c<t.near||c>t.far))return{distance:c,point:zi.clone().applyMatrix4(e.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:e}}var Hi=new K,Ui=new K,Wi=class extends Bi{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type=`LineSegments`}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let e=0,r=t.count;e<r;e+=2)Hi.fromBufferAttribute(t,e),Ui.fromBufferAttribute(t,e+1),n[e]=e===0?0:n[e-1],n[e+1]=n[e]+Hi.distanceTo(Ui);e.setAttribute(`lineDistance`,new hr(n,1))}else V(`LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.`);return this}},Gi=class extends Ut{constructor(e,t,n,r,i,a,o,s,c,l,u,d){super(null,a,o,s,c,l,r,i,u,d),this.isCompressedTexture=!0,this.image={width:t,height:n},this.mipmaps=e,this.flipY=!1,this.generateMipmaps=!1}},Ki=class extends Ut{constructor(e=[],t=301,n,r,i,a,o,s,c,l){super(e,t,n,r,i,a,o,s,c,l),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},qi=class extends Ut{constructor(e,t,n,r,i,a,o,s,c){super(e,t,n,r,i,a,o,s,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},Ji=class extends Ut{constructor(e,t,n=m,i,a,o,s=r,c=r,l,u=T,d=1){if(u!==1026&&u!==1027)throw Error(`THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat`);super({width:e,height:t,depth:d},i,a,o,s,c,u,n,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new zt(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},Yi=class extends Ji{constructor(e,t=m,n=301,i,a,o=r,s=r,c,l=T){let u={width:e,height:e,depth:1},d=[u,u,u,u,u,u];super(e,e,t,n,i,a,o,s,c,l),this.image=d,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},Xi=class extends Ut{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},Zi=class e extends Dr{constructor(e=1,t=1,n=1,r=1,i=1,a=1){super(),this.type=`BoxGeometry`,this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:i,depthSegments:a};let o=this;r=Math.floor(r),i=Math.floor(i),a=Math.floor(a);let s=[],c=[],l=[],u=[],d=0,f=0;p(`z`,`y`,`x`,-1,-1,n,t,e,a,i,0),p(`z`,`y`,`x`,1,-1,n,t,-e,a,i,1),p(`x`,`z`,`y`,1,1,e,n,t,r,a,2),p(`x`,`z`,`y`,1,-1,e,n,-t,r,a,3),p(`x`,`y`,`z`,1,-1,e,t,n,r,i,4),p(`x`,`y`,`z`,-1,-1,e,t,-n,r,i,5),this.setIndex(s),this.setAttribute(`position`,new hr(c,3)),this.setAttribute(`normal`,new hr(l,3)),this.setAttribute(`uv`,new hr(u,2));function p(e,t,n,r,i,a,p,m,h,g,_){let v=a/h,y=p/g,b=a/2,x=p/2,S=m/2,C=h+1,w=g+1,T=0,E=0,D=new K;for(let a=0;a<w;a++){let o=a*y-x;for(let s=0;s<C;s++)D[e]=(s*v-b)*r,D[t]=o*i,D[n]=S,c.push(D.x,D.y,D.z),D[e]=0,D[t]=0,D[n]=m>0?1:-1,l.push(D.x,D.y,D.z),u.push(s/h),u.push(1-a/g),T+=1}for(let e=0;e<g;e++)for(let t=0;t<h;t++){let n=d+t+C*e,r=d+t+C*(e+1),i=d+(t+1)+C*(e+1),a=d+(t+1)+C*e;s.push(n,r,a),s.push(r,i,a),E+=6}o.addGroup(f,E,_),f+=E,d+=T}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}},Qi=class e extends Dr{constructor(e=1,t=1,n=4,r=8,i=1){super(),this.type=`CapsuleGeometry`,this.parameters={radius:e,height:t,capSegments:n,radialSegments:r,heightSegments:i},t=Math.max(0,t),n=Math.max(1,Math.floor(n)),r=Math.max(3,Math.floor(r)),i=Math.max(1,Math.floor(i));let a=[],o=[],s=[],c=[],l=t/2,u=Math.PI/2*e,d=t,f=2*u+d,p=n*2+i,m=r+1,h=new K,g=new K;for(let _=0;_<=p;_++){let v=0,y=0,b=0,x=0;if(_<=n){let t=_/n,r=t*Math.PI/2;y=-l-e*Math.cos(r),b=e*Math.sin(r),x=-e*Math.cos(r),v=t*u}else if(_<=n+i){let r=(_-n)/i;y=-l+r*t,b=e,x=0,v=u+r*d}else{let t=(_-n-i)/n,r=t*Math.PI/2;y=l+e*Math.sin(r),b=e*Math.cos(r),x=e*Math.sin(r),v=u+d+t*u}let S=Math.max(0,Math.min(1,v/f)),C=0;_===0?C=.5/r:_===p&&(C=-.5/r);for(let e=0;e<=r;e++){let t=e/r,n=t*Math.PI*2,i=Math.sin(n),a=Math.cos(n);g.x=-b*a,g.y=y,g.z=b*i,o.push(g.x,g.y,g.z),h.set(-b*a,x,b*i),h.normalize(),s.push(h.x,h.y,h.z),c.push(t+C,S)}if(_>0){let e=(_-1)*m;for(let t=0;t<r;t++){let n=e+t,r=e+t+1,i=_*m+t,o=_*m+t+1;a.push(n,r,i),a.push(r,o,i)}}}this.setIndex(a),this.setAttribute(`position`,new hr(o,3)),this.setAttribute(`normal`,new hr(s,3)),this.setAttribute(`uv`,new hr(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.height,t.capSegments,t.radialSegments,t.heightSegments)}},$i=class e extends Dr{constructor(e=1,t=32,n=0,r=Math.PI*2){super(),this.type=`CircleGeometry`,this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:r},t=Math.max(3,t);let i=[],a=[],o=[],s=[],c=new K,l=new W;a.push(0,0,0),o.push(0,0,1),s.push(.5,.5);for(let i=0,u=3;i<=t;i++,u+=3){let d=n+i/t*r;c.x=e*Math.cos(d),c.y=e*Math.sin(d),a.push(c.x,c.y,c.z),o.push(0,0,1),l.x=(a[u]/e+1)/2,l.y=(a[u+1]/e+1)/2,s.push(l.x,l.y)}for(let e=1;e<=t;e++)i.push(e,e+1,0);this.setIndex(i),this.setAttribute(`position`,new hr(a,3)),this.setAttribute(`normal`,new hr(o,3)),this.setAttribute(`uv`,new hr(s,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.segments,t.thetaStart,t.thetaLength)}},ea=class e extends Dr{constructor(e=1,t=1,n=1,r=32,i=1,a=!1,o=0,s=Math.PI*2){super(),this.type=`CylinderGeometry`,this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:r,heightSegments:i,openEnded:a,thetaStart:o,thetaLength:s};let c=this;r=Math.floor(r),i=Math.floor(i);let l=[],u=[],d=[],f=[],p=0,m=[],h=n/2,g=0;_(),a===!1&&(e>0&&v(!0),t>0&&v(!1)),this.setIndex(l),this.setAttribute(`position`,new hr(u,3)),this.setAttribute(`normal`,new hr(d,3)),this.setAttribute(`uv`,new hr(f,2));function _(){let a=new K,_=new K,v=0,y=(t-e)/n;for(let c=0;c<=i;c++){let l=[],g=c/i,v=g*(t-e)+e;for(let e=0;e<=r;e++){let t=e/r,i=t*s+o,c=Math.sin(i),m=Math.cos(i);_.x=v*c,_.y=-g*n+h,_.z=v*m,u.push(_.x,_.y,_.z),a.set(c,y,m).normalize(),d.push(a.x,a.y,a.z),f.push(t,1-g),l.push(p++)}m.push(l)}for(let n=0;n<r;n++)for(let r=0;r<i;r++){let a=m[r][n],o=m[r+1][n],s=m[r+1][n+1],c=m[r][n+1];(e>0||r!==0)&&(l.push(a,o,c),v+=3),(t>0||r!==i-1)&&(l.push(o,s,c),v+=3)}c.addGroup(g,v,0),g+=v}function v(n){let i=p,a=new W,m=new K,_=0,v=n===!0?e:t,y=n===!0?1:-1;for(let e=1;e<=r;e++)u.push(0,h*y,0),d.push(0,y,0),f.push(.5,.5),p++;let b=p;for(let e=0;e<=r;e++){let t=e/r*s+o,n=Math.cos(t),i=Math.sin(t);m.x=v*i,m.y=h*y,m.z=v*n,u.push(m.x,m.y,m.z),d.push(0,y,0),a.x=n*.5+.5,a.y=i*.5*y+.5,f.push(a.x,a.y),p++}for(let e=0;e<r;e++){let t=i+e,r=b+e;n===!0?l.push(r,r+1,t):l.push(r+1,r,t),_+=3}c.addGroup(g,_,n===!0?1:2),g+=_}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},ta=class e extends ea{constructor(e=1,t=1,n=32,r=1,i=!1,a=0,o=Math.PI*2){super(0,e,t,n,r,i,a,o),this.type=`ConeGeometry`,this.parameters={radius:e,height:t,radialSegments:n,heightSegments:r,openEnded:i,thetaStart:a,thetaLength:o}}static fromJSON(t){return new e(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},na=class e extends Dr{constructor(e=[],t=[],n=1,r=0){super(),this.type=`PolyhedronGeometry`,this.parameters={vertices:e,indices:t,radius:n,detail:r};let i=[],a=[];o(r),c(n),l(),this.setAttribute(`position`,new hr(i,3)),this.setAttribute(`normal`,new hr(i.slice(),3)),this.setAttribute(`uv`,new hr(a,2)),r===0?this.computeVertexNormals():this.normalizeNormals();function o(e){let n=new K,r=new K,i=new K;for(let a=0;a<t.length;a+=3)f(t[a+0],n),f(t[a+1],r),f(t[a+2],i),s(n,r,i,e)}function s(e,t,n,r){let i=r+1,a=[];for(let r=0;r<=i;r++){a[r]=[];let o=e.clone().lerp(n,r/i),s=t.clone().lerp(n,r/i),c=i-r;for(let e=0;e<=c;e++)e===0&&r===i?a[r][e]=o:a[r][e]=o.clone().lerp(s,e/c)}for(let e=0;e<i;e++)for(let t=0;t<2*(i-e)-1;t++){let n=Math.floor(t/2);t%2==0?(d(a[e][n+1]),d(a[e+1][n]),d(a[e][n])):(d(a[e][n+1]),d(a[e+1][n+1]),d(a[e+1][n]))}}function c(e){let t=new K;for(let n=0;n<i.length;n+=3)t.x=i[n+0],t.y=i[n+1],t.z=i[n+2],t.normalize().multiplyScalar(e),i[n+0]=t.x,i[n+1]=t.y,i[n+2]=t.z}function l(){let e=new K;for(let t=0;t<i.length;t+=3){e.x=i[t+0],e.y=i[t+1],e.z=i[t+2];let n=h(e)/2/Math.PI+.5,r=g(e)/Math.PI+.5;a.push(n,1-r)}p(),u()}function u(){for(let e=0;e<a.length;e+=6){let t=a[e+0],n=a[e+2],r=a[e+4];Math.max(t,n,r)>.9&&Math.min(t,n,r)<.1&&(t<.2&&(a[e+0]+=1),n<.2&&(a[e+2]+=1),r<.2&&(a[e+4]+=1))}}function d(e){i.push(e.x,e.y,e.z)}function f(t,n){let r=t*3;n.x=e[r+0],n.y=e[r+1],n.z=e[r+2]}function p(){let e=new K,t=new K,n=new K,r=new K,o=new W,s=new W,c=new W;for(let l=0,u=0;l<i.length;l+=9,u+=6){e.set(i[l+0],i[l+1],i[l+2]),t.set(i[l+3],i[l+4],i[l+5]),n.set(i[l+6],i[l+7],i[l+8]),o.set(a[u+0],a[u+1]),s.set(a[u+2],a[u+3]),c.set(a[u+4],a[u+5]),r.copy(e).add(t).add(n).divideScalar(3);let d=h(r);m(o,u+0,e,d),m(s,u+2,t,d),m(c,u+4,n,d)}}function m(e,t,n,r){r<0&&e.x===1&&(a[t]=e.x-1),n.x===0&&n.z===0&&(a[t]=r/2/Math.PI+.5)}function h(e){return Math.atan2(e.z,-e.x)}function g(e){return Math.atan2(-e.y,Math.sqrt(e.x*e.x+e.z*e.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.vertices,t.indices,t.radius,t.detail)}},ra=class{constructor(){this.type=`Curve`,this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){V(`Curve: .getPoint() not implemented.`)}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,r=this.getPoint(0),i=0;t.push(0);for(let a=1;a<=e;a++)n=this.getPoint(a/e),i+=n.distanceTo(r),t.push(i),r=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let n=this.getLengths(),r=0,i=n.length,a;a=t||e*n[i-1];let o=0,s=i-1,c;for(;o<=s;)if(r=Math.floor(o+(s-o)/2),c=n[r]-a,c<0)o=r+1;else if(c>0)s=r-1;else{s=r;break}if(r=s,n[r]===a)return r/(i-1);let l=n[r],u=n[r+1]-l,d=(a-l)/u;return(r+d)/(i-1)}getTangent(e,t){let n=1e-4,r=e-n,i=e+n;r<0&&(r=0),i>1&&(i=1);let a=this.getPoint(r),o=this.getPoint(i),s=t||(a.isVector2?new W:new K);return s.copy(o).sub(a).normalize(),s}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){let n=new K,r=[],i=[],a=[],o=new K,s=new Yt;for(let t=0;t<=e;t++){let n=t/e;r[t]=this.getTangentAt(n,new K)}i[0]=new K,a[0]=new K;let c=Number.MAX_VALUE,l=Math.abs(r[0].x),u=Math.abs(r[0].y),d=Math.abs(r[0].z);l<=c&&(c=l,n.set(1,0,0)),u<=c&&(c=u,n.set(0,1,0)),d<=c&&n.set(0,0,1),o.crossVectors(r[0],n).normalize(),i[0].crossVectors(r[0],o),a[0].crossVectors(r[0],i[0]);for(let t=1;t<=e;t++){if(i[t]=i[t-1].clone(),a[t]=a[t-1].clone(),o.crossVectors(r[t-1],r[t]),o.length()>2**-52){o.normalize();let e=Math.acos(U(r[t-1].dot(r[t]),-1,1));i[t].applyMatrix4(s.makeRotationAxis(o,e))}a[t].crossVectors(r[t],i[t])}if(t===!0){let t=Math.acos(U(i[0].dot(i[e]),-1,1));t/=e,r[0].dot(o.crossVectors(i[0],i[e]))>0&&(t=-t);for(let n=1;n<=e;n++)i[n].applyMatrix4(s.makeRotationAxis(r[n],t*n)),a[n].crossVectors(r[n],i[n])}return{tangents:r,normals:i,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.7,type:`Curve`,generator:`Curve.toJSON`}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},ia=class extends ra{constructor(e=0,t=0,n=1,r=1,i=0,a=Math.PI*2,o=!1,s=0){super(),this.isEllipseCurve=!0,this.type=`EllipseCurve`,this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=r,this.aStartAngle=i,this.aEndAngle=a,this.aClockwise=o,this.aRotation=s}getPoint(e,t=new W){let n=t,r=Math.PI*2,i=this.aEndAngle-this.aStartAngle,a=Math.abs(i)<2**-52;for(;i<0;)i+=r;for(;i>r;)i-=r;i<2**-52&&(i=a?0:r),this.aClockwise===!0&&!a&&(i===r?i=-r:i-=r);let o=this.aStartAngle+e*i,s=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let e=Math.cos(this.aRotation),t=Math.sin(this.aRotation),n=s-this.aX,r=c-this.aY;s=n*e-r*t+this.aX,c=n*t+r*e+this.aY}return n.set(s,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},aa=class extends ia{constructor(e,t,n,r,i,a){super(e,t,n,n,r,i,a),this.isArcCurve=!0,this.type=`ArcCurve`}};function oa(){let e=0,t=0,n=0,r=0;function i(i,a,o,s){e=i,t=o,n=-3*i+3*a-2*o-s,r=2*i-2*a+o+s}return{initCatmullRom:function(e,t,n,r,a){i(t,n,a*(n-e),a*(r-t))},initNonuniformCatmullRom:function(e,t,n,r,a,o,s){let c=(t-e)/a-(n-e)/(a+o)+(n-t)/o,l=(n-t)/o-(r-t)/(o+s)+(r-n)/s;c*=o,l*=o,i(t,n,c,l)},calc:function(i){let a=i*i,o=a*i;return e+t*i+n*a+r*o}}}var sa=new K,ca=new K,la=new oa,ua=new oa,da=new oa,fa=class extends ra{constructor(e=[],t=!1,n=`centripetal`,r=.5){super(),this.isCatmullRomCurve3=!0,this.type=`CatmullRomCurve3`,this.points=e,this.closed=t,this.curveType=n,this.tension=r}getPoint(e,t=new K){let n=t,r=this.points,i=r.length,a=(i-+!this.closed)*e,o=Math.floor(a),s=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/i)+1)*i:s===0&&o===i-1&&(o=i-2,s=1);let c,l;this.closed||o>0?c=r[(o-1)%i]:(ca.subVectors(r[0],r[1]).add(r[0]),c=ca);let u=r[o%i],d=r[(o+1)%i];if(this.closed||o+2<i?l=r[(o+2)%i]:(sa.subVectors(r[i-1],r[i-2]).add(r[i-1]),l=sa),this.curveType===`centripetal`||this.curveType===`chordal`){let e=this.curveType===`chordal`?.5:.25,t=c.distanceToSquared(u)**+e,n=u.distanceToSquared(d)**+e,r=d.distanceToSquared(l)**+e;n<1e-4&&(n=1),t<1e-4&&(t=n),r<1e-4&&(r=n),la.initNonuniformCatmullRom(c.x,u.x,d.x,l.x,t,n,r),ua.initNonuniformCatmullRom(c.y,u.y,d.y,l.y,t,n,r),da.initNonuniformCatmullRom(c.z,u.z,d.z,l.z,t,n,r)}else this.curveType===`catmullrom`&&(la.initCatmullRom(c.x,u.x,d.x,l.x,this.tension),ua.initCatmullRom(c.y,u.y,d.y,l.y,this.tension),da.initCatmullRom(c.z,u.z,d.z,l.z,this.tension));return n.set(la.calc(s),ua.calc(s),da.calc(s)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(n.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let n=this.points[t];e.points.push(n.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(new K().fromArray(n))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function pa(e,t,n,r,i){let a=(r-t)*.5,o=(i-n)*.5,s=e*e,c=e*s;return(2*n-2*r+a+o)*c+(-3*n+3*r-2*a-o)*s+a*e+n}function ma(e,t){let n=1-e;return n*n*t}function ha(e,t){return 2*(1-e)*e*t}function ga(e,t){return e*e*t}function _a(e,t,n,r){return ma(e,t)+ha(e,n)+ga(e,r)}function va(e,t){let n=1-e;return n*n*n*t}function ya(e,t){let n=1-e;return 3*n*n*e*t}function ba(e,t){return 3*(1-e)*e*e*t}function xa(e,t){return e*e*e*t}function Sa(e,t,n,r,i){return va(e,t)+ya(e,n)+ba(e,r)+xa(e,i)}var Ca=class extends ra{constructor(e=new W,t=new W,n=new W,r=new W){super(),this.isCubicBezierCurve=!0,this.type=`CubicBezierCurve`,this.v0=e,this.v1=t,this.v2=n,this.v3=r}getPoint(e,t=new W){let n=t,r=this.v0,i=this.v1,a=this.v2,o=this.v3;return n.set(Sa(e,r.x,i.x,a.x,o.x),Sa(e,r.y,i.y,a.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},wa=class extends ra{constructor(e=new K,t=new K,n=new K,r=new K){super(),this.isCubicBezierCurve3=!0,this.type=`CubicBezierCurve3`,this.v0=e,this.v1=t,this.v2=n,this.v3=r}getPoint(e,t=new K){let n=t,r=this.v0,i=this.v1,a=this.v2,o=this.v3;return n.set(Sa(e,r.x,i.x,a.x,o.x),Sa(e,r.y,i.y,a.y,o.y),Sa(e,r.z,i.z,a.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Ta=class extends ra{constructor(e=new W,t=new W){super(),this.isLineCurve=!0,this.type=`LineCurve`,this.v1=e,this.v2=t}getPoint(e,t=new W){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new W){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Ea=class extends ra{constructor(e=new K,t=new K){super(),this.isLineCurve3=!0,this.type=`LineCurve3`,this.v1=e,this.v2=t}getPoint(e,t=new K){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new K){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Da=class extends ra{constructor(e=new W,t=new W,n=new W){super(),this.isQuadraticBezierCurve=!0,this.type=`QuadraticBezierCurve`,this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new W){let n=t,r=this.v0,i=this.v1,a=this.v2;return n.set(_a(e,r.x,i.x,a.x),_a(e,r.y,i.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Oa=class extends ra{constructor(e=new K,t=new K,n=new K){super(),this.isQuadraticBezierCurve3=!0,this.type=`QuadraticBezierCurve3`,this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new K){let n=t,r=this.v0,i=this.v1,a=this.v2;return n.set(_a(e,r.x,i.x,a.x),_a(e,r.y,i.y,a.y),_a(e,r.z,i.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},ka=class extends ra{constructor(e=[]){super(),this.isSplineCurve=!0,this.type=`SplineCurve`,this.points=e}getPoint(e,t=new W){let n=t,r=this.points,i=(r.length-1)*e,a=Math.floor(i),o=i-a,s=r[a===0?a:a-1],c=r[a],l=r[a>r.length-2?r.length-1:a+1],u=r[a>r.length-3?r.length-1:a+2];return n.set(pa(o,s.x,c.x,l.x,u.x),pa(o,s.y,c.y,l.y,u.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(n.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let n=this.points[t];e.points.push(n.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(new W().fromArray(n))}return this}},Aa=Object.freeze({__proto__:null,ArcCurve:aa,CatmullRomCurve3:fa,CubicBezierCurve:Ca,CubicBezierCurve3:wa,EllipseCurve:ia,LineCurve:Ta,LineCurve3:Ea,QuadraticBezierCurve:Da,QuadraticBezierCurve3:Oa,SplineCurve:ka}),ja=class extends ra{constructor(){super(),this.type=`CurvePath`,this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let n=e.isVector2===!0?`LineCurve`:`LineCurve3`;this.curves.push(new Aa[n](t,e))}return this}getPoint(e,t){let n=e*this.getLength(),r=this.getCurveLengths(),i=0;for(;i<r.length;){if(r[i]>=n){let e=r[i]-n,a=this.curves[i],o=a.getLength(),s=o===0?0:1-e/o;return a.getPointAt(s,t)}i++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let n=0,r=this.curves.length;n<r;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],n;for(let r=0,i=this.curves;r<i.length;r++){let a=i[r],o=a.isEllipseCurve?e*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?e*a.points.length:e,s=a.getPoints(o);for(let e=0;e<s.length;e++){let r=s[e];n&&n.equals(r)||(t.push(r),n=r)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let n=e.curves[t];this.curves.push(n.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){let n=this.curves[t];e.curves.push(n.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let n=e.curves[t];this.curves.push(new Aa[n.type]().fromJSON(n))}return this}},Ma=class extends ja{constructor(e){super(),this.type=`Path`,this.currentPoint=new W,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let n=new Ta(this.currentPoint.clone(),new W(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,r){let i=new Da(this.currentPoint.clone(),new W(e,t),new W(n,r));return this.curves.push(i),this.currentPoint.set(n,r),this}bezierCurveTo(e,t,n,r,i,a){let o=new Ca(this.currentPoint.clone(),new W(e,t),new W(n,r),new W(i,a));return this.curves.push(o),this.currentPoint.set(i,a),this}splineThru(e){let t=new ka([this.currentPoint.clone()].concat(e));return this.curves.push(t),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,r,i,a){let o=this.currentPoint.x,s=this.currentPoint.y;return this.absarc(e+o,t+s,n,r,i,a),this}absarc(e,t,n,r,i,a){return this.absellipse(e,t,n,n,r,i,a),this}ellipse(e,t,n,r,i,a,o,s){let c=this.currentPoint.x,l=this.currentPoint.y;return this.absellipse(e+c,t+l,n,r,i,a,o,s),this}absellipse(e,t,n,r,i,a,o,s){let c=new ia(e,t,n,r,i,a,o,s);if(this.curves.length>0){let e=c.getPoint(0);e.equals(this.currentPoint)||this.lineTo(e.x,e.y)}this.curves.push(c);let l=c.getPoint(1);return this.currentPoint.copy(l),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},Na=class extends Ma{constructor(e){super(e),this.uuid=it(),this.type=`Shape`,this.holes=[]}getPointsHoles(e){let t=[];for(let n=0,r=this.holes.length;n<r;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let n=e.holes[t];this.holes.push(n.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){let n=this.holes[t];e.holes.push(n.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let n=e.holes[t];this.holes.push(new Ma().fromJSON(n))}return this}};function Pa(e,t,n=2){let r=t&&t.length,i=r?t[0]*n:e.length,a=Fa(e,0,i,n,!0),o=[];if(!a||a.next===a.prev)return o;let s,c,l;if(r&&(a=Ha(e,t,a,n)),e.length>80*n){s=e[0],c=e[1];let t=s,r=c;for(let a=n;a<i;a+=n){let n=e[a],i=e[a+1];n<s&&(s=n),i<c&&(c=i),n>t&&(t=n),i>r&&(r=i)}l=Math.max(t-s,r-c),l=l===0?0:32767/l}return La(a,o,n,s,c,l,0),o}function Fa(e,t,n,r,i){let a;if(i===po(e,t,n,r)>0)for(let i=t;i<n;i+=r)a=lo(i/r|0,e[i],e[i+1],a);else for(let i=n-r;i>=t;i-=r)a=lo(i/r|0,e[i],e[i+1],a);return a&&to(a,a.next)&&(uo(a),a=a.next),a}function Ia(e,t){if(!e)return e;t||=e;let n=e,r;do if(r=!1,!n.steiner&&(to(n,n.next)||eo(n.prev,n,n.next)===0)){if(uo(n),n=t=n.prev,n===n.next)break;r=!0}else n=n.next;while(r||n!==t);return t}function La(e,t,n,r,i,a,o){if(!e)return;!o&&a&&qa(e,r,i,a);let s=e;for(;e.prev!==e.next;){let c=e.prev,l=e.next;if(a?za(e,r,i,a):Ra(e)){t.push(c.i,e.i,l.i),uo(e),e=l.next,s=l.next;continue}if(e=l,e===s){o?o===1?(e=Ba(Ia(e),t),La(e,t,n,r,i,a,2)):o===2&&Va(e,t,n,r,i,a):La(Ia(e),t,n,r,i,a,1);break}}}function Ra(e){let t=e.prev,n=e,r=e.next;if(eo(t,n,r)>=0)return!1;let i=t.x,a=n.x,o=r.x,s=t.y,c=n.y,l=r.y,u=Math.min(i,a,o),d=Math.min(s,c,l),f=Math.max(i,a,o),p=Math.max(s,c,l),m=r.next;for(;m!==t;){if(m.x>=u&&m.x<=f&&m.y>=d&&m.y<=p&&Qa(i,s,a,c,o,l,m.x,m.y)&&eo(m.prev,m,m.next)>=0)return!1;m=m.next}return!0}function za(e,t,n,r){let i=e.prev,a=e,o=e.next;if(eo(i,a,o)>=0)return!1;let s=i.x,c=a.x,l=o.x,u=i.y,d=a.y,f=o.y,p=Math.min(s,c,l),m=Math.min(u,d,f),h=Math.max(s,c,l),g=Math.max(u,d,f),_=Ya(p,m,t,n,r),v=Ya(h,g,t,n,r),y=e.prevZ,b=e.nextZ;for(;y&&y.z>=_&&b&&b.z<=v;){if(y.x>=p&&y.x<=h&&y.y>=m&&y.y<=g&&y!==i&&y!==o&&Qa(s,u,c,d,l,f,y.x,y.y)&&eo(y.prev,y,y.next)>=0||(y=y.prevZ,b.x>=p&&b.x<=h&&b.y>=m&&b.y<=g&&b!==i&&b!==o&&Qa(s,u,c,d,l,f,b.x,b.y)&&eo(b.prev,b,b.next)>=0))return!1;b=b.nextZ}for(;y&&y.z>=_;){if(y.x>=p&&y.x<=h&&y.y>=m&&y.y<=g&&y!==i&&y!==o&&Qa(s,u,c,d,l,f,y.x,y.y)&&eo(y.prev,y,y.next)>=0)return!1;y=y.prevZ}for(;b&&b.z<=v;){if(b.x>=p&&b.x<=h&&b.y>=m&&b.y<=g&&b!==i&&b!==o&&Qa(s,u,c,d,l,f,b.x,b.y)&&eo(b.prev,b,b.next)>=0)return!1;b=b.nextZ}return!0}function Ba(e,t){let n=e;do{let r=n.prev,i=n.next.next;!to(r,i)&&no(r,n,n.next,i)&&oo(r,i)&&oo(i,r)&&(t.push(r.i,n.i,i.i),uo(n),uo(n.next),n=e=i),n=n.next}while(n!==e);return Ia(n)}function Va(e,t,n,r,i,a){let o=e;do{let e=o.next.next;for(;e!==o.prev;){if(o.i!==e.i&&$a(o,e)){let s=co(o,e);o=Ia(o,o.next),s=Ia(s,s.next),La(o,t,n,r,i,a,0),La(s,t,n,r,i,a,0);return}e=e.next}o=o.next}while(o!==e)}function Ha(e,t,n,r){let i=[];for(let n=0,a=t.length;n<a;n++){let o=Fa(e,t[n]*r,n<a-1?t[n+1]*r:e.length,r,!1);o===o.next&&(o.steiner=!0),i.push(Xa(o))}i.sort(Ua);for(let e=0;e<i.length;e++)n=Wa(i[e],n);return n}function Ua(e,t){let n=e.x-t.x;return n===0&&(n=e.y-t.y,n===0&&(n=(e.next.y-e.y)/(e.next.x-e.x)-(t.next.y-t.y)/(t.next.x-t.x))),n}function Wa(e,t){let n=Ga(e,t);if(!n)return t;let r=co(n,e);return Ia(r,r.next),Ia(n,n.next)}function Ga(e,t){let n=t,r=e.x,i=e.y,a=-1/0,o;if(to(e,n))return n;do{if(to(e,n.next))return n.next;if(i<=n.y&&i>=n.next.y&&n.next.y!==n.y){let e=n.x+(i-n.y)*(n.next.x-n.x)/(n.next.y-n.y);if(e<=r&&e>a&&(a=e,o=n.x<n.next.x?n:n.next,e===r))return o}n=n.next}while(n!==t);if(!o)return null;let s=o,c=o.x,l=o.y,u=1/0;n=o;do{if(r>=n.x&&n.x>=c&&r!==n.x&&Za(i<l?r:a,i,c,l,i<l?a:r,i,n.x,n.y)){let t=Math.abs(i-n.y)/(r-n.x);oo(n,e)&&(t<u||t===u&&(n.x>o.x||n.x===o.x&&Ka(o,n)))&&(o=n,u=t)}n=n.next}while(n!==s);return o}function Ka(e,t){return eo(e.prev,e,t.prev)<0&&eo(t.next,e,e.next)<0}function qa(e,t,n,r){let i=e;do i.z===0&&(i.z=Ya(i.x,i.y,t,n,r)),i.prevZ=i.prev,i.nextZ=i.next,i=i.next;while(i!==e);i.prevZ.nextZ=null,i.prevZ=null,Ja(i)}function Ja(e){let t,n=1;do{let r=e,i;e=null;let a=null;for(t=0;r;){t++;let o=r,s=0;for(let e=0;e<n&&(s++,o=o.nextZ,o);e++);let c=n;for(;s>0||c>0&&o;)s!==0&&(c===0||!o||r.z<=o.z)?(i=r,r=r.nextZ,s--):(i=o,o=o.nextZ,c--),a?a.nextZ=i:e=i,i.prevZ=a,a=i;r=o}a.nextZ=null,n*=2}while(t>1);return e}function Ya(e,t,n,r,i){return e=(e-n)*i|0,t=(t-r)*i|0,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,e|t<<1}function Xa(e){let t=e,n=e;do(t.x<n.x||t.x===n.x&&t.y<n.y)&&(n=t),t=t.next;while(t!==e);return n}function Za(e,t,n,r,i,a,o,s){return(i-o)*(t-s)>=(e-o)*(a-s)&&(e-o)*(r-s)>=(n-o)*(t-s)&&(n-o)*(a-s)>=(i-o)*(r-s)}function Qa(e,t,n,r,i,a,o,s){return(e!==o||t!==s)&&Za(e,t,n,r,i,a,o,s)}function $a(e,t){return e.next.i!==t.i&&e.prev.i!==t.i&&!ao(e,t)&&(oo(e,t)&&oo(t,e)&&so(e,t)&&(eo(e.prev,e,t.prev)||eo(e,t.prev,t))||to(e,t)&&eo(e.prev,e,e.next)>0&&eo(t.prev,t,t.next)>0)}function eo(e,t,n){return(t.y-e.y)*(n.x-t.x)-(t.x-e.x)*(n.y-t.y)}function to(e,t){return e.x===t.x&&e.y===t.y}function no(e,t,n,r){let i=io(eo(e,t,n)),a=io(eo(e,t,r)),o=io(eo(n,r,e)),s=io(eo(n,r,t));return!!(i!==a&&o!==s||i===0&&ro(e,n,t)||a===0&&ro(e,r,t)||o===0&&ro(n,e,r)||s===0&&ro(n,t,r))}function ro(e,t,n){return t.x<=Math.max(e.x,n.x)&&t.x>=Math.min(e.x,n.x)&&t.y<=Math.max(e.y,n.y)&&t.y>=Math.min(e.y,n.y)}function io(e){return e>0?1:e<0?-1:0}function ao(e,t){let n=e;do{if(n.i!==e.i&&n.next.i!==e.i&&n.i!==t.i&&n.next.i!==t.i&&no(n,n.next,e,t))return!0;n=n.next}while(n!==e);return!1}function oo(e,t){return eo(e.prev,e,e.next)<0?eo(e,t,e.next)>=0&&eo(e,e.prev,t)>=0:eo(e,t,e.prev)<0||eo(e,e.next,t)<0}function so(e,t){let n=e,r=!1,i=(e.x+t.x)/2,a=(e.y+t.y)/2;do n.y>a!=n.next.y>a&&n.next.y!==n.y&&i<(n.next.x-n.x)*(a-n.y)/(n.next.y-n.y)+n.x&&(r=!r),n=n.next;while(n!==e);return r}function co(e,t){let n=fo(e.i,e.x,e.y),r=fo(t.i,t.x,t.y),i=e.next,a=t.prev;return e.next=t,t.prev=e,n.next=i,i.prev=n,r.next=n,n.prev=r,a.next=r,r.prev=a,r}function lo(e,t,n,r){let i=fo(e,t,n);return r?(i.next=r.next,i.prev=r,r.next.prev=i,r.next=i):(i.prev=i,i.next=i),i}function uo(e){e.next.prev=e.prev,e.prev.next=e.next,e.prevZ&&(e.prevZ.nextZ=e.nextZ),e.nextZ&&(e.nextZ.prevZ=e.prevZ)}function fo(e,t,n){return{i:e,x:t,y:n,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function po(e,t,n,r){let i=0;for(let a=t,o=n-r;a<n;a+=r)i+=(e[o]-e[a])*(e[a+1]+e[o+1]),o=a;return i}var mo=class{static triangulate(e,t,n=2){return Pa(e,t,n)}},ho=class e{static area(e){let t=e.length,n=0;for(let r=t-1,i=0;i<t;r=i++)n+=e[r].x*e[i].y-e[i].x*e[r].y;return n*.5}static isClockWise(t){return e.area(t)<0}static triangulateShape(e,t){let n=[],r=[],i=[];go(e),_o(n,e);let a=e.length;t.forEach(go);for(let e=0;e<t.length;e++)r.push(a),a+=t[e].length,_o(n,t[e]);let o=mo.triangulate(n,r);for(let e=0;e<o.length;e+=3)i.push(o.slice(e,e+3));return i}};function go(e){let t=e.length;t>2&&e[t-1].equals(e[0])&&e.pop()}function _o(e,t){for(let n=0;n<t.length;n++)e.push(t[n].x),e.push(t[n].y)}var vo=class e extends Dr{constructor(e=new Na([new W(.5,.5),new W(-.5,.5),new W(-.5,-.5),new W(.5,-.5)]),t={}){super(),this.type=`ExtrudeGeometry`,this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];let n=this,r=[],i=[];for(let t=0,n=e.length;t<n;t++){let n=e[t];a(n)}this.setAttribute(`position`,new hr(r,3)),this.setAttribute(`uv`,new hr(i,2)),this.computeVertexNormals();function a(e){let a=[],o=t.curveSegments===void 0?12:t.curveSegments,s=t.steps===void 0?1:t.steps,c=t.depth===void 0?1:t.depth,l=t.bevelEnabled===void 0||t.bevelEnabled,u=t.bevelThickness===void 0?.2:t.bevelThickness,d=t.bevelSize===void 0?u-.1:t.bevelSize,f=t.bevelOffset===void 0?0:t.bevelOffset,p=t.bevelSegments===void 0?3:t.bevelSegments,m=t.extrudePath,h=t.UVGenerator===void 0?yo:t.UVGenerator,g,_=!1,v,y,b,x;if(m){g=m.getSpacedPoints(s),_=!0,l=!1;let e=m.isCatmullRomCurve3?m.closed:!1;v=m.computeFrenetFrames(s,e),y=new K,b=new K,x=new K}l||(p=0,u=0,d=0,f=0);let S=e.extractPoints(o),C=S.shape,w=S.holes;if(!ho.isClockWise(C)){C=C.reverse();for(let e=0,t=w.length;e<t;e++){let t=w[e];ho.isClockWise(t)&&(w[e]=t.reverse())}}function T(e){let t=e[0];for(let n=1;n<=e.length;n++){let r=n%e.length,i=e[r],a=i.x-t.x,o=i.y-t.y,s=a*a+o*o,c=Math.max(Math.abs(i.x),Math.abs(i.y),Math.abs(t.x),Math.abs(t.y));if(s<=10000000000000001e-36*c*c){e.splice(r,1),n--;continue}t=i}}T(C),w.forEach(T);let E=w.length,D=C;for(let e=0;e<E;e++){let t=w[e];C=C.concat(t)}function O(e,t,n){return t||H(`ExtrudeGeometry: vec does not exist`),e.clone().addScaledVector(t,n)}let k=C.length;function A(e,t,n){let r,i,a,o=e.x-t.x,s=e.y-t.y,c=n.x-e.x,l=n.y-e.y,u=o*o+s*s,d=o*l-s*c;if(Math.abs(d)>2**-52){let d=Math.sqrt(u),f=Math.sqrt(c*c+l*l),p=t.x-s/d,m=t.y+o/d,h=n.x-l/f,g=n.y+c/f,_=((h-p)*l-(g-m)*c)/(o*l-s*c);r=p+o*_-e.x,i=m+s*_-e.y;let v=r*r+i*i;if(v<=2)return new W(r,i);a=Math.sqrt(v/2)}else{let e=!1;o>2**-52?c>2**-52&&(e=!0):o<-(2**-52)?c<-(2**-52)&&(e=!0):Math.sign(s)===Math.sign(l)&&(e=!0),e?(r=-s,i=o,a=Math.sqrt(u)):(r=o,i=s,a=Math.sqrt(u/2))}return new W(r/a,i/a)}let j=[];for(let e=0,t=D.length,n=t-1,r=e+1;e<t;e++,n++,r++)n===t&&(n=0),r===t&&(r=0),j[e]=A(D[e],D[n],D[r]);let M=[],ee,N=j.concat();for(let e=0,t=E;e<t;e++){let t=w[e];ee=[];for(let e=0,n=t.length,r=n-1,i=e+1;e<n;e++,r++,i++)r===n&&(r=0),i===n&&(i=0),ee[e]=A(t[e],t[r],t[i]);M.push(ee),N=N.concat(ee)}let te;if(p===0)te=ho.triangulateShape(D,w);else{let e=[],t=[];for(let n=0;n<p;n++){let r=n/p,i=u*Math.cos(r*Math.PI/2),a=d*Math.sin(r*Math.PI/2)+f;for(let t=0,n=D.length;t<n;t++){let n=O(D[t],j[t],a);I(n.x,n.y,-i),r===0&&e.push(n)}for(let e=0,n=E;e<n;e++){let n=w[e];ee=M[e];let o=[];for(let e=0,t=n.length;e<t;e++){let t=O(n[e],ee[e],a);I(t.x,t.y,-i),r===0&&o.push(t)}r===0&&t.push(o)}}te=ho.triangulateShape(e,t)}let P=te.length,ne=d+f;for(let e=0;e<k;e++){let t=l?O(C[e],N[e],ne):C[e];_?(b.copy(v.normals[0]).multiplyScalar(t.x),y.copy(v.binormals[0]).multiplyScalar(t.y),x.copy(g[0]).add(b).add(y),I(x.x,x.y,x.z)):I(t.x,t.y,0)}for(let e=1;e<=s;e++)for(let t=0;t<k;t++){let n=l?O(C[t],N[t],ne):C[t];_?(b.copy(v.normals[e]).multiplyScalar(n.x),y.copy(v.binormals[e]).multiplyScalar(n.y),x.copy(g[e]).add(b).add(y),I(x.x,x.y,x.z)):I(n.x,n.y,c/s*e)}for(let e=p-1;e>=0;e--){let t=e/p,n=u*Math.cos(t*Math.PI/2),r=d*Math.sin(t*Math.PI/2)+f;for(let e=0,t=D.length;e<t;e++){let t=O(D[e],j[e],r);I(t.x,t.y,c+n)}for(let e=0,t=w.length;e<t;e++){let t=w[e];ee=M[e];for(let e=0,i=t.length;e<i;e++){let i=O(t[e],ee[e],r);_?I(i.x,i.y+g[s-1].y,g[s-1].x+n):I(i.x,i.y,c+n)}}}F(),re();function F(){let e=r.length/3;if(l){let e=0,t=k*e;for(let e=0;e<P;e++){let n=te[e];ae(n[2]+t,n[1]+t,n[0]+t)}e=s+p*2,t=k*e;for(let e=0;e<P;e++){let n=te[e];ae(n[0]+t,n[1]+t,n[2]+t)}}else{for(let e=0;e<P;e++){let t=te[e];ae(t[2],t[1],t[0])}for(let e=0;e<P;e++){let t=te[e];ae(t[0]+k*s,t[1]+k*s,t[2]+k*s)}}n.addGroup(e,r.length/3-e,0)}function re(){let e=r.length/3,t=0;ie(D,t),t+=D.length;for(let e=0,n=w.length;e<n;e++){let n=w[e];ie(n,t),t+=n.length}n.addGroup(e,r.length/3-e,1)}function ie(e,t){let n=e.length;for(;--n>=0;){let r=n,i=n-1;i<0&&(i=e.length-1);for(let e=0,n=s+p*2;e<n;e++){let n=k*e,a=k*(e+1);oe(t+r+n,t+i+n,t+i+a,t+r+a)}}}function I(e,t,n){a.push(e),a.push(t),a.push(n)}function ae(e,t,i){L(e),L(t),L(i);let a=r.length/3,o=h.generateTopUV(n,r,a-3,a-2,a-1);se(o[0]),se(o[1]),se(o[2])}function oe(e,t,i,a){L(e),L(t),L(a),L(t),L(i),L(a);let o=r.length/3,s=h.generateSideWallUV(n,r,o-6,o-3,o-2,o-1);se(s[0]),se(s[1]),se(s[3]),se(s[1]),se(s[2]),se(s[3])}function L(e){r.push(a[e*3+0]),r.push(a[e*3+1]),r.push(a[e*3+2])}function se(e){i.push(e.x),i.push(e.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes,n=this.parameters.options;return bo(t,n,e)}static fromJSON(t,n){let r=[];for(let e=0,i=t.shapes.length;e<i;e++){let i=n[t.shapes[e]];r.push(i)}let i=t.options.extrudePath;return i!==void 0&&(t.options.extrudePath=new Aa[i.type]().fromJSON(i)),new e(r,t.options)}},yo={generateTopUV:function(e,t,n,r,i){let a=t[n*3],o=t[n*3+1],s=t[r*3],c=t[r*3+1],l=t[i*3],u=t[i*3+1];return[new W(a,o),new W(s,c),new W(l,u)]},generateSideWallUV:function(e,t,n,r,i,a){let o=t[n*3],s=t[n*3+1],c=t[n*3+2],l=t[r*3],u=t[r*3+1],d=t[r*3+2],f=t[i*3],p=t[i*3+1],m=t[i*3+2],h=t[a*3],g=t[a*3+1],_=t[a*3+2];return Math.abs(s-u)<Math.abs(o-l)?[new W(o,1-c),new W(l,1-d),new W(f,1-m),new W(h,1-_)]:[new W(s,1-c),new W(u,1-d),new W(p,1-m),new W(g,1-_)]}};function bo(e,t,n){if(n.shapes=[],Array.isArray(e))for(let t=0,r=e.length;t<r;t++){let r=e[t];n.shapes.push(r.uuid)}else n.shapes.push(e.uuid);return n.options=Object.assign({},t),t.extrudePath!==void 0&&(n.options.extrudePath=t.extrudePath.toJSON()),n}var xo=class e extends na{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,r=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1];super(r,[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1],e,t),this.type=`IcosahedronGeometry`,this.parameters={radius:e,detail:t}}static fromJSON(t){return new e(t.radius,t.detail)}},So=class e extends na{constructor(e=1,t=0){super([1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2],e,t),this.type=`OctahedronGeometry`,this.parameters={radius:e,detail:t}}static fromJSON(t){return new e(t.radius,t.detail)}},Co=class e extends Dr{constructor(e=1,t=1,n=1,r=1){super(),this.type=`PlaneGeometry`,this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};let i=e/2,a=t/2,o=Math.floor(n),s=Math.floor(r),c=o+1,l=s+1,u=e/o,d=t/s,f=[],p=[],m=[],h=[];for(let e=0;e<l;e++){let t=e*d-a;for(let n=0;n<c;n++){let r=n*u-i;p.push(r,-t,0),m.push(0,0,1),h.push(n/o),h.push(1-e/s)}}for(let e=0;e<s;e++)for(let t=0;t<o;t++){let n=t+c*e,r=t+c*(e+1),i=t+1+c*(e+1),a=t+1+c*e;f.push(n,r,a),f.push(r,i,a)}this.setIndex(f),this.setAttribute(`position`,new hr(p,3)),this.setAttribute(`normal`,new hr(m,3)),this.setAttribute(`uv`,new hr(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.widthSegments,t.heightSegments)}},wo=class e extends Dr{constructor(e=.5,t=1,n=32,r=1,i=0,a=Math.PI*2){super(),this.type=`RingGeometry`,this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:r,thetaStart:i,thetaLength:a},n=Math.max(3,n),r=Math.max(1,r);let o=[],s=[],c=[],l=[],u=e,d=(t-e)/r,f=new K,p=new W;for(let e=0;e<=r;e++){for(let e=0;e<=n;e++){let r=i+e/n*a;f.x=u*Math.cos(r),f.y=u*Math.sin(r),s.push(f.x,f.y,f.z),c.push(0,0,1),p.x=(f.x/t+1)/2,p.y=(f.y/t+1)/2,l.push(p.x,p.y)}u+=d}for(let e=0;e<r;e++){let t=e*(n+1);for(let e=0;e<n;e++){let r=e+t,i=r,a=r+n+1,s=r+n+2,c=r+1;o.push(i,a,c),o.push(a,s,c)}}this.setIndex(o),this.setAttribute(`position`,new hr(s,3)),this.setAttribute(`normal`,new hr(c,3)),this.setAttribute(`uv`,new hr(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}},To=class e extends Dr{constructor(e=1,t=32,n=16,r=0,i=Math.PI*2,a=0,o=Math.PI){super(),this.type=`SphereGeometry`,this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:r,phiLength:i,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let s=Math.min(a+o,Math.PI),c=0,l=[],u=new K,d=new K,f=[],p=[],m=[],h=[];for(let f=0;f<=n;f++){let g=[],_=f/n,v=a+_*o,y=e*Math.cos(v),b=Math.sqrt(e*e-y*y),x=0;f===0&&a===0?x=.5/t:f===n&&s===Math.PI&&(x=-.5/t);for(let e=0;e<=t;e++){let n=e/t,a=r+n*i;u.x=-b*Math.cos(a),u.y=y,u.z=b*Math.sin(a),p.push(u.x,u.y,u.z),d.copy(u).normalize(),m.push(d.x,d.y,d.z),h.push(n+x,1-_),g.push(c++)}l.push(g)}for(let e=0;e<n;e++)for(let r=0;r<t;r++){let t=l[e][r+1],i=l[e][r],o=l[e+1][r],c=l[e+1][r+1];(e!==0||a>0)&&f.push(t,i,c),(e!==n-1||s<Math.PI)&&f.push(i,o,c)}this.setIndex(f),this.setAttribute(`position`,new hr(p,3)),this.setAttribute(`normal`,new hr(m,3)),this.setAttribute(`uv`,new hr(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}},Eo=class e extends Dr{constructor(e=new Oa(new K(-1,-1,0),new K(-1,1,0),new K(1,1,0)),t=64,n=1,r=8,i=!1){super(),this.type=`TubeGeometry`,this.parameters={path:e,tubularSegments:t,radius:n,radialSegments:r,closed:i};let a=e.computeFrenetFrames(t,i);this.tangents=a.tangents,this.normals=a.normals,this.binormals=a.binormals;let o=new K,s=new K,c=new W,l=new K,u=[],d=[],f=[],p=[];m(),this.setIndex(p),this.setAttribute(`position`,new hr(u,3)),this.setAttribute(`normal`,new hr(d,3)),this.setAttribute(`uv`,new hr(f,2));function m(){for(let e=0;e<t;e++)h(e);h(i===!1?t:0),_(),g()}function h(i){l=e.getPointAt(i/t,l);let c=a.normals[i],f=a.binormals[i];for(let e=0;e<=r;e++){let t=e/r*Math.PI*2,i=Math.sin(t),a=-Math.cos(t);s.x=a*c.x+i*f.x,s.y=a*c.y+i*f.y,s.z=a*c.z+i*f.z,s.normalize(),d.push(s.x,s.y,s.z),o.x=l.x+n*s.x,o.y=l.y+n*s.y,o.z=l.z+n*s.z,u.push(o.x,o.y,o.z)}}function g(){for(let e=1;e<=t;e++)for(let t=1;t<=r;t++){let n=(r+1)*(e-1)+(t-1),i=(r+1)*e+(t-1),a=(r+1)*e+t,o=(r+1)*(e-1)+t;p.push(n,i,o),p.push(i,a,o)}}function _(){for(let e=0;e<=t;e++)for(let n=0;n<=r;n++)c.x=e/t,c.y=n/r,f.push(c.x,c.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(t){return new e(new Aa[t.path.type]().fromJSON(t.path),t.tubularSegments,t.radius,t.radialSegments,t.closed)}};function Do(e){let t={};for(let n in e){t[n]={};for(let r in e[n]){let i=e[n][r];if(ko(i))i.isRenderTargetTexture?(V(`UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms().`),t[n][r]=null):t[n][r]=i.clone();else if(Array.isArray(i)){if(ko(i[0])){let e=[];for(let t=0,n=i.length;t<n;t++)e[t]=i[t].clone();t[n][r]=e}else t[n][r]=i.slice()}else t[n][r]=i}}return t}function Oo(e){let t={};for(let n=0;n<e.length;n++){let r=Do(e[n]);for(let e in r)t[e]=r[e]}return t}function ko(e){return e&&(e.isColor||e.isMatrix3||e.isMatrix4||e.isVector2||e.isVector3||e.isVector4||e.isTexture||e.isQuaternion)}function Ao(e){let t=[];for(let n=0;n<e.length;n++)t.push(e[n].clone());return t}function jo(e){let t=e.getRenderTarget();return t===null?e.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:Nt.workingColorSpace}var Mo={clone:Do,merge:Oo},No=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Po=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Fo=class extends Ir{constructor(e){super(),this.isShaderMaterial=!0,this.type=`ShaderMaterial`,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=No,this.fragmentShader=Po,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Do(e.uniforms),this.uniformsGroups=Ao(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let n in this.uniforms){let r=this.uniforms[n].value;r&&r.isTexture?t.uniforms[n]={type:`t`,value:r.toJSON(e).uuid}:r&&r.isColor?t.uniforms[n]={type:`c`,value:r.getHex()}:r&&r.isVector2?t.uniforms[n]={type:`v2`,value:r.toArray()}:r&&r.isVector3?t.uniforms[n]={type:`v3`,value:r.toArray()}:r&&r.isVector4?t.uniforms[n]={type:`v4`,value:r.toArray()}:r&&r.isMatrix3?t.uniforms[n]={type:`m3`,value:r.toArray()}:r&&r.isMatrix4?t.uniforms[n]={type:`m4`,value:r.toArray()}:t.uniforms[n]={value:r}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let e in this.extensions)this.extensions[e]===!0&&(n[e]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let r=e.uniforms[n];switch(this.uniforms[n]={},r.type){case`t`:this.uniforms[n].value=t[r.value]||null;break;case`c`:this.uniforms[n].value=new q().setHex(r.value);break;case`v2`:this.uniforms[n].value=new W().fromArray(r.value);break;case`v3`:this.uniforms[n].value=new K().fromArray(r.value);break;case`v4`:this.uniforms[n].value=new Wt().fromArray(r.value);break;case`m3`:this.uniforms[n].value=new Ot().fromArray(r.value);break;case`m4`:this.uniforms[n].value=new Yt().fromArray(r.value);break;default:this.uniforms[n].value=r.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let t in e.extensions)this.extensions[t]=e.extensions[t];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},Io=class extends Fo{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type=`RawShaderMaterial`}},Lo=class extends Ir{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type=`MeshStandardMaterial`,this.defines={STANDARD:``},this.color=new q(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new q(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new W(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new on,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:``},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},Ro=class extends Ir{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type=`MeshLambertMaterial`,this.color=new q(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new q(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new W(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new on,this.combine=0,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},zo=class extends Ir{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type=`MeshDepthMaterial`,this.depthPacking=B,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Bo=class extends Ir{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type=`MeshDistanceMaterial`,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function Vo(e,t){return!e||e.constructor===t?e:typeof t.BYTES_PER_ELEMENT==`number`?new t(e):Array.prototype.slice.call(e)}function Ho(e){return e!==void 0&&e.inTangents!==void 0&&e.outTangents!==void 0}var Uo=class{constructor(e,t,n,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r===void 0?new t.constructor(n):r,this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,r=t[n],i=t[n-1];validate_interval:{seek:{let a;linear_scan:{forward_scan:if(!(e<r)){for(let a=n+2;;){if(r===void 0){if(e<i)break forward_scan;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(i=r,r=t[++n],e<r)break seek}a=t.length;break linear_scan}if(!(e>=i)){let o=t[1];e<o&&(n=2,i=o);for(let a=n-2;;){if(i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===a)break;if(r=i,i=t[--n-1],e>=i)break seek}a=n,n=0;break linear_scan}break validate_interval}for(;n<a;){let r=n+a>>>1;e<t[r]?a=r:n=r+1}if(r=t[n],i=t[n-1],i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,i,r)}return this.interpolate_(n,i,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,i=e*r;for(let e=0;e!==r;++e)t[e]=n[i+e];return t}interpolate_(){throw Error(`THREE.Interpolant: Call to abstract method.`)}intervalChanged_(){}},Wo=class extends Uo{constructor(e,t,n,r){super(e,t,n,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Ne,endingEnd:Ne}}intervalChanged_(e,t,n){let r=this.parameterPositions,i=e-2,a=e+1,o=r[i],s=r[a];if(o===void 0)switch(this.getSettings_().endingStart){case z:i=e,o=2*t-n;break;case Pe:i=r.length-2,o=t+r[i]-r[i+1];break;default:i=e,o=n}if(s===void 0)switch(this.getSettings_().endingEnd){case z:a=e,s=2*n-t;break;case Pe:a=1,s=n+r[1]-r[0];break;default:a=e-1,s=t}let c=(n-t)*.5,l=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(s-n),this._offsetPrev=i*l,this._offsetNext=a*l}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,p=(n-t)/(r-t),m=p*p,h=m*p,g=-d*h+2*d*m-d*p,_=(1+d)*h+(-1.5-2*d)*m+(-.5+d)*p+1,v=(-1-f)*h+(1.5+f)*m+.5*p,y=f*h-f*m;for(let e=0;e!==o;++e)i[e]=g*a[l+e]+_*a[c+e]+v*a[s+e]+y*a[u+e];return i}},Go=class extends Uo{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=(n-t)/(r-t),u=1-l;for(let e=0;e!==o;++e)i[e]=a[c+e]*u+a[s+e]*l;return i}},Ko=class extends Uo{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e){return this.copySampleValue_(e-1)}},qo=class extends Uo{interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this.inTangents,u=this.outTangents;if(!l||!u){let e=(n-t)/(r-t),l=1-e;for(let t=0;t!==o;++t)i[t]=a[c+t]*l+a[s+t]*e;return i}let d=o*2,f=e-1;for(let p=0;p!==o;++p){let o=a[c+p],m=a[s+p],h=f*d+p*2,g=u[h],_=u[h+1],v=e*d+p*2,y=l[v],b=l[v+1],x=Xo(n,t,g,y,r);i[p]=Jo(x,o,_,b,m)}return i}};function Jo(e,t,n,r,i){let a=1-e;return a*a*a*t+3*a*a*e*n+3*a*e*e*r+e*e*e*i}function Yo(e,t,n,r,i){let a=1-e;return 3*a*a*(n-t)+6*a*e*(r-n)+3*e*e*(i-r)}function Xo(e,t,n,r,i){let a=(e-t)/(i-t);for(let o=0;o<8;o++){let o=Jo(a,t,n,r,i)-e;if(Math.abs(o)<1e-10)break;let s=Yo(a,t,n,r,i);if(Math.abs(s)<1e-10)break;a=Math.max(0,Math.min(1,a-o/s))}return a}var Zo=class{constructor(e,t,n,r){if(e===void 0)throw Error(`THREE.KeyframeTrack: track name is undefined`);if(t===void 0||t.length===0)throw Error(`THREE.KeyframeTrack: no keyframes in track named `+e);this.name=e,this.times=Vo(t,this.TimeBufferType),this.values=Vo(n,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Vo(e.times,Array),values:Vo(e.values,Array)};let t=e.getInterpolation();t!==e.DefaultInterpolation&&(n.interpolation=t),Ho(e.settings)&&(n.settings={inTangents:Vo(e.settings.inTangents,Array),outTangents:Vo(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Ko(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Go(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Wo(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new qo(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case Ae:t=this.InterpolantFactoryMethodDiscrete;break;case R:t=this.InterpolantFactoryMethodLinear;break;case je:t=this.InterpolantFactoryMethodSmooth;break;case Me:t=this.InterpolantFactoryMethodBezier}if(t===void 0){let t=`unsupported interpolation for `+this.ValueTypeName+` keyframe track named `+this.name;if(this.createInterpolant===void 0){if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw Error(t)}return V(`KeyframeTrack:`,t),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Ae;case this.InterpolantFactoryMethodLinear:return R;case this.InterpolantFactoryMethodSmooth:return je;case this.InterpolantFactoryMethodBezier:return Me}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]*=e;Ho(this.settings)&&(Qo(this.settings.inTangents,e),Qo(this.settings.outTangents,e))}return this}trim(e,t){let n=this.times,r=n.length,i=0,a=r-1;for(;i!==r&&n[i]<e;)++i;for(;a!==-1&&n[a]>t;)--a;if(++a,i!==0||a!==r){i>=a&&(a=Math.max(a,1),i=a-1);let e=this.getValueSize();this.times=n.slice(i,a),this.values=this.values.slice(i*e,a*e)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(H(`KeyframeTrack: Invalid value size in track.`,this),e=!1);let n=this.times,r=this.values,i=n.length;i===0&&(H(`KeyframeTrack: Track is empty.`,this),e=!1);let a=null;for(let t=0;t!==i;t++){let r=n[t];if(typeof r==`number`&&isNaN(r)){H(`KeyframeTrack: Time is not a valid number.`,this,t,r),e=!1;break}if(a!==null&&a>r){H(`KeyframeTrack: Out of order keys.`,this,t,r,a),e=!1;break}a=r}if(r!==void 0&&We(r))for(let t=0,n=r.length;t!==n;++t){let n=r[t];if(isNaN(n)){H(`KeyframeTrack: Value is not a valid number.`,this,t,n),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),r=this.getInterpolation()===je,i=e.length-1,a=1;for(let o=1;o<i;++o){let i=!1,s=e[o];if(s!==e[o+1]&&(o!==1||s!==e[0])){if(r)i=!0;else{let e=o*n,r=e-n,a=e+n;for(let o=0;o!==n;++o){let n=t[e+o];if(n!==t[r+o]||n!==t[a+o]){i=!0;break}}}}if(i){if(o!==a){e[a]=e[o];let r=o*n,i=a*n;for(let e=0;e!==n;++e)t[i+e]=t[r+e]}++a}}if(i>0){e[a]=e[i];for(let e=i*n,r=a*n,o=0;o!==n;++o)t[r+o]=t[e+o];++a}return a===e.length?(this.times=e,this.values=t):(this.times=e.slice(0,a),this.values=t.slice(0,a*n)),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,r=new n(this.name,e,t);return r.createInterpolant=this.createInterpolant,Ho(this.settings)&&(r.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),r}};function Qo(e,t){for(let n=0,r=e.length;n!==r;n+=2)e[n]*=t}Zo.prototype.ValueTypeName=``,Zo.prototype.TimeBufferType=Float32Array,Zo.prototype.ValueBufferType=Float32Array,Zo.prototype.DefaultInterpolation=R;var $o=class extends Zo{constructor(e,t,n){super(e,t,n)}};$o.prototype.ValueTypeName=`bool`,$o.prototype.ValueBufferType=Array,$o.prototype.DefaultInterpolation=Ae,$o.prototype.InterpolantFactoryMethodLinear=void 0,$o.prototype.InterpolantFactoryMethodSmooth=void 0;var es=class extends Zo{constructor(e,t,n,r){super(e,t,n,r)}};es.prototype.ValueTypeName=`color`;var ts=class extends Zo{constructor(e,t,n,r){super(e,t,n,r)}};ts.prototype.ValueTypeName=`number`;var ns=class extends Uo{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=(n-t)/(r-t),c=e*o;for(let e=c+o;c!==e;c+=4)G.slerpFlat(i,0,a,c-o,a,c,s);return i}},rs=class extends Zo{constructor(e,t,n,r){super(e,t,n,r)}InterpolantFactoryMethodLinear(e){return new ns(this.times,this.values,this.getValueSize(),e)}};rs.prototype.ValueTypeName=`quaternion`,rs.prototype.InterpolantFactoryMethodSmooth=void 0;var is=class extends Zo{constructor(e,t,n){super(e,t,n)}};is.prototype.ValueTypeName=`string`,is.prototype.ValueBufferType=Array,is.prototype.DefaultInterpolation=Ae,is.prototype.InterpolantFactoryMethodLinear=void 0,is.prototype.InterpolantFactoryMethodSmooth=void 0;var as=class extends Zo{constructor(e,t,n,r){super(e,t,n,r)}};as.prototype.ValueTypeName=`vector`;var os=class extends Cn{constructor(e,t=1){super(),this.isLight=!0,this.type=`Light`,this.color=new q(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},ss=class extends os{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type=`HemisphereLight`,this.position.copy(Cn.DEFAULT_UP),this.updateMatrix(),this.groundColor=new q(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},cs=new Yt,ls=new K,us=new K,ds=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new W(512,512),this.mapType=l,this.map=null,this.mapPass=null,this.matrix=new Yt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new ji,this._frameExtents=new W(1,1),this._viewportCount=1,this._viewports=[new Wt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera;ls.setFromMatrixPosition(e.matrixWorld),t.position.copy(ls),us.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(us),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,r){cs.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix(cs,e.coordinateSystem,e.reversedDepth);let i=this._frameExtents,a=r?r.z/i.x:1,o=r?r.w/i.y:1,s=r?r.x/i.x:0,c=r?r.y/i.y:0;e.coordinateSystem===2001||e.reversedDepth?t.set(.5*a,0,0,.5*a+s,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):t.set(.5*a,0,0,.5*a+s,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),t.multiply(cs)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},fs=new K,ps=new G,ms=new K,hs=class extends Cn{constructor(){super(),this.isCamera=!0,this.type=`Camera`,this.matrixWorldInverse=new Yt,this.projectionMatrix=new Yt,this.projectionMatrixInverse=new Yt,this.coordinateSystem=He,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(fs,ps,ms),ms.x===1&&ms.y===1&&ms.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(fs,ps,ms.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(fs,ps,ms),ms.x===1&&ms.y===1&&ms.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(fs,ps,ms.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},gs=new K,_s=new W,vs=new W,ys=class extends hs{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type=`PerspectiveCamera`,this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=rt*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(nt*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return rt*2*Math.atan(Math.tan(nt*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){gs.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(gs.x,gs.y).multiplyScalar(-e/gs.z),gs.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(gs.x,gs.y).multiplyScalar(-e/gs.z)}getViewSize(e,t){return this.getViewBounds(e,_s,vs),t.subVectors(vs,_s)}setViewOffset(e,t,n,r,i,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(nt*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,i=-.5*r,a=this.view;if(this.view!==null&&this.view.enabled){let e=a.fullWidth,o=a.fullHeight;i+=a.offsetX*r/e,t-=a.offsetY*n/o,r*=a.width/e,n*=a.height/o}let o=this.filmOffset;o!==0&&(i+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(i,i+r,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},bs=class extends hs{constructor(e=-1,t=1,n=1,r=-1,i=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type=`OrthographicCamera`,this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=i,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,i,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2,i=n-e,a=n+e,o=r+t,s=r-t;if(this.view!==null&&this.view.enabled){let e=(this.right-this.left)/this.view.fullWidth/this.zoom,t=(this.top-this.bottom)/this.view.fullHeight/this.zoom;i+=e*this.view.offsetX,a=i+e*this.view.width,o-=t*this.view.offsetY,s=o-t*this.view.height}this.projectionMatrix.makeOrthographic(i,a,o,s,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},xs=class extends ds{constructor(){super(new bs(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Ss=class extends os{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type=`DirectionalLight`,this.position.copy(Cn.DEFAULT_UP),this.updateMatrix(),this.target=new Cn,this.shadow=new xs}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}},Cs=-90,ws=1,Ts=class extends Cn{constructor(e,t,n){super(),this.type=`CubeCamera`,this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new ys(Cs,ws,e,t);r.layers=this.layers,this.add(r);let i=new ys(Cs,ws,e,t);i.layers=this.layers,this.add(i);let a=new ys(Cs,ws,e,t);a.layers=this.layers,this.add(a);let o=new ys(Cs,ws,e,t);o.layers=this.layers,this.add(o);let s=new ys(Cs,ws,e,t);s.layers=this.layers,this.add(s);let c=new ys(Cs,ws,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,r,i,a,o,s]=t;for(let e of t)this.remove(e);if(e===2e3)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),i.up.set(0,0,-1),i.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),s.up.set(0,1,0),s.lookAt(0,0,-1);else if(e===2001)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),i.up.set(0,0,1),i.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),s.up.set(0,-1,0),s.lookAt(0,0,-1);else throw Error(`THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: `+e);for(let e of t)this.add(e),e.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[i,a,o,s,c,l]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),p=e.xr.enabled;e.xr.enabled=!1;let m=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let h=!1;h=e.isWebGLRenderer===!0?e.state.buffers.depth.getReversed():e.reversedDepthBuffer,e.setRenderTarget(n,0,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,i),e.setRenderTarget(n,1,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,s),e.setRenderTarget(n,4,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.generateMipmaps=m,e.setRenderTarget(n,5,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(u,d,f),e.xr.enabled=p,n.texture.needsPMREMUpdate=!0}},Es=class extends ys{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}},Ds=`\\[\\]\\.:\\/`,Os=RegExp(`[\\[\\]\\.:\\/]`,`g`),ks=`[^\\[\\]\\.:\\/]`,As=`[^`+Ds.replace(`\\.`,``)+`]`,js=`((?:WC+[\\/:])*)`.replace(`WC`,ks),Ms=`(WCOD+)?`.replace(`WCOD`,As),Ns=`(?:\\.(WC+)(?:\\[(.+)\\])?)?`.replace(`WC`,ks),Ps=`\\.(WC+)(?:\\[(.+)\\])?`.replace(`WC`,ks),Fs=RegExp(`^`+js+Ms+Ns+Ps+`$`),Is=[`material`,`materials`,`bones`,`map`],Ls=class{constructor(e,t,n){let r=n||Rs.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,r=this._bindings[n];r!==void 0&&r.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let r=this._targetGroup.nCachedObjects_,i=n.length;r!==i;++r)n[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},Rs=class e{constructor(t,n,r){this.path=n,this.parsedPath=r||e.parseTrackName(n),this.node=e.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,n,r){return t&&t.isAnimationObjectGroup?new e.Composite(t,n,r):new e(t,n,r)}static sanitizeNodeName(e){return e.replace(/\s/g,`_`).replace(Os,``)}static parseTrackName(e){let t=Fs.exec(e);if(t===null)throw Error(`THREE.PropertyBinding: Cannot parse trackName: `+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=n.nodeName&&n.nodeName.lastIndexOf(`.`);if(r!==void 0&&r!==-1){let e=n.nodeName.substring(r+1);Is.indexOf(e)!==-1&&(n.nodeName=n.nodeName.substring(0,r),n.objectName=e)}if(n.propertyName===null||n.propertyName.length===0)throw Error(`THREE.PropertyBinding: can not parse propertyName from trackName: `+e);return n}static findNode(e,t){if(t===void 0||t===``||t===`.`||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(e){for(let r=0;r<e.length;r++){let i=e[r];if(i.name===t||i.uuid===t)return i;let a=n(i.children);if(a)return a}return null},r=n(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)e[t++]=n[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let t=this.node,n=this.parsedPath,r=n.objectName,i=n.propertyName,a=n.propertyIndex;if(t||(t=e.findNode(this.rootNode,n.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){V(`PropertyBinding: No target node found for track: `+this.path+`.`);return}if(r){let e=n.objectIndex;switch(r){case`materials`:if(!t.material){H(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.materials){H(`PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.`,this);return}t=t.material.materials;break;case`bones`:if(!t.skeleton){H(`PropertyBinding: Can not bind to bones as node does not have a skeleton.`,this);return}t=t.skeleton.bones;for(let n=0;n<t.length;n++)if(t[n].name===e){e=n;break}break;case`map`:if(`map`in t){t=t.map;break}if(!t.material){H(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.map){H(`PropertyBinding: Can not bind to material.map as node.material does not have a map.`,this);return}t=t.material.map;break;default:if(t[r]===void 0){H(`PropertyBinding: Can not bind to objectName of node undefined.`,this);return}t=t[r]}if(e!==void 0){if(t[e]===void 0){H(`PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.`,this,t);return}t=t[e]}}let o=t[i];if(o===void 0){let e=n.nodeName;H(`PropertyBinding: Trying to update property for track: `+e+`.`+i+` but it wasn't found.`,t);return}let s=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?s=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(s=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(a!==void 0){if(i===`morphTargetInfluences`){if(!t.geometry){H(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.`,this);return}if(!t.geometry.morphAttributes){H(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.`,this);return}t.morphTargetDictionary[a]!==void 0&&(a=t.morphTargetDictionary[a])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=a}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=i;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][s]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Rs.Composite=Ls,Rs.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3},Rs.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2},Rs.prototype.GetterByBindingType=[Rs.prototype._getValue_direct,Rs.prototype._getValue_array,Rs.prototype._getValue_arrayElement,Rs.prototype._getValue_toArray],Rs.prototype.SetterByBindingTypeAndVersioning=[[Rs.prototype._setValue_direct,Rs.prototype._setValue_direct_setNeedsUpdate,Rs.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Rs.prototype._setValue_array,Rs.prototype._setValue_array_setNeedsUpdate,Rs.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Rs.prototype._setValue_arrayElement,Rs.prototype._setValue_arrayElement_setNeedsUpdate,Rs.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Rs.prototype._setValue_fromArray,Rs.prototype._setValue_fromArray_setNeedsUpdate,Rs.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var zs=new Yt,Bs=class{constructor(e,t,n=0,r=1/0){this.ray=new ri(e,t),this.near=n,this.far=r,this.camera=null,this.layers=new sn,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,t.projectionMatrix.elements[14]).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):H(`Raycaster: Unsupported camera type: `+t.type)}setFromXRController(e){return zs.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(zs),this}intersectObject(e,t=!0,n=[]){return Hs(e,this,n,t),n.sort(Vs),n}intersectObjects(e,t=!0,n=[]){for(let r=0,i=e.length;r<i;r++)Hs(e[r],this,n,t);return n.sort(Vs),n}};function Vs(e,t){return e.distance-t.distance}function Hs(e,t,n,r){let i=!0;if(e.layers.test(t.layers)&&e.raycast(t,n)===!1&&(i=!1),i===!0&&r===!0){let r=e.children;for(let e=0,i=r.length;e<i;e++)Hs(r[e],t,n,!0)}}(class e{static{e.prototype.isMatrix2=!0}constructor(e,t,n,r){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,r)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,r){let i=this.elements;return i[0]=e,i[2]=t,i[1]=n,i[3]=r,this}});function Us(e,t,n,r){let i=Ws(r);switch(n){case S:return e*t;case D:return e*t/i.components*i.byteLength;case O:return e*t/i.components*i.byteLength;case k:return e*t*2/i.components*i.byteLength;case A:return e*t*2/i.components*i.byteLength;case C:return e*t*3/i.components*i.byteLength;case w:return e*t*4/i.components*i.byteLength;case j:return e*t*4/i.components*i.byteLength;case M:case ee:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case N:case te:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case ne:case re:return Math.max(e,16)*Math.max(t,8)/4;case P:case F:return Math.max(e,8)*Math.max(t,8)/2;case ie:case I:case oe:case L:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case ae:case se:case ce:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case le:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case ue:return Math.floor((e+4)/5)*Math.floor((t+3)/4)*16;case de:return Math.floor((e+4)/5)*Math.floor((t+4)/5)*16;case fe:return Math.floor((e+5)/6)*Math.floor((t+4)/5)*16;case pe:return Math.floor((e+5)/6)*Math.floor((t+5)/6)*16;case me:return Math.floor((e+7)/8)*Math.floor((t+4)/5)*16;case he:return Math.floor((e+7)/8)*Math.floor((t+5)/6)*16;case ge:return Math.floor((e+7)/8)*Math.floor((t+7)/8)*16;case _e:return Math.floor((e+9)/10)*Math.floor((t+4)/5)*16;case ve:return Math.floor((e+9)/10)*Math.floor((t+5)/6)*16;case ye:return Math.floor((e+9)/10)*Math.floor((t+7)/8)*16;case be:return Math.floor((e+9)/10)*Math.floor((t+9)/10)*16;case xe:return Math.floor((e+11)/12)*Math.floor((t+9)/10)*16;case Se:return Math.floor((e+11)/12)*Math.floor((t+11)/12)*16;case Ce:case we:case Te:return Math.ceil(e/4)*Math.ceil(t/4)*16;case Ee:case De:return Math.ceil(e/4)*Math.ceil(t/4)*8;case Oe:case ke:return Math.ceil(e/4)*Math.ceil(t/4)*16}throw Error(`Unable to determine texture byte length for ${n} format.`)}function Ws(e){switch(e){case l:case u:return{byteLength:1,components:1};case f:case d:case g:return{byteLength:2,components:1};case _:case v:return{byteLength:2,components:4};case m:case p:case h:return{byteLength:4,components:1};case b:case x:return{byteLength:4,components:3}}throw Error(`THREE.TextureUtils: Unknown texture type ${e}.`)}typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`register`,{detail:{revision:`186`}})),typeof window<`u`&&(window.__THREE__?V(`WARNING: Multiple instances of Three.js being imported.`):window.__THREE__=`186`);function Gs(){let e=null,t=!1,n=null,r=null;function i(t,a){r=e.requestAnimationFrame(i),n(t,a)}return{start:function(){t!==!0&&n!==null&&e!==null&&(r=e.requestAnimationFrame(i),t=!0)},stop:function(){e!==null&&e.cancelAnimationFrame(r),t=!1},setAnimationLoop:function(e){n=e},setContext:function(t){e=t}}}function Ks(e){let t=new WeakMap;function n(t,n){let r=t.array,i=t.usage,a=r.byteLength,o=e.createBuffer();e.bindBuffer(n,o),e.bufferData(n,r,i),t.onUploadCallback();let s;if(r instanceof Float32Array)s=e.FLOAT;else if(typeof Float16Array<`u`&&r instanceof Float16Array)s=e.HALF_FLOAT;else if(r instanceof Uint16Array)s=t.isFloat16BufferAttribute?e.HALF_FLOAT:e.UNSIGNED_SHORT;else if(r instanceof Int16Array)s=e.SHORT;else if(r instanceof Uint32Array)s=e.UNSIGNED_INT;else if(r instanceof Int32Array)s=e.INT;else if(r instanceof Int8Array)s=e.BYTE;else if(r instanceof Uint8Array)s=e.UNSIGNED_BYTE;else if(r instanceof Uint8ClampedArray)s=e.UNSIGNED_BYTE;else throw Error(`THREE.WebGLAttributes: Unsupported buffer data format: `+r);return{buffer:o,type:s,bytesPerElement:r.BYTES_PER_ELEMENT,version:t.version,size:a}}function r(t,n,r){let i=n.array,a=n.updateRanges;if(e.bindBuffer(r,t),a.length===0)e.bufferSubData(r,0,i);else{a.sort((e,t)=>e.start-t.start);let t=0;for(let e=1;e<a.length;e++){let n=a[t],r=a[e];r.start<=n.start+n.count+1?n.count=Math.max(n.count,r.start+r.count-n.start):(++t,a[t]=r)}a.length=t+1;for(let t=0,n=a.length;t<n;t++){let n=a[t];e.bufferSubData(r,n.start*i.BYTES_PER_ELEMENT,i,n.start,n.count)}n.clearUpdateRanges()}n.onUploadCallback()}function i(e){return e.isInterleavedBufferAttribute&&(e=e.data),t.get(e)}function a(n){n.isInterleavedBufferAttribute&&(n=n.data);let r=t.get(n);r&&(e.deleteBuffer(r.buffer),t.delete(n))}function o(e,i){if(e.isInterleavedBufferAttribute&&(e=e.data),e.isGLBufferAttribute){let n=t.get(e);(!n||n.version<e.version)&&t.set(e,{buffer:e.buffer,type:e.type,bytesPerElement:e.elementSize,version:e.version});return}let a=t.get(e);if(a===void 0)t.set(e,n(e,i));else if(a.version<e.version){if(a.size!==e.array.byteLength)throw Error(`THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.`);r(a.buffer,e,i),a.version=e.version}}return{get:i,remove:a,update:o}}var qs={alphahash_fragment:`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,alphahash_pars_fragment:`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,alphamap_fragment:`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,alphamap_pars_fragment:`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,alphatest_fragment:`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,alphatest_pars_fragment:`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,aomap_fragment:`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,aomap_pars_fragment:`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,batching_pars_vertex:`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,batching_vertex:`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,begin_vertex:`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,beginnormal_vertex:`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,bsdfs:`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,iridescence_fragment:`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,bumpmap_pars_fragment:`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,clipping_planes_fragment:`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,clipping_planes_pars_fragment:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,clipping_planes_pars_vertex:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,clipping_planes_vertex:`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,color_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,color_pars_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,color_pars_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,color_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,common:`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,cube_uv_reflection_fragment:`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,defaultnormal_vertex:`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,displacementmap_pars_vertex:`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,displacementmap_vertex:`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,emissivemap_fragment:`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,emissivemap_pars_fragment:`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,colorspace_fragment:`gl_FragColor = linearToOutputTexel( gl_FragColor );`,colorspace_pars_fragment:`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,envmap_fragment:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,envmap_common_pars_fragment:`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,envmap_pars_fragment:`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,envmap_pars_vertex:`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,envmap_physical_pars_fragment:`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureCubeUV( envMap, envMapRotation * retroVec, roughness );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_CUBE_UV
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,envmap_vertex:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,fog_vertex:`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,fog_pars_vertex:`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,fog_fragment:`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,fog_pars_fragment:`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,gradientmap_pars_fragment:`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,lightmap_pars_fragment:`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,lights_lambert_fragment:`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,lights_lambert_pars_fragment:`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,lights_pars_begin:`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,lights_toon_fragment:`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,lights_toon_pars_fragment:`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,lights_phong_fragment:`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,lights_phong_pars_fragment:`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,lights_physical_fragment:`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,lights_physical_pars_fragment:`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,lights_fragment_begin:`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,lights_fragment_maps:`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,lights_fragment_end:`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,lightprobes_pars_fragment:`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,logdepthbuf_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,logdepthbuf_pars_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_pars_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,map_fragment:`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,map_pars_fragment:`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,map_particle_fragment:`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,map_particle_pars_fragment:`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,metalnessmap_fragment:`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,metalnessmap_pars_fragment:`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,morphinstance_vertex:`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,morphcolor_vertex:`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,morphnormal_vertex:`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,morphtarget_pars_vertex:`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,morphtarget_vertex:`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,normal_fragment_begin:`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,normal_fragment_maps:`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,normal_pars_fragment:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_pars_vertex:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_vertex:`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,normalmap_pars_fragment:`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,clearcoat_normal_fragment_begin:`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,clearcoat_normal_fragment_maps:`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,clearcoat_pars_fragment:`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,iridescence_pars_fragment:`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,opaque_fragment:`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,packing:`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,premultiplied_alpha_fragment:`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,project_vertex:`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,dithering_fragment:`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,dithering_pars_fragment:`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,roughnessmap_fragment:`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,roughnessmap_pars_fragment:`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,shadowmap_pars_fragment:`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,shadowmap_pars_vertex:`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,shadowmap_vertex:`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,shadowmask_pars_fragment:`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,skinbase_vertex:`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,skinning_pars_vertex:`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,skinning_vertex:`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,skinnormal_vertex:`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,specularmap_fragment:`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,specularmap_pars_fragment:`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,tonemapping_fragment:`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tonemapping_pars_fragment:`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,transmission_fragment:`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,transmission_pars_fragment:`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,uv_pars_fragment:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_pars_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,worldpos_vertex:`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,background_vert:`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,background_frag:`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,backgroundCube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,backgroundCube_frag:`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cube_frag:`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,depth_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,depth_frag:`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,distance_vert:`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,distance_frag:`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,equirect_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,equirect_frag:`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,linedashed_vert:`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,linedashed_frag:`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,meshbasic_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,meshbasic_frag:`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshlambert_vert:`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshlambert_frag:`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshmatcap_vert:`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,meshmatcap_frag:`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshnormal_vert:`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,meshnormal_frag:`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,meshphong_vert:`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshphong_frag:`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshphysical_vert:`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,meshphysical_frag:`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshtoon_vert:`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshtoon_frag:`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,points_vert:`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,points_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,shadow_vert:`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,shadow_frag:`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,sprite_vert:`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,sprite_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`},Y={common:{diffuse:{value:new q(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ot},alphaMap:{value:null},alphaMapTransform:{value:new Ot},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ot}},envmap:{envMap:{value:null},envMapRotation:{value:new Ot},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ot}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ot}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ot},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ot},normalScale:{value:new W(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ot},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ot}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ot}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ot}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new q(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new K},probesMax:{value:new K},probesResolution:{value:new K}},points:{diffuse:{value:new q(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ot},alphaTest:{value:0},uvTransform:{value:new Ot}},sprite:{diffuse:{value:new q(16777215)},opacity:{value:1},center:{value:new W(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ot},alphaMap:{value:null},alphaMapTransform:{value:new Ot},alphaTest:{value:0}}},Js={basic:{uniforms:Oo([Y.common,Y.specularmap,Y.envmap,Y.aomap,Y.lightmap,Y.fog]),vertexShader:qs.meshbasic_vert,fragmentShader:qs.meshbasic_frag},lambert:{uniforms:Oo([Y.common,Y.specularmap,Y.envmap,Y.aomap,Y.lightmap,Y.emissivemap,Y.bumpmap,Y.normalmap,Y.displacementmap,Y.fog,Y.lights,{emissive:{value:new q(0)},envMapIntensity:{value:1}}]),vertexShader:qs.meshlambert_vert,fragmentShader:qs.meshlambert_frag},phong:{uniforms:Oo([Y.common,Y.specularmap,Y.envmap,Y.aomap,Y.lightmap,Y.emissivemap,Y.bumpmap,Y.normalmap,Y.displacementmap,Y.fog,Y.lights,{emissive:{value:new q(0)},specular:{value:new q(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:qs.meshphong_vert,fragmentShader:qs.meshphong_frag},standard:{uniforms:Oo([Y.common,Y.envmap,Y.aomap,Y.lightmap,Y.emissivemap,Y.bumpmap,Y.normalmap,Y.displacementmap,Y.roughnessmap,Y.metalnessmap,Y.fog,Y.lights,{emissive:{value:new q(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:qs.meshphysical_vert,fragmentShader:qs.meshphysical_frag},toon:{uniforms:Oo([Y.common,Y.aomap,Y.lightmap,Y.emissivemap,Y.bumpmap,Y.normalmap,Y.displacementmap,Y.gradientmap,Y.fog,Y.lights,{emissive:{value:new q(0)}}]),vertexShader:qs.meshtoon_vert,fragmentShader:qs.meshtoon_frag},matcap:{uniforms:Oo([Y.common,Y.bumpmap,Y.normalmap,Y.displacementmap,Y.fog,{matcap:{value:null}}]),vertexShader:qs.meshmatcap_vert,fragmentShader:qs.meshmatcap_frag},points:{uniforms:Oo([Y.points,Y.fog]),vertexShader:qs.points_vert,fragmentShader:qs.points_frag},dashed:{uniforms:Oo([Y.common,Y.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:qs.linedashed_vert,fragmentShader:qs.linedashed_frag},depth:{uniforms:Oo([Y.common,Y.displacementmap]),vertexShader:qs.depth_vert,fragmentShader:qs.depth_frag},normal:{uniforms:Oo([Y.common,Y.bumpmap,Y.normalmap,Y.displacementmap,{opacity:{value:1}}]),vertexShader:qs.meshnormal_vert,fragmentShader:qs.meshnormal_frag},sprite:{uniforms:Oo([Y.sprite,Y.fog]),vertexShader:qs.sprite_vert,fragmentShader:qs.sprite_frag},background:{uniforms:{uvTransform:{value:new Ot},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:qs.background_vert,fragmentShader:qs.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ot}},vertexShader:qs.backgroundCube_vert,fragmentShader:qs.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:qs.cube_vert,fragmentShader:qs.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:qs.equirect_vert,fragmentShader:qs.equirect_frag},distance:{uniforms:Oo([Y.common,Y.displacementmap,{referencePosition:{value:new K},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:qs.distance_vert,fragmentShader:qs.distance_frag},shadow:{uniforms:Oo([Y.lights,Y.fog,{color:{value:new q(0)},opacity:{value:1}}]),vertexShader:qs.shadow_vert,fragmentShader:qs.shadow_frag}};Js.physical={uniforms:Oo([Js.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ot},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ot},clearcoatNormalScale:{value:new W(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ot},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ot},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ot},sheen:{value:0},sheenColor:{value:new q(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ot},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ot},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ot},transmissionSamplerSize:{value:new W},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ot},attenuationDistance:{value:0},attenuationColor:{value:new q(0)},specularColor:{value:new q(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ot},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ot},anisotropyVector:{value:new W},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ot}}]),vertexShader:qs.meshphysical_vert,fragmentShader:qs.meshphysical_frag};var Ys={r:0,b:0,g:0},Xs=new Yt,Zs=new Ot;Zs.set(-1,0,0,0,1,0,0,0,1);function Qs(e,t,n,r,i,a){let o=new q(0),s=i===!0?0:1,c,l,u=null,d=0,f=null;function p(e){let n=e.isScene===!0?e.background:null;if(n&&n.isTexture){let r=e.backgroundBlurriness>0;n=t.get(n,r)}return n}function m(t){let r=!1,i=p(t);i===null?g(o,s):i&&i.isColor&&(g(i,1),r=!0);let c=e.xr.getEnvironmentBlendMode();c===`additive`?n.buffers.color.setClear(0,0,0,1,a):c===`alpha-blend`&&n.buffers.color.setClear(0,0,0,0,a),(e.autoClear||r)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function h(t,n){let i=p(n);i&&(i.isCubeTexture||i.mapping===306)?(l===void 0&&(l=new J(new Zi(1,1,1),new Fo({name:`BackgroundCubeMaterial`,uniforms:Do(Js.backgroundCube.uniforms),vertexShader:Js.backgroundCube.vertexShader,fragmentShader:Js.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute(`normal`),l.geometry.deleteAttribute(`uv`),l.onBeforeRender=function(e,t,n){this.matrixWorld.copyPosition(n.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(l)),l.material.uniforms.envMap.value=i,l.material.uniforms.backgroundBlurriness.value=n.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(Xs.makeRotationFromEuler(n.backgroundRotation)).transpose(),i.isCubeTexture&&i.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply(Zs),l.material.toneMapped=Nt.getTransfer(i.colorSpace)!==Re,(u!==i||d!==i.version||f!==e.toneMapping)&&(l.material.needsUpdate=!0,u=i,d=i.version,f=e.toneMapping),l.layers.enableAll(),t.unshift(l,l.geometry,l.material,0,0,null)):i&&i.isTexture&&(c===void 0&&(c=new J(new Co(2,2),new Fo({name:`BackgroundMaterial`,uniforms:Do(Js.background.uniforms),vertexShader:Js.background.vertexShader,fragmentShader:Js.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute(`normal`),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=i,c.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,c.material.toneMapped=Nt.getTransfer(i.colorSpace)!==Re,i.matrixAutoUpdate===!0&&i.updateMatrix(),c.material.uniforms.uvTransform.value.copy(i.matrix),(u!==i||d!==i.version||f!==e.toneMapping)&&(c.material.needsUpdate=!0,u=i,d=i.version,f=e.toneMapping),c.layers.enableAll(),t.unshift(c,c.geometry,c.material,0,0,null))}function g(t,r){t.getRGB(Ys,jo(e)),n.buffers.color.setClear(Ys.r,Ys.g,Ys.b,r,a)}function _(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return o},setClearColor:function(e,t=1){o.set(e),s=t,g(o,s)},getClearAlpha:function(){return s},setClearAlpha:function(e){s=e,g(o,s)},render:m,addToRenderList:h,dispose:_}}function $s(e,t){let n=e.getParameter(e.MAX_VERTEX_ATTRIBS),r={},i=f(null),a=i,o=!1;function s(n,r,i,s,c){let u=!1,f=d(n,s,i,r);a!==f&&(a=f,l(a.object)),u=p(n,s,i,c),u&&m(n,s,i,c),c!==null&&t.update(c,e.ELEMENT_ARRAY_BUFFER),(u||o)&&(o=!1,b(n,r,i,s),c!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(c).buffer))}function c(){return e.createVertexArray()}function l(t){return e.bindVertexArray(t)}function u(t){return e.deleteVertexArray(t)}function d(e,t,n,i){let a=i.wireframe===!0,o=r[t.id];o===void 0&&(o={},r[t.id]=o);let s=e.isInstancedMesh===!0?e.id:0,l=o[s];l===void 0&&(l={},o[s]=l);let u=l[n.id];u===void 0&&(u={},l[n.id]=u);let d=u[a];return d===void 0&&(d=f(c()),u[a]=d),d}function f(e){let t=[],r=[],i=[];for(let e=0;e<n;e++)t[e]=0,r[e]=0,i[e]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:t,enabledAttributes:r,attributeDivisors:i,object:e,attributes:{},index:null}}function p(e,t,n,r){let i=a.attributes,o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=i[t],r=o[t];if(r===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(r=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(r=e.instanceColor)),n===void 0||n.attribute!==r||r&&n.data!==r.data)return!0;s++}return a.attributesNum!==s||a.index!==r}function m(e,t,n,r){let i={},o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=o[t];n===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(n=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(n=e.instanceColor));let r={};r.attribute=n,n&&n.data&&(r.data=n.data),i[t]=r,s++}a.attributes=i,a.attributesNum=s,a.index=r}function h(){let e=a.newAttributes;for(let t=0,n=e.length;t<n;t++)e[t]=0}function g(e){_(e,0)}function _(t,n){let r=a.newAttributes,i=a.enabledAttributes,o=a.attributeDivisors;r[t]=1,i[t]===0&&(e.enableVertexAttribArray(t),i[t]=1),o[t]!==n&&(e.vertexAttribDivisor(t,n),o[t]=n)}function v(){let t=a.newAttributes,n=a.enabledAttributes;for(let r=0,i=n.length;r<i;r++)n[r]!==t[r]&&(e.disableVertexAttribArray(r),n[r]=0)}function y(t,n,r,i,a,o,s){s===!0?e.vertexAttribIPointer(t,n,r,a,o):e.vertexAttribPointer(t,n,r,i,a,o)}function b(n,r,i,a){h();let o=a.attributes,s=i.getAttributes(),c=r.defaultAttributeValues;for(let r in s){let i=s[r];if(i.location>=0){let s=o[r];if(s===void 0&&(r===`instanceMatrix`&&n.instanceMatrix&&(s=n.instanceMatrix),r===`instanceColor`&&n.instanceColor&&(s=n.instanceColor)),s!==void 0){let r=s.normalized,o=s.itemSize,c=t.get(s);if(c===void 0)continue;let l=c.buffer,u=c.type,d=c.bytesPerElement,f=u===e.INT||u===e.UNSIGNED_INT||s.gpuType===1013;if(s.isInterleavedBufferAttribute){let t=s.data,c=t.stride,p=s.offset;if(t.isInstancedInterleavedBuffer){for(let e=0;e<i.locationSize;e++)_(i.location+e,t.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=t.meshPerAttribute*t.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,c*d,(p+o/i.locationSize*e)*d,f)}else{if(s.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,s.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=s.meshPerAttribute*s.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,o*d,o/i.locationSize*e*d,f)}}else if(c!==void 0){let t=c[r];if(t!==void 0)switch(t.length){case 2:e.vertexAttrib2fv(i.location,t);break;case 3:e.vertexAttrib3fv(i.location,t);break;case 4:e.vertexAttrib4fv(i.location,t);break;default:e.vertexAttrib1fv(i.location,t)}}}}v()}function x(){T();for(let e in r){let t=r[e];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e]}}function S(e){if(r[e.id]===void 0)return;let t=r[e.id];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e.id]}function C(e){for(let t in r){let n=r[t];for(let t in n){let r=n[t];if(r[e.id]===void 0)continue;let i=r[e.id];for(let e in i)u(i[e].object),delete i[e];delete r[e.id]}}}function w(e){for(let t in r){let n=r[t],i=e.isInstancedMesh===!0?e.id:0,a=n[i];if(a!==void 0){for(let e in a){let t=a[e];for(let e in t)u(t[e].object),delete t[e];delete a[e]}delete n[i],Object.keys(n).length===0&&delete r[t]}}}function T(){E(),o=!0,a!==i&&(a=i,l(a.object))}function E(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:s,reset:T,resetDefaultState:E,dispose:x,releaseStatesOfGeometry:S,releaseStatesOfObject:w,releaseStatesOfProgram:C,initAttributes:h,enableAttribute:g,disableUnusedAttributes:v}}function ec(e,t,n){let r;function i(e){r=e}function a(t,i){e.drawArrays(r,t,i),n.update(i,r,1)}function o(t,i,a){a!==0&&(e.drawArraysInstanced(r,t,i,a),n.update(i,r,a))}function s(e,i,a){if(a===0)return;t.get(`WEBGL_multi_draw`).multiDrawArraysWEBGL(r,e,0,i,0,a);let o=0;for(let e=0;e<a;e++)o+=i[e];n.update(o,r,1)}this.setMode=i,this.render=a,this.renderInstances=o,this.renderMultiDraw=s}function tc(e,t,n,r){let i;function a(){if(i!==void 0)return i;if(t.has(`EXT_texture_filter_anisotropic`)===!0){let n=t.get(`EXT_texture_filter_anisotropic`);i=e.getParameter(n.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(t){return t===1023||r.convert(t)===e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT)}function s(n){let i=n===1016&&(t.has(`EXT_color_buffer_half_float`)||t.has(`EXT_color_buffer_float`));return!(n!==1009&&n!==1015&&!i&&r.convert(n)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE))}function c(t){if(t===`highp`){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return`highp`;t=`mediump`}return t===`mediump`&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?`mediump`:`lowp`}let l=n.precision===void 0?`highp`:n.precision,u=c(l);u!==l&&(V(`WebGLRenderer:`,l,`not supported, using`,u,`instead.`),l=u);let d=n.logarithmicDepthBuffer===!0,f=n.reversedDepthBuffer===!0&&t.has(`EXT_clip_control`);n.reversedDepthBuffer===!0&&f===!1&&V(`WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.`);let p=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),m=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),h=e.getParameter(e.MAX_TEXTURE_SIZE),g=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),_=e.getParameter(e.MAX_VERTEX_ATTRIBS),v=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),y=e.getParameter(e.MAX_VARYING_VECTORS),b=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),x=e.getParameter(e.MAX_SAMPLES),S=e.getParameter(e.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:s,precision:l,logarithmicDepthBuffer:d,reversedDepthBuffer:f,maxTextures:p,maxVertexTextures:m,maxTextureSize:h,maxCubemapSize:g,maxAttributes:_,maxVertexUniforms:v,maxVaryings:y,maxFragmentUniforms:b,maxSamples:x,samples:S}}function nc(e){let t=this,n=null,r=0,i=!1,a=!1,o=new Pr,s=new Ot,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(e,t){let n=e.length!==0||t||r!==0||i;return i=t,r=e.length,n},this.beginShadows=function(){a=!0,u(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(e,t){n=u(e,t,0)},this.setState=function(t,o,s){let d=t.clippingPlanes,f=t.clipIntersection,p=t.clipShadows,m=e.get(t);if(!i||d===null||d.length===0||a&&!p)a?u(null):l();else{let e=a?0:r,t=e*4,i=m.clippingState||null;c.value=i,i=u(d,o,t,s);for(let e=0;e!==t;++e)i[e]=n[e];m.clippingState=i,this.numIntersection=f?this.numPlanes:0,this.numPlanes+=e}};function l(){c.value!==n&&(c.value=n,c.needsUpdate=r>0),t.numPlanes=r,t.numIntersection=0}function u(e,n,r,i){let a=e===null?0:e.length,l=null;if(a!==0){if(l=c.value,i!==!0||l===null){let t=r+a*4,i=n.matrixWorldInverse;s.getNormalMatrix(i),(l===null||l.length<t)&&(l=new Float32Array(t));for(let t=0,n=r;t!==a;++t,n+=4)o.copy(e[t]).applyMatrix4(i,s),o.normal.toArray(l,n),l[n+3]=o.constant}c.value=l,c.needsUpdate=!0}return t.numPlanes=a,t.numIntersection=0,l}}var rc=4,ic=6,ac=20,oc=256,sc=new bs,cc=new q,lc=null,uc=0,dc=0,fc=!1,pc=new K,mc=new K,hc=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,r=100,i={}){let{size:a=256,position:o=pc}=i;lc=this._renderer.getRenderTarget(),uc=this._renderer.getActiveCubeFace(),dc=this._renderer.getActiveMipmapLevel(),fc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,n,r,s,o),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Sc(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=xc(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=2**this._lodMax}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(lc,uc,dc),this._renderer.xr.enabled=fc,e.scissorTest=!1,vc(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===301||e.mapping===302?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),lc=this._renderer.getRenderTarget(),uc=this._renderer.getActiveCubeFace(),dc=this._renderer.getActiveMipmapLevel(),fc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:o,minFilter:o,generateMipmaps:!1,type:g,format:w,colorSpace:Ie,depthBuffer:!1},r=_c(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=_c(e,t,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=gc(r)),this._blurMaterial=bc(r,e,t),this._ggxMaterial=yc(r,e,t)}return r}_compileMaterial(e){let t=new J(new Dr,e);this._renderer.compile(t,sc)}_sceneToCubeUV(e,t,n,r,i){let a=new ys(90,1,t,n),o=[1,-1,1,1,1,1],s=[1,1,1,-1,-1,-1],c=this._renderer,l=c.autoClear,u=c.toneMapping;c.getClearColor(cc),c.toneMapping=0,c.autoClear=!1,c.state.buffers.depth.getReversed()&&(c.setRenderTarget(r),c.clearDepth(),c.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new J(new Zi,new ii({name:`PMREM.Background`,side:1,depthWrite:!1,depthTest:!1})));let d=this._backgroundBox,f=d.material,p=!1,m=e.background;m?m.isColor&&(f.color.copy(m),e.background=null,p=!0):(f.color.copy(cc),p=!0);for(let t=0;t<6;t++){let n=t%3;n===0?(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x+s[t],i.y,i.z)):n===1?(a.up.set(0,0,o[t]),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y+s[t],i.z)):(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y,i.z+s[t]));let l=this._cubeSize;vc(r,n*l,t>2?l:0,l,l),c.setRenderTarget(r),p&&c.render(d,a),c.render(e,a)}c.toneMapping=u,c.autoClear=l,e.background=m}_textureToCubeUV(e,t){let n=this._renderer,r=e.mapping===301||e.mapping===302;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=Sc()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=xc());let i=r?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=i;let o=i.uniforms;o.envMap.value=e;let s=this._cubeSize;vc(t,0,0,3*s,2*s),n.setRenderTarget(t),n.render(a,sc)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let r=this._lodMeshes.length;for(let t=1;t<r;t++)this._applyGGXFilter(e,t-1,t);t.autoClear=n}_applyGGXFilter(e,t,n){let r=this._renderer,i=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[n];o.material=a;let s=a.uniforms,c=n/(this._lodMeshes.length-1),l=t/(this._lodMeshes.length-1),u=Math.sqrt(c*c-l*l)*(c*1.25),{_lodMax:d}=this,f=this._sizeLods[n],p=3*f*(n>d-rc?n-d+rc:0),m=4*(this._cubeSize-f);s.envMap.value=e.texture,s.roughness.value=u,s.mipInt.value=d-t,vc(i,p,m,3*f,2*f),r.setRenderTarget(i),r.render(o,sc),s.envMap.value=i.texture,s.roughness.value=0,s.mipInt.value=d-n,vc(e,p,m,3*f,2*f),r.setRenderTarget(e),r.render(o,sc)}_blur(e,t,n,r){let i=this._pingPongRenderTarget,a=Math.min(r,Math.PI)/Math.SQRT2;this._blurPass(e,i,t,n,a),this._blurPass(i,e,n,n,a)}_blurPass(e,t,n,r,i){let a=this._renderer,o=this._blurMaterial,s=this._lodMeshes[r];s.material=o;let c=o.uniforms;c.envMap.value=e.texture,c.sigma.value=i,c.mipInt.value=this._lodMax-n;let l=this._sizeLods[r];vc(t,3*l*(r>this._lodMax-rc?r-this._lodMax+rc:0),4*(this._cubeSize-l),3*l,2*l),a.setRenderTarget(t),a.render(s,sc)}};function gc(e){let t=[],n=[],r=e,i=e-rc+1+ic;for(let e=0;e<i;e++){let e=2**r;t.push(e);let i=1/(e-2),a=-i,o=1+i,s=[a,a,o,a,o,o,a,a,o,o,a,o],c=new Float32Array(108),l=new Float32Array(108);for(let e=0;e<6;e++){let t=e%3*2/3-1,n=e>2?0:-1,r=[t,n,0,t+2/3,n,0,t+2/3,n+1,0,t,n,0,t+2/3,n+1,0,t,n+1,0];c.set(r,18*e);for(let t=0;t<6;t++){let n=s[t*2]*2-1,r=s[t*2+1]*2-1;e===0?mc.set(1,r,n):e===1?mc.set(-n,1,-r):e===2?mc.set(-n,r,1):e===3?mc.set(-1,r,-n):e===4?mc.set(-n,-1,r):mc.set(n,r,-1),mc.toArray(l,(e*6+t)*3)}}let u=new Dr;u.setAttribute(`position`,new fr(c,3)),u.setAttribute(`outputDirection`,new fr(l,3)),n.push(new J(u,null)),r>rc&&r--}return{lodMeshes:n,sizeLods:t}}function _c(e,t,n){let r=new Kt(e,t,n);return r.texture.mapping=306,r.texture.name=`PMREM.cubeUv`,r.scissorTest=!0,r}function vc(e,t,n,r,i){e.viewport.set(t,n,r,i),e.scissor.set(t,n,r,i)}function yc(e,t,n){return new Fo({name:`PMREMGGXConvolution`,defines:{GGX_SAMPLES:oc,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:Cc(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function bc(e,t,n){return new Fo({name:`SphericalGaussianBlur`,defines:{SAMPLES:ac,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:Cc(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float sigma;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359
			#define GOLDEN_ANGLE 2.39996322973

			void main() {

				if ( sigma == 0.0 ) {

					gl_FragColor = vec4( bilinearCubeUV( envMap, vOutputDirection, mipInt ), 1.0 );
					return;

				}

				vec3 outputDirection = normalize( vOutputDirection );

				vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
				vec3 tangent = normalize( cross( up, outputDirection ) );
				vec3 bitangent = cross( outputDirection, tangent );

				// Truncate the kernel at three standard deviations or at the antipode.
				float thetaMax = min( 3.0 * sigma, PI );
				float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

				vec3 accumColor = vec3( 0.0 );
				float accumWeight = 0.0;

				for ( int i = 0; i < SAMPLES; i ++ ) {

					// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
					float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
					float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
					float phi = float( i ) * GOLDEN_ANGLE;

					vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
					vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

					// Correct the planar sample density to solid angle.
					float weight = sin( theta ) / theta;

					accumColor += weight * bilinearCubeUV( envMap, sampleDirection, mipInt );
					accumWeight += weight;

				}

				gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function xc(){return new Fo({name:`EquirectangularToCubeUV`,uniforms:{envMap:{value:null}},vertexShader:Cc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function Sc(){return new Fo({name:`CubemapToCubeUV`,uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Cc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function Cc(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var wc=class extends Kt{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new Ki(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new Zi(5,5,5),i=new Fo({name:`CubemapFromEquirect`,uniforms:Do(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:1,blending:0});i.uniforms.tEquirect.value=t;let a=new J(r,i),s=t.minFilter;return t.minFilter===1008&&(t.minFilter=o),new Ts(1,10,this).update(e,a),t.minFilter=s,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,r=!0){let i=e.getRenderTarget();for(let i=0;i<6;i++)e.setRenderTarget(this,i),e.clear(t,n,r);e.setRenderTarget(i)}};function Tc(e){let t=new WeakMap,n=new WeakMap,r=null;function i(e,t=!1){return e==null?null:t?o(e):a(e)}function a(n){if(n&&n.isTexture){let r=n.mapping;if(r===303||r===304){if(t.has(n)){let e=t.get(n).texture;return s(e,n.mapping)}{let r=n.image;if(r&&r.height>0){let i=new wc(r.height);return i.fromEquirectangularTexture(e,n),t.set(n,i),n.addEventListener(`dispose`,l),s(i.texture,n.mapping)}return null}}}return n}function o(t){if(t&&t.isTexture){let i=t.mapping,a=i===303||i===304,o=i===301||i===302;if(a||o){let i=n.get(t),s=i===void 0?0:i.texture.pmremVersion;if(t.isRenderTargetTexture&&t.pmremVersion!==s)return r===null&&(r=new hc(e)),i=a?r.fromEquirectangular(t,i):r.fromCubemap(t,i),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),i.texture;if(i!==void 0)return i.texture;{let s=t.image;return a&&s&&s.height>0||o&&s&&c(s)?(r===null&&(r=new hc(e)),i=a?r.fromEquirectangular(t):r.fromCubemap(t),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),t.addEventListener(`dispose`,u),i.texture):null}}}return t}function s(e,t){return t===303?e.mapping=301:t===304&&(e.mapping=302),e}function c(e){let t=0;for(let n=0;n<6;n++)e[n]!==void 0&&t++;return t===6}function l(e){let n=e.target;n.removeEventListener(`dispose`,l);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function u(e){let t=e.target;t.removeEventListener(`dispose`,u);let r=n.get(t);r!==void 0&&(n.delete(t),r.dispose())}function d(){t=new WeakMap,n=new WeakMap,r!==null&&(r.dispose(),r=null)}return{get:i,dispose:d}}function Ec(e){let t={};function n(n){if(t[n]!==void 0)return t[n];let r=e.getExtension(n);return t[n]=r,r}return{has:function(e){return n(e)!==null},init:function(){n(`EXT_color_buffer_float`),n(`WEBGL_clip_cull_distance`),n(`OES_texture_float_linear`),n(`EXT_color_buffer_half_float`),n(`WEBGL_multisampled_render_to_texture`),n(`WEBGL_render_shared_exponent`)},get:function(e){let t=n(e);return t===null&&Xe(`WebGLRenderer: `+e+` extension not supported.`),t}}}function Dc(e,t,n,r){let i={},a=new WeakMap;function o(e){let s=e.target;s.index!==null&&t.remove(s.index);for(let e in s.attributes)t.remove(s.attributes[e]);s.removeEventListener(`dispose`,o),delete i[s.id];let c=a.get(s);c&&(t.remove(c),a.delete(s)),r.releaseStatesOfGeometry(s),s.isInstancedBufferGeometry===!0&&delete s._maxInstanceCount,n.memory.geometries--}function s(e,t){return i[t.id]===!0?t:(t.addEventListener(`dispose`,o),i[t.id]=!0,n.memory.geometries++,t)}function c(n){let r=n.attributes;for(let n in r)t.update(r[n],e.ARRAY_BUFFER)}function l(e){let n=[],r=e.index,i=e.attributes.position,o=0;if(i===void 0)return;if(r!==null){let e=r.array;o=r.version;for(let t=0,r=e.length;t<r;t+=3){let r=e[t+0],i=e[t+1],a=e[t+2];n.push(r,i,i,a,a,r)}}else{let e=i.array;o=i.version;for(let t=0,r=e.length/3-1;t<r;t+=3){let e=t+0,r=t+1,i=t+2;n.push(e,r,r,i,i,e)}}let s=new(i.count>=65535?mr:pr)(n,1);s.version=o;let c=a.get(e);c&&t.remove(c),a.set(e,s)}function u(e){let t=a.get(e);if(t){let n=e.index;n!==null&&t.version<n.version&&l(e)}else l(e);return a.get(e)}return{get:s,update:c,getWireframeAttribute:u}}function Oc(e,t,n){let r;function i(e){r=e}let a,o;function s(e){a=e.type,o=e.bytesPerElement}function c(t,i){e.drawElements(r,i,a,t*o),n.update(i,r,1)}function l(t,i,s){s!==0&&(e.drawElementsInstanced(r,i,a,t*o,s),n.update(i,r,s))}function u(e,i,o){if(o===0)return;t.get(`WEBGL_multi_draw`).multiDrawElementsWEBGL(r,i,0,a,e,0,o);let s=0;for(let e=0;e<o;e++)s+=i[e];n.update(s,r,1)}this.setMode=i,this.setIndex=s,this.render=c,this.renderInstances=l,this.renderMultiDraw=u}function kc(e){let t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function r(t,r,i){switch(n.calls++,r){case e.TRIANGLES:n.triangles+=t/3*i;break;case e.LINES:n.lines+=t/2*i;break;case e.LINE_STRIP:n.lines+=i*(t-1);break;case e.LINE_LOOP:n.lines+=i*t;break;case e.POINTS:n.points+=i*t;break;default:H(`WebGLInfo: Unknown draw mode:`,r)}}function i(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:i,update:r}}function Ac(e,t,n){let r=new WeakMap,i=new Wt;function a(a,o,s){let c=a.morphTargetInfluences,l=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=l===void 0?0:l.length,d=r.get(o);if(d===void 0||d.count!==u){d!==void 0&&d.texture.dispose();let e=o.morphAttributes.position!==void 0,n=o.morphAttributes.normal!==void 0,a=o.morphAttributes.color!==void 0,s=o.morphAttributes.position||[],c=o.morphAttributes.normal||[],l=o.morphAttributes.color||[],f=0;e===!0&&(f=1),n===!0&&(f=2),a===!0&&(f=3);let p=o.attributes.position.count*f,m=1;p>t.maxTextureSize&&(m=Math.ceil(p/t.maxTextureSize),p=t.maxTextureSize);let g=new Float32Array(p*m*4*u),_=new qt(g,p,m,u);_.type=h,_.needsUpdate=!0;let v=f*4;for(let t=0;t<u;t++){let r=s[t],o=c[t],u=l[t],d=p*m*4*t;for(let t=0;t<r.count;t++){let s=t*v;e===!0&&(i.fromBufferAttribute(r,t),g[d+s+0]=i.x,g[d+s+1]=i.y,g[d+s+2]=i.z,g[d+s+3]=0),n===!0&&(i.fromBufferAttribute(o,t),g[d+s+4]=i.x,g[d+s+5]=i.y,g[d+s+6]=i.z,g[d+s+7]=0),a===!0&&(i.fromBufferAttribute(u,t),g[d+s+8]=i.x,g[d+s+9]=i.y,g[d+s+10]=i.z,g[d+s+11]=u.itemSize===4?i.w:1)}}d={count:u,texture:_,size:new W(p,m)},r.set(o,d);function y(){_.dispose(),r.delete(o),o.removeEventListener(`dispose`,y)}o.addEventListener(`dispose`,y)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)s.getUniforms().setValue(e,`morphTexture`,a.morphTexture,n);else{let t=0;for(let e=0;e<c.length;e++)t+=c[e];let n=o.morphTargetsRelative?1:1-t;s.getUniforms().setValue(e,`morphTargetBaseInfluence`,n),s.getUniforms().setValue(e,`morphTargetInfluences`,c)}s.getUniforms().setValue(e,`morphTargetsTexture`,d.texture,n),s.getUniforms().setValue(e,`morphTargetsTextureSize`,d.size)}return{update:a}}function jc(e,t,n,r,i){let a=new WeakMap;function o(r){let o=i.render.frame,s=r.geometry,l=t.get(r,s);if(a.get(l)!==o&&(t.update(l),a.set(l,o)),r.isInstancedMesh&&(r.hasEventListener(`dispose`,c)===!1&&r.addEventListener(`dispose`,c),a.get(r)!==o&&(n.update(r.instanceMatrix,e.ARRAY_BUFFER),r.instanceColor!==null&&n.update(r.instanceColor,e.ARRAY_BUFFER),a.set(r,o))),r.isSkinnedMesh){let e=r.skeleton;a.get(e)!==o&&(e.update(),a.set(e,o))}return l}function s(){a=new WeakMap}function c(e){let t=e.target;t.removeEventListener(`dispose`,c),r.releaseStatesOfObject(t),n.remove(t.instanceMatrix),t.instanceColor!==null&&n.remove(t.instanceColor)}return{update:o,dispose:s}}var Mc={1:`LINEAR_TONE_MAPPING`,2:`REINHARD_TONE_MAPPING`,3:`CINEON_TONE_MAPPING`,4:`ACES_FILMIC_TONE_MAPPING`,6:`AGX_TONE_MAPPING`,7:`NEUTRAL_TONE_MAPPING`,5:`CUSTOM_TONE_MAPPING`};function Nc(e,t,n,r,i,a){let o=new Kt(t,n,{type:e,depthBuffer:i,stencilBuffer:a,samples:r?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),s=null,c=null,l=new Dr;l.setAttribute(`position`,new hr([-1,3,0,-1,-1,0,3,-1,0],3)),l.setAttribute(`uv`,new hr([0,2,0,0,2,0],2));let u=new Io({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),d=new J(l,u),f=new bs(-1,1,1,-1,0,1),p=null,m=null,h=!1,_,v=null,y=[],b=!1;this.setSize=function(e,t){o.setSize(e,t),s!==null&&s.setSize(e,t),c!==null&&c.setSize(e,t);for(let n=0;n<y.length;n++){let r=y[n];r.setSize&&r.setSize(e,t)}},this.setEffects=function(e){y=e,b=y.length>0&&y[0].isRenderPass===!0;let t=o.width,n=o.height;y.length>0&&s===null&&(s=new Kt(t,n,{type:g,depthBuffer:!1,stencilBuffer:!1}),c=new Kt(t,n,{type:g,depthBuffer:!1,stencilBuffer:!1}));for(let e=0;e<y.length;e++){let r=y[e];r.setSize&&r.setSize(t,n)}},this.begin=function(e,t){if(h||e.toneMapping===0&&y.length===0)return!1;if(v=t,t!==null){let e=t.width,n=t.height;(o.width!==e||o.height!==n)&&this.setSize(e,n)}return b===!1&&e.setRenderTarget(o),_=e.toneMapping,e.toneMapping=0,!0},this.hasRenderPass=function(){return b},this.end=function(e,t){e.toneMapping=_,h=!0;let n=o,r=s;for(let i=0;i<y.length;i++){let a=y[i];a.enabled!==!1&&(a.render(e,r,n,t),a.needsSwap!==!1&&(n=r,r=r===s?c:s))}if(p!==e.outputColorSpace||m!==e.toneMapping){p=e.outputColorSpace,m=e.toneMapping,u.defines={},Nt.getTransfer(p)===`srgb`&&(u.defines.SRGB_TRANSFER=``);let t=Mc[m];t&&(u.defines[t]=``),u.needsUpdate=!0}u.uniforms.tDiffuse.value=n.texture,e.setRenderTarget(v),e.render(d,f),v=null,h=!1},this.isCompositing=function(){return h},this.dispose=function(){o.dispose(),s!==null&&s.dispose(),c!==null&&c.dispose(),l.dispose(),u.dispose()}}var Pc=new Ut,Fc=new Ji(1,1),Ic=new qt,Lc=new Jt,Rc=new Ki,zc=[],Bc=[],Vc=new Float32Array(16),Hc=new Float32Array(9),Uc=new Float32Array(4);function Wc(e,t,n){let r=e[0];if(r<=0||r>0)return e;let i=t*n,a=zc[i];if(a===void 0&&(a=new Float32Array(i),zc[i]=a),t!==0){r.toArray(a,0);for(let r=1,i=0;r!==t;++r)i+=n,e[r].toArray(a,i)}return a}function Gc(e,t){if(e.length!==t.length)return!1;for(let n=0,r=e.length;n<r;n++)if(e[n]!==t[n])return!1;return!0}function Kc(e,t){for(let n=0,r=t.length;n<r;n++)e[n]=t[n]}function qc(e,t){let n=Bc[t];n===void 0&&(n=new Int32Array(t),Bc[t]=n);for(let r=0;r!==t;++r)n[r]=e.allocateTextureUnit();return n}function Jc(e,t){let n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function Yc(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Gc(n,t))return;e.uniform2fv(this.addr,t),Kc(n,t)}}function Xc(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(Gc(n,t))return;e.uniform3fv(this.addr,t),Kc(n,t)}}function Zc(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Gc(n,t))return;e.uniform4fv(this.addr,t),Kc(n,t)}}function Qc(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Gc(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),Kc(n,t)}else{if(Gc(n,r))return;Uc.set(r),e.uniformMatrix2fv(this.addr,!1,Uc),Kc(n,r)}}function $c(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Gc(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),Kc(n,t)}else{if(Gc(n,r))return;Hc.set(r),e.uniformMatrix3fv(this.addr,!1,Hc),Kc(n,r)}}function el(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Gc(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),Kc(n,t)}else{if(Gc(n,r))return;Vc.set(r),e.uniformMatrix4fv(this.addr,!1,Vc),Kc(n,r)}}function tl(e,t){let n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function nl(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Gc(n,t))return;e.uniform2iv(this.addr,t),Kc(n,t)}}function rl(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Gc(n,t))return;e.uniform3iv(this.addr,t),Kc(n,t)}}function il(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Gc(n,t))return;e.uniform4iv(this.addr,t),Kc(n,t)}}function al(e,t){let n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function ol(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Gc(n,t))return;e.uniform2uiv(this.addr,t),Kc(n,t)}}function sl(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Gc(n,t))return;e.uniform3uiv(this.addr,t),Kc(n,t)}}function cl(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Gc(n,t))return;e.uniform4uiv(this.addr,t),Kc(n,t)}}function ll(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;this.type===e.SAMPLER_2D_SHADOW?(Fc.compareFunction=n.isReversedDepthBuffer()?518:515,a=Fc):a=Pc,n.setTexture2D(t||a,i)}function ul(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture3D(t||Lc,i)}function dl(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTextureCube(t||Rc,i)}function fl(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture2DArray(t||Ic,i)}function pl(e){switch(e){case 5126:return Jc;case 35664:return Yc;case 35665:return Xc;case 35666:return Zc;case 35674:return Qc;case 35675:return $c;case 35676:return el;case 5124:case 35670:return tl;case 35667:case 35671:return nl;case 35668:case 35672:return rl;case 35669:case 35673:return il;case 5125:return al;case 36294:return ol;case 36295:return sl;case 36296:return cl;case 35678:case 36198:case 36298:case 36306:case 35682:return ll;case 35679:case 36299:case 36307:return ul;case 35680:case 36300:case 36308:case 36293:return dl;case 36289:case 36303:case 36311:case 36292:return fl}}function ml(e,t){e.uniform1fv(this.addr,t)}function hl(e,t){let n=Wc(t,this.size,2);e.uniform2fv(this.addr,n)}function gl(e,t){let n=Wc(t,this.size,3);e.uniform3fv(this.addr,n)}function _l(e,t){let n=Wc(t,this.size,4);e.uniform4fv(this.addr,n)}function vl(e,t){let n=Wc(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function yl(e,t){let n=Wc(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function bl(e,t){let n=Wc(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function xl(e,t){e.uniform1iv(this.addr,t)}function Sl(e,t){e.uniform2iv(this.addr,t)}function Cl(e,t){e.uniform3iv(this.addr,t)}function wl(e,t){e.uniform4iv(this.addr,t)}function Tl(e,t){e.uniform1uiv(this.addr,t)}function El(e,t){e.uniform2uiv(this.addr,t)}function Dl(e,t){e.uniform3uiv(this.addr,t)}function Ol(e,t){e.uniform4uiv(this.addr,t)}function kl(e,t,n){let r=this.cache,i=t.length,a=qc(n,i);Gc(r,a)||(e.uniform1iv(this.addr,a),Kc(r,a));let o;o=this.type===e.SAMPLER_2D_SHADOW?Fc:Pc;for(let e=0;e!==i;++e)n.setTexture2D(t[e]||o,a[e])}function Al(e,t,n){let r=this.cache,i=t.length,a=qc(n,i);Gc(r,a)||(e.uniform1iv(this.addr,a),Kc(r,a));for(let e=0;e!==i;++e)n.setTexture3D(t[e]||Lc,a[e])}function jl(e,t,n){let r=this.cache,i=t.length,a=qc(n,i);Gc(r,a)||(e.uniform1iv(this.addr,a),Kc(r,a));for(let e=0;e!==i;++e)n.setTextureCube(t[e]||Rc,a[e])}function Ml(e,t,n){let r=this.cache,i=t.length,a=qc(n,i);Gc(r,a)||(e.uniform1iv(this.addr,a),Kc(r,a));for(let e=0;e!==i;++e)n.setTexture2DArray(t[e]||Ic,a[e])}function Nl(e){switch(e){case 5126:return ml;case 35664:return hl;case 35665:return gl;case 35666:return _l;case 35674:return vl;case 35675:return yl;case 35676:return bl;case 5124:case 35670:return xl;case 35667:case 35671:return Sl;case 35668:case 35672:return Cl;case 35669:case 35673:return wl;case 5125:return Tl;case 36294:return El;case 36295:return Dl;case 36296:return Ol;case 35678:case 36198:case 36298:case 36306:case 35682:return kl;case 35679:case 36299:case 36307:return Al;case 35680:case 36300:case 36308:case 36293:return jl;case 36289:case 36303:case 36311:case 36292:return Ml}}var Pl=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=pl(t.type)}},Fl=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Nl(t.type)}},Il=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let i=0,a=r.length;i!==a;++i){let a=r[i];a.setValue(e,t[a.id],n)}}},Ll=/(\w+)(\])?(\[|\.)?/g;function Rl(e,t){e.seq.push(t),e.map[t.id]=t}function zl(e,t,n){let r=e.name,i=r.length;for(Ll.lastIndex=0;;){let a=Ll.exec(r),o=Ll.lastIndex,s=a[1],c=a[2]===`]`,l=a[3];if(c&&(s|=0),l===void 0||l===`[`&&o+2===i){Rl(n,l===void 0?new Pl(s,e,t):new Fl(s,e,t));break}{let e=n.map[s];e===void 0&&(e=new Il(s),Rl(n,e)),n=e}}}var Bl=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let n=e.getActiveUniform(t,r);zl(n,e.getUniformLocation(t,n.name),this)}let r=[],i=[];for(let t of this.seq)t.type===e.SAMPLER_2D_SHADOW||t.type===e.SAMPLER_CUBE_SHADOW||t.type===e.SAMPLER_2D_ARRAY_SHADOW?r.push(t):i.push(t);r.length>0&&(this.seq=r.concat(i))}setValue(e,t,n,r){let i=this.map[t];i!==void 0&&i.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let i=0,a=t.length;i!==a;++i){let a=t[i],o=n[a.id];o.needsUpdate!==!1&&a.setValue(e,o.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,i=e.length;r!==i;++r){let i=e[r];i.id in t&&n.push(i)}return n}};function Vl(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),r}var Hl=37297,Ul=0;function Wl(e,t){let n=e.split(`
`),r=[],i=Math.max(t-6,0),a=Math.min(t+6,n.length);for(let e=i;e<a;e++){let i=e+1;r.push(`${i===t?`>`:` `} ${i}: ${n[e]}`)}return r.join(`
`)}var Gl=new Ot;function Kl(e){Nt._getMatrix(Gl,Nt.workingColorSpace,e);let t=`mat3( ${Gl.elements.map(e=>e.toFixed(4))} )`;switch(Nt.getTransfer(e)){case Le:return[t,`LinearTransferOETF`];case Re:return[t,`sRGBTransferOETF`];default:return V(`WebGLProgram: Unsupported color space: `,e),[t,`LinearTransferOETF`]}}function ql(e,t,n){let r=e.getShaderParameter(t,e.COMPILE_STATUS),i=(e.getShaderInfoLog(t)||``).trim();if(r&&i===``)return``;let a=/ERROR: 0:(\d+)/.exec(i);if(a){let r=parseInt(a[1]);return n.toUpperCase()+`

`+i+`

`+Wl(e.getShaderSource(t),r)}return i}function Jl(e,t){let n=Kl(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,`}`].join(`
`)}var Yl={1:`Linear`,2:`Reinhard`,3:`Cineon`,4:`ACESFilmic`,6:`AgX`,7:`Neutral`,5:`Custom`};function Xl(e,t){let n=Yl[t];return n===void 0?(V(`WebGLProgram: Unsupported toneMapping:`,t),`vec3 `+e+`( vec3 color ) { return LinearToneMapping( color ); }`):`vec3 `+e+`( vec3 color ) { return `+n+`ToneMapping( color ); }`}var Zl=new K;function Ql(){return Nt.getLuminanceCoefficients(Zl),[`float luminance( const in vec3 rgb ) {`,`	const vec3 weights = vec3( ${Zl.x.toFixed(4)}, ${Zl.y.toFixed(4)}, ${Zl.z.toFixed(4)} );`,`	return dot( weights, rgb );`,`}`].join(`
`)}function $l(e){return[e.extensionClipCullDistance?`#extension GL_ANGLE_clip_cull_distance : require`:``,e.extensionMultiDraw?`#extension GL_ANGLE_multi_draw : require`:``].filter(nu).join(`
`)}function eu(e){let t=[];for(let n in e){let r=e[n];r!==!1&&t.push(`#define `+n+` `+r)}return t.join(`
`)}function tu(e,t){let n={},r=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let i=0;i<r;i++){let r=e.getActiveAttrib(t,i),a=r.name,o=1;r.type===e.FLOAT_MAT2&&(o=2),r.type===e.FLOAT_MAT3&&(o=3),r.type===e.FLOAT_MAT4&&(o=4),n[a]={type:r.type,location:e.getAttribLocation(t,a),locationSize:o}}return n}function nu(e){return e!==``}function ru(e,t){let n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function iu(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var au=/^[ \t]*#include +<([\w\d./]+)>/gm;function ou(e){return e.replace(au,cu)}var su=new Map;function cu(e,t){let n=qs[t];if(n===void 0){let e=su.get(t);if(e!==void 0)n=qs[e],V(`WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.`,t,e);else throw Error(`THREE.WebGLProgram: Can not resolve #include <`+t+`>`)}return ou(n)}var lu=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function uu(e){return e.replace(lu,du)}function du(e,t,n,r){let i=``;for(let e=parseInt(t);e<parseInt(n);e++)i+=r.replace(/\[\s*i\s*\]/g,`[ `+e+` ]`).replace(/UNROLLED_LOOP_INDEX/g,e);return i}function fu(e){let t=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;return e.precision===`highp`?t+=`
#define HIGH_PRECISION`:e.precision===`mediump`?t+=`
#define MEDIUM_PRECISION`:e.precision===`lowp`&&(t+=`
#define LOW_PRECISION`),t}var pu={1:`SHADOWMAP_TYPE_PCF`,3:`SHADOWMAP_TYPE_VSM`};function mu(e){return pu[e.shadowMapType]||`SHADOWMAP_TYPE_BASIC`}var hu={301:`ENVMAP_TYPE_CUBE`,302:`ENVMAP_TYPE_CUBE`,306:`ENVMAP_TYPE_CUBE_UV`};function gu(e){return e.envMap===!1?`ENVMAP_TYPE_CUBE`:hu[e.envMapMode]||`ENVMAP_TYPE_CUBE`}var _u={302:`ENVMAP_MODE_REFRACTION`};function vu(e){return e.envMap===!1?`ENVMAP_MODE_REFLECTION`:_u[e.envMapMode]||`ENVMAP_MODE_REFLECTION`}var yu={0:`ENVMAP_BLENDING_MULTIPLY`,1:`ENVMAP_BLENDING_MIX`,2:`ENVMAP_BLENDING_ADD`};function bu(e){return e.envMap===!1?`ENVMAP_BLENDING_NONE`:yu[e.combine]||`ENVMAP_BLENDING_NONE`}function xu(e){let t=e.envMapCubeUVHeight;if(t===null)return null;let n=Math.log2(t)-2,r=1/t;return{texelWidth:1/(3*Math.max(2**n,112)),texelHeight:r,maxMip:n}}function Su(e,t,n,r){let i=e.getContext(),a=n.defines,o=n.vertexShader,s=n.fragmentShader,c=mu(n),l=gu(n),u=vu(n),d=bu(n),f=xu(n),p=$l(n),m=eu(a),h=i.createProgram(),g,_,v=n.glslVersion?`#version `+n.glslVersion+`
`:``;n.isRawShaderMaterial?(g=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(nu).join(`
`),g.length>0&&(g+=`
`),_=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(nu).join(`
`),_.length>0&&(_+=`
`)):(g=[fu(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.extensionClipCullDistance?`#define USE_CLIP_DISTANCE`:``,n.batching?`#define USE_BATCHING`:``,n.batchingColor?`#define USE_BATCHING_COLOR`:``,n.instancing?`#define USE_INSTANCING`:``,n.instancingColor?`#define USE_INSTANCING_COLOR`:``,n.instancingMorph?`#define USE_INSTANCING_MORPH`:``,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.map?`#define USE_MAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+u:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.displacementMap?`#define USE_DISPLACEMENTMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.mapUv?`#define MAP_UV `+n.mapUv:``,n.alphaMapUv?`#define ALPHAMAP_UV `+n.alphaMapUv:``,n.lightMapUv?`#define LIGHTMAP_UV `+n.lightMapUv:``,n.aoMapUv?`#define AOMAP_UV `+n.aoMapUv:``,n.emissiveMapUv?`#define EMISSIVEMAP_UV `+n.emissiveMapUv:``,n.bumpMapUv?`#define BUMPMAP_UV `+n.bumpMapUv:``,n.normalMapUv?`#define NORMALMAP_UV `+n.normalMapUv:``,n.displacementMapUv?`#define DISPLACEMENTMAP_UV `+n.displacementMapUv:``,n.metalnessMapUv?`#define METALNESSMAP_UV `+n.metalnessMapUv:``,n.roughnessMapUv?`#define ROUGHNESSMAP_UV `+n.roughnessMapUv:``,n.anisotropyMapUv?`#define ANISOTROPYMAP_UV `+n.anisotropyMapUv:``,n.clearcoatMapUv?`#define CLEARCOATMAP_UV `+n.clearcoatMapUv:``,n.clearcoatNormalMapUv?`#define CLEARCOAT_NORMALMAP_UV `+n.clearcoatNormalMapUv:``,n.clearcoatRoughnessMapUv?`#define CLEARCOAT_ROUGHNESSMAP_UV `+n.clearcoatRoughnessMapUv:``,n.iridescenceMapUv?`#define IRIDESCENCEMAP_UV `+n.iridescenceMapUv:``,n.iridescenceThicknessMapUv?`#define IRIDESCENCE_THICKNESSMAP_UV `+n.iridescenceThicknessMapUv:``,n.sheenColorMapUv?`#define SHEEN_COLORMAP_UV `+n.sheenColorMapUv:``,n.sheenRoughnessMapUv?`#define SHEEN_ROUGHNESSMAP_UV `+n.sheenRoughnessMapUv:``,n.specularMapUv?`#define SPECULARMAP_UV `+n.specularMapUv:``,n.specularColorMapUv?`#define SPECULAR_COLORMAP_UV `+n.specularColorMapUv:``,n.specularIntensityMapUv?`#define SPECULAR_INTENSITYMAP_UV `+n.specularIntensityMapUv:``,n.transmissionMapUv?`#define TRANSMISSIONMAP_UV `+n.transmissionMapUv:``,n.thicknessMapUv?`#define THICKNESSMAP_UV `+n.thicknessMapUv:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexNormals?`#define HAS_NORMAL`:``,n.vertexColors?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.flatShading?`#define FLAT_SHADED`:``,n.skinning?`#define USE_SKINNING`:``,n.morphTargets?`#define USE_MORPHTARGETS`:``,n.morphNormals&&n.flatShading===!1?`#define USE_MORPHNORMALS`:``,n.morphColors?`#define USE_MORPHCOLORS`:``,n.morphTargetsCount>0?`#define MORPHTARGETS_TEXTURE_STRIDE `+n.morphTextureStride:``,n.morphTargetsCount>0?`#define MORPHTARGETS_COUNT `+n.morphTargetsCount:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.sizeAttenuation?`#define USE_SIZEATTENUATION`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 modelMatrix;`,`uniform mat4 modelViewMatrix;`,`uniform mat4 projectionMatrix;`,`uniform mat4 viewMatrix;`,`uniform mat3 normalMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,`#ifdef USE_INSTANCING`,`	attribute mat4 instanceMatrix;`,`#endif`,`#ifdef USE_INSTANCING_COLOR`,`	attribute vec3 instanceColor;`,`#endif`,`#ifdef USE_INSTANCING_MORPH`,`	uniform sampler2D morphTexture;`,`#endif`,`attribute vec3 position;`,`attribute vec3 normal;`,`attribute vec2 uv;`,`#ifdef USE_UV1`,`	attribute vec2 uv1;`,`#endif`,`#ifdef USE_UV2`,`	attribute vec2 uv2;`,`#endif`,`#ifdef USE_UV3`,`	attribute vec2 uv3;`,`#endif`,`#ifdef USE_TANGENT`,`	attribute vec4 tangent;`,`#endif`,`#if defined( USE_COLOR_ALPHA )`,`	attribute vec4 color;`,`#elif defined( USE_COLOR )`,`	attribute vec3 color;`,`#endif`,`#ifdef USE_SKINNING`,`	attribute vec4 skinIndex;`,`	attribute vec4 skinWeight;`,`#endif`,`
`].filter(nu).join(`
`),_=[fu(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.alphaToCoverage?`#define ALPHA_TO_COVERAGE`:``,n.map?`#define USE_MAP`:``,n.matcap?`#define USE_MATCAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+l:``,n.envMap?`#define `+u:``,n.envMap?`#define `+d:``,f?`#define CUBEUV_TEXEL_WIDTH `+f.texelWidth:``,f?`#define CUBEUV_TEXEL_HEIGHT `+f.texelHeight:``,f?`#define CUBEUV_MAX_MIP `+f.maxMip+`.0`:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.packedNormalMap?`#define USE_PACKED_NORMALMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoat?`#define USE_CLEARCOAT`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.dispersion?`#define USE_DISPERSION`:``,n.retroreflection?`#define USE_RETROREFLECTION`:``,n.iridescence?`#define USE_IRIDESCENCE`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaTest?`#define USE_ALPHATEST`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.sheen?`#define USE_SHEEN`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors||n.instancingColor?`#define USE_COLOR`:``,n.vertexAlphas||n.batchingColor?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.gradientMap?`#define USE_GRADIENTMAP`:``,n.flatShading?`#define FLAT_SHADED`:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.premultipliedAlpha?`#define PREMULTIPLIED_ALPHA`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.numLightProbeGrids>0?`#define USE_LIGHT_PROBES_GRID`:``,n.decodeVideoTexture?`#define DECODE_VIDEO_TEXTURE`:``,n.decodeVideoTextureEmissive?`#define DECODE_VIDEO_TEXTURE_EMISSIVE`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 viewMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,n.toneMapping===0?``:`#define TONE_MAPPING`,n.toneMapping===0?``:qs.tonemapping_pars_fragment,n.toneMapping===0?``:Xl(`toneMapping`,n.toneMapping),n.dithering?`#define DITHERING`:``,n.opaque?`#define OPAQUE`:``,qs.colorspace_pars_fragment,Jl(`linearToOutputTexel`,n.outputColorSpace),Ql(),n.useDepthPacking?`#define DEPTH_PACKING `+n.depthPacking:``,`
`].filter(nu).join(`
`)),o=ou(o),o=ru(o,n),o=iu(o,n),s=ou(s),s=ru(s,n),s=iu(s,n),o=uu(o),s=uu(s),n.isRawShaderMaterial!==!0&&(v=`#version 300 es
`,g=[p,`#define attribute in`,`#define varying out`,`#define texture2D texture`].join(`
`)+`
`+g,_=[`#define varying in`,n.glslVersion===`300 es`?``:`layout(location = 0) out highp vec4 pc_fragColor;`,n.glslVersion===`300 es`?``:`#define gl_FragColor pc_fragColor`,`#define gl_FragDepthEXT gl_FragDepth`,`#define texture2D texture`,`#define textureCube texture`,`#define texture2DProj textureProj`,`#define texture2DLodEXT textureLod`,`#define texture2DProjLodEXT textureProjLod`,`#define textureCubeLodEXT textureLod`,`#define texture2DGradEXT textureGrad`,`#define texture2DProjGradEXT textureProjGrad`,`#define textureCubeGradEXT textureGrad`].join(`
`)+`
`+_);let y=v+g+o,b=v+_+s,x=Vl(i,i.VERTEX_SHADER,y),S=Vl(i,i.FRAGMENT_SHADER,b);i.attachShader(h,x),i.attachShader(h,S),n.index0AttributeName===void 0?n.hasPositionAttribute===!0&&i.bindAttribLocation(h,0,`position`):i.bindAttribLocation(h,0,n.index0AttributeName),i.linkProgram(h);function C(t){if(e.debug.checkShaderErrors){let n=i.getProgramInfoLog(h)||``,r=i.getShaderInfoLog(x)||``,a=i.getShaderInfoLog(S)||``,o=n.trim(),s=r.trim(),c=a.trim(),l=!0,u=!0;if(i.getProgramParameter(h,i.LINK_STATUS)===!1){if(l=!1,typeof e.debug.onShaderError==`function`)e.debug.onShaderError(i,h,x,S);else{let e=ql(i,x,`vertex`),n=ql(i,S,`fragment`);H(`WebGLProgram: Shader Error `+i.getError()+` - VALIDATE_STATUS `+i.getProgramParameter(h,i.VALIDATE_STATUS)+`

Material Name: `+t.name+`
Material Type: `+t.type+`

Program Info Log: `+o+`
`+e+`
`+n)}}else o===``?(s===``||c===``)&&(u=!1):V(`WebGLProgram: Program Info Log:`,o);u&&(t.diagnostics={runnable:l,programLog:o,vertexShader:{log:s,prefix:g},fragmentShader:{log:c,prefix:_}})}i.deleteShader(x),i.deleteShader(S),w=new Bl(i,h),T=tu(i,h)}let w;this.getUniforms=function(){return w===void 0&&C(this),w};let T;this.getAttributes=function(){return T===void 0&&C(this),T};let E=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return E===!1&&(E=i.getProgramParameter(h,Hl)),E},this.destroy=function(){r.releaseStatesOfProgram(this),i.deleteProgram(h),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=Ul++,this.cacheKey=t,this.usedTimes=1,this.program=h,this.vertexShader=x,this.fragmentShader=S,this}var Cu=0,wu=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let r=this._getShaderCacheForMaterial(e);return r.has(t)===!1&&(r.add(t),t.usedTimes++),r.has(n)===!1&&(r.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let e of t)e.usedTimes--,e.usedTimes===0&&this.shaderCache.delete(e.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new Tu(e),t.set(e,n)),n}},Tu=class{constructor(e){this.id=Cu++,this.code=e,this.usedTimes=0}};function Eu(e){return e===1030||e===37490||e===36285}function Du(e,t,n,r,i,a){let o=new sn,s=new wu,c=new Set,l=[],u=new Map,d=r.logarithmicDepthBuffer,f=r.precision,p={MeshDepthMaterial:`depth`,MeshDistanceMaterial:`distance`,MeshNormalMaterial:`normal`,MeshBasicMaterial:`basic`,MeshLambertMaterial:`lambert`,MeshPhongMaterial:`phong`,MeshToonMaterial:`toon`,MeshStandardMaterial:`physical`,MeshPhysicalMaterial:`physical`,MeshMatcapMaterial:`matcap`,LineBasicMaterial:`basic`,LineDashedMaterial:`dashed`,PointsMaterial:`points`,ShadowMaterial:`shadow`,SpriteMaterial:`sprite`};function m(e){return c.add(e),e===0?`uv`:`uv${e}`}function h(i,o,l,u,h,g){let _=u.fog,v=h.geometry,y=i.isMeshStandardMaterial||i.isMeshLambertMaterial||i.isMeshPhongMaterial?u.environment:null,b=i.isMeshStandardMaterial||i.isMeshLambertMaterial&&!i.envMap||i.isMeshPhongMaterial&&!i.envMap,x=t.get(i.envMap||y,b),S=x&&x.mapping===306?x.image.height:null,C=p[i.type];i.precision!==null&&(f=r.getMaxPrecision(i.precision),f!==i.precision&&V(`WebGLProgram.getParameters:`,i.precision,`not supported, using`,f,`instead.`));let w=v.morphAttributes.position||v.morphAttributes.normal||v.morphAttributes.color,T=w===void 0?0:w.length,E=0;v.morphAttributes.position!==void 0&&(E=1),v.morphAttributes.normal!==void 0&&(E=2),v.morphAttributes.color!==void 0&&(E=3);let D,O,k,A;if(C){let e=Js[C];D=e.vertexShader,O=e.fragmentShader}else{D=i.vertexShader,O=i.fragmentShader;let e=s.getVertexShaderStage(i),t=s.getFragmentShaderStage(i);s.update(i,e,t),k=e.id,A=t.id}let j=e.getRenderTarget(),M=e.state.buffers.depth.getReversed(),ee=h.isInstancedMesh===!0,N=h.isBatchedMesh===!0,te=!!i.map,P=!!i.matcap,ne=!!x,F=!!i.aoMap,re=!!i.lightMap,ie=!!i.bumpMap&&i.wireframe===!1,I=!!i.normalMap,ae=!!i.displacementMap,oe=!!i.emissiveMap,L=!!i.metalnessMap,se=!!i.roughnessMap,ce=i.anisotropy>0,le=i.clearcoat>0,ue=i.dispersion>0,de=i.retroreflectivity>0,fe=i.iridescence>0,pe=i.sheen>0,me=i.transmission>0,he=ce&&!!i.anisotropyMap,ge=le&&!!i.clearcoatMap,_e=le&&!!i.clearcoatNormalMap,ve=le&&!!i.clearcoatRoughnessMap,ye=fe&&!!i.iridescenceMap,be=fe&&!!i.iridescenceThicknessMap,xe=pe&&!!i.sheenColorMap,Se=pe&&!!i.sheenRoughnessMap,Ce=!!i.specularMap,we=!!i.specularColorMap,Te=!!i.specularIntensityMap,Ee=me&&!!i.transmissionMap,De=me&&!!i.thicknessMap,Oe=!!i.gradientMap,ke=!!i.alphaMap,Ae=i.alphaTest>0,R=!!i.alphaHash,je=!!i.extensions,Me=0;i.toneMapped&&(j===null||j.isXRRenderTarget===!0)&&(Me=e.toneMapping);let Ne={shaderID:C,shaderType:i.type,shaderName:i.name,vertexShader:D,fragmentShader:O,defines:i.defines,customVertexShaderID:k,customFragmentShaderID:A,isRawShaderMaterial:i.isRawShaderMaterial===!0,glslVersion:i.glslVersion,precision:f,batching:N,batchingColor:N&&h._colorsTexture!==null,instancing:ee,instancingColor:ee&&h.instanceColor!==null,instancingMorph:ee&&h.morphTexture!==null,outputColorSpace:j===null?e.outputColorSpace:j.isXRRenderTarget===!0?j.texture.colorSpace:Nt.workingColorSpace,alphaToCoverage:!!i.alphaToCoverage,map:te,matcap:P,envMap:ne,envMapMode:ne&&x.mapping,envMapCubeUVHeight:S,aoMap:F,lightMap:re,bumpMap:ie,normalMap:I,displacementMap:ae,emissiveMap:oe,normalMapObjectSpace:I&&i.normalMapType===1,normalMapTangentSpace:I&&i.normalMapType===0,packedNormalMap:I&&i.normalMapType===0&&Eu(i.normalMap.format),metalnessMap:L,roughnessMap:se,anisotropy:ce,anisotropyMap:he,clearcoat:le,clearcoatMap:ge,clearcoatNormalMap:_e,clearcoatRoughnessMap:ve,dispersion:ue,retroreflection:de,iridescence:fe,iridescenceMap:ye,iridescenceThicknessMap:be,sheen:pe,sheenColorMap:xe,sheenRoughnessMap:Se,specularMap:Ce,specularColorMap:we,specularIntensityMap:Te,transmission:me,transmissionMap:Ee,thicknessMap:De,gradientMap:Oe,opaque:i.transparent===!1&&i.blending===1&&i.alphaToCoverage===!1,alphaMap:ke,alphaTest:Ae,alphaHash:R,combine:i.combine,mapUv:te&&m(i.map.channel),aoMapUv:F&&m(i.aoMap.channel),lightMapUv:re&&m(i.lightMap.channel),bumpMapUv:ie&&m(i.bumpMap.channel),normalMapUv:I&&m(i.normalMap.channel),displacementMapUv:ae&&m(i.displacementMap.channel),emissiveMapUv:oe&&m(i.emissiveMap.channel),metalnessMapUv:L&&m(i.metalnessMap.channel),roughnessMapUv:se&&m(i.roughnessMap.channel),anisotropyMapUv:he&&m(i.anisotropyMap.channel),clearcoatMapUv:ge&&m(i.clearcoatMap.channel),clearcoatNormalMapUv:_e&&m(i.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ve&&m(i.clearcoatRoughnessMap.channel),iridescenceMapUv:ye&&m(i.iridescenceMap.channel),iridescenceThicknessMapUv:be&&m(i.iridescenceThicknessMap.channel),sheenColorMapUv:xe&&m(i.sheenColorMap.channel),sheenRoughnessMapUv:Se&&m(i.sheenRoughnessMap.channel),specularMapUv:Ce&&m(i.specularMap.channel),specularColorMapUv:we&&m(i.specularColorMap.channel),specularIntensityMapUv:Te&&m(i.specularIntensityMap.channel),transmissionMapUv:Ee&&m(i.transmissionMap.channel),thicknessMapUv:De&&m(i.thicknessMap.channel),alphaMapUv:ke&&m(i.alphaMap.channel),vertexTangents:!!v.attributes.tangent&&(I||ce),vertexNormals:!!v.attributes.normal,vertexColors:i.vertexColors,vertexAlphas:i.vertexColors===!0&&!!v.attributes.color&&v.attributes.color.itemSize===4,pointsUvs:h.isPoints===!0&&!!v.attributes.uv&&(te||ke),fog:!!_,useFog:i.fog===!0,fogExp2:!!_&&_.isFogExp2,flatShading:i.wireframe===!1&&(i.flatShading===!0||v.attributes.normal===void 0&&I===!1&&(i.isMeshLambertMaterial||i.isMeshPhongMaterial||i.isMeshStandardMaterial||i.isMeshPhysicalMaterial)),sizeAttenuation:i.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:M,skinning:h.isSkinnedMesh===!0,hasPositionAttribute:v.attributes.position!==void 0,morphTargets:v.morphAttributes.position!==void 0,morphNormals:v.morphAttributes.normal!==void 0,morphColors:v.morphAttributes.color!==void 0,morphTargetsCount:T,morphTextureStride:E,numSunLights:o.sun.length,numDirLights:o.directional.length,numPointLights:o.point.length,numSpotLights:o.spot.length,numSpotLightMaps:o.spotLightMap.length,numRectAreaLights:o.rectArea.length,numHemiLights:o.hemi.length,numSunLightShadows:o.sunShadowMap.length,numDirLightShadows:o.directionalShadowMap.length,numPointLightShadows:o.pointShadowMap.length,numSpotLightShadows:o.spotShadowMap.length,numSpotLightShadowsWithMaps:o.numSpotLightShadowsWithMaps,numLightProbes:o.numLightProbes,numLightProbeGrids:g.length,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:i.dithering,shadowMapEnabled:e.shadowMap.enabled&&l.length>0,shadowMapType:e.shadowMap.type,toneMapping:Me,decodeVideoTexture:te&&i.map.isVideoTexture===!0&&Nt.getTransfer(i.map.colorSpace)===`srgb`,decodeVideoTextureEmissive:oe&&i.emissiveMap.isVideoTexture===!0&&Nt.getTransfer(i.emissiveMap.colorSpace)===`srgb`,premultipliedAlpha:i.premultipliedAlpha,doubleSided:i.side===2,flipSided:i.side===1,useDepthPacking:i.depthPacking>=0,depthPacking:i.depthPacking||0,index0AttributeName:i.index0AttributeName,extensionClipCullDistance:je&&i.extensions.clipCullDistance===!0&&n.has(`WEBGL_clip_cull_distance`),extensionMultiDraw:(je&&i.extensions.multiDraw===!0||N)&&n.has(`WEBGL_multi_draw`),rendererExtensionParallelShaderCompile:n.has(`KHR_parallel_shader_compile`),customProgramCacheKey:i.customProgramCacheKey()};return Ne.vertexUv1s=c.has(1),Ne.vertexUv2s=c.has(2),Ne.vertexUv3s=c.has(3),c.clear(),Ne}function g(t){let n=[];if(t.shaderID?n.push(t.shaderID):(n.push(t.customVertexShaderID),n.push(t.customFragmentShaderID)),t.defines!==void 0)for(let e in t.defines)n.push(e),n.push(t.defines[e]);return t.isRawShaderMaterial===!1&&(_(n,t),v(n,t),n.push(e.outputColorSpace)),n.push(t.customProgramCacheKey),n.join()}function _(e,t){e.push(t.precision),e.push(t.outputColorSpace),e.push(t.envMapMode),e.push(t.envMapCubeUVHeight),e.push(t.mapUv),e.push(t.alphaMapUv),e.push(t.lightMapUv),e.push(t.aoMapUv),e.push(t.bumpMapUv),e.push(t.normalMapUv),e.push(t.displacementMapUv),e.push(t.emissiveMapUv),e.push(t.metalnessMapUv),e.push(t.roughnessMapUv),e.push(t.anisotropyMapUv),e.push(t.clearcoatMapUv),e.push(t.clearcoatNormalMapUv),e.push(t.clearcoatRoughnessMapUv),e.push(t.iridescenceMapUv),e.push(t.iridescenceThicknessMapUv),e.push(t.sheenColorMapUv),e.push(t.sheenRoughnessMapUv),e.push(t.specularMapUv),e.push(t.specularColorMapUv),e.push(t.specularIntensityMapUv),e.push(t.transmissionMapUv),e.push(t.thicknessMapUv),e.push(t.combine),e.push(t.fogExp2),e.push(t.sizeAttenuation),e.push(t.morphTargetsCount),e.push(t.morphAttributeCount),e.push(t.numSunLights),e.push(t.numDirLights),e.push(t.numPointLights),e.push(t.numSpotLights),e.push(t.numSpotLightMaps),e.push(t.numHemiLights),e.push(t.numRectAreaLights),e.push(t.numSunLightShadows),e.push(t.numDirLightShadows),e.push(t.numPointLightShadows),e.push(t.numSpotLightShadows),e.push(t.numSpotLightShadowsWithMaps),e.push(t.numLightProbes),e.push(t.shadowMapType),e.push(t.toneMapping),e.push(t.numClippingPlanes),e.push(t.numClipIntersection),e.push(t.depthPacking)}function v(e,t){o.disableAll(),t.instancing&&o.enable(0),t.instancingColor&&o.enable(1),t.instancingMorph&&o.enable(2),t.matcap&&o.enable(3),t.envMap&&o.enable(4),t.normalMapObjectSpace&&o.enable(5),t.normalMapTangentSpace&&o.enable(6),t.clearcoat&&o.enable(7),t.iridescence&&o.enable(8),t.alphaTest&&o.enable(9),t.vertexColors&&o.enable(10),t.vertexAlphas&&o.enable(11),t.vertexUv1s&&o.enable(12),t.vertexUv2s&&o.enable(13),t.vertexUv3s&&o.enable(14),t.vertexTangents&&o.enable(15),t.anisotropy&&o.enable(16),t.alphaHash&&o.enable(17),t.batching&&o.enable(18),t.dispersion&&o.enable(19),t.retroreflection&&o.enable(24),t.batchingColor&&o.enable(20),t.gradientMap&&o.enable(21),t.packedNormalMap&&o.enable(22),t.vertexNormals&&o.enable(23),e.push(o.mask),o.disableAll(),t.fog&&o.enable(0),t.useFog&&o.enable(1),t.flatShading&&o.enable(2),t.logarithmicDepthBuffer&&o.enable(3),t.reversedDepthBuffer&&o.enable(4),t.skinning&&o.enable(5),t.morphTargets&&o.enable(6),t.morphNormals&&o.enable(7),t.morphColors&&o.enable(8),t.premultipliedAlpha&&o.enable(9),t.shadowMapEnabled&&o.enable(10),t.doubleSided&&o.enable(11),t.flipSided&&o.enable(12),t.useDepthPacking&&o.enable(13),t.dithering&&o.enable(14),t.transmission&&o.enable(15),t.sheen&&o.enable(16),t.opaque&&o.enable(17),t.pointsUvs&&o.enable(18),t.decodeVideoTexture&&o.enable(19),t.decodeVideoTextureEmissive&&o.enable(20),t.alphaToCoverage&&o.enable(21),t.numLightProbeGrids>0&&o.enable(22),t.hasPositionAttribute&&o.enable(23),e.push(o.mask)}function y(e){let t=p[e.type],n;if(t){let e=Js[t];n=Mo.clone(e.uniforms)}else n=e.uniforms;return n}function b(t,n){let r=u.get(n);return r===void 0?(r=new Su(e,n,t,i),l.push(r),u.set(n,r)):++r.usedTimes,r}function x(e){if(--e.usedTimes===0){let t=l.indexOf(e);l[t]=l[l.length-1],l.pop(),u.delete(e.cacheKey),e.destroy()}}function S(e){s.remove(e)}function C(){s.dispose()}return{getParameters:h,getProgramCacheKey:g,getUniforms:y,acquireProgram:b,releaseProgram:x,releaseShaderCache:S,programs:l,dispose:C}}function Ou(){let e=new WeakMap;function t(t){return e.has(t)}function n(t){let n=e.get(t);return n===void 0&&(n={},e.set(t,n)),n}function r(t){e.delete(t)}function i(t,n,r){e.get(t)[n]=r}function a(){e=new WeakMap}return{has:t,get:n,remove:r,update:i,dispose:a}}function ku(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.material.id===t.material.id?e.materialVariant===t.materialVariant?e.z===t.z?e.id-t.id:e.z-t.z:e.materialVariant-t.materialVariant:e.material.id-t.material.id:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function Au(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.z===t.z?e.id-t.id:t.z-e.z:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function ju(){let e=[],t=0,n=[],r=[],i=[];function a(){t=0,n.length=0,r.length=0,i.length=0}function o(e){let t=0;return e.isInstancedMesh&&(t+=2),e.isSkinnedMesh&&(t+=1),t}function s(n,r,i,a,s,c){let l=e[t];return l===void 0?(l={id:n.id,object:n,geometry:r,material:i,materialVariant:o(n),groupOrder:a,renderOrder:n.renderOrder,z:s,group:c},e[t]=l):(l.id=n.id,l.object=n,l.geometry=r,l.material=i,l.materialVariant=o(n),l.groupOrder=a,l.renderOrder=n.renderOrder,l.z=s,l.group=c),t++,l}function c(e,t,a,o,c,l,u){u.reversedDepth===!0&&(c=-c);let d=s(e,t,a,o,c,l);a.transmission>0?r.push(d):a.transparent===!0?i.push(d):n.push(d)}function l(e,t,a,o,c,l){let u=s(e,t,a,o,c,l);a.transmission>0?r.unshift(u):a.transparent===!0?i.unshift(u):n.unshift(u)}function u(e,t){n.length>1&&n.sort(e||ku),r.length>1&&r.sort(t||Au),i.length>1&&i.sort(t||Au)}function d(){for(let n=t,r=e.length;n<r;n++){let t=e[n];if(t.id===null)break;t.id=null,t.object=null,t.geometry=null,t.material=null,t.group=null}}return{opaque:n,transmissive:r,transparent:i,init:a,push:c,unshift:l,finish:d,sort:u}}function Mu(){let e=new WeakMap;function t(t,n){let r=e.get(t),i;return r===void 0?(i=new ju,e.set(t,[i])):n>=r.length?(i=new ju,r.push(i)):i=r[n],i}function n(){e=new WeakMap}return{get:t,dispose:n}}function Nu(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`SunLight`:case`DirectionalLight`:n={direction:new K,color:new q};break;case`SpotLight`:n={position:new K,direction:new K,color:new q,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case`PointLight`:n={position:new K,color:new q,distance:0,decay:0};break;case`HemisphereLight`:n={direction:new K,skyColor:new q,groundColor:new q};break;case`RectAreaLight`:n={color:new q,position:new K,halfWidth:new K,halfHeight:new K}}return e[t.id]=n,n}}}function Pu(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`SunLight`:case`DirectionalLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new W};break;case`SpotLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new W};break;case`PointLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new W,shadowCameraNear:1,shadowCameraFar:1e3}}return e[t.id]=n,n}}}var Fu=0;function Iu(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+ +!!t.map-!!e.map}function Lu(e){let t=new Nu,n=Pu(),r={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let e=0;e<9;e++)r.probe.push(new K);let i=new K,a=new Yt,o=new Yt;function s(i){let a=0,o=0,s=0;for(let e=0;e<9;e++)r.probe[e].set(0,0,0);let c=0,l=0,u=0,d=0,f=0,p=0,m=0,h=0,g=0,_=0,v=0,y=0,b=0,x=0;i.sort(Iu);for(let e=0,S=i.length;e<S;e++){let S=i[e],C=S.color,w=S.intensity,T=S.distance,E=null;if(S.shadow&&S.shadow.map&&(E=S.shadow.map.texture.format===1030?S.shadow.map.texture:S.shadow.map.depthTexture||S.shadow.map.texture),S.isAmbientLight)a+=C.r*w,o+=C.g*w,s+=C.b*w;else if(S.isLightProbe){for(let e=0;e<9;e++)r.probe[e].addScaledVector(S.sh.coefficients[e],w);x++}else if(S.isSunLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize.copy(e.mapSize).multiply(e.getFrameExtents()),r.sunShadow[l]=t,r.sunShadowMap[l]=E;let i=e.getViewportCount();for(let t=0;t<i;t++)r.sunShadowMatrix[u+t]=e.getMatrix(t),r.sunShadowCascade[u+t]=e._cascadeData[t];u+=i,l++}r.sun[c]=e,c++}else if(S.isDirectionalLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,r.directionalShadow[d]=t,r.directionalShadowMap[d]=E,r.directionalShadowMatrix[d]=S.shadow.matrix,g++}r.directional[d]=e,d++}else if(S.isSpotLight){let e=t.get(S);e.position.setFromMatrixPosition(S.matrixWorld),e.color.copy(C).multiplyScalar(w),e.distance=T,e.coneCos=Math.cos(S.angle),e.penumbraCos=Math.cos(S.angle*(1-S.penumbra)),e.decay=S.decay,r.spot[p]=e;let i=S.shadow;if(S.map&&(r.spotLightMap[y]=S.map,y++,i.updateMatrices(S),S.castShadow&&b++),r.spotLightMatrix[p]=i.matrix,S.castShadow){let e=n.get(S);e.shadowIntensity=i.intensity,e.shadowBias=i.bias,e.shadowNormalBias=i.normalBias,e.shadowRadius=i.radius,e.shadowMapSize=i.mapSize,r.spotShadow[p]=e,r.spotShadowMap[p]=E,v++}p++}else if(S.isRectAreaLight){let e=t.get(S);e.color.copy(C).multiplyScalar(w),e.halfWidth.set(S.width*.5,0,0),e.halfHeight.set(0,S.height*.5,0),r.rectArea[m]=e,m++}else if(S.isPointLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),e.distance=S.distance,e.decay=S.decay,S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,t.shadowCameraNear=e.camera.near,t.shadowCameraFar=e.camera.far,r.pointShadow[f]=t,r.pointShadowMap[f]=E,r.pointShadowMatrix[f]=S.shadow.matrix,_++}r.point[f]=e,f++}else if(S.isHemisphereLight){let e=t.get(S);e.skyColor.copy(S.color).multiplyScalar(w),e.groundColor.copy(S.groundColor).multiplyScalar(w),r.hemi[h]=e,h++}}m>0&&(e.has(`OES_texture_float_linear`)===!0?(r.rectAreaLTC1=Y.LTC_FLOAT_1,r.rectAreaLTC2=Y.LTC_FLOAT_2):(r.rectAreaLTC1=Y.LTC_HALF_1,r.rectAreaLTC2=Y.LTC_HALF_2)),r.ambient[0]=a,r.ambient[1]=o,r.ambient[2]=s;let S=r.hash;(S.sunLength!==c||S.directionalLength!==d||S.pointLength!==f||S.spotLength!==p||S.rectAreaLength!==m||S.hemiLength!==h||S.numSunShadows!==l||S.numDirectionalShadows!==g||S.numPointShadows!==_||S.numSpotShadows!==v||S.numSpotMaps!==y||S.numLightProbes!==x)&&(r.sun.length=c,r.directional.length=d,r.spot.length=p,r.rectArea.length=m,r.point.length=f,r.hemi.length=h,r.sunShadow.length=l,r.sunShadowMap.length=l,r.sunShadowMatrix.length=u,r.sunShadowCascade.length=u,r.directionalShadow.length=g,r.directionalShadowMap.length=g,r.directionalShadowMatrix.length=g,r.pointShadow.length=_,r.pointShadowMap.length=_,r.pointShadowMatrix.length=_,r.spotShadow.length=v,r.spotShadowMap.length=v,r.spotLightMatrix.length=v+y-b,r.spotLightMap.length=y,r.numSpotLightShadowsWithMaps=b,r.numLightProbes=x,S.sunLength=c,S.directionalLength=d,S.pointLength=f,S.spotLength=p,S.rectAreaLength=m,S.hemiLength=h,S.numSunShadows=l,S.numDirectionalShadows=g,S.numPointShadows=_,S.numSpotShadows=v,S.numSpotMaps=y,S.numLightProbes=x,r.version=Fu++)}function c(e,t){let n=0,s=0,c=0,l=0,u=0,d=0,f=t.matrixWorldInverse;for(let t=0,p=e.length;t<p;t++){let p=e[t];if(p.isSunLight){let e=r.sun[n];e.direction.setFromMatrixPosition(p.matrixWorld),e.direction.transformDirection(f),n++}else if(p.isDirectionalLight){let e=r.directional[s];e.direction.setFromMatrixPosition(p.matrixWorld),i.setFromMatrixPosition(p.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(f),s++}else if(p.isSpotLight){let e=r.spot[l];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),e.direction.setFromMatrixPosition(p.matrixWorld),i.setFromMatrixPosition(p.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(f),l++}else if(p.isRectAreaLight){let e=r.rectArea[u];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),o.identity(),a.copy(p.matrixWorld),a.premultiply(f),o.extractRotation(a),e.halfWidth.set(p.width*.5,0,0),e.halfHeight.set(0,p.height*.5,0),e.halfWidth.applyMatrix4(o),e.halfHeight.applyMatrix4(o),u++}else if(p.isPointLight){let e=r.point[c];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),c++}else if(p.isHemisphereLight){let e=r.hemi[d];e.direction.setFromMatrixPosition(p.matrixWorld),e.direction.transformDirection(f),d++}}}return{setup:s,setupView:c,state:r}}function Ru(e){let t=new Lu(e),n=[],r=[],i=[];function a(e){d.camera=e,n.length=0,r.length=0,i.length=0}function o(e){n.push(e)}function s(e){r.push(e)}function c(e){i.push(e)}function l(){t.setup(n)}function u(e){t.setupView(n,e)}let d={lightsArray:n,shadowsArray:r,lightProbeGridArray:i,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:a,state:d,setupLights:l,setupLightsView:u,pushLight:o,pushShadow:s,pushLightProbeGrid:c}}function zu(e){let t=new WeakMap;function n(n,r=0){let i=t.get(n),a;return i===void 0?(a=new Ru(e),t.set(n,[a])):r>=i.length?(a=new Ru(e),i.push(a)):a=i[r],a}function r(){t=new WeakMap}return{get:n,dispose:r}}var Bu=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Vu=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,Hu=[new K(1,0,0),new K(-1,0,0),new K(0,1,0),new K(0,-1,0),new K(0,0,1),new K(0,0,-1)],Uu=[new K(0,-1,0),new K(0,-1,0),new K(0,0,1),new K(0,0,-1),new K(0,-1,0),new K(0,-1,0)],Wu=new Yt,Gu=new K,Ku=new K;function qu(e,t,n){let i=new ji,a=new W,s=new W,c=new Wt,l=new zo,u=new Bo,d={},f=n.maxTextureSize,p={0:1,1:0,2:2},_=new Fo({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new W},radius:{value:4}},vertexShader:Bu,fragmentShader:Vu}),v=_.clone();v.defines.HORIZONTAL_PASS=1;let y=new Dr;y.setAttribute(`position`,new fr(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let b=new J(y,_),x=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let S=this.type;this.render=function(t,n,l){if(x.enabled===!1||x.autoUpdate===!1&&x.needsUpdate===!1||t.length===0)return;this.type===2&&(V(`WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead.`),this.type=1);let u=e.getRenderTarget(),d=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),_=e.state;_.setBlending(0),_.buffers.depth.getReversed()===!0?_.buffers.color.setClear(0,0,0,0):_.buffers.color.setClear(1,1,1,1),_.buffers.depth.setTest(!0),_.setScissorTest(!1);let v=S!==this.type;v&&n.traverse(function(e){e.material&&(Array.isArray(e.material)?e.material.forEach(e=>e.needsUpdate=!0):e.material.needsUpdate=!0)});for(let u=0,d=t.length;u<d;u++){let d=t[u],p=d.shadow;if(p===void 0){V(`WebGLShadowMap:`,d,`has no shadow.`);continue}if(p.autoUpdate===!1&&p.needsUpdate===!1)continue;a.copy(p.mapSize);let y=p.getFrameExtents();a.multiply(y),s.copy(p.mapSize),(a.x>f||a.y>f)&&(a.x>f&&(s.x=Math.floor(f/y.x),a.x=s.x*y.x,p.mapSize.x=s.x),a.y>f&&(s.y=Math.floor(f/y.y),a.y=s.y*y.y,p.mapSize.y=s.y));let b=e.state.buffers.depth.getReversed();if(p.camera._reversedDepth=b,p.map===null||v===!0){if(p.map!==null&&(p.map.depthTexture!==null&&(p.map.depthTexture.dispose(),p.map.depthTexture=null),p.map.dispose()),this.type===3){if(d.isPointLight){V(`WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.`);continue}p.map=new Kt(a.x,a.y,{format:k,type:g,minFilter:o,magFilter:o,generateMipmaps:!1}),p.map.texture.name=d.name+`.shadowMap`,p.map.depthTexture=new Ji(a.x,a.y,h),p.map.depthTexture.name=d.name+`.shadowMapDepth`,p.map.depthTexture.format=T,p.map.depthTexture.compareFunction=null,p.map.depthTexture.minFilter=r,p.map.depthTexture.magFilter=r}else d.isPointLight?(p.map=new wc(a.x),p.map.depthTexture=new Yi(a.x,m)):(p.map=new Kt(a.x,a.y),p.map.depthTexture=new Ji(a.x,a.y,m)),p.map.depthTexture.name=d.name+`.shadowMap`,p.map.depthTexture.format=T,this.type===1?(p.map.depthTexture.compareFunction=b?518:515,p.map.depthTexture.minFilter=o,p.map.depthTexture.magFilter=o):(p.map.depthTexture.compareFunction=null,p.map.depthTexture.minFilter=r,p.map.depthTexture.magFilter=r);p.camera.updateProjectionMatrix()}p.map.isWebGLCubeRenderTarget!==!0&&(p.map.width!==a.x||p.map.height!==a.y)&&p.map.setSize(a.x,a.y);let x=p.map.isWebGLCubeRenderTarget?6:p.getViewportCount();d.isPointLight!==!0&&p.updateMatrices(d,l);for(let t=0;t<x;t++){let r=p.getCamera(t);if(d.isPointLight){let e=p.camera,n=p.matrix,r=d.distance||e.far;r!==e.far&&(e.far=r,e.updateProjectionMatrix()),Gu.setFromMatrixPosition(d.matrixWorld),e.position.copy(Gu),Ku.copy(e.position),Ku.add(Hu[t]),e.up.copy(Uu[t]),e.lookAt(Ku),e.updateMatrixWorld(),n.makeTranslation(-Gu.x,-Gu.y,-Gu.z),Wu.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),p._frustum.setFromProjectionMatrix(Wu,e.coordinateSystem,e.reversedDepth)}if(p.map.isWebGLCubeRenderTarget)e.setRenderTarget(p.map,t),e.clear();else{t===0&&(e.setRenderTarget(p.map),e.clear());let n=p.getViewport(t);c.set(s.x*n.x,s.y*n.y,s.x*n.z,s.y*n.w),_.viewport(c)}i=p.getFrustum(t),E(n,l,r,d,this.type)}p.isPointLightShadow!==!0&&this.type===3&&C(p,l),p.needsUpdate=!1}S=this.type,x.needsUpdate=!1,e.setRenderTarget(u,d,p)};function C(n,r){let i=t.update(b);_.defines.VSM_SAMPLES!==n.blurSamples&&(_.defines.VSM_SAMPLES=n.blurSamples,v.defines.VSM_SAMPLES=n.blurSamples,_.needsUpdate=!0,v.needsUpdate=!0),n.mapPass===null?n.mapPass=new Kt(a.x,a.y,{format:k,type:g}):(n.mapPass.width!==n.map.width||n.mapPass.height!==n.map.height)&&n.mapPass.setSize(n.map.width,n.map.height),_.uniforms.shadow_pass.value=n.map.depthTexture,_.uniforms.resolution.value.set(n.map.width,n.map.height),_.uniforms.radius.value=n.radius,e.setRenderTarget(n.mapPass),e.clear(),e.renderBufferDirect(r,null,i,_,b,null),v.uniforms.shadow_pass.value=n.mapPass.texture,v.uniforms.resolution.value.set(n.map.width,n.map.height),v.uniforms.radius.value=n.radius,e.setRenderTarget(n.map),e.clear(),e.renderBufferDirect(r,null,i,v,b,null)}function w(t,n,r,i){let a=null,o=r.isPointLight===!0?t.customDistanceMaterial:t.customDepthMaterial;if(o!==void 0)a=o;else if(a=r.isPointLight===!0?u:l,e.localClippingEnabled&&n.clipShadows===!0&&Array.isArray(n.clippingPlanes)&&n.clippingPlanes.length!==0||n.displacementMap&&n.displacementScale!==0||n.alphaMap&&n.alphaTest>0||n.map&&n.alphaTest>0||n.alphaToCoverage===!0){let e=a.uuid,t=n.uuid,r=d[e];r===void 0&&(r={},d[e]=r);let i=r[t];i===void 0&&(i=a.clone(),r[t]=i,n.addEventListener(`dispose`,D)),a=i}if(a.visible=n.visible,a.wireframe=n.wireframe,i===3?a.side=n.shadowSide===null?n.side:n.shadowSide:a.side=n.shadowSide===null?p[n.side]:n.shadowSide,a.alphaMap=n.alphaMap,a.alphaTest=n.alphaToCoverage===!0?.5:n.alphaTest,a.map=n.map,a.clipShadows=n.clipShadows,a.clippingPlanes=n.clippingPlanes,a.clipIntersection=n.clipIntersection,a.displacementMap=n.displacementMap,a.displacementScale=n.displacementScale,a.displacementBias=n.displacementBias,a.wireframeLinewidth=n.wireframeLinewidth,a.linewidth=n.linewidth,r.isPointLight===!0&&a.isMeshDistanceMaterial===!0){let t=e.properties.get(a);t.light=r}return a}function E(n,r,a,o,s){if(n.visible===!1)return;if(n.layers.test(r.layers)&&(n.isMesh||n.isLine||n.isPoints)&&(n.castShadow||n.receiveShadow&&s===3)&&(!n.frustumCulled||n.intersectsFrustum(i))){n.modelViewMatrix.multiplyMatrices(a.matrixWorldInverse,n.matrixWorld);let i=t.update(n),c=n.material;if(Array.isArray(c)){let t=i.groups;for(let l=0,u=t.length;l<u;l++){let u=t[l],d=c[u.materialIndex];if(d&&d.visible){let t=w(n,d,o,s);n.onBeforeShadow(e,n,r,a,i,t,u),e.renderBufferDirect(a,null,i,t,n,u),n.onAfterShadow(e,n,r,a,i,t,u)}}}else if(c.visible){let t=w(n,c,o,s);n.onBeforeShadow(e,n,r,a,i,t,null),e.renderBufferDirect(a,null,i,t,n,null),n.onAfterShadow(e,n,r,a,i,t,null)}}let c=n.children;for(let e=0,t=c.length;e<t;e++)E(c[e],r,a,o,s)}function D(e){e.target.removeEventListener(`dispose`,D);for(let t in d){let n=d[t],r=e.target.uuid;r in n&&(n[r].dispose(),delete n[r])}}}function Ju(e,t){function n(){let t=!1,n=new Wt,r=null,i=new Wt(0,0,0,0);return{setMask:function(n){r!==n&&!t&&(e.colorMask(n,n,n,n),r=n)},setLocked:function(e){t=e},setClear:function(t,r,a,o,s){s===!0&&(t*=o,r*=o,a*=o),n.set(t,r,a,o),i.equals(n)===!1&&(e.clearColor(t,r,a,o),i.copy(n))},reset:function(){t=!1,r=null,i.set(-1,0,0,0)}}}function r(){let n=!1,r=!1,i=null,a=null,o=null;return{setReversed:function(e){if(r!==e){let n=t.get(`EXT_clip_control`);e?n.clipControlEXT(n.LOWER_LEFT_EXT,n.ZERO_TO_ONE_EXT):n.clipControlEXT(n.LOWER_LEFT_EXT,n.NEGATIVE_ONE_TO_ONE_EXT),r=e;let i=o;o=null,this.setClear(i)}},getReversed:function(){return r},setTest:function(t){t?L(e.DEPTH_TEST):se(e.DEPTH_TEST)},setMask:function(t){i!==t&&!n&&(e.depthMask(t),i=t)},setFunc:function(t){if(r&&(t=Qe[t]),a!==t){switch(t){case 0:e.depthFunc(e.NEVER);break;case 1:e.depthFunc(e.ALWAYS);break;case 2:e.depthFunc(e.LESS);break;case 3:e.depthFunc(e.LEQUAL);break;case 4:e.depthFunc(e.EQUAL);break;case 5:e.depthFunc(e.GEQUAL);break;case 6:e.depthFunc(e.GREATER);break;case 7:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}a=t}},setLocked:function(e){n=e},setClear:function(t){o!==t&&(o=t,r&&(t=1-t),e.clearDepth(t))},reset:function(){n=!1,i=null,a=null,o=null,r=!1}}}function i(){let t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null;return{setTest:function(n){t||(n?L(e.STENCIL_TEST):se(e.STENCIL_TEST))},setMask:function(r){n!==r&&!t&&(e.stencilMask(r),n=r)},setFunc:function(t,n,o){(r!==t||i!==n||a!==o)&&(e.stencilFunc(t,n,o),r=t,i=n,a=o)},setOp:function(t,n,r){(o!==t||s!==n||c!==r)&&(e.stencilOp(t,n,r),o=t,s=n,c=r)},setLocked:function(e){t=e},setClear:function(t){l!==t&&(e.clearStencil(t),l=t)},reset:function(){t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null}}}let a=new n,o=new r,s=new i,c=new WeakMap,l=new WeakMap,u={},d={},f={},p=new WeakMap,m=[],h=null,g=!1,_=null,v=null,y=null,b=null,x=null,S=null,C=null,w=new q(0,0,0),T=0,E=!1,D=null,O=null,k=null,A=null,j=null,M=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),ee=!1,N=0,te=e.getParameter(e.VERSION);te.indexOf(`WebGL`)===-1?te.indexOf(`OpenGL ES`)!==-1&&(N=parseFloat(/^OpenGL ES (\d)/.exec(te)[1]),ee=N>=2):(N=parseFloat(/^WebGL (\d)/.exec(te)[1]),ee=N>=1);let P=null,ne={},F=e.getParameter(e.SCISSOR_BOX),re=e.getParameter(e.VIEWPORT),ie=new Wt().fromArray(F),I=new Wt().fromArray(re);function ae(t,n,r,i){let a=new Uint8Array(4),o=e.createTexture();e.bindTexture(t,o),e.texParameteri(t,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(t,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let o=0;o<r;o++)t===e.TEXTURE_3D||t===e.TEXTURE_2D_ARRAY?e.texImage3D(n,0,e.RGBA,1,1,i,0,e.RGBA,e.UNSIGNED_BYTE,a):e.texImage2D(n+o,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,a);return o}let oe={};oe[e.TEXTURE_2D]=ae(e.TEXTURE_2D,e.TEXTURE_2D,1),oe[e.TEXTURE_CUBE_MAP]=ae(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),oe[e.TEXTURE_2D_ARRAY]=ae(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),oe[e.TEXTURE_3D]=ae(e.TEXTURE_3D,e.TEXTURE_3D,1,1),a.setClear(0,0,0,1),o.setClear(1),s.setClear(0),L(e.DEPTH_TEST),o.setFunc(3),he(!1),ge(1),L(e.CULL_FACE),pe(0);function L(t){u[t]!==!0&&(e.enable(t),u[t]=!0)}function se(t){u[t]!==!1&&(e.disable(t),u[t]=!1)}function ce(t,n){return f[t]!==n&&(e.bindFramebuffer(t,n),f[t]=n,t===e.DRAW_FRAMEBUFFER&&(f[e.FRAMEBUFFER]=n),t===e.FRAMEBUFFER&&(f[e.DRAW_FRAMEBUFFER]=n),!0)}function le(t,n){let r=m,i=!1;if(t){r=p.get(n),r===void 0&&(r=[],p.set(n,r));let a=t.textures;if(r.length!==a.length||r[0]!==e.COLOR_ATTACHMENT0){for(let t=0,n=a.length;t<n;t++)r[t]=e.COLOR_ATTACHMENT0+t;r.length=a.length,i=!0}}else r[0]!==e.BACK&&(r[0]=e.BACK,i=!0);i&&e.drawBuffers(r)}function ue(t){return h!==t&&(e.useProgram(t),h=t,!0)}let de={100:e.FUNC_ADD,101:e.FUNC_SUBTRACT,102:e.FUNC_REVERSE_SUBTRACT};de[103]=e.MIN,de[104]=e.MAX;let fe={200:e.ZERO,201:e.ONE,202:e.SRC_COLOR,204:e.SRC_ALPHA,210:e.SRC_ALPHA_SATURATE,208:e.DST_COLOR,206:e.DST_ALPHA,203:e.ONE_MINUS_SRC_COLOR,205:e.ONE_MINUS_SRC_ALPHA,209:e.ONE_MINUS_DST_COLOR,207:e.ONE_MINUS_DST_ALPHA,211:e.CONSTANT_COLOR,212:e.ONE_MINUS_CONSTANT_COLOR,213:e.CONSTANT_ALPHA,214:e.ONE_MINUS_CONSTANT_ALPHA};function pe(t,n,r,i,a,o,s,c,l,u){if(t===0){g===!0&&(se(e.BLEND),g=!1);return}if(g===!1&&(L(e.BLEND),g=!0),t!==5){if(t!==_||u!==E){if((v!==100||x!==100)&&(e.blendEquation(e.FUNC_ADD),v=100,x=100),u)switch(t){case 1:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFunc(e.ONE,e.ONE);break;case 3:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case 4:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:H(`WebGLState: Invalid blending: `,t)}else switch(t){case 1:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case 3:H(`WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true`);break;case 4:H(`WebGLState: MultiplyBlending requires material.premultipliedAlpha = true`);break;default:H(`WebGLState: Invalid blending: `,t)}y=null,b=null,S=null,C=null,w.set(0,0,0),T=0,_=t,E=u}return}a||=n,o||=r,s||=i,(n!==v||a!==x)&&(e.blendEquationSeparate(de[n],de[a]),v=n,x=a),(r!==y||i!==b||o!==S||s!==C)&&(e.blendFuncSeparate(fe[r],fe[i],fe[o],fe[s]),y=r,b=i,S=o,C=s),(c.equals(w)===!1||l!==T)&&(e.blendColor(c.r,c.g,c.b,l),w.copy(c),T=l),_=t,E=!1}function me(t,n){t.side===2?se(e.CULL_FACE):L(e.CULL_FACE);let r=t.side===1;n&&(r=!r),he(r),t.blending===1&&t.transparent===!1?pe(0):pe(t.blending,t.blendEquation,t.blendSrc,t.blendDst,t.blendEquationAlpha,t.blendSrcAlpha,t.blendDstAlpha,t.blendColor,t.blendAlpha,t.premultipliedAlpha),o.setFunc(t.depthFunc),o.setTest(t.depthTest),o.setMask(t.depthWrite),a.setMask(t.colorWrite);let i=t.stencilWrite;s.setTest(i),i&&(s.setMask(t.stencilWriteMask),s.setFunc(t.stencilFunc,t.stencilRef,t.stencilFuncMask),s.setOp(t.stencilFail,t.stencilZFail,t.stencilZPass)),ve(t.polygonOffset,t.polygonOffsetFactor,t.polygonOffsetUnits),t.alphaToCoverage===!0?L(e.SAMPLE_ALPHA_TO_COVERAGE):se(e.SAMPLE_ALPHA_TO_COVERAGE)}function he(t){D!==t&&(t?e.frontFace(e.CW):e.frontFace(e.CCW),D=t)}function ge(t){t===0?se(e.CULL_FACE):(L(e.CULL_FACE),t!==O&&(t===1?e.cullFace(e.BACK):t===2?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))),O=t}function _e(t){t!==k&&(ee&&e.lineWidth(t),k=t)}function ve(t,n,r){t?(L(e.POLYGON_OFFSET_FILL),(A!==n||j!==r)&&(A=n,j=r,o.getReversed()&&(n=-n),e.polygonOffset(n,r))):se(e.POLYGON_OFFSET_FILL)}function ye(t){t?L(e.SCISSOR_TEST):se(e.SCISSOR_TEST)}function be(t){t===void 0&&(t=e.TEXTURE0+M-1),P!==t&&(e.activeTexture(t),P=t)}function xe(t,n,r){r===void 0&&(r=P===null?e.TEXTURE0+M-1:P);let i=ne[r];i===void 0&&(i={type:void 0,texture:void 0},ne[r]=i),(i.type!==t||i.texture!==n)&&(P!==r&&(e.activeTexture(r),P=r),e.bindTexture(t,n||oe[t]),i.type=t,i.texture=n)}function Se(){let t=ne[P];t!==void 0&&t.type!==void 0&&(e.bindTexture(t.type,null),t.type=void 0,t.texture=void 0)}function Ce(){try{e.compressedTexImage2D(...arguments)}catch(e){H(`WebGLState:`,e)}}function we(){try{e.compressedTexImage3D(...arguments)}catch(e){H(`WebGLState:`,e)}}function Te(){try{e.texSubImage2D(...arguments)}catch(e){H(`WebGLState:`,e)}}function Ee(){try{e.texSubImage3D(...arguments)}catch(e){H(`WebGLState:`,e)}}function De(){try{e.compressedTexSubImage2D(...arguments)}catch(e){H(`WebGLState:`,e)}}function Oe(){try{e.compressedTexSubImage3D(...arguments)}catch(e){H(`WebGLState:`,e)}}function ke(){try{e.texStorage2D(...arguments)}catch(e){H(`WebGLState:`,e)}}function Ae(){try{e.texStorage3D(...arguments)}catch(e){H(`WebGLState:`,e)}}function R(){try{e.texImage2D(...arguments)}catch(e){H(`WebGLState:`,e)}}function je(){try{e.texImage3D(...arguments)}catch(e){H(`WebGLState:`,e)}}function Me(t){return d[t]===void 0?e.getParameter(t):d[t]}function Ne(t,n){d[t]!==n&&(e.pixelStorei(t,n),d[t]=n)}function z(t){ie.equals(t)===!1&&(e.scissor(t.x,t.y,t.z,t.w),ie.copy(t))}function Pe(t){I.equals(t)===!1&&(e.viewport(t.x,t.y,t.z,t.w),I.copy(t))}function B(t,n){let r=l.get(n);r===void 0&&(r=new WeakMap,l.set(n,r));let i=r.get(t);i===void 0&&(i=e.getUniformBlockIndex(n,t.name),r.set(t,i))}function Fe(t,n){let r=l.get(n).get(t);c.get(n)!==r&&(e.uniformBlockBinding(n,r,t.__bindingPointIndex),c.set(n,r))}function Ie(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),o.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),e.pixelStorei(e.PACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,e.BROWSER_DEFAULT_WEBGL),e.pixelStorei(e.PACK_ROW_LENGTH,0),e.pixelStorei(e.PACK_SKIP_PIXELS,0),e.pixelStorei(e.PACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_ROW_LENGTH,0),e.pixelStorei(e.UNPACK_IMAGE_HEIGHT,0),e.pixelStorei(e.UNPACK_SKIP_PIXELS,0),e.pixelStorei(e.UNPACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_SKIP_IMAGES,0),u={},d={},P=null,ne={},f={},p=new WeakMap,m=[],h=null,g=!1,_=null,v=null,y=null,b=null,x=null,S=null,C=null,w=new q(0,0,0),T=0,E=!1,D=null,O=null,k=null,A=null,j=null,ie.set(0,0,e.canvas.width,e.canvas.height),I.set(0,0,e.canvas.width,e.canvas.height),a.reset(),o.reset(),s.reset()}return{buffers:{color:a,depth:o,stencil:s},enable:L,disable:se,bindFramebuffer:ce,drawBuffers:le,useProgram:ue,setBlending:pe,setMaterial:me,setFlipSided:he,setCullFace:ge,setLineWidth:_e,setPolygonOffset:ve,setScissorTest:ye,activeTexture:be,bindTexture:xe,unbindTexture:Se,compressedTexImage2D:Ce,compressedTexImage3D:we,texImage2D:R,texImage3D:je,pixelStorei:Ne,getParameter:Me,updateUBOMapping:B,uniformBlockBinding:Fe,texStorage2D:ke,texStorage3D:Ae,texSubImage2D:Te,texSubImage3D:Ee,compressedTexSubImage2D:De,compressedTexSubImage3D:Oe,scissor:z,viewport:Pe,reset:Ie}}function Yu(l,u,d,f,p,m,h){let g=u.has(`WEBGL_multisampled_render_to_texture`)?u.get(`WEBGL_multisampled_render_to_texture`):null,_=typeof navigator>`u`?!1:/OculusBrowser/g.test(navigator.userAgent),v=new W,y=new WeakMap,b=new Set,x,S=new WeakMap,C=!1;try{C=typeof OffscreenCanvas<`u`&&new OffscreenCanvas(1,1).getContext(`2d`)!==null}catch{}function w(e,t){return C?new OffscreenCanvas(e,t):Ge(`canvas`)}function T(e,t,n){let r=1,i=Me(e);if((i.width>n||i.height>n)&&(r=n/Math.max(i.width,i.height)),r<1){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap||typeof VideoFrame<`u`&&e instanceof VideoFrame){let n=Math.floor(r*i.width),a=Math.floor(r*i.height);x===void 0&&(x=w(n,a));let o=t?w(n,a):x;return o.width=n,o.height=a,o.getContext(`2d`).drawImage(e,0,0,n,a),V(`WebGLRenderer: Texture has been resized from (`+i.width+`x`+i.height+`) to (`+n+`x`+a+`).`),o}return`data`in e&&V(`WebGLRenderer: Image in DataTexture is too big (`+i.width+`x`+i.height+`).`),e}return e}function D(e){return e.generateMipmaps}function O(e){l.generateMipmap(e)}function k(e){return e.isWebGLCubeRenderTarget?l.TEXTURE_CUBE_MAP:e.isWebGL3DRenderTarget?l.TEXTURE_3D:e.isWebGLArrayRenderTarget||e.isCompressedArrayTexture?l.TEXTURE_2D_ARRAY:l.TEXTURE_2D}function A(e,t,n,r,i,a=!1){if(e!==null){if(l[e]!==void 0)return l[e];V(`WebGLRenderer: Attempt to use non-existing WebGL internal format '`+e+`'`)}let o;r&&(o=u.get(`EXT_texture_norm16`),o||V(`WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension`));let s=t;if(t===l.RED&&(n===l.FLOAT&&(s=l.R32F),n===l.HALF_FLOAT&&(s=l.R16F),n===l.UNSIGNED_BYTE&&(s=l.R8),n===l.UNSIGNED_SHORT&&o&&(s=o.R16_EXT),n===l.SHORT&&o&&(s=o.R16_SNORM_EXT)),t===l.RED_INTEGER&&(n===l.UNSIGNED_BYTE&&(s=l.R8UI),n===l.UNSIGNED_SHORT&&(s=l.R16UI),n===l.UNSIGNED_INT&&(s=l.R32UI),n===l.BYTE&&(s=l.R8I),n===l.SHORT&&(s=l.R16I),n===l.INT&&(s=l.R32I)),t===l.RG&&(n===l.FLOAT&&(s=l.RG32F),n===l.HALF_FLOAT&&(s=l.RG16F),n===l.UNSIGNED_BYTE&&(s=l.RG8),n===l.UNSIGNED_SHORT&&o&&(s=o.RG16_EXT),n===l.SHORT&&o&&(s=o.RG16_SNORM_EXT)),t===l.RG_INTEGER&&(n===l.UNSIGNED_BYTE&&(s=l.RG8UI),n===l.UNSIGNED_SHORT&&(s=l.RG16UI),n===l.UNSIGNED_INT&&(s=l.RG32UI),n===l.BYTE&&(s=l.RG8I),n===l.SHORT&&(s=l.RG16I),n===l.INT&&(s=l.RG32I)),t===l.RGB_INTEGER&&(n===l.UNSIGNED_BYTE&&(s=l.RGB8UI),n===l.UNSIGNED_SHORT&&(s=l.RGB16UI),n===l.UNSIGNED_INT&&(s=l.RGB32UI),n===l.BYTE&&(s=l.RGB8I),n===l.SHORT&&(s=l.RGB16I),n===l.INT&&(s=l.RGB32I)),t===l.RGBA_INTEGER&&(n===l.UNSIGNED_BYTE&&(s=l.RGBA8UI),n===l.UNSIGNED_SHORT&&(s=l.RGBA16UI),n===l.UNSIGNED_INT&&(s=l.RGBA32UI),n===l.BYTE&&(s=l.RGBA8I),n===l.SHORT&&(s=l.RGBA16I),n===l.INT&&(s=l.RGBA32I)),t===l.RGB&&(n===l.UNSIGNED_SHORT&&o&&(s=o.RGB16_EXT),n===l.SHORT&&o&&(s=o.RGB16_SNORM_EXT),n===l.UNSIGNED_INT_5_9_9_9_REV&&(s=l.RGB9_E5),n===l.UNSIGNED_INT_10F_11F_11F_REV&&(s=l.R11F_G11F_B10F)),t===l.RGBA){let e=a?Le:Nt.getTransfer(i);n===l.FLOAT&&(s=l.RGBA32F),n===l.HALF_FLOAT&&(s=l.RGBA16F),n===l.UNSIGNED_BYTE&&(s=e===`srgb`?l.SRGB8_ALPHA8:l.RGBA8),n===l.UNSIGNED_SHORT&&o&&(s=o.RGBA16_EXT),n===l.SHORT&&o&&(s=o.RGBA16_SNORM_EXT),n===l.UNSIGNED_SHORT_4_4_4_4&&(s=l.RGBA4),n===l.UNSIGNED_SHORT_5_5_5_1&&(s=l.RGB5_A1)}return(s===l.R16F||s===l.R32F||s===l.RG16F||s===l.RG32F||s===l.RGBA16F||s===l.RGBA32F)&&u.get(`EXT_color_buffer_float`),s}function j(e,t){let n;return e?t===null||t===1014||t===1020?n=l.DEPTH24_STENCIL8:t===1015?n=l.DEPTH32F_STENCIL8:t===1012&&(n=l.DEPTH24_STENCIL8,V(`DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.`)):t===null||t===1014||t===1020?n=l.DEPTH_COMPONENT24:t===1015?n=l.DEPTH_COMPONENT32F:t===1012&&(n=l.DEPTH_COMPONENT16),n}function M(e,t){return D(e)===!0||e.isFramebufferTexture&&e.minFilter!==1003&&e.minFilter!==1006?Math.log2(Math.max(t.width,t.height))+1:e.mipmaps!==void 0&&e.mipmaps.length>0?e.mipmaps.length:e.isCompressedTexture&&Array.isArray(e.image)?t.mipmaps.length:1}function ee(e){let t=e.target;t.removeEventListener(`dispose`,ee),te(t),t.isVideoTexture&&y.delete(t),t.isHTMLTexture&&b.delete(t)}function N(e){let t=e.target;t.removeEventListener(`dispose`,N),ne(t)}function te(e){let t=f.get(e);if(t.__webglInit===void 0)return;let n=e.source,r=S.get(n);if(r){let i=r[t.__cacheKey];i.usedTimes--,i.usedTimes===0&&P(e),Object.keys(r).length===0&&S.delete(n)}f.remove(e)}function P(e){let t=f.get(e);l.deleteTexture(t.__webglTexture);let n=e.source,r=S.get(n);delete r[t.__cacheKey],h.memory.textures--}function ne(e){let t=f.get(e);if(e.depthTexture&&(e.depthTexture.dispose(),f.remove(e.depthTexture)),e.isWebGLCubeRenderTarget)for(let e=0;e<6;e++){if(Array.isArray(t.__webglFramebuffer[e]))for(let n=0;n<t.__webglFramebuffer[e].length;n++)l.deleteFramebuffer(t.__webglFramebuffer[e][n]);else l.deleteFramebuffer(t.__webglFramebuffer[e]);t.__webglDepthbuffer&&l.deleteRenderbuffer(t.__webglDepthbuffer[e])}else{if(Array.isArray(t.__webglFramebuffer))for(let e=0;e<t.__webglFramebuffer.length;e++)l.deleteFramebuffer(t.__webglFramebuffer[e]);else l.deleteFramebuffer(t.__webglFramebuffer);if(t.__webglDepthbuffer&&l.deleteRenderbuffer(t.__webglDepthbuffer),t.__webglMultisampledFramebuffer&&l.deleteFramebuffer(t.__webglMultisampledFramebuffer),t.__webglColorRenderbuffer)for(let e=0;e<t.__webglColorRenderbuffer.length;e++)t.__webglColorRenderbuffer[e]&&l.deleteRenderbuffer(t.__webglColorRenderbuffer[e]);t.__webglDepthRenderbuffer&&l.deleteRenderbuffer(t.__webglDepthRenderbuffer)}let n=e.textures;for(let e=0,t=n.length;e<t;e++){let t=f.get(n[e]);t.__webglTexture&&(l.deleteTexture(t.__webglTexture),h.memory.textures--),f.remove(n[e])}f.remove(e)}let F=0;function re(){F=0}function ie(){return F}function I(e){F=e}function ae(){let e=F;return e>=p.maxTextures&&V(`WebGLTextures: Trying to use `+(e+1)+` texture units while this GPU supports only `+p.maxTextures),F+=1,e}function oe(e){let t=[];return t.push(e.wrapS),t.push(e.wrapT),t.push(e.wrapR||0),t.push(e.magFilter),t.push(e.minFilter),t.push(e.anisotropy),t.push(e.internalFormat),t.push(e.format),t.push(e.type),t.push(e.generateMipmaps),t.push(e.premultiplyAlpha),t.push(e.flipY),t.push(e.unpackAlignment),t.push(e.colorSpace),t.join()}function L(e,t){let n=f.get(e);if(e.isVideoTexture&&R(e),e.isRenderTargetTexture===!1&&e.isExternalTexture!==!0&&e.version>0&&n.__version!==e.version){let r=e.image;if(r===null)V(`WebGLRenderer: Texture marked for update but no image data found.`);else if(r.complete===!1)V(`WebGLRenderer: Texture marked for update but image is incomplete`);else{_e(n,e,t);return}}else e.isExternalTexture&&(n.__webglTexture=e.sourceTexture?e.sourceTexture:null);d.bindTexture(l.TEXTURE_2D,n.__webglTexture,l.TEXTURE0+t)}function se(e,t){let n=f.get(e);if(e.isRenderTargetTexture===!1&&e.version>0&&n.__version!==e.version){_e(n,e,t);return}e.isExternalTexture&&(n.__webglTexture=e.sourceTexture?e.sourceTexture:null),d.bindTexture(l.TEXTURE_2D_ARRAY,n.__webglTexture,l.TEXTURE0+t)}function ce(e,t){let n=f.get(e);if(e.isRenderTargetTexture===!1&&e.version>0&&n.__version!==e.version){_e(n,e,t);return}d.bindTexture(l.TEXTURE_3D,n.__webglTexture,l.TEXTURE0+t)}function le(e,t){let n=f.get(e);if(e.isCubeDepthTexture!==!0&&e.version>0&&n.__version!==e.version){ve(n,e,t);return}d.bindTexture(l.TEXTURE_CUBE_MAP,n.__webglTexture,l.TEXTURE0+t)}let ue={[e]:l.REPEAT,[t]:l.CLAMP_TO_EDGE,[n]:l.MIRRORED_REPEAT},de={[r]:l.NEAREST,[i]:l.NEAREST_MIPMAP_NEAREST,[a]:l.NEAREST_MIPMAP_LINEAR,[o]:l.LINEAR,[s]:l.LINEAR_MIPMAP_NEAREST,[c]:l.LINEAR_MIPMAP_LINEAR},fe={512:l.NEVER,519:l.ALWAYS,513:l.LESS,515:l.LEQUAL,514:l.EQUAL,518:l.GEQUAL,516:l.GREATER,517:l.NOTEQUAL};function pe(e,t){if(t.type===1015&&u.has(`OES_texture_float_linear`)===!1&&(t.magFilter===1006||t.magFilter===1007||t.magFilter===1005||t.magFilter===1008||t.minFilter===1006||t.minFilter===1007||t.minFilter===1005||t.minFilter===1008)&&V(`WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.`),l.texParameteri(e,l.TEXTURE_WRAP_S,ue[t.wrapS]),l.texParameteri(e,l.TEXTURE_WRAP_T,ue[t.wrapT]),(e===l.TEXTURE_3D||e===l.TEXTURE_2D_ARRAY)&&l.texParameteri(e,l.TEXTURE_WRAP_R,ue[t.wrapR]),l.texParameteri(e,l.TEXTURE_MAG_FILTER,de[t.magFilter]),l.texParameteri(e,l.TEXTURE_MIN_FILTER,de[t.minFilter]),t.compareFunction&&(l.texParameteri(e,l.TEXTURE_COMPARE_MODE,l.COMPARE_REF_TO_TEXTURE),l.texParameteri(e,l.TEXTURE_COMPARE_FUNC,fe[t.compareFunction])),u.has(`EXT_texture_filter_anisotropic`)===!0){if(t.magFilter===1003||t.minFilter!==1005&&t.minFilter!==1008||t.type===1015&&u.has(`OES_texture_float_linear`)===!1)return;if(t.anisotropy>1||f.get(t).__currentAnisotropy){let n=u.get(`EXT_texture_filter_anisotropic`);l.texParameterf(e,n.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(t.anisotropy,p.getMaxAnisotropy())),f.get(t).__currentAnisotropy=t.anisotropy}}}function me(e,t){let n=!1;e.__webglInit===void 0&&(e.__webglInit=!0,t.addEventListener(`dispose`,ee));let r=t.source,i=S.get(r);i===void 0&&(i={},S.set(r,i));let a=oe(t);if(a!==e.__cacheKey){i[a]===void 0&&(i[a]={texture:l.createTexture(),usedTimes:0},h.memory.textures++,n=!0),i[a].usedTimes++;let r=i[e.__cacheKey];r!==void 0&&(i[e.__cacheKey].usedTimes--,r.usedTimes===0&&P(t)),e.__cacheKey=a,e.__webglTexture=i[a].texture}return n}function he(e,t,n){return Math.floor(Math.floor(e/n)/t)}function ge(e,t,n,r){let i=e.updateRanges;if(i.length===0)d.texSubImage2D(l.TEXTURE_2D,0,0,0,t.width,t.height,n,r,t.data);else{i.sort((e,t)=>e.start-t.start);let a=0;for(let e=1;e<i.length;e++){let n=i[a],r=i[e],o=n.start+n.count,s=he(r.start,t.width,4),c=he(n.start,t.width,4);r.start<=o+1&&s===c&&he(r.start+r.count-1,t.width,4)===s?n.count=Math.max(n.count,r.start+r.count-n.start):(++a,i[a]=r)}i.length=a+1;let o=d.getParameter(l.UNPACK_ROW_LENGTH),s=d.getParameter(l.UNPACK_SKIP_PIXELS),c=d.getParameter(l.UNPACK_SKIP_ROWS);d.pixelStorei(l.UNPACK_ROW_LENGTH,t.width);for(let e=0,a=i.length;e<a;e++){let a=i[e],o=Math.floor(a.start/4),s=Math.ceil(a.count/4),c=o%t.width,u=Math.floor(o/t.width),f=s;d.pixelStorei(l.UNPACK_SKIP_PIXELS,c),d.pixelStorei(l.UNPACK_SKIP_ROWS,u),d.texSubImage2D(l.TEXTURE_2D,0,c,u,f,1,n,r,t.data)}e.clearUpdateRanges(),d.pixelStorei(l.UNPACK_ROW_LENGTH,o),d.pixelStorei(l.UNPACK_SKIP_PIXELS,s),d.pixelStorei(l.UNPACK_SKIP_ROWS,c)}}function _e(e,t,n){let r=l.TEXTURE_2D;(t.isDataArrayTexture||t.isCompressedArrayTexture)&&(r=l.TEXTURE_2D_ARRAY),t.isData3DTexture&&(r=l.TEXTURE_3D);let i=me(e,t),a=t.source;d.bindTexture(r,e.__webglTexture,l.TEXTURE0+n);let o=f.get(a);if(a.version!==o.__version||i===!0){if(d.activeTexture(l.TEXTURE0+n),!(typeof ImageBitmap<`u`&&t.image instanceof ImageBitmap)){let e=Nt.getPrimaries(Nt.workingColorSpace),n=t.colorSpace===``?null:Nt.getPrimaries(t.colorSpace),r=t.colorSpace===``||e===n?l.NONE:l.BROWSER_DEFAULT_WEBGL;d.pixelStorei(l.UNPACK_FLIP_Y_WEBGL,t.flipY),d.pixelStorei(l.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),d.pixelStorei(l.UNPACK_COLORSPACE_CONVERSION_WEBGL,r)}d.pixelStorei(l.UNPACK_ALIGNMENT,t.unpackAlignment);let e=T(t.image,!1,p.maxTextureSize);e=je(t,e);let s=m.convert(t.format,t.colorSpace),c=m.convert(t.type),u=A(t.internalFormat,s,c,t.normalized,t.colorSpace,t.isVideoTexture);pe(r,t);let f,h=t.mipmaps,g=t.isVideoTexture!==!0,_=o.__version===void 0||i===!0,v=a.dataReady,y=M(t,e);if(t.isDepthTexture)u=j(t.format===E,t.type),_&&(g?d.texStorage2D(l.TEXTURE_2D,1,u,e.width,e.height):d.texImage2D(l.TEXTURE_2D,0,u,e.width,e.height,0,s,c,null));else if(t.isDataTexture){if(h.length>0){g&&_&&d.texStorage2D(l.TEXTURE_2D,y,u,h[0].width,h[0].height);for(let e=0,t=h.length;e<t;e++)f=h[e],g?v&&d.texSubImage2D(l.TEXTURE_2D,e,0,0,f.width,f.height,s,c,f.data):d.texImage2D(l.TEXTURE_2D,e,u,f.width,f.height,0,s,c,f.data);t.generateMipmaps=!1}else g?(_&&d.texStorage2D(l.TEXTURE_2D,y,u,e.width,e.height),v&&ge(t,e,s,c)):d.texImage2D(l.TEXTURE_2D,0,u,e.width,e.height,0,s,c,e.data)}else if(t.isCompressedTexture){if(t.isCompressedArrayTexture){g&&_&&d.texStorage3D(l.TEXTURE_2D_ARRAY,y,u,h[0].width,h[0].height,e.depth);for(let n=0,r=h.length;n<r;n++)if(f=h[n],t.format!==1023){if(s!==null){if(g){if(v){if(t.layerUpdates.size>0){let e=Us(f.width,f.height,t.format,t.type);for(let r of t.layerUpdates){let t=f.data.subarray(r*e/f.data.BYTES_PER_ELEMENT,(r+1)*e/f.data.BYTES_PER_ELEMENT);d.compressedTexSubImage3D(l.TEXTURE_2D_ARRAY,n,0,0,r,f.width,f.height,1,s,t)}}else d.compressedTexSubImage3D(l.TEXTURE_2D_ARRAY,n,0,0,0,f.width,f.height,e.depth,s,f.data)}}else d.compressedTexImage3D(l.TEXTURE_2D_ARRAY,n,u,f.width,f.height,e.depth,0,f.data,0,0)}else V(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`)}else g?v&&d.texSubImage3D(l.TEXTURE_2D_ARRAY,n,0,0,0,f.width,f.height,e.depth,s,c,f.data):d.texImage3D(l.TEXTURE_2D_ARRAY,n,u,f.width,f.height,e.depth,0,s,c,f.data);t.layerUpdates.size>0&&t.clearLayerUpdates()}else{g&&_&&d.texStorage2D(l.TEXTURE_2D,y,u,h[0].width,h[0].height);for(let e=0,n=h.length;e<n;e++)f=h[e],t.format===1023?g?v&&d.texSubImage2D(l.TEXTURE_2D,e,0,0,f.width,f.height,s,c,f.data):d.texImage2D(l.TEXTURE_2D,e,u,f.width,f.height,0,s,c,f.data):s===null?V(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`):g?v&&d.compressedTexSubImage2D(l.TEXTURE_2D,e,0,0,f.width,f.height,s,f.data):d.compressedTexImage2D(l.TEXTURE_2D,e,u,f.width,f.height,0,f.data)}}else if(t.isDataArrayTexture){if(g){if(_&&d.texStorage3D(l.TEXTURE_2D_ARRAY,y,u,e.width,e.height,e.depth),v){if(t.layerUpdates.size>0){let n=Us(e.width,e.height,t.format,t.type);for(let r of t.layerUpdates){let t=e.data.subarray(r*n/e.data.BYTES_PER_ELEMENT,(r+1)*n/e.data.BYTES_PER_ELEMENT);d.texSubImage3D(l.TEXTURE_2D_ARRAY,0,0,0,r,e.width,e.height,1,s,c,t)}t.clearLayerUpdates()}else d.texSubImage3D(l.TEXTURE_2D_ARRAY,0,0,0,0,e.width,e.height,e.depth,s,c,e.data)}}else d.texImage3D(l.TEXTURE_2D_ARRAY,0,u,e.width,e.height,e.depth,0,s,c,e.data)}else if(t.isData3DTexture)g?(_&&d.texStorage3D(l.TEXTURE_3D,y,u,e.width,e.height,e.depth),v&&d.texSubImage3D(l.TEXTURE_3D,0,0,0,0,e.width,e.height,e.depth,s,c,e.data)):d.texImage3D(l.TEXTURE_3D,0,u,e.width,e.height,e.depth,0,s,c,e.data);else if(t.isFramebufferTexture){if(_){if(g)d.texStorage2D(l.TEXTURE_2D,y,u,e.width,e.height);else{let t=e.width,n=e.height;for(let e=0;e<y;e++)d.texImage2D(l.TEXTURE_2D,e,u,t,n,0,s,c,null),t>>=1,n>>=1}}}else if(t.isHTMLTexture){if(`texElementImage2D`in l){let n=l.canvas;if(n.hasAttribute(`layoutsubtree`)||n.setAttribute(`layoutsubtree`,`true`),e.parentNode!==n){n.appendChild(e),b.add(t),n.onpaint=e=>{let t=e.changedElements;for(let e of b)t.includes(e.image)&&(e.needsUpdate=!0)},n.requestPaint();return}if(l.texElementImage2D.length===3)l.texElementImage2D(l.TEXTURE_2D,l.RGBA8,e);else{let t=l.RGBA,n=l.RGBA,r=l.UNSIGNED_BYTE;l.texElementImage2D(l.TEXTURE_2D,0,t,n,r,e)}l.texParameteri(l.TEXTURE_2D,l.TEXTURE_MIN_FILTER,l.LINEAR),l.texParameteri(l.TEXTURE_2D,l.TEXTURE_WRAP_S,l.CLAMP_TO_EDGE),l.texParameteri(l.TEXTURE_2D,l.TEXTURE_WRAP_T,l.CLAMP_TO_EDGE)}}else if(h.length>0){if(g&&_){let e=Me(h[0]);d.texStorage2D(l.TEXTURE_2D,y,u,e.width,e.height)}for(let e=0,t=h.length;e<t;e++)f=h[e],g?v&&d.texSubImage2D(l.TEXTURE_2D,e,0,0,s,c,f):d.texImage2D(l.TEXTURE_2D,e,u,s,c,f);t.generateMipmaps=!1}else if(g){if(_){let t=Me(e);d.texStorage2D(l.TEXTURE_2D,y,u,t.width,t.height)}v&&d.texSubImage2D(l.TEXTURE_2D,0,0,0,s,c,e)}else d.texImage2D(l.TEXTURE_2D,0,u,s,c,e);D(t)&&O(r),o.__version=a.version,t.onUpdate&&t.onUpdate(t)}e.__version=t.version}function ve(e,t,n){if(t.image.length!==6)return;let r=me(e,t),i=t.source;d.bindTexture(l.TEXTURE_CUBE_MAP,e.__webglTexture,l.TEXTURE0+n);let a=f.get(i);if(i.version!==a.__version||r===!0){d.activeTexture(l.TEXTURE0+n);let e=Nt.getPrimaries(Nt.workingColorSpace),o=t.colorSpace===``?null:Nt.getPrimaries(t.colorSpace),s=t.colorSpace===``||e===o?l.NONE:l.BROWSER_DEFAULT_WEBGL;d.pixelStorei(l.UNPACK_FLIP_Y_WEBGL,t.flipY),d.pixelStorei(l.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),d.pixelStorei(l.UNPACK_ALIGNMENT,t.unpackAlignment),d.pixelStorei(l.UNPACK_COLORSPACE_CONVERSION_WEBGL,s);let c=t.isCompressedTexture||t.image[0].isCompressedTexture,u=t.image[0]&&t.image[0].isDataTexture,f=[];for(let e=0;e<6;e++)!c&&!u?f[e]=T(t.image[e],!0,p.maxCubemapSize):f[e]=u?t.image[e].image:t.image[e],f[e]=je(t,f[e]);let h=f[0],g=m.convert(t.format,t.colorSpace),_=m.convert(t.type),v=A(t.internalFormat,g,_,t.normalized,t.colorSpace),y=t.isVideoTexture!==!0,b=a.__version===void 0||r===!0,x=i.dataReady,S=M(t,h);pe(l.TEXTURE_CUBE_MAP,t);let C;if(c){y&&b&&d.texStorage2D(l.TEXTURE_CUBE_MAP,S,v,h.width,h.height);for(let e=0;e<6;e++){C=f[e].mipmaps;for(let n=0;n<C.length;n++){let r=C[n];t.format===1023?y?x&&d.texSubImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,n,0,0,r.width,r.height,g,_,r.data):d.texImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,n,v,r.width,r.height,0,g,_,r.data):g===null?V(`WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()`):y?x&&d.compressedTexSubImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,n,0,0,r.width,r.height,g,r.data):d.compressedTexImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,n,v,r.width,r.height,0,r.data)}}}else{if(C=t.mipmaps,y&&b){C.length>0&&S++;let e=Me(f[0]);d.texStorage2D(l.TEXTURE_CUBE_MAP,S,v,e.width,e.height)}for(let e=0;e<6;e++)if(u){y?x&&d.texSubImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,0,0,0,f[e].width,f[e].height,g,_,f[e].data):d.texImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,0,v,f[e].width,f[e].height,0,g,_,f[e].data);for(let t=0;t<C.length;t++){let n=C[t].image[e].image;y?x&&d.texSubImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,t+1,0,0,n.width,n.height,g,_,n.data):d.texImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,t+1,v,n.width,n.height,0,g,_,n.data)}}else{y?x&&d.texSubImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,0,0,0,g,_,f[e]):d.texImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,0,v,g,_,f[e]);for(let t=0;t<C.length;t++){let n=C[t];y?x&&d.texSubImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,t+1,0,0,g,_,n.image[e]):d.texImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,t+1,v,g,_,n.image[e])}}}D(t)&&O(l.TEXTURE_CUBE_MAP),a.__version=i.version,t.onUpdate&&t.onUpdate(t)}e.__version=t.version}function ye(e,t,n,r,i,a){let o=m.convert(n.format,n.colorSpace),s=m.convert(n.type),c=A(n.internalFormat,o,s,n.normalized,n.colorSpace),u=f.get(t),p=f.get(n);if(p.__renderTarget=t,!u.__hasExternalTextures){let e=Math.max(1,t.width>>a),n=Math.max(1,t.height>>a);i===l.TEXTURE_3D||i===l.TEXTURE_2D_ARRAY?d.texImage3D(i,a,c,e,n,t.depth,0,o,s,null):d.texImage2D(i,a,c,e,n,0,o,s,null)}d.bindFramebuffer(l.FRAMEBUFFER,e),Ae(t)?g.framebufferTexture2DMultisampleEXT(l.FRAMEBUFFER,r,i,p.__webglTexture,0,ke(t)):(i===l.TEXTURE_2D||i>=l.TEXTURE_CUBE_MAP_POSITIVE_X&&i<=l.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&l.framebufferTexture2D(l.FRAMEBUFFER,r,i,p.__webglTexture,a),d.bindFramebuffer(l.FRAMEBUFFER,null)}function be(e,t,n){if(l.bindRenderbuffer(l.RENDERBUFFER,e),t.depthBuffer){let r=t.depthTexture,i=r&&r.isDepthTexture?r.type:null,a=j(t.stencilBuffer,i),o=t.stencilBuffer?l.DEPTH_STENCIL_ATTACHMENT:l.DEPTH_ATTACHMENT;Ae(t)?g.renderbufferStorageMultisampleEXT(l.RENDERBUFFER,ke(t),a,t.width,t.height):n?l.renderbufferStorageMultisample(l.RENDERBUFFER,ke(t),a,t.width,t.height):l.renderbufferStorage(l.RENDERBUFFER,a,t.width,t.height),l.framebufferRenderbuffer(l.FRAMEBUFFER,o,l.RENDERBUFFER,e)}else{let e=t.textures;for(let r=0;r<e.length;r++){let i=e[r],a=m.convert(i.format,i.colorSpace),o=m.convert(i.type),s=A(i.internalFormat,a,o,i.normalized,i.colorSpace);Ae(t)?g.renderbufferStorageMultisampleEXT(l.RENDERBUFFER,ke(t),s,t.width,t.height):n?l.renderbufferStorageMultisample(l.RENDERBUFFER,ke(t),s,t.width,t.height):l.renderbufferStorage(l.RENDERBUFFER,s,t.width,t.height)}}l.bindRenderbuffer(l.RENDERBUFFER,null)}function xe(e,t,n){let r=t.isWebGLCubeRenderTarget===!0;if(d.bindFramebuffer(l.FRAMEBUFFER,e),!(t.depthTexture&&t.depthTexture.isDepthTexture))throw Error(`THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.`);let i=f.get(t.depthTexture);if(i.__renderTarget=t,(!i.__webglTexture||t.depthTexture.image.width!==t.width||t.depthTexture.image.height!==t.height)&&(t.depthTexture.image.width=t.width,t.depthTexture.image.height=t.height,t.depthTexture.needsUpdate=!0),r){if(i.__webglInit===void 0&&(i.__webglInit=!0,t.depthTexture.addEventListener(`dispose`,ee)),i.__webglTexture===void 0){i.__webglTexture=l.createTexture(),d.bindTexture(l.TEXTURE_CUBE_MAP,i.__webglTexture),pe(l.TEXTURE_CUBE_MAP,t.depthTexture);let e=m.convert(t.depthTexture.format),n=m.convert(t.depthTexture.type),r;t.depthTexture.format===1026?r=l.DEPTH_COMPONENT24:t.depthTexture.format===1027&&(r=l.DEPTH24_STENCIL8);for(let i=0;i<6;i++)l.texImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+i,0,r,t.width,t.height,0,e,n,null)}}else L(t.depthTexture,0);let a=i.__webglTexture,o=ke(t),s=r?l.TEXTURE_CUBE_MAP_POSITIVE_X+n:l.TEXTURE_2D,c=t.depthTexture.format===1027?l.DEPTH_STENCIL_ATTACHMENT:l.DEPTH_ATTACHMENT;if(t.depthTexture.format===1026)Ae(t)?g.framebufferTexture2DMultisampleEXT(l.FRAMEBUFFER,c,s,a,0,o):l.framebufferTexture2D(l.FRAMEBUFFER,c,s,a,0);else if(t.depthTexture.format===1027)Ae(t)?g.framebufferTexture2DMultisampleEXT(l.FRAMEBUFFER,c,s,a,0,o):l.framebufferTexture2D(l.FRAMEBUFFER,c,s,a,0);else throw Error(`THREE.WebGLTextures: Unknown depthTexture format.`)}function Se(e){let t=f.get(e),n=e.isWebGLCubeRenderTarget===!0;if(t.__boundDepthTexture!==e.depthTexture){let n=e.depthTexture;if(t.__depthDisposeCallback&&t.__depthDisposeCallback(),n){let e=()=>{delete t.__boundDepthTexture,delete t.__depthDisposeCallback,n.removeEventListener(`dispose`,e)};n.addEventListener(`dispose`,e),t.__depthDisposeCallback=e}t.__boundDepthTexture=n}if(e.depthTexture&&!t.__autoAllocateDepthBuffer){if(n)for(let n=0;n<6;n++)xe(t.__webglFramebuffer[n],e,n);else{let n=e.texture.mipmaps;n&&n.length>0?xe(t.__webglFramebuffer[0],e,0):xe(t.__webglFramebuffer,e,0)}}else if(n){t.__webglDepthbuffer=[];for(let n=0;n<6;n++)if(d.bindFramebuffer(l.FRAMEBUFFER,t.__webglFramebuffer[n]),t.__webglDepthbuffer[n]===void 0)t.__webglDepthbuffer[n]=l.createRenderbuffer(),be(t.__webglDepthbuffer[n],e,!1);else{let r=e.stencilBuffer?l.DEPTH_STENCIL_ATTACHMENT:l.DEPTH_ATTACHMENT,i=t.__webglDepthbuffer[n];l.bindRenderbuffer(l.RENDERBUFFER,i),l.framebufferRenderbuffer(l.FRAMEBUFFER,r,l.RENDERBUFFER,i)}}else{let n=e.texture.mipmaps;if(n&&n.length>0?d.bindFramebuffer(l.FRAMEBUFFER,t.__webglFramebuffer[0]):d.bindFramebuffer(l.FRAMEBUFFER,t.__webglFramebuffer),t.__webglDepthbuffer===void 0)t.__webglDepthbuffer=l.createRenderbuffer(),be(t.__webglDepthbuffer,e,!1);else{let n=e.stencilBuffer?l.DEPTH_STENCIL_ATTACHMENT:l.DEPTH_ATTACHMENT,r=t.__webglDepthbuffer;l.bindRenderbuffer(l.RENDERBUFFER,r),l.framebufferRenderbuffer(l.FRAMEBUFFER,n,l.RENDERBUFFER,r)}}d.bindFramebuffer(l.FRAMEBUFFER,null)}function Ce(e,t,n){let r=f.get(e);t!==void 0&&ye(r.__webglFramebuffer,e,e.texture,l.COLOR_ATTACHMENT0,l.TEXTURE_2D,0),n!==void 0&&Se(e)}function we(e){let t=e.texture,n=f.get(e),r=f.get(t);e.addEventListener(`dispose`,N);let i=e.textures,a=e.isWebGLCubeRenderTarget===!0,o=i.length>1;if(o||(r.__webglTexture===void 0&&(r.__webglTexture=l.createTexture()),r.__version=t.version,h.memory.textures++),a){n.__webglFramebuffer=[];for(let e=0;e<6;e++)if(t.mipmaps&&t.mipmaps.length>0){n.__webglFramebuffer[e]=[];for(let r=0;r<t.mipmaps.length;r++)n.__webglFramebuffer[e][r]=l.createFramebuffer()}else n.__webglFramebuffer[e]=l.createFramebuffer()}else{if(t.mipmaps&&t.mipmaps.length>0){n.__webglFramebuffer=[];for(let e=0;e<t.mipmaps.length;e++)n.__webglFramebuffer[e]=l.createFramebuffer()}else n.__webglFramebuffer=l.createFramebuffer();if(o)for(let e=0,t=i.length;e<t;e++){let t=f.get(i[e]);t.__webglTexture===void 0&&(t.__webglTexture=l.createTexture(),h.memory.textures++)}if(e.samples>0&&Ae(e)===!1){n.__webglMultisampledFramebuffer=l.createFramebuffer(),n.__webglColorRenderbuffer=[],d.bindFramebuffer(l.FRAMEBUFFER,n.__webglMultisampledFramebuffer);for(let t=0;t<i.length;t++){let r=i[t];n.__webglColorRenderbuffer[t]=l.createRenderbuffer(),l.bindRenderbuffer(l.RENDERBUFFER,n.__webglColorRenderbuffer[t]);let a=m.convert(r.format,r.colorSpace),o=m.convert(r.type),s=A(r.internalFormat,a,o,r.normalized,r.colorSpace,e.isXRRenderTarget===!0),c=ke(e);l.renderbufferStorageMultisample(l.RENDERBUFFER,c,s,e.width,e.height),l.framebufferRenderbuffer(l.FRAMEBUFFER,l.COLOR_ATTACHMENT0+t,l.RENDERBUFFER,n.__webglColorRenderbuffer[t])}l.bindRenderbuffer(l.RENDERBUFFER,null),e.depthBuffer&&(n.__webglDepthRenderbuffer=l.createRenderbuffer(),be(n.__webglDepthRenderbuffer,e,!0)),d.bindFramebuffer(l.FRAMEBUFFER,null)}}if(a){d.bindTexture(l.TEXTURE_CUBE_MAP,r.__webglTexture),pe(l.TEXTURE_CUBE_MAP,t);for(let r=0;r<6;r++)if(t.mipmaps&&t.mipmaps.length>0)for(let i=0;i<t.mipmaps.length;i++)ye(n.__webglFramebuffer[r][i],e,t,l.COLOR_ATTACHMENT0,l.TEXTURE_CUBE_MAP_POSITIVE_X+r,i);else ye(n.__webglFramebuffer[r],e,t,l.COLOR_ATTACHMENT0,l.TEXTURE_CUBE_MAP_POSITIVE_X+r,0);D(t)&&O(l.TEXTURE_CUBE_MAP),d.unbindTexture()}else if(o){for(let t=0,r=i.length;t<r;t++){let r=i[t],a=f.get(r),o=l.TEXTURE_2D;(e.isWebGL3DRenderTarget||e.isWebGLArrayRenderTarget)&&(o=e.isWebGL3DRenderTarget?l.TEXTURE_3D:l.TEXTURE_2D_ARRAY),d.bindTexture(o,a.__webglTexture),pe(o,r),ye(n.__webglFramebuffer,e,r,l.COLOR_ATTACHMENT0+t,o,0),D(r)&&O(o)}d.unbindTexture()}else{let i=l.TEXTURE_2D;if((e.isWebGL3DRenderTarget||e.isWebGLArrayRenderTarget)&&(i=e.isWebGL3DRenderTarget?l.TEXTURE_3D:l.TEXTURE_2D_ARRAY),d.bindTexture(i,r.__webglTexture),pe(i,t),t.mipmaps&&t.mipmaps.length>0)for(let r=0;r<t.mipmaps.length;r++)ye(n.__webglFramebuffer[r],e,t,l.COLOR_ATTACHMENT0,i,r);else ye(n.__webglFramebuffer,e,t,l.COLOR_ATTACHMENT0,i,0);D(t)&&O(i),d.unbindTexture()}e.depthBuffer&&Se(e)}function Te(e){let t=e.textures;for(let n=0,r=t.length;n<r;n++){let r=t[n];if(D(r)){let t=k(e),n=f.get(r).__webglTexture;d.bindTexture(t,n),O(t),d.unbindTexture()}}}let Ee=[],De=[];function Oe(e){if(e.samples>0){if(Ae(e)===!1){let t=e.textures,n=e.width,r=e.height,i=l.COLOR_BUFFER_BIT,a=e.stencilBuffer?l.DEPTH_STENCIL_ATTACHMENT:l.DEPTH_ATTACHMENT,o=f.get(e),s=t.length>1;if(s)for(let e=0;e<t.length;e++)d.bindFramebuffer(l.FRAMEBUFFER,o.__webglMultisampledFramebuffer),l.framebufferRenderbuffer(l.FRAMEBUFFER,l.COLOR_ATTACHMENT0+e,l.RENDERBUFFER,null),d.bindFramebuffer(l.FRAMEBUFFER,o.__webglFramebuffer),l.framebufferTexture2D(l.DRAW_FRAMEBUFFER,l.COLOR_ATTACHMENT0+e,l.TEXTURE_2D,null,0);d.bindFramebuffer(l.READ_FRAMEBUFFER,o.__webglMultisampledFramebuffer);let c=e.texture.mipmaps;c&&c.length>0?d.bindFramebuffer(l.DRAW_FRAMEBUFFER,o.__webglFramebuffer[0]):d.bindFramebuffer(l.DRAW_FRAMEBUFFER,o.__webglFramebuffer);for(let c=0;c<t.length;c++){if(e.resolveDepthBuffer&&(e.depthBuffer&&(i|=l.DEPTH_BUFFER_BIT),e.stencilBuffer&&e.resolveStencilBuffer&&(i|=l.STENCIL_BUFFER_BIT)),s){l.framebufferRenderbuffer(l.READ_FRAMEBUFFER,l.COLOR_ATTACHMENT0,l.RENDERBUFFER,o.__webglColorRenderbuffer[c]);let e=f.get(t[c]).__webglTexture;l.framebufferTexture2D(l.DRAW_FRAMEBUFFER,l.COLOR_ATTACHMENT0,l.TEXTURE_2D,e,0)}l.blitFramebuffer(0,0,n,r,0,0,n,r,i,l.NEAREST),_===!0&&(Ee.length=0,De.length=0,Ee.push(l.COLOR_ATTACHMENT0+c),e.depthBuffer&&e.storeMultisampledDepthBuffer===!1&&(Ee.push(a),De.push(a),l.invalidateFramebuffer(l.DRAW_FRAMEBUFFER,De)),l.invalidateFramebuffer(l.READ_FRAMEBUFFER,Ee))}if(d.bindFramebuffer(l.READ_FRAMEBUFFER,null),d.bindFramebuffer(l.DRAW_FRAMEBUFFER,null),s)for(let e=0;e<t.length;e++){d.bindFramebuffer(l.FRAMEBUFFER,o.__webglMultisampledFramebuffer),l.framebufferRenderbuffer(l.FRAMEBUFFER,l.COLOR_ATTACHMENT0+e,l.RENDERBUFFER,o.__webglColorRenderbuffer[e]);let n=f.get(t[e]).__webglTexture;d.bindFramebuffer(l.FRAMEBUFFER,o.__webglFramebuffer),l.framebufferTexture2D(l.DRAW_FRAMEBUFFER,l.COLOR_ATTACHMENT0+e,l.TEXTURE_2D,n,0)}d.bindFramebuffer(l.DRAW_FRAMEBUFFER,o.__webglMultisampledFramebuffer)}else if(e.depthBuffer&&e.storeMultisampledDepthBuffer===!1&&_){let t=e.stencilBuffer?l.DEPTH_STENCIL_ATTACHMENT:l.DEPTH_ATTACHMENT;l.invalidateFramebuffer(l.DRAW_FRAMEBUFFER,[t])}}}function ke(e){return Math.min(p.maxSamples,e.samples)}function Ae(e){let t=f.get(e);return e.samples>0&&u.has(`WEBGL_multisampled_render_to_texture`)===!0&&t.__useRenderToTexture!==!1}function R(e){let t=h.render.frame;y.get(e)!==t&&(y.set(e,t),e.update())}function je(e,t){let n=e.colorSpace,r=e.format,i=e.type;return e.isCompressedTexture===!0||e.isVideoTexture===!0||n!==`srgb-linear`&&n!==``&&(Nt.getTransfer(n)===`srgb`?(r!==1023||i!==1009)&&V(`WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.`):H(`WebGLTextures: Unsupported texture color space:`,n)),t}function Me(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement?(v.width=e.naturalWidth||e.width,v.height=e.naturalHeight||e.height):typeof VideoFrame<`u`&&e instanceof VideoFrame?(v.width=e.displayWidth,v.height=e.displayHeight):(v.width=e.width,v.height=e.height),v}this.allocateTextureUnit=ae,this.resetTextureUnits=re,this.getTextureUnits=ie,this.setTextureUnits=I,this.setTexture2D=L,this.setTexture2DArray=se,this.setTexture3D=ce,this.setTextureCube=le,this.rebindTextures=Ce,this.setupRenderTarget=we,this.updateRenderTargetMipmap=Te,this.updateMultisampleRenderTarget=Oe,this.setupDepthRenderbuffer=Se,this.setupFrameBufferTexture=ye,this.useMultisampledRTT=Ae,this.isReversedDepthBuffer=function(){return d.buffers.depth.getReversed()}}function Xu(e,t){function n(n,r=``){let i,a=Nt.getTransfer(r);if(n===1009)return e.UNSIGNED_BYTE;if(n===1017)return e.UNSIGNED_SHORT_4_4_4_4;if(n===1018)return e.UNSIGNED_SHORT_5_5_5_1;if(n===35902)return e.UNSIGNED_INT_5_9_9_9_REV;if(n===35899)return e.UNSIGNED_INT_10F_11F_11F_REV;if(n===1010)return e.BYTE;if(n===1011)return e.SHORT;if(n===1012)return e.UNSIGNED_SHORT;if(n===1013)return e.INT;if(n===1014)return e.UNSIGNED_INT;if(n===1015)return e.FLOAT;if(n===1016)return e.HALF_FLOAT;if(n===1021)return e.ALPHA;if(n===1022)return e.RGB;if(n===1023)return e.RGBA;if(n===1026)return e.DEPTH_COMPONENT;if(n===1027)return e.DEPTH_STENCIL;if(n===1028)return e.RED;if(n===1029)return e.RED_INTEGER;if(n===1030)return e.RG;if(n===1031)return e.RG_INTEGER;if(n===1033)return e.RGBA_INTEGER;if(n===33776||n===33777||n===33778||n===33779){if(a===`srgb`){if(i=t.get(`WEBGL_compressed_texture_s3tc_srgb`),i!==null){if(n===33776)return i.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null}else if(i=t.get(`WEBGL_compressed_texture_s3tc`),i!==null){if(n===33776)return i.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null}if(n===35840||n===35841||n===35842||n===35843){if(i=t.get(`WEBGL_compressed_texture_pvrtc`),i!==null){if(n===35840)return i.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===35841)return i.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===35842)return i.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===35843)return i.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null}if(n===36196||n===37492||n===37496||n===37488||n===37489||n===37490||n===37491){if(i=t.get(`WEBGL_compressed_texture_etc`),i!==null){if(n===36196||n===37492)return a===`srgb`?i.COMPRESSED_SRGB8_ETC2:i.COMPRESSED_RGB8_ETC2;if(n===37496)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:i.COMPRESSED_RGBA8_ETC2_EAC;if(n===37488)return i.COMPRESSED_R11_EAC;if(n===37489)return i.COMPRESSED_SIGNED_R11_EAC;if(n===37490)return i.COMPRESSED_RG11_EAC;if(n===37491)return i.COMPRESSED_SIGNED_RG11_EAC}else return null}if(n===37808||n===37809||n===37810||n===37811||n===37812||n===37813||n===37814||n===37815||n===37816||n===37817||n===37818||n===37819||n===37820||n===37821){if(i=t.get(`WEBGL_compressed_texture_astc`),i!==null){if(n===37808)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:i.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===37809)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:i.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===37810)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:i.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===37811)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:i.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===37812)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:i.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===37813)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:i.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===37814)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:i.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===37815)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:i.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===37816)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:i.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===37817)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:i.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===37818)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:i.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===37819)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:i.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===37820)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:i.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===37821)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:i.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null}if(n===36492||n===36494||n===36495){if(i=t.get(`EXT_texture_compression_bptc`),i!==null){if(n===36492)return a===`srgb`?i.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:i.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===36494)return i.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===36495)return i.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null}if(n===36283||n===36284||n===36285||n===36286){if(i=t.get(`EXT_texture_compression_rgtc`),i!==null){if(n===36283)return i.COMPRESSED_RED_RGTC1_EXT;if(n===36284)return i.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===36285)return i.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===36286)return i.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null}return n===1020?e.UNSIGNED_INT_24_8:e[n]===void 0?null:e[n]}return{convert:n}}var Zu=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Qu=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,$u=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new Xi(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new Fo({vertexShader:Zu,fragmentShader:Qu,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new J(new Co(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},ed=class extends $e{constructor(e,t){super();let n=this,r=null,i=1,a=null,o=`local-floor`,s=1,c=null,u=null,d=null,f=null,p=null,h=null,g=typeof XRWebGLBinding<`u`,_=new $u,v={},b=t.getContextAttributes(),x=null,S=null,C=[],D=[],O=new W,k=null,A=null,j=new ys;j.viewport=new Wt;let M=new ys;M.viewport=new Wt;let ee=[j,M],N=new Es,te=null,P=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(e){let t=C[e];return t===void 0&&(t=new En,C[e]=t),t.getTargetRaySpace()},this.getControllerGrip=function(e){let t=C[e];return t===void 0&&(t=new En,C[e]=t),t.getGripSpace()},this.getHand=function(e){let t=C[e];return t===void 0&&(t=new En,C[e]=t),t.getHandSpace()};function ne(e){let t=D.indexOf(e.inputSource);if(t===-1)return;let n=C[t];n!==void 0&&(n.update(e.inputSource,e.frame,c||a),n.dispatchEvent({type:e.type,data:e.inputSource}))}function F(){r.removeEventListener(`select`,ne),r.removeEventListener(`selectstart`,ne),r.removeEventListener(`selectend`,ne),r.removeEventListener(`squeeze`,ne),r.removeEventListener(`squeezestart`,ne),r.removeEventListener(`squeezeend`,ne),r.removeEventListener(`end`,F),r.removeEventListener(`inputsourceschange`,re);for(let e=0;e<C.length;e++){let t=D[e];t!==null&&(D[e]=null,C[e].disconnect(t))}te=null,P=null,_.reset();for(let e in v)delete v[e];if(e.setRenderTarget(x),p=null,f=null,d=null,r=null,S=null,le.stop(),n.isPresenting=!1,e.setPixelRatio(k),e.setSize(O.width,O.height,!1),A!==null){let e=A.camera;e.fov=A.fov,e.zoom=A.zoom,e.updateProjectionMatrix(),A=null}n.dispatchEvent({type:`sessionend`})}this.setFramebufferScaleFactor=function(e){i=e,n.isPresenting===!0&&V(`WebXRManager: Cannot change framebuffer scale while presenting.`)},this.setReferenceSpaceType=function(e){o=e,n.isPresenting===!0&&V(`WebXRManager: Cannot change reference space type while presenting.`)},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(e){c=e},this.getBaseLayer=function(){return f===null?p:f},this.getBinding=function(){return d===null&&g&&(d=new XRWebGLBinding(r,t)),d},this.getFrame=function(){return h},this.getSession=function(){return r},this.setSession=async function(u){if(r=u,r!==null){if(x=e.getRenderTarget(),r.addEventListener(`select`,ne),r.addEventListener(`selectstart`,ne),r.addEventListener(`selectend`,ne),r.addEventListener(`squeeze`,ne),r.addEventListener(`squeezestart`,ne),r.addEventListener(`squeezeend`,ne),r.addEventListener(`end`,F),r.addEventListener(`inputsourceschange`,re),b.xrCompatible!==!0&&await t.makeXRCompatible(),k=e.getPixelRatio(),e.getSize(O),g&&`createProjectionLayer`in XRWebGLBinding.prototype){let n=null,a=null,o=null;b.depth&&(o=b.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,n=b.stencil?E:T,a=b.stencil?y:m);let s={colorFormat:t.RGBA8,depthFormat:o,scaleFactor:i};d=this.getBinding(),f=d.createProjectionLayer(s),r.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),S=new Kt(f.textureWidth,f.textureHeight,{format:w,type:l,depthTexture:new Ji(f.textureWidth,f.textureHeight,a,void 0,void 0,void 0,void 0,void 0,void 0,n),stencilBuffer:b.stencil,colorSpace:e.outputColorSpace,samples:b.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}else{let n={antialias:b.antialias,alpha:!0,depth:b.depth,stencil:b.stencil,framebufferScaleFactor:i};p=new XRWebGLLayer(r,t,n),r.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),S=new Kt(p.framebufferWidth,p.framebufferHeight,{format:w,type:l,colorSpace:e.outputColorSpace,stencilBuffer:b.stencil,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1,storeMultisampledDepthBuffer:p.ignoreDepthValues===!1,storeMultisampledStencilBuffer:p.ignoreDepthValues===!1})}S.isXRRenderTarget=!0,this.setFoveation(s),c=null,a=await r.requestReferenceSpace(o),le.setContext(r),le.start(),n.isPresenting=!0,n.dispatchEvent({type:`sessionstart`})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return _.getDepthTexture()};function re(e){for(let t=0;t<e.removed.length;t++){let n=e.removed[t],r=D.indexOf(n);r>=0&&(D[r]=null,C[r].disconnect(n))}for(let t=0;t<e.added.length;t++){let n=e.added[t],r=D.indexOf(n);if(r===-1){for(let e=0;e<C.length;e++)if(e>=D.length){D.push(n),r=e;break}else if(D[e]===null){D[e]=n,r=e;break}if(r===-1)break}let i=C[r];i&&i.connect(n)}}let ie=new K,I=new K;function ae(e,t,n){ie.setFromMatrixPosition(t.matrixWorld),I.setFromMatrixPosition(n.matrixWorld);let r=ie.distanceTo(I),i=t.projectionMatrix.elements,a=n.projectionMatrix.elements,o=i[14]/(i[10]-1),s=i[14]/(i[10]+1),c=(i[9]+1)/i[5],l=(i[9]-1)/i[5],u=(i[8]-1)/i[0],d=(a[8]+1)/a[0],f=o*u,p=o*d,m=r/(-u+d),h=m*-u;if(t.matrixWorld.decompose(e.position,e.quaternion,e.scale),e.translateX(h),e.translateZ(m),e.matrixWorld.compose(e.position,e.quaternion,e.scale),e.matrixWorldInverse.copy(e.matrixWorld).invert(),i[10]===-1)e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse);else{let t=o+m,n=s+m,i=f-h,a=p+(r-h),u=c*s/n*t,d=l*s/n*t;e.projectionMatrix.makePerspective(i,a,u,d,t,n),e.projectionMatrixInverse.copy(e.projectionMatrix).invert()}}function oe(e,t){t===null?e.matrixWorld.copy(e.matrix):e.matrixWorld.multiplyMatrices(t.matrixWorld,e.matrix),e.matrixWorldInverse.copy(e.matrixWorld).invert()}this.updateCamera=function(e){if(r===null)return;let t=e.near,n=e.far;_.texture!==null&&(_.depthNear>0&&(t=_.depthNear),_.depthFar>0&&(n=_.depthFar)),N.near=M.near=j.near=t,N.far=M.far=j.far=n,(te!==N.near||P!==N.far)&&(r.updateRenderState({depthNear:N.near,depthFar:N.far}),te=N.near,P=N.far),N.layers.mask=e.layers.mask|6,j.layers.mask=N.layers.mask&-5,M.layers.mask=N.layers.mask&-3;let i=e.parent,a=N.cameras;oe(N,i);for(let e=0;e<a.length;e++)oe(a[e],i);a.length===2?ae(N,j,M):N.projectionMatrix.copy(j.projectionMatrix),A===null&&e.isPerspectiveCamera&&(A={camera:e,fov:e.fov,zoom:e.zoom}),L(e,N,i)};function L(e,t,n){n===null?e.matrix.copy(t.matrixWorld):(e.matrix.copy(n.matrixWorld),e.matrix.invert(),e.matrix.multiply(t.matrixWorld)),e.matrix.decompose(e.position,e.quaternion,e.scale),e.updateMatrixWorld(!0),e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse),e.isPerspectiveCamera&&(e.fov=rt*2*Math.atan(1/e.projectionMatrix.elements[5]),e.zoom=1)}this.getCamera=function(){return N},this.getFoveation=function(){if(f!==null||p!==null)return s},this.setFoveation=function(e){s=e,f!==null&&(f.fixedFoveation=e),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=e)},this.hasDepthSensing=function(){return _.texture!==null},this.getDepthSensingMesh=function(){return _.getMesh(N)},this.getCameraTexture=function(e){return v[e]};let se=null;function ce(t,i){if(u=i.getViewerPose(c||a),h=i,u!==null){let t=u.views;p!==null&&(e.setRenderTargetFramebuffer(S,p.framebuffer),e.setRenderTarget(S));let i=!1;t.length!==N.cameras.length&&(N.cameras.length=0,i=!0);for(let n=0;n<t.length;n++){let r=t[n],a=null;if(p!==null)a=p.getViewport(r);else{let t=d.getViewSubImage(f,r);a=t.viewport,n===0&&(e.setRenderTargetTextures(S,t.colorTexture,t.depthStencilTexture),e.setRenderTarget(S))}let o=ee[n];o===void 0&&(o=new ys,o.layers.enable(n),o.viewport=new Wt,ee[n]=o),o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.projectionMatrix.fromArray(r.projectionMatrix),o.projectionMatrixInverse.copy(o.projectionMatrix).invert(),o.viewport.set(a.x,a.y,a.width,a.height),n===0&&(N.matrix.copy(o.matrix),N.matrix.decompose(N.position,N.quaternion,N.scale)),i===!0&&N.cameras.push(o)}let a=r.enabledFeatures;if(a&&a.includes(`depth-sensing`)&&r.depthUsage==`gpu-optimized`&&g){d=n.getBinding();let e=d.getDepthInformation(t[0]);e&&e.isValid&&e.texture&&_.init(e,r.renderState)}if(a&&a.includes(`camera-access`)&&g){e.state.unbindTexture(),d=n.getBinding();for(let e=0;e<t.length;e++){let n=t[e].camera;if(n){let e=v[n];e||(e=new Xi,v[n]=e);let t=d.getCameraImage(n);e.sourceTexture=t}}}}for(let e=0;e<C.length;e++){let t=D[e],n=C[e];t!==null&&n!==void 0&&n.update(t,i,c||a)}se&&se(t,i),i.detectedPlanes&&n.dispatchEvent({type:`planesdetected`,data:i}),h=null}let le=new Gs;le.setAnimationLoop(ce),this.setAnimationLoop=function(e){se=e},this.dispose=function(){}}},td=new Yt,nd=new Ot;nd.set(-1,0,0,0,1,0,0,0,1);function rd(e,t){function n(e,t){e.matrixAutoUpdate===!0&&e.updateMatrix(),t.value.copy(e.matrix)}function r(t,n){n.color.getRGB(t.fogColor.value,jo(e)),n.isFog?(t.fogNear.value=n.near,t.fogFar.value=n.far):n.isFogExp2&&(t.fogDensity.value=n.density)}function i(e,t,n,r,i){t.isNodeMaterial?t.uniformsNeedUpdate=!1:t.isMeshBasicMaterial?a(e,t):t.isMeshLambertMaterial?(a(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshToonMaterial?(a(e,t),d(e,t)):t.isMeshPhongMaterial?(a(e,t),u(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshStandardMaterial?(a(e,t),f(e,t),t.isMeshPhysicalMaterial&&p(e,t,i)):t.isMeshMatcapMaterial?(a(e,t),m(e,t)):t.isMeshDepthMaterial?a(e,t):t.isMeshDistanceMaterial?(a(e,t),h(e,t)):t.isMeshNormalMaterial?a(e,t):t.isLineBasicMaterial?(o(e,t),t.isLineDashedMaterial&&s(e,t)):t.isPointsMaterial?c(e,t,n,r):t.isSpriteMaterial?l(e,t):t.isShadowMaterial?(e.color.value.copy(t.color),e.opacity.value=t.opacity):t.isShaderMaterial&&(t.uniformsNeedUpdate=!1)}function a(e,r){e.opacity.value=r.opacity,r.color&&e.diffuse.value.copy(r.color),r.emissive&&e.emissive.value.copy(r.emissive).multiplyScalar(r.emissiveIntensity),r.map&&(e.map.value=r.map,n(r.map,e.mapTransform)),r.alphaMap&&(e.alphaMap.value=r.alphaMap,n(r.alphaMap,e.alphaMapTransform)),r.bumpMap&&(e.bumpMap.value=r.bumpMap,n(r.bumpMap,e.bumpMapTransform),e.bumpScale.value=r.bumpScale,r.side===1&&(e.bumpScale.value*=-1)),r.normalMap&&(e.normalMap.value=r.normalMap,n(r.normalMap,e.normalMapTransform),e.normalScale.value.copy(r.normalScale),r.side===1&&e.normalScale.value.negate()),r.displacementMap&&(e.displacementMap.value=r.displacementMap,n(r.displacementMap,e.displacementMapTransform),e.displacementScale.value=r.displacementScale,e.displacementBias.value=r.displacementBias),r.emissiveMap&&(e.emissiveMap.value=r.emissiveMap,n(r.emissiveMap,e.emissiveMapTransform)),r.specularMap&&(e.specularMap.value=r.specularMap,n(r.specularMap,e.specularMapTransform)),r.alphaTest>0&&(e.alphaTest.value=r.alphaTest);let i=t.get(r),a=i.envMap,o=i.envMapRotation;a&&(e.envMap.value=a,e.envMapRotation.value.setFromMatrix4(td.makeRotationFromEuler(o)).transpose(),a.isCubeTexture&&a.isRenderTargetTexture===!1&&e.envMapRotation.value.premultiply(nd),e.reflectivity.value=r.reflectivity,e.ior.value=r.ior,e.refractionRatio.value=r.refractionRatio),r.lightMap&&(e.lightMap.value=r.lightMap,e.lightMapIntensity.value=r.lightMapIntensity,n(r.lightMap,e.lightMapTransform)),r.aoMap&&(e.aoMap.value=r.aoMap,e.aoMapIntensity.value=r.aoMapIntensity,n(r.aoMap,e.aoMapTransform))}function o(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform))}function s(e,t){e.dashSize.value=t.dashSize,e.totalSize.value=t.dashSize+t.gapSize,e.scale.value=t.scale}function c(e,t,r,i){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.size.value=t.size*r,e.scale.value=i*.5,t.map&&(e.map.value=t.map,n(t.map,e.uvTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function l(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.rotation.value=t.rotation,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function u(e,t){e.specular.value.copy(t.specular),e.shininess.value=Math.max(t.shininess,1e-4)}function d(e,t){t.gradientMap&&(e.gradientMap.value=t.gradientMap)}function f(e,t){e.metalness.value=t.metalness,t.metalnessMap&&(e.metalnessMap.value=t.metalnessMap,n(t.metalnessMap,e.metalnessMapTransform)),e.roughness.value=t.roughness,t.roughnessMap&&(e.roughnessMap.value=t.roughnessMap,n(t.roughnessMap,e.roughnessMapTransform)),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)}function p(e,t,r){e.ior.value=t.ior,t.sheen>0&&(e.sheenColor.value.copy(t.sheenColor).multiplyScalar(t.sheen),e.sheenRoughness.value=t.sheenRoughness,t.sheenColorMap&&(e.sheenColorMap.value=t.sheenColorMap,n(t.sheenColorMap,e.sheenColorMapTransform)),t.sheenRoughnessMap&&(e.sheenRoughnessMap.value=t.sheenRoughnessMap,n(t.sheenRoughnessMap,e.sheenRoughnessMapTransform))),t.clearcoat>0&&(e.clearcoat.value=t.clearcoat,e.clearcoatRoughness.value=t.clearcoatRoughness,t.clearcoatMap&&(e.clearcoatMap.value=t.clearcoatMap,n(t.clearcoatMap,e.clearcoatMapTransform)),t.clearcoatRoughnessMap&&(e.clearcoatRoughnessMap.value=t.clearcoatRoughnessMap,n(t.clearcoatRoughnessMap,e.clearcoatRoughnessMapTransform)),t.clearcoatNormalMap&&(e.clearcoatNormalMap.value=t.clearcoatNormalMap,n(t.clearcoatNormalMap,e.clearcoatNormalMapTransform),e.clearcoatNormalScale.value.copy(t.clearcoatNormalScale),t.side===1&&e.clearcoatNormalScale.value.negate())),t.dispersion>0&&(e.dispersion.value=t.dispersion),t.retroreflectivity>0&&(e.retroreflectivity.value=t.retroreflectivity),t.iridescence>0&&(e.iridescence.value=t.iridescence,e.iridescenceIOR.value=t.iridescenceIOR,e.iridescenceThicknessMinimum.value=t.iridescenceThicknessRange[0],e.iridescenceThicknessMaximum.value=t.iridescenceThicknessRange[1],t.iridescenceMap&&(e.iridescenceMap.value=t.iridescenceMap,n(t.iridescenceMap,e.iridescenceMapTransform)),t.iridescenceThicknessMap&&(e.iridescenceThicknessMap.value=t.iridescenceThicknessMap,n(t.iridescenceThicknessMap,e.iridescenceThicknessMapTransform))),t.transmission>0&&(e.transmission.value=t.transmission,e.transmissionSamplerMap.value=r.texture,e.transmissionSamplerSize.value.set(r.width,r.height),t.transmissionMap&&(e.transmissionMap.value=t.transmissionMap,n(t.transmissionMap,e.transmissionMapTransform)),e.thickness.value=t.thickness,t.thicknessMap&&(e.thicknessMap.value=t.thicknessMap,n(t.thicknessMap,e.thicknessMapTransform)),e.attenuationDistance.value=t.attenuationDistance,e.attenuationColor.value.copy(t.attenuationColor)),t.anisotropy>0&&(e.anisotropyVector.value.set(t.anisotropy*Math.cos(t.anisotropyRotation),t.anisotropy*Math.sin(t.anisotropyRotation)),t.anisotropyMap&&(e.anisotropyMap.value=t.anisotropyMap,n(t.anisotropyMap,e.anisotropyMapTransform))),e.specularIntensity.value=t.specularIntensity,e.specularColor.value.copy(t.specularColor),t.specularColorMap&&(e.specularColorMap.value=t.specularColorMap,n(t.specularColorMap,e.specularColorMapTransform)),t.specularIntensityMap&&(e.specularIntensityMap.value=t.specularIntensityMap,n(t.specularIntensityMap,e.specularIntensityMapTransform))}function m(e,t){t.matcap&&(e.matcap.value=t.matcap)}function h(e,n){let r=t.get(n).light;e.referencePosition.value.setFromMatrixPosition(r.matrixWorld),e.nearDistance.value=r.shadow.camera.near,e.farDistance.value=r.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:i}}function id(e,t,n,r){let i={},a={},o=[],s=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function c(e,t){let n=t.program;r.uniformBlockBinding(e,n)}function l(e,n){let o=i[e.id];o===void 0&&(g(e),o=u(e),i[e.id]=o,e.addEventListener(`dispose`,v));let s=n.program;r.updateUBOMapping(e,s);let c=t.render.frame;a[e.id]!==c&&(f(e),a[e.id]=c)}function u(t){let n=d();t.__bindingPointIndex=n;let r=e.createBuffer(),i=t.__size,a=t.usage;return e.bindBuffer(e.UNIFORM_BUFFER,r),e.bufferData(e.UNIFORM_BUFFER,i,a),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,n,r),r}function d(){for(let e=0;e<s;e++)if(o.indexOf(e)===-1)return o.push(e),e;return H(`WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached.`),0}function f(t){let n=i[t.id],r=t.uniforms,a=t.__cache;e.bindBuffer(e.UNIFORM_BUFFER,n);for(let e=0,t=r.length;e<t;e++){let t=r[e];if(Array.isArray(t))for(let n=0,r=t.length;n<r;n++)p(t[n],e,n,a);else p(t,e,0,a)}e.bindBuffer(e.UNIFORM_BUFFER,null)}function p(t,n,r,i){if(h(t,n,r,i)===!0){let n=t.__offset,r=t.value;if(Array.isArray(r)){let e=0;for(let n=0;n<r.length;n++){let i=r[n],a=_(i);m(i,t.__data,e),typeof i!=`number`&&typeof i!=`boolean`&&!i.isMatrix3&&!ArrayBuffer.isView(i)&&(e+=a.storage/Float32Array.BYTES_PER_ELEMENT)}}else m(r,t.__data,0);e.bufferSubData(e.UNIFORM_BUFFER,n,t.__data)}}function m(e,t,n){typeof e==`number`||typeof e==`boolean`?t[0]=e:e.isMatrix3?(t[0]=e.elements[0],t[1]=e.elements[1],t[2]=e.elements[2],t[3]=0,t[4]=e.elements[3],t[5]=e.elements[4],t[6]=e.elements[5],t[7]=0,t[8]=e.elements[6],t[9]=e.elements[7],t[10]=e.elements[8],t[11]=0):ArrayBuffer.isView(e)?t.set(new e.constructor(e.buffer,e.byteOffset,t.length)):e.toArray(t,n)}function h(e,t,n,r){let i=e.value,a=t+`_`+n;if(r[a]===void 0)return r[a]=typeof i==`number`||typeof i==`boolean`?i:ArrayBuffer.isView(i)?i.slice():i.clone(),!0;{let e=r[a];if(typeof i==`number`||typeof i==`boolean`){if(e!==i)return r[a]=i,!0}else if(ArrayBuffer.isView(i))return!0;else if(e.equals(i)===!1)return e.copy(i),!0}return!1}function g(e){let t=e.uniforms,n=0;for(let e=0,r=t.length;e<r;e++){let r=Array.isArray(t[e])?t[e]:[t[e]];for(let e=0,t=r.length;e<t;e++){let t=r[e],i=Array.isArray(t.value)?t.value:[t.value];for(let e=0,r=i.length;e<r;e++){let r=i[e],a=_(r),o=n%16,s=o%a.boundary,c=o+s;n+=s,c!==0&&16-c<a.storage&&(n+=16-c),t.__data=new Float32Array(a.storage/Float32Array.BYTES_PER_ELEMENT),t.__offset=n,n+=a.storage}}}let r=n%16;return r>0&&(n+=16-r),e.__size=n,e.__cache={},this}function _(e){let t={boundary:0,storage:0};return typeof e==`number`||typeof e==`boolean`?(t.boundary=4,t.storage=4):e.isVector2?(t.boundary=8,t.storage=8):e.isVector3||e.isColor?(t.boundary=16,t.storage=12):e.isVector4?(t.boundary=16,t.storage=16):e.isMatrix3?(t.boundary=48,t.storage=48):e.isMatrix4?(t.boundary=64,t.storage=64):e.isTexture?V(`WebGLRenderer: Texture samplers can not be part of an uniforms group.`):ArrayBuffer.isView(e)?(t.boundary=16,t.storage=e.byteLength):V(`WebGLRenderer: Unsupported uniform value type.`,e),t}function v(t){let n=t.target;n.removeEventListener(`dispose`,v);let r=o.indexOf(n.__bindingPointIndex);o.splice(r,1),e.deleteBuffer(i[n.id]),delete i[n.id],delete a[n.id]}function y(){for(let t in i)e.deleteBuffer(i[t]);o=[],i={},a={}}return{bind:c,update:l,dispose:y}}var ad=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),od=null;function sd(){return od===null&&(od=new vi(ad,16,16,k,g),od.name=`DFG_LUT`,od.minFilter=o,od.magFilter=o,od.wrapS=t,od.wrapT=t,od.generateMipmaps=!1,od.needsUpdate=!0),od}var cd=class{constructor(e={}){let{canvas:t=Ke(),context:n=null,depth:r=!0,stencil:i=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:s=!0,preserveDrawingBuffer:u=!1,powerPreference:d=`default`,failIfMajorPerformanceCaveat:p=!1,reversedDepthBuffer:h=!1,outputBufferType:b=l}=e;this.isWebGLRenderer=!0;let x;if(n!==null){if(typeof WebGLRenderingContext<`u`&&n instanceof WebGLRenderingContext)throw Error(`THREE.WebGLRenderer: WebGL 1 is not supported since r163.`);x=n.getContextAttributes().alpha}else x=a;let S=b,C=new Set([j,A,O]),w=new Set([l,m,f,y,_,v]),T=new Uint32Array(4),E=new Int32Array(4),D=new K,k=null,M=null,ee=[],N=[],te=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=0,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let P=this,ne=!1,F=null,re=null,ie=null,I=null;this._outputColorSpace=Fe;let ae=0,oe=0,L=null,se=-1,ce=null,le=new Wt,ue=new Wt,de=null,fe=new q(0),pe=0,me=t.width,he=t.height,ge=1,_e=null,ve=null,ye=new Wt(0,0,me,he),be=new Wt(0,0,me,he),xe=!1,Se=new ji,Ce=!1,we=!1,Te=new Yt,Ee=new K,De=new Wt,Oe={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},ke=!1;function Ae(){return L===null?ge:1}let R=n;function je(e,n){return t.getContext(e,n)}let Me,Ne,z,Pe,B,Ie,Le,Re,ze,Be,Ve,Ue,We,Ge,qe,Ye,Xe,Qe,$e,et,tt,nt,rt;try{let e={alpha:!0,depth:r,stencil:i,antialias:o,premultipliedAlpha:s,preserveDrawingBuffer:u,powerPreference:d,failIfMajorPerformanceCaveat:p};if(`setAttribute`in t&&t.setAttribute(`data-engine`,`three.js r186`),t.addEventListener(`webglcontextlost`,at,!1),t.addEventListener(`webglcontextrestored`,ot,!1),t.addEventListener(`webglcontextcreationerror`,st,!1),R===null){let t=`webgl2`;if(R=je(t,e),R===null)throw je(t)?Error(`THREE.WebGLRenderer: Error creating WebGL context with your selected attributes.`):Error(`THREE.WebGLRenderer: Error creating WebGL context.`)}it()}catch(e){throw t.removeEventListener(`webglcontextlost`,at,!1),t.removeEventListener(`webglcontextrestored`,ot,!1),t.removeEventListener(`webglcontextcreationerror`,st,!1),H(`WebGLRenderer: `+e.message),e}function it(){Me=new Ec(R),Me.init(),tt=new Xu(R,Me),Ne=new tc(R,Me,e,tt),z=new Ju(R,Me),Ne.reversedDepthBuffer&&h&&z.buffers.depth.setReversed(!0),re=R.createFramebuffer(),ie=R.createFramebuffer(),I=R.createFramebuffer(),Pe=new kc(R),B=new Ou,Ie=new Yu(R,Me,z,B,Ne,tt,Pe),Le=new Tc(P),Re=new Ks(R),nt=new $s(R,Re),ze=new Dc(R,Re,Pe,nt),Be=new jc(R,ze,Re,nt,Pe),Qe=new Ac(R,Ne,Ie),qe=new nc(B),Ve=new Du(P,Le,Me,Ne,nt,qe),Ue=new rd(P,B),We=new Mu,Ge=new zu(Me),Xe=new Qs(P,Le,z,Be,x,s),Ye=new qu(P,Be,Ne),rt=new id(R,Pe,Ne,z),$e=new ec(R,Me,Pe),et=new Oc(R,Me,Pe),Pe.programs=Ve.programs,P.capabilities=Ne,P.extensions=Me,P.properties=B,P.renderLists=We,P.shadowMap=Ye,P.state=z,P.info=Pe}S!==1009&&(te=new Nc(S,t.width,t.height,o,r,i));let U=new ed(P,R);this.xr=U,this.getContext=function(){return R},this.getContextAttributes=function(){return R.getContextAttributes()},this.forceContextLoss=function(){let e=Me.get(`WEBGL_lose_context`);e&&e.loseContext()},this.forceContextRestore=function(){let e=Me.get(`WEBGL_lose_context`);e&&e.restoreContext()},this.getPixelRatio=function(){return ge},this.setPixelRatio=function(e){e!==void 0&&(ge=e,this.setSize(me,he,!1))},this.getSize=function(e){return e.set(me,he)},this.setSize=function(e,n,r=!0){if(U.isPresenting){V(`WebGLRenderer: Can't change size while VR device is presenting.`);return}me=e,he=n,t.width=Math.floor(e*ge),t.height=Math.floor(n*ge),r===!0&&(t.style.width=e+`px`,t.style.height=n+`px`),te!==null&&te.setSize(t.width,t.height),this.setViewport(0,0,e,n)},this.getDrawingBufferSize=function(e){return e.set(me*ge,he*ge).floor()},this.setDrawingBufferSize=function(e,n,r){me=e,he=n,ge=r,t.width=Math.floor(e*r),t.height=Math.floor(n*r),this.setViewport(0,0,e,n)},this.setEffects=function(e){if(S===1009){H(`WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.`);return}if(e){for(let t=0;t<e.length;t++)if(e[t].isOutputPass===!0){V(`WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.`);break}}te.setEffects(e||[])},this.getCurrentViewport=function(e){return e.copy(le)},this.getViewport=function(e){return e.copy(ye)},this.setViewport=function(e,t,n,r){e.isVector4?ye.set(e.x,e.y,e.z,e.w):ye.set(e,t,n,r),z.viewport(le.copy(ye).multiplyScalar(ge).round())},this.getScissor=function(e){return e.copy(be)},this.setScissor=function(e,t,n,r){e.isVector4?be.set(e.x,e.y,e.z,e.w):be.set(e,t,n,r),z.scissor(ue.copy(be).multiplyScalar(ge).round())},this.getScissorTest=function(){return xe},this.setScissorTest=function(e){z.setScissorTest(xe=e)},this.setOpaqueSort=function(e){_e=e},this.setTransparentSort=function(e){ve=e},this.getClearColor=function(e){return e.copy(Xe.getClearColor())},this.setClearColor=function(){Xe.setClearColor(...arguments)},this.getClearAlpha=function(){return Xe.getClearAlpha()},this.setClearAlpha=function(){Xe.setClearAlpha(...arguments)},this.clear=function(e=!0,t=!0,n=!0){let r=0;if(e){let e=!1;if(L!==null){let t=L.texture.format;e=C.has(t)}if(e){let e=L.texture.type,t=w.has(e),n=Xe.getClearColor(),r=Xe.getClearAlpha(),i=n.r,a=n.g,o=n.b;t?(T[0]=i,T[1]=a,T[2]=o,T[3]=r,R.clearBufferuiv(R.COLOR,0,T)):(E[0]=i,E[1]=a,E[2]=o,E[3]=r,R.clearBufferiv(R.COLOR,0,E))}else r|=R.COLOR_BUFFER_BIT}t&&(r|=R.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),n&&(r|=R.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),r!==0&&R.clear(r)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(e){e.setRenderer(this),F=e},this.dispose=function(){t.removeEventListener(`webglcontextlost`,at,!1),t.removeEventListener(`webglcontextrestored`,ot,!1),t.removeEventListener(`webglcontextcreationerror`,st,!1),Xe.dispose(),We.dispose(),Ge.dispose(),B.dispose(),Le.dispose(),Be.dispose(),nt.dispose(),rt.dispose(),Ve.dispose(),U.dispose(),U.removeEventListener(`sessionstart`,mt),U.removeEventListener(`sessionend`,ht),gt.stop()};function at(e){e.preventDefault(),Je(`WebGLRenderer: Context Lost.`),ne=!0}function ot(){Je(`WebGLRenderer: Context Restored.`),ne=!1;let e=Pe.autoReset,t=Ye.enabled,n=Ye.autoUpdate,r=Ye.needsUpdate,i=Ye.type;it(),Pe.autoReset=e,Ye.enabled=t,Ye.autoUpdate=n,Ye.needsUpdate=r,Ye.type=i}function st(e){H(`WebGLRenderer: A WebGL context could not be created. Reason: `,e.statusMessage)}function ct(e){let t=e.target;t.removeEventListener(`dispose`,ct),lt(t)}function lt(e){ut(e),B.remove(e)}function ut(e){let t=B.get(e).programs;t!==void 0&&(t.forEach(function(e){Ve.releaseProgram(e)}),e.isShaderMaterial&&Ve.releaseShaderCache(e))}this.renderBufferDirect=function(e,t,n,r,i,a){t===null&&(t=Oe);let o=i.isMesh&&i.matrixWorld.determinantAffine()<0,s=W(e,t,n,r,i);z.setMaterial(r,o);let c=n.index,l=1;if(r.wireframe===!0){if(c=ze.getWireframeAttribute(n),c===void 0)return;l=2}let u=n.drawRange,d=n.attributes.position,f=u.start*l,p=(u.start+u.count)*l;a!==null&&(f=Math.max(f,a.start*l),p=Math.min(p,(a.start+a.count)*l)),c===null?d!=null&&(f=Math.max(f,0),p=Math.min(p,d.count)):(f=Math.max(f,0),p=Math.min(p,c.count));let m=p-f;if(m<0||m===1/0)return;nt.setup(i,r,s,n,c);let h,g=$e;if(c!==null&&(h=Re.get(c),g=et,g.setIndex(h)),i.isMesh)r.wireframe===!0?(z.setLineWidth(r.wireframeLinewidth*Ae()),g.setMode(R.LINES)):g.setMode(R.TRIANGLES);else if(i.isLine){let e=r.linewidth;e===void 0&&(e=1),z.setLineWidth(e*Ae()),i.isLineSegments?g.setMode(R.LINES):i.isLineLoop?g.setMode(R.LINE_LOOP):g.setMode(R.LINE_STRIP)}else i.isPoints?g.setMode(R.POINTS):i.isSprite&&g.setMode(R.TRIANGLES);if(i.isBatchedMesh){if(Me.get(`WEBGL_multi_draw`))g.renderMultiDraw(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount);else{let e=i._multiDrawStarts,t=i._multiDrawCounts,n=i._multiDrawCount,a=c?Re.get(c).bytesPerElement:1,o=B.get(r).currentProgram.getUniforms();for(let r=0;r<n;r++)o.setValue(R,`_gl_DrawID`,r),g.render(e[r]/a,t[r])}}else if(i.isInstancedMesh)g.renderInstances(f,m,i.count);else if(n.isInstancedBufferGeometry){let e=n._maxInstanceCount===void 0?1/0:n._maxInstanceCount,t=Math.min(n.instanceCount,e);g.renderInstances(f,m,t)}else g.render(f,m)};function dt(e,t,n,r){F!==null&&e.isNodeMaterial&&F.setObject(r,e),Ce===!0&&qe.setState(e,n,!1),e.transparent===!0&&e.side===2&&e.forceSinglePass===!1?(e.side=1,e.needsUpdate=!0,St(e,t,r),e.side=0,e.needsUpdate=!0,St(e,t,r),e.side=2):St(e,t,r)}this.compile=function(e,t,n=null){n===null&&(n=e),F!==null&&F.renderStart(e,t,n),M=Ge.get(n),M.init(t),N.push(M),n.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(M.pushLight(e),e.castShadow&&M.pushShadow(e))}),e!==n&&e.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(M.pushLight(e),e.castShadow&&M.pushShadow(e))}),M.setupLights(),F!==null&&F.updateLights(M.state.lightsArray),we=this.localClippingEnabled,Ce=qe.init(this.clippingPlanes,we),Ce===!0&&qe.setGlobalState(this.clippingPlanes,t),F!==null&&Ye.render(M.state.shadowsArray,n,t);let r=new Set;return e.traverse(function(e){if(!(e.isMesh||e.isPoints||e.isLine||e.isSprite))return;let i=e.material;if(i){if(Array.isArray(i))for(let a=0;a<i.length;a++){let o=i[a];dt(o,n,t,e),r.add(o)}else dt(i,n,t,e),r.add(i)}}),M=N.pop(),F!==null&&F.renderEnd(),r},this.compileAsync=function(e,t,n=null){let r=this.compile(e,t,n);return new Promise(t=>{function n(){if(r.forEach(function(e){let t=B.get(e).currentProgram;(t===void 0||t.isReady())&&r.delete(e)}),r.size===0){t(e);return}setTimeout(n,10)}Me.get(`KHR_parallel_shader_compile`)===null?setTimeout(n,10):n()})};let ft=null;function pt(e){ft&&ft(e)}function mt(){gt.stop()}function ht(){gt.start()}let gt=new Gs;gt.setAnimationLoop(pt),typeof self<`u`&&gt.setContext(self),this.setAnimationLoop=function(e){ft=e,U.setAnimationLoop(e),e===null?gt.stop():gt.start()},U.addEventListener(`sessionstart`,mt),U.addEventListener(`sessionend`,ht),this.render=function(e,t){if(t!==void 0&&t.isCamera!==!0){H(`WebGLRenderer.render: camera is not an instance of THREE.Camera.`);return}if(ne===!0)return;F!==null&&F.renderStart(e,t);let n=U.enabled===!0&&U.isPresenting===!0,r=te!==null&&(L===null||n)&&te.begin(P,L);if(e.matrixWorldAutoUpdate===!0&&e.updateMatrixWorld(),t.parent===null&&t.matrixWorldAutoUpdate===!0&&t.updateMatrixWorld(),U.enabled===!0&&U.isPresenting===!0&&(te===null||te.isCompositing()===!1)&&(U.cameraAutoUpdate===!0&&U.updateCamera(t),t=U.getCamera()),e.isScene===!0&&e.onBeforeRender(P,e,t,L),M=Ge.get(e,N.length),M.init(t),M.state.textureUnits=Ie.getTextureUnits(),N.push(M),Te.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),Se.setFromProjectionMatrix(Te,He,t.reversedDepth),we=this.localClippingEnabled,Ce=qe.init(this.clippingPlanes,we),k=We.get(e,ee.length),k.init(),ee.push(k),U.enabled===!0&&U.isPresenting===!0){let e=P.xr.getDepthSensingMesh();e!==null&&_t(e,t,-1/0,P.sortObjects)}_t(e,t,0,P.sortObjects),k.finish(),F!==null&&F.updateLights(M.state.lightsArray),P.sortObjects===!0&&k.sort(_e,ve),ke=U.enabled===!1||U.isPresenting===!1||U.hasDepthSensing()===!1,ke&&Xe.addToRenderList(k,e),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),Ce===!0&&qe.beginShadows();let i=M.state.shadowsArray;if(Ye.render(i,e,t),Ce===!0&&qe.endShadows(),(r&&te.hasRenderPass())===!1){let n=k.opaque,r=k.transmissive;if(M.setupLights(),t.isArrayCamera){let i=t.cameras;if(r.length>0)for(let t=0,a=i.length;t<a;t++){let a=i[t];yt(n,r,e,a)}ke&&Xe.render(e);for(let t=0,n=i.length;t<n;t++){let n=i[t];vt(k,e,n,n.viewport)}}else r.length>0&&yt(n,r,e,t),ke&&Xe.render(e),vt(k,e,t)}L!==null&&oe===0&&(Ie.updateMultisampleRenderTarget(L),Ie.updateRenderTargetMipmap(L)),r&&te.end(P),e.isScene===!0&&e.onAfterRender(P,e,t),nt.resetDefaultState(),se=-1,ce=null,N.pop(),N.length>0?(M=N[N.length-1],Ie.setTextureUnits(M.state.textureUnits),Ce===!0&&qe.setGlobalState(P.clippingPlanes,M.state.camera)):M=null,ee.pop(),k=ee.length>0?ee[ee.length-1]:null,F!==null&&F.renderEnd()};function _t(e,t,n,r){if(e.visible===!1)return;if(e.layers.test(t.layers)){if(e.isGroup)n=e.renderOrder;else if(e.isLOD)e.autoUpdate===!0&&e.update(t);else if(e.isLightProbeGrid)M.pushLightProbeGrid(e);else if(e.isLight)M.pushLight(e),e.castShadow&&M.pushShadow(e);else if(e.isSprite){if(!e.frustumCulled||e.intersectsFrustum(Se)){r&&De.setFromMatrixPosition(e.matrixWorld).applyMatrix4(Te);let i=Be.update(e),a=e.material;a.visible&&k.push(e,i,a,n,De.z,null,t)}}else if((e.isMesh||e.isLine||e.isPoints)&&(!e.frustumCulled||e.intersectsFrustum(Se))){let i=Be.update(e),a=e.material;if(r&&(e.boundingSphere===void 0?(i.boundingSphere===null&&i.computeBoundingSphere(),De.copy(i.boundingSphere.center)):(e.boundingSphere===null&&e.computeBoundingSphere(),De.copy(e.boundingSphere.center)),De.applyMatrix4(e.matrixWorld).applyMatrix4(Te)),Array.isArray(a)){let r=i.groups;for(let o=0,s=r.length;o<s;o++){let s=r[o],c=a[s.materialIndex];c&&c.visible&&k.push(e,i,c,n,De.z,s,t)}}else a.visible&&k.push(e,i,a,n,De.z,null,t)}}let i=e.children;for(let e=0,a=i.length;e<a;e++)_t(i[e],t,n,r)}function vt(e,t,n,r){let{opaque:i,transmissive:a,transparent:o}=e;M.setupLightsView(n),Ce===!0&&qe.setGlobalState(P.clippingPlanes,n),r&&z.viewport(le.copy(r)),i.length>0&&bt(i,t,n),a.length>0&&bt(a,t,n),o.length>0&&bt(o,t,n),z.buffers.depth.setTest(!0),z.buffers.depth.setMask(!0),z.buffers.color.setMask(!0),z.setPolygonOffset(!1)}function yt(e,t,n,r){if((n.isScene===!0?n.overrideMaterial:null)!==null)return;if(M.state.transmissionRenderTarget[r.id]===void 0){let e=Me.has(`EXT_color_buffer_half_float`)||Me.has(`EXT_color_buffer_float`);M.state.transmissionRenderTarget[r.id]=new Kt(1,1,{generateMipmaps:!0,type:e?g:l,minFilter:c,samples:Math.max(4,Ne.samples),stencilBuffer:i,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:Nt.workingColorSpace})}let a=M.state.transmissionRenderTarget[r.id],o=r.viewport||le;a.setSize(o.z*P.transmissionResolutionScale,o.w*P.transmissionResolutionScale);let s=P.getRenderTarget(),u=P.getActiveCubeFace(),d=P.getActiveMipmapLevel();P.setRenderTarget(a),P.getClearColor(fe),pe=P.getClearAlpha(),pe<1&&P.setClearColor(16777215,.5),P.clear(),ke&&Xe.render(n);let f=P.toneMapping;P.toneMapping=0;let p=r.viewport;if(r.viewport!==void 0&&(r.viewport=void 0),M.setupLightsView(r),Ce===!0&&qe.setGlobalState(P.clippingPlanes,r),bt(e,n,r),Ie.updateMultisampleRenderTarget(a),Ie.updateRenderTargetMipmap(a),Me.has(`WEBGL_multisampled_render_to_texture`)===!1){let e=!1;for(let i=0,a=t.length;i<a;i++){let{object:a,geometry:o,material:s,group:c}=t[i];if(s.side===2&&a.layers.test(r.layers)){let t=s.side;s.side=1,s.needsUpdate=!0,xt(a,n,r,o,s,c),s.side=t,s.needsUpdate=!0,e=!0}}e===!0&&(Ie.updateMultisampleRenderTarget(a),Ie.updateRenderTargetMipmap(a))}P.setRenderTarget(s,u,d),P.setClearColor(fe,pe),p!==void 0&&(r.viewport=p),P.toneMapping=f}function bt(e,t,n){let r=t.isScene===!0?t.overrideMaterial:null;for(let i=0,a=e.length;i<a;i++){let a=e[i],{object:o,geometry:s,group:c}=a,l=a.material;l.allowOverride===!0&&r!==null&&(l=r),o.layers.test(n.layers)&&xt(o,t,n,s,l,c)}}function xt(e,t,n,r,i,a){F!==null&&i.isNodeMaterial&&F.setObject(e,i),e.onBeforeRender(P,t,n,r,i,a),e.modelViewMatrix.multiplyMatrices(n.matrixWorldInverse,e.matrixWorld),e.normalMatrix.getNormalMatrix(e.modelViewMatrix),i.onBeforeRender(P,t,n,r,e,a),i.transparent===!0&&i.side===2&&i.forceSinglePass===!1?(i.side=1,i.needsUpdate=!0,P.renderBufferDirect(n,t,r,i,e,a),i.side=0,i.needsUpdate=!0,P.renderBufferDirect(n,t,r,i,e,a),i.side=2):P.renderBufferDirect(n,t,r,i,e,a),e.onAfterRender(P,t,n,r,i,a)}function St(e,t,n){t.isScene!==!0&&(t=Oe);let r=B.get(e),i=M.state.lights,a=M.state.shadowsArray,o=i.state.version,s=Ve.getParameters(e,i.state,a,t,n,M.state.lightProbeGridArray),c=Ve.getProgramCacheKey(s),l=r.programs;r.environment=e.isMeshStandardMaterial||e.isMeshLambertMaterial||e.isMeshPhongMaterial?t.environment:null,r.fog=t.fog;let u=e.isMeshStandardMaterial||e.isMeshLambertMaterial&&!e.envMap||e.isMeshPhongMaterial&&!e.envMap;r.envMap=Le.get(e.envMap||r.environment,u),r.envMapRotation=r.environment!==null&&e.envMap===null?t.environmentRotation:e.envMapRotation,l===void 0&&(e.addEventListener(`dispose`,ct),l=new Map,r.programs=l);let d=l.get(c);if(d!==void 0){if(r.currentProgram===d&&r.lightsStateVersion===o)return wt(e,s),d}else s.uniforms=Ve.getUniforms(e),F!==null&&e.isNodeMaterial&&F.build(e,n,s),e.onBeforeCompile(s,P),d=Ve.acquireProgram(s,c),l.set(c,d),r.uniforms=s.uniforms;let f=r.uniforms;return(!e.isShaderMaterial&&!e.isRawShaderMaterial||e.clipping===!0)&&(f.clippingPlanes=qe.uniform),wt(e,s),r.needsLights=Et(e),r.lightsStateVersion=o,r.needsLights&&(f.ambientLightColor.value=i.state.ambient,f.lightProbe.value=i.state.probe,f.sunLights.value=i.state.sun,f.sunLightShadows.value=i.state.sunShadow,f.directionalLights.value=i.state.directional,f.directionalLightShadows.value=i.state.directionalShadow,f.spotLights.value=i.state.spot,f.spotLightShadows.value=i.state.spotShadow,f.rectAreaLights.value=i.state.rectArea,f.ltc_1.value=i.state.rectAreaLTC1,f.ltc_2.value=i.state.rectAreaLTC2,f.pointLights.value=i.state.point,f.pointLightShadows.value=i.state.pointShadow,f.hemisphereLights.value=i.state.hemi,f.sunShadowMatrix.value=i.state.sunShadowMatrix,f.sunShadowCascade.value=i.state.sunShadowCascade,f.directionalShadowMatrix.value=i.state.directionalShadowMatrix,f.spotLightMatrix.value=i.state.spotLightMatrix,f.spotLightMap.value=i.state.spotLightMap,f.pointShadowMatrix.value=i.state.pointShadowMatrix),r.lightProbeGrid=M.state.lightProbeGridArray.length>0,r.currentProgram=d,r.uniformsList=null,d}function Ct(e){if(e.uniformsList===null){let t=e.currentProgram.getUniforms();e.uniformsList=Bl.seqWithValue(t.seq,e.uniforms)}return e.uniformsList}function wt(e,t){let n=B.get(e);n.outputColorSpace=t.outputColorSpace,n.batching=t.batching,n.batchingColor=t.batchingColor,n.instancing=t.instancing,n.instancingColor=t.instancingColor,n.instancingMorph=t.instancingMorph,n.skinning=t.skinning,n.morphTargets=t.morphTargets,n.morphNormals=t.morphNormals,n.morphColors=t.morphColors,n.morphTargetsCount=t.morphTargetsCount,n.numClippingPlanes=t.numClippingPlanes,n.numIntersection=t.numClipIntersection,n.vertexAlphas=t.vertexAlphas,n.vertexTangents=t.vertexTangents,n.toneMapping=t.toneMapping}function Tt(e,t){if(e.length===0)return null;if(e.length===1)return e[0].texture===null?null:e[0];D.setFromMatrixPosition(t.matrixWorld);for(let t=0,n=e.length;t<n;t++){let n=e[t];if(n.texture!==null&&n.boundingBox.containsPoint(D))return n}return null}function W(e,t,n,r,i){t.isScene!==!0&&(t=Oe),Ie.resetTextureUnits();let a=t.fog,o=r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial?t.environment:null,s=L===null?P.outputColorSpace:L.isXRRenderTarget===!0?L.texture.colorSpace:Nt.workingColorSpace,c=r.isMeshStandardMaterial||r.isMeshLambertMaterial&&!r.envMap||r.isMeshPhongMaterial&&!r.envMap,l=Le.get(r.envMap||o,c),u=r.vertexColors===!0&&!!n.attributes.color&&n.attributes.color.itemSize===4,d=!!n.attributes.tangent&&(!!r.normalMap||r.anisotropy>0),f=!!n.morphAttributes.position,p=!!n.morphAttributes.normal,m=!!n.morphAttributes.color,h=0;r.toneMapped&&(L===null||L.isXRRenderTarget===!0)&&(h=P.toneMapping);let g=n.morphAttributes.position||n.morphAttributes.normal||n.morphAttributes.color,_=g===void 0?0:g.length,v=B.get(r),y=M.state.lights;if(Ce===!0&&(we===!0||e!==ce)){let t=e===ce&&r.id===se;qe.setState(r,e,t)}let b=!1;r.version===v.__version?v.needsLights&&v.lightsStateVersion!==y.state.version?b=!0:v.outputColorSpace===s?i.isBatchedMesh&&v.batching===!1||!i.isBatchedMesh&&v.batching===!0||i.isBatchedMesh&&v.batchingColor===!0&&i._colorsTexture===null||i.isBatchedMesh&&v.batchingColor===!1&&i._colorsTexture!==null||i.isInstancedMesh&&v.instancing===!1||!i.isInstancedMesh&&v.instancing===!0||i.isSkinnedMesh&&v.skinning===!1||!i.isSkinnedMesh&&v.skinning===!0||i.isInstancedMesh&&v.instancingColor===!0&&i.instanceColor===null||i.isInstancedMesh&&v.instancingColor===!1&&i.instanceColor!==null||i.isInstancedMesh&&v.instancingMorph===!0&&i.morphTexture===null||i.isInstancedMesh&&v.instancingMorph===!1&&i.morphTexture!==null?b=!0:v.envMap===l?r.fog===!0&&v.fog!==a||v.numClippingPlanes!==void 0&&(v.numClippingPlanes!==qe.numPlanes||v.numIntersection!==qe.numIntersection)?b=!0:v.vertexAlphas===u&&v.vertexTangents===d&&v.morphTargets===f&&v.morphNormals===p&&v.morphColors===m&&v.toneMapping===h&&v.morphTargetsCount===_?!!v.lightProbeGrid!=M.state.lightProbeGridArray.length>0&&(b=!0):b=!0:b=!0:b=!0:(b=!0,v.__version=r.version);let x=v.currentProgram;b===!0&&(x=St(r,t,i),F&&r.isNodeMaterial&&F.onUpdateProgram(r,x,v));let S=!1,C=!1,w=!1,T=x.getUniforms(),E=v.uniforms;if(z.useProgram(x.program)&&(S=!0,C=!0,w=!0),r.id!==se&&(se=r.id,C=!0),v.needsLights){let e=Tt(M.state.lightProbeGridArray,i);v.lightProbeGrid!==e&&(v.lightProbeGrid=e,C=!0)}if(S||ce!==e){z.buffers.depth.getReversed()&&e.reversedDepth!==!0&&(e._reversedDepth=!0,e.updateProjectionMatrix()),T.setValue(R,`projectionMatrix`,e.projectionMatrix),T.setValue(R,`viewMatrix`,e.matrixWorldInverse);let t=T.map.cameraPosition;t!==void 0&&t.setValue(R,Ee.setFromMatrixPosition(e.matrixWorld)),Ne.logarithmicDepthBuffer&&T.setValue(R,`logDepthBufFC`,2/(Math.log(e.far+1)/Math.LN2)),(r.isMeshPhongMaterial||r.isMeshToonMaterial||r.isMeshLambertMaterial||r.isMeshBasicMaterial||r.isMeshStandardMaterial||r.isShaderMaterial)&&T.setValue(R,`isOrthographic`,e.isOrthographicCamera===!0),ce!==e&&(ce=e,C=!0,w=!0)}if(v.needsLights&&(y.state.sunShadowMap.length>0&&T.setValue(R,`sunShadowMap`,y.state.sunShadowMap,Ie),y.state.directionalShadowMap.length>0&&T.setValue(R,`directionalShadowMap`,y.state.directionalShadowMap,Ie),y.state.spotShadowMap.length>0&&T.setValue(R,`spotShadowMap`,y.state.spotShadowMap,Ie),y.state.pointShadowMap.length>0&&T.setValue(R,`pointShadowMap`,y.state.pointShadowMap,Ie)),i.isSkinnedMesh){T.setOptional(R,i,`bindMatrix`),T.setOptional(R,i,`bindMatrixInverse`);let e=i.skeleton;e&&(e.boneTexture===null&&e.computeBoneTexture(),T.setValue(R,`boneTexture`,e.boneTexture,Ie))}i.isBatchedMesh&&(T.setOptional(R,i,`batchingTexture`),T.setValue(R,`batchingTexture`,i._matricesTexture,Ie),T.setOptional(R,i,`batchingIdTexture`),T.setValue(R,`batchingIdTexture`,i._indirectTexture,Ie),T.setOptional(R,i,`batchingColorTexture`),i._colorsTexture!==null&&T.setValue(R,`batchingColorTexture`,i._colorsTexture,Ie));let D=n.morphAttributes;if((D.position!==void 0||D.normal!==void 0||D.color!==void 0)&&Qe.update(i,n,x),(C||v.receiveShadow!==i.receiveShadow)&&(v.receiveShadow=i.receiveShadow,T.setValue(R,`receiveShadow`,i.receiveShadow)),(r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial)&&r.envMap===null&&t.environment!==null&&(E.envMapIntensity.value=t.environmentIntensity),E.dfgLUT!==void 0&&(E.dfgLUT.value=sd()),C){if(T.setValue(R,`toneMappingExposure`,P.toneMappingExposure),v.needsLights&&G(E,w),a&&r.fog===!0&&Ue.refreshFogUniforms(E,a),Ue.refreshMaterialUniforms(E,r,ge,he,M.state.transmissionRenderTarget[e.id]),v.needsLights&&v.lightProbeGrid){let e=v.lightProbeGrid;E.probesSH.value=e.texture,E.probesMin.value.copy(e.boundingBox.min),E.probesMax.value.copy(e.boundingBox.max),E.probesResolution.value.copy(e.resolution)}Bl.upload(R,Ct(v),E,Ie)}if(r.isShaderMaterial&&r.uniformsNeedUpdate===!0&&(Bl.upload(R,Ct(v),E,Ie),r.uniformsNeedUpdate=!1),r.isSpriteMaterial&&T.setValue(R,`center`,i.center),T.setValue(R,`modelViewMatrix`,i.modelViewMatrix),T.setValue(R,`normalMatrix`,i.normalMatrix),T.setValue(R,`modelMatrix`,i.matrixWorld),r.uniformsGroups!==void 0){let e=r.uniformsGroups;for(let t=0,n=e.length;t<n;t++){let n=e[t];rt.update(n,x),rt.bind(n,x)}}return x}function G(e,t){e.ambientLightColor.needsUpdate=t,e.lightProbe.needsUpdate=t,e.sunLights.needsUpdate=t,e.sunLightShadows.needsUpdate=t,e.directionalLights.needsUpdate=t,e.directionalLightShadows.needsUpdate=t,e.pointLights.needsUpdate=t,e.pointLightShadows.needsUpdate=t,e.spotLights.needsUpdate=t,e.spotLightShadows.needsUpdate=t,e.rectAreaLights.needsUpdate=t,e.hemisphereLights.needsUpdate=t}function Et(e){return e.isMeshLambertMaterial||e.isMeshToonMaterial||e.isMeshPhongMaterial||e.isMeshStandardMaterial||e.isShadowMaterial||e.isShaderMaterial&&e.lights===!0}this.getActiveCubeFace=function(){return ae},this.getActiveMipmapLevel=function(){return oe},this.getRenderTarget=function(){return L},this.setRenderTargetTextures=function(e,t,n){let r=B.get(e);r.__autoAllocateDepthBuffer=e.resolveDepthBuffer===!1,r.__autoAllocateDepthBuffer===!1&&(r.__useRenderToTexture=!1),B.get(e.texture).__webglTexture=t,B.get(e.depthTexture).__webglTexture=r.__autoAllocateDepthBuffer?void 0:n,r.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(e,t){let n=B.get(e);n.__webglFramebuffer=t,n.__useDefaultFramebuffer=t===void 0},this.setRenderTarget=function(e,t=0,n=0){L=e,ae=t,oe=n;let r=null,i=!1,a=!1;if(e){let o=B.get(e);if(o.__useDefaultFramebuffer!==void 0){z.bindFramebuffer(R.FRAMEBUFFER,o.__webglFramebuffer),le.copy(e.viewport),ue.copy(e.scissor),de=e.scissorTest,z.viewport(le),z.scissor(ue),z.setScissorTest(de),se=-1;return}if(o.__webglFramebuffer===void 0)Ie.setupRenderTarget(e);else if(o.__hasExternalTextures)Ie.rebindTextures(e,B.get(e.texture).__webglTexture,B.get(e.depthTexture).__webglTexture);else if(e.depthBuffer){let t=e.depthTexture;if(o.__boundDepthTexture!==t){if(t!==null&&B.has(t)&&(e.width!==t.image.width||e.height!==t.image.height))throw Error(`THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.`);Ie.setupDepthRenderbuffer(e)}}let s=e.texture;(s.isData3DTexture||s.isDataArrayTexture||s.isCompressedArrayTexture)&&(a=!0);let c=B.get(e).__webglFramebuffer;e.isWebGLCubeRenderTarget?(r=Array.isArray(c[t])?c[t][n]:c[t],i=!0):r=e.samples>0&&Ie.useMultisampledRTT(e)===!1?B.get(e).__webglMultisampledFramebuffer:Array.isArray(c)?c[n]:c,le.copy(e.viewport),ue.copy(e.scissor),de=e.scissorTest}else le.copy(ye).multiplyScalar(ge).floor(),ue.copy(be).multiplyScalar(ge).floor(),de=xe;if(n!==0&&(r=re),z.bindFramebuffer(R.FRAMEBUFFER,r)&&z.drawBuffers(e,r),z.viewport(le),z.scissor(ue),z.setScissorTest(de),i){let r=B.get(e.texture);R.framebufferTexture2D(R.FRAMEBUFFER,R.COLOR_ATTACHMENT0,R.TEXTURE_CUBE_MAP_POSITIVE_X+t,r.__webglTexture,n)}else if(a){let r=t;for(let t=0;t<e.textures.length;t++){let i=B.get(e.textures[t]);R.framebufferTextureLayer(R.FRAMEBUFFER,R.COLOR_ATTACHMENT0+t,i.__webglTexture,n,r)}}else if(e!==null&&n!==0){let t=B.get(e.texture);R.framebufferTexture2D(R.FRAMEBUFFER,R.COLOR_ATTACHMENT0,R.TEXTURE_2D,t.__webglTexture,n)}se=-1};function Dt(e){let t=B.get(e);return(t.__readFormat!==e.format||t.__readType!==e.type)&&(t.__readFormat=e.format,t.__readType=e.type,t.__formatReadable=Ne.textureFormatReadable(e.format),t.__typeReadable=Ne.textureTypeReadable(e.type)),t}this.readRenderTargetPixels=function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget)){H(`WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);return}let c=B.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){z.bindFramebuffer(R.FRAMEBUFFER,c);try{let o=e.textures[s],c=o.format,l=o.type;e.textures.length>1&&R.readBuffer(R.COLOR_ATTACHMENT0+s);let u=Dt(o);if(u.__formatReadable===!1){H(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.`);return}if(u.__typeReadable===!1){H(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.`);return}t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i&&R.readPixels(t,n,r,i,tt.convert(c),tt.convert(l),a)}finally{let e=L===null?null:B.get(L).__webglFramebuffer;z.bindFramebuffer(R.FRAMEBUFFER,e)}}},this.readRenderTargetPixelsAsync=async function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget))throw Error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);let c=B.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){if(t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i){z.bindFramebuffer(R.FRAMEBUFFER,c);let o=e.textures[s],l=o.format,u=o.type;e.textures.length>1&&R.readBuffer(R.COLOR_ATTACHMENT0+s);let d=Dt(o);if(d.__formatReadable===!1)throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.`);if(d.__typeReadable===!1)throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.`);let f=R.createBuffer();R.bindBuffer(R.PIXEL_PACK_BUFFER,f),R.bufferData(R.PIXEL_PACK_BUFFER,a.byteLength,R.STREAM_READ),R.readPixels(t,n,r,i,tt.convert(l),tt.convert(u),0),R.bindBuffer(R.PIXEL_PACK_BUFFER,null);let p=L===null?null:B.get(L).__webglFramebuffer;z.bindFramebuffer(R.FRAMEBUFFER,p);let m=R.fenceSync(R.SYNC_GPU_COMMANDS_COMPLETE,0);return R.flush(),await Ze(R,m,4),R.bindBuffer(R.PIXEL_PACK_BUFFER,f),R.getBufferSubData(R.PIXEL_PACK_BUFFER,0,a),R.bindBuffer(R.PIXEL_PACK_BUFFER,null),R.deleteBuffer(f),R.deleteSync(m),a}throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.`)}},this.copyFramebufferToTexture=function(e,t=null,n=0){let r=2**-n,i=Math.floor(e.image.width*r),a=Math.floor(e.image.height*r),o=t===null?0:t.x,s=t===null?0:t.y;Ie.setTexture2D(e,0),R.copyTexSubImage2D(R.TEXTURE_2D,n,0,0,o,s,i,a),z.unbindTexture()},this.copyTextureToTexture=function(e,t,n=null,r=null,i=0,a=0){let o,s,c,l,u,d,f,p,m,h=e.isCompressedTexture?e.mipmaps[a]:e.image;if(n!==null)o=n.max.x-n.min.x,s=n.max.y-n.min.y,c=n.isBox3?n.max.z-n.min.z:1,l=n.min.x,u=n.min.y,d=n.isBox3?n.min.z:0;else{let t=2**-i;o=Math.floor(h.width*t),s=Math.floor(h.height*t),c=e.isDataArrayTexture?h.depth:e.isData3DTexture?Math.floor(h.depth*t):1,l=0,u=0,d=0}r===null?(f=0,p=0,m=0):(f=r.x,p=r.y,m=r.z);let g=tt.convert(t.format),_=tt.convert(t.type),v;t.isData3DTexture?(Ie.setTexture3D(t,0),v=R.TEXTURE_3D):t.isDataArrayTexture||t.isCompressedArrayTexture?(Ie.setTexture2DArray(t,0),v=R.TEXTURE_2D_ARRAY):(Ie.setTexture2D(t,0),v=R.TEXTURE_2D),z.activeTexture(R.TEXTURE0),z.pixelStorei(R.UNPACK_FLIP_Y_WEBGL,t.flipY),z.pixelStorei(R.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),z.pixelStorei(R.UNPACK_ALIGNMENT,t.unpackAlignment);let y=z.getParameter(R.UNPACK_ROW_LENGTH),b=z.getParameter(R.UNPACK_IMAGE_HEIGHT),x=z.getParameter(R.UNPACK_SKIP_PIXELS),S=z.getParameter(R.UNPACK_SKIP_ROWS),C=z.getParameter(R.UNPACK_SKIP_IMAGES);z.pixelStorei(R.UNPACK_ROW_LENGTH,h.width),z.pixelStorei(R.UNPACK_IMAGE_HEIGHT,h.height),z.pixelStorei(R.UNPACK_SKIP_PIXELS,l),z.pixelStorei(R.UNPACK_SKIP_ROWS,u),z.pixelStorei(R.UNPACK_SKIP_IMAGES,d);let w=e.isDataArrayTexture||e.isData3DTexture,T=t.isDataArrayTexture||t.isData3DTexture;if(e.isDepthTexture){let n=B.get(e),r=B.get(t),h=B.get(n.__renderTarget),g=B.get(r.__renderTarget);z.bindFramebuffer(R.READ_FRAMEBUFFER,h.__webglFramebuffer),z.bindFramebuffer(R.DRAW_FRAMEBUFFER,g.__webglFramebuffer);for(let n=0;n<c;n++)w&&(R.framebufferTextureLayer(R.READ_FRAMEBUFFER,R.COLOR_ATTACHMENT0,B.get(e).__webglTexture,i,d+n),R.framebufferTextureLayer(R.DRAW_FRAMEBUFFER,R.COLOR_ATTACHMENT0,B.get(t).__webglTexture,a,m+n)),R.blitFramebuffer(l,u,o,s,f,p,o,s,R.DEPTH_BUFFER_BIT,R.NEAREST);z.bindFramebuffer(R.READ_FRAMEBUFFER,null),z.bindFramebuffer(R.DRAW_FRAMEBUFFER,null)}else if(i!==0||e.isRenderTargetTexture||B.has(e)){let n=B.get(e),r=B.get(t);z.bindFramebuffer(R.READ_FRAMEBUFFER,ie),z.bindFramebuffer(R.DRAW_FRAMEBUFFER,I);for(let e=0;e<c;e++)w?R.framebufferTextureLayer(R.READ_FRAMEBUFFER,R.COLOR_ATTACHMENT0,n.__webglTexture,i,d+e):R.framebufferTexture2D(R.READ_FRAMEBUFFER,R.COLOR_ATTACHMENT0,R.TEXTURE_2D,n.__webglTexture,i),T?R.framebufferTextureLayer(R.DRAW_FRAMEBUFFER,R.COLOR_ATTACHMENT0,r.__webglTexture,a,m+e):R.framebufferTexture2D(R.DRAW_FRAMEBUFFER,R.COLOR_ATTACHMENT0,R.TEXTURE_2D,r.__webglTexture,a),i===0?T?R.copyTexSubImage3D(v,a,f,p,m+e,l,u,o,s):R.copyTexSubImage2D(v,a,f,p,l,u,o,s):R.blitFramebuffer(l,u,o,s,f,p,o,s,R.COLOR_BUFFER_BIT,R.NEAREST);z.bindFramebuffer(R.READ_FRAMEBUFFER,null),z.bindFramebuffer(R.DRAW_FRAMEBUFFER,null)}else T?e.isDataTexture||e.isData3DTexture?R.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h.data):t.isCompressedArrayTexture?R.compressedTexSubImage3D(v,a,f,p,m,o,s,c,g,h.data):R.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h):e.isDataTexture?R.texSubImage2D(R.TEXTURE_2D,a,f,p,o,s,g,_,h.data):e.isCompressedTexture?R.compressedTexSubImage2D(R.TEXTURE_2D,a,f,p,h.width,h.height,g,h.data):R.texSubImage2D(R.TEXTURE_2D,a,f,p,o,s,g,_,h);z.pixelStorei(R.UNPACK_ROW_LENGTH,y),z.pixelStorei(R.UNPACK_IMAGE_HEIGHT,b),z.pixelStorei(R.UNPACK_SKIP_PIXELS,x),z.pixelStorei(R.UNPACK_SKIP_ROWS,S),z.pixelStorei(R.UNPACK_SKIP_IMAGES,C),a===0&&t.generateMipmaps&&R.generateMipmap(v),z.unbindTexture()},this.initRenderTarget=function(e){B.get(e).__webglFramebuffer===void 0&&Ie.setupRenderTarget(e)},this.initTexture=function(e){e.isCubeTexture?Ie.setTextureCube(e,0):e.isData3DTexture?Ie.setTexture3D(e,0):e.isDataArrayTexture||e.isCompressedArrayTexture?Ie.setTexture2DArray(e,0):Ie.setTexture2D(e,0),z.unbindTexture()},this.resetState=function(){ae=0,oe=0,L=null,z.reset(),nt.reset()},typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}get coordinateSystem(){return He}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=Nt._getDrawingBufferColorSpace(e),t.unpackColorSpace=Nt._getUnpackColorSpace()}};function ld(){return{walkSpeed:2.6,runSpeed:6.6,acceleration:38,deceleration:46,airControl:.45,turnSpeed:16,jumpHeight:1.35,gravity:26,fallGravityMul:1.55,jumpCutMul:.45,coyoteTime:.12,jumpBuffer:.14,dodgeDistance:3.4,dodgeDuration:.36,dodgeIFrameStart:.02,dodgeIFrameEnd:.26,dodgeCooldown:.12,perfectDodgeWindow:.2,flurryEnabled:!0,staminaMax:85,staminaRegen:32,sprintCost:10,dodgeCost:12,chargeCost:25,damageMul:1,rangeMul:1.15,attackSpeedMul:1,recoveryMul:1,attackBuffer:.28,cancelWindowMul:1,chargeTime:.75,parryWindow:.2,blockAngle:75,blockStaminaCost:6,enemyDamageMul:1,enemyAggression:1,hitStopEnabled:!0,hitStopMul:1,shakeEnabled:!0,shakeMul:1,particlesEnabled:!0,particleMul:1,trailsEnabled:!0,hitFlashEnabled:!0,damageNumbers:!0,weaponRecoil:!0,knockbackMul:1,screenFx:!0,fov:70,sensitivity:1,invertY:!1,camDistance:4.2,camShoulder:.55,camHeight:1.55,camBob:!0,camBobAmount:1,fpSwingLean:1,camJuice:1,weaponSway:!0,weaponSwayAmount:1,fovKick:!0,lockOnAssist:!0,soundEnabled:!0,volume:.8,timeScale:1,showHitboxes:!1}}function ud(e){return{hitStopEnabled:!1,shakeEnabled:!1,particlesEnabled:!1,trailsEnabled:!1,hitFlashEnabled:!1,damageNumbers:!1,weaponRecoil:!1,screenFx:!1,camBob:!1,fpSwingLean:0,camJuice:0,weaponSway:!1,fovKick:!1,knockbackMul:e.knockbackMul}}var dd=`pixelisland-combat.tuning.v4`,fd=`pixelisland-combat.tuning.v3`,pd=[`staminaMax`,`rangeMul`];function md(e){try{localStorage.setItem(dd,JSON.stringify(e))}catch{}}function hd(){let e=ld();try{let t=localStorage.getItem(dd);if(t)Object.assign(e,JSON.parse(t));else{let t=localStorage.getItem(fd);if(t){let n=JSON.parse(t);for(let e of pd)delete n[e];Object.assign(e,n)}}}catch{}return e}var gd=class{tuning;realDt=0;dt=0;playerDt=0;time=0;realTime=0;hitStopLeft=0;slowLeft=0;slowScale=1;slowDur=1;constructor(e){this.tuning=e}hitStop(e){this.tuning.hitStopEnabled&&(this.hitStopLeft=Math.max(this.hitStopLeft,e*this.tuning.hitStopMul))}slowWorld(e,t){this.slowScale=e,this.slowLeft=t,this.slowDur=t}get inHitStop(){return this.hitStopLeft>0}get worldSlow(){return this.slowLeft>0?this.slowScale:1}get slowProgress(){return this.slowLeft>0?1-this.slowLeft/this.slowDur:1}tick(e){let t=Math.min(e,1/20);this.realDt=t,this.realTime+=t;let n=t*this.tuning.timeScale;if(this.hitStopLeft>0)this.hitStopLeft-=t,this.dt=0,this.playerDt=0;else{let e=1;if(this.slowLeft>0){this.slowLeft-=t;let n=this.slowLeft<.25?1-this.slowLeft/.25:0;e=this.slowScale+(1-this.slowScale)*n}this.playerDt=n,this.dt=n*e}this.time+=this.dt}},_d=class{moveX=0;moveY=0;lookX=0;lookY=0;touchMode=!1;blocked=!1;held=new Set;pressed=new Set;released=new Set;keyMove={f:0,b:0,l:0,r:0};touchMoveX=0;touchMoveY=0;runLock=!1;setButton(e,t){t?this.held.has(e)||(this.held.add(e),this.pressed.add(e)):this.held.has(e)&&(this.held.delete(e),this.released.add(e))}tap(e){this.pressed.add(e),this.released.add(e)}isHeld(e){return!this.blocked&&this.held.has(e)}wasPressed(e){return!this.blocked&&this.pressed.has(e)}wasReleased(e){return this.released.has(e)}consume(e){let t=this.pressed.has(e);return this.pressed.delete(e),!this.blocked&&t}setTouchMove(e,t){this.touchMoveX=e,this.touchMoveY=t}addLook(e,t){this.blocked||(this.lookX+=e,this.lookY+=t)}update(){let e=this.keyMove.r-this.keyMove.l,t=this.keyMove.f-this.keyMove.b,n=Math.hypot(e,t);n>1&&(e/=n,t/=n),Math.abs(this.touchMoveX)+Math.abs(this.touchMoveY)>.001&&(e=this.touchMoveX,t=this.touchMoveY),this.blocked&&(e=t=0),this.moveX=e,this.moveY=t}endFrame(){this.pressed.clear(),this.released.clear(),this.lookX=0,this.lookY=0}releaseAll(){for(let e of[...this.held])this.setButton(e,!1);this.keyMove={f:0,b:0,l:0,r:0}}attachKeyboardMouse(e){let t={Space:`jump`,ShiftLeft:`sprint`,ShiftRight:`sprint`,ControlLeft:`sneak`,ControlRight:`sneak`,KeyC:`dodge`,KeyQ:`lock`,KeyV:`view`,KeyT:`shoulder`,Tab:`inventory`,KeyI:`inventory`,KeyP:`tweak`,KeyB:`juice`,KeyG:`spawn`,KeyR:`reset`,KeyH:`help`,KeyZ:`runToggle`,KeyX:`rigView`,CapsLock:`runToggle`,KeyJ:`attack`,KeyK:`guard`,KeyL:`dodge`,Digit1:`slot1`,Digit2:`slot2`,Digit3:`slot3`,Digit4:`slot4`,Digit5:`slot5`,Digit6:`slot6`},n=(e,n)=>{if(e.target?.tagName===`INPUT`)return;let r=e.code;r===`KeyW`||r===`ArrowUp`?this.keyMove.f=+!!n:r===`KeyS`||r===`ArrowDown`?this.keyMove.b=+!!n:r===`KeyA`||r===`ArrowLeft`?this.keyMove.l=+!!n:(r===`KeyD`||r===`ArrowRight`)&&(this.keyMove.r=+!!n),e.ctrlKey&&r!==`ControlLeft`&&r!==`ControlRight`&&e.preventDefault();let i=t[r];if(i){if(e.repeat){e.preventDefault();return}this.setButton(i,n),n&&i===`runToggle`&&(this.runLock=!this.runLock),e.preventDefault()}};window.addEventListener(`keydown`,e=>n(e,!0)),window.addEventListener(`keyup`,e=>n(e,!1)),window.addEventListener(`blur`,()=>this.releaseAll()),e.addEventListener(`contextmenu`,e=>e.preventDefault()),e.addEventListener(`mousedown`,t=>{if(!this.touchMode){if(document.pointerLockElement!==e){this.blocked||e.requestPointerLock?.();return}t.button===0&&this.setButton(`attack`,!0),t.button===2&&this.setButton(`guard`,!0),t.button===1&&(this.setButton(`lock`,!0),t.preventDefault())}}),window.addEventListener(`mouseup`,e=>{e.button===0&&this.setButton(`attack`,!1),e.button===2&&this.setButton(`guard`,!1),e.button===1&&this.setButton(`lock`,!1)});let r=0;window.addEventListener(`mousemove`,t=>{document.pointerLockElement===e&&(performance.now()-r<120||Math.abs(t.movementX)>350||Math.abs(t.movementY)>350||this.addLook(t.movementX,t.movementY))}),e.addEventListener(`wheel`,t=>{document.pointerLockElement===e&&this.tap(t.deltaY>0?`nextItem`:`prevItem`)},{passive:!0}),document.addEventListener(`pointerlockchange`,()=>{document.pointerLockElement===e&&(r=performance.now()),document.pointerLockElement!==e&&(this.setButton(`attack`,!1),this.setButton(`guard`,!1))})}},vd=class{map=new Map;on(e,t){let n=this.map.get(e);return n||this.map.set(e,n=new Set),n.add(t),()=>n.delete(t)}emit(e,t){this.map.get(e)?.forEach(e=>e(t))}},yd=Math.PI*2,bd=Math.PI/180,xd=(e,t,n)=>e<t?t:e>n?n:e,X=e=>xd(e,0,1),Z=(e,t,n)=>e+(t-e)*n,Q=(e=0,t=1)=>e+Math.random()*(t-e),Sd=e=>e[Math.random()*e.length|0],$=(e,t,n,r)=>Z(e,t,1-Math.exp(-n*r));function Cd(e){return e=(e+Math.PI)%yd,e<0&&(e+=yd),e-Math.PI}var wd=(e,t)=>Cd(t-e);function Td(e,t,n,r){return e+wd(e,t)*(1-Math.exp(-n*r))}function Ed(e,t,n){return e<t?Math.min(e+n,t):Math.max(e-n,t)}var Dd=e=>1-(1-X(e))**3,Od=e=>-(Math.cos(Math.PI*X(e))-1)/2,kd=(e,t=1.70158)=>(e=X(e)-1,e*e*((t+1)*e+t)+1),Ad=e=>1-(1-X(e))**2,jd=class{stiffness;damping;target;value=0;velocity=0;constructor(e=120,t=10,n=0){this.stiffness=e,this.damping=t,this.target=n}impulse(e){this.velocity+=e}update(e){let t=-this.stiffness*(this.value-this.target)-this.damping*this.velocity;return this.velocity+=t*e,this.value+=this.velocity*e,this.value}reset(){this.value=this.velocity=0}},Md=class{stiffness;damping;value=new K;velocity=new K;tmp=new K;constructor(e=150,t=12){this.stiffness=e,this.damping=t}impulse(e,t=1){this.velocity.addScaledVector(e,t)}update(e){return this.tmp.copy(this.value).multiplyScalar(-this.stiffness).addScaledVector(this.velocity,-this.damping),this.velocity.addScaledVector(this.tmp,e),this.value.addScaledVector(this.velocity,e),this.value}reset(){this.value.set(0,0,0),this.velocity.set(0,0,0)}};function Nd(e,t){return Math.sin(e*1+t*12.9898)*.5+Math.sin(e*2.3+t*78.233)*.3+Math.sin(e*4.7+t*37.719)*.2}new K;var Pd=new K,Fd=new K,Id=new K;function Ld(e,t,n,r,i,a){Pd.subVectors(t,e),Fd.subVectors(r,n),Id.subVectors(e,n);let o=Pd.dot(Pd),s=Fd.dot(Fd),c=Fd.dot(Id),l,u;if(o<=1e-9&&s<=1e-9)return i.copy(e),a.copy(n),i.distanceToSquared(a);if(o<=1e-9)l=0,u=X(c/s);else{let e=Pd.dot(Id);if(s<=1e-9)u=0,l=X(-e/o);else{let t=Pd.dot(Fd),n=o*s-t*t;l=n===0?0:X((t*c-e*s)/n),u=(t*l+c)/s,u<0?(u=0,l=X(-e/o)):u>1&&(u=1,l=X((t-e)/o))}}return i.copy(e).addScaledVector(Pd,l),a.copy(n).addScaledVector(Fd,u),i.distanceToSquared(a)}function Rd(e,t=new K){return t.set(Math.sin(e),0,Math.cos(e))}function zd(e,t){return Math.atan2(e,t)}function Bd(e,t,n,r,i,a,o=0,s=`stone`){return{kind:`box`,x:e,z:t,yaw:o,halfX:n,halfZ:r,minY:i,maxY:a,material:s,enabled:!0,blocksCamera:!0}}var Vd=class{colliders=[];raycaster=new Bs;meshCache=[];dirty=!0;add(e){return this.colliders.push(e),e.mesh&&(e.mesh.userData.collider=e),this.dirty=!0,e}remove(e){let t=this.colliders.indexOf(e);t>=0&&this.colliders.splice(t,1),this.dirty=!0}markDirty(){this.dirty=!0}local(e,t,n,r){let i=t-e.x,a=n-e.z,o=Math.cos(-e.yaw),s=Math.sin(-e.yaw);return r.x=i*o+a*s,r.z=-i*s+a*o,r}world(e,t,n,r){let i=Math.cos(e.yaw),a=Math.sin(e.yaw);return r.x=e.x+t*i+n*a,r.z=e.z-t*a+n*i,r}topAt(e,t){if(e.kind===`box`)return e.maxY;let n=xd((t+e.halfZ)/(2*e.halfZ),0,1);return e.minY+n*(e.maxY-e.minY)}groundHeight(e,t,n,r,i=0){let a=-1/0,o=`grass`,s={x:0,z:0};for(let c of this.colliders){if(!c.enabled||(this.local(c,e,t,s),Math.abs(s.x)>c.halfX+i||Math.abs(s.z)>c.halfZ+i))continue;let l=this.topAt(c,xd(s.z,-c.halfZ,c.halfZ));l<=n+r+1e-4&&l>a&&(a=l,o=c.material)}return{y:a,material:o}}resolveCylinder(e,t,n,r,i){let a=!1,o={x:0,z:0},s={x:0,z:0};for(let c=0;c<3;c++){let c=!1;for(let l of this.colliders){if(!l.enabled||e.y+n<=l.minY||e.y>=l.maxY-.001)continue;this.local(l,e.x,e.z,o);let u=xd(o.x,-l.halfX,l.halfX),d=xd(o.z,-l.halfZ,l.halfZ),f=this.topAt(l,d);if(e.y+r>=f)continue;let p=o.x-u,m=o.z-d,h=p*p+m*m;if(h>=t*t)continue;let g,_,v;if(h>1e-8){let e=Math.sqrt(h);g=p/e,_=m/e,v=t-e}else{let e=l.halfX-Math.abs(o.x),n=l.halfZ-Math.abs(o.z);e<n?(g=Math.sign(o.x)||1,_=0,v=e+t):(g=0,_=Math.sign(o.z)||1,v=n+t)}this.world(l,g,_,s);let y=s.x-l.x,b=s.z-l.z;e.x+=y*v,e.z+=b*v,i&&i.set(y,0,b),a=c=!0}if(!c)break}return a}probeWall(e,t,n,r,i,a){let o=null,s={x:0,z:0},c={x:0,z:0};for(let l of this.colliders){if(!l.enabled||l.kind!==`box`||l.owner||!l.mesh||n<l.minY+.02||n>=l.maxY)continue;this.local(l,e,t,s);let u=Math.cos(-l.yaw),d=Math.sin(-l.yaw),f=r*u+i*d,p=-r*d+i*u,m=-1/0,h=1/0,g=0;if(Math.abs(f)<1e-6){if(Math.abs(s.x)>l.halfX)continue}else{let e=(-l.halfX-s.x)/f,t=(l.halfX-s.x)/f;e>t&&([e,t]=[t,e]),e>m&&(m=e,g=0),h=Math.min(h,t)}if(Math.abs(p)<1e-6){if(Math.abs(s.z)>l.halfZ)continue}else{let e=(-l.halfZ-s.z)/p,t=(l.halfZ-s.z)/p;e>t&&([e,t]=[t,e]),e>m&&(m=e,g=1),h=Math.min(h,t)}if(m>h||h<0||m<-.05||m>a||o&&m>=o.dist)continue;let _=g===0?-Math.sign(f):0,v=g===1?-Math.sign(p):0;this.world(l,_,v,c),o={dist:Math.max(0,m),nx:c.x-l.x,nz:c.z-l.z,x:e+r*m,z:t+i*m,top:l.maxY,collider:l}}return o}pointInside(e,t=!0){let n={x:0,z:0};for(let r of this.colliders)if(!(!r.enabled||t&&r.owner)&&!(e.y<r.minY)&&(this.local(r,e.x,e.z,n),!(Math.abs(n.x)>r.halfX||Math.abs(n.z)>r.halfZ)&&e.y<this.topAt(r,n.z)-.02))return r;return null}meshes(){return this.dirty&&=(this.meshCache=this.colliders.filter(e=>e.enabled&&e.mesh).map(e=>e.mesh),!1),this.meshCache}raycast(e,t,n,r){this.raycaster.set(e,t),this.raycaster.near=0,this.raycaster.far=n;let i=this.raycaster.intersectObjects(this.meshes(),!0);for(let e of i){let n=e.object,i;for(;n&&!i;)i=n.userData.collider,n=n.parent;if(!i||!i.enabled||r&&!r(i))continue;let a=e.face?e.face.normal.clone().transformDirection(e.object.matrixWorld):t.clone().negate();return{point:e.point.clone(),normal:a,distance:e.distance,object:e.object,collider:i,material:i.material}}return null}},Hd=new K,Ud=new K,Wd=new K,Gd=class{targets=[];add(e){this.targets.includes(e)||this.targets.push(e)}remove(e){let t=this.targets.indexOf(e);t>=0&&this.targets.splice(t,1)}querySegment(e,t,n,r,i,a){let o=[];Wd.subVectors(t,e);let s=Math.max(1e-9,Wd.lengthSq());for(let c of this.targets){if(!c.alive||c.team===r||i?.has(c.id)||a&&!a(c))continue;let l=null;for(let r of c.hurtboxes){if(r.enabled===!1)continue;let i=Ld(e,t,r.a,r.b,Hd,Ud),a=n+r.radius;if(i>a*a)continue;let o=Wd.dot(new K().subVectors(Hd,e))/s,u=new K().subVectors(Hd,Ud);u.lengthSq()<1e-8&&u.copy(Wd).negate(),u.normalize();let d=Ud.clone().addScaledVector(u,r.radius),f=o+(r.tag===`shield`?-10:0);(!l||f<l.score)&&(l={target:c,hurtbox:r,point:d,normal:u,t:o,score:f})}l&&o.push(l)}return o.sort((e,t)=>e.t-t.t),o}findLockTarget(e,t,n,r,i){let a=null,o=1/0,s=Math.cos(r*Math.PI/180),c=new K;for(let r of this.targets){if(!r.alive||!r.lockable||r.team===i)continue;r.center(c).sub(e),c.y=0;let l=c.length();if(l>n||l<.01)continue;let u=c.divideScalar(l).dot(t);if(u<s)continue;let d=l*(1+3*(1-u));d<o&&(o=d,a=r)}return a}findSideTarget(e,t,n,r,i){let a=t.center(new K).sub(e),o=Math.atan2(a.x,a.z),s=null,c=1/0,l=new K;for(let a of this.targets){if(a===t||!a.alive||!a.lockable||a.team===i||(a.center(l).sub(e),l.y=0,l.length()>r))continue;let u=Math.atan2(l.x,l.z)-o;if(u=Math.atan2(Math.sin(u),Math.cos(u)),!(n===-1?u>.02:u<-.02))continue;let d=Math.abs(u)+l.length()*.02;d<c&&(c=d,s=a)}return s}},Kd=class{tuning;ctx=null;master;sfx;reverbSend;noiseBuf;listenerPos=new K;listenerRight=new K(1,0,0);lastPlay=new Map;constructor(e){this.tuning=e}unlock(){if(this.ctx){this.ctx.state===`suspended`&&this.ctx.resume();return}let e=window.AudioContext||window.webkitAudioContext;if(!e)return;let t=new e;this.ctx=t;let n=t.createDynamicsCompressor();n.threshold.value=-14,n.ratio.value=4,n.attack.value=.003,n.release.value=.15,this.master=t.createGain(),this.master.gain.value=this.tuning.volume,this.master.connect(n).connect(t.destination),this.sfx=t.createGain(),this.sfx.connect(this.master);let r=t.sampleRate*2;this.noiseBuf=t.createBuffer(1,r,t.sampleRate);let i=this.noiseBuf.getChannelData(0);for(let e=0;e<r;e++)i[e]=Math.random()*2-1;let a=t.createConvolver(),o=Math.floor(t.sampleRate*1.1),s=t.createBuffer(2,o,t.sampleRate);for(let e=0;e<2;e++){let t=s.getChannelData(e);for(let e=0;e<o;e++)t[e]=(Math.random()*2-1)*(1-e/o)**3.2}a.buffer=s,this.reverbSend=t.createGain(),this.reverbSend.gain.value=.22,this.reverbSend.connect(a).connect(this.master)}setListener(e,t){this.listenerPos.copy(e),this.listenerRight.copy(t),this.ctx&&(this.master.gain.value=this.tuning.soundEnabled?this.tuning.volume:0)}out(e,t){let n=this.ctx;if(!n||!this.tuning.soundEnabled)return null;let r=n.createGain(),i=t*(e.vol??1),a=0;if(e.pos){let t=e.pos.x-this.listenerPos.x,n=e.pos.y-this.listenerPos.y,r=e.pos.z-this.listenerPos.z,o=Math.hypot(t,n,r);i*=1/(1+Math.max(0,o-2)*.09),o>.01&&(a=(t*this.listenerRight.x+r*this.listenerRight.z)/o)}if(r.gain.value=i,n.createStereoPanner){let e=n.createStereoPanner();e.pan.value=Math.max(-.85,Math.min(.85,a*.8)),r.connect(e),e.connect(this.sfx),e.connect(this.reverbSend)}else r.connect(this.sfx),r.connect(this.reverbSend);return{node:r,t:n.currentTime}}noise(e,t,n,r,i,a,o,s,c=.002){let l=this.ctx,u=l.createBufferSource();u.buffer=this.noiseBuf,u.playbackRate.value=Q(.9,1.1);let d=l.createBiquadFilter();d.type=r,d.Q.value=o,d.frequency.setValueAtTime(i,t),d.frequency.exponentialRampToValueAtTime(Math.max(20,a),t+n);let f=l.createGain();f.gain.setValueAtTime(1e-4,t),f.gain.exponentialRampToValueAtTime(s,t+c),f.gain.exponentialRampToValueAtTime(1e-4,t+n),u.connect(d).connect(f).connect(e),u.start(t,Math.random()*1.5),u.stop(t+n+.05)}tone(e,t,n,r,i,a,o,s=.003){let c=this.ctx,l=c.createOscillator();l.type=r,l.frequency.setValueAtTime(i,t),l.frequency.exponentialRampToValueAtTime(Math.max(20,a),t+n);let u=c.createGain();u.gain.setValueAtTime(1e-4,t),u.gain.exponentialRampToValueAtTime(o,t+s),u.gain.exponentialRampToValueAtTime(1e-4,t+n),l.connect(u).connect(e),l.start(t),l.stop(t+n+.05)}bell(e,t,n,r,i,a){r.forEach((r,o)=>{this.tone(e,t,i*(1-o*.12),`sine`,n*r,n*r*.995,a/(1+o*.6),.001)})}play(e,t={}){let n=performance.now();if(n-(this.lastPlay.get(e)??0)<18)return;this.lastPlay.set(e,n);let r=t.intensity??.5,i=(t.pitch??1)*Q(.94,1.06),a=this.out(t,1);if(!a)return;let o=a.node,s=a.t;switch(e){case`step`:{let e=t.variant??`grass`;e===`stone`?(this.noise(o,s,.07,`bandpass`,2400*i,1500,1.2,.18*(.6+r)),this.tone(o,s,.05,`triangle`,160*i,90,.06)):e===`wood`?(this.noise(o,s,.08,`bandpass`,900*i,500,2,.2*(.6+r)),this.tone(o,s,.08,`sine`,140*i,90,.12)):(this.noise(o,s,.11,`lowpass`,1400*i,300,.7,.2*(.6+r)),this.noise(o,s+.02,.06,`highpass`,4e3,3e3,.5,.03));break}case`jump`:this.noise(o,s,.14,`bandpass`,600*i,1800,1,.12),this.tone(o,s,.12,`sine`,180*i,260,.05);break;case`land`:this.noise(o,s,.12+r*.15,`lowpass`,900*i,120,.8,.25+r*.4),this.tone(o,s,.14+r*.1,`sine`,110*i,45,.2+r*.3);break;case`whoosh`:{let e=.16+r*.22;this.noise(o,s,e,`bandpass`,(500+r*200)*i,(1800-r*700)*i,2.2-r,.16+r*.22,e*.45),r>.6&&this.noise(o,s,e*1.2,`lowpass`,400,120,1,.1+(r-.6)*.4,e*.5);break}case`dodge`:this.noise(o,s,.2,`bandpass`,1200*i,500,1.1,.16,.05),this.noise(o,s+.12,.12,`lowpass`,700,200,.7,.1);break;case`hitFlesh`:this.tone(o,s,.12+r*.18,`sine`,(150+r*30)*i,45,.45+r*.4),this.noise(o,s,.08+r*.1,`bandpass`,1300*i,400,.9,.35+r*.3),this.noise(o,s,.04,`highpass`,5e3,3e3,.7,.12),r>.7&&this.tone(o,s,.35,`triangle`,70*i,35,.35);break;case`hitWood`:{let e=Q(380,520)*i;this.noise(o,s,.14+r*.1,`bandpass`,e*2,e,6,.55+r*.3),this.tone(o,s,.12+r*.1,`triangle`,e*.5,e*.35,.28+r*.2),this.noise(o,s,.03,`highpass`,3500,2500,.6,.18),r>.6&&this.tone(o,s,.3,`sine`,90*i,50,.3);break}case`hitStone`:this.noise(o,s,.06,`highpass`,3800*i,2200,.8,.45),this.bell(o,s,Q(900,1300)*i,[1,2.3,3.7],.12,.1),this.noise(o,s,.25+r*.25,`lowpass`,1800,150,.6,.3+r*.25),this.tone(o,s,.16,`sine`,120*i,55,.25+r*.2);break;case`hitMetal`:case`wallClank`:{let e=Q(620,820)*i;this.noise(o,s,.05,`highpass`,6e3,3500,.7,.4),this.bell(o,s,e,[1,2.76,5.4,8.93],.55+r*.4,.28+r*.12),this.tone(o,s,.12,`square`,e*.5,e*.3,.05);break}case`hitDummy`:this.noise(o,s,.18,`bandpass`,700*i,300,1.4,.45+r*.3),this.noise(o,s,.12,`highpass`,3e3,1800,.6,.16),this.tone(o,s,.14,`sine`,130*i,70,.25+r*.2);break;case`block`:this.tone(o,s,.16,`sine`,160*i,70,.55),this.noise(o,s,.12,`bandpass`,900*i,400,1.3,.5),this.bell(o,s,540*i,[1,2.4,4.1],.3,.12);break;case`parry`:this.noise(o,s,.04,`highpass`,7e3,5e3,.7,.5),this.bell(o,s,1320*i,[1,2.01,3.03,4.2],1.2,.4),this.bell(o,s+.03,1980*i,[1,1.5],.9,.16),this.tone(o,s,.5,`sine`,3200,800,.08,.001),this.noise(o,s,.35,`bandpass`,3e3,9e3,1.2,.08,.2);break;case`guardBreak`:this.bell(o,s,420*i,[1,2.7,4.3],.5,.3),this.noise(o,s,.3,`lowpass`,2e3,200,.8,.5),this.tone(o,s,.3,`sawtooth`,200,60,.15);break;case`playerHurt`:{this.tone(o,s,.22,`sine`,120,40,.6),this.noise(o,s,.14,`bandpass`,900,300,1,.5);let e=this.ctx.createOscillator();e.type=`sawtooth`,e.frequency.setValueAtTime(190*i,s),e.frequency.exponentialRampToValueAtTime(120*i,s+.22);let t=this.ctx.createBiquadFilter();t.type=`bandpass`,t.frequency.value=700,t.Q.value=5;let n=this.ctx.createGain();n.gain.setValueAtTime(1e-4,s),n.gain.exponentialRampToValueAtTime(.18,s+.02),n.gain.exponentialRampToValueAtTime(1e-4,s+.24),e.connect(t).connect(n).connect(o),e.start(s),e.stop(s+.3);break}case`bowRelease`:this.tone(o,s,.28,`triangle`,(260+r*180)*i,110,.4),this.tone(o,s,.09,`square`,90*i,60,.15),this.noise(o,s,.2+r*.1,`bandpass`,2500,900,1.5,.16+r*.12,.01);break;case`arrowHit`:{let e=t.variant??`wood`;this.tone(o,s,.1,`triangle`,240*i,110,.35),this.noise(o,s,.08,`bandpass`,e===`stone`?3e3:1200,500,2,.35),e===`metal`&&this.bell(o,s,900*i,[1,2.7],.3,.16),this.tone(o,s+.02,.25,`sine`,420*i,380,.05);break}case`hitConfirm`:this.tone(o,s,.14,`sine`,1400*i,1400,.22,.001),this.tone(o,s+.05,.2,`sine`,2100*i,2100,.16,.001);break;case`noAmmo`:this.tone(o,s,.05,`square`,180,140,.08),this.tone(o,s+.08,.05,`square`,140,110,.08);break;case`pickup`:{let e=660*i;[1,1.26,1.5].forEach((t,n)=>this.tone(o,s+n*.055,.2,`sine`,e*t,e*t,.16,.002)),this.noise(o,s,.1,`highpass`,6e3,8e3,.6,.05);break}case`treeCreak`:{let e=this.ctx,t=e.createOscillator();t.type=`sawtooth`,t.frequency.setValueAtTime(60*i,s),t.frequency.linearRampToValueAtTime(95*i,s+.8);let n=e.createOscillator();n.frequency.value=22;let r=e.createGain();r.gain.value=18,n.connect(r).connect(t.frequency);let a=e.createBiquadFilter();a.type=`bandpass`,a.frequency.value=500,a.Q.value=4;let c=e.createGain();c.gain.setValueAtTime(1e-4,s),c.gain.exponentialRampToValueAtTime(.25,s+.2),c.gain.exponentialRampToValueAtTime(1e-4,s+.9),t.connect(a).connect(c).connect(o),t.start(s),n.start(s),t.stop(s+1),n.stop(s+1);break}case`treeFall`:this.tone(o,s,.7,`sine`,70,30,.7),this.noise(o,s,.9,`lowpass`,1200,80,.7,.6),this.noise(o,s+.05,.5,`bandpass`,2500,800,.8,.18);break;case`rockCrack`:this.noise(o,s,.08,`highpass`,2500*i,1500,.8,.4),this.tone(o,s,.08,`square`,300*i,120,.06);break;case`rockBreak`:this.noise(o,s,.7,`lowpass`,2600,100,.6,.7),this.tone(o,s,.5,`sine`,90,35,.55);for(let e=0;e<6;e++)this.noise(o,s+Q(.05,.5),.05,`bandpass`,Q(1500,3500),1e3,3,.18);break;case`equip`:{let e=t.variant??`blade`;e===`blade`?(this.noise(o,s,.25,`bandpass`,4e3*i,7e3,5,.18,.08),this.bell(o,s+.05,2400*i,[1,1.5],.25,.04)):e===`bow`?(this.tone(o,s,.12,`triangle`,330*i,300,.12),this.noise(o,s,.1,`bandpass`,1200,900,1,.1)):e===`shield`?(this.tone(o,s,.12,`sine`,180*i,120,.25),this.bell(o,s,500*i,[1,2.6],.2,.06)):(this.tone(o,s,.1,`sine`,160*i,100,.2),this.noise(o,s,.1,`bandpass`,900,600,1,.12));break}case`unequip`:this.noise(o,s,.15,`bandpass`,1500*i,700,1,.1,.03);break;case`chargeStart`:this.tone(o,s,.6,`sine`,300*i,600,.05,.3);break;case`chargeReady`:this.bell(o,s,1760*i,[1,2,3],.5,.12),this.noise(o,s,.2,`highpass`,6e3,9e3,.6,.06);break;case`enemyWindup`:this.tone(o,s,.35,`sawtooth`,110*i,170*i,.09,.05),this.noise(o,s,.3,`bandpass`,500,900,2,.1,.1);break;case`enemyHurt`:this.tone(o,s,.18,`sawtooth`,260*i,150*i,.08);break;case`enemyDeath`:this.tone(o,s,.5,`sawtooth`,220*i,60,.12),this.noise(o,s+.25,.5,`lowpass`,3e3,300,.6,.3,.05),this.bell(o,s+.3,880,[1,1.5,2],.5,.05);break;case`enemySpawn`:this.noise(o,s,.6,`bandpass`,200,1400,2,.2,.3),this.tone(o,s,.6,`sine`,80,200,.2,.3);break;case`stagger`:this.tone(o,s,.5,`sine`,900,300,.1),this.tone(o,s+.1,.4,`sine`,700,250,.08);break;case`flurry`:this.noise(o,s,.6,`bandpass`,3e3,400,1.5,.25,.02),this.bell(o,s,660,[1,1.5,2,3],1.2,.12);break;case`uiClick`:this.tone(o,s,.04,`triangle`,900*i,700,.08);break;case`exhausted`:this.tone(o,s,.4,`sine`,300,150,.12);break;case`resetArena`:this.bell(o,s,523,[1,1.26,1.5,2],.8,.1)}}loop(e){let t=this.ctx;if(!t||!this.tuning.soundEnabled)return{set(){},stop(){}};let n=this.out({},1),r=t.createGain();r.gain.value=0,r.connect(n.node);let i=t.createOscillator(),a=t.createBiquadFilter(),o=t.createOscillator(),s=t.createGain(),c=t.createBufferSource();c.buffer=this.noiseBuf,c.loop=!0;let l=t.createBiquadFilter(),u=t.createGain();e===`bowDraw`?(i.type=`sawtooth`,i.frequency.value=70,a.type=`bandpass`,a.Q.value=6,a.frequency.value=400,o.frequency.value=17,s.gain.value=12,l.type=`bandpass`,l.frequency.value=1800,l.Q.value=3,u.gain.value=.05):(i.type=`sine`,i.frequency.value=220,a.type=`lowpass`,a.frequency.value=2e3,a.Q.value=1,o.frequency.value=9,s.gain.value=6,l.type=`highpass`,l.frequency.value=5e3,l.Q.value=.5,u.gain.value=.015),o.connect(s).connect(i.frequency),i.connect(a).connect(r),c.connect(l).connect(u).connect(r);let d=t.currentTime;i.start(d),o.start(d),c.start(d);let f=!1;return{set:n=>{if(f)return;let s=t.currentTime;e===`bowDraw`?(i.frequency.setTargetAtTime(70+n*110,s,.05),a.frequency.setTargetAtTime(350+n*900,s,.05),o.frequency.setTargetAtTime(14+n*20,s,.05),r.gain.setTargetAtTime(.05+n*.22,s,.04),l.frequency.setTargetAtTime(1500+n*2500,s,.05)):(i.frequency.setTargetAtTime(220+n*440,s,.05),r.gain.setTargetAtTime(.03+n*.07,s,.05))},stop:()=>{if(f)return;f=!0;let e=t.currentTime;r.gain.cancelScheduledValues(e),r.gain.setTargetAtTime(0,e,.02),i.stop(e+.15),o.stop(e+.15),c.stop(e+.15)}}}},qd=class{count;mesh;items=[];cursor=0;m=new Yt;q=new G;s=new K;tmp=new K;fwd=new K(0,0,1);fadeColor;col=new q;qs=new G;constructor(e,t,n,r){this.count=n,this.fadeColor=r,this.mesh=new Di(e,t,n),this.mesh.frustumCulled=!1,this.mesh.instanceMatrix.setUsage(Ve);let i=new q(1,1,1);for(let e=0;e<n;e++)this.items.push({alive:!1,pos:new K,vel:new K,rot:new on,spinAxis:new K(1,0,0),spin:0,size:0,life:0,maxLife:1,gravity:0,drag:0,stretch:0,endScale:0,bounce:0,floorY:-999,shape:new K(1,1,1),color:new q}),this.mesh.setColorAt(e,i),this.m.makeScale(0,0,0),this.mesh.setMatrixAt(e,this.m);this.mesh.count=n}spawn(e){let t=this.items[this.cursor];this.cursor=(this.cursor+1)%this.count,t.alive=!0,t.pos.copy(e.pos),t.vel.copy(e.vel),t.rot.set(Math.random()*6,Math.random()*6,Math.random()*6),t.spinAxis.set(Math.random()-.5,Math.random()-.5,Math.random()-.5).normalize(),t.spin=e.spin??8,t.size=e.size,t.life=t.maxLife=e.life,t.gravity=e.gravity??0,t.drag=e.drag??0,t.stretch=e.stretch??0,t.endScale=e.endScale??0,t.bounce=e.bounce??.35,t.floorY=e.floorY??-999,e.shape?t.shape.set(e.shape[0],e.shape[1],e.shape[2]):t.shape.set(1,1,1),t.color.set(e.color)}update(e,t){let n=this.qs;for(let t=0;t<this.count;t++){let r=this.items[t];if(!r.alive)continue;if(r.life-=e,r.life<=0){r.alive=!1,this.m.makeScale(0,0,0),this.mesh.setMatrixAt(t,this.m);continue}r.vel.y-=r.gravity*e,r.drag>0&&r.vel.multiplyScalar(Math.exp(-r.drag*e)),r.pos.addScaledVector(r.vel,e),r.pos.y<r.floorY&&(r.pos.y=r.floorY,r.vel.y<0&&(r.vel.y=-r.vel.y*r.bounce),r.vel.x*=.6,r.vel.z*=.6,r.spin*=.6);let i=1-r.life/r.maxLife,a=r.size*(1+(r.endScale-1)*i);if(r.stretch>0){let e=r.vel.length();this.tmp.copy(r.vel).normalize(),e>1e-4&&this.q.setFromUnitVectors(this.fwd,this.tmp),this.s.set(a,a,a+e*r.stretch*.02)}else n.setFromAxisAngle(r.spinAxis,r.spin*(r.maxLife-r.life)),this.q.setFromEuler(r.rot).multiply(n),this.s.set(a*r.shape.x,a*r.shape.y,a*r.shape.z);if(this.m.compose(r.pos,this.q,this.s),this.mesh.setMatrixAt(t,this.m),this.fadeColor){let e=Math.min(1,r.life/r.maxLife*1.6);this.col.setRGB(r.color.r*e,r.color.g*e,r.color.b*e),this.mesh.setColorAt(t,this.col)}else this.mesh.setColorAt(t,r.color)}this.mesh.instanceMatrix.needsUpdate=!0,this.mesh.instanceColor&&(this.mesh.instanceColor.needsUpdate=!0)}clear(){for(let e=0;e<this.count;e++)this.items[e].alive=!1,this.m.makeScale(0,0,0),this.mesh.setMatrixAt(e,this.m);this.mesh.instanceMatrix.needsUpdate=!0}},Jd=class{group=new wn;pools;constructor(){let e=new Zi(1,1,1),t=new Ro({color:16777215}),n=new Zi(.35,.35,1),r=new ii({color:16777215,blending:2,transparent:!0,depthWrite:!1,toneMapped:!1}),i=new xo(.5,0),a=new Ro({color:16777215,transparent:!0,opacity:.55,depthWrite:!1});this.pools={solid:new qd(e,t,700,!1),glow:new qd(n,r,600,!0),puff:new qd(i,a,260,!1)};for(let e of Object.values(this.pools))this.group.add(e.mesh);this.group.name=`particles`}spawn(e,t){this.pools[e].spawn(t)}update(e,t){for(let n of Object.values(this.pools))n.update(e,t)}clear(){for(let e of Object.values(this.pools))e.clear()}};function Yd(){let e=document.createElement(`canvas`);e.width=e.height=128;let t=e.getContext(`2d`),n=t.createRadialGradient(64,64,0,64,64,64);n.addColorStop(0,`rgba(255,255,255,1)`),n.addColorStop(.18,`rgba(255,255,255,0.9)`),n.addColorStop(.4,`rgba(255,255,255,0.18)`),n.addColorStop(1,`rgba(255,255,255,0)`),t.fillStyle=n,t.fillRect(0,0,128,128),t.globalCompositeOperation=`lighter`,t.fillStyle=`rgba(255,255,255,0.85)`;for(let e=0;e<4;e++)t.save(),t.translate(64,64),t.rotate(e*Math.PI/4+.2),t.beginPath(),t.moveTo(-60,0),t.lineTo(0,3.5),t.lineTo(60,0),t.lineTo(0,-3.5),t.closePath(),t.fill(),t.restore();let r=new qi(e);return r.colorSpace=Fe,r}function Xd(){let e=document.createElement(`canvas`);e.width=e.height=128;let t=e.getContext(`2d`),n=t.createRadialGradient(64,64,40,64,64,62);n.addColorStop(0,`rgba(255,255,255,0)`),n.addColorStop(.55,`rgba(255,255,255,1)`),n.addColorStop(1,`rgba(255,255,255,0)`),t.fillStyle=n,t.fillRect(0,0,128,128);let r=new qi(e);return r.colorSpace=Fe,r}var Zd=class{tuning;group=new wn;particles=new Jd;flashes=[];starTex=Yd();ringTex=Xd();tmp=new K;tmp2=new K;constructor(e){this.tuning=e,this.group.add(this.particles.group);for(let e=0;e<24;e++){let e=new Zr(new Lr({map:this.starTex,blending:2,depthWrite:!1,depthTest:!0,transparent:!0,toneMapped:!1}));e.visible=!1,e.renderOrder=10,this.group.add(e),this.flashes.push({sprite:e,life:0,max:1,size0:1,size1:1,alive:!1})}}get on(){return this.tuning.particlesEnabled}n(e,t){return Math.max(1,Math.round(e*t*this.tuning.particleMul))}flash(e,t,n,r=.09,i=!1,a=1.6){if(!this.on)return;let o=this.flashes.find(e=>!e.alive)??this.flashes[0];o.alive=!0,o.life=o.max=r,o.size0=n,o.size1=n*a;let s=o.sprite.material;s.map=i?this.ringTex:this.starTex,s.color.set(t),s.rotation=Math.random()*Math.PI,o.sprite.position.copy(e),o.sprite.scale.setScalar(n),o.sprite.visible=!0}sprayDir(e,t,n,r,i,a){return a.copy(e).multiplyScalar(n).addScaledVector(t,r),a.x+=Q(-i,i),a.y+=Q(-i,i)+i*.4,a.z+=Q(-i,i),a.normalize()}impact(e,t,n,r,i,a=0){if(!this.on)return;let o=this.particles,s=this.tmp,c=i;switch(e){case`flesh`:this.flash(t,16773584,.4+c*.35,.06+c*.03);for(let e=0;e<this.n(10,c);e++)this.sprayDir(r,n,.6,.8,.6,s),o.spawn(`glow`,{pos:t,vel:s.multiplyScalar(Q(4,9)*(.6+c)),color:Sd([16765578,16777215,16752474]),size:Q(.03,.06),life:Q(.12,.25),drag:6,stretch:3,gravity:6});for(let e=0;e<this.n(7,c);e++)this.sprayDir(r,n,.7,.6,.7,s),o.spawn(`solid`,{pos:t,vel:s.multiplyScalar(Q(2,5)*(.6+c)),color:Sd([5905978,8006734,3937320]),size:Q(.04,.09),life:Q(.35,.6),gravity:14,drag:1,floorY:a,endScale:0});break;case`dummy`:this.flash(t,16774344,.35+c*.3,.06);for(let e=0;e<this.n(14,c);e++)this.sprayDir(r,n,.7,.7,.8,s),o.spawn(`solid`,{pos:t,vel:s.multiplyScalar(Q(2,6)*(.6+c)),color:Sd([15257466,13939804,15917728]),size:Q(.12,.2),shape:[.12,.12,1],life:Q(.6,1.1),gravity:7,drag:2.5,floorY:a,spin:10,endScale:.6});break;case`wood`:case`leaf`:this.flash(t,16773312,.35+c*.3,.06);for(let e=0;e<this.n(12,c);e++)this.sprayDir(r,n,.9,.5,.55,s),o.spawn(`solid`,{pos:t,vel:s.multiplyScalar(Q(3,7)*(.6+c*.8)),color:Sd([13144399,14726522,10250810,15782560]),size:Q(.1,.2),shape:[.35,.18,1],life:Q(.8,1.4),gravity:16,drag:.8,floorY:a,spin:14,endScale:.8,bounce:.3});for(let e=0;e<this.n(6,c);e++)this.sprayDir(r,n,1,.2,.9,s),o.spawn(`puff`,{pos:t,vel:s.multiplyScalar(Q(.6,1.8)),color:14269580,size:Q(.1,.2),life:Q(.4,.7),drag:3,gravity:-.3,endScale:2.4});break;case`stone`:this.flash(t,16777215,.4+c*.3,.06);for(let e=0;e<this.n(10,c);e++)this.sprayDir(r,n,1,.4,.6,s),o.spawn(`solid`,{pos:t,vel:s.multiplyScalar(Q(3,7)*(.6+c*.7)),color:Sd([9277337,7303547,10922162,6053478]),size:Q(.07,.16),life:Q(.8,1.3),gravity:18,drag:.5,floorY:a,spin:10,endScale:.7,bounce:.4});for(let e=0;e<this.n(8,c);e++)this.sprayDir(r,n,1,.1,1,s),o.spawn(`puff`,{pos:this.tmp2.copy(t).addScaledVector(s,.1),vel:s.multiplyScalar(Q(.5,2)),color:12433325,size:Q(.15,.3),life:Q(.6,1.1),drag:2.5,gravity:-.2,endScale:3});for(let e=0;e<this.n(5,c);e++)this.sprayDir(r,n,1,.3,.8,s),o.spawn(`glow`,{pos:t,vel:s.multiplyScalar(Q(5,10)),color:16771504,size:Q(.02,.035),life:Q(.1,.2),stretch:4,gravity:10});break;case`metal`:{this.flash(t,16773808,.45+c*.3,.07),this.flash(t,16762976,.35,.16,!0,3);let e=this.tmp2.copy(n).addScaledVector(r,-2*n.dot(r)).normalize();for(let n=0;n<this.n(22,c);n++)this.sprayDir(r,e,.7,.9,.7,s),o.spawn(`glow`,{pos:t,vel:s.multiplyScalar(Q(5,13)*(.7+c*.5)),color:Sd([16769162,16757575,16777215]),size:Q(.02,.04),life:Q(.15,.4),stretch:5,gravity:14,drag:1.5,floorY:a,bounce:.5});break}}}parry(e,t){if(!this.on)return;this.flash(e,16777215,1.4,.12),this.flash(e,8386303,.6,.3,!0,5),this.flash(e,16769146,.4,.22,!0,3.5);let n=this.tmp;for(let r=0;r<this.n(36,1);r++){let i=r/36*Math.PI*2;n.set(Math.cos(i),Math.sin(i)*.8+.2,Math.sin(i*1.3)).normalize().addScaledVector(t,-.6).normalize(),this.particles.spawn(`glow`,{pos:e,vel:n.multiplyScalar(Q(6,12)),color:Sd([10484991,16777215,16769146]),size:Q(.025,.045),life:Q(.2,.45),stretch:4,drag:3,gravity:3})}}block(e,t,n){if(!this.on)return;this.flash(e,16771248,.55,.07);let r=this.tmp;for(let i=0;i<this.n(12,1);i++)this.sprayDir(n,t,1,-.3,.7,r),this.particles.spawn(`glow`,{pos:e,vel:r.multiplyScalar(Q(3,7)),color:Sd([16766336,16777215]),size:Q(.02,.035),life:Q(.1,.25),stretch:4,gravity:10});for(let i=0;i<this.n(4,1);i++)this.sprayDir(n,t,1,0,1,r),this.particles.spawn(`puff`,{pos:e,vel:r.multiplyScalar(Q(.5,1.5)),color:14209734,size:.15,life:.5,drag:3,endScale:2.2})}dust(e,t,n=.4,r=13616816){if(!this.on)return;let i=this.tmp;for(let a=0;a<this.n(8,t);a++){let a=Math.random()*Math.PI*2;i.set(Math.cos(a),.15,Math.sin(a)),this.particles.spawn(`puff`,{pos:this.tmp2.copy(e).addScaledVector(i,n*Q(.3,1)).setY(e.y+.05),vel:i.multiplyScalar(Q(.8,2.2)*(.5+t)),color:r,size:Q(.12,.25)*(.6+t*.5),life:Q(.4,.8),drag:3.5,gravity:-.4,endScale:2.6})}}sparkle(e,t,n=12,r=2.5){if(!this.on)return;let i=this.tmp;for(let a=0;a<this.n(n,1);a++)i.set(Q(-1,1),Q(.2,1.4),Q(-1,1)).normalize(),this.particles.spawn(`glow`,{pos:e,vel:i.multiplyScalar(Q(.5,1)*r),color:t,size:Q(.03,.06),life:Q(.3,.6),drag:3,gravity:-1,endScale:0})}poof(e,t=2760499,n=1){if(!this.on)return;let r=this.tmp;for(let i=0;i<this.n(18,n);i++)r.set(Q(-1,1),Q(0,1.2),Q(-1,1)).normalize(),this.particles.spawn(`puff`,{pos:this.tmp2.copy(e).addScaledVector(r,Q(0,.5)),vel:r.multiplyScalar(Q(1,3)),color:Sd([t,4930140,6969978]),size:Q(.25,.45),life:Q(.6,1.1),drag:3,gravity:-1.2,endScale:2.2});this.sparkle(e,12750079,10,3)}update(e,t){this.particles.update(e,t);for(let t of this.flashes){if(!t.alive)continue;if(t.life-=e,t.life<=0){t.alive=!1,t.sprite.visible=!1;continue}let n=1-t.life/t.max;t.sprite.scale.setScalar(t.size0+(t.size1-t.size0)*n),t.sprite.material.opacity=1-n*n}}clear(){this.particles.clear();for(let e of this.flashes)e.alive=!1,e.sprite.visible=!1}},Qd=class{tuning;trauma=0;t=0;rot=new on;offset=new K;kick=new K;kickVel=new K;constructor(e){this.tuning=e}add(e){this.tuning.shakeEnabled&&(this.trauma=Math.min(1,this.trauma+e*this.tuning.shakeMul))}push(e,t,n){this.tuning.shakeEnabled&&(this.kickVel.x+=e*n*6*this.tuning.shakeMul,this.kickVel.y+=t*n*6*this.tuning.shakeMul)}update(e){this.t+=e,this.trauma=Math.max(0,this.trauma-e*1.6);let t=this.trauma*this.trauma;this.rot.set(Nd(this.t*28,1)*.045*t,Nd(this.t*28,2)*.045*t,Nd(this.t*28,3)*.06*t),this.kickVel.addScaledVector(this.kick,-260*e),this.kickVel.multiplyScalar(Math.exp(-18*e)),this.kick.addScaledVector(this.kickVel,e),this.offset.set(Nd(this.t*28,4)*.05*t+this.kick.x,Nd(this.t*28,5)*.05*t+this.kick.y,0),this.tuning.shakeEnabled||(this.rot.set(0,0,0),this.offset.set(0,0,0))}},$d=class{lines;pts=[];cols=[];constructor(){let e=new Dr;this.lines=new Wi(e,new Mi({vertexColors:!0,depthTest:!1,transparent:!0})),this.lines.renderOrder=50,this.lines.frustumCulled=!1}seg(e,t,n){this.pts.push(e.x,e.y,e.z,t.x,t.y,t.z),this.cols.push(n.r,n.g,n.b,n.r,n.g,n.b)}circle(e,t,n){let r=new K,i=new K;for(let a=0;a<12;a++){let o=a/12*Math.PI*2,s=(a+1)/12*Math.PI*2;r.set(e.x+Math.cos(o)*t,e.y,e.z+Math.sin(o)*t),i.set(e.x+Math.cos(s)*t,e.y,e.z+Math.sin(s)*t),this.seg(r,i,n)}}update(e,t,n){if(this.lines.visible=e,!e)return;this.pts=[],this.cols=[];let r=new q(4259712),i=new q(8421504),a=new q(16724032),o=new q(6340863);for(let e of t.targets)for(let t of e.hurtboxes){let n=t.enabled===!1||!e.alive?i:t.tag===`shield`||t.material===`metal`?o:r;this.circle(t.a,t.radius,n),this.circle(t.b,t.radius,n);for(let[e,r]of[[1,0],[-1,0],[0,1],[0,-1]])this.seg(new K(t.a.x+e*t.radius,t.a.y,t.a.z+r*t.radius),new K(t.b.x+e*t.radius,t.b.y,t.b.z+r*t.radius),n)}for(let e of n)this.seg(e.base,e.tip,a);let s=this.lines.geometry;s.setAttribute(`position`,new hr(this.pts,3)),s.setAttribute(`color`,new hr(this.cols,3))}},ef=e=>`<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">${e}</svg>`,tf={sword:{id:`sword`,name:`Espada`,kind:`weapon`,stack:1,weapon:`sword`,desc:`Rápida e precisa. Combo de 3 golpes; segure para o Ataque Giratório.`,icon:ef(`<path d="M24 3l5 0 0 5-13 13-5-5z" fill="#dfe8f2" stroke="#6a7a8c"/><path d="M8 17l7 7-2 2-2-2-4 4-2-2 4-4-2-2z" fill="#8a5a2b" stroke="#3b2612"/><rect x="7" y="18" width="9" height="3" transform="rotate(45 11.5 19.5)" fill="#d9b24a"/>`)},axe:{id:`axe`,name:`Machado`,kind:`tool`,stack:1,weapon:`axe`,desc:`Lento e pesado. Ferramenta certa para derrubar árvores.`,icon:ef(`<rect x="14" y="4" width="3.5" height="25" rx="1.5" transform="rotate(35 16 16)" fill="#9c6a3a" stroke="#4a2f16"/><path d="M17 4c6 0 10 4 10 9l-8 1-3-6z" fill="#c9d1dc" stroke="#5b6573"/>`)},pickaxe:{id:`pickaxe`,name:`Picareta`,kind:`tool`,stack:1,weapon:`pickaxe`,desc:`Golpes verticais. Ferramenta certa para quebrar pedras.`,icon:ef(`<rect x="14.5" y="6" width="3" height="24" rx="1.5" transform="rotate(20 16 16)" fill="#9c6a3a" stroke="#4a2f16"/><path d="M4 11c7-7 17-7 24 0l-2 2c-6-5-14-5-20 0z" fill="#b9c2cf" stroke="#4c5563"/>`)},bow:{id:`bow`,name:`Arco`,kind:`bow`,stack:1,weapon:`bow`,desc:`Segure para puxar a corda; solte para disparar. Defender/esquivar cancela.`,icon:ef(`<path d="M9 3c12 4 12 22 0 26" fill="none" stroke="#8a5a2b" stroke-width="3"/><line x1="9" y1="3" x2="9" y2="29" stroke="#eee" stroke-width="1"/><line x1="6" y1="16" x2="29" y2="16" stroke="#c9a46a" stroke-width="1.6"/><path d="M29 16l-4-2 0 4z" fill="#ccd"/>`)},shield:{id:`shield`,name:`Escudo`,kind:`shield`,stack:1,desc:`Mão secundária. Segure defesa para bloquear; defenda no tempo certo para APARAR.`,icon:ef(`<path d="M16 3l11 4v8c0 7-5 12-11 14C10 27 5 22 5 15V7z" fill="#3b6ea8" stroke="#c9d1dc" stroke-width="2"/><path d="M16 8l6 2v5c0 4-3 7-6 8z" fill="#e0b640"/>`)},arrow:{id:`arrow`,name:`Flecha`,kind:`ammo`,stack:99,desc:`Munição do arco. Consumida a cada disparo; flechas cravadas podem ser recolhidas.`,icon:ef(`<line x1="5" y1="27" x2="25" y2="7" stroke="#b58a52" stroke-width="2.2"/><path d="M27 5l-7 2 5 5z" fill="#cfd6df"/><path d="M5 27l1-5 3 3zM8 24l1-5 3 3z" fill="#e8e8e8"/>`)},wood:{id:`wood`,name:`Madeira`,kind:`resource`,stack:99,desc:`Recurso obtido ao derrubar árvores.`,icon:ef(`<rect x="4" y="10" width="24" height="12" rx="6" fill="#9c6a3a" stroke="#4a2f16"/><ellipse cx="25" cy="16" rx="4" ry="6" fill="#e0b57a" stroke="#7a522a"/><ellipse cx="25" cy="16" rx="1.6" ry="2.6" fill="none" stroke="#9c6a3a"/>`)},stone:{id:`stone`,name:`Pedra`,kind:`resource`,stack:99,desc:`Recurso obtido ao minerar rochas.`,icon:ef(`<path d="M6 22l3-10 8-5 8 4 3 10-7 5H11z" fill="#8d8f99" stroke="#44464e"/><path d="M11 13l5 3 7-3" fill="none" stroke="#b9bcc6"/>`)}},nf=class{events=new vd;slots;hotbar;selected=0;constructor(e=20,t=6){this.slots=Array(e).fill(null),this.hotbar=Array(t).fill(null)}count(e){let t=0;for(let n of this.slots)n?.id===e&&(t+=n.count);return t}has(e){return this.count(e)>0}add(e,t=1){let n=tf[e],r=t;for(let t of this.slots){if(r<=0)break;if(t&&t.id===e&&t.count<n.stack){let e=Math.min(n.stack-t.count,r);t.count+=e,r-=e}}for(let t=0;t<this.slots.length&&r>0;t++)if(!this.slots[t]){let i=Math.min(n.stack,r);this.slots[t]={id:e,count:i},r-=i}let i=t-r;return i>0&&(this.events.emit(`added`,{id:e,count:i}),this.events.emit(`changed`,void 0)),i}remove(e,t=1){if(this.count(e)<t)return!1;let n=t;for(let t=this.slots.length-1;t>=0&&n>0;t--){let r=this.slots[t];if(r&&r.id===e){let e=Math.min(r.count,n);r.count-=e,n-=e,r.count<=0&&(this.slots[t]=null)}}return this.events.emit(`changed`,void 0),!0}sort(){let e=[`weapon`,`tool`,`bow`,`shield`,`ammo`,`resource`],t=new Map;for(let e of this.slots)e&&t.set(e.id,(t.get(e.id)??0)+e.count);let n=[...t.keys()].sort((t,n)=>e.indexOf(tf[t].kind)-e.indexOf(tf[n].kind));this.slots.fill(null);let r=0;for(let e of n){let n=t.get(e);for(;n>0&&r<this.slots.length;){let t=Math.min(tf[e].stack,n);this.slots[r++]={id:e,count:t},n-=t}}this.events.emit(`changed`,void 0)}swapSlots(e,t){[this.slots[e],this.slots[t]]=[this.slots[t],this.slots[e]],this.events.emit(`changed`,void 0)}setHotbar(e,t){t&&(this.hotbar=this.hotbar.map(e=>e===t?null:e)),this.hotbar[e]=t,this.events.emit(`changed`,void 0)}select(e){this.selected=(e+this.hotbar.length)%this.hotbar.length,this.events.emit(`hotbar`,this.selected)}};function rf(e){let t=new wn,n=(e,t=.8)=>new Lo({color:e,roughness:t,flatShading:!0});if(e===`wood`){let e=new J(new ea(.13,.14,.6,7),n(9067051));e.rotation.z=Math.PI/2;let r=new J(new ea(.12,.12,.02,7),n(14726522));r.rotation.z=Math.PI/2,r.position.x=.3;let i=r.clone();i.position.x=-.3,t.add(e,r,i)}else if(e===`stone`){let e=new xo(.17,0),r=e.attributes.position;for(let e=0;e<r.count;e++)r.setXYZ(e,r.getX(e)*Q(.8,1.2),r.getY(e)*Q(.7,1),r.getZ(e)*Q(.8,1.2));e.computeVertexNormals(),t.add(new J(e,n(9277337)))}else if(e===`arrow`){for(let e=0;e<3;e++){let r=new J(new ea(.012,.012,.6,4),n(13214826));r.rotation.z=Math.PI/2,r.position.set(0,e*.03,(e-1)*.04),t.add(r)}let e=new J(new Zi(.06,.1,.16),n(8006700));t.add(e)}else t.add(new J(new So(.15),n(16765514,.4)));t.traverse(e=>e.castShadow=!0);let r=new J(new wo(.28,.36,20),new ii({color:16773808,transparent:!0,opacity:.45,side:2,depthWrite:!1}));return r.rotation.x=-Math.PI/2,r.name=`glow`,t.add(r),t}var af=class{ctx;inventory;items=[];magnetRadius=2.6;collectRadius=.9;tmp=new K;constructor(e,t){this.ctx=e,this.inventory=t}spawn(e,t,n,r=1){let i=rf(e);i.position.copy(t),this.ctx.scene.add(i),this.items.push({id:e,count:r,mesh:i,pos:t.clone(),vel:n?.clone()??new K(Q(-2,2),Q(3,5),Q(-2,2)),age:0,settled:!1,spin:Q(-6,6),collecting:0})}update(e,t){if(e<=0)return;let n=this.ctx.physics;for(let r=this.items.length-1;r>=0;r--){let i=this.items[r];if(i.age+=e,i.collecting>0){i.collecting+=e;let n=Math.min(1,i.collecting/.18);t&&i.mesh.position.lerp(this.tmp.copy(t).setY(t.y+1),n),i.mesh.scale.setScalar(1-n*.9),n>=1&&(i.mesh.removeFromParent(),this.items.splice(r,1));continue}if(i.settled)i.mesh.rotation.x=0,i.mesh.rotation.y+=e*1.6,i.mesh.position.set(i.pos.x,i.pos.y+.1+Math.sin(i.age*3)*.06,i.pos.z);else{i.vel.y-=18*e,i.pos.addScaledVector(i.vel,e);let t=n.groundHeight(i.pos.x,i.pos.z,i.pos.y+.3,.3,0),r=(Number.isFinite(t.y)?t.y:0)+.2;i.pos.y<r&&(i.pos.y=r,Math.abs(i.vel.y)>1.5?(i.vel.y=-i.vel.y*.35,i.vel.x*=.6,i.vel.z*=.6):(i.settled=!0,i.vel.set(0,0,0))),i.mesh.position.copy(i.pos),i.mesh.rotation.y+=i.spin*e,i.mesh.rotation.x+=i.spin*.5*e}let a=i.mesh.getObjectByName(`glow`);if(a&&(a.rotation.set(-Math.PI/2-i.mesh.rotation.x,0,0),a.position.y=-.12-Math.sin(i.age*3)*.06,a.scale.setScalar(1+Math.sin(i.age*4)*.1)),!t||i.age<.45)continue;let o=this.tmp.set(t.x-i.pos.x,t.y+.6-i.pos.y,t.z-i.pos.z),s=o.length();if(s<this.magnetRadius){let t=(1-s/this.magnetRadius)*10+2;i.pos.addScaledVector(o.normalize(),t*e),i.settled=!0}if(s<this.collectRadius){let e=this.inventory.add(i.id,i.count);e>0&&(i.collecting=1e-4,this.ctx.events.emit(`pickup`,{item:i.id,count:e,pos:i.mesh.position.clone()}))}}}clear(){for(let e of this.items)e.mesh.removeFromParent();this.items=[]}},of={steel:()=>new Lo({color:14081768,metalness:.75,roughness:.28,flatShading:!0}),darkSteel:()=>new Lo({color:9345190,metalness:.7,roughness:.4,flatShading:!0}),wood:()=>new Lo({color:9067051,roughness:.85,flatShading:!0}),lightWood:()=>new Lo({color:12159573,roughness:.8,flatShading:!0}),leather:()=>new Lo({color:5913124,roughness:.9,flatShading:!0}),gold:()=>new Lo({color:14266954,metalness:.8,roughness:.3,flatShading:!0}),blue:()=>new Lo({color:3894952,roughness:.6,flatShading:!0}),string:()=>new ii({color:15921126})};function sf(e,t,n=0,r=0,i=0){let a=new J(e,t);return a.position.set(n,r,i),a.castShadow=!0,a}function cf(e,t){return e.emissive=new q(t),e.emissiveIntensity=0,t=>{e.emissiveIntensity=t*1.6}}function lf(){let e=new wn,t=of.steel(),n=sf(new ea(.022,.024,.2,6),of.leather(),0,-.02,0),r=sf(new So(.035),of.gold(),0,-.13,0),i=sf(new Zi(.05,.035,.24),of.gold(),0,.095,0),a=sf(new Zi(.018,.78,.068),t,0,.5,0),o=new ta(.048,.14,4);o.rotateY(Math.PI/4),o.scale(.38,1,1);let s=sf(o,t,0,.96,0),c=sf(new Zi(.02,.5,.014),of.blue(),0,.4,0);return e.add(n,r,i,a,s,c),{root:e,setGlow:cf(t,7327999),kind:`sword`}}function uf(){let e=new wn,t=of.darkSteel();e.add(sf(new ea(.026,.03,.95,6),of.wood(),0,.36,0));let n=new Na;n.moveTo(0,-.07),n.lineTo(.12,-.13),n.quadraticCurveTo(.2,0,.12,.13),n.lineTo(0,.07),n.lineTo(-.05,.04),n.lineTo(-.05,-.04);let r=new vo(n,{depth:.035,bevelEnabled:!1});r.translate(0,0,-.0175),r.rotateY(-Math.PI/2);let i=sf(r,t,0,.74,0);i.scale.set(1,1,1);let a=sf(new Zi(.012,.25,.02),of.steel(),0,.74,.19),o=sf(new ea(.032,.032,.12,6),of.leather(),0,0,0);return e.add(i,a,o),{root:e,setGlow:cf(t,16756816),kind:`axe`}}function df(){let e=new wn,t=of.darkSteel();e.add(sf(new ea(.025,.029,.95,6),of.lightWood(),0,.36,0));let n=e=>{let n=new Oa(new K(0,.8,0),new K(0,.84,.16*e),new K(0,.72,.32*e)),r=new Eo(n,6,.028,5,!1),i=r.attributes.position,a=new K;for(let e=0;e<i.count;e++){a.fromBufferAttribute(i,e);let t=Math.min(1,Math.abs(a.z)/.32),r=n.getPoint(t);a.sub(r).multiplyScalar(1-t*.85).add(r),i.setXYZ(e,a.x,a.y,a.z)}return r.computeVertexNormals(),sf(r,t)};return e.add(n(1),n(-1)),e.add(sf(new Zi(.07,.09,.08),t,0,.8,0)),e.add(sf(new ea(.031,.031,.12,6),of.leather(),0,0,0)),{root:e,setGlow:cf(t,10467583),kind:`pickaxe`}}function ff(){let e=new wn,t=new Lo({color:7031342,roughness:.9,flatShading:!0});e.add(sf(new ea(.1,.035,.95,7),t,0,.42,0));let n=new Lo({color:14209216,roughness:.6,flatShading:!0});for(let t=0;t<6;t++){let r=sf(new ta(.025,.09,4),n),i=t/6*Math.PI*2;r.position.set(Math.cos(i)*.09,.62+t%2*.16,Math.sin(i)*.09),r.lookAt(Math.cos(i)*2,r.position.y,Math.sin(i)*2),r.rotateX(Math.PI/2),e.add(r)}return{root:e,setGlow:cf(t,16728128),kind:`club`}}function pf(){let e=new Na;e.moveTo(0,.34),e.lineTo(.26,.26),e.lineTo(.25,-.05),e.quadraticCurveTo(.2,-.28,0,-.38),e.quadraticCurveTo(-.2,-.28,-.25,-.05),e.lineTo(-.26,.26),e.closePath();let t=new wn,n=sf(new vo(e,{depth:.012,bevelEnabled:!1}),of.lightWood(),0,0,.006);n.scale.set(.94,.94,1);let r=sf(new Zi(.4,.035,.012),of.leather(),.03,-.12,0),i=sf(new Zi(.4,.035,.012),of.leather(),.03,.1,0);return t.add(n,r,i),t}function mf(){let e=new wn,t=new Lo({color:3894952,roughness:.5,metalness:.3,flatShading:!0}),n=new Lo({color:13226460,roughness:.3,metalness:.85,flatShading:!0}),r=new Na;r.moveTo(0,.34),r.lineTo(.26,.26),r.lineTo(.25,-.05),r.quadraticCurveTo(.2,-.28,0,-.38),r.quadraticCurveTo(-.2,-.28,-.25,-.05),r.lineTo(-.26,.26),r.closePath();let i=sf(new vo(r,{depth:.04,bevelEnabled:!0,bevelSize:.025,bevelThickness:.02,bevelSegments:1}),t,0,0,.04),a=sf(new vo(r,{depth:.02,bevelEnabled:!1}),n,0,0,.03);a.scale.set(1.1,1.1,1);let o=sf(new So(.08),of.gold(),0,.02,.12);o.scale.set(1,1.3,.4);let s=sf(new To(.05,6,4),n,0,.2,.11),c=sf(new Zi(.04,.16,.04),of.leather(),0,0,0);return e.add(a,i,o,s,c),{root:e,setGlow:cf(t,8386303),kind:`shield`}}var hf=.45;function gf(){let e=new wn,t=new Lo({color:8014372,roughness:.7,flatShading:!0}),n=e=>new Oa(new K(0,.05*e,0),new K(0,.36*e,.08),new K(0,.6*e,-.1)),r=n(1),i=n(-1);e.add(sf(new Eo(r,8,.02,5),t)),e.add(sf(new Eo(i,8,.02,5),t)),e.add(sf(new ea(.03,.03,.16,6),of.leather()));let a=new K(0,.6,-.1),o=new K(0,-.6,-.1),s=of.string(),c=new J(new ea(.004,.004,1,3),s),l=new J(new ea(.004,.004,1,3),s);e.add(c,l);let u=_f();e.add(u);let d=new K,f=(e,t,n)=>{e.position.copy(t).add(n).multiplyScalar(.5);let r=new K().subVectors(n,t);e.scale.set(1,r.length(),1),e.quaternion.setFromUnitVectors(new K(0,1,0),r.normalize())},p=(t,n)=>{d.set(0,0,-.1-t*hf),f(c,a,d),f(l,d,o),e.children[0].scale.set(1,1-t*.08,1+t*.25),e.children[1].scale.set(1,1-t*.08,1+t*.25),u.visible=n,u.position.set(.02,0,d.z+.8)};return p(0,!1),{root:e,setGlow:cf(t,16769184),setDraw:p,kind:`bow`}}function _f(){let e=new wn,t=new J(new ea(.009,.009,.78,4),new Lo({color:13214826,roughness:.8}));t.rotation.x=Math.PI/2,t.position.z=-.4;let n=new J(new ta(.022,.07,4),new Lo({color:13620959,metalness:.8,roughness:.3}));n.rotation.x=Math.PI/2,n.position.z=-.02;let r=new Lo({color:15921906,side:2,roughness:1});for(let t=0;t<3;t++){let n=new J(new Co(.035,.12),r);n.position.z=-.72,n.rotation.set(Math.PI/2,0,t/3*Math.PI*2),n.translateX(.02),e.add(n)}return e.add(t,n),e.traverse(e=>e.castShadow=!0),e}function vf(e){switch(e){case`sword`:return lf();case`axe`:return uf();case`pickaxe`:return df();case`bow`:return gf();case`club`:return ff();case`shield`:return mf();default:return lf()}}var yf=new K(0,0,1),bf=class{ctx;arrows=[];gravity=9;stuckLifetime=12;tmpA=new K;tmpB=new K;dir=new K;q=new G;constructor(e){this.ctx=e}fire(e,t,n,r,i,a){let o=_f();o.position.copy(e),this.ctx.scene.add(o);let s={mesh:o,pos:e.clone(),vel:t.clone(),team:n,attacker:r,damage:i,power:a,flying:!0,life:6,stuckIn:null,collectable:!1,wobble:0,wobbleAxis:new K(1,0,0),baseQuat:new G};this.orient(s),this.arrows.push(s)}orient(e){this.dir.copy(e.vel).normalize(),e.mesh.quaternion.setFromUnitVectors(yf,this.dir)}stick(e,t,n,r){e.flying=!1,e.life=this.stuckLifetime,e.stuckIn=r,e.collectable=!r,this.dir.copy(e.vel).normalize(),e.mesh.position.copy(t).addScaledVector(this.dir,.1),e.mesh.quaternion.setFromUnitVectors(yf,this.dir),n.updateWorldMatrix(!0,!1),n.attach(e.mesh),e.baseQuat.copy(e.mesh.quaternion),e.wobble=.35,e.wobbleAxis.set(Math.random()-.5,Math.random()-.5,0).normalize()}update(e){if(e<=0)return;let t=this.ctx;for(let n=this.arrows.length-1;n>=0;n--){let r=this.arrows[n];if(r.life-=e,r.flying){let i=this.tmpA.copy(r.pos),a=this.tmpB.copy(r.pos).addScaledVector(r.vel,e);a.y-=.5*this.gravity*e*e,r.vel.y-=this.gravity*e;let o=i.distanceTo(a),s=t.combat.querySegment(i,a,.04,r.team);this.dir.subVectors(a,i).normalize();let c=t.physics.raycast(i,this.dir,o+.05),l=s[0],u=l?l.t*o:1/0;if(l&&u<=(c?.distance??1/0)){let e={attacker:r.attacker,team:r.team,tool:`arrow`,damage:r.damage,strength:.25+r.power*.35,knockback:1+r.power*2.5,point:l.point.clone(),dir:this.dir.clone(),normal:l.normal.clone(),hurtbox:l.hurtbox,projectile:!0,charged:r.power>.95,origin:i.clone()},a=l.target.receiveHit(e);if(t.events.emit(`hit`,{hit:e,result:a,target:l.target,source:r.team===`player`?`player`:`enemy`}),!a.ignored){if(a.deflected)r.vel.reflect(l.normal).multiplyScalar(.25),r.vel.y=2,r.flying=!1,r.life=1.2,t.scene.attach(r.mesh),r.pos.copy(l.point),r.collectable=!1,r.falling=!0;else if(a.killed||!l.target.alive){this.remove(n);continue}else this.stick(r,l.point,l.target.stickRoot,l.target)}continue}if(c){this.stick(r,c.point,c.collider?.owner?.stickRoot??t.scene,c.collider?.owner??null);let e=c.material===`wood`?`wood`:c.material===`metal`?`metal`:`stone`;t.sound.play(`arrowHit`,{pos:c.point,variant:e});let n=c.normal;t.fx.impact(e===`wood`?`wood`:e===`metal`?`metal`:`stone`,c.point,this.dir,n,.3,c.point.y-2);continue}r.pos.copy(a),r.mesh.position.copy(a),this.orient(r),(r.life<=0||r.pos.y<-10)&&this.remove(n)}else{if(r.falling&&(r.vel.y-=this.gravity*2*e,r.pos.addScaledVector(r.vel,e),r.mesh.position.copy(r.pos),r.mesh.rotateX(e*14)),r.wobble>0){r.wobble=Math.max(0,r.wobble-e*.9);let t=Math.sin(r.wobble*70)*r.wobble*.25;this.q.setFromAxisAngle(r.wobbleAxis,t),r.mesh.quaternion.copy(r.baseQuat).multiply(this.q)}r.stuckIn&&!r.stuckIn.alive&&(r.life=Math.min(r.life,.4)),r.life<.5&&r.mesh.scale.setScalar(Math.max(.001,r.life/.5)),r.life<=0&&this.remove(n)}}}collectNear(e,t){let n=0,r=new K;for(let i=this.arrows.length-1;i>=0;i--){let a=this.arrows[i];if(!a.collectable||a.flying||a.life<1)continue;a.mesh.getWorldPosition(r);let o=r.x-e.x,s=r.z-e.z;o*o+s*s<t*t&&Math.abs(r.y-e.y-.5)<1.6&&(this.remove(i),n++)}return n}remove(e){this.arrows[e].mesh.removeFromParent(),this.arrows.splice(e,1)}clear(){for(let e=this.arrows.length-1;e>=0;e--)this.remove(e)}},xf={flesh:`hitFlesh`,wood:`hitWood`,stone:`hitStone`,metal:`hitMetal`,dummy:`hitDummy`,leaf:`hitWood`},Sf=class{ctx;camera;screen;camRight=new K;camUp=new K;constructor(e,t,n){this.ctx=e,this.camera=t,this.screen=n;let r=e.events,i=e.sound,a=e.fx,o=e.tuning;r.on(`hit`,({hit:t,result:n,source:r})=>{if(n.ignored)return;let s=xd(t.strength+(t.charged?.25:0),.1,1.3),c=n.effectiveness,l=t.hurtbox.material??n.material,u=t.point,d=r===`enemy`;if(n.parried){i.play(`parry`,{pos:u}),a.parry(u,t.dir),e.clock.hitStop(.16),e.clock.slowWorld(.3,.55),e.shake.add(.35),this.kick(t.dir,.12),this.screen?.flash(`#bff8ff`,o.screenFx?.45:0,.18),this.screen?.popup(`APARO!`,u,`#8ff4ff`,1.35);return}if(n.blocked&&d){i.play(`block`,{pos:u,intensity:s}),a.block(u,t.dir,t.normal),e.clock.hitStop(.06),e.shake.add(.18+s*.12),this.kick(t.dir,.06),n.damage>0?this.screen?.popup(`-${n.damage}`,u,`#ffb0b0`,.8):this.screen?.popup(`Bloqueio`,u,`#e8eef6`,.8);return}if(n.deflected){i.play(l===`stone`?`hitStone`:`hitMetal`,{pos:u,intensity:.4}),i.play(`wallClank`,{pos:u,intensity:.3,vol:.6}),a.impact(`metal`,u,t.dir,t.normal,.7,u.y-1.5),e.clock.hitStop(.07),e.shake.add(.2),this.kick(t.dir,-.08),this.screen?.popup(`Ricochete!`,u,`#ffd27a`,.8);return}if(n.blocked){i.play(`arrowHit`,{pos:u,variant:`metal`}),a.impact(`metal`,u,t.dir,t.normal,.4,u.y-1.5);return}let f=Math.max(0,u.y-1.6),p=X(.25+s*.8)*(.35+.65*Math.min(1,c));if(t.projectile&&i.play(`arrowHit`,{pos:u,variant:l===`metal`?`metal`:l===`stone`?`stone`:`wood`}),i.play(xf[l],{pos:u,intensity:s*Math.max(.3,Math.min(1,c)),pitch:t.projectile?1.15:1}),a.impact(l,u,t.dir,t.normal,p,f),d){i.play(`playerHurt`,{pos:u}),e.clock.hitStop(.09),e.shake.add(.5),this.kick(t.dir,.18),o.screenFx&&this.screen?.vignette(`#ff2030`,.8);return}let m=.02+s**1.3*.13;if(t.projectile&&(m=.02+s*.03),c<.3&&(m*=.5),n.killed&&(m*=1.6),e.clock.hitStop(m),e.shake.add((t.projectile?.05:.07+s*.32)*(n.killed?1.4:1)),t.projectile||this.kick(t.dir,.03+s*.06),o.damageNumbers&&n.damage>0){let e=t.charged||s>.8,r=t.hurtbox.tag===`head`?`#ffe066`:e?`#ffb347`:`#ffffff`;this.screen?.popup(String(n.damage),u,r,.8+X(n.damage/40)*.9)}if(r===`player`){let e=this.camera.position.distanceTo(u);t.projectile&&(i.play(`hitConfirm`,{vol:1,pitch:n.killed?1.25:1}),a.flash(u,16777215,.35*Math.max(1,e/7),.12),t.hurtbox.tag===`head`&&this.screen?.popup(`NA CABEÇA!`,u.clone().setY(u.y+.4),`#ffe066`,1.1)),(l===`flesh`||t.projectile)&&this.screen?.hitMarker(n.killed,t.projectile)}}),r.on(`swing`,({pos:e,intensity:t})=>i.play(`whoosh`,{pos:e,intensity:t})),r.on(`miss`,({intensity:t})=>{t>.6&&e.shake.push(0,-.02,t)}),r.on(`wallHit`,({pos:t,dir:n,normal:r,material:o,intensity:s})=>{let c=o===`wood`?`wood`:o===`metal`?`metal`:`stone`;i.play(c===`wood`?`hitWood`:`wallClank`,{pos:t,intensity:s}),a.impact(c===`wood`?`wood`:`metal`,t,n,r,.6,t.y-1.4),e.clock.hitStop(.06),e.shake.add(.2),this.screen?.popup(`Ricochete!`,t,`#ffd27a`,.7)}),r.on(`footstep`,({pos:e,surface:t,intensity:n,player:r})=>{let o=t===`stone`||t===`metal`?`stone`:t===`wood`?`wood`:`grass`;i.play(`step`,{pos:e,variant:o,intensity:n,vol:r?1:.5}),r&&n>.75&&a.dust(e,.25,.2)}),r.on(`jump`,({pos:e})=>{i.play(`jump`,{pos:e}),a.dust(e,.3,.25)}),r.on(`land`,({pos:t,intensity:n,player:r})=>{i.play(`land`,{pos:t,intensity:n}),a.dust(t,.3+n*1.6,.3+n*.7),r&&n>.35&&e.shake.add(n*n*.45)}),r.on(`dodge`,({pos:e})=>{i.play(`dodge`,{pos:e}),a.dust(e,.5,.3)}),r.on(`perfectDodge`,({pos:t})=>{i.play(`flurry`,{pos:t}),a.sparkle(t.clone().setY(t.y+1),12578815,24,4),this.screen?.tint(`rgba(120,200,255,0.18)`,1.6),e.events.emit(`toast`,{text:`Esquiva perfeita! Ataque agora!`,kind:`good`})}),r.on(`flurryHit`,()=>e.shake.add(.08)),r.on(`chargeStart`,({pos:e})=>i.play(`chargeStart`,{pos:e})),r.on(`chargeReady`,({pos:e})=>{i.play(`chargeReady`,{pos:e}),a.sparkle(e,10479871,16,2.5)}),r.on(`bowFire`,({pos:t,power:n})=>{i.play(`bowRelease`,{pos:t,intensity:n}),e.shake.push(0,.015*n,1)}),r.on(`pickup`,({pos:e,item:t})=>{i.play(`pickup`,{pos:e,pitch:t===`stone`?.85:t===`arrow`?1.2:1}),a.sparkle(e,16773792,10,2)}),r.on(`treeFell`,({pos:e})=>i.play(`treeCreak`,{pos:e})),r.on(`treeLanded`,({pos:t})=>{i.play(`treeFall`,{pos:t});let n=this.camera.position.distanceTo(t);e.shake.add(.55/(1+n*.15))}),r.on(`rockCrack`,({pos:e})=>i.play(`rockCrack`,{pos:e})),r.on(`rockBroke`,({pos:t})=>{i.play(`rockBreak`,{pos:t}),e.shake.add(.4),e.clock.hitStop(.05)}),r.on(`enemyWindup`,({pos:e})=>{i.play(`enemyWindup`,{pos:e}),a.flash(e,16747069,.5,.25,!1,.4)}),r.on(`enemyDeath`,({pos:e})=>{i.play(`enemyDeath`,{pos:e}),a.poof(e)}),r.on(`enemySpawn`,({pos:e})=>{i.play(`enemySpawn`,{pos:e}),a.poof(e.clone().setY(e.y+.3),3811914,.8)})}kick(e,t){this.camRight.setFromMatrixColumn(this.camera.matrixWorld,0),this.camUp.setFromMatrixColumn(this.camera.matrixWorld,1),this.ctx.shake.push(e.dot(this.camRight),e.dot(this.camUp),t)}},Cf=class{world;position=new K;velocity=new K;radius=.38;height=1.75;stepUp=.36;snapDown=.35;grounded=!1;groundY=0;surface=`grass`;timeSinceGrounded=0;landedThisFrame=!1;landSpeed=0;hitWall=!1;wallNormal=new K;visualStepOffset=0;constructor(e){this.world=e}teleport(e){this.position.copy(e),this.velocity.set(0,0,0),this.visualStepOffset=0}update(e){if(this.landedThisFrame=!1,this.hitWall=!1,e<=0)return;let t=this.velocity.x*e,n=this.velocity.z*e,r=Math.max(1,Math.ceil(Math.hypot(t,n)/(this.radius*.5)));for(let e=0;e<r;e++)this.position.x+=t/r,this.position.z+=n/r,this.world.resolveCylinder(this.position,this.radius,this.height,this.grounded?this.stepUp:.08,this.wallNormal)&&(this.hitWall=!0);if(this.hitWall){let e=this.velocity.x*this.wallNormal.x+this.velocity.z*this.wallNormal.z;e<0&&(this.velocity.x-=this.wallNormal.x*e,this.velocity.z-=this.wallNormal.z*e)}let i=this.position.y,a=this.world.groundHeight(this.position.x,this.position.z,i,this.grounded?this.stepUp:.05,this.radius*.55),o=a.y,s=i+this.velocity.y*e,c=this.grounded;if(c&&this.velocity.y<=.01&&o>=i-this.snapDown){let e=o-i;Math.abs(e)>.05&&(this.visualStepOffset-=e),this.position.y=o,this.velocity.y=0,this.grounded=!0}else s<=o?(this.landSpeed=-this.velocity.y,this.position.y=o,this.velocity.y=0,this.grounded=!0,c||(this.landedThisFrame=!0)):(this.position.y=s,this.grounded=!1);this.grounded?(this.groundY=o,this.surface=a.material,this.timeSinceGrounded=0):this.timeSinceGrounded+=e,this.position.y<-30&&(this.position.set(0,2,0),this.velocity.set(0,0,0)),this.visualStepOffset*=Math.exp(-18*e)}},wf=e=>({windup:.1,active:.1,recovery:.3,damage:10,strength:.3,knockback:3,hitStop:.05,shake:.15,arc:[80,-80],roll:0,pitch:10,pivot:`right`,lunge:2,cancelAt:.05,cancelWindup:!1,chainAt:.02,whoosh:.3,bodyTwist:.35,...e}),Tf={sword1:wf({id:`sword1`,label:`Corte 1`,windup:.09,active:.09,recovery:.26,damage:12,strength:.28,knockback:2.5,hitStop:.045,shake:.12,arc:[80,-85],roll:-8,pitch:12,lunge:2.6,cancelAt:0,cancelWindup:!0,chainAt:0,next:`sword2`,whoosh:.3,bodyTwist:.55,bodyMotion:.5}),sword2:wf({id:`sword2`,label:`Corte 2`,windup:.08,active:.09,recovery:.28,damage:12,strength:.32,knockback:2.8,hitStop:.05,shake:.14,arc:[-85,75],roll:38,pitch:8,lunge:2.6,cancelAt:0,cancelWindup:!0,chainAt:0,next:`sword3`,whoosh:.35,bodyTwist:.55,bodyMotion:.5}),sword3:wf({id:`sword3`,label:`Golpe Final`,windup:.16,active:.1,recovery:.42,damage:22,strength:.65,knockback:6,hitStop:.085,shake:.3,arc:[120,-30],roll:90,pitch:0,lunge:4.5,cancelAt:.14,cancelWindup:!1,chainAt:.3,whoosh:.6,bodyTwist:.25,bodyMotion:.6,overhead:!0}),swordSpin:wf({id:`swordSpin`,label:`Ataque Giratório`,windup:.05,active:.42,recovery:.36,damage:28,strength:.85,knockback:7,hitStop:.1,shake:.4,arc:[100,-300],roll:-10,pitch:4,pivot:`center`,lunge:0,cancelAt:.2,whoosh:.9,spin:!0,stamina:25}),swordAir:wf({id:`swordAir`,label:`Corte Aéreo`,windup:.16,active:.12,recovery:.24,damage:18,strength:.6,knockback:5,hitStop:.07,shake:.28,arc:[150,-40],roll:90,pitch:0,lunge:0,cancelAt:.1,whoosh:.7,bodyMotion:.35,overhead:!0}),flurryA:wf({id:`flurryA`,label:`Rajada`,windup:.02,active:.06,recovery:.03,damage:8,strength:.35,knockback:1,hitStop:.03,shake:.12,arc:[80,-80],roll:20,pitch:10,lunge:0,whoosh:.35,bodyTwist:.5,bodyMotion:.4}),flurryB:wf({id:`flurryB`,label:`Rajada`,windup:.02,active:.06,recovery:.03,damage:8,strength:.35,knockback:1,hitStop:.03,shake:.12,arc:[-80,80],roll:-25,pitch:10,lunge:0,whoosh:.35,bodyTwist:.5,bodyMotion:.4}),axe1:wf({id:`axe1`,label:`Machadada`,windup:.3,active:.1,recovery:.4,damage:17,strength:.55,knockback:3,hitStop:.08,shake:.22,arc:[120,-12],roll:-4,pitch:18,pivot:`chest`,lunge:0,cancelAt:.14,chainAt:.16,next:`axe1`,whoosh:.55,bodyTwist:.45,work:`chop`}),axeCharged:wf({id:`axeCharged`,label:`Machadada Carregada`,windup:.08,active:.12,recovery:.55,damage:45,strength:1,knockback:6,hitStop:.15,shake:.6,arc:[105,-20],roll:-4,pitch:22,pivot:`chest`,lunge:0,cancelAt:.3,whoosh:1,bodyTwist:.6,stamina:25,work:`chop`}),pick1:wf({id:`pick1`,label:`Picaretada`,windup:.32,active:.1,recovery:.42,damage:14,strength:.55,knockback:2,hitStop:.08,shake:.22,arc:[155,-62],roll:90,pitch:0,pivot:`chest`,lunge:0,cancelAt:.14,chainAt:.16,next:`pick1`,whoosh:.5,bodyTwist:0,work:`mine`}),pickCharged:wf({id:`pickCharged`,label:`Picaretada Carregada`,windup:.08,active:.11,recovery:.55,damage:38,strength:.95,knockback:4,hitStop:.13,shake:.55,arc:[165,-66],roll:90,pitch:0,pivot:`chest`,lunge:0,cancelAt:.3,whoosh:.95,bodyTwist:0,stamina:25,work:`mine`}),club1:wf({id:`club1`,label:`Clava`,windup:.55,active:.14,recovery:.6,damage:18,strength:.6,knockback:6,hitStop:.08,shake:.35,arc:[125,-35],roll:70,pitch:0,lunge:3.2,whoosh:.7}),club2:wf({id:`club2`,label:`Clava lateral`,windup:.45,active:.14,recovery:.55,damage:16,strength:.55,knockback:6,hitStop:.08,shake:.3,arc:[95,-75],roll:0,pitch:14,lunge:3.2,whoosh:.65})},Ef={sword:{id:`sword`,tool:`sword`,bladeStart:.1,bladeEnd:1,hitRadius:.08,combo:[`sword1`,`sword2`,`sword3`],charged:`swordSpin`,air:`swordAir`,equipTime:.22,trailColor:13625599,weaponGuard:.5,sound:`blade`},axe:{id:`axe`,tool:`axe`,bladeStart:.3,bladeEnd:.85,hitRadius:.13,combo:[`axe1`],charged:`axeCharged`,air:`swordAir`,equipTime:.3,trailColor:16767392,weaponGuard:.35,sound:`blunt`},pickaxe:{id:`pickaxe`,tool:`pickaxe`,bladeStart:.3,bladeEnd:.85,hitRadius:.11,combo:[`pick1`],charged:`pickCharged`,air:`swordAir`,equipTime:.3,trailColor:14213375,weaponGuard:.3,sound:`blunt`},bow:{id:`bow`,tool:`arrow`,bladeStart:0,bladeEnd:0,hitRadius:0,combo:[],equipTime:.25,trailColor:16777215,weaponGuard:0,sound:`blunt`},club:{id:`club`,tool:`club`,bladeStart:.25,bladeEnd:.95,hitRadius:.13,combo:[`club1`,`club2`],equipTime:.3,trailColor:16744576,weaponGuard:.3,sound:`blunt`}};function Df(e,t,n){let r=1/Math.max(.1,t),i=e.windup*r,a=e.active*r,o=e.recovery*r*n;return{windup:i,active:a,recovery:o,total:i+a+o}}function Of(e,t,n){let[r,i]=e.arc,a=Math.sign(i-r)||1;if(n<t.windup){let e=n/t.windup;return{angle:Z(r*.45,r-a*14,Dd(e)),phase:`windup`,u:e}}if(n<t.windup+t.active){let e=(n-t.windup)/t.active;return{angle:Z(r-a*14,i,Ad(e)),phase:`active`,u:e}}let o=X((n-t.windup-t.active)/Math.max(1e-4,t.recovery));return{angle:i+a*(Math.sin(Math.min(1,o*2.2)*Math.PI)*9*(1-o)),phase:o>=1?`done`:`recovery`,u:o}}var kf=new G,Af=new K,jf=new K(0,0,1),Mf=new K(-1,0,0),Nf=new K(0,1,0);function Pf(e,t,n,r,i=0){let a=t*bd,o=e.roll*bd,s=Af.copy(Mf).multiplyScalar(Math.cos(o)).addScaledVector(Nf,Math.sin(o));n.copy(jf).multiplyScalar(Math.cos(a)).addScaledVector(s,Math.sin(a));let c=Math.sign(e.arc[1]-e.arc[0])||1;r.copy(jf).multiplyScalar(-Math.sin(a)).addScaledVector(s,Math.cos(a)).multiplyScalar(c),e.pitch&&(kf.setFromAxisAngle(Mf,e.pitch*bd),n.applyQuaternion(kf),r.applyQuaternion(kf)),i&&(kf.setFromAxisAngle(Mf,i),n.applyQuaternion(kf),r.applyQuaternion(kf)),n.normalize(),r.normalize()}var Ff=new K(-.2,1.38,.04),If=new K(0,1.12,0),Lf=.56,Rf=new K(0,1.28,.1),zf=.3;function Bf(e){return e.pivot===`center`?{pivot:If,reach:.7}:e.pivot===`chest`?{pivot:Rf,reach:.5}:{pivot:Ff,reach:Lf}}function Vf(e,t,n,r,i,a,o,s,c,l,u,d,f=0){Pf(e,n,u,d,f);let{pivot:p,reach:m}=Bf(e);s.copy(p).multiplyScalar(o).addScaledVector(u,m*o),kf.setFromAxisAngle(Nf,a),s.applyQuaternion(kf).add(i),u.applyQuaternion(kf),d.applyQuaternion(kf),c.copy(s).addScaledVector(u,t.bladeStart*r*o),l.copy(s).addScaledVector(u,t.bladeEnd*r*o)}function Hf(e=`flesh`){return{material:e,damage:0,effectiveness:1,deflected:!1,blocked:!1,parried:!1,killed:!1,ignored:!1}}var Uf=1,Wf=()=>Uf++;function Gf(e,t){return{wood:{axe:1,sword:.2,pickaxe:.3,arrow:0,club:0,shield:0},stone:{pickaxe:1,axe:.12,sword:0,arrow:0,club:0,shield:0},metal:{pickaxe:.2,axe:.2,sword:0,arrow:0,club:0}}[t]?.[e]??1}var Kf=[`pelvis`,`spine`,`chest`,`neck`,`head`,`upperArmR`,`forearmR`,`handR`,`upperArmL`,`forearmL`,`handL`,`thighR`,`shinR`,`footR`,`thighL`,`shinL`,`footL`],qf={variant:`hero`,skin:15911328,tunic:3108784,tunicDark:2051196,pants:15260864,boots:5913124,hair:15123292,belt:7029800,eye:1850476,bulk:1,scale:1},Jf={variant:`goblin`,skin:12735578,tunic:4863270,tunicDark:3482906,pants:3812128,boots:2759956,hair:2759956,belt:9071162,eye:16773248,bulk:1.25,scale:1.02},Yf=.29,Xf=.27,Zf=class{style;root=new wn;body=new wn;joints={};sockets;materials=[];bodyPivotY=.62;flashT=0;flashColor=new q;constructor(e=qf){this.style=e;let t=e,n=(e,t=.8)=>{let n=new Lo({color:e,roughness:t,flatShading:!0});return n.emissive=new q(0),this.materials.push(n),n},r=n(t.skin,.7),i=n(t.tunic),a=n(t.tunicDark),o=n(t.pants),s=n(t.boots,.9),c=n(t.hair,.6),l=n(t.belt),u=n(t.eye,.3),d=(e,t,n,r=0,i=0,a=0)=>{let o=new J(t,n);return o.position.set(r,i,a),o.castShadow=!0,o.receiveShadow=!1,e.add(o),o},f=(e,t,n,r,i)=>{let a=new wn;return a.name=e,a.position.set(n,r,i),t.add(a),this.joints[e]=a,a},p=t.bulk,m=t.variant===`goblin`;this.root.add(this.body),this.body.position.y=this.bodyPivotY;let h=f(`pelvis`,this.body,0,.95-this.bodyPivotY,0),g=f(`spine`,h,0,.08,0),_=f(`chest`,g,0,.18,0),v=f(`neck`,_,0,.26,0),y=f(`head`,v,0,.07,.01);d(h,new ea(.15*p,.17*p,.16,8),o,0,0,0);let b=d(h,new ea(.17*p,.23*p,.26,8,1,!0),m?a:i,0,-.1,0);b.material.side=2,d(h,new ea(.165*p,.165*p,.05,8),l,0,.06,0);let x=d(g,new ea(.2*p,.155*p,.36,8),i,0,.16,0);x.scale.z=.72,m||(d(_,new Zi(.06,.34,.02),l,-.06,-.02,.12).rotation.z=.5),d(_,new To(.1*p,8,6),m?r:a,.19*p,.15,0).scale.set(1,.8,.9),d(_,new To(.1*p,8,6),m?r:a,-.19*p,.15,0).scale.set(1,.8,.9),d(v,new ea(.055,.065,.1,6),r,0,0,0);let S=m?.16:.135;if(d(y,new xo(S,1),r,0,.12,0).scale.set(1,1.08,1),d(y,new To(.022,6,4),u,.05,.13,S*.88),d(y,new To(.022,6,4),u,-.05,.13,S*.88),m){d(y,new To(.075,7,5),r,0,.07,.14).scale.set(1.2,.8,1),d(y,new To(.015,4,3),n(2756624),.03,.08,.215),d(y,new To(.015,4,3),n(2756624),-.03,.08,.215),d(y,new ta(.035,.16,5),n(15787720,.5),0,.3,.04).rotation.x=-.25;let e=new ta(.05,.2,4);d(y,e,r,.17,.14,0).rotation.set(0,0,-1.35),d(y,e,r,-.17,.14,0).rotation.set(0,0,1.35),d(y,new ta(.012,.05,3),n(16777215,.4),.04,.02,.19).rotation.x=Math.PI,d(y,new ta(.012,.05,3),n(16777215,.4),-.04,.02,.19).rotation.x=Math.PI}else{d(y,new To(.145,10,6,0,Math.PI*2,0,Math.PI*.55),c,0,.14,-.01).scale.set(1.02,1.05,1.06),d(y,new ta(.05,.14,4),c,.05,.19,.11).rotation.set(1.9,0,.3),d(y,new ta(.05,.14,4),c,-.06,.2,.11).rotation.set(1.9,0,-.3),d(y,new ta(.045,.22,5),c,0,.1,-.15).rotation.x=-.4;let e=new ta(.025,.12,4);d(y,e,r,.14,.12,-.01).rotation.set(0,0,-1.2),d(y,e,r,-.14,.12,-.01).rotation.set(0,0,1.2)}let C=e=>{let t=e===-1,n=f(t?`upperArmR`:`upperArmL`,_,.2*p*e,.17,.04);d(n,new Qi(.055*p,.20999999999999996,3,6),m?r:i,0,-.29/2,0);let a=f(t?`forearmR`:`forearmL`,n,0,-.29,0);d(a,new Qi(.047*p,.19,3,6),r,0,-.27/2,0),m||d(a,new ea(.056,.052,.1,6),s,0,-.19,0);let o=f(t?`handR`:`handL`,a,0,-.27,0);d(o,new Zi(.07*p,.09,.08),r,0,-.03,0)};C(-1),C(1);let w=e=>{let t=e===-1,n=f(t?`thighR`:`thighL`,h,.095*e*p,-.04,0);d(n,new Qi(.07*p,.28,3,6),o,0,-.21,0);let i=f(t?`shinR`:`shinL`,n,0,-.43,0);d(i,new Qi(.06*p,.26,3,6),m?r:s,0,-.2,0),m||d(i,new ea(.075,.068,.08,6),s,0,-.02,0);let a=f(t?`footR`:`footL`,i,0,-.42,0);d(a,new Zi(.1*p,.07,.2),s,0,-.03,.04)};w(-1),w(1);let T=new wn;T.position.set(0,-.04,0),this.joints.handR.add(T);let E=new wn;E.position.set(0,-.04,0),this.joints.handL.add(E);let D=new wn;D.position.set(0,.12,-.16),_.add(D);let O=new wn;O.position.set(.2,0,-.05),h.add(O);let k=new wn;k.position.set(.07,-.27*.55,0),this.joints.forearmL.add(k),this.sockets={handR:T,handL:E,back:D,hip:O,shieldArm:k},this.root.scale.setScalar(t.scale)}flash(e,t=.12){this.flashT=t,this.flashColor.set(e)}updateFlash(e){if(this.flashT<=0)return;this.flashT-=e;let t=+(Math.max(0,this.flashT)>0);for(let e of this.materials)e.emissive.copy(this.flashColor).multiplyScalar(t*.6)}setVisible(e){this.root.visible=e}dispose(){this.root.traverse(e=>{let t=e;t.geometry&&t.geometry.dispose()});for(let e of this.materials)e.dispose()}};function Qf(){return{speed:0,runSpeed:5,moveAngle:0,grounded:!0,vy:0,turnRate:0,guard:0,action:`none`,actionT:0,actionU:0,attackTwist:0,spinYaw:0,crouch:0,dodgeType:`hopL`,hurtX:0,hurtZ:1,bowDraw:0,aimPitch:0,exhausted:!1,sprinting:!1}}var $f=class{rig;phase=0;lastStepSign=0;landImpact=0;t=0;pose;targetQ=new G;bodyRotX=0;bodyRotZ=0;bodyYaw=0;sneakW=0;bodyY=0;lean=0;wasGrounded=!0;airVy=0;airT=0;airFromJump=!1;landLevel=0;landHold=0;squash=1;readyW=0;runW=0;hipYawS=0;recoil=0;recoilV=0;onFootstep;constructor(e){this.rig=e,this.pose={},this.fk={};for(let t of Kf)this.pose[t]=new on,this.fk[t]=e.joints[t].quaternion.clone()}fk;land(e){let t=X(e);t<.04||(this.landImpact=Math.max(this.landImpact,.2+.8*t),this.landLevel=Math.max(t,this.landImpact>.3?this.landLevel*.5:0),this.landHold=.03+.32*t*t)}kick(e){this.recoilV+=e}update(e,t){if(e<=0)return;this.t+=e;let n=this.pose;for(let e of Kf)n[e].set(0,0,0);let r=t.speed,i=t.walkSpeed??2.2,a=(t.sprinting||r>i*1.45)&&r>.5?1:0;this.runW=$(this.runW,a,9,e);let o=this.runW,s=X(r/1.2),c=0,l=1;if(t.strafing&&s>.05&&Math.abs(t.moveAngle)>.2){let e=t.moveAngle;Math.abs(e)>Math.PI*.62&&(l=-1,e=e>0?e-Math.PI:e+Math.PI),c=xd(e,-1.1,1.1)}this.hipYawS=$(this.hipYawS,c,10,e),c=this.hipYawS;let u=Z(1.6,3,o);t.grounded&&(this.phase+=l*r*e/u);let d=this.phase*yd,f=Math.sin(d),p=Math.cos(d),m=(1-o)*s,h=o*s,g=e=>e>0?e:0,_=g(p)**1.4,v=g(-p)**1.4,y=-f*.42-.05,b=f*.42-.05,x=.08+_*.8+g(-p)*g(f)*.22,S=.08+v*.8+g(p)*g(-f)*.22,C=-(y+x)-g(f)*g(p)*.5+g(-f)*g(-p)*.55,w=-(b+S)-g(-f)*g(-p)*.5+g(f)*g(p)*.55,T=((this.phase-.25)%1+1)%1,E=(T+.5)%1,D=np(T),O=np(E),k=D.thigh,A=O.thigh,j=D.shin,M=O.shin,ee=D.foot,N=O.foot,te=Math.cos(T*yd),P=(e,t)=>e*m+t*h;n.thighR.x=P(y,k),n.thighL.x=P(b,A),n.shinR.x=P(x,j)+(1-s)*.04,n.shinL.x=P(S,M)+(1-s)*.04,n.footR.x=P(C,ee),n.footL.x=P(w,N),n.pelvis.y=c+f*.1*m+te*.16*h,n.pelvis.z=f*.045*m;let ne=.14*h;n.pelvis.x+=ne,n.thighR.x-=ne,n.thighL.x-=ne,n.spine.y=-c*.55,n.chest.y=-c*.35-f*.14*m-te*.22*h,n.spine.z=-f*.035*m,n.spine.x=P(.03,.3)+(t.exhausted?.25:0),n.chest.x+=.04*h,n.head.x=-n.spine.x*.78,n.head.y=f*.06*m-n.chest.y*.8*h;let F=Math.sin(te*Math.PI*.5);n.upperArmR.x=f*.42*m+(.75*F-.2)*h,n.upperArmL.x=-f*.42*m+(-.75*F-.2)*h,n.upperArmR.z=-.07*m-.12*h-.05*(1-s),n.upperArmL.z=.07*m+.12*h+.05*(1-s),n.forearmR.x=-(.18+g(-f)*.4)*m-(1.35+.35*g(-F))*h-.1*(1-s),n.forearmL.x=-(.18+g(f)*.4)*m-(1.35+.35*g(F))*h-.1*(1-s);let re=(Math.abs(p)-1)*.028*m-.065*Math.cos(yd*(2*T-.24))*h-.03*h,ie=1-s;this.readyW=$(this.readyW,t.ready??0,6,e);let I=this.readyW*ie*(1-t.guard),ae=(1-this.readyW)*ie*(1-t.guard),oe=this.readyW*s*(1-t.guard);oe>.001&&(n.upperArmR.x=Z(n.upperArmR.x,.6+f*Z(.1,.16,o),oe),n.upperArmR.z=Z(n.upperArmR.z,-.28,oe),n.forearmR.x=Z(n.forearmR.x,-.5-.15*o,oe));let L=Math.sin(this.t*(t.exhausted?6:2.1));if(n.chest.x+=L*(t.exhausted?.06:.025)*ie,n.upperArmR.z-=L*.02*ie,n.upperArmL.z+=L*.02*ie,ae>.001){let e=Math.sin(this.t*.45),t=.5+.5*e,r=1-t;n.pelvis.z+=e*.06*ae,n.spine.z+=-e*.05*ae,n.thighR.z+=(-.08-.04*r)*ae,n.thighL.z+=(.08+.04*t)*ae,n.thighR.x+=-.1*r*ae,n.shinR.x+=.22*r*ae,n.footR.x-=.1*r*ae,n.thighL.x+=-.1*t*ae,n.shinL.x+=.22*t*ae,n.footL.x-=.1*t*ae,n.upperArmR.z+=-.1*ae,n.upperArmL.z+=.1*ae,n.upperArmR.x+=.05*ae,n.upperArmL.x+=.05*ae,n.forearmR.x+=-.22*ae,n.forearmL.x+=-.22*ae;let i=Math.sin(this.t*.31)*Math.max(0,Math.sin(this.t*.17));n.head.y+=i*.55*ae,n.neck.y+=i*.15*ae,n.head.x+=(Math.sin(this.t*.23)*.06-.02)*ae}if(I>.001){let e=Math.sin(this.t*2.6)*.03;n.thighL.x+=-.35*I,n.shinL.x+=(.4+e)*I,n.thighR.x+=.28*I,n.shinR.x+=(.42+e)*I,n.thighL.z+=.12*I,n.thighR.z+=-.14*I,n.footR.x+=-.25*I,n.footL.x+=-.1*I,n.pelvis.y+=-.35*I,n.spine.y+=.2*I,n.chest.y+=.1*I,n.head.y+=.12*I,n.spine.x+=.1*I,n.upperArmR.x+=-.55*I,n.upperArmR.z+=-.18*I,n.forearmR.x+=-.55*I,t.hasShieldUp?(n.upperArmL.x+=-.4*I,n.upperArmL.z+=.25*I,n.forearmL.x+=-1*I):(n.upperArmL.x+=-.25*I,n.upperArmL.z+=.2*I,n.forearmL.x+=-.6*I),re-=(.07+e)*I}t.exhausted&&(n.spine.x+=.3*ie,n.head.x-=.1,n.thighR.x-=.25*ie,n.shinR.x+=.4*ie,n.thighL.x-=.25*ie,n.shinL.x+=.4*ie,re-=.06*ie);let se=Math.sign(f);if(t.grounded&&s>.25&&se!==this.lastStepSign&&this.lastStepSign!==0&&this.onFootstep?.(se>0?`L`:`R`,X(r/7)),this.lastStepSign=se,t.grounded)this.airT=0;else{this.airT+=e;let r=this.airT,i=X(t.vy/6),a=X(-t.vy/9),o=1-X(Math.abs(t.vy)/3.5),s=this.airFromJump?1-X(r/.16):0,c=X((-t.vy-8.5)/7),l=Math.sin(r*13),u=Math.sin(r*9);n.thighR.x=-.35-.95*i-.5*o+.45*a,n.shinR.x=.55+1.2*i+.7*o-.25*a,n.thighL.x=.15*s-.35*o-.1*i+.2*a,n.shinL.x=.3+.35*i+.9*o+.05*a-.1*s,n.footR.x=.2*i-.25*a,n.footL.x=.35*s-.2*a,n.thighR.z=-.08*a,n.thighL.z=.08*a,n.upperArmR.x=-1.1*s-.7*i-.3*o-.35*a,n.upperArmL.x=-.9*s-.5*i-.3*o-.3*a,n.upperArmR.z=-.35-.35*o-1*a,n.upperArmL.z=.35+.35*o+1*a,n.forearmR.x=-.9+.4*a,n.forearmL.x=-.9+.4*a,n.spine.x=-.12*s+.15*i+.3*o-.1*a,n.head.x=-.1*i+.35*a,c>0&&(n.thighR.x+=l*.55*c,n.thighL.x-=l*.55*c,n.shinR.x+=(.5+Math.max(0,-l)*.6)*c,n.shinL.x+=(.5+Math.max(0,l)*.6)*c,n.upperArmR.x+=u*.9*c,n.upperArmL.x-=u*.9*c,n.upperArmR.z-=.3*c,n.upperArmL.z+=.3*c,n.spine.x-=.25*c,n.head.x+=.15*c),re=0}this.airFromJump=!t.grounded&&(this.airFromJump||this.wasGrounded&&t.vy>2),t.grounded||(this.airVy=t.vy),t.grounded&&!this.wasGrounded&&this.land(X((-this.airVy-2)/13)),this.wasGrounded=t.grounded,this.landHold>0?this.landHold-=e:this.landImpact=$(this.landImpact,0,Z(9,3.2,this.landLevel),e);let ce=this.landImpact,le=X((this.landLevel-.5)/.4)*ce;n.thighR.x-=ce*.95,n.thighL.x-=ce*1.05,n.shinR.x+=ce*1.6,n.shinL.x+=ce*1.7,n.footR.x-=ce*.5,n.footL.x-=ce*.55,n.spine.x+=ce*.5+le*.35,n.head.x-=le*.35,n.upperArmR.z-=ce*.4,n.upperArmL.z+=ce*.5,n.upperArmR.x-=ce*.45*(1-le),n.upperArmL.x-=ce*.35,n.forearmR.x-=ce*.5*(1-le),n.forearmL.x-=ce*.6,n.thighR.x+=le*.55,n.shinR.x+=le*.35,n.upperArmR.x+=le*(-.45-n.upperArmR.x*.6),n.upperArmR.z-=le*.15,n.forearmR.x+=le*(-.15-n.forearmR.x*.6);let ue=t.crouch;n.thighR.x-=ue*.5,n.thighL.x-=ue*.5,n.shinR.x+=ue*.9,n.shinL.x+=ue*.9,n.footR.x-=ue*.4,n.footL.x-=ue*.4,t.sneakSnap&&=(this.sneakW=0,!1),this.sneakW=$(this.sneakW,t.sneak&&t.action!==`dodge`?1:0,8,e);let de=this.sneakW;de>.001&&(n.thighR.x-=1.1*de,n.thighL.x-=1.1*de,n.shinR.x+=1.7*de,n.shinL.x+=1.7*de,n.footR.x-=.6*de,n.footL.x-=.6*de,n.spine.x+=.55*de,n.chest.x+=.12*de,n.head.x-=.5*de,n.upperArmR.x-=.3*de,n.upperArmL.x-=.3*de,n.upperArmR.z-=.22*de,n.upperArmL.z+=.22*de,n.forearmR.x-=.8*de,n.forearmL.x-=.8*de);let fe=t.guard;if(fe>.01){n.upperArmL.x=Z(n.upperArmL.x,-1.25,fe),n.upperArmL.z=Z(n.upperArmL.z,.35,fe),n.upperArmL.y=Z(0,-.5,fe),n.forearmL.x=Z(n.forearmL.x,-1.2,fe);let e=fe*ie;n.thighL.x+=-.3*e,n.shinL.x+=.35*e,n.thighR.x+=.3*e,n.shinR.x+=.35*e,n.thighR.z+=-.12*e,n.thighL.z+=.1*e,n.pelvis.y+=-.3*fe,n.spine.y+=.18*fe,n.chest.y+=.08*fe,n.head.y+=.1*fe,n.spine.x+=fe*.2,n.head.x+=-fe*.1,n.upperArmR.x=Z(n.upperArmR.x,.05,fe),n.upperArmR.z=Z(n.upperArmR.z,-.35,fe),n.forearmR.x=Z(n.forearmR.x,-1.15,fe)}let pe=0,me=0,he=0,ge=0,_e=!1,ve=t.actionU;switch(t.action){case`attack`:case`charge`:{if(_e=!0,n.chest.y+=t.attackTwist,n.spine.y+=t.attackTwist*.6,n.pelvis.y+=t.attackTwist*.45,n.spine.x+=.12,n.thighR.x=Z(n.thighR.x,.35,.6),n.thighL.x=Z(n.thighL.x,-.45,.6),n.shinR.x=Z(n.shinR.x,.35,.6),n.shinL.x=Z(n.shinL.x,.3,.6),t.attackSpin){let e=t.attackBody??0,r=+(t.action===`charge`),i=Math.max(r,Math.max(0,-e)),a=t.action===`attack`?Math.max(0,e):0,o=Math.max(i,a);if(n.thighR.z=-.34*o,n.thighL.z=.34*o,n.thighR.x=.05-.2*o,n.thighL.x=-.3*o,n.shinR.x=.65*o+.2*a,n.shinL.x=.6*o+.2*a,n.footR.x=-.3*o,n.footL.x=-.2*o,ge-=.16*o+.06*a,n.pelvis.y+=-.25*i,n.spine.y+=-.55*i,n.chest.y+=-.35*i,n.head.y+=.8*i,n.spine.x+=.3*i+.28*a,n.upperArmL.x+=-.7*i,n.upperArmL.z+=.35*i,n.forearmL.x-=.4*i,n.head.y+=.4*a,n.chest.y+=.25*a,n.spine.z+=.12*a,me+=.26*a,n.upperArmL.z+=.75*a,n.upperArmL.x+=.75*a,n.forearmL.x-=.25*a,a>.05){let e=Math.sin(t.spinYaw*2),r=Math.max(0,e),i=Math.max(0,-e);n.thighR.x+=-.35*r*a,n.shinR.x+=.5*r*a,n.thighL.x+=-.35*i*a,n.shinL.x+=.5*i*a,ge+=.03*Math.abs(e)*a}he=t.spinYaw;break}if(t.attackAir){let e=t.attackBody??0,r=Math.max(0,e),i=Math.max(0,-e);n.thighR.x=-.35-.75*r+.2*i,n.thighL.x=-1-.3*r+.15*i,n.shinR.x=.9+.5*r,n.shinL.x=1.3+.2*r,n.thighR.z=-.1,n.thighL.z=.12,n.spine.x+=-.35*i+.55*r,n.chest.x+=-.2*i+.25*r,n.head.x+=.25*i-.15*r,pe=-.25*i+.35*r,ge+=.1*i,n.upperArmL.z+=.6*i+.3*r,n.upperArmL.x+=-.5*i+.4*r;break}let e=t.attackMotion??0;if(e>0){let r=t.attackBody??0,i=Math.max(0,r),a=Math.max(0,-r),o=t.attackSide??0,s=+!!t.attackOverhead;n.spine.x+=(-.3*a-.25*a*s+.42*i+.3*i*s)*e,n.chest.x+=(-.12*a+.15*i)*e,n.head.x+=(.1*a-.25*i)*e,n.thighL.x+=(-.55*i+.25*a)*e,n.shinL.x+=.55*i*e,n.thighR.x+=(.5*i-.2*a)*e,n.shinR.x+=(.25*i+.3*a)*e,n.footR.x+=.35*i*e,me+=o*.22*i*e,n.spine.z+=o*.12*i*e,n.upperArmL.z+=(.35*i+.15*a)*e,n.upperArmL.x+=(.45*i-.3*a)*e,n.forearmL.x-=.5*i*e,ge+=(-.16*i-.12*i*s+.1*a*s)*e}if(t.attackWork){let e=t.attackBody??0,r=Math.max(0,e),i=Math.max(0,-e);n.thighR.x=.15,n.thighL.x=-.25,n.thighR.z=-.22,n.thighL.z=.22,n.shinR.x=.45,n.shinL.x=.4,n.footR.x=-.3,n.footL.x=-.1,ge-=.08,t.attackWork===`chop`?(n.spine.x+=.12-.08*i+.2*r,n.pelvis.y+=(t.action===`charge`?.05:.25)*i-.15*r,n.thighR.x+=-.15*i,n.shinR.x+=.2*i,n.shinL.x+=.2*r,n.head.y=-t.attackTwist*.5):(n.spine.x+=-.22*i+.55*r,n.chest.x+=-.1*i+.15*r,n.head.x+=.15*i+.1*r,n.shinR.x+=.35*r,n.shinL.x+=.35*r,n.thighR.x-=.25*r,n.thighL.x-=.25*r,ge+=.04*i-.14*r)}t.action===`charge`&&(n.thighR.z=-.2,n.thighL.z=.2,n.spine.x+=.15),he=t.spinYaw;break}case`climb`:{_e=!0;let e=(t.climbPhase??0)*yd,r=t.climbMove??0,i=t.climbJump??0,a=t.climbGrab??0,o=t.climbTired??0,s=Math.sin(e)*r,c=Math.max(0,-Math.cos(e))*r,l=Math.max(0,Math.cos(e))*r,u=Math.cos(e)**2*r,d=Math.sin(this.t*38)*.05*o+Math.sin(this.t*27)*.03*o,f=Math.sin(this.t*(2+4*o))*(.03+.04*o)*(1-r),p=Math.max(0,-i),m=Math.max(0,i);n.pelvis.x=.1+.12*p,n.spine.x=.05-.12*u+.25*p-.1*m+f,n.chest.x=-.08-.08*u,n.head.x=-.5+.15*u+d*.4,n.neck.x=-.1,n.head.y=s*.12,n.spine.z=s*.1,n.pelvis.z=-s*.14,me=s*.07,n.upperArmR.x=-2.6-.35*s+.35*c-.5*m+.35*p+d,n.upperArmL.x=-2.6+.35*s+.35*l-.5*m+.35*p-d,n.upperArmR.z=-.42-.1*c,n.upperArmL.z=.42+.1*l,n.upperArmR.y=0,n.upperArmL.y=0,n.forearmR.x=-.3-1.25*c-.9*p+.2*m-.3*a,n.forearmL.x=-.3-1.25*l-.9*p+.2*m-.3*a,n.thighR.x=-.8-.5*l+.35*c-.5*p+.5*m-.2*a,n.thighL.x=-.8-.5*c+.35*l-.5*p+.5*m-.2*a,n.thighR.z=-.2,n.thighL.z=.2,n.shinR.x=1.15+.5*l-.3*c+.6*p-.7*m+.3*a+d,n.shinL.x=1.15+.5*c-.3*l+.6*p-.7*m+.3*a-d,n.footR.x=-.35,n.footL.x=-.35;let h=xd(t.climbDirX??0,-1,1),g=xd(t.climbDirY??1,-1,1),_=Math.max(0,-g)*r,v=Math.abs(h)*r;if(_>.001&&(n.head.x+=.75*_,n.upperArmR.x+=.75*_,n.upperArmL.x+=.75*_,n.forearmR.x-=.35*_,n.forearmL.x-=.35*_,n.thighR.x+=.45*_*(1+.6*c),n.thighL.x+=.45*_*(1+.6*l),n.shinR.x-=.5*_,n.shinL.x-=.5*_,n.spine.x-=.12*_),v>.001){let t=Math.sign(h),r=.5+.5*Math.sin(e),i=1-r,a=t>0?r:-.4*i,o=t<0?r:-.4*i;n.upperArmR.z-=.9*a*v,n.upperArmL.z+=.9*o*v,n.upperArmR.x+=.55*Math.max(0,a)*v,n.upperArmL.x+=.55*Math.max(0,o)*v,n.forearmR.x+=.25*Math.max(0,a)*v,n.forearmL.x+=.25*Math.max(0,o)*v;let s=t>0?i:r*.4,c=t<0?i:r*.4;n.thighR.z-=.5*s*v,n.thighL.z+=.5*c*v,n.thighR.x+=.3*s*v,n.thighL.x+=.3*c*v,n.head.y-=t*.55*v,n.spine.z-=t*.1*v,me+=t*.1*v}ge=.05*u*(1-_)-.14*p-.12*a;break}case`mantle`:{_e=!0;let e=1-X((ve-.1)/.14),t=1-(1-X((ve-.2)/.25))**3,r=Math.sin(X((ve-.45)/.45)*Math.PI),i=X((ve-.78)/.22),a=1-X((ve-.45)/.15);n.upperArmR.x=n.upperArmL.x=(-2.7+1.1*t)*a+.25*r*(1-a),n.upperArmR.z=-.4,n.upperArmL.z=.4,n.forearmR.x=n.forearmL.x=(-.15-1.5*t*(1-e))*a+-.25*r*(1-a),n.spine.x=.1+.35*t*a+.55*r,n.chest.x=-.1*e,n.head.x=-.5*e-.2*t*a+.15*r,n.thighR.x=(-1.6*r-.3*e)*(1-i),n.thighL.x=(-.4*r+.15*e)*(1-i),n.shinR.x=(2*r+.4*e)*(1-i)+.05,n.shinL.x=(1*r+.3*e)*(1-i)+.05,n.footR.x=-.3*r,n.footL.x=-.2*r,ge=-.12*r*(1-i);break}case`dodge`:{_e=!0;let e=Od(ve);if(t.dodgeType===`hopF`){let e=Math.sin(ve*Math.PI);n.spine.x=.25*e,n.thighR.x=n.thighL.x=-1.1*e,n.shinR.x=n.shinL.x=1.6*e,n.upperArmR.x=n.upperArmL.x=.9*e,ge=.12*e}else if(t.dodgeType===`flip`){pe=-e*yd;let t=Math.sin(ve*Math.PI);n.thighR.x=n.thighL.x=-1.9*t,n.shinR.x=n.shinL.x=2.3*t,n.spine.x=.5*t,n.head.x=.4*t,n.upperArmR.z=-1.5*t,n.upperArmL.z=1.5*t,ge=.3*t}else if(t.dodgeType===`back`){let e=Math.sin(ve*Math.PI),t=ve<.3?Math.sin(ve/.3*Math.PI):0,r=Math.sin(X((ve-.2)/.6)*Math.PI),i=X((ve-.78)/.22),a=Math.sin(X(ve/.55)*Math.PI);n.spine.x=-.18*a+.3*r*(ve>.45?1:.3)+.35*i,n.chest.x=-.06*a,n.head.x=.12*a-.1*i,n.thighR.x=-1.35*r+.2*t,n.shinR.x=1.7*r+.5*i,n.thighL.x=-1.1*r+.3*t,n.shinL.x=1.5*r+.5*i,n.thighR.x-=.5*i,n.thighL.x-=.5*i,n.footR.x=n.footL.x=.35*r,n.upperArmR.x=n.upperArmL.x=-1.1*a-.5*r,n.upperArmR.z=-.55*e,n.upperArmL.z=.55*e,n.forearmR.x=n.forearmL.x=-.3*e,pe=-.14*a+.2*i,ge=.22*r-.25*i-.12*t}else{let e=t.dodgeType===`hopL`?1:-1,r=Math.sin(ve*Math.PI);me=-e*.55*r,n.spine.z=e*.25*r,n.thighR.x=n.thighL.x=-.9*r,n.shinR.x=n.shinL.x=1.5*r,n.thighR.z=e*.18*r,n.thighL.z=e*.18*r,n.upperArmR.z=-.9*r,n.upperArmL.z=.9*r,n.upperArmR.x=n.upperArmL.x=-.4*r,ge=.12*r}break}case`bow`:he=-1.42,n.pelvis.y+=.1,n.chest.y+=-.12,n.neck.y=.65,n.head.y=.7,n.head.x=-t.aimPitch*.35,n.head.z=.08,n.spine.z=t.aimPitch*.45,n.chest.z=t.aimPitch*.2,n.spine.x=.04,n.thighR.x=.05,n.thighL.x=-.05,n.thighR.z=-.2,n.thighL.z=.2,n.shinR.x=.18,n.shinL.x=.18,n.footR.z=.15,n.footL.z=-.15;break;case`equip`:{let e=Math.sin(X(ve)*Math.PI);n.upperArmR.x=Z(n.upperArmR.x,-2.6,e),n.upperArmR.z=Z(n.upperArmR.z,-.3,e),n.forearmR.x=Z(n.forearmR.x,-1.2,e),n.chest.y+=-.25*e,n.head.y=-.2*e;break}case`hurt`:{_e=!0;let e=Math.sin(X(ve)*Math.PI)*(1-ve*.3);n.spine.x+=-t.hurtZ*.5*e,n.spine.z+=t.hurtX*.5*e,n.head.x+=-t.hurtZ*.4*e,n.upperArmR.z-=.6*e,n.upperArmL.z+=.6*e,n.upperArmR.x-=.4*e,n.upperArmL.x-=.4*e,n.thighR.x-=.3*e,n.shinR.x+=.5*e;break}case`guardHit`:{_e=!0;let e=Math.sin(X(ve)*Math.PI);n.spine.x-=.25*e,n.thighL.x-=.4*e,n.shinL.x+=.4*e,n.thighR.x+=.3*e,ge=-.05*e;break}case`stagger`:{let e=Math.min(1,ve*6)*(1-Dd(Math.max(0,ve-.7)/.3)),t=Math.sin(this.t*9)*.15;n.spine.x-=.55*e,n.chest.x-=.2*e,n.head.x-=.3*e,n.spine.z=t*e,n.upperArmR.z=Z(n.upperArmR.z,-1.4,e),n.upperArmL.z=Z(n.upperArmL.z,1.4,e),n.forearmR.x=-.8*e,n.forearmL.x=-.8*e,n.thighR.x=-.5*e,n.shinR.x=.6*e,n.thighL.x=.4*e;break}case`dead`:{let e=Dd(X(ve*1.4));pe=-1.45*e,ge=-.45*e,n.upperArmR.z=-1.2*e,n.upperArmL.z=1.2*e,n.head.x=-.3*e,n.thighR.x=-.3*e,n.shinR.x=.5*e,_e=!0;break}case`spawn`:{let e=1-Dd(ve);ge=-1.2*e,n.upperArmR.z=-1.3*e,n.upperArmL.z=1.3*e;break}}this.recoilV+=-this.recoil*220*e,this.recoilV*=Math.exp(-14*e),this.recoil+=this.recoilV*e,n.spine.x-=this.recoil*.5,n.upperArmR.x-=this.recoil*.6,this.lean=$(this.lean,xd(-t.turnRate*.045*X((r-1)/4),-.22,.22),5,e),me+=t.grounded&&t.action===`none`?this.lean:0;let ye=_e?34:Z(16,38,s),be=1-Math.exp(-ye*e);for(let e of Kf)this.targetQ.setFromEuler(n[e]),this.fk[e].slerp(this.targetQ,be),this.rig.joints[e].quaternion.copy(this.fk[e]);this.bodyRotX=t.action===`dodge`&&t.dodgeType===`flip`?pe:$(this.bodyRotX,pe,_e?25:12,e),this.bodyRotZ=$(this.bodyRotZ,me,12,e),t.action===`attack`&&Math.abs(he)>.01?this.bodyYaw=he:(this.bodyYaw=Math.atan2(Math.sin(this.bodyYaw),Math.cos(this.bodyYaw)),this.bodyYaw=$(this.bodyYaw,he,10,e)),this.bodyY=$(this.bodyY,ge,20,e);let xe=this.rig.body;xe.rotation.set(this.bodyRotX,this.bodyYaw,this.bodyRotZ,`YXZ`);let Se=1+(t.grounded?0:xd(Math.abs(t.vy)*.012,0,.1))-ce*(.12+.1*this.landLevel);this.squash=$(this.squash,Se,25,e),xe.scale.set(1/Math.sqrt(this.squash),this.squash,1/Math.sqrt(this.squash)),xe.position.y=this.rig.bodyPivotY+this.bodyY-ce*(.16+.26*this.landLevel)-ue*.12-this.sneakW*.32+re}},ep=[[-.7,.3],[-.3,.72],[.12,.55],[.58,.25],[.66,.9],[.35,1.9],[-.45,2.1],[-1.2,1.3]];function tp(e,t,n,r,i){let a=i*i,o=a*i;return .5*(2*t+(-e+n)*i+(2*e-5*t+4*n-r)*a+(-e+3*t-3*n+r)*o)}function np(e){let t=ep.length,n=e*t,r=Math.floor(n),i=n-r,a=e=>ep[(e%t+t)%t],o=tp(a(r-1)[0],a(r)[0],a(r+1)[0],a(r+2)[0],i),s=tp(a(r-1)[1],a(r)[1],a(r+1)[1],a(r+2)[1],i),c=e<.42?1:e<.52?1-(e-.42)/.1:e>.94?(e-.94)/.06:0,l=-(o+s);return{thigh:o,shin:s,foot:l*c+(l*.4+.45)*(1-c)}}var rp=class{ctx;aim;inventory;projectiles;id=Wf();team=`player`;alive=!0;material=`flesh`;lockable=!1;hurtboxes=[{a:new K,b:new K,radius:.36,tag:`body`}];stickRoot=new wn;motor;facing=0;maxHp=100;hp=100;stamina=100;exhausted=!1;staminaDelay=0;state=`move`;stateT=0;time=0;mainHand=`sword`;offHand=`shield`;pendingEquip=null;equipSwapDone=!1;equipTarget=null;attack=null;comboIndex=0;comboResetAt=0;buffered=null;attackPressAt=-10;attackHeld=!1;airAttackUsed=!1;chargeT=0;chargeReadyFired=!1;chargeLoop=null;flurryHits=0;jumpBufferedUntil=-10;jumpedSinceGround=!1;jumpCut=!1;guarding=!1;guardAmount=0;sneaking=!1;sneakAmount=0;climbN=new K;climbWall=new K;climbPhase=0;climbMove=0;climbDir=new W;climbJumpT=0;climbJumpDir=new W;climbTop=0;climbPushT=0;mantleFrom=new K;mantleTo=new K;mantleDur=.5;climbGrabT=0;climbGatherT=0;mantleH=1;mantleJerked=!1;landLagT=0;guardPressAt=-10;dodgeDir=new K;dodgeType=`hopL`;dodgeDur=.35;dodgeReadyAt=0;iFramesUntil=-1;iFramesFrom=-1;flurryWindowUntil=-1;bowDraw=0;bowLoop=null;hurtDir=new K;hurtDur=.4;respawnAt=0;spawnPoint=new K(0,0,6);lockTarget=null;anim=Qf();turnRate=0;lastFacing=0;sprinting=!1;airSpeed=0;airSprint=!1;swingAngle=0;swingPhase=`done`;swingU=0;recoilImpulse=0;shieldImpulse=0;tmp=new K;tmp2=new K;hand=new K;base=new K;tip=new K;bdir=new K;edge=new K;constructor(e,t,n,r){this.ctx=e,this.aim=t,this.inventory=n,this.projectiles=r,this.motor=new Cf(e.physics),this.motor.radius=.36,this.motor.height=1.75}get position(){return this.motor.position}get weapon(){let e=this.mainHand?tf[this.mainHand].weapon:void 0;return e?Ef[e]:null}get hasShield(){return this.offHand===`shield`&&this.mainHand!==`bow`&&this.mainHand!==`axe`&&this.mainHand!==`pickaxe`}get invulnerable(){return this.time>=this.iFramesFrom&&this.time<this.iFramesUntil}get inFlurryWindow(){return this.time<this.flurryWindowUntil}center(e){return e.copy(this.motor.position).setY(this.motor.position.y+1)}spawn(e,t=Math.PI){this.spawnPoint.copy(e),this.motor.teleport(e),this.facing=t,this.aim.yaw=t,this.hp=this.maxHp,this.stamina=this.ctx.tuning.staminaMax,this.alive=!0,this.setState(`move`)}cur(){return this.state}setState(e){this.state===`charge`&&e!==`charge`&&this.stopChargeLoop(),this.state===`bow`&&e!==`bow`&&this.stopBowLoop(),this.state=e,this.stateT=0}requestEquip(e){let t=`main`;if(e&&tf[e].kind===`shield`)t=`off`,e=this.offHand===`shield`?null:`shield`;else if(e&&!tf[e].weapon){this.ctx.events.emit(`toast`,{text:`${tf[e].name} ×${this.inventory.count(e)} (recurso)`,kind:`info`});return}(!e||this.inventory.has(e))&&(t!==`main`||e!==this.mainHand)&&(this.pendingEquip={item:e,slot:t})}tryStartEquip(){this.pendingEquip&&this.state===`move`&&(this.equipTarget=this.pendingEquip,this.pendingEquip=null,this.equipSwapDone=!1,this.attack=null,this.setState(`equip`),this.ctx.sound.play(`unequip`,{pos:this.position}))}applyEquipSwap(){let e=this.equipTarget;e.slot===`main`?this.mainHand=e.item:this.offHand=e.item,this.equipSwapDone=!0,this.comboIndex=0;let t=e.item?e.item===`bow`?`bow`:e.item===`shield`?`shield`:e.item===`sword`?`blade`:`tool`:`none`;e.item&&this.ctx.sound.play(`equip`,{pos:this.position,variant:t}),this.ctx.events.emit(`equip`,{item:e.item,slot:e.slot,kind:t})}receiveHit(e){let t=Hf(`flesh`);if(!this.alive)return t.ignored=!0,t;if(this.invulnerable)return this.state===`dodge`&&this.stateT<=this.ctx.tuning.perfectDodgeWindow+.05&&this.triggerPerfectDodge(),t.ignored=!0,t;let n=this.ctx.tuning;this.tmp.subVectors(e.origin,this.position).setY(0).normalize();let r=Rd(this.facing,this.tmp2),i=Math.acos(xd(this.tmp.dot(r),-1,1))*(180/Math.PI);if(this.guarding&&(this.hasShield||this.weapon!==null)&&this.mainHand!==`bow`&&i<=n.blockAngle){let r=this.time-this.guardPressAt;if(this.hasShield&&r<=n.parryWindow)return t.parried=!0,t.blocked=!0,t.material=`metal`,this.shieldImpulse=1.4,e.attacker?.onParried?.(),this.stamina=Math.min(n.staminaMax,this.stamina+10),t;t.blocked=!0,t.material=(this.hasShield,`metal`);let i=this.hasShield?1:this.weapon?.weaponGuard??.4;return t.damage=Math.round(e.damage*(1-i)),this.stamina-=n.blockStaminaCost+e.damage*.4,this.shieldImpulse=1,this.motor.velocity.addScaledVector(e.dir.clone().setY(0).normalize(),e.knockback*.45*n.knockbackMul),this.stamina<=0?(this.stamina=0,this.exhausted=!0,this.ctx.sound.play(`guardBreak`,{pos:this.position}),this.enterHurt(e,.7),t.damage=Math.round(e.damage*.5)):this.setState(`guardHit`),t.damage>0&&(this.hp-=t.damage),this.hp<=0&&this.die(),t}return t.damage=Math.round(e.damage),this.hp-=t.damage,this.enterHurt(e,.42),this.hp<=0&&(t.killed=!0,this.die()),t}enterHurt(e,t){this.cancelActions(),this.hurtDir.copy(e.dir).setY(0).normalize(),this.hurtDur=t,this.setState(`hurt`),this.iFramesFrom=this.time,this.iFramesUntil=this.time+.55;let n=e.knockback*this.ctx.tuning.knockbackMul;this.motor.velocity.x=this.hurtDir.x*n,this.motor.velocity.z=this.hurtDir.z*n,e.strength>.5&&(this.motor.velocity.y=3)}die(){this.hp=0,this.alive=!1,this.cancelActions(),this.setState(`dead`),this.respawnAt=this.time+3,this.lockTarget=null,this.sneaking=!1,this.ctx.events.emit(`playerDeath`,void 0)}cancelActions(){this.attack=null,this.chargeT=0,this.bowDraw=0,this.stopBowLoop(),this.stopChargeLoop(),this.buffered=null}stopBowLoop(){this.bowLoop?.stop(),this.bowLoop=null}stopChargeLoop(){this.chargeLoop?.stop(),this.chargeLoop=null}onParried(){}triggerPerfectDodge(){this.ctx.tuning.flurryEnabled&&!this.inFlurryWindow&&(this.flurryWindowUntil=this.time+1.6,this.ctx.clock.slowWorld(.12,1.9),this.ctx.events.emit(`perfectDodge`,{pos:this.position.clone()}))}canCancelAttack(){let e=this.attack;if(!e)return!0;let t=this.ctx.tuning,n=e.timing,r=this.stateT;return r<n.windup?e.def.cancelWindup:r<n.windup+n.active?!1:r-n.windup-n.active>=e.def.cancelAt*t.cancelWindowMul}remainingActionTime(){switch(this.state){case`attack`:return this.attack?this.attack.timing.total-this.stateT:0;case`dodge`:return this.dodgeDur-this.stateT;case`equip`:return(this.weapon?.equipTime??.25)-this.stateT;case`bowRecover`:return .22-this.stateT;case`hurt`:return this.hurtDur-this.stateT;case`guardHit`:return .25-this.stateT;case`stagger`:return .35-this.stateT;default:return 0}}tryClimb(e,t,n){let r=this.motor;if(t<.5||this.lockTarget){this.climbPushT=0;return}let i=Math.sin(n),a=Math.cos(n),o=r.radius+.3,s=this.ctx.physics,c=this.position,l=s.probeWall(c.x,c.z,c.y+1.1,i,a,o)??s.probeWall(c.x,c.z,c.y+.5,i,a,o);if(!l||i*-l.nx+a*-l.nz<.6){this.climbPushT=0;return}let u=l.top-c.y;if(u<=r.stepUp+.02)return;this.climbPushT+=e;let d=!r.grounded;u<=1.25?(d||this.climbPushT>.12)&&this.startMantle(l.x,l.z,l.nx,l.nz,l.top):d&&u<=2.15?this.startMantle(l.x,l.z,l.nx,l.nz,l.top):!this.exhausted&&this.stamina>1&&(d||this.climbPushT>.2)&&this.startClimb(l.x,l.z,l.nx,l.nz,l.top)}standUp(){!this.sneaking&&this.sneakAmount<.01||(this.sneaking=!1,this.sneakAmount=0,this.anim.sneakSnap=!0)}faceWall(e,t){this.facing=zd(-e,-t)}startClimb(e,t,n,r,i){this.cancelActions(),this.guarding=!1,this.sneaking=!1,this.climbN.set(n,0,r).normalize(),this.climbTop=i,this.climbWall.set(e,i,t),this.climbJumpT=0;let a=this.motor.radius*.85;this.position.x=e+n*a,this.position.z=t+r*a,this.motor.velocity.set(0,0,0),this.motor.grounded=!1,this.faceWall(n,r),this.setState(`climb`),this.climbGrabT=.35,this.ctx.tuning.shakeEnabled&&this.ctx.shake.add(.12),this.ctx.events.emit(`footstep`,{pos:this.position.clone(),surface:`stone`,intensity:.5,player:!0})}startMantle(e,t,n,r,i){this.cancelActions(),this.guarding=!1,this.mantleFrom.copy(this.position);let a=this.motor.radius+.22;this.mantleTo.set(e-n*a,i,t-r*a);let o=Math.max(0,i-this.position.y);this.mantleH=o,this.mantleDur=xd(.42+o*.3,.5,1.05),this.climbN.set(n,0,r).normalize(),this.climbWall.set(e,i,t),this.mantleJerked=!1,this.motor.velocity.set(0,0,0),this.faceWall(n,r),this.setState(`mantle`)}detachClimb(e,t){let n=this.climbN;this.motor.velocity.set(n.x*e,t,n.z*e),this.motor.grounded=!1,this.climbPushT=-.35,this.setState(`move`)}updateClimb(e){let t=this.ctx.tuning,n=this.ctx.input,r=this.ctx.physics,i=this.position,a=this.climbN;if(this.staminaDelay=Math.max(this.staminaDelay,.5),n.consume(`attack`),n.consume(`dodge`),n.consume(`sneak`))return this.detachClimb(1.2,0);let o=n.moveX,s=n.moveY,c=Math.hypot(o,s);if(c>1&&(o/=c,s/=c),n.wasPressed(`jump`)){if(s<-.5)return this.faceWall(-a.x,-a.z),this.detachClimb(5.5,5.5);this.climbJumpT<=0&&this.climbGatherT<=0&&this.stamina>=8&&(this.climbGatherT=.16,c<.2?this.climbJumpDir.set(0,1):this.climbJumpDir.set(o,s).normalize(),this.useStamina(t.dodgeCost*1.4),this.ctx.events.emit(`jump`,{pos:i.clone()}))}this.climbGatherT>0&&(this.climbGatherT-=e,this.climbGatherT<=0&&(this.climbJumpT=.32)),this.climbGrabT=Math.max(0,this.climbGrabT-e);let l=X(1-this.stamina/(t.staminaMax*.3)),u=(.28+1.45*Math.cos(this.climbPhase*Math.PI*2)**2)*(1-.35*l)*(this.climbGrabT>.15?.2:1),d=o*1.35*u,f=s*1.5*u;if(this.climbGatherT>0&&(d=0,f=-.25),this.climbJumpT>0){let t=this.climbJumpT/.32;d=this.climbJumpDir.x*6.5*t,f=this.climbJumpDir.y*7.5*t,this.climbJumpT-=e}let p=Math.hypot(d,f)>.1;if(this.climbMove=$(this.climbMove,+!!p,10,e),c>.2&&this.climbDir.lerp(new W(o,s),1-Math.exp(-e*8)),p&&this.climbJumpT<=0&&this.useStamina(9*e),this.stamina<=0)return this.exhausted=!0,this.detachClimb(.8,0);let m=zd(-a.x,-a.z),h=-Math.cos(m),g=Math.sin(m),_=i.x+h*d*e,v=i.z+g*d*e,y=(e,t,n)=>r.probeWall(e+a.x*.3,t+a.z*.3,n,-a.x,-a.z,.3+this.motor.radius+.4),b=Math.abs(d)>1e-4?y(_,v,i.y+1.1):null;b?(i.x=_,i.z=v):b=y(i.x,i.z,i.y+1.1),i.y+=f*e;let x=r.groundHeight(i.x+a.x*.1,i.z+a.z*.1,i.y,.05);if(i.y<=x.y+.02&&(i.y=x.y,s<-.3||!b)){this.motor.grounded=!0,this.climbPushT=-.4,this.setState(`move`);return}if(b=y(i.x,i.z,i.y+1.1)??y(i.x,i.z,i.y+.4),!b)return this.detachClimb(.5,0);a.lerp(new K(b.nx,0,b.nz),1-Math.exp(-e*20)).normalize();let S=this.motor.radius*.85;if(i.x=b.x+b.nx*S,i.z=b.z+b.nz*S,this.climbTop=b.top,this.climbWall.set(b.x,b.top,b.z),this.faceWall(a.x,a.z),this.climbPhase+=(Math.abs(s)*1.5+Math.abs(o)*1.35)*(1-.35*l)*e/.95,this.climbTop-i.y<1.3&&f>=-.05)return this.startMantle(b.x,b.z,b.nx,b.nz,this.climbTop);this.motor.velocity.set(0,0,0),this.motor.grounded=!1,this.motor.timeSinceGrounded=0}updateMantle(e){let t=X(this.stateT/this.mantleDur),n=this.mantleFrom,r=this.mantleTo,i=.22,a=X((t-i)/.3),o=1-(1-a)**3,s=Math.sin(a*Math.PI)*.07*Math.min(1,this.mantleH),c=Math.min(1,o),l=Math.sin(X(t/i)*Math.PI*.5)*.09*Math.min(1,this.mantleH)*(1-a);t>=i&&!this.mantleJerked&&(this.mantleJerked=!0,this.ctx.events.emit(`mantlePull`,{pos:this.position.clone(),intensity:Math.min(1,this.mantleH/1.8)}));let u=X((t-.5)/.4),d=u*u*(3-2*u);this.position.set(Z(n.x,r.x,d),Z(n.y,r.y+.04,c)+s-l,Z(n.z,r.z,d)),this.motor.velocity.set(0,0,0),this.staminaDelay=Math.max(this.staminaDelay,.2),t>=1&&(this.position.copy(r),this.motor.grounded=!0,this.motor.groundY=r.y,this.motor.timeSinceGrounded=0,this.climbPushT=0,this.setState(`move`),this.ctx.events.emit(`land`,{pos:this.position.clone(),intensity:.25,surface:this.motor.surface,player:!0}))}switchLock(e){if(!this.lockTarget)return!1;let t=this.ctx.combat.findSideTarget(this.position,this.lockTarget,e,20,`player`);return t&&(this.lockTarget=t),!!t}pickFacingForAttack(){let e=this.ctx.tuning;if(this.aim.firstPerson){this.facing=this.aim.yaw;return}if(this.lockTarget){this.lockTarget.center(this.tmp).sub(this.position),this.facing=zd(this.tmp.x,this.tmp.z);return}let t=this.ctx.input;if(Math.hypot(t.moveX,t.moveY)>.2){this.facing=this.inputYaw();return}if(e.lockOnAssist){let e=this.ctx.combat.findLockTarget(this.position,Rd(this.facing,this.tmp2),3.2,75,`player`);e&&(e.center(this.tmp).sub(this.position),this.facing=zd(this.tmp.x,this.tmp.z))}}inputYaw(){let e=this.ctx.input;return this.aim.yaw+Math.atan2(-e.moveX,e.moveY)}startAttack(e,t=!1){let n=this.weapon,r=t?this.ctx.tuning.chargeCost:e.stamina??0;if(r>0&&this.stamina<r)return this.ctx.sound.play(`exhausted`,{pos:this.position}),this.ctx.events.emit(`toast`,{text:`Stamina insuficiente`,kind:`warn`}),!1;r>0&&this.useStamina(r),this.standUp(),this.pickFacingForAttack();let i=this.ctx.tuning;return this.attack={def:e,weapon:n,timing:Df(e,i.attackSpeedMul,i.recoveryMul),yaw:this.facing,hitSet:new Set,prevT:0,swung:!1,hitAny:!1,charged:t,wallHit:!1,aimPitch:e.spin?0:this.attackAimPitch()},this.setState(`attack`),this.buffered=null,!0}startComboAttack(){let e=this.weapon;if(!e||e.combo.length===0)return;if(!this.motor.grounded&&(this.jumpedSinceGround||this.motor.timeSinceGrounded>.1)&&e.air){if(this.airAttackUsed)return;if(this.airAttackUsed=!0,this.startAttack(Tf[e.air])&&this.attack){this.attack.air=!0,this.attackHeld=!1,this.attackPressAt=-1e9;let e=this.motor.velocity;e.y=Math.max(e.y,3.2),this.airSpeed=Math.max(this.airSpeed*.9,2.2)}return}this.time>this.comboResetAt&&(this.comboIndex=0);let t=e.combo[this.comboIndex%e.combo.length];this.startAttack(Tf[t])&&(this.comboIndex=(this.comboIndex+1)%e.combo.length)}startFlurry(){this.flurryHits=0,this.flurryWindowUntil=-1,this.nextFlurrySwing()}nextFlurrySwing(){let e=Tf[this.flurryHits%2==0?`flurryA`:`flurryB`];if(this.startAttack(e),this.attack&&(this.attack.flurry=!0),this.lockTarget||this.flurryHits===0){let e=this.lockTarget??this.ctx.combat.findLockTarget(this.position,Rd(this.facing,this.tmp2),6,100,`player`);if(e){e.center(this.tmp).sub(this.position).setY(0);let t=this.tmp.length();this.facing=zd(this.tmp.x,this.tmp.z),this.attack&&(this.attack.yaw=this.facing),t>1.3&&this.motor.velocity.addScaledVector(this.tmp.normalize(),Math.min(14,(t-1.2)*10))}}this.flurryHits++}startCharge(){this.standUp(),this.attack=null,this.chargeT=0,this.chargeReadyFired=!1,this.setState(`charge`),this.chargeLoop=this.ctx.sound.loop(`charge`),this.ctx.events.emit(`chargeStart`,{pos:this.position.clone()})}useStamina(e){this.stamina=Math.max(0,this.stamina-e),this.staminaDelay=.7,this.stamina<=.01&&(this.exhausted=!0,this.ctx.sound.play(`exhausted`,{pos:this.position}))}canDodge(){return(this.motor.grounded||this.motor.timeSinceGrounded<this.ctx.tuning.coyoteTime)&&this.time>=this.dodgeReadyAt&&!this.exhausted&&this.stamina>=this.ctx.tuning.dodgeCost*.5}startDodge(){let e=this.ctx.tuning,t=this.ctx.input,n=Math.hypot(t.moveX,t.moveY)>.25,r=Math.abs(t.moveX)>.3;if(n&&t.moveY>.25&&!r)return;this.cancelActions(),this.guarding=!1;let i=this.lockTarget?this.facing:this.aim.yaw,a,o,s;!n||t.moveY<-.5?(a=`back`,o=i+Math.PI,s=1.35):(a=t.moveX<0?`hopL`:`hopR`,o=i+(t.moveX<0?Math.PI/2:-Math.PI/2),s=.85),this.lockTarget||(this.facing=i),this.dodgeType=a,Rd(o,this.dodgeDir),this.dodgeDur=e.dodgeDuration*s,this.setState(`dodge`),this.iFramesUntil=this.time+e.dodgeIFrameEnd*s,this.iFramesFrom=this.time+e.dodgeIFrameStart,this.useStamina(e.dodgeCost),a===`back`?this.motor.velocity.y=6.6:(a===`hopL`||a===`hopR`||a===`hopF`)&&(this.motor.velocity.y=4.2),this.ctx.events.emit(`dodge`,{pos:this.position.clone()});for(let t of this.ctx.threats())if(t.isThreatening(this.position,e.perfectDodgeWindow+.1)){this.triggerPerfectDodge();break}}startBow(){if(this.inventory.count(`arrow`)<=0){this.ctx.sound.play(`noAmmo`),this.ctx.events.emit(`noAmmo`,void 0),this.ctx.events.emit(`toast`,{text:`Sem flechas!`,kind:`warn`});return}this.bowDraw=0,this.standUp(),this.setState(`bow`),this.bowLoop=this.ctx.sound.loop(`bowDraw`)}bowOrigin(e){let t=Math.cos(this.aim.pitch);return this.tmp2.set(Math.sin(this.aim.yaw)*t,Math.sin(this.aim.pitch),Math.cos(this.aim.yaw)*t),e.copy(this.position),e.y+=1.47,e.addScaledVector(this.tmp2,.7),e.x+=-Math.cos(this.aim.yaw)*.2,e.z+=Math.sin(this.aim.yaw)*.2,e}fireBow(){let e=this.ctx.tuning,t=this.bowDraw;if(this.stopBowLoop(),t<.12){this.setState(`move`);return}if(!this.inventory.remove(`arrow`,1)){this.setState(`move`);return}let n=this.aim.aimPoint(new K),r=this.bowOrigin(new K);if(this.aim.firstPerson){let e=new K,t=new K;this.aim.aimRay(e,t),r.copy(e).addScaledVector(t,.6)}let i=Z(16,58,t**1.2),a=ip(r,n,i,this.projectiles.gravity),o=Z(6,24,t)*e.damageMul;this.projectiles.fire(r,a.multiplyScalar(i),`player`,this,o,t),this.ctx.events.emit(`bowFire`,{pos:r,power:t}),this.recoilImpulse=.4+t*.6,this.bowDraw=0,this.setState(`bowRecover`)}update(e){let t=this.ctx,n=t.tuning,r=t.input;if(this.time+=e,this.stateT+=e,e<=0){this.captureFrozenInput();return}if(this.state===`dead`){this.motor.velocity.x=$(this.motor.velocity.x,0,6,e),this.motor.velocity.z=$(this.motor.velocity.z,0,6,e),this.motor.velocity.y-=n.gravity*e,this.motor.update(e),this.time>this.respawnAt&&(this.spawn(this.spawnPoint,this.facing),t.events.emit(`playerRespawn`,void 0)),this.buildAnim(e);return}for(let e=0;e<6;e++)r.consume(`slot${e+1}`)&&(this.inventory.select(e),this.requestEquip(this.inventory.hotbar[e]));if(r.consume(`nextItem`)||r.consume(`prevItem`)){let e=r.wasReleased(`prevItem`)?-1:1,t=this.inventory.hotbar;for(let n=1;n<=t.length;n++){let r=(this.inventory.selected+e*n+t.length*2)%t.length,i=t[r];if(i&&tf[i].weapon){this.inventory.select(r),this.requestEquip(i);break}}}if(r.consume(`lock`)){if(this.lockTarget)this.lockTarget=null;else{let e=Rd(this.aim.yaw,this.tmp2);this.lockTarget=t.combat.findLockTarget(this.position,e,18,70,`player`),this.lockTarget||this.aim.recenter()}}if(this.lockTarget){if(this.lockTarget.center(this.tmp),this.lockTarget.alive)this.tmp.distanceTo(this.position)>26&&(this.lockTarget=null);else{let e=Rd(this.aim.yaw,this.tmp2);this.lockTarget=t.combat.findLockTarget(this.position,e,18,90,`player`)}}if(this.staminaDelay-=e,this.staminaDelay<=0&&!this.sprinting&&(this.stamina=Math.min(n.staminaMax,this.stamina+n.staminaRegen*e*(this.exhausted?.8:1))),this.exhausted&&this.stamina>=n.staminaMax*.999&&(this.exhausted=!1),this.state===`climb`||this.state===`mantle`){this.state===`climb`?this.updateClimb(e):this.updateMantle(e),this.buildAnim(e);return}let i=r.consume(`attack`),a=r.wasReleased(`attack`);r.consume(`sneak`)&&(this.sneaking=!this.sneaking),this.sneaking&&(r.wasPressed(`sprint`)||r.runLock&&Math.hypot(r.moveX,r.moveY)>.3||r.wasPressed(`jump`)||this.state===`dodge`)&&(this.sneaking=!1),this.sneakAmount=$(this.sneakAmount,+!!this.sneaking,8,e);let o=!!this.lockTarget,s=r.consume(`dodge`),c=r.moveY>.25&&Math.abs(r.moveX)<=.3,l=o&&!c,u=o&&(s||l&&r.wasPressed(`jump`)),d=r.wasPressed(`guard`),f=r.isHeld(`guard`);i&&(this.attackPressAt=this.time,this.attackHeld=!0),r.isHeld(`attack`)||(this.attackHeld=!1),d&&(this.guardPressAt=this.time),r.wasPressed(`jump`)&&!l&&(this.jumpBufferedUntil=this.time+n.jumpBuffer),r.wasReleased(`jump`)&&this.motor.velocity.y>0&&this.jumpedSinceGround&&!this.jumpCut&&(this.motor.velocity.y*=n.jumpCutMul,this.jumpCut=!0);let p=n.attackBuffer;switch(i&&this.state!==`move`&&this.state!==`bow`&&this.state!==`charge`&&(this.remainingActionTime()<=p||this.state===`attack`&&this.inChainWindow())&&(this.buffered={kind:`attack`,t:this.time}),u&&this.state!==`move`&&!this.dodgeAllowedNow()&&this.remainingActionTime()<=p&&(this.buffered={kind:`dodge`,t:this.time}),this.buffered&&this.time-this.buffered.t>p+.1&&(this.buffered=null),this.guarding=!1,this.state){case`move`:{let e=i||this.buffered?.kind===`attack`;if((u||this.buffered?.kind===`dodge`)&&this.canDodge()){this.buffered=null,this.startDodge();break}if(this.pendingEquip&&(this.tryStartEquip(),this.cur()===`equip`)||e&&(this.buffered=null,this.mainHand===`bow`?this.startBow():this.inFlurryWindow&&this.weapon?this.startFlurry():this.weapon&&this.startComboAttack(),this.cur()!==`move`))break;if(this.attackHeld&&this.weapon?.charged&&this.time-this.attackPressAt>.3&&this.motor.grounded&&this.landLagT<=0){this.startCharge();break}this.guarding=f&&this.mainHand!==`bow`&&(this.hasShield||!!this.weapon);break}case`attack`:{let e=this.attack,t=e.timing,n=this.stateT-t.windup-t.active,r=e.flurry;if((u||this.buffered?.kind===`dodge`)&&this.canCancelAttack()&&this.canDodge()&&!r){this.buffered=null,this.startDodge();break}if(d&&this.canCancelAttack()&&!r){this.attack=null,this.setState(`move`),this.guarding=!0;break}if(r){this.stateT>=t.total&&(this.flurryHits<6?this.nextFlurrySwing():(this.ctx.clock.slowWorld(1,.01),this.attack=null,this.setState(`move`)));break}if(this.attackHeld&&n>=0&&this.time-this.attackPressAt>.3&&e.weapon.charged&&!e.charged&&this.motor.grounded&&e.def.id!==e.weapon.air){this.startCharge();break}if(this.buffered?.kind===`attack`&&n>=e.def.chainAt&&e.def.next&&!e.charged&&!this.pendingEquip){this.buffered=null,this.comboResetAt=this.time+.5,this.startComboAttack();break}this.stateT>=t.total&&(this.comboResetAt=this.time+.35,(!e.def.next||e.charged)&&(this.comboIndex=0),this.attack=null,this.setState(`move`));break}case`charge`:{if(!this.motor.grounded&&this.motor.timeSinceGrounded>.15){this.setState(`move`);break}this.chargeT+=e;let i=this.chargeT>=n.chargeTime;if(this.chargeLoop?.set(X(this.chargeT/n.chargeTime)),i&&!this.chargeReadyFired&&(this.chargeReadyFired=!0,t.events.emit(`chargeReady`,{pos:this.position.clone().setY(this.position.y+1.2)})),u&&this.canDodge()){this.startDodge();break}if(d){this.setState(`move`);break}if(!r.isHeld(`attack`)||a){let e=this.weapon;i&&e?.charged?(this.startAttack(Tf[e.charged],!0),this.cur()!==`attack`&&this.setState(`move`)):this.setState(`move`),this.chargeT=0}break}case`dodge`:this.stateT>=this.dodgeDur&&(this.dodgeReadyAt=this.time+n.dodgeCooldown,this.setState(`move`));break;case`bow`:if(u&&this.canDodge()){this.startDodge();break}if(d){this.bowDraw=0,this.setState(`move`),t.sound.play(`unequip`,{pos:this.position});break}this.bowDraw=Math.min(1,this.bowDraw+e/.85),this.bowLoop?.set(this.bowDraw),this.facing=this.aim.yaw,r.isHeld(`attack`)||this.fireBow();break;case`bowRecover`:this.stateT>=.22&&(this.setState(`move`),this.buffered?.kind===`attack`&&r.isHeld(`attack`)&&(this.buffered=null,this.startBow()));break;case`equip`:{let e=this.equipTarget?.slot===`off`?.22:this.equipTarget?.item?Ef[tf[this.equipTarget.item].weapon??`sword`]?.equipTime??.25:.2;!this.equipSwapDone&&this.stateT>=e*.5&&this.applyEquipSwap(),this.stateT>=e&&(this.setState(`move`),this.equipTarget=null);break}case`hurt`:this.stateT>=this.hurtDur&&this.setState(`move`);break;case`guardHit`:this.guarding=f,this.stateT>=.25&&this.setState(`move`);break;case`stagger`:this.stateT>=.35&&(this.attack=null,this.setState(`move`))}this.updateMovement(e),this.updateAttackHits();let m=this.projectiles.collectNear(this.position,.9);m>0&&(this.inventory.add(`arrow`,m),t.events.emit(`pickup`,{item:`arrow`,count:m,pos:this.position.clone().setY(this.position.y+.3)}));let h=this.position,g=this.state===`dodge`&&this.dodgeType===`flip`?.75:1;this.hurtboxes[0].a.set(h.x,h.y+.35,h.z),this.hurtboxes[0].b.set(h.x,h.y+1.45*g,h.z),this.guardAmount=$(this.guardAmount,this.guarding||this.state===`guardHit`?1:0,22,e),this.buildAnim(e)}captureFrozenInput(){let e=this.ctx.input,t=this.ctx.tuning;e.consume(`attack`)&&(this.attackPressAt=this.time,this.attackHeld=!0,this.buffered={kind:`attack`,t:this.time}),e.isHeld(`attack`)||(this.attackHeld=!1);let n=!!this.lockTarget,r=e.consume(`dodge`),i=n&&!(e.moveY>.25&&Math.abs(e.moveX)<=.3);n&&(r||i&&e.wasPressed(`jump`))&&(this.buffered={kind:`dodge`,t:this.time}),e.wasPressed(`guard`)&&(this.guardPressAt=this.time),e.wasPressed(`jump`)&&!i&&(this.jumpBufferedUntil=this.time+t.jumpBuffer)}inChainWindow(){let e=this.attack;return e?this.stateT-e.timing.windup-e.timing.active>=-e.timing.active:!1}dodgeAllowedNow(){return this.state===`attack`&&this.canCancelAttack()}updateMovement(e){let t=this.ctx,n=t.tuning,r=t.input,i=this.motor,a=i.velocity;this.landLagT=Math.max(0,this.landLagT-e);let o=Math.min(1,Math.hypot(r.moveX,r.moveY)),s=this.inputYaw(),c=(r.isHeld(`sprint`)||r.runLock)&&o>.3&&!this.exhausted&&!this.lockTarget,l=0,u=!0,d=`move`,f=n.acceleration,p=n.deceleration;switch(this.sprinting=!1,this.state){case`move`:if(this.guarding){if(l=n.walkSpeed*.95,d=this.lockTarget?`lock`:`aim`,!this.lockTarget&&n.lockOnAssist&&!this.aim.firstPerson){let r=t.combat.findLockTarget(this.position,Rd(this.aim.yaw,this.tmp2),4.5,80,`player`);r&&r.team===`enemy`&&(r.center(this.tmp).sub(this.position),this.facing=Td(this.facing,zd(this.tmp.x,this.tmp.z),n.turnSpeed,e),d=`none`)}}else l=n.walkSpeed*Math.min(1,o/.8)*(this.exhausted?.75:1),this.landLagT>0&&(l*=.15),this.sneaking?l*=.55:c&&i.grounded&&(l=n.runSpeed,this.sprinting=!0,this.useStamina(n.sprintCost*e),this.staminaDelay=.5),d=this.lockTarget?`lock`:`move`;break;case`charge`:l=n.walkSpeed*.55,d=this.lockTarget?`lock`:`aim`;break;case`bow`:case`bowRecover`:l=n.walkSpeed*.7,d=`aim`;break;case`equip`:l=n.walkSpeed,d=this.lockTarget?`lock`:`move`;break;case`attack`:{u=!1,d=`none`;let n=this.attack,r=this.stateT,o=n.timing;if(n.air){let t=Rd(n.yaw,this.tmp),s=n.slammed?0:this.airSpeed;a.x=Ed(a.x,t.x*s,p*e*.5),a.z=Ed(a.z,t.z*s,p*e*.5),r>=o.windup&&!n.plunged&&!i.grounded&&(n.plunged=!0,a.y=Math.min(a.y,-11)),this.facing=Td(this.facing,n.yaw,30,e);break}let s=0;r<o.windup+o.active&&(s=n.def.lunge*(r<o.windup?.6:1));let c=Rd(n.yaw,this.tmp);s>0&&t.combat.findLockTarget(this.position,c,1.1,60,`player`)&&(s=0);let l=c.x*s,f=c.z*s;a.x=Ed(a.x,l,p*e*1.2),a.z=Ed(a.z,f,p*e*1.2),this.facing=Td(this.facing,n.yaw,30,e);break}case`dodge`:{u=!1,d=`none`;let e=X(this.stateT/this.dodgeDur),t=n.dodgeDistance*(this.dodgeType===`back`?1.15:this.dodgeType===`flip`?.9:this.dodgeType===`hopF`?.75:1)/this.dodgeDur*(1.4-.8*e);a.x=this.dodgeDir.x*t,a.z=this.dodgeDir.z*t;break}case`hurt`:case`guardHit`:case`stagger`:u=!1,d=`none`,a.x=$(a.x,0,7,e),a.z=$(a.z,0,7,e)}if(i.grounded?(this.airSpeed=Math.hypot(a.x,a.z),this.airSprint=this.sprinting):u&&this.state===`move`&&!this.guarding&&(l=Math.max(l,this.airSpeed),this.sprinting=this.airSprint),u){i.grounded||(f*=n.airControl);let t=o>.05?Math.sin(s)*l:0,r=o>.05?Math.cos(s)*l:0,c=Math.hypot(a.x,a.z),u=Math.hypot(t,r)>c+.01?f:i.grounded?p:p*n.airControl,d=t-a.x,m=r-a.z,h=Math.hypot(d,m),g=u*e;h<=g?(a.x=t,a.z=r):(a.x+=d/h*g,a.z+=m/h*g)}let m=n.turnSpeed;this.aim.firstPerson&&this.state!==`dodge`?this.facing=this.aim.yaw:d===`move`&&o>.1?this.facing=Td(this.facing,s,m,e):d===`aim`?this.facing=Td(this.facing,this.aim.yaw,m*1.3,e):d===`lock`&&this.lockTarget&&(this.lockTarget.center(this.tmp).sub(this.position),Math.hypot(this.tmp.x,this.tmp.z)>.6&&(this.facing=Td(this.facing,zd(this.tmp.x,this.tmp.z),m,e))),this.facing=Cd(this.facing),this.turnRate=wd(this.lastFacing,this.facing)/e,this.lastFacing=this.facing,i.grounded&&(this.jumpedSinceGround=!1,this.jumpCut=!1,this.airAttackUsed=!1);let h=this.state===`move`||this.state===`equip`,g=i.grounded||i.timeSinceGrounded<=n.coyoteTime&&!this.jumpedSinceGround&&a.y<=.01;if(this.time<this.jumpBufferedUntil&&g&&h&&(a.y=Math.sqrt(2*n.gravity*n.jumpHeight),i.grounded=!1,this.jumpedSinceGround=!0,this.jumpBufferedUntil=-10,this.ctx.events.emit(`jump`,{pos:this.position.clone()}),this.ctx.input.isHeld(`jump`)||(a.y*=Math.max(n.jumpCutMul,.7),this.jumpCut=!0)),!i.grounded||a.y>0){let t=a.y<0?n.fallGravityMul:1,r=this.state===`attack`&&this.attack?.air?this.attack:null,i=r?this.stateT<r.timing.windup?.3:1.6:1;a.y-=n.gravity*t*i*e,a.y=Math.max(a.y,-40)}if(i.update(e),this.state===`move`&&!this.guarding&&this.tryClimb(e,o,s),i.landedThisFrame&&this.state===`attack`&&this.attack?.air&&!this.attack.slammed){let e=this.attack;e.slammed=!0,a.x*=.2,a.z*=.2,this.ctx.events.emit(`land`,{pos:this.position.clone(),intensity:.85,surface:i.surface,player:!0}),this.ctx.shake.add(.35)}else if(i.landedThisFrame){let e=X((i.landSpeed-3)/14);e>.45&&(this.landLagT=.12+.4*(e-.45)),this.ctx.events.emit(`land`,{pos:this.position.clone(),intensity:e,surface:i.surface,player:!0})}}updateAttackHits(){let e=this.attack;if(!e||this.state!==`attack`){this.swingPhase=`done`;return}let t=this.ctx.tuning,n=e.timing,r=this.stateT,i=Of(e.def,n,r);this.swingAngle=i.angle,this.swingPhase=i.phase,this.swingU=i.u,!e.swung&&r>=n.windup&&(e.swung=!0,this.ctx.events.emit(`swing`,{pos:this.position.clone().setY(this.position.y+1.3),intensity:e.def.whoosh,source:`player`}));let a=Math.max(e.prevT,n.windup),o=Math.min(r,n.windup+n.active);if(e.prevT=r,o<=a||e.wallHit){r>n.windup+n.active&&!e.hitAny&&!e.missed&&(e.missed=!0,this.ctx.events.emit(`miss`,{pos:this.position.clone(),intensity:e.def.strength}));return}let s=Of(e.def,n,a).angle,c=Of(e.def,n,o).angle,l=Math.max(1,Math.ceil(Math.abs(c-s)/6));for(let r=1;r<=l;r++){let i=a+(o-a)*r/l,s=Of(e.def,n,i).angle;Vf(e.def,e.weapon,s,t.rangeMul,this.position,e.yaw,1,this.hand,this.base,this.tip,this.bdir,this.edge,e.aimPitch);let c=this.ctx.combat.querySegment(this.base,this.tip,e.weapon.hitRadius,`player`,e.hitSet);for(let n of c){e.hitSet.add(n.target.id),e.hitAny=!0;let r={attacker:this,team:`player`,tool:e.weapon.tool,damage:e.def.damage*t.damageMul,strength:e.def.strength,knockback:e.def.knockback,point:n.point,dir:this.edge.clone(),normal:n.normal,hurtbox:n.hurtbox,projectile:!1,charged:e.charged,origin:this.position.clone(),unblockable:!!e.flurry},i=n.target.receiveHit(r);if(this.ctx.events.emit(`hit`,{hit:r,result:i,target:n.target,source:`player`}),e.flurry&&this.ctx.events.emit(`flurryHit`,{pos:n.point}),i.deflected){this.bounce();return}t.weaponRecoil&&(this.recoilImpulse=.35+e.def.strength*.8)}}}attackAimPitch(){let e;return this.lockTarget?(this.lockTarget.center(this.tmp).sub(this.position),e=Math.atan2(this.tmp.y-1.3,Math.max(.8,Math.hypot(this.tmp.x,this.tmp.z)))):e=this.aim.firstPerson?this.aim.pitch:this.aim.pitch+.15,xd(e,-.7,.9)}bounce(){this.ctx.tuning.weaponRecoil&&(this.recoilImpulse=1.4),this.attack&&(this.attack.wallHit=!0),this.setState(`stagger`),this.motor.velocity.addScaledVector(Rd(this.facing,this.tmp),-3)}buildAnim(e){let t=this.anim,n=this.motor.velocity;switch(t.speed=Math.hypot(n.x,n.z),t.runSpeed=this.ctx.tuning.runSpeed,t.walkSpeed=this.ctx.tuning.walkSpeed,t.moveAngle=t.speed>.2?wd(this.facing,zd(n.x,n.z)):0,t.sneak=this.sneaking,t.strafing=this.state!==`dodge`&&(this.aim.firstPerson||!!this.lockTarget||this.guarding||this.state===`bow`||this.state===`bowRecover`||this.state===`charge`),t.grounded=this.motor.grounded,t.vy=n.y,t.turnRate=this.turnRate,t.guard=this.guardAmount,t.exhausted=this.exhausted,t.sprinting=this.sprinting,t.aimPitch=this.aim.pitch,t.crouch=$(t.crouch,this.state===`charge`?.55:this.guarding?.25:0,12,e),t.attackTwist=0,t.attackMotion=0,t.attackWork=void 0,t.attackAir=!1,t.attackSpin=!1,t.climbPhase=this.climbPhase,t.climbMove=this.climbMove,t.climbDirX=this.climbDir.x,t.climbDirY=this.climbDir.y,t.climbJump=this.state===`climb`?X(this.climbJumpT/.32)-X(this.climbGatherT/.16):0,t.climbGrab=X(this.climbGrabT/.35),t.climbTired=this.state===`climb`?X(1-this.stamina/(this.ctx.tuning.staminaMax*.3)):0,t.spinYaw=0,t.action={move:`none`,attack:`attack`,charge:`charge`,dodge:`dodge`,bow:`bow`,bowRecover:`bow`,climb:`climb`,mantle:`mantle`,equip:`equip`,hurt:`hurt`,stagger:`guardHit`,guardHit:`guardHit`,dead:`dead`}[this.state],t.actionT=this.stateT,t.actionU=0,this.state===`mantle`&&(t.actionU=X(this.stateT/this.mantleDur)),this.state){case`attack`:{let e=this.attack;t.actionU=X(this.stateT/e.timing.total),t.attackTwist=-(this.swingAngle*Math.PI/180)*e.def.bodyTwist*.6;let n=this.swingU,r;r=this.swingPhase===`windup`?-.9*(1-(1-n)*(1-n)):this.swingPhase===`active`?-.9+1.9*(1-(1-n)*(1-n)):1-n*n*(3-2*n),t.attackBody=r,t.attackSide=Math.sign(e.def.arc[1]-e.def.arc[0])*(e.def.roll>60?0:1),t.attackMotion=e.def.bodyMotion??0,t.attackOverhead=!!e.def.overhead,t.attackWork=e.def.work,t.attackAir=!!e.air&&!e.slammed,t.attackSpin=!!e.def.spin,e.def.spin&&(t.spinYaw=(60-this.swingAngle)*Math.PI/180,t.attackTwist=0);break}case`charge`:{t.attackMotion=0;let e=this.weapon?.charged?Tf[this.weapon.charged]:null;t.attackWork=e?.work,t.attackSpin=!!e?.spin,t.attackBody=-.9,t.actionU=X(this.chargeT/this.ctx.tuning.chargeTime),t.attackTwist=e?.work?0:.5;break}case`dodge`:t.actionU=X(this.stateT/this.dodgeDur),t.dodgeType=this.dodgeType;break;case`equip`:t.actionU=X(this.stateT/.3);break;case`hurt`:{t.actionU=X(this.stateT/this.hurtDur);let e=Rd(this.facing,this.tmp);t.hurtZ=this.hurtDir.dot(e)*-1,t.hurtX=this.hurtDir.x*e.z-this.hurtDir.z*e.x;break}case`stagger`:case`guardHit`:t.actionU=X(this.stateT/.3);break;case`dead`:t.actionU=X(this.stateT/1);break;case`bow`:t.bowDraw=this.bowDraw}this.state!==`bow`&&(t.bowDraw=$(t.bowDraw,0,20,e))}swingPose(e,t){return this.state===`attack`&&this.attack?(Pf(this.attack.def,this.swingAngle,e,t,this.attack.aimPitch),this.attack.def):null}};function ip(e,t,n,r){let i=new K().subVectors(t,e),a=i.y,o=Math.hypot(i.x,i.z),s=n*n,c=s*s-r*(r*o*o+2*a*s);if(o<.01||o>100||c<0)return i.normalize();let l=Math.atan2(s-Math.sqrt(c),r*o);return new K(i.x/o*Math.cos(l),Math.sin(l),i.z/o*Math.cos(l)).normalize()}var ap=new K,op=new K,sp=new K,cp=new K,lp=new K,up=new K,dp=new K,fp=new K,pp=new K(0,-1,0),mp=new G,hp=new G,gp=new G,_p=new G,vp=new G;function yp(e,t,n,r,i,a,o=1){if(o<=.001)return;e.parent.updateWorldMatrix(!0,!1),e.getWorldPosition(ap);let s=e.parent.getWorldScale(sp).x,c=n*s,l=r*s;op.copy(i),cp.subVectors(op,ap);let u=cp.length();u=Math.min(Math.max(u,Math.abs(c-l)+.001),c+l-1e-4),cp.normalize();let d=(c*c+u*u-l*l)/(2*c*u),f=Math.acos(Math.min(1,Math.max(-1,d)));sp.subVectors(a,ap),lp.crossVectors(cp,sp),lp.lengthSq()<1e-8&&lp.set(1,0,0),lp.normalize(),up.copy(cp).applyAxisAngle(lp,f),fp.copy(ap).addScaledVector(up,c),dp.subVectors(op.copy(ap).addScaledVector(cp,u),fp).normalize(),e.parent.getWorldQuaternion(mp),hp.setFromUnitVectors(pp,up),gp.copy(mp).invert().multiply(hp),vp.copy(e.quaternion),e.quaternion.copy(vp).slerp(gp,o),e.updateWorldMatrix(!1,!1),e.getWorldQuaternion(_p),hp.setFromUnitVectors(pp,dp),gp.copy(_p).invert().multiply(hp),vp.copy(t.quaternion),t.quaternion.copy(vp).slerp(gp,o),t.updateWorldMatrix(!1,!0)}var bp=.43,xp=.42,Sp=class{physics;offL=0;offR=0;pelvis=0;w=0;flat=.5;p=new K;t=new K;pole=new K;fwd=new K;qRoot=new G;qFoot=new G;qParent=new G;constructor(e){this.physics=e}update(e,t,n,r=.5,i=!1){if(this.flat=r,e<=0)return;if(this.w=i?0:n?$(this.w,1,8,e):$(this.w,0,25,e),this.w<.01){this.offL=this.offR=0,this.pelvis=$(this.pelvis,0,20,e),t.body.position.y+=this.pelvis;return}let a=t.root;a.updateMatrixWorld(!0);let o=a.position.y,s=t.joints,c=e=>{e.getWorldPosition(this.p);let t=this.physics.groundHeight(this.p.x,this.p.z,o+.2,0,0);return Number.isFinite(t.y)?xd(t.y-o,-.3,0):0};this.offL=$(this.offL,c(s.footL)*this.w,12,e),this.offR=$(this.offR,c(s.footR)*this.w,12,e),this.pelvis=$(this.pelvis,Math.min(this.offL,this.offR,0),14,e),t.body.position.y+=this.pelvis,a.updateMatrixWorld(!0),a.getWorldQuaternion(this.qRoot),this.fwd.set(0,0,1).applyQuaternion(this.qRoot),this.leg(s.thighL,s.shinL,s.footL,this.offL-this.pelvis),this.leg(s.thighR,s.shinR,s.footR,this.offR-this.pelvis)}leg(e,t,n,r){Math.abs(r)>.004&&(n.getWorldPosition(this.t),this.t.y+=r,e.getWorldPosition(this.pole),this.pole.addScaledVector(this.fwd,1),this.pole.y-=.3,yp(e,t,bp,xp,this.t,this.pole,1)),n.parent.updateWorldMatrix(!0,!1),n.parent.getWorldQuaternion(this.qParent),this.qFoot.copy(this.qParent).invert().multiply(this.qRoot);let i=Math.abs(r)>.004?1:this.flat;n.quaternion.slerp(this.qFoot,i*this.w)}},Cp=class{mesh;max;bases=[];tips=[];ages=[];geo;pos;alpha;emitting=!1;lifetime=.14;color=new q(16777215);mat;constructor(e=24){this.max=e,this.geo=new Dr,this.pos=new Float32Array(e*2*3),this.alpha=new Float32Array(e*2);let t=[];for(let n=0;n<e-1;n++){let e=n*2,r=e+1,i=e+2,a=e+3;t.push(e,r,i,r,a,i)}this.geo.setIndex(t),this.geo.setAttribute(`position`,new fr(this.pos,3).setUsage(Ve)),this.geo.setAttribute(`alpha`,new fr(this.alpha,1).setUsage(Ve)),this.mat=new Fo({uniforms:{uColor:{value:this.color}},vertexShader:`attribute float alpha; varying float vA; void main(){ vA = alpha; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,fragmentShader:`uniform vec3 uColor; varying float vA; void main(){ gl_FragColor = vec4(uColor * vA, vA); }`,transparent:!0,depthWrite:!1,side:2,blending:2}),this.mesh=new J(this.geo,this.mat),this.mesh.frustumCulled=!1,this.mesh.renderOrder=5}push(e,t){this.bases.unshift(e.clone()),this.tips.unshift(t.clone()),this.ages.unshift(0),this.bases.length>this.max&&(this.bases.pop(),this.tips.pop(),this.ages.pop())}clear(){this.bases.length=this.tips.length=this.ages.length=0}update(e,t,n=1){for(let t=0;t<this.ages.length;t++)this.ages[t]+=e;for(;this.ages.length&&this.ages[this.ages.length-1]>this.lifetime;)this.ages.pop(),this.bases.pop(),this.tips.pop();let r=this.bases.length;if(this.mesh.visible=t&&r>=2,this.mesh.visible){for(let e=0;e<this.max;e++){let t=Math.min(e,r-1),i=this.bases[t],a=this.tips[t],o=.35;this.pos.set([i.x+(a.x-i.x)*o,i.y+(a.y-i.y)*o,i.z+(a.z-i.z)*o],e*6),this.pos.set([a.x,a.y,a.z],e*6+3);let s=e<r?Math.max(0,1-this.ages[t]/this.lifetime)*(1-e/r):0;this.alpha[e*2]=s*.1*n,this.alpha[e*2+1]=s*.75*n}this.geo.attributes.position.needsUpdate=!0,this.geo.attributes.alpha.needsUpdate=!0}}},wp=new G().setFromEuler(new on(1.9,0,0)),Tp=new G().setFromEuler(new on(0,Math.PI/2,0)),Ep=new G().setFromEuler(new on(Math.PI/2+.3,0,Math.PI/2)),Dp=new G().setFromEuler(new on(0,Math.PI,0)),Op=new G().setFromEuler(new on(.12,0,3.67)),kp=new G().setFromEuler(new on(0,Math.PI,-.55)),Ap=new K(-.1,.12,-.02),jp=new K(0,-.02,-.07);function Mp(e,t,n){let r=e.clone().normalize(),i=t.clone().addScaledVector(r,-t.dot(r)).normalize(),a=new K().crossVectors(r,i),o=new Yt().makeBasis(a,r,i);return n.setFromRotationMatrix(o)}var Np=class{ctx;player;rig=new Zf(qf);animator;trail=new Cp(26);footIK;models=new Map;shield;lastMain=null;weaponSpring=new jd(260,16);shieldSpring=new jd(240,15);chargeGlow=0;equipScale=1;hurtFlashed=0;q=new G;q2=new G;v=new K;v2=new K;dir=new K;edge=new K;hand=new K;pole=new K;yawQ=new G;constructor(e,t){this.ctx=e,this.player=t,this.animator=new $f(this.rig),this.footIK=new Sp(e.physics),this.animator.onFootstep=(n,r)=>{let i=t.position;e.events.emit(`footstep`,{pos:i.clone(),surface:t.motor.surface,intensity:r*(1-.75*t.sneakAmount),player:!0})},e.scene.add(this.rig.root),e.scene.add(this.trail.mesh);for(let t of[`sword`,`axe`,`pickaxe`,`bow`]){let n=vf(t);n.root.visible=!1,e.scene.add(n.root),this.models.set(t,n)}this.shield=vf(`shield`),e.scene.add(this.shield.root),t.stickRoot=this.rig.root}set visible(e){this.rig.root.visible=e;for(let t of this.models.values())e||(t.root.visible=!1);e||(this.shield.root.visible=!1),this.hidden=!e}hidden=!1;hideGear=!1;calmT=0;sheathed=!1;update(e){let t=this.player,n=this.ctx.tuning,r=this.rig;r.root.position.copy(t.position),r.root.position.y+=t.motor.visualStepOffset,r.root.rotation.y=t.facing,t.recoilImpulse>0&&(this.weaponSpring.impulse(t.recoilImpulse*9),this.animator.kick(t.recoilImpulse*3),t.recoilImpulse=0),t.shieldImpulse>0&&(this.shieldSpring.impulse(t.shieldImpulse*7),this.animator.kick(t.shieldImpulse*2),t.shieldImpulse=0),this.weaponSpring.update(e),this.shieldSpring.update(e),t.state===`hurt`&&this.hurtFlashed!==t.time-t.stateT&&(this.hurtFlashed=t.time-t.stateT,n.hitFlashEnabled&&r.flash(16724016,.12)),r.updateFlash(e);let i=t.state===`climb`||t.state===`mantle`,a=t.state!==`move`&&t.state!==`equip`&&t.state!==`dodge`&&!i,o=!1;for(let e of this.ctx.combat.targets)if(e.team===`enemy`&&e.alive&&e.center(this.v).distanceTo(t.position)<9){o=!0;break}a||t.guardAmount>.05||t.lockTarget||o?this.calmT=0:this.calmT+=e,i&&(this.calmT=Math.max(this.calmT,3));let s=this.calmT>2.5;s!==this.sheathed&&(this.sheathed=s,this.equipScale=.35,t.mainHand&&this.ctx.sound.play(s?`unequip`:`equip`,{pos:t.position,vol:.5,variant:`blade`}));let c=this.sheathed;t.anim.ready=+(!c&&(t.mainHand===`sword`||t.mainHand===`axe`||t.mainHand===`pickaxe`)),t.anim.hasShieldUp=t.hasShield,this.animator.update(e,t.anim);let l=t.motor.grounded&&t.state!==`dodge`&&t.state!==`dead`&&!(t.state===`attack`&&t.attack?.def.spin),u=Math.hypot(t.motor.velocity.x,t.motor.velocity.z);this.footIK.update(e,r,l&&u<.6,1,!t.motor.grounded),this.climbHands(t),r.root.updateMatrixWorld(!0);let d=t.mainHand;d!==this.lastMain&&(this.equipScale=.15,this.lastMain=d),this.equipScale=$(this.equipScale,1,14,e);let f=kd(X(this.equipScale));t.state===`equip`&&t.stateT<.12&&(f=Math.max(.05,1-t.stateT/.12));for(let[e,t]of this.models)t.root.visible=!this.hidden&&!this.hideGear&&e===d;let p=d?this.models.get(d):void 0,m=t.facing;this.yawQ.setFromAxisAngle(new K(0,1,0),m);let h=t.state===`attack`&&t.attack?t.attack.def:t.state===`charge`&&t.weapon?.charged?Tf[t.weapon.charged]:null;if(p&&d!==`bow`){if(p.root.scale.setScalar(f*(d&&n.rangeMul,1)),p.root.scale.y=f*n.rangeMul,h){let e=t.swingAngle;if(t.state===`charge`){let r=Math.sign(h.arc[1]-h.arc[0])||1,i=Math.sin(t.time*40)*2*X(t.chargeT/n.chargeTime);e=h.work===`mine`?128+i:h.work===`chop`?118+i:h.arc[0]-r*22+i}if(Pf(h,e,this.dir,this.edge,t.state===`attack`?t.attack?.aimPitch??0:0),t.state===`charge`&&h.work===`chop`){let e=Math.sin(t.time*40)*.03*X(t.chargeT/n.chargeTime);this.dir.set(-.55,.8+e,.12).normalize(),this.edge.set(.35,.05,1).normalize()}let{pivot:i,reach:a}=Bf(h),o=t.state===`charge`&&h.work===`chop`?.3:a;if(this.hand.copy(i).addScaledVector(this.dir,o).applyQuaternion(this.yawQ).add(t.position),this.hand.y+=t.motor.visualStepOffset,this.dir.applyQuaternion(this.yawQ),this.edge.applyQuaternion(this.yawQ),Mp(this.dir,this.edge,this.q),this.weaponSpring.value!==0){let e=this.v.crossVectors(this.dir,this.edge).normalize();this.q2.setFromAxisAngle(e,-this.weaponSpring.value*.12),this.q.premultiply(this.q2)}p.root.position.copy(this.hand),p.root.quaternion.copy(this.q),r.joints.upperArmR.getWorldPosition(this.pole);let s=this.v2.set(-Math.cos(m),0,Math.sin(m));if(this.pole.addScaledVector(s,.5).add(this.v.set(0,-.6,0)).addScaledVector(Rd(m,this.v),-.3),yp(r.joints.upperArmR,r.joints.forearmR,Yf,Xf,this.hand,this.pole,1),h.work){let e=this.v2.copy(this.hand).addScaledVector(this.dir,zf);r.joints.upperArmL.getWorldPosition(this.pole),this.pole.add(this.v.set(Math.cos(m)*.5,-.6,-Math.sin(m)*.5)),yp(r.joints.upperArmL,r.joints.forearmL,Yf,Xf,e,this.pole,1)}}else if(c)r.sockets.back.localToWorld(p.root.position.copy(Ap)),r.sockets.back.getWorldQuaternion(this.q),p.root.quaternion.copy(this.q).multiply(Op);else{r.sockets.handR.getWorldPosition(p.root.position),r.sockets.handR.getWorldQuaternion(this.q),p.root.quaternion.copy(this.q).multiply(wp),this.weaponSpring.value!==0&&p.root.rotateX(-this.weaponSpring.value*.1);let e=t.guardAmount;if((d===`axe`||d===`pickaxe`)&&e>.01){let n=this.v2.set(-.22,1.3-this.shieldSpring.value*.03,.38).applyQuaternion(this.yawQ).add(t.position);n.y+=t.motor.visualStepOffset;let i=this.dir.set(1,.3,.1).normalize().applyQuaternion(this.yawQ);Mp(i,this.edge.set(0,1,0),this.q2),p.root.position.lerp(n,e),p.root.quaternion.slerp(this.q2,e),r.joints.upperArmR.getWorldPosition(this.pole),this.pole.add(this.v.set(-Math.cos(m)*.5,-.6,Math.sin(m)*.5)),yp(r.joints.upperArmR,r.joints.forearmR,Yf,Xf,p.root.position,this.pole,e);let a=this.v.copy(i).multiplyScalar(.45).add(p.root.position);r.joints.upperArmL.getWorldPosition(this.pole),this.pole.add(this.hand.set(Math.cos(m)*.5,-.6,-Math.sin(m)*.5)),yp(r.joints.upperArmL,r.joints.forearmL,Yf,Xf,a,this.pole,e)}}let i=t.state===`charge`?X(t.chargeT/n.chargeTime):0,a=i>=1?.6+Math.sin(t.time*30)*.4:i*.35;this.chargeGlow=$(this.chargeGlow,a,20,e),p.setGlow(this.chargeGlow)}if(d===`bow`&&p){p.root.scale.setScalar(f);let e=t.state===`bow`||t.state===`bowRecover`,n=t.state===`bow`&&t.inventory.count(`arrow`)>0;if(p.setDraw?.(t.state===`bow`?t.bowDraw:0,n),e){let e=this.v.set(Math.sin(t.aim.yaw)*Math.cos(t.aim.pitch),Math.sin(t.aim.pitch),Math.cos(t.aim.yaw)*Math.cos(t.aim.pitch)),n=new K(e.z,0,-e.x).normalize(),i=r.joints.upperArmL.getWorldPosition(this.hand).addScaledVector(e,.5).addScaledVector(n,-.2);i.y+=.07;let a=this.v2.set(0,1,0).addScaledVector(e,-e.y).normalize();a.applyAxisAngle(e,-.18);let o=new K().crossVectors(a,e);this.q.setFromRotationMatrix(new Yt().makeBasis(o,a,e)),p.root.position.copy(i),p.root.quaternion.copy(this.q),r.joints.upperArmL.getWorldPosition(this.pole),this.pole.addScaledVector(n,.4).y-=.5,yp(r.joints.upperArmL,r.joints.forearmL,Yf,Xf,i,this.pole,1);let s=this.v2.copy(i).addScaledVector(e,-.1-t.bowDraw*hf);this.pole.copy(s).addScaledVector(e,-.5).addScaledVector(n,-.45).y+=.3,yp(r.joints.upperArmR,r.joints.forearmR,Yf,Xf,s,this.pole,1)}else c?(r.sockets.back.localToWorld(p.root.position.copy(Ap).setX(.05)),r.sockets.back.getWorldQuaternion(this.q),p.root.quaternion.copy(this.q).multiply(kp)):(r.sockets.handL.getWorldPosition(p.root.position),r.sockets.handL.getWorldQuaternion(this.q),p.root.quaternion.copy(this.q).multiply(Ep))}let g=this.shield;if(g.root.visible=!this.hidden&&!this.hideGear&&t.offHand===`shield`,g.root.visible){if(d===`bow`||c||d===`axe`||d===`pickaxe`)r.sockets.back.localToWorld(g.root.position.copy(jp)),r.sockets.back.getWorldQuaternion(this.q),g.root.quaternion.copy(this.q).multiply(Dp);else{r.sockets.shieldArm.getWorldPosition(this.v),r.sockets.shieldArm.getWorldQuaternion(this.q),this.q.multiply(Tp);let e=t.guardAmount;if(e>.01){let n=this.v2.set(.02,1.2,.46-this.shieldSpring.value*.05).applyQuaternion(this.yawQ).add(t.position);n.y+=t.motor.visualStepOffset,this.q2.setFromEuler(new on(-.08-this.shieldSpring.value*.08,m-.18,.06,`YXZ`)),this.v.lerp(n,e),this.q.slerp(this.q2,e),g.root.position.copy(this.v),g.root.quaternion.copy(this.q),r.joints.upperArmL.getWorldPosition(this.pole),this.pole.addScaledVector(this.v2.set(Math.cos(m),-.8,-Math.sin(m)),.6);let i=this.v2.set(0,0,-.03).applyQuaternion(this.q).add(this.v);yp(r.joints.upperArmL,r.joints.forearmL,Yf,Xf,i,this.pole,e)}else g.root.position.copy(this.v),g.root.quaternion.copy(this.q)}g.setGlow(t.state===`guardHit`?.3:0)}let _=t.attack;if(p&&_&&t.state===`attack`&&(t.swingPhase===`active`||t.swingPhase===`recovery`&&t.stateT-_.timing.windup-_.timing.active<.04)&&p&&_){let e=this.v.set(0,_.weapon.bladeStart,0).applyQuaternion(p.root.quaternion).multiplyScalar(n.rangeMul).add(p.root.position),t=this.v2.set(0,_.weapon.bladeEnd,0).applyQuaternion(p.root.quaternion).multiplyScalar(n.rangeMul).add(p.root.position);this.trail.color.set(_.charged?10479871:_.weapon.trailColor),this.trail.push(e,t)}this.trail.update(e,n.trailsEnabled&&!this.hidden,_?.6+_.def.strength*.6:1)}climbT=new K;climbP=new K;climbHands(e){if(e.state!==`climb`&&e.state!==`mantle`)return;let t=this.rig,n=e.climbN,r=e.climbWall,i=Math.atan2(-n.x,-n.z),a=-Math.cos(i),o=Math.sin(i),s=e.state===`mantle`,c=s?e.anim.actionU:0,l=s?1-Math.min(1,Math.max(0,(c-.78)/.14)):1;if(!(l<=.001))for(let i of[1,-1]){let u=i===1?t.joints.upperArmR:t.joints.upperArmL,d=i===1?t.joints.forearmR:t.joints.forearmL,f=i===1?t.joints.handR:t.joints.handL,p=this.climbT;if(s){p.set(r.x+a*.22*i-n.x*.08,r.y+.03,r.z+o*.22*i-n.z*.08);let t=Math.min(1,Math.max(0,(c-.45)/.3));t>0&&(p.x+=(e.position.x-n.x*.3+a*.24*i-p.x)*t,p.z+=(e.position.z-n.z*.3+o*.24*i-p.z)*t)}else{f.getWorldPosition(p);let e=(p.x-r.x)*n.x+(p.z-r.z)*n.z;p.x-=n.x*(e-.05),p.z-=n.z*(e-.05),p.y>r.y-.02&&(p.y=r.y+.03,p.x-=n.x*.1,p.z-=n.z*.1)}u.getWorldPosition(this.climbP),this.climbP.x+=n.x*.45+a*.35*i,this.climbP.z+=n.z*.45+o*.35*i,this.climbP.y-=.25,yp(u,d,Yf,Xf,p,this.climbP,l)}}},Pp={slashRL:{W:{p:[.44,-.06,-.4],d:[.92,.18,.2]},M:{p:[.02,-.1,-.64],d:[-.86,.06,-.5]},F:{p:[-.46,-.14,-.4],d:[-.92,0,.25]},camW:[.01,-.1,-.03],camF:[-.01,.13,.04],follow:.4,hold:.55},slashLR:{W:{p:[-.4,-.24,-.4],d:[-.75,-.45,-.2]},M:{p:[.02,-.06,-.64],d:[.82,.3,-.5]},F:{p:[.44,.12,-.4],d:[.45,.85,-.1]},camW:[-.04,.08,.07],camF:[.05,-.1,-.1],follow:.4,hold:.55},overhead:{W:{p:[.2,.17,-.38],d:[.1,.75,.55]},M:{p:[.08,.02,-.62],d:[.05,.6,-.8]},F:{p:[.05,-.34,-.48],d:[0,-.6,-.8]},camW:[.1,-.02,-.03],camF:[-.16,0,.02],follow:.35,hold:.55},spin:{W:{p:[.46,-.12,-.34],d:[.9,.1,.25]},M:{p:[0,-.18,-.68],d:[-.86,.05,-.5]},F:{p:[-.48,-.18,-.36],d:[-.85,0,.35]},camW:[0,-.14,-.06],camF:[0,.22,.08],follow:.2,hold:.3},chop:{W:{p:[.42,-.12,-.38],d:[.92,.2,.2]},M:{p:[.12,-.17,-.56],d:[-.6,.12,-.8]},F:{p:[-.06,-.19,-.58],d:[-.86,.06,-.5]},camW:[0,-.1,-.03],camF:[0,.07,.03],hold:.4,twoHanded:!0},mine:{W:{p:[.14,.17,-.38],d:[.05,.75,.55]},M:{p:[.08,-.02,-.58],d:[0,.5,-.86]},F:{p:[.05,-.28,-.55],d:[0,-.4,-.92]},camW:[.12,0,0],camF:[-.14,0,0],hold:.4,twoHanded:!0}};{let e=(e,t)=>[e[0]-t[0],e[1]-t[1],e[2]-t[2]],t=e=>Math.hypot(e[0],e[1],e[2]);for(let n of Object.values(Pp)){n.W.e=e(n.M.d,n.W.d),n.M.e=e(n.F.d,n.W.d);let r=e(n.F.d,n.M.d);n.F.e=t(r)>.15?r:n.M.e}}var Fp={sword1:`slashRL`,flurryA:`slashRL`,sword2:`slashLR`,flurryB:`slashLR`,sword3:`overhead`,swordAir:`overhead`,swordSpin:`spin`,axe1:`chop`,axeCharged:`chop`,pick1:`mine`,pickCharged:`mine`};function Ip(e){return Pp[Fp[e]??`slashRL`]}var Lp=new G,Rp=new K,zp=new K,Bp=new K;function Vp(e,t){return Mp(Rp.set(...e.d).normalize(),zp.set(...e.e).normalize(),t)}function Hp(e,t,n,r){e.p.lerp(t,r),e.q.slerp(n,r)}var Up=e=>e*e,Wp=(e,t=1.9)=>1+(t+1)*(e-1)**3+t*(e-1)**2;function Gp(e,t,n){if(t===`charge`)return{seg:0,k:1};let r=X(n),i=e.follow??0;if(t===`windup`)return r<.65?{seg:0,k:Wp(r/.65,1.3)}:{seg:1,k:.22*Up((r-.65)/.35)};if(t===`active`){if(r<.5)return{seg:1,k:.22+.78*Od(r/.5)};let e=(r-.5)/.5;return{seg:2,k:i>0?.4*e:Wp(e,1.2)}}return i>0&&r<i?{seg:2,k:.4+.6*Wp(r/i,1.1)}:{seg:3,k:Od(X((r-e.hold)/(1-e.hold)))}}function Kp(e,t,n,r,i,a,o){let s={p:a,q:o},{seg:c,k:l}=Gp(e,t,n),[u,d]=c===0?[null,e.W]:c===1?[e.W,e.M]:c===2?[e.M,e.F]:[e.F,null];if(u&&d){a.set(...u.p).lerp(Bp.set(...d.p),l),Rp.set(...u.d).normalize().lerp(zp.set(...d.d).normalize(),l),Bp.set(...u.e).normalize().lerp(zp.set(...d.e).normalize(),l),Mp(Rp,Bp,o);return}u?(a.set(...u.p),Vp(u,o)):(a.copy(r),o.copy(i)),d?Hp(s,Bp.set(...d.p),Vp(d,Lp),l):l>0&&Hp(s,r,i,l)}function qp(e,t,n,r){let{seg:i,k:a}=Gp(e,t,n),o=e.camW,s=e.camF,c=[(o[0]+s[0])*.3,(o[1]+s[1])*.3,(o[2]+s[2])*.3],[l,u]=i===0?[[0,0,0],o]:i===1?[o,c]:i===2?[c,s]:[s,[0,0,0]];return r.set(l[0]+(u[0]-l[0])*a,l[1]+(u[1]-l[1])*a,l[2]+(u[2]-l[2])*a)}var Jp=new K(0,0,1),Yp=new K(0,1.62,.1),Xp=class{ctx;player;scene=new Nn;root=new wn;trail=new Cp(22);models=new Map;shield;armR;armL;sway=new Md(90,11);kick=new jd(260,15);shieldKick=new jd(240,15);bobPhase=0;attackW=0;shieldTuck=0;climbHide=0;wasMantle=!1;camInv=new Yt;cw=new K;ce=new K;bowAim=0;guardS=new jd(300,21);wasGuarding=!1;vmScale=1;equipScale=1;lastMain=null;lastYaw=0;lastPitch=0;glow=0;landDip=new jd(160,12);q2=new G;v=new K;v2=new K;dir=new K;edge=new K;hand=new K;restPos=new K;restQ=new G;visible=!1;constructor(e,t){this.ctx=e,this.player=t,this.scene.add(this.root),this.root.matrixAutoUpdate=!1;let n=new ss(14675967,5925434,1.4),r=new Ss(16773848,2.2);r.position.set(-3,6,2),this.scene.add(n,r);for(let e of[`sword`,`axe`,`pickaxe`,`bow`]){let t=vf(e);t.root.visible=!1,this.root.add(t.root),this.models.set(e,t)}this.shield=vf(`shield`),this.shield.root.add(pf()),this.root.add(this.shield.root),this.armR=this.makeArm(),this.armL=this.makeArm(),this.root.add(this.armR,this.armL,this.trail.mesh),this.scene.traverse(e=>e.castShadow=!1),e.events.on(`land`,e=>{e.player&&this.landDip.impulse(-1.5-e.intensity*4)})}makeArm(){let e=new wn,t=new Lo({color:qf.tunic,roughness:.8,flatShading:!0}),n=new Lo({color:qf.skin,roughness:.7,flatShading:!0}),r=new Lo({color:qf.boots,roughness:.9,flatShading:!0}),i=new J(new Qi(.045,.3,3,8),n);i.rotation.x=Math.PI/2,i.position.z=.19;let a=new J(new ea(.055,.05,.1,8),r);a.rotation.x=Math.PI/2,a.position.z=.09;let o=new J(new ea(.062,.058,.14,8),t);o.rotation.x=Math.PI/2,o.position.z=.36;let s=new J(new Zi(.08,.075,.1),n);return s.position.z=-.02,e.add(i,a,o,s),e}placeArm(e,t,n,r){let i=r?this.v2.copy(r):this.v2.set(t.x+.12*n,t.y-.2,t.z+.3);e.position.copy(t),e.quaternion.setFromUnitVectors(Jp,i.sub(t).normalize()),e.scale.setScalar(this.vmScale),e.visible=!0}update(e,t){let n=this.player,r=this.ctx.tuning;if(this.root.matrix.copy(t.matrixWorld),this.root.matrixWorldNeedsUpdate=!0,this.root.visible=this.visible,!this.visible){this.trail.clear(),this.trail.update(e,!1);return}let i=n.aim.yaw-this.lastYaw,a=n.aim.pitch-this.lastPitch;if(this.lastYaw=n.aim.yaw,this.lastPitch=n.aim.pitch,r.weaponSway&&e>0){let e=.9*r.weaponSwayAmount;this.sway.velocity.x+=Math.max(-4,Math.min(4,i))*e*3,this.sway.velocity.y+=Math.max(-4,Math.min(4,-a))*e*3}this.sway.update(Math.max(e,1/240)),this.sway.value.clampScalar(-.08,.08);let o=Math.hypot(n.motor.velocity.x,n.motor.velocity.z);n.motor.grounded&&(this.bobPhase+=o*e/1.9);let s=r.weaponSway?r.weaponSwayAmount*X(o/6):0,c=Math.sin(this.bobPhase*Math.PI*2)*.018*s,l=-Math.abs(Math.cos(this.bobPhase*Math.PI*2))*.02*s;this.landDip.update(Math.max(e,1/240)),n.recoilImpulse>0&&this.kick.impulse(n.recoilImpulse*8),n.shieldImpulse>0&&this.shieldKick.impulse(n.shieldImpulse*8),this.kick.update(Math.max(e,1/240)),this.shieldKick.update(Math.max(e,1/240));let u=+!!n.sprinting,d=this.v.set(c-this.sway.value.x,l-this.sway.value.y+this.landDip.value*.02-u*.04,0),f=xd(t.aspect/1.78,.55,1);this.vmScale=f;let p=n.mainHand;p!==this.lastMain&&(this.equipScale=0,this.lastMain=p),this.equipScale=$(this.equipScale,1,12,e);let m=(1-kd(this.equipScale))*.35;n.state===`equip`&&n.stateT<.14&&(m=n.stateT/.14*.35),n.state===`hurt`&&(m+=Math.sin(X(n.stateT/.4)*Math.PI)*.06);let h=n.state===`climb`||n.state===`mantle`;this.wasMantle&&!h&&(this.climbHide=0),this.wasMantle=n.state===`mantle`,this.climbHide=$(this.climbHide,+!!h,10,e),m+=this.climbHide*.6,d.y-=m;for(let[e,t]of this.models)t.root.visible=e===p;let g=p?this.models.get(p):void 0;this.armR.visible=!1,this.armL.visible=!1;let _=n.state===`attack`&&n.attack?n.attack.def:n.state===`charge`&&n.weapon?.charged?Tf[n.weapon.charged]:null;if(this.attackW=_?1:$(this.attackW,0,14,e),g&&p!==`bow`){g.root.scale.set(f,r.rangeMul*f,f);let t=p===`axe`||p===`pickaxe`;if(this.restPos.set(.47,t?-.42:-.38,-.46).add(d),Mp((t?this.dir.set(.38,.45,-.8):this.dir.set(.3,.55,-.78)).normalize(),this.edge.set(-.9,.1,-.2).normalize(),this.restQ),u&&this.restQ.premultiply(new G().setFromEuler(new on(-.5,.3,0))),_||this.attackW>.01){let e=Ip((_??n.attack?.def??Tf.sword1).id),t=n.swingPhase,i=n.swingU;if(n.state===`charge`?t=`charge`:_||(t=`recovery`,i=1),Kp(e,t,i,this.restPos,this.restQ,this.hand,this.q2),n.state===`charge`){let e=X(n.chargeT/r.chargeTime);this.hand.x+=Math.sin(n.time*47)*.004*e,this.hand.y+=Math.sin(n.time*53)*.004*e}this.kick.value&&(this.hand.z+=this.kick.value*.025,this.q2.multiply(new G().setFromAxisAngle(new K(1,0,0),-this.kick.value*.08))),this.hand.add(d);let a=_?1:this.attackW;g.root.position.copy(this.restPos).lerp(this.hand,a),g.root.quaternion.copy(this.restQ).slerp(this.q2,a)}else{g.root.position.copy(this.restPos),g.root.position.z+=this.kick.value*.03,g.root.quaternion.copy(this.restQ),g.root.rotateX(-this.kick.value*.1);let e=n.guardAmount;if(p===`sword`&&e>.01){let t=this.v2.set(.36,-.4,-.42).add(d),n=Mp(this.dir.set(.35,.45,-.82).normalize(),this.edge.set(-.6,.3,-.3).normalize(),new G);g.root.position.lerp(t,e),g.root.quaternion.slerp(n,e)}if((p===`axe`||p===`pickaxe`)&&e>.01){let t=this.v2.set(.24,-.2,-.42).add(d);t.z+=this.shieldKick.value*.04;let n=Mp(this.dir.set(-1,.28,-.1).normalize(),this.edge.set(0,1,.2).normalize(),new G);g.root.position.lerp(t,e),g.root.quaternion.slerp(n,e)}}if(g.root.position.x*=f,this.placeArm(this.armR,g.root.position,1),(_??(this.attackW>.01?n.attack?.def:null))?.work||p===`axe`||p===`pickaxe`){let e=this.v2.set(0,zf*f,0).applyQuaternion(g.root.quaternion).add(g.root.position);this.placeArm(this.armL,e.clone(),-1)}let i=n.state===`charge`?X(n.chargeT/r.chargeTime):0;this.glow=$(this.glow,i>=1?.6+Math.sin(n.time*30)*.4:i*.35,20,e),g.setGlow(this.glow)}if(p===`bow`&&g){let t=n.state===`bow`,r=t?n.bowDraw:0,i=t&&n.inventory.count(`arrow`)>0;g.setDraw?.(r,i),g.root.scale.setScalar(1),this.bowAim=$(this.bowAim,t||n.state===`bowRecover`?1:0,16,e);let a=this.bowAim,o=this.hand.set(Z(-.6,-.06,a)*f,Z(-.42,-.12,a),Z(-.5,-.55,a)).add(d);o.z+=this.kick.value*.03,g.root.position.copy(o),g.root.quaternion.setFromEuler(new on(Z(-1.05,0,a),Math.PI,Z(-.25,.2,a))),this.placeArm(this.armL,o,-1);let s=this.v2.set(0,0,-.1-r*hf).applyQuaternion(g.root.quaternion).add(o);t&&this.placeArm(this.armR,s.clone(),1)}let v=this.shield,y=p===`axe`||p===`pickaxe`;if(v.root.visible=n.offHand===`shield`&&p!==`bow`&&!y,v.root.visible){let t=n.guarding||n.state===`guardHit`;t&&!this.wasGuarding&&this.guardS.impulse(4),this.wasGuarding=t,this.guardS.target=+!!t,this.guardS.update(Math.max(e,1/240));let r=xd(this.guardS.value,-.1,1.15),i=+(n.state===`attack`);this.shieldTuck+=(i-this.shieldTuck)*(1-Math.exp(-e*(i?18:7)));let a=this.shieldTuck*(1-X(r)),o=Math.sin(X(r)*Math.PI),s=1.05*Z(1,f,.4),c=.36*s,l=this.v2.set(Z(-.42,-.15,r),Z(-.2-c,-.07-c,r)+o*.03,Z(-.56,-.54,r)-o*.05).add(d);if(l.y+=Math.sin(n.time*2.1)*.004*X(r),l.z+=this.shieldKick.value*.06,l.y-=m*.5+a*.22-this.shieldKick.value*.015,l.x-=a*.08,l.x*=f,v.root.position.copy(l),v.root.scale.setScalar(s),v.root.quaternion.setFromEuler(new on(Z(-.3,-.1,r)-this.shieldKick.value*.14,Math.PI+Z(.4,.05,r),Z(-.2,-.03,r)+this.shieldKick.value*.03)),v.setGlow(n.state===`guardHit`?.3:0),!this.armL.visible){v.root.updateMatrix();let e=this.hand.set(0,-.02,-.05).applyMatrix4(v.root.matrix),t=this.dir.set(.08,-.45,-.16).applyMatrix4(v.root.matrix);this.placeArm(this.armL,e,-1,t)}}this.climbHide>.02&&this.climbArms(n,t);let b=n.attack;if(g&&b&&n.state===`attack`&&p!==`bow`&&(n.swingPhase===`active`||n.swingPhase===`recovery`&&n.stateT-b.timing.windup-b.timing.active<Math.max(.04,(Ip(b.def.id).follow??0)*b.timing.recovery*.8))){let e=this.v.set(0,b.weapon.bladeStart*r.rangeMul*this.vmScale,0).applyQuaternion(g.root.quaternion).add(g.root.position),t=this.v2.set(0,b.weapon.bladeEnd*r.rangeMul*this.vmScale,0).applyQuaternion(g.root.quaternion).add(g.root.position);this.trail.color.set(b.charged?10479871:b.weapon.trailColor),this.trail.push(e,t)}this.trail.update(e,r.trailsEnabled,b?.5+b.def.strength*.5:1)}climbArms(e,t){for(let[,e]of this.models)e.root.visible=!1;this.shield.root.visible=!1;let n=this.climbHide;if(e.state!==`climb`&&e.state!==`mantle`){this.armR.visible=this.armL.visible=!1;return}this.camInv.copy(t.matrixWorld).invert();let r=e.climbN,i=e.climbWall,a=Math.atan2(-r.x,-r.z),o=-Math.cos(a),s=Math.sin(a),c=e.state===`mantle`,l=c?e.anim.actionU:0,u=e.climbPhase*Math.PI*2,d=e.climbMove,f=e.anim.climbJump??0,p=Math.max(0,f),m=Math.max(0,-f);for(let t of[1,-1]){let a=this.cw;if(c)a.set(i.x+o*.2*t-r.x*.2,i.y+.03,i.z+s*.2*t-r.z*.2);else{let n=Math.sin(u)*d*t,c=Math.max(0,Math.cos(u)*t)*d,l=e.climbDir.x,f=e.climbDir.y,h=Math.max(0,-f)*d,g=Math.abs(l)*d,_=+(Math.sign(l)===t),v=.5+.5*Math.sin(u),y=g*(_?.26*v:-.1*(1-v)),b=n*(1-.7*g);a.set(e.position.x+o*(.19+y)*t,e.position.y+1.82+.22*b+.3*p-.12*m-.32*h-.05*g,e.position.z+s*(.19+y)*t);let x=(a.x-i.x)*r.x+(a.z-i.z)*r.z,S=.04+.1*c;a.x-=r.x*(x-S),a.z-=r.z*(x-S),a.y>i.y-.02&&(a.y=i.y+.02,a.x-=r.x*.1,a.z-=r.z*.1)}let f=this.ce.set(e.position.x+o*.2*t+r.x*.05,e.position.y+1.4,e.position.z+s*.2*t+r.z*.05).lerp(a,.5);if(f.x+=o*t*.05+r.x*.14,f.z+=s*t*.05+r.z*.14,f.y-=.1,a.applyMatrix4(this.camInv),f.applyMatrix4(this.camInv),c){let e=Math.min(1,Math.max(0,(l-.3)/.45)),n=e*e*(3-2*e);if(n>0){let e=this.v2.set(t===1?.27:-.27,-.22,-.5);a.lerp(e,n),f.lerp(this.v2.set(e.x+t*.12,e.y-.3,e.z+.32),n)}}a.y-=(1-n)*.6,f.y-=(1-n)*.6,this.placeArm(t===1?this.armR:this.armL,a.clone(),t,f)}}},Zp=class{ctx;player;rot=new K;fov=0;dolly=0;lift=0;pitch=new jd(190,15);yaw=new jd(170,14);roll=new jd(170,13);fovS=new jd(150,13);dollyS=new jd(110,13);leanRoll=0;chargeW=0;sprintW=0;followY=NaN;blend=0;constructor(e,t){this.ctx=e,this.player=t;let n=e.events,r=()=>e.tuning.camJuice,i=()=>1-this.blend;n.on(`swing`,e=>{if(e.source!==`player`)return;let t=this.player().attack;if(!t)return;let n=Math.sign(t.def.arc[0]-t.def.arc[1])||1,a=(.4+t.def.strength)*r()*i();t.def.overhead?this.pitch.impulse(-1.6*a):this.yaw.impulse(n*1.9*a),this.roll.impulse(-n*.6*a),this.dollyS.impulse(-(2+t.def.lunge*.4)*a)}),n.on(`hit`,e=>{let t=this.player();if(e.source===`player`){let t=(.5+e.hit.strength)*r();this.fovS.impulse(-38*t),this.dollyS.impulse(-1.2*t*i());return}if(e.target!==t)return;let n=e.result;n.parried?(this.fovS.impulse(-70*r()),this.pitch.impulse(.9*r())):n.blocked?(this.pitch.impulse(1.6*r()),this.roll.impulse((Math.random()<.5?-1:1)*.8*r()),this.dollyS.impulse(3*r()*i()),this.fovS.impulse(18*r())):(this.roll.impulse((Math.random()<.5?-1:1)*2.6*r()),this.pitch.impulse(1.8*r()),this.dollyS.impulse(2.5*r()*i()))}),n.on(`enemyDeath`,()=>{this.fovS.impulse(-45*r()),this.roll.impulse((Math.random()<.5?-1:1)*.6*r())}),n.on(`jump`,()=>{this.pitch.impulse(.7*r()),this.dollyS.impulse(1.4*r()*i())}),n.on(`mantlePull`,t=>{let n=1/(.4+.6*this.blend);this.pitch.impulse((1.2+1.3*t.intensity)*r()*n),this.roll.impulse((Math.random()<.5?-1:1)*.5*r()*n),this.fovS.impulse(-14*r()*n),this.dollyS.impulse(-2.2*r()*i()),e.tuning.shakeEnabled&&e.shake.add(.12+.1*t.intensity),e.sound.play(`jump`,{pos:t.pos,vol:.55})}),n.on(`land`,e=>{e.player&&(this.pitch.impulse(-(.6+e.intensity*3)*r()),this.dollyS.impulse(-(.5+e.intensity*2)*r()*i()))}),n.on(`dodge`,()=>{let e=this.player().dodgeType;e===`hopF`&&this.pitch.impulse(-.9*r()),e===`back`&&this.pitch.impulse(.9*r()),e===`flip`&&this.pitch.impulse(1.6*r()),(e===`hopL`||e===`hopR`)&&this.roll.impulse((e===`hopL`?1:-1)*1.4*r()*i()),this.dollyS.impulse(2*r()*i())}),n.on(`perfectDodge`,()=>{this.fovS.impulse(-90*r()),this.roll.impulse(1.2*r())}),n.on(`chargeReady`,()=>this.fovS.impulse(-40*r())),n.on(`bowFire`,e=>{this.pitch.impulse((.6+e.power*1.4)*r()),this.fovS.impulse(30*e.power*r())}),n.on(`treeFell`,()=>this.pitch.impulse(-.8*r())),n.on(`rockBroke`,()=>this.fovS.impulse(-35*r()))}update(e){let t=this.ctx.tuning,n=this.player(),r=t.camJuice,i=1-this.blend,a=Math.max(e,1/240);for(let e of[this.pitch,this.yaw,this.roll,this.fovS,this.dollyS])e.update(a);let o=n.motor.velocity,s=n.facing,c=o.x*-Math.cos(s)+o.z*Math.sin(s),l=Math.hypot(o.x,o.z),u=-c*.007*this.blend;n.sprinting&&(u+=xd(-n.turnRate*.012,-.06,.06)*X(l/6)),this.leanRoll=$(this.leanRoll,u*r,8,e);let d=n.state===`charge`?X(n.chargeT/t.chargeTime):0;this.chargeW=$(this.chargeW,d,6,e),this.sprintW=$(this.sprintW,+!!n.sprinting,3,e);let f=n.position.y;(!Number.isFinite(this.followY)||Math.abs(this.followY-f)>3)&&(this.followY=f),this.followY=$(this.followY,f,n.motor.grounded?14:5,e),this.lift=(this.followY-f)*.35*r*i;let p=.4+.6*this.blend;this.rot.set(this.pitch.value*2.5*p,this.yaw.value*2.5*p,(this.roll.value*2.5+this.leanRoll)*p),this.fov=(this.fovS.value*1.5-this.chargeW*6*r)*p,this.dolly=(this.dollyS.value*6-this.chargeW*.6*r+this.sprintW*.35*r)*i*.45}},Qp=class{ctx;camera;yaw=Math.PI;pitch=-.12;mode=`third`;blend=0;shoulderSide=1;shoulderBlend=1;dist=4;aimBlend=0;fovKick=0;recenterT=0;bobPhase=0;landDip=new jd(170,13);pivot=new K;tmp=new K;swingLean=new K;lockFlick=0;lockFlickCd=0;leanSm=new K;juice;runSway=0;keepAimT=0;keepAimPt=new K;tmp2=new K;dir=new K;raycaster=new Bs;player;aimTargets=()=>[];constructor(e){this.ctx=e,this.camera=new ys(e.tuning.fov,1,.05,400),this.camera.rotation.order=`YXZ`,this.juice=new Zp(e,()=>this.player),e.events.on(`land`,e=>{e.player&&this.ctx.tuning.camBob&&this.landDip.impulse(-.6-e.intensity*3)})}get firstPerson(){return this.mode===`first`}toggleView(){this.holdAim(),this.mode=this.mode===`first`?`third`:`first`}toggleShoulder(){this.holdAim(),this.shoulderSide*=-1}holdAim(){let e=this.aimPoint(this.keepAimPt);this.keepAimT=e.distanceTo(this.camera.position)<90?.45:0}recenter(){this.recenterT=.25}aimRay(e,t){e.copy(this.camera.position),this.camera.getWorldDirection(t)}aimPoint(e){let t=this.camera;t.getWorldDirection(this.dir);let n=this.tmp2.copy(t.position),r=150,i=this.ctx.physics.raycast(n,this.dir,r);i&&(r=i.distance);let a=this.tmp.copy(n).addScaledVector(this.dir,r),o=this.ctx.combat.querySegment(n,a,.05,`player`);return o.length&&(r=Math.min(r,o[0].t*r)),r=Math.max(r,this.blend>.5?1:this.dist+1),e.copy(n).addScaledVector(this.dir,r)}update(e,t){let n=this.ctx.tuning,r=this.ctx.input,i=this.player,a=.0022*n.sensitivity,o=i.state===`bow`?.6:1,s=!!i.lockTarget&&i.state!==`bow`;s?(this.lockFlick=this.lockFlick*Math.exp(-e*6)+r.lookX*a,this.lockFlickCd-=e,Math.abs(this.lockFlick)>.12&&this.lockFlickCd<=0&&(i.switchLock(this.lockFlick>0?1:-1),this.lockFlick=0,this.lockFlickCd=.35)):(this.lockFlick=0,this.yaw-=r.lookX*a*o,this.pitch-=r.lookY*a*o*(n.invertY?-1:1));let c=this.blend>.5?1.45:1.05;if(this.pitch=xd(this.pitch,-1.3,c),r.consume(`view`)&&this.toggleView(),r.consume(`shoulder`)&&this.toggleShoulder(),s&&i.lockTarget){i.lockTarget.center(this.tmp).sub(i.position);let t=Math.hypot(this.tmp.x,this.tmp.z);if(t>.8){let t=zd(this.tmp.x,this.tmp.z);this.yaw=Td(this.yaw,t,this.blend>.5?12:6,e)}i.lockTarget.center(this.tmp2).sub(this.camera.position);let n=Math.atan2(this.tmp2.y,Math.max(1,Math.hypot(this.tmp2.x,this.tmp2.z))),r=Math.atan2(this.tmp.y-.6,Math.max(t,3.5))-.18,a=this.blend>.5?n:r;this.pitch=$(this.pitch,a,this.blend>.5?10:4,e)}this.recenterT>0&&(this.recenterT-=e,this.yaw=Td(this.yaw,i.facing,18,e),this.pitch=$(this.pitch,-.12,18,e));let l=+(this.mode===`first`);this.blend=X(this.blend+Math.sign(l-this.blend)*e/.22),Math.abs(l-this.blend)<.01&&(this.blend=l);let u=Od(this.blend);this.juice.blend=u,this.juice.update(e);let d=this.juice;this.shoulderBlend=$(this.shoulderBlend,this.shoulderSide,8,e);let f=+(i.state===`bow`);this.aimBlend=$(this.aimBlend,f,9,e);let p=Math.hypot(i.motor.velocity.x,i.motor.velocity.z);this.runSway=$(this.runSway,i.motor.grounded?i.sprinting?1:X(p/6)*.3:0,6,e),u<.5&&i.motor.grounded&&(this.bobPhase+=p*t/1.9);let m=Math.cos(this.pitch),h=Math.sin(this.pitch);this.dir.set(Math.sin(this.yaw)*m,h,Math.cos(this.yaw)*m);let g=this.tmp.set(-Math.cos(this.yaw),0,Math.sin(this.yaw)),_=i.motor.visualStepOffset;this.pivot.copy(i.position),this.pivot.y+=n.camHeight+_+this.landDip.value*.03+d.lift-i.sneakAmount*.5,n.camBob&&(this.pivot.y+=(Math.abs(Math.sin(this.bobPhase*Math.PI*2))-.64)*.05*this.runSway*n.camBobAmount*(1-u));let v=Z(n.camShoulder,Math.max(n.camShoulder,.55)*1.45,this.aimBlend)*this.shoulderBlend,y=Z(n.camDistance,2.5,this.aimBlend)*(i.lockTarget?1.08:1),b=this.ctx.physics.raycast(this.pivot,this.tmp2.copy(g).multiplyScalar(Math.sign(v)||1),Math.abs(v)+.2,e=>e.blocksCamera),x=b?Math.max(0,b.distance-.2)*Math.sign(v):v,S=this.tmp2.copy(this.pivot).addScaledVector(g,x),C=y,w=this.dir.clone().negate(),T=[[0,0],[.18,0],[-.18,0],[0,.15],[0,-.15]],E=new K().crossVectors(g,w).normalize();for(let[e,t]of T){let n=new K().copy(S).addScaledVector(g,e).addScaledVector(E,t),r=this.ctx.physics.raycast(n,w,y+.3,e=>e.blocksCamera);r&&(C=Math.min(C,Math.max(.35,r.distance-.3)))}this.dist=C<this.dist?C:$(this.dist,C,4,e);let D=new K().copy(S).addScaledVector(w,xd(this.dist+d.dolly,.35,Math.max(.35,C))),O=this.ctx.physics.groundHeight(D.x,D.z,D.y,0,0);Number.isFinite(O.y)&&(D.y=Math.max(D.y,O.y+.2));let k=Math.hypot(i.motor.velocity.x,i.motor.velocity.z);u>=.5&&i.motor.grounded&&(this.bobPhase+=k*t/1.9);let A=n.camBob?n.camBobAmount*X(k/6):0,j=new K(0,Yp.y,Yp.z).applyAxisAngle(new K(0,1,0),i.facing).add(i.position);j.y-=i.sneakAmount*.6,j.y+=_+Math.abs(Math.sin(this.bobPhase*Math.PI*2))*.018*A+this.landDip.value*.05,j.addScaledVector(g,Math.sin(this.bobPhase*Math.PI*2)*.008*A),i.state===`climb`?j.addScaledVector(i.climbN,.24):i.state===`mantle`&&j.addScaledVector(i.climbN,.24*(1-X(i.anim.actionU/.6))),i.state===`dodge`&&(j.y-=Math.sin(X(i.stateT/.35)*Math.PI)*(i.dodgeType===`flip`?.25:.12)),i.state===`dead`&&(j.y-=X(i.stateT)*1.2),this.landDip.update(Math.max(e,1/240));let M=this.camera;if(M.position.copy(D).lerp(j,u),this.keepAimT>0){this.keepAimT-=e,(i.lockTarget||i.state===`dead`)&&(this.keepAimT=0);let t=this.tmp2.subVectors(this.keepAimPt,M.position);t.lengthSq()>.25&&(this.yaw=Math.atan2(t.x,t.z),this.pitch=xd(Math.atan2(t.y,Math.hypot(t.x,t.z)),-1.3,this.blend>.5?1.45:1.05))}let ee=0;n.fovKick&&(i.sprinting&&(ee+=6),i.state===`dodge`&&(ee+=4),i.state===`attack`&&i.attack?.def.spin&&(ee+=4)),this.fovKick=$(this.fovKick,ee,6,e),M.fov=n.fov+this.fovKick+d.fov-this.aimBlend*(u>.5?18:12)*(.5+.5*i.bowDraw),M.updateProjectionMatrix();let N=this.ctx.shake,te=u>.5&&i.state===`dodge`&&(i.dodgeType===`hopL`||i.dodgeType===`hopR`)?Math.sin(X(i.stateT/.3)*Math.PI)*.08*(i.dodgeType===`hopL`?1:-1):0,P=this.swingLean.set(0,0,0);if(u>.5&&n.fpSwingLean>0){let e=i.state===`attack`&&i.attack?i.attack.def:i.state===`charge`&&i.weapon?.charged?Tf[i.weapon.charged]:null;e&&i.mainHand!==`bow`&&qp(Ip(e.id),i.state===`charge`?`charge`:i.swingPhase,i.swingU,P),P.multiplyScalar(n.fpSwingLean*u)}this.leanSm.lerp(P,1-Math.exp(-e*30));let ne=this.runSway*(n.camBob?n.camBobAmount:0)*Z(.35,1,u),F=this.bobPhase*Math.PI*2,re=Math.sin(F)*Z(.013,.007,u)*ne,ie=(Math.abs(Math.cos(F))-.64)*Z(.014,.006,u)*ne,I=Math.sin(F)*Z(.004,.002,u)*ne,ae=i.state===`climb`?(Math.sin(i.climbPhase*Math.PI*2)*i.climbMove*.035-i.climbDir.x*i.climbMove*.05)*u:0,oe=i.state===`climb`?-Math.max(0,-i.climbDir.y)*i.climbMove*.45*u:0,L=i.state===`climb`?-i.climbDir.x*i.climbMove*.3*u:0,se=i.state===`mantle`?-.5*Math.sin(X(i.anim.actionU/.85)*Math.PI)*u:0,ce=xd(this.pitch+N.rot.x+this.leanSm.x+d.rot.x+ie+se+oe,-1.5,1.5);M.rotation.set(ce,this.yaw+Math.PI+N.rot.y+this.leanSm.y+d.rot.y+I+L,N.rot.z+te+this.leanSm.z+d.rot.z+re+ae,`YXZ`),M.updateMatrixWorld(),this.tmp.set(N.offset.x,N.offset.y,0).applyQuaternion(M.quaternion),M.position.add(this.tmp),M.updateMatrixWorld(),this.raycaster.far=0}get headDistance(){return this.camera.position.distanceTo(this.pivot)}},$p=new G().setFromEuler(new on(1.9,0,0)),em=class{ctx;id=Wf();team=`enemy`;alive=!0;material=`flesh`;lockable=!0;hurtboxes;stickRoot;rig;animator;motor;club;shieldModel=null;trail=new Cp(18);footIK;shielded;facing=0;hp;maxHp;state=`spawn`;stateT=0;stateDur=0;attackDef=Tf.club1;timing=Df(Tf.club1,1,1);hitSet=new Set;swung=!1;prevT=0;cooldown=Q(.8,1.6);strafeDir=1;strafeT=0;hasToken=!1;hurtDir=new K;anim=Qf();lastFacing=0;hpBar;hpFill;hpShowT=0;hpLag=1;hpLagSprite;weaponSpring=new jd(260,16);shieldSpring=new jd(220,14);deadT=0;removed=!1;tmp=new K;tmp2=new K;hand=new K;base=new K;tip=new K;dir=new K;edge=new K;q=new G;yawQ=new G;constructor(e,t,n={}){this.ctx=e,this.shielded=!!n.shielded,this.maxHp=this.hp=n.hp??(this.shielded?80:60);let r={...Jf};this.shielded&&(r.skin=5926594,r.tunic=3817290,r.tunicDark=2764342),this.rig=new Zf(r),this.animator=new $f(this.rig),this.footIK=new Sp(e.physics),this.animator.onFootstep=(t,n)=>{e.events.emit(`footstep`,{pos:this.motor.position.clone(),surface:this.motor.surface,intensity:n*.6,player:!1})},this.stickRoot=this.rig.root,this.motor=new Cf(e.physics),this.motor.radius=.4,this.motor.teleport(t),e.scene.add(this.rig.root),this.club=vf(`club`),e.scene.add(this.club.root),e.scene.add(this.trail.mesh),this.hurtboxes=[{a:new K,b:new K,radius:.42,tag:`body`},{a:new K,b:new K,radius:.2,tag:`head`}],this.shielded&&(this.shieldModel=vf(`shield`),this.shieldModel.root.traverse(e=>{let t=e.material;t&&`metalness`in t&&(t.color.set(9081502),t.metalness=.9,t.roughness=.35)}),this.shieldModel.root.scale.setScalar(1.15),e.scene.add(this.shieldModel.root),this.hurtboxes.push({a:new K,b:new K,radius:.34,tag:`shield`,material:`metal`})),this.hpBar=new wn;let i=e=>{let t=new Zr(new Lr({color:e,depthTest:!1,transparent:!0}));return t.center.set(0,.5),t.renderOrder=20,t},a=i(1708054);a.scale.set(.84,.1,1),a.position.x=-.42,this.hpLagSprite=i(16769184),this.hpLagSprite.position.x=-.4,this.hpFill=i(15218767),this.hpFill.position.x=-.4,this.hpBar.add(a,this.hpLagSprite,this.hpFill),this.hpBar.visible=!1,e.scene.add(this.hpBar),this.setState(`spawn`,.9),this.facing=Q(-Math.PI,Math.PI),e.events.emit(`enemySpawn`,{pos:t.clone()})}get position(){return this.motor.position}center(e){return e.copy(this.motor.position).setY(this.motor.position.y+1.3*this.rig.style.scale)}setState(e,t=0){this.state=e,this.stateT=0,this.stateDur=t}isThreatening(e,t){return!this.alive||this.motor.position.distanceTo(e)>3.6?!1:this.state===`windup`?this.timing.windup-this.stateT<=t:this.state===`attack`&&this.stateT<this.timing.active}receiveHit(e){let t=Hf(`flesh`);if(!this.alive||this.state===`spawn`)return t.ignored=!0,t;let n=this.ctx.tuning,r=this.tmp.subVectors(e.origin,this.motor.position).setY(0).normalize(),i=Rd(this.facing,this.tmp2),a=r.dot(i)>.2;if(e.hurtbox.tag===`shield`&&a&&this.state!==`stagger`&&!e.unblockable)return t.material=`metal`,t.blocked=!0,this.shieldSpring.impulse(6+e.strength*6),this.hpShowT=2,!e.projectile&&(e.charged||e.strength>=.85)?(t.damage=Math.round(e.damage*.35),this.hp-=t.damage,this.stagger(1.3),this.ctx.sound.play(`guardBreak`,{pos:e.point})):e.projectile||(t.deflected=!0,this.setState(`guard`,.35)),this.hp<=0&&this.die(t),t;e.hurtbox.tag===`shield`&&(e.hurtbox=this.hurtboxes[0]);let o=e.hurtbox.tag===`head`,s=this.state===`stagger`,c=e.damage*(s?1.5:1)*(o?e.projectile?2:1.25:1);c=Math.round(c),t.damage=c,this.hp-=c,this.hpShowT=3,n.hitFlashEnabled&&this.rig.flash(16777215,.09);let l=this.tmp2.copy(e.dir).setY(0).normalize().multiplyScalar(.5).addScaledVector(r,-1).setY(0).normalize();this.hurtDir.copy(l);let u=e.knockback*n.knockbackMul;return this.motor.velocity.x=l.x*u,this.motor.velocity.z=l.z*u,e.strength>=.8&&(this.motor.velocity.y=3.5+e.strength*1.5),this.hp<=0?(this.die(t),t):(o&&e.projectile?this.stagger(1.1):this.state===`stagger`||this.state===`attack`&&this.stateT<this.timing.active&&e.strength<.5||(this.releaseToken(),this.setState(`hurt`,.25+e.strength*.35),this.ctx.sound.play(`enemyHurt`,{pos:this.motor.position,pitch:Q(.9,1.2)})),t)}die(e){e.killed=!0,this.hp=0,this.alive=!1,this.releaseToken(),this.setState(`dead`,1.1),this.hpBar.visible=!1,this.club.setGlow(0)}stagger(e){this.releaseToken(),this.setState(`stagger`,e),this.club.setGlow(0),this.ctx.sound.play(`stagger`,{pos:this.motor.position})}onParried(){this.stagger(1.6),this.weaponSpring.impulse(-10);let e=Rd(this.facing,this.tmp).multiplyScalar(-4.5);this.motor.velocity.x=e.x,this.motor.velocity.z=e.z}releaseToken(){this.hasToken=!1}update(e,t,n){let r=this.ctx.tuning;this.stateT+=e;let i=this.motor,a=i.velocity,o=new K,s=null,c=8,l=Math.max(.2,r.enemyAggression),u=this.tmp.set(0,0,0),d=999;switch(t&&t.alive&&(u.subVectors(t.position,i.position).setY(0),d=u.length(),u.normalize()),this.state){case`spawn`:this.stateT>=this.stateDur&&this.setState(`idle`);break;case`idle`:let r=t?.sneaking?8:22;t?.alive&&d<r&&this.setState(`chase`);break;case`chase`:if(!t?.alive){this.setState(`idle`);break}s=zd(u.x,u.z),this.cooldown-=e*l,d>2.3?o.copy(u).multiplyScalar(d>5?3.6:2.6):this.cooldown<=0&&n(this)?(this.hasToken=!0,this.beginAttack()):(this.setState(`strafe`),this.strafeT=Q(.8,1.8),this.strafeDir=Math.random()<.5?-1:1);break;case`strafe`:{if(!t?.alive){this.setState(`idle`);break}s=zd(u.x,u.z),this.cooldown-=e*l;let n=this.tmp2.set(-u.z,0,u.x).multiplyScalar(this.strafeDir*1.4),r=(d-2.6)*1.5;o.copy(n).addScaledVector(u,r),(this.stateT>this.strafeT||this.cooldown<=0&&d<2.4)&&this.setState(`chase`);break}case`windup`:{let e=this.timing.windup-this.stateT;t?.alive&&(s=zd(u.x,u.z)),c=e>.2?7:.5,this.stateT>=this.timing.windup&&(this.setState(`attack`),this.prevT=0);break}case`attack`:{let e=this.stateT;if(e<this.timing.active){let e=Rd(this.facing,this.tmp2);o.copy(e).multiplyScalar(d>1.3?this.attackDef.lunge:0)}e>=this.timing.active+this.timing.recovery&&(this.releaseToken(),this.cooldown=Q(1,2.2),this.setState(`strafe`),this.strafeT=Q(.6,1.4),this.strafeDir=Math.random()<.5?-1:1);break}case`hurt`:case`guard`:this.stateT>=this.stateDur&&this.setState(`chase`);break;case`stagger`:this.stateT>=this.stateDur&&(this.cooldown=Q(.3,.8),this.setState(`chase`));break;case`dead`:this.deadT+=e}if(this.state===`chase`||this.state===`strafe`||this.state===`attack`||this.state===`idle`||this.state===`windup`){let t=i.grounded?14:3;a.x=$(a.x,o.x,t,e),a.z=$(a.z,o.z,t,e)}else a.x=$(a.x,0,i.grounded?6:1,e),a.z=$(a.z,0,i.grounded?6:1,e);a.y-=r.gravity*(a.y<0?1.4:1)*e,s!==null&&(this.facing=Td(this.facing,s,c,e)),i.update(e),i.landedThisFrame&&i.landSpeed>5&&this.animator.land(.6);let f=i.position,p=this.rig.style.scale,m=this.state===`dead`;if(this.hurtboxes[0].a.set(f.x,f.y+.35,f.z),this.hurtboxes[0].b.set(f.x,f.y+(m?.4:1.3)*p,f.z),this.rig.joints.head.getWorldPosition(this.hurtboxes[1].a),this.hurtboxes[1].a.y+=.12,this.hurtboxes[1].b.copy(this.hurtboxes[1].a),this.shielded){let e=this.hurtboxes[2];e.enabled=this.state!==`stagger`&&this.state!==`dead`&&this.state!==`spawn`;let t=Rd(this.facing,this.tmp2),n=this.tmp.set(Math.cos(this.facing),0,-Math.sin(this.facing));e.a.copy(f).addScaledVector(t,.55).addScaledVector(n,.12).setY(f.y+.55),e.b.copy(e.a).setY(f.y+1.45)}this.updateAttackHits(t),this.updateVisual(e)}beginAttack(){this.attackDef=Sd([Tf.club1,Tf.club2]);let e=Math.max(.3,this.ctx.tuning.enemyAggression);this.timing=Df(this.attackDef,1,1),this.timing.windup/=Math.sqrt(e),this.timing.total=this.timing.windup+this.timing.active+this.timing.recovery,this.hitSet.clear(),this.swung=!1,this.setState(`windup`),this.ctx.events.emit(`enemyWindup`,{pos:this.motor.position.clone().setY(this.motor.position.y+1.6)})}attackTime(){return this.state===`windup`?this.stateT:this.state===`attack`?this.timing.windup+this.stateT:0}updateAttackHits(e){if(this.state!==`attack`)return;let t=this.timing,n=this.attackTime();this.swung||(this.swung=!0,this.ctx.events.emit(`swing`,{pos:this.motor.position.clone().setY(this.motor.position.y+1.3),intensity:this.attackDef.whoosh,source:`enemy`}));let r=Math.max(this.prevT,t.windup),i=Math.min(n,t.windup+t.active);if(this.prevT=n,i<=r||!e)return;let a=Ef.club;for(let e=1;e<=6;e++){let n=r+(i-r)*e/6,o=Of(this.attackDef,t,n).angle;Vf(this.attackDef,a,o,1,this.motor.position,this.facing,this.rig.style.scale,this.hand,this.base,this.tip,this.dir,this.edge);let s=this.ctx.combat.querySegment(this.base,this.tip,a.hitRadius,`enemy`,this.hitSet,e=>e.team===`player`);for(let e of s){this.hitSet.add(e.target.id);let t={attacker:this,team:`enemy`,tool:`club`,damage:this.attackDef.damage*this.ctx.tuning.enemyDamageMul,strength:this.attackDef.strength,knockback:this.attackDef.knockback,point:e.point,dir:this.edge.clone(),normal:e.normal,hurtbox:e.hurtbox,projectile:!1,charged:!1,origin:this.motor.position.clone()},n=e.target.receiveHit(t);this.ctx.events.emit(`hit`,{hit:t,result:n,target:e.target,source:`enemy`}),n.blocked&&!n.parried&&this.weaponSpring.impulse(-8)}}}updateVisual(e){let t=this.rig,n=this.motor;t.root.position.copy(n.position),t.root.position.y+=n.visualStepOffset,t.root.rotation.y=this.facing;let r=this.anim,i=n.velocity;r.speed=this.state===`hurt`||this.state===`stagger`?0:Math.hypot(i.x,i.z),r.runSpeed=3.6,r.walkSpeed=1.8,r.ready=1,r.hasShieldUp=this.shielded,r.moveAngle=r.speed>.2?wd(this.facing,zd(i.x,i.z)):0,r.strafing=this.state===`strafe`||this.state===`windup`,r.grounded=n.grounded,r.vy=i.y,r.turnRate=e>0?wd(this.lastFacing,this.facing)/e:0,this.lastFacing=this.facing,r.guard=+(this.state===`guard`),r.attackTwist=0,r.spinYaw=0,r.crouch=0,r.action={spawn:`spawn`,idle:`none`,chase:`none`,strafe:`none`,windup:`attack`,attack:`attack`,hurt:`hurt`,stagger:`stagger`,guard:`guardHit`,dead:`dead`}[this.state],r.actionT=this.stateT,r.actionU=this.stateDur>0?X(this.stateT/this.stateDur):0;let a=0;if((this.state===`windup`||this.state===`attack`)&&(a=Of(this.attackDef,this.timing,this.attackTime()).angle,r.attackTwist=-(a*Math.PI)/180*.3,r.crouch=this.state===`windup`?.3:.1),this.state===`hurt`){let e=Rd(this.facing,this.tmp);r.hurtZ=-this.hurtDir.dot(e),r.hurtX=this.hurtDir.x*e.z-this.hurtDir.z*e.x}this.animator.update(e,r),this.footIK.update(e,t,n.grounded&&this.state!==`dead`&&this.state!==`spawn`&&this.state!==`stagger`&&Math.hypot(i.x,i.z)<.6,1,!n.grounded),t.updateFlash(e),this.weaponSpring.update(e),this.shieldSpring.update(e),t.root.updateMatrixWorld(!0);let o=this.club.root,s=this.state===`windup`||this.state===`attack`;if(this.yawQ.setFromAxisAngle(new K(0,1,0),this.facing),s){Pf(this.attackDef,a,this.dir,this.edge);let e=t.style.scale;this.hand.copy(Ff).multiplyScalar(e).addScaledVector(this.dir,Lf*e).applyQuaternion(this.yawQ).add(n.position),this.dir.applyQuaternion(this.yawQ),this.edge.applyQuaternion(this.yawQ),Mp(this.dir,this.edge,this.q),o.position.copy(this.hand),o.quaternion.copy(this.q);let r=t.joints.upperArmR.getWorldPosition(new K);r.add(new K(-Math.cos(this.facing)*.5,-.6,Math.sin(this.facing)*.5)),yp(t.joints.upperArmR,t.joints.forearmR,Yf,Xf,this.hand,r,1);let i=this.state===`windup`?X(this.stateT/this.timing.windup):0;if(this.club.setGlow(i*(.6+Math.sin(this.stateT*40)*.4)),this.state===`attack`&&this.stateT<this.timing.active+.03){let e=Ef.club;this.trail.color.set(16751226),this.trail.push(this.base.set(0,e.bladeStart,0).applyQuaternion(this.q).add(o.position),this.tip.set(0,e.bladeEnd,0).applyQuaternion(this.q).add(o.position))}}else t.sockets.handR.getWorldPosition(o.position),t.sockets.handR.getWorldQuaternion(o.quaternion),o.quaternion.multiply($p),this.weaponSpring.value&&o.rotateX(this.weaponSpring.value*.12),this.club.setGlow(0);if(this.trail.update(e,this.ctx.tuning.trailsEnabled,.8),this.shieldModel){let e=this.shieldModel.root,r=this.tmp.set(.12,1.02,.5-this.shieldSpring.value*.04).applyQuaternion(this.yawQ).add(n.position);if(e.position.copy(r),e.quaternion.setFromEuler(new on(-.1-this.shieldSpring.value*.06,this.facing,.05,`YXZ`)),this.state===`stagger`||this.state===`dead`)t.sockets.handL.getWorldPosition(e.position),t.sockets.handL.getWorldQuaternion(e.quaternion),e.quaternion.multiply(new G().setFromEuler(new on(0,Math.PI/2,0)));else{let n=t.joints.upperArmL.getWorldPosition(new K);n.add(new K(Math.cos(this.facing)*.6,-.5,-Math.sin(this.facing)*.6));let r=new K(0,0,-.04).applyQuaternion(e.quaternion).add(e.position);yp(t.joints.upperArmL,t.joints.forearmL,Yf,Xf,r,n,1)}e.visible=!this.removed}this.hpShowT-=e;let c=X(this.hp/this.maxHp);this.hpLag=this.hpLag>c?$(this.hpLag,c,3,e):c,this.hpBar.visible=this.alive&&this.hpShowT>0,this.hpBar.position.copy(n.position).setY(n.position.y+2.25),this.hpFill.scale.set(.8*c+1e-4,.07,1),this.hpLagSprite.scale.set(.8*this.hpLag+1e-4,.07,1)}dispose(){this.removed=!0,this.rig.root.removeFromParent(),this.club.root.removeFromParent(),this.shieldModel?.root.removeFromParent(),this.trail.mesh.removeFromParent(),this.hpBar.removeFromParent(),this.rig.dispose()}},tm=class{ctx;enemies=[];maxAttackers=1;spawnCount=0;onEnemyRemoved;constructor(e){this.ctx=e}spawn(e,t){let n=e.clone().add(new K(Q(-1.2,1.2),0,Q(-1.2,1.2))),r=new em(this.ctx,n,{shielded:t??this.spawnCount%2==1});return this.spawnCount++,this.enemies.push(r),this.ctx.combat.add(r),r}requestToken=e=>{let t=this.enemies.filter(e=>e.hasToken&&e.alive).length,n=Math.max(1,Math.round(this.maxAttackers*Math.max(1,this.ctx.tuning.enemyAggression)));return e.hasToken||t<n};update(e,t){if(e<=0)return;for(let n of this.enemies)n.update(e,t,this.requestToken);let n=this.enemies;for(let e=0;e<n.length;e++){let r=n[e];if(r.alive){for(let t=e+1;t<n.length;t++){let e=n[t];if(!e.alive)continue;let i=e.position.x-r.position.x,a=e.position.z-r.position.z,o=Math.hypot(i,a),s=.9;if(o<s&&o>1e-4){let t=(s-o)*.5;r.position.x-=i/o*t,r.position.z-=a/o*t,e.position.x+=i/o*t,e.position.z+=a/o*t}}if(t&&t.alive){let e=r.position.x-t.position.x,n=r.position.z-t.position.z,i=Math.hypot(e,n),a=.8;i<a&&i>1e-4&&Math.abs(r.position.y-t.position.y)<1.2&&(r.position.x+=e/i*(a-i),r.position.z+=n/i*(a-i))}}}for(let e=n.length-1;e>=0;e--){let t=n[e];!t.alive&&t.deadT>1.1&&!t.removed&&(this.ctx.events.emit(`enemyDeath`,{pos:t.position.clone().setY(t.position.y+.6)}),this.ctx.combat.remove(t),t.dispose(),n.splice(e,1),this.onEnemyRemoved?.(t))}}clear(){for(let e of this.enemies)this.ctx.combat.remove(e),e.dispose();this.enemies=[]}},nm=(e,t,n,r)=>{let i=document.createElement(e);return t&&(i.className=t),r!==void 0&&(i.innerHTML=r),n?.appendChild(i),i},rm=class{ctx;inventory;root;hearts;staminaWrap;staminaArc;stPos={x:-1,y:-1};crosshair;hitmark;bowRet;lockRet;hotbar;slots=[];equipInfo;toasts;popupLayer;flashEl;vignetteEl;tintEl;modeLabel;statsEl;popups=[];vignetteAmt=0;flashT=0;flashDur=1;tintT=0;hitmarkT=0;v=new K;lastHp=-1;onHotbarClick;onHotbarLongPress;constructor(e,t){this.ctx=e,this.inventory=t;let n=nm(`div`,`hud`);this.root=n,document.body.appendChild(n),this.hearts=nm(`div`,`hearts`,n),this.staminaWrap=nm(`div`,`stamina`,n),this.staminaWrap.innerHTML=`<svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="17" class="st-bg"/><circle cx="22" cy="22" r="17" class="st-fg"/></svg>`,this.staminaArc=this.staminaWrap.querySelector(`.st-fg`),this.crosshair=nm(`div`,`crosshair`,n),this.hitmark=nm(`div`,`hitmarker`,n,`<i></i><i></i><i></i><i></i>`),this.bowRet=nm(`div`,`bow-reticle`,n,`<i></i><i></i><i></i><i></i>`),this.lockRet=nm(`div`,`lock-reticle`,n,`<b></b><b></b><b></b>`),this.hotbar=nm(`div`,`hotbar`,n);for(let e=0;e<t.hotbar.length;e++){let t=nm(`div`,`slot`,this.hotbar);t.dataset.i=String(e);let n=0,r=0;t.addEventListener(`pointerdown`,t=>{t.stopPropagation(),n=performance.now(),r=window.setTimeout(()=>this.onHotbarLongPress?.(e),500)}),t.addEventListener(`pointerup`,t=>{t.stopPropagation(),clearTimeout(r),performance.now()-n<500&&this.onHotbarClick?.(e)}),t.addEventListener(`pointercancel`,()=>clearTimeout(r)),this.slots.push(t)}this.equipInfo=nm(`div`,`equip-info`,n),this.toasts=nm(`div`,`toasts`,n),this.popupLayer=nm(`div`,`popups`,n),this.flashEl=nm(`div`,`screen-flash`,n),this.vignetteEl=nm(`div`,`screen-vignette`,n),this.tintEl=nm(`div`,`screen-tint`,n),this.modeLabel=nm(`div`,`mode-label`,n),this.statsEl=nm(`div`,`dummy-stats`,n),nm(`div`,`keyhints`,n,`<kbd>G</kbd> inimigo · <kbd>R</kbd> restaurar · <kbd>V</kbd> 1ª/3ª · <kbd>T</kbd> ombro<br><kbd>Q</kbd> lock-on · <kbd>I</kbd> inventário · <kbd>P</kbd> ajustes · <kbd>B</kbd> juice · <kbd>H</kbd> ajuda`),t.events.on(`changed`,()=>this.renderHotbar()),t.events.on(`hotbar`,()=>this.renderHotbar()),t.events.on(`added`,({id:e})=>{let n=t.hotbar.indexOf(e);if(n>=0){let e=this.slots[n];e.classList.remove(`pulse`),e.offsetWidth,e.classList.add(`pulse`)}}),e.events.on(`toast`,({text:e,kind:t})=>this.toast(e,t)),e.events.on(`pickup`,({item:e,count:n})=>this.toast(`+${n} ${tf[e].name}  (${t.count(e)})`,`good`,tf[e].icon)),e.events.on(`noAmmo`,()=>{this.equipInfo.classList.remove(`shake`),this.equipInfo.offsetWidth,this.equipInfo.classList.add(`shake`)}),this.renderHotbar()}flash(e,t,n){t<=0||(this.flashEl.style.background=e,this.flashT=this.flashDur=n,this.flashEl.dataset.a=String(t))}vignette(e,t){this.vignetteAmt=Math.max(this.vignetteAmt,t)}tint(e,t){this.ctx.tuning.screenFx&&(this.tintEl.style.background=e,this.tintT=t)}hitMarker(e,t){this.hitmarkT=.18,this.hitmark.classList.toggle(`kill`,e),this.hitmark.classList.toggle(`ranged`,t)}popup(e,t,n,r){let i=nm(`div`,`popup`,this.popupLayer,e);i.style.color=n,i.style.fontSize=`${Math.round(18*r)}px`,this.popups.push({div:i,pos:t.clone(),age:0,life:.85,vx:(Math.random()-.5)*40}),this.popups.length>40&&this.popups.shift().div.remove()}toast(e,t=`info`,n){let r=this.toasts.lastElementChild;if(r&&r.dataset.text===e){r.classList.remove(`bump`),r.offsetWidth,r.classList.add(`bump`);return}let i=nm(`div`,`toast ${t}`,this.toasts);for(i.dataset.text=e,i.innerHTML=`${n?`<span class="ti">${n}</span>`:``}<span>${e}</span>`,setTimeout(()=>i.classList.add(`out`),2200),setTimeout(()=>i.remove(),2700);this.toasts.children.length>5;)this.toasts.firstElementChild?.remove()}renderHotbar(){let e=this.inventory;this.slots.forEach((t,n)=>{let r=e.hotbar[n],i=r?e.count(r):0,a=r?tf[r]:null,o=a&&a.stack>1;t.innerHTML=`<span class="key">${n+1}</span>${a?a.icon:``}${o?`<span class="count">${i}</span>`:``}`,t.classList.toggle(`sel`,n===e.selected),t.classList.toggle(`empty`,!!r&&!o&&i===0),t.title=a?a.name:`vazio`})}renderHearts(e,t){let n=Math.ceil(t/20),r=``;for(let t=0;t<n;t++){let n=Math.max(0,Math.min(1,(e-t*20)/20));r+=`<div class="heart"><svg viewBox="0 0 24 22"><path class="h-bg" d="M12 21l-1.5-1.3C5 15 1.5 12 1.5 7.8 1.5 4.4 4.1 2 7.3 2c1.8 0 3.6.9 4.7 2.3C13.1 2.9 14.9 2 16.7 2c3.2 0 5.8 2.4 5.8 5.8 0 4.2-3.5 7.2-9 11.9z"/><clipPath id="hc${t}"><rect x="0" y="0" width="${24*n}" height="22"/></clipPath><path class="h-fg" clip-path="url(#hc${t})" d="M12 21l-1.5-1.3C5 15 1.5 12 1.5 7.8 1.5 4.4 4.1 2 7.3 2c1.8 0 3.6.9 4.7 2.3C13.1 2.9 14.9 2 16.7 2c3.2 0 5.8 2.4 5.8 5.8 0 4.2-3.5 7.2-9 11.9z"/></svg></div>`}this.hearts.innerHTML=r}project(e,t){this.v.copy(e).project(t);let n=this.v.z<1&&this.v.z>-1;return{x:(this.v.x*.5+.5)*window.innerWidth,y:(-this.v.y*.5+.5)*window.innerHeight,vis:n}}update(e,t,n,r,i){let a=this.ctx.tuning,o=Math.max(0,Math.round(n.hp));o!==this.lastHp&&(o<this.lastHp&&(this.hearts.classList.remove(`hurt`),this.hearts.offsetWidth,this.hearts.classList.add(`hurt`)),this.lastHp=o,this.renderHearts(o,n.maxHp)),this.hearts.classList.toggle(`low`,o<=20&&o>0);let s=n.stamina/a.staminaMax,c=2*Math.PI*17;this.staminaArc.style.strokeDasharray=`${c*s} ${c}`;let l=s<.995||n.sprinting;this.staminaWrap.classList.toggle(`show`,l),this.staminaWrap.classList.toggle(`exhausted`,n.exhausted);let u=this.project(this.v.copy(n.position).setY(n.position.y+1.5),t),d=u.x+50,f=u.y-30;r&&(d=window.innerWidth/2,f=window.innerHeight/2),this.staminaWrap.classList.toggle(`fp`,r);let p=this.stPos.x<0?1:1-Math.exp(-e*14);this.stPos.x+=(d-this.stPos.x)*p,this.stPos.y+=(f-this.stPos.y)*p,this.staminaWrap.style.transform=`translate(${this.stPos.x}px, ${this.stPos.y}px)`;let m=n.state===`bow`;this.bowRet.classList.toggle(`show`,m);let h=26-n.bowDraw*20;this.bowRet.style.setProperty(`--s`,`${h}px`),this.bowRet.classList.toggle(`full`,n.bowDraw>=1),this.crosshair.classList.toggle(`show`,r||m||n.mainHand===`bow`),this.hitmarkT-=e,this.hitmark.classList.toggle(`show`,this.hitmarkT>0);let g=n.lockTarget;if(g&&g.alive){let e=this.project(g.center(this.v),t);this.lockRet.classList.toggle(`show`,e.vis),this.lockRet.style.transform=`translate(${e.x}px, ${e.y}px)`}else this.lockRet.classList.remove(`show`);let _=n.mainHand?tf[n.mainHand].name:`Mãos vazias`,v=n.offHand?` + Escudo`:``,y=n.inventory.count(`arrow`);this.equipInfo.innerHTML=`<b>${_}</b>${n.mainHand===`bow`?``:v}<span class="arrows ${y===0?`zero`:``}">${tf.arrow.icon}<em>${y}</em></span>`;let b=n.state===`climb`?`Escalando`:n.state===`mantle`?`Subindo`:n.sneaking?`Esgueirando`:n.sprinting?`Correndo`:`Andando`;this.modeLabel.textContent=`${r?`1ª pessoa`:`3ª pessoa`} · ${b}`,i&&(this.statsEl.innerHTML=`<b>Boneco</b> último <em>${i.lastDamage}</em> · combo <em>${i.combo}</em> · DPS <em>${i.dps.toFixed(1)}</em>`);for(let n=this.popups.length-1;n>=0;n--){let r=this.popups[n];r.age+=e;let i=r.age/r.life;if(i>=1){r.div.remove(),this.popups.splice(n,1);continue}let a=this.project(r.pos,t),o=30*Math.sqrt(i)+20*i,s=i<.12?.6+i/.12*.7:1.3-Math.min(.3,(i-.12)*1.5);r.div.style.opacity=a.vis?String(i>.7?1-(i-.7)/.3:1):`0`,r.div.style.transform=`translate(${a.x+r.vx*i}px, ${a.y-o}px) translate(-50%, -50%) scale(${s})`}this.flashT-=e;let x=Math.max(0,this.flashT/this.flashDur)*Number(this.flashEl.dataset.a??0);this.flashEl.style.opacity=String(x),this.vignetteAmt=Math.max(0,this.vignetteAmt-e*1.8);let S=o>0&&o<=20&&a.screenFx?.25+Math.sin(performance.now()/180)*.1:0;this.vignetteEl.style.opacity=String(Math.max(this.vignetteAmt,S)),this.tintT-=e,this.tintEl.style.opacity=this.tintT>0?String(Math.min(1,this.tintT*2)):`0`}},im=class{inventory;root;grid;details;selected=-1;isOpen=!1;onEquip;onClose;getEquipped=()=>({main:null,off:null});constructor(e){this.inventory=e,this.root=document.createElement(`div`),this.root.className=`modal inventory`,this.root.innerHTML=`
      <div class="panel">
        <header><h2>Inventário</h2><div class="hdr-btns"><button class="sort">Organizar</button><button class="close" aria-label="Fechar">✕</button></div></header>
        <div class="inv-body"><div class="grid"></div><div class="details"></div></div>
        <footer>Toque/clique num item para ver detalhes, equipar ou colocar na barra rápida. Recursos iguais são agrupados automaticamente.</footer>
      </div>`,document.body.appendChild(this.root),this.grid=this.root.querySelector(`.grid`),this.details=this.root.querySelector(`.details`),this.root.querySelector(`.close`).addEventListener(`click`,()=>this.close()),this.root.querySelector(`.sort`).addEventListener(`click`,()=>e.sort()),this.root.addEventListener(`pointerdown`,e=>{e.target===this.root&&this.close()}),e.events.on(`changed`,()=>this.isOpen&&this.render())}open(){this.isOpen=!0,this.root.classList.add(`open`),this.render()}close(){this.isOpen&&(this.isOpen=!1,this.root.classList.remove(`open`),this.onClose?.())}toggle(){this.isOpen?this.close():this.open()}render(){let e=this.inventory,t=this.getEquipped();this.grid.innerHTML=``,e.slots.forEach((n,r)=>{let i=document.createElement(`button`);if(i.className=`islot`+(r===this.selected?` sel`:``)+(n?``:` empty`),n){let r=tf[n.id],a=t.main===n.id||t.off===n.id,o=e.hotbar.indexOf(n.id);i.innerHTML=`${r.icon}${r.stack>1?`<span class="count">${n.count}</span>`:``}${a?`<span class="eq">E</span>`:``}${o>=0?`<span class="hb">${o+1}</span>`:``}`,i.title=r.name}i.addEventListener(`click`,()=>{this.selected=r,this.render()}),this.grid.appendChild(i)});let n=e.slots[this.selected];if(!n){this.details.innerHTML=`<p class="muted">Selecione um item.</p>`;return}let r=tf[n.id],i=!!r.weapon||r.kind===`shield`,a=t.main===n.id||t.off===n.id;this.details.innerHTML=`
      <div class="big">${r.icon}</div>
      <h3>${r.name} <small>×${e.count(n.id)}</small></h3>
      <p>${r.desc}</p>
      ${i?`<button class="equip">${r.kind===`shield`?a?`Guardar escudo`:`Equipar escudo`:a?`Equipado`:`Equipar`}</button>`:``}
      <div class="assign"><span>Barra rápida:</span>${e.hotbar.map((e,t)=>`<button data-i="${t}" class="${e===n.id?`on`:``}">${t+1}</button>`).join(``)}</div>`,this.details.querySelector(`.equip`)?.addEventListener(`click`,()=>{this.onEquip?.(n.id),setTimeout(()=>this.render(),350)}),this.details.querySelectorAll(`.assign button`).forEach(t=>t.addEventListener(`click`,()=>{let r=Number(t.dataset.i);e.setHotbar(r,e.hotbar[r]===n.id?null:n.id)}))}},am=class{input;canvas;root;stick;knob;stickId=-1;stickOrigin={x:0,y:0};lookId=-1;lookLast={x:0,y:0};sprintOn=!1;jumpLabel=null;jumpIsDodge=!1;lookSensitivity=2.1;active=!1;constructor(e,t){this.input=e,this.canvas=t;let n=document.createElement(`div`);n.className=`touch`,n.innerHTML=`
      <div class="t-look"></div>
      <div class="t-move"><div class="t-stick"><div class="t-knob"></div></div></div>
      <div class="t-buttons"></div>
      <div class="t-top"></div>`,document.body.appendChild(n),this.root=n,this.stick=n.querySelector(`.t-stick`),this.knob=n.querySelector(`.t-knob`);let r=[{action:`attack`,label:`Atacar`,cls:`b-attack`,hold:!0},{action:`guard`,label:`Defender`,cls:`b-guard`,hold:!0},{action:`jump`,label:`Pular`,cls:`b-jump`,hold:!0},{action:`sneak`,label:`Agachar`,cls:`b-sneak`,hold:!0},{action:`sprint`,label:`Correr`,cls:`b-sprint`,toggle:!0},{action:`lock`,label:`Travar`,cls:`b-lock`,hold:!0}],i=n.querySelector(`.t-buttons`);for(let t of r){let n=document.createElement(`div`);n.className=`t-btn ${t.cls}`,n.innerHTML=`<span>${t.label}</span>`,t.action===`jump`&&(this.jumpLabel=n.querySelector(`span`)),n.addEventListener(`pointerdown`,r=>{r.preventDefault(),r.stopPropagation(),n.setPointerCapture(r.pointerId),t.toggle?(this.sprintOn=!this.sprintOn,n.classList.toggle(`on`,this.sprintOn),e.setButton(t.action,this.sprintOn)):(e.setButton(t.action,!0),n.classList.add(`on`)),navigator.vibrate?.(8)});let r=null;(t.action===`attack`||t.action===`guard`)&&(n.addEventListener(`pointerdown`,e=>r={x:e.clientX,y:e.clientY}),n.addEventListener(`pointermove`,t=>{r&&=(e.addLook((t.clientX-r.x)*this.lookSensitivity*.8,(t.clientY-r.y)*this.lookSensitivity*.8),{x:t.clientX,y:t.clientY})}));let a=i=>{i.preventDefault(),r=null,!t.toggle&&(e.setButton(t.action,!1),n.classList.remove(`on`))};n.addEventListener(`pointerup`,a),n.addEventListener(`pointercancel`,a),i.appendChild(n)}let a=n.querySelector(`.t-top`);for(let[t,n]of[[`view`,`1ª/3ª`],[`shoulder`,`Ombro`],[`inventory`,`Itens`],[`spawn`,`+Inimigo`],[`reset`,`Resetar`],[`juice`,`Juice`],[`tweak`,`Ajustes`],[`help`,`?`]]){let r=document.createElement(`button`);r.className=`t-small`,r.textContent=n,r.addEventListener(`pointerdown`,n=>{n.stopPropagation(),n.preventDefault(),e.tap(t)}),a.appendChild(r)}let o=n.querySelector(`.t-move`);o.addEventListener(`pointerdown`,e=>{this.stickId===-1&&(e.preventDefault(),this.stickId=e.pointerId,o.setPointerCapture(e.pointerId),this.stickOrigin={x:e.clientX,y:e.clientY},this.stick.style.left=`${e.clientX}px`,this.stick.style.top=`${e.clientY}px`,this.stick.classList.add(`on`),this.moveStick(e.clientX,e.clientY))}),o.addEventListener(`pointermove`,e=>{e.pointerId===this.stickId&&this.moveStick(e.clientX,e.clientY)});let s=t=>{t.pointerId===this.stickId&&(this.stickId=-1,this.stick.classList.remove(`on`),this.knob.style.transform=`translate(-50%,-50%)`,e.setTouchMove(0,0))};o.addEventListener(`pointerup`,s),o.addEventListener(`pointercancel`,s);let c=n.querySelector(`.t-look`);c.addEventListener(`pointerdown`,e=>{this.lookId===-1&&(this.lookId=e.pointerId,c.setPointerCapture(e.pointerId),this.lookLast={x:e.clientX,y:e.clientY})}),c.addEventListener(`pointermove`,t=>{if(t.pointerId!==this.lookId)return;let n=t.clientX-this.lookLast.x,r=t.clientY-this.lookLast.y;this.lookLast={x:t.clientX,y:t.clientY},e.addLook(n*this.lookSensitivity,r*this.lookSensitivity)});let l=e=>{e.pointerId===this.lookId&&(this.lookId=-1)};c.addEventListener(`pointerup`,l),c.addEventListener(`pointercancel`,l),this.canvas}moveStick(e,t){let n=e-this.stickOrigin.x,r=t-this.stickOrigin.y,i=Math.hypot(n,r);i>56&&(this.stickOrigin.x+=n/i*(i-56),this.stickOrigin.y+=r/i*(i-56),this.stick.style.left=`${this.stickOrigin.x}px`,this.stick.style.top=`${this.stickOrigin.y}px`,n=n/i*56,r=r/i*56),this.knob.style.transform=`translate(calc(-50% + ${n}px), calc(-50% + ${r}px))`;let a=n/56,o=-r/56;Math.hypot(a,o)<.12&&(a=o=0),this.input.setTouchMove(a,o)}setJumpIsDodge(e){e!==this.jumpIsDodge&&this.jumpLabel&&(this.jumpIsDodge=e,this.jumpLabel.textContent=e?`Esquiva`:`Pular`,this.jumpLabel.parentElement?.classList.toggle(`as-dodge`,e))}setActive(e){this.active=e,this.root.classList.toggle(`on`,e),document.body.classList.toggle(`touch-mode`,e),this.input.touchMode=e}},om=class e{constructor(t,n,r,i,a=`div`){this.parent=t,this.object=n,this.property=r,this._disabled=!1,this._hidden=!1,this.initialValue=this.getValue(),this.domElement=document.createElement(a),this.domElement.classList.add(`lil-controller`),this.domElement.classList.add(i),this.$name=document.createElement(`div`),this.$name.classList.add(`lil-name`),e.nextNameID=e.nextNameID||0,this.$name.id=`lil-gui-name-${++e.nextNameID}`,this.$widget=document.createElement(`div`),this.$widget.classList.add(`lil-widget`),this.$disable=this.$widget,this.domElement.appendChild(this.$name),this.domElement.appendChild(this.$widget),this.domElement.addEventListener(`keydown`,e=>e.stopPropagation()),this.domElement.addEventListener(`keyup`,e=>e.stopPropagation()),this.parent.children.push(this),this.parent.controllers.push(this),this.parent.$children.appendChild(this.domElement),this._listenCallback=this._listenCallback.bind(this),this.name(r)}name(e){return this._name=e,this.$name.textContent=e,this}onChange(e){return this._onChange=e,this}_callOnChange(){this.parent._callOnChange(this),this._onChange!==void 0&&this._onChange.call(this,this.getValue()),this._changed=!0}onFinishChange(e){return this._onFinishChange=e,this}_callOnFinishChange(){this._changed&&(this.parent._callOnFinishChange(this),this._onFinishChange!==void 0&&this._onFinishChange.call(this,this.getValue())),this._changed=!1}reset(){return this.setValue(this.initialValue),this._callOnFinishChange(),this}enable(e=!0){return this.disable(!e)}disable(e=!0){return e===this._disabled?this:(this._disabled=e,this.domElement.classList.toggle(`lil-disabled`,e),this.$disable.toggleAttribute(`disabled`,e),this)}show(e=!0){return this._hidden=!e,this.domElement.style.display=this._hidden?`none`:``,this}hide(){return this.show(!1)}options(e){let t=this.parent.add(this.object,this.property,e);return t.name(this._name),this.destroy(),t}min(e){return this}max(e){return this}step(e){return this}decimals(e){return this}listen(e=!0){return this._listening=e,this._listenCallbackID!==void 0&&(cancelAnimationFrame(this._listenCallbackID),this._listenCallbackID=void 0),this._listening&&this._listenCallback(),this}_listenCallback(){this._listenCallbackID=requestAnimationFrame(this._listenCallback);let e=this.save();e!==this._listenPrevValue&&this.updateDisplay(),this._listenPrevValue=e}getValue(){return this.object[this.property]}setValue(e){return this.getValue()!==e&&(this.object[this.property]=e,this._callOnChange(),this.updateDisplay()),this}updateDisplay(){return this}load(e){return this.setValue(e),this._callOnFinishChange(),this}save(){return this.getValue()}destroy(){this.listen(!1),this.parent.children.splice(this.parent.children.indexOf(this),1),this.parent.controllers.splice(this.parent.controllers.indexOf(this),1),this.parent.$children.removeChild(this.domElement)}},sm=class extends om{constructor(e,t,n){super(e,t,n,`lil-boolean`,`label`),this.$input=document.createElement(`input`),this.$input.setAttribute(`type`,`checkbox`),this.$input.setAttribute(`aria-labelledby`,this.$name.id),this.$widget.appendChild(this.$input),this.$input.addEventListener(`change`,()=>{this.setValue(this.$input.checked),this._callOnFinishChange()}),this.$disable=this.$input,this.updateDisplay()}updateDisplay(){return this.$input.checked=this.getValue(),this}};function cm(e){let t,n;return(t=e.match(/(#|0x)?([a-f0-9]{6})/i))?n=t[2]:(t=e.match(/rgb\(\s*(\d*)\s*,\s*(\d*)\s*,\s*(\d*)\s*\)/))?n=parseInt(t[1]).toString(16).padStart(2,0)+parseInt(t[2]).toString(16).padStart(2,0)+parseInt(t[3]).toString(16).padStart(2,0):(t=e.match(/^#?([a-f0-9])([a-f0-9])([a-f0-9])$/i))&&(n=t[1]+t[1]+t[2]+t[2]+t[3]+t[3]),n?`#`+n:!1}var lm={isPrimitive:!0,match:e=>typeof e==`string`,fromHexString:cm,toHexString:cm},um={isPrimitive:!0,match:e=>typeof e==`number`,fromHexString:e=>parseInt(e.substring(1),16),toHexString:e=>`#`+e.toString(16).padStart(6,0)},dm=[lm,um,{isPrimitive:!1,match:e=>Array.isArray(e)||ArrayBuffer.isView(e),fromHexString(e,t,n=1){let r=um.fromHexString(e);t[0]=(r>>16&255)/255*n,t[1]=(r>>8&255)/255*n,t[2]=(r&255)/255*n},toHexString([e,t,n],r=1){r=255/r;let i=e*r<<16^t*r<<8^n*r<<0;return um.toHexString(i)}},{isPrimitive:!1,match:e=>Object(e)===e,fromHexString(e,t,n=1){let r=um.fromHexString(e);t.r=(r>>16&255)/255*n,t.g=(r>>8&255)/255*n,t.b=(r&255)/255*n},toHexString({r:e,g:t,b:n},r=1){r=255/r;let i=e*r<<16^t*r<<8^n*r<<0;return um.toHexString(i)}}];function fm(e){return dm.find(t=>t.match(e))}var pm=class extends om{constructor(e,t,n,r){super(e,t,n,`lil-color`),this.$input=document.createElement(`input`),this.$input.setAttribute(`type`,`color`),this.$input.setAttribute(`tabindex`,-1),this.$input.setAttribute(`aria-labelledby`,this.$name.id),this.$text=document.createElement(`input`),this.$text.setAttribute(`type`,`text`),this.$text.setAttribute(`spellcheck`,`false`),this.$text.setAttribute(`aria-labelledby`,this.$name.id),this.$display=document.createElement(`div`),this.$display.classList.add(`lil-display`),this.$display.appendChild(this.$input),this.$widget.appendChild(this.$display),this.$widget.appendChild(this.$text),this._format=fm(this.initialValue),this._rgbScale=r,this._initialValueHexString=this.save(),this._textFocused=!1,this.$input.addEventListener(`input`,()=>{this._setValueFromHexString(this.$input.value)}),this.$input.addEventListener(`blur`,()=>{this._callOnFinishChange()}),this.$text.addEventListener(`input`,()=>{let e=cm(this.$text.value);e&&this._setValueFromHexString(e)}),this.$text.addEventListener(`focus`,()=>{this._textFocused=!0,this.$text.select()}),this.$text.addEventListener(`blur`,()=>{this._textFocused=!1,this.updateDisplay(),this._callOnFinishChange()}),this.$disable=this.$text,this.updateDisplay()}reset(){return this._setValueFromHexString(this._initialValueHexString),this}_setValueFromHexString(e){if(this._format.isPrimitive){let t=this._format.fromHexString(e);this.setValue(t)}else this._format.fromHexString(e,this.getValue(),this._rgbScale),this._callOnChange(),this.updateDisplay()}save(){return this._format.toHexString(this.getValue(),this._rgbScale)}load(e){return this._setValueFromHexString(e),this._callOnFinishChange(),this}updateDisplay(){return this.$input.value=this._format.toHexString(this.getValue(),this._rgbScale),this._textFocused||(this.$text.value=this.$input.value.substring(1)),this.$display.style.backgroundColor=this.$input.value,this}},mm=class extends om{constructor(e,t,n){super(e,t,n,`lil-function`),this.$button=document.createElement(`button`),this.$button.appendChild(this.$name),this.$widget.appendChild(this.$button),this.$button.addEventListener(`click`,e=>{e.preventDefault(),this.getValue().call(this.object),this._callOnChange()}),this.$button.addEventListener(`touchstart`,()=>{},{passive:!0}),this.$disable=this.$button}},hm=class extends om{constructor(e,t,n,r,i,a){super(e,t,n,`lil-number`),this._initInput(),this.min(r),this.max(i);let o=a!==void 0;this.step(o?a:this._getImplicitStep(),o),this.updateDisplay()}decimals(e){return this._decimals=e,this.updateDisplay(),this}min(e){return this._min=e,this._onUpdateMinMax(),this}max(e){return this._max=e,this._onUpdateMinMax(),this}step(e,t=!0){return this._step=e,this._stepExplicit=t,this}updateDisplay(){let e=this.getValue();if(this._hasSlider){let t=(e-this._min)/(this._max-this._min);t=Math.max(0,Math.min(t,1)),this.$fill.style.width=t*100+`%`}return this._inputFocused||(this.$input.value=this._decimals===void 0?e:e.toFixed(this._decimals)),this}_initInput(){this.$input=document.createElement(`input`),this.$input.setAttribute(`type`,`text`),this.$input.setAttribute(`aria-labelledby`,this.$name.id),window.matchMedia(`(pointer: coarse)`).matches&&(this.$input.setAttribute(`type`,`number`),this.$input.setAttribute(`step`,`any`)),this.$widget.appendChild(this.$input),this.$disable=this.$input;let e=()=>{let e=parseFloat(this.$input.value);isNaN(e)||(this._stepExplicit&&(e=this._snap(e)),this.setValue(this._clamp(e)))},t=e=>{let t=parseFloat(this.$input.value);isNaN(t)||(this._snapClampSetValue(t+e),this.$input.value=this.getValue())},n=e=>{e.key===`Enter`&&this.$input.blur(),e.code===`ArrowUp`&&(e.preventDefault(),t(this._step*this._arrowKeyMultiplier(e))),e.code===`ArrowDown`&&(e.preventDefault(),t(this._step*this._arrowKeyMultiplier(e)*-1))},r=e=>{this._inputFocused&&(e.preventDefault(),t(this._step*this._normalizeMouseWheel(e)))},i=!1,a,o,s,c,l,u=e=>{a=e.clientX,o=s=e.clientY,i=!0,c=this.getValue(),l=0,window.addEventListener(`mousemove`,d),window.addEventListener(`mouseup`,f)},d=e=>{if(i){let t=e.clientX-a,n=e.clientY-o;Math.abs(n)>5?(e.preventDefault(),this.$input.blur(),i=!1,this._setDraggingStyle(!0,`vertical`)):Math.abs(t)>5&&f()}if(!i){let t=e.clientY-s;l-=t*this._step*this._arrowKeyMultiplier(e),c+l>this._max?l=this._max-c:c+l<this._min&&(l=this._min-c),this._snapClampSetValue(c+l)}s=e.clientY},f=()=>{this._setDraggingStyle(!1,`vertical`),this._callOnFinishChange(),window.removeEventListener(`mousemove`,d),window.removeEventListener(`mouseup`,f)};this.$input.addEventListener(`input`,e),this.$input.addEventListener(`keydown`,n),this.$input.addEventListener(`wheel`,r,{passive:!1}),this.$input.addEventListener(`mousedown`,u),this.$input.addEventListener(`focus`,()=>{this._inputFocused=!0}),this.$input.addEventListener(`blur`,()=>{this._inputFocused=!1,this.updateDisplay(),this._callOnFinishChange()})}_initSlider(){this._hasSlider=!0,this.$slider=document.createElement(`div`),this.$slider.classList.add(`lil-slider`),this.$fill=document.createElement(`div`),this.$fill.classList.add(`lil-fill`),this.$slider.appendChild(this.$fill),this.$widget.insertBefore(this.$slider,this.$input),this.domElement.classList.add(`lil-has-slider`);let e=(e,t,n,r,i)=>(e-t)/(n-t)*(i-r)+r,t=t=>{let n=this.$slider.getBoundingClientRect(),r=e(t,n.left,n.right,this._min,this._max);this._snapClampSetValue(r)},n=e=>{this._setDraggingStyle(!0),t(e.clientX),window.addEventListener(`mousemove`,r),window.addEventListener(`mouseup`,i)},r=e=>{t(e.clientX)},i=()=>{this._callOnFinishChange(),this._setDraggingStyle(!1),window.removeEventListener(`mousemove`,r),window.removeEventListener(`mouseup`,i)},a=!1,o,s,c=e=>{e.preventDefault(),this._setDraggingStyle(!0),t(e.touches[0].clientX),a=!1},l=e=>{e.touches.length>1||(this._hasScrollBar?(o=e.touches[0].clientX,s=e.touches[0].clientY,a=!0):c(e),window.addEventListener(`touchmove`,u,{passive:!1}),window.addEventListener(`touchend`,d))},u=e=>{if(a){let t=e.touches[0].clientX-o,n=e.touches[0].clientY-s;Math.abs(t)>Math.abs(n)?c(e):(window.removeEventListener(`touchmove`,u),window.removeEventListener(`touchend`,d))}else e.preventDefault(),t(e.touches[0].clientX)},d=()=>{this._callOnFinishChange(),this._setDraggingStyle(!1),window.removeEventListener(`touchmove`,u),window.removeEventListener(`touchend`,d)},f=this._callOnFinishChange.bind(this),p;this.$slider.addEventListener(`mousedown`,n),this.$slider.addEventListener(`touchstart`,l,{passive:!1}),this.$slider.addEventListener(`wheel`,e=>{if(Math.abs(e.deltaX)<Math.abs(e.deltaY)&&this._hasScrollBar)return;e.preventDefault();let t=this._normalizeMouseWheel(e)*this._step;this._snapClampSetValue(this.getValue()+t),this.$input.value=this.getValue(),clearTimeout(p),p=setTimeout(f,400)},{passive:!1})}_setDraggingStyle(e,t=`horizontal`){this.$slider&&this.$slider.classList.toggle(`lil-active`,e),document.body.classList.toggle(`lil-dragging`,e),document.body.classList.toggle(`lil-${t}`,e)}_getImplicitStep(){return this._hasMin&&this._hasMax?(this._max-this._min)/1e3:.1}_onUpdateMinMax(){!this._hasSlider&&this._hasMin&&this._hasMax&&(this._stepExplicit||this.step(this._getImplicitStep(),!1),this._initSlider(),this.updateDisplay())}_normalizeMouseWheel(e){let{deltaX:t,deltaY:n}=e;return Math.floor(e.deltaY)!==e.deltaY&&e.wheelDelta&&(t=0,n=-e.wheelDelta/120,n*=this._stepExplicit?1:10),t+-n}_arrowKeyMultiplier(e){let t=this._stepExplicit?1:10;return e.shiftKey?t*=10:e.altKey&&(t/=10),t}_snap(e){let t=0;return this._hasMin?t=this._min:this._hasMax&&(t=this._max),e-=t,e=Math.round(e/this._step)*this._step,e+=t,e=parseFloat(e.toPrecision(15)),e}_clamp(e){return e<this._min&&(e=this._min),e>this._max&&(e=this._max),e}_snapClampSetValue(e){this.setValue(this._clamp(this._snap(e)))}get _hasScrollBar(){let e=this.parent.root.$children;return e.scrollHeight>e.clientHeight}get _hasMin(){return this._min!==void 0}get _hasMax(){return this._max!==void 0}},gm=class extends om{constructor(e,t,n,r){super(e,t,n,`lil-option`),this.$select=document.createElement(`select`),this.$select.setAttribute(`aria-labelledby`,this.$name.id),this.$display=document.createElement(`div`),this.$display.classList.add(`lil-display`),this.$select.addEventListener(`change`,()=>{this.setValue(this._values[this.$select.selectedIndex]),this._callOnFinishChange()}),this.$select.addEventListener(`focus`,()=>{this.$display.classList.add(`lil-focus`)}),this.$select.addEventListener(`blur`,()=>{this.$display.classList.remove(`lil-focus`)}),this.$widget.appendChild(this.$select),this.$widget.appendChild(this.$display),this.$disable=this.$select,this.options(r)}options(e){return this._values=Array.isArray(e)?e:Object.values(e),this._names=Array.isArray(e)?e:Object.keys(e),this.$select.replaceChildren(),this._names.forEach(e=>{let t=document.createElement(`option`);t.textContent=e,this.$select.appendChild(t)}),this.updateDisplay(),this}updateDisplay(){let e=this.getValue(),t=this._values.indexOf(e);return this.$select.selectedIndex=t,this.$display.textContent=t===-1?e:this._names[t],this}},_m=class extends om{constructor(e,t,n){super(e,t,n,`lil-string`),this.$input=document.createElement(`input`),this.$input.setAttribute(`type`,`text`),this.$input.setAttribute(`spellcheck`,`false`),this.$input.setAttribute(`aria-labelledby`,this.$name.id),this.$input.addEventListener(`input`,()=>{this.setValue(this.$input.value)}),this.$input.addEventListener(`keydown`,e=>{e.code===`Enter`&&this.$input.blur()}),this.$input.addEventListener(`blur`,()=>{this._callOnFinishChange()}),this.$widget.appendChild(this.$input),this.$disable=this.$input,this.updateDisplay()}updateDisplay(){return this.$input.value=this.getValue(),this}},vm=`.lil-gui {
  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: 1;
  font-weight: normal;
  font-style: normal;
  text-align: left;
  color: var(--text-color);
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  --background-color: #1f1f1f;
  --text-color: #ebebeb;
  --title-background-color: #111111;
  --title-text-color: #ebebeb;
  --widget-color: #424242;
  --hover-color: #4f4f4f;
  --focus-color: #595959;
  --number-color: #2cc9ff;
  --string-color: #a2db3c;
  --font-size: 11px;
  --input-font-size: 11px;
  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
  --font-family-mono: Menlo, Monaco, Consolas, "Droid Sans Mono", monospace;
  --padding: 4px;
  --spacing: 4px;
  --widget-height: 20px;
  --title-height: calc(var(--widget-height) + var(--spacing) * 1.25);
  --name-width: 45%;
  --slider-knob-width: 2px;
  --slider-input-width: 27%;
  --color-input-width: 27%;
  --slider-input-min-width: 45px;
  --color-input-min-width: 45px;
  --folder-indent: 7px;
  --widget-padding: 0 0 0 3px;
  --widget-border-radius: 2px;
  --checkbox-size: calc(0.75 * var(--widget-height));
  --scrollbar-width: 5px;
}
.lil-gui, .lil-gui * {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
.lil-gui.lil-root {
  width: var(--width, 245px);
  display: flex;
  flex-direction: column;
  background: var(--background-color);
}
.lil-gui.lil-root > .lil-title {
  background: var(--title-background-color);
  color: var(--title-text-color);
}
.lil-gui.lil-root > .lil-children {
  overflow-x: hidden;
  overflow-y: auto;
}
.lil-gui.lil-root > .lil-children::-webkit-scrollbar {
  width: var(--scrollbar-width);
  height: var(--scrollbar-width);
  background: var(--background-color);
}
.lil-gui.lil-root > .lil-children::-webkit-scrollbar-thumb {
  border-radius: var(--scrollbar-width);
  background: var(--focus-color);
}
@media (pointer: coarse) {
  .lil-gui.lil-allow-touch-styles, .lil-gui.lil-allow-touch-styles .lil-gui {
    --widget-height: 28px;
    --padding: 6px;
    --spacing: 6px;
    --font-size: 13px;
    --input-font-size: 16px;
    --folder-indent: 10px;
    --scrollbar-width: 7px;
    --slider-input-min-width: 50px;
    --color-input-min-width: 65px;
  }
}
.lil-gui.lil-force-touch-styles, .lil-gui.lil-force-touch-styles .lil-gui {
  --widget-height: 28px;
  --padding: 6px;
  --spacing: 6px;
  --font-size: 13px;
  --input-font-size: 16px;
  --folder-indent: 10px;
  --scrollbar-width: 7px;
  --slider-input-min-width: 50px;
  --color-input-min-width: 65px;
}
.lil-gui.lil-auto-place, .lil-gui.autoPlace {
  max-height: 100%;
  position: fixed;
  top: 0;
  right: 15px;
  z-index: 1001;
}

.lil-controller {
  display: flex;
  align-items: center;
  padding: 0 var(--padding);
  margin: var(--spacing) 0;
}
.lil-controller.lil-disabled {
  opacity: 0.5;
}
.lil-controller.lil-disabled, .lil-controller.lil-disabled * {
  pointer-events: none !important;
}
.lil-controller > .lil-name {
  min-width: var(--name-width);
  flex-shrink: 0;
  white-space: pre;
  padding-right: var(--spacing);
  line-height: var(--widget-height);
}
.lil-controller .lil-widget {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  min-height: var(--widget-height);
}
.lil-controller.lil-string input {
  color: var(--string-color);
}
.lil-controller.lil-boolean {
  cursor: pointer;
}
.lil-controller.lil-color .lil-display {
  width: 100%;
  height: var(--widget-height);
  border-radius: var(--widget-border-radius);
  position: relative;
}
@media (hover: hover) {
  .lil-controller.lil-color .lil-display:hover:before {
    content: " ";
    display: block;
    position: absolute;
    border-radius: var(--widget-border-radius);
    border: 1px solid #fff9;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
}
.lil-controller.lil-color input[type=color] {
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
.lil-controller.lil-color input[type=text] {
  margin-left: var(--spacing);
  font-family: var(--font-family-mono);
  min-width: var(--color-input-min-width);
  width: var(--color-input-width);
  flex-shrink: 0;
}
.lil-controller.lil-option select {
  opacity: 0;
  position: absolute;
  width: 100%;
  max-width: 100%;
}
.lil-controller.lil-option .lil-display {
  position: relative;
  pointer-events: none;
  border-radius: var(--widget-border-radius);
  height: var(--widget-height);
  line-height: var(--widget-height);
  max-width: 100%;
  overflow: hidden;
  word-break: break-all;
  padding-left: 0.55em;
  padding-right: 1.75em;
  background: var(--widget-color);
}
@media (hover: hover) {
  .lil-controller.lil-option .lil-display.lil-focus {
    background: var(--focus-color);
  }
}
.lil-controller.lil-option .lil-display.lil-active {
  background: var(--focus-color);
}
.lil-controller.lil-option .lil-display:after {
  font-family: "lil-gui";
  content: "↕";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  padding-right: 0.375em;
}
.lil-controller.lil-option .lil-widget,
.lil-controller.lil-option select {
  cursor: pointer;
}
@media (hover: hover) {
  .lil-controller.lil-option .lil-widget:hover .lil-display {
    background: var(--hover-color);
  }
}
.lil-controller.lil-number input {
  color: var(--number-color);
}
.lil-controller.lil-number.lil-has-slider input {
  margin-left: var(--spacing);
  width: var(--slider-input-width);
  min-width: var(--slider-input-min-width);
  flex-shrink: 0;
}
.lil-controller.lil-number .lil-slider {
  width: 100%;
  height: var(--widget-height);
  background: var(--widget-color);
  border-radius: var(--widget-border-radius);
  padding-right: var(--slider-knob-width);
  overflow: hidden;
  cursor: ew-resize;
  touch-action: pan-y;
}
@media (hover: hover) {
  .lil-controller.lil-number .lil-slider:hover {
    background: var(--hover-color);
  }
}
.lil-controller.lil-number .lil-slider.lil-active {
  background: var(--focus-color);
}
.lil-controller.lil-number .lil-slider.lil-active .lil-fill {
  opacity: 0.95;
}
.lil-controller.lil-number .lil-fill {
  height: 100%;
  border-right: var(--slider-knob-width) solid var(--number-color);
  box-sizing: content-box;
}

.lil-dragging .lil-gui {
  --hover-color: var(--widget-color);
}
.lil-dragging * {
  cursor: ew-resize !important;
}
.lil-dragging.lil-vertical * {
  cursor: ns-resize !important;
}

.lil-gui .lil-title {
  height: var(--title-height);
  font-weight: 600;
  padding: 0 var(--padding);
  width: 100%;
  text-align: left;
  background: none;
  text-decoration-skip: objects;
}
.lil-gui .lil-title:before {
  font-family: "lil-gui";
  content: "▾";
  padding-right: 2px;
  display: inline-block;
}
.lil-gui .lil-title:active {
  background: var(--title-background-color);
  opacity: 0.75;
}
@media (hover: hover) {
  body:not(.lil-dragging) .lil-gui .lil-title:hover {
    background: var(--title-background-color);
    opacity: 0.85;
  }
  .lil-gui .lil-title:focus {
    text-decoration: underline var(--focus-color);
  }
}
.lil-gui.lil-root > .lil-title:focus {
  text-decoration: none !important;
}
.lil-gui.lil-closed > .lil-title:before {
  content: "▸";
}
.lil-gui.lil-closed > .lil-children {
  transform: translateY(-7px);
  opacity: 0;
}
.lil-gui.lil-closed:not(.lil-transition) > .lil-children {
  display: none;
}
.lil-gui.lil-transition > .lil-children {
  transition-duration: 300ms;
  transition-property: height, opacity, transform;
  transition-timing-function: cubic-bezier(0.2, 0.6, 0.35, 1);
  overflow: hidden;
  pointer-events: none;
}
.lil-gui .lil-children:empty:before {
  content: "Empty";
  padding: 0 var(--padding);
  margin: var(--spacing) 0;
  display: block;
  height: var(--widget-height);
  font-style: italic;
  line-height: var(--widget-height);
  opacity: 0.5;
}
.lil-gui.lil-root > .lil-children > .lil-gui > .lil-title {
  border: 0 solid var(--widget-color);
  border-width: 1px 0;
  transition: border-color 300ms;
}
.lil-gui.lil-root > .lil-children > .lil-gui.lil-closed > .lil-title {
  border-bottom-color: transparent;
}
.lil-gui + .lil-controller {
  border-top: 1px solid var(--widget-color);
  margin-top: 0;
  padding-top: var(--spacing);
}
.lil-gui .lil-gui .lil-gui > .lil-title {
  border: none;
}
.lil-gui .lil-gui .lil-gui > .lil-children {
  border: none;
  margin-left: var(--folder-indent);
  border-left: 2px solid var(--widget-color);
}
.lil-gui .lil-gui .lil-controller {
  border: none;
}

.lil-gui label, .lil-gui input, .lil-gui button {
  -webkit-tap-highlight-color: transparent;
}
.lil-gui input {
  border: 0;
  outline: none;
  font-family: var(--font-family);
  font-size: var(--input-font-size);
  border-radius: var(--widget-border-radius);
  height: var(--widget-height);
  background: var(--widget-color);
  color: var(--text-color);
  width: 100%;
}
@media (hover: hover) {
  .lil-gui input:hover {
    background: var(--hover-color);
  }
  .lil-gui input:active {
    background: var(--focus-color);
  }
}
.lil-gui input:disabled {
  opacity: 1;
}
.lil-gui input[type=text],
.lil-gui input[type=number] {
  padding: var(--widget-padding);
  -moz-appearance: textfield;
}
.lil-gui input[type=text]:focus,
.lil-gui input[type=number]:focus {
  background: var(--focus-color);
}
.lil-gui input[type=checkbox] {
  appearance: none;
  width: var(--checkbox-size);
  height: var(--checkbox-size);
  border-radius: var(--widget-border-radius);
  text-align: center;
  cursor: pointer;
}
.lil-gui input[type=checkbox]:checked:before {
  font-family: "lil-gui";
  content: "✓";
  font-size: var(--checkbox-size);
  line-height: var(--checkbox-size);
}
@media (hover: hover) {
  .lil-gui input[type=checkbox]:focus {
    box-shadow: inset 0 0 0 1px var(--focus-color);
  }
}
.lil-gui button {
  outline: none;
  cursor: pointer;
  font-family: var(--font-family);
  font-size: var(--font-size);
  color: var(--text-color);
  width: 100%;
  border: none;
}
.lil-gui .lil-controller button {
  height: var(--widget-height);
  text-transform: none;
  background: var(--widget-color);
  border-radius: var(--widget-border-radius);
}
@media (hover: hover) {
  .lil-gui .lil-controller button:hover {
    background: var(--hover-color);
  }
  .lil-gui .lil-controller button:focus {
    box-shadow: inset 0 0 0 1px var(--focus-color);
  }
}
.lil-gui .lil-controller button:active {
  background: var(--focus-color);
}

@font-face {
  font-family: "lil-gui";
  src: url("data:application/font-woff2;charset=utf-8;base64,d09GMgABAAAAAALkAAsAAAAABtQAAAKVAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHFQGYACDMgqBBIEbATYCJAMUCwwABCAFhAoHgQQbHAbIDiUFEYVARAAAYQTVWNmz9MxhEgodq49wYRUFKE8GWNiUBxI2LBRaVnc51U83Gmhs0Q7JXWMiz5eteLwrKwuxHO8VFxUX9UpZBs6pa5ABRwHA+t3UxUnH20EvVknRerzQgX6xC/GH6ZUvTcAjAv122dF28OTqCXrPuyaDER30YBA1xnkVutDDo4oCi71Ca7rrV9xS8dZHbPHefsuwIyCpmT7j+MnjAH5X3984UZoFFuJ0yiZ4XEJFxjagEBeqs+e1iyK8Xf/nOuwF+vVK0ur765+vf7txotUi0m3N0m/84RGSrBCNrh8Ee5GjODjF4gnWP+dJrH/Lk9k4oT6d+gr6g/wssA2j64JJGP6cmx554vUZnpZfn6ZfX2bMwPPrlANsB86/DiHjhl0OP+c87+gaJo/gY084s3HoYL/ZkWHTRfBXvvoHnnkHvngKun4KBE/ede7tvq3/vQOxDXB1/fdNz6XbPdcr0Vhpojj9dG+owuSKFsslCi1tgEjirjXdwMiov2EioadxmqTHUCIwo8NgQaeIasAi0fTYSPTbSmwbMOFduyh9wvBrESGY0MtgRjtgQR8Q1bRPohn2UoCRZf9wyYANMXFeJTysqAe0I4mrherOekFdKMrYvJjLvOIUM9SuwYB5DVZUwwVjJJOaUnZCmcEkIZZrKqNvRGRMvmFZsmhP4VMKCSXBhSqUBxgMS7h0cZvEd71AWkEhGWaeMFcNnpqyJkyXgYL7PQ1MoSq0wDAkRtJIijkZSmqYTiSImfLiSWXIZwhRh3Rug2X0kk1Dgj+Iu43u5p98ghopcpSo0Uyc8SnjlYX59WUeaMoDqmVD2TOWD9a4pCRAzf2ECgwGcrHjPOWY9bNxq/OL3I/QjwEAAAA=") format("woff2");
}`;function ym(e){let t=document.createElement(`style`);t.innerHTML=e;let n=document.querySelector(`head link[rel=stylesheet], head style`);n?document.head.insertBefore(t,n):document.head.appendChild(t)}var bm=!1,xm=class e{constructor({parent:e,autoPlace:t=e===void 0,container:n,width:r,title:i=`Controls`,closeFolders:a=!1,injectStyles:o=!0,touchStyles:s=!0}={}){if(this.parent=e,this.root=e?e.root:this,this.children=[],this.controllers=[],this.folders=[],this._closed=!1,this._hidden=!1,this.domElement=document.createElement(`div`),this.domElement.classList.add(`lil-gui`),this.$title=document.createElement(`button`),this.$title.classList.add(`lil-title`),this.$title.setAttribute(`aria-expanded`,!0),this.$title.addEventListener(`click`,()=>this.openAnimated(this._closed)),this.$title.addEventListener(`touchstart`,()=>{},{passive:!0}),this.$children=document.createElement(`div`),this.$children.classList.add(`lil-children`),this.domElement.appendChild(this.$title),this.domElement.appendChild(this.$children),this.title(i),this.parent){this.parent.children.push(this),this.parent.folders.push(this),this.parent.$children.appendChild(this.domElement);return}this.domElement.classList.add(`lil-root`),s&&this.domElement.classList.add(`lil-allow-touch-styles`),!bm&&o&&(ym(vm),bm=!0),n?n.appendChild(this.domElement):t&&(this.domElement.classList.add(`lil-auto-place`,`autoPlace`),document.body.appendChild(this.domElement)),r&&this.domElement.style.setProperty(`--width`,r+`px`),this._closeFolders=a}add(e,t,n,r,i){if(Object(n)===n)return new gm(this,e,t,n);let a=e[t];switch(typeof a){case`number`:return new hm(this,e,t,n,r,i);case`boolean`:return new sm(this,e,t);case`string`:return new _m(this,e,t);case`function`:return new mm(this,e,t)}console.error(`gui.add failed
	property:`,t,`
	object:`,e,`
	value:`,a)}addColor(e,t,n=1){return new pm(this,e,t,n)}addFolder(t){let n=new e({parent:this,title:t});return this.root._closeFolders&&n.close(),n}load(e,t=!0){return e.controllers&&this.controllers.forEach(t=>{t instanceof mm||t._name in e.controllers&&t.load(e.controllers[t._name])}),t&&e.folders&&this.folders.forEach(t=>{t._title in e.folders&&t.load(e.folders[t._title])}),this}save(e=!0){let t={controllers:{},folders:{}};return this.controllers.forEach(e=>{if(!(e instanceof mm)){if(e._name in t.controllers)throw Error(`Cannot save GUI with duplicate property "${e._name}"`);t.controllers[e._name]=e.save()}}),e&&this.folders.forEach(e=>{if(e._title in t.folders)throw Error(`Cannot save GUI with duplicate folder "${e._title}"`);t.folders[e._title]=e.save()}),t}open(e=!0){return this._setClosed(!e),this.$title.setAttribute(`aria-expanded`,!this._closed),this.domElement.classList.toggle(`lil-closed`,this._closed),this}close(){return this.open(!1)}_setClosed(e){this._closed!==e&&(this._closed=e,this._callOnOpenClose(this))}show(e=!0){return this._hidden=!e,this.domElement.style.display=this._hidden?`none`:``,this}hide(){return this.show(!1)}openAnimated(e=!0){return this._setClosed(!e),this.$title.setAttribute(`aria-expanded`,!this._closed),requestAnimationFrame(()=>{let t=this.$children.clientHeight;this.$children.style.height=t+`px`,this.domElement.classList.add(`lil-transition`);let n=e=>{e.target===this.$children&&(this.$children.style.height=``,this.domElement.classList.remove(`lil-transition`),this.$children.removeEventListener(`transitionend`,n))};this.$children.addEventListener(`transitionend`,n);let r=e?this.$children.scrollHeight:0;this.domElement.classList.toggle(`lil-closed`,!e),requestAnimationFrame(()=>{this.$children.style.height=r+`px`})}),this}title(e){return this._title=e,this.$title.textContent=e,this}reset(e=!0){return(e?this.controllersRecursive():this.controllers).forEach(e=>e.reset()),this}onChange(e){return this._onChange=e,this}_callOnChange(e){this.parent&&this.parent._callOnChange(e),this._onChange!==void 0&&this._onChange.call(this,{object:e.object,property:e.property,value:e.getValue(),controller:e})}onFinishChange(e){return this._onFinishChange=e,this}_callOnFinishChange(e){this.parent&&this.parent._callOnFinishChange(e),this._onFinishChange!==void 0&&this._onFinishChange.call(this,{object:e.object,property:e.property,value:e.getValue(),controller:e})}onOpenClose(e){return this._onOpenClose=e,this}_callOnOpenClose(e){this.parent&&this.parent._callOnOpenClose(e),this._onOpenClose!==void 0&&this._onOpenClose.call(this,e)}destroy(){this.parent&&(this.parent.children.splice(this.parent.children.indexOf(this),1),this.parent.folders.splice(this.parent.folders.indexOf(this),1)),this.domElement.parentElement&&this.domElement.parentElement.removeChild(this.domElement),Array.from(this.children).forEach(e=>e.destroy())}controllersRecursive(){let e=Array.from(this.controllers);return this.folders.forEach(t=>{e=e.concat(t.controllersRecursive())}),e}foldersRecursive(){let e=Array.from(this.folders);return this.folders.forEach(t=>{e=e.concat(t.foldersRecursive())}),e}},Sm=class{t;gui;juiceBackup=null;wrap;extraActions={};constructor(e,t={}){this.t=e,this.extraActions=t,this.wrap=document.createElement(`div`),this.wrap.className=`tweak-wrap`,document.body.appendChild(this.wrap);let n=new xm({title:`Ajustes de sensação (P)`,width:300,container:this.wrap});this.gui=n,n.domElement.classList.add(`tweak`);let r={"Juice: comparar (liga/desliga)":()=>this.toggleJuice(),"Preset: Juicy (padrão)":()=>this.apply(ld()),"Preset: Cru (sem efeitos)":()=>this.apply({...this.t,...ud(this.t)}),"Preset: Arcade rápido":()=>this.apply({...this.t,runSpeed:7.6,walkSpeed:3.2,acceleration:60,deceleration:70,attackSpeedMul:1.35,recoveryMul:.7,hitStopMul:.7,dodgeDuration:.28}),"Preset: Pesado/realista":()=>this.apply({...this.t,runSpeed:5.4,walkSpeed:2.2,acceleration:22,deceleration:30,attackSpeedMul:.8,recoveryMul:1.3,hitStopMul:1.4,shakeMul:1.3,cancelWindowMul:1.6}),"Salvar no navegador":()=>md(this.t),"Copiar JSON":()=>navigator.clipboard?.writeText(JSON.stringify(this.t,null,2))},i=n.addFolder(`Presets e comparação`);for(let[e,t]of Object.entries(r))i.add({[e]:t},e);for(let[e,n]of Object.entries(t))i.add({[e]:n},e);let a=(e,t=!0)=>{let r=n.addFolder(e);return t&&r.close(),r},o=a(`Movimento`,!1);o.add(e,`walkSpeed`,.5,5,.1).name(`Andar (m/s)`),o.add(e,`runSpeed`,2,12,.1).name(`Correr — Shift (m/s)`),o.add(e,`acceleration`,5,120,1).name(`Aceleração`),o.add(e,`deceleration`,5,140,1).name(`Desaceleração`),o.add(e,`airControl`,0,1,.05).name(`Controle no ar`),o.add(e,`turnSpeed`,4,40,1).name(`Velocidade de giro`),o.add(e,`jumpHeight`,.4,3,.05).name(`Altura do salto`),o.add(e,`gravity`,8,60,1).name(`Gravidade`),o.add(e,`fallGravityMul`,1,3,.05).name(`Gravidade na queda ×`),o.add(e,`jumpCutMul`,.1,1,.05).name(`Corte do salto (soltar)`),o.add(e,`coyoteTime`,0,.4,.01).name(`Tolerância de borda (s)`),o.add(e,`jumpBuffer`,0,.4,.01).name(`Buffer de salto (s)`);let s=a(`Esquiva e stamina`);s.add(e,`dodgeDistance`,1,7,.1).name(`Distância`),s.add(e,`dodgeDuration`,.15,.8,.01).name(`Duração (s)`),s.add(e,`dodgeIFrameStart`,0,.3,.01).name(`Invulnerável de (s)`),s.add(e,`dodgeIFrameEnd`,0,.8,.01).name(`Invulnerável até (s)`),s.add(e,`dodgeCooldown`,0,1,.01).name(`Recarga (s)`),s.add(e,`perfectDodgeWindow`,0,.5,.01).name(`Janela esquiva perfeita`),s.add(e,`flurryEnabled`).name(`Rajada após esquiva perfeita`),s.add(e,`staminaMax`,30,300,5).name(`Stamina máx.`),s.add(e,`staminaRegen`,5,100,1).name(`Regeneração/s`),s.add(e,`sprintCost`,0,60,1).name(`Custo de correr/s`),s.add(e,`dodgeCost`,0,50,1).name(`Custo esquiva`);let c=a(`Combate`,!1);c.add(e,`damageMul`,.1,5,.05).name(`Dano ×`),c.add(e,`rangeMul`,.5,2,.05).name(`Alcance ×`),c.add(e,`attackSpeedMul`,.3,2.5,.05).name(`Velocidade dos golpes ×`),c.add(e,`recoveryMul`,.2,2.5,.05).name(`Recuperação ×`),c.add(e,`cancelWindowMul`,0,3,.05).name(`Janela de cancelamento ×`),c.add(e,`attackBuffer`,0,.6,.01).name(`Buffer de ataque (s)`),c.add(e,`chargeTime`,.2,2,.05).name(`Tempo de carga (s)`),c.add(e,`chargeCost`,0,60,1).name(`Custo ataque carregado`),c.add(e,`knockbackMul`,0,3,.05).name(`Empurrão ×`),c.add(e,`lockOnAssist`).name(`Assistência de mira/lock`);let l=a(`Defesa e aparo`,!1);l.add(e,`parryWindow`,0,.6,.01).name(`Janela de aparo (s)`),l.add(e,`blockAngle`,20,180,1).name(`Ângulo protegido (°)`),l.add(e,`blockStaminaCost`,0,40,1).name(`Custo de bloqueio`),l.add(e,`enemyDamageMul`,0,4,.1).name(`Dano inimigo ×`),l.add(e,`enemyAggression`,.2,3,.1).name(`Agressividade inimiga`);let u=a(`Feedback / "juice"`,!1);u.add(e,`hitStopEnabled`).name(`Hit stop`),u.add(e,`hitStopMul`,0,4,.05).name(`Hit stop ×`),u.add(e,`shakeEnabled`).name(`Tremor de câmera`),u.add(e,`shakeMul`,0,3,.05).name(`Tremor ×`),u.add(e,`particlesEnabled`).name(`Partículas`),u.add(e,`particleMul`,0,3,.05).name(`Intensidade partículas ×`),u.add(e,`trailsEnabled`).name(`Rastro dos golpes`),u.add(e,`hitFlashEnabled`).name(`Flash no alvo`),u.add(e,`damageNumbers`).name(`Números de dano`),u.add(e,`weaponRecoil`).name(`Recuo da arma`),u.add(e,`screenFx`).name(`Efeitos de tela`);let d=a(`Câmera`);d.add(e,`fov`,50,110,1).name(`Campo de visão`),d.add(e,`sensitivity`,.1,4,.05).name(`Sensibilidade`),d.add(e,`invertY`).name(`Inverter Y`),d.add(e,`camDistance`,1.5,9,.1).name(`Distância (3ª)`),d.add(e,`camShoulder`,0,1.5,.05).name(`Deslocamento ombro`),d.add(e,`camHeight`,.8,2.5,.05).name(`Altura (3ª)`),d.add(e,`camBob`).name(`Balanço da cabeça`),d.add(e,`camBobAmount`,0,3,.05).name(`Balanço ×`),d.add(e,`fpSwingLean`,0,2,.05).name(`Câmera no golpe (1ª p.) ×`),d.add(e,`camJuice`,0,2,.05).name(`Câmera nas ações ×`),d.add(e,`weaponSway`).name(`Balanço da arma (1ª)`),d.add(e,`weaponSwayAmount`,0,3,.05).name(`Balanço da arma ×`),d.add(e,`fovKick`).name(`FOV dinâmico`);let f=a(`Áudio e debug`);f.add(e,`soundEnabled`).name(`Som`),f.add(e,`volume`,0,1.5,.05).name(`Volume`),f.add(e,`timeScale`,{"1× normal":1,"0.5×":.5,"0.25×":.25,"0.1× (quadro a quadro)":.1}).name(`Câmera lenta`),f.add(e,`showHitboxes`).name(`Mostrar hitboxes`),n.onChange(()=>md(this.t)),n.close()}apply(e){Object.assign(this.t,e),this.juiceBackup=null,this.refresh(),md(this.t)}toggleJuice(){if(this.juiceBackup)Object.assign(this.t,this.juiceBackup),this.juiceBackup=null;else{let e=ud(this.t);this.juiceBackup={};for(let t of Object.keys(e))this.juiceBackup[t]=this.t[t];Object.assign(this.t,e)}return this.refresh(),!this.juiceBackup}refresh(){this.gui.controllersRecursive().forEach(e=>e.updateDisplay())}get isOpen(){return!this.gui._closed}toggle(){this.gui._closed?this.gui.open():this.gui.close(),this.wrap.classList.toggle(`open`,!this.gui._closed)}},Cm=class{ctx;pickups;pos;id=Wf();team=`neutral`;alive=!0;material=`wood`;lockable=!1;hurtboxes;root=new wn;stickRoot;maxHp=80;hp=80;upper=new wn;notch;stump;canopy=new wn;swayX=new jd(60,3.5);swayZ=new jd(60,3.5);falling=!1;fallAngle=0;fallVel=0;fallAxis=new K(1,0,0);fallDir=new K;landed=!1;landedT=0;collider;notchY=.95;trunkR=.3;hintShown=0;barT=0;bar;barFill;constructor(e,t,n){this.ctx=e,this.pickups=t,this.pos=n,this.root.position.copy(n);let r=new Lo({color:8016434,roughness:.95,flatShading:!0}),i=new Lo({color:15254666,roughness:.9,flatShading:!0}),a=this.trunkR;this.stump=new J(new ea(a,a*1.25,this.notchY-.1,9),r),this.stump.position.y=(this.notchY-.1)/2,this.stump.castShadow=this.stump.receiveShadow=!0;for(let e=0;e<5;e++){let t=new J(new ta(.1,.5,4),r),n=e/5*Math.PI*2+.3;t.position.set(Math.cos(n)*.32,.08,Math.sin(n)*.32),t.rotation.set(0,-n,Math.PI/2+.5),t.castShadow=!0,this.root.add(t)}this.notch=new J(new ea(a,a,.2,9),i),this.notch.position.y=this.notchY,this.upper.position.y=this.notchY+.1;let o=new J(new ea(a*.8,a,3.2,9),r);o.position.y=1.6,o.castShadow=!0,this.upper.add(o);let s=[5216828,6270533,4164147].map(e=>new Lo({color:e,roughness:.8,flatShading:!0}));for(let[e,t,n,r]of[[0,3.6,0,1.4],[.8,3.1,.3,1],[-.7,3.2,-.3,1.05],[.2,4.4,-.2,1],[-.3,3,.8,.9],[.3,3.2,-.8,.9]]){let i=new J(new xo(r,0),Sd(s));i.position.set(e,t,n),i.rotation.set(Q(0,3),Q(0,3),0),i.castShadow=!0,this.canopy.add(i)}this.upper.add(this.canopy),this.root.add(this.stump,this.notch,this.upper),this.stickRoot=this.upper,this.bar=new J(new Co(.9,.08),new ii({color:1708054,depthTest:!1,transparent:!0,opacity:.8})),this.barFill=new J(new Co(.86,.05),new ii({color:16762976,depthTest:!1})),this.barFill.geometry.translate(.43,0,0),this.barFill.position.set(-.43,0,.001),this.bar.add(this.barFill),this.bar.renderOrder=this.barFill.renderOrder=20,this.bar.position.y=2.2,this.bar.visible=!1,this.root.add(this.bar),e.scene.add(this.root),this.hurtboxes=[{a:new K(n.x,n.y+.2,n.z),b:new K(n.x,n.y+3.3,n.z),radius:a+.02}],this.collider=e.physics.add({...Bd(n.x,n.z,a*.85,a*.85,n.y,n.y+4,0,`wood`),mesh:o,owner:this}),e.physics.add({...Bd(n.x,n.z,a*.9,a*.9,n.y,n.y+this.notchY-.05,0,`wood`),mesh:this.stump,owner:this,blocksCamera:!0}),e.combat.add(this)}center(e){return e.copy(this.pos).setY(this.pos.y+1.2)}receiveHit(e){let t=Hf(`wood`);if(!this.alive)return t.ignored=!0,t;let n=Gf(e.tool,`wood`);t.effectiveness=n;let r=e.dir.clone().setY(0).normalize(),i=(.35+e.strength*.9)*(.4+n);if(this.swayX.impulse(r.z*i),this.swayZ.impulse(-r.x*i),this.ctx.fx.impact(`leaf`,new K(this.pos.x+Q(-1,1),this.pos.y+3.2,this.pos.z+Q(-1,1)),new K(0,-1,0),new K(0,-1,0),.4),e.projectile)return t;if(n<=.01)return this.hintShown++%3==0&&this.ctx.events.emit(`toast`,{text:`Use o MACHADO para derrubar a árvore`,kind:`warn`}),t;n<.5&&this.hintShown++%4==0&&this.ctx.events.emit(`toast`,{text:`Pouco eficaz — o machado corta muito melhor`,kind:`info`});let a=e.damage*n*(e.charged?1.3:1);return t.damage=Math.round(a),this.hp-=a,this.barT=3,this.updateNotch(),this.hp<=0&&(t.killed=!0,this.fell(r)),t}updateNotch(){let e=X(1-this.hp/this.maxHp);this.notch.scale.set(1-e*.62,1+e*.3,1-e*.62),this.barFill.scale.x=Math.max(.001,this.hp/this.maxHp)}fell(e){this.alive=!1,this.falling=!0,this.fallDir.copy(e),this.fallAxis.set(e.z,0,-e.x).normalize(),this.fallVel=.25,this.hurtboxes[0].enabled=!1,this.collider.enabled=!1,this.ctx.physics.markDirty(),this.bar.visible=!1,this.ctx.events.emit(`treeFell`,{pos:this.pos.clone().setY(this.pos.y+1),dir:e.clone()})}update(e,t){if(!(e<=0)){if(!this.falling)this.swayX.update(e),this.swayZ.update(e),this.upper.rotation.set(this.swayX.value*.12,0,this.swayZ.value*.12),this.canopy.rotation.set(this.swayX.value*.08,0,this.swayZ.value*.08);else if(!this.landed){if(this.fallVel+=(1.2+Math.sin(this.fallAngle)*5.5)*e,this.fallAngle+=this.fallVel*e,this.fallAngle>=Math.PI/2-.08&&(this.fallAngle=Math.PI/2-.08,this.fallVel*=-.18,(Math.abs(this.fallVel)<.12||this.landedT>0)&&(this.landed=!0),this.landedT===0)){this.landedT=1e-4;let e=this.pos.clone().addScaledVector(this.fallDir,2.5);this.ctx.events.emit(`treeLanded`,{pos:e,dir:this.fallDir.clone()});for(let e=0;e<4;e++)this.ctx.fx.dust(this.pos.clone().addScaledVector(this.fallDir,1+e*.9),1.2,.6);for(let e=0;e<3;e++)this.ctx.fx.impact(`leaf`,this.pos.clone().addScaledVector(this.fallDir,3.2+e*.4).setY(this.pos.y+1),new K(0,1,0),new K(0,1,0),1.2)}this.upper.quaternion.setFromAxisAngle(this.fallAxis,this.fallAngle)}if(this.landedT>0&&(this.landedT+=e,this.landedT>1.1&&this.upper.visible)){this.upper.visible=!1;for(let e=0;e<3;e++){let t=this.pos.clone().addScaledVector(this.fallDir,1.2+e*1.1).setY(this.pos.y+.4);this.pickups.spawn(`wood`,t,new K(Q(-1,1),Q(3,4.5),Q(-1,1))),this.ctx.fx.poof(t,6989903,.5)}this.ctx.sound.play(`rockBreak`,{pos:this.pos,pitch:.7,vol:.5});for(let e of[...this.upper.children])e.type===`Group`&&e!==this.canopy&&e.removeFromParent()}this.barT-=e,this.bar.visible=this.alive&&this.barT>0&&this.hp<this.maxHp,this.bar.visible&&this.bar.quaternion.copy(t.quaternion)}}reset(){this.hp=this.maxHp,this.alive=!0,this.falling=this.landed=!1,this.fallAngle=this.fallVel=0,this.landedT=0,this.upper.visible=!0,this.upper.quaternion.identity(),this.hurtboxes[0].enabled=!0,this.collider.enabled=!0,this.ctx.physics.markDirty(),this.swayX.reset(),this.swayZ.reset(),this.updateNotch();for(let e of[...this.upper.children])e.type===`Group`&&e!==this.canopy&&e.removeFromParent()}},wm=class{ctx;pickups;pos;id=Wf();team=`neutral`;alive=!0;material=`stone`;lockable=!1;hurtboxes;root=new wn;stickRoot;maxHp=70;hp=70;rock;rockMat;cracks=new wn;crackMat=new ii({color:1776160});glowMat=new ii({color:16756848,transparent:!0,opacity:0});pulse=new jd(300,14);collider;stage=0;hint=0;radius=1.05;constructor(e,t,n){this.ctx=e,this.pickups=t,this.pos=n,this.root.position.copy(n);let r=new xo(this.radius,1),i=r.attributes.position,a=new K;for(let e=0;e<i.count;e++){a.fromBufferAttribute(i,e);let t=1+Math.sin(a.x*5.1+a.z*3.3)*.08+Math.cos(a.y*4.7+a.x*2.1)*.07;a.multiplyScalar(t),a.y*=.78,i.setXYZ(e,a.x,a.y,a.z)}r.computeVertexNormals(),this.rockMat=new Lo({color:9277337,roughness:.95,flatShading:!0}),this.rock=new J(r,this.rockMat),this.rock.position.y=.62,this.rock.castShadow=this.rock.receiveShadow=!0;let o=new Lo({color:14205562,roughness:.4,metalness:.5,flatShading:!0});for(let e=0;e<5;e++){let t=new J(new So(.1),o),n=e*1.3;t.position.set(Math.cos(n)*.85,.2+e%3*.2,Math.sin(n)*.85),this.rock.add(t)}this.rock.add(this.cracks),this.root.add(this.rock),this.stickRoot=this.rock,e.scene.add(this.root),this.hurtboxes=[{a:new K(n.x,n.y+.55,n.z),b:new K(n.x,n.y+.75,n.z),radius:.92}],this.collider=e.physics.add({...Bd(n.x,n.z,.78,.78,n.y,n.y+1.15,.3,`stone`),mesh:this.rock,owner:this}),e.combat.add(this)}center(e){return e.copy(this.pos).setY(this.pos.y+.7)}addCrack(e,t,n){let r=this.rock.worldToLocal(e.clone()),i=t.clone().normalize(),a=new wn;a.position.copy(r).addScaledVector(i,.02),a.quaternion.setFromUnitVectors(new K(0,0,1),i);let o=3+Math.floor(n*3);for(let e=0;e<o;e++){let t=Q(.15,.35)*(.6+n),r=e/o*Math.PI*2+Q(-.4,.4),i=new J(new Zi(t,.03+n*.02,.02),this.crackMat);if(i.position.set(Math.cos(r)*t*.5,Math.sin(r)*t*.5,0),i.rotation.z=r,a.add(i),n>.4){let e=t*.5,n=r+Q(-.8,.8),i=new J(new Zi(e,.02,.02),this.crackMat);i.position.set(Math.cos(r)*t+Math.cos(n)*e*.5,Math.sin(r)*t+Math.sin(n)*e*.5,0),i.rotation.z=n,a.add(i)}}let s=new J(new $i(.06+n*.05,6),this.glowMat);a.add(s),this.cracks.add(a)}receiveHit(e){let t=Hf(`stone`);if(!this.alive)return t.ignored=!0,t;let n=Gf(e.tool,`stone`);if(t.effectiveness=n,this.pulse.impulse(2+e.strength*4),e.projectile)return t;if(n<=.01)return t.deflected=!0,this.hint++%2==0&&this.ctx.events.emit(`toast`,{text:`Use a PICARETA para quebrar a pedra`,kind:`warn`}),t;n<.5&&this.hint++%3==0&&this.ctx.events.emit(`toast`,{text:`Pouco eficaz — a picareta quebra muito melhor`,kind:`info`});let r=e.damage*n*(e.charged?1.3:1);t.damage=Math.round(r),this.hp-=r;let i=X(1-this.hp/this.maxHp);this.addCrack(e.point,e.normal,i),this.glowMat.opacity=.9,this.rockMat.color.setHex(9277337).lerp(new q(5592670),i*.7);let a=Math.floor(i*3);if(a>this.stage&&this.hp>0){this.stage=a;let e=[new K(1,.3,0),new K(-.6,.5,.7),new K(.1,.9,-.5)],t=e[(a-1)%e.length].normalize(),n=this.rock.localToWorld(t.clone().multiplyScalar(this.radius*.85));this.addCrack(n,t,1),this.ctx.events.emit(`rockCrack`,{pos:n,stage:a})}return this.hp<=0&&(t.killed=!0,this.shatter(e)),t}shatter(e){this.alive=!1,this.rock.visible=!1,this.collider.enabled=!1,this.ctx.physics.markDirty(),this.hurtboxes[0].enabled=!1;let t=this.pos.clone().setY(this.pos.y+.6),n=this.ctx.fx.particles;if(this.ctx.tuning.particlesEnabled){for(let r=0;r<Math.round(26*this.ctx.tuning.particleMul);r++){let i=new K(Q(-1,1),Q(.3,1.2),Q(-1,1)).normalize().addScaledVector(e.dir,.4);n.spawn(`solid`,{pos:t.clone().addScaledVector(i,Q(.2,.6)),vel:i.multiplyScalar(Q(3,8)),color:[9277337,7303547,5592670,10922162][r%4],size:Q(.14,.34),life:Q(1.4,2.4),gravity:20,drag:.3,floorY:this.pos.y+.05,spin:8,endScale:.5,bounce:.35})}this.ctx.fx.dust(this.pos.clone().setY(this.pos.y+.1),2,1.2,12104358),this.ctx.fx.dust(this.pos.clone().setY(this.pos.y+.6),1.5,.8,13222840)}for(let e=0;e<3;e++)this.pickups.spawn(`stone`,t.clone(),new K(Q(-2.5,2.5),Q(4,6),Q(-2.5,2.5)));for(let e of[...this.rock.children])e.type===`Group`&&e!==this.cracks&&e.removeFromParent();this.ctx.events.emit(`rockBroke`,{pos:t})}update(e){if(e<=0)return;this.pulse.update(e);let t=1+this.pulse.value*.025;this.rock.scale.set(t,1-this.pulse.value*.02,t),this.glowMat.opacity=Math.max(0,this.glowMat.opacity-e*1.5)}reset(){this.hp=this.maxHp,this.alive=!0,this.stage=0,this.rock.visible=!0,this.collider.enabled=!0,this.ctx.physics.markDirty(),this.hurtboxes[0].enabled=!0,this.rockMat.color.setHex(9277337),this.cracks.clear();for(let e of[...this.rock.children])e.type===`Group`&&e!==this.cracks&&e.removeFromParent()}},Tm=class{ctx;pos;yaw;id=Wf();team=`neutral`;alive=!0;material=`dummy`;lockable=!0;hurtboxes;root=new wn;body=new wn;stickRoot;tiltX=new jd(90,5);tiltZ=new jd(90,5);twist=new jd(120,6);flashT=0;mats=[];lastDamage=0;combo=0;comboT=0;dmgWindow=[];time=0;label=null;constructor(e,t,n=0){this.ctx=e,this.pos=t,this.yaw=n,this.root.position.copy(t),this.root.rotation.y=n;let r=(e,t=0)=>{let n=new Lo({color:e,roughness:t?.3:.9,metalness:t,flatShading:!0});return n.emissive=new q(0),this.mats.push(n),n},i=r(8016434),a=r(14270314),o=r(9071162),s=r(11186877,.85),c=r(11549242),l=new J(new ea(.07,.09,1,6),i);l.position.y=.5;let u=new J(new ea(.35,.45,.15,8),i);u.position.y=.07,this.root.add(l,u),this.body.position.y=.95,this.root.add(this.body);let d=new J(new ea(.28,.24,.75,8),a);d.position.y=.4;let f=new J(new ea(.285,.285,.05,8),o);f.position.y=.2;let p=f.clone();p.position.y=.6;let m=new J(new ea(.06,.06,1.2,6),i);m.rotation.z=Math.PI/2,m.position.y=.62;let h=new J(new To(.2,8,6),a);h.position.y=.98;let g=new J(new To(.23,10,6,0,Math.PI*2,0,Math.PI*.55),s);g.position.y=1;let _=new J(new ea(.28,.28,.03,12),s);_.position.y=.98;let v=new J(new $i(.14,12),c);v.position.set(0,.45,.285);for(let e of[d,f,p,m,h,g,_,v,l,u])e.castShadow=!0,e.receiveShadow=!0;this.body.add(d,f,p,m,h,g,_,v),this.stickRoot=this.body,e.scene.add(this.root),this.hurtboxes=[{a:new K,b:new K,radius:.32,tag:`body`},{a:new K,b:new K,radius:.25,tag:`head`,material:`metal`}],e.physics.add({...Bd(t.x,t.z,.3,.3,t.y,t.y+1.7,n,`wood`),mesh:d,owner:this}),e.combat.add(this),this.updateHurtboxes()}center(e){return e.copy(this.pos).setY(this.pos.y+1.4)}updateHurtboxes(){this.body.updateWorldMatrix(!0,!1),this.body.localToWorld(this.hurtboxes[0].a.set(0,.05,0)),this.body.localToWorld(this.hurtboxes[0].b.set(0,.7,0)),this.body.localToWorld(this.hurtboxes[1].a.set(0,1,0)),this.hurtboxes[1].b.copy(this.hurtboxes[1].a)}receiveHit(e){let t=Hf(e.hurtbox.tag===`head`?`metal`:`dummy`);t.damage=Math.round(e.damage*(e.hurtbox.tag===`head`?1.25:1));let n=e.dir.clone().setY(0).normalize().applyAxisAngle(new K(0,1,0),-this.yaw),r=2+e.strength*6+ +!!e.projectile;return this.tiltX.impulse(n.z*r),this.tiltZ.impulse(-n.x*r),this.twist.impulse((Math.random()-.5)*r*.6),this.ctx.tuning.hitFlashEnabled&&(this.flashT=.08),this.lastDamage=t.damage,this.combo=this.comboT>0?this.combo+1:1,this.comboT=1.5,this.dmgWindow.push({t:this.time,d:t.damage}),t}get dps(){let e=this.dmgWindow.filter(e=>this.time-e.t<3);return this.dmgWindow=e,e.reduce((e,t)=>e+t.d,0)/3}update(e){if(this.time+=e,e<=0)return;this.tiltX.update(e),this.tiltZ.update(e),this.twist.update(e),this.body.rotation.set(this.tiltX.value*.12,this.twist.value*.1,this.tiltZ.value*.12),this.comboT-=e,this.flashT-=e;let t=this.flashT>0?.45:0;for(let e of this.mats)e.emissive.setScalar(t);this.updateHurtboxes()}},Em=class{ctx;tree;rock;dummy;spawnPoint=new K(0,0,-13);playerStart=new K(0,0,4);spawnRing;t=0;constructor(e,t){this.ctx=e;let n=e.scene;this.buildSky(n),this.buildLights(n);let r=new Co(64,64,48,48);r.rotateX(-Math.PI/2);let i=[],a=new q,o=r.attributes.position;for(let e=0;e<o.count;e++){let t=o.getX(e),n=o.getZ(e),r=Math.sin(t*.35)*Math.cos(n*.3)*.5+Math.sin(t*1.3+n*.7)*.25;a.setHSL(.27+r*.02,.45,.4+r*.05),i.push(a.r,a.g,a.b)}r.setAttribute(`color`,new hr(i,3));let s=new J(r,new Lo({vertexColors:!0,roughness:1,flatShading:!0}));s.receiveShadow=!0,n.add(s),e.physics.add({...Bd(0,0,32,32,-2,0,0,`grass`),mesh:s,blocksCamera:!0});for(let[t,n,r,i]of[[0,26,26,.5],[0,-26,26,.5],[26,0,.5,26],[-26,0,.5,26]])e.physics.add({...Bd(t,n,r,i,-1,6,0,`wood`),blocksCamera:!1});this.buildFence(26),this.buildGrass(26);let c=new Lo({color:12104358,roughness:.95,flatShading:!0}),l=new Lo({color:9275260,roughness:.95,flatShading:!0}),u=new Lo({color:10779212,roughness:.85,flatShading:!0}),d=new Lo({color:10134704,roughness:.35,metalness:.8,flatShading:!0});this.box(-9,-3,.35,4,0,3.2,0,c,`stone`),this.box(-11.5,.5,2.5,.35,0,3.2,0,c,`stone`),this.box(15,-12,1.8,1.8,0,6,0,c,`stone`),this.box(15,-9.3,1.8,.9,0,3,0,l,`stone`),this.box(11,-15.5,1.4,.5,0,1.1,0,l,`stone`),this.box(18.5,-15.5,1.2,.8,0,1.9,0,c,`stone`),this.box(-12,-8,1.5,.2,0,2.4,.4,d,`metal`),this.ramp(9,-2,1.6,3.2,0,1.8,0,u),this.box(9,3.2,2.2,2,0,1.8,0,u,`wood`),this.box(9,3.2,2.25,2.05,1.8,1.9,0,l,`stone`),this.box(9,8.4,1.4,1.2,1.2,1.9,0,l,`stone`),this.box(9,12.2,1.4,1.2,0,1.3,0,l,`stone`),[.2,.35,.6,.95,1.3].forEach((e,t)=>this.box(-3+t*1.6,-7,.8,1.4,0,e,0,t%2?c:l,`stone`)),this.box(3.5,-1.5,.6,.6,0,.5,.5,l,`stone`),this.box(-4,2.5,.9,.5,0,.3,-.3,l,`stone`);let f=new J(new ea(2.2,2.4,.12,24),l);f.position.copy(this.spawnPoint).setY(.06),f.receiveShadow=!0,n.add(f),this.spawnRing=new J(new wo(1.7,2,32),new ii({color:11562239,transparent:!0,opacity:.6,side:2,depthWrite:!1})),this.spawnRing.rotation.x=-Math.PI/2,this.spawnRing.position.copy(this.spawnPoint).setY(.14),n.add(this.spawnRing);for(let e=0;e<4;e++){let t=e/4*Math.PI*2+Math.PI/4;this.box(this.spawnPoint.x+Math.cos(t)*2.8,this.spawnPoint.z+Math.sin(t)*2.8,.25,.25,0,1.6,t,c,`stone`)}this.tree=new Cm(e,t,new K(-7,0,8)),this.rock=new wm(e,t,new K(6,0,7)),this.dummy=new Tm(e,new K(0,0,10),Math.PI),this.label(`Árvore — use o MACHADO`,new K(-7,5.4,8)),this.label(`Pedra — use a PICARETA`,new K(6,2.4,7)),this.label(`Boneco de treino (capacete de metal)`,new K(0,2.7,10)),this.label(`Spawn de inimigos [G]`,new K(0,2.4,-13)),this.label(`Rampa → plataforma (teste a tolerância de borda)`,new K(9,3.4,0)),this.label(`Degraus: 0.2 · 0.35 · 0.6 · 0.95 · 1.3 m`,new K(.2,2.3,-7)),this.label(`Parede (câmera/colisão)`,new K(-9,3.8,-3)),this.label(`Metal`,new K(-12,2.9,-8)),this.label(`Escalada — ande contra a parede`,new K(15,6.6,-12)),this.buildScenery(n)}box(e,t,n,r,i,a,o,s,c){let l=new J(new Zi(n*2,a-i,r*2),s);return l.position.set(e,(i+a)/2,t),l.rotation.y=o,l.castShadow=l.receiveShadow=!0,this.ctx.scene.add(l),this.ctx.physics.add({...Bd(e,t,n,r,i,a,o,c),mesh:l})}ramp(e,t,n,r,i,a,o,s){let c=new Na;c.moveTo(-r,0),c.lineTo(r,a-i),c.lineTo(r,0),c.closePath();let l=new vo(c,{depth:n*2,bevelEnabled:!1});l.translate(0,0,-n),l.rotateY(-Math.PI/2);let u=new J(l,s);u.position.set(e,i,t),u.rotation.y=o,u.castShadow=u.receiveShadow=!0,this.ctx.scene.add(u);let d=Bd(e,t,n,r,i,a,o,`wood`);d.kind=`ramp`,this.ctx.physics.add({...d,mesh:u})}label(e,t){let n=document.createElement(`canvas`),r=n.getContext(`2d`),i=`bold 34px system-ui, sans-serif`;r.font=i;let a=Math.ceil(r.measureText(e).width)+40;n.width=a,n.height=60,r.font=i,r.fillStyle=`rgba(20,24,32,0.72)`,r.beginPath(),r.roundRect(0,0,a,60,16),r.fill(),r.fillStyle=`#fff6dc`,r.textBaseline=`middle`,r.fillText(e,20,32);let o=new qi(n);o.colorSpace=Fe;let s=new Zr(new Lr({map:o,transparent:!0,depthWrite:!1}));s.scale.set(a/60*.42,.42,1),s.position.copy(t),this.ctx.scene.add(s)}buildSky(e){let t=new To(300,24,12),n=new Fo({side:1,depthWrite:!1,uniforms:{top:{value:new q(5214168)},mid:{value:new q(11130101)},bot:{value:new q(15327944)}},vertexShader:`varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,fragmentShader:`uniform vec3 top; uniform vec3 mid; uniform vec3 bot; varying vec3 vP; void main(){ float h = vP.y; vec3 c = h > 0.0 ? mix(mid, top, pow(h, 0.6)) : mix(mid, bot, pow(-h, 0.4)); gl_FragColor = vec4(c,1.0); }`});e.add(new J(t,n)),e.fog=new Mn(12114158,45,140)}buildLights(e){e.add(new ss(13625599,5925434,1.2));let t=new Ss(16773334,2.6);t.position.set(-14,24,10),t.castShadow=!0;let n=matchMedia(`(pointer: coarse)`).matches;t.shadow.mapSize.set(n?1024:2048,n?1024:2048);let r=t.shadow.camera;r.left=-30,r.right=30,r.top=30,r.bottom=-30,r.near=1,r.far=80,t.shadow.bias=-4e-4,t.shadow.normalBias=.03,e.add(t,t.target)}buildFence(e){let t=new Lo({color:8016434,roughness:.9,flatShading:!0}),n=new Zi(.2,1.1,.2),r=new Zi(1,.1,.08),i=new Di(n,t,104),a=new Di(r,t,208),o=new Yt,s=0,c=0;for(let t=0;t<4;t++)for(let n=0;n<26;n++){let r=-e+n*(2*e/26),[l,u,d]=t===0?[r,e,0]:t===1?[r,-e,0]:t===2?[e,r,Math.PI/2]:[-e,r,Math.PI/2];o.makeRotationY(d).setPosition(l,.55,u),i.setMatrixAt(s++,o);let f=new G().setFromAxisAngle(new K(0,1,0),d),p=new K(1,0,0).applyQuaternion(f).multiplyScalar(2*e/26*.5);for(let t of[.45,.85])o.compose(new K(l+p.x,t,u+p.z),f,new K(2*e/26,1,1)),a.setMatrixAt(c++,o)}i.castShadow=a.castShadow=!0,this.ctx.scene.add(i,a)}buildGrass(e){let t=new ta(.06,.4,3);t.translate(0,.2,0);let n=new Lo({color:7319114,roughness:1,flatShading:!0}),r=1400,i=new Di(t,n,r),a=new Yt,o=new G,s=new q,c=0;for(let t=0;t<r*3&&c<r;t++){let t=Q(-e+1,e-1),n=Q(-e+1,e-1);Math.abs(t)<13&&Math.abs(n)<15||(o.setFromEuler(new on(Q(-.3,.3),Q(0,6),Q(-.3,.3))),a.compose(new K(t,0,n),o,new K(1,Q(.6,1.5),1)),i.setMatrixAt(c,a),i.setColorAt(c,s.setHSL(.25+Q(-.03,.03),.5,Q(.35,.5))),c++)}i.count=c,this.ctx.scene.add(i)}buildScenery(e){let t=new Lo({color:8228768,roughness:1,flatShading:!0}),n=new Lo({color:15922424,roughness:1,flatShading:!0});for(let r=0;r<14;r++){let i=r/14*Math.PI*2+Q(-.1,.1),a=Q(90,130),o=Q(25,55),s=new J(new ta(Q(18,30),o,6),t);s.position.set(Math.cos(i)*a,o/2-2,Math.sin(i)*a),e.add(s);let c=new J(new ta(6,o*.25,6),n);c.position.set(s.position.x,o-2-o*.125-.5,s.position.z),c.scale.setScalar(1),e.add(c)}let r=new Lo({color:4160051,roughness:1,flatShading:!0}),i=new Lo({color:7031342,roughness:1,flatShading:!0});for(let t=0;t<40;t++){let t=Q(0,Math.PI*2),n=Q(30,55),a=new wn,o=new J(new ea(.25,.35,2,5),i);o.position.y=1;let s=new J(new ta(Q(1.5,2.4),Q(4,6),6),r);s.position.y=4,a.add(o,s),a.position.set(Math.cos(t)*n,0,Math.sin(t)*n),a.scale.setScalar(Q(.8,1.5)),e.add(a)}let a=new J(new $i(200,32),new Lo({color:7182922,roughness:1}));a.rotation.x=-Math.PI/2,a.position.y=-.02,e.add(a)}update(e,t){this.t+=e,this.tree.update(e,t),this.rock.update(e),this.dummy.update(e),this.spawnRing.rotation.z+=e*.6,this.spawnRing.material.opacity=.45+Math.sin(this.t*3)*.15}reset(){this.tree.reset(),this.rock.reset(),this.dummy.combo=0,this.dummy.lastDamage=0}},Dm=[[`W A S D`,`Andar`],[`Shift`,`Correr (segure) · Z / Caps Lock trava a corrida`],[`Espaço`,`Pular (segure = mais alto)`],[`Botão esq. / J`,`Atacar · segure = ataque carregado · arco: puxar/soltar`],[`Botão dir. / K`,`Defender (no tempo certo = APARO) · cancela o arco`],[`Escalar`,`Ande contra uma parede: gruda e escala com WASD (gasta stamina) · Espaço = salto na parede · Espaço + trás = pula para longe · Ctrl = solta · no topo sobe sozinho · beiradas baixas/ao alcance do pulo: sobe direto`],[`Ctrl`,`Esgueirar (liga/desliga): agachado, lento e silencioso; inimigos só percebem de perto`],[`Espaço (travado)`,`Esquiva — só com a mira travada: ←/→ salto lateral · parado/trás = pulo para trás · frente = pulo normal (C/L também)`],[`Q / botão do meio`,`Travar mira (lock-on) / recentralizar câmera · travado: mouse rápido para o lado troca de alvo`],[`V`,`Alternar 1ª / 3ª pessoa`],[`X`,`Ver rig: esqueleto com nomes (nosso · Mixamo) → pose de repouso → desliga`],[`T`,`Trocar ombro da câmera`],[`1–6 / roda`,`Barra rápida (equipar)`],[`Tab / I`,`Inventário`],[`G`,`Gerar inimigo`],[`R`,`Restaurar arena`],[`P`,`Painel de ajustes`],[`B`,`Comparar: juice ligado/desligado`],[`H`,`Ajuda`]],Om=[[`Lado esquerdo`,`Analógico: andar`],[`Lado direito`,`Arrastar: olhar/mirar`],[`Atacar`,`Toque = golpe · segure = carga · arco: segure e solte (arraste o botão para mirar)`],[`Defender`,`Segure para bloquear; toque no tempo certo = aparo`],[`Esquiva`,`Com a mira travada o botão Pular vira Esquiva: para o lado = salto lateral · solto = pulo para trás`],[`Correr`,`Liga/desliga a corrida`],[`Pular`,`Salto (segure = mais alto)`],[`Travar`,`Lock-on no inimigo mais próximo`],[`Barra rápida`,`Toque para equipar`],[`Topo`,`1ª/3ª, ombro, itens, inimigo, reset, juice on/off, ajustes`]],km=e=>`<table>${e.map(([e,t])=>`<tr><td><kbd>${e}</kbd></td><td>${t}</td></tr>`).join(``)}</table>`;function Am(e,t){let n=document.createElement(`div`);return n.className=`start`,n.innerHTML=`
    <div class="start-card">
      <h1>PixelIsland <span>Combat Lab</span></h1>
      <p class="sub">Protótipo de movimentação e combate "juicy" — Three.js</p>
      <div class="cols">
        <div><h3>${e?`Toque`:`Teclado e mouse`}</h3>${km(e?Om:Dm)}</div>
        <div class="tips"><h3>Experimente</h3><ul>
          <li>Combo de 3 golpes com a espada; segure para o <b>Ataque Giratório</b>.</li>
          <li>Derrube a <b>árvore</b> com o machado e quebre a <b>pedra</b> com a picareta.</li>
          <li>Defenda no instante do golpe inimigo para <b>APARAR</b>.</li>
          <li>Esquive no último instante: <b>esquiva perfeita</b> + rajada.</li>
          <li>Painel <b>Ajustes</b>: compare "Juicy" × "Cru".</li>
        </ul></div>
      </div>
      <p class="compact">Analógico à esquerda · arraste à direita para olhar · botões de ação à direita · <b>?</b> mostra todos os controles</p>
      <button class="go">${e?`Tocar para jogar`:`Clique para jogar`}</button>
      ${e?`<p class="hint">Dica: gire o celular (paisagem) e use tela cheia.</p>`:``}
    </div>`,document.body.appendChild(n),n.querySelector(`.go`).addEventListener(`click`,()=>t()),n}function jm(){let e=document.createElement(`div`);e.className=`modal help`,e.innerHTML=`<div class="panel"><header><h2>Controles</h2><button class="close">✕</button></header>
    <div class="cols"><div><h3>Teclado e mouse</h3>${km(Dm)}</div><div><h3>Toque</h3>${km(Om)}</div></div></div>`,document.body.appendChild(e);let t=!1,n={el:e,isOpen:()=>t,close:()=>{t=!1,e.classList.remove(`open`)},toggle:()=>(t=!t,e.classList.toggle(`open`,t),t)};return e.querySelector(`.close`).addEventListener(`click`,()=>n.close()),e.addEventListener(`pointerdown`,t=>t.target===e&&n.close()),n}var Mm={POSITION:[`byte`,`byte normalized`,`unsigned byte`,`unsigned byte normalized`,`short`,`short normalized`,`unsigned short`,`unsigned short normalized`],NORMAL:[`byte normalized`,`short normalized`],TANGENT:[`byte normalized`,`short normalized`],TEXCOORD:[`byte`,`byte normalized`,`unsigned byte`,`short`,`short normalized`,`unsigned short`]},Nm=class{constructor(){this.textureUtils=null,this.pluginCallbacks=[],this.register(function(e){return new eh(e)}),this.register(function(e){return new th(e)}),this.register(function(e){return new ah(e)}),this.register(function(e){return new oh(e)}),this.register(function(e){return new sh(e)}),this.register(function(e){return new ch(e)}),this.register(function(e){return new nh(e)}),this.register(function(e){return new rh(e)}),this.register(function(e){return new ih(e)}),this.register(function(e){return new lh(e)}),this.register(function(e){return new uh(e)}),this.register(function(e){return new dh(e)}),this.register(function(e){return new fh(e)}),this.register(function(e){return new ph(e)})}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}setTextureUtils(e){return this.textureUtils=e,this}parse(e,t,n,r){let i=new $m,a=[];for(let e=0,t=this.pluginCallbacks.length;e<t;e++)a.push(this.pluginCallbacks[e](i));i.setPlugins(a),i.setTextureUtils(this.textureUtils),i.writeAsync(e,t,r).catch(n)}parseAsync(e,t){let n=this;return new Promise(function(r,i){n.parse(e,r,i,t)})}},Pm={POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6,BYTE:5120,UNSIGNED_BYTE:5121,SHORT:5122,UNSIGNED_SHORT:5123,INT:5124,UNSIGNED_INT:5125,FLOAT:5126,ARRAY_BUFFER:34962,ELEMENT_ARRAY_BUFFER:34963,NEAREST:9728,LINEAR:9729,NEAREST_MIPMAP_NEAREST:9984,LINEAR_MIPMAP_NEAREST:9985,NEAREST_MIPMAP_LINEAR:9986,LINEAR_MIPMAP_LINEAR:9987,CLAMP_TO_EDGE:33071,MIRRORED_REPEAT:33648,REPEAT:10497},Fm=`KHR_mesh_quantization`,Im={};Im[r]=Pm.NEAREST,Im[i]=Pm.NEAREST_MIPMAP_NEAREST,Im[a]=Pm.NEAREST_MIPMAP_LINEAR,Im[o]=Pm.LINEAR,Im[s]=Pm.LINEAR_MIPMAP_NEAREST,Im[c]=Pm.LINEAR_MIPMAP_LINEAR,Im[t]=Pm.CLAMP_TO_EDGE,Im[e]=Pm.REPEAT,Im[n]=Pm.MIRRORED_REPEAT;var Lm={scale:`scale`,position:`translation`,quaternion:`rotation`,morphTargetInfluences:`weights`},Rm=new q,zm=12,Bm=1179937895,Vm=2,Hm=8,Um=1313821514,Wm=5130562;function Gm(e,t){return e.length===t.length&&e.every(function(e,n){return e===t[n]})}function Km(e){return new TextEncoder().encode(e).buffer}function qm(e){return Gm(e.elements,[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1])}function Jm(e,t,n){let r={min:Array(e.itemSize).fill(1/0),max:Array(e.itemSize).fill(-1/0)};for(let i=t;i<t+n;i++)for(let t=0;t<e.itemSize;t++){let n;e.itemSize>4?n=e.array[i*e.itemSize+t]:(t===0?n=e.getX(i):t===1?n=e.getY(i):t===2?n=e.getZ(i):t===3&&(n=e.getW(i)),e.normalized===!0&&(n=Tt.normalize(n,e.array))),r.min[t]=Math.min(r.min[t],n),r.max[t]=Math.max(r.max[t],n)}return r}function Ym(e){return Math.ceil(e/4)*4}function Xm(e,t=0){let n=Ym(e.byteLength);if(n!==e.byteLength){let r=new Uint8Array(n);if(r.set(new Uint8Array(e)),t!==0)for(let i=e.byteLength;i<n;i++)r[i]=t;return r.buffer}return e}function Zm(){return typeof document>`u`&&typeof OffscreenCanvas<`u`?new OffscreenCanvas(1,1):document.createElement(`canvas`)}function Qm(e,t){if(typeof OffscreenCanvas<`u`&&e instanceof OffscreenCanvas){let n;return t===`image/jpeg`?n=.92:t===`image/webp`&&(n=.8),e.convertToBlob({type:t,quality:n})}return new Promise(n=>e.toBlob(n,t))}var $m=class{constructor(){this.plugins=[],this.options={},this.pending=[],this.buffers=[],this.byteOffset=0,this.buffers=[],this.nodeMap=new Map,this.skins=[],this.extensionsUsed={},this.extensionsRequired={},this.uids=new Map,this.uid=0,this.json={asset:{version:`2.0`,generator:`THREE.GLTFExporter r186`}},this.cache={meshes:new Map,attributes:new Map,attributesNormalized:new Map,materials:new Map,textures:new Map,images:new Map,normalMaps:new Map},this.textureUtils=null}setPlugins(e){this.plugins=e}setTextureUtils(e){this.textureUtils=e}async writeAsync(e,t,n={}){this.options=Object.assign({binary:!1,trs:!1,onlyVisible:!0,maxTextureSize:1/0,animations:[],includeCustomExtensions:!1,copyright:null},n),this.options.animations.length>0&&(this.options.trs=!0),await this.processInputAsync(e),await Promise.all(this.pending);let r=this,i=r.buffers,a=r.json;n=r.options;let o=r.extensionsUsed,s=r.extensionsRequired,c=new Blob(i,{type:`application/octet-stream`}),l=Object.keys(o),u=Object.keys(s);if(l.length>0&&(a.extensionsUsed=l),u.length>0&&(a.extensionsRequired=u),a.buffers&&a.buffers.length>0&&(a.buffers[0].byteLength=c.size),n.copyright&&(a.asset.copyright=n.copyright),n.binary===!0){let e=new FileReader;e.readAsArrayBuffer(c),e.onloadend=function(){let n=Xm(e.result),r=new DataView(new ArrayBuffer(Hm));r.setUint32(0,n.byteLength,!0),r.setUint32(4,Wm,!0);let i=Xm(Km(JSON.stringify(a)),32),o=new DataView(new ArrayBuffer(Hm));o.setUint32(0,i.byteLength,!0),o.setUint32(4,Um,!0);let s=new ArrayBuffer(zm),c=new DataView(s);c.setUint32(0,Bm,!0),c.setUint32(4,Vm,!0);let l=zm+o.byteLength+i.byteLength+r.byteLength+n.byteLength;c.setUint32(8,l,!0);let u=new Blob([s,o,i,r,n],{type:`application/octet-stream`}),d=new FileReader;d.readAsArrayBuffer(u),d.onloadend=function(){t(d.result)}}}else if(a.buffers&&a.buffers.length>0){let e=new FileReader;e.readAsDataURL(c),e.onloadend=function(){let n=e.result;a.buffers[0].uri=n,t(a)}}else t(a)}serializeUserData(e,t){if(Object.keys(e.userData).length===0)return;let n=this.options,r=this.extensionsUsed;try{let i=JSON.parse(JSON.stringify(e.userData));if(n.includeCustomExtensions&&i.gltfExtensions){t.extensions===void 0&&(t.extensions={});for(let e in i.gltfExtensions)t.extensions[e]=i.gltfExtensions[e],r[e]=!0;delete i.gltfExtensions}Object.keys(i).length>0&&(t.extras=i)}catch(t){console.warn(`THREE.GLTFExporter: userData of '`+e.name+`' won't be serialized because of JSON.stringify error - `+t.message)}}getUID(e,t=!1){if(this.uids.has(e)===!1){let t=new Map;t.set(!0,this.uid++),t.set(!1,this.uid++),this.uids.set(e,t)}return this.uids.get(e).get(t)}isNormalizedNormalAttribute(e){if(this.cache.attributesNormalized.has(e))return!1;let t=new K;for(let n=0,r=e.count;n<r;n++)if(Math.abs(t.fromBufferAttribute(e,n).length()-1)>5e-4)return!1;return!0}createNormalizedNormalAttribute(e){let t=this.cache;if(t.attributesNormalized.has(e))return t.attributesNormalized.get(e);let n=e.clone(),r=new K;for(let e=0,t=n.count;e<t;e++)r.fromBufferAttribute(n,e),r.x===0&&r.y===0&&r.z===0?r.setX(1):r.normalize(),n.setXYZ(e,r.x,r.y,r.z);return t.attributesNormalized.set(e,n),n}applyTextureTransform(e,t){let n=!1,r={};(t.offset.x!==0||t.offset.y!==0)&&(r.offset=t.offset.toArray(),n=!0),t.rotation!==0&&(r.rotation=t.rotation,n=!0),(t.repeat.x!==1||t.repeat.y!==1)&&(r.scale=t.repeat.toArray(),n=!0),n&&(e.extensions=e.extensions||{},e.extensions.KHR_texture_transform=r,this.extensionsUsed.KHR_texture_transform=!0)}async buildMetalRoughTextureAsync(e,t){if(e===t)return e;function n(e){return e.colorSpace===`srgb`?function(e){return e<.04045?e*.0773993808:(e*.9478672986+.0521327014)**2.4}:function(e){return e}}e instanceof Gi&&(e=await this.decompressTextureAsync(e)),t instanceof Gi&&(t=await this.decompressTextureAsync(t));let r=e?e.image:null,i=t?t.image:null,a=Math.max(r?r.width:0,i?i.width:0),o=Math.max(r?r.height:0,i?i.height:0),s=Zm();s.width=a,s.height=o;let c=s.getContext(`2d`,{willReadFrequently:!0});c.fillStyle=`#00ffff`,c.fillRect(0,0,a,o);let l=c.getImageData(0,0,a,o);if(r){c.drawImage(r,0,0,a,o);let t=n(e),i=c.getImageData(0,0,a,o).data;for(let e=2;e<i.length;e+=4)l.data[e]=t(i[e]/256)*256}if(i){c.drawImage(i,0,0,a,o);let e=n(t),r=c.getImageData(0,0,a,o).data;for(let t=1;t<r.length;t+=4)l.data[t]=e(r[t]/256)*256}c.putImageData(l,0,0);let u=(e||t).clone();return u.source=new zt(s),u.colorSpace=``,u.channel=(e||t).channel,e&&t&&e.channel!==t.channel&&console.warn(`THREE.GLTFExporter: UV channels for metalnessMap and roughnessMap textures must match.`),console.warn(`THREE.GLTFExporter: Merged metalnessMap and roughnessMap textures.`),u}async buildNormalMapTextureAsync(e,t,n){e instanceof Gi&&(e=await this.decompressTextureAsync(e));let r=e.image,i=Zm();i.width=r.width,i.height=r.height;let a=i.getContext(`2d`,{willReadFrequently:!0});a.drawImage(r,0,0,i.width,i.height);let o=a.getImageData(0,0,i.width,i.height),s=o.data;for(let e=0;e<s.length;e+=4)t&&(s[e+0]=255-s[e+0]),n&&(s[e+1]=255-s[e+1]);a.putImageData(o,0,0);let c=e.clone();return c.source=new zt(i),c}async decompressTextureAsync(e,t=1/0){if(this.textureUtils===null)throw Error(`THREE.GLTFExporter: setTextureUtils() must be called to process compressed textures.`);return await this.textureUtils.decompress(e,t)}processBuffer(e){let t=this.json,n=this.buffers;return t.buffers||=[{byteLength:0}],n.push(e),0}processBufferView(e,t,n,r,i){let a=this.json;a.bufferViews||=[];let o;switch(t){case Pm.BYTE:case Pm.UNSIGNED_BYTE:o=1;break;case Pm.SHORT:case Pm.UNSIGNED_SHORT:o=2;break;default:o=4}let s=e.itemSize*o;i===Pm.ARRAY_BUFFER&&(s=Math.ceil(s/4)*4);let c=Ym(r*s),l=new DataView(new ArrayBuffer(c)),u=0;for(let i=n;i<n+r;i++){for(let n=0;n<e.itemSize;n++){let r;e.itemSize>4?r=e.array[i*e.itemSize+n]:(n===0?r=e.getX(i):n===1?r=e.getY(i):n===2?r=e.getZ(i):n===3&&(r=e.getW(i)),e.normalized===!0&&(r=Tt.normalize(r,e.array))),t===Pm.FLOAT?l.setFloat32(u,r,!0):t===Pm.INT?l.setInt32(u,r,!0):t===Pm.UNSIGNED_INT?l.setUint32(u,r,!0):t===Pm.SHORT?l.setInt16(u,r,!0):t===Pm.UNSIGNED_SHORT?l.setUint16(u,r,!0):t===Pm.BYTE?l.setInt8(u,r):t===Pm.UNSIGNED_BYTE&&l.setUint8(u,r),u+=o}u%s!==0&&(u+=s-u%s)}let d={buffer:this.processBuffer(l.buffer),byteOffset:this.byteOffset,byteLength:c};return i!==void 0&&(d.target=i),i===Pm.ARRAY_BUFFER&&(d.byteStride=s),this.byteOffset+=c,a.bufferViews.push(d),{id:a.bufferViews.length-1,byteLength:0}}processBufferViewImage(e){let t=this,n=t.json;return n.bufferViews||=[],new Promise(function(r){let i=new FileReader;i.readAsArrayBuffer(e),i.onloadend=function(){let e=Xm(i.result),a={buffer:t.processBuffer(e),byteOffset:t.byteOffset,byteLength:e.byteLength};t.byteOffset+=e.byteLength,r(n.bufferViews.push(a)-1)}})}processAccessor(e,t,n,r){let i=this.json,a={1:`SCALAR`,2:`VEC2`,3:`VEC3`,4:`VEC4`,9:`MAT3`,16:`MAT4`},o;if(e.array.constructor===Float32Array)o=Pm.FLOAT;else if(e.array.constructor===Int32Array)o=Pm.INT;else if(e.array.constructor===Uint32Array)o=Pm.UNSIGNED_INT;else if(e.array.constructor===Int16Array)o=Pm.SHORT;else if(e.array.constructor===Uint16Array)o=Pm.UNSIGNED_SHORT;else if(e.array.constructor===Int8Array)o=Pm.BYTE;else if(e.array.constructor===Uint8Array)o=Pm.UNSIGNED_BYTE;else throw Error(`THREE.GLTFExporter: Unsupported bufferAttribute component type: `+e.array.constructor.name);if(n===void 0&&(n=0),(r===void 0||r===1/0)&&(r=e.count),r===0)return null;let s=Jm(e,n,r),c;t!==void 0&&(c=e===t.index?Pm.ELEMENT_ARRAY_BUFFER:Pm.ARRAY_BUFFER);let l=this.processBufferView(e,o,n,r,c),u={bufferView:l.id,byteOffset:l.byteOffset,componentType:o,count:r,max:s.max,min:s.min,type:a[e.itemSize]};return e.normalized===!0&&(u.normalized=!0),i.accessors||=[],i.accessors.push(u)-1}processImage(e,t,n,r=`image/png`){if(e!==null){let i=this,a=i.cache,o=i.json,s=i.options,c=i.pending;a.images.has(e)||a.images.set(e,{});let l=a.images.get(e),u=r+`:flipY/`+n.toString();if(l[u]!==void 0)return l[u];o.images||=[];let d={mimeType:r},f=Zm();f.width=Math.min(e.width,s.maxTextureSize),f.height=Math.min(e.height,s.maxTextureSize);let p=f.getContext(`2d`,{willReadFrequently:!0});if(n===!0&&(p.translate(0,f.height),p.scale(1,-1)),e.data!==void 0){t!==1023&&console.error(`GLTFExporter: Only RGBAFormat is supported.`,t),(e.width>s.maxTextureSize||e.height>s.maxTextureSize)&&console.warn(`GLTFExporter: Image size is bigger than maxTextureSize`,e);let n=new Uint8ClampedArray(e.height*e.width*4);for(let t=0;t<n.length;t+=4)n[t+0]=e.data[t+0],n[t+1]=e.data[t+1],n[t+2]=e.data[t+2],n[t+3]=e.data[t+3];p.putImageData(new ImageData(n,e.width,e.height),0,0)}else if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap||typeof OffscreenCanvas<`u`&&e instanceof OffscreenCanvas)p.drawImage(e,0,0,f.width,f.height);else throw Error(`THREE.GLTFExporter: Invalid image type. Use HTMLImageElement, HTMLCanvasElement, ImageBitmap or OffscreenCanvas.`);s.binary===!0?c.push(Qm(f,r).then(e=>i.processBufferViewImage(e)).then(e=>{d.bufferView=e})):d.uri=Lt.getDataURL(f,r);let m=o.images.push(d)-1;return l[u]=m,m}throw Error(`THREE.GLTFExporter: No valid image data found. Unable to process texture.`)}processSampler(e){let t=this.json;t.samplers||=[];let n={magFilter:Im[e.magFilter],minFilter:Im[e.minFilter],wrapS:Im[e.wrapS],wrapT:Im[e.wrapT]};return t.samplers.push(n)-1}async processTextureAsync(e){let t=this.options,n=this.cache,r=this.json;if(n.textures.has(e))return n.textures.get(e);r.textures||=[],e instanceof Gi&&(e=await this.decompressTextureAsync(e,t.maxTextureSize));let i=e.userData.mimeType,a=this.processImage(e.image,e.format,e.flipY,i),o={sampler:this.processSampler(e)};i===`image/webp`?(o.extensions=o.extensions||{},o.extensions.EXT_texture_webp={source:a},this.extensionsUsed.EXT_texture_webp=!0,this.extensionsRequired.EXT_texture_webp=!0):o.source=a,e.name&&(o.name=e.name),await this._invokeAllAsync(async function(t){t.writeTexture&&await t.writeTexture(e,o)});let s=r.textures.push(o)-1;return n.textures.set(e,s),s}async processMaterialAsync(e,t){let n=this.cache,r=this.json,i=t!==void 0&&t.hasAttribute(`tangent`),a=e.normalMap?e.uuid+`:`+i:e.uuid;if(n.materials.has(a))return n.materials.get(a);if(e.isShaderMaterial)return console.warn(`GLTFExporter: THREE.ShaderMaterial not supported.`),null;r.materials||=[];let o={pbrMetallicRoughness:{}};e.isMeshStandardMaterial!==!0&&e.isMeshBasicMaterial!==!0&&console.warn(`GLTFExporter: Use MeshStandardMaterial or MeshBasicMaterial for best results.`);let s=e.color.toArray().concat([e.opacity]);if(Gm(s,[1,1,1,1])||(o.pbrMetallicRoughness.baseColorFactor=s),e.isMeshStandardMaterial?(o.pbrMetallicRoughness.metallicFactor=e.metalness,o.pbrMetallicRoughness.roughnessFactor=e.roughness):(o.pbrMetallicRoughness.metallicFactor=0,o.pbrMetallicRoughness.roughnessFactor=1),e.metalnessMap||e.roughnessMap){let t=await this.buildMetalRoughTextureAsync(e.metalnessMap,e.roughnessMap),n={index:await this.processTextureAsync(t),texCoord:t.channel};this.applyTextureTransform(n,t),o.pbrMetallicRoughness.metallicRoughnessTexture=n}if(e.map){let t={index:await this.processTextureAsync(e.map),texCoord:e.map.channel};this.applyTextureTransform(t,e.map),o.pbrMetallicRoughness.baseColorTexture=t}if(e.emissive){let t=e.emissive;if(Math.max(t.r,t.g,t.b)>0&&(o.emissiveFactor=e.emissive.toArray()),e.emissiveMap){let t={index:await this.processTextureAsync(e.emissiveMap),texCoord:e.emissiveMap.channel};this.applyTextureTransform(t,e.emissiveMap),o.emissiveTexture=t}}if(e.normalMap){let t=e.normalScale,r=t.x<0,a=i?t.y<0:t.y>0,s=e.normalMap;if(r||a){n.normalMaps.has(e.normalMap)===!1&&n.normalMaps.set(e.normalMap,{});let t=n.normalMaps.get(e.normalMap),i=`${r}:${a}`;t[i]===void 0&&(t[i]=await this.buildNormalMapTextureAsync(e.normalMap,r,a)),s=t[i]}let c={index:await this.processTextureAsync(s),texCoord:e.normalMap.channel};Math.abs(t.x)!==1&&(c.scale=Math.abs(t.x)),this.applyTextureTransform(c,e.normalMap),o.normalTexture=c}if(e.aoMap){let t={index:await this.processTextureAsync(e.aoMap),texCoord:e.aoMap.channel};e.aoMapIntensity!==1&&(t.strength=e.aoMapIntensity),this.applyTextureTransform(t,e.aoMap),o.occlusionTexture=t}e.transparent?o.alphaMode=`BLEND`:e.alphaTest>0&&(o.alphaMode=`MASK`,o.alphaCutoff=e.alphaTest),e.side===2&&(o.doubleSided=!0),e.name!==``&&(o.name=e.name),this.serializeUserData(e,o),await this._invokeAllAsync(async function(t){t.writeMaterialAsync&&await t.writeMaterialAsync(e,o)});let c=r.materials.push(o)-1;return n.materials.set(a,c),c}async processMeshAsync(e){let t=this.cache,n=this.json,r=[e.geometry.uuid];if(Array.isArray(e.material))for(let t=0,n=e.material.length;t<n;t++)r.push(e.material[t].uuid);else r.push(e.material.uuid);let i=r.join(`:`);if(t.meshes.has(i))return t.meshes.get(i);let a=e.geometry,o;o=e.isLineSegments?Pm.LINES:e.isLineLoop?Pm.LINE_LOOP:e.isLine?Pm.LINE_STRIP:e.isPoints?Pm.POINTS:e.material.wireframe?Pm.LINES:Pm.TRIANGLES;let s={},c={},l=[],u=[],d={uv:`TEXCOORD_0`,uv1:`TEXCOORD_1`,uv2:`TEXCOORD_2`,uv3:`TEXCOORD_3`,color:`COLOR_0`,skinWeight:`WEIGHTS_0`,skinIndex:`JOINTS_0`},f=a.getAttribute(`normal`);f!==void 0&&!this.isNormalizedNormalAttribute(f)&&(console.warn(`THREE.GLTFExporter: Creating normalized normal attribute from the non-normalized one.`),a.setAttribute(`normal`,this.createNormalizedNormalAttribute(f)));let p=null;for(let e in a.attributes){if(e.slice(0,5)===`morph`)continue;let n=a.attributes[e];if(e=d[e]||e.toUpperCase(),!/^(POSITION|NORMAL|TANGENT|TEXCOORD_\d+|COLOR_\d+|JOINTS_\d+|WEIGHTS_\d+)$/.test(e)&&!e.startsWith(`_`)&&(e=`_`+e),t.attributes.has(this.getUID(n))){c[e]=t.attributes.get(this.getUID(n));continue}p=null;let r=n.array;e===`JOINTS_0`&&!(r instanceof Uint16Array)&&!(r instanceof Uint8Array)?(console.warn(`GLTFExporter: Attribute "skinIndex" converted to type UNSIGNED_SHORT.`),p=Nm.Utils.toTypedBufferAttribute(n,Uint16Array)):(r instanceof Uint32Array||r instanceof Int32Array)&&!e.startsWith(`_`)&&(console.warn(`GLTFExporter: Attribute "${e}" converted to type FLOAT.`),p=Nm.Utils.toTypedBufferAttribute(n,Float32Array));let i=this.processAccessor(p||n,a);i!==null&&(e.startsWith(`_`)||this.detectMeshQuantization(e,n),c[e]=i,t.attributes.set(this.getUID(n),i))}if(f!==void 0&&a.setAttribute(`normal`,f),Object.keys(c).length===0)return null;if(e.morphTargetInfluences!==void 0&&e.morphTargetInfluences.length>0){let n=[],r=[],i={};if(e.morphTargetDictionary!==void 0)for(let t in e.morphTargetDictionary)i[e.morphTargetDictionary[t]]=t;for(let o=0;o<e.morphTargetInfluences.length;++o){let s={},c=!1;for(let e in a.morphAttributes){if(e!==`position`&&e!==`normal`){c||=(console.warn(`GLTFExporter: Only POSITION and NORMAL morph are supported.`),!0);continue}let n=a.morphAttributes[e][o],r=e.toUpperCase(),i=a.attributes[e];if(t.attributes.has(this.getUID(n,!0))){s[r]=t.attributes.get(this.getUID(n,!0));continue}let l=n.clone();if(!a.morphTargetsRelative)for(let e=0,t=n.count;e<t;e++)for(let t=0;t<n.itemSize;t++)t===0&&l.setX(e,n.getX(e)-i.getX(e)),t===1&&l.setY(e,n.getY(e)-i.getY(e)),t===2&&l.setZ(e,n.getZ(e)-i.getZ(e)),t===3&&l.setW(e,n.getW(e)-i.getW(e));s[r]=this.processAccessor(l,a),t.attributes.set(this.getUID(i,!0),s[r])}u.push(s),n.push(e.morphTargetInfluences[o]),e.morphTargetDictionary!==void 0&&r.push(i[o])}s.weights=n,r.length>0&&(s.extras={},s.extras.targetNames=r)}let m=Array.isArray(e.material);if(m&&a.groups.length===0)return null;let h=!1;if(m&&a.index===null){let e=[];for(let t=0,n=a.attributes.position.count;t<n;t++)e[t]=t;a.setIndex(e),h=!0}let g=m?e.material:[e.material],_=m?a.groups:[{materialIndex:0,start:void 0,count:void 0}];for(let e=0,n=_.length;e<n;e++){let n={mode:o,attributes:c};if(this.serializeUserData(a,n),u.length>0&&(n.targets=u),a.index!==null){let r=this.getUID(a.index);(_[e].start!==void 0||_[e].count!==void 0)&&(r+=`:`+_[e].start+`:`+_[e].count),t.attributes.has(r)?n.indices=t.attributes.get(r):(n.indices=this.processAccessor(a.index,a,_[e].start,_[e].count),t.attributes.set(r,n.indices)),n.indices===null&&delete n.indices}let r=await this.processMaterialAsync(g[_[e].materialIndex],a);r!==null&&(n.material=r),l.push(n)}h===!0&&a.setIndex(null),s.primitives=l,n.meshes||=[],await this._invokeAllAsync(function(t){t.writeMesh&&t.writeMesh(e,s)});let v=n.meshes.push(s)-1;return t.meshes.set(i,v),v}detectMeshQuantization(e,t){if(this.extensionsUsed[Fm])return;let n;switch(t.array.constructor){case Int8Array:n=`byte`;break;case Uint8Array:n=`unsigned byte`;break;case Int16Array:n=`short`;break;case Uint16Array:n=`unsigned short`;break;default:return}t.normalized&&(n+=` normalized`);let r=e.split(`_`,1)[0];Mm[r]&&Mm[r].includes(n)&&(this.extensionsUsed[Fm]=!0,this.extensionsRequired[Fm]=!0)}processCamera(e){let t=this.json;t.cameras||=[];let n=e.isOrthographicCamera,r={type:n?`orthographic`:`perspective`};return n?r.orthographic={xmag:e.right*2,ymag:e.top*2,zfar:e.far<=0?.001:e.far,znear:e.near<0?0:e.near}:r.perspective={aspectRatio:e.aspect,yfov:Tt.degToRad(e.fov),zfar:e.far<=0?.001:e.far,znear:e.near<0?0:e.near},e.name!==``&&(r.name=e.type),t.cameras.push(r)-1}processAnimation(e,t){let n=this.json,r=this.nodeMap;n.animations||=[],e=Nm.Utils.mergeMorphTargetTracks(e.clone(),t);let i=e.tracks,a=[],o=[];for(let e=0;e<i.length;++e){let n=i[e],s=Rs.parseTrackName(n.name),c=Rs.findNode(t,s.nodeName),l=Lm[s.propertyName];if(s.objectName===`bones`&&(c=c.isSkinnedMesh===!0?c.skeleton.getBoneByName(s.objectIndex):void 0),!c||!l){console.warn(`THREE.GLTFExporter: Could not export animation track "%s".`,n.name);continue}let u=n.values.length/n.times.length;l===Lm.morphTargetInfluences&&(u/=c.morphTargetInfluences.length);let d;n.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline===!0?(d=`CUBICSPLINE`,u/=3):d=n.getInterpolation()===2300?`STEP`:`LINEAR`,o.push({input:this.processAccessor(new fr(n.times,1)),output:this.processAccessor(new fr(n.values,u)),interpolation:d}),a.push({sampler:o.length-1,target:{node:r.get(c),path:l}})}let s={name:e.name||`clip_`+n.animations.length,samplers:o,channels:a};return this.serializeUserData(e,s),n.animations.push(s),n.animations.length-1}processSkin(e){let t=this.json,n=this.nodeMap,r=t.nodes[n.get(e)],i=e.skeleton;if(i===void 0)return null;let a=e.skeleton.bones[0];if(a===void 0)return null;let o=[],s=new Float32Array(i.bones.length*16),c=new Yt;for(let t=0;t<i.bones.length;++t)o.push(n.get(i.bones[t])),c.copy(i.boneInverses[t]),c.multiply(e.bindMatrix).toArray(s,t*16);return t.skins===void 0&&(t.skins=[]),t.skins.push({inverseBindMatrices:this.processAccessor(new fr(s,16)),joints:o,skeleton:n.get(a)}),r.skin=t.skins.length-1}async processNodeAsync(e){let t=this.json,n=this.options,r=this.nodeMap;if(t.nodes||=[],e.pivot!==null)return await this._processNodeWithPivotAsync(e);let i={};if(n.trs){let t=e.quaternion.toArray(),n=e.position.toArray(),r=e.scale.toArray();Gm(t,[0,0,0,1])||(i.rotation=t),Gm(n,[0,0,0])||(i.translation=n),Gm(r,[1,1,1])||(i.scale=r)}else e.matrixAutoUpdate&&e.updateMatrix(),qm(e.matrix)===!1&&(i.matrix=e.matrix.elements);if(e.name!==``&&(i.name=String(e.name)),this.serializeUserData(e,i),e.isMesh||e.isLine||e.isPoints){let t=await this.processMeshAsync(e);t!==null&&(i.mesh=t)}else e.isCamera&&(i.camera=this.processCamera(e));e.isSkinnedMesh&&this.skins.push(e);let a=t.nodes.push(i)-1;if(r.set(e,a),e.children.length>0){let t=[];for(let r=0,i=e.children.length;r<i;r++){let i=e.children[r];if(i.visible||n.onlyVisible===!1){let e=await this.processNodeAsync(i);e!==null&&t.push(e)}}t.length>0&&(i.children=t)}return await this._invokeAllAsync(function(t){t.writeNode&&t.writeNode(e,i)}),a}async _processNodeWithPivotAsync(e){let t=this.json,n=this.options,r=this.nodeMap,i=e.pivot,a={},o=e.quaternion.toArray(),s=[e.position.x+i.x,e.position.y+i.y,e.position.z+i.z],c=e.scale.toArray();Gm(o,[0,0,0,1])||(a.rotation=o),Gm(s,[0,0,0])||(a.translation=s),Gm(c,[1,1,1])||(a.scale=c),a.extras={pivot:i.toArray()},e.name!==``&&(a.name=String(e.name)),this.serializeUserData(e,a);let l=t.nodes.push(a)-1;r.set(e,l);let u={},d=[-i.x,-i.y,-i.z];if(Gm(d,[0,0,0])||(u.translation=d),e.isMesh||e.isLine||e.isPoints){let t=await this.processMeshAsync(e);t!==null&&(u.mesh=t)}else e.isCamera&&(u.camera=this.processCamera(e));e.isSkinnedMesh&&this.skins.push(e);let f=[t.nodes.push(u)-1];if(e.children.length>0){let t=[];for(let r=0,i=e.children.length;r<i;r++){let i=e.children[r];if(i.visible||n.onlyVisible===!1){let e=await this.processNodeAsync(i);e!==null&&t.push(e)}}t.length>0&&(u.children=t)}return a.children=f,await this._invokeAllAsync(function(t){t.writeNode&&t.writeNode(e,a)}),l}async processSceneAsync(e){let t=this.json,n=this.options;t.scenes||(t.scenes=[],t.scene=0);let r={};e.name!==``&&(r.name=e.name),t.scenes.push(r);let i=[];for(let t=0,r=e.children.length;t<r;t++){let r=e.children[t];if(r.visible||n.onlyVisible===!1){let e=await this.processNodeAsync(r);e!==null&&i.push(e)}}i.length>0&&(r.nodes=i),this.serializeUserData(e,r)}async processObjectsAsync(e){let t=new Nn;t.name=`AuxScene`;for(let n=0;n<e.length;n++)t.children.push(e[n]);await this.processSceneAsync(t)}async processInputAsync(e){let t=this.options;e=e instanceof Array?e:[e],await this._invokeAllAsync(function(t){t.beforeParse&&t.beforeParse(e)});let n=[];for(let t=0;t<e.length;t++)e[t]instanceof Nn?await this.processSceneAsync(e[t]):n.push(e[t]);n.length>0&&await this.processObjectsAsync(n);for(let e=0;e<this.skins.length;++e)this.processSkin(this.skins[e]);if(e.length===1)for(let n=0;n<t.animations.length;++n)this.processAnimation(t.animations[n],e[0]);else for(let n=0;n<e.length;n++){let r=t.animations[n]||[];for(let t=0;t<r.length;++t)this.processAnimation(r[t],e[n])}await this._invokeAllAsync(function(t){t.afterParse&&t.afterParse(e)})}async _invokeAllAsync(e){for(let t=0,n=this.plugins.length;t<n;t++)await e(this.plugins[t])}},eh=class{constructor(e){this.writer=e,this.name=`KHR_lights_punctual`}writeNode(e,t){if(!e.isLight)return;if(!e.isDirectionalLight&&!e.isPointLight&&!e.isSpotLight){console.warn(`THREE.GLTFExporter: Only directional, point, and spot lights are supported.`,e);return}let n=this.writer,r=n.json,i=n.extensionsUsed,a={};e.name&&(a.name=e.name),a.color=e.color.toArray(),a.intensity=e.intensity,e.isDirectionalLight?a.type=`directional`:e.isPointLight?(a.type=`point`,e.distance>0&&(a.range=e.distance)):e.isSpotLight&&(a.type=`spot`,e.distance>0&&(a.range=e.distance),a.spot={},a.spot.innerConeAngle=(1-e.penumbra)*e.angle,a.spot.outerConeAngle=e.angle),e.decay!==void 0&&e.decay!==2&&console.warn(`THREE.GLTFExporter: Light decay may be lost. glTF is physically-based, and expects light.decay=2.`),e.target&&(e.target.parent!==e||e.target.position.x!==0||e.target.position.y!==0||e.target.position.z!==-1)&&console.warn(`THREE.GLTFExporter: Light direction may be lost. For best results, make light.target a child of the light with position 0,0,-1.`),i[this.name]||(r.extensions=r.extensions||{},r.extensions[this.name]={lights:[]},i[this.name]=!0);let o=r.extensions[this.name].lights;o.push(a),t.extensions=t.extensions||{},t.extensions[this.name]={light:o.length-1}}},th=class{constructor(e){this.writer=e,this.name=`KHR_materials_unlit`}async writeMaterialAsync(e,t){if(!e.isMeshBasicMaterial)return;let n=this.writer.extensionsUsed;t.extensions=t.extensions||{},t.extensions[this.name]={},n[this.name]=!0,t.pbrMetallicRoughness.metallicFactor=0,t.pbrMetallicRoughness.roughnessFactor=.9}},nh=class{constructor(e){this.writer=e,this.name=`KHR_materials_clearcoat`}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.clearcoat===0)return;let n=this.writer,r=n.extensionsUsed,i={};if(i.clearcoatFactor=e.clearcoat,e.clearcoatMap){let t={index:await n.processTextureAsync(e.clearcoatMap),texCoord:e.clearcoatMap.channel};n.applyTextureTransform(t,e.clearcoatMap),i.clearcoatTexture=t}if(i.clearcoatRoughnessFactor=e.clearcoatRoughness,e.clearcoatRoughnessMap){let t={index:await n.processTextureAsync(e.clearcoatRoughnessMap),texCoord:e.clearcoatRoughnessMap.channel};n.applyTextureTransform(t,e.clearcoatRoughnessMap),i.clearcoatRoughnessTexture=t}if(e.clearcoatNormalMap){let t={index:await n.processTextureAsync(e.clearcoatNormalMap),texCoord:e.clearcoatNormalMap.channel};e.clearcoatNormalScale.x!==1&&(t.scale=e.clearcoatNormalScale.x),n.applyTextureTransform(t,e.clearcoatNormalMap),i.clearcoatNormalTexture=t}t.extensions=t.extensions||{},t.extensions[this.name]=i,r[this.name]=!0}},rh=class{constructor(e){this.writer=e,this.name=`KHR_materials_dispersion`}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.dispersion===0)return;let n=this.writer.extensionsUsed,r={};r.dispersion=e.dispersion,t.extensions=t.extensions||{},t.extensions[this.name]=r,n[this.name]=!0}},ih=class{constructor(e){this.writer=e,this.name=`KHR_materials_iridescence`}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.iridescence===0)return;let n=this.writer,r=n.extensionsUsed,i={};if(i.iridescenceFactor=e.iridescence,e.iridescenceMap){let t={index:await n.processTextureAsync(e.iridescenceMap),texCoord:e.iridescenceMap.channel};n.applyTextureTransform(t,e.iridescenceMap),i.iridescenceTexture=t}if(i.iridescenceIor=e.iridescenceIOR,i.iridescenceThicknessMinimum=e.iridescenceThicknessRange[0],i.iridescenceThicknessMaximum=e.iridescenceThicknessRange[1],e.iridescenceThicknessMap){let t={index:await n.processTextureAsync(e.iridescenceThicknessMap),texCoord:e.iridescenceThicknessMap.channel};n.applyTextureTransform(t,e.iridescenceThicknessMap),i.iridescenceThicknessTexture=t}t.extensions=t.extensions||{},t.extensions[this.name]=i,r[this.name]=!0}},ah=class{constructor(e){this.writer=e,this.name=`KHR_materials_transmission`}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.transmission===0)return;let n=this.writer,r=n.extensionsUsed,i={};if(i.transmissionFactor=e.transmission,e.transmissionMap){let t={index:await n.processTextureAsync(e.transmissionMap),texCoord:e.transmissionMap.channel};n.applyTextureTransform(t,e.transmissionMap),i.transmissionTexture=t}t.extensions=t.extensions||{},t.extensions[this.name]=i,r[this.name]=!0}},oh=class{constructor(e){this.writer=e,this.name=`KHR_materials_volume`}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.transmission===0)return;let n=this.writer,r=n.extensionsUsed,i={};if(i.thicknessFactor=e.thickness,e.thicknessMap){let t={index:await n.processTextureAsync(e.thicknessMap),texCoord:e.thicknessMap.channel};n.applyTextureTransform(t,e.thicknessMap),i.thicknessTexture=t}e.attenuationDistance!==1/0&&(i.attenuationDistance=e.attenuationDistance),i.attenuationColor=e.attenuationColor.toArray(),t.extensions=t.extensions||{},t.extensions[this.name]=i,r[this.name]=!0}},sh=class{constructor(e){this.writer=e,this.name=`KHR_materials_ior`}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.ior===1.5)return;let n=this.writer.extensionsUsed,r={};r.ior=e.ior,t.extensions=t.extensions||{},t.extensions[this.name]=r,n[this.name]=!0}},ch=class{constructor(e){this.writer=e,this.name=`KHR_materials_specular`}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.specularIntensity===1&&e.specularColor.equals(Rm)&&!e.specularIntensityMap&&!e.specularColorMap)return;let n=this.writer,r=n.extensionsUsed,i={};if(e.specularIntensityMap){let t={index:await n.processTextureAsync(e.specularIntensityMap),texCoord:e.specularIntensityMap.channel};n.applyTextureTransform(t,e.specularIntensityMap),i.specularTexture=t}if(e.specularColorMap){let t={index:await n.processTextureAsync(e.specularColorMap),texCoord:e.specularColorMap.channel};n.applyTextureTransform(t,e.specularColorMap),i.specularColorTexture=t}i.specularFactor=e.specularIntensity,i.specularColorFactor=e.specularColor.toArray(),t.extensions=t.extensions||{},t.extensions[this.name]=i,r[this.name]=!0}},lh=class{constructor(e){this.writer=e,this.name=`KHR_materials_sheen`}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.sheen==0)return;let n=this.writer,r=n.extensionsUsed,i={};if(e.sheenRoughnessMap){let t={index:await n.processTextureAsync(e.sheenRoughnessMap),texCoord:e.sheenRoughnessMap.channel};n.applyTextureTransform(t,e.sheenRoughnessMap),i.sheenRoughnessTexture=t}if(e.sheenColorMap){let t={index:await n.processTextureAsync(e.sheenColorMap),texCoord:e.sheenColorMap.channel};n.applyTextureTransform(t,e.sheenColorMap),i.sheenColorTexture=t}i.sheenRoughnessFactor=e.sheenRoughness,i.sheenColorFactor=e.sheenColor.toArray(),t.extensions=t.extensions||{},t.extensions[this.name]=i,r[this.name]=!0}},uh=class{constructor(e){this.writer=e,this.name=`KHR_materials_anisotropy`}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.anisotropy==0)return;let n=this.writer,r=n.extensionsUsed,i={};if(e.anisotropyMap){let t={index:await n.processTextureAsync(e.anisotropyMap)};n.applyTextureTransform(t,e.anisotropyMap),i.anisotropyTexture=t}i.anisotropyStrength=e.anisotropy,i.anisotropyRotation=e.anisotropyRotation,t.extensions=t.extensions||{},t.extensions[this.name]=i,r[this.name]=!0}},dh=class{constructor(e){this.writer=e,this.name=`KHR_materials_emissive_strength`}async writeMaterialAsync(e,t){if(!e.isMeshStandardMaterial||e.emissiveIntensity===1)return;let n=this.writer.extensionsUsed,r={};r.emissiveStrength=e.emissiveIntensity,t.extensions=t.extensions||{},t.extensions[this.name]=r,n[this.name]=!0}},fh=class{constructor(e){this.writer=e,this.name=`EXT_materials_bump`}async writeMaterialAsync(e,t){if(!e.isMeshStandardMaterial||e.bumpScale===1&&!e.bumpMap)return;let n=this.writer,r=n.extensionsUsed,i={};if(e.bumpMap){let t={index:await n.processTextureAsync(e.bumpMap),texCoord:e.bumpMap.channel};n.applyTextureTransform(t,e.bumpMap),i.bumpTexture=t}i.bumpFactor=e.bumpScale,t.extensions=t.extensions||{},t.extensions[this.name]=i,r[this.name]=!0}},ph=class{constructor(e){this.writer=e,this.name=`EXT_mesh_gpu_instancing`}writeNode(e,t){if(!e.isInstancedMesh)return;let n=this.writer,r=e,i=new Float32Array(r.count*3),a=new Float32Array(r.count*4),o=new Float32Array(r.count*3),s=new Yt,c=new K,l=new G,u=new K;for(let e=0;e<r.count;e++)r.getMatrixAt(e,s),s.decompose(c,l,u),c.toArray(i,e*3),l.toArray(a,e*4),u.toArray(o,e*3);let d={TRANSLATION:n.processAccessor(new fr(i,3)),ROTATION:n.processAccessor(new fr(a,4)),SCALE:n.processAccessor(new fr(o,3))};r.instanceColor&&(d._COLOR_0=n.processAccessor(r.instanceColor)),t.extensions=t.extensions||{},t.extensions[this.name]={attributes:d},n.extensionsUsed[this.name]=!0,n.extensionsRequired[this.name]=!0}};Nm.Utils={insertKeyframe:function(e,t){let n=.001,r=e.getValueSize(),i=new e.TimeBufferType(e.times.length+1),a=new e.ValueBufferType(e.values.length+r),o=e.createInterpolant(new e.ValueBufferType(r)),s;if(e.times.length===0){i[0]=t;for(let e=0;e<r;e++)a[e]=0;s=0}else if(t<e.times[0]){if(Math.abs(e.times[0]-t)<n)return 0;i[0]=t,i.set(e.times,1),a.set(o.evaluate(t),0),a.set(e.values,r),s=0}else if(t>e.times[e.times.length-1]){if(Math.abs(e.times[e.times.length-1]-t)<n)return e.times.length-1;i[i.length-1]=t,i.set(e.times,0),a.set(e.values,0),a.set(o.evaluate(t),e.values.length),s=i.length-1}else for(let c=0;c<e.times.length;c++){if(Math.abs(e.times[c]-t)<n)return c;if(e.times[c]<t&&e.times[c+1]>t){i.set(e.times.slice(0,c+1),0),i[c+1]=t,i.set(e.times.slice(c+1),c+2),a.set(e.values.slice(0,(c+1)*r),0),a.set(o.evaluate(t),(c+1)*r),a.set(e.values.slice((c+1)*r),(c+2)*r),s=c+1;break}}return e.times=i,e.values=a,s},mergeMorphTargetTracks:function(e,t){let n=[],r={},i=e.tracks;for(let e=0;e<i.length;++e){let a=i[e],o=Rs.parseTrackName(a.name),s=Rs.findNode(t,o.nodeName);if(o.propertyName!==`morphTargetInfluences`||o.propertyIndex===void 0){n.push(a);continue}if(a.createInterpolant!==a.InterpolantFactoryMethodDiscrete&&a.createInterpolant!==a.InterpolantFactoryMethodLinear){if(a.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline)throw Error(`THREE.GLTFExporter: Cannot merge tracks with glTF CUBICSPLINE interpolation.`);console.warn(`THREE.GLTFExporter: Morph target interpolation mode not yet supported. Using LINEAR instead.`),a=a.clone(),a.setInterpolation(R)}let c=s.morphTargetInfluences.length,l=s.morphTargetDictionary[o.propertyIndex];if(l===void 0)throw Error(`THREE.GLTFExporter: Morph target name not found: `+o.propertyIndex);let u;if(r[s.uuid]===void 0){u=a.clone();let e=new u.ValueBufferType(c*u.times.length);for(let t=0;t<u.times.length;t++)e[t*c+l]=u.values[t];u.name=(o.nodeName||``)+`.morphTargetInfluences`,u.values=e,r[s.uuid]=u,n.push(u);continue}let d=a.createInterpolant(new a.ValueBufferType(1));u=r[s.uuid];for(let e=0;e<u.times.length;e++)u.values[e*c+l]=d.evaluate(u.times[e]);for(let e=0;e<a.times.length;e++){let t=this.insertKeyframe(u,a.times[e]);u.values[t*c+l]=a.values[e]}}return e.tracks=n,e},toTypedBufferAttribute:function(e,t){let n=new fr(new t(e.count*e.itemSize),e.itemSize,!1);if(!e.normalized&&!e.isInterleavedBufferAttribute)return n.array.set(e.array),n;for(let t=0,r=e.count;t<r;t++)for(let r=0;r<e.itemSize;r++)n.setComponent(t,r,e.getComponent(t,r));return n}};function mh(){let e=new Nn,t=new Zf(qf);t.root.name=`Hero`;let n=new Zf(Jf);n.root.name=`Goblin`,n.root.position.x=1.5,e.add(t.root,n.root),[`sword`,`axe`,`pickaxe`,`bow`,`shield`,`club`].forEach((t,n)=>{let r=vf(t);r.root.name=t,r.root.position.set(-1.5-n*.6,.2,0),e.add(r.root)}),new Nm().parse(e,e=>{let t=new Blob([e],{type:`model/gltf-binary`}),n=document.createElement(`a`);n.href=URL.createObjectURL(t),n.download=`pixelisland-combat-models.glb`,n.click(),setTimeout(()=>URL.revokeObjectURL(n.href),2e3)},e=>console.error(e),{binary:!0})}var hh={pelvis:`Hips`,spine:`Spine`,chest:`Spine2`,neck:`Neck`,head:`Head`,upperArmR:`RightArm`,forearmR:`RightForeArm`,handR:`RightHand`,upperArmL:`LeftArm`,forearmL:`LeftForeArm`,handL:`LeftHand`,thighR:`RightUpLeg`,shinR:`RightLeg`,footR:`RightFoot`,thighL:`LeftUpLeg`,shinL:`LeftLeg`,footL:`LeftFoot`},gh=class{rig;mode=`off`;group=new wn;dots=new Map;labels=new Map;lines;pairs=[];tips={};v=new K;savedOpacity=new Map;constructor(e,t){this.rig=t,this.group.visible=!1,this.group.renderOrder=999,e.add(this.group);let n=new To(.028,10,8);for(let e of Kf){let t=e.endsWith(`R`)?16734810:e.endsWith(`L`)?5941503:16765514,r=new J(n,new ii({color:t,depthTest:!1,transparent:!0}));r.renderOrder=1e3,this.group.add(r),this.dots.set(e,r);let i=this.makeLabel(`${e}  ·  ${hh[e]}`,t,e.endsWith(`L`));this.group.add(i),this.labels.set(e,i);let a=this.rig.joints[e].parent,o=Kf.find(e=>this.rig.joints[e]===a);o&&this.pairs.push([o,e])}let r=(e,t,n,r,i)=>{let a=new Cn;a.position.set(n,r,i),this.rig.joints[t].add(a),this.tips[e]=a};r(`tipHead`,`head`,0,.26,0),r(`tipFootR`,`footR`,0,-.06,.16),r(`tipFootL`,`footL`,0,-.06,.16),this.pairs.push([`head`,`tipHead`],[`footR`,`tipFootR`],[`footL`,`tipFootL`]);let i=new Dr;i.setAttribute(`position`,new hr(new Float32Array(this.pairs.length*6),3)),this.lines=new Wi(i,new Mi({color:16777215,depthTest:!1,transparent:!0})),this.lines.renderOrder=999,this.lines.frustumCulled=!1,this.group.add(this.lines)}makeLabel(e,t,n){let r=document.createElement(`canvas`);r.width=512,r.height=64;let i=r.getContext(`2d`);i.font=`bold 30px sans-serif`;let a=i.measureText(e).width+24;i.fillStyle=`rgba(10,14,22,0.78)`,i.fillRect(0,8,a,48),i.fillStyle=`#`+t.toString(16).padStart(6,`0`),i.fillText(e,12,43);let o=new qi(r);o.colorSpace=Fe;let s=new Zr(new Lr({map:o,depthTest:!1,transparent:!0,sizeAttenuation:!1}));return s.center.set(n?1.04-(1-a/512):-.04,.5),s.scale.set(.24,.03,1),s.renderOrder=1001,s}cycle(){return this.mode=this.mode===`off`?`rig`:this.mode===`rig`?`rest`:`off`,this.group.visible=this.mode!==`off`,this.setGhost(this.mode!==`off`),this.mode===`off`?`Rig: desligado`:this.mode===`rig`?`Rig: esqueleto (animado)`:`Rig: pose de repouso`}setGhost(e){for(let t of this.rig.materials){if(e)this.savedOpacity.has(t)||this.savedOpacity.set(t,[t.transparent,t.opacity,t.depthWrite]),t.transparent=!0,t.opacity=.28,t.depthWrite=!1;else{let e=this.savedOpacity.get(t);e&&([t.transparent,t.opacity,t.depthWrite]=e)}t.needsUpdate=!0}e||this.savedOpacity.clear()}update(){if(this.mode===`off`)return;let e=this.rig;if(this.mode===`rest`){for(let t of Kf)e.joints[t].quaternion.identity();e.body.rotation.set(0,0,0),e.body.scale.set(1,1,1),e.body.position.y=e.bodyPivotY}e.root.updateMatrixWorld(!0);let t=t=>(t in this.tips?this.tips[t]:e.joints[t]).getWorldPosition(this.v),n=this.lines.geometry.getAttribute(`position`);this.pairs.forEach(([e,r],i)=>{let a=t(e);n.setXYZ(i*2,a.x,a.y,a.z);let o=t(r);n.setXYZ(i*2+1,o.x,o.y,o.z)}),n.needsUpdate=!0;for(let t of Kf){let n=e.joints[t].getWorldPosition(this.v);this.dots.get(t).position.copy(n),this.labels.get(t).position.copy(n)}}},_h=new class{renderer;ctx;camRig;player;view;fpv;enemies;arena;pickups;projectiles;inventory;hud;invPanel;tweak;touch;rigViewer;help;debug=new $d;started=!1;paused=!1;last=performance.now();isTouch;constructor(e){this.isTouch=matchMedia(`(pointer: coarse)`).matches||`ontouchstart`in window;let t=new cd({antialias:!this.isTouch||devicePixelRatio<2,powerPreference:`high-performance`});t.setPixelRatio(Math.min(devicePixelRatio,this.isTouch?1.5:2)),t.shadowMap.enabled=!0,t.shadowMap.type=1,t.toneMapping=4,t.toneMappingExposure=1,t.outputColorSpace=Fe,e.appendChild(t.domElement),this.renderer=t;let n=hd(),r=new Nn,i=new _d;i.attachKeyboardMouse(t.domElement);let a=new vd,o=new Zd(n);r.add(o.group),r.add(this.debug.lines),this.ctx={tuning:n,input:i,events:a,scene:r,fx:o,clock:new gd(n),physics:new Vd,combat:new Gd,sound:new Kd(n),shake:new Qd(n),threats:()=>this.enemies.enemies};let s=this.ctx;this.inventory=new nf(20,6);for(let e of[`sword`,`axe`,`pickaxe`,`bow`,`shield`])this.inventory.add(e,1);this.inventory.add(`arrow`,20),[`sword`,`axe`,`pickaxe`,`bow`,`shield`,`arrow`].forEach((e,t)=>this.inventory.setHotbar(t,e)),this.camRig=new Qp(s),this.projectiles=new bf(s),this.pickups=new af(s,this.inventory),this.player=new rp(s,this.camRig,this.inventory,this.projectiles),this.camRig.player=this.player,s.combat.add(this.player),this.view=new Np(s,this.player),this.rigViewer=new gh(s.scene,this.view.rig),this.fpv=new Xp(s,this.player),this.enemies=new tm(s),this.arena=new Em(s,this.pickups),this.player.spawn(this.arena.playerStart,0),this.camRig.yaw=0,this.hud=new rm(s,this.inventory),new Sf(s,this.camRig.camera,this.hud),this.hud.onHotbarClick=e=>{this.inventory.select(e),this.player.requestEquip(this.inventory.hotbar[e]),s.sound.play(`uiClick`)},this.hud.onHotbarLongPress=()=>this.toggleInventory(),this.invPanel=new im(this.inventory),this.invPanel.getEquipped=()=>({main:this.player.mainHand,off:this.player.offHand}),this.invPanel.onEquip=e=>this.player.requestEquip(e),this.invPanel.onClose=()=>this.setPaused(!1),this.help=jm(),this.touch=new am(i,t.domElement),this.touch.setActive(this.isTouch),this.tweak=new Sm(n,{"Gerar inimigo":()=>this.spawnEnemy(),"Restaurar arena":()=>this.resetArena(),"Exportar modelos (.glb)":()=>mh(),"Ver rig (X)":()=>this.toggleRig()}),this.isTouch&&this.tweak.gui.domElement.classList.add(`touch`),window.addEventListener(`pointerdown`,e=>{e.pointerType===`touch`&&!this.touch.active&&this.touch.setActive(!0)}),window.addEventListener(`mousemove`,e=>{this.touch.active&&(e.movementX||e.movementY)&&!this.isTouch&&this.touch.setActive(!1)}),s.events.on(`enemyDeath`,({pos:e})=>{Math.random()<.7&&this.pickups.spawn(`arrow`,e.clone(),new K(Q(-1,1),4,Q(-1,1)),3)}),s.events.on(`playerRespawn`,()=>this.hud.toast(`Você se levantou de novo!`,`info`));let c=Am(this.isTouch,()=>{s.sound.unlock(),c.remove(),this.started=!0,this.isTouch?document.documentElement.requestFullscreen?.().catch(()=>{}):t.domElement.requestPointerLock?.(),this.hud.toast(`Bem-vindo! H = ajuda · P = ajustes`,`info`)});window.addEventListener(`pointerdown`,()=>s.sound.unlock(),{once:!0}),window.addEventListener(`resize`,()=>this.resize()),this.resize(),this.spawnEnemy(),t.setAnimationLoop(()=>this.frame())}resize(){let e=window.innerWidth,t=window.innerHeight;this.renderer.setSize(e,t),this.camRig.camera.aspect=e/t,this.camRig.camera.updateProjectionMatrix()}setPaused(e){this.paused=e,this.ctx.input.blocked=e,e&&(this.ctx.input.releaseAll(),document.exitPointerLock?.())}toggleInventory(){this.invPanel.toggle(),this.setPaused(this.invPanel.isOpen)}toggleRig(){let e=this.rigViewer.cycle();this.view.hideGear=this.rigViewer.mode!==`off`,this.rigViewer.mode!==`off`&&this.camRig.mode===`first`&&this.camRig.toggleView(),this.hud.toast(e,`info`)}spawnEnemy(){if(this.enemies.enemies.filter(e=>e.alive).length>=8){this.hud.toast(`Limite de 8 inimigos`,`warn`);return}this.enemies.spawn(this.arena.spawnPoint)}resetArena(){this.arena.reset(),this.enemies.clear(),this.pickups.clear(),this.projectiles.clear(),this.ctx.fx.clear();let e=this.player;e.hp=e.maxHp,e.stamina=this.ctx.tuning.staminaMax,e.exhausted=!1,e.lockTarget=null;let t=this.inventory.count(`arrow`);t<20&&this.inventory.add(`arrow`,20-t),e.alive||e.spawn(this.arena.playerStart),this.ctx.sound.play(`resetArena`),this.hud.toast(`Arena restaurada`,`good`)}handleGlobalInput(){let e=this.ctx.input,t=e.blocked;if(e.blocked=!1,e.consume(`inventory`)&&(this.help.close(),this.toggleInventory()),e.consume(`help`)){let e=this.help.toggle();this.invPanel.isOpen&&this.invPanel.close(),this.setPaused(e)}else e.blocked=t||this.paused;if(e.consume(`tweak`)&&(this.tweak.toggle(),this.tweak.isOpen&&document.exitPointerLock?.()),!this.paused){if(e.consume(`juice`)){let e=this.tweak.toggleJuice();this.hud.toast(e?`Juice LIGADO (hit stop, tremor, partículas…)`:`Juice DESLIGADO — sinta a diferença`,e?`good`:`warn`)}e.consume(`spawn`)&&this.spawnEnemy(),e.consume(`reset`)&&this.resetArena(),e.consume(`rigView`)&&this.toggleRig(),e.consume(`runToggle`)&&this.hud.toast(e.runLock?`Correr travado (Z para soltar)`:`Andando`,`info`)}}frame(){let e=performance.now(),t=(e-this.last)/1e3;this.last=e;let n=this.ctx,r=n.clock;n.input.update(),this.started&&this.handleGlobalInput(),this.help.isOpen()===!1&&this.paused&&!this.invPanel.isOpen&&this.setPaused(!1),r.tick(this.paused||!this.started?0:t);let i=r.dt,a=r.playerDt;this.player.update(a),this.enemies.update(i,this.player),this.arena.update(i,this.camRig.camera),this.projectiles.update(i),this.pickups.update(i,this.player.alive?this.player.position:null),n.fx.update(i,this.camRig.camera),n.shake.update(r.realDt),this.camRig.update(r.realDt,a);let o=this.camRig.camera,s=this.camRig.blend>.5;this.view.visible=!s&&this.camRig.headDistance>.6,this.view.update(a),this.rigViewer.update(),this.fpv.visible=s,this.fpv.update(a,o);let c=new K().setFromMatrixColumn(o.matrixWorld,0);n.sound.setListener(o.position,c);let l=[],u=this.player.attack;if(n.tuning.showHitboxes&&u&&this.player.state===`attack`){let e=new K,t=new K,r=new K,i=new K,a=new K;Vf(u.def,u.weapon,this.player.swingAngle,n.tuning.rangeMul,this.player.position,u.yaw,1,e,t,r,i,a,u.aimPitch),l.push({base:t,tip:r})}this.debug.update(n.tuning.showHitboxes,n.combat,l);let d=this.arena.dummy;this.touch.setJumpIsDodge(!!this.player.lockTarget),this.hud.update(r.realDt,o,this.player,s,{lastDamage:d.lastDamage,combo:d.combo,dps:d.dps,pos:d.pos});let f=this.renderer;f.autoClear=!0,f.render(n.scene,o),s&&(f.autoClear=!1,f.clearDepth(),f.render(this.fpv.scene,o),f.autoClear=!0),n.input.endFrame()}}(document.getElementById(`app`));window.game=_h;