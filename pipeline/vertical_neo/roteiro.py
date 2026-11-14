B=[]
def b(c,d,v,s=None): B.append((c,d,v,s))
H=lambda **k: dict(t='hero',**k)
# PLANO DE CENA: fala | objeto | câmera -> por quê | fundo
b("a","Sua *TV* está cheia de *anúncios*? Tem um projeto grátis que *limpa tudo*.",H(o='tvad',tt="TV *SEM ANÚNCIO*|DE *GRAÇA*",bg=3,s=1.25,cam=['push','pull']))            # push: mostrar o anúncio na tela
b("b","Ele se chama *CleanYourTV*, e já passou de *cinquenta e sete mil* estrelas no GitHub.",H(o='star',tt="*57 MIL* ESTRELAS",bg=7,n=57000,suf='+',cam=['up','push']))   # up: contador subindo
b("c","Foi o repositório *número um* da semana, em outubro.",H(o='trophy',tt="*Nº 1* DA SEMANA",bg=6,cam=['low']))                                                            # low: troféu maior
b("d","Funciona em qualquer TV com *Android TV* ou *Google TV*.",H(o='tv',tt="*ANDROID TV*|E GOOGLE TV",bg=8,cam=['pull','push']))                                          # pull: 'qualquer TV' = visão geral
b("e","Ele usa a mesma *depuração* que existe nos celulares Android.",H(o='phone',o2='plug',tt="MESMA *DEPURAÇÃO*",bg=5,x2=760,y2=1050,cam=['left','push']))                 # left: do celular para o conector
b("f","Primeiro, faz um *backup* da lista de aplicativos e das configurações.",H(o='folder',tt="1  *BACKUP*",bg=2,cam=['right']))                                           # right: passo 1 -> avança
b("g","Depois, *desativa* a telemetria, os serviços de anúncio e os aplicativos de fábrica.",H(o='toggle',o2='xmark',tt="2  *DESATIVA*",bg=0,x2=770,y2=1040,cam=['right','down']))  # down: desligar
b("h","Nada é *desinstalado*. Então dá pra *desfazer tudo* com um comando.",H(o='shield',o2='check',tt="DÁ PRA *DESFAZER*",bg=9,x2=760,y2=1050,cam=['pull','push']))        # push: segurança = ênfase
b("i","Por último, instala uma tela inicial *limpa*, parecida com a da Apple TV.",H(o='tvclean',tt="3  TELA *LIMPA*",bg=4,s=1.25,cam=['right','push']))                     # push: ver a tela nova
b("j","Não precisa de *root* nem de *cabo*: é tudo pelo *Wi-Fi*.",H(o='bolt',tt="SEM *CABO*",bg=1,cam=['low','pull']))
b("k","O passo a passo é feito por um *assistente de código*, como o Claude Code.",H(o='robot',o2='laptop',tt="A *IA* FAZ",bg=7,x2=770,y2=1060,cam=['left','push']))
b("l","Você liga a depuração na TV, clona o projeto e cola *um prompt*.",H(o='doc',o2='cursor',tt="COLA *1 PROMPT*",bg=5,x2=730,y2=1010,cam=['push','down']))
b("m","Segundo o projeto, leva cerca de *quinze minutos*.",H(o='clock',tt="*15* MINUTOS",bg=6,n=15,suf=' MIN',cam=['push']))
b("n","Atenção: em TVs *Samsung, LG e Roku*, ele *não funciona*.",H(o='tvoff',o2='xmark',tt="*NÃO* É PRA TODAS",bg=3,x2=760,y2=1040,cam=['pull','down']))
b("o","E vá com calma: você está mexendo nas *configurações da sua TV*.",H(o='gear',tt="COM *CALMA*",bg=8,cam=['low']))
b("p","O código é *aberto*, com licença *MIT*.",H(o='lock',tt="CÓDIGO *ABERTO*",bg=9,cam=['pull']))
b("q","Quer criar vídeos como esse? Comente *ARQUIVO* que vou te enviar a mesma *skill* que eu utilizo para criar vídeos assim,",H(o='bubble',o2='cursor',tt="COMENTE|*ARQUIVO*",bg=0,x2=740,y2=1020,cam=['push','pull','push']))
b("r","mas você precisa estar *me seguindo* para a mensagem chegar.",H(o='heart',o2='check',tt="*SEGUE* O PERFIL",bg=1,x2=760,y2=1050,cam=['low','push']))
