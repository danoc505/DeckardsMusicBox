/**
 * Pitch, scale and chord arithmetic.
 *
 * Everything here is a pure function of numbers. No genre, no instrument, no
 * opinion about style — a scale is a list of semitones and a chord is a list of
 * pitches, and which ones a record uses is decided somewhere else.
 *
 * Pitches are MIDI numbers throughout: 60 is middle C, 12 to an octave.
 *
 * A *degree* is a step of a scale, not a semitone; it may be negative or run
 * past the top of the scale, and wraps into octaves when it does.
 *
 * `tonic` is an ABSOLUTE MIDI PITCH, not a pitch class — `degreeMidi(60, major,
 * 0)` is middle C, and degree 0 of a scale rooted at 48 is two octaves lower.
 * Anything holding a bare pitch class places it first (`48 + pcOfKey`). Only
 * the pitch class of `tonic` matters to `inScale` and `nearestDegree`, which
 * answer about every octave; everywhere else the register is carried.
 */

/** Semitones above the tonic, ascending, starting at 0. */
export type Scale = readonly number[];

export const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  minor: [0, 2, 3, 5, 7, 8, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10],
  harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
  melodicMinor: [0, 2, 3, 5, 7, 9, 11],
} as const satisfies Record<string, Scale>;

export type ScaleName = keyof typeof SCALES;

export const NOTE_NAMES = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B",
] as const;

/** Pitch class, 0..11, correct for negative input. */
export const pc = (n: number): number => ((n % 12) + 12) % 12;

/** "C#4" for 61. MIDI 60 is C4. */
export const noteName = (midi: number): string =>
  NOTE_NAMES[pc(midi)] + String(Math.floor(midi / 12) - 1);

/**
 * Semitones above the tonic for a scale degree, wrapping into octaves.
 * Degree 0 is the tonic, 7 is the octave above it, -1 is the leading tone below.
 */
export function degreeSemis(scale: Scale, degree: number): number {
  const n = scale.length;
  if (n === 0) throw new Error("empty scale");
  const octave = Math.floor(degree / n);
  const step = degree - octave * n;
  return scale[step]! + octave * 12;
}

/** The MIDI pitch of a scale degree, counted from a tonic pitch class. */
export const degreeMidi = (tonic: number, scale: Scale, degree: number): number =>
  tonic + degreeSemis(scale, degree);

/** Is this pitch in the scale, in any octave? */
export const inScale = (tonic: number, scale: Scale, midi: number): boolean =>
  scale.some((s) => pc(tonic + s) === pc(midi));

/**
 * The scale degree whose pitch class is nearest this one, ties going down.
 * Used to name a chord that arrived from outside the scale.
 */
export function nearestDegree(tonic: number, scale: Scale, pitch: number): number {
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < scale.length; i++) {
    const d = pc(pitch - tonic - scale[i]!);
    const dist = Math.min(d, 12 - d);
    if (dist < bestDist) {
      bestDist = dist;
      best = i;
    }
  }
  return best;
}

/**
 * Move `steps` scale degrees from an arbitrary pitch.
 *
 * The pitch need not be in the scale; it is placed at its nearest degree first,
 * so a chromatic note steps to a diatonic one rather than dragging its offset
 * along. The result is always in the scale.
 */
export function scaleStep(
  tonic: number,
  scale: Scale,
  midi: number,
  steps: number,
): number {
  const n = scale.length;
  const within = nearestDegree(tonic, scale, midi);
  const octave = Math.floor((midi - tonic) / 12);
  // `within` is a degree inside one octave, and the octave it belongs to is not
  // always the one the raw division gives — a pitch just under the tonic is
  // nearest degree 0 of the octave ABOVE. Take whichever absolute degree lands
  // closest to the pitch we were handed.
  let deg = octave * n + within;
  let best = Infinity;
  for (const cand of [deg - n, deg, deg + n]) {
    const dist = Math.abs(degreeMidi(tonic, scale, cand) - midi);
    if (dist < best) {
      best = dist;
      deg = cand;
    }
  }
  return degreeMidi(tonic, scale, deg + steps);
}

/**
 * Fold a pitch into [lo, hi] by whole octaves. Only octaves are moved, so the
 * pitch class never changes — the note is the same note, in a register that
 * fits.
 *
 * A band narrower than an octave cannot hold every pitch class. When this one
 * does not fit, the nearer of the two straddling octaves is returned, which is
 * OUTSIDE the band: callers that must stay inside it have to check. Moving the
 * pitch class instead would be answering a different question.
 */
