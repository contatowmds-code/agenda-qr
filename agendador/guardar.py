#!/usr/bin/env python3
"""Grava no GitHub o que o publicar.py marcou como feito, SEM perder a marcação se a main mudou no meio (evita publicar em duplicidade).
Se o push for recusado, busca a main, junta os campos feito/erros no agenda.json mais novo e tenta de novo (até 8 vezes)."""
import json, subprocess, sys, time
from pathlib import Path
AG = "agendador/agenda.json"
def sh(*a, check=True): return subprocess.run(a, capture_output=True, text=True, check=check)
local = json.loads(Path(AG).read_text(encoding="utf-8"))
chave = lambda i: (i["id"], i.get("conta", ""))
feitos = {chave(i): (i.get("feito") or {}, i.get("erros") or {}) for i in local if i.get("feito") or i.get("erros")}
if not feitos: print("nada novo para guardar"); sys.exit(0)
sh("git", "config", "user.name", "agendador"); sh("git", "config", "user.email", "agendador@users.noreply.github.com")
for tent in range(8):
    sh("git", "fetch", "-q", "origin", "main")
    sh("git", "checkout", "-q", "-B", "guardar", "origin/main")
    ag = json.loads(Path(AG).read_text(encoding="utf-8")); mudou = False
    for i in ag:
        f, e = feitos.get(chave(i), ({}, {}))
        for p, v in f.items():
            if v and not (i.setdefault("feito", {})).get(p): i["feito"][p] = v; i.get("erros", {}).pop(p, None); mudou = True
        for p, v in e.items():
            if not (i.get("feito") or {}).get(p) and (i.setdefault("erros", {})).get(p) != v: i["erros"][p] = v; mudou = True
    if not mudou: print("main já tem tudo"); sys.exit(0)
    Path(AG).write_text(json.dumps(ag, ensure_ascii=False, indent=1), encoding="utf-8")
    sh("git", "add", AG); sh("git", "commit", "-qm", "agenda: atualizada")
    r = sh("git", "push", "origin", "HEAD:main", check=False)
    if r.returncode == 0: print("guardado na main"); sys.exit(0)
    print("push recusado, tentando de novo:", r.stderr.strip()[-120:]); time.sleep(3 + tent * 2)
print("ERRO: não consegui guardar o feito; confira a agenda manualmente"); sys.exit(1)
