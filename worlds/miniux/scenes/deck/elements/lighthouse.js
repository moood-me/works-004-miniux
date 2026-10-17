// The lighthouse ahead, a kilometre off at the start: a rocky islet, a white tower with red bands, its lantern; its
// light (the point "light") glows brighter, with a halo and beams, as `on_course` says (animate)
g.fillStyle = "#7d776c";
g.beginPath();
g.moveTo(-70, 0);
g.quadraticCurveTo(-55, -12, -30, -16);
g.quadraticCurveTo(0, -22, 28, -15);
g.quadraticCurveTo(55, -10, 72, 0);
g.closePath();
g.fill();
g.fillStyle = "#958e80";
g.beginPath();
g.moveTo(-30, -16);
g.quadraticCurveTo(0, -22, 28, -15);
g.quadraticCurveTo(0, -12, -30, -16);
g.fill();
// the tower
const tower = (y0, y1, c) => {
  const w0 = 5 - ((-y0 - 18) / 42) * 1.6;
  const w1 = 5 - ((-y1 - 18) / 42) * 1.6;
  g.fillStyle = c;
  g.beginPath();
  g.moveTo(-w0, y0);
  g.lineTo(w0, y0);
  g.lineTo(w1, y1);
  g.lineTo(-w1, y1);
  g.closePath();
  g.fill();
};
for (let i = 0; i < 6; i++) tower(-18 - i * 7, -25 - i * 7, i % 2 ? "#c8453a" : "#f4f1ea");
// the gallery, the lantern room, the roof
g.fillStyle = "#3f4247";
g.fillRect(-5, -61, 10, 1.4);
g.fillStyle = "#fff6d0";
g.fillRect(-2.8, -66, 5.6, 5);
g.fillStyle = "#3f4247";
g.fillRect(-2.8, -66, 0.5, 5);
g.fillRect(2.3, -66, 0.5, 5);
g.fillStyle = "#c8453a";
g.beginPath();
g.moveTo(-3.4, -66);
g.lineTo(3.4, -66);
g.lineTo(0, -70.5);
g.closePath();
g.fill();
e.at(0, -63.5, "light");
// the halo round the light
e.layer("halo", { pivot: [0, -63.5], blend: "add" }, (g) => {
  const r = g.createRadialGradient(0, -63.5, 0, 0, -63.5, 30);
  r.addColorStop(0, "rgba(255, 244, 200, 0.9)");
  r.addColorStop(0.3, "rgba(255, 240, 190, 0.35)");
  r.addColorStop(1, "rgba(255, 240, 190, 0)");
  g.fillStyle = r;
  g.fillRect(-30, -93.5, 60, 60);
  e.light(0, -63.5, 10, "#fff0b0", 1, "light");
});
// its beams, either side (animate pulses their length as the light turns)
e.layer("beam", { pivot: [0, -63.5], blend: "add" }, (g) => {
  for (const s of [-1, 1]) {
    const r = g.createLinearGradient(0, -63.5, s * 75, -63.5);
    r.addColorStop(0, "rgba(255, 244, 200, 0.6)");
    r.addColorStop(1, "rgba(255, 244, 200, 0)");
    g.fillStyle = r;
    g.beginPath();
    g.moveTo(0, -64.5);
    g.lineTo(s * 75, -69);
    g.lineTo(s * 75, -58);
    g.lineTo(0, -62.5);
    g.closePath();
    g.fill();
  }
});
