/**
 * Stage 1 — THE CHART.
 *
 * Everything the rest of the record is built against and nothing else: what
 * key it is in, what scale, how fast, in what metre, and how long. No notes,
 * no sections, no instruments.
 *
 * Every draw is addressed, so a decision added here later cannot move one made
 * here today — `at("tempo")` is `at("tempo")` whatever else is drawn beside it.
 */

import { barsForSec, type Metre } from "../core/clock.ts";
import { rng, type Rng } from "../core/rng.ts";
import { NOTE_NAMES, SCALES, pc, type Scale, type ScaleName } from "../core/theory.ts";
import type { Genre, Register, Role } from "../genre/spec.ts";

/**
 * The octave the tonic is placed in.
 *
 * `theory` counts degrees from an absolute pitch, so a key needs a register to
 * be counted from. C3 is low enough that a bass sits under it without leaving
 * hearing and high enough that a tune sits above it without leaving the
 * keyboard. Parts move it into their own band; nothing plays at this octave
 * because it is the tonic's address, not a note.
 */
export const TONIC_OCTAVE = 48;

export interface Chart {
  readonly seed: number;
  readonly genre: Genre;

  /** 0..11. */
  readonly tonicPc: number;
  /** The tonic as an absolute pitch, which is what `theory` counts from. */
  readonly tonic: number;
  /**
   * HOW FAR THIS RECORD SITS FROM THE GENRE'S OWN OCTAVE, in semitones.
   *
   * The key was drawn per record and the OCTAVE never was. `TONIC_OCTAVE` is
   * one module constant for every genre and every seed, and every part's
   * register is an absolute band that folds the tones back into it — so a
   * record in G# and a record in D sat on exactly the same pitches. Measured
   * over twelve seeds a genre: seven and eight distinct tonics, and a lowest
   * note that moved four semitones in lofi and six in dungeon synth. Every
   * record in the same lane.
   *
   * Nothing chose that. In music the octave is usually fixed by an instrument
   * or a voice — "if working with real instruments or vocalists, their range
   * often dictates what key a song will be in" — and a program with neither
   * inherits a constraint it does not have. What it loses by inheriting it is
   * an expressive axis the sources are explicit about: the same melody "in a
   * high register can feel bright or tense" and "in a low register can feel
   * heavy or subdued" (organology.net, octaves-and-registers).
   *
   * So a genre states the offsets it may sit at and the record draws one. It
   * moves the tonic AND every part's register together, which is the only way
   * it can move anything: shifting the tonic alone leaves `intoBand` folding
   * the tones straight back into the same absolute band.
   */
  readonly shift: number;
  /** The genre's registers, moved to where this record sits. Parts read these, never the genre's. */
  readonly register: Readonly<Record<Role, Register>>;
  readonly scaleName: ScaleName;
  readonly scale: Scale;

  readonly tempo: number;
  readonly metre: Metre;

  /**
   * How many bars the record is AIMING at.
   *
   * Not how many it has — a form is built out of whole sections and lands
   * within half of one either side. The stage that knows the real length is
   * the stage that lays out the sections, and that is also the stage that owns
   * the clock. Building a clock here would mean building it against a number
   * that is about to change.
   */
  readonly targetBars: number;

  /** What was asked for, or null when the genre decided. */
  readonly askedSec: number | null;
  /** The length the target came from, in seconds. */
  readonly targetSec: number;

  /** Rooted at this song. Every later stage draws below it. */
  readonly rng: Rng;
}

export interface ChartRequest {
  readonly seed: number;
  readonly genre: Genre;
  /** Ask for a length in seconds; omit to let the genre decide. */
  readonly seconds?: number;
}

export function makeChart(req: ChartRequest): Chart {
  const { seed, genre } = req;
  const root = rng(seed, genre.name);
  const draw = root.at("chart");

  const tonicPc = draw.int("key", 0, 11);
  const scaleName = draw.weighted("scale", genre.scales);
  const scale = SCALES[scaleName];

  // one decimal: nobody hears a hundredth of a beat per minute, and a tidy
  // number is easier to read in a dump and to write into a MIDI tempo event
  const tempo = Math.round(draw.range("tempo", genre.tempo[0], genre.tempo[1]) * 10) / 10;

  const askedSec = req.seconds ?? null;
  // the genre's own answer is drawn whether or not it is used, so asking for a
  // length cannot change anything else about the record
  const genreSec = draw.range("length", genre.lengthSec[0], genre.lengthSec[1]);
  const wantSec = askedSec ?? genreSec;

  const metre = genre.metre;
  const shift = draw.weighted("shift", genre.shift);
  /** A band moved with the record, and never past what a MIDI pitch can be. */
  const moved = (r: Register): Register =>
    [Math.max(0, r[0] + shift), Math.min(127, r[1] + shift)] as const;

  return Object.freeze({
    seed,
    genre,
    // THE SHIFT MOVES THE KEY AS WELL AS THE REGISTER, and the pitch class has
    // to follow it or the chart reports a key the record is not in. A record
    // shifted down two semitones from A IS in G, and `pc(tonic)` is the only
    // honest answer to "what key is this". `theory` counts every degree from
    // `tonic`, so nothing downstream needs to know a shift happened.
    tonicPc: pc(TONIC_OCTAVE + tonicPc + shift),
    tonic: TONIC_OCTAVE + tonicPc + shift,
    shift,
    register: Object.freeze({
      // the kit has no pitch, so nothing reads this; it is here because the
      // type is one entry per part and a missing one would be a silent hole
      drums: moved(genre.bass.register),
      bass: moved(genre.bass.register),
      keys: moved(genre.keys.register),
      lead: moved(genre.lead.register),
      drone: moved(genre.drone.register),
    }),
    scaleName,
    scale,
    tempo,
    metre,
    targetBars: barsForSec(wantSec, tempo, metre),
    askedSec,
    targetSec: wantSec,
    rng: root,
  });
}

/**
 * "C# minor · 78 bpm · 4 beats on 16ths · 73 bars" — for a dump header.
 *
 * Not written as a time signature: `Metre` holds how a bar is divided for the
 * grid, and a time signature's lower number is the beat unit, which is a
 * different fact this does not carry. Printing "4/4" from `perBeat` would be
 * right by coincidence in four-four and wrong everywhere else.
 */
export function describeChart(c: Chart): string {
  const key = `${NOTE_NAMES[pc(c.tonicPc)]} ${c.scaleName}`;
  const grid =
    c.metre.perBeat === 4 ? "16ths" : c.metre.perBeat === 3 ? "triplets" : `1/${c.metre.perBeat} beats`;
  return `${key} · ${c.tempo} bpm · ${c.metre.beats} beats on ${grid} · aiming at ${c.targetBars} bars`;
}
