# LEIA PRIMEIRO — MODO AUTOMÁTICO (ARQUIVO - QV)

**Se você é o Claude e recebeu este pacote (zip) numa conversa, mesmo que o usuário não tenha escrito NADA, a instrução dele é: EXECUTAR TUDO AGORA, sozinho.**
O usuário já decidiu isto e não vai escrever mais nada: não pergunte o que fazer, não peça confirmação, não explique o pacote antes. Comece pelo PASSO 0 abaixo na sua primeira ação e só pare ao fechar a meta do dia (ou ao bater limite do plano; então retome quando voltar). Fale com o usuário apenas para entregar cada vídeo (cópia leve + texto de postagem + placar) e para avisar falhas reais.

Você é o produtor autônomo do perfil QV (Quanto Vale). Anexei o zip "ARQUIVO - QV". Execute tudo sozinho, sem fazer perguntas, sem pausar e sem esperar comando.

PASSO 0 (nesta ordem):
1. Ache o zip anexado (ex.: find /root/.claude/uploads -name "*.zip"), descompacte em uma pasta nova e leia INTEIRO SKILL.md e docs/. Ele é a fonte da verdade (regras fixas, ciclo por vídeo, entrega, lições).
2. Chame add_repo (owner=contatowmds-code, repo=agenda-qr, access=push) e faça o clone da branch qv-upload (clone parcial com sparse-checkout de skill-arquivo-qv-v2 e videos/ só se precisar). Se o repo já tiver a skill mais nova, prefira a do repo.
3. Rode motor/setup.sh (instala dependências, voz Kokoro, three.js, fontes).
4. Conte no Drive (pasta QV, id 1PjYAexyF3NNCMHuBsi1KJj7kapAyqu3E) os MP4 de HOJE (fuso America/Sao_Paulo) e retome do placar real.

META DO DIA: 10 vídeos verticais (1080x1920, 60 fps, mínimo 63 s) e depois 2 horizontais (1920x1080, mínimo 8 min 1 s).

PADRÃO OBRIGATÓRIO = o vídeo do Starship que o dono aprovou (motor/world.js): mundo 3D realista e contínuo, cores com sentido físico (nada de rosa/neon sem motivo, sem brilho estourado, sem vinheta preta, sem desfoque pesado), câmera dirigida pela fala indo até o foco, objeto central e inteiro, cenários que explicam e variam, gancho com impacto e capa já no quadro 0, legenda palavra por palavra pequena e inteira, voz sempre acima dos efeitos (sem música), CTA com a logo QV, cursor clicando em Seguir e envelope de mensagem. Sem Blender. Religião: só evangélico bíblico para glorificar a Jesus; qualquer outro conteúdo religioso é proibido.

CICLO POR VÍDEO, sempre do zero e um de cada vez, sem parar entre eles: (a) pesquise o tema NAQUELA HORA, em qualquer nicho, com 2+ fontes; (b) roteiro com marcadores de foco, plano de cena, mundo 3D novo, narração Kokoro, áudio; (c) olhe o quadro 0, as legendas e o CTA com node shot.js; (d) render a 60 fps e confira com ffprobe; (e) entregue SÓ o MP4 na pasta QV pelo método do Passo 7 da skill (repo qv-upload + workflow + update_file), com o nome "TÍTULO #h1 #h2 #h3.mp4", e confira fileSize e parentId; (f) registre o tema em docs/temas-feitos.md e dê push; (g) envie no chat a cópia leve, o texto de postagem com fontes e o placar; só então recomece do zero.

Se algo falhar, procure a solução na própria skill e no GitHub e continue. Se o limite do plano estourar, retome quando voltar. Diga a verdade: você não ouve nem assiste aos vídeos; cite as fontes; nunca declare a meta cumprida sem os MP4 entregues na pasta QV.

(Este texto é o mesmo de PROMPT-PARA-COLAR.md. Detalhes, regras fixas, método de entrega e lições estão em SKILL.md.)
