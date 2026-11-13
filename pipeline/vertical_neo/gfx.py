import numpy as np, cv2, math, functools
from PIL import Image, ImageDraw, ImageFont, ImageFilter
W,H=1080,1920
Y=(1,251,180); O=(0,190,140); WH=(255,253,241); BK=(1,24,57); GR=(38,38,44); G2=(70,70,78); RD=(255,59,48); GN=(52,211,100); TX=(235,235,240); DIM=(150,150,160)
def bgr(c): return (c[2],c[1],c[0])
FA='Anton-Regular.ttf'; FI='/usr/share/fonts/opentype/inter/Inter-Black.otf'; FIB='/usr/share/fonts/opentype/inter/Inter-Bold.otf'; FM='/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf'
@functools.lru_cache(None)
def font(name,size): return ImageFont.truetype(name,size)
def clamp(x,a=0.0,b=1.0): return a if x<a else b if x>b else x
def lerp(a,b,t): return a+(b-a)*t
def eo3(t): t=clamp(t); return 1-(1-t)**3
def eo5(t): t=clamp(t); return 1-(1-t)**5
def eio(t): t=clamp(t); return t*t*(3-2*t)
def eob(t,s=1.9):
    t=clamp(t); c=s+1; return 1+c*(t-1)**3+s*(t-1)**2
