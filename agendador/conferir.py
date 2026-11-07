#!/usr/bin/env python3
"""Conferência SÓ DE LEITURA (não publica nada): mostra o que foi publicado hoje (com link e horário), o que está atrasado e posts duplicados nas contas."""
import json, sys, datetime as dt
from pathlib import Path
from zoneinfo import ZoneInfo
sys.path.insert(0, str(Path(__file__).resolve().parent))
import publicar as P
tz = ZoneInfo("America/Sao_Paulo"); agora = dt.datetime.now(tz)
ag = json.loads(P.AGENDA.read_text(encoding="utf-8"))
try: pub = json.loads((Path(__file__).resolve().parent / "publicados.json").read_text(encoding="utf-8"))
except Exception: pub = []
print("== ATRASADOS (horário já passou e ainda não saiu) ==")
n = 0
for it in ag:
    q = dt.datetime.fromisoformat(it["quando"]); q = q if q.tzinfo else q.replace(tzinfo=tz)
    falta = [p for p in it.get("plataformas", []) if not (it.get("feito") or {}).get(p)]
    if q <= agora and falta:
        n += 1; print(f"  {it.get('conta')} {q.astimezone(tz).strftime('%d/%m %H:%M')} {it['id'][:40]} falta: {falta} erros: {str(it.get('erros'))[:100]}")
print("  nenhum" if not n else f"  total: {n}")
print("== PUBLICADOS HOJE (registro) ==")
for it in pub:
    q = dt.datetime.fromisoformat(it["quando"]); q = q if q.tzinfo else q.replace(tzinfo=tz)
    if q.astimezone(tz).date() == agora.date() and not any(x.endswith("_story") for x in it["plataformas"]):
        print(f"  {it.get('conta')} marcado {q.astimezone(tz).strftime('%H:%M')} arquivado {str(it.get('arquivado_em'))[11:16]} {it['id'][:38]} {it.get('links')}")
print("== CONTAS E DUPLICATAS (Instagram/Facebook) ==")
P.verificar(ag); P.duplicatas(ag)
