/**
 * THE RECORD AS A STANDARD MIDI FILE — the same events the renderer plays,
 * written as a type 1 SMF that opens in any sequencer.
 *
 * Ported from MK2, which had it and MKIII did not. It is not a debug view:
 * the notes ARE the program's output and the audio is one interpretation of
 * them, so a .mid is the way to judge the music without trusting this file's
 * own synth at all. Every claim this program makes about repetition, about a
 * figure coming back changed, about where a part sits against the beat, is
 * checkable in a piano roll that is not ours.
 *
 * IT CARRIES THE MICRO-TIMING, which is most of the point. A part that sits
 * eighteen milliseconds behind the beat sits eighteen milliseconds behind it
 * in the file; quantising on the way out would throw away the one thing the
 * feel is made of. At 960 ticks a quarter, a millisecond at 80 bpm is about
 * 1.3 ticks, so nothing that matters is lost to rounding.
 *
 * A TICK IS A MUSICAL POSITION, NOT A TIME. Converting seconds to ticks by
 * `sec * bpm / 60 * PPQ` reads one tempo backwards out of the seconds, which
 * is right for a record with one tempo and wrong the moment it has two: a bar
 * played slower arrives at fewer ticks, so a sequencer reading the conductor
 * track places it EARLY and then plays it at the written tempo, moving the
 * note twice. The clock knows which BAR a second falls in, which is the
 * position a tick actually measures, so the conversion goes through it. MKIII
 * has no tempo map yet and this is still how it is written, because the day
 * it has one is not the day to discover this.
 */

import type { Clock } from "../core/clock.ts";
import type { Role } from "../genre/spec.ts";
import type { Song } from "../song.ts";

/** Ticks per quarter note. 960 is the resolution most sequencers work in. */
const PPQ = 960;

/**
 * General MIDI level 1 percussion keys, so a drum track reads correctly on
 * any device. A lane with no name here returns null and is not written — a
 * silent drop is worse than an obvious absence, so the count below is what
 * catches it.
 */
const GM_DRUM: Readonly<Record<string, number>> = Object.freeze({
  kick: 36,     // bass drum 1
  snare: 38,    // acoustic snare
  hat: 42,      // closed hi-hat
  openhat: 46,  // open hi-hat
});

/**
 * One track per part. The programs are ADVISORY — a hint for whoever opens
 * the file, never something this program's own sound depends on. Which voice
 * a genre actually plays a part on is the genre's business and is written
 * into the track name, so a reader can see both.
 */
const TRACKS: Readonly<Record<Role, { readonly ch: number; readonly prog: number }>> = Object.freeze({
  drums: { ch: 9, prog: 0 },   // channel 10, the GM percussion channel
  bass: { ch: 0, prog: 38 },   // synth bass 1
  keys: { ch: 1, prog: 4 },    // electric piano 1
  lead: { ch: 2, prog: 81 },   // lead 2 (sawtooth)
  counter: { ch: 4, prog: 5 }, // electric piano 2
  drone: { ch: 3, prog: 89 },  // pad 2 (warm)
});

/** A variable-length quantity: seven bits at a time, high bit set on all but the last. */
function vlq(n: number): number[] {
  const out = [n & 0x7f];
  let left = n >> 7;
  while (left > 0) {
    out.unshift((left & 0x7f) | 0x80);
    left >>= 7;
  }
  return out;
}

const bytes = (s: string): number[] => [...s].map((c) => c.charCodeAt(0) & 0x7f);

function chunk(id: string, body: readonly number[]): number[] {
  const n = body.length;
  return [...bytes(id), (n >> 24) & 255, (n >> 16) & 255, (n >> 8) & 255, n & 255, ...body];
}

/** Which key a note is, or null for a lane this file cannot name. */
function keyOf(e: { role: Role; lane: string; pitch: number | null }): number | null {
  if (e.role === "drums") return GM_DRUM[e.lane] ?? null;
  return e.pitch;
}

/**
 * 0..1.25 becomes 1..127. The scale is the same one the renderer uses, so a
 * ghost note reads as a ghost note in the file: at 0.4 of full weight it
 * arrives at 40 of 127, which is where the programming guides put one.
 */
const velOf = (gain: number): number => Math.max(1, Math.min(127, Math.round(gain * 100)));

export interface MidiOptions {
  /** Only this part, for reading one line on its own. */
  readonly only?: Role;
}

