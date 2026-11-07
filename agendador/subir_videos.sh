#!/usr/bin/env bash
# Sobe os vídeos pendentes para a branch "videos" SEM apagar os que outras conversas já subiram (sempre 1 commit só).
# Uso (na raiz do repositório): git pull --rebase && bash agendador/subir_videos.sh
set -e
R=$(git rev-parse --show-toplevel); cd "$R"
URL=$(git remote get-url origin)
TMP=$(mktemp -d); mkdir -p "$TMP/videos"
# 1) traz o que já está na branch videos (se existir)
if git ls-remote --exit-code --heads "$URL" videos >/dev/null 2>&1; then
  git clone -q --depth 1 -b videos "$URL" "$TMP/old" && cp "$TMP"/old/videos/* "$TMP/videos/" 2>/dev/null || true
fi
# 2) junta os pendentes locais e remove da pasta o que não está mais pendente na agenda
python3 - "$TMP" <<'PY'
import json, shutil, sys
from pathlib import Path
ag = json.load(open("agendador/agenda.json", encoding="utf-8")); tmp = Path(sys.argv[1]) / "videos"
manter = set()
for it in ag:
    pend = [p for p in it.get("plataformas", []) if not it.get("feito", {}).get(p)]
    f = Path("agendador") / it["arquivo"]
    if pend:
        manter.add(f.name)
        if f.exists(): shutil.copy(f, tmp / f.name)
        if it.get("capa"):
            c = Path("agendador") / it["capa"]; manter.add(c.name)
            if c.exists(): shutil.copy(c, tmp / c.name)
for f in tmp.glob("*"):
    if f.name not in manter: f.unlink()
PY
cd "$TMP/videos/.." && rm -rf old && git init -q -b videos && git add -A && git -c user.name=agendador -c user.email=agendador@users.noreply.github.com commit -qm "videos pendentes"
git push -f "$URL" videos:videos
echo "videos pendentes enviados para a branch videos"
