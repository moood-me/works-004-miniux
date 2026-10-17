// The board of sounds (docs/miniux/wishes.md, wishes 45–49): exactly the sounds the language of mini-games makes, by role, heard as a mini-game
// hears them — on this game's key and style (b.minigame.author.sounds: the language's own, nothing of the board's).
// Short ones (events): a big button each — its number, its role, the event's name; pressed, it sounds. Processes: a
// row each — ▶ starts it, ■ stops it, the slider is its u (progress, danger, closeness, in the zone, time; for motion — how
// fast the finger goes). A heart beside each: Pavel's pick, kept in this browser; the numbers picked are listed at the
// foot, to be said (“I take 3, 7, 12”). Over the scene (its music goes on); gone when the player goes to another
// demonstration (signal). The author's only: the language gives its sounds to the author.
//   board(b, signal, key) → a promise, settled when it is gone; key — the game's key, shown
const KEY = 'moood:miniux:sounds-picked:language-p49'; // (the picks of the boards before — other sounds — are not carried over)
// what each process's slider is
const PARAM = { fill: 'progress', motion: 'speed', seek: 'closeness', zone: 'out ← → in the zone', tension: 'danger', time: 'toward the limit' };
const el = (tag, cls, parent) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  parent?.append(e);
  return e;
};

export function board(b, signal, key) {
  const root = el('div', 'sb', b.layer);
  const sounds = b.minigame.author?.sounds;
  if (!sounds) {
    el('p', 'sb-foot', root).textContent = tr('The sound board is for the game’s author only.');
    return new Promise(ok => signal.addEventListener('abort', () => { root.remove(); ok(); }, { once: true }));
  }
  let picked;
  try { picked = new Set(JSON.parse(localStorage.getItem(KEY)) || []); } catch { picked = new Set(); }
  const keep = () => { try { localStorage.setItem(KEY, JSON.stringify([...picked])); } catch {} };
  el('p', 'sb-foot', root).textContent = `Key: ${key}. Only what sounds in the language.`;
  const list = el('div', 'sb-list', root);
  const foot = el('p', 'sb-foot', root);
  const all = []; // the ids in the board's order: a number is its place here
  const tell = () => {
    const n = all.map((id, i) => (picked.has(id) ? i + 1 : null)).filter(Boolean);
    foot.textContent = n.length ? `picked: ${n.join(', ')}` : 'a heart marks a sound you like';
  };
  const heart = (cell, id) => {
    const h = el('button', 'sb-heart', cell);
    h.type = 'button';
    const paint = () => { h.textContent = picked.has(id) ? '♥' : '♡'; h.classList.toggle('on', picked.has(id)); };
    h.onclick = () => { if (picked.has(id)) picked.delete(id); else picked.add(id); keep(); paint(); tell(); };
    paint();
  };
  // a number, the role and under it the language's name of it
  const label = (parent, role, name) => {
    all.push(name);
    el('b', '', parent).textContent = all.length;
    const words = el('span', 'sb-words', parent);
    el('span', '', words).textContent = role;
    el('small', '', words).textContent = name;
  };
  const { sounds: events, tones } = sounds.list();

  el('h2', '', list).textContent = 'Short';
  const grid = el('div', 'sb-grid', list);
  for (const [event, role] of events) {
    const cell = el('div', 'sb-cell', grid);
    const play = el('button', 'sb-play', cell);
    play.type = 'button';
    label(play, role, event);
    play.onclick = () => { sounds.play(event); play.animate([{ scale: 0.94 }, { scale: 1 }], { duration: 160, easing: 'ease-out' }); };
    heart(cell, event);
  }

  el('h2', '', list).textContent = 'Processes';
  const rows = el('div', 'sb-grid sb-layers', list);
  const going = new Set(); // the processes sounding (stopped when the board is gone)
  for (const [process, role] of tones) {
    const cell = el('div', 'sb-cell', rows);
    const box = el('div', 'sb-proc', cell);
    const head = el('div', 'sb-proc-head', box);
    const go = el('button', 'sb-go', head);
    go.type = 'button';
    label(head, role, process);
    const row = el('label', 'sb-u', box);
    el('small', '', row).textContent = PARAM[process] || 'u';
    const u = el('input', '', row);
    Object.assign(u, { type: 'range', min: 0, max: 1, step: 0.01, value: 0.5 });
    let h = null;
    // (motion: its u is the finger's speed — the level)
    const lead = () => { const x = Number(u.value); h?.set({ u: x, level: process === 'motion' ? x : 1 }); };
    const paint = () => { go.textContent = h ? '■' : '▶'; go.title = h ? 'stop' : 'play'; };
    const stop = () => { h?.remove(); going.delete(stop); h = null; paint(); };
    go.onclick = () => { if (h) { stop(); return; } h = sounds.tone(process); going.add(stop); lead(); paint(); };
    u.oninput = lead;
    paint();
    heart(cell, process);
  }
  tell();

  return new Promise(ok => signal.addEventListener('abort', () => { [...going].forEach(f => f()); root.remove(); ok(); }, { once: true }));
}
