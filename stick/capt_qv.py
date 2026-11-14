"""Legendas dinâmicas palavra por palavra (ASS): cada palavra entra com pop (escala+fade) e troca a cada palavra.
uso: python3 capt.py work/words.json legenda.ass"""
import json,sys,re
words=json.load(open(sys.argv[1])); out=sys.argv[2]
def t(s): h=int(s//3600); m=int(s%3600//60); return f"{h}:{m:02d}:{s%60:05.2f}"
hdr="""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2

[V4+ Styles]
Format: Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,OutlineColour,BackColour,Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding
Style: P,Inter,86,&H00FFFFFF,&H00FFFFFF,&H00101010,&H80000000,-1,0,0,0,100,100,0,0,1,9,4,5,40,40,0,1

[Events]
Format: Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text
"""
ev=[]
for i,w in enumerate(words):
    s=w['s']; nxt=words[i+1]['s'] if i+1<len(words) else w['e']
    e=min(max(w['e'],s+0.18), nxt if nxt-w['e']<0.4 else w['e']+0.25)
    if e<=s: e=s+0.2
    txt=re.sub(r"[,;:]+$","",w['w']).upper().replace('{','').replace('}','')
    big=len(re.sub(r'\W','',txt))>=8 or any(c.isdigit() for c in txt)
    col="&H00B4FB01&" if big else "&H00FFFFFF&"
    # pop: começa 70% e menor, cresce a 112% e assenta em 100% (transição a cada palavra)
    fx=r"{\an5\pos(540,1290)\1c"+col+r"\fscx68\fscy68\alpha&HFF&\t(0,70,\fscx112\fscy112\alpha&H00&)\t(70,140,\fscx100\fscy100)\fad(0,60)}"
    ev.append(f"Dialogue: 0,{t(s)},{t(e)},P,,0,0,0,,{fx}{txt}")
open(out,'w',encoding='utf-8').write(hdr+"\n".join(ev)+"\n")
print(len(ev),'palavras')
