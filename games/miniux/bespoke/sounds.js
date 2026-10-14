// The board's library of sounds (П45–П48) — the playground's own: every candidate for the language of mini-games, what
// the owner picked and what he did not. The language's own sounds are the page's (minigame/sounds.js: the ones it
// took, the same means); LANGUAGE here is what it took (what the board says of each). General, by role — not the sound
// of a thing. In groups: «Понравилось» — recorded clicks and a few noisy ones made
// here; then families of low tonal sounds — Орган, Фисгармония, Электропиано, Чаша, Виолончель, Хор «у». The rule
// (language.md §6): low and middle register (D2 73 Hz … B3 247 Hz); chords — fifths and octaves, a diminished seventh
// for alarm (symmetric — no key of its own, so they lie on any game's music); no triads, no tune. What is right is in
// tune (the voices together); what is not is apart (voices spread, a tone beside itself) — and a process goes honestly
// between them.
//   SOUNDS — short, one per event: [{id, name, group, role, language, play(ctx, out, at)}] — language: what of the
//     language it is (Russian; none — only the board's)
//   LAYERS — processes (П47): what lasts while a gesture goes on and follows it every frame; silent when nothing is
//     done. Intensity is width (detuned voices), the filter and overtones added — not noise. [{id, name, group, role,
//     param, language, make(ctx, out)}] — role: налив, напряжение, в зоне, движение, время; param — what its u is (ход,
//     опасность, в зоне, скорость, время). make → {start(), set(u, speed), stop()}: u 0…1; speed 0…1 — how fast the
//     finger goes (движение: its u is the speed); for время speed 0 — time stands (no pulse). stop() — налив: cut off
//     if it came to the end (u ≈ 1), else it sinks.
//   LANGUAGE — the language's: {sounds: {event: {as, ids, k}}, tones: {process: {as, id, k}}}
//   load(ctx) — every recorded one decoded beforehand (a promise)
import { RECORDED } from './recorded.js';

// ── recorded (recorded.js, CC0): decoded and mixed once per context ──
const LEVEL = 0.07;      // the loud part's RMS
const CEILING = 0.6;     // no peak above it
const QUIET = 0.004;     // (of the peak) below it — silence before, the tail's end after
const LEAD = 0.003, FADE_IN = 0.002, FADE_OUT = 0.04; // s: kept before the onset; the fades at the edges

const decoded = new WeakMap(); // ctx → Map(file → promise of {buffer, gain, from, to})

function prepare(ctx, file) {
  let all = decoded.get(ctx);
  if (!all) decoded.set(ctx, all = new Map());
  if (!all.has(file)) {
    all.set(file, Promise.resolve(Uint8Array.from(atob(RECORDED[file]), c => c.charCodeAt(0)).buffer)
      .then(b => ctx.decodeAudioData(b))
      .then(b => mix(ctx, b))
      .catch(e => { all.delete(file); throw e; }));
  }
  return all.get(file);
}

// mono; where it starts and ends; how much louder or quieter it is played
function mix(ctx, b) {
  const n = b.length, rate = b.sampleRate, mono = ctx.createBuffer(1, n, rate), m = mono.getChannelData(0);
  for (let c = 0; c < b.numberOfChannels; c++) {
    const d = b.getChannelData(c);
    for (let i = 0; i < n; i++) m[i] += d[i] / b.numberOfChannels;
  }
  let peak = 0;
  for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(m[i]));
  if (!peak) return { buffer: mono, gain: 0, from: 0, to: n / rate };
  const floor = peak * QUIET;
  let first = 0, last = n - 1;
  while (first < n && Math.abs(m[first]) < floor) first++;
  while (last > first && Math.abs(m[last]) < floor) last--;
  // the loud part: the first 0.25 s from the onset (a long tail must not make it seem quiet)
  const end = Math.min(last, first + Math.round(rate * 0.25));
  let sum = 0;
  for (let i = first; i <= end; i++) sum += m[i] * m[i];
  const rms = Math.sqrt(sum / Math.max(1, end - first + 1));
  const gain = Math.min(LEVEL / rms, CEILING / peak);
  return { buffer: mono, gain, from: Math.max(0, first / rate - LEAD), to: Math.min(n / rate, last / rate + 0.01) };
}

