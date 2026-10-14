// Two iron brackets on the wall, left and right, and a rope between them with a weight hanging from its middle:
// `climb` raises the weight (the rope's halves turn and shorten, animate); `grip` lights the bracket that holds
if (!e.lib.show(e, "brackets")) return;
const BL = [-0.75, -0.75];
const BR = [0.75, -0.75];
const P0 = [0, -0.3];
const L0 = Math.hypot(0.75, 0.45);
const bracket = (g, x, plate, ring) => {
  g.fillStyle = plate;
  g.fillRect(x - 0.045, -0.88, 0.09, 0.22);
  g.strokeStyle = ring;
  g.lineWidth = 0.022;
  g.beginPath();
  g.arc(x, -0.75, 0.04, 0, Math.PI * 2);
  g.stroke();
};
bracket(g, BL[0], "#4d4f55", "#3a3c40");
bracket(g, BR[0], "#4d4f55", "#3a3c40");
// the bracket that holds, lit
e.layer("lit_left", {}, (g) => bracket(g, BL[0], "#f3d58a", "#ffe9a8"));
e.layer("lit_right", {}, (g) => bracket(g, BR[0], "#f3d58a", "#ffe9a8"));
// the rope's halves, painted level from each bracket; animate turns them to the weight and stretches them
e.layer("rope_l", { pivot: BL }, (g) => {
  g.strokeStyle = "#c9a46a";
  g.lineWidth = 0.022;
  g.beginPath();
  g.moveTo(BL[0], BL[1]);
  g.lineTo(BL[0] + L0, BL[1]);
  g.stroke();
});
e.layer("rope_r", { pivot: BR }, (g) => {
  g.strokeStyle = "#c9a46a";
  g.lineWidth = 0.022;
  g.beginPath();
  g.moveTo(BR[0], BR[1]);
  g.lineTo(BR[0] - L0, BR[1]);
  g.stroke();
});
// the weight, its ring where the halves meet
e.layer("weight", {}, (g) => {
  g.strokeStyle = "#3a3c40";
  g.lineWidth = 0.018;
  g.beginPath();
  g.arc(P0[0], P0[1] + 0.02, 0.025, 0, Math.PI * 2);
  g.stroke();
  g.fillStyle = "#6d7278";
  g.fillRect(-0.09, P0[1] + 0.045, 0.18, 0.15);
  g.fillStyle = "#858a90";
  g.fillRect(-0.09, P0[1] + 0.045, 0.18, 0.03);
});
e.at(BL[0], BL[1], "left");
e.at(BR[0], BR[1], "right");
