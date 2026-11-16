function worldState(S, f) {
  const st = S.stage || 'A'; for (const k in stages) stages[k].visible = (k === st);
  if (anim[st]) anim[st](S, f);
}
