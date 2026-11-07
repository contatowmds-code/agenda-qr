#!/usr/bin/env python3
"""Publica os vídeos da agenda.json que já passaram do horário (rodado pelo GitHub Actions a cada 15 min).
Plataformas: instagram (Reels), facebook (Reels da Página), tiktok, youtube (Shorts). Plataforma sem credencial é pulada (não dá erro).
Contas: cada vídeo da agenda pode ter "conta" (ex.: quanto-rende, quanto-vale, arquivo-viral) e só posta nela.
Segredos do GitHub: META_ACCOUNTS (JSON, Instagram+Facebook de todas as contas) | (antigo, 1 conta) IG_USER_ID, IG_TOKEN | FB_PAGE_ID, FB_PAGE_TOKEN | TT_CLIENT_KEY, TT_CLIENT_SECRET, TT_REFRESH_TOKEN (TT_PRIVACY opcional)
                    | YT_CLIENT_ID, YT_CLIENT_SECRET, YT_REFRESH_TOKEN.
Uso: python publicar.py [--dry-run]"""
import json, math, os, sys, time, datetime as dt
from pathlib import Path
from zoneinfo import ZoneInfo
import requests

AQUI = Path(__file__).resolve().parent
AGENDA = AQUI / "agenda.json"
VIDEOS = Path(os.environ.get("VIDEOS_DIR", AQUI / "videos"))   # pasta com os mp4 (branch "videos")
GRAPH = "https://graph.facebook.com/v21.0"
DRY = "--dry-run" in sys.argv
NECESSARIOS = {"instagram": ["IG_USER_ID", "IG_TOKEN"], "facebook": ["FB_PAGE_ID", "FB_PAGE_TOKEN"],
               "tiktok": ["TT_CLIENT_KEY", "TT_CLIENT_SECRET", "TT_REFRESH_TOKEN"],
               "youtube": ["YT_CLIENT_ID", "YT_CLIENT_SECRET", "YT_REFRESH_TOKEN"]}

def conta_id(it): return (it.get("conta") or "").strip()

def env(var, it):
    """Credencial da conta do vídeo: primeiro VAR__CONTA (ex.: YT_REFRESH_TOKEN__QUANTO_RENDE), senão VAR."""
    c = conta_id(it).upper().replace("-", "_")
    return (os.environ.get(f"{var}__{c}") if c else None) or os.environ.get(var)

def meta(it):
    """Credenciais Meta da conta do vídeo. META_ACCOUNTS = JSON {"quanto-rende": {"fb_page_id","fb_token","ig_user_id"}, ...}.
    Vídeo com "conta" só posta na conta dele; sem "conta", usa os segredos antigos (IG_*/FB_*)."""
    contas = json.loads(os.environ.get("META_ACCOUNTS") or "{}")
    c = conta_id(it)
    if c:
        d = contas.get(c)
        if not d: raise RuntimeError(f"conta '{c}' não existe em META_ACCOUNTS")
        return d
    return {"fb_page_id": os.environ.get("FB_PAGE_ID"), "fb_token": os.environ.get("FB_PAGE_TOKEN"),
            "ig_user_id": os.environ.get("IG_USER_ID"), "ig_token": os.environ.get("IG_TOKEN")}

def tem_credencial(plat, it):
    if plat in ("instagram", "facebook"):
        try: d = meta(it)
        except Exception: return False
        chaves = ["ig_user_id", "ig_token" if "ig_token" in d else "fb_token"] if plat == "instagram" else ["fb_page_id", "fb_token"]
        return all(d.get(k) for k in chaves)
    return all(env(v, it) for v in NECESSARIOS[plat])

def agora(): return dt.datetime.now(dt.timezone.utc)
def arquivo(item): return VIDEOS / Path(item["arquivo"]).name
def url_publica(item):
    return f"https://raw.githubusercontent.com/{os.environ.get('GITHUB_REPOSITORY', 'USUARIO/REPO')}/videos/videos/{Path(item['arquivo']).name}"

def url_capa(item):
    return f"https://raw.githubusercontent.com/{os.environ.get('GITHUB_REPOSITORY', 'USUARIO/REPO')}/videos/videos/{Path(item['capa']).name}" if item.get("capa") else None
def capa_local(item):
    f = VIDEOS / Path(item["capa"]).name if item.get("capa") else None
    return f if f and f.exists() else None

