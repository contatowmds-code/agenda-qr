import numpy as np, wave, json
SR=48000; TOTAL=14774; N=int(TOTAL/30*SR+SR); rng=np.random.default_rng(2026); buf=np.zeros(N,np.float32)
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
def radio(d=1.4):
    n=int(d*SR); t=np.arange(n)/SR; f=1800+300*np.sin(2*np.pi*7*t); return (np.sin(2*np.pi*np.cumsum(f)/SR)*.2*env(n,.1,.5)).astype(np.float32)
def static(d):
    n=noise(d); return (hpf(lpf(n,5000),1500)*env(len(n),.2,.4)*.5).astype(np.float32)
def beepr(f=1320):
    n=int(.16*SR); t=np.arange(n)/SR; return (np.sin(2*np.pi*f*t)*np.exp(-t*14)*.5).astype(np.float32)
def lampoff():
    n=int(.12*SR); t=np.arange(n)/SR; return (np.sin(2*np.pi*500*t)*np.exp(-t*30)*.5).astype(np.float32)
def roar2(d,c=800):
    n=noise(d); return (lpf(n,c,2)*env(len(n),.2,.4)*2.2).astype(np.float32)
import re

st=open('/home/user/sv/h1/web/story.js').read()
shots=[(m.group(1),int(m.group(2)),m.group(3)) for m in re.finditer(r"id: '([A-Za-z0-9_]+)', a: (\d+), st: '([A-Z])'",st)]
words=json.load(open('/home/user/sv/h1/work/words.json'))
fr=lambda k,n=1:[int(w['s']*30) for w in words if re.sub(r'\W','',w['w'].lower())==k.lower()][n-1]
import re as _r
for i,(id_,a,s_) in enumerate(shots):
    lo=200+(i*37)%400; hi=1800+(i*211)%2600; put(whoosh(.32+.12*((i*7)%4),lo,hi),a-3,0.55)
    if s_ in 'DEG' and i%3==0: put(tick(700+i*23,.6),a+2)
# digitação A
for k in range(34): put(tick(1100+(k*53)%500,.5),12+k*4)
E_=fr('enter'); put(clack(),E_); put(chime(660,.4),E_+40)
# ficha B
for k,(w_) in enumerate(['atrasado','tarde','amanhã']): put(chime(520+k*110,.45),fr(w_))
# esteira C
for k in range(7): put(thud(110+k*8,.25,.6),1680+k*62)
# tokens D
d=fr('cortado'); put(sweep(1800,300,.6,.45),d); [put(clack(),d+12*k) for k in range(5)]
# botões E
for k in range(24): put(tick(500+(k*97)%900,.35),fr('botões',1)+k*7)
# rede F
for k in range(16): put(tick(900+k*70,.4),fr('camadas')+k*9)
# atenção G
put(chime(880,.5),fr('primeira')); put(chime(740,.5),fr('segunda'))
# dado H
for k in range(8): put(thud(180-k*10,.12,.5),fr('sorteio')+8+k*9)
# alucinação / conferir
put(sweep(900,120,.7,.5),fr('inventar')); put(chime(990,.5),fr('confira')+20); put(chime(1240,.5),fr('confira')+60)
# janela
put(whoosh(.9,200,1200),fr('esquecer'),0.7)
# pedir
for k,w_ in enumerate(['Primeiro','Segundo','Terceiro','quarto']): pass
# cofre
put(thud(60,.9,.9),fr('leia')+30)
# recap
for w_ in ['primeiro','segundo','terceiro','quarto','quinto','sexto','sétimo']:
    try: put(chime(600+60*['primeiro','segundo','terceiro','quarto','quinto','sexto','sétimo'].index(w_),.45),fr(w_,1 if w_ not in('primeiro',) else 2))
    except Exception: pass
put(gong(180),fr('Então')); put(clap(.8),fr('Quer')-8,0.6)
with wave.open('/home/user/sv/h1/sfx.wav','wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(buf/ max(1e-9,np.abs(buf).max())*0.9,-1,1)*32767).astype(np.int16).tobytes())
print('sfx ok',len(shots))
