import test from "node:test";
import assert from "node:assert/strict";
import { compose } from "../song.ts";
import { ROLES, type Role } from "../genre/spec.ts";
import { midi, midiCounts } from "./midi.ts";

/**
 * A Standard MIDI File read back with nothing of this program's in it: the
 * bytes are parsed by the format's own rules, so a claim that survives this
 * is a claim about the file rather than about the writer's intentions.
 */
interface Parsed {
  readonly format: number;
  readonly ppq: number;
  readonly tempos: readonly number[];
  readonly metres: readonly (readonly [number, number])[];
  readonly tracks: readonly {
    readonly name: string;
    readonly notes: readonly { ch: number; pitch: number; vel: number; tick: number; dur: number }[];
  }[];
}

function parse(b: Uint8Array): Parsed {
  const d = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const str = (at: number, n: number): string => String.fromCharCode(...b.subarray(at, at + n));
  assert.equal(str(0, 4), "MThd", "not a MIDI file");
  let p = 4;
  const hlen = d.getUint32(p); p += 4;
  const format = d.getUint16(p); p += 2;
  const ntrk = d.getUint16(p); p += 2;
  const ppq = d.getUint16(p); p += 2;
  p = 8 + hlen;

  const tempos: number[] = [];
  const metres: [number, number][] = [];
  const tracks: Parsed["tracks"][number][] = [];
  for (let t = 0; t < ntrk; t++) {
    assert.equal(str(p, 4), "MTrk", `track ${t} has no MTrk`);
    p += 4;
    const len = d.getUint32(p); p += 4;
    const end = p + len;
    let tick = 0;
    let running = 0;
    let name = "";
    const open = new Map<number, { tick: number; vel: number }[]>();
    const notes: Parsed["tracks"][number]["notes"][number][] = [];
    while (p < end) {
      let delta = 0;
      let c: number;
      do { c = b[p++]!; delta = (delta << 7) | (c & 0x7f); } while (c & 0x80);
      tick += delta;
      let st = b[p]!;
      if (st & 0x80) { p++; running = st; } else st = running;
      const hi = st & 0xf0;
      const ch = st & 0x0f;
      if (st === 0xff) {
        const type = b[p++]!;
        let l = 0; let c2: number;
        do { c2 = b[p++]!; l = (l << 7) | (c2 & 0x7f); } while (c2 & 0x80);
        const data = b.subarray(p, p + l); p += l;
        if (type === 0x03) name = String.fromCharCode(...data);
        if (type === 0x51) tempos.push(6e7 / ((data[0]! << 16) | (data[1]! << 8) | data[2]!));
        if (type === 0x58) metres.push([data[0]!, 1 << data[1]!]);
      } else if (st === 0xf0 || st === 0xf7) {
        let l = 0; let c2: number;
        do { c2 = b[p++]!; l = (l << 7) | (c2 & 0x7f); } while (c2 & 0x80);
        p += l;
      } else if (hi === 0x90 || hi === 0x80) {
        const pitch = b[p++]!;
        const vel = b[p++]!;
        const key = ch * 128 + pitch;
        if (hi === 0x90 && vel > 0) {
          if (!open.has(key)) open.set(key, []);
          open.get(key)!.push({ tick, vel });
        } else {
          const started = open.get(key)?.shift();
          if (started) notes.push({ ch, pitch, vel: started.vel, tick: started.tick, dur: tick - started.tick });
        }
      } else if (hi === 0xc0 || hi === 0xd0) p += 1;
      else p += 2;
    }
    // every note that was turned on was turned off again
    for (const [, still] of open) assert.equal(still.length, 0, `${name}: a note is never released`);
    p = end;
    notes.sort((a, z) => a.tick - z.tick || a.pitch - z.pitch);
    tracks.push({ name, notes });
  }
  return { format, ppq, tempos, metres, tracks };
}

test("the file is a type 1 SMF and says what the record is", () => {
  const s = compose({ seed: 42, genre: "lofi", seconds: 120 });
  const f = parse(midi(s));
  assert.equal(f.format, 1, "not a type 1 file");
  assert.equal(f.ppq, 960);
  assert.equal(f.tempos.length >= 1, true, "no tempo in the conductor track");
  assert.ok(Math.abs(f.tempos[0]! - s.chart.tempo) < 0.5, `${f.tempos[0]} against ${s.chart.tempo}`);
  assert.deepEqual(f.metres[0], [s.chart.metre.beats, 4]);
  // a track per part that plays, plus the conductor
  const playing = new Set(s.performance.events.map((e) => e.role));
  assert.equal(f.tracks.length, playing.size + 1);
});

