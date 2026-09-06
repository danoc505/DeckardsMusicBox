/**
 * The drone: the strings the record stands on, plucked in a cycle.
 *
 * A drone is "a very long and continuous tone that may last through the
 * whole piece", placed "upon the tonic or dominant", against which the
 * chords change over the top (chromatone.center, "Drone"; a pedal point).
 * So it is not written from the chords at all — that is the point of it. It
 * takes the tonic or the fifth of the KEY, holds it for as many bars as the
 * genre says, and lets the harmony move underneath the ear rather than the
 * other way round.
 *
 * It belongs to the groove: a drone that developed would not be a drone.
 *
 * BUT IT IS NOT ONE HELD NOTE, and it used to be — one tone every four bars,
 * eight to eighteen notes across a hundred-bar record, one or two distinct
 * pitches. That is a sustain pedal, not a drone.
 *
 * The instruments that make drones for a living do it with SEVERAL STRINGS,
 * PLUCKED IN TURN. A tanpura has four, "normally the fifth (Pa) and the root
 * tonic (Sa)", one tonic "an octave below the others, adding greater
 * resonance and depth"; they are "plucked in a regular, repeating rhythm",
 * and the sound is what happens between them — "when the next strand is
 * plucked, the two notes interact and build on each other". The cycle closes
 * with "a slightly longer pause" and starts again.
 *
 * So: each string is struck in its turn and rings for the genre's hold, which
 * means several are sounding at once and their overlap is the drone. Which
 * strings, and how fast the turn goes round, is the genre's to say.
 * [en.wikipedia.org/wiki/Tanpura; riyaazqawwali.com/tanpura;
 * organology.net/instrument/tanpura]
 */

import type { Rng } from "../../core/rng.ts";
import { intoBand } from "../../core/theory.ts";
import type { Chart } from "../chart.ts";
import { manner } from "./manner.ts";
import type { Note, Sounding } from "./note.ts";

/** What a held tone weighs. Long notes sit under, not on top. */
const DRONE_WEIGHT = 0.55;

export function drawDrone(
  chart: Chart,
  rng: Rng,
  steps: number,
  bars: number,
  sounding: Sounding,
): Note[] {
  const D = chart.genre.drone;
  const [lo, hi] = chart.register.drone;
  const drawn = rng.weighted("tone", D.tone);
  const hold = Math.min(bars, rng.weighted("hold", D.hold));

  // Every octave of a tone that the register holds, nearest the middle first:
  // the same tone an octave away is still the same tone, so a seat another
  // part already holds is simply the next one down the list.
  const centre = (lo + hi) / 2;
  const octavesOf = (tone: string): number[] => {
    const out: number[] = [];
    for (let p = intoBand(chart.tonic + (tone === "fifth" ? 7 : 0), lo, lo + 11); p <= hi; p += 12) out.push(p);
    return out.sort((a, b) => Math.abs(a - centre) - Math.abs(b - centre));
  };
  const other = drawn === "fifth" ? "tonic" : "fifth";

  /**
   * A STRING IS TUNED ONCE AND THAT IS ITS PITCH.
   *
   * The seat is chosen for the whole material, not hunted for at each pluck.
   * A string that goes looking for a free pitch every time it is struck is
   * not a string, and it climbs: with its own tone still ringing it takes the
   * octave above, and the octave above the drone's register is the only one
   * the keys have for that tone, so the pad had nowhere to stand. A tanpura
   * has no such problem because its strings do not move.
   *
   * Two strings named alike ARE alike — the tanpura's two middle strings are
   * both Sa, the same pitch, plucked at different points in the turn.
   */
  const seats = new Map<string, number>();
  const held = (q: number): boolean => {
    for (let bar = 0; bar < bars; bar++) if (sounding.holds(bar, 0, q)) return true;
    return false;
  };
  const tuneTo = (name: string): number | undefined => {
    const mine = seats.get(name);
    if (mine !== undefined) return mine;
    const taken = new Set(seats.values());
    // the deep string is an octave UNDER the others and nowhere else: a low
    // string that cannot go low has no reason to exist, and letting it settle
    // for a high seat is how the drone ended up at the top of its register
    const base = seats.get("tonic") ?? seats.get(drawn);
    const wants = name === "low"
      ? octavesOf(drawn).filter((p) => base === undefined || p < base).sort((a, b) => a - b)
      : name === "fifth"
      ? [...octavesOf("fifth"), ...octavesOf(other), ...octavesOf(drawn)]
      : [...octavesOf(drawn), ...octavesOf(other)];
    const free = wants.find((q) => !taken.has(q) && !held(q));
    if (free !== undefined) seats.set(name, free);
    return free;
  };

  // EVERY STRING IS TUNED BEFORE THE FIRST IS STRUCK. A string that turns out
  // to have nowhere of its own to stand — the deep string in a register with
  // no octave under it — is not on the instrument at all, so the turn is
  // taken by the strings that exist. Leaving its place in the cycle empty is
  // how a drone-only bar came out silent.
  const strings = rng.weighted("strings", D.strings).filter((s) => tuneTo(s) !== undefined);
  if (strings.length === 0) {
    throw new Error(
      `drone: no tonic and no fifth in ${lo}..${hi} is free anywhere — ` +
        `the drone's register has nowhere of its own to stand`,
    );
  }
  const every = Math.max(1, D.pluck.every);
  const rest = Math.max(0, D.pluck.rest);
  /**
   * One turn of the cycle: every string once at `every` bars apart, and then
   * the pause that closes it, which is however much of the genre's hold is
   * left over — at least `rest`. So `hold` says how often a given string
   * comes round again, which is what it always meant.
   */
  const turn = Math.max(hold, strings.length * every + rest);

  /** The bars this turn strikes, and which string takes each. */
  const struck: { bar: number; seat: number }[] = [];
  for (let bar = 0; bar < bars; bar++) {
    const at = bar % turn;
    if (at % every !== 0) continue;
    const which = at / every;
    if (which >= strings.length) continue;   // the pause that closes the turn
    struck.push({ bar, seat: seats.get(strings[which]!)! });
  }

  const out: Note[] = [];
  let prev: number | null = null;
  for (const [i, { bar, seat }] of struck.entries()) {
    // A STRING RINGS UNTIL IT IS PLUCKED AGAIN. That is what a plucked string
    // does — nothing damps it in between — and it is why the pause that closes
    // the turn is a pause in the PLUCKING and not a hole in the sound. Ringing
    // for a fixed length instead left bars with no drone in them at all, which
    // is a drone stopping for no reason.
    let until = bars;
    for (let k = i + 1; k < struck.length; k++) {
      if (struck[k]!.seat === seat) { until = struck[k]!.bar; break; }
    }
    const art = manner(rng.at("bar", bar), "art", D.art, {
      strong: true,
      dur: (until - bar) * steps,
      from: prev === null ? null : seat - prev,
    });
    out.push({ bar, step: 0, dur: (until - bar) * steps, pitch: seat, vel: DRONE_WEIGHT, art });
    prev = seat;
  }
  if (out.length === 0) {
    throw new Error(
      `drone: no tonic and no fifth in ${lo}..${hi} is free anywhere — ` +
        `the drone's register has nowhere of its own to stand`,
    );
  }
  return out;
}
