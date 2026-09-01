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
import {
  BASS_TONES, DEFAULTS, IDEAS, SECTION_FNS,
  type Genre, type GenreSpec, type Weighted,
} from "./spec.ts";

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

/**
 * A private copy, all the way down.
 *
 * `merge` returns the base object BY REFERENCE wherever nothing overrode it,
 * so a genre that declares no `form` holds the very same object as `DEFAULTS`.
 * Resolving it then normalises and freezes that shared object and the next
 * genre cannot be resolved at all. Every resolution gets its own copy, so no
 * genre can reach another one's table or the defaults behind both.
 */
function deepClone<T>(v: T): T {
  if (Array.isArray(v)) return v.map(deepClone) as unknown as T;
  if (isPlainObject(v)) {
    const out: Record<string, unknown> = {};
    for (const [k, child] of Object.entries(v)) out[k] = deepClone(child);
    return out as T;
  }
  return v;
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

/**
 * Every field of a resolved genre that a citation may name, DERIVED from the
 * genre itself rather than listed beside it.
 *
 * A hand-kept list of citable fields is the same object as the thing it
 * describes, written twice, and the second copy is always the one that goes
 * stale. Descent stops at arrays: a range and a weighted pool are single
 * values, so `tempo` is citable and `tempo.0` is not.
 */
export function citablePaths(v: unknown, prefix = ""): string[] {
  if (!isPlainObject(v)) return [];
  const out: string[] = [];
  for (const [k, child] of Object.entries(v)) {
    const path = prefix === "" ? k : `${prefix}.${k}`;
    out.push(path);
    out.push(...citablePaths(child, path));
  }
  return out;
}

const finite = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

/** A pool is a list of `[value, weight]`. One bare value is a pool of one. */
function asPool<T>(v: unknown): Weighted<T> | null {
  if (!Array.isArray(v)) return v === undefined ? null : [[v as T, 1]];
  if (v.every((r) => Array.isArray(r) && r.length === 2)) return v as Weighted<T>;
  return null;
}

function checkPool(
  problems: string[],
  field: string,
  pool: unknown,
  okValue: (v: unknown) => boolean,
  what: string,
): void {
  if (!Array.isArray(pool) || pool.length === 0) {
    problems.push(`${field} is empty`);
    return;
  }
  let positive = 0;
  for (const row of pool) {
    if (!Array.isArray(row) || row.length !== 2) {
      problems.push(`${field} row is not [value, weight]: ${JSON.stringify(row)}`);
      continue;
    }
    const [v, w] = row as [unknown, unknown];
    if (!okValue(v)) problems.push(`${field} offers ${JSON.stringify(v)}, which is not ${what}`);
    if (!finite(w) || w < 0) problems.push(`${field} weight for ${JSON.stringify(v)} is ${String(w)}`);
    else if (w > 0) positive++;
  }
  if (positive === 0) problems.push(`${field} has no weight above zero`);
}

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
  // nothing below this line may reach the defaults or another genre's tables
  merged = deepClone(merged);

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

  // ── FORM ────────────────────────────────────────────────────────────────
  // A length may be written as one number or as a pool; readers only ever see
  // a pool, so nothing downstream branches on which way it was written.
  const form = isPlainObject(merged["form"]) ? merged["form"] : null;
  if (form === null) {
    problems.push("form is missing");
  } else {
    const lengths = isPlainObject(form["lengths"]) ? form["lengths"] : {};
    const pools: Record<string, Weighted<number>> = {};
    const idea = isPlainObject(form["idea"]) ? form["idea"] : {};
    const energy = isPlainObject(form["energy"]) ? form["energy"] : {};
    const next = isPlainObject(form["next"]) ? form["next"] : {};

    for (const fn of SECTION_FNS) {
      const pool = asPool<number>(lengths[fn]);
      if (pool === null) {
        problems.push(`form.lengths.${fn} is missing`);
      } else {
        checkPool(problems, `form.lengths.${fn}`, pool,
          (v) => finite(v) && Number.isInteger(v) && v >= 1, "a whole number of bars");
        pools[fn] = pool;
      }

      const id = idea[fn];
      if (typeof id !== "string" || !(IDEAS as readonly string[]).includes(id)) {
        problems.push(`form.idea.${fn} is "${String(id)}", which is not an idea`);
      }

      const e = energy[fn];
      if (!finite(e) || e < 0 || e > 1) {
        problems.push(`form.energy.${fn} must be 0..1, got ${String(e)}`);
      }

      checkPool(problems, `form.next.${fn}`, next[fn],
        (v) => typeof v === "string" && (SECTION_FNS as readonly string[]).includes(v),
        "a section kind");
    }

    const ic = form["introChance"];
    if (!finite(ic) || ic < 0 || ic > 1) {
      problems.push(`form.introChance must be 0..1, got ${String(ic)}`);
    }
    form["lengths"] = pools;
  }

  // ── HARMONY ─────────────────────────────────────────────────────────────
  const harmony = isPlainObject(merged["harmony"]) ? merged["harmony"] : null;
  let materialBars = 4;
  if (harmony === null) {
    problems.push("harmony is missing");
  } else {
    const b = harmony["bars"];
    if (!finite(b) || !Number.isInteger(b) || b < 1 || b > 32) {
      problems.push(`harmony.bars must be a whole number 1..32, got ${String(b)}`);
    } else {
      materialBars = b;
    }
    const progs = isPlainObject(harmony["progressions"]) ? harmony["progressions"] : {};
    for (const idea of IDEAS) {
      checkPool(problems, `harmony.progressions.${idea}`, progs[idea],
        (v) => Array.isArray(v) && v.length >= 1 && v.every((d) => finite(d) && Number.isInteger(d)),
        "a list of whole scale degrees");
      // a progression shorter than the material repeats to fill it, so it
      // has to divide the bar count or the last bar would be half a chord
      if (Array.isArray(progs[idea])) {
        for (const row of progs[idea] as unknown[]) {
          const p = Array.isArray(row) ? row[0] : null;
          if (Array.isArray(p) && p.length > 0 && materialBars % p.length !== 0) {
            problems.push(`harmony.progressions.${idea} has ${p.length} chords, ` +
              `which does not divide ${materialBars} bars`);
          }
        }
      }
    }
    const sv = harmony["sevenths"];
    if (!finite(sv) || sv < 0 || sv > 1) problems.push(`harmony.sevenths must be 0..1, got ${String(sv)}`);
  }

  // ── PARTS ───────────────────────────────────────────────────────────────
  const beats = isPlainObject(metre) && finite(metre["beats"]) ? (metre["beats"] as number) : 4;
  const perBeat = isPlainObject(metre) && finite(metre["perBeat"]) ? (metre["perBeat"] as number) : 4;
  const onGrid = (b: number): boolean => Number.isInteger(Math.round(b * perBeat * 1e6) / 1e6);
  /** a list of beats that all land on this metre's grid, inside its bar */
  const isBeatList = (v: unknown): boolean =>
    Array.isArray(v) && v.length >= 1 && v[0] === 0 &&
    v.every((b) => finite(b) && b >= 0 && b < beats && onGrid(b)) &&
    new Set(v).size === v.length;
  const beatsWhat = `a list of beats starting at 0, inside a ${beats}-beat bar, on a grid of ${perBeat} per beat`;
  /** beats -> grid steps, once, so no builder ever multiplies by perBeat */
  const toSteps = (pool: unknown): Weighted<readonly number[]> =>
    (pool as Weighted<readonly number[]>).map(([list, w]) =>
      [list.map((b) => Math.round(b * perBeat)), w] as const);

  const checkRegister = (field: string, v: unknown): void => {
    if (!Array.isArray(v) || v.length !== 2 || !finite(v[0]) || !finite(v[1])) {
      problems.push(`${field} must be [low, high] MIDI pitches, got ${JSON.stringify(v)}`);
      return;
    }
    const [lo, hi] = v as [number, number];
    if (lo < 21 || hi > 108) problems.push(`${field} ${lo}..${hi} leaves the keyboard (21..108)`);
    // an octave is the least a register can hold and still contain every
    // pitch class, so a part cannot be handed a chord it has no room for
    if (hi - lo < 12) problems.push(`${field} ${lo}..${hi} is narrower than an octave`);
  };

  const bass = isPlainObject(merged["bass"]) ? merged["bass"] : null;
  if (bass === null) {
    problems.push("bass is missing");
  } else {
    checkRegister("bass.register", bass["register"]);
    checkPool(problems, "bass.pocket", bass["pocket"], isBeatList, beatsWhat);
    checkPool(problems, "bass.tones", bass["tones"],
      (v) => typeof v === "string" && (BASS_TONES as readonly string[]).includes(v),
      "a bass tone");
    if (problems.length === 0) bass["pocket"] = toSteps(bass["pocket"]);
  }

  const keys = isPlainObject(merged["keys"]) ? merged["keys"] : null;
  if (keys === null) {
    problems.push("keys is missing");
  } else {
    checkRegister("keys.register", keys["register"]);
    checkPool(problems, "keys.strike", keys["strike"], isBeatList, beatsWhat);
    const op = keys["open"];
    if (!finite(op) || op < 0 || op > 1) problems.push(`keys.open must be 0..1, got ${String(op)}`);
    if (problems.length === 0) keys["strike"] = toSteps(keys["strike"]);
  }

  if (problems.length > 0) throw new GenreError(name, problems);

  const resolved = {
    name,
    label,
    tempo: Object.freeze([...(merged["tempo"] as number[])]) as readonly [number, number],
    metre: Object.freeze({ ...(metre as { beats: number; perBeat: number }) }),
    scales: Object.freeze((scales as [string, number][]).map((r) => Object.freeze([...r]))),
    lengthSec: Object.freeze([...(merged["lengthSec"] as number[])]) as readonly [number, number],
    form: deepFreeze(form) as unknown as Genre["form"],
    harmony: deepFreeze(harmony) as unknown as Genre["harmony"],
    bass: deepFreeze(bass) as unknown as Genre["bass"],
    keys: deepFreeze(keys) as unknown as Genre["keys"],
    sources: Object.freeze({ ...sources }),
  } as Genre;

  // a citation that names a field this genre does not have is a citation that
  // outlived its number, which is exactly what goes stale. The set of fields
  // is read off the genre that was just built, so it cannot disagree with it.
  const citable = new Set(citablePaths(resolved));
  const stale = Object.keys(sources).filter((k) => !citable.has(k));
  if (stale.length > 0) {
    throw new GenreError(
      name,
      stale.map((k) => `sources names "${k}", which is not a field of this genre`),
    );
  }

  return Object.freeze(resolved);
}

function deepFreeze<T>(v: T): T {
  if (isPlainObject(v)) for (const child of Object.values(v)) deepFreeze(child);
  else if (Array.isArray(v)) for (const child of v) deepFreeze(child);
  return Object.isFrozen(v) ? v : Object.freeze(v);
}

/** Resolve every genre at once, so a broken one is found at load and not at play. */
export function resolveAll(
  all: Readonly<Record<string, GenreSpec>>,
): Readonly<Record<string, Genre>> {
  const out: Record<string, Genre> = {};
  for (const name of Object.keys(all)) out[name] = resolveGenre(name, all);
  return Object.freeze(out);
}
