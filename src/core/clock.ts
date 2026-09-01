/**
 * Metre, and the one place a bar becomes a second.
 *
 * Everything that places or measures a note asks this. Nothing multiplies its
 * own `bar * steps * secondsPerStep` — that arithmetic existed nineteen times
 * in the program this replaces, which is why "the tempo may change here" was
 * not a thing anyone could add.
 */

/** How a bar is divided. 4/4 on sixteenths is `{ beats: 4, perBeat: 4 }`. */
export interface Metre {
  /** Beats in a bar: 4 for 4/4, 3 for 3/4, 2 for 6/8 counted in dotted quarters. */
  readonly beats: number;
  /** Grid steps per beat. 4 gives sixteenths, 3 gives triplet eighths. */
  readonly perBeat: number;
}

export const FOUR_FOUR: Metre = { beats: 4, perBeat: 4 };

export const stepsPerBar = (m: Metre): number => m.beats * m.perBeat;

/**
 * How strong a position in the bar is, 0..1, from the metre alone.
 *
 * A metre is beats on several levels at once, and a position is strong to
 * the degree that levels agree on it: the downbeat carries a beat at every
 * level, a beat of the bar at all but the finest, a sixteenth at one. The
 * count of levels that fall on a position IS its accentual strength — the
 * dots under the staff in Lerdahl and Jackendoff, where "the number of dots
 * in a given column indicates the accentual strength at that point relative
 * to other beats in the hierarchy".
 *
 * Built from the metre rather than tabulated, so it is right in five four
 * and in a beat divided in three without anyone writing those out. Levels
 * divide by two where they can and by three where they cannot, which is the
 * well-formedness rule: strong beats are spaced two or three apart.
 */
export function metricalStrength(step: number, m: Metre): number {
  const levels = gridLevels(m);
  let on = 0;
  for (const every of levels) if (step % every === 0) on++;
  return on / levels.length;
}

/** The spacing, in grid steps, of each level of the metre's hierarchy, coarsest first. */
function gridLevels(m: Metre): number[] {
  const out: number[] = [];
  // from the whole bar down to the beat, then from the beat down to the grid
  for (const [span, into] of [[stepsPerBar(m), m.beats], [m.perBeat, m.perBeat]] as const) {
    let at = span;
    out.push(at);
    let left = into;
    while (left > 1) {
      const by = left % 2 === 0 ? 2 : left % 3 === 0 ? 3 : left;
      at /= by;
      left /= by;
      out.push(at);
    }
  }
  // the bar and the beat coincide when a bar is one beat; a level twice is not two levels
  return [...new Set(out)].sort((a, b) => b - a);
}

export interface Clock {
  readonly metre: Metre;
  /** Grid steps in a bar. */
  readonly steps: number;
  /** How many bars the record is. */
  readonly bars: number;
  /** True when the tempo is not the same in every bar. */
  readonly varies: boolean;

  /** The tempo in force in a bar, in bpm. */
  tempoAt(bar: number): number;
  /** How long one grid step lasts in a bar, in seconds. */
  stepSec(bar: number): number;
  /** How long a whole bar lasts, in seconds. */
  barSec(bar: number): number;

  /**
   * Seconds from the top of the record. `step` is an offset into the bar and
   * may be fractional (micro-timing) or outside it (a pickup, an ending that
   * reaches past the last bar).
   */
  at(bar: number, step?: number): number;
  /** The inverse: which fractional bar a moment falls in. */
  barAt(sec: number): number;
  /** The same moment as an absolute fractional step count. */
  stepAt(sec: number): number;
}

export interface ClockSpec {
  /** One number for a steady record, or one per bar for a record that moves. */
  readonly tempo: number | readonly number[];
  readonly bars: number;
  readonly metre?: Metre;
}

