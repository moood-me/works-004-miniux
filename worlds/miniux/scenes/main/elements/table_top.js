// The table top, seen from above: long light planks across
g.fillStyle = "#cfa26c";
g.fillRect(-2.2, -0.8, 4.4, 1.6);
const seams = ["#b98d58", "#c49763"];
for (let i = 1; i < 6; i++) {
  g.fillStyle = seams[i % 2];
  g.fillRect(-2.2, -0.8 + i * 0.27, 4.4, 0.012);
}
// the front edge, a little darker
g.fillStyle = "#b8895a";
g.fillRect(-2.2, 0.76, 4.4, 0.04);
