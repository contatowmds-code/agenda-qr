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
# ---------------- fundos novos (vídeo 2) ----------------
CHAPS=[]
for b in BLK:
    if b['c'] not in CHAPS: CHAPS.append(b['c'])
def bg_circuit(cv,u,e,col=Y,seed=1):
    # trilhas de circuito com pulsos de dados que correm pelas linhas
    for i in range(22):
        x=int(60+hsh(i,seed)*960); y0=int(hsh(i,seed+4)*1900)
        ln=int(260+hsh(i,seed+7)*700)
        cv2.line(cv,(x,y0),(x,min(y0+ln,1919)),bgr(dimc(col,0.11)),2,cv2.LINE_AA)
        xe=x+int((hsh(i,seed+9)-0.5)*300); ye=min(y0+ln,1919)
        cv2.line(cv,(x,ye),(xe,min(ye+90,1919)),bgr(dimc(col,0.11)),2,cv2.LINE_AA)
        cv2.circle(cv,(xe,min(ye+90,1919)),7,bgr(dimc(col,0.3)),-1,cv2.LINE_AA)
        ph=(u*(0.25+hsh(i,2)*0.5)+hsh(i,6))%1.0; py=int(y0+ln*ph)
        cv2.circle(cv,(x,py),int(6+8*e),bgr(dimc(col,0.9)),-1,cv2.LINE_AA)
def bg_hex(cv,u,e,col=Y):
    r=70; dy=r*1.5; 
    for row in range(-1,int(1920/dy)+2):
        for cx_ in range(-1,int(1080/(r*1.732))+2):
            x=cx_*r*1.732+(r*0.866 if row%2 else 0); y=row*dy
            d=math.hypot(x-540,y-900)/1300.0
            ph=(math.sin(u*2.2-d*7)+1)/2
            k=0.05+0.3*ph*(0.4+0.8*e)
            pts=np.array([[x+r*0.95*math.cos(math.pi/6+j*math.pi/3),y+r*0.95*math.sin(math.pi/6+j*math.pi/3)] for j in range(6)],np.int32)
            cv2.polylines(cv,[pts],True,bgr(dimc(col,k)),2,cv2.LINE_AA)
def bg_codefall(cv,u,e,col=Y):
    toks=['---','name:','fn()','{ }','</>','$ _','md','#','=>','[ ]','//']
    for i in range(34):
        x=int(30+hsh(i,3)*1020); sp=0.18+hsh(i,5)*0.5
        for j in range(7):
            y=int(((u*sp*1.0+hsh(i,7)+j*0.07)%1.0)*2100-100)
            k=max(0.0,1-j/7)*(0.12+0.25*e)
            sp_=T(toks[(i*7+j)%len(toks)],FM,34,dimc(col,min(1,k*1.8)))
            place(cv,sp_,x,y,1,1,0,1)
def bg_wave(cv,u,e,col=Y):
    for j in range(9):
        pts=[]
        for x in range(0,1100,36):
            y=300+j*190+math.sin(x*0.006+u*(1.2+j*0.15)+j)*(40+90*e)
            pts.append((x,y))
        cv2.polylines(cv,[np.array(pts,np.int32)],False,bgr(dimc(col,0.10+0.06*(j%3))),3,cv2.LINE_AA)
def bg_orbit(cv,u,e,col=Y):
    for j in range(7):
        r=180+j*135; cv2.circle(cv,(540,880),r,bgr(dimc(col,0.08)),2,cv2.LINE_AA)
        a=u*(0.6+0.15*j)*(1 if j%2 else -1)+j
        cv2.circle(cv,(int(540+r*math.cos(a)),int(880+r*math.sin(a))),int(9+7*e),bgr(dimc(col,0.8)),-1,cv2.LINE_AA)
BGS=[bg_circuit,bg_hex,bg_codefall,bg_wave,bg_orbit]
def draw_bg(cv,ci,t,e):
    f=BGS[ci%len(BGS)]; f(cv,t*0.9,e)
# ---------------- utilitários ----------------
def fit(spr,maxw):
    h,w=spr.shape[:2]; return min(1.0,maxw/w)
def txt(cv,s,font,size,col,cx,cy,maxw=900,a=1.0,sx=1.0,stroke=0,sfill=BK):
    sp=T(s,font,size,col,stroke,sfill); k=fit(sp,maxw)*sx; place(cv,sp,cx,cy,k,k,0,a)
