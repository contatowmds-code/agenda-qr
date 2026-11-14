import math, functools, numpy as np, cv2
from gfx import *
from bgs import dimc, hsh
import eng as E, objs, ui
def tiltshift(cv):
    sm=cv2.resize(cv,(W//3,H//3),interpolation=cv2.INTER_AREA); sm=cv2.GaussianBlur(sm,(0,0),7); bl=cv2.resize(sm,(W,H))
    xs=np.abs(np.arange(W)-540)[None,:]; m=(np.clip((xs-300)/240.0,0,1)**1.1)[...,None].astype(np.float32)
    bl=bl*(1-0.5*m); cv[:]=(cv*(1-m)+bl*m).astype(np.uint8)
CAMS={'push':(1.0,1.09,0,0,0,0),'pull':(1.09,1.0,0,0,0,0),'left':(1.05,1.05,40,-40,0,0),'right':(1.05,1.05,-40,40,0,0),'up':(1.05,1.05,0,0,50,-30),'down':(1.05,1.05,0,0,-40,40),'low':(1.04,1.1,0,0,-30,-70)}
def camwarp(cv,name,f):
    z0,z1,x0,x1,y0,y1=CAMS[name]; e=eio(f); z=lerp(z0,z1,e); dx=lerp(x0,x1,e); dy=lerp(y0,y1,e)
    M=np.float32([[z,0,540*(1-z)+dx],[0,z,900*(1-z)+dy]]); cv[:]=cv2.warpAffine(cv,M,(W,H),borderMode=cv2.BORDER_REFLECT)
BRIGHT={1:True,2:True,6:True,9:True,10:True,11:True}
@functools.lru_cache(None)
def grad_bg(kind):
    y=np.linspace(0,1,H)[:,None,None]; 
    if kind==0: a=np.array((0,10,30),np.float32); b=np.array((3,30,66),np.float32)
    elif kind==1: a=np.array((1,251,180),np.float32); b=np.array((1,215,150),np.float32)
    elif kind==2: a=np.array((250,247,240),np.float32); b=np.array((228,222,210),np.float32)
    elif kind==3: a=np.array((60,4,8),np.float32); b=np.array((150,14,22),np.float32)
    elif kind==5: a=np.array((0,40,46),np.float32); b=np.array((0,96,90),np.float32)
    elif kind==6: a=np.array((250,200,60),np.float32); b=np.array((230,160,30),np.float32)
    elif kind==7: a=np.array((8,10,16),np.float32); b=np.array((34,38,52),np.float32)
    elif kind==8: a=np.array((24,100,190),np.float32); b=np.array((8,50,120),np.float32)
    elif kind==9: a=np.array((225,255,246),np.float32); b=np.array((170,240,220),np.float32)
    elif kind==10: a=np.array((222,194,148),np.float32); b=np.array((196,164,118),np.float32)
    elif kind==11: a=np.array((238,235,226),np.float32); b=np.array((214,210,198),np.float32)
    elif kind==12: a=np.array((20,22,58),np.float32); b=np.array((46,24,92),np.float32)
    else: a=np.array((2,16,44),np.float32); b=np.array((4,40,86),np.float32)
    im=(a*(1-y)+b*y)*np.ones((1,W,1),np.float32)
    xx=np.linspace(-1,1,W)[None,:,None]; yy=np.linspace(-1,1,H)[:,None,None]; v=1-0.28*np.clip(xx**2+yy**2*0.6,0,1.4)
    return np.ascontiguousarray((im*v)[...,::-1].clip(0,255).astype(np.uint8))
def floor(cv,t,col,hy=1040,a=0.35):
    for i in range(-9,10):
        x=540+i*190; cv2.line(cv,(540+i*26,hy),(int(540+i*520),H),bgr(dimc(col,a)),2,cv2.LINE_AA)
    for j in range(9):
        k=((j+t*0.5)%9)/9.0; y=int(hy+(H-hy)*(k**2.0)); cv2.line(cv,(0,y),(W,y),bgr(dimc(col,a*(0.3+k))),2,cv2.LINE_AA)
def rays(cv,t,col,a,cx=540,cy=900,n=18,spd=0.25):
    ov=np.zeros_like(cv)
    for i in range(n):
        a0=t*spd+i*2*math.pi/n; a1=a0+math.pi/n*0.9; R=2600
        pts=np.array([[cx,cy],[cx+R*math.cos(a0),cy+R*math.sin(a0)],[cx+R*math.cos(a1),cy+R*math.sin(a1)]],np.int32)
        cv2.fillConvexPoly(ov,pts,bgr(col))
    cv[:]=np.clip(cv.astype(np.int16)+(ov.astype(np.int16)*a).astype(np.int16),0,255).astype(np.uint8)

PAL={10:[(40,70,200),(30,150,230),(60,60,60),(220,120,30)],11:[(20,20,20),(40,40,190),(180,120,20),(90,90,90)],12:[(1,251,180),(240,80,160),(250,200,60),(90,140,255)]}
def torn(cv,pts,col,a=1.0):
    ov=cv.copy(); cv2.fillPoly(ov,[np.array(pts,np.int32)],bgr(col),cv2.LINE_AA); cv2.polylines(ov,[np.array(pts,np.int32)],True,(250,250,250),3,cv2.LINE_AA)
    cv[:]=cv2.addWeighted(ov,a,cv,1-a,0)
def collage(cv,k,t):
    # estilo colagem de papel (Vox): recortes rasgados, pontos de meio-tom e fita
    pal=PAL[k]
    for i in range(9):
        cx=hsh(i,31)*1080; cy=(hsh(i,32)*1900+math.sin(t*0.5+i)*26)%1920; r=150+hsh(i,33)*220; n=9
        pts=[(cx+(r*(0.78+0.32*hsh(i*13+j,34)))*math.cos(j*6.283/n+hsh(i,35)*3),cy+(r*(0.78+0.32*hsh(i*13+j,36)))*math.sin(j*6.283/n+hsh(i,35)*3)) for j in range(n)]
        torn(cv,pts,pal[i%len(pal)],0.55)
    ox=int(t*14)%46
    for x in range(-46,W+46,46):
        for y in range(0,H,46):
            rr=1+int(2.2*(0.5+0.5*math.sin(x*.013+y*.009+t*0.8)))
            cv2.circle(cv,(x+ox,y+(23 if (x//46)%2 else 0)),rr,bgr((60,52,44) if k!=12 else (150,130,210)),-1,cv2.LINE_AA)
    for i in range(4):
        x=int(hsh(i,41)*900)+60; y=int(hsh(i,42)*1700)+80; ov=cv.copy(); M=cv2.getRotationMatrix2D((x,y),(hsh(i,43)-.5)*50,1)
        cv2.rectangle(ov,(x-70,y-18),(x+70,y+18),(210,225,235),-1); cv[:]=cv2.addWeighted(ov,0.42,cv,0.58,0)
@functools.lru_cache(8)
def _vig():
    xx=np.linspace(-1,1,W)[None,:]; yy=np.linspace(-1,1,H)[:,None]; v=1-0.30*np.clip(xx**2*0.9+yy**2*0.7,0,1.3); return v[...,None].astype(np.float32)
_NZ=np.random.RandomState(7).randint(-14,15,(H+64,W+64,1)).astype(np.int16)
def finish(cv,t):
    # acabamento (Remotion: camada final) - vinheta + grão leve + contraste suave
    f=int(t*60); ox=(f*37)%64; oy=(f*53)%64
    x=cv.astype(np.float32)*_vig(); x=(x-128)*1.04+128
    x=x+_NZ[oy:oy+H,ox:ox+W]*0.55
    cv[:]=np.clip(x,0,255).astype(np.uint8)
def bg(cv,k,t,tb,e):
    cv[:]=grad_bg(k)
    if k==0:
        rays(cv,t,(20,70,120),0.22,540,-200,10,0.05); floor(cv,t,Y,1040,0.30)
        for i in range(26): circ(cv,int(hsh(i,1)*1080),int(((hsh(i,2)-t*0.03*(0.5+hsh(i,3)))%1.0)*1900),int(3+hsh(i,4)*5),Y,-1,0.25)
    elif k==1:
        rays(cv,t,(255,255,255),0.16,540,860,16,0.18)
        for i in range(18): cv2.circle(cv,(int(hsh(i,5)*1080),int(((hsh(i,6)+t*0.05)%1.0)*1900)),int(6+hsh(i,7)*10),bgr((1,150,110)),-1,cv2.LINE_AA)
    elif k==2:
        for x in range(0,W,60):
            for y in range(0,H,60): cv2.circle(cv,(x+int(8*math.sin(t+y*.01)),y),2,bgr((200,196,186)),-1)
        rays(cv,t,(255,255,255),0.25,540,820,12,0.1)
    elif k==3:
        for i in range(7): cv2.circle(cv,(int(hsh(i,8)*1080),int(500+hsh(i,9)*1000+math.sin(t*.6+i)*50)),int(220+hsh(i,10)*200),bgr((200,40,40)),-1,cv2.LINE_AA)
        cv[:]=cv2.addWeighted(cv,0.35,grad_bg(3),0.65,0); floor(cv,t,(255,80,80),1040,0.28)
    elif k==5:
        floor(cv,t,(1,251,180),1040,0.35); rays(cv,t,(0,140,130),0.25,540,-100,8,0.08)
    elif k==6:
        rays(cv,t,(255,240,170),0.3,540,860,20,-0.15)
    elif k==7:
        for i in range(40): cv2.line(cv,(int(hsh(i,21)*1080),int(((hsh(i,22)+t*0.25*(0.4+hsh(i,23)))%1.0)*1920)),(int(hsh(i,21)*1080),int(((hsh(i,22)+t*0.25*(0.4+hsh(i,23)))%1.0)*1920)+int(40+hsh(i,24)*90)),bgr((60,70,100)),2)
        floor(cv,t,(120,130,170),1080,0.25)
    elif k==8:
        for i in range(9): cv2.circle(cv,(540,900),int(((i/9.0+t*0.12)%1.0)*1300),bgr((90,160,235)),4,cv2.LINE_AA)
    elif k==9:
        for x in range(0,W,90):
            for y in range(0,H,90): cv2.rectangle(cv,(x+10,y+10+int(6*math.sin(t*1.5+x*.02))),(x+26,y+26+int(6*math.sin(t*1.5+x*.02))),bgr((150,225,205)),-1)
        rays(cv,t,(255,255,255),0.3,540,820,10,0.12)
    elif k in (10,11,12):
        collage(cv,k,t)
    else:
        rays(cv,t,(40,110,190),0.35,540,860,14,0.3)
@functools.lru_cache(512)
def word(s,col,box,size=118):
    sp=T(s,FA,size,col,0,BK,0)
    if box:
        h,w=sp.shape[:2]; bar=ui.rrect(w+34,h-4,22,box+(255,),shadow=8); Pn=E.Panel(bar); Pn.put(sp,17+8,(bar.shape[0]-h)//2+2); return Pn.im
    return sp
def title(cv,tt,tb,bright):
    lines=tt.split('|'); y=250
    for ln in lines:
        toks=ln.split(); items=[]
        key=False
        for tk in toks:
            if tk.startswith('*'): key=True
            clean=tk.replace('*','')
            items.append((clean,key))
            if tk.endswith('*'): key=False
        ws=[]
        for s,kf in items:
            col=(BK if bright else WH) if not kf else (Y if bright else BK)
            box=((BK if bright else Y) if kf else None)
            if kf and bright: col=Y
            ws.append(word(s.upper(),col,box))
        gap=22; tot=sum(w.shape[1] for w in ws)+gap*(len(ws)-1); k=min(1.0,980/tot); x=540-tot*k/2
        for i,w in enumerate(ws):
            u=ramp(tb,0.04+i*0.07,0.22+i*0.07); sc=eob(u,1.9)*k; cx=x+w.shape[1]*k/2
            place(cv,w,cx,y,sc,sc,0,eio(u*3)); x+=(w.shape[1]+gap)*k
        y+=150
def punch(cv,tb):
    if tb<0.24 and tb>=0:
        p=1-tb/0.24; cx,cy=540,900
        ov=cv.copy()
        for i in range(46):
            a=hsh(i,3)*6.283; r0=120+hsh(i,4)*160+ (1-p)*500; r1=r0+260+hsh(i,5)*500
            cv2.line(ov,(int(cx+r0*math.cos(a)),int(cy+r0*math.sin(a))),(int(cx+r1*math.cos(a)),int(cy+r1*math.sin(a))),(255,255,255),3+int(hsh(i,6)*5),cv2.LINE_AA)
        cv[:]=cv2.addWeighted(ov,0.55*p,cv,1-0.55*p,0)
def v_hero(cv,B,u,d,t):
    v=B['v']; tb=u*d; k=v.get('bg',0); bright=BRIGHT.get(k,False)
    bg(cv,k,t,tb,E.env(t)); tiltshift(cv)
    name=v['o']; sp=objs.obj(name); h,w=sp.shape[:2]
    big=v.get('s',1.15); en=eob(ramp(tb,0,.28),2.3); sc=big*en*(1+0.035*math.sin(t*3.1)+0.05*ramp(tb,0,d))
    cy=860+8*math.sin(t*2.3)
    ry=14*math.sin(t*1.7)+20*(1-ramp(tb,0,.35)); rx=6*math.sin(t*1.3)
    if k in (0,3,4):
        fl=np.flipud(sp).copy(); fl[...,3]=(fl[...,3]*np.linspace(0.30,0,fl.shape[0])[:,None]).astype(np.uint8)
        E.card3d(cv,fl,540,cy+h*sc*0.97,sc,-rx,ry,0,0.9*ramp(tb,.1,.3))
    else:
        ov=cv.copy(); cv2.ellipse(ov,(540,int(cy+h*sc*0.52)),(int(w*sc*0.36),int(34*sc)),0,0,360,(40,50,70) if bright else (0,0,0),-1,cv2.LINE_AA); cv[:]=cv2.addWeighted(ov,0.3,cv,0.7,0)
    E.card3d(cv,sp,540,cy,sc,rx,ry,3*math.sin(t*1.1),1.0)
    if v.get('o2'):
        s2=objs.obj(v['o2']); k2=eob(ramp(tb,.35,.6),2.0)*v.get('s2',0.6); x2=lerp(900,v.get('x2',700),eo3(ramp(tb,.35,.7)))+14*math.sin(t*4); y2=lerp(1300,v.get('y2',1000),eo3(ramp(tb,.35,.7)))
        E.card3d(cv,s2,x2,y2,k2,0,0,-8,1.0)
    if v.get('n') is not None:
        val=int(v['n']*eo3(ramp(tb,.05,.7))); s=f"{v.get('pre','')}{val:,}".replace(',','.')+v.get('suf','')
        E.txt(cv,s,FA,170,(BK if bright else Y),540,1215,980,a=eio(ramp(tb,.05,.2)),sx=eob(ramp(tb,.05,.3),1.8))
    cams=v.get('cam')
    if cams:
        n=len(cams); j=min(n-1,int(u*n)); camwarp(cv,cams[j],u*n-j)
    title(cv,v['tt'],tb if not (B['i']==0 and t<0.9) else 0.9,bright)
    punch(cv,tb)
    finish(cv,t)
    if tb<0.7:  # faíscas
        for i in range(14):
            a=hsh(i,11)*6.283; r=60+eo3(ramp(tb,0,.7))*(260+hsh(i,12)*300); circ(cv,540+r*math.cos(a),860+r*math.sin(a),int(5+hsh(i,13)*7),Y if not bright else BK,-1,0.8*(1-tb/0.7))
E.VIS['hero']=v_hero

for _i,_B in enumerate(E.BLK):
    _v=_B['v']
    if _v['t']!='hero': continue
    _n=E.BLK[_i+1]['s'] if _i+1<len(E.BLK) else E.TOTAL; _d=_n-_B['s']
    E.hit(_B['s']+0.02,'pop',0.6)
    if _v.get('o2'): E.hit(_B['s']+0.35,'blip',0.6)
    if _v.get('n') is not None:
        for _j in range(5): E.hit(_B['s']+0.1+_j*0.12,'tick',0.35)
    for _j in range(1,len(_v.get('cam',[]))): E.hit(_B['s']+_j*_d/len(_v['cam']),'whoosh',0.2)
