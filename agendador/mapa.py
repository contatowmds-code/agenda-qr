#!/usr/bin/env python3
"""Perfis "[Lugar] no Mapa": acha as credenciais de cada perfil, TRAVA contra conta errada, baixa o vídeo do Drive
e envia o arquivo direto (sem link público do GitHub) para Instagram e Facebook, com o aviso de conteúdo feito com IA.
Regras: cada perfil só publica na conta cujo nome bate com a "chave" de contas_mapa.json (ex.: catarinensenomapa).
Se o nome não bater, NÃO publica. Nenhum token é impresso."""
import json, os, tempfile, time, unicodedata
import datetime as dt_
from pathlib import Path
import requests

AQUI = Path(__file__).resolve().parent
GRAPH = "https://graph.facebook.com/v21.0"
CONTAS = json.loads((AQUI / "contas_mapa.json").read_text(encoding="utf-8"))
_cache = {}
VISTAS = []   # Páginas que os tokens alcançam (para o relatório de contas)


def eh(conta): return conta in CONTAS
def norm(s): return "".join(c for c in unicodedata.normalize("NFD", str(s or "").lower()) if c.isalnum() and not unicodedata.combining(c))
def chave(conta): return CONTAS[conta]["chave"]
def bate(conta, *nomes):
    """True se algum dos nomes da conta encontrada contém a chave do perfil (ou um nome extra aceito em contas_mapa.json)."""
    aceitos = [chave(conta)] + [norm(x) for x in CONTAS[conta].get("aceitos", [])]
    return any(a and a in norm(n) for n in nomes if n for a in aceitos)
def env(var, conta):
    """Só a credencial PRÓPRIA do perfil (VAR__MAPA_SC). Nunca cai na credencial genérica de outro canal."""
    return os.environ.get(f"{var}__{conta.upper().replace('-', '_')}")


def _tokens():
    t = [os.environ.get("META_SISTEMA_TOKEN"), os.environ.get("IG_TOKEN"), os.environ.get("FB_PAGE_TOKEN")]
    try:
        for d in json.loads(os.environ.get("META_ACCOUNTS") or "{}").values(): t += [d.get("fb_token"), d.get("ig_token")]
    except Exception: pass
    v = []
    for x in t:
        if x and x not in v: v.append(x)
    return v


def _paginas(tok):
    url, p, out = f"{GRAPH}/me/accounts", {"fields": "name,access_token,instagram_business_account{id,username}", "limit": 100, "access_token": tok}, []
    for _ in range(10):
        r = requests.get(url, params=p, timeout=60).json()
        out += r.get("data", [])
        url = (r.get("paging") or {}).get("next")
        if not url: break
        p = {}
    return out


def meta(conta):
    """Página do Facebook + Instagram do perfil. Vale a Página cujo Instagram vinculado tem o @ do perfil."""
    if conta in _cache: return _cache[conta]
    achados = []
    try:
        d = json.loads(os.environ.get("META_ACCOUNTS") or "{}").get(conta)
        if d and d.get("fb_page_id") and d.get("fb_token"):
            r = requests.get(f"{GRAPH}/{d['fb_page_id']}", params={"fields": "name,instagram_business_account{id,username}", "access_token": d["fb_token"]}, timeout=60).json()
            achados.append({"id": d["fb_page_id"], "name": r.get("name"), "access_token": d["fb_token"], "instagram_business_account": r.get("instagram_business_account")})
    except Exception: pass
    if not achados:   # segredo META_PAGINAS: a resposta de me/accounts colada pelo dono (lista de Páginas com o Instagram vinculado)
        try:
            j = json.loads(os.environ.get("META_PAGINAS") or "{}")
            achados = j.get("data", []) if isinstance(j, dict) else j
        except Exception: achados = []
    if not achados:
        for tok in _tokens():
            try: achados += _paginas(tok)
            except Exception: pass
    vistos = []
    for p in achados:
        v = f"{p.get('name')} (@{(p.get('instagram_business_account') or {}).get('username') or 'sem instagram'})"
        if v not in VISTAS: VISTAS.append(v)
    for p in achados:
        ig = p.get("instagram_business_account") or {}
        vistos.append(f"{p.get('name')} (@{ig.get('username') or 'sem instagram'})")
        if norm(ig.get("username")) == chave(conta) or (ig.get("id") and bate(conta, ig.get("username"))):
            _cache[conta] = {"fb_page_id": p["id"], "fb_token": p["access_token"], "ig_user_id": ig["id"], "ig_username": ig.get("username"), "fb_nome": p.get("name")}
            return _cache[conta]
    raise RuntimeError(f"perfil '{conta}' não conectado no Meta: nenhuma Página com o Instagram @{chave(conta)} entre as que o token alcança" + (f" (vi {len(vistos)} Páginas)" if vistos else " (nenhum token lista Páginas)"))


def guarda_youtube(conta, access_token):
    """Confere que o token é do canal do perfil. Devolve o nome do canal ou levanta erro (não publica)."""
    c = requests.get("https://www.googleapis.com/youtube/v3/channels", params={"part": "snippet,contentDetails", "mine": "true"},
                     headers={"Authorization": "Bearer " + access_token}, timeout=60).json()
    if not c.get("items"): raise RuntimeError(f"youtube: não consegui ler o canal do token ({str(c)[:120]})")
    s = c["items"][0]["snippet"]
    if not (bate(conta, s.get("title"), s.get("customUrl")) or c["items"][0]["id"] == CONTAS[conta].get("yt_id")):
        raise RuntimeError(f"CONTA ERRADA no youtube: o token é do canal '{s.get('title')}' ({s.get('customUrl')}), esperado {CONTAS[conta]['nome']}. Não publiquei.")
    return s.get("title"), c["items"][0]["contentDetails"]["relatedPlaylists"]["uploads"]


def guarda_tiktok(conta, access_token):
    u = requests.get("https://open.tiktokapis.com/v2/user/info/", params={"fields": "open_id,display_name"},
                     headers={"Authorization": "Bearer " + access_token}, timeout=60).json()
    us = (u.get("data") or {}).get("user") or {}
    if not us: raise RuntimeError(f"tiktok: não consegui ler a conta do token ({str(u.get('error'))[:120]})")
    if not (bate(conta, us.get("display_name")) or us.get("open_id") == CONTAS[conta].get("tt_id")):
        raise RuntimeError(f"CONTA ERRADA no tiktok: o token é da conta '{us.get('display_name')}', esperado {CONTAS[conta]['nome']}. Não publiquei.")
    return us.get("display_name")


