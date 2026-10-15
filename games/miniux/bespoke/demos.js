// The playground's demonstrations (docs/miniux/playground.md): each word of the language of mini-games (a vocabulary:
// marks, gestures that report, responses, the ghost, sounds, the plate) and its ready tricks, each part of a mini-game,
// and some mini-games of the three games put into it — each on the playground's things («Мастерская»: the key `demo`
// sets what is on the table; «Палуба»: the deck, its close-up, the ship under way). Each is the game's own code: what
// happens, what is done, what is an error, when it ends — decided here, not by the language.
// A demonstration: {id, group, title, scene, demo (the workshop's `demo`), state (more of the scene's values), memo
// (what is meant, what to check, what must work — 3–6 lines), run(d)} — run plays it once; d (game.js): d.mg(o) — a
// mini-game (bespoke.minigame.start, left if the player goes to another demonstration), d.tricks, d.set(key, value,
// seconds), d.bump(key) — a counter of the scene +1, d.key — the playground's key, d.wait(seconds), d.when(mg, h, event, test), d.loop(mg, fn),
// d.errors(mg, soft), d.end(mg, {as, errors, choice, share}), d.result(r), d.note(text), d.b — bespoke.
import { board } from './board.js';

export const WORKSHOP = 'Мастерская', DECK = 'Палуба';

// what each scene's keys are at the start of a demonstration (all of them: what one left is not seen in the next)
export const RESET = {
  [WORKSHOP]: {
    bell_hits: 0, drawer: 'none', drawer_open: 0, door_knocks: 0, door_reply: 0, door_open: 0, bellows: 0, lantern: 0, wind: 0,
    candle: 0, candle_shake: 0, wick1: 0, wick2: 0, wick3: 0, climb: 0, grip: 'none', rope: 0, shutter: 0, crate: 0, knot: 0,
    knot_off: false, peg: 'none', peg_u: 0, peg_v: 0, bubble1: 'free', bubble2: 'free', bubble3: 'free', bubble1_u: 0, bubble1_v: 0,
    bubble2_u: 0, bubble2_v: 0, bubble3_u: 0, bubble3_v: 0, crack: 0, screw1: 0, screw2: 0, screw3: 0, screw4: 0, plate: 0,
    floor_found: false, shell: 'none', shell_odd: 's2', shell_found: false, drum_hits: 0, drum2_hits: 0, boat_heading: 0,
    zone_center: 0, zone_kind: 'zone', zone_lit: 0, sand: 0,
  },
  [DECK]: { heading: 0, on_course: 0, under_way: 0, sail: 0, bell_hits: 0, closeup: 0, rig1: 0, rig2: 0, rig3: 0, rig4: 0 },
};

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
// the wind's gusts over the lantern: a gust every ~4 s, 1.5 s long (0…1, smooth at its edges)
const gust = t => { const ph = (t + 1.5) % 4.2; return ph < 1.6 ? Math.sin(Math.PI * ph / 1.6) : 0; };
// a danger growing under the finger while a gust blows, falling otherwise (the lantern; «Кольцо»)
const windy = rate => ({ dt, t, level, held }) => level + (held && gust(t) > 0.3 ? rate * gust(t) : -0.7) * dt;
const sockets = ['sockets#s1', 'sockets#s2', 'sockets#s3'];
const shells = ['shells#s1', 'shells#s2', 'shells#s3'];
const crack = Array.from({ length: 7 }, (_, i) => `crack#p${i}`);
const bell = d => d.bump('bell_hits');
// a thing carried by the finger, drawn in the scene where it is: its place between the sockets s1 (0) and s3 (u 1)
const carried = (d, key, at) => {
  const r = at && d.b.minigame.relative(at, 'sockets#s1', 'sockets#s3');
  if (r) { d.set(`${key}_u`, r.u); d.set(`${key}_v`, r.v); }
};
// the lead's demonstrations move the boat: its heading, the zone (or the firefly, the bee), whether it is in it
const boat = (d, s) => { d.set('boat_heading', s.arrow); d.set('zone_center', s.zone); d.set('zone_lit', s.in ? 1 : 0, 0.3); };

// ── the game's own small pieces, on the language's words ──
// steps (for tricks.steps) that say «полпути» (the language's halfway): when the step that brings the bar to half — not
// the last — is done with no error counted so far
const halfway = (mg, list) => {
  const at = Math.ceil(list.length / 2) - 1;
  let erred = false;
  return list.map((step, i) => async bar => {
    const r = await step(bar);
    erred ||= Object.values(r.errors || {}).some(n => n > 0);
    if (i === at && i < list.length - 1 && r.state === 'done' && !erred) mg.sound('halfway');
    return r;
  });
};

// one press on a mark: the thing glows, a touch beside it is «мимо»; teach — the ghost shows it at its first meeting
async function pressOnce(d, mg, { at, glow, bar, soft = false, teach = null }) {
  const errors = d.errors(mg, soft), mark = mg.mark({ at }), g = mg.press({ on: mark });
  if (glow) mg.glow(glow);
  const shown = teach && d.tricks.teach(mg, [g], { id: teach });
  const off = mg.on('miss', e => errors.add('miss', { at: e.mark, finger: e }));
  const pressed = await d.when(mg, g, 'press');
  off(); shown?.remove();
  if (!pressed) return { state: 'left', errors: errors.all };
  (bar || (u => mg.plate.set({ fill: u })))(1);
  mg.snap({ at: mark }); mark.remove();
  return { state: 'done', errors: errors.all };
}

// held anywhere till full: under the finger only a dot, the thing glows; danger(s) → the level, its arc on a mark at
// dangerAt (a mark with no gesture on it takes no touch: the finger anywhere is the hold's)
async function holdAnywhere(d, mg, o) {
  const errors = d.errors(mg, o.soft), g = mg.hold({ on: null, seconds: o.seconds });
  const arc = o.danger ? mg.mark({ at: o.dangerAt }) : null, tension = o.danger ? mg.layer('tension') : null;
  if (o.glow) mg.glow(o.glow);
  const shown = d.tricks.teach(mg, [g], { id: 'hold:anywhere' });
  const up = g.on('up', () => { if (g.state.fill > 0.1 && g.state.fill < 1) errors.add('early', { at: arc }); });
  let level = 0;
  const ok = await d.loop(mg, ({ t, dt }) => {
    const s = g.state;
    if (o.danger) {
      level = clamp(o.danger({ dt, t, level, held: s.held }));
      arc.set({ danger: level }); tension.set({ u: level });
      if (s.held && level >= 1) { errors.add('danger', { at: arc }); g.set({ fill: 0 }); level = 0; }
    }
    mg.plate.set({ glow: level > 0.6 ? 'bad' : s.held ? 'good' : 'idle' });
    (o.bar || (u => mg.plate.set({ fill: u })))(s.fill);
    o.progress?.(s.fill);
    return s.fill >= 1;
  });
  up(); shown.remove(); g.remove(); arc?.remove(); tension?.remove();
  if (ok) mg.snap({});
  return { state: ok ? 'done' : 'left', errors: errors.all };
}

// a screw turned, or left loose: the quiet «оставить» beside it is a second path, seen from the start (both shown)
async function turnOrLeave(d, mg, { at, turns, bar, progress }) {
  const errors = d.errors(mg), mark = mg.mark({ at, kind: 'dash' }), g = mg.turn({ on: mark });
  const quiet = mg.mark({ at: 'screws#leave', quiet: true }), leave = mg.press({ on: quiet });
  const shown = d.tricks.teach(mg, [g, leave], { id: 'turn:leave', still: null });
  let left = false;
  const offs = [g.on('against', () => errors.add('against', { at: g })), leave.on('press', () => { left = true; }),
    mg.on('miss', e => errors.add('miss', { at: e.mark, finger: e }))];
  const ok = await d.loop(mg, () => {
    const u = clamp(g.state.most / turns);
    bar(u); progress(u);
    return left || u >= 1;
  });
  offs.forEach(f => f()); shown.remove();
  if (ok) mg.snap({ at: left ? quiet : mark });
  mark.remove(); quiet.remove();
  return { state: !ok ? 'left' : left ? 'leave' : 'done', errors: errors.all };
}

