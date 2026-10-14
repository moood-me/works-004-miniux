// A small window in the wall with a shutter that slides up its rails: `shutter` lifts it (animate); its handle at
// the shutter's foot goes with it, up to the mark at the top
if (!e.lib.show(e, "shutter")) return;
g.fillStyle = "#7a5534";
g.fillRect(-0.37, -0.93, 0.74, 0.62);
// the day outside
const sky = g.createLinearGradient(0, -0.87, 0, -0.36);
sky.addColorStop(0, "#a9d3f0");
sky.addColorStop(1, "#e6f3fb");
g.fillStyle = sky;
g.fillRect(-0.31, -0.87, 0.62, 0.51);
g.fillStyle = "#9cc48a";
g.fillRect(-0.31, -0.46, 0.62, 0.1);
// the rails, up past the window
g.fillStyle = "#5a3d24";
g.fillRect(-0.36, -1.45, 0.035, 1.12);
g.fillRect(0.325, -1.45, 0.035, 1.12);
// the mark the handle goes up to
g.strokeStyle = "#5a3d24";
g.lineWidth = 0.016;
g.beginPath();
g.moveTo(-0.07, -0.88);
g.lineTo(0.07, -0.88);
g.stroke();
e.at(0, -0.88, "top");
// the shutter and its handle
e.layer("board", {}, (g) => {
  g.fillStyle = "#b07d45";
  g.fillRect(-0.325, -0.875, 0.65, 0.53);
  g.fillStyle = "#9a6a38";
  for (let i = 1; i < 4; i++) g.fillRect(-0.325, -0.875 + i * 0.1325, 0.65, 0.012);
  g.strokeStyle = "#e8b53a";
  g.lineWidth = 0.028;
  g.beginPath();
  g.arc(0, -0.4, 0.05, 0, Math.PI);
  g.stroke();
  g.fillStyle = "#3f4247";
  g.fillRect(-0.06, -0.415, 0.025, 0.025);
  g.fillRect(0.035, -0.415, 0.025, 0.025);
});
