import test from "node:test";
import assert from "node:assert/strict";
import { compose, type Song } from "../song.ts";
import { GENRES, resolveGenre } from "../genre/index.ts";
import { lofi as lofiSpec } from "../genre/lofi.ts";
import { dump, distinctBars, motionOf } from "../dump.ts";
import { ROLES } from "../genre/spec.ts";

const sweep = (n: number, seconds = 200): Song[] =>
  Array.from({ length: n }, (_, i) => compose({ seed: i + 1, genre: "lofi", seconds }));

test("the same seed performs the same record, byte for byte", () => {
  const a = dump(compose({ seed: 7, genre: "lofi" }));
  const b = dump(compose({ seed: 7, genre: "lofi" }));
  assert.equal(a, b);
});

test("events are sorted by time and every one is inside the record", () => {
  for (const s of sweep(40)) {
    const ev = s.performance.events;
    for (let i = 1; i < ev.length; i++) assert.ok(ev[i]!.tSec >= ev[i - 1]!.tSec);
    for (const e of ev) {
      assert.ok(e.tSec > -0.1, `an event at ${e.tSec}s`);
      assert.ok(e.tSec < s.performance.seconds);
      assert.ok(e.durSec > 0);
      assert.ok(e.gain > 0 && e.gain <= 1.25, `gain ${e.gain}`);
      assert.ok(e.bar >= 0 && e.bar < s.form.bars);
    }
  }
});

test("every heard note of every section is played, and nothing else", () => {
  for (const s of sweep(30)) {
    let expected = 0;
    const played = new Map<string, number>();
    for (const p of s.arrangement.placed) {
      const m = s.materials.all.get(p.material)!;
      // WHO PLAYS CHANGES EVERY TWO TURNS of the loop, so the count is
      // counted span by span exactly as the performance indexes them. The
      // law is unchanged — nothing sounds that the arrangement did not ask
      // for, and everything it asked for sounds — only the unit it is asked
      // in got shorter than a section.
      const loop = Math.max(1, m.period);
      for (let bar = p.section.startBar; bar < p.section.endBar; bar++) {
        const mbar = (bar - p.section.startBar) % m.bars;
        const round = Math.floor((bar - p.section.startBar) / m.bars);
        const span = p.spans[Math.min(p.spans.length - 1, Math.floor((bar - p.section.startBar) / (2 * loop)))]!;
        for (const role of span.heard) {
          const nth = (played.get(`${p.material} ${role}`) ?? 0) + round;
          if (role === "drums") {
            expected += m.drums[nth]!.filter((h) => h.bar === mbar && !(span.thin && (h.lane === "hat" || h.lane === "openhat"))).length;
          } else {
            const notes = role === "lead" ? m.lead[nth]! : m.groove[role];
            expected += notes.filter((n) => n.bar === mbar).length;
          }
        }
      }
      for (const role of p.heard) {
        played.set(`${p.material} ${role}`, (played.get(`${p.material} ${role}`) ?? 0) + Math.ceil(p.section.bars / m.bars));
      }
    }
    assert.equal(s.performance.events.length, expected);
  }
});

test("a material heard again does not start its tune over: the count runs across the record", () => {
  // three eight-bar choruses over a four-bar material are six times round,
  // and a plan of four letters is read straight through them — so the
  // lead's lines across those sections are the plan, not its first two
  // letters three times
  let checked = 0;
  for (const s of sweep(80)) {
    const byKey = new Map<string, string[]>();
    for (const p of s.arrangement.placed) {
      if (!p.heard.has("lead")) continue;
      const m = s.materials.all.get(p.material)!;
      const list = byKey.get(p.material) ?? [];
      for (let bar = p.section.startBar; bar < p.section.endBar; bar += m.bars) {
        // durSec is part of the signature, not decoration. Augmentation is a
        // DURATIONAL operation — "increasing the duration of the notes in the
        // motive" — so a development that holds the same pitches longer is a
        // different line, and a signature of pitch and step alone cannot see
        // the difference it exists to make.
        list.push(s.performance.events.filter((e) => e.role === "lead" && e.bar >= bar && e.bar < bar + m.bars).map((e) => `${e.bar - bar}:${e.step}:${e.pitch}:${e.durSec.toFixed(4)}`).join());
      }
      byKey.set(p.material, list);
    }
    for (const [key, rounds] of byKey) {
      const m = s.materials.all.get(key)!;
      assert.equal(rounds.length, m.lead.length);
      if (rounds.length < 4) continue;
      checked++;
      // whatever the plan, its four letters hold at most three distinct
      // lines and the material was written with exactly those
      assert.ok(new Set(rounds).size <= 3);
      assert.ok(new Set(rounds).size >= 2, `${key} on seed ${s.chart.seed}: ${rounds.length} times round, all the same`);
    }
  }
  assert.ok(checked > 40);
});

