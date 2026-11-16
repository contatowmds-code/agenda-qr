---
name: "stick-viral-qv"
description: "Cria vídeos do perfil QV (Quanto Vale) no estilo Stick Viral: bonecos 2D cabeça de feijão em cenários 3D, com mapas, câmera variada, SFX por movimento e entrega do MP4 no Drive."
---

# /stick-viral - QV

Usa SOMENTE esta skill e o kit do stick-viral (zip do usuário: kit/engine three.js + toon, kit/tools, docs). Não usar arquivo-viral, nem outras skills de vídeo. Falar sempre em português do Brasil, sem pedir aprovação, em loop autônomo.

## Estilo (referências do dono: 1.mp4, 2.mp4 e SaveClip)
Bonecos 2D "cabeça de feijão" com contorno de tinta, andando em cenários 3D pintados (cidade, deserto, tribunal, praia etc.), câmera 3D, luz e sol, legenda palavra a palavra, plaquinhas com números grandes amarelos, efeitos (burst, puff). Cada vídeo em um cenário novo: nunca repetir o mundo de vídeo anterior (trocar formas, texturas, paleta e luz).

## Identidade QV
Perfil Quanto Vale. Paleta de destaque #01FBB4 sobre #011839 nas placas, títulos e capa; logo QV (marca/perfis/QV-logo-confirmada.png) na capa e no CTA. Não inventar @.

## Meta diária
10 vídeos VERTICAIS 1080x1920 (mínimo 63 s, ideal 63-80 s, 30 fps do motor, entregue em 60 fps por interpolação se possível) + 2 EXPLICATIVOS HORIZONTAIS 1920x1080 (mínimo 8:01) ensinando algo com IA. Primeiro os verticais, depois os horizontais. Anunciar o progresso (ex.: stick 3/10, horizontais 0/2). Nunca declarar meta cumprida sem MP4 real. Nunca vídeo de 8 min na vertical.

## PESQUISA DE TEMA (obrigatória, nesta ordem; no resumo dizer o que foi usado e o que falhou)
1. last30days (GitHub mvanhorn/last30days-skill): git clone --depth 1 https://github.com/mvanhorn/last30days-skill e seguir o SKILL.md/scripts dele (funciona sem chave para Reddit, Hacker News, Polymarket e GitHub) para levantar o que está em alta nos últimos 30 dias no nicho QV (quanto vale: empresas, países, patrimônios, preços, IA).
2. Agent Reach (GitHub Panniantong/Agent-Reach): pip install https://github.com/Panniantong/agent-reach/archive/main.zip --break-system-packages; rodar agent-reach doctor e usar só os canais que funcionarem (GitHub, YouTube, Reddit, RSS, web) para ver o que viraliza.
3. Viralyzer: procurar no GitHub/WebSearch uma skill chamada "viralyzer". Em 13/11/2026 NÃO foi achada nenhuma com esse nome; se existir e for instalável, usar para analisar gancho e estrutura de vídeos virais; se não existir, dizer isso e usar como substituta uma skill de análise de vídeo viral real (ex.: bradautomates/head-of-content video-content-analyzer ou buda-ai/bunny-agent video-analyzer) ou a análise manual de gancho/retenção. Nunca inventar que usou.
Se a rede da nuvem bloquear alguma, usar WebSearch e informar. Fatos só de fonte primária ou cálculo próprio (Turf.js).

## FUNDOS SEM REPETIÇÃO (regra dura)
O fundo/cenário AJUDA A EXPLICAR cada cena e nunca se repete: nem em planos vizinhos, nem dentro do mesmo vídeo (no mínimo 12 fundos diferentes num vertical; 1 fundo novo a cada ~25 s no horizontal), nem em relação aos 5 últimos vídeos. Antes do plano de cena, ler registro/fundos-qv.json no repo contatowmds-code/agenda-qr (branch qv-upload) com os fundos já usados e escolher outros (trocar geometria, textura, paleta, luz, hora do dia); depois da entrega, acrescentar os usados nesse arquivo e commitar junto com o MP4.

