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
// ======== A: CHIP (loc 0) ========
backdrop(0,0x062c38,0x0a5a66,0x14a8a8);floorGrid(0,0x1fffd0,-3,500,.35);const chipLight=new THREE.PointLight(0x76ffd0,14,260,1.2);chipLight.position.set(0,34,0);scene.add(chipLight);
const A=new THREE.Group();A.position.copy(LOC(0));scene.add(A);
A.add(new THREE.Mesh(new THREE.BoxGeometry(140,3,140),new THREE.MeshStandardMaterial({color:0x127a5c,metalness:.3,roughness:.5})));
{const pts=[];for(let i=0;i<90;i++){let x=(hs(i,1)-.5)*130,z=(hs(i,2)-.5)*130;const L=10+hs(i,3)*40;const d=hs(i,4)>.5;pts.push(x,1.7,z,d?x+L:x,1.7,d?z:z+L)}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));A.add(new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0x34ffc0})))}
const die=new THREE.Mesh(new THREE.BoxGeometry(50,4,50),metal(0x9aa0a8,1,.25));die.position.y=5.5;A.add(die);
const lid=new THREE.Mesh(new THREE.BoxGeometry(56,2.4,56),metal(0xc3c8d0,1,.18));lid.position.y=9;A.add(lid);
const core=new THREE.Mesh(new THREE.BoxGeometry(30,.6,30),new THREE.MeshBasicMaterial({color:0x76ff7a}));core.position.y=10.4;A.add(core);
for(const s of[-1,1])for(let k=0;k<3;k++){const h=new THREE.Mesh(new THREE.BoxGeometry(12,5,22),metal(0x15171c,.6,.5));h.position.set(s*44,4,(k-1)*26);A.add(h)}
const shockA=new THREE.Mesh(new THREE.TorusGeometry(1,.04,8,64),new THREE.MeshBasicMaterial({color:0x76ffd0,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));shockA.rotation.x=Math.PI/2;A.add(shockA);
const pulsesA=[];for(let i=0;i<14;i++)pulsesA.push(spr(0x76ffd0,1));
const glowA=spr(0x76ff7a,.9);glowA.position.copy(LOC(0)).add(V3(0,12,0));
// ======== B: SKYLINE + CALENDÁRIO (loc 1) ========
backdrop(1,0x0b1a55,0x7a3a6a,0xff8a3a);
const Bg=new THREE.Group();Bg.position.copy(LOC(1));scene.add(Bg);
{const winT=tex((g,w,h)=>{g.fillStyle='#10131c';g.fillRect(0,0,w,h);for(let y=4;y<h;y+=10)for(let x=4;x<w;x+=10){g.fillStyle=hs(x*7+y,5)>.45?'#ffd27a':'#232736';g.fillRect(x,y,6,6)}},128,256);winT.wrapS=winT.wrapT=THREE.RepeatWrapping;
 for(let i=0;i<150;i++){const gx=(i%15-7)*16+(hs(i,1)-.5)*4,gz=-Math.floor(i/15)*18-20+(hs(i,2)-.5)*4;const hgt=14+hs(i,3)*86,w=8+hs(i,4)*5;
  const t=winT.clone();t.repeat.set(1,hgt/40);t.needsUpdate=true;const b=new THREE.Mesh(new THREE.BoxGeometry(w,hgt,w),new THREE.MeshStandardMaterial({color:0x2a2f45,emissive:0xffffff,emissiveMap:t,emissiveIntensity:.9,metalness:.3,roughness:.6}));b.position.set(gx,hgt/2,gz);Bg.add(b)}}
const sunB=spr(0xff9a40,1);sunB.scale.setScalar(160);const discB=new THREE.Mesh(new THREE.CircleGeometry(26,48),new THREE.MeshBasicMaterial({color:0xffd9a0}));Bg.add(discB);
const calTex=tex((g,w,h)=>{g.fillStyle='#fff';g.fillRect(0,0,w,h);g.fillStyle='#d63b3b';g.fillRect(0,0,w,110);g.fillStyle='#fff';g.font='900 78px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('NOV',w/2,58);
 g.fillStyle='#223';g.font='800 40px sans-serif';const cw=w/7;for(let d=1;d<=30;d++){const c=(d+5)%7,r=Math.floor((d+5)/7);const x=cw*c+cw/2,y=170+r*74;if(d===17){g.fillStyle='#01c98a';g.beginPath();g.arc(x,y,34,0,6.3);g.fill();g.fillStyle='#fff'}else g.fillStyle='#223';g.fillText(String(d),x,y)}},512,640);
const cal=new THREE.Mesh(new THREE.PlaneGeometry(52,65),new THREE.MeshStandardMaterial({map:calTex,roughness:.6,emissive:0xffffff,emissiveMap:calTex,emissiveIntensity:.35}));Bg.add(cal);
// ======== C: LINHA DO TEMPO (loc 2) ========
backdrop(2,0x020a1f,0x06204a,0x0a3a78);floorGrid(2,0x3a7ad0,-4,500,.4);
const Cg=new THREE.Group();Cg.position.copy(LOC(2));scene.add(Cg);const monthB=[];
['AGO','SET','OUT'].forEach((m,i)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(34,16,16),[0,1,2,3,4,5].map(f=>f===4?new THREE.MeshStandardMaterial({map:label(m,256,128,'#fff','#1d6bff',84),roughness:.4}):new THREE.MeshStandardMaterial({color:0x1d6bff,roughness:.4})));b.position.set((i-1)*40,8,0);Cg.add(b);monthB.push(b)});
// ======== D: BARRA DE RECEITA (loc 3) ========
backdrop(3,0x020a1f,0x08234f,0x0d3a78);floorGrid(3,0x4a8ae0,0,500,.5);
const Dg=new THREE.Group();Dg.position.copy(LOC(3));scene.add(Dg);
const bar=new THREE.Mesh(new THREE.BoxGeometry(30,1,30),new THREE.MeshStandardMaterial({color:0x2fcf6a,roughness:.35,metalness:.2,emissive:0x0a5a2a,emissiveIntensity:.5}));Dg.add(bar);
const band=new THREE.Mesh(new THREE.BoxGeometry(34,3,34),new THREE.MeshBasicMaterial({color:0xcfffe0,transparent:true,opacity:.45,blending:THREE.AdditiveBlending,depthWrite:false}));Dg.add(band);
const goalLine=new THREE.Mesh(new THREE.BoxGeometry(80,.4,.4),new THREE.MeshBasicMaterial({color:0xffe27a}));Dg.add(goalLine);
// ======== E: 100 MOEDAS (loc 4) ========
backdrop(4,0x0b0420,0x1a0a40,0x2b1260);floorGrid(4,0x7a4ad0,-.5,400,.3);
const Eg=new THREE.Group();Eg.position.copy(LOC(4));scene.add(Eg);const coinsE=[];
{const gm=new THREE.MeshStandardMaterial({color:0x2fcf6a,metalness:.6,roughness:.3,emissive:0x0a5a2a,emissiveIntensity:.4}),rm=new THREE.MeshStandardMaterial({color:0xe5483b,metalness:.6,roughness:.3,emissive:0x5a0f0a,emissiveIntensity:.4});
 const order=[...Array(100).keys()].sort((a,b)=>hs(a,7)-hs(b,7));const red=new Set(order.slice(0,26));
 for(let i=0;i<100;i++){const c=new THREE.Mesh(new THREE.CylinderGeometry(3.4,3.4,1.1,28),red.has(i)?rm:gm);c.userData={red:red.has(i),i};c.position.set((i%10-4.5)*8.2,.6,(Math.floor(i/10)-4.5)*8.2);Eg.add(c);coinsE.push(c)}}