def instagram(it, com_capa=True):
    d = meta(it); uid, tok = d["ig_user_id"], d.get("ig_token") or d["fb_token"]
    cap = url_capa(it) if com_capa else None
    j = requests.post(f"{GRAPH}/{uid}/media", data={"media_type": "REELS", "video_url": url_publica(it), "caption": it["legenda"],
                      "share_to_feed": "true", "access_token": tok} | ({"cover_url": cap} if cap else {}), timeout=120).json()
    if "id" not in j:
        if cap: print("  AVISO instagram: criar com capa falhou, tentando sem capa:", str(j)[:200]); return instagram(it, False)
        raise RuntimeError(f"criar: {j}")
    cid = j["id"]
    for _ in range(60):
        s = requests.get(f"{GRAPH}/{cid}", params={"fields": "status_code,status", "access_token": tok}, timeout=60).json()
        if s.get("status_code") == "FINISHED": break
        if s.get("status_code") in ("ERROR", "EXPIRED"):
            if cap: print("  AVISO instagram: processar com capa falhou, tentando sem capa:", str(s)[:200]); return instagram(it, False)
            raise RuntimeError(f"processar: {s}")
        time.sleep(10)
    else: raise RuntimeError("demorou demais para processar")
    p = requests.post(f"{GRAPH}/{uid}/media_publish", data={"creation_id": cid, "access_token": tok}, timeout=120).json()
    if "id" not in p: raise RuntimeError(f"publicar: {p}")
    return p["id"]

def facebook(it):
    d = meta(it); pid, tok = d["fb_page_id"], d["fb_token"]
    a = requests.post(f"{GRAPH}/{pid}/video_reels", data={"upload_phase": "start", "access_token": tok}, timeout=60).json()
    if "video_id" not in a: raise RuntimeError(f"iniciar: {a}")
    u = requests.post(a["upload_url"], headers={"Authorization": f"OAuth {tok}", "file_url": url_publica(it)}, timeout=300).json()
    if not u.get("success"): raise RuntimeError(f"enviar: {u}")
    for _ in range(60):
        s = requests.get(f"{GRAPH}/{a['video_id']}", params={"fields": "status", "access_token": tok}, timeout=60).json()
        if s.get("status", {}).get("uploading_phase", {}).get("status") == "complete": break
        time.sleep(10)
    f = requests.post(f"{GRAPH}/{pid}/video_reels", data={"upload_phase": "finish", "video_id": a["video_id"], "video_state": "PUBLISHED",
                      "description": it["legenda"], "access_token": tok}, timeout=120).json()
    if not f.get("success"): raise RuntimeError(f"publicar: {f}")
    c = capa_local(it)   # capa do Reel (melhor esforço: se falhar, o vídeo já está publicado)
    if c:
        try:
            for _ in range(6):
                t = requests.post(f"{GRAPH}/{a['video_id']}/thumbnails", data={"is_preferred": "true", "access_token": tok},
                                  files={"source": (c.name, c.read_bytes(), "image/jpeg")}, timeout=120).json()
                if t.get("success"): print("  capa facebook OK"); break
                time.sleep(10)
            else: print("  AVISO capa facebook:", str(t)[:200])
        except Exception as e: print("  AVISO capa facebook:", str(e)[:200])
    return a["video_id"]

