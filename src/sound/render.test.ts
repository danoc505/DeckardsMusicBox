import test from "node:test";
import assert from "node:assert/strict";
import { compose } from "../song.ts";
import { resolveGenre } from "../genre/index.ts";
import { Engine, mono, peak, render, rms } from "./render.ts";
import { hat, kick, pluck, rhodes, snare, sub } from "./voices.ts";
import { Biquad } from "./dsp.ts";
import { wav } from "./wav.ts";

const SR = 22050;
const song = compose({ seed: 42, genre: "lofi", seconds: 60 });

test("the same record renders to the same samples", () => {
  const a = render(song, { sampleRate: SR });
  const b = render(song, { sampleRate: SR });
  assert.deepEqual(a.left, b.left);
  assert.deepEqual(a.right, b.right);
});

test("a render is finite, as long as the record, never clips, and is not quiet", () => {
  const st = render(song, { sampleRate: SR });
  const out = mono(st);
  assert.equal(out.length, Math.ceil(song.performance.seconds * SR));
  for (const v of out) assert.ok(Number.isFinite(v));
  for (const v of st.right) assert.ok(Number.isFinite(v));
  assert.ok(peak(out) <= 1, `peak ${peak(out)}`);
  assert.ok(peak(out) > 0.5, `peak ${peak(out)}: the record is quiet`);
  const level = 20 * Math.log10(rms(out));
  assert.ok(level > -24 && level < -8, `${level.toFixed(1)} dBFS`);
});

test("nothing sounds before the first event or after the tail", () => {
  const out = mono(render(song, { sampleRate: SR }));
  const first = song.performance.events[0]!.tSec;
  const before = out.subarray(0, Math.max(0, Math.floor((first - 0.02) * SR)));
  assert.ok(peak(before) < 0.05, `sound before the first event: ${peak(before)}`);
  // AND "AFTER THE TAIL" MEANS THE MUSIC, NOT THE MEDIUM. This asserted a
  // peak under 0.2 in the last fifth of a second, which a ringing tail and a
  // NOISE FLOOR both trip — and lofi's noise floor is a genre statement with a
  // source, not a fault: `vinyl.crackle` is continuous by design and crackle
  // is impulsive, so its peak is high where its energy is nothing. It passed
  // only while `wear` fired once in sixty records and no record ended on one.
  // Measured on the record below: tail peak 0.234, tail RMS 0.0041 against the
  // record's 0.1482 — 31 dB down. Forcing crackle to zero takes the peak to
  // 0.004, so the tail is the dust and nothing else.
  //
  // So the law is stated as what it always meant: a tail is sound that CARRIES
  // ON, and carrying on is energy, not spikes. RMS is the better detector for
  // the thing this test exists to catch — a ring, a runaway, a feedback loop
  // that never closes all show as sustained energy near the record's own —
  // and the absolute ceiling stays to catch a blow-up.
  const last = out.subarray(out.length - Math.floor(0.2 * SR));
  const down = 20 * Math.log10(rms(last) / rms(out));
  assert.ok(down < -20, `the tail carries on: ${down.toFixed(1)} dB below the record`);
  assert.ok(peak(last) < 0.5, `the tail blew up: ${peak(last)}`);
});

