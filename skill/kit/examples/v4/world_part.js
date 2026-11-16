// ================= MUNDO V4: El Niño (8 palcos) =================
const DECK = 0;
const world = new THREE.Group(); scene.add(world);
const cv = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); return c; };
const wrapR = (c, rx_ = 1, ry_ = 1) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx_, ry_); t.anisotropy = 4; return t; };
const R_ = P.rng(4242);
const fxm = (m) => { m.userData.ndSkip = true; return m; };
const glowM = (c, o) => fxm(new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, fog: false, blending: THREE.AdditiveBlending, depthWrite: false }));
const seaTex = wrapR(cv(512, 512, (g, w, h) => { g.fillStyle = '#1b6aa5'; g.fillRect(0, 0, w, h); for (let i = 0; i < 380; i++) { const x = R_() * w, y = R_() * h, l = 20 + R_() * 60; g.strokeStyle = `rgba(${R_() < .6 ? '190,230,255' : '8,50,90'},${0.18 + R_() * 0.25})`; g.lineWidth = 2 + R_() * 3; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l / 2, y - 6, x + l, y); g.stroke(); } }), 260, 260);
const crackTex = wrapR(cv(256, 256, (g, w, h) => { g.fillStyle = '#b98a54'; g.fillRect(0, 0, w, h); g.strokeStyle = '#6a4424'; g.lineWidth = 3; for (let i = 0; i < 40; i++) { let x = R_() * w, y = R_() * h; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (R_() - .5) * 60; y += (R_() - .5) * 60; g.lineTo(x, y); } g.stroke(); } }), 30, 30);
const winTex = wrapR(cv(128, 128, (g, w, h) => { g.fillStyle = '#9fb4c4'; g.fillRect(0, 0, w, h); for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = '#5f7d96'; g.fillRect(x * 32 + 6, y * 32 + 7, 20, 18); } }), 1, 1);
const Mq = { sea: toon({ map: seaTex }), wood: toon({ color: '#8a5a34' }), white: toon({ color: '#f3f4f6' }), red: toon({ color: '#d9372c' }), steel: toon({ color: '#aeb6bf' }), dark: toon({ color: '#2a2d33' }),
  grass: toon({ color: '#5f9a46' }), dry: toon({ map: crackTex }), snow: toon({ color: '#f4f8ff' }), roof: toon({ color: '#7a3a2a' }), wall: toon({ color: '#d8c8a8' }), pine: toon({ color: '#2f5a3a' }), trunk: toon({ color: '#5a3a24' }),
  glass: toon({ color: '#9fd6ff' }), cloud: new THREE.MeshBasicMaterial({ color: '#f6f8ff', fog: false }), cloudD: new THREE.MeshBasicMaterial({ color: '#7d8798', fog: false }), rain: fxm(new THREE.MeshBasicMaterial({ color: '#9fd0ff', transparent: true, opacity: 0.7, fog: false })),
  wheat: toon({ color: '#e8c24a' }), silo: toon({ color: '#c9ccd2' }), conc: toon({ color: '#9a9690' }), win: toon({ map: winTex }), gold: toon({ color: '#f1c232' }), blue: toon({ color: '#2d6fbf' }), green: toon({ color: '#3fa05b' }), table: toon({ color: '#2f6b4a' }) };
// ---------- PALCO A: oceano quente + píer ----------
const A = new THREE.Group(); world.add(A);
const seaA = add(new THREE.PlaneGeometry(6000, 6000), Mq.sea, 0, 0, 0, A, { cast: false }); seaA.rotation.x = -Math.PI / 2;
const warmA = add(new THREE.CircleGeometry(1, 48), glowM('#ff5a1f', 0.0), 0, 0.15, -60, A, { cast: false }); warmA.rotation.x = -Math.PI / 2; warmA.userData.ndSkip = true;
{ add(box(6, 0.5, 90), Mq.wood, 0, 3, 20, A); for (let i = 0; i < 12; i++) for (const s of [-1, 1]) add(new THREE.CylinderGeometry(0.35, 0.4, 6, 8), Mq.wood, s * 2.6, 0, -20 + i * 7.5, A); add(box(0.2, 1.1, 90), Mq.white, 3, 3.9, 20, A); add(box(0.2, 1.1, 90), Mq.white, -3, 3.9, 20, A);
  for (let i = 0; i < 8; i++) add(new THREE.ConeGeometry(30 + R_() * 40, 50 + R_() * 60, 9), toon({ color: '#3d6a52' }), -700 + i * 200, 20, -1300 - R_() * 400, A); }
