// PLANO DE CENA (estilo do vídeo aprovado: mundo 3D realista, Terra e espaço)
// imp   | telescópio em chamas, onda de choque              | soco de aproximação | gancho: "cair do espaço" | órbita, limbo da Terra
// name  | Swift calmo, painéis solares, Terra azul abaixo   | órbita lenta        | apresenta o objeto | espaço preto, Terra azul
// safe  | luzes do telescópio apagam, HUD 275 KM            | close               | modo de segurança | espaço
// drag  | camada de ar se expande até o telescópio, partículas freiam | lateral longa | arrasto | limbo da Terra + brilho do Sol
// link  | nave LINK se aproxima com pinça                   | acompanha           | resgate | espaço
// spin  | LINK gira sem controle e se afasta                | segue a LINK        | falha | espaço
// fall  | telescópio desce, Terra enche a tela              | de baixo            | queda | Terra
// reent | plasma laranja, pedaços se soltam, HUD 4 NOV      | close/lateral       | reentrada | atmosfera
// burn  | pedaços queimam e somem                           | recuo               | queima | atmosfera
// risk  | 2.100 pontos, um destacado                        | aproxima            | 1 em 2.100 | espaço
// end   | telescópio desaparece, Terra calma                | recuo longo         | fecho | espaço
import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
const W=1080,H=1920,R=4000,EC=new THREE.Vector3(0,-R,0);
const D=await (await fetch('/words.json')).json();const C=D.cues,WORDS=D.words;
const clamp=(x,a=0,b=1)=>Math.min(Math.max(x,a),b),sm=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10)},lerp=(a,b,k)=>a+(b-a)*k;
const hs=(i,s=0)=>{const x=Math.sin(i*127.1+s*311.7)*43758.5453;return x-Math.floor(x)};
const V3=(x,y,z)=>new THREE.Vector3(x,y,z);
const renderer=new THREE.WebGLRenderer({canvas:document.getElementById('gl'),antialias:false,logarithmicDepthBuffer:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(1);renderer.setSize(W,H,false);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=0.9;
const scene=new THREE.Scene();scene.background=new THREE.Color(0x00020a);
const pm=new THREE.PMREMGenerator(renderer);scene.environment=pm.fromScene(new RoomEnvironment(),0.04).texture;scene.environmentIntensity=0.3;
const cam=new THREE.PerspectiveCamera(40,W/H,0.3,200000);
const comp=new EffectComposer(renderer);comp.setSize(W,H);comp.addPass(new RenderPass(scene,cam));comp.addPass(new UnrealBloomPass(new THREE.Vector2(W/2,H/2),0.2,0.5,0.9));comp.addPass(new OutputPass());
const sun=new THREE.DirectionalLight(0xffe8c8,2.6);sun.position.set(-300,260,420);scene.add(sun);
scene.add(new THREE.HemisphereLight(0x6a98ff,0x14182a,.5));const rim=new THREE.DirectionalLight(0x9ecbff,.8);rim.position.set(300,60,-200);scene.add(rim);
function tex(draw,s=128){const c=document.createElement('canvas');c.width=c.height=s;const g=c.getContext('2d');draw(g,s);return new THREE.CanvasTexture(c)}
const softT=tex((g,s)=>{const r=g.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.4,'rgba(255,255,255,.4)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,s,s)});
function spr(col,op=1){const m=new THREE.SpriteMaterial({map:softT,color:col,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,opacity:op});const s=new THREE.Sprite(m);s.visible=false;scene.add(s);return s}
// estrelas
{const g=new THREE.BufferGeometry(),p=[];for(let i=0;i<3000;i++){const u=hs(i,1)*2-1,a=hs(i,2)*6.2832,r=Math.sqrt(1-u*u);p.push(Math.cos(a)*r*90000,u*90000,Math.sin(a)*r*90000)}g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));var stars=new THREE.Points(g,new THREE.PointsMaterial({color:0xdfe8ff,size:2.4,sizeAttenuation:false}));scene.add(stars)}
// Terra
const NOISE=`float h3(vec3 p){p=fract(p*0.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float n3(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*n3(p);p*=2.03;a*=.5;}return s;}`;
const earthMat=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uSun:{value:V3(-300,260,420).normalize()}},
 vertexShader:`varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,
 fragmentShader:`${NOISE} uniform float uT;uniform vec3 uSun;varying vec3 vW;
 void main(){vec3 c=vec3(0.,-${R}.,0.);vec3 n=normalize(vW-c);vec3 d=n*3.;
  float land=fbm(d*1.1+4.)+.35*fbm(d*5.)+.08*fbm(vW*.02);float coast=smoothstep(.52,.56,land);
  vec3 ocean=mix(vec3(.0,.15,.7),vec3(.0,.55,.95),fbm(d*8.));vec3 grass=mix(vec3(.05,.6,.15),vec3(.85,.7,.1),fbm(d*4.+9.));vec3 col=mix(ocean,grass,coast);
  col*=.88+.24*fbm(vW*.35);float cl=smoothstep(.5,.78,fbm(d*3.+vec3(uT*.01,0,0)+20.));col=mix(col,vec3(.92),cl*.55);
  float dif=clamp(dot(n,uSun)*.85+.2,.05,1.);col*=dif;vec3 V=normalize(cameraPosition-vW);float fr=pow(1.-clamp(dot(n,V),0.,1.),2.5);col+=vec3(.25,.5,1.)*fr*.9*clamp(dot(n,uSun)+.4,0.,1.);gl_FragColor=vec4(col,1.);}`});
const earth=new THREE.Mesh(new THREE.SphereGeometry(R,128,96),earthMat);earth.position.copy(EC);scene.add(earth);
const atm=new THREE.Mesh(new THREE.SphereGeometry(R*1.03,96,64),new THREE.ShaderMaterial({transparent:true,side:THREE.BackSide,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{k:{value:1}},
 vertexShader:`varying vec3 vN;void main(){vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`uniform float k;varying vec3 vN;void main(){float i=pow(max(.62-dot(vN,vec3(0,0,1)),0.),3.5)*3.2*k;gl_FragColor=vec4(vec3(.3,.6,1.)*i,i);}`}));atm.position.copy(EC);scene.add(atm);
