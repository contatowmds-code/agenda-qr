import json, math, bisect, functools, numpy as np, cv2
from gfx import *
import eng as E, objs, hero, ui
from bgs import hsh

# ---------- dados Natural Earth (50m) em coordenadas Mercator normalizadas ----------
def merc(lon, lat):
    lat = np.clip(lat, -80, 80)
    return (lon + 180.0) / 360.0, 0.5 - np.log(np.tan(np.pi / 4 + np.radians(lat) / 2)) / (2 * np.pi)

GJ = json.load(open('ne50.json'))
CTRY = {}      # nome -> lista de arrays Nx2 (mx,my)
for f in GJ['features']:
    nm = f['properties']['NAME']
    if nm == 'Antarctica': continue
    g = f['geometry']; polys = g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']]
    rings = []
    for pl in polys:
        a = np.array(pl[0], np.float64)
        mx, my = merc(a[:, 0], a[:, 1]); rings.append(np.stack([mx, my], 1))
    CTRY[nm] = rings
NAMES = list(CTRY)
ALLP = []   # (nome, idx, array, bbox)
for nm in NAMES:
    for r in CTRY[nm]:
        ALLP.append((nm, r, r.min(0), r.max(0)))
CENT = {'United States of America': (-98, 39), 'China': (104, 35), 'Germany': (10.4, 51), 'Japan': (138, 37),
        'United Kingdom': (-2, 54), 'India': (78, 22)}

def mc(lon, lat):
    x, y = merc(np.array(lon), np.array(lat)); return float(x), float(y)

# ---------- câmera virtual (estilo MapLibre: center, zoom, pitch, bearing) ----------
D = 1900.0; CY = 880.0
def cam(lon, lat, z, p=0, b=0): x, y = mc(lon, lat); return (x, y, z, p, b)

def project(mx, my, zz, c):
    cx, cy, z, p, b = c; S = 512.0 * 2 ** z
    dx = (mx - cx) * S; dy = -(my - cy) * S
    br = math.radians(b); sb, cb = math.sin(br), math.cos(br)
    X = dx * cb - dy * sb; Yf = dx * sb + dy * cb
    pr = math.radians(p); sp, cp = math.sin(pr), math.cos(pr)
    Z = zz * S
    yc = Yf * cp + Z * sp; dep = D - Yf * sp + Z * cp
    dep = np.maximum(dep, 0.16 * D)
    return 540 + D * X / dep, CY - D * yc / dep, dep

def lerpcam(a, b, e, dist):
    x = lerp(a[0], b[0], e); y = lerp(a[1], b[1], e)
    z = lerp(a[2], b[2], e) - min(1.1, dist * 5.0) * math.sin(math.pi * e)   # flyTo: abre e fecha
    return (x, y, z, lerp(a[3], b[3], e), lerp(a[4], b[4], e))

# ---------- linha do tempo de câmera: uma mudança a cada 1-2 s ----------
KF = []   # (t, cam)
GB = [b for b in E.BLK]
for i, B in enumerate(GB):
    v = B['v']
    if v['t'] != 'geo': continue
    nxt = GB[i + 1]['s'] if i + 1 < len(GB) else E.TOTAL
    n = len(v['cams']); seg = (nxt - B['s']) / n
    for j, c in enumerate(v['cams']):
        KF.append((B['s'] + j * seg, c))
_kt = [k[0] for k in KF]
for t0, c in KF[1:]: E.hit(t0, 'whoosh', 0.22)

def camera_at(t):
    j = bisect.bisect_right(_kt, t) - 1
    if j < 0: return KF[0][1]
    if j >= len(KF) - 1: return KF[-1][1]
    t0, a = KF[j]; t1, b = KF[j + 1]
    f = (t - t0) / max(t1 - t0, 1e-3); e = eio(ramp(f, 0.08, 0.96))
    dist = math.hypot(a[0] - b[0], a[1] - b[1])
    return lerpcam(a, b, e, dist)

# ---------- estilos de mapa (alternam para não repetir fundo) ----------
STY = [dict(ocean=(1, 24, 57), land=(14, 52, 98), edge=(52, 120, 190), grat=(8, 44, 90), bar=(1, 251, 180), hl=(1, 251, 180), fog=(1, 24, 57)),
       dict(ocean=(1, 251, 180), land=(1, 24, 57), edge=(40, 90, 150), grat=(1, 222, 160), bar=(255, 253, 241), hl=(1, 251, 180), fog=(1, 251, 180)),
       dict(ocean=(236, 232, 220), land=(1, 40, 84), edge=(60, 110, 170), grat=(214, 208, 192), bar=(1, 251, 180), hl=(1, 251, 180), fog=(236, 232, 220)),
       dict(ocean=(60, 6, 12), land=(120, 22, 30), edge=(220, 90, 90), grat=(90, 12, 20), bar=(255, 253, 241), hl=(255, 200, 70), fog=(60, 6, 12))]

