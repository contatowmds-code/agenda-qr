// V3 "Quatro planetas antes do sol" (desfile de planetas) - QV. 74,6 s, 30 fps, 2239 quadros.
import { M as E, idle, blinkAt, q, clamp, lerp, ramp } from './motion.js';
export const FPS = 30, TOTAL = 2239, DECK = 0, COVER = 9999;
const D2R = Math.PI / 180, R2D = 180 / Math.PI;
const OFF = { A: [0, 0, 0], B: [6000, 0, 0], C: [-6000, 0, 0], D: [0, 0, 6000], E: [0, 0, -6000], F: [12000, 0, 0], G: [0, 0, -12000] };
export const LIGHTS = {
  dawn: { az: 280, el: 6, sky: '#7a6aa8', ground: '#2a3a3a', hemi: 0.95, sun: '#ff9a6a', sunI: 1.0, fog: '#3a3558', fogNear: 400, fogFar: 3000, skyTop: '#070a22', skyHor: '#ff9a62', sat: 1.18, vig: 0.08, shadowExt: 40 },
  space: { az: 60, el: 30, sky: '#7f9bd8', ground: '#101830', hemi: 0.9, sun: '#fff6e0', sunI: 2.4, fog: '#000000', fogNear: 9000, fogFar: 20000, skyTop: '#000004', skyHor: '#000008', sat: 1.1, vig: 0.08, shadowExt: 60 },
  night: { az: 120, el: 40, sky: '#4a5f9a', ground: '#2a3556', hemi: 0.9, sun: '#9db4f0', sunI: 1.0, fog: '#0a1128', fogNear: 300, fogFar: 2500, skyTop: '#02040f', skyHor: '#1a2a5a', sat: 1.05, vig: 0.08, shadowExt: 40, lift: '#010206' },
  city: { az: 200, el: 12, sky: '#9a88b8', ground: '#40404e', hemi: 1.0, sun: '#ffb08a', sunI: 1.6, fog: '#8a7a9a', fogNear: 120, fogFar: 700, skyTop: '#243060', skyHor: '#ffb08a', sat: 1.1, vig: 0.08, shadowExt: 80 },
  room: { az: 30, el: 60, sky: '#c8b8a0', ground: '#7a6040', hemi: 1.5, sun: '#ffe2b0', sunI: 0.9, fog: '#2a2640', fogNear: 30, fogFar: 160, skyTop: '#1a1840', skyHor: '#1a1840', sat: 1.08, vig: 0.08, shadowExt: 14 },
  dawn2: { az: 290, el: 4, sky: '#9a7aa0', ground: '#2a3a3a', hemi: 1.0, sun: '#ff8a5a', sunI: 1.2, fog: '#4a3a5a', fogNear: 400, fogFar: 3200, skyTop: '#0a0f30', skyHor: '#ff7a4a', sat: 1.2, vig: 0.08, shadowExt: 40 },
};
// ---- helpers de câmera: câmera sai do observador (origem do palco) e VAI em direção ao foco P ----
const SKYD = { mer: [88, 7], ven: [100, 17], mar: [116.5, 29], jup: [120.3, 29.6] };
const dirOf = (az, alt) => [Math.sin(az * D2R) * Math.cos(alt * D2R), Math.sin(alt * D2R), -Math.cos(az * D2R) * Math.cos(alt * D2R)];
const sky = (k) => dirOf(...SKYD[k]).map((v) => v * 700);
const toward = (P, d, lat = 0, up = 0, fov = 46, f = 0) => { const n = Math.hypot(...P), u = P.map((v) => v / n); const vx = -u[0] * d, vy = -u[1] * d, vz = -u[2] * d; const az = Math.atan2(vx, vz) * R2D + lat, el = Math.asin(vy / d) * R2D + up; return { f, F: P, d, az, el, fov }; };
const K = (f, F, d, az, el, fov = 46) => ({ f, F, d, az, el, fov });
const T = (f, P, d, lat, up, fov) => toward(P, d, lat, up, fov, f);
const DEF = [
  { id: 'nascer', a: 0, st: 'A', light: 'dawn', cam: { keys: [T(0, [690, 40, -90], 640, 0, -2, 54), T(30, [660, 120, -40], 560, 6, 0, 50), T(48, sky('ven'), 520, -8, 0, 46), T(71, sky('mar'), 440, 14, 0, 46), T(113, sky('mer'), 520, 0, 6, 50)] }, num: { a: 39, b: 66, v0: 0, v1: 4, sub: 'planetas' } },
  { id: 'olho_nu', a: 114, st: 'A', light: 'dawn', cam: { keys: [K(114, [8, 2.4, 0], 7, -90, 8, 52), K(155, [8, 4, 0], 8, -80, 12, 54), K(196, [8, 3.6, 0], 10, -85, 12, 54)] }, act: 'obs', card: { a: 150, text: '3', sub: 'a olho nu' }, cross: { a: 176, label: 'SEM TELESCÓPIO' } },
  { id: 'nomes', a: 197, st: 'A', light: 'dawn', cam: { keys: [T(197, sky('mer'), 300, 0, 4, 46), T(206, sky('mer'), 120, 0, 2, 40), T(223, sky('ven'), 120, 0, 2, 40), T(231, sky('mar'), 110, 0, 0, 38), T(247, sky('jup'), 100, 8, 0, 38), T(267, sky('ven'), 520, 0, 6, 50)] } },
  { id: 'desfile', a: 268, st: 'B', light: 'space', cam: { keys: [K(268, [0, 0, 0], 460, 20, 58, 46), K(305, [0, 0, 0], 330, 15, 76, 46), K(330, [130, 0, 0], 220, 0, 52, 46), K(360, [60, 0, 0], 300, 10, 40, 48), K(417, [0, 0, 0], 380, 30, 50, 48)] }, S: (f) => ({ orr: { t: f * 0.012, align: E.smooth(ramp(f, 270, 318)) * (1 - E.smooth(ramp(f, 395, 417))) } }), cross: { a: 372, label: 'NÃO OFICIAL' } },
  { id: 'venus', a: 421, st: 'A', light: 'dawn2', cam: { keys: [T(421, sky('ven'), 360, 0, 0, 46), T(450, sky('ven'), 160, 6, 0, 40), T(480, sky('ven'), 110, -10, 2, 38), T(513, sky('ven'), 70, 0, 0, 36), T(562, sky('ven'), 120, 12, 4, 40)] }, bars: { a: 513 } },
  { id: 'marte_jupiter', a: 563, st: 'A', light: 'dawn2', cam: { keys: [T(563, sky('mar'), 240, 0, 2, 44), T(570, sky('mar'), 90, 0, 0, 36), T(575, sky('jup'), 90, 4, 0, 36), T(606, sky('mar'), 200, 0, 6, 44), T(625, sky('mar'), 420, 0, 6, 48)] } },
  { id: 'um_grau', a: 626, st: 'C', light: 'space', cam: { keys: [K(626, [0, 0, 0], 230, 0, 3, 46), K(685, [-80, 0, 0], 80, 10, 2, 40), K(700, [88, 3, 0], 90, -12, 2, 40), K(756, [0, 0, 0], 170, 0, 4, 46), K(813, [0, 0, 0], 110, 0, 2, 42), K(835, [0, 0, 0], 100, 0, 2, 42)] }, S: (f) => ({ sep: lerp(190, 24, E.smooth(ramp(f, 640, 815))), arcOn: f >= 788 }), card: { a: 813, text: '1°', sub: 'de distância' } },
  { id: 'mindinho', a: 836, st: 'A', light: 'dawn2', cam: { keys: [K(836, [8, 2.4, 0], 9, -80, 8, 52), K(893, [8, 2.8, 0], 5.5, -86, 8, 44), K(940, [8, 2.8, 0], 6.5, -80, 8, 46)] }, act: 'obs2', pinky: { a: 890 } },
  { id: 'cidade', a: 947, st: 'D', light: 'city', cam: { keys: [K(947, [0, 30, -80], 70, 6, 8, 54), K(989, [0, 6, -140], 50, 4, 2, 50), K(1054, [0, 4, -200], 60, 0, 2, 50)] } },
  { id: 'aberto', a: 1055, st: 'A', light: 'dawn', cam: { keys: [T(1055, sky('mer'), 420, 0, 0, 52), T(1066, sky('mer'), 200, 6, 0, 44), T(1093, [700, 40, 120], 520, 0, 0, 56), T(1126, sky('mer'), 160, 0, 8, 44), T(1144, sky('ven'), 480, 0, 8, 50)] } },
  { id: 'plano_a', a: 1145, st: 'B', light: 'space', cam: { keys: [K(1145, [0, 0, 0], 380, 0, 82, 46), K(1192, [0, 0, 0], 330, 30, 64, 46), K(1238, [0, 0, 0], 340, 60, 34, 46)] }, S: (f) => ({ orr: { t: 10 + f * 0.01, align: 0 } }) },
  { id: 'plano_b', a: 1239, st: 'B', light: 'space', cam: { keys: [K(1239, [0, 0, 0], 340, 60, 34, 46), K(1329, [0, 0, 0], 360, 110, 14, 48), K(1366, [100, 0, 0], 320, 160, 2, 50), K(1402, [0, 0, 0], 420, 210, 4, 50)] }, S: (f) => ({ orr: { t: 10 + f * 0.01, align: 0, disc: E.smooth(ramp(f, 1340, 1380)) } }) },
  { id: 'meteoros', a: 1403, st: 'E', light: 'night', cam: { keys: [T(1403, [0, 300, -200], 300, 0, 0, 56), T(1463, [200, 250, 100], 260, 20, 0, 52), T(1500, [-120, 260, 160], 240, -20, 0, 50), T(1536, [0, 320, 0], 200, 0, 8, 56), T(1578, [60, 300, -100], 260, 0, 0, 56)] }, S: () => ({ meteor: 1 }), card: { a: 1536, text: '17–18', sub: 'pico da chuva' } },
  { id: 'quarto', a: 1582, st: 'F', light: 'room', cam: { keys: [K(1582, [0, 1.4, -2], 8, 25, 10, 50), K(1603, [1.6, 1.4, -3], 2.6, 12, 6, 42), K(1645, [1.6, 1.5, -3], 3.4, 8, 6, 44)] }, S: (f) => ({ alarm: f >= 1590 ? 1 : 0 }), q: { a: 1595 } },
  { id: 'janela', a: 1649, st: 'F', light: 'room', cam: { keys: [K(1649, [1.6, 1.6, -3], 5, 20, 8, 46), K(1662, [2.2, 2.4, -3.8], 3, 5, 2, 40), K(1713, [2.2, 2.5, -3.8], 0.9, 0, 0, 36)] }, S: () => ({ alarm: 0 }) },
  { id: 'repete', a: 1714, st: 'A', light: 'dawn2', cam: { keys: [T(1714, [700, 120, -90], 640, 0, 0, 56), T(1750, sky('ven'), 480, 14, 4, 50), T(1792, [-300, 250, -300], 400, 0, 0, 56)] }, loop: { a: 1730 } },
  { id: 'varanda', a: 1793, st: 'G', light: 'night', cam: { keys: [K(1793, [0, 1.6, 1], 7, 20, 6, 50), K(1856, [0, 2.2, 1], 6, 10, 10, 48), K(1884, [0, 3, 0], 9, 0, 30, 52), K(1936, [-40, 80, -260], 60, 0, 6, 54)] }, act: 'bal' },
  { id: 'cta_a', a: 1937, st: 'E', light: 'night', cam: { keys: [K(1937, [0, 1.8, 4], 9, 0, 6, 50), K(1990, [0, 2, 4], 11, 12, 8, 50)] }, S: () => ({ meteor: 1 }), act: 'cta' },
  { id: 'cta_b', a: 1992, st: 'E', light: 'night', cam: { keys: [K(1992, [0, 2, 4], 11, 12, 8, 50), K(2130, [0, 2.4, 4], 15, -14, 10, 52), K(2138, [0, 60, 0], 160, 0, 40, 56)] }, S: () => ({ meteor: 1 }), act: 'cta' },
  { id: 'cta_c', a: 2139, st: 'E', light: 'night', cam: { keys: [K(2139, [0, 60, 0], 160, 0, 40, 56), K(2239, [0, 120, 0], 380, 40, 30, 52)] }, S: () => ({ meteor: 1 }) },
];
export const SHOTS = DEF.map((s, i) => ({ ...s, b: (DEF[i + 1] ? DEF[i + 1].a - 1 : TOTAL - 1), g: i }));
export const shotAt = (f) => f === COVER ? { id: 'capa', a: COVER, b: COVER, st: 'A', light: 'dawn2' } : (SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1]);
export const lightFor = (S, f) => ({ ...LIGHTS[S.light || 'dawn'] });
const l3 = (a, b, t) => a.map((v, i) => lerp(v, b[i], t));
export const camAt = (f) => {
  const S = shotAt(f);
  if (S.id === 'capa') { const k = toward(sky('ven'), 330, 0, 4, 56); const a = k.az * D2R, e = k.el * D2R, P = sky('ven'); return { pos: [P[0] + k.d * Math.cos(e) * Math.sin(a), P[1] + k.d * Math.sin(e), P[2] + k.d * Math.cos(e) * Math.cos(a)], look: P, fov: 56, roll: 0, flash: 0 }; }
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
export const worldAt = (f) => { const S = shotAt(f); const o = { stage: S.st || 'A' }; if (S.S) Object.assign(o, S.S(f)); return o; };
const R = (T_, who, o, pos, extra = {}) => ({ key: who + JSON.stringify(o), draw: (p) => T_.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const life = (f, seed) => { const i = idle(f, seed); return { bob: q(i.bob, 3), tilt: q(i.tilt, 1), headTilt: q(i.headTilt, 1), blink: blinkAt(f, seed) }; };
export const actorsAt = (f, T_) => {
  const S = shotAt(f), out = []; const A = (who, o, pos, seed, s = 1) => out.push(R(T_, who, { seed, ...life(f, seed), ...o }, pos, { s }));
  if (S.id === 'capa') { A('workA', { expr: 'shock', facing: 0, L: 'up', R: 'up', blink: 0, bob: 0, tilt: 0, headTilt: 0 }, [P0(0), P0(1), P0(2)], 31, 1); return out; }
  if (S.act === 'obs') A('workA', { expr: 'smile', facing: 0, L: 'point', R: 'hip' }, [8, 0, 0], 31);
  if (S.act === 'obs2') A('workA', { expr: 'squint', facing: 0, L: 'point', R: 'hip' }, [8, 0, 0], 31);
  if (S.act === 'bal') A('civB', { expr: 'smile', facing: 0, L: 'hang', R: 'point' }, [0, 0, 0.5], 35);
  if (S.act === 'cta') [['workA', -4.5], ['civB', -1.5], ['civD', 1.5], ['velha', 4.5]].forEach(([w, x], k) => A(w, { expr: 'laugh', facing: 0, L: k % 2 ? 'wave' : 'belly', wv: q((f * 0.35 + k) % 6.283, 1), R: 'up', bob: q(Math.abs(Math.sin(f * 0.3 + k)) * 0.04, 3) }, [x, 0.1, 4], 36 + k, 1.6));
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
const drawBars = (p, t) => { const g = p.g; slab(g, 20, 380, 560, 300, ACC); const hs = [70, 200, 90, 130], cols = ['#bdb7ae', '#fff4c8', '#ff8a5a', '#e8c9a0']; hs.forEach((h, i) => { const hh = h * E.smooth(clamp(t * 1.6 - i * 0.1)); g.fillStyle = cols[i]; g.shadowColor = cols[i]; g.shadowBlur = i === 1 ? 28 : 0; rr(g, 80 + i * 112, 650 - hh, 78, Math.max(4, hh), 20); g.fill(); }); };
const drawLoop = (p, t) => { const g = p.g; slab(g, 20, 380, 560, 300, ACC); g.save(); g.translate(300, 530); g.rotate(t * 6.283); g.lineWidth = 26; g.lineCap = 'round'; g.strokeStyle = ACC; g.shadowColor = ACC; g.shadowBlur = 24; g.beginPath(); g.arc(0, 0, 70, 0.3, 4.6); g.stroke(); g.fillStyle = ACC; g.beginPath(); g.moveTo(66, -62); g.lineTo(112, -86); g.lineTo(98, -34); g.fill(); g.restore(); glow(g, 'DE TEMPOS EM TEMPOS', 300, 640, 28, ACC, 800, 'rgba(0,0,0,0)'); };
const drawPinky = (p, t) => { const g = p.g; slab(g, 20, 380, 560, 300, ACC); g.save(); g.translate(200, 540); g.fillStyle = '#f5c9a0'; g.strokeStyle = '#8a5a3a'; g.lineWidth = 6; rr(g, -50, -20, 120, 120, 30); g.fill(); g.stroke(); const hh = 70 * E.smooth(clamp(t * 2)); rr(g, 36, -20 - hh, 30, hh + 26, 15); g.fill(); g.stroke(); g.restore(); const k = E.smooth(clamp(t * 1.6 - 0.3)); g.save(); g.strokeStyle = ACC; g.lineWidth = 8; g.beginPath(); g.moveTo(310, 460); g.lineTo(310 + 190 * k, 460); g.stroke(); g.restore(); glow(g, '1°', 430, 540, 120); glow(g, 'MINDINHO = 1 GRAU', 300, 640, 28, ACC, 800, 'rgba(0,0,0,0)'); };
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
  if (S.cta && f >= S.cta.a) { const fl = !!S.cta.follow; const pl = place(60, 0.18, 0.8 * Math.max(0.01, pp(S.cta.a))); out.push(FX('cta' + fl, (p) => drawCta(p, fl), pl.pos, pl.s)); }
  return out;
};
