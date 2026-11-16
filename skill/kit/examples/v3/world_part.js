// ================= MUNDO V3: céu da madrugada (7 palcos) =================
const DECK = 0;
const world = new THREE.Group(); scene.add(world);
const cv = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); return c; };
const wrapR = (c, rx_ = 1, ry_ = 1) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx_, ry_); t.anisotropy = 4; return t; };
const R_ = P.rng(2718);
const planetTex = (kind) => { const t = new THREE.CanvasTexture(cv(512, 256, (g, w, h) => { if (kind === 'mars') { g.fillStyle = '#c1502b'; g.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(${R_() < .5 ? '90,30,15' : '240,150,90'},${0.15 + R_() * 0.3})`; g.beginPath(); g.ellipse(R_() * w, R_() * h, 10 + R_() * 40, 6 + R_() * 20, R_() * 3, 0, 7); g.fill(); } g.fillStyle = '#f3ece6'; g.fillRect(0, 0, w, 16); }
  else if (kind === 'jup') { for (let i = 0; i < 14; i++) { g.fillStyle = ['#d9b48a', '#a9744b', '#efe0c4', '#c69062', '#8f5a38'][i % 5]; g.fillRect(0, i * (h / 14), w, h / 14 + 1); } g.fillStyle = '#b04a2a'; g.beginPath(); g.ellipse(340, 160, 38, 20, 0, 0, 7); g.fill(); }
  else if (kind === 'ven') { g.fillStyle = '#f2dfa8'; g.fillRect(0, 0, w, h); for (let i = 0; i < 60; i++) { g.strokeStyle = `rgba(255,255,255,${0.2 + R_() * 0.4})`; g.lineWidth = 5 + R_() * 12; g.beginPath(); g.moveTo(R_() * w, R_() * h); g.quadraticCurveTo(R_() * w, R_() * h, R_() * w, R_() * h); g.stroke(); } }
  else if (kind === 'mer') { g.fillStyle = '#9a9690'; g.fillRect(0, 0, w, h); for (let i = 0; i < 90; i++) { g.fillStyle = `rgba(40,38,36,${0.2 + R_() * 0.3})`; g.beginPath(); g.arc(R_() * w, R_() * h, 4 + R_() * 14, 0, 7); g.fill(); } }
  else if (kind === 'earth') { g.fillStyle = '#1f5fb0'; g.fillRect(0, 0, w, h); for (let i = 0; i < 9; i++) { g.fillStyle = '#3d8a4d'; g.beginPath(); g.ellipse(R_() * w, 30 + R_() * 190, 20 + R_() * 50, 14 + R_() * 30, R_() * 3, 0, 7); g.fill(); } } })); t.colorSpace = THREE.SRGBColorSpace; return t; };
const planetMat = (k) => new THREE.MeshBasicMaterial({ map: planetTex(k), fog: false });
const halo = (c, o) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, fog: false, blending: THREE.AdditiveBlending, depthWrite: false });
const fxm = (m) => { m.userData.ndSkip = true; return m; };
const winTex = (lit) => wrapR(cv(128, 128, (g, w, h) => { g.fillStyle = lit ? '#1a2030' : '#9fb4c4'; g.fillRect(0, 0, w, h); for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = lit && R_() < .6 ? '#ffd88a' : (lit ? '#2a3142' : '#5f7d96'); g.fillRect(x * 32 + 6, y * 32 + 7, 20, 18); } }), 1, 1);
const Mw = { grass: toon({ color: '#33503a' }), hill: toon({ color: '#2a4430' }), dark: toon({ color: '#1c2430' }), conc: toon({ color: '#9a9690' }), win: new THREE.MeshBasicMaterial({ map: winTex(true), fog: true }), winD: toon({ map: winTex(false) }), wood: toon({ color: '#8a5a34' }), cloth: toon({ color: '#5a7ab8' }), pillow: toon({ color: '#f1f1f1' }), wall: toon({ color: '#d8cdb8' }), floor: toon({ color: '#8a6a48' }), red: toon({ color: '#d9372c' }), gold: toon({ color: '#f1c232' }), glow: new THREE.MeshBasicMaterial({ color: '#fff3c4', fog: true }), street: toon({ color: '#3b3e45' }), tent: toon({ color: '#e67e22' }), trunk: toon({ color: '#3a2a20' }), leaf: toon({ color: '#1f3a28' }), railing: toon({ color: '#b8bcc4' }) };
// ---------- PALCO A: colina de observação ----------
const A = new THREE.Group(); world.add(A);
{ const g = add(new THREE.PlaneGeometry(4000, 4000), Mw.grass, 0, 0, 0, A, { cast: false }); g.rotation.x = -Math.PI / 2;
  const h1 = add(new THREE.SphereGeometry(60, 24, 12), Mw.hill, 0, -42, 0, A); h1.scale.y = 0.5;
  for (const [x, z, s] of [[-120, -200, 90], [180, -260, 120], [-300, 80, 100], [320, 120, 110], [0, 380, 130]]) add(new THREE.SphereGeometry(s, 16, 8), Mw.hill, x, -s * 0.55, z, A).scale.y = 0.5;
  for (let i = 0; i < 24; i++) { const a = R_() * 6.283, d = 30 + R_() * 120; const x = Math.cos(a) * d, z = Math.sin(a) * d; add(new THREE.CylinderGeometry(0.4, 0.5, 4, 6), Mw.trunk, x, 2, z, A); add(new THREE.ConeGeometry(2.8, 7, 7), Mw.leaf, x, 7.5, z, A); }
  // luzes de cidade longe (oeste)
  for (let i = 0; i < 60; i++) add(new THREE.BoxGeometry(2 + R_() * 4, 3 + R_() * 14, 2 + R_() * 4), R_() < 0.5 ? Mw.win : Mw.dark, -300 + R_() * 600, 3, -520 - R_() * 100, A);
  add(new THREE.CylinderGeometry(0.15, 0.15, 1.5, 6), Mw.dark, 1.2, 0.8, 0.6, A); }
const stars = (n, r) => { const p = []; for (let i = 0; i < n; i++) { const a = R_() * 6.283, b = Math.acos(R_()); p.push(r * Math.sin(b) * Math.cos(a), r * Math.cos(b), r * Math.sin(b) * Math.sin(a)); } const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); return new THREE.Points(gg, new THREE.PointsMaterial({ color: '#ffffff', size: 2.6, sizeAttenuation: false, fog: false })); };
A.add(stars(1400, 900));
const DOME = 700, dirOf = (az, alt) => [Math.sin(az * Math.PI / 180) * Math.cos(alt * Math.PI / 180), Math.sin(alt * Math.PI / 180), -Math.cos(az * Math.PI / 180) * Math.cos(alt * Math.PI / 180)];
// planetas no céu (az 0 = -z). Leste = +x
const SKY = { mer: [88, 7, 3.6], ven: [100, 17, 7], mar: [116.5, 29, 4.2], jup: [120.3, 29.6, 5.6] };
const skyP = {}; for (const [k, v] of Object.entries(SKY)) { const g = new THREE.Group(); const m = add(new THREE.SphereGeometry(1, 20, 14), planetMat({ mer: 'mer', ven: 'ven', mar: 'mars', jup: 'jup' }[k]), 0, 0, 0, g, { cast: false }); m.userData.ndSkip = true; const h1 = add(new THREE.SphereGeometry(2.6, 16, 12), fxm(halo(k === 'ven' ? '#fff4c8' : k === 'mar' ? '#ff9a6a' : '#ffe2b0', k === 'ven' ? 0.38 : 0.22)), 0, 0, 0, g, { cast: false }); const d = dirOf(v[0], v[1]); g.position.set(d[0] * DOME, d[1] * DOME, d[2] * DOME); g.scale.setScalar(v[2] * 1.5); skyP[k] = g; A.add(g); }
const skyPos = (k) => { const v = SKY[k], d = dirOf(v[0], v[1]); return [d[0] * DOME, d[1] * DOME, d[2] * DOME]; };
// ---------- PALCO B: sistema solar (órreri) ----------
const B = new THREE.Group(); B.position.set(6000, 0, 0); world.add(B);
B.add(stars(1600, 1200));
const sunB = add(new THREE.SphereGeometry(16, 24, 16), new THREE.MeshBasicMaterial({ color: '#ffd23f', fog: false }), 0, 0, 0, B, { cast: false }); sunB.userData.ndSkip = true; add(new THREE.SphereGeometry(26, 20, 14), fxm(halo('#ffae3a', 0.28)), 0, 0, 0, B, { cast: false });
const ORB = [['mer', 40, 4, 4.15, 'mer', '#bdb7ae'], ['ven', 66, 7, 1.62, 'ven', '#f0d9a0'], ['ear', 96, 7.5, 1, 'earth', '#5aa0ff'], ['mar', 132, 5.5, 0.53, 'mars', '#ff8a5a'], ['jup', 210, 14, 0.084, 'jup', '#e8c9a0']];
const orbP = {}; ORB.forEach(([k, r, s, sp, tx, col], i) => { const ring = add(new THREE.TorusGeometry(r, 0.35, 6, 120), fxm(new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.55, fog: false })), 0, 0, 0, B, { cast: false }); ring.rotation.x = Math.PI / 2; const m = add(new THREE.SphereGeometry(s * 1.7, 18, 12), planetMat(tx), 0, 0, 0, B, { cast: false }); m.userData.ndSkip = true; orbP[k] = { m, r, sp, ph: 0.6 + i * 1.7 }; });
const disc = add(new THREE.CircleGeometry(250, 64), fxm(new THREE.MeshBasicMaterial({ color: '#4aa8ff', transparent: true, opacity: 0.0, side: THREE.DoubleSide, fog: false, depthWrite: false })), 0, 0, 0, B, { cast: false }); disc.rotation.x = -Math.PI / 2;
// ---------- PALCO C: Marte e Júpiter de perto ----------
const C = new THREE.Group(); C.position.set(-6000, 0, 0); world.add(C);
C.add(stars(1600, 1200));
const cMars = add(new THREE.SphereGeometry(10, 28, 20), planetMat('mars'), 0, 0, 0, C, { cast: false }); cMars.userData.ndSkip = true; const cMarsH = add(new THREE.SphereGeometry(15, 20, 14), fxm(halo('#ff7a4a', 0.2)), 0, 0, 0, C, { cast: false });
const cJup = add(new THREE.SphereGeometry(16, 28, 20), planetMat('jup'), 0, 0, 0, C, { cast: false }); cJup.userData.ndSkip = true; const cJupH = add(new THREE.SphereGeometry(23, 20, 14), fxm(halo('#ffe2b0', 0.18)), 0, 0, 0, C, { cast: false });
const arc = add(box(1, 0.6, 0.6), fxm(new THREE.MeshBasicMaterial({ color: '#01FBB4', fog: false })), 0, -30, 0, C, { cast: false });
// ---------- PALCO D: cânion de prédios ----------
const D = new THREE.Group(); D.position.set(0, 0, 6000); world.add(D);
{ const g = add(new THREE.PlaneGeometry(400, 800), Mw.street, 0, 0.02, -200, D, { cast: false }); g.rotation.x = -Math.PI / 2; for (let i = 0; i < 16; i++) add(box(0.3, 0.02, 3), Mw.gold, 0, 0.06, -i * 14, D, { cast: false });
  for (const s of [-1, 1]) for (let i = 0; i < 18; i++) { const h = 40 + R_() * 90, w = 14 + R_() * 10; const m = add(new THREE.BoxGeometry(w, h, w), i % 3 ? Mw.win : Mw.winD, s * (14 + w / 2 + R_() * 4), h / 2, -i * 20 + 10, D); }
  D.add(stars(500, 900)); }
// ---------- PALCO E: campo de meteoros ----------
const E_ = new THREE.Group(); E_.position.set(0, 0, -6000); world.add(E_);
{ const g = add(new THREE.PlaneGeometry(4000, 4000), Mw.grass, 0, 0, 0, E_, { cast: false }); g.rotation.x = -Math.PI / 2; E_.add(stars(2200, 900));
  for (let i = 0; i < 40; i++) { const a = R_() * 6.283, d = 40 + R_() * 200; add(new THREE.CylinderGeometry(0.5, 0.6, 5, 6), Mw.trunk, Math.cos(a) * d, 2.5, Math.sin(a) * d, E_); add(new THREE.ConeGeometry(3.4, 9, 7), Mw.leaf, Math.cos(a) * d, 9, Math.sin(a) * d, E_); }
  const tent = add(new THREE.ConeGeometry(4.5, 4, 4), Mw.tent, 10, 2, -4, E_); tent.rotation.y = 0.78;
  const fire = add(new THREE.SphereGeometry(0.7, 8, 6), new THREE.MeshBasicMaterial({ color: '#ffb347' }), 5, 0.6, 2, E_, { cast: false }); }
const meteors = []; for (let i = 0; i < 30; i++) { const m = add(box(60, 1.6, 1.6), fxm(new THREE.MeshBasicMaterial({ color: '#d8f0ff', transparent: true, opacity: 0.9, fog: false })), 0, 0, 0, E_, { cast: false }); meteors.push({ m, a: R_() * 6.283, el: 25 + R_() * 50, t0: R_() * 80, len: 40 + R_() * 90 }); }
// ---------- PALCO F: quarto ----------
const F = new THREE.Group(); F.position.set(12000, 0, 0); world.add(F);
const clockG = new THREE.Group(); F.add(clockG);
{ add(box(8, 0.3, 8), Mw.floor, 0, 0, 0, F); add(box(8, 4, 0.3), Mw.wall, 0, 2, -4, F); add(box(0.3, 4, 8), Mw.wall, -4, 2, 0, F); add(box(0.3, 4, 8), Mw.wall, 4, 2, 0, F);
  add(box(3.4, 0.5, 2.2), Mw.wood, -1.6, 0.4, -2.6, F); add(box(3.2, 0.5, 2), Mw.cloth, -1.6, 0.9, -2.6, F); add(box(1, 0.3, 1.4), Mw.pillow, -2.8, 1.25, -2.6, F);
  const win = add(box(2.4, 1.8, 0.1), new THREE.MeshBasicMaterial({ color: '#2a2f6a', fog: false }), 2.2, 2.4, -3.85, F, { cast: false }); add(box(0.08, 1.8, 0.14), Mw.wood, 2.2, 2.4, -3.82, F); add(box(2.4, 0.08, 0.14), Mw.wood, 2.2, 2.4, -3.82, F);
  for (const [x, y] of [[1.6, 2.9], [2.5, 2.1], [2.9, 3.1]]) add(new THREE.SphereGeometry(0.05, 6, 6), new THREE.MeshBasicMaterial({ color: '#fff' }), x, y, -3.76, F, { cast: false });
  add(box(1.3, 1, 1.2), Mw.wood, 1.6, 0.5, -3, F);
  const bd = add(new THREE.CylinderGeometry(0.42, 0.42, 0.34, 20), Mw.red, 0, 0, 0, clockG); bd.rotation.x = Math.PI / 2; const fc = add(new THREE.CylinderGeometry(0.36, 0.36, 0.06, 20), Mw.pillow, 0, 0, 0.18, clockG); fc.rotation.x = Math.PI / 2;
  for (const s of [-1, 1]) add(new THREE.SphereGeometry(0.16, 10, 8), Mw.gold, s * 0.3, 0.42, 0, clockG); const h1 = add(box(0.04, 0.26, 0.03), Mw.dark, 0, 0.1, 0.23, clockG); clockG.userData.h = h1; clockG.position.set(1.6, 1.4, -3); }
// ---------- PALCO G: varanda ----------
const G = new THREE.Group(); G.position.set(0, 0, -12000); world.add(G);
{ add(tbox(14, 0.4, 7, 3), Mw.conc, 0, -0.2, 0, G); for (let i = 0; i <= 14; i++) add(box(0.1, 1.1, 0.1), Mw.railing, -7 + i, 0.55, 3.4, G); add(box(14, 0.12, 0.14), Mw.railing, 0, 1.1, 3.4, G);
  for (let i = 0; i < 70; i++) { const h = 8 + R_() * 60, w = 5 + R_() * 8; add(new THREE.BoxGeometry(w, h, w), R_() < .75 ? Mw.win : Mw.dark, -90 + R_() * 180, h / 2 - 12, 30 + R_() * 160, G); }
  G.add(stars(1800, 900)); const moon = add(new THREE.SphereGeometry(18, 20, 14), new THREE.MeshBasicMaterial({ color: '#f4f1e4', fog: false }), -80, 90, -300, G, { cast: false }); moon.userData.ndSkip = true; add(new THREE.SphereGeometry(30, 16, 12), fxm(halo('#cfe0ff', 0.12)), -80, 90, -300, G, { cast: false }); }
const stages = { A, B, C, D, E: E_, F, G };
const OFF = { A: [0, 0, 0], B: [6000, 0, 0], C: [-6000, 0, 0], D: [0, 0, 6000], E: [0, 0, -6000], F: [12000, 0, 0], G: [0, 0, -12000] };
const clouds = [];
