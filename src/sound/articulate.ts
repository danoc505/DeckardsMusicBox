/**
 * A manner, made audible.
 *
 * The voices render a note struck plain, once, at its own pitch — and that is
 * all they should ever have to know. Everything a player does TO a note is
 * done here, to the buffer the voice handed back, so a manner costs six
 * voices nothing and works the same on all of them.
 *
 * Four things happen, in the order a player does them:
 *
 *   STRUCK, once or many times. Tremolo picking is not a different note, it
 *   is the same note struck again before it has died, so it is rendered short
 *   and laid down `strikes` times. Each copy keeps its own attack and rings
 *   into the next, which is what the technique sounds like.
 *
 *   REACHED, from below or bent away. The pitch is a rate: a buffer rendered
 *   at the target and read back at 2^(d/12) samples per sample sounds d
 *   semitones away, so a glide is a read position that accelerates. That is
 *   what a string does — the whole spectrum moves together, formants and all,
 *   because the string itself got shorter.
 *
 *   SOFTENED at the head. "A hammer-on removes the sound of the pick attack,
 *   yielding a softer, more rounded tone" (en.wikipedia.org/wiki/Hammer-on).
 *   The transient of a plucked or struck note is the first few milliseconds,
 *   so the head is scaled down and let back up over PICK_SEC.
 *
 *   DAMPED, with a palm across the strings: a lowpass, which is what a hand
 *   on a bridge physically is.
 *
 * All of it is arithmetic on the buffer, so a note with a manner is still a
 * note that can be rendered once and used wherever it recurs.
 */

import type { Art } from "../core/articulation.ts";
import { Biquad, fade } from "./dsp.ts";
import type { NoteIn } from "./voices.ts";

/** How long a pick or hammer transient lasts, and so how long a slur has to hide. */
const PICK_SEC = 0.014;

/** Where a fully damped note's top end stops. A palm mute, not a blanket. */
const DAMP_HZ = 760;

/** No manner reaches further than an octave; it bounds how much slower a glide can read. */
const MAX_REACH = 12;

/**
 * Render one note in one manner.
 *
 * `voice` is asked for the note it already knows how to make — plain, at
 * pitch, at the length it is given. Everything after that is this function's.
 *
 * The manner's HOLD and WEIGH are not applied here: how long a note sounds
 * and what it weighs are facts about the performance, settled when the event
 * was placed, and they are already in `heldSec` and `gain`. What is left is
 * only what changes the SOUND of the note, which is what the cache keys on.
 */
export function articulate(voice: (n: NoteIn) => Float32Array, n: NoteIn, a: Art): Float32Array {
  const sr = n.sampleRate;
  const sounds = Math.max(1 / sr, n.heldSec);
  const strikes = Math.max(1, Math.round(a.strikes));

  let buf: Float32Array;
  if (strikes === 1) {
    buf = voice({ ...n, heldSec: sounds });
  } else {
    // struck again before it has died: one short note, laid down over and
    // over, each ringing into the ones after it
    const gapSec = sounds / strikes;
    const one = voice({ ...n, heldSec: gapSec });
    const gap = Math.max(1, Math.round(gapSec * sr));
    buf = new Float32Array(gap * (strikes - 1) + one.length);
    for (let s = 0; s < strikes; s++) {
      const at = s * gap;
      for (let i = 0; i < one.length; i++) buf[at + i] = buf[at + i]! + one[i]!;
    }
    // A NOTE STRUCK FASTER IS NOT A LOUDER NOTE. Each strike rings into the
    // ones after it, so the copies sum above where one of them peaked; a
    // player picking twice as fast is not playing twice as hard, so the sum
    // is brought back to the peak of a single strike.
    let loudest = 0;
    for (const v of buf) if (Math.abs(v) > loudest) loudest = Math.abs(v);
    let alone = 0;
    for (const v of one) if (Math.abs(v) > alone) alone = Math.abs(v);
    if (loudest > alone && alone > 0) {
      const k = alone / loudest;
      for (let i = 0; i < buf.length; i++) buf[i] = buf[i]! * k;
    }
  }

  if (a.from !== 0 || a.bend !== 0) buf = reach(buf, a, sr);
  if (a.attack !== 1) soften(buf, a.attack, sr);
  if (a.damp > 0) buf = damp(buf, a.damp, sr);
  return buf;
}

/**
 * The pitch travels. `d(t)` is how many semitones from the target the note is
 * at time t: it ARRIVES from `from`, and it BENDS away to `bend`, both over
 * `reachSec`. Reading the buffer at 2^(d/12) samples per output sample plays
 * it at that offset, so the whole gesture is one accumulating read position
 * with a linear interpolation between neighbours.
 */
function reach(buf: Float32Array, a: Art, sr: number): Float32Array {
  const from = Math.max(-MAX_REACH, Math.min(MAX_REACH, a.from));
  const bend = Math.max(-MAX_REACH, Math.min(MAX_REACH, a.bend));
  const reachSamples = Math.max(1, Math.round(a.reachSec * sr));
  // the slowest the read ever goes bounds how much longer the output can be
  const slowest = Math.pow(2, Math.min(0, from, bend) / 12);
  const out = new Float32Array(Math.ceil(buf.length / slowest) + 2);
  let p = 0;
  let i = 0;
  for (; i < out.length; i++) {
    const k = i < reachSamples ? i / reachSamples : 1;
    const d = from * (1 - k) + bend * k;
    const j = Math.floor(p);
    if (j + 1 >= buf.length) break;
    const frac = p - j;
    out[i] = buf[j]! * (1 - frac) + buf[j + 1]! * frac;
    p += Math.pow(2, d / 12);
  }
  return out.subarray(0, i) as Float32Array;
}

/**
 * The head, scaled down and let back up: what is left of a note when it was
 * not struck but hammered. `keep` is how much of the transient survives.
 */
function soften(buf: Float32Array, keep: number, sr: number): void {
  const n = Math.min(buf.length, Math.max(1, Math.round(PICK_SEC * sr)));
  for (let i = 0; i < n; i++) buf[i] = buf[i]! * (keep + (1 - keep) * (i / n));
}

/** A palm across the strings: the top end goes, and the note goes with it. */
function damp(buf: Float32Array, amount: number, sr: number): Float32Array {
  const hz = 12000 * Math.pow(DAMP_HZ / 12000, amount);
  const lp = new Biquad("lowpass", hz, 0.7, sr);
  const out = new Float32Array(buf.length);
  for (let i = 0; i < buf.length; i++) out[i] = lp.run(buf[i]!);
  return fade(out, sr);
}
