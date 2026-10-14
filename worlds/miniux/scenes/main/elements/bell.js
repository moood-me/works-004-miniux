// A bell on a little gallows stand: struck (bell_hits), it swings on its hook and rings (animate)
if (!e.lib.show(e, "bell")) return;
g.fillStyle = "#7d7266";
g.fillRect(-0.34, -0.04, 0.68, 0.04);
g.fillRect(-0.3, -0.74, 0.045, 0.72);
g.fillRect(0.255, -0.74, 0.045, 0.72);
g.fillRect(-0.33, -0.78, 0.66, 0.05);
// the bell, hanging from its hook at (0, -0.73)
e.layer("bell", { pivot: [0, -0.73] }, (g) => {
  g.strokeStyle = "#4a4a4a";
  g.lineWidth = 0.014;
  g.beginPath();
  g.moveTo(0, -0.73);
  g.lineTo(0, -0.62);
  g.stroke();
  g.fillStyle = "#d9a93a";
  g.beginPath();
  g.moveTo(-0.05, -0.63);
  g.quadraticCurveTo(-0.11, -0.61, -0.12, -0.47);
  g.quadraticCurveTo(-0.13, -0.35, -0.19, -0.3);
  g.lineTo(0.19, -0.3);
  g.quadraticCurveTo(0.13, -0.35, 0.12, -0.47);
  g.quadraticCurveTo(0.11, -0.61, 0.05, -0.63);
  g.closePath();
  g.fill();
  g.strokeStyle = "#7a5a18";
  g.lineWidth = 0.012;
  g.stroke();
  g.fillStyle = "#b8862a";
  g.fillRect(-0.19, -0.32, 0.38, 0.025);
  g.fillStyle = "#f6d987";
  g.fillRect(-0.075, -0.57, 0.025, 0.2);
  g.fillStyle = "#6b4a1e";
  g.beginPath();
  g.arc(0, -0.27, 0.03, 0, Math.PI * 2);
  g.fill();
});
// its ring: arcs either side, flashed by animate
e.layer("ring", { pivot: [0, -0.46] }, (g) => {
  g.strokeStyle = "#e8b030";
  g.lineWidth = 0.016;
  g.lineCap = "round";
  for (let i = 0; i < 3; i++) {
    const r = 0.25 + i * 0.06;
    g.beginPath();
    g.arc(0, -0.46, r, -0.45, 0.45);
    g.stroke();
    g.beginPath();
    g.arc(0, -0.46, r, Math.PI - 0.45, Math.PI + 0.45);
    g.stroke();
  }
});
e.at(0, -0.5, "top");
