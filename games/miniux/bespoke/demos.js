// The playground's demonstrations (docs/miniux/playground.md): each gesture of the language of mini-games and its
// variants, each part of its frame, and some mini-games of the three games put into it — each on the playground's
// things («Мастерская»: the key `demo` sets what is on the table; «Палуба»: the deck, its close-up, the ship under way).
// A demonstration: {id, group, title, scene, demo (the workshop's `demo`), state (more of the scene's values), memo
// (what is meant, what to check, what must work — 3–6 lines), run(d)} — run plays it once; d (game.js): d.mg(opts) —
// a mini-game (bespoke.minigame.start, taken away if the player goes to another demonstration), d.set(key, value,
// seconds), d.bump(key) — a counter of the scene +1, d.wait(seconds), d.choose(ref, actions, opts), d.result(r) — the
// outcome shown, d.note(text) — a line shown, d.b — bespoke.
// Each step says its task (the plate's phrase) and, where its point is on the thing itself, the thing to glow (glow:
// the element's id — §2.12: not where the point is one of many on a bigger thing).
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

export const DEMOS = [
  // ── gestures ──
  {
    id: 'press', group: 'Жесты', title: 'Нажать', scene: WORKSHOP, demo: 'bell',
    memo: ['Колокольчик светится сам (мягкий пульс) — он твой; на нём кольцо. Нажми — срабатывает сразу, на касании.',
      'Проверить: вверху плашка «Колокольчик давно молчит»; от касания кольцо сжимается, вокруг пальца — светлое кольцо, мягкий стук дерева.',
      'Нажми мимо — рябь у пальца, кольцо дёргается к нему, глухой звук; на полосе плашки тихо появляется щербинка.',
      'Первая встреча с жестом за партию (когда палец показывает его впервые) — мягкая проба: ошибка видна, но не считается, щербинки нет. Повторный прогон считает; ⚙ «забыть показ» — снова первая встреча.'],
    async run(d) { const mg = await d.mg({ task: 'Колокольчик давно молчит' }); if ((await mg.press('bell#top', { glow: 'bell' })).state === 'done') bell(d); d.result(await mg.end()); },
  },
  {
    id: 'petals', group: 'Жесты', title: 'Нажать с лепестками', scene: WORKSHOP, demo: 'box',
    memo: ['У ящика три ящичка: нажми кольцо — вокруг раскроются три лепестка со словами.',
      'Выбор — на отпускании над лепестком (или тап по нему); касание мимо лепестков их закрывает.',
      'Проверить: выбор — полоса без огонька, конец — ровный мягкий аккорд.',
      'Клавиши: пробел раскрывает, ←→ выбирают, Enter — выбрать.'],
    async run(d) {
      const mg = await d.mg({ task: 'В одном из ящичков — то, что нужно' });
      const s = await mg.press('box#front', { glow: 'box', actions: [{ id: 'top', label: 'Верхний' }, { id: 'middle', label: 'Средний' }, { id: 'bottom', label: 'Нижний' }] });
      if (s.choice) { d.set('drawer', s.choice); d.set('drawer_open', 1, 0.6); }
      d.result(await mg.end());
    },
  },
  {
    id: 'repeat', group: 'Жесты', title: 'Нажать с повтором и ответом', scene: WORKSHOP, demo: 'door',
    memo: ['Постучи в дверцу три раза — каждое касание свой стук, дверца вздрагивает, на полосе — засечка за стук. Потом ход сцены: стучат в ответ.',
      'Рядом бледное кольцо «уйти» — второй путь, видно сразу; палец показывает оба.',
      'Проверить: во время ответа меток и свечения нет, огонёк на плашке медленно дышит.',
      'Выбрал «уйти» — развилка, конец нейтральный.'],
    async run(d) {
      const mg = await d.mg({ task: 'За дверцей кто-то есть. Можно и не стучать' });
      const s = await mg.press('door#knock', { repeat: 3, quiet: { ref: 'door#away', id: 'away' }, onTouch: () => d.bump('door_knocks') });
      if (s.state === 'done') await mg.sceneTurn((async () => { for (let i = 0; i < 2; i++) { await d.wait(0.7); d.bump('door_reply'); } await d.wait(0.8); d.set('door_open', 1, 1); await d.wait(1); })());
      d.result(await mg.end());
    },
  },
  {
    id: 'hold', group: 'Жесты', title: 'Держать', scene: WORKSHOP, demo: 'bellows',
    memo: ['Кольцо с желобом на ручке меха — нажми и держи, пока желоб не нальётся (1.5 с). Мех раздувается.',
      'Проверить: держишь — мех светится ровно; налив виден из-под пальца, слышно дыхание; полно — защёлка, дальше держать не надо.',
      'Отпусти раньше — налив стекает назад, мех пульсирует снова (первая встреча за партию — без счёта ошибки).'],
    async run(d) { const mg = await d.mg({ task: 'Меху нечем дышать' }); await mg.hold('bellows#handle', { glow: 'bellows', seconds: 1.5, progress: u => d.set('bellows', u) }); d.result(await mg.end()); },
  },
  {
    id: 'hold-anywhere', group: 'Жесты', title: 'Держать где угодно', scene: WORKSHOP, demo: 'bellows',
    memo: ['Метки на вещи нет: держи где угодно на экране (кроме углов с кнопками) — мех раздувается, пока держишь.',
      'Под пальцем — только точка: касание принято. Ход — в самом мехе (раздувается) и на плашке.',
      'Проверить: держишь — мех светится ровно, отпустил — пульсирует; палец показывает у середины окна.'],
    async run(d) { const mg = await d.mg({ task: 'Мех отзывается, где ни коснись' }); await mg.hold(null, { at: 'bellows', seconds: 2, progress: u => d.set('bellows', u) }); d.result(await mg.end()); },
  },
  {
    id: 'hold-danger', group: 'Жесты', title: 'Держать с опасностью', scene: WORKSHOP, demo: 'lantern',
    memo: ['Держи на фонаре — он разгорается. Дуга по краю метки краснеет, когда дует ветер; дойдёт до конца под пальцем — фонарь гаснет до нуля.',
      'Отпусти — ветер стихает, дуга спадает.',
      'Проверить: видно, как близко опасность; без звука понятно; держать дольше полного не нужно.'],
    async run(d) {
      const mg = await d.mg({ task: 'Огню мешает ветер' });
      await mg.hold('lantern#flame', { glow: 'lantern', seconds: 4, danger: s => { d.set('wind', gust(s.t)); return windy(0.9)(s); }, progress: u => d.set('lantern', u) });
      d.set('wind', 0, 0.5);
      d.result(await mg.end());
    },
  },
  {
    id: 'hold-still', group: 'Жесты', title: 'Замереть', scene: WORKSHOP, demo: 'candle',
    memo: ['Держи на свече 3 с и не двигай пальцем: опасность растёт от движения (дрожь до 24 px не в счёт).',
      'Проверить: дуга на краю метки растёт, когда ведёшь пальцем, и спадает, когда замер; пламя мечется вместе с ней.',
      'Дошла до конца — метка сжимается рывком, налив падает.'],
    async run(d) {
      const mg = await d.mg({ task: 'Пламя вздрагивает от малейшего движения' });
      await mg.hold('candle#flame', { glow: 'candle', variant: 'still', seconds: 3, progress: (u, i) => { d.set('candle', u); d.set('candle_shake', i?.level ?? 0); } });
      d.result(await mg.end());
    },
  },
  {
    id: 'hold-quench', group: 'Жесты', title: 'Гасить', scene: WORKSHOP, demo: 'wicks',
    memo: ['Три фитиля сами начинают чадить — дуга опасности растёт на каждой метке. Держи тот, что чадит, — он успокаивается.',
      'На время (12 с): полоса идёт временем; огонёк краснеет, когда какой-то фитиль близок к беде.',
      'Проверить: видно, какой фитиль ближе к беде; один палец — одна метка.'],
    async run(d) {
      const mg = await d.mg({ task: 'Фитили чадят' });
      await mg.hold(null, { variant: 'quench', refs: ['wicks#w1', 'wicks#w2', 'wicks#w3'], seconds: 12, progress: (u, i) => i?.levels.forEach((l, k) => d.set(`wick${k + 1}`, l)) });
      d.result(await mg.end());
    },
  },
  {
    id: 'hold-catch', group: 'Жесты', title: 'Перехват', scene: WORKSHOP, demo: 'brackets',
    memo: ['Две скобы слева и справа, по очереди: держи короткий налив (0.3 с) — защёлка — метка переходит на другую сторону.',
      'Шесть перехватов — шесть засечек на полосе. Груз поднимается.',
      'Проверить: видна всегда одна метка; отпустить рано — «срыв».'],
    async run(d) {
      const mg = await d.mg({ task: 'До верха далеко' });
      await mg.hold(null, { variant: 'catch', refs: ['brackets#left', 'brackets#right'], count: 6, progress: (u, i) => { d.set('climb', u, 0.3); d.set('grip', i?.side ? 'left' : 'right'); } });
      d.set('grip', 'none');
      d.result(await mg.end());
    },
  },
  {
    id: 'pull', group: 'Жесты', title: 'Тянуть', scene: WORKSHOP, demo: 'rope',
    memo: ['На грузе — кольцо с пунктиром. Нажми и тяни: груз идёт за пальцем с первого кадра; только теперь видны путь и цель у крюка.',
      'Сделано — когда отпустил груз в кольце цели (оно зеленеет, когда груз в нём). Само не доезжает и не прилипает.',
      'Отпустил на полпути — груз стоит, путь и цель гаснут; можно продолжить. Клавиши: → / ↑, отпустить у цели.'],
    async run(d) { const mg = await d.mg({ task: 'Груз не достаёт до крюка' }); await mg.pull('rope#weight', { to: 'rope#hook', progress: u => d.set('rope', u) }); d.result(await mg.end()); },
  },
  {
    id: 'pull-spring', group: 'Жесты', title: 'Тянуть с пружиной', scene: WORKSHOP, demo: 'shutter',
    memo: ['Подними заслонку до верха и отпусти там. Отпустишь раньше — она видимо возвращается вниз (около 0.7 с, откуда ни отпусти).',
      'Проверить: это не ошибка (нет звука срыва) — просто пружина; цель видна, только пока тянешь.'],
    async run(d) { const mg = await d.mg({ task: 'За заслонкой свет' }); await mg.pull('shutter#handle', { to: 'shutter#top', variant: 'spring', progress: u => d.set('shutter', u) }); d.result(await mg.end()); },
  },
  {
    id: 'pull-resist', group: 'Жесты', title: 'Тянуть с сопротивлением', scene: WORKSHOP, demo: 'crate',
    memo: ['Тяжёлый ящик: тяни вперёд — между ящиком и пальцем натягивается красная нить, толще и ярче с натяжением. Ящик идёт, пока палец заметно впереди него.',
      'Отпустил — ящик откатывается назад. Сделано — отпустить, когда ящик в кольце цели.',
      'Проверить: натяжение видно (толще и ярче нить); ящик не прыгает за пальцем.'],
    async run(d) { const mg = await d.mg({ task: 'Ящик тяжёлый и стоит не на месте' }); await mg.pull('crate#handle', { glow: 'crate', to: 'crate#goal', variant: 'resist', progress: u => d.set('crate', u) }); d.result(await mg.end()); },
  },
  {
    id: 'pull-tear', group: 'Жесты', title: 'Оторвать', scene: WORKSHOP, demo: 'knot',
    memo: ['Цели нет: потяни узел в любую сторону — немного (5% высоты окна), и он распадается.',
      'Проверить: узел слабеет, пока тянешь; отпустил раньше — всё как было, без ошибки.'],
    async run(d) { const mg = await d.mg({ task: 'Узел держится из последних сил' }); const s = await mg.pull('knot#knot', { glow: 'knot', variant: 'tear', progress: u => d.set('knot', u) }); if (s.state === 'done') d.set('knot_off', true); d.result(await mg.end()); },
  },
  {
    id: 'pull-where', group: 'Жесты', title: 'Тянуть куда', scene: WORKSHOP, demo: 'sockets',
    memo: ['Колышек — в одно из гнёзд. Взял — колышек в пальце (в сцене, не только метка), появляются гнёзда: пустые кольца — можно, бледное пунктирное — нельзя.',
      'Отпустил у «нельзя» — гнездо качает «нет» (ошибка «не туда»), колышек видимо едет обратно на место. В пустом месте — тоже едет обратно, без ошибки.',
      'Проверить: колышек не пропадает и не прыгает.'],
    async run(d) {
      const mg = await d.mg({ task: 'В доске пустое гнездо' });
      let rest = null; // (where the peg lay when it was taken: u, v between the sockets)
      const s = await mg.pull('sockets#peg', {
        variant: 'where', targets: [{ ref: sockets[0] }, { ref: sockets[1], ok: false }, { ref: sockets[2] }],
        progress: (u, i) => {
          if (!i) return;
          // taken: where it lay (to go back to); carried: under the finger; let go astray: it goes back, seen (П37), and
          // lies down there
          if (i.held) { rest ??= d.b.minigame.relative(i.at, 'sockets#s1', 'sockets#s3'); carried(d, 'peg', i.at); d.set('peg', 'held'); }
          else if (i.back && rest) { d.set('peg_u', rest.u, 0.4); d.set('peg_v', rest.v, 0.4); const was = rest; rest = null; d.wait(0.45).then(() => { if (!rest && was) d.set('peg', 'none'); }); }
        },
      });
      if (s.choice) d.set('peg', s.choice.split('#')[1]);
      d.result(await mg.end());
    },
  },
  {
    id: 'pull-catch', group: 'Жесты', title: 'Поймать', scene: WORKSHOP, demo: 'bubbles',
    memo: ['Пузыри плывут сами. Коснись пузыря — он в пальце (в сцене, под пальцем); появляются гнёзда — отнеси в любое свободное.',
      'Три пузыря — три засечки на полосе. Отпустил мимо — пузырь плывёт дальше оттуда.',
      'Проверить: метка едет за пузырём (камера стоит); поймать легко — круг касания шире метки.'],
    async run(d) {
      const mg = await d.mg({ task: 'Пузыри проплывают мимо гнёзд' });
      let held = null;
      await mg.pull(null, {
        variant: 'catch', things: ['bubbles#b1', 'bubbles#b2', 'bubbles#b3'], targets: sockets,
        progress: (u, i) => {
          if (!i) return;
          if (i.held) { held = `bubble${i.held.slice(-1)}`; carried(d, held, i.at); d.set(held, 'held'); }
          if (i.placed) { d.set(`bubble${i.placed[0].slice(-1)}`, i.placed[1].split('#')[1]); held = null; }
          else if (i.back) { d.set(`bubble${i.back.slice(-1)}`, 'free'); held = null; }
        },
      });
      d.result(await mg.end());
    },
  },
  {
    id: 'trace', group: 'Жесты', title: 'Вести по линии', scene: WORKSHOP, demo: 'crack',
    memo: ['Начни в кольце у начала трещины и веди вдоль пунктира — пройденное светлеет, клей заливает трещину.',
      'Можно отпустить и продолжить с того же места. Допуск щедрый (48 px).',
      'Ушёл далеко — след обрывается, место, куда вернуться, вспыхивает (ошибка «сошёл»).'],
    async run(d) { const mg = await d.mg({ task: 'Доску расколола трещина' }); await mg.trace(crack, { progress: u => d.set('crack', u) }); d.result(await mg.end()); },
  },
  {
    id: 'turn', group: 'Жесты', title: 'Крутить', scene: WORKSHOP, demo: 'screw',
    memo: ['Веди по кругу вокруг винта, куда показывает стрелка (по часовой). Полтора оборота. Радиус не важен.',
      'Проверить: мягкий деревянный щелчок на каждой четверти; винт поворачивается.',
      'Против стрелки — винт стоит, стрелка вспыхивает (ошибка «против»).'],
    async run(d) { const mg = await d.mg({ task: 'Крышка держится на честном слове' }); await mg.turn('screws#s1', { turns: 1.5, progress: u => d.set('screw1', u) }); d.result(await mg.end()); },
  },
  {
    id: 'turn-leave', group: 'Жесты', title: 'Крутить или оставить', scene: WORKSHOP, demo: 'screw',
    memo: ['То же, но рядом тихая бледная метка «оставить» — второй путь, виден сразу; палец показывает оба.',
      'Нажал «оставить» — развилка, конец нейтральный; повторов показа нет (бездействие может быть выбором).'],
    async run(d) { const mg = await d.mg({ task: 'Винт можно и не дотягивать' }); await mg.turn('screws#s1', { turns: 1.5, quiet: { ref: 'screws#leave', id: 'leave' }, progress: u => d.set('screw1', u) }); d.result(await mg.end()); },
  },
  {
    id: 'rub', group: 'Жесты', title: 'Тереть', scene: WORKSHOP, demo: 'plate',
    memo: ['Пятно над пыльной табличкой: води пальцем с нажатием, пока не покроешь его. Направление и скорость не важны.',
      'Проверить: пятно съёживается по мере покрытия, шорох громче при быстром движении; пыль сходит.',
      'Касание мимо пятна — рябь, пятно зовёт.'],
    async run(d) { const mg = await d.mg({ task: 'Под пылью что-то написано' }); await mg.rub('plate#dust', { glow: 'plate', progress: u => d.set('plate', u) }); d.result(await mg.end()); },
  },
  {
    id: 'seek', group: 'Жесты', title: 'Искать', scene: WORKSHOP, demo: 'floor',
    memo: ['Пятно над досками: веди с нажатием — под пальцем линза. Ближе к спрятанному она теплеет (краснее, светлее) и гул ближе.',
      'Нашёл — задержи палец, линза нальётся — место вспыхивает. Без нажатия не ищется.',
      'Проверить: тепло-холодно видно глазами, без звука тоже можно найти.'],
    async run(d) { const mg = await d.mg({ task: 'Под досками что-то скребётся' }); const s = await mg.seek('floor#area', { target: 'floor#hidden' }); if (s.state === 'done') d.set('floor_found', true); d.result(await mg.end()); },
  },
  {
    id: 'inspect', group: 'Жесты', title: 'Осмотреть', scene: WORKSHOP, demo: 'shells',
    memo: ['Три ракушки. Коснись — обычная качнётся; «не такая» на секунду приоткрывается — под ней жемчужина, вокруг тёплый свет. Задержи палец на ней — найдено.',
      'Задержал на обычной — она качает «нет» (ошибка «не то»).',
      'Проверить: «не такая» видна глазами, без подписи.'],
    async run(d) {
      const odd = shells[Math.floor(Math.random() * 3)];
      d.set('shell_odd', odd.split('#')[1]);
      const mg = await d.mg({ task: 'Одна ракушка здесь чужая' });
      const s = await mg.seek(null, { inspect: shells, odd, onTouch: ref => { d.set('shell', 'none'); d.set('shell', ref.split('#')[1]); } });
      if (s.state === 'done') d.set('shell_found', true);
      d.result(await mg.end());
    },
  },
  {
    id: 'rhythm', group: 'Жесты', title: 'Ритм', scene: WORKSHOP, demo: 'drum',
    memo: ['К кольцу на барабане сходится второе: жми (где угодно), когда оно коснётся края. Нужно 8 ударов в такт — не суперровно.',
      'Попал — вспышка, мягкий удар, засечка на полосе; рано или поздно — красная крапинка до или после края, промах не считается, но набранное не пропадает.',
      'Проверить: видно заранее, когда жать; пробел тоже бьёт.'],
    async run(d) { const mg = await d.mg({ task: 'Барабан ведёт счёт' }); await mg.rhythm('drum#skin', { glow: 'drum', bpm: 80, hits: 8, onHit: (i, ok) => ok && d.bump('drum_hits') }); d.result(await mg.end()); },
  },
  {
    id: 'rhythm-hold', group: 'Жесты', title: 'Держать в ритм', scene: WORKSHOP, demo: 'breath',
    memo: ['Мех дышит: второе кольцо растёт — держи (вдох), опадает — отпусти (выдох). Четыре удачных вдоха.',
      'Проверить: понятно, когда держать и когда отпускать; огонёк плашки красный, когда не в такт.'],
    async run(d) {
      const mg = await d.mg({ task: 'Мех дышит медленно' });
      let was = null;
      await mg.rhythm('bellows#handle', { glow: 'bellows', variant: 'hold', bpm: 40, hits: 4, progress: (u, i) => { if (i?.breath !== was) { was = i?.breath; d.set('bellows', was === 'in' ? 1 : 0, 1.4); } } });
      d.result(await mg.end());
    },
  },
  {
    id: 'rhythm-interval', group: 'Жесты', title: 'Ритм — интервал', scene: WORKSHOP, demo: 'drum',
    memo: ['Важна не сетка, а промежуток между касаниями: не чаще и не реже, чем сходится кольцо (0.45–0.8 с). Восемь ровных.',
      'Слишком часто — двойная рябь (ошибка «слишком часто»).'],
    async run(d) { const mg = await d.mg({ task: 'Барабан любит ровный шаг' }); await mg.rhythm('drum#skin', { glow: 'drum', variant: 'interval', interval: [0.45, 0.8], count: 8, onHit: (i, ok) => ok && d.bump('drum_hits') }); d.result(await mg.end()); },
  },
  {
    id: 'rhythm-own', group: 'Жесты', title: 'Свой ритм', scene: WORKSHOP, demo: 'drum2',
    memo: ['Левый барабан бьёт свой ритм. Жми где угодно: твой — правый (голубой) барабан, на нём с первым касанием появляется твоё кольцо, он бьёт.',
      'Совпало с его долями — твоё кольцо зеленеет («за ним»); нет — бьются врозь («свой»); не жал — третий путь.',
      'Проверить: оба пути нейтральны, ошибок нет; палец показывает оба.'],
    async run(d) {
      const mg = await d.mg({ task: 'Барабану нужен второй голос. Можно и свой' });
      let taps = 0;
      await mg.rhythm('drum#skin', { variant: 'own', own: 'drum2#skin', bpm: 72, beats: 12, onBeat: () => d.bump('drum_hits'), progress: (u, i) => { if (i?.tap && i.tap > taps) { taps = i.tap; d.bump('drum2_hits'); } } });
      d.result(await mg.end());
    },
  },
  {
    id: 'lead', group: 'Жесты', title: 'Вести', scene: WORKSHOP, demo: 'boat', state: { zone_kind: 'zone' },
    memo: ['Красная стрелка от носа лодки — куда она смотрит. Нажми где угодно и веди вбок: стрелка идёт за смещением. Держи её в светлой зоне на шкале — зона плывёт.',
      'Отпустил — нос возвращается. 12 с; огонёк плашки — в зоне ли.',
      'Проверить: в зоне — зона светится. Клавиши ←→.'],
    async run(d) { const mg = await d.mg({ task: 'Лодку то и дело сносит' }); await mg.lead({ glow: 'boat', seconds: 12, zone: t => 0.55 * Math.sin(t * 0.45), width: 0.35, progress: (u, i) => boat(d, i) }); d.result(await mg.end()); },
  },
  {
    id: 'lead-follow', group: 'Жесты', title: 'Вести за движущимся', scene: WORKSHOP, demo: 'boat', state: { zone_kind: 'firefly' },
    memo: ['Светлячок летает над шкалой — держи стрелку носа на нём.', 'Проверить: так же, как «Вести», но цель живая и быстрее.'],
    async run(d) { const mg = await d.mg({ task: 'Светлячок зовёт за собой' }); await mg.lead({ glow: 'boat', seconds: 12, zone: t => 0.6 * Math.sin(t * 0.9) * Math.cos(t * 0.37), width: 0.3, progress: (u, i) => boat(d, i) }); d.result(await mg.end()); },
  },
  {
    id: 'lead-away', group: 'Жесты', title: 'Держаться в стороне', scene: WORKSHOP, demo: 'boat', state: { zone_kind: 'bee' },
    memo: ['Шмель в красном кольце над шкалой — держи стрелку носа подальше от него.', 'Проверить: «хорошо» — когда нос вне его кольца; не надо целиться в шмеля.'],
    async run(d) { const mg = await d.mg({ task: 'Шмель не любит гостей' }); await mg.lead({ glow: 'boat', seconds: 12, mode: 'away', zone: t => 0.7 * Math.sin(t * 0.6), width: 0.4, progress: (u, i) => boat(d, i) }); d.result(await mg.end()); },
  },
  {
    id: 'lead-smooth', group: 'Жесты', title: 'Вести плавно', scene: WORKSHOP, demo: 'boat', state: { zone_kind: 'zone' },
    memo: ['То же, но рывки нельзя: резкое движение пальца — дорожка рвётся (ошибка «сорвал»).', 'Проверить: плавно можно вести без ошибок.'],
    async run(d) { const mg = await d.mg({ task: 'Лодка пугается резких движений' }); await mg.lead({ glow: 'boat', seconds: 12, smooth: true, zone: t => 0.5 * Math.sin(t * 0.4), width: 0.35, progress: (u, i) => boat(d, i) }); d.result(await mg.end()); },
  },
  {
    id: 'wait', group: 'Жесты', title: 'Ждать', scene: WORKSHOP, demo: 'hourglass',
    memo: ['Ничего не делай: песок пересыпается, бездействие засчитано.', 'Палец один раз показывает «руки прочь» (отрывается и уходит), повторов нет.',
      'Проверить: понятно, что можно ничего не делать; полоса доходит до конца, не ошибка.'],
    async run(d) { const mg = await d.mg({ task: 'Песок ещё сыплется' }); await mg.wait(6, { progress: u => d.set('sand', u) }); d.result(await mg.end()); },
  },

  // ── the frame ──
  {
    id: 'frame-enter', group: 'Рамка', title: 'Вход и конец', scene: WORKSHOP, demo: 'bell',
    memo: ['Вход: вверху по центру проявляется плашка с фразой, колокольчик пульсирует, метка появляется с отскоком, тихий вдох и колокольчик. Сцену ничто не темнит.',
      'Три нажатия — три засечки. Конец: полоса вспыхивает во всю длину, мягкие колокольчики; через секунду плашка тает.',
      'Проверить: без надписей понятно, что мини-игра началась и кончилась.'],
    async run(d) { const mg = await d.mg({ steps: 3, task: 'Колокольчик звонят трижды' }); for (let i = 0; i < 3; i++) { await mg.press('bell#top', { glow: 'bell' }); bell(d); } d.result(await mg.end()); },
  },
  {
    id: 'frame-ghost', group: 'Рамка', title: 'Призрачный палец', scene: WORKSHOP, demo: 'rope',
    memo: ['Показ забыт перед этой демонстрацией: палец (светлый круг с тенью и следом) сам тянет груз к крюку — груз едет за ним; палец отпускает, и груз видимо возвращается на место.',
      'Касание прерывает показ. Ничего не делаешь 4 с — показ снова, дальше раз в 8 с.',
      'Проверить: показ понятен; время мини-игры начинается после показа.'],
    async run(d) { d.b.minigame.forget(); const mg = await d.mg({ task: 'Груз не достаёт до крюка' }); await mg.pull('rope#weight', { to: 'rope#hook', progress: u => d.set('rope', u) }); d.result(await mg.end()); },
  },
  {
    id: 'frame-plate', group: 'Рамка', title: 'Плашка задачи', scene: WORKSHOP, demo: 'bell',
    memo: ['Пять шагов разных жестов — пять отрезков полосы; фраза меняется с задачей.',
      'Огонёк на краю заливки: ничего не делаешь — маленький и спокойный; делаешь как надо — ярче, заливка идёт; не так — краснеет и дрожит.',
      'Ошибка — тихая щербинка на отрезке шага (без полёта искры).',
      'Проверить: краем глаза понятно, хорошо ли сейчас и сколько прошёл.'],
    async run(d) {
      const mg = await d.mg({ steps: 5, task: 'Колокольчик давно молчит' });
      await mg.press('bell#top', { glow: 'bell' }); bell(d);
      await mg.hold(null, { at: 'bell', seconds: 1.2, task: 'Колокольчику всё равно, где рука' });
      await mg.press('bell#top', { glow: 'bell', task: 'Одного звонка мало' }); bell(d);
      await mg.hold('bell#top', { glow: 'bell', seconds: 1, task: 'Колокольчику хочется звучать дольше' });
      await mg.press('bell#top', { glow: 'bell', task: 'Остался последний звонок' }); bell(d);
      d.result(await mg.end());
    },
  },
  {
    id: 'frame-turn', group: 'Рамка', title: 'Ход сцены', scene: WORKSHOP, demo: 'door',
    memo: ['Стук — потом отвечает сцена: меток и свечения нет, огонёк на плашке медленно дышит («не зависло, ждём»). Потом снова твой ход.',
      'Проверить: во время ответа понятно, что надо ждать; метка возвращается.'],
    async run(d) {
      const mg = await d.mg({ steps: 2, task: 'За дверцей тихо' });
      for (let k = 0; k < 2; k++) {
        if ((await mg.press('door#knock')).state === 'done') d.bump('door_knocks');
        await mg.sceneTurn((async () => { for (let i = 0; i < 3; i++) { await d.wait(0.8); d.bump('door_reply'); } await d.wait(0.6); })());
      }
      d.result(await mg.end());
    },
  },
  {
    id: 'frame-errors', group: 'Рамка', title: 'Ошибки', scene: WORKSHOP, demo: 'bell',
    memo: ['Каждая ошибка — своим видом и звуком, там, где случилась; на полосе — тихая щербинка (здесь мягкой пробы нет — всё считается).',
      'Шаги: колокольчик (нажми мимо — «мимо»), держать (отпусти рано — «рано отпустил»), держать где угодно с ветром — колокольчик раскачивается на порывах («в опасность»), колокольчик с повтором 3.',
      'Звуков ошибок три, все тихие: глухой «мимо», ткань «срыв», два низких стука «сбой».',
      'Остальные ошибки — в своих жестах: «сошёл» (линия), «не туда» (куда), «рано или поздно» и «слишком часто» (ритм), «против» (крутить), «сорвал» (плавно).'],
    async run(d) {
      const mg = await d.mg({ steps: 4, soft: false, task: 'Колокольчик давно молчит' });
      await mg.press('bell#top', { glow: 'bell' }); bell(d);
      await mg.hold('bell#top', { glow: 'bell', seconds: 2, task: 'Колокольчику хочется звучать дольше' });
      await mg.hold(null, { at: 'bell', seconds: 3, danger: s => { d.set('wind', gust(s.t)); return windy(1.2)(s); }, task: 'Ветер раскачивает колокольчик' });
      d.set('wind', 0, 0.5);
      await mg.press('bell#top', { glow: 'bell', repeat: 3, onTouch: () => bell(d), task: 'Колокольчик звонят трижды' });
      d.result(await mg.end());
    },
  },
  {
    id: 'frame-loss', group: 'Рамка', title: 'Проигрыш', scene: WORKSHOP, demo: 'lantern',
    memo: ['Игра, которая допускает проигрыш: две ошибки — и шаг проигран. На плашке справа — тень: сколько осталось до проигрыша, растёт с каждой ошибкой.',
      'Держи фонарь в ветер, пока дважды не погаснет. Конец-проигрыш: тень накрывает полосу, низкий тихий звук.',
      'Проверить: отличается от успеха с первого взгляда.'],
    async run(d) {
      const mg = await d.mg({ soft: false, task: 'Огню мешает ветер. Спичек две' });
      await mg.hold('lantern#flame', { glow: 'lantern', seconds: 6, lives: 2, danger: s => { d.set('wind', gust(s.t)); return windy(1.6)(s); }, progress: u => d.set('lantern', u) });
      d.set('wind', 0, 0.5);
      d.result(await mg.end());
    },
  },
  {
    id: 'frame-limit', group: 'Рамка', title: 'Время на исходе', scene: WORKSHOP, demo: 'plate',
    memo: ['Предел — время (10 с): тень справа ползёт, пока время идёт. Не успел стереть — проигрыш.',
      'Проверить: краем глаза видно, тороплюсь ли я.'],
    async run(d) { const mg = await d.mg({ task: 'Надпись вот-вот затянет пылью' }); await mg.rub('plate#dust', { glow: 'plate', limit: 10, progress: u => d.set('plate', u) }); d.result(await mg.end()); },
  },
  {
    id: 'frame-pause', group: 'Рамка', title: 'Пауза', scene: WORKSHOP, demo: 'drum',
    memo: ['Ритм: нужно 20 ударов в такт. Посреди нажми ⏸ (правый нижний угол): стоит всё — кольцо, время, звук, пульс барабана.',
      'Нажми ▶ — ритм даёт отсчёт в три тика и продолжает с того же места.',
      'Проверить: на паузе не теряешь удары; то же — если свернуть вкладку и вернуться.'],
    async run(d) { const mg = await d.mg({ task: 'Барабан ведёт счёт' }); await mg.rhythm('drum#skin', { glow: 'drum', bpm: 80, hits: 20, onHit: (i, ok) => ok && d.bump('drum_hits') }); d.result(await mg.end()); },
  },
  {
    id: 'frame-choice', group: 'Рамка', title: 'Обычный выбор', scene: WORKSHOP, demo: 'box',
    memo: ['Выбор между мини-играми — тем же языком, без плашки: метка, лепестки. Здесь — на время (8 с): дуга по краю метки убывает; молчание — тоже выбор.',
      'Потом — выбор с одним действием: срабатывает сразу, на отпускании.',
      'Проверить: время видно на метке; одно действие — без меню.'],
    async run(d) {
      const a = await d.choose('box#front', [{ id: 'open', label: 'Открыть' }, { id: 'leave', label: 'Оставить' }], { seconds: 8 });
      d.note(`выбрано: ${a ?? 'молчание'}`);
      if (a === 'open') { d.set('drawer', 'middle'); d.set('drawer_open', 1, 0.6); }
      const b = await d.choose('box#front', [{ id: 'close', label: 'Закрыть' }]);
      d.note(`выбрано: ${b}`);
      if (b) d.set('drawer_open', 0, 0.6);
    },
  },
  {
    id: 'frame-skip', group: 'Рамка', title: 'Пропуск автора', scene: WORKSHOP, demo: 'screws',
    memo: ['Четыре винта. На плашке справа — ⏭: только у автора (у игрока его нет). Нажми — мини-игра кончается сразу, без аккорда.',
      'Итог — «пропущено» (виден здесь, игроку — нет).'],
    async run(d) { const mg = await d.mg({ steps: 4, task: 'Крышка держится на честном слове' }); for (let i = 1; i <= 4; i++) await mg.turn(`screws#s${i}`, { turns: 1, progress: u => d.set(`screw${i}`, u) }); d.result(await mg.end()); },
  },
  {
    id: 'frame-soft', group: 'Рамка', title: 'Мягкая проба', scene: WORKSHOP, demo: 'bellows',
    memo: ['Показ забыт: жест встречается впервые за партию. Ошибки видны и звучат, но не считаются: щербинки нет, итог чистый.',
      'Отпусти рано пару раз, потом дотяни. Затем второй шаг — тот же жест: теперь ошибки считаются.'],
    async run(d) {
      d.b.minigame.forget();
      const mg = await d.mg({ steps: 2, task: 'Меху нечем дышать' });
      await mg.hold('bellows#handle', { glow: 'bellows', seconds: 2, progress: u => d.set('bellows', u) });
      d.set('bellows', 0, 0.6);
      await mg.hold('bellows#handle', { glow: 'bellows', seconds: 2, progress: u => d.set('bellows', u), task: 'Мех опять выдохся' });
      d.result(await mg.end());
    },
  },
  {
    id: 'frame-keys', group: 'Рамка', title: 'Клавиши', scene: WORKSHOP, demo: 'rope',
    memo: ['Нажми любую клавишу — в метках появляются знаки клавиш (␣, →); коснись или кликни — знаки пропадают.',
      'Шаги: груз — стрелка → тянет, отпусти стрелку, когда груз в цели; затем пробел — держать где угодно.',
      'Проверить: о клавишах узнаёшь без надписи.'],
    async run(d) {
      const mg = await d.mg({ steps: 2, task: 'Груз не достаёт до крюка' });
      await mg.pull('rope#weight', { to: 'rope#hook', progress: u => d.set('rope', u) });
      await mg.hold(null, { seconds: 1.2, task: 'Грузу всё равно, где рука' });
      d.result(await mg.end());
    },
  },

  // ── mini-games of the three games, put into the language ──
  {
    id: 'osnastka', group: 'Мини-игры', title: 'Оснастка', scene: DECK,
    memo: ['«Алые паруса», Оснастка: четыре крепления во вставке-крупном плане, одна метка за раз, держать до защёлки.',
      'Было: держать «у точки» без метки, рука девочки далеко от точки. Стало: метка там, где крепят; первое крепление — мягкая проба (без срыва).',
      'Проверить: метки живут только во вставке (пока она открыта); четыре отрезка полосы.'],
    async run(d) {
      d.set('closeup', 1, 0.6);
      await d.wait(0.8);
      const mg = await d.mg({ steps: 4, task: 'Паруса ещё не закреплены' });
      for (let i = 1; i <= 4; i++) await mg.hold(`closeup#k${i}`, { seconds: 1.4, progress: u => d.set(`rig${i}`, u) });
      d.result(await mg.end());
      d.set('closeup', 0, 0.6);
    },
  },
  {
    id: 'vinty', group: 'Мини-игры', title: 'Винты', scene: WORKSHOP, demo: 'screws',
    memo: ['«Ашеры», Винты: четыре винта, крутить; рядом тихая «оставить» — видна сразу.',
      'Было: «оставить» пряталась в меню кольца. Стало: второй путь виден до выбора; «оставить» — развилка, конец нейтральный.',
      'Проверить: выбрать «оставить» на любом винте — мини-игра кончается выбором.'],
    async run(d) {
      const mg = await d.mg({ steps: 4, task: 'Винты можно и не дотягивать' });
      for (let i = 1; i <= 4; i++) {
        const s = await mg.turn(`screws#s${i}`, { turns: 1, quiet: { ref: 'screws#leave', id: 'leave' }, progress: u => d.set(`screw${i}`, u) });
        if (s.state === 'chosen') break;
      }
      d.result(await mg.end());
    },
  },
  {
    id: 'struna', group: 'Мини-игры', title: 'Струна', scene: WORKSHOP, demo: 'drum2',
    memo: ['«Ашеры», Струна: его ритм на левом барабане, твой — на правом. Свой ритм или за ним — оба пути нейтральны; не жать — третий итог.',
      'Было: бездействие засчитывалось как «за ним», окно в такт ≤ 60 мс. Стало: три итога, окно ±150 мс.',
      'Проверить: оба ритма видны; ошибок нет.'],
    async run(d) {
      const mg = await d.mg({ task: 'Барабану нужен второй голос. Можно и свой' });
      let taps = 0;
      await mg.rhythm('drum#skin', { variant: 'own', own: 'drum2#skin', bpm: 96, beats: 16, onBeat: () => d.bump('drum_hits'), progress: (u, i) => { if (i?.tap && i.tap > taps) { taps = i.tap; d.bump('drum2_hits'); } } });
      d.result(await mg.end());
    },
  },
  {
    id: 'koltso', group: 'Мини-игры', title: 'Кольцо', scene: WORKSHOP, demo: 'lantern',
    memo: ['«Алые паруса», Кольцо: надеть кольцо спящей — держать, пока она не шевельнётся. Здесь — фонарь в ветер.',
      'Было: «она шевелится» — только слухом. Стало: опасность — дуга на краю метки, видно глазами.',
      'Проверить: можно пройти, отпуская на порывах.'],
    async run(d) {
      const mg = await d.mg({ task: 'Огонёк чуток к ветру' });
      await mg.hold('lantern#flame', { glow: 'lantern', seconds: 5, danger: s => { d.set('wind', gust(s.t)); return windy(0.8)(s); }, progress: u => d.set('lantern', u) });
      d.set('wind', 0, 0.5);
      d.result(await mg.end());
    },
  },
  {
    id: 'slushat', group: 'Мини-игры', title: 'Слушать', scene: WORKSHOP, demo: 'floor',
    memo: ['«Ашеры», Слушать: найти место под полом. Было: водить мышью без нажатия — на телефоне нельзя, только слухом.',
      'Стало: искать с нажатием, линза теплеет глазами и звуком.',
      'Проверить: на телефоне и без звука находится.'],
    async run(d) { const mg = await d.mg({ task: 'Под досками что-то скребётся' }); const s = await mg.seek('floor#area', { target: 'floor#hidden', radius: 170 }); if (s.state === 'done') d.set('floor_found', true); d.result(await mg.end()); },
  },
  {
    id: 'kurs', group: 'Мини-игры', title: 'Курс', scene: DECK, state: { under_way: 1, sail: 1 },
    memo: ['«Алые паруса», Курс: держать нос (крупный красный диск на форштевне) на маяке, ветер сносит. Камера едет вместе с кораблём — жест без точки, ему это не мешает.',
      'Три отрезка по 12 с — три отрезка полосы; огонёк — на курсе ли. Веди вбок — это руль: смещение пальца поворачивает нос.',
      'Было: итог выбрасывался. Стало: итог виден (здесь — строкой итога).'],
    async run(d) {
      const mg = await d.mg({ steps: 3, task: 'Ветер сносит нос с маяка' });
      let heading = 0;
      for (let leg = 0; leg < 3; leg++) {
        await mg.lead({
          seconds: 12, zone: 0, width: 0.4,
          push: t => 0.5 * (0.8 + 0.2 * leg) * (0.6 * Math.sin(2 * Math.PI * (t + 12 * leg) / 7) + 0.4 * Math.sin(2 * Math.PI * (t + 12 * leg) / 2.9 + 1)),
          progress: (u, i) => { if (!i) return; if (Math.abs(i.arrow - heading) > 0.01) { heading = i.arrow; d.set('heading', heading); } d.set('on_course', i.in ? 1 : 0, 0.4); },
        });
      }
      d.result(await mg.end());
    },
  },

  // ── the board of sounds: the library heard one by one, Pavel picks (П45) ──
  {
    id: 'sounds', group: 'Звуки', title: 'Доска звуков', scene: WORKSHOP, demo: 'none',
    memo: ['Тридцать с лишним коротких звуков для игр — без нот и мелодий: щелчки, лопанье, капли, дерево, стекло, щипки.',
      'Нажми кнопку — звучит (громкость — ползунок «звуки» сайта). Сердечко — отметить, что нравится; внизу — номера выбранных.',
      'Язык пока звучит прежним набором — выбранные пойдут в него.'],
    run: d => board(d.b, d.signal),
  },
];

// the lead's demonstrations move the boat: its heading, the zone (or the firefly, the bee), whether it is in it
function boat(d, i) {
  if (!i) return;
  d.set('boat_heading', i.arrow); d.set('zone_center', i.zone); d.set('zone_lit', i.in ? 1 : 0, 0.3);
}
