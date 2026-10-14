// Three bubbles floating slowly over the table, each round its own small loop (animate); bubble1..3 say where
// each is: free, held (carried by the finger: not seen) or sitting in a socket of `sockets`
if (!e.lib.show(e, "bubbles")) return;
// the centres of their loops (animate keeps the same)
const C = [
  [-0.45, -0.7],
  [0, -0.85],
  [0.45, -0.65],
];
const tint = ["#bfe6ff", "#d9f2d0", "#f6dcf0"];
C.forEach(([x, y], i) => {
  e.layer("b" + (i + 1), { pivot: [x, y] }, (g) => {
    g.fillStyle = tint[i];
    g.globalAlpha = 0.45;
    g.beginPath();
    g.arc(x, y, 0.07, 0, Math.PI * 2);
    g.fill();
    g.globalAlpha = 1;
    g.strokeStyle = "#7fb3d6";
    g.lineWidth = 0.008;
    g.beginPath();
    g.arc(x, y, 0.07, 0, Math.PI * 2);
    g.stroke();
    g.strokeStyle = "#ffffff";
    g.lineWidth = 0.012;
    g.beginPath();
    g.arc(x, y, 0.05, Math.PI * 1.1, Math.PI * 1.45);
    g.stroke();
  });
});
