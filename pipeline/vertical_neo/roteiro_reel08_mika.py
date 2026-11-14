B=[]
def b(c,d,v,s=None): B.append((c,d,v,s))
H=lambda **k: dict(t='hero',**k)
# PLANO DE CENA: fala | objeto | câmera -> por quê | fundo (ordem diferente dos reels 6 e 7)
b("a","Essa IA *mexe no seu celular sozinha*, enquanto você *continua usando*.",H(o='phonebot',tt="A IA *USA* SEU|*CELULAR*",bg=8,s=1.25,cam=['push','pull']))        # push: olhar dentro do celular
b("b","Ela se chama *Mika*, é grátis e tem *mais de oito mil* estrelas no GitHub.",H(o='star',tt="*8 MIL* ESTRELAS",bg=3,n=8500,suf='+',cam=['up','push']))             # up: contador
b("c","Você fala *uma frase*, e ela abre os aplicativos, toca, digita e rola a tela.",H(o='bubble',o2='cursor',tt="*1 FRASE* BASTA",bg=9,x2=750,y2=1030,cam=['left','push']))  # left: da frase ao toque
b("d","Tudo acontece numa *tela escondida*, em segundo plano.",H(o='phone',tt="TELA *ESCONDIDA*",bg=7,cam=['pull']))                                                   # pull: plano de fundo
b("e","Ela enxerga a tela *como uma pessoa*, então funciona com *qualquer aplicativo*.",H(o='magnifier',tt="*QUALQUER* APP",bg=1,cam=['push','right']))
b("f","Por exemplo: pedir um *carregador barato*, bem avaliado.",H(o='plug',tt="*EXEMPLO*",bg=6,cam=['low']))
b("g","Ela coloca no *carrinho*, e *para antes de pagar*.",H(o='cart',o2='lock',tt="PARA *ANTES* DE PAGAR",bg=0,x2=770,y2=1050,cam=['right','down']))                    # down: freia
b("h","Senhas, códigos e *pagamentos* ficam sempre *com você*.",H(o='shield',o2='check',tt="*VOCÊ* DECIDE",bg=5,x2=760,y2=1050,cam=['push']))                        # push: ênfase na segurança
b("i","Também dá pra *agendar*: avisar todo dia às oito, só se for chover.",H(o='calendar',o2='clock',tt="TAREFAS *AGENDADAS*",bg=2,x2=770,y2=1050,s2=0.5,cam=['left','right']))
b("j","E ela *aprende*: transforma as tarefas que termina em *habilidades*.",H(o='bulb',tt="FICA *MELHOR*",bg=4,cam=['low','push']))
b("k","Segundo o projeto, *não existe servidor*: os dados ficam *no seu celular*.",H(o='lock',tt="DADOS *NO CELULAR*",bg=9,cam=['pull','push']))
b("l","Mas você conecta *seu próprio modelo* de IA, com a sua chave ou a sua conta.",H(o='chip',o2='plug',tt="SEU *MODELO*",bg=3,x2=770,y2=1050,cam=['right']))
b("m","Ou seja, o que a IA lê *vai para esse provedor*.",H(o='rocket',tt="VAI PRO *PROVEDOR*",bg=7,cam=['up']))                                                      # up: dado saindo
b("n","Pra instalar, baixe o aplicativo na página do projeto e conecte o modelo.",H(o='folder',o2='cursor',tt="*BAIXA* E CONECTA",bg=6,x2=740,y2=1030,cam=['left','push']))
b("o","Para controlar os apps, é preciso ativar a *depuração sem fio*, uma vez.",H(o='toggle',tt="DEPURAÇÃO *SEM FIO*",bg=1,cam=['push']))
b("p","É só para *Android*, e o código é *aberto*.",H(o='phonebot',o2='check',tt="SÓ *ANDROID*",bg=0,x2=770,y2=1050,cam=['pull']))
b("q","Vá com calma: é uma IA com *acesso aos seus aplicativos*.",H(o='gear',o2='xmark',tt="COM *CALMA*",bg=8,x2=760,y2=1040,cam=['low','down']))
b("r","Quer criar vídeos como esse? Comente *ARQUIVO* que vou te enviar a mesma *skill* que eu utilizo para criar vídeos assim,",H(o='bubble',o2='cursor',tt="COMENTE|*ARQUIVO*",bg=4,x2=740,y2=1020,cam=['push','pull','push']))
b("s","mas você precisa estar *me seguindo* para a mensagem chegar.",H(o='heart',o2='check',tt="*SEGUE* O PERFIL",bg=2,x2=760,y2=1050,cam=['up','push']))
