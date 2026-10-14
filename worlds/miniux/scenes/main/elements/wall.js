// The workshop's wall: light plaster over a board wainscot, a shelf rail high up (always there)
g.fillStyle = "#efe7d8";
g.fillRect(-4.6, -4.0, 9.2, 4.0);
// the wainscot (most of it behind the table)
g.fillStyle = "#d9c7a3";
g.fillRect(-4.6, -1.25, 9.2, 1.25);
g.fillStyle = "#c8b38b";
for (let x = -4.6; x < 4.6; x += 0.3) g.fillRect(x, -1.25, 0.012, 1.25);
g.fillStyle = "#b99d70";
g.fillRect(-4.6, -1.29, 9.2, 0.05);
// a rail high on the wall
g.fillStyle = "#cdb995";
g.fillRect(-4.6, -3.0, 9.2, 0.08);
