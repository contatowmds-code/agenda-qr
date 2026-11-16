from PIL import Image, ImageDraw, ImageFont
FB='/usr/share/fonts/opentype/inter/Inter-Black.otf'
def font(s): return ImageFont.truetype(FB,s)
def sm(t): t=max(0,min(1,t)); return t*t*(3-2*t)
for f in range(278,396):
    im=Image.open(f'map_a/m{f:04d}.jpg').convert('RGB').resize((720,1280),Image.LANCZOS)
    if f>=336:
        ov=Image.new('RGBA',im.size,(0,0,0,0)); d=ImageDraw.Draw(ov)
        v=int(round(14*sm((f-339)/42)))
        d.rounded_rectangle((120,150,600,310),44,fill=(8,20,60,225),outline=(255,255,255,110),width=3)
        d.text((360,222),str(v),font=font(120),fill=(255,255,255,255),anchor='mm')
        d.text((360,290),'VOLTAS NA ÓRBITA',font=font(30),fill=(255,179,71,255),anchor='mm')
        im=Image.alpha_composite(im.convert('RGBA'),ov).convert('RGB')
    im.save(f'frames/f{f:04d}.jpg',quality=94)
print('ok')
