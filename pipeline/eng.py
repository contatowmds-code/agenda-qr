import json, math, functools, numpy as np, cv2, soundfile as sf, sys
from gfx import *
from bgs import base, bg_burst, bg_grid, bg_rain, bg_dots, bg_rays, confetti, dimc, hsh, glowband
import ui
TL=json.load(open('tl.json')); TOTAL=TL['total']; FPS=60; BLK=TL['blocks']
_y,_sr=sf.read('voz.wav'); _n=int(TOTAL*FPS)+2
_e=np.zeros(_n,np.float32)
for i in range(_n):
    a=int(i/FPS*_sr); b=a+int(_sr/FPS)
    if a<len(_y): _e[i]=np.sqrt(np.mean(_y[a:b]**2)+1e-9)
_e=_e/(np.percentile(_e,95)+1e-6); _k=np.hanning(9); _k/=_k.sum()
ENV=np.clip(np.convolve(_e,_k,'same'),0,1.3)
def env(t): return float(ENV[min(max(int(t*FPS),0),_n-1)])
SFX=[]
def hit(t,k,v=1.0): SFX.append((float(t),k,float(v)))
SHAKES=[]
def shake_off(t):
    dx=dy=0.0
    for (t0,a,d) in SHAKES:
        if t0<=t<t0+d:
            k=(1-(t-t0)/d)**2; dx+=math.sin((t-t0)*95)*a*k; dy+=math.cos((t-t0)*83)*a*k*0.8
    return dx,dy
# ---------------- fundos (horizontal) ----------------
CHAPS=[]
for b in BLK:
    if b['c'] not in CHAPS: CHAPS.append(b['c'])
CX=W//2
def bg_circuit(cv,u,e,col=Y,seed=1):
    for i in range(30):
        x=int(60+hsh(i,seed)*(W-120)); y0=int(hsh(i,seed+4)*(H-100)); ln=int(200+hsh(i,seed+7)*500)
        ye=min(y0+ln,H-1)
        cv2.line(cv,(x,y0),(x,ye),bgr(dimc(col,0.11)),2,cv2.LINE_AA)
        xe=x+int((hsh(i,seed+9)-0.5)*300); y2=min(ye+90,H-1)
        cv2.line(cv,(x,ye),(xe,y2),bgr(dimc(col,0.11)),2,cv2.LINE_AA)
        cv2.circle(cv,(xe,y2),7,bgr(dimc(col,0.3)),-1,cv2.LINE_AA)
        ph=(u*(0.25+hsh(i,2)*0.5)+hsh(i,6))%1.0; py=int(y0+ln*ph)
        cv2.circle(cv,(x,min(py,H-1)),int(6+8*e),bgr(dimc(col,0.9)),-1,cv2.LINE_AA)
def bg_hex(cv,u,e,col=Y):
    r=70; dy=r*1.5
    for row in range(-1,int(H/dy)+2):
        for cx_ in range(-1,int(W/(r*1.732))+2):
            x=cx_*r*1.732+(r*0.866 if row%2 else 0); y=row*dy
            d=math.hypot(x-CX,y-H/2)/1300.0; ph=(math.sin(u*2.2-d*7)+1)/2; k=0.05+0.3*ph*(0.4+0.8*e)
            pts=np.array([[x+r*0.95*math.cos(math.pi/6+j*math.pi/3),y+r*0.95*math.sin(math.pi/6+j*math.pi/3)] for j in range(6)],np.int32)
            cv2.polylines(cv,[pts],True,bgr(dimc(col,k)),2,cv2.LINE_AA)
def bg_codefall(cv,u,e,col=Y):
    toks=['---','name:','fn()','{ }','</>','$ _','md','#','=>','[ ]','//']
    for i in range(46):
        x=int(30+hsh(i,3)*(W-60)); sp=0.18+hsh(i,5)*0.5
        for j in range(7):
            y=int(((u*sp*1.0+hsh(i,7)+j*0.07)%1.0)*(H+200)-100); k=max(0.0,1-j/7)*(0.12+0.25*e)
            place(cv,T(toks[(i*7+j)%len(toks)],FM,34,dimc(col,min(1,k*1.8))),x,y,1,1,0,1)
