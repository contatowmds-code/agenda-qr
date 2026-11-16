from gx import *
MINT=(1,251,180); NAVY=(1,24,57)
def S(cv,top,bot): cv[:]=grad(top,bot)
# 1 capa: nave sendo agarrada
def cover(cv,t,u,P):
    S(cv,(8,10,40),(255,120,40)); stars(cv,t,1,100)
    for i in range(16):   # raios
        a=i/16*math.pi*2+t*0.2; cv2.line(cv,(540,880),(int(540+math.cos(a)*1600),int(880+math.sin(a)*1600)),bgr((255,170,70)),3,AA)
    glow(cv,540,900,700,(255,160,60),0.8)
    tower(cv,250,200,1900,1,ay=1000); tower(cv,830,200,1900,1,ay=1000)
    ship(cv,540,960-20*math.sin(t*3),620,0,0.0,t)
    particles(cv,t,40,540,1000,(255,200,80),120,500,1,0.9,5,-math.pi/2,2.6)
# 2 voo 15: contador rolando
def numfly(cv,t,u,P):
    S(cv,(5,20,50),(30,70,140)); streak_lines(cv,t,30,(120,200,255),1400,2,True,0.35,420)
    n=int(1+14*eo(u*1.6))
    for k,(dy,a) in enumerate(((-260,.25),(0,1),(260,.25))):
        v=n+(k-1)*-1
        ov=cv.copy(); text(ov,str(max(v,0)),540,900+dy,520 if k==1 else 300,(255,255,255)); cv[:]=cv2.addWeighted(ov,a,cv,1-a,0)
    ship(cv,540,1560,300,0,0.0,t)
    ring(cv,540,900,420+80*math.sin(t*4),MINT,5,0.7)
# 3 sexta 13 / Texas
TEX=[(-80,-120),(40,-120),(40,-40),(110,20),(130,100),(60,170),(10,190),(-30,120),(-90,70),(-130,0),(-60,-30)]
def texas(cv,t,u,P):
    S(cv,(255,170,80),(120,40,90))
    glow(cv,540,520,650,(255,230,150),0.9)
    cv2.circle(cv,(540,520),170,bgr((255,235,170)),-1,AA)
    rect(cv,0,1250,W,H,(30,18,50))
    poly(cv,TEX,(15,10,30),540,1000,0,3.3)
    poly(cv,TEX,MINT,540,1000,0,3.3,fill=False,th=5)
    k=eo(u*2); r=int(60+20*math.sin(t*6))
    glow(cv,640,1120,160,(255,60,60),0.9)
    cv2.circle(cv,(640,1120),int(26*k),bgr((255,70,70)),-1,AA); ring(cv,640,1120,r*1.6,(255,255,255),3,0.6)
    # folha de calendário
    rect(cv,150,200,430,480,(250,250,252)); rect(cv,150,200,430,285,(230,50,60))
    text(cv,"13",290,400,170,(30,30,40)); text(cv,"NOV",290,243,66,(255,255,255))
# 4 decolagem por baixo
def liftoff(cv,t,u,P):
    S(cv,(255,150,60),(30,25,60))
    rect(cv,0,1500,W,H,(25,25,35))
    for i in range(14):
        x=-700+i*200; cv2.line(cv,(540,1500),(x+600,H),bgr((60,60,80)),3,AA)
    glow(cv,540,1560,700*(0.7+0.3*math.sin(t*30)),(255,170,60),0.9)
    y=1300-eo(u)*1000
    for i in range(12):
        sx=(hsh(i,4)-.5)*900*u*1.2+540
        cv2.circle(cv,(int(sx),int(1560+hsh(i,2)*90)),int(110+hsh(i,3)*140),bgr((200,190,190)),-1,AA)
    cv[:]=cv2.GaussianBlur(cv,(0,0),9)
    booster(cv,540,y,700,0,1.2,t);
    ship(cv,540,y-512,600,0,0,t)
    rect(cv,0,0,W,0,(0,0,0))
# 5 subida: altitude
def ascent(cv,t,u,P):
    k=ease(u); top=(5,5,25); bot=(int(100*(1-k)+10),int(170*(1-k)+10),int(255*(1-k)+60))
    S(cv,top,bot if k<0.99 else (10,10,60)); stars(cv,t,3,int(40+140*k),0)
    off=(t*900)%160
    for i in range(14):
        y=int(i*160+off-80); cv2.line(cv,(60,y),(130,y),bgr((220,240,255)),3,AA); cv2.line(cv,(950,y),(1020,y),bgr((220,240,255)),3,AA)
    text(cv,f"{int(8+110*k**1.5)} KM",900,300,90,MINT,'rm')
    s=P.get('stack',1)
    booster(cv,540,1050,520,0.05*math.sin(t*3),1.0,t); ship(cv,540,560,440,0.05*math.sin(t*3),0,t)
    particles(cv,t,60,540,1380,(255,200,100),90,900,5,0.7,6,math.pi/2,0.7)
