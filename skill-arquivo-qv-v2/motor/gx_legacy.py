import numpy as np, cv2, math
W,H=1080,1920
AA=cv2.LINE_AA
def hsh(i,s=0):
    x=math.sin(i*127.1+s*311.7)*43758.5453
    return x-math.floor(x)
def ease(x): x=min(max(x,0),1); return x*x*(3-2*x)
def eo(x): x=min(max(x,0),1); return 1-(1-x)**3
def bgr(c): return (int(c[2]),int(c[1]),int(c[0]))   # entrada RGB -> BGR
_G={}
def grad(top,bot):
    k=(tuple(top),tuple(bot))
    if k not in _G:
        t=np.linspace(0,1,H)[:,None,None]
        a=np.array(top[::-1],np.float32)[None,None,:]; b=np.array(bot[::-1],np.float32)[None,None,:]
        _G[k]=np.repeat((a*(1-t)+b*t),W,1).astype(np.uint8)
    return _G[k].copy()
_S={}
def sprite(r):
    r=int(r)
    if r not in _S:
        y,x=np.mgrid[-r:r+1,-r:r+1]; d=np.sqrt(x*x+y*y)/r
        _S[r]=np.clip(1-d,0,1)**2.2
    return _S[r]
def glow(cv,x,y,r,col,k=1.0):
    r=max(int(r),2); s=sprite(r); x=int(x); y=int(y)
    x0,y0=max(x-r,0),max(y-r,0); x1,y1=min(x+r+1,W),min(y+r+1,H)
    if x1<=x0 or y1<=y0: return
    sub=s[y0-(y-r):y1-(y-r),x0-(x-r):x1-(x-r)][...,None]*k
    reg=cv[y0:y1,x0:x1].astype(np.float32)
    reg+=sub*np.array(col[::-1],np.float32)
    cv[y0:y1,x0:x1]=np.clip(reg,0,255).astype(np.uint8)
def poly(cv,pts,col,x=0,y=0,ang=0,s=1.0,fill=True,th=2):
    p=np.array(pts,np.float32)*s
    c,sn=math.cos(ang),math.sin(ang)
    q=np.stack([p[:,0]*c-p[:,1]*sn+x,p[:,0]*sn+p[:,1]*c+y],1).astype(np.int32)
    if fill: cv2.fillPoly(cv,[q],bgr(col),AA)
    else: cv2.polylines(cv,[q],True,bgr(col),th,AA)
def rect(cv,x0,y0,x1,y1,col,a=1.0):
    x0,y0,x1,y1=[int(v) for v in (x0,y0,x1,y1)]
    x0,x1=max(x0,0),min(x1,W); y0,y1=max(y0,0),min(y1,H)
    if x1<=x0 or y1<=y0: return
    if a>=1: cv[y0:y1,x0:x1]=bgr(col)
    else: cv[y0:y1,x0:x1]=(cv[y0:y1,x0:x1]*(1-a)+np.array(bgr(col),np.float32)*a).astype(np.uint8)
def stars(cv,t,seed=0,n=140,drift=0.0,col=(255,255,255)):
    for i in range(n):
        x=(hsh(i,seed)*W+drift*t*(0.2+hsh(i,seed+1)))%W; y=hsh(i,seed+2)*H
        b=0.4+0.6*abs(math.sin(t*(1+hsh(i,seed+3)*3)+i))
        r=1+int(hsh(i,seed+4)*2.2)
        cv2.circle(cv,(int(x),int(y)),r,bgr(tuple(int(c*b) for c in col)),-1,AA)
def streak_lines(cv,t,n,col,speed,seed=0,vertical=True,alpha=0.5,length=300):
    ov=cv.copy()
    for i in range(n):
        a=hsh(i,seed); b=hsh(i,seed+5)
        L=length*(0.4+b)
        if vertical:
            x=int(a*W); y=int(((t*speed*(0.5+b)+hsh(i,seed+9)*H*2)%(H+L*2))-L)
            cv2.line(ov,(x,y),(x,int(y+L)),bgr(col),2+int(b*3),AA)
        else:
            y=int(a*H); x=int(((t*speed*(0.5+b)+hsh(i,seed+9)*W*2)%(W+L*2))-L)
            cv2.line(ov,(x,y),(int(x+L),y),bgr(col),2+int(b*3),AA)
    cv[:]=cv2.addWeighted(ov,alpha,cv,1-alpha,0)
