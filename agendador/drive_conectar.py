#!/usr/bin/env python3
"""Conecta o Google Drive do dono ao robô dos mapas (permissão drive.file: o robô só enxerga os arquivos que ele mesmo cria).
Mostra um código curto; o dono abre google.com/device, digita o código e permite. O robô confere a conta, testa o Drive
e grava o segredo DRIVE_REFRESH_TOKEN direto no GitHub (precisa de GH_PAT_SEGREDOS). Nenhum token é impresso."""
import base64, os, subprocess, sys, time
from pathlib import Path
import requests
cid, cs, pat = os.environ.get("YT_CLIENT_ID__MAPAS"), os.environ.get("YT_CLIENT_SECRET__MAPAS"), os.environ.get("GH_PAT_SEGREDOS")
falta = [n for n, v in (("YT_CLIENT_ID__MAPAS", cid), ("YT_CLIENT_SECRET__MAPAS", cs), ("GH_PAT_SEGREDOS", pat)) if not v]
if falta: sys.exit("faltam segredos no GitHub: " + ", ".join(falta))
repo = os.environ["GITHUB_REPOSITORY"]; H = {"Authorization": "Bearer " + pat, "Accept": "application/vnd.github+json"}
k = requests.get(f"https://api.github.com/repos/{repo}/actions/secrets/public-key", headers=H, timeout=60)
if k.status_code != 200: sys.exit(f"a chave GH_PAT_SEGREDOS não tem permissão de Secrets neste repositório (HTTP {k.status_code})")
k = k.json()
from nacl import encoding, public
caixa = public.SealedBox(public.PublicKey(k["key"].encode(), encoding.Base64Encoder()))
ESPERADO = (os.environ.get("CONTA_DRIVE") or "contatowmds@gmail.com").lower()
AV = Path(__file__).resolve().parent / "drive_codigo.txt"
def git(*a): return subprocess.run(["git", *a], cwd=str(AV.parent.parent), capture_output=True, text=True)
def aviso(txt):
    """Grava o andamento num arquivo do repositório (para quem acompanha de fora ver o código e o resultado)."""
    git("config", "user.name", "agendador"); git("config", "user.email", "agendador@users.noreply.github.com")
    for _ in range(5):
        git("fetch", "-q", "origin", "main"); git("reset", "-q", "--hard", "origin/main"); AV.write_text(txt + "\n", encoding="utf-8")
        git("add", str(AV)); git("commit", "-q", "-m", "drive: andamento da conexão")
        if git("push", "-q", "origin", "HEAD:main").returncode == 0: return
        time.sleep(2)
d = requests.post("https://oauth2.googleapis.com/device/code", data={"client_id": cid, "scope": "https://www.googleapis.com/auth/drive.file"}, timeout=60).json()
if "device_code" not in d: aviso(f"ERRO: o Google recusou iniciar a conexão: {d}"); sys.exit(1)
print(f"CÓDIGO: {d['user_code']}   (abrir {d['verification_url']})", flush=True)
aviso(f"CODIGO {d['user_code']} | abrir {d['verification_url']} | entrar com {ESPERADO} | vale até {time.strftime('%H:%M', time.gmtime(time.time() + int(d.get('expires_in', 1800)) - 3 * 3600))} (Brasília)")
fim, passo = time.time() + int(d.get("expires_in", 1800)) - 30, int(d.get("interval", 5)) + 1
while time.time() < fim:
    time.sleep(passo)
    r = requests.post("https://oauth2.googleapis.com/token", data={"client_id": cid, "client_secret": cs, "device_code": d["device_code"], "grant_type": "urn:ietf:params:oauth:grant-type:device_code"}, timeout=60).json()
    e = r.get("error")
    if e == "slow_down": passo = min(passo + 2, 15); continue
    if e == "authorization_pending": continue
    if not r.get("refresh_token"): aviso(f"ERRO: código recusado ou vencido ({e})"); sys.exit(1)
    A = {"Authorization": "Bearer " + r["access_token"]}
    u = requests.get("https://www.googleapis.com/drive/v3/about", params={"fields": "user(emailAddress),storageQuota(limit,usage)"}, headers=A, timeout=60)
    if u.status_code != 200: aviso(f"ERRO: o login passou, mas a API do Drive recusou (HTTP {u.status_code}): {u.text[:300]}"); sys.exit(1)
    u = u.json(); mail = (u.get("user") or {}).get("emailAddress", "").lower()
    if mail != ESPERADO: aviso(f"NAO GRAVEI: a conta autorizada foi {mail}; tem de ser {ESPERADO} (a dona das pastas dos vídeos)."); sys.exit(1)
    t = requests.post("https://www.googleapis.com/drive/v3/files", params={"fields": "id"}, headers=A, json={"name": "teste-robo.txt", "mimeType": "text/plain"}, timeout=60)
    if t.status_code != 200: aviso(f"ERRO: não consegui criar arquivo de teste no Drive (HTTP {t.status_code}): {t.text[:200]}"); sys.exit(1)
    requests.delete("https://www.googleapis.com/drive/v3/files/" + t.json()["id"], headers=A, timeout=60)
    g = requests.put(f"https://api.github.com/repos/{repo}/actions/secrets/DRIVE_REFRESH_TOKEN", headers=H, timeout=60,
                     json={"encrypted_value": base64.b64encode(caixa.encrypt(r["refresh_token"].encode())).decode(), "key_id": k["key_id"]})
    if g.status_code not in (201, 204): aviso(f"ERRO: não consegui gravar o segredo DRIVE_REFRESH_TOKEN (HTTP {g.status_code})"); sys.exit(1)
    q = u.get("storageQuota") or {}
    aviso(f"CONECTADO: Drive de {mail} (uso {int(q.get('usage', 0)) / 1e9:.1f} GB de {int(q.get('limit', 0)) / 1e9:.0f} GB). Segredo DRIVE_REFRESH_TOKEN gravado."); print("CONECTADO", flush=True); sys.exit(0)
aviso("ERRO: o código venceu sem ninguém autorizar."); sys.exit(1)
