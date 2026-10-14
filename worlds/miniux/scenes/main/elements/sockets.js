// A board with three sockets (s1, s2, s3), standing upright and facing the eye (a card with no tilt: the game's
// u, v — from s1 along s1→s3, and up, in |s1→s3| — are this card's own metres). In "sockets" also a peg: lying on
// the table to the left (`peg` none), carried under the finger (held: a layer animate moves to peg_u, peg_v), or
// standing in the socket `peg` names. In "bubbles" the board alone: the bubbles settle in its sockets
if (!e.lib.show(e, "sockets", "bubbles")) return;
const X = [-0.4, 0, 0.4];
g.fillStyle = "#6e4a2a";
g.fillRect(-0.5, -0.04, 0.08, 0.04);
g.fillRect(0.42, -0.04, 0.08, 0.04);
g.fillStyle = "#b07a45";
g.fillRect(-0.56, -0.35, 1.12, 0.31);
g.strokeStyle = "#7a5030";
g.lineWidth = 0.014;
g.strokeRect(-0.56, -0.35, 1.12, 0.31);
X.forEach((x, i) => {
  g.fillStyle = "#e8cfa4";
  g.beginPath();
  g.arc(x, -0.2, 0.078, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#24170e";
  g.beginPath();
  g.arc(x, -0.2, 0.058, 0, Math.PI * 2);
  g.fill();
  e.at(x, -0.2, "s" + (i + 1));
});
if (e.state.demo === "sockets") {
  const at = { s1: X[0], s2: X[1], s3: X[2] }[e.state.peg];
  if (at !== undefined) {
    // the peg standing in its socket: its round head
    g.fillStyle = "#8a5f30";
    g.beginPath();
    g.arc(at, -0.2, 0.058, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#f0d6a0";
    g.beginPath();
    g.arc(at, -0.205, 0.045, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#c0503a";
    g.beginPath();
    g.arc(at, -0.205, 0.018, 0, Math.PI * 2);
    g.fill();
  }
  // the peg itself, painted where it lies (its middle at (-0.72, -0.05)); animate carries it or hides it
  e.layer("peg", { pivot: [-0.72, -0.05] }, (g) => {
    g.fillStyle = "#f0d6a0";
    g.fillRect(-0.85, -0.077, 0.24, 0.054);
    g.fillStyle = "#c79a5c";
    g.fillRect(-0.85, -0.035, 0.24, 0.012);
    g.fillStyle = "#c0503a";
    g.beginPath();
    g.ellipse(-0.6, -0.05, 0.024, 0.038, 0, 0, Math.PI * 2);
    g.fill();
  });
}