def ramp(u,a,b): return clamp((u-a)/max(b-a,1e-6))
def np2(a): return a
# ---------- sprites (RGBA uint8 numpy) ----------
def pil2np(im): return np.array(im)
def new(w,h): return Image.new('RGBA',(w,h),(0,0,0,0))
def rrect(w,h,r,fill,outline=None,ow=0,grad=None,shadow=0,pad=0):
    S=2; p=pad+shadow*2
    im=new((w+2*p)*S,(h+2*p)*S); d=ImageDraw.Draw(im)
    if shadow:
        sh=new(im.width,im.height); sd=ImageDraw.Draw(sh)
        sd.rounded_rectangle([p*S,(p+shadow*0.6)*S,(p+w)*S,(p+h+shadow*0.6)*S],r*S,fill=(0,0,0,150))
        im=Image.alpha_composite(im,sh.filter(ImageFilter.GaussianBlur(shadow*S)))
        d=ImageDraw.Draw(im)
    if grad:
        g=new(w*S,h*S); gd=ImageDraw.Draw(g)
        for y in range(h*S):
            t=y/(h*S); c=tuple(int(lerp(grad[0][i],grad[1][i],t)) for i in range(3)); gd.line([(0,y),(w*S,y)],fill=c+(255,))
        m=new(w*S,h*S); ImageDraw.Draw(m).rounded_rectangle([0,0,w*S-1,h*S-1],r*S,fill=(255,255,255,255))
        g.putalpha(m.split()[3]); im.alpha_composite(g,(p*S,p*S))
    else:
        d.rounded_rectangle([p*S,p*S,(p+w)*S-1,(p+h)*S-1],r*S,fill=fill)
    if outline:
        ImageDraw.Draw(im).rounded_rectangle([p*S,p*S,(p+w)*S-1,(p+h)*S-1],r*S,outline=outline,width=ow*S)
    return pil2np(im.resize((im.width//S,im.height//S),Image.LANCZOS))
def text_im(txt,f,fill=WH,stroke=0,sfill=BK,shadow=0):
    tmp=ImageDraw.Draw(new(4,4)); b=tmp.textbbox((0,0),txt,font=f,stroke_width=stroke)
    w=b[2]-b[0]+20+shadow; h=b[3]-b[1]+20+shadow
    im=new(w,h); d=ImageDraw.Draw(im)
    if shadow: d.text((10-b[0]+shadow,10-b[1]+shadow),txt,font=f,fill=(0,0,0,170),stroke_width=stroke,stroke_fill=(0,0,0,170))
    d.text((10-b[0],10-b[1]),txt,font=f,fill=fill+(255,) if len(fill)==3 else fill,stroke_width=stroke,stroke_fill=sfill)
    return im
@functools.lru_cache(512)
def T(txt,name,size,fill=WH,stroke=0,sfill=BK,shadow=0):
    return pil2np(text_im(txt,font(name,size),fill,stroke,sfill,shadow))
def glow_of(spr,color,rad=18,k=1.6):
    a=spr[...,3].astype(np.float32)
    pad=rad*3; ap=np.pad(a,((pad,pad),(pad,pad)))
    b=cv2.GaussianBlur(ap,(0,0),rad)*k
    out=np.zeros(ap.shape+(4,),np.uint8); out[...,:3]=color; out[...,3]=np.clip(b,0,255).astype(np.uint8)
    return out
# ---------- compositing ----------
def blend(cv,spr,x,y,a=1.0,add=False):
    """spr RGBA uint8, top-left x,y (ints)"""
    h,w=spr.shape[:2]; x0=max(x,0); y0=max(y,0); x1=min(x+w,W); y1=min(y+h,H)
    if x0>=x1 or y0>=y1 or a<=0.003: return
    s=spr[y0-y:y1-y,x0-x:x1-x]; d=cv[y0:y1,x0:x1]
    al=(s[...,3:4].astype(np.float32)*(a/255.0))
    sc=s[...,2::-1].astype(np.float32)  # RGB->BGR
    if add: d[:]=np.clip(d+sc*al,0,255).astype(np.uint8)
    else: d[:]=(d*(1-al)+sc*al).astype(np.uint8)
def place(cv,spr,cx,cy,sx=1.0,sy=None,rz=0.0,a=1.0,add=False):
    if sy is None: sy=sx
    if a<=0.003 or sx==0 or sy==0: return
    h,w=spr.shape[:2]
    if abs(sx-1)<1e-3 and abs(sy-1)<1e-3 and abs(rz)<1e-3:
        blend(cv,spr,int(round(cx-w/2)),int(round(cy-h/2)),a,add); return
    M=cv2.getRotationMatrix2D((w/2,h/2),-rz,1.0); M[0,:]*=sx; M[1,:]*=sy
    # bbox
    cs=np.array([[0,0,1],[w,0,1],[w,h,1],[0,h,1]],np.float32)@M.T
    x0,y0=np.floor(cs.min(0)).astype(int); x1,y1=np.ceil(cs.max(0)).astype(int)
    ccx=sx*w/2; ccy=sy*h/2
    M[0,2]+=-x0; M[1,2]+=-y0; bw,bh=int(x1-x0),int(y1-y0)
    if bw<=0 or bh<=0 or bw>3000 or bh>3000: return
    out=cv2.warpAffine(spr,M,(bw,bh),flags=cv2.INTER_LINEAR,borderValue=(0,0,0,0))
    blend(cv,out,int(round(cx-(ccx-x0))),int(round(cy-(ccy-y0))),a,add)
def card3d(cv,spr,cx,cy,sc=1.0,rx=0.0,ry=0.0,rz=0.0,a=1.0,fov=1500.0,add=False):
    sc*=1.12
    h,w=spr.shape[:2]
    pts=np.array([[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]],np.float32)*sc
    X=np.concatenate([pts,np.zeros((4,1),np.float32)],1)
    cx_,sx_=math.cos(math.radians(rx)),math.sin(math.radians(rx)); cy_,sy_=math.cos(math.radians(ry)),math.sin(math.radians(ry)); cz,sz=math.cos(math.radians(rz)),math.sin(math.radians(rz))
    Rx=np.array([[1,0,0],[0,cx_,-sx_],[0,sx_,cx_]],np.float32); Ry=np.array([[cy_,0,sy_],[0,1,0],[-sy_,0,cy_]],np.float32); Rz=np.array([[cz,-sz,0],[sz,cz,0],[0,0,1]],np.float32)
    P=X@(Rz@Ry@Rx).T
    z=fov/(fov+P[:,2]); dst=np.stack([P[:,0]*z+cx,P[:,1]*z+cy],1).astype(np.float32)
    x0,y0=np.floor(dst.min(0)).astype(int); x1,y1=np.ceil(dst.max(0)).astype(int)
    x0=max(x0,-200); y0=max(y0,-200); x1=min(x1,W+200); y1=min(y1,H+200)
    bw,bh=x1-x0,y1-y0
    if bw<=2 or bh<=2: return
    src=np.array([[0,0],[w,0],[w,h],[0,h]],np.float32)
    Mh=cv2.getPerspectiveTransform(src,dst-np.array([x0,y0],np.float32))
    out=cv2.warpPerspective(spr,Mh,(bw,bh),flags=cv2.INTER_LINEAR,borderValue=(0,0,0,0))
    blend(cv,out,x0,y0,a,add)
# ---------- shapes direct on canvas ----------
def circ(cv,x,y,r,c,th=-1,a=1.0):
    if a>=0.99: cv2.circle(cv,(int(x),int(y)),int(max(r,0)),bgr(c),th,cv2.LINE_AA)
    else:
        ov=cv.copy(); cv2.circle(ov,(int(x),int(y)),int(max(r,0)),bgr(c),th,cv2.LINE_AA); cv2.addWeighted(ov,a,cv,1-a,0,cv)
def line(cv,p,q,c,th=2): cv2.line(cv,(int(p[0]),int(p[1])),(int(q[0]),int(q[1])),bgr(c),th,cv2.LINE_AA)
def fill_alpha(cv,col,a):  # overlay full color
    if a<=0.003: return
    cv[:]=(cv*(1-a)+np.array(bgr(col),np.float32)*a).astype(np.uint8)
# vignette
_yy,_xx=np.mgrid[0:H,0:W].astype(np.float32)
VIG=(1-0.55*np.clip(((_xx-W/2)/(W*0.75))**2+((_yy-H/2)/(H*0.72))**2,0,1))[...,None].astype(np.float32)
def vignette(cv): cv[:]=(cv*VIG).astype(np.uint8)
def star_poly(cx,cy,R,r,n=5,rot=-90):
    pts=[]
    for i in range(n*2):
        ang=math.radians(rot+i*180/n); rr=R if i%2==0 else r
        pts.append((cx+rr*math.cos(ang),cy+rr*math.sin(ang)))
    return pts
def star_sprite(size,fill=Y,edge=O):
    S=3; im=new(size*S,size*S); d=ImageDraw.Draw(im); c=size*S/2
    pts=star_poly(c,c+size*S*0.03,size*S*0.46,size*S*0.19)
    d.polygon(pts,fill=edge+(255,))
    pts2=star_poly(c,c+size*S*0.0,size*S*0.40,size*S*0.17)
    # vertical gradient fill
    g=new(size*S,size*S); gd=ImageDraw.Draw(g)
    for y in range(size*S):
        t=y/(size*S); col=tuple(int(lerp(255,255,t) if i==0 else lerp((170,255,230)[i],(0,200,150)[i],t)) for i in range(3)); gd.line([(0,y),(size*S,y)],fill=col+(255,))
    m=new(size*S,size*S); ImageDraw.Draw(m).polygon(pts2,fill=(255,255,255,255)); g.putalpha(m.split()[3]); im.alpha_composite(g)
    hl=new(size*S,size*S); ImageDraw.Draw(hl).polygon([(c-size*S*0.12,c-size*S*0.05),(c,c-size*S*0.36),(c+size*S*0.05,c-size*S*0.12)],fill=(255,255,255,120)); im.alpha_composite(hl)
    return pil2np(im.resize((size,size),Image.LANCZOS))

class Panel:
    def __init__(s,base): s.im=base.copy()
    def put(s,spr,x,y,a=1.0):
        h,w=spr.shape[:2]; H_,W_=s.im.shape[:2]
        x0=max(x,0); y0=max(y,0); x1=min(x+w,W_); y1=min(y+h,H_)
        if x0>=x1 or y0>=y1 or a<=0.003: return
        sp=spr[y0-y:y1-y,x0-x:x1-x].astype(np.float32); d=s.im[y0:y1,x0:x1].astype(np.float32)
        sa=sp[...,3:4]/255.0*a; da=d[...,3:4]/255.0
        oa=sa+da*(1-sa); oc=(sp[...,:3]*sa+d[...,:3]*da*(1-sa))/np.maximum(oa,1e-4)
        s.im[y0:y1,x0:x1,:3]=np.clip(oc,0,255).astype(np.uint8); s.im[y0:y1,x0:x1,3:]=np.clip(oa*255,0,255).astype(np.uint8)
    def text(s,txt,x,y,name=FIB,size=36,fill=TX,a=1.0,anchor='l'):
        sp=T(txt,name,size,fill); h,w=sp.shape[:2]
        if anchor=='c': x=x-w//2
        elif anchor=='r': x=x-w
        s.put(sp,int(x-10),int(y-10),a)
    def rect(s,x,y,w,h,fill,r=0,a=1.0):
        sp=rrect(int(w),int(h),int(r),fill+(255,) if len(fill)==3 else fill); s.put(sp,int(x),int(y),a)
