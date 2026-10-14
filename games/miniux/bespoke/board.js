// The board of sounds (П45–П48): the language's library (bespoke.minigame — the page's sounds.js), by its groups
// («Понравилось», then the families: Орган, Фисгармония…). Short sounds (samples): a big button each — its number, its
// name and its role; pressed, it sounds. Processes (layers): a pad each — hold it and move along it: across, the
// layer's u (ход, опасность, время, в зоне); for движение, how fast the finger goes; let go — it stops (налив: cut at
// the right end, sinks before it). A heart beside each: Pavel's pick, kept in this browser; the numbers picked are
// listed at the foot, to be said («беру 3, 7, 12»). Over the scene; gone when the player goes to another
// demonstration (signal).
//   board(b, signal) → a promise, settled when it is gone
const KEY = 'moood:miniux:sounds-picked:families'; // (the picks of the boards before — other sounds — are not carried over)
const FAST = 1.2; // px per ms: as fast as a finger goes (speed 1)
const el = (tag, cls, parent) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  parent?.append(e);
  return e;
};

export function board(b, signal) {
  const mg = b.minigame;
  let picked;
  try { picked = new Set(JSON.parse(localStorage.getItem(KEY)) || []); } catch { picked = new Set(); }
  const keep = () => { try { localStorage.setItem(KEY, JSON.stringify([...picked])); } catch {} };
  const root = el('div', 'sb', b.layer);
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
  // a number, the name and under it what it is for
  const label = (parent, name, under) => {
    el('b', '', parent).textContent = all.length;
    const words = el('span', 'sb-words', parent);
    el('span', '', words).textContent = name;
    el('small', '', words).textContent = under;
  };
  const hint = l => `${l.role} — ${l.param === 'скорость' ? 'веди то быстрее, то медленнее' : `${l.param}: веди слева направо`}`;
  const groups = [...new Set([...mg.samples, ...mg.layers].map(x => x.group))];

  for (const group of groups) {
    el('h2', '', list).textContent = group;
    const grid = el('div', 'sb-grid', list);
    for (const s of mg.samples.filter(x => x.group === group)) {
      all.push(s.id);
      const cell = el('div', 'sb-cell', grid);
      const play = el('button', 'sb-play', cell);
      play.type = 'button';
      label(play, s.name, s.role);
      play.onclick = () => { mg.sample(s.id); play.animate([{ scale: 0.94 }, { scale: 1 }], { duration: 160, easing: 'ease-out' }); };
      heart(cell, s.id);
    }
    const layers = mg.layers.filter(x => x.group === group);
    if (!layers.length) continue;
    const pads = el('div', 'sb-grid sb-layers', list);
    for (const l of layers) {
      all.push(l.id);
      const cell = el('div', 'sb-cell', pads);
      const pad = el('div', 'sb-pad', cell);
      label(pad, l.name, hint(l));
      const fill = el('i', '', pad);
      pad.addEventListener('pointerdown', e => hold(e, pad, fill, l), { signal });
      heart(cell, l.id);
    }
  }
  tell();

  // a pad held: the layer started, led every frame by where (or how fast) the finger is, stopped when let go
  function hold(e, pad, fill, l) {
    e.preventDefault();
    pad.setPointerCapture(e.pointerId);
    const layer = mg.layer(l.id), box = pad.getBoundingClientRect(), bySpeed = l.param === 'скорость';
    let x = e.clientX, last = { x, t: performance.now() }, speed = 0, frame = 0;
    const lead = () => {
      const now = performance.now(), v = Math.abs(x - last.x) / Math.max(1, now - last.t);
      last = { x, t: now };
      speed += (Math.min(1, v / FAST) - speed) * 0.25;
      const u = bySpeed ? speed : Math.max(0, Math.min(1, (x - box.left) / box.width));
      layer.set(u, bySpeed ? speed : 1);
      fill.style.width = `${u * 100}%`;
      frame = requestAnimationFrame(lead);
    };
    const move = m => { x = m.clientX; };
    const up = () => {
      cancelAnimationFrame(frame);
      layer.stop();
      fill.style.width = '0';
      pad.removeEventListener('pointermove', move);
      pad.removeEventListener('pointerup', up);
      pad.removeEventListener('pointercancel', up);
      signal.removeEventListener('abort', up);
    };
    pad.addEventListener('pointermove', move);
    pad.addEventListener('pointerup', up);
    pad.addEventListener('pointercancel', up);
    signal.addEventListener('abort', up, { once: true });
    layer.start();
    lead();
  }

  return new Promise(ok => signal.addEventListener('abort', () => { root.remove(); ok(); }, { once: true }));
}
