// the peg is where `peg` says, at once: lying (none), under the finger (held: peg_u, peg_v — from s1 along s1→s3,
// and up, in |s1→s3|), or in a socket (its head painted there; the lying peg hidden). Its point is where it is seen
if (!e.lib.show(e, "sockets")) return;
const REST = [-0.72, -0.05];
const S = { s1: [-0.4, -0.2], s2: [0, -0.2], s3: [0.4, -0.2] };
const p = e.state.peg;
const peg = e.layer("peg");
let x = REST[0];
let y = REST[1];
if (p === "held") {
  x = -0.4 + 0.8 * (Number(e.state.peg_u) || 0);
  y = -0.2 - 0.8 * (Number(e.state.peg_v) || 0);
} else if (S[p]) {
  x = S[p][0];
  y = S[p][1];
}
peg.x = S[p] ? 0 : x - REST[0];
peg.y = S[p] ? 0 : y - REST[1];
peg.alpha = S[p] ? 0 : 1;
peg.scale = p === "held" ? 1.12 : 1;
e.at(x, y, "peg");
