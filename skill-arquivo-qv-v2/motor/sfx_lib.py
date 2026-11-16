import sys, os, re, json, math, pickle, subprocess, numpy as np, cv2, soundfile as sf
sys.path.insert(0,'.')
from gx_legacy import *
SH=[]
SR=24000; FPS=60; LEAD=0.35; PAUSE=0.05; GAP=0.10
REPL=[("Starship","Istárchip"),("Starlink","Istárlinc"),("SpaceX","Ispêicis"),("Super Heavy","Súper Révi"),("Texas","Têcsas"),("skill","iskil"),("ARQUIVO","arquívo")]
def spoken(d):
    s=d.replace('*','')
    for a,b in REPL: s=s.replace(a,b)
    return s
def stage_tts(speed=1.3):
    from kokoro_onnx import Kokoro
    k=Kokoro('k.onnx','v.bin'); out=[]
    for i,sh in enumerate(SH):
        f=sh[3] if len(sh)>3 else sh[0]; f=spoken(f)
        for a,b in REPL: pass
        s,_=k.create(f,voice='pm_santa',speed=speed,lang='pt-br')
        a=np.abs(s); idx=np.where(a>0.012)[0]; s=s[max(idx[0]-int(.02*SR),0):idx[-1]+int(.05*SR)]
        out.append(s); print(i,round(len(s)/SR,2),flush=True)
    pickle.dump(out,open('tts.pkl','wb'))
def wt(w): return max(len(re.sub(r'[^\wÀ-ú]','',w)),2)+1
def stage_timeline():
    segs=pickle.load(open('tts.pkl','rb')); t=LEAD; blocks=[]; chunks=[]
    for i,(sh,s) in enumerate(zip(SH,segs)):
        d=len(s)/SR; toks=sh[0].split(); flag=False; hl=[]
        for tk in toks:
            if tk.startswith('*'): flag=True
            hl.append(flag)
            if tk.rstrip('.,?!:;').endswith('*'): flag=False
        clean=[tk.replace('*','') for tk in toks]
        w=np.array([wt(x) for x in clean],float); cum=np.concatenate([[0],np.cumsum(w)])/w.sum()
        words=[dict(w=x,hl=bool(hl[j]),s=round(t+cum[j]*d,3),e=round(t+cum[j+1]*d,3)) for j,x in enumerate(clean)]
        # primeira cena: abre já no quadro 0 (capa); fim da cena = fim da fala + folga
        blocks.append(dict(i=i,p=sh[1],cams=sh[2],s=round(t if i else 0.0,3),e=round(t+d+PAUSE+GAP,3),vs=round(t,3),words=words))
        chunks.append((t,s)); t+=d+PAUSE+GAP
    total=t+0.9; blocks[-1]['e']=total
    y=np.zeros(int(total*SR)+SR,np.float32)
    for st,s in chunks: y[int(st*SR):int(st*SR)+len(s)]+=s.astype(np.float32)
    sf.write('voz.wav',y[:int(total*SR)],SR)
    json.dump(dict(total=total,blocks=blocks),open('tl.json','w'),ensure_ascii=False)
    print('total',round(total,2),'s',len(blocks),'cenas')
