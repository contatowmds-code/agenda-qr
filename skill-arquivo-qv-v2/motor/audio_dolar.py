import sys,json,numpy as np,soundfile as sf
sys.path.insert(0,'.')
import sfx_lib as x
from sfx_lib import whoosh,tone,noise,clank,A
from scipy.signal import resample_poly
D=json.load(open('words.json')); C=D['cues']; tot=D['total']
N=int(tot*A)+A; sfx=np.zeros(N,np.float32); r=np.random.RandomState(5)
def put(sig,at,g=1.0):
    i=int(at*A)
    if i<0 or i>=N: return
    sfx[i:i+len(sig)]+=sig[:N-i].astype(np.float32)*g
def cue(n,dt=0): return C[n]+dt
# gancho: impacto
I=C['imp']-0.1
put(tone(200,I,.3,I,2000),0.0); put(noise(I,4500,.5,I*.8,21),0.0); put(whoosh(.5,300,5000,.4,1),0.0); put(tone(70,.5,.7,.2,40),0.12)
put(tone(50,1.6,1.0,.7,28),I); put(clank(22,.9),I); put(noise(.9,9000,.45,.2,23),I); put(tone(1100,.7,.25,.3,harm=(1,2)),I+.05)
for k in range(10): put(tone(2600+((k*37)%9)*100,.12,.18,.06,harm=(1,2.4)),I+.15+k*.07)
# maior nível / abril 2025
put(tone(880,.3,.25,.3,harm=(1,2)),cue('maior')); put(tone(660,.5,.2,.4),cue('abr'))
# sexta: mercúrio desce
put(whoosh(.9,2400,300,.35,3),cue('fri',-.4)); put(tone(520,.9,.25,.5,260),cue('fri'))
# segunda: sobe de novo
put(whoosh(2.4,200,3200,.35,4),cue('jump')); put(tone(300,2.4,.18,2.0,900),cue('jump')); put(tone(1318,.4,.25,.3,harm=(1,2)),cue('jump',2.2))
# fontes divergem: duas notas próximas
put(tone(440,1.5,.15,.9),cue('div')); put(tone(466,1.5,.15,.9),cue('div',.05))
# pacote fiscal / Senado / votos
put(whoosh(.8,300,2500,.35,5),cue('pack',-.2)); put(tone(110,1.2,.3,.6,70),cue('pack'))
put(clank(31,.8),cue('votos')); put(clank(32,.8),cue('votos',.22)); put(tone(784,.6,.22,.4,harm=(1,2,3)),cue('votos',.3)); put(tone(1046,.8,.22,.5,harm=(1,2)),cue('votos',.45))
# dinheiro empilhando
for k in range(18): put(tone(2200+((k*53)%11)*90,.1,.16,.05,harm=(1,2.4)),cue('bi',.1+k*.19))
put(tone(660,.5,.2,.4,harm=(1,2)),cue('bi',.2)); put(tone(988,.8,.2,.6,harm=(1,2)),cue('bi',3.3))
# Câmara: interrogação
put(tone(330,1.8,.16,1.2,262),cue('cam')); put(tone(392,.8,.2,.6,330),cue('cam',.5)); put(tone(311,1.0,.16,.8),cue('cam',1.4))
# IBC: ponteiro cai
put(whoosh(.6,400,2400,.3,6),cue('ibc',-.2)); put(tone(900,1.5,.25,.9,200),cue('neg')); put(tone(90,1.2,.45,.6,50),cue('neg',.9)); put(clank(34,.6),cue('neg',1.0))
# Selic: painel digital
put(whoosh(.8,200,2000,.3,7),cue('focus',-.3)); put(tone(1500,.1,.15,.05,wave='sq'),cue('sel')); put(tone(1500,.1,.15,.05,wave='sq'),cue('sel',.18))
for k,f in enumerate((523,659,784,1046)): put(tone(f,.5,.2,.3,harm=(1,2)),cue('n1275')+k*.09)
# porto: guindaste, contêiner
put(noise(3.4,500,.3,2.4,8),cue('shop',.2)); put(tone(80,3.4,.25,2.5,95),cue('shop',.3)); put(clank(35,.8),cue('shop',3.6))
put(tone(1318,.35,.22,.25),cue('usd')); put(tone(1568,.3,.2,.2),cue('ptag')); put(tone(1760,.35,.22,.25),cue('pup')); put(tone(2093,.5,.2,.3,harm=(1,2)),cue('pup',.15))
# oscilação + alerta
for k in range(9): put(tone(420+(k%3)*180,.18,.18,.1),cue('vol')+.1+k*.33)
put(tone(988,.25,.3,.12,wave='sq'),cue('vol',1.6)); put(tone(988,.25,.3,.12,wave='sq'),cue('vol',1.95))
# relógio: tique-taque
for k in range(int((C['cta']-C['fim'])*3)): put(tone(2400 if k%2 else 1900,.03,.2,.012),cue('fim')+k/3)
put(whoosh(2.0,200,2600,.3,9),cue('fim',-.2)); put(tone(73,2.5,.3,1.5,45),cue('fim'))
# CTA
put(tone(660,.2,.3,.08),cue('cmt')); put(tone(990,.3,.3,.12),cue('cmt',.12))
for k in range(7): put(tone(1800+r.rand()*500,.04,.2,.02),cue('cmt',.5+k*.071))
put(tone(900,.15,.3,.08),cue('seg',-.15)); put(whoosh(.5,300,2500,.3,41),cue('seg',-.2))
put(tone(1400,.05,.5,.03),cue('seg',.95)); put(tone(700,.2,.3,.1,1400),cue('seg',.97)); put(tone(1568,.5,.3,.3,harm=(1,2)),cue('seg',1.0))
put(tone(1046,.5,.3,.25,harm=(1,2)),cue('msg')); put(tone(1568,.7,.3,.4,harm=(1,2)),cue('msg',.12))
# movimentos de câmera: um swoosh diferente a cada novo foco
import re
src=open('dolar.js').read(); ks=re.findall(r"\['(\w+)',(-?[\d.]+),'(\w+)'",src)
for i,(c,dt,tg) in enumerate(ks):
    if i==0 or c not in C: continue
    at=C[c]+float(dt)-0.7; f0=250+(i*173)%600; f1=f0*(2.5+i%4)
    w=whoosh(.6,f0,f1,.3,30+i) if i%2 else whoosh(.6,f1,f0,.3,30+i); put(w,at)