// one recorded sound from `at`: k — its loudness against the others; presence — dB added above 2.8 kHz (clearer)
function recorded(ctx, out, at, file, { k = 1, presence = 0 } = {}) {
  return prepare(ctx, file).then(({ buffer, gain, from, to }) => {
    const t = Math.max(at, ctx.currentTime), len = to - from, g = gain * k;
    const s = ctx.createBufferSource(), e = ctx.createGain();
    s.buffer = buffer;
    e.gain.setValueAtTime(0, t);
    e.gain.linearRampToValueAtTime(g, t + FADE_IN);
    e.gain.setValueAtTime(g, t + Math.max(FADE_IN, len - FADE_OUT));
    e.gain.linearRampToValueAtTime(0, t + len);
    if (presence) { const f = ctx.createBiquadFilter(); f.type = 'highshelf'; f.frequency.value = 2800; f.gain.value = presence; s.connect(f).connect(e); }
    else s.connect(e);
    e.connect(out);
    s.start(t, from, len);
  });
}

// ── made here: the means ──
// pink noise (softer than white), two seconds of it per context — only air at an attack
const pinks = new WeakMap();
function pink(ctx) {
  let b = pinks.get(ctx);
  if (b) return b;
  const n = ctx.sampleRate * 2, c = (b = ctx.createBuffer(1, n, ctx.sampleRate)).getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < n; i++) { // (P. Kellet's filter)
    const w = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.969 * b2 + w * 0.153852;
    b3 = 0.8665 * b3 + w * 0.3104856; b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898;
    c[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11; b6 = w * 0.115926;
  }
  pinks.set(ctx, b);
  return b;
}
// an envelope: up in a, then away (exponentially) over d
function envelope(ctx, at, a, d, g) {
  const e = ctx.createGain();
  e.gain.setValueAtTime(0, at);
  e.gain.linearRampToValueAtTime(g, at + a);
  e.gain.setTargetAtTime(0, at + a, d / 4);
  return e;
}
// air: noise through a soft band, its centre may move (from → to) as it sounds
function air(ctx, out, at, { f = 1000, to = null, q = 0.7, type = 'bandpass', a = 0.01, d = 0.1, g = 0.1 } = {}) {
  const s = ctx.createBufferSource(), flt = ctx.createBiquadFilter(), e = envelope(ctx, at, a, d, g);
  s.buffer = pink(ctx);
  flt.type = type; flt.Q.value = q; flt.frequency.setValueAtTime(f, at);
  if (to) flt.frequency.exponentialRampToValueAtTime(to, at + a + d);
  s.connect(flt).connect(e).connect(out);
  s.start(at, Math.random() * 1.5); s.stop(at + a + d * 1.5 + 0.05);
}
// a body: a short low blow whose pitch falls
function body(ctx, out, at, { f = 140, to = 0.7, d = 0.08, g = 0.3 } = {}) {
  const o = ctx.createOscillator(), e = envelope(ctx, at, 0.003, d, g);
  o.frequency.setValueAtTime(f, at);
  o.frequency.exponentialRampToValueAtTime(f * to, at + d);
  o.connect(e).connect(out);
  o.start(at); o.stop(at + d * 1.5 + 0.05);
}
// a velvet click: a few milliseconds of dark noise and a little body under it
function velvet(ctx, out, at, { g = 0.2, bright = 1800, low = 170 } = {}) {
  air(ctx, out, at, { f: bright, type: 'lowpass', q: 0.6, a: 0.0015, d: 0.012, g: g * 1.4 });
  body(ctx, out, at, { f: low, to: 0.8, d: 0.03, g: g * 0.8 });
}
// a bloom: noise in a band that opens (Q from narrow to wide) over a soft body
function bloom(ctx, out, at, { f = 900, q = 5, g = 0.2, low = 150, lowG = 0.2 } = {}) {
  const s = ctx.createBufferSource(), flt = ctx.createBiquadFilter(), e = envelope(ctx, at, 0.08, 0.6, g);
  s.buffer = pink(ctx); flt.type = 'bandpass'; flt.frequency.value = f;
  flt.Q.setValueAtTime(q, at); flt.Q.exponentialRampToValueAtTime(0.35, at + 0.4);
  s.connect(flt).connect(e).connect(out); s.start(at, Math.random()); s.stop(at + 1);
  body(ctx, out, at, { f: low, to: 0.8, d: 0.1, g: lowG });
}