export function clock(spec: ClockSpec): Clock {
  const metre = spec.metre ?? FOUR_FOUR;
  const steps = stepsPerBar(metre);
  const bars = Math.max(1, Math.floor(spec.bars));

  if (steps <= 0) throw new Error("a bar needs at least one step");

  const given = Array.isArray(spec.tempo) ? (spec.tempo as readonly number[]) : null;
  if (given && given.length === 0) throw new Error("a tempo map needs at least one bar");
  for (const t of given ?? [spec.tempo as number]) {
    if (!(t > 0) || !Number.isFinite(t)) throw new Error(`bad tempo: ${t}`);
  }
  /** A map shorter than the record holds its last tempo to the end. */
  const map = given && new Set(given).size > 1 ? given : null;

  /**
   * A steady record takes the closed form, and that is not an optimisation.
   * Accumulating N equal bar lengths and multiplying by N are different
   * doubles, so a clock that always accumulated would move every note in every
   * record by a few microseconds for no musical reason. A map that names one
   * tempo over and over is a steady record and comes through here too.
   */
  if (map === null) {
    const bpm = given ? given[0]! : (spec.tempo as number);
    const sec = 60 / bpm / metre.perBeat;
    return Object.freeze({
      metre, steps, bars, varies: false,
      tempoAt: () => bpm,
      stepSec: () => sec,
      barSec: () => steps * sec,
      at: (bar: number, step = 0) => (bar * steps + step) * sec,
      barAt: (s: number) => s / (steps * sec),
      // its own division, not `barAt(sec) * steps`: algebraically the same and
      // a different double, and these answers get rounded to a whole step
      stepAt: (s: number) => s / sec,
    });
  }

  const n = map.length;
  const stepOf = new Float64Array(n);
  /** edge[i] is the second bar i begins at; edge[n] is the end of the record. */
  const edge = new Float64Array(n + 1);
  for (let i = 0; i < n; i++) stepOf[i] = 60 / map[i]! / metre.perBeat;
  for (let i = 0; i < n; i++) edge[i + 1] = edge[i]! + stepOf[i]! * steps;

  const idx = (bar: number): number => Math.max(0, Math.min(n - 1, Math.floor(bar)));

  /**
   * Outside the record is not an error: an ending reaches past the last bar and
   * a pickup sits before the first. Both extend at the tempo of the nearest
   * real bar rather than clamping, so time never runs backwards.
   */
  const at = (bar: number, step = 0): number => {
    const b = bar + step / steps;
    if (b <= 0) return b * stepOf[0]! * steps;
    if (b >= n) return edge[n]! + (b - n) * stepOf[n - 1]! * steps;
    const i = Math.floor(b);
    return edge[i]! + (b - i) * stepOf[i]! * steps;
  };

  const barAt = (sec: number): number => {
    if (sec <= 0) return sec / (stepOf[0]! * steps);
    if (sec >= edge[n]!) return n + (sec - edge[n]!) / (stepOf[n - 1]! * steps);
    let lo = 0;
    let hi = n;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (edge[mid]! <= sec) lo = mid;
      else hi = mid;
    }
    return lo + (sec - edge[lo]!) / (stepOf[lo]! * steps);
  };

  return Object.freeze({
    metre, steps, bars, varies: true,
    tempoAt: (bar: number) => map[idx(bar)]!,
    stepSec: (bar: number) => stepOf[idx(bar)]!,
    barSec: (bar: number) => stepOf[idx(bar)]! * steps,
    at,
    barAt,
    // counted in steps directly rather than as `barAt(sec) * steps`: the two
    // agree algebraically and not in the last bit, and this answer gets
    // rounded to a whole step by everything that reads it
    stepAt: (sec: number) => {
      if (sec <= 0) return sec / stepOf[0]!;
      if (sec >= edge[n]!) return n * steps + (sec - edge[n]!) / stepOf[n - 1]!;
      const i = Math.floor(barAt(sec));
      return i * steps + (sec - edge[i]!) / stepOf[i]!;
    },
  });
}

/** Seconds as m:ss, for anything that prints a time. */
export const clockFace = (sec: number): string => {
  const s = Math.max(0, sec);
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
};

/** How many bars is roughly this many seconds, at this tempo and metre. */
export const barsForSec = (sec: number, bpm: number, metre: Metre = FOUR_FOUR): number =>
  Math.max(1, Math.round((sec * bpm) / (60 * metre.beats)));

/** And the other way. */
export const secForBars = (bars: number, bpm: number, metre: Metre = FOUR_FOUR): number =>
  (bars * 60 * metre.beats) / bpm;
