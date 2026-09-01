import test from "node:test";
import assert from "node:assert/strict";
import { makeChart, describeChart, TONIC_OCTAVE } from "./chart.ts";
import { GENRES, GENRE_NAMES, resolveGenre } from "../genre/index.ts";
import { SCALES, pc } from "../core/theory.ts";
import { secForBars } from "../core/clock.ts";

const lofi = GENRES.lofi;

test("the same seed and genre give the same chart", () => {
  const a = makeChart({ seed: 7, genre: lofi });
  const b = makeChart({ seed: 7, genre: lofi });
  assert.equal(a.tonicPc, b.tonicPc);
  assert.equal(a.scaleName, b.scaleName);
  assert.equal(a.tempo, b.tempo);
  assert.equal(a.bars, b.bars);
});

test("a different seed gives a different record", () => {
  const charts = [1, 2, 3, 4, 5, 6, 7, 8].map((seed) => makeChart({ seed, genre: lofi }));
  assert.ok(new Set(charts.map((c) => `${c.tonicPc}/${c.scaleName}/${c.tempo}`)).size >= 7);
});

test("asking for a length cannot move anything else about the record", () => {
  // the property addressed draws buy outright: the genre's own length is drawn
  // whether or not it is used, so a request cannot displace the key, the scale
  // or the tempo. In a sequential generator this needs a rule and a snapshot.
  for (const seed of [1, 2, 3, 17, 42]) {
    const free = makeChart({ seed, genre: lofi });
    const asked = makeChart({ seed, genre: lofi, seconds: 300 });
    assert.equal(asked.tonicPc, free.tonicPc);
    assert.equal(asked.scaleName, free.scaleName);
    assert.equal(asked.tempo, free.tempo);
    assert.notEqual(asked.bars, free.bars, "but the length itself does change");
  }
});

test("the tonic is placed where degrees can be counted from it", () => {
  for (let seed = 1; seed <= 30; seed++) {
    const c = makeChart({ seed, genre: lofi });
    assert.ok(c.tonicPc >= 0 && c.tonicPc <= 11);
    assert.equal(c.tonic, TONIC_OCTAVE + c.tonicPc);
    assert.equal(pc(c.tonic), c.tonicPc);
  }
});

test("the scale is the one it names", () => {
  for (let seed = 1; seed <= 40; seed++) {
    const c = makeChart({ seed, genre: lofi });
    assert.equal(c.scale, SCALES[c.scaleName]);
    assert.ok(lofi.scales.some(([n]) => n === c.scaleName), `${c.scaleName} is not in the pool`);
  }
});

test("tempo lands inside the genre's range and is drawn across it", () => {
  const seen: number[] = [];
  for (let seed = 1; seed <= 200; seed++) {
    const { tempo } = makeChart({ seed, genre: lofi });
    assert.ok(tempo >= lofi.tempo[0] && tempo <= lofi.tempo[1], `${tempo} outside the range`);
    assert.equal(tempo, Math.round(tempo * 10) / 10, "tempo is kept to one decimal");
    seen.push(tempo);
  }
  const lo = Math.min(...seen);
  const hi = Math.max(...seen);
  assert.ok(hi - lo > (lofi.tempo[1] - lofi.tempo[0]) * 0.8, `only used ${lo}..${hi}`);
});

test("every key is reachable", () => {
  const keys = new Set<number>();
  for (let seed = 1; seed <= 400; seed++) keys.add(makeChart({ seed, genre: lofi }).tonicPc);
  assert.equal(keys.size, 12, `only ${keys.size} keys in 400 songs`);
});

test("every scale in the pool is reachable", () => {
  const got = new Set<string>();
  for (let seed = 1; seed <= 400; seed++) got.add(makeChart({ seed, genre: lofi }).scaleName);
  for (const [name, weight] of lofi.scales) {
    if (weight > 0) assert.ok(got.has(name), `${name} has weight ${weight} and never came up`);
  }
});

test("the bar count matches the length asked for", () => {
  for (const seconds of [60, 120, 300, 600]) {
    const c = makeChart({ seed: 5, genre: lofi, seconds });
    const got = secForBars(c.bars, c.tempo, c.metre);
    assert.ok(Math.abs(got - seconds) <= secForBars(1, c.tempo, c.metre), `asked ${seconds}, got ${got}`);
    assert.equal(c.askedSec, seconds);
  }
});

test("the chart carries a clock that agrees with its own bars", () => {
  const c = makeChart({ seed: 9, genre: lofi });
  assert.equal(c.clock.bars, c.bars);
  assert.equal(c.clock.metre, c.metre);
  assert.equal(c.clock.tempoAt(0), c.tempo);
  assert.equal(c.seconds, c.clock.at(c.bars));
  assert.ok(!c.clock.varies);
});

test("a metre that is not four beats makes shorter bars and more of them", () => {
  const waltz = resolveGenre("waltz", {
    waltz: { label: "Waltz", tempo: [120, 120], metre: { beats: 3, perBeat: 4 }, lengthSec: [120, 120] },
  });
  const four = resolveGenre("four", {
    four: { label: "Four", tempo: [120, 120], lengthSec: [120, 120] },
  });
  const w = makeChart({ seed: 1, genre: waltz });
  const f = makeChart({ seed: 1, genre: four });
  assert.equal(w.clock.steps, 12);
  assert.equal(f.clock.steps, 16);
  assert.ok(w.bars > f.bars, "a shorter bar takes more of them to fill the same time");
  assert.ok(Math.abs(w.seconds - f.seconds) < 2);
});

test("the chart is frozen", () => {
  const c = makeChart({ seed: 1, genre: lofi });
  assert.ok(Object.isFrozen(c));
  assert.throws(() => {
    (c as { tempo: number }).tempo = 200;
  });
});

test("every declared genre composes a chart", () => {
  for (const name of GENRE_NAMES) {
    const c = makeChart({ seed: 1, genre: GENRES[name] });
    assert.equal(c.genre.name, name);
    assert.ok(c.bars > 0);
  }
});

test("describeChart says what the chart is", () => {
  const c = makeChart({ seed: 7, genre: lofi });
  const s = describeChart(c);
  assert.match(s, /\d+(\.\d)? bpm/);
  assert.match(s, new RegExp(`${c.bars} bars`));
  assert.match(s, new RegExp(c.scaleName));
});
