// The playground's demonstrations (docs/miniux/playground.md): each word of the language of mini-games (a vocabulary:
// marks, gestures that report, responses, the ghost, sounds, the plate) and its ready tricks, each part of a mini-game,
// and some mini-games of the three games put into it — each on the playground's things (`main`, the Workshop: the key
// `demo` sets what is on the table; `paluba`, the Deck: the deck, its close-up, the ship under way). Each is the game's own code: what
// happens, what is done, what is an error, when it ends — decided here, not by the language.
// A demonstration: {id, group, title, scene, demo (the workshop's `demo`), state (more of the scene's values), memo
// (what is meant, what to check, what must work — 3–6 lines), run(d)} — run plays it once; d (game.js): d.mg(o) — a
// mini-game (bespoke.minigame.start, left if the player goes to another demonstration), d.tricks, d.set(key, value,
// seconds), d.bump(key) — a counter of the scene +1, d.key — the playground's key, d.wait(seconds), d.when(mg, h, event, test), d.loop(mg, fn),
// d.errors(mg, soft), d.end(mg, {as, errors, choice, share}), d.result(r), d.note(text), d.b — bespoke.
import { board } from './board.js';

// the world's scenes, by folder
export const WORKSHOP = 'main', DECK = 'paluba';

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
// a danger growing under the finger while a gust blows, falling otherwise (the lantern; “The ring”)
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
// steps (for tricks.steps) that say “halfway” (the language's sound): when the step that brings the bar to half — not
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

// one press on a mark: the thing glows, a touch beside it is “missed”; teach — the ghost shows it at its first meeting
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

