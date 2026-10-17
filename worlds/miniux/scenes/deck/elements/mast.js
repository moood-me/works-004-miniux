// The mast: a tapering pole with its hoops and a truck at the top
g.fillStyle = "#a07848";
g.beginPath();
g.moveTo(-0.13, 0);
g.lineTo(0.13, 0);
g.lineTo(0.08, -10.8);
g.lineTo(-0.08, -10.8);
g.closePath();
g.fill();
g.fillStyle = "#8a6440";
g.fillRect(-0.03, -10.8, 0.06, 10.8);
g.fillStyle = "#6e4a2e";
g.fillRect(-0.12, -11.0, 0.24, 0.2);
g.fillStyle = "#5d646b";
for (const y of [-2.9, -6, -8.2]) g.fillRect(-0.13, y, 0.26, 0.06);
