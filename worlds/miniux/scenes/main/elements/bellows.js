// A forge bellows lying on the table, nozzle to the left: its top board lifts on the hinge at (-0.3, -0.1) and the
// leather fills as `bellows` grows (animate); the handle at the board's right end
if (!e.lib.show(e, "bellows", "breath")) return;
// the block it lies on, the nozzle, the bottom board
g.fillStyle = "#6b4a2c";
g.fillRect(-0.12, -0.06, 0.34, 0.06);
g.fillStyle = "#5d646b";
g.beginPath();
g.moveTo(-0.3, -0.125);
g.lineTo(-0.56, -0.095);
g.lineTo(-0.56, -0.075);
g.lineTo(-0.3, -0.06);
g.closePath();
g.fill();
g.fillStyle = "#a8743f";
g.fillRect(-0.32, -0.1, 0.78, 0.04);
// the leather, painted as wide open; animate presses it down to the board
e.layer("leather", { pivot: [-0.3, -0.1] }, (g) => {
  const top = -0.1 - 0.72 * Math.tan(0.38);
  g.fillStyle = "#7a4a2a";
  g.beginPath();
  g.moveTo(-0.3, -0.1);
  g.lineTo(0.42, -0.1);
  g.lineTo(0.42, top);
  g.closePath();
  g.fill();
  g.strokeStyle = "#5a3418";
  g.lineWidth = 0.01;
  for (let i = 1; i < 4; i++) {
    const x = -0.3 + i * 0.18;
    g.beginPath();
    g.moveTo(x, -0.1);
    g.lineTo(x, -0.1 - (x + 0.3) * Math.tan(0.38));
    g.stroke();
  }
});
// the top board with its handle, lying shut; animate lifts it
e.layer("top", { pivot: [-0.3, -0.1] }, (g) => {
  g.fillStyle = "#b9844b";
  g.fillRect(-0.3, -0.14, 0.76, 0.04);
  g.fillStyle = "#6b4a2c";
  g.fillRect(0.44, -0.13, 0.14, 0.02);
  g.fillStyle = "#c0503a";
  g.fillRect(0.555, -0.155, 0.08, 0.07);
  g.fillStyle = "#e07a60";
  g.fillRect(0.565, -0.15, 0.06, 0.015);
});
