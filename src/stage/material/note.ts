/**
 * The units a material is made of.
 *
 * A note is a position on the grid and a pitch. Nothing about seconds, nothing
 * about which instrument, nothing about how hard — those are decided by the
 * stages that turn a material into a performance.
 */

import { PITCHED_ROLES, type Idea, type PitchedRole } from "../../genre/spec.ts";
import type { Figure, Hit } from "./drums.ts";

export type { Figure, Hit } from "./drums.ts";

export interface Note {
  /** Bar within the material, from 0. */
  readonly bar: number;
  /** Grid step within the bar, a whole number. */
  readonly step: number;
  /** Length in grid steps, at least 1. */
  readonly dur: number;
  /** MIDI pitch. */
  readonly pitch: number;
  /** 0..1, the note's own weight before any accent or arc. */
  readonly vel: number;
}

export interface Chord {
  readonly bar: number;
  /** Scale degree from the tonic. */
  readonly degree: number;
  /** The root as a MIDI pitch, in the tonic's own octave. */
  readonly root: number;
  /** Absolute pitches, ascending from the root. */
  readonly tones: readonly number[];
  /** For reading: "Cm7", "F", "G5". */
  readonly name: string;
}

/** Every pitched part a material carries: the roles, minus the drums. One owner. */
export const PITCHED = PITCHED_ROLES;
export type Pitched = PitchedRole;

/** The parts that loop unchanged under everything: the groove. */
export const GROOVE = ["bass", "keys"] as const satisfies readonly Pitched[];
export type GrooveRole = (typeof GROOVE)[number];

export interface Material {
  /** "A" for the plain statement, "A/1" for its first variant. */
  readonly key: string;
  readonly idea: Idea;
  /** 0 for the plain statement, then 1, 2, … for each varied one. */
  readonly variant: number;
  readonly bars: number;
  readonly chords: readonly Chord[];
  /** Bass and keys, the same every time round — a groove is the thing that is allowed to loop. */
  readonly groove: Readonly<Record<GrooveRole, readonly Note[]>>;
  /**
   * The tune, one line per time the lead plays this material through, in
   * the order it plays them: the statement, a restatement, the development,
   * a rest. Exactly as many as the record hears — a material the lead never
   * plays has none.
   */
  readonly lead: readonly (readonly Note[])[];
  /** The drum figure every phrase below is a treatment of; the bass may stand on its kick. */
  readonly figure: Figure;
  /** The drums, one phrase per time they play this material through. */
  readonly drums: readonly (readonly Hit[])[];
}

/** A material is exactly `bars` long; a note that is not in it is a bug. */
export function assertInside(m: { bars: number; steps: number }, n: Note, where: string): void {
  if (!Number.isInteger(n.bar) || n.bar < 0 || n.bar >= m.bars) {
    throw new Error(`${where}: bar ${n.bar} is outside 0..${m.bars - 1}`);
  }
  if (!Number.isInteger(n.step) || n.step < 0 || n.step >= m.steps) {
    throw new Error(`${where}: step ${n.step} is outside 0..${m.steps - 1}`);
  }
  if (!Number.isInteger(n.dur) || n.dur < 1) {
    throw new Error(`${where}: duration ${n.dur} is not a whole number of steps`);
  }
}

export const at = (n: { bar: number; step: number }): string => `${n.bar}:${n.step}`;
