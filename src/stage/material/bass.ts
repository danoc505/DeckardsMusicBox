/**
 * The bass: the root on the downbeat, and something chosen on every other
 * strike of the pocket.
 *
 * The pocket — which steps strike — is drawn once for the whole material, so
 * every bar of it has the same feet; or it IS the kick's, where the genre
 * says the bass follows the drums. What the off-beat strikes PLAY is drawn
 * per POSITION IN THE MOTIF, so the line moves while the rhythm holds and
 * the shape still comes back: bar two of a four-bar idea plays the scale
 * functions bar nought played, over whatever chord bar two stands on. Same
 * shape, different pitches — a tonal sequence. Drawn per bar of the material
 * instead, as it was, a four-chord progression got four unrelated shapes and
 * the two-bar cell repeated 0% of the time while its rhythm repeated 96%.
 */

import type { Rng } from "../../core/rng.ts";
import { intoBand, scaleStep } from "../../core/theory.ts";
import type { Chart } from "../chart.ts";
import { manner } from "./manner.ts";
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

  const motif = Math.max(1, chart.genre.harmony.motif);
  for (const chord of chords) {
    const next = chords[(chord.bar + 1) % chords.length]!;
    /** Where this bar sits in the motif: the shape is drawn on this, not the bar. */
    const cell = rng.at("cell", chord.bar % motif);
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
        const tone = cell.weighted(`tone:${step}`, B.tones);
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

      const art = manner(cell, `art:${step}`, B.art, {
        strong: step % chart.metre.perBeat === 0,
        dur: until - step,
        from: prev === null ? null : pitch - prev,
      });
      out.push({ bar: chord.bar, step, dur: until - step, pitch, vel: BASS_WEIGHT, art });
      prev = pitch;
    }
  }
  return out;
}
