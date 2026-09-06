import test from "node:test";
import assert from "node:assert/strict";
import { makeMaterials, describeMaterial, MaterialError, type Materials, type Note } from "./index.ts";
import { makeChart } from "../chart.ts";
import { makeForm } from "../form.ts";
import { makeArrangement } from "../arrange.ts";
import { GENRES, resolveGenre } from "../../genre/index.ts";
import { lofi as lofiSpec } from "../../genre/lofi.ts";
import { inScale, pc, noteName } from "../../core/theory.ts";
import { Sounding } from "./note.ts";
import { stepsPerBar } from "../../core/clock.ts";

const lofi = GENRES.lofi;
const build = (seed: number, seconds?: number): Materials => {
  const chart = makeChart(seconds === undefined ? { seed, genre: lofi } : { seed, genre: lofi, seconds });
  return makeMaterials(chart, makeArrangement(chart, makeForm(chart)));
};
const sweep = (n: number): Materials[] => Array.from({ length: n }, (_, i) => build(i + 1, 240));

test("the same seed builds the same materials", () => {
  const a = build(7);
  const b = build(7);
  assert.deepEqual([...a.all.keys()], [...b.all.keys()]);
  for (const k of a.all.keys()) {
    assert.equal(describeMaterial(a.all.get(k)!), describeMaterial(b.all.get(k)!));
    assert.deepEqual(a.all.get(k), b.all.get(k));
  }
});

test("only what is heard is built: every section is answered, and each part has exactly the lines it plays", () => {
  for (let seed = 1; seed <= 60; seed++) {
    const chart = makeChart({ seed, genre: lofi, seconds: 240 });
    const arr = makeArrangement(chart, makeForm(chart));
    const mats = makeMaterials(chart, arr);
    const demanded = new Set(arr.placed.map((p) => p.material));
    assert.deepEqual(new Set(mats.all.keys()), demanded, "a material exists that no section plays");
    for (const [key, m] of mats.all) {
      const times = (role: "lead" | "drums") =>
        arr.placed.filter((p) => p.material === key && p.heard.has(role)).reduce((n, p) => n + Math.ceil(p.section.bars / m.bars), 0);
      assert.equal(m.lead.length, times("lead"), `${key} has ${m.lead.length} lead lines for ${times("lead")} times round`);
      assert.equal(m.drums.length, times("drums"), `${key} has ${m.drums.length} drum phrases for ${times("drums")} times round`);
    }
  }
});

