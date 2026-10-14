// the wind swings it on its hook (and the flame leans); `lantern` grows the flame from a spark to full
if (!e.lib.show(e, "lantern")) return;
const w = e.lib.clamp01(e.state.wind);
const lit = e.lib.clamp01(e.state.lantern);
const a = w * (0.1 + 0.24 * Math.sin(e.t * 2.1) + 0.08 * e.anim.noise(e.t * 0.9, 7));
e.layer("body").rotate = a;
// the wick, (0, -0.35), swung about the hook (0, -0.72)
const vy = 0.37;
const x = -vy * Math.sin(a);
const y = -0.72 + vy * Math.cos(a);
const size = 0.15 + 0.85 * lit;
const fl = e.layer("flame");
fl.x = x;
fl.y = y + 0.35;
fl.rotate = 0.5 * a - w * (0.35 + 0.15 * e.anim.noise(e.t * 6, 3)) + 0.03 * e.anim.noise(e.t * 1.7, 5);
fl.scale = size * (1 + 0.06 * e.anim.noise(e.t * 9, 2));
e.glow("flame", 0.1 + 0.9 * lit);
e.at(x, y - 0.07 * size, "flame");