test("a thin section has no hat and keeps its kick", () => {
  let thinBars = 0;
  for (const s of sweep(60)) {
    for (const p of s.arrangement.placed) {
      if (!p.thin) continue;
      for (let bar = p.section.startBar; bar < p.section.endBar; bar++) {
        thinBars++;
        const here = s.performance.events.filter((e) => e.bar === bar && e.role === "drums");
        assert.ok(!here.some((e) => e.lane === "hat" || e.lane === "openhat"), `hat in a thin bar ${bar}`);
        if (p.heard.has("drums")) assert.ok(here.some((e) => e.lane === "kick" && e.step === 0), `no kick in thin bar ${bar}`);
      }
    }
  }
  assert.ok(thinBars > 20);
});

test("swing moves the second note of each pair late and leaves the first alone", () => {
  const F = GENRES.lofi.feel;
  const perBeat = GENRES.lofi.metre.perBeat;
  const pair = F.swingGrid === 16 ? perBeat / 2 : perBeat;
  let second = 0;
  let first = 0;
  for (const s of sweep(20)) {
    for (const e of s.performance.events) {
      const drift = e.playedStep - e.step;
      if (e.step % pair === pair / 2) {
        second++;
        // the swing, less at most the jitter, which is small next to it
        assert.ok(drift > 0.1, `a swung note at step ${e.step} landed ${drift} early or on time`);
      } else if (e.step % pair === 0) {
        first++;
        assert.ok(Math.abs(drift) < 0.5, `a pair's first note drifted ${drift} steps`);
      }
    }
  }
  assert.ok(second > 100 && first > 100);
});

test("swing is the drum machine's number: 66.7 is a triplet, 50 is straight", () => {
  const triplet = resolveGenre("t", { t: { label: "T", feel: { swing: 66.7, swingGrid: 8, jitterMs: 0 } } });
  const s = compose({ seed: 3, genre: triplet, seconds: 120 });
  const perBeat = triplet.metre.perBeat;
  const offEighths = s.performance.events.filter((e) => e.step % perBeat === perBeat / 2);
  assert.ok(offEighths.length > 20);
  for (const e of offEighths) {
    // two thirds of the way through the beat: a sixth of a beat late
    assert.ok(Math.abs(e.playedStep - e.step - perBeat / 6) < 0.01, `${e.playedStep - e.step}`);
  }
});

test("a straight genre does not swing", () => {
  const straight = resolveGenre("straight", { straight: { label: "S", feel: { swing: 50, jitterMs: 0 } } });
  const s = compose({ seed: 3, genre: straight, seconds: 120 });
  for (const e of s.performance.events) assert.equal(e.playedStep, e.step);
});

test("jitter is bounded by the genre's number, around where the part leans", () => {
  // The jitter is a hand MISSING; the lean is where the hand was aiming. So
  // what is bounded is the distance from the lean, not from the grid — a part
  // that sits eighteen milliseconds back is not eighteen milliseconds of
  // jitter, and measuring it as if it were is measuring the feel as error.
  for (const s of sweep(20)) {
    const F = s.chart.genre.feel;
    const limit = F.jitterMs / 1000;
    const perBeat = s.chart.metre.perBeat;
    const pair = F.swingGrid === 16 ? perBeat / 2 : perBeat;
    for (const e of s.performance.events) {
      if (e.step % pair === pair / 2) continue; // swung as well
      const lean = (F.lean[e.lane as keyof typeof F.lean] ?? F.lean[e.role] ?? 0) / 1000;
      const drift = (e.playedStep - e.step) * s.form.clock.stepSec(e.bar) - lean;
      assert.ok(Math.abs(drift) <= limit + 1e-9, `${e.role}/${e.lane} missed by ${drift}s, over ${limit}s`);
    }
  }
});