# ------------- câmera -------------
def camera(img,kind,u):
    e=ease(u); z=1.12; cx=cy=0.0; pers=0.0; roll=0.0
    if kind=='push': z=1.08+0.22*e
    elif kind=='pull': z=1.35-0.22*e
    elif kind=='left': z=1.16; cx=(0.5-e)*70
    elif kind=='right': z=1.16; cx=(e-0.5)*70
    elif kind=='up': z=1.16; cy=(0.5-e)*110
    elif kind=='down': z=1.16; cy=(e-0.5)*110
    elif kind=='low': z=1.15+0.1*e; pers=0.12+0.06*e       # vista de baixo
    elif kind=='top': z=1.15+0.08*e; pers=-0.12-0.05*e      # vista de cima
    elif kind=='roll': z=1.2+0.05*e; roll=(e-0.5)*0.14
    src=np.float32([[0,0],[W,0],[W,H],[0,H]])
    dx=W*pers*0.5
    dst=np.float32([[dx*(1 if pers>0 else 0)*-0+(-dx if pers<0 else 0),0],[W+(dx if pers<0 else 0),0],[W-(dx if pers>0 else 0)*0+(-dx if pers>0 else 0)*0,H],[0,H]]) if False else None
    p=abs(pers)*W*0.5
    if pers>0:   # olhar de baixo: topo mais estreito
        dst=np.float32([[p,0],[W-p,0],[W,H],[0,H]])
    elif pers<0: # de cima: base mais estreita
        dst=np.float32([[0,0],[W,0],[W-p,H],[p,H]])
    else: dst=src.copy()
    M=cv2.getPerspectiveTransform(src,dst)
    A=np.array([[z*math.cos(roll),-z*math.sin(roll),W/2*(1-z*math.cos(roll))+z*math.sin(roll)*H/2+cx],[z*math.sin(roll),z*math.cos(roll),H/2*(1-z*math.cos(roll))-z*math.sin(roll)*W/2+cy],[0,0,1]])
    return cv2.warpPerspective(img,A@M,(W,H),flags=cv2.INTER_LINEAR,borderMode=cv2.BORDER_REPLICATE)
