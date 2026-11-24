# Perfis de mapa: como conectar cada rede (feito UMA vez pelo dono)

O robô já está pronto. Ele só publica num perfil depois que a rede daquele perfil estiver conectada aqui.
Conferir o estado: aba Actions → "Mapas - conferir contas" → Run workflow (o resultado fica em `agendador/mapa_status.json`).
Os segredos ficam em Settings → Secrets and variables → Actions. Nunca mande token em conversa.

## 1. Instagram + Facebook (um segredo só para os 9 perfis)
1. Cada perfil precisa de uma Página do Facebook com a conta profissional do Instagram do perfil vinculada (ex.: Página "Catarinense no Mapa" ↔ @catarinensenomapa), dentro do portfólio empresarial.
2. Em business.facebook.com → Configurações → Usuários → Usuários do sistema: crie (ou use) um usuário do sistema ADMIN, atribua a ele as 9 Páginas e as 9 contas do Instagram (controle total) e o app do agendador.
3. Clique em "Gerar token" para o app, sem validade, com: `pages_show_list`, `pages_read_engagement`, `pages_manage_posts`, `instagram_basic`, `instagram_content_publish`, `business_management`.
4. Salve o token como segredo **`META_SISTEMA_TOKEN`**.
O robô acha sozinho a Página de cada perfil pelo @ do Instagram vinculado. Perfil novo: basta atribuir a Página ao usuário do sistema.

## 2. YouTube (um segredo por canal)
1. Recomendo um projeto novo no Google Cloud só para os mapas (cada projeto envia cerca de 6 vídeos por dia): ative "YouTube Data API v3", crie a credencial OAuth e salve `YT_CLIENT_ID__MAPAS` e `YT_CLIENT_SECRET__MAPAS`. Sem isso, usa o projeto atual e divide a cota com os outros canais.
2. Para cada canal, gere o refresh token (escopos `youtube.upload` e `youtube.readonly`) escolhendo o canal do perfil na tela do Google, e salve como:
   `YT_REFRESH_TOKEN__MAPA_SC`, `__MAPA_RS`, `__MAPA_PR`, `__MAPA_MG`, `__MAPA_MT`, `__MAPA_SP`, `__MAPA_RJ`, `__MAPA_NORTE`, `__MAPA_BR`.
3. O nome do canal precisa conter o nome do perfil (ex.: "Catarinense no Mapa"); senão o robô se recusa a publicar.

## 3. TikTok (um segredo por conta, depois que o app for aprovado)
Segredos `TT_REFRESH_TOKEN__MAPA_SC` ... `__MAPA_BR`. Enquanto o TikTok não aprovar o app, a API só publica como privado.

## Travas do robô
Conta com nome diferente do perfil = não publica. Mesma cidade no mesmo perfil = não publica de novo. Depois de publicar, busca o link do post em cada rede e só então arquiva em `publicados.json`.