test("a part sits where its genre leans it, and the parts are not all together", () => {
  // A feel is a RELATIONSHIP between parts: "one plays ever so slightly ahead
  // of the other ... and the push and pull between them purportedly produces
  // the effect of swing" (Keil, "Participatory Discrepancies and the Power of
  // Music", 1987). Symmetric jitter cannot make one, because it makes every
  // part equally and randomly late; this measures that the parts now sit in
  // different places on purpose.
  const s = compose({ seed: 5, genre: "lofi", seconds: 200 });
  const F = s.chart.genre.feel;
  const perBeat = s.chart.metre.perBeat;
  const pair = F.swingGrid === 16 ? perBeat / 2 : perBeat;
  const mean = new Map<string, number[]>();
  for (const e of s.performance.events) {
    if (e.step % pair === pair / 2) continue;
    const key = e.role === "drums" ? e.lane : e.role;
    const ms = (e.playedStep - e.step) * s.form.clock.stepSec(e.bar) * 1000;
    (mean.get(key) ?? mean.set(key, []).get(key)!).push(ms);
  }
  const avg = (xs: number[]): number => xs.reduce((a, b) => a + b, 0) / xs.length;
  const where = new Map([...mean].map(([k, v]) => [k, avg(v)]));

  // each part lands where the genre put it, the hand's misses averaging out —
  // over enough of them to average. An open hat turns up a handful of times
  // in a record, and a handful of draws from a fifteen-millisecond jitter has
  // a mean of its own.
  for (const [key, at] of where) {
    if ((mean.get(key)?.length ?? 0) < 40) continue;
    const meant = F.lean[key as keyof typeof F.lean] ?? 0;
    assert.ok(Math.abs(at - meant) < 4, `${key} sits at ${at.toFixed(1)} ms, meant to be at ${meant}`);
  }
  // and the snare drags against a kick that does not, which is the whole of
  // what a laid-back kit is
  assert.ok(where.get("snare")! > where.get("kick")! + 10, `the snare sits ${(where.get("snare")! - where.get("kick")!).toFixed(1)} ms behind the kick`);
  // the parts are genuinely in different places, not one offset applied to all
  assert.ok(Math.max(...where.values()) - Math.min(...where.values()) > 10, "every part sits in the same place");
});

test("the metre shapes the weight, and a genre says how much", () => {
  // the defect this is against: every part wrote one weight for the downbeat
  // and one for everywhere else, so every bar of a groove weighed the same
  // as every other and the record was a machine.
  // The kit is held still in two ways, because two other things move a note's
  // weight and this test is about neither. A manner — a ghost, an accent —
  // scales it, so only the plain one is offered. And a hat ADDED as a bar's
  // change is written lighter than a hat of the figure, deliberately, so the
  // phrase is four plain bars and every hat in a bar is the figure's own.
  const still = { art: [["plain", 1]], phrase: [[["A", "A", "A", "A"], 1]] } as const;
  // and the phrase is held flat, for the same reason: a crescendo across a
  // phrase moves weight by where a note falls in the MATERIAL, which is a
  // third source and not this one
  const flat = resolveGenre("flat", { flat: { label: "F", feel: { accent: 0, velocityJitter: 0, jitterMs: 0, phrase: 0 }, drums: still } });
  const leaning = resolveGenre("lean", { lean: { label: "L", feel: { accent: 0.6, velocityJitter: 0, jitterMs: 0, phrase: 0 }, drums: still } });
  // WITHIN ONE BAR. The arc moves every note's weight as the record rises and
  // falls, so two bars of the same lane weigh differently for a reason that
  // has nothing to do with the metre — comparing across bars measures the arc
  // and the accent together and calls the sum the accent.
  const hatsByBar = (g: typeof flat): Map<number, [number, number][]> => {
    const s = compose({ seed: 5, genre: g, seconds: 120 });
    const out = new Map<number, [number, number][]>();
    for (const e of s.performance.events) {
      if (e.role !== "drums" || e.lane !== "hat") continue;
      (out.get(e.bar) ?? out.set(e.bar, []).get(e.bar)!).push([e.step, e.gain]);
    }
    return out;
  };
  // with no accent, one lane's notes all weigh the same wherever they fall
  let checked = 0;
  for (const [bar, hats] of hatsByBar(flat)) {
    if (hats.length < 4) continue;
    checked++;
    for (const [, g] of hats) assert.ok(Math.abs(g - hats[0]![1]) < 1e-9, `a flat genre still accents, in bar ${bar}`);
  }
  assert.ok(checked > 3, `only ${checked} bars had hats to compare`);

  // with accent, a lane's downbeat outweighs its offbeats
  const perBeat = leaning.metre.perBeat;
  const on: number[] = [];
  const off: number[] = [];
  for (const hats of hatsByBar(leaning).values()) {
    for (const [step, g] of hats) (step % perBeat === 0 ? on : off).push(g);
  }
  assert.ok(on.length > 0 && off.length > 0);
  const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
  assert.ok(mean(on) > mean(off) * 1.2, `on the beat ${mean(on).toFixed(3)} against off it ${mean(off).toFixed(3)}`);
});