# ---------- texto ----------
from PIL import Image, ImageDraw, ImageFont
_F={}
def font(sz,name='Anton-Regular.ttf'):
    k=(sz,name)
    if k not in _F: _F[k]=ImageFont.truetype(name,sz)
    return _F[k]
def text(cv,s,x,y,sz,col,anchor='mm',stroke=0,scol=(0,0,0),name='Anton-Regular.ttf'):
    im=Image.fromarray(cv[...,::-1]); d=ImageDraw.Draw(im)
    d.text((x,y),s,font=font(sz,name),fill=tuple(col),anchor=anchor,stroke_width=stroke,stroke_fill=tuple(scol))
    cv[:]=np.asarray(im)[...,::-1]
# ---------- terra ----------
_T=None
def earth_tex():
    global _T
    if _T is None:
        rng=np.random.RandomState(7)
        n=np.zeros((256,512),np.float32)
        for o,sc in ((4,1.0),(8,.5),(16,.25),(32,.12)):
            n+=cv2.resize(rng.rand(o,o*2).astype(np.float32),(512,256),interpolation=cv2.INTER_CUBIC)*sc
        n=(n-n.min())/(n.max()-n.min())
        t=np.zeros((256,512,3),np.float32)
        ocean=np.array([160,70,20],np.float32); land=np.array([70,150,80],np.float32)
        m=(n>0.55)[...,None]; t[:]=np.where(m,land,ocean)
        cl=cv2.resize(rng.rand(10,20).astype(np.float32),(512,256),interpolation=cv2.INTER_CUBIC)>0.62
        t[cl]=t[cl]*0.35+np.array([255,255,255],np.float32)*0.65
        _T=np.tile(t,(1,2,1))
    return _T
def earth(cv,cx,cy,r,rot=0.0,atm=True,tint=1.0):
    tex=earth_tex(); r=int(r)
    sz=2*r+1
    y,x=np.mgrid[-r:r+1,-r:r+1].astype(np.float32)
    d=np.sqrt(x*x+y*y); m=d<=r
    z=np.sqrt(np.clip(1-(d/r)**2,0,1))
    lon=np.arcsin(np.clip(x/r,-1,1))/ math.pi+0.5+rot
    lat=np.arcsin(np.clip(y/r,-1,1))/math.pi+0.5
    u=(lon*512)%1024; v=np.clip(lat*255,0,255)
    img=cv2.remap(tex,u.astype(np.float32),v.astype(np.float32),cv2.INTER_LINEAR)
    light=np.clip(0.25+0.9*(z*0.6-x/r*0.35-y/r*0.25),0.1,1.1)[...,None]
    img=np.clip(img*light*tint,0,255).astype(np.uint8)
    x0,y0=cx-r,cy-r
    ax0,ay0=max(x0,0),max(y0,0); ax1,ay1=min(x0+sz,W),min(y0+sz,H)
    if ax1<=ax0 or ay1<=ay0: return
    sub=img[ay0-y0:ay1-y0,ax0-x0:ax1-x0]; mm=m[ay0-y0:ay1-y0,ax0-x0:ax1-x0]
    reg=cv[ay0:ay1,ax0:ax1]; reg[mm]=sub[mm]
    if atm:
        for k,(rr,a) in enumerate(((r*1.10,0.15),(r*1.05,0.25),(r*1.02,0.5))):
            ov=cv.copy(); cv2.circle(ov,(cx,cy),int(rr),(255,190,90),max(int(r*0.03),2),AA)
            cv[:]=cv2.addWeighted(ov,a,cv,1-a,0)
