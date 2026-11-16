import numpy as np, wave, json
SR=48000; TOTAL=2239; N=int(TOTAL/30*SR+SR); rng=np.random.default_rng(31415); buf=np.zeros(N,np.float32)
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
def cricket(d=.12):
    n=int(d*SR); t=np.arange(n)/SR; return (np.sin(2*np.pi*4200*t)*np.sin(2*np.pi*40*t)**2*np.exp(-t*8)*.4).astype(np.float32)
def shimmer(d=1.4):
    n=int(d*SR); t=np.arange(n)/SR; return sum(np.sin(2*np.pi*f*t)*np.exp(-t*2.5) for f in (1318,1760,2093,2637)).astype(np.float32)*.15
put(sweep(120,700,2.2,.35),0,.5); put(chime(1175),39,.55)
for k in range(5): put(tick(900+k*140,.6),39+k*6)
put(whoosh(.6,150,1500),114,.4); put(chime(988),150,.55); put(servo(.5,200,340),176,.4); put(thud(70,.5,.8),190,.6)
for k,fr in enumerate([206,223,231,247]): put(sonar(900+k*220,1.0),fr,.6)
put(whoosh(.8,100,1400),268,.4); put(sweep(150,1100,1.6,.4),272,.5); put(servo(.6,160,280),376,.4)
put(shimmer(),421,.7)
for k in range(14): put(tick(500+k*60,.5),513+k*2.8)
put(chime(1568),548,.6); put(sonar(1500,.8),570,.5); put(sonar(1760,.8),575,.5)
put(lpf(noise(7),180,2)*env(int(7*SR),.2,.3)*1.2,626,.6)
for k in range(24): put(tick(400+k*30,.4),640+k*7)
put(whoosh(.7,200,2400),788,.45); put(chime(2093),813,.7); put(thud(60,.4,.7),813,.5)
put(drip(1800),890,.5); put(chime(1318),893,.5)
put(lpf(noise(3.6),500,2)*env(int(3.6*SR),.2,.3)*.9,947,.6); put(whoosh(.6,200,2600),1055,.45)
put(whoosh(.8,100,1400),1145,.4)
for k in range(5): put(drip(900+k*200),1192+k*6)
put(sweep(120,900,1.4,.4),1340); put(chime(880),1371,.6)
for k,fr in enumerate(range(1410,1580,17)): put(pass_by(.5,2500,6000),fr,.4)
put(chime(1568),1536,.6)
for k in range(6): put(ring(.9),1590+k*10.5,.5)
put(sweep(300,1400,1.0,.4),1649); put(chime(784),1730,.5); put(chime(1175),1740,.5)
for k in range(22): put(cricket(),1793+k*5+(k%3),.5)
put(sweep(200,1300,1.2,.4),1884)
for k,f in enumerate([784,988,1175,1568]): put(chime(f,.6),2003+k*4)
put(thud(70,.5,.9),2003)
buf=np.clip(buf,-1,1)
with wave.open('sfx.wav','wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((buf*32000).astype(np.int16).tobytes())
print('sfx ok',len(buf)/SR)
