/**
 * Turning what an author wrote into what the program reads.
 *
 * One pass: walk the `extend` chain, lay the defaults underneath, check the
 * result, freeze it. Everything after this holds a `Genre` with every field
 * present and no reader anywhere applies a default of its own.
 *
 * A genre that does not survive the checks does not load. Refusing is the
 * point — a table with a bad range in it produces a record nobody asked for,
 * and finding that by ear weeks later is how the old program worked.
 */

import { SCALES } from "../core/theory.ts";
import { CITABLE, DEFAULTS, type Genre, type GenreSpec } from "./spec.ts";

/** Everything wrong with one genre, so a fix is one pass and not twelve. */
export class GenreError extends Error {
  readonly genre: string;
  readonly problems: readonly string[];

  constructor(genre: string, problems: readonly string[]) {
    super(`genre "${genre}" does not load:\n  - ${problems.join("\n  - ")}`);
    this.name = "GenreError";
    this.genre = genre;
    this.problems = problems;
  }
}

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/**
 * Plain objects merge key by key; arrays and everything else replace.
 *
 * Arrays replace because a range and a weighted table are single values that
 * happen to be written as lists — merging `[60, 80]` into `[90, 120]`
 * element-wise, or concatenating one pool onto another, would be answering a
 * question nobody asked. Objects merge because that is what `extend` is for.
 */
function merge<T>(base: T, over: unknown): T {
  if (over === undefined) return base;
  if (isPlainObject(base) && isPlainObject(over)) {
    const out: Record<string, unknown> = { ...base };
    for (const k of Object.keys(over)) out[k] = merge(out[k], over[k]);
    return out as T;
  }
  return over as T;
}

/** The chain from the deepest base up to this genre, oldest first. */
function lineage(name: string, all: Readonly<Record<string, GenreSpec>>): GenreSpec[] {
  const chain: GenreSpec[] = [];
  const seen: string[] = [];
  let at: string | undefined = name;
  while (at !== undefined) {
    if (seen.includes(at)) {
      throw new GenreError(name, [`extends itself: ${[...seen, at].join(" -> ")}`]);
    }
    seen.push(at);
    const spec: GenreSpec | undefined = all[at];
    if (spec === undefined) {
      throw new GenreError(name, [`extends "${at}", which is not a genre`]);
    }
    chain.unshift(spec);
    at = spec.extend;
  }
  return chain;
}

const finite = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

function checkRange(
  problems: string[],
  field: string,
  v: unknown,
  { min = -Infinity } = {},
): void {
  if (!Array.isArray(v) || v.length !== 2 || !finite(v[0]) || !finite(v[1])) {
    problems.push(`${field} must be two numbers, got ${JSON.stringify(v)}`);
    return;
  }
  const [lo, hi] = v as [number, number];
  if (lo < min) problems.push(`${field} starts at ${lo}, below ${min}`);
  if (hi < lo) problems.push(`${field} runs backwards: ${lo} to ${hi}`);
}

/** Build the readable genre, or refuse and say everything that is wrong. */
export function resolveGenre(
  name: string,
  all: Readonly<Record<string, GenreSpec>>,
): Genre {
  const chain = lineage(name, all);

  let merged = { ...DEFAULTS } as Record<string, unknown>;
  let label = "";
  let sources: Record<string, string> = {};
  for (const spec of chain) {
    const { label: l, extend: _extend, sources: s, ...rest } = spec;
    label = l;
    merged = merge(merged, rest) as Record<string, unknown>;
    // a derived genre may add citations and may correct one it inherited
    if (s) sources = { ...sources, ...s };
  }

  const problems: string[] = [];

  if (typeof label !== "string" || label.trim() === "") {
    problems.push("label is empty");
  }

  checkRange(problems, "tempo", merged["tempo"], { min: 1 });
  checkRange(problems, "lengthSec", merged["lengthSec"], { min: 1 });

  const metre = merged["metre"];
  if (!isPlainObject(metre)) {
    problems.push("metre must be { beats, perBeat }");
  } else {
    for (const k of ["beats", "perBeat"] as const) {
      const v = metre[k];
      if (!finite(v) || !Number.isInteger(v) || v < 1) {
        problems.push(`metre.${k} must be a whole number of at least 1, got ${String(v)}`);
      }
    }
  }

  const scales = merged["scales"];
  if (!Array.isArray(scales) || scales.length === 0) {
    problems.push("scales is empty — a song has to stand in something");
  } else {
    let positive = 0;
    for (const row of scales) {
      if (!Array.isArray(row) || row.length !== 2) {
        problems.push(`scales row is not [name, weight]: ${JSON.stringify(row)}`);
        continue;
      }
      const [n, w] = row as [unknown, unknown];
      if (typeof n !== "string" || !(n in SCALES)) {
        problems.push(`scales names "${String(n)}", which is not a scale`);
      }
      if (!finite(w) || w < 0) problems.push(`scales weight for "${String(n)}" is ${String(w)}`);
      else if (w > 0) positive++;
    }
    if (positive === 0) problems.push("no scale has a weight above zero");
  }

  // a citation that names a field this genre does not have is a citation that
  // outlived its number, which is exactly what goes stale
  for (const key of Object.keys(sources)) {
    if (!(CITABLE as readonly string[]).includes(key)) {
      problems.push(`sources names "${key}", which is not a field that can be cited`);
    }
  }

  if (problems.length > 0) throw new GenreError(name, problems);

  return Object.freeze({
    name,
    label,
    tempo: Object.freeze([...(merged["tempo"] as number[])]) as readonly [number, number],
    metre: Object.freeze({ ...(metre as { beats: number; perBeat: number }) }),
    scales: Object.freeze((scales as [string, number][]).map((r) => Object.freeze([...r]))),
    lengthSec: Object.freeze([...(merged["lengthSec"] as number[])]) as readonly [number, number],
    sources: Object.freeze({ ...sources }),
  }) as Genre;
}

/** Resolve every genre at once, so a broken one is found at load and not at play. */
export function resolveAll(
  all: Readonly<Record<string, GenreSpec>>,
): Readonly<Record<string, Genre>> {
  const out: Record<string, Genre> = {};
  for (const name of Object.keys(all)) out[name] = resolveGenre(name, all);
  return Object.freeze(out);
}
