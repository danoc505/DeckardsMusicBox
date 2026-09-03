import test from "node:test";
import assert from "node:assert/strict";
import { compose } from "../song.ts";
import { PEDALS_ADD, PEDAL_ORDER, type PedalsSpec } from "../genre/spec.ts";
import { Comp, Meat, Muff, Octave, Sag, Saw, Sub } from "./pedals.ts";
import { mono, peak, render, rms } from "./render.ts";

const SR = 22050;
const sine = (hz: number, n: number, amp = 0.5, sampleRate = SR): Float32Array =>
  Float32Array.from({ length: n }, (_, i) => amp * Math.sin((2 * Math.PI * hz * i) / sampleRate));
const through = (run: (x: number) => number, input: Float32Array): Float32Array => input.map((x) => run(x));
/** The fundamental a buffer reads as, by counting the times it crosses zero going up. */
function pitch(buf: Float32Array, sampleRate = SR): number {
  let crossings = 0;
  for (let i = 1; i < buf.length; i++) if (buf[i - 1]! <= 0 && buf[i]! > 0) crossings++;
  return (crossings * sampleRate) / buf.length;
}
/** How much of a buffer sits at one frequency, measured against a matched pair of sines. */
function at(buf: Float32Array, hz: number, sampleRate = SR): number {
  let re = 0;
  let im = 0;
  for (let i = 0; i < buf.length; i++) {
    const w = (2 * Math.PI * hz * i) / sampleRate;
    re += buf[i]! * Math.cos(w);
    im += buf[i]! * Math.sin(w);
  }
  return (2 * Math.hypot(re, im)) / buf.length;
}

const song = compose({ seed: 2, genre: "lofi", seconds: 12 });
const lead = (pedals: PedalsSpec): Float32Array =>
  mono(render(song, { sampleRate: SR, only: "lead", desk: { mix: { lead: { pedals: 1 } }, pedals } }));

test("a pedal at mix 0 is off the board, however its own knobs are set", () => {
  const off = lead({ overdrive: { mix: 0 }, tremolo: { mix: 0 } });
  const turned = lead({
    overdrive: { mix: 0 }, tremolo: { mix: 0 },
    comp: { sustain: 1, level: 1, mix: 0 }, muff: { sustain: 1, mids: 1, mass: 1, mix: 0 },
    saw: { dist: 1, mix: 0 }, sag: { depth: 1, idle: 0.2, mix: 0 },
  });
  assert.deepEqual([...turned], [...off], "a pedal that is off the board changed the record");
});

test("every pedal on the board is a pedal the board can build, and each one changes the part it is on", () => {
  const off = lead({ overdrive: { mix: 0 }, tremolo: { mix: 0 } });
  const on: Readonly<Record<string, PedalsSpec[keyof PedalsSpec]>> = {
    comp: { sustain: 0.9, level: 0.6, mix: 1 },
    wah: { mix: 1 },
    sub: { gate: 0.004, mix: 0.9 },
    octave: { mix: 0.9 },
    meat: { dirt: 0.8, mix: 1 },
    muff: { sustain: 0.7, mix: 1 },
    overdrive: { mix: 1 },
    fuzz: { mix: 1 },
    saw: { mix: 1 },
    sag: { depth: 0.9, mix: 1 },
    phaser: { mix: 1 },
    tremolo: { mix: 1 },
  };
  for (const name of PEDAL_ORDER) {
    assert.ok(name in on, `${name} is on the board and this test does not turn it on`);
    const out = lead({ overdrive: { mix: 0 }, tremolo: { mix: 0 }, [name]: on[name] });
    for (const v of out) assert.ok(Number.isFinite(v), `${name} made a number that is not a number`);
    assert.ok(peak(out) < 1, `${name} peaks at ${peak(out).toFixed(2)}`);
    assert.notDeepEqual([...out], [...off], `${name} is switched on and changes nothing`);
  }
});

test("the two octave pedals ADD under the note and the rest of the board blends", () => {
  // an added pedal keeps the dry at unity, so the part cannot get quieter as
  // the mix comes up; a blended one crossfades and can
  const off = lead({ overdrive: { mix: 0 }, tremolo: { mix: 0 } });
  for (const name of PEDALS_ADD) {
    const out = lead({ overdrive: { mix: 0 }, tremolo: { mix: 0 }, [name]: { mix: 0.9, gate: 0.004 } });
    assert.ok(rms(out) >= rms(off) * 0.98, `${name} crossfaded the note away instead of adding under it`);
  }
});

test("the compressor closes the distance between the loud and the quiet", () => {
  const loud = sine(220, SR, 0.6);
  const quiet = sine(220, SR, 0.03);
  const c1 = new Comp(0.8, 0.6, SR);
  const c2 = new Comp(0.8, 0.6, SR);
  // past the attack, so the follower is up on both
  const half = SR / 2;
  const inRange = rms(loud.subarray(half)) / rms(quiet.subarray(half));
  const outRange = rms(through((x) => c1.run(x), loud).subarray(half)) / rms(through((x) => c2.run(x), quiet).subarray(half));
  assert.ok(outRange < inRange * 0.5, `a range of ${inRange.toFixed(1)} came out ${outRange.toFixed(1)}`);
  // and the makeup is what lifts the quiet material with it
  const lifted = new Comp(0.8, 1, SR);
  assert.ok(rms(through((x) => lifted.run(x), quiet)) > rms(quiet), "the pedal does not sustain anything");
});