for _s in STY:
    for _k in ('ocean','land','edge','grat','bar','hl','fog'): _s[_k]=_s[_k][::-1]

def shade(c, k): return tuple(int(max(0, min(255, x * k))) for x in c)

# ---------- barras de PIB (extrusão) e estado por tempo ----------
VAL = {'United States of America': 32.64, 'China': 21.55, 'Germany': 5.47, 'Japan': 4.34, 'United Kingdom': 4.27, 'India': 4.06}
KBAR = 0.0036

def bars_state():
    """quando cada barra nasce (tempo do início da fala em que entra)"""
    out = {}
    for B in GB:
        v = B['v']
        if v['t'] != 'geo': continue
        for nm, fr in v.get('bars', []):
            nxt_i = B['i'] + 1
            nxt = GB[nxt_i]['s'] if nxt_i < len(GB) else E.TOTAL
            out[nm] = min(out.get(nm, 1e9), B['s'] + fr * (nxt - B['s']))
    return out
BART = bars_state()
BARVAL = dict(VAL)

def draw_land(cv, c, sty, hlw, t):
    cv[:] = sty['ocean']
    # graticule
    for lon in range(-180, 181, 15):
        xs, ys = merc(np.full(40, lon, float), np.linspace(-80, 80, 40)); sx, sy, _ = project(xs, ys, 0, c)
        cv2.polylines(cv, [np.stack([sx, sy], 1).astype(np.int32)], False, sty['grat'], 2, cv2.LINE_AA)
    for lat in range(-75, 80, 15):
        xs, ys = merc(np.linspace(-180, 180, 90), np.full(90, lat, float)); sx, sy, _ = project(xs, ys, 0, c)
        cv2.polylines(cv, [np.stack([sx, sy], 1).astype(np.int32)], False, sty['grat'], 2, cv2.LINE_AA)
    cx, cy = c[0], c[1]
    for nm, r, lo, hi in ALLP:
        sx, sy, dp = project(r[:, 0], r[:, 1], 0, c)
        if sx.max() < -200 or sx.min() > W + 200 or sy.max() < -200 or sy.min() > H + 200: continue
        pts = np.stack([sx, sy], 1).astype(np.int32)
        cv2.fillPoly(cv, [pts], sty['land'])
        w = hlw.get(nm, 0)
        if w > 0.01:
            ov = cv.copy(); cv2.fillPoly(ov, [pts], sty['hl']); cv[:] = cv2.addWeighted(ov, 0.8 * w, cv, 1 - 0.8 * w, 0)
        cv2.polylines(cv, [pts], True, sty['edge'] if w < .01 else shade(sty['hl'], 1.0), 2 if w < .01 else 4, cv2.LINE_AA)

def haze(cv, c, sty):
    p = c[3]
    if p < 8: return
    pr = math.radians(p); hy = CY - D * math.sin(pr) * 0
    # horizonte: onde dep -> 0.16 D ; aproximado por gradiente no topo
    k = min(1.0, p / 60.0)
    g = np.clip((np.linspace(0, 1, H)[:, None] - 0.0) , 0, 1)
    top = np.clip(1 - np.linspace(0, 1, H) / (0.62 - 0.12 * k), 0, 1) ** 1.6 * (0.55 + 0.4 * k)
    top = top[:, None, None].astype(np.float32)
    fog = np.array(sty['fog'], np.float32)
    cv[:] = (cv.astype(np.float32) * (1 - top) + fog * top).astype(np.uint8)

