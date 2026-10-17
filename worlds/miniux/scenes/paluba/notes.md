# Deck (`paluba`) — miniux's playground: a camera that moves, and an insert

A small sailing ship seen from the stern forward (the eye 1.7 m above the deck, 1.2 m to starboard of the centreline),
sea to the horizon (the horizon at 0.55 of the frame), and a kilometre ahead a lighthouse on a rock, a far shore behind
it. Even daylight (`ambient` 1, no lamps), a light haze.

A `picture` camera, `on: "ship"` — it moves and turns with the ship. The ship is three unseen supports one on another:
`course` (its place and turn in the world: `ship_x`, `ship_d`, `ship_f`) → `hull` (the keel 2 m under the deck, the
heel `heel`) → `ship` (the deck's frame: its origin is the eye's place, `across` — toward the starboard side,
`distance` — toward the bow). Everything of the ship is `on: ship`.

`script.js` sails the ship itself: `ship_f = 180 + 25 × heading` (kept with `heading` while it moves); each second it
moves `ship_x`/`ship_d` forward along the bow at 1.2 m/s × `under_way` (it stops 300 m from the lighthouse — some ten
minutes under way); it rocks `heel` to one side, then the other (an amplitude of 1.5° × (1 + 2 × under_way) × `roll`).
These four keys the game leaves alone. The sea runs past because the ship really goes over the sea: the wave crests are
the sea's shader in its metres, standing in the world.

| Key | What |
| --- | --- |
| `heading` −1..1 | the bow against the lighthouse; +1 — the bow 25° to the right, the lighthouse goes left |
| `on_course` 0..1 | the lighthouse shines brighter (a halo, rays), the lantern on the bow is lit |
| `under_way` 0..1 | under way / standing; it rocks more under way |
| `roll` 0..1 | how hard it rocks |
| `sail` 0..1 | the sail lowered onto the boom → hoisted to the top (the gaff at its head) |
| `bell_hits` | a counter: the bell swings and rings |
| `closeup` 0..1 | the insert: the belaying pins close up |
| `rig1..rig4` 0..1 | in the insert: a line hanging free → taken round in a figure of eight and made fast |

Points (by calculation; x — a share of the 16:9 scene, y — of the frame):
- `bow#stem` — the bow (the top of the stem): (0.455, 0.60);
- `lighthouse#light` — the lighthouse's light: (0.50, 0.49) at heading 0; at ±1 — x 0.24 / 0.76; nearer the lighthouse —
  higher (at 300 m — y ≈ 0.35);
- `sail#cloth` — on the sail by the mast, a third of its height up; moves with it: (0.41, 0.25) hoisted, (0.41, 0.40)
  lowered;
- `bell#bell` — the bell on its frame 3 m before the eye, to the left: (0.31, 0.49);
- in the insert (the iris — an oval centred at (0.889, 0.42) of the scene's heights, radii 0.5 × 0.3): `closeup#k1..k4`
  — (0.30, 0.50), (0.43, 0.50), (0.57, 0.50), (0.70, 0.50).
The rocking shifts the ship's points by fractions of a percent.

The mast and the sail are at the centreline (left of the eye); the boom is swung out to the left, 3 m above the deck, so
the lighthouse is seen under it even when turning left. The bell is on its frame 3 m before the eye, 1 m to the left
(larger; it does not cover the sail's point).

Accents (the second round): the head of the stem is a big red disc in a white rim with a white middle (the bow to steer
by; the lantern is set out on a bracket to the right, not hiding it); in the insert — a dark bulwark and light pins and
lines.
