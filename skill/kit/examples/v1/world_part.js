// ================= MUNDO: Ponte Rio-Niterói (4 palcos) =================
const DECK = 0;
const world = new THREE.Group(); scene.add(world);
const cv = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); return c; };
const wrapR = (c, rx_ = 1, ry_ = 1) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx_, ry_); t.anisotropy = 4; return t; };
const R_ = P.rng(7);
// materiais próprios
const concrete = wrapR(cv(256, 256, (g, w, h) => { g.fillStyle = '#b9b6ae'; g.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(${R_() < .5 ? '60,58,54' : '235,232,224'},${0.04 + R_() * 0.07})`; g.fillRect(R_() * w, R_() * h, 2 + R_() * 10, 1 + R_() * 4); } g.strokeStyle = 'rgba(70,66,60,.35)'; g.lineWidth = 2; g.strokeRect(0, 0, w, h); }), 1, 1);
const roadTex = wrapR(cv(256, 256, (g, w, h) => { g.fillStyle = '#34373e'; g.fillRect(0, 0, w, h); for (let i = 0; i < 1500; i++) { g.fillStyle = `rgba(${R_() < .5 ? '0,0,0' : '255,255,255'},${0.03 + R_() * 0.05})`; g.fillRect(R_() * w, R_() * h, 2, 2); } }), 1, 1);
const waterTex = wrapR(cv(512, 512, (g, w, h) => { g.fillStyle = '#1f6f9a'; g.fillRect(0, 0, w, h); for (let i = 0; i < 380; i++) { const x = R_() * w, y = R_() * h, l = 20 + R_() * 60; g.strokeStyle = `rgba(${R_() < .6 ? '200,235,255' : '10,60,95'},${0.18 + R_() * 0.25})`; g.lineWidth = 2 + R_() * 3; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l / 2, y - 6, x + l, y); g.stroke(); } }), 220, 220);
const rustTex = wrapR(cv(256, 256, (g, w, h) => { g.fillStyle = '#7d8187'; g.fillRect(0, 0, w, h); for (let i = 0; i < 70; i++) { g.fillStyle = `rgba(${150 + R_() * 40},${70 + R_() * 30},${25},${0.2 + R_() * 0.4})`; g.beginPath(); g.ellipse(R_() * w, R_() * h, 6 + R_() * 30, 4 + R_() * 18, R_() * 3, 0, 7); g.fill(); } for (let i = 0; i < 12; i++) { g.fillStyle = '#4b4f55'; g.fillRect(i * 22 + 8, 0, 4, h); } }), 1, 1);
const winTex = (lit) => wrapR(cv(128, 128, (g, w, h) => { g.fillStyle = lit ? '#252b3a' : '#9fb4c4'; g.fillRect(0, 0, w, h); for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = lit && R_() < .7 ? '#ffd88a' : (lit ? '#3a4152' : '#5f7d96'); g.fillRect(x * 32 + 6, y * 32 + 7, 20, 18); } }), 1, 1);
const Mb = {
  conc: toon({ map: concrete }), concD: toon({ color: '#8f8c85' }), road: toon({ map: roadTex }), white: toon({ color: '#f3f1ea' }), yellow: toon({ color: '#f1c232' }),
  water: toon({ map: waterTex, color: '#ffffff' }), steel: toon({ color: '#c9ced4' }), rust: toon({ map: rustTex }), rail: toon({ color: '#e6e8ea' }), dark: toon({ color: '#2a2d33' }),
  lampG: new THREE.MeshBasicMaterial({ color: '#fff3c4', fog: true }), red: toon({ color: '#c9372c' }), glass: toon({ color: '#6c8aa3' }),
  win: toon({ map: winTex(false) }), winN: new THREE.MeshBasicMaterial({ map: winTex(true), fog: true }), hullR: toon({ color: '#9b2f2a' }), hullB: toon({ color: '#1f3b66' }),
  ground: toon({ color: '#6f8f55' }), hillG: toon({ color: '#5f8a4a' }), sand: toon({ color: '#d9c48e' }),
};
const hAt = (x) => 26 + 46 * Math.exp(-Math.pow(x / 230, 6));
const slope = (x) => Math.atan((hAt(x + 1) - hAt(x - 1)) / 2);
const dep = (x) => 4 + 4 * Math.exp(-Math.pow((Math.abs(x) - 150) / 40, 2)) + 0.5;
// ---------- PALCO A: a ponte sobre a baía ----------
const A = new THREE.Group(); world.add(A);
const sea = add(new THREE.PlaneGeometry(6000, 6000), Mb.water, 0, 0, 0, A, { cast: false }); sea.rotation.x = -Math.PI / 2;
const XL = 700;
for (let x = -XL; x < XL; x += 10) {
  const d = dep(x), g = new THREE.Group(); g.position.set(x + 5, hAt(x + 5), 0); g.rotation.z = slope(x + 5); A.add(g);
  add(tbox(10.2, d, 15, 5), Mb.conc, 0, -d / 2, 0, g);
  add(box(10.2, 0.12, 14), Mb.road, 0, 0.06, 0, g, { cast: false });
  if (((x / 10) | 0) % 2 === 0) for (const z of [-3.5, 0, 3.5]) add(box(4, 0.04, 0.22), z === 0 ? Mb.yellow : Mb.white, 0, 0.14, z, g, { cast: false });
  for (const z of [-7, 7]) { add(box(10.2, 0.9, 0.35), Mb.conc, 0, 0.5, z, g); add(box(10.2, 0.14, 0.2), Mb.rail, 0, 1.15, z, g); }
  if (((x / 10) | 0) % 3 === 0) for (const z of [-7.4, 7.4]) { add(new THREE.CylinderGeometry(0.12, 0.16, 9, 6), Mb.rail, 0, 4.5, z, g); add(new THREE.SphereGeometry(0.42, 8, 6), Mb.lampG, 0, 9.1, z * 0.96, g, { cast: false }); }
}
for (let x = -XL; x <= XL; x += 50) { const ac = Math.abs(x); if (ac < 140) continue; const hh = hAt(x) - dep(x); const big = ac >= 145 && ac < 160;
  add(tbox(big ? 6 : 3.4, hh, big ? 12 : 8, 6), Mb.conc, x, hh / 2, 0, A); add(tbox(big ? 9 : 5.5, 1.6, big ? 13 : 10, 5), Mb.concD, x, hh - 0.2, 0, A); }
// cidades e morros ao longe (Rio -x, Niterói +x)
const rc = P.rng(31);
for (const side of [-1, 1]) for (let i = 0; i < 46; i++) { const h = 14 + rc() * (side < 0 ? 90 : 44), w = 10 + rc() * 16, x = side * (780 + rc() * 520), z = (rc() - .5) * 700 - (rc() < .5 ? 380 : -380); if (Math.abs(z) < 60) continue;
  add(new THREE.BoxGeometry(w, h, w), rc() < .5 ? Mb.win : Mb.conc, x, h / 2, z, A); }
for (const [x, z, s, h] of [[-900, -520, 120, 120], [-1300, 300, 150, 150], [1100, -480, 140, 90], [1500, 260, 180, 110], [-600, 700, 160, 80], [300, -1100, 220, 130], [-300, 1200, 200, 70]]) add(new THREE.ConeGeometry(s, h, 14), Mb.hillG, x, h / 2 - 2, z, A);
// carros
const carCols = ['#c9372c', '#2d6fbf', '#f1c232', '#f2f2f2', '#2f3a46', '#3fa05b', '#e5822b', '#8a4fb0'];
const cars = [];
for (let i = 0; i < 150; i++) { const r = rc, g = new THREE.Group(), truck = r() < 0.16, L = truck ? 8 : 4.2, col = carCols[(r() * carCols.length) | 0];
  add(box(L, truck ? 2.6 : 0.9, 1.9), toon({ color: truck ? '#e8e8e8' : col }), 0, truck ? 1.7 : 0.8, 0, g);
  if (!truck) add(box(2.2, 0.8, 1.7), Mb.glass, -0.2, 1.6, 0, g); else add(box(2.0, 2.0, 2.0), toon({ color: col }), L / 2 - 0.9, 1.4, 0, g);
  add(box(L * 0.9, 0.3, 1.8), Mb.dark, 0, 0.3, 0, g);
  const h = add(new THREE.SphereGeometry(0.25, 6, 5), new THREE.MeshBasicMaterial({ color: '#ffe9a0', fog: true }), L / 2, 0.9, 0.6, g, { cast: false }); A.add(g);
  cars.push({ g, lane: i % 4, off: r() * 700, spd: 0.55 + r() * 0.5, L, truck }); }
const LANEZ = [-5.2, -1.8, 1.8, 5.2];
const hazard = new THREE.Group(); { add(box(4.2, 0.9, 1.9), Mb.red, 0, 0.8, 0, hazard); add(box(2.2, 0.8, 1.7), Mb.glass, -0.2, 1.6, 0, hazard); add(box(4.0, 0.3, 1.8), Mb.dark, 0, 0.3, 0, hazard);
  hazard.userData.l1 = add(new THREE.SphereGeometry(0.3, 6, 5), new THREE.MeshBasicMaterial({ color: '#ff9a1f' }), 2.1, 1.0, 0.7, hazard, { cast: false }); hazard.userData.l2 = add(new THREE.SphereGeometry(0.3, 6, 5), new THREE.MeshBasicMaterial({ color: '#ff9a1f' }), 2.1, 1.0, -0.7, hazard, { cast: false }); }
A.add(hazard);
const ruler = new THREE.Group(); A.add(ruler); { const m = new THREE.MeshBasicMaterial({ color: '#01FBB4', fog: false }); const bar = add(box(1, 3, 3), m, 0, 0, 0, ruler, { cast: false }); ruler.userData.bar = bar; for (const s of [-1, 1]) add(box(3, 22, 3), m, s * 0.5, 0, 0, ruler, { cast: false }).userData.cap = s; ruler.position.set(0, 90, 0); }
// navio
const ship = new THREE.Group(); A.add(ship);
{ const sh = new THREE.Shape(); sh.moveTo(-60, 0); sh.lineTo(60, 0); sh.lineTo(78, 9); sh.lineTo(60, 12); sh.lineTo(-60, 12); sh.closePath();
  const hg = new THREE.ExtrudeGeometry(sh, { depth: 24, bevelEnabled: false }); hg.translate(0, -3, -12); add(hg, Mb.hullB, 0, 0, 0, ship);
  const cc = ['#c9372c', '#2d6fbf', '#e5822b', '#3fa05b', '#f1c232', '#8a4fb0']; const rr = P.rng(5);
  for (let i = 0; i < 9; i++) for (let j = 0; j < 3; j++) { const hh = 1 + ((rr() * 4) | 0); for (let k = 0; k < hh; k++) add(box(10.6, 2.5, 7), toon({ color: cc[(rr() * 6) | 0] }), -50 + i * 11.2, 14 + k * 2.55, -7.5 + j * 7.5, ship); }
  add(box(12, 16, 22), Mb.white, 62, 20, 0, ship); add(box(13, 3, 23), Mb.glass, 62, 25.5, 0, ship); ship.rotation.y = Math.PI / 2; }
// vento / spray: tiras
const streaks = []; for (let i = 0; i < 40; i++) { const m = add(box(14 + rc() * 18, 0.1, 0.1), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.55, fog: false }), 0, 0, 0, A, { cast: false }); m.userData.ndSkip = true; streaks.push({ m, x: rc() * 200 - 100, y: 20 + rc() * 70, z: rc() * 60 - 30, s: 1.4 + rc() * 2 }); }
// ---------- PALCO B: dentro da viga caixão ----------
const B = new THREE.Group(); B.position.set(5000, 0, 0); world.add(B);
{ add(tbox(8, 0.4, 200, 4), Mb.rust, 0, -0.2, 0, B); add(tbox(8, 0.4, 200, 4), Mb.conc, 0, 5.2, 0, B); for (const s of [-1, 1]) add(tbox(0.4, 5.6, 200, 4), Mb.conc, s * 4.2, 2.6, 0, B);
  for (let z = -90; z <= 90; z += 5) { add(tbox(8, 0.5, 0.5, 2), Mb.rust, 0, 4.7, z, B); for (const s of [-1, 1]) add(tbox(0.5, 5, 0.5, 2), Mb.rust, s * 3.7, 2.5, z, B); if ((z / 5) % 2 === 0) add(box(2.4, 0.12, 0.5), Mb.lampG, 0, 4.9, z + 2.5, B, { cast: false }); }
  for (const [x, y] of [[-3.2, 3.9], [-3.2, 3.2], [3.2, 3.6]]) { const p = add(new THREE.CylinderGeometry(0.22, 0.22, 200, 8), Mb.steel, x, y, 0, B); p.rotation.x = Math.PI / 2; }
  for (let i = 0; i < 18; i++) add(box(1 + rc() * 1.5, 0.05, 1 + rc() * 2), toon({ color: '#9a4a1f' }), (rc() - .5) * 6, 0.03, (rc() - .5) * 120, B, { cast: false }); }
// ---------- PALCO C: cais da barca ----------
const C = new THREE.Group(); C.position.set(-5000, 0, 0); world.add(C);
const seaC = add(new THREE.PlaneGeometry(4000, 4000), Mb.water, 0, 0, 0, C, { cast: false }); seaC.rotation.x = -Math.PI / 2;
{ add(tbox(40, 1.2, 14, 4), Mb.conc, -14, 0.6, -2, C); add(tbox(36, 0.2, 10, 3), toon({ map: P.tex(P.planks(3), 1, 4) }), -14, 1.3, -2, C);
  for (let i = 0; i < 12; i++) add(new THREE.CylinderGeometry(0.25, 0.25, 2.2, 6), Mb.dark, -32 + i * 3.4, 1.2, 4.9, C);
  for (let i = 0; i < 26; i++) { const h = 16 + rc() * 70, w = 9 + rc() * 12; add(new THREE.BoxGeometry(w, h, w), rc() < .5 ? Mb.win : Mb.conc, -80 + i * 11, h / 2, -120 - rc() * 80, C); }
  add(new THREE.ConeGeometry(70, 70, 12), Mb.hillG, 90, 33, -260, C); add(new THREE.ConeGeometry(55, 90, 12), Mb.hillG, -150, 43, -300, C); }
const ferry = new THREE.Group(); C.add(ferry);
{ const sh = new THREE.Shape(); sh.moveTo(-14, 0); sh.lineTo(14, 0); sh.lineTo(18, 3); sh.lineTo(14, 4); sh.lineTo(-14, 4); sh.closePath(); const hg = new THREE.ExtrudeGeometry(sh, { depth: 9, bevelEnabled: false }); hg.translate(0, -1, -4.5);
  add(hg, Mb.white, 0, 0, 0, ferry); add(box(26, 2.6, 8), Mb.glass, 0, 5.3, 0, ferry); add(box(27, 0.5, 9), Mb.red, 0, 6.8, 0, ferry); add(box(6, 3, 6), Mb.yellow, 4, 8.2, 0, ferry); }
// ---------- PALCO D: comparação de altura ----------
const D = new THREE.Group(); D.position.set(0, 0, 5000); world.add(D);
const seaD = add(new THREE.PlaneGeometry(4000, 4000), Mb.water, 0, 0, 0, D, { cast: false }); seaD.rotation.x = -Math.PI / 2;
{ add(tbox(80, 1.5, 60, 4), Mb.concD, 0, 0.7, 0, D);
  const bg = new THREE.BoxGeometry(14, 60, 14), uv = bg.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 3, uv.getY(i) * 20);
  const bm = toon({ map: winTex(false) }); bm.map.repeat.set(1, 1); add(bg, bm, -10, 31.5, 0, D); add(box(14.4, 0.8, 14.4), Mb.conc, -10, 62, 0, D);
  add(tbox(6, 72, 8, 6), Mb.conc, 12, 37.5, 0, D); add(tbox(11, 2, 12, 5), Mb.concD, 12, 73.5, 0, D);
  for (let y = 3; y < 72; y += 3) add(box(1.6, 0.12, 0.12), toon({ color: '#01FBB4' }), 2, y + 1.5, 7.2, D, { cast: false }); }
const stages = { A, B, C, D };
// ---------- nuvens ----------
const clouds = [];
{ const r = P.rng(90);
  for (let i = 0; i < 14; i++) {
    const c = document.createElement('canvas'); c.width = 600; c.height = 400; const pen = new T.Pen(c.getContext('2d')); pen.ol = 0;
    pen.g.translate(300, 200); pen.g.scale(1.4, 1.2); pen.g.translate(-300, -200); T.fxCloud(pen, i + 1);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.667), new THREE.MeshBasicMaterial({ map: P.tex(c), transparent: true, fog: false, depthWrite: false }));
    const a = r() * Math.PI * 2, d = 650 + r() * 250; m.position.set(Math.cos(a) * d, 120 + r() * 160, Math.sin(a) * d); m.scale.setScalar(160 + r() * 140);
    m.userData.ndSkip = true; m.renderOrder = -1; scene.add(m); clouds.push(m);
  } }
