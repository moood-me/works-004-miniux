// A candle in its holder: the flame grows with `candle`, trembles and darts with `candle_shake` (animate)
if (!e.lib.show(e, "candle")) return;
g.fillStyle = "#c9a24a";
g.beginPath();
g.ellipse(0, -0.02, 0.13, 0.03, 0, 0, Math.PI * 2);
g.fill();
g.fillRect(-0.05, -0.06, 0.1, 0.04);
g.fillStyle = "#f6f0e2";
g.fillRect(-0.035, -0.34, 0.07, 0.29);
g.fillStyle = "#ebe2cc";
g.fillRect(0.012, -0.34, 0.023, 0.29);
g.fillStyle = "#fbf7ee";
g.beginPath();
g.ellipse(-0.012, -0.3, 0.01, 0.035, 0, 0, Math.PI * 2);
g.fill();
g.strokeStyle = "#333333";
g.lineWidth = 0.008;
g.beginPath();
g.moveTo(0, -0.34);
g.lineTo(0, -0.365);
g.stroke();
e.layer("flame", { pivot: [0, -0.36] }, (g) => {
  e.lib.flame(g, 0, -0.36, 0.03, 0.12);
  e.light(0, -0.41, 0.2, "#ffd080", 1, "flame");
});
e.at(0, -0.41, "flame");