/** The record as the bytes of a .mid file. */
export function midi(song: Song, opts: MidiOptions = {}): Uint8Array {
  const clock: Clock = song.form.clock;
  const beats = song.chart.metre.beats;
  // through the clock, so a record that one day has a tempo map is right
  const tick = (sec: number): number => Math.round(clock.barAt(sec) * beats * PPQ);

  const tracks: number[][] = [];

  // ── track 0, the conductor: what this file is, how fast, and in what ──
  {
    let b: number[] = [];
    const meta = (delta: number, type: number, data: readonly number[]): void => {
      b = b.concat(vlq(delta), [0xff, type], vlq(data.length), data);
    };
    meta(0, 0x03, bytes(`MKIII ${song.chart.genre.label} seed ${song.chart.seed}`));
    meta(0, 0x51, usPerQuarter(clock.tempoAt(0)));
    // the metre as the format wants it: numerator, log2 of the denominator,
    // clocks per metronome tick, thirty-seconds per quarter
    meta(0, 0x58, [beats, log2(song.chart.metre.perBeat === 4 ? 4 : song.chart.metre.perBeat), 24, 8]);
    meta(0, 0x59, [0, song.chart.scaleName.includes("minor") ? 1 : 0]);
    // AND THE TEMPO CHANGES, if the record has any. One meta at each bar whose
    // tempo differs from the bar before it, each delta measured from the last
    // meta written. A steady record writes none of these.
    let at = 0;
    if (clock.varies) {
      for (let bar = 1; bar < clock.bars; bar++) {
        if (Math.abs(clock.tempoAt(bar) - clock.tempoAt(bar - 1)) < 1e-9) continue;
        const t = bar * beats * PPQ;
        meta(t - at, 0x51, usPerQuarter(clock.tempoAt(bar)));
        at = t;
      }
    }
    b = b.concat(vlq(0), [0xff, 0x2f, 0x00]);
    tracks.push(b);
  }

  // ── one track per part that plays ──
  const byRole = new Map<Role, typeof song.performance.events[number][]>();
  for (const e of song.performance.events) {
    if (opts.only !== undefined && e.role !== opts.only) continue;
    (byRole.get(e.role) ?? byRole.set(e.role, []).get(e.role)!).push(e);
  }

  for (const role of Object.keys(TRACKS) as Role[]) {
    const evs = byRole.get(role);
    if (evs === undefined || evs.length === 0) continue;
    const T = TRACKS[role];
    const voice = role === "drums" ? "kit" : song.chart.genre.sound.voices[role];
    const name = `${role} (${voice})`;

    // every note becomes an on and an off; sorted by tick, and offs before ons
    // at the same instant so a repeated pitch retriggers instead of cancelling
    const msgs: { t: number; order: number; b: number[] }[] = [];
    for (const e of evs) {
      const key = keyOf(e);
      if (key === null) continue;
      const on = tick(e.tSec);
      const off = Math.max(on + 1, tick(e.tSec + e.durSec));
      msgs.push({ t: on, order: 1, b: [0x90 | T.ch, key, velOf(e.gain)] });
      msgs.push({ t: off, order: 0, b: [0x80 | T.ch, key, 64] });
    }
    msgs.sort((a, z) => a.t - z.t || a.order - z.order);

    let b: number[] = vlq(0).concat([0xff, 0x03], vlq(name.length), bytes(name));
    if (role !== "drums") b = b.concat(vlq(0), [0xc0 | T.ch, T.prog]);
    let last = 0;
    for (const m of msgs) {
      b = b.concat(vlq(m.t - last), m.b);
      last = m.t;
    }
    b = b.concat(vlq(0), [0xff, 0x2f, 0x00]);
    tracks.push(b);
  }

  const head = chunk("MThd", [
    0, 1,                                        // format 1: several tracks, one song
    (tracks.length >> 8) & 255, tracks.length & 255,
    (PPQ >> 8) & 255, PPQ & 255,
  ]);
  let all = head;
  for (const t of tracks) all = all.concat(chunk("MTrk", t));
  return new Uint8Array(all);
}

const usPerQuarter = (bpm: number): number[] => {
  const us = Math.round(60000000 / bpm);
  return [(us >> 16) & 255, (us >> 8) & 255, us & 255];
};

const log2 = (n: number): number => Math.round(Math.log2(n));

/** How many notes the file carries, per part: what a reader should find in it. */
export function midiCounts(song: Song): ReadonlyMap<Role, number> {
  const out = new Map<Role, number>();
  for (const e of song.performance.events) {
    if (keyOf(e) === null) continue;
    out.set(e.role, (out.get(e.role) ?? 0) + 1);
  }
  return out;
}
