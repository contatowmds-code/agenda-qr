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
def roar(d,c=500):
    n=noise(d); return (lpf(n,c,2)*env(len(n),.1,.4)*2.4).astype(np.float32)
def servo(d=.5,f0=180,f1=320):
    n=int(d*SR); t=np.arange(n)/SR; f=f0+(f1-f0)*t/d; return (np.sign(np.sin(2*np.pi*np.cumsum(f)/SR))*.18*env(n,.1,.3)).astype(np.float32)
def whistle(f0,f1,d): return sweep(f0,f1,d,.35)
put(roar(2.4,700),0,.9); put(thud(50,.9,1.1),0,.7); put(chime(1046),38,.5)
put(whoosh(.7,100,900),119,.4)
put(servo(1.0,160,330),160,.5); put(thud(60,.8,1.2),195,.9); put(gong(150),196,.6); put(clack(),199,.7)
put(chime(1318),244,.6); put(whoosh(.8,200,2200),204,.4)
put(sonar(1100),278,.7); put(sweep(200,1500,1.5,.4),300,.5)
for k in range(14): put(tick(700+k*60,.6),339+k*3)
put(chime(1568),381,.5)
put(roar(2.6,900),424,.9); put(thud(42,1.0,1.3),424,.9); put(roar(2.4,1200),452,.7)
put(whoosh(.8,150,2000),497,.4)
for k in range(26): put(drip(1100+k*70),556+k*2.4)
put(chime(1760),618,.5)
put(whistle(1800,300,4.5),649,.5); put(roar(1.5,300),791,1.0); put(thud(35,1.3,1.4),791,1.0); put(gong(110),793,.5)
put(roar(5.8,1500),883,.8)
for k in range(18): put(tick(500+k*70,.5),950+k*3)
put(sweep(300,2200,1.4,.4),1035); put(chime(1175),1048,.6)
put(clack(),1100,.6); put(clack(),1112,.6)
put(whistle(900,200,1.8),1119,.4); put(roar(1.4,800),1119,.5)
put(servo(1.4,150,300),1190,.6); put(thud(55,.9,1.3),1250,1.0); put(gong(130),1250,.7)
put(chime(880),1354,.5)
for k in range(10): put(tick(1500-k*90,.5),1404+k*4.5)
put(chime(1568),1452,.5)
put(thud(80,.8,1.0),1478,.8); put(sweep(900,200,.8,.4),1478,.4)
put(roar(2.6,1800),1590,.7); put(whoosh(.9,200,3500),1640,.5)
put(whoosh(.7,200,2400),1738,.5); put(whoosh(.7,150,1800),1775,.4)
for k,f in enumerate([660,880,1100,1320]): put(chime(f,.6),1899+k*4)
put(thud(70,.5,.9),1899)
buf=np.clip(buf,-1,1)
with wave.open('sfx.wav','wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((buf*32000).astype(np.int16).tobytes())
print('sfx ok',len(buf)/SR)
