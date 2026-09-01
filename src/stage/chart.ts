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
import type { Genre } from "../genre/spec.ts";

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

  return Object.freeze({
    seed,
    genre,
    tonicPc,
    tonic: TONIC_OCTAVE + tonicPc,
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
