import test from "node:test";
import assert from "node:assert/strict";
import { compose } from "../song.ts";
import { DRUM_LANES, PITCHED_ROLES } from "../genre/spec.ts";
import { DEVICES, RIGS, rigOf, rigWords, wire } from "./wire.ts";
import { midi } from "./midi.ts";

const song = compose({ seed: 3, genre: "lofi", seconds: 45 });
const kind = (b: readonly number[]): "on" | "off" | "cc" | "clock" | "start" | "stop" | "other" =>
  b[0] === 0xf8 ? "clock" : b[0] === 0xfa ? "start" : b[0] === 0xfc ? "stop"
  : (b[0]! & 0xf0) === 0x90 ? "on" : (b[0]! & 0xf0) === 0x80 ? "off" : (b[0]! & 0xf0) === 0xb0 ? "cc" : "other";

test("the owner's rig: lanes on the Lofi-12's tracks at one key, parts on the Mega Synthesis, each on its own channel", () => {
  const rig = RIGS["sonicware"]!;
  const out = wire(song, rig);
  const ons = out.filter((e) => kind(e.msg) === "on");
  // every lane on its own Lofi-12 track, always at C4: a sample at its own pitch
  for (const [i, lane] of DRUM_LANES.entries()) {
    const hits = song.performance.events.filter((e) => e.role === "drums" && e.lane === lane).length;
    const sent = ons.filter((e) => (e.msg[0]! & 0x0f) === i && e.msg[1] === 60).length;
    assert.equal(sent, hits, `${lane}: ${sent} sent for ${hits} hits`);
  }
  // and the parts on the Mega Synthesis's channels, at their own pitches
  for (const r of PITCHED_ROLES) {
    const ch = rig.parts[r].ch;
    const notes = song.performance.events.filter((e) => e.role === r);
    const sent = ons.filter((e) => (e.msg[0]! & 0x0f) === ch);
    assert.equal(sent.length, notes.length, `${r} on channel ${ch + 1}`);
    assert.ok(sent.every((e, k) => e.msg[1] === notes[k]!.pitch), `${r}: a pitch was not the record's`);
  }
  assert.equal(out.filter((e) => kind(e.msg) === "off").length, ons.length, "an on without an off");
  for (const e of out) for (const b of e.msg.slice(1)) assert.ok(b >= 0 && b <= 127, "a data byte out of range");
});

test("the desk goes out as the knobs each device has, and only when a knob moves", () => {
  const rig = RIGS["sonicware"]!;
  const out = wire(song, rig);
  const cc = out.filter((e) => kind(e.msg) === "cc");
  assert.ok(cc.length > 0, "no control change at all");
  // the Lofi-12 tracks get level, pan, send and the filter; the Mega Synthesis never a filter
  const lofi = cc.filter((e) => (e.msg[0]! & 0x0f) < 4);
  const mega = cc.filter((e) => (e.msg[0]! & 0x0f) >= 4);
  assert.ok(lofi.some((e) => e.msg[1] === DEVICES.lofi12.cc.level), "the Lofi-12's TRACK LEVEL never sent");
  assert.ok(mega.some((e) => e.msg[1] === DEVICES.mega.cc.level), "the Mega Synthesis's TRACK LEVEL never sent");
  assert.ok(mega.every((e) => e.msg[1] === 36 || e.msg[1] === 35 || e.msg[1] === 37), "a control the Mega Synthesis does not have");
  // at the top, every knob once — the record's own mix — and after that only changes
  const atTop = cc.filter((e) => e.atMs === 0);
  const keys = new Set(atTop.map((e) => `${e.msg[0]}/${e.msg[1]}`));
  assert.equal(keys.size, atTop.length, "a knob sent twice at the top");
  const later = cc.filter((e) => e.atMs > 0);
  assert.ok(later.length > 0, "the record moves its desk and nothing reached the wire");
  const last = new Map<string, number>();
  for (const e of cc) {
    const k = `${e.msg[0]}/${e.msg[1]}`;
    assert.notEqual(last.get(k), e.msg[2], `${k} re-sent at its own value at ${e.atMs.toFixed(0)} ms`);
    last.set(k, e.msg[2]!);
  }
  // a hand on the level of the keys is heard on the keys' channel and no other
  const notes = wire(song, rig, { desk: false });
  assert.ok(notes.every((e) => kind(e.msg) !== "cc"), "desk: false still sent the desk");
});

test("clock at 24 pulses a quarter from the top, start first and stop after the last note", () => {
  const rig = RIGS["gm"]!;
  const out = wire(song, rig);
  assert.equal(kind(out[0]!.msg), "start");
  assert.equal(kind(out[out.length - 1]!.msg), "stop");
  const pulses = out.filter((e) => kind(e.msg) === "clock");
  const beats = song.form.clock.bars * song.chart.metre.beats;
  assert.ok(Math.abs(pulses.length - beats * 24) <= 24, `${pulses.length} pulses for ${beats} beats`);
  // evenly spaced on a steady record: one pulse every 60/bpm/24 seconds
  const gap = (60 / song.chart.tempo / 24) * 1000;
  for (let i = 1; i < 200; i++) assert.ok(Math.abs(pulses[i]!.atMs - pulses[i - 1]!.atMs - gap) < 0.5, `pulse ${i} off by ${pulses[i]!.atMs - pulses[i - 1]!.atMs - gap} ms`);
  assert.ok(wire(song, { ...rig, clock: false }).every((e) => kind(e.msg) !== "clock" && kind(e.msg) !== "start"), "clock off still sent clock");
  // from a second: the clock and the notes both start there
  const from = wire(song, rig, { fromSec: 10, toSec: 20 });
  assert.equal(kind(from[0]!.msg), "start");
  assert.ok(from.every((e) => e.atMs >= 0), "a message before the start");
  assert.ok(from.filter((e) => kind(e.msg) === "on").every((e) => e.atMs < 10000), "a note on past the end of the range");
  assert.equal(kind(from[from.length - 1]!.msg), "stop");
});

test("a rig is words in the recipe: presets, one destination at a time, and nonsense refused", () => {
  assert.deepEqual(rigWords(RIGS["sonicware"]!), ["wire.rig=sonicware"]);
  const r = rigOf(["wire.rig=sonicware", "wire.keys=mega:3", "wire.kick=lofi12:2:48", "wire.clock=off"]);
  assert.equal(r.parts.keys.ch, 2);
  assert.equal(r.parts.keys.device, "mega");
  assert.deepEqual(r.lanes.kick, { device: "lofi12", ch: 1, note: 48 });
  assert.equal(r.clock, false);
  assert.deepEqual(rigOf(rigWords(r)), r);
  assert.throws(() => rigOf(["wire.keys=korg:1"]), /no device/);
  assert.throws(() => rigOf(["wire.keys=mega:17"]), /not 1–16/);
  assert.throws(() => rigOf(["wire.kick=lofi12:1"]), /<key>/);
  assert.throws(() => rigOf(["wire.harp=gm:1"]), /nothing on the wire/);
  assert.throws(() => rigOf(["wire.rig=roland"]), /no rig/);
  // and the file can be written for the rig: the lanes on their tracks at their keys
  const bytes = midi(song, { rig: RIGS["sonicware"]! });
  const s = Array.from(bytes);
  let hits = 0;
  for (let i = 0; i + 2 < s.length; i++) if (s[i] === 0x90 && s[i + 1] === 60 && s[i + 2]! > 0) hits++;
  assert.ok(hits >= song.performance.events.filter((e) => e.role === "drums" && e.lane === "kick").length, "the kick did not land on its track at its key");
});
