// Three little oil lamps in a row, each a wick with its flame: wick1..wick3 0 — a small quiet flame, 1 — it smokes,
// a tall sooty flame darting, smoke over it (animate)
if (!e.lib.show(e, "wicks")) return;
const X = [-0.45, 0, 0.45];
X.forEach((x, i) => {
  const n = i + 1;
  g.fillStyle = "#c9a24a";
  g.beginPath();
  g.ellipse(x, -0.06, 0.12, 0.05, 0, 0, Math.PI);
  g.fill();
  g.fillStyle = "#b08a38";
  g.beginPath();
  g.ellipse(x, -0.06, 0.12, 0.025, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#a07a30";
  g.fillRect(x - 0.05, -0.02, 0.1, 0.02);
  g.strokeStyle = "#333333";
  g.lineWidth = 0.01;
  g.beginPath();
  g.moveTo(x, -0.07);
  g.lineTo(x, -0.2);
  g.stroke();
  // smoke over it
  e.layer("smoke" + n, { pivot: [x, -0.24] }, (g) => {
    g.fillStyle = "#8e8e8e";
    for (let k = 0; k < 6; k++) {
      const y = -0.36 - k * 0.1;
      const dx = 0.03 * Math.sin(k * 1.9 + n);
      g.globalAlpha = 0.55 - k * 0.07;
      g.beginPath();
      g.ellipse(x + dx, y, 0.04 + k * 0.012, 0.05 + k * 0.006, 0, 0, Math.PI * 2);
      g.fill();
    }
    g.globalAlpha = 1;
  });
  // the quiet flame
  e.layer("calm" + n, { pivot: [x, -0.2] }, (g) => {
    e.lib.flame(g, x, -0.2, 0.022, 0.08);
    e.light(x, -0.23, 0.12, "#ffd080", 0.8, "f" + n);
  });
  // the sooty flame: taller, redder, ragged
  e.layer("soot" + n, { pivot: [x, -0.2] }, (g) => {
    g.fillStyle = "#e0602a";
    g.beginPath();
    g.moveTo(x, -0.19);
    g.bezierCurveTo(x - 0.05, -0.22, x - 0.04, -0.3, x - 0.01, -0.36);
    g.lineTo(x + 0.005, -0.32);
    g.lineTo(x + 0.02, -0.38);
    g.bezierCurveTo(x + 0.04, -0.3, x + 0.05, -0.22, x, -0.19);
    g.fill();
    g.fillStyle = "#ffb040";
    g.beginPath();
    g.moveTo(x, -0.2);
    g.bezierCurveTo(x - 0.025, -0.23, x - 0.015, -0.29, x, -0.31);
    g.bezierCurveTo(x + 0.015, -0.29, x + 0.025, -0.23, x, -0.2);
    g.fill();
  });
  e.at(x, -0.24, "w" + n);
});
