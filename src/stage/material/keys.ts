/**
 * The keys: the chord, voiced, struck where the strike pattern says.
 *
 * Voicing is a choice among the ways a chord's tones can be stacked, and the
 * choice is made by COST, never by a filter that can come up empty. The only
 * hard filter is the register, which cannot empty because a register is at
 * least an octave wide and the tones are folded into it. Everything else —
 * a muddy interval low down, a voicing that is more open or closer than the
 * genre wants, a top voice that leaps — makes a candidate worse, and the
 * best of what is left is taken. A constraint that can be unsatisfiable has
 * to be a cost, or the day it is unsatisfiable the record does not exist.
 */

import type { Rng } from "../../core/rng.ts";
import { intoBand } from "../../core/theory.ts";
import type { Chart } from "../chart.ts";
import { manner } from "./manner.ts";
import type { Chord, Note, Sounding } from "./note.ts";

/**
 * Below this pitch, two notes closer than a major third stop reading as two
 * notes and start reading as mud: the low interval limit for a minor third
 * is C3/Eb3 (Sweetwater InSync, "Low Interval Limit"), and seconds sit
 * higher still. The cost, not the line, is what is chosen here.
 */
/**
 * What a struck chord weighs. One number: where in the bar it falls is the
 * metre's business and the performance applies it, so a part that wrote its
 * own downbeat rule would be saying the same thing twice.
 */
const KEYS_WEIGHT = 0.68;

const LOW_INTERVAL_FLOOR = 48;
const LOW_INTERVAL_MIN = 4;

const COST = {
  /** per semitone each voice moves, when the voices pair up */
  move: 1,
  /** per semitone the TOP voice moves — the line an ear follows */
  top: 2,
  /** for wanting open and getting close, or the reverse */
  openness: 10,
  /** per muddy interval under the floor */
  mud: 18,
  /** per semitone rub against a note another part is already sounding */
  rub: 14,
  /**
   * For voicing this bar differently from the way THIS POSITION IN THE MOTIF
   * was voiced the first time it came round.
   *
   * The shape a hand makes — which inversion, how far it is spread — is a
   * thing apart from the chord it makes it on, and it was being thrown away:
   * candidates() built every voicing structurally, by octave and inversion
   * and drop, then flattened them to bare pitch sets. With the structure gone
   * there was nothing for a motif to hold, so the same position in the loop
   * had no way to voice the same way twice, and whether the keys repeated at
   * all was decided by whether the greedy chain below happened to cycle: 0%
   * on a four-chord progression, 94% on a two-chord one, and nothing in
   * between that anyone chose.
   *
   * Weighted above move and top together, because a sequence is worth more
   * than the semitones it costs to reach — that is what makes it a sequence
   * rather than whatever was nearest. A COST and not a filter, so a shape the
   * register cannot fit this chord in is simply not taken.
   */
  shape: 24,
  /**
   * For a top voice that does not move ACROSS A CHANGE OF CHORD.
   *
   * "The top voice is the line an ear follows" — this file's own words — and
   * a line that never moves is not a line. Nothing here resisted that: with
   * move and top charging for motion and nothing charging for stillness,
   * greedy argmin keeps a common tone forever, because a tone shared between
   * two chords costs 0 to hold and at least 1 to leave. In dungeonsynth 101
   * that arithmetic put pitch 69 under 100 of the record's 300 keys events,
   * bars 16 to 95 of 96 — a third of five and a half minutes of comping on
   * one note. Charged only where the chord actually changed: holding a tone
   * through a chord that has not moved is not stasis, it is the chord.
   *
   * SIZED BY SWEEP, over fifty records of both genres. Moving the top voice
   * costs top x semitones, so a term that does not clear that is never paid:
   * at 6 the soprano moved across 66% of chord changes, at 20 87%, at 30
   * 93%, at 45 97%. Thirty, because a held soprano should be possible and
   * uncommon, and 97% is a rule pretending to be a cost.
   *
   * It does NOT thin the share of keys events sitting on one pitch — 39% to
   * 36% across the same sweep — and that is the honest result, not a
   * shortfall. In a three-note voicing a common tone HELD is a third of the
   * events by arithmetic; Am and D5 share an A, and holding it is the right
   * reading of those two chords, not a fault. What was wrong was the
   * soprano holding with it.
   */
  stasis: 30,
} as const;