def rise(u,t0,d=.35): k=eob(ramp(u,t0,t0+d),1.6); return k
def reveal(n,i,u,span=0.8): return ramp(u,(i+0.2)/(n+0.4)*span,(i+0.2)/(n+0.4)*span+0.12)
ICON={'doc':lambda:ui.doc(420,520,'memoria.db',8),'ia':lambda:ui.ia_chip(420),'gear':lambda:ui.gear(420)}
# ---------------- visuais ----------------
def v_big(cv,B,u,d,t):
    v=B['v']; ic=ICON.get(v.get('ic','doc'),ICON['doc'])()
    k=rise(u,0,.4); y=lerp(440,540,eo3(ramp(u,0,.4)))
    card3d(cv,ic,540,y,0.95*k,6*math.sin(t*1.3),-10+12*math.sin(t*0.9),0,1.0)
    txt(cv,v['k'],FA,170,Y,540,930,960,a=eio(ramp(u,.08,.28)),sx=k,stroke=0)
    txt(cv,v['sub'],FIB,46,WH,540,1090,940,a=eio(ramp(u,.2,.45)))
def v_title(cv,B,u,d,t):
    v=B['v']; k=rise(u,0,.45)
    n=f"{v['n']:02d}"
    txt(cv,n,FA,420,dimc(Y,0.28),540,520,900,a=eio(ramp(u,0,.2)),sx=k)
    circ(cv,540,520,int(300*k+8*math.sin(t*3)),Y,5,0.55)
    txt(cv,"CAPÍTULO",FIB,52,Y,540,760,800,a=eio(ramp(u,.1,.3)))
    words=v['k'].split(); 
    L=[' '.join(words[:2]),' '.join(words[2:])] if len(words)>2 else [v['k']]
    for i,l in enumerate([x for x in L if x]):
        txt(cv,l,FA,150,WH,540,930+i*170,980,a=eio(ramp(u,.18+.1*i,.4+.1*i)),sx=eob(ramp(u,.15+.1*i,.45+.1*i),1.5))
    cv2.rectangle(cv,(300,1230),(int(300+480*eo3(ramp(u,.3,.7))),1244),bgr(Y),-1)
def window(cv,title,lines,u,hlset,mono=True,typed=True,w=1000,h=None,cy=720,fs=40,prefix_hl=None):
    n=len(lines); lh=int(fs*1.75)
    h=h or (110+n*lh+50)
    sp=ui.win(w,h,title)
    P=Panel(sp); o=ui.WO
    # linhas
    tot=sum(len(l) for l in lines)+1
    shown=int(tot*ramp(u,0.05,0.82)) if typed else tot
    acc=0
    for i,l in enumerate(lines):
        y=o+bar_h()+30+i*lh
        c=len(l)
        k=max(0,min(c,shown-acc)); acc+=c
        if i in hlset and k>0: P.rect(o+12,y-8,w-24,lh,(1,251,180,34) if False else (20,70,66),10)
        if k>0:
            col=Y if i in hlset else TX
            P.text(l[:k],o+34,y+fs*0.55,FM,fs,col,1)
    # cursor
    return P.im
def bar_h(): return 64
t_cur=[0.0]
def fitwin(cv,sp,cy,maxw=1000):
    k=fit(sp,maxw); place(cv,sp,540,cy,k,k)
def v_code(cv,B,u,d,t):
    v=B['v']; t_cur[0]=t
    fs=40; lines=v['lines']; mx=max(len(l) for l in lines)
    fs=int(min(50,900/(mx*0.62)))
    sp=window(cv,v['f'],lines,u,set(v.get('hl',[])),fs=fs)
    k=rise(u,0,.35); sc=fit(sp,1010)*k
    place(cv,sp,540,lerp(840,760,eo3(ramp(u,0,.3))),sc,sc,0,eio(ramp(u,0,.2)))
def v_term(cv,B,u,d,t):
    v=B['v']; t_cur[0]=t
    lines=v['lines']; mx=max(len(l) for l in lines); fs=int(min(50,900/(mx*0.62)))
    sp=window(cv,'terminal',lines,u,set(),fs=fs)
    k=rise(u,0,.35); sc=fit(sp,1010)*k
    place(cv,sp,540,760,sc,sc,0,eio(ramp(u,0,.2)))
def v_tree(cv,B,u,d,t):
    v=B['v']; lines=v['lines']; n=len(lines); fs=58; lh=100
    h=110+n*lh+50; sp=ui.win(1000,h,'explorer'); P=Panel(sp); o=ui.WO
    for i,(nm,ind) in enumerate(lines):
        a=reveal(n,i,u,0.7); y=o+64+30+i*lh
        if a<=0: continue
        isd=nm.endswith('/'); col=Y if i==v.get('hl',-1) else (WH if isd else TX)
        if i==v.get('hl',-1): P.rect(o+12,y-6,976,lh-6,(20,70,66),10)
        P.text(('▸ ' if isd else '▪ ')+nm,o+40+ind*58,y+42,FM,fs-4,col,min(1,a*1.4))
    sp=P.im
    k=rise(u,0,.35); sc=fit(sp,1010)*k
    place(cv,sp,540,760,sc,sc,0,eio(ramp(u,0,.2)))
