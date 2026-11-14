import sys, re, pickle, numpy as np
sys.path.insert(0,'.')
from roteiro import B
from kokoro_onnx import Kokoro
k=Kokoro('k.onnx','v.bin'); SR=24000
SPEED=float(sys.argv[1]) if len(sys.argv)>1 else 1.2
REPL=[("unslop","ânslóp"),("Codex","Côdecs"),("Antigravity","Antigráviti"),("Playwright","Plêiráit"),("Creative Commons","Criêitiv Cómons"),("emojis","emôjis"),("CleanYourTV","Clin iôr tivi"),("Android TV","Andróid tivi"),("Google TV","Gúgol tivi"),("Apple TV","Épol tivi"),("Android","Andróid"),("root","rút"),("Wi-Fi","uái fái"),("prompt","prômpti"),("Claude Code","Clód Côudi"),("MIT","ême i tê"),("Roku","Rôcu"),("backup","becápi"),(" LG"," éle gê"),("FMI","éfe êmi í"),("OfficeCLI","Ófis cê éle ai"),("PowerPoint","Páuer póint"),("Excel","Écsel"),("Word","Uórd"),("Apache","Apátchi"),("Office","Ófis"),("GitHub","Guitráb"),("tokens","tôkens"),("claude-mem","Clód mém"),("npm","ê ene pê ême"),("SQLite","ésse quiu éle áite"),("GitHub","Guitráb"),("hook","ruc"),("CLAUDE.md","Clód ponto êmi dê"),("SKILL.md","iskil ponto êmi dê"),("Markdown","márkdaun"),("Claude","Clód"),("skills","iskils"),("skill","iskil"),("Skills","Iskils"),("Skill","Iskil"),("pull requests","púl requésts"),("checklists","tchéklists"),("plugins","plâguins"),("plugin","plâguin"),("deploy","deploi"),("autocomplete","autocomplít"),("script","iscript"),("scripts","iscripts"),("benchmark","bênchmark"),("PR","pê érre"),("IA","i á"),(" API"," ê pi ai"),("MD","êmi dê"),("glob","glób"),("hooks","rucs"),("marketplace","márketplêis"),("upload","aplôude"),("diff","dif"),("issue","íchu"),("ponto m d","ponto êmi dê")]
def spoken(d):
    s=d.replace('*','')
    for a,b in REPL: s=s.replace(a,b)
    return s
import os
CACHE={}
if os.path.exists('tts.pkl'):
    for c,sg in pickle.load(open('tts.pkl','rb')):
        for p,a in sg: CACHE[p]=a
out=[]
for i,(c,d,v,sp) in enumerate(B):
    f=sp if sp else spoken(d)
    parts=[p.strip() for p in re.split(r'(?<=[.?!:])\s+',f) if p.strip()]
    segs=[]
    for p in parts:
        if p in CACHE: s=CACHE[p]
        else:
            s,_=k.create(p,voice='pm_santa',speed=SPEED,lang='pt-br')
            a=np.abs(s); idx=np.where(a>0.012)[0]
            s=s[max(idx[0]-int(.02*SR),0):idx[-1]+int(.05*SR)]
        segs.append((p,s))
    out.append((c,segs))
    if i%10==0: print(i,flush=True)
pickle.dump(out,open('tts.pkl','wb'))
tot=sum(len(s)/SR+0.14 for c,sg in out for p,s in sg)+0.1*len(out)
print('total aprox',round(tot,1),'s')
