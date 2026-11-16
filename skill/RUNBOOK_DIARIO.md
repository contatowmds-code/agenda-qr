# RUNBOOK DIÁRIO — QV (Quanto Vale) — executar TODO DIA às 05:00 (America/Sao_Paulo), 100% autônomo
Leia também `SKILL-stick-viral-qv.md` (regras do dono, lições). Em dúvida: consulte essa skill e os exemplos em `kit/examples/`. NUNCA peça confirmação ao dono; termine o lote do dia sem parar. Nunca desative TLS/proxy. Não mexa em tarefas/skills de outros projetos.

## 0. Preparar o ambiente (sessão nova = tudo vazio)
1. `git clone --depth 1 -b qv-skill-v2 https://github.com/contatowmds-code/agenda-qr /home/user/agenda-qr-skill` (se `add_repo` for necessário: add_repo contatowmds-code/agenda-qr com acesso push). Pasta de trabalho: `/home/user/sv/<slug>` por vídeo.
2. `pip install -q kokoro-onnx soundfile numpy pillow --break-system-packages`; `git clone --depth 1` last30days-skill (mvanhorn) e Agent-Reach (Panniantong) em `/home/user/ext`; `pip install ./Agent-Reach --break-system-packages`. Demais repos de referência (video-shotcraft, remotion-dev/skills, bang-motion, anything2explainer, hand-drawn-explainer-video-nikola, paint-mv-skills, heygen-com/hyperframes-community-skills): clonar e LER só o que aplicar (dizer a verdade sobre o que foi aplicado).
3. Projeto de um vídeo: copie `kit/web` → `<slug>/web`, `kit/tools/*` → `<slug>/`, `ln -s` para node_modules com `playwright` (instalado globalmente: `npm root -g`/playwright). Chromium: `/opt/pw-browsers` (render.mjs já usa Playwright). Mapas: `npm i maplibre-gl@4.7.1 @turf/turf@7` numa pasta própria; copiar `kit/map/*`.
4. Ler `registro/temas.json` (temas já usados — nunca repetir tema, fundo, som, cartão).

