// A lantern on a wall hook: it swings as `wind` blows (animate), its flame grows from a spark with `lantern`
if (!e.lib.show(e, "lantern")) return;
g.fillStyle = "#4a4d52";
g.fillRect(-0.03, -0.84, 0.06, 0.12);
g.fillRect(-0.03, -0.75, 0.06, 0.03);
// the lantern, hanging from (0, -0.72)
e.layer("body", { pivot: [0, -0.72] }, (g) => {
  g.strokeStyle = "#3e4146";
  g.lineWidth = 0.014;
  g.beginPath();
  g.arc(0, -0.695, 0.025, 0, Math.PI * 2);
  g.stroke();
  g.fillStyle = "#3e4146";
  g.beginPath();
  g.moveTo(-0.035, -0.665);
  g.lineTo(0.035, -0.665);
  g.lineTo(0.1, -0.6);
  g.lineTo(-0.1, -0.6);
  g.closePath();
  g.fill();
  g.fillStyle = "#f7efd8";
  g.fillRect(-0.085, -0.6, 0.17, 0.29);
  g.fillStyle = "#3e4146";
  g.fillRect(-0.09, -0.6, 0.014, 0.29);
  g.fillRect(0.076, -0.6, 0.014, 0.29);
  g.fillRect(-0.1, -0.31, 0.2, 0.04);
  g.fillRect(-0.015, -0.35, 0.03, 0.04);
});
// the flame on its wick at (0, -0.35): turned, moved and grown by animate
e.layer("flame", { pivot: [0, -0.35] }, (g) => {
  e.lib.flame(g, 0, -0.35, 0.035, 0.15);
  e.light(0, -0.41, 0.3, "#ffc060", 1, "flame");
});