def baixar(it):
    """Baixa do Google Drive o MP4 do item (arquivo compartilhado por link) e confere o tamanho."""
    dest = Path(tempfile.gettempdir()) / Path(it["arquivo"]).name
    tam = int(it.get("tamanho") or 0)
    if dest.exists() and (not tam or dest.stat().st_size == tam): return dest
    for tent in range(3):
        try:
            # COFRE (27/11/2026): se o vídeo já foi guardado no GitHub (gh_url), baixa de lá; o Drive é só a porta de entrada
            _tk = None if it.get("gh_url") else drive_token()
            with (requests.get(it["gh_url"], stream=True, timeout=600) if it.get("gh_url") else _drive_get(it["drive_id"], _tk)) as r:
                r.raise_for_status()
                with open(dest, "wb") as f:
                    for b in r.iter_content(1 << 20): f.write(b)
            n = dest.stat().st_size
            if n < 20000 and not it.get("gh_url"):
                # o Drive às vezes devolve uma PÁGINA (aviso de antivírus com um formulário, ou aviso de limite) em vez do arquivo: reenvia o formulário com os campos dela
                import re as _re
                pg = dest.read_text(errors="ignore"); campos = dict(_re.findall(r'name="([^"]+)"\s+value="([^"]*)"', pg)); ac = _re.search(r'action="([^"]+)"', pg)
                tit = (_re.search(r"<title>(.*?)</title>", pg, _re.S) or [None, ""])[1].strip()[:80]; msg = _re.sub(r"<[^>]+>", " ", pg); msg = " ".join(msg.split())[:220]
                if ac and campos.get("id"):
                    with requests.get(ac.group(1).replace("&amp;", "&"), params=campos, stream=True, timeout=600) as r2:
                        r2.raise_for_status()
                        with open(dest, "wb") as f:
                            for b in r2.iter_content(1 << 20): f.write(b)
                    n = dest.stat().st_size
                if n < 20000: raise RuntimeError(f"o Drive devolveu uma página no lugar do vídeo: [{tit}] {msg}")
            with open(dest, "rb") as f: cab = f.read(16)
            if b"ftyp" in cab and (not tam or n == tam):
                if it.get("sha256"):   # vídeo enviado pela sessão: o conteúdo tem de ser exatamente o que ela declarou
                    import hashlib; h = hashlib.sha256()
                    with open(dest, "rb") as f:
                        for b in iter(lambda: f.read(1 << 20), b""): h.update(b)
                    if h.hexdigest() != it["sha256"]: dest.unlink(missing_ok=True); raise RuntimeError("o arquivo baixado NÃO é o vídeo que a sessão enviou (sha256 diferente). Não publiquei.")
                return dest
            erro = f"veio {n} bytes (esperado {tam}); o arquivo do Drive não está acessível por link ou foi apagado"
        except Exception as e: erro = str(e)[:160]
        time.sleep(5)
    dest.unlink(missing_ok=True)
    raise RuntimeError("baixar do Drive: " + erro)


def _audio_ig(arq):
    """O Instagram recusa o envio ("ProcessingFailedError") quando o áudio foge do padrão dele (AAC até 48 kHz, 128 kbps).
    O motor entrega áudio em 96 kHz: aqui só o ÁUDIO é refeito (48 kHz, estéreo, 128 kbps); a imagem é copiada sem perder nada."""
    import subprocess
    sai = arq.with_name(arq.stem + "_ig.mp4")
    if sai.exists() and sai.stat().st_size > 1000: return sai
    import shutil, sys as _sys
    ff = shutil.which("ffmpeg")
    if not ff:
        try:
            subprocess.run([_sys.executable, "-m", "pip", "install", "-q", "imageio-ffmpeg"], capture_output=True, timeout=300)
            import imageio_ffmpeg; ff = imageio_ffmpeg.get_ffmpeg_exe()
        except Exception as e: print("aviso: sem ffmpeg para ajustar o áudio do Instagram:", e); return arq
    r = subprocess.run([ff, "-y", "-v", "error", "-i", str(arq), "-c:v", "copy", "-c:a", "aac", "-ar", "48000", "-ac", "2", "-b:a", "128k",
                        "-movflags", "+faststart", str(sai)], capture_output=True, text=True)
    if r.returncode or not sai.exists(): print("aviso: não consegui ajustar o áudio para o Instagram:", r.stderr[-300:]); return arq
    return sai


def _ffmpeg():
    import shutil, subprocess, sys as _sys
    ff = shutil.which("ffmpeg")
    if ff: return ff
    subprocess.run([_sys.executable, "-m", "pip", "install", "-q", "imageio-ffmpeg"], capture_output=True, timeout=300)
    import imageio_ffmpeg; return imageio_ffmpeg.get_ffmpeg_exe()
def capa(arq):
    """REGRA DO DONO: a capa de toda postagem é SEMPRE o primeiro quadro do vídeo. Devolve o JPG do quadro 0 (ou None se falhar)."""
    import subprocess
    sai = arq.with_name(arq.stem.replace("_ig", "") + "_capa.jpg")
    if sai.exists() and sai.stat().st_size > 1000: return sai
    try:
        r = subprocess.run([_ffmpeg(), "-y", "-v", "error", "-i", str(arq), "-frames:v", "1", "-q:v", "2", str(sai)], capture_output=True, text=True)
        if r.returncode == 0 and sai.exists() and sai.stat().st_size > 1000: return sai
        print("aviso: não consegui tirar a capa (primeiro quadro):", r.stderr[-200:])
    except Exception as e: print("aviso: não consegui tirar a capa (primeiro quadro):", str(e)[:200])
    return None


