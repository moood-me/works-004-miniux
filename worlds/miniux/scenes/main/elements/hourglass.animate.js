// `sand` 0 — all above, 1 — all run through; the stream shows while `sand` is moving
if (!e.lib.show(e, "hourglass")) return;
const k = e.lib.clamp01(e.state.sand);
e.layer("top_sand").scaleY = 1 - k;
e.layer("bottom_sand").scaleY = k;
const running = Math.min(1, Math.abs(e.speed("sand")) * 100) * (k < 0.999 ? 1 : 0);
e.layer("stream").alpha = e.lib.follow(e, "stream", running, 10);
