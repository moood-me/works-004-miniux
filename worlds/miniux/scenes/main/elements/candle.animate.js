// `candle` grows the flame; `candle_shake` makes it tremble and dart
if (!e.lib.show(e, "candle")) return;
const k = e.lib.clamp01(e.state.candle);
const sh = e.lib.clamp01(e.state.candle_shake);
const fl = e.layer("flame");
const size = (0.2 + 0.8 * k) * (1 + 0.05 * e.anim.noise(e.t * 7, 1));
fl.scaleX = size;
fl.scaleY = size * (1 + 0.25 * sh * e.anim.noise(e.t * 15, 4));
fl.rotate = 0.55 * sh * e.anim.noise(e.t * 9, 1) + 0.03 * e.anim.noise(e.t * 1.3, 2);
fl.x = 0.02 * sh * e.anim.noise(e.t * 13, 3);
e.glow("flame", 0.2 + 0.8 * k);
