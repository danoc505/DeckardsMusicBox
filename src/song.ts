/**
 * The pipeline. Five stages, each a pure function of the one before, each
 * frozen on the way out.
 *
 *   chart        key, scale, tempo, metre, how long
 *   form         which sections, in what order, how big
 *   arrangement  which material each section plays, and which parts are heard
 *   materials    every note — only what the arrangement will have heard
 *   performance  seconds, and how hard
 */

import type { Edit } from "./core/rng.ts";
import { genre as genreOf, type GenreName } from "./genre/index.ts";
import type { Genre } from "./genre/spec.ts";
import { makeArrangement, type Arrangement } from "./stage/arrange.ts";
import { makeChart, type Chart } from "./stage/chart.ts";
import { makeForm, type Form } from "./stage/form.ts";
import { makeMaterials, type Materials } from "./stage/material/index.ts";
import { makePerformance, type Performance } from "./stage/perform.ts";

export interface Song {
  readonly chart: Chart;
  readonly form: Form;
  readonly arrangement: Arrangement;
  readonly materials: Materials;
  readonly performance: Performance;
}

export interface Request {
  readonly seed: number;
  readonly genre: GenreName | Genre;
  /** Ask for a length in seconds; omit to let the genre decide. */
  readonly seconds?: number;
  /**
   * Rerolls, in the order they were made: each salts every draw at or under
   * one address of the record. `src/edit.ts` turns a selection on the roll
   * into these; the chart carries them and the dump prints them. Omit, or
   * pass an empty list, for the record as the seed alone makes it.
   */
  readonly edits?: readonly Edit[];
}

export function compose(req: Request): Song {
  const genre = typeof req.genre === "string" ? genreOf(req.genre) : req.genre;
  const chart = makeChart({
    seed: req.seed,
    genre,
    ...(req.seconds === undefined ? {} : { seconds: req.seconds }),
    ...(req.edits === undefined ? {} : { edits: req.edits }),
  });
  const form = makeForm(chart);
  const arrangement = makeArrangement(chart, form);
  const materials = makeMaterials(chart, arrangement);
  const performance = makePerformance(chart, form, materials, arrangement);
  return Object.freeze({ chart, form, arrangement, materials, performance });
}