// ======== F: DATA CENTER (loc 5) ========
backdrop(5,0x010308,0x04101e,0x081a30);
const Fg=new THREE.Group();Fg.position.copy(LOC(5));scene.add(Fg);
{const fl=new THREE.Mesh(new THREE.PlaneGeometry(400,600),new THREE.MeshStandardMaterial({color:0x0b1018,roughness:.35,metalness:.6}));fl.rotation.x=-Math.PI/2;Fg.add(fl)}
const ledN=28*40;const ledM=new THREE.InstancedMesh(new THREE.BoxGeometry(.7,.7,.4),new THREE.MeshBasicMaterial({color:0xffffff}),ledN);Fg.add(ledM);
{let n=0;const rk=new THREE.MeshStandardMaterial({color:0x14181f,metalness:.7,roughness:.4});const m4=new THREE.Matrix4();
 for(let side=-1;side<=1;side+=2)for(let r=0;r<14;r++){const b=new THREE.Mesh(new THREE.BoxGeometry(6,22,7),rk);b.position.set(side*14,11,-r*12+30);Fg.add(b);
  for(let k=0;k<40;k++){const col=k%8,row=Math.floor(k/8);m4.makeTranslation(side*14-side*3.1,2+row*4+col*0+(k%2)*.5,-r*12+30-2.8+col*.8);ledM.setMatrixAt(n++,m4)}}}
