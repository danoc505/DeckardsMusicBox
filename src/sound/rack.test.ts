import test from "node:test";
import assert from "node:assert/strict";
import { Echo, Ensemble, Flanger, Medium, Pole, Spring, Biquad } from "./dsp.ts";
import { compose } from "../song.ts";
import { render, rms, settle } from "./render.ts";
import { GENRES } from "../genre/index.ts";
import { RACK_ORDER } from "../genre/spec.ts";

const SR = 22050;
const impulse = (n: number): Float32Array => { const b = new Float32Array(n); b[0] = 1; return b; };
const through = (run: (x: number) => number, input: Float32Array): Float32Array => input.map((x) => run(x));
const argmax = (b: Float32Array, from = 1): number => { let k = from; for (let i = from; i < b.length; i++) if (Math.abs(b[i]!) > Math.abs(b[k]!)) k = i; return k; };
const sine = (hz: number, n: number): Float32Array => Float32Array.from({ length: n }, (_, i) => Math.sin((2 * Math.PI * hz * i) / SR));

test("an echo comes back at the time set, quieter each time", () => {
  const e = new Echo(0.1, 0.5, SR);
  const out = through((x) => e.run(x), impulse(SR));
  const first = argmax(out, 1);
  // within a few samples: the damping in the loop adds a little group delay
  assert.ok(Math.abs(first - 0.1 * SR) <= 6, `first echo at ${first / SR}s`);
  const second = argmax(out, first + 100);
  assert.ok(Math.abs(second - 0.2 * SR) <= 12, `second echo at ${second / SR}s`);
  assert.ok(Math.abs(out[second]!) < Math.abs(out[first]!), "the repeats do not die away");
});

test("the pole takes the top off and leaves the bottom", () => {
  const low = sine(200, SR), high = sine(6000, SR);
  const p1 = new Pole(800, 0.2, SR), p2 = new Pole(800, 0.2, SR);
  const keptLow = rms(through((x) => p1.run(x), low)) / rms(low);
  const keptHigh = rms(through((x) => p2.run(x), high)) / rms(high);
  assert.ok(keptLow > 0.8, `low kept ${keptLow.toFixed(2)}`);
  assert.ok(keptHigh < 0.1, `high kept ${keptHigh.toFixed(2)}`);
});

test("the flanger and the ensemble are wet copies, finite and bounded", () => {
  for (const unit of [new Flanger(0.5, 0.8, SR), new Ensemble(0.6, 0.7, SR)]) {
    const out = through((x) => unit.run(x), sine(440, SR));
    for (const v of out) assert.ok(Number.isFinite(v));
    const level = rms(out);
    assert.ok(level > 0.3 && level < 1.2, `level ${level.toFixed(2)}`);
  }
});

test("the spring and the medium ring and colour, and settle", () => {
  const s = new Spring(1.0, SR);
  const tail = through((x) => s.run(x), impulse(SR * 2));
  assert.ok(rms(tail.subarray(0, SR / 4)) > rms(tail.subarray(SR, SR + SR / 4)) * 3, "the spring does not settle");
  const m = new Medium("gramophone", 7, SR);
  const coloured = through((x) => m.run(x), sine(1400, SR));
  const hp = new Biquad("highpass", 6000, 0.7, SR);
  const top = through((x) => hp.run(x), coloured);
  assert.ok(rms(top) / rms(coloured) < 0.2, "a gramophone has a top end");
});

test("every unit in the rack, bypassed, renders the same record as none of them", () => {
  const g = GENRES.lofi;
  for (const unit of RACK_ORDER) assert.ok(unit in g.sound.rack, `no ${unit} in the rack`);
  const clean = { rack: { pole: { mix: 0 }, flange: { mix: 0 }, ensemble: { mix: 0 }, echo: { mix: 0 }, spring: { mix: 0 }, room: { mix: 0 }, medium: { mix: 0 }, vinyl: { crackle: 0 }, tape: { lowpassHz: 20000, wowCents: 0, drive: 1 } } };
  const s = compose({ seed: 4, genre: "lofi", seconds: 45 });
  const a = render(s, { sampleRate: SR, ...clean });
  const b = render(s, { sampleRate: SR, ...clean });
  assert.deepEqual(a, b);
  // and turning a unit up changes the record
  const wet = render(s, { sampleRate: SR, rack: { ...clean.rack, echo: { mix: 0.6, beats: 1, feedback: 0.5 } } });
  let diff = 0; for (let i = 0; i < a.length; i++) diff += Math.abs(a[i]! - wet[i]!);
  assert.ok(diff / a.length > 1e-3, "the echo knob did nothing");
});

test("a page's knob settles over the genre's, and only that knob", () => {
  const base = GENRES.dungeonsynth.sound.rack;
  const r = settle(base, { room: { mix: 0.9 }, tape: { drive: 3 } });
  assert.equal(r.room.mix, 0.9);
  assert.equal(r.room.sec, base.room.sec);
  assert.equal(r.tape.drive, 3);
  assert.equal(r.tape.lowpassHz, base.tape.lowpassHz);
  assert.deepEqual(r.echo, base.echo);
});