test("a hand misses the weight it meant, by the genre's amount, and a chord is one stroke", () => {
  for (const s of sweep(20)) {
    // every note of one chord is struck together, so they share the miss
    const chords = new Map<string, Set<number>>();
    for (const e of s.performance.events) {
      if (e.role !== "keys") continue;
      const at = `${e.bar}:${e.step}`;
      (chords.get(at) ?? chords.set(at, new Set()).get(at)!).add(Math.round(e.gain * 1e6));
    }
    for (const [at, gains] of chords) {
      if (gains.size > 1) assert.fail(`seed ${s.chart.seed} bar ${at}: one chord struck at ${gains.size} weights`);
    }
    assert.ok(chords.size > 4);
    // and the same chord in different bars does not weigh the same every time
    const spread = new Set([...chords.values()].map((g) => [...g][0]));
    assert.ok(spread.size > 1, `seed ${s.chart.seed}: every chord of the record weighs the same`);
  }
});

test("the arc makes the peak louder than the intro, like for like", () => {
  // like for like: a thin intro has no hats, and hats are the quiet drums, so
  // its MEAN drum gain is higher for having lost them. The arc is read off the
  // downbeat kick, which every bar has, and off the pitched parts whole.
  //
  // AND AT THE SAME PLACE IN THE LOOP, WITH THE HAND HELD STILL. Two other
  // things move a note's weight and neither is the arc: a phrase rises to its
  // height and falls away, a swing bigger than the arc's, so both sides are
  // read at the loop's first bar; the hand misses what it meant by up to
  // seven percent either way, which on an intro of one bar is the whole
  // measurement; and a MANNER scales it hardest of all, an accented kick
  // weighing a quarter more than a plain one. The genre here is lofi with the
  // miss set to nothing and every part played plain, so what is left is the
  // arc.
  const plain = { art: [["plain", 1]] } as const;
  const steady = resolveGenre("steady", {
    lofi: lofiSpec,
    steady: {
      extend: "lofi", label: "S", feel: { velocityJitter: 0 },
      drums: plain, bass: plain, keys: plain, lead: plain, drone: plain,
    },
  });
  let cases = 0;
  for (let seed = 1; seed <= 60; seed++) {
    const s = compose({ seed, genre: steady, seconds: 200 });
    const intro = s.arrangement.placed.find((p) => p.section.fn === "intro");
    const peak = s.arrangement.placed[s.form.peakAt]!;
    if (!intro) continue;
    const inside = (p: typeof peak) => {
      const m = s.materials.all.get(p.material)!;
      return (e: { bar: number }): boolean =>
        e.bar >= p.section.startBar && e.bar < p.section.endBar && (e.bar - p.section.startBar) % m.period === 0;
    };
    // AND WITH THE PART NOT HELD BACK ON EITHER SIDE. `span.hush` is the
    // two-loop rule's expression move on a part rather than on the drums'
    // hat, and it takes off exactly what the arc takes off at its quietest —
    // so a peak that holds its keys back reads quieter than an intro that
    // does not, for a reason that is not the arc. Same as the hats above:
    // this is a law about the ARC, so the comparison is made where nothing
    // else is moving the weight.
    const everHushed = (p: typeof peak, role: string): boolean => p.spans.some((sp) => sp.hush === role);
    const mean = (es: readonly { gain: number }[]) => (es.length ? es.reduce((a, e) => a + e.gain, 0) / es.length : null);
    const kick = (p: typeof peak) => mean(s.performance.events.filter((e) => inside(p)(e) && e.lane === "kick" && e.step === 0));
    const part = (p: typeof peak, role: string) => mean(s.performance.events.filter((e) => inside(p)(e) && e.role === role));
    const pairs: [number | null, number | null, string][] = [];
    if (!everHushed(intro, "drums") && !everHushed(peak, "drums")) pairs.push([kick(intro), kick(peak), "kick"]);
    for (const role of ROLES) {
      if (role === "drums" || everHushed(intro, role) || everHushed(peak, role)) continue;
      pairs.push([part(intro, role), part(peak, role), role]);
    }
    for (const [gi, gp, what] of pairs) {
      if (gi === null || gp === null) continue;
      cases++;
      assert.ok(gp > gi, `${what}: peak ${gp} is not louder than intro ${gi}`);
    }
  }
  assert.ok(cases > 20);
});

