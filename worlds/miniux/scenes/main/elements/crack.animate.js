// the glue's edge: from just before the crack's left end (0) to past its right end (1)
if (!e.lib.show(e, "crack")) return;
e.uniform("edge", -0.7 + 1.4 * e.lib.clamp01(e.state.crack));
