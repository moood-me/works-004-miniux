// Three shells in a row (s1..s3). The one touched (`shell`) sways — unless it is the odd one (`shell_odd`): that one
// opens a little instead, a pearl seen in it, a warm light round it (animate). `shell_found` — the odd one lies open,
// a pearl in it
if (!e.lib.show(e, "shells")) return;
const X = [-0.45, 0, 0.45];
const odd = e.state.shell_odd;
const found = e.state.shell_found === true;
const fan = (g, x, y, r, fill, rib) => {
  g.fillStyle = fill;
  g.beginPath();
  g.moveTo(x, y);
  g.arc(x, y, r, Math.PI + 0.5, Math.PI * 2 - 0.5);
  g.closePath();
  g.fill();
  g.strokeStyle = rib;
  g.lineWidth = 0.007;
  for (let i = 1; i < 8; i++) {
    const a = Math.PI + 0.5 + (i * (Math.PI - 1)) / 8;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + r * 0.95 * Math.cos(a), y + r * 0.95 * Math.sin(a));
    g.stroke();
  }
  g.fillStyle = rib;
  g.fillRect(x - 0.035, y - 0.012, 0.07, 0.02);
};
X.forEach((x, i) => {
  const id = "s" + (i + 1);
  // (a warm light, not added: seen on the light wall)
  e.layer("glow_" + id, (g) => {
    const r = g.createRadialGradient(x, -0.07, 0, x, -0.07, 0.24);
    r.addColorStop(0, "rgba(255, 176, 40, 0.85)");
    r.addColorStop(1, "rgba(255, 176, 40, 0)");
    g.fillStyle = r;
    g.fillRect(x - 0.24, -0.31, 0.48, 0.31);
  });
  // under the shell: its lower half and a pearl — seen as it opens
  e.layer("inner_" + id, (g) => {
    fan(g, x, -0.005, 0.13, "#c9785a", "#9c4f32");
    g.fillStyle = "#fbf8f2";
    g.beginPath();
    g.arc(x, -0.045, 0.03, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#ffffff";
    g.beginPath();
    g.arc(x - 0.01, -0.055, 0.009, 0, Math.PI * 2);
    g.fill();
  });
  e.layer(id, { pivot: [x, -0.01] }, (g) => {
    if (found && id === odd) {
      fan(g, x, -0.01, 0.14, "#e98f6e", "#b8603e");
      fan(g, x, -0.07, 0.15, "#f2a585", "#c06a48");
      g.fillStyle = "#fbf8f2";
      g.beginPath();
      g.arc(x, -0.05, 0.028, 0, Math.PI * 2);
      g.fill();
    } else {
      fan(g, x, -0.01, 0.15, "#ec9a78", "#b8603e");
    }
  });
  e.at(x, -0.08, id);
});
