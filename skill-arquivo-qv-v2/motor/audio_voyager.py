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
# gancho: riser até o impacto
I=C['imp']
put(tone(200,I,.35,I,2600),0.0); put(noise(I,5000,.5,I*.8,21),0.0); put(whoosh(.6,300,5000,.4,1),0.0)
put(tone(48,1.8,1.0,.8,26),I); put(clank(22,.8),I); put(whoosh(.9,6000,300,.5,3),I); put(tone(1200,.8,.25,.4,harm=(1,2)),I+.05)
put(tone(660,.5,.25,.3,harm=(1,2)),cue('name')); put(tone(392,.8,.15,.5,harm=(1,2,3)),cue('y77'))
put(whoosh(2.2,150,2500,.4,5),cue('km',-.2)); put(tone(90,1.5,.4,.8),cue('km'))
for k in range(4): put(tone(1500+k*120,.05,.2,.02),cue('sun8')+.4+k*.25)
put(whoosh(1.9,300,4000,.45,6),cue('sun8',.4)); put(tone(1046,.6,.25,.4,harm=(1,2)),cue('sun8',2.2))
put(whoosh(5.5,200,6000,.4,7),cue('day')); put(tone(300,5.5,.15,5.5,1800),cue('day'))
for k in range(int((C['cmd']-C['day'])*3)): put(tone(2400,.03,.15,.012),cue('day',.8)+k/3)
for k in range(6): put(tone(880,.08,.25,.04),cue('cmd')+k*.55); 
put(whoosh(3.2,200,3000,.35,8),cue('cmd',.2))
for k in range(6): put(tone(620,.1,.25,.05),cue('back')+k*.55)
put(whoosh(3.2,3000,200,.35,9),cue('back',.2)); put(tone(520,.6,.2,.3,harm=(1,2)),cue('back',.8))
for k,f in enumerate((523,659,784,1046)): put(tone(f,1.2,.22,.7,harm=(1,2,3)),cue('first')+k*.08)
put(noise(.7,9000,.35,.2,14),cue('first')); put(tone(60,1.0,.5,.5,40),cue('first'))
for k in range(5): put(tone(1800,.04,.25,.02),cue('d18')+k*.12); put(tone(1046,.5,.25,.3),cue('d18',.7))
put(tone(70,3.5,.2,3.5,90),cue('pow')); put(tone(140,3.5,.1,3.5,150,harm=(1,2)),cue('pow'))
for k in range(3): put(tone(500-k*80,.12,.3,.06,200),cue('offi')+1.0+k*.9); put(clank(30+k,.25),cue('offi')+1.0+k*.9)
put(tone(1318,.6,.25,.3,harm=(1,2)),cue('offi')+4.2)
put(whoosh(1.4,200,2000,.3,10),cue('v2',-.2)); put(tone(880,.5,.25,.3,harm=(1,2)),cue('v2',.2))
# Morse real: bipes sincronizados com as luzes
U=.19; t0=cue('mors',1.2); seq=['...-','--.','.-.']; tt=0
for w in seq:
    for c in w:
        d=U if c=='.' else 3*U; put(tone(740,d,.35,d*3,harm=(1,)),t0+tt); tt+=d+U
    tt+=2*U
put(whoosh(2.0,200,3000,.3,11),cue('mors',-.2)); put(tone(80,2,.25,1.5),cue('mors'))
put(whoosh(3.0,3000,200,.3,12),cue('old')); 
for f in (196,247,294,392): put(tone(f,3.5,.1,2.5,harm=(1,2)),cue('old',.2))
put(tone(660,.2,.3,.08),cue('cmt')); put(tone(990,.3,.3,.12),cue('cmt',.12))
for k in range(7): put(tone(1800+r.rand()*500,.04,.2,.02),cue('cmt',.5+k*.071))
put(tone(900,.15,.3,.08),cue('seg',-.15)); put(whoosh(.5,300,2500,.3,41),cue('seg',-.2))
put(tone(1400,.05,.5,.03),cue('seg',.95)); put(tone(700,.2,.3,.1,1400),cue('seg',.97)); put(tone(1568,.5,.3,.3,harm=(1,2)),cue('seg',1.0))
put(tone(1046,.5,.3,.25,harm=(1,2)),cue('msg')); put(tone(1568,.7,.3,.4,harm=(1,2)),cue('msg',.12))
# movimentos de câmera: um swoosh diferente a cada novo foco
import re
src=open('voyager.js').read(); ks=re.findall(r"\['(\w+)',(-?[\d.]+),'(\w+)'",src)
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