test("each instrument sounds where it should in the spectrum", () => {
  const n = (midi: number) => ({ midi, heldSec: 0.5, gain: 0.9, seed: 7, sampleRate: SR });
  const share = (buf: Float32Array, kind: "lowpass" | "highpass", hz: number): number => {
    const f = new Biquad(kind, hz, 0.71, SR);
    const filtered = new Float32Array(buf.length);
    for (let i = 0; i < buf.length; i++) filtered[i] = f.run(buf[i]!);
    return rms(filtered) / Math.max(1e-9, rms(buf));
  };
  // the kick lives under 200 Hz; the hat above 5 kHz; the snare in between
  assert.ok(share(kick(n(0)), "lowpass", 200) > 0.9, "the kick has a top end");
  assert.ok(share(hat(n(0), false), "highpass", 5000) > 0.8, "the hat has a low end");
  assert.ok(share(snare(n(0)), "highpass", 500) > 0.5 && share(snare(n(0)), "lowpass", 5000) > 0.5, "the snare is not in the middle");
  // the pitched voices carry their pitch: most energy near the fundamental
  for (const [name, v] of [["rhodes", rhodes], ["sub", sub], ["pluck", pluck]] as const) {
    const midi = name === "sub" ? 40 : 64;
    const hz = 440 * Math.pow(2, (midi - 69) / 12);
    const buf = v(n(midi));
    assert.ok(share(buf, "lowpass", hz * 3) > 0.6, `${name} is mostly above its third harmonic`);
    assert.ok(peak(buf) > 0.1 && peak(buf) <= 1, `${name} peaks at ${peak(buf)}`);
  }
});

test("a note is the same note wherever it falls", () => {
  const a = rhodes({ midi: 60, heldSec: 0.4, gain: 0.8, seed: 3, sampleRate: SR });
  const b = rhodes({ midi: 60, heldSec: 0.4, gain: 0.8, seed: 3, sampleRate: SR });
  assert.deepEqual(a, b);
});

test("the tape is the genre's: a clean genre keeps its top end, lofi loses it", () => {
  const topShare = (out: Float32Array): number => {
    const hp = new Biquad("highpass", 6000, 0.71, SR);
    const top = new Float32Array(out.length);
    for (let i = 0; i < out.length; i++) top[i] = hp.run(out[i]!);
    return rms(top) / rms(out);
  };
  const clean = resolveGenre("clean", { clean: { label: "C" } });
  const open = topShare(mono(render(compose({ seed: 42, genre: clean, seconds: 60 }), { sampleRate: SR })));
  const taped = topShare(mono(render(song, { sampleRate: SR })));
  assert.ok(taped < open, `lofi keeps ${taped.toFixed(3)} of its top end against a clean ${open.toFixed(3)}`);
});

test("the velocity layers cost less than 40 dB of the record", () => {
  // the cache renders a note once per layer, so what it approximates is
  // exactly this: the same record with every note rendered at its own
  // weight. The difference between the two is what the layers cost, and it
  // belongs far under anything an ear follows.
  const s = compose({ seed: 9, genre: "lofi", seconds: 60 });
  const layered = mono(render(s, { sampleRate: SR }));
  const exact = mono(render(s, { sampleRate: SR, layers: 100000 }));
  assert.equal(layered.length, exact.length);
  const diff = new Float32Array(exact.length);
  for (let i = 0; i < diff.length; i++) diff[i] = exact[i]! - layered[i]!;
  const below = 20 * Math.log10(rms(diff) / rms(exact));
  assert.ok(below < -40, `the layers cost ${below.toFixed(1)} dB, which is audible`);
  // and the knob is doing something: fewer layers must cost more
  const coarse = mono(render(s, { sampleRate: SR, layers: 8 }));
  const cd = new Float32Array(exact.length);
  for (let i = 0; i < cd.length; i++) cd[i] = exact[i]! - coarse[i]!;
  assert.ok(20 * Math.log10(rms(cd) / rms(exact)) > below);
});

test("the level a note is played at is its own, not its layer's", () => {
  // the layer decides the timbre; the note is then scaled. Two events of
  // the same pitch, length and layer but different weights must come out at
  // their own levels — if the scaling were dropped they would be identical.
  const s = compose({ seed: 9, genre: "lofi", seconds: 60 });
  const one = s.performance.events.find((e) => e.role === "keys")!;
  const nudge = (by: number) =>
    ({ ...s, performance: { ...s.performance, events: [{ ...one, gain: one.gain * by, tSec: 1, bar: 1 }] } }) as typeof s;
  const loud = rms(render(nudge(1), { sampleRate: SR }));
  const soft = rms(render(nudge(0.995), { sampleRate: SR }));
  // a shade quieter, well inside one layer, so the buffer is the same one
  assert.ok(soft < loud * 0.999, `a small cut came back at ${(soft / loud).toFixed(4)} — the layer answered for the note`);
});

