// how much of the dust is wiped off
if (!e.lib.show(e, "plate")) return;
e.uniform("clean", e.lib.clamp01(e.state.plate));
