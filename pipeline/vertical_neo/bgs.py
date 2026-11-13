import numpy as np, cv2, math, random
from gfx import *
env=lambda t:0.0
BASE=np.zeros((H,W,3),np.uint8)
for y in range(H):
    t=y/H; BASE[y,:]=(int(lerp(14,10,t)),int(lerp(13,12,t)),int(lerp(13,12,t)))
def base(): return BASE.copy()
def dimc(c,k): return (int(c[0]*k),int(c[1]*k),int(c[2]*k))
def hsh(i,s=0): return (math.sin(i*127.1+s*311.7)*43758.5453)%1.0
def glowband(cv,y,h,col,a):
    if a<=0.01: return
    y0=int(max(y-h,0)); y1=int(min(y+h,H))
    ys=np.arange(y0,y1,dtype=np.float32); k=np.exp(-((ys-y)/(h*0.5))**2)[:,None,None]*a
    cv[y0:y1]=np.clip(cv[y0:y1]+k*np.array(bgr(col),np.float32),0,255).astype(np.uint8)
def bg_burst(cv,u,e,col=Y,cx=540,cy=620):
    n=56
    for i in range(n):
        a=i/n*math.tau+hsh(i)*0.1+u*0.12; sp=0.8+hsh(i,3)*1.6
        ph=(u*sp+hsh(i,5))%1.0; r1=130+ph**1.5*1300; r2=r1+60+ph*260*(0.6+e)
        c=dimc(col,0.12+0.5*(1-ph)*(0.6+0.7*e))
        line(cv,(cx+math.cos(a)*r1,cy+math.sin(a)*r1),(cx+math.cos(a)*r2,cy+math.sin(a)*r2),c,2+int(hsh(i,7)*5))
def bg_grid(cv,u,e,col=Y,hy=820,speed=0.5):
    glowband(cv,hy,160,col,0.18+0.25*e)
    for k in range(-14,15):
        x=540+k*300; line(cv,(540+k*26,hy),(x*1.9-540*0.9,H+10),dimc(col,0.25+0.25*e),2)
    for k in range(14):
        ph=((k/14.0)+u*speed*0.25)%1.0; y=hy+ (H-hy)*ph**2.3
        line(cv,(0,y),(W,y),dimc(col,0.1+0.4*ph),2)
CH=["0","1","{","}","<",">","/","=",";","#","$","()"]
def bg_rain(cv,u,col,e=0.0,dens=18,size=1.0):
    for c in range(dens):
        x=20+c*(W-40)/dens; sp=260+hsh(c,1)*520; off=hsh(c,2)*H
        for j in range(12):
            y=(off+u*sp-j*54)%(H+300)-150
            k=(1-j/12.0)
            if y<0 or y>H: continue
            cv2.putText(cv,CH[(c*7+j*3+int(u*3))%len(CH)],(int(x),int(y)),cv2.FONT_HERSHEY_SIMPLEX,1.1*size,bgr(dimc(col,0.12+0.7*k*k)),2,cv2.LINE_AA)
def bg_dots(cv,u,e,col=Y,pulse=None):
    cols,rows=10,19
    for r in range(rows):
        for c in range(cols):
            x=70+c*104; y=110+r*98
            d=math.hypot(x-540,y-960)
            k=0.10+0.10*math.sin(u*2+r*0.4+c*0.3)
            if pulse is not None:
                for (pt,pc) in pulse:
                    w=(u-pt)*1100; k+=0.7*math.exp(-((d-w)/110.0)**2)*(1 if u>pt else 0)
            circ(cv,x,y,3+int(5*clamp(k)),dimc(col,clamp(0.15+k)))
def bg_q(cv,u,e,col=Y):
    for i in range(12):
        sp=70+hsh(i)*120; x=60+hsh(i,2)*960; y=(1900+hsh(i,4)*1900-u*sp)%2100-100
        s=T("?",FA,130+int(hsh(i,5)*160),dimc(col,0.18+0.12*hsh(i,6)),0)
        place(cv,s,x+math.sin(u+i)*30,y,1,1,math.sin(u*0.7+i)*22,0.9)
