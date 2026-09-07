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
 *   Transformation"). Six are used, and they divide in two:
 *
 *     THIN     notes removed. A tune with holes in it is the same tune.
 *     AUGMENT  notes held longer. The same notes, in less of a hurry.
 *
 *   Those two SUBTRACT and can never invent a wrong note, because they add no
 *   pitch that was not already there. The other four MOVE pitches:
 *
 *     INVERT      the intervals flipped, by scale degree.
 *     RETROGRADE  the pitches walked back through the same rhythm.
 *     SEQUENCE    the same shape at another pitch level, a step or two away.
 *     OCTAVE      the same tune, twelve semitones away.
 *
 *   THIS PARAGRAPH USED TO SAY THE OPPOSITE and it is worth recording why,
 *   because the argument was good and the conclusion was wrong. It said only
 *   the first two were used, on the grounds that a moved pitch "would have to
 *   be re-checked against the chord under it, the register, the scale, and
 *   what the other parts are sounding — which is the job the lead builder
 *   already does with far more context than a transformation has." Every word
 *   of that is true. What it got wrong is that re-checking is CHEAP: the
 *   builder's own judge can be handed a finished line as easily as a
 *   half-written one. So a moved line is a PROPOSAL and `lawsFor` disposes,
 *   which is the shape the rest of this program already uses. A transformation
 *   that had to be patched to be legal is not the transformation any more —
 *   but one that is refused whole costs nothing.
 *
 * THE LAWS THE STATEMENT WAS WRITTEN UNDER STILL HOLD AFTERWARDS. A note off
 * its chord is only legal because the note after it resolves by step; remove
 * that note and the dissonance is stranded. So a note is removed only where
 * the one before it is already a chord tone and nothing else about the line
 * changes — the same shape as everywhere else here, a constraint on the
 * choice rather than a repair after it.
 */

import type { Rng } from "../../core/rng.ts";
import { pc, scaleStep, type Scale } from "../../core/theory.ts";
import type { Chord, Note } from "./note.ts";

/**
 * How a tune comes back changed.
 *
 * The first two SUBTRACT and can never produce a wrong note. The last three
 * MOVE PITCHES, and every note they produce has to be judged against the same
 * laws the line was written under — the chord beneath it, the register, the
 * scale, what the other parts are sounding, and whether a dissonance still
 * resolves. They propose; `lawsFor` disposes, and a proposal that breaks one
 * law is refused whole rather than repaired. A transformation that had to be
 * patched to be legal is not the transformation any more.
 */
export const CHANGES = ["thin", "augment", "invert", "retrograde", "sequence", "octave"] as const;
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
  /** The scale tones inside the lead's register, ascending: the rungs a tonal move steps along. */
  ladder: readonly number[],
  /** The key the record stands in, for a sequence to move by its steps. */
  tonic: number,
  scale: Scale,
  /** Every hard law a tune obeys. A moved pitch that breaks one is refused. */
  laws?: (l: readonly Note[]) => boolean,
): { readonly line: readonly Note[]; readonly changed: boolean } {
  const sorted = line.slice().sort((a, b) => a.bar - b.bar || a.step - b.step);
  if (sorted.length === 0) return { line: sorted, changed: false };
  // each operation draws from its own address, so the two subtractive ones do
  // not remove the same notes and then differ only in how long what is left
  // is held
  let made: Note[];
  if (which === "thin" || which === "augment") {
    made = which === "thin"
      ? thin(sorted, chords, rng.at("thin"))
      : augment(sorted, chords, rng.at("augment"), steps, bars);
    // A REMOVAL IS A PROPOSAL TOO. These two were the only changes that never
    // met the laws: they carry their own guard — nothing that strands a
    // dissonance, nothing that leaves two of the same pitch adjacent — and
    // that guard is not the whole of what a line must be.
    //
    // What it misses is what removing a note OPENS. Take the middle out of
    // 81 82 79 67 and the line leaps 81 to 67, fourteen semitones, an
    // interval neither the generator nor any transformation was ever allowed
    // to place. lofi seed 7's B/1 did exactly that once the chords grew to
    // five tones. So a thinned line is judged like any other proposal, and a
    // thinning that cannot be made lawfully is not made.
    if (laws !== undefined && made.length > 0 && !laws(made)) return { line: sorted, changed: false };
  } else {
    // A MOVED LINE IS A PROPOSAL. Without a judge there is nothing to check it
    // against, so it is not offered at all: silently shipping an unchecked
    // transposition is how a wrong note gets into a record.
    if (laws === undefined) return { line: sorted, changed: false };
    const moved = which === "invert" ? invert(sorted, ladder)
      : which === "retrograde" ? retrograde(sorted)
      : which === "octave" ? octave(sorted)
      : sequence(sorted, tonic, scale, rng);
    const ok = moved.filter((cand) => laws(cand));
    if (ok.length === 0) return { line: sorted, changed: false };
    made = ok[0]!;
  }
  return { line: made, changed: JSON.stringify(made) !== JSON.stringify(sorted) };
}