// ── «Понравилось»: the owner's picks of the noisier first boards (recorded clicks and a few made here) ──
const LIKED = [
  ['касание', 'tap-click', 'мягкий клик', { file: 'tap-click' }],
  ['касание', 'tap-round', 'круглый щелчок', { file: 'tap-round' }],
  ['сбой', 'fault-thump', 'глухой толчок', { file: 'fault-thump' }],
  ['завершение', 'end-bloom', 'раскрылось', { make: (c, o, t) => bloom(c, o, t) }],
  ['проигрыш', 'loss-low', 'низкий глухой', { file: 'loss-low' }],
  ['проигрыш', 'loss-sink', 'сникает', { make: (c, o, t) => { air(c, o, t, { f: 900, to: 120, type: 'lowpass', q: 0.5, a: 0.03, d: 0.9, g: 0.2 }); body(c, o, t, { f: 90, to: 0.6, d: 0.3, g: 0.32 }); } }],
];

// ── tonal: the families ──
const D2 = 73.42, A2 = 110, D3 = 146.83, F3 = 174.61, Ab3 = 207.65, A3 = 220, B3 = 246.94;
// how wide the voices may go apart (cents, the widest of them): apart is «not right», never sour
const WIDEST = 12;
const cents = c => 2 ** (c / 1200);
const harmonics = (n, f) => Array.from({ length: n }, (_, i) => f(i + 1));
// A family's timbre: harm — a periodic wave's harmonics, or partials — [ratio, amount, how long it rings (×)] (struck,
// not harmonic); unison — its voices' detune (cents; the width, scaled by a layer); a, r — attack, release (s); ring —
// a struck one's ring (×len); fm — an electric piano's bark at the attack; bright — the low-pass (Hz), q its
// resonance; formants — [Hz, Q, dB] peaks (a cello's body, a choir's «у»); vibrato — [Hz, cents]; trem — a tremolo
// (Hz); air — breath at the attack {at: × the tone, g, d}; level — its loudness against the others
const TIMBRES = {
  organ: { harm: [1, 0.55, 0.14, 0.32, 0.04, 0.1, 0.02, 0.07], unison: [-2.5, 2.5], a: 0.03, r: 0.16, bright: 2400, q: 0.5, air: { at: 4, g: 0.05, d: 0.03 }, level: 1 },
  reed: { harm: harmonics(24, n => (n % 2 ? 1 : 0.7) / n ** 0.8), unison: [-3, 0, 3.5], a: 0.06, r: 0.2, bright: 1300, q: 1, air: { at: 8, g: 0.03, d: 0.08 }, level: 0.8 },
  ep: { partials: [[1, 1, 1], [2, 0.3, 0.45], [3, 0.08, 0.3], [6.9, 0.05, 0.08]], fm: 1.4, unison: [-2, 2], a: 0.004, r: 0.25, ring: 1.4, bright: 2200, q: 0.5, trem: 4.2, level: 1.1 },
  bowl: { partials: [[1, 1, 1], [2.71, 0.5, 0.6], [5.12, 0.2, 0.35], [8.4, 0.07, 0.2]], unison: [-5, 5], a: 0.008, r: 0.5, ring: 2.6, bright: 3200, q: 0.4, level: 1 },
  cello: { harm: harmonics(32, n => 1 / n), unison: [-4, 4], a: 0.09, r: 0.25, bright: 1500, q: 0.6, formants: [[420, 2, 5], [1150, 3, 3]], vibrato: [5.3, 7], air: { at: 14, g: 0.025, d: 0.09 }, level: 0.7 },
  choir: { harm: harmonics(32, n => 1 / n), unison: [-10, -4, 0, 5, 11], a: 0.14, r: 0.35, bright: 1500, q: 0.4, formants: [[330, 5, 9], [720, 5, 5], [2500, 6, 2]], vibrato: [4.7, 9], air: { at: 6, g: 0.02, d: 0.15 }, level: 0.6 },
};