# ---------- naves ----------
STEEL=(205,210,218)
def ship(cv,x,y,h,ang=0.0,flame=0.0,t=0.0,heat=0.0,flaps=0.0):
    s=h/380.0
    # chama
    if flame>0:
        for k,(w,L,c) in enumerate(((60,260,(255,120,30)),(40,200,(255,200,80)),(22,140,(255,255,220)))):
            L2=L*flame*(0.85+0.15*math.sin(t*50+k*2));
            poly(cv,[(-w,100),(w,100),(0,100+L2)],c,x,y,ang,s)
        glow(cv,x+math.sin(ang)*-120*s,y+math.cos(ang)*120*s,int(260*s*flame)+10,(255,150,60),0.9*flame)
    # aletas
    fl=1.0+flaps*0.35
    poly(cv,[(-50,-40),(-92,-10*fl),(-50,10)],(150,155,165),x,y,ang,s)
    poly(cv,[(50,-40),(92,-10*fl),(50,10)],(150,155,165),x,y,ang,s)
    poly(cv,[(-50,50),(-120*fl,110),(-50,105)],(130,136,148),x,y,ang,s)
    poly(cv,[(50,50),(120*fl,110),(50,105)],(130,136,148),x,y,ang,s)
    # corpo
    body=[(-50,-70),(-44,-120),(-30,-160),(0,-195),(30,-160),(44,-120),(50,-70),(50,105),(-50,105),]
    poly(cv,body,STEEL,x,y,ang,s)
    poly(cv,[(-50,-70),(-44,-120),(-30,-160),(0,-195),(-8,-160),(-14,-100),(-14,105),(-50,105)],(240,244,250),x,y,ang,s)
    poly(cv,[(50,-70),(50,105),(22,105),(26,-110),(44,-120)],(120,126,138),x,y,ang,s)
    if heat>0:   # escudo térmico incandescente
        poly(cv,[(-50,-70),(50,-70),(50,105),(-50,105)],(35,35,42),x,y,ang,s)
        poly(cv,[(-50,-70),(50,-70),(50,105),(-50,105)],(255,120,40),x,y,ang,s,fill=False,th=3)
        glow(cv,x,y+40*s,int(300*s*(0.6+heat)),(255,100+int(80*heat),30),0.8*heat)
    cv2.line(cv,(int(x),int(y)),(int(x),int(y)),(0,0,0),1)
def booster(cv,x,y,h,ang=0.0,flame=0.0,t=0.0,fins=1.0):
    s=h/420.0
    if flame>0:
        for k,(w,L,c) in enumerate(((80,300,(255,110,30)),(55,230,(255,190,70)),(30,160,(255,255,230)))):
            L2=L*flame*(0.85+0.15*math.sin(t*47+k)); poly(cv,[(-w,210),(w,210),(0,210+L2)],c,x,y,ang,s)
        glow(cv,x,y+250*s,int(300*s*flame)+10,(255,150,60),0.9*flame)
    poly(cv,[(-58,-170),(58,-170),(58,210),(-58,210)],STEEL,x,y,ang,s)
    poly(cv,[(-58,-170),(-20,-170),(-20,210),(-58,210)],(240,244,250),x,y,ang,s)
    poly(cv,[(58,-170),(58,210),(30,210),(30,-170)],(120,126,138),x,y,ang,s)
    poly(cv,[(-58,-170),(-50,-205),(50,-205),(58,-170)],(170,175,185),x,y,ang,s)
    poly(cv,[(-58,150),(58,150),(58,210),(-58,210)],(60,62,70),x,y,ang,s)
    f=fins
    poly(cv,[(-58,-150),(-58-60*f,-140),(-58-60*f,-110),(-58,-100)],(90,95,105),x,y,ang,s)
    poly(cv,[(58,-150),(58+60*f,-140),(58+60*f,-110),(58,-100)],(90,95,105),x,y,ang,s)
