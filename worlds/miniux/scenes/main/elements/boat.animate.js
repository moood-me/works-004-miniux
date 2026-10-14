// the boat turned by `boat_heading` (±1 — ±60°), its bow's point with it; the zone, the firefly or the bee where
// `zone_center` says on the scale (±1 — its ends), shown by `zone_kind`, lit by `zone_lit` (the bee, lit, flares —
// the needle is where it should not be)
if (!e.lib.show(e, "boat")) return;
const A = Math.PI / 3;
const cl = (v) => Math.max(-1, Math.min(1, Number(v) || 0));
const h = cl(e.state.boat_heading) * A;
e.layer("boat").rotate = h;
e.at(0.3 * Math.sin(h), -0.3 - 0.3 * Math.cos(h), "bow");
const z = cl(e.state.zone_center) * A;
const kind = e.state.zone_kind ?? "zone";
const lit = e.lib.clamp01(e.state.zone_lit);
const zone = e.layer("zone");
zone.rotate = z;
zone.alpha = kind === "zone" ? 1 : 0;
const zl = e.layer("zone_lit");
zl.rotate = z;
zl.alpha = kind === "zone" ? lit : 0;
const fly = e.layer("firefly");
fly.rotate = z + 0.03 * e.anim.noise(e.t * 1.3, 1);
fly.alpha = kind === "firefly" ? 1 : 0;
fly.brightness = 1 + 0.6 * lit;
e.glow("fly", kind === "firefly" ? 0.25 + 0.75 * lit : 0);
const bee = e.layer("bee");
bee.rotate = z + 0.04 * e.anim.noise(e.t * 3, 2);
bee.alpha = kind === "bee" ? 1 : 0;
bee.brightness = 1 + 0.5 * lit;
