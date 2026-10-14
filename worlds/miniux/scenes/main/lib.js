// Shared by the workshop's things: which demonstration shows a thing, the short answers to the counters, a drum.

// a thing is painted (and moves) only in the demonstrations that show it
const show = (e, ...demos) => demos.includes(e.state.demo);

// seconds since the counter `key` last changed (a long time before it ever has; the value it opened with is no hit)
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

// a struck thing's answer `s` seconds after the strike: a swing dying away
const ring = (s, freq, decay) => (s < 0 || s > 8 ? 0 : Math.exp(-decay * s) * Math.sin(freq * s));
// a flash fading away
const flash = (s, decay) => (s < 0 || s > 8 ? 0 : Math.exp(-decay * s));

// a remembered number eased toward `target` (rate: how quickly, a second)
function follow(e, name, target, rate) {
  const m = e.mem;
  if (m[name] === undefined) m[name] = target;
  m[name] += (target - m[name]) * Math.min(1, e.dt * rate);
  return m[name];
}

const clamp01 = (v) => Math.max(0, Math.min(1, Number(v) || 0));

// a flame: a drop of fire from its base (x, y) up, h tall
function flame(g, x, y, w, h) {
  g.fillStyle = "#ffa82e";
  g.beginPath();
  g.moveTo(x, y + w * 0.3);
  g.bezierCurveTo(x - w * 1.2, y, x - w * 0.5, y - h * 0.6, x, y - h);
  g.bezierCurveTo(x + w * 0.5, y - h * 0.6, x + w * 1.2, y, x, y + w * 0.3);
  g.fill();
  g.fillStyle = "#fff3b0";
  g.beginPath();
  g.moveTo(x, y);
  g.bezierCurveTo(x - w * 0.6, y - h * 0.1, x - w * 0.25, y - h * 0.5, x, y - h * 0.68);
  g.bezierCurveTo(x + w * 0.25, y - h * 0.5, x + w * 0.6, y - h * 0.1, x, y);
  g.fill();
}

// a drum standing on the table at x: its body and its skin are layers (the skin jumps when struck)
function drum(g, e, x, body, cord) {
  e.layer("body", { pivot: [x, 0] }, (g) => {
    g.fillStyle = "#6b4a2c";
    g.fillRect(x - 0.17, -0.04, 0.04, 0.04);
    g.fillRect(x + 0.13, -0.04, 0.04, 0.04);
    g.fillStyle = body;
    g.fillRect(x - 0.2, -0.32, 0.4, 0.28);
    g.beginPath();
    g.ellipse(x, -0.04, 0.2, 0.045, 0, 0, Math.PI);
    g.fill();
    // the cords zig-zag round it
    g.strokeStyle = cord;
    g.lineWidth = 0.012;
    g.beginPath();
    for (let i = 0; i <= 8; i++) {
      const cx = x - 0.2 + i * 0.05;
      g.lineTo(cx, i % 2 ? -0.08 : -0.29);
    }
    g.stroke();
    // the hoops
    g.fillStyle = "#e9d9b0";
    g.fillRect(x - 0.205, -0.31, 0.41, 0.025);
    g.fillRect(x - 0.205, -0.09, 0.41, 0.025);
  });
  e.layer("skin", { pivot: [x, -0.32] }, (g) => {
    g.fillStyle = "#c9b48a";
    g.beginPath();
    g.ellipse(x, -0.32, 0.205, 0.05, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#f4ead2";
    g.beginPath();
    g.ellipse(x, -0.322, 0.185, 0.04, 0, 0, Math.PI * 2);
    g.fill();
  });
  e.at(x, -0.32, "skin");
}

// the drum's answer to its counter: the skin jumps, the body gives a little
function drumMotion(e, key) {
  const s = since(e, key);
  const jump = flash(s, 14);
  const skin = e.layer("skin");
  skin.y = -0.035 * jump;
  skin.scaleY = 1 + 0.4 * ring(s, 45, 9);
  const body = e.layer("body");
  body.scaleY = 1 - 0.04 * jump;
  body.scaleX = 1 + 0.025 * jump;
}

return { show, since, ring, flash, follow, clamp01, flame, drum, drumMotion };