# 6 separação lateral com faíscas
def separate(cv,t,u,P):
    S(cv,(0,0,15),(10,20,70)); stars(cv,t,5,180,0)
    for i in range(9):
        cv2.circle(cv,(540,880),int((u*900+i*130)%1100),bgr((30,60,150)),2,AA)
    d=eo(u)*420;
    ship(cv,540,880-d,520,0,0.5,t)
    booster(cv,540+30*u,1040+d*0.9,500,math.pi*0.0+u*1.3,0.0,t)
    glow(cv,540,960,260*(1-u)+30,(255,255,255),1.0*(1-u))
    particles(cv,t,40,540,960,(255,230,150),60,700,6,0.8,5,0,6.2)
# 7 vista de cima: torre e braços (planta)
def topdown(cv,t,u,P):
    S(cv,(15,50,40),(10,25,30))
    for i in range(0,H,90): cv2.line(cv,(0,i),(W,i),bgr((25,70,60)),1)
    for i in range(0,W,90): cv2.line(cv,(i,0),(i,H),bgr((25,70,60)),1)
    cv2.circle(cv,(540,1000),330,bgr((40,60,60)),-1,AA); cv2.circle(cv,(540,1000),330,bgr(MINT),4,AA)
    a=0.5*ease(1-u*0.4)
    rect(cv,490,500,590,1500,(110,120,140));
    for sgn in (-1,1):
        poly(cv,[(0,-35),(260,-120*sgn*a-35),(260,-120*sgn*a+35),(0,35)],(235,120,50),540+sgn*0,700,0,1.0) if False else None
        cv2.line(cv,(540,760),(int(540+sgn*190),int(560-sgn*0)),bgr((235,120,50)),34,AA)
    # alvo do foguete descendo
    r=420*(1-u)+60; ring(cv,540,1000,r,(255,255,255),5,0.9)
    cv2.line(cv,(540-60,1000),(540+60,1000),bgr((255,60,60)),4,AA); cv2.line(cv,(540,940),(540,1060),bgr((255,60,60)),4,AA)
    booster(cv,540,1000,160+300*(1-u),0,0,t)
# 8 captura cancelada: X e mar
def aborted(cv,t,u,P):
    S(cv,(20,15,30),(120,20,40));
    waves(cv,1350,t,(40,90,160),18,6,1.6)
    x=540+eo(u)*260; y=900+eo(u)*350
    booster(cv,x,y,380,0.6+u*0.8,0.0,t)
    tower(cv,160,300,1450,0.0,ay=700,col=(100,100,120))
    k=eo(u*2.5)
    cv2.line(cv,(int(540-210*k),int(500-210*k)),(int(540+210*k),int(500+210*k)),bgr((255,60,70)),44,AA)
    cv2.line(cv,(int(540+210*k),int(500-210*k)),(int(540-210*k),int(500+210*k)),bgr((255,60,70)),44,AA)
    glow(cv,540,500,380,(255,40,60),0.5*k)
    for i in range(10): ring(cv,x,1400,40+((t*200+i*70)%400),(255,255,255),3,0.4) if u>0.6 else None
# 9 nave em órbita sobre a Terra
def orbit_ship(cv,t,u,P):
    S(cv,(0,0,8),(5,10,40)); stars(cv,t,9,200,6)
    earth(cv,540,2250,1500,t*0.01)
    ship(cv,540+(u-.5)*260,820,420,1.2+0.15*math.sin(t),0,t)
    glow(cv,540,1100,700,(120,190,255),0.12)
# 10 satélites Starlink se espalhando
def starlink(cv,t,u,P):
    S(cv,(5,5,20),(30,10,70)); stars(cv,t,2,160,3)
    earth(cv,540,1900,900,0.2+t*0.01)
    pts=[]
    for i in range(18):
        a=-math.pi/2+(i/17-.5)*2.2; d=eo(u*1.2)*(250+hsh(i,2)*700)
        px=540+math.cos(a)*d; py=1000+math.sin(a)*d*0.9+d*0.6
        pts.append((px,py)); sat(cv,px,py,0.5+0.3*hsh(i,5),a*0.3,t+i)
    for i in range(len(pts)-1):
        if u>0.55 and i%2==0: cv2.line(cv,(int(pts[i][0]),int(pts[i][1])),(int(pts[i+1][0]),int(pts[i+1][1])),bgr(MINT),2,AA)
    ship(cv,540,880,200,0.0,0,t)