export function intoBand(midi: number, lo: number, hi: number): number {
  if (hi < lo) [lo, hi] = [hi, lo];
  let p = midi;
  while (p < lo) p += 12;
  while (p > hi) p -= 12;
  if (p < lo) return lo - p <= p + 12 - hi ? p : p + 12;
  return p;
}

/**
 * A chord quality as absolute semitones above its root.
 * Used when a chord's kind is stated rather than derived from the scale.
 */
export const QUALITIES = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  dim: [0, 3, 6],
  aug: [0, 4, 8],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  /** An open fifth: no third at all, so it is neither major nor minor. */
  open: [0, 7],
  major7: [0, 4, 7, 11],
  minor7: [0, 3, 7, 10],
  dom7: [0, 4, 7, 10],
  halfDim7: [0, 3, 6, 10],
  dim7: [0, 3, 6, 9],
  minorMajor7: [0, 3, 7, 11],
} as const satisfies Record<string, readonly number[]>;

export type QualityName = keyof typeof QUALITIES;

/**
 * Chord tones as absolute MIDI pitches above the chord's root.
 *
 * With no `quality`, thirds are stacked *within the scale* — so the kind of
 * chord that comes out is whatever that degree of that mode gives, which is
 * what makes a mode sound like itself. Naming a quality overrides that with a
 * fixed shape, which is how a chord reaches outside the scale on purpose.
 *
 * `size` is how many notes: 3 is a triad, 4 a seventh, 5 a ninth. A named
 * quality sets a floor on it, because a chord that calls itself a seventh and
 * sounds three notes is lying about the notes beside it.
 */
export function chordTones(
  tonic: number,
  scale: Scale,
  degree: number,
  size = 3,
  quality?: QualityName,
): number[] {
  const root = degreeMidi(tonic, scale, degree);
  if (quality) {
    const shape = QUALITIES[quality];
    const out = shape.map((s) => root + s);
    for (let i = shape.length; i < size; i++) {
      // extensions past the named shape carry on in scale thirds
      out.push(degreeMidi(tonic, scale, degree + i * 2));
    }
    return out;
  }
  const out: number[] = [];
  for (let i = 0; i < Math.max(2, size); i++) out.push(degreeMidi(tonic, scale, degree + i * 2));
  return out;
}

/** How many pitch classes two chords hold in common. */
export function commonTones(a: readonly number[], b: readonly number[]): number {
  const set = new Set(b.map(pc));
  let n = 0;
  const seen = new Set<number>();
  for (const x of a) {
    const p = pc(x);
    if (set.has(p) && !seen.has(p)) {
      seen.add(p);
      n++;
    }
  }
  return n;
}

/**
 * Name a chord from its tones. For display and for reading a dump — nothing
 * decides music from this — which is exactly why it has to be right: a
 * readout that calls a diminished chord minor, or a major seventh dominant,
 * is a picture disagreeing with the sound.
 *
 * Reads the third, the fifth and the seventh as intervals above the root, so
 * the name follows what the notes are rather than how many there happen to be.
 */
export function chordName(tones: readonly number[]): string {
  if (tones.length === 0) return "—";
  const root = pc(tones[0]!);
  const name = NOTE_NAMES[root]!;
  if (tones.length === 1) return name;

  const iv = tones.slice(1).map((t) => pc(t - tones[0]!));
  const third = iv[0]!;
  const fifth = iv[1];
  const seventh = iv[2];

  if (third === 7 && fifth === undefined) return name + "5";

  let q: string;
  if (third === 3 && fifth === 6) q = "dim";
  else if (third === 4 && fifth === 8) q = "aug";
  else if (third === 3) q = "m";
  else if (third === 4) q = "";
  else if (third === 2) q = "sus2";
  else if (third === 5) q = "sus4";
  else q = "?";

  if (seventh === undefined) return name + q;
  if (q === "dim") return name + (seventh === 9 ? "dim7" : seventh === 10 ? "m7b5" : "dim");
  if (seventh === 11) return name + (q === "" ? "maj7" : q + "maj7");
  if (seventh === 10) return name + q + "7";
  if (seventh === 9) return name + q + "6";
  return name + q;
}