def tiktok(it):
    r = requests.post("https://open.tiktokapis.com/v2/oauth/token/", data={"client_key": env("TT_CLIENT_KEY", it),
        "client_secret": env("TT_CLIENT_SECRET", it), "grant_type": "refresh_token", "refresh_token": env("TT_REFRESH_TOKEN", it)}, timeout=60).json()
    if "access_token" not in r: raise RuntimeError(f"token: {r}")
    dados = arquivo(it).read_bytes(); n = len(dados)
    chunk = n if n <= 64 * 1024 * 1024 else 32 * 1024 * 1024
    total = max(1, n // chunk)
    h = {"Authorization": f"Bearer {r['access_token']}", "Content-Type": "application/json; charset=UTF-8"}
    ini = requests.post("https://open.tiktokapis.com/v2/post/publish/video/init/", headers=h, data=json.dumps({
        "post_info": {"title": it["legenda"][:150], "privacy_level": os.environ.get("TT_PRIVACY", "SELF_ONLY"),
                      "disable_duet": False, "disable_comment": False, "disable_stitch": False},
        "source_info": {"source": "FILE_UPLOAD", "video_size": n, "chunk_size": chunk, "total_chunk_count": total}}), timeout=60).json()
    if ini.get("error", {}).get("code", "ok") != "ok": raise RuntimeError(f"iniciar: {ini}")
    d = ini["data"]
    for k in range(total):
        a = k * chunk; b = n if k == total - 1 else a + chunk
        up = requests.put(d["upload_url"], data=dados[a:b], headers={"Content-Type": "video/mp4", "Content-Length": str(b - a),
                          "Content-Range": f"bytes {a}-{b-1}/{n}"}, timeout=600)
        if up.status_code not in (200, 201, 206): raise RuntimeError(f"enviar: {up.status_code} {up.text[:200]}")
    return d["publish_id"]

def youtube(it):
    tok = requests.post("https://oauth2.googleapis.com/token", data={"client_id": env("YT_CLIENT_ID", it),
          "client_secret": env("YT_CLIENT_SECRET", it), "refresh_token": env("YT_REFRESH_TOKEN", it), "grant_type": "refresh_token"}, timeout=60).json()
    if "access_token" not in tok: raise RuntimeError(f"token: {tok}")
    meta = {"snippet": {"title": it["legenda"].split("#")[0].strip()[:90] + " #Shorts", "description": it["legenda"], "categoryId": "22"},
            "status": {"privacyStatus": "public", "selfDeclaredMadeForKids": False}}
    h = {"Authorization": f"Bearer {tok['access_token']}", "Content-Type": "application/json; charset=UTF-8", "X-Upload-Content-Type": "video/mp4"}
    r = requests.post("https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status", headers=h, data=json.dumps(meta), timeout=60)
    loc = r.headers.get("Location")
    if not loc: raise RuntimeError(f"iniciar: {r.text[:300]}")
    up = requests.put(loc, data=arquivo(it).read_bytes(), headers={"Content-Type": "video/mp4"}, timeout=1200).json()
    if "id" not in up: raise RuntimeError(f"enviar: {up}")
    c = capa_local(it)   # capa do YouTube (melhor esforço)
    if c:
        try:
            r2 = requests.post(f"https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId={up['id']}", headers={"Authorization": f"Bearer {tok['access_token']}", "Content-Type": "image/jpeg"}, data=c.read_bytes(), timeout=120)
            print("  capa youtube", "OK" if r2.status_code == 200 else f"AVISO {r2.status_code} {r2.text[:160]}")
        except Exception as e: print("  AVISO capa youtube:", str(e)[:200])
    return up["id"]


def verificar(ag):
    """Rodada manual (workflow_dispatch): confere cada conta/plataforma da agenda SEM publicar nada (só leituras)."""
    vistos = set()
    for it in ag:
        for plat in it.get("plataformas", ["instagram"]):
            chave = (conta_id(it), plat)
            if chave in vistos: continue
            vistos.add(chave); rot = f"[{conta_id(it) or 'padrão'}] {plat}"
            try:
                if plat == "instagram":
                    d = meta(it); tok = d.get("ig_token") or d["fb_token"]
                    r = requests.get(f"{GRAPH}/{d['ig_user_id']}", params={"fields": "username", "access_token": tok}, timeout=60).json()
                    print(rot, "OK @" + r["username"] if "username" in r else f"FALHOU {str(r)[:160]}")
                elif plat == "facebook":
                    d = meta(it)
                    r = requests.get(f"{GRAPH}/{d['fb_page_id']}", params={"fields": "name", "access_token": d["fb_token"]}, timeout=60).json()
                    print(rot, "OK " + r["name"] if "name" in r else f"FALHOU {str(r)[:160]}")
                elif plat == "youtube":
                    if not tem_credencial(plat, it): print(rot, "sem credenciais (pulado)"); continue
                    t = requests.post("https://oauth2.googleapis.com/token", data={"client_id": env("YT_CLIENT_ID", it), "client_secret": env("YT_CLIENT_SECRET", it), "refresh_token": env("YT_REFRESH_TOKEN", it), "grant_type": "refresh_token"}, timeout=60).json()
                    if "access_token" not in t: print(rot, f"FALHOU {str(t)[:160]}"); continue
                    c = requests.get("https://www.googleapis.com/youtube/v3/channels", params={"part": "snippet", "mine": "true"}, headers={"Authorization": "Bearer " + t["access_token"]}, timeout=60).json()
                    print(rot, "OK canal " + c["items"][0]["snippet"]["title"] if c.get("items") else f"token ok, canal não lido {str(c)[:120]}")
                elif plat == "tiktok":
                    if not tem_credencial(plat, it): print(rot, "sem credenciais (pulado)"); continue
                    t = requests.post("https://open.tiktokapis.com/v2/oauth/token/", data={"client_key": env("TT_CLIENT_KEY", it), "client_secret": env("TT_CLIENT_SECRET", it), "grant_type": "refresh_token", "refresh_token": env("TT_REFRESH_TOKEN", it)}, timeout=60).json()
                    print(rot, "OK token" if "access_token" in t else f"FALHOU {str(t)[:160]}")
            except Exception as e:
                print(rot, "FALHOU", str(e)[:160])

def links_publicados(ag):
    """Modo verificação: mostra o link e a data de cada vídeo já publicado no Instagram/Facebook (só leitura)."""
    for it in ag:
        for plat, pid in (it.get("feito") or {}).items():
            try:
                if plat == "instagram":
                    d = meta(it); tok = d.get("ig_token") or d["fb_token"]
                    r = requests.get(f"{GRAPH}/{pid}", params={"fields": "permalink,timestamp,media_type", "access_token": tok}, timeout=60).json()
                    print(f"[{it['id'][:34]}] instagram", r.get("permalink") or str(r)[:160], r.get("timestamp", ""))
                elif plat == "facebook":
                    d = meta(it)
                    r = requests.get(f"{GRAPH}/{pid}", params={"fields": "permalink_url,created_time,published", "access_token": d["fb_token"]}, timeout=60).json()
                    print(f"[{it['id'][:34]}] facebook", ("https://www.facebook.com" + r["permalink_url"]) if r.get("permalink_url") else str(r)[:160], r.get("created_time", ""), "publicado=" + str(r.get("published")))
                elif plat == "youtube":
                    print(f"[{it['id'][:34]}] youtube https://youtu.be/{pid}")
            except Exception as e:
                print(f"[{it['id'][:34]}] {plat} FALHOU", str(e)[:120])

FUNCS = {"instagram": instagram, "facebook": facebook, "tiktok": tiktok, "youtube": youtube}

import subprocess, random
def _git(*c): return subprocess.run(["git", *c], cwd=str(AQUI.parent), capture_output=True, text=True)

def remoto_feito(it, plat):
    """Confere na versão MAIS NOVA da agenda (origin/main) se outro robô/sessão já publicou isto (evita repetir)."""
    if not os.environ.get("GITHUB_ACTIONS"): return False
    try:
        _git("fetch", "-q", "origin", "main")
        r = _git("show", "origin/main:agendador/agenda.json")
        for x in json.loads(r.stdout):
            if x.get("id") == it["id"] and x.get("arquivo") == it["arquivo"] and (x.get("feito") or {}).get(plat): return True
    except Exception: pass
    return False

def persistir(it, plat, valor=None, erro=None):
    """Grava NA HORA (com várias tentativas) o resultado desta publicação na agenda do GitHub, mesmo que outras sessões também estejam gravando."""
    if DRY or not os.environ.get("GITHUB_ACTIONS"): return True
    _git("config", "user.name", "agendador"); _git("config", "user.email", "agendador@users.noreply.github.com")
    for tent in range(8):
        _git("fetch", "-q", "origin", "main"); _git("reset", "-q", "--hard", "origin/main")
        ag = json.loads(AGENDA.read_text(encoding="utf-8"))
        for x in ag:
            if x.get("id") == it["id"] and x.get("arquivo") == it["arquivo"]:
                if valor: x.setdefault("feito", {})[plat] = valor; (x.get("erros") or {}).pop(plat, None)
                if erro: x.setdefault("erros", {})[plat] = erro
        AGENDA.write_text(json.dumps(ag, ensure_ascii=False, indent=1), encoding="utf-8")
        _git("add", "agendador/agenda.json")
        if _git("diff", "--cached", "--quiet").returncode == 0: return True
        _git("commit", "-q", "-m", f"agenda: {plat} {'ok' if valor else 'erro'} - {it['id'][:30]}")
        if _git("push", "-q", "origin", "HEAD:main").returncode == 0: return True
        time.sleep(1.5 + random.random() * 2)
    print("  AVISO: não consegui gravar na agenda:", it["id"], plat)
    return False

def main():
    ag = json.loads(AGENDA.read_text(encoding="utf-8")); mudou = False
    if os.environ.get("GITHUB_EVENT_NAME") == "workflow_dispatch" or "--verificar" in sys.argv: verificar(ag); links_publicados(ag)
    for it in ag:
        q = dt.datetime.fromisoformat(it["quando"])
        if q.tzinfo is None: q = q.replace(tzinfo=ZoneInfo("America/Sao_Paulo"))
        if q > agora(): continue
        for plat in it.get("plataformas", ["instagram"]):
            if it.setdefault("feito", {}).get(plat): continue
            if not DRY and remoto_feito(it, plat): print(f"[{it['id']}] {plat}: já publicado por outra rodada (pulado)"); continue
            if not tem_credencial(plat, it) and not DRY: print(f"[{it['id']}] {plat} ({conta_id(it) or 'padrão'}): pulado (sem credencial)"); continue
            print(f"[{it['id']}] {plat}: publicando")
            if DRY: continue
            try:
                it["feito"][plat] = FUNCS[plat](it); it.get("erros", {}).pop(plat, None); print(f"  OK {plat}"); persistir(it, plat, valor=it["feito"][plat])
            except Exception as e:
                print(f"  ERRO {plat}: {e}"); it.setdefault("erros", {})[plat] = str(e)[:300]; persistir(it, plat, erro=str(e)[:300])
            mudou = True
    if mudou and not DRY and not os.environ.get("GITHUB_ACTIONS"): AGENDA.write_text(json.dumps(ag, ensure_ascii=False, indent=1), encoding="utf-8")
    print("pronto.")

if __name__ == "__main__": main()
