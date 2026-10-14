// A cupboard door in the wall, hinged on its left, and to its right a small plaque — the place to step away to.
// Knocked (door_knocks) it trembles; answered from inside (door_reply) it jolts and the light under it flares;
// door_open swings it open (animate)
if (!e.lib.show(e, "door")) return;
// the frame and the cupboard's inside
g.fillStyle = "#6e4a2a";
g.fillRect(-0.67, -0.87, 0.74, 0.87);
g.fillStyle = "#3d2c1d";
g.fillRect(-0.6, -0.8, 0.6, 0.8);
g.fillStyle = "#5c4330";
g.fillRect(-0.6, -0.43, 0.6, 0.03);
g.fillStyle = "#7fb0cf";
g.fillRect(-0.48, -0.6, 0.12, 0.17);
g.fillStyle = "#c86a4a";
g.fillRect(-0.28, -0.56, 0.1, 0.13);
// the plaque to step away to
g.fillStyle = "#e3d2a8";
g.fillRect(0.43, -0.5, 0.24, 0.16);
g.strokeStyle = "#9c8558";
g.lineWidth = 0.012;
g.strokeRect(0.43, -0.5, 0.24, 0.16);
g.strokeStyle = "#6e5a38";
g.lineWidth = 0.02;
g.lineCap = "round";
g.beginPath();
g.moveTo(0.48, -0.42);
g.lineTo(0.61, -0.42);
g.moveTo(0.56, -0.46);
g.lineTo(0.61, -0.42);
g.lineTo(0.56, -0.38);
g.stroke();
e.at(-0.3, -0.42, "knock");
e.at(0.55, -0.42, "away");
// the light under the door, flashed when someone knocks back
e.layer("strip", { blend: "add" }, (g) => {
  g.fillStyle = "#ffd27a";
  g.fillRect(-0.6, -0.038, 0.6, 0.034);
  e.light(-0.3, -0.02, 0.25, "#ffcf70", 1, "strip");
});
// the door leaf, hinged at x = -0.6
e.layer("leaf", { pivot: [-0.6, -0.42] }, (g) => {
  g.fillStyle = "#b9824a";
  g.fillRect(-0.6, -0.8, 0.6, 0.76);
  g.strokeStyle = "#8a5a30";
  g.lineWidth = 0.015;
  g.strokeRect(-0.54, -0.74, 0.48, 0.29);
  g.strokeRect(-0.54, -0.38, 0.48, 0.29);
  g.fillStyle = "#4a4a4a";
  g.fillRect(-0.6, -0.72, 0.025, 0.07);
  g.fillRect(-0.6, -0.2, 0.025, 0.07);
  g.fillStyle = "#e9d49a";
  g.beginPath();
  g.arc(-0.07, -0.42, 0.025, 0, Math.PI * 2);
  g.fill();
});
