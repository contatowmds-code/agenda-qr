#!/usr/bin/env python3
"""Confere, SEM publicar nada, quais perfis de mapa estão conectados em cada rede e se a conta é a certa.
Grava agendador/mapa_status.json (só nomes públicos das contas; nenhum token). Rodado pelo workflow "Mapas - conferir contas"."""
import datetime as dt, json, os, sys
from pathlib import Path
from zoneinfo import ZoneInfo
import requests
import mapa

AQUI = Path(__file__).resolve().parent
st = {}
for conta in mapa.CONTAS:
    s = {}
    try:
        d = mapa.meta(conta)
        s["instagram"] = {"ok": True, "conta": "@" + str(d.get("ig_username"))}
        s["facebook"] = {"ok": True, "conta": d.get("fb_nome")}
    except Exception as e:
        s["instagram"] = s["facebook"] = {"ok": False, "motivo": str(e)[:200]}
    try:
        rt = mapa.env("YT_REFRESH_TOKEN", conta)
        if not rt: raise RuntimeError("sem credencial (falta o segredo YT_REFRESH_TOKEN__" + conta.upper().replace("-", "_") + ")")
        t = requests.post("https://oauth2.googleapis.com/token", data={"client_id": os.environ.get("YT_CLIENT_ID__MAPAS") or os.environ.get("YT_CLIENT_ID"),
            "client_secret": os.environ.get("YT_CLIENT_SECRET__MAPAS") or os.environ.get("YT_CLIENT_SECRET"), "refresh_token": rt, "grant_type": "refresh_token"}, timeout=60).json()
        if "access_token" not in t: raise RuntimeError("token recusado: " + str(t.get("error_description") or t.get("error"))[:120])
        nome, _ = mapa.guarda_youtube(conta, t["access_token"]); s["youtube"] = {"ok": True, "conta": nome}
    except Exception as e: s["youtube"] = {"ok": False, "motivo": str(e)[:200]}
    try:
        rt = mapa.env("TT_REFRESH_TOKEN", conta)
        za = mapa.zernio_conta(conta) if (not rt and os.environ.get("ZERNIO_API_KEY")) else None
        if za: s["tiktok"] = {"ok": True, "conta": "@" + str(za.get("username")) + " (Zernio)", "privacidade": "PUBLIC_TO_EVERYONE"}; raise StopIteration
        if not rt: raise RuntimeError("sem credencial (falta o segredo TT_REFRESH_TOKEN__" + conta.upper().replace("-", "_") + ")")
        t = requests.post("https://open.tiktokapis.com/v2/oauth/token/", data={"client_key": os.environ.get("TT_CLIENT_KEY"), "client_secret": os.environ.get("TT_CLIENT_SECRET"),
            "grant_type": "refresh_token", "refresh_token": rt}, timeout=60).json()
        if "access_token" not in t: raise RuntimeError("token recusado: " + str(t.get("error_description") or t.get("error"))[:120])
        s["tiktok"] = {"ok": True, "conta": mapa.guarda_tiktok(conta, t["access_token"]), "privacidade": os.environ.get("TT_PRIVACY") or "SELF_ONLY"}
    except StopIteration: pass
    except Exception as e: s["tiktok"] = {"ok": False, "motivo": str(e)[:200]}
    st[conta] = s
    print(conta, {k: (v.get("conta") if v["ok"] else "NÃO: " + v["motivo"][:90]) for k, v in s.items()})
extra = {"paginas_que_o_token_alcanca": sorted(mapa.VISTAS), "conferido_em": dt.datetime.now(ZoneInfo("America/Sao_Paulo")).isoformat(timespec="seconds")}
if os.environ.get("TESTE_DRIVE"):   # teste de download de um arquivo do Drive: "ID,TAMANHO"
    i, tam = (os.environ["TESTE_DRIVE"].split(",") + ["0"])[:2]
    try: p = mapa.baixar({"arquivo": "teste.mp4", "drive_id": i, "tamanho": int(tam)}); extra["teste_drive"] = f"OK {p.stat().st_size} bytes"
    except Exception as e: extra["teste_drive"] = "FALHOU " + str(e)[:200]
    print("teste do Drive:", extra["teste_drive"])
(AQUI / "mapa_status.json").write_text(json.dumps({"_": extra, **st}, ensure_ascii=False, indent=1), encoding="utf-8")
