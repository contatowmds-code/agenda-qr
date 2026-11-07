#!/usr/bin/env python3
"""Acrescenta vídeos prontos na agenda, SEMPRE no próximo horário livre depois do último já agendado.
Uso: python agendador/preparar.py "videos/Pasta 1" ["videos/Pasta 2" ...] [--inicio AAAA-MM-DD] [--horas 12:00,18:00,21:00] [--plataformas instagram,youtube]
Padrões vêm de agendador/config.json (horas, plataformas, fuso). Copia o mp4 para agendador/videos/ e lê titulo-e-hashtags.txt."""
import argparse, json, shutil, datetime as dt
from pathlib import Path
from zoneinfo import ZoneInfo

AQUI = Path(__file__).resolve().parent
cfg = json.loads((AQUI / "config.json").read_text(encoding="utf-8"))
ap = argparse.ArgumentParser()
ap.add_argument("pastas", nargs="+")
ap.add_argument("--inicio", default=None)
ap.add_argument("--horas", default=",".join(cfg["horas"]))
ap.add_argument("--conta", default=None, help="quanto-rende | quanto-vale | arquivo-viral (o vídeo só posta nessa conta)")
ap.add_argument("--plataformas", default=",".join(cfg["plataformas"]))
a = ap.parse_args()
tz = ZoneInfo(cfg.get("fuso", "America/Sao_Paulo"))
ag_p = AQUI / "agenda.json"
ag = json.loads(ag_p.read_text(encoding="utf-8")) if ag_p.exists() else []
horas = [tuple(map(int, h.split(":"))) for h in a.horas.split(",")]

def lido(s):
    d = dt.datetime.fromisoformat(s)
    return d if d.tzinfo else d.replace(tzinfo=tz)

def proximo(depois):
    dia = depois.astimezone(tz).date()
    while True:
        for h, m in horas:
            c = dt.datetime(dia.year, dia.month, dia.day, h, m, tzinfo=tz)
            if c > depois: return c
        dia += dt.timedelta(days=1)

ultimo = max([lido(i["quando"]) for i in ag], default=None)
minimo = dt.datetime.now(tz) + dt.timedelta(hours=1)
if a.inicio: minimo = max(minimo, dt.datetime.fromisoformat(a.inicio).replace(tzinfo=tz))
(AQUI / "videos").mkdir(exist_ok=True)
for pasta in a.pastas:
    p = Path(pasta); mp4 = next(p.glob("*.mp4")); legenda = (p / "titulo-e-hashtags.txt").read_text(encoding="utf-8").strip()
    destino = f"videos/{p.name.replace(' ', '-')}.mp4"
    if any(i["arquivo"] == destino for i in ag): print("já está na agenda:", p.name); continue
    _pub = json.loads((AQUI / "publicados.json").read_text(encoding="utf-8")) if (AQUI / "publicados.json").exists() else []
    if any(x.get("arquivo") == destino and (x.get("conta") or "") == (a.conta or "") for x in _pub): print("JÁ FOI PUBLICADO (consta em publicados.json); NÃO agendo de novo:", p.name); continue
    shutil.copy(mp4, AQUI / destino)
    capa_dest = None
    for cand in ("capa.jpg", "capa.jpeg", "capa.png"):
        if (p / cand).exists():
            from PIL import Image
            capa_dest = destino[:-4] + ".jpg"
            Image.open(p / cand).convert("RGB").save(AQUI / capa_dest, "JPEG", quality=92)
            break
    if not capa_dest: print("AVISO: sem capa.png na pasta; o vídeo sai com a capa automática:", p.name)
    base = max(minimo, ultimo) if ultimo else minimo
    quando = proximo(base); ultimo = quando
    ag.append({"id": p.name[:40], "arquivo": destino, "legenda": legenda, "quando": quando.isoformat(), "plataformas": a.plataformas.split(",")} | ({"conta": a.conta} if a.conta else {}) | ({"capa": capa_dest} if capa_dest else {}))
    print("agendado:", p.name, "->", quando.strftime("%d/%m %H:%M"))
ag_p.write_text(json.dumps(ag, ensure_ascii=False, indent=1), encoding="utf-8")
