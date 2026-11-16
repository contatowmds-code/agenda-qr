// PLANO DE CENA — Hera / Didymos (estilo do vídeo aprovado: mundo 3D realista, câmera dirigida pela fala)
// imp    | flash do impacto da DART na lua (gancho, só um relance)        | soco de aproximação        | "acertou de propósito"   | espaço, asteroide
// hera   | sonda Hera em primeiro plano, Didymos ao fundo                | de baixo, aproxima         | apresenta a nave         | espaço, Didymos
// didy   | Didymos com a lua em órbita                                   | lateral aberta             | sistema Didymos          | espaço
// size   | régua cruzando o asteroide, HUD 780 M                         | de cima, recua             | 780 m                    | espaço
// dimo   | Dimorphos pequena, régua, HUD 151 M                           | aproxima da lua            | 151 m                    | espaço
// dart   | DART em voo rumo à lua, HUD 580 KG e 6 KM/S                   | segue por trás             | sonda a 6 km/s           | espaço
// orbit  | vista de cima, anel da órbita, ponto "antes" e lua adiantada  | de cima, giro lento        | −33 min                  | diagrama no espaço
// first  | lua com rastro de poeira do impacto, HUD 1ª VEZ               | lateral                    | primeira vez             | espaço
// dist   | Hera no topo, linha de 60 km até o asteroide                  | frontal, plano aberto      | 60 km                    | espaço
// boul   | superfície com pedras                                         | rasante                    | pedras e crateras        | superfície
// groove | sulcos destacados em verde-água                               | desliza pela superfície    | sulcos                   | superfície
// eject  | pedras viajando da lua ao asteroide, HUD 1 KM                 | lateral, plano aberto      | restos do impacto        | espaço
// crash  | anel de varredura em volta da lua, HUD ?                      | aproxima                   | investigar o local       | espaço
// defl   | Terra, asteroide hipotético, sonda empurra, caminho muda      | corte (dip azul) + lateral | repetível / desviar      | Terra e espaço (SIMULAÇÃO)
// nov    | Hera em plano aberto, HUD 25 NOV                              | corte (wipe)               | 25 de novembro           | espaço
import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
const W=1080,H=1920;
const D=await (await fetch('/words.json')).json();const C=D.cues,WORDS=D.words;
const clamp=(x,a=0,b=1)=>Math.min(Math.max(x,a),b),sm=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10)},lerp=(a,b,k)=>a+(b-a)*k;
const hs=(i,s=0)=>{const x=Math.sin(i*127.1+s*311.7)*43758.5453;return x-Math.floor(x)};
const V3=(x,y,z)=>new THREE.Vector3(x,y,z);
const renderer=new THREE.WebGLRenderer({canvas:document.getElementById('gl'),antialias:false,logarithmicDepthBuffer:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(1);renderer.setSize(W,H,false);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=0.95;
const scene=new THREE.Scene();scene.background=new THREE.Color(0x00020a);
const pm=new THREE.PMREMGenerator(renderer);scene.environment=pm.fromScene(new RoomEnvironment(),0.04).texture;scene.environmentIntensity=0.12;
const cam=new THREE.PerspectiveCamera(40,W/H,0.3,300000);
const comp=new EffectComposer(renderer);comp.setSize(W,H);comp.addPass(new RenderPass(scene,cam));comp.addPass(new UnrealBloomPass(new THREE.Vector2(W/2,H/2),0.12,0.4,0.92));comp.addPass(new OutputPass());
const SUN=V3(.55,.3,.78).normalize();
const sun=new THREE.DirectionalLight(0xfff1dc,2.5);sun.position.copy(SUN).multiplyScalar(1000);scene.add(sun);
scene.add(new THREE.HemisphereLight(0x5a78c0,0x0a0c14,.16));
function tex(draw,s=128){const c=document.createElement('canvas');c.width=c.height=s;const g=c.getContext('2d');draw(g,s);return new THREE.CanvasTexture(c)}
const softT=tex((g,s)=>{const r=g.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.4,'rgba(255,255,255,.4)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,s,s)});
function spr(col,op=1){const m=new THREE.SpriteMaterial({map:softT,color:col,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,opacity:op});const s=new THREE.Sprite(m);s.visible=false;scene.add(s);return s}
// estrelas e Sol distante
{const g=new THREE.BufferGeometry(),p=[];for(let i=0;i<3200;i++){const u=hs(i,1)*2-1,a=hs(i,2)*6.2832,r=Math.sqrt(1-u*u);p.push(Math.cos(a)*r*120000,u*120000,Math.sin(a)*r*120000)}g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));var stars=new THREE.Points(g,new THREE.PointsMaterial({color:0xdfe8ff,size:2.2,sizeAttenuation:false}));scene.add(stars)}
const sunSpr=spr(0xfff2d8,.9);sunSpr.visible=true;sunSpr.scale.setScalar(9000);
// ---------- ruído em JS (formas) ----------
const h3=(x,y,z)=>{const s=Math.sin(x*127.1+y*311.7+z*74.7)*43758.5453;return s-Math.floor(s)};
function n3(x,y,z){const ix=Math.floor(x),iy=Math.floor(y),iz=Math.floor(z),fx=x-ix,fy=y-iy,fz=z-iz,ux=fx*fx*(3-2*fx),uy=fy*fy*(3-2*fy),uz=fz*fz*(3-2*fz);
 const L=(a,b,t)=>a+(b-a)*t;return L(L(L(h3(ix,iy,iz),h3(ix+1,iy,iz),ux),L(h3(ix,iy+1,iz),h3(ix+1,iy+1,iz),ux),uy),L(L(h3(ix,iy,iz+1),h3(ix+1,iy,iz+1),ux),L(h3(ix,iy+1,iz+1),h3(ix+1,iy+1,iz+1),ux),uy),uz)}
const fbm=(x,y,z)=>{let a=.5,s=0;for(let i=0;i<4;i++){s+=a*n3(x,y,z);x*=2.03;y*=2.03;z*=2.03;a*=.5}return s};
// ---------- asteroides ----------
function mkCraters(n,seed,amin,amax,dmin,dmax){const c=[];for(let i=0;i<n;i++){const u=hs(i,seed)*2-1,a=hs(i,seed+1)*6.2832,r=Math.sqrt(1-u*u);c.push({d:V3(Math.cos(a)*r,u,Math.sin(a)*r),a:amin+hs(i,seed+2)*(amax-amin),k:dmin+hs(i,seed+3)*(dmax-dmin)})}return c}
const CR_D=mkCraters(46,10,.06,.27,7,24),CR_M=mkCraters(14,40,.1,.34,3,9),CR_S=mkCraters(10,70,.12,.35,3,10);
function surfR(d,R0,craters,top){let r=R0;if(top){r*=1+.085*Math.exp(-(d.y*d.y)/.05);r*=1-.06*d.y*d.y}
 r*=1+.05*(fbm(d.x*2.3+1.7,d.y*2.3,d.z*2.3)-.5)*2;
 for(const c of craters){const ang=Math.acos(clamp(d.dot(c.d),-1,1));if(ang<c.a*1.4){const x=ang/c.a;if(x<1)r-=c.k*(1-x*x);r+=c.k*.22*Math.exp(-Math.pow((x-1.04)/.13,2))}}
 return r}
const rD=d=>surfR(d,385,CR_D,true),rM=d=>surfR(d,72,CR_M,false);
const NOISEGL=`float h3(vec3 p){p=fract(p*0.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float n3(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fb2(vec3 p){return .65*n3(p)+.35*n3(p*2.7+3.1);}`;
function rockMat(){const m=new THREE.MeshStandardMaterial({color:0x6f6a60,roughness:1,metalness:0});const u={uRot:{value:0}};m.userData.u=u;
 m.onBeforeCompile=sh=>{sh.uniforms.uRot=u.uRot;
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vObj;').replace('#include <begin_vertex>','#include <begin_vertex>\nvObj=position;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>',`#include <common>\nvarying vec3 vObj;uniform float uRot;\n${NOISEGL}`)
   .replace('#include <color_fragment>',`#include <color_fragment>\n{float q=fb2(vObj*.03)*.6+fb2(vObj*.2)*.4;diffuseColor.rgb*=(.5+.95*q);}`)
   .replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>\n{vec3 p=vObj*.17;float b0=fb2(p);vec3 g=vec3(fb2(p+vec3(.4,0,0))-b0,fb2(p+vec3(0,.4,0))-b0,fb2(p+vec3(0,0,.4))-b0);
    float cs=cos(uRot),sn=sin(uRot);vec3 gw=vec3(cs*g.x+sn*g.z,g.y,-sn*g.x+cs*g.z);normal=normalize(normal-1.2*(viewMatrix*vec4(gw,0.)).xyz);}`)};
 return m}
function mkRock(R0,fn,craters,seg=[220,140]){const g=new THREE.SphereGeometry(1,seg[0],seg[1]);const p=g.attributes.position,v=new THREE.Vector3();
 for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).normalize();const r=fn(v);p.setXYZ(i,v.x*r,v.y*r,v.z*r)}g.computeVertexNormals();
 const mat=rockMat();const m=new THREE.Mesh(g,mat);return m}
const SPIN=.03;
const didyG=new THREE.Group();scene.add(didyG);const didy=mkRock(385,rD,CR_D);didyG.add(didy);
const dimoM=mkRock(72,rM,CR_M,[170,110]);scene.add(dimoM);
const rockS=mkRock(90,d=>surfR(d,90,CR_S,false),CR_S,[150,100]);rockS.visible=false;scene.add(rockS);
// pedras (boulders) concentradas perto de B
const rotY=(v,a)=>V3(Math.cos(a)*v.x+Math.sin(a)*v.z,v.y,-Math.sin(a)*v.x+Math.cos(a)*v.z);
const WB=V3(.35,.22,.91).normalize(),WG=V3(-.3,.15,.94).normalize();
const LB=rotY(WB,-SPIN*C.boul),LG=rotY(WG,-SPIN*C.groove);
{const N=380,mat=new THREE.MeshStandardMaterial({color:0x68635a,roughness:1,metalness:0,flatShading:true});const im=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,1),mat,N);const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler();
 for(let i=0;i<N;i++){let d;if(i<300){const c=i<190?LB:LG;const a=hs(i,3)*6.2832,rr=Math.pow(hs(i,4),.7)*.42;const t1=V3(0,1,0).cross(c).normalize(),t2=c.clone().cross(t1);d=c.clone().addScaledVector(t1,Math.cos(a)*rr).addScaledVector(t2,Math.sin(a)*rr).normalize()}else{const u=hs(i,5)*2-1,a=hs(i,6)*6.2832,r=Math.sqrt(1-u*u);d=V3(Math.cos(a)*r,u,Math.sin(a)*r)}
  const s=2.5+Math.pow(hs(i,7),2.6)*13;const rr=rD(d)+s*.25;e.set(hs(i,8)*6,hs(i,9)*6,hs(i,10)*6);q.setFromEuler(e);m4.compose(d.clone().multiplyScalar(rr),q,V3(s*(1+hs(i,11)*.5),s*(.7+hs(i,12)*.4),s));im.setMatrixAt(i,m4)}
 didyG.add(im)}
// sulcos (destaque)
const grooves=new THREE.Group();didyG.add(grooves);const grooveMat=new THREE.MeshBasicMaterial({color:0x01fbb4,transparent:true,opacity:0});
for(let k=0;k<5;k++){const t1=V3(0,1,0).cross(LG).normalize(),t2=LG.clone().cross(t1);const a0=hs(k,20)*6.2832;const ax=t1.clone().multiplyScalar(Math.cos(a0)).addScaledVector(t2,Math.sin(a0));const off=(k-2)*.07;
 const pts=[];for(let s=0;s<=24;s++){const ang=(s/24-.5)*.55;const d=LG.clone().multiplyScalar(Math.cos(ang)).addScaledVector(ax,Math.sin(ang)).addScaledVector(V3(0,1,0).cross(ax).normalize(),off+.02*Math.sin(s*.7+k)).normalize();pts.push(d.multiplyScalar(rD(d)+2.2))}
 grooves.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),60,1.5,5),grooveMat))}
// ---------- naves ----------
const gold=new THREE.MeshStandardMaterial({color:0xd9a73a,metalness:.9,roughness:.35}),white=new THREE.MeshStandardMaterial({color:0xe8eaee,metalness:.4,roughness:.45}),dk=new THREE.MeshStandardMaterial({color:0x22262e,metalness:.6,roughness:.5}),panel=new THREE.MeshStandardMaterial({color:0x2a58c8,metalness:.8,roughness:.3,emissive:0x0a1a40,emissiveIntensity:.4,side:THREE.DoubleSide});
function mkHera(){const g=new THREE.Group();const b=new THREE.Mesh(new THREE.BoxGeometry(46,46,56),gold);g.add(b);
 for(const s of[-1,1]){const p=new THREE.Mesh(new THREE.BoxGeometry(128,1.6,46),panel);p.position.set(s*92,0,-4);g.add(p);const a=new THREE.Mesh(new THREE.CylinderGeometry(1.3,1.3,44,8),dk);a.rotation.z=Math.PI/2;a.position.set(s*26,0,-4);g.add(a)}
 const dish=new THREE.Mesh(new THREE.ConeGeometry(30,16,28,1,true),white);dish.rotation.x=-Math.PI/2;dish.position.set(0,32,-18);dish.material=new THREE.MeshStandardMaterial({color:0xe8eaee,metalness:.4,roughness:.45,side:THREE.DoubleSide});g.add(dish);
 const cam1=new THREE.Mesh(new THREE.CylinderGeometry(7,7,8,16),dk);cam1.rotation.x=Math.PI/2;cam1.position.set(8,6,29);g.add(cam1);
 const cs=new THREE.Mesh(new THREE.BoxGeometry(14,14,22),white);cs.position.set(-12,-30,10);g.add(cs);return g}
const hera=mkHera();scene.add(hera);
function mkDart(sc){const g=new THREE.Group();const b=new THREE.Mesh(new THREE.BoxGeometry(14,14,14),white);g.add(b);const nz=new THREE.Mesh(new THREE.CylinderGeometry(3.5,5,6,16),dk);nz.rotation.x=Math.PI/2;nz.position.z=-9;g.add(nz);
 for(const s of[-1,1]){const p=new THREE.Mesh(new THREE.BoxGeometry(46,.6,13),panel);p.position.set(s*30,0,0);g.add(p)}
 const cm=new THREE.Mesh(new THREE.CylinderGeometry(2.4,2.4,5,12),dk);cm.rotation.x=Math.PI/2;cm.position.z=9.5;g.add(cm);g.scale.setScalar(sc);g.visible=false;scene.add(g);return g}
const dart=mkDart(1.2),dartHook=mkDart(1.2),dart2=mkDart(4);
const dartGlow=spr(0xaad8ff),dartTrail=[];for(let i=0;i<14;i++)dartTrail.push(spr(0x9fc8ff));
// ---------- movimento orbital (tabela) ----------
const RO=1190,TI=C.dart+3.0,W0=.11,LAP=8,WA=C.orbit-.3,WB_=C.first-.3,TOT=C.end+1,DTT=1/120,NT=Math.ceil(TOT/DTT)+2;
const thR=new Float32Array(NT),thG=new Float32Array(NT);
{let a=.9,g=0;for(let i=0;i<NT;i++){const t=i*DTT;thR[i]=a;
  const bump=sm((t-WA)/.5)*(1-sm((t-WB_+.5)/.5));const rate=W0*(t<TI?1:1.046)*(1+(LAP-1)*bump);
  if(t<WA)g=a+rate*DTT;else g+=rate*DTT/1.09;a+=rate*DTT;thG[i]=g}}
const at=(T,t)=>{const x=clamp(t/DTT,0,NT-2),i=Math.floor(x);return lerp(T[i],T[i+1],x-i)};
const orb=th=>V3(RO*Math.cos(th),RO*Math.sin(th)*.14,RO*Math.sin(th)*.99);
const DP=t=>orb(at(thR,t));
// ---------- peças da cena ----------
const ghost=new THREE.Mesh(new THREE.SphereGeometry(75,24,16),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.35,wireframe:true}));ghost.visible=false;scene.add(ghost);
const ring=new THREE.Mesh(new THREE.TorusGeometry(RO,3.5,8,180),new THREE.MeshBasicMaterial({color:0x9fd9ff,transparent:true,opacity:0}));ring.rotation.x=Math.PI/2;ring.scale.set(1,1,1);scene.add(ring);
// anel inclinado igual ao plano da órbita
ring.rotation.set(Math.PI/2-.14,0,0);
const mkBar=(col)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(3,3,1,8),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0}));m.visible=false;scene.add(m);return m};
const barD=mkBar(0x01fbb4),barM=mkBar(0x01fbb4),lineH=mkBar(0x01fbb4),lineE=mkBar(0x01fbb4);
function placeBar(m,a,b,op){const d=b.clone().sub(a),L=d.length();m.visible=op>.01;if(!m.visible)return;m.position.copy(a).addScaledVector(d,.5);m.scale.set(m===lineH?3:1,L,m===lineH?3:1);m.quaternion.setFromUnitVectors(V3(0,1,0),d.normalize());m.material.opacity=op}
const glowM=spr(0x01fbb4),glowG=spr(0xffffff);const flash=spr(0xfff0d0),flash2=spr(0xfff0d0);
const shock=new THREE.Mesh(new THREE.TorusGeometry(1,.012,8,96),new THREE.MeshBasicMaterial({color:0xffe9c8,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));shock.visible=false;scene.add(shock);
const scan=new THREE.Mesh(new THREE.TorusGeometry(1,.012,8,96),new THREE.MeshBasicMaterial({color:0x01fbb4,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));scan.visible=false;scene.add(scan);
// ejecta (impacto principal) e relance do gancho
const NEJ=240;const ejG=new THREE.BufferGeometry();ejG.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(NEJ*3),3));
const ejP=new THREE.Points(ejG,new THREE.PointsMaterial({color:0xcfc8bb,size:3.2,sizeAttenuation:false,transparent:true,opacity:.9,depthWrite:false}));ejP.frustumCulled=false;ejP.visible=false;scene.add(ejP);
const NHK=90;const hkG=new THREE.BufferGeometry();hkG.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(NHK*3),3));
const hkP=new THREE.Points(hkG,new THREE.PointsMaterial({color:0xe6dfd2,size:3.4,sizeAttenuation:false,transparent:true,opacity:.95,depthWrite:false}));hkP.frustumCulled=false;hkP.visible=false;scene.add(hkP);
// pedras do impacto viajando até o asteroide
const NRK=44;const rocks=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,0),new THREE.MeshStandardMaterial({color:0x9c958a,roughness:1}),NRK);rocks.visible=false;rocks.frustumCulled=false;scene.add(rocks);
// ---------- cena da Terra (simulação) ----------
const R=4000,EX=60000,EC=V3(EX,-R,0);
const earthMat=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uSun:{value:V3(.5,.55,.65).normalize()},uC:{value:EC.clone()}},
 vertexShader:`varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,
 fragmentShader:`${NOISEGL} float fbm(vec3 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*n3(p);p*=2.03;a*=.5;}return s;} uniform float uT;uniform vec3 uSun;uniform vec3 uC;varying vec3 vW;
 void main(){vec3 n=normalize(vW-uC);vec3 d=n*3.;
  float land=fbm(d*1.1+4.)+.35*fbm(d*5.)+.08*fbm((vW-uC)*.02);float coast=smoothstep(.52,.56,land);
  vec3 ocean=mix(vec3(.0,.15,.7),vec3(.0,.55,.95),fbm(d*8.));vec3 grass=mix(vec3(.05,.6,.15),vec3(.85,.7,.1),fbm(d*4.+9.));vec3 col=mix(ocean,grass,coast);
  col*=.88+.24*fbm((vW-uC)*.35);float cl=smoothstep(.5,.78,fbm(d*3.+vec3(uT*.01,0,0)+20.));col=mix(col,vec3(.92),cl*.55);
  float dif=clamp(dot(n,uSun)*.85+.2,.05,1.);col*=dif;vec3 V=normalize(cameraPosition-vW);float fr=pow(1.-clamp(dot(n,V),0.,1.),2.5);col+=vec3(.25,.5,1.)*fr*.9*clamp(dot(n,uSun)+.4,0.,1.);gl_FragColor=vec4(col,1.);}`});
const earth=new THREE.Mesh(new THREE.SphereGeometry(R,128,96),earthMat);earth.position.copy(EC);earth.visible=false;scene.add(earth);
const atm=new THREE.Mesh(new THREE.SphereGeometry(R*1.03,96,64),new THREE.ShaderMaterial({transparent:true,side:THREE.BackSide,depthWrite:false,blending:THREE.AdditiveBlending,
 vertexShader:`varying vec3 vN;void main(){vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`varying vec3 vN;void main(){float i=pow(max(.62-dot(vN,vec3(0,0,1)),0.),3.5)*3.2;gl_FragColor=vec4(vec3(.3,.6,1.)*i,i);}`}));atm.position.copy(EC);atm.visible=false;scene.add(atm);
const A0=V3(EX-1150,1500,0),T0=V3(EX+150,-40,0),TI2=C.defl+2.6,VA=T0.clone().sub(A0).multiplyScalar(1/6.5);
const IP2=A0.clone().addScaledVector(VA,TI2-C.defl),PD=V3(.3,.954,0).normalize(),VA2=VA.clone().addScaledVector(PD,260);
rockS.scale.setScalar(1);
const dots=(col,n)=>{const m=new THREE.InstancedMesh(new THREE.SphereGeometry(7,8,6),new THREE.MeshBasicMaterial({color:col}),n);m.visible=false;m.frustumCulled=false;scene.add(m);return m};
const dotsOld=dots(0xff5a4d,70),dotsNew=dots(0x01fbb4,70);
function setDots(m,a,b,n,k){const m4=new THREE.Matrix4();for(let i=0;i<n;i++){const s=i/(n-1)*k;m4.makeTranslation(lerp(a.x,b.x,s),lerp(a.y,b.y,s),0);m.setMatrixAt(i,m4)}m.instanceMatrix.needsUpdate=true}
setDots(dotsOld,A0,T0.clone().add(V3(0,0,0)),70,1);
{const endN=IP2.clone().addScaledVector(VA2,5.5);setDots(dotsNew,IP2,endN,70,1)}
// ---------- alvos de câmera ----------
const heraPos=t=>V3(-500+Math.sin(t*.15)*40,1800+Math.cos(t*.12)*30,1300);
const dirD=V3(.6,.15,-.78).normalize();
const dartPos=t=>{const ip=DP(TI).addScaledVector(dirD,-72);return ip.clone().addScaledVector(dirD,1000*(TI-t))};
const surf=(lc,t)=>{const w=rotY(lc,SPIN*t);return {p:w.clone().multiplyScalar(rD(lc)),n:w}};
function target(n,t){switch(n){
 case 'didy':return V3(0,0,0);case 'dimo':return DP(t);case 'hera':return heraPos(t);case 'dart':return dartPos(t);
 case 'dh':return heraPos(t).multiplyScalar(.5);case 'surfB':return surf(LB,t).p;case 'surfG':return surf(LG,t).p;
 case 'em':return DP(t).multiplyScalar(.55);case 'pair':return DP(t).multiplyScalar(.5);case 'earth':return V3(EX-520,500,0);case 'earth2':return V3(EX-420,560,0)}return V3(0,0,0)}
function dirv(n,az,el,t){if(n==='surfB'||n==='surfG'){const s=surf(n==='surfB'?LB:LG,t),nn=s.n;const t1=V3(0,1,0).cross(nn).normalize(),t2=nn.clone().cross(t1);return nn.clone().multiplyScalar(Math.cos(el)).addScaledVector(t1.multiplyScalar(Math.cos(az)).addScaledVector(t2,Math.sin(az)),Math.sin(el)).normalize()}
 return V3(Math.sin(az)*Math.cos(el),Math.sin(el),Math.cos(az)*Math.cos(el))}
const K=[['teaser',0,'didy',3200,-25,10,36,1],['imp',-.5,'dimo',700,35,10,30,1.0],['hera',-.2,'hera',640,-45,45,38,.8],['didy',-.2,'pair',3000,25,68,40,.9],
 ['size',-.2,'didy',2300,-40,28,40,.8],['dimo',-.2,'dimo',700,-35,10,38,.8],['dart',-.2,'dart',210,95,18,36,.7],['dart',3.0,'dimo',800,60,15,40,.5],
 ['orbit',-.4,'didy',6200,0,80,40,.9],['first',-.3,'dimo',750,-70,14,38,.9],['dist',-.2,'dh',3800,0,0,40,.9],
 ['boul',-.3,'surfB',210,25,58,36,.9],['groove',-.3,'surfG',300,-40,52,38,1.2],['eject',-.3,'em',1900,10,72,40,.9],['crash',-.3,'dimo',800,30,25,38,.9],
 ['defl',-.02,'earth',3500,0,0,40,.01],['defl',2.9,'earth2',3500,6,2,40,.9],['nov',-.03,'hera',900,-40,12,40,.01],['cmt',0,'didy',2600,40,25,40,1.4]];
function cbez(x1,y1,x2,y2){return k=>{if(k<=0)return 0;if(k>=1)return 1;let lo=0,hi=1,u=k;for(let i=0;i<22;i++){const x=3*(1-u)*(1-u)*u*x1+3*(1-u)*u*u*x2+u*u*u;if(x<k)lo=u;else hi=u;u=(lo+hi)/2}return 3*(1-u)*(1-u)*u*y1+3*(1-u)*u*u*y2+u*u*u}}
const EASE=[cbez(.65,0,.35,1),cbez(.08,.9,.2,1),cbez(.34,1.5,.64,1),cbez(.8,0,.2,1)];
const ROLL={imp:4,dart:-5,orbit:0,first:3,eject:-3,crash:4,boul:-4,groove:3,hera:-3};
const KT=K.map((k,i)=>({e:[1,0,2,3][i%4],roll:(ROLL[k[0]]||0)*Math.PI/180*(i%2?-1:1),t:(C[k[0]]??0)+k[1],tg:k[2],d:k[3],az:k[4]*Math.PI/180,el:k[5]*Math.PI/180,fov:k[6],dur:k[7]}));
function kp(kk,t){return {up:(kk.tg==='pair'||kk.tg==='em')?DP(t).normalize():V3(0,1,0),tg:target(kk.tg,t),v:dirv(kk.tg,kk.az+Math.max(t-kk.t,0)*.05*(kk.tg.startsWith('surf')?.2:1),kk.el,t),d:kk.d,fov:kk.fov,roll:kk.roll}}
function camPose(t){let j=0;for(let i=0;i<KT.length;i++){if(KT[i].t-KT[i].dur*.75<=t)j=i}
 const b=KT[j],a=KT[Math.max(j-1,0)];const k=j===0?1:EASE[b.e](clamp((t-(b.t-b.dur*.75))/b.dur));
 const pa=kp(a,t),pb=kp(b,t);const dt=Math.max(t-b.t,0);
 return {up:pa.up.lerp(pb.up,k).normalize(),tg:pa.tg.lerp(pb.tg,k),v:pa.v.lerp(pb.v,k).normalize(),d:Math.exp(lerp(Math.log(pa.d),Math.log(pb.d*(1-.05*clamp(dt/4))),k)),fov:lerp(pa.fov,pb.fov,k),roll:lerp(pa.roll,pb.roll,k)}}
// legenda e HUD
const capEl=document.getElementById('cap');const VAR=[
 p=>`transform:scale(${1+.18*(1-p)});opacity:${p}`,p=>`transform:translateY(${40*(1-p)}px);opacity:${p}`,p=>`transform:translateX(${-60*(1-p)}px);opacity:${p}`,
 p=>`transform:translateX(${60*(1-p)}px);opacity:${p}`,p=>`transform:translateY(${-40*(1-p)}px) rotate(${-3*(1-p)}deg);opacity:${p}`,p=>`transform:rotate(${4*(1-p)}deg) scale(${.85+.15*p});opacity:${p}`,
 p=>`transform:scale(${.85+.15*p});filter:blur(${8*(1-p)}px);opacity:${p}`,p=>`transform:perspective(600px) rotateX(${35*(1-p)}deg);opacity:${p}`];
let lastW=-1;
function caption(t){let wi=-1;for(let i=0;i<WORDS.length;i++){if(t>=WORDS[i].s-.01&&t<WORDS[i].e+.04){wi=i;break}}
 if(wi<0||t<.25){capEl.innerHTML='';return}const w=WORDS[wi],p=sm((t-w.s)/.14);
 if(wi!==lastW){capEl.innerHTML=`<span class="${w.hl?'hl':''}">${w.w}</span>`;lastW=wi;const sp=capEl.firstChild;sp.style.fontSize='108px';const ww=sp.offsetWidth;if(ww>760)sp.style.fontSize=Math.floor(108*760/ww)+'px'}
 capEl.firstChild.style.cssText+=VAR[(wi*5+3)%8](p)}
const $=id=>document.getElementById(id);
const GL='0 0 50px rgba(1,251,180,.75),0 8px 0 rgba(0,10,30,.55)';
function hud(id,text,t,a,b,size,col='#fff',top){const e=$(id);e.textContent=text;e.style.fontSize=size+'px';e.style.color=col;e.style.textShadow=GL;if(top!=null)e.style.top=top+'px';const on=t>=a&&t<b;const k=on?sm((t-a)/.25)*(1-sm((t-(b-.3))/.3)):0;e.style.opacity=k;e.style.transform=`scale(${.6+.4*k})`}
function hudM(id,t,items){let it=items.find(x=>t>=x[1]&&t<x[2])||items[0];const on=t>=it[1]&&t<it[2];hud(id,it[0],t,it[1],it[2],it[3],it[4],it[5]);if(!on)$(id).style.opacity=0}
// ---------- estado ----------
const SPK=Array.from({length:NEJ},(_,i)=>({v:V3(hs(i,1)-.5,hs(i,2)-.5,hs(i,3)-.5),s:15+Math.pow(hs(i,4),1.5)*110,c:hs(i,5)*Math.PI*2*(.35)}));
function setT(t){
 earthMat.uniforms.uT.value=t;const U=didy.material.userData.u;U.uRot.value=SPIN*t;
 didyG.rotation.y=SPIN*t;dimoM.material.userData.u.uRot.value=0;
 const dp=DP(t);dimoM.position.copy(dp);dimoM.rotation.y=t*.05;
 // Hera
 hera.position.copy(heraPos(t));hera.lookAt(0,0,0);hera.rotation.z+=Math.sin(t*.4)*.03;
 // DART em voo (ao vivo)
 {const on=t>=C.dart-.9&&t<TI;dart.visible=on;dartGlow.visible=on;dartTrail.forEach((s,i)=>{s.visible=on});if(on){const p=dartPos(t);dart.position.copy(p);dart.lookAt(p.clone().sub(dirD));dartGlow.position.copy(p).addScaledVector(dirD,12);dartGlow.scale.setScalar(14);dartGlow.material.opacity=.5;
  dartTrail.forEach((s,i)=>{const a=(i+1)/dartTrail.length;s.position.copy(p).addScaledVector(dirD,12+a*150);s.scale.setScalar(9*(1-a)+2);s.material.opacity=.3*(1-a)})}}
 // gancho: DART relance
 {const a=t-C.imp;const on=a>-.7&&a<0;dartHook.visible=on;if(on){const dh=V3(-.7,.2,.68).normalize();const p=DP(C.imp).addScaledVector(dh,-72).addScaledVector(dh,Math.abs(a)*1400);dartHook.position.copy(p);dartHook.lookAt(p.clone().sub(dh))}
  const f=clamp(1-Math.abs(a-.05)/.22);flash.visible=f>.01;if(f>.01){flash.position.copy(DP(C.imp));flash.scale.setScalar(170*f+30);flash.material.opacity=.7*f}
  const sh=a>=0&&a<1.5;shock.visible=sh;if(sh){const k=a/1.5;shock.position.copy(DP(C.imp));shock.lookAt(cam.position);shock.scale.setScalar(60+300*(1-Math.pow(1-k,3)));shock.material.opacity=.55*(1-k)}
  hkP.visible=a>=0&&a<2.2;if(hkP.visible){const p=hkG.attributes.position,c0=DP(C.imp);for(let i=0;i<NHK;i++){const s=SPK[i];const pp=c0.clone().addScaledVector(V3(s.v.x*2,s.v.y*2+.5,s.v.z*2).normalize(),s.s*a*1.4);p.setXYZ(i,pp.x,pp.y,pp.z)}p.needsUpdate=true;hkP.material.opacity=.95*(1-a/2.2)}}
 // impacto principal: flash + ejecta persistente
 {const a=t-TI;const f=clamp(1-Math.abs(a-.05)/.35);flash2.visible=f>.01;if(f>.01){flash2.position.copy(DP(TI));flash2.scale.setScalar(240*f+40);flash2.material.opacity=.7*f}
  ejP.visible=a>=0;if(ejP.visible){const p=ejG.attributes.position,ip=DP(TI).addScaledVector(dirD,-72);const anti=SUN.clone().multiplyScalar(-1);for(let i=0;i<NEJ;i++){const s=SPK[i];const dv=dirD.clone().multiplyScalar(-1).add(s.v.clone().multiplyScalar(1.1)).normalize().multiplyScalar(s.s*.42);const pp=ip.clone().addScaledVector(dv,a).addScaledVector(anti,1.4*a*a*.5).addScaledVector(dp.clone().sub(DP(TI)),.93+.06*hs(i,6));p.setXYZ(i,pp.x,pp.y,pp.z)}p.needsUpdate=true;ejP.material.opacity=.9*(1-clamp((a-12)/40)*.6);ejP.material.size=4.2}}
 // anel e ponto "antes" (diagrama de órbita)
 {const w=sm((t-WA+.2)/.4)*(1-sm((t-WB_-.1)/.4));ring.material.opacity=.5*w;ring.visible=w>.01;ghost.visible=w>.01&&t>=WA;ghost.position.copy(orb(at(thG,t)));ghost.material.opacity=.7*w;glowM.visible=glowG.visible=w>.01;glowM.position.copy(dp);glowM.scale.setScalar(420);glowM.material.opacity=.7*w;glowG.position.copy(ghost.position);glowG.scale.setScalar(300);glowG.material.opacity=.45*w}
 // réguas
 {const dTop=V3(0,0,0);const sizeOn=sm((t-C.size)/.35)*(1-sm((t-C.dimo+.15)/.3));const pa=V3(-405,0,60),pb=V3(405,0,60);placeBar(barD,pa,pb,.9*sizeOn);
  const dimoOn=sm((t-C.dimo)/.35)*(1-sm((t-C.dart+.4)/.3));const c=dp;placeBar(barM,c.clone().add(V3(-75,-95,0)),c.clone().add(V3(75,-95,0)),.9*dimoOn);
  const hp=heraPos(t),dir=hp.clone().normalize();const distOn=sm((t-C.dist)/.35)*(1-sm((t-C.boul+.3)/.3));placeBar(lineH,hp.clone().addScaledVector(dir,-55),dir.clone().multiplyScalar(430),.85*distOn)}
 // pedras do impacto (eject)
 {const on=t>=C.eject-.2&&t<C.crash-.3;rocks.visible=on;if(on){const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler();const s0=dp,toD=dp.clone().normalize().multiplyScalar(-1);const e0=dp.clone().normalize().multiplyScalar(rD(dp.clone().normalize())+4);
  for(let i=0;i<NRK;i++){const ph=((t-C.eject)/3.4+i*.083)%1;const k=sm(ph);const p=s0.clone().lerp(e0,k);p.y+=Math.sin(k*Math.PI)*90*(hs(i,2)-.2);p.addScaledVector(V3(hs(i,3)-.5,hs(i,4)-.5,hs(i,5)-.5),30*Math.sin(k*Math.PI));
   const sz=3+hs(i,6)*8;e.set(t*(1+hs(i,7)),t*hs(i,8)*2,i);q.setFromEuler(e);m4.compose(p,q,V3(sz,sz*.8,sz));rocks.setMatrixAt(i,m4)}rocks.instanceMatrix.needsUpdate=true}}
 // sulcos
 grooveMat.opacity=.85*sm((t-C.groove+.1)/.5)*(1-sm((t-C.eject+.5)/.5));
 // scan em volta da lua
 {const on=t>=C.crash-.2&&t<C.defl-.1;scan.visible=on;if(on){const a=((t-C.crash)*.9)%1;scan.position.copy(dp);scan.lookAt(cam.position);scan.scale.setScalar(110+170*a);scan.material.opacity=.85*(1-a)*sm((t-C.crash+.2)/.3)}}
 // cena da Terra
 {const on=t>=C.defl-.3&&t<C.nov;earth.visible=atm.visible=on;rockS.visible=dart2.visible=dotsOld.visible=dotsNew.visible=on;if(on){const u=t-C.defl;
  const hit=t>=TI2;const ap=hit?IP2.clone().addScaledVector(VA2,t-TI2):A0.clone().addScaledVector(VA,u);rockS.position.copy(ap);rockS.scale.setScalar(1.9);rockS.rotation.y=t*.2;rockS.material.userData.u.uRot.value=t*.2;
  const sp=450;const pp=IP2.clone().addScaledVector(PD,sp*(t-TI2));dart2.visible=t<TI2&&t>TI2-1.9;dart2.position.copy(pp);dart2.lookAt(pp.clone().add(PD));
  dotsNew.visible=hit;dotsNew.material.opacity=1;
  const f=clamp(1-Math.abs(t-TI2-.04)/.3);flash.visible=flash.visible||f>.01;if(f>.01){flash.position.copy(IP2);flash.scale.setScalar(320*f+60);flash.material.opacity=.95*f}}}
 // HUD
 hudM('title2',t,[['780 M',C.size+.3,C.dimo-.2,170,'#fff',230],['1 KM',C.eject+.5,C.eject+4.4,170,'#fff',230]]);
 hudM('title3',t,[['151 M',C.dimo+.3,C.dart-.4,170,'#fff',230],['?',C.crash+.2,C.defl-.4,300,'#fff',200]]);
 hudM('title4',t,[['580 KG',C.dart+.1,C.dart+1.7,170,'#fff',230],['SIMULAÇÃO',C.defl+.3,C.nov-.2,100,'#fff',250]]);
 hudM('h15',t,[['6 KM/S',C.dart+1.7,TI+.6,170,'#01FBB4',230],['25 NOV',C.nov+.1,C.cta+.1,170,'#01FBB4',230]]);
 hudM('hfirst',t,[['−33 MIN',C.orbit+.3,C.first-.4,170,'#01FBB4',230]]);hudM('hq',t,[['1ª VEZ',C.first+.2,C.first+3.4,160,'#fff',230]]);hudM('hx',t,[['60 KM',C.dist+.5,C.boul-.5,170,'#01FBB4',230]]);
 {const e=$('title');e.style.fontSize='78px';e.innerHTML='LADO NUNCA VISTO<br><b>DO ASTEROIDE</b>';const k=t<3.4?1:1-sm((t-3.4)/.5);e.style.opacity=k;const pu=t>=C.imp?.16*Math.exp(-(t-C.imp)*7):0;e.style.transform=`translateY(${(1-k)*-60}px) scale(${(1+pu)*(1+(1-k)*.1)})`}
 // transições: dip azul entrando na Terra, wipe saindo
 {const tr=$('tr');const dipk=clamp(1-Math.abs(t-C.defl)/.2);const wa=C.nov-.28,wk=t>=wa&&t<=wa+.5;
  if(dipk>0){tr.style.background='#011839';tr.style.clipPath='none';tr.style.opacity=dipk}
  else if(wk){tr.style.background='#01336b';tr.style.opacity=1;tr.style.clipPath=`inset(0 ${(1-sm((t-wa)/.25))*100}% 0 ${sm((t-wa-.25)/.25)*100}%)`}
  else{tr.style.opacity=0}}
 // CTA
 {const on=t>=C.cmt-.2;$('dim').style.opacity=on?.82*sm((t-C.cmt+.2)/.6):0;
  const inCmt=t>=C.cmt&&t<C.seg-.1;const c=$('cmt');c.style.opacity=inCmt?sm((t-C.cmt)/.3)*(1-sm((t-C.seg+.4)/.25)):0;c.style.transform=`translateY(${(1-sm((t-C.cmt)/.3))*80}px)`;
  const word='ARQUIVO',n=Math.floor(clamp((t-C.cmt-.5)/.5)*word.length);$('typed').textContent=word.slice(0,n);
  const p=$('prof');const pk=sm((t-C.seg+.1)/.4);p.style.opacity=pk;p.style.transform=`scale(${.7+.3*pk})`;
  const tc=C.seg+.95;const fb=$('fbtn');const done=t>=tc;fb.textContent=done?'Seguindo ✓':'Seguir';fb.style.background=done?'#fff':'#01FBB4';fb.style.transform=`scale(${1-.12*clamp(1-Math.abs(t-tc)/.12)})`;
  const cur=$('cur');const ck=sm((t-C.seg)/.9);cur.style.opacity=t>=C.seg&&t<tc+1.0?1:0;const fx=lerp(900,720,ck),fy=lerp(1500,1120,ck);cur.style.transform=`translate(${fx}px,${fy}px) scale(${1-.12*clamp(1-Math.abs(t-tc)/.12)})`;
  const d=$('dm');const dk=sm((t-C.msg)/.35);d.style.opacity=dk;d.style.transform=`scale(${.6+.4*dk}) translateY(${(1-dk)*60}px)`}
 // câmera
 const cp=camPose(t);cam.fov=cp.fov;cam.updateProjectionMatrix();
 const sh=(clamp(1-Math.abs(t-C.imp-.15)/.5)*1.4+clamp(1-Math.abs(t-TI-.15)/.6)*1.6)*Math.min(cp.d,60)*.012;
 cam.position.set(cp.tg.x+cp.v.x*cp.d+Math.sin(t*37)*sh,cp.tg.y+cp.v.y*cp.d+Math.cos(t*29)*sh,cp.tg.z+cp.v.z*cp.d);cam.up.copy(cp.up);cam.lookAt(cp.tg);cam.rotateZ(cp.roll);cam.setViewOffset(W,H,0,H*.05,W,H);
 stars.position.copy(cam.position);sunSpr.position.copy(cam.position).addScaledVector(SUN,100000);sunSpr.scale.setScalar(5000);
 sun.position.copy(cam.position).addScaledVector(SUN,1000);sun.target.position.copy(cam.position);sun.target.updateMatrixWorld();
 $('flash').style.opacity=clamp(1-Math.abs(t-C.imp-.03)/.06)*.25;$('rew').style.opacity=0;
 caption(t);comp.render();
}
window.setT=setT;window.__ready=true;
