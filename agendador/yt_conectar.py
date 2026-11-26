#!/usr/bin/env python3
"""Conecta o canal do YouTube de UM perfil de mapa, sem ninguém copiar token.
Fluxo "TV e dispositivos" do Google: mostra um código curto; o dono abre google.com/device, digita o código,
escolhe o CANAL do perfil e permite. O robô recebe o token, confere se o canal é o do perfil e grava o segredo
YT_REFRESH_TOKEN__MAPA_XX direto no GitHub (precisa do segredo GH_PAT_SEGREDOS). Nenhum token é impresso."""
import base64, os, sys, time
import requests
import mapa

conta = os.environ["PERFIL"].strip()
if conta not in mapa.CONTAS: sys.exit(f"perfil desconhecido: {conta}")
cid, cs, pat = os.environ.get("YT_CLIENT_ID__MAPAS"), os.environ.get("YT_CLIENT_SECRET__MAPAS"), os.environ.get("GH_PAT_SEGREDOS")
falta = [n for n, v in (("YT_CLIENT_ID__MAPAS", cid), ("YT_CLIENT_SECRET__MAPAS", cs), ("GH_PAT_SEGREDOS", pat)) if not v]
if falta: sys.exit("faltam segredos no GitHub: " + ", ".join(falta))
repo = os.environ["GITHUB_REPOSITORY"]; H = {"Authorization": "Bearer " + pat, "Accept": "application/vnd.github+json"}
k = requests.get(f"https://api.github.com/repos/{repo}/actions/secrets/public-key", headers=H, timeout=60)
if k.status_code != 200: sys.exit(f"a chave GH_PAT_SEGREDOS não tem permissão de Secrets neste repositório (HTTP {k.status_code})")
k = k.json()

d = requests.post("https://oauth2.googleapis.com/device/code", data={"client_id": cid, "scope": "https://www.googleapis.com/auth/youtube"}, timeout=60).json()
if "device_code" not in d: sys.exit(f"o Google recusou iniciar a conexão: {d}")
print(f"\n===== {mapa.CONTAS[conta]['nome']} =====\nABRA: {d['verification_url']}\nCÓDIGO: {d['user_code']}\nEscolha o canal {mapa.CONTAS[conta]['nome']} e clique em Permitir. Aguardando (até {d['expires_in'] // 60} min)...\n", flush=True)
fim, passo, tok = time.time() + min(d["expires_in"], 1500), d.get("interval", 5), None
while time.time() < fim:
    time.sleep(passo)
    r = requests.post("https://oauth2.googleapis.com/token", data={"client_id": cid, "client_secret": cs, "device_code": d["device_code"],
        "grant_type": "urn:ietf:params:oauth:grant-type:device_code"}, timeout=60).json()
    if r.get("refresh_token"): tok = r; break
    e = r.get("error")
    if e == "slow_down": passo += 5
    elif e not in ("authorization_pending", None): sys.exit(f"conexão recusada: {e} {r.get('error_description', '')}")
if not tok: sys.exit("o tempo acabou sem a permissão; rode de novo")
try: nome, _ = mapa.guarda_youtube(conta, tok["access_token"])
except Exception as e: sys.exit(f"NÃO GRAVEI: {e}")
from nacl import encoding, public
caixa = public.SealedBox(public.PublicKey(k["key"].encode(), encoding.Base64Encoder()))
seg = "YT_REFRESH_TOKEN__" + conta.upper().replace("-", "_")
g = requests.put(f"https://api.github.com/repos/{repo}/actions/secrets/{seg}", headers=H, timeout=60,
    json={"encrypted_value": base64.b64encode(caixa.encrypt(tok["refresh_token"].encode())).decode(), "key_id": k["key_id"]})
if g.status_code not in (201, 204): sys.exit(f"não consegui gravar o segredo {seg} (HTTP {g.status_code})")
print(f"CONECTADO: canal '{nome}' gravado em {seg}.")
