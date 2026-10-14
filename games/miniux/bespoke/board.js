// The board of sounds (П45–П47): the language's library (bespoke.minigame — the page's sounds.js), grouped by role.
// Short sounds (samples): a big button each — its number and name; pressed, it sounds. Processes (layers): a pad each —
// hold it and move along it: across, the layer's u (ход, опасность, время, в зоне); for движение and трещотка, how fast
// the finger goes; let go — it stops (налив: cut at the right end, sinks before it). A heart beside each: Pavel's pick,
// kept in this browser; the numbers picked are listed at the foot, to be said («беру 3, 7, 12»). Over the scene; gone
// when the player goes to another demonstration (signal).
//   board(b, signal) → a promise, settled when it is gone
const KEY = 'moood:miniux:sounds-picked:roles'; // (the picks of the board before — other sounds — are not carried over)
const FAST = 1.2; // px per ms: as fast as a finger goes (speed 1)
const el = (tag, cls, parent) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  parent?.append(e);
  return e;
};
const byRole = list => list.reduce((m, x) => m.set(x.role, [...(m.get(x.role) || []), x]), new Map());

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
  const label = (parent, s) => {
    el('b', '', parent).textContent = all.push(s.id);
    el('span', '', parent).textContent = s.name;
  };

  for (const [role, sounds] of byRole(mg.samples)) {
    el('h3', '', list).textContent = role;
    const grid = el('div', 'sb-grid', list);
    for (const s of sounds) {
      const cell = el('div', 'sb-cell', grid);
      const play = el('button', 'sb-play', cell);
      play.type = 'button';
      label(play, s);
      play.onclick = () => { mg.sample(s.id); play.animate([{ scale: 0.94 }, { scale: 1 }], { duration: 160, easing: 'ease-out' }); };
      heart(cell, s.id);
    }
  }

  el('h2', '', list).textContent = 'Процессы';
  for (const [role, layers] of byRole(mg.layers)) {
    const param = layers[0].param;
    el('h3', '', list).textContent = `${role} — ${param === 'скорость' ? 'веди то быстрее, то медленнее' : `${param}: веди слева направо`}`;
    const grid = el('div', 'sb-grid sb-layers', list);
    for (const l of layers) {
      const cell = el('div', 'sb-cell', grid);
      const pad = el('div', 'sb-pad', cell);
      label(pad, l);
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
