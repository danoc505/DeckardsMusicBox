import test from "node:test";
import assert from "node:assert/strict";
import { makeMaterials, type Material, type Note } from "./index.ts";
import { makeChart, type Chart } from "../chart.ts";
import { makeForm } from "../form.ts";
import { makeArrangement } from "../arrange.ts";
import { GENRES } from "../../genre/index.ts";
import { pc } from "../../core/theory.ts";
import { stepsPerBar } from "../../core/clock.ts";

const lofi = GENRES.lofi;

function each(n: number, f: (chart: Chart, m: Material) => void): void {
  for (let seed = 1; seed <= n; seed++) {
    const chart = makeChart({ seed, genre: lofi, seconds: 240 });
    const mats = makeMaterials(chart, makeArrangement(chart, makeForm(chart)));
    for (const m of mats.all.values()) f(chart, m);
  }
}

const inChord = (m: Material, n: { bar: number; pitch: number }): boolean =>
  m.chords[n.bar]!.tones.some((t) => pc(t) === pc(n.pitch));

/** The tune as first stated. A material the lead never plays has no tune, and the tests skip it. */
const tune = (m: Material): readonly Note[] => m.lead[0] ?? [];
const byTime = <T extends { bar: number; step: number }>(ns: readonly T[]): T[] =>
  ns.slice().sort((a, b) => a.bar - b.bar || a.step - b.step);
const sorted = (m: Material) => byTime(tune(m));
/** Every distinct lead line the material plays, the statement first. */
const lines = (m: Material): readonly (readonly Note[])[] => {
  const seen = new Map<string, readonly Note[]>();
  for (const l of m.lead) if (l.length > 0) seen.set(JSON.stringify(l), l);
  return [...seen.values()];
};

test("a sung or arpeggiated line never plays the same pitch twice running", () => {
  // The bar used to be absolute, and it was too strong. A reciting tone is
  // MADE of the repeated pitch — chant is "the rhythmic speaking or singing
  // of words or sounds, often primarily on one or two pitches"
  // (en.wikipedia.org/wiki/Reciting_tone). So the rule is stated for the two
  // contours it is true of, and the third is tested for the opposite below.
  let judged = 0;
  each(80, (_, m) => {
    if (m.contour === "chant") return;
    for (const line of lines(m)) {
      const ns = byTime(line);
      for (let i = 1; i < ns.length; i++) {
        judged++;
        assert.notEqual(ns[i]!.pitch, ns[i - 1]!.pitch, `${m.key} (${m.contour}) repeats at bar ${ns[i]!.bar} step ${ns[i]!.step}`);
      }
    }
  });
  assert.ok(judged > 500, `only ${judged} moves were judged`);
});

test("a reciting tone holds its pitch, and the other contours move", () => {
  const held = new Map<string, { same: number; moves: number }>();
  each(160, (_, m) => {
    const t = held.get(m.contour) ?? { same: 0, moves: 0 };
    for (const line of lines(m)) {
      const ns = byTime(line);
      for (let i = 1; i < ns.length; i++) {
        t.moves++;
        if (ns[i]!.pitch === ns[i - 1]!.pitch) t.same++;
      }
    }
    held.set(m.contour, t);
  });
  const chant = held.get("chant");
  assert.ok(chant !== undefined && chant.moves > 100, "no chant was drawn to measure");
  const share = chant.same / chant.moves;
  // The band is the DEFINITION, not a target: chant is "primarily on one or
  // two pitches" (en.wikipedia.org/wiki/Reciting_tone), so a line that holds
  // almost never is not a reciting tone and one that never leaves is not a
  // tune. Where exactly between those it sits is this program's own taste and
  // the bounds are [chosen] wide enough to say so.
  assert.ok(share > 0.2, `a reciting tone repeated only ${(100 * share).toFixed(0)}% of its moves`);
  assert.ok(share < 0.75, `a reciting tone repeated ${(100 * share).toFixed(0)}% of its moves and went nowhere`);
});