// ======== G: PORTÃO CHINA (loc 6) ========
backdrop(6,0x0a0f18,0x1a2433,0x2a3a50);floorGrid(6,0x6a8ab0,0,500,.35);
const Gg=new THREE.Group();Gg.position.copy(LOC(6));scene.add(Gg);
const chipG=new THREE.Group();{const b=new THREE.Mesh(new THREE.BoxGeometry(18,3,18),new THREE.MeshStandardMaterial({color:0x0c4a38,metalness:.3,roughness:.5}));const d=new THREE.Mesh(new THREE.BoxGeometry(11,3,11),metal(0xc3c8d0,1,.2));d.position.y=3;chipG.add(b,d);Gg.add(chipG)}
const redM=new THREE.MeshStandardMaterial({color:0xe5483b,emissive:0x7a1008,emissiveIntensity:.8,roughness:.4});
for(const s of[-1,1]){const p=new THREE.Mesh(new THREE.BoxGeometry(4,36,4),redM);p.position.set(s*18,18,0);Gg.add(p)}
const topG=new THREE.Mesh(new THREE.BoxGeometry(44,10,4),new THREE.MeshStandardMaterial({map:label('CHINA',512,128,'#fff','#c93a2f',92),roughness:.5}));topG.position.set(0,40,0);Gg.add(topG);
const barG=new THREE.Mesh(new THREE.BoxGeometry(32,3,2),redM);barG.position.set(0,12,0);Gg.add(barG);
const xG=spr(0xff3b30,1);Gg.add(xG);
// ======== H: MEDIDOR (loc 7) ========
backdrop(7,0x010615,0x04122e,0x0a2552,true);
const Hg=new THREE.Group();Hg.position.copy(LOC(7));scene.add(Hg);
{const arc=new THREE.Mesh(new THREE.TorusGeometry(40,2.2,16,80,Math.PI),new THREE.MeshStandardMaterial({color:0x2a4a90,metalness:.4,roughness:.4}));Hg.add(arc);
 const ok=new THREE.Mesh(new THREE.TorusGeometry(40,2.6,16,30,Math.PI*.28),new THREE.MeshStandardMaterial({color:0x2fcf6a,emissive:0x0a5a2a,emissiveIntensity:.7}));ok.rotation.z=0;Hg.add(ok);
 for(let i=0;i<=10;i++){const a=Math.PI*i/10;const t=new THREE.Mesh(new THREE.BoxGeometry(.8,5,.8),new THREE.MeshBasicMaterial({color:0xaac4ff}));t.position.set(Math.cos(a)*34,Math.sin(a)*34,0);t.rotation.z=a-Math.PI/2;Hg.add(t)}}