## 1. Pesquisa do dia (obrigatória)
- Regra do dia: se for madrugada (00–06h) usar o dia anterior E o atual; senão, o dia atual. Qualquer nicho; não nichar. NÃO citar data/"hoje"/"ontem" no vídeo.
- last30days: `python3 -I scripts/last30days.py "<tópico>" --emit=compact --quick --plan -` com JSON de plano via heredoc (você é o planner). Reddit costuma dar 403; HN/web respondem.
- Agent Reach: `agent-reach doctor`; canais públicos (web/github/youtube). Complementar com RSS (g1.globo.com/rss/g1, feeds.bbci.co.uk/news/{world,science_and_environment,technology,business}/rss.xml, trends.google.com/trending/rss?geo=BR) e WebSearch.
- Escolher temas variados e VERIFICAR em 2+ fontes (se não achar 2 fontes, DESCARTAR). Pessoas vivas só institucional/neutro; nada gráfico; religião: só glorificar Jesus.
## 2. Roteiro
Gancho = número/fato absurdo + imagem forte; frases LONGAS e conectadas (poucas vírgulas, concordância correta), 215–260 palavras; números por extenso; estrutura viral: gancho → lacuna de curiosidade → escada de fatos visuais → virada → "quanto vale?" → fecho emocional → CTA fixo: "Quer criar vídeos como esse? Comente VIRAL que vou te enviar a mesma skill que eu utilizo para criar vídeos assim, mas você precisa estar me seguindo para a mensagem chegar."
Voz: `python3 voz.py script.txt voice.wav --voz pm_alex --vel 1.07 --gap 0.1` → `python3 timing.py voice.wav script.txt --out work` (words.json) ≥63 s.
## 3. Plano de cena + mundo NOVO (nunca copiar de vídeos anteriores)
- Tabela frase|quadros|elemento|câmera|POR QUÊ|palco/luz (ver kit/examples/*/story.js).
- Mínimo 6 palcos (fundos) novos por vídeo + 1 clipe MapLibre quando houver geografia (OpenFreeMap positron + Terrain RGB terrarium + Natural Earth admin-1 via cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector + Turf). NÃO usar Carto raster (exige chave).
- Câmera guiada pela fala: `cam.keys` com beats no quadro da palavra (push-in no foco); cortes SÓ quando a ideia muda; nada de corte a cada 1 s; sem vinheta escura (vig 0.08); desfoque lateral leve (sigma 4 no enc.sh, sem escurecer); elementos centrados, inteiros.
- Cartões gráficos modernos (vidro/neon) só na palavra falada; pouca escrita; nunca repetir cartão/cena/som entre vídeos (paleta de SFX nova por vídeo, semente do RNG diferente).
- Cada elemento surge só quando mencionado. Personagens: workA/civB/civD/velha/frances/workB/soldadoA/major (kit/web/roman.js).
## 4. Render e montagem
- `python3 assemble.py` (monta web/main.js a partir de main_default.js + world_part.js + ws_part.js), 720x1280; `node render.mjs frames "a-b" 1 0.94` em 4 processos retomáveis (RESUME=1, setsid nohup). ~0,8–1,2 s/quadro/processo. Usar Monitor/until para esperar (sem sleep longo).
- Mapas: `node rmap.mjs <clip> f0 f1 <dir>`; compor com PIL (contadores) e salvar como frames fNNNN.jpg.
- SFX só em eventos (sfx_template.py), `mix.py voice.wav music0.wav sfx.wav` (SFX −6 dB), `capt.py work/words.json legenda.ass` (Inter Black 84, palavra a palavra).
- Capa = QUADRO 0: renderizar `node render.mjs cov "9999"` + PIL (título grande, logo QV `marca/QV-logo.png`) → cover.png; `enc.sh` sobrepõe nos quadros 0–3. Conferir olhando (título não pode cortar).
- CTA ANIMADO: `python3 cta_overlay.py frames work/words.json QV-logo.png VIRAL` ANTES do encode (digita VIRAL, cursor clica Seguir, chega a mensagem). Não deixar cartão 3D de CTA duplicado.
- `bash enc.sh` (título SEO + 3 hashtags no T=), 1080x1920, loudnorm −14, ≥63 s. Conferir folha de quadros (ffmpeg -ss) antes de entregar.
## 5. Entrega (só o MP4, pasta QV id 1PjYAexyF3NNCMHuBsi1KJj7kapAyqu3E)
git no repo contatowmds-code/agenda-qr branch `qv-upload` (se rejeitado: `git fetch --depth=20 origin qv-upload && git rebase FETCH_HEAD`; push `git -c push.negotiate=true push origin HEAD:qv-upload`): copiar para `videos/<slug>.mp4`, commit, push → `gh api -X POST repos/contatowmds-code/agenda-qr/actions/workflows/417569639/dispatches -f ref=main -f inputs[arquivo]=videos/<slug>.mp4 -f 'inputs[nome]=TÍTULO #h1 #h2 #h3.mp4'` (~3 min; use Monitor até concluir) → Drive `search_files` (title contains) → `update_file(fileId, parentId=1PjYAexyF3NNCMHuBsi1KJj7kapAyqu3E)` → `get_file_metadata`: bytes = tamanho local e parentId correto; SÓ ENTÃO dizer "entregue". Enviar o MP4 no chat com título+3 hashtags e "voz e movimento não foram ouvidos/vistos por mim".
## 6. Registro e meta
Depois de cada vídeo: atualizar `registro/temas.json` (tema, fundos, sons) e dar push em `qv-skill-v2`. Meta do dia: 10 verticais (1080x1920, ≥63 s) + 2 horizontais (1920x1080, ≥8:01) — verticais primeiro, em sequência, sem pausa; placar honesto ("stick 3/10, horizontais 0/2"). Meia-noite (America/Sao_Paulo) zera o lote. Nunca declarar meta cumprida sem MP4 real verificado. Sessão que acaba sem produzir NÃO conta.
## 7. Honestidade
Só dizer que usou uma técnica/skill se leu e aplicou. Reportar pontos fracos. Aprender e anotar 3–5 linhas por vídeo em `SKILL-stick-viral-qv.md` (seção "Lições").

## 8. Se a sessão agendada NÃO tiver as ferramentas do Google Drive (connector)
A rotina das 5h foi criada via API sem connectors, então `mcp__Google_Drive__*` pode não existir. Nesse caso: faça tudo até o workflow 417569639 (o MP4 chega na raiz do script, id 1tPiMtGGzyESOgy_wN1_T_EnDeNt-yx_I), tente `ToolSearch` por "Google Drive"; se não houver, NÃO diga "entregue": reporte "enviado ao Drive (raiz do script), falta mover para a pasta QV" com o nome do arquivo, e envie o MP4 no chat. O dono pode ligar o conector Google Drive na rotina em claude.ai > Routines para o move automático. (curl em www.googleapis.com/drive devolve 401 aqui: não funciona.)