const waves = new WeakMap(); // ctx → Map(timbre → PeriodicWave)
function periodic(ctx, T) {
  let m = waves.get(ctx);
  if (!m) waves.set(ctx, m = new Map());
  if (!m.has(T)) { const imag = new Float32Array([0, ...T.harm]); m.set(T, ctx.createPeriodicWave(new Float32Array(imag.length), imag)); }
  return m.get(T);
}

// the way out of a tone: its formants → the low-pass → its envelope (amp) → a tremolo → its level → out
function chain(ctx, T, out) {
  const input = ctx.createGain(), lfos = [];
  let node = input;
  for (const [f, q, g] of T.formants || []) {
    const p = ctx.createBiquadFilter();
    p.type = 'peaking'; p.frequency.value = f; p.Q.value = q; p.gain.value = g;
    node.connect(p); node = p;
  }
  const filter = ctx.createBiquadFilter(), amp = ctx.createGain(), level = ctx.createGain();
  filter.type = 'lowpass'; filter.Q.value = T.q; filter.frequency.value = T.bright;
  amp.gain.value = 0; level.gain.value = T.level;
  node.connect(filter).connect(amp);
  if (T.trem) {
    const t = ctx.createGain(), l = ctx.createOscillator(), d = ctx.createGain();
    t.gain.value = 0.82; l.frequency.value = T.trem; d.gain.value = 0.18;
    l.connect(d).connect(t.gain); amp.connect(t).connect(level); lfos.push(l);
  } else amp.connect(level);
  level.connect(out);
  return { input, filter, amp, start: at => lfos.forEach(l => l.start(at)), stop: at => lfos.forEach(l => l.stop(at)) };
}

// the voices of one tone f into dest: each {osc, gain, ratio, base (cents), amount, decay}; width(k) scales their
// spread, offset(c) moves them all (a fifth gone sour), freq(f) — another tone, bend(c, over) — the pitch sinks
function voices(ctx, T, f, dest) {
  const list = [], n = T.unison.length, lfos = [];
  const add = (type, ratio, amount, decay, base) => {
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    if (type) osc.setPeriodicWave(type); else osc.type = 'sine';
    osc.frequency.value = f * ratio; osc.detune.value = base; gain.gain.value = amount / n;
    osc.connect(gain).connect(dest);
    list.push({ osc, gain, ratio, base, amount: amount / n, decay });
  };
  if (T.harm) for (const c of T.unison) add(periodic(ctx, T), 1, 1, 1, c);
  else for (const [ratio, amount, decay] of T.partials) for (const c of T.unison) add(null, ratio, amount, decay, c);
  if (T.vibrato) {
    const l = ctx.createOscillator(), d = ctx.createGain();
    l.frequency.value = T.vibrato[0] * (0.9 + Math.random() * 0.2); d.gain.value = T.vibrato[1];
    l.connect(d); list.forEach(v => d.connect(v.osc.detune)); lfos.push(l);
  }
  let k = 1, off = 0, tone = f;
  const detune = (tc = 0.06) => list.forEach(v => v.osc.detune.setTargetAtTime(v.base * k + off, ctx.currentTime, tc));
  return {
    list,
    start: at => { list.forEach(v => v.osc.start(at)); lfos.forEach(l => l.start(at)); },
    stop: at => { list.forEach(v => v.osc.stop(at)); lfos.forEach(l => l.stop(at)); },
    width(x, tc) { k = Math.min(x, WIDEST / Math.max(...T.unison.map(Math.abs))); detune(tc); },
    offset(c, tc) { off = c; detune(tc); },
    freq(x, tc = 0.06) { tone = x; list.forEach(v => v.osc.frequency.setTargetAtTime(tone * v.ratio, ctx.currentTime, tc)); },
    bend(c, over, at = ctx.currentTime) { list.forEach(v => { v.osc.frequency.setValueAtTime(tone * v.ratio, at); v.osc.frequency.exponentialRampToValueAtTime(tone * v.ratio * cents(c), at + over); }); },
  };
}

