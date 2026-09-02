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
  // (en.wikipedia.org/wiki/Reciting_tone) — and Chop Suey's vocal repeats its
  // own pitch 44% of the time. So the rule is stated for the two contours it
  // is true of, and the third is tested for the opposite below.
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
  // Chop Suey's vocal sits at 44%; a reciting tone that holds almost never is
  // not one, and one that never leaves is not a tune
  assert.ok(share > 0.2, `a reciting tone repeated only ${(100 * share).toFixed(0)}% of its moves`);
  assert.ok(share < 0.75, `a reciting tone repeated ${(100 * share).toFixed(0)}% of its moves and went nowhere`);
});

test("a riff leaps and a sung line walks", () => {
  // Shine On's saxophone leaps 13% of the time and its clean electric 79%:
  // the second is not a melody that leaps, it is a chord played one note at
  // a time. The two contours must be measurably different kinds of line.
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
  const [lo, hi] = lofi.lead.register;
  each(60, (_, m) => {
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
    // whole first phrase could rest
    assert.ok(tune(m).length >= 8, `${m.key} has ${tune(m).length} lead notes`);
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
  // Neither a loop nor noise: bars repeat, and they also differ. The band is
  // measured off records — distinct bars of drums against bars played is 18%
  // in Chop Suey, 17% in Televators, 36% in Shine On, and the riff guitars
  // that carry those songs sit at 16-24%. The old floor of 40% was above all
  // of them, and holding it meant the figure could never come back.
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
