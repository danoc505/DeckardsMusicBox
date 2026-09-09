/**
 * The changes an idea stands on: a chord per bar of the material, and a chord
 * may hold for more than one of them — see `chordBars`.
 *
 * Drawn per IDEA, not per material, so every statement of A — plain or varied
 * — stands on the same chords. What varies when an idea comes back changed is
 * what is played over the harmony, never the harmony itself; a return that
 * changes the chords too is a different section, not a restatement.
 */

import { chordName, chordTones, degreeMidi, pc } from "../../core/theory.ts";
import type { Idea } from "../../genre/spec.ts";
import type { Chart } from "../chart.ts";
import type { Chord } from "./note.ts";

export function drawChords(chart: Chart, idea: Idea): Chord[] {
  const H = chart.genre.harmony;
  const draw = chart.rng.at("harmony", idea);
  let pool = H.progressions[idea];
  if (H.diminished === "avoid") {
    // the degree whose triad is diminished depends on the scale drawn, so
    // the pool is read against this record's scale, not the genre's page
    const diminished = (degree: number): boolean => {
      const t = chordTones(chart.tonic, chart.scale, degree, 3);
      return pc(t[2]! - t[0]!) === 6;
    };
    const clear = pool.filter(([p]) => !p.some(diminished));
    if (clear.length > 0) pool = clear;
  }
  const prog = draw.weighted("progression", pool);

  /**
   * HOW LONG EACH STEP OF THE PROGRESSION HOLDS, drawn ONCE PER POSITION.
   *
   * Per position and not per bar, for the reason the seventh below already
   * gives: a length drawn per bar would give a four-bar progression a
   * different shape every time it came round, and a loop that repeats nothing
   * is not a loop. Drawn here, one statement of an idea and every later
   * statement of it stand on the same changes for the same lengths.
   */
  const spotBars = prog.map((_, spot) =>
    Math.max(1, Math.round(draw.at("spot", spot).weighted("chordBars", H.chordBars))));

  const out: Chord[] = [];
  // WALKED BY THE PROGRESSION, NOT BY THE BAR. A step holds for its own
  // length and the next step follows it; the walk comes round and repeats
  // until the material is full. A step whose length would run past the end of
  // the material is cut there — the material repeats, and the next statement
  // starts the walk again, so the seam is the one a loop already has.
  for (let bar = 0, step = 0; bar < H.bars; step++) {
    const spot = step % prog.length;
    const degree = prog[spot]!;
    const holdBars = spotBars[spot]!;
    // DRAWN PER POSITION IN THE PROGRESSION, not per bar of the material. A
    // setting between 0 and 1 still gives a mix of plain and extended chords
    // across the loop; drawn per bar it gave a mix across the MATERIAL, so a
    // two-bar progression written over four bars came out Am7 Fmaj7 Am Fmaj7
    // — four different chords, and a two-bar loop silently turned into a
    // four-bar one that repeats nothing. The quality belongs to the chord,
    // and the chord comes round with the progression.
    const seventh = draw.at("spot", spot).chance("seventh", H.sevenths);
    // Drawn whether or not the seventh landed, so a genre that asks for no
    // ninth is bit-for-bit the record it was before this existed.
    const ninth = draw.at("spot", spot).chance("ninth", H.ninths) && seventh;
    let tones = chordTones(chart.tonic, chart.scale, degree, ninth ? 5 : seventh ? 4 : 3);
    // A BARE FIFTH: the third dropped, so the chord is neither major nor
    // minor. Dungeon synth "favors modal scales, open fifths, and cadences
    // reminiscent of early music" and "notably avoids complex jazz-influenced
    // harmony"; an open fifth "is just the root and the fifth and leaves room
    // for choir and melody to add color" (en.wikipedia.org/wiki/Dungeon_synth;
    // dungeonsynth.proboards.com, "Chords for Dungeon Synth"). Drawn after
    // the seventh so a genre that asks for both gets a fifth, not a seventh
    // with a hole in it.
    if (tones.length >= 3 && draw.at("spot", spot).chance("fifth", H.fifths)) tones = [tones[0]!, tones[2]!];
    // ONE CHORD OBJECT PER BAR IT HOLDS, and every builder downstream still
    // reads `chords[bar % chords.length]`. A chord that holds four bars is the
    // same chord standing at four bars, which is what lets `keys.hold` leave a
    // tone ringing through it: the tone is still sounding and still in the
    // chord, so there is nothing to restrike.
    const root = degreeMidi(chart.tonic, chart.scale, degree);
    const frozen = Object.freeze(tones);
    const name = chordName(tones);
    for (let k = 0; k < holdBars && bar < H.bars; k++, bar++) {
      out.push(Object.freeze({ bar, degree, root, tones: frozen, name }));
    }
  }
  return out;
}

