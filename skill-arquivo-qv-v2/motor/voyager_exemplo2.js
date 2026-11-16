// PLANO DE CENA (palavra-foco | o que aparece | câmera | por quê | fundo)
// imp   | linha ciano varre a sonda + onda de choque     | close, soco de aproximação | gancho: "cruzar uma linha" | espaço profundo, ouro
// name  | Voyager 1 inteira, girando devagar              | afasta e gira             | apresenta o objeto         | espaço
// km    | sistema solar visto de cima, rota até a sonda   | sobe até vista de cima    | escala real da distância   | fundo azul-marinho, órbitas
// sun8  | pulso Sol→Terra                                 | desce para o sistema interno | 8 min = referência       | Sol laranja
// day   | pulso de luz atravessa planetas até a sonda     | segue o pulso             | dia-luz = 24 h de luz      | espaço com riscos de velocidade
// cmd   | pacote ciano Terra→sonda                        | segue o pacote            | comando leva 1 dia         | espaço
// back  | pacote magenta sonda→Terra                      | segue de volta            | resposta leva outro dia    | espaço
// first | casca de 1 dia-luz + onda dourada               | close na sonda            | marco inédito              | espaço
// d18   | HUD 18 NOV                                      | órbita lateral            | data                       | espaço
// pow   | RTG brilha                                      | close lateral             | energia nuclear            | espaço
// offi  | luzes dos instrumentos apagam, uma fica verde   | vista de cima             | economia de energia        | espaço
// v2    | Voyager 2 mais perto                            | vai até a 2               | só em 2035                 | espaço
// mors  | Terra à noite, luzes piscando V-G-R             | vai à Terra               | celebração                 | Terra noturna
// old   | puxa para o sistema inteiro                     | recuo longo               | fecho                      | azul-marinho
import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {Line2} from 'three/addons/lines/Line2.js';
import {LineMaterial} from 'three/addons/lines/LineMaterial.js';
import {LineGeometry} from 'three/addons/lines/LineGeometry.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
const W=1080,H=1920;
const D=await (await fetch('/words.json')).json(); const C=D.cues, WORDS=D.words;
const clamp=(x,a=0,b=1)=>Math.min(Math.max(x,a),b), sm=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10)}, lerp=(a,b,k)=>a+(b-a)*k;
const hs=(i,s=0)=>{const x=Math.sin(i*127.1+s*311.7)*43758.5453;return x-Math.floor(x)};
const V3=(x,y,z)=>new THREE.Vector3(x,y,z);
const renderer=new THREE.WebGLRenderer({canvas:document.getElementById('gl'),antialias:false,logarithmicDepthBuffer:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(1);renderer.setSize(W,H,false);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=0.9;
const scene=new THREE.Scene();scene.background=new THREE.Color(0x01030a);
const pm=new THREE.PMREMGenerator(renderer);scene.environment=pm.fromScene(new RoomEnvironment(),0.04).texture;scene.environmentIntensity=0.22;
const cam=new THREE.PerspectiveCamera(40,W/H,0.3,400000);
const comp=new EffectComposer(renderer);comp.setSize(W,H);comp.addPass(new RenderPass(scene,cam));
comp.addPass(new UnrealBloomPass(new THREE.Vector2(W/2,H/2),0.28,0.5,0.9));comp.addPass(new OutputPass());
// ---------- geometria do mundo (escala: 1 UA = 24 unidades) ----------
const AU=24, LD=173.14*AU;                       // 1 dia-luz = 173 UA
const dV=V3(.80,.55,-.23).normalize(); const P=dV.clone().multiplyScalar(LD*.998);
const dV2=V3(.75,-.45,.48).normalize(); const P2=dV2.clone().multiplyScalar(140*AU);
const EARTH=V3(AU,0,0);
// estrelas
{const g=new THREE.BufferGeometry(),p=[];for(let i=0;i<3500;i++){const u=hs(i,1)*2-1,a=hs(i,2)*6.2832,r=Math.sqrt(1-u*u);p.push(Math.cos(a)*r*150000,u*150000,Math.sin(a)*r*150000)}g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));
 var stars=new THREE.Points(g,new THREE.PointsMaterial({color:0xcfe0ff,size:2.6,sizeAttenuation:false}));scene.add(stars)}
