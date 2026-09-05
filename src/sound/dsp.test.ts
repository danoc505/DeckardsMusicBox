import assert from "node:assert/strict";
import test from "node:test";
import { Noise, Pole } from "./dsp.ts";

test("a pole moved with set() is the pole it would have been built as", () => {
  // the coefficients are the same coefficients, so a desk that walks the
  // cutoff lands on exactly the filter a desk that switched it would have
  const sr = 22050;
  const built = new Pole(3000, 0.2, sr);
  const moved = new Pole(500, 0.2, sr);
  moved.set(3000, 0.2);
  const n = new Noise(7);
  for (let i = 0; i < 2000; i++) {
    const x = n.next();
    assert.equal(moved.run(x), built.run(x));
  }
});

test("a pole moved with set() goes on from where it was, not from silence", () => {
  // run it into a steady state, move the cutoff, and the next sample is next
  // to the last one — a NEW pole at the new cutoff starts from zero, which is
  // the click a walking desk must not make at every step
  const sr = 22050;
  const p = new Pole(3000, 0.2, sr);
  let last = 0;
  for (let i = 0; i < 4000; i++) last = p.run(1);
  p.set(1500, 0.2);
  const next = p.run(1);
  assert.ok(Math.abs(next - last) < 0.05, `the pole jumped from ${last} to ${next} on set()`);
  const fresh = new Pole(1500, 0.2, sr);
  assert.ok(Math.abs(fresh.run(1) - last) > 0.5, "a fresh pole would not have jumped, so this test proves nothing");
});
