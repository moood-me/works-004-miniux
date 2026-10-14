// A board with a crack running across it, left to right through seven points p0..p6; glue (a layer) fills the crack
// from its left end as `crack` grows — the shader shows the glue left of the edge animate sets
if (!e.lib.show(e, "crack")) return;
const P = [
  [-0.6, -0.36],
  [-0.4, -0.42],
  [-0.2, -0.31],
  [0, -0.4],
  [0.2, -0.3],
  [0.4, -0.41],
  [0.6, -0.34],
];
g.fillStyle = "#7a5534";
g.fillRect(-0.6, -0.1, 0.08, 0.1);
g.fillRect(0.52, -0.1, 0.08, 0.1);
g.fillStyle = "#d2a873";
g.fillRect(-0.75, -0.62, 1.5, 0.52);
g.strokeStyle = "#c09460";
g.lineWidth = 0.008;
for (let i = 0; i < 6; i++) {
  const y = -0.58 + i * 0.085;
  g.beginPath();
  g.moveTo(-0.75, y);
  g.bezierCurveTo(-0.3, y + 0.02, 0.2, y - 0.02, 0.75, y + 0.01);
  g.stroke();
}
const line = (g) => {
  g.beginPath();
  g.moveTo(-0.68, -0.35);
  for (const [x, y] of P) g.lineTo(x, y);
  g.lineTo(0.68, -0.35);
  g.stroke();
};
g.strokeStyle = "#3a2414";
g.lineWidth = 0.02;
g.lineJoin = "round";
line(g);
P.forEach(([x, y], i) => e.at(x, y, "p" + i));
// the glue along the crack (shown by the shader up to the edge)
e.layer("glue", {}, (g) => {
  g.lineJoin = "round";
  g.lineCap = "round";
  g.strokeStyle = "#e8a838";
  g.lineWidth = 0.036;
  line(g);
  g.strokeStyle = "#ffe08a";
  g.lineWidth = 0.012;
  line(g);
});
