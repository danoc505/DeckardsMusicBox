import test from "node:test";
import assert from "node:assert/strict";
import { makeMaterials, describeMaterial, MaterialError, type Materials } from "./index.ts";
import { makeChart } from "../chart.ts";
import { makeForm } from "../form.ts";
import { GENRES, resolveGenre } from "../../genre/index.ts";
import { inScale, pc } from "../../core/theory.ts";
import { stepsPerBar } from "../../core/clock.ts";

const lofi = GENRES.lofi;
const build = (seed: number, seconds?: number): Materials => {
  const chart = makeChart(seconds === undefined ? { seed, genre: lofi } : { seed, genre: lofi, seconds });
  return makeMaterials(chart, makeForm(chart));
};
const sweep = (n: number): Materials[] => Array.from({ length: n }, (_, i) => build(i + 1, 240));

test("the same seed builds the same materials", () => {
  const a = build(7);
  const b = build(7);
  assert.deepEqual([...a.all.keys()], [...b.all.keys()]);
  for (const k of a.all.keys()) {
    assert.equal(describeMaterial(a.all.get(k)!), describeMaterial(b.all.get(k)!));
    assert.deepEqual(a.all.get(k)!.cycles, b.all.get(k)!.cycles);
  }
});

test("only what the form demands is built, and every section is answered", () => {
  for (const m of sweep(60)) {
    const demanded = new Set(m.bySection);
    assert.deepEqual(new Set(m.all.keys()), demanded, "a material exists that no section plays");
    for (const k of m.bySection) assert.ok(m.all.has(k), `section plays ${k}, which was not built`);
  }
});

test("a varied statement gets its own material with the same chords", () => {
  const varied = sweep(120).filter((m) => [...m.all.keys()].some((k) => k.includes("/")));
  assert.ok(varied.length > 10, `only ${varied.length} records had a variant`);
  for (const m of varied) {
    for (const [k, v] of m.all) {
      if (!k.includes("/")) continue;
      const plain = m.all.get(v.idea)!;
      assert.equal(v.variant >= 1, true);
      assert.deepEqual(v.chords.map((c) => c.name), plain.chords.map((c) => c.name), "a variant changed the changes");
      const same = JSON.stringify(v.cycles[0]!.parts) === JSON.stringify(plain.cycles[0]!.parts);
      assert.ok(!same, `${k} is note-for-note its plain statement`);
    }
  }
});

test("the ideas stand on different changes", () => {
  let differ = 0;
  let both = 0;
  for (const m of sweep(80)) {
    const a = m.all.get("A");
    const b = m.all.get("B");
    if (!a || !b) continue;
    both++;
    if (a.chords.map((c) => c.degree).join() !== b.chords.map((c) => c.degree).join()) differ++;
  }
  assert.ok(both > 20, "too few records with both A and B");
  assert.ok(differ / both > 0.8, `A and B shared their changes in ${both - differ} of ${both}`);
});

test("every chord is built from the record's scale", () => {
  for (let seed = 1; seed <= 40; seed++) {
    const chart = makeChart({ seed, genre: lofi, seconds: 240 });
    const m = makeMaterials(chart, makeForm(chart));
    for (const mat of m.all.values()) {
      assert.equal(mat.chords.length, mat.bars);
      for (const ch of mat.chords) {
        assert.ok(ch.tones.length >= 3);
        assert.equal(pc(ch.tones[0]!), pc(ch.root));
        assert.ok(ch.name.length >= 1);
        for (const t of ch.tones) assert.ok(inScale(chart.tonic, chart.scale, t), `${ch.name} has a tone outside ${chart.scaleName}`);
      }
    }
  }
});

test("bass plays the root on every downbeat", () => {
  for (const m of sweep(60)) {
    for (const mat of m.all.values()) {
      for (const ch of mat.chords) {
        const down = mat.cycles[0]!.parts.bass.find((n) => n.bar === ch.bar && n.step === 0);
        assert.ok(down, `${mat.key} bar ${ch.bar} has no bass on the downbeat`);
        assert.equal(pc(down.pitch), pc(ch.root), `${mat.key} bar ${ch.bar} downbeat is not the root`);
      }
    }
  }
});

test("the bass is a line, not a pedal", () => {
  // the failure this is against: an old genre's bass never moved by step on
  // six seeds in sixteen and played eight distinct bars out of eighty-eight
  let leap = 0;
  let step = 0;
  let same = 0;
  for (const m of sweep(80)) {
    for (const mat of m.all.values()) {
      const ns = mat.cycles[0]!.parts.bass.slice().sort((a, b) => a.bar - b.bar || a.step - b.step);
      for (let i = 1; i < ns.length; i++) {
        const d = Math.abs(ns[i]!.pitch - ns[i - 1]!.pitch);
        if (d === 0) same++;
        else if (d <= 2) step++;
        else leap++;
      }
    }
  }
  const tot = leap + step + same;
  assert.ok(step / tot > 0.1, `bass steps only ${((100 * step) / tot).toFixed(0)}% of the time`);
  assert.ok(same / tot < 0.5, `bass repeats itself ${((100 * same) / tot).toFixed(0)}% of the time`);
});

