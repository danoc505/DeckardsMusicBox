/**
 * The changes an idea stands on: one chord per bar of the material.
 *
 * Drawn per IDEA, not per material, so every statement of A — plain or varied
 * — stands on the same chords. What varies when an idea comes back changed is
 * what is played over the harmony, never the harmony itself; a return that
 * changes the chords too is a different section, not a restatement.
 */

import { chordName, chordTones, degreeMidi } from "../../core/theory.ts";
import type { Idea } from "../../genre/spec.ts";
import type { Chart } from "../chart.ts";
import type { Chord } from "./note.ts";

export function drawChords(chart: Chart, idea: Idea): Chord[] {
  const H = chart.genre.harmony;
  const draw = chart.rng.at("harmony", idea);
  const prog = draw.weighted("progression", H.progressions[idea]);

  const out: Chord[] = [];
  for (let bar = 0; bar < H.bars; bar++) {
    const degree = prog[bar % prog.length]!;
    // drawn per bar so a sevenths setting between 0 and 1 gives a mix of plain
    // and extended chords across the material rather than all or none
    const seventh = draw.at("bar", bar).chance("seventh", H.sevenths);
    const tones = chordTones(chart.tonic, chart.scale, degree, seventh ? 4 : 3);
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
