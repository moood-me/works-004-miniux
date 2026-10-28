// An hourglass: the sand runs from the top bulb into the bottom one as `sand` goes 0 → 1 (animate); a thin stream
// while it runs
if (!e.lib.show(e, "hourglass")) return;
g.fillStyle = "#7a5534";
g.fillRect(-0.17, -0.58, 0.34, 0.045);
g.fillRect(-0.17, -0.045, 0.34, 0.045);
g.fillRect(-0.15, -0.54, 0.022, 0.5);
g.fillRect(0.128, -0.54, 0.022, 0.5);
// the glass
const glass = (g) => {
  g.beginPath();
  g.moveTo(-0.11, -0.535);
  g.lineTo(0.11, -0.535);
  g.bezierCurveTo(0.11, -0.4, 0.02, -0.33, 0.012, -0.295);
  g.bezierCurveTo(0.02, -0.26, 0.11, -0.19, 0.11, -0.045);
  g.lineTo(-0.11, -0.045);
  g.bezierCurveTo(-0.11, -0.19, -0.02, -0.26, -0.012, -0.295);
  g.bezierCurveTo(-0.02, -0.33, -0.11, -0.4, -0.11, -0.535);
  g.closePath();
};
g.fillStyle = "#e4eff5";
glass(g);
g.fill();
// the sand above: its top at y -0.45, down to the neck (animate shrinks it toward the neck)
e.layer("top_sand", { pivot: [0, -0.3] }, (g) => {
  g.fillStyle = "#e0b860";
  g.beginPath();
  g.moveTo(-0.098, -0.45);
  g.lineTo(0.098, -0.45);
  g.bezierCurveTo(0.07, -0.36, 0.02, -0.33, 0.006, -0.3);
  g.lineTo(-0.006, -0.3);
  g.bezierCurveTo(-0.02, -0.33, -0.07, -0.36, -0.098, -0.45);
  g.closePath();
  g.fill();
});
// the heap below (animate grows it)
e.layer("bottom_sand", { pivot: [0, -0.05] }, (g) => {
  g.fillStyle = "#e0b860";
  g.beginPath();
  g.moveTo(-0.105, -0.05);
  g.quadraticCurveTo(-0.06, -0.16, 0, -0.2);
  g.quadraticCurveTo(0.06, -0.16, 0.105, -0.05);
  g.closePath();
  g.fill();
});
e.layer("stream", {}, (g) => {
  g.strokeStyle = "#d9ae50";
  g.lineWidth = 0.008;
  g.beginPath();
  g.moveTo(0, -0.3);
  g.lineTo(0, -0.07);
  g.stroke();
});
g.strokeStyle = "#9fb4c2";
g.lineWidth = 0.008;
glass(g);
g.stroke();
e.at(0, -0.3, "glass");