/**
 * INVERSION: "flipping the intervals of the motive, such as turning an upward
 * leap into a downward one" (tobyrush.com, "Motivic Development").
 *
 * TONAL, not real. "Melodic inversion can be real (where every interval is
 * exactly the same quality) or tonal (where the intervals abide by the scale
 * or key)", and tonal inversion "prioritizes staying within the harmonic and
 * melodic framework of a particular key or scale, which is why it's more
 * common in tonal music" (musictheory.pugetsound.edu, "Melodic Alteration";
 * en.wikipedia.org/wiki/Inversion_(music)). So the reflection is of the SCALE
 * DEGREE and not the semitone: a third up becomes a third down whatever
 * quality the scale gives it, and the result cannot leave the scale.
 *
 * Reflected in semitones it left the scale on most notes and the laws refused
 * nearly every one — a mathematically exact transformation that no tonal
 * record would use anyway.
 *
 * Which pitch to reflect about is the only choice there is, so every one the
 * line itself offers is proposed and the laws pick: an axis from the line
 * keeps it in its own neighbourhood, where an arbitrary one moves it out of
 * register.
 */
function invert(ns: readonly Note[], ladder: readonly number[]): Note[][] {
  const rung = (p: number): number => ladder.indexOf(p);
  const axes = [...new Set(ns.map((n) => n.pitch))].filter((p) => rung(p) >= 0);
  return axes.map((axis) => {
    const a = rung(axis);
    return ns.map((n) => {
      const i = rung(n.pitch);
      const to = i < 0 ? n.pitch : ladder[2 * a - i];
      return { ...n, pitch: to ?? n.pitch };
    });
  });
}

/**
 * RETROGRADE: "reversing the order of the motive". The rhythm stays where it
 * is and the pitches walk back through it, so the figure keeps its own feet
 * and changes its shape — a retrograde that reversed the rhythm too would
 * land its notes somewhere else entirely and stop being this material's line.
 */
function retrograde(ns: readonly Note[]): Note[][] {
  const pitches = ns.map((n) => n.pitch).reverse();
  return [ns.map((n, i) => ({ ...n, pitch: pitches[i]! }))];
}

/**
 * SEQUENCE: "transposing the motive to another pitch level in a stepwise
 * manner". Every shift of a step or two, near first: a sequence is the same
 * shape moved a little, and moved far it is a different line.
 */
function sequence(ns: readonly Note[], tonic: number, scale: Scale, rng: Rng): Note[][] {
  // BY SCALE STEPS, not semitones: "transposing the motive to another pitch
  // level in a STEPWISE manner", and a chromatic shift would leave the scale
  // on nearly every note and be refused by the laws every time.
  const by = rng.chance("up", 0.5) ? [1, -1, 2, -2] : [-1, 1, -2, 2];
  const step = (p: number, d: number): number => {
    let at = p;
    for (let k = 0; k < Math.abs(d); k++) at = scaleStep(tonic, scale, at, Math.sign(d));
    return at;
  };
  return by.map((d) => ns.map((n) => ({ ...n, pitch: step(n.pitch, d) })));
}

