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

test("an intro is one of the three ways in, and each one is what its source says it is", () => {
  // See docs/genre-research/THE-INTRO.md. A rhythm intro is the drums, or the
  // drums and the bass, and NOTHING else — it works "because there is little
  // or no melody or harmony to attend to" (Burns 1987), so a keys part in it
  // is not a bigger rhythm intro, it is not one. A bed withholds the tune,
  // because the tune's arrival is what the intro was for. A hook has it from
  // bar one.
  const kinds = new Map<string, number>();
  let intros = 0;
  for (const a of sweep(120)) {
    const intro = a.placed.find((p) => p.section.fn === "intro");
    if (!intro) continue;
    intros++;
    const heard = intro.heard;
    const kind = heard.has("lead") ? "hook"
      : [...heard].every((r) => r === "drums" || r === "bass") && heard.has("drums") ? "rhythm"
      : "bed";
    kinds.set(kind, (kinds.get(kind) ?? 0) + 1);
    assert.ok(heard.size >= 1, describeArrangement(a));
    if (kind === "rhythm") {
      for (const r of heard) assert.ok(r === "drums" || r === "bass", `a rhythm intro carries the ${r}: ${describeArrangement(a)}`);
      // and it is NOT thinned: the drums are the subject
      assert.equal(intro.thin, false, `a rhythm intro with the drums taken apart: ${describeArrangement(a)}`);
    }
    if (kind === "bed") assert.ok(!heard.has("lead") || heard.size === 1, `a bed intro carrying the tune: ${describeArrangement(a)}`);
  }
  assert.ok(intros > 20, `only ${intros} records opened with an intro`);
  // every way in the genre offers is used by some record
  for (const kind of ["bed", "rhythm", "hook"]) {
    assert.ok((kinds.get(kind) ?? 0) > 0, `no record in 120 opened with a ${kind} intro: ${[...kinds]}`);
  }
});

test("an intro fits under the genre's ceiling in seconds", () => {
  // "Intros that averaged more than 20 seconds in the mid-80s are now only
  // about 5 seconds long" (Léveillé Gauvin 2018); eight bars is four seconds
  // at 240 bpm and twenty-three at 82, so the ceiling is on the clock.
  let judged = 0;
  for (let seed = 1; seed <= 120; seed++) {
    const chart = makeChart({ seed, genre: lofi, seconds: 240 });
    const form = makeForm(chart);
    const intro = form.sections.find((x) => x.fn === "intro");
    if (intro === undefined) continue;
    judged++;
    const sec = intro.bars * (60 / chart.tempo) * chart.metre.beats;
    // AND THE ONE WAY PAST THE CEILING IS THE DOCUMENTED ONE: where no length
    // the genre offers fits under it — a slow tempo and a four-bar floor — the
    // shortest is taken and the record says what it is rather than pretending.
    const shortest = Math.min(...lofi.form.lengths.intro.filter(([, w]) => w > 0).map(([len]) => len));
    assert.ok(
      sec <= lofi.form.introSec + 0.001 || intro.bars === shortest,
      `a ${sec.toFixed(1)}s intro of ${intro.bars} bars against a ${lofi.form.introSec}s ceiling`,
    );
  }
  assert.ok(judged > 20, `only ${judged} records opened with an intro`);
});

test("the record ends carrying what it opened with", () => {
  // Not a rule of its own — a fact about the entry and shed orders that is
  // worth holding: parts arrive foundation-first and are shed decoration
  // first, so whatever opened the record is still there at the end. A shed
  // order that PROTECTED the opening was tried and measured at nothing; see
  // the note in arrange.ts.
  let records = 0;
  let inOutro = 0;
  for (const a of sweep(120)) {
    records++;
    const openers = [...a.placed[0]!.heard];
    if (openers.every((r) => a.placed[a.placed.length - 1]!.heard.has(r))) inOutro++;
  }
  assert.ok(inOutro / records > 0.9, `the opening is in the outro of only ${((100 * inOutro) / records).toFixed(0)}% of records`);
});

