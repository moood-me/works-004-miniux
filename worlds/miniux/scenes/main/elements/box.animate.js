// the drawer `drawer` names comes out by `drawer_open`: its front a little down and nearer, its inside showing
if (!e.lib.show(e, "box")) return;
const open = e.lib.clamp01(e.state.drawer_open);
for (const name of ["top", "middle", "bottom"]) {
  const k = e.state.drawer === name ? open : 0;
  const front = e.layer(name);
  front.y = 0.045 * k;
  front.scale = 1 + 0.12 * k;
  const inside = e.layer("in_" + name);
  inside.y = 0.045 * k;
  inside.scaleY = k;
  inside.scaleX = 1 + 0.12 * k;
  inside.alpha = Math.min(1, k * 4);
}
