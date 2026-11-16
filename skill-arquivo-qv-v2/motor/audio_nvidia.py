import sys,json,numpy as np,soundfile as sf
sys.path.insert(0,'../work/x')
import x
from x import whoosh,tone,noise,clank,A
from scipy.signal import resample_poly
D=json.load(open('words.json')); C=D['cues']; tot=D['total']
N=int(tot*A)+A; sfx=np.zeros(N,np.float32); r=np.random.RandomState(5)
def put(sig,at,g=1.0):
    i=int(at*A)
    if i<0 or i>=N: return
    sfx[i:i+len(sig)]+=sig[:N-i].astype(np.float32)*g
def cue(n,dt=0): return C[n]+dt
I=C['imp']
put(tone(180,I,.35,I,2400),0.0); put(noise(I,5000,.5,I*.8,21),0.0); put(whoosh(.5,300,5000,.4,1),0.0)
put(tone(52,1.6,1.0,.7,28),I); put(clank(22,.8),I); put(whoosh(.9,6000,300,.5,3),I); put(tone(1200,.7,.25,.35,harm=(1,2)),I+.05)
for k in range(10): put(tone(1600+k*90,.04,.18,.02),I+.3+k*.11)
put(whoosh(.5,200,3000,.35,4),cue('date',-.3)); put(tone(880,.4,.25,.2,harm=(1,2)),cue('date')); put(tone(660,.8,.18,.4,harm=(1,2,3)),cue('date',2.4))
for k in range(3): put(tone(500+k*160,.25,.3,.12,harm=(1,2)),cue('q')+.5+k*.9)
put(whoosh(.5,2500,300,.35,5),cue('rev',-.3)); put(tone(120,3,.3,2.5,520),cue('rev',.3)); put(tone(1318,.6,.3,.3,harm=(1,2)),cue('rev',3.2))
for k in range(8): put(tone(2800+r.rand()*900,.25,.2,.08,harm=(1,2.4)),cue('rev',3.4)+k*.1)
put(whoosh(.5,300,2500,.35,6),cue('mar',-.3))
for k in range(26): put(tone(180+r.rand()*80,.18,.18,.07,60),cue('mar',3.7)+k*.03)
put(whoosh(.9,400,3000,.3,7),cue('mar',3.8)); put(tone(1046,.8,.25,.4,harm=(1,2,3)),cue('mar',4.4))
put(whoosh(.5,2000,200,.35,8),cue('dc',-.3)); put(tone(70,6,.18,6,80),cue('dc')); put(noise(8,700,.18,8,9),cue('dc'))
for k in range(12): put(tone(2000+r.rand()*1800,.03,.12,.015),cue('dc',.3)+k*.37)
put(whoosh(.4,1500,200,.35,10),cue('cn',-.3)); put(tone(300,.5,.25,.2,500),cue('cn',.4))
put(clank(11,.7),cue('cn',2.0)); put(tone(160,.9,.35,.4,60,wave='sq'),cue('cn',2.0))
put(whoosh(.5,300,2500,.35,12),cue('beat',-.3)); put(tone(200,2.2,.25,2,1100),cue('beat',.3)); put(tone(1568,.7,.3,.35,harm=(1,2)),cue('beat',2.7))
put(whoosh(.5,2200,300,.35,13),cue('mkt',-.3))
for k in range(12): put(tone(700+k*70,.08,.2,.04),cue('mkt',.2)+k*.27)
put(whoosh(2.4,200,3000,.4,14),cue('end',-.3)); put(tone(73,3,.4,1.5,45),cue('end'))
for f in (196,247,294,392): put(tone(f,3.5,.1,2.5,harm=(1,2)),cue('end',.3))
put(tone(660,.2,.3,.08),cue('cmt')); put(tone(990,.3,.3,.12),cue('cmt',.12))
for k in range(7): put(tone(1800+r.rand()*500,.04,.2,.02),cue('cmt',.5+k*.071))
put(tone(900,.15,.3,.08),cue('seg',-.15)); put(whoosh(.5,300,2500,.3,41),cue('seg',-.2))
put(tone(1400,.05,.5,.03),cue('seg',.95)); put(tone(700,.2,.3,.1,1400),cue('seg',.97)); put(tone(1568,.5,.3,.3,harm=(1,2)),cue('seg',1.0))
put(tone(1046,.5,.3,.25,harm=(1,2)),cue('msg')); put(tone(1568,.7,.3,.4,harm=(1,2)),cue('msg',.12))
# movimentos de câmera: um swoosh diferente a cada novo foco
import re
src=open('nvidia.js').read(); ks=re.findall(r"\['(\w+)',(-?[\d.]+),'(\w+)'",src)
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
