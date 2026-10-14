// struck: it swings on its hook, dying away, and its ring flashes and spreads
const s = e.lib.since(e, "bell_hits");
if (!e.lib.show(e, "bell")) return;
e.layer("bell").rotate = 0.32 * e.lib.ring(s, 9, 2.2);
const f = e.lib.flash(s, 3.5);
const ring = e.layer("ring");
ring.alpha = f;
ring.scale = 1 + 0.3 * (1 - f);
