const mod = (a, n) => ((a % n) + n) % n;
function placeRocket(g, s, st) { if (!s) { g.visible = false; return; } g.visible = true; const o = OFF[st]; g.position.set(o[0] + s.p[0], o[1] + s.p[1], o[2] + s.p[2]); g.rotation.set(s.rx || 0, s.ry || 0, s.rz || 0);
  const L = g.userData.len, fl = s.fl || 0; g.userData.fl.visible = g.userData.fc.visible = fl > 0.1; g.userData.fl.scale.set(1, Math.max(0.01, fl), 1); g.userData.fl.position.y = -fl / 2; g.userData.fc.scale.set(1, Math.max(0.01, fl * 0.7), 1); g.userData.fc.position.y = -fl * 0.35;
  const pl = s.pl || 0; g.userData.pl.visible = g.userData.pc.visible = pl > 0.02; g.userData.pl.scale.set(1 + pl * 0.3, 2.5, 1 + pl * 0.3); g.userData.pl.position.set(0, L * 0.42, 0); g.userData.pc.scale.set(1, 2.1, 1); g.userData.pc.position.set(0, L * 0.38, 0); g.userData.pl.material.opacity = 0.22 + pl * 0.3; g.userData.pc.material.opacity = 0.12 + pl * 0.2; }
function worldState(S, f) {
  const st = S.stage || 'A'; for (const k in stages) stages[k].visible = (k === st);
  seaTex.offset.set((f * 0.0016) % 1, (f * 0.001) % 1);
  placeRocket(shipM, S.ship, st); placeRocket(boostM, S.boost, st);
  clouds.forEach((c) => { c.visible = st === 'A' || st === 'D' || st === 'E'; });
  if (st === 'A') { const c = S.arms ?? 0; A.userData.arm1.rotation.y = 0.8 * (1 - c) - 0.07 * c; A.userData['arm-1'].rotation.y = -(0.8 * (1 - c) - 0.07 * c); }
  if (st === 'B') { B.userData.earth.rotation.y = f * 0.0004; const sp = S.sats ?? -1; sats.forEach((g, i) => { const t0 = 556 + i * 2.4, t = f - t0; g.visible = sp >= 0 && t > 0; if (g.visible) { const k = Math.min(t, 260) * 0.45; g.position.set(S.ship.p[0] + Math.cos(i * 1.9) * (4 + k * 0.35), S.ship.p[1] + Math.sin(i * 2.7) * (3 + k * 0.25), S.ship.p[2] - 6 - k * 2.2); g.rotation.set(t * 0.02, t * 0.013 + i, 0); } }); }
  if (st === 'C') { streak.forEach((s) => { const y = mod(s.y - f * s.s, 300) - 100; s.m.position.set(s.x, y, s.z); s.m.visible = true; }); }
  if (st === 'D') { const t = S.boom ?? -1; boom.forEach((b) => { b.m.visible = t >= 0; if (t >= 0) { const r = b.v * t * 3, sc = (4 + t * 22) * (1 - t * 0.7); b.m.position.set(Math.cos(b.a) * Math.cos(b.e) * r, 8 + Math.sin(b.e) * r * 0.9, Math.sin(b.a) * Math.cos(b.e) * r); b.m.scale.setScalar(Math.max(0.1, sc)); b.m.material.opacity = Math.max(0, 0.95 - t * 0.9); } });
    debris.forEach((d) => { d.m.visible = t >= 0; if (t >= 0) { const r = d.v * t * 4, y = 6 + Math.sin(d.e) * d.v * t * 5 - 55 * t * t; d.m.position.set(Math.cos(d.a) * r, Math.max(0.2, y), Math.sin(d.a) * r); d.m.rotation.set(t * d.r * 4, t * d.r * 3, 0); } }); }
  if (st === 'E') { const px = S.plane ?? -300; plane.position.set(px, 3.5 + Math.max(0, (px - 40) * 0.25), 0); plane.rotation.z = Math.max(0, (px - 40) * 0.0015); }
}