# 11 relógio 24h + órbita vista de cima
def clock_orbit(cv,t,u,P):
    S(cv,(10,5,40),(0,40,70))
    cv2.circle(cv,(540,960),430,bgr((20,30,70)),-1,AA)
    earth(cv,540,960,260,t*0.04)
    for k in range(3): cv2.ellipse(cv,(540,960),(440+k*45,300+k*38),-25+k*10,0,360,bgr((60,100,200)),2,AA)
    for k in range(24):
        a=k/24*2*math.pi-math.pi/2; r0=520 if k%6==0 else 540
        cv2.line(cv,(int(540+math.cos(a)*r0),int(960+math.sin(a)*r0)),(int(540+math.cos(a)*570),int(960+math.sin(a)*570)),bgr((220,230,255)),4 if k%6==0 else 2,AA)
    ang=u*2*math.pi*0.94-math.pi/2
    cv2.line(cv,(540,960),(int(540+math.cos(ang)*500),int(960+math.sin(ang)*500)),bgr(MINT),10,AA)
    cv2.circle(cv,(540,960),20,bgr(MINT),-1,AA)
    ship(cv,int(540+math.cos(ang*2.4)*440),int(960+math.sin(ang*2.4)*300),110,ang*2.4+1.57,0,t)
    text(cv,"22 H",540,1290,170,(255,255,255))
# 12 reentrada
def reentry(cv,t,u,P):
    S(cv,(40,0,30),(255,100,20))
    streak_lines(cv,t,60,(255,200,100),2600,7,True,0.6,500)
    glow(cv,540,1000,900,(255,90,30),0.8+0.2*math.sin(t*25))
    ship(cv,540,740,420,0,0,t,heat=1.0,flaps=0.6)
    for i in range(28):
        px=540+(hsh(i,1)-.5)*500; py=900+((t*1.8+hsh(i,2))%1)*700
        cv2.circle(cv,(int(px),int(py)),int(6+hsh(i,4)*10),bgr((255,220,120)),-1,AA)
    glow(cv,540,960,420,(255,240,200),0.6)
# 13 torre pega a nave (lateral)
def catch(cv,t,u,P):
    S(cv,(40,60,120),(250,170,110)); clouds(cv,t,300,(255,235,225),6,3,30,0.5)
    rect(cv,0,1700,W,H,(40,40,50)); waves(cv,1760,t,(40,80,130),8,3,1.2)
    k=ease(u)
    tower(cv,540-0,200,1700,k,ay=1000)
    sy=300+eo(u)*680
    ship(cv,540,sy-0,440,0,0.5*(1-u)+0.05,t,heat=0.2)
    glow(cv,540,sy+120,200,(255,160,60),0.4)
# 14 close do abraço (sparks + shockwave)
def clasp(cv,t,u,P):
    S(cv,(20,20,40),(200,90,40))
    tower(cv,540,-200,1900,1.0,ay=1100,col=(150,155,175))
    ship(cv,540,980,900,0,0,t,heat=0.3)
    ring(cv,540,1100,((t%0.8)*1500),(255,255,255),6,max(0,1-(t%0.8)/0.8))
    particles(cv,t,70,540,1100,(255,220,120),200,650,8,0.8,6,-math.pi/2,6.28)
# 15 linha do tempo
def timeline(cv,t,u,P):
    S(cv,(10,40,60),(0,15,30))
    for i in range(0,W,70): cv2.line(cv,(i,0),(i,H),bgr((15,60,80)),1)
    x0,x1=130,950; y=960
    cv2.line(cv,(x0,y),(x1,y),bgr((80,120,150)),8,AA); xe=int(x0+(x1-x0)*eo(u*1.3)); cv2.line(cv,(x0,y),(xe,y),bgr(MINT),14,AA)
    for k,(lab,xx) in enumerate((("SAI",x0),("ÓRBITA",540),("PEGA",x1))):
        cv2.circle(cv,(xx,y),30,bgr(MINT if xx<=xe else (80,120,150)),-1,AA)
        text(cv,lab,xx,y+90,56,(255,255,255))
    ship(cv,xe,y-130,170,1.57,0,t)
    text(cv,f"{int(22.5*eo(u*1.3)*10)/10:.1f} H",540,500,200,(255,255,255))
