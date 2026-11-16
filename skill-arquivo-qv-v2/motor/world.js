import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
const W=1080,H=1920, R=4000, EC=new THREE.Vector3(0,-R,0);
const D=await (await fetch('/words.json')).json(); const C=D.cues, WORDS=D.words;
const clamp=(x,a=0,b=1)=>Math.min(Math.max(x,a),b), sm=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10)}, lerp=(a,b,k)=>a+(b-a)*k;
const hs=(i,s=0)=>{const x=Math.sin(i*127.1+s*311.7)*43758.5453;return x-Math.floor(x)};
const renderer=new THREE.WebGLRenderer({canvas:document.getElementById('gl'),antialias:false,logarithmicDepthBuffer:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(1); renderer.setSize(W,H,false); renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=0.85;
const scene=new THREE.Scene(); const pm=new THREE.PMREMGenerator(renderer); scene.environment=pm.fromScene(new RoomEnvironment(),0.04).texture;scene.environmentIntensity=0.35;
const cam=new THREE.PerspectiveCamera(40,W/H,0.5,90000);
const sun=new THREE.DirectionalLight(0xffe2b8,2.4); sun.position.set(-300,260,420); scene.add(sun);
scene.add(new THREE.HemisphereLight(0x8fb8ff,0x4a3a2a,0.55));const rimA=new THREE.DirectionalLight(0x9ecbff,.9);rimA.position.set(300,120,-200);scene.add(rimA);const rimB=new THREE.DirectionalLight(0xffd0a0,.7);rimB.position.set(-250,60,-250);scene.add(rimB);
const comp=new EffectComposer(renderer); comp.setSize(W,H); comp.addPass(new RenderPass(scene,cam));
const bloom=new UnrealBloomPass(new THREE.Vector2(W/2,H/2),0.16,0.5,0.95); comp.addPass(bloom); comp.addPass(new OutputPass());
// ---------- ruído GLSL ----------
const NOISE=`float h3(vec3 p){p=fract(p*0.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float n3(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*n3(p);p*=2.03;a*=.5;}return s;}`;
// ---------- Terra ----------
const earthMat=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uG:{value:new THREE.Vector3(1,1,1)},uSun:{value:new THREE.Vector3(-300,260,420).normalize()}},
 vertexShader:`varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,
 fragmentShader:`${NOISE} uniform float uT;uniform vec3 uSun,uG;varying vec3 vW;
 void main(){vec3 c=vec3(0.,-${R}.,0.);vec3 n=normalize(vW-c);vec3 d=n*3.;
  float land=fbm(d*1.1+4.)+.35*fbm(d*5.)+.08*fbm(vW*.02);float coast=smoothstep(.52,.56,land);
  vec3 ocean=mix(vec3(.0,.15,.7),vec3(.0,.55,.95),fbm(d*8.)); vec3 grass=mix(vec3(.05,.6,.15),vec3(.85,.7,.1),fbm(d*4.+9.)); vec3 col=mix(ocean,grass,coast);
  col*=.88+.24*fbm(vW*.35);
  float cl=smoothstep(.5,.78,fbm(d*3.+vec3(uT*.01,0,0)+20.)); col=mix(col,vec3(.92),cl*.45);
  float dif=clamp(dot(n,uSun)*.85+.2,.05,1.); col*=dif*uG; vec3 V=normalize(cameraPosition-vW); float fr=pow(1.-clamp(dot(n,V),0.,1.),2.5);
  col+=vec3(.25,.5,1.)*fr*.9*clamp(dot(n,uSun)+.4,0.,1.); gl_FragColor=vec4(col,1.);}`});
const earth=new THREE.Mesh(new THREE.SphereGeometry(R,128,96),earthMat); earth.position.copy(EC); scene.add(earth);
const atm=new THREE.Mesh(new THREE.SphereGeometry(R*1.03,96,64),new THREE.ShaderMaterial({transparent:true,side:THREE.BackSide,depthWrite:false,blending:THREE.AdditiveBlending,
 vertexShader:`varying vec3 vN;void main(){vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`varying vec3 vN;void main(){float i=pow(max(.62-dot(vN,vec3(0,0,1)),0.),3.5)*5.;gl_FragColor=vec4(vec3(.3,.6,1.)*i,i);}`}));
atm.position.copy(EC); scene.add(atm);
// ---------- céu e estrelas ----------
const sky=new THREE.Mesh(new THREE.SphereGeometry(40000,48,32),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{uA:{value:0},uTop:{value:new THREE.Vector3(.04,.12,.85)},uMid:{value:new THREE.Vector3(1,.18,.5)},uLow:{value:new THREE.Vector3(1,.55,.05)},uSun:{value:new THREE.Vector3(-300,260,420).normalize()}},
 vertexShader:`varying vec3 vD;void main(){vD=normalize(position);gl_Position=projectionMatrix*viewMatrix*modelMatrix*vec4(position+cameraPosition*0.,1.);}`,
 fragmentShader:`uniform float uA;uniform vec3 uSun,uTop,uMid,uLow;varying vec3 vD;void main(){float h=clamp(vD.y,-.2,1.);
  vec3 top=mix(uTop,vec3(.0,.0,.04),uA),mid=mix(uMid,vec3(.0,.0,.05),uA),low=mix(uLow,vec3(.0,.0,.05),uA);
  vec3 c=mix(low,mid,smoothstep(0.,.12,h)); c=mix(c,top,smoothstep(.1,.7,h)); float s=pow(clamp(dot(vD,uSun),0.,1.),24.); c+=vec3(1.,.8,.5)*s*(1.-uA)*.9; gl_FragColor=vec4(c,1.);}`}));