const needle=new THREE.Group();{const n=new THREE.Mesh(new THREE.BoxGeometry(1.6,36,1.2),new THREE.MeshStandardMaterial({color:0xffe27a,emissive:0x7a5a10,emissiveIntensity:.8}));n.position.y=18;needle.add(n);needle.add(new THREE.Mesh(new THREE.SphereGeometry(3.4,20,12),metal(0xdddddd,1,.2)))}Hg.add(needle);
const targetMark=new THREE.Mesh(new THREE.BoxGeometry(1.6,12,1.6),new THREE.MeshBasicMaterial({color:0xffffff}));Hg.add(targetMark);
// ======== I: CANDLES (loc 8) ========
backdrop(8,0x021418,0x06282e,0x0b3a44);floorGrid(8,0x2fc9b0,0,600,.4);
const Ig=new THREE.Group();Ig.position.copy(LOC(8));scene.add(Ig);const candles=[];
{let p=20;for(let i=0;i<34;i++){const o=p;const dlt=(hs(i,2)-.35)*10;p=Math.max(8,p+dlt);const up=p>=o,hi=Math.max(o,p)+hs(i,3)*5,lo=Math.min(o,p)-hs(i,4)*5;const mat=new THREE.MeshStandardMaterial({color:up?0x2fcf6a:0xe5483b,emissive:up?0x0a5a2a:0x5a0f0a,emissiveIntensity:.6,roughness:.4});
 const body=new THREE.Mesh(new THREE.BoxGeometry(4,Math.max(Math.abs(p-o),1),4),mat);body.position.set((i-17)*7,(o+p)/2,0);const wick=new THREE.Mesh(new THREE.BoxGeometry(.7,hi-lo,.7),mat);wick.position.set((i-17)*7,(hi+lo)/2,0);Ig.add(body,wick);candles.push([body,wick])}}
// ---------- poses e câmera ----------
const loc=i=>LOC(i);
function target(n,t){switch(n){
 case 'chip':return loc(0).add(V3(0,6,0));case 'cal':return loc(1).add(V3(0,52,34));case 'sky':return loc(1).add(V3(0,36,-40));
 case 'tl':return loc(2).add(V3(0,8,0));case 'bar':{const k=sm((t-C.rev-.3)/3);return loc(3).add(V3(0,lerp(6,38,k),0))}
 case 'coins':return loc(4).add(V3(0,2,0));case 'aisle':{const k=clamp((t-C.dc)/(C.cn-C.dc-1));return loc(5).add(V3(0,12,lerp(30,-130,k)))}
 case 'gate':return loc(6).add(V3(0,18,0));case 'gauge':return loc(7).add(V3(0,24,0));case 'candle':{const k=clamp((t-C.mkt)/(C.end-C.mkt-1));return loc(8).add(V3(lerp(-80,60,k),24,0))}}return V3()}
const K=[['teaser',0,'chip',200,-20,22,34,.01,''],['imp',-.15,'chip',150,30,26,30,.35,''],['imp',1.2,'chip',230,70,34,38,1.2,''],
 ['date',-.1,'cal',150,-10,6,40,.01,'wipe'],['date',2.4,'sky',270,40,16,40,1.3,''],
 ['q',-.1,'tl',170,-25,18,38,.01,'iris'],['q',2.2,'tl',140,28,12,34,1.0,''],
 ['rev',-.1,'bar',250,-35,-4,38,.01,'dipw'],['rev',3.0,'bar',220,25,12,40,1.4,''],
 ['mar',-.1,'coins',330,0,62,40,.01,'slide'],['mar',3.8,'coins',210,35,30,38,1.2,''],
 ['dc',-.1,'aisle',95,0,8,40,.01,'dipb'],['dc',3.5,'aisle',80,18,12,40,1.0,''],
 ['cn',-.15,'gate',140,-60,8,38,.01,'wipe2'],['cn',2.6,'gate',115,15,10,36,1.2,''],
 ['beat',-.1,'gauge',190,0,6,40,.01,'iris2'],['beat',3.6,'gauge',150,-25,12,36,1.3,''],
 ['mkt',-.1,'candle',210,-35,10,40,.01,'dip'],['mkt',3.6,'candle',240,30,22,40,1.4,''],
 ['end',-.1,'chip',150,25,22,36,.01,'flash'],['end',2.4,'chip',300,-35,32,44,2.6,''],['cmt',0,'chip',340,30,22,40,1.4,'']];