// one tone, once: len — how long it is held (a struck one: how long it rings, × its ring); g — how loud; bright — its
// filter (× the family's), darkening as it sounds (rise: opening instead, over len); bend — cents it sinks by over
// len; swell — × its attack; width — × its voices' spread (pure — small, apart — large: «right» and «not right»)
function note(ctx, out, at, f, T, { len = 0.3, g = 0.3, bright = 1, bend = 0, swell = 1, width = 1, rise = false } = {}) {
  const c = chain(ctx, T, out), v = voices(ctx, T, f, c.input), a = T.a * swell, cut = T.bright * bright;
  const struck = !!T.partials, end = struck ? at + a + len * T.ring * 1.6 : at + a + len + T.r * 2.5;
  v.width(width, 0.001);
  if (rise) {
    c.filter.frequency.setValueAtTime(cut * 0.3, at);
    c.filter.frequency.exponentialRampToValueAtTime(cut, at + a + len);
  } else {
    c.filter.frequency.setValueAtTime(cut * 0.5, at);
    c.filter.frequency.linearRampToValueAtTime(cut, at + a + 0.01);
    c.filter.frequency.setTargetAtTime(cut * 0.45, at + a + 0.01, (struck ? len * T.ring : len) / 2);
  }
  c.amp.gain.setValueAtTime(0, at);
  c.amp.gain.linearRampToValueAtTime(g, at + a);
  if (struck) {
    v.list.forEach(x => { x.gain.gain.setValueAtTime(x.amount, at); x.gain.gain.setTargetAtTime(0, at + a, len * T.ring * x.decay / 3); });
    if (T.fm) { // (the bark: the fundamental shaken by a sine as high as it, for a moment)
      const m = ctx.createOscillator(), mg = ctx.createGain();
      m.frequency.value = f; mg.gain.setValueAtTime(f * T.fm, at); mg.gain.setTargetAtTime(0, at, 0.04);
      m.connect(mg); v.list.filter(x => x.ratio === 1).forEach(x => mg.connect(x.osc.frequency));
      m.start(at); m.stop(end);
    }
    c.amp.gain.setTargetAtTime(0, end - 0.12, 0.03); // (no click where it is cut)
  } else c.amp.gain.setTargetAtTime(0, at + a + len, T.r / 3);
  if (bend) v.bend(bend, len, at);
  if (T.air) air(ctx, out, at, { f: Math.min(5000, f * T.air.at), q: 1.5, a: 0.004, d: T.air.d, g: T.air.g * g / 0.3 });
  c.start(at); v.start(at); v.stop(end); c.stop(end);
}

