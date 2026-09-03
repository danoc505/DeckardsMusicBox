/**
 * The changes an idea stands on: one chord per bar of the material.
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

  const out: Chord[] = [];
  for (let bar = 0; bar < H.bars; bar++) {
    const degree = prog[bar % prog.length]!;
    // DRAWN PER POSITION IN THE PROGRESSION, not per bar of the material. A
    // setting between 0 and 1 still gives a mix of plain and extended chords
    // across the loop; drawn per bar it gave a mix across the MATERIAL, so a
    // two-bar progression written over four bars came out Am7 Fmaj7 Am Fmaj7
    // — four different chords, and a two-bar loop silently turned into a
    // four-bar one that repeats nothing. The quality belongs to the chord,
    // and the chord comes round with the progression.
    const spot = bar % prog.length;
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
    out.push(
      Object.freeze({
        bar,
        degree,
        root: degreeMidi(chart.tonic, chart.scale, degree),
        tones: Object.freeze(tones),
        name: chordName(tones),
      }),
    );
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
    if (holds) return p;
  }
  return Math.max(1, n);
}
