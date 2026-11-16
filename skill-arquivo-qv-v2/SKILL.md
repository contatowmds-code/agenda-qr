---
name: arquivo-qv-v2
description: "Produz UM vídeo vertical do perfil QV (Quanto Vale) por execução: pesquisa o tema do momento, escreve roteiro, renderiza em 3D com câmera dirigida pela fala, mixa áudio, entrega o MP4 no Drive e recomeça do zero para o próximo. Use quando o usuário pedir 'arquivo qv', 'cria um vídeo do QV', ou numa rotina diária (06:00 America/Sao_Paulo)."
---

# arquivo-qv-v2 — Produtor autônomo do perfil QV

## Regra de ouro do ciclo (pedido do usuário)
**Cada vídeo é um ciclo completo e independente: pesquisar o tema NAQUELA HORA → roteiro → plano de cena → render → áudio → conferência → entrega no Drive → só então recomeçar.** Nunca pesquisar vários temas de uma vez. O tema do vídeo seguinte é pesquisado do zero, no momento em que ele começa (podem ter passado horas e a notícia mais forte ser outra).

Meta por dia (America/Sao_Paulo): 10 verticais (mín. 63 s) e 2 horizontais explicativos (mín. 8:01) — verticais primeiro. Contar o placar real; nunca declarar meta cumprida sem os MP4 no Drive. Se não der para continuar, dizer quantos faltam.

## Identidade QV
Fundo #011839, destaque #01FBB4, logo `motor/logo.png` sem recolorir (é "QUANTO VALE?"). @ do perfil: desconhecido, não inventar. Sem religião. Nunca repetir tema que NÓS já produzimos (manter lista em `docs/temas-feitos.md` e conferir o Drive). Já existirem vídeos de outros canais sobre o mesmo tema NÃO importa (instrução do usuário em 2026-11-16): não descartar um tema por isso.

## Passo 1 — Pesquisa (por vídeo)
1. Rodar last30days: `python3 skills/last30days/scripts/last30days.py "<tema>" --emit=compact` com `LAST30DAYS_ALLOW_ENGINE_PLAN=1` (repo github.com/mvanhorn/last30days-skill). Agent-Reach (github.com/Panniantong/Agent-Reach) para fontes extras. **Aviso verificado:** nesta rede Reddit dá 403 e não há chave Brave/Serper; o last30days rende pouco. Usar WebSearch (modo extended) como principal para notícias do dia, em qualquer nicho.
2. Escolher UM tema do dia que ainda não foi feito. Conferir fato e DATA em 2+ fontes (fonte primária). Quando as fontes divergem, dizer "segundo X" ou "relatos diferentes" no roteiro; nunca afirmar o que não foi confirmado.
3. Registrar tema + fontes em `docs/temas-feitos.md`.

## Passo 2 — Roteiro (`motor/roteiro.txt`)
- Frases COMPLETAS e corridas, com concordância (a narração é sintetizada frase a frase inteira; nunca fragmentos colados). ~190-210 palavras = 63-75 s.
- Marcadores de foco `{nome}` antes da palavra que a câmera deve focar (ex.: `{lift}decolou`). `{teaser}` no início e `{imp}` na palavra do impacto do gancho. Para o CTA usar `{cta}`, `{cmt}`, `{seg}`, `{msg}`.
- Estrutura viral: (0-3 s) gancho forte já visualmente impactante + frase de abertura curta e enfática com "!" ("Isso nunca tinha acontecido!") → o que aconteceu → como/por quê (revelação nova a cada ~5 s) → por que importa → ressalva honesta → CTA.
- CTA EXATO, falado e na tela: "Quer criar vídeos como esse? Comente ARQUIVO que vou te enviar a mesma skill que eu utilizo para criar vídeos assim, mas você precisa estar me seguindo para a mensagem chegar." Na tela: comentário "ARQUIVO" digitado com a logo como avatar → perfil com a logo → cursor clica em "Seguir" → "Seguindo ✓" → envelope "Mensagem recebida".