const buoy = new THREE.Group(); buoy.position.set(12, 0, -30); A.add(buoy);
{ add(new THREE.CylinderGeometry(1.6, 2.2, 1.4, 14), Mq.red, 0, 0.3, 0, buoy); add(new THREE.CylinderGeometry(0.12, 0.12, 14, 8), Mq.steel, 0, 8, 0, buoy);
  const tube = add(new THREE.CylinderGeometry(0.6, 0.6, 12, 12), Mq.glass, 0, 8, 0, buoy); buoy.userData.tube = tube; const mer = add(new THREE.CylinderGeometry(0.4, 0.4, 1, 12), new THREE.MeshBasicMaterial({ color: '#ff3b1f', fog: false }), 0, 3, 0, buoy); mer.userData.ndSkip = true; buoy.userData.mer = mer; add(new THREE.SphereGeometry(1.1, 12, 10), new THREE.MeshBasicMaterial({ color: '#ff3b1f' }), 0, 1.6, 0, buoy); }
const windArr = []; for (let i = 0; i < 8; i++) { const g = new THREE.Group(); const sh = add(box(10, 0.5, 0.5), fxm(new THREE.MeshBasicMaterial({ color: '#e8f6ff', transparent: true, opacity: 0.85, fog: false })), 0, 0, 0, g, { cast: false }); const hd = add(new THREE.ConeGeometry(1.1, 2.4, 8), sh.material, -5.8, 0, 0, g, { cast: false }); hd.rotation.z = Math.PI / 2; A.add(g); windArr.push(g); }
// ---------- PALCO B: órbita (satélite NOAA) ----------
const B = new THREE.Group(); B.position.set(6000, 0, 0); world.add(B);
{ const pts = []; for (let i = 0; i < 1500; i++) { const a = R_() * 6.283, b = Math.acos(2 * R_() - 1), r = 900; pts.push(r * Math.sin(b) * Math.cos(a), r * Math.cos(b), r * Math.sin(b) * Math.sin(a)); } const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); B.add(new THREE.Points(gg, new THREE.PointsMaterial({ color: '#fff', size: 3, sizeAttenuation: false, fog: false })));
  const et = new THREE.CanvasTexture(cv(1024, 512, (g, w, h) => { g.fillStyle = '#0d4c9a'; g.fillRect(0, 0, w, h); for (let k = 0; k < 10; k++) { g.fillStyle = k % 2 ? '#2f7a43' : '#9c8a4a'; g.beginPath(); const cx = R_() * w, cy = 90 + R_() * 330; g.moveTo(cx, cy); for (let i = 0; i < 9; i++) { const a = i / 9 * 6.283, rad = 30 + R_() * 90; g.lineTo(cx + Math.cos(a) * rad * 1.5, cy + Math.sin(a) * rad); } g.closePath(); g.fill(); }
    const gr = g.createRadialGradient(330, 260, 10, 330, 260, 190); gr.addColorStop(0, 'rgba(255,60,20,.85)'); gr.addColorStop(0.5, 'rgba(255,150,40,.5)'); gr.addColorStop(1, 'rgba(255,200,60,0)'); g.fillStyle = gr; g.fillRect(100, 40, 460, 440); for (let i = 0; i < 120; i++) { g.strokeStyle = 'rgba(255,255,255,.3)'; g.lineWidth = 3 + R_() * 6; g.beginPath(); const x = R_() * w, y = R_() * h; g.moveTo(x, y); g.quadraticCurveTo(x + 40, y - 12, x + 100, y); g.stroke(); } })); et.colorSpace = THREE.SRGBColorSpace;
  const earth = add(new THREE.SphereGeometry(700, 48, 32), new THREE.MeshBasicMaterial({ map: et, fog: false }), 0, -780, 0, B, { cast: false }); earth.rotation.y = -1.45; earth.userData.ndSkip = true; B.userData.earth = earth;
  add(new THREE.SphereGeometry(716, 32, 24), glowM('#58a8ff', 0.25), 0, -780, 0, B, { cast: false }).material.side = THREE.BackSide; }
