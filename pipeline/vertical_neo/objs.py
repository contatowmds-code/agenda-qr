import numpy as np, math, functools
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from gfx import *
import ui
S=2; N=560   # caixa 560 px (desenho em 2x)
def lay(): return Image.new('RGBA',(N*S,N*S),(0,0,0,0))
def grad(mask,c1,c2,gloss=True):
    a=np.array(mask.split()[3]).astype(np.float32)/255.0; h,w=a.shape
    ys=np.where(a.max(1)>0.05)[0]; y0,y1=(ys[0],ys[-1]) if len(ys) else (0,h-1)
    t=np.clip((np.arange(h)-y0)/max(1,y1-y0),0,1)[:,None]
    rgb=np.zeros((h,w,3),np.float32)
    for i in range(3): rgb[...,i]=(c1[i]*(1-t)+c2[i]*t)
    if gloss:
        yy,xx=np.mgrid[0:h,0:w]; cx,cy=w*0.38,y0+(y1-y0)*0.28; d=np.hypot(xx-cx,(yy-cy)*1.3)/(max(1,(y1-y0))*0.55)
        hl=np.clip(1-d,0,1)**2*0.55; rgb=rgb*(1-hl[...,None])+255*hl[...,None]
    out=np.dstack([np.clip(rgb,0,255),a*255]).astype(np.uint8); return Image.fromarray(out,'RGBA')
def shape(fn,c1,c2,gloss=True,edge=None):
    m=lay(); d=ImageDraw.Draw(m); fn(d,(255,255,255,255)); g=grad(m,c1,c2,gloss)
    if edge:
        e=lay(); de=ImageDraw.Draw(e); fn(de,(0,0,0,255)); em=np.array(e.split()[3]); k=np.array(m.split()[3])
        from scipy.ndimage import binary_dilation
        ring=(binary_dilation(em>128,iterations=6)&~(em>128)); arr=np.array(g); arr[ring]=list(edge)+[255]; g=Image.fromarray(arr)
    return g
def final(layers,shadow=True):
    im=lay()
    if shadow:
        sh=lay(); 
        for l in layers: sh=Image.alpha_composite(sh,Image.fromarray(np.dstack([np.zeros(np.array(l).shape[:2]+(3,),np.uint8),(np.array(l)[...,3]*0.55).astype(np.uint8)])))
        sh=sh.filter(ImageFilter.GaussianBlur(26)); sh=sh.transform(sh.size,Image.AFFINE,(1,0,-10,0,1,-34))
        im=Image.alpha_composite(im,sh)
    for l in layers: im=Image.alpha_composite(im,l)
    return np.array(im.resize((N,N),Image.LANCZOS))
def P(x,y): return (x*S,y*S)
def R(d,b,r,fill): d.rounded_rectangle([b[0]*S,b[1]*S,b[2]*S,b[3]*S],r*S,fill=fill)
def E(d,b,fill): d.ellipse([b[0]*S,b[1]*S,b[2]*S,b[3]*S],fill=fill)
def poly(d,pts,fill): d.polygon([(x*S,y*S) for x,y in pts],fill=fill)
GOLD=((255,222,90),(214,140,20)); GRN=((120,255,170),(20,170,90)); RDD=((255,120,110),(200,30,40)); BLU=((130,190,255),(40,90,220)); ACC=((120,255,225),(1,200,150)); WHT=((255,255,255),(200,205,215)); DRK=((70,80,100),(18,24,40)); ORG=((255,190,110),(235,100,40))
def txt_layer(s,size,col,cx,cy,font='Anton-Regular.ttf'):
    l=lay(); d=ImageDraw.Draw(l); f=ImageFont.truetype(font,size*S); b=d.textbbox((0,0),s,font=f); d.text((cx*S-(b[2]-b[0])/2-b[0],cy*S-(b[3]-b[1])/2-b[1]),s,font=f,fill=col); return l
