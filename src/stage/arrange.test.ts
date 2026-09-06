import test from "node:test";
import assert from "node:assert/strict";
import { makeArrangement, describeArrangement, type Arrangement } from "./arrange.ts";
import { NEEDS_DRUMS, deskOf } from "./treat.ts";
import { settle } from "../sound/render.ts";
import { makeChart } from "./chart.ts";
import { makeForm } from "./form.ts";
import { GENRES, resolveGenre } from "../genre/index.ts";
import { ROLES, TREATMENTS } from "../genre/spec.ts";

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

test("the break goes below the floor mid-record, and it carries the opening", () => {
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
    // every other section that CARRIES ON still holds the floor. The last one
    // is not floored by `fewest` — see `floor` in arrange.ts and §5 of
    // THE-INTRO.md, which used to call the break the one place below the
    // floor and was corrected when an ending was researched. What holds the
    // ending up is the dénouement, asserted by its own test above, not a
    // number: measured, "ends carrying what it opened with" is unchanged at
    // 97% and 87% by this rule, while dungeon synth's drone-alone ending went
    // 0% → 10%.
    const lastIndex = a.placed.length - 1;
    for (const p of a.placed) {
      if (p.broken || p.section.fn === "intro" || p.section.index === lastIndex) continue;
      assert.ok(p.heard.size >= Math.min(A.fewest, ROLES.length), `${p.section.fn} is under the floor and is not a break: ${describeArrangement(a)}`);
    }
    // and the ending never goes below what the record opened with, capped at
    // the floor: an ending may rest on less than a middle section, never more
    const closing = a.placed[lastIndex]!;
    const opened = a.placed[0]!.heard.size;
    assert.ok(
      closing.heard.size >= Math.min(A.fewest, opened),
      `the ending fell below its own opening: ${describeArrangement(a)}`,
    );
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
      // the break and the ENDING are the two sections allowed under the floor
      // — see the break's own test, and `floor` in arrange.ts for why an
      // ending is not floored by a number at all
      if (!p.broken && s.index !== a.placed.length - 1) {
        assert.ok(p.heard.size >= Math.min(A.fewest, arrived), `${s.fn} is below the floor: ${describeArrangement(a)}`);
      }
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
      // THE BREAK IS THE DOCUMENTED EXCEPTION and always was: it goes below
      // the floor carrying "what the record opened with, and nothing else"
      // (THE-INTRO.md §5), which is a swap by definition — it can bring an
      // opener back while shrinking. This never fired while the opening part
      // was never dropped in the first place, which was the defect
      // THE-ARRANGEMENT-AS-STORY.md measured; now that a record can miss its
      // opener, the break can restore it.
      if (here.broken) continue;
      // AND SO IS THE CLOSE, for the same reason and from the same cause.
      // "The ending restates what the record opened with" (Ableton,
      // dénouement — THE-ARRANGEMENT-AS-STORY.md §7 rule 4) is the same law
      // as the break's, in the other place the code states it: `restate` in
      // arrange.ts refuses to drop an opener from the last section, so the
      // close too can bring one back while shrinking. It went unexempted here
      // for exactly the reason the break's did — it cannot fire until a
      // record is able to miss its opener in the section before, which lofi
      // was not while its drums sat last in an inherited shed order.
      if (here.section.index === a.placed.length - 1) continue;
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
      // AND ONLY WHERE THERE IS A KIT TO THIN. This file's header says a
      // bridge "thins the drums: a breath, not a stop", and a section with no
      // drums in it has no hat to take off. This test asserted `thin` on a
      // bridge whatever was playing, so the stage set it on 338 sections of
      // 600 records where it moved no note and put the word in the record's
      // own text for a kit that was not there.
      if (!p.heard.has("drums")) { assert.equal(p.thin, false, `thinned with no drums: ${describeArrangement(a)}`); continue; }
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

test("a treatment changes the sound, and never who is playing, by itself", () => {
  // The invariant the whole design rests on: `heard` is what the material
  // stage builds for, so a treatment that quietly dropped a part would be a
  // density move wearing a colour move's name.
  //
  // THIS TEST USED TO ASSERT THAT `heard` NEVER MOVES AT A BOUNDARY THAT
  // MOVED THE DESK, and gave as its reason "which is two moves at a boundary
  // the two-loop rule allows one of". That reason was false, and this
  // repository already said so before the test was written:
  // `THE-STALENESS-CLOCK.md` §"Two things the sources say that the program
  // does not do" — "The two-loop source never says ONE thing changes. In its
  // own worked example the producer adds the drums at the first boundary, and
  // at the second adds hi-hats AND a bigger clap AND a bass AND a
  // counter-melody — four moves in a single two-loop window. The restriction
  // is this program's." A boundary now spends up to two changes, so the old
  // assertion measured the loop's shape and not the treatment's behaviour.
  //
  // What is still true, and is what the design actually rests on, is that no
  // SINGLE move both treats and re-players. So: at a boundary that moved the
  // desk, at most one further thing moved, and it moved by one part at most.
  let boundaries = 0, alsoMoved = 0;
  for (let seed = 1; seed <= 60; seed++) {
    for (const p of dsBuild(seed).placed) {
      for (let i = 1; i < p.spans.length; i++) {
        const a = p.spans[i - 1]!, b = p.spans[i]!;
        if (a.treatment === b.treatment && a.at === b.at) continue;
        boundaries++;
        const gone = [...a.heard].filter((r) => !b.heard.has(r));
        const came = [...b.heard].filter((r) => !a.heard.has(r));
        const players = gone.length + came.length;
        const kit = (a.thin !== b.thin ? 1 : 0) + (a.halved !== b.halved ? 1 : 0);
        const held = a.hush !== b.hush ? 1 : 0;
        // ONE FURTHER MOVE, WHICH IS NOT ONE FURTHER PART: `all-back` puts
        // the whole section back in one move, so counting players would call
        // a single legal move an illegal pair. What is bounded is the number
        // of KINDS of thing that moved beside the desk, and that is one.
        assert.ok(Math.min(1, players) + Math.min(1, kit) + held <= 1,
          `a desk boundary spent more than one further move (seed ${seed}): ${players} players, ${kit} kit, ${held} held`);
        if (players + kit + held > 0) alsoMoved++;
      }
    }
  }
  assert.ok(boundaries > 100, `only ${boundaries} boundaries moved the desk across 60 records`);
  // and the second change is really being spent, or this test guards nothing
  assert.ok(alsoMoved > 0, "no desk boundary ever spent its second change");
});

test("the climax is not where things are taken away", () => {
  // THE REGRESSION THIS PROGRAM HAS NOW MADE TWICE, and that the suite was
  // green through both times. The peak is the one section the form declares
  // has everybody in it, so a span there that holds back TWO things is the
  // climax arriving with two pieces missing. `HANDOFF.md` records the first
  // occurrence — an obligation term weighted by breadth — and the second was
  // letting a boundary spend more than one change: peak spans holding back
  // two things went 2% to 32% on lofi and 3% to 31% on dungeon synth, with
  // every one of 293 tests still passing.
  //
  // ONE thing held back at the peak is not the fault and is not asserted
  // against: it sits around a third of peak spans and it is the peak
  // breathing. It is the SECOND subtraction that empties it.
  for (const g of ["lofi", "dungeonsynth"] as const) {
    let spans = 0, twoBack = 0;
    for (let seed = 1; seed <= 60; seed++) {
      const chart = makeChart({ seed, genre: GENRES[g] });
      const form = makeForm(chart);
      const p = makeArrangement(chart, form).placed.find((x) => x.section.index === form.peakAt);
      if (p === undefined) continue;
      for (const sp of p.spans) {
        spans++;
        if ((sp.hush !== null ? 1 : 0) + (sp.thin ? 1 : 0) + (sp.halved ? 1 : 0) >= 2) twoBack++;
      }
    }
    assert.ok(spans > 50, `${g}: only ${spans} peak spans to judge`);
    const share = twoBack / spans;
    assert.ok(share <= 0.1, `${g}: ${(100 * share).toFixed(0)}% of peak spans hold back two things or more`);
  }
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

test("a per-part treatment says which part, and survives being frozen", () => {
  // `Span` is REBUILT field by field on the way out of makeArrangement, and
  // the rebuild is cast to Span — so a field left out of it is not a type
  // error, it is a field that silently stops existing downstream. That is
  // exactly how `at` was lost on its first outing with `npm run check` green,
  // and nothing else in this suite would have noticed. This is the assertion
  // that would have.
  let perPart = 0;
  let wholeDesk = 0;
  for (let seed = 1; seed <= 60; seed++) {
    for (const p of dsBuild(seed).placed) {
      for (const sp of p.spans) {
        assert.ok("at" in sp, "a span came out of the arrangement without `at`");
        if (sp.treatment === null) {
          assert.equal(sp.at, null, "an untreated span names a part");
          continue;
        }
        if (sp.at === null) { wholeDesk++; continue; }
        perPart++;
        // the part it is aimed at is one that is actually sounding, or the
        // desk moves a part nobody can hear
        assert.ok(sp.heard.has(sp.at), `${sp.treatment} is aimed at the ${sp.at}, which is not playing`);
      }
    }
  }
  assert.ok(perPart > 0, "no record aimed a treatment at one part");
  assert.ok(wholeDesk > 0, "the whole-desk treatments stopped being offered");
});

test("no treatment puts a knob outside the range the genre resolver enforces", () => {
  // `settle` is a MERGE and not a validator: nothing downstream re-checks a
  // value laid over a genre, so a treatment that scaled a spring's decay to
  // eight seconds against its six-second ceiling would be a fault no test
  // upstream could catch. treat.ts states that as its second rule; this is
  // the assertion behind it, and it caught a real one — `linger` clamped the
  // spring to the ROOM's ceiling, the two reverbs having different ones.
  const RANGES: readonly (readonly [string, number, number])[] = [
    ["rack.room.sec", 0.2, 12], ["rack.spring.sec", 0.2, 6],
    ["rack.pole.hz", 40, 20000], ["rack.tape.lowpassHz", 1000, 20000],
    ["rack.echo.feedback", 0, 0.9], ["rack.medium.mix", 0, 1],
    ["rack.vinyl.crackle", 0, 1], ["rack.room.ret", 0, 2],
    ["rack.spring.ret", 0, 2], ["rack.echo.ret", 0, 2],
  ];
  const at = (o: unknown, path: string): unknown =>
    path.split(".").reduce<unknown>((v, k) => (v as Record<string, unknown> | undefined)?.[k], o);
  let checked = 0;
  for (const G of [lofi, GENRES.dungeonsynth]) {
    for (const t of TREATMENTS) {
      for (const only of [undefined, ...ROLES]) {
        const spec = deskOf(t, G.sound, only);
        if (spec === null) continue;
        checked++;
        const S = settle(G.sound, spec);
        for (const [path, lo, hi] of RANGES) {
          const v = at(S, path);
          if (typeof v !== "number") continue;
          assert.ok(v >= lo && v <= hi, `${G.name} ${t}${only ? "@" + only : ""} put ${path} at ${v}, outside ${lo}..${hi}`);
        }
        for (const r of ROLES) {
          const ch = S.mix[r];
          assert.ok(ch.pedals >= 0 && ch.pedals <= 1, `${t} put ${r} pedals at ${ch.pedals}`);
          assert.ok(ch.dist >= 0 && ch.dist <= 1, `${t} put ${r} dist at ${ch.dist}`);
          assert.ok(ch.sweepDepth >= 0 && ch.sweepDepth <= 1, `${t} put ${r} sweepDepth at ${ch.sweepDepth}`);
          assert.ok(ch.az >= -180 && ch.az <= 180, `${t} put ${r} az at ${ch.az}`);
        }
      }
    }
  }
  assert.ok(checked > 30, `only ${checked} treatment/part combinations were live`);
});

test("a part can walk in part way through a section, and always does walk in", () => {
  // This file's header said for a long time that "nothing here enters for the
  // first time halfway through a record", and it was true: `arrived` grew once
  // a SECTION, so every first entrance landed on a section boundary — where
  // the material, the energy and the desk may all change too, and an entrance
  // is not heard as an entrance. It also left long sections with nothing to
  // do: a section that opens under the floor can never offer `part-out`, and
  // with nobody missing it can never offer `part-back` either.
  //
  // THE PART MUST ACTUALLY ARRIVE. Left to the score this was a candidate like
  // any other, and it lost often enough that the union of the spans came out
  // smaller than the section asked for — one 32-bar verse came out as a drone
  // on its own, with the keys built and never played. So it is a rule at the
  // first boundary, and this is the assertion behind that.
  let opened = 0;
  for (let seed = 1; seed <= 60; seed++) {
    for (const a of [build(seed), dsBuild(seed)]) {
      for (const p of a.placed) {
        const first = p.spans[0]!.heard;
        const late = [...p.heard].filter((r) => !first.has(r));
        if (late.length === 0) continue;
        opened++;
        assert.equal(late.length, 1, `${late.length} parts walked in at once: ${describeArrangement(a)}`);
        const who = late[0]!;
        // only a part that LOOPS, because the tune and the drums are written
        // per round and the tune's plan includes rests — one entering late can
        // land entirely on them and play nothing
        assert.ok(who === "bass" || who === "keys" || who === "drone", `the ${who} walked in, and it is written per round`);
        // IT IS IN AT THE FIRST BOUNDARY THAT COULD LET IT IN, and never
        // merely promised. This read `p.spans[1]`, which was the first
        // boundary while every span was two turns of the loop. It is not any
        // more: the arrangement also alters on a bar clock, and at a bar point
        // the roster is frozen — so the entrance waits for the first two-turn
        // boundary and there may be bar points before it. Stated as what the
        // law actually says instead of by index: the FIRST change to who is
        // playing in this section is this part arriving. Any span whose roster
        // differs from span 0's is by construction a two-turn boundary, so
        // this needs no period to check.
        const firstMove = p.spans.findIndex((sp, i) =>
          i > 0 && (sp.heard.size !== first.size || [...sp.heard].some((r) => !first.has(r))));
        assert.ok(firstMove > 0 && p.spans[firstMove]!.heard.has(who),
          `the ${who} was held back and did not walk in: ${describeArrangement(a)}`);
        assert.ok(!p.section.peak, "the peak opened short, and a peak has everyone");
        assert.equal(p.broken, false, "the break opened short, and it is a stripping away already");
      }
    }
  }
  assert.ok(opened > 40, `only ${opened} sections let a part in part way through`);
});

test("a drum machine move is never made where the drums are silent", () => {
  // `deskOf` asks whether a move changes the DESK, which is the right question
  // for the rack and the wrong one for the machine: swapping a kit changes the
  // machine whether or not anybody is playing it, so it passes that test and
  // is still inaudible. A boundary spent on a move nobody can hear is worse
  // than a knob that does nothing — the two-loop rule paid for it and the ear
  // gets the section repeated instead.
  let machine = 0;
  for (let seed = 1; seed <= 60; seed++) {
    for (const a of [build(seed), dsBuild(seed)]) {
      for (const p of a.placed) {
        for (const sp of p.spans) {
          if (sp.treatment === null || !NEEDS_DRUMS.includes(sp.treatment)) continue;
          machine++;
          assert.ok(sp.heard.has("drums"), `${sp.treatment} with the drums silent: ${describeArrangement(a)}`);
        }
      }
    }
  }
  assert.ok(machine > 0, "no record moved the drum machine, so this asserts nothing");
});

test("the desk moving does not leave the arrangement with nothing to do", () => {
  // `stuck` counts boundaries where every move refused. A richer pool must not
  // make that worse, and in fact it cannot be anything but better.
  let stuck = 0;
  for (let seed = 1; seed <= 60; seed++) stuck += dsBuild(seed).stuck;
  assert.equal(stuck, 0, `${stuck} boundaries had no move available`);
});

test("every rule this file states about a span, it keeps", () => {
  // THE FOUNDATION, HELD TO ITSELF.
  //
  // This stage states its rules in prose at the top of `arrange.ts` and in the
  // comments beside each `push`, and until now nothing checked that the spans
  // it makes obey them. They were kept by accident of the walk: one move per
  // boundary, each built from a `push` that had already applied its own guard.
  // That is not the same as the rules holding, and three of them were not:
  // the kit was thinned with the kit not sounding in 338 sections of 600
  // records, the break was thinned in 8 where the section had just refused to
  // thin it, and the header claimed every span is a subset of span 0 when a
  // part walks in at the first boundary 746 times.
  //
  // A rule kept only by the shape of the walk is a rule the next change to the
  // walk breaks, silently. So it is checked here, over both genres, and
  // anything added to this stage has to keep them too.
  for (const [name, g] of [["lofi", lofi], ["dungeonsynth", ds]] as const) {
    for (let seed = 1; seed <= 60; seed++) {
      const chart = makeChart({ seed, genre: g });
      const arr = makeArrangement(chart, makeForm(chart));
      for (const p of arr.placed) {
        const where = `${name} seed ${seed} section ${p.section.index} (${p.section.fn})`;
        const base = p.spans[0]!;
        p.spans.forEach((sp, k) => {
          const at = `${where} span ${k}`;
          // THE KIT'S EXPRESSION IS THE KIT'S. `thin` takes the hat and the
          // fills off and `halved` plays the figure at half speed; both are
          // knobs on a kit, and a kit that is not sounding has no hat to lose.
          if (!sp.heard.has("drums")) {
            assert.equal(sp.thin, false, `${at}: thinned with the drums not sounding`);
            assert.equal(sp.halved, false, `${at}: halved with the drums not sounding`);
          }
          // A PART HELD BACK IS A PART SOUNDING. `hush` is a gain on a part,
          // and a gain on silence is nothing at all.
          if (sp.hush !== null) assert.ok(sp.heard.has(sp.hush), `${at}: the ${sp.hush} is held back and is not sounding`);
          // AND A TREATMENT AIMED AT A PART IS AIMED AT ONE THAT PLAYS.
          if (sp.at !== null) assert.ok(sp.heard.has(sp.at), `${at}: a treatment aimed at the ${sp.at}, which is not sounding`);
          // EVERY SPAN IS A SUBSET OF `Placed.heard`, which is their union, so
          // every part heard anywhere in the section has a material built for
          // it and nothing is silent by omission. NOT of span 0 — a part walks
          // in at the first boundary, and `part-back` restores from the base.
          for (const r of sp.heard) assert.ok(p.heard.has(r), `${at}: the ${r} plays and is not in the section's parts`);
          // THE DRONE DOES NOT COME AND GO INSIDE A SECTION: it is the floor
          // the section stands on, and one material has one drone, so what
          // came back would be note for note what left.
          if (base.heard.has("drone")) assert.ok(sp.heard.has("drone"), `${at}: the drone left inside a section`);
          // THE PEAK NEVER LOSES A PART — "that is what a peak is" — so at a
          // peak the change is expression, not a hole.
          if (p.section.peak) assert.equal(sp.heard.size >= base.heard.size, true, `${at}: the peak lost a part`);
        });
        // A BREAK IS NOT THINNED: there is nothing left in it to thin, and the
        // drums it may consist of are the thing being heard. The section
        // refuses it; so must every span of it.
        if (p.broken) for (const sp of p.spans) assert.equal(sp.thin, false, `${where}: the break was thinned`);
      }
    }
  }
});
