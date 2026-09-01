/**
 * The genres, resolved at load.
 *
 * `resolveAll` runs when this module is first imported, so a table with a bad
 * range, a scale that does not exist, or a citation naming a field that is not
 * there stops the program at start-up rather than producing a record and
 * leaving somebody to notice by ear.
 */

import { resolveAll } from "./resolve.ts";
import type { Genre, GenreSpec } from "./spec.ts";
import { dungeonsynth } from "./dungeonsynth.ts";
import { lofi } from "./lofi.ts";

export const SPECS = {
  lofi,
  dungeonsynth,
} as const satisfies Record<string, GenreSpec>;

export type GenreName = keyof typeof SPECS;

export const GENRES: Readonly<Record<GenreName, Genre>> = resolveAll(SPECS) as Readonly<
  Record<GenreName, Genre>
>;

export const GENRE_NAMES = Object.keys(GENRES) as GenreName[];

export function genre(name: GenreName): Genre {
  const g = GENRES[name];
  if (!g) throw new Error(`no genre "${name}"`);
  return g;
}

export type { Genre, GenreSpec, Role } from "./spec.ts";
export { ROLES, isRole } from "./spec.ts";
export { GenreError, resolveGenre, resolveAll } from "./resolve.ts";