## Passo 3 — Plano de cena (escrever ANTES de renderizar; comentário no topo do world.js)
Tabela: palavra-foco | o que aparece | câmera (alvo, distância, azimute, elevação, curva) | por quê | fundo. Toda cena tem mapa palavra → foco.

## Passo 4 — Mundo 3D (`motor/world.js`, three.js + Chromium/Playwright)
`world.js` (Starship, cenário terrestre) e `voyager_exemplo2.js` (espaço profundo: sistema solar em escala, pulso de luz, pacote ida e volta, Terra noturna com luzes em Morse, `Line2` para linhas grossas) são as implementações de referência; `audio2.py`/`audio_voyager.py` mostram o mapeamento cue→SFX. Para abrir um mundo específico: `world.html?w=/voyager.js`. **Para cada novo tema, reescrever o mundo** (objetos, cenários, paleta) reaproveitando as peças: `setT(t)` determinístico, câmera por keyframes `K` (cue, dt, alvo, dist, az, el, fov, duração), curvas Bézier (`EASE`: suave, rápida-na-entrada, overshoot, arranque-lento — ideia do editor de curvas de velocidade), roll, tremor, paleta por trecho (`PAL`), legenda, HUD, CTA.
Regras visuais (todas vieram de reclamações do usuário):
- **Cores com sentido físico**: céu azul de dia, mar azul, espaço preto/azul, plasma laranja só no objeto aquecido, infográfico em azul-marinho. NUNCA rosa/amarelo/neon sem motivo, nada "lavado"/branco estourado. Sem bloom forte, sem filtro de saturação, sem vinheta preta, sem névoa branca.
- **Fundo explica a cena** e nunca atrapalha; variar cenário a cada trecho (como na troca para a Terra/espaço, que o usuário elogiou) — não ficar no mesmo cenário o vídeo todo. Nada sem sentido (ex.: moedas no mar). Para conceitos abstratos usar infográfico (barras, setas, ciclos) sobre fundo de diagrama.
- **Câmera dirigida pela fala**: quando a palavra é dita a câmera vai até o foco (aproxima, gira, muda altura/ângulo), objeto principal sempre CENTRALIZADO e INTEIRO (nunca cortado), acima da legenda; ao fechar a ideia abre para o plano geral. Variar: lateral, de cima, de baixo, aproximar, revelar, roll. Sem cortes secos a cada 1 s (isso atrapalhou); corte só na mudança de assunto, com transição diferente de todas as outras.
- Cada animação só aparece quando é mencionada; pouco texto na tela (HUD de 1-3 palavras/símbolos); legenda faz o texto.
- Sem desfoque pesado nas laterais (atrapalhou). Sem repetir elementos/transições/sons.
- **Gancho**: o quadro 0 já é a capa (título inteiro + objeto em ação), o impacto visual cai na palavra `{imp}` (flash, onda de choque, tremor, título "bate"). Extrair e olhar o frame 0.
- **Legenda**: palavra por palavra, Montserrat 900, 108 px, largura máx. 760 px (auto-ajuste), 8 transições de entrada curtas (≤60 px de deslocamento) sem repetir a anterior, contorno por text-shadow (sem -webkit-text-stroke, deixa riscos). Palavras longas NUNCA podem sair cortadas — testar "SEXTA-FEIRA," e a palavra mais longa do roteiro com `node shot.js`.

## Passo 5 — Áudio (`narr.py`, `audio2.py`)
- Voz Kokoro `pm_santa` (speed 1.0 no gancho, 1.12 no resto), pronúncias em `REPL` de narr.py. Limitação conhecida: entonação plana; compensar com frases curtas, '!' no gancho e velocidade 1.0 na primeira frase. NÃO usar ElevenLabs (decisão do usuário).
- Sem música. SFX sintetizados e DIFERENTES por evento (sincronizados nas marcas de foco) + um swoosh por movimento de câmera. **SFX NUNCA sobrepõem a voz**: sidechain forte (−20 dB com voz), banda 60 Hz–9 kHz, nível geral ≤ 0,5× RMS da voz; `audio2.py` imprime a razão voz/SFX na fala (alvo ≥ 15 dB; o último vídeo deu 18,7 dB).