# ---------------- STORIES (27/11/2026, regra do dono: ao postar no Instagram e no Facebook, postar também nos stories) ----------------
# O Instagram e o Facebook só aceitam story em vídeo de até 60 s: vai o COMEÇO do vídeo (gancho), cortado sem recodificar (a imagem não perde
# nada). É melhor esforço: se o story falhar, o Reel já está publicado e nada é refeito. O TikTok não tem story por API (Buffer/Zernio/oficial).
def trecho_story(arq, seg=55):
    import subprocess
    sai = arq.with_name(arq.stem + "_story.mp4")
    if sai.exists() and 100_000 < sai.stat().st_size < 95_000_000: return sai
    for t in (seg, 40, 28):   # o Instagram limita o story a 100 MB: se passar, encurta
        r = subprocess.run([_ffmpeg(), "-y", "-v", "error", "-i", str(arq), "-t", str(t), "-c", "copy", "-movflags", "+faststart", str(sai)], capture_output=True, text=True)
        if r.returncode == 0 and sai.exists() and 100_000 < sai.stat().st_size < 95_000_000: return sai
    raise RuntimeError("não consegui cortar o trecho do story: " + r.stderr[-160:])
def story_instagram(d, arq):
    uid, tok = d["ig_user_id"], d.get("ig_token") or d["fb_token"]; st = trecho_story(arq)
    j = requests.post(f"{GRAPH}/{uid}/media", data={"media_type": "STORIES", "upload_type": "resumable", "access_token": tok}, timeout=120).json()
    if "id" not in j: raise RuntimeError(f"criar: {j}")
    cid = j["id"]
    with open(st, "rb") as f:
        u = requests.post(j.get("uri") or f"https://rupload.facebook.com/ig-api-upload/v21.0/{cid}", headers={"Authorization": f"OAuth {tok}", "offset": "0", "file_size": str(st.stat().st_size)}, data=f, timeout=900).json()
    if not u.get("success"): raise RuntimeError(f"enviar: {u}")
    for _ in range(60):
        s = requests.get(f"{GRAPH}/{cid}", params={"fields": "status_code,status", "access_token": tok}, timeout=60).json()
        if s.get("status_code") == "FINISHED": break
        if s.get("status_code") in ("ERROR", "EXPIRED"): raise RuntimeError(f"processar: {s}")
        time.sleep(8)
    else: raise RuntimeError("demorou demais para processar")
    p = requests.post(f"{GRAPH}/{uid}/media_publish", data={"creation_id": cid, "access_token": tok}, timeout=120).json()
    if "id" not in p: raise RuntimeError(f"publicar: {p}")
    return p["id"]
def story_facebook(d, arq):
    pid, tok = d["fb_page_id"], d["fb_token"]; st = trecho_story(_audio_ig(arq))
    a = requests.post(f"{GRAPH}/{pid}/video_stories", data={"upload_phase": "start", "access_token": tok}, timeout=60).json()
    if "video_id" not in a: raise RuntimeError(f"iniciar: {a}")
    with open(st, "rb") as f:
        u = requests.post(a["upload_url"], headers={"Authorization": f"OAuth {tok}", "offset": "0", "file_size": str(st.stat().st_size)}, data=f, timeout=900).json()
    if not u.get("success"): raise RuntimeError(f"enviar: {u}")
    f2 = requests.post(f"{GRAPH}/{pid}/video_stories", data={"upload_phase": "finish", "video_id": a["video_id"], "access_token": tok}, timeout=120).json()
    if not f2.get("success"): raise RuntimeError(f"publicar: {f2}")
    return f2.get("post_id") or a["video_id"]
def story(rede, d, arq):
    """Melhor esforço: nunca derruba a postagem principal. Se o envio for recusado, tenta mais uma vez com um trecho menor (30 s)."""
    fn = story_instagram if rede == "instagram" else story_facebook
    for tent in range(2):
        try: sid = fn(d, arq); print(f"  story {rede} OK ({sid})"); return sid
        except Exception as e:
            print(f"  AVISO story {rede} (tentativa {tent + 1}): {str(e)[:200]}")
            try:
                base = _audio_ig(arq) if rede == "facebook" else arq; st = base.with_name(base.stem + "_story.mp4"); st.unlink(missing_ok=True)
                import subprocess; subprocess.run([_ffmpeg(), "-y", "-v", "error", "-i", str(base), "-t", "30", "-c", "copy", "-movflags", "+faststart", str(st)], capture_output=True); time.sleep(20)
            except Exception: pass
    return None


def instagram(it, d, arq):
    """Reel do Instagram enviando o ARQUIVO (envio retomável), com o aviso de IA ligado. Capa = primeiro quadro (padrão)."""
    uid, tok = d["ig_user_id"], d.get("ig_token") or d["fb_token"]
    arq = _audio_ig(arq)
    j = requests.post(f"{GRAPH}/{uid}/media", data={"media_type": "REELS", "upload_type": "resumable", "caption": it["legenda"], "share_to_feed": "true",
                      "thumb_offset": "0", "is_ai_generated": "true", "access_token": tok}, timeout=120).json()
    if "id" not in j: raise RuntimeError(f"criar: {j}")
    cid = j["id"]; n = arq.stat().st_size
    with open(arq, "rb") as f:
        u = requests.post(j.get("uri") or f"https://rupload.facebook.com/ig-api-upload/v21.0/{cid}",
                          headers={"Authorization": f"OAuth {tok}", "offset": "0", "file_size": str(n)}, data=f, timeout=1800).json()
    if not u.get("success"):
        # plano B: o Instagram busca o vídeo direto do link do Drive (arquivo compartilhado por link)
        print(f"  instagram: envio direto recusado ({str(u)[:160]}); tentando pelo link do Drive"); 
        j = requests.post(f"{GRAPH}/{uid}/media", data={"media_type": "REELS", "caption": it["legenda"], "share_to_feed": "true", "thumb_offset": "0", "is_ai_generated": "true",
                          "video_url": url_video(it), "access_token": tok}, timeout=120).json()
        if "id" not in j: raise RuntimeError(f"enviar: {u} | link: {j}")
        cid = j["id"]
    for _ in range(90):
        s = requests.get(f"{GRAPH}/{cid}", params={"fields": "status_code,status", "access_token": tok}, timeout=60).json()
        if s.get("status_code") == "FINISHED": break
        if s.get("status_code") in ("ERROR", "EXPIRED"): raise RuntimeError(f"processar: {s}")
        time.sleep(10)
    else: raise RuntimeError("demorou demais para processar")
    p = requests.post(f"{GRAPH}/{uid}/media_publish", data={"creation_id": cid, "access_token": tok}, timeout=120).json()
    if "id" not in p: raise RuntimeError(f"publicar: {p}")
    story("instagram", d, arq)   # regra do dono: postou o Reel, posta também no story
    return p["id"]


