// V5 Enem 2026 - QV. 68,3 s, 30 fps, 2050 quadros.
import { M as E, idle, blinkAt, q, clamp, lerp, ramp } from './motion.js';
export const FPS = 30, TOTAL = 2050, DECK = 0, COVER = 9999;
const D2R = Math.PI / 180, R2D = 180 / Math.PI;
export const LIGHTS = {
  room: { az: 40, el: 60, sky: '#d8d4c8', ground: '#7a7060', hemi: 1.35, sun: '#fff0d0', sunI: 1.1, fog: '#d8d4c8', fogNear: 300, fogFar: 1500, skyTop: '#8fb4e0', skyHor: '#dfe8f0', sat: 1.08, vig: 0.08, shadowExt: 90 },
  night: { az: 120, el: 40, sky: '#4a5f9a', ground: '#2a3556', hemi: 0.9, sun: '#9db4f0', sunI: 1.0, fog: '#1a2440', fogNear: 300, fogFar: 2500, skyTop: '#0b1230', skyHor: '#2a3c6a', sat: 1.05, vig: 0.08, shadowExt: 90 },
  day: { az: 60, el: 55, sky: '#cfe3f0', ground: '#7d9a86', hemi: 1.15, sun: '#fff4dc', sunI: 2.1, fog: '#d8e8f2', fogNear: 400, fogFar: 4000, skyTop: '#4f95d6', skyHor: '#e6f1f6', sat: 1.12, vig: 0.08, shadowExt: 90 },
  gold: { az: 250, el: 14, sky: '#ffd8a8', ground: '#a98a5a', hemi: 1.0, sun: '#ffb764', sunI: 2.5, fog: '#f6c88f', fogNear: 300, fogFar: 3000, skyTop: '#c9604a', skyHor: '#ffd89a', sat: 1.18, vig: 0.08, shadowExt: 90, sunDisc: '#fff1c8', sunSize: 0.0016 },
  dark: { az: 30, el: 70, sky: '#202838', ground: '#101418', hemi: 0.55, sun: '#fff3c4', sunI: 1.6, fog: '#0a0d12', fogNear: 60, fogFar: 400, skyTop: '#05070c', skyHor: '#0b0e14', sat: 1.05, vig: 0.08, shadowExt: 40 },
  dusk: { az: 200, el: 9, sky: '#b4a6d6', ground: '#6a5f78', hemi: 0.95, sun: '#ff8f6a', sunI: 2.2, fog: '#c7a3b8', fogNear: 300, fogFar: 3000, skyTop: '#33407e', skyHor: '#f0a08a', sat: 1.12, vig: 0.08, shadowExt: 90 },
};
const OFF = { A: [0, 0, 0], B: [6000, 0, 0], C: [-6000, 0, 0], D: [0, 0, 6000], E: [0, 0, -6000], F: [12000, 0, 0] };
// ---- helpers de câmera: câmera sai do observador (origem do palco) e VAI em direção ao foco P ----
const SKYD = { mer: [88, 7], ven: [100, 17], mar: [116.5, 29], jup: [120.3, 29.6] };
const dirOf = (az, alt) => [Math.sin(az * D2R) * Math.cos(alt * D2R), Math.sin(alt * D2R), -Math.cos(az * D2R) * Math.cos(alt * D2R)];
const sky = (k) => dirOf(...SKYD[k]).map((v) => v * 700);
const toward = (P, d, lat = 0, up = 0, fov = 46, f = 0) => { const n = Math.hypot(...P), u = P.map((v) => v / n); const vx = -u[0] * d, vy = -u[1] * d, vz = -u[2] * d; const az = Math.atan2(vx, vz) * R2D + lat, el = Math.asin(vy / d) * R2D + up; return { f, F: P, d, az, el, fov }; };
const K = (f, F, d, az, el, fov = 46) => ({ f, F, d, az, el, fov });
const T = (f, P, d, lat, up, fov) => toward(P, d, lat, up, fov, f);
const DEF = [
  { id: 'hook', a: 0, st: 'A', light: 'room', cam: { keys: [K(0, [0, 0, 0], 130, 0, 86, 52), K(26, [0, 2, -10], 70, 20, 34, 50), K(87, [0, 3, 0], 95, 35, 38, 52), K(98, [0, 0, 0], 120, 10, 82, 52), K(138, [0, 1, 0], 85, -20, 55, 50), K(190, [0, 3, 8], 70, 30, 30, 50)] }, S: (f) => ({ reveal: E.smooth(ramp(f, 100, 190)) }), num: { a: 98, b: 130, v0: 0, v1: 32, sub: 'faltaram' } },
  { id: 'taxa', a: 204, st: 'B', light: 'night', cam: { keys: [K(204, [26, 30, 0], 70, 0, 4, 46), K(259, [26, 30, 0], 52, 12, 4, 42), K(286, [0, 30, 0], 110, 0, 6, 46), K(329, [-26, 30, 0], 55, -10, 4, 42), K(413, [0, 30, 0], 120, 0, 6, 48)] }, S: (f) => ({ b26: E.smooth(ramp(f, 206, 245)), b25: E.smooth(ramp(f, 330, 362)) }), card: { a: 286, text: '+5', sub: 'pontos' } },
  { id: 'mapa', a: 417, map: 'br2' },
  { id: 'portao', a: 487, st: 'C', light: 'day', cam: { keys: [K(487, [0, 10, -30], 150, 20, 8, 50), K(517, [0, 10, -20], 90, 8, 8, 46), K(535, [0, 8, -16], 60, 0, 6, 44), K(613, [0, 10, -14], 90, -10, 8, 48)] }, S: (f) => ({ open: E.smooth(ramp(f, 520, 560)) }), card: { a: 575, text: '2', sub: 'domingos seguidos' } },
  { id: 'escola', a: 614, st: 'D', light: 'day', cam: { keys: [K(614, [-70, 14, 0], 140, 25, 8, 50), K(632, [-70, 12, 0], 70, 10, 6, 46), K(682, [-30, 4, 14], 50, 20, 8, 44), K(721, [0, 4, 14], 60, 10, 8, 46)] }, S: (f) => ({ belt: ramp(f, 614, 721) * 0.6 }) },
  { id: 'auto', a: 722, st: 'D', light: 'day', cam: { keys: [K(722, [0, 4, 14], 70, 0, 12, 48), K(759, [50, 6, 14], 60, 20, 10, 46), K(807, [90, 16, 14], 50, 0, 8, 42), K(876, [90, 16, 10], 90, 20, 14, 48)] }, S: (f) => ({ belt: 0.6 + ramp(f, 722, 876) * 1.2, check: f >= 760 ? 1 : 0 }), card: { a: 738, text: 'AUTOMÁTICA', sub: 'inscrição' } },
  { id: 'antes', a: 877, st: 'D', light: 'gold', cam: { keys: [K(877, [0, 0, 10], 130, 0, 82, 52), K(942, [40, 2, 14], 60, 30, 30, 48), K(979, [-30, 3, 14], 60, -30, 24, 48), K(995, [0, 4, 14], 90, 0, 14, 50)] }, S: (f) => ({ belt: 1.8 + ramp(f, 877, 995) * 0.4, check: 1 }) },
  { id: 'escada', a: 996, st: 'E', light: 'day', cam: { keys: [K(996, [0, 6, 0], 120, 0, 8, 50), K(1038, [10, 8, 0], 90, 20, 10, 48), K(1096, [-20, 6, 0], 80, -20, 8, 46), K(1160, [30, 18, 0], 90, 10, 10, 48), K(1190, [20, 24, 0], 130, 0, 14, 52)] }, S: (f) => ({ grow: E.smooth(ramp(f, 1096, 1175)), climb: f * 0.004 }), card: { a: 1160, text: 'REDE PÚBLICA', sub: 'mais alunos' } },
  { id: 'primeiro_dia', a: 1191, st: 'B', light: 'night', cam: { keys: [K(1191, [26, 30, 0], 80, 0, 4, 46), K(1260, [26, 30, 0], 60, -10, 4, 42), K(1339, [0, 30, 0], 100, 0, 6, 46), K(1368, [0, 30, 0], 130, 0, 6, 50)] }, S: () => ({ b26: 1, b25: 0 }), card: { a: 1191, text: '1º DIA', sub: 'número parcial' }, q: { a: 1339, b: 1368 } },
  { id: 'cadeira', a: 1369, st: 'F', light: 'dark', cam: { keys: [K(1369, [0, 6, 2], 40, 25, 10, 50), K(1398, [0, 3, 2], 16, 20, 8, 44), K(1435, [0, 3, 2], 14, -20, 10, 44)] }, S: () => ({ spot: 1, lit: 0, door: 0 }), q: { a: 1388, b: 1435 } },
  { id: 'vaga', a: 1436, st: 'F', light: 'dark', cam: { keys: [K(1436, [0, 3, 2], 14, -20, 10, 44), K(1477, [0, 2, 2], 9, -60, 14, 42), K(1503, [0, 3, 2], 12, -110, 12, 44), K(1544, [0, 2, 1], 7, 20, 30, 40), K(1564, [0, 1, 0], 6, 20, 50, 40)] }, S: () => ({ spot: 1, lit: 0, door: 0 }) },
  { id: 'passo', a: 1565, st: 'F', light: 'dark', cam: { keys: [K(1565, [0, 2, 4], 10, 180, 6, 50), K(1644, [0, 1.6, -10], 18, 180, 8, 50), K(1670, [0, 1.2, -16], 14, 175, 6, 46), K(1718, [0, 1.6, -40], 26, 180, 6, 50), K(1742, [0, 6, -58], 22, 180, 6, 50)] }, S: (f) => ({ spot: 0, lit: ramp(f, 1670, 1740), door: f >= 1718 ? 1 : 0 }) },
  { id: 'cta_a', a: 1748, st: 'C', light: 'dusk', cam: { keys: [K(1748, [0, 5, 6], 20, 0, 6, 50), K(1802, [0, 5, 6], 16, 10, 8, 50)] }, S: () => ({ open: 1 }), act: 'cta' },
  { id: 'cta_b', a: 1803, st: 'C', light: 'dusk', cam: { keys: [K(1803, [0, 5, 6], 16, 10, 8, 50), K(1950, [0, 5, 6], 22, -14, 12, 52), K(2050, [0, 25, -10], 150, 20, 22, 54)] }, S: () => ({ open: 1 }), act: 'cta' },
];
export const SHOTS = DEF.map((s, i) => ({ ...s, b: (DEF[i + 1] ? DEF[i + 1].a - 1 : TOTAL - 1), g: i }));
export const shotAt = (f) => f === COVER ? { id: 'capa', a: COVER, b: COVER, st: 'A', light: 'room' } : (SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1]);
export const lightFor = (S, f) => ({ ...LIGHTS[S.light || 'dawn'] });
const l3 = (a, b, t) => a.map((v, i) => lerp(v, b[i], t));
export const camAt = (f) => {
  const S = shotAt(f);
  if (S.id === 'capa') return { pos: [0, 9, 34], look: [0, 3, 8], fov: 58, roll: 0, flash: 0 };
  if (S.map) return { pos: [0, 80, 100], look: [0, 70, 0], fov: 40, roll: 0, flash: 0 };
  const Kk = S.cam.keys.map((k, i) => ({ ...(i ? S.cam.keys[0] : {}), ...k })); let i = 0; while (i < Kk.length - 2 && f >= Kk[i + 1].f) i++;
  const A_ = Kk[i], B_ = Kk[i + 1], tt = E.smooth(clamp((f - A_.f) / Math.max(1, B_.f - A_.f)));
  const FF = l3(A_.F, B_.F, tt), d = lerp(A_.d, B_.d, tt), a = lerp(A_.az, B_.az, tt) * D2R, e = lerp(A_.el, B_.el, tt) * D2R, fov = lerp(A_.fov, B_.fov, tt);
  const O = OFF[S.st], F = [FF[0] + O[0], FF[1] + O[1], FF[2] + O[2]];
  const pos = [F[0] + d * Math.cos(e) * Math.sin(a), F[1] + d * Math.sin(e), F[2] + d * Math.cos(e) * Math.cos(a)];
  if (pos[1] < 1.0 && S.st !== 'B' && S.st !== 'C') pos[1] = 1.0;
  return { pos, look: F, fov, roll: 0, flash: 0 };
};
const dist3 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const dofAt = (f) => { const S = shotAt(f), C = camAt(f); const d = dist3(C.pos, C.look); if (S.id === 'capa') return { focus: d, cinf: 0, near: 1 }; return { focus: d, cinf: d < 14 ? 3.2 : 0.8, near: 1 }; };
export const worldAt = (f) => { const S = shotAt(f); const o = { stage: S.st || 'A' }; if (S.S) Object.assign(o, S.S(f)); if (f === COVER) o.reveal = 1; return o; };
const R = (T_, who, o, pos, extra = {}) => ({ key: who + JSON.stringify(o), draw: (p) => T_.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const life = (f, seed) => { const i = idle(f, seed); return { bob: q(i.bob, 3), tilt: q(i.tilt, 1), headTilt: q(i.headTilt, 1), blink: blinkAt(f, seed) }; };
export const actorsAt = (f, T_) => {
  const S = shotAt(f), out = []; const A = (who, o, pos, seed, sc = 1) => out.push(R(T_, who, { seed, ...life(f, seed), ...o }, pos, { s: sc }));
  if (S.act === 'cta') [['workA', -3.2], ['civB', -1.1], ['civD', 1.1], ['velha', 3.2]].forEach(([w, x], k) => A(w, { expr: 'laugh', facing: 0, L: k % 2 ? 'wave' : 'belly', wv: q((f * 0.35 + k) % 6.283, 1), R: 'up', bob: q(Math.abs(Math.sin(f * 0.3 + k)) * 0.04, 3) }, [x * 1.1, 0.4, 4], 36 + k, 1.5));
  return out;
};
const P0 = (i) => { const c = camAt(COVER), v = [c.look[0] - c.pos[0], c.look[1] - c.pos[1], c.look[2] - c.pos[2]], n = Math.hypot(...v); const p = [c.pos[0] + v[0] / n * 40, c.pos[1] + v[1] / n * 40 - 14, c.pos[2] + v[2] / n * 40]; return p[i]; };
// ---- cartões ----
const fmt = (n) => String(Math.round(n));
const NAVY = '#011839';
const rr = (g, x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
const glow = (g, s, x, y, size, col = '#fff', w = 900, sh = '#ffd27a') => { g.font = `${w} ${size}px Inter, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.save(); g.shadowColor = sh; g.shadowBlur = size * 0.35; g.fillStyle = col; g.fillText(s, x, y); g.restore(); };
const slab = (g, x, y, w, h, acc) => { g.save(); g.shadowColor = acc; g.shadowBlur = 36; const gr = g.createLinearGradient(x, y, x + w, y + h); gr.addColorStop(0, 'rgba(14,16,50,.90)'); gr.addColorStop(1, 'rgba(60,30,70,.86)'); rr(g, x, y, w, h, 60); g.fillStyle = gr; g.fill(); g.restore(); g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,.4)'; rr(g, x, y, w, h, 60); g.stroke(); g.fillStyle = acc; rr(g, x + 34, y + 30, 90, 8, 4); g.fill(); };
const ACC = '#ffd27a';
const drawNum = (p, s, sub) => { const g = p.g; slab(g, 20, 380, 560, 300, ACC); let size = 190; g.font = `900 ${size}px Inter`; while (g.measureText(s).width > 500 && size > 50) { size -= 8; g.font = `900 ${size}px Inter`; } glow(g, s, 300, 515, size); if (sub) glow(g, sub.toUpperCase(), 300, 632, 34, ACC, 800, 'rgba(0,0,0,0)'); };
const drawQ = (p) => { glow(p.g, '?', 300, 520, 640, '#ffd27a', 900, '#ff9a3a'); };
const drawCross = (p, t, label) => { const g = p.g; slab(g, 20, 380, 560, 300, '#ff6a6a'); g.save(); g.lineCap = 'round'; g.lineWidth = 34; g.strokeStyle = '#ff6a6a'; g.shadowColor = '#ff6a6a'; g.shadowBlur = 28; const k = E.smooth(clamp(t * 2)), k2 = E.smooth(clamp(t * 2 - 1)); g.beginPath(); g.moveTo(230, 440); g.lineTo(230 + 140 * k, 440 + 110 * k); g.stroke(); g.beginPath(); g.moveTo(370, 440); g.lineTo(370 - 140 * k2, 440 + 110 * k2); g.stroke(); g.restore(); glow(g, label, 300, 625, label.length > 10 ? 40 : 54, '#ffb0b0', 900, 'rgba(0,0,0,0)'); };
const drawBars = (p, t) => { const g = p.g; slab(g, 20, 380, 560, 300, '#3ddc84'); const hs = [90, 120, 160, 210], cols = ['#9fd6a8', '#7fd6a0', '#5fd68f', '#3ddc84']; hs.forEach((h, i) => { const hh = h * E.smooth(clamp(t * 1.6 - i * 0.1)); g.fillStyle = cols[i]; g.shadowColor = cols[i]; g.shadowBlur = i === 1 ? 28 : 0; rr(g, 80 + i * 112, 650 - hh, 78, Math.max(4, hh), 20); g.fill(); }); };
const drawLoop = (p, t) => { const g = p.g; slab(g, 20, 380, 560, 300, ACC); g.save(); g.translate(300, 530); g.rotate(t * 6.283); g.lineWidth = 26; g.lineCap = 'round'; g.strokeStyle = ACC; g.shadowColor = ACC; g.shadowBlur = 24; g.beginPath(); g.arc(0, 0, 70, 0.3, 4.6); g.stroke(); g.fillStyle = ACC; g.beginPath(); g.moveTo(66, -62); g.lineTo(112, -86); g.lineTo(98, -34); g.fill(); g.restore(); glow(g, 'DE TEMPOS EM TEMPOS', 300, 640, 28, ACC, 800, 'rgba(0,0,0,0)'); };
const drawPinky = (p, t) => { const g = p.g; slab(g, 20, 380, 560, 300, ACC); g.save(); g.translate(200, 540); g.fillStyle = '#f5c9a0'; g.strokeStyle = '#8a5a3a'; g.lineWidth = 6; rr(g, -50, -20, 120, 120, 30); g.fill(); g.stroke(); const hh = 70 * E.smooth(clamp(t * 2)); rr(g, 36, -20 - hh, 30, hh + 26, 15); g.fill(); g.stroke(); g.restore(); const k = E.smooth(clamp(t * 1.6 - 0.3)); g.save(); g.strokeStyle = ACC; g.lineWidth = 8; g.beginPath(); g.moveTo(310, 460); g.lineTo(310 + 190 * k, 460); g.stroke(); g.restore(); glow(g, '1°', 430, 540, 120); glow(g, 'MINDINHO = 1 GRAU', 300, 640, 28, ACC, 800, 'rgba(0,0,0,0)'); };
const drawRing = (p, t) => { const g = p.g; slab(g, 20, 380, 560, 300, ACC); g.save(); g.lineWidth = 34; g.lineCap = 'round'; g.strokeStyle = 'rgba(255,255,255,.2)'; g.beginPath(); g.arc(300, 520, 96, 0, 7); g.stroke(); g.strokeStyle = '#ff7a3a'; g.shadowColor = '#ff7a3a'; g.shadowBlur = 26; g.beginPath(); g.arc(300, 520, 96, -Math.PI / 2, -Math.PI / 2 + t * 0.9 * 6.283); g.stroke(); g.restore(); glow(g, Math.round(t * 90) + '%', 300, 520, 84); glow(g, 'CHANCE: MUITO FORTE', 300, 650, 26, ACC, 800, 'rgba(0,0,0,0)'); };
const drawCta = (p, k) => { const g = p.g; g.save(); g.shadowColor = '#ffd27a'; g.shadowBlur = 44; rr(g, 25, 360, 550, 300, 70); g.fillStyle = '#ffd23f'; g.fill(); g.restore(); g.fillStyle = NAVY; g.font = '900 70px Inter'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('COMENTE', 300, 440, 480); g.font = '900 120px Inter'; g.fillText('VIRAL', 300, 545, 500); g.font = '800 38px Inter'; g.fillText(k ? 'E SIGA O PERFIL' : 'PRA RECEBER A SKILL', 300, 620, 480); };
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 5, full: true, ...extra });
export const fxAt = (f, T_) => {
  const S = shotAt(f), out = []; if (S.id === 'capa') return out; const C = camAt(f);
  const fwd = (() => { const v = [C.look[0] - C.pos[0], C.look[1] - C.pos[1], C.look[2] - C.pos[2]]; const n = Math.hypot(...v) || 1; return v.map((x) => x / n); })();
  const place = (dist0, yfrac, s0) => { const fd = dist3(C.pos, C.look), dist = Math.max(3, Math.min(dist0, fd * 0.5)); const vh = 2 * dist * Math.tan(C.fov * D2R / 2), h = vh * s0;
    const wu = Math.abs(fwd[1]) > 0.97 ? [0, 0, -1] : [0, 1, 0]; const rt = [fwd[1] * wu[2] - fwd[2] * wu[1], fwd[2] * wu[0] - fwd[0] * wu[2], fwd[0] * wu[1] - fwd[1] * wu[0]]; const rn = Math.hypot(...rt) || 1; rt[0] /= rn; rt[1] /= rn; rt[2] /= rn;
    const up = [rt[1] * fwd[2] - rt[2] * fwd[1], rt[2] * fwd[0] - rt[0] * fwd[2], rt[0] * fwd[1] - rt[1] * fwd[0]];
    const c0 = [C.pos[0] + fwd[0] * dist + up[0] * yfrac * vh, C.pos[1] + fwd[1] * dist + up[1] * yfrac * vh, C.pos[2] + fwd[2] * dist + up[2] * yfrac * vh];
    return { pos: [c0[0] - up[0] * h * 0.47, c0[1] - up[1] * h * 0.47, c0[2] - up[2] * h * 0.47], s: h / 2.25 }; };
  const pp = (a) => (f < a ? 0 : Math.min(1, (f - a) / 5) * (1 + 0.2 * Math.exp(-(f - a) / 5)));
  const card = (key, draw, a, size = 0.62) => { if (f < a) return; const pl = place(60, 0.2, size * Math.max(0.01, pp(a))); out.push(FX(key, draw, pl.pos, pl.s)); };
  if (S.card) card('c' + S.card.text, (p) => drawNum(p, S.card.text, S.card.sub), S.card.a);
  if (S.num) { const n = S.num, v = Math.round(lerp(n.v0, n.v1, E.smooth(ramp(f, n.a, n.b)))); card('n' + v, (p) => drawNum(p, fmt(v), n.sub), n.a); }
  if (S.q) card('q', (p) => drawQ(p), S.q.a, 0.75);
  if (S.cross) { const a = S.cross.a, t = ramp(f, a, a + 26); card('x' + Math.round(t * 8) + S.cross.label, (p) => drawCross(p, t, S.cross.label), a); }
  if (S.bars) { const t = ramp(f, S.bars.a, S.bars.a + 40); card('b' + Math.round(t * 20), (p) => drawBars(p, t), S.bars.a); }
  if (S.loop) card('lp' + (f >> 2), (p) => drawLoop(p, (f % 60) / 60), S.loop.a);
  if (S.pinky) { const t = ramp(f, S.pinky.a, S.pinky.a + 40); card('pk' + Math.round(t * 20), (p) => drawPinky(p, t), S.pinky.a); }
  if (S.ring) { const t = ramp(f, S.ring.a, S.ring.b); card('rg' + Math.round(t * 30), (p) => drawRing(p, t), S.ring.a); }
  if (S.cta && f >= S.cta.a) { const fl = !!S.cta.follow; const pl = place(60, 0.18, 0.8 * Math.max(0.01, pp(S.cta.a))); out.push(FX('cta' + fl, (p) => drawCta(p, fl), pl.pos, pl.s)); }
  return out;
};
