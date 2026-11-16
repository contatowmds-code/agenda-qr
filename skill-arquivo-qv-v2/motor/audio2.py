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
# teaser/gancho: impacto
I=C['imp']-0.1
put(tone(200,I,.35,I,2400),0.0); put(noise(I,5000,.6,I*.8,21),0.0); put(whoosh(.5,300,5000,.45,1),0.0)
put(tone(50,1.6,1.0,.7,28),I); put(clank(22,1.0),I); put(noise(.9,9000,.5,.2,23),I); put(tone(1100,.7,.25,.3,harm=(1,2)),I+.05); put(tone(70,.5,.8,.2,40),0.12)
# rewind na virada
put(whoosh(.5,3000,300,.5,2),cue('pad',-.35)); put(tone(1800,.35,.15,.2,200,wave='sq'),cue('pad',-.3))
put(tone(1500,.6,.35,.3,harm=(1,2)),cue('v15'))
# decolagem: ignição + rumble
put(noise(7.0,170,.9,3.8,3),cue('lift',-.9)); put(tone(42,2.0,.9,1.0,26),cue('lift',-.3)); put(noise(4,3000,.35,2,4),cue('lift'))
put(tone(160,5,.22,5,1200),cue('lift',.5))
# separação
put(clank(6,.8),cue('sep')); put(tone(900,.3,.3,.1,140,wave='sq'),cue('sep')); put(whoosh(.7,300,3500,.4,7),cue('sep',.05))
# sonar de volta
for k in range(3): put(tone(980,.5,.25,.22),cue('back')+k*.6)
# aborto
put(tone(220,1.0,.4,.45,60,wave='sq'),cue('abort')); put(tone(110,1.0,.45,.5,50),cue('abort')); 
put(noise(1.3,3500,.8,.4,8),cue('sea',.55)); put(whoosh(1.0,2400,250,.4,9),cue('sea',-.2))
# órbita / satélites
for f in (220,277,330,440): put(tone(f,2.2,.1,1.2,harm=(1,2)),cue('orbit'))
for k in range(8): put(tone(660*2**(k/6),.5,.2,.15,harm=(1,2)),cue('sats')+k*.14)
# relógio
for k in range(int((C['re']-C['h22'])*3)): put(tone(2400,.03,.18,.012),cue('h22')+k/3)
put(tone(90,.8,.35,.4),cue('earth'))
# reentrada
put(noise(C['catch']-C['re'],6000,.75,3.2,10),cue('re')); put(noise(C['catch']-C['re'],500,.7,3.0,11),cue('re')); put(tone(1800,3.5,.05,3,260),cue('re'))
# captura
put(whoosh(.8,150,1500,.35,12),cue('catch',-.5)); put(clank(13,.95),cue('catch',.1)); put(tone(55,.9,.9,.45,38),cue('catch',.1))
# primeira vez
for k,f in enumerate((523,659,784,1046)): put(tone(f,1.1,.22,.6,harm=(1,2,3)),cue('first')+k*.07)
put(noise(.6,9000,.4,.18,14),cue('first'))
# moedas
for k in range(8): put(tone(2800+r.rand()*900,.25,.22,.08,harm=(1,2.4)),cue('cheap')+k*.1)
put(whoosh(.5,400,2200,.35,15),cue('cheap',2.3)); put(tone(1318,.35,.25,.2),cue('cheap',2.6))
# mais voos
for i in range(5): put(noise(1.6,900,.45,.9,20+i),cue('more',.2+i*.55)); put(tone(60+i*8,1.0,.3,.5),cue('more',.2+i*.55))
# faltando / relatos
put(tone(70,1.4,.65,.7,45),cue('missing')); put(tone(440,1.1,.1,.6,330,harm=(1,2)),cue('missing'))
put(tone(440,.8,.2,.4),cue('missing',3.0)); put(tone(466,.8,.2,.4),cue('missing',3.0))
# grande passo
put(whoosh(1.2,200,2500,.3,16),cue('step')); put(tone(392,1.5,.18,.8,harm=(1,2,3)),cue('step',.3))
# CTA
put(tone(660,.2,.3,.08),cue('cmt')); put(tone(990,.3,.3,.12),cue('cmt',.12))
for k in range(7): put(tone(1800+r.rand()*500,.04,.2,.02),cue('cmt',.5+k*.071))
put(tone(900,.15,.3,.08),cue('seg',-.15)); put(whoosh(.5,300,2500,.3,41),cue('seg',-.2))
put(tone(1400,.05,.5,.03),cue('seg',.95)); put(tone(700,.2,.3,.1,1400),cue('seg',.97)); put(tone(1568,.5,.3,.3,harm=(1,2)),cue('seg',1.0))
put(tone(1046,.5,.3,.25,harm=(1,2)),cue('msg')); put(tone(1568,.7,.3,.4,harm=(1,2)),cue('msg',.12))
# movimentos de câmera: um swoosh diferente a cada novo foco
import re
src=open('world.js').read(); ks=re.findall(r"\['(\w+)',(-?[\d.]+),'(\w+)'",src)
for i,(c,dt,tg) in enumerate(ks):
    if i==0: continue
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