def bg_wave(cv,u,e,col=Y):
    for j in range(8):
        pts=[(x,120+j*130+math.sin(x*0.005+u*(1.2+j*0.15)+j)*(40+90*e)) for x in range(0,W+60,40)]
        cv2.polylines(cv,[np.array(pts,np.int32)],False,bgr(dimc(col,0.10+0.06*(j%3))),3,cv2.LINE_AA)
def bg_orbit(cv,u,e,col=Y):
    for j in range(7):
        r=140+j*120; cv2.circle(cv,(CX,H//2),r,bgr(dimc(col,0.08)),2,cv2.LINE_AA)
        a=u*(0.6+0.15*j)*(1 if j%2 else -1)+j
        cv2.circle(cv,(int(CX+r*1.5*math.cos(a)),int(H/2+r*math.sin(a))),int(9+7*e),bgr(dimc(col,0.8)),-1,cv2.LINE_AA)

def bg_pipes(cv,u,e,col=Y):
    for j in range(9):
        y=90+j*112; cv2.line(cv,(0,y),(W,y),bgr(dimc(col,0.07)),2,cv2.LINE_AA)
        for k in range(5):
            x=int(((u*(0.12+0.05*(j%4))+hsh(j,k)+k*0.2)%1.0)*(W+300)-150); w=60+int(hsh(j,k+3)*90)
            cv2.rectangle(cv,(x,y-7),(x+w,y+7),bgr(dimc(col,0.18+0.5*e)),-1)
def bg_radar(cv,u,e,col=Y):
    cx,cy=int(W*0.78),int(H*0.5)
    for k in range(6):
        ph=(u*0.35+k/6.0)%1.0; r=int(60+ph*1500); cv2.circle(cv,(cx,cy),r,bgr(dimc(col,(1-ph)*(0.35+0.4*e))),3,cv2.LINE_AA)
    a=u*1.3; cv2.line(cv,(cx,cy),(int(cx+math.cos(a)*1600),int(cy+math.sin(a)*1600)),bgr(dimc(col,0.25)),3,cv2.LINE_AA)
def bg_blocks(cv,u,e,col=Y):
    s=96
    for i in range(int(W/s)+1):
        hgt=int(((math.sin(u*1.1+i*0.55)+1)/2*0.55+0.1+0.25*e*hsh(i,2))*H*0.6)
        for j in range(0,hgt//s+1):
            y=H-(j+1)*s; k=0.05+0.18*(j/max(1,hgt/s)); cv2.rectangle(cv,(i*s+6,y+6),(i*s+s-6,y+s-6),bgr(dimc(col,k)),2)
def bg_scan(cv,u,e,col=Y):
    x=int(((u*0.12)%1.0)*(W+400)-200); glowband_v(cv,x,150,col,0.25+0.3*e)
    for i in range(14):
        gx=(i*140+int(u*60))%W; cv2.line(cv,(gx,0),(gx,H),bgr(dimc(col,0.05)),1,cv2.LINE_AA)
    for (bx,by) in ((60,60),(W-60,60),(60,H-60),(W-60,H-60)):
        cv2.line(cv,(bx,by),(bx+(60 if bx<W/2 else -60),by),bgr(dimc(col,0.5)),4,cv2.LINE_AA); cv2.line(cv,(bx,by),(bx,by+(60 if by<H/2 else -60)),bgr(dimc(col,0.5)),4,cv2.LINE_AA)
def glowband_v(cv,x,w,col,a):
    x0=int(max(x-w,0)); x1=int(min(x+w,W))
    if x1<=x0: return
    xs=np.arange(x0,x1,dtype=np.float32); k=np.exp(-((xs-x)/(w*0.5))**2)[None,:,None]*a
    cv[:,x0:x1]=np.clip(cv[:,x0:x1]+k*np.array(bgr(col),np.float32),0,255).astype(np.uint8)
def bg_nodes(cv,u,e,col=Y):
    P=[(int(120+hsh(i,1)*(W-240)+math.sin(u*0.5+i)*50),int(110+hsh(i,2)*(H-220)+math.cos(u*0.4+i*1.3)*50)) for i in range(22)]
    for i in range(22):
        for j in range(i+1,22):
            d=math.hypot(P[i][0]-P[j][0],P[i][1]-P[j][1])
            if d<340: cv2.line(cv,P[i],P[j],bgr(dimc(col,0.18*(1-d/340)+0.02)),2,cv2.LINE_AA)
    for i,p in enumerate(P): cv2.circle(cv,p,int(6+6*e*hsh(i,5)),bgr(dimc(col,0.55)),-1,cv2.LINE_AA)
BGS=[bg_pipes,bg_radar,bg_blocks,bg_scan,bg_nodes]

def draw_bg(cv,ci,t,e): BGS[ci%len(BGS)](cv,t*0.9,e)
def fit(spr,maxw,maxh=None):
    h,w=spr.shape[:2]; k=min(1.0,maxw/w)
    if maxh: k=min(k,maxh/h)
    return k
def txt(cv,s,font,size,col,cx,cy,maxw=900,a=1.0,sx=1.0,stroke=0,sfill=BK):
    sp=T(s,font,size,col,stroke,sfill); k=fit(sp,maxw)*sx; place(cv,sp,cx,cy,k,k,0,a)
def rise(u,t0,d=.35): return eob(ramp(u,t0,t0+d),1.6)
def reveal(n,i,u,span=0.8): return ramp(u,(i+0.2)/(n+0.4)*span,(i+0.2)/(n+0.4)*span+0.12)
ICON={'doc':lambda:ui.doc(380,470,'hooks.json',8),'ia':lambda:ui.ia_chip(380),'gear':lambda:ui.gear(380)}
CY=420   # centro vertical do conteúdo
def v_big(cv,B,u,d,t):
    v=B['v']; ic=ICON.get(v.get('ic','doc'),ICON['doc'])()
    k=rise(u,0,.4); x=lerp(300,520,eo3(ramp(u,0,.4)))
    card3d(cv,ic,x,CY,0.95*k,6*math.sin(t*1.3),-10+12*math.sin(t*0.9),0,1.0)
    txt(cv,v['k'],FA,220,Y,1300,CY-50,1000,a=eio(ramp(u,.08,.28)),sx=k)
    txt(cv,v['sub'],FIB,52,WH,1300,CY+110,1000,a=eio(ramp(u,.2,.45)))
def v_title(cv,B,u,d,t):
    v=B['v']; k=rise(u,0,.45); n=f"{v['n']:02d}"
    txt(cv,n,FA,520,dimc(Y,0.28),520,CY,600,a=eio(ramp(u,0,.2)),sx=k)
    circ(cv,520,CY,int(280*k+8*math.sin(t*3)),Y,5,0.55)
    txt(cv,"CAPÍTULO",FIB,52,Y,1290,CY-190,800,a=eio(ramp(u,.1,.3)))
    words=v['k'].split(); L=[' '.join(words[:2]),' '.join(words[2:])] if len(words)>2 else [v['k']]
    L=[x for x in L if x]
    for i,l in enumerate(L):
        txt(cv,l,FA,150,WH,1290,CY-50+i*165,1000,a=eio(ramp(u,.18+.1*i,.4+.1*i)),sx=eob(ramp(u,.15+.1*i,.45+.1*i),1.5))
    ye=CY-50+len(L)*165+10
    cv2.rectangle(cv,(1000,ye),(int(1000+560*eo3(ramp(u,.3,.7))),ye+14),bgr(Y),-1)
t_cur=[0.0]
def window(cv,title,lines,u,hlset,w=1500,fs=40):
    n=len(lines); lh=int(fs*1.7); h=110+n*lh+50
    sp=ui.win(w,h,title); P=Panel(sp); o=ui.WO
    tot=sum(len(l) for l in lines)+1; shown=int(tot*ramp(u,0.05,0.82)); acc=0
    for i,l in enumerate(lines):
        y=o+64+30+i*lh; c=len(l); k=max(0,min(c,shown-acc)); acc+=c
        if i in hlset and k>0: P.rect(o+12,y-8,w-24,lh,(20,70,66),10)
        if k>0: P.text(l[:k],o+34,y+fs*0.55,FM,fs,Y if i in hlset else TX,1)
    return P.im
def showwin(cv,sp,u):
    k=rise(u,0,.35); sc=fit(sp,1700,720)*k
    place(cv,sp,CX,lerp(CY+60,CY,eo3(ramp(u,0,.3))),sc,sc,0,eio(ramp(u,0,.2)))
def v_code(cv,B,u,d,t):
    v=B['v']; lines=v['lines']; mx=max(len(l) for l in lines)
    fs=int(min(52,1380/(mx*0.62)))
    showwin(cv,window(cv,v['f'],lines,u,set(v.get('hl',[])),fs=fs),u)
def v_term(cv,B,u,d,t):
    v=B['v']; lines=v['lines']; mx=max(len(l) for l in lines); fs=int(min(52,1380/(mx*0.62)))
    showwin(cv,window(cv,'terminal',lines,u,set(),fs=fs),u)
def v_tree(cv,B,u,d,t):
    v=B['v']; lines=v['lines']; n=len(lines); fs=54; lh=96
    h=110+n*lh+50; sp=ui.win(1500,h,'explorer'); P=Panel(sp); o=ui.WO
    for i,(nm,ind) in enumerate(lines):
        a=reveal(n,i,u,0.7); y=o+64+30+i*lh
        if a<=0: continue
        isd=nm.endswith('/'); hotl=(i==v.get('hl',-1)); col=Y if hotl else (WH if isd else TX)
        if hotl: P.rect(o+12,y-6,1476,lh-6,(20,70,66),10)
        P.text(('▸ ' if isd else '▪ ')+nm,o+40+ind*58,y+40,FM,fs-4,col,min(1,a*1.4))
    showwin(cv,P.im,u)
def card(t1,t2,hot=False,w=560,h=300):
    im=rrect(w,h,34,(30,36,52,255),outline=(Y+(255,) if hot else (70,86,120,255)),ow=4 if hot else 3,shadow=18); P=Panel(im); o=18
    P.rect(o+24,o+34,10,h-68,Y,5)
    s1=T(t1,FA,76,Y if hot else WH); k1=fit(s1,w-120); 
    s2=T(t2,FIB,38,DIM); k2=fit(s2,w-120)
    Pp=Panel(P.im); Pp.put(cv2.resize(s1,None,fx=k1,fy=k1,interpolation=cv2.INTER_AREA) if k1<1 else s1,o+56,o+60)
    Pp.put(cv2.resize(s2,None,fx=k2,fy=k2,interpolation=cv2.INTER_AREA) if k2<1 else s2,o+56,o+170)
    return Pp.im
@functools.lru_cache(None)
def cardc(a,b,hot=False,w=560): return card(a,b,hot,w)
def v_cards(cv,B,u,d,t):
    items=B['v']['items']; n=len(items); gap=int(min(600,1700/n))
    for i,(a,b) in enumerate(items):
        r=reveal(n,i,u,0.8); k=eob(r,1.7)
        if r<=0: continue
        sp=cardc(a,b,False,gap-40 if gap<600 else 560); sc=fit(sp,gap-20)*k
        place(cv,sp,CX+(i-(n-1)/2)*gap,lerp(CY+200,CY,eo3(r)),sc,sc,0,min(1,r*3))
def v_cmp(cv,B,u,d,t):
    v=B['v']
    for i,(key,hot) in enumerate((('a',False),('b',True))):
        a,b=v[key]; r=ramp(u,0.06+0.28*i,0.26+0.28*i)
        if r<=0: continue
        sp=cardc(a,b,hot,780); sc=fit(sp,840)*eob(r,1.6)
        place(cv,sp,CX+(-1 if i==0 else 1)*470,CY,sc,sc,0,min(1,r*3))
    vr=ramp(u,0.3,0.5)
    if vr>0: place(cv,ui.pill("VS",120,120,Y,BK,50,font=FI),CX,CY,eob(vr),eob(vr))
def v_steps(cv,B,u,d,t):
    v=B['v']; items=v['items']; n=len(items)
    txt(cv,v.get('sub','').upper(),FIB,42,Y,CX,70,1200,a=eio(ramp(u,0,.2)))
    step=int(min(150,640/n)); y0=CY+10-(n-1)*step/2
    for i,s in enumerate(items):
        r=reveal(n,i,u,0.8)
        if r<=0: continue
        k=eob(r,1.6); sp=ui.pill(s,1200,int(step*0.82),(30,36,52),WH,44,edge=(1,251,180),font=FI); sc=fit(sp,1300)*k
        place(cv,sp,lerp(-400,CX,eo3(r)),y0+i*step,sc,sc,0,min(1,r*3))
def v_cta1(cv,B,u,d,t):
    k=rise(u,0,.5); lg=ui.qv_logo(520); e=env(t)
    circ(cv,520,CY,int((330+16*math.sin(t*4)+30*e)*k),Y,6,0.8)
    place(cv,lg,520,CY,k,k)
    txt(cv,"100% FEITO COM IA",FA,130,Y,1340,CY-30,1000,a=eio(ramp(u,.3,.55)))
    txt(cv,"usando um arquivo de edição",FIB,50,WH,1340,CY+90,1000,a=eio(ramp(u,.5,.75)))
def v_cta2(cv,B,u,d,t):
    P=Panel(rrect(1000,300,34,(30,36,52,255),outline=(70,86,120,255),ow=3,shadow=18)); o=18
    P.text("Adicione um comentário…",o+34,o+60,FIB,34,(110,110,120),1)
    n=int(7*ramp(u,.22,.5))
    if n>0: P.rect(o+24,o+100,640,84,(48,48,56),24); P.text("ARQUIVO"[:n],o+50,o+142,FI,48,Y,1)
    sendk=ramp(u,.55,.62)
    P.put(ui.pill("Publicar",200,84,Y if sendk>0.5 else (70,70,80),BK,34,font=FI),o+740,o+100)
    k=eob(ramp(u,0,.3)); card3d(cv,P.im,620,CY-60,1.0*k,6,-8,0,1.0)
    if u>.62:
        r=ramp(u,.62,.8); place(cv,ui.pill("DM  » link do arquivo",640,100,Y,BK,42,font=FI),lerp(900,1480,eio(r)),lerp(300,CY-60,eo3(r)),eob(r),eob(r),lerp(-10,0,r))
    if u>.8:
        r=ramp(u,.8,.95); place(cv,ui.pill("SEGUIR  ➜  SEGUINDO ✓",700,100,(48,48,56),WH,44,font=FI),CX,CY+230,eob(r),eob(r))

def v_flow(cv,B,u,d,t):
    v=B['v']; nodes=v['nodes']; n=len(nodes); hot=v.get('hot',-1)
    txt(cv,v.get('sub','').upper(),FIB,42,Y,CX,90,1400,a=eio(ramp(u,0,.2)))
    bw=int(min(520,(1700-(n-1)*90)/n)); gap=bw+90; x0=CX-(n-1)*gap/2
    for i in range(n-1):
        r=ramp(u,(i+.5)/(n+.5)*.7,(i+1)/(n+.5)*.7+.1)
        xa=x0+i*gap+bw/2; xb=x0+(i+1)*gap-bw/2
        if r>0:
            line(cv,(xa,CY),(xa+(xb-xa)*r,CY),(70,86,120),6)
            if r>=1: 
                p=(t*0.8+i*.3)%1.0; circ(cv,xa+(xb-xa)*p,CY,12,Y)
    for i,nm in enumerate(nodes):
        r=reveal(n,i,u,0.7)
        if r<=0: continue
        k=eob(r,1.6); sp=cardc(nm,'',i==hot,bw+20) if False else None
        im=rrect(bw,220,30,(30,36,52,255),outline=(Y+(255,) if i==hot else (70,86,120,255)),ow=5 if i==hot else 3,shadow=18)
        s=T(nm,FA,70,Y if i==hot else WH); kk=fit(s,bw-50); Pp=Panel(im); Pp.put(cv2.resize(s,None,fx=kk,fy=kk,interpolation=cv2.INTER_AREA) if kk<1 else s,int(18+(bw-s.shape[1]*min(kk,1))/2),int(18+(220-s.shape[0]*min(kk,1))/2))
        pulse=1+0.04*math.sin(t*5) if i==hot else 1
        place(cv,Pp.im,x0+i*gap,CY,k*pulse,k*pulse,0,min(1,r*3))
def v_exit(cv,B,u,d,t):
    v=B['v']; code=v['code']; col={'0':GN,'2':RD}.get(code,(255,190,60))
    k=rise(u,0,.4); circ(cv,520,CY,int((300+10*math.sin(t*4))*k),col,10,0.9)
    txt(cv,code,FA,420,col,520,CY,420,a=eio(ramp(u,.05,.3)),sx=k)
    txt(cv,"EXIT CODE",FIB,50,DIM,1330,CY-170,900,a=eio(ramp(u,.1,.3)))
    txt(cv,v['lab'],FA,130,col,1330,CY-50,1000,a=eio(ramp(u,.2,.45)),sx=eob(ramp(u,.2,.5),1.5))
    txt(cv,v['sub'],FIB,52,WH,1330,CY+90,1000,a=eio(ramp(u,.4,.65)))

VIS={'flow':v_flow,'exit':v_exit,'big':v_big,'title':v_title,'code':v_code,'term':v_term,'tree':v_tree,'cards':v_cards,'cmp':v_cmp,'steps':v_steps,'cta1':v_cta1,'cta2':v_cta2}
# ---------------- legenda ----------------
WORDS=[w for b in BLK for w in b['words']]
@functools.lru_cache(4096)
def wsp(word,col,size):
    w=word.strip(); w=w.upper() if len(w)<40 else w
    return T(w,FA,size,col,6,BK,4)
_ws=[w['s'] for w in WORDS]
import bisect
def caption(cv,t):
    i=bisect.bisect_right(_ws,t)-1
    if i<0: return
    cur=WORDS[i]
    if t>cur['e']+0.35: return
    lo=max(0,i-3); hi=min(len(WORDS),i+3)
    while lo<i and WORDS[i]['s']-WORDS[lo]['s']>2.4: lo+=1
    sps=[]
    for j in range(lo,hi):
        if j>i and WORDS[j]['s']-cur['e']>1.2: break
        wj=WORDS[j]; now=(j==i); col=Y if (wj['hl'] and now) else (WH if now else (150,160,185))
        sz=110 if now else 84
        sps.append((j,wsp(wj['w'],col,sz),now,wj['hl']))
    tot=sum(sp.shape[1] for _,sp,_,_ in sps)+34*(len(sps)-1)
    k=min(1.0,1780/max(tot,1)); x=CX-tot*k/2; y=930
    band=rrect(int(min(1860,tot*k+90)),176,40,(1,24,57,205),shadow=0)
    place(cv,band,CX,y,1,1,0,0.78*clamp((t-cur['s'])/.05+0.4))
    u=t-cur['s']
    for j,sp,now,hl in sps:
        w=sp.shape[1]*k; sc=k*(lerp(0.8,1.0,eob(ramp(u,0,.12),2.0)) if now else 1.0)
        place(cv,sp,x+w/2,y-(4 if now else 0),sc,sc,0,1.0)
        if now and hl: cv2.rectangle(cv,(int(x),int(y+62)),(int(x+w),int(y+70)),bgr(Y),-1)
        x+=w+34*k
TINT=np.array([55,22,0],np.float32)
_bs=[b['s'] for b in BLK]
# eventos de som
for i,b in enumerate(BLK):
    new_chap=(i==0) or BLK[i-1]['c']!=b['c']
    t0=b['s']
    if b['v']['t']=='title': hit(t0,"impact",0.9); SHAKES.append((t0,18,0.4))
    elif new_chap: hit(t0,'whoosh',0.6)
    else: hit(t0,'whoosh',0.35); hit(t0+0.18,'thud',0.4)
    if b['v']['t'] in('code','term'):
        for j in range(int(len(''.join(b['v']['lines']))/3)): hit(t0+0.2+j*(b['e']-b['s'])*0.7/max(1,len(''.join(b['v']['lines']))/3),'type',0.25)
    if b['v']['t'] in('cards','steps'):
        n=len(b['v']['items'])
        for j in range(n): hit(t0+(j+0.2)/(n+0.4)*0.8*(b['e']-b['s']),'pop',0.55)
    if b['v']['t']=='cmp': hit(t0+0.12*(b['e']-b['s']),'pop',0.5); hit(t0+0.4*(b['e']-b['s']),'pop',0.5)
hit(BLK[-1]['s']+0.4*(BLK[-1]['e']-BLK[-1]['s']),'ding',0.8)
def render_frame(i):
    t=i/FPS
    k=max(0,bisect.bisect_right(_bs,t)-1); B=BLK[k]
    nxt=_bs[k+1] if k+1<len(_bs) else TOTAL
    # a cena segura até começar a próxima (u cobre [s, nxt])
    d=max(nxt-B['s'],0.3); u=(t-B['s'])/d
    cv=base(); e=env(t)
    ci=CHAPS.index(B['c']); draw_bg(cv,ci,t,e)
    # progresso de capítulo no topo
    prog=(ci+u*0+0.0)/max(1,len(CHAPS)-1)
    cv2.rectangle(cv,(60,30),(W-60,40),bgr((40,52,80)),-1)
    cv2.rectangle(cv,(60,30),(int(60+(W-120)*(t/TOTAL)),40),bgr(Y),-1)
    if t<0.004 or True:
        pass
    ff=VIS[B['v']['t']]
    uu=u if t>=0.01 else 1.0
    if i==0: uu=0.9
    ff(cv,B,uu,d,t)
    sw=(t-B['s'])/0.28
    if 0<=sw<1 and i>0:
        x=int(lerp(-260,W+60,eio(sw))); cv2.rectangle(cv,(x,0),(x+200,H),bgr(Y),-1); cv2.rectangle(cv,(x+200,0),(x+300,H),bgr(dimc(Y,0.35)),-1)
    vignette(cv)
    lum=cv.max(2,keepdims=True).astype(np.float32)/255.0
    cv[:]=np.clip(cv+TINT*(1-lum)**3,0,255).astype(np.uint8)
    caption(cv,t)
    dx,dy=shake_off(t)
    if abs(dx)+abs(dy)>0.3:
        M=np.float32([[1,0,dx],[0,1,dy]]); cv=cv2.warpAffine(cv,M,(W,H),borderMode=cv2.BORDER_REFLECT)
    return cv
