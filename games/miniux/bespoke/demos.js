// The playground's demonstrations (docs/miniux/playground.md): each gesture of the language of mini-games and its
// variants, each part of its frame, and some mini-games of the three games put into it — each on the playground's
// things («Мастерская»: the key `demo` sets what is on the table; «Палуба»: the deck, its close-up, the ship under way).
// A demonstration: {id, group, title, scene, demo (the workshop's `demo`), state (more of the scene's values), memo
// (what is meant, what to check, what must work — 3–6 lines), run(d)} — run plays it once; d (game.js): d.mg(opts) —
// a mini-game (bespoke.minigame.start, taken away if the player goes to another demonstration), d.set(key, value,
// seconds), d.bump(key) — a counter of the scene +1, d.wait(seconds), d.choose(ref, actions, opts), d.result(r) — the
// outcome shown, d.note(text) — a line shown, d.b — bespoke.
export const WORKSHOP = 'Мастерская', DECK = 'Палуба';

// what each scene's keys are at the start of a demonstration (all of them: what one left is not seen in the next)
export const RESET = {
  [WORKSHOP]: {
    bell_hits: 0, drawer: 'none', drawer_open: 0, door_knocks: 0, door_reply: 0, door_open: 0, bellows: 0, lantern: 0, wind: 0,
    candle: 0, candle_shake: 0, wick1: 0, wick2: 0, wick3: 0, climb: 0, grip: 'none', rope: 0, shutter: 0, crate: 0, knot: 0,
    knot_off: false, peg: 'none', bubble1: 'free', bubble2: 'free', bubble3: 'free', crack: 0, screw1: 0, screw2: 0, screw3: 0,
    screw4: 0, plate: 0, floor_found: false, shell: 'none', shell_odd: 's2', shell_found: false, drum_hits: 0, drum2_hits: 0,
    boat_heading: 0, zone_center: 0, zone_kind: 'zone', zone_lit: 0, sand: 0,
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

export const DEMOS = [
  // ── gestures ──
  {
    id: 'press', group: 'Жесты', title: 'Нажать', scene: WORKSHOP, demo: 'bell',
    memo: ['Кольцо на колокольчике — нажми его. Срабатывает сразу, на касании.',
      'Проверить: кольцо пульсирует, пока ждёт; от касания сжимается, щелчок, искра; колокольчик качается.',
      'Нажми мимо — рябь у пальца, кольцо дёргается к нему, глухой звук, искра летит в бусину.'],
    async run(d) { const mg = await d.mg({ beads: 1 }); if ((await mg.press('bell#top')).state === 'done') bell(d); d.result(await mg.end()); },
  },
  {
    id: 'petals', group: 'Жесты', title: 'Нажать с лепестками', scene: WORKSHOP, demo: 'box',
    memo: ['У ящика три ящичка: нажми кольцо — вокруг раскроются три лепестка со словами.',
      'Выбор — на отпускании над лепестком (или тап по нему); касание мимо лепестков их закрывает.',
      'Проверить: бусина выбора — нейтральная (не «хорошо», не «плохо»), конец — ровный аккорд.',
      'Клавиши: пробел раскрывает, ←→ выбирают, Enter — выбрать.'],
    async run(d) {
      const mg = await d.mg({ beads: 1 });
      const s = await mg.press('box#front', { actions: [{ id: 'top', label: 'Верхний' }, { id: 'middle', label: 'Средний' }, { id: 'bottom', label: 'Нижний' }] });
      if (s.choice) { d.set('drawer', s.choice); d.set('drawer_open', 1, 0.6); }
      d.result(await mg.end());
    },
  },
  {
    id: 'repeat', group: 'Жесты', title: 'Нажать с повтором и ответом', scene: WORKSHOP, demo: 'door',
    memo: ['Постучи в дверцу три раза — каждое касание свой «тук», дверца вздрагивает. Потом ход сцены: стучат в ответ.',
      'Рядом бледное кольцо «уйти» — второй путь, видно сразу; палец показывает оба.',
      'Проверить: бусина наливается по стукам; во время ответа меток нет, бусина медленно дышит.',
      'Выбрал «уйти» — бусина-развилка, конец нейтральный.'],
    async run(d) {
      const mg = await d.mg({ beads: 1 });
      const s = await mg.press('door#knock', { repeat: 3, quiet: { ref: 'door#away', id: 'away' }, onTouch: () => d.bump('door_knocks') });
      if (s.state === 'done') await mg.sceneTurn((async () => { for (let i = 0; i < 2; i++) { await d.wait(0.7); d.bump('door_reply'); } await d.wait(0.8); d.set('door_open', 1, 1); await d.wait(1); })());
      d.result(await mg.end());
    },
  },
  {
    id: 'hold', group: 'Жесты', title: 'Держать', scene: WORKSHOP, demo: 'bellows',
    memo: ['Кольцо с желобом на мехе — нажми и держи, пока желоб не нальётся (1.5 с). Мех раздувается.',
      'Проверить: налив виден из-под пальца, звук тянется и растёт тоном; полно — защёлка, дальше держать не надо.',
      'Отпусти раньше — налив стекает назад, звук «срыв» (первый раз — не считается, мягкая проба).'],
    async run(d) { const mg = await d.mg({ beads: 1 }); await mg.hold('bellows#handle', { seconds: 1.5, progress: u => d.set('bellows', u) }); d.result(await mg.end()); },
  },
  {
    id: 'hold-anywhere', group: 'Жесты', title: 'Держать где угодно', scene: WORKSHOP, demo: 'bellows',
    memo: ['Метки на вещи нет: на панели знак «держать». Держи где угодно на экране (кроме углов с кнопками).',
      'Под пальцем встаёт кольцо с желобом и наливается; мех раздувается.',
      'Проверить: палец показывает в случайном месте; знак на панели понятен без слов.'],
    async run(d) { const mg = await d.mg({ beads: 1 }); await mg.hold(null, { seconds: 2, progress: u => d.set('bellows', u) }); d.result(await mg.end()); },
  },
  {
    id: 'hold-danger', group: 'Жесты', title: 'Держать с опасностью', scene: WORKSHOP, demo: 'lantern',
    memo: ['Держи на фонаре — он разгорается. Край метки краснеет, когда дует ветер; дойдёт до конца под пальцем — фонарь гаснет до последней отметки.',
      'Отпусти — ветер стихает.',
      'Проверить: видно, как близко опасность; без звука понятно; держать дольше полного не нужно.'],
    async run(d) {
      const mg = await d.mg({ beads: 1 });
      await mg.hold('lantern#flame', { seconds: 4, danger: s => { d.set('wind', gust(s.t)); return windy(0.9)(s); }, progress: u => d.set('lantern', u) });
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
      const mg = await d.mg({ beads: 1 });
      await mg.hold('candle#flame', { variant: 'still', seconds: 3, progress: (u, i) => { d.set('candle', u); d.set('candle_shake', i?.level ?? 0); } });
      d.result(await mg.end());
    },
  },
  {
    id: 'hold-quench', group: 'Жесты', title: 'Гасить', scene: WORKSHOP, demo: 'wicks',
    memo: ['Три фитиля сами начинают чадить — опасность растёт на каждой метке. Держи ту, что чадит, — она успокаивается.',
      'Мини-игра на время (12 с): бусина наливается временем, её яркость — доля времени, когда всё тихо.',
      'Проверить: видно, какой фитиль ближе к беде; один палец — одна метка.'],
    async run(d) {
      const mg = await d.mg({ beads: 1 });
      await mg.hold(null, { variant: 'quench', refs: ['wicks#w1', 'wicks#w2', 'wicks#w3'], seconds: 12, progress: (u, i) => i?.levels.forEach((l, k) => d.set(`wick${k + 1}`, l)) });
      d.result(await mg.end());
    },
  },
  {
    id: 'hold-catch', group: 'Жесты', title: 'Перехват', scene: WORKSHOP, demo: 'brackets',
    memo: ['Две скобы слева и справа, по очереди: держи короткий налив (0.3 с) — защёлка — метка переходит на другую сторону.',
      'Шесть перехватов — одна бусина, наливается ходом. Груз поднимается.',
      'Проверить: видна всегда одна метка; отпустить рано — «срыв».'],
    async run(d) {
      const mg = await d.mg({ beads: 1 });
      await mg.hold(null, { variant: 'catch', refs: ['brackets#left', 'brackets#right'], count: 6, progress: (u, i) => { d.set('climb', u, 0.3); d.set('grip', i?.side ? 'left' : 'right'); } });
      d.set('grip', 'none');
      d.result(await mg.end());
    },
  },
  {
    id: 'pull', group: 'Жесты', title: 'Тянуть', scene: WORKSHOP, demo: 'rope',
    memo: ['Кольцо с пунктиром на грузе, пустое кольцо — у крюка. Тяни груз к крюку: он идёт за пальцем по пути.',
      'Проверить: поперёк пути вести можно — груз держится пути; в последних 15% сам «прилипает», защёлка.',
      'Отпустил на полпути — груз стоит, можно продолжить. Клавиши: → / ↑.'],
    async run(d) { const mg = await d.mg({ beads: 1 }); await mg.pull('rope#weight', { to: 'rope#hook', progress: u => d.set('rope', u) }); d.set('rope', 1, 0.2); d.result(await mg.end()); },
  },
  {
    id: 'pull-spring', group: 'Жесты', title: 'Тянуть с пружиной', scene: WORKSHOP, demo: 'shutter',
    memo: ['Подними заслонку до верха. Отпустишь раньше — она возвращается вниз, путь пружинит.',
      'Проверить: это не ошибка (нет звука срыва) — просто пружина; у верха прилипает.'],
    async run(d) { const mg = await d.mg({ beads: 1 }); await mg.pull('shutter#handle', { to: 'shutter#top', variant: 'spring', progress: u => d.set('shutter', u) }); d.set('shutter', 1, 0.2); d.result(await mg.end()); },
  },
  {
    id: 'pull-resist', group: 'Жесты', title: 'Тянуть с сопротивлением', scene: WORKSHOP, demo: 'crate',
    memo: ['Тяжёлый ящик: тяни вперёд по пути — между ящиком и пальцем натягивается красная нить. Ящик идёт, пока натяжение сильное.',
      'Отпустил — ящик откатывается назад.',
      'Проверить: натяжение видно (толще и ярче нить); ящик не прыгает за пальцем.'],
    async run(d) { const mg = await d.mg({ beads: 1 }); await mg.pull('crate#handle', { to: 'crate#goal', variant: 'resist', progress: u => d.set('crate', u) }); d.set('crate', 1, 0.3); d.result(await mg.end()); },
  },
  {
    id: 'pull-tear', group: 'Жесты', title: 'Оторвать', scene: WORKSHOP, demo: 'knot',
    memo: ['Цели нет: потяни узел в любую сторону — немного (5% высоты окна), и он распадается.',
      'Проверить: узел слабеет, пока тянешь; отпустил раньше — всё как было, без ошибки.'],
    async run(d) { const mg = await d.mg({ beads: 1 }); const s = await mg.pull('knot#knot', { variant: 'tear', progress: u => d.set('knot', u) }); if (s.state === 'done') d.set('knot_off', true); d.result(await mg.end()); },
  },
  {
    id: 'pull-where', group: 'Жесты', title: 'Тянуть куда', scene: WORKSHOP, demo: 'sockets',
    memo: ['Колышек — в одно из гнёзд. Пустые кольца — гнёзда, куда можно; бледное пунктирное — нельзя.',
      'Отпустил у «нельзя» — колышек возвращается, гнездо качает «нет» (ошибка «не туда»). Отпустил в пустом месте — просто возвращается.',
      'Проверить: видно до действия, какие цели доступны.'],
    async run(d) {
      const mg = await d.mg({ beads: 1 });
      const s = await mg.pull('sockets#peg', { variant: 'where', targets: [{ ref: sockets[0] }, { ref: sockets[1], ok: false }, { ref: sockets[2] }] });
      if (s.choice) d.set('peg', s.choice.split('#')[1]);
      d.result(await mg.end());
    },
  },
  {
    id: 'pull-catch', group: 'Жесты', title: 'Поймать', scene: WORKSHOP, demo: 'bubbles',
    memo: ['Пузыри плывут сами. Коснись пузыря — он в пальце; отнеси в любое свободное гнездо.',
      'Три пузыря — одна бусина, наливается по одному.',
      'Проверить: метка едет за пузырём (камера стоит); поймать легко — круг касания шире метки.'],
    async run(d) {
      const mg = await d.mg({ beads: 1 });
      await mg.pull(null, {
        variant: 'catch', things: ['bubbles#b1', 'bubbles#b2', 'bubbles#b3'], targets: sockets,
        progress: (u, i) => {
          if (!i) return;
          if (i.placed) d.set(`bubble${i.placed[0].slice(-1)}`, i.placed[1].split('#')[1]);
          else for (const k of [1, 2, 3]) if (d.b.get(`bubble${k}`) === 'held') d.set(`bubble${k}`, 'free');
          if (i.held) d.set(`bubble${i.held.slice(-1)}`, 'held');
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
    async run(d) { const mg = await d.mg({ beads: 1 }); await mg.trace(crack, { progress: u => d.set('crack', u) }); d.result(await mg.end()); },
  },
  {
    id: 'turn', group: 'Жесты', title: 'Крутить', scene: WORKSHOP, demo: 'screw',
    memo: ['Веди по кругу вокруг винта, куда показывает стрелка (по часовой). Полтора оборота. Радиус не важен.',
      'Проверить: щелчок на каждой четверти, тон выше к концу; винт поворачивается.',
      'Против стрелки — вещь стоит, стрелка вспыхивает (ошибка «против»).'],
    async run(d) { const mg = await d.mg({ beads: 1 }); await mg.turn('screws#s1', { turns: 1.5, progress: u => d.set('screw1', u) }); d.result(await mg.end()); },
  },
  {
    id: 'turn-leave', group: 'Жесты', title: 'Крутить или оставить', scene: WORKSHOP, demo: 'screw',
    memo: ['То же, но рядом тихая бледная метка «оставить» — второй путь, виден сразу; палец показывает оба.',
      'Нажал «оставить» — бусина-развилка, конец нейтральный; повторов показа нет (бездействие может быть выбором).'],
    async run(d) { const mg = await d.mg({ beads: 1 }); await mg.turn('screws#s1', { turns: 1.5, quiet: { ref: 'screws#leave', id: 'leave' }, progress: u => d.set('screw1', u) }); d.result(await mg.end()); },
  },
  {
    id: 'rub', group: 'Жесты', title: 'Тереть', scene: WORKSHOP, demo: 'plate',
    memo: ['Пятно над пыльной табличкой: води пальцем с нажатием, пока не покроешь его. Направление и скорость не важны.',
      'Проверить: пятно съёживается по мере покрытия, шорох громче при быстром движении; пыль сходит.',
      'Касание мимо пятна — рябь, пятно зовёт.'],
    async run(d) { const mg = await d.mg({ beads: 1 }); await mg.rub('plate#dust', { progress: u => d.set('plate', u) }); d.result(await mg.end()); },
  },
  {
    id: 'seek', group: 'Жесты', title: 'Искать', scene: WORKSHOP, demo: 'floor',
    memo: ['Пятно над досками: веди с нажатием — под пальцем линза. Ближе к спрятанному она теплеет (краснее, светлее) и звук громче.',
      'Нашёл — задержи палец, линза нальётся — вещь вспыхивает. Без нажатия не ищется.',
      'Проверить: тепло-холодно видно глазами, без звука тоже можно найти.'],
    async run(d) { const mg = await d.mg({ beads: 1 }); const s = await mg.seek('floor#area', { target: 'floor#hidden' }); if (s.state === 'done') d.set('floor_found', true); d.result(await mg.end()); },
  },
  {
    id: 'inspect', group: 'Жесты', title: 'Осмотреть', scene: WORKSHOP, demo: 'shells',
    memo: ['Три ракушки. Коснись — она качнётся; «не такая» отвечает иначе (светится). Задержи палец на ней — найдено.',
      'Задержал на обычной — она качает «нет» (ошибка «не то»).',
      'Проверить: «не такая» видна глазами, без подписи.'],
    async run(d) {
      const odd = shells[Math.floor(Math.random() * 3)];
      d.set('shell_odd', odd.split('#')[1]);
      const mg = await d.mg({ beads: 1 });
      const s = await mg.seek(null, { inspect: shells, odd, onTouch: ref => { d.set('shell', 'none'); d.set('shell', ref.split('#')[1]); } });
      if (s.state === 'done') d.set('shell_found', true);
      d.result(await mg.end());
    },
  },
  {
    id: 'rhythm', group: 'Жесты', title: 'Ритм', scene: WORKSHOP, demo: 'drum',
    memo: ['К кольцу на барабане сходится второе: жми (где угодно), когда оно коснётся края. Восемь долей.',
      'Попал — вспышка и удар; рано или поздно — красная крапинка до или после края.',
      'Проверить: видно заранее, когда жать; бусина — время, яркость — доля попаданий. Пробел тоже бьёт.'],
    async run(d) { const mg = await d.mg({ beads: 1 }); await mg.rhythm('drum#skin', { bpm: 80, beats: 8, onHit: (i, ok) => ok && d.bump('drum_hits') }); d.result(await mg.end()); },
  },
  {
    id: 'rhythm-hold', group: 'Жесты', title: 'Держать в ритм', scene: WORKSHOP, demo: 'breath',
    memo: ['Мех дышит: второе кольцо растёт — держи (вдох), опадает — отпусти (выдох). Четыре вдоха.',
      'Проверить: понятно, когда держать и когда отпускать; яркость бусины — доля времени «в такт».'],
    async run(d) {
      const mg = await d.mg({ beads: 1 });
      let was = null;
      await mg.rhythm('bellows#handle', { variant: 'hold', bpm: 40, beats: 4, progress: (u, i) => { if (i?.breath !== was) { was = i?.breath; d.set('bellows', was === 'in' ? 1 : 0, 1.4); } } });
      d.result(await mg.end());
    },
  },
  {
    id: 'rhythm-interval', group: 'Жесты', title: 'Ритм — интервал', scene: WORKSHOP, demo: 'drum',
    memo: ['Важна не сетка, а промежуток между касаниями: не чаще и не реже, чем сходится кольцо (0.45–0.8 с). Восемь ровных.',
      'Слишком часто — двойная рябь (ошибка «слишком часто»).'],
    async run(d) { const mg = await d.mg({ beads: 1 }); await mg.rhythm('drum#skin', { variant: 'interval', interval: [0.45, 0.8], count: 8, onHit: (i, ok) => ok && d.bump('drum_hits') }); d.result(await mg.end()); },
  },
  {
    id: 'rhythm-own', group: 'Жесты', title: 'Свой ритм', scene: WORKSHOP, demo: 'drum2',
    memo: ['Левый барабан бьёт свой ритм. Жми где угодно: твои касания рисуют твоё кольцо рядом, твой барабан бьёт.',
      'Совпало с его долями — кольца сливаются («за ним»); нет — бьются врозь («свой»); не жал — третий путь.',
      'Проверить: оба пути нейтральны, ошибок нет; палец показывает оба.'],
    async run(d) {
      const mg = await d.mg({ beads: 1 });
      let taps = 0;
      await mg.rhythm('drum#skin', { variant: 'own', bpm: 72, beats: 12, onBeat: () => d.bump('drum_hits'), progress: (u, i) => { if (i?.tap && i.tap > taps) { taps = i.tap; d.bump('drum2_hits'); } } });
      d.result(await mg.end());
    },
  },
  {
    id: 'lead', group: 'Жесты', title: 'Вести', scene: WORKSHOP, demo: 'boat', state: { zone_kind: 'zone' },
    memo: ['Нажми где угодно и веди вбок: под пальцем дорожка с ручкой, нос лодки идёт за смещением. Держи нос в светлой зоне на шкале — она плывёт.',
      'Отпустил — нос возвращается. 12 с; бусина — время, яркость — доля в зоне.',
      'Проверить: в зоне — зона светится. Клавиши ←→.'],
    async run(d) { const mg = await d.mg({ beads: 1 }); await mg.lead({ seconds: 12, zone: t => 0.55 * Math.sin(t * 0.45), width: 0.35, progress: (u, i) => boat(d, i) }); d.result(await mg.end()); },
  },
  {
    id: 'lead-follow', group: 'Жесты', title: 'Вести за движущимся', scene: WORKSHOP, demo: 'boat', state: { zone_kind: 'firefly' },
    memo: ['Светлячок летает над шкалой — держи нос на нём.', 'Проверить: так же, как «Вести», но цель живая и быстрее.'],
    async run(d) { const mg = await d.mg({ beads: 1 }); await mg.lead({ seconds: 12, zone: t => 0.6 * Math.sin(t * 0.9) * Math.cos(t * 0.37), width: 0.3, progress: (u, i) => boat(d, i) }); d.result(await mg.end()); },
  },
  {
    id: 'lead-away', group: 'Жесты', title: 'Держаться в стороне', scene: WORKSHOP, demo: 'boat', state: { zone_kind: 'bee' },
    memo: ['Шмель над шкалой — держи нос подальше от него.', 'Проверить: «хорошо» — когда нос вне его зоны.'],
    async run(d) { const mg = await d.mg({ beads: 1 }); await mg.lead({ seconds: 12, mode: 'away', zone: t => 0.7 * Math.sin(t * 0.6), width: 0.4, progress: (u, i) => boat(d, i) }); d.result(await mg.end()); },
  },
  {
    id: 'lead-smooth', group: 'Жесты', title: 'Вести плавно', scene: WORKSHOP, demo: 'boat', state: { zone_kind: 'zone' },
    memo: ['То же, но рывки нельзя: резкое движение пальца — дорожка рвётся (ошибка «сорвал»).', 'Проверить: плавно можно вести без ошибок.'],
    async run(d) { const mg = await d.mg({ beads: 1 }); await mg.lead({ seconds: 12, smooth: true, zone: t => 0.5 * Math.sin(t * 0.4), width: 0.35, progress: (u, i) => boat(d, i) }); d.result(await mg.end()); },
  },
  {
    id: 'wait', group: 'Жесты', title: 'Ждать', scene: WORKSHOP, demo: 'hourglass',
    memo: ['Ничего не делай: песок пересыпается, бездействие засчитано.', 'Палец один раз показывает «руки прочь» (отрывается и уходит), повторов нет.',
      'Проверить: понятно, что можно ничего не делать; бусина полная, не ошибка.'],
    async run(d) { const mg = await d.mg({ beads: 1 }); await mg.wait(6, { progress: u => d.set('sand', u) }); d.result(await mg.end()); },
  },

  // ── the frame ──
  {
    id: 'frame-enter', group: 'Рамка', title: 'Вход и конец', scene: WORKSHOP, demo: 'bell',
    memo: ['Вход: панель выезжает в правом верхнем углу, метка появляется с отскоком, короткий восходящий звук. Сцену ничто не темнит.',
      'Три нажатия — три бусины. Конец: бусины вспыхивают по очереди, аккорд; через секунду панель уезжает.',
      'Проверить: без надписей понятно, что мини-игра началась и кончилась.'],
    async run(d) { const mg = await d.mg({ beads: 3 }); for (let i = 0; i < 3; i++) { await mg.press('bell#top'); bell(d); } d.result(await mg.end()); },
  },
  {
    id: 'frame-ghost', group: 'Рамка', title: 'Призрачный палец', scene: WORKSHOP, demo: 'rope',
    memo: ['Показ забыт перед этой демонстрацией: полупрозрачный палец сам тянет груз к крюку — раз, на настоящей метке.',
      'Касание прерывает показ. Ничего не делаешь 4 с — показ снова, дальше раз в 8 с.',
      'Проверить: показ понятен; время мини-игры начинается после показа.'],
    async run(d) { d.b.minigame.forget(); const mg = await d.mg({ beads: 1 }); await mg.pull('rope#weight', { to: 'rope#hook', progress: u => d.set('rope', u) }); d.result(await mg.end()); },
  },
  {
    id: 'frame-panel', group: 'Рамка', title: 'Панель хода', scene: WORKSHOP, demo: 'bell',
    memo: ['Пять шагов разных жестов на одних вещах — пять бусин. Текущая обведена и наливается ходом шага; сделан — защёлка, бусина полная.',
      'Ошибка в шаге — искра летит в бусину, на ней скол.',
      'Проверить: по панели видно, сколько осталось; знак жеста появляется только у жестов без метки (здесь — держать где угодно).'],
    async run(d) {
      const mg = await d.mg({ beads: 5 });
      await mg.press('bell#top'); bell(d);
      await mg.hold(null, { seconds: 1.2 });
      await mg.press('bell#top'); bell(d);
      await mg.hold('bell#top', { seconds: 1 });
      await mg.press('bell#top'); bell(d);
      d.result(await mg.end());
    },
  },
  {
    id: 'frame-turn', group: 'Рамка', title: 'Ход сцены', scene: WORKSHOP, demo: 'door',
    memo: ['Стук — потом отвечает сцена: меток нет, текущая бусина медленно дышит («не зависло, ждём»). Потом снова твой ход.',
      'Проверить: во время ответа понятно, что надо ждать; метка возвращается.'],
    async run(d) {
      const mg = await d.mg({ beads: 2 });
      for (let k = 0; k < 2; k++) {
        if ((await mg.press('door#knock')).state === 'done') d.bump('door_knocks');
        await mg.sceneTurn((async () => { for (let i = 0; i < 3; i++) { await d.wait(0.8); d.bump('door_reply'); } await d.wait(0.6); })());
      }
      d.result(await mg.end());
    },
  },
  {
    id: 'frame-errors', group: 'Рамка', title: 'Ошибки', scene: WORKSHOP, demo: 'bell',
    memo: ['Каждая ошибка — своим видом и звуком, там, где случилась; искра уходит в бусину (здесь мягкой пробы нет — всё считается).',
      'Шаги: колокольчик (нажми мимо — «мимо»), держать (отпусти рано — «рано отпустил»), держать где угодно с ветром («в опасность»), колокольчик с повтором 3.',
      'Звуков ошибок три: глухой «мимо», «срыв», «сбой».',
      'Остальные ошибки — в своих жестах: «сошёл» (линия), «не туда» (куда), «рано или поздно» и «слишком часто» (ритм), «против» (крутить), «сорвал» (плавно).'],
    async run(d) {
      const mg = await d.mg({ beads: 4, soft: false });
      await mg.press('bell#top'); bell(d);
      await mg.hold('bell#top', { seconds: 2 });
      await mg.hold(null, { seconds: 3, danger: windy(1.2) });
      await mg.press('bell#top', { repeat: 3, onTouch: () => bell(d) });
      d.result(await mg.end());
    },
  },
  {
    id: 'frame-loss', group: 'Рамка', title: 'Проигрыш', scene: WORKSHOP, demo: 'lantern',
    memo: ['Игра, которая допускает проигрыш: две ошибки — и шаг проигран. Держи фонарь в ветер, пока дважды не погаснет.',
      'Конец-проигрыш: низкий аккорд, бусины гаснут без вспышки.', 'Проверить: отличается от успеха с первого взгляда.'],
    async run(d) {
      const mg = await d.mg({ beads: 1, soft: false });
      await mg.hold('lantern#flame', { seconds: 6, lives: 2, danger: s => { d.set('wind', gust(s.t)); return windy(1.6)(s); }, progress: u => d.set('lantern', u) });
      d.set('wind', 0, 0.5);
      d.result(await mg.end());
    },
  },
  {
    id: 'frame-pause', group: 'Рамка', title: 'Пауза', scene: WORKSHOP, demo: 'drum',
    memo: ['Ритм на 24 доли. Посреди нажми ⏸ (правый нижний угол): стоит всё — кольцо, время, звук.',
      'Нажми ▶ — ритм даёт отсчёт в три тика и продолжает с того же места.',
      'Проверить: на паузе не теряешь доли; то же — если свернуть вкладку и вернуться.'],
    async run(d) { const mg = await d.mg({ beads: 1 }); await mg.rhythm('drum#skin', { bpm: 80, beats: 24, onHit: (i, ok) => ok && d.bump('drum_hits') }); d.result(await mg.end()); },
  },
  {
    id: 'frame-choice', group: 'Рамка', title: 'Обычный выбор', scene: WORKSHOP, demo: 'box',
    memo: ['Выбор между мини-играми — тем же языком, без панели: метка, лепестки. Здесь — на время (8 с): дуга по краю метки убывает; молчание — тоже выбор.',
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
    memo: ['Четыре винта. В панели — ⏭: только у автора (у игрока его нет). Нажми — мини-игра кончается сразу, без аккорда.',
      'Итог — «пропущено» (виден здесь, игроку — нет).'],
    async run(d) { const mg = await d.mg({ beads: 4 }); for (let i = 1; i <= 4; i++) await mg.turn(`screws#s${i}`, { turns: 1, progress: u => d.set(`screw${i}`, u) }); d.result(await mg.end()); },
  },
  {
    id: 'frame-soft', group: 'Рамка', title: 'Мягкая проба', scene: WORKSHOP, demo: 'bellows',
    memo: ['Показ забыт: жест встречается впервые. Ошибки видны и звучат, но не считаются: скола на бусине нет, итог чистый.',
      'Отпусти рано пару раз, потом дотяни. Затем второй шаг — тот же жест: теперь ошибки считаются.'],
    async run(d) {
      d.b.minigame.forget();
      const mg = await d.mg({ beads: 2 });
      await mg.hold('bellows#handle', { seconds: 2, progress: u => d.set('bellows', u) });
      d.set('bellows', 0, 0.6);
      await mg.hold('bellows#handle', { seconds: 2, progress: u => d.set('bellows', u) });
      d.result(await mg.end());
    },
  },
  {
    id: 'frame-keys', group: 'Рамка', title: 'Клавиши', scene: WORKSHOP, demo: 'rope',
    memo: ['Нажми любую клавишу — в метках появляются знаки клавиш (␣, →); коснись или кликни — знаки пропадают.',
      'Шаги: груз — стрелка → тянет; затем пробел — держать где угодно.',
      'Проверить: о клавишах узнаёшь без надписи.'],
    async run(d) {
      const mg = await d.mg({ beads: 2 });
      await mg.pull('rope#weight', { to: 'rope#hook', progress: u => d.set('rope', u) });
      await mg.hold(null, { seconds: 1.2 });
      d.result(await mg.end());
    },
  },

  // ── mini-games of the three games, put into the language ──
  {
    id: 'osnastka', group: 'Мини-игры', title: 'Оснастка', scene: DECK,
    memo: ['«Алые паруса», Оснастка: четыре крепления во вставке-крупном плане, одна метка за раз, держать до защёлки.',
      'Было: держать «у точки» без метки, рука девочки далеко от точки. Стало: метка там, где крепят; первое крепление — мягкая проба (без срыва).',
      'Проверить: метки живут только во вставке (пока она открыта); четыре бусины.'],
    async run(d) {
      d.set('closeup', 1, 0.6);
      await d.wait(0.8);
      const mg = await d.mg({ beads: 4 });
      for (let i = 1; i <= 4; i++) await mg.hold(`closeup#k${i}`, { seconds: 1.4, progress: u => d.set(`rig${i}`, u) });
      d.result(await mg.end());
      d.set('closeup', 0, 0.6);
    },
  },
  {
    id: 'vinty', group: 'Мини-игры', title: 'Винты', scene: WORKSHOP, demo: 'screws',
    memo: ['«Ашеры», Винты: четыре винта, крутить; рядом тихая «оставить» — видна сразу.',
      'Было: «оставить» пряталась в меню кольца. Стало: второй путь виден до выбора; бусина «оставить» — развилка, конец нейтральный.',
      'Проверить: выбрать «оставить» на любом винте — мини-игра кончается выбором.'],
    async run(d) {
      const mg = await d.mg({ beads: 4 });
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
      const mg = await d.mg({ beads: 1 });
      let taps = 0;
      await mg.rhythm('drum#skin', { variant: 'own', bpm: 96, beats: 16, onBeat: () => d.bump('drum_hits'), progress: (u, i) => { if (i?.tap && i.tap > taps) { taps = i.tap; d.bump('drum2_hits'); } } });
      d.result(await mg.end());
    },
  },
  {
    id: 'koltso', group: 'Мини-игры', title: 'Кольцо', scene: WORKSHOP, demo: 'lantern',
    memo: ['«Алые паруса», Кольцо: надеть кольцо спящей — держать, пока она не шевельнётся. Здесь — фонарь в ветер.',
      'Было: «она шевелится» — только слухом. Стало: опасность — дуга на краю метки, видно глазами.',
      'Проверить: можно пройти, отпуская на порывах.'],
    async run(d) {
      const mg = await d.mg({ beads: 1 });
      await mg.hold('lantern#flame', { seconds: 5, danger: s => { d.set('wind', gust(s.t)); return windy(0.8)(s); }, progress: u => d.set('lantern', u) });
      d.set('wind', 0, 0.5);
      d.result(await mg.end());
    },
  },
  {
    id: 'slushat', group: 'Мини-игры', title: 'Слушать', scene: WORKSHOP, demo: 'floor',
    memo: ['«Ашеры», Слушать: найти место под полом. Было: водить мышью без нажатия — на телефоне нельзя, только слухом.',
      'Стало: искать с нажатием, линза теплеет глазами и звуком.',
      'Проверить: на телефоне и без звука находится.'],
    async run(d) { const mg = await d.mg({ beads: 1 }); const s = await mg.seek('floor#area', { target: 'floor#hidden', radius: 170 }); if (s.state === 'done') d.set('floor_found', true); d.result(await mg.end()); },
  },
  {
    id: 'kurs', group: 'Мини-игры', title: 'Курс', scene: DECK, state: { under_way: 1 },
    memo: ['«Алые паруса», Курс: держать нос на маяке, ветер сносит. Камера едет вместе с кораблём — жест без точки, ему это не мешает.',
      'Три отрезка по 12 с — три бусины, яркость — доля «на курсе». Веди вбок — это руль: смещение пальца поворачивает нос.',
      'Было: итог выбрасывался. Стало: итог виден (здесь — строкой итога).'],
    async run(d) {
      const mg = await d.mg({ beads: 3 });
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
];

// the lead's demonstrations move the boat: its heading, the zone (or the firefly, the bee), whether it is in it
function boat(d, i) {
  if (!i) return;
  d.set('boat_heading', i.arrow); d.set('zone_center', i.zone); d.set('zone_lit', i.in ? 1 : 0, 0.3);
}
