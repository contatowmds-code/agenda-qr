import json,re
w=json.load(open('/home/user/sv/h1/work/words.json'))
nm=lambda s:re.sub(r'[^\wà-ú]','',s.lower())
W=[(nm(x['w']),int(x['s']*30)) for x in w]
def fr(word,n=1,after=0):
    c=0
    for t,f in W:
        if t==nm(word) and f>=after:
            c+=1
            if c==n: return f
    raise Exception('nao achei '+word+str(n)+str(after))
TOTAL=14774
stagesList=['A','B','C','D','E','F','G','H','Q','I','J','K','L','M','P','N','O']
OFF={k:[(i%5)*6000,0,-(i//5)*6000] for i,k in enumerate(stagesList)}
# ---- marcos ----
enter=fr('enter'); 
s={}
s['B']=fr('começar'); s['C']=fr('tarefa'); s['D']=fr('detalhe'); s['E']=fr('Agora',1,2800); s['F']=fr('Todos',1,4300)
s['G']=fr('truque'); s['H']=fr('vamos',1,6400)-20; s['Q']=fr('alucinação'); s['I']=fr('Imagine',1,7800); s['Q2']=fr('Por',1,8300)
s['J']=fr('Outro',1,8500); s['K']=fr('Só',1,9400); s['L']=fr('Agora',1,10400)
s['M']=fr('Outro',1,11900); s['P']=fr('Por',1,12400); s['N']=fr('Vamos',1,12600); s['O']=fr('Então',1,13700); s['CTA']=fr('Quer')
print({k:v for k,v in s.items()})
import sys

# ---------------- gerar story.js ----------------
import math
def Kk(f,F,d,az,el,fov=46): return f"K({int(f)},[{F[0]},{F[1]},{F[2]}],{d},{az},{el},{fov})"
SH=[]
def shot(id,a,st,light,keys,S=None,extra=''):
    ks=','.join(Kk(*k) for k in keys)
    SH.append(f"  {{ id: '{id}', a: {int(a)}, st: '{st}', light: '{light}', cam: {{ keys: [{ks}] }}{', S: '+S if S else ''}{(', '+extra) if extra else ''} }},")
R=lambda a,b:f"ramp(f,{int(a)},{int(b)})"
# A
a2=fr('aparece'); a3=fr('mas',1,a2); a4=fr('Neste'); B=s['B']
SA=f"(f)=>({{typ:{R(15,enter-8)},enter:{R(enter,enter+6)}*(1-{R(enter+16,enter+26)}),dots:1,ans:{R(a2,a2+70)}}})"
shot('A1',0,'A','studioB',[(0,[0,38,-18],110,22,8,46),(fr('escreve'),[0,38,-18],62,8,6,44),(enter-10,[24,14,10],44,-18,22,44),(a2-2,[27,14,10],26,-10,18,40)],SA)
shot('A2',a2,'A','studioB',[(a2,[-6,36,-18],64,6,5,46),(a3-2,[0,36,-18],46,0,4,42)],SA)
shot('A3',a3,'A','studioB',[(a3,[0,38,-18],70,-20,6,46),(a4-2,[0,34,0],150,-34,12,52)],SA)
shot('A4',a4,'A','studioB',[(a4,[0,34,-10],130,30,10,50),(a4+(B-a4)//2,[0,34,-10],100,0,8,48),(B-1,[0,38,-18],72,-8,6,44)],SA)
# B
b2=fr('escreve',1,B); b3=fr('sugere',2,B); b4=fr('Uma',1,1300); C=s['C']
p0=fr('atrasado'); p1=fr('tarde',1,p0); p2=fr('amanhã',1,p1)
SB=f"(f)=>({{typ:{R(b2,b2+40)},sug:{R(b3,b3+45)},pick:f<{p0}?-1:f<{p1}?0:f<{p2}?1:2,big:{R(fr('escala'),fr('turbinado'))}}})"
shot('B1',B,'B','studioP',[(B,[0,32,0],95,30,8,48),(b2-2,[0,30,2],60,8,6,44)],SB)
shot('B2',b2,'B','studioP',[(b2,[0,44,1],50,-8,2,42),(b3-2,[0,42,1],36,6,2,38)],SB)
shot('B3',b3,'B','studioP',[(b3,[0,41,1],34,-10,2,38),(b4-2,[0,41,1],26,10,3,36)],SB)
shot('B4',b4,'B','studioP',[(b4,[0,29,0],110,0,4,48),(fr('escala'),[0,40,-60],200,0,6,52),(C-2,[0,40,-60],330,0,8,56)],SB)
# C
D=s['D']
SC=f"(f)=>({{n:{R(C+30,D-50)}*7}})"
shot('C1',C,'C','studioG',[(C,[-120,12,0],140,25,12,50),(1878-2,[-92,12,0],90,-15,14,46)],SC)
shot('C2',1878,'C','studioG',[(1878,[-60,10,0],90,10,10,48),(2000,[0,10,0],110,-10,10,48),(D-2,[30,12,0],130,0,12,50)],SC)
# D
d2=fr('tokens'); d3=fr('Quando',1,2500); E=s['E']
SD=f"(f)=>({{cut:{R(fr('cortado'),d2+25)},num:{R(fr('vira',1,d2),fr('vira',1,d2)+16)}}})"
shot('D1',D,'D','studioW',[(D,[0,44,0],95,0,5,46),(d2-2,[0,44,0],70,-10,6,44)],SD)
shot('D2',d2,'D','studioW',[(d2,[0,44,0],70,-10,6,44),(d2+80,[-20,44,0],50,12,6,40),(d3-2,[20,44,0],70,-14,8,44)],SD)
shot('D3',d3,'D','studioW',[(d3,[0,40,0],80,0,6,46),(E-2,[0,44,0],120,12,8,50)],SD)
# E
e2=fr('jogo'); e3=fr('lição'); e4=fr('parâmetros'); e5=fr('Repare'); F=s['F']; tr_=fr('treinamento')
SE=f"(f)=>({{read:{R(tr_,tr_+20)}*(1-{R(e2,e2+20)}),tr:{R(fr('adivinhar'),e4+30)},knob:{R(e4+40,F-80)}}})"
shot('E1',E,'E','studioP',[(E,[-220,36,0],150,20,10,50),(tr_,[-220,36,0],90,-15,8,46),(e2-2,[-210,34,0],70,5,6,44)],SE)
shot('E2',e2,'E','studioP',[(e2,[0,40,-2],125,0,4,48),(e2+60,[10,40,-2],98,-6,4,42),(e3-2,[0,40,-2],105,6,4,44)],SE)
shot('E3',e3,'E','studioP',[(e3,[0,40,-2],100,0,4,44),(e4-2,[0,30,-2],130,-12,8,48)],SE)
shot('E4',e4,'E','studioP',[(e4,[230,18,10],70,-15,22,46),(e4+100,[230,18,6],45,10,18,40),(e5-2,[230,40,-30],150,0,8,50)],SE,f"card: {{ a: {fr('bilhões')}, text: 'BILHÕES', sub: 'de botões' }}")
shot('E5',e5,'E','studioP',[(e5,[230,40,-30],130,-20,8,50),(F-2,[230,40,-30],160,20,10,50)],SE)
# F
f2=fr('camadas'); f3=fr('Em',1,f2+60); f4=fr('probabilidades'); G=s['G']
SF=f"(f)=>({{sig:{R(fr('informação',1,f2),fr('previsão',1,f2))},out:{R(f4-10,f4+60)}}})"
shot('F1',F,'F','studioG',[(F,[0,46,0],220,0,6,48),(f2-2,[-40,46,0],120,25,8,46)],SF)
shot('F2',f2,'F','studioG',[(f2,[-60,46,0],110,-30,8,44),(f2+60,[0,46,0],140,0,8,48),(f3-2,[50,46,0],110,20,8,46)],SF)
shot('F3',f3,'F','studioG',[(f3,[0,46,0],90,10,10,44),(f4-2,[100,46,0],100,-10,8,44)],SF)
shot('F4',f4,'F','studioG',[(f4,[100,46,0],90,-20,6,44),(G-2,[40,46,0],200,0,10,50)],SF)
# G
g2=fr('Considere'); g3=fr('mecanismo'); g4=fr('primeira'); g5=fr('segunda'); g6=fr('transformer'); H=s['H']
SG=f"(f)=>({{a1:{R(g4,g4+30)}*(1-{R(g5-1,g5)}),a2:{R(g5,g5+30)},tw:f>={g6}?1:0}})"
shot('G1',G,'G','studioB',[(G,[0,34,0],200,0,6,50),(g2-2,[0,32,0],150,0,6,48)],SG,f"card: {{ a: {fr('atenção')}, text: 'ATENÇÃO', sub: 'o truque que mudou tudo' }}")
shot('G2',g2,'G','studioB',[(g2,[0,32,0],150,0,6,48),(g2+120,[-39,32,0],60,10,6,40),(fr('banco',2,g2),[52,32,0],60,-10,6,40),(g3-2,[0,32,0],120,0,6,46)],SG)
shot('G3',g3,'G','studioB',[(g3,[0,36,0],130,0,10,48),(g4-2,[-20,36,0],100,12,12,46)],SG)
shot('G4',g4,'G','studioB',[(g4,[-26,34,0],90,6,8,44),(g5-2,[-26,34,0],70,-8,10,42)],SG)
shot('G5',g5,'G','studioB',[(g5,[26,28,0],90,-6,-4,44),(g6-2,[26,28,0],70,8,-2,42)],SG)
shot('G6',g6,'G','studioB',[(g6,[0,35,-300],200,30,12,50),(H-2,[0,35,-300],150,-30,14,48)],SG)
# H
h2=fr('escolhesse'); h3=fr('sorteio'); h4=fr('temperatura'); h5=fr('mesma',1,h4); Q=s['Q']; alta=fr('alta',1,h4)
SH_=f"(f)=>({{temp:{R(alta,alta+60)},roll:f<{h5}?{R(h3,h3+80)}:{R(h5,h5+70)},pick:f<{h5}?1:3}})"
shot('H1',H,'H','studioW',[(H,[0,50,0],170,0,8,50),(h2-2,[-40,36,0],90,12,8,44)],SH_)
shot('H2',h2,'H','studioW',[(h2,[-48,30,0],70,-14,8,42),(h3-2,[-48,36,0],50,6,6,38)],SH_)
shot('H3',h3,'H','studioW',[(h3,[0,40,0],110,0,12,48),(h3+60,[-24,30,0],70,-10,8,42),(h4-2,[-24,30,0],60,6,8,40)],SH_)
shot('H4',h4,'H','studioW',[(h4,[88,40,0],70,-20,8,44),(alta+20,[40,36,0],120,-6,8,46),(h5-2,[0,36,0],140,0,8,48)],SH_)
shot('H5',h5,'H','studioW',[(h5,[0,40,0],120,10,8,46),(Q-2,[24,40,0],70,-8,6,42)],SH_)
# Q1
I=s['I']; inv=fr('inventar'); fal=fr('falso')
SQ=f"(f)=>({{hal:{R(inv,fal+30)}}})"
shot('Q1',Q,'Q','studioR',[(Q,[-30,44,-8],130,10,6,50),(inv-2,[-30,44,-8],80,-6,4,44)],SQ)
shot('Q2',inv,'Q','studioR',[(inv,[-30,44,-8],70,0,4,42),(I-2,[-10,36,-8],45,-4,2,36)],SQ)
# I
i2=fr('miragem'); i3=fr('mesmo',1,I+200); Q2=s['Q2']
SI=f"(f)=>({{mir:{R(i2,i2+60)}}})"
shot('I1',I,'I','desert',[(I,[0,14,-120],150,40,8,52),(i2-2,[0,14,-330],240,5,6,50)],SI,"act: 'walk'")
shot('I2',i2,'I','desert',[(i2,[0,14,-330],120,5,6,48),(i3-2,[0,10,-330],60,-5,4,40)],SI)
shot('I3',i3,'I','desert',[(i3,[0,12,-330],110,-30,10,48),(Q2-2,[0,12,-330],90,30,8,46)],SI)
# Q2 zone
J=s['J']; conf=fr('confira')
shot('Q3',Q2,'Q','studioR',[(Q2,[230,40,0],120,-10,6,48),(conf,[230,40,0],70,8,6,42),(J-2,[230,40,0],55,-6,4,40)],f"(f)=>({{chk:{R(conf,conf+130)}}})")
# J
j2=fr('tamanho'); j3=fr('dentro'); j4=fr('conversas',1,9000); j5=fr('memória'); K=s['K']
SJ=f"(f)=>({{win:0.2+0.1*{R(j2,j3)}+0.55*{R(j4,j4+120)}}})"
shot('J1',J,'J','studioG',[(J,[-100,22,0],160,30,10,50),(j2-2,[-100,22,0],110,-10,8,46)],SJ)
shot('J2',j2,'J','studioG',[(j2,[-100,22,0],100,-10,8,46),(j3-2,[-60,24,0],90,14,8,44)],SJ)
shot('J3',j3,'J','studioG',[(j3,[-80,22,0],95,10,6,44),(j4-2,[-40,22,0],150,-10,8,48)],SJ)
shot('J4',j4,'J','studioG',[(j4,[-20,22,0],150,-10,8,48),(j5-2,[40,22,0],180,15,12,50)],SJ)
shot('J5',j5,'J','studioG',[(j5,[40,22,0],200,20,12,50),(K-2,[0,22,0],330,0,14,54)],SJ)
# K
k2=fr('consultar',1,K); k3=fr('Assim',1,K); k4=fr('ferramentas',1,k3); L=s['L']
SK=f"(f)=>({{fly:{R(k2,k3-10)},tool:{R(fr('calculadora'),fr('planilha')+30)}}})"
shot('K1',K,'K','studioW',[(K,[-30,32,0],220,20,10,50),(k2-2,[-30,32,0],170,-10,8,48)],SK)
shot('K2',k2,'K','studioW',[(k2,[-120,28,0],80,-12,8,44),(k2+80,[-30,40,0],120,0,8,46),(k3-2,[64,36,0],70,10,6,42)],SK)
shot('K3',k3,'K','studioW',[(k3,[64,40,0],75,-14,8,44),(k4-2,[70,40,0],60,6,6,40)],SK)
shot('K4',k4,'K','studioW',[(k4,[110,70,20],130,-10,6,48),(L-2,[120,80,40],90,6,4,42)],SK)
# L
l1=fr('Primeiro',1,L); l2=fr('Segundo',1,l1); l3=fr('Terceiro',1,l2); l4=fr('quarto',1,l3); l5=fr('Compare',1,l4); cu=fr('curto',1,l5); M=s['M']
def pil(i,l,base0): return f"p{i}:0.45*{R(base0,base0+150)}+0.55*{R(l,l+25)}"
SL=f"(f)=>({{{pil(1,l1,L+10)},{pil(2,l2,L+40)},{pil(3,l3,L+70)},{pil(4,l4,L+100)},cmp:0.45*{R(l5,cu)}+0.55*{R(cu,cu+40)}}})"
shot('L1',L,'L','studioP',[(L,[0,26,0],190,0,6,50),(l1-2,[-66,28,0],100,-10,6,44)],SL)
shot('L2',l1,'L','studioP',[(l1,[-66,30,0],70,-10,6,42),(l2-2,[-44,30,0],60,6,6,40)],SL)
shot('L3',l2,'L','studioP',[(l2,[-22,30,0],70,-8,6,42),(l3-2,[-22,30,0],55,8,6,40)],SL)
shot('L4',l3,'L','studioP',[(l3,[22,30,0],70,-8,6,42),(l4-2,[22,30,0],55,8,6,40)],SL)
shot('L5',l4,'L','studioP',[(l4,[66,30,0],70,-8,6,42),(l5-2,[66,30,0],55,6,6,40)],SL)
shot('L6',l5,'L','studioP',[(l5,[260,40,-3],135,0,4,48),(cu-2,[260,40,-3],108,0,3,44),(M-2,[260,40,-3],100,-4,3,42)],SL)
# M
m2=fr('guardado'); m3=fr('leia'); Pp=s['P']
SM=f"(f)=>({{lock:{R(m3,m3+60)},hold:{R(m3,m3+20)}}})"
shot('M1',M,'M','studioR',[(M,[-40,36,0],150,20,10,50),(m2-2,[-30,38,0],90,-10,8,46)],SM)
shot('M2',m2,'M','studioR',[(m2,[0,44,0],110,-15,8,46),(m3-2,[0,44,0],80,10,6,42)],SM)
shot('M3',m3,'M','studioR',[(m3,[0,44,6],70,0,6,42),(Pp-2,[0,44,12],45,0,4,38)],SM)
# P
N=s['N']
shot('P1',Pp,'P','day',[(Pp,[0,40,-6],130,15,8,48),(Pp+110,[0,40,-6],95,-10,6,44),(N-2,[0,42,-8],90,0,4,42)],f"(f)=>({{chk:{R(Pp+16,N-10)}}})")
# N
O=s['O']
nm_=[fr('Primeiro',1,N),fr('Segundo',1,N),fr('Terceiro',1,N),fr('Quarto',1,N),fr('Quinto',1,N),fr('Sexto',1,N),fr('sétimo',1,N)]
SN="(f)=>({k:"+'+'.join(f"(f>={x}?1:0)" for x in nm_)+"})"
shot('N0',N,'N','studioB',[(N,[0,24,40],330,0,14,54),(nm_[0]-2,[0,24,40],260,10,10,52)],SN)
bounds=nm_+[O]
for i in range(7):
    a=(i-3)*0.34; x=round(math.sin(a)*120,1); z=round(-math.cos(a)*120+120-40,1); azd=round(-a*57.3,1)
    shot('N%d'%(i+1),bounds[i],'N','studioB',[(bounds[i],[x,24+i,z],90,azd-10,8,44),(bounds[i+1]-2,[x,24+i,z],64,azd+10,6,40)],SN)
# O
o2=fr('ferramenta',1,O+30); o3=fr('Da',1,o2); CTA=fr('Quer',1,14000)
SO=f"(f)=>({{tilt:{R(fr('segurança'),fr('segurança')+50)}}})"
shot('O1',O,'O','studioB',[(O,[0,50,-10],170,10,8,50),(o2-2,[0,50,-10],120,-12,10,46)],SO,f"card: {{ a: {O+40}, text: 'QUANTO VALE?', sub: 'entender a IA' }}")
shot('O2',o2,'O','studioB',[(o2,[0,40,-10],110,-12,10,46),(o3-2,[0,56,-10],80,10,8,42)],SO)
shot('O3',o3,'O','studioB',[(o3,[0,48,-10],130,20,10,48),(CTA-2,[0,48,-10],200,-10,12,52)],SO)
shot('CTA_a',CTA,'O','studioB',[(CTA,[0,-3,60],50,0,6,50),(CTA+55,[0,-3,60],42,10,8,50)],None,"act: 'cta'")
shot('CTA_b',CTA+56,'O','studioB',[(CTA+56,[0,-3,60],42,10,8,50),(CTA+210,[0,-3,60],56,-14,12,52),(TOTAL-1,[0,60,20],220,20,26,54)],None,"act: 'cta'")
aa=[int(x.split("a: ")[1].split(',')[0]) for x in SH]
assert all(aa[i]<aa[i+1] for i in range(len(aa)-1)), [ (i,aa[i],aa[i+1]) for i in range(len(aa)-1) if aa[i]>=aa[i+1]]
# ---- cabeçalho/rodapé ----
src=open('/home/user/sv/v10/web/story.js').read()
tail=src[src.index('export const SHOTS'):]
hdr=f"""// H1 como uma IA de conversa funciona - QV. 30 fps, {TOTAL} quadros.
import {{ M as E, idle, blinkAt, q, clamp, lerp, ramp }} from './motion.js';
export const FPS = 30, TOTAL = {TOTAL}, DECK = 0, COVER = 99999;
const D2R = Math.PI / 180, R2D = 180 / Math.PI;
const mkL = (top, hor, fog, ground) => ({{ az: 40, el: 62, sky: '#a9bde8', ground, hemi: 1.15, sun: '#ffffff', sunI: 1.9, fog, fogNear: 700, fogFar: 3200, skyTop: top, skyHor: hor, sat: 1.12, vig: 0.08, shadowExt: 220 }});
export const LIGHTS = {{
  studioB: mkL('#070d26', '#1b2c66', '#0a1230', '#2a3556'), studioP: mkL('#10082a', '#34206a', '#150c30', '#3a2a5a'), studioG: mkL('#04140f', '#10443a', '#07201a', '#2a4a40'), studioW: mkL('#1a1004', '#5a3a14', '#241608', '#5a4426'), studioR: mkL('#1a060a', '#541626', '#240a10', '#5a2a34'),
  day: {{ az: 60, el: 55, sky: '#cfe3f0', ground: '#7d9a86', hemi: 1.15, sun: '#fff4dc', sunI: 2.1, fog: '#d8e8f2', fogNear: 700, fogFar: 4000, skyTop: '#4f95d6', skyHor: '#e6f1f6', sat: 1.12, vig: 0.08, shadowExt: 220 }},
  desert: {{ az: 200, el: 38, sky: '#ffe2b0', ground: '#c9a56a', hemi: 1.2, sun: '#fff0cc', sunI: 2.3, fog: '#f3d9a8', fogNear: 500, fogFar: 2600, skyTop: '#3f86d0', skyHor: '#fbe3b0', sat: 1.15, vig: 0.08, shadowExt: 220 }},
}};
const OFF = {json.dumps(OFF)};
const K = (f, F, d, az, el, fov = 46) => ({{ f, F, d, az, el, fov }});
const DEF = [
"""
mid="\n".join(SH)+"\n];\n"
tail=tail.replace("  if (S.id === 'capa') return { pos: [-30, 14, 60], look: [-14, 0, 0], fov: 54, roll: 0, flash: 0 };","  if (S.id === 'capa') return { pos: [-34, 46, 52], look: [0, 36, -18], fov: 54, roll: 0, flash: 0 };")
tail=tail.replace("if (f === COVER) { o.pulse = 1; }","if (f === COVER) { o.typ = 1; o.ans = 1; o.enter = 0; o.dots = 0; }")
tail=tail.replace("export const shotAt = (f) => f === COVER ? { id: 'capa', a: COVER, b: COVER, st: 'A', light: 'space' }","export const shotAt = (f) => f === COVER ? { id: 'capa', a: COVER, b: COVER, st: 'A', light: 'studioB' }")
# atores
i0=tail.index("export const actorsAt"); i1=tail.index("const P0")
act="""export const actorsAt = (f, T_) => {
  const S = shotAt(f), out = []; const A = (who, o, pos, seed, sc = 1) => out.push(R(T_, who, { seed, ...life(f, seed), ...o }, pos, { s: sc }));
  const O_ = OFF[S.st];
  if (S.act === 'cta') [['workA', -3.2], ['civB', -1.1], ['civD', 1.1], ['velha', 3.2]].forEach(([w, x], k) => A(w, { expr: 'laugh', facing: 0, L: k % 2 ? 'wave' : 'belly', wv: q((f * 0.35 + k) % 6.283, 1), R: 'up', bob: q(Math.abs(Math.sin(f * 0.3 + k)) * 0.04, 3) }, [O_[0] + x * 2.0, 0.2, O_[2] + 90], 36 + k, 4));
  if (S.act === 'walk') { const u = ramp(f, @I@, @I2@); A('civB', { expr: 'neutral', facing: 0, L: 'hang', R: 'hang', bob: q(Math.abs(Math.sin(f * 0.25)) * 0.05, 3) }, [O_[0] + 6 * Math.sin(f * 0.02), 0.2, O_[2] - 40 - 250 * u], 52, 5); }
  return out;
};
""".replace("@I@",str(I)).replace("@I2@",str(i2))
tail=tail[:i0]+act+tail[i1:]
open('/home/user/sv/h1/web/story.js','w').write(hdr+mid+tail)
print('ok',len(SH),'shots')
