/**
 * THE ARPEGGIO — a texture, not a job.
 *
 * "A type of chord in which the notes that compose a chord are individually
 * sounded in a progressive rising or descending order"
 * (en.wikipedia.org/wiki/Arpeggio). The chord is already there; this is the
 * order it is spilled in. It is written against the SAME signature every seat
 * is given — chart, chords, a register, what is sounding — so any part can
 * take it, and it does not know which part it is: a keys seat arpeggiating is
 * the Pad element spilled, a counter seat arpeggiating is the Rhythm element
 * ("any instrument that plays counter to the Foundation"), and the notes are
 * the same notes. Which job it is doing is the arrangement's to say.
 *
 * The three controls are an arpeggiator's own: "'up,' 'down,' and 'up and
 * down' modes, with a random mode usually thrown in for good measure", and an
 * octave range where "notes held will leap up or down to higher or lower
 * octaves according to the notes held and specified pattern"
 * (soundbridge.io/arpeggiator). THE OCTAVES ARE THE SEAT'S, NOT STATED:
 * Wikipedia's own example runs two — "C, E, G, C, E, G, C" — and how many a
 * seat can afford is a fact about its register. A band fourteen semitones
 * wide gets one and cannot be argued into two.
 */

import type { Rng } from "../../core/rng.ts";
import { intoBand } from "../../core/theory.ts";
import type { ArpPattern, Register } from "../../genre/spec.ts";
import type { Chart } from "../chart.ts";
import type { Chord, Note, Sounding } from "./note.ts";

/** An arpeggiated note is neither the tune nor the groove: between the two in weight. */
const ARP_WEIGHT = 0.66;

export function drawArp(
  chart: Chart,
  chords: readonly Chord[],
  register: Register,
  rng: Rng,
  steps: number,
  bars: number,
  sounding: Sounding,
): Note[] {
  const [lo, hi] = register;
  const R = chart.genre.arp;
  const pattern: ArpPattern = rng.weighted("pattern", R.pattern);
  // the rate is stated in BEATS so a genre in five four needs no new number,
  // and resolved here against this record's own grid
  const rate = Math.max(1, Math.round(rng.weighted("every", R.every) * chart.metre.perBeat));
  const out: Note[] = [];
  let k = 0;
  for (let bar = 0; bar < bars; bar++) {
    const chord = chords[bar % chords.length]!;
    // every octave of every chord tone the band admits, ascending: the ladder
    // the pattern walks, as many rungs as the register holds
    const ladder: number[] = [];
    for (const t of chord.tones) for (let p = intoBand(t, lo, lo + 11); p <= hi; p += 12) ladder.push(p);
    ladder.sort((a, b) => a - b);
    if (ladder.length === 0) continue;
    const order = pattern === "down" ? [...ladder].reverse()
      : pattern === "updown" ? [...ladder, ...[...ladder].reverse().slice(1, -1)]
      : ladder;
    for (let step = 0; step < steps; step += rate, k++) {
      // random re-picks every note, as an arpeggiator's random mode does; a
      // ladder shuffled once and repeated would just be a fifth pattern
      const pitch = pattern === "random"
        ? rng.at("arp", bar * steps + step).pick("pick", order)
        : order[k % order.length]!;
      // a seat another part holds at this instant is not offered — the law
      // every builder here keeps, and the reason this can be handed to any
      // part without the parts landing on each other
      if (sounding.holds(bar, step, pitch)) continue;
      out.push({ bar, step, dur: rate, pitch, vel: ARP_WEIGHT });
    }
  }
  return out;
}
