import test from "node:test";
import assert from "node:assert/strict";
import { makeArrangement, describeArrangement, type Arrangement } from "./arrange.ts";
import { makeChart } from "./chart.ts";
import { makeForm } from "./form.ts";
import { GENRES, resolveGenre } from "../genre/index.ts";
import { ROLES } from "../genre/spec.ts";

const lofi = GENRES.lofi;
const build = (seed: number, seconds = 240): Arrangement => {
  const chart = makeChart({ seed, genre: lofi, seconds });
  return makeArrangement(chart, makeForm(chart));
};
const sweep = (n: number) => Array.from({ length: n }, (_, i) => build(i + 1));

test("every section hears something, and every part is heard somewhere in every record", () => {
  // the structural claim: a part cannot be silent for a whole record by
  // omission, because nothing here lists parts per section
  for (const a of sweep(120)) {
    const everHeard = new Set<string>();
    for (const p of a.placed) {
      assert.ok(p.heard.size >= 1, describeArrangement(a));
      for (const r of p.heard) everHeard.add(r);
    }
    for (const r of ROLES) assert.ok(everHeard.has(r), `${r} is never heard: ${describeArrangement(a)}`);
  }
});

test("an intro holds the first parts of the entry order", () => {
  const want = new Set(lofi.arrangement.enter.slice(0, lofi.arrangement.introParts));
  let intros = 0;
  for (const a of sweep(120)) {
    const intro = a.placed.find((p) => p.section.fn === "intro");
    if (!intro) continue;
    intros++;
    assert.deepEqual(intro.heard, want, describeArrangement(a));
  }
  assert.ok(intros > 20);
});

test("parts arrive one section at a time, all at once for a big section, and stay", () => {
  const A = lofi.arrangement;
  let built = 0;
  for (const a of sweep(120)) {
    let arrived = A.introParts;
    let full = false;
    for (const p of a.placed) {
      const s = p.section;
      if (s.fn === "intro" || s.fn === "outro") continue;
      if (full || s.peak || s.energy >= A.fullAbove) {
        full = true;
        assert.equal(p.heard.size, ROLES.length, `${s.fn} at ${s.energy} does not hear everyone: ${describeArrangement(a)}`);
      } else {
        arrived = Math.min(ROLES.length, arrived + 1);
        built++;
        assert.deepEqual(p.heard, new Set(A.enter.slice(0, arrived)), describeArrangement(a));
        if (arrived === ROLES.length) full = true;
      }
    }
  }
  assert.ok(built > 30, `only ${built} sections were still building`);
});

test("the outro lets the last-entered part go", () => {
  const last = lofi.arrangement.enter[lofi.arrangement.enter.length - 1]!;
  for (const a of sweep(120)) {
    const outro = a.placed[a.placed.length - 1]!;
    assert.equal(outro.section.fn, "outro");
    const before = a.placed.slice(0, -1).some((p) => p.heard.has(last));
    assert.equal(!outro.heard.has(last), before, describeArrangement(a));
  }
});

test("a bridge thins, a quiet section thins, the peak never does", () => {
  for (const a of sweep(120)) {
    for (const p of a.placed) {
      if (p.section.peak) assert.equal(p.thin, false, `the peak is thin: ${describeArrangement(a)}`);
      else if (p.section.fn === "bridge") assert.equal(p.thin, true);
      else assert.equal(p.thin, p.section.energy < lofi.arrangement.thinBelow);
    }
  }
});

test("a varied statement plays the idea's next variant; an unvaried one plays the plain idea", () => {
  let variants = 0;
  for (const a of sweep(120)) {
    const seen = new Map<string, number>();
    for (const p of a.placed) {
      const s = p.section;
      if (s.vary) {
        const n = (seen.get(s.idea) ?? 0) + 1;
        seen.set(s.idea, n);
        variants++;
        assert.equal(p.material, `${s.idea}/${n}`);
      } else {
        assert.equal(p.material, s.idea);
      }
    }
  }
  assert.ok(variants > 10);
});

test("an entry order that leaves a part out is refused at load, by name", () => {
  assert.throws(
    () => resolveGenre("g", { g: { label: "G", arrangement: { enter: ["drums", "bass", "keys"] as never } } }),
    /never lets the lead in/,
  );
  assert.throws(
    () => resolveGenre("g", { g: { label: "G", arrangement: { enter: ["drums", "bass", "keys", "lead", "bass"] as never } } }),
    /names the bass 2 times/,
  );
  assert.throws(
    () => resolveGenre("g", { g: { label: "G", arrangement: { enter: ["drums", "bass", "keys", "sax"] as never } } }),
    /"sax", which is not a part/,
  );
});

test("the arrangement is frozen", () => {
  const a = build(1);
  assert.ok(Object.isFrozen(a));
  assert.ok(Object.isFrozen(a.placed));
  assert.ok(Object.isFrozen(a.placed[0]));
});
