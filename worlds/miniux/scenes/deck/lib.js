// Shared by the ship's parts: a bulwark's inner face, and the struck bell's answer

// the inner face of a bulwark, x from -half to half, 0.9 m high: white planking, a wooden rail on top, stanchions
function bulwark(g, half) {
  g.fillStyle = "#efe8da";
  g.fillRect(-half, -0.86, 2 * half, 0.86);
  g.fillStyle = "#ddd3c0";
  for (let y = -0.66; y < 0; y += 0.2) g.fillRect(-half, y, 2 * half, 0.01);
  g.fillStyle = "#d3c8b2";
  for (let x = -half + 0.3; x < half; x += 1.2) g.fillRect(x, -0.84, 0.08, 0.84);
  g.fillStyle = "#c9bda5";
  g.fillRect(-half, -0.06, 2 * half, 0.06);
  g.fillStyle = "#8a6040";
  g.fillRect(-half, -0.92, 2 * half, 0.08);
}

// seconds since the counter `key` last changed (the value the scene opened with is no hit)
function since(e, key) {
  const m = e.mem;
  const v = e.state[key] ?? 0;
  if (m["n_" + key] === undefined) {
    m["n_" + key] = v;
    m["t_" + key] = -1e6;
  }
  if (v !== m["n_" + key]) {
    m["n_" + key] = v;
    m["t_" + key] = e.t;
  }
  return e.t - m["t_" + key];
}

const ring = (s, freq, decay) => (s < 0 || s > 8 ? 0 : Math.exp(-decay * s) * Math.sin(freq * s));
const flash = (s, decay) => (s < 0 || s > 8 ? 0 : Math.exp(-decay * s));
const clamp01 = (v) => Math.max(0, Math.min(1, Number(v) || 0));

return { bulwark, since, ring, flash, clamp01 };