function cbez(x1,y1,x2,y2){return k=>{if(k<=0)return 0;if(k>=1)return 1;let lo=0,hi=1,u=k;for(let i=0;i<22;i++){const x=3*(1-u)*(1-u)*u*x1+3*(1-u)*u*u*x2+u*u*u;if(x<k)lo=u;else hi=u;u=(lo+hi)/2}return 3*(1-u)*(1-u)*u*y1+3*(1-u)*u*u*y2+u*u*u}}
const EASE=[cbez(.65,0,.35,1),cbez(.08,.9,.2,1),cbez(.34,1.5,.64,1),cbez(.8,0,.2,1)];
const KT=K.map((k,i)=>({e:[1,0,2,3][i%4],t:(C[k[0]]??0)+k[1],tg:k[2],d:k[3],az:k[4]*Math.PI/180,el:k[5]*Math.PI/180,fov:k[6],dur:k[7],tr:k[8]}));
function camPose(t){let j=0;for(let i=0;i<KT.length;i++){if(KT[i].t-KT[i].dur*.75<=t)j=i}
 const b=KT[j],a=KT[Math.max(j-1,0)];const k=j===0?1:EASE[b.e](clamp((t-(b.t-b.dur*.75))/b.dur));
 const tg=target(a.tg,t).lerp(target(b.tg,t),k);const dt=Math.max(t-b.t,0);
 const d=Math.exp(lerp(Math.log(a.d),Math.log(b.d*(1-.05*clamp(dt/4))),k)),az=lerp(a.az,b.az+dt*.05,k),el=lerp(a.el,b.el,k),fov=lerp(a.fov,b.fov,k);return{tg,d,az,el,fov}}
