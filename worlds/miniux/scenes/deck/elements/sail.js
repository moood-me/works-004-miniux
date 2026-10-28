// The gaff mainsail on the mast, its boom swung out to port: its own frame — x 0 at the mast, the sail running aft
// along −x; the boom at 3 m. `sail` hoists it (animate): the cloth grows up from the boom, the gaff rides its head.
// Its point "cloth" is on the sail by the mast, a third of the way up it, going up with it
// the boom with its jaws
g.fillStyle = "#8a6440";
g.fillRect(-5.3, -3.06, 5.3, 0.12);
g.fillStyle = "#6e4a2e";
g.fillRect(-0.25, -3.1, 0.25, 0.2);
// the cloth, painted as hoisted; animate presses it down onto the boom
e.layer("cloth", { pivot: [0, -3.0] }, (g) => {
  g.fillStyle = "#f6f1e4";
  g.beginPath();
  g.moveTo(0, -3.08);
  g.lineTo(0, -8.0);
  g.lineTo(-4.6, -9.6);
  g.lineTo(-5.2, -3.08);
  g.closePath();
  g.fill();
  g.strokeStyle = "#ddd5c2";
  g.lineWidth = 0.03;
  for (let i = 1; i < 6; i++) {
    const x = -i * 0.85;
    g.beginPath();
    g.moveTo(x, -3.08);
    g.lineTo(x * 0.98, -8.0 - (x / -4.6) * 1.6 + 0.05);
    g.stroke();
  }
  g.strokeStyle = "#c9bfa8";
  g.lineWidth = 0.05;
  g.beginPath();
  g.moveTo(0, -8.0);
  g.lineTo(0, -3.08);
  g.lineTo(-5.2, -3.08);
  g.stroke();
});
// the gaff at the sail's head
e.layer("gaff", { pivot: [0, -8.0] }, (g) => {
  g.strokeStyle = "#8a6440";
  g.lineWidth = 0.1;
  g.lineCap = "round";
  g.beginPath();
  g.moveTo(0, -8.0);
  g.lineTo(-4.7, -9.65);
  g.stroke();
  g.fillStyle = "#6e4a2e";
  g.fillRect(-0.22, -8.12, 0.22, 0.24);
});