test("a note that recurs is rendered once and is the same note each time", () => {
  const s = compose({ seed: 12, genre: "lofi", seconds: 90 });
  const out = render(s, { sampleRate: SR });
  const again = render(s, { sampleRate: SR });
  assert.deepEqual(out.left, again.left);
  // the record does repeat notes: the cache is not a no-op
  const keys = new Set(s.performance.events.map((e) => `${e.role}${e.lane}${e.pitch}${e.durSec}${Math.round(e.gain * 16)}`));
  assert.ok(keys.size < s.performance.events.length / 3, `${keys.size} distinct of ${s.performance.events.length}`);
});

test("the record does not depend on the block it is made in", () => {
  // The page plays the record in fifth-of-a-second chunks and saves it in one
  // pass. If the block boundary were anywhere in the arithmetic, what you
  // heard and what you saved would be different records.
  const one = render(song, { sampleRate: SR });
  for (const blockSize of [1, 128, 333, 8192, 1 << 20]) {
    const many = render(song, { sampleRate: SR, blockSize });
    assert.deepEqual(many.left, one.left, `left channel differs at block ${blockSize}`);
    assert.deepEqual(many.right, one.right, `right channel differs at block ${blockSize}`);
  }
});

/**
 * A record that MOVES ITS OWN DESK part way through, which the one above may
 * not be. The block-size guarantee is the whole reason a treatment lands on a
 * sample rather than on a block boundary, so it has to be held against a
 * record that actually has one — and the desk changes are asserted first, so
 * that this can never quietly become a test of nothing.
 *
 * BOTH TESTS BELOW USED TO RUN AT 8 kHz, ON THE GROUND THAT A TEST ABOUT WHERE
 * A BLOCK ENDS DOES NOT NEED HI-FI. That was true of the arithmetic and false
 * of the record. `Pole` clamps its cutoff at `sampleRate / 6` to keep the
 * state-variable filter stable and `Biquad` clamps at `sampleRate * 0.49`, so
 * at 8 kHz this genre's pole is pinned at 1333 Hz and its tape at 3920 Hz —
 * and this record's first move is `darken`, which is a change to both. Pinned,
 * it changed neither: the treatment at 14.4 s was EXACTLY a no-op, and what
 * these two tests were actually holding was the one `drench` at 101 s. The
 * record is now the 60-second one, whose desk moves twice inside it, rendered
 * where its filters can move.
 */
const treated = compose({ seed: 2, genre: "dungeonsynth", seconds: 60 });
/** Above `sr/6` for this genre's pole, which the record's own first move turns. */
const DESK_SR = 22050;

test("a treatment lands on its own sample, not on the caller's block boundary", () => {
  const changes = treated.performance.desk.filter((d) => d.tSec < treated.performance.seconds);
  assert.ok(changes.length >= 2, `this record only moves its desk ${changes.length} times`);
  // and at least one of them falls INSIDE a block of every size below, which
  // is the case that would break if `block` moved the desk at its own edges
  // at a coarse rate. 577 is coprime with every bar line in the record, so a
  // change is guaranteed to fall inside a block rather than on one.
  const one = render(treated, { sampleRate: DESK_SR });
  for (const blockSize of [577, 4096]) {
    const many = render(treated, { sampleRate: DESK_SR, blockSize });
    assert.deepEqual(many.left, one.left, `left channel differs at block ${blockSize}`);
    assert.deepEqual(many.right, one.right, `right channel differs at block ${blockSize}`);
  }
});

