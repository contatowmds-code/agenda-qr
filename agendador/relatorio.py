#!/usr/bin/env python3
"""Relatório de métricas do Instagram (só leitura) + respostas a comentários (DESLIGADAS por padrão).
Uso: python agendador/relatorio.py [--responder]   Credenciais: META_ACCOUNTS (segredo do GitHub, igual ao publicar.py). Nunca imprime tokens.
- Escreve agendador/relatorio.md com os últimos posts de cada conta (alcance, curtidas, comentários, salvos, compartilhamentos).
- Comentários: procura a palavra-chave de agendador/comentarios.json em comentários ainda não respondidos. Só RESPONDE se "ativo": true em
  comentarios.json E se rodar com --responder. Cada resposta fica em agendador/respondidos.json (nunca responde o mesmo comentário duas vezes)."""
import json, os, argparse, datetime as dt
from pathlib import Path
import requests
AQUI = Path(__file__).resolve().parent; GRAPH = "https://graph.facebook.com/v21.0"
ap = argparse.ArgumentParser(); ap.add_argument("--responder", action="store_true"); ap.add_argument("--limite", type=int, default=10); a = ap.parse_args()
contas = json.loads(os.environ.get("META_ACCOUNTS") or "{}")
cfg_p = AQUI / "comentarios.json"; cfg = json.loads(cfg_p.read_text(encoding="utf-8")) if cfg_p.exists() else {"ativo": False, "palavras": ["arquivo"], "resposta": "Te mandei no direct!", "maximo_por_rodada": 5}
resp_p = AQUI / "respondidos.json"; respondidos = set(json.loads(resp_p.read_text(encoding="utf-8"))) if resp_p.exists() else set()
def get(path, tok, **p):
    return requests.get(f"{GRAPH}/{path}", params={**p, "access_token": tok}, timeout=60).json()
linhas = [f"# Relatório Instagram — {dt.datetime.now(dt.timezone.utc).strftime('%d/%m/%Y %H:%M')} UTC\n"]; respondeu = 0; pendentes = []
for conta, d in contas.items():
    uid = d.get("ig_user_id"); tok = d.get("ig_token") or d.get("fb_token")
    if not uid or not tok: linhas.append(f"## {conta}\nsem credencial\n"); continue
    perfil = get(uid, tok, fields="username,followers_count,media_count")
    linhas.append(f"## {conta} — @{perfil.get('username','?')} · {perfil.get('followers_count','?')} seguidores\n")
    linhas.append("| Post | Data | Curtidas | Coment. | Alcance | Salvos | Compart. |\n|---|---|---|---|---|---|---|")
    midias = get(f"{uid}/media", tok, fields="id,caption,timestamp,like_count,comments_count,permalink", limit=a.limite).get("data", [])
    for m in midias:
        ins = get(f"{m['id']}/insights", tok, metric="reach,saved,shares").get("data", [])
        v = {i["name"]: (i.get("values") or [{}])[0].get("value", "-") for i in ins}
        cap = (m.get("caption") or "").split("#")[0].strip()[:40].replace("|", " ")
        linhas.append(f"| [{cap}]({m.get('permalink','')}) | {m.get('timestamp','')[:10]} | {m.get('like_count','-')} | {m.get('comments_count','-')} | {v.get('reach','-')} | {v.get('saved','-')} | {v.get('shares','-')} |")
        if (m.get("comments_count") or 0) > 0:
            for c in get(f"{m['id']}/comments", tok, fields="id,text,username,replies{id}", limit=25).get("data", []):
                txt = (c.get("text") or "").lower()
                if c["id"] in respondidos or c.get("replies") or not any(w.lower() in txt for w in cfg["palavras"]): continue
                pendentes.append((conta, c["id"], c.get("username", "?"), (c.get("text") or "")[:60]))
                if a.responder and cfg.get("ativo") and respondeu < cfg.get("maximo_por_rodada", 5):
                    r = requests.post(f"{GRAPH}/{c['id']}/replies", data={"message": cfg["resposta"], "access_token": tok}, timeout=60).json()
                    if "id" in r: respondidos.add(c["id"]); respondeu += 1
                    else: print("ERRO resposta:", str(r)[:200])
    linhas.append("")
linhas.append(f"## Comentários com a palavra-chave ({'respostas ATIVAS' if cfg.get('ativo') and a.responder else 'só listagem'})")
for conta, cid, usr, txt in pendentes: linhas.append(f"- [{conta}] @{usr}: {txt}")
linhas.append(f"\nRespondidos nesta rodada: {respondeu}")
(AQUI / "relatorio.md").write_text("\n".join(linhas) + "\n", encoding="utf-8"); resp_p.write_text(json.dumps(sorted(respondidos)), encoding="utf-8")
print("\n".join(linhas))
