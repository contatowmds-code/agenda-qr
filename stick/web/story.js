// "A nota de 100 trilhões que não comprava um pão" — QV. 68.58 s, 30 fps, 2058 quadros.
import { M as E, camFromKeys, idle, blinkAt, q, clamp, lerp, lerp3, ramp } from './motion.js';
export const FPS = 30, TOTAL = 2058, DECK = 0;
export const SHOTS = [
  { id: 'hook1', a: 0, b: 86, light: 'day' },
  { id: 'hook2', a: 87, b: 141, light: 'day' },
  { id: 'real', a: 142, b: 216, light: 'day' },
  { id: 'zim', a: 217, b: 299, light: 'day' },
  { id: 'dobra', a: 300, b: 404, light: 'day' },
  { id: 'pao', a: 405, b: 511, light: 'day' },
  { id: 'prensa', a: 512, b: 622, light: 'dusk' },
  { id: 'notas', a: 623, b: 795, light: 'day' },
  { id: 'carr', a: 796, b: 898, light: 'day' },
  { id: 'nada', a: 899, b: 960, light: 'day' },
  { id: 'aband', a: 961, b: 1028, light: 'dusk' },
  { id: 'dolar', a: 1029, b: 1089, light: 'day' },
  { id: 'banco', a: 1090, b: 1207, light: 'day' },
  { id: 'quanto', a: 1208, b: 1302, light: 'day' },
  { id: 'cents', a: 1303, b: 1370, light: 'dusk' },
  { id: 'virada', a: 1371, b: 1432, light: 'gold' },
  { id: 'colec', a: 1433, b: 1547, light: 'gold' },
  { id: 'vend', a: 1548, b: 1650, light: 'gold' },
  { id: 'fim', a: 1651, b: 1751, light: 'gold' },
  { id: 'cta', a: 1752, b: 2057, light: 'day' },
];
export const COVER = 9999;
export const shotAt = (f) => f === COVER ? { id: 'capa', a: COVER, b: COVER, light: 'gold' } : SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];
export const LIGHTS = {
  day: { az: 55, el: 48, sky: '#cfe0ea', ground: '#b0935a', hemi: 1.15, sun: '#fff2d8', sunI: 2.0, fog: '#e6d8b8', fogNear: 50, fogFar: 700, skyTop: '#5fa0d0', skyHor: '#f0e2c0', sat: 1.08, vig: 0.34, shadowExt: 12 },
  dusk: { az: 30, el: 20, sky: '#aab4d8', ground: '#7a6a60', hemi: 0.95, sun: '#ffb27a', sunI: 2.1, fog: '#b9b4cc', fogNear: 60, fogFar: 700, skyTop: '#4a5a9a', skyHor: '#e2b49a', sat: 1.08, vig: 0.38, shadowExt: 14 },
  gold: { az: 25, el: 14, sky: '#ffd29a', ground: '#a88a50', hemi: 1.0, sun: '#ffb460', sunI: 2.6, fog: '#f7c98a', fogNear: 60, fogFar: 600, skyTop: '#c9604a', skyHor: '#ffd08a', sat: 1.15, vig: 0.36, shadowExt: 12, sunDisc: '#fff0c0', sunSize: 0.05 },
};
export const lightFor = (S) => ({ ...LIGHTS[S.light] });
const NP = [0, 2.5, 0.9];
const CAMS = {
  hook1: [{ f: 0, pos: [0.3, 1.7, 6.6], look: [0, 1.9, 0.9], fov: 46 }, { f: 86, pos: [0.1, 1.9, 5.0], look: [0, 2.1, 0.9], fov: 42 }],
  hook2: [{ f: 87, pos: [2.4, 1.5, 2.2], look: [2.4, 1.4, -3.8], fov: 46 }, { f: 141, pos: [2.5, 1.5, 1.4], look: [2.5, 1.4, -3.8], fov: 42 }],
  real: [{ f: 142, pos: [0.7, 0.45, 4.6], look: [0, 2.2, 0.9], fov: 50 }, { f: 216, pos: [0.3, 0.4, 3.9], look: [0, 2.3, 0.9], fov: 48 }],
  zim: [{ f: 217, pos: [-2.6, 1.5, 2.2], look: [-2.6, 1.4, -3.8], fov: 46 }, { f: 299, pos: [-2.7, 1.5, 0.9], look: [-2.75, 1.45, -3.8], fov: 44 }],
  dobra: [{ f: 300, pos: [2.7, 1.5, 1.6], look: [2.8, 1.4, -3.8], fov: 44 }, { f: 404, pos: [2.95, 1.5, 0.6], look: [3.0, 1.45, -3.9], fov: 42 }],
  pao: [{ f: 405, pos: [2.3, 0.9, 1.8], look: [2.8, 1.5, -3.9], fov: 46 }, { f: 462, pos: [2.6, 0.85, 1.0], look: [2.9, 1.5, -3.9], fov: 44 }, { f: 511, pos: [2.8, 0.8, 0.5], look: [3.0, 1.5, -3.9], fov: 42 }],
  prensa: [{ f: 512, pos: [-3.6, 1.7, 8.8], look: [-7.5, 1.4, 4.0], fov: 46 }, { f: 622, pos: [-5.4, 1.6, 8.4], look: [-7.0, 1.3, 3.8], fov: 44 }],
  notas: [{ f: 623, pos: [0, 2.0, 4.6], look: [0, 2.3, 0.9], fov: 42 }, { f: 688, pos: [0, 2.0, 4.4], look: [0, 2.3, 0.9], fov: 42 }, { f: 696, pos: [0, 2.0, 5.5], look: [0, 2.3, 0.9], fov: 42, ease: 'easeOut' }, { f: 739, pos: [0, 2.0, 5.3], look: [0, 2.3, 0.9], fov: 42 }, { f: 748, pos: [0, 2.1, 6.8], look: [0, 2.2, 0.9], fov: 44, ease: 'easeOut' }, { f: 795, pos: [0, 2.1, 6.5], look: [0, 2.2, 0.9], fov: 44 }],
  carr: [{ f: 796, pos: [-0.8, 1.6, 9.5], look: [-1.6, 1.0, 2.2], fov: 50 }, { f: 898, pos: [1.6, 1.5, 4.6], look: [1.3, 1.0, -1.2], fov: 48 }],
  nada: [{ f: 899, pos: [1.3, 1.45, 1.4], look: [0.9, 1.25, -2.0], fov: 40 }, { f: 960, pos: [1.1, 1.4, 0.3], look: [0.9, 1.3, -2.0], fov: 34 }],
  aband: [{ f: 961, pos: [0, 6.5, 8.5], look: [0, 0.8, 0], fov: 50 }, { f: 1028, pos: [0, 5.2, 7.4], look: [0, 0.9, 0], fov: 48 }],
  dolar: [{ f: 1029, pos: [0.5, 1.55, 5.6], look: [0.25, 1.45, 0.9], fov: 40 }, { f: 1089, pos: [0.4, 1.55, 4.6], look: [0.25, 1.45, 0.9], fov: 38 }],
  banco: [{ f: 1090, pos: [1.8, 1.6, 6.6], look: [-0.5, 1.2, 0.9], fov: 46 }, { f: 1207, pos: [0.6, 1.6, 6.0], look: [-0.5, 1.25, 0.9], fov: 44 }],
  quanto: [{ f: 1208, pos: [0.2, 1.8, 5.2], look: [0, 2.1, 0.9], fov: 42 }, { f: 1302, pos: [0.1, 2.0, 4.3], look: [0, 2.3, 0.9], fov: 38 }],
  cents: [{ f: 1303, pos: [0, 2.1, 4.0], look: [0, 2.4, 0.9], fov: 38, roll: 4 }, { f: 1370, pos: [0, 2.1, 3.7], look: [0, 2.4, 0.9], fov: 36, roll: 3 }],
  virada: [{ f: 1371, pos: [2.4, 1.7, 4.6], look: [0, 2.0, 0.9], fov: 46 }, { f: 1432, pos: [-2.4, 1.7, 4.6], look: [0, 2.0, 0.9], fov: 46, path: [[0, 1.8, 5.6]] }],
  colec: [{ f: 1433, pos: [0, 1.9, 4.4], look: [0, 2.0, 0.9], fov: 46 }, { f: 1547, pos: [0, 2.3, 7.4], look: [0, 1.8, 0.9], fov: 50 }],
  vend: [{ f: 1548, pos: [2.6, 1.5, 2.0], look: [2.75, 1.45, -3.9], fov: 44 }, { f: 1650, pos: [2.9, 1.5, 0.7], look: [2.95, 1.45, -3.9], fov: 42 }],
  fim: [{ f: 1651, pos: [0, 1.1, 6.0], look: [0, 1.9, 0.9], fov: 46 }, { f: 1751, pos: [0, 1.2, 4.9], look: [0, 2.0, 0.9], fov: 42 }],
  cta: [{ f: 1752, pos: [-2.6, 1.7, 11.6], look: [-4.3, 1.9, 1.2], fov: 46 }, { f: 1940, pos: [-4.0, 1.8, 10.6], look: [-4.3, 1.9, 1.2], fov: 44 }, { f: 2057, pos: [-3.6, 2.1, 11.4], look: [-4.3, 1.9, 1.0], fov: 46 }],
};
const CUTS = [87, 217, 300, 512, 623, 796, 961, 1090, 1371, 1548, 1752];
export const camAt = (f) => {
  const S = shotAt(f);
  const c = S.id === 'capa' ? { pos: [0.0, 1.5, 5.2], look: [0.0, 1.8, 0.9], fov: 48, roll: 0 } : camFromKeys(CAMS[S.id], f, { kicks: [1303, 462] });
  c.flash = 0;
  for (const s of CUTS) if (f >= s && f < s + 6) c.flash = (1 - (f - s) / 6) * 0.8;
  return c;
};
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const dofAt = (f) => {
  const S = shotAt(f), C = camAt(f);
  const cinf = { hook1: 5, hook2: 5, zim: 6, dobra: 6, pao: 6, prensa: 5, nada: 8, dolar: 8, banco: 5, quanto: 6, cents: 7, vend: 6, fim: 5, cta: 5 }[S.id] ?? 0;
  return { focus: dist(C.pos, C.look), cinf };
};
const pop = (f, a) => f < a ? 0 : Math.min(1, (f - a) / 4) * (1 + 0.22 * Math.exp(-(f - a) / 5));
const NOTE = (t, s, extra = {}) => ({ t, p: NP, s, c: '#9fd6c0', ...extra });
export const worldAt = (f) => {
  const o = { door: 0.25, b1: 'PÃO', b2: '?', b3: '', bl1: '', bl2: '', bl3: '', blc: '#1f5a3a' };
  const S = shotAt(f).id, sway = 0.04 * Math.sin(f * 0.07);
  if (f === COVER) { o.note = NOTE('100 TRILHÕES', 1.0, { t2: 'DE DÓLARES', rz: -0.06 }); return o; }
  if (S === 'hook1') o.note = NOTE('100 TRILHÕES', 0.95 * pop(f, 2), { t2: 'DE DÓLARES', rz: sway });
  if (S === 'hook2') { o.b1 = 'PÃO'; o.b2 = '300 TRILHÕES'; o.b3 = 'falta dinheiro'; }
  if (S === 'real') o.note = NOTE('100 TRILHÕES', 1.0, { t2: 'DE DÓLARES', rz: sway, ry: 0.25 * Math.sin((f - 142) * 0.045) });
  if (S === 'zim') { o.bl1 = 'ZIMBÁBUE'; o.bl2 = f >= 256 ? '2009' : ''; o.bl3 = f >= 256 ? 'ano da nota' : ''; }
  if (S === 'dobra') { o.b1 = 'PREÇO'; o.b2 = String(2 ** Math.min(9, Math.floor((f - 300) / 11))); o.b3 = 'dobra todo dia'; }
  if (S === 'pao') { o.b1 = 'PÃO'; o.b2 = f < 462 ? '1' : '2'; o.b3 = f < 462 ? 'de manhã' : 'no dia seguinte'; }
  if (S === 'prensa') { o.press = true; o.roll = f * 0.3; o.pile = ramp(f, 540, 622); }
  if (S === 'notas') { const k = f < 692 ? 0 : f < 743 ? 1 : 2, a = [623, 692, 743][k];
    o.note = NOTE(['1 MILHÃO', '1 BILHÃO', '1 TRILHÃO'][k], [0.6, 0.8, 1.0][k] * pop(f, a + 6), { c: ['#c9d9a0', '#e3c48a', '#e59a8a'][k], rz: sway }); }
  if (S === 'carr') { const t = ramp(f, 796, 898); o.wb = [lerp(-3, 1.6, t), 0, lerp(3.2, -1.6, t), -0.5 + t * 0.3, f * 0.1]; }
  if (S === 'nada') { o.b1 = 'PÃO'; o.b2 = '?'; o.b3 = ''; }
  if (S === 'aband') { o.bigPiles = true; o.pilesH = 1; }
  if (S === 'dolar') { o.coin = true; o.coinRot = f * 0.1; }
  if (S === 'banco') o.table = true;
  if (S === 'quanto') { o.table = true; o.note = NOTE('100 TRILHÕES', 0.85 * pop(f, 1250), { t2: 'DE DÓLARES', rz: sway }); }
  if (S === 'cents') { o.table = true; o.note = NOTE('US$ 0,40', 0.85 * pop(f, 1303), { t2: 'quarenta centavos', c: '#f0d27a', rz: sway }); }
  if (S === 'virada' || S === 'colec') o.note = NOTE('100 TRILHÕES', 0.9, { t2: 'DE DÓLARES', rz: sway, p: [0, S === 'colec' ? 2.75 : 2.5, 0.9] });
  if (S === 'vend') { const v = lerp(0.4, 35, E.smooth(ramp(f, 1575, 1640))); o.b1 = 'A NOTA'; o.b2 = 'US$ ' + (v < 1 ? '0,40' : Math.round(v)); o.b3 = 'para colecionador'; }
  if (S === 'fim') o.note = NOTE('100 TRILHÕES', 0.95, { t2: 'DE COLEÇÃO', c: '#f0d27a', rz: sway });
  if (S === 'cta') o.sign = 'viral';
  return o;
};
const R = (T, who, o, pos, extra = {}) => ({ key: who + JSON.stringify(o), draw: (p) => T.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const life = (f, seed) => { const i = idle(f, seed); return { bob: q(i.bob, 3), tilt: q(i.tilt, 1), headTilt: q(i.headTilt, 1), blink: blinkAt(f, seed) }; };
export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [];
  const A = (who, o, pos, seed, extra) => out.push(R(T, who, { seed, ...life(f, seed), ...o }, pos, extra));
  const HOLD = (who, expr, seed) => A(who, { expr, facing: 0, L: 'up', R: 'up' }, [0, 0, 0.75], seed);
  const jump = (k = 0) => q(Math.abs(Math.sin(f * 0.4 + k)) * 0.03, 3);
  switch (S.id) {
    case 'hook1': HOLD('pobre', 'grin', 11); break;
    case 'hook2': A('padeiro', { expr: 'angry', facing: -1, look: -0.3, L: 'cross', R: 'cross', headTilt: q(5 * Math.sin(f * 0.5), 1) }, [1.85, 0, -3.4], 21); break;
    case 'real': HOLD('pobre', 'smile', 11); break;
    case 'zim': A('workA', { expr: 'smile', facing: -1, look: -0.3, L: 'point', R: 'hip' }, [-1.95, 0, -2.9], 31); break;
    case 'dobra': A('padeiro', { expr: 'nervous', facing: 1, look: 0.4, L: 'hang', R: 'point', bob: jump() }, [2.15, 0, -3.5], 21); break;
    case 'pao': A('padeiro', { expr: f < 462 ? 'smile' : 'nervous', facing: 1, look: 0.4, L: 'hip', R: 'point' }, [2.2, 0, -3.5], 21); break;
    case 'prensa': A('major', { expr: 'grin', facing: -1, look: -0.4, L: 'hip', R: 'point', bob: jump() }, [-5.5, 0, 3.3], 41); break;
    case 'notas': HOLD('major', f < 743 ? 'grin' : 'nervous', 41); break;
    case 'carr': { const t = ramp(f, 796, 898); A('pobre', { expr: 'pained', facing: 1, L: 'reach', R: 'reach', bob: jump() }, [lerp(-3, 1.6, t) - 0.62, 0, lerp(3.2, -1.6, t) + 0.65], 11); break; }
    case 'nada': A('pobre', { expr: f < 925 ? 'pained' : 'shock', facing: -1, look: -0.4, L: 'belly', R: 'hang', holdL: 'bread' }, [0.9, 0, -2.0], 11); break;
    case 'aband': A('civA', { expr: 'pained', facing: 1, L: 'hang', R: 'hang' }, [-0.9, 0, 1.6], 33); A('civB', { expr: 'pained', facing: -1, L: 'hang', R: 'hang' }, [0.8, 0, 2.2], 35); break;
    case 'dolar': A('civD', { expr: 'smile', facing: 0, L: 'hip', R: 'thumb' }, [0.85, 0, -0.4], 36); break;
    case 'banco': A('juiz', { expr: 'smile', facing: -1, look: -0.4, L: 'hip', R: 'point' }, [0.2, 0, 0.3], 51); A('pobre', { expr: 'smile', facing: 1, look: 0.4, L: 'lift', R: 'hang' }, [-1.25, 0, 1.3], 11); break;
    case 'quanto': A('juiz', { expr: 'squint', facing: 0, L: 'temple', R: 'hip', headTilt: q(4 * Math.sin(f * 0.15), 1) }, [0, 0, 0.3], 51); break;
    case 'cents': A('juiz', { expr: 'grin', facing: 0, L: 'up', R: 'up' }, [0, 0, 0.3], 51); break;
    case 'virada': HOLD('pobre', 'shock', 11); break;
    case 'colec': { const C = [['civA', -0.85, 1.7, 33], ['civB', 0.85, 1.8, 35], ['civC', -0.35, 2.5, 34], ['velha', 0.45, 2.7, 37], ['civD', 0, 0.6, 36]];
      C.forEach(([who, x, z, seed], k) => A(who, { expr: k % 2 ? 'greedy' : 'grin', facing: x > 0 ? -1 : 1, L: 'up', R: 'up', bob: jump(k) }, [x, 0, z], seed)); break; }
    case 'vend': A('workB', { expr: 'grin', facing: 1, look: 0.4, L: 'hip', R: 'point', bob: jump() }, [2.15, 0, -3.5], 32); break;
    case 'fim': A('padeiro', { expr: 'shock', facing: 1, look: 0.3, L: 'cheek', R: 'hang' }, [-0.75, 0, 0.6], 21); A('pobre', { expr: 'laugh', facing: -1, look: -0.3, L: 'up', R: 'up', bob: jump() }, [0.75, 0, 0.6], 11); break;
    case 'capa': A('padeiro', { expr: 'angry', facing: 1, look: 0.4, L: 'cross', R: 'cross' }, [-0.7, 0, 1.3], 21); A('pobre', { expr: 'shock', facing: -1, look: -0.4, L: 'up', R: 'up' }, [0.65, 0, 1.0], 11); break;
    case 'cta': { const C = [['pobre', -2.6, 11], ['workA', -3.4, 31], ['velha', -4.9, 37], ['padeiro', -5.7, 21]];
      C.forEach(([who, x, seed], k) => A(who, { expr: 'laugh', facing: k % 2 ? -1 : 1, L: k % 2 ? 'wave' : 'belly', wv: q((f * 0.35 + k) % 6.283, 1), R: 'wave', bob: jump(k) }, [x, 0, 2.4 - (k % 2) * 0.8], seed)); break; }
  }
  return out;
};
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 5, ...extra });
export const fxAt = (f, T) => {
  const out = [];
  const burst = (a, pos, s = 0.9, n = 34) => { if (f >= a && f < a + n) { const t = q((f - a) / n, 1); out.push(FX('burst' + t, (p) => T.fxBurst(p, t), pos, s)); } };
  burst(1303, [0, 2.2, 1.1]); burst(1651, [0, 2.3, 1.1], 1.1); burst(462, [3.1, 1.5, -3.7], 0.7); burst(743, [0, 2.2, 1.1], 1.0);
  return out;
};
