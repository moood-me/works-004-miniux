// A model boat, seen from above on a board leaning back toward the wall (a card with "tilt": up the painting is up
// the slope, away). It turns on its pin at (0, -0.3); ahead of its bow a half-round scale (±60°). `boat_heading` turns
// it, `zone_center` sets where on the scale the zone is, `zone_kind` what is there — a light band, a firefly or a
// bumblebee —, `zone_lit` lights it (animate)
if (!e.lib.show(e, "boat")) return;
const O = [0, -0.3];
const A = Math.PI / 3;
g.fillStyle = "#e3d3ad";
g.fillRect(-0.85, -1.27, 1.7, 1.25);
g.strokeStyle = "#8a6a40";
g.lineWidth = 0.02;
g.strokeRect(-0.84, -1.26, 1.68, 1.23);
// the scale
g.strokeStyle = "#7a6a50";
g.lineWidth = 0.014;
g.beginPath();
g.arc(O[0], O[1], 0.72, -Math.PI / 2 - A, -Math.PI / 2 + A);
g.stroke();
for (let d = -60; d <= 60; d += 10) {
  const a = -Math.PI / 2 + (d * Math.PI) / 180;
  const r0 = d % 30 === 0 ? 0.6 : 0.65;
  g.lineWidth = d === 0 ? 0.016 : 0.01;
  g.beginPath();
  g.moveTo(O[0] + r0 * Math.cos(a), O[1] + r0 * Math.sin(a));
  g.lineTo(O[0] + 0.72 * Math.cos(a), O[1] + 0.72 * Math.sin(a));
  g.stroke();
}
e.at(0, -1.0, "scale");
// the zone on the scale (painted at its middle; animate turns it)
e.layer("zone", { pivot: O }, (g) => {
  g.strokeStyle = "#f4cf55";
  g.lineWidth = 0.08;
  g.beginPath();
  g.arc(O[0], O[1], 0.67, -Math.PI / 2 - 0.17, -Math.PI / 2 + 0.17);
  g.stroke();
});
e.layer("zone_lit", { pivot: O, blend: "add" }, (g) => {
  g.strokeStyle = "#fff0a0";
  g.lineWidth = 0.12;
  g.beginPath();
  g.arc(O[0], O[1], 0.67, -Math.PI / 2 - 0.2, -Math.PI / 2 + 0.2);
  g.stroke();
});
// a firefly over the scale
e.layer("firefly", { pivot: O }, (g) => {
  g.fillStyle = "#4a3a2a";
  g.beginPath();
  g.ellipse(0, -1.1, 0.018, 0.03, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#e4ff7a";
  g.beginPath();
  g.arc(0, -1.065, 0.024, 0, Math.PI * 2);
  g.fill();
  e.light(0, -1.065, 0.08, "#e0ff80", 1, "fly");
});
// a bumblebee over the scale
e.layer("bee", { pivot: O }, (g) => {
  g.fillStyle = "rgba(230, 240, 255, 0.8)";
  g.beginPath();
  g.ellipse(-0.035, -1.12, 0.03, 0.018, -0.4, 0, Math.PI * 2);
  g.ellipse(0.035, -1.12, 0.03, 0.018, 0.4, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#f2b81c";
  g.beginPath();
  g.ellipse(0, -1.09, 0.035, 0.045, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#2a2420";
  g.fillRect(-0.035, -1.1, 0.07, 0.014);
  g.fillRect(-0.03, -1.075, 0.06, 0.014);
});
// the pin
g.fillStyle = "#5d646b";
g.beginPath();
g.arc(O[0], O[1], 0.03, 0, Math.PI * 2);
g.fill();
// the boat, bow toward the scale
e.layer("boat", { pivot: O }, (g) => {
  g.fillStyle = "#3f6f9a";
  g.beginPath();
  g.moveTo(0, -0.61);
  g.bezierCurveTo(0.12, -0.5, 0.12, -0.15, 0.08, -0.01);
  g.lineTo(-0.08, -0.01);
  g.bezierCurveTo(-0.12, -0.15, -0.12, -0.5, 0, -0.61);
  g.fill();
  g.fillStyle = "#eadbb8";
  g.beginPath();
  g.moveTo(0, -0.56);
  g.bezierCurveTo(0.09, -0.46, 0.09, -0.16, 0.06, -0.04);
  g.lineTo(-0.06, -0.04);
  g.bezierCurveTo(-0.09, -0.16, -0.09, -0.46, 0, -0.56);
  g.fill();
  g.fillStyle = "#f7f3ea";
  g.beginPath();
  g.moveTo(0, -0.36);
  g.lineTo(0.015, -0.12);
  g.lineTo(-0.015, -0.12);
  g.closePath();
  g.fill();
  g.fillStyle = "#c0503a";
  g.beginPath();
  g.arc(0, -0.58, 0.018, 0, Math.PI * 2);
  g.fill();
});
