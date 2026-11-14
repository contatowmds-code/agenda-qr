import math, numpy as np, cv2
from gfx import *
from bgs import dimc, hsh
import ui
import eng as E
BL=(80,160,255); AM=(255,190,60); PK=(255,110,120)
PAL=[Y,BL,AM,PK]
def R(cv,x0,y0,x1,y1,col,a=1.0,th=-1):
    x0,y0,x1,y1=int(x0),int(y0),int(x1),int(y1)
    if x1<=x0 or y1<=y0: return
    if a>=0.999: cv2.rectangle(cv,(x0,y0),(x1,y1),bgr(col),th,cv2.LINE_AA); return
    X0,Y0,X1,Y1=max(x0,0),max(y0,0),min(x1,W),min(y1,H)
    if X1<=X0 or Y1<=Y0: return
    roi=cv[Y0:Y1,X0:X1].copy(); cv2.rectangle(cv,(x0,y0),(x1,y1),bgr(col),th,cv2.LINE_AA)
    cv[Y0:Y1,X0:X1]=cv2.addWeighted(cv[Y0:Y1,X0:X1],a,roi,1-a,0)
def lab(cv,s,y,u,a0=.1,size=120,col=Y):
    E.txt(cv,s,FA,size,col,540,y,960,a=eio(ramp(u,a0,a0+.15)),sx=eob(ramp(u,a0,a0+.2),1.6))
def pill(cv,s,cx,cy,u,a0=.1):
    sp=ui.pill(s,w=520,h=84,fill=(8,40,70),fg=Y,size=44,edge=Y,font=FM); k=eob(ramp(u,a0,a0+.2),1.6); place(cv,sp,cx,cy,k,k,0,eio(ramp(u,a0,a0+.1)))
def robot(cv,cx,cy,sz,sc=1.0,rz=0.0,a=1.0): place(cv,ui.ia_chip(sz),cx,cy,sc,sc,rz,a)
# ---------- 1 vidro enchendo ----------
def sc_glass(cv,B,u,d,t):
    for i in range(16):  # fundo: balões de conversa caindo
        x=int(hsh(i,1)*980+50); y=int(((t*0.18*(0.6+hsh(i,2))+hsh(i,3))%1.0)*2100-120)
        R(cv,x-70,y-30,x+70,y+30,dimc(PAL[i%4],0.22)); R(cv,x-70,y-30,x+70,y+30,dimc(PAL[i%4],0.5),th=2)
    x0,x1,y0,y1=290,790,360,1220
    f=ramp(u,.08,.9); hh=int((y1-y0-20)*f)
    n=max(1,int(f*14))
    for j in range(n):
        top=y1-10-int((j+1)*(y1-y0-20)/14); bot=y1-10-int(j*(y1-y0-20)/14)
        R(cv,x0+8,top+2,x1-8,bot-2,dimc(PAL[j%4],0.9))
    for k in range(3):  # blocos caindo
        ph=(u*5+k/3)%1.0
        if f<0.95: R(cv,540-70+(k-1)*120,300+ph*(y1-y0-hh-100)-40,540+70+(k-1)*120,300+ph*(y1-y0-hh-100)+40,PAL[k%4],0.95)
    col=RD if f>0.85 else WH
    cv2.rectangle(cv,(x0,y0),(x1,y1),bgr(col),10,cv2.LINE_AA)
    if f>0.85:
        circ(cv,540,y0,int(60+20*math.sin(t*14)),RD,-1,0.85); E.txt(cv,"!",FA,90,WH,540,y0,200)
    lab(cv,"CONTEXTO",160,u)