def facebook(it, d, arq):
    """Reel da Página do Facebook enviando o ARQUIVO."""
    pid, tok = d["fb_page_id"], d["fb_token"]
    a = requests.post(f"{GRAPH}/{pid}/video_reels", data={"upload_phase": "start", "access_token": tok}, timeout=60).json()
    if "video_id" not in a: raise RuntimeError(f"iniciar: {a}")
    n = arq.stat().st_size
    with open(arq, "rb") as f:
        u = requests.post(a["upload_url"], headers={"Authorization": f"OAuth {tok}", "offset": "0", "file_size": str(n)}, data=f, timeout=1800).json()
    if not u.get("success"): raise RuntimeError(f"enviar: {u}")
    f2 = requests.post(f"{GRAPH}/{pid}/video_reels", data={"upload_phase": "finish", "video_id": a["video_id"], "video_state": "PUBLISHED",
                       "description": it["legenda"], "access_token": tok}, timeout=120).json()
    if not f2.get("success"): raise RuntimeError(f"publicar: {f2}")
    c = capa(arq)   # capa do Reel = PRIMEIRO QUADRO (se falhar, o vídeo já está publicado; só avisa)
    if c:
        try:
            for _ in range(8):
                t = requests.post(f"{GRAPH}/{a['video_id']}/thumbnails", data={"is_preferred": "true", "access_token": tok},
                                  files={"source": (c.name, c.read_bytes(), "image/jpeg")}, timeout=120).json()
                if t.get("success"): print("  capa facebook (primeiro quadro) OK"); break
                time.sleep(15)
            else: print("  AVISO capa facebook:", str(t)[:200])
        except Exception as e: print("  AVISO capa facebook:", str(e)[:200])
    story("facebook", d, arq)   # regra do dono: postou o Reel, posta também no story
    return a["video_id"]


def youtube_ja_postado(conta, access_token, playlist, titulo):
    """ID do vídeo do canal com o mesmo título (evita duplicar), ou None."""
    r = requests.get("https://www.googleapis.com/youtube/v3/playlistItems", params={"part": "snippet", "playlistId": playlist, "maxResults": 50},
                     headers={"Authorization": "Bearer " + access_token}, timeout=60).json()
    for x in r.get("items", []):
        if (x["snippet"].get("title") or "").strip() == titulo.strip(): return x["snippet"]["resourceId"]["videoId"]
    return None

# ---------------------------------------------------------------------------------------------------------------------
# TIKTOK PELA ZERNIO (serviço já aprovado pelo TikTok; plano grátis = 2 contas). Segredo: ZERNIO_API_KEY (só no GitHub).
# O robô acha a conta do perfil pelo nome (@ ou nome de exibição): conta de outro perfil = não publica.
ZERNIO = "https://zernio.com/api/v1"
def _zh(): return {"Authorization": "Bearer " + os.environ["ZERNIO_API_KEY"]}
def _zlista(r, *chaves):
    if isinstance(r, list): return r
    for k in chaves:
        if isinstance(r.get(k), list): return r[k]
    return []
def zernio_conta(conta):
    """Conta do TikTok deste perfil dentro da Zernio (ou None). Nunca devolve conta de outro perfil."""
    if not os.environ.get("ZERNIO_API_KEY"): return None
    r = requests.get(f"{ZERNIO}/accounts", headers=_zh(), timeout=60).json()
    for a in _zlista(r, "accounts", "data"):
        if str(a.get("platform", "")).lower() == "tiktok" and a.get("isActive", True) and bate(conta, a.get("username"), a.get("displayName")):
            return a
    return None
def zernio_tiktok(it, arq):
    conta = it["conta"]; a = zernio_conta(conta)
    if not a: raise RuntimeError(f"tiktok (Zernio): não achei conta do TikTok do perfil {CONTAS[conta]['nome']} conectada. Não publiquei.")
    pre = requests.post(f"{ZERNIO}/media/presign", headers=_zh(), json={"filename": Path(it["arquivo"]).name, "contentType": "video/mp4"}, timeout=60).json()
    if not pre.get("uploadUrl") or not pre.get("publicUrl"): raise RuntimeError(f"zernio presign: {str(pre)[:200]}")
    with open(arq, "rb") as f:
        up = requests.put(pre["uploadUrl"], data=f, headers={"Content-Type": "video/mp4"}, timeout=1800)
    if up.status_code not in (200, 201, 204): raise RuntimeError(f"zernio envio: {up.status_code} {up.text[:200]}")
    corpo = {"content": it["legenda"][:2200], "mediaItems": [{"type": "video", "url": pre["publicUrl"]}],
             "platforms": [{"platform": "tiktok", "accountId": a.get("_id") or a.get("id")}], "publishNow": True,
             "tiktokSettings": {"privacy_level": "PUBLIC_TO_EVERYONE", "allow_comment": True, "allow_duet": True, "allow_stitch": True,
                                "commercial_content_type": "none", "content_preview_confirmed": True, "express_consent_given": True,
                                "media_type": "video", "auto_add_music": False, "video_made_with_ai": True}}
    if a.get("profileId"): corpo["profileId"] = a["profileId"] if isinstance(a["profileId"], str) else (a["profileId"].get("_id") or a["profileId"].get("id"))
    j = requests.post(f"{ZERNIO}/posts", headers=_zh(), json=corpo, timeout=180).json()
    po = j.get("post") or j; pid = po.get("_id") or po.get("id")
    if not pid: raise RuntimeError(f"zernio post: {str(j)[:300]}")
    print(f"  tiktok (Zernio): enviado para @{a.get('username')}, post {pid}")
    return "z:" + str(pid)
def zernio_confirma(pid):
    """Link do TikTok quando a Zernio confirma a publicação; None enquanto processa ou se falhou."""
    j = requests.get(f"{ZERNIO}/posts/{str(pid)[2:]}", headers=_zh(), timeout=60).json(); po = j.get("post") or j
    pl = [x for x in (po.get("platforms") or []) if str(x.get("platform", "")).lower() == "tiktok"]; x = pl[0] if pl else {}
    st = str(x.get("status") or po.get("status") or "").lower()
    if st == "published": return x.get("platformPostUrl") or x.get("url") or ("tiktok:zernio:" + str(pid)[2:])
    if st == "failed": print(f"  tiktok (Zernio) FALHOU: {str(x.get('errorMessage') or x.get('error') or po.get('error'))[:200]}")
    return None