# 16 primeira vez: estrela explodindo
def first(cv,t,u,P):
    S(cv,(50,10,90),(255,130,60))
    for i in range(24):
        a=i/24*2*math.pi+t*0.4; cv2.line(cv,(540,900),(int(540+math.cos(a)*1500),int(900+math.sin(a)*1500)),bgr((255,200,80)),6 if i%2 else 2,AA)
    glow(cv,540,900,640,(255,230,120),0.9)
    r=int(250*eo(u*3));
    poly(cv,[(0,-1),(0.29,-0.4),(0.95,-0.31),(0.47,0.15),(0.59,0.81),(0,0.5),(-0.59,0.81),(-0.47,0.15),(-0.95,-0.31),(-0.29,-0.4)],(255,230,70),540,900,t*0.6,max(r,1)*1.1)
    text(cv,"1ª",540,910,260,(60,20,0)) if r>200 else None
    particles(cv,t,90,540,900,(255,240,160),0,900,9,1.1,7,0,6.28)
# 17 reutilizar = ciclo e moedas
def reuse(cv,t,u,P):
    S(cv,(5,60,50),(0,20,30))
    for i in range(0,H,60): cv2.line(cv,(0,i),(W,i),bgr((10,70,60)),1)
    R=330
    for k in range(3):
        a=t*1.6+k*2.094;
        cv2.ellipse(cv,(540,880),(R,R),0,0,360,bgr((30,110,100)),6,AA)
        ship(cv,int(540+math.cos(a)*R),int(880+math.sin(a)*R),130,a+math.pi,0,t)
    arrow(cv,(540+R*0.8,560),(540+R*0.3,500),MINT,12)
    for i in range(7):
        y=((t*500+i*260)%1700)+100; x=140+hsh(i,3)*800
        if u>0.3: cv2.circle(cv,(int(x),int(y)),44,bgr((255,205,60)),-1,AA); cv2.circle(cv,(int(x),int(y)),44,bgr((200,150,20)),5,AA); text(cv,"$",int(x),int(y),56,(150,100,10))
# 18 descartar peças
def discard(cv,t,u,P):
    S(cv,(40,10,20),(15,10,35))
    for i in range(14):
        x=100+hsh(i,1)*880; y=((t*(250+hsh(i,4)*400)+hsh(i,2)*2000)%2200)-150
        poly(cv,[(-30,-20),(30,-26),(36,24),(-22,30)],(130,130,145),x,y,t*(hsh(i,5)-.5)*4+i,1+hsh(i,6))
    k=ease(u*1.8)
    ship(cv,540,880-60*(1-k),520,0,0,t);
    cv2.line(cv,(540-260,880-260),(540+260,880+260),bgr((255,60,70)),30,AA) if u<0.5 else arrow(cv,(240,1400),(840,1400),MINT,16)
# 19 calendário de voos acendendo
def calendar(cv,t,u,P):
    S(cv,(20,15,60),(60,20,100))
    cols,rows=4,6; cw=210;
    for r in range(rows):
        for c in range(cols):
            x=130+c*cw; y=330+r*230; i=r*cols+c
            lit=(i/(rows*cols))<ease(u*1.2)
            cv2.rectangle(cv,(x,y),(x+170,y+190),bgr(MINT if lit else (80,60,130)),3,AA)
            if lit: glow(cv,x+85,y+95,120,MINT,0.5); ship(cv,x+85,y+95,120,0,0,t)
    text(cv,"+ VOOS POR ANO",540,250,96,(255,255,255))
# 20 braços vazios: onde está o foguete
def empty(cv,t,u,P):
    S(cv,(30,35,60),(12,12,24))
    tower(cv,540,150,1900,0.0,ay=950,col=(110,115,140))
    ov=cv.copy(); booster(ov,540,950,520,0,0,t); cv[:]=cv2.addWeighted(ov,0.14+0.1*math.sin(t*5),cv,0.86-0.1*math.sin(t*5),0)
    for k in range(3):
        text(cv,"?",int(540+(k-1)*260+math.sin(t*3+k)*20),int(480+math.cos(t*2+k)*40),180+k*20,(255,220,90))
