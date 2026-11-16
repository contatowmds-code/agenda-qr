#!/usr/bin/env python3
"""CTA animado (comentar + seguir + mensagem) sobre os quadros 720x1280.
uso: python3 cta_overlay.py <frames_dir> <words.json> <logo.png> [PALAVRA=VIRAL] [--total N]
Sincroniza com a fala: digita a palavra quando ela é dita, clica em 'Seguir' quando fala 'seguindo', mostra a mensagem em 'mensagem'."""
import sys, json, math, glob, os
from PIL import Image, ImageDraw, ImageFont
fd, wj, logo = sys.argv[1:4]; WORD = sys.argv[4] if len(sys.argv) > 4 and not sys.argv[4].startswith('--') else 'VIRAL'
FB='/usr/share/fonts/opentype/inter/Inter-Black.otf'; FX='/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf'
F=lambda s,b=FB: ImageFont.truetype(b,s)
words=json.load(open(wj)); fr=lambda w: int(w['s']*30)
def find(key, last=False):
    m=[w for w in words if key in w['w'].lower()]; return (m[-1] if last else m[0]) if m else None
wC=find('comente'); wV=[w for w in words if w['w'].upper().startswith(WORD)][0]; wS=find('seguindo'); wM=find('mensagem'); wE=words[-1]
tC, tV, tS, tM, tEnd = fr(wC), fr(wV), fr(wS), fr(wM), int(wE['e']*30)+6
total=len(glob.glob(os.path.join(fd,'f*.jpg')))
LG=Image.open(logo).convert('RGBA')
sm=lambda t: (lambda x: x*x*(3-2*x))(max(0,min(1,t)))
pop=lambda f,a: 0 if f<a else min(1,(f-a)/6)*(1+0.12*math.exp(-(f-a)/5))
MINT=(1,251,180); NAVY=(1,24,57)
def rrect(d,xy,r,fill,outline=None,w=0): d.rounded_rectangle(xy,r,fill=fill,outline=outline,width=w)
def avatar(size):
    im=Image.new('RGBA',(size,size),(0,0,0,0)); l=LG.copy(); l.thumbnail((size,size)); m=Image.new('L',(size,size),0); ImageDraw.Draw(m).ellipse((0,0,size-1,size-1),fill=255)
    bg=Image.new('RGBA',(size,size),NAVY+(255,)); bg.paste(l,((size-l.width)//2,(size-l.height)//2),l); im.paste(bg,(0,0),m); return im
AV=avatar(96)
def cursor(d,x,y,press):
    s=1.0-0.12*press; pts=[(0,0),(0,34),(9,27),(15,40),(22,37),(16,25),(27,25)]; pts=[(x+px*s*1.6,y+py*s*1.6) for px,py in pts]
    d.polygon([(px+3,py+4) for px,py in pts],fill=(0,0,0,80)); d.polygon(pts,fill=(255,255,255,255),outline=(20,20,20,255))
def layer_comment(f,W=620,H=250):
    im=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(im)
    rrect(d,(0,0,W-1,H-1),44,(255,255,255,245),(255,255,255,255),2); im.paste(AV.resize((70,70)),(26,28),AV.resize((70,70)))
    d.text((116,40),'Quanto Vale?',font=F(26),fill=(20,24,40,255)); d.text((116,72),'adicione um comentário…' if f<tV else '',font=F(22,FX),fill=(130,135,150,255))
    # campo de texto
    rrect(d,(26,120,W-26,206),40,(238,240,246,255))
    n=max(0,min(len(WORD),int((f-tV)/2.2)+1)) if f>=tV else 0; txt=WORD[:n]
    d.text((56,163),txt,font=F(46),fill=(20,24,40,255),anchor='lm')
    if (f//8)%2==0 and f<tV+30: tw=d.textlength(txt,font=F(46)); d.rectangle((56+tw+4,138,60+tw,188),fill=(1,120,200,255))
    send=(W-96,163); on=f>=tV+len(WORD)*2.2; rr_=28+(4*math.sin(f*0.5) if on else 0)
    d.ellipse((send[0]-rr_,send[1]-rr_,send[0]+rr_,send[1]+rr_),fill=(1,150,235,255) if on else (190,196,210,255)); d.polygon([(send[0]-10,send[1]+10),(send[0]+14,send[1]),(send[0]-10,send[1]-10),(send[0]-5,send[1])],fill=(255,255,255,255))
    return im
def layer_follow(f,W=620,H=330):
    im=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(im); rrect(d,(0,0,W-1,H-1),48,(255,255,255,245))
    A=AV.resize((120,120)); im.paste(A,(40,40),A); d.text((184,60),'Quanto Vale?',font=F(40),fill=(20,24,40,255)); d.text((184,112),'siga para receber',font=F(26,FX),fill=(120,126,145,255))
    t=f-tS; clicked=t>=26; press=1 if 26<=t<34 else 0
    bx=(60,190,W-60,290); col=(150,152,160,255) if clicked else (1,150,235,255)
    sc=1-0.05*press; bw=(bx[2]-bx[0])*sc; bh=(bx[3]-bx[1])*sc; cx=(bx[0]+bx[2])/2; cy=(bx[1]+bx[3])/2
    rrect(d,(cx-bw/2,cy-bh/2,cx+bw/2,cy+bh/2),30,col)
    d.text((cx,cy),'Seguindo ✓' if clicked else 'Seguir',font=F(44),fill=(255,255,255,255),anchor='mm')
    return im,(bx,t)
def layer_msg(f,W=620,H=170):
    im=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(im); rrect(d,(0,0,W-1,H-1),44,(30,34,60,240),MINT+(255,),4)
    d.rounded_rectangle((36,40,36+110,40+90),16,fill=(255,255,255,255)); d.polygon([(36,44),(36+55,90),(36+110,44)],fill=(1,150,235,255)); d.ellipse((126,24,160,58),fill=(235,50,60,255)); d.text((143,41),'1',font=F(24),fill=(255,255,255,255),anchor='mm')
    d.text((180,62),'Mensagem recebida',font=F(36),fill=(255,255,255,255),anchor='lm'); d.text((180,112),'com o link da skill',font=F(26,FX),fill=MINT+(255,),anchor='lm')
    return im
CX,CY=360,470
for f in range(max(0,tC-8),min(total,tEnd+1)):
    p=os.path.join(fd,f'f{f:04d}.jpg')
    if not os.path.exists(p): continue
    base=Image.open(p).convert('RGBA'); ov=Image.new('RGBA',base.size,(0,0,0,0))
    def put(img,cx,cy,s,a=255):
        if s<=0.02: return
        im=img.resize((max(2,int(img.width*s)),max(2,int(img.height*s))),Image.LANCZOS)
        if a<255: al=im.getchannel('A').point(lambda v:int(v*a/255)); im.putalpha(al)
        ov.alpha_composite(im,(int(cx-im.width/2),int(cy-im.height/2)))
    if f<tS:                                  # comentar
        s=pop(f,tC-4); put(layer_comment(f),CX,CY,s*0.98)
        if f>=tV+len(WORD)*2.2+6:             # envia: comentário "voa" para cima
            t=sm((f-(tV+len(WORD)*2.2+6))/14); d=ImageDraw.Draw(ov)
    else:                                     # seguir
        im,(bx,t)=layer_follow(f); fade=1-sm((f-(tM-6))/10) if f>=tM-6 else 1
        s=pop(f,tS-2); put(im,CX,CY,s*0.98,int(255*fade))
        if f<tM+4:                            # cursor
            u=sm(t/22); sx,sy=CX+260,CY+330; ex,ey=CX-310+ (bx[0]+bx[2])/2 + 0, CY-165+(bx[1]+bx[3])/2
            x=sx+(ex-sx)*u; y=sy+(ey-sy)*u; d=ImageDraw.Draw(ov); cursor(d,x,y,1 if 26<=t<34 else 0)
            if 26<=t<40: r=14+ (t-26)*4; d.ellipse((ex-r,ey-r,ex+r,ey+r),outline=(1,150,235,200),width=4)
    if f>=tM-2:                               # mensagem
        s=pop(f,tM-2); put(layer_msg(f),CX,CY+30,s*0.98)
    Image.alpha_composite(base,ov).convert('RGB').save(p,quality=94)
print('cta overlay',tC,tV,tS,tM,tEnd)
