#!/usr/bin/env python3
"""Coloca um vídeo de mapa PRONTO para publicar AGORA (sem horário marcado) nas redes do perfil. Roda na conversa que fez o vídeo.
O vídeo já tem de estar no Drive (pasta do perfil) e compartilhado por link; o robô do GitHub baixa de lá, publica em cada rede
conectada do perfil, confere e arquiva. Nunca agenda duas vezes a mesma cidade do mesmo perfil.
Uso (na raiz do repositório agenda-qr):
  python3 agendador/mapa_enviar.py postar <conta> <cod_ibge> <drive_id> <tamanho_bytes> "<título #h1 #h2 #h3>"
  python3 agendador/mapa_enviar.py conferir <conta> <cod_ibge>      (mostra se já publicou e os links)
  python3 agendador/mapa_enviar.py status                           (quais perfis estão conectados em quais redes)
Saída: 0 = na fila / publicado; 3 = perfil sem nenhuma rede conectada (nada foi agendado); 4 = já estava."""
import datetime as dt, json, subprocess, sys, time
from pathlib import Path
from zoneinfo import ZoneInfo

AQUI = Path(__file__).resolve().parent; RAIZ = AQUI.parent
REDES = ["instagram", "facebook", "youtube", "tiktok"]
def git(*a): return subprocess.run(["git", "-C", str(RAIZ), *a], capture_output=True, text=True)
def ler(n):
    try: return json.loads((AQUI / n).read_text(encoding="utf-8"))
    except Exception: return [] if n != "mapa_status.json" else {}
def atualizar(): git("fetch", "-q", "--depth", "50", "origin", "main"); git("reset", "-q", "--hard", "origin/main")

cmd = sys.argv[1] if len(sys.argv) > 1 else "status"
atualizar()
contas = json.loads((AQUI / "contas_mapa.json").read_text(encoding="utf-8")); st = ler("mapa_status.json")
if cmd == "status":
    print("conferido em:", (st.get("_") or {}).get("conferido_em", "nunca"))
    for c in contas:
        print(f"{c:11}", " | ".join(f"{r}: " + ((st.get(c, {}).get(r) or {}).get("conta") or "NÃO") if (st.get(c, {}).get(r) or {}).get("ok") else f"{r}: NÃO" for r in REDES))
    sys.exit(0)
if cmd == "feitas":
    # CIDADES JÁ FEITAS (27/11/2026: a pasta FEITAS-MAPA do Drive não existe mais). Uso: feitas <conta>  -> uma linha por cidade já feita ou reservada (serve de feitas.txt para o fila.py)
    c_ = sys.argv[2]; L = []
    for n in (c_ + ".txt", c_ + ".reservas.txt"):
        try: L += (AQUI / "feitas" / n).read_text(encoding="utf-8").splitlines()
        except Exception: pass
    for arqj in ("publicados.json", "agenda.json"):
        try: L += [x.get("legenda", "").split("\n")[0] for x in ler(arqj) if x.get("conta") == c_ and not str(x.get("arquivo", "")).endswith("-tt.mp4")]
        except Exception: pass
    vis = set()
    for l in L:
        l = l.strip()
        if l and l not in vis: vis.add(l); print(l)
    sys.exit(0)
if cmd == "reservar":
    # Uso: reservar <conta> "<UF | ep | cod | Cidade>"  -> grava a reserva (EM PRODUÇÃO) para outra sessão não pegar a mesma cidade
    c_, linha = sys.argv[2], sys.argv[3].replace(".txt", "").strip()
    for tent in range(6):
        (AQUI / "feitas").mkdir(exist_ok=True); fr = AQUI / "feitas" / (c_ + ".reservas.txt"); ant = fr.read_text(encoding="utf-8") if fr.exists() else ""
        chave_ = "|".join(p.strip() for p in linha.split("|")[2:3])
        if chave_ and any(chave_ == "|".join(p.strip() for p in l.split("|")[2:3]) for l in ant.splitlines()): print("JÁ RESERVADA por outra sessão: escolha a próxima cidade da fila"); sys.exit(4)
        fr.write_text(ant + linha + " | EM PRODUÇÃO | " + time.strftime("%d/%m %H:%M") + "\n", encoding="utf-8")
        git("add", "agendador/feitas"); git("-c", "user.name=agendador", "-c", "user.email=agendador@users.noreply.github.com", "commit", "-q", "-m", f"reserva {linha[:60]}")
        if git("push", "-q", "origin", "HEAD:main").returncode == 0: print("RESERVADA:", linha); sys.exit(0)
        time.sleep(3); atualizar()
    print("não consegui gravar a reserva (confira o add_repo do agenda-qr com access push)"); sys.exit(5)
conta, cod = sys.argv[2], sys.argv[3]
if conta not in contas: sys.exit(f"conta desconhecida: {conta} (use {', '.join(contas)})")
arq = f"videos/{conta}-{cod}.mp4"
def achar():
    a = [x for x in ler("agenda.json") if x.get("arquivo") == arq and x.get("conta") == conta]
    p = [x for x in ler("publicados.json") if x.get("arquivo") == arq and x.get("conta") == conta]
    return (a[0] if a else None), (p[0] if p else None)
if cmd == "conferir":
    a, p = achar()
    if p: print("PUBLICADO E CONFERIDO:", json.dumps(p.get("links"), ensure_ascii=False)); sys.exit(0)
    if a: print("NA FILA. feito:", json.dumps(a.get("feito") or {}, ensure_ascii=False), "| erros:", json.dumps(a.get("erros") or {}, ensure_ascii=False)); sys.exit(1)
    print("não está na fila nem nos publicados"); sys.exit(2)
