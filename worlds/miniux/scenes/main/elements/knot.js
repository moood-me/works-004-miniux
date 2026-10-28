// A rope stretched between two posts, tied in a knot in the middle: `knot` loosens it (the loops grow, the rope
// sags — animate); `knot_off` true — it has come apart, each half hanging from its post
if (!e.lib.show(e, "knot")) return;
g.fillStyle = "#6a5a4c";
g.fillRect(-0.65, -0.55, 0.06, 0.55);
g.fillRect(0.59, -0.55, 0.06, 0.55);
g.fillStyle = "#5e3f24";
g.fillRect(-0.665, -0.57, 0.09, 0.03);
g.fillRect(0.575, -0.57, 0.09, 0.03);
const rope = (g) => {
  g.strokeStyle = "#d9b06a";
  g.lineWidth = 0.026;
  g.lineCap = "round";
};
if (e.state.knot_off === true) {
  rope(g);
  g.beginPath();
  g.moveTo(-0.62, -0.45);
  g.quadraticCurveTo(-0.5, -0.4, -0.5, -0.12);
  g.moveTo(0.62, -0.45);
  g.quadraticCurveTo(0.5, -0.4, 0.5, -0.12);
  g.stroke();
  e.at(0, -0.45, "knot");
  return;
}
e.layer("rope_l", { pivot: [-0.62, -0.45] }, (g) => {
  rope(g);
  g.beginPath();
  g.moveTo(-0.62, -0.45);
  g.lineTo(0, -0.45);
  g.stroke();
});
e.layer("rope_r", { pivot: [0.62, -0.45] }, (g) => {
  rope(g);
  g.beginPath();
  g.moveTo(0.62, -0.45);
  g.lineTo(0, -0.45);
  g.stroke();
});
e.layer("knot", { pivot: [0, -0.45] }, (g) => {
  g.fillStyle = "#f0c87a";
  g.beginPath();
  g.arc(0, -0.45, 0.05, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = "#8a6a38";
  g.lineWidth = 0.016;
  g.beginPath();
  g.ellipse(-0.035, -0.46, 0.04, 0.03, -0.5, 0, Math.PI * 2);
  g.stroke();
  g.beginPath();
  g.ellipse(0.035, -0.44, 0.04, 0.03, -0.5, 0, Math.PI * 2);
  g.stroke();
  g.strokeStyle = "#c9a46a";
  g.lineWidth = 0.02;
  g.beginPath();
  g.moveTo(0.02, -0.42);
  g.quadraticCurveTo(0.05, -0.36, 0.03, -0.32);
  g.stroke();
});
