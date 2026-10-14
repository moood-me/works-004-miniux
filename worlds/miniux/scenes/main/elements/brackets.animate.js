// `climb` 0..1 raises the weight; each rope half turns from its bracket to the weight and is as long as the way;
// `grip` lights the bracket that holds
if (!e.lib.show(e, "brackets")) return;
const BL = [-0.75, -0.75];
const BR = [0.75, -0.75];
const L0 = Math.hypot(0.75, 0.45);
const py = -0.3 - 0.35 * e.lib.clamp01(e.state.climb);
const dy = py - BL[1];
const len = Math.hypot(0.75, dy);
const left = e.layer("rope_l");
left.rotate = Math.atan2(dy, 0 - BL[0]);
left.scaleX = len / L0;
const right = e.layer("rope_r");
right.rotate = Math.atan2(dy, 0 - BR[0]) - Math.PI;
right.scaleX = len / L0;
e.layer("weight").y = py + 0.3;
e.layer("lit_left").alpha = e.lib.follow(e, "gl", e.state.grip === "left" ? 1 : 0, 14);
e.layer("lit_right").alpha = e.lib.follow(e, "gr", e.state.grip === "right" ? 1 : 0, 14);