# ---------- 2 robô com peso ----------
def sc_robot(cv,B,u,d,t):
    for i in range(7):  # névoa que engrossa
        r=int(160+hsh(i,4)*200+u*160); x=int(hsh(i,5)*1080); y=int(300+hsh(i,6)*1100+math.sin(t*0.7+i)*40)
        circ(cv,x,y,r,(70,80,100),-1,0.07+0.12*u)
    n=int(2+u*7); sag=int(20*u*math.sin(t*3)); base_y=760
    robot(cv,540,base_y+int(40*u),380,1.0-0.12*u,math.sin(t*2)*(3+4*u))
    for j in range(n):
        ph=ramp(u,j/9.0,j/9.0+.12); yy=base_y-250-j*84+int((1-eo3(ph))*-500)
        wcol=PAL[j%4]; R(cv,540-190+ (j%2)*20,yy-36,540+190+(j%2)*20,yy+36,wcol,min(1,ph*3))
    for k in range(4):  # gotas de suor
        ph=(t*0.9+k*0.25)%1.0; circ(cv,540+(k-1.5)*110,base_y-150+ph*260,12,(120,200,255),-1,0.8*u*(1-ph))
    a=t*5; cv2.ellipse(cv,(540,base_y+30),(300,300),0,a*57,a*57+90,bgr(RD),10,cv2.LINE_AA)
    lab(cv,"PESADO",1280,u,.3,110,RD)
# ---------- 3 janela de contexto ----------
def sc_window(cv,B,u,d,t):
    cols,rows=12,22; cw,ch=58,36; gx=540-cols*cw//2; gy=330
    tot=cols*rows; lit=int(tot*ramp(u,.12,.88))
    for r in range(rows):
        for c in range(cols):
            i=r*cols+c; x=gx+c*cw; y=gy+r*(ch+2)
            if i<lit:
                col=Y if i<tot*0.7 else (AM if i<tot*0.88 else RD)
                flash=1.0 if i>lit-6 else 0.78; R(cv,x+3,y+2,x+cw-3,y+ch-2,dimc(col,flash))
            else: R(cv,x+3,y+2,x+cw-3,y+ch-2,(30,48,84),th=2)
    cv2.rectangle(cv,(gx-14,gy-14),(gx+cols*cw+14,gy+rows*(ch+2)+14),bgr(WH),8,cv2.LINE_AA)
    v=int(200000*ramp(u,.12,.88)); E.txt(cv,f"{v:,}".replace(',','.'),FA,150,Y,540,220,900)
    lab(cv,"TOKENS",1310,u,.15,90,WH)
# ---------- 4 já nasce ocupada ----------
def sc_overhead(cv,B,u,d,t):
    for k in range(6):  # ondas saindo da barra
        ph=(t*0.4+k/6)%1.0; r=int(80+ph*900); cv2.ellipse(cv,(540,900),(r,int(r*0.6)),0,0,360,bgr(dimc(Y,(1-ph)*0.35)),3,cv2.LINE_AA)
    x0,x1,y,h=120,960,880,170
    R(cv,x0,y,x1,y+h,(30,48,84)); 
    a1=eo3(ramp(u,.15,.4)); a2=eo3(ramp(u,.45,.75))
    R(cv,x0,y,x0+(x1-x0)*0.07*a1,y+h,(150,160,175))
    R(cv,x0+(x1-x0)*0.07,y,x0+(x1-x0)*(0.07+0.18*a2),y+h,BL)
    cv2.rectangle(cv,(x0,y),(x1,y+h),bgr(WH),8,cv2.LINE_AA)
    k=eob(ramp(u,.2,.45),1.6); place(cv,ui.gear(150),x0+60,y-130,k,k,t*40,eio(ramp(u,.2,.35)))
    k=eob(ramp(u,.5,.8),1.6)
    for j in range(3): place(cv,ui.gear(90),x0+(x1-x0)*0.2+j*70,y+h+90,k,k,-t*60*(1+j*.2),eio(ramp(u,.5,.7)))
    lab(cv,"JÁ COMEÇA CHEIA",1310,u,.6,90,AM)