/**
 * Every stacking of these tones inside the register: the close inversions,
 * and the drop voicings that spread them — drop-2, drop-3 and drop-2-and-4,
 * each named for the voices from the top that fall an octave. A spread
 * voicing runs two octaves or more, root low and the colour tones above
 * with space (orphiq.com/resources/lofi-chord-progressions); how far a
 * register lets it run is the genre's to say, and the only limit here.
 */
/**
 * A voicing, and the SHAPE that made it: which inversion, and which drop.
 * The pitches say what is played on this chord; the shape says what the hand
 * did, which is the part that can be done again on a different one.
 */
interface Voicing {
  readonly v: readonly number[];
  readonly inv: number;
  /** 0 close, 2 drop-2, 3 drop-3, 24 drop-2-and-4. */
  readonly drop: number;
}

function candidates(tones: readonly number[], lo: number, hi: number): Voicing[] {
  const base = tones.map((t) => intoBand(t, lo, lo + 11)).sort((a, b) => a - b);
  const out: Voicing[] = [];
  const seen = new Set<string>();
  const push = (v: number[], inv: number, drop: number): void => {
    const s = v.slice().sort((a, b) => a - b);
    if (s.some((p) => p < lo || p > hi)) return;
    if (s.some((p, i) => i > 0 && p === s[i - 1])) return;
    const k = s.join(",");
    if (seen.has(k)) return;
    seen.add(k);
    out.push({ v: s, inv, drop });
  };
  for (let oct = 0; oct * 12 + base[base.length - 1]! <= hi; oct++) {
    const stack = base.map((p) => p + oct * 12);
    for (let inv = 0; inv < stack.length; inv++) {
      const close = stack.map((p, i) => (i < inv ? p + 12 : p)).sort((a, b) => a - b);
      push(close, inv, 0);
      const drop = (name: number, ...fromTop: number[]): void => {
        const v = close.slice();
        for (const k of fromTop) if (v.length - k >= 0) v[v.length - k]! -= 12;
        push(v, inv, name);
      };
      if (close.length >= 3) {
        drop(2, 2);
        drop(3, 3);
      }
      if (close.length >= 4) drop(24, 2, 4);
    }
  }
  return out;
}

function cost(
  voicing: Voicing,
  prev: readonly number[] | null,
  wantOpen: number,
  centre: number,
  /** How many notes of a candidate rub against something already ringing. */
  rubbing: (v: readonly number[]) => number,
  /** How this position in the motif was voiced the first time it came round. */
  want: { readonly inv: number; readonly drop: number } | undefined,
  /** Whether the chord under this bar differs from the one before it. */
  moved: boolean,
): number {
  const cand = voicing.v;
  let c = 0;
  // the same position in the motif voices the same way, on whatever chord it
  // has landed on this time round: same inversion, same spread, new harmony
  if (want !== undefined && (want.inv !== voicing.inv || want.drop !== voicing.drop)) c += COST.shape;
  const spread = cand[cand.length - 1]! - cand[0]!;
  const isOpen = spread > 12 ? 1 : 0;
  c += COST.openness * Math.abs(wantOpen - isOpen);

  for (let i = 1; i < cand.length; i++) {
    if (cand[i - 1]! < LOW_INTERVAL_FLOOR && cand[i]! - cand[i - 1]! < LOW_INTERVAL_MIN) c += COST.mud;
  }
  c += COST.rub * rubbing(cand);

  if (prev === null) {
    // the first chord anchors everything after it, so it is placed by its
    // centre: a wide chord centred well is a well-placed wide chord, not a
    // badly placed low one
    c += Math.abs((cand[0]! + cand[cand.length - 1]!) / 2 - centre);
    return c;
  }

  if (cand.length === prev.length) {
    for (let i = 0; i < cand.length; i++) c += COST.move * Math.abs(cand[i]! - prev[i]!);
  } else {
    // voices do not pair up between chords of different sizes; the honest
    // distance is each note to its nearest, both ways, per voice
    let sum = 0;
    let n = 0;
    for (const p of cand) {
      sum += Math.min(...prev.map((q) => Math.abs(p - q)));
      n++;
    }
    for (const q of prev) {
      sum += Math.min(...cand.map((p) => Math.abs(q - p)));
      n++;
    }
    c += (COST.move * sum) / n * Math.max(cand.length, prev.length);
  }
  c += COST.top * Math.abs(cand[cand.length - 1]! - prev[prev.length - 1]!);
  if (moved && cand[cand.length - 1]! === prev[prev.length - 1]!) c += COST.stasis;
  return c;
}