/**
 * HOW LONG THE LOOP ACTUALLY IS: the fewest bars after which the changes come
 * round again. A four-bar material whose progression is `[0, 5]` is written
 * as Dm7 Am Dm7 Am, and that is a TWO-BAR loop stated twice, not a four-bar
 * one — and everything played over it should agree, or the record says one
 * thing with its harmony and another with everything else.
 *
 * This matters more in loop-based music than anywhere: "the pitched elements
 * of a hip-hop beat tend to repeat in loops of one, two, or four measures;
 * exceptions to this are extremely rare", and "two-bar phrases in hip-hop are
 * so typical that they form a default phrase expectation" (Adams, "Parameters
 * of Phrase in Hip-Hop", MTO 26.2, 2.5 and 1.13). The period is derived from
 * the chords rather than stated, so a genre cannot set one and write the
 * other.
 */
/**
 * HOW LONG THE LOOP IS, FROM THE CHART ALONE — before a material exists.
 *
 * drawChords reads nothing but the chart and the idea, and its draws are
 * addressed, so asking twice costs nothing and answers the same. That makes
 * the loop length a fact about the CHART, not about the built material, and
 * it is why stage 3 may ask for it without waiting on stage 4: it is not
 * reading materials, it is doing the same pure arithmetic they will do.
 *
 * Checked over 450 sections of both genres: the period computed here and the
 * period the material later derives disagree 0 times.
 *
 * The arrangement needs it because a span is TWO TURNS OF THE LOOP, and
 * without the turn length it could only guess how many spans a section has.
 * Guessing built 2216 spans of which 783 were ever reached — every section
 * carried spans that decided something and were never read.
 */
export function periodOf(chart: Chart, idea: Idea): number {
  return harmonicPeriod(drawChords(chart, idea));
}

export function harmonicPeriod(chords: readonly Chord[]): number {
  const n = chords.length;
  const same = (a: Chord, b: Chord): boolean => a.degree === b.degree && a.name === b.name;
  for (let p = 1; p < n; p++) {
    if (n % p !== 0) continue;
    let holds = true;
    for (let i = p; i < n && holds; i++) if (!same(chords[i]!, chords[i % p]!)) holds = false;
    /**
     * AND A PERIOD MAY NOT CUT A CHORD THAT IS STILL SOUNDING.
     *
     * The test above asks whether the chords REPEAT every p bars, and a chord
     * held across a bar line repeats trivially: four bars of Dm satisfy it at
     * p = 1. That was harmless while a chord lasted exactly one bar and became
     * a fault the moment `chordBars` let one last longer — the caller slices
     * `chords.slice(0, period)` and tiles it, so a four-bar Dm was written as
     * a ONE-bar Dm played four times. The pad restruck every bar, `keys.hold`
     * had no ringing tone to grow, and holding a chord LONGER made its notes
     * SHORTER. Measured: dungeon synth seed 218's longest keys note fell from
     * 2.85 bars to 0.95 when the chord went to four bars.
     *
     * A tile boundary is a fresh first bar. So p is only the period if the
     * chord actually CHANGES across it — otherwise the tiling is cutting one
     * chord into pieces and calling the pieces a loop.
     */
    if (holds && !same(chords[p - 1]!, chords[p]!)) return p;
  }
  return Math.max(1, n);
}
