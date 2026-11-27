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
INTERVALO = 30   # minutos entre dois vídeos do MESMO perfil
def horario(conta, itens, agora=None, folga=0):
    """REGRA ATUAL DO DONO (27/11/2026, 15:43): esquecer a janela das 05h às 23h e os horários fixos. O vídeo é publicado ASSIM QUE FICA PRONTO,
    a qualquer hora do dia ou da noite. Única folga: 30 minutos entre dois vídeos do mesmo perfil, para dois que ficaram prontos juntos não saírem colados.
    (Os horários fixos acima ficaram só como histórico; não são mais usados.)"""
    agora = (agora or dt.datetime.now(TZ)).astimezone(TZ).replace(microsecond=0); fut = []
    for x in itens:
        if x.get("conta") == conta and x.get("quando") and not str(x.get("arquivo", "")).endswith("-tt.mp4"):
            try:
                q = dt.datetime.fromisoformat(x["quando"]).astimezone(TZ)
                if q > agora - dt.timedelta(minutes=INTERVALO): fut.append(q)
            except Exception: pass
    return max([agora] + [q + dt.timedelta(minutes=INTERVALO) for q in fut])
