from geo_cams import *
B=[]
def b(c,d,v,s=None): B.append((c,d,v,s))
G=lambda **k: dict(t='geo',**k)
BR,AR,CO,CL,PE='Brazil','Argentina','Colombia','Chile','Peru'
# PLANO DE CENA (frase | elemento | câmera -> POR QUÊ | fundo): ver plano_reel05.md
b("a","O *Brasil* vale mais que *Argentina, Colômbia, Chile e Peru* juntos.",G(st=0,cams=[cam_side(BR,2.6,-25),cam_top(BR,2.3),cam_low(BR,3.2,15)],hl=[(BR,.3)],bars=[(BR,.45)],lab=[BR]))
b("b","São *dois trilhões e seiscentos e cinquenta bilhões* de dólares em dois mil e vinte e seis.",G(st=1,cams=[cam_push(BR,3.4),cam_orbit(BR,3.6,40),cam_low(BR,3.8,-30)],lab=[BR],ring=[BR]))
b("c","Em segundo vem a *Argentina*, com *setecentos e sessenta e oito bilhões*.",G(st=2,cams=[cam_top(AR,3.0),cam_low(AR,3.8,25),cam_push(AR,4.2)],hl=[(AR,.2)],bars=[(AR,.35)],lab=[AR]))
b("d","A *Colômbia* é a terceira, com *quinhentos e setenta e dois bilhões*.",G(st=3,cams=[cam_top(CO,3.6),cam_side(CO,4.2,-40),cam_push(CO,4.6)],hl=[(CO,.2)],bars=[(CO,.35)],lab=[CO]))
b("e","O *Chile* vem em quarto, com *quatrocentos e dois bilhões*.",G(st=0,cams=[cam_top(CL,2.8),cam_side(CL,3.4,70),cam_push(CL,3.8)],hl=[(CL,.2)],bars=[(CL,.4)],lab=[CL]))
b("f","E o *Peru* vem colado, com *quase quatrocentos bilhões*.",G(st=1,cams=[cam_top(PE,3.4),cam_orbit(PE,3.8,-40),cam_low(PE,4.0,10)],hl=[(PE,.2)],bars=[(PE,.4)],lab=[PE]))
b("g","A diferença entre os dois é de só *dois bilhões e seiscentos milhões*.",G(st=2,cams=[MID,cam_low(CL,3.6,-20),cam_low(PE,3.6,20)],lab=[CL,PE],arc=(CL,PE)))
b("h","O *PIB nominal* mede o tamanho da economia, não a renda de cada pessoa.",G(st=3,cams=[SA,cam_orbit(BR,2.4,30),cam_top(AR,2.2)],lab=[]))
b("i","Mas o *FMI* prevê uma *virada* para dois mil e vinte e sete.",G(st=0,cams=[cam_orbit(CL,3.4,-50),cam_top(PE,3.2),cam_side(CL,3.2,30)],ring=[PE,CL]))
b("j","O *Peru* deve passar o *Chile* e virar o *quarto maior* da América do Sul.",G(st=1,cams=[cam_side(PE,3.2,-30),cam_push(PE,4.2),cam_top(CL,3.0)],ov='race',rf='{:.1f}',rows=[('CHILE',413.4,(255,253,241)),('PERU',413.6,(1,251,180))]))
b("k","A diferença seria de apenas *cento e cinquenta milhões* de dólares.",G(st=2,cams=[MID,cam_orbit(PE,3.4,50),cam_low(CL,3.8,-40)],lab=[]))
b("l","Mas em *renda por pessoa*, o Chile segue com *quase o dobro* do Peru.",G(st=3,cams=[cam_push(CL,3.6),cam_low(CL,3.8,20),cam_top(PE,3.2)],ov='gauge',g0=11.78,g1=20.42,gf='{:.1f}',gl='PERU  >  CHILE  (US$ MIL)'))
b("m","O Chile divulga o *PIB do terceiro trimestre* em *dezoito de novembro*.",G(st=0,cams=[cam_top(CL,2.6),cam_side(CL,3.2,-60),SA],lab=[]))
b("n","Os dados são do *FMI*, do relatório de *outubro* de dois mil e vinte e seis.",G(st=1,cams=[cam_orbit(BR,2.2,-30),cam_top(AR,2.0),SA],lab=[BR,AR,CO,CL,PE]))
b("o","Quer criar vídeos como esse? Comente *ARQUIVO* que vou te enviar a mesma *skill* que eu utilizo para criar vídeos assim,",G(st=2,cams=[cam_orbit(BR,2.4,30),SA,cam_low(AR,3.0,50)],ov='cta2'))
b("p","mas você precisa estar *me seguindo* para a mensagem chegar.",G(st=0,cams=[cam_side(CO,2.6,-40),SA],ov='follow'))
