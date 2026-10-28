// `bellows` 0 — pressed flat, 1 — full: the leather fills, the top board turns up on its hinge, the handle with it
if (!e.lib.show(e, "bellows", "breath")) return;
const k = e.lib.clamp01(e.state.bellows);
const s = 0.08 + 0.92 * k;
const th = Math.atan(s * Math.tan(0.38));
e.layer("leather").scaleY = s;
e.layer("top").rotate = -th;
// the handle's grip, (0.6, -0.12), turned about the hinge
const c = Math.cos(-th);
const sn = Math.sin(-th);
e.at(-0.3 + 0.9 * c + 0.02 * sn, -0.1 + 0.9 * sn - 0.02 * c, "handle");