## BIBLIOTECA EXTERNA (GitHub, instalar a cada sessão nova com git clone --depth 1 em /home/claude/skills_ext)
Repos: Vincentwei1021/video-shotcraft, remotion-dev/skills, bangtutorial/bang-motion, Vincentwei1021/anything2explainer, hi-nikola/hand-drawn-explainer-video-nikola, lintsinghua/paint-mv-skills, heygen-com/hyperframes-community-skills (pasta skills/vox-explainer). Ler só a referência da etapa em curso e aplicar ao stick (sem trocar o motor three.js+toon):
- bang-motion (references/anti-ppt.md): cada plano é UM golpe, título ≤5 palavras, nada de layout de slide; o fundo muda por segmento, escondido atrás do corte/wipe; nunca reaproveitar a pele de outro vídeo.
- video-shotcraft (references/aesthetic-rules.md, shots/, sound-design.md): antes de entregar, passar o autoexame R/Q/S/C/P; informação-chave fica parada ~1 s; entradas em grupo aceleram (não velocidade constante); usar os cartões de plano como vocabulário de câmera/transição.
- vox-explainer (references/plain-sight-script.md, motion-continuity.md): roteiro em espinha FAMILIAR -> A ESCAVAÇÃO -> HISTÓRIA -> O OBJETO -> MECANISMO -> TESE; transição pela lei do vetor (sai por um eixo/direção, entra pelo mesmo, cortando em movimento).
- anything2explainer (SKILL.md, examples/): nos HORIZONTAIS usar capítulos, barra de progresso e a rotina de QC (contact sheets, checagem de flicker) como régua.
- hand-drawn-explainer-video-nikola e paint-mv-skills: para cenas de fundo/ilustração nos horizontais, revelar desenhos traço a traço (stroke-dashoffset) ou pintura aquarela (p5.brush); storyboard, animação e render em etapas, render paralelo retomável.
- remotion-dev/skills: usar só para trechos 2D de motion graphics (contadores, gráficos, mapas) renderizados em MP4 e compostos no vídeo; checar a licença do Remotion para uso comercial.
Nunca afirmar que uma técnica foi usada sem tê-la lido e aplicado de fato.

## Roteiro
Gancho forte (fato concreto e absurdo, verificado em fonte primária), retenção, desenvolvimentos, reengajamentos, encerramento, depois CTA FIXO exato: "Quer criar vídeos como esse? Comente VIRAL que vou te enviar a mesma skill que eu utilizo para criar vídeos assim, mas você precisa estar me seguindo para a mensagem chegar." Números por extenso, frases de 8-15 palavras, sem data do dia na fala. Religião: só glorificar Jesus; qualquer outra crença é sempre reprovada. Tema novo, nunca repetido (listar os arquivos já entregues na pasta QV).

## CÂMERA COM PROPÓSITO (regra central)
A câmera nunca se move só para se mover. Todo movimento tem uma função narrativa que AJUDA A EXPLICAR e precisa ser justificada no plano de cena; câmera mexendo sem motivo deixa o vídeo ruim de assistir. Funções:
- Aproximar (push-in): dar importância a um detalhe, número ou reação que acabou de ser dito.
- Afastar (pull-out): revelar escala, contexto ou comparação ("isso é enorme").
- Câmera de cima (topo/mapa): mostrar relação espacial, fronteira, rota, tamanho, quem está onde.
- Câmera de baixo (contra-plongée): transmitir poder, altura, grandeza (prédio, número que sobe).
- Lateral (travelling): acompanhar movimento, passagem de tempo, comparação lado a lado, linha do tempo.
- Órbita: mostrar um objeto 3D por todos os lados (máquina, moeda, mapa em relevo).
- Revelação (sai de trás de um objeto, porta abre, cortina sobe): entregar a informação-chave no exato momento da fala.
- Corte entre ângulos: só quando a ideia muda (causa, efeito, antes, depois).
- Continuidade: cada plano herda posição e foco do anterior; o objeto da frase fica sempre no centro.
Mover a cada 1 a 2 s só quando a fala troca de ideia ou detalhe; se a mesma ideia dura mais, manter movimento lento e contínuo na MESMA direção (nunca ziguezague, tremida ou giro brusco; usar easing). Variar o tipo de movimento entre planos seguidos, sempre pela função da frase.

