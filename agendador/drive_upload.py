"""Sobe um MP4 para o Drive pelo Apps Script Web App, direto do GitHub Actions (sem PC ligado).
Uso: python agendador/drive_upload.py ping
     python agendador/drive_upload.py enviar <arquivo.mp4> "<nome no Drive>"
Segredos (GitHub > Settings > Secrets): APPS_SCRIPT_URL, APPS_SCRIPT_SEGREDO. Nunca imprime o segredo."""
import base64, json, os, sys, requests
URL = os.environ["APPS_SCRIPT_URL"]; SEG = os.environ["APPS_SCRIPT_SEGREDO"]; BLOCO = 3 * 1024 * 1024
def chamar(corpo):
    corpo["segredo"] = SEG
    r = requests.post(URL, data=json.dumps(corpo), headers={"Content-Type": "text/plain"}, timeout=300, allow_redirects=True)
    try: return r.json()
    except Exception: sys.exit(f"resposta inesperada ({r.status_code}): {r.text[:200]}")
cmd = sys.argv[1]
if cmd == "ping":
    j = chamar({"acao": "ping"}); print({k: v for k, v in j.items() if k != "segredo"}); sys.exit(0 if j.get("ok") else 1)
arq, nome = sys.argv[2], sys.argv[3]; total = os.path.getsize(arq)
j = chamar({"acao": "iniciar", "nome": nome, "mime": "video/mp4", "tamanho": total})
if not j.get("ok"): sys.exit(f"iniciar falhou: {j.get('erro')}")
ses = j["sessao"]; ini = 0
with open(arq, "rb") as f:
    while True:
        b = f.read(BLOCO)
        if not b: break
        j = chamar({"acao": "bloco", "sessao": ses, "inicio": ini, "total": total, "dados": base64.b64encode(b).decode()})
        if not j.get("ok"): sys.exit(f"bloco {ini} falhou: {j.get('erro')}")
        ini += len(b); print(f"{ini}/{total}", flush=True)
print("COMPLETO", {k: v for k, v in j.items() if k in ("completo", "arquivo")})
