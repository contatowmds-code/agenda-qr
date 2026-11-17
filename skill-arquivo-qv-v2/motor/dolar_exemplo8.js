// PLANO DE CENA — Dólar acima de R$ 5,75 (16/11/2026). Estilo aprovado (Starship): mundo 3D realista, céu azul de dia,
// câmera dirigida pela fala, objeto central inteiro, trocas de cenário com transição diferente.
// teaser/imp | termômetro gigante numa praça, mercúrio estoura a marca 5,75 + chuva de notas        | de baixo p/ cima, soco | gancho | céu azul
// maior/abr  | placa "maior nível desde abr/2025" na marca 5,75                                     | lateral, gira          | maior desde abril/2025 | céu azul
// fri        | bandeira em 5,65, mercúrio desce                                                      | frontal                | fechou sexta
// jump/div   | mercúrio sobe de novo (+2%), faixa entre 5,756 e 5,778 pulsa                          | acompanha a subida     | fontes divergem
// pack/votos/bi | Congresso Nacional: Senado acende, pilha de dinheiro cresce                        | aproxima, baixa        | pacote fiscal, 45x31, R$50-60 bi | tarde
// cam        | tigela da Câmara brilha, "?"                                                          | de cima                | falta a Câmara
// ibc/neg    | mostrador gigante num campo, ponteiro cai para o vermelho, -0,9%                      | frontal, close         | prévia do PIB cai | pôr do sol dourado
// focus/sel  | outdoor noturno na cidade: SELIC 2027 12,50% -> 12,75%                                | frontal, aproxima      | Focus eleva a Selic | noite
// shop/usd.. | porto: guindaste ergue contêiner; etiquetas US$ 100 -> R$ 565 -> R$ 575+             | lateral                | importado mais caro | céu azul
// vol        | linha que oscila + triângulo de alerta                                                | frontal                | dólar muda todo dia | azul-marinho de diagrama
// fim        | Congresso ao entardecer, relógio gigante girando                                      | recuo                  | esperando a Câmara | pôr do sol
import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {Line2} from 'three/addons/lines/Line2.js';import {LineMaterial} from 'three/addons/lines/LineMaterial.js';import {LineGeometry} from 'three/addons/lines/LineGeometry.js';
const W=1080,H=1920;
await document.fonts.load('900 64px M');
const D=await (await fetch('/words.json')).json();const C=D.cues,WORDS=D.words;
const clamp=(x,a=0,b=1)=>Math.min(Math.max(x,a),b),sm=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10)},lerp=(a,b,k)=>a+(b-a)*k;
const hs=(i,s=0)=>{const x=Math.sin(i*127.1+s*311.7)*43758.5453;return x-Math.floor(x)};
const V3=(x,y,z)=>new THREE.Vector3(x,y,z);
const renderer=new THREE.WebGLRenderer({canvas:document.getElementById('gl'),antialias:false,logarithmicDepthBuffer:false,preserveDrawingBuffer:true});
renderer.setPixelRatio(1);renderer.setSize(W,H,false);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=0.9;
const NS=new URLSearchParams(location.search).has('ns');renderer.shadowMap.enabled=!NS;renderer.shadowMap.type=THREE.PCFShadowMap;
const scene=new THREE.Scene();scene.fog=new THREE.Fog(0xdfe9f3,300,900);
const pm=new THREE.PMREMGenerator(renderer);scene.environment=pm.fromScene(new RoomEnvironment(),0.04).texture;scene.environmentIntensity=0.35;
const cam=new THREE.PerspectiveCamera(40,W/H,1,4000);
const comp=new EffectComposer(renderer);comp.setSize(W,H);comp.addPass(new RenderPass(scene,cam));comp.addPass(new UnrealBloomPass(new THREE.Vector2(W/2,H/2),0.07,0.4,0.97));comp.addPass(new OutputPass());
const key=new THREE.DirectionalLight(0xfff1dc,3.2);key.castShadow=!NS;key.shadow.mapSize.set(2048,2048);{const s=key.shadow.camera;s.left=-230;s.right=230;s.top=230;s.bottom=-230;s.near=10;s.far=900}key.shadow.bias=-0.0006;key.shadow.normalBias=.4;scene.add(key,key.target);
const hemi=new THREE.HemisphereLight(0x9cc4ff,0x5a5a4a,.9);scene.add(hemi);
function tex(draw,w=256,h=256){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');draw(g,w,h);const t=new THREE.CanvasTexture(c);t.anisotropy=4;t.colorSpace=THREE.SRGBColorSpace;return t}
const softT=tex((g,s)=>{const r=g.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.4,'rgba(255,255,255,.4)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,s,s)},128,128);
function spr(g,col,op=1,add=true){const m=new THREE.SpriteMaterial({map:softT,color:col,blending:add?THREE.AdditiveBlending:THREE.NormalBlending,transparent:true,depthWrite:false,opacity:op,fog:false});const s=new THREE.Sprite(m);g.add(s);return s}
function lab(txt,w=256,h=96,fg='#fff',fs=64,st='#06203f',bg=null){return tex((g,W_,H_)=>{if(bg){g.fillStyle=bg;g.beginPath();g.roundRect(6,6,W_-12,H_-12,H_*.22);g.fill()}g.font=`900 ${fs}px M,sans-serif`;g.textAlign='center';g.textBaseline='middle';g.lineJoin='round';if(st){g.lineWidth=fs*.17;g.strokeStyle=st;g.strokeText(txt,W_/2,H_/2+fs*.04)}g.fillStyle=fg;g.fillText(txt,W_/2,H_/2+fs*.04)},w,h)}
function lsp(g,txt,x,y,z,wd,o={}){const w=o.w||256,h=o.h||96;const m=new THREE.SpriteMaterial({map:lab(txt,w,h,o.fg||'#fff',o.fs||64,o.st===undefined?'#06203f':o.st,o.bg||null),transparent:true,depthWrite:false,fog:false});const s=new THREE.Sprite(m);s.position.set(x,y,z);s.scale.set(wd,wd*h/w,1);g.add(s);return s}
const LOC=i=>V3(1000*i,0,0);
function grp(i){const g=new THREE.Group();g.position.copy(LOC(i));scene.add(g);return g}
function backdrop(i,top,mid,low,stars=false){const m=new THREE.Mesh(new THREE.SphereGeometry(700,32,20),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,depthTest:false,fog:false,uniforms:{a:{value:new THREE.Color(top)},b:{value:new THREE.Color(mid)},c:{value:new THREE.Color(low)}},
 vertexShader:`varying vec3 vD;void main(){vD=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`uniform vec3 a,b,c;varying vec3 vD;void main(){float h=vD.y;vec3 col=mix(c,b,smoothstep(-.1,.18,h));col=mix(col,a,smoothstep(.12,.85,h));gl_FragColor=vec4(col,1.);}`}));m.position.copy(LOC(i));m.renderOrder=-10;m.userData.noShadow=true;scene.add(m);
 if(stars){const g=new THREE.BufferGeometry(),p=[];for(let k=0;k<500;k++){const u=hs(k,i)*.95+.05,a=hs(k,i+9)*6.28,r=Math.sqrt(1-u*u);p.push(Math.cos(a)*r*650,u*650,Math.sin(a)*r*650)}g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));const s=new THREE.Points(g,new THREE.PointsMaterial({color:0xffffff,size:2,sizeAttenuation:false,fog:false}));s.position.copy(LOC(i));scene.add(s)}return m}
function clouds(g,n=9,op=.85){for(let i=0;i<n;i++){const a=hs(i,3)*6.28,r=520,y=170+hs(i,4)*200;for(let k=0;k<6;k++){const s=spr(g,0xffffff,op*(.6+.4*hs(i*7+k,5)),false);s.position.set(Math.cos(a)*r+(k-3)*50,y+(hs(i*7+k,6)-.5)*30,Math.sin(a)*r);s.scale.set(190,90,1)}}}
function ground(g,col,rough=.92){const m=new THREE.Mesh(new THREE.PlaneGeometry(2600,2600),new THREE.MeshStandardMaterial({color:col,roughness:rough,metalness:0}));m.rotation.x=-Math.PI/2;g.add(m);return m}
const metal=(c,m=.85,r=.3)=>new THREE.MeshStandardMaterial({color:c,metalness:m,roughness:r});
const std=(c,r=.7,m=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});
const box=(g,w,h,d,mat,x,y,z)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);g.add(m);return m};
function winTex(base,lit,night,seed=1){return tex((g,w,h)=>{g.fillStyle=base;g.fillRect(0,0,w,h);for(let y=0;y<16;y++)for(let x=0;x<8;x++){const on=hs(x*17+y*3,seed)>(night?.5:.2);g.fillStyle=on?lit:(night?'#0a1430':'rgba(25,50,85,.6)');g.fillRect(x*32+5,y*16+3,22,10)}},256,256)}
function city(g,n,r0,r1,night,seed=1,avoid=null){const t0=winTex(night?'#101a38':'#6d8fb5',night?'#ffd98a':'#bcd6ee',night,seed);t0.wrapS=t0.wrapT=THREE.RepeatWrapping;
 for(let i=0;i<n;i++){const a=hs(i,seed+1)*6.28,r=r0+hs(i,seed+2)*(r1-r0),w=22+hs(i,seed+3)*34,d=22+hs(i,seed+4)*30,h=60+hs(i,seed+5)*170;const x=Math.cos(a)*r,z=Math.sin(a)*r;if(avoid&&avoid(x,z))continue;
  const t=t0.clone();t.needsUpdate=true;t.repeat.set(Math.max(1,w/24),Math.max(1,h/26));const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({map:t,color:night?0xffffff:0xe8f0f8,metalness:night?.2:.55,roughness:night?.6:.22,emissive:night?0x1a1a22:0x000000,emissiveMap:night?t:null,emissiveIntensity:night?1.4:0}));m.position.set(x,h/2,z);g.add(m)}}
function trees(g,n,r0,r1,avoid){for(let i=0;i<n;i++){const a=hs(i,11)*6.28,r=r0+hs(i,12)*(r1-r0),x=Math.cos(a)*r,z=Math.sin(a)*r;if(avoid&&avoid(x,z))continue;const s=4+hs(i,13)*4;const c=new THREE.Mesh(new THREE.IcosahedronGeometry(s,1),std(new THREE.Color().setHSL(.27+hs(i,14)*.05,.45,.2+hs(i,15)*.1),.9));c.position.set(x,s*1.6,z);const tr=box(g,.9,s*1.4,.9,std(0x5a4030),x,s*.7,z);g.add(c)}}
const billTex=tex((g,w,h)=>{g.fillStyle='#86b673';g.fillRect(0,0,w,h);g.strokeStyle='#3f6b3a';g.lineWidth=8;g.strokeRect(10,10,w-20,h-20);g.strokeStyle='#5a8a52';g.lineWidth=3;g.strokeRect(22,22,w-44,h-44);g.fillStyle='#a9d196';g.beginPath();g.ellipse(w/2,h/2,52,40,0,0,6.3);g.fill();g.fillStyle='#2f5a2c';g.font='900 56px M,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('$',w/2,h/2+2);g.font='900 28px M,sans-serif';g.fillText('100',46,40);g.fillText('100',w-46,h-36)},256,120);
const billMat=new THREE.MeshStandardMaterial({map:billTex,emissiveMap:billTex,emissive:0xffffff,emissiveIntensity:.45,side:THREE.DoubleSide,roughness:.6});
// ================= L0: termômetro gigante =================
backdrop(0,0x2a6fd6,0x86b9f2,0xdfe9f3);
const A0=grp(0);clouds(A0);ground(A0,0x8f8d86,.85);
city(A0,44,190,470,false,1);
box(A0,0,0,0,std(0),0,0,0);
{const p=new THREE.Mesh(new THREE.CylinderGeometry(34,37,2.4,64),std(0xd2d0c8,.7));p.position.y=1.2;A0.add(p);const p2=new THREE.Mesh(new THREE.CylinderGeometry(14,16,4,48),metal(0x3a4350,.7,.4));p2.position.y=3.2;A0.add(p2)}
const YV=v=>12+(v-5.55)/.30*66;
const plate=new THREE.Mesh(new THREE.PlaneGeometry(40,80),new THREE.MeshStandardMaterial({roughness:.5,side:THREE.DoubleSide,map:tex((g,w,h)=>{g.fillStyle='#f3f5f7';g.fillRect(0,0,w,h);g.strokeStyle='#8f9aa8';g.lineWidth=6;g.strokeRect(3,3,w-6,h-6);
 for(let i=0;i<=30;i++){const v=5.55+i*.01,y=(85-YV(v))*8;const major=i%5===0;g.strokeStyle=(Math.abs(v-5.75)<.001)?'#d8281f':'#243447';g.lineWidth=major?5:2.5;g.beginPath();g.moveTo(w/2+34,y);g.lineTo(w/2+(major?84:62),y);g.stroke();g.beginPath();g.moveTo(w/2-34,y);g.lineTo(w/2-(major?84:62),y);g.stroke();
  if(major){g.fillStyle=(Math.abs(v-5.75)<.001)?'#d8281f':'#102a43';g.font='900 25px M,sans-serif';g.textAlign='left';g.textBaseline='middle';g.fillText(v.toFixed(2).replace('.',','),w/2+92,y)}}},320,640)}));plate.position.set(0,45,-4.4);A0.add(plate);
const tube=new THREE.Mesh(new THREE.CylinderGeometry(3.4,3.4,70,32,1,true),new THREE.MeshPhysicalMaterial({color:0xd6ecff,transparent:true,opacity:.16,roughness:.05,side:THREE.DoubleSide,depthWrite:false}));tube.position.y=47;tube.userData.noShadow=true;A0.add(tube);
const bulb=new THREE.Mesh(new THREE.SphereGeometry(7.5,32,24),new THREE.MeshStandardMaterial({color:0xd8281f,roughness:.2,emissive:0x4a0905}));bulb.position.y=8;A0.add(bulb);
const merc=new THREE.Mesh(new THREE.CylinderGeometry(2,2,1,24),new THREE.MeshStandardMaterial({color:0xe0291f,roughness:.25,emissive:0xb01408,emissiveIntensity:.8}));A0.add(merc);
const thr=new THREE.Mesh(new THREE.TorusGeometry(4.6,.45,10,48),new THREE.MeshBasicMaterial({color:0xff3b30}));thr.rotation.x=Math.PI/2;thr.position.y=YV(5.75);A0.add(thr);
const flare=spr(A0,0xff6a4a,.0);const shockT=new THREE.Mesh(new THREE.TorusGeometry(1,.05,8,64),new THREE.MeshBasicMaterial({color:0xfff0a0,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));shockT.rotation.x=Math.PI/2;A0.add(shockT);
const bills=[];for(let i=0;i<40;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(9,4.2),billMat);m.userData.noShadow=true;m.visible=false;A0.add(m);bills.push(m)}
const plq1=lsp(A0,'MAIOR NÍVEL',-20,YV(5.75)+10.5,2,21,{w:512,h:128,fs:84,bg:'#c0221a',st:null});const plq2=lsp(A0,'DESDE ABR/2025',-20,YV(5.75)+3.5,2,21,{w:512,h:128,fs:70,bg:'#11335f',st:null});
const flagS=lsp(A0,'SEXTA 5,65',-19.5,YV(5.65),2,20,{w:512,h:128,fs:80,bg:'#11335f',st:null});const flagL=box(A0,8,.5,.5,std(0x11335f),-7,YV(5.65),0);
const band=new THREE.Mesh(new THREE.BoxGeometry(9.5,(YV(5.778)-YV(5.756)),9.5),new THREE.MeshBasicMaterial({color:0xffb020,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));band.position.y=(YV(5.778)+YV(5.756))/2;band.userData.noShadow=true;A0.add(band);
function vOf(t){if(t<C.imp)return 5.665+.04*sm(t/C.imp)+.003*Math.sin(t*40)*(t/C.imp);
 if(t<C.fri-.4){const a=t-C.imp;const k=1-Math.exp(-a*5)*Math.cos(a*14);return 5.705+.073*clamp(k,0,1.45)+.0015*Math.sin(t*9)*clamp(a/2)}
 if(t<C.fri+.6){const k=sm((t-(C.fri-.4))/1.0);return lerp(5.778,5.65,k)}
 if(t<C.jump)return 5.65+.001*Math.sin(t*7);
 if(t<C.jump+2.6){const k=(t-C.jump)/2.6;return lerp(5.65,5.772,sm(k))+(k>.85?.006*Math.sin((k-.85)*30)*(1-k)*6:0)}
 return 5.778+.002*Math.sin(t*8)}
// ================= L1: Congresso Nacional (tarde) =================
function mkCong(g,gl){const white=std(0xeeebe4,.65),senMat=std(0xf4f2ee,.55),bowlMat=new THREE.MeshStandardMaterial({color:0xf4f2ee,roughness:.55,side:THREE.DoubleSide});
 box(g,340,.8,170,std(0xc8c4ba,.9),0,.4,30);box(g,280,9,80,white,0,4.5,0);box(g,300,2,96,std(0xd9d6cc,.7),0,10,0);
 const gm=new THREE.MeshStandardMaterial({map:winTex('#3c6592','#a9c9ea',false,4),metalness:.6,roughness:.2});gm.map.wrapS=gm.map.wrapT=THREE.RepeatWrapping;gm.map.repeat.set(1,3);
 for(const x of[-14,14])box(g,26,100,12,gm,x,60,0);box(g,56,6,8,white,0,76,0);
 const dome=new THREE.Mesh(new THREE.SphereGeometry(30,64,32,0,Math.PI*2,0,Math.PI/2),senMat);dome.position.set(-92,11,0);g.add(dome);
 const bowl=new THREE.Mesh(new THREE.SphereGeometry(34,64,32,0,Math.PI*2,Math.PI/2,Math.PI/2),bowlMat);bowl.position.set(92,11+34,0);g.add(bowl);
 const bowlIn=new THREE.Mesh(new THREE.SphereGeometry(33,48,24,0,Math.PI*2,Math.PI/2,Math.PI/2),new THREE.MeshStandardMaterial({color:0x8a8f98,roughness:.8,side:THREE.BackSide}));bowlIn.position.copy(bowl.position);g.add(bowlIn);
 const sup=new THREE.Mesh(new THREE.CylinderGeometry(17,13,6,32),white);sup.position.set(92,14,0);g.add(sup);
 for(let i=0;i<7;i++){box(g,.9,9,.9,std(0xdcd8cf),-100+i*33.3,5,41)}
 trees(g,70,70,330,(x,z)=>Math.abs(x)<190&&z>-60&&z<110);
 for(const sx of[-1,1])for(let k=0;k<4;k++)box(g,60,22,22,gm,sx*(190+k*70),11,-170);
 return {dome,bowl,senMat,bowlMat}}
backdrop(1,0x2e72d8,0x8cc0f4,0xe2ecf4);
const A1=grp(1);clouds(A1);ground(A1,0x5c9a45,.95);const cg1=mkCong(A1);
const cash=[];{let n=0;const bm=std(0x5f9f52,.55),bm2=std(0xe9eadf,.6);for(let L=0;L<5;L++)for(let i=0;i<6-L;i++)for(let j=0;j<3-Math.floor(L/2);j++){const g=new THREE.Group();g.add(new THREE.Mesh(new THREE.BoxGeometry(11,4,5),bm));g.add(new THREE.Mesh(new THREE.BoxGeometry(2,4.3,5.2),bm2));g.position.set(-33+i*12+L*6,2+L*4.2,98+j*5.6-(L>1?3:0));g.userData.i=n++;A1.add(g);cash.push(g)}}
// ================= L2: mostrador do IBC-Br =================
backdrop(2,0x2c5cae,0xf0a965,0xf7d9a8);
const A2=grp(2);clouds(A2,7,.7);ground(A2,0x8a8044,.95);
for(let i=0;i<9;i++){const x=-260+i*22,z=-190;const s=new THREE.Mesh(new THREE.CylinderGeometry(7,7,34,24),metal(0xcfd3d8,.6,.4));s.position.set(x,17,z);A2.add(s);const c=new THREE.Mesh(new THREE.ConeGeometry(7.4,7,24),metal(0x9aa0a8,.6,.4));c.position.set(x,37.5,z);A2.add(c)}
for(let i=0;i<5;i++)box(A2,60,16,28,std(0xb9bcc0,.7),120+i*70,8,-200+hs(i,3)*30);
trees(A2,50,120,520,(x,z)=>Math.abs(x)<80&&z>-60&&z<80);
const gTex=tex((g,w,h)=>{g.fillStyle='#f4f3ee';g.fillRect(0,0,w,h);const cx=w/2,cy=h*.62,R=w*.4;const seg=[[Math.PI,1.34*Math.PI,'#d23a2c'],[1.34*Math.PI,1.66*Math.PI,'#e9b427'],[1.66*Math.PI,2*Math.PI,'#3aa655']];
 for(const [a,b,c] of seg){g.strokeStyle=c;g.lineWidth=w*.075;g.beginPath();g.arc(cx,cy,R,a,b);g.stroke()}
 g.strokeStyle='#243447';g.lineWidth=5;for(let i=0;i<=20;i++){const a=Math.PI+i*Math.PI/20,r0=R*.84,r1=R*(i%5?.9:.78);g.beginPath();g.moveTo(cx+Math.cos(a)*r0,cy+Math.sin(a)*r0);g.lineTo(cx+Math.cos(a)*r1,cy+Math.sin(a)*r1);g.stroke()}
 g.fillStyle='#102a43';g.font='900 64px M,sans-serif';g.textAlign='center';g.fillText('IBC-Br',cx,cy+R*.62)},512,512);
const gaugeG=new THREE.Group();gaugeG.position.y=62;A2.add(gaugeG);
{const face=new THREE.Mesh(new THREE.CircleGeometry(40,64),new THREE.MeshStandardMaterial({map:gTex,roughness:.5}));face.position.z=1.6;gaugeG.add(face);const rim=new THREE.Mesh(new THREE.TorusGeometry(40,2.6,16,72),metal(0x38414d,.8,.35));rim.position.z=1.4;gaugeG.add(rim);const back=new THREE.Mesh(new THREE.CylinderGeometry(40,40,3,64),metal(0x38414d,.8,.4));back.rotation.x=Math.PI/2;gaugeG.add(back)
 for(const x of[-18,18])box(A2,3.4,62,3.4,metal(0x38414d,.8,.4),x,31,-1)}
const needle=new THREE.Group();needle.position.set(0,62-40*.24*0,3.2);gaugeG.add(needle);needle.position.set(0,-40*.24,3.2);
{const n=new THREE.Mesh(new THREE.BoxGeometry(2.2,31,1),std(0xc4281f,.4));n.position.y=15;needle.add(n);const hub=new THREE.Mesh(new THREE.CylinderGeometry(3.4,3.4,2.4,24),metal(0x20262e,.8,.3));hub.rotation.x=Math.PI/2;needle.add(hub)}
const redGlow=spr(A2,0xff2a1a,0);redGlow.position.set(-24,62+6,6);
// ================= L3: outdoor noturno (Selic) =================
backdrop(3,0x030816,0x0c1a3e,0x1d3262,true);
const A3=grp(3);ground(A3,0x14171e,.55);city(A3,64,150,520,true,3,(x,z)=>Math.abs(x)<110&&z>-60&&z<170);
{box(A3,60,.15,6,std(0xdddddd,.9),0,.1,70);for(let i=-6;i<=6;i++)box(A3,5,.12,.5,std(0xdddddd,.9),i*14,.12,70);
 for(let i=0;i<10;i++){const x=-90+i*20;box(A3,.6,16,.6,metal(0x2a2f38),x,8,95);const s=spr(A3,0xffd9a0,.9);s.position.set(x,16.5,95);s.scale.set(22,22,1)}}
const tow=box(A3,52,118,26,new THREE.MeshStandardMaterial({map:winTex('#0e1a38','#ffd98a',true,9),roughness:.5,metalness:.3,emissive:0x222233,emissiveIntensity:1.4}),0,59,0);
const bbG=new THREE.Group();bbG.position.set(0,140,13.5);A3.add(bbG);
{const fr=box(bbG,86,48,3,metal(0x1b2230,.8,.35),0,0,0);box(bbG,84,.8,.8,new THREE.MeshBasicMaterial({color:0x2fd6ff}),0,23.2,1.8);box(bbG,84,.8,.8,new THREE.MeshBasicMaterial({color:0x2fd6ff}),0,-23.2,1.8);
 const face=new THREE.Mesh(new THREE.PlaneGeometry(80,43),new THREE.MeshBasicMaterial({map:tex((g,w,h)=>{g.fillStyle='#071a3f';g.fillRect(0,0,w,h);g.fillStyle='#4fd6ff';g.font='900 74px M,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('SELIC 2027',w/2,h*.2);g.fillStyle='#9fc0ee';g.font='800 40px M,sans-serif';g.fillText('previsão do mercado',w/2,h*.88)},800,430)}));face.position.z=1.7;bbG.add(face)}
const numA=lsp(bbG,'12,50%',-4,-1,6.5,56,{w:768,h:200,fs:140,fg:'#e8f1ff',st:null});const numB=lsp(bbG,'12,75%',-4,-1,6.6,56,{w:768,h:200,fs:140,fg:'#3df08c',st:null});const arrB=lsp(bbG,'▲',34,-1,6.6,10,{w:128,h:128,fs:96,fg:'#3df08c',st:null});
for(const x of[-25,25])box(A3,3,30,3,metal(0x1b2230,.8,.4),x,118,12);
// ================= L4: porto (importados) =================
backdrop(4,0x2c74d6,0x8cc4f2,0xe4eef5);
const A4=grp(4);clouds(A4);{const sea=new THREE.Mesh(new THREE.PlaneGeometry(2600,2600),new THREE.MeshStandardMaterial({color:0x1b6a9a,roughness:.2,metalness:.25}));sea.rotation.x=-Math.PI/2;sea.position.y=-.2;A4.add(sea)}
box(A4,560,6,160,std(0xb9b7b0,.85),0,3,10);
const ctex=tex((g,w,h)=>{g.fillStyle='#fff';g.fillRect(0,0,w,h);g.strokeStyle='rgba(0,0,0,.28)';g.lineWidth=3;for(let x=6;x<w;x+=10){g.beginPath();g.moveTo(x,0);g.lineTo(x,h);g.stroke()}},128,64);
const CC=[0xc0392b,0x2e86c1,0xe0a50a,0x27ae60,0x7f8c8d,0xd35400,0x8e44ad];
const conts=[];for(let r=0;r<6;r++)for(let c=0;c<16;c++){const lv=1+Math.floor(hs(r*20+c,2)*4);for(let l=0;l<lv;l++){const m=new THREE.Mesh(new THREE.BoxGeometry(12,5.2,5),new THREE.MeshStandardMaterial({color:CC[Math.floor(hs(r*20+c+l*3,5)*7)],map:ctex,roughness:.55,metalness:.3}));m.position.set(-120+c*13.2,6+2.6+l*5.3,-40+r*6.4);A4.add(m);conts.push(m)}}
const lift=new THREE.Mesh(new THREE.BoxGeometry(12,5.2,5),new THREE.MeshStandardMaterial({color:0xe05a1a,map:ctex,roughness:.5,metalness:.3}));A4.add(lift);
const cm=metal(0xd64a2b,.5,.45);
for(const x of[44,76])for(const z of[62,92])box(A4,3.4,56,3.4,cm,x,34,z);box(A4,40,4,40,cm,60,62,77);box(A4,3.6,3.6,150,cm,60,66,150);box(A4,3.6,3.6,40,cm,60,66,45);
const trolley=box(A4,9,3,9,metal(0x3a4350),60,63,120);const cab=[1,2,3,4].map(i=>box(A4,.35,1,.35,metal(0x111)));
{const shipM=std(0x1c2a44,.55,.3);box(A4,230,16,40,shipM,-30,3,150);box(A4,230,3,40.4,std(0xa4282a,.6),-30,-3.3,150);const sh=new THREE.Shape();sh.moveTo(0,-20);sh.lineTo(40,0);sh.lineTo(0,20);const bow=new THREE.Mesh(new THREE.ExtrudeGeometry(sh,{depth:16,bevelEnabled:false}),shipM);bow.rotation.x=-Math.PI/2;bow.position.set(85,-5,150);bow.scale.set(1,1,-1);bow.position.y=11;A4.add(bow);
 box(A4,22,34,26,std(0xe9e9e4,.6),-125,28,150);for(let i=0;i<8;i++)for(let l=0;l<3;l++)box(A4,12,5.2,5,std(CC[(i+l*2)%7],.5,.3),-95+i*13.2,13.1+l*5.3,140+((i+l)%2)*5.4)}
const tgA=lsp(A4,'US$ 100',28,38,112,24,{w:512,h:192,fs:110,fg:'#0b3d8f',st:null,bg:'#f4f6fa'});const tgR=lsp(A4,'→',49,38,112,9,{w:128,h:128,fs:100,fg:'#fff'});
const tgB=lsp(A4,'R$ 565',70,38,112,24,{w:512,h:192,fs:110,fg:'#102a43',st:null,bg:'#f4f6fa'});const tgC=lsp(A4,'R$ 575+',70,38,112,26,{w:512,h:192,fs:110,fg:'#fff',st:null,bg:'#d8281f'});
// ================= L5: diagrama da oscilação =================
backdrop(5,0x04101f,0x082044,0x0d3066);
const A5=grp(5);{const gh=new THREE.GridHelper(500,50,0x2a5aa0,0x1b3f78);gh.position.y=-30;gh.material.transparent=true;gh.material.opacity=.45;A5.add(gh);const g2=new THREE.GridHelper(300,30,0x2a5aa0,0x1b3f78);g2.rotation.x=Math.PI/2;g2.position.z=-8;g2.material.transparent=true;g2.material.opacity=.35;A5.add(g2)}
const NW=140;const wavePts=[];{let y=0;for(let i=0;i<NW;i++){y+=(hs(i,21)-.5)*9+Math.sin(i*.35)*2.2;y=clamp(y,-34,34)*.97;wavePts.push((i-NW/2)*1.9,y*1.0,0)}}
const waveG=new LineGeometry();waveG.setPositions(wavePts);const waveM=new LineMaterial({color:0x3df08c,linewidth:7,transparent:true,opacity:1});waveM.resolution.set(W,H);const wave=new Line2(waveG,waveM);A5.add(wave);
const waveDot=new THREE.Mesh(new THREE.SphereGeometry(3,20,14),new THREE.MeshBasicMaterial({color:0xffffff}));A5.add(waveDot);const waveGl=spr(A5,0x3df08c,.8);
const warn=new THREE.Group();warn.position.set(0,-62,2);A5.add(warn);{const sh=new THREE.Shape();sh.moveTo(0,16);sh.lineTo(15,-10);sh.lineTo(-15,-10);sh.closePath();const tri=new THREE.Mesh(new THREE.ExtrudeGeometry(sh,{depth:3,bevelEnabled:true,bevelSize:1.4,bevelThickness:1}),std(0xf2c230,.4));warn.add(tri);lsp(warn,'!',0,-1,4.5,14,{w:128,h:128,fs:110,fg:'#1b2230',st:null})}
// ================= L6: Congresso ao entardecer + relógio =================
backdrop(6,0x1c2e66,0xe0784a,0xf5b57c);
const A6=grp(6);clouds(A6,7,.55);ground(A6,0x4d7a3c,.95);const cg6=mkCong(A6);
const clockG=new THREE.Group();clockG.position.set(0,40,118);A6.add(clockG);
{const f=new THREE.Mesh(new THREE.CylinderGeometry(26,26,3,64),[std(0xf2f2ee,.5),new THREE.MeshStandardMaterial({map:tex((g,w,h)=>{g.fillStyle='#f6f6f2';g.fillRect(0,0,w,h);g.fillStyle='#102a43';for(let i=0;i<12;i++){const a=i*Math.PI/6;g.save();g.translate(w/2,h/2);g.rotate(a);g.fillRect(-6,-w*.46,12,i%3?30:56);g.restore()}},512,512),roughness:.4}),std(0xf2f2ee,.5)]);f.rotation.x=Math.PI/2;clockG.add(f);
 const rim=new THREE.Mesh(new THREE.TorusGeometry(26,2,12,64),metal(0x20262e,.8,.35));clockG.add(rim);box(A6,3,30,3,metal(0x20262e,.8,.4),0,15,118)}
const hH=new THREE.Group(),hM=new THREE.Group();hH.position.z=2.4;hM.position.z=3;clockG.add(hH,hM);{const a=box(hH,2.2,13,.8,std(0x102a43),0,6.5,0),b=box(hM,1.5,20,.8,std(0xc4281f),0,10,0)}
// ---------- câmera ----------
const LT=[ // key, keyInt, hemiSky, hemiGnd, hemiInt, envInt, exposure, fogColor, fogNear, fogFar, keyPos
 [0xfff1dc,3.2,0x9cc4ff,0x5a5a4a,.9,.35,.9,0xdfe9f3,320,950,[70,140,90]],
 [0xfff0d8,3.0,0x9cc4ff,0x4c5a3a,.9,.35,.9,0xe2ecf4,320,950,[-80,130,100]],
 [0xffc58a,3.0,0x9ab8ff,0x6a5a3a,.75,.3,.95,0xf7d9a8,260,800,[-110,70,90]],
 [0x7f9ee0,.55,0x1a2a5a,0x05070c,.35,.14,1.05,0x1d3262,200,700,[60,140,90]],
 [0xfff4e4,3.4,0x9cc4ff,0x5a5a4a,.9,.35,.9,0xe4eef5,320,950,[-90,140,110]],
 [0xdde8ff,2.0,0x6a8ac8,0x101a2a,.8,.45,.95,0x0d3066,300,900,[40,120,100]],
 [0xffa070,2.6,0x6a7ac8,0x3a2a3a,.65,.3,.95,0xf5b57c,260,800,[-110,60,100]]];
const loc=i=>LOC(i);
const T={
 therm:t=>loc(0).add(V3(0,46,0)),top:t=>loc(0).add(V3(0,YV(vOf(t))+2,0)),plaque:t=>loc(0).add(V3(-9,YV(5.75)+6,0)),flag:t=>loc(0).add(V3(-8,YV(5.65),0)),merc:t=>loc(0).add(V3(0,YV(vOf(t)),0)),bandt:t=>loc(0).add(V3(0,YV(5.767),0)),
 cong:t=>loc(1).add(V3(0,32,0)),towers:t=>loc(1).add(V3(0,62,0)),cashT:t=>loc(1).add(V3(0,12,98)),bowl:t=>loc(1).add(V3(92,34,0)),
 gauge:t=>loc(2).add(V3(0,60,0)),needleT:t=>loc(2).add(V3(-6,66,3)),
 bill:t=>loc(3).add(V3(0,135,13)),billn:t=>loc(3).add(V3(0,134,13)),
 crane:t=>loc(4).add(V3(50,34,90)),contT:t=>loc(4).add(V3(60,36,100)),tagA:t=>loc(4).add(V3(28,38,112)),tagB:t=>loc(4).add(V3(70,38,112)),tagMid:t=>loc(4).add(V3(49,38,112)),
 wave:t=>loc(5).add(V3(0,-6,0)),
 cong6:t=>loc(6).add(V3(0,32,30)),clockT:t=>loc(6).add(V3(0,40,118))};
const K=[ // [cue, dt, alvo, dist, azim, elev, fov, duração, transição]
 ['teaser',0,'therm',240,-14,8,36,.01,''],['imp',-.1,'top',64,20,14,32,.4,''],['imp',1.7,'therm',172,58,14,40,1.5,''],
 ['maior',-.3,'plaque',150,-10,8,36,1.0,''],['abr',.2,'therm',200,-22,18,40,1.4,''],
 ['fri',-.35,'flag',150,6,2,36,.9,''],['jump',-.25,'merc',84,26,5,34,.8,''],['jump',2.3,'therm',168,-32,16,40,1.3,''],['div',-.1,'bandt',76,38,6,34,1.0,''],
 ['pack',-.1,'cong',470,-52,9,40,.01,'wipe'],['pack',2.4,'cong',380,-70,6,38,1.4,''],['votos',-.4,'towers',165,10,-4,38,1.1,''],['bi',-.3,'cashT',104,-30,10,38,1.1,''],['bi',3.2,'cong',420,52,14,40,1.2,''],
 ['cam',-.25,'bowl',128,26,10,36,1.0,''],['cam',1.9,'bowl',92,-22,26,36,1.3,''],
 ['ibc',-.1,'gauge',250,-12,4,38,.01,'iris'],['neg',-.5,'needleT',150,18,5,34,1.1,''],['neg',2.3,'gauge',285,-40,14,40,1.4,''],
 ['focus',-.1,'bill',340,-20,4,38,.01,'slide'],['sel',-.3,'bill',300,14,2,34,1.2,''],['n1275',-.3,'billn',270,-8,-2,32,1.0,''],['n1275',2.7,'bill',380,36,12,40,1.4,''],
 ['shop',-.1,'crane',250,-30,10,38,.01,'flash'],['shop',0.7,'contT',108,26,6,36,1.2,''],['usd',-.2,'tagMid',225,-6,3,36,1.0,''],['ptag',-.1,'tagMid',215,5,4,34,.8,''],['pup',-.1,'tagB',140,-8,5,32,.8,''],['pup',2.4,'crane',270,42,18,40,1.3,''],
 ['vol',-.1,'wave',158,0,4,38,.01,'dipb'],['vol',2.2,'wave',112,-26,8,34,1.3,''],
 ['fim',-.1,'cong6',320,-24,8,40,.01,'dip'],['fim',2.1,'clockT',148,10,6,36,1.4,''],['cta',0,'cong6',440,32,16,42,1.6,'']];
function cbez(x1,y1,x2,y2){return k=>{if(k<=0)return 0;if(k>=1)return 1;let lo=0,hi=1,u=k;for(let i=0;i<22;i++){const x=3*(1-u)*(1-u)*u*x1+3*(1-u)*u*u*x2+u*u*u;if(x<k)lo=u;else hi=u;u=(lo+hi)/2}return 3*(1-u)*(1-u)*u*y1+3*(1-u)*u*u*y2+u*u*u}}
const EASE=[cbez(.65,0,.35,1),cbez(.08,.9,.2,1),cbez(.34,1.5,.64,1),cbez(.8,0,.2,1)];
const ROLL={imp:4,jump:-4,votos:5,neg:-6,n1275:4,pup:-4,vol:5,fim:-4};
const KT=K.map((k,i)=>({e:[1,0,2,3][i%4],roll:(ROLL[k[0]]||0)*Math.PI/180*(k[1]>0?-1:1),t:(C[k[0]]??0)+k[1],tg:k[2],d:k[3],az:k[4]*Math.PI/180,el:k[5]*Math.PI/180,fov:k[6],dur:k[7],tr:k[8]}));
for(let i=1;i<KT.length;i++)if(KT[i].t<KT[i-1].t)console.error('ordem K',i,KT[i].tg);
function camPose(t){let j=0;for(let i=0;i<KT.length;i++){if(KT[i].t-KT[i].dur*.75<=t)j=i}
 const b=KT[j],a=KT[Math.max(j-1,0)];const k=j===0?1:EASE[b.e](clamp((t-(b.t-b.dur*.75))/b.dur));
 const tg=T[a.tg](t).lerp(T[b.tg](t),k);const dt=Math.max(t-b.t,0);
 const d=Math.exp(lerp(Math.log(a.d),Math.log(b.d*(1-.05*clamp(dt/4))),k)),az=lerp(a.az,b.az+dt*.04,k),el=lerp(a.el,b.el,k),fov=lerp(a.fov,b.fov,k),roll=lerp(a.roll,b.roll,k);return{tg,d,az,el,fov,roll}}
const TR=KT.filter(k=>k.tr);
const $=id=>document.getElementById(id);
function transition(t){const e=$('tr');let on=null;for(const k of TR){const a=t-(k.t-.05);if(a>-.28&&a<.32){on=[k,a]}}
 if(!on){e.style.opacity=0;return}const [k,a]=on;const p=sm((a+.28)/.6);const tri=1-Math.abs(p*2-1);e.style.opacity=1;
 const cols={dip:'#000',iris:'#000',wipe:'#011839',slide:'#000',flash:'#fff',dipb:'#011839'};e.style.background=cols[k.tr]||'#000';const T_=k.tr;
 if(T_==='wipe'){e.style.clipPath=a<0?`inset(0 0 0 ${100-100*sm((a+.28)/.28)}%)`:`inset(0 ${100*sm(a/.32)}% 0 0)`}
 else if(T_==='iris'){e.style.clipPath=`circle(${tri*140}% at 50% 45%)`}
 else if(T_==='slide'){e.style.clipPath=a<0?`inset(${100-100*sm((a+.28)/.28)}% 0 0 0)`:`inset(0 0 ${100*sm(a/.32)}% 0)`}
 else{e.style.clipPath='none';e.style.opacity=tri*(T_==='flash'?.9:1)}}
const capEl=$('cap');const VAR=[
 p=>`transform:scale(${1+.18*(1-p)});opacity:${p}`,p=>`transform:translateY(${40*(1-p)}px);opacity:${p}`,p=>`transform:translateX(${-60*(1-p)}px);opacity:${p}`,
 p=>`transform:translateX(${60*(1-p)}px);opacity:${p}`,p=>`transform:translateY(${-40*(1-p)}px) rotate(${-3*(1-p)}deg);opacity:${p}`,p=>`transform:rotate(${4*(1-p)}deg) scale(${.85+.15*p});opacity:${p}`,
 p=>`transform:scale(${.85+.15*p});filter:blur(${8*(1-p)}px);opacity:${p}`,p=>`transform:perspective(600px) rotateX(${35*(1-p)}deg);opacity:${p}`];
let lastW=-1;
function caption(t){let wi=-1;for(let i=0;i<WORDS.length;i++){if(t>=WORDS[i].s-.01&&t<WORDS[i].e+.04){wi=i;break}}
 if(wi<0||t<.25){capEl.innerHTML='';lastW=-1;return}const w=WORDS[wi],p=sm((t-w.s)/.14);
 if(wi!==lastW){capEl.innerHTML=`<span class="${w.hl?'hl':''}">${w.w}</span>`;lastW=wi;const sp=capEl.firstChild;sp.style.fontSize='108px';const ww=sp.offsetWidth;if(ww>760)sp.style.fontSize=Math.floor(108*760/ww)+'px'}
 capEl.firstChild.style.cssText+=VAR[(wi*5+3)%8](p)}
function hudT(id,text,t,a,b,size,color='#fff',top=200){const e=$(id);e.textContent=text;e.style.fontSize=size+'px';e.style.color=color;e.style.top=top+'px';const on=t>=a&&t<b;const k=on?sm((t-a)/.25)*(1-sm((t-(b-.3))/.3)):0;e.style.opacity=k;e.style.transform=`scale(${.6+.4*k})`}
// ---------- estado ----------
function setT(t){
 // L0 termômetro
 {const v=vOf(t);const Lm=YV(v)-8;merc.scale.y=Lm;merc.position.y=8+Lm/2;const over=v>5.75;thr.material.color.set(over?0xff6a3a:0xff3b30);thr.scale.setScalar(over?1.18+.1*Math.sin(t*10):1);
  const a=t-C.imp;shockT.visible=a>=0&&a<1.6;if(shockT.visible){const k=a/1.6;shockT.position.y=YV(5.78);shockT.scale.setScalar(4+150*(1-Math.pow(1-k,3)));shockT.material.opacity=.8*(1-k)}
  const fa=Math.max(a,t-C.jump-1.6),fl=a>=0&&a<1.2?1-a/1.2:(t>=C.jump+1.5&&t<C.jump+2.7?1-(t-C.jump-1.5)/1.2:0);flare.position.set(0,YV(v),0);flare.scale.setScalar(50*fl+4);flare.material.opacity=.85*fl;
  bills.forEach((m,i)=>{const on=a>=0&&a<4;m.visible=on;if(!on)return;const ang=hs(i,6)*6.28,vv=14+hs(i,5)*34;m.position.set(Math.cos(ang)*vv*a*.9,YV(5.78)+Math.max(30*a*(.6+hs(i,2))-14*a*a,-YV(5.78)+1.5)+0,Math.sin(ang)*vv*a*.9);m.rotation.set(a*(3+hs(i,7)*4)+i,a*(2+hs(i,8)*3),i)});
  const p1=sm((t-C.maior)/.35)*(1-sm((t-(C.fri-.5))/.3));plq1.material.opacity=plq2.material.opacity=p1;plq1.visible=plq2.visible=p1>.01;plq1.scale.set(21*p1,21*.25*p1,1);plq2.scale.set(21*p1,21*.25*p1,1);
  const f1=sm((t-(C.fri-.3))/.3)*(1-sm((t-(C.jump+1.2))/.3));flagS.visible=flagL.visible=f1>.01;flagS.material.opacity=f1;flagS.scale.set(20*f1,20*.25*f1,1);flagL.scale.x=Math.max(f1,.001);
  band.material.opacity=t>=C.div-.2&&t<C.pack-.2?.28+.18*Math.sin(t*6):0;band.visible=band.material.opacity>0}
 // L1 pilha de dinheiro, Senado e Câmara
 cash.forEach(g=>{const k=sm((t-C.bi-.1-g.userData.i*.045)/.35);g.scale.setScalar(Math.max(k,.001))});
 {const s=sm((t-C.votos)/.3)*(1-sm((t-C.votos-2.2)/.8));cg1.senMat.emissive.setRGB(.05*s,.7*s,.25*s);cg1.senMat.emissiveIntensity=1;
  const b=sm((t-C.cam)/.4)*(1-sm((t-C.cam-3.1)/.7));const pu=.55+.45*Math.sin(t*7);cg1.bowlMat.emissive.setRGB(1*b*pu,.65*b*pu,.12*b*pu);cg1.bowlMat.emissiveIntensity=1}
 // L2 ponteiro
 {const a0=-.5,a1=.95;const k=sm((t-(C.neg-.2))/.9);const wob=t>C.neg+.6?.04*Math.sin((t-C.neg)*14)*Math.exp(-(t-C.neg-.6)*1.4):0;needle.rotation.z=(t<C.neg-.2?a0+.03*Math.sin(t*3):lerp(a0,a1,k)+wob);
  const g=sm((t-C.neg-.6)/.5)*(t<C.focus?1:0);redGlow.material.opacity=.55*g*(.7+.3*Math.sin(t*8));redGlow.scale.setScalar(46)}
 // L3 outdoor
 {const k=sm((t-C.n1275)/.35);numA.material.opacity=1-k;numA.visible=k<.99;numB.material.opacity=k;numB.visible=k>.01;arrB.visible=k>.01;arrB.material.opacity=k;const s=.001+k*(1+.12*Math.sin(Math.min((t-C.n1275)*5,3.14)));numB.scale.set(56*Math.min(s,1.1),56*.2604*Math.min(s,1.1),1);arrB.position.y=-1+(t>C.n1275?.8*Math.sin(t*6):0)}
 // L4 porto
 {const k=sm((t-C.shop-.3)/2.4);lift.position.set(60,lerp(8.6,52,k),lerp(30,105,sm((t-C.shop-1)/2.2)));const tx=60,tz=lift.position.z;trolley.position.set(tx,63,tz);cab.forEach((c,i)=>{const yy=lift.position.y+3;const h=63-yy;c.scale.y=Math.max(h,.1);c.position.set(tx+(i%2?5:-5),yy+h/2,tz+(i<2?2:-2))});
  const pa=sm((t-C.usd)/.35);tgA.scale.set(24*pa,24*.375*pa,1);tgA.visible=pa>.01;tgR.visible=t>=C.ptag-.2;tgR.material.opacity=sm((t-C.ptag+.2)/.3);
  const pb=sm((t-C.ptag)/.35)*(1-sm((t-C.pup)/.3));tgB.visible=pb>.01;tgB.scale.set(24*pb,24*.375*pb,1);
  const pc=sm((t-C.pup)/.4);tgC.visible=pc>.01;tgC.scale.set(26*pc,26*.375*pc,1);tgC.position.y=lerp(30,39,pc)+(t>C.pup+.4?.8*Math.sin(t*5):0)}
 // L5 linha
 {const k=clamp((t-C.vol+.1)/3.6);const n=Math.max(2,Math.floor(k*(NW-1)));waveG.instanceCount=n;const i=Math.min(n,NW-1);waveDot.position.set(wavePts[i*3],wavePts[i*3+1],0);waveGl.position.copy(waveDot.position);waveGl.scale.setScalar(16+4*Math.sin(t*9));const wa=sm((t-C.vol-1.5)/.4);warn.scale.setScalar(Math.max(wa,.001)*(1+.06*Math.sin(t*8)));warn.position.y=-62+0*wa}
 // L6 relógio
 hM.rotation.z=-(t-C.fim)*3.1;hH.rotation.z=-(t-C.fim)*.26;
 // HUDs e título
 hudT('hfirst','+2%',t,C.jump+.9,C.jump+3.6,230,'#3df08c',230);
 hudT('title2','45 × 31',t,C.votos+.2,C.votos+3.0,210,'#fff',215);
 hudT('title3','R$ 50–60 BI',t,C.bi+.2,C.bi+3.8,150,'#3df08c',230);
 hudT('hq','?',t,C.cam+.3,C.cam+3.0,360,'#ffd84a',230);
 hudT('hx','-0,9%',t,C.neg+.2,C.neg+3.4,270,'#ff5a4a',230);
 hudT('title4','⚠',t,C.vol+1.6,C.vol+4.4,260,'#ffd84a',210);
 hudT('h15','',t,0,0,10);
 {const e=$('title');e.style.fontSize='88px';e.innerHTML='DÓLAR DISPAROU<br><b>ACIMA DE R$ 5,75</b>';const k=t<2.9?1:1-sm((t-2.9)/.5);e.style.opacity=k;const pu=t>=C.imp?.16*Math.exp(-(t-C.imp)*7):0;e.style.transform=`translateY(${(1-k)*-60}px) scale(${(1+pu)*(1+(1-k)*.1)})`}
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
 const cx=Math.sin(cp.az)*Math.cos(cp.el),cy=Math.sin(cp.el),cz=Math.cos(cp.az)*Math.cos(cp.el);
 const sh=(clamp(1-Math.abs(t-C.imp-.15)/.6)*1.5+(t<C.imp?.5*t/C.imp:0)+clamp(1-Math.abs(t-C.votos)/.4)*.5)*Math.min(cp.d,70)*.012;
 cam.position.set(cp.tg.x+cx*cp.d+Math.sin(t*37)*sh,cp.tg.y+cy*cp.d+Math.cos(t*29)*sh,cp.tg.z+cz*cp.d);cam.lookAt(cp.tg);cam.rotateZ(cp.roll);cam.setViewOffset(W,H,0,H*.07,W,H);
 const cl=Math.max(0,Math.min(6,Math.round(cam.position.x/1000)));
 scene.children.forEach(o=>{if(o.isLight||o===key.target)return;o.visible=Math.round(o.position.x/1000)===cl});
 const L=LT[cl];key.color.set(L[0]);key.intensity=L[1];hemi.color.set(L[2]);hemi.groundColor.set(L[3]);hemi.intensity=L[4];scene.environmentIntensity=L[5];renderer.toneMappingExposure=L[6];scene.fog.color.set(L[7]);scene.fog.near=L[8];scene.fog.far=L[9];
 key.target.position.copy(LOC(cl));key.position.set(1000*cl+L[10][0],L[10][1],L[10][2]);
 $('flash').style.opacity=clamp(1-Math.abs(t-C.imp)/.1)*.3;$('rew').style.opacity=0;transition(t);caption(t);renderer.render(scene,cam);
}
scene.traverse(o=>{if(o.isMesh&&!o.userData.noShadow&&!(o.material&&o.material.transparent)){o.castShadow=true;o.receiveShadow=true}});
window.setT=setT;window.__ready=true;
