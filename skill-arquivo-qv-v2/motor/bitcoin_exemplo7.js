// PLANO DE CENA (palavra-foco | cena | câmera | por quê | fundo)
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
// PLANO DE CENA (estilo aprovado: realista; vermelho=queda, verde=alta, ouro=Bitcoin)
// imp  | moeda de ouro cai e racha, estilhaços e onda de choque | câmera baixa, soco | gancho | vazio escuro, piso reflexivo
// low  | gráfico de velas despenca até o ponto atual (62 mil)   | frontal            | preço | grade escura
// half | linha do pico (126 mil) e da metade                    | afasta             | metade do pico
// six  | seis colunas vermelhas semana a semana                 | lateral            | sexta semana
// liq  | torre de cubos vira vermelha e se estilhaça            | de baixo           | liquidações = posições fechadas à força
// etf  | cofre drena moedas por um cano                         | lateral            | saída dos fundos
// rot  | moedas chegam a outro cofre (azul)                     | acompanha          | rotação de capital
// vol  | linha de preço oscila, triângulo de alerta             | frontal            | volatilidade
// fx   | faixa 59,5–62,6 mil destacada no gráfico               | aproxima           | onde há posições
// fim  | moeda no piso, gráfico ao fundo                        | recuo              | fecho

function mkLabel(g,txt,x,y,w,col='#fff'){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,w*.3),new THREE.MeshBasicMaterial({map:label(txt,256,76,col,'rgba(0,0,0,0)',58),transparent:true}));m.position.set(x,y,0);g.add(m);return m}
import {Line2} from 'three/addons/lines/Line2.js';import {LineMaterial} from 'three/addons/lines/LineMaterial.js';import {LineGeometry} from 'three/addons/lines/LineGeometry.js';
function mkLine(g,col,lw,op=1){const ge=new LineGeometry();ge.setPositions([0,0,0,1,0,0]);const m=new LineMaterial({color:col,linewidth:lw,transparent:true,opacity:op});m.resolution.set(W,H);const l=new Line2(ge,m);g.add(l);return l}
const RED=0xe5483b,GREEN=0x2fcf6a,GOLD=0xf2b632;
// ===== L0: MOEDA =====
backdrop(0,0x0a1024,0x1a2444,0x2a3a66);const coinL=new THREE.PointLight(0xffd9a0,18,300,1.2);coinL.position.set(1,60,30);scene.add(coinL);
const A0=new THREE.Group();A0.position.copy(LOC(0));scene.add(A0);
{const fl=new THREE.Mesh(new THREE.PlaneGeometry(500,500),new THREE.MeshStandardMaterial({color:0x1c2438,metalness:.8,roughness:.3}));fl.rotation.x=-Math.PI/2;A0.add(fl)}
const coinTex=tex((g,w,h)=>{g.fillStyle='#f2b632';g.fillRect(0,0,w,h);g.strokeStyle='#b07d12';g.lineWidth=14;g.beginPath();g.arc(w/2,h/2,w/2-10,0,6.3);g.stroke();g.fillStyle='#8a5e0a';g.font='900 190px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('B',w/2,h/2+8);g.fillRect(w/2-34,h/2-120,12,30);g.fillRect(w/2+8,h/2-120,12,30);g.fillRect(w/2-34,h/2+100,12,30);g.fillRect(w/2+8,h/2+100,12,30)},256,256);
const coin=new THREE.Mesh(new THREE.CylinderGeometry(22,22,3.4,48),[new THREE.MeshStandardMaterial({color:0xe0a82a,metalness:1,roughness:.28}),new THREE.MeshStandardMaterial({map:coinTex,metalness:.9,roughness:.3}),new THREE.MeshStandardMaterial({map:coinTex,metalness:.9,roughness:.3})]);A0.add(coin);
const shards=[];for(let i=0;i<26;i++){const m=new THREE.Mesh(new THREE.BoxGeometry(2+hs(i,1)*3,.8,2+hs(i,2)*3),metal(0xe0a82a,1,.3));m.visible=false;A0.add(m);shards.push(m)}
const shockC=new THREE.Mesh(new THREE.TorusGeometry(1,.05,8,64),new THREE.MeshBasicMaterial({color:0xffd9a0,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));shockC.rotation.x=Math.PI/2;A0.add(shockC);
// ===== L1: GRÁFICO DE VELAS =====
backdrop(1,0x03060d,0x07101e,0x0d1b30);floorGrid(1,0x2a4a7a,0,500,.3);
const B1=new THREE.Group();B1.position.copy(LOC(1));scene.add(B1);
const NC=24,PX=6.4,PK=1.2;const price=[];{let p=126;for(let i=0;i<NC;i++){const k=i/(NC-1);const base=126-64*Math.pow(k,.8);p=base+(hs(i,3)-.5)*8*(1-k*.4);price.push(Math.max(p,60))}price[NC-1]=62}
const candles=[];for(let i=0;i<NC;i++){const o=i?price[i-1]:127,c=price[i];const up=c>=o;const hi=Math.max(o,c)+hs(i,4)*3,lo=Math.min(o,c)-hs(i,5)*3;const mat=new THREE.MeshStandardMaterial({color:up?GREEN:RED,emissive:up?0x0a5a2a:0x5a0f0a,emissiveIntensity:.6,roughness:.4});
 const body=new THREE.Mesh(new THREE.BoxGeometry(4.8,Math.max(Math.abs(c-o)*PK,1.2),4.8),mat);body.position.set((i-NC/2)*PX,(o+c)/2*PK,0);const wick=new THREE.Mesh(new THREE.BoxGeometry(.9,(hi-lo)*PK,.9),mat);wick.position.set((i-NC/2)*PX,(hi+lo)/2*PK,0);B1.add(body,wick);candles.push([body,wick])}
const lineP=mkLine(B1,0xffffff,3,.9);{const p=[];price.forEach((v,i)=>p.push((i-NC/2)*PX,v*PK+4,1));lineP.geometry.setPositions(p)}
const peakL=mkLine(B1,0xcfd8ee,2,.7);peakL.geometry.setPositions([-85,126*PK,0,85,126*PK,0]);const nowL=mkLine(B1,RED,3,.9);nowL.geometry.setPositions([-85,62*PK,0,85,62*PK,0]);const halfL=mkLine(B1,0xffd35a,3,0);halfL.geometry.setPositions([-85,63*PK,0,85,63*PK,0]);
mkLabel(B1,'126 MIL',-62,126*PK+12,50);mkLabel(B1,'62 MIL',68,62*PK-16,44,'#ff8a7a');
const dotNow=new THREE.Mesh(new THREE.SphereGeometry(3,20,14),new THREE.MeshBasicMaterial({color:0xffffff}));dotNow.position.set((NC-1-NC/2)*PX,62*PK+4,2);B1.add(dotNow);const glowNow=spr(0xff6a5a,.9);
const bandF=new THREE.Mesh(new THREE.BoxGeometry(170,(62.6-59.5)*PK*1.6,3),new THREE.MeshBasicMaterial({color:0xffd35a,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));bandF.position.set(0,61*PK,2);B1.add(bandF);
// ===== L2: SEIS SEMANAS =====
backdrop(2,0x04060c,0x0a0f1c,0x131c30);floorGrid(2,0x2a4a7a,0,400,.25);
const C2=new THREE.Group();C2.position.copy(LOC(2));scene.add(C2);const wk=[];
for(let i=0;i<6;i++){const h=34-i*3.4;const m=new THREE.Mesh(new THREE.BoxGeometry(11,1,11),new THREE.MeshStandardMaterial({color:RED,emissive:0x5a0f0a,emissiveIntensity:.5,roughness:.4}));m.position.set((i-2.5)*17,0,0);C2.add(m);wk.push([m,h]);const a=new THREE.Mesh(new THREE.ConeGeometry(4.2,7,20),new THREE.MeshBasicMaterial({color:0xff8a7a}));a.rotation.z=Math.PI;a.position.set((i-2.5)*17,-6,0);C2.add(a);wk[i].push(a);mkLabel(C2,'S'+(i+1),(i-2.5)*17,-18,15)}
// ===== L3: LIQUIDAÇÕES =====
backdrop(3,0x080c18,0x141a30,0x24304e);
const D3=new THREE.Group();D3.position.copy(LOC(3));scene.add(D3);
{const fl=new THREE.Mesh(new THREE.PlaneGeometry(500,500),new THREE.MeshStandardMaterial({color:0x10141f,metalness:.8,roughness:.3}));fl.rotation.x=-Math.PI/2;D3.add(fl)}
const cubes=[];for(let i=0;i<110;i++){const x=(i%5-2)*6.6,y=Math.floor(i/25)*6.6+3.4,z=(Math.floor((i%25)/5)-2)*6.6;const m=new THREE.Mesh(new THREE.BoxGeometry(6,6,6),new THREE.MeshStandardMaterial({color:0x6a8ac8,metalness:.5,roughness:.4}));m.position.set(x,y,z);D3.add(m);cubes.push({m,x,y,z,vx:(hs(i,1)-.5)*70,vy:20+hs(i,2)*50,vz:(hs(i,3)-.5)*70,rx:(hs(i,4)-.5)*8})}
// ===== L4: COFRES =====
backdrop(4,0x080e1c,0x142040,0x20345e);
const E4=new THREE.Group();E4.position.copy(LOC(4));scene.add(E4);
{const fl=new THREE.Mesh(new THREE.PlaneGeometry(500,500),new THREE.MeshStandardMaterial({color:0x10141f,metalness:.8,roughness:.3}));fl.rotation.x=-Math.PI/2;E4.add(fl)}
const vaultA=new THREE.Mesh(new THREE.BoxGeometry(34,30,34),new THREE.MeshStandardMaterial({color:0xc8a040,metalness:.6,roughness:.35,transparent:true,opacity:.35}));vaultA.position.set(-50,15,0);E4.add(vaultA);
const vaultB=new THREE.Mesh(new THREE.BoxGeometry(34,30,34),new THREE.MeshStandardMaterial({color:0x4a7ae0,metalness:.6,roughness:.35,transparent:true,opacity:.35}));vaultB.position.set(50,15,0);E4.add(vaultB);
const pipe=new THREE.Mesh(new THREE.CylinderGeometry(3,3,66,16),new THREE.MeshStandardMaterial({color:0x8a94a8,metalness:.8,roughness:.3,transparent:true,opacity:.5}));pipe.rotation.z=Math.PI/2;pipe.position.set(0,6,0);E4.add(pipe);
const vc=[];for(let i=0;i<30;i++){const c=new THREE.Mesh(new THREE.CylinderGeometry(3,3,.9,24),metal(0xe0a82a,1,.28));E4.add(c);vc.push(c)}
mkLabel(E4,'FUNDOS',-50,42,36);mkLabel(E4,'OUTROS',50,42,36,'#9fc0ff');
// ---------- poses e câmera ----------
const loc=i=>LOC(i);
function target(n,t){switch(n){case 'coin':return loc(0).add(V3(0,17,0));case 'chart':return loc(1).add(V3(0,108,0));case 'now':return loc(1).add(V3(58,78,0));case 'wk':return loc(2).add(V3(0,8,0));case 'liq':return loc(3).add(V3(0,12,0));case 'vault':return loc(4).add(V3(0,14,0));}return loc(0)}
const K=[['teaser',0,'coin',170,-15,10,38,.01,''],['imp',-.15,'coin',120,25,10,32,.3,''],['imp',1.0,'coin',190,60,18,40,1.2,''],
 ['low',-.1,'chart',420,0,4,40,.01,'dip'],['low',2.0,'now',260,-20,6,36,1.2,''],
 ['half',-.1,'chart',470,0,2,40,1.1,''],
 ['six',-.1,'wk',250,10,6,38,.01,'iris'],['six',3.5,'wk',210,-20,10,36,1.2,''],
 ['liq',-.1,'liq',120,15,-6,38,.01,'wipe'],['liq',3.0,'liq',150,-30,10,38,1.3,''],
 ['etf',-.1,'vault',300,0,12,38,.01,'dip'],['etf',3.0,'vault',260,25,16,36,1.2,''],
 ['rot',-.1,'vault',280,-25,12,38,1.0,''],
 ['vol',-.1,'chart',430,10,4,40,.01,'slide'],['fx',-.1,'now',250,0,4,36,1.2,''],['fim',-.1,'coin',150,20,10,38,.01,'dip'],['fim',3.0,'coin',380,-30,20,44,2.6,''],['cmt',0,'coin',440,30,16,40,1.4,'']];
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
 // L0 moeda: cai e racha em imp
 {const a=t-C.imp;if(a<0){const k=clamp((t)/C.imp);coin.position.set(0,lerp(34,11,k*k),0);coin.rotation.set(Math.PI/2+.35*(1-k),t*10,.2)}else{coin.position.set(0,11,0);coin.rotation.set(Math.PI/2*(1-sm(a/.4))+.12,0,.12*sm(a/.5));coin.scale.setScalar(1)}
  shards.forEach((m,i)=>{const on=a>=0&&a<3;m.visible=on;if(!on)return;const v=18+hs(i,5)*40,ang=hs(i,6)*6.28;m.position.set(Math.cos(ang)*v*a,8+Math.max(22*a-30*a*a,0)+hs(i,7)*4,Math.sin(ang)*v*a);m.rotation.set(a*6+i,a*4,i)});
  shockC.visible=a>=0&&a<1.6;if(shockC.visible){const k=a/1.6;shockC.position.y=1;shockC.scale.setScalar(4+170*(1-Math.pow(1-k,3)));shockC.material.opacity=.8*(1-k)}}
 // L1 gráfico: velas aparecem da esquerda para a direita
 candles.forEach(([b,w],i)=>{const k=sm((t-C.low+2.2-i*.07)/.3);b.scale.y=Math.max(k,.001);w.scale.y=Math.max(k,.001)});
 {const k=sm((t-C.low-1.6)/.6);dotNow.scale.setScalar(Math.max(k,.001)+.15*Math.sin(t*6)*k);glowNow.position.copy(LOC(1)).add(V3((NC-1-NC/2)*PX,62*PK+4,2));glowNow.scale.setScalar(26*k);glowNow.material.opacity=.8*k}
 halfL.material.opacity=t>=C.half&&t<C.six-.2?.9:0;halfL.visible=t>=C.half&&t<C.six-.2;
 bandF.material.opacity=t>=C.fx?.35+.15*Math.sin(t*5):0;
 {const on=t>=C.vol&&t<C.fx;lineP.material.opacity=.9}
 // L2 semanas
 wk.forEach(([m,h,a],i)=>{const k=sm((t-C.six-.3-i*.55)/.45);m.scale.y=Math.max(h*k,.001);m.position.y=Math.max(h*k,.001)/2;a.scale.setScalar(Math.max(k,.001));a.position.y=-6-0*k});
 // L3 cubos viram vermelhos e se estilhaçam
 {const a=t-C.liq-1.4;cubes.forEach(c=>{const red=sm((t-C.liq)/1.2);c.m.material.color.setRGB(lerp(.42,.9,red),lerp(.54,.2,red),lerp(.78,.16,red));if(a<0){c.m.position.set(c.x,c.y,c.z);c.m.rotation.set(0,0,0)}else{const g=a;c.m.position.set(c.x+c.vx*g*.3,Math.max(c.y+c.vy*g*.5-60*g*g,3),c.z+c.vz*g*.3);c.m.rotation.set(c.rx*g,c.rx*g*.7,0)}})}
 // L4 cofres
 vc.forEach((c,i)=>{const t0=C.etf+.4+i*.19;const a=t-t0;const inA=a<0;const mv=clamp(a/2.4);const x=inA?-50+(hs(i,1)-.5)*20:lerp(-50,50,mv);const y=inA?3+((i%5))*1.1:lerp(6,6,mv)+(a>2.4?-clamp((a-2.4)/.4)*3:0);c.position.set(a>=2.4?50+(hs(i,2)-.5)*18:x,a>=2.4?3+((i%5))*1.1:y,a>=2.4?(hs(i,3)-.5)*18:(inA?(hs(i,4)-.5)*18:0));c.rotation.x=Math.PI/2*(a>=0&&a<2.4?0:1)+(a>0&&a<2.4?a*8:0)});
 hudT('h15','126 → 62 MIL',t,C.low+.3,C.low+3.8,120);hudT('hfirst','-50%',t,C.half+.3,C.half+3.2,240);hudT('hq','6ª SEMANA',t,C.six+.4,C.six+3.4,110);hudT('title2','-17%',t,C.six+2.6,C.six+5.6,230);hudT('hx','US$ 2 BI',t,C.liq+.4,C.liq+3.8,170);hudT('title3','~US$ 3 BI',t,C.etf+.5,C.etf+4,160);$('title3').style.top='300px';
 {const e=$('title');e.style.fontSize='92px';e.innerHTML='BITCOIN<br><b>DESPENCA</b>';const k=t<2.6?1:1-sm((t-2.6)/.5);e.style.opacity=k;const pu=t>=C.imp?.16*Math.exp(-(t-C.imp)*7):0;e.style.transform=`translateY(${(1-k)*-60}px) scale(${(1+pu)*(1+(1-k)*.1)})`}
 // CTA
 {const on=t>=C.cmt-.2;$('dim').style.opacity=on?.82*sm((t-C.cmt+.2)/.6):0;
  const inCmt=t>=C.cmt&&t<C.seg-.1;const c=$('cmt');c.style.opacity=inCmt?sm((t-C.cmt)/.3)*(1-sm((t-C.seg+.4)/.25)):0;c.style.transform=`translateY(${(1-sm((t-C.cmt)/.3))*80}px)`;
  const word='ARQUIVO',n=Math.floor(clamp((t-C.cmt-.5)/.5)*word.length);$('typed').textContent=word.slice(0,n);
  const p=$('prof');const pk=sm((t-C.seg+.1)/.4);p.style.opacity=pk;p.style.transform=`scale(${.7+.3*pk})`;
  const tc=C.seg+.95;const fb=$('fbtn');const done=t>=tc;fb.textContent=done?'Seguindo ✓':'Seguir';fb.style.background=done?'#fff':'#01FBB4';fb.style.transform=`scale(${1-.12*clamp(1-Math.abs(t-tc)/.12)})`;
  const cur=$('cur');const ck=sm((t-C.seg)/.9);cur.style.opacity=t>=C.seg&&t<tc+1.0?1:0;const fx=lerp(900,720,ck),fy=lerp(1500,1120,ck);cur.style.transform=`translate(${fx}px,${fy}px) scale(${1-.12*clamp(1-Math.abs(t-tc)/.12)})`;
  const d=$('dm');const dk=sm((t-C.msg)/.35);d.style.opacity=dk;d.style.transform=`scale(${.6+.4*dk}) translateY(${(1-dk)*60}px)`}

 const cp=camPose(t);cam.fov=cp.fov;cam.updateProjectionMatrix();
 const cx=Math.sin(cp.az)*Math.cos(cp.el),cy=Math.sin(cp.el),cz=Math.cos(cp.az)*Math.cos(cp.el);const sh=(clamp(1-Math.abs(t-C.imp-.15)/.6)*1.4+(t<C.imp?.5*t/C.imp:0)+clamp(1-Math.abs(t-C.liq-1.4)/.5)*.8)*Math.min(cp.d,60)*.012;
 cam.position.set(cp.tg.x+cx*cp.d+Math.sin(t*37)*sh,cp.tg.y+cy*cp.d+Math.cos(t*29)*sh,cp.tg.z+cz*cp.d);cam.lookAt(cp.tg);cam.setViewOffset(W,H,0,H*.08,W,H);
 {const cl=Math.round(cam.position.x/1000);scene.children.forEach(o=>{if(o.isLight)return;o.visible=Math.round(o.position.x/1000)===cl})}
 $('flash').style.opacity=clamp(1-Math.abs(t-C.imp)/.1)*.3;$('rew').style.opacity=0;transition(t);caption(t);comp.render();
}
window.setT=setT;window.__ready=true;