# ---------------------------------------------------------------------------------------------------------------------
# TIKTOK PELO BUFFER (serviço aprovado pelo TikTok; plano grátis = 3 canais por conta do Buffer). Segredos: BUFFER_API_KEY_1, _2...
# O Buffer não recebe arquivo: ele busca o vídeo num link público (o do Drive). Poucas chamadas por post: o plano grátis tem cota mensal.
BUFFER = "https://api.buffer.com"
_BCACHE = Path(tempfile.gettempdir()) / "buffer_cache.json"
def _bchaves(): return [(n, os.environ.get(f"BUFFER_API_KEY_{n}")) for n in range(1, 6) if os.environ.get(f"BUFFER_API_KEY_{n}")]
def _bq(chave, query, variaveis=None):
    r = requests.post(BUFFER, headers={"Authorization": "Bearer " + chave, "Content-Type": "application/json"}, json={"query": query, "variables": variaveis or {}}, timeout=120)
    try: j = r.json()
    except Exception: raise RuntimeError(f"buffer: resposta {r.status_code} {r.text[:200]}")
    if j.get("errors"): raise RuntimeError("buffer: " + str(j["errors"])[:300])
    return j.get("data") or {}
def _bcache(gravar=None):
    if gravar is not None: _BCACHE.write_text(json.dumps(gravar)); return gravar
    try: return json.loads(_BCACHE.read_text())
    except Exception: return {}
def buffer_canais():
    """Canais de TikTok de todas as contas do Buffer: [{n, org, id, nome}]. Guarda por 6 h para gastar pouca cota."""
    c = _bcache()
    if c.get("canais") is not None and c.get("ate", 0) > time.time(): return c["canais"]
    canais = []
    for n, k in _bchaves():
        for o in ((_bq(k, "query { account { organizations { id name } } }").get("account") or {}).get("organizations") or []):
            for ch in (_bq(k, "query($o: OrganizationId!) { channels(input: {organizationId: $o}) { id name displayName service } }", {"o": o["id"]}).get("channels") or []):
                if "tiktok" in str(ch.get("service", "")).lower(): canais.append({"n": n, "org": o["id"], "id": ch["id"], "nome": ch.get("displayName") or ch.get("name"), "name": ch.get("name")})
    c["canais"] = canais; c["ate"] = time.time() + 6 * 3600; _bcache(c); return canais
def buffer_canal(conta):
    """Canal de TikTok deste perfil no Buffer (ou None). Nunca devolve canal de outro perfil."""
    if not _bchaves(): return None
    for ch in buffer_canais():
        if bate(conta, ch.get("nome"), ch.get("name")): return ch
    return None
def buffer_tiktok(it):
    ch = buffer_canal(it["conta"])
    if not ch: raise RuntimeError(f"tiktok (Buffer): não achei canal do TikTok do perfil {CONTAS[it['conta']]['nome']} conectado. Não publiquei.")
    k = dict(_bchaves())[ch["n"]]
    quando = (dt_.datetime.now(dt_.timezone.utc) + dt_.timedelta(minutes=3)).strftime("%Y-%m-%dT%H:%M:%S.000Z")
    url = url_video(it)
    q = """mutation($i: CreatePostInput!) { createPost(input: $i) { ... on PostActionSuccess { post { id status } } ... on MutationError { message } } }"""
    d = _bq(k, q, {"i": {"text": it["legenda"][:2200], "channelId": ch["id"], "schedulingType": "automatic", "mode": "customScheduled", "dueAt": quando,
                         "assets": [{"video": {"url": url, "metadata": {"thumbnailOffset": 0}}}]}}).get("createPost") or {}
    po = d.get("post") or {}
    if not po.get("id"): raise RuntimeError(f"buffer post: {str(d)[:300]}")
    print(f"  tiktok (Buffer {ch['n']}): agendado para já em {ch.get('nome')}, post {po['id']}")
    return f"b:{ch['n']}:{po['id']}:{ch['org']}:{ch['id']}:{int(time.time())}"
def buffer_confirma(pid):
    """'tiktok:buffer:<id>' quando o Buffer marca o post como enviado; None enquanto espera ou se deu erro. Consulta no máximo a cada 5 min."""
    _, n, post, org, canal, t0 = (str(pid).split(":") + ["", "", "", "0"])[:6]
    c = _bcache(); visto = c.setdefault("visto", {})
    if time.time() - int(t0 or 0) < 240 or time.time() - visto.get(post, 0) < 300: return None
    visto[post] = time.time(); _bcache(c)
    k = dict(_bchaves()).get(int(n))
    if not k: return None
    q = "query($o: OrganizationId!, $c: [ChannelId!], $s: [PostStatus!]) { posts(first: 30, input: {organizationId: $o, filter: {status: $s, channelIds: $c}}) { edges { node { id status } } } }"
    for st in ("sent", "error"):
        for e in (((_bq(k, q, {"o": org, "c": [canal], "s": [st]}).get("posts") or {}).get("edges")) or []):
            if (e.get("node") or {}).get("id") == post:
                if st == "sent": return "tiktok:buffer:" + post
                print("  tiktok (Buffer) deu ERRO neste post; veja no painel do Buffer"); return None
    return None


# ---------------- COFRE NO GITHUB (27/11/2026, pedido do dono: o Drive de 15 GB enchia) ----------------
# Assim que o vídeo entra na agenda, o robô copia o MP4 do Drive para um "release" deste repositório (cofre-videos), confere o tamanho
# e marca gh_url no item. A partir daí o Drive pode apagar o arquivo na hora (o script FILA-MAPA faz isso) e tudo é publicado a partir do cofre.
# Depois de publicado e conferido em todas as redes, o arquivo sai do cofre também.
COFRE = "cofre-videos"
def url_video(it): return it.get("gh_url") or f"https://drive.usercontent.google.com/download?id={it['drive_id']}&export=download&confirm=t"
def _ghh(): return {"Authorization": "Bearer " + (os.environ.get("GH_TOKEN") or os.environ.get("GITHUB_TOKEN") or ""), "Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28"}
def cofre_ok(): return bool((os.environ.get("GH_TOKEN") or os.environ.get("GITHUB_TOKEN")) and os.environ.get("GITHUB_REPOSITORY"))
def _cofre():
    repo = os.environ["GITHUB_REPOSITORY"]; r = requests.get(f"https://api.github.com/repos/{repo}/releases/tags/{COFRE}", headers=_ghh(), timeout=60)
    if r.status_code == 404:
        r = requests.post(f"https://api.github.com/repos/{repo}/releases", headers=_ghh(), timeout=60, json={"tag_name": COFRE, "name": "Cofre dos vídeos (uso do robô)", "prerelease": True,
            "body": "Arquivos de passagem do robô de postagem: cada vídeo fica aqui só até ser publicado em todas as redes e é apagado em seguida. Não apague este release."})
    r.raise_for_status(); return r.json()
