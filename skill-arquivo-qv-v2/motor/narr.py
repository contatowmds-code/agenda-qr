import re,json,numpy as np,soundfile as sf
from kokoro_onnx import Kokoro
SR=24000; GAP=0.2; LEAD=0.3
REPL=[("Starship","Istárchip"),("Starlink","Istárlinc"),("SpaceX","Ispêicis"),("Texas","Têcsas"),("skill","iskil"),("ARQUIVO","arquívo"),("Space ponto com","Ispêice ponto com")]
k=Kokoro('k.onnx','v.bin')
lines=[l.strip() for l in open('roteiro.txt',encoding='utf8') if l.strip()]
t=LEAD; words=[]; cues={}; chunks=[]
for li,ln in enumerate(lines):
    toks=ln.split(); hl=False; items=[]
    for tk in toks:
        m=re.match(r'^\{(\w+)\}(.*)$',tk); cue=None
        if m: cue,tk=m.group(1),m.group(2)
        if tk.startswith('*'): hl=True
        items.append((tk.replace('*',''),hl,cue))
        if tk.rstrip('.,?!:;').endswith('*'): hl=False
    spoken=' '.join(w for w,_,_ in items)
    for a,b in REPL: spoken=spoken.replace(a,b)
    s,_=k.create(spoken,voice='pm_santa',speed=(1.0 if li==0 else 1.12),lang='pt-br')
    a=np.abs(s); idx=np.where(a>0.01)[0]; s=s[max(idx[0]-int(.02*SR),0):idx[-1]+int(.06*SR)]
    d=len(s)/SR; w=np.array([max(len(re.sub(r'[^\wÀ-ú]','',x)),2)+1.2+(1.5 if x[-1:] in ',.?!:' else 0) for x,_,_ in items],float); cum=np.concatenate([[0],np.cumsum(w)])/w.sum()
    for j,(x,h,c) in enumerate(items):
        words.append(dict(w=x,hl=h,s=round(t+cum[j]*d,3),e=round(t+cum[j+1]*d,3)))
        if c: cues[c]=words[-1]['s']
    chunks.append((t,s)); t+=d+GAP
total=t+0.8
y=np.zeros(int(total*SR),np.float32)
for st,s in chunks: y[int(st*SR):int(st*SR)+len(s)]+=s
sf.write('voz.wav',y,SR); cues['end']=total; cues['teaser']=0.0
json.dump(dict(total=total,cues=cues,words=words),open('words.json','w'),ensure_ascii=False)
print('total',round(total,1),cues)
