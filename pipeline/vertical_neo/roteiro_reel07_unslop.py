B=[]
def b(c,d,v,s=None): B.append((c,d,v,s))
H=lambda **k: dict(t='hero',**k)
# PLANO DE CENA: fala | objeto | câmera -> por quê | fundo (ordem diferente do reel 6)
b("a","Seu site tem *cara de feito por IA*? Tem uma skill grátis que *conserta isso*.",H(o='uibad',tt="SEU SITE TEM|*CARA DE IA*?",bg=7,s=1.25,cam=['push','pull']))   # push: ver os defeitos da tela
b("b","Ela se chama *unslop*, e já passou de *quinze mil* estrelas no GitHub.",H(o='star',tt="*15 MIL* ESTRELAS",bg=1,n=15000,suf='+',cam=['up','push']))             # up: contador sobe
b("c","Funciona no *Claude Code*, no *Codex* e no *Antigravity*.",H(o='laptop',o2='robot',tt="*3* FERRAMENTAS",bg=4,x2=770,y2=1050,s2=0.5,cam=['left','right']))       # lateral: passar pelas três
b("d","Primeiro, ela faz uma *auditoria* e lista cada sinal de tela genérica.",H(o='magnifier',tt="1  *AUDITORIA*",bg=6,cam=['push']))                               # push: lupa = olhar de perto
b("e","Degradê *roxo*, brilhos, *emojis* nos botões e espaçamento torto.",H(o='uibad',o2='xmark',tt="OS *SINAIS*",bg=0,x2=770,y2=1040,cam=['push','down']))          # down: reprovar
b("f","Depois, ela define uma *direção* a partir do *seu produto*.",H(o='bulb',tt="2  *DIREÇÃO*",bg=9,cam=['low']))                                                    # low: ideia cresce
b("g","E propõe tudo *antes de editar*, pra você poder ajustar cedo.",H(o='bubble',o2='check',tt="VOCÊ *APROVA*",bg=3,x2=760,y2=1050,cam=['pull','push']))
b("h","Aí conserta a tela *em passadas*: espaçamento, cor, ícones e texto.",H(o='gear',tt="3  *PASSADAS*",bg=5,cam=['right','right']))                               # right: sequência
b("i","Depois vêm *tipografia, layout, detalhes* e movimento.",H(o='doc',o2='cursor',tt="ATÉ O *MOVIMENTO*",bg=2,x2=740,y2=1020,cam=['right','push']))
b("j","O resultado é uma interface *com personalidade própria*.",H(o='uigood',tt="TELA *COM CARA SUA*",bg=8,s=1.25,cam=['pull','push']))                            # push: revelar o depois
b("k","Se a tela já estiver boa, ela *avisa* e só sugere pequenos ajustes.",H(o='shield',o2='check',tt="NÃO *REFAZ* À TOA",bg=1,x2=760,y2=1050,cam=['low']))
b("l","Ela ainda cria um *vídeo curto*, de menos de dez segundos, com o antes e depois.",H(o='phone',tt="VÍDEO *ANTES E DEPOIS*",bg=7,n=10,suf=' S',cam=['push','pull']))
b("m","Pra instalar, é só *copiar a pasta* da skill para as suas skills.",H(o='folder',o2='cursor',tt="*COPIA* A PASTA",bg=6,x2=740,y2=1030,cam=['left','push']))
b("n","Depois, digite *barra unslop* e diga qual tela quer melhorar.",H(o='laptop',tt="*/UNSLOP*",bg=4,cam=['push']),"Depois, digite barra ânslóp e diga qual tela quer melhorar.")
b("o","Atenção: gerar imagens pode usar *serviços pagos*, e ela *pergunta antes*.",H(o='coin',o2='lock',tt="*PERGUNTA* ANTES",bg=3,x2=760,y2=1050,cam=['pull','down']))
b("p","A licença é *Creative Commons*: pode usar, desde que *dê o crédito* ao autor.",H(o='heart',tt="DÊ O *CRÉDITO*",bg=9,cam=['low']))
b("q","Quer criar vídeos como esse? Comente *ARQUIVO* que vou te enviar a mesma *skill* que eu utilizo para criar vídeos assim,",H(o='bubble',o2='cursor',tt="COMENTE|*ARQUIVO*",bg=5,x2=740,y2=1020,cam=['push','pull','push']))
b("r","mas você precisa estar *me seguindo* para a mensagem chegar.",H(o='rocket',o2='check',tt="*SEGUE* O PERFIL",bg=0,x2=760,y2=1050,cam=['up','push']))
