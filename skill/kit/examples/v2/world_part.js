// ================= MUNDO V2: Starship (6 palcos) =================
const DECK = 0;
const world = new THREE.Group(); scene.add(world);
const cv = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); return c; };
const wrapR = (c, rx_ = 1, ry_ = 1) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx_, ry_); t.anisotropy = 4; return t; };
const R_ = P.rng(1337);
const steelTex = wrapR(cv(256, 256, (g, w, h) => { g.fillStyle = '#c4c9cf'; g.fillRect(0, 0, w, h); for (let i = 0; i < 14; i++) { g.fillStyle = 'rgba(60,64,70,.35)'; g.fillRect(0, i * 18 + 2, w, 2); } for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(${R_() < .5 ? '255,255,255' : '40,40,44'},${0.05 + R_() * 0.08})`; g.fillRect(R_() * w, R_() * h, 3, 12 + R_() * 30); } }), 3, 3);
const sandTex = wrapR(cv(256, 256, (g, w, h) => { g.fillStyle = '#d6c08a'; g.fillRect(0, 0, w, h); for (let i = 0; i < 1600; i++) { g.fillStyle = `rgba(${R_() < .5 ? '120,95,50' : '255,240,200'},${0.06 + R_() * 0.1})`; g.fillRect(R_() * w, R_() * h, 2, 2); } }), 80, 80);
const seaTex = wrapR(cv(512, 512, (g, w, h) => { g.fillStyle = '#0f4f78'; g.fillRect(0, 0, w, h); for (let i = 0; i < 380; i++) { const x = R_() * w, y = R_() * h, l = 20 + R_() * 60; g.strokeStyle = `rgba(${R_() < .6 ? '160,215,245' : '5,40,70'},${0.18 + R_() * 0.25})`; g.lineWidth = 2 + R_() * 3; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l / 2, y - 6, x + l, y); g.stroke(); } }), 300, 300);
const asphaltTex = wrapR(cv(256, 256, (g, w, h) => { g.fillStyle = '#3b3e45'; g.fillRect(0, 0, w, h); for (let i = 0; i < 1500; i++) { g.fillStyle = `rgba(${R_() < .5 ? '0,0,0' : '255,255,255'},${0.03 + R_() * 0.05})`; g.fillRect(R_() * w, R_() * h, 2, 2); } }), 40, 6);
const earthTex = (() => { const c = cv(1024, 512, (g, w, h) => { g.fillStyle = '#0b3d7a'; g.fillRect(0, 0, w, h); const r = P.rng(21);
  for (let k = 0; k < 14; k++) { g.fillStyle = r() < .5 ? '#2f7a43' : '#9c8a4a'; g.beginPath(); const cx = r() * w, cy = 80 + r() * 350; g.moveTo(cx, cy); for (let i = 0; i < 9; i++) { const a = i / 9 * 6.283; const rad = 30 + r() * 90; g.lineTo(cx + Math.cos(a) * rad * 1.6, cy + Math.sin(a) * rad); } g.closePath(); g.fill(); }
  for (let i = 0; i < 180; i++) { g.strokeStyle = `rgba(255,255,255,${0.15 + r() * 0.3})`; g.lineWidth = 3 + r() * 9; g.beginPath(); const x = r() * w, y = r() * h; g.moveTo(x, y); g.quadraticCurveTo(x + 40, y - 14, x + 90 + r() * 80, y); g.stroke(); } }); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
const Mv = {
  steel: toon({ map: steelTex }), steelD: toon({ color: '#8d939b' }), black: toon({ color: '#3d4048' }), white: toon({ color: '#f3f4f6' }), orange: toon({ color: '#ff7a1a' }), red: toon({ color: '#d9372c' }),
  sand: toon({ map: sandTex }), sea: toon({ map: seaTex }), conc: toon({ color: '#b4b1a8' }), asph: toon({ map: asphaltTex }), grass: toon({ color: '#6c8f4f' }), tower: toon({ color: '#d34a2c' }), towerD: toon({ color: '#7a2a1a' }),
  earth: new THREE.MeshBasicMaterial({ map: earthTex, fog: false }), atmo: new THREE.MeshBasicMaterial({ color: '#58a8ff', transparent: true, opacity: 0.28, side: THREE.BackSide, fog: false, blending: THREE.AdditiveBlending, depthWrite: false }),
  flame: new THREE.MeshBasicMaterial({ color: '#ffb347', transparent: true, opacity: 0.9, fog: false, blending: THREE.AdditiveBlending, depthWrite: false }), flameC: new THREE.MeshBasicMaterial({ color: '#fff5d0', transparent: true, opacity: 0.95, fog: false, blending: THREE.AdditiveBlending, depthWrite: false }),
  plasma: new THREE.MeshBasicMaterial({ color: '#ff6a1f', transparent: true, opacity: 0.8, fog: false, blending: THREE.AdditiveBlending, depthWrite: false }), plasmaC: new THREE.MeshBasicMaterial({ color: '#ffe2a0', transparent: true, opacity: 0.9, fog: false, blending: THREE.AdditiveBlending, depthWrite: false }),
  sat: toon({ color: '#2a3f8f' }), panel: toon({ color: '#9fb8ff' }), glass: toon({ color: '#6c8aa3' }), win: toon({ color: '#9fb4c4' }), glow: new THREE.MeshBasicMaterial({ color: '#fff3c4', fog: true }),
};
const fxm = (m) => { m.userData.ndSkip = true; return m; };
// ---------- foguetes (objetos compartilhados entre palcos) ----------
const mkRocket = (len, rad, nose, legs) => { const g = new THREE.Group(); const body = add(new THREE.CylinderGeometry(rad, rad, len, 20), Mv.steel, 0, len / 2, 0, g);
  if (nose) { add(new THREE.CylinderGeometry(rad * 0.18, rad, nose, 20), Mv.steel, 0, len + nose / 2, 0, g); }
  add(new THREE.CylinderGeometry(rad * 1.01, rad * 1.01, len * 0.04, 20), Mv.black, 0, len * 0.55, 0, g);
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.78; const f = add(box(0.5, nose ? 9 : 7, nose ? 6 : 4), Mv.steelD, Math.cos(a) * (rad + 0.4), nose ? len * 0.06 + 3 : 4, Math.sin(a) * (rad + 0.4), g); f.rotation.y = -a; }
  if (legs) for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; const l = add(box(0.5, 9, 0.5), Mv.steelD, Math.cos(a) * (rad + 3), 3, Math.sin(a) * (rad + 3), g); l.rotation.z = Math.cos(a) * 0.4; l.rotation.x = -Math.sin(a) * 0.4; }
  const fl = add(new THREE.ConeGeometry(rad * 0.95, 1, 16), fxm(Mv.flame), 0, 0, 0, g, { cast: false }); fl.rotation.x = Math.PI; fl.userData.ndSkip = true; g.userData.fl = fl;
  const fc = add(new THREE.ConeGeometry(rad * 0.55, 1, 12), fxm(Mv.flameC), 0, 0, 0, g, { cast: false }); fc.rotation.x = Math.PI; fc.userData.ndSkip = true; g.userData.fc = fc;
  const pl = add(new THREE.SphereGeometry(rad * 1.5, 14, 10), fxm(Mv.plasma), 0, 0, 0, g, { cast: false }); pl.userData.ndSkip = true; g.userData.pl = pl;
  const pc = add(new THREE.SphereGeometry(rad * 0.9, 12, 8), fxm(Mv.plasmaC), 0, 0, 0, g, { cast: false }); pc.userData.ndSkip = true; g.userData.pc = pc; g.userData.len = len; return g; };
const shipM = mkRocket(36, 4.5, 16, true); shipM.userData.len = 52; world.add(shipM);
const boostM = mkRocket(71, 4.5, 0, false); world.add(boostM);
// ---------- PALCO A: base de lançamento ----------
const A = new THREE.Group(); world.add(A);
const gA = add(new THREE.PlaneGeometry(6000, 6000), Mv.sand, 0, 0, 0, A, { cast: false }); gA.rotation.x = -Math.PI / 2;
const seaA = add(new THREE.PlaneGeometry(6000, 3000), Mv.sea, 0, 0.05, 1900, A, { cast: false }); seaA.rotation.x = -Math.PI / 2;
{ add(tbox(60, 3, 60, 8), Mv.conc, 0, 1.5, 0, A); add(new THREE.CylinderGeometry(12, 12, 6, 24), Mv.black, 0, 4.5, 22, A);   // mesa de lançamento
  const T = new THREE.Group(); T.position.set(0, 0, -6); A.add(T);
  for (const [x, z] of [[-6, -6], [6, -6], [-6, 6], [6, 6]]) add(box(2.4, 146, 2.4), Mv.tower, x, 73, z, T);
  for (let y = 6; y < 146; y += 8) { add(box(14.4, 0.8, 0.8), Mv.towerD, 0, y, -6, T); add(box(14.4, 0.8, 0.8), Mv.towerD, 0, y, 6, T); add(box(0.8, 0.8, 12.4), Mv.towerD, -6, y, 0, T); add(box(0.8, 0.8, 12.4), Mv.towerD, 6, y, 0, T); const d = add(box(0.5, 0.5, 18), Mv.towerD, 6, y + 4, 0, T); d.rotation.x = 0.7; }
  add(box(18, 4, 18), Mv.tower, 0, 148, 0, T); add(box(1, 14, 1), Mv.white, 4, 157, 0, T);
  for (let i = 0; i < 8; i++) { const m = add(box(1.4, 1.4, 1.4), new THREE.MeshBasicMaterial({ color: i % 2 ? '#ff2b2b' : '#fff' }), 0, 20 + i * 18, 6.5, T, { cast: false }); }
  for (const s of [-1, 1]) { const arm = new THREE.Group(); arm.position.set(s * 9, 92, 6); T.add(arm); const bm = add(box(3.2, 5, 30), Mv.tower, 0, 0, 15, arm); add(box(1.6, 3, 8), Mv.steelD, -s * 0.4, 0, 28, arm); add(box(5, 7, 5), Mv.towerD, 0, 0, 0, arm); A.userData['arm' + s] = arm; }
  A.userData.T = T;
  for (const [x, z, r, h] of [[-60, 40, 7, 22], [-85, 40, 7, 22], [70, 30, 6, 16], [95, 55, 6, 16]]) add(new THREE.CylinderGeometry(r, r, h, 14), Mv.white, x, h / 2, z, A);
  add(tbox(40, 12, 24, 8), Mv.conc, 120, 6, -30, A); add(tbox(26, 8, 30, 8), Mv.steelD, -130, 4, -10, A);
  for (let i = 0; i < 20; i++) add(new THREE.ConeGeometry(2 + R_() * 3, 5 + R_() * 4, 6), Mv.grass, -300 + R_() * 600, 2, -80 - R_() * 300, A); }
// ---------- PALCO B: órbita ----------
const B = new THREE.Group(); B.position.set(6000, 0, 0); world.add(B);
{ const pts = []; for (let i = 0; i < 1800; i++) { const a = R_() * 6.283, b = Math.acos(2 * R_() - 1), r = 900; pts.push(r * Math.sin(b) * Math.cos(a), r * Math.cos(b), r * Math.sin(b) * Math.sin(a)); }
  const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); const st = new THREE.Points(gg, new THREE.PointsMaterial({ color: '#ffffff', size: 3.2, sizeAttenuation: false, fog: false })); B.add(st);
  const earth = add(new THREE.SphereGeometry(700, 48, 32), Mv.earth, 0, -780, 0, B, { cast: false }); earth.userData.ndSkip = true; B.userData.earth = earth;
  const at = add(new THREE.SphereGeometry(716, 32, 24), Mv.atmo, 0, -780, 0, B, { cast: false }); at.userData.ndSkip = true;
  const sun = add(new THREE.SphereGeometry(18, 16, 12), new THREE.MeshBasicMaterial({ color: '#fff6d8', fog: false }), 500, 220, -700, B, { cast: false }); sun.userData.ndSkip = true; }
const sats = []; for (let i = 0; i < 26; i++) { const g = new THREE.Group(); add(box(1.6, 0.3, 2.6), Mv.sat, 0, 0, 0, g); add(box(5.2, 0.08, 2.2), Mv.panel, 0, 0.3, 0, g); B.add(g); sats.push(g); }
// ---------- PALCO C: reentrada ----------
const C = new THREE.Group(); C.position.set(-6000, 0, 0); world.add(C);
{ const sea = add(new THREE.PlaneGeometry(8000, 8000), Mv.sea, 0, -400, 0, C, { cast: false }); sea.rotation.x = -Math.PI / 2; }
const streak = []; for (let i = 0; i < 60; i++) { const m = add(box(0.25, 40 + R_() * 80, 0.25), fxm(new THREE.MeshBasicMaterial({ color: '#ffd9a0', transparent: true, opacity: 0.55, fog: false })), 0, 0, 0, C, { cast: false }); streak.push({ m, x: (R_() - .5) * 160, z: (R_() - .5) * 160, s: 6 + R_() * 10, y: R_() * 300 }); }
// ---------- PALCO D: oceano (propulsor perdido) ----------
const D = new THREE.Group(); D.position.set(0, 0, 6000); world.add(D);
const seaD = add(new THREE.PlaneGeometry(8000, 8000), Mv.sea, 0, 0, 0, D, { cast: false }); seaD.rotation.x = -Math.PI / 2;
const boom = []; for (let i = 0; i < 14; i++) { const m = add(new THREE.SphereGeometry(1, 10, 8), fxm(new THREE.MeshBasicMaterial({ color: i % 3 ? '#ff8a1f' : '#fff0b0', transparent: true, opacity: 0.9, fog: false })), 0, 0, 0, D, { cast: false }); boom.push({ m, a: R_() * 6.283, e: 0.3 + R_() * 1.1, v: 18 + R_() * 40 }); }
const debris = []; for (let i = 0; i < 16; i++) { const m = add(box(1 + R_() * 3, 0.4 + R_() * 1.2, 1 + R_() * 3), Mv.steelD, 0, 0, 0, D); debris.push({ m, a: R_() * 6.283, e: 0.4 + R_() * 1.0, v: 12 + R_() * 30, r: R_() * 5 }); }
for (let i = 0; i < 4; i++) add(new THREE.ConeGeometry(30 + R_() * 30, 40 + R_() * 40, 10), toon({ color: '#6a7d8f' }), -600 + i * 380, 20, -1400 - R_() * 600, D);
// ---------- PALCO E: aeroporto ----------
const E_ = new THREE.Group(); E_.position.set(0, 0, -6000); world.add(E_);
{ const gr = add(new THREE.PlaneGeometry(6000, 6000), Mv.grass, 0, 0, 0, E_, { cast: false }); gr.rotation.x = -Math.PI / 2; add(box(900, 0.3, 60), Mv.asph, 0, 0.2, 0, E_, { cast: false }); for (let i = -20; i < 20; i++) add(box(12, 0.05, 1.2), Mv.white, i * 22, 0.4, 0, E_, { cast: false });
  add(tbox(120, 18, 30, 8), Mv.conc, -140, 9, -70, E_); add(tbox(100, 4, 24, 8), Mv.glass, -140, 20, -70, E_); add(new THREE.CylinderGeometry(3, 3.6, 36, 10), Mv.white, -230, 18, -70, E_); add(box(10, 8, 10), Mv.glass, -230, 38, -70, E_);
  for (let i = 0; i < 10; i++) add(box(1, 6, 1), Mv.glow, -300 + i * 70, 3, 30, E_, { cast: false }); }
const plane = new THREE.Group(); { add(new THREE.CylinderGeometry(3, 3, 46, 14), Mv.white, 0, 0, 0, plane).rotation.z = Math.PI / 2; add(new THREE.ConeGeometry(3, 10, 14), Mv.white, 28, 0, 0, plane).rotation.z = -Math.PI / 2; add(box(10, 0.6, 52), Mv.white, 2, -0.8, 0, plane); add(box(6, 9, 0.6), Mv.red, -21, 5, 0, plane); add(box(5, 0.5, 16), Mv.white, -21, 1, 0, plane); add(box(40, 0.7, 3.2), Mv.glass, 2, 0.9, 0, plane); for (const z of [-12, 12]) add(new THREE.CylinderGeometry(1.5, 1.5, 6, 10), Mv.steelD, 4, -2.8, z, plane).rotation.z = Math.PI / 2; } E_.add(plane);
// ---------- PALCO F: hangar de montagem ----------
const F = new THREE.Group(); F.position.set(12000, 0, 0); world.add(F);
{ add(tbox(120, 1, 90, 8), Mv.conc, 0, -0.5, 0, F); add(tbox(120, 1, 90, 8), Mv.steelD, 0, 70, 0, F); add(tbox(1, 70, 90, 8), Mv.steelD, -60, 35, 0, F); add(tbox(1, 70, 90, 8), Mv.steelD, 60, 35, 0, F); add(tbox(120, 70, 1, 8), Mv.steelD, 0, 35, -45, F);
  for (let x = -54; x <= 54; x += 18) { add(box(1.4, 70, 1.4), Mv.towerD, x, 35, -42, F); add(box(1.2, 1.2, 90), Mv.towerD, x, 68, 0, F); for (let z = -36; z <= 36; z += 24) add(box(1.6, 1.6, 1.6), Mv.glow, x, 66, z, F, { cast: false }); }
  for (let y = 8; y < 64; y += 8) { add(box(14, 0.6, 14), Mv.tower, -14, y, 0, F); } add(box(1, 60, 1), Mv.tower, -21, 30, -7, F); add(box(1, 60, 1), Mv.tower, -21, 30, 7, F); add(box(1, 60, 1), Mv.tower, -7, 30, -7, F); add(box(1, 60, 1), Mv.tower, -7, 30, 7, F);
  for (let i = 0; i < 6; i++) add(new THREE.CylinderGeometry(2.4, 2.4, 11, 12), Mv.white, 30 + (i % 3) * 8, 5.5, -30 + Math.floor(i / 3) * 10, F); }
const stages = { A, B, C, D, E: E_, F };
const OFF = { A: [0, 0, 0], B: [6000, 0, 0], C: [-6000, 0, 0], D: [0, 0, 6000], E: [0, 0, -6000], F: [12000, 0, 0] };
// ---------- nuvens (só no céu normal) ----------
const clouds = [];
{ const r = P.rng(91);
  for (let i = 0; i < 12; i++) {
    const c = document.createElement('canvas'); c.width = 600; c.height = 400; const pen = new T.Pen(c.getContext('2d')); pen.ol = 0;
    pen.g.translate(300, 200); pen.g.scale(1.4, 1.2); pen.g.translate(-300, -200); T.fxCloud(pen, i + 1);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.667), new THREE.MeshBasicMaterial({ map: P.tex(c), transparent: true, fog: false, depthWrite: false }));
    const a = r() * Math.PI * 2, d = 650 + r() * 250; m.position.set(Math.cos(a) * d, 120 + r() * 160, Math.sin(a) * d); m.scale.setScalar(160 + r() * 140);
    m.userData.ndSkip = true; m.renderOrder = -1; scene.add(m); clouds.push(m);
  } }
