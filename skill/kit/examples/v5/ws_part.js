const mod = (a, n) => ((a % n) + n) % n;
function worldState(S, f) {
  const st = S.stage || 'A'; for (const k in stages) stages[k].visible = (k === st);
  if (st === 'A') { const r = S.reveal ?? 0, n = Math.floor(32 * r); slots.forEach((s) => { const gone = s.empty && s.rank < n; s.p.visible = !gone; s.ring.material.opacity = gone ? 0.55 + 0.25 * Math.sin(f * 0.3 + s.rank) : 0; }); }
  if (st === 'B') { const a = S.b25 ?? 0, b = S.b26 ?? 0; boards[0].forEach((m, i) => m.color.set(i < 27 * a ? '#ffd23f' : '#3a4560')); boards[1].forEach((m, i) => m.color.set(i < 32 * b ? '#ff5a3a' : '#3a4560')); }
  if (st === 'C') { const o = S.open ?? 0; gateL.rotation.y = o * 1.6; gateR.rotation.y = -o * 1.6; C.userData.glow.material.color.set(o > 0.1 ? '#fff2c0' : '#3a3220'); }
  if (st === 'D') { const t = S.belt ?? 0; belt.forEach((p, i) => { const x = -58 + mod(i * 8.5 + t * 120, 120); p.position.x = x; p.position.y = 1.5 + Math.abs(Math.sin(f * 0.3 + i)) * 0.15; }); D.userData.chk.visible = (S.check ?? 0) > 0.5; }
  if (st === 'E') { const g = S.grow ?? 0; steps.forEach((s, i) => { const h = 1 + i * (0.8 + 1.6 * g); s.scale.y = h; s.position.y = h / 2; }); climbers.forEach((c, i) => { const k = mod(i * 0.17 + (S.climb ?? 0) * 0.5, 1), idx = Math.min(11, Math.floor(k * 12)); c.position.set(-44 + idx * 8, 1 + idx * (0.8 + 1.6 * g) + 0.2, 0.5 * Math.sin(f * 0.2 + i)); }); }
  if (st === 'F') { const lit = S.lit ?? 0; tiles.forEach((t, i) => t.material.color.set(i < lit * 12 ? '#ffe9a0' : '#3a3f4a')); F.userData.door.material.color.set((S.door ?? 0) > 0.5 ? '#fff6d0' : '#2a2c34'); F.userData.cone.visible = (S.spot ?? 1) > 0.5; (F.userData.dust || []).forEach((d) => { d.m.position.set(d.x + Math.sin(f * 0.02 + d.ph), mod(d.y + f * d.s * 8, 18), d.z); }); }
}
