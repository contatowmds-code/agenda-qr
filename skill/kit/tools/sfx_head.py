import numpy as np, wave, json
SR=48000; TOTAL=2136; N=int(TOTAL/30*SR+SR); rng=np.random.default_rng(777); buf=np.zeros(N,np.float32)
def put(sig,fr,g=1.0):
    i=int(fr/30*SR); j=min(N,i+len(sig))
    if j>i and i>=0: buf[i:j]+=sig[:j-i]*g
def lpf(x,c,o=4):
    X=np.fft.rfft(x); f=np.fft.rfftfreq(len(x),1/SR); X*=1/(1+(f/c)**o); return np.fft.irfft(X,len(x)).astype(np.float32)
def hpf(x,c): return (x-lpf(x,c)).astype(np.float32)
def noise(d): return rng.standard_normal(int(d*SR)).astype(np.float32)
def env(n,a=.1,r=.3):
    t=np.linspace(0,1,n); return np.minimum(1,t/a)*np.minimum(1,(1-t)/r)
def whoosh(d=.4,lo=300,hi=3000):
    n=noise(d); return hpf(lpf(n,hi),lo)*env(len(n),.45,.55)*1.4
def sweep(f0,f1,d=.5,g=.5):
    n=int(d*SR); t=np.arange(n)/SR; f=f0*(f1/f0)**(t/d); ph=2*np.pi*np.cumsum(f)/SR
    return (np.sin(ph)*env(n,.2,.5)*g).astype(np.float32)
def sonar(f=1250,d=1.2):
    n=int(d*SR); t=np.arange(n)/SR; return (np.sin(2*np.pi*f*t)*np.exp(-t*4.5)*.7+np.sin(2*np.pi*f*2*t)*np.exp(-t*9)*.2).astype(np.float32)
def tick(f=900,g=1):
    n=int(.04*SR); t=np.arange(n)/SR; return (np.sin(2*np.pi*f*t)*np.exp(-t*110)*g).astype(np.float32)
def clack():
    n=int(.07*SR); t=np.arange(n)/SR; return (lpf(noise(.07),3500)*np.exp(-t*70)*.8+np.sin(2*np.pi*190*t)*np.exp(-t*45)*.5).astype(np.float32)
def thud(f0=70,d=.5,g=1):
    n=int(d*SR); t=np.arange(n)/SR; return (np.sin(2*np.pi*f0*t*(1+.7*np.exp(-t*30)))*np.exp(-t*9)*g).astype(np.float32)
def horn(f=118,d=1.1,g=.6):
    n=int(d*SR); t=np.arange(n)/SR; s=sum(np.sin(2*np.pi*f*k*t)/k for k in (1,2,3,4)) + .7*np.sin(2*np.pi*f*1.5*t); return (s*env(n,.05,.3)*g*.35).astype(np.float32)
def carhorn(d=.35):
    n=int(d*SR); t=np.arange(n)/SR; s=np.sign(np.sin(2*np.pi*420*t))*.3+np.sign(np.sin(2*np.pi*530*t))*.3; return (lpf(s.astype(np.float32),3000)*env(n,.02,.2)).astype(np.float32)
def drip(f=1700):
    n=int(.18*SR); t=np.arange(n)/SR; return (np.sin(2*np.pi*f*t*(1-.5*t*5))*np.exp(-t*30)*.8).astype(np.float32)
def pass_by(d=.9,lo=150,hi=1400):
    n=noise(d); t=np.linspace(0,1,len(n)); sw=np.sin(np.pi*t)**2; return (hpf(lpf(n,hi),lo)*sw*1.2).astype(np.float32)
def wind(d):
    n=lpf(noise(d),700,2); t=np.arange(len(n))/SR; return (n*(.6+.4*np.sin(2*np.pi*.8*t))*env(len(n),.2,.3)*2.2).astype(np.float32)
def chime(f,g=.5):
    n=int(.9*SR); t=np.arange(n)/SR; return ((np.sin(2*np.pi*f*t)+.4*np.sin(2*np.pi*f*2.76*t))*np.exp(-t*5)*g).astype(np.float32)
def gong(f=190):
    n=int(1.8*SR); t=np.arange(n)/SR; return ((np.sin(2*np.pi*f*t)+.6*np.sin(2*np.pi*f*2.4*t)+.4*np.sin(2*np.pi*f*3.7*t))*np.exp(-t*2.4)*.7).astype(np.float32)
def clap(d=.8):
    n=noise(d); t=np.arange(len(n))/SR; b=(rng.random(len(n))>.97)*np.exp(-((t*14)%1)*6); return (hpf(n,1500)*b*1.3).astype(np.float32)