def guardar(it):
    """Copia o MP4 do Drive para o cofre e devolve {'gh_url', 'gh_asset'}; None se não deu (o item segue pelo Drive, como antes)."""
    if it.get("gh_url") or not it.get("drive_id") or not cofre_ok(): return None
    arq = baixar(it); nome = Path(it["arquivo"]).name; tam = arq.stat().st_size; rel = _cofre(); repo = os.environ["GITHUB_REPOSITORY"]
    for a in rel.get("assets", []):
        if a["name"] == nome:
            if a.get("state") == "uploaded" and a["size"] == tam: return {"gh_url": a["browser_download_url"], "gh_asset": a["id"]}
            requests.delete(f"https://api.github.com/repos/{repo}/releases/assets/{a['id']}", headers=_ghh(), timeout=60)
    with open(arq, "rb") as f:
        r = requests.post(f"https://uploads.github.com/repos/{repo}/releases/{rel['id']}/assets", params={"name": nome}, headers={**_ghh(), "Content-Type": "video/mp4", "Content-Length": str(tam)}, data=f, timeout=1800)
    r.raise_for_status(); a = r.json()
    if a.get("size") != tam: raise RuntimeError(f"cofre: subiu {a.get('size')} bytes, esperado {tam}")
    h = requests.get(a["browser_download_url"], headers={"Range": "bytes=0-15"}, timeout=120)
    if h.status_code not in (200, 206) or b"ftyp" not in h.content: raise RuntimeError("cofre: o arquivo guardado não abre pelo link público")
    return {"gh_url": a["browser_download_url"], "gh_asset": a["id"]}
def soltar(it):
    """Apaga do cofre o vídeo já publicado e conferido (melhor esforço)."""
    try:
        if it.get("gh_asset") and cofre_ok(): requests.delete(f"https://api.github.com/repos/{os.environ['GITHUB_REPOSITORY']}/releases/assets/{it['gh_asset']}", headers=_ghh(), timeout=60)
    except Exception: pass


# ---------------- DRIVE COM LOGIN (27/11/2026) ----------------
# O link público do Drive tem um limite diário de downloads ("Quota exceeded") que parou o robô. Com o login do dono (permissão drive.file:
# só enxerga arquivos criados por este app) o robô cria a sessão de envio, baixa e apaga os vídeos sem depender do link público.
_DT = {}
def drive_token():
    rt = os.environ.get("DRIVE_REFRESH_TOKEN")
    if not rt: return None
    if _DT.get("ate", 0) > time.time() + 120: return _DT["t"]
    try:
        r = requests.post("https://oauth2.googleapis.com/token", data={"client_id": os.environ.get("YT_CLIENT_ID__MAPAS"), "client_secret": os.environ.get("YT_CLIENT_SECRET__MAPAS"), "refresh_token": rt, "grant_type": "refresh_token"}, timeout=60).json()
        if "access_token" not in r: print("  (Drive com login: token recusado:", str(r)[:120] + ")"); return None
        _DT.update(t=r["access_token"], ate=time.time() + int(r.get("expires_in", 3000))); return _DT["t"]
    except Exception as e: print("  (Drive com login:", str(e)[:100] + ")"); return None
def _drive_get(fid, tk):
    """Baixa do Drive: com login quando o arquivo é do app; senão (arquivo antigo, criado pelo script FILA-MAPA) pelo link público."""
    if tk:
        r = requests.get(f"https://www.googleapis.com/drive/v3/files/{fid}", params={"alt": "media", "supportsAllDrives": "true"}, headers={"Authorization": "Bearer " + tk}, stream=True, timeout=600)
        if r.status_code == 200: return r
        r.close()
    return requests.get("https://drive.usercontent.google.com/download", params={"id": fid, "export": "download", "confirm": "t"}, stream=True, timeout=600)
def drive_do_app(fid):
    tk = drive_token()
    if not tk: return False
    try: return requests.get(f"https://www.googleapis.com/drive/v3/files/{fid}", params={"fields": "id"}, headers={"Authorization": "Bearer " + tk}, timeout=60).status_code == 200
    except Exception: return False
def drive_apagar(fid):
    tk = drive_token()
    if not tk: return False
    try: return requests.delete(f"https://www.googleapis.com/drive/v3/files/{fid}", headers={"Authorization": "Bearer " + tk}, timeout=60).status_code in (204, 404)
    except Exception: return False
PASTA_ROBO = "ROBO-MAPAS (vídeos de passagem; o robô apaga sozinho)"
def drive_pasta():
    if _DT.get("pasta"): return _DT["pasta"]
    H = {"Authorization": "Bearer " + drive_token()}
    r = requests.get("https://www.googleapis.com/drive/v3/files", params={"q": "mimeType='application/vnd.google-apps.folder' and trashed=false and name='" + PASTA_ROBO + "'", "fields": "files(id)"}, headers=H, timeout=60).json()
    if r.get("files"): _DT["pasta"] = r["files"][0]["id"]
    else:
        c = requests.post("https://www.googleapis.com/drive/v3/files", params={"fields": "id"}, headers=H, json={"name": PASTA_ROBO, "mimeType": "application/vnd.google-apps.folder"}, timeout=60); c.raise_for_status(); _DT["pasta"] = c.json()["id"]
    return _DT["pasta"]
