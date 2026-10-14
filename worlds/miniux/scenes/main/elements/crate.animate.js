// `crate` 0 — where it stands, 1 — on its outline 0.7 m to the right; heavy: it leans back a little as it is dragged
if (!e.lib.show(e, "crate")) return;
const k = e.lib.clamp01(e.state.crate);
const v = Math.max(-1, Math.min(1, e.speed("crate")));
const c = e.layer("crate");
c.x = 0.7 * k;
c.rotate = -0.12 * v;
e.at(-0.35 + 0.7 * k, -0.26, "handle");
