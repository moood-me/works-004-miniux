// a knock: the leaf trembles; a knock back from inside: a harder jolt and the light under the door flares; door_open
// swings the leaf open on its hinge
const sk = e.lib.since(e, "door_knocks");
const sr = e.lib.since(e, "door_reply");
if (!e.lib.show(e, "door")) return;
const open = e.lib.clamp01(e.state.door_open);
const leaf = e.layer("leaf");
leaf.scaleX = 1 - 0.82 * open;
leaf.x = 0.006 * e.lib.ring(sk, 60, 9) + 0.022 * e.lib.ring(sr, 36, 5);
leaf.rotate = 0.018 * e.lib.ring(sr, 28, 5);
const f = e.lib.flash(sr, 2.2);
e.layer("strip").alpha = f;
e.glow("strip", f);