// materiais
const gold=new THREE.MeshStandardMaterial({color:0xd9a73a,metalness:.9,roughness:.35}),white=new THREE.MeshStandardMaterial({color:0xe8eaee,metalness:.4,roughness:.45}),dk=new THREE.MeshStandardMaterial({color:0x22262e,metalness:.6,roughness:.5}),panel=new THREE.MeshStandardMaterial({color:0x2a58c8,metalness:.8,roughness:.3,emissive:0x0a1a40,emissiveIntensity:.4,side:THREE.DoubleSide});
// ===== telescópio Swift =====
function mkSwift(){const g=new THREE.Group();const inner=new THREE.Group();g.add(inner);
 const bus=new THREE.Mesh(new THREE.BoxGeometry(9,9,10),gold);inner.add(bus);
 const tube=new THREE.Mesh(new THREE.CylinderGeometry(3.2,3.2,14,24),white);tube.rotation.x=Math.PI/2;tube.position.z=11;inner.add(tube);
 const lens=new THREE.Mesh(new THREE.CylinderGeometry(2.8,2.8,.4,24),new THREE.MeshStandardMaterial({color:0x101826,metalness:.9,roughness:.1}));lens.rotation.x=Math.PI/2;lens.position.z=18.2;inner.add(lens);
 for(const s of[-1,1]){const p=new THREE.Mesh(new THREE.BoxGeometry(26,.3,10),panel);p.position.set(s*18,0,-1);inner.add(p);const a=new THREE.Mesh(new THREE.CylinderGeometry(.25,.25,10,8),dk);a.rotation.z=Math.PI/2;a.position.set(s*7,0,-1);inner.add(a)}
 const ant=new THREE.Mesh(new THREE.CylinderGeometry(.15,.15,7,8),dk);ant.position.set(0,7,-3);inner.add(ant);
 const L=[];for(let i=0;i<3;i++){const b=new THREE.Mesh(new THREE.SphereGeometry(.45,12,8),new THREE.MeshBasicMaterial({color:0x31ff9a}));b.position.set(-3+i*3,4.6,5);inner.add(b);L.push(b)}
 g.userData={inner,L};return g}
