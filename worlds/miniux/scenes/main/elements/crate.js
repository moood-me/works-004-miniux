// A heavy crate on the table and, to its right, its outline in chalk — where it is to be dragged: `crate` moves it
// there (animate), its rope handle with it
if (!e.lib.show(e, "crate")) return;
// the chalk outline, in dashes
g.strokeStyle = "#f4f1ea";
g.lineWidth = 0.014;
const dash = (x0, y0, x1, y1) => {
  const n = Math.round(Math.hypot(x1 - x0, y1 - y0) / 0.06);
  for (let i = 0; i < n; i += 2) {
    g.beginPath();
    g.moveTo(x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n);
    g.lineTo(x0 + ((x1 - x0) * (i + 1)) / n, y0 + ((y1 - y0) * (i + 1)) / n);
    g.stroke();
  }
};
dash(0.1, -0.4, 0.6, -0.4);
dash(0.6, -0.4, 0.6, -0.01);
dash(0.6, -0.01, 0.1, -0.01);
dash(0.1, -0.01, 0.1, -0.4);
e.at(0.35, -0.26, "goal");
// the crate
e.layer("crate", { pivot: [-0.35, 0] }, (g) => {
  g.fillStyle = "#a0703c";
  g.fillRect(-0.6, -0.4, 0.5, 0.4);
  g.fillStyle = "#8a5d30";
  for (let i = 1; i < 4; i++) g.fillRect(-0.6, -0.4 + i * 0.1, 0.5, 0.01);
  g.fillStyle = "#6e4826";
  g.fillRect(-0.6, -0.4, 0.05, 0.4);
  g.fillRect(-0.15, -0.4, 0.05, 0.4);
  g.fillRect(-0.6, -0.4, 0.5, 0.04);
  g.fillRect(-0.6, -0.04, 0.5, 0.04);
  // the rope handle
  g.strokeStyle = "#e0c590";
  g.lineWidth = 0.022;
  g.beginPath();
  g.ellipse(-0.35, -0.26, 0.08, 0.04, 0, 0, Math.PI);
  g.stroke();
  g.fillStyle = "#4a4a4a";
  g.fillRect(-0.44, -0.275, 0.025, 0.03);
  g.fillRect(-0.285, -0.275, 0.025, 0.03);
});