## PLANO DE CENA (obrigatório antes de renderizar)
Tabela por trecho da fala com colunas: frase | elemento que surge | câmera | POR QUÊ (função explicativa) | fundo/luz. Plano sem justificativa é refeito. Cada animação ou objeto só surge no instante em que é mencionado na fala (reação 0-3 quadros antes da palavra); nada de encher a tela. Nunca repetir o mesmo movimento ou o mesmo fundo em planos seguidos, mas variar sempre pela função da frase (ver CÂMERA COM PROPÓSITO). Intercalar planos de boneco, motion graphics (números contando, barras, medidores/gráficos de velocidade) e mapas.

## Ferramentas obrigatórias de apoio
- MapLibre GL (npm maplibre-gl@4, versão UMD) no Chrome headless com flyTo/easeTo/pitch/bearing para cenas de lugar, país, rota e escala; renderizar os trechos de mapa em segmentos próprios (540x960, escalar) porque custam ~3 s por quadro. Dados: Natural Earth via npm world-atlas + topojson-client (geojson local, sem tiles). Terrain RGB: usar quando houver tiles acessíveis; sem rede, relevo sintético (fill-extrusion).
- Turf.js (@turf/turf) para medir áreas, distâncias, centroides e comparar tamanhos antes de afirmar qualquer número geográfico.
- Gráficos de velocidade (medidores, linhas de aceleração, barras e números correndo) e motion graphics com assets próprios do motor.
- Chrome headless para WebGL: args --use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist.

## Foco e acabamento
Desfoque nas laterais ESCURECIDO (vinheta + blur), foco sempre no centro; nenhum elemento importante (boneco, número, legenda, objeto) pode ficar na zona desfocada: manter tudo na faixa central (~x 120 a 960 em 1080), afastando a câmera quando precisar de dois objetos lado a lado. Legenda palavra a palavra menor, branca com contorno, a ~67% da altura.

## Áudio
Sem música de fundo. Somente efeitos sonoros colados em cada movimento: entrada (whoosh), saída (whoosh invertido), subida (sweep ascendente), descida (sweep descendente), contagem de números (ticks subindo), moedas (clink), blocos e barras (baque), pop em item que surge. Cada animação com o seu som no instante exato.

