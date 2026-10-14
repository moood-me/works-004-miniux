// The table top, seen from above: long light planks across
g.fillStyle = "#e3d4b8";
g.fillRect(-2.2, -0.8, 4.4, 1.6);
const seams = ["#d2c09f", "#d9c8a9"];
for (let i = 1; i < 6; i++) {
  g.fillStyle = seams[i % 2];
  g.fillRect(-2.2, -0.8 + i * 0.27, 4.4, 0.012);
}
// the front edge, a little darker
g.fillStyle = "#c4ab84";
g.fillRect(-2.2, 0.76, 4.4, 0.04);