JARG=["idempotente","monorepo","refatorar","endpoint","middleware","deploy","hash","cache","build","parser","stack","merge","lint","schema","rollback","webhook"]
def bg_jargon(cv,u,e,col=Y,fade=1.0):
    if fade<=0.01: return
    for i in range(16):
        sp=110+hsh(i)*160; x=(hsh(i,2)*1300)-120; y=(2000+hsh(i,4)*900-u*sp)%2200-150
        s=T(JARG[i%len(JARG)],FI,46+int(hsh(i,5)*60),dimc((180,180,190),0.3*fade),0)
        place(cv,s,x,y,1,1,(-6+hsh(i,8)*12),1)
def mudlayer(cv,amt,u,col=(60,40,25)):
    if amt<=0.01: return
    sm=np.zeros((240,135,3),np.uint8)
    n=int(10+amt*26)
    for i in range(n):
        side=hsh(i,1); 
        x=135*hsh(i,2); y=240*hsh(i,3)
        ex=min(x,135-x,y,240-y)/60.0
        r=int((9+hsh(i,4)*26)*clamp(amt*1.5-ex*0.45+0.3)) 
        if r>1: cv2.circle(sm,(int(x+math.sin(u*0.8+i)*3),int(y+math.cos(u*0.7+i)*3)),r,bgr(dimc(col,0.5+0.5*hsh(i,6))),-1)
    sm=cv2.GaussianBlur(sm,(0,0),3.2)
    big=cv2.resize(sm,(W,H),interpolation=cv2.INTER_LINEAR)
    m=(big.sum(2)>20)[...,None]
    cv[:]=np.where(m,np.clip(cv*0.35+big*0.95,0,255).astype(np.uint8),cv)
def bg_pages(cv,u,e,col=Y):
    pg=rrect(120,160,10,(235,235,240,255))
    for i in range(14):
        ph=(u*(0.25+hsh(i)*0.2)+hsh(i,2))%1.0
        x=-100+ph*1300; y=300+hsh(i,3)*1200+math.sin(ph*6+i)*60; s=0.5+hsh(i,4)*0.9
        place(cv,pg,x,y,s,s,ph*160-50+i*7,0.16+0.12*s)
def bg_term(cv,u,e,col=GN):
    cv[::8]=(cv[::8]*0.72).astype(np.uint8)
    for i in range(8):
        y=(u*200*(0.4+hsh(i))+hsh(i,2)*H)%H
        cv[int(y):int(y)+3]=np.clip(cv[int(y):int(y)+3]+np.array(bgr(col),np.float32)*0.06,0,255).astype(np.uint8)
def bg_rays(cv,u,e,col=Y,cx=540,cy=700):
    n=24
    for i in range(n):
        a0=i/n*math.tau+u*0.25; a1=a0+math.tau/n*0.5
        pts=np.array([[cx,cy],[cx+math.cos(a0)*2400,cy+math.sin(a0)*2400],[cx+math.cos(a1)*2400,cy+math.sin(a1)*2400]],np.int32)
        ov=cv.copy(); cv2.fillPoly(ov,[pts],bgr(dimc(col,0.5)),cv2.LINE_AA); cv2.addWeighted(ov,0.10+0.1*e,cv,1-0.10-0.1*e,0,cv)
def confetti(cv,u,col_list,n=40,seed=1,speed=380):
    for i in range(n):
        x=hsh(i,seed)*W; y=(hsh(i,seed+1)*H+u*speed*(0.5+hsh(i,seed+2)))%(H+100)-50
        c=col_list[i%len(col_list)]; w=8+int(hsh(i,seed+3)*10)
        cv2.rectangle(cv,(int(x),int(y)),(int(x+w),int(y+w*1.6)),bgr(c),-1)
