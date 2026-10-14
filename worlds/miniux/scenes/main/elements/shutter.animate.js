// `shutter` 0 — shut, 1 — raised: the board slides up by half a metre, its handle with it
if (!e.lib.show(e, "shutter")) return;
const k = e.lib.clamp01(e.state.shutter);
e.layer("board").y = -0.5 * k;
e.at(0, -0.38 - 0.5 * k, "handle");
