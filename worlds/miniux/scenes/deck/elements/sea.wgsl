// light crests over the sea's colour, from noise in the sea's own metres (so they stay where they are in the world and
// the ship passes over them), drifting slowly; faded where a pixel covers more than they are wide (far off)
fn shade(painted: vec4f, at: vec2f, uv: vec2f) -> vec4f {
  let fw = length(at_dx) + length(at_dy);
  let p = vec2f(at.x * 0.18, at.y * 0.45);
  let w = noise2(p + vec2f(u_time * 0.05, u_time * 0.12));
  let crest = smoothstep(0.62, 0.8, w) * clamp(1.0 - fw * 0.6, 0.0, 1.0);
  let swell = noise2(at * 0.02) * 0.1;
  let base = painted.rgb * (0.95 + swell);
  let c = mix(base, vec3f(0.85, 0.9, 0.95) * painted.a, crest * 0.35);
  return vec4f(c, painted.a);
}