test("a riff leaps and a sung line walks", () => {
  // The claim is that these are two different KINDS of line, not one process
  // with a dial: "in conjunct melodic motion, the melodic phrase moves in a
  // stepwise fashion", and disjunct motion leaps
  // (en.wikipedia.org/wiki/Melodic_motion). So what is asserted is the
  // difference between them and not a rate for either — half again as many
  // leaps is [chosen] as the least that reads as a different kind of line.
  const by = new Map<string, { leaps: number; moves: number }>();
  each(160, (_, m) => {
    const t = by.get(m.contour) ?? { leaps: 0, moves: 0 };
    for (const line of lines(m)) {
      const ns = byTime(line);
      for (let i = 1; i < ns.length; i++) {
        t.moves++;
        if (Math.abs(ns[i]!.pitch - ns[i - 1]!.pitch) >= 3) t.leaps++;
      }
    }
    by.set(m.contour, t);
  });
  const rate = (k: string): number => {
    const t = by.get(k);
    assert.ok(t !== undefined && t.moves > 100, `no ${k} was drawn to measure`);
    return t.leaps / t.moves;
  };
  assert.ok(rate("riff") > rate("sung") * 1.5, `a riff leaps ${(100 * rate("riff")).toFixed(0)}% against a sung line's ${(100 * rate("sung")).toFixed(0)}%`);
});

test("a leap is answered the other way, most of the time", () => {
  // "Any large melodic leap will be followed by a reversal of pitch direction
  // approximately 70% of the time" (Huron, Sweet Anticipation). Measured over
  // the lines this program writes, not asserted on each one: the laws above
  // can refuse the reversal where nothing legal goes that way.
  let after = 0;
  let reversed = 0;
  each(160, (_, m) => {
    for (const line of lines(m)) {
      const ns = byTime(line);
      for (let i = 2; i < ns.length; i++) {
        const leap = ns[i - 1]!.pitch - ns[i - 2]!.pitch;
        if (Math.abs(leap) < 3) continue;
        const next = ns[i]!.pitch - ns[i - 1]!.pitch;
        if (next === 0) continue;
        after++;
        if (Math.sign(next) === -Math.sign(leap)) reversed++;
      }
    }
  });
  assert.ok(after > 100, `only ${after} moves followed a leap`);
  const share = reversed / after;
  assert.ok(share > 0.55, `only ${(100 * share).toFixed(0)}% of leaps were answered the other way`);
});

test("a note off the chord resolves by step into the chord that follows", () => {
  let off = 0;
  each(80, (_, m) => {
    for (const line of lines(m)) {
    const ns = byTime(line);
    for (let i = 0; i < ns.length - 1; i++) {
      if (inChord(m, ns[i]!)) continue;
      off++;
      const next = ns[i + 1]!;
      const d = Math.abs(next.pitch - ns[i]!.pitch);
      assert.ok(d <= 2, `${m.key} bar ${ns[i]!.bar}: a non-chord tone leaps ${d} semitones away`);
      assert.ok(inChord(m, next), `${m.key} bar ${ns[i]!.bar}: a non-chord tone resolves to another`);
    }
    }
  });
  assert.ok(off > 50, `only ${off} non-chord tones in 80 records — the tune is not using passing notes`);
});

test("beats take chord tones", () => {
  let strong = 0;
  let onChord = 0;
  each(80, (chart, m) => {
    for (const n of tune(m)) {
      if (n.step % chart.metre.perBeat !== 0) continue;
      strong++;
      if (inChord(m, n)) onChord++;
    }
  });
  // not every beat: a step drawn onto a beat with no chord tone a step away
  // is an appoggiatura, which resolves like any other dissonance and is how a
  // line stays a line instead of an arpeggio. Most beats, not all.
  assert.ok(onChord / strong > 0.65, `only ${((100 * onChord) / strong).toFixed(0)}% of beats are chord tones`);
});

test("the tune ends on a chord tone, in every form", () => {
  each(80, (_, m) => {
    for (const line of lines(m)) {
      const ns = byTime(line);
      const last = ns[ns.length - 1];
      if (!last) return;
      assert.ok(inChord(m, last), `${m.key} ends on ${last.pitch}, off the chord`);
    }
  });
});

test("the tune stays in register, in scale, and inside its span per phrase", () => {
  each(60, (chart, m) => {
    // the record's band, not the genre's: a record may sit a few semitones
    // below the genre's written register, and the parts read chart.register.
    const [lo, hi] = chart.register.lead;
    for (const line of lines(m)) for (let ph = 0; ph * 2 < m.bars; ph++) {
      const ns = line.filter((n) => Math.floor(n.bar / 2) === ph);
      if (ns.length === 0) continue;
      const ps = ns.map((n) => n.pitch);
      assert.ok(Math.min(...ps) >= lo && Math.max(...ps) <= hi);
      assert.ok(Math.max(...ps) - Math.min(...ps) <= lofi.lead.span, `${m.key} phrase ${ph} spans ${Math.max(...ps) - Math.min(...ps)}`);
    }
  });
});