test("the section before the climax builds into it", () => {
  // The arc is "exposition, rising action, climax, falling action, dénouement"
  // (Ableton, "Dramatic Arc"). This program had the climax — the form declares
  // a peak and the peak is the one section with everybody — and it has the
  // dénouement, since the ending gives back what the record opened with.
  // RISING ACTION was the stage nothing represented: `form.arc` interpolates
  // between section centres, so the section before the peak was a flat step on
  // the way up rather than a section that goes anywhere.
  let built = 0;
  for (const g of ["lofi", "dungeonsynth"] as const) {
    for (let seed = 1; seed <= 40; seed++) {
      const s = compose({ seed, genre: g });
      const sw = s.arrangement.placed.find((p) => p.swell);
      if (sw === undefined) continue;
      // it is the run-up and nothing else: one per record, never the break,
      // and always immediately before the section the form called the peak
      assert.equal(s.arrangement.placed.filter((p) => p.swell).length, 1, "more than one section builds");
      assert.equal(sw.section.index, s.form.peakAt - 1, "the section that builds is not the one before the peak");
      assert.equal(sw.broken, false, "the break builds, and a breakdown that swells is not a breakdown");
      const q = Math.max(1, Math.floor(sw.section.bars / 4));
      const mean = (a: number, b: number) => {
        const es = s.performance.events.filter((e) => e.bar >= a && e.bar < b);
        return es.length ? es.reduce((x, e) => x + e.gain, 0) / es.length : null;
      };
      const first = mean(sw.section.startBar, sw.section.startBar + q);
      const last = mean(sw.section.endBar - q, sw.section.endBar);
      if (first === null || last === null) continue;
      assert.ok(last > first, `${g} seed ${seed}: the run-up ends at ${last.toFixed(3)}, no louder than the ${first.toFixed(3)} it started at`);
      built++;
    }
  }
  assert.ok(built > 30, `only ${built} records had a section that builds`);
});

test("a part held back is quieter, and is still there", () => {
  // `span.hush` is the two-loop rule's fourth way — "reduce expression of an
  // existing instrument" — on a part rather than on the drums' hat, which is
  // all this stage could do before. Two things have to hold. It is a GAIN and
  // nothing else, so the part is still playing every note it would have
  // played: a hush that dropped notes would be a density move wearing an
  // expression move's name, and the material stage builds for what the
  // arrangement said is heard. And it is quieter, by the arc's own quietest.
  let compared = 0;
  for (const g of ["lofi", "dungeonsynth"] as const) {
    for (let seed = 1; seed <= 60; seed++) {
      const s = compose({ seed, genre: g });
      for (const p of s.arrangement.placed) {
        // NOT A SECTION THAT BUILDS. `placed.swell` climbs a note's weight
        // across the section, so two notes at the same place in the loop but
        // different rounds already differ for a reason that is not the hush.
        // Same rule as everywhere else here: a law about one thing is measured
        // where nothing else is moving.
        if (p.swell) continue;
        const m = s.materials.all.get(p.material)!;
        const turn = 2 * Math.max(1, m.period);
        const spanAt = (bar: number) =>
          p.spans[Math.min(p.spans.length - 1, Math.floor((bar - p.section.startBar) / turn))]!;
        // THE GROOVE ONLY, for the reason the repetition law gives: the drums
        // and the tune are written per time ROUND — `nth(m.drums, …, round)`
        // — so the same bar and step in two rounds is a different hit with a
        // weight of its own, and comparing them would measure the material
        // rather than the hush. The parts that loop are the ones that can be
        // held to playing the same thing twice.
        for (const role of ["bass", "keys", "drone"] as const) {
          const byMbar = new Map<number, { hushed: number[]; open: number[] }>();
          for (const e of s.performance.events) {
            if (e.role !== role || e.bar < p.section.startBar || e.bar >= p.section.endBar) continue;
            const sp = spanAt(e.bar);
            if (!sp.heard.has(role)) continue;
            const key = ((e.bar - p.section.startBar) % m.bars) * 1000 + e.step;
            const slot = byMbar.get(key) ?? { hushed: [], open: [] };
            (sp.hush === role ? slot.hushed : slot.open).push(e.gain);
            byMbar.set(key, slot);
          }
          for (const { hushed, open } of byMbar.values()) {
            if (hushed.length === 0 || open.length === 0) continue;
            const mean = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
            assert.ok(mean(hushed) < mean(open), `${g} seed ${seed}: the ${role} held back is not quieter`);
            compared++;
          }
        }
      }
    }
  }
  assert.ok(compared > 50, `only ${compared} held-back notes were compared`);
});

