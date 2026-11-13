import numpy as np, soundfile as sf
import eng as s
from eng import SFX, TOTAL
SR=48000; N=int(TOTAL*SR); rng=np.random.default_rng(3)
def t_(d): return np.arange(int(d*SR))/SR
def env_(x,a,r): 
    n=len(x); e=np.ones(n); na=int(a*SR); e[:na]=np.linspace(0,1,max(na,1)); e*=np.exp(-np.arange(n)/SR/r); return x*e
def noise(d): return rng.standard_normal(int(d*SR))
def lp(x,fc):
    a=np.exp(-2*np.pi*fc/SR); y=np.zeros_like(x); p=0
    for i in range(len(x)): p=a*p+(1-a)*x[i]; y[i]=p
    return y
def fast_lp(x,fc):
    from scipy.signal import butter,lfilter
    b,a=butter(2,fc/(SR/2)); return lfilter(b,a,x)
def fast_hp(x,fc):
    from scipy.signal import butter,lfilter
    b,a=butter(2,fc/(SR/2),'high'); return lfilter(b,a,x)
def k_impact():
    t=t_(0.7); f=90*np.exp(-t*7)+38; x=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*5); n=fast_lp(noise(.7),1800)*np.exp(-t*14)*.8
    return x*1.2+n
def k_thud():
    t=t_(0.45); f=70*np.exp(-t*10)+45; return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*8)*1.1
def k_whoosh():
    d=.6; n=noise(d); t=t_(d); x=fast_hp(fast_lp(n,3500),400)*np.sin(np.pi*t/d)**2; return x*0.5
def k_tick():
    t=t_(.06); return np.sin(2*np.pi*1900*t)*np.exp(-t*80)*.5+fast_hp(noise(.06),3000)*np.exp(-t*90)*.3
def k_pop():
    t=t_(.14); f=500+900*np.exp(-t*30); return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*28)*.8
def k_glitch():
    t=t_(.3); x=np.sign(np.sin(2*np.pi*(180+900*np.floor(t*30)%7*40)*t))*np.exp(-t*9)*.35; return x+fast_hp(noise(.3),2500)*np.exp(-t*12)*.3
def k_error():
    t=t_(.5); x=(np.sign(np.sin(2*np.pi*140*t))+np.sign(np.sin(2*np.pi*147*t)))*.25*np.exp(-t*5); return x
def k_ding():
    t=t_(.9); return (np.sin(2*np.pi*1318*t)+.5*np.sin(2*np.pi*1976*t))*np.exp(-t*5)*.35
def k_squash():
    t=t_(.4); f=900*np.exp(-t*6)+120; return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*8)*.5
def k_blip():
    t=t_(.12); return np.sin(2*np.pi*1200*t)*np.exp(-t*30)*.4
def k_type():
    t=t_(.04); return fast_hp(noise(.04),1500)*np.exp(-t*120)*.5
K=dict(impact=k_impact,thud=k_thud,whoosh=k_whoosh,tick=k_tick,pop=k_pop,glitch=k_glitch,error=k_error,ding=k_ding,squash=k_squash,blip=k_blip,type=k_type)
sfx=np.zeros(N+SR)
for t,kind,v in SFX:
    if kind in('x','thud','ding','impact') or kind not in K: continue
    x=K[kind]()*v*0.55; i=int(t*SR); sfx[i:i+len(x)]+=x[:len(sfx)-i]
# música: original, 124 bpm, Am - F - C - G, baixo + pad + hat
bpm=108; beat=60/bpm; tm=np.arange(N)/SR
mus=np.zeros(N)
roots=[73.42,58.27,43.65,65.41]
for bar in range(int(TOTAL/(beat*4))+2):
    r=roots[bar%4]; t0=bar*beat*4
    for b in range(8):
        st=t0+b*beat/2; i=int(st*SR)
        if i>=N: break
        d=beat/2*0.9; t=t_(d); f=r*(2 if b%4==2 else 1)
        x=np.sin(2*np.pi*f*t)*np.exp(-t*5)+0.3*np.sin(2*np.pi*2*f*t)*np.exp(-t*8)
        mus[i:i+len(x)]+=x[:N-i]*0.5
    for b in range(4):
        i=int((t0+b*beat+beat/2)*SR)
        if i<N:
            t=t_(.05); h=fast_hp(noise(.05),6000)*np.exp(-t*70)*.25; mus[i:i+len(h)]+=h[:N-i]
        i=int((t0+b*beat)*SR)
        if i<N and b%2==0:
            t=t_(.18); k=np.sin(2*np.pi*np.cumsum(60*np.exp(-t*18)+42)/SR)*np.exp(-t*12)*.7; mus[i:i+len(k)]+=k[:N-i]
    # pad
    i=int(t0*SR); d=beat*4; t=t_(d)
    pad=sum(np.sin(2*np.pi*f*t) for f in (r*4,r*5,r*6))*0.05*np.sin(np.pi*t/d)
    if i<N: mus[i:i+len(pad)]+=pad[:N-i]
# ducking pela voz
voz,_=sf.read('voz.wav'); vz=np.repeat(voz,2)[:N]  # 24k->48k
if len(vz)<N: vz=np.pad(vz,(0,N-len(vz)))
env=np.abs(vz); env=fast_lp(env,6); duck=1-0.55*np.clip(env/0.15,0,1)
fade=np.minimum(1,(TOTAL-tm)/1.2)*np.minimum(1,tm/0.3)
mix=vz*1.0+sfx[:N]*0.8
pk=np.max(np.abs(mix)); mix=mix/pk*0.89
sf.write('mix.wav',mix.astype(np.float32),SR); print('ok',pk)