const sat = new THREE.Group(); { add(box(3, 3, 5), toon({ color: '#d9c25a' }), 0, 0, 0, sat); for (const s of [-1, 1]) add(box(9, 0.15, 3.6), toon({ color: '#2a3f8f' }), s * 6.4, 0, 0, sat); add(new THREE.CylinderGeometry(1.2, 0.3, 2, 10), Mq.white, 0, 0, -3.4, sat).rotation.x = Math.PI / 2; } B.add(sat);
// ---------- PALCO C: corte do Pacífico ----------
const C = new THREE.Group(); C.position.set(-6000, 0, 0); world.add(C);
const warmL = []; { for (const [x, col] of [[-110, '#8d7a55'], [110, '#4f8a4a']]) add(tbox(40, 30, 40, 8), toon({ color: col }), x, 8, 0, C);
  const cold = add(box(180, 30, 40), toon({ color: '#1a4f8f' }), 0, -2, 0, C); cold.material.transparent = true; cold.material.opacity = 0.85;
  const wm = new THREE.MeshBasicMaterial({ color: '#ff6a2a', transparent: true, opacity: 0.8, fog: false }); wm.userData.ndSkip = true; const warm = add(box(1, 8, 40), wm, 0, 14, 0, C, { cast: false }); warm.userData.ndSkip = true; C.userData.warm = warm;
  const ed = add(box(0.5, 60, 0.5), fxm(new THREE.MeshBasicMaterial({ color: '#fff', fog: false })), 0, 14, 21, C, { cast: false }); C.userData.eq = ed;
  const skyP = add(new THREE.PlaneGeometry(600, 160), new THREE.MeshBasicMaterial({ color: '#7fb8ef', fog: false }), 0, 70, -30, C, { cast: false }); skyP.userData.ndSkip = true; }
const windC = []; for (let i = 0; i < 6; i++) { const g = new THREE.Group(); const sh = add(box(26, 1.2, 1.2), fxm(new THREE.MeshBasicMaterial({ color: '#eaf6ff', transparent: true, opacity: 0.9, fog: false })), 0, 0, 0, g, { cast: false }); const hd = add(new THREE.ConeGeometry(2.6, 6, 8), sh.material, -14, 0, 0, g, { cast: false }); hd.rotation.z = Math.PI / 2; C.add(g); windC.push(g); }
// ---------- PALCO D: nuvens e chuva ----------
const D = new THREE.Group(); D.position.set(0, 0, 6000); world.add(D);
{ const g1 = add(new THREE.PlaneGeometry(500, 500), Mq.grass, -250, 0, 0, D, { cast: false }); g1.rotation.x = -Math.PI / 2; const g2 = add(new THREE.PlaneGeometry(500, 500), Mq.dry, 250, 0, 0, D, { cast: false }); g2.rotation.x = -Math.PI / 2;
  for (let i = 0; i < 26; i++) add(new THREE.ConeGeometry(2.4, 7, 7), Mq.pine, -430 + R_() * 400, 3.5, -200 + R_() * 400, D); for (let i = 0; i < 16; i++) add(new THREE.CylinderGeometry(0.3, 0.4, 3 + R_() * 3, 6), Mq.trunk, 60 + R_() * 400, 1.5, -200 + R_() * 400, D); }
