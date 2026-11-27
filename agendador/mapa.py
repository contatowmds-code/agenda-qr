#!/usr/bin/env python3
"""Perfis "[Lugar] no Mapa": acha as credenciais de cada perfil, TRAVA contra conta errada, baixa o vídeo do Drive
e envia o arquivo direto (sem link público do GitHub) para Instagram e Facebook, com o aviso de conteúdo feito com IA.
Regras: cada perfil só publica na conta cujo nome bate com a "chave" de contas_mapa.json (ex.: catarinensenomapa).
Se o nome não bater, NÃO publica. Nenhum token é impresso."""
import json, os, tempfile, time, unicodedata
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
            with requests.get("https://drive.usercontent.google.com/download", params={"id": it["drive_id"], "export": "download", "confirm": "t"}, stream=True, timeout=600) as r:
                r.raise_for_status()
                with open(dest, "wb") as f:
                    for b in r.iter_content(1 << 20): f.write(b)
            n = dest.stat().st_size
            with open(dest, "rb") as f: cab = f.read(16)
            if b"ftyp" in cab and (not tam or n == tam): return dest
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
                          "video_url": f"https://drive.usercontent.google.com/download?id={it['drive_id']}&export=download&confirm=t", "access_token": tok}, timeout=120).json()
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