test("the break is the one section below the floor, and it carries the opening", () => {
  // A breakdown is "a section of a song in which various instruments have solo
  // parts (breaks)", made by "stripping away of other instruments and vocals";
  // breakdowns "usually precede or follow heightened musical climaxes"
  // (en.wikipedia.org/wiki/Breakdown_(music)). It is the only place this
  // program goes below `fewest`, and it is why the opening is ever heard with
  // room round it at all.
  const A = lofi.arrangement;
  let records = 0;
  let broke = 0;
  for (const a of sweep(120, null)) {
    records++;
    const openers = [...a.placed[0]!.heard];
    const breaks = a.placed.filter((p) => p.broken);
    assert.ok(breaks.length <= 1, `${breaks.length} breaks in one record: ${describeArrangement(a)}`);
    for (const p of breaks) {
      broke++;
      assert.ok(p.heard.size <= 2, `a break of ${p.heard.size} parts: ${describeArrangement(a)}`);
      for (const r of p.heard) assert.ok(openers.includes(r), `the break carries the ${r}, which did not open the record: ${describeArrangement(a)}`);
      assert.equal(p.thin, false, "a break is thinned as well as broken");
      assert.notEqual(p.section.fn, "outro", `the record breaks down in its outro: ${describeArrangement(a)}`);
      assert.ok(p.section.index > 0, "the record breaks down before it has played anything");
    }
    // every other section still holds the floor
    for (const p of a.placed) {
      if (p.broken || p.section.fn === "intro") continue;
      assert.ok(p.heard.size >= Math.min(A.fewest, ROLES.length), `${p.section.fn} is under the floor and is not a break: ${describeArrangement(a)}`);
    }
  }
  // measured at 52% of records at 200 seconds, and it needs a quiet section to
  // land in: the break sits where a bridge would, so a record without one has
  // nowhere to put it
  assert.ok(broke / records > 0.15, `only ${((100 * broke) / records).toFixed(0)}% of records have a break`);
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
      if (s.fn === "intro") {
        // A PART THE INTRO CARRIES HAS ARRIVED, wherever it sits in the entry
        // order: a record that opens on its drums has introduced them, and the
        // parts in front of them in the order arrive when the intro ends.
        arrived = Math.max(arrived, ...[...p.heard].map((r) => A.enter.indexOf(r) + 1));
        continue;
      }
      arrived = s.peak || s.energy >= A.fullAbove ? ROLES.length : Math.min(ROLES.length, arrived + 1);
      // NOBODY APPEARS OUT OF TURN. Whoever is heard has ARRIVED — a part
      // cannot appear before the one in front of it in the entry order. It is
      // no longer a PREFIX of that order, because who LEAVES is the shed
      // order and that is deliberately not the reverse of who arrives.
      for (const r of p.heard) {
        assert.ok(A.enter.indexOf(r) < arrived, `${r} played before it arrived: ${describeArrangement(a)}`);
      }
      // NOBODY PLAYS BEFORE THEY HAVE ARRIVED, and no section falls below the
      // floor the genre carries.
      assert.ok(p.heard.size <= arrived, `${s.fn} hears more than have arrived: ${describeArrangement(a)}`);
      // the break is the one section allowed under the floor, and it is the
      // only one — see the break's own test
      if (!p.broken) assert.ok(p.heard.size >= Math.min(A.fewest, arrived), `${s.fn} is below the floor: ${describeArrangement(a)}`);
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
      // and what a genre says it can least afford is still there: the last
      // name in the shed order is the last thing a record gives up
      assert.ok(here.heard.has(A.shed[A.shed.length - 1]!), `the last thing to go went first: ${describeArrangement(a)}`);
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
      const rhythmIntro = p.section.fn === "intro" && p.heard.has("drums")
        && [...p.heard].every((r) => r === "drums" || r === "bass");
      if (p.broken) assert.equal(p.thin, false, `a break is thinned: ${describeArrangement(a)}`);
      else if (p.section.peak) assert.equal(p.thin, false, `the peak is thin: ${describeArrangement(a)}`);
      // an intro whose subject is the drums is not thinned: see the intro test above
      else if (rhythmIntro) assert.equal(p.thin, false, `a rhythm intro is thinned: ${describeArrangement(a)}`);
      else if (p.section.fn === "bridge") assert.equal(p.thin, true);
      else assert.equal(p.thin, p.section.energy < lofi.arrangement.thinBelow);
    }
  }
});