def card(txt1,txt2,hot=False,w=900,h=230):
    im=rrect(w,h,34,(30,36,52,255),outline=(Y+(255,) if hot else (70,86,120,255)),ow=4 if hot else 3,shadow=18); P=Panel(im); o=18
    P.rect(o+24,o+34,10,h-68,Y,5)
    P.text(txt1,o+60,o+78,FA,70,Y if hot else WH,1)
    P.text(txt2,o+60,o+168,FIB,38,DIM,1)
    return P.im
@functools.lru_cache(None)
def cardc(a,b,hot=False): return card(a,b,hot)
def v_cards(cv,B,u,d,t):
    items=B['v']['items']; n=len(items); y0=780-(n-1)*135
    for i,(a,b) in enumerate(items):
        r=reveal(n,i,u,0.8); k=eob(r,1.7)
        if r<=0: continue
        sp=cardc(a,b,False); sc=fit(sp,1010)*k
        place(cv,sp,lerp(1300,540,eo3(r)),y0+i*270,sc,sc,0,min(1,r*3))
def v_cmp(cv,B,u,d,t):
    v=B['v']; 
    for i,(key,hot) in enumerate((('a',False),('b',True))):
        a,b=v[key]; r=ramp(u,0.06+0.28*i,0.26+0.28*i); 
        if r<=0: continue
        sp=cardc(a,b,hot); sc=fit(sp,1010)*eob(r,1.6)
        place(cv,sp,540,lerp(700,560+i*300,eo3(r)) if False else 600+i*330,sc,sc,0,min(1,r*3))
    vr=ramp(u,0.3,0.5)
    if vr>0: place(cv,ui.pill("VS",120,120,Y,BK,50,font=FI),540,765,eob(vr),eob(vr))
def v_steps(cv,B,u,d,t):
    v=B['v']; items=v['items']; n=len(items)
    txt(cv,v.get('sub','').upper(),FIB,40,Y,540,330,900,a=eio(ramp(u,0,.2)))
    y0=720-(n-1)*95
    for i,s in enumerate(items):
        r=reveal(n,i,u,0.8)
        if r<=0: continue
        k=eob(r,1.6); sp=ui.pill(s,900,150,(30,36,52),WH,44,edge=(1,251,180),font=FI); sc=fit(sp,1010)*k
        place(cv,sp,lerp(-300,540,eo3(r)),y0+i*190,sc,sc,0,min(1,r*3))
def v_cta1(cv,B,u,d,t):
    k=rise(u,0,.5); lg=ui.qv_logo(520); e=env(t)
    circ(cv,540,640,int((330+16*math.sin(t*4)+30*e)*k),Y,6,0.8)
    place(cv,lg,540,640,k,k)
    txt(cv,"100% FEITO COM IA",FA,110,Y,540,1090,980,a=eio(ramp(u,.3,.55)))
    txt(cv,"usando um arquivo de edição",FIB,44,WH,540,1190,900,a=eio(ramp(u,.5,.75)))
def v_cta2(cv,B,u,d,t):
    P=Panel(rrect(900,300,34,(30,36,52,255),outline=(70,86,120,255),ow=3,shadow=18)); o=18
    P.text("Adicione um comentário…",o+34,o+60,FIB,34,(110,110,120),1)
    n=int(7*ramp(u,.22,.5))
    if n>0:
        P.rect(o+24,o+100,640,84,(48,48,56),24); P.text("ARQUIVO"[:n],o+50,o+142,FI,48,Y,1)
    sendk=ramp(u,.55,.62)
    P.put(ui.pill("Publicar",200,84,Y if sendk>0.5 else (70,70,80),BK,34,font=FI),o+650,o+100)
    k=eob(ramp(u,0,.3)); card3d(cv,P.im,540,620,1.05*k,6,-8,0,1.0)
    if u>.62:
        r=ramp(u,.62,.8); place(cv,ui.pill("DM  » link do arquivo",620,100,Y,BK,42,font=FI),lerp(300,540,eio(r)),lerp(760,1100,eo3(r)),eob(r),eob(r),lerp(-10,0,r))
    if u>.8:
        r=ramp(u,.8,.95); place(cv,ui.pill("SEGUIR  ➜  SEGUINDO ✓",640,100,(48,48,56),WH,44,font=FI),540,1250,eob(r),eob(r))

