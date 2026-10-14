// the bow lantern burns as the bow comes onto the lighthouse
const oc = e.lib.clamp01(e.state.on_course);
e.layer("lamp").alpha = oc;
e.glow("lamp", oc);
