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
import type { Register } from "../../genre/spec.ts";
import { intoBand, scaleStep } from "../../core/theory.ts";
import type { Chart } from "../chart.ts";
import { manner } from "./manner.ts";
import type { Chord, Note } from "./note.ts";

/** What a bass note weighs; the metre decides which of them lands hardest. */
const BASS_WEIGHT = 0.84;

/**
 * DOUBLE AND ADD ONE — the second turn of the loop carries one more strike.
 *
 * The line is written for one turn and tiled, which is what makes a beat a
 * beat, and it is also why the fourth pass of a two-bar figure was the first
 * pass exactly. The technique for building out of a short cell is nested
 * variation: "double it and add an event that only occurs every two bars"
 * (Future Music, quoted in the arrangement diagnosis of lofi seed 42), and the
 * smallest such event a bass can make is the turnaround — "a passage at the
 * end of a section which leads to the next section" (Wikipedia, "Turnaround
 * (music)") — one approach note on the last off-beat of the turn, into the
 * downbeat that starts the loop again.
 *
 * ON THE TILED LINE, not inside the turn: the turn itself stays exactly what
 * it was, so everything written against one turn of it — the keys, the tune,
 * the counter — is still written against the figure. The added note is folded
 * into the loop's own picture by `Sounding` like any other, so nothing lands
 * on it. It takes the step by the same rule an `approach` takes its pitch, it
 * shortens the strike before it rather than overlapping it, and it is not
 * added where the pocket already strikes there or later in the bar.
 *
 * Only ever the even turns, so a material two turns long gains exactly one
 * note and the loop is still the loop with a turnaround at its seam.
 */
export function withTurnaround(
  chart: Chart,
  tiled: readonly Note[],
  loop: readonly Chord[],
  period: number,
  bars: number,
  steps: number,
  rng: Rng,
  register: Register = chart.register.bass,
): Note[] {
  const B = chart.genre.bass;
  if (B.turnaround <= 0) return [...tiled];
  const [lo, hi] = register;
  const band = (p: number): number => intoBand(p, lo, hi);
  // the last off-beat of the bar: the "and" of the last beat
  const step = steps - Math.max(1, Math.floor(chart.metre.perBeat / 2));
  const out = [...tiled];
  for (let k = 1; (k + 1) * period <= bars; k += 2) {
    const bar = (k + 1) * period - 1;
    const at = rng.at("turnaround", k);
    if (!at.chance("add", B.turnaround)) continue;
    const inBar = out.filter((n) => n.bar === bar).sort((a, b) => a.step - b.step);
    if (inBar.length === 0 || inBar.some((n) => n.step >= step)) continue;
    const prev = inBar[inBar.length - 1]!;
    // where the loop goes next is its own first chord, because the next bar
    // is the next turn
    const target = band(loop[0]!.root);
    const dir = target > prev.pitch ? 1 : -1;
    const pitch = band(scaleStep(chart.tonic, chart.scale, prev.pitch, dir));
    if (pitch === prev.pitch) continue;
    const idx = out.indexOf(prev);
    out[idx] = { ...prev, dur: Math.max(1, step - prev.step) };
    const dur = steps - step;
    const art = manner(at, "art", B.art, { strong: false, dur, from: pitch - prev.pitch });
    out.push({ bar, step, dur, pitch, vel: BASS_WEIGHT, art });
  }
  return out;
}

export function drawBass(chart: Chart, chords: readonly Chord[], rng: Rng, steps: number, kick: readonly number[], register: Register = chart.register.bass): Note[] {
  const B = chart.genre.bass;
  // THE BAND IS A PARAMETER, so another seat can play this job in its own
  // register: the element and the part are two different things
  const [lo, hi] = register;
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
