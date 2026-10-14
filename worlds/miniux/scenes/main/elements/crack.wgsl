// the board as painted, and over it the glue (layer 1) left of the edge (u_edge, metres across), the edge a pixel soft
fn shade(painted: vec4f, at: vec2f, uv: vec2f) -> vec4f {
  let glue = layer(1, at);
  let soft = abs(at_dx.x) + abs(at_dy.x) + 0.002;
  let k = clamp((u_edge - at.x) / soft, 0.0, 1.0);
  let g = glue * k;
  return g + painted * (1.0 - g.a);
}
