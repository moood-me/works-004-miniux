// The board of sounds (П45): every sound of the language's library (bespoke.minigame.samples — the page's sounds.js),
// a big button each — its number, its name and what in the language it is a candidate for (use); pressed, it sounds.
// A heart beside it: Pavel's pick, kept in this browser; the numbers picked are listed at the foot, to be said
// («беру 3, 7, 12»). Over the scene; gone when the
// player goes to another demonstration (signal).
//   board(b, signal) → a promise, settled when it is gone
const KEY = 'moood:miniux:sounds-picked';
const el = (tag, cls, parent) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  parent?.append(e);
  return e;
};

export function board(b, signal) {
  let picked;
  try { picked = new Set(JSON.parse(localStorage.getItem(KEY)) || []); } catch { picked = new Set(); }
  const keep = () => { try { localStorage.setItem(KEY, JSON.stringify([...picked])); } catch {} };
  const root = el('div', 'sb', b.layer);
  const grid = el('div', 'sb-grid', root);
  const foot = el('p', 'sb-foot', root);
  const numbers = () => b.minigame.samples.map((s, i) => (picked.has(s.id) ? i + 1 : null)).filter(Boolean);
  const tell = () => { const n = numbers(); foot.textContent = n.length ? `выбрано: ${n.join(', ')}` : 'сердечко — отметить звук, который нравится'; };
  b.minigame.samples.forEach((s, i) => {
    const cell = el('div', 'sb-cell', grid);
    const play = el('button', 'sb-play', cell);
    play.type = 'button';
    el('b', '', play).textContent = i + 1;
    const words = el('span', 'sb-words', play);
    el('span', '', words).textContent = s.name;
    el('small', '', words).textContent = s.use;
    play.onclick = () => { b.minigame.sample(s.id); play.animate([{ scale: 0.94 }, { scale: 1 }], { duration: 160, easing: 'ease-out' }); };
    const heart = el('button', 'sb-heart', cell);
    heart.type = 'button';
    const paint = () => { heart.textContent = picked.has(s.id) ? '♥' : '♡'; heart.classList.toggle('on', picked.has(s.id)); };
    heart.onclick = () => { if (picked.has(s.id)) picked.delete(s.id); else picked.add(s.id); keep(); paint(); tell(); };
    paint();
  });
  tell();
  return new Promise(ok => signal.addEventListener('abort', () => { root.remove(); ok(); }, { once: true }));
}
