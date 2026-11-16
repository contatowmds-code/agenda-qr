// V2 "A nave que foi pega no ar" (Starship) - QV. 71,2 s, 30 fps, 2136 quadros.
import { M as E, idle, blinkAt, q, clamp, lerp, ramp } from './motion.js';
export const FPS = 30, TOTAL = 2136, DECK = 0, COVER = 9999;
const D2R = Math.PI / 180;
const OFF = { A: [0, 0, 0], B: [6000, 0, 0], C: [-6000, 0, 0], D: [0, 0, 6000], E: [0, 0, -6000], F: [12000, 0, 0] };
export const LIGHTS = {
  gold: { az: 250, el: 14, sky: '#ffd8a8', ground: '#b09060', hemi: 1.0, sun: '#ffb764', sunI: 2.6, fog: '#f1c28d', fogNear: 120, fogFar: 2200, skyTop: '#c9604a', skyHor: '#ffd89a', sat: 1.15, vig: 0.08, shadowExt: 90, sunDisc: '#fff1c8', sunSize: 0.0018 },
  dusk: { az: 200, el: 9, sky: '#b4a6d6', ground: '#6a5f78', hemi: 0.95, sun: '#ff8f6a', sunI: 2.2, fog: '#c7a3b8', fogNear: 120, fogFar: 2200, skyTop: '#33407e', skyHor: '#f0a08a', sat: 1.12, vig: 0.08, shadowExt: 90 },
  day: { az: 55, el: 52, sky: '#cfe3f0', ground: '#7d9a86', hemi: 1.15, sun: '#fff4dc', sunI: 2.1, fog: '#d8e8f2', fogNear: 200, fogFar: 2500, skyTop: '#4f95d6', skyHor: '#e6f1f6', sat: 1.12, vig: 0.08, shadowExt: 90 },
  night: { az: 120, el: 40, sky: '#4a5f9a', ground: '#2a3556', hemi: 0.95, sun: '#9db4f0', sunI: 1.2, fog: '#0d1632', fogNear: 120, fogFar: 1800, skyTop: '#04081c', skyHor: '#1f3166', sat: 1.0, vig: 0.1, shadowExt: 90 },
  space: { az: 60, el: 30, sky: '#7f9bd8', ground: '#101830', hemi: 0.85, sun: '#fff6e0', sunI: 2.6, fog: '#000000', fogNear: 5000, fogFar: 9000, skyTop: '#000004', skyHor: '#000006', sat: 1.1, vig: 0.1, shadowExt: 60 },
  reentry: { az: 30, el: 25, sky: '#ff9a5a', ground: '#4a2a2a', hemi: 0.9, sun: '#ffb070', sunI: 1.8, fog: '#3a1a1a', fogNear: 2000, fogFar: 4000, skyTop: '#120614', skyHor: '#c04a22', sat: 1.2, vig: 0.1, shadowExt: 60 },
  hangar: { az: 30, el: 60, sky: '#d9d4c8', ground: '#7a7060', hemi: 1.45, sun: '#fff0d0', sunI: 0.9, fog: '#7a7870', fogNear: 120, fogFar: 400, skyTop: '#2a2a2e', skyHor: '#2a2a2e', sat: 1.05, vig: 0.1, shadowExt: 60 },
};
// ---- beats: câmera guiada pela fala (f = quadro da palavra) ----
const K = (f, F, d, az, el, fov = 46) => ({ f, F, d, az, el, fov });
const SH_Y = 76, ARMY = 72, SHZ = 20; // altura em que a nave é pega, base da nave
const DEF = [
  { id: 'hook', a: 0, st: 'A', light: 'gold', cam: { keys: [K(0, [0, 84, 20], 58, 28, -20, 52), K(36, [0, 96, 20], 38, 24, -24, 48), K(58, [0, 118, 20], 30, 20, -10, 42), K(100, [0, 122, 20], 60, 40, 30, 50), K(118, [0, 130, 20], 80, 50, 42, 52)] },
    S: (f) => ({ ship: { p: [0, 76 + (1 - ramp(f, 0, 118)) * 14, SHZ], fl: 16 * (1 - ramp(f, 40, 118)) + 4 }, arms: 0 }), card: { a: 38, text: '+50 m', sub: 'de altura' } },
  { id: 'espaco', a: 119, st: 'B', light: 'space', cam: { keys: [K(119, [0, 0, 0], 70, 40, 18, 48), K(149, [0, 0, 0], 120, 85, 28, 50)] }, S: (f) => ({ ship: { p: [0, 0, 0], rz: 1.4, ry: 0.4, fl: 6 }, sats: -1 }) },
  { id: 'bracos', a: 150, st: 'A', light: 'gold', cam: { keys: [K(150, [0, 92, 18], 38, 70, 6, 46), K(168, [6, 92, 24], 22, 80, 4, 42), K(194, [0, 92, 22], 14, 55, 10, 40), K(203, [0, 92, 22], 12, 50, 12, 40)] },
    S: (f) => ({ ship: { p: [0, ARMY + 4 * (1 - ramp(f, 150, 190)), SHZ], fl: 3 * (1 - ramp(f, 150, 185)) }, arms: E.smooth(ramp(f, 160, 195)) }) },
  { id: 'primeira', a: 204, st: 'A', light: 'gold', cam: { keys: [K(204, [0, 70, 20], 130, 200, 42, 44), K(248, [0, 90, 20], 85, 240, 22, 46), K(277, [0, 90, 20], 60, 285, 12, 46)] }, S: (f) => ({ ship: { p: [0, ARMY, SHZ], fl: 0 }, arms: 1 }), card: { a: 244, text: '1ª vez', sub: 'nave orbital pega' } },
  { id: 'mapa', a: 278, map: 'a' },
  { id: 'decola', a: 396, st: 'A', light: 'dusk', cam: { keys: [K(396, [0, 40, 22], 95, 18, 2, 52), K(428, [0, 30, 22], 50, 28, 6, 50), K(456, [0, 130, 22], 140, 40, 18, 48), K(486, [0, 300, 22], 300, 55, 25, 46)] },
    S: (f) => { const y = 6 + 330 * E.easeIn(ramp(f, 424, 492)); return { boost: { p: [0, y, SHZ + 2], fl: f > 420 ? 70 : 0 }, ship: { p: [0, y + 71, SHZ + 2], fl: 0 }, arms: 0 }; } },
  { id: 'orbita', a: 497, st: 'B', light: 'space', cam: { keys: [K(497, [0, 0, 0], 75, 30, 12, 48), K(538, [0, 0, 0], 130, 85, 24, 50), K(585, [0, 0, -50], 100, 150, 18, 48), K(644, [0, 0, -60], 190, 205, 30, 50)] },
    S: (f) => ({ ship: { p: [0, 0, 0], rz: 1.5, ry: 0.3, fl: 0 }, sats: 1 }), num: { a: 570, b: 618, v0: 0, v1: 26, sub: 'satélites Starlink' } },
  { id: 'perdido', a: 649, st: 'D', light: 'dusk', cam: { keys: [K(649, [0, 230, 0], 240, 30, 5, 46), K(733, [0, 110, 0], 140, 55, 8, 48), K(782, [0, 14, 0], 80, 90, 6, 50), K(806, [0, 20, 0], 110, 120, 12, 50)] },
    S: (f) => { const t = ramp(f, 649, 791); return { boost: f < 791 ? { p: [0, 8 + 250 * (1 - E.smooth(t)) * (1 - E.smooth(t)), 0], rx: 0.25 * Math.sin(f * 0.05), rz: 0.6 * t, fl: 12 * (1 - t) } : null, boom: f >= 791 ? ramp(f, 791, 850) : undefined }; }, fxb: 791 },
  { id: 'volta0', a: 811, st: 'C', light: 'reentry', cam: { keys: [K(811, [0, 0, 0], 126, 25, 8, 48), K(841, [0, 0, 0], 79, 12, 6, 46), K(872, [0, 0, 0], 57, 6, 4, 44)] }, S: (f) => ({ ship: { p: [0, 0, 0], rz: 1.7, ry: 0.2, fl: 0, pl: 0.15 + 0.3 * ramp(f, 811, 872) }, stage: 'C' }) },
  { id: 'velocidade', a: 883, st: 'C', light: 'reentry', cam: { keys: [K(883, [0, 0, 0], 108, -30, 3, 46), K(924, [0, 0, 0], 86, -10, 6, 46), K(954, [0, 0, 0], 72, 8, 8, 44), K(1015, [0, 0, 0], 64, 28, 10, 44)] }, S: (f) => ({ ship: { p: [0, 0, 0], rz: 1.7, ry: 0.2, fl: 0, pl: 0.5 + 0.2 * ramp(f, 883, 1015) } }), num: { a: 950, b: 1004, v0: 0, v1: 28000, sub: 'km/h', accent: '#ffb347' } },
  { id: 'calor', a: 1016, st: 'C', light: 'reentry', cam: { keys: [K(1016, [0, 0, 0], 64, 28, 6, 44), K(1048, [-8, -2, 0], 39, 14, 4, 40), K(1064, [-10, -2, 0], 32, 6, 3, 38)] }, S: (f) => ({ ship: { p: [0, 0, 0], rz: 1.7, ry: 0.2, fl: 0, pl: 0.75 + 0.25 * ramp(f, 1016, 1064) } }), num: { a: 1035, b: 1056, v0: 0, v1: 1000, sub: 'graus Celsius', accent: '#ff5a2a', suf: '°' } },
  { id: 'pernas', a: 1065, st: 'A', light: 'day', cam: { keys: [K(1065, [0, 20, 22], 70, 30, 4, 50), K(1090, [0, 4, 22], 22, 20, -4, 44), K(1118, [6, 3, 22], 12, 55, -6, 40)] }, S: (f) => ({ ship: { p: [0, 6, SHZ + 2], fl: 0 }, arms: 0 }), cross: { a: 1100 } },
  { id: 'desce', a: 1119, st: 'A', light: 'gold', cam: { keys: [K(1119, [0, 160, 20], 100, 0, 72, 48), K(1146, [0, 90, 12], 60, 45, 28, 46), K(1172, [0, 82, 14], 50, 60, 12, 44)] }, S: (f) => ({ ship: { p: [0, ARMY + 120 * (1 - E.smooth(ramp(f, 1119, 1172))) * (1 - ramp(f, 1119, 1172) * 0.0), SHZ], fl: 20 * (1 - ramp(f, 1119, 1172)) + 3 }, arms: 0 }) },
  { id: 'maos', a: 1173, st: 'A', light: 'gold', cam: { keys: [K(1173, [0, 92, 20], 44, 95, 5, 44), K(1196, [0, 92, 18], 30, 20, 52, 44), K(1246, [0, 92, 28], 16, 20, 4, 40), K(1272, [0, 90, 24], 38, 60, 12, 46)] }, S: (f) => ({ ship: { p: [0, ARMY, SHZ], fl: 0 }, arms: E.smooth(ramp(f, 1190, 1250)) }), fxb: 1250 },
  { id: 'reuso', a: 1276, st: 'F', light: 'hangar', cam: { keys: [K(1276, [-14, 24, 0], 90, 35, 6, 52), K(1340, [-14, 20, 0], 55, 50, 8, 48), K(1360, [-14, 26, 0], 40, 70, 6, 44), K(1405, [-14, 18, 0], 70, 20, 4, 50), K(1462, [-14, 30, 0], 110, -20, 16, 52)] },
    S: (f) => ({ ship: { p: [-14, 0.6, 0], fl: 0 } }), act: 'hangar', card2: { a: 1354, b: 1462 } },
  { id: 'quanto', a: 1466, st: 'A', light: 'gold', cam: { keys: [K(1466, [0, 88, 20], 45, 200, 8, 46), K(1500, [0, 88, 20], 70, 260, 14, 48), K(1533, [0, 88, 20], 95, 320, 20, 50)] }, S: (f) => ({ ship: { p: [0, ARMY, SHZ], fl: 0 }, arms: 1 }), q: { a: 1478, b: 1533 } },
  { id: 'aviao', a: 1539, st: 'E', light: 'day', cam: { keys: [K(1539, [40, 24, 15], 105, 22, 5, 50), K(1578, [40, 34, 15], 70, 40, 16, 46), K(1620, [10, 6, 0], 90, 15, 4, 48), K(1645, [60, 12, 0], 70, 10, 8, 46), K(1678, [140, 40, 0], 130, 25, 14, 48)] },
    S: (f) => ({ ship: { p: [40, 0, 15], fl: 0 }, plane: -260 + 460 * E.easeIn(ramp(f, 1590, 1678)) }) },
  { id: 'duplo', a: 1683, st: 'A', light: 'dusk', cam: { keys: [K(1683, [0, 90, 14], 170, 0, 50, 50), K(1740, [0, 150, 14], 150, 20, 22, 52), K(1775, [-26, 140, 14], 60, 15, 10, 44), K(1798, [10, 110, 20], 60, 30, 10, 44), K(1829, [0, 82, 20], 70, 55, 14, 46)] },
    S: (f) => { const t = ramp(f, 1690, 1829), u = E.smooth(t); return { ship: { p: [14, ARMY + 140 * (1 - u), SHZ + 4], fl: 16 * (1 - u) + 2 }, boost: { p: [-26, 6 + 170 * (1 - u), SHZ + 4], fl: 22 * (1 - u) + 2 }, arms: 0 }; }, card3: { a: 1738 } },
  { id: 'cta_a', a: 1833, st: 'A', light: 'night', cam: { keys: [K(1833, [0, 2.6, 50], 12, 8, 4, 50), K(1885, [0, 4, 50], 16, -12, 6, 50)] }, S: (f) => ({ ship: { p: [0, ARMY, SHZ], fl: 0 }, arms: 1 }), act: 'cta' },
  { id: 'cta_b', a: 1888, st: 'A', light: 'night', cam: { keys: [K(1888, [0, 3, 50], 16, -12, 5, 50), K(1990, [0, 12, 50], 26, 18, 10, 50), K(2030, [0, 50, 40], 80, 40, 22, 52)] }, S: (f) => ({ ship: { p: [0, ARMY, SHZ], fl: 0 }, arms: 1 }), act: 'cta', cta: { a: 1899 } },
  { id: 'cta_c', a: 2035, st: 'A', light: 'night', cam: { keys: [K(2035, [0, 60, 30], 80, 60, 22, 52), K(2136, [0, 70, 20], 240, 120, 24, 48)] }, S: (f) => ({ ship: { p: [0, ARMY, SHZ], fl: 0 }, arms: 1 }), cta: { a: 1899, follow: true } },
];
export const SHOTS = DEF.map((s, i) => ({ ...s, b: (DEF[i + 1] ? DEF[i + 1].a - 1 : TOTAL - 1), g: i }));
export const shotAt = (f) => f === COVER ? { id: 'capa', a: COVER, b: COVER, st: 'A', light: 'gold' } : (SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1]);
export const lightFor = (S, f) => ({ ...LIGHTS[S.light || 'gold'] });
const l3 = (a, b, t) => a.map((v, i) => lerp(v, b[i], t));
export const camAt = (f) => {
  const S = shotAt(f);
  if (S.map) return { pos: [0, 80, 100], look: [0, 70, 0], fov: 40, roll: 0, flash: 0 };
  if (S.id === 'capa') return { pos: [0, 86, 46], look: [0, 92, 20], fov: 62, roll: 0, flash: 0 };
  const Kk = S.cam.keys.map((k, i) => ({ ...(i ? S.cam.keys[0] : {}), ...k })); let i = 0; while (i < Kk.length - 2 && f >= Kk[i + 1].f) i++;
  const A_ = Kk[i], B_ = Kk[i + 1], tt = E.smooth(clamp((f - A_.f) / Math.max(1, B_.f - A_.f)));
  const FF = l3(A_.F, B_.F, tt), d = lerp(A_.d, B_.d, tt), a = lerp(A_.az, B_.az, tt) * D2R, e = lerp(A_.el, B_.el, tt) * D2R, fov = lerp(A_.fov, B_.fov, tt);
  const O = OFF[S.st], F = [FF[0] + O[0], FF[1] + O[1], FF[2] + O[2]];
  const pos = [F[0] + d * Math.cos(e) * Math.sin(a), F[1] + d * Math.sin(e), F[2] + d * Math.cos(e) * Math.cos(a)]; if (pos[1] < 1.2 && S.st !== 'B' && S.st !== 'C') pos[1] = 1.2;
  return { pos, look: F, fov, roll: 0, flash: 0 };
};
const dist3 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const dofAt = (f) => { const S = shotAt(f), C = camAt(f); if (S.id === 'capa') return { focus: 14, cinf: 2, near: 1 }; return { focus: dist3(C.pos, C.look), cinf: dist3(C.pos, C.look) < 30 ? 3.5 : 1.4, near: 1 }; };
export const worldAt = (f) => { const S = shotAt(f); const o = { stage: S.st || 'A' }; if (S.S) Object.assign(o, S.S(f)); if (f === COVER) Object.assign(o, { ship: { p: [0, 78, 20], fl: 10 }, arms: 0.55 }); return o; };
// ---- personagens ----
const R = (T, who, o, pos, extra = {}) => ({ key: who + JSON.stringify(o), draw: (p) => T.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const life = (f, seed) => { const i = idle(f, seed); return { bob: q(i.bob, 3), tilt: q(i.tilt, 1), headTilt: q(i.headTilt, 1), blink: blinkAt(f, seed) }; };
export const actorsAt = (f, T) => {
  const S = shotAt(f), out = []; const A = (who, o, pos, seed, s = 1) => out.push(R(T, who, { seed, ...life(f, seed), ...o }, pos, { s }));
  if (S.id === 'capa') { A('workB', { expr: 'shock', facing: 0, L: 'up', R: 'up', blink: 0, bob: 0, tilt: 0, headTilt: 0 }, [-3.2, 80.4, 36.5], 32, 2.6); return out; }
  if (S.act === 'hangar') { A('frances', { expr: 'smile', facing: 0, L: 'point', R: 'hip' }, [FO(-2), 0, 14], 40); A('workB', { expr: 'squint', facing: 0, L: 'wave', wv: q(f * 0.3 % 6.283, 1), R: 'hip' }, [FO(8), 0, 16], 32); A('soldadoA', { expr: 'laugh', facing: 0, L: 'up', R: 'hang' }, [FO(18), 0, 12], 38); }
  if (S.act === 'cta') { [['frances', -4.5], ['workB', -1.5], ['soldadoA', 1.5], ['major', 4.5]].forEach(([w, x], k) => A(w, { expr: 'laugh', facing: 0, L: k % 2 ? 'wave' : 'belly', wv: q((f * 0.35 + k) % 6.283, 1), R: 'up', bob: q(Math.abs(Math.sin(f * 0.3 + k)) * 0.04, 3) }, [x, 0.1, 50], 36 + k, 1.5)); }
  return out;
};
const FO = (x) => OFF.F[0] + x;
// ---- cartões modernos (aparecem na palavra) ----
const fmt = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const NAVY = '#011839', MINT = '#01FBB4';
const rr = (g, x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
const glow = (g, s, x, y, size, col = '#fff', w = 900, sh = MINT) => { g.font = `${w} ${size}px Inter, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.save(); g.shadowColor = sh; g.shadowBlur = size * 0.35; g.fillStyle = col; g.fillText(s, x, y); g.restore(); };
const slab = (g, x, y, w, h, acc) => { g.save(); g.shadowColor = acc; g.shadowBlur = 36; const gr = g.createLinearGradient(x, y, x + w, y + h); gr.addColorStop(0, 'rgba(8,20,60,.90)'); gr.addColorStop(1, 'rgba(40,20,70,.86)'); rr(g, x, y, w, h, 60); g.fillStyle = gr; g.fill(); g.restore(); g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,.4)'; rr(g, x, y, w, h, 60); g.stroke(); g.fillStyle = acc; rr(g, x + w - 124, y + h - 36, 90, 8, 4); g.fill(); };
const drawNum = (p, s, sub, acc = '#7ad7ff') => { const g = p.g; slab(g, 20, 380, 560, 300, acc); let size = 170; g.font = `900 ${size}px Inter`; while (g.measureText(s).width > 500 && size > 50) { size -= 8; g.font = `900 ${size}px Inter`; } glow(g, s, 300, 515, size, '#fff', 900, acc); if (sub) glow(g, sub.toUpperCase(), 300, 632, 34, acc, 800, 'rgba(0,0,0,0)'); };
const drawQ = (p) => { glow(p.g, '?', 300, 520, 640, '#ffb347', 900, '#ff7a1a'); };
const drawLoop = (p, t) => { const g = p.g; slab(g, 20, 380, 560, 300, '#7ad7ff'); g.save(); g.translate(300, 530); g.rotate(t * 6.283); g.lineWidth = 26; g.lineCap = 'round'; g.strokeStyle = '#7ad7ff'; g.shadowColor = '#7ad7ff'; g.shadowBlur = 24; g.beginPath(); g.arc(0, 0, 70, 0.3, 4.6); g.stroke(); g.fillStyle = '#7ad7ff'; g.beginPath(); g.moveTo(66, -62); g.lineTo(112, -86); g.lineTo(98, -34); g.fill(); g.restore(); glow(g, 'REUSO', 300, 640, 34, '#7ad7ff', 800, 'rgba(0,0,0,0)'); };
const drawBars = (p, t) => { const g = p.g; slab(g, 20, 380, 560, 300, '#3ddc84'); const hs = [150, 120, 92, 62]; hs.forEach((h, i) => { const k = clamp(t * 4 - i * 0.6); const hh = h * E.smooth(k); g.fillStyle = i === 3 ? '#3ddc84' : 'rgba(255,255,255,.55)'; g.shadowColor = '#3ddc84'; g.shadowBlur = i === 3 ? 24 : 0; rr(g, 70 + i * 120, 640 - hh, 84, Math.max(4, hh), 18); g.fill(); }); glow(g, 'CUSTO', 300, 440, 40, '#3ddc84', 800, 'rgba(0,0,0,0)'); };
const drawCross = (p, t) => { const g = p.g; slab(g, 20, 380, 560, 300, '#ff5a5a'); g.save(); g.lineCap = 'round'; g.lineWidth = 36; g.strokeStyle = '#ff5a5a'; g.shadowColor = '#ff5a5a'; g.shadowBlur = 30; const k = E.smooth(clamp(t * 2)), k2 = E.smooth(clamp(t * 2 - 1)); g.beginPath(); g.moveTo(190, 450); g.lineTo(190 + 220 * k, 450 + 160 * k); g.stroke(); g.beginPath(); g.moveTo(410, 450); g.lineTo(410 - 220 * k2, 450 + 160 * k2); g.stroke(); g.restore(); glow(g, 'SEM PERNAS', 300, 650, 32, '#ff9a9a', 800, 'rgba(0,0,0,0)'); };
const drawCta = (p, k) => { const g = p.g; g.save(); g.shadowColor = '#7ad7ff'; g.shadowBlur = 44; rr(g, 25, 360, 550, 300, 70); g.fillStyle = '#ffd23f'; g.fill(); g.restore(); g.fillStyle = NAVY; g.font = '900 70px Inter'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('COMENTE', 300, 440, 480); g.font = '900 120px Inter'; g.fillText('VIRAL', 300, 545, 500); g.font = '800 38px Inter'; g.fillText(k ? 'E SIGA O PERFIL' : 'PRA RECEBER A SKILL', 300, 620, 480); };
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 5, full: true, ...extra });
export const fxAt = (f, T) => {
  const S = shotAt(f), out = []; if (S.map || S.id === 'capa') return out; const C = camAt(f);
  const fwd = (() => { const v = [C.look[0] - C.pos[0], C.look[1] - C.pos[1], C.look[2] - C.pos[2]]; const n = Math.hypot(...v) || 1; return v.map((x) => x / n); })();
  const place = (dist0, yfrac, s0) => { const fd = dist3(C.pos, C.look), dist = Math.max(3, Math.min(dist0, fd * 0.5)); const vh = 2 * dist * Math.tan(C.fov * D2R / 2), h = vh * s0;
    const wu = Math.abs(fwd[1]) > 0.97 ? [0, 0, -1] : [0, 1, 0]; const rt = [fwd[1] * wu[2] - fwd[2] * wu[1], fwd[2] * wu[0] - fwd[0] * wu[2], fwd[0] * wu[1] - fwd[1] * wu[0]]; const rn = Math.hypot(...rt) || 1; rt[0] /= rn; rt[1] /= rn; rt[2] /= rn;
    const up = [rt[1] * fwd[2] - rt[2] * fwd[1], rt[2] * fwd[0] - rt[0] * fwd[2], rt[0] * fwd[1] - rt[1] * fwd[0]];
    const c0 = [C.pos[0] + fwd[0] * dist + up[0] * yfrac * vh, C.pos[1] + fwd[1] * dist + up[1] * yfrac * vh, C.pos[2] + fwd[2] * dist + up[2] * yfrac * vh];
    return { pos: [c0[0] - up[0] * h * 0.47, c0[1] - up[1] * h * 0.47, c0[2] - up[2] * h * 0.47], s: h / 2.25 }; };
  const pp = (a) => (f < a ? 0 : Math.min(1, (f - a) / 5) * (1 + 0.2 * Math.exp(-(f - a) / 5)));
  const card = (key, draw, a, size = 0.62, dist = 80) => { if (f < a) return; const pl = place(dist, 0.2, size * Math.max(0.01, pp(a))); out.push(FX(key, draw, pl.pos, pl.s)); };
  if (S.card) card('c' + S.card.text, (p) => drawNum(p, S.card.text, S.card.sub), S.card.a);
  if (S.num) { const n = S.num, v = Math.round(lerp(n.v0, n.v1, E.smooth(ramp(f, n.a, n.b)))); card('n' + v + n.sub, (p) => drawNum(p, fmt(v) + (n.suf || ''), n.sub, n.accent), n.a); }
  if (S.q) card('q', (p) => drawQ(p), S.q.a, 0.75);
  if (S.cross) card('x' + Math.round(ramp(f, S.cross.a, S.cross.a + 24) * 8), (p) => drawCross(p, ramp(f, S.cross.a, S.cross.a + 24)), S.cross.a);
  if (S.card2) { card('lp' + (f >> 2), (p) => drawLoop(p, (f % 60) / 60), S.card2.a, 0.62); }
  if (S.id === 'reuso' && f >= 1404) card('bars' + Math.round(ramp(f, 1404, 1450) * 16), (p) => drawBars(p, ramp(f, 1404, 1450)), 1404, 0.62);
  if (S.cta && f >= S.cta.a) { const fl = !!S.cta.follow; const pl = place(60, 0.18, 0.8 * Math.max(0.01, pp(S.cta.a))); out.push(FX('cta' + fl, (p) => drawCta(p, fl), pl.pos, pl.s)); }
  const burst = (a, pos, s) => { if (f >= a && f < a + 30) { const t = q((f - a) / 30, 1); out.push(FX('bu' + t, (p) => T.fxBurst(p, t), pos, s)); } };
  if (S.fxb) { const O = OFF[S.st]; burst(S.fxb, [O[0], O[1] + (S.st === 'A' ? 92 : 12), O[2] + (S.st === 'A' ? 22 : 0)], S.st === 'A' ? 14 : 26); }
  if (S.id === 'decola' && f >= 424) { const O = OFF.A; for (let i = 0; i < 4; i++) { const t = q(((f - 424 + i * 9) % 36) / 36, 1); out.push(FX('pu' + i + t, (p) => T.fxPuff(p, t), [O[0] + (i - 1.5) * 8, 10, SHZ + 2 + (i % 2) * 6], 10 + t * 8, { full: false })); } }
  return out;
};