@functools.lru_cache(None)
def obj(name):
    L=[]
    if name=='coin':
        L=[shape(lambda d,f:E(d,(60,60,500,500),f),*GOLD,edge=(150,90,10)),shape(lambda d,f:(E(d,(110,110,450,450),f)),(230,170,40),(255,225,110),False,edge=(190,120,15)),txt_layer('$',250,(150,90,10,255),280,285)]
    elif name=='star':
        pts=[(280+ (250 if i%2==0 else 105)*math.cos(math.radians(-90+i*36)),290+(250 if i%2==0 else 105)*math.sin(math.radians(-90+i*36))) for i in range(10)]
        L=[shape(lambda d,f:poly(d,pts,f),*ORG,edge=(150,70,10))]
    elif name=='check':
        L=[shape(lambda d,f:E(d,(50,50,510,510),f),*GRN,edge=(10,110,60)),shape(lambda d,f:(d.line([P(150,290),P(240,380)],f,width=70*S),d.line([P(240,380),P(410,190)],f,width=70*S)),*WHT,False)]
    elif name=='xmark':
        L=[shape(lambda d,f:E(d,(50,50,510,510),f),*RDD,edge=(130,10,20)),shape(lambda d,f:(d.line([P(170,170),P(390,390)],f,width=64*S),d.line([P(390,170),P(170,390)],f,width=64*S)),*WHT,False)]
    elif name=='laptop':
        L=[shape(lambda d,f:R(d,(90,110,470,390),26,f),(60,66,84),(20,24,38),True,edge=(120,128,150)),shape(lambda d,f:R(d,(115,135,445,365),12,f),(10,40,70),(4,20,45),False),shape(lambda d,f:poly(d,[(40,400),(520,400),(490,440),(70,440)],f),(200,205,215),(120,125,140),True),
           shape(lambda d,f:(R(d,(140,175,300,195),6,f),R(d,(140,215,380,235),6,f),R(d,(140,255,260,275),6,f)),*ACC,False)]
    elif name=='phone':
        L=[shape(lambda d,f:R(d,(150,40,410,520),50,f),(70,76,94),(18,22,36),True,edge=(150,158,180)),shape(lambda d,f:R(d,(168,80,392,480),30,f),(8,40,80),(2,18,46),False),shape(lambda d,f:E(d,(205,170,355,320),f),*ACC,False),shape(lambda d,f:R(d,(190,350,370,375),10,f),*WHT,False),shape(lambda d,f:R(d,(190,395,320,418),10,f),*WHT,False)]
    elif name=='calendar':
        L=[shape(lambda d,f:R(d,(80,80,480,490),40,f),*WHT,True,edge=(190,196,210)),shape(lambda d,f:R(d,(80,80,480,200),40,f),*RDD,False),txt_layer('13',200,(30,36,52,255),280,360)]
    elif name=='gift':
        L=[shape(lambda d,f:R(d,(90,230,470,500),24,f),*ACC,True,edge=(0,120,90)),shape(lambda d,f:R(d,(70,170,490,255),20,f),(160,255,235),(40,215,170),True,edge=(0,120,90)),shape(lambda d,f:R(d,(250,170,310,500),0,f),*GOLD,False),shape(lambda d,f:(E(d,(160,60,290,190),f),E(d,(270,60,400,190),f)),*GOLD,True,edge=(150,90,10))]
    elif name=='rocket':
        L=[shape(lambda d,f:poly(d,[(280,40),(360,160),(380,360),(180,360),(200,160)],f),*WHT,True,edge=(150,156,172)),shape(lambda d,f:poly(d,[(280,40),(340,130),(220,130)],f),*RDD,True),shape(lambda d,f:E(d,(230,180,330,280),f),*BLU,True,edge=(20,60,150)),shape(lambda d,f:poly(d,[(180,300),(100,420),(190,380)],f),*RDD,True),shape(lambda d,f:poly(d,[(380,300),(460,420),(370,380)],f),*RDD,True),shape(lambda d,f:poly(d,[(220,370),(280,520),(340,370)],f),*ORG,False)]
    elif name=='bolt':
        L=[shape(lambda d,f:poly(d,[(330,30),(130,300),(260,300),(200,520),(430,220),(290,220)],f),*ACC,True,edge=(0,120,90))]
    elif name=='lock':
        L=[shape(lambda d,f:(d.arc([150*S,40*S,410*S,300*S],180,360,fill=f,width=44*S),d.line([P(150,170),P(150,260)],f,width=44*S),d.line([P(410,170),P(410,260)],f,width=44*S)),(210,215,225),(120,126,140),False),shape(lambda d,f:R(d,(100,250,460,500),40,f),*GOLD,True,edge=(150,90,10)),shape(lambda d,f:(E(d,(250,330,310,390),f),R(d,(270,370,290,440),8,f)),*DRK,False)]
    elif name=='magnifier':
        L=[shape(lambda d,f:d.line([P(360,360),P(480,480)],f,width=70*S),*DRK,True),shape(lambda d,f:(E(d,(60,60,390,390),f),),*BLU,True,edge=(20,60,150)),shape(lambda d,f:E(d,(95,95,355,355),f),(220,245,255),(150,200,240),False)]
    elif name=='chart':
        L=[shape(lambda d,f:R(d,(60,60,500,500),30,f),(30,40,70),(10,16,36),True,edge=(90,110,160))]
        for i,h in enumerate([120,190,260,340]): L.append(shape(lambda d,f,i=i,h=h:R(d,(110+i*92,470-h,170+i*92,470),10,f),*(ACC if i<3 else GOLD),True))
    elif name=='clock':
        L=[shape(lambda d,f:E(d,(50,50,510,510),f),*WHT,True,edge=(150,156,172)),shape(lambda d,f:(d.line([P(280,280),P(280,130)],f,width=26*S),d.line([P(280,280),P(380,330)],f,width=26*S)),*DRK,False),shape(lambda d,f:E(d,(260,260,300,300),f),*RDD,False)]
    elif name=='bulb':
        L=[shape(lambda d,f:E(d,(110,40,450,380),f),(255,250,170),(255,200,40),True,edge=(190,130,10)),shape(lambda d,f:(R(d,(200,370,360,420),12,f),R(d,(215,425,345,470),14,f)),(200,205,215),(110,116,130),True)]
    elif name=='shield':
        L=[shape(lambda d,f:poly(d,[(280,40),(480,110),(460,330),(280,520),(100,330),(80,110)],f),*BLU,True,edge=(20,60,150)),shape(lambda d,f:(d.line([P(190,280),P(260,350)],f,width=50*S),d.line([P(260,350),P(380,200)],f,width=50*S)),*WHT,False)]
    elif name=='trophy':
        L=[shape(lambda d,f:(poly(d,[(150,60),(410,60),(380,260),(280,330),(180,260)],f),R(d,(240,320,320,420),6,f),R(d,(170,420,390,490),14,f)),*GOLD,True,edge=(150,90,10))]
    elif name=='toggle':
        L=[shape(lambda d,f:R(d,(50,170,510,390),110,f),*GRN,True,edge=(10,110,60)),shape(lambda d,f:E(d,(310,190,490,370),f),*WHT,True)]
    elif name=='bag':
        L=[shape(lambda d,f:(E(d,(70,170,490,510),f),poly(d,[(190,70),(370,70),(330,200),(230,200)],f)),*GRN,True,edge=(10,110,60)),txt_layer('$',200,(255,255,255,255),280,360)]
    elif name=='chip':
        L=[shape(lambda d,f:R(d,(110,110,450,450),30,f),(60,70,96),(14,20,36),True,edge=(130,140,170)),shape(lambda d,f:R(d,(170,170,390,390),16,f),*ACC,False)]+[shape(lambda d,f,i=i:(R(d,(150+i*60,60,170+i*60,110),4,f),R(d,(150+i*60,450,170+i*60,500),4,f),R(d,(60,150+i*60,110,170+i*60),4,f),R(d,(450,150+i*60,500,170+i*60),4,f)),*WHT,False) for i in range(5)]
    elif name=='heart':
        L=[shape(lambda d,f:(E(d,(60,100,300,340),f),E(d,(260,100,500,340),f),poly(d,[(75,270),(485,270),(280,500)],f)),*RDD,True,edge=(130,10,20))]
    elif name=='plug':
        L=[shape(lambda d,f:(R(d,(170,60,220,200),10,f),R(d,(340,60,390,200),10,f)),(220,225,235),(130,136,150),True),shape(lambda d,f:R(d,(120,190,440,360),50,f),(70,76,94),(18,22,36),True,edge=(150,158,180)),shape(lambda d,f:R(d,(240,350,320,520),30,f),(70,76,94),(18,22,36),False)]
    elif name=='cursor':
        L=[shape(lambda d,f:poly(d,[(150,40),(150,420),(250,330),(320,490),(390,455),(320,300),(450,300)],f),*WHT,True,edge=(30,36,52))]
    elif name=='folder':
        L=[shape(lambda d,f:(R(d,(60,120,250,200),20,f),R(d,(60,160,500,470),30,f)),(255,226,120),(240,160,30),True,edge=(150,90,10))]
    elif name=='doc':
        return ui.doc(420,520,'',8)
    elif name=='gear':
        return ui.gear(480)
    elif name=='robot':
        return ui.ia_chip(480)
    elif name=='bubble':
        L=[shape(lambda d,f:(R(d,(50,80,510,380),60,f),poly(d,[(130,360),(130,480),(250,370)],f)),*WHT,True,edge=(150,156,172)),shape(lambda d,f:(E(d,(150,200,210,260),f),E(d,(250,200,310,260),f),E(d,(350,200,410,260),f)),*DRK,False)]
    elif name in('tv','tvad','tvclean','tvoff'):
        L=[shape(lambda d,f:R(d,(40,90,520,410),22,f),(70,76,94),(18,22,36),True,edge=(150,158,180)),
           shape(lambda d,f:R(d,(60,110,500,390),10,f),(10,40,80) if name!='tvoff' else (8,10,16),(2,14,40) if name!='tvoff' else (2,3,8),False),
           shape(lambda d,f:poly(d,[(240,410),(320,410),(350,470),(210,470)],f),(60,66,84),(20,24,38),False),
           shape(lambda d,f:R(d,(150,465,410,490),10,f),(90,96,114),(30,34,48),True)]
        if name=='tvad':
            L+=[shape(lambda d,f:R(d,(75,125,485,235),10,f),*RDD,False),txt_layer('AD',90,(255,255,255,255),280,180),
                shape(lambda d,f:(R(d,(75,250,200,375),8,f),R(d,(215,250,340,375),8,f),R(d,(355,250,485,375),8,f)),(255,170,60),(230,110,30),False)]
        if name=='tvclean':
            L+=[shape(lambda d,f:R(d,(110,270,450,360),28,f),(30,40,60),(14,20,36),False),
                shape(lambda d,f:(R(d,(130,285,195,345),14,f),R(d,(210,285,275,345),14,f),R(d,(290,285,355,345),14,f),R(d,(370,285,435,345),14,f)),*ACC,False),
                txt_layer('12:30',70,(255,255,255,255),280,190)]
        if name=='tv':
            L+=[shape(lambda d,f:(R(d,(90,150,470,180),8,f),R(d,(90,210,380,240),8,f),R(d,(90,270,430,300),8,f)),*ACC,False)]
    elif name in('uibad','uigood'):
        bad=name=='uibad'
        L=[shape(lambda d,f:R(d,(50,70,510,490),30,f),(70,76,94),(18,22,36),True,edge=(150,158,180)),
           shape(lambda d,f:R(d,(68,118,492,472),16,f),((150,70,255) if bad else (250,247,240)),((255,90,200) if bad else (232,226,214)),False),
           shape(lambda d,f:(E(d,(78,84,100,106),f),E(d,(110,84,132,106),f),E(d,(142,84,164,106),f)),(255,120,110),(230,60,60),False)]
        if bad:
            L+=[shape(lambda d,f:(R(d,(90,140,470,215),12,f),R(d,(90,235,270,330),12,f),R(d,(290,235,470,330),12,f),R(d,(90,350,470,450),12,f)),(255,255,255),(255,200,255),True),
                txt_layer('!!!',70,(150,60,255,255),280,178)]
        else:
            L+=[shape(lambda d,f:R(d,(95,145,330,175),8,f),(1,24,57),(1,24,57),False),
                shape(lambda d,f:(R(d,(95,195,420,212),6,f),R(d,(95,225,380,242),6,f)),(120,130,150),(120,130,150),False),
                shape(lambda d,f:R(d,(95,270,235,320),14,f),*ACC,False),
                shape(lambda d,f:R(d,(95,350,465,445),12,f),(255,255,255),(240,240,240),False,edge=(200,196,186))]
    elif name=='phonebot':
        L=[shape(lambda d,f:R(d,(150,40,410,520),50,f),(70,76,94),(18,22,36),True,edge=(150,158,180)),shape(lambda d,f:R(d,(168,80,392,480),30,f),(8,40,80),(2,18,46),False),
           shape(lambda d,f:(E(d,(200,190,260,250),f),E(d,(300,190,360,250),f)),*ACC,False),shape(lambda d,f:R(d,(215,300,345,322),10,f),*ACC,False),
           shape(lambda d,f:(R(d,(195,370,365,392),8,f),R(d,(195,410,320,432),8,f)),(120,140,180),(90,110,150),False)]
    elif name=='cart':
        L=[shape(lambda d,f:poly(d,[(110,170),(470,170),(430,350),(160,350)],f),*ACC,True,edge=(0,120,90)),
           shape(lambda d,f:(d.line([P(50,110),P(110,110)],f,width=26*S),d.line([P(110,110),P(160,350)],f,width=26*S)),(90,96,114),(40,44,58),False),
           shape(lambda d,f:(E(d,(170,390,250,470),f),E(d,(360,390,440,470),f)),(70,76,94),(18,22,36),True,edge=(150,158,180))]
    else: raise KeyError(name)
    return final(L)