const cloudG = new THREE.Group(); D.add(cloudG); for (let i = 0; i < 9; i++) { const s = add(new THREE.SphereGeometry(16 + R_() * 14, 14, 10), Mq.cloud, (R_() - .5) * 50, (R_() - .5) * 10, (R_() - .5) * 24, cloudG, { cast: false }); s.userData.ndSkip = true; }
const rainL = []; for (let i = 0; i < 90; i++) { const m = add(box(0.35, 9, 0.35), Mq.rain, 0, 0, 0, D, { cast: false }); rainL.push({ m, x: (R_() - .5) * 90, z: (R_() - .5) * 40, y: R_() * 80, s: 1.5 + R_() * 1.5 }); }
// ---------- PALCO E: vila na neve ----------
const E_ = new THREE.Group(); E_.position.set(0, 0, -6000); world.add(E_);
{ const g = add(new THREE.PlaneGeometry(4000, 4000), Mq.snow, 0, 0, 0, E_, { cast: false }); g.rotation.x = -Math.PI / 2;
  for (const [x, z] of [[-14, -10], [8, -16], [20, 4], [-26, 8], [0, 12]]) { add(box(9, 6, 8), Mq.wall, x, 3, z, E_); const r = add(new THREE.ConeGeometry(7.2, 4.5, 4), Mq.roof, x, 8.2, z, E_); r.rotation.y = 0.78; add(box(1.4, 2.6, 0.2), Mq.wood, x, 1.3, z + 4.1, E_); add(box(1.6, 1.4, 0.2), new THREE.MeshBasicMaterial({ color: '#ffd88a' }), x + 2.6, 3.4, z + 4.1, E_, { cast: false }); }
  for (let i = 0; i < 40; i++) { const a = R_() * 6.283, d = 35 + R_() * 150; add(new THREE.ConeGeometry(3, 9, 7), Mq.pine, Math.cos(a) * d, 4.5, Math.sin(a) * d - 10, E_); }
  const th = new THREE.Group(); th.position.set(-5, 0, 22); E_.add(th); add(box(1.4, 7, 0.4), Mq.white, 0, 3.5, 0, th); const mer = add(box(0.5, 1, 0.3), new THREE.MeshBasicMaterial({ color: '#ff3b1f' }), 0, 0.6, 0.25, th, { cast: false }); mer.userData.ndSkip = true; E_.userData.mer = mer; }
const snow = []; for (let i = 0; i < 160; i++) { const m = add(new THREE.SphereGeometry(0.22, 5, 4), fxm(new THREE.MeshBasicMaterial({ color: '#ffffff', fog: false })), 0, 0, 0, E_, { cast: false }); snow.push({ m, x: (R_() - .5) * 90, z: (R_() - .5) * 60 - 5, y: R_() * 40, s: 0.18 + R_() * 0.25, ph: R_() * 6 }); }
// ---------- PALCO F: torres do tempo ----------
const F = new THREE.Group(); F.position.set(12000, 0, 0); world.add(F);
const towers = [];
{ const g = add(new THREE.PlaneGeometry(4000, 4000), toon({ color: '#d9b878' }), 0, 0, 0, F, { cast: false }); g.rotation.x = -Math.PI / 2; for (let i = 0; i < 10; i++) add(new THREE.SphereGeometry(30 + R_() * 40, 12, 8), toon({ color: '#c9a468' }), -400 + R_() * 800, -14, -300 - R_() * 300, F).scale.y = 0.5;
  [['#ff7a3a', -26], ['#ff4a2a', 0], ['#ff2a6a', 26]].forEach(([col, x], i) => { const m = new THREE.MeshBasicMaterial({ color: col, fog: false }); const t = add(box(14, 1, 14), m, x, 0.5, 0, F); add(box(16, 1.2, 16), Mq.conc, x, 0.6, 0, F); const cap = add(new THREE.SphereGeometry(8.4, 14, 10), glowM(col, 0.35), x, 6, 0, F, { cast: false }); cap.userData.ndSkip = true; towers.push({ t, cap, x }); }); }
