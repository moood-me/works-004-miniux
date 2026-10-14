// A little chest of three drawers: the one `drawer` names slides out as `drawer_open` grows (animate); it is painted
// last, so that pulled out it stands before its neighbours
if (!e.lib.show(e, "box")) return;
const W = 0.74;
const H = 0.68;
g.fillStyle = "#8f5f33";
g.fillRect(-W / 2, -H, W, H);
g.fillStyle = "#74492a";
g.fillRect(-W / 2 - 0.025, -H - 0.035, W + 0.05, 0.035);
// the slots: each drawer's top edge
const SLOT = { top: -0.65, middle: -0.435, bottom: -0.22 };
g.fillStyle = "#3a2614";
for (const y of Object.values(SLOT)) g.fillRect(-0.33, y - 0.008, 0.66, 0.206);
const order = ["bottom", "middle", "top"].filter((n) => n !== e.state.drawer);
if (SLOT[e.state.drawer] !== undefined) order.push(e.state.drawer);
for (const name of order) {
  const y = SLOT[name];
  // its inside, seen from above as it comes out
  e.layer("in_" + name, { pivot: [0, y] }, (g) => {
    g.fillStyle = "#b07d48";
    g.beginPath();
    g.moveTo(-0.32, y);
    g.lineTo(-0.28, y - 0.16);
    g.lineTo(0.28, y - 0.16);
    g.lineTo(0.32, y);
    g.closePath();
    g.fill();
    g.fillStyle = "#e3c697";
    g.beginPath();
    g.moveTo(-0.29, y - 0.012);
    g.lineTo(-0.26, y - 0.15);
    g.lineTo(0.26, y - 0.15);
    g.lineTo(0.29, y - 0.012);
    g.closePath();
    g.fill();
  });
  // its front with its knob
  e.layer(name, { pivot: [0, y + 0.095] }, (g) => {
    g.fillStyle = "#c98d50";
    g.fillRect(-0.32, y, 0.64, 0.19);
    g.strokeStyle = "#8a5a30";
    g.lineWidth = 0.012;
    g.strokeRect(-0.3, y + 0.02, 0.6, 0.15);
    g.fillStyle = "#efdcae";
    g.beginPath();
    g.arc(0, y + 0.095, 0.03, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#a07a40";
    g.beginPath();
    g.arc(0, y + 0.1, 0.014, 0, Math.PI * 2);
    g.fill();
  });
}
e.at(0, -0.34, "front");