const swift=mkSwift();swift.scale.setScalar(1.6);scene.add(swift);
const heatG=spr(0xff7a22),heatG2=spr(0xffd27a),trail=[];for(let i=0;i<24;i++)trail.push(spr(0xff8a30));
const deb=[];for(let i=0;i<14;i++){const m=new THREE.Mesh(new THREE.BoxGeometry(1.2+hs(i,1)*2.5,.6,1.2+hs(i,2)*2),i%2?gold:white);m.visible=false;scene.add(m);deb.push([m,spr(0xff8a30)])}
// ===== nave LINK =====
function mkLink(){const g=new THREE.Group();const b=new THREE.Mesh(new THREE.BoxGeometry(6,6,8),dk);g.add(b);
 for(const s of[-1,1]){const p=new THREE.Mesh(new THREE.BoxGeometry(14,.25,5),gold);p.position.set(s*10,0,0);g.add(p)}
 for(const s of[-1,1]){const a=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,9,8),new THREE.MeshStandardMaterial({color:0xbbbbbb,metalness:.8,roughness:.3}));a.rotation.x=Math.PI/2;a.position.set(s*2,0,8);g.add(a);const c=new THREE.Mesh(new THREE.BoxGeometry(1.8,.6,1.6),dk);c.position.set(s*2,0,12.6);g.add(c)}
 g.userData={thr:null};return g}
