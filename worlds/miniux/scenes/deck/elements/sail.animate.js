// `sail` 0 — down on the boom, 1 — hoisted: the cloth grows up from the boom, the gaff rides its head; the point
// "cloth" a third of the way up the luff, 0.6 m aft of the mast
const s = 0.06 + 0.94 * e.lib.clamp01(e.state.sail);
e.layer("cloth").scaleY = s;
e.layer("gaff").y = 5.0 * (1 - s);
e.at(-0.6, -3.0 - 1.5 * s, "cloth");
