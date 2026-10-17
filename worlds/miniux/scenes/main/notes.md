# Workshop (`main`) — miniux's playground of gestures

A table by a wall, a `picture` camera standing still (the eye at 1.7 m, the horizon at 0.3 of the frame). Even light:
`ambient` 1, no lamps — things are seen as they are painted. The wall is a card 3 m away (light, cold), the table top a
plane 1 m high (pale wood; from 1.4 to 3 m deep), its front edge a card at 1.4 m. The things on the table are cards
facing the camera: the small ones (the bell, the bellows, the candle, the wicks, the knot, the sockets and the bubbles,
the crack, the screws, the shells, the drums, the hourglass) nearer, at 1.8 m, larger; the box, the crate, the plaque at
2.2 m; the things on the wall at 2.95 m; `floor` and `boat` are cards with a `tilt` (leaning toward the wall), so that
what is flat on them is seen large.

The key `demo` picks the demonstration: each thing paints itself (and its points) only in its own demonstrations
(`lib.show`), the rest paint nothing; a change of `demo` repaints at once. Everything smooth is moved by the layers in
`animate`; the paintings read only the string and boolean keys (`demo`, `drawer`, `peg`, `knot_off`, `floor_found`,
`shell_odd`, `shell_found`). The counters (`*_hits`, `door_knocks`, `door_reply`) are noticed by `lib.since` through
`e.mem`: the value the scene opened with is no hit.

| demo | thing | points | keys |
| --- | --- | --- | --- |
| none | — | — | — |
| bell | `bell` | `bell#top` | `bell_hits`, `wind` (sways the bell) |
| box | `box` | `box#front` | `drawer`, `drawer_open` |
| door | `door` | `door#knock`, `door#away` (the plaque to its right) | `door_knocks`, `door_reply`, `door_open` |
| bellows, breath | `bellows` | `bellows#handle` (moves with the handle) | `bellows` |
| lantern | `lantern` | `lantern#flame` (moves with the flame) | `lantern`, `wind` |
| candle | `candle` | `candle#flame` | `candle`, `candle_shake` |
| wicks | `wicks` | `wicks#w1..w3` | `wick1..wick3` |
| brackets | `brackets` | `brackets#left`, `brackets#right` | `climb`, `grip` |
| rope | `rope` | `rope#weight` (moves with the weight), `rope#hook` | `rope` |
| shutter | `shutter` | `shutter#handle` (moves with the shutter), `shutter#top` | `shutter` |
| crate | `crate` | `crate#handle` (moves with the crate), `crate#goal` | `crate` |
| knot | `knot` | `knot#knot` | `knot`, `knot_off` |
| sockets | `sockets` | `sockets#peg` (where the peg is painted), `sockets#s1..s3` | `peg`, `peg_u`, `peg_v` |
| bubbles | `bubbles` + `sockets` | `bubbles#b1..b3` (where the bubble is painted), `sockets#s1..s3` | `bubble1..3`, `bubbleN_u`, `bubbleN_v` |
| crack | `crack` | `crack#p0..p6` | `crack` |
| screw / screws | `screws` | `screws#s1` (in screw — one, in the middle) / `screws#s1..s4`, `screws#leave` | `screw1..screw4` |
| plate | `plate` | `plate#dust` | `plate` |
| floor | `floor` | `floor#area`, `floor#hidden` | `floor_found` |
| shells | `shells` | `shells#s1..s3` | `shell`, `shell_odd`, `shell_found` |
| drum | `drum` | `drum#skin` | `drum_hits` |
| drum2 | `drum`, `drum2` | `drum#skin`, `drum2#skin` | `drum_hits`, `drum2_hits` |
| boat | `boat` | `boat#bow` (moves with the bow), `boat#scale` | `boat_heading`, `zone_center`, `zone_kind`, `zone_lit` |
| hourglass | `hourglass` | `hourglass#glass` | `sand` |

Where the points are in the frame (by calculation: the focus is the frame's height, the horizon 0.3; x — a share of the
16:9 scene): all within x 0.28…0.69, y 0.17…0.66; neighbours in one demonstration no closer than 0.1 of the frame's
height (the bubbles on their circles — about 0.1).

A thing in hand (`peg` = held, `bubbleN` = held): the thing is painted under the finger — at the point u, v: the origin is
`sockets#s1`, u — along from `s1` to `s3` (u = 1 at `s3`), v — up, in the same length |s1→s3|. The board with the sockets
and the bubbles are one and the same upright card facing the camera (no tilt, 1.8 m), so u, v from the screen positions
of s1, s3 and the finger are exact. In the card's metres: x = −0.4 + 0.8u, y = −0.2 − 0.8v. The thing is moved by a
layer in `animate`; changes between states are at once, with no flight; a bubble let go (`free`) floats on from that
place, slowly coming back to its circle.

Accents: each thing's target is its most contrasting part (the bell's clapper, the drawers' handles, the copper
ring-knocker on the door, the red handle of the bellows, the copper handle of the shutter, the light heads of the screws
on a dark plate, the boat's red arrow). The boat: a dark board; the red arrow runs from the axis through the bow to the
scale — where it points, there the bow is held; the zone is a bright light band, the firefly a glowing yellow-green
(“here”); the bumblebee in a red ring (“keep away”).

How it is made:
- `lib.js`: `show`, `since` (seconds since the counter last changed), `ring`/`flash` (dying answers), `follow`,
  `flame`, `drum`/`drumMotion`.
- `crack` and `plate` have a shader of their own: the glue (layer 1) is seen left of the edge `u_edge`; the dust
  (layer 1) comes off in patches by noise up to `u_clean`.
- `box` paints the drawer that slides out last (the painting reads `drawer`), so that the one pulled out is in front of
  its neighbours.
- `brackets`: the rope's halves are painted straight and turn/stretch (`rotate`, `scaleX`) toward the weight.
- `shells`: the shell that `shell` changed to answers; a second touch of the same one goes through `none`. A plain one
  rocks; “the odd one” opens slightly for a second (a pearl under it) in a warm light — the difference is seen with the
  eyes.
- `bubbles` are on the same metres as `sockets` (the same anchor point) and painted in front of it (`inFront`); `held` —
  the bubble fades, its point stays where it was seen.
