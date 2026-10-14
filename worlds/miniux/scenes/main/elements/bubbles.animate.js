// each bubble: free — floats round its loop; held — not seen (the finger carries it); s1..s3 — settles into that
// socket of `sockets` (same place, same metres). Its point goes with it (held: where it was last seen)
if (!e.lib.show(e, "bubbles")) return;
// loop centre, radii, turns a second, phase
const P = [
  [-0.45, -0.7, 0.15, 0.12, 0.31, 0],
  [0, -0.85, 0.12, 0.08, -0.26, 2],
  [0.45, -0.65, 0.15, 0.12, 0.37, 4],
];
const S = { s1: [-0.4, -0.2], s2: [0, -0.2], s3: [0.4, -0.2] };
for (let i = 0; i < 3; i++) {
  const n = i + 1;
  const [cx, cy, rx, ry, w, ph] = P[i];
  const st = e.state["bubble" + n] ?? "free";
  let tx = cx + rx * Math.cos(w * e.t + ph) + 0.015 * e.anim.noise(e.t * 0.6, n);
  let ty = cy + ry * Math.sin(w * e.t + ph) + 0.015 * e.anim.noise(e.t * 0.5, n + 5);
  if (S[st]) {
    tx = S[st][0];
    ty = S[st][1];
  }
  const held = st === "held";
  const x = held ? (e.mem["x" + n] ?? tx) : e.lib.follow(e, "x" + n, tx, 5);
  const y = held ? (e.mem["y" + n] ?? ty) : e.lib.follow(e, "y" + n, ty, 5);
  const b = e.layer("b" + n);
  b.x = x - cx;
  b.y = y - cy;
  b.alpha = e.lib.follow(e, "a" + n, held ? 0 : 1, 12);
  b.scale = 1 + 0.04 * Math.sin(e.t * 2.2 + n);
  e.at(x, y, "b" + n);
}
