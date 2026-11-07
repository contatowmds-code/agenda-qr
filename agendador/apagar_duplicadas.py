#!/usr/bin/env python3
"""Apaga CÓPIAS EXTRAS de posts do Facebook (mesma conta, mesma legenda). Mantém SEMPRE o mais antigo de cada grupo.
Segurança: só apaga se o grupo tem 2+ posts com legenda idêntica e não vazia; reconfere a legenda do post antes de apagar.
Instagram/YouTube não permitem apagar por esta API (fazer manualmente). Só roda manualmente (workflow 'Apagar posts repetidos')."""
import json, os, sys
import requests
GRAPH = "https://graph.facebook.com/v21.0"
contas = json.loads(os.environ.get("META_ACCOUNTS") or "{}")
DRY = "--dry-run" in sys.argv
total = 0
PERMITIDAS = set((os.environ.get("CONTAS_PERMITIDAS") or "quanto-vale,quanto-rende").split(","))
for conta, d in contas.items():
    if conta not in PERMITIDAS: print(f"[{conta}] fora do escopo autorizado; pulo"); continue
    if not d.get("fb_page_id") or not d.get("fb_token"): print(f"[{conta}] sem credencial do Facebook; pulo"); continue
    tok = d["fb_token"]; posts = []; url = f"{GRAPH}/{d['fb_page_id']}/video_reels"
    params = {"fields": "description,created_time,permalink_url", "limit": 100, "access_token": tok}
    for _ in range(10):
        r = requests.get(url, params=params, timeout=60).json()
        if "error" in r: print(f"[{conta}] erro ao listar: {str(r['error'].get('message'))[:120]}"); break
        posts += r.get("data", [])
        nxt = (r.get("paging") or {}).get("next")
        if not nxt: break
        url, params = nxt, None
    grupos = {}
    for m in posts:
        leg = (m.get("description") or "").strip()
        if leg: grupos.setdefault(leg, []).append(m)
    print(f"[{conta}] {len(posts)} reels lidos; {sum(1 for L in grupos.values() if len(L) > 1)} títulos repetidos")
    for leg, L in grupos.items():
        if len(L) < 2: continue
        L.sort(key=lambda m: m.get("created_time", ""))
        print(f"  MANTÉM {L[0]['id']} ({L[0].get('created_time')}) :: {leg[:50]}")
        for m in L[1:]:
            pid = m["id"]
            chk = requests.get(f"{GRAPH}/{pid}", params={"fields": "description", "access_token": tok}, timeout=60).json()
            if (chk.get("description") or "").strip() != leg: print(f"    [{pid}] legenda NÃO confere agora; NÃO apago"); continue
            if DRY: print(f"    [{pid}] (simulação) apagaria"); continue
            a = requests.delete(f"{GRAPH}/{pid}", params={"access_token": tok}, timeout=60).json()
            ok = bool(a.get("success")); total += ok
            print(f"    [{pid}] {m.get('created_time')} -> {'APAGADO' if ok else 'FALHOU: ' + str(a)[:150]}")
print(f"pronto. apagados: {total}")
