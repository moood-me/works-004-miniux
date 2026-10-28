// struck: it swings on its hook, dying away, and its ring flashes and spreads; the wind (`wind`) sways it too
const s = e.lib.since(e, "bell_hits");
if (!e.lib.show(e, "bell")) return;
const w = e.lib.clamp01(e.state.wind);
e.layer("bell").rotate = 0.32 * e.lib.ring(s, 9, 2.2) + w * (0.22 * Math.sin(e.t * 5.3) + 0.08 * Math.sin(e.t * 8.1 + 1));
const f = e.lib.flash(s, 3.5);
const ring = e.layer("ring");
ring.alpha = f;
ring.scale = 1 + 0.3 * (1 - f);