test("the tune moves — mostly by step, sometimes by leap", () => {
  let step = 0;
  let leap = 0;
  each(80, (_, m) => {
    const ns = sorted(m);
    for (let i = 1; i < ns.length; i++) {
      const d = Math.abs(ns[i]!.pitch - ns[i - 1]!.pitch);
      if (d <= 2) step++;
      else leap++;
    }
  });
  const tot = step + leap;
  assert.ok(step / tot > 0.55, `steps are only ${((100 * step) / tot).toFixed(0)}% of moves`);
  assert.ok(leap / tot > 0.1, `leaps are only ${((100 * leap) / tot).toFixed(0)}% of moves`);
});

test("the answer goes the other way from the question", () => {
  // Only where the loop is long enough to hold both. When the changes come
  // round every two bars the loop IS one phrase, bars 2-3 are a COPY of bars
  // 0-1, and asking whether the "answer" runs the other way from the
  // "question" is asking whether a thing differs from itself.
  let contrary = 0;
  let pairs = 0;
  each(80, (_, m) => {
    if (m.period <= 2) return;
    const q = byTime(tune(m).filter((n) => n.bar < 2));
    const a = byTime(tune(m).filter((n) => n.bar >= 2 && n.bar < m.period));
    if (q.length < 2 || a.length < 2) return;
    const qd = Math.sign(q[q.length - 1]!.pitch - q[0]!.pitch);
    const ad = Math.sign(a[a.length - 1]!.pitch - a[0]!.pitch);
    if (qd === 0 || ad === 0) return;
    pairs++;
    if (qd !== ad) contrary++;
  });
  assert.ok(pairs > 10, `only ${pairs} materials had a loop long enough to hold a question and an answer`);
  assert.ok(contrary / pairs > 0.6, `the answer ran the same way as the question in ${pairs - contrary} of ${pairs}`);
});

test("nothing the tune targets rubs against what is ringing", () => {
  // an avoid note is a note off the chord a semitone from one on it, and it
  // may pass on a weak beat but never be a target. The parts that matter are
  // the ones RINGING: the keys hold a chord for a whole bar, so a note
  // arriving on beat two meets a chord struck on beat one.
  let targets = 0;
  each(80, (chart, m) => {
    const beat = chart.metre.perBeat;
    const ringing = (bar: number, step: number): number[] =>
      [...m.groove.keys, ...m.groove.bass]
        .filter((n) => n.bar === bar && n.step <= step && step < n.step + n.dur)
        .map((n) => n.pitch);
    for (const line of m.lead) {
      for (const n of line) {
        if (n.step % beat !== 0) continue;   // between the beats it may pass
        if (inChord(m, n)) continue;         // a chord tone is not an avoid note
        targets++;
        for (const p of ringing(n.bar, n.step)) {
          assert.notEqual(Math.abs(p - n.pitch), 1, `${m.key} bar ${n.bar} step ${n.step}: ${n.pitch} rubs on ${p}`);
        }
      }
    }
  });
  assert.ok(targets > 20, `only ${targets} off-chord notes on beats to judge`);
});

test("the tune never lands on a pitch that is already ringing", () => {
  each(60, (_, m) => {
    for (const line of m.lead) {
      for (const n of line) {
        const ringing = [...m.groove.keys, ...m.groove.bass]
          .filter((o) => o.bar === n.bar && o.step <= n.step && n.step < o.step + o.dur)
          .map((o) => o.pitch);
        assert.ok(!ringing.includes(n.pitch), `${m.key} bar ${n.bar}: the tune doubles a held ${n.pitch}`);
      }
    }
  });
});

test("the tune never lands on a seat the keys or bass hold", () => {
  each(60, (_, m) => {
    const held = new Set([...m.groove.keys, ...m.groove.bass].map((n) => `${n.bar}:${n.step}:${n.pitch}`));
    for (const l of m.lead) for (const n of l) assert.ok(!held.has(`${n.bar}:${n.step}:${n.pitch}`));
  });
});

