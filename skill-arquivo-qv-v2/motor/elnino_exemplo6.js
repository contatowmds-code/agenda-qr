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
// PLANO DE CENA (estilo aprovado: mundo 3D realista/esquemático, cores com sentido: quente=laranja/vermelho, frio=azul)
// imp   | oceano ao pôr do sol, mancha quente se expande | baixo, soco | gancho | oceano + céu
// what  | corte do Pacífico: camada de água quente      | frontal      | definição | azul-marinho de diagrama
// wind  | ventos empurram água quente p/ oeste           | lateral      | normal | diagrama
// weak  | ventos fracos, água quente avança p/ leste     | acompanha    | El Niño | diagrama
// nasa  | satélite mede o nível do mar na Terra          | órbita       | dados | espaço
// willis| saliência do nível do mar com faixa de incerteza | frontal    | melhor palpite | diagrama
// noaa  | duas fatias (1997 x 2026)                      | frontal      | comparação | diagrama
// br    | esquema do Brasil: Sul azul/chuva, resto laranja/seca | de cima | impactos | cinza-azulado
// agro  | Matopiba destacado                             | aproxima     | agro | idem
// cav   | contorno pulsando (incerteza)                  | afasta       | ressalva | idem
// fim   | oceano calmo, mancha quente diminui, recuo     | recuo        | fecho | oceano

const R=4000,EC=new THREE.Vector3(1000*3,-R,0);

function mkLabel(g,txt,x,y,w,col='#fff'){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,w*.3),new THREE.MeshBasicMaterial({map:label(txt,256,76,col,'rgba(0,0,0,0)',58),transparent:true}));m.position.set(x,y,0);g.add(m);return m}
import {Line2} from 'three/addons/lines/Line2.js';import {LineMaterial} from 'three/addons/lines/LineMaterial.js';import {LineGeometry} from 'three/addons/lines/LineGeometry.js';
function mkLine(g,col,lw,op=1){const ge=new LineGeometry();ge.setPositions([0,0,0,1,0,0]);const m=new LineMaterial({color:col,linewidth:lw,transparent:true,opacity:op});m.resolution.set(W,H);const l=new Line2(ge,m);g.add(l);return l}
const NZ=`float h3(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float n2(vec2 x){vec2 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(h3(i),h3(i+vec2(1,0)),f.x),mix(h3(i+vec2(0,1)),h3(i+vec2(1,1)),f.x),f.y);}`;
// ===== L0: OCEANO (gancho e fecho) =====
backdrop(0,0x0a2a6a,0x5a8ac8,0xffb070);
const A0=new THREE.Group();A0.position.copy(LOC(0));scene.add(A0);
const oceanMat=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uR:{value:0},uK:{value:1}},
 vertexShader:`uniform float uT;varying vec2 vP;varying float vH;${NZ}void main(){vP=position.xy;float h=sin(position.x*.07+uT*1.2)*1.2+sin(position.y*.09-uT*1.5)*.9+n2(position.xy*.05+uT*.1)*1.5;vH=h;vec3 p=position;p.z+=h;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
 fragmentShader:`uniform float uT,uR,uK;varying vec2 vP;varying float vH;${NZ}
 vec3 ramp(float t){vec3 a=vec3(.0,.08,.32),b=vec3(.03,.4,.7),c=vec3(1.,.8,.15),d=vec3(1.,.2,.03);return t<.33?mix(a,b,t/.33):(t<.66?mix(b,c,(t-.33)/.33):mix(c,d,(t-.66)/.34));}
 void main(){float d=length(vP-vec2(60.,0.));float warm=smoothstep(uR,uR*.35,d)*uK*(.75+.25*n2(vP*.08+uT*.2));vec3 col=ramp(.12+warm*.88);col*=.9+.1*vH*.3;float sp=pow(max(0.,1.-abs(vP.y)*.012),6.)*(.5+.5*n2(vP*.5+uT*2.));col+=vec3(1.,.7,.4)*sp*.06;gl_FragColor=vec4(col,1.);}`});
const ocean=new THREE.Mesh(new THREE.PlaneGeometry(900,900,220,220),oceanMat);ocean.rotation.x=-Math.PI/2;A0.add(ocean);
const sunO=spr(0xffc080,1);sunO.scale.setScalar(150);const shockO=new THREE.Mesh(new THREE.TorusGeometry(1,.05,8,64),new THREE.MeshBasicMaterial({color:0xfff0c0,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));shockO.rotation.x=Math.PI/2;A0.add(shockO);
// ===== L1: CORTE DO PACÍFICO =====
backdrop(1,0x01060f,0x03122a,0x082044);
const B1=new THREE.Group();B1.position.copy(LOC(1));scene.add(B1);
const SW=130,SH=44;
const secMat=new THREE.ShaderMaterial({transparent:true,uniforms:{uPc:{value:.2},uW:{value:.25},uAmp:{value:1},uBase:{value:0},uTop:{value:0},uBul:{value:.1}},
 vertexShader:`varying vec2 vP;void main(){vP=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`uniform float uPc,uW,uAmp,uBase,uBul;varying vec2 vP;
 vec3 ramp(float t){vec3 a=vec3(.02,.12,.4),b=vec3(.05,.5,.8),c=vec3(1.,.85,.2),d=vec3(1.,.25,.05);return t<.33?mix(a,b,t/.33):(t<.66?mix(b,c,(t-.33)/.33):mix(c,d,(t-.66)/.34));}
 void main(){float u=(vP.x+${SW/2}.)/${SW}.;float surf=6.+uBul*${SH}.*exp(-pow((u-uPc)/uW,2.));float dep=surf-vP.y;if(dep<0.)discard;float pool=exp(-pow((u-uPc)/uW,2.));float layer=3.+uAmp*13.*pool;float T=exp(-dep/layer)*(.35+.65*pool)+uBase*exp(-dep/9.);gl_FragColor=vec4(ramp(clamp(T,0.,1.)),.96);}`});
