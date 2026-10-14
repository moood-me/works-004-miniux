// A clear day: deeper blue overhead, pale toward the horizon (0.55 of the frame)
const gr = g.createLinearGradient(0, -0.35, 0, 0.6);
gr.addColorStop(0, "#7fb2dc");
gr.addColorStop(0.6, "#b9d8ee");
gr.addColorStop(1, "#eef4f6");
g.fillStyle = gr;
g.fillRect(-0.3, -0.35, e.aspect + 0.6, 1.6);
