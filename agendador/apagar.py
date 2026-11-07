#!/usr/bin/env python3
"""Apaga posts REPETIDOS do Facebook listados em agendador/apagar.json (só o que está lá). Segurança: confere a legenda de cada post antes de apagar
e NUNCA apaga os IDs da lista 'manter'. Instagram e YouTube não permitem apagar por esta API (fazer manualmente).
Só roda quando alguém dispara o workflow 'Apagar posts repetidos (manual)'."""
import json, os
from pathlib import Path
import requests
GRAPH = "https://graph.facebook.com/v21.0"
cfg = json.loads((Path(__file__).resolve().parent / "apagar.json").read_text(encoding="utf-8"))
contas = json.loads(os.environ.get("META_ACCOUNTS") or "{}")
manter = set(cfg.get("manter", []))
for x in cfg["facebook"]:
    pid, conta, prefixo = x["id"], x["conta"], x["legenda_comeca_com"]
    if pid in manter: print(f"[{pid}] PROTEGIDO (manter); não apago"); continue
    d = contas.get(conta)
    if not d: print(f"[{pid}] conta {conta} sem credencial; pulo"); continue
    r = requests.get(f"{GRAPH}/{pid}", params={"fields": "description,created_time", "access_token": d["fb_token"]}, timeout=60).json()
    if "error" in r: print(f"[{pid}] já não existe ou sem acesso: {str(r['error'].get('message'))[:100]}"); continue
    if not (r.get("description") or "").startswith(prefixo): print(f"[{pid}] legenda NÃO confere ({(r.get('description') or '')[:40]!r}); NÃO apago"); continue
    a = requests.delete(f"{GRAPH}/{pid}", params={"access_token": d["fb_token"]}, timeout=60).json()
    print(f"[{pid}] {r.get('created_time')} -> apagado" if a.get("success") else f"[{pid}] FALHOU ao apagar: {str(a)[:160]}")
