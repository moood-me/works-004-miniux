// each line by its key: slack (0) → its turns taken round the pin, wide at first, drawn tight (1)
for (let n = 1; n <= 4; n++) {
  const r = e.lib.clamp01(e.state["rig" + n]);
  e.layer("slack" + n).alpha = 1 - r;
  e.layer("taut" + n).alpha = r;
  const turns = e.layer("turns" + n);
  turns.alpha = Math.min(1, r * 1.5);
  turns.scaleX = 1.5 - 0.5 * r;
}
