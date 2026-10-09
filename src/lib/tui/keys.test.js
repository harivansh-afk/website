// the keyboard is a pure function, so a keystroke sequence is a test: run
// with `node --test`
import { test } from "node:test";
import assert from "node:assert/strict";
import { step, initial } from "./keys.js";

const counts = [12, 7, 5, 4, 2, 5, 5];
const view = { sections: counts.length, rows: (s) => (s.query === null ? counts[s.s] : 3), page: 10 };

function run(keys) {
  let state = initial;
  const effects = [];
  for (const key of keys) {
    const out = step(state, key, view);
    if (!out) continue;
    state = out.state;
    effects.push(out.effect);
  }
  return { state, effects };
}

test("j k move within the focused pane", () => {
  const { state } = run(["j", "j", "l", "j", "j", "j"]);
  assert.deepEqual([state.s, state.r, state.pane], [2, 3, "rows"]);
});

test("moves stop at the ends", () => {
  assert.equal(run(["j", "l", "G", "j"]).state.r, 6);
  assert.equal(run(["k", "k"]).state.s, 0);
});

for (const back of ["-", "Escape"]) {
  test(`${back} goes up a level, then home`, () => {
    const up = run(["l", "j", back]);
    assert.deepEqual([up.state.pane, up.state.r], ["sections", 1]);
    assert.deepEqual(run(["l", back, back]).effects, [null, null, "home"]);
  });

  test(`${back} leaves filtered rows and restores section navigation`, () => {
    const keys = ["j", "/", "m", "Enter", "j", back];
    assert.deepEqual(run(keys).state, { ...initial, s: 1 });
    assert.deepEqual(run([...keys, "j"]).state, { ...initial, s: 2 });
    assert.equal(run([...keys, back]).effects.at(-1), "home");
  });
}

test("enter goes in, then opens", () => {
  assert.deepEqual(run(["l", "Enter"]).effects, [null, "open"]);
});

test("/ types a query that takes every key", () => {
  const { state } = run(["/", "m", "j", "-"]);
  assert.equal(state.query, "mj-");
  assert.ok(state.typing);
});

test("esc cancels typing before navigating back", () => {
  const { state, effects } = run(["/", "m", "Escape"]);
  assert.deepEqual(state, { ...initial, pane: "rows" });
  assert.ok(!effects.includes("home"));
});

test("ctrl-d moves half a page", () => {
  assert.equal(run(["l", "ctrl-d"]).state.r, 5);
});

test("keys it doesn't know are left to the browser", () => {
  assert.equal(step(initial, "x", view), null);
});