vo,sr=sf.read('voz.wav'); vo=resample_poly(vo,A//300,sr//300).astype(np.float32)
from scipy.signal import butter,sosfilt,lfilter
# SFX: tira graves pesados e agudos agressivos que mascaram a fala
sfx=sosfilt(butter(2,[60/(A/2),9000/(A/2)],'band',output='sos'),sfx).astype(np.float32)
# envelope da voz (ataque rápido, soltura lenta) = sidechain forte
e=np.abs(vo); e=np.convolve(e,np.ones(int(.03*A))/int(.03*A),'same')
thr=np.percentile(e[e>1e-4],40); m=np.clip(e/thr,0,1)
env=np.zeros_like(m); rel=np.exp(-1/(.35*A))
cur=0.0
for i in range(0,len(m),32):
    v=m[i:i+32].max(); cur=v if v>cur else cur*rel**32; env[i:i+32]=cur
env=np.pad(env,(0,N-len(env)))[:N]
duck=1-0.9*env            # com voz: SFX cai ~20 dB
vp=np.sqrt(np.mean(vo**2)); 
out=np.zeros(N,np.float32); out[:len(vo)]=vo*1.0
sf_=sfx*duck
# nivela: SFX no máximo 0,45 do RMS da voz fora da fala e pico controlado
sr_=np.sqrt(np.mean(sf_**2)+1e-9); g=min(1.0,0.5*vp/sr_); out+=sf_*g
pk=np.abs(out).max(); out=out/ max(pk/.92,1)
sf.write('mix.wav',out[:int(tot*A)],A)
# diagnóstico: razão voz/SFX durante a fala
sp=e>thr; print('voz vs sfx durante fala (dB):',round(20*np.log10(np.sqrt(np.mean(vo[sp[:len(vo)]]**2))/np.sqrt(np.mean((sf_*g)[:len(vo)][sp[:len(vo)]]**2)+1e-12)),1)); print('audio ok')
