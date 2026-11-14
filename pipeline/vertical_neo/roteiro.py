B=[]
def b(c,d,v,s=None): B.append((c,d,v,s))
H=lambda **k: dict(t='hero',**k)
# PLANO DE CENA: fala | objeto | câmera -> por quê | fundo (ordem diferente dos reels 6-9)
b("a","Esse programa *grátis* promete baixar arquivos *cinco vezes mais rápido*.",H(o='download',tt="DOWNLOAD|*5X* MAIS RÁPIDO",bg=5,s=1.25,cam=['down','push']))                 # down: o arquivo desce
b("b","Ele se chama *Mister Download Manager*, e tem quase *nove mil* estrelas no GitHub.",H(o='star',tt="QUASE *9 MIL*",bg=2,n=8800,suf='+',cam=['up','push']))
b("c","É uma alternativa *aberta* ao *IDM*, que é pago depois de trinta dias.",H(o='coin',o2='xmark',tt="SEM *PAGAR*",bg=7,x2=770,y2=1050,cam=['pull','down']))
b("d","No teste do próprio projeto, um arquivo de *um giga* baixou em *um segundo*.",H(o='bolt',tt="*1 GB* EM 1 SEGUNDO",bg=6,cam=['low','push']))                                # low: impacto
b("e","No IDM, o mesmo arquivo levou *cinco segundos e meio*.",H(o='clock',tt="IDM: *5,5* SEGUNDOS",bg=3,cam=['pull']))
b("f","Atenção: esses números são *do projeto*, medidos no computador deles.",H(o='magnifier',tt="NÚMEROS *DO PROJETO*",bg=9,cam=['push']))                                   # push: olhar com cuidado
b("g","A janela é *parecida* com a que você já conhece: lista, categorias e progresso.",H(o='laptop',tt="JANELA *CONHECIDA*",bg=0,cam=['left','right']))
b("h","Ele se conecta ao *navegador*, com extensão para *Chrome e Firefox*.",H(o='plug',o2='cursor',tt="NO *NAVEGADOR*",bg=8,x2=750,y2=1030,cam=['left','push']))
b("i","Também baixa *torrent*: links magnéticos e arquivos ponto torrent.",H(o='magnet',tt="*TORRENT* TAMBÉM",bg=1,cam=['low']),"Também baixa tôrrent: links magnéticos e arquivos ponto tôrrent.")
b("j","Funciona em *Windows* e *Linux*. No Mac, ainda é *experimental*.",H(o='laptop',o2='check',tt="WINDOWS E *LINUX*",bg=4,x2=770,y2=1050,cam=['pull']))
b("k","Tem *oitenta e seis idiomas*, incluindo português.",H(o='bubble',tt="*86* IDIOMAS",bg=6,n=86,cam=['up']))
b("l","Sem *anúncio*, sem período de teste e sem *cadastro*.",H(o='shield',o2='check',tt="SEM *ANÚNCIO*",bg=5,x2=760,y2=1050,cam=['push']))
b("m","Tem até versão *portátil*, que roda direto de um *pen drive*.",H(o='folder',tt="VERSÃO *PORTÁTIL*",bg=7,cam=['right']))
b("n","Pra instalar, baixe o instalador na *página oficial* do projeto no GitHub.",H(o='download',o2='cursor',tt="PÁGINA *OFICIAL*",bg=2,x2=750,y2=1040,cam=['down','push']))
b("o","Cuidado com *cópias*: baixe só do repositório original.",H(o='lock',tt="SÓ DO *ORIGINAL*",bg=3,cam=['push']))
b("p","E use para baixar apenas o que você *tem direito* de baixar.",H(o='doc',o2='check',tt="COM *RESPONSABILIDADE*",bg=9,x2=760,y2=1050,cam=['pull']))
b("q","Quer criar vídeos como esse? Comente *ARQUIVO* que vou te enviar a mesma *skill* que eu utilizo para criar vídeos assim,",H(o='bubble',o2='cursor',tt="COMENTE|*ARQUIVO*",bg=8,x2=740,y2=1020,cam=['push','pull','push']))
b("r","mas você precisa estar *me seguindo* para a mensagem chegar.",H(o='heart',o2='check',tt="*SEGUE* O PERFIL",bg=0,x2=760,y2=1050,cam=['up','push']))