// his beat and one's own: what leads has no mark — a light growing toward its beat (a rhythm on it, which takes no
// touch); the player's ring on their own thing, from the start; each beat, half a beat after it, goes on the plate the
// way it went — after his (a touch in its window), one's own (a touch between), none. Neutral: no errors, no glow
async function ownBeat(d, mg, { bpm, beats }) {
  const lead = mg.mark({ at: 'drum#skin', kind: 'light' }), mine = mg.mark({ at: 'drum2#skin', color: 'own' });
  const beat = mg.rhythm({ on: lead, bpm }), play = mg.touch({ on: mine });
  mg.glow('drum2');
  mg.plate.set({ glow: null });
  const shown = d.tricks.teach(mg, [play], { id: 'rhythm:own', still: null });
  const period = 60 / bpm, at = [], taps = [], ways = [];
  let told = 0, theirs = 0, own = 0;
  const inBeat = x => at.some(b => Math.abs(x - b) <= 0.15);
  const offs = [
    beat.on('beat', ({ k }) => { at[k] = beat.state.t; d.bump('drum_hits'); }),
    play.on('down', () => {
      taps.push(beat.state.t); d.bump('drum2_hits');
      // (playing with him: the ring takes his colour — a way, not «right»)
      mine.set({ color: taps.length >= 2 && taps.slice(-3).every(inBeat) ? 'theirs' : 'own' });
    }),
    mg.on('miss', e => mg.error('miss', { at: mine, finger: e, chip: false })),
  ];
  const ok = await d.loop(mg, () => {
    while (told < beats && at[told] != null && beat.state.t >= at[told] + period / 2) {
      const by = taps.filter(x => Math.abs(x - at[told]) < period / 2);
      const as = !by.length ? 'none' : by.some(x => Math.abs(x - at[told]) <= 0.15) ? 'theirs' : 'own';
      if (as === 'theirs') theirs++; else if (as === 'own') own++;
      ways.push({ from: told / beats, to: (told + 1) / beats, as });
      told++;
      mg.plate.set({ ways, fill: told / beats });
    }
    return told >= beats;
  });
  offs.forEach(f => f()); shown.remove();
  return ok ? { state: 'done', choice: taps.length < 2 ? 'none' : theirs >= own ? 'theirs' : 'own' } : { state: 'left' };
}

// breaths kept: a rhythm's breath (the ring grows — held, falls — let go); each breath, at its end, kept or not (held
// right most of it) → onBreath(kept); the plate's glow — how it goes now
function breaths(mg, g, onBreath) {
  let right = 0, span = 0;
  const offs = [
    mg.on('frame', ({ dt }) => {
      const s = g.state, ok = s.held === (s.breath === 'in');
      span += dt; if (ok) right += dt;
      mg.plate.set({ glow: ok ? (s.held ? 'good' : 'idle') : 'bad' });
    }),
    g.on('beat', ({ k }) => { if (k % 2 !== 1) return; const kept = span > 0 && right / span >= 0.7; right = span = 0; onBreath(kept); }),
  ];
  return () => offs.forEach(f => f());
}