export function drawKeys(
  chart: Chart,
  chords: readonly Chord[],
  rng: Rng,
  steps: number,
  sounding: Sounding,
): Note[] {
  const K = chart.genre.keys;
  const [lo, hi] = K.register;
  const strike = rng.weighted("strike", K.strike);
  // whether this material voices open or close is a property of the part,
  // decided once, not a coin per bar
  const wantOpen = rng.chance("open", K.open) ? 1 : 0;
  const centre = (lo + hi) / 2;

  const out: Note[] = [];
  let prev: readonly number[] | null = null;
  let prevTop: number | null = null;
  let prevChord: Chord | null = null;
  /**
   * What each position in the motif voiced the FIRST time it came round. The
   * hand does again what it did, and the chord underneath is what has
   * changed — which is a voicing sequence, and the reason the same position
   * in the loop now sounds like the same place in the loop.
   */
  const shapeAt = new Map<number, { inv: number; drop: number }>();
  const motif = Math.max(1, chart.genre.harmony.motif);

  for (const chord of chords) {
    let cands = candidates(chord.tones, lo, hi);
    if (cands.length === 0) {
      throw new Error(
        `keys: no voicing of ${chord.name} fits ${lo}..${hi} at bar ${chord.bar} — ` +
          `the register is too narrow for a ${chord.tones.length}-note chord`,
      );
    }
    // a voicing that lands on a pitch another part is already sounding at
    // any of its strikes is not offered — where the register leaves it any
    // other choice
    const clear = cands.filter((c) => !c.v.some((p) => strike.some((st) => sounding.holds(chord.bar, st, p))));
    if (clear.length > 0) cands = clear;
    // and a semitone against something ringing is a cost, not a filter: a
    // filter that can empty is a filter that one day writes no chord at all
    const rubbing = (v: readonly number[]): number =>
      v.filter((p) => strike.some((st) => sounding.rubs(chord.bar, st, p))).length;
    const pos = chord.bar % motif;
    const want = shapeAt.get(pos);
    const moved = prevChord !== null && prevChord.name !== chord.name;
    let bestV = cands[0]!;
    let bestCost = Infinity;
    for (const cand of cands) {
      const c = cost(cand, prev, wantOpen, centre, rubbing, want, moved);
      if (c < bestCost) {
        bestCost = c;
        bestV = cand;
      }
    }
    const best = bestV.v;
    // the first turn of a position is what the later ones answer to
    if (want === undefined) shapeAt.set(pos, { inv: bestV.inv, drop: bestV.drop });
    prev = best;
    prevChord = chord;

    for (let i = 0; i < strike.length; i++) {
      const step = strike[i]!;
      const until = i + 1 < strike.length ? strike[i + 1]! : steps;
      // ONE MANNER FOR THE WHOLE CHORD. A hand does one thing to the notes it
      // puts down together; a voicing whose notes were each drawn their own
      // articulation is not a chord, it is four soloists.
      const art = manner(rng.at("bar", chord.bar), `art:${step}`, K.art, {
        strong: step % chart.metre.perBeat === 0,
        dur: until - step,
        from: prevTop === null ? null : (best[best.length - 1] ?? 0) - prevTop,
      });
      for (const pitch of best) {
        out.push({ bar: chord.bar, step, dur: until - step, pitch, vel: KEYS_WEIGHT, art });
      }
    }
    prevTop = best[best.length - 1] ?? null;
  }
  return out;
}
