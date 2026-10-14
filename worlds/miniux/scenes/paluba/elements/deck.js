// The deck, seen from above (y toward the stern): planks along the ship, square aft, pointed at the bow; a hatch
// before the mast
g.fillStyle = "#d9c39b";
g.beginPath();
g.moveTo(-2.2, 8.25);
g.lineTo(2.2, 8.25);
g.lineTo(2.2, -5.25);
g.lineTo(0, -8.25);
g.lineTo(-2.2, -5.25);
g.closePath();
g.fill();
g.save();
g.clip();
g.fillStyle = "#bba57d";
for (let x = -2.2; x <= 2.2; x += 0.16) g.fillRect(x, -8.25, 0.012, 16.5);
for (let y = 7; y > -8; y -= 2.6) {
  for (let x = -2.2; x < 2.2; x += 0.32) g.fillRect(x, y + (x * 7.3) % 1.3, 0.16, 0.01);
}
g.restore();
g.fillStyle = "#a07a50";
g.fillRect(-0.7, 0.2, 1.4, 1.2);
g.fillStyle = "#8a6440";
g.fillRect(-0.62, 0.28, 1.24, 1.04);
g.fillStyle = "#a07a50";
for (let i = 1; i < 4; i++) g.fillRect(-0.62, 0.28 + i * 0.26, 1.24, 0.03);
