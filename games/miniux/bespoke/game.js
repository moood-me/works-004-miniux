// miniux — the playground of the language of mini-games (docs/miniux in moood's repository: language.md — what it is
// for the player; playground.md — this game). Not a story: a list of demonstrations (demos.js), each a mini-game of
// the language on the world's things, played once, again (↻) or the next (→); its memo (?) says what is meant, what to
// check and what must work. The language is the page's (bespoke.minigame); the game only says what each mini-game is
// made of and moves the scene's keys with the gestures' going.
// What is kept of the play (bespoke.keep): {demo: the one shown, style: its index, switches: {mute, less, keys,
// debug}} — a reload comes back to it.
import { DEMOS, RESET } from './demos.js';
import { ui } from './ui.js';

// the language's look (§7): moood's own, a light warm one, a dark cold one — the same meaning in each
const STYLES = [
  { name: 'moood', style: {} },
  { name: 'светлый тёплый', style: { colors: { mark: '#fff8ec', fill: '#ffaa3c', good: '#86d96f', danger: '#e2402a', fork: '#c7b4ff', ghost: 'rgba(255, 238, 214, 0.55)' }, line: 4, font: '"Trebuchet MS", "Segoe UI", sans-serif' } },
  { name: 'тёмный холодный', style: { colors: { mark: '#bfe2ff', fill: '#58ccff', good: '#62efbf', danger: '#ff4c8a', fork: '#98a4ff', ghost: 'rgba(150, 205, 255, 0.45)' }, line: 2.5, font: 'ui-monospace, Consolas, monospace', vibrate: false } },
];

export default async function (b) {
  await b.css('ui.css');
  const kept = { demo: DEMOS[0].id, style: 0, switches: {}, ...b.saved };
  const keep = () => b.keep(kept);
  let shown = null, running = null; // the scene shown (its title); the demonstration going on (its AbortController)

  const settle = () => {
    const s = kept.switches;
    b.minigame.settings({ sound: !s.mute, motion: s.less ? 'less' : null, keys: s.keys ? 'only' : null, debug: !!s.debug });
  };
  const view = ui(b.layer, {
    demos: DEMOS, styles: STYLES.map(s => s.name),
    on: {
      go: id => go(id),
      again: () => go(kept.demo),
      next: () => go(DEMOS[(DEMOS.findIndex(x => x.id === kept.demo) + 1) % DEMOS.length].id),
      style: () => { kept.style = (kept.style + 1) % STYLES.length; b.minigame.style(STYLES[kept.style].style); view.styled(kept.style); keep(); },
      switch: (name, value) => { kept.switches = { ...kept.switches, [name]: value }; settle(); keep(); },
      forget: () => b.minigame.forget(),
      pause: () => { b.pause(!b.paused); view.paused(b.paused); },
    },
  });
  b.minigame.style(STYLES[kept.style]?.style || {});
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
    const d = {
      b,
      mg: o => b.minigame.start({ ...o, signal }),
      set: (key, value, seconds) => { if (!signal.aborted) b.set(key, value, seconds); },
      bump: key => { if (!signal.aborted) b.set(key, (Number(b.get(key)) || 0) + 1); },
      wait: seconds => new Promise(ok => setTimeout(ok, seconds * 1000)),
      choose: (ref, actions, o) => (signal.aborted ? Promise.resolve(null) : b.minigame.choose(ref, actions, o)),
      result: r => { if (!signal.aborted) view.result(r); },
      note: text => { if (!signal.aborted) view.note(text); },
    };
    try { await demo.run(d); } catch (e) { if (!signal.aborted) b.trouble(`демонстрация сломалась: ${e.message || e}`); }
  }
  await go(kept.demo);
}