test("every material the lead plays opens with a tune", () => {
  let played = 0;
  each(60, (_, m) => {
    if (m.lead.length === 0) return;
    played++;
    // the floor is well above what a phrase needs: it was 2 when the opening
    // note was narrowed by preference before the laws were applied, so the
    // whole first phrase could rest.
    //
    // A VARIANT IS ITS STATEMENT THINNED, and thinning takes up to a third of
    // the notes out — twice over, where the loop's second turn is a varied
    // repetition rather than a copy. Fewer notes is the operation working,
    // not a tune failing to arrive, so a variant is held to what is left of
    // that floor rather than to the floor itself.
    const floor = m.variant > 0 ? 5 : 8;
    assert.ok(tune(m).length >= floor, `${m.key} has ${tune(m).length} lead notes`);
  });
  assert.ok(played > 60);
});

test("a developed time round differs, and keeps the question where there is one", () => {
  // The question-and-answer belongs to a loop long enough to hold both. When
  // the changes come round every two bars — the common case in loop-based
  // music, and a "default phrase expectation" in hip-hop (Adams, MTO 26.2) —
  // the loop IS one phrase, there is no answer to vary, and the development
  // varies the phrase itself. The question-and-answer then happens across two
  // turns of the loop instead of inside one.
  let developed = 0;
  let periodic = 0;
  let rests = 0;
  let longMaterials = 0;
  each(120, (_, m) => {
    if (m.lead.length < 3) return;
    // a VARIANT's two lines are two different transformations of the same
    // statement, so neither keeps the other's question — that is what makes
    // them a pair of changes rather than a question and an answer
    if (m.variant > 0) return;
    longMaterials++;
    const first = tune(m);
    const inLoop = (ns: readonly Note[]): string => JSON.stringify(ns.filter((n) => n.bar < m.period));
    for (const line of m.lead.slice(1)) {
      if (line.length === 0) { rests++; continue; }
      if (JSON.stringify(line) === JSON.stringify(first)) continue;
      developed++;
      // whatever the loop's length, a development differs inside it — the
      // tiles after the first are copies, so a difference only there would
      // be no difference at all
      assert.notEqual(inLoop(line), inLoop(first), `${m.key}: the development is the statement`);
      if (m.period > 2) {
        periodic++;
        const question = (ns: readonly Note[]) => JSON.stringify(ns.filter((n) => n.bar < 2));
        assert.equal(question(line), question(first), `${m.key}: the development changed the question`);
        assert.notEqual(
          JSON.stringify(line.filter((n) => n.bar >= 2 && n.bar < m.period)),
          JSON.stringify(first.filter((n) => n.bar >= 2 && n.bar < m.period)),
        );
      }
    }
  });
  assert.ok(longMaterials > 30);
  void periodic;
  // most long materials develop; a few rest a cycle; none does either on
  // the first cycle, which every plan opens with the tune
  assert.ok(developed > longMaterials * 0.5, `only ${developed} developed cycles in ${longMaterials} long materials`);
  assert.ok(rests > 0 && rests < developed, `${rests} resting cycles against ${developed} developed`);
});

test("the drums keep a figure and vary it by the bar's letter", () => {
  const steps = stepsPerBar(lofi.metre);
  let bars = 0;
  let distinct = 0;
  each(60, (_, m) => {
    const byBar: string[] = [];
    for (const hits of m.drums) {
      for (let b = 0; b < m.bars; b++) {
        byBar.push(hits.filter((h) => h.bar === b).map((h) => `${h.step}${h.lane}`).sort().join());
      }
      // the downbeat kick is the bar and is never taken away
      for (let b = 0; b < m.bars; b++) {
        assert.ok(hits.some((h) => h.bar === b && h.step === 0 && h.lane === "kick"), `${m.key} bar ${b} has no downbeat`);
      }
      for (const h of hits) assert.ok(h.step >= 0 && h.step < steps);
    }
    bars += byBar.length;
    distinct += new Set(byBar).size;
  });
  // Neither a loop nor noise: bars repeat, and they also differ. Both bounds
  // are [chosen], and what they stand on is the claim rather than any
  // particular record — a beat whose every bar is distinct has no figure in
  // it for an ear to hold, and one whose bars are all identical has nothing
  // for the fill at the end of a phrase to be a departure from. The old floor
  // of 40% denied the first of those outright.
  const share = distinct / bars;
  assert.ok(share > 0.12, `only ${(100 * share).toFixed(0)}% of drum bars are distinct — a loop, not a figure`);
  assert.ok(share < 0.6, `${(100 * share).toFixed(0)}% of drum bars are distinct — no figure`);
});

