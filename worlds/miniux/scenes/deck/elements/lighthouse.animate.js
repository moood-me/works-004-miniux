// on course (`on_course` 1) the light shines bright, its halo wide, its beams sweeping; off course it is dimmer
const oc = Math.max(0, Math.min(1, Number(e.state.on_course) || 0));
const halo = e.layer("halo");
halo.alpha = 0.35 + 0.65 * oc;
halo.scale = 0.8 + 0.6 * oc;
const beam = e.layer("beam");
beam.alpha = 0.8 * oc;
beam.scaleX = 0.25 + 0.75 * Math.abs(Math.cos(e.t * 0.5));
e.glow("light", 0.4 + 0.6 * oc);
