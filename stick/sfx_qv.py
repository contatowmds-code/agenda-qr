import numpy as np, wave
SR=48000; DUR=2058/30; N=int(DUR*SR); rng=np.random.default_rng(3); buf=np.zeros(N,np.float32)
def put(sig,fr,g=1.0):
    i=int(fr/30*SR); j=min(N,i+len(sig))
    if j>i: buf[i:j]+=sig[:j-i]*g
def lpf(x,c):
    X=np.fft.rfft(x); f=np.fft.rfftfreq(len(x),1/SR); X*=1/(1+(f/c)**4); return np.fft.irfft(X,len(x)).astype(np.float32)
def whoosh(d=0.35,up=True):
    n=int(d*SR); t=np.arange(n)/SR; x=rng.standard_normal(n).astype(np.float32)
    e=np.sin(np.pi*t/d)**2; return lpf(x,1800 if up else 900)*e*0.9
def sweep(f0,f1,d=0.45):
    n=int(d*SR); t=np.arange(n)/SR; f=f0*(f1/f0)**(t/d); ph=2*np.pi*np.cumsum(f)/SR
    return (np.sin(ph)*np.sin(np.pi*t/d)**1.5*0.6).astype(np.float32)
def pop(f=520):
    n=int(0.12*SR); t=np.arange(n)/SR; return (np.sin(2*np.pi*f*t*(1+0.8*np.exp(-t*60)))*np.exp(-t*38)).astype(np.float32)
def tick(f=900):
    n=int(0.05*SR); t=np.arange(n)/SR; return (np.sin(2*np.pi*f*t)*np.exp(-t*90)).astype(np.float32)
def thud(f0=80,d=0.35):
    n=int(d*SR); t=np.arange(n)/SR; return (np.sin(2*np.pi*f0*t*(1+0.6*np.exp(-t*40)))*np.exp(-t*12)).astype(np.float32)
def clink(f=2300):
    n=int(0.5*SR); t=np.arange(n)/SR; return ((np.sin(2*np.pi*f*t)+0.6*np.sin(2*np.pi*f*1.51*t)+0.4*np.sin(2*np.pi*f*2.3*t))*np.exp(-t*9)*0.5).astype(np.float32)
def clack():
    n=int(0.09*SR); t=np.arange(n)/SR; return (lpf(rng.standard_normal(n).astype(np.float32),2500)*np.exp(-t*45)+np.sin(2*np.pi*140*t)*np.exp(-t*30)*0.6).astype(np.float32)
def rumble(d):
    n=int(d*SR); t=np.arange(n)/SR; return lpf(rng.standard_normal(n).astype(np.float32),160)*np.minimum(1,t/0.3)*np.minimum(1,(d-t)/0.3)*2.5
# cortes: whoosh
for c in [87,217,300,512,623,796,961,1090,1371,1548,1752]: put(whoosh(),c-3,0.7)
put(pop(440),2); put(sweep(300,700,0.3),2,0.5)              # nota entra
put(thud(),90,0.9)                                           # não compra
put(sweep(500,250,0.5),142,0.4)                              # câmera baixa
put(pop(600),256)                                            # 2009
for k in range(10): put(tick(700+k*90),300+k*11,0.9)         # preço dobra
put(pop(500),405); put(clink(1800),462,0.8); put(sweep(400,900,0.3),462,0.5)
put(rumble(3.6),512,0.8)
for fr in range(520,620,7): put(clack(),fr,0.7)              # prensa
for k,fr in enumerate([629,698,749]): put(pop(420+k*160),fr); put(sweep(300+k*150,700+k*250,0.3),fr,0.5)
put(rumble(3.3),796,0.6)
for fr in range(800,896,9): put(tick(1500),fr,0.35)          # roda
put(sweep(600,200,0.6),925,0.6)                              # quase nada
put(sweep(500,150,0.9),961,0.5)                              # desistiu
put(clink(2400),1029,0.9); put(sweep(400,1000,0.35),1029,0.4)
put(thud(120,0.25),1120,0.6)                                 # mesa
put(pop(520),1250); put(sweep(300,800,0.3),1250,0.5)
put(thud(60,0.6),1303,1.2); put(sweep(700,180,0.6),1303,0.6); put(clink(1500),1306,0.5)
put(sweep(250,1100,0.9),1371,0.6)                            # virada
for k in range(5): put(pop(500+k*70),1440+k*14,0.6)          # colecionadores
for k in range(13): put(tick(800+k*70),1575+k*5,0.8)         # preço sobe
put(clink(2600),1641,0.8)
put(clink(2000),1651,0.8); put(sweep(400,1200,0.4),1651,0.5)
put(pop(480),1756); put(pop(640),1813,0.7); put(pop(560),1957,0.6)
buf/=max(1e-6,np.abs(buf).max())
for name,x in [('sfx.wav',buf),('music.wav',np.zeros(N,np.float32))]:
    with wave.open(name,'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x*32000).astype(np.int16).tobytes())
