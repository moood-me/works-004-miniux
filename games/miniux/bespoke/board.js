// The board of sounds (П45–П49): exactly the sounds the language of mini-games makes, by role, heard as a mini-game
// hears them — on this game's key and style (b.minigame.author.sounds: the language's own, nothing of the board's).
// Short ones (events): a big button each — its number, its role, the event's name («новый» — its sound was changed);
// pressed, it sounds. Last, to compare and choose: the sounds the changed roles sounded before («было») and the
// language's candidates («кандидат», no role sounds them) — each with its role, played as loud as that role. Processes: a
// row each — ▶ starts it, ■ stops it, the slider is its u (ход, опасность, близость, в зоне, время; for движение — how
// fast the finger goes). A heart beside each: Pavel's pick, kept in this browser; the numbers picked are listed at the
// foot, to be said («беру 3, 7, 12»). Over the scene (its music goes on); gone when the player goes to another
// demonstration (signal). The author's only: the language gives its sounds to the author.
//   board(b, signal, key) → a promise, settled when it is gone; key — the game's key, shown
const KEY = 'moood:miniux:sounds-picked:language-shades'; // (the picks of the boards before — other sounds — are not carried over)
// what each process's slider is
const PARAM = { fill: 'ход', motion: 'скорость', seek: 'близость', zone: 'вне ← → в зоне', tension: 'опасность', time: 'к пределу' };
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
    el('p', 'sb-foot', root).textContent = 'Доска звуков — только автору игры.';
    return new Promise(ok => signal.addEventListener('abort', () => { root.remove(); ok(); }, { once: true }));
  }
  let picked;
  try { picked = new Set(JSON.parse(localStorage.getItem(KEY)) || []); } catch { picked = new Set(); }
  const keep = () => { try { localStorage.setItem(KEY, JSON.stringify([...picked])); } catch {} };
  el('p', 'sb-foot', root).textContent = `Тональность: ${key}. Только то, что звучит в языке; внизу — для сравнения.`;
  const list = el('div', 'sb-list', root);
  const foot = el('p', 'sb-foot', root);
  const all = []; // the ids in the board's order: a number is its place here
  const tell = () => {
    const n = all.map((id, i) => (picked.has(id) ? i + 1 : null)).filter(Boolean);
    foot.textContent = n.length ? `выбрано: ${n.join(', ')}` : 'сердечко — отметить звук, который нравится';
  };
  const heart = (cell, id) => {
    const h = el('button', 'sb-heart', cell);
    h.type = 'button';
    const paint = () => { h.textContent = picked.has(id) ? '♥' : '♡'; h.classList.toggle('on', picked.has(id)); };
    h.onclick = () => { if (picked.has(id)) picked.delete(id); else picked.add(id); keep(); paint(); tell(); };
    paint();
  };
  // a number, the role and under it the language's name of it (and its mark: новый, было, кандидат)
  const label = (parent, role, name, mark = '') => {
    all.push(name);
    el('b', '', parent).textContent = all.length;
    const words = el('span', 'sb-words', parent);
    el('span', '', words).textContent = role;
    el('small', '', words).textContent = name;
    if (mark) el('i', `sb-mark sb-${{ новый: 'new', было: 'was', кандидат: 'tried' }[mark]}`, words).textContent = mark;
  };
  const { sounds: events, tones, tried } = sounds.list();
  // a short one's button: pressed, it sounds
  const button = (grid, role, name, mark, sound) => {
    const cell = el('div', 'sb-cell', grid);
    const play = el('button', 'sb-play', cell);
    play.type = 'button';
    label(play, role, name, mark);
    play.onclick = () => { sound(); play.animate([{ scale: 0.94 }, { scale: 1 }], { duration: 160, easing: 'ease-out' }); };
    heart(cell, name);
  };

  el('h2', '', list).textContent = 'Короткие';
  const grid = el('div', 'sb-grid', list);
  for (const [event, role, mark] of events) button(grid, role, event, mark, () => sounds.play(event));

  el('h2', '', list).textContent = 'Процессы';
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
    // (движение: its u is the finger's speed — the level)
    const lead = () => { const x = Number(u.value); h?.set({ u: x, level: process === 'motion' ? x : 1 }); };
    const paint = () => { go.textContent = h ? '■' : '▶'; go.title = h ? 'стоп' : 'играть'; };
    const stop = () => { h?.remove(); going.delete(stop); h = null; paint(); };
    go.onclick = () => { if (h) { stop(); return; } h = sounds.tone(process); going.add(stop); lead(); paint(); };
    u.oninput = lead;
    paint();
    heart(cell, process);
  }
  el('h2', '', list).textContent = 'Сравнить: было и кандидаты';
  const others = el('div', 'sb-grid', list);
  for (const [id, event, role, mark] of tried) button(others, role, id, mark, () => sounds.hear(id, event));
  tell();

  return new Promise(ok => signal.addEventListener('abort', () => { [...going].forEach(f => f()); root.remove(); ok(); }, { once: true }));
}
