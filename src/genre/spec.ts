/**
 * What a genre is, as a type.
 *
 * Two shapes, deliberately not one:
 *
 *   GenreSpec   what an author writes. Everything but the name is optional,
 *               and a genre may build on another.
 *   Genre       what the program reads. Every field present, every value
 *               final, frozen. Nothing downstream ever sees `undefined` and
 *               nothing downstream applies a default.
 *
 * Keeping them apart is the point. When a default lives at the place a value
 * is *read*, the same field ends up with several defaults in several readers
 * and no one can answer "what is this genre's value" without reading all of
 * them. Resolving once, up front, makes the answer a fact you can print.
 *
 * A FIELD ENTERS THIS FILE WHEN A READER EXISTS FOR IT — never in advance of
 * one. A declared field nothing reads is invisible, and invisible config is
 * what rots.
 */

import type { Weighted } from "../core/rng.ts";
import type { Metre } from "../core/clock.ts";
import type { ScaleName } from "../core/theory.ts";

/**
 * The parts a record can have.
 *
 * A union rather than a string: naming a part that does not exist is a
 * compile error, not something found by rendering sixteen seeds and noticing
 * the silence.
 */
export const ROLES = [
  "drums",
  "bass",
  "keys",
  "keys2",
  "lead",
  "counter",
  "ostinato",
  "drone",
] as const;

export type Role = (typeof ROLES)[number];

export const isRole = (s: string): s is Role => (ROLES as readonly string[]).includes(s);

/**
 * Where a number came from, keyed by the field it justifies.
 *
 * Data, not prose, and not attached to the value — so it can be checked. A key
 * naming a field the genre does not have is an error at load, which is what
 * stops a citation outliving the number it was written for.
 */
export type Sources = Readonly<Record<string, string>>;

/** What an author writes. */
export interface GenreSpec {
  /** How this genre is named on screen. */
  readonly label: string;

  /** Build on another genre, overriding only what differs. Deep. */
  readonly extend?: string;

  /** Drawn per song, inclusive of both ends. */
  readonly tempo?: readonly [number, number];

  /** How a bar is divided. */
  readonly metre?: Metre;

  /** The scales a song may stand in, by weight. */
  readonly scales?: Weighted<ScaleName>;

  /** How long a record runs when nobody asks for a length, in seconds. */
  readonly lengthSec?: readonly [number, number];

  /** Field path -> where its value came from. */
  readonly sources?: Sources;
}

/** What the program reads. Every field final. */
export interface Genre {
  readonly name: string;
  readonly label: string;
  readonly tempo: readonly [number, number];
  readonly metre: Metre;
  readonly scales: Weighted<ScaleName>;
  readonly lengthSec: readonly [number, number];
  readonly sources: Sources;
}

/**
 * The one place a default lives.
 *
 * A genre that declares nothing gets these, and they are stated once so that
 * "what does this genre do about X" is answerable from the resolved table
 * alone.
 */
export const DEFAULTS: Omit<Genre, "name" | "label" | "sources"> = {
  tempo: [90, 120],
  metre: { beats: 4, perBeat: 4 },
  scales: [
    ["minor", 3],
    ["major", 2],
    ["dorian", 1],
  ],
  lengthSec: [180, 240],
};

/** The fields a `sources` key may name. Anything else is a stale citation. */
export const CITABLE = ["tempo", "metre", "scales", "lengthSec"] as const;