export const DEMOS = [
  // ── the words: gestures ──
  {
    id: 'press', group: 'Жесты', title: 'Нажать', scene: WORKSHOP, demo: 'bell',
    memo: ['Колокольчик светится сам (мягкий пульс) — он твой; на нём кольцо. Нажми — срабатывает сразу, на касании.',
      'Проверить: вверху плашка «Колокольчик давно молчит»; от касания кольцо сжимается, вокруг пальца — светлое кольцо, мягкий стук дерева.',
      'Нажми мимо — рябь у пальца, кольцо дёргается к нему, глухой звук; на полосе плашки тихо появляется щербинка.',
      'Первая встреча с жестом за партию (когда палец показывает его впервые) — мягкая проба: ошибка видна, но не считается, щербинки нет. Повторный прогон считает; ⚙ «забыть показ» — снова первая встреча.'],
    async run(d) {
      const mg = d.mg({ phrase: 'Колокольчик давно молчит' });
      const r = await pressOnce(d, mg, { at: 'bell#top', glow: 'bell', soft: d.tricks.first('press'), teach: 'press' });
      if (r.state === 'done') bell(d);
      await d.end(mg, r);
    },
  },
  {
    id: 'petals', group: 'Жесты', title: 'Нажать с лепестками', scene: WORKSHOP, demo: 'box',
    memo: ['У ящика три ящичка: нажми кольцо — вокруг раскроются три лепестка со словами.',
      'Выбор — тап по лепестку или, не отпуская, веди палец с кольца на лепесток и отпусти там; касание мимо лепестков их закрывает.',
      'Проверить: выбор — полоса без огонька, конец — ровный мягкий аккорд.'],
    async run(d) {
      const mg = d.mg({ phrase: 'В одном из ящичков — то, что нужно' });
      const box = mg.mark({ at: 'box#front' });
      const g = mg.press({ on: box, petals: [{ id: 'top', label: 'Верхний' }, { id: 'middle', label: 'Средний' }, { id: 'bottom', label: 'Нижний' }] });
      mg.glow('box'); mg.plate.set({ glow: null });
      d.tricks.teach(mg, [g], { id: 'press:petals', still: null });
      const c = await d.when(mg, g, 'choose');
      if (!c) return;
      d.set('drawer', c.id); d.set('drawer_open', 1, 0.6);
      mg.plate.set({ fill: 1 }); mg.snap({ at: box });
      await d.end(mg, { as: 'neutral', choice: c.id });
    },
  },
  {
    id: 'repeat', group: 'Жесты', title: 'Нажать с повтором и ответом', scene: WORKSHOP, demo: 'door',
    memo: ['Постучи в дверцу три раза — каждое касание свой стук, дверца вздрагивает, на полосе — засечки. Потом ход сцены: стучат в ответ.',
      'Рядом бледное кольцо «уйти» — второй путь (тихая метка с тем же «нажать»), видно сразу; палец показывает оба.',
      'Проверить: во время ответа меток и свечения нет, огонёк на плашке медленно дышит.',
      'Выбрал «уйти» — развилка, конец нейтральный.'],
    async run(d) {
      const mg = d.mg({ phrase: 'За дверцей кто-то есть. Можно и не стучать' });
      const knock = mg.mark({ at: 'door#knock' }), away = mg.mark({ at: 'door#away', quiet: true });
      const g = mg.press({ on: knock }), leave = mg.press({ on: away });
      mg.plate.set({ notches: [1 / 3, 2 / 3] });
      d.tricks.teach(mg, [g, leave], { id: 'press:two', still: null });
      let how = null;
      g.on('press', ({ count }) => { d.bump('door_knocks'); mg.plate.set({ fill: count / 3 }); if (count >= 3) how = 'knocked'; });
      leave.on('press', () => { how = 'away'; });
      if (!await d.loop(mg, () => how)) return;
      if (how === 'away') { mg.snap({ at: away }); await d.end(mg, { as: 'neutral', choice: 'away' }); return; }
      mg.snap({ at: knock }); knock.remove(); away.remove();
      mg.sceneTurn(true);
      for (let i = 0; i < 2; i++) { await d.wait(0.7); d.bump('door_reply'); }
      await d.wait(0.8); d.set('door_open', 1, 1); await d.wait(1);
      mg.sceneTurn(false);
      await d.end(mg, { choice: 'knocked' });
    },
  },
  {
    id: 'hold', group: 'Жесты', title: 'Держать', scene: WORKSHOP, demo: 'bellows',
    memo: ['Кольцо с желобом на ручке меха — нажми и держи, пока желоб не нальётся (1.5 с). Мех раздувается. (Приём «держать до налива».)',
      'Проверить: держишь — мех светится ровно; налив виден из-под пальца, слышно дыхание; полно — защёлка, дальше держать не надо.',
      'Отпусти раньше — налив стекает назад, мех пульсирует снова (первая встреча за партию — без счёта ошибки).'],
    async run(d) {
      const mg = d.mg({ phrase: 'Мех опал до дна' });
      await d.end(mg, await d.tricks.holdTillFull(mg, { at: 'bellows#handle', glow: 'bellows', seconds: 1.5, progress: u => d.set('bellows', u) }));
    },
  },
  {
    id: 'hold-anywhere', group: 'Жесты', title: 'Держать где угодно', scene: WORKSHOP, demo: 'bellows',
    memo: ['Метки на вещи нет: держи где угодно на экране (кроме углов с кнопками) — мех раздувается, пока держишь.',
      'Под пальцем — только точка: касание принято. Ход — в самом мехе (раздувается) и на плашке.',
      'Проверить: держишь — мех светится ровно, отпустил — пульсирует; палец показывает у середины окна.'],
    async run(d) {
      const mg = d.mg({ phrase: 'Мех ходит от любого касания' });
      await d.end(mg, await holdAnywhere(d, mg, { glow: 'bellows', seconds: 2, progress: u => d.set('bellows', u) }));
    },
  },
  {
    id: 'hold-danger', group: 'Жесты', title: 'Держать с опасностью', scene: WORKSHOP, demo: 'lantern',
    memo: ['Держи на фонаре — он разгорается. Дуга по краю метки краснеет, когда дует ветер; дойдёт до конца под пальцем — фонарь гаснет до нуля.',
      'Отпусти — ветер стихает, дуга спадает.',
      'Проверить: видно, как близко опасность; без звука понятно; держать дольше полного не нужно.'],
    async run(d) {
      const mg = d.mg({ phrase: 'Огню мешает ветер' });
      const r = await d.tricks.holdTillFull(mg, { at: 'lantern#flame', glow: 'lantern', seconds: 4, danger: s => { d.set('wind', gust(s.t)); return windy(0.9)(s); }, progress: u => d.set('lantern', u) });
      d.set('wind', 0, 0.5);
      await d.end(mg, r);
    },
  },
  {
    id: 'hold-still', group: 'Жесты', title: 'Замереть', scene: WORKSHOP, demo: 'candle',
    memo: ['Держи на свече 3 с и не двигай пальцем: опасность растёт от движения (дрожь до 24 px не в счёт).',
      'Проверить: дуга на краю метки растёт, когда ведёшь пальцем, и спадает, когда замер; пламя мечется вместе с ней.',
      'Дошла до конца — метка сжимается рывком, налив падает; дальше опасность считается от того места, где палец теперь.'],
    async run(d) {
      const mg = d.mg({ phrase: 'Пламя вздрагивает от малейшего движения' });
      // the danger: how far the finger has gone from where it stood still (from where it pressed, and anew after a fall)
      let anchor = null, was = 0;
      const r = await d.tricks.holdTillFull(mg, {
        at: 'candle#flame', glow: 'candle', seconds: 3,
        danger: s => {
          if (!s.held) { anchor = null; was = 0; return s.level - 0.6 * s.dt; }
          if (s.level < was - 0.5) anchor = null;
          anchor ??= s.at;
          const m = dist(s.at, anchor);
          was = s.level + (m > 24 ? (m - 24) / 40 * s.dt * 4 : -s.dt * 0.6);
          return was;
        },
        progress: (u, s) => { d.set('candle', u); d.set('candle_shake', s.level); },
      });
      await d.end(mg, r);
    },
  },
  {
    id: 'hold-quench', group: 'Жесты', title: 'Гасить', scene: WORKSHOP, demo: 'wicks',
    memo: ['Три фитиля сами начинают чадить — дуга опасности растёт на каждой метке. Держи тот, что чадит, — он успокаивается.',
      'Три метки и три «держать» сразу. На время (12 с): полоса идёт временем; огонёк краснеет, когда какой-то фитиль близок к беде.',
      'Фитиль дошёл до конца — ошибка «в опасность»; три таких — проигрыш (тень справа растёт с каждой).',
      'Проверить: видно, какой фитиль ближе к беде; один палец — одна метка.'],
    async run(d) {
      const mg = d.mg({ phrase: 'Фитили чадят' }), errors = d.errors(mg);
      const wicks = ['wicks#w1', 'wicks#w2', 'wicks#w3'].map((at, i) => { const mark = mg.mark({ at, kind: 'groove' }); return { mark, g: mg.hold({ on: mark, drain: 0 }), level: 0.2, i }; });
      d.tricks.teach(mg, [wicks[0].g], { id: 'hold' });
      mg.on('miss', e => errors.add('miss', { at: e.mark, finger: e }));
      let lost = 0;
      mg.plate.set({ shade: 0 });
      const t0 = mg.t;
      await d.loop(mg, ({ t, dt }) => {
        const since = t - t0;
        for (const w of wicks) {
          const rise = 0.12 * (0.6 + 0.8 * Math.abs(Math.sin(since * 0.7 + w.i * 2.1)));
          w.level = clamp(w.level + (w.g.state.held ? -0.5 : rise) * dt);
          if (w.level >= 1) { errors.add('danger', { at: w.mark }); w.level = 0.4; mg.plate.set({ shade: ++lost / 3 }); }
          w.mark.set({ danger: w.level }); d.set(`wick${w.i + 1}`, w.level);
        }
        mg.plate.set({ fill: since / 12, glow: wicks.some(w => w.level > 0.7) ? 'bad' : wicks.some(w => w.g.state.held) ? 'good' : 'idle' });
        return lost >= 3 || since >= 12;
      });
      await d.end(mg, { as: lost >= 3 ? 'loss' : undefined, errors: errors.all });
    },
  },
  {
    id: 'hold-catch', group: 'Жесты', title: 'Перехват', scene: WORKSHOP, demo: 'brackets',
    memo: ['Две скобы слева и справа, по очереди: держи короткий налив (0.3 с) — защёлка — метка переходит на другую сторону.',
      'Шесть перехватов — шесть отрезков полосы с засечками (приём «шаги по очереди» из «держать до налива»). Груз поднимается.',
      'Проверить: видна всегда одна метка; отпустить рано — «рано отпустил»; к третьему перехвату без засчитанных ошибок — «полпути».'],
    async run(d) {
      const mg = d.mg({ phrase: 'До верха далеко' });
      const r = await d.tricks.steps(mg, halfway(mg, Array.from({ length: 6 }, (_, i) => bar => d.tricks.holdTillFull(mg, {
        at: i % 2 ? 'brackets#right' : 'brackets#left', seconds: 0.3, bar,
        progress: u => { d.set('climb', (i + u) / 6, 0.3); if (u >= 1) d.set('grip', i % 2 ? 'right' : 'left'); },
      }))));
      d.set('grip', 'none');
      await d.end(mg, r);
    },
  },
  {
    id: 'pull', group: 'Жесты', title: 'Тянуть', scene: WORKSHOP, demo: 'rope',
    memo: ['На грузе — кольцо с пунктиром. Нажми и тяни: груз идёт за пальцем с первого кадра; только теперь видны путь и цель у крюка.',
      'Сделано — когда отпустил груз в кольце цели (оно зеленеет, когда груз в нём). Само не доезжает и не прилипает.',
      'Отпустил на полпути — груз стоит, путь и цель гаснут; можно продолжить.'],
    async run(d) {
      const mg = d.mg({ phrase: 'Груз не достаёт до крюка' });
      await d.end(mg, await d.tricks.pullTo(mg, { thing: 'rope#weight', to: 'rope#hook', progress: u => d.set('rope', u) }));
    },
  },
  {
    id: 'pull-spring', group: 'Жесты', title: 'Тянуть с пружиной', scene: WORKSHOP, demo: 'shutter',
    memo: ['Подними заслонку до верха и отпусти там. Отпустишь раньше — она видимо возвращается вниз (около 0.7 с, откуда ни отпусти).',
      'Проверить: это не ошибка (нет звука срыва) — просто пружина; цель видна, только пока тянешь.'],
    async run(d) {
      const mg = d.mg({ phrase: 'За заслонкой свет' });
      await d.end(mg, await d.tricks.pullTo(mg, { thing: 'shutter#handle', to: 'shutter#top', release: 'spring', progress: u => d.set('shutter', u) }));
    },
  },
  {
    id: 'pull-resist', group: 'Жесты', title: 'Тянуть с сопротивлением', scene: WORKSHOP, demo: 'crate',
    memo: ['Тяжёлый ящик: тяни вперёд — между ящиком и пальцем натягивается красная нить, толще и ярче с натяжением. Ящик идёт, пока палец заметно впереди него.',
      'Отпустил — ящик откатывается назад. Сделано — отпустить, когда ящик в кольце цели.',
      'Проверить: натяжение видно (толще и ярче нить); ящик не прыгает за пальцем.'],
    async run(d) {
      const mg = d.mg({ phrase: 'Ящик тяжёлый и стоит не на месте' });
      await d.end(mg, await d.tricks.pullTo(mg, { thing: 'crate#handle', glow: 'crate', to: 'crate#goal', heavy: true, release: 'spring', progress: u => d.set('crate', u) }));
    },
  },
  {
    id: 'pull-tear', group: 'Жесты', title: 'Оторвать', scene: WORKSHOP, demo: 'knot',
    memo: ['Цели нет: потяни узел в любую сторону — немного (5% высоты окна), и он распадается.',
      'Проверить: узел слабеет, пока тянешь; отпустил раньше — всё как было, без ошибки.'],
    async run(d) {
      const mg = d.mg({ phrase: 'Узел вот-вот поддастся' });
      const knot = mg.mark({ at: 'knot#knot', kind: 'dash' }), g = mg.pull({ on: knot, tear: 0.05 });
      mg.glow('knot');
      d.tricks.teach(mg, [g], { id: 'pull:tear' });
      g.on('frame', s => { d.set('knot', s.u); mg.plate.set({ fill: s.u, glow: s.held ? 'good' : 'idle' }); });
      if (!await d.when(mg, g, 'tear')) return;
      d.set('knot_off', true); mg.snap({ at: knot });
      await d.end(mg, {});
    },
  },
  {
    id: 'pull-where', group: 'Жесты', title: 'Тянуть куда', scene: WORKSHOP, demo: 'sockets',
    memo: ['Колышек — в одно из гнёзд. Взял — колышек в пальце (в сцене, не только метка), появляются гнёзда: пустые кольца — можно, бледное пунктирное — нельзя.',
      'Отпустил у «нельзя» — гнездо качает «нет» (ошибка «не туда»), колышек видимо едет обратно на место. В пустом месте — тоже едет обратно, без ошибки.',
      'Проверить: колышек не пропадает и не прыгает.'],
    async run(d) {
      const mg = d.mg({ phrase: 'В доске пустое гнездо' }), errors = d.errors(mg);
      const peg = mg.mark({ at: 'sockets#peg', kind: 'dash' });
      const g = mg.pull({ on: peg, targets: [sockets[0], { at: sockets[1], closed: true }, sockets[2]] });
      d.tricks.teach(mg, [g], { id: 'pull:where' });
      let rest = null, placed = null; // (where the peg lay when it was taken: u, v between the sockets)
      g.on('frame', s => {
        if (!s.held) return;
        rest ??= d.b.minigame.relative(s.at, 'sockets#s1', 'sockets#s3');
        carried(d, 'peg', s.at); d.set('peg', 'held');
        mg.plate.set({ glow: 'good' });
      });
      g.on('release', ({ target }) => {
        mg.plate.set({ glow: 'idle' });
        if (target === 0 || target === 2) { placed = sockets[target]; return; }
        if (target === 1) errors.add('wrong', { at: g });
        // let go astray: it goes back, seen (П37), and lies down there
        if (rest) { const was = rest; rest = null; d.set('peg_u', was.u, 0.4); d.set('peg_v', was.v, 0.4); d.wait(0.45).then(() => { if (!rest && !placed) d.set('peg', 'none'); }); }
      });
      if (!await d.loop(mg, () => placed)) return;
      d.set('peg', placed.split('#')[1]); mg.plate.set({ fill: 1 }); mg.snap({ at: peg });
      await d.end(mg, { errors: errors.all, choice: placed });
    },
  },
  {
    id: 'pull-catch', group: 'Жесты', title: 'Поймать', scene: WORKSHOP, demo: 'bubbles',
    memo: ['Пузыри плывут сами — три метки и три «тянуть» сразу. Коснись пузыря — он в пальце (в сцене, под пальцем); появляются гнёзда — отнеси в любое свободное.',
      'Три пузыря — три засечки на полосе; занятое гнездо закрывается. Отпустил мимо — пузырь плывёт дальше оттуда.',
      'Проверить: метка едет за пузырём (камера стоит); поймать легко — круг касания шире метки.'],
    async run(d) {
      const mg = d.mg({ phrase: 'Пузыри проплывают мимо гнёзд' }), errors = d.errors(mg);
      const taken = new Set(), targets = () => sockets.map(at => ({ at, closed: taken.has(at) }));
      mg.plate.set({ notches: [1 / 3, 2 / 3] });
      mg.on('miss', e => errors.add('miss', { at: e.mark, finger: e }));
      const bubbles = [1, 2, 3].map(n => {
        const key = `bubble${n}`, mark = mg.mark({ at: `bubbles#b${n}`, kind: 'dash' }), g = mg.pull({ on: mark, targets: targets() });
        g.on('frame', s => { if (s.held) { carried(d, key, s.at); d.set(key, 'held'); } });
        g.on('release', ({ target }) => {
          const at = sockets[target];
          if (target < 0 || taken.has(at)) { d.set(key, 'free'); return; }
          taken.add(at); d.set(key, at.split('#')[1]); mg.snap({ at: mark });
          mark.remove();
          for (const b of bubbles) b.set({ targets: targets() });
          mg.plate.set({ fill: taken.size / 3 });
        });
        return g;
      });
      d.tricks.teach(mg, [bubbles[0]], { id: 'pull:catch' });
      if (!await d.loop(mg, () => taken.size >= 3)) return;
      await d.end(mg, { errors: errors.all });
    },
  },
  {
    id: 'trace', group: 'Жесты', title: 'Вести по линии', scene: WORKSHOP, demo: 'crack',
    memo: ['Начни в кольце у начала трещины и веди вдоль пунктира — пройденное светлеет, клей заливает трещину.',
      'Можно отпустить и продолжить с того же места. Допуск щедрый (48 px).',
      'Ушёл далеко — след обрывается, место, куда вернуться, вспыхивает (ошибка «сошёл»).'],
    async run(d) {
      const mg = d.mg({ phrase: 'Доску расколола трещина' });
      await d.end(mg, await d.tricks.traceLine(mg, { line: crack, progress: u => d.set('crack', u) }));
    },
  },
  {
    id: 'turn', group: 'Жесты', title: 'Крутить', scene: WORKSHOP, demo: 'screw',
    memo: ['Веди по кругу вокруг винта, куда показывает стрелка (по часовой). Полтора оборота. Радиус не важен.',
      'Проверить: мягкий деревянный щелчок на каждой четверти; винт поворачивается.',
      'Против стрелки — винт стоит, стрелка вспыхивает (ошибка «против»).'],
    async run(d) {
      const mg = d.mg({ phrase: 'Крышка держится на честном слове' });
      await d.end(mg, await d.tricks.turnTimes(mg, { at: 'screws#s1', turns: 1.5, progress: u => d.set('screw1', u) }));
    },
  },
  {
    id: 'turn-leave', group: 'Жесты', title: 'Крутить или оставить', scene: WORKSHOP, demo: 'screw',
    memo: ['То же, но рядом тихая бледная метка «оставить» — второй путь, виден сразу; палец показывает оба.',
      'Нажал «оставить» — развилка, конец нейтральный; повторов показа нет (бездействие может быть выбором).'],
    async run(d) {
      const mg = d.mg({ phrase: 'Винт можно и не дотягивать' });
      const r = await turnOrLeave(d, mg, { at: 'screws#s1', turns: 1.5, bar: u => mg.plate.set({ fill: u }), progress: u => d.set('screw1', u) });
      await d.end(mg, { as: r.state === 'leave' ? 'neutral' : undefined, errors: r.errors, choice: r.state });
    },
  },
  {
    id: 'rub', group: 'Жесты', title: 'Тереть', scene: WORKSHOP, demo: 'plate',
    memo: ['Пятно над пыльной табличкой: води пальцем с нажатием, пока не покроешь его. Направление и скорость не важны.',
      'Проверить: пятно съёживается по мере покрытия, шорох громче при быстром движении; пыль сходит.',
      'Касание мимо пятна — рябь, пятно дёргается к пальцу («мимо»).'],
    async run(d) {
      const mg = d.mg({ phrase: 'Под пылью что-то написано' });
      await d.end(mg, await d.tricks.rubTill(mg, { at: 'plate#dust', glow: 'plate', progress: u => d.set('plate', u) }));
    },
  },
  {
    id: 'seek', group: 'Жесты', title: 'Искать', scene: WORKSHOP, demo: 'floor',
    memo: ['Пятно над досками: веди с нажатием — под пальцем линза. Ближе к спрятанному она теплеет (краснее, светлее) и гул ближе.',
      'Нашёл — задержи палец, линза нальётся — место вспыхивает. Без нажатия не ищется.',
      'Проверить: тепло-холодно видно глазами, без звука тоже можно найти.'],
    async run(d) {
      const mg = d.mg({ phrase: 'Под досками что-то скребётся' });
      const r = await d.tricks.seekAndHold(mg, { area: 'floor#area', place: 'floor#hidden' });
      if (r.state === 'done') d.set('floor_found', true);
      await d.end(mg, r);
    },
  },
  {
    id: 'inspect', group: 'Жесты', title: 'Осмотреть', scene: WORKSHOP, demo: 'shells',
    memo: ['Три ракушки, на каждой «держать». Коснись — обычная качнётся; «не такая» на секунду приоткрывается — под ней жемчужина, вокруг тёплый свет. Задержи палец на ней — найдено.',
      'Задержал на обычной — она качает «нет» (ошибка «не то»).',
      'Проверить: «не такая» видна глазами, без подписи.'],
    async run(d) {
      const odd = shells[Math.floor(Math.random() * 3)];
      d.set('shell_odd', odd.split('#')[1]);
      const mg = d.mg({ phrase: 'Одна ракушка здесь чужая' }), errors = d.errors(mg);
      let found = false;
      const holds = shells.map(at => {
        const mark = mg.mark({ at, kind: 'groove' }), g = mg.hold({ on: mark, seconds: 0.7 });
        let judged = false;
        g.on('down', () => { judged = false; d.set('shell', 'none'); d.set('shell', at.split('#')[1]); });
        g.on('frame', s => {
          if (judged || s.fill < 1) return;
          judged = true;
          if (at === odd) { found = true; mg.sound('found'); mg.snap({ at: mark }); } else { errors.add('wrong', { at: mark }); g.set({ fill: 0 }); }
        });
        return g;
      });
      mg.on('miss', e => errors.add('miss', { at: e.mark, finger: e }));
      d.tricks.teach(mg, [holds[0]], { id: 'hold' });
      if (!await d.loop(mg, () => found)) return;
      d.set('shell_found', true); mg.plate.set({ fill: 1 });
      await d.end(mg, { errors: errors.all });
    },
  },
  {
    id: 'rhythm', group: 'Жесты', title: 'Ритм', scene: WORKSHOP, demo: 'drum',
    memo: ['К кольцу на барабане сходится второе: жми, когда оно коснётся края. Нужно 8 ударов в такт — не суперровно (приём «N ударов в такт»).',
      'Попал — вспышка, мягкий удар, полоса идёт; рано или поздно — красная крапинка до или после края, промах не считается, но набранное не пропадает.',
      'Проверить: видно заранее, когда жать.'],
    async run(d) {
      const mg = d.mg({ phrase: 'Барабан задаёт такт' });
      await d.end(mg, await d.tricks.hitsInBeat(mg, { at: 'drum#skin', glow: 'drum', bpm: 80, hits: 8, onHit: () => d.bump('drum_hits') }));
    },
  },
  {
    id: 'rhythm-hold', group: 'Жесты', title: 'Держать в ритм', scene: WORKSHOP, demo: 'breath',
    memo: ['Мех дышит: второе кольцо растёт — держи (вдох), опадает — отпусти (выдох). Четыре удачных вдоха.',
      'Проверить: понятно, когда держать и когда отпускать; огонёк плашки красный, когда не в такт.'],
    async run(d) {
      const mg = d.mg({ phrase: 'У меха медленный ход' });
      const mark = mg.mark({ at: 'bellows#handle' }), g = mg.rhythm({ on: mark, bpm: 40, breath: true });
      mg.glow('bellows');
      d.tricks.teach(mg, [g], { id: 'rhythm:breath' });
      mg.plate.set({ notches: [0.25, 0.5, 0.75] });
      let kept = 0, was = null;
      const off = breaths(mg, g, ok => { if (!ok) return; kept++; mg.sound('beat'); mg.plate.set({ fill: kept / 4 }); });
      g.on('frame', s => { if (s.breath !== was) { was = s.breath; d.set('bellows', was === 'in' ? 1 : 0, 1.4); } });
      const ok = await d.loop(mg, () => kept >= 4);
      off();
      if (ok) { mg.snap({ at: mark }); await d.end(mg, {}); }
    },
  },
  {
    id: 'rhythm-interval', group: 'Жесты', title: 'Ритм — интервал', scene: WORKSHOP, demo: 'drum',
    memo: ['Важна не сетка, а промежуток между касаниями: не чаще и не реже, чем сходится кольцо (0.45–0.8 с). Восемь ровных.',
      'Кольцо сходится от каждого касания к следующему верному моменту (игра ставит ритму следующую долю).',
      'Слишком часто — двойная рябь (ошибка «слишком часто»).'],
    async run(d) {
      const mg = d.mg({ phrase: 'Сбивчивый шаг здесь слышен сразу' }), errors = d.errors(mg);
      const [lo, hi] = [0.45, 0.8], mid = (lo + hi) / 2, need = 8;
      const mark = mg.mark({ at: 'drum#skin' }), g = mg.rhythm({ on: mark, times: [], window: (hi - lo) / 2 });
      mg.glow('drum');
      d.tricks.teach(mg, [g], { id: 'rhythm' });
      mg.plate.set({ notches: Array.from({ length: need - 1 }, (_, i) => (i + 1) / need) });
      let last = null, good = 0;
      g.on('tap', ({ hit }) => {
        const t = g.state.t;
        if (last !== null && t - last < lo * 0.6) errors.add('often', { at: mark });
        else if (last !== null && hit) { good++; d.bump('drum_hits'); mg.plate.set({ fill: good / need }); }
        last = t;
        g.set({ times: [t + mid] });
      });
      if (!await d.loop(mg, () => good >= need)) return;
      mg.snap({ at: mark });
      await d.end(mg, { errors: errors.all });
    },
  },
  {
    id: 'rhythm-own', group: 'Жесты', title: 'Свой ритм', scene: WORKSHOP, demo: 'drum2',
    memo: ['Левый барабан бьёт свой ритм: на нём не метка, а знак доли — мягкий свет нарастает к каждой доле. Чему вторить, а не куда жать.',
      'Твой — правый барабан: он пульсирует, на нём твоё голубое кольцо с самого начала; там «касание как есть». Касание рядом — «мимо» (без счёта).',
      'Плашка идёт с каждой его долей и красит её по тому, как ты сыграл: светлым — вторишь, голубым — своё, бледным — молчал. Итог — как сыграно большинство долей.',
      'Проверить: видно по ходу, к чему идёт; оба пути нейтральны, ошибок и «хорошо/плохо» нет; палец показывает, где играть.'],
    async run(d) {
      const mg = d.mg({ phrase: 'Барабан бьёт один. Можно вторить — или вести своё' });
      const r = await ownBeat(d, mg, { bpm: 72, beats: 12 });
      if (r.state === 'done') await d.end(mg, { as: 'neutral', choice: r.choice });
    },
  },
  {
    id: 'lead', group: 'Жесты', title: 'Вести', scene: WORKSHOP, demo: 'boat', state: { zone_kind: 'zone' },
    memo: ['Красная стрелка от носа лодки — куда она смотрит. Нажми где угодно и веди вбок: стрелка идёт за смещением. Держи её в светлой зоне на шкале — зона плывёт.',
      'Отпустил — нос возвращается. 12 с; огонёк плашки — в зоне ли.',
      'Проверить: в зоне — зона светится.'],
    async run(d) {
      const mg = d.mg({ phrase: 'Лодку то и дело сносит' });
      mg.glow('boat');
      await d.end(mg, await d.tricks.keepInZone(mg, { seconds: 12, zone: t => 0.55 * Math.sin(t * 0.45), width: 0.35, progress: (u, s) => boat(d, s) }));
    },
  },
  {
    id: 'lead-follow', group: 'Жесты', title: 'Вести за движущимся', scene: WORKSHOP, demo: 'boat', state: { zone_kind: 'firefly' },
    memo: ['Светлячок летает над шкалой — держи стрелку носа на нём.', 'Проверить: так же, как «Вести», но цель живая и быстрее.'],
    async run(d) {
      const mg = d.mg({ phrase: 'Светлячок уходит в сторону' });
      mg.glow('boat');
      await d.end(mg, await d.tricks.keepInZone(mg, { seconds: 12, zone: t => 0.6 * Math.sin(t * 0.9) * Math.cos(t * 0.37), width: 0.3, progress: (u, s) => boat(d, s) }));
    },
  },
  {
    id: 'lead-away', group: 'Жесты', title: 'Держаться в стороне', scene: WORKSHOP, demo: 'boat', state: { zone_kind: 'bee' },
    memo: ['Шмель в красном кольце над шкалой — держи стрелку носа подальше от него.', 'Проверить: «хорошо» — когда нос вне его кольца; не надо целиться в шмеля.'],
    async run(d) {
      const mg = d.mg({ phrase: 'Рядом шмель' });
      mg.glow('boat');
      await d.end(mg, await d.tricks.keepInZone(mg, { seconds: 12, away: true, zone: t => 0.7 * Math.sin(t * 0.6), width: 0.4, progress: (u, s) => boat(d, s) }));
    },
  },
  {
    id: 'lead-smooth', group: 'Жесты', title: 'Вести плавно', scene: WORKSHOP, demo: 'boat', state: { zone_kind: 'zone' },
    memo: ['То же, но рывки нельзя: резкое движение пальца — дорожка рвётся (ошибка «сорвал»).', 'Проверить: плавно можно вести без ошибок.'],
    async run(d) {
      const mg = d.mg({ phrase: 'Лодка рыскает от резких движений' });
      mg.glow('boat');
      await d.end(mg, await d.tricks.keepInZone(mg, { seconds: 12, smooth: true, zone: t => 0.5 * Math.sin(t * 0.4), width: 0.35, progress: (u, s) => boat(d, s) }));
    },
  },
  {
    id: 'wait', group: 'Жесты', title: 'Ждать', scene: WORKSHOP, demo: 'hourglass',
    memo: ['Ничего не делай: песок пересыпается, бездействие и есть путь. Жеста нет — только время на полосе и его звук.',
      'Палец один раз показывает «руки прочь» (подходит и уходит вверх), повторов нет. Касание — только рябь: где касание ничего не значит, «мимо» не бывает.',
      'Проверить: понятно, что можно ничего не делать; полоса доходит до конца, не ошибка.'],
    async run(d) {
      const mg = d.mg({ phrase: 'Песок ещё сыплется' }), time = mg.layer('time');
      mg.glow('hourglass');
      mg.show({ handsOff: true });
      const t0 = mg.t;
      const ok = await d.loop(mg, ({ t }) => {
        const u = clamp((t - t0) / 6);
        d.set('sand', u); mg.plate.set({ fill: u }); time.set({ u });
        return u >= 1;
      });
      time.remove();
      if (ok) await d.end(mg, {});
    },
  },

  // ── a mini-game's parts ──
  {
    id: 'frame-enter', group: 'Рамка', title: 'Вход и конец', scene: WORKSHOP, demo: 'bell',
    memo: ['Вход: вверху по центру проявляется плашка с фразой, колокольчик пульсирует, метка появляется с отскоком, тихий вход. Сцену ничто не темнит.',
      'Три нажатия — три засечки. Конец: полоса вспыхивает во всю длину, аккорд; через секунду плашка тает.',
      'Проверить: без надписей понятно, что мини-игра началась и кончилась.'],
    async run(d) {
      const mg = d.mg({ phrase: 'Колокольчик звонят трижды' });
      const mark = mg.mark({ at: 'bell#top' }), g = mg.press({ on: mark });
      mg.glow('bell');
      mg.plate.set({ notches: [1 / 3, 2 / 3] });
      g.on('press', ({ count }) => { bell(d); mg.plate.set({ fill: count / 3 }); });
      if (!await d.when(mg, g, 'press', ({ count }) => count >= 3)) return;
      mg.snap({ at: mark });
      await d.end(mg, {});
    },
  },
  {
    id: 'frame-ghost', group: 'Рамка', title: 'Призрачный палец', scene: WORKSHOP, demo: 'rope',
    memo: ['Показ забыт перед этой демонстрацией: палец (светлый круг с тенью и следом) сам тянет груз к крюку — груз едет за ним; палец отпускает, и груз видимо возвращается на место.',
      'Касание прерывает показ. Ничего не делаешь 4 с — показ снова, дальше раз в 8 с (приём «показ при первой встрече и при замере»).',
      'Проверить: показ понятен.'],
    async run(d) {
      d.tricks.forget();
      const mg = d.mg({ phrase: 'Груз не достаёт до крюка' });
      await d.end(mg, await d.tricks.pullTo(mg, { thing: 'rope#weight', to: 'rope#hook', progress: u => d.set('rope', u) }));
    },
  },
  {
    id: 'frame-plate', group: 'Рамка', title: 'Плашка', scene: WORKSHOP, demo: 'bell',
    memo: ['Пять шагов разных жестов — пять отрезков полосы с засечками (приём «шаги по очереди»); фраза меняется с шагом.',
      'Огонёк на краю заливки: ничего не делаешь — маленький и спокойный; делаешь как надо — ярче, заливка идёт; не так — краснеет и дрожит.',
      'Ошибка — тихая щербинка там, где заливка (без полёта искры).',
      'Проверить: краем глаза понятно, хорошо ли сейчас и сколько прошёл.'],
    async run(d) {
      const mg = d.mg({ phrase: 'Колокольчик давно молчит' });
      const phrase = (text, step) => bar => { mg.plate.set({ phrase: text }); return step(bar); };
      const r = await d.tricks.steps(mg, [
        phrase('Колокольчик давно молчит', bar => pressOnce(d, mg, { at: 'bell#top', glow: 'bell', bar }).then(x => (x.state === 'done' && bell(d), x))),
        phrase('Колокольчик звенит от любого касания', bar => holdAnywhere(d, mg, { glow: 'bell', seconds: 1.2, bar })),
        phrase('Одного звонка мало', bar => pressOnce(d, mg, { at: 'bell#top', glow: 'bell', bar }).then(x => (x.state === 'done' && bell(d), x))),
        phrase('Звук обрывается слишком рано', bar => d.tricks.holdTillFull(mg, { at: 'bell#top', glow: 'bell', seconds: 1, bar })),
        phrase('Остался последний звонок', bar => pressOnce(d, mg, { at: 'bell#top', glow: 'bell', bar }).then(x => (x.state === 'done' && bell(d), x))),
      ]);
      await d.end(mg, r);
    },
  },
  {
    id: 'frame-turn', group: 'Рамка', title: 'Ход сцены', scene: WORKSHOP, demo: 'door',
    memo: ['Стук — потом отвечает сцена: меток и свечения нет, огонёк на плашке медленно дышит («не зависло, ждём»), касание — только рябь. Потом снова твой ход.',
      'Проверить: во время ответа понятно, что надо ждать; метка возвращается.'],
    async run(d) {
      const mg = d.mg({ phrase: 'За дверцей тихо' });
      const r = await d.tricks.steps(mg, [0, 1].map(() => async bar => {
        const x = await pressOnce(d, mg, { at: 'door#knock', bar });
        if (x.state !== 'done') return x;
        d.bump('door_knocks');
        mg.sceneTurn(true);
        for (let i = 0; i < 3; i++) { await d.wait(0.8); d.bump('door_reply'); }
        await d.wait(0.6);
        mg.sceneTurn(false);
        return x;
      }));
      await d.end(mg, r);
    },
  },
  {
    id: 'frame-errors', group: 'Рамка', title: 'Ошибки', scene: WORKSHOP, demo: 'bell',
    memo: ['Каждая ошибка — своим видом и звуком, там, где случилась; на полосе — тихая щербинка (здесь мягкой пробы нет — всё считается).',
      'Шаги: колокольчик (нажми мимо — «мимо»), держать (отпусти рано — «рано отпустил»), держать где угодно с ветром — колокольчик раскачивается на порывах, дуга у него («в опасность»), колокольчик трижды.',
      'Звуков ошибок три, все тихие: глухой «мимо», «срыв», «сбой».',
      'Остальные ошибки — в своих демонстрациях: «сошёл» (линия), «не туда» (куда), «рано или поздно» и «слишком часто» (ритм), «против» (крутить), «сорвал» (плавно).'],
    async run(d) {
      const mg = d.mg({ phrase: 'Колокольчик давно молчит' });
      const r = await d.tricks.steps(mg, [
        bar => pressOnce(d, mg, { at: 'bell#top', glow: 'bell', bar }).then(x => (x.state === 'done' && bell(d), x)),
        bar => { mg.plate.set({ phrase: 'Звук обрывается слишком рано' }); return d.tricks.holdTillFull(mg, { at: 'bell#top', glow: 'bell', seconds: 2, soft: false, bar }); },
        async bar => {
          mg.plate.set({ phrase: 'Ветер раскачивает колокольчик' });
          const x = await holdAnywhere(d, mg, { glow: 'bell', seconds: 3, bar, dangerAt: 'bell#top', danger: s => { d.set('wind', gust(s.t)); return windy(1.2)(s); } });
          d.set('wind', 0, 0.5);
          return x;
        },
        async bar => {
          mg.plate.set({ phrase: 'Колокольчик звонят трижды' });
          const errors = d.errors(mg), mark = mg.mark({ at: 'bell#top' }), g = mg.press({ on: mark });
          const off = mg.on('miss', e => errors.add('miss', { at: e.mark, finger: e }));
          g.on('press', ({ count }) => { bell(d); bar(count / 3); });
          const ok = await d.when(mg, g, 'press', ({ count }) => count >= 3);
          off();
          if (ok) { mg.snap({ at: mark }); mark.remove(); }
          return { state: ok ? 'done' : 'left', errors: errors.all };
        },
      ]);
      await d.end(mg, r);
    },
  },
  {
    id: 'frame-loss', group: 'Рамка', title: 'Проигрыш', scene: WORKSHOP, demo: 'lantern',
    memo: ['Игра, которая допускает проигрыш (решает игра, не язык): две ошибки — проигрыш. На плашке справа — тень: сколько осталось до проигрыша, растёт с каждой ошибкой.',
      'Держи фонарь в ветер, пока дважды не погаснет. Конец-проигрыш: тень накрывает полосу, низкий тихий звук.',
      'Проверить: отличается от успеха с первого взгляда.'],
    async run(d) {
      const mg = d.mg({ phrase: 'Огню мешает ветер. Спичек две' }), errors = d.errors(mg);
      const mark = mg.mark({ at: 'lantern#flame', kind: 'groove' }), g = mg.hold({ on: mark, seconds: 6 }), tension = mg.layer('tension');
      mg.glow('lantern');
      mg.plate.set({ shade: 0 });
      let level = 0, lost = 0;
      const done = await d.loop(mg, ({ t, dt }) => {
        const s = g.state;
        d.set('wind', gust(t));
        level = clamp(windy(1.6)({ dt, t, level, held: s.held }));
        mark.set({ danger: level }); tension.set({ u: level });
        if (s.held && level >= 1) { errors.add('danger', { at: mark }); g.set({ fill: 0 }); level = 0; mg.plate.set({ shade: ++lost / 2 }); }
        d.set('lantern', s.fill);
        mg.plate.set({ fill: s.fill, glow: level > 0.6 ? 'bad' : s.held ? 'good' : 'idle' });
        return lost >= 2 || s.fill >= 1;
      });
      d.set('wind', 0, 0.5);
      if (!done) return;
      if (lost < 2) mg.snap({ at: mark });
      await d.end(mg, { as: lost >= 2 ? 'loss' : undefined, errors: errors.all });
    },
  },
  {
    id: 'frame-limit', group: 'Рамка', title: 'Время на исходе', scene: WORKSHOP, demo: 'plate',
    memo: ['Предел — время (10 с), его задаёт игра: тень справа ползёт, пока время идёт, и слышен пульс времени. Не успел стереть — проигрыш.',
      'Проверить: краем глаза видно, тороплюсь ли я.'],
    async run(d) {
      const mg = d.mg({ phrase: 'Надпись вот-вот затянет пылью' }), time = mg.layer('time'), t0 = mg.t;
      let out = false;
      mg.on('frame', ({ t }) => { const u = clamp((t - t0) / 10); mg.plate.set({ shade: u }); time.set({ u }); if (u >= 1 && !out) { out = true; time.remove(); d.end(mg, { as: 'loss' }); } });
      const r = await d.tricks.rubTill(mg, { at: 'plate#dust', glow: 'plate', progress: u => d.set('plate', u) });
      time.remove();
      if (!out) await d.end(mg, r);
    },
  },
  {
    id: 'frame-pause', group: 'Рамка', title: 'Пауза', scene: WORKSHOP, demo: 'drum',
    memo: ['Ритм: нужно 20 ударов в такт. Посреди нажми ⏸ (правый нижний угол): стоит всё — кольцо, время, звук, пульс барабана; игре сказано «пауза».',
      'Нажми ▶ — ритм даёт отсчёт в три тика и продолжает с того же места.',
      'Проверить: на паузе не теряешь удары; то же — если свернуть вкладку и вернуться.'],
    async run(d) {
      const mg = d.mg({ phrase: 'Барабан задаёт такт' });
      mg.on('pause', () => d.note('пауза')); mg.on('resume', () => d.note('дальше'));
      await d.end(mg, await d.tricks.hitsInBeat(mg, { at: 'drum#skin', glow: 'drum', bpm: 80, hits: 20, onHit: () => d.bump('drum_hits') }));
    },
  },
  {
    id: 'frame-choice', group: 'Рамка', title: 'Обычный выбор', scene: WORKSHOP, demo: 'box',
    memo: ['Выбор между мини-играми — тем же языком, без плашки: метка, лепестки. Здесь — на время (8 с): дуга по краю метки убывает; молчание — тоже выбор.',
      'Потом — выбор с одним действием: метка без лепестков, срабатывает сразу, на касании.',
      'Проверить: время видно на метке; одно действие — без меню.'],
    async run(d) {
      const pick = async (petals, seconds) => {
        const mg = d.mg({ plate: false }), mark = mg.mark({ at: 'box#front' });
        const g = mg.press({ on: mark, ...(petals.length > 1 ? { petals } : {}) }), time = seconds && mg.layer('time');
        mg.glow('box');
        let chosen;
        g.on('choose', ({ id }) => { chosen = id; });
        g.on('press', () => { if (petals.length === 1) chosen = petals[0].id; });
        const t0 = mg.t;
        const ok = await d.loop(mg, ({ t }) => {
          if (seconds) { const u = clamp((t - t0) / seconds); mark.set({ time: 1 - u }); time.set({ u }); if (u >= 1) chosen = null; }
          return chosen !== undefined;
        });
        if (!ok) return undefined;
        if (chosen) mg.snap({ at: mark });
        mg.leave();
        return chosen;
      };
      const a = await pick([{ id: 'open', label: 'Открыть' }, { id: 'leave', label: 'Оставить' }], 8);
      if (a === undefined) return;
      d.note(`выбрано: ${a ?? 'молчание'}`);
      if (a === 'open') { d.set('drawer', 'middle'); d.set('drawer_open', 1, 0.6); }
      const b = await pick([{ id: 'close', label: 'Закрыть' }]);
      if (b === undefined) return;
      d.note(`выбрано: ${b}`);
      d.set('drawer_open', 0, 0.6);
    },
  },
  {
    id: 'frame-skip', group: 'Рамка', title: 'Пропуск', scene: WORKSHOP, demo: 'screws',
    memo: ['Четыре винта. В правом нижнем углу рядом с ⏸ — ⏭, у каждого игрока: на случай, если что-то глючит, а не способ пройти. Нажми — игра узнаёт и сама решает: здесь мини-игра кончается сразу, без аккорда.',
      'Итог — как у сыгранной: «успех» (пропуск оставляет в истории тот же след, что игра).'],
    async run(d) {
      const mg = d.mg({ phrase: 'Крышка держится на честном слове' });
      await d.end(mg, await d.tricks.steps(mg, [1, 2, 3, 4].map(i => bar => d.tricks.turnTimes(mg, { at: `screws#s${i}`, turns: 1, bar, progress: u => d.set(`screw${i}`, u) }))));
    },
  },
  {
    id: 'frame-soft', group: 'Рамка', title: 'Мягкая проба', scene: WORKSHOP, demo: 'bellows',
    memo: ['Показ забыт: жест встречается впервые за партию. Ошибки видны и звучат, но не считаются: щербинки нет, итог чистый (приём «мягкая проба»).',
      'Отпусти рано пару раз, потом дотяни. Затем второй шаг — тот же жест: теперь ошибки считаются.'],
    async run(d) {
      d.tricks.forget();
      const mg = d.mg({ phrase: 'Мех опал до дна' });
      const r = await d.tricks.steps(mg, [
        bar => d.tricks.holdTillFull(mg, { at: 'bellows#handle', glow: 'bellows', seconds: 2, bar, progress: u => d.set('bellows', u) }),
        bar => { d.set('bellows', 0, 0.6); mg.plate.set({ phrase: 'Мех снова опал' }); return d.tricks.holdTillFull(mg, { at: 'bellows#handle', glow: 'bellows', seconds: 2, soft: false, bar, progress: u => d.set('bellows', u) }); },
      ]);
      await d.end(mg, r);
    },
  },
  // ── mini-games of the three games, put into the language ──
  {
    id: 'osnastka', group: 'Мини-игры', title: 'Оснастка', scene: DECK,
    memo: ['«Алые паруса», Оснастка: четыре крепления во вставке-крупном плане, одна метка за раз, держать до защёлки (приёмы «шаги по очереди» и «держать до налива»).',
      'Было: держать «у точки» без метки, рука девочки далеко от точки. Стало: метка там, где крепят; первое крепление — мягкая проба (без счёта срыва).',
      'Проверить: метки живут только во вставке (пока она открыта); четыре отрезка полосы; два крепления без срыва — «полпути».'],
    async run(d) {
      d.set('closeup', 1, 0.6);
      await d.wait(0.8);
      const mg = d.mg({ phrase: 'Паруса ещё не закреплены' });
      const r = await d.tricks.steps(mg, halfway(mg, [1, 2, 3, 4].map(i => bar => d.tricks.holdTillFull(mg, { at: `closeup#k${i}`, seconds: 1.4, bar, progress: u => d.set(`rig${i}`, u) }))));
      await d.end(mg, r);
      d.set('closeup', 0, 0.6);
    },
  },
  {
    id: 'vinty', group: 'Мини-игры', title: 'Винты', scene: WORKSHOP, demo: 'screws',
    memo: ['«Ашеры», Винты: четыре винта, крутить; рядом тихая «оставить» — видна сразу.',
      'Было: «оставить» пряталась в меню кольца. Стало: второй путь виден до выбора; «оставить» — развилка, конец нейтральный.',
      'Проверить: выбрать «оставить» на любом винте — мини-игра кончается выбором.'],
    async run(d) {
      const mg = d.mg({ phrase: 'Винты можно и не дотягивать' });
      const r = await d.tricks.steps(mg, [1, 2, 3, 4].map(i => bar => turnOrLeave(d, mg, { at: `screws#s${i}`, turns: 1, bar, progress: u => d.set(`screw${i}`, u) })));
      if (r.state === 'left') return;
      await d.end(mg, { as: r.state === 'leave' ? 'neutral' : undefined, errors: r.errors, choice: r.state === 'leave' ? 'leave' : 'all' });
    },
  },
  {
    id: 'struna', group: 'Мини-игры', title: 'Струна', scene: WORKSHOP, demo: 'drum2',
    memo: ['«Ашеры», Струна: его ритм на левом барабане (знак доли, не метка), твой — на правом (там твоё кольцо с начала). Свой ритм или за ним — оба пути нейтральны, плашка красит каждую долю по тому, как сыграно; не жать — третий итог.',
      'Было: бездействие засчитывалось как «за ним», окно в такт ≤ 60 мс. Стало: три итога, окно ±150 мс.',
      'Проверить: оба ритма видны; ошибок нет.'],
    async run(d) {
      const mg = d.mg({ phrase: 'Барабан бьёт один. Можно вторить — или вести своё' });
      const r = await ownBeat(d, mg, { bpm: 96, beats: 16 });
      if (r.state === 'done') await d.end(mg, { as: 'neutral', choice: r.choice });
    },
  },
  {
    id: 'koltso', group: 'Мини-игры', title: 'Кольцо', scene: WORKSHOP, demo: 'lantern',
    memo: ['«Алые паруса», Кольцо: надеть кольцо спящей — держать, пока она не шевельнётся. Здесь — фонарь в ветер.',
      'Было: «она шевелится» — только слухом. Стало: опасность — дуга на краю метки, видно глазами.',
      'Проверить: можно пройти, отпуская на порывах.'],
    async run(d) {
      const mg = d.mg({ phrase: 'Огонёк гаснет от сквозняка' });
      const r = await d.tricks.holdTillFull(mg, { at: 'lantern#flame', glow: 'lantern', seconds: 5, danger: s => { d.set('wind', gust(s.t)); return windy(0.8)(s); }, progress: u => d.set('lantern', u) });
      d.set('wind', 0, 0.5);
      await d.end(mg, r);
    },
  },
  {
    id: 'slushat', group: 'Мини-игры', title: 'Слушать', scene: WORKSHOP, demo: 'floor',
    memo: ['«Ашеры», Слушать: найти место под полом. Было: водить мышью без нажатия — на телефоне нельзя, только слухом.',
      'Стало: искать с нажатием, линза теплеет глазами и звуком.',
      'Проверить: на телефоне и без звука находится.'],
    async run(d) {
      const mg = d.mg({ phrase: 'Под досками что-то скребётся' });
      const r = await d.tricks.seekAndHold(mg, { area: 'floor#area', place: 'floor#hidden', radius: 170 });
      if (r.state === 'done') d.set('floor_found', true);
      await d.end(mg, r);
    },
  },
  {
    id: 'ruki', group: 'Мини-игры', title: 'Руки', scene: WORKSHOP, demo: 'sockets',
    memo: ['«Ашеры», Руки — две метки и два жеста сразу. Здесь на вещах Мастерской: колышек — рука, его можно тянуть к одному из двух крайних гнёзд (её руки); среднее гнездо — «остаться», его можно держать.',
      'Что раньше — то и выбор: колышек отпущен в крайнем гнезде или налилось «остаться». Время — дугой на колышке и тенью на плашке (10 с); вышло — не выбрано ничего.',
      'Проверить: обе метки видны сразу, палец показывает обе; отклик нейтральный, «неверно» нет.'],
    async run(d) {
      const mg = d.mg({ phrase: 'Две руки тянутся навстречу. Можно и остаться' }), time = mg.layer('time');
      const hand = mg.mark({ at: 'sockets#peg', kind: 'dash' }), stay = mg.mark({ at: sockets[1], kind: 'groove' });
      const pull = mg.pull({ on: hand, targets: [sockets[0], sockets[2]] }), hold = mg.hold({ on: stay, seconds: 1.5 });
      mg.plate.set({ glow: null, shade: 0 });
      d.tricks.teach(mg, [pull, hold], { id: 'two', still: null });
      let chosen, rest = null;
      pull.on('frame', s => { if (!s.held) return; rest ??= d.b.minigame.relative(s.at, 'sockets#s1', 'sockets#s3'); carried(d, 'peg', s.at); d.set('peg', 'held'); });
      pull.on('release', ({ target }) => {
        if (target >= 0) { chosen = [sockets[0], sockets[2]][target]; d.set('peg', chosen.split('#')[1]); return; }
        if (rest) { const was = rest; rest = null; d.set('peg_u', was.u, 0.4); d.set('peg_v', was.v, 0.4); d.wait(0.45).then(() => { if (!rest && !chosen) d.set('peg', 'none'); }); }
      });
      const t0 = mg.t;
      const ok = await d.loop(mg, ({ t }) => {
        const u = clamp((t - t0) / 10);
        hand.set({ time: 1 - u }); time.set({ u }); mg.plate.set({ shade: u, fill: hold.state.fill });
        if (hold.state.fill >= 1) chosen = 'stay';
        if (u >= 1 && chosen === undefined) chosen = null;
        return chosen !== undefined;
      });
      time.remove();
      if (!ok) return;
      if (chosen) mg.snap({ at: chosen === 'stay' ? stay : hand });
      await d.end(mg, { as: 'neutral', choice: chosen });
    },
  },

  {
    id: 'kurs', group: 'Мини-игры', title: 'Курс', scene: DECK, state: { under_way: 1, sail: 1 },
    memo: ['«Алые паруса», Курс: держать нос (крупный красный диск на форштевне) на маяке, ветер сносит. Камера едет вместе с кораблём — жест где угодно, ему это не мешает.',
      'Три отрезка по 12 с — три отрезка полосы; огонёк — на курсе ли. Нос пульсирует с начала — приглашение. Веди вбок где угодно — это руль: смещение пальца поворачивает нос.',
      'Было: итог выбрасывался. Стало: итог виден (здесь — строкой итога, доля времени на курсе).'],
    async run(d) {
      const mg = d.mg({ phrase: 'Ветер сносит нос с маяка' });
      mg.glow('bow');
      const r = await d.tricks.steps(mg, [0, 1, 2].map(leg => bar => d.tricks.keepInZone(mg, {
        seconds: 12, zone: () => 0, width: 0.4, steer: 'rate', bar,
        push: t => 0.5 * (0.8 + 0.2 * leg) * (0.6 * Math.sin(2 * Math.PI * (t + 12 * leg) / 7) + 0.4 * Math.sin(2 * Math.PI * (t + 12 * leg) / 2.9 + 1)),
        progress: (u, s) => { d.set('heading', s.arrow); d.set('on_course', s.in ? 1 : 0, 0.4); },
      })));
      if (r.state === 'left') return;
      await d.end(mg, { errors: r.errors, share: r.results.reduce((a, x) => a + x.share, 0) / 3 });
    },
  },
  {
    id: 'uspokoit', group: 'Мини-игры', title: 'Успокоить', scene: WORKSHOP, demo: 'breath',
    memo: ['«Хризалиды», Успокоить: Петра бежит своим ходом — здесь мех дышит сам, часто и сбивчиво; держи в ритм с ним (кольцо растёт — держи, опадает — отпусти).',
      'Сцена идёт своим ходом и не ждёт: каждый удержанный вдох успокаивает — ритм меха замедляется; сбился — снова учащается.',
      'Шесть удержанных — спокойно. Проверить: видно, что ритм меняется на ходу; полоса идёт с каждым удержанным и стекает при сбое.'],
    async run(d) {
      const mg = d.mg({ phrase: 'Мех ходит часто и сбивчиво' });
      const mark = mg.mark({ at: 'bellows#handle' }), g = mg.rhythm({ on: mark, bpm: 84, breath: true });
      mg.glow('bellows');
      d.tricks.teach(mg, [g], { id: 'rhythm:breath' });
      let calm = 0;
      // the bellows breathe by themselves, on the rhythm's beats (the scene goes its own way)
      g.on('beat', ({ k }) => d.set('bellows', k % 2 ? 1 : 0.15, 60 / (84 - 6 * calm)));
      const off = breaths(mg, g, kept => {
        calm = clamp(calm + (kept ? 1 : -1), 0, 6);
        g.set({ bpm: 84 - 6 * calm });
        mg.plate.set({ fill: calm / 6 });
      });
      const ok = await d.loop(mg, () => calm >= 6);
      off();
      if (ok) { mg.snap({ at: mark }); await d.end(mg, {}); }
    },
  },

  // ── the board of sounds: the language's own, heard one by one on the playground's key; Pavel picks (П45) ──
  {
    id: 'sounds', group: 'Звуки', title: 'Доска звуков', scene: WORKSHOP, demo: 'none',
    memo: ['Только звуки, которые язык мини-игр делает сейчас, по ролям, — в тональности площадки (до); фоном — музыка площадки в той же тональности.',
      'Короткие: нажми — звучит. Процессы: ▶ — пошёл, ползунок — его ход (опасность, близость…), ■ — стоп.',
      'Сердечко — отметить, что нравится; внизу — номера выбранных: их и сказать.'],
    run: d => board(d.b, d.signal, d.key),
  },
];