const sec=new THREE.Mesh(new THREE.PlaneGeometry(SW,SH),secMat);B1.add(sec);
const surfL=mkLine(B1,0xffffff,4);const surf97=mkLine(B1,0xbfe0ff,3,.0);
mkLabel(B1,'OESTE',-52,-26,26);mkLabel(B1,'LESTE',52,-26,26);
const winds=[];for(let i=0;i<30;i++){const s=spr(0xffffff,.9);s.scale.set(7,1.4,1);winds.push(s)}
const bandU=spr(0xffffff,.5);bandU.visible=false;
function secSurf(l,pc,w,bul,off=0){const p=[];for(let i=0;i<120;i++){const u=i/119;const x=-SW/2+u*SW;p.push(x,6+bul*SH*Math.exp(-Math.pow((u-pc)/w,2))+off,0.2)}l.geometry.setPositions(p)}
// ===== L3: SATÉLITE (espaço) =====
backdrop(3,0x00020a,0x00040f,0x010a1c,true);
// Terra
const NOISE=`float h3(vec3 p){p=fract(p*0.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float n3(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*n3(p);p*=2.03;a*=.5;}return s;}`;
const earthMat=new THREE.ShaderMaterial({uniforms:{uC:{value:new THREE.Vector3()},uT:{value:0},uSun:{value:V3(-300,260,420).normalize()}},
 vertexShader:`varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,
 fragmentShader:`${NOISE} uniform float uT;uniform vec3 uSun,uC;varying vec3 vW;
 void main(){vec3 c=uC;vec3 n=normalize(vW-c);vec3 d=n*3.;
  float land=fbm(d*1.1+4.)+.35*fbm(d*5.)+.08*fbm(vW*.02);float coast=smoothstep(.52,.56,land);
  vec3 ocean=mix(vec3(.0,.15,.7),vec3(.0,.55,.95),fbm(d*8.));vec3 grass=mix(vec3(.05,.6,.15),vec3(.85,.7,.1),fbm(d*4.+9.));vec3 col=mix(ocean,grass,coast);
  col*=.88+.24*fbm(vW*.35);float cl=smoothstep(.5,.78,fbm(d*3.+vec3(uT*.01,0,0)+20.));col=mix(col,vec3(.92),cl*.55);
  float dif=clamp(dot(n,uSun)*.85+.2,.05,1.);col*=dif;vec3 V=normalize(cameraPosition-vW);float fr=pow(1.-clamp(dot(n,V),0.,1.),2.5);col+=vec3(.25,.5,1.)*fr*.9*clamp(dot(n,uSun)+.4,0.,1.);gl_FragColor=vec4(col,1.);}`});
const earth=new THREE.Mesh(new THREE.SphereGeometry(R,128,96),earthMat);earth.position.copy(EC);earthMat.uniforms.uC.value.copy(EC);scene.add(earth);
const atm=new THREE.Mesh(new THREE.SphereGeometry(R*1.03,96,64),new THREE.ShaderMaterial({transparent:true,side:THREE.BackSide,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{k:{value:1}},
 vertexShader:`varying vec3 vN;void main(){vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`uniform float k;varying vec3 vN;void main(){float i=pow(max(.62-dot(vN,vec3(0,0,1)),0.),3.5)*3.2*k;gl_FragColor=vec4(vec3(.3,.6,1.)*i,i);}`}));atm.position.copy(EC);scene.add(atm);

