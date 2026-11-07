#!/usr/bin/env python3
"""Teste do Agendador QR no Sandbox do TikTok: troca o código de autorização por token,
mostra a conta conectada e envia um vídeo curto para o RASCUNHO (inbox) da conta. Não publica nada.
Segredos: TT_SBX_CLIENT_SECRET (Secrets do GitHub). Entradas: CODE, CLIENT_KEY, REDIRECT_URI. Nada de token é impresso."""
import json, os, sys, time
from pathlib import Path
import requests

API = "https://open.tiktokapis.com/v2"
code = os.environ["CODE"].strip()
r = requests.post(f"{API}/oauth/token/", data={"client_key": os.environ["CLIENT_KEY"], "client_secret": os.environ["TT_SBX_CLIENT_SECRET"],
    "code": code, "grant_type": "authorization_code", "redirect_uri": os.environ["REDIRECT_URI"]}, timeout=60).json()
if "access_token" not in r:
    print("ERRO ao trocar o código:", {k: v for k, v in r.items() if k != "access_token"}); sys.exit(1)
tok = r["access_token"]
print("1) Login Kit OK. Escopos concedidos:", r.get("scope"))
h = {"Authorization": f"Bearer {tok}"}
u = requests.get(f"{API}/user/info/?fields=open_id,display_name", headers=h, timeout=60).json()
print("2) Conta conectada:", (u.get("data") or {}).get("user", {}).get("display_name"), "| resposta:", u.get("error", {}).get("code"))
dados = (Path(__file__).parent / "teste" / "teste.mp4").read_bytes(); n = len(dados)
ini = requests.post(f"{API}/post/publish/inbox/video/init/", headers={**h, "Content-Type": "application/json; charset=UTF-8"},
    data=json.dumps({"source_info": {"source": "FILE_UPLOAD", "video_size": n, "chunk_size": n, "total_chunk_count": 1}}), timeout=60).json()
if ini.get("error", {}).get("code", "ok") != "ok":
    print("ERRO ao iniciar o envio:", ini); sys.exit(1)
d = ini["data"]; print("3) Envio iniciado. publish_id:", d["publish_id"])
up = requests.put(d["upload_url"], data=dados, headers={"Content-Type": "video/mp4", "Content-Length": str(n),
    "Content-Range": f"bytes 0-{n-1}/{n}"}, timeout=300)
print("4) Arquivo enviado. HTTP", up.status_code)
for _ in range(10):
    s = requests.post(f"{API}/post/publish/status/fetch/", headers={**h, "Content-Type": "application/json; charset=UTF-8"},
        data=json.dumps({"publish_id": d["publish_id"]}), timeout=60).json()
    st = (s.get("data") or {}).get("status"); print("5) Status:", st)
    if st in ("SEND_TO_USER_INBOX", "PUBLISH_COMPLETE", "FAILED"): break
    time.sleep(5)
print("Pronto: o vídeo de teste está no rascunho da conta (não foi publicado).")