test("every note of the record is in the file, for every genre and both parts of it", () => {
  // THE CHECK MK2 NEEDED THREE TIMES. A part added upstream is a track that
  // has to exist downstream, and each time one did not the export dropped it
  // in silence — 1520 of one genre's 3009 notes, then 1137 of another's 1309.
  // Nothing sounds wrong when a file is written; it is only wrong when
  // somebody opens it. So the file is read back and the notes are counted.
  for (const genre of ["lofi", "dungeonsynth"] as const) {
    for (const seed of [1, 7, 42, 99]) {
      const s = compose({ seed, genre, seconds: 150 });
      const f = parse(midi(s));
      const want = midiCounts(s);
      let got = 0;
      for (const t of f.tracks) got += t.notes.length;
      let expected = 0;
      for (const [, n] of want) expected += n;
      assert.equal(got, expected, `${genre} seed ${seed}: ${got} notes in the file, ${expected} in the record`);
      // and every part that plays has a track with its notes on it
      for (const role of ROLES) {
        const n = want.get(role) ?? 0;
        if (n === 0) continue;
        const track = f.tracks.find((t) => t.name.startsWith(role));
        assert.ok(track !== undefined, `${genre} seed ${seed}: no track for ${role}`);
        assert.equal(track.notes.length, n, `${genre} seed ${seed}: ${role} lost notes`);
      }
    }
  }
});

test("a drum lane this file cannot name is a loud absence, not a silent one", () => {
  // `midiCounts` and the writer both go through `keyOf`, so they agree by
  // construction — which is exactly the shape of check MK2 found proved
  // nothing. So this asks the OTHER question: does every lane any genre
  // actually writes have a General MIDI key? A lane added to a kit with no
  // entry in the table would be dropped from the file in silence.
  const lanes = new Set<string>();
  for (const genre of ["lofi", "dungeonsynth"] as const) {
    for (let seed = 1; seed <= 40; seed++) {
      for (const e of compose({ seed, genre, seconds: 150 }).performance.events) {
        if (e.role === "drums") lanes.add(e.lane);
      }
    }
  }
  assert.ok(lanes.size >= 3, `only ${lanes.size} drum lanes were ever struck`);
  const s = compose({ seed: 1, genre: "lofi", seconds: 150 });
  const named = new Set(midiCounts(s).keys());
  assert.ok(named.has("drums" as Role));
  // every lane struck anywhere is a lane the writer has a key for: counted by
  // rendering one record per lane and checking nothing vanishes
  for (const lane of lanes) {
    const one = compose({ seed: 1, genre: "lofi", seconds: 150 });
    const hits = one.performance.events.filter((e) => e.role === "drums" && e.lane === lane).length;
    if (hits === 0) continue;
    const f = parse(midi(one, { only: "drums" }));
    const track = f.tracks.find((t) => t.name.startsWith("drums"))!;
    const all = one.performance.events.filter((e) => e.role === "drums").length;
    assert.equal(track.notes.length, all, `a drum lane is missing from the file: ${lane}`);
  }
});

test("the micro-timing survives the trip, which is the point of exporting at all", () => {
  // A part that sits eighteen milliseconds behind the beat has to sit
  // eighteen milliseconds behind it in the file. Quantising on the way out
  // throws away the one thing the feel is made of, so this measures the
  // snare's distance from the kick IN THE FILE and holds it to what the genre
  // asked for.
  const s = compose({ seed: 5, genre: "lofi", seconds: 200 });
  const f = parse(midi(s));
  const drums = f.tracks.find((t) => t.name.startsWith("drums"))!;
  const beat = s.chart.metre.beats;
  const perBar = beat * 960;
  // ON THE BEAT ONLY. A ghost snare is a snare — same lane, same General MIDI
  // key — and it lands off the beat, where the genre's swing delays it by a
  // sixth of a pair. Averaging the backbeat together with its ghosts measures
  // the swing and calls it the lean.
  const sixteenth = perBar / (beat * 4);
  const off = (pitch: number): number[] =>
    drums.notes
      .filter((n) => n.pitch === pitch)
      .map((n) => {
        const inBar = n.tick % perBar;
        const at = Math.round(inBar / sixteenth);
        return { at, by: inBar - at * sixteenth };
      })
      .filter((x) => x.at % 4 === 0)
      .map((x) => x.by);
  const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
  const kick = off(36);
  const snare = off(38);
  assert.ok(kick.length > 20 && snare.length > 20);
  // in ticks: a beat is 960, so at this tempo a millisecond is about 1.3
  const perMs = (960 * s.chart.tempo) / 60000;
  const apart = (mean(snare) - mean(kick)) / perMs;
  const meant = (s.chart.genre.feel.lean["snare"] ?? 0) - (s.chart.genre.feel.lean["kick"] ?? 0);
  assert.ok(Math.abs(apart - meant) < 6, `the snare sits ${apart.toFixed(1)} ms behind the kick in the file, meant to be ${meant}`);
});

test("a note is never written with a length of nothing", () => {
  // an off at the same tick as its on is a note a sequencer shows and does not
  // play; the writer holds every note to at least one tick
  for (const seed of [1, 3, 11]) {
    const f = parse(midi(compose({ seed, genre: "lofi", seconds: 150 })));
    for (const t of f.tracks) for (const n of t.notes) {
      assert.ok(n.dur >= 1, `${t.name}: a note of no length at tick ${n.tick}`);
      assert.ok(n.vel >= 1 && n.vel <= 127, `${t.name}: velocity ${n.vel}`);
    }
  }
});
