/**
 * The bass: the root on the downbeat, and something chosen on every other
 * strike of the pocket.
 *
 * The pocket — which steps strike — is drawn once for the whole material, so
 * every bar of it has the same feet; or it IS the kick's, where the genre
 * says the bass follows the drums. What the off-beat strikes PLAY is drawn
 * per strike, so the line moves while the rhythm holds. That is the difference
 * between a bass line and a metronome playing pitches.
 */

import type { Rng } from "../../core/rng.ts";
import { intoBand, scaleStep } from "../../core/theory.ts";
import type { Chart } from "../chart.ts";
import type { Chord, Note } from "./note.ts";

/** What a bass note weighs; the metre decides which of them lands hardest. */
const BASS_WEIGHT = 0.84;

export function drawBass(chart: Chart, chords: readonly Chord[], rng: Rng, steps: number, kick: readonly number[]): Note[] {
  const B = chart.genre.bass;
  const [lo, hi] = B.register;
  const band = (p: number): number => intoBand(p, lo, hi);
  const pocket = B.pocket === "kick" ? kick : rng.weighted("pocket", B.pocket);

  const out: Note[] = [];
  let prev: number | null = null;

  for (const chord of chords) {
    const next = chords[(chord.bar + 1) % chords.length]!;
    const root = band(chord.root);
    const third = band(chord.tones[1] ?? chord.root + 4);
    const fifth = band(chord.tones[2] ?? chord.root + 7);

    for (let i = 0; i < pocket.length; i++) {
      const step = pocket[i]!;
      const until = i + 1 < pocket.length ? pocket[i + 1]! : steps;
      let pitch: number;

      if (step === 0) {
        pitch = root;
      } else {
        const tone = rng.at("bar", chord.bar).weighted(`tone:${step}`, B.tones);
        switch (tone) {
          case "root":
            pitch = root;
            break;
          case "third":
            pitch = third;
            break;
          case "fifth":
            pitch = fifth;
            break;
          case "octave":
            pitch = band(root + 12);
            break;
          case "approach": {
            // one scale step from where the line IS toward where it is GOING.
            // The direction is derived from the two roots, never drawn: an
            // approach that leads away from its target is not an approach.
            const from = prev ?? root;
            const target = band(next.root);
            const dir = target > from ? 1 : target < from ? -1 : -1;
            pitch = band(scaleStep(chart.tonic, chart.scale, from, dir));
            break;
          }
        }
      }

      out.push({ bar: chord.bar, step, dur: until - step, pitch, vel: BASS_WEIGHT });
      prev = pitch;
    }
  }
  return out;
}
