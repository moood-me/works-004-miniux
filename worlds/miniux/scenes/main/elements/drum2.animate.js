// struck: the skin jumps, the body gives
const shown = e.lib.show(e, "drum2");
if (shown) e.lib.drumMotion(e, "drum2_hits");
else e.lib.since(e, "drum2_hits");