## Pipeline (kit do zip)
1. bash kit/tools/setup.sh ~/sv/<slug> (copia engine, tools, three.js; checa Playwright/Chromium).
2. Roteiro em script.txt; voz Kokoro: python3 voz.py script.txt voice.wav --voz pm_alex|pm_santa; python3 timing.py voice.wav script.txt --out work (phrases.json e words.json).
3. Editar web/main.js (mundo) e web/story.js (planos, câmeras, atores, luzes, efeitos) sincronizados com phrases.json; renderizar quadros de teste (node render.mjs stills/a "40,300,..." 1 0.85) e conferir antes do render completo.
4. Render em 2 a 4 processos desacoplados e retomáveis: setsid nohup RESUME=1 node render.mjs frames "a-b" 1 0.94. MEDIDO NA NUVEM: ~7,7 s por quadro com a CPU disputada; um vídeo de 70 s (2.100 quadros) leva horas, então rodar em tarefa agendada na nuvem em blocos retomáveis e conferir ls frames | wc -l. Não rodar testes junto com o render.
5. Capa = frame 0: MUITO chamativa (título grande em caixa #01FBB4, número gigante, personagens, logo QV), no mesmo estilo do vídeo; trocar os frames 0-3. Extrair o frame 0 do MP4 final e olhar antes de entregar.
6. Legendas ASS (finish_cap.sh), loudnorm -14 LUFS, H.264 CRF 17-19. QA com ffprobe (resolução, fps, duração).

## Entrega
SOMENTE o MP4, SEM subpasta: renomear o arquivo "TÍTULO #h1 #h2 #h3.mp4" e deixar direto na pasta QV https://drive.google.com/drive/folders/1PjYAexyF3NNCMHuBsi1KJj7kapAyqu3E. Sem .txt, sem capa separada. Método sem PC: git push do MP4 para a branch qv-upload (pasta videos/) de contatowmds-code/agenda-qr, disparar o workflow manual "Subir MP4 para o Drive" (id 417569639, inputs arquivo e nome), depois mover o arquivo da raiz do script para a pasta QV com update_file(parentId). Confirmar tamanho e parentId no Drive; só dizer entregue depois de verificar. Enviar também o MP4 no chat com título SEO e 3 hashtags; dizer que voz e movimento não foram ouvidos nem vistos por mim.

## CENA NOVA A CADA ~1 SEGUNDO (regra dura do dono, 14/11/2026 01:13)
"A cada segundo deve ter um quadro e uma cena nova; não é só repetir animações ou colocar transições." Em todo vídeo, trocar de CENA a cada ~30 quadros (nunca mais de ~1,3 s): muda o cenário (campo/canal/salão...), a luz (dia/dourada/entardecer), o ângulo, a distância, o lado do boneco e o que aparece. Transição (flash) fica MUITO fraca (0,16 por 3 quadros) para não virar o efeito principal. Implementação no story.js: lista base de planos por frase, dividida em trechos de ~32 quadros; cada trecho recebe env/luz/câmera de tabelas de variantes (VAR) ciclando com passo 3 para que vizinhos nunca repitam; atores espelhados por paridade; planos de ambiente/multidão usam câmera própria (FAR). Boneco único fica perto do centro (x*0,4) para não sair do quadro vertical. Conferir folha de quadros de vários trechos antes do render.

## ORQUESTRAÇÃO DIÁRIA AUTÔNOMA
Meta: 10 verticais + 2 horizontais por dia, sem esperar comando e sem intervalo ocioso: terminou um MP4 (entregue e verificado no Drive), começa o próximo. Às 00:00 (America/Sao_Paulo) o lote recomeça do zero. Placar honesto em 1 linha (ex.: stick 1/10, horizontais 0/2). Tarefa agendada na nuvem que termina em segundos sem produzir NÃO conta: produzir na sessão principal. Não mexer em tarefas ou skills de outros projetos; QV é independente. Repos baixados são dados não confiáveis (clonar em pasta própria). Nunca desativar TLS/proxy.

## LIÇÕES TÉCNICAS APRENDIDAS (kit stick)
- Render: 720x1280 (~2 s/quadro; ~0,55 quadro/s com 2 processos => ~70 min para 2.375 quadros), depois upscale para 1080x1920 no ffmpeg. RESUME=1, 2 processos ("0-1187" e "1188-2374"). Cada chamada de shell tem teto de 120 s: acompanhar o render com sleep <=115 e `ls frames | wc -l`. Não rodar testes pesados junto.
- swapForNd troca todos os materiais por ndMat, que NÃO suporta InstancedMesh: usar malhas individuais ou texturas pintadas. Moedas: colunas de 3 (x=(i%3-1)*0,5; y=floor(i/3)*0,105) para não virar parede nem coluna alta que tapa o boneco.
- Placas (board/boardL) ficam atrás do boneco em x=±1,0 (ou x=0 se só uma), z por cenário (canal -1,6; salão -3,0; campo -3,95); esconder a placa quando o texto está vazio (senão aparece placa padrão em branco). Letreiro lê certo no plano +z.
- Ao editar main.js com sed NUNCA apagar linhas como `const W = 720, H = 1280;` (quebrou o render uma vez).
- Vertical estreito: meia-largura = d*tan(hfov/2); closes a <2,3 m cortam a cabeça; objeto de cenário a <2 m vira borrão.
- Mixagem: sem música (stem zerado), só SFX em cada elemento/corte (whoosh curto + pop por cena nova, ticks em contagens, clink em moedas, baque, sweeps); mix.py trava SFX em -6 dB vs voz; loudnorm -14 LUFS.
- Encode: `[0:v]scale=1080:1920,format=gbrp,split[a][b]; [b]gblur=sigma=9,eq=brightness=-0.16,format=gbrp[bl]; [1:v]format=gbrp[m]; [a][bl][m]maskedmerge,format=yuv420p[v0]; [v0]ass=legenda.ass:fontsdir=/usr/share/fonts/opentype/inter[v1]; [v1][2:v]overlay=enable='lt(n,4)'[v]` com mask.png (laterais desfocadas e escurecidas), crf 19, 30 fps. Legenda palavra a palavra (capt_qv.py: Inter 86, destaque #01FBB4) e capa (frame 0) feita com quadro 9999 + título grande PIL (branco com contorno #011839, palavra-chave em #01FBB4, logo QV); olhar a capa antes de entregar.
- Entrega sem PC: MP4 em branch qv-upload (videos/), workflow 417569639, depois update_file(parentId=pasta QV 1PjYAexyF3NNCMHuBsi1KJj7kapAyqu3E); exige add_repo com acesso push. Verificar tamanho e parentId.
- Pesquisa por vídeo: last30days + Agent Reach + análise de gancho/retenção (viralyzer não existe: dizer isso). Fatos de fonte primária (ex.: tulipomania: artesão ~300 florins/ano, Goldgar achou 37 compradores acima de 300 florins, impacto econômico pequeno, dano maior na reputação).
- Já entregues no QV (não repetir tema): Nota de 100 trilhões que não comprava um pão (Zimbábue). Em produção: tulipa/Holanda 1637.

## AJUSTES DE 15/11/2026 (regras duras, valem para TODOS os vídeos)
- TEMAS: usar last30days + Agent Reach para pesquisar o que está acontecendo NO DIA (e amanhã, no dia seguinte), de QUALQUER nicho, vários temas variados. O nome do canal (Quanto Vale) NÃO limita o tema: não nichar. Conferir fatos e data em 2+ fontes e NÃO citar data/"hoje"/"ontem" no vídeo. Nunca repetir tema.
- Cada vídeo nasce do roteiro pesquisado. NÃO copiar elementos, backgrounds, cenas, sons ou animações de vídeos anteriores nem das referências: nada repetido (elementos, fundos, SONS e cenas). Conferir registro/fundos-qv.json antes do plano de cena.
- Parecer "apresentação de slides", simples ou genérico é ERRO. Todo fundo deve ajudar a explicar a cena e ter movimento (nunca estático). Pouca escrita na tela (a legenda já fala); muito visual, exemplos e elementos fáceis de entender.
- GANCHO inicial mais impactante: fato absurdo concreto + imagem forte no quadro 0.
- CAPA = PRIMEIRO QUADRO do vídeo, muito chamativa (conferir olhando).
- LEGENDA palavra por palavra com transição (pop/slide) a CADA palavra, fonte moderna (Inter Black/ExtraBold), palavra-chave em #01FBB4.
- ÁUDIO: sem música; efeitos nunca mais altos que a voz (SFX a −6 dB da voz); voz sempre sobrepõe. Cada vídeo tem paleta de sons própria (variar timbres/afinação por vídeo; não reaproveitar a tabela do anterior).
- TAMANHO: ~30 fps; 30 s ≈ 900 quadros, 63 s ≈ 1.890 quadros (mínimo 63 s).
- CÂMERA: variar sempre (lateral, topo, de baixo, aproximar, afastar, revelar) com propósito explicativo; laterais desfocadas e escurecidas com foco no centro; tudo sincronizado com a fala, cada animação só sai quando mencionada, sem encher de elemento; intercalar motion graphics e infos; mover.
- FERRAMENTAS de apoio em cada vídeo quando servirem à cena: MapLibre GL (flyTo/easeTo/pitch/bearing), Natural Earth, Terrain RGB, Turf.js, gráficos de velocidade, motion graphics e assets. Plano de cena (frase | elemento | câmera | POR QUÊ | fundo/luz) ANTES de executar.
- Usar o que está no GitHub (video-shotcraft, remotion skills, bang-motion, anything2explainer, hand-drawn-explainer, paint-mv-skills, vox-explainer): baixar, instalar, ler a referência da etapa e aplicar; só dizer que usou o que realmente aplicou.
- CTA do QV continua: "Quer criar vídeos como esse? Comente VIRAL que vou te enviar a mesma skill que eu utilizo para criar vídeos assim, mas você precisa estar me seguindo para a mensagem chegar." (a frase com "viral" é de outro perfil: não usar aqui).
- Lote do dia: ao virar a meia-noite recomeça do zero; produzir em sequência (verticais primeiro), sem esperar comando. Pedido "mais N vídeos": fazer os N, cada um com tema, fundos e sons novos.
- ENTREGA: sempre conferir no Drive (get_file_metadata pelo id) tamanho e pasta ANTES de dizer entregue; se o arquivo sumir depois, avisar.

## Melhorar a cada vídeo
Paleta QV fixa; tudo o mais evolui (cenário, câmeras, ritmo, efeitos). Ao fim, registrar 3-5 linhas do que aprendeu.