if cmd == "pedir":
    # DRIVE COM LOGIN (27/11/2026): pede ao robô uma sessão de envio. Uso: pedir <conta> <cod_ibge> "<nome.mp4>" <tamanho> <sha256>
    nome, tam_, sha = sys.argv[4], int(sys.argv[5]), sys.argv[6]; pid = f"{conta}-{cod}.json"
    try: ligado = (AQUI / "drive_codigo.txt").read_text(encoding="utf-8").startswith("CONECTADO")
    except Exception: ligado = False
    if not ligado: print("SEM RESPOSTA: o robô ainda não está com o Drive conectado; tente de novo em alguns minutos"); sys.exit(5)
    for tent in range(6):
        (AQUI / "pedidos").mkdir(exist_ok=True); (AQUI / "pedidos" / pid).write_text(json.dumps({"nome": nome, "tamanho": tam_, "sha256": sha, "ts": time.time()}, ensure_ascii=False), encoding="utf-8")
        git("add", "agendador/pedidos/" + pid); git("-c", "user.name=agendador", "-c", "user.email=agendador@users.noreply.github.com", "commit", "-q", "-m", f"pedido de envio {conta} {cod}")
        if git("push", "-q", "origin", "HEAD:main").returncode == 0: break
        time.sleep(3); atualizar()
    else: print("SEM RESPOSTA: não consegui gravar o pedido no agenda-qr (confira o add_repo com access push)"); sys.exit(5)
    fim = time.time() + 420
    while time.time() < fim:
        time.sleep(15); atualizar()
        try:
            r = json.loads((AQUI / "respostas" / pid).read_text(encoding="utf-8"))
            if r.get("sha256") == sha and r.get("sessao"): print("SESSAO " + r["sessao"]); sys.exit(0)
        except Exception: pass
    print("SEM RESPOSTA: o robô não abriu a sessão de envio em 7 min (Drive com login desligado ou robô parado)"); sys.exit(5)
drive_id, tam, legenda = sys.argv[4], int(sys.argv[5]), sys.argv[6].strip()
sha256 = sys.argv[7] if len(sys.argv) > 7 and len(sys.argv[7]) == 64 else None
import re as _re
if not _re.fullmatch(r"[A-Za-z0-9_-]{20,80}", drive_id) or _re.fullmatch(r"[0-9a-f]{64}", legenda):
    print("RECUSADO: o id do Drive ou o título vieram trocados (id:", drive_id[:40], "| título:", legenda[:40], "). Rode de novo: python3 postar.py direto <SIGLA> <cod> <arquivo.mp4> \"<título>\""); sys.exit(2)
if not (AQUI / "mapas_ativo.txt").exists(): print("INATIVO: a postagem automática dos mapas está desligada pelo dono; nada foi agendado (o vídeo fica só no Drive)."); sys.exit(3)
redes = [r for r in REDES if (st.get(conta, {}).get(r) or {}).get("ok")]
if not redes:
    print(f"NÃO CONECTADO: o perfil {conta} ainda não tem nenhuma rede conectada; nada foi agendado (o vídeo fica só no Drive)."); sys.exit(3)
def horario(conta):
    """REGRA DO DONO (26/11/2026): os perfis de mapa só postam das 05:00 às 23:00 (Brasília), no máximo 10 vídeos por dia por perfil,
    com 1h45 entre um e outro. Vídeo que fica pronto fora da janela (ou depois do 10º do dia) entra no primeiro horário livre seguinte."""
    tz = ZoneInfo("America/Sao_Paulo"); agora = dt.datetime.now(tz).replace(microsecond=0)
    qs = sorted(dt.datetime.fromisoformat(x["quando"]).astimezone(tz) for x in ler("agenda.json") + ler("publicados.json") if x.get("conta") == conta and x.get("quando"))
    c = max(agora, (qs[-1] + dt.timedelta(minutes=105)) if qs else agora)
    for _ in range(40):
        if c.hour < 5: c = c.replace(hour=5, minute=0, second=0)
        ultimo = c.replace(hour=22, minute=45, second=0)
        if c > ultimo or sum(1 for q in qs if q.date() == c.date()) >= 10:
            c = (c + dt.timedelta(days=1)).replace(hour=5, minute=0, second=0); continue
        return c
    return c
for tent in range(6):
    a, p = achar()
    if a or p: print("JÁ ESTAVA", "publicado" if p else "na fila", "- não agendo de novo:", arq); sys.exit(4)
    ag = ler("agenda.json")
    ag.append({"id": f"{conta} {cod} {legenda.split('#')[0].strip()}"[:60], "arquivo": arq, "legenda": legenda, "conta": conta, "plataformas": redes,
               "quando": horario(conta).isoformat(timespec="seconds"), "drive_id": drive_id, "tamanho": tam, "ia": True, **({"sha256": sha256} if sha256 else {})})
    (AQUI / "agenda.json").write_text(json.dumps(ag, ensure_ascii=False, indent=1), encoding="utf-8")
    git("add", "agendador/agenda.json"); git("-c", "user.name=agendador", "-c", "user.email=agendador@users.noreply.github.com", "commit", "-q", "-m", f"mapa: publicar agora {conta} {cod}")
    if git("push", "-q", "origin", "HEAD:main").returncode == 0:
        print("NA FILA para publicar às", ag[-1]["quando"][11:16], "de", ag[-1]["quando"][:10], "(janela 05h-23h, até 10 por dia) em:", ", ".join(redes), "| faltam conectar:", ", ".join(r for r in REDES if r not in redes) or "nenhuma"); sys.exit(0)
    time.sleep(3); atualizar()
sys.exit("não consegui gravar na agenda (push recusado)")
