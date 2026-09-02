/**
 * The drone: one long tone the record stands on.
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
  const [lo, hi] = D.register;
  const drawn = rng.weighted("tone", D.tone);
  const hold = Math.min(bars, rng.weighted("hold", D.hold));

  // Every octave of a tone that the register holds, nearest the middle first:
  // the same tone an octave away is still the same tone, so a seat another
  // part already holds is simply the next one down the list. The tone drawn
  // is tried first and the other one after it — tonic and fifth are both
  // drones, and taking the one that is free beats taking nothing.
  const centre = (lo + hi) / 2;
  const octavesOf = (tone: string): number[] => {
    const out: number[] = [];
    for (let p = intoBand(chart.tonic + (tone === "fifth" ? 7 : 0), lo, lo + 11); p <= hi; p += 12) out.push(p);
    return out.sort((a, b) => Math.abs(a - centre) - Math.abs(b - centre));
  };
  const choices = [...octavesOf(drawn), ...octavesOf(drawn === "fifth" ? "tonic" : "fifth")];

  const out: Note[] = [];
  let prev: number | null = null;
  for (let bar = 0; bar < bars; bar += hold) {
    const free = choices.find((p) => !sounding.holds(bar, 0, p));
    if (free === undefined) {
      throw new Error(
        `drone: no tonic and no fifth in ${lo}..${hi} is free at bar ${bar} — ` +
          `the drone's register has nowhere of its own to stand`,
      );
    }
    // a drone is one long note after another; how it is held, and whether it
    // is slurred into from the one before, is all the manner it has
    const art = manner(rng.at("bar", bar), "art", D.art, {
      strong: true,
      dur: hold * steps,
      from: prev === null ? null : free - prev,
    });
    out.push({ bar, step: 0, dur: hold * steps, pitch: free, vel: DRONE_WEIGHT, art });
    prev = free;
  }
  return out;
}

