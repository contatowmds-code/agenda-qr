from PIL import Image, ImageDraw, ImageFont
import os
FB='/usr/share/fonts/opentype/inter/Inter-Black.otf'
def font(s): return ImageFont.truetype(FB,s)
def box(d,xy,fill,out,w=6,r=26): d.rounded_rectangle(xy,r,fill=fill,outline=out,width=w)
def stroke_text(d,xy,t,size,fill,anchor='mm'): d.text(xy,t,font=font(size),fill=fill,anchor=anchor,stroke_width=max(2,size//14),stroke_fill=(1,24,57))
def sm(t): t=max(0,min(1,t)); return t*t*(3-2*t)
for f in range(272,386):
    im=Image.open(f'map_a/m{f:04d}.jpg').convert('RGB').resize((720,1280),Image.LANCZOS); d=ImageDraw.Draw(im)
    if f>=309:
        v=13.29*sm((f-309)/55); s=f"{v:.2f}".replace('.',',')+' km'
        box(d,(90,150,630,300),(1,24,57),(1,251,180),8); stroke_text(d,(360,205),s,84,(255,255,255)); stroke_text(d,(360,265),'de extensão',34,(1,251,180))
    im.save(f'frames/f{f:04d}.jpg',quality=94)
for f in range(1507,1611):
    im=Image.open(f'map_b/m{f:04d}.jpg').convert('RGB').resize((720,1280),Image.LANCZOS); d=ImageDraw.Draw(im)
    p=sm((f-1511)/10)
    if p>0:
        box(d,(60,150,330,230),(1,24,57),(1,251,180),6,20); stroke_text(d,(195,190),'PONTE',46,(1,251,180))
        if f>=1536: box(d,(390,150,660,230),(1,24,57),(255,210,63),6,20); stroke_text(d,(525,190),'BARCA',46,(255,210,63))
    im.save(f'frames/f{f:04d}.jpg',quality=94)
print('ok')
