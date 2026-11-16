import numpy as np, wave, json
SR=48000; TOTAL=2366; N=int(TOTAL/30*SR+SR); rng=np.random.default_rng(9001); buf=np.zeros(N,np.float32)
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
def roar(d,c=500):
    n=noise(d); return (lpf(n,c,2)*env(len(n),.1,.4)*2.4).astype(np.float32)
def servo(d=.5,f0=180,f1=320):
    n=int(d*SR); t=np.arange(n)/SR; f=f0+(f1-f0)*t/d; return (np.sign(np.sin(2*np.pi*np.cumsum(f)/SR))*.18*env(n,.1,.3)).astype(np.float32)
def whistle(f0,f1,d): return sweep(f0,f1,d,.35)
def ring(d=.9):
    n=int(d*SR); t=np.arange(n)/SR; g=(np.sin(2*np.pi*14*t)>0).astype(np.float32); return (np.sin(2*np.pi*1900*t)*g*.45*env(n,.02,.1)).astype(np.float32)
def gurgle(d=1.2):
    n=int(d*SR); t=np.arange(n)/SR; return (lpf(noise(d),400,2)*(0.6+0.4*np.sin(2*np.pi*5*t))*env(n,.2,.4)*1.6).astype(np.float32)
def thunder(d=2.4):
    return (lpf(noise(d),160,2)*env(int(d*SR),.02,.9)*2.8).astype(np.float32)
def rainfall(d):
    n=noise(d); return (hpf(lpf(n,6000),2500)*env(len(n),.2,.3)*.7).astype(np.float32)
put(gurgle(2.0),0,.5); put(sweep(100,500,3.0,.3),0,.4)
for k in range(8): put(drip(900+k*120),60+k*14,.4)
put(chime(880),206,.5); put(sweep(150,900,1.2,.4),210,.5)
for k in range(24): put(tick(500+k*40,.5),246+k*1)
put(sonar(1100),270,.6); put(chime(1318),334,.6)
for k in range(18): put(tick(600+k*70,.5),334+k*2)
put(chime(1760),372,.5); put(thud(60,.6,1.0),385,.7)
put(lpf(noise(5),500,2)*env(int(5*SR),.3,.3)*1.0,402,.5); put(sweep(200,1000,1.6,.4),420,.5); put(chime(988),494,.5)
put(wind(3.6),556,.8); put(wind(2.0),620,.4)
put(rainfall(4.2),665,.7); put(whoosh(.9,100,1400),731,.4); put(thunder(),780,.7)
put(sonar(1000),813,.6)
for k in range(3): put(chime(880+k*220,.5),847+k*54)
put(whoosh(.7,150,1500),980,.4); put(wind(3.0),990,.5)
for k in range(10): put(tick(700+k*50,.5),1050+k*3)
put(servo(.5,200,300),1082,.4)
put(thud(70,.6,1.0),1160); put(sweep(100,800,1.2,.5),1160); put(thud(70,.6,1.0),1230); put(sweep(100,900,1.2,.5),1230); put(thud(55,.8,1.2),1312); put(sweep(100,1200,1.8,.5),1312); put(chime(1568),1360,.6)
for k in range(12): put(clack(),1393+k*5,.5)
put(servo(.5,200,320),1500,.4); put(thud(60,.5,.9),1500,.6)
put(chime(784),1553,.5); put(chime(1175),1600,.5)
put(thud(80,.6,1.0),1660,.8); put(sweep(900,220,.8,.4),1660,.4)
put(wind(1.2),1713,.4)
for k in range(10): put(tick(500+k*40,.5),1745+k*3.5)
put(rainfall(1.6),1805,.6); put(thunder(1.6),1822,.5); put(lpf(noise(1.4),900,2)*env(int(1.4*SR),.2,.3)*.7,1826,.5)
put(sweep(160,800,1.6,.45),1960); put(chime(660),1985,.5)
put(gurgle(2.0),2040,.4)
for k,f in enumerate([660,880,1100,1320]): put(chime(f,.6),2130+k*4)
put(thud(70,.5,.9),2130)
buf=np.clip(buf,-1,1)
with wave.open('sfx.wav','wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((buf*32000).astype(np.int16).tobytes())
print('sfx ok',len(buf)/SR)