test("the tune does not repeat itself at the loop seam", () => {
  // within a section the material comes round, and the round's last note
  // followed by the next round's first is the seam the rule is about. Across
  // a SECTION boundary, or after a round of rest, a line may open on the
  // pitch the last one closed on — that is a pivot, not a line hammering one
  // note — so those pairs are not judged.
  // And a reciting tone is exempt, because the repeated pitch is what it is
  // made of: see the contour rules in the lead builder.
  //
  // A ROUND BOUNDARY is exempt for the same reason a section boundary is. The
  // tune is written for one turn of the loop and played on every turn, and
  // each time the material comes round the plan may put a different LINE
  // there — so the note before a round and the note after it belong to two
  // different lines, and one opening on the pitch the other closed on is the
  // same pivot the comment above describes.
  for (const s of sweep(60)) {
    const boundaries = new Set(s.form.sections.map((x) => x.startBar));
    const chanting = new Set<number>();
    for (const p of s.arrangement.placed) {
      if (s.materials.all.get(p.material)!.contour !== "chant") continue;
      for (let b = p.section.startBar; b < p.section.endBar; b++) chanting.add(b);
    }
    const rounds = new Set<number>();
    for (const p of s.arrangement.placed) {
      const m = s.materials.all.get(p.material)!;
      for (let b = p.section.startBar; b < p.section.endBar; b += m.bars) rounds.add(b);
    }
    const lead = s.performance.events.filter((e) => e.role === "lead");
    for (let i = 1; i < lead.length; i++) {
      const crosses = lead[i]!.bar !== lead[i - 1]!.bar && (boundaries.has(lead[i]!.bar) || rounds.has(lead[i]!.bar));
      const rested = lead[i]!.bar - lead[i - 1]!.bar > 1;
      if (crosses || rested || chanting.has(lead[i]!.bar)) continue;
      assert.notEqual(lead[i]!.pitch, lead[i - 1]!.pitch, `seed ${s.chart.seed} bar ${lead[i]!.bar}: the lead repeats a pitch`);
    }
  }
});

test("a long section repeats its drum figure, and still moves", () => {
  // Two-sided, and the upper bound is the one that was wrong. This test used
  // to demand that MOST bars of a long section differ from most others, and
  // that demand was the sameness: a beat that never repeats a bar is a beat
  // with no figure in it, and an ear has nothing to hold. Huron and Ollen
  // (2004), over five continents and five centuries, put the share of musical
  // passages literally repeated at some later point at about 94% (Margulis,
  // "On Repeat", reviewed at mtosmt.org/issues/mto.14.20.4).
  //
  // Both bounds are [chosen] and both stand on a claim rather than on any
  // particular record: above the ceiling there is no figure to repeat, below
  // the floor there is nothing for the fill at the end of a phrase to be a
  // departure from. The floor is the one this test was written for and it
  // stays.
  let ratio = 0;
  let sections = 0;
  for (const s of sweep(60)) {
    for (const p of s.arrangement.placed) {
      const m = s.materials.all.get(p.material)!;
      if (p.section.bars < m.bars * 3 || !p.heard.has("drums") || p.thin) continue;
      const bars = new Set<string>();
      for (let bar = p.section.startBar; bar < p.section.endBar; bar++) {
        bars.add(s.performance.events.filter((e) => e.bar === bar && e.role === "drums").map((e) => `${e.step}${e.lane}`).sort().join());
      }
      // TWO, not three. The failure this floor was written for is a section
      // that is ONE bar over and over; three identical bars and a fill is two
      // distinct bars and is the documented shape — "repeat your pattern for
      // several bars, and at the end of a four-bar sequence ... change things
      // for one last bar" (thedrumninja.com). Demanding three made the beat
      // change oftener than the practice it is meant to follow.
      assert.ok(bars.size >= 2, `seed ${s.chart.seed} ${p.section.fn}: ${p.section.bars} bars of drums are only ${bars.size} distinct`);
      ratio += bars.size / p.section.bars;
      sections++;
    }
  }
  assert.ok(sections > 20);
  const pc = (100 * ratio) / sections;
  assert.ok(pc > 10, `long sections average ${pc.toFixed(0)}% distinct drum bars — a loop, not a figure`);
  assert.ok(pc < 60, `long sections average ${pc.toFixed(0)}% distinct drum bars — no figure to repeat`);
});

test("a long section states its tune, and states it again", () => {
  // Two-sided, and the floor was the wrong shape. This demanded that a long
  // section hear MOSTLY distinct lead bars, which is the opposite of what a
  // hook is: a tune written for one turn of the loop and played on every turn
  // is meant to come back, and "many modern hip hop tracks have one or two
  // bar looping melody that serves as a hook" (iconcollective.edu/how-to-
  // make-a-hip-hop-beat).
  //
  // Both bounds are [chosen], and wide, because a lead is the least
  // repetitive part a record has and how much it repeats is a genre's own
  // business. What the ceiling rules out is a tune that never says anything
  // twice; what the floor rules out is one bar looped with no development at
  // all. Neither is a target to sit near.
  let ratio = 0;
  let sections = 0;
  for (const s of sweep(60)) {
    for (const p of s.arrangement.placed) {
      const m = s.materials.all.get(p.material)!;
      if (p.section.bars < m.bars * 4 || !p.heard.has("lead")) continue;
      const bars = new Set<string>();
      let played = 0;
      for (let bar = p.section.startBar; bar < p.section.endBar; bar++) {
        const here = s.performance.events.filter((e) => e.bar === bar && e.role === "lead");
        if (here.length === 0) continue;
        played++;
        bars.add(here.map((e) => `${e.step}:${e.pitch}`).sort().join());
      }
      ratio += bars.size / played;
      sections++;
    }
  }
  assert.ok(sections > 20);
  const pc = (100 * ratio) / sections;
  assert.ok(pc > 15, `long sections average ${pc.toFixed(0)}% distinct lead bars — a loop with no tune in it`);
  assert.ok(pc < 85, `long sections average ${pc.toFixed(0)}% distinct lead bars — no hook, just melody`);
});