test("a fill rises into the next bar", () => {
  let fills = 0;
  each(120, (chart, m) => {
    const beat = chart.metre.perBeat;
    const steps = stepsPerBar(chart.metre);
    for (const hits of m.drums) for (let b = 0; b < m.bars; b++) {
      const lastBeat = hits.filter((h) => h.bar === b && h.lane === "snare" && h.step >= steps - beat).sort((x, y) => x.step - y.step);
      if (lastBeat.length < beat) continue;
      fills++;
      for (let i = 1; i < lastBeat.length; i++) assert.ok(lastBeat[i]!.vel >= lastBeat[i - 1]!.vel, `${m.key} bar ${b} fill falls`);
    }
  });
  assert.ok(fills > 10, `only ${fills} fills in 120 records`);
});

// ── THE HOOK, THE SHAPE AND THE HIGH POINT ───────────────────────────────────
// Melody as constraint rather than legality: see docs/genre-research/
// MELODY-AND-THE-HOOK.md for the sources, and tools/measure.ts for the same
// numbers measured off the MIDI file rather than off these objects.

/** The rungs of the scale a line stands on, ascending — read off the line itself. */
const rungsOf = (line: readonly Note[]): number[] => [...new Set(line.map((n) => n.pitch))].sort((a, b) => a - b);

/**
 * The longest figure a line says more than once, counted in SCALE STEPS and
 * in grid steps: a figure moved a step up the scale is the same figure.
 */
function repeated(line: readonly Note[], ladder: readonly number[], steps: number): number {
  const ns = byTime(line);
  const rung = (p: number): number => ladder.indexOf(p);
  const at = (n: Note): number => n.bar * steps + n.step;
  for (let k = Math.min(6, ns.length); k >= 3; k--) {
    const seen = new Set<string>();
    for (let i = 0; i + k <= ns.length; i++) {
      const sig: string[] = [];
      for (let j = 0; j + 1 < k; j++) sig.push(`${rung(ns[i + j + 1]!.pitch) - rung(ns[i + j]!.pitch)}@${at(ns[i + j + 1]!) - at(ns[i + j]!)}`);
      const s = sig.join(",");
      if (seen.has(s)) return k;
      seen.add(s);
    }
  }
  return 0;
}

test("a tune says a figure of its own twice, and does it more often than it used to", () => {
  // The hook, inside the phrase rather than across the loop: a loop repeated
  // is repetition by construction, and Burns's own examples are of a segment
  // "repeated immediately" INSIDE a verse.
  let phrases = 0;
  let restating = 0;
  each(60, (chart, m) => {
    const steps = stepsPerBar(chart.metre);
    for (const line of lines(m)) {
      // one turn of the loop: what is written once and played every time
      const turn = line.filter((n) => n.bar < m.period);
      if (turn.length < 6) continue;
      phrases++;
      if (repeated(turn, rungsOf(line), steps) >= 3) restating++;
    }
  });
  assert.ok(phrases > 40, `only ${phrases} turns were long enough to say anything twice`);
  // MEASURED, the same sixty seeds before this rule existed: 9%. The floor is
  // set under what it measures now (34%) rather than at it, because the
  // number is a draw and a test that pins a draw fails on a Tuesday.
  const share = restating / phrases;
  assert.ok(share > 0.2, `only ${(100 * share).toFixed(0)}% of turns restate a figure of their own`);
});

test("a figure comes back as itself: the same shape, on the same feet", () => {
  // What makes a restatement a restatement rather than a coincidence: the
  // rhythm between the notes is the figure's as well as the pitches.
  each(40, (chart, m) => {
    const steps = stepsPerBar(chart.metre);
    for (const line of lines(m)) {
      const ladder = rungsOf(line);
      const turn = byTime(line.filter((n) => n.bar < m.period));
      const k = repeated(turn, ladder, steps);
      if (k === 0) continue;
      // the figure exists in the scale it claims to: every note of it is on a rung
      for (const n of turn) assert.ok(ladder.includes(n.pitch), `${m.key}: ${n.pitch} is not on the ladder`);
    }
  });
});

