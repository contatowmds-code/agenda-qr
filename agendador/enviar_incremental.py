#!/usr/bin/env python3
"""Envia os arquivos de agendador/videos/ para a branch 'videos' SEM clonar a branch inteira (a branch tem vídeos de outras contas e o clone enche o disco).
Busca só a árvore (sem os vídeos dos outros), acrescenta UM arquivo por commit (fast-forward, sem push forçado) e apaga o arquivo local depois de enviado.
Uso: python agendador/enviar_incremental.py        (rode na raiz do repositório)"""
import os, shutil, subprocess, sys, tempfile
from pathlib import Path

AQUI = Path(__file__).resolve().parent
SRC = AQUI / "videos"
URL = subprocess.run(["git", "-C", str(AQUI.parent), "remote", "get-url", "origin"], capture_output=True, text=True).stdout.strip()
W = Path(tempfile.mkdtemp(prefix="vbr_"))


def g(*a):
    return subprocess.run(["git", "-C", str(W), *a], capture_output=True, text=True)


g("init", "-q"); g("config", "user.name", "agendador"); g("config", "user.email", "agendador@users.noreply.github.com"); g("remote", "add", "origin", URL)
g("config", "extensions.partialClone", "origin"); g("config", "remote.origin.promisor", "true"); g("config", "remote.origin.partialclonefilter", "blob:none")
nomes = sorted(f.name for f in SRC.glob("*") if f.suffix in (".mp4", ".jpg"))
ok, falha = [], []
for n in nomes:
    err = ""
    for tent in range(3):
        g("fetch", "-q", "--depth", "1", "--filter=blob:none", "origin", "videos")
        g("read-tree", "FETCH_HEAD")
        h = g("hash-object", "-w", str(SRC / n)).stdout.strip()
        g("update-index", "--add", "--cacheinfo", f"100644,{h},videos/{n}")
        t = g("write-tree", "--missing-ok").stdout.strip()   # --missing-ok: não baixa os vídeos dos outros só para montar a árvore
        par = g("rev-parse", "FETCH_HEAD").stdout.strip()
        c = g("commit-tree", t, "-p", par, "-m", "video pendente: " + n).stdout.strip()
        p = g("push", "-q", "origin", f"{c}:refs/heads/videos")
        if p.returncode == 0:
            ok.append(n); (SRC / n).unlink(); break
        err = p.stderr.strip()[-100:]
    else:
        falha.append((n, err))
    g("prune", "--expire=now")
print("ENVIADOS", len(ok), "FALHARAM", falha)
shutil.rmtree(W, ignore_errors=True)
sys.exit(1 if falha else 0)