// transições de cena (cada uma diferente)
const TR=KT.filter(k=>k.tr);
function transition(t){const e=document.getElementById('tr');let on=null;for(const k of TR){const a=t-(k.t-.05);if(a>-.28&&a<.32){on=[k,a]}}
 if(!on){e.style.opacity=0;return}const [k,a]=on;const p=sm((a+.28)/.6);const tri=1-Math.abs(p*2-1);e.style.opacity=1;
 const cols={dip:'#000',dipw:'#0a2a66',dipb:'#02050a',flash:'#fff',wipe:'#01FBB4',wipe2:'#e5483b',iris:'#06204a',iris2:'#0a2552',slide:'#7a4ad0'};e.style.background=cols[k.tr]||'#000';
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
 // A: chip
 {const a=t-C.imp;const ph0=t<C.imp?((t*1.1)%1):-1;shockA.visible=ph0>=0||(a>=0&&a<1.6);if(shockA.visible){const k=ph0>=0?ph0:a/1.6;shockA.position.y=11;shockA.scale.setScalar(4+110*(1-Math.pow(1-k,3)));shockA.material.opacity=(ph0>=0?.6:.9)*(1-k)}
  pulsesA.forEach((s,i)=>{const dir=i%4,sgn=dir<2?1:-1,ax=dir%2===0;const ph=((t*.9+hs(i,1))%1);const off=(hs(i,2)-.5)*50;const r=20+ph*60;s.position.set(LOC(0).x+(ax?sgn*r:off),2.6,LOC(0).z+(ax?off:sgn*r));s.scale.setScalar(5);s.material.opacity=.9*(1-ph)});
  glowA.scale.setScalar(110+14*Math.sin(t*4)+(a>=0&&a<.5?120*(1-a/.5):0));core.material.color.setHSL(.33,.9,.55+.1*Math.sin(t*6))}
 // B: sol se pondo
 {const k=clamp((t-C.date)/6);sunB.position.copy(LOC(1)).add(V3(0,lerp(60,6,k),-170));discB.position.copy(sunB.position).add(V3(0,0,3));cal.position.set(0,52,34);cal.rotation.y=Math.sin(t*.6)*.08}
 // C: meses
 monthB.forEach((b,i)=>{const k=sm((t-C.q-.5-i*.9)/.5);b.scale.set(1,Math.max(k,.001),1);b.position.y=8*k});
 // D: barra
 {const k=sm((t-C.rev-.3)/3);const h=Math.max(1,78*k);bar.scale.y=h;bar.position.y=h/2;band.position.y=h;band.scale.y=k>0?1:.001;goalLine.position.y=78;goalLine.visible=k>.02;band.visible=k>.02}
 hudT('h15','US$ 108 BI',t,C.rev+.4,C.rev+4.2,150);
 // E: moedas
 {const a=t-C.mar-3.6;coinsE.forEach(c=>{const f=clamp(a/1.6);if(c.userData.red){c.position.y=.6-sm(f)*40;c.rotation.x=sm(f)*5;c.visible=f<.98}else{c.position.y=.6+sm(f)*4*(.5+hs(c.userData.i,3)*.5);}})}
 hudT('hfirst','74%',t,C.mar+4.4,C.mar+8.2,300);
 // F: LEDs piscando
 {const col=new THREE.Color();for(let i=0;i<ledN;i++){const ph=Math.floor(t*6+hs(i,4)*10);const on=hs(i,ph)>.4;const g=hs(i,9)>.8;col.setRGB(on?(g?.2:.1):.02,on?(g?1:.55):.04,on?(g?.4:1):.1);ledM.setColorAt(i,col)}ledM.instanceColor.needsUpdate=true}
 // G: portão
 {const a=t-C.cn;const k=clamp((a-.3)/1.6);const x=lerp(-70,-24,sm(k));const bounce=a>2.0?-sm((a-2.0)/.8)*30:0;chipG.position.set(x+bounce,2,0);xG.position.set(0,24,2);xG.scale.setScalar(a>1.9?70+10*Math.sin(t*10):.001);xG.material.opacity=a>1.9?.9:0}
 // H: ponteiro
 {const a=t-C.beat;const target=Math.PI*(1-.72);const k=EASE[2](clamp((a-.3)/2.2));const ang=Math.PI/2-(lerp(.0,1.0,k)*Math.PI*.9);needle.rotation.z=ang+Math.sin(t*14)*.01*(a>2.5?1:0);targetMark.position.set(Math.cos(target)*40,Math.sin(target)*40,0);targetMark.rotation.z=target-Math.PI/2}
 // I: candles crescem
 candles.forEach(([b,w],i)=>{const k=sm((t-C.mkt-.2-i*.08)/.4);b.scale.y=Math.max(k,.001);w.scale.y=Math.max(k,.001)});
 hudT('title2','17 NOV',t,C.date+.2,C.date+3.2,230);
 // título de capa
 {const e=$('title');e.style.fontSize='84px';e.innerHTML='NVIDIA ABRE<br><b>AS CONTAS AMANHÃ</b>';const k=t<2.9?1:1-sm((t-2.9)/.5);e.style.opacity=k;const pu=t>=C.imp?.16*Math.exp(-(t-C.imp)*7):0;e.style.transform=`translateY(${(1-k)*-60}px) scale(${(1+pu)*(1+(1-k)*.1)})`}
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
 const cx=Math.sin(cp.az)*Math.cos(cp.el),cy=Math.sin(cp.el),cz=Math.cos(cp.az)*Math.cos(cp.el);const sh=clamp(1-Math.abs(t-C.imp-.15)/.6)*(t>=C.imp-.1?1.3:0)+(t<C.imp?.4*(t/C.imp):0);
 cam.position.set(cp.tg.x+cx*cp.d+Math.sin(t*37)*sh,cp.tg.y+cy*cp.d+Math.cos(t*29)*sh,cp.tg.z+cz*cp.d);cam.lookAt(cp.tg);cam.setViewOffset(W,H,0,H*.03,W,H);
 {const cl=Math.round(cam.position.x/1000);scene.children.forEach(o=>{if(o.isLight)return;o.visible=Math.round(o.position.x/1000)===cl})}
 $('flash').style.opacity=clamp(1-Math.abs(t-C.imp)/.1)*.3;$('rew').style.opacity=0;transition(t);caption(t);comp.render();
}
window.setT=setT;window.__ready=true;
