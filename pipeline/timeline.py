import sys, json, pickle, re, numpy as np, soundfile as sf
sys.path.insert(0,'.')
from roteiro import B
SR=24000; PAUSE=0.12; GAP=0.18
o=pickle.load(open('tts.pkl','rb'))
W_OVR={"1.536":12,"ARQUIVO":8,"IA":3,"SKILL.md":8,"name":6,"CLAUDE.md":8}
def wt(w):
    c=re.sub(r'[^\wÀ-ú.-]','',w).replace('*','')
    return W_OVR.get(c, max(len(c),2))+1
audio=[]; t=0.4; blocks=[]
for idx,((c,d,v,sp),(c2,segs)) in enumerate(zip(B,o)):
    dparts=[p.strip() for p in re.split(r'(?<=[.?!:])\s+',d) if p.strip()]
    if len(dparts)!=len(segs):
        # sem correspondência de frases: usa o texto inteiro como uma fala contínua
        dparts=[d]; s=np.concatenate([x[1] for x in segs]) if len(segs)>1 else segs[0][1]; segs=[(' ',s)]
    bstart=t; bw=[]
    for dp,(spk,s) in zip(dparts,segs):
        toks=dp.split(); flag=False; hl=[]
        for tk in toks:
            if tk.startswith('*'): flag=True
            hl.append(flag)
            if tk.rstrip('.,?!:;').endswith('*'): flag=False
        clean=[tk.replace('*','') for tk in toks]
        dur=len(s)/SR; wts=np.array([wt(x) for x in clean],float); cum=np.concatenate([[0],np.cumsum(wts)])/wts.sum()
        for i,x in enumerate(clean):
            bw.append(dict(w=x,hl=bool(hl[i]),s=round(t+cum[i]*dur,3),e=round(t+cum[i+1]*dur,3)))
        audio.append((t,s)); t+=dur+PAUSE
    blocks.append(dict(i=idx,c=c,v=v,s=round(bstart,3),e=round(t-PAUSE,3),words=bw)); t+=GAP
total=t+1.0
y=np.zeros(int(total*SR)+SR//2,np.float32)
for st,s in audio:
    i=int(st*SR); y[i:i+len(s)]+=s.astype(np.float32)
sf.write('voz.wav',y[:int(total*SR)],SR)
json.dump(dict(total=total,blocks=blocks),open('tl.json','w'),ensure_ascii=False)
print('total',round(total,2),'s',len(blocks),'beats')