// a screw turned, or left loose: the quiet “leave” beside it is a second path, seen from the start (both shown)
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
    id: 'press', group: tr('Gestures'), title: tr('Press'), scene: WORKSHOP, demo: 'bell',
    memo: [tr('The bell glows by itself (a soft pulse) — it is the one to touch; a ring is on it. Press — it fires at once, on the touch.'),
      tr('Check: at the top, the plate “The bell has long been silent”; at a touch the ring shrinks, a light ring round the finger, a soft wooden knock.'),
      tr('Press beside it — a ripple at the finger, the ring twitches toward it, a dull sound; a chip quietly appears on the plate’s bar.'),
      tr('The first meeting with a gesture in a play (when the ghost finger shows it for the first time) is a soft try: the error is seen but not counted, no chip. A second run counts it; ⚙ “forget the showing” makes it a first meeting again.')],
    async run(d) {
      const mg = d.mg({ phrase: tr('The bell has long been silent') });
      const r = await pressOnce(d, mg, { at: 'bell#top', glow: 'bell', soft: d.tricks.first('press'), teach: 'press' });
      if (r.state === 'done') bell(d);
      await d.end(mg, r);
    },
  },
  {
    id: 'petals', group: tr('Gestures'), title: tr('Press with petals'), scene: WORKSHOP, demo: 'box',
    memo: [tr('The box has three drawers: press the ring — three petals with words open round it.'),
      tr('To choose — tap a petal, or, without letting go, slide the finger from the ring onto a petal and let go there; a touch off the petals closes them.'),
      tr('Check: a choice — a bar with no glow; the end — an even, soft chord.')],
    async run(d) {
      const mg = d.mg({ phrase: tr('One of the drawers holds what you need') });
      const box = mg.mark({ at: 'box#front' });
      const g = mg.press({ on: box, petals: [{ id: 'top', label: tr('Top') }, { id: 'middle', label: tr('Middle') }, { id: 'bottom', label: tr('Bottom') }] });
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
    id: 'repeat', group: tr('Gestures'), title: tr('Press repeatedly, with an answer'), scene: WORKSHOP, demo: 'door',
    memo: [tr('Knock on the little door three times — each touch its own knock, the door shudders, notches on the bar. Then the scene’s turn: knocks in answer.'),
      tr('Beside it, a pale ring “walk away” — a second path (a quiet mark with the same “press”), seen at once; the finger shows both.'),
      tr('Check: during the answer there are no marks and no glow; the plate’s glow breathes slowly.'),
      tr('Chose “walk away” — a fork, a neutral end.')],
    async run(d) {
      const mg = d.mg({ phrase: tr('Someone is behind the little door. You need not knock') });
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
    id: 'hold', group: tr('Gestures'), title: tr('Hold'), scene: WORKSHOP, demo: 'bellows',
    memo: [tr('A ring with a groove on the bellows’ handle — press and hold until the groove fills (1.5 s). The bellows swell. (The trick “hold till full”.)'),
      tr('Check: while you hold, the bellows glow steadily; the fill shows from under the finger, a breath is heard; full — a snap, no need to hold on.'),
      tr('Let go early — the fill drains back, the bellows pulse again (a first meeting in the play — the error not counted).')],
    async run(d) {
      const mg = d.mg({ phrase: tr('The bellows have sunk flat') });
      await d.end(mg, await d.tricks.holdTillFull(mg, { at: 'bellows#handle', glow: 'bellows', seconds: 1.5, progress: u => d.set('bellows', u) }));
    },
  },
  {
    id: 'hold-anywhere', group: tr('Gestures'), title: tr('Hold anywhere'), scene: WORKSHOP, demo: 'bellows',
    memo: [tr('No mark on the thing: hold anywhere on the screen (but the corners with buttons) — the bellows swell as long as you hold.'),
      tr('Under the finger, only a dot: the touch is taken. The progress is in the bellows themselves (they swell) and on the plate.'),
      tr('Check: while you hold, the bellows glow steadily; let go — they pulse; the finger shows it near the middle of the window.')],
    async run(d) {
      const mg = d.mg({ phrase: tr('The bellows move at any touch') });
      await d.end(mg, await holdAnywhere(d, mg, { glow: 'bellows', seconds: 2, progress: u => d.set('bellows', u) }));
    },
  },
  {
    id: 'hold-danger', group: tr('Gestures'), title: tr('Hold with danger'), scene: WORKSHOP, demo: 'lantern',
    memo: [tr('Hold on the lantern — it brightens. The arc along the mark’s edge reddens while the wind blows; if it reaches its end under the finger, the lantern goes out completely.'),
      tr('Let go — the wind drops, the arc falls back.'),
      tr('Check: you can see how close the danger is; it is clear without sound; no need to hold past full.')],
    async run(d) {
      const mg = d.mg({ phrase: tr('The wind troubles the flame') });
      const r = await d.tricks.holdTillFull(mg, { at: 'lantern#flame', glow: 'lantern', seconds: 4, danger: s => { d.set('wind', gust(s.t)); return windy(0.9)(s); }, progress: u => d.set('lantern', u) });
      d.set('wind', 0, 0.5);
      await d.end(mg, r);
    },
  },
  {
    id: 'hold-still', group: tr('Gestures'), title: tr('Keep still'), scene: WORKSHOP, demo: 'candle',
    memo: [tr('Hold on the candle for 3 s and do not move the finger: the danger grows with movement (a tremor under 24 px does not count).'),
      tr('Check: the arc on the mark’s edge grows as you move the finger and falls back when you keep still; the flame thrashes with it.'),
      tr('When it reaches its end, the mark shrinks with a jerk and the fill falls; from then on the danger counts from where the finger is now.')],
    async run(d) {
      const mg = d.mg({ phrase: tr('The flame flinches at the slightest move') });
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
    id: 'hold-quench', group: tr('Gestures'), title: tr('Quench'), scene: WORKSHOP, demo: 'wicks',
    memo: [tr('Three wicks start smoking by themselves — the danger arc grows on each mark. Hold the one that smokes — it calms down.'),
      tr('Three marks and three holds at once. Against the clock (12 s): the bar runs with time; the glow reddens when some wick is close to trouble.'),
      tr('A wick that reaches the end — the error “into danger”; three of them — a loss (the shade on the right grows with each).'),
      tr('Check: you can see which wick is closer to trouble; one finger — one mark.')],
    async run(d) {
      const mg = d.mg({ phrase: tr('The wicks are smoking') }), errors = d.errors(mg);
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
    id: 'hold-catch', group: tr('Gestures'), title: tr('Hand over hand'), scene: WORKSHOP, demo: 'brackets',
    memo: [tr('Two brackets, left and right, in turn: hold a short fill (0.3 s) — a snap — the mark moves to the other side.'),
      tr('Six changes of hand — six parts of the bar with notches (the trick “steps in turn” of “hold till full”). The weight rises.'),
      tr('Check: only one mark is ever seen; let go early — “let go early”; by the third change with no error counted — “halfway”.')],
    async run(d) {
      const mg = d.mg({ phrase: tr('It is a long way to the top') });
      const r = await d.tricks.steps(mg, halfway(mg, Array.from({ length: 6 }, (_, i) => bar => d.tricks.holdTillFull(mg, {
        at: i % 2 ? 'brackets#right' : 'brackets#left', seconds: 0.3, bar,
        progress: u => { d.set('climb', (i + u) / 6, 0.3); if (u >= 1) d.set('grip', i % 2 ? 'right' : 'left'); },
      }))));
      d.set('grip', 'none');
      await d.end(mg, r);
    },
  },
  {
    id: 'pull', group: tr('Gestures'), title: tr('Pull'), scene: WORKSHOP, demo: 'rope',
    memo: [tr('On the weight, a dashed ring. Press and pull: the weight follows the finger from the first frame; only now do the way and the target at the hook show.'),
      tr('Done — when you let go of the weight inside the target’s ring (it turns green while the weight is in it). It never gets there by itself, nor sticks.'),
      tr('Let go halfway — the weight stays, the way and the target fade; you can go on.')],
    async run(d) {
      const mg = d.mg({ phrase: tr('The weight falls short of the hook') });
      await d.end(mg, await d.tricks.pullTo(mg, { thing: 'rope#weight', to: 'rope#hook', progress: u => d.set('rope', u) }));
    },
  },
  {
    id: 'pull-spring', group: tr('Gestures'), title: tr('Pull with a spring'), scene: WORKSHOP, demo: 'shutter',
    memo: [tr('Lift the shutter to the top and let go there. Let go early — it visibly slides back down (about 0.7 s, from wherever you let go).'),
      tr('Check: this is no error (no sound of a slip) — just a spring; the target shows only while you pull.')],
    async run(d) {
      const mg = d.mg({ phrase: tr('There is light behind the shutter') });
      await d.end(mg, await d.tricks.pullTo(mg, { thing: 'shutter#handle', to: 'shutter#top', release: 'spring', progress: u => d.set('shutter', u) }));
    },
  },
  {
    id: 'pull-resist', group: tr('Gestures'), title: tr('Pull against resistance'), scene: WORKSHOP, demo: 'crate',
    memo: [tr('A heavy crate: pull it forward — a red thread stretches between the crate and the finger, thicker and brighter with the strain. The crate moves while the finger is well ahead of it.'),
      tr('Let go — the crate rolls back. Done — let go when the crate is in the target’s ring.'),
      tr('Check: the strain is seen (a thicker, brighter thread); the crate does not jump after the finger.')],
    async run(d) {
      const mg = d.mg({ phrase: tr('The crate is heavy and in the wrong place') });
      await d.end(mg, await d.tricks.pullTo(mg, { thing: 'crate#handle', glow: 'crate', to: 'crate#goal', heavy: true, release: 'spring', progress: u => d.set('crate', u) }));
    },
  },
  {
    id: 'pull-tear', group: tr('Gestures'), title: tr('Tear off'), scene: WORKSHOP, demo: 'knot',
    memo: [tr('No target: pull the knot any way — a little (5% of the window’s height), and it comes apart.'),
      tr('Check: the knot loosens as you pull; let go early — all as it was, no error.')],
    async run(d) {
      const mg = d.mg({ phrase: tr('The knot is about to give') });
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
    id: 'pull-where', group: tr('Gestures'), title: tr('Pull to a place'), scene: WORKSHOP, demo: 'sockets',
    memo: [tr('The peg goes into one of the sockets. Take it — the peg is at the finger (in the scene, not just a mark), the sockets appear: empty rings — allowed, a pale dashed one — not.'),
      tr('Let go at the “not” one — the socket shakes “no” (the error “wrong place”), the peg visibly goes back to its place. In an empty spot — it goes back too, no error.'),
      tr('Check: the peg never vanishes nor jumps.')],
    async run(d) {
      const mg = d.mg({ phrase: tr('The board has an empty socket') }), errors = d.errors(mg);
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
        // let go astray: it goes back, seen (wish 37), and lies down there
        if (rest) { const was = rest; rest = null; d.set('peg_u', was.u, 0.4); d.set('peg_v', was.v, 0.4); d.wait(0.45).then(() => { if (!rest && !placed) d.set('peg', 'none'); }); }
      });
      if (!await d.loop(mg, () => placed)) return;
      d.set('peg', placed.split('#')[1]); mg.plate.set({ fill: 1 }); mg.snap({ at: peg });
      await d.end(mg, { errors: errors.all, choice: placed });
    },
  },
  {
    id: 'pull-catch', group: tr('Gestures'), title: tr('Catch'), scene: WORKSHOP, demo: 'bubbles',
    memo: [tr('The bubbles float by themselves — three marks and three pulls at once. Touch a bubble — it is at the finger (in the scene, under the finger); the sockets appear — carry it to any free one.'),
      tr('Three bubbles — three notches on the bar; a taken socket closes. Let go elsewhere — the bubble floats on from there.'),
      tr('Check: the mark follows the bubble (the camera stands); catching is easy — the touch circle is wider than the mark.')],
    async run(d) {
      const mg = d.mg({ phrase: tr('Bubbles drift past the sockets') }), errors = d.errors(mg);
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
    id: 'trace', group: tr('Gestures'), title: tr('Trace a line'), scene: WORKSHOP, demo: 'crack',
    memo: [tr('Start in the ring at the crack’s beginning and lead along the dashes — what is passed lightens, the glue fills the crack.'),
      tr('You may let go and go on from the same place. The tolerance is generous (48 px).'),
      tr('Gone too far — the trail breaks off, the place to come back to flashes (the error “off the way”).')],
    async run(d) {
      const mg = d.mg({ phrase: tr('A crack has split the board') });
      await d.end(mg, await d.tricks.traceLine(mg, { line: crack, progress: u => d.set('crack', u) }));
    },
  },
  {
    id: 'turn', group: tr('Gestures'), title: tr('Turn'), scene: WORKSHOP, demo: 'screw',
    memo: [tr('Lead round the screw the way the arrow shows (clockwise). One and a half turns. The radius does not matter.'),
      tr('Check: a soft wooden click at each quarter; the screw turns.'),
      tr('Against the arrow — the screw stands, the arrow flashes (the error “against”).')],
    async run(d) {
      const mg = d.mg({ phrase: tr('The lid hangs by a thread') });
      await d.end(mg, await d.tricks.turnTimes(mg, { at: 'screws#s1', turns: 1.5, progress: u => d.set('screw1', u) }));
    },
  },
  {
    id: 'turn-leave', group: tr('Gestures'), title: tr('Turn or leave'), scene: WORKSHOP, demo: 'screw',
    memo: [tr('The same, but beside it a quiet pale mark “leave” — a second path, seen at once; the finger shows both.'),
      tr('Pressed “leave” — a fork, a neutral end; the showing is not repeated (doing nothing can be a choice).')],
    async run(d) {
      const mg = d.mg({ phrase: tr('The screw need not be driven home') });
      const r = await turnOrLeave(d, mg, { at: 'screws#s1', turns: 1.5, bar: u => mg.plate.set({ fill: u }), progress: u => d.set('screw1', u) });
      await d.end(mg, { as: r.state === 'leave' ? 'neutral' : undefined, errors: r.errors, choice: r.state });
    },
  },
  {
    id: 'rub', group: tr('Gestures'), title: tr('Rub'), scene: WORKSHOP, demo: 'plate',
    memo: [tr('A spot over the dusty plaque: move the finger, pressed, until you cover it. Direction and speed do not matter.'),
      tr('Check: the spot shrinks as it is covered, the rustle is louder when you move fast; the dust comes off.'),
      tr('A touch off the spot — a ripple, the spot twitches toward the finger (“missed”).')],
    async run(d) {
      const mg = d.mg({ phrase: tr('Something is written under the dust') });
      await d.end(mg, await d.tricks.rubTill(mg, { at: 'plate#dust', glow: 'plate', progress: u => d.set('plate', u) }));
    },
  },
  {
    id: 'seek', group: tr('Gestures'), title: tr('Seek'), scene: WORKSHOP, demo: 'floor',
    memo: [tr('A spot over the floorboards: move, pressed — a lens under the finger. Nearer the hidden thing it grows warmer (redder, lighter) and the hum comes closer.'),
      tr('Found it — keep the finger there, the lens fills — the place flashes. Nothing is sought without a press.'),
      tr('Check: warm and cold are seen with the eyes; it can be found without sound too.')],
    async run(d) {
      const mg = d.mg({ phrase: tr('Something is scratching under the floorboards') });
      const r = await d.tricks.seekAndHold(mg, { area: 'floor#area', place: 'floor#hidden' });
      if (r.state === 'done') d.set('floor_found', true);
      await d.end(mg, r);
    },
  },
  {
    id: 'inspect', group: tr('Gestures'), title: tr('Inspect'), scene: WORKSHOP, demo: 'shells',
    memo: [tr('Three shells, a hold on each. Touch one — a plain one rocks; “the odd one” opens slightly for a second — a pearl under it, a warm light round it. Keep the finger on it — found.'),
      tr('Held on a plain one — it shakes “no” (the error “wrong thing”).'),
      tr('Check: “the odd one” is seen with the eyes, with no label.')],
    async run(d) {
      const odd = shells[Math.floor(Math.random() * 3)];
      d.set('shell_odd', odd.split('#')[1]);
      const mg = d.mg({ phrase: tr('One shell here does not belong') }), errors = d.errors(mg);
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
    id: 'rhythm', group: tr('Gestures'), title: tr('Rhythm'), scene: WORKSHOP, demo: 'drum',
    memo: [tr('A second ring closes in on the ring on the drum: press when it touches the edge. 8 hits on the beat are needed — not perfectly even (the trick “N hits on the beat”).'),
      tr('A hit — a flash, a soft beat, the bar moves; early or late — a red speck before or after the edge; a miss is not counted, and what was gained is not lost.'),
      tr('Check: you can see ahead when to press.')],
    async run(d) {
      const mg = d.mg({ phrase: tr('The drum sets the beat') });
      await d.end(mg, await d.tricks.hitsInBeat(mg, { at: 'drum#skin', glow: 'drum', bpm: 80, hits: 8, onHit: () => d.bump('drum_hits') }));
    },
  },
  {
    id: 'rhythm-hold', group: tr('Gestures'), title: tr('Hold in rhythm'), scene: WORKSHOP, demo: 'breath',
    memo: [tr('The bellows breathe: the second ring grows — hold (breathe in), it shrinks — let go (breathe out). Four good breaths.'),
      tr('Check: it is clear when to hold and when to let go; the plate’s glow is red when off the beat.')],
    async run(d) {
      const mg = d.mg({ phrase: tr('The bellows move slowly') });
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
    id: 'rhythm-interval', group: tr('Gestures'), title: tr('Rhythm: interval'), scene: WORKSHOP, demo: 'drum',
    memo: [tr('What matters is not the grid but the gap between touches: no more often and no less often than the ring closes (0.45–0.8 s). Eight even ones.'),
      tr('The ring closes from each touch to the next right moment (the game sets the rhythm’s next beat).'),
      tr('Too often — a double ripple (the error “too often”).')],
    async run(d) {
      const mg = d.mg({ phrase: tr('An uneven step is heard at once here') }), errors = d.errors(mg);
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
    id: 'rhythm-own', group: tr('Gestures'), title: tr('Your own rhythm'), scene: WORKSHOP, demo: 'drum2',
    memo: [tr('The left drum beats its own rhythm: on it, no mark but a beat’s sign — a soft light swelling toward each beat. What to echo, not where to press.'),
      tr('Yours is the right drum: it pulses, your blue ring on it from the very start; there, “a touch as it is”. A touch beside it — “missed” (not counted).'),
      tr('The plate moves on with each of its beats and colours it by how you played: light — you echo, blue — your own, pale — you were silent. The outcome — as most of the beats were played.'),
      tr('Check: you can see as you go where it is heading; both paths are neutral, no errors and no “good/bad”; the finger shows where to play.')],
    async run(d) {
      const mg = d.mg({ phrase: tr('The drum beats alone. Echo it — or play your own') });
      const r = await ownBeat(d, mg, { bpm: 72, beats: 12 });
      if (r.state === 'done') await d.end(mg, { as: 'neutral', choice: r.choice });
    },
  },
  {
    id: 'lead', group: tr('Gestures'), title: tr('Lead'), scene: WORKSHOP, demo: 'boat', state: { zone_kind: 'zone' },
    memo: [tr('A red arrow from the boat’s bow — where it points. Press anywhere and lead sideways: the arrow follows the shift. Keep it in the light zone on the scale — the zone drifts.'),
      tr('Let go — the bow comes back. 12 s; the plate’s glow — whether you are in the zone.'),
      tr('Check: in the zone, the zone lights up.')],
    async run(d) {
      const mg = d.mg({ phrase: tr('The boat keeps drifting off') });
      mg.glow('boat');
      await d.end(mg, await d.tricks.keepInZone(mg, { seconds: 12, zone: t => 0.55 * Math.sin(t * 0.45), width: 0.35, progress: (u, s) => boat(d, s) }));
    },
  },
  {
    id: 'lead-follow', group: tr('Gestures'), title: tr('Follow a moving target'), scene: WORKSHOP, demo: 'boat', state: { zone_kind: 'firefly' },
    memo: [tr('A firefly flies over the scale — keep the bow’s arrow on it.'), tr('Check: the same as “Lead”, but the target is alive and faster.')],
    async run(d) {
      const mg = d.mg({ phrase: tr('The firefly drifts aside') });
      mg.glow('boat');
      await d.end(mg, await d.tricks.keepInZone(mg, { seconds: 12, zone: t => 0.6 * Math.sin(t * 0.9) * Math.cos(t * 0.37), width: 0.3, progress: (u, s) => boat(d, s) }));
    },
  },
  {
    id: 'lead-away', group: tr('Gestures'), title: tr('Keep away'), scene: WORKSHOP, demo: 'boat', state: { zone_kind: 'bee' },
    memo: [tr('A bumblebee in a red ring over the scale — keep the bow’s arrow well away from it.'), tr('Check: “good” — when the bow is outside its ring; no need to aim at the bumblebee.')],
    async run(d) {
      const mg = d.mg({ phrase: tr('A bumblebee is near') });
      mg.glow('boat');
      await d.end(mg, await d.tricks.keepInZone(mg, { seconds: 12, away: true, zone: t => 0.7 * Math.sin(t * 0.6), width: 0.4, progress: (u, s) => boat(d, s) }));
    },
  },
  {
    id: 'lead-smooth', group: tr('Gestures'), title: tr('Lead smoothly'), scene: WORKSHOP, demo: 'boat', state: { zone_kind: 'zone' },
    memo: [tr('The same, but no jerks: a sharp move of the finger tears the track (the error “jerked”).'), tr('Check: you can lead smoothly with no errors.')],
    async run(d) {
      const mg = d.mg({ phrase: tr('Sharp moves make the boat yaw') });
      mg.glow('boat');
      await d.end(mg, await d.tricks.keepInZone(mg, { seconds: 12, smooth: true, zone: t => 0.5 * Math.sin(t * 0.4), width: 0.35, progress: (u, s) => boat(d, s) }));
    },
  },
  {
    id: 'wait', group: tr('Gestures'), title: tr('Wait'), scene: WORKSHOP, demo: 'hourglass',
    memo: [tr('Do nothing: the sand runs through, doing nothing is the way. No gesture — only time on the bar and its sound.'),
      tr('The finger shows “hands off” once (comes up and goes away upward), never again. A touch makes only a ripple: where a touch means nothing, there is no “missed”.'),
      tr('Check: it is clear that you may do nothing; the bar reaches its end, and that is no error.')],
    async run(d) {
      const mg = d.mg({ phrase: tr('The sand is still running') }), time = mg.layer('time');
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
    id: 'frame-enter', group: tr('Frame'), title: tr('Start and end'), scene: WORKSHOP, demo: 'bell',
    memo: [tr('Start: at the top centre the plate with its phrase appears, the bell pulses, the mark appears with a bounce, a quiet entry sound. Nothing darkens the scene.'),
      tr('Three presses — three notches. The end: the bar flashes full length, a chord; a second later the plate melts away.'),
      tr('Check: with no words it is clear that the mini-game began and ended.')],
    async run(d) {
      const mg = d.mg({ phrase: tr('The bell is rung three times') });
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
    id: 'frame-ghost', group: tr('Frame'), title: tr('The ghost finger'), scene: WORKSHOP, demo: 'rope',
    memo: [tr('The showing is forgotten before this demonstration: the finger (a light circle with a shadow and a trail) pulls the weight to the hook by itself — the weight follows it; the finger lets go, and the weight visibly goes back to its place.'),
      tr('A touch stops the showing. Do nothing for 4 s — it is shown again, then every 8 s (the trick “shown at the first meeting and when you keep still”).'),
      tr('Check: the showing is clear.')],
    async run(d) {
      d.tricks.forget();
      const mg = d.mg({ phrase: tr('The weight falls short of the hook') });
      await d.end(mg, await d.tricks.pullTo(mg, { thing: 'rope#weight', to: 'rope#hook', progress: u => d.set('rope', u) }));
    },
  },
  {
    id: 'frame-plate', group: tr('Frame'), title: tr('The plate'), scene: WORKSHOP, demo: 'bell',
    memo: [tr('Five steps of different gestures — five parts of the bar with notches (the trick “steps in turn”); the phrase changes with the step.'),
      tr('The glow at the edge of the fill: doing nothing — small and calm; doing it right — brighter, the fill moves; doing it wrong — it reddens and trembles.'),
      tr('An error — a quiet chip where the fill is (with no flying spark).'),
      tr('Check: out of the corner of the eye it is clear whether it goes well now and how far you have come.')],
    async run(d) {
      const mg = d.mg({ phrase: tr('The bell has long been silent') });
      const phrase = (text, step) => bar => { mg.plate.set({ phrase: text }); return step(bar); };
      const r = await d.tricks.steps(mg, [
        phrase(tr('The bell has long been silent'), bar => pressOnce(d, mg, { at: 'bell#top', glow: 'bell', bar }).then(x => (x.state === 'done' && bell(d), x))),
        phrase(tr('The bell rings at any touch'), bar => holdAnywhere(d, mg, { glow: 'bell', seconds: 1.2, bar })),
        phrase(tr('One ring is not enough'), bar => pressOnce(d, mg, { at: 'bell#top', glow: 'bell', bar }).then(x => (x.state === 'done' && bell(d), x))),
        phrase(tr('The sound breaks off too soon'), bar => d.tricks.holdTillFull(mg, { at: 'bell#top', glow: 'bell', seconds: 1, bar })),
        phrase(tr('One last ring is left'), bar => pressOnce(d, mg, { at: 'bell#top', glow: 'bell', bar }).then(x => (x.state === 'done' && bell(d), x))),
      ]);
      await d.end(mg, r);
    },
  },
  {
    id: 'frame-turn', group: tr('Frame'), title: tr('The scene’s turn'), scene: WORKSHOP, demo: 'door',
    memo: [tr('A knock — then the scene answers: no marks, no glow, the plate’s glow breathes slowly (“not frozen, waiting”), a touch makes only a ripple. Then your turn again.'),
      tr('Check: during the answer it is clear you must wait; the mark comes back.')],
    async run(d) {
      const mg = d.mg({ phrase: tr('All is quiet behind the little door') });
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
    id: 'frame-errors', group: tr('Frame'), title: tr('Errors'), scene: WORKSHOP, demo: 'bell',
    memo: [tr('Each error has its own look and sound, where it happened; a quiet chip on the bar (no soft try here — everything counts).'),
      tr('Steps: the bell (press beside it — “missed”), hold (let go early — “let go early”), hold anywhere in the wind — the bell sways in the gusts, the arc is on it (“into danger”), the bell three times.'),
      tr('Three error sounds, all quiet: a dull “miss”, a “slip”, a “fault”.'),
      tr('The other errors are in their own demonstrations: “off the way” (a line), “wrong place” (where), “too early or too late” and “too often” (rhythm), “against” (turn), “jerked” (smoothly).')],
    async run(d) {
      const mg = d.mg({ phrase: tr('The bell has long been silent') });
      const r = await d.tricks.steps(mg, [
        bar => pressOnce(d, mg, { at: 'bell#top', glow: 'bell', bar }).then(x => (x.state === 'done' && bell(d), x)),
        bar => { mg.plate.set({ phrase: tr('The sound breaks off too soon') }); return d.tricks.holdTillFull(mg, { at: 'bell#top', glow: 'bell', seconds: 2, soft: false, bar }); },
        async bar => {
          mg.plate.set({ phrase: tr('The wind sways the bell') });
          const x = await holdAnywhere(d, mg, { glow: 'bell', seconds: 3, bar, dangerAt: 'bell#top', danger: s => { d.set('wind', gust(s.t)); return windy(1.2)(s); } });
          d.set('wind', 0, 0.5);
          return x;
        },
        async bar => {
          mg.plate.set({ phrase: tr('The bell is rung three times') });
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
    id: 'frame-loss', group: tr('Frame'), title: tr('Loss'), scene: WORKSHOP, demo: 'lantern',
    memo: [tr('A game that allows a loss (the game decides, not the language): two errors — a loss. On the plate, a shade on the right: how much is left before the loss; it grows with each error.'),
      tr('Hold the lantern in the wind until it goes out twice. The loss end: the shade covers the bar, a low quiet sound.'),
      tr('Check: it differs from a success at first glance.')],
    async run(d) {
      const mg = d.mg({ phrase: tr('The wind troubles the flame. Two matches left') }), errors = d.errors(mg);
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
    id: 'frame-limit', group: tr('Frame'), title: tr('Time running out'), scene: WORKSHOP, demo: 'plate',
    memo: [tr('The limit is time (10 s), set by the game: the shade on the right creeps as time goes, and time’s pulse is heard. Not rubbed clean in time — a loss.'),
      tr('Check: out of the corner of the eye you see whether you must hurry.')],
    async run(d) {
      const mg = d.mg({ phrase: tr('Dust is about to cover the writing') }), time = mg.layer('time'), t0 = mg.t;
      let out = false;
      mg.on('frame', ({ t }) => { const u = clamp((t - t0) / 10); mg.plate.set({ shade: u }); time.set({ u }); if (u >= 1 && !out) { out = true; time.remove(); d.end(mg, { as: 'loss' }); } });
      const r = await d.tricks.rubTill(mg, { at: 'plate#dust', glow: 'plate', progress: u => d.set('plate', u) });
      time.remove();
      if (!out) await d.end(mg, r);
    },
  },
  {
    id: 'frame-pause', group: tr('Frame'), title: tr('Pause'), scene: WORKSHOP, demo: 'drum',
    memo: [tr('Rhythm: 20 hits on the beat are needed. Midway press ⏸ (bottom right corner): everything stands — the ring, the time, the sound, the drum’s pulse; the game is told “pause”.'),
      tr('Press ▶ — the rhythm counts in three ticks and goes on from the same place.'),
      tr('Check: you lose no hits on pause; the same if you hide the tab and come back.')],
    async run(d) {
      const mg = d.mg({ phrase: tr('The drum sets the beat') });
      mg.on('pause', () => d.note(tr('paused'))); mg.on('resume', () => d.note(tr('resumed')));
      await d.end(mg, await d.tricks.hitsInBeat(mg, { at: 'drum#skin', glow: 'drum', bpm: 80, hits: 20, onHit: () => d.bump('drum_hits') }));
    },
  },
  {
    id: 'frame-choice', group: tr('Frame'), title: tr('A plain choice'), scene: WORKSHOP, demo: 'box',
    memo: [tr('A choice between mini-games — in the same language, with no plate: a mark, petals. Here against the clock (8 s): the arc along the mark’s edge runs down; silence is a choice too.'),
      tr('Then — a choice of one action: a mark with no petals, it fires at once, on the touch.'),
      tr('Check: the time is seen on the mark; one action — no menu.')],
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
      const a = await pick([{ id: 'open', label: tr('Open') }, { id: 'leave', label: tr('Leave') }], 8);
      if (a === undefined) return;
      d.note(tr('chosen: {choice}', { choice: a ?? tr('silence') }));
      if (a === 'open') { d.set('drawer', 'middle'); d.set('drawer_open', 1, 0.6); }
      const b = await pick([{ id: 'close', label: tr('Close') }]);
      if (b === undefined) return;
      d.note(tr('chosen: {choice}', { choice: b }));
      d.set('drawer_open', 0, 0.6);
    },
  },
  {
    id: 'frame-skip', group: tr('Frame'), title: tr('Skip'), scene: WORKSHOP, demo: 'screws',
    memo: [tr('Four screws. In the bottom right corner beside ⏸ — ⏭, every player’s: in case something glitches, not a way through. Press it — the game learns of it and decides itself: here the mini-game ends at once, with no chord.'),
      tr('The outcome is as if played: “success” (a skip leaves the same trace in the story as playing).')],
    async run(d) {
      const mg = d.mg({ phrase: tr('The lid hangs by a thread') });
      await d.end(mg, await d.tricks.steps(mg, [1, 2, 3, 4].map(i => bar => d.tricks.turnTimes(mg, { at: `screws#s${i}`, turns: 1, bar, progress: u => d.set(`screw${i}`, u) }))));
    },
  },
  {
    id: 'frame-soft', group: tr('Frame'), title: tr('Soft try'), scene: WORKSHOP, demo: 'bellows',
    memo: [tr('The showing is forgotten: the gesture is met for the first time in the play. Errors are seen and heard but not counted: no chip, a clean outcome (the trick “soft try”).'),
      tr('Let go early a couple of times, then fill it up. Then the second step — the same gesture: now errors count.')],
    async run(d) {
      d.tricks.forget();
      const mg = d.mg({ phrase: tr('The bellows have sunk flat') });
      const r = await d.tricks.steps(mg, [
        bar => d.tricks.holdTillFull(mg, { at: 'bellows#handle', glow: 'bellows', seconds: 2, bar, progress: u => d.set('bellows', u) }),
        bar => { d.set('bellows', 0, 0.6); mg.plate.set({ phrase: tr('The bellows have sunk again') }); return d.tricks.holdTillFull(mg, { at: 'bellows#handle', glow: 'bellows', seconds: 2, soft: false, bar, progress: u => d.set('bellows', u) }); },
      ]);
      await d.end(mg, r);
    },
  },
  // ── mini-games of the three games, put into the language ──
  {
    id: 'osnastka', group: tr('Mini-games'), title: tr('Rigging'), scene: DECK,
    memo: [tr('Scarlet Sails, Rigging: four fastenings in the close-up insert, one mark at a time, hold till the snap (the tricks “steps in turn” and “hold till full”).'),
      tr('Was: hold “at the point” with no mark, the girl’s hand far from the point. Now: the mark is where they fasten; the first fastening is a soft try (a slip not counted).'),
      tr('Check: the marks live only in the insert (while it is open); four parts of the bar; two fastenings with no slip — “halfway”.')],
    async run(d) {
      d.set('closeup', 1, 0.6);
      await d.wait(0.8);
      const mg = d.mg({ phrase: tr('The sails are not yet made fast') });
      const r = await d.tricks.steps(mg, halfway(mg, [1, 2, 3, 4].map(i => bar => d.tricks.holdTillFull(mg, { at: `closeup#k${i}`, seconds: 1.4, bar, progress: u => d.set(`rig${i}`, u) }))));
      await d.end(mg, r);
      d.set('closeup', 0, 0.6);
    },
  },
  {
    id: 'vinty', group: tr('Mini-games'), title: tr('The screws'), scene: WORKSHOP, demo: 'screws',
    memo: [tr('Usher, The screws: four screws, to turn; beside them a quiet “leave”, seen at once.'),
      tr('Was: “leave” was hidden in the ring’s menu. Now: the second path is seen before choosing; “leave” is a fork, a neutral end.'),
      tr('Check: choose “leave” on any screw — the mini-game ends with a choice.')],
    async run(d) {
      const mg = d.mg({ phrase: tr('The screws need not be driven home') });
      const r = await d.tricks.steps(mg, [1, 2, 3, 4].map(i => bar => turnOrLeave(d, mg, { at: `screws#s${i}`, turns: 1, bar, progress: u => d.set(`screw${i}`, u) })));
      if (r.state === 'left') return;
      await d.end(mg, { as: r.state === 'leave' ? 'neutral' : undefined, errors: r.errors, choice: r.state === 'leave' ? 'leave' : 'all' });
    },
  },
  {
    id: 'struna', group: tr('Mini-games'), title: tr('String'), scene: WORKSHOP, demo: 'drum2',
    memo: [tr('Usher, String: his rhythm on the left drum (a beat’s sign, not a mark), yours on the right (your ring is there from the start). Your own rhythm or his — both paths are neutral, the plate colours each beat by how it was played; not pressing — a third outcome.'),
      tr('Was: doing nothing counted as “with him”, the beat’s window ≤ 60 ms. Now: three outcomes, a window of ±150 ms.'),
      tr('Check: both rhythms are seen; no errors.')],
    async run(d) {
      const mg = d.mg({ phrase: tr('The drum beats alone. Echo it — or play your own') });
      const r = await ownBeat(d, mg, { bpm: 96, beats: 16 });
      if (r.state === 'done') await d.end(mg, { as: 'neutral', choice: r.choice });
    },
  },
  {
    id: 'koltso', group: tr('Mini-games'), title: tr('The ring'), scene: WORKSHOP, demo: 'lantern',
    memo: [tr('Scarlet Sails, The ring: put the ring on the sleeping girl’s finger — hold until she stirs. Here — the lantern in the wind.'),
      tr('Was: “she stirs” — by ear only. Now: the danger is an arc on the mark’s edge, seen with the eyes.'),
      tr('Check: you can get through by letting go in the gusts.')],
    async run(d) {
      const mg = d.mg({ phrase: tr('The draught is putting out the light') });
      const r = await d.tricks.holdTillFull(mg, { at: 'lantern#flame', glow: 'lantern', seconds: 5, danger: s => { d.set('wind', gust(s.t)); return windy(0.8)(s); }, progress: u => d.set('lantern', u) });
      d.set('wind', 0, 0.5);
      await d.end(mg, r);
    },
  },
  {
    id: 'slushat', group: tr('Mini-games'), title: tr('Listen'), scene: WORKSHOP, demo: 'floor',
    memo: [tr('Usher, Listen: find the place under the floor. Was: moving the mouse with no press — impossible on a phone, by ear only.'),
      tr('Now: seek with a press, the lens grows warmer to the eye and to the ear.'),
      tr('Check: it is found on a phone and with no sound.')],
    async run(d) {
      const mg = d.mg({ phrase: tr('Something is scratching under the floorboards') });
      const r = await d.tricks.seekAndHold(mg, { area: 'floor#area', place: 'floor#hidden', radius: 170 });
      if (r.state === 'done') d.set('floor_found', true);
      await d.end(mg, r);
    },
  },
  {
    id: 'ruki', group: tr('Mini-games'), title: tr('Hands'), scene: WORKSHOP, demo: 'sockets',
    memo: [tr('Usher, Hands — two marks and two gestures at once. Here on the Workshop’s things: the peg is a hand, it can be pulled to one of the two outer sockets (her hands); the middle socket is “stay”, it can be held.'),
      tr('Whatever comes first is the choice: the peg let go in an outer socket, or “stay” filled. Time — an arc on the peg and a shade on the plate (10 s); when it runs out, nothing is chosen.'),
      tr('Check: both marks are seen at once, the finger shows both; the response is neutral, there is no “wrong”.')],
    async run(d) {
      const mg = d.mg({ phrase: tr('Two hands reach out. You may also stay') }), time = mg.layer('time');
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
    id: 'kurs', group: tr('Mini-games'), title: tr('Course'), scene: DECK, state: { under_way: 1, sail: 1 },
    memo: [tr('Scarlet Sails, Course: keep the bow (a big red disc on the stem) on the lighthouse; the wind pushes it off. The camera moves with the ship — the gesture is anywhere, so this does not hinder it.'),
      tr('Three legs of 12 s — three parts of the bar; the glow — whether on course. The bow pulses from the start — an invitation. Lead sideways anywhere — it is the helm: the finger’s shift turns the bow.'),
      tr('Was: the outcome was thrown away. Now: the outcome is seen (here as the outcome line, the share of time on course).')],
    async run(d) {
      const mg = d.mg({ phrase: tr('The wind pushes the bow off the lighthouse') });
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
    id: 'uspokoit', group: tr('Mini-games'), title: tr('Calm her'), scene: WORKSHOP, demo: 'breath',
    memo: [tr('The Chrysalids, Calm her: Petra runs at her own pace — here the bellows breathe by themselves, fast and unevenly; hold in rhythm with them (the ring grows — hold, it shrinks — let go).'),
      tr('The scene goes its own way and does not wait: each breath held calms — the bellows’ rhythm slows; lose the beat — it quickens again.'),
      tr('Six held — calm. Check: you see the rhythm change as it goes; the bar moves with each one held and drains at a slip.')],
    async run(d) {
      const mg = d.mg({ phrase: tr('The bellows heave fast and unevenly') });
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

  // ── the board of sounds: the language's own, heard one by one on the playground's key; Pavel picks (wish 45) ──
  {
    id: 'sounds', group: tr('Sounds'), title: tr('Sound board'), scene: WORKSHOP, demo: 'none',
    memo: [tr('Only the sounds the language of mini-games makes now, by role — in the playground’s key (C); behind them, the playground’s music in the same key.'),
      tr('Short ones: press — it sounds. Processes: ▶ — it starts, the slider — its course (danger, closeness…), ■ — stop.'),
      tr('A heart marks what you like; at the foot, the numbers picked: say those.')],
    run: d => board(d.b, d.signal, d.key),
  },
];
