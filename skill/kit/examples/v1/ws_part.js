const mod = (a, n) => ((a % n) + n) % n;
function worldState(S, f) {
  const st = S.stage || 'A'; for (const k in stages) stages[k].visible = (k === st);
  waterTex.offset.set((f * 0.0021) % 1, (f * 0.0013) % 1);
  if (st === 'A') {
    const ss = 1 - 0.93 * (S.jam || 0), sc = S.carSpeed ?? 1;
    cars.forEach((c, i) => { const dir = c.lane < 2 ? -1 : 1, x = mod(c.off + dir * c.spd * ss * sc * f * 0.55, 700) - 350;
      c.g.visible = !(S.jam > 0.5 && Math.abs(x) < 30 && c.lane === 2) && !(S.noL3 && c.lane === 3); c.g.position.set(x, hAt(x) + 0.14, LANEZ[c.lane]); c.g.rotation.set(0, dir < 0 ? Math.PI : 0, dir * slope(x)); });
    hazard.visible = !!S.hazard; if (S.hazard) { const hx = S.hazX ?? 0; hazard.position.set(hx, hAt(hx) + 0.14, 5.2); hazard.rotation.z = slope(hx); const on = (f >> 3) % 2; hazard.userData.l1.visible = !!on; hazard.userData.l2.visible = !on; }
    ship.visible = S.ship !== undefined; if (S.ship !== undefined) ship.position.set(S.shipX ?? 0, 0, -260 + 520 * S.ship);
    streaks.forEach((s) => { s.m.visible = !!S.wind; if (S.wind) s.m.position.set((S.windX ?? 0) + mod(s.x - f * s.s * 1.7, 200) - 100, s.y + (S.windY ?? 0), (S.windZ ?? 0) + s.z); });
    ruler.visible = S.ruler !== undefined; if (S.ruler !== undefined) { const L = 300 * S.ruler; ruler.userData.bar.scale.x = Math.max(0.01, L); ruler.userData.bar.position.x = -150 + L / 2; ruler.children.forEach((c) => { if (c.userData.cap) c.position.x = c.userData.cap < 0 ? -150 : -150 + L; }); ruler.position.y = 92; }
  }
  if (st === 'C') { ferry.position.set(-12 + (S.ferry ?? 0) * 150, 0.2 + 0.15 * Math.sin(f * 0.08), 26 - (S.ferry ?? 0) * 8); ferry.rotation.y = 0.03 * Math.sin(f * 0.05); }
}