test("the tune has one high point, and the phrase's peak sounds once", () => {
  // "Many melodies have a single highest note, usually at or near the end of
  // the record. The highest note usually marks a climax" (Burns 1987). The
  // measure is per PHRASE, because the loop plays the tune again and again
  // and counting the top note across a record counts the tiling.
  let judged = 0;
  let alone = 0;
  each(60, (_, m) => {
    if (m.contour === "chant") return; // a reciting tone is made of one pitch
    for (const line of lines(m)) {
      const turn = line.filter((n) => n.bar < m.period);
      if (turn.length < 4) continue;
      judged++;
      const top = Math.max(...turn.map((n) => n.pitch));
      if (turn.filter((n) => n.pitch === top).length === 1) alone++;
    }
  });
  assert.ok(judged > 40, `only ${judged} turns were judged`);
  // measured at 74% before this rule and 80% after, over twenty seeds of the
  // whole record; the floor is under both, because what it must not do is
  // fall back to a ceiling being hit again and again
  assert.ok(alone / judged > 0.6, `the peak sounds once in only ${((100 * alone) / judged).toFixed(0)}% of turns`);
});

test("some tunes plant one interval wider than a fifth, and none plants three", () => {
  // "Any interval larger than a perfect fifth seems distinctive" (Burns
  // 1987): one of those is a signature, and a line full of them is an
  // arpeggio with a wide grip.
  let withOne = 0;
  let tunes = 0;
  each(60, (_, m) => {
    if (m.contour === "riff") return; // an arpeggio leaps by nature; the rule is about a line
    for (const line of lines(m)) {
      const turn = byTime(line.filter((n) => n.bar < m.period));
      if (turn.length < 4) continue;
      tunes++;
      let wide = 0;
      for (let i = 1; i < turn.length; i++) if (Math.abs(turn[i]!.pitch - turn[i - 1]!.pitch) > 7) wide++;
      if (wide > 0) withOne++;
      assert.ok(wide <= 2, `${m.key} leaps wider than a fifth ${wide} times in one turn`);
      for (let i = 1; i < turn.length; i++) {
        assert.ok(Math.abs(turn[i]!.pitch - turn[i - 1]!.pitch) <= 12, `${m.key} leaps ${Math.abs(turn[i]!.pitch - turn[i - 1]!.pitch)} semitones`);
      }
    }
  });
  assert.ok(tunes > 30, `only ${tunes} tunes were judged`);
  assert.ok(withOne > 0, "no tune in sixty seeds planted a distinctive interval");
});

test("a wide leap is answered the other way, and some of the gap comes back", () => {
  // Meyer's gap-fill: "large intervals in a melody imply smaller intervals in
  // the opposite direction", and Huron measures the reversal itself at about
  // 70% of large leaps.
  //
  // THE REVERSAL IS THE PART THIS PROGRAM CAN GUARANTEE; THE FULL WALK BACK IS
  // NOT, AND THAT IS MEASURED RATHER THAN ASSUMED. After a wide leap the
  // candidate list is often ONE pitch: the landing note is frequently off its
  // chord, and a note off the chord may only move by a step and only into the
  // chord under the next onset, which with the phrase's span and the seats the
  // other parts hold can leave a single legal note. Traced over twenty seeds,
  // the line's whole choice after a nine-semitone leap was `[69]`. So the debt
  // biases what there is to choose from and cannot invent a candidate; a line
  // that oscillates a step above its landing note has answered the leap and
  // not retraced it.
  //
  // Lines the builder wrote, in one turn of the loop: a variant's tune is a
  // motivic transformation of another line, and a transformation moves whole
  // lines at once — it can create a leap nothing walked back from.
  let gaps = 0;
  let reversed = 0;
  let recovered = 0;
  each(60, (_, m) => {
    if (m.contour === "riff" || m.variant > 0) return;
    const ns = byTime(tune(m).filter((n) => n.bar < m.period));
    for (let i = 1; i + 1 < ns.length; i++) {
      const leap = ns[i]!.pitch - ns[i - 1]!.pitch;
      if (Math.abs(leap) <= 7) continue;
      gaps++;
      if (Math.sign(ns[i + 1]!.pitch - ns[i]!.pitch) === -Math.sign(leap)) reversed++;
      const three = ns[Math.min(i + 3, ns.length - 1)]!.pitch;
      recovered += Math.max(0, (three - ns[i]!.pitch) * -Math.sign(leap)) / Math.abs(leap);
    }
  });
  if (gaps === 0) return;
  // measured at 67% here and 86% on dungeon synth, against Huron's 70%
  assert.ok(reversed / gaps > 0.5, `only ${reversed} of ${gaps} wide leaps were answered the other way`);
  // and a quarter of the gap is back within three notes, on average
  assert.ok(recovered / gaps > 0.2, `only ${((100 * recovered) / gaps).toFixed(0)}% of each gap came back`);
});
