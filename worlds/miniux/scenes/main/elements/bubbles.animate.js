// each bubble by its key: free — floats round its own small loop (let go elsewhere, it floats on from there, drifting
// slowly back to its loop); held — exactly under the finger (bubbleN_u, bubbleN_v: from sockets#s1 along s1→s3, and
// up, in |s1→s3| — the same card's metres), a little larger; s1..s3 — in that socket of `sockets`. Its point goes with
// it, always where it is seen
if (!e.lib.show(e, "bubbles")) return;
// loop centre, radii, turns a second, phase
const P = [
  [-0.45, -0.7, 0.15, 0.12, 0.31, 0],
  [0, -0.85, 0.12, 0.08, -0.26, 2],
  [0.45, -0.65, 0.15, 0.12, 0.37, 4],
];
const S = { s1: [-0.4, -0.2], s2: [0, -0.2], s3: [0.4, -0.2] };
const m = e.mem;
for (let i = 0; i < 3; i++) {
  const n = i + 1;
  const [cx, cy, rx, ry, w, ph] = P[i];
  const st = e.state["bubble" + n] ?? "free";
  const lx = cx + rx * Math.cos(w * e.t + ph) + 0.015 * e.anim.noise(e.t * 0.6, n);
  const ly = cy + ry * Math.sin(w * e.t + ph) + 0.015 * e.anim.noise(e.t * 0.5, n + 5);
  let x = lx;
  let y = ly;
  if (st === "held") {
    x = -0.4 + 0.8 * (Number(e.state["bubble" + n + "_u"]) || 0);
    y = -0.2 - 0.8 * (Number(e.state["bubble" + n + "_v"]) || 0);
  } else if (S[st]) {
    x = S[st][0];
    y = S[st][1];
  } else {
    // free: on from where it was, the offset fading
    if (m["st" + n] !== undefined && m["st" + n] !== "free" && m["x" + n] !== undefined) {
      m["ox" + n] = m["x" + n] - lx;
      m["oy" + n] = m["y" + n] - ly;
    }
    const fade = Math.exp(-0.35 * e.dt);
    m["ox" + n] = (m["ox" + n] ?? 0) * fade;
    m["oy" + n] = (m["oy" + n] ?? 0) * fade;
    x = lx + m["ox" + n];
    y = ly + m["oy" + n];
  }
  m["st" + n] = st;
  m["x" + n] = x;
  m["y" + n] = y;
  const b = e.layer("b" + n);
  b.x = x - cx;
  b.y = y - cy;
  b.alpha = 1;
  b.scale = (st === "held" ? 1.15 : 1) * (1 + 0.04 * Math.sin(e.t * 2.2 + n));
  e.at(x, y, "b" + n);
}