// ---------- PALCO G: dados e casas ----------
const G = new THREE.Group(); G.position.set(0, 0, -12000); world.add(G);
const dice = [];
{ add(box(60, 1, 40), Mq.table, 0, -0.5, 0, G); add(box(62, 1.2, 1.2), Mq.wood, 0, 0.2, 20.5, G); add(box(62, 1.2, 1.2), Mq.wood, 0, 0.2, -20.5, G);
  const dt = (n) => new THREE.CanvasTexture(cv(128, 128, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.fillStyle = '#d9372c'; const P_ = { 1: [[.5, .5]], 2: [[.25, .25], [.75, .75]], 3: [[.25, .25], [.5, .5], [.75, .75]], 4: [[.25, .25], [.75, .25], [.25, .75], [.75, .75]], 5: [[.25, .25], [.75, .25], [.5, .5], [.25, .75], [.75, .75]], 6: [[.25, .22], [.75, .22], [.25, .5], [.75, .5], [.25, .78], [.75, .78]] }[n]; P_.forEach(([x, y]) => { g.beginPath(); g.arc(x * w, y * h, 11, 0, 7); g.fill(); }); }));
  const mats = [1, 6, 2, 5, 3, 4].map((n) => new THREE.MeshBasicMaterial({ map: dt(n) }));
  for (let i = 0; i < 3; i++) { const d = add(new THREE.BoxGeometry(5, 5, 5), mats, 0, 2.5, 0, G); dice.push(d); }
  // duas casas, dois invernos
  for (const [x, w] of [[-70, 'snow'], [70, 'sun']]) { const gp = add(new THREE.PlaneGeometry(60, 40), w === 'snow' ? Mq.snow : toon({ color: '#6fb04a' }), x, 0.05, 0, G, { cast: false }); gp.rotation.x = -Math.PI / 2; add(box(14, 9, 10), Mq.wall, x, 4.5, 0, G); const r = add(new THREE.ConeGeometry(11, 6, 4), Mq.roof, x, 12, 0, G); r.rotation.y = 0.78; add(box(2, 4, 0.3), Mq.wood, x, 2, 5.1, G); }
  const sunO = add(new THREE.SphereGeometry(6, 16, 12), new THREE.MeshBasicMaterial({ color: '#ffd23f', fog: false }), 70, 34, -10, G, { cast: false }); sunO.userData.ndSkip = true; for (let i = 0; i < 6; i++) add(new THREE.SphereGeometry(5, 10, 8), Mq.cloud, -70 + (i - 2.5) * 6, 30 + (i % 2) * 3, -8, G, { cast: false }).userData.ndSkip = true; }
const snowG = []; for (let i = 0; i < 50; i++) { const m = add(new THREE.SphereGeometry(0.4, 5, 4), fxm(new THREE.MeshBasicMaterial({ color: '#fff', fog: false })), 0, 0, 0, G, { cast: false }); snowG.push({ m, x: -70 + (R_() - .5) * 40, z: (R_() - .5) * 30, y: R_() * 30, s: 0.3 + R_() * 0.3 }); }
// ---------- PALCO H: mercado, silos e cidade ----------
const HH = new THREE.Group(); HH.position.set(0, 0, 12000); world.add(HH);
const hGround = add(new THREE.PlaneGeometry(4000, 4000), Mq.grass, 0, 0, 0, HH, { cast: false }); hGround.rotation.x = -Math.PI / 2;
const stalks = []; { for (let i = 0; i < 420; i++) { const m = add(box(0.35, 3, 0.35), Mq.wheat, -60 + (i % 28) * 2.2, 1.5, -10 - Math.floor(i / 28) * 2.4, HH, { cast: false }); stalks.push(m); }
  for (const x of [20, 36]) { add(new THREE.CylinderGeometry(6, 6, 22, 16), Mq.silo, x, 11, -26, HH); add(new THREE.ConeGeometry(6.6, 5, 16), Mq.red, x, 24.5, -26, HH); }
  for (let i = 0; i < 40; i++) { const h = 12 + R_() * 50, w = 8 + R_() * 8; add(new THREE.BoxGeometry(w, h, w), R_() < .7 ? Mq.win : Mq.conc, 80 + (i % 8) * 22, h / 2, -20 - Math.floor(i / 8) * 24, HH); }
  add(box(40, 0.3, 14), toon({ color: '#3b3e45' }), 120, 0.15, 24, HH); add(box(30, 0.5, 2), Mq.dark, 120, 0.2, 31, HH); for (let i = 0; i < 5; i++) add(box(1.4, 0.2, 1.4), Mq.dark, 100 + i * 10, 0.25, 31, HH); }
const rainH = []; for (let i = 0; i < 100; i++) { const m = add(box(0.3, 7, 0.3), Mq.rain, 0, 0, 0, HH, { cast: false }); rainH.push({ m, x: 60 + R_() * 130, z: -60 + R_() * 100, y: R_() * 50, s: 1.6 + R_() * 1.2 }); }
const stages = { A, B, C, D, E: E_, F, G, H: HH };
const OFF = { A: [0, 0, 0], B: [6000, 0, 0], C: [-6000, 0, 0], D: [0, 0, 6000], E: [0, 0, -6000], F: [12000, 0, 0], G: [0, 0, -12000], H: [0, 0, 12000] };
const clouds = [];
