// each wick by its own key: quiet (0) — a small steady flame; smoking (1) — a sooty flame darting, smoke over it
if (!e.lib.show(e, "wicks")) return;
for (let n = 1; n <= 3; n++) {
  const k = e.lib.clamp01(e.state["wick" + n]);
  const calm = e.layer("calm" + n);
  calm.alpha = 1 - k;
  calm.rotate = 0.05 * e.anim.noise(e.t * 1.5, n);
  calm.scale = 1 + 0.04 * e.anim.noise(e.t * 5, n + 10);
  const soot = e.layer("soot" + n);
  soot.alpha = k;
  soot.rotate = k * 0.35 * e.anim.noise(e.t * 6, n + 20);
  soot.scaleX = 1 + 0.15 * k * e.anim.noise(e.t * 8, n + 30);
  soot.scaleY = 1 + 0.3 * k * e.anim.noise(e.t * 7, n + 40);
  const smoke = e.layer("smoke" + n);
  smoke.alpha = 0.85 * k;
  smoke.rotate = 0.18 * e.anim.noise(e.t * 0.7, n + 50);
  smoke.scaleY = 0.9 + 0.15 * e.anim.noise(e.t * 0.5, n + 60);
  e.glow("f" + n, 1 - k);
}