test("a varied statement plays the idea's next variant; an idea that has developed stays developed", () => {
  // The second half used to read "an unvaried statement plays the plain idea",
  // and that is the arc coming undone at the last moment: a record ran intro
  // A, verse A, verse A/1, outro A, so the rule of three fired, the idea went
  // somewhere different, and the record then ended on a note-for-note repeat
  // of how it began as though the development had not happened.
  let variants = 0;
  let held = 0;
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
        const n = seen.get(s.idea) ?? 0;
        assert.equal(p.material, n === 0 ? s.idea : `${s.idea}/${n}`);
        if (n > 0) held++;
      }
    }
  }
  assert.ok(variants > 10);
  assert.ok(held > 10, `only ${held} sections followed a variant`);
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

// ── THE TREATMENTS: the fourth way to change an arrangement ────────────────
// The two-loop rule names four — an instrument in, an instrument out,
// expression up, expression down — and this stage could do three of them,
// reading "expression" as the drums' hat alone. These hold the fourth to
// being a real move, and to being only ever a change of SOUND.

const ds = GENRES.dungeonsynth;
const dsBuild = (seed: number): Arrangement => {
  const chart = makeChart({ seed, genre: ds });
  return makeArrangement(chart, makeForm(chart));
};

test("a treatment changes the sound and never who is playing", () => {
  // The invariant the whole design rests on. `heard` is what the material
  // stage builds for, and a treatment that quietly dropped a part would put a
  // section on a desk AND take a player away, which is two moves at a boundary
  // the two-loop rule allows one of.
  let boundaries = 0;
  for (let seed = 1; seed <= 60; seed++) {
    for (const p of dsBuild(seed).placed) {
      for (let i = 1; i < p.spans.length; i++) {
        const a = p.spans[i - 1]!, b = p.spans[i]!;
        if (a.treatment === b.treatment) continue;
        boundaries++;
        assert.equal(a.heard.size, b.heard.size, "a treatment changed how many play");
        for (const r of a.heard) assert.ok(b.heard.has(r), `a treatment took the ${r} away`);
        assert.equal(a.thin, b.thin, "a treatment changed the drums' expression");
      }
    }
  }
  assert.ok(boundaries > 100, `only ${boundaries} boundaries moved the desk across 60 records`);
});

test("a record only uses treatments its genre carries", () => {
  const allowed = new Set(ds.arrangement.treat.filter(([, w]) => w > 0).map(([t]) => t));
  const seen = new Set<string>();
  for (let seed = 1; seed <= 60; seed++) {
    for (const p of dsBuild(seed).placed) {
      for (const sp of p.spans) {
        if (sp.treatment === null) continue;
        assert.ok(allowed.has(sp.treatment), `${sp.treatment} is not in this genre's pool`);
        seen.add(sp.treatment);
      }
    }
  }
  // and the pool is really a pool: a genre that only ever reached for one
  // would have a list where it wanted a number
  assert.ok(seen.size >= 5, `only ${seen.size} distinct treatments across 60 records`);
});

test("a rule-of-three demand the notes may not answer is answered by the desk", () => {
  // `recast` is the form saying: this hearing owes a change and it may not be
  // bought with new material, because the idea never comes back to show it.
  // Every one of them has to be met, or the demand travelled nowhere.
  let recasts = 0;
  for (let seed = 1; seed <= 60; seed++) {
    for (const p of dsBuild(seed).placed) {
      if (!p.section.recast) continue;
      recasts++;
      assert.notEqual(p.spans[0]!.treatment, null, `a recast ${p.section.fn} opened on the genre's own desk`);
    }
  }
  assert.ok(recasts > 10, `only ${recasts} recast sections across 60 records`);
});

test("the desk moving does not leave the arrangement with nothing to do", () => {
  // `stuck` counts boundaries where every move refused. A richer pool must not
  // make that worse, and in fact it cannot be anything but better.
  let stuck = 0;
  for (let seed = 1; seed <= 60; seed++) stuck += dsBuild(seed).stuck;
  assert.equal(stuck, 0, `${stuck} boundaries had no move available`);
});