/**
 * OCTAVE DISPLACEMENT: the same tune, an octave away.
 *
 * The one thing this program could not do to a pitch. Every part had an
 * absolute register from its genre, the record's own octave was drawn once in
 * `chart.ts` and added to all of them, and nothing moved after that — measured
 * over eighty records, a part's mean pitch moved about two semitones between
 * sections and ONE record in eighty moved any part a full octave. A record
 * that varies horizontally and never vertically is using half the page.
 *
 * The device is a documented one and it is documented for exactly this job:
 * "moving a chorus melody an octave higher can help differentiate it from a
 * similar-sounding verse melody", which works because it is "generating
 * considerable vocal energy, but it also disguises the fact that both verse
 * and chorus are composed of essentially the same tone set"
 * (secretsofsongwriting.com, "Using Octave Displacement to Avoid Verse-Chorus
 * Sameness"). That is what a variant is FOR — the same tone set, heard again,
 * needing to differ — so this belongs beside the other five and not in a
 * mechanism of its own.
 *
 * UP IS TRIED FIRST, because the source is explicit about the direction: "the
 * upward octave displacement should be in the chorus. Rarely would it ever
 * work to have a verse in the upper octave with the chorus in the lower."
 * Down is offered second rather than not at all — a return that can only go up
 * is a return that stops happening once the tune is near its ceiling, and this
 * program's leads sit high already.
 *
 * IT IS THE ONE TRANSFORMATION THAT CANNOT LEAVE THE SCALE. Twelve semitones
 * is the same pitch class, so unlike inversion and sequence it can never
 * propose a wrong note. It can only fail two ways — off the end of the part's
 * register, or onto a pitch another part is already holding — and `lawsFor`
 * already refuses both. The source names the first of those itself: "the key
 * you choose will need to be one where the singer can handle the melody in two
 * different octaves." A register that cannot hold the tune twice does not get
 * to move it, and here that is a check rather than a warning.
 */
function octave(ns: readonly Note[]): Note[][] {
  const whole = (by: number): Note[] => ns.map((n) => ({ ...n, pitch: n.pitch + by }));
  // AND HALF A LINE, WHICH IS WHAT MAKES IT FIRE AT ALL. Measured before this
  // existed: a whole-line octave move fits the register in 26% of lofi's lead
  // lines and ONE of dungeon synth's 687 — that genre's lead band is fifteen
  // semitones and its median line spans nine, so twelve more has nowhere to
  // go. A move refused 99.9% of the time is a knob that does nothing.
  //
  // The source that names the device names this too, in the same breath: you
  // "don't have to displace an entire melody — you can move just part of it
  // instead" (secretsofsongwriting.com). Only the moved half has to fit, so a
  // band too narrow for the whole tune twice is wide enough for its ending.
  //
  // It is also the one thing `docs/TALLY.md` §3 calls the highest-value item
  // on its list and nothing had built: PARTIAL VARIATION, "first half
  // identical, second half diverges". This is that, delivered by the
  // mechanism that already owns how a tune comes back changed rather than by
  // a new one beside it.
  const from = (at: number, by: number): Note[] =>
    ns.map((n, i) => (i < at ? { ...n } : { ...n, pitch: n.pitch + by }));
  // AND WHERE THE LINE BREAKS IS PROPOSED, NOT PICKED. Splitting at the exact
  // middle was measured at one success in twenty-one, and the reason is a law
  // this file has to answer to rather than a fault in the device: the seam
  // becomes a leap, and `lawsFor` refuses any interval wider than
  // SIGNATURE_MAX — an octave. Displace from a note that sits ABOVE the one
  // before it and the seam is thirteen semitones or more, refused every time.
  //
  // So every split is offered and the laws choose, which is exactly what
  // `invert` below already does with its axis: a transformation proposes, and
  // the judge that knows the chord, the register and the other parts disposes.
  // Nearest the middle first — half a line displaced is the device, and a
  // split one note from the end is a grace note wearing its name.
  const mid = ns.length / 2;
  const splits = ns.map((_, i) => i).filter((i) => i > 0 && i < ns.length)
    .sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid));
  // up before down, whole before part: the source is explicit about the
  // direction, and a whole-line move is the stronger reading of the device
  return [whole(12), whole(-12), ...splits.flatMap((i) => [from(i, 12), from(i, -12)])];
}

/** A different change from this one, for a development to take. */
export const otherChange = (c: Change): Change =>
  CHANGES[(CHANGES.indexOf(c) + 1) % CHANGES.length]!;