// the short sounds of a family ([key, role, name, play]): the same grammar in every one. What is right is in tune —
// pure, the voices together: a single tone, an open fifth, a fifth and an octave, a fifth opening; what is not right
// is apart — the voices spread, a tone beside itself: muted and a little apart (мимо, сбой), low and sinking
const GRAMMAR = [
  ['enter', 'вход', 'квинта раскрывается', (c, o, t, T) => { note(c, o, t, D2, T, { len: 0.3, g: 0.2, swell: 3, bright: 0.8, width: 0.3, rise: true }); note(c, o, t, A2, T, { len: 0.3, g: 0.16, swell: 3, bright: 0.8, width: 0.3, rise: true }); }],
  ['tap', 'касание', 'тон', (c, o, t, T) => note(c, o, t, D3, T, { len: 0.16, g: 0.32, swell: 0.5, width: 0.3 })],
  ['snap', 'шаг сделан', 'открытая квинта', (c, o, t, T) => { note(c, o, t, D3, T, { len: 0.3, g: 0.26, width: 0.3 }); note(c, o, t, A3, T, { len: 0.3, g: 0.2, width: 0.3 }); }],
  ['miss', 'мимо / сбой', 'приглушённый, чуть врозь', (c, o, t, T) => { note(c, o, t, A2, T, { len: 0.2, g: 0.26, bright: 0.45, width: 2 }); note(c, o, t, A2 * cents(35), T, { len: 0.2, g: 0.2, bright: 0.45, width: 2 }); }],
  ['end', 'завершение', 'квинта и октава', (c, o, t, T) => { note(c, o, t, D2, T, { len: 0.9, g: 0.24, swell: 2, bright: 0.9, width: 0.3 }); note(c, o, t, A2, T, { len: 0.9, g: 0.2, swell: 2, bright: 0.9, width: 0.3 }); note(c, o, t, D3, T, { len: 0.9, g: 0.16, swell: 2, bright: 0.9, width: 0.3 }); }],
  ['loss', 'проигрыш', 'низкий, никнет', (c, o, t, T) => { note(c, o, t, D2, T, { len: 1, g: 0.32, bright: 0.5, bend: -80, swell: 1.5, width: 2 }); note(c, o, t, D2 * cents(-14), T, { len: 1, g: 0.2, bright: 0.4, bend: -80, swell: 1.5, width: 2 }); }],
];

// ── the layers: the means ──
const clamp = x => Math.max(0, Math.min(1, x || 0));
const smoothstep = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const smooth = (p, v, ctx, tc = 0.06) => p.setTargetAtTime(v, ctx.currentTime, tc);
// a drone: tones (each its voices and its own gain) through one chain; silent until set
function drone(ctx, out, T, tones) {
  const c = chain(ctx, T, out);
  const parts = tones.map(f => { const g = ctx.createGain(); g.gain.value = 0; g.connect(c.input); return { g, v: voices(ctx, T, f, g) }; });
  let wob = null;
  return {
    c, parts,
    start() { const t = ctx.currentTime; c.start(t); parts.forEach(p => p.v.start(t)); wob?.start(t); },
    stop(tc = 0.08) { const t = ctx.currentTime; smooth(c.amp.gain, 0, ctx, tc); const end = t + tc * 8; parts.forEach(p => p.v.stop(end)); c.stop(end); wob?.stop(end); },
    amp: (g, tc) => smooth(c.amp.gain, g, ctx, tc),
    cut: (f, tc) => smooth(c.filter.frequency, f, ctx, tc),
    level: (i, g, tc) => smooth(parts[i].g.gain, g, ctx, tc),
    width: (k, tc) => parts.forEach(p => p.v.width(k, tc)),
    // a slow unsteady wobble of the loudness (two sines), its depth set
    wobble() {
      const depth = ctx.createGain(), oscs = [2.3, 3.7].map(r => { const o = ctx.createOscillator(); o.frequency.value = r; o.connect(depth); return o; });
      depth.gain.value = 0; depth.connect(c.amp.gain);
      wob = { start: at => oscs.forEach(o => o.start(at)), stop: at => oscs.forEach(o => o.stop(at)) };
      return depth;
    },
  };
}
// events in time: gap() — seconds to the next (Infinity: none for now); fire(at) — one. A short look ahead.
function stream(ctx, gap, fire) {
  let next = ctx.currentTime + 0.02, on = true;
  const tick = () => {
    if (!on) return;
    const now = ctx.currentTime, until = now + 0.1, g0 = gap();
    if (Number.isFinite(g0) && next > now + g0) next = now + g0; // (it quickened: not after the old, long gap)
    while (next < until) {
      const g = gap();
      if (!Number.isFinite(g)) { next = until; break; }
      if (next >= now) fire(next);
      next += g;
    }
  };
  const id = setInterval(tick, 25);
  tick();
  return () => { on = false; clearInterval(id); };
}

