import test from "node:test";
import assert from "node:assert/strict";
import {
  clock, stepsPerBar, clockFace, barsForSec, secForBars, FOUR_FOUR, type Metre,
} from "./clock.ts";

const near = (a: number, b: number, eps = 1e-9) =>
  assert.ok(Math.abs(a - b) < eps, `${a} !== ${b}`);

test("metre decides how many steps a bar holds", () => {
  assert.equal(stepsPerBar(FOUR_FOUR), 16);
  assert.equal(stepsPerBar({ beats: 3, perBeat: 4 }), 12);
  assert.equal(stepsPerBar({ beats: 2, perBeat: 3 }), 6);
});

test("a steady record places bars and steps exactly", () => {
  const c = clock({ tempo: 120, bars: 8 });
  assert.equal(c.varies, false);
  assert.equal(c.steps, 16);
  near(c.stepSec(0), 0.125); // a sixteenth at 120 bpm
  near(c.barSec(0), 2);
  near(c.at(0), 0);
  near(c.at(1), 2);
  near(c.at(0, 8), 1); // halfway through bar 0
  near(c.at(3, 4), 6.5);
});

test("the closed form is exact, not accumulated", () => {
  // the arithmetic a caller would have written by hand, to the bit
  const c = clock({ tempo: 97.3, bars: 64 });
  const sec = 60 / 97.3 / 4;
  for (const [bar, step] of [[0, 0], [1, 3], [17, 15], [63, 7]] as const) {
    assert.equal(c.at(bar, step), (bar * 16 + step) * sec);
  }
});

test("seconds and bars invert each other", () => {
  const c = clock({ tempo: 84, bars: 32 });
  for (const bar of [0, 0.5, 7, 12.25, 31.9]) near(c.barAt(c.at(bar)), bar);
  for (const sec of [0, 1.7, 33.3, 90]) near(c.at(c.barAt(sec)), sec, 1e-8);
});

test("stepAt counts absolute steps", () => {
  const c = clock({ tempo: 120, bars: 4 });
  near(c.stepAt(0), 0);
  near(c.stepAt(0.125), 1);
  near(c.stepAt(2), 16);
  near(c.stepAt(2.25), 18);
});

test("a pickup before bar zero has negative time and does not clamp", () => {
  const c = clock({ tempo: 100, bars: 8 });
  assert.ok(c.at(0, -2) < 0);
  near(c.at(0, -2), -2 * c.stepSec(0));
  assert.ok(c.at(-1) < c.at(0));
  assert.ok(c.barAt(-0.5) < 0);
});

test("an ending past the last bar keeps going forward", () => {
  const c = clock({ tempo: 100, bars: 8 });
  const end = c.at(8);
  assert.ok(c.at(8, 4) > end);
  assert.ok(c.at(9) > c.at(8));
  assert.ok(c.barAt(end + 10) > 8);
});

test("a metre that is not 4/4 measures its own bar", () => {
  const waltz: Metre = { beats: 3, perBeat: 4 };
  const c = clock({ tempo: 120, bars: 8, metre: waltz });
  assert.equal(c.steps, 12);
  near(c.stepSec(0), 0.125);
  near(c.barSec(0), 1.5); // three beats, not four
  near(c.at(2), 3);
});

test("a tempo map moves the bars it names", () => {
  const c = clock({ tempo: [60, 120, 120, 60], bars: 4 });
  assert.equal(c.varies, true);
  assert.equal(c.tempoAt(0), 60);
  assert.equal(c.tempoAt(1), 120);
  near(c.barSec(0), 4); // four beats at 60 bpm
  near(c.barSec(1), 2);
  near(c.at(0), 0);
  near(c.at(1), 4);
  near(c.at(2), 6);
  near(c.at(3), 8);
  near(c.at(4), 12);
});

test("a varying clock still inverts", () => {
  const c = clock({ tempo: [60, 132, 90, 75, 110], bars: 5 });
  for (const bar of [0, 0.3, 1, 2.75, 4.5]) near(c.barAt(c.at(bar)), bar, 1e-8);
  for (const bar of [0, 1.5, 3.2, 4.9]) near(c.stepAt(c.at(bar)), bar * 16, 1e-6);
});

test("a varying clock never runs backwards", () => {
  const c = clock({ tempo: [60, 180, 61, 179, 62], bars: 5 });
  let last = -Infinity;
  for (let b = -2; b <= 8; b += 0.125) {
    const t = c.at(b);
    assert.ok(t > last, `time went backwards at bar ${b}`);
    last = t;
  }
});

test("a map naming one tempo is a steady record", () => {
  const mapped = clock({ tempo: [96, 96, 96, 96], bars: 4 });
  const flat = clock({ tempo: 96, bars: 4 });
  assert.equal(mapped.varies, false);
  // and identical to the bit, so declaring a flat map cannot move a note
  for (const [bar, step] of [[0, 0], [2, 9], [3, 15]] as const) {
    assert.equal(mapped.at(bar, step), flat.at(bar, step));
  }
});

test("a bad tempo is refused rather than producing silence", () => {
  assert.throws(() => clock({ tempo: 0, bars: 4 }), /bad tempo/);
  assert.throws(() => clock({ tempo: -1, bars: 4 }), /bad tempo/);
  assert.throws(() => clock({ tempo: NaN, bars: 4 }), /bad tempo/);
  assert.throws(() => clock({ tempo: [120, 0], bars: 4 }), /bad tempo/);
  assert.throws(() => clock({ tempo: [], bars: 4 }), /at least one bar/);
});

test("bars and seconds convert both ways", () => {
  assert.equal(barsForSec(120, 120), 60);
  near(secForBars(60, 120), 120);
  assert.equal(barsForSec(0.01, 120), 1); // never zero bars
  // a 3/4 bar is three beats, so the same time holds more of them
  assert.equal(barsForSec(60, 120, { beats: 3, perBeat: 4 }), 40);
});

test("clockFace prints a time", () => {
  assert.equal(clockFace(0), "0:00");
  assert.equal(clockFace(9), "0:09");
  assert.equal(clockFace(61.9), "1:01");
  assert.equal(clockFace(624.32), "10:24");
  assert.equal(clockFace(-5), "0:00");
});
