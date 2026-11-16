// ================= MUNDO V5: Enem (6 palcos) =================
const DECK = 0;
const world = new THREE.Group(); scene.add(world);
const cv = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); return c; };
const wrapR = (c, rx_ = 1, ry_ = 1) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx_, ry_); t.anisotropy = 4; return t; };
const R_ = P.rng(5150);
const fxm = (m) => { m.userData.ndSkip = true; return m; };
const glowM = (c, o) => fxm(new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, fog: false, blending: THREE.AdditiveBlending, depthWrite: false }));
const floorTex = wrapR(cv(256, 256, (g, w, h) => { g.fillStyle = '#c9b48a'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(90,70,40,.35)'; g.lineWidth = 3; g.strokeRect(0, 0, w, h); for (let i = 0; i < 500; i++) { g.fillStyle = `rgba(${R_() < .5 ? '90,70,40' : '255,240,200'},${0.05 + R_() * 0.07})`; g.fillRect(R_() * w, R_() * h, 3, 3); } }), 60, 60);
const brickTex = wrapR(cv(256, 256, (g, w, h) => { g.fillStyle = '#a8483a'; g.fillRect(0, 0, w, h); for (let y = 0; y < 8; y++) for (let x = -1; x < 4; x++) { g.fillStyle = `hsl(${8 + R_() * 10},${45 + R_() * 12}%,${34 + R_() * 10}%)`; g.fillRect(x * 64 + (y % 2) * 32 + 2, y * 32 + 2, 60, 28); } }), 6, 6);
const Me = { floor: toon({ map: floorTex }), wall: toon({ color: '#e9e2cf' }), desk: toon({ color: '#9a6a3a' }), chair: toon({ color: '#3d5a8a' }), red: toon({ color: '#d9372c' }), brick: toon({ map: brickTex }), stone: toon({ color: '#d8d4c8' }), glass: toon({ color: '#8fd0ff' }), dark: toon({ color: '#1c2430' }), green: toon({ color: '#4a9a4a' }), grass: toon({ color: '#6fa24e' }), sky: toon({ color: '#cfe0ea' }), yellow: toon({ color: '#f1c232' }), white: toon({ color: '#f4f4f4' }), gold: toon({ color: '#d9a845' }), blue: toon({ color: '#2d6fbf' }), wood: toon({ color: '#8a5a34' }) };
const skinC = ['#f5c9a0', '#c99067', '#a8714d', '#eab58e']; const shirtC = ['#2d6fbf', '#d9372c', '#3fa05b', '#e5822b', '#8a4fb0', '#f1c232', '#1d9aa0'];
const person = (parent, x, y, z, col) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); add(new THREE.CylinderGeometry(0.28, 0.34, 0.9, 10), toon({ color: col }), 0, 0.5, 0, g); add(new THREE.SphereGeometry(0.28, 12, 10), toon({ color: skinC[(R_() * 4) | 0] }), 0, 1.15, 0, g); return g; };
// ---------- PALCO A: sala com 100 carteiras ----------
const A = new THREE.Group(); world.add(A);
const slots = [];
{ add(box(120, 0.4, 120), Me.floor, 0, -0.2, 0, A); add(box(120, 18, 1), Me.wall, 0, 9, -60, A); add(box(1, 18, 120), Me.wall, -60, 9, 0, A); add(box(1, 18, 120), Me.wall, 60, 9, 0, A);
  for (let i = 0; i < 6; i++) add(box(6, 6, 0.4), Me.glass, -40 + i * 16, 11, -59.4, A);
  const empties = new Set(); const order = []; for (let i = 0; i < 100; i++) order.push(i); for (let i = order.length - 1; i > 0; i--) { const j = (R_() * (i + 1)) | 0;[order[i], order[j]] = [order[j], order[i]]; } order.slice(0, 32).forEach((v, k) => empties.add(v));
  const rank = {}; order.slice(0, 32).forEach((v, k) => { rank[v] = k; });
  for (let r = 0; r < 10; r++) for (let c = 0; c < 10; c++) { const i = r * 10 + c, x = -36 + c * 8, z = -40 + r * 8; add(box(3, 0.2, 2.2), Me.desk, x, 1.6, z, A); add(box(0.2, 1.6, 0.2), Me.dark, x - 1.3, 0.8, z, A); add(box(0.2, 1.6, 0.2), Me.dark, x + 1.3, 0.8, z, A); add(box(1.8, 0.2, 1.8), Me.chair, x, 1.0, z + 2, A); add(box(1.8, 1.4, 0.2), Me.chair, x, 1.8, z + 2.9, A);
    const p = person(A, x, 0.9, z + 1.9, shirtC[(R_() * 7) | 0]); const ring = add(new THREE.RingGeometry(1.6, 2.4, 24), glowM('#ff3b3b', 0.0), x, 0.12, z + 1.6, A, { cast: false }); ring.rotation.x = -Math.PI / 2; ring.userData.ndSkip = true; slots.push({ p, ring, empty: empties.has(i), rank: rank[i] ?? -1 }); } }
// ---------- PALCO B: duas placas de 100 pontos ----------
const B = new THREE.Group(); B.position.set(6000, 0, 0); world.add(B);
const boards = [[], []];
{ const g = add(new THREE.PlaneGeometry(1500, 1500), toon({ color: '#2b3a55' }), 0, 0, 0, B, { cast: false }); g.rotation.x = -Math.PI / 2; for (let i = 0; i < 12; i++) add(new THREE.CylinderGeometry(1, 1.4, 3 + R_() * 4, 6), toon({ color: '#3b4c6c' }), -300 + R_() * 600, 2, -120 - R_() * 200, B);
  [-26, 26].forEach((bx, bi) => { add(box(44, 44, 1.6), Me.dark, bx, 26, 0, B); add(box(2, 8, 2), Me.dark, bx - 14, 4, -1, B); add(box(2, 8, 2), Me.dark, bx + 14, 4, -1, B);
    for (let k = 0; k < 100; k++) { const c = k % 10, r = (k / 10) | 0; const m = new THREE.MeshBasicMaterial({ color: '#3a4560' }); const d = add(new THREE.CylinderGeometry(1.4, 1.4, 0.6, 14), m, bx - 18 + c * 4, 44 - r * 4, 1, B, { cast: false }); d.rotation.x = Math.PI / 2; boards[bi].push(m); } }); }
// ---------- PALCO C: portão da universidade ----------
const C = new THREE.Group(); C.position.set(-6000, 0, 0); world.add(C);
const gateL = new THREE.Group(), gateR = new THREE.Group();
{ const g = add(new THREE.PlaneGeometry(2000, 2000), Me.grass, 0, 0, 0, C, { cast: false }); g.rotation.x = -Math.PI / 2; add(box(80, 20, 28), Me.stone, 0, 10, -30, C); add(box(90, 2, 34), Me.stone, 0, 21, -30, C); const pd = add(new THREE.ConeGeometry(48, 12, 4), Me.stone, 0, 28, -30, C); pd.rotation.y = 0.78; pd.scale.set(1, 1, 0.45);
  for (let i = 0; i < 7; i++) add(new THREE.CylinderGeometry(1.5, 1.7, 20, 12), Me.white, -30 + i * 10, 10, -14, C); for (let i = 0; i < 6; i++) add(box(90 - i * 2, 1, 6), Me.stone, 0, 0.5 + i * 0.5, -10 + i * 3.5, C);
  const gl = add(box(22, 14, 1), new THREE.MeshBasicMaterial({ color: '#fff2c0', fog: false }), 0, 8, -15.6, C, { cast: false }); gl.userData.ndSkip = true; C.userData.glow = gl;
  gateL.position.set(-11, 0, -14.5); gateR.position.set(11, 0, -14.5); C.add(gateL); C.add(gateR); add(box(11, 14, 1), Me.wood, 5.5, 8, 0, gateL); add(box(11, 14, 1), Me.wood, -5.5, 8, 0, gateR);
  for (let i = 0; i < 12; i++) { const a = R_() * 6.283, d = 60 + R_() * 120; add(new THREE.CylinderGeometry(0.5, 0.6, 5, 6), toon({ color: '#5a3a24' }), Math.cos(a) * d, 2.5, Math.sin(a) * d + 20, C); add(new THREE.SphereGeometry(4, 10, 8), Me.green, Math.cos(a) * d, 7, Math.sin(a) * d + 20, C); } }
// ---------- PALCO D: inscrição automática (esteira) ----------
const D = new THREE.Group(); D.position.set(0, 0, 6000); world.add(D);
const belt = [];
{ add(box(260, 0.4, 120), toon({ color: '#d5d9df' }), 0, -0.2, 0, D); add(box(40, 22, 30), Me.brick, -70, 11, -20, D); add(new THREE.ConeGeometry(30, 9, 4), toon({ color: '#7a3a2a' }), -70, 26, -20, D).rotation.y = 0.78; add(box(6, 9, 1), Me.wood, -70, 4.5, -4.6, D); for (let i = 0; i < 4; i++) add(box(4, 4, 0.6), Me.glass, -84 + i * 9, 14, -4.6, D);
  add(box(120, 1.4, 8), toon({ color: '#444a54' }), 0, 0.8, 14, D); for (let i = 0; i < 24; i++) add(box(0.6, 1.5, 8.4), toon({ color: '#2a2e36' }), -58 + i * 5, 1, 14, D);
  add(box(36, 28, 30), toon({ color: '#2a3b5a' }), 90, 14, 0, D); for (let i = 0; i < 6; i++) add(box(30, 1.2, 0.6), new THREE.MeshBasicMaterial({ color: i % 2 ? '#3dd68c' : '#6fe6ff' }), 90, 5 + i * 4, 15.4, D, { cast: false }); const chk = add(new THREE.RingGeometry(5, 7, 24), new THREE.MeshBasicMaterial({ color: '#3dd68c', fog: false }), 90, 30, 15.5, D, { cast: false }); D.userData.chk = chk;
  for (let i = 0; i < 14; i++) belt.push(person(D, 0, 1.5, 14, shirtC[i % 7])); }
// ---------- PALCO E: escada ----------
const E_ = new THREE.Group(); E_.position.set(0, 0, -6000); world.add(E_);
const steps = []; const climbers = [];
{ const g = add(new THREE.PlaneGeometry(1500, 1500), toon({ color: '#9ec5e8' }), 0, 0, 0, E_, { cast: false }); g.rotation.x = -Math.PI / 2; for (let i = 0; i < 10; i++) add(new THREE.SphereGeometry(40 + R_() * 40, 10, 8), toon({ color: '#d8e6f2' }), -300 + R_() * 600, -10, -300 - R_() * 200, E_).scale.y = 0.4;
  for (let i = 0; i < 12; i++) { const s = add(box(8, 1, 14), i % 2 ? Me.stone : Me.white, -44 + i * 8, 0.5, 0, E_); steps.push(s); }
  for (let i = 0; i < 6; i++) climbers.push(person(E_, -40 + i * 12, 0, 0, shirtC[i])); const fl = add(box(0.4, 16, 0.4), Me.dark, 52, 8, 0, E_); add(box(9, 5, 0.3), Me.red, 56.5, 14, 0, E_); }
// ---------- PALCO F: cadeira vazia + porta ----------
const F = new THREE.Group(); F.position.set(12000, 0, 0); world.add(F);
const tiles = [];
{ const g = add(new THREE.PlaneGeometry(600, 600), toon({ color: '#14181f' }), 0, 0, 0, F, { cast: false }); g.rotation.x = -Math.PI / 2; add(box(3, 0.2, 2.2), Me.desk, 0, 1.6, 0, F); add(box(0.2, 1.6, 0.2), Me.dark, -1.3, 0.8, 0, F); add(box(0.2, 1.6, 0.2), Me.dark, 1.3, 0.8, 0, F); add(box(1.8, 0.2, 1.8), Me.chair, 0, 1.0, 2, F); add(box(1.8, 1.4, 0.2), Me.chair, 0, 1.8, 2.9, F); add(box(0.2, 1, 0.2), Me.dark, -0.7, 0.5, 1.4, F); add(box(0.2, 1, 0.2), Me.dark, 0.7, 0.5, 1.4, F);
  const cone = add(new THREE.ConeGeometry(8, 30, 24, 1, true), glowM('#fff3c4', 0.22), 0, 15, 2, F, { cast: false }); cone.userData.ndSkip = true; F.userData.cone = cone;
  add(box(8, 14, 0.8), Me.dark, 0, 7, -60, F); const door = add(box(5.4, 11, 0.4), new THREE.MeshBasicMaterial({ color: '#fff6d0', fog: false }), 0, 6, -59.5, F, { cast: false }); door.userData.ndSkip = true; F.userData.door = door; add(new THREE.SphereGeometry(5, 12, 10), glowM('#fff3c4', 0.2), 0, 6, -58.6, F, { cast: false }).userData.ndSkip = true;
  for (let i = 0; i < 12; i++) { const t = add(box(3, 0.1, 3), new THREE.MeshBasicMaterial({ color: '#3a3f4a' }), (i % 2 ? 1 : -1) * 1.2, 0.08, -8 - i * 4, F, { cast: false }); tiles.push(t); }
  const dust = []; for (let i = 0; i < 60; i++) { const m = add(new THREE.SphereGeometry(0.08, 4, 3), fxm(new THREE.MeshBasicMaterial({ color: '#fff8d8', fog: false })), (R_() - .5) * 8, R_() * 18, 2 + (R_() - .5) * 8, F, { cast: false }); dust.push({ m, x: (R_() - .5) * 8, y: R_() * 18, z: 2 + (R_() - .5) * 8, s: 0.01 + R_() * 0.03, ph: R_() * 6 }); F.userData.dust = dust; } }
const stages = { A, B, C, D, E: E_, F };
const OFF = { A: [0, 0, 0], B: [6000, 0, 0], C: [-6000, 0, 0], D: [0, 0, 6000], E: [0, 0, -6000], F: [12000, 0, 0] };
const clouds = [];
