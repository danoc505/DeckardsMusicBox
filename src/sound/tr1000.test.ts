import test from "node:test";
import assert from "node:assert/strict";
import { compose } from "../song.ts";
import { GENRES } from "../genre/index.ts";
import { DRUM_LANES, type MachineSpec } from "../genre/spec.ts";
import { KITS, drum, inert, voiceOf } from "./tr1000.ts";
import { mono, peak, render, rms, settle } from "./render.ts";
import { Biquad } from "./dsp.ts";

const SR = 22050;
const song = compose({ seed: 1, genre: "lofi", seconds: 15 });
const drums = (desk: MachineSpec): Float32Array =>
  mono(render(song, { sampleRate: SR, only: "drums", desk: { machine: desk } }));

const machine = (over: MachineSpec) => settle(GENRES.lofi.sound, { machine: over }).machine;
const note = (gain = 1) => ({ midi: 0, heldSec: 0.1, gain, seed: 12345, sampleRate: 44100 });

/** How much of a buffer's energy sits in one band. */
function band(buf: Float32Array, hz: number, q: number, sampleRate = 44100): number {
  const f = new Biquad("bandpass", hz, q, sampleRate);
  let s = 0;
  for (const x of buf) { const y = f.run(x); s += y * y; }
  return Math.sqrt(s / Math.max(1, buf.length));
}

/** Where a buffer stops sounding, in samples. */
const ends = (buf: Float32Array): number => {
  const top = peak(buf);
  for (let i = buf.length - 1; i >= 0; i--) if (Math.abs(buf[i]!) > top * 0.01) return i;
  return 0;
};

test("a machine at its defaults is a wire, and the record is the one this program already made", () => {
  const M = machine({});
  assert.equal(M.kit, "acoustic");
  assert.ok(inert(M, DRUM_LANES), "a strip at its defaults is doing something");
  // the same record twice, and the strips declared explicitly at their own
  // defaults are the same record again: a knob at rest is not a knob
  const plain = drums({});
  const stated = drums({ channels: { kick: { tune: 0, decay: 1, level: 1, cut: 20000 } } });
  assert.deepEqual([...stated], [...plain]);
});

test("the kits are lane-to-voice maps, and every lane of every kit names a voice", () => {
  for (const [kit, lanes] of Object.entries(KITS)) {
    for (const lane of DRUM_LANES) {
      assert.ok(lanes[lane], `the ${kit} kit has no ${lane}`);
      assert.equal(voiceOf(lane, machine({ kit: kit as "acoustic" | "analog" })), lanes[lane]);
    }
  }
  // and the acoustic kit's names are the lanes themselves, which is what
  // seeds each hit's noise: changing kits must not resettle the acoustic one
  assert.deepEqual(Object.values(KITS.acoustic), [...DRUM_LANES]);
});

test("the analog kit is a different kit, and it is a kit and not a fault", () => {
  const acoustic = drums({});
  const analog = drums({ kit: "analog" });
  assert.notDeepEqual([...analog], [...acoustic]);
  for (const v of analog) assert.ok(Number.isFinite(v));
  assert.ok(peak(analog) < 1, `the analog kit peaks at ${peak(analog).toFixed(3)}`);
  // and it is within a few decibels of the kit it replaced: a kit switch
  // changes the drums, not the balance
  const dB = 20 * Math.log10(rms(analog) / rms(acoustic));
  assert.ok(dB > -8 && dB < 2, `the analog kit is ${dB.toFixed(1)} dB against the acoustic one`);
});

test("the 909 kick drops further and faster and rings about half as long", () => {
  const eight = drum("kick", note(), machine({ kit: "analog", circuit: "808" }));
  const nine = drum("kick", note(), machine({ kit: "analog", circuit: "909" }));
  const ratio = ends(nine) / ends(eight);
  assert.ok(ratio > 0.4 && ratio < 0.7, `the 909 rings ${ratio.toFixed(2)} of the 808`);
  // and it starts from further up: seven times the tuning against the 808's
  // four and a bit, so its attack carries more of the top of the sweep. Taken
  // as the ratio of two bands inside one hit, which no level constant moves.
  const tilt = (b: Float32Array): number => band(b.subarray(0, 882), 330, 1.5) / band(b.subarray(0, 882), 130, 1.5);
  assert.ok(tilt(nine) > tilt(eight) * 1.15, `909 tilt ${tilt(nine).toFixed(2)}, 808 ${tilt(eight).toFixed(2)}`);
  assert.ok(peak(nine) < 1 && peak(eight) < 1, "a kick over full scale");
});