// the processes, the same in every family that has them: [role, param, name, make(ctx, out, T)]
const PROCESSES = {
  // a hum that fills: overtones come in (the fifth, the octave, the fifth above), the filter opens, and the voices,
  // apart at first, draw together — pure at the end; let go before it — they go apart and it sinks
  fill: ['налив', 'ход', 'гул копится', (ctx, out, T) => {
    const d = drone(ctx, out, T, [D2, A2, D3, A3]);
    let u = 0;
    return {
      start: () => d.start(),
      set(x) {
        u = clamp(x);
        d.amp(0.1 + 0.2 * u); d.cut(220 + T.bright * 1.1 * u); d.width(0.1 + 1.8 * (1 - smoothstep(0, 1, u)));
        d.level(0, 1); d.level(1, 0.7 * u); d.level(2, 0.5 * u * u); d.level(3, 0.35 * u ** 3);
      },
      stop() {
        if (u >= 0.98) { d.stop(0.04); return; }
        d.width(3, 0.05); d.parts.forEach(p => p.v.bend(-45, 0.4)); d.cut(120, 0.12); d.stop(0.15);
      },
    };
  }],
  // two close low tones: the beat between them quickens, the voices spread, the filter opens, and above them a
  // diminished seventh comes in (F, A flat, B over D — symmetric: alarm in any key)
  tension: ['напряжение', 'опасность', 'биение', (ctx, out, T) => {
    const d = drone(ctx, out, T, [D2, D2, F3, Ab3, B3]);
    return {
      start: () => d.start(),
      set(x) {
        const u = clamp(x);
        d.parts[1].v.freq(D2 + 0.6 + 6 * u); d.level(0, 0.6); d.level(1, 0.6);
        [2, 3, 4].forEach(i => d.level(i, 0.2 * u * u));
        d.width(0.5 + 2.5 * u); d.cut(250 + T.bright * u); d.amp(0.08 + 0.25 * u);
      },
      stop: () => d.stop(0.1),
    };
  }],
  // an even fifth and octave, pure; out of the zone it dulls, wavers, its voices go apart and the fifth a little off
  zone: ['в зоне', 'в зоне', 'ровная квинта', (ctx, out, T) => {
    const d = drone(ctx, out, T, [D2, A2, D3]), wob = d.wobble();
    return {
      start: () => d.start(),
      set(x) {
        const u = clamp(x);
        d.level(0, 0.6); d.level(1, 0.5 * (0.4 + 0.6 * u)); d.level(2, 0.4 * u);
        d.parts[1].v.offset(30 * (1 - u), 0.1);
        d.width(0.15 + 2 * (1 - u), 0.1); d.cut(300 + T.bright * u, 0.1); d.amp(0.25, 0.1); smooth(wob.gain, 0.12 * (1 - u), ctx, 0.1);
      },
      stop: () => d.stop(0.1),
    };
  }],
  // a tone that goes with the hand: louder and brighter the faster; still — silent
  motion: ['движение', 'скорость', 'тон за рукой', (ctx, out, T) => {
    const d = drone(ctx, out, T, [A2, D3]);
    return {
      start: () => d.start(),
      set(x, speed = x) {
        const s = clamp(speed);
        d.level(0, 1); d.level(1, 0.4 * s); d.amp(0.35 * s ** 0.8, 0.05); d.cut(220 + T.bright * 1.4 * s, 0.05); d.width(0.4 + 0.6 * s, 0.05);
      },
      stop: () => d.stop(0.08),
    };
  }],
  // a low slow pulse, quickening to the limit (from 1.1 s to 0.35 s), brighter; none while time stands (speed 0)
  time: ['время', 'время', 'низкий пульс', (ctx, out, T) => {
    let u = 0, going = true, stop = null;
    return {
      start() { stop = stream(ctx, () => (going ? 1.1 - 0.75 * u : Infinity), at => note(ctx, out, at, D2, T, { len: 0.22, g: 0.24 + 0.14 * u, bright: 0.6 + 0.5 * u, swell: 0.6 })); },
      set(x, speed = 1) { u = clamp(x); going = speed > 0; },
      stop() { stop?.(); },
    };
  }],
};