def drive_sessao(nome, tam):
    """Abre uma sessão de envio (o arquivo nasce como do app, na pasta do robô). Devolve a URL para a sessão que fez o vídeo mandar os bytes."""
    r = requests.post("https://www.googleapis.com/upload/drive/v3/files", params={"uploadType": "resumable", "fields": "id,name,size,sha256Checksum"}, timeout=60,
                      headers={"Authorization": "Bearer " + drive_token(), "X-Upload-Content-Type": "video/mp4", "X-Upload-Content-Length": str(int(tam)), "Content-Type": "application/json; charset=UTF-8"},
                      data=json.dumps({"name": nome, "parents": [drive_pasta()]}).encode("utf-8"))
    r.raise_for_status(); return r.headers["Location"]
PEDIDOS, RESPOSTAS = AQUI / "pedidos", AQUI / "respostas"
def atender_pedidos():
    """Sessões pedem o envio gravando agendador/pedidos/<id>.json ({"nome","tamanho","sha256"}); o robô responde em agendador/respostas/<id>.json
    com a URL da sessão de envio. Devolve True se escreveu ou apagou algo (quem chama faz o commit)."""
    if not PEDIDOS.is_dir(): return False
    mudou = False; RESPOSTAS.mkdir(exist_ok=True)
    for p in sorted(PEDIDOS.glob("*.json")):
        try:
            d = json.loads(p.read_text(encoding="utf-8")); rp = RESPOSTAS / p.name; velho = time.time() - float(d.get("ts", 0)) > 36 * 3600
            if velho: p.unlink(); rp.unlink(missing_ok=True); mudou = True; continue
            if rp.exists() and json.loads(rp.read_text(encoding="utf-8")).get("sha256") == d.get("sha256"): continue
            if not drive_token(): continue
            if not (str(d.get("nome", "")).lower().endswith(".mp4") and 1_000_000 < int(d["tamanho"]) < 2_000_000_000 and len(str(d.get("sha256", ""))) == 64): continue
            url = drive_sessao(str(d["nome"])[:180], d["tamanho"])
            rp.write_text(json.dumps({"sessao": url, "sha256": d["sha256"], "ts": time.time()}), encoding="utf-8"); mudou = True; print(f"[pedido {p.stem}] sessão de envio aberta no Drive (com login)")
        except Exception as e: print(f"[pedido {p.name}] não consegui atender: {str(e)[:160]}")
    return mudou

# ---------------- MUDANÇA DOS VÍDEOS ANTIGOS (27/11/2026) ----------------
# Os vídeos do caminho antigo só saem do Drive pelo link público, que o Google bloqueou ("Quota exceeded"). O robô abre uma sessão de envio para
# cada um e publica a lista em agendador/mudanca.json; o script do Drive do dono (função mudar, com o login DELE) copia o arquivo para a sessão,
# confere que a cópia é idêntica (md5), renomeia para "ok-<id antigo>.mp4" e apaga o original. Só arquivo com o nome "ok-" (que só o dono consegue
# dar) é aceito aqui: o item passa a apontar para a cópia e segue pelo caminho novo (baixa com login, cofre, posta, apaga).
MUDANCA = AQUI / "mudanca.json"
def mudanca(ag):
    """Devolve (lista para gravar em mudanca.json ou None se não mudou, trocas=[(item, campos novos)])."""
    tk = drive_token()
    if not tk: return None, []
    try: atual = json.loads(MUDANCA.read_text(encoding="utf-8"))
    except Exception: atual = []
    presos = {}
    for it in ag:
        if str(it.get("conta", "")).startswith("mapa-") and it.get("drive_id") and not it.get("gh_url") and not it.get("sha256") and int(it.get("tamanho") or 0) > 1_000_000:
            presos.setdefault(it["drive_id"], []).append(it)
    if not presos and not atual: return None, []
    H = {"Authorization": "Bearer " + tk}; prontos = {}
    r = requests.get("https://www.googleapis.com/drive/v3/files", params={"q": "name contains 'ok-' and trashed=false", "fields": "files(id,name,size,sha256Checksum)", "pageSize": 200}, headers=H, timeout=60).json()
    for f in r.get("files", []):
        if f.get("name", "").startswith("ok-") and f["name"].endswith(".mp4"): prontos[f["name"][3:-4]] = f
    trocas, lista = [], []; velhos = {e["antigo"]: e for e in atual if e.get("antigo")}
    for d, itens in presos.items():
        tam = int(itens[0]["tamanho"]); f = prontos.get(d)
        if f and int(f.get("size") or 0) == tam and len(f.get("sha256Checksum") or "") == 64:
            for it in itens: trocas.append((it, {"drive_id": f["id"], "sha256": f["sha256Checksum"], "drive_antigo": d}))
            continue
        e = velhos.get(d)
        if not e or time.time() - float(e.get("ts", 0)) > 5 * 86400 or int(e.get("tamanho", 0)) != tam:
            try: e = {"antigo": d, "tamanho": tam, "sessao": drive_sessao(f"mud-{d}.mp4", tam), "ts": int(time.time())}; print(f"mudança: sessão aberta para o vídeo antigo {d}")
            except Exception as x: print("mudança:", str(x)[:120]); continue
        lista.append(e)
    return (lista if lista != atual else None), trocas

def faxina(ag):
    """Apaga do cofre o que não pertence a nenhum item da agenda (sobras de teste ou de item removido), com mais de 1 h."""
    try:
        if not cofre_ok(): return
        nomes = {Path(x.get("arquivo", "")).name for x in ag}; repo = os.environ["GITHUB_REPOSITORY"]
        for a in _cofre().get("assets", []):
            idade = time.time() - dt_.datetime.fromisoformat(a["created_at"].replace("Z", "+00:00")).timestamp()
            if a["name"] not in nomes and idade > 3600: requests.delete(f"https://api.github.com/repos/{repo}/releases/assets/{a['id']}", headers=_ghh(), timeout=60); print("cofre: sobra apagada:", a["name"])
    except Exception as e: print("cofre: faxina:", str(e)[:120])


