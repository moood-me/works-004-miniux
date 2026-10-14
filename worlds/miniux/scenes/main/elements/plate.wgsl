// the plate as painted, and over it its dust (layer 1) where the noise is above what is wiped (u_clean 0..1):
// it goes in patches, all of it at 1
fn shade(painted: vec4f, at: vec2f, uv: vec2f) -> vec4f {
  let dust = layer(1, at);
  let n = noise2(at * 9.0) * 0.6 + noise2(at * 23.0) * 0.4;
  let keep = clamp((n - u_clean * 1.15 + 0.15) / 0.1, 0.0, 1.0);
  let d = dust * keep;
  return d + painted * (1.0 - d.a);
}
