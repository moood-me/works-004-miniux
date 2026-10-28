// screw1..screw4 0 — out, 1 — driven home: the slot turns two full turns, the head seats (a little smaller, flush),
// the shank under it goes in
if (!e.lib.show(e, "screw", "screws")) return;
const count = e.state.demo === "screw" ? 1 : 4;
for (let n = 1; n <= count; n++) {
  const k = e.lib.clamp01(e.state["screw" + n]);
  e.layer("shank" + n).scaleY = 1 - k;
  const seat = 1 - 0.1 * k;
  e.layer("head" + n).scale = seat;
  const slot = e.layer("slot" + n);
  slot.scale = seat;
  slot.rotate = k * 4 * Math.PI;
}