# ---------------- CIDADES JÁ FEITAS (27/11/2026) ----------------
# A pasta FEITAS-MAPA do Drive sumiu. O registro passa a morar aqui, em agendador/feitas/<conta>.txt, e é RECONSTRUÍDO a partir do que
# está de fato publicado: títulos do YouTube e legendas do Instagram de cada perfil (inclui o que o dono postou à mão), mais a agenda e os publicados.
FEITAS = AQUI / "feitas"
def feitas_reais(conta, yt_token=None):
    """Primeira linha de cada legenda/título já publicado no perfil, do mais antigo para o mais novo."""
    L = []
    try:
        m = meta(conta); url, p = f"{GRAPH}/{m['ig_user_id']}/media", {"fields": "caption,timestamp", "limit": 100, "access_token": m["fb_token"]}
        for _ in range(30):
            r = requests.get(url, params=p, timeout=60).json()
            for x in r.get("data", []):
                c = (x.get("caption") or "").strip().split("\n")[0].strip()
                if c: L.append((x.get("timestamp", ""), c))
            url = (r.get("paging") or {}).get("next"); p = {}
            if not url: break
    except Exception as e: print(f"  feitas {conta}: instagram: {str(e)[:100]}")
    try:
        if yt_token:
            _, pl = guarda_youtube(conta, yt_token); tok = None
            for _ in range(30):
                r = requests.get("https://www.googleapis.com/youtube/v3/playlistItems", params={"part": "snippet", "playlistId": pl, "maxResults": 50, **({"pageToken": tok} if tok else {})}, headers={"Authorization": "Bearer " + yt_token}, timeout=60).json()
                for x in r.get("items", []):
                    sn = x.get("snippet") or {}; t = (sn.get("title") or "").strip()
                    if t and t not in ("Private video", "Deleted video"): L.append((sn.get("publishedAt", ""), t))
                tok = r.get("nextPageToken")
                if not tok: break
    except Exception as e: print(f"  feitas {conta}: youtube: {str(e)[:100]}")
    vistos, out = set(), []
    for _, c in sorted(L):
        k = norm(c.split(":")[0].split("#")[0])[:40]
        if k and k not in vistos: vistos.add(k); out.append(c[:160])
    return out

# ---------------- MÉTRICAS (27/11/2026): o que está dando certo de verdade ----------------
# A cada 3 h o robô anota, por perfil, os números dos últimos Reels do Instagram (alcance, visualizações, tempo médio assistido, envios,
# salvamentos, curtidas, comentários) em agendador/metricas/<conta>.json. Serve para comparar curto x longo, gancho, tema e horário
# com dado real, em vez de palpite. Só leitura; se a permissão de insights não existir, grava só curtidas e comentários.
METRICAS = AQUI / "metricas"
def metricas(conta, n=40):
    m = meta(conta); tok = m.get("ig_token") or m["fb_token"]; out = []
    r = requests.get(f"{GRAPH}/{m['ig_user_id']}/media", params={"fields": "id,caption,timestamp,like_count,comments_count,permalink,media_product_type", "limit": n, "access_token": tok}, timeout=60).json()
    sem = False
    for x in r.get("data", []):
        d = {"id": x["id"], "quando": x.get("timestamp"), "legenda": (x.get("caption") or "").split("\n")[0][:120], "link": x.get("permalink"), "tipo": x.get("media_product_type"), "curtidas": x.get("like_count"), "comentarios": x.get("comments_count")}
        if not sem and x.get("media_product_type") == "REELS":
            try:
                i = requests.get(f"{GRAPH}/{x['id']}/insights", params={"metric": "reach,views,saved,shares,total_interactions,ig_reels_avg_watch_time,ig_reels_video_view_total_time", "access_token": tok}, timeout=60).json()
                if "data" in i:
                    for q in i["data"]: d[q["name"]] = (q.get("values") or [{}])[0].get("value")
                else: sem = True; d["insights_erro"] = str(i.get("error", {}).get("message", ""))[:140]
            except Exception as e: d["insights_erro"] = str(e)[:100]
        out.append(d)
    # comentários mais curtidos dos 8 Reels mais comentados (só o texto, sem nome de ninguém): pedidos e dúvidas viram pauta
    try:
        for d in sorted(out, key=lambda q: -(q.get("comentarios") or 0))[:20]:
            if not d.get("comentarios"): continue
            c = requests.get(f"{GRAPH}/{d['id']}/comments", params={"fields": "text,like_count", "limit": 50, "access_token": tok}, timeout=60).json()
            d["comentarios_top"] = [str(x.get("text", ""))[:200] for x in sorted(c.get("data", []), key=lambda q: -(q.get("like_count") or 0))[:8] if x.get("text")]
            d["comentarios_lidos"] = len(c.get("data", [])); d["mapa_nos_comentarios"] = sum(1 for x in c.get("data", []) if "mapa" in str(x.get("text", "")).lower())
    except Exception as e: print(f"  comentários {conta}: {str(e)[:100]}")
    return out

def drive_faxina(ag):
    """Mantém o Drive com espaço: apaga da pasta do robô o que não pertence a nenhum item da agenda (sobras de envio interrompido ou de item removido,
    com mais de 6 h) e o que já está no cofre. Devolve o texto do espaço usado. Só enxerga arquivos criados pelo próprio robô."""
    tk = drive_token()
    if not tk: return None
    H = {"Authorization": "Bearer " + tk}; vivos = {x.get("drive_id") for x in ag if x.get("drive_id") and not x.get("gh_url")}; n = 0
    try:
        r = requests.get("https://www.googleapis.com/drive/v3/files", params={"q": "mimeType='video/mp4'", "fields": "files(id,name,createdTime,trashed)", "pageSize": 200}, headers=H, timeout=60).json()
        for f in r.get("files", []):
            idade = time.time() - dt_.datetime.fromisoformat(f["createdTime"].replace("Z", "+00:00")).timestamp()
            if f["id"] not in vivos and (idade > 6 * 3600 or f.get("trashed")):
                if drive_apagar(f["id"]): n += 1; print("Drive: sobra apagada:", f.get("name", "")[:60])
        q = requests.get("https://www.googleapis.com/drive/v3/about", params={"fields": "storageQuota(limit,usage,usageInDriveTrash)"}, headers=H, timeout=60).json().get("storageQuota", {})
        return f"Drive: {int(q.get('usage', 0)) / 1e9:.1f} GB usados de {int(q.get('limit', 0)) / 1e9:.0f} GB (lixeira: {int(q.get('usageInDriveTrash', 0)) / 1e9:.1f} GB) | sobras apagadas agora: {n} | conferido em {dt_.datetime.now(dt_.timezone(dt_.timedelta(hours=-3))).strftime('%d/%m %H:%M')}"
    except Exception as e: print("Drive: faxina:", str(e)[:120]); return None
