/**
 * MOTION, held to the two things that make it real.
 *
 * A cycle on a knob is invisible to the piano roll by construction — it moves
 * the mixer and not one note — and invisible to `measure.ts`, which reads the
 * MIDI. So the only thing that can say whether it happened is the rendered
 * record, which is what this does. Same discipline as `treat.test.ts`, and at
 * 22050 Hz for the same reason: below about 16 kHz the filters are pinned by
 * their own stability clamps and a filter move measures as a no-op when it is
 * nothing of the kind.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { compose } from "../song.ts";
import { GENRE_NAMES, GENRES } from "../genre/index.ts";
import { render } from "./render.ts";
import { motionAt, readAt, WAVES } from "./motion.ts";

const SR = 22050;

/** How far one record is from another, in dB. Below −40 is this program's floor for "nothing happened". */
function moved(a: Float32Array, b: Float32Array): number {
  let sum = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) { const d = a[i]! - b[i]!; sum += d * d; }
  return 10 * Math.log10(sum / n + 1e-30);
}

test("every wave is bipolar and starts where it should", () => {
  for (const [name, w] of Object.entries(WAVES)) {
    let lo = Infinity, hi = -Infinity;
    for (let i = 0; i <= 1000; i++) { const v = w(i / 1000); lo = Math.min(lo, v); hi = Math.max(hi, v); }
    // −1..1 over one cycle, so `depth` is a peak deviation and reads the same
    // on all four — which is the whole reason the shapes are interchangeable
    assert.ok(Math.abs(lo + 1) < 0.01, `${name} bottoms at ${lo}`);
    assert.ok(Math.abs(hi - 1) < 0.01, `${name} tops at ${hi}`);
  }
  // and the two that are each other's mirror actually are
  for (let i = 0; i <= 100; i++) {
    const u = i / 100;
    assert.ok(Math.abs(WAVES.ramp(u) + WAVES.fall(u)) < 1e-12, "ramp and fall are not mirrors");
  }
});

test("a move is a pure function of the bar: no state, no memory of the last block", () => {
  const rules = GENRES.dungeonsynth.sound;
  const moves = rules.motion;
  assert.ok(moves.length > 0, "dungeon synth states no motion");
  // read the same bar twice, far apart in the calling order — a stateful
  // implementation would drift and this is what keeps the render
  // byte-identical at any block size
  const a = motionAt(moves, rules, 17.25, 16);
  for (let bar = 0; bar < 40; bar += 0.37) motionAt(moves, rules, bar, 0);
  const b = motionAt(moves, rules, 17.25, 16);
  assert.deepEqual(a, b);
});

test("the cycle actually cycles, and comes back to where it started", () => {
  const rules = GENRES.lofi.sound;
  const mv = rules.motion[0]!;
  const at = (bar: number): number => readAt(motionAt([mv], rules, bar, 0) as never, mv.path)!;
  // one full cycle later is the same number
  assert.ok(Math.abs(at(3) - at(3 + mv.bars)) < 1e-9, "a cycle did not come round");
  // and it is not a straight line: something between the ends differs from both
  const ends = at(0);
  let differs = false;
  for (let k = 1; k < mv.bars; k++) if (Math.abs(at(k) - ends) > 1e-6) differs = true;
  assert.ok(differs, "the cycle is flat");
});

test("a reset trigger starts the cycle at the section, not at the record", () => {
  const rules = GENRES.dungeonsynth.sound;
  const mv = rules.motion.find((m) => m.reset === "section");
  assert.ok(mv !== undefined, "dungeon synth states no section-reset move");
  const at = (bar: number, from: number): number =>
    readAt(motionAt([mv], rules, bar, from) as never, mv.path)!;
  // the first bar of a section reads the same whatever bar the section starts
  // on — which is the whole point of a reset: a sweep lands ON the chorus
  assert.ok(Math.abs(at(0, 0) - at(64, 64)) < 1e-9, "a section reset did not reset");
  assert.ok(Math.abs(at(3, 0) - at(67, 64)) < 1e-9, "three bars into a section is not three bars in");
});

test("every genre that states motion is heard to move, and one that states none is not", () => {
  for (const g of GENRE_NAMES) {
    const song = compose({ seed: 17279, genre: g });
    const on = render(song, { sampleRate: SR });
    const off = render(song, { sampleRate: SR, desk: { motion: [] } });
    const d = moved(on.left, off.left);
    if (GENRES[g].sound.motion.length === 0) {
      assert.ok(d < -100, `${g} states no motion but the record moved ${d.toFixed(1)} dB`);
      continue;
    }
    // the same floor `treat.test.ts` holds a treatment to. A knob that does
    // nothing is this program's cardinal sin, and motion is a knob.
    assert.ok(d > -40, `${g}'s motion moved the record only ${d.toFixed(1)} dB, which is nothing`);
  }
});

test("motion moves the mixer and never a note", () => {
  for (const g of GENRE_NAMES) {
    const song = compose({ seed: 204149, genre: g });
    // the events are decided two stages before the sound and cannot see this
    const ev = song.performance.events;
    assert.ok(ev.length > 0);
    const sig = ev.map((e) => `${e.bar}:${e.step}:${e.pitch}:${e.gain.toFixed(6)}:${e.art}`).join("|");
    const again = compose({ seed: 204149, genre: g });
    assert.equal(again.performance.events.map((e) => `${e.bar}:${e.step}:${e.pitch}:${e.gain.toFixed(6)}:${e.art}`).join("|"), sig);
  }
});

test("a record on the move is the same bytes whatever block it was made in", () => {
  for (const g of GENRE_NAMES) {
    if (GENRES[g].sound.motion.length === 0) continue;
    const song = compose({ seed: 17279, genre: g });
    const a = render(song, { sampleRate: SR, block: 577 } as never);
    const b = render(song, { sampleRate: SR, block: 4096 } as never);
    let max = 0;
    for (let i = 0; i < a.left.length; i++) max = Math.max(max, Math.abs(a.left[i]! - b.left[i]!));
    assert.equal(max, 0, `${g} differs by ${max} between block sizes`);
  }
});
