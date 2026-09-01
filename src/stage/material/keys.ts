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
import type { Chord, Note } from "./note.ts";

/**
 * Below this pitch, two notes closer than a major third stop reading as two
 * notes and start reading as mud. Every arranging text puts the line near C3;
 * the cost, not the pitch, is what is chosen here.
 */
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
  /** per semitone of spread past two octaves — one instrument, not two */
  sprawl: 3,
} as const;

/** Every stacking of these tones inside the register: inversions and drop-2s. */
function candidates(tones: readonly number[], lo: number, hi: number): number[][] {
  const base = tones.map((t) => intoBand(t, lo, lo + 11)).sort((a, b) => a - b);
  const out: number[][] = [];
  const seen = new Set<string>();
  const push = (v: number[]): void => {
    const s = v.slice().sort((a, b) => a - b);
    if (s.some((p) => p < lo || p > hi)) return;
    if (s.some((p, i) => i > 0 && p === s[i - 1])) return;
    const k = s.join(",");
    if (seen.has(k)) return;
    seen.add(k);
    out.push(s);
  };
  for (let oct = 0; oct * 12 + base[base.length - 1]! <= hi; oct++) {
    const shape = base.map((p) => p + oct * 12);
    for (let inv = 0; inv < shape.length; inv++) {
      const close = shape.map((p, i) => (i < inv ? p + 12 : p));
      push(close);
      if (close.length >= 3) {
        const sorted = close.slice().sort((a, b) => a - b);
        const d2 = sorted.slice();
        d2[d2.length - 2]! -= 12;
        push(d2);
      }
    }
  }
  return out;
}

function cost(
  cand: readonly number[],
  prev: readonly number[] | null,
  wantOpen: number,
  centre: number,
): number {
  let c = 0;
  const spread = cand[cand.length - 1]! - cand[0]!;
  const isOpen = spread > 12 ? 1 : 0;
  c += COST.openness * Math.abs(wantOpen - isOpen);
  if (spread > 24) c += COST.sprawl * (spread - 24);

  for (let i = 1; i < cand.length; i++) {
    if (cand[i - 1]! < LOW_INTERVAL_FLOOR && cand[i]! - cand[i - 1]! < LOW_INTERVAL_MIN) c += COST.mud;
  }

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
  return c;
}

export function drawKeys(chart: Chart, chords: readonly Chord[], rng: Rng, steps: number): Note[] {
  const K = chart.genre.keys;
  const [lo, hi] = K.register;
  const strike = rng.weighted("strike", K.strike);
  // whether this material voices open or close is a property of the part,
  // decided once, not a coin per bar
  const wantOpen = rng.chance("open", K.open) ? 1 : 0;
  const centre = (lo + hi) / 2;

  const out: Note[] = [];
  let prev: number[] | null = null;

  for (const chord of chords) {
    const cands = candidates(chord.tones, lo, hi);
    if (cands.length === 0) {
      throw new Error(
        `keys: no voicing of ${chord.name} fits ${lo}..${hi} at bar ${chord.bar} — ` +
          `the register is too narrow for a ${chord.tones.length}-note chord`,
      );
    }
    let best = cands[0]!;
    let bestCost = Infinity;
    for (const cand of cands) {
      const c = cost(cand, prev, wantOpen, centre);
      if (c < bestCost) {
        bestCost = c;
        best = cand;
      }
    }
    prev = best;

    for (let i = 0; i < strike.length; i++) {
      const step = strike[i]!;
      const until = i + 1 < strike.length ? strike[i + 1]! : steps;
      for (const pitch of best) {
        out.push({ bar: chord.bar, step, dur: until - step, pitch, vel: step === 0 ? 0.72 : 0.6 });
      }
    }
  }
  return out;
}