# 21 duas versões divergentes
def conflict(cv,t,u,P):
    S(cv,(10,10,30),(50,10,60))
    for sgn,(col,lab) in ((-1,((80,170,255),"A")),(1,((255,110,90),"B"))):
        x=540+sgn*(300-120*eo(u*1.5));
        rect(cv,x-200,620,x+200,1280,(240,240,245),1.0); rect(cv,x-200,620,x+200,720,col)
        text(cv,lab,int(x),670,90,(255,255,255))
        for j in range(5): rect(cv,x-160,780+j*80,x+160-j*30,800+j*80,(170,170,180))
    cv2.line(cv,(540,540),(540,1360),bgr((255,255,255)),4,AA)
    text(cv,"≠",540,960,300,MINT)
# 22 checklist
def checklist(cv,t,u,P):
    S(cv,(0,50,60),(0,15,25))
    items=("DECOLOU","ÓRBITA","NAVE PEGA","FOGUETE?")
    for i,lab in enumerate(items):
        y=520+i*250; k=ease((u*4)-i);
        rect(cv,140,y-80,940,y+80,(10,60,70),1.0); cv2.rectangle(cv,(140,y-80),(940,y+80),bgr(MINT if i<3 else (255,200,60)),4,AA)
        text(cv,lab,540,y,90,(255,255,255))
        if k>0:
            if i<3: cv2.polylines(cv,[np.array([(190,y),(230,y+40),(300,y-40)],np.int32)],False,bgr(MINT),14,AA)
            else: text(cv,"…",230,y-20,120,(255,200,60))
# 23 CTA: comente
def cta(cv,t,u,P):
    S(cv,NAVY,(0,90,90))
    for i in range(18):
        a=i/18*6.28+t*0.3; cv2.line(cv,(540,900),(int(540+math.cos(a)*1400),int(900+math.sin(a)*1400)),bgr((0,110,100)),3,AA)
    glow(cv,540,900,500,MINT,0.35)
    s=1+0.05*math.sin(t*8)
    rect(cv,130,640,950,1160,(255,255,255)); poly(cv,[(-60,0),(60,0),(0,90)],(255,255,255),300,1160)
    text(cv,"ARQUIVO",540,900,int(200*s),NAVY)
    # coração
    k=eo(u*2); cv2.circle(cv,(430,1450),int(60*k),bgr((255,60,100)),-1,AA); cv2.circle(cv,(530,1450),int(60*k),bgr((255,60,100)),-1,AA)
    poly(cv,[(-110,0),(110,0),(0,150)],(255,60,100),480,1470,0,k)
# 24 fundo de mar/foguete caindo (booster splash)
def splash(cv,t,u,P):
    S(cv,(130,170,230),(20,60,120)); clouds(cv,t,250,(255,255,255),5,8,25,0.6)
    waves(cv,1150,t,(30,110,170),22,8,2.0)
    y=300+eo(u)*820; booster(cv,540,y,520,0.0,0.0,t) if u<0.85 else None
    if u>0.8:
        for i in range(30):
            a=-math.pi/2+(hsh(i,1)-.5)*2.2; d=(u-0.8)*5*700*hsh(i,2)
            cv2.circle(cv,(int(540+math.cos(a)*d),int(1150+math.sin(a)*d)),9,bgr((255,255,255)),-1,AA)
        ring(cv,540,1160,(u-0.8)*5*500,(255,255,255),8,0.8)
# 25 relâmpago de dinheiro vs foguete (custo)
def cost(cv,t,u,P):
    S(cv,(40,20,0),(10,10,20))
    stack=int(2+14*eo(u*1.4))
    for i in range(stack):
        cv2.ellipse(cv,(540,1500-i*52),(190,48),0,0,360,bgr((255,205,60)),-1,AA); cv2.ellipse(cv,(540,1500-i*52),(190,48),0,0,360,bgr((190,130,10)),4,AA)
    arrow(cv,(540,420+ (1-u)*0),(540,600),(255,60,70),18)
    ship(cv,540,1000-0*u,330,0,0,t)
    glow(cv,540,1400-stack*20,300,(255,200,60),0.3)
PAINT=dict(cover=cover,numfly=numfly,texas=texas,liftoff=liftoff,ascent=ascent,separate=separate,topdown=topdown,aborted=aborted,orbit_ship=orbit_ship,starlink=starlink,clock_orbit=clock_orbit,reentry=reentry,catch=catch,clasp=clasp,timeline=timeline,first=first,reuse=reuse,discard=discard,calendar=calendar,empty=empty,conflict=conflict,checklist=checklist,cta=cta,splash=splash,cost=cost)
