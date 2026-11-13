import numpy as np, cv2, math
from PIL import Image, ImageDraw
from gfx import *
import functools
@functools.lru_cache(None)
def win(w,h,title="",bar=64,fill=(22,22,27),edge=(60,60,70)):
    im=rrect(w,h,34,fill+(255,),outline=edge+(255,),ow=3,shadow=22)
    p=44; P=Panel(im)
    P.rect(p+3,p+3,w-6,bar,(34,34,40),0)
    for i,c in enumerate([(255,95,86),(255,189,46),(39,201,63)]):
        sp=new(30,30); ImageDraw.Draw(sp).ellipse([2,2,28,28],fill=c+(255,)); P.put(pil2np(sp),p+22+i*40,p+20)
    if title: P.text(title,p+w//2,p+bar//2+2,FIB,28,DIM,1,'c')
    return P.im
def winp(w,h,title="",**k): return win(w,h,title,**k)   # painel base com sombra (offset 44)
WO=44  # offset do conteúdo no sprite win()
@functools.lru_cache(None)
def pill(txt,w=300,h=64,fill=(36,36,42),fg=TX,size=30,edge=None,font=FIB):
    im=rrect(w,h,h//2,fill+(255,),outline=(edge+(255,)) if edge else None,ow=3)
    P=Panel(im); P.text(txt,w//2,h//2,font,size,fg,1,'c'); return P.im
@functools.lru_cache(None)
def folder(label,w=520,h=400,c1=(120,255,220),c2=(0,190,140)):
    S=2; im=new(w*S+80,h*S+80); d=ImageDraw.Draw(im)
    sh=new(im.width,im.height); ImageDraw.Draw(sh).rounded_rectangle([40,100,40+w*S,40+h*S+30],40,fill=(0,0,0,160)); im=Image.alpha_composite(im,sh.filter(ImageFilter.GaussianBlur(30)))
    d=ImageDraw.Draw(im)
    d.rounded_rectangle([40,40,40+int(w*S*0.46),40+90],34,fill=c2+(255,))
    g=new(w*S,int(h*S*0.9)); gd=ImageDraw.Draw(g)
    for y in range(g.height): t=y/g.height; gd.line([(0,y),(w*S,y)],fill=tuple(int(lerp(c1[i],c2[i],t)) for i in range(3))+(255,))
    m=new(g.width,g.height); ImageDraw.Draw(m).rounded_rectangle([0,0,g.width-1,g.height-1],44,fill=(255,255,255,255)); g.putalpha(m.split()[3])
    im.alpha_composite(g,(40,40+int(h*S*0.12)))
    im=im.resize((im.width//S,im.height//S),Image.LANCZOS); sp=pil2np(im)
    P=Panel(sp); P.put(T(label,FA,int(h*0.30),BK),20+w//2-0,int(h*0.62),1) if False else None
    t=T(label,FA,int(h*0.30),BK); P.put(t,20+w//2-t.shape[1]//2+0,int(20+h*0.52),1)
    return P.im
@functools.lru_cache(None)
def avatar(sz=200,bg=(40,40,48),fg=Y):
    im=new(sz*2,sz*2); d=ImageDraw.Draw(im)
    d.ellipse([0,0,sz*2-1,sz*2-1],fill=bg+(255,))
    m=new(sz*2,sz*2); ImageDraw.Draw(m).ellipse([0,0,sz*2-1,sz*2-1],fill=(255,255,255,255))
    L=new(sz*2,sz*2); ld=ImageDraw.Draw(L)
    ld.ellipse([sz*0.66,sz*0.34,sz*1.34,sz*1.0],fill=fg+(255,)); ld.ellipse([sz*0.28,sz*1.12,sz*1.72,sz*2.3],fill=fg+(255,))
    L.putalpha(Image.fromarray(np.minimum(np.array(L)[...,3],np.array(m)[...,3])))
    im.alpha_composite(L); return pil2np(im.resize((sz,sz),Image.LANCZOS))
@functools.lru_cache(None)
def ia_chip(sz=360,col=Y):
    S=2; im=new(sz*S+120,sz*S+120); sh=new(im.width,im.height)
    ImageDraw.Draw(sh).rounded_rectangle([60,100,60+sz*S,100+sz*S],90,fill=(0,0,0,170)); im=Image.alpha_composite(im,sh.filter(ImageFilter.GaussianBlur(26)))
    d=ImageDraw.Draw(im); d.rounded_rectangle([60,60,60+sz*S,60+sz*S],90,fill=(30,30,36,255),outline=col+(255,),width=8)
    d.line([(60+sz,60),(60+sz,10)],fill=col+(255,),width=10); d.ellipse([60+sz-24,-10+0,60+sz+24,38],fill=col+(255,))
    for ex in (0.30,0.70): d.rounded_rectangle([60+sz*S*ex-60,60+sz*S*0.38,60+sz*S*ex+60,60+sz*S*0.38+130],40,fill=col+(255,))
    d.rounded_rectangle([60+sz*S*0.30,60+sz*S*0.72,60+sz*S*0.70,60+sz*S*0.72+24],12,fill=(90,90,100,255))
    return pil2np(im.resize((im.width//S,im.height//S),Image.LANCZOS))
@functools.lru_cache(None)
def xbadge(sz=120):
    im=new(sz*2,sz*2); d=ImageDraw.Draw(im); d.ellipse([4,4,sz*2-4,sz*2-4],fill=RD+(255,),outline=(255,255,255,255),width=8)
    d.line([(sz*0.62,sz*0.62),(sz*1.38,sz*1.38)],fill=(255,255,255,255),width=22); d.line([(sz*1.38,sz*0.62),(sz*0.62,sz*1.38)],fill=(255,255,255,255),width=22)
    return pil2np(im.resize((sz,sz),Image.LANCZOS))
@functools.lru_cache(None)
def okbadge(sz=96,col=GN):
    im=new(sz*2,sz*2); d=ImageDraw.Draw(im); d.ellipse([4,4,sz*2-4,sz*2-4],fill=col+(255,))
    d.line([(sz*0.5,sz*1.05),(sz*0.86,sz*1.4),(sz*1.5,sz*0.62)],fill=(10,30,15,255),width=22,joint='curve')
    return pil2np(im.resize((sz,sz),Image.LANCZOS))
@functools.lru_cache(None)
def house(sz=260,col=Y):
    S=2; im=new(sz*S,sz*S); d=ImageDraw.Draw(im); s=sz*S
    d.polygon([(s*.5,s*.08),(s*.95,s*.48),(s*.05,s*.48)],fill=col+(255,))
    d.rectangle([s*.14,s*.46,s*.86,s*.92],fill=(0,200,150,255)); d.rectangle([s*.42,s*.62,s*.58,s*.92],fill=(30,30,36,255))
    d.rectangle([s*.22,s*.56,s*.34,s*.68],fill=(30,30,36,255)); d.rectangle([s*.66,s*.56,s*.78,s*.68],fill=(30,30,36,255))
    return pil2np(im.resize((sz,sz),Image.LANCZOS))
@functools.lru_cache(None)
def gear(sz=260,col=(200,200,210)):
    S=2; im=new(sz*S,sz*S); d=ImageDraw.Draw(im); s=sz*S; c=s/2
    for i in range(10):
        a=i*36; d.polygon([(c+math.cos(math.radians(a-10))*s*.30,c+math.sin(math.radians(a-10))*s*.30),(c+math.cos(math.radians(a-14))*s*.48,c+math.sin(math.radians(a-14))*s*.48),(c+math.cos(math.radians(a+14))*s*.48,c+math.sin(math.radians(a+14))*s*.48),(c+math.cos(math.radians(a+10))*s*.30,c+math.sin(math.radians(a+10))*s*.30)],fill=col+(255,))
    d.ellipse([c-s*.34,c-s*.34,c+s*.34,c+s*.34],fill=col+(255,)); d.ellipse([c-s*.14,c-s*.14,c+s*.14,c+s*.14],fill=(0,0,0,0))
    return pil2np(im.resize((sz,sz),Image.LANCZOS))
@functools.lru_cache(None)
def doc(w=300,h=380,title="HANDOFF.md",lines=7,fill=(245,245,248)):
    im=rrect(w,h,18,fill+(255,),shadow=16); P=Panel(im); o=32
    P.rect(o+22,o+30,w-44,10,Y); P.text(title,o+22,o+70,FIB,30,(20,20,24),1)
    for i in range(lines): P.rect(o+22,o+120+i*34,int((w-44)*(0.5+0.5*((i*37)%7)/7)),12,(200,200,208),6)
    return P.im
@functools.lru_cache(None)
def bolt_logo(sz=200):
    im=Image.open('AV-logo.png').convert('RGBA').resize((sz*2,sz*2),Image.LANCZOS)
    m=new(sz*2,sz*2); ImageDraw.Draw(m).rounded_rectangle([0,0,sz*2-1,sz*2-1],sz*0.5,fill=(255,255,255,255)); im.putalpha(m.split()[3])
    return pil2np(im.resize((sz,sz),Image.LANCZOS))

@functools.lru_cache(None)
def qv_logo(sz=640):
    im=Image.open('QV-logo.png').convert('RGBA').resize((sz*2,sz*2),Image.LANCZOS)
    m=new(sz*2,sz*2); ImageDraw.Draw(m).rounded_rectangle([0,0,sz*2-1,sz*2-1],sz*0.16,fill=(255,255,255,255)); im.putalpha(m.split()[3])
    return pil2np(im.resize((sz,sz),Image.LANCZOS))