_mask=None
def tiltshift(img):
    global _mask
    if _mask is None:
        x=np.abs(np.linspace(-1,1,W))[None,:]; m=np.clip((x-0.30)/0.55,0,1)**1.3
        _mask=np.repeat(m,H,0)[...,None].astype(np.float32)
    small=cv2.resize(img,(W//4,H//4),interpolation=cv2.INTER_AREA)
    bl=cv2.GaussianBlur(small,(0,0),7); bl=cv2.resize(bl,(W,H),interpolation=cv2.INTER_LINEAR)
    out=img.astype(np.float32)*(1-_mask)+bl.astype(np.float32)*_mask
    out*=(1-0.35*_mask)
    return out.astype(np.uint8)
# ------------- legenda palavra a palavra -------------
def caption(cv,B,t):
    cur=None
    for w in B['words']:
        if w['s']<=t<w['e']+0.02: cur=w
    if cur is None: return
    k=(t-cur['s'])/0.18; j=hash(cur['w'])%4
    j=(B['words'].index(cur)+B['i'])%4
    sc=1.0; dy=0; dx=0; a=1.0
    if j==0: sc=1+0.6*(1-eo(k))
    elif j==1: dy=int(90*(1-eo(k)))
    elif j==2: dx=int(-160*(1-eo(k)))
    else: sc=1.5-0.5*eo(k); a=0.3+0.7*eo(k)
    sz=int(190*sc); col=(1,251,180) if cur['hl'] else (255,255,255)
    layer=cv.copy()
    text(layer,cur['w'].upper(),540+dx,1520+dy,sz,col,'mm',stroke=9,scol=(0,12,30))
    cv[:]=cv2.addWeighted(layer,min(a,1),cv,1-min(a,1),0)
# ------------- render -------------
PAINT={}
TL=json.load(open('tl.json')) if os.path.exists('tl.json') else None
def vig_grain(img,f):
    img=img.astype(np.float32)
    y,x=np.mgrid[0:H:8,0:W:8]; v=1-0.35*(((x-W/2)/(W/2))**2+((y-H/2)/(H/2))**2)
    v=cv2.resize(v.astype(np.float32),(W,H))[...,None]; img*=v
    return np.clip(img,0,255).astype(np.uint8)
def render_frame(fi):
    t=fi/FPS; B=None
    for b in TL['blocks']:
        if b['s']<=t<b['e']: B=b; break
    if B is None: B=TL['blocks'][-1]
    dur=B['e']-B['s']; u=min(max((t-B['s'])/dur,0),1); n=len(B['cams'])
    seg=min(int(u*n),n-1); su=u*n-seg; tt=t-B['s']
    cv=np.zeros((H,W,3),np.uint8)
    # cada corte de câmera mostra a cena de um estágio diferente (u andando) com outro ângulo
    PAINT[B['p']](cv,tt+seg*0.0,min(u*1.0+ (0.0),1.0),{})
    cv=camera(cv,B['cams'][seg],su)
    cv=tiltshift(cv)
    # transição nos cortes
    ft=(t-B['s'])*FPS
    if seg>0 or B['i']>0:
        st=(su*dur*n)  # segundos desde o corte
        if st<0.12:
            k=1-st/0.12; ov=np.full_like(cv,255);
            cv=cv2.addWeighted(ov,0.55*k,cv,1-0.55*k,0)
            x=int(W*(1-st/0.12)); cv[:, :max(x-W,0)]=cv[:, :max(x-W,0)]
            rect(cv,0,0,int(W*k),14,(1,251,180)); rect(cv,0,H-14,int(W*k),H,(1,251,180))
    cv=vig_grain(cv,fi)
    if fi<45 and B['i']==0:   # capa: título forte no quadro 0
        a=1.0 if fi<30 else (45-fi)/15
        layer=cv.copy()
        text(layer,"VOLTOU DO ESPAÇO",540,250,128,(255,255,255),'mm',stroke=10,scol=(0,12,30))
        text(layer,"E FOI PEGA NO AR",540,400,128,(1,251,180),'mm',stroke=10,scol=(0,12,30))
        cv=cv2.addWeighted(layer,a,cv,1-a,0)
    caption(cv,B,t)
    return cv
# ------------- áudio -------------
from scipy.signal import lfilter, butter, resample_poly
A=44100
rng=np.random.RandomState(3)
def env(n,a=0.02,d=0.3,ex=2.0):
    x=np.arange(n)/A; return np.minimum(x/a,1)*np.exp(-x/d*ex*0.5)
def whoosh(dur,f0,f1,amp=0.5,seed=0):
    r=np.random.RandomState(seed); n=int(dur*A); x=r.randn(n); out=np.zeros(n)
    for k in range(6):
        fc=f0*(f1/f0)**((k+0.5)/6); b,a=butter(2,[max(fc*0.8,30)/(A/2),min(fc*1.2,A/2-100)/(A/2)],'band'); seg=lfilter(b,a,x)
        w=np.exp(-((np.arange(n)/n-(k+0.5)/6)/0.12)**2); out+=seg*w
    return out/np.abs(out).max()*amp*np.sin(np.linspace(0,math.pi,n))**0.7
def tone(f,dur,amp=0.4,dec=0.2,f_end=None,harm=(1,),wave='sin'):
    n=int(dur*A); x=np.arange(n)/A; fr=f if f_end is None else np.linspace(f,f_end,n)
    ph=2*math.pi*np.cumsum(fr*np.ones(n))/A; y=sum(np.sin(ph*h)/h for h in harm)
    if wave=='sq': y=np.sign(y)
    return y*np.exp(-x/dec)*np.minimum(x/0.004,1)*amp
def noise(dur,lp,amp=0.4,dec=0.3,seed=0):
    r=np.random.RandomState(seed); n=int(dur*A); b,a=butter(2,lp/(A/2)); y=lfilter(b,a,r.randn(n)); y/=np.abs(y).max()
    return y*np.exp(-(np.arange(n)/A)/dec)*amp
def clank(seed,amp=0.5):
    r=np.random.RandomState(seed); fs=[820,1370,2110,3300][:3]; y=noise(0.4,5000,0.5,0.05,seed)
    y=y[:int(0.4*A)]
    for f in fs: y=y+tone(f*(1+r.rand()*0.1),0.4,0.25,0.12)
    return y*amp
def sfx_for(p,dur,seed):
    n=int(dur*A); y=np.zeros(n+A)
    def put(sig,at=0.0,g=1.0):
        i=int(at*A); y[i:i+len(sig)]+=sig[:len(y)-i]*g
    r=np.random.RandomState(seed)
    if p=='cover': put(tone(60,1.2,0.9,0.5,35)); put(whoosh(0.9,200,4000,0.5,seed)); put(tone(880,0.6,0.25,0.2,harm=(1,2)),0.05)
    elif p=='numfly':
        for k in range(14): put(tone(1200+k*60,0.05,0.25,0.02),0.05+k*0.075)
        put(tone(1500,0.5,0.3,0.25,harm=(1,2)),1.1)
    elif p=='texas': put(tone(300,0.15,0.5,0.08,90)); put(tone(1046,0.8,0.3,0.4,harm=(1,2,3)),0.2); put(whoosh(0.5,400,2500,0.3,seed))
    elif p=='liftoff': put(noise(dur,160,0.9,dur*0.9,seed)); put(tone(45,1.4,0.9,0.7,28)); put(noise(dur,2500,0.35,dur*0.7,seed+1),0.2)
    elif p=='ascent': put(tone(180,dur,0.3,dur,900)); put(noise(dur,900,0.4,dur,seed))
    elif p=='separate': put(clank(seed,0.7)); put(tone(900,0.25,0.3,0.1,150,wave='sq'),0.05); put(whoosh(0.6,300,3000,0.4,seed),0.1)
    elif p=='topdown':
        for k in range(3): put(tone(980,0.12,0.3,0.06),k*0.5); put(tone(980,0.5,0.1,0.25),k*0.5+0.02)
    elif p=='aborted': put(tone(220,0.9,0.4,0.4,60,wave='sq')); put(tone(110,0.9,0.4,0.5,50)); put(tone(1200,0.1,0.3,0.05),0.6)
    elif p=='splash': put(noise(1.0,3000,0.6,0.3,seed),dur*0.6); put(whoosh(0.9,2000,300,0.4,seed))
    elif p=='orbit_ship':
        for f in (220,277,330,440): put(tone(f,dur*0.9,0.12,dur*0.5,harm=(1,2)),0.0)
    elif p=='starlink':
        for k in range(6): put(tone(660*2**(k/6),0.5,0.22,0.15,harm=(1,2)),0.1+k*0.17)
    elif p=='clock_orbit':
        for k in range(int(dur*4)): put(tone(2400,0.03,0.25,0.012),k*0.25)
        put(tone(100,0.6,0.35,0.3),0.0)
    elif p=='reentry': put(noise(dur,6000,0.8,dur*1.2,seed)); put(noise(dur,500,0.7,dur,seed+2)); put(tone(2000,dur,0.05,dur*2,300))
    elif p=='catch': put(whoosh(0.8,150,1500,0.3,seed)); put(clank(seed,0.9),dur*0.6); put(tone(55,0.8,0.8,0.4,40),dur*0.6)
    elif p=='timeline': put(tone(500,dur,0.15,dur,1500)); put(tone(1568,0.6,0.3,0.3,harm=(1,2)),dur*0.7)
    elif p=='first':
        for k,f in enumerate((523,659,784,1046)): put(tone(f,0.9,0.25,0.5,harm=(1,2,3)),0.05+k*0.06)
        put(noise(0.6,9000,0.4,0.15,seed),0.0)
    elif p=='cost':
        for k in range(7): put(tone(2800+r.rand()*900,0.25,0.25,0.08,harm=(1,2.4)),0.1+k*0.09)
    elif p=='reuse': put(whoosh(0.5,400,2200,0.35,seed)); put(whoosh(0.5,2200,400,0.35,seed+1),0.5); put(tone(1318,0.3,0.25,0.15),0.9)
    elif p=='discard': put(noise(0.7,3500,0.5,0.25,seed)); put(tone(200,0.4,0.4,0.2,80))
    elif p=='calendar':
        for k in range(10): put(tone(700+k*90,0.06,0.22,0.03),0.05+k*0.1)
    elif p=='empty': put(tone(70,1.2,0.7,0.6,45)); put(tone(440,1.0,0.1,0.6,330,harm=(1,2)))
    elif p=='conflict': put(tone(440,0.8,0.25,0.4)); put(tone(466,0.8,0.25,0.4)); put(tone(120,0.3,0.4,0.15,60),0.0)
    elif p=='checklist':
        for k in range(3): put(tone(880*2**(k/4),0.25,0.3,0.12,harm=(1,2)),0.1+k*0.45)
        put(tone(300,0.5,0.25,0.3,220),1.4)
    elif p=='cta': put(tone(660,0.2,0.3,0.08),0.0); put(tone(990,0.3,0.3,0.12),0.12); put(whoosh(0.5,500,3500,0.3,seed))
    return y[:n+A//2]
def stage_audio():
    tl=json.load(open('tl.json')); total=tl['total']; N=int(total*A)+A
    vo,sr=sf.read('voz.wav'); vo=resample_poly(vo,A//300,sr//300).astype(np.float32)
    mix=np.zeros(N,np.float32); mix[:len(vo)]+=vo*1.0
    sfx=np.zeros(N,np.float32)
    for b in tl['blocks']:
        s=sfx_for(b['p'],b['e']-b['s'],b['i']*7+3); i=int(b['s']*A); sfx[i:i+len(s)]+=s[:N-i]*0.55
        n=len(b['cams']); dur=b['e']-b['s']
        for c in range(n):
            if c==0 and b['i']==0: continue
            at=b['s']+dur*c/n; f0=300+(b['i']*131+c*97)%500; f1=f0*(3+(b['i']+c)%4)
            w=whoosh(0.28,f0,f1,0.38,b['i']*13+c) if (b['i']+c)%2 else whoosh(0.28,f1,f0,0.38,b['i']*13+c)
            i=int(at*A); sfx[i:i+len(w)]+=w[:N-i]
    # abaixa SFX quando a voz fala
    e=np.abs(vo); k=np.ones(int(0.05*A))/int(0.05*A); e=np.convolve(e,k,'same'); e=np.minimum(e/ (np.percentile(e,95)+1e-6),1)
    duck=1-0.5*np.pad(e,(0,N-len(e)))[:N]
    out=mix+sfx*duck; out/=max(np.abs(out).max()/0.92,1)
    sf.write('mix.wav',out[:int(total*A)],A)
    print('áudio ok')
if __name__=='__main__':
    c=sys.argv[1]
    if c=='tts': stage_tts()
    elif c=='tl': stage_timeline()
    elif c=='audio': stage_audio()
    elif c=='frames':
        ts=[float(v) for v in sys.argv[2:]]; ims=[]
        import time
        for t in ts:
            t0=time.time(); f=render_frame(int(t*FPS)); print(t,round(time.time()-t0,2),flush=True); ims.append(cv2.resize(f,(360,640)))
        cv2.imwrite('tf.jpg',np.hstack(ims))
    elif c=='render':
        k,n=int(sys.argv[2]),int(sys.argv[3]); NF=int(round(TL['total']*FPS)); a=NF*k//n; b=NF*(k+1)//n
        p=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','bgr24','-s','1080x1920','-r','60','-i','-','-c:v','libx264','-preset','veryfast','-crf','18','-pix_fmt','yuv420p','-g','60',f'part{k}.mp4'],stdin=subprocess.PIPE)
        for i in range(a,b):
            p.stdin.write(render_frame(i).tobytes())
            if (i-a)%600==0: print(k,i-a,'/',b-a,flush=True)
        p.stdin.close(); p.wait(); print('done',k,flush=True)
