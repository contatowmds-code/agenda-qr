// V4 El Niño - QV. 78,9 s, 30 fps, 2366 quadros.
import { M as E, idle, blinkAt, q, clamp, lerp, ramp } from './motion.js';
export const FPS = 30, TOTAL = 2366, DECK = 0, COVER = 9999;
const D2R = Math.PI / 180, R2D = 180 / Math.PI;
export const LIGHTS = {
  sunset: { az: 250, el: 12, sky: '#ffcf9a', ground: '#8a7a6a', hemi: 1.0, sun: '#ffa45a', sunI: 2.5, fog: '#f4b88a', fogNear: 200, fogFar: 3500, skyTop: '#b8503a', skyHor: '#ffcf8a', sat: 1.2, vig: 0.08, shadowExt: 60, sunDisc: '#fff1c8', sunSize: 0.002 },
  day: { az: 60, el: 55, sky: '#cfe3f0', ground: '#7d9a86', hemi: 1.15, sun: '#fff4dc', sunI: 2.1, fog: '#d8e8f2', fogNear: 300, fogFar: 4000, skyTop: '#4f95d6', skyHor: '#e6f1f6', sat: 1.12, vig: 0.08, shadowExt: 90 },
  space: { az: 60, el: 30, sky: '#7f9bd8', ground: '#101830', hemi: 0.9, sun: '#fff6e0', sunI: 2.4, fog: '#000000', fogNear: 9000, fogFar: 20000, skyTop: '#000004', skyHor: '#000008', sat: 1.1, vig: 0.08, shadowExt: 60 },
  cut: { az: 40, el: 40, sky: '#9ac4ee', ground: '#3a5a7a', hemi: 1.3, sun: '#fff6e0', sunI: 1.4, fog: '#9ac4ee', fogNear: 400, fogFar: 2000, skyTop: '#6aa8e8', skyHor: '#c8e2f8', sat: 1.15, vig: 0.08, shadowExt: 80 },
  gray: { az: 70, el: 35, sky: '#9aa6b4', ground: '#4d5a60', hemi: 1.0, sun: '#d7dde2', sunI: 1.3, fog: '#8f9aa6', fogNear: 150, fogFar: 1200, skyTop: '#566070', skyHor: '#b4bec8', sat: 0.9, vig: 0.08, shadowExt: 60 },
  dawn: { az: 280, el: 7, sky: '#ffcfb8', ground: '#8a8a90', hemi: 1.05, sun: '#ff9d7a', sunI: 2.2, fog: '#f3c3b2', fogNear: 300, fogFar: 3500, skyTop: '#5d6fb4', skyHor: '#ffb894', sat: 1.15, vig: 0.08, shadowExt: 60, sunDisc: '#ffe2c0', sunSize: 0.0016 },
  dusk: { az: 200, el: 8, sky: '#b4a6d6', ground: '#6a5f78', hemi: 0.95, sun: '#ff8f6a', sunI: 2.2, fog: '#c7a3b8', fogNear: 200, fogFar: 3000, skyTop: '#33407e', skyHor: '#f0a08a', sat: 1.12, vig: 0.08, shadowExt: 60 },
  room: { az: 30, el: 60, sky: '#d8d4c8', ground: '#7a7060', hemi: 1.45, sun: '#fff0d0', sunI: 0.9, fog: '#cfd6dc', fogNear: 200, fogFar: 1500, skyTop: '#8fb4e0', skyHor: '#dfe8f0', sat: 1.05, vig: 0.08, shadowExt: 60 },
};
const OFF = { A: [0, 0, 0], B: [6000, 0, 0], C: [-6000, 0, 0], D: [0, 0, 6000], E: [0, 0, -6000], F: [12000, 0, 0], G: [0, 0, -12000], H: [0, 0, 12000] };
// ---- helpers de câmera: câmera sai do observador (origem do palco) e VAI em direção ao foco P ----
const SKYD = { mer: [88, 7], ven: [100, 17], mar: [116.5, 29], jup: [120.3, 29.6] };
const dirOf = (az, alt) => [Math.sin(az * D2R) * Math.cos(alt * D2R), Math.sin(alt * D2R), -Math.cos(az * D2R) * Math.cos(alt * D2R)];
const sky = (k) => dirOf(...SKYD[k]).map((v) => v * 700);
const toward = (P, d, lat = 0, up = 0, fov = 46, f = 0) => { const n = Math.hypot(...P), u = P.map((v) => v / n); const vx = -u[0] * d, vy = -u[1] * d, vz = -u[2] * d; const az = Math.atan2(vx, vz) * R2D + lat, el = Math.asin(vy / d) * R2D + up; return { f, F: P, d, az, el, fov }; };
const K = (f, F, d, az, el, fov = 46) => ({ f, F, d, az, el, fov });
const T = (f, P, d, lat, up, fov) => toward(P, d, lat, up, fov, f);
const DEF = [
  { id: 'pac', a: 0, map: 'pac' },
  { id: 'elnino', a: 206, st: 'A', light: 'sunset', cam: { keys: [K(206, [12, 8, -30], 70, 25, 8, 50), K(235, [12, 9, -30], 32, 18, 6, 44), K(269, [12, 10, -30], 22, 10, 6, 42)] }, S: (f) => ({ heat: E.smooth(ramp(f, 208, 269)) * 0.8, wind: 1 }), card: { a: 246, text: 'EL NIÑO', sub: 'água quente' } },
  { id: 'noaa', a: 270, st: 'B', light: 'space', cam: { keys: [K(270, [0, 4, 0], 26, 30, 10, 50), K(308, [0, 3, 0], 40, -20, 8, 52), K(334, [0, -20, 0], 140, -35, 12, 52), K(385, [0, -40, 0], 180, -20, 16, 52), K(401, [0, 0, 0], 60, 20, 10, 48)] }, ring: { a: 334, b: 372 } },
  { id: 'corte_a', a: 402, st: 'C', light: 'cut', cam: { keys: [K(402, [0, 14, 20], 240, 0, 6, 48), K(438, [40, 12, 20], 120, 8, 6, 46), K(494, [20, 18, 20], 70, 0, 12, 46), K(555, [60, 14, 20], 140, -6, 8, 48)] }, S: (f) => ({ warm: E.smooth(ramp(f, 420, 555)) * 0.7, wind: 1, eq: f >= 490 }) },
  { id: 'corte_b', a: 556, st: 'C', light: 'cut', cam: { keys: [K(556, [-40, 36, 20], 130, 10, 6, 48), K(581, [-50, 36, 20], 60, 14, 6, 44), K(638, [-20, 30, 20], 120, 0, 8, 48), K(664, [0, 20, 20], 230, 0, 6, 48)] }, S: (f) => ({ warm: 0.7 + 0.3 * ramp(f, 556, 664), wind: 1 - E.smooth(ramp(f, 600, 650)), eq: true }) },
  { id: 'chuva', a: 665, st: 'D', light: 'gray', cam: { keys: [K(665, [-170, 40, 0], 160, 20, 10, 50), K(705, [-130, 40, 0], 90, 40, 8, 48), K(731, [-60, 40, 0], 150, 10, 10, 48), K(786, [100, 30, 0], 180, -20, 12, 50), K(806, [170, 20, 0], 130, -25, 10, 48)] }, S: (f) => ({ cl: E.smooth(ramp(f, 705, 800)) }) },
  { id: 'br', a: 813, map: 'br' },
  { id: 'eua', a: 980, st: 'E', light: 'dusk', cam: { keys: [K(980, [0, 6, 0], 80, 20, 8, 52), K(1022, [-5, 4, 22], 26, 14, 6, 46), K(1062, [-5, 4, 22], 16, 8, 6, 42), K(1090, [0, 6, 0], 70, -10, 10, 50), K(1116, [0, 8, 0], 90, -20, 14, 52)] }, S: (f) => ({ snow: 1 - E.smooth(ramp(f, 1082, 1110)) * 0.85, temp: E.smooth(ramp(f, 1050, 1085)) * 0.7 }) },
  { id: 'torres_a', a: 1117, st: 'F', light: 'sunset', cam: { keys: [K(1117, [0, 12, 0], 150, 20, 8, 50), K(1155, [-26, 14, 0], 80, 10, 8, 46), K(1200, [-26, 30, 0], 60, 10, 6, 44), K(1224, [0, 22, 0], 120, 0, 10, 48), K(1265, [26, 24, 0], 90, -12, 8, 46)] }, S: (f) => ({ tw: [E.smooth(ramp(f, 1160, 1205)) * 0.6, E.smooth(ramp(f, 1230, 1262)) * 0.65, 0] }) },
  { id: 'torres_b', a: 1266, st: 'F', light: 'sunset', cam: { keys: [K(1266, [10, 26, 0], 120, 0, 8, 50), K(1310, [26, 30, 0], 80, -12, 8, 46), K(1348, [26, 55, 0], 75, -10, 6, 42), K(1392, [0, 40, 0], 190, 0, 10, 50)] }, S: (f) => ({ tw: [0.6, 0.65, E.smooth(ramp(f, 1312, 1365)) * 1.0] }) },
  { id: 'dados', a: 1393, st: 'G', light: 'room', cam: { keys: [K(1393, [0, 4, 0], 60, 20, 24, 50), K(1436, [0, 3, 0], 34, 10, 22, 44), K(1470, [0, 3, 0], 40, -10, 26, 46)] }, S: (f) => ({ dice: ramp(f, 1393, 1470) }) },
  { id: 'prev', a: 1478, st: 'G', light: 'room', cam: { keys: [K(1478, [0, 3, 0], 36, 0, 30, 48), K(1527, [0, 3, 0], 70, 20, 20, 52), K(1541, [0, 12, 0], 130, 0, 10, 52)] }, S: () => ({ dice: 1 }), cross: { a: 1500, label: 'NÃO É PREVISÃO' } },
  { id: 'dois', a: 1542, st: 'G', light: 'room', cam: { keys: [K(1542, [0, 8, 0], 150, 0, 8, 52), K(1553, [-70, 6, 0], 70, 10, 8, 46), K(1600, [70, 6, 0], 70, -10, 8, 46), K(1622, [0, 8, 0], 160, 0, 6, 52), K(1651, [0, 8, 0], 120, 0, 12, 50)] }, S: () => ({ dice: 1 }) },
  { id: 'quanto', a: 1652, st: 'H', light: 'day', cam: { keys: [K(1652, [60, 8, -10], 120, 20, 10, 50), K(1683, [60, 10, -10], 70, 10, 8, 46), K(1712, [20, 14, -26], 70, 10, 8, 46)] }, S: () => ({ wheat: 1 }), q: { a: 1660, b: 1712 } },
  { id: 'safra', a: 1713, st: 'H', light: 'sunset', cam: { keys: [K(1713, [-20, 3, -12], 40, 40, 10, 50), K(1740, [-20, 3, -12], 25, 20, 8, 44), K(1765, [28, 14, -26], 60, 30, 8, 46)] }, S: (f) => ({ wheat: 1 }), bars: { a: 1745 } },
  { id: 'cidades', a: 1766, st: 'H', light: 'gray', cam: { keys: [K(1766, [120, 14, -30], 150, -20, 12, 52), K(1788, [120, 12, -30], 90, -10, 10, 48), K(1815, [120, 4, 24], 40, 10, 8, 44), K(1837, [-20, 3, -12], 60, 30, 10, 46), K(1854, [0, 3, -12], 90, 30, 10, 48)] }, S: (f) => ({ rain: f >= 1805 && f < 1826 ? 1 : (f < 1805 ? 1 : 0), dry: f >= 1826 ? 1 : 0, wheat: f >= 1826 ? 0.3 : 1 }) },
  { id: 'fecho', a: 1855, st: 'A', light: 'dawn', cam: { keys: [K(1855, [12, 8, -30], 40, 20, 8, 46), K(1932, [12, 10, -30], 90, 40, 20, 50), K(1985, [12, 6, -30], 60, 30, 10, 48), K(2011, [0, 6, -60], 130, 10, 14, 52), K(2063, [0, 0, -60], 420, 0, 30, 54)] }, S: (f) => ({ heat: 0.2 + 0.7 * E.smooth(ramp(f, 1960, 2040)), wind: 0.6 }) },
  { id: 'cta_a', a: 2064, st: 'A', light: 'dusk', cam: { keys: [K(2064, [0, 3.6, 40], 18, 0, 6, 50), K(2118, [0, 4, 40], 14, 10, 8, 50)] }, S: () => ({ heat: 0.9, wind: 0.5 }), act: 'cta' },
  { id: 'cta_b', a: 2119, st: 'A', light: 'dusk', cam: { keys: [K(2119, [0, 4, 40], 14, 10, 8, 50), K(2260, [0, 4, 40], 20, -14, 12, 52), K(2366, [0, 30, 20], 140, 20, 30, 54)] }, S: () => ({ heat: 0.9, wind: 0.5 }), act: 'cta' },
];
export const SHOTS = DEF.map((s, i) => ({ ...s, b: (DEF[i + 1] ? DEF[i + 1].a - 1 : TOTAL - 1), g: i }));
export const shotAt = (f) => f === COVER ? { id: 'capa', a: COVER, b: COVER, st: 'A', light: 'sunset' } : (SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1]);
export const lightFor = (S, f) => ({ ...LIGHTS[S.light || 'dawn'] });
const l3 = (a, b, t) => a.map((v, i) => lerp(v, b[i], t));
export const camAt = (f) => {
  const S = shotAt(f);
  if (S.id === 'capa') return { pos: [4, 11, -8], look: [12, 10, -30], fov: 56, roll: 0, flash: 0 };
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
export const worldAt = (f) => { const S = shotAt(f); const o = { stage: S.st || 'A' }; if (S.S) Object.assign(o, S.S(f)); return o; };
const R = (T_, who, o, pos, extra = {}) => ({ key: who + JSON.stringify(o), draw: (p) => T_.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const life = (f, seed) => { const i = idle(f, seed); return { bob: q(i.bob, 3), tilt: q(i.tilt, 1), headTilt: q(i.headTilt, 1), blink: blinkAt(f, seed) }; };
export const actorsAt = (f, T_) => {
  const S = shotAt(f), out = []; const A = (who, o, pos, seed, sc = 1) => out.push(R(T_, who, { seed, ...life(f, seed), ...o }, pos, { s: sc }));
  if (S.act === 'cta') [['workA', -3.2], ['civB', -1.1], ['civD', 1.1], ['velha', 3.2]].forEach(([w, x], k) => A(w, { expr: 'laugh', facing: 0, L: k % 2 ? 'wave' : 'belly', wv: q((f * 0.35 + k) % 6.283, 1), R: 'up', bob: q(Math.abs(Math.sin(f * 0.3 + k)) * 0.04, 3) }, [x * 0.9, 3.3, 24], 36 + k, 1.3));
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
