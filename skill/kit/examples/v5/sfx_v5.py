import numpy as np, wave, json
SR=48000; TOTAL=2050; N=int(TOTAL/30*SR+SR); rng=np.random.default_rng(555); buf=np.zeros(N,np.float32)
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
def chair():
    n=int(.25*SR); t=np.arange(n)/SR; return (lpf(noise(.25),900)*np.exp(-t*14)*1.4+np.sin(2*np.pi*110*t)*np.exp(-t*20)*.5).astype(np.float32)
def pageflip():
    n=int(.18*SR); t=np.arange(n)/SR; return (hpf(lpf(noise(.18),5000),1800)*np.exp(-t*18)*1.2).astype(np.float32)
def poof():
    n=int(.4*SR); t=np.arange(n)/SR; return (lpf(noise(.4),1200)*np.exp(-t*9)*1.3).astype(np.float32)
def creak(d=1.2):
    n=int(d*SR); t=np.arange(n)/SR; f=220+80*np.sin(2*np.pi*3*t); return (np.sin(2*np.pi*np.cumsum(f)/SR)*0.25*env(n,.2,.4)).astype(np.float32)
for k in range(16): put(chair(),4+k*4,.4)
for k in range(24): put(tick(500+k*40,.5),26+k*2)
for k in range(32): put(poof(),100+k*2.8,.3)
put(thud(60,.5,1.0),98,.7); put(chime(880),130,.5)
put(whoosh(.8,150,1800),204,.4); put(sweep(150,900,.9,.4),206,.5)
for k in range(16): put(tick(600+k*30,.5),206+k*2)
put(chime(988),286,.6); put(thud(70,.5,.9),286,.5)
for k in range(27): put(tick(700+k*20,.4),330+k*1.2)
put(sonar(1050),417,.6); put(sweep(200,1200,1.5,.4),430,.5)
put(creak(1.4),520,.5); put(chime(1568),560,.6); put(pageflip(),575,.6); put(pageflip(),590,.6)
put(lpf(noise(2.6),700,2)*env(int(2.6*SR),.3,.3)*.9,614,.5); put(servo(.5,200,300),682,.4)
for k in range(20): put(clack(),722+k*7,.4)
put(chime(1175),738,.6); put(chime(1568),760,.6)
put(whoosh(.7,120,1600),877,.4)
put(sweep(120,1000,2.0,.45),1096); 
for k in range(12): put(thud(80+k*12,.3,.6),1096+k*6)
put(chime(1760),1160,.6)
put(thud(50,.5,.9),1191,.6); put(drip(1400),1339,.5); put(sweep(900,220,.8,.4),1339,.4)
put(lpf(noise(3),200,2)*env(int(3*SR),.3,.4)*1.2,1369,.5); put(thud(75,.7,1.0),1388,.8); put(sweep(900,220,.8,.4),1388,.4)
put(creak(1.6),1436,.4)
for k in range(10): put(tick(500+k*30,.4),1670+k*7)
put(chime(660),1670,.5); put(chime(1318),1718,.7); put(whoosh(.8,120,1600),1718,.5)
for k,f in enumerate([660,880,1100,1320]): put(chime(f,.6),1812+k*4)
put(thud(70,.5,.9),1812)
buf=np.clip(buf,-1,1)
with wave.open('sfx.wav','wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((buf*32000).astype(np.int16).tobytes())
print('sfx ok',len(buf)/SR)