test("the dump follows the format and counts itself correctly", () => {
  const s = compose({ seed: 11, genre: "lofi", seconds: 180 });
  const text = dump(s);
  const lines = text.trimEnd().split("\n");
  assert.equal(lines[0], "#format\tdeckard-events\t1");
  assert.ok(lines.some((l) => l.startsWith("#program\tDeckard's Orchestrator MKIII")));
  const header = lines.findIndex((l) => l.startsWith("tSec\t"));
  assert.ok(header > 0);
  assert.equal(lines[header], "tSec\tbar\tstep\trole\tlane\tvoice\tpitch\tnote\tdurSec\tgain\tflags");
  const events = lines.length - header - 1;
  const declared = Number(lines.find((l) => l.startsWith("#events\t"))!.split("\t")[1]);
  assert.equal(events, declared);
  assert.equal(events, s.performance.events.length);
  for (const r of ROLES) {
    const roleLine = lines.find((l) => l.startsWith(`#role\t${r}\t`));
    assert.ok(roleLine, `no #role line for ${r}`);
    assert.equal(Number(roleLine.split("\t")[2]), s.performance.events.filter((e) => e.role === r).length);
  }
  assert.equal(lines.filter((l) => l.startsWith("#section\t")).length, s.form.sections.length);
  // the voice column names the instrument, not the lane again
  for (const r of ROLES) {
    if (r === "drums") continue;
    const want = s.chart.genre.sound.voices[r];
    assert.ok(lines.some((l) => l === `#voice\t${r}\t${want}`), `no #voice line for ${r}`);
    const row = lines.find((l) => l.split("\t")[3] === r);
    assert.equal(row?.split("\t")[5], want, `${r} is played by ${row?.split("\t")[5]}`);
  }
  const drum = lines.find((l) => l.split("\t")[3] === "drums");
  assert.equal(drum?.split("\t")[5], drum?.split("\t")[4], "a drum is played by itself");
});

test("the dump's own measures agree with the events", () => {
  const s = compose({ seed: 5, genre: "lofi", seconds: 200 });
  const ev = s.performance.events;
  const m = motionOf(ev, "lead");
  assert.equal(m.leap + m.step + m.same, m.n - 1);
  const d = distinctBars(ev, "drums");
  assert.ok(d.distinct >= 1 && d.distinct <= d.bars);
  assert.equal(d.bars, new Set(ev.filter((e) => e.role === "drums").map((e) => e.bar)).size);
});

test("no part is silent for a whole record", () => {
  for (const s of sweep(60)) {
    for (const r of ROLES) {
      assert.ok(s.performance.events.some((e) => e.role === r), `${r} never sounds on seed ${s.chart.seed}`);
    }
  }
});

test("a figure played again is played the same way, note for note", () => {
  // THE POINT OF THE WHOLE ARRANGEMENT. Huron and Ollen (2004) put the share
  // of musical passages literally repeated at some later point at about 94%,
  // across five continents and five centuries (Margulis, "On Repeat",
  // reviewed at mtosmt.org/issues/mto.14.20.4). This program used to repeat
  // nothing: the hand that misses the grid was addressed by the bar of the
  // RECORD, so the same bar of the same loop was missed by a different amount
  // every time round and no figure ever came back exactly. Which reads as
  // variety written down, and as mush.
  let compared = 0;
  for (const s of sweep(40)) {
    // every bar of the record, as what was played and how
    const bars = new Map<number, string>();
    for (const e of s.performance.events) {
      const line = `${e.role}:${e.lane}:${e.step}:${e.pitch ?? "."}:${e.art}:${e.playedStep.toFixed(6)}`;
      bars.set(e.bar, (bars.get(e.bar) ?? "") + line + "\n");
    }
    for (const p of s.arrangement.placed) {
      const m = s.materials.all.get(p.material)!;
      if (p.section.bars < m.bars * 2) continue;
      // the same position in the loop, two turns running: the parts that the
      // material says loop — the groove — must be identical, to the note and
      // to the microsecond. What may differ between rounds is what the
      // MATERIAL says differs, so the comparison is of the groove alone.
      // ONLY THE PARTS THAT PLAY IN BOTH. The two loop rule takes an
      // instrument out every second turn, so one of a pair of bars can be
      // missing a part the other has. That is the ARRANGEMENT's business and
      // this law is the HAND's: a figure played again is played the same way.
      // Whether it is played at all is decided a stage earlier.
      const rolesIn = (bar: number): Set<string> =>
        new Set((bars.get(bar) ?? "").split("\n").filter((l) => l).map((l) => l.split(":")[0]!));
      const groove = (bar: number, only: ReadonlySet<string>): string =>
        (bars.get(bar) ?? "").split("\n")
          .filter((l) => /^(bass|keys|drone):/.test(l) && only.has(l.split(":")[0]!))
          .sort().join("\n");
      for (let bar = p.section.startBar; bar + m.bars < p.section.endBar; bar++) {
        const both = rolesIn(bar);
        for (const r of [...both]) if (!rolesIn(bar + m.bars).has(r)) both.delete(r);
        const here = groove(bar, both);
        if (here === "") continue;
        assert.equal(
          here,
          groove(bar + m.bars, both),
          `seed ${s.chart.seed} ${p.section.fn}: bar ${bar} and bar ${bar + m.bars} are the same bar of the same loop, played differently`,
        );
        compared++;
      }
    }
  }
  assert.ok(compared > 200, `only ${compared} pairs of bars were compared`);
});