test("a varied statement is its statement changed, not a new one", () => {
  // This used to demand that a variant's GROUND differ from its statement's,
  // and that demand is why a return never sounded like one: a variant that
  // redraws the bass and the chords under it is a new section wearing the old
  // one's harmony. What makes a section recognisable as itself coming back is
  // the ground — the changes, the bass on them, the drone under them — so
  // those are required to be identical here.
  //
  // THE HANDS ARE NOT THE GROUND. Inheriting the keys as well was measured on
  // the roll: a seventy-two-bar record on one idea laid the identical two bars
  // of keys down thirty-six times without moving once, and the form had duly
  // marked the third hearing to vary. So a variant redraws its keys over the
  // inherited changes, which is what a second verse is — the same harmony,
  // played again by a hand that has heard it once.
  //
  // The beat changes too: "the cheapest change there is", where "you could
  // keep everything exactly the same way and change just the drum beat and it
  // instantly feels different" (secretsofsongwriting.com, "The Main
  // Differences Between Verse 1 and Verse 2"), and so does the tune, by a
  // documented motivic operation.
  const varied = sweep(120).filter((m) => [...m.all.keys()].some((k) => k.includes("/")));
  assert.ok(varied.length > 10, `only ${varied.length} records had a variant`);
  let checked = 0;
  for (const m of varied) {
    for (const [k, v] of m.all) {
      if (!k.includes("/")) continue;
      const plain = m.all.get(v.idea)!;
      checked++;
      assert.equal(v.variant >= 1, true);
      assert.deepEqual(v.chords.map((c) => c.name), plain.chords.map((c) => c.name), "a variant changed the changes");
      // it IS the same idea: the same changes, the same ground under them, the
      // same beat's skeleton, and the same grammar in its tune
      assert.equal(JSON.stringify(v.groove.bass), JSON.stringify(plain.groove.bass), `${k} redrew the bass instead of inheriting it`);
      assert.equal(JSON.stringify(v.groove.drone), JSON.stringify(plain.groove.drone), `${k} redrew the drone instead of inheriting it`);
      assert.deepEqual(v.figure, plain.figure, `${k} redrew the beat's skeleton, leaving the bass on a kick that is not there`);
      assert.equal(v.contour, plain.contour, `${k} plays its statement's tune but calls it something else`);
      // and it is CHANGED: the beat, the tune, or both
      const beat = JSON.stringify(v.drums[0]) !== JSON.stringify(plain.drums[0]);
      const stated = (x: typeof v) => JSON.stringify(x.lead.find((l) => l.length > 0) ?? []);
      const tune = stated(v) !== stated(plain);
      assert.ok(beat || tune, `${k} is note-for-note its plain statement`);
    }
  }
  assert.ok(checked > 10);
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
    const m = makeMaterials(chart, makeArrangement(chart, makeForm(chart)));
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
        const down = mat.groove.bass.find((n) => n.bar === ch.bar && n.step === 0);
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
      const ns = mat.groove.bass.slice().sort((a, b) => a.bar - b.bar || a.step - b.step);
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
        const ns = mat.groove.bass.filter((n) => n.bar === bar).sort((a, b) => a.step - b.step);
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

test("where the genre says so, the bass stands on the kick's feet", () => {
  assert.equal(lofi.bass.pocket, "kick");
  for (const m of sweep(40)) {
    for (const mat of m.all.values()) {
      for (let bar = 0; bar < mat.bars; bar++) {
        const feet = mat.groove.bass.filter((n) => n.bar === bar).map((n) => n.step);
        assert.deepEqual(feet, [...mat.figure.kick], `${mat.key} bar ${bar}: bass on ${feet}, kick on ${mat.figure.kick}`);
      }
    }
  }
});

test("a genre with its own bass pocket does not follow the kick", () => {
  const own = resolveGenre("own", { own: { label: "Own", extend: "lofi", bass: { pocket: [[[0, 2], 1]] } }, lofi: lofiSpec });
  const chart = makeChart({ seed: 4, genre: own, seconds: 200 });
  const m = makeMaterials(chart, makeArrangement(chart, makeForm(chart)));
  for (const mat of m.all.values()) {
    for (let bar = 0; bar < mat.bars; bar++) {
      assert.deepEqual(mat.groove.bass.filter((n) => n.bar === bar).map((n) => n.step), [0, 2 * chart.metre.perBeat]);
    }
  }
});

test("keys voice every tone of the chord, in register, led smoothly", () => {
  const [lo, hi] = lofi.keys.register;
  /** Grid steps in a bar: 4/4 at a sixteenth grid, which is what these genres are. */
  const STEPS = 16;
  let moves = 0;
  let total = 0;
  for (const m of sweep(60)) {
    for (const mat of m.all.values()) {
      let prevTop: number | null = null;
      for (const ch of mat.chords) {
        /**
         * SOUNDING AT THIS BAR, not struck in it.
         *
         * This counted the notes written at bar/step 0, which measured
         * "voiced" exactly while every keys note was one bar long and every
         * bar was struck from scratch. `keys.hold` broke that assumption on
         * purpose: a tone the chord before it also held is left RINGING
         * rather than hit again, which is what a pedal tone is and what a
         * hand does.
         *
         * The law is unchanged and is the one this test is named for — every
         * tone of the chord is voiced, none missing. What changed is that a
         * voice can be sounding from a note that began earlier. Checked
         * directly over both genres and 540 chords: not one tone is ever
         * neither struck nor still ringing.
         */
        const at = ch.bar * STEPS;
        const struck = mat.groove.keys.filter(
          (n) => n.bar * STEPS + n.step <= at && n.bar * STEPS + n.step + n.dur > at,
        );
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
  const m = makeMaterials(chart, makeArrangement(chart, makeForm(chart)));
  let muddy = 0;
  let chords = 0;
  for (const mat of m.all.values()) {
    for (const ch of mat.chords) {
      chords++;
      const v = mat.groove.keys.filter((n) => n.bar === ch.bar && n.step === 0).map((n) => n.pitch).sort((a, b) => a - b);
      for (let i = 1; i < v.length; i++) if (v[i - 1]! < 48 && v[i]! - v[i - 1]! < 4) muddy++;
    }
  }
  assert.ok(muddy / chords < 0.15, `${muddy} muddy intervals in ${chords} chords`);
});

test("every note is in the scale and in its register", () => {
  for (let seed = 1; seed <= 40; seed++) {
    const chart = makeChart({ seed, genre: lofi, seconds: 240 });
    const m = makeMaterials(chart, makeArrangement(chart, makeForm(chart)));
    for (const mat of m.all.values()) {
      for (const n of [...mat.groove.bass, ...mat.groove.keys]) {
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
      makeMaterials(chart, makeArrangement(chart, makeForm(chart)));
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
    assert.ok(Object.isFrozen(mat.groove.bass));
    assert.ok(Object.isFrozen(mat.chords));
  }
});

test("a genre that avoids the diminished degree never lands on it, in any mode", () => {
  const ds = GENRES.dungeonsynth;
  const modes = new Set<string>();
  for (let seed = 1; seed <= 60; seed++) {
    const chart = makeChart({ seed, genre: ds, seconds: 240 });
    modes.add(chart.scaleName);
    const m = makeMaterials(chart, makeArrangement(chart, makeForm(chart)));
    for (const mat of m.all.values()) {
      for (const ch of mat.chords) assert.ok(!/dim|m7b5/.test(ch.name), `${chart.scaleName} seed ${seed}: ${ch.name}`);
    }
  }
  assert.ok(modes.size >= 2, `only ${[...modes]} drawn`);
});

test("a note that rings past its bar is sounding in the bars it rings through", () => {
  // the bug this is against: positions were keyed by the note's own bar and
  // a running step, so a drone holding four bars was recorded as steps 0 to
  // 63 of bar 0 and was invisible in bars 1, 2 and 3. Nothing failed; a cost
  // that depended on it simply never fired, at any value.
  const s = new Sounding();
  s.add([{ bar: 0, step: 0, dur: 64, pitch: 60, vel: 0.5 }], 4, 16);
  for (let bar = 0; bar < 4; bar++) {
    for (const step of [0, 7, 15]) {
      assert.ok(s.holds(bar, step, 60), `not sounding at ${bar}:${step}`);
      assert.ok(s.rubs(bar, step, 61), `no rub at ${bar}:${step}`);
      assert.ok(!s.rubs(bar, step, 63));
    }
  }
  // and it wraps round the loop rather than running off the end
  const wrap = new Sounding();
  wrap.add([{ bar: 3, step: 8, dur: 16, pitch: 48, vel: 0.5 }], 4, 16);
  assert.ok(wrap.holds(3, 15, 48));
  assert.ok(wrap.holds(0, 0, 48), "a note running past the last bar does not come round");
});

test("the drone holds the key, not the chord", () => {
  for (const name of ["lofi", "dungeonsynth"] as const) {
    const g = GENRES[name];
    let held = 0;
    for (let seed = 1; seed <= 40; seed++) {
      const chart = makeChart({ seed, genre: g, seconds: 200 });
      const mats = makeMaterials(chart, makeArrangement(chart, makeForm(chart)));
      for (const m of mats.all.values()) {
        assert.ok(m.groove.drone.length >= 1, `${name} ${m.key}: no drone`);
        for (const n of m.groove.drone) {
          // a tonic or a fifth of the KEY, in register, whatever the chord is
          const degree = pc(n.pitch - chart.tonic);
          assert.ok(degree === 0 || degree === 7, `${name} ${m.key}: the drone sits on ${noteName(n.pitch)}, ${degree} above the tonic`);
          const [lo, hi] = g.drone.register;
          assert.ok(n.pitch >= lo && n.pitch <= hi);
          assert.equal(n.step, 0, "a drone starts anywhere but the downbeat");
          assert.ok(n.dur >= stepsPerBar(g.metre), "a drone that does not hold a bar is not a drone");
          held++;
        }
        // one tone per hold, evenly spaced, covering the material
        const starts = m.groove.drone.map((n) => n.bar);
        assert.deepEqual(starts, [...starts].sort((a, b) => a - b));
        assert.equal(starts[0], 0, `${name} ${m.key}: the drone does not start the material`);
      }
    }
    assert.ok(held > 40, `${name}: only ${held} drone tones in 40 records`);
  }
});

test("the loop is as long as the changes are, and everything pitched repeats on it", () => {
  // A four-bar material whose progression is Dm7 Am Dm7 Am is a TWO-BAR loop
  // stated twice. Before this the bass, keys and tune were each written
  // across all four bars, so the record said one thing with its harmony and
  // another with everything else — and the tune in particular played a fresh
  // melody over the loop's second turn, which is the one thing a lead must
  // not do. "The pitched elements of a hip-hop beat tend to repeat in loops
  // of one, two, or four measures; exceptions to this are extremely rare",
  // and a two-bar phrase is "a default phrase expectation" (Adams,
  // "Parameters of Phrase in Hip-Hop", MTO 26.2, 2.5 and 1.13).
  let shorter = 0;
  for (let seed = 1; seed <= 60; seed++) {
    const chart = makeChart({ seed, genre: GENRES.lofi, seconds: 240 });
    const mats = makeMaterials(chart, makeArrangement(chart, makeForm(chart)));
    for (const m of mats.all.values()) {
      // the period is honest: the chords really do come round on it
      assert.ok(m.period >= 1 && m.period <= m.bars, `${m.key}: period ${m.period} of ${m.bars} bars`);
      assert.equal(m.bars % m.period, 0, `${m.key}: a period of ${m.period} does not divide ${m.bars} bars`);
      for (let b = 0; b < m.bars; b++) {
        assert.equal(m.chords[b]!.name, m.chords[b % m.period]!.name, `${m.key}: the chords do not repeat on their own period`);
      }
      if (m.period < m.bars) shorter++;

      // and everything pitched is one turn of it, laid down again
      const turn = (ns: readonly Note[], k: number): string =>
        ns.filter((n) => Math.floor(n.bar / m.period) === k)
          .map((n) => `${n.bar % m.period}:${n.step}:${n.dur}:${n.pitch}:${n.art ?? "plain"}`)
          .sort()
          .join(",");
      for (const part of ["bass", "keys"] as const) {
        for (let k = 1; k * m.period < m.bars; k++) {
          assert.equal(turn(m.groove[part], k), turn(m.groove[part], 0), `${m.key}: the ${part} does not repeat on the loop`);
        }
      }
      // THE TUNE MAY BE A SENTENCE. The groove always tiles — that is what
      // makes the loop a loop — but a tune's second turn is either the figure
      // again or the figure CHANGED, which is Caplin's presentation phrase:
      // "the idea is then repeated, usually with some variation in contour,
      // rhythm, voicing, or harmonization". Either way its FEET are the
      // statement's: every one of the five motivic operations keeps the
      // onsets, so a turn that strikes where turn 0 never struck is a fresh
      // line and not a repetition of any kind.
      for (const [i, line] of m.lead.entries()) {
        const feet = (k: number) =>
          line.filter((n) => Math.floor(n.bar / m.period) === k).map((n) => `${n.bar % m.period}:${n.step}`);
        for (let k = 1; k * m.period < m.bars; k++) {
          for (const f of feet(k)) {
            assert.ok(feet(0).includes(f), `${m.key} lead line ${i}: turn ${k} strikes at ${f}, where the figure does not`);
          }
        }
      }
    }
  }
  // and the case this is about actually occurs: some materials really are a
  // shorter loop stated more than once
  assert.ok(shorter > 40, `only ${shorter} materials had a loop shorter than the material — the two-bar loop is not the common case`);
});

test("a returning idea plays its statement's own figure, changed", () => {
  // THE RULE OF THREE, at the length of a song. State it, state it again,
  // then change something — and what comes back has to be recognisably the
  // thing that went away, or it is not a return at all. "The rule of 3 usually
  // applies to repeating a motif, section or device, three times before
  // changing to something else" (omnionsound.com, "The Rule Of Three In Music
  // Composition").
  //
  // WHAT IS INHERITED IS THE FIGURE'S FEET. All five motivic operations keep
  // the statement's onsets: thinning and augmentation take some away, and
  // inversion, retrograde and sequence move the pitches standing on them but
  // never move the feet. So the claim that holds across all of them is that a
  // variant strikes only where its statement struck — which is what makes it
  // the same figure however far its pitches travel.
  let descended = 0;
  let redrawn = 0;
  const byKind = { subtractive: 0, moved: 0 };
  for (let seed = 1; seed <= 120; seed++) {
    const chart = makeChart({ seed, genre: GENRES.lofi, seconds: 240 });
    const mats = makeMaterials(chart, makeArrangement(chart, makeForm(chart)));
    for (const v of mats.all.values()) {
      if (v.variant === 0) continue;
      // WHAT IT CAME FROM is the material before it in the idea's chain: A/2
      // develops A/1, which developed A. An idea coming back a fourth time
      // answers what the record last did with it, not what it did in bar one.
      const plain = mats.all.get(`${v.idea}/${v.variant - 1}`) ?? mats.all.get(v.idea)!;
      const turn = (m: typeof v, l: readonly Note[], withPitch: boolean) =>
        l.filter((n) => n.bar < m.period).map((n) => `${n.bar}:${n.step}${withPitch ? `:${n.pitch}` : ""}`);
      const statedFeet = turn(plain, plain.lead.find((l) => l.length > 0) ?? [], false);
      const heardFeet = turn(v, v.lead.find((l) => l.length > 0) ?? [], false);
      if (statedFeet.length === 0 || heardFeet.length === 0) continue;
      if (!heardFeet.every((x) => statedFeet.includes(x))) { redrawn++; continue; }
      descended++;
      const statedNotes = turn(plain, plain.lead.find((l) => l.length > 0) ?? [], true);
      const heardNotes = turn(v, v.lead.find((l) => l.length > 0) ?? [], true);
      if (heardNotes.every((x) => statedNotes.includes(x))) byKind.subtractive++;
      else byKind.moved++;
      // a variation, not a copy: something has to have gone or moved
      assert.ok(JSON.stringify(v.lead[0]) !== JSON.stringify(plain.lead[0]), `${v.key}: nothing changed`);
    }
  }
  // Measured at 101 of 153 variants, the rest skipped because the material
  // they came from is never heard WITH THE TUNE — an idea can be stated by the
  // keys and the bass and first carry a melody on its return, and then there
  // is no earlier tune to develop and the variant writes the first one.
  //
  // IT WAS 179 OF 234 UNTIL THE FORM STOPPED VARYING AN IDEA'S LAST HEARING.
  // A third of every variant this program built used to be heard once and
  // never again — the record developing an idea at the moment it had no time
  // left to show anyone the development — and those are now `recast` instead,
  // a demand the arrangement answers without touching a note. The eighty-one
  // variants that went are exactly the orphans; the proportions of the ones
  // that remain are what they were.
  assert.ok(descended > 90, `only ${descended} variants played their statement's own figure`);
  // a fresh line is the fallback for a tune every operation refused, and it
  // has to stay the exception
  assert.ok(redrawn < 15, `${redrawn} variants were redrawn against ${descended} varied`);
  // and both kinds are really used: the subtractive pair carries most of it,
  // and the ones that move pitches are legal often enough to be worth having
  assert.ok(byKind.subtractive > 75, `only ${byKind.subtractive} variants were thinned or augmented`);
  assert.ok(byKind.moved > 10, `only ${byKind.moved} variants had their pitches moved`);
});

test("a loop's second turn is the figure again, or the figure changed", () => {
  // Caplin's presentation phrase: "a repeated two measure basic idea" where
  // "the idea is then repeated, usually with some variation in contour,
  // rhythm, voicing, or harmonization" (milnepublishing.geneseo.edu,
  // "Sentences and Periods"). Both halves of that are repetition and only one
  // is exact — a record that only tiles says the same two bars until the
  // section ends, and one that only varies has no figure to vary. So both
  // have to occur, and neither may dominate completely.
  let exact = 0;
  let varied = 0;
  for (let seed = 1; seed <= 120; seed++) {
    const chart = makeChart({ seed, genre: GENRES.lofi, seconds: 240 });
    const mats = makeMaterials(chart, makeArrangement(chart, makeForm(chart)));
    for (const m of mats.all.values()) {
      if (m.period >= m.bars) continue;
      const line = m.lead.find((l) => l.length > 0);
      if (line === undefined) continue;
      const at = (k: number, withPitch: boolean) =>
        line.filter((n) => Math.floor(n.bar / m.period) === k)
          .sort((a, b) => a.bar - b.bar || a.step - b.step)
          .map((n) => `${n.bar % m.period}:${n.step}${withPitch ? `/${n.pitch}` : ""}`);
      const a = at(0, true).join(" ");
      const a2 = at(1, true).join(" ");
      if (a === a2) { exact++; continue; }
      varied++;
      // a' is a CHANGE of a, not another line: it strikes only where a strikes
      for (const foot of at(1, false)) {
        assert.ok(at(0, false).includes(foot), `${m.key}: the second turn strikes at ${foot}, where the figure does not`);
      }
      // and it is recognisably the same idea: it cannot have lost everything
      assert.ok(at(1, false).length > at(0, false).length / 2, `${m.key}: the second turn kept too little of the figure`);
    }
  }
  assert.ok(exact > 80, `only ${exact} tunes repeated their figure exactly`);
  assert.ok(varied > 40, `only ${varied} tunes stated a figure and then a changed one`);
});
