/**
 * The pipeline. Five stages, each a pure function of the one before, each
 * frozen on the way out.
 *
 *   chart        key, scale, tempo, metre, how long
 *   form         which sections, in what order, how big
 *   materials    every note, once per idea
 *   arrangement  which parts are heard where
 *   performance  seconds, and how hard
 */

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
  readonly materials: Materials;
  readonly arrangement: Arrangement;
  readonly performance: Performance;
}

export interface Request {
  readonly seed: number;
  readonly genre: GenreName | Genre;
  /** Ask for a length in seconds; omit to let the genre decide. */
  readonly seconds?: number;
}

export function compose(req: Request): Song {
  const genre = typeof req.genre === "string" ? genreOf(req.genre) : req.genre;
  const chart = makeChart(req.seconds === undefined ? { seed: req.seed, genre } : { seed: req.seed, genre, seconds: req.seconds });
  const form = makeForm(chart);
  const materials = makeMaterials(chart, form);
  const arrangement = makeArrangement(chart, form, materials);
  const performance = makePerformance(chart, form, materials, arrangement);
  return Object.freeze({ chart, form, materials, arrangement, performance });
}
