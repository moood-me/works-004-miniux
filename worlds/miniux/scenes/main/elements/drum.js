// A drum on the table — in the middle in "drum", on the left in "drum2" (beside `drum2`): struck (drum_hits), its
// skin jumps (animate)
if (!e.lib.show(e, "drum", "drum2")) return;
e.lib.drum(g, e, e.state.demo === "drum2" ? -0.45 : 0, "#c0503a", "#f0e2c0");
