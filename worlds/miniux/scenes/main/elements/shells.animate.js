// when `shell` changes to a shell, that one answers: it sways — or, the odd one (`shell_odd`), it opens a little for
// a moment, a pearl seen in it, a warm light round it
if (!e.lib.show(e, "shells")) return;
const m = e.mem;
const cur = e.state.shell ?? "none";
if (m.last === undefined) m.last = cur;
if (cur !== m.last) {
  m.last = cur;
  if (cur !== "none") {
    m.who = cur;
    m.at = e.t;
  }
}
const s = m.who ? e.t - m.at : 99;
// (open: up quickly, a second open, closing in half a second; not once it is found — then it is painted open)
const open = e.state.shell_found === true ? 0 : s < 0.15 ? s / 0.15 : s < 1.3 ? 1 : Math.max(0, 1 - (s - 1.3) / 0.5);
for (const id of ["s1", "s2", "s3"]) {
  const mine = m.who === id;
  const odd = id === e.state.shell_odd;
  const k = mine && odd ? open : 0;
  const lid = e.layer(id);
  lid.rotate = mine && !odd ? 0.3 * e.lib.ring(s, 12, 3) : -0.18 * k;
  lid.y = -0.07 * k;
  e.layer("inner_" + id).alpha = k > 0 ? 1 : 0;
  e.layer("glow_" + id).alpha = 0.9 * k;
}