const link=mkLink();link.scale.setScalar(1.4);scene.add(link);const linkFlame=spr(0xaad8ff);
// ===== 2100 pontos (risco) =====
const dotM=new THREE.InstancedMesh(new THREE.SphereGeometry(.8,10,8),new THREE.MeshBasicMaterial({color:0x9fd0ff}),2100);{const m=new THREE.Matrix4();for(let i=0;i<2100;i++){const x=(i%60-29.5)*2.2,y=(Math.floor(i/60)-17.5)*2.2;m.makeTranslation(x,y,0);dotM.setMatrixAt(i,m)}}scene.add(dotM);
const hot=new THREE.Mesh(new THREE.SphereGeometry(1.6,16,12),new THREE.MeshBasicMaterial({color:0xff3b30}));scene.add(hot);const hotG=spr(0xff3b30);
const shock=new THREE.Mesh(new THREE.TorusGeometry(1,.05,8,64),new THREE.MeshBasicMaterial({color:0xffe0b0,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));scene.add(shock);
// ===== poses =====
const ALT0=650;
const thetaAt=t=>.012*t;
const altAt=t=>t<C.safe?ALT0:(t<C.fall?lerp(ALT0,ALT0-40,sm((t-C.safe)/(C.fall-C.safe))):lerp(ALT0-40,160,sm((t-C.fall)/(C.reent-C.fall+3))));
function telePose(t){const th=thetaAt(t),alt=altAt(t);const p=EC.clone().add(V3(Math.sin(th),Math.cos(th),0).multiplyScalar(R+alt));return {p,th}}
function linkPos(t){const tp=telePose(t);const up=V3(Math.sin(tp.th),Math.cos(tp.th),0),fw=V3(Math.cos(tp.th),-Math.sin(tp.th),0);
 if(t<C.link)return tp.p.clone().addScaledVector(fw,-400);
 if(t<C.spin){const k=sm((t-C.link)/(C.spin-C.link+1));return tp.p.clone().addScaledVector(fw,-lerp(400,40,k)).addScaledVector(up,lerp(0,6,k))}
 const a=t-C.spin;return tp.p.clone().addScaledVector(fw,-40-a*14).addScaledVector(up,6+a*10)}
function target(n,t){const tp=telePose(t).p;switch(n){
 case 'tele':return tp.clone();case 'pair':return tp.clone().lerp(linkPos(t),.55);case 'linkv':return linkPos(t);
 case 'risk':return V3(0,ALT0,-400);case 'earthlow':return EC.clone().add(V3(0,R+60,0))}return tp.clone()}
const K=[['teaser',0,'tele',55,-25,8,36,1],['imp',-.1,'tele',36,32,10,30,.4],['imp',1.4,'tele',70,70,18,38,1.2],
 ['name',.1,'tele',60,-60,12,38,.01],['safe',0,'tele',38,22,6,34,1.2],['drag',0,'tele',230,-82,3,42,1.5],
 ['link',0,'pair',90,40,10,38,1.3],['spin',0,'linkv',60,-30,12,38,1.0],['fall',0,'tele',170,10,-8,40,1.5],
 ['reent',0,'tele',60,150,-6,36,1.0],['reent',4,'tele',90,40,12,40,1.4],['burn',0,'tele',110,-25,8,38,1.3],
 ['risk',0,'risk',140,0,4,38,.01],['end',0,'tele',260,30,20,44,2.0],['frag',0,'earthlow',900,0,22,46,1.8],['cmt',0,'tele',320,40,18,40,1.4]];
function cbez(x1,y1,x2,y2){return k=>{if(k<=0)return 0;if(k>=1)return 1;let lo=0,hi=1,u=k;for(let i=0;i<22;i++){const x=3*(1-u)*(1-u)*u*x1+3*(1-u)*u*u*x2+u*u*u;if(x<k)lo=u;else hi=u;u=(lo+hi)/2}return 3*(1-u)*(1-u)*u*y1+3*(1-u)*u*u*y2+u*u*u}}
const EASE=[cbez(.65,0,.35,1),cbez(.08,.9,.2,1),cbez(.34,1.5,.64,1),cbez(.8,0,.2,1)];
const ROLL={imp:4,spin:9,reent:-6,link:3,drag:-3};
const KT=K.map((k,i)=>({e:[1,0,2,3][i%4],roll:(ROLL[k[0]]||0)*Math.PI/180*(k[1]>0?-1:1),t:(C[k[0]]??0)+k[1],tg:k[2],d:k[3]*(k[2]==='earthlow'?1:(k[2]==='risk'?1.7:2.6)),az:k[4]*Math.PI/180,el:k[5]*Math.PI/180,fov:k[6],dur:k[7]}));
function camPose(t){let j=0;for(let i=0;i<KT.length;i++){if(KT[i].t-KT[i].dur*.75<=t)j=i}
 const b=KT[j],a=KT[Math.max(j-1,0)];const k=j===0?1:EASE[b.e](clamp((t-(b.t-b.dur*.75))/b.dur));
 const tg=target(a.tg,t).lerp(target(b.tg,t),k);const dt=Math.max(t-b.t,0);
 const d=Math.exp(lerp(Math.log(a.d),Math.log(b.d*(1-.05*clamp(dt/4))),k)),az=lerp(a.az,b.az+dt*.05,k),el=lerp(a.el,b.el,k),fov=lerp(a.fov,b.fov,k),roll=lerp(a.roll,b.roll,k);return{tg,d,az,el,fov,roll}}
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
function hudT(id,text,t,a,b,size){const e=$(id);e.textContent=text;e.style.fontSize=size+'px';const on=t>=a&&t<b;const k=on?sm((t-a)/.25)*(1-sm((t-(b-.3))/.3)):0;e.style.opacity=k;e.style.transform=`scale(${.6+.4*k})`}

// ---------- estado ----------
function heatAt(t){return t<C.name?(.6+.4*sm(t/C.imp)):clamp((t-C.reent)/2)*(1-clamp((t-C.burn-3)/3))}
function setT(t){
 earthMat.uniforms.uT.value=t;const tp=telePose(t);
 // telescópio: no gancho já em reentrada; depois calmo
 const pre=t<C.name;swift.position.copy(tp.p);const th=tp.th;swift.rotation.set(0,0,-th-Math.PI/2);
 swift.rotation.y=pre?Math.sin(t*3)*.4:0;swift.userData.inner.rotation.z=pre?t*.9:t*.05;
 const alive=t<C.reent+2.6||pre;swift.visible=pre||t<C.reent+4;
 // luzes dim em 'safe'
 swift.userData.L.forEach((b,i)=>{const off=t>=C.safe+.6+i*.4&&t<C.name+100;b.material.color.set(off&&!pre?0x22262e:0x31ff9a)});
 // calor / plasma
 const h=heatAt(t);heatG.visible=heatG2.visible=h>.02;if(heatG.visible){heatG.position.copy(tp.p);heatG.scale.setScalar(70*h+20);heatG.material.opacity=.9*h;heatG2.position.copy(tp.p);heatG2.scale.setScalar(26*h+6);heatG2.material.opacity=.9*h}
 trail.forEach((s,i)=>{const on=h>.1;s.visible=on;if(!on)return;const a=((t*1.5)+hs(i,2))%1;const dir=V3(-Math.cos(tp.th),Math.sin(tp.th),0);s.position.copy(tp.p).addScaledVector(dir,a*140+8).add(V3((hs(i,3)-.5)*10,(hs(i,4)-.5)*10,(hs(i,5)-.5)*10));s.scale.setScalar(26*(1-a)+6);s.material.opacity=.7*(1-a)*h});
 deb.forEach(([m,s],i)=>{const t0=pre?C.imp:C.reent+1.2;const a=t-t0-i*.12;const on=a>0&&a<6&&(pre?t<C.name:true);m.visible=s.visible=on;if(!on)return;const dir=V3(-Math.cos(tp.th),Math.sin(tp.th),0);m.position.copy(tp.p).addScaledVector(dir,a*22).add(V3((hs(i,6)-.5)*a*30,(hs(i,7)-.5)*a*24,(hs(i,8)-.5)*a*24));m.rotation.set(a*3+i,a*2,i);s.position.copy(m.position);s.scale.setScalar(9*(1-a/6)+2);s.material.opacity=.8*(1-a/6)});
 // atmosfera que se expande no 'drag'
 atm.scale.setScalar(1+.025*sm((t-C.drag)/3)*(t<C.fall?1:Math.max(0,1-(t-C.fall)/4)));atm.material.uniforms.k.value=1+.8*sm((t-C.drag)/3);
 // LINK
 {const on=t>=C.link-2&&t<C.fall;link.visible=linkFlame.visible=on;if(on){const lp=linkPos(t);link.position.copy(lp);const lk=t<C.spin?0:1;link.lookAt(tp.p);if(lk){const a=t-C.spin;link.rotation.z=a*(2+a*1.6);link.rotation.x+=a*1.4}
  linkFlame.position.copy(lp);linkFlame.scale.setScalar(t<C.spin?10:24);linkFlame.material.opacity=.8}}
 // pontos do risco
 {const on=t>=C.risk-.3&&t<C.end-.5;dotM.visible=hot.visible=hotG.visible=on;dotM.position.set(0,ALT0+10,-400);hot.position.set(0,ALT0+10,-400).add(V3(((1337%60)-29.5)*2.2,(Math.floor(1337/60)-17.5)*2.2,0));hotG.position.copy(hot.position);const k=sm((t-C.risk-1.2)/.6);hot.scale.setScalar(.01+k*(1+.2*Math.sin(t*6)));hotG.scale.setScalar(k*18);hotG.material.opacity=.8*k;
  dotM.material.color.set(0x9fd0ff);if(on)dotM.position.z=-400}
 // onda de choque do gancho
 {const a=t-C.imp;shock.visible=a>=0&&a<1.6;if(shock.visible){const k=a/1.6;shock.position.copy(tp.p);shock.lookAt(tp.p.clone().add(V3(0,0,1)));shock.scale.setScalar(4+90*(1-Math.pow(1-k,3)));shock.material.opacity=.7*(1-k)}}
 // HUD
 hudT('h15','275 KM',t,C.safe+.5,C.safe+3.4,200);hudT('hfirst','4 NOV',t,C.reent+.3,C.reent+3.6,220);hudT('title2','1 em 2.100',t,C.risk+.4,C.risk+4.2,150);hudT('hx','FALHOU',t,C.spin+1.2,C.spin+4,170);
 {const e=$('title');e.style.fontSize='84px';e.innerHTML='TELESCÓPIO DA NASA<br><b>CAIU DO ESPAÇO</b>';const k=t<3.2?1:1-sm((t-3.2)/.5);e.style.opacity=k;const pu=t>=C.imp?.16*Math.exp(-(t-C.imp)*7):0;e.style.transform=`translateY(${(1-k)*-60}px) scale(${(1+pu)*(1+(1-k)*.1)})`}
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
 const cx=Math.sin(cp.az)*Math.cos(cp.el),cy=Math.sin(cp.el),cz=Math.cos(cp.az)*Math.cos(cp.el);const sh=(clamp(1-Math.abs(t-C.imp-.15)/.6)*1.4+(t<C.imp?.5*t/C.imp:0)+(t>C.reent&&t<C.burn?.5:0))*Math.min(cp.d,60)*.012;
 cam.position.set(cp.tg.x+cx*cp.d+Math.sin(t*37)*sh,cp.tg.y+cy*cp.d+Math.cos(t*29)*sh,cp.tg.z+cz*cp.d);cam.lookAt(cp.tg);cam.rotateZ(cp.roll);cam.setViewOffset(W,H,0,H*.03,W,H);
 stars.position.copy(cam.position);sun.position.set(cam.position.x-300,cam.position.y+260,cam.position.z+420);
 $('flash').style.opacity=clamp(1-Math.abs(t-C.imp)/.1)*.3;$('rew').style.opacity=clamp(1-Math.abs(t-C.name)/.35)*.9;
 caption(t);comp.render();
}
window.setT=setT;window.__ready=true;
