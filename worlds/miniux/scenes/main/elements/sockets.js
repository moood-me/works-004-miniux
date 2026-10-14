// A board with three sockets (s1, s2, s3); in "sockets" also a peg — lying on the table to the left, or standing
// in the socket `peg` names. In "bubbles" the board alone: the bubbles settle in its sockets
if (!e.lib.show(e, "sockets", "bubbles")) return;
const X = [-0.4, 0, 0.4];
g.fillStyle = "#7a5534";
g.fillRect(-0.5, -0.04, 0.08, 0.04);
g.fillRect(0.42, -0.04, 0.08, 0.04);
g.fillStyle = "#c39563";
g.fillRect(-0.56, -0.35, 1.12, 0.31);
g.strokeStyle = "#9a6d40";
g.lineWidth = 0.014;
g.strokeRect(-0.56, -0.35, 1.12, 0.31);
X.forEach((x, i) => {
  g.fillStyle = "#e0bd8c";
  g.beginPath();
  g.arc(x, -0.2, 0.075, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#2e2016";
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
    g.fillStyle = "#e9c88f";
    g.beginPath();
    g.arc(at, -0.205, 0.045, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#f6dfb0";
    g.beginPath();
    g.arc(at - 0.012, -0.217, 0.016, 0, Math.PI * 2);
    g.fill();
  } else {
    // the peg lying on the table
    g.fillStyle = "#d9b47a";
    g.fillRect(-0.85, -0.075, 0.24, 0.05);
    g.fillStyle = "#e9c88f";
    g.beginPath();
    g.ellipse(-0.61, -0.05, 0.022, 0.036, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#a9814c";
    g.fillRect(-0.85, -0.035, 0.24, 0.01);
  }
  e.at(-0.72, -0.05, "peg");
}
