// A weight with a rope loop sitting on the table against the wall, and a hook higher and to the right: `rope` carries
// the weight straight from where it sits to the hook (animate), its point with it
if (!e.lib.show(e, "rope")) return;
// the hook
g.fillStyle = "#3f4247";
g.fillRect(0.47, -0.98, 0.06, 0.08);
g.strokeStyle = "#3f4247";
g.lineWidth = 0.026;
g.lineCap = "round";
g.beginPath();
g.moveTo(0.5, -0.92);
g.lineTo(0.5, -0.84);
g.arc(0.46, -0.84, 0.04, 0, Math.PI * 0.85);
g.stroke();
e.at(0.5, -0.85, "hook");
// the weight and its loop (the loop's top at (-0.5, -0.28))
e.layer("weight", {}, (g) => {
  g.strokeStyle = "#e0b060";
  g.lineWidth = 0.028;
  g.beginPath();
  g.ellipse(-0.5, -0.235, 0.035, 0.045, 0, 0, Math.PI * 2);
  g.stroke();
  g.fillStyle = "#6d7278";
  g.beginPath();
  g.moveTo(-0.58, -0.005);
  g.lineTo(-0.55, -0.19);
  g.lineTo(-0.45, -0.19);
  g.lineTo(-0.42, -0.005);
  g.closePath();
  g.fill();
  g.fillStyle = "#8a9096";
  g.fillRect(-0.55, -0.19, 0.1, 0.03);
});
