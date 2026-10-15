// The playground's own buttons over the scene (bespoke.layer), top left, under the site's header (the language's panel
// is top right, ⏸ bottom right, with ⏭ left of it for the author): ≡ — the list of demonstrations; ↻ — this one again; → — the next; ? — its memo
// (closed at first: try first, read after); ◐ — the language's style (the game's look of it); ⚙ — the switches; and the
// line of the last outcome (what the language gives the game).
//   const view = ui(layer, { demos, styles, on: {go(id), again(), next(), style(i), switch(name, value), forget(),
//     pause(), skip() (given only to the author: then ⏭ is shown)} })
//   view.at(demo) — this one is shown (its title, its memo); view.result(r) — its outcome; view.note(text) — a line
//   view.styled(i) — the style picked; view.switched(switches) — the switches as they are; view.paused(on)
const el = (tag, cls, parent) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  parent?.append(e);
  return e;
};
// (a button never keeps the focus)
const button = (parent, text, title, onclick, cls = '') => {
  const b = el('button', cls, parent);
  Object.assign(b, { type: 'button', textContent: text, title, onclick });
  b.onmousedown = e => e.preventDefault();
  return b;
};
const SWITCHES = [['mute', 'без звука'], ['debug', 'отладка']];
const REASONS = { miss: 'мимо', early: 'рано отпустил', danger: 'в опасность', off: 'сошёл', behind: 'отстал', wrong: 'не туда', timing: 'не в долю', often: 'часто', against: 'против', jerk: 'сорвал' };
const OUTCOMES = { clean: 'успех', flawed: 'успех с ошибками', neutral: 'выбор', loss: 'проигрыш', skipped: 'пропущено' };

export function ui(layer, { demos, styles, on }) {
  const root = el('div', 'pg', layer);
  const bar = el('div', 'pg-bar', root);
  button(bar, '≡', 'все демонстрации', () => toggle(list));
  button(bar, '↻', 'ещё раз', () => on.again());
  button(bar, '→', 'дальше', () => on.next());
  const memoButton = button(bar, '?', 'памятка: что задумано, что проверить', () => toggle(memo));
  const styleButton = button(bar, '◐', 'стиль языка', () => on.style());
  button(bar, '⚙', 'переключатели', () => toggle(switches));
  const title = el('span', 'pg-title', bar);
  const list = el('div', 'pg-list', root), memo = el('div', 'pg-memo', root), switches = el('div', 'pg-switches', root);
  const result = el('p', 'pg-result', root);
  list.hidden = memo.hidden = switches.hidden = true;
  // one card open at a time
  function toggle(card) { const open = card.hidden; for (const c of [list, memo, switches]) c.hidden = true; card.hidden = !open; memoButton.classList.toggle('on', !memo.hidden); }

  // the list: the groups, each its demonstrations; a touch — straight there
  const items = new Map();
  for (const group of [...new Set(demos.map(d => d.group))]) {
    el('h3', '', list).textContent = group;
    for (const d of demos.filter(x => x.group === group)) items.set(d.id, button(list, d.title, '', () => { list.hidden = true; on.go(d.id); }, 'pg-item'));
  }
  // the switches
  const boxes = {};
  for (const [name, label] of SWITCHES) {
    const row = el('label', '', switches);
    const box = el('input', '', row);
    box.type = 'checkbox';
    box.onchange = () => { on.switch(name, box.checked); box.blur(); };
    row.append(label);
    boxes[name] = box;
  }
  button(switches, 'забыть показ', 'палец покажет каждый жест снова, как в первый раз', () => on.forget(), 'pg-forget');
  // ⏸: the play's pause, for the pause's demonstration and any other
  const pause = button(layer, '⏸', 'пауза', () => on.pause(), 'pg-pause');
  // ⏭: the author's skip of the mini-game going (the language asks the game for it; players have none)
  if (on.skip) button(layer, '⏭', 'пропустить мини-игру', () => on.skip(), 'pg-pause pg-skip');

  return {
    at(demo) {
      title.textContent = `${demo.group} · ${demo.title}`;
      for (const [id, b] of items) b.classList.toggle('on', id === demo.id);
      memo.replaceChildren(...demo.memo.map(line => Object.assign(el('p'), { textContent: line })));
      result.textContent = '';
    },
    // r: {as, errors, choice, share} — what the demonstration's code made of it
    result(r) {
      const errors = Object.entries(r.errors || {}).map(([k, n]) => `${REASONS[k] || k} ×${n}`).join(', ');
      const more = [errors ? `ошибки: ${errors}` : r.as === 'skipped' ? '' : 'без ошибок', 'choice' in r ? `выбор: ${r.choice ?? 'ничего'}` : '', r.share != null ? `в зоне: ${Math.round(r.share * 100)}%` : ''];
      result.textContent = [`итог: ${OUTCOMES[r.as] || r.as}`, ...more.filter(Boolean)].join(' · ');
    },
    note(text) { result.textContent = text; },
    styled(i) { styleButton.textContent = ['◐', '☀', '☾'][i] || '◐'; styleButton.title = `стиль: ${styles[i]}`; },
    switched(s) { for (const [name] of SWITCHES) boxes[name].checked = !!s[name]; },
    paused(on_) { pause.textContent = on_ ? '▶' : '⏸'; pause.title = on_ ? 'дальше' : 'пауза'; },
  };
}