test("the divider is an octave under the note, and two of them are two octaves", () => {
  const note = sine(200, SR * 2, 0.5);
  const a = new Sub(0, 0.004, 900, SR);
  const b = new Sub(1, 0.004, 900, SR);
  const one = through((x) => a.run(x), note);
  const two = through((x) => b.run(x), note);
  // the first half is the gate opening; the second is the pedal
  assert.ok(Math.abs(pitch(one.subarray(SR)) - 100) < 12, `one flip-flop read ${pitch(one.subarray(SR)).toFixed(0)} Hz`);
  assert.ok(Math.abs(pitch(two.subarray(SR)) - 50) < 12, `two flip-flops read ${pitch(two.subarray(SR)).toFixed(0)} Hz`);
});

test("the octave fuzz doubles the note, because that is what a rectifier does", () => {
  const note = sine(200, SR, 0.5);
  const oct = new Octave(SR);
  const up = through((x) => oct.run(x), note);
  assert.ok(at(up, 400) > at(up, 200) * 4, `400 Hz ${at(up, 400).toFixed(3)} against 200 Hz ${at(up, 200).toFixed(3)}`);
});

test("starve the Fuzz Face and it gates: the note does not fade, it stops", () => {
  // a note dying away, which is where a starved bias bites
  const decay = Float32Array.from({ length: SR }, (_, i) => 0.6 * Math.exp(-i / (SR * 0.15)) * Math.sin((2 * Math.PI * 200 * i) / SR));
  const clean = new Meat(0.6, 0, 0.5, 0.5, SR);
  const dying = new Meat(0.6, 0.9, 0.5, 0.5, SR);
  const open = through((x) => clean.run(x), decay);
  const starved = through((x) => dying.run(x), decay);
  const tail = (b: Float32Array): number => rms(b.subarray(SR - SR / 4));
  assert.ok(tail(starved) < tail(open) * 0.5, `the starved tail is ${tail(starved).toFixed(4)}, the open one ${tail(open).toFixed(4)}`);
  // and it is dirt: a sine comes out with harmonics on it
  const note = sine(200, SR, 0.5);
  const hot = new Meat(0.8, 0.1, 1, 0.5, SR);
  const fuzzed = through((x) => hot.run(x), note);
  assert.ok(at(fuzzed, 600) > at(note, 600) * 20, "a fuzz that makes no harmonics");
});

test("the Muff scoops the middle, and MIDS fills it back in", () => {
  const mid = sine(1000, SR, 0.3);
  const flat = new Muff(0.5, 0.5, 1, 4500, 0, 0, SR);
  const filled = new Muff(0.5, 0.5, 1, 4500, 1, 0, SR);
  const stock = through((x) => flat.run(x), mid);
  const modded = through((x) => filled.run(x), mid);
  assert.ok(at(modded, 1000) > at(stock, 1000) * 1.5, `mids 0 gave ${at(stock, 1000).toFixed(3)}, mids 1 ${at(modded, 1000).toFixed(3)}`);
  // and MASS is the clean fundamental under the dirt, which the tone stack
  // cannot put back because a stack can only take away. Measured at the ends
  // of the knob and not across it: the wet path's 90 Hz floor is one pole, so
  // a little of the fundamental is still in the dirt and a half-turn of MASS
  // partly cancels it — see the unit's own note.
  const low = sine(45, SR, 0.3);
  const bare = new Muff(0.5, 0.5, 1, 4500, 0, 0, SR);
  const massy = new Muff(0.5, 0.5, 1, 4500, 0, 1, SR);
  const thin = through((x) => bare.run(x), low);
  const heavy = through((x) => massy.run(x), low);
  assert.ok(at(heavy, 45) > at(thin, 45) * 1.4, `MASS moved the fundamental by ${(at(heavy, 45) / at(thin, 45)).toFixed(2)}x`);
});

test("the chainsaw's three gyrators are where the article prints them", () => {
  const level = (hz: number, low: number, high: number): number => {
    const unit = new Saw(0, low, high, 0, 12000, 1, SR);
    return at(through((x) => unit.run(x), sine(hz, SR, 0.05)), hz);
  };
  const flat = (hz: number): number => level(hz, 0, 0);
  const dimed = (hz: number): number => level(hz, 1, 1);
  for (const hz of [86.79, 958.47, 1278.6]) {
    const dB = 20 * Math.log10(dimed(hz) / flat(hz));
    assert.ok(dB > 6, `dimed, ${hz} Hz came up ${dB.toFixed(1)} dB`);
  }
  // and 400 Hz sits between the bells, where nothing is centred
  const between = 20 * Math.log10(dimed(400) / flat(400));
  assert.ok(between < 6, `400 Hz came up ${between.toFixed(1)} dB, which is not between the bells`);
});

test("a stiff supply is a wire and a collapsing one clips earlier, quieter, and blooms back", () => {
  const hit = Float32Array.from({ length: SR }, (_, i) => {
    const t = i / SR;
    const env = t < 0.5 ? Math.exp(-t / 0.15) : 0;
    return 0.7 * env * Math.sin(2 * Math.PI * 110 * t);
  });
  const held = new Sag(0, 1, 0.12, 0.25, SR);
  const flat = new Sag(1, 0.3, 0.4, 0.6, SR);
  const stiff = through((x) => held.run(x), hit);
  const dying = through((x) => flat.run(x), hit);
  assert.ok(peak(dying) < peak(stiff) * 0.9, `the rail did not fall: ${peak(dying).toFixed(3)} against ${peak(stiff).toFixed(3)}`);
  // the front of the note is what the rail is still holding up, so the
  // collapse shows as the note losing more of itself later than at the strike
  const front = (b: Float32Array): number => rms(b.subarray(0, SR / 20));
  const later = (b: Float32Array): number => rms(b.subarray(SR / 10, SR / 4));
  assert.ok(later(dying) / front(dying) < later(stiff) / front(stiff), "a supply that squishes nothing");
  for (const v of dying) assert.ok(Number.isFinite(v));
});
