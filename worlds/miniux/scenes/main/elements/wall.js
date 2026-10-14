// The workshop's wall: light cool plaster (the warm things before it stand out) over a board wainscot, a rail high
// up (always there)
g.fillStyle = "#e7eaed";
g.fillRect(-4.6, -4.0, 9.2, 4.0);
// the wainscot (most of it behind the table)
g.fillStyle = "#cfd6dc";
g.fillRect(-4.6, -1.25, 9.2, 1.25);
g.fillStyle = "#bfc7ce";
for (let x = -4.6; x < 4.6; x += 0.3) g.fillRect(x, -1.25, 0.012, 1.25);
g.fillStyle = "#a9b3bc";
g.fillRect(-4.6, -1.29, 9.2, 0.05);
// a rail high on the wall
g.fillStyle = "#d3d9de";
g.fillRect(-4.6, -3.0, 9.2, 0.08);
