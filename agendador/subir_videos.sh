#!/usr/bin/env bash
# Sobe SÓ os vídeos ainda não publicados para a branch "videos" (sempre 1 commit só, histórico não cresce).
# Uso (na raiz do repositório de agendamento): bash agendador/subir_videos.sh
set -e
R=$(git rev-parse --show-toplevel); cd "$R"
TMP=$(mktemp -d); mkdir -p "$TMP/videos"
python3 - "$TMP" <<'PY'
import json, shutil, sys
from pathlib import Path
ag = json.load(open("agendador/agenda.json", encoding="utf-8")); tmp = Path(sys.argv[1])
for it in ag:
    pend = [p for p in it.get("plataformas", []) if not it.get("feito", {}).get(p)]
    f = Path("agendador") / it["arquivo"]
    if pend and f.exists(): shutil.copy(f, tmp / "videos" / f.name)
PY
cd "$TMP" && git init -q -b videos && git add -A && git -c user.name=agendador -c user.email=agendador@users.noreply.github.com commit -qm "videos pendentes"
git push -f "$(cd "$R" && git remote get-url origin)" videos:videos
echo "videos pendentes enviados para a branch videos"