const sat=new THREE.Group();{const body=new THREE.Mesh(new THREE.BoxGeometry(6,6,8),metal(0xd9a73a,.9,.35));sat.add(body);for(const s of[-1,1]){const p=new THREE.Mesh(new THREE.BoxGeometry(16,.3,6),new THREE.MeshStandardMaterial({color:0x2a58c8,metalness:.8,roughness:.3,emissive:0x0a1a40,emissiveIntensity:.4}));p.position.set(s*11,0,0);sat.add(p)}const dish=new THREE.Mesh(new THREE.CylinderGeometry(3.4,.4,.8,24),metal(0xe8eaee,.4,.45));dish.position.y=-4.2;sat.add(dish)}scene.add(sat);
const beam=new THREE.Mesh(new THREE.ConeGeometry(10,130,24,1,true),new THREE.MeshBasicMaterial({color:0x5fe0ff,transparent:true,opacity:.28,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));scene.add(beam);
// ===== L2: MAPA ESQUEMÁTICO DO BRASIL =====
backdrop(2,0x07101e,0x0d1c32,0x14283f);floorGrid(2,0x3a5a90,-.5,500,.25);
const M2=new THREE.Group();M2.position.copy(LOC(2));scene.add(M2);
const BR=[[-51.6,4.3],[-50,1.8],[-48.5,-1],[-44.5,-2.4],[-40,-2.9],[-37.2,-4.9],[-35.2,-5.5],[-34.8,-7.5],[-35.5,-9.5],[-37.3,-11.5],[-38.5,-13],[-39,-16.5],[-39.7,-19.5],[-40.9,-21.5],[-41.8,-23],[-44,-23.4],[-46.5,-24],[-48.6,-26],[-48.5,-28.5],[-50.2,-30.5],[-52.5,-33],[-53.4,-33.7],[-53.4,-32],[-55.5,-30.5],[-57.6,-30.2],[-56,-28],[-54,-27],[-53.7,-25.6],[-54.6,-24],[-55.7,-22],[-57.5,-22],[-58.1,-20],[-57.8,-17.5],[-60.2,-16.2],[-60,-13.5],[-63.5,-12],[-65.2,-10],[-69,-11],[-72.8,-9.5],[-73.5,-7.5],[-70,-4.2],[-69.5,-1.5],[-70,.5],[-67,2],[-64.5,4.2],[-60,5],[-59.8,2.5],[-56.5,2],[-54,2.3]];
const KX=2.2,mx=lon=>(lon+54)*KX,my=lat=>(lat+14)*KX;
{const sh=new THREE.Shape();BR.forEach(([lo,la],i)=>{const x=mx(lo),y=my(la);i?sh.lineTo(x,y):sh.moveTo(x,y)});sh.closePath();
 const mat=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uK:{value:0}},vertexShader:`varying vec2 vP;void main(){vP=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`uniform float uT,uK;varying vec2 vP;void main(){float lon=vP.x/${KX}-54.,lat=vP.y/${KX}-14.;vec3 neutral=vec3(.32,.5,.36);vec3 wet=vec3(.1,.5,1.);vec3 dry=vec3(1.,.55,.12);
   float south=1.-smoothstep(-23.5,-21.5,lat);float dryM=0.;float nort=smoothstep(-11.,-9.,lat)*(1.-smoothstep(-47.,-44.,lon))*(1.-south);float nord=step(-46.5,lon)*step(lat,-1.)*step(-17.,lat);float co=step(-62.,lon)*step(lon,-46.)*step(-24.,lat)*step(lat,-10.);
   dryM=clamp(max(max(nort,nord),co)*(1.-south),0.,1.);vec3 col=mix(neutral,dry,dryM*uK);col=mix(col,wet,south*uK);col*=.9+.1*sin((lon+lat)*2.+uT);gl_FragColor=vec4(col,1.);}`});
 const mesh=new THREE.Mesh(new THREE.ShapeGeometry(sh),mat);M2.add(mesh);window.__brMat=mat;
 const pts=[];BR.concat([BR[0]]).forEach(([lo,la])=>pts.push(mx(lo),my(la),.4));const ln=mkLine(M2,0xffffff,3);ln.geometry.setPositions(pts)}
const MATO=[[-48,-2.5],[-42.5,-2.5],[-41,-10],[-43,-14],[-46,-14],[-49,-10],[-48,-2.5]];
const matoL=mkLine(M2,0xffe066,6,0);{const pts=[];MATO.forEach(([lo,la])=>pts.push(mx(lo),my(la),.8));matoL.geometry.setPositions(pts)}
const clouds=[];for(let i=0;i<14;i++){const s=spr(0xdfeaff,.5);s.scale.setScalar(5+hs(i,1)*4);clouds.push(s)}
const suns=[];for(let i=0;i<12;i++){const s=spr(0xffa030,.7);s.scale.setScalar(5);suns.push(s)}
const rain=[];for(let i=0;i<40;i++){const s=spr(0x9fd0ff,.9);s.scale.set(.9,6,1);rain.push(s)}
const qm=[];for(let i=0;i<3;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(10,10),new THREE.MeshBasicMaterial({map:label('?',128,128,'#fff','rgba(0,0,0,0)',110),transparent:true,opacity:0}));M2.add(m);qm.push(m)}
const mapC=()=>LOC(2).clone().add(V3(mx(-54)*0+0,0,0));
// ---------- poses e câmera ----------
const loc=i=>LOC(i);
function target(n,t){switch(n){
 case 'oc':return loc(0).add(V3(60,4,0));case 'sec':return loc(1).add(V3(0,6,0));case 'sat':return sat.position.clone();case 'map':return loc(2).add(V3(my(0)*0+0,my(-12)-my(-14)+0,0)).add(V3(0,0,0));
 case 'mato':return loc(2).add(V3(mx(-45),my(-8),0))}return loc(0)}
const K=[['teaser',0,'oc',130,-10,6,38,.01,''],['imp',-.15,'oc',95,25,8,30,.35,''],['imp',1.2,'oc',230,60,16,40,1.2,''],
 ['what',-.1,'sec',360,0,4,38,.01,'dip'],['what',3.0,'sec',320,-12,6,36,1.2,''],
 ['wind',-.1,'sec',300,15,4,36,.9,''],['weak',-.1,'sec',330,-15,5,38,.9,''],
 ['nasa',-.1,'sat',170,40,10,38,.01,'iris'],['nasa',4.0,'sat',240,-30,16,40,1.4,''],
 ['willis',-.1,'sec',250,0,0,36,.01,'wipe'],['noaa',-.1,'sec',340,0,4,38,1.0,''],
 ['br',-.1,'map',230,0,52,40,.01,'dip'],['br',3.0,'map',190,-25,60,38,1.3,''],
 ['agro',-.1,'mato',120,10,56,36,1.0,''],['cav',-.1,'map',230,-10,50,40,1.2,''],
 ['fim',-.1,'oc',150,20,6,38,.01,'dip'],['fim',3.0,'oc',360,-30,18,44,2.6,''],['cmt',0,'oc',420,30,16,40,1.4,'']];
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
 // L0 oceano
 oceanMat.uniforms.uT.value=t;{const grow=t<C.what?lerp(70,200,sm(t/(C.imp+1.5))):(t<C.fim?60:lerp(140,50,sm((t-C.fim)/6)));oceanMat.uniforms.uR.value=grow;oceanMat.uniforms.uK.value=t<C.fim?1:lerp(1,.45,sm((t-C.fim)/6))}
 sunO.position.copy(LOC(0)).add(V3(-60,22,-300));
 {const a=t-C.imp;shockO.visible=a>=0&&a<1.8;if(shockO.visible){const k=a/1.8;shockO.position.set(60,1,0);shockO.scale.setScalar(6+260*(1-Math.pow(1-k,3)));shockO.material.opacity=.8*(1-k)}}
 // L1 corte: estados por fase
 {let pc,w,bul,amp,base,wsp;
  if(t<C.wind){pc=.22;w=.26;amp=.8;base=.35*sm((t-C.what)/2.5);bul=.04;wsp=1}
  else if(t<C.weak){pc=.2;w=.24;amp=1;base=.1;bul=.04;wsp=1}
  else{const k=sm((t-C.weak-.8)/4);pc=lerp(.2,.62,k);w=lerp(.24,.34,k);amp=lerp(1,1.5,k);base=lerp(.1,.3,k);bul=lerp(.04,.16,k);wsp=lerp(1,.2,sm((t-C.weak)/1.5))}
  const U=secMat.uniforms;U.uPc.value=pc;U.uW.value=w;U.uAmp.value=amp;U.uBase.value=base;U.uBul.value=bul;
  secSurf(surfL,pc,w,bul);const show97=t>=C.nasa+5&&t<C.br-.5;surf97.material.opacity=show97?.9:0;surf97.visible=show97;secSurf(surf97,pc,w,bul*.82,0);
  winds.forEach((s,i)=>{const on=t>=C.wind-.4&&t<C.nasa-.3;s.visible=on;if(!on)return;const spd=(t<C.weak?1:wsp)*26;const x=SW/2-((t*spd+hs(i,1)*SW*1.7)%(SW*1.2))+ -8;s.position.set(LOC(1).x+x,LOC(1).y+12+hs(i,2)*8,.5);s.scale.set(7*wsp+1.5,1.4,1);s.material.opacity=.4+.5*wsp});
  bandU.visible=t>=C.willis&&t<C.noaa-.3;bandU.position.copy(LOC(1)).add(V3(-SW/2+pc*SW,6+bul*SH+2,.6));bandU.scale.set(34+8*Math.sin(t*3),16+6*Math.sin(t*2.3),1);bandU.material.opacity=.4}
 // L3 satélite
 {const th=.0;const top=EC.clone().add(V3(Math.sin(th),Math.cos(th),0).multiplyScalar(R+140));const a=t-C.nasa;const sx=Math.sin(a*.1)*R;sat.position.set(EC.x+Math.sin(a*.006)*(R+140),EC.y+Math.cos(a*.006)*(R+140),0);sat.rotation.set(0,0,-a*.006);
  const dn=V3(sat.position.x-EC.x,sat.position.y-EC.y,0).normalize();beam.position.copy(sat.position).addScaledVector(dn,-72);beam.quaternion.setFromUnitVectors(V3(0,1,0),dn);beam.material.opacity=.2+.1*Math.sin(t*8);earthMat.uniforms.uT.value=t}
 // L2 mapa
 {const k=sm((t-C.br-.4)/1.2);window.__brMat.uniforms.uK.value=k;window.__brMat.uniforms.uT.value=t;
  clouds.forEach((s,i)=>{s.visible=k>.05;s.position.copy(LOC(2)).add(V3(mx(-52+hs(i,1)*9),my(-24-hs(i,2)*7),6+hs(i,3)*3));s.material.opacity=.45*k});
  suns.forEach((s,i)=>{const px=[-60,-55,-50,-47,-44,-42,-52,-58,-49,-45,-56,-41][i],py=[-3,-8,-1,-6,-4,-9,-14,-14,-17,-12,-20,-11][i];s.visible=k>.05;s.position.copy(LOC(2)).add(V3(mx(px),my(py),5));s.scale.setScalar(5+1.5*Math.sin(t*2+i));s.material.opacity=.45*k});
  rain.forEach((s,i)=>{const a=((t*1.4+hs(i,4))%1);s.visible=k>.05;s.position.copy(LOC(2)).add(V3(mx(-52+hs(i,1)*9),my(-23-hs(i,2)*7)-a*8,4));s.material.opacity=.8*k*(1-a)});
  const ag=t>=C.agro&&t<C.cav;matoL.material.opacity=ag?.7+.3*Math.sin(t*5):0;matoL.visible=ag;
  qm.forEach((m,i)=>{const on=t>=C.cav;m.material.opacity=on?.85*sm((t-C.cav-i*.3)/.4):0;m.position.set(mx(-47-i*4),my(-9-i*5),3+Math.sin(t*2+i))})}
 hudT('h15','1997',t,C.imp+.2,C.imp+3.2,230);hudT('hfirst','2026',t,C.noaa+.2,C.noaa+3.0,200);hudT('title2','SUL: CHUVA',t,C.br+.8,C.br+3.8,92);hudT('title3','SECA',t,C.br+2.2,C.br+5.2,150);$('title3').style.top='330px';hudT('hx','?',t,C.willis+.5,C.willis+3,300);
 {const e=$('title');e.style.fontSize='88px';e.innerHTML='NASA ALERTA:<br><b>EL NIÑO GIGANTE</b>';const k=t<3.4?1:1-sm((t-3.4)/.5);e.style.opacity=k;const pu=t>=C.imp?.16*Math.exp(-(t-C.imp)*7):0;e.style.transform=`translateY(${(1-k)*-60}px) scale(${(1+pu)*(1+(1-k)*.1)})`}
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
 {const cl=Math.round(cam.position.x/1000);scene.children.forEach(o=>{if(o.isLight)return;o.visible=Math.round(o.position.x/1000)===cl});if(cl===3){earth.visible=atm.visible=true}}
 $('flash').style.opacity=clamp(1-Math.abs(t-C.imp)/.1)*.3;$('rew').style.opacity=0;transition(t);caption(t);comp.render();
}
window.setT=setT;window.__ready=true;
