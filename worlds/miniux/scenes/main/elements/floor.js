// A piece of plank floor laid on the table, leaning back toward the wall so its boards are seen large (a card with
// "tilt"; up the slope is up the painting). Under one short board — not in the middle — something is hidden: with
// `floor_found` that board is lifted aside and a key is seen in the hollow
if (!e.lib.show(e, "floor")) return;
const found = e.state.floor_found === true;
const ROW = 0.18;
const shades = ["#c99b62", "#bd8f57", "#d4a66c"];
// six rows of boards from the foot (y 0) up; their joints staggered
g.fillStyle = "#8a5f36";
g.fillRect(-0.84, -1.12, 1.68, 1.12);
for (let r = 0; r < 6; r++) {
  const y0 = -0.02 - (r + 1) * ROW;
  const joints = r % 2 ? [-0.8, -0.25, 0.25, 0.75, 0.8] : [-0.8, -0.45, 0.25, 0.8];
  const row = r === 4 ? [-0.8, -0.25, 0.25, 0.75, 0.8] : joints;
  for (let j = 0; j + 1 < row.length; j++) {
    g.fillStyle = shades[(r + j) % 3];
    g.fillRect(row[j] + 0.006, y0 + 0.006, row[j + 1] - row[j] - 0.012, ROW - 0.012);
    g.fillStyle = "#6e4a2a";
    g.beginPath();
    g.arc(row[j] + 0.04, y0 + ROW / 2, 0.008, 0, Math.PI * 2);
    g.arc(row[j + 1] - 0.04, y0 + ROW / 2, 0.008, 0, Math.PI * 2);
    g.fill();
  }
}
// the hidden board: row 4, from x 0.25 to 0.75 (its middle the point "hidden")
const hy = -0.02 - 5 * ROW;
if (found) {
  g.fillStyle = "#2a1c10";
  g.fillRect(0.256, hy + 0.006, 0.488, ROW - 0.012);
  // the key in the hollow
  g.strokeStyle = "#e8b53a";
  g.lineWidth = 0.018;
  g.beginPath();
  g.arc(0.38, hy + ROW / 2, 0.035, 0, Math.PI * 2);
  g.moveTo(0.415, hy + ROW / 2);
  g.lineTo(0.62, hy + ROW / 2);
  g.moveTo(0.58, hy + ROW / 2);
  g.lineTo(0.58, hy + ROW / 2 + 0.04);
  g.moveTo(0.61, hy + ROW / 2);
  g.lineTo(0.61, hy + ROW / 2 + 0.03);
  g.stroke();
  // the board lifted aside, askew, its shadow under it
  g.save();
  g.translate(0.42, hy - 0.08);
  g.rotate(-0.25);
  g.fillStyle = "rgba(40, 25, 10, 0.35)";
  g.fillRect(-0.23, -0.05, 0.5, ROW);
  g.fillStyle = shades[1];
  g.fillRect(-0.25, -0.1, 0.5, ROW - 0.012);
  g.fillStyle = "#6e4a2a";
  g.fillRect(-0.25, -0.1, 0.5, 0.01);
  g.restore();
}
e.at(0, -0.55, "area");
e.at(0.5, hy + ROW / 2, "hidden");
