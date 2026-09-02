import test from "node:test";
import assert from "node:assert/strict";
import { Echo, Ensemble, Flanger, Medium, Pole, Spring, Biquad } from "./dsp.ts";
import { compose } from "../song.ts";
import { mono, render, rms, settle } from "./render.ts";
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

test("every unit in the rack, bypassed, renders the same record twice, and a send is heard", () => {
  const g = GENRES.lofi;
  for (const unit of RACK_ORDER) assert.ok(unit in g.sound.rack, `no ${unit} in the rack`);
  const dry = { desk: { rack: { pole: { mix: 0 }, medium: { mix: 0 }, vinyl: { crackle: 0 }, tape: { lowpassHz: 20000, wowCents: 0, drive: 1 } },
    mix: { keys: { sends: { echo: 0, room: 0 } }, lead: { sends: { echo: 0, room: 0 }, pedals: 0 }, drone: { sends: { room: 0 } } } } };
  const s = compose({ seed: 4, genre: "lofi", seconds: 30 });
  const a = mono(render(s, { sampleRate: SR, ...dry }));
  const b = mono(render(s, { sampleRate: SR, ...dry }));
  assert.deepEqual(a, b);
  const wet = mono(render(s, { sampleRate: SR, desk: { ...dry.desk, mix: { ...dry.desk.mix, keys: { sends: { echo: 0.8, room: 0 } } }, rack: { ...dry.desk.rack, echo: { beats: 1, feedback: 0.5, ret: 1 } } } }));
  let diff = 0; for (let i = 0; i < a.length; i++) diff += Math.abs(a[i]! - wet[i]!);
  assert.ok(diff / a.length > 1e-3, "the echo send did nothing");
});

test("a page's knob settles over the genre's, and only that knob, at any depth", () => {
  const base = GENRES.dungeonsynth.sound;
  const r = settle(base, { rack: { room: { ret: 0.2 }, tape: { drive: 3 } }, mix: { lead: { az: -90 } } });
  assert.equal(r.rack.room.ret, 0.2);
  assert.equal(r.rack.room.sec, base.rack.room.sec);
  assert.equal(r.rack.tape.drive, 3);
  assert.equal(r.rack.tape.lowpassHz, base.rack.tape.lowpassHz);
  assert.deepEqual(r.rack.echo, base.rack.echo);
  assert.equal(r.mix.lead.az, -90);
  assert.equal(r.mix.lead.dist, base.mix.lead.dist);
  assert.deepEqual(r.mix.keys, base.mix.keys);
});

test("the world is stereo: a part to the right is louder and earlier in the right ear", () => {
  const s = compose({ seed: 2, genre: "lofi", seconds: 24 });
  const right = render(s, { sampleRate: SR, only: "lead", desk: { world: { width: 1, depth: 0 }, mix: { lead: { az: 90, pan: 0, sweepDepth: 0, pedals: 0, sends: { echo: 0, room: 0 } } } } });
  assert.ok(rms(right.right) > rms(right.left) * 1.3, `right ${rms(right.right).toFixed(4)} vs left ${rms(right.left).toFixed(4)}`);
  const left = render(s, { sampleRate: SR, only: "lead", desk: { world: { width: 1, depth: 0 }, mix: { lead: { az: -90, pan: 0, sweepDepth: 0, pedals: 0, sends: { echo: 0, room: 0 } } } } });
  assert.ok(rms(left.left) > rms(left.right) * 1.3);
  // the far ear is late: the peak of the cross-correlation sits at a positive lag
  const lag = (a: Float32Array, b: Float32Array): number => {
    let best = 0, bestV = -Infinity;
    for (let k = -40; k <= 40; k++) {
      let acc = 0;
      for (let i = 1000; i < a.length - 1000; i += 3) acc += a[i]! * b[i + k]!;
      if (acc > bestV) { bestV = acc; best = k; }
    }
    return best;
  };
  const k = lag(right.right, right.left);
  // the head's delay, plus a few samples the far ear's shadow filter adds
  assert.ok(k > 0 && k <= Math.round(0.00065 * SR) + 6, `the far ear is late by ${k} samples`);
  // and a mono world collapses it
  const flat = render(s, { sampleRate: SR, only: "lead", desk: { world: { width: 0, depth: 0 }, mix: { lead: { az: 90, pan: 0, sweepDepth: 0, pedals: 0, sends: { echo: 0, room: 0 } } } } });
  assert.deepEqual(flat.left, flat.right);
});