function tex(draw,s=128){const c=document.createElement('canvas');c.width=c.height=s;const g=c.getContext('2d');draw(g,s);return new THREE.CanvasTexture(c)}
const softT=tex((g,s)=>{const r=g.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.4,'rgba(255,255,255,.4)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,s,s)});
function spr(col,op=1){const m=new THREE.SpriteMaterial({map:softT,color:col,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,opacity:op});const s=new THREE.Sprite(m);scene.add(s);return s}
// Sol
const sun=new THREE.Mesh(new THREE.SphereGeometry(7,48,32),new THREE.MeshBasicMaterial({color:0xffd27a}));scene.add(sun);
const sg1=spr(0xff9a30,.9),sg2=spr(0xffc060,.5);sg1.scale.setScalar(30);sg2.scale.setScalar(70);
const sunL=new THREE.PointLight(0xffe0b0,6,0,0);scene.add(sunL);
// planetas
const PL=[['Mercurio',.39,2.2,0x9a9a9a,1.2],['Venus',.72,3.2,0xe0c080,3.1],['Terra',1,3.4,0x2a6adf,0],['Marte',1.52,2.6,0xc1502e,4.4],['Jupiter',5.2,10,0xd8b080,2.2],['Saturno',9.5,9,0xe3cf9a,5.5],['Urano',19.2,6,0x8fd8e0,.8],['Netuno',30,6,0x3a5fe0,3.7]];
const planets=[];for(const [n,a,r,c,ang] of PL){const R=a*AU;const m=new THREE.Mesh(new THREE.SphereGeometry(r,32,20),new THREE.MeshStandardMaterial({color:c,roughness:.8,metalness:0,emissive:c,emissiveIntensity:.12}));m.position.set(Math.cos(ang)*R,0,Math.sin(ang)*R);if(n==='Terra')m.position.copy(EARTH);scene.add(m);planets.push(m);
 const pts=[];for(let i=0;i<=160;i++){const t=i/160*6.2832;pts.push(Math.cos(t)*R,0,Math.sin(t)*R)}const lg=new LineGeometry();lg.setPositions(pts);const lm=new LineMaterial({color:0x5b8de0,linewidth:3,transparent:true,opacity:.85});lm.resolution.set(W,H);scene.add(new Line2(lg,lm));
 if(n==='Saturno'){const rg=new THREE.Mesh(new THREE.RingGeometry(r*1.4,r*2.2,64),new THREE.MeshBasicMaterial({color:0xcdb98a,side:THREE.DoubleSide,transparent:true,opacity:.7}));rg.rotation.x=1.3;m.add(rg)}}
// trajetória da Voyager 1 (da Terra até a sonda)
{const pts=[];for(let i=0;i<=120;i++){const s=i/120;const p=EARTH.clone().lerp(P,s);p.y+=Math.sin(s*Math.PI)*60;pts.push(p.x,p.y,p.z)}const lg=new LineGeometry();lg.setPositions(pts);const lm=new LineMaterial({color:0xf2c14e,linewidth:5,transparent:true,opacity:.95});lm.resolution.set(W,H);var path=new Line2(lg,lm);scene.add(path)}
// casca de 1 dia-luz
const shell=new THREE.Mesh(new THREE.SphereGeometry(LD,36,22),new THREE.MeshBasicMaterial({color:0x2fd6ff,wireframe:true,transparent:true,opacity:.06,depthWrite:false,blending:THREE.AdditiveBlending}));scene.add(shell);
// ---------- sonda Voyager ----------
const gold=new THREE.MeshStandardMaterial({color:0xd9a73a,metalness:.9,roughness:.32}),white=new THREE.MeshStandardMaterial({color:0xe6e8ec,metalness:.3,roughness:.5,side:THREE.DoubleSide}),dk=new THREE.MeshStandardMaterial({color:0x2a2d33,metalness:.6,roughness:.5}),rtgM=new THREE.MeshStandardMaterial({color:0x5a5f68,metalness:.7,roughness:.45,emissive:0xff6a1a,emissiveIntensity:0});
function mkProbe(){const g=new THREE.Group();const inner=new THREE.Group();g.add(inner);
 const dish=new THREE.Mesh(new THREE.SphereGeometry(5.4,48,18,0,6.2832,0,1.05),white);dish.rotation.x=-Math.PI/2;inner.add(dish);
 const bus=new THREE.Mesh(new THREE.CylinderGeometry(2.3,2.3,1.6,10),gold);bus.rotation.x=Math.PI/2;bus.position.z=-3;inner.add(bus);
 const horn=new THREE.Mesh(new THREE.ConeGeometry(.5,1.4,12),gold);horn.rotation.x=Math.PI/2;horn.position.z=2.6;inner.add(horn);
 const sup=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,6,6),dk);sup.rotation.x=Math.PI/2;sup.position.z=-.2;inner.add(sup);
 const rtgB=new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,11,8),dk);rtgB.rotation.z=Math.PI/2;rtgB.position.set(-6.5,0,-3.4);inner.add(rtgB);
 for(let i=0;i<3;i++){const r=new THREE.Mesh(new THREE.CylinderGeometry(.7,.7,2.2,14),rtgM);r.rotation.z=Math.PI/2;r.position.set(-9.5+i*2.4,0,-3.4);inner.add(r)}
 const sci=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,13,6),dk);sci.rotation.z=Math.PI/2;sci.position.set(7,0,-3.4);inner.add(sci);
 const tip=new THREE.Mesh(new THREE.BoxGeometry(1.6,1.6,1.6),gold);tip.position.set(13.5,0,-3.4);inner.add(tip);
 const mag=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,18,6),dk);mag.position.set(0,-9.5,-3.4);inner.add(mag);
 for(const s of[-1,1]){const a=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,10,6),dk);a.position.set(s*3.5,6,-3.4);a.rotation.z=s*.5;inner.add(a)}
 const L=[];for(let i=0;i<4;i++){const b=new THREE.Mesh(new THREE.SphereGeometry(.28,12,8),new THREE.MeshBasicMaterial({color:0x31ff9a}));const a=i/4*6.2832;b.position.set(Math.cos(a)*1.7,Math.sin(a)*1.7,-2.1);inner.add(b);L.push(b)}
 g.userData={inner,L,rtgM};return g}
