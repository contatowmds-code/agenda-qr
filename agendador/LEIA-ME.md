# Agendador grátis (GitHub Actions): 6 vídeos por dia em Instagram, Facebook, TikTok e YouTube

O robô do GitHub confere a agenda a cada 15 minutos e publica no horário. Horários (fuso de Brasília), em `config.json`:
**07:30, 10:00, 12:30, 15:30, 18:30 e 21:00** (manhã antes do trabalho, intervalo, almoço, tarde, saída do trabalho e noite = picos de uso de redes no Brasil).
Cada vídeo sai nas 4 plataformas no mesmo horário.

## O que você faz UMA vez
1. **Repositório PÚBLICO** no GitHub (o Instagram/Facebook baixam o vídeo de um link público). Suba esta pasta `agendador/` e copie `agendador/.github` para `.github` na raiz.
2. **Instagram + Facebook (Meta)** — vocês já têm as Páginas vinculadas no Meta Business. Em developers.facebook.com crie um App (tipo Empresa) e gere um token de longa duração com `instagram_basic, instagram_content_publish, pages_show_list, pages_read_engagement, pages_manage_posts`.
   - `IG_USER_ID`: ID da conta do Instagram; `IG_TOKEN`: o token.
   - `FB_PAGE_ID`: ID da Página; `FB_PAGE_TOKEN`: token DA PÁGINA (em `GET /me/accounts` aparece o `access_token` de cada Página). Token de Página gerado de token de longa duração não expira.
3. **YouTube**: Google Cloud → ative "YouTube Data API v3" → credenciais OAuth → gere o refresh token → `YT_CLIENT_ID`, `YT_CLIENT_SECRET`, `YT_REFRESH_TOKEN`.
4. **TikTok**: developers.tiktok.com → app com "Content Posting API" → `TT_CLIENT_KEY`, `TT_CLIENT_SECRET`, `TT_REFRESH_TOKEN`.
5. GitHub → Settings → Secrets and variables → Actions: crie cada um como **secret**. Plataforma sem secret é simplesmente pulada.

## Limites honestos (leia)
- **TikTok:** até o TikTok auditar o seu app, a API só deixa publicar como PRIVADO (só você vê). Por isso o padrão é `TT_PRIVACY=SELF_ONLY`.
  Depois da aprovação, crie a variável `TT_PRIVACY` = `PUBLIC_TO_EVERYONE` (Settings → Variables). Enquanto não for aprovado, o TikTok não vai viralizar.
- **YouTube:** cota grátis de 10.000 unidades por dia e cada upload gasta 1.600, ou seja, **6 vídeos por dia é exatamente o limite** (9.600). Não sobra margem para reenvios.
  Projeto não verificado pode publicar como privado até a Google aprovar.
- **Instagram:** limite de 50 publicações por dia, sobra bastante. **Facebook** Reels também pela API oficial.
- 6 por dia = 180 vídeos por mês: o gargalo passa a ser a produção dos vídeos, não o agendador. Se a agenda esvaziar, o robô não faz nada (não repete vídeo).
- Eu não testei contra as suas contas reais (não tenho acesso). Teste com 1 vídeo pelo botão Actions → "Run workflow".

## Todo vídeo novo (eu faço sozinho)
1. `python3 agendador/preparar.py "videos/<Título>"` → coloca no PRÓXIMO horário livre (3 dias de agenda = 18 vídeos).
2. `bash agendador/subir_videos.sh` → sobe os mp4 pendentes para a branch `videos` (1 commit só; não enche o repositório).
3. commit/push da `agenda.json` na branch principal.

Testar sem publicar: `python3 agendador/publicar.py --dry-run`.