test("a distant part is quieter and darker than a near one", () => {
  const s = compose({ seed: 2, genre: "lofi", seconds: 24 });
  const at = (dist: number) => mono(render(s, { sampleRate: SR, only: "keys", desk: { world: { width: 0, depth: 1 }, mix: { keys: { dist, sends: { echo: 0, room: 0 } } } } }));
  const near = at(0), far = at(1);
  assert.ok(rms(far) < rms(near) * 0.6, `far ${rms(far).toFixed(4)} near ${rms(near).toFixed(4)}`);
  const top = (b: Float32Array) => { const f = new Biquad("highpass", 4000, 0.7, SR); const o = new Float32Array(b.length); for (let i = 0; i < b.length; i++) o[i] = f.run(b[i]!); return rms(o) / rms(b); };
  assert.ok(top(far) < top(near), "the far part kept its top end");
});

test("the pedal board is heard only where a part feeds it, and every pedal does something", () => {
  const s = compose({ seed: 5, genre: "lofi", seconds: 24 });
  const off = mono(render(s, { sampleRate: SR, only: "lead", desk: { mix: { lead: { pedals: 0, sends: { echo: 0, room: 0 } } } } }));
  const same = mono(render(s, { sampleRate: SR, only: "lead", desk: { mix: { lead: { pedals: 1, sends: { echo: 0, room: 0 } } }, pedals: { wah: { mix: 0 }, overdrive: { mix: 0 }, fuzz: { mix: 0 }, phaser: { mix: 0 }, tremolo: { mix: 0 } } } }));
  assert.deepEqual(same, off, "a board with every pedal off changed the part");
  for (const pedal of ["wah", "overdrive", "fuzz", "phaser", "tremolo"] as const) {
    const on = mono(render(s, { sampleRate: SR, only: "lead", desk: { mix: { lead: { pedals: 1, sends: { echo: 0, room: 0 } } }, pedals: { wah: { mix: 0 }, overdrive: { mix: 0 }, fuzz: { mix: 0 }, phaser: { mix: 0 }, tremolo: { mix: 0 }, [pedal]: { mix: 1 } } } }));
    let diff = 0; for (let i = 0; i < on.length; i++) diff += Math.abs(on[i]! - off[i]!);
    assert.ok(diff / on.length > 1e-4, `${pedal} did nothing`);
    for (const v of on) assert.ok(Number.isFinite(v) && Math.abs(v) <= 1, `${pedal} left full scale`);
  }
});

test("the patch: a return into another return is heard, a return into itself rings and settles", () => {
  const s = compose({ seed: 6, genre: "lofi", seconds: 24 });
  const base = { rack: { pole: { mix: 0 }, medium: { mix: 0 }, vinyl: { crackle: 0 }, tape: { lowpassHz: 20000, wowCents: 0, drive: 1 }, echo: { beats: 0.5, feedback: 0.2, ret: 1 }, spring: { sec: 1, ret: 1 } },
    mix: { keys: { sends: { echo: 0.7, room: 0, spring: 0 } }, lead: { sends: { echo: 0, room: 0 }, pedals: 0 }, drone: { sends: { room: 0 } } } };
  const dry = mono(render(s, { sampleRate: SR, only: "keys", desk: base }));
  // echo into the spring: the spring is fed by nothing else, so any change is the patch
  const chained = mono(render(s, { sampleRate: SR, only: "keys", desk: { ...base, patch: { echo: { spring: 0.8 } } } }));
  let diff = 0; for (let i = 0; i < dry.length; i++) diff += Math.abs(dry[i]! - chained[i]!);
  assert.ok(diff / dry.length > 1e-3, "the patch echo→spring was not heard");
  // the echo into itself, hot: it rings, and it never leaves full scale
  const hot = render(s, { sampleRate: SR, only: "keys", desk: { ...base, patch: { echo: { echo: 0.85 } } } });
  for (const v of hot.left) assert.ok(Number.isFinite(v) && Math.abs(v) <= 1);
  // and under unity it settles once the playing stops: the record's tail is quieter than its body
  const cool = render(s, { sampleRate: SR, only: "keys", desk: { ...base, patch: { echo: { echo: 0.4 } } } });
  const body = rms(cool.left.subarray(SR * 2, SR * 6)), tail = rms(cool.left.subarray(cool.left.length - Math.round(SR * 0.5)));
  assert.ok(tail < body * 0.5, `the self-patched echo does not settle: ${body.toFixed(3)} → ${tail.toFixed(3)}`);
  // and a unit fed only through the patch, with no send of its own, still sounds
  const viaOnly = mono(render(s, { sampleRate: SR, only: "keys", desk: { ...base, mix: { ...base.mix, keys: { sends: { echo: 0.7, spring: 0 } } }, patch: { echo: { spring: 1 } } } }));
  let d2 = 0; for (let i = 0; i < dry.length; i++) d2 += Math.abs(dry[i]! - viaOnly[i]!);
  assert.ok(d2 / dry.length > 1e-3, "a return fed only by the patch was silent");
});
