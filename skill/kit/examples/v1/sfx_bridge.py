import numpy as np, wave, json
SR=48000; TOTAL=2260; N=int(TOTAL/30*SR+SR); rng=np.random.default_rng(2026); buf=np.zeros(N,np.float32)
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
# SFX só quando algo é dito/aparece (nada de whoosh em todo corte)
TOT=2260
put(thud(55,.9,1.2),0,.9); put(sweep(120,900,.9,.5),0,.6)
for k in range(24): put(tick(500+k*45,.7),4+k*2.4)
put(pass_by(.9,200,1500),38,.5); put(pass_by(1.0,150,1100),76,.5)           # carros / mar
put(whoosh(.5,200,1800),114,.45)                                              # câmera chega no boneco
put(chime(880),134,.4); put(whoosh(.6,150,1200),199,.45)                      # percebe / obra
put(sonar(1250),272,.7)                                                       # mapa
for k in range(16): put(tick(800+k*55,.6),309+k*3.2)                          # 13,29 km
put(sweep(200,1800,1.6,.45),340,.6); put(sonar(1670,1.2),375,.6)
for k in range(24): put(clack(),412+k*2.8,.55); put(gong(190),478,.7)          # 1974
put(clap(1.4),480,.5); put(whoosh(.6,150,1200),491,.4)
put(horn(98,1.3,.5),548,.6); put(lpf(noise(2),500)*env(int(2*SR),.3,.4)*.6,552,.5)  # barco
put(sweep(180,1500,1.8,.5),636); put(chime(988),640,.6); put(chime(1318),690,.5)     # vão 300 m
put(whoosh(.8,100,900),664,.5)
put(sweep(90,700,1.8,.55),718)
for k in range(18): put(tick(420+k*38,.6),718+k*3)
put(thud(80,.6,.9),775)                                                        # 72 m
for k in range(16): put(tick(620+k*50,.6),822+k*1.9); put(chime(1568),852,.6)   # 20 andares
put(horn(78,1.8,.7),856,.7); put(lpf(noise(3),260)*env(int(3*SR),.3,.4)*1.2,858,.6)   # navio
put(thud(48,.8,1.2),960,.9); put(lpf(noise(3.0),140,2)*env(int(3.0*SR),.2,.3)*2.8,1002,.7)  # peso
put(wind(1.7),1052,.8)
for k,fr in enumerate([1106,1117,1128,1139,1148]): put(drip(1500+k*130),fr,.55)  # sal
put(lpf(noise(1.2),900)*env(int(1.2*SR),.3,.5)*.4,1100,.5)
for k in range(7): put(clack(),1160+k*7,.5)                                    # manutenção
put(thud(95,.4,.8),1155,.6)
put(carhorn(.35),1238,.6); put(carhorn(.35),1250,.6); put(sweep(1400,150,3.0,.5),1224,.55)   # quebrado + gauge cai
for k in range(9): put(tick(1900,.55),1240+k*10)
put(whoosh(.5,300,2600),1335,.45)
put(sweep(120,1100,1.4,.55),1376)
for k in range(15): put(tick(700+k*40,.6),1376+k*2.8)                           # 80 km/h
for k in range(17): put(tick(1400 if k%2 else 1000,.45),1456+k*2)
put(chime(1760),1490,.7)                                                       # 10 min
put(sonar(990),1507,.7)
for k in range(16): put(tick(600+(k%3)*120,.5),1530+k*3.5)                      # barca vs ponte
put(thud(90,.6,.9),1625); put(sweep(900,220,.7,.5),1625)                         # ?
put(clap(2.0),1677,.5)
put(sweep(100,1200,1.0,.5),1746); put(sweep(1200,100,1.0,.4),1760)              # todos os dias
put(pass_by(.7,200,1500),1790,.4)
put(sweep(160,800,1.8,.5),1884)
for k,f in enumerate([784,988,1175,1568]): put(chime(f,.6),2024+k*4)            # ARQUIVO
put(thud(70,.5,.9),2024); put(tick(1200,.6),2162); put(chime(1318),2166)
buf=np.clip(buf,-1,1)
with wave.open('sfx.wav','wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((buf*32000).astype(np.int16).tobytes())
print('sfx ok',len(buf)/SR)