const probe=mkProbe(),probe2=mkProbe();probe2.scale.setScalar(.8);scene.add(probe,probe2);
const keyL=new THREE.DirectionalLight(0xffe2b8,2.2);scene.add(keyL,keyL.target);const rimL=new THREE.DirectionalLight(0x6aa8ff,.9);scene.add(rimL,rimL.target);
scene.add(new THREE.HemisphereLight(0x3a5a99,0x0a0a14,.35));
// ---------- pulso de luz / pacote ----------
const pulse=spr(0xdff6ff,1),pulseTail=[];for(let i=0;i<14;i++)pulseTail.push(spr(0x9fe8ff,.6));
const packet=new THREE.Mesh(new THREE.BoxGeometry(5,5,5),new THREE.MeshBasicMaterial({color:0x2fd6ff}));scene.add(packet);const pk2=spr(0x2fd6ff,.9);
const burst=spr(0xffd36a,1);const shock=new THREE.Mesh(new THREE.TorusGeometry(1,.05,8,64),new THREE.MeshBasicMaterial({color:0xfff0b0,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));scene.add(shock);
const sweep=new THREE.Mesh(new THREE.PlaneGeometry(500,500),new THREE.MeshBasicMaterial({color:0x2fd6ff,transparent:true,opacity:.0,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false}));scene.add(sweep);
const sweepEdge=new THREE.Mesh(new THREE.PlaneGeometry(4000,.8),new THREE.MeshBasicMaterial({color:0xbff6ff,transparent:true,opacity:0,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false}));scene.add(sweepEdge);
// ---------- Terra grande (cena das luzes) ----------
const BE=V3(0,0,-30000),BR=2200;
const NOISE=`float h3(vec3 p){p=fract(p*0.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float n3(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*n3(p);p*=2.03;a*=.5;}return s;}`;
const bigEarth=new THREE.Mesh(new THREE.SphereGeometry(BR,128,96),new THREE.ShaderMaterial({uniforms:{uT:{value:0},uSun:{value:V3(-.9,.18,-.38).normalize()}},
 vertexShader:`varying vec3 vW;varying vec3 vL;varying vec3 vNW;void main(){vL=position;vNW=normalize(mat3(modelMatrix)*position);vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,
 fragmentShader:`${NOISE} uniform float uT;uniform vec3 uSun;varying vec3 vW;varying vec3 vL;varying vec3 vNW;
 void main(){vec3 n=normalize(vL);vec3 d=n*3.;float land=fbm(d*1.1+4.)+.35*fbm(d*5.);float coast=smoothstep(.52,.56,land);
  vec3 ocean=mix(vec3(.0,.1,.45),vec3(.0,.3,.7),fbm(d*8.));vec3 grass=mix(vec3(.05,.35,.12),vec3(.5,.42,.15),fbm(d*4.+9.));vec3 col=mix(ocean,grass,coast);
  float cl=smoothstep(.5,.78,fbm(d*3.+20.));col=mix(col,vec3(.9),cl*.5);
  float dl=dot(vNW,uSun);float day=smoothstep(-.12,.2,dl);vec3 lit=col*(.15+.9*clamp(dl,0.,1.));
  float city=step(.74,fbm(d*14.+3.))*coast*smoothstep(.55,.6,fbm(d*2.+1.));vec3 night=col*.04+vec3(1.,.7,.3)*city*1.6;
  vec3 c=mix(night,lit,day);vec3 V=normalize(cameraPosition-vW);float fr=pow(1.-clamp(dot(normalize(vW-${'vec3(0.,0.,-30000.)'}),V),0.,1.),3.);c+=vec3(.2,.45,1.)*fr*.6;gl_FragColor=vec4(c,1.);}`}));
bigEarth.position.copy(BE);scene.add(bigEarth);
const beAtm=new THREE.Mesh(new THREE.SphereGeometry(BR*1.03,64,48),new THREE.ShaderMaterial({transparent:true,side:THREE.BackSide,depthWrite:false,blending:THREE.AdditiveBlending,
 vertexShader:`varying vec3 vN;void main(){vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`varying vec3 vN;void main(){float i=pow(max(.62-dot(vN,vec3(0,0,1)),0.),3.5)*5.;gl_FragColor=vec4(vec3(.3,.6,1.)*i,i);}`}));beAtm.position.copy(BE);scene.add(beAtm);
const beLights=[];for(let i=0;i<7;i++){const s=spr(0xffd890,1);beLights.push(s)}
// código Morse: V ...-   G --.   R .-.
const U=.19;const MORSE=[];{let t=0;for(const w of ['...-','--.','.-.']){for(const c of w){const d=c==='.'?U:3*U;MORSE.push([t,t+d]);t+=d+U}t+=2*U}}
function morseOn(t){const a=t-(C.mors+1.2);if(a<0)return 0;for(const [s,e] of MORSE)if(a>=s&&a<e)return 1;return 0}
// ---------- poses ----------
const pulsePos=t=>{ if(t<C.day){const k=sm((t-(C.sun8+.4))/1.9);return V3(AU*k,0,0)} const k=sm((t-C.day)/(C.cmd-C.day-.2));return dV.clone().multiplyScalar(LD*k)};
const packPos=t=>{ if(t<C.back){const k=sm((t-C.cmd)/(C.back-C.cmd));return EARTH.clone().lerp(P,k)} const k=sm((t-C.back)/(C.first-C.back-.4));return P.clone().lerp(EARTH,k)};
function target(n,t){switch(n){
 case 'probe':return P.clone();case 'v2':return P2.clone();case 'sys2':return P.clone().multiplyScalar(.5);case 'inner':return V3(12,0,0);
 case 'pulse':return pulsePos(t);case 'packet':return packPos(t);case 'bigEarth':return BE.clone();case 'sys3':return P.clone().multiplyScalar(.45)}return V3()}
const K=[['teaser',0,'probe',34,-25,6,36,1],['imp',-.1,'probe',27,38,8,32,.4],['imp',1.6,'probe',44,72,16,38,1.3],
 ['name',.1,'probe',58,-62,10,40,1.2],['km',0,'sys2',9400,0,72,50,2.0],['sun8',0,'inner',150,22,55,40,1.5],
 ['day',-.2,'pulse',170,-50,12,40,1.0],['cmd',.2,'packet',170,40,14,40,1.2],['back',0,'packet',170,-30,18,40,1.0],
 ['first',0,'probe',46,-20,8,38,1.4],['d18',.2,'probe',62,80,22,38,1.2],['pow',0,'probe',28,125,12,34,1.1],['offi',0,'probe',25,-20,52,34,1.1],
 ['v2',0,'v2',64,30,15,40,1.3],['mors',0,'bigEarth',9200,2,14,40,1.6],['old',0,'sys3',11500,10,52,50,2.2],['cmt',0,'probe',80,40,10,38,1.4]];
function cbez(x1,y1,x2,y2){return k=>{if(k<=0)return 0;if(k>=1)return 1;let lo=0,hi=1,u=k;for(let i=0;i<22;i++){const x=3*(1-u)*(1-u)*u*x1+3*(1-u)*u*u*x2+u*u*u;if(x<k)lo=u;else hi=u;u=(lo+hi)/2}return 3*(1-u)*(1-u)*u*y1+3*(1-u)*u*u*y2+u*u*u}}
const EASE=[cbez(.65,0,.35,1),cbez(.08,.9,.2,1),cbez(.34,1.5,.64,1),cbez(.8,0,.2,1)];
const ROLL={imp:4,day:-6,cmd:5,mors:-4,first:5};
const KT=K.map((k,i)=>({e:[1,0,2,3][i%4],roll:(ROLL[k[0]]||0)*Math.PI/180*(k[1]>0?-1:1),t:(C[k[0]]??0)+k[1],tg:k[2],d:k[3],az:k[4]*Math.PI/180,el:k[5]*Math.PI/180,fov:k[6],dur:k[7]}));
function camPose(t){let j=0;for(let i=0;i<KT.length;i++){if(KT[i].t-KT[i].dur*.75<=t)j=i}
 const b=KT[j],a=KT[Math.max(j-1,0)];const k=j===0?1:EASE[b.e]((t-(b.t-b.dur*.75))/b.dur);
 const tg=target(a.tg,t).lerp(target(b.tg,t),k);const dt=Math.max(t-b.t,0);
 const d=Math.exp(lerp(Math.log(a.d),Math.log(b.d*(1-.04*clamp(dt/4))),k)),az=lerp(a.az,b.az+dt*.05,k),el=lerp(a.el,b.el,k),fov=lerp(a.fov,b.fov,k),roll=lerp(a.roll,b.roll,k);
 return{tg,d,az,el,fov,roll}}
function shakeAmt(t){let s=clamp(1-Math.abs(t-C.imp-.2)/.7)*2.2;s+=clamp(1-Math.abs(t-C.first-.3)/.6)*1.2;s+=t<C.imp?.5*(t/C.imp):0;return s}
// ---------- legenda e HUD ----------
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
function setT(t){
 const sp=1;
 // sonda 1: gira devagar, de frente para o Sol
 probe.position.copy(P);probe.lookAt(0,0,0);probe.userData.inner.rotation.z=t*.12;
 probe2.position.copy(P2);probe2.lookAt(0,0,0);probe2.userData.inner.rotation.z=-t*.1;
 const kd=P.clone().normalize().multiplyScalar(-1).add(V3(-.5,.55,.35)).normalize();keyL.position.copy(P).addScaledVector(kd,200);keyL.target.position.copy(P);
 rimL.position.copy(P).add(V3(.6,-.4,-.7).multiplyScalar(200));rimL.target.position.copy(P);
 sun.visible=sg1.visible=sg2.visible=true;
 // luzes dos instrumentos (offi): apagam uma a uma, uma fica verde
 {const a=t-C.offi;const L=probe.userData.L;L.forEach((b,i)=>{const off=a>1.0+i*.9&&i<3;b.material.color.set(off?0x2a2d33:0x31ff9a);b.scale.setScalar(off?.8:1+.2*Math.sin(t*5))})}
 probe.userData.rtgM.emissiveIntensity=t>=C.pow&&t<C.offi?1.2+.5*Math.sin(t*4):.05;
 // impacto do gancho: linha ciano varre a sonda
 {const a=t-C.imp;const on=a>=-.05&&a<1.2;const k=clamp(a/.5);sweep.visible=sweepEdge.visible=on;if(on){const x=P.x+lerp(-120,120,k);sweep.position.set(x,P.y,P.z);sweep.rotation.y=Math.PI/2;sweep.material.opacity=0;sweepEdge.position.copy(sweep.position);sweepEdge.rotation.y=Math.PI/2;sweepEdge.rotation.z=Math.PI/2;sweepEdge.material.opacity=1-clamp(a/1.2)}
  shock.visible=a>=0&&a<1.4;if(shock.visible){const k2=a/1.4;shock.position.copy(P);shock.lookAt(P.clone().add(V3(1,.2,0)));shock.scale.setScalar(2+70*(1-Math.pow(1-k2,3)));shock.material.opacity=.7*(1-k2)}}
 // celebração
 {const a=t-C.first;burst.visible=a>=0&&a<2.2;if(burst.visible){burst.position.copy(P);burst.scale.setScalar(10+22*Math.sin(Math.min(a*2,1.57))*(1-a/2.2));burst.material.opacity=.35*(1-a/2.2)}}
 shell.material.opacity=lerp(.05,.2,sm((t-C.first+.5)/.8))*(t>=C.km?1:.0)*(t>=C.old-.5?.5:1);shell.visible=(t>=C.km&&t<C.sun8-.6)||t>=C.first-.5;
 path.visible=t>=C.km-.3&&t<C.mors;
 // pulso
 {const on=(t>=C.sun8+.2&&t<C.sun8+2.6)||(t>=C.day&&t<C.cmd);const p0=pulsePos(t);pulse.visible=on;pulse.position.copy(p0);pulse.scale.setScalar(on?(t<C.day?10:40):1);
  pulseTail.forEach((s,i)=>{s.visible=on;const back=(i+1)*(t<C.day?1.2:45);const dir=t<C.day?V3(1,0,0):dV;s.position.copy(p0).addScaledVector(dir,-back);s.scale.setScalar((t<C.day?8:30)*(1-i/16));s.material.opacity=.6*(1-i/14)})}
 // pacote
 {const on=t>=C.cmd&&t<C.first-.3;packet.visible=pk2.visible=on;const pp=packPos(t);packet.position.copy(pp);pk2.position.copy(pp);packet.material.color.set(t<C.back?0x2fd6ff:0xff4fd8);pk2.material.color.set(t<C.back?0x2fd6ff:0xff4fd8);pk2.scale.setScalar(60);packet.scale.setScalar(4);packet.rotation.set(t*2,t*3,0)}
 // Terra grande + luzes piscando
 bigEarth.material.uniforms.uT.value=t;
 beLights.forEach((s,i)=>{const on=morseOn(t);const a=hs(i,3)*2-1,b=hs(i,4)*1.2-.6;const x=BR*Math.sin(a*.7)*Math.cos(b*.5),y=BR*Math.sin(b*.5),z=BR*Math.cos(a*.7)*Math.cos(b*.5);
  s.position.set(BE.x+x*.98,BE.y+y*.98,BE.z+z*.98+0);s.visible=t>=C.mors;s.scale.setScalar(on?260:30);s.material.opacity=on?1:.15});
 // HUD
 hudT('h15','1977',t,C.y77,C.y77+2.4,300);hudT('hfirst','25,9 BI KM',t,C.km,C.km+3.2,150);
 hudT('hq','8 MIN',t,C.sun8,C.sun8+2.6,240);
 {const e=$('hclock');const on=t>=C.day+.8&&t<C.cmd+.2;const k=on?sm((t-C.day-.8)/.4):0;e.style.opacity=k;e.style.transform=`scale(${.7+.3*k})`;$('arc').style.strokeDashoffset=276.5*(1-clamp((t-C.day-.8)/(C.cmd-C.day-1)));e.querySelector('.big').textContent='24 H'}
 hudT('hx','+24 H',t,C.back+.6,C.back+3.0,230);
 hudT('title2','18 NOV',t,C.d18,C.d18+2.8,240);hudT('title3','2035',t,C.v2,C.v2+2.6,300);hudT('title4','V G R',t,C.mors+.2,C.mors+3.0,260);
 // título de capa
 {const e=$('title');e.style.fontSize='80px';e.innerHTML='VOYAGER 1<br><b>1 DIA-LUZ DA TERRA</b>';const k=t<3.6?1:1-sm((t-3.6)/.5);e.style.opacity=k;const pu=t>=C.imp?.16*Math.exp(-(t-C.imp)*7):0;e.style.transform=`translateY(${(1-k)*-60}px) scale(${(1+pu)*(1+(1-k)*.1)})`}
 // CTA
 {const on=t>=C.cmt-.2;$('dim').style.opacity=on?.82*sm((t-C.cmt+.2)/.6):0;
  const inCmt=t>=C.cmt&&t<C.seg-.1;const c=$('cmt');c.style.opacity=inCmt?sm((t-C.cmt)/.3)*(1-sm((t-C.seg+.4)/.25)):0;c.style.transform=`translateY(${(1-sm((t-C.cmt)/.3))*80}px)`;
  const word='ARQUIVO',n=Math.floor(clamp((t-C.cmt-.5)/.5)*word.length);$('typed').textContent=word.slice(0,n);
  const p=$('prof');const pk=sm((t-C.seg+.1)/.4);p.style.opacity=pk;p.style.transform=`scale(${.7+.3*pk})`;
  const tc=C.seg+.95;const fb=$('fbtn');const done=t>=tc;fb.textContent=done?'Seguindo ✓':'Seguir';fb.style.background=done?'#fff':'#01FBB4';fb.style.transform=`scale(${1-.12*clamp(1-Math.abs(t-tc)/.12)})`;
  const cur=$('cur');const ck=sm((t-C.seg)/.9);cur.style.opacity=t>=C.seg&&t<tc+1.4?1:0;const fx=lerp(900,590,ck),fy=lerp(1500,1050,ck);cur.style.transform=`translate(${fx}px,${fy}px) scale(${1-.12*clamp(1-Math.abs(t-tc)/.12)})`;
  const d=$('dm');const dk=sm((t-C.msg)/.35);d.style.opacity=dk;d.style.transform=`scale(${.6+.4*dk}) translateY(${(1-dk)*60}px)`}
 // câmera
 const cp=camPose(t);cam.fov=cp.fov;cam.updateProjectionMatrix();
 const cx=Math.sin(cp.az)*Math.cos(cp.el),cy=Math.sin(cp.el),cz=Math.cos(cp.az)*Math.cos(cp.el);const sh=shakeAmt(t)*Math.min(cp.d,60)*.01;
 cam.position.set(cp.tg.x+cx*cp.d+Math.sin(t*37)*sh,cp.tg.y+cy*cp.d+Math.cos(t*29)*sh,cp.tg.z+cz*cp.d);cam.lookAt(cp.tg);cam.rotateZ(cp.roll);cam.setViewOffset(W,H,0,H*.07,W,H);
 stars.position.copy(cam.position);
 $('flash').style.opacity=clamp(1-Math.abs(t-C.imp)/.1)*.35;$('rew').style.opacity=0;
 caption(t);comp.render();
}
window.setT=setT;window.__ready=true;