# ---------- 5 arquivos enchendo ----------
def sc_files(cv,B,u,d,t):
    for i in range(10):
        y=140+i*170; R(cv,0,y,1080,y+4,dimc(Y,0.08))
        for k in range(3):
            x=int(((t*(0.2+0.04*(i%4))+hsh(i,k))%1.0)*1300-120); R(cv,x,y-6,x+70,y+10,dimc(Y,0.3))
    x0,x1,y,h=120,960,1050,150
    fill=0.0; docs=[]
    for j in range(3):
        a=ramp(u,.08+j*.27,.3+j*.27); fill+=0.28*eo3(a)
        side=-1 if j%2==0 else 1; px=lerp(540+side*600,540,eo3(a)); py=lerp(300,y-60,eo3(a)) if a<1 else y-60
        if 0<a<1: place(cv,ui.doc(260,330,'.ts',5),px,py,1-0.5*a,1-0.5*a,side*18*(1-a),1.0)
    col=Y if fill<0.55 else (AM if fill<0.8 else RD)
    R(cv,x0,y,x1,y+h,(30,48,84)); R(cv,x0,y,x0+(x1-x0)*min(1,fill+0.06),y+h,col)
    cv2.rectangle(cv,(x0,y),(x1,y+h),bgr(WH),8,cv2.LINE_AA)
    place(cv,ui.doc(300,380,'app.ts',7),540,520,1.0+0.04*math.sin(t*3),1.0+0.04*math.sin(t*3),0,1-ramp(u,.7,.9)*0.0)
    lab(cv,"ARQUIVOS",1300,u,.1,110,WH)
# ---------- 6 esquece o começo ----------
def sc_rot(cv,B,u,d,t):
    for i in range(22):  # fundo: páginas virando poeira subindo
        x=int(hsh(i,8)*1080); y=int(1700-((t*0.1*(0.5+hsh(i,9))+hsh(i,10))%1.0)*1700)
        R(cv,x-14,y-18,x+14,y+18,dimc(WH,0.12+0.15*u),th=2)
    robot(cv,540,360,250,1.0,math.sin(t*3)*4)
    for j in range(3): E.txt(cv,"?",FA,110+j*20,AM,380+j*160+int(30*math.sin(t*4+j)),230+j*30*(-1)**j,200,a=eio(ramp(u,.2+j*.1,.4+j*.1)))
    for j in range(9):
        y=600+j*70; fade=ramp(u,j*0.09,j*0.09+.2); xo=-fade*500*(1 if j%2 else -1)
        col=PAL[j%4]; R(cv,150+xo,y,930+xo,y+52,dimc(col,0.85*(1-fade)+0.08),(1-fade*0.95))
    lab(cv,"ESQUECE",1290,u,.3,110,RD)
# ---------- 7 /context: rosca ----------
def sc_meter(cv,B,u,d,t):
    for k in range(5):
        ph=(t*0.3+k/5)%1.0; cv2.circle(cv,(540,760),int(300+ph*700),bgr(dimc(Y,(1-ph)*0.2)),3,cv2.LINE_AA)
    segs=[(.06,(150,160,175)),(.18,BL),(.40,AM),(.20,PK),(.16,(40,60,100))]
    a0=-90.0; prog=eo3(ramp(u,.1,.8))*360
    for fr,col in segs:
        a1=a0+fr*360; hi=min(a1,-90+prog)
        if hi>a0: cv2.ellipse(cv,(540,760),(300,300),0,a0,hi,bgr(col),90,cv2.LINE_AA)
        a0=a1
    cv2.circle(cv,(540,760),256,bgr(WH),3,cv2.LINE_AA); cv2.circle(cv,(540,760),344,bgr(WH),3,cv2.LINE_AA)
    pill(cv,"/context",540,1230,u,.2)
# ---------- 8 /compact: prensa ----------
def sc_press(cv,B,u,d,t):
    for i in range(9):  # fundo: pistões
        x=60+i*120; ph=(math.sin(t*2+i)+1)/2; R(cv,x,0,x+36,200+ph*120,dimc(WH,0.15)); R(cv,x-12,200+ph*120,x+48,230+ph*120,dimc(WH,0.25))
    p=eio(ramp(u,.25,.7)); n=9
    plate=300+p*470
    for j in range(n):
        hh=lerp(86,13,p); y=1160-(j+1)*hh
        R(cv,240,y+2,840,y+hh-2,PAL[j%4])
    top=1160-n*lerp(86,13,p)
    R(cv,200,plate-60,880,plate,(200,205,215)); R(cv,520,0,560,plate-60,(150,155,165))
    R(cv,200,1160,880,1190,(120,125,135))
    if u>0.75:
        k=eob(ramp(u,.75,.9),1.8); circ(cv,540,1000,int(150*k),Y,6,0.9*k); place(cv,ui.okbadge(130),540,1000-150,k,k)
    pill(cv,"/compact",540,1300,u,.1)
