import sys,json,numpy as np,soundfile as sf
from sfx_lib import whoosh,tone,noise,clank,A
from scipy.signal import resample_poly
D=json.load(open('words.json')); C=D['cues']; tot=D['total']
N=int(tot*A)+A; sfx=np.zeros(N,np.float32); r=np.random.RandomState(5)
def put(sig,at,g=1.0):
    i=int(at*A)
    if i<0 or i>=N: return
    sfx[i:i+len(sig)]+=sig[:N-i].astype(np.float32)*g
def cue(n,dt=0): return C[n]+dt
I=C['imp']; TI=C['dart']+3.0; TI2=C['defl']+2.6
put(tone(120,.5,.4,.3,2400),I-.5); put(whoosh(.5,300,5000,.4,1),I-.55)
put(tone(55,1.4,1.0,.6,26),I); put(clank(22,.6),I); put(whoosh(.8,6000,300,.5,3),I); put(noise(1.0,2500,.45,.5,5),I+.05)
put(tone(440,1.0,.16,.7,harm=(1,2,3)),cue('hera')); put(tone(330,1.4,.12,.9,harm=(1,2)),cue('hera',.1))
put(tone(70,3.5,.2,3,60),cue('didy')); put(tone(300,.5,.2,.4,harm=(1,2)),cue('didy',.1))
for k in range(4): put(tone(1200+k*80,.05,.25,.03),cue('size',.35)+k*.12)
put(tone(900,.4,.2,.25,1500),cue('size',.3)); put(tone(1300,.35,.2,.2,1900),cue('dimo',.3))
put(whoosh(2.8,200,3500,.4,7),cue('dart',-.1)); put(tone(220,3.0,.15,2.5,900,wave='sq'),cue('dart'))
for k in range(5): put(tone(1000+k*150,.05,.2,.03),cue('dart',1.7)+k*.18)
put(tone(48,1.8,1.0,.9,24),TI); put(clank(27,.7),TI); put(noise(1.6,3200,.5,.8,9),TI); put(whoosh(1.2,5000,250,.45,10),TI)
for k in range(14): put(tone(1500+(k%4)*220,.035,.22,.015),cue('orbit',.4)+k*.33)
put(tone(260,.9,.25,.5,520),cue('orbit',.2))
put(tone(784,.5,.28,.3,harm=(1,2)),cue('first')); put(tone(1176,.6,.28,.4,harm=(1,2)),cue('first',.12))
put(tone(1400,.15,.3,.1),cue('dist',.5)); put(noise(.5,3000,.2,.3,11),cue('dist',.5)); put(tone(1000,.25,.15,.2),cue('dist',1.4))
put(tone(60,2.4,.25,2.0,45),cue('boul')); put(noise(2.2,700,.25,1.5,12),cue('boul'))
put(whoosh(1.6,4000,600,.3,13),cue('groove')); put(tone(540,.6,.15,.4,harm=(1,2)),cue('groove',.2))
for k in range(12): put(tone(500+(k*97)%700,.03,.22,.02),cue('eject',.3)+k*.28)
put(whoosh(1.5,300,3000,.3,14),cue('eject'))
for k in range(3): put(tone(700+k*220,.9,.2,.6,300),cue('crash',.2)+k*.9)
put(tone(110,2.6,.2,2.0,80),cue('crash'))
put(whoosh(.7,3000,200,.45,15),cue('defl',-.25)); put(whoosh(.7,300,3500,.4,16),cue('defl'))
put(whoosh(1.4,300,2600,.35,17),TI2-1.8); put(tone(60,1.4,.9,.8,28),TI2); put(clank(33,.5),TI2); put(tone(880,.8,.2,.5,1320,harm=(1,2)),TI2+.6)
put(whoosh(.55,5000,300,.5,18),cue('nov',-.3)); put(tone(1046,.5,.25,.3,harm=(1,2)),cue('nov',.1)); put(tone(1568,.6,.25,.35,harm=(1,2)),cue('nov',.25))
put(tone(660,.2,.3,.08),cue('cmt')); put(tone(990,.3,.3,.12),cue('cmt',.12))
for k in range(7): put(tone(1800+r.rand()*500,.04,.2,.02),cue('cmt',.5+k*.071))
put(tone(900,.15,.3,.08),cue('seg',-.15)); put(whoosh(.5,300,2500,.3,41),cue('seg',-.2))
put(tone(1400,.05,.5,.03),cue('seg',.95)); put(tone(700,.2,.3,.1,1400),cue('seg',.97)); put(tone(1568,.5,.3,.3,harm=(1,2)),cue('seg',1.0))
put(tone(1046,.5,.3,.25,harm=(1,2)),cue('msg')); put(tone(1568,.7,.3,.4,harm=(1,2)),cue('msg',.12))
# movimentos de câmera: um swoosh diferente a cada novo foco
import re
src=open('hera.js').read(); ks=re.findall(r"\['(\w+)',(-?[\d.]+),'(\w+)'",src)
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