def v_flow(cv,B,u,d,t):
    v=B['v']; nodes=v['nodes']; n=len(nodes); hot=v.get('hot',-1)
    txt(cv,v.get('sub','').upper(),FIB,46,Y,540,300,980,a=eio(ramp(u,0,.2)))
    bh=190; gap=bh+95; y0=860-(n-1)*gap/2
    for i in range(n-1):
        r=ramp(u,(i+.5)/(n+.5)*.7,(i+1)/(n+.5)*.7+.1)
        ya=y0+i*gap+bh/2; yb=y0+(i+1)*gap-bh/2
        if r>0:
            line(cv,(540,ya),(540,ya+(yb-ya)*r),(70,86,120),7)
            if r>=1: circ(cv,540,ya+(yb-ya)*((t*0.8+i*.3)%1.0),12,Y)
    for i,nm in enumerate(nodes):
        r=reveal(n,i,u,0.7)
        if r<=0: continue
        k=eob(r,1.6)
        im=rrect(860,bh,30,(30,36,52,255),outline=(Y+(255,) if i==hot else (70,86,120,255)),ow=5 if i==hot else 3,shadow=18)
        sp=T(nm,FA,78,Y if i==hot else WH); kk=min(1.0,780/sp.shape[1]); sp=cv2.resize(sp,None,fx=kk,fy=kk,interpolation=cv2.INTER_AREA) if kk<1 else sp
        Pp=Panel(im); Pp.put(sp,int((860-sp.shape[1])/2),int((bh-sp.shape[0])/2))
        pulse=1+0.04*math.sin(t*5) if i==hot else 1
        place(cv,Pp.im,540,y0+i*gap,k*pulse,k*pulse,0,min(1,r*3))

VIS={'flow':v_flow,'big':v_big,'title':v_title,'code':v_code,'term':v_term,'tree':v_tree,'cards':v_cards,'cmp':v_cmp,'steps':v_steps,'cta1':v_cta1,'cta2':v_cta2}
# ---------------- legenda ----------------
WORDS=[w for b in BLK for w in b['words']]
@functools.lru_cache(2048)
def capsp(word,hl):
    w=word.strip(); w=w.upper() if len(w)<40 else w
    if not hl: return T(w,FA,138,WH,11,BK,8)
    sp=T(w,FA,138,BK,0,BK,0); h,wd=sp.shape[:2]; bar=ui.rrect(wd+30,h-8,26,(1,251,180,255),shadow=6)
    Pn=Panel(bar); Pn.put(sp,15+6,(bar.shape[0]-h)//2); return Pn.im
_ws=[w['s'] for w in WORDS]
import bisect
def caption(cv,t):
    i=bisect.bisect_right(_ws,t)-1
    if i<0: return
    cur=WORDS[i]
    if t>cur['e']+0.3: return
    u=t-cur['s']; s=capsp(cur['w'],cur['hl']); sc=lerp(0.72,1.0,eob(ramp(u,0,.14),2.0))
    if cur['hl'] and u<.2: sc*=1+0.08*math.sin(u/.2*math.pi)
    k=fit(s,1000)
    place(cv,s,540,1430,sc*k,sc*k,-2.0 if cur['hl'] else 0,clamp(u/.04)*(1-ramp(t-cur['e'],0.2,0.3)))
TINT=np.array([55,22,0],np.float32)
_bs=[b['s'] for b in BLK]
# eventos de som
for i,b in enumerate(BLK):
    new_chap=(i==0) or BLK[i-1]['c']!=b['c']
    t0=b['s']
    if b['v']['t']=='title': hit(t0,'impact',0.9); SHAKES.append((t0,18,0.4))
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
    ci=k
    if not (B['v']['t'].startswith('sc_') or B['v']['t'] in('hero','geo')): draw_bg(cv,ci,t,e)
    # progresso de capítulo no topo
    prog=(ci+u*0+0.0)/max(1,len(CHAPS)-1)
    if t<0.004 or True:
        pass
    ff=VIS[B['v']['t']]
    uu=u if t>=0.01 else 1.0
    if i==0: uu=0.9
    ff(cv,B,uu,d,t)
    tb=t-B['s']
    if 0<=tb<0.26 and k>0 and B['v']['t']!='geo':
        z=1+0.07*(1-tb/0.26)**2; M=np.float32([[z,0,540*(1-z)],[0,z,960*(1-z)]]); cv=cv2.warpAffine(cv,M,(W,H),borderMode=cv2.BORDER_REFLECT)
        x=int((tb/0.26)*(W+500))-250; ov=cv.copy(); cv2.rectangle(ov,(x-170,0),(x+30,H),bgr(Y),-1); cv=cv2.addWeighted(ov,0.55,cv,0.45,0)
    if B['v']['t'] not in('hero','geo'):
        vignette(cv)
        lum=cv.max(2,keepdims=True).astype(np.float32)/255.0
        cv[:]=np.clip(cv+TINT*(1-lum)**3,0,255).astype(np.uint8)
    caption(cv,t)
    dx,dy=shake_off(t)
    if abs(dx)+abs(dy)>0.3:
        M=np.float32([[1,0,dx],[0,1,dy]]); cv=cv2.warpAffine(cv,M,(W,H),borderMode=cv2.BORDER_REFLECT)
    return cv

import hero
import geo