## Passo 6 — Render e conferência
`motor/setup.sh` (1x por sessão) → `python3 narr.py` → editar/gerar world.js → `python3 audio2.py` → `node shot.js <tempos>` e OLHAR os quadros (capa, legendas longas, CTA) → render em 4 processos: `for k in 0 1 2 3; do (setsid nohup node render.js $k 4 > r$k.log 2>&1 &); done` (≈20 min para 2.200 quadros a 30 fps; `FPS=60` dobra o tempo) → `ffmpeg -framerate 30 -i frames/f%05d.jpg -i mix.wav -c:v libx264 -crf 20 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest out.mp4`. Conferir com ffprobe: 1080x1920, duração ≥ 63 s. Se um worker de render falhar, ele deixa lacuna: contar os quadros (`ls frames | wc -l`) e religar só o que faltou.
Observação: o pedido original diz 60 fps; o usuário também pediu "~900 quadros por 30 s" (= 30 fps). DECISÃO DO USUÁRIO (2026-11-16): **60 fps** é o padrão (`FPS=60 node render.js ...`; ~40 min de render por vídeo de 80 s). Voz: usar só ferramentas GRATUITAS (Kokoro); NÃO usar ElevenLabs (estoura o limite). Quando o usuário disser 'continue', continuar sem perguntar e decidir sozinho.

## Passo 7 — Entrega (método VERIFICADO em 2026-11-16)
- Pasta QV do Drive: id `1PjYAexyF3NNCMHuBsi1KJj7kapAyqu3E`. Subir SOMENTE o MP4, direto na pasta, sem subpasta, sem .txt/capa. Nome: `TÍTULO #hashtag1 #hashtag2 #hashtag3.mp4` (sem ":" no título).
- O conector Drive `create_file` só aceita até **10 MB** (base64Content = `sha256:<hash>:<caminho>`), então para o MP4 completo usar o método do repo:
  1. `mcp__claude-code-remote__add_repo` {owner:contatowmds-code, repo:agenda-qr, access:push} (o usuário aprova).
  2. `git clone --depth 1 --branch qv-upload --single-branch https://github.com/contatowmds-code/agenda-qr /home/user/agenda-qr` (timeout ~10 min; repo ~860 MB).
  3. `cp video.mp4 videos/<slug>.mp4`; `git add -f`; commit; `git -c push.negotiate=true push origin qv-upload` (limite 100 MB/arquivo).
  4. `gh api -X POST repos/contatowmds-code/agenda-qr/actions/workflows/417569639/dispatches -f ref=main -f 'inputs[arquivo]=videos/<slug>.mp4' -f 'inputs[nome]=<TÍTULO #h1 #h2 #h3>.mp4'`; esperar `gh api repos/.../actions/runs/<id>` = completed/success (~2 min).
  5. `search_files` com `parentId = '1tPiMtGGzyESOgy_wN1_T_EnDeNt-yx_I' and title contains '<palavra>'` e `update_file` com `parentId=1PjYAexyF3NNCMHuBsi1KJj7kapAyqu3E` e o título final.
  6. Conferir `fileSize` igual ao arquivo local e `parentId` = pasta QV. Se algo falhar, dizer que NÃO foi entregue.
- No chat: cópia leve ≤ 30 MB (`-vf scale=540:960 -crf 28`), texto de postagem (título, 3 hashtags, fontes, resumo) e placar (verticais n/10, horizontais n/2).

## Honestidade
Não ouvir/assistir os vídeos: dizer que só foram conferidos quadros, duração e razão voz/SFX. Citar a fonte de cada fato. Não afirmar o que as fontes não confirmam.

