"""HORÁRIOS ESPALHADOS (pedido do dono, 27/11/2026): os vídeos de cada perfil de mapa saem ao longo do dia inteiro, não tudo de manhã.
Cada perfil tem 10 horários fixos por dia, entre 05h e 23h. Um vídeo novo NÃO pega o próximo horário livre: pega o horário livre que
melhor ESPALHA o dia (almoço, noite, manhã, fim de tarde...), na ordem de PRIORIDADE abaixo. Assim, com 5 vídeos no dia eles caem em
manhã, almoço, tarde, começo e fim da noite; do 6º ao 10º vão preenchendo os intervalos. Cada perfil tem alguns minutos de diferença
dos outros, para os 8 não postarem no mesmo minuto.
MÍNIMO DE 5 POR DIA: antes de passar de 5 num dia, o agendador garante 5 em hoje, amanhã e depois de amanhã (reserva), para nenhum dia ficar abaixo de 5
quando a produção atrasar. Os 5 primeiros horários de cada dia são: 07:50 (manhã), 12:40 (almoço), 16:00 (tarde), 19:20 e 21:00 (noite)."""
import datetime as dt
from zoneinfo import ZoneInfo
TZ = ZoneInfo("America/Sao_Paulo")
SLOTS = ["06:10", "07:50", "09:30", "11:10", "12:40", "14:20", "16:00", "17:40", "19:20", "21:00"]   # + deslocamento do perfil (até +49 min): o último cai antes das 22h
PRIORIDADE = ["12:40", "19:20", "07:50", "16:00", "21:00", "09:30", "14:20", "17:40", "11:10", "06:10"]
ORDEM = ["mapa-sc", "mapa-rs", "mapa-pr", "mapa-mg", "mapa-mt", "mapa-sp", "mapa-norte", "mapa-br", "mapa-rj"]
def _slot(dia, hhmm, conta):
    h, m = map(int, hhmm.split(":")); desl = (ORDEM.index(conta) if conta in ORDEM else 0) * 7
    return dt.datetime(dia.year, dia.month, dia.day, h, m, tzinfo=TZ) + dt.timedelta(minutes=desl)
def horario(conta, itens, agora=None, folga=10):
    """Próximo horário para um vídeo do perfil. itens = agenda + publicados (para saber os horários já ocupados)."""
    agora = (agora or dt.datetime.now(TZ)).astimezone(TZ).replace(microsecond=0); ocup = []
    for x in itens:
        if x.get("conta") == conta and x.get("quando") and not str(x.get("arquivo", "")).endswith("-tt.mp4"):
            try: ocup.append(dt.datetime.fromisoformat(x["quando"]).astimezone(TZ))
            except Exception: pass
    def livre(dia, limite):
        if sum(1 for q in ocup if q.date() == dia) >= limite: return None
        for hhmm in PRIORIDADE:
            s = _slot(dia, hhmm, conta)
            if s < agora + dt.timedelta(minutes=folga): continue
            if any(abs((q - s).total_seconds()) < 50 * 60 for q in ocup): continue   # já tem vídeo perto desse horário
            return s
    hoje = agora.date()
    # 1º) GARANTIR O MÍNIMO (pedido do dono: 5 por dia em cada perfil, manhã, tarde e noite): completa 5 em hoje, depois 5 em amanhã, depois 5 em depois de amanhã (reserva de 2 dias)
    for d in range(0, 3):
        s = livre(hoje + dt.timedelta(days=d), 5)
        if s: return s
    # 2º) o que passar disso vai preenchendo até 10 por dia, do dia mais próximo para o mais distante
    for d in range(0, 30):
        s = livre(hoje + dt.timedelta(days=d), 10)
        if s: return s
    return agora
