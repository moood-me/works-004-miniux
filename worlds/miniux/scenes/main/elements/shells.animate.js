// when `shell` changes to a shell, that one answers: it sways — or, the odd one (`shell_odd`), it glows
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
for (const id of ["s1", "s2", "s3"]) {
  const mine = m.who === id;
  const odd = id === e.state.shell_odd;
  e.layer(id).rotate = mine && !odd ? 0.3 * e.lib.ring(s, 12, 3) : 0;
  e.layer("glow_" + id).alpha = mine && odd ? e.lib.flash(s, 0.9) : 0;
}