test("the record's own desk is heard", () => {
  // The same notes, rendered with the arrangement's treatments and with the
  // timeline emptied. If these came out identical the whole chain from
  // `arrange` through `perform` to here would be decorative.
  //
  // THIS IS NOT A TEST THAT THE TREATMENTS WORK, and it was read as one for
  // longer than it should have been: it passes while eleven of the twelve do
  // nothing, because one of them moved. Every treatment of every genre is held
  // to this one at a time in `stage/treat.test.ts`, which is the test that
  // caught `echoed` doing nothing at all on this genre.
  assert.ok(treated.performance.desk.length > 0, "this record never moves its desk");
  const flat = { ...treated, performance: { ...treated.performance, desk: [] } };
  const withDesk = render(treated, { sampleRate: DESK_SR });
  const without = render(flat, { sampleRate: DESK_SR });
  let worst = 0;
  for (let i = 0; i < withDesk.left.length; i++) {
    worst = Math.max(worst, Math.abs(withDesk.left[i]! - without.left[i]!));
  }
  assert.ok(worst > 0.005, `the treatments moved the record by at most ${worst}`);
  // AND IT IS A CHANGE OF SOUND RATHER THAN OF LOUDNESS. A treatment moves the
  // record without moving how loud it is: that is what distinguishes it from
  // the density moves, which is the whole reason it can answer the rule of
  // three without the arrangement getting quieter every time it does.
  assert.ok(
    Math.abs(rms(withDesk) - rms(without)) < 0.02,
    `treating the record moved its level from ${rms(without)} to ${rms(withDesk)}`,
  );
});

test("the engine hands out the record the renderer writes", () => {
  // driven by hand, in blocks of no particular size, the way a player would
  const engine = new Engine(song, { sampleRate: SR, blockSize: 4096 });
  const left = new Float32Array(engine.length);
  const right = new Float32Array(engine.length);
  const sizes = [1, 2, 4095, 4096, 700, 33];
  let at = 0;
  for (let i = 0; at < engine.length; i++) {
    const n = Math.min(sizes[i % sizes.length]!, engine.length - at);
    assert.equal(engine.at, at, "the engine knows where it is");
    assert.equal(engine.block(left.subarray(at, at + n), right.subarray(at, at + n), n), n);
    at += n;
  }
  assert.ok(engine.done);
  const whole = render(song, { sampleRate: SR });
  assert.deepEqual(left, whole.left);
  assert.deepEqual(right, whole.right);
});

test("a knob moved mid-record changes what follows it and nothing before it", () => {
  const base = song.chart.genre.sound;
  const half = Math.floor(Math.ceil(song.performance.seconds * SR) / 2);
  const engine = new Engine(song, { sampleRate: SR, blockSize: half });
  const L = new Float32Array(half * 2), R = new Float32Array(half * 2);
  engine.block(L.subarray(0, half), R.subarray(0, half), half);
  // the room thrown wide open, exactly as the bridge would send it
  engine.setDesk(base, { rack: { room: { sec: 9, ret: 1.8 } } } as never);
  engine.block(L.subarray(half, half * 2), R.subarray(half, half * 2), half);

  const plain = render(song, { sampleRate: SR });
  // before the knob: the same record, to the bit
  assert.deepEqual(L.subarray(0, half), plain.left.subarray(0, half));
  // after it: a different one
  const after = L.subarray(half, half * 2);
  let same = true;
  for (let i = 0; i < after.length; i++) if (after[i] !== plain.left[half + i]) { same = false; break; }
  assert.ok(!same, "the knob did not reach the record");
  for (const v of after) assert.ok(Number.isFinite(v));
});

test("a wav file has the right header and length", () => {
  const out = render(song, { sampleRate: SR });
  const bytes = wav(out.left, out.right, SR);
  assert.equal(String.fromCharCode(...bytes.subarray(0, 4)), "RIFF");
  assert.equal(String.fromCharCode(...bytes.subarray(8, 12)), "WAVE");
  assert.equal(new DataView(bytes.buffer).getUint16(22, true), 2, "two channels");
  assert.equal(bytes.length, 44 + out.left.length * 4);
});
