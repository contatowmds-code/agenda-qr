#!/usr/bin/env python3
"""Cria os STORIES de um vídeo: divide em partes de até 55 s (limite de story em vídeo ~60 s) e devolve itens para a agenda.
Cada parte vira um item (instagram_story + facebook_story) com o mesmo horário, publicados em ordem. Sem legenda."""
import datetime as dt, json, math, re, subprocess
from pathlib import Path
AQUI = Path(__file__).resolve().parent

def duracao(mp4):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", str(mp4)], capture_output=True, text=True)
    return float(r.stdout.strip())

def criar(mp4, titulo, quando, conta, plataformas=("instagram_story", "facebook_story"), max_seg=55):
    """Gera agendador/videos/<slug>-storyN.mp4 e devolve a lista de itens da agenda."""
    slug = re.sub(r"[^\w-]+", "-", titulo.replace(" ", "-")).strip("-")
    dur = duracao(mp4); n = max(1, math.ceil(dur / max_seg)); passo = dur / n; itens = []
    (AQUI / "videos").mkdir(exist_ok=True)
    for k in range(n):
        nome = f"videos/{slug}-story{k+1}.mp4"
        cmd = ["ffmpeg", "-y", "-v", "error", "-ss", f"{k*passo:.3f}", "-i", str(mp4), "-t", f"{passo:.3f}", "-c:v", "libx264", "-profile:v", "high", "-level", "4.2",
               "-preset", "veryfast", "-crf", "19", "-pix_fmt", "yuv420p", "-r", "30", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", str(AQUI / nome)]
        subprocess.run(cmd, check=True)
        itens.append({"id": f"{titulo[:40]} (story {k+1}/{n})", "arquivo": nome, "legenda": "", "quando": quando.isoformat(), "plataformas": list(plataformas)} | ({"conta": conta} if conta else {}))
    return itens

if __name__ == "__main__":
    import argparse
    from zoneinfo import ZoneInfo
    ap = argparse.ArgumentParser(description="Agenda STORIES de um vídeo já pronto (pasta com .mp4). Ex.: python agendador/stories.py 'pasta' --conta quanto-vale --em 10")
    ap.add_argument("pasta"); ap.add_argument("--conta"); ap.add_argument("--em", type=int, default=10, help="minutos a partir de agora")
    ap.add_argument("--quando", help="data/hora ISO (fuso de São Paulo) em vez de --em")
    a = ap.parse_args(); tz = ZoneInfo("America/Sao_Paulo")
    q = dt.datetime.fromisoformat(a.quando).replace(tzinfo=tz) if a.quando else dt.datetime.now(tz) + dt.timedelta(minutes=a.em)
    pasta = Path(a.pasta); mp4 = next(pasta.glob("*.mp4")); ag_p = AQUI / "agenda.json"; ag = json.loads(ag_p.read_text(encoding="utf-8"))
    novos = criar(mp4, pasta.name, q, a.conta)
    ja = {(i["id"], i.get("conta", "")) for i in ag}
    for i in novos:
        if (i["id"], i.get("conta", "")) in ja: print("já está na agenda:", i["id"]); continue
        ag.append(i); print("story agendado:", i["id"], "->", q.strftime("%d/%m %H:%M"))
    ag_p.write_text(json.dumps(ag, ensure_ascii=False, indent=1), encoding="utf-8")
