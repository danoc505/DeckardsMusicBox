/**
 * A STATEMENT COMING BACK CHANGED.
 *
 * The rule of three says the third hearing of an idea has to differ, and the
 * form decides where. This decides HOW — and the whole difficulty is that it
 * must still be the same idea. A variant that redraws every part over the same
 * chords is not a return at all: it is a new section wearing the old one's
 * harmony, and an ear that was promised something it knows gets something it
 * does not. That is exactly what this replaced.
 *
 * So a variant INHERITS. It keeps the groove — the bass, the keys, the drone
 * — note for note, because the groove is what makes a section recognisable as
 * itself, and it changes two things:
 *
 *   THE BEAT, which is the cheapest and strongest change there is. "Changing
 *   the drum beat works every time, and you could keep everything exactly the
 *   same way and change just the drum beat and it instantly feels different"
 *   (secretsofsongwriting.com, "The Main Differences Between Verse 1 and
 *   Verse 2"). The treatments already cycle; a variant simply takes the next
 *   one along.
 *
 *   THE TUNE, by one of the documented motivic operations — "repetition,
 *   sequence, modulation, augmentation, diminution, retrograde, inversion,
 *   and fragmentation", with ornamentation adding notes and THINNING removing
 *   them (tobyrush.com, "Motivic Development"; study.com, "Motivic
 *   Transformation"). The two used here are the two that cannot invent a
 *   wrong note, because they add no pitch that was not already there:
 *
 *     THIN     notes removed. A tune with holes in it is the same tune.
 *     AUGMENT  notes held longer. The same notes, in less of a hurry.
 *
 *   Inversion, retrograde and sequence all produce pitches the statement
 *   never had, and every one of them would have to be re-checked against the
 *   chord under it, the register, the scale, and what the other parts are
 *   sounding — which is the job the lead builder already does with far more
 *   context than a transformation has. Better a small honest change than a
 *   large one that has to be repaired.
 *
 * THE LAWS THE STATEMENT WAS WRITTEN UNDER STILL HOLD AFTERWARDS. A note off
 * its chord is only legal because the note after it resolves by step; remove
 * that note and the dissonance is stranded. So a note is removed only where
 * the one before it is already a chord tone and nothing else about the line
 * changes — the same shape as everywhere else here, a constraint on the
 * choice rather than a repair after it.
 */

import type { Rng } from "../../core/rng.ts";
import { pc } from "../../core/theory.ts";
import type { Chord, Note } from "./note.ts";

/** How a tune comes back changed. */
export const CHANGES = ["thin", "augment"] as const;
export type Change = (typeof CHANGES)[number];

const isTone = (chord: Chord, p: number): boolean => chord.tones.some((t) => pc(t) === pc(p));

/**
 * Notes removed, where removing them cannot strand a dissonance or leave two
 * of the same pitch running. At most a third of the line, and never its first
 * or last note: a tune that loses its opening or its close has not been
 * thinned, it has been cut short.
 */
function thin(line: readonly Note[], chords: readonly Chord[], rng: Rng, fromEnd = false): Note[] {
  const ns = line.slice().sort((a, b) => a.bar - b.bar || a.step - b.step);
  if (ns.length < 4) return ns;
  const most = Math.max(1, Math.floor(ns.length / 3));
  const out = ns.slice();
  let taken = 0;
  // THE TWO OPERATIONS SCAN OPPOSITE WAYS, so they take different notes out.
  // Given the same direction they took the same ones — the first that can go
  // always goes — and the pair differed only in how long what was left was
  // held, which is too small a difference to carry a development.
  const order = fromEnd
    ? Array.from({ length: out.length }, (_, k) => out.length - 2 - k).filter((i) => i >= 1)
    : Array.from({ length: out.length }, (_, k) => k).filter((i) => i >= 1 && i <= out.length - 2);
  for (const at0 of order) {
    if (taken >= most) break;
    const i = fromEnd ? at0 : at0 - taken;
    if (i < 1 || i > out.length - 2) continue;
    const before = out[i - 1]!;
    // ROUND THE LOOP. This is one turn of a figure that plays over and over,
    // so the note after the last is the first again — a removal that leaves
    // the same pitch either side of the seam is the same fault as one in the
    // middle, and invisible if the line is read as though it ended.
    const after = out[(i + 1) % out.length]!;
    // the note before must owe nothing: a non-chord tone is only legal
    // because what follows it resolves, and this would take that away
    if (!isTone(chords[before.bar % chords.length]!, before.pitch)) continue;
    // and the two it would leave adjacent must not be the same pitch
    if (before.pitch === after.pitch) continue;
    // the first one that can go, goes: a thinning that removes nothing is not
    // a variation, and the rule of three has already said this hearing must
    // differ. After that it is a draw.
    if (taken > 0 && !rng.at("note", i).chance("drop", 0.5)) continue;
    out.splice(i, 1);
    taken++;
  }
  return out;
}

/**
 * FEWER NOTES, EACH HELD THROUGH THE GAP THE MISSING ONE LEFT: the same tune
 * in less of a hurry.
 *
 * Not "hold every note to the next onset", which was the first attempt and
 * did nothing at all — the lead builder already writes each note's length as
 * the distance to the onset after it, so there was never any slack to take
 * up, and the operation was a no-op on nearly half the lines it was asked
 * for. Augmentation is "increasing the duration of the notes in the motive"
 * (tobyrush.com, "Motivic Development"), and the way to increase a duration
 * in a line with no slack is to give it a neighbour's.
 *
 * It removes under exactly the same law as THIN — nothing that strands a
 * dissonance, nothing that leaves two of the same pitch adjacent — and then
 * closes the holes instead of leaving them, which is what makes the two
 * audibly different operations rather than one with a flag.
 */
function augment(line: readonly Note[], chords: readonly Chord[], rng: Rng, steps: number, bars: number): Note[] {
  const thinned = thin(line, chords, rng, true);
  return thinned.map((n, i) => {
    const here = n.bar * steps + n.step;
    const next = i + 1 < thinned.length ? thinned[i + 1]!.bar * steps + thinned[i + 1]!.step : bars * steps;
    const room = Math.max(1, next - here);
    return n.dur >= room ? n : { ...n, dur: room };
  });
}

/**
 * One named change to a tune. The statement is not touched, and the caller is
 * told whether anything actually happened — a line too short to thin or
 * already holding every note to the next onset comes back as it went in, and
 * a caller that cannot tell would ship a "variant" identical to its
 * statement.
 */
export function varyLine(
  line: readonly Note[],
  chords: readonly Chord[],
  rng: Rng,
  steps: number,
  bars: number,
  which: Change,
): { readonly line: readonly Note[]; readonly changed: boolean } {
  const sorted = line.slice().sort((a, b) => a.bar - b.bar || a.step - b.step);
  if (sorted.length === 0) return { line: sorted, changed: false };
  // each operation draws from its own address, so the two do not remove the
  // same notes and then differ only in how long what is left is held
  const made = which === "thin"
    ? thin(sorted, chords, rng.at("thin"))
    : augment(sorted, chords, rng.at("augment"), steps, bars);
  return { line: made, changed: JSON.stringify(made) !== JSON.stringify(sorted) };
}

/** The other one. A statement and its development take a change each. */
export const otherChange = (c: Change): Change => (c === "thin" ? "augment" : "thin");