test("a phrase rises to its height and falls away, and the same phrase does it again", () => {
  // "A classic arched contour is shaped as a dynamic rise to a peak pitch and
  // descent quieter with falling pitches" (doublebasshq.com, "Phrasing Part
  // 3"). Every other thing that moves a note's weight here works at another
  // grain — the metre inside a bar, the arc across the record — and between
  // them a phrase used to be flat however long it ran.
  //
  // Everything else is held still, so what is left is the shape: no metre
  // accent, no hand, no manner, one drum treatment of four plain bars.
  // Every kind of section is given the same energy, so the record's ARC —
  // a real and separate shape at a coarser grain — is as near flat as a form
  // allows, and what is left is the phrase.
  const level = 0.5;
  const g = resolveGenre("shaped", {
    shaped: {
      label: "S",
      feel: { accent: 0, velocityJitter: 0, jitterMs: 0, swing: 50, phrase: 0.4 },
      drums: { art: [["plain", 1]], phrase: [[["A", "A", "A", "A"], 1]], treatments: 1 },
      form: { energy: { intro: level, verse: level, chorus: level, bridge: level, instrumental: level, outro: level } },
    },
  });
  const s = compose({ seed: 5, genre: g, seconds: 200 });
  const m = s.materials.all.values().next().value!;
  const placed = s.arrangement.placed.find((p) => p.material === m.key && p.heard.has("drums"))!;
  // the downbeat kick of each bar of the material, which is written once and
  // struck identically in every bar: whatever differs is the shape
  const kick = (bar: number): number | undefined =>
    s.performance.events.find((e) => e.bar === bar && e.role === "drums" && e.lane === "kick" && e.step === 0)?.gain;

  const first = placed.section.startBar;
  const shape: number[] = [];
  for (let i = 0; i < m.bars; i++) shape.push(kick(first + i) ?? NaN);
  assert.ok(shape.every(Number.isFinite), `the material has no downbeat kick in every bar: ${shape}`);
  assert.ok(m.bars >= 3, "the material is too short to have a shape");

  // it rises off its first bar and it is quieter by the last
  const peak = Math.max(...shape);
  assert.ok(peak > shape[0]!, `the phrase does not rise: ${shape.map((x) => x.toFixed(3)).join(" ")}`);
  assert.ok(shape[shape.length - 1]! < peak, `the phrase does not fall away: ${shape.map((x) => x.toFixed(3)).join(" ")}`);

  // AND IT IS THE SAME SHAPE NEXT TIME ROUND. Taken from the bar of the
  // RECORD instead of the position in the material, this would be one more
  // source of per-bar noise, which is the thing it is meant to replace.
  //
  // Within a fraction of a percent rather than exactly, and the residue is
  // named: even with every section at one energy the form lifts each
  // statement a little, so that the LAST statement of the biggest section is
  // the peak. That is meant to. What this rules out is the failure it would
  // otherwise hide — a shape keyed on the bar of the record, which would put
  // unrelated values here.
  if (placed.section.bars >= m.bars * 2) {
    for (let i = 0; i < m.bars; i++) {
      const again = kick(first + m.bars + i)!;
      assert.ok(
        Math.abs(again / shape[i]! - 1) < 0.005,
        `the phrase was shaped differently the second time round, at bar ${i}: ${shape[i]} then ${again}`,
      );
    }
  }
});