test("bass notes fill the pocket and never overlap", () => {
  const steps = stepsPerBar(lofi.metre);
  for (const m of sweep(40)) {
    for (const mat of m.all.values()) {
      for (let bar = 0; bar < mat.bars; bar++) {
        const ns = mat.cycles[0]!.parts.bass.filter((n) => n.bar === bar).sort((a, b) => a.step - b.step);
        let end = 0;
        for (const n of ns) {
          assert.ok(n.step >= end, `${mat.key} bass overlaps at ${bar}:${n.step}`);
          end = n.step + n.dur;
        }
        assert.equal(end, steps, `${mat.key} bass bar ${bar} does not reach the bar line`);
      }
    }
  }
});

test("keys voice every tone of the chord, in register, led smoothly", () => {
  const [lo, hi] = lofi.keys.register;
  let moves = 0;
  let total = 0;
  for (const m of sweep(60)) {
    for (const mat of m.all.values()) {
      let prevTop: number | null = null;
      for (const ch of mat.chords) {
        const struck = mat.cycles[0]!.parts.keys.filter((n) => n.bar === ch.bar && n.step === 0);
        assert.equal(struck.length, ch.tones.length, `${mat.key} bar ${ch.bar} voices ${struck.length} of ${ch.tones.length}`);
        assert.deepEqual(
          new Set(struck.map((n) => pc(n.pitch))),
          new Set(ch.tones.map(pc)),
          `${mat.key} bar ${ch.bar} voicing is not the chord`,
        );
        for (const n of struck) assert.ok(n.pitch >= lo && n.pitch <= hi);
        const top = Math.max(...struck.map((n) => n.pitch));
        if (prevTop !== null) {
          moves += Math.abs(top - prevTop);
          total++;
        }
        prevTop = top;
      }
    }
  }
  assert.ok(moves / total < 5, `the top voice moves ${(moves / total).toFixed(1)} semitones a bar on average`);
});

test("keys voicings avoid mud below the low-interval floor", () => {
  const low = resolveGenre("low", {
    low: { label: "Low", keys: { register: [37, 61] }, bass: { register: [24, 36] } },
  });
  const chart = makeChart({ seed: 3, genre: low, seconds: 200 });
  const m = makeMaterials(chart, makeForm(chart));
  let muddy = 0;
  let chords = 0;
  for (const mat of m.all.values()) {
    for (const ch of mat.chords) {
      chords++;
      const v = mat.cycles[0]!.parts.keys.filter((n) => n.bar === ch.bar && n.step === 0).map((n) => n.pitch).sort((a, b) => a - b);
      for (let i = 1; i < v.length; i++) if (v[i - 1]! < 48 && v[i]! - v[i - 1]! < 4) muddy++;
    }
  }
  assert.ok(muddy / chords < 0.15, `${muddy} muddy intervals in ${chords} chords`);
});

test("every note is in the scale and in its register", () => {
  for (let seed = 1; seed <= 40; seed++) {
    const chart = makeChart({ seed, genre: lofi, seconds: 240 });
    const m = makeMaterials(chart, makeForm(chart));
    for (const mat of m.all.values()) {
      for (const n of [...mat.cycles[0]!.parts.bass, ...mat.cycles[0]!.parts.keys]) {
        assert.ok(inScale(chart.tonic, chart.scale, n.pitch));
      }
    }
  }
});

test("two parts on one pitch at one instant is refused, by name", () => {
  // the registers are made to overlap so the bass and the keys can collide;
  // the check has to catch it and say who landed on whom
  const overlapping = resolveGenre("clash", {
    clash: { label: "Clash", bass: { register: [48, 72] }, keys: { register: [48, 72] } },
  });
  let caught: unknown;
  for (let seed = 1; seed <= 200 && caught === undefined; seed++) {
    const chart = makeChart({ seed, genre: overlapping, seconds: 200 });
    try {
      makeMaterials(chart, makeForm(chart));
    } catch (e) {
      caught = e;
    }
  }
  assert.ok(caught instanceof MaterialError, "overlapping registers never collided in 200 seeds");
  assert.match(caught.message, /lands on .* two parts on one pitch/);
});

test("materials are frozen", () => {
  const m = build(1);
  for (const mat of m.all.values()) {
    assert.ok(Object.isFrozen(mat));
    assert.ok(Object.isFrozen(mat.cycles[0]!.parts.bass));
    assert.ok(Object.isFrozen(mat.chords));
  }
});
