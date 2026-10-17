// miniux — the playground of the language of mini-games (docs/miniux in moood's repository: language.md — what it is
// for the player; playground.md — this game). Not a story: a list of demonstrations (demos.js), each a mini-game of
// the language on the world's things, played once, again (↻) or the next (→); its memo (?) says what is meant, what to
// check and what must work. The language is the page's (bespoke.minigame: a vocabulary, and its ready tricks); each
// demonstration is the game's code on its words — what happens, what is done, what is an error is decided there.
// What is kept of the play (bespoke.keep): {demo: the one shown, style: its index, switches: {mute,
// debug}} — a reload comes back to it.
import { DEMOS, RESET } from './demos.js';
import { ui } from './ui.js';

// the playground's key: its music's (the world's scenes, `scale`) and the language's tonal sounds' (style.key) — C
const KEY = 'C_MAJOR_A_MINOR';
// the language's look (§7): moood's own, a light warm one, a dark cold one — the same meaning in each
const STYLES = [
  { name: tr('moood'), style: {} },
  { name: tr('light warm'), style: { colors: { mark: '#fff8ec', fill: '#ffaa3c', good: '#86d96f', danger: '#e2402a', fork: '#c7b4ff', ghost: 'rgba(255, 238, 214, 0.55)' }, line: 4, font: '"Trebuchet MS", "Segoe UI", sans-serif' } },
  { name: tr('dark cold'), style: { colors: { mark: '#bfe2ff', fill: '#58ccff', good: '#62efbf', danger: '#ff4c8a', fork: '#98a4ff', ghost: 'rgba(150, 205, 255, 0.45)' }, line: 2.5, font: 'ui-monospace, Consolas, monospace', vibrate: false } },
];

export default async function (b) {
  await b.css('ui.css');
  const kept = { demo: DEMOS[0].id, style: 0, switches: {}, ...b.saved };
  const keep = () => b.keep(kept);
  let shown = null, running = null; // the scene shown (its folder); the demonstration going on (its AbortController)

  const settle = () => {
    const s = kept.switches;
    b.minigame.author?.settings({ sound: !s.mute, debug: !!s.debug });
  };
  const view = ui(b.layer, {
    demos: DEMOS, styles: STYLES.map(s => s.name),
    on: {
      go: id => go(id),
      again: () => go(kept.demo),
      next: () => go(DEMOS[(DEMOS.findIndex(x => x.id === kept.demo) + 1) % DEMOS.length].id),
      style: () => { kept.style = (kept.style + 1) % STYLES.length; b.minigame.style({ key: KEY, ...STYLES[kept.style].style }); view.styled(kept.style); keep(); },
      switch: (name, value) => { kept.switches = { ...kept.switches, [name]: value }; settle(); keep(); },
      forget: () => b.minigame.author?.forget(),
      pause: () => { b.pause(!b.paused); view.paused(b.paused); },
      skip: () => b.minigame.skip(),
    },
  });
  b.minigame.style({ key: KEY, ...STYLES[kept.style]?.style });
  view.styled(kept.style);
  view.switched(kept.switches);
  settle();

  // a demonstration: its scene as it starts (its things, every other key at rest), then it played once
  async function go(id) {
    const demo = DEMOS.find(x => x.id === id) || DEMOS[0];
    running?.abort();
    const run = running = new AbortController(), { signal } = run;
    if (b.paused) { b.pause(false); view.paused(false); }
    kept.demo = demo.id;
    keep();
    view.at(demo);
    const state = { ...RESET[demo.scene], ...(demo.demo ? { demo: demo.demo } : {}), ...demo.state };
    if (shown !== demo.scene) { await b.show(demo.scene, { state, fade: shown !== null }); shown = demo.scene; }
    else b.cut(state);
    if (signal.aborted) return;
    const left = new WeakSet(); // (the mini-games left already: skipped, or the demonstration gone)
    const d = {
      b, signal, tricks: b.minigame.tricks, key: KEY,
      // a mini-game, left if the player goes to another demonstration; the ⏭ — left, its outcome as played: success
      mg(o) {
        const mg = b.minigame.start({ ...o, signal });
        mg.on('skip', () => { d.result({ as: 'clean', skipped: true }); mg.leave(); });
        mg.on('end', () => left.add(mg));
        return mg;
      },
      set: (key, value, seconds) => { if (!signal.aborted) b.set(key, value, seconds); },
      bump: key => { if (!signal.aborted) b.set(key, (Number(b.get(key)) || 0) + 1); },
      wait: seconds => new Promise(ok => setTimeout(ok, seconds * 1000)),
      // the first `ev` of a word (a gesture, a mark's mini-game) that passes test → its data; null — the mini-game
      // ended first
      when: (mg, h, ev, test = () => true) => new Promise(ok => {
        const offs = [h.on(ev, x => { if (test(x)) { offs.forEach(f => f()); ok(x ?? true); } }), mg.on('end', () => { offs.forEach(f => f()); ok(null); })];
      }),
      // each frame fn({t, dt}) till it returns true (→ true) or the mini-game ends (→ false)
      loop: (mg, fn) => new Promise(ok => {
        const offs = [mg.on('frame', e => { if (fn(e)) { offs.forEach(f => f()); ok(true); } }), mg.on('end', () => { offs.forEach(f => f()); ok(false); })];
      }),
      // errors the game counts: shown (a chip) and counted — or, soft, shown only
      errors(mg, soft = false) {
        const all = {};
        return { all, add(reason, o) { mg.error(reason, { ...o, chip: !soft }); if (!soft) all[reason] = (all[reason] || 0) + 1; } };
      },
      // the end: as given, else clean or flawed by the errors; its outcome shown at once, as the end begins
      async end(mg, { as, errors = {}, ...rest } = {}) {
        if (left.has(mg)) return;
        const how = as || (Object.keys(errors).length ? 'flawed' : 'clean');
        d.result({ as: how, errors, ...rest });
        await mg.end({ as: how });
      },
      result: r => { if (!signal.aborted) view.result(r); },
      note: text => { if (!signal.aborted) view.note(text); },
    };
    // (broken: said, and its mini-game taken away — the scene answers again)
    try { await demo.run(d); } catch (e) { if (!signal.aborted) b.trouble(`the demonstration broke: ${e.message || e}`); run.abort(); }
  }
  await go(kept.demo);
}