def tower(cv,x,ytop,ybot,arm=0.0,ay=None,col=(120,130,150)):
    # torre em treliça; arm 0=abertos 1=fechados
    w=70
    cv2.line(cv,(x-w,ytop),(x-w,ybot),bgr(col),6,AA); cv2.line(cv,(x+w,ytop),(x+w,ybot),bgr(col),6,AA)
    n=int((ybot-ytop)/90)
    for i in range(n):
        y0=ytop+i*90; y1=y0+90
        cv2.line(cv,(x-w,y0),(x+w,y1),bgr(col),3,AA); cv2.line(cv,(x+w,y0),(x-w,y1),bgr(col),3,AA)
        cv2.line(cv,(x-w,y0),(x+w,y0),bgr(col),3,AA)
    if ay is not None:
        gap=190*(1-arm)+58*arm
        for sgn in (-1,1):
            x0=x+sgn*w; x1=x+sgn*gap
            poly(cv,[(x0,ay-14),(x1,ay-24),(x1,ay+24),(x0,ay+14)],(235,120,50),0,0,0,1)
            cv2.line(cv,(int(x0),int(ay+30)),(int(x1),int(ay+40)),bgr(col),4,AA)
def waves(cv,y0,t,col,amp=14,n=5,spd=1.0):
    for j in range(n):
        pts=[]
        for x in range(-20,W+40,30):
            pts.append((x,y0+j*38+amp*math.sin(x*0.012+t*spd*(1+j*0.3)+j)))
        pts+=[(W+40,H+10),(-20,H+10)]
        c=tuple(int(v*(0.55+0.14*j)) for v in col)
        cv2.fillPoly(cv,[np.array(pts,np.int32)],bgr(c),AA)
def clouds(cv,t,y,col=(235,238,245),n=7,seed=0,spd=40,a=0.9):
    ov=cv.copy()
    for i in range(n):
        x=((hsh(i,seed)*W*1.6+t*spd*(0.5+hsh(i,seed+3)))%(W*1.6))-W*0.3
        yy=y+hsh(i,seed+1)*260; r=60+hsh(i,seed+2)*90
        for k in range(4):
            cv2.circle(ov,(int(x+k*r*0.7),int(yy+(k%2)*r*0.2)),int(r*(0.7+0.2*k%3)),bgr(col),-1,AA)
    ov=cv2.GaussianBlur(ov,(0,0),12); cv[:]=cv2.addWeighted(ov,a,cv,1-a,0)
def particles(cv,t,n,x,y,col,spread,speed,seed=0,life=1.2,r=6,ang0=-math.pi/2,cone=math.pi):
    for i in range(n):
        ph=((t/life)+hsh(i,seed))%1.0
        a=ang0+(hsh(i,seed+1)-0.5)*cone
        d=ph*speed*(0.4+hsh(i,seed+2))
        px=x+math.cos(a)*d+(hsh(i,seed+3)-0.5)*spread; py=y+math.sin(a)*d
        k=1-ph
        cv2.circle(cv,(int(px),int(py)),max(int(r*k),1),bgr(tuple(int(c*k+30) for c in col)),-1,AA)
def ring(cv,x,y,r,col,th=4,a=1.0):
    if a<=0: return
    ov=cv.copy(); cv2.circle(ov,(int(x),int(y)),int(r),bgr(col),th,AA); cv[:]=cv2.addWeighted(ov,a,cv,1-a,0)
def arrow(cv,p0,p1,col,th=8):
    cv2.arrowedLine(cv,(int(p0[0]),int(p0[1])),(int(p1[0]),int(p1[1])),bgr(col),th,AA,0,0.35)
def sat(cv,x,y,s,ang=0.0,t=0.0,blink=True):
    poly(cv,[(-14,-10),(14,-10),(14,10),(-14,10)],(190,195,205),x,y,ang,s)
    poly(cv,[(-95,-14),(-18,-14),(-18,14),(-95,14)],(40,90,200),x,y,ang,s)
    poly(cv,[(18,-14),(95,-14),(95,14),(18,14)],(40,90,200),x,y,ang,s)
    for k in range(-3,0):
        poly(cv,[(k*26+13,-14),(k*26+13,14)],(120,170,255),x,y,ang,s,fill=False,th=1)
    if blink and int(t*4)%2==0: glow(cv,x,y,int(30*s),(255,60,60),0.9)
