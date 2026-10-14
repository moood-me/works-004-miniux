// The stem at the very bow, seen from the stern: its post rising over the rail, the bowsprit going on forward and up,
// and a lantern on the post, lit when the bow is on the lighthouse (`on_course`, animate). Its head is the point "stem"
g.fillStyle = "#8a6040";
g.fillRect(-0.09, -1.15, 0.18, 1.15);
g.fillStyle = "#6e4a2e";
g.fillRect(-0.11, -1.19, 0.22, 0.05);
// the bowsprit, foreshortened
g.fillStyle = "#9c7448";
g.beginPath();
g.moveTo(-0.07, -1.0);
g.lineTo(0.07, -1.0);
g.lineTo(0.035, -1.42);
g.lineTo(-0.035, -1.42);
g.closePath();
g.fill();
// the lantern on the post's side
g.fillStyle = "#3f4247";
g.fillRect(0.09, -1.05, 0.06, 0.02);
g.fillRect(0.12, -1.12, 0.12, 0.03);
g.fillStyle = "#f2ead6";
g.fillRect(0.13, -1.09, 0.1, 0.14);
g.fillStyle = "#3f4247";
g.fillRect(0.12, -0.96, 0.12, 0.03);
e.layer("lamp", { pivot: [0.18, -1.02] }, (g) => {
  g.fillStyle = "#ffcf60";
  g.fillRect(0.14, -1.08, 0.08, 0.12);
  g.fillStyle = "#fff4c0";
  g.fillRect(0.165, -1.06, 0.03, 0.08);
  e.light(0.18, -1.02, 0.35, "#ffd070", 1, "lamp");
});
e.at(0, -1.0, "stem");