sky.frustumCulled=false; scene.add(sky);
const starG=new THREE.BufferGeometry(); {const p=[];for(let i=0;i<2600;i++){const u=hs(i,1)*2-1,a=hs(i,2)*6.2832,r=Math.sqrt(1-u*u);p.push(Math.cos(a)*r*38000,u*38000,Math.sin(a)*r*38000)}starG.setAttribute('position',new THREE.Float32BufferAttribute(p,3));}
const starM=new THREE.PointsMaterial({color:0xffffff,size:3.2,sizeAttenuation:false,transparent:true,depthWrite:false}); const stars=new THREE.Points(starG,starM); scene.add(stars);
// ---------- sprites ----------
function tex(draw,s=128){const c=document.createElement('canvas');c.width=c.height=s;const g=c.getContext('2d');draw(g,s);return new THREE.CanvasTexture(c)}
const softT=tex((g,s)=>{const r=g.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.4,'rgba(255,255,255,.45)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,s,s)});
function spr(col,blend=THREE.AdditiveBlending,op=1){const m=new THREE.SpriteMaterial({map:softT,color:col,blending:blend,transparent:true,depthWrite:false,opacity:op});const s=new THREE.Sprite(m);s.visible=false;scene.add(s);return s}
// ---------- foguetes ----------
const steel=new THREE.MeshStandardMaterial({color:0x9aa4b0,metalness:.85,roughness:.38});
const dark=new THREE.MeshStandardMaterial({color:0x15171c,metalness:.5,roughness:.6});
const orange=new THREE.MeshStandardMaterial({color:0xff7a2a,metalness:.4,roughness:.45,emissive:0x331100});
function lathe(pts,mat){return new THREE.Mesh(new THREE.LatheGeometry(pts.map(p=>new THREE.Vector2(p[0],p[1])),48),mat)}
function mkFlame(r,len){const g=new THREE.Group();
 const o=new THREE.Mesh(new THREE.ConeGeometry(r,len,24,1,true),new THREE.MeshBasicMaterial({color:0xff7a22,transparent:true,opacity:.75,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
 const i=new THREE.Mesh(new THREE.ConeGeometry(r*.55,len*.7,24,1,true),new THREE.MeshBasicMaterial({color:0xfff2c8,transparent:true,opacity:.95,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
 o.position.y=-len/2; i.position.y=-len*.35; o.rotation.x=0; g.add(o,i); g.userData={o,i,len}; return g}
function setFlame(f,p,t){f.visible=p>0.01; if(!f.visible)return; const fl=p*(.9+.1*Math.sin(t*47)+.06*Math.sin(t*91)); f.scale.set(.8+.3*p,fl,.8+.3*p)}
function mkShip(){const g=new THREE.Group();
 g.add(lathe([[0,0],[4.5,0],[4.5,21],[4.2,24],[3.4,27],[1.8,29.3],[0,30]],steel));
 const tile=new THREE.Mesh(new THREE.CylinderGeometry(4.54,4.54,22,32,1,true,Math.PI/2,Math.PI),dark); tile.position.y=11; g.add(tile);
 for(const s of [-1,1]){const f=new THREE.Mesh(new THREE.BoxGeometry(5.5,.5,2.6),steel); f.position.set(s*6.5,24.5,0); g.add(f);
  const a=new THREE.Mesh(new THREE.BoxGeometry(7.5,.6,5.5),steel); a.position.set(s*7.6,4,0); g.add(a);}
 for(const [x,z] of [[0,0],[1.7,0],[-1.7,0]]){const e=new THREE.Mesh(new THREE.CylinderGeometry(.6,1,1.2,12),dark);e.position.set(x,-.4,z);g.add(e)}
 const fl=mkFlame(3.4,26); fl.position.y=-.8; g.add(fl); g.userData.flame=fl;
 const glow=spr(0xff8a3a); glow.visible=true; g.userData.heat=spr(0xff6a1a); g.userData.heat.scale.set(1,1,1);
 return g}
function mkBooster(){const g=new THREE.Group();
 g.add(lathe([[0,0],[4.5,0],[4.5,34],[4.1,36.2],[2.4,37.6],[0,38]],steel));
 const bnd=new THREE.Mesh(new THREE.CylinderGeometry(4.55,4.55,4,32,1,true),dark); bnd.position.y=14; g.add(bnd);
 for(let k=0;k<4;k++){const a=k*Math.PI/2+Math.PI/4;const f=new THREE.Mesh(new THREE.BoxGeometry(3.2,.5,2.6),dark);f.position.set(Math.cos(a)*5.6,33,Math.sin(a)*5.6);f.rotation.y=-a;g.add(f)}
 for(let k=0;k<13;k++){const a=k<1?0:k*0.5236,r=k<1?0:(k<7?1.9:3.4);const e=new THREE.Mesh(new THREE.CylinderGeometry(.5,.8,1,10),dark);e.position.set(Math.cos(a)*r,-.4,Math.sin(a)*r);g.add(e)}
 const fl=mkFlame(4.2,34); fl.position.y=-.8; g.add(fl); g.userData.flame=fl; return g}
const ship=mkShip(), boost=mkBooster(); scene.add(ship,boost);
const gh=mkBooster(); gh.traverse(o=>{if(o.material&&!o.userData.flame)o.material=new THREE.MeshBasicMaterial({color:0x01fbb4,wireframe:true,transparent:true,opacity:.6})}); gh.userData.flame.visible=false; scene.add(gh); gh.visible=false;
// ---------- torre e base ----------
const TX=-24, AY=92; const tower=new THREE.Group(); scene.add(tower);
{const pts=[],h=160;const c=[[-3,-3],[3,-3],[3,3],[-3,3]];
 for(const [x,z] of c){const m=new THREE.Mesh(new THREE.BoxGeometry(.9,h,.9),new THREE.MeshStandardMaterial({color:0x9aa3b2,metalness:.8,roughness:.4}));m.position.set(x,h/2,z);tower.add(m)}
 for(let y=0;y<h;y+=8){for(let k=0;k<4;k++){const a=c[k],b=c[(k+1)%4];pts.push(a[0],y,a[1],b[0],y,b[1]);pts.push(a[0],y,a[1],b[0],y+8,b[1]);}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));tower.add(new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0xc4ccd8})));
 for(let y=10;y<h;y+=30){const l=new THREE.Mesh(new THREE.BoxGeometry(.5,.5,.5),new THREE.MeshBasicMaterial({color:0xff3344}));l.position.set(3,y,3);tower.add(l)}}
tower.position.x=TX;
const armL=new THREE.Mesh(new THREE.BoxGeometry(27,3,3),orange), armR=armL.clone(); scene.add(armL,armR);
function setArms(close){const z=lerp(15,6.1,close); armL.position.set(TX+13.5+3,AY,z); armR.position.set(TX+13.5+3,AY,-z)}
const pad=new THREE.Mesh(new THREE.CylinderGeometry(46,46,2,64),new THREE.MeshStandardMaterial({color:0x3a3d44,metalness:.2,roughness:.8})); pad.position.y=-.2; scene.add(pad);
const ringL=new THREE.Mesh(new THREE.TorusGeometry(42,.5,8,96),new THREE.MeshBasicMaterial({color:0x01fbb4})); ringL.rotation.x=Math.PI/2; ringL.position.y=1; scene.add(ringL);
const mount=new THREE.Mesh(new THREE.CylinderGeometry(9,11,5,32),new THREE.MeshStandardMaterial({color:0x22252b,metalness:.7,roughness:.5})); mount.position.y=2; scene.add(mount);
// ---------- fumaça, centelhas ----------
const puffs=[];for(let i=0;i<70;i++)puffs.push(spr(0x9c8f80,THREE.NormalBlending,.35));
const sparks=[];for(let i=0;i<40;i++)sparks.push(spr(0xffc060));
const plume=[];for(let i=0;i<30;i++)plume.push(spr(0xff7a2a));
const splashS=[];for(let i=0;i<50;i++)splashS.push(spr(0xffffff,THREE.NormalBlending,.8));
const shock=new THREE.Mesh(new THREE.TorusGeometry(1,.06,8,64),new THREE.MeshBasicMaterial({color:0xfff0a0,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));shock.rotation.x=Math.PI/2;shock.visible=false;scene.add(shock);
const gridMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{uT:{value:0},uC:{value:new THREE.Vector3(0,1,.7)},uO:{value:0}},
 vertexShader:`varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`uniform float uT,uO;uniform vec3 uC;varying vec3 vP;void main(){vec2 g=vP.xy/10.;g.y+=uT*.6;vec2 f=abs(fract(g-.5)-.5)/fwidth(g);float l=1.-min(min(f.x,f.y),1.);float d=length(vP.xy)/420.;gl_FragColor=vec4(uC*l*(1.-d)*.55,l*(1.-d)*uO*.55);}`});
const stage=new THREE.Mesh(new THREE.PlaneGeometry(900,900,1,1),gridMat);stage.rotation.x=-Math.PI/2;stage.position.y=.6;stage.visible=false;scene.add(stage);
const burst=spr(0xffe070); const marker=spr(0x01fbb4); const hit=spr(0xffffff);
// órbita
const orbitRing=new THREE.Mesh(new THREE.TorusGeometry(R+650,6,8,256),new THREE.MeshBasicMaterial({color:0x01fbb4,transparent:true,opacity:.7})); orbitRing.position.copy(EC); orbitRing.visible=false; scene.add(orbitRing);
const sats=[];for(let i=0;i<12;i++){const g=new THREE.Group();const b=new THREE.Mesh(new THREE.BoxGeometry(1.6,.5,1.6),steel);g.add(b);for(const s of[-1,1]){const p=new THREE.Mesh(new THREE.BoxGeometry(5,.1,1.5),new THREE.MeshStandardMaterial({color:0x2a58c8,metalness:.9,roughness:.3,emissive:0x0a1a40}));p.position.x=s*3.4;g.add(p)}g.scale.setScalar(2.2);g.visible=false;scene.add(g);sats.push(g)}
const linkG=new THREE.BufferGeometry();linkG.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(11*6),3));const links=new THREE.LineSegments(linkG,new THREE.LineBasicMaterial({color:0x01fbb4,transparent:true,opacity:.9}));links.visible=false;links.frustumCulled=false;scene.add(links);
// moedas
const coins=[];{const m=new THREE.MeshStandardMaterial({color:0xffc933,metalness:1,roughness:.25,emissive:0x442200});for(let i=0;i<14;i++){const c=new THREE.Mesh(new THREE.CylinderGeometry(3,3,.7,28),m);c.visible=false;scene.add(c);coins.push(c)}}
const barA=new THREE.Mesh(new THREE.BoxGeometry(9,1,9),new THREE.MeshStandardMaterial({color:0xe5483b,roughness:.5}));const barB=new THREE.Mesh(new THREE.BoxGeometry(9,1,9),new THREE.MeshStandardMaterial({color:0x2fcf6a,roughness:.5}));
barA.visible=barB.visible=false;scene.add(barA,barB);const arrD=new THREE.Mesh(new THREE.ConeGeometry(4,8,20),new THREE.MeshBasicMaterial({color:0x01fbb4}));arrD.rotation.z=Math.PI;arrD.visible=false;scene.add(arrD);
const reuseRing=new THREE.Mesh(new THREE.TorusGeometry(10,.35,8,64),new THREE.MeshBasicMaterial({color:0x01fbb4})); reuseRing.visible=false; scene.add(reuseRing);
const reuseArrow=new THREE.Mesh(new THREE.ConeGeometry(1.3,3,16),new THREE.MeshBasicMaterial({color:0x01fbb4})); reuseArrow.visible=false; scene.add(reuseArrow);
const minis=[];for(let i=0;i<5;i++){const g=mkShip();g.scale.setScalar(.7);g.visible=false;scene.add(g);minis.push(g)}
const qs=spr(0xffd84a);
// ---------- helpers de cena ----------
const surf=x=>Math.sqrt(R*R-x*x)-R;
const YC=AY-11; const IMP0=C.imp-0.1; // base da nave presa nos braços
const T_STACK_SHIP=38.8;
const IMPS=[IMP0,C.catch+0.05];function impA(t){let a=-1;for(const m of IMPS){if(t>=m)a=t-m}return a}
function C_(n,dt=0){return (C[n]??0)+dt}
function between(t,a,b){return clamp((t-a)/(b-a))}
function bez(p0,p1,p2,p3,k){const a=1-k;return [a*a*a*p0[0]+3*a*a*k*p1[0]+3*a*k*k*p2[0]+k*k*k*p3[0],a*a*a*p0[1]+3*a*a*k*p1[1]+3*a*k*k*p2[1]+k*k*k*p3[1]]}
const POS={ship:new THREE.Vector3(),boost:new THREE.Vector3(),splash:new THREE.Vector3(520,surf(520),0)};
const D_SEP=C.sep-C.lift, H_SEP=320, ORB_ALT=650, RO=R+ORB_ALT;
function shipPose(t){ // retorna {pos,rotz,flame,heat}
 const q={x:0,y:T_STACK_SHIP,rz:0,fl:0,heat:0,vis:true};
 const tCatch=C.catch;
 if(t<C.pad){const k=sm(t/IMP0); q.y=YC+22*(1-k); q.fl=t<IMP0?1.0*(.8+.2*k):clamp(1-(t-IMP0)/1.5)*0.9+0.08; return q;}
 if(t>=C.catch){q.y=YC; q.fl=clamp(1-(t-C.catch)/2.2)*0.7; return q;}
 if(t<C.lift){q.fl=t>C.lift-0.8?(t-(C.lift-0.8))/.8*.6:0; return q}
 if(t<C.orbit){ // sobe com o booster, depois sozinha
  if(t<C.sep){const k=(t-C.lift)/D_SEP; q.y=T_STACK_SHIP+H_SEP*k*k+(k>0?0:0); q.fl=.9+.1*k; q.x=0;}
  else{const k=sm((t-C.sep)/(C.orbit-C.sep)); q.y=lerp(T_STACK_SHIP+H_SEP,ORB_ALT,k); q.fl=.85; q.x=0;}
  return q}
 if(t<C.re){const th=2*Math.PI*(t-C.orbit)/(C.re-C.orbit); q.x=RO*Math.sin(th); q.y=-R+RO*Math.cos(th); q.rz=-th-Math.PI/2; q.fl=th<0.3?.5*(1-th/.3):0; q.th=th; return q}
 // reentrada: desce na vertical, flip no fim
 const k=(t-C.re)/(C.catch-C.re), e=1-Math.pow(1-k,1.8);
 q.y=lerp(ORB_ALT,YC,e); q.x=60*Math.sin(k*3.1)*(1-k)*(1-k)*0+0; q.rz=lerp(1.25,0,sm((k-.6)/.4)); q.heat=Math.sin(Math.PI*clamp(k/0.85))*1.0*(k<.9?1:(1-k)*10); q.fl=sm((k-.7)/.3)*.9; q.re=true; return q}
function boostPose(t){ const q={x:0,y:0,rz:0,fl:0,vis:true};
 if(t<C.lift){q.y=0;q.fl=t>C.lift-0.8?(t-(C.lift-0.8))/.8*.7:0;return q}
 if(t<C.sep){const k=(t-C.lift)/D_SEP;q.y=H_SEP*k*k;q.fl=1;return q}
 const s=t-C.sep;
 if(t<C.abort){const k=sm((t-C.sep)/(C.abort-C.sep)); const p=bez([0,H_SEP],[-70,H_SEP+160],[-40,230],[-12,150],k); q.x=p[0];q.y=p[1];q.rz=lerp(0.25,0,k);q.fl=k>.5?.8:0;return q}
 const k=clamp((t-C.abort)/(C.sea-C.abort+0.6)); const p=bez([-12,150],[-4,120],[260,140],[520,surf(520)+19],k); q.x=p[0];q.y=p[1];q.rz=-k*1.0;q.fl=k<.6?.6*(1-k):0; if(k>=1){q.vis=false} return q}
function orbitPos(th){return new THREE.Vector3(RO*Math.sin(th),-R+RO*Math.cos(th),0)}
function cbez(x1,y1,x2,y2){return k=>{if(k<=0)return 0;if(k>=1)return 1;let lo=0,hi=1,u=k;for(let i=0;i<22;i++){const x=3*(1-u)*(1-u)*u*x1+3*(1-u)*u*u*x2+u*u*u;if(x<k)lo=u;else hi=u;u=(lo+hi)/2}return 3*(1-u)*(1-u)*u*y1+3*(1-u)*u*u*y2+u*u*u}}
const EASE=[cbez(.65,0,.35,1),cbez(.08,.9,.2,1),cbez(.34,1.5,.64,1),cbez(.8,0,.2,1)]; // suave | rápida-na-entrada | overshoot | arranque lento
// paletas: [cue, topo, meio, horizonte, solo, espaço(-1=auto), piso neon, cor neon]
const DAY=[[.10,.30,.78],[.45,.70,.95],[.90,.85,.75]];
const PAL=[['teaser',[.04,.18,.68],[.2,.5,.92],[.98,.62,.30],[.75,.8,.85],-1,0,[.3,.5,.8]],
 ['sep',...DAY,[1,1,1],-1,0,[.3,.5,.8]],
 ['orbit',[0,0,.03],[0,0,.04],[0,0,.05],[1,1,1],1,0,[.3,.5,.8]],
 ['re',[0,0,.03],[0,0,.04],[0,0,.05],[1,1,1],1,0,[.3,.5,.8]],
 ['catch',...DAY,[1,1,1],-1,0,[.3,.5,.8]],
 ['first',[.08,.22,.65],[.35,.55,.9],[.95,.75,.5],[1,1,1],-1,0,[.3,.5,.8]],
 ['cheap',[.01,.05,.16],[.02,.09,.24],[.03,.14,.32],[.05,.12,.25],0,1,[.25,.6,1]],
 ['more',[.04,.08,.30],[.35,.30,.55],[.95,.55,.30],[.55,.55,.8],-1,0,[.3,.5,.8]],
 ['missing',[.01,.02,.10],[.03,.06,.20],[.08,.12,.28],[.3,.4,.6],0,0,[.3,.5,.8]],
 ['step',[.12,.30,.75],[.55,.72,.95],[1,.82,.55],[1,1,1],-1,0,[.3,.5,.8]],
 ['cta',[0,.08,.2],[0,.12,.3],[0,.2,.4],[.1,.2,.4],0,0,[.3,.5,.8]]];
const PT=PAL.map(p=>({t:C[p[0]]??0,top:p[1],mid:p[2],low:p[3],g:p[4],sp:p[5],fl:p[6],nc:p[7]}));
function palAt(t){let j=0;for(let i=0;i<PT.length;i++)if(PT[i].t<=t+0.2)j=i;const b=PT[j],a=PT[Math.max(j-1,0)];const k=sm((t-(b.t-.2))/1.1);
 const L=(x,y)=>x.map((v,i)=>lerp(v,y[i],k));return {top:L(a.top,b.top),mid:L(a.mid,b.mid),low:L(a.low,b.low),g:L(a.g,b.g),sp:b.sp,spA:a.sp,k,fl:lerp(a.fl,b.fl,k),nc:L(a.nc,b.nc)}}
// ---------- câmera dirigida pela fala ----------
function target(name,t){const s=shipPose(t),b=boostPose(t);
 switch(name){
  case 'ship':return new THREE.Vector3(s.x,s.y+15*Math.cos(s.rz),0);
  case 'boost':return new THREE.Vector3(b.x,b.y+19,0);
  case 'stack':{const y=boostPose(t).y;return new THREE.Vector3(0,y+(t<C.sep?34:22),0)}
  case 'pair':{const a=target('ship',t),c=target('boost',t);return a.add(c).multiplyScalar(.5)}
  case 'btw':{const c=target('boost',t);return c.add(new THREE.Vector3(TX,AY,0)).multiplyScalar(.5)}
  case 'splash':return new THREE.Vector3(POS.splash.x,POS.splash.y+12,0);
  case 'earth':return EC.clone().add(new THREE.Vector3(0,3300,0));
  case 'coins':return new THREE.Vector3(32,18,10);
  case 'ghost':return new THREE.Vector3(0,22,0);
  case 'tower':return new THREE.Vector3(TX,80,0);
  case 'pad':return new THREE.Vector3(0,40,0);
  case 'caught':return new THREE.Vector3(0,YC+15,0);
 } return new THREE.Vector3()}
const K=[ // [cue, dt, alvo, dist, azim, elev, fov, duração da transição]
 ['teaser',0,'caught',56,-16,-6,36,1],
 ['imp',-0.1,'caught',38,30,6,32,0.4],
 ['imp',1.4,'caught',52,64,18,38,1.3],
 ['pad',0.05,'stack',95,-38,6,40,0.9],
 ['v15',0.15,'stack',78,12,26,42,1.1],
 ['lift',-0.3,'pad',90,-12,-10,42,1.0],
 ['lift',2.6,'stack',70,62,3,38,1.2],
 ['sep',0.0,'pair',62,84,8,40,1.0],
 ['back',0.1,'boost',62,42,8,40,1.2],
 ['abort',0.1,'boost',72,22,4,36,0.9],
 ['sea',-0.5,'boost',70,-24,3,40,1.0],
 ['orbit',0.1,'ship',78,125,14,38,1.2],
 ['sats',0.15,'ship',170,-48,18,42,1.1],
 ['earth',0.0,'earth',17800,0,12,50,1.5],
 ['h22',0.2,'earth',16400,70,34,50,1.3],
 ['re',0.05,'ship',72,150,-12,38,1.1],
 ['re',2.6,'ship',58,18,4,38,1.2],
 ['catch',0.15,'caught',40,38,4,36,0.9],
 ['first',0.0,'caught',54,-52,22,38,1.1],
 ['cheap',0.0,'coins',26,40,12,38,1.1],
 ['cheap',2.4,'caught',66,2,14,38,1.2],
 ['more',0.0,'pad',300,-78,6,42,1.4],
 ['missing',0.0,'ghost',78,16,12,38,1.2],
 ['step',0.0,'tower',210,-30,10,40,1.5],
 ['cta',0.0,'caught',95,42,10,38,1.4]];
const ROLL={sep:6,re:-8,first:5,more:-5,cta:4,missing:-4,sats:-5,orbit:5};
const KT=K.map((k,i)=>({e:[1,0,2,3][i%4],roll:(ROLL[k[0]]||0)*Math.PI/180*(k[1]>0?-1:1),t:C_(k[0],k[1]),tg:k[2],d:k[3]*(k[2]==='earth'?1:2.2),az:k[4]*Math.PI/180,el:k[5]*Math.PI/180,fov:k[6],dur:k[7]}));
function camPose(t){let j=0;for(let i=0;i<KT.length;i++){if(KT[i].t-KT[i].dur*.75<=t)j=i}
 const b=KT[j],a=KT[Math.max(j-1,0)];const k=j===0?1:EASE[b.e]((t-(b.t-b.dur*.75))/b.dur);
 const ta=target(a.tg,t),tb=target(b.tg,t);const tg=ta.lerp(tb,k);
 const dt=Math.max(t-b.t,0);
 const d=lerp(a.d,b.d*(1-0.04*clamp(dt/4)),k), az=lerp(a.az,b.az+dt*.05,k), el=lerp(a.el,b.el,k), fov=lerp(a.fov,b.fov,k), roll=lerp(a.roll,b.roll,k);
 return {tg,d,az,el,fov,roll}}
function shakeAmt(t){let s=0; s+=clamp(1-Math.abs(t-(C.lift+2))/4)*1.0*(t>C.lift?1:0); s+=t>C.re&&t<C.catch?.7*Math.sin(Math.PI*between(t,C.re,C.catch)):0; s+=clamp(1-Math.abs(t-C.catch-.3)/.5)*1.6+clamp(1-Math.abs(t-IMP0-.2)/.7)*2.4; s+=clamp(1-Math.abs(t-C.sep)/.4)*.8; s+=clamp(1-Math.abs(t-C.sea)/.5)*.6; s+=t<IMP0?.9*(t/IMP0):0; return s}
// ---------- legenda ----------
const capEl=document.getElementById('cap'); const VAR=[
 p=>`transform:scale(${1+.18*(1-p)});opacity:${p}`,p=>`transform:translateY(${40*(1-p)}px);opacity:${p}`,p=>`transform:translateX(${-60*(1-p)}px);opacity:${p}`,
 p=>`transform:translateX(${60*(1-p)}px);opacity:${p}`,p=>`transform:translateY(${-40*(1-p)}px) rotate(${-3*(1-p)}deg);opacity:${p}`,p=>`transform:rotate(${4*(1-p)}deg) scale(${.85+.15*p});opacity:${p}`,
 p=>`transform:scale(${.85+.15*p});filter:blur(${8*(1-p)}px);opacity:${p}`,p=>`transform:perspective(600px) rotateX(${35*(1-p)}deg);opacity:${p}`];
let lastW=-1;
function caption(t){let wi=-1;for(let i=0;i<WORDS.length;i++){if(t>=WORDS[i].s-0.01&&t<WORDS[i].e+0.04){wi=i;break}}
 if(wi<0||t<0.25){capEl.innerHTML='';return}
 const w=WORDS[wi],p=sm((t-w.s)/0.14); if(wi!==lastW){capEl.innerHTML=`<span class="${w.hl?'hl':''}">${w.w}</span>`;lastW=wi;const sp=capEl.firstChild;sp.style.fontSize='108px';const ww=sp.offsetWidth;if(ww>760)sp.style.fontSize=Math.floor(108*760/ww)+'px'}
 capEl.firstChild.style.cssText=VAR[(wi*5+3)%8](p)}
// ---------- HUD ----------
const $=id=>document.getElementById(id);
function hud(id,t,a,b,pop=true){const e=$(id);const on=t>=a&&t<b;const k=on?sm((t-a)/.25)*(1-sm((t-(b-.3))/.3)):0;e.style.opacity=k;e.style.transform=`scale(${.6+.4*k})`}
// ---------- estado do mundo ----------
const FOV=cam.fov;
function setT(t){
 earthMat.uniforms.uT.value=t;
 const sp=shipPose(t),bp=boostPose(t);
 // nave
 ship.visible=true; ship.position.set(sp.x,sp.y,0); ship.rotation.set(0,0,sp.rz);
 if(sp.th!==undefined){} setFlame(ship.userData.flame,sp.fl,t);
 const hv=ship.userData.heat; hv.visible=sp.heat>0.02; if(hv.visible){hv.position.set(sp.x+Math.sin(sp.rz)*-6,sp.y+8-Math.cos(sp.rz)*2,0);hv.scale.setScalar(70*sp.heat+30);hv.material.opacity=.9*sp.heat}
 // booster
 boost.visible=bp.vis&&!(t>=C.catch); boost.position.set(bp.x,bp.y,0); boost.rotation.set(0,0,bp.rz); setFlame(boost.userData.flame,bp.fl,t);
 // pad: booster some depois do mar; fantasma wireframe
 gh.visible=t>=C.missing&&t<C.step; gh.position.set(0,0,0); gh.material=undefined;
 gh.traverse(o=>{if(o.isMesh&&!o.userData.flameMesh&&o.material&&o.material.wireframe!==undefined)o.material.opacity=.35+.3*Math.sin(t*9)});
 // braços
 const arm = t<C.pad? 1 : (t<C.catch? (t>C.catch-3.5? clamp(1-(C.catch-.0-t)/1)*0+0:0) : sm((t-C.catch)/1.1));
 setArms(t<C.pad?(t<IMP0?0.45+0.55*sm(t/IMP0):1):(t<C.catch?0:sm((t-C.catch)/1.1)));
 // fumaça da decolagem
 for(let i=0;i<puffs.length;i++){const t0=C.lift-0.3+i*0.07,a=t-t0;const p=puffs[i];if(a<0||a>5){p.visible=false;continue}
  p.visible=true;const ang=hs(i,1)*6.28,sp2=40+hs(i,2)*60;p.position.set(Math.cos(ang)*sp2*(1-Math.exp(-a*1.4)),3+a*(5+hs(i,3)*10),Math.sin(ang)*sp2*(1-Math.exp(-a*1.4)));p.scale.setScalar(12+a*12);p.material.opacity=.38*(1-a/5)*(a<.3?a/.3:1)}
 // centelhas no pouso/captura
 for(let i=0;i<sparks.length;i++){const a=impA(t);const p=sparks[i];if(a<0||a>1.6){p.visible=false;continue}p.visible=true;const ang=hs(i,4)*6.28,v=15+hs(i,5)*40;p.position.set(Math.cos(ang)*v*a,AY+Math.sin(ang)*v*a-a*a*10,hs(i,6)*20-10);p.scale.setScalar(3*(1-a/1.6)+.5);p.material.opacity=1-a/1.6}
 // rastro de plasma na reentrada
 for(let i=0;i<plume.length;i++){const p=plume[i];const rr=t>C.re&&t<C.catch;
  if(t<IMP0+.3&&i<30){const a=(t*2.2+hs(i,2))%1;p.visible=true;p.position.set((hs(i,8)-.5)*90,YC+15+ (1-a)*110,(hs(i,9)-.5)*40);p.scale.set(2.2,26,1);p.material.opacity=.8;p.material.color.set(0xffd27a);continue}
  p.material.color.set(0xff7a2a); if(!rr){p.visible=false;continue}const a=(t*1.4+hs(i,7))%1;p.visible=true;p.position.set(sp.x+(hs(i,8)-.5)*14,sp.y+10+a*80,(hs(i,9)-.5)*10);p.scale.setScalar(14*(1-a)+4);p.material.opacity=.7*(1-a)*sp.heat}
 // splash
 for(let i=0;i<splashS.length;i++){const a=t-C.sea-0.55;const p=splashS[i];if(a<0||a>2.2){p.visible=false;continue}p.visible=true;const ang=-Math.PI/2+(hs(i,1)-.5)*2.2,v=25+hs(i,2)*50;p.position.set(POS.splash.x+Math.cos(ang)*v*a*.6,POS.splash.y+Math.max(Math.sin(ang)*v*a-a*a*30,0),(hs(i,3)-.5)*20);p.scale.setScalar(8+a*8);p.material.opacity=.8*(1-a/2.2)}
 // X vermelho no aborto
 hud('hx',t,C.abort,C.abort+1.3);
 // satélites
 const ts=t-C.sats, on=t>=C.sats&&t<C.re; const th0=sp.th??0;
 for(let i=0;i<12;i++){const g=sats[i];g.visible=on&&t>=C.sats&&(ts>0.05);if(!g.visible)continue;const spread=(i-5.5)*(1-Math.exp(-ts*.9))*0.0042;const th=(2*Math.PI*(t-C.orbit)/(C.re-C.orbit))+spread;const p=orbitPos(th);g.position.copy(p);g.position.z=(hs(i,3)-.5)*14*(1-Math.exp(-ts));g.rotation.z=-th-Math.PI/2;g.rotation.y=t*.4+i}
 links.visible=on&&ts>1.6;if(links.visible){const arr=linkG.attributes.position.array;for(let i=0;i<11;i++){const a=sats[i].position,b=sats[i+1].position;arr.set([a.x,a.y,a.z,b.x,b.y,b.z],i*6)}linkG.attributes.position.needsUpdate=true}
 orbitRing.visible=t>=C.earth-1.2&&t<C.re+.5; orbitRing.material.opacity=.75*sm((t-C.earth+1.2)/1.2);
 marker.visible=t>=C.earth-1.2&&t<C.re; if(marker.visible){marker.position.copy(orbitPos(2*Math.PI*(t-C.orbit)/(C.re-C.orbit)));marker.scale.setScalar(340+60*Math.sin(t*6))}
 // barras de custo (infográfico): descartável x reutilizável
 {const on=t>=C.cheap-.2&&t<C.more;barA.visible=barB.visible=on;arrD.visible=on&&t>C.cheap+.9;if(on){const g=sm((t-C.cheap)/.8);const hA=2+38*g;const k=sm((t-C.cheap-.9)/1.2);const hB=lerp(hA,12,k);
  barA.scale.y=hA;barA.position.set(24,hA/2,10);barB.scale.y=hB;barB.position.set(40,hB/2,10);arrD.position.set(40,hB+14+Math.sin(t*6)*1.5,10)}}
 // anel de reuso
 {const on2=t>=C.cheap+2.2&&t<C.more;reuseRing.visible=reuseArrow.visible=on2;if(on2){const c=target('ship',t);reuseRing.position.set(0,YC+15,0);reuseRing.rotation.set(Math.PI/2,0,0);reuseRing.scale.setScalar(1.5+.1*Math.sin(t*4));const an=t*3;reuseArrow.position.set(Math.cos(an)*15,YC+15,Math.sin(an)*15);reuseArrow.rotation.set(Math.PI/2,0,-an-Math.PI/2)}}
 // mini foguetes
 for(let i=0;i<5;i++){const m=minis[i];const a=t-(C.more+0.2+i*0.55);m.visible=t>=C.more&&t<C.missing+.6&&a>-0.8;if(!m.visible)continue;m.position.set(-60+i*30,Math.max(a,0)**2*9,-50-i*16);setFlame(m.userData.flame,a>-0.8?clamp((a+.8)*2)*.9:0,t)}
 // ?
 qs.visible=false;hud('hq',t,C.missing+.2,C.missing+3.5);
 // explosão de estrela
 burst.visible=t>=C.first&&t<C.first+2; if(burst.visible){const a=t-C.first;burst.position.set(0,YC+15,0);burst.scale.setScalar(20+70*Math.sin(Math.min(a*2,Math.PI/2))*(1-a/2));burst.material.opacity=.6*(1-a/2)}
 hud('hfirst',t,C.first+.1,C.first+2.5);
 hud('h15',t,C.v15,C.v15+2.0);
 {const e=$('hclock');const on3=t>=C.h22&&t<C.re;const k=on3?sm((t-C.h22)/.4):0;e.style.opacity=k;e.style.transform=`scale(${.7+.3*k})`;$('arc').style.strokeDashoffset=276.5*(1-clamp((t-C.h22)/(C.re-C.h22)))}
 // CTA: comentário -> seguir -> mensagem
 {const on=t>=C.cmt-.2; $('dim').style.opacity=on?.82*sm((t-C.cmt+.2)/.6):0;
  const inCmt=t>=C.cmt&&t<C.seg-.1; const c=$('cmt');c.style.opacity=inCmt?sm((t-C.cmt)/.3)*(1-sm((t-C.seg+.4)/.25)):0;c.style.transform=`translateY(${(1-sm((t-C.cmt)/.3))*80}px)`;
  const word='ARQUIVO',n=Math.floor(clamp((t-C.cmt-.5)/(.5))*word.length);$('typed').textContent=word.slice(0,n);
  const p=$('prof');const pk=sm((t-C.seg+.1)/.4);p.style.opacity=pk;p.style.transform=`scale(${.7+.3*pk})`;
  const tc=C.seg+.95;const fb=$('fbtn');const done=t>=tc;fb.textContent=done?'Seguindo ✓':'Seguir';fb.style.background=done?'#fff':'#01FBB4';fb.style.transform=`scale(${1-.12*clamp(1-Math.abs(t-tc)/.12)})`;
  const cur=$('cur');const ck=sm((t-C.seg)/.9);cur.style.opacity=t>=C.seg&&t<tc+1.4?1:0;
  const fx=lerp(900,590,ck),fy=lerp(1500,1050,ck);cur.style.transform=`translate(${fx}px,${fy}px) scale(${1-.12*clamp(1-Math.abs(t-tc)/.12)})`;
  const d=$('dm');const dk=sm((t-C.msg)/.35);d.style.opacity=dk;d.style.transform=`scale(${.6+.4*dk}) translateY(${(1-dk)*60}px)`}
 // título de capa
 {const e=$('title');e.innerHTML='VOLTOU DO ESPAÇO<br><b>E FOI PEGA NO AR</b>';const inK=sm(t/.18);const k=t<3.1?1:1-sm((t-3.1)/.5);e.style.opacity=k;const pu=t>=IMP0?.16*Math.exp(-(t-IMP0)*7):0;e.style.transform=`translateY(${(1-k)*-60}px) scale(${(1+pu)*(1+(1-k)*.1)})`}
 // ---- câmera ----
 const cp=camPose(t);cam.fov=cp.fov;cam.updateProjectionMatrix();
 const cx=Math.sin(cp.az)*Math.cos(cp.el),cy=Math.sin(cp.el),cz=Math.cos(cp.az)*Math.cos(cp.el);
 const sh=shakeAmt(t);cam.position.set(cp.tg.x+cx*cp.d+Math.sin(t*37)*sh*.5,cp.tg.y+cy*cp.d+Math.cos(t*29)*sh*.5,cp.tg.z+cz*cp.d);
 // desloca o alvo para cima: objeto fica acima da legenda
 const up=new THREE.Vector3(0,1,0);cam.lookAt(cp.tg);const off=cp.d*Math.tan(cam.fov*Math.PI/360)*0.22;cam.translateY(-off*0+0);cam.updateMatrixWorld();
 cam.rotateZ(cp.roll); cam.setViewOffset(W,H,0,H*0.07,W,H);
 const pl=palAt(t);const su=sky.material.uniforms;su.uTop.value.set(...pl.top);su.uMid.value.set(...pl.mid);su.uLow.value.set(...pl.low);earthMat.uniforms.uG.value.set(...pl.g);
 stage.visible=pl.fl>.02;gridMat.uniforms.uO.value=pl.fl;gridMat.uniforms.uT.value=t;gridMat.uniforms.uC.value.set(...pl.nc);pad.visible=pl.fl<.5;
 const alt=cam.position.y; atm.visible=alt>260; sky.material.uniforms.uA.value=(pl.sp>=0?lerp(pl.spA>=0?pl.spA:sm((alt-120)/700),pl.sp,pl.k):lerp(pl.spA>=0?pl.spA:sm((alt-120)/700),sm((alt-120)/700),pl.k)); starM.opacity=Math.max(sky.material.uniforms.uA.value,.12);
 sky.position.copy(cam.position); stars.position.copy(cam.position);
 sun.position.set(cam.position.x-300,cam.position.y+260,420);
 // ponto de brilho do boom ao agarrar / gancho
 {const a=impA(t);hit.visible=a>=0&&a<.6;if(hit.visible){const k=a/.6;hit.position.set(0,YC+15,0);hit.scale.setScalar(70*Math.sin(Math.min(k,1)*Math.PI*.7)+20);hit.material.opacity=.55*(1-k)}
 shock.visible=a>=0&&a<1.4; if(shock.visible){const k=a/1.4;shock.position.set(0,YC+15,0);shock.scale.setScalar(2+90*(1-Math.pow(1-k,3)));shock.material.opacity=.7*(1-k)}}
 // rewind na virada gancho -> história
 const rw=clamp(1-Math.abs(t-C.pad)/.35);$('rew').style.opacity=rw*.9;$('flash').style.opacity=clamp(1-Math.abs(t-C.catch-.05)/.12)*.7+clamp(1-Math.abs(t-IMP0)/.10)*.35+clamp(1-Math.abs(t-C.sep)/.08)*.5;
 caption(t);
 comp.render();
}
window.setT=setT; window.dbg=t=>({s:shipPose(t),b:boostPose(t),cam:cam.position.toArray(),tg:camPose(t).tg.toArray()}); window.__ready=true;