// [group, timbre, its short sounds, its processes] — what the owner picked on the board (П48) and what the language
// took from the same families where nothing was picked
const FAMILIES = [
  ['Орган', 'organ', ['enter', 'tap', 'snap', 'miss', 'end', 'loss'], ['tension', 'zone']],
  ['Фисгармония', 'reed', ['tap', 'miss', 'end', 'loss'], ['motion', 'tension']],
  ['Электропиано', 'ep', ['tap', 'end'], ['fill', 'time']],
  ['Чаша', 'bowl', ['end', 'loss'], ['zone']],
  ['Виолончель', 'cello', ['tap', 'miss', 'loss'], ['fill']],
  ['Хор «у»', 'choir', ['miss'], ['fill', 'zone']],
];

// The language's sounds (feel.js): for each of its events the library's sound (several — taken in turn) and how loud
// against the others (k); for each of its processes a layer
export const LANGUAGE = {
  sounds: {
    enter: { as: 'вход', ids: ['organ-enter'], k: 0.6 },
    tap: { as: 'касание', ids: ['tap-click', 'tap-round'], k: 1 },
    snap: { as: 'шаг сделан', ids: ['organ-snap'], k: 0.6 },
    miss: { as: 'мимо', ids: ['organ-miss'], k: 0.6 },
    slip: { as: 'срыв, рано отпустил, опасность', ids: ['reed-miss'], k: 0.6 },
    fault: { as: 'сбой', ids: ['fault-thump'], k: 1 },
    quarter: { as: 'трещотка (четверть оборота)', ids: ['tap-round'], k: 0.5 },
    beat: { as: 'доля', ids: ['ep-tap'], k: 0.6 },
    tick: { as: 'тик отсчёта', ids: ['tap-click'], k: 0.6 },
    found: { as: 'нашёл', ids: ['reed-tap'], k: 0.45 },
    'end:full': { as: 'завершение', ids: ['organ-end'], k: 0.6 },
    'end:short': { as: 'завершение с ошибками', ids: ['ep-end'], k: 0.6 },
    'end:neutral': { as: 'выбор', ids: ['bowl-end'], k: 0.55 },
    'end:loss': { as: 'проигрыш', ids: ['organ-loss'], k: 0.6 },
  },
  tones: {
    fill: { as: 'налив', id: 'choir-fill', k: 0.6 },
    scrape: { as: 'движение', id: 'reed-motion', k: 0.6 },
    warm: { as: 'поиск (ближе)', id: 'bowl-zone', k: 0.6 },
    zone: { as: 'в зоне', id: 'organ-zone', k: 0.6 },
    tension: { as: 'напряжение', id: 'organ-tension', k: 0.6 },
    time: { as: 'время', id: 'ep-time', k: 0.6 },
  },
};
const usedAs = id => [...Object.values(LANGUAGE.sounds).filter(x => x.ids.includes(id)), ...Object.values(LANGUAGE.tones).filter(x => x.id === id)].map(x => x.as);

export const SOUNDS = [
  ...LIKED.map(([role, id, name, how]) => ({
    id, name, group: 'Понравилось', role,
    play: how.file ? (ctx, out, at) => recorded(ctx, out, at, how.file, how)
      : (ctx, out, at) => Promise.resolve(how.make(ctx, out, Math.max(at, ctx.currentTime))),
  })),
  ...FAMILIES.flatMap(([group, timbre, keys]) => GRAMMAR.filter(([key]) => keys.includes(key)).map(([key, role, name, make]) => ({
    id: `${timbre}-${key}`, name, group, role,
    play: (ctx, out, at) => Promise.resolve(make(ctx, out, Math.max(at, ctx.currentTime), TIMBRES[timbre])),
  }))),
].map(s => ({ ...s, language: usedAs(s.id) }));

export const LAYERS = FAMILIES.flatMap(([group, timbre, , kinds]) => kinds.map(kind => {
  const [role, param, name, make] = PROCESSES[kind];
  return { id: `${timbre}-${kind}`, name, group, role, param, language: usedAs(`${timbre}-${kind}`), make: (ctx, out) => make(ctx, out, TIMBRES[timbre]) };
}));

export const load = ctx => Promise.allSettled([...new Set(LIKED.filter(([, , , h]) => h.file).map(([, , , h]) => h.file))].map(f => prepare(ctx, f)));
