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
