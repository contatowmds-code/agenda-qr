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
put(tone(50,1.6,1.0,.7,26),I); put(clank(22,.7),I); put(whoosh(.9,6000,300,.5,3),I); put(noise(1.2,2500,.5,.5,5),I+.1)
put(tone(440,1.2,.18,.8,harm=(1,2,3)),cue('name')); put(tone(330,1.6,.12,1.0,harm=(1,2)),cue('name',.1))
for k in range(3): put(tone(900-k*160,.12,.3,.06,300),cue('safe')+.6+k*.4)
put(tone(80,3.5,.25,3,60),cue('safe')); put(tone(1400,.15,.25,.08),cue('safe',.5))
put(noise(5,900,.25,5,6),cue('drag')); put(whoosh(4.5,300,2200,.35,7),cue('drag'))
put(whoosh(2.5,200,2500,.35,8),cue('link')); put(tone(300,.4,.2,.2,500),cue('link',1.5))
for k in range(4): put(tone(1000,.1,.25,.05),cue('link',3)+k*.5)
put(whoosh(2.2,300,3000,.4,9),cue('spin')); put(tone(240,2.5,.25,1.5,900,wave='sq'),cue('spin',.2)); put(tone(120,.8,.3,.3,60),cue('spin',1.2))
put(tone(60,5,.3,3,35),cue('fall')); put(whoosh(4,200,1800,.3,10),cue('fall'))
put(noise(8,6000,.7,5,11),cue('reent')); put(noise(8,600,.6,5,12),cue('reent')); put(tone(1800,6,.05,5,250),cue('reent'))
put(tone(1400,.6,.25,.3,harm=(1,2)),cue('reent',.3))
for k in range(8): put(clank(30+k,.18),cue('reent',1.2)+k*.35)
put(noise(4,3000,.35,2.5,13),cue('burn'))
for k in range(10): put(tone(1600+k*80,.04,.15,.02),cue('risk',.3)+k*.1)
put(tone(220,.9,.3,.5,110),cue('risk',1.3)); put(tone(1568,.7,.3,.4,harm=(1,2)),cue('risk',1.3))
put(whoosh(2.4,200,3000,.35,14),cue('end',-.3))
for f in (196,247,294,392): put(tone(f,3.5,.1,2.5,harm=(1,2)),cue('end',.3))
put(whoosh(3.5,3000,200,.3,15),cue('frag'))
put(tone(660,.2,.3,.08),cue('cmt')); put(tone(990,.3,.3,.12),cue('cmt',.12))
for k in range(7): put(tone(1800+r.rand()*500,.04,.2,.02),cue('cmt',.5+k*.071))
put(tone(900,.15,.3,.08),cue('seg',-.15)); put(whoosh(.5,300,2500,.3,41),cue('seg',-.2))
put(tone(1400,.05,.5,.03),cue('seg',.95)); put(tone(700,.2,.3,.1,1400),cue('seg',.97)); put(tone(1568,.5,.3,.3,harm=(1,2)),cue('seg',1.0))
put(tone(1046,.5,.3,.25,harm=(1,2)),cue('msg')); put(tone(1568,.7,.3,.4,harm=(1,2)),cue('msg',.12))
# movimentos de câmera: um swoosh diferente a cada novo foco
import re
src=open('swift.js').read(); ks=re.findall(r"\['(\w+)',(-?[\d.]+),'(\w+)'",src)
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
