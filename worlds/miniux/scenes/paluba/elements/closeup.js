// Close-up (an insert, opened by `closeup`, seen through its iris): a pin rail with four belaying pins in a row,
// k1..k4, each with its line coming down from aloft. rig1..rig4: the line hangs slack past its pin (0) → is taken
// round the pin in figure-of-eight turns and drawn tight (1) (animate). Stage heights: x 0..e.aspect, y 0..1
const cx = e.aspect / 2;
const X = [cx - 0.36, cx - 0.12, cx + 0.12, cx + 0.36];
const Y = 0.5;
// the bulwark's planking behind the rail
g.fillStyle = "#d8c6a2";
g.fillRect(cx - 0.62, 0.05, 1.24, 0.75);
g.fillStyle = "#c6b28a";
for (let y = 0.12; y < 0.8; y += 0.11) g.fillRect(cx - 0.62, y, 1.24, 0.006);
// the rail
g.fillStyle = "#8a6038";
g.fillRect(cx - 0.55, Y - 0.035, 1.1, 0.07);
g.fillStyle = "#a57848";
g.fillRect(cx - 0.55, Y - 0.035, 1.1, 0.015);
const rope = (g, draw) => {
  g.lineCap = "round";
  g.lineJoin = "round";
  g.strokeStyle = "#8c7448";
  g.lineWidth = 0.022;
  draw();
  g.stroke();
  g.strokeStyle = "#e0c58e";
  g.lineWidth = 0.014;
  draw();
  g.stroke();
};
X.forEach((x, i) => {
  const n = i + 1;
  // the pin: its handle over the rail, its shank under it
  g.fillStyle = "#e2c08a";
  g.beginPath();
  g.moveTo(x - 0.012, Y - 0.035);
  g.lineTo(x - 0.02, Y - 0.12);
  g.quadraticCurveTo(x, Y - 0.2, x + 0.02, Y - 0.12);
  g.lineTo(x + 0.012, Y - 0.035);
  g.closePath();
  g.fill();
  g.fillStyle = "#c9a26a";
  g.fillRect(x - 0.022, Y - 0.05, 0.044, 0.016);
  g.fillStyle = "#b8925a";
  g.fillRect(x - 0.01, Y + 0.035, 0.02, 0.08);
  // the line hanging slack past the pin
  e.layer("slack" + n, {}, (g) =>
    rope(g, () => {
      g.beginPath();
      g.moveTo(x + 0.05, 0.06);
      g.bezierCurveTo(x + 0.08, 0.3, x + 0.1, 0.45, x + 0.07, 0.72);
    }),
  );
  // the line drawn tight down to the pin
  e.layer("taut" + n, {}, (g) =>
    rope(g, () => {
      g.beginPath();
      g.moveTo(x + 0.05, 0.06);
      g.lineTo(x + 0.012, Y - 0.12);
    }),
  );
  // its turns round the pin, figure-of-eight, and the end hanging in a short bight
  e.layer("turns" + n, { pivot: [x, Y] }, (g) =>
    rope(g, () => {
      g.beginPath();
      g.moveTo(x + 0.012, Y - 0.12);
      g.lineTo(x - 0.035, Y + 0.09);
      g.quadraticCurveTo(x, Y + 0.12, x + 0.035, Y + 0.09);
      g.lineTo(x - 0.035, Y - 0.09);
      g.quadraticCurveTo(x, Y - 0.12, x + 0.035, Y - 0.09);
      g.lineTo(x - 0.03, Y + 0.08);
      g.quadraticCurveTo(x + 0.03, Y + 0.16, x + 0.02, Y + 0.22);
    }),
  );
  e.at(x, Y, "k" + n);
});