def prism(cv, mx, my, hw, h, c, col, a_in):
    """barra 3D com 4 laterais + topo"""
    if h <= 0: return None
    cs = [(mx - hw, my - hw), (mx + hw, my - hw), (mx + hw, my + hw), (mx - hw, my + hw)]
    bot = [project(np.array([x]), np.array([y]), 0, c) for x, y in cs]
    top = [project(np.array([x]), np.array([y]), h, c) for x, y in cs]
    B = [(float(b[0][0]), float(b[1][0]), float(b[2][0])) for b in bot]; T = [(float(b[0][0]), float(b[1][0]), float(b[2][0])) for b in top]
    faces = []
    for i in range(4):
        j = (i + 1) % 4
        q = np.array([[B[i][0], B[i][1]], [B[j][0], B[j][1]], [T[j][0], T[j][1]], [T[i][0], T[i][1]]], np.int32)
        dep = (B[i][2] + B[j][2]) / 2; ang = math.atan2(cs[j][1] - cs[i][1], cs[j][0] - cs[i][0]) - math.radians(c[4])
        faces.append((dep, q, 0.52 + 0.28 * (1 + math.cos(ang)) / 2))
    faces.sort(key=lambda f: -f[0])
    for dep, q, k in faces:
        cv2.fillConvexPoly(cv, q, shade(col, k)); cv2.polylines(cv, [q], True, shade(col, 0.35), 2, cv2.LINE_AA)
    tq = np.array([[p[0], p[1]] for p in T], np.int32)
    cv2.fillConvexPoly(cv, tq, shade(col, 1.12)); cv2.polylines(cv, [tq], True, shade(col, 0.45), 2, cv2.LINE_AA)
    return (sum(p[0] for p in T) / 4, sum(p[1] for p in T) / 4, sum(p[2] for p in T) / 4)

def rings(cv, c, nm, t0, t, col):
    lon, lat = CENT[nm]; x0, y0 = mc(lon, lat)
    for k in range(3):
        ph = ((t - t0) * 0.7 + k / 3.0) % 1.0; r = 0.004 + ph * 0.05
        th = np.linspace(0, 2 * math.pi, 72); sx, sy, _ = project(x0 + r * np.cos(th), y0 + r * np.sin(th), 0, c)
        ov = cv.copy(); cv2.polylines(ov, [np.stack([sx, sy], 1).astype(np.int32)], True, col, 5, cv2.LINE_AA)
        a = 0.8 * (1 - ph); cv[:] = cv2.addWeighted(ov, a, cv, 1 - a, 0)

def arc(cv, c, a, b, u, col, lift=0.05):
    x0, y0 = mc(*CENT[a]); x1, y1 = mc(*CENT[b]); s = np.linspace(0, u, 60)
    sx, sy, _ = project(x0 + (x1 - x0) * s, y0 + (y1 - y0) * s, lift * np.sin(np.pi * s), c)
    cv2.polylines(cv, [np.stack([sx, sy], 1).astype(np.int32)], False, col, 6, cv2.LINE_AA)
    if u > 0.02: cv2.circle(cv, (int(sx[-1]), int(sy[-1])), 14, (255, 255, 255), -1, cv2.LINE_AA)

