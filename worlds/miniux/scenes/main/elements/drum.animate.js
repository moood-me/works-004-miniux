// struck: the skin jumps, the body gives
const shown = e.lib.show(e, "drum", "drum2");
if (shown) e.lib.drumMotion(e, "drum_hits");
else e.lib.since(e, "drum_hits");
