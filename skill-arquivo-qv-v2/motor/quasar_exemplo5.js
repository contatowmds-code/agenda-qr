// PLANO (v5) (palavra-foco | cena | câmera | por quê | fundo)
// imp  | chip GPU com onda de choque e pulsos nas trilhas | push/soco | gancho: "abrir as contas" | azul-petróleo escuro
// date | calendário flutuando sobre skyline ao entardecer | sobe/gira | dia 17, bolsa fecha à tarde | céu de pôr do sol
// q    | linha do tempo AGO·SET·OUT                         | lateral    | período do balanço | azul-marinho de diagrama
// rev  | barra verde sobe até a meta, faixa ±2%             | de baixo p/ cima | previsão de receita | azul-marinho com grade
// mar  | 100 moedas: 26 vermelhas caem, 74 verdes sobem     | de cima    | margem bruta = o que sobra | roxo-escuro
// dc   | corredor de racks de servidor, câmera voa          | travelling | centros de dados | quase preto com LEDs
// cn   | chip tenta passar por portão vermelho "CHINA"       | lateral    | previsão sem China | cinza-azulado escuro
// beat | medidor: ponteiro ultrapassa a marca da previsão   | frontal    | bater a previsão | azul-noite
// mkt  | candles subindo, linha de preço                    | panorâmica | mexe com mercado | verde-petróleo escuro
// end  | volta ao chip, ondas de energia, recuo             | recuo      | fecho | azul-petróleo
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
const scene=new THREE.Scene();scene.background=new THREE.Color(0x02060c);
const pm=new THREE.PMREMGenerator(renderer);scene.environment=pm.fromScene(new RoomEnvironment(),0.04).texture;scene.environmentIntensity=0.5;
const cam=new THREE.PerspectiveCamera(40,W/H,0.3,20000);
const comp=new EffectComposer(renderer);comp.setSize(W,H);comp.addPass(new RenderPass(scene,cam));comp.addPass(new UnrealBloomPass(new THREE.Vector2(W/2,H/2),0.3,0.5,0.88));comp.addPass(new OutputPass());
const key=new THREE.DirectionalLight(0xfff0dd,3.0);key.position.set(60,120,90);scene.add(key);scene.add(new THREE.HemisphereLight(0x8fb4ff,0x20242c,.7));
const rim=new THREE.DirectionalLight(0x6ab4ff,1.0);rim.position.set(-80,40,-90);scene.add(rim);
function tex(draw,w=256,h=256){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');draw(g,w,h);const t=new THREE.CanvasTexture(c);t.anisotropy=4;return t}
const softT=tex((g,s)=>{const r=g.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.4,'rgba(255,255,255,.4)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,s,s)},128,128);
function spr(col,op=1){const m=new THREE.SpriteMaterial({map:softT,color:col,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,opacity:op});const s=new THREE.Sprite(m);scene.add(s);return s}
const LOC=i=>V3(1000*i,0,0);
function backdrop(i,top,mid,low,stars=false){const m=new THREE.Mesh(new THREE.SphereGeometry(700,32,20),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,depthTest:false,uniforms:{a:{value:new THREE.Color(top)},b:{value:new THREE.Color(mid)},c:{value:new THREE.Color(low)}},
 vertexShader:`varying vec3 vD;void main(){vD=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`uniform vec3 a,b,c;varying vec3 vD;void main(){float h=vD.y;vec3 col=mix(c,b,smoothstep(-.3,.15,h));col=mix(col,a,smoothstep(.1,.8,h));gl_FragColor=vec4(col,1.);}`}));m.position.copy(LOC(i));m.renderOrder=-10;scene.add(m);
 if(stars){const g=new THREE.BufferGeometry(),p=[];for(let k=0;k<400;k++){const u=hs(k,i)*2-1,a=hs(k,i+9)*6.28,r=Math.sqrt(1-u*u);p.push(Math.cos(a)*r*650,Math.abs(u)*650,Math.sin(a)*r*650)}g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));const s=new THREE.Points(g,new THREE.PointsMaterial({color:0xffffff,size:2,sizeAttenuation:false}));s.position.copy(LOC(i));scene.add(s)}return m}
function floorGrid(i,col=0x2a5aa0,y=0,size=600,op=.5){const g=new THREE.GridHelper(size,60,col,col);g.material.transparent=true;g.material.opacity=op;g.position.copy(LOC(i));g.position.y=y;scene.add(g);return g}
function label(txt,w=256,h=96,fg='#fff',bg='rgba(0,0,0,0)',fs=64){return tex((g,W_,H_)=>{g.fillStyle=bg;g.fillRect(0,0,W_,H_);g.fillStyle=fg;g.font=`900 ${fs}px sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText(txt,W_/2,H_/2)},w,h)}
const metal=(c,m=.9,r=.3)=>new THREE.MeshStandardMaterial({color:c,metalness:m,roughness:r});
// PLANO DE CENA (estilo do vídeo aprovado: realista, espaço)
// imp  | quasar: buraco negro + disco + jatos, flash/onda | soco de aproximação | gancho | espaço profundo
// bh   | matéria em espiral caindo no buraco negro        | órbita              | o que é quasar
// euc  | telescópio Euclid com escudo solar, Terra e Sol ao fundo | órbita lenta | apresenta o instrumento
// n31  | 31 pontos brilham um a um, 2 dourados             | revela/afasta       | achou 31
// age  | linha do tempo Big Bang → hoje, pulso de luz      | frontal larga       | 670 milhões de anos
// red  | onda azul esticada até ficar vermelha (x8,8)      | frontal             | redshift
// fast | 10 pontos em uma década x 12 em 1 ano             | frontal             | rapidez da descoberta
// puzzle | semente de buraco negro cresce rápido demais, ?  | aproxima            | enigma
// pub  | artigo científico flutuando                       | lateral             | publicação
// cav  | régua com faixa de incerteza                      | frontal             | cautela
// end  | teia cósmica, quasares brilhando, recuo           | recuo longo         | fecho

const S_=(i)=>LOC(i);
// ===== L0: QUASAR =====
backdrop(0,0x00020a,0x020a1e,0x061436,true);
const A0=new THREE.Group();A0.position.copy(LOC(0));A0.rotation.x=.42;scene.add(A0);
A0.add(new THREE.Mesh(new THREE.SphereGeometry(7,48,32),new THREE.MeshBasicMaterial({color:0x000000})));
const diskMat=new THREE.ShaderMaterial({transparent:true,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{uT:{value:0}},
 vertexShader:`varying vec2 vP;void main(){vP=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`uniform float uT;varying vec2 vP;void main(){float r=length(vP);float a=atan(vP.y,vP.x);float t=smoothstep(36.,9.,r);float sw=.55+.45*sin(a*6.+r*.5-uT*3.);vec3 col=mix(vec3(1.,.35,.05),vec3(1.,.95,.8),t*t)*sw*t*.7;gl_FragColor=vec4(col,t*(.4+.6*sw));}`});
const disk=new THREE.Mesh(new THREE.RingGeometry(9,36,128,4),diskMat);disk.rotation.x=-Math.PI/2;A0.add(disk);
for(const s of[-1,1]){const j=new THREE.Mesh(new THREE.ConeGeometry(7,150,24,1,true),new THREE.MeshBasicMaterial({color:0x9fd0ff,transparent:true,opacity:.38,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));j.position.y=s*78;j.rotation.x=s>0?Math.PI:0;A0.add(j)}
const glowQ=spr(0xff8a30,.9);const glowQ2=spr(0xaad8ff,.5);
const streams=[];for(let i=0;i<46;i++)streams.push(spr(0xffb060,.9));
const shockQ=new THREE.Mesh(new THREE.TorusGeometry(1,.05,8,64),new THREE.MeshBasicMaterial({color:0xcfe6ff,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));shockQ.rotation.x=Math.PI/2;A0.add(shockQ);
// ===== L1: EUCLID =====
backdrop(1,0x01020a,0x04102a,0x0a2048,true);
const B1=new THREE.Group();B1.position.copy(LOC(1));scene.add(B1);
{const gold=metal(0xd9a73a,.9,.35),white=metal(0xe8eaee,.4,.45);const body=new THREE.Mesh(new THREE.CylinderGeometry(9,9,7,6),gold);B1.add(body);
 const tube=new THREE.Mesh(new THREE.CylinderGeometry(4.5,4.5,18,24),white);tube.position.y=12;B1.add(tube);
 const mir=new THREE.Mesh(new THREE.CylinderGeometry(4,4,.4,24),metal(0x101826,.9,.1));mir.position.y=21.2;B1.add(mir);
 const sh=new THREE.Mesh(new THREE.BoxGeometry(48,.8,34),new THREE.MeshStandardMaterial({color:0x1c3f9a,metalness:.7,roughness:.35,emissive:0x0a1a40,emissiveIntensity:.5}));sh.position.y=-6;sh.rotation.z=.18;B1.add(sh);
 const ant=new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,9,8),metal(0x222222,.6,.5));ant.position.set(6,-2,-6);ant.rotation.z=.5;B1.add(ant);
 const earthF=new THREE.Mesh(new THREE.SphereGeometry(9,32,24),new THREE.MeshStandardMaterial({color:0x2a6adf,roughness:.7,emissive:0x0a2a6a,emissiveIntensity:.5}));earthF.position.set(-190,-50,-260);B1.add(earthF);
 const sunF=spr(0xffd9a0,1);sunF.visible=true;sunF.scale.setScalar(160);sunF.position.copy(LOC(1)).add(V3(260,110,-380))}
// ===== L2: 31 QUASARES =====
backdrop(2,0x00020a,0x030a1e,0x07163a,true);
const C2=new THREE.Group();C2.position.copy(LOC(2));scene.add(C2);const qs=[];
for(let i=0;i<160;i++){const s=spr(i%3?0x9fb8ff:0xffc9a0,.35);s.scale.setScalar(3+hs(i,5)*6);s.position.copy(LOC(2)).add(V3((hs(i,1)-.5)*340,(hs(i,2)-.5)*220,(hs(i,3)-.5)*160-30))}
for(let i=0;i<31;i++){const gold=i<2;const col=gold?0xffd35a:0xcfe6ff;const m=new THREE.Mesh(new THREE.SphereGeometry(gold?3:1.8,16,12),new THREE.MeshBasicMaterial({color:col}));const p=V3((hs(i,11)-.5)*230,(hs(i,12)-.5)*140,(hs(i,13)-.5)*90);m.position.copy(p);C2.add(m);const g=spr(col,.9);g.position.copy(LOC(2)).add(p);qs.push([m,g,gold])}
// ===== L3: LINHA DO TEMPO =====
backdrop(3,0x01030c,0x041030,0x0a2050,true);
const D3=new THREE.Group();D3.position.copy(LOC(3));scene.add(D3);
D3.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(1.2,200,1.2),new THREE.MeshBasicMaterial({color:0x6a8ad0})),{}));
const bang=spr(0xffffff,1);const rec=new THREE.Mesh(new THREE.SphereGeometry(4.2,20,14),new THREE.MeshBasicMaterial({color:0xffd35a}));rec.position.set(0,-90,0);D3.add(rec);
const earthT=new THREE.Mesh(new THREE.SphereGeometry(10,32,24),new THREE.MeshStandardMaterial({color:0x2a6adf,roughness:.7,emissive:0x0a2a6a,emissiveIntensity:.5}));earthT.position.set(0,100,0);D3.add(earthT);
function lbl(txt,x,y,w=60){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,w*.3),new THREE.MeshBasicMaterial({map:label(txt,256,76,'#fff','rgba(0,0,0,0)',58),transparent:true}));m.position.set(x,y,0);D3.add(m)}
lbl('BIG BANG',44,-100,70);lbl('670 MI',40,-80,62);lbl('HOJE',34,104,50);
const pulseT=spr(0xffe9b0,1);
// ===== L4: REDSHIFT =====
backdrop(4,0x01030c,0x03102a,0x08204a);
const E4=new THREE.Group();E4.position.copy(LOC(4));scene.add(E4);
import {Line2} from 'three/addons/lines/Line2.js';import {LineMaterial} from 'three/addons/lines/LineMaterial.js';import {LineGeometry} from 'three/addons/lines/LineGeometry.js';
function mkWave(col,lw){const g=new LineGeometry();g.setPositions(new Float32Array(3*160).fill(0));const m=new LineMaterial({color:col,linewidth:lw,transparent:true});m.resolution.set(W,H);const l=new Line2(g,m);E4.add(l);return l}
const waveA=mkWave(0x4aa8ff,7),waveB=mkWave(0xff4a3a,7);
function setWave(l,wl,y,amp,ph){const p=[];for(let i=0;i<160;i++){const x=-100+i*200/159;p.push(x,y+Math.sin(x/wl*6.2832+ph)*amp,0)}l.geometry.setPositions(p)}
lbl2();function lbl2(){}
// ===== L5: COMPARAÇÃO =====
backdrop(5,0x01030c,0x041030,0x0a2050,true);
const F5=new THREE.Group();F5.position.copy(LOC(5));scene.add(F5);const dots1=[],dots2=[];
F5.add(new THREE.Mesh(new THREE.BoxGeometry(130,1,1),new THREE.MeshBasicMaterial({color:0x6a8ad0})));{const b=new THREE.Mesh(new THREE.BoxGeometry(130,1,1),new THREE.MeshBasicMaterial({color:0x6a8ad0}));b.position.y=-34;F5.add(b)}
for(let i=0;i<10;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(2.6,16,12),new THREE.MeshBasicMaterial({color:0xcfe6ff}));m.position.set(-58+i*13,10,0);F5.add(m);dots1.push(m)}
for(let i=0;i<12;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(2.6,16,12),new THREE.MeshBasicMaterial({color:0xffd35a}));m.position.set(-58+i*5.2,-24,0);F5.add(m);dots2.push(m)}
{const mk=(txt,y)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(60,18),new THREE.MeshBasicMaterial({map:label(txt,256,76,'#fff','rgba(0,0,0,0)',60),transparent:true}));m.position.set(0,y,0);F5.add(m)};mk('+10 ANOS',34);mk('1 ANO',-52)}
// ===== L6: ENIGMA =====
backdrop(6,0x00020a,0x040a22,0x0a1a46,true);
const G6=new THREE.Group();G6.position.copy(LOC(6));scene.add(G6);
const seed=new THREE.Mesh(new THREE.SphereGeometry(1,48,32),new THREE.MeshBasicMaterial({color:0x000000}));G6.add(seed);const ringS=new THREE.Mesh(new THREE.RingGeometry(1.4,2.2,64),new THREE.MeshBasicMaterial({color:0xffb060,side:THREE.DoubleSide,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false}));ringS.rotation.x=-1.2;G6.add(ringS);const glowS=spr(0xffa050,.8);
// ===== L7: ARTIGO =====
backdrop(7,0x01030c,0x061638,0x0c2a5a);
const H7=new THREE.Group();H7.position.copy(LOC(7));scene.add(H7);
const paperT=tex((g,w,h)=>{g.fillStyle='#f7f7f2';g.fillRect(0,0,w,h);g.fillStyle='#1b2a5a';g.fillRect(0,0,w,90);g.fillStyle='#fff';g.font='800 40px sans-serif';g.textAlign='center';g.fillText('ASTRONOMY',w/2,40);g.fillText('& ASTROPHYSICS',w/2,80);g.fillStyle='#9aa3b5';for(let y=130;y<h-30;y+=26){g.fillRect(34,y,w-68-(hs(y,3)>.7?90:0),10)}g.fillStyle='#d4a017';g.beginPath();g.arc(w-70,h-70,36,0,6.3);g.fill();g.fillStyle='#fff';g.font='900 30px sans-serif';g.fillText('ESA',w-70,h-60)},400,560);
const paper=new THREE.Mesh(new THREE.PlaneGeometry(40,56),new THREE.MeshStandardMaterial({map:paperT,roughness:.6,side:THREE.DoubleSide,emissive:0xffffff,emissiveMap:paperT,emissiveIntensity:.08}));H7.add(paper);
// ===== L8: RÉGUA =====
backdrop(8,0x01030c,0x041030,0x0a2050,true);
const I8=new THREE.Group();I8.position.copy(LOC(8));scene.add(I8);
I8.add(new THREE.Mesh(new THREE.BoxGeometry(140,1,1),new THREE.MeshBasicMaterial({color:0x6a8ad0})));for(let i=-7;i<=7;i++){const t=new THREE.Mesh(new THREE.BoxGeometry(.6,i%7===0?9:5,.6),new THREE.MeshBasicMaterial({color:0x9ab4e8}));t.position.set(i*10,0,0);I8.add(t)}
const mark=new THREE.Mesh(new THREE.SphereGeometry(3,20,14),new THREE.MeshBasicMaterial({color:0xffd35a}));mark.position.set(10,0,0);I8.add(mark);const band=new THREE.Mesh(new THREE.BoxGeometry(30,10,3),new THREE.MeshBasicMaterial({color:0xcfe6ff,transparent:true,opacity:.22,blending:THREE.AdditiveBlending,depthWrite:false}));band.position.set(10,0,0);I8.add(band);
// ===== L9: TEIA CÓSMICA =====
backdrop(9,0x00010a,0x020820,0x05122e,true);
const J9=new THREE.Group();J9.position.copy(LOC(9));scene.add(J9);
{const pts=[];const nodes=[];for(let k=0;k<22;k++)nodes.push(V3((hs(k,1)-.5)*340,(hs(k,2)-.5)*220,(hs(k,3)-.5)*220));
 for(let i=0;i<1100;i++){const a=nodes[Math.floor(hs(i,4)*22)],b=nodes[Math.floor(hs(i,5)*22)];const f=hs(i,6);pts.push(lerp(a.x,b.x,f)+(hs(i,7)-.5)*14,lerp(a.y,b.y,f)+(hs(i,8)-.5)*14,lerp(a.z,b.z,f)+(hs(i,9)-.5)*14)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));J9.add(new THREE.Points(g,new THREE.PointsMaterial({color:0x9fb8ff,size:2.2,sizeAttenuation:false,transparent:true,opacity:.85})));
 for(let k=0;k<12;k++){const s=spr(0xffe0a0,1);s.position.copy(LOC(9)).add(nodes[k]);s.scale.setScalar(26)}}
// ---------- poses e câmera ----------
const loc=i=>LOC(i);
function target(n,t){const m={q:0,euc:1,field:2,tl:3,wave:4,cmp:5,seed:6,paper:7,ruler:8,web:9};return loc(m[n]??0)}
const K=[['teaser',0,'q',330,-20,14,36,.01,''],['imp',-.1,'q',230,30,18,30,.35,''],['imp',1.0,'q',400,60,20,38,1.0,''],['bh',-.15,'q',250,-40,10,38,1.0,''],
 ['euc',-.1,'euc',230,-30,14,38,.01,'dip'],['euc',2.5,'euc',185,40,10,36,1.2,''],
 ['n31',-.1,'field',230,10,10,40,.01,'iris'],['n31',3.5,'field',170,-30,16,38,1.3,''],
 ['age',-.1,'tl',390,10,6,40,.01,'wipe'],['age',2.5,'tl',330,-18,8,38,1.2,''],
 ['red',-.1,'wave',250,0,6,40,.01,'dip'],['red',3.5,'wave',215,30,12,38,1.2,''],
 ['fast',-.1,'cmp',410,0,8,40,.01,'slide'],['fast',3.5,'cmp',360,-25,12,38,1.2,''],
 ['puzzle',-.1,'seed',150,20,10,38,.01,'iris'],['puzzle',2.0,'seed',110,-30,14,36,1.0,''],
 ['pub',-.1,'paper',120,-10,8,36,.01,'dip'],['pub',2.4,'paper',95,30,10,34,1.2,''],
 ['cav',-.1,'ruler',170,0,10,38,.01,'wipe'],['fim',-.1,'web',150,25,18,38,.01,'dip'],['fim',3.0,'web',540,-20,22,44,2.8,''],['cmt',0,'web',620,30,18,40,1.4,'']];
const ROLL={};
function cbez(x1,y1,x2,y2){return k=>{if(k<=0)return 0;if(k>=1)return 1;let lo=0,hi=1,u=k;for(let i=0;i<22;i++){const x=3*(1-u)*(1-u)*u*x1+3*(1-u)*u*u*x2+u*u*u;if(x<k)lo=u;else hi=u;u=(lo+hi)/2}return 3*(1-u)*(1-u)*u*y1+3*(1-u)*u*u*y2+u*u*u}}
const EASE=[cbez(.65,0,.35,1),cbez(.08,.9,.2,1),cbez(.34,1.5,.64,1),cbez(.8,0,.2,1)];
const KT=K.map((k,i)=>({e:[1,0,2,3][i%4],roll:0,t:(C[k[0]]??0)+k[1],tg:k[2],d:k[3],az:k[4]*Math.PI/180,el:k[5]*Math.PI/180,fov:k[6],dur:k[7],tr:k[8]}));
function camPose(t){let j=0;for(let i=0;i<KT.length;i++){if(KT[i].t-KT[i].dur*.75<=t)j=i}
 const b=KT[j],a=KT[Math.max(j-1,0)];const k=j===0?1:EASE[b.e](clamp((t-(b.t-b.dur*.75))/b.dur));
 const tg=target(a.tg,t).lerp(target(b.tg,t),k);const dt=Math.max(t-b.t,0);
 const d=Math.exp(lerp(Math.log(a.d),Math.log(b.d*(1-.05*clamp(dt/4))),k)),az=lerp(a.az,b.az+dt*.05,k),el=lerp(a.el,b.el,k),fov=lerp(a.fov,b.fov,k);return{tg,d,az,el,fov}}
const TR=KT.filter(k=>k.tr);
// transições de cena (cada uma diferente)

function transition(t){const e=document.getElementById('tr');let on=null;for(const k of TR){const a=t-(k.t-.05);if(a>-.28&&a<.32){on=[k,a]}}
 if(!on){e.style.opacity=0;return}const [k,a]=on;const p=sm((a+.28)/.6);const tri=1-Math.abs(p*2-1);e.style.opacity=1;
 const cols={dip:'#000',iris:'#000',wipe:'#000',slide:'#000',flash:'#fff'};e.style.background=cols[k.tr]||'#000';
 const T=k.tr;if(T==='wipe'||T==='wipe2'){const x=a<0?100-100*sm((a+.28)/.28):100*sm(a/.32);e.style.clipPath=a<0?`inset(0 0 0 ${100-100*sm((a+.28)/.28)}%)`:`inset(0 ${100*sm(a/.32)}% 0 0)`}
 else if(T==='iris'||T==='iris2'){const r=tri*140;e.style.clipPath=`circle(${r}% at 50% 45%)`}
 else if(T==='slide'){e.style.clipPath=a<0?`inset(${100-100*sm((a+.28)/.28)}% 0 0 0)`:`inset(0 0 ${100*sm(a/.32)}% 0)`}
 else{e.style.clipPath='none';e.style.opacity=tri*(T==='flash'?.9:1)}}
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
function setT(t){
 // L0 quasar
 diskMat.uniforms.uT.value=t;A0.rotation.y=t*.08;
 glowQ.position.copy(LOC(0));glowQ.scale.setScalar(60+6*Math.sin(t*3)+(t>=C.imp&&t<C.imp+.5?70*(1-(t-C.imp)/.5):0));glowQ.material.opacity=.4;glowQ.material.color.set(0xffd9a0);glowQ2.position.copy(LOC(0));glowQ2.scale.setScalar(150);glowQ2.material.opacity=.18;
 streams.forEach((s,i)=>{const ph=((t*.35+hs(i,1))%1);const r=40-ph*32;const a=hs(i,2)*6.28+t*(1.2+(1-ph)*2.6);s.position.set(LOC(0).x+Math.cos(a)*r,LOC(0).y+Math.sin(a*.9)*r*.12*Math.sin(.42)+Math.sin(.42)*Math.sin(a)*r,LOC(0).z+Math.sin(a)*r*Math.cos(.42));s.scale.setScalar(6*(1-ph*.6)+1.5);s.material.opacity=(t>=C.bh-.5?.95:.35)*(1-ph*.5)});
 {const a=t-C.imp;shockQ.visible=a>=0&&a<1.6;if(shockQ.visible){const k=a/1.6;shockQ.scale.setScalar(6+130*(1-Math.pow(1-k,3)));shockQ.material.opacity=.8*(1-k)}}
 // L2 quasares acendem
 qs.forEach(([m,g,gold],i)=>{const k=sm((t-C.n31-.3-i*.13)/.35);m.visible=k>0;m.scale.setScalar(Math.max(k,.001)*(1+.15*Math.sin(t*3+i)));g.scale.setScalar((gold?34:16)*k);g.material.opacity=.9*k});
 // L3 pulso de luz do quasar até a Terra
 {const k=sm((t-C.age-1.2)/4);pulseT.position.copy(LOC(3)).add(V3(0,lerp(-90,100,k),0));pulseT.scale.setScalar(16);bang.position.copy(LOC(3)).add(V3(0,-100,0));bang.scale.setScalar(26+8*Math.sin(t*2))}
 // L4 esticamento
 {const k=sm((t-C.red-1.5)/3.5);setWave(waveA,8,22,6,t*3);setWave(waveB,lerp(8,70,k),-22,6,t*1.2)}
 // L5 pontos
 dots1.forEach((m,i)=>{const k=sm((t-C.fast-.3-i*.5)/.3);m.scale.setScalar(Math.max(k,.001))});dots2.forEach((m,i)=>{const k=sm((t-C.fast-2.6-i*.13)/.25);m.scale.setScalar(Math.max(k,.001))});
 // L6 semente cresce
 {const k=sm((t-C.puzzle-.4)/2.2);const s=lerp(1,26,k*k);seed.scale.setScalar(s);ringS.scale.setScalar(s);glowS.position.copy(LOC(6));glowS.scale.setScalar(20+s*5)}
 // L7 artigo flutua
 paper.rotation.y=Math.sin(t*.5)*.35;paper.position.y=Math.sin(t*1.1)*2;
 // L8 faixa de incerteza respira
 band.scale.x=1+.35*Math.sin(t*1.6);band.position.x=10;
 hudT('h15','31',t,C.n31+.1,C.n31+3.6,300);hudT('hfirst','670 MILHÕES',t,C.age+.2,C.age+3.2,130);hudT('hq','7,77',t,C.red+.4,C.red+4.2,260);hudT('hx','?',t,C.puzzle+1.4,C.puzzle+4.4,420);
 {const e=$('title');e.style.fontSize='96px';e.innerHTML='OS QUASARES<br><b>MAIS ANTIGOS</b>';const k=t<2.9?1:1-sm((t-2.9)/.5);e.style.opacity=k;const pu=t>=C.imp?.16*Math.exp(-(t-C.imp)*7):0;e.style.transform=`translateY(${(1-k)*-60}px) scale(${(1+pu)*(1+(1-k)*.1)})`}
 // CTA
 {const on=t>=C.cmt-.2;$('dim').style.opacity=on?.82*sm((t-C.cmt+.2)/.6):0;
  const inCmt=t>=C.cmt&&t<C.seg-.1;const c=$('cmt');c.style.opacity=inCmt?sm((t-C.cmt)/.3)*(1-sm((t-C.seg+.4)/.25)):0;c.style.transform=`translateY(${(1-sm((t-C.cmt)/.3))*80}px)`;
  const word='ARQUIVO',n=Math.floor(clamp((t-C.cmt-.5)/.5)*word.length);$('typed').textContent=word.slice(0,n);
  const p=$('prof');const pk=sm((t-C.seg+.1)/.4);p.style.opacity=pk;p.style.transform=`scale(${.7+.3*pk})`;
  const tc=C.seg+.95;const fb=$('fbtn');const done=t>=tc;fb.textContent=done?'Seguindo ✓':'Seguir';fb.style.background=done?'#fff':'#01FBB4';fb.style.transform=`scale(${1-.12*clamp(1-Math.abs(t-tc)/.12)})`;
  const cur=$('cur');const ck=sm((t-C.seg)/.9);cur.style.opacity=t>=C.seg&&t<tc+1.0?1:0;const fx=lerp(900,720,ck),fy=lerp(1500,1120,ck);cur.style.transform=`translate(${fx}px,${fy}px) scale(${1-.12*clamp(1-Math.abs(t-tc)/.12)})`;
  const d=$('dm');const dk=sm((t-C.msg)/.35);d.style.opacity=dk;d.style.transform=`scale(${.6+.4*dk}) translateY(${(1-dk)*60}px)`}

 const cp=camPose(t);cam.fov=cp.fov;cam.updateProjectionMatrix();
 const cx=Math.sin(cp.az)*Math.cos(cp.el),cy=Math.sin(cp.el),cz=Math.cos(cp.az)*Math.cos(cp.el);const sh=(clamp(1-Math.abs(t-C.imp-.15)/.6)*1.4+(t<C.imp?.5*t/C.imp:0))*Math.min(cp.d,60)*.012;
 cam.position.set(cp.tg.x+cx*cp.d+Math.sin(t*37)*sh,cp.tg.y+cy*cp.d+Math.cos(t*29)*sh,cp.tg.z+cz*cp.d);cam.lookAt(cp.tg);cam.setViewOffset(W,H,0,H*.08,W,H);
 {const cl=Math.round(cam.position.x/1000);scene.children.forEach(o=>{if(o.isLight)return;o.visible=Math.round(o.position.x/1000)===cl})}
 $('flash').style.opacity=clamp(1-Math.abs(t-C.imp)/.1)*.3;$('rew').style.opacity=0;transition(t);caption(t);comp.render();
}
window.setT=setT;window.__ready=true;
