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
// the lantern on an arm from the post's side (out past the stem head's red disc)
g.fillStyle = "#3f4247";
g.fillRect(0.09, -1.05, 0.18, 0.02);
g.fillRect(0.24, -1.12, 0.12, 0.03);
g.fillStyle = "#f2ead6";
g.fillRect(0.25, -1.09, 0.1, 0.14);
g.fillStyle = "#3f4247";
g.fillRect(0.24, -0.96, 0.12, 0.03);
e.layer("lamp", { pivot: [0.3, -1.02] }, (g) => {
  g.fillStyle = "#ffcf60";
  g.fillRect(0.26, -1.08, 0.08, 0.12);
  g.fillStyle = "#fff4c0";
  g.fillRect(0.285, -1.06, 0.03, 0.08);
  e.light(0.3, -1.02, 0.35, "#ffd070", 1, "lamp");
});
// the stem head, painted red in a white rim: the bow to steer by, large enough to be seen at once from the stern
g.fillStyle = "#f4f1ea";
g.beginPath();
g.arc(0, -1.0, 0.19, 0, Math.PI * 2);
g.fill();
g.fillStyle = "#d23a2c";
g.beginPath();
g.arc(0, -1.0, 0.16, 0, Math.PI * 2);
g.fill();
g.fillStyle = "#f4f1ea";
g.beginPath();
g.arc(0, -1.0, 0.05, 0, Math.PI * 2);
g.fill();
e.at(0, -1.0, "stem");