## Lições registradas (não repetir erros)
1. Vídeo v1 em cartões 2D parecia "slides": abandonado; usar mundo 3D contínuo.
2. Cortes de 1 s e desfoque lateral atrapalharam; vinheta preta escureceu demais.
3. Cores sem lógica (rosa/amarelo) e brilho estourado confundiram; cores físicas coerentes.
4. Narração por fragmentos soa picotada e sem concordância; usar frases completas.
5. Legendas grandes/animadas saíam cortadas; tamanho fixo pequeno + auto-ajuste + animações curtas.
6. SFX altos cobriam a voz; sidechain forte e nível baixo.
7. Elementos sem sentido (moedas no mar, piso quadriculado) foram rejeitados.
8. CTA só com a palavra ARQUIVO não bastou; usar a logo + cursor clicando em Seguir.
9. O artifact H2ECMZ… é um editor de curvas de velocidade (sem código de câmera); a ideia foi aplicada como curvas Bézier de easing por movimento.
10. Ferramentas do GitHub citadas (video-shotcraft, bang-motion, anything2explainer, hand-drawn-explainer, paint-mv-skills, vox-explainer, Remotion) foram clonadas mas pouco aproveitadas; MapLibre/Natural Earth/terrain-RGB/turf.js NÃO foram usados (mapas só quando o tema pedir). Em caso de dúvida, consultar os SKILL.md desses repos.

## Ajustes pendentes descobertos no vídeo 2
- Composição: `cam.setViewOffset(W,H,0,H*0.07,W,H)` deixa o objeto alto demais e sobra espaço vazio embaixo; usar ~0.03 para centralizar melhor (aplicar já a partir do vídeo 3).
- Distâncias gigantes: interpolar a distância da câmera em escala logarítmica (feito no voyager).
- Linhas finas somem em escala grande: usar Line2/LineMaterial (linewidth em px).
- Esfera de brilho (sprites aditivos) perto da câmera vira "névoa" que cobre a tela: manter pequenos.
- Cada shader de fragmento não tem `modelMatrix`: passar por varying.
- Upload de vídeo >10 MB: método do repo (Passo 7). Verificado com 36 MB e 61 MB (limite 100 MB).

## Passo 0 — Sessão nova (rotina diária): obter a skill e preparar o ambiente
Cada execução agendada começa numa sessão VAZIA. A skill mora no repo `contatowmds-code/agenda-qr`, branch `qv-upload`, pasta `skill-arquivo-qv-v2/`:
1. `mcp__claude-code-remote__add_repo` {contatowmds-code, agenda-qr, access:"push"}.
2. Clone parcial (rápido, só a pasta da skill): `git clone --depth 1 --filter=blob:none --sparse --branch qv-upload --single-branch https://github.com/contatowmds-code/agenda-qr /home/user/agenda-qr && git -C /home/user/agenda-qr sparse-checkout set skill-arquivo-qv-v2`.
3. Ler `SKILL.md`, rodar `bash skill-arquivo-qv-v2/motor/setup.sh`. Os vídeos entregues continuam usando `videos/` da mesma branch (Passo 7; adicione com `git sparse-checkout add videos` só se precisar ver os anteriores).
4. Placar do dia: listar a pasta QV do Drive (`search_files` parentId=QV, createdTime de hoje no fuso America/Sao_Paulo).
5. Guarda anti-sobreposição: se existir MP4 criado na pasta QV há menos de 70 min, outra sessão provavelmente está trabalhando: encerre sem produzir.

## Mais lições (vídeo 3, Nvidia)
- Cenas em locais separados (1000 un.) com `backdrop` próprio (esfera BackSide com gradiente, `depthWrite:false`) e visibilidade por posição da câmera (`Math.round(x/1000)`). Objetos de outras cenas NÃO podem vazar.
- Transições entre cenas: 6 tipos diferentes (dip preto, dip azul, wipe, iris, slide, flash); NUNCA colocar transição no primeiro key (cobre o quadro 0/capa).
- Distâncias de câmera: ~2-3x o tamanho do objeto; conferir cada cena com `node shot.js` antes de renderizar.
- Blender (`pip install bpy` funciona) NÃO é viável: render em CPU leva segundos por quadro (horas por vídeo a 60 fps). Usar three.js.
- Barras/gráficos com dados só quando o dado vem de fonte; não inventar números anteriores.
