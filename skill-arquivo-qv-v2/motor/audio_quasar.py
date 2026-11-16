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
put(tone(180,I,.35,I,2400),0.0); put(noise(I,5000,.5,I*.8,21),0.0); put(whoosh(.4,300,5000,.4,1),0.0)
put(tone(46,1.8,1.0,.8,26),I); put(whoosh(1.0,6000,300,.5,3),I); put(tone(1100,.9,.25,.4,harm=(1,2)),I+.05); put(tone(70,.5,.7,.2,40),I)
put(tone(90,6,.2,5,70),cue('bh')); put(whoosh(3,200,1500,.3,4),cue('bh',-.2))
put(whoosh(.8,2000,300,.35,5),cue('euc',-.3)); put(tone(520,1.4,.14,.9,harm=(1,2,3)),cue('euc')); put(tone(390,1.6,.1,1.0,harm=(1,2)),cue('euc',.15))
put(whoosh(.5,300,3000,.35,6),cue('n31',-.3))
for k in range(31): put(tone(900+(k%12)*110,.12,.2,.07,harm=(1,2)),cue('n31')+.3+k*.13)
put(tone(1568,.9,.3,.5,harm=(1,2,3)),cue('n31',.3)); put(tone(1760,.9,.3,.5,harm=(1,2,3)),cue('n31',.7))
put(whoosh(.5,200,2500,.35,7),cue('age',-.3)); put(tone(60,1.2,.5,.8,40),cue('age',.1)); put(tone(1318,.6,.25,.3,harm=(1,2)),cue('age',.2))
put(whoosh(3.5,300,3500,.3,8),cue('age',1.2)); put(tone(2000,3.5,.06,3,3000),cue('age',1.2))
put(whoosh(.5,2500,300,.35,9),cue('red',-.3)); put(tone(660,3.5,.15,3,200),cue('red',1.5)); put(tone(1046,.5,.25,.3,harm=(1,2)),cue('red',.5))
put(whoosh(.5,300,2500,.35,10),cue('fast',-.3))
for k in range(10): put(tone(1000,.08,.2,.04),cue('fast',.3)+k*.5)
for k in range(12): put(tone(1400+k*50,.06,.22,.03),cue('fast',2.6)+k*.13)
put(whoosh(.5,2000,300,.35,11),cue('puzzle',-.3)); put(tone(60,2.6,.4,1.5,220),cue('puzzle',.4)); put(whoosh(2.6,200,2200,.35,12),cue('puzzle',.4)); put(tone(330,.9,.2,.5,250,wave='sq'),cue('puzzle',1.5))
put(whoosh(.4,300,3000,.3,13),cue('pub',-.3)); put(tone(880,.15,.25,.08),cue('pub',.1)); put(tone(1175,.4,.2,.2,harm=(1,2)),cue('pub',.2)); put(tone(660,.8,.14,.5,harm=(1,2)),cue('pub',2.4))
put(whoosh(.4,2000,300,.3,14),cue('cav',-.3)); put(tone(440,.8,.2,.4),cue('cav')); put(tone(466,.8,.2,.4),cue('cav',.1))
put(whoosh(2.6,200,3000,.35,15),cue('fim',-.3)); put(tone(73,3,.35,1.5,45),cue('fim'))
for f in (196,247,294,392): put(tone(f,3.5,.1,2.5,harm=(1,2)),cue('fim',.3))
put(tone(660,.2,.3,.08),cue('cmt')); put(tone(990,.3,.3,.12),cue('cmt',.12))
for k in range(7): put(tone(1800+r.rand()*500,.04,.2,.02),cue('cmt',.5+k*.071))
put(tone(900,.15,.3,.08),cue('seg',-.15)); put(whoosh(.5,300,2500,.3,41),cue('seg',-.2))
put(tone(1400,.05,.5,.03),cue('seg',.95)); put(tone(700,.2,.3,.1,1400),cue('seg',.97)); put(tone(1568,.5,.3,.3,harm=(1,2)),cue('seg',1.0))
put(tone(1046,.5,.3,.25,harm=(1,2)),cue('msg')); put(tone(1568,.7,.3,.4,harm=(1,2)),cue('msg',.12))
# movimentos de câmera: um swoosh diferente a cada novo foco
import re
src=open('quasar.js').read(); ks=re.findall(r"\['(\w+)',(-?[\d.]+),'(\w+)'",src)
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
