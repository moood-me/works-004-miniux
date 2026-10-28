// A steel plate with four screws in a row (s1..s4) and below them a paper tag — the quiet "leave" place. Each screw
// by its key 0..1: its slot turns round and its head seats, the shank under it going in (animate). In "screw" only
// one screw, s1, in the middle of a smaller plate
if (!e.lib.show(e, "screw", "screws")) return;
const one = e.state.demo === "screw";
const X = one ? [0] : [-0.54, -0.18, 0.18, 0.54];
const half = one ? 0.26 : 0.72;
g.fillStyle = "#7a5534";
g.fillRect(-half + 0.04, -0.06, 2 * half - 0.08, 0.06);
g.fillStyle = "#7d868f";
g.fillRect(-half, -0.64, 2 * half, 0.58);
g.strokeStyle = "#5d656d";
g.lineWidth = 0.014;
g.strokeRect(-half, -0.64, 2 * half, 0.58);
// the tag
g.strokeStyle = "#7a6a50";
g.lineWidth = 0.006;
g.beginPath();
g.moveTo(0, -0.27);
g.lineTo(0, -0.21);
g.stroke();
g.fillStyle = "#555b60";
g.beginPath();
g.arc(0, -0.27, 0.01, 0, Math.PI * 2);
g.fill();
g.fillStyle = "#f1e6c8";
g.beginPath();
g.moveTo(-0.08, -0.21);
g.lineTo(0.08, -0.21);
g.lineTo(0.08, -0.12);
g.lineTo(-0.08, -0.12);
g.closePath();
g.fill();
g.strokeStyle = "#b8a780";
g.lineWidth = 0.008;
g.stroke();
e.at(0, -0.165, "leave");
X.forEach((x, i) => {
  const n = i + 1;
  // the shank showing under the head while it is out
  e.layer("shank" + n, { pivot: [x, -0.45] }, (g) => {
    g.fillStyle = "#c3c9cf";
    g.fillRect(x - 0.03, -0.45, 0.06, 0.08);
    g.fillStyle = "#8d949b";
    for (let k = 0; k < 4; k++) g.fillRect(x - 0.03, -0.43 + k * 0.016, 0.06, 0.006);
  });
  e.layer("head" + n, { pivot: [x, -0.45] }, (g) => {
    g.fillStyle = "#3e4247";
    g.beginPath();
    g.arc(x, -0.45, 0.064, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#f2f4f6";
    g.beginPath();
    g.arc(x, -0.45, 0.054, 0, Math.PI * 2);
    g.fill();
  });
  e.layer("slot" + n, { pivot: [x, -0.45] }, (g) => {
    g.fillStyle = "#3e4247";
    g.fillRect(x - 0.042, -0.456, 0.084, 0.012);
  });
  e.at(x, -0.45, "s" + n);
});