def tiltshift(cv):
    sm = cv2.resize(cv, (W // 3, H // 3), interpolation=cv2.INTER_AREA)
    sm = cv2.GaussianBlur(sm, (0, 0), 7); bl = cv2.resize(sm, (W, H), interpolation=cv2.INTER_LINEAR)
    xs = np.abs(np.arange(W) - 540)[None, :]; ys = np.abs(np.arange(H) - 900)[:, None]
    m = np.clip((xs - 270) / 270.0, 0, 1) ** 1.1
    m = np.clip(m + np.clip((ys - 700) / 500.0, 0, 1) * 0.8, 0, 1)[..., None].astype(np.float32)
    bl = bl * (1 - 0.5 * m)
    cv[:] = (cv * (1 - 0.35 * m) * 0 + cv * (1 - m) + bl * m).astype(np.uint8)

def label(cv, name, val, x, y, sc, a, bright):
    sc *= 0.95
    s1 = ui.pill(name, 420, 92, (1, 24, 57), (255, 253, 241), 46, font=FA)
    sc*=1.35; place(cv, s1, x, y - 62 * sc, sc, sc, 0, a)
    s2 = ui.pill(val, 380, 90, (1, 251, 180), (1, 24, 57), 52, font=FA)
    place(cv, s2, x, y + 20 * sc, sc, sc, 0, a)

def gauge(cv, v0, v1, u, t, lab):
    cx, cy, R = 540, 1000, 270
    ov = cv.copy(); cv2.circle(ov, (cx, cy), R + 60, (57, 24, 1), -1, cv2.LINE_AA); cv[:] = cv2.addWeighted(ov, 0.7, cv, 0.3, 0)
    for i in range(0, 41):
        a = math.radians(180 + i * 4.5); r0 = R - (26 if i % 5 == 0 else 14)
        col = (241, 253, 255) if i % 5 == 0 else (180, 140, 120)
        cv2.line(cv, (int(cx + r0 * math.cos(a)), int(cy + r0 * math.sin(a))), (int(cx + R * math.cos(a)), int(cy + R * math.sin(a))), col, 4 if i % 5 == 0 else 2, cv2.LINE_AA)
    cv2.ellipse(cv, (cx, cy), (R, R), 0, 180, 180 + 180 * eo3(u), (180, 251, 1), 16, cv2.LINE_AA)
    val = lerp(v0, v1, eo3(u)); a = math.radians(180 + 180 * eo3(u))
    cv2.line(cv, (cx, cy), (int(cx + (R - 50) * math.cos(a)), int(cy + (R - 50) * math.sin(a))), (255, 255, 255), 10, cv2.LINE_AA)
    cv2.circle(cv, (cx, cy), 28, (48, 59, 255), -1, cv2.LINE_AA)
    E.txt(cv, f"{val:.2f}".replace('.', ','), FA, 170, (1, 251, 180), 540, 1130, 700)
    E.txt(cv, lab, FA, 60, (255, 253, 241), 540, 1230, 800)

def race(cv, rows, u, t):
    """barras horizontais disputando (Japão x Índia em 2027)"""
    y0 = 520; mx = max(r[1] for r in rows)
    for i, (nm, val, col) in enumerate(rows):
        k = eo3(ramp(u, i * 0.12, 0.7 + i * 0.1)); w = int(540 * val / mx * k); y = y0 + i * 190
        ov = cv.copy(); cv2.rectangle(ov, (270, y), (270 + 540, y + 120), (57, 24, 1), -1); cv[:] = cv2.addWeighted(ov, 0.55, cv, 0.45, 0)
        cv2.rectangle(cv, (270, y), (270 + w, y + 120), col[::-1], -1)
        E.txt(cv, nm, FA, 62, (1, 24, 57), 270 + 130, y + 62, 230)
        E.txt(cv, f"{val * k:.2f}".replace('.', ','), FA, 76, (255, 253, 241), min(270 + w - 20, 800), y + 62, 220)

def v_geo(cv, B, u, d, t):
    v = B['v']; tb = t - B['s']; c = camera_at(t)
    st = STY[v.get('st', 0)]
    hlw = {}
    for nm, fr in v.get('hl', []): hlw[nm] = eob(ramp(u, fr, fr + 0.12), 1.5)
    # destaques herdados (países já explicados continuam levemente marcados)
    for nm, tt0 in BART.items():
        if t >= tt0 and nm not in hlw: hlw[nm] = 0.22
    draw_land(cv, c, st, hlw, t)
    haze(cv, c, st)
    tiltshift(cv)
    # barras
    items = []
    for nm, t0 in BART.items():
        if t < t0: continue
        g = 1.0 if (nm == 'United States of America' and t0 < 2.5) else eob(ramp(t - t0, 0, 0.7), 1.4); lon, lat = CENT[nm]; x0, y0 = mc(lon, lat)
        items.append((nm, x0, y0, BARVAL[nm] * KBAR * g, g))
    deps = []
    for nm, x0, y0, h, g in items:
        _, _, dep = project(np.array([x0]), np.array([y0]), 0, c); deps.append(float(dep[0]))
    order = sorted(range(len(items)), key=lambda i: -deps[i])
    tops = {}
    for i in order:
        nm, x0, y0, h, g = items[i]
        tops[nm] = prism(cv, x0, y0, 0.0055, h, c, st['bar'], 1.0)
    # anéis (Turf buffer) e arcos
    for nm in v.get('ring', []): rings(cv, c, nm, B['s'], t, st['hl'])
    if v.get('arc'):
        a, b = v['arc']; arc(cv, c, a, b, eo3(ramp(u, 0.1, 0.8)), (255, 255, 255))
    # rótulos (nítidos, depois do desfoque)
    for nm, x0, y0, h, g in items:
        if nm in v.get('lab', []) and tops.get(nm):
            sx, sy, dp = tops[nm]; sc = float(np.clip(D / dp, 0.55, 1.1)) * eob(ramp(u, 0.1, 0.3), 1.6)
            nome = {'United States of America': 'EUA', 'China': 'CHINA', 'Germany': 'ALEMANHA', 'Japan': 'JAPÃO', 'United Kingdom': 'REINO UNIDO', 'India': 'ÍNDIA'}[nm]
            val = f"US$ {BARVAL[nm]:.2f} TRI".replace('.', ',')
            label(cv, nome, val, float(np.clip(sx, 400, 680)), float(np.clip(sy - 110, 300, 1250)), sc, 1.0, False)
    ov = v.get('ov')
    if ov == 'gauge': gauge(cv, v['g0'], v['g1'], ramp(u, 0.15, 0.85), t, v['gl'])
    if ov == 'race': race(cv, v['rows'], ramp(u, 0.05, 0.9), t)
    if ov == 'cta1':
        o = cv.copy(); cv2.rectangle(o, (0, 0), (W, H), (57, 24, 1), -1); cv[:] = cv2.addWeighted(o, 0.55, cv, 0.45, 0)
        k = eob(ramp(u, 0, .25), 1.8); place(cv, ui.qv_logo(380), 540, 480, k, k)
        hero.title(cv, "QUER CRIAR|*VÍDEOS* COMO|ESSE?", tb, False)
    if ov == 'cta2':
        o = cv.copy(); cv2.rectangle(o, (0, 0), (W, H), (57, 24, 1), -1); cv[:] = cv2.addWeighted(o, 0.6, cv, 0.4, 0)
        E.v_cta2(cv, B, u, d, t)
    if ov == 'follow':
        o = cv.copy(); cv2.rectangle(o, (0, 0), (W, H), (57, 24, 1), -1); cv[:] = cv2.addWeighted(o, 0.6, cv, 0.4, 0)
        k = eob(ramp(u, 0, .25), 1.8); place(cv, ui.qv_logo(380), 540, 520, k, k)
        r1 = eob(ramp(u, .2, .5), 1.7); place(cv, ui.pill("SEGUIR", 640, 130, (1, 251, 180), (1, 24, 57), 70, font=FA), 540, 900, r1, r1)
        r2 = ramp(u, .55, .8)
        if r2 > 0: place(cv, ui.pill("SEGUINDO ✓", 700, 130, (48, 56, 80), (255, 253, 241), 70, font=FA), 540, 900, eob(r2, 1.7), eob(r2, 1.7))
        r3 = ramp(u, .72, .95)
        if r3 > 0: place(cv, ui.pill("MENSAGEM CHEGA NA DM", 900, 120, (255, 253, 241), (1, 24, 57), 54, font=FA), 540, 1130, eob(r3, 1.7), eob(r3, 1.7))
    if v.get('tt') and not ov: hero.title(cv, v['tt'], tb, False)

# --- capa: o primeiro frame precisa ser chamativo ---
_v0 = v_geo
def v_geo2(cv, B, u, d, t):
    _v0(cv, B, u, d, t)
    if B['i'] == 0 and t < 1.2:
        a = 1 - ramp(t, 0.8, 1.2)
        ov = cv.copy(); o2 = cv.copy(); cv2.rectangle(o2, (0, 0), (W, 760), (57, 24, 1), -1); ov[:] = cv2.addWeighted(o2, 0.62, cv, 0.38, 0)
        hero.title(ov, "*EUA* VALEM|MAIS QUE *CHINA*|+ *ALEMANHA*", 0.9, False)
        cv[:] = cv2.addWeighted(ov, a, cv, 1 - a, 0)
E.VIS['geo'] = v_geo2
# --- SFX por elemento: entra / sobe / sai ---
for nm, t0 in BART.items():
    if t0 > 2.5: E.hit(t0, 'pop', 0.7); E.hit(t0 + 0.35, 'tick', 0.4)
for i, B in enumerate(GB):
    v = B['v']
    if v['t'] != 'geo': continue
    nxt = GB[i + 1]['s'] if i + 1 < len(GB) else E.TOTAL; d = nxt - B['s']
    for nm, fr in v.get('hl', []): E.hit(B['s'] + fr * d, 'blip', 0.6)
    if v.get('lab'): E.hit(B['s'] + 0.1 * d, 'pop', 0.5)
    if v.get('ov') in ('race', 'gauge', 'cta1', 'cta2', 'follow'): E.hit(B['s'] + 0.12 * d, 'pop', 0.6)
    if v.get('ov') == 'gauge':
        for j in range(6): E.hit(B['s'] + (0.15 + j * 0.12) * d, 'tick', 0.35)
    if v.get('ring'): E.hit(B['s'] + 0.05 * d, 'blip', 0.5)