test("PUNCH is the third harmonic, and it lands where a small speaker can move it", () => {
  const M = machine({ kit: "analog" });
  const flat = drum("kick", note(), machine({ kit: "analog", punch: 0 }));
  const punched = drum("kick", note(), machine({ kit: "analog", punch: 1 }));
  const at = M.tune * 3; // 141 Hz at the default tuning, inside the sourced 110–140 band
  // measured past the sweep, which crosses that band on its way down whether
  // the layer is there or not — the first version of this test measured the
  // whole hit and was reading the sweep
  const body = (b: Float32Array, hz: number): number => band(b.subarray(2646), hz, 2);
  const gain = body(punched, at) / body(flat, at);
  assert.ok(gain > 1.5, `the punch layer put ${gain.toFixed(2)}x where the sources put it`);
  // and it does not do it by moving the fundamental
  const low = body(punched, M.tune) / body(flat, M.tune);
  assert.ok(low > 0.9 && low < 1.1, `the fundamental moved by ${low.toFixed(2)}`);
});

test("the hats are one circuit and only the decay differs", () => {
  const M = { kit: "analog" as const };
  const closed = drum("hat", note(), machine(M));
  const open = drum("openhat", note(), machine(M));
  assert.ok(ends(open) > ends(closed) * 4, "the open hat is not the long one");
  const longer = drum("hat", note(), machine({ ...M, chdecay: 0.09 }));
  const ratio = ends(longer) / ends(closed);
  assert.ok(ratio > 1.6 && ratio < 2.4, `twice the decay rang ${ratio.toFixed(2)} times as long`);
});

test("a strip tunes and shortens its own lane, on either kit", () => {
  // the analog kit retunes the circuit: an octave up is twice the frequency
  const plain = drum("snare", note(), machine({ kit: "analog" }));
  const up = drum("snare", note(), machine({ kit: "analog", channels: { snare: { tune: 12 } } }));
  assert.ok(band(up, 476, 2) > band(plain, 476, 2) * 1.5, "the shell did not move up");
  // the acoustic kit is a recording, so TUNE is a playback rate: twice as
  // fast is half as long, which is what a sampler channel does
  const rec = drum("kick", note(), machine({}));
  const fast = drum("kick", note(), machine({ channels: { kick: { tune: 12 } } }));
  const ratio = fast.length / rec.length;
  assert.ok(ratio > 0.45 && ratio < 0.55, `a rate of 2 gave ${ratio.toFixed(2)} of the length`);
  // and DECAY cuts it short without leaving a step behind
  const cut = drum("kick", note(), machine({ channels: { kick: { decay: 0.4 } } }));
  assert.ok(cut.length < rec.length * 0.5, "the decay knob did not cut the recording");
  assert.ok(Math.abs(cut[cut.length - 1]!) < 1e-3, "a cut sample ends on a step, which is a click");
});

test("a strip's filter and fader reach that lane and no other", () => {
  const lanes = new Set(song.performance.events.filter((e) => e.role === "drums").map((e) => e.lane));
  assert.ok(lanes.has("kick") && lanes.has("snare"), "this record has no kick or snare to test with");
  const all = drums({});
  const noKick = drums({ channels: { kick: { level: 0 } } });
  assert.ok(rms(noKick) < rms(all) * 0.8, "muting the kick's fader changed nothing");
  const dark = drums({ channels: { snare: { cut: 700 } } });
  assert.notDeepEqual([...dark], [...all]);
  assert.ok(band(dark, 4000, 1, SR) < band(all, 4000, 1, SR), "the snare's own filter did not darken it");
});

test("the kit's own drive and filter are across the whole box", () => {
  const flat = drums({});
  const driven = drums({ drive: 2 });
  assert.ok(rms(driven) > rms(flat) * 1.2, "the ANALOG FX drive did nothing");
  const filtered = drums({ filterHz: 700 });
  assert.ok(band(filtered, 6000, 1, SR) < band(flat, 6000, 1, SR) * 0.5, "the ANALOG FX filter did nothing");
});

test("a lane's individual output reaches a return the kit's own send does not", () => {
  const rack = { echo: { beats: 1.5, feedback: 0.4, ret: 1 } };
  const quiet = { drums: { sends: { echo: 0, spring: 0, room: 0, ensemble: 0, flange: 0 } } };
  const dry = mono(render(song, { sampleRate: SR, only: "drums", desk: { rack, mix: quiet } }));
  const wet = mono(render(song, {
    sampleRate: SR, only: "drums",
    desk: { rack, mix: quiet, machine: { channels: { snare: { sends: { echo: 0.8 } } } } },
  }));
  assert.ok(rms(wet) > rms(dry) * 1.02, "the snare's own send never reached the echo");
  for (const v of wet) assert.ok(Number.isFinite(v));
});

test("a hit is what the machine's knobs make it, and moving one does not leave the old drum in the cache", () => {
  // the same engine, retuned mid-record: the drums after the move must be the
  // new machine's, which is what clearing the kit's cache is for
  const before = drums({ kit: "analog" });
  const after = drums({ kit: "analog", tune: 65 });
  assert.notDeepEqual([...before], [...after]);
  const again = drums({ kit: "analog" });
  assert.deepEqual([...again], [...before], "the same machine rendered two different records");
});
