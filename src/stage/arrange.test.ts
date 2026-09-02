import test from "node:test";
import assert from "node:assert/strict";
import { makeArrangement, describeArrangement, type Arrangement } from "./arrange.ts";
import { makeChart } from "./chart.ts";
import { makeForm } from "./form.ts";
import { GENRES, resolveGenre } from "../genre/index.ts";
import { ROLES } from "../genre/spec.ts";

const lofi = GENRES.lofi;
const build = (seed: number, seconds: number | null = 240): Arrangement => {
  const chart = makeChart(seconds === null ? { seed, genre: lofi } : { seed, genre: lofi, seconds });
  return makeArrangement(chart, makeForm(chart));
};
const sweep = (n: number, seconds: number | null = 240) => Array.from({ length: n }, (_, i) => build(i + 1, seconds));

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

test("parts arrive in order, and how many play is the section's energy", () => {
  // What this replaced asserted that once everyone was in, everyone STAYED —
  // and that was the defect. "Five elements at one time — counting the drums
  // as one — is generally the most you'll hear"
  // (soundonsound.com/techniques/arranging-pop), and this program has exactly
  // five parts, so a record that reaches five in its first chorus and holds
  // it to the end has no arrangement in it at all.
  const A = lofi.arrangement;
  let quieter = 0;
  let fuller = 0;
  for (const a of sweep(120)) {
    let arrived = A.introParts;
    const sizes: number[] = [];
    for (const p of a.placed) {
      const s = p.section;
      // NOBODY APPEARS OUT OF TURN. Whoever is heard is a prefix of the entry
      // order, always — a part cannot arrive before the one in front of it.
      const prefix = A.enter.slice(0, p.heard.size);
      assert.deepEqual(p.heard, new Set(prefix), `out of turn: ${describeArrangement(a)}`);
      if (s.fn === "intro") {
        assert.equal(p.heard.size, A.introParts);
        continue;
      }
      arrived = s.peak || s.energy >= A.fullAbove ? ROLES.length : Math.min(ROLES.length, arrived + 1);
      // NOBODY PLAYS BEFORE THEY HAVE ARRIVED, and no section falls below the
      // floor the genre carries.
      assert.ok(p.heard.size <= arrived, `${s.fn} hears more than have arrived: ${describeArrangement(a)}`);
      assert.ok(p.heard.size >= Math.min(A.fewest, arrived), `${s.fn} is below the floor: ${describeArrangement(a)}`);
      // THE PEAK HAS EVERYONE, because that is what a peak is.
      if (s.peak) assert.equal(p.heard.size, ROLES.length, `the peak does not hear everyone: ${describeArrangement(a)}`);
      sizes.push(p.heard.size);
    }
    // AND THE TEXTURE MOVES. A record whose every section is the same size is
    // the block this replaced.
    assert.ok(new Set(sizes).size >= 2, `every section is the same size: ${describeArrangement(a)}`);
    const top = Math.max(...sizes);
    quieter += sizes.filter((n) => n < top).length;
    fuller += sizes.filter((n) => n === top).length;
  }
  assert.ok(quieter > 100, `only ${quieter} sections played under their record's fullest`);
  assert.ok(fuller > 100, `only ${fuller} sections played their record's fullest`);
});

test("a quiet section carries its foundation and drops its decoration", () => {
  // which parts go is the entry order backwards: "the chord first, then the
  // beat under it, the bass, and the tune last", so what a quiet section
  // keeps is what the record is built on
  const A = lofi.arrangement;
  let compared = 0;
  for (const a of sweep(120)) {
    const sections = a.placed.filter((p) => p.section.fn !== "intro");
    for (let i = 1; i < sections.length; i++) {
      const before = sections[i - 1]!;
      const here = sections[i]!;
      if (here.heard.size >= before.heard.size) continue;
      // everything still heard was heard before it: a section that shrinks
      // loses parts, it does not swap them
      for (const r of here.heard) assert.ok(before.heard.has(r), `${r} appeared while the texture shrank: ${describeArrangement(a)}`);
      // and the first part of the order is never the one to go
      assert.ok(here.heard.has(A.enter[0]!), `the foundation went first: ${describeArrangement(a)}`);
      compared++;
    }
  }
  assert.ok(compared > 40, `only ${compared} sections thinned out`);
});

test("the outro lets the last-entered part go, once it has been a fixture", () => {
  const last = lofi.arrangement.enter[lofi.arrangement.enter.length - 1]!;
  let kept = 0;
  let letGo = 0;
  // at the genre's own length, so that the short records — an intro, a
  // verse still building, one chorus — are in the sweep
  for (const a of sweep(120, null)) {
    const outro = a.placed[a.placed.length - 1]!;
    assert.equal(outro.section.fn, "outro");
    const before = a.placed.slice(0, -1).filter((p) => p.heard.has(last)).length;
    // once the part has been a fixture, the outro is without it — whether
    // because the outro is quiet enough to have dropped it already, or
    // because this rule takes it away from an outro that is not
    if (before >= 2) {
      assert.ok(!outro.heard.has(last), `the outro kept the ${last}: ${describeArrangement(a)}`);
      letGo++;
    } else kept++;
  }
  assert.ok(kept > 5 && letGo > 20, `${kept} outros kept the ${last}, ${letGo} let it go`);
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
