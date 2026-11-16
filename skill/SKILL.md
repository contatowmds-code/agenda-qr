---
name: stick-qv
description: STICK - QV. Ao ser carregada em QUALQUER conversa, começa SOZINHA, sem perguntar nada, o loop diário do perfil QV (Quanto Vale): 10 vídeos verticais (1080x1920, 63 s+) e 2 horizontais (1920x1080, 8:01+) por dia, estilo stick viral 3D (three.js + toon) aprovado pelo dono (Starship), pesquisa nova a cada vídeo, voz Kokoro pt-BR, legenda palavra por palavra, CTA animado VIRAL, e entrega só o MP4 na pasta QV do Google Drive.
---
# STICK - QV — executar já, sem perguntar

QUANDO ESTA SKILL FOR CARREGADA: não pergunte nada, não peça confirmação, não resuma. Comece imediatamente e siga em loop até o dono mandar parar.

## Ordem
1. Leia `APRENDIZADOS.md` (regras do dono + lições) e `RUNBOOK_DIARIO.md` (passo a passo técnico) e `SKILL-stick-viral-qv.md` (estilo). Prepare o ambiente conforme o runbook (pip/npm, Chromium/Playwright, ffmpeg, Kokoro).
2. Liste a pasta QV no Drive (id 1PjYAexyF3NNCMHuBsi1KJj7kapAyqu3E) e `registro/temas.json` para saber o que já saiu hoje e não repetir tema, fundo, som, cartão ou transição.
3. Placar do dia: 10 verticais + 2 horizontais. Produza UM vídeo por vez, com pesquisa NOVA (last30days + Agent Reach + RSS/WebSearch; fato conferido em 2+ fontes; não nichar; sem data/"hoje" na fala).
4. Cada vídeo: roteiro viral → voz → mundo three.js NOVO (parta de `kit/examples` e `kit/horizontal`, que seguem o estilo aprovado) → câmera guiada pela fala → render → legenda → SFX → capa = primeiro quadro → CTA animado → encode → olhar quadros antes de subir.
5. Entrega: só o MP4 "TÍTULO SEO #h1 #h2 #h3.mp4" na pasta QV; confira bytes e parentId no Drive antes de dizer "entregue"; envie o MP4 no chat com título + 3 hashtags e avise que voz e movimento não foram ouvidos/vistos por você. Atualize `registro/temas.json`.
6. Volte ao passo 3. Sem Drive disponível: diga "enviado à raiz do script, falta mover", nunca "entregue".

## Regras fixas
- Estilo do vídeo aprovado (Starship). NÃO usar Blender Skills.
- Religião: SOMENTE vídeo evangélico da Bíblia para glorificar Jesus; qualquer outro tema religioso, descarte e troque de assunto.
- Nada de pessoa viva como alvo. Nunca desative TLS/proxy. Não mexa em skills/tarefas de outros projetos.
- Pouca escrita, sem vinheta escura, desfoque lateral leve, elementos centrados, SFX só em eventos (≤ −6 dB da voz, sem música).
- CTA fixo: "Quer criar vídeos como esse? Comente VIRAL que vou te enviar a mesma skill que eu utilizo para criar vídeos assim, mas você precisa estar me seguindo para a mensagem chegar." (animado: digita VIRAL, botão Seguir, "Mensagem recebida").
- Honestidade: só diga que usou uma técnica se aplicou de fato. Em dúvida, consulte esta skill e procure solução no GitHub.
