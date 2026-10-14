# Мастерская (`main`) — площадка жестов miniux

Стол у стены, камера `picture` стоит (глаз 1.7 м, горизонт 0.3 кадра). Свет ровный: `ambient` 1, ламп нет — вещи
видны как нарисованы. Стена — карточка на 3 м, столешница — плоскость на высоте 1 м (2.2 м в глубину, от 1.4 до 3 м),
передний край — карточка на 1.4 м. Вещи на столе — карточки на 2.2 м, вещи на стене — на 2.95 м; `floor` и `boat` —
карточки с `tilt` (наклонены к стене), чтобы плоское на них было видно крупно.

Ключ `demo` выбирает демонстрацию: каждая вещь рисует себя (и свои точки) только в своих демонстрациях
(`lib.show`), остальные рисуют пустоту; смена `demo` — перерисовка сразу. Всё плавное двигают слои в `animate`; рисунки
читают только строковые и булевы ключи (`demo`, `drawer`, `peg`, `knot_off`, `floor_found`, `shell_odd`,
`shell_found`). Счётчики (`*_hits`, `door_knocks`, `door_reply`) замечает `lib.since` по `e.mem`: значение, с которым
сцена открылась, — не удар.

| demo | вещь | точки | ключи |
| --- | --- | --- | --- |
| none | — | — | — |
| bell | `bell` | `bell#top` | `bell_hits` |
| box | `box` | `box#front` | `drawer`, `drawer_open` |
| door | `door` | `door#knock`, `door#away` (табличка правее) | `door_knocks`, `door_reply`, `door_open` |
| bellows, breath | `bellows` | `bellows#handle` (идёт с ручкой) | `bellows` |
| lantern | `lantern` | `lantern#flame` (идёт с пламенем) | `lantern`, `wind` |
| candle | `candle` | `candle#flame` | `candle`, `candle_shake` |
| wicks | `wicks` | `wicks#w1..w3` | `wick1..wick3` |
| brackets | `brackets` | `brackets#left`, `brackets#right` | `climb`, `grip` |
| rope | `rope` | `rope#weight` (идёт с грузом), `rope#hook` | `rope` |
| shutter | `shutter` | `shutter#handle` (идёт с заслонкой), `shutter#top` | `shutter` |
| crate | `crate` | `crate#handle` (идёт с ящиком), `crate#goal` | `crate` |
| knot | `knot` | `knot#knot` | `knot`, `knot_off` |
| sockets | `sockets` | `sockets#peg`, `sockets#s1..s3` | `peg` |
| bubbles | `bubbles` + `sockets` | `bubbles#b1..b3` (движутся), `sockets#s1..s3` | `bubble1..bubble3` |
| crack | `crack` | `crack#p0..p6` | `crack` |
| screw / screws | `screws` | `screws#s1` (в screw — один, посередине) / `screws#s1..s4`, `screws#leave` | `screw1..screw4` |
| plate | `plate` | `plate#dust` | `plate` |
| floor | `floor` | `floor#area`, `floor#hidden` | `floor_found` |
| shells | `shells` | `shells#s1..s3` | `shell`, `shell_odd`, `shell_found` |
| drum | `drum` | `drum#skin` | `drum_hits` |
| drum2 | `drum`, `drum2` | `drum#skin`, `drum2#skin` | `drum_hits`, `drum2_hits` |
| boat | `boat` | `boat#bow` (идёт с носом), `boat#scale` | `boat_heading`, `zone_center`, `zone_kind`, `zone_lit` |
| hourglass | `hourglass` | `hourglass#glass` | `sand` |

Где точки в кадре (по расчёту: фокус — высота кадра, горизонт 0.3; x — доля сцены 16:9): все в x 0.32…0.65,
y 0.2…0.6; соседние в одной демонстрации — не ближе 0.1 высоты кадра (точки трещины — 0.095; пузыри на своих кругах
иногда сходятся до ~0.08).

Устройство:
- `lib.js`: `show`, `since` (секунды с последней смены счётчика), `ring`/`flash` (затухающие ответы), `follow`,
  `flame`, `drum`/`drumMotion`.
- `crack` и `plate` — со своим шейдером: клей (слой 1) виден левее края `u_edge`; пыль (слой 1) сходит пятнами по шуму
  до `u_clean`.
- `box` рисует выдвигаемый ящичек последним (рисунок читает `drawer`), чтобы выдвинутый был перед соседями.
- `brackets`: половины верёвки нарисованы ровно и поворачиваются/тянутся (`rotate`, `scaleX`) к грузу.
- `shells`: отвечает та ракушка, на которую сменился `shell`; повторное касание той же — через `none`.
- `bubbles` — на тех же метрах, что `sockets` (та же точка привязки), и рисуется перед ним (`inFront`); `held` —
  пузырь гаснет, его точка остаётся там, где он был виден.
