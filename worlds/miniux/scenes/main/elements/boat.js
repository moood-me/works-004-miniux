// A model boat, seen from above on a dark board leaning back toward the wall (a card with "tilt": up the painting is
// up the slope, away). It turns on its pin at (0, -0.3); a red needle runs from it through the bow to the half-round
// scale ahead (±60°): where the needle points is where the bow is held. `boat_heading` turns it; `zone_center` sets
// where on the scale the target is, `zone_kind` what is there — a bright band and a firefly are "here", a bumblebee
// (red-ringed) is "keep away" —, `zone_lit` lights the target when the needle is in it (animate)
if (!e.lib.show(e, "boat")) return;
const O = [0, -0.3];
const A = Math.PI / 3;
g.fillStyle = "#3d5a6c";
g.fillRect(-0.85, -1.27, 1.7, 1.25);
g.strokeStyle = "#6e4a2a";
g.lineWidth = 0.03;
g.strokeRect(-0.84, -1.26, 1.68, 1.23);
// the scale: quiet light ticks
g.strokeStyle = "#a9bcc8";
g.lineWidth = 0.012;
g.beginPath();
g.arc(O[0], O[1], 0.72, -Math.PI / 2 - A, -Math.PI / 2 + A);
g.stroke();
for (let d = -60; d <= 60; d += 10) {
  const a = -Math.PI / 2 + (d * Math.PI) / 180;
  const r0 = d % 30 === 0 ? 0.62 : 0.67;
  g.lineWidth = 0.01;
  g.beginPath();
  g.moveTo(O[0] + r0 * Math.cos(a), O[1] + r0 * Math.sin(a));
  g.lineTo(O[0] + 0.72 * Math.cos(a), O[1] + 0.72 * Math.sin(a));
  g.stroke();
}
e.at(0, -1.0, "scale");
// the target band on the scale (painted at its middle; animate turns it): bright, unmistakably "here"
e.layer("zone", { pivot: O }, (g) => {
  g.lineCap = "round";
  g.strokeStyle = "#d9a520";
  g.lineWidth = 0.11;
  g.beginPath();
  g.arc(O[0], O[1], 0.67, -Math.PI / 2 - 0.16, -Math.PI / 2 + 0.16);
  g.stroke();
  g.strokeStyle = "#fff2a0";
  g.lineWidth = 0.08;
  g.beginPath();
  g.arc(O[0], O[1], 0.67, -Math.PI / 2 - 0.16, -Math.PI / 2 + 0.16);
  g.stroke();
});
e.layer("zone_lit", { pivot: O, blend: "add" }, (g) => {
  const r = g.createRadialGradient(0, -0.97, 0, 0, -0.97, 0.25);
  r.addColorStop(0, "rgba(255, 245, 190, 0.9)");
  r.addColorStop(1, "rgba(255, 245, 190, 0)");
  g.fillStyle = r;
  g.fillRect(-0.25, -1.22, 0.5, 0.5);
});
// a firefly over the scale: a glowing yellow-green light
e.layer("firefly", { pivot: O }, (g) => {
  const r = g.createRadialGradient(0, -1.07, 0, 0, -1.07, 0.13);
  r.addColorStop(0, "rgba(230, 255, 140, 0.85)");
  r.addColorStop(1, "rgba(230, 255, 140, 0)");
  g.fillStyle = r;
  g.fillRect(-0.13, -1.2, 0.26, 0.26);
  g.fillStyle = "#3a2e22";
  g.beginPath();
  g.ellipse(0, -1.1, 0.02, 0.034, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#efff8a";
  g.beginPath();
  g.arc(0, -1.065, 0.03, 0, Math.PI * 2);
  g.fill();
  e.light(0, -1.065, 0.1, "#e0ff80", 1, "fly");
});
// a bumblebee over the scale, in a red warning ring: keep away from it
e.layer("bee", { pivot: O }, (g) => {
  g.fillStyle = "rgba(220, 60, 40, 0.3)";
  g.beginPath();
  g.arc(0, -1.08, 0.14, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = "#e0402a";
  g.lineWidth = 0.016;
  g.beginPath();
  g.arc(0, -1.08, 0.14, 0, Math.PI * 2);
  g.stroke();
  g.fillStyle = "rgba(240, 245, 255, 0.85)";
  g.beginPath();
  g.ellipse(-0.045, -1.12, 0.04, 0.022, -0.4, 0, Math.PI * 2);
  g.ellipse(0.045, -1.12, 0.04, 0.022, 0.4, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#f2b81c";
  g.beginPath();
  g.ellipse(0, -1.08, 0.045, 0.058, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#1e1a16";
  g.fillRect(-0.045, -1.095, 0.09, 0.018);
  g.fillRect(-0.04, -1.065, 0.08, 0.018);
  g.beginPath();
  g.arc(0, -1.135, 0.024, 0, Math.PI * 2);
  g.fill();
});
// the pin
g.fillStyle = "#c9d2d8";
g.beginPath();
g.arc(O[0], O[1], 0.03, 0, Math.PI * 2);
g.fill();
// the boat, bow toward the scale, and its needle from the pin through the bow to the scale
e.layer("boat", { pivot: O }, (g) => {
  g.fillStyle = "#f4f0e6";
  g.beginPath();
  g.moveTo(0, -0.61);
  g.bezierCurveTo(0.12, -0.5, 0.12, -0.15, 0.08, -0.01);
  g.lineTo(-0.08, -0.01);
  g.bezierCurveTo(-0.12, -0.15, -0.12, -0.5, 0, -0.61);
  g.fill();
  g.fillStyle = "#b98a55";
  g.beginPath();
  g.moveTo(0, -0.56);
  g.bezierCurveTo(0.09, -0.46, 0.09, -0.16, 0.06, -0.04);
  g.lineTo(-0.06, -0.04);
  g.bezierCurveTo(-0.09, -0.16, -0.09, -0.46, 0, -0.56);
  g.fill();
  g.fillStyle = "#e0402a";
  g.fillRect(-0.012, -0.6, 0.024, 0.32);
  g.beginPath();
  g.moveTo(0, -0.66);
  g.lineTo(0.035, -0.58);
  g.lineTo(-0.035, -0.58);
  g.closePath();
  g.fill();
  g.strokeStyle = "#e0402a";
  g.lineWidth = 0.014;
  for (let y = -0.67; y > -0.88; y -= 0.055) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(0, y - 0.03);
    g.stroke();
  }
  g.fillStyle = "#e0402a";
  g.beginPath();
  g.moveTo(0, -0.94);
  g.lineTo(0.03, -0.88);
  g.lineTo(-0.03, -0.88);
  g.closePath();
  g.fill();
});
