// "A ponte que atravessa o mar" - QV. 78,6 s, 30 fps, 2357 quadros. Mundo novo: Ponte Rio-Niterói (4 palcos).
import { M as E, idle, blinkAt, q, clamp, lerp, ramp } from './motion.js';
export const FPS = 30, TOTAL = 2260, DECK = 0;
export const COVER = 9999;
const D2R = Math.PI / 180;
const hAt = (x) => 26 + 46 * Math.exp(-Math.pow(x / 230, 6));
const OB = { A: [0, 0, 0], B: [5000, 0, 0], C: [-5000, 0, 0], D: [0, 0, 5000] };
// ---------------- luzes ----------------
export const LIGHTS = {
  day: { az: 55, el: 52, sky: '#cfe3f0', ground: '#7d9a86', hemi: 1.15, sun: '#fff4dc', sunI: 2.1, fog: '#d8e8f2', fogNear: 90, fogFar: 1500, skyTop: '#4f95d6', skyHor: '#e6f1f6', sat: 1.12, vig: 0.08, shadowExt: 40 },
  gold: { az: 20, el: 14, sky: '#ffd8a8', ground: '#a98a5a', hemi: 1.0, sun: '#ffb764', sunI: 2.6, fog: '#f6c88f', fogNear: 80, fogFar: 1300, skyTop: '#c9604a', skyHor: '#ffd89a', sat: 1.18, vig: 0.08, shadowExt: 40, sunDisc: '#fff1c8', sunSize: 0.0016 },
  dusk: { az: 200, el: 9, sky: '#b4a6d6', ground: '#6a5f78', hemi: 0.95, sun: '#ff8f6a', sunI: 2.2, fog: '#c7a3b8', fogNear: 70, fogFar: 1200, skyTop: '#33407e', skyHor: '#f0a08a', sat: 1.12, vig: 0.08, shadowExt: 40 },
  night: { az: 120, el: 40, sky: '#4a5f9a', ground: '#2a3556', hemi: 0.95, sun: '#9db4f0', sunI: 1.3, fog: '#0d1632', fogNear: 60, fogFar: 1100, skyTop: '#04081c', skyHor: '#1f3166', sat: 1.0, vig: 0.08, shadowExt: 40, lift: '#02040a' },
  storm: { az: 70, el: 30, sky: '#8e9aa6', ground: '#4d5a60', hemi: 1.0, sun: '#d7dde2', sunI: 1.2, fog: '#8a97a1', fogNear: 40, fogFar: 700, skyTop: '#4a5560', skyHor: '#a8b2ba', sat: 0.8, vig: 0.08, shadowExt: 40 },
  dawn: { az: 300, el: 8, sky: '#ffcfb8', ground: '#8e8a8c', hemi: 1.05, sun: '#ff9d7a', sunI: 2.3, fog: '#f3c3b2', fogNear: 70, fogFar: 1300, skyTop: '#6d7fc4', skyHor: '#ffc7a4', sat: 1.15, vig: 0.08, shadowExt: 40, sunDisc: '#ffe2c0', sunSize: 0.0014 },
  inside: { az: 30, el: 60, sky: '#c9c3b8', ground: '#7a6a58', hemi: 1.5, sun: '#fff0d0', sunI: 0.8, fog: '#4c4a46', fogNear: 18, fogFar: 120, skyTop: '#2a2a2e', skyHor: '#2a2a2e', sat: 1.05, vig: 0.08, shadowExt: 12 },
};
const hx = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mixHex = (a, b, t) => { const A = hx(a), B = hx(b); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], t)).toString(16).padStart(2, '0')).join(''); };
const blendL = (a, b, t) => { const o = {}; for (const k in a) o[k] = (typeof a[k] === 'number') ? lerp(a[k], b[k] ?? a[k], t) : (typeof a[k] === 'string' && a[k][0] === '#' && b[k] ? mixHex(a[k], b[k], t) : a[k]); return o; };
const cycleL = (f, a, b) => { const t = ramp(f, a, b) * 3, i = Math.min(2, Math.floor(t)), seq = ['day', 'dusk', 'night', 'dawn']; return blendL(LIGHTS[seq[i]], LIGHTS[seq[i + 1]], E.smooth(t - i)); };
// ---------------- plano de cena (ver PLANO_DE_CENA.md) ----------------
// cam: F foco (ou [F0,F1]), d distância, az/el graus, fov — [a,b] interpola ao longo do trecho
const P2 = (v) => (Array.isArray(v) ? v : [v, v]);
const DEF = [
  { id: 'hook', a: 0, st: 'A', light: 'day', cam: { keys: [{ f: 0, F: [-100, 72, 0], d: 78, az: 0, el: 84, fov: 58 }, { f: 38, F: [-20, 73, 2], d: 22, az: 8, el: 55, fov: 50 }, { f: 76, F: [40, 6, 30], d: 60, az: 70, el: 6, fov: 48 }, { f: 115, F: [10, 74, 3], d: 20, az: -18, el: 9, fov: 46 }] }, S: (f) => ({ carSpeed: 3.0 }), num: { a: 3, b: 62, v0: 0, v1: 150000, sub: 'carros por dia', dist: 70, y: 0.14 } },
  { id: 'ninguem', a: 116, st: 'A', light: 'gold', cam: { keys: [{ f: 116, F: [0, 74.4, 6.3], d: 7, az: -10, el: 5, fov: 46 }, { f: 134, F: [0, 73.3, 6.3], d: 3.8, az: -6, el: 4, fov: 38 }, { f: 190, F: [0, 74.4, 6.3], d: 6, az: 10, el: 6, fov: 44 }, { f: 205, F: [0, 62, 0], d: 130, az: 30, el: 14, fov: 42 }, { f: 266, F: [0, 58, 0], d: 280, az: 50, el: 20, fov: 44 }] }, S: (f) => ({ carSpeed: 1.3 }), act: (f, A) => A('civA', { expr: 'squint', facing: 0, look: 0.3, L: 'temple', R: 'hip' }, [0, hAt(0) + 0.14, 6.3], 33) },
  { id: 'mapa', a: 272, map: 'a' },
  { id: 'ano', a: 386, st: 'A', light: 'gold', cam: { keys: [{ f: 386, F: [-24, 74, 0], d: 17, az: -14, el: 6, fov: 52 }, { f: 410, F: [-10, 74.6, 6.3], d: 8, az: -8, el: 5, fov: 44 }, { f: 450, F: [0, 74.6, 6.3], d: 6, az: 12, el: 6, fov: 40 }, { f: 490, F: [20, 74, 3], d: 22, az: 5, el: 10, fov: 50 }] }, S: (f) => ({ carSpeed: 0.6 }), year: { a: 412, b: 478 },
    act: (f, A) => { for (let i = 0; i < 5; i++) A(['civA', 'civB', 'workA', 'civD', 'civC'][i], { expr: 'laugh', facing: 0, L: 'up', R: 'up', bob: q(Math.abs(Math.sin(f * 0.35 + i)) * 0.05, 3) }, [-18 + i * 5.2, hAt(-18 + i * 5.2) + 0.14, 6.4], 30 + i); } },
  { id: 'duas_cidades', a: 491, st: 'A', light: 'day', cam: { F: [0, 55, 0], d: [430, 330], az: [-90, -78], el: [14, 22], fov: [44, 40] }, S: (f) => ({ carSpeed: 1.2 }) },
  { id: 'barca', a: 546, st: 'C', light: 'day', cam: { F: [[-40, 6, 20], [50, 6, 14]], d: [110, 84], az: [70, 48], el: [6, 12], fov: [46, 42] }, S: (f) => ({ ferry: ramp(f, 546, 590) }) },
  { id: 'vao_a', a: 594, st: 'A', light: 'day', cam: { keys: [{ f: 594, F: [0, 66, 0], d: 380, az: -6, el: 6, fov: 38 }, { f: 636, F: [0, 80, 0], d: 330, az: 4, el: 8, fov: 36 }, { f: 664, F: [0, 84, 0], d: 190, az: 2, el: 4, fov: 40 }] }, S: (f) => ({ ruler: E.smooth(ramp(f, 636, 690)), carSpeed: 1 }), card: { kind: 'num', a: 640, text: '300 m', sub: 'sem apoio', dist: 130, y: 0.16 } },
  { id: 'sem_pilar', a: 664, st: 'A', light: 'gold', cam: { F: [[-200, 62, 0], [200, 62, 0]], d: [75, 75], az: [-10, 10], el: [-36, -30], fov: [58, 58] }, S: (f) => ({ ruler: 1, carSpeed: 1 }) },
  { id: 'altura', a: 714, st: 'A', light: 'day', cam: { F: [[40, 4, 0], [10, 74, 0]], d: [120, 60], az: [20, 14], el: [4, 6], fov: [48, 44] }, S: (f) => ({ carSpeed: 1 }), num: { a: 718, b: 772, v0: 0, v1: 72, sub: 'metros acima da água', dist: 90, y: 0.18, suf: ' m' } },
  { id: 'predio', a: 786, st: 'D', light: 'gold', cam: { keys: [{ f: 786, F: [-2, 30, 0], d: 150, az: 10, el: 4, fov: 40 }, { f: 822, F: [-10, 8, 0], d: 70, az: -10, el: -4, fov: 50 }, { f: 852, F: [-10, 62, 0], d: 80, az: -30, el: 6, fov: 50 }] }, num: { a: 822, b: 852, v0: 1, v1: 20, sub: 'andares', dist: 120, y: 0.2 } },
  { id: 'navio', a: 853, st: 'A', light: 'day', cam: { F: [0, 38, 0], d: [200, 140], az: [90, 40], el: [3, 66], fov: [44, 46] }, S: (f) => ({ ship: 0.3 + ramp(f, 853, 931) * 0.38, carSpeed: 0.9 }) },
  { id: 'peso', a: 932, st: 'A', light: 'dusk', cam: { keys: [{ f: 932, F: [-30, 73, 3], d: 13, az: 0, el: 10, fov: 46 }, { f: 960, F: [-10, 73.2, 3], d: 7, az: -15, el: 8, fov: 40 }, { f: 990, F: [0, 72, 0], d: 70, az: -60, el: 26, fov: 52 }, { f: 1002, F: [8, 73.4, 1.8], d: 8, az: -80, el: 8, fov: 42 }, { f: 1047, F: [0, 72, 0], d: 75, az: -105, el: 24, fov: 52 }] }, S: (f) => ({ carSpeed: 0.8 }) },
  { id: 'vento', a: 1048, st: 'A', light: 'storm', cam: { F: [0, 74.2, 0], d: [8, 6], az: [10, -14], el: [4, 6], fov: [52, 46], roll: [3, -3] }, S: (f) => ({ wind: 1, windX: 0, windY: 52, windZ: 0, carSpeed: 1 }), act: (f, A) => A('civB', { expr: 'shock', facing: 1, look: 0.4, L: 'up', R: 'hang', tilt: q(8 + 3 * Math.sin(f * 0.4), 1) }, [0, hAt(0) + 0.14, 6.3], 35) },
  { id: 'sal', a: 1101, st: 'B', light: 'inside', cam: { F: [[5000, 2.4, -34], [5000, 2.5, 8]], d: [9, 5], az: [180, 120], el: [6, 8], fov: [62, 50] }, act: (f, A) => A('workA', { expr: 'squint', facing: 0, look: 0.3, L: 'point', R: 'hang' }, [5001, 0, 4 + Math.sin(f * 0.05)], 31), fxk: 'drip' },
  { id: 'manut', a: 1153, st: 'A', light: 'gold', cam: { F: [[-330, 40, 0], [330, 40, 0]], d: [60, 60], az: [0, 0], el: [14, 14], fov: [56, 56] }, S: (f) => ({ carSpeed: 1 }) },
  { id: 'quebra', a: 1216, st: 'A', light: 'dusk', cam: { keys: [{ f: 1216, F: [0, 74.4, 5.2], d: 16, az: 42, el: 8, fov: 48 }, { f: 1236, F: [0, 74.2, 5.2], d: 6, az: 30, el: 6, fov: 40 }, { f: 1276, F: [0, 73, 3], d: 60, az: -10, el: 22, fov: 46 }, { f: 1292, F: [0, 72, 0], d: 190, az: -52, el: 36, fov: 46 }, { f: 1330, F: [0, 72, 0], d: 200, az: -60, el: 40, fov: 46 }] }, S: (f) => ({ hazard: 1, hazX: 0, jam: E.smooth(ramp(f, 1230, 1330)), carSpeed: 1 }), fxk: 'smoke', gauge: { a: 1222, b: 1326, v0: 80, v1: 0 } },
  { id: 'flui', a: 1331, st: 'A', light: 'day', cam: { F: [[-70, 73, 0], [70, 73, 0]], d: [26, 22], az: [0, 10], el: [4, 6], fov: [52, 52] }, S: (f) => ({ carSpeed: 2.0 }) },
  { id: 'oitenta', a: 1373, st: 'A', light: 'day', cam: { F: [[-290, 75.6, 1.8], [300, 75.6, 1.8]], d: [14, 14], az: [-90, -90], el: [9, 9], fov: [58, 58] }, S: (f) => ({ carSpeed: 1.5 }), gauge: { a: 1376, b: 1418, v0: 0, v1: 80 } },
  { id: 'dez_min', a: 1451, st: 'A', light: 'gold', cam: { F: [[-300, 40, 0], [300, 72, 0]], d: [70, 90], az: [-30, 30], el: [52, 46], fov: [56, 52] }, S: (f) => ({ carSpeed: 1.5 }), clock: { a: 1456, b: 1490 } },
  { id: 'mapa_b', a: 1507, map: 'b' },
  { id: 'quanto', a: 1611, st: 'A', light: 'gold', cam: { F: [0, 60, 0], d: [290, 240], az: [60, 112], el: [12, 14], fov: [40, 40] }, S: (f) => ({ ship: 0.3 + ramp(f, 1611, 1676) * 0.4, shipX: 20, carSpeed: 0.8 }), q: { a: 1625, b: 1676 } },
  { id: 'pessoas', a: 1677, st: 'A', light: 'dawn', cam: { F: [[-7, 74.5, 6.3], [0, 74, 6.3]], d: [8, 70], az: [0, 20], el: [4, 60], fov: [44, 50] }, S: (f) => ({ carSpeed: 0.7 }), act: (f, A) => { for (let i = 0; i < 6; i++) A(['civA', 'civB', 'civC', 'civD', 'workA', 'velha'][i], { expr: i % 2 ? 'smile' : 'laugh', facing: 0, L: i % 2 ? 'hip' : 'wave', wv: q((f * 0.3 + i) % 6.283, 1), R: 'hang' }, [-6 + i * 2.3, hAt(-6 + i * 2.3) + 0.14, 6.3], 30 + i); } },
  { id: 'dia', a: 1746, st: 'A', light: 'cycle', cam: { F: [0, 55, 0], d: [330, 300], az: [-12, 10], el: [7, 10], fov: [40, 40] }, S: (f) => ({ carSpeed: 2.2 }) },
  { id: 'pov', a: 1782, st: 'A', light: 'dawn', cam: { F: [[-290, 75.4, 1.8], [-60, 75.4, 1.8]], d: [10, 10], az: [-90, -88], el: [8, 9], fov: [58, 58] }, S: (f) => ({ carSpeed: 1.3 }) },
  { id: 'embaixo', a: 1880, st: 'A', light: 'gold', cam: { F: [0, 30, 0], d: [45, 280], az: [20, 82], el: [-24, 8], fov: [58, 44] }, S: (f) => ({ carSpeed: 1 }) },
  { id: 'cta_a', a: 1958, st: 'A', light: 'night', cam: { F: [0, 75.2, 6.3], d: [10, 7], az: [14, -10], el: [5, 7], fov: [48, 42] }, S: (f) => ({ carSpeed: 0.5 }), act: (f, A) => { A('civD', { expr: 'laugh', facing: 0, L: 'wave', wv: q(f * 0.3 % 6.283, 1), R: 'hip' }, [-1.2, hAt(0) + 0.14, 6.3], 36); A('workA', { expr: 'laugh', facing: 0, L: 'up', R: 'wave', wv: q((f * 0.3 + 2) % 6.283, 1) }, [1.2, hAt(0) + 0.14, 6.3], 31); } },
  { id: 'cta_b', a: 2013, st: 'A', light: 'night', cam: { F: [0, 76, 6.0], d: [15, 50], az: [0, 50], el: [8, 22], fov: [50, 48] }, S: (f) => ({ carSpeed: 0.5 }), cta: { a: 2024 }, act: (f, A) => { [['civD', -3], ['workA', -1.2], ['velha', 1.2], ['major', 3]].forEach(([w, x], k) => A(w, { expr: 'laugh', facing: 0, L: k % 2 ? 'wave' : 'belly', wv: q((f * 0.35 + k) % 6.283, 1), R: 'up', bob: q(Math.abs(Math.sin(f * 0.3 + k)) * 0.04, 3) }, [x, hAt(x) + 0.14, 6.3], 36 + k)); } },
  { id: 'cta_c', a: 2162, st: 'A', light: 'dusk', cam: { F: [0, 70, 0], d: [60, 200], az: [30, 90], el: [10, 20], fov: [50, 42] }, S: (f) => ({ carSpeed: 0.5 }), cta: { a: 2024, follow: true } },
];
export const SHOTS = DEF.map((s, i) => ({ ...s, b: (DEF[i + 1] ? DEF[i + 1].a - 1 : TOTAL - 1), g: i }));
export const shotAt = (f) => f === COVER ? { id: 'capa', a: COVER, b: COVER, st: 'A', light: 'gold' } : (SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1]);
export const lightFor = (S, f) => (S.light === 'cycle' ? cycleL(f, 1847, 1876) : { ...LIGHTS[S.light || 'day'] });
// ---------------- câmera ----------------
const l3 = (a, b, t) => a.map((v, i) => lerp(v, b[i], t));
export const camAt = (f) => {
  const S = shotAt(f);
  if (S.map) return { pos: [0, 80, 100], look: [0, 70, 0], fov: 40, roll: 0, flash: 0 };
  if (S.id === 'capa') return { pos: [-13.5, 74.6, 2.0], look: [-3, 75.2, 2.0], fov: 62, roll: 0, flash: 0 };
  const c = S.cam;
  if (c.keys) { const K = c.keys.map((k, i) => ({ ...(i ? c.keys[0] : {}), ...k })); let i = 0; while (i < K.length - 2 && f >= K[i + 1].f) i++; const A_ = K[i], B_ = K[i + 1], tt = E.smooth(clamp((f - A_.f) / Math.max(1, B_.f - A_.f)));
    const FF = l3(A_.F, B_.F, tt), d = lerp(A_.d, B_.d, tt), a = lerp(A_.az, B_.az, tt) * D2R, e = lerp(A_.el, B_.el, tt) * D2R, fov = lerp(A_.fov || 46, B_.fov || 46, tt);
    const OO = (S.st === 'C' || S.st === 'D') ? OB[S.st] : [0, 0, 0], F = [FF[0] + OO[0], FF[1] + OO[1], FF[2] + OO[2]];
    const pos = [F[0] + d * Math.cos(e) * Math.sin(a), F[1] + d * Math.sin(e), F[2] + d * Math.cos(e) * Math.cos(a)]; if (pos[1] < 1.2 && S.st !== 'B') pos[1] = 1.2;
    return { pos, look: F, fov, roll: 0, flash: 0 }; }
  const t = E.smooth((f - S.a) / Math.max(1, S.b - S.a)), tl = (f - S.a) / Math.max(1, S.b - S.a);
  const F0 = Array.isArray(c.F[0]) ? l3(c.F[0], c.F[1], tl) : c.F, OO = (S.st === 'C' || S.st === 'D') ? OB[S.st] : [0, 0, 0], F = [F0[0] + OO[0], F0[1] + OO[1], F0[2] + OO[2]], [d, az, el, fov] = [c.d, c.az, c.el, c.fov].map((v) => lerp(v[0], v[1], t));
  const a = az * D2R, e = el * D2R;
  const pos = [F[0] + d * Math.cos(e) * Math.sin(a), F[1] + d * Math.sin(e), F[2] + d * Math.cos(e) * Math.cos(a)];
  const roll = c.roll ? lerp(c.roll[0], c.roll[1], t) : 0;
  let flash = 0; 
  if (pos[1] < 1.2 && S.st !== 'B') pos[1] = 1.2;
  return { pos, look: F, fov, roll, flash };
};
const dist3 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const dofAt = (f) => { const S = shotAt(f), C = camAt(f); if (S.id === 'capa') return { focus: 4.6, cinf: 6, near: 1 }; const near = dist3(C.pos, C.look) < 16; return { focus: dist3(C.pos, C.look), cinf: near ? 4 : 1.6, near: 1 }; };
// ---------------- estado do mundo ----------------
export const worldAt = (f) => { const S = shotAt(f); const o = { stage: S.st || 'A' }; if (S.S) Object.assign(o, S.S(f)); if (S.act && S.st === 'A') o.noL3 = 1; if (f === COVER) Object.assign(o, { carSpeed: 0.3, noL3: 0 }); return o; };
// ---------------- atores ----------------
const R = (T, who, o, pos, extra = {}) => ({ key: who + JSON.stringify(o), draw: (p) => T.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const life = (f, seed) => { const i = idle(f, seed); return { bob: q(i.bob, 3), tilt: q(i.tilt, 1), headTilt: q(i.headTilt, 1), blink: blinkAt(f, seed) }; };
export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [];
  if (S.id === 'capa') { out.push(R(T, 'civA', { seed: 33, expr: 'shock', facing: 0, L: 'up', R: 'up', blink: 0, bob: 0, tilt: 0, headTilt: 0 }, [-9, hAt(-9) + 0.14, 2.0], { s: 1.5 })); return out; }
  if (!S.act) return out;
  const A = (who, o, pos, seed) => { const o2 = { seed, ...life(f, seed), ...o }; const O = OB[S.st] || [0, 0, 0]; out.push(R(T, who, o2, [pos[0], pos[1], pos[2]], { s: 1.0 })); };
  S.act(f, A); return out;
};
// ---------------- gráficos de movimento (cartões) ----------------
const fmt = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const NAVY = '#011839', MINT = '#01FBB4';
const rr = (g, x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
const glass = (g, x, y, w, h, r = 54, acc = MINT) => { g.save(); g.shadowColor = acc; g.shadowBlur = 36; const gr = g.createLinearGradient(x, y, x + w, y + h); gr.addColorStop(0, 'rgba(6,30,72,.90)'); gr.addColorStop(1, 'rgba(2,70,110,.86)'); rr(g, x, y, w, h, r); g.fillStyle = gr; g.fill(); g.restore(); g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,.42)'; rr(g, x, y, w, h, r); g.stroke(); g.fillStyle = acc; rr(g, x + 34, y + 28, 90, 8, 4); g.fill(); };
const glow = (g, s, x, y, size, col = '#fff', w = 900, sh = MINT) => { g.font = `${w} ${size}px Inter, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.save(); g.shadowColor = sh; g.shadowBlur = size * 0.35; g.fillStyle = col; g.fillText(s, x, y); g.restore(); };
const txt = (g, s, x, y, size, col = '#fff', w = 900) => glow(g, s, x, y, size, col, w);
const drawNum = (p, s, sub) => { const g = p.g; glass(g, 20, 380, 560, 300); let size = 160; g.font = `900 ${size}px Inter`; while (g.measureText(s).width > 500 && size > 50) { size -= 8; g.font = `900 ${size}px Inter`; } glow(g, s, 300, 515, size); if (sub) glow(g, sub.toUpperCase(), 300, 630, 36, MINT, 800, 'rgba(0,0,0,0)'); };
const drawGauge = (p, v) => { const g = p.g, cx = 300, cy = 600, r = 230; g.save(); g.lineCap = 'round'; g.lineWidth = 34; g.strokeStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.arc(cx, cy, r, Math.PI * 0.85, Math.PI * 2.15); g.stroke(); const k = clamp(v / 120), gr = g.createLinearGradient(cx - r, 0, cx + r, 0); gr.addColorStop(0, MINT); gr.addColorStop(0.65, '#ffd23f'); gr.addColorStop(1, '#ff4d4d'); g.strokeStyle = gr; g.shadowColor = MINT; g.shadowBlur = 30; g.beginPath(); g.arc(cx, cy, r, Math.PI * 0.85, Math.PI * (0.85 + 1.3 * k)); g.stroke(); g.restore();
  glow(g, String(Math.round(v)), cx, cy - 10, 190); glow(g, 'KM/H', cx, cy + 105, 44, MINT, 800, 'rgba(0,0,0,0)'); };
const drawClock = (p, m) => { const g = p.g, cx = 300, cy = 520, r = 220; g.save(); g.lineCap = 'round'; g.lineWidth = 38; g.strokeStyle = 'rgba(255,255,255,.2)'; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.stroke(); g.strokeStyle = MINT; g.shadowColor = MINT; g.shadowBlur = 34; g.beginPath(); g.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + (m / 10) * Math.PI * 2); g.stroke(); g.restore(); glow(g, String(Math.round(m)), cx, cy - 6, 220); glow(g, 'MINUTOS', cx, cy + 120, 42, MINT, 800, 'rgba(0,0,0,0)'); };
const drawYear = (p, y) => { const g = p.g; glass(g, 40, 400, 520, 240); glow(g, String(Math.round(y)), 300, 530, 190); };
const drawQ = (p) => { glow(p.g, '?', 300, 520, 640, MINT, 900, MINT); };
const drawCta = (p, k) => { const g = p.g; g.save(); g.shadowColor = MINT; g.shadowBlur = 44; rr(g, 25, 360, 550, 300, 70); g.fillStyle = MINT; g.fill(); g.restore(); g.fillStyle = NAVY; g.font = '900 70px Inter'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('COMENTE', 300, 440, 480); let s = 104; g.font = `900 ${s}px Inter`; while (g.measureText('VIRAL').width > 500) { s -= 4; g.font = `900 ${s}px Inter`; } g.fillText('VIRAL', 300, 545, 500); g.font = '800 38px Inter'; g.fillText(k ? 'E SIGA O PERFIL' : 'PRA RECEBER A SKILL', 300, 620, 480); };
const pop = (f, a) => f < a ? 0 : Math.min(1, (f - a) / 5) * (1 + 0.22 * Math.exp(-(f - a) / 5));
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 5, full: true, ...extra });
export const fxAt = (f, T) => {
  const S = shotAt(f), out = [], C = camAt(f); if (!S.cam) return out;
  const fwd = (() => { const v = [C.look[0] - C.pos[0], C.look[1] - C.pos[1], C.look[2] - C.pos[2]]; const n = Math.hypot(...v) || 1; return v.map((x) => x / n); })();
  const place = (dist0, yfrac, s0 = 0.3) => { const fd = dist3(C.pos, C.look), dist = Math.max(3, Math.min(dist0, fd * 0.5)); const vh = 2 * dist * Math.tan(C.fov * D2R / 2), h = vh * s0;
    const wu = Math.abs(fwd[1]) > 0.97 ? [0, 0, -1] : [0, 1, 0]; const rt = [fwd[1] * wu[2] - fwd[2] * wu[1], fwd[2] * wu[0] - fwd[0] * wu[2], fwd[0] * wu[1] - fwd[1] * wu[0]]; const rn = Math.hypot(...rt) || 1; rt[0] /= rn; rt[1] /= rn; rt[2] /= rn;
    const up = [rt[1] * fwd[2] - rt[2] * fwd[1], rt[2] * fwd[0] - rt[0] * fwd[2], rt[0] * fwd[1] - rt[1] * fwd[0]];
    const c0 = [C.pos[0] + fwd[0] * dist + up[0] * yfrac * vh, C.pos[1] + fwd[1] * dist + up[1] * yfrac * vh, C.pos[2] + fwd[2] * dist + up[2] * yfrac * vh];
    return { pos: [c0[0] - up[0] * h * 0.47, c0[1] - up[1] * h * 0.47, c0[2] - up[2] * h * 0.47], s: h / 2.25 }; };
  const add = (key, draw, dist, yfrac, size) => { const pl = place(dist, yfrac, size); out.push(FX(key, draw, pl.pos, pl.s)); };
  const pp = (a, b) => (f < a ? 0 : Math.min(1, (f - a) / 5) * (1 + 0.2 * Math.exp(-(f - a) / 5)));
  if (S.num) { const n = S.num, v = lerp(n.v0, n.v1, E.smooth(ramp(f, n.a, n.b))); if (f >= n.a) { const val = Math.round(v); out.length; const pl = place(n.dist, 0.2, 0.62 * Math.max(0.01, pp(n.a))); out.push(FX('num' + val + n.sub, (p) => drawNum(p, fmt(val) + (n.suf || ''), n.sub), pl.pos, pl.s)); } }
  if (S.card && f >= S.card.a) { const n = S.card; const pl = place(n.dist, 0.2, 0.62 * Math.max(0.01, pp(n.a))); out.push(FX('card' + n.text, (p) => drawNum(p, n.text, n.sub), pl.pos, pl.s)); }
  if (S.year) { const y = Math.round(lerp(1950, 1974, E.smooth(ramp(f, S.year.a, S.year.b)))); const pl = place(25, 0.18, 0.62 * Math.max(0.01, pp(S.year.a))); out.push(FX('yr' + y, (p) => drawYear(p, y), pl.pos, pl.s)); }
  if (S.gauge) { const g = S.gauge, v = Math.round(lerp(g.v0, g.v1, E.smooth(ramp(f, g.a, g.b)))) + (g.v1 === 80 && f > g.b ? Math.round(Math.sin(f * 0.3) * 1.2) : 0); if (f >= g.a) { const d = dist3(C.pos, C.look); const pl = place(Math.max(8, d * 0.55), 0.14, 0.75 * Math.max(0.01, pp(g.a))); out.push(FX('g' + v, (p) => drawGauge(p, v), pl.pos, pl.s)); } }
  if (S.clock) { const c = S.clock, m = lerp(0, 10, E.smooth(ramp(f, c.a, c.b))), mm = Math.round(m * 4) / 4; if (f >= c.a) { const pl = place(Math.max(8, dist3(C.pos, C.look) * 0.5), 0.14, 0.8 * Math.max(0.01, pp(c.a))); out.push(FX('c' + mm, (p) => drawClock(p, mm), pl.pos, pl.s)); } }
  if (S.q && f >= S.q.a) { const pl = place(dist3(C.pos, C.look) * 0.6, 0.12, 0.75 * Math.max(0.01, pp(S.q.a))); out.push(FX('q', (p) => drawQ(p), pl.pos, pl.s)); }
  if (S.cta && f >= S.cta.a + 0) { const pl = place(Math.max(10, dist3(C.pos, C.look) * 0.55), 0.16, 0.8 * Math.max(0.01, pp(S.cta.a))); const fl = !!S.cta.follow; out.push(FX('cta' + fl, (p) => drawCta(p, fl), pl.pos, pl.s)); }
  if (S.fxk === 'smoke') { for (let i = 0; i < 4; i++) { const a0 = S.a + i * 14, t = ((f - a0) % 56 + 56) % 56 / 56; const pos = [0 + Math.sin(i) * 0.6, 75.6 + t * 9, 5.2 + Math.cos(i) * 0.6]; out.push(FX('pf' + i + q(t, 1), (p) => T.fxPuff(p, q(t, 1)), pos, 2.2 + t * 2.4, { full: false })); } }
  if (S.fxk === 'drip') { const t = q(((f - S.a) % 18) / 18, 1); out.push(FX('dr' + t, (p) => T.fxDrip(p, t), [4995.8, 3.4, 5.2], 0.9, { full: false })); }
  const burst = (a, pos, s = 1.2) => { if (f >= a && f < a + 30) { const t = q((f - a) / 30, 1); out.push(FX('bu' + t, (p) => T.fxBurst(p, t), pos, s, { full: true })); } };
  if (S.id === 'cta_b') burst(2109, [0, 80, 4.5], 6); if (S.id === 'hook_topo') burst(3, [0, 74, 0], 10);
  return out;
};
