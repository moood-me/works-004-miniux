// A dusty brass plate on a little stand; under the dust (a layer) its engraving — the word “Workshop” (translated: tr) and a ship.
// `plate` wipes the dust off in patches (the shader, by the edge animate sets)
if (!e.lib.show(e, "plate")) return;
g.fillStyle = "#7a5534";
g.fillRect(-0.3, -0.1, 0.06, 0.1);
g.fillRect(0.24, -0.1, 0.06, 0.1);
g.fillStyle = "#d9b866";
g.fillRect(-0.45, -0.64, 0.9, 0.52);
g.strokeStyle = "#a88438";
g.lineWidth = 0.02;
g.strokeRect(-0.43, -0.62, 0.86, 0.48);
// the engraving
g.save();
g.translate(0, -0.47);
g.scale(0.001, 0.001);
g.font = "bold 80px Georgia, 'Times New Roman', serif";
g.textAlign = "center";
g.textBaseline = "middle";
g.fillStyle = "#6a4a1a";
g.fillText(tr("Workshop"), 0, 0);
g.restore();
g.fillStyle = "#6a4a1a";
g.beginPath();
g.moveTo(-0.14, -0.3);
g.lineTo(0.14, -0.3);
g.lineTo(0.1, -0.24);
g.lineTo(-0.1, -0.24);
g.closePath();
g.fill();
g.fillRect(-0.006, -0.42, 0.012, 0.12);
g.beginPath();
g.moveTo(0.012, -0.41);
g.lineTo(0.1, -0.32);
g.lineTo(0.012, -0.32);
g.closePath();
g.fill();
e.at(0, -0.38, "dust");
// the dust over the plate
e.layer("dust", {}, (g) => {
  g.fillStyle = "#a59b8b";
  g.fillRect(-0.45, -0.64, 0.9, 0.52);
  for (let i = 0; i < 60; i++) {
    g.fillStyle = e.rnd() < 0.5 ? "#b8ae9e" : "#8f8676";
    g.beginPath();
    g.arc(-0.43 + 0.86 * e.rnd(), -0.62 + 0.48 * e.rnd(), 0.006 + 0.02 * e.rnd(), 0, Math.PI * 2);
    g.fill();
  }
});
