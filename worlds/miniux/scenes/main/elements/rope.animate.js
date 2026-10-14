// `rope` 0 — the weight where it sits, 1 — its loop on the hook: straight along the way between the two points
if (!e.lib.show(e, "rope")) return;
const k = e.lib.clamp01(e.state.rope);
const dx = 1.0; // from (-0.5, -0.28) to the hook (0.5, -0.85)
const dy = -0.57;
const w = e.layer("weight");
w.x = k * dx;
w.y = k * dy;
e.at(-0.5 + k * dx, -0.28 + k * dy, "weight");
