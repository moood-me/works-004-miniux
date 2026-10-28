// Three bubbles floating slowly over the table, each round its own small loop (animate); bubble1..3 say where
// each is: free, held (under the finger, at bubbleN_u, bubbleN_v) or sitting in a socket of `sockets`
if (!e.lib.show(e, "bubbles")) return;
// the centres of their loops (animate keeps the same)
const C = [
  [-0.45, -0.7],
  [0, -0.85],
  [0.45, -0.65],
];
const tint = ["#9fd4f7", "#b9e6a8", "#f2b6de"];
C.forEach(([x, y], i) => {
  e.layer("b" + (i + 1), { pivot: [x, y] }, (g) => {
    g.fillStyle = tint[i];
    g.globalAlpha = 0.6;
    g.beginPath();
    g.arc(x, y, 0.08, 0, Math.PI * 2);
    g.fill();
    g.globalAlpha = 1;
    g.strokeStyle = "#3f7fb0";
    g.lineWidth = 0.013;
    g.beginPath();
    g.arc(x, y, 0.08, 0, Math.PI * 2);
    g.stroke();
    g.strokeStyle = "#ffffff";
    g.lineWidth = 0.012;
    g.beginPath();
    g.arc(x, y, 0.056, Math.PI * 1.1, Math.PI * 1.45);
    g.stroke();
  });
});
