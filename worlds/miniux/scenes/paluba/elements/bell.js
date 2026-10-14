// The ship's bell in its little belfry on the deck before the mast: struck (bell_hits) it swings and rings (animate)
g.fillStyle = "#8a6440";
g.fillRect(-0.24, -2.2, 0.06, 2.2);
g.fillRect(0.18, -2.2, 0.06, 2.2);
g.fillRect(-0.28, -2.26, 0.56, 0.08);
g.fillStyle = "#6e4a2e";
g.fillRect(-0.3, -0.06, 0.6, 0.06);
e.layer("bell", { pivot: [0, -2.17] }, (g) => {
  g.strokeStyle = "#3f4247";
  g.lineWidth = 0.02;
  g.beginPath();
  g.moveTo(0, -2.17);
  g.lineTo(0, -2.07);
  g.stroke();
  g.fillStyle = "#d9a93a";
  g.beginPath();
  g.moveTo(-0.05, -2.07);
  g.quadraticCurveTo(-0.1, -2.05, -0.11, -1.9);
  g.quadraticCurveTo(-0.12, -1.78, -0.16, -1.72);
  g.lineTo(0.16, -1.72);
  g.quadraticCurveTo(0.12, -1.78, 0.11, -1.9);
  g.quadraticCurveTo(0.1, -2.05, 0.05, -2.07);
  g.closePath();
  g.fill();
  g.fillStyle = "#b8862a";
  g.fillRect(-0.16, -1.74, 0.32, 0.025);
  g.fillStyle = "#f6d987";
  g.fillRect(-0.07, -2.0, 0.022, 0.2);
  g.fillStyle = "#6b4a1e";
  g.beginPath();
  g.arc(0, -1.69, 0.025, 0, Math.PI * 2);
  g.fill();
});
e.layer("ring", { pivot: [0, -1.9] }, (g) => {
  g.strokeStyle = "#e8b030";
  g.lineWidth = 0.016;
  g.lineCap = "round";
  for (let i = 0; i < 3; i++) {
    const r = 0.22 + i * 0.055;
    g.beginPath();
    g.arc(0, -1.9, r, -0.45, 0.45);
    g.stroke();
    g.beginPath();
    g.arc(0, -1.9, r, Math.PI - 0.45, Math.PI + 0.45);
    g.stroke();
  }
});
e.at(0, -1.88, "bell");
