B=[]
def b(c,d,v,s=None): B.append((c,d,v,s))
H=lambda **k: dict(t='hero',**k)
# PLANO DE CENA: fala | objeto | câmera -> por quê | fundo (ordem diferente dos reels 6-8)
b("a","Esse aplicativo usa IA pra te *ensinar qualquer coisa difícil*, do seu jeito.",H(o='book',tt="A IA QUE|*TE ENSINA*",bg=6,s=1.25,cam=['push','pull']))               # push: abrir o livro
b("b","Ele se chama *LearnHarness*, e já passou de *nove mil* estrelas no GitHub.",H(o='star',tt="*9 MIL* ESTRELAS",bg=0,n=9000,suf='+',cam=['up','push']))
b("c","Em vez de só *explicar*, ele descobre primeiro *o que você já sabe*.",H(o='magnifier',tt="1  *MEDE*",bg=9,cam=['push']))                                            # push: investigar
b("d","Suas respostas e o seu raciocínio mostram *por onde começar*.",H(o='bubble',o2='check',tt="POR ONDE *COMEÇAR*",bg=4,x2=760,y2=1050,cam=['left']))
b("e","Depois, ele monta um *plano*, do que você sabe até o seu *objetivo*.",H(o='graph',tt="2  *PLANEJA*",bg=7,cam=['pull','right']))                                    # pull: ver o mapa inteiro
b("f","Se o seu entendimento for diferente, o plano *se adapta*.",H(o='gear',tt="O PLANO *MUDA*",bg=1,cam=['right']))
b("g","Na aula, cada passo se apoia em algo que você *já entendeu*.",H(o='bulb',tt="3  *ENSINA*",bg=3,cam=['low','push']))                                               # low: ideia acende
b("h","Você *prevê*, recebe a explicação e *confere* se entendeu.",H(o='doc',o2='check',tt="PREVÊ E *CONFERE*",bg=8,x2=760,y2=1050,cam=['left','right']))
b("i","As confusões são *corrigidas* antes de seguir em frente.",H(o='shield',tt="SEM *BURACOS*",bg=2,cam=['push']))
b("j","Depois vem a *prática*: problemas variados, que se ajustam ao seu raciocínio.",H(o='trophy',tt="4  *PRATICA*",bg=5,cam=['low']))
b("k","Tudo que você aprende fica num *mapa de conhecimento*, que continua entre as sessões.",H(o='graph',o2='lock',tt="*MAPA* DO QUE SABE",bg=0,x2=770,y2=1060,cam=['pull','push']))
b("l","Dá pra anexar *PDFs e fotos*, e ele usa esse material na aula.",H(o='folder',o2='cursor',tt="SEUS *ARQUIVOS*",bg=9,x2=740,y2=1030,cam=['left','push']))
b("m","Funciona em *Mac, Windows e Linux*.",H(o='laptop',tt="*3* SISTEMAS",bg=6,cam=['pull']))
b("n","O aplicativo é *aberto* e não cobra assinatura, mas você usa *o seu modelo de IA*.",H(o='chip',o2='plug',tt="SEU *MODELO*",bg=4,x2=770,y2=1050,cam=['right','push']))
b("o","Então, o custo depende do *provedor* que você escolher.",H(o='coin',tt="CUSTO DO *PROVEDOR*",bg=3,cam=['down']))                                              # down: atenção ao custo
b("p","E os seus dados ficam guardados *no seu computador*.",H(o='lock',tt="DADOS *LOCAIS*",bg=7,cam=['push']))
b("q","Quer criar vídeos como esse? Comente *ARQUIVO* que vou te enviar a mesma *skill* que eu utilizo para criar vídeos assim,",H(o='bubble',o2='cursor',tt="COMENTE|*ARQUIVO*",bg=1,x2=740,y2=1020,cam=['push','pull','push']))
b("r","mas você precisa estar *me seguindo* para a mensagem chegar.",H(o='rocket',o2='check',tt="*SEGUE* O PERFIL",bg=8,x2=760,y2=1050,cam=['up','push']))