# ---------- 9 /clear: apagador ----------
def sc_clear(cv,B,u,d,t):
    for i in range(30):  # poeira
        ph=(t*0.2+hsh(i,2))%1.0; circ(cv,int(hsh(i,3)*1080),int(1500-ph*1300),int(4+hsh(i,4)*6),WH,-1,0.15*(1-ph))
    bx0,by0,bx1,by1=120,300,960,1000
    R(cv,bx0,by0,bx1,by1,(10,70,60)); cv2.rectangle(cv,(bx0,by0),(bx1,by1),bgr((190,150,100)),16,cv2.LINE_AA)
    rows=5; band=(by1-by0-60)//rows; er=ramp(u,.2,.85)*rows
    img=np.zeros_like(cv)
    for r in range(rows):
        y=by0+40+r*band+band//2; pts=[(bx0+50+i*40,y+int(math.sin(i*1.3+r*2)*18)) for i in range(int((bx1-bx0-100)/40))]
        cv2.polylines(img,[np.array(pts,np.int32)],False,bgr(WH),6,cv2.LINE_AA)
        prog=clamp(er-r); cut=int(bx0+50+(bx1-bx0-100)*prog) if r%2==0 else int(bx1-50-(bx1-bx0-100)*prog)
        if r%2==0: img[:,:cut]=0
        else: img[:,cut:]=0
        if 0<prog<1: R(cv,cut-60,y-band//2,cut+60,y+band//2,AM)
    m=img.sum(2)>0; cv[m]=img[m]
    pill(cv,"/clear",540,1180,u,.1)
# ---------- 10 escolha ----------
def sc_choose(cv,B,u,d,t):
    for i in range(14):
        x=int(((t*0.15+i/14)%1.0)*1500-300); cv2.line(cv,(x,0),(x-500,H),bgr(dimc(Y if i%2 else WH,0.07)),40)
    hot=0 if u<.5 else 1
    for s,(cx,ttl,cmd,col) in enumerate([(300,"MESMA TAREFA","/compact",Y),(780,"TAREFA NOVA","/clear",AM)]):
        k=eob(ramp(u,.05+s*.15,.3+s*.15),1.6)*(1.05 if hot==s else 0.95)
        R(cv,cx-215*k,360,cx+215*k,1150,(14,40,80),0.95); R(cv,cx-215*k,360,cx+215*k,1150,col,th=7 if hot==s else 3)
        if s==0:
            cv2.ellipse(cv,(cx,640),(100,100),0,t*120,t*120+270,bgr(Y),16,cv2.LINE_AA)
        else:
            place(cv,ui.doc(180,230,'novo',3),cx,640,k,k,0); E.txt(cv,"+",FA,150,AM,cx+90,720,200,a=k)
        E.txt(cv,ttl,FA,64,WH,cx,900,400,a=eio(ramp(u,.2,.4))); E.txt(cv,cmd,FM,46,col,cx,1020,400,a=eio(ramp(u,.25,.45)))
# ---------- 11 anotação fixa ----------
def sc_notes(cv,B,u,d,t):
    for i in range(12):
        x=int(hsh(i,2)*1000+40); y=int(((t*0.07+hsh(i,3))%1.0)*1900); circ(cv,x,y,10,AM,-1,0.18); line(cv,(x,y),(x,y+60),dimc(AM,0.3),3)
    wipe=ramp(u,.35,.65)
    R(cv,90,420,720,1180,(14,40,80),0.95); cv2.rectangle(cv,(90,420),(720,1180),bgr(WH),8,cv2.LINE_AA)
    for j in range(7):
        a=1-clamp((wipe*7-j+0.0)); xo=int((1-a)*-700)
        if a>0.02: R(cv,130+xo,470+j*95,680+xo,540+j*95,PAL[j%4],0.9*a)
    if wipe>0.7:
        for j in range(3): R(cv,130,470+j*95,130+int(550*ramp(u,.7,.95)*(1-j*0.2)),540+j*95,PAL[j%4],0.5)
    nx=lerp(900,380,0) ; px=830; py=520+int(math.sin(t*2)*12)
    place(cv,ui.doc(220,260,'CLAUDE.md',4,fill=(255,236,150)),px,py,eob(ramp(u,.1,.3),1.6),eob(ramp(u,.1,.3),1.6),-6)
    if wipe>0.7:
        k=ramp(u,.7,.95); place(cv,ui.doc(220,260,'CLAUDE.md',4,fill=(255,236,150)),lerp(830,420,eo3(k)),lerp(520,720,eo3(k)),1,1,-6*(1-k),k)
    lab(cv,"NÃO SE PERDE",1290,u,.55,100,AM)
# ---------- 12 subagentes ----------
def sc_sub(cv,B,u,d,t):
    nodes=[(200,880),(540,980),(880,880)]
    for (x,y) in nodes:
        line(cv,(540,500),(x,y),dimc(Y,0.25),4)
        p=(t*0.7)%1.0; circ(cv,540+(x-540)*p,500+(y-500)*p,10,Y,-1,0.9)
    robot(cv,540,420,260,1.0,math.sin(t*2)*3)
    R(cv,340,640,740,690,(30,48,84)); R(cv,340,640,340+int(400*(0.12+0.1*ramp(u,.7,.95))),690,Y); cv2.rectangle(cv,(340,640),(740,690),bgr(WH),4,cv2.LINE_AA)
    for j,(x,y) in enumerate(nodes):
        go=ramp(u,.12+j*.08,.45+j*.08); back=ramp(u,.55+j*.08,.85+j*.08)
        place(cv,ui.doc(200,250,'src',5),x,y+110,1,1,0,1)
        p=eo3(go)*(1-eo3(back)); sx_=lerp(540,x,0.9*p); sy_=lerp(560,y-10,p)
        robot(cv,sx_,sy_,110,1.0)
        if back>0.1 and back<1: R(cv,sx_+40,sy_+20,sx_+110,sy_+50,AM)
    lab(cv,"SÓ O RESUMO",1300,u,.6,100,Y)
# ---------- 13 regra dos 70% ----------
def sc_rule(cv,B,u,d,t):
    for k in range(4):
        ph=(t*0.5+k/4)%1.0; cv2.circle(cv,(540,980),int(200+ph*800),bgr(dimc(Y,(1-ph)*0.18)),4,cv2.LINE_AA)
    c=(540,980); Rr=330
    for a0,a1,col in [(180,180+126,Y),(180+126,180+162,AM),(180+162,360,RD)]:
        cv2.ellipse(cv,c,(Rr,Rr),0,a0,a1,bgr(col),70,cv2.LINE_AA)
    val=eio(ramp(u,.15,.6))*0.7+0.02*math.sin(t*5)*ramp(u,.6,1)
    ang=math.radians(180+180*val); tip=(c[0]+math.cos(ang)*(Rr-30),c[1]+math.sin(ang)*(Rr-30))
    line(cv,c,tip,WH,14); circ(cv,c[0],c[1],34,WH)
    E.txt(cv,"70%",FA,260,Y,540,420,700,a=eio(ramp(u,.5,.7)),sx=eob(ramp(u,.5,.75),1.8))
SC={'sc_glass':sc_glass,'sc_robot':sc_robot,'sc_window':sc_window,'sc_overhead':sc_overhead,'sc_files':sc_files,'sc_rot':sc_rot,'sc_meter':sc_meter,'sc_press':sc_press,'sc_clear':sc_clear,'sc_choose':sc_choose,'sc_notes':sc_notes,'sc_sub':sc_sub,'sc_rule':sc_rule}
E.VIS.update(SC)
