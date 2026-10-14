// `knot` 0 — tight, 1 — loose: the loops swell and stir, the rope sags; come apart (knot_off), it is painted hanging
if (!e.lib.show(e, "knot") || e.state.knot_off === true) return;
const k = e.lib.clamp01(e.state.knot);
const a = 0.1 * k;
e.layer("rope_l").rotate = a;
e.layer("rope_r").rotate = -a;
const sag = 0.62 * Math.sin(a);
const knot = e.layer("knot");
knot.y = sag;
knot.scale = 1 + 0.6 * k;
knot.rotate = 0.12 * k * e.anim.noise(e.t * 2.5, 4);
e.at(0, -0.45 + sag, "knot");
