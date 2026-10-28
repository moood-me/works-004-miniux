// The ship's way and its rocking — keys this script keeps (the game never sets them):
// - ship_f, its facing in the world: 180 (straight at the lighthouse) + 25° × `heading`, kept with `heading` as it moves;
// - ship_x, ship_d, where it is: each second moved on the way it faces, 1.2 m/s × `under_way`; it stops 300 m short of
//   the lighthouse (a kilometre ahead at the start: some ten minutes under way);
// - heel, its roll: a slow rock either side, as large as `roll` says, larger under way.
const LIGHT = [0, 1000];
const STOP = 300;
const SPEED = 1.2;
const TURN = 25;

const aim = () => scene.set("ship_f", 180 + TURN * (Number(scene.state.heading) || 0));
aim();
scene.on("change", "heading", aim);
scene.on("move", "heading", aim);

scene.every(1, () => {
  const s = scene.state;
  const left = Math.hypot(LIGHT[0] - s.ship_x, LIGHT[1] - s.ship_d);
  const v = left > STOP ? SPEED * (Number(s.under_way) || 0) : 0;
  if (v <= 0) return;
  const f = ((s.ship_f - 180) * Math.PI) / 180;
  scene.move("ship_x", s.ship_x + v * 1.1 * Math.sin(f), { over: 1.1 });
  scene.move("ship_d", s.ship_d + v * 1.1 * Math.cos(f), { over: 1.1 });
});

let side = 1;
const rock = () => {
  const s = scene.state;
  const a = (1 + 2 * (Number(s.under_way) || 0)) * 1.5 * (Number(s.roll) || 0);
  side = -side;
  scene.move("heel", side * a, { over: 3.2, ease: "inOut" });
};
rock();
scene.every(3.2, rock);
