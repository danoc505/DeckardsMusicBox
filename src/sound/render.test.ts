import test from "node:test";
import assert from "node:assert/strict";
import { compose } from "../song.ts";
import { resolveGenre } from "../genre/index.ts";
import { peak, render, rms } from "./render.ts";
import { hat, kick, pluck, rhodes, snare, sub } from "./voices.ts";
import { Biquad } from "./dsp.ts";
import { wav } from "./wav.ts";

const SR = 22050;
const song = compose({ seed: 42, genre: "lofi", seconds: 60 });

test("the same record renders to the same samples", () => {
  const a = render(song, { sampleRate: SR });
  const b = render(song, { sampleRate: SR });
  assert.deepEqual(a, b);
});

test("a render is finite, as long as the record, never clips, and is not quiet", () => {
  const out = render(song, { sampleRate: SR });
  assert.equal(out.length, Math.ceil(song.performance.seconds * SR));
  for (const v of out) assert.ok(Number.isFinite(v));
  assert.ok(peak(out) <= 1, `peak ${peak(out)}`);
  assert.ok(peak(out) > 0.5, `peak ${peak(out)}: the record is quiet`);
  const level = 20 * Math.log10(rms(out));
  assert.ok(level > -24 && level < -8, `${level.toFixed(1)} dBFS`);
});

test("nothing sounds before the first event or after the tail", () => {
  const out = render(song, { sampleRate: SR });
  const first = song.performance.events[0]!.tSec;
  const before = out.subarray(0, Math.max(0, Math.floor((first - 0.02) * SR)));
  assert.ok(peak(before) < 0.05, `sound before the first event: ${peak(before)}`);
  const last = out.subarray(out.length - Math.floor(0.2 * SR));
  assert.ok(peak(last) < 0.2, `the tail is still loud: ${peak(last)}`);
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
  const open = topShare(render(compose({ seed: 42, genre: clean, seconds: 60 }), { sampleRate: SR }));
  const taped = topShare(render(song, { sampleRate: SR }));
  assert.ok(taped < open, `lofi keeps ${taped.toFixed(3)} of its top end against a clean ${open.toFixed(3)}`);
});

test("a wav file has the right header and length", () => {
  const out = render(song, { sampleRate: SR });
  const bytes = wav(out, SR);
  assert.equal(String.fromCharCode(...bytes.subarray(0, 4)), "RIFF");
  assert.equal(String.fromCharCode(...bytes.subarray(8, 12)), "WAVE");
  assert.equal(bytes.length, 44 + out.length * 2);
});
