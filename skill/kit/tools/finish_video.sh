#!/usr/bin/env bash
# uso: finish_video.sh <dir> "LINHA1" "LINHA2" "LINHA3" "TÍTULO SEO #h1 #h2 #h3" <slug>
set -e
D="$1"; L1="$2"; L2="$3"; L3="$4"; TT="$5"; SLUG="$6"; cd "$D"
node render.mjs cov "9999" 1 0.95 2>&1 | tail -1
python3 - "$L1" "$L2" "$L3" <<'PY'
import sys
from PIL import Image, ImageDraw, ImageFont
im=Image.open('cov/f9999.jpg').convert('RGB').resize((1080,1920),Image.LANCZOS)
d=ImageDraw.Draw(im); fp='/usr/share/fonts/opentype/inter/Inter-Black.otf'
def t(s,y,size,fill):
    while True:
        f=ImageFont.truetype(fp,size); w=d.textlength(s,font=f)
        if w<=960: break
        size-=6
    d.text(((1080-w)/2,y),s,font=f,fill=fill,stroke_width=12,stroke_fill=(1,24,57))
t(sys.argv[1],110,210,(255,255,255)); t(sys.argv[2],340,180,(255,210,90)); t(sys.argv[3],540,220,(255,255,255))
lg=Image.open('QV-logo.png').convert('RGBA'); lg.thumbnail((200,200)); im.paste(lg,(40,1700),lg); im.save('cover.png')
PY
python3 /home/user/sv/tools/cta_overlay.py frames work/words.json QV-logo.png VIRAL | tail -1
python3 - "$TT" <<'PY'
import sys
s=open('enc.sh').read().split('\n'); s=['T="%s"'%sys.argv[1] if l.startswith('T=') else l for l in s]; open('enc.sh','w').write('\n'.join(s))
PY
rm -f out/*.mp4; bash enc.sh 2>&1 | tail -1
cp out/*.mp4 final.mp4; cp final.mp4 /home/user/sv/deliver/$SLUG.mp4; ls -l /home/user/sv/deliver/$SLUG.mp4
mkdir -p chk && rm -f chk/*; for s in 0 3 8 14 20 27 33 40 46 53 58 63 68 73; do ffmpeg -v error -y -ss $s -i final.mp4 -frames:v 1 -vf scale=270:480 chk/f$(printf %02d $s).jpg; done; python3 sheet.py chk chk.jpg 7
