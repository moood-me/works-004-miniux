// A low far coast behind the lighthouse, gentle hills, pale in the distance
g.fillStyle = "#a3b9ae";
g.beginPath();
g.moveTo(-5000, 0);
for (let x = -5000; x <= 5000; x += 250) {
  const h = 12 + 18 * (0.5 + 0.5 * Math.sin(x * 0.0011 + 1.3)) + 10 * e.rnd();
  g.lineTo(x, -h);
}
g.lineTo(5000, 0);
g.closePath();
g.fill();
