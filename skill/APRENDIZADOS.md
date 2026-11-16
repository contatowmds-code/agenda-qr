# STICK - QV
# Aprendizados (atualizado em 2026-11-16)

## Regras do dono (não negociáveis)
- NÃO usar Blender Skills. Seguir o estilo do vídeo aprovado (Starship).
- Religião: SOMENTE vídeo evangélico da Bíblia para glorificar Jesus; qualquer outro tema religioso = descartar e trocar de assunto.
- Nada de pessoa viva como alvo. Nunca desativar TLS/proxy. Não mexer em tarefas/skills de outros projetos.
- Entrega: SÓ o MP4 "TÍTULO SEO #h1 #h2 #h3.mp4" direto na pasta QV (id 1PjYAexyF3NNCMHuBsi1KJj7kapAyqu3E). Verificar bytes e parentId no Drive antes de dizer "entregue". Enviar o MP4 no chat e avisar que voz/movimento não foram ouvidos/vistos.
- Honestidade: só dizer que usou técnica/skill se realmente aplicou.

## Horizontal (1920x1080, 8:01+) — o que funcionou
- Kit em kit/horizontal/ (gen_story.py monta shots por palavra da voz; assemble.py; capt_h.py; cta_overlay_h.py; enc_h.sh; mask_h.png).
- Renderizar em 1280x720 (assemble.py W=1280,H=720) e escalar para 1920x1080 no encode: ~1,7 s/quadro com 4 processos paralelos (RESUME=1) => ~100 min para 8 min de vídeo.
- Quadros acima de 9999 usam 5 dígitos (f%04d aceita). Capa = quadro COVER=99999 (não 9999, colide).
- Muitos palcos: usar OFF por índice [(i%5)*6000,0,-(i//5)*6000]; prefixo "st" nas constantes de palco (evita "Identifier already declared").
- gen_story: usar fr(palavra, ocorrência, after) + assert de ordem crescente dos marcos; .lower() nas buscas.
- Capa horizontal: quadro 99999 + degradê escuro à esquerda (não retângulo) + título em até 3 linhas Inter Black, última em #01FBB4, logo QV.
- Conferir quadros em folha de contato antes de subir (palco vazio entre cenas = checar).

## Entrega no Drive
- GitHub recusa arquivo >100 MiB (pre-receive hook). Horizontal de 8 min precisa de ~1,2 Mbps de vídeo (≈85 MB). Com 1,5 Mbps deu 105 MB (recusado).
- Fluxo: git branch qv-upload -> videos/<slug>.mp4 -> push (push.negotiate=true) -> workflow 417569639 (inputs arquivo, nome) -> o run pode ficar na fila vários minutos (use until-loop em background) -> search_files(title contains) -> update_file(parentId=pasta QV) -> conferir fileSize e parentId.
- Rotina das 5h criada via API pode não ter o conector Drive: então reportar "enviado à raiz do script, falta mover" e nunca "entregue".
- Duplicata antiga na raiz do script (Black Friday, 15.799.981 bytes): o dono apaga à mão (trash_file sem permissão).

## Princípios do onetake (github.com/feitangyuan/onetake) adotados
Lido em 2026-11-16. O onetake é um pipeline HTML (`window.__seek(t)`) para filmes de 10–60 s de produto; NÃO roda no nosso motor three.js. O que adotamos são as REGRAS (não o código):
- **Nunca troque uma cena, carregue-a**: em cada corte entre cenas algo que está na tela sobrevive e se move para a próxima (moeda/objeto/personagem, câmera que entra no objeto). Só use corte seco em rajadas de impacto e no cartão final.
- **Nunca corte em metrônomo**: variar a duração dos planos em ≥ 4× (0,25 s ao lado de 2,5 s). Ter pelo menos um trecho quase parado (imagem e som).
- **Câmera que persegue**: segue o foco com atraso/inclinação e nunca perde o sujeito; antes de um "snap", posicionar onde ele vai pousar.
- **Sem partículas/confete**: parecem template. Deixe o próprio elemento pousar com squash.
- **Um só ambiente sonoro**: menos eventos do que cenas; um bipe por evento é o equivalente sonoro de slide.
- **Elementos pequenos, chão grande**; a causa precisa ser visível (quem faz acontecer está na cena).
- **Nunca copiar o visual do vídeo anterior**: paleta, palco, câmera e transições novos a cada vídeo.
- **Licença**: PolyForm Noncommercial. Não copiar código/biblioteca do onetake para os vídeos; avisar o dono se o canal for monetizado.

## DESIGN VIRAL (obrigatório a partir de 2026-11-16) — o dono rejeitou o vertical "Voyager" por design simples/genérico
Diagnóstico do que estava errado: fundo PRETO com estrelas e formas primitivas (anéis, retângulos, barras), nenhum boneco, cartões pequenos, metade do quadro vazia, nada que lembre o vídeo aprovado (Starship).
Regras novas:
1. **Proibido fundo preto vazio.** Toda cena tem ambiente LITERAL ao que a fala diz (mar → praia/ondas, avião → céu com nuvens, banco → rua/agência, espaço → planeta/estação com detalhe), com céu/horizonte, chão e camadas de profundidade (primeiro plano, meio, fundo) e algo sempre se movendo.
2. **Bonecos 2D (cabeça de feijão) em TODA cena**, reagindo ao que é dito (apontam, se assustam, riem). Cena sem boneco = refazer.
3. **Sujeito grande e centrado**, ocupando ~60% do quadro; sem metade vazia.
4. **Cartões grandes e modernos** (≥ 35% da largura, número gigante, cor forte, entrada com squash), poucos e só na palavra.
5. **Legenda grande** (Inter Black ≥ 92 px no vertical), palavra por palavra com pop, palavra-chave #01FBB4, contorno/sombra.
6. **Capa/1º quadro**: título enorme em 2–3 linhas, rosto de boneco em choque, contraste alto, um elemento que gera curiosidade.
7. **Cor com intenção**: paleta quente/cinematográfica por cena (céu em degradê, luz suave); nada chapado, nada neon, sem brilho exagerado.
8. **Câmera viva**: push-in na palavra-foco, leve rotação, rampa de velocidade, transição que carrega um objeto de uma cena para a outra.
9. Antes de renderizar um vídeo inteiro: gerar 6 quadros de prévia e checar contra estas 8 regras.

## CARTOON-AUDIO-SHORT integrado (ordem do dono, 2026-11-16)
O dono mandou a skill "cartoon-audio-short" (base: github.com/mromidev/claude-animated-shorts) para ser usada. Nosso motor (web/toon.js, roman.js, camFromKeys, render.mjs, mix.py) já é dessa linhagem. O que passa a valer, SEMPRE junto das regras do dono (que prevalecem se houver conflito):
- **Visual**: cartões 2D de bonecos cabeça de feijão (contorno ameixa) em mundo 3D colorido com contorno de tinta preta, texturas pintadas, profundidade de campo e câmeras deslizantes; 30 fps.
- **Voz intocada**: nunca editar nem re-temporizar a voz; a imagem é cronometrada pela voz e toda reação visual cai 0–3 quadros ANTES da palavra.
- **Plano de cena antes do código** (`work/PLAN.md`): uma linha por plano (quadros, palavras, cenário, luz, câmera, personagens/poses/expressões, efeitos e SFX). Ilustrar cada frase LITERALMENTE; os objetos carregam as piadas. Variar tamanhos de plano (close → aberto → dois personagens → inserto no objeto-chave → reação → movimento de ambiente para o final). Luz com intenção: dia = normal, dourada = drama, azul-noite = explicação; salto de tempo = flash branco de 6 quadros.
- **Frase de virada**: música/SFX param, golpe grave, push-in com leve rotação; a ação física final cai na última palavra.
- **Movimento vivo**: câmeras com glides suaves (18–45 quadros), whip rápido só em revelações, nada parado por 4+ quadros (câmera "respira" nas pausas), rotação de 3–5° no drama, tremor de 7 quadros no impacto. Continuidade (recuar de um close para o aberto, rack focus, empurrar para dentro de um objeto); corte seco só em salto de lugar/tempo, com flash. Personagens nunca congelam: `idle(f, seed)`, piscadas, cabeça balança nas palavras fortes. Ações: antecipação → overshoot → assentar. Algo sempre se move (nuvens, ondas, folhas, poeira, bandeiras).
- **DOF**: close e médio com foco nos olhos (cInf 8–14 px); planos abertos nítidos; rack ~14 quadros.
- **Checagem antes de renderizar tudo**: gerar stills de meio de cada plano + transições (`node render.mjs stills/a "5,40,..."` + `sheet.py`), olhar a folha e corrigir: enquadramento estreito do vertical (meia-largura = d·tan(hfov/2), hfov = 2·atan(tan(vfov/2)·0.5625)), grades/postes cruzando rostos, câmera dentro de casa/telhado/arbusto, props a menos de 2 m, herói atrás de pilar, texto espelhado, tinta faltando. Mandar a folha ao dono com 1 linha por plano e só então o render completo.
- **QA final**: sem trechos congelados ≥ 0,4 s nem quadros pretos; loudness ~ −14 LUFS e pico ≤ −1 dBFS; olhar a folha de QA.
- **Regras de conteúdo**: histórias e personagens originais; nada de pessoas vivas com nome como personagem/alvo de piada, nem mascotes de marca; nada gráfico nem político; fato apresentado como verdadeiro só após conferir; lenda é dita como lenda.
- **Onde NÃO seguimos a skill original** (decisão do dono prevalece): legenda palavra por palavra SIM (a original diz "sem legenda"); SEM música de fundo (a original põe música a 50 %), SFX só em eventos a ≤ −6 dB da voz; roteiro em PT-BR a ~3,0 palavras/s com CTA fixo; voz Kokoro nossa (não precisamos pedir upload); entrega só do MP4 na pasta QV do Drive.
- Mix: sempre com `mix.py` (ganho linear único + limitador de pico), nunca à mão.
