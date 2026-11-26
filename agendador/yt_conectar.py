#!/usr/bin/env python3
"""Conecta os canais do YouTube dos perfis de mapa, um por vez, sem ninguém copiar token (descobre sozinho de qual perfil é cada canal).
Fluxo "TV e dispositivos" do Google: mostra um código curto; o dono abre google.com/device, digita o código,
escolhe o CANAL do perfil e permite. O robô recebe o token, confere se o canal é o do perfil e grava o segredo
YT_REFRESH_TOKEN__MAPA_XX direto no GitHub (precisa do segredo GH_PAT_SEGREDOS). Nenhum token é impresso."""
import base64, os, sys, time
import requests
import mapa

cid, cs, pat = os.environ.get("YT_CLIENT_ID__MAPAS"), os.environ.get("YT_CLIENT_SECRET__MAPAS"), os.environ.get("GH_PAT_SEGREDOS")
falta = [n for n, v in (("YT_CLIENT_ID__MAPAS", cid), ("YT_CLIENT_SECRET__MAPAS", cs), ("GH_PAT_SEGREDOS", pat)) if not v]
if falta: sys.exit("faltam segredos no GitHub: " + ", ".join(falta))
repo = os.environ["GITHUB_REPOSITORY"]; H = {"Authorization": "Bearer " + pat, "Accept": "application/vnd.github+json"}
k = requests.get(f"https://api.github.com/repos/{repo}/actions/secrets/public-key", headers=H, timeout=60)
if k.status_code != 200: sys.exit(f"a chave GH_PAT_SEGREDOS não tem permissão de Secrets neste repositório (HTTP {k.status_code})")
k = k.json()

from nacl import encoding, public
caixa = public.SealedBox(public.PublicKey(k["key"].encode(), encoding.Base64Encoder()))
feitos, quantos = [], int(os.environ.get("QUANTOS") or 8)

def qual_perfil(access_token):
    """Descobre de qual perfil é o canal autorizado (pelo nome ou pelo @ do canal)."""
    c = requests.get("https://www.googleapis.com/youtube/v3/channels", params={"part": "snippet", "mine": "true"},
                     headers={"Authorization": "Bearer " + access_token}, timeout=60).json()
    if not c.get("items"): return None, "(conta sem canal do YouTube)"
    sn = c["items"][0]["snippet"]; nome = f"{sn.get('title')} ({sn.get('customUrl')})"
    for conta in mapa.CONTAS:
        if mapa.bate(conta, sn.get("title"), sn.get("customUrl")): return conta, nome
    return None, nome

# pede TODOS os códigos de uma vez: o dono autoriza um canal por código, na ordem que quiser
pend = []
for n in range(quantos):
    d = requests.post("https://oauth2.googleapis.com/device/code", data={"client_id": cid, "scope": "https://www.googleapis.com/auth/youtube"}, timeout=60).json()
    if "device_code" not in d: sys.exit(f"o Google recusou iniciar a conexão: {d}")
    pend.append(d); print(f"CÓDIGO {n + 1}: {d['user_code']}   (abrir {d['verification_url']})", flush=True)
print("Autorize um canal diferente em cada código. Aguardando até 28 min...", flush=True)
fim, passo = time.time() + 1680, 6
while pend and time.time() < fim:
    time.sleep(passo)
    for d in list(pend):
        r = requests.post("https://oauth2.googleapis.com/token", data={"client_id": cid, "client_secret": cs, "device_code": d["device_code"],
            "grant_type": "urn:ietf:params:oauth:grant-type:device_code"}, timeout=60).json()
        e = r.get("error")
        if e == "slow_down": passo = min(passo + 2, 15); continue
        if e == "authorization_pending": continue
        pend.remove(d)
        if not r.get("refresh_token"): print(f"código {d['user_code']}: recusado ou vencido ({e})", flush=True); continue
        conta, nome = qual_perfil(r["access_token"])
        if not conta: print(f"NÃO GRAVEI (código {d['user_code']}): o canal autorizado foi {nome}, que não é de nenhum perfil de mapa.", flush=True); continue
        seg = "YT_REFRESH_TOKEN__" + conta.upper().replace("-", "_")
        g = requests.put(f"https://api.github.com/repos/{repo}/actions/secrets/{seg}", headers=H, timeout=60,
            json={"encrypted_value": base64.b64encode(caixa.encrypt(r["refresh_token"].encode())).decode(), "key_id": k["key_id"]})
        if g.status_code not in (201, 204): print(f"não consegui gravar o segredo {seg} (HTTP {g.status_code})", flush=True); continue
        rep = " (REPETIDO: este canal já tinha sido conectado nesta rodada)" if conta in feitos else ""
        if conta not in feitos: feitos.append(conta)
        print(f"CONECTADO: canal {nome} -> perfil {mapa.CONTAS[conta]['nome']} ({seg}){rep}.", flush=True)
print("\nRESUMO: conectados nesta rodada: " + (", ".join(mapa.CONTAS[c]["nome"] for c in feitos) or "nenhum"))
