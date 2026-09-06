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

import type { ArtName } from "../core/articulation.ts";
import { SCALES } from "../core/theory.ts";
import {
  ARCS, BAR_LETTERS, BASS_TONES, CAN, CAN_DRUM, CIRCUITS, DEFAULTS, DRONE_TONES, DRUM_LANES, FLOOR, IDEAS, INTRO_KINDS, KIT_NAMES, LEAD_CYCLES, MANNERS, PEDAL_ORDER, PITCHED_ROLES, ROLES, SECTION_FNS, SENDS, SWING_GRIDS, TREATMENTS, VOICES,
  type Genre, type GenreSpec, type VoiceName, type Weighted,
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

    const isec = form["introSec"];
    if (!finite(isec) || isec < 1 || isec > 120) problems.push(`form.introSec must be 1..120 seconds, got ${String(isec)}`);
    /**
     * AND THE CEILING HAS TO BE ONE. A genre states its intro lengths in bars
     * and its ceiling in seconds, and nothing made the two agree: `form.ts`
     * filtered the pool to what fits and, where NOTHING fits, silently took
     * the shortest instead. So the ceiling was a preference that gives up.
     * Measured before this check existed: 49% of lofi records and 100% of
     * dungeon synth's broke their own stated ceiling, and BOTH genres carried
     * a second intro length — lofi's 8 bars, dungeon synth's 16 — that could
     * never be drawn at any tempo. Two dead entries and a ceiling honoured in
     * neither genre, from one number nobody made add up.
     *
     * A length is drawable if it fits at the genre's FASTEST tempo, where its
     * bar is shortest. One that does not fit even there is dead in every
     * record the genre can make, and a declared option that can never be
     * chosen is this program's cardinal sin with a table around it. Refused
     * at load, with the arithmetic, so the author fixes the ceiling or drops
     * the entry rather than finding out by counting rolls.
     */
    const tempoPair = merged["tempo"];
    const metreObj = isPlainObject(merged["metre"]) ? merged["metre"] : {};
    const beats = metreObj["beats"];
    const introPool = asPool<number>(lengths["intro"]);
    if (finite(isec) && Array.isArray(tempoPair) && finite(tempoPair[1]) && finite(beats) && introPool !== null) {
      const shortestBarSec = (60 / (tempoPair[1] as number)) * (beats as number);
      for (const [len, w] of introPool) {
        if (w <= 0) continue;
        const atFastest = len * shortestBarSec;
        if (atFastest > isec) {
          problems.push(
            `form.lengths.intro offers ${len} bars, which is ${atFastest.toFixed(1)}s at this genre's fastest tempo ` +
              `(${tempoPair[1]} bpm) and can never fit under form.introSec ${isec}. Raise the ceiling or drop the length`,
          );
        }
      }
    }
    /**
     * AND THE PHRASE FLOOR HAS TO BE SATISFIABLE, for exactly the reason the
     * intro ceiling above has to be. `form.ts` narrows each section's length
     * pool to what gives the phrase `leastTurns` turns of its loop, and a
     * genre whose pool has nothing that long cannot make a record at all —
     * which is a bug in the table, and the table is where it is refused.
     *
     * Checked at the LONGEST loop the genre can draw, which is `harmony.bars`:
     * `drawChords` writes that many chords and `harmonicPeriod` takes the
     * smallest period that tiles them, so no idea can ever have a longer loop.
     * A pool that clears the floor there clears it in every record.
     *
     * The intro and the outro are exempt in `form.ts` and exempt here, on the
     * grounds stated there: the intro is under the opposite pressure and the
     * outro is not a section that carries on.
     */
    const lt = form["leastTurns"];
    if (!finite(lt) || lt < 1 || lt > 8 || !Number.isInteger(lt)) {
      problems.push(`form.leastTurns must be a whole number 1..8, got ${String(lt)}`);
    }
    const harmonyObj = isPlainObject(merged["harmony"]) ? merged["harmony"] : {};
    const hBars = harmonyObj["bars"];
    if (finite(lt) && finite(hBars)) {
      const need = (lt as number) * (hBars as number);
      /**
       * WHAT IS REFUSED IS A GENRE THAT CANNOT BUILD A RECORD, and not one
       * whose bridge is sometimes out of reach. The two are different and the
       * intro check above is the other kind: a length over `introSec` at the
       * genre's FASTEST tempo is dead in every record it can make, which is a
       * declared option that can never be chosen.
       *
       * A body length under the floor is not dead. The floor is
       * `leastTurns * periodOf(idea)` and the period is drawn per record, so
       * an 8-bar bridge is legal wherever that idea's loop comes out at two
       * bars and only unavailable where it comes out at four. `form.ts`
       * already has the right answer for a section kind it cannot afford
       * here: `affordable` drops it and the walk picks another. That is the
       * existing mechanism for exactly this, and it is not a silent fallback
       * on length — nothing gets shortened, a different section is chosen.
       *
       * So what has to hold is that SOMETHING can always carry the record:
       * at the longest loop the genre can draw, at least one section kind
       * that may follow another clears the floor. A genre failing this can
       * make no record at all at that period, which is a bug in the table.
       */
      const carriers = SECTION_FNS.filter((fn) => fn !== "intro" && fn !== "outro");
      const canCarry = carriers.some((fn) => {
        const pool = asPool<number>(lengths[fn]);
        return pool !== null && pool.some(([len, w]) => w > 0 && len >= need);
      });
      if (!canCarry) {
        problems.push(
          `no section kind offers a length of ${need} bars, which is form.leastTurns ${String(lt)} turns of ` +
            `this genre's longest loop (harmony.bars ${String(hBars)}) — so a record whose ideas draw that loop ` +
            `has no section that can state its phrase. Offer a longer length, or lower form.leastTurns`,
        );
      }
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
    const fi = harmony["fifths"];
    if (!finite(fi) || fi < 0 || fi > 1) problems.push(`harmony.fifths must be 0..1, got ${String(fi)}`);
    const dm = harmony["diminished"];
    if (dm !== "allow" && dm !== "avoid") problems.push(`harmony.diminished must be "allow" or "avoid", got ${String(dm)}`);
  }

  // ── PARTS ───────────────────────────────────────────────────────────────
  const beats = isPlainObject(metre) && finite(metre["beats"]) ? (metre["beats"] as number) : 4;
  const perBeat = isPlainObject(metre) && finite(metre["perBeat"]) ? (metre["perBeat"] as number) : 4;
  const onGrid = (b: number): boolean => Number.isInteger(Math.round(b * perBeat * 1e6) / 1e6);
  /** a list of beats that all land on this metre's grid, inside `span` beats */
  const beatList = (span: number, mustStartAtZero: boolean) => (v: unknown): boolean =>
    Array.isArray(v) && v.length >= 1 && (!mustStartAtZero || v[0] === 0) &&
    v.every((b) => finite(b) && b >= 0 && b < span && onGrid(b)) &&
    v.every((b, i) => i === 0 || b > (v[i - 1] as number));
  const isBeatList = beatList(beats, true);
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
    const follows = bass["pocket"] === "kick";
    if (!follows) checkPool(problems, "bass.pocket", bass["pocket"], isBeatList, beatsWhat);
    checkPool(problems, "bass.tones", bass["tones"],
      (v) => typeof v === "string" && (BASS_TONES as readonly string[]).includes(v),
      "a bass tone");
    if (problems.length === 0 && !follows) bass["pocket"] = toSteps(bass["pocket"]);
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

  const lead = isPlainObject(merged["lead"]) ? merged["lead"] : null;
  if (lead === null) {
    problems.push("lead is missing");
  } else {
    checkRegister("lead.register", lead["register"]);
    // a phrase is two bars, need not begin on its downbeat, and must be ascending
    checkPool(problems, "lead.rhythms", lead["rhythms"], beatList(beats * 2, false),
      `an ascending list of beats inside a two-bar phrase of ${beats * 2}, on a grid of ${perBeat} per beat`);
    /**
     * AND IT COVERS THE PHRASE. A cell is written in beats, so a cell
     * written for one metre is silent through the end of a longer bar: the
     * same list that fills two bars of four leaves a whole bar empty in six,
     * and the tune comes out a third as long with nothing said. A gap of a
     * bar or more — between two onsets, or from the last onset to the end —
     * is that mistake, so it is refused here and the genre states cells for
     * the metre it actually has. A POCKET may be as sparse as it likes, and
     * some are one strike a bar: a pocket repeats every bar, so its gap runs
     * into the next bar's downbeat. A phrase happens once.
     */
    if (Array.isArray(lead["rhythms"])) {
      for (const row of lead["rhythms"] as [unknown, unknown][]) {
        const cell = Array.isArray(row?.[0]) ? (row[0] as number[]) : null;
        if (cell === null || cell.length === 0 || !cell.every(finite)) continue;
        let worst = cell[0]!;
        for (let i = 1; i < cell.length; i++) worst = Math.max(worst, cell[i]! - cell[i - 1]!);
        worst = Math.max(worst, beats * 2 - cell[cell.length - 1]!);
        if (worst >= beats) {
          problems.push(
            `lead.rhythms cell ${JSON.stringify(cell)} leaves ${worst} beats silent in a ${beats * 2}-beat phrase — ` +
              `a whole bar of this metre. Write the cells for a ${beats}-beat bar.`,
          );
        }
      }
    }
    const lp = lead["leap"];
    if (!finite(lp) || lp < 0 || lp > 1) problems.push(`lead.leap must be 0..1, got ${String(lp)}`);
    const sp = lead["span"];
    if (!finite(sp) || !Number.isInteger(sp) || sp < 5 || sp > 36) {
      problems.push(`lead.span must be 5..36 semitones, got ${String(sp)}`);
    }
    // a plan opens with the tune: a section whose first cycle is silent has
    // no tune to develop
    checkPool(problems, "lead.cycles", lead["cycles"],
      (v) => Array.isArray(v) && v.length >= 1 && v[0] !== "." &&
        v.every((l) => typeof l === "string" && (LEAD_CYCLES as readonly string[]).includes(l)),
      'a list of cycle letters A, B or "." that begins with a sounding cycle');
    // the figure a phrase restates, and the shape it walks
    checkPool(problems, "lead.arc", lead["arc"], (v) => (ARCS as readonly unknown[]).includes(v), `one of ${ARCS.join(", ")}`);
    const motif = isPlainObject(lead["motif"]) ? lead["motif"] : null;
    if (motif === null) problems.push("lead.motif is missing");
    else {
      const n = motif["notes"];
      // two notes are an interval, not a figure; a figure longer than a bar
      // of eighths is not restated inside a two-bar phrase, it IS the phrase
      if (!finite(n) || !Number.isInteger(n) || n < 2 || n > 8) problems.push(`lead.motif.notes must be a whole 2..8, got ${String(n)}`);
      const r = motif["restate"];
      if (!finite(r) || r < 0 || r > 1) problems.push(`lead.motif.restate must be 0..1, got ${String(r)}`);
    }
    const sig = lead["signature"];
    if (!finite(sig) || sig < 0 || sig > 1) problems.push(`lead.signature must be 0..1, got ${String(sig)}`);
    if (problems.length === 0) lead["rhythms"] = toSteps(lead["rhythms"]);
  }

  const drone = isPlainObject(merged["drone"]) ? merged["drone"] : null;
  if (drone === null) {
    problems.push("drone is missing");
  } else {
    checkRegister("drone.register", drone["register"]);
    checkPool(problems, "drone.tone", drone["tone"],
      (v) => typeof v === "string" && (DRONE_TONES as readonly string[]).includes(v),
      "a drone tone: the key's tonic or its fifth");
    checkPool(problems, "drone.hold", drone["hold"],
      (v) => finite(v) && Number.isInteger(v) && v >= 1 && v <= 16,
      "a whole number of bars from 1 to 16");
  }

  const drums = isPlainObject(merged["drums"]) ? merged["drums"] : null;
  if (drums === null) {
    problems.push("drums is missing");
  } else {
    // a kick pocket starts on the downbeat; a snare's does not have to
    checkPool(problems, "drums.kick", drums["kick"], isBeatList, beatsWhat);
    checkPool(problems, "drums.snare", drums["snare"], beatList(beats, false),
      `an ascending list of beats inside a ${beats}-beat bar, on a grid of ${perBeat} per beat`);
    checkPool(problems, "drums.hat", drums["hat"],
      (v) => finite(v) && v >= 0 && v <= beats && onGrid(v),
      "a division of the beat that lands on the grid, or 0 for none");
    checkPool(problems, "drums.phrase", drums["phrase"],
      (v) => Array.isArray(v) && v.length >= 1 &&
        v.every((l) => typeof l === "string" && (BAR_LETTERS as readonly string[]).includes(l)),
      "a list of bar letters A, B, C or D");
    if (problems.length === 0) {
      drums["kick"] = toSteps(drums["kick"]);
      drums["snare"] = toSteps(drums["snare"]);
      drums["hat"] = (drums["hat"] as Weighted<number>).map(([b, w]) => [Math.round(b * perBeat), w] as const);
    }
  }

  // ── ARRANGEMENT ─────────────────────────────────────────────────────────
  const arr = isPlainObject(merged["arrangement"]) ? merged["arrangement"] : null;
  if (arr === null) {
    problems.push("arrangement is missing");
  } else {
    const enter = arr["enter"];
    if (!Array.isArray(enter)) {
      problems.push("arrangement.enter must be a list of parts");
    } else {
      // a permutation of every part there is: nothing missing, nothing twice,
      // nothing that is not a part
      for (const r of enter) {
        if (!(ROLES as readonly string[]).includes(r as string)) problems.push(`arrangement.enter names "${String(r)}", which is not a part`);
      }
      for (const r of ROLES) {
        const n = enter.filter((x) => x === r).length;
        if (n === 0) problems.push(`arrangement.enter never lets the ${r} in`);
        if (n > 1) problems.push(`arrangement.enter names the ${r} ${n} times`);
      }
    }
    // the way in, and whether what opened the record comes back
    checkPool(problems, "arrangement.intro", arr["intro"], (v) => (INTRO_KINDS as readonly unknown[]).includes(v), `one of ${INTRO_KINDS.join(", ")}`);
    if (typeof arr["breakdown"] !== "boolean") {
      problems.push(`arrangement.breakdown must be true or false, got ${String(arr["breakdown"])}`);
    }
    const ip = arr["introParts"];
    if (!finite(ip) || !Number.isInteger(ip) || ip < 1 || ip > ROLES.length) {
      problems.push(`arrangement.introParts must be 1..${ROLES.length}, got ${String(ip)}`);
    }
    const shed = arr["shed"];
    if (!Array.isArray(shed) || shed.length !== ROLES.length || new Set(shed).size !== ROLES.length || shed.some((r) => !ROLES.includes(r as never))) {
      problems.push(`arrangement.shed must name every part exactly once, got ${JSON.stringify(shed)}`);
    }
    const fw = arr["fewest"];
    if (!finite(fw) || !Number.isInteger(fw) || fw < 1 || fw > ROLES.length) {
      problems.push(`arrangement.fewest must be 1..${ROLES.length}, got ${String(fw)}`);
    }
    const fa = arr["fullAbove"];
    if (!finite(fa) || fa < 0 || fa > 1) problems.push(`arrangement.fullAbove must be 0..1, got ${String(fa)}`);
    const tb = arr["thinBelow"];
    if (!finite(tb) || tb < 0 || tb > 1) problems.push(`arrangement.thinBelow must be 0..1, got ${String(tb)}`);
    // and the note-preserving changes it will make to a section
    checkPool(problems, "arrangement.treat", arr["treat"], (v) => (TREATMENTS as readonly unknown[]).includes(v), `one of ${TREATMENTS.join(", ")}`);
    checkPool(problems, "arrangement.manner", arr["manner"], (v) => (MANNERS as readonly unknown[]).includes(v), `one of ${MANNERS.join(", ")}`);
  }

  const feel = isPlainObject(merged["feel"]) ? merged["feel"] : null;
  if (feel === null) {
    problems.push("feel is missing");
  } else {
    const sw = feel["swing"];
    if (!finite(sw) || sw < 50 || sw > 75) problems.push(`feel.swing must be 50..75 percent (50 straight, 66.7 triplet), got ${String(sw)}`);
    const sg = feel["swingGrid"];
    if (!(SWING_GRIDS as readonly unknown[]).includes(sg)) {
      problems.push(`feel.swingGrid must be 8 or 16, got ${String(sg)}`);
    } else if (finite(sw) && sw > 50 && perBeat % ((sg as number) / 4) !== 0) {
      // a straight genre has no pairs to swing, so its grid need not exist
      problems.push(`feel.swingGrid ${String(sg)} needs a beat divisible by ${(sg as number) / 4}, and this metre has ${perBeat} per beat`);
    }
    const jm = feel["jitterMs"];
    if (!finite(jm) || jm < 0 || jm > 50) problems.push(`feel.jitterMs must be 0..50, got ${String(jm)}`);
    const lean = feel["lean"];
    if (!isPlainObject(lean)) {
      problems.push("feel.lean must be a map of part or drum lane to milliseconds");
    } else {
      const named = new Set<string>([...ROLES, ...DRUM_LANES]);
      for (const [k, v] of Object.entries(lean)) {
        if (!named.has(k)) problems.push(`feel.lean names "${k}", which is not a part or a drum lane`);
        // fifty milliseconds is the top of the range the measurements report
        else if (!finite(v) || v < -50 || v > 50) problems.push(`feel.lean.${k} must be -50..50 ms, got ${String(v)}`);
      }
    }
    const ac = feel["accent"];
    if (!finite(ac) || ac < 0 || ac > 1) problems.push(`feel.accent must be 0..1, got ${String(ac)}`);
    const phr = feel["phrase"];
    if (!finite(phr) || phr < 0 || phr > 1) problems.push(`feel.phrase must be 0..1, got ${String(phr)}`);
    const vj = feel["velocityJitter"];
    if (!finite(vj) || vj < 0 || vj > 0.5) problems.push(`feel.velocityJitter must be 0..0.5, got ${String(vj)}`);
  }

  // ── SOUND ───────────────────────────────────────────────────────────────
  const sound = isPlainObject(merged["sound"]) ? merged["sound"] : null;
  if (sound === null) {
    problems.push("sound is missing");
  } else {
    const voices = isPlainObject(sound["voices"]) ? sound["voices"] : null;
    if (voices === null) problems.push("sound.voices is missing");
    else {
      for (const r of PITCHED_ROLES) {
        const v = voices[r];
        if (!(VOICES as readonly unknown[]).includes(v)) problems.push(`sound.voices.${r} is ${String(v)}, not one of ${VOICES.join(", ")}`);
      }
      // A MANNER AN INSTRUMENT CANNOT PRODUCE IS NOT TASTE, IT IS A MISTAKE.
      // The genre says how often each part reaches for each manner and the
      // instrument says which ones its body can make; asking a struck piano
      // to bend is caught here rather than rendered silently as a plain note.
      // The pairing is only knowable once both are resolved, which is why the
      // check lives with the voices and not with the parts.
      for (const r of PITCHED_ROLES) {
        const v = voices[r];
        if (!(VOICES as readonly unknown[]).includes(v)) continue;
        const can = new Set<string>([...FLOOR, ...CAN[v as VoiceName]]);
        const pool = asPool<ArtName>((merged[r] as Record<string, unknown> | undefined)?.["art"]) ?? [];
        for (const [name, weight] of pool) {
          if (weight > 0 && !can.has(name)) {
            problems.push(`${r}.art asks for "${name}", which a ${String(v)} cannot play (it can: ${[...can].join(", ")})`);
          }
        }
      }
      const kit = new Set<string>([...FLOOR, ...CAN_DRUM]);
      for (const [name, weight] of asPool<ArtName>((merged["drums"] as Record<string, unknown> | undefined)?.["art"]) ?? []) {
        if (weight > 0 && !kit.has(name)) {
          problems.push(`drums.art asks for "${name}", which a kit cannot play (it can: ${[...kit].join(", ")})`);
        }
      }
    }
    const rack = isPlainObject(sound["rack"]) ? sound["rack"] : null;
    if (rack === null) problems.push("sound.rack is missing");
    else {
      const unit = (name: string): Record<string, unknown> | null => {
        const u = rack[name];
        if (!isPlainObject(u)) { problems.push(`sound.rack.${name} is missing`); return null; }
        return u;
      };
      const within = (u: Record<string, unknown> | null, name: string, field: string, lo: number, hi: number): void => {
        if (u === null) return;
        const v = u[field];
        if (!finite(v) || v < lo || v > hi) problems.push(`sound.rack.${name}.${field} must be ${lo}..${hi}, got ${String(v)}`);
      };
      const pole = unit("pole"); within(pole, "pole", "hz", 40, 20000); within(pole, "pole", "resonance", 0, 1); within(pole, "pole", "mix", 0, 1);
      const flange = unit("flange"); within(flange, "flange", "rateHz", 0.02, 10); within(flange, "flange", "depth", 0, 1); within(flange, "flange", "ret", 0, 2);
      const ens = unit("ensemble"); within(ens, "ensemble", "rateHz", 0.02, 10); within(ens, "ensemble", "depth", 0, 1); within(ens, "ensemble", "ret", 0, 2);
      const echo = unit("echo"); within(echo, "echo", "beats", 0.25, 8); within(echo, "echo", "feedback", 0, 0.9); within(echo, "echo", "ret", 0, 2);
      const spring = unit("spring"); within(spring, "spring", "sec", 0.2, 6); within(spring, "spring", "ret", 0, 2);
      const room = unit("room"); within(room, "room", "sec", 0.2, 12); within(room, "room", "ret", 0, 2);
      const tape = unit("tape"); within(tape, "tape", "lowpassHz", 1000, 20000); within(tape, "tape", "wowHz", 0.05, 10); within(tape, "tape", "wowCents", 0, 100); within(tape, "tape", "drive", 1, 10);
      const medium = unit("medium"); within(medium, "medium", "mix", 0, 1);
      if (medium !== null && medium["kind"] !== "gramophone" && medium["kind"] !== "radio") problems.push(`sound.rack.medium.kind must be "gramophone" or "radio", got ${String(medium?.["kind"])}`);
      const vinyl = unit("vinyl"); within(vinyl, "vinyl", "crackle", 0, 1);
      const master = unit("master"); within(master, "master", "level", 0, 1);
    }
    // the mixer: a channel per part, every knob in range
    const mix = isPlainObject(sound["mix"]) ? sound["mix"] : null;
    if (mix === null) problems.push("sound.mix is missing");
    else {
      const inRange = (ch: Record<string, unknown>, role: string, field: string, lo: number, hi: number): void => {
        const v = ch[field];
        if (!finite(v) || v < lo || v > hi) problems.push(`sound.mix.${role}.${field} must be ${lo}..${hi}, got ${String(v)}`);
      };
      for (const role of ROLES) {
        const ch = mix[role];
        if (!isPlainObject(ch)) { problems.push(`sound.mix.${role} is missing`); continue; }
        inRange(ch, role, "level", 0, 2); inRange(ch, role, "pan", -1, 1); inRange(ch, role, "sweepHz", 0.01, 8);
        inRange(ch, role, "sweepDepth", 0, 1); inRange(ch, role, "pedals", 0, 1); inRange(ch, role, "az", -180, 180); inRange(ch, role, "dist", 0, 1);
        const sends = isPlainObject(ch["sends"]) ? ch["sends"] : null;
        if (sends === null) problems.push(`sound.mix.${role}.sends is missing`);
        else for (const sd of SENDS) {
          const v = sends[sd];
          if (!finite(v) || v < 0 || v > 1) problems.push(`sound.mix.${role}.sends.${sd} must be 0..1, got ${String(v)}`);
        }
      }
    }
    const world = isPlainObject(sound["world"]) ? sound["world"] : null;
    if (world === null) problems.push("sound.world is missing");
    else for (const f of ["width", "depth"]) {
      const v = world[f];
      if (!finite(v) || v < 0 || v > 1) problems.push(`sound.world.${f} must be 0..1, got ${String(v)}`);
    }
    const patch = isPlainObject(sound["patch"]) ? sound["patch"] : null;
    if (patch === null) problems.push("sound.patch is missing");
    else for (const from of SENDS) {
      const row = patch[from];
      if (!isPlainObject(row)) { problems.push(`sound.patch.${from} is missing`); continue; }
      for (const to of SENDS) {
        const v = row[to];
        // a unit into itself is feedback and is capped short of unity, or it never dies
        const hi = from === to ? 0.9 : 1;
        if (!finite(v) || v < 0 || v > hi) problems.push(`sound.patch.${from}.${to} must be 0..${hi}, got ${String(v)}`);
      }
    }
    const pedals = isPlainObject(sound["pedals"]) ? sound["pedals"] : null;
    if (pedals === null) problems.push("sound.pedals is missing");
    else {
      const pd = (name: string, field: string, lo: number, hi: number): void => {
        const u = pedals[name];
        if (!isPlainObject(u)) { problems.push(`sound.pedals.${name} is missing`); return; }
        const v = u[field];
        if (!finite(v) || v < lo || v > hi) problems.push(`sound.pedals.${name}.${field} must be ${lo}..${hi}, got ${String(v)}`);
      };
      for (const name of PEDAL_ORDER) pd(name, "mix", 0, 1);
      pd("comp", "sustain", 0, 1); pd("comp", "level", 0, 1);
      pd("wah", "rateHz", 0.05, 12); pd("wah", "depth", 0, 1);
      pd("sub", "two", 0, 1); pd("sub", "gate", 0.0002, 0.3); pd("sub", "tone", 120, 4000);
      pd("meat", "dirt", 0, 1); pd("meat", "bias", 0, 1); pd("meat", "dark", 0, 1); pd("meat", "level", 0, 1);
      pd("muff", "sustain", 0, 1); pd("muff", "tone", 0, 1); pd("muff", "level", 0, 1);
      pd("muff", "cabHz", 1500, 16000); pd("muff", "mids", 0, 1); pd("muff", "mass", 0, 1);
      pd("overdrive", "drive", 1, 20); pd("overdrive", "tone", 0, 1);
      pd("fuzz", "gain", 1, 40);
      pd("saw", "dist", 0, 1); pd("saw", "low", 0, 1); pd("saw", "high", 0, 1);
      pd("saw", "gate", 0, 0.3); pd("saw", "tameHz", 1200, 12000); pd("saw", "level", 0, 1);
      pd("sag", "depth", 0, 1); pd("sag", "idle", 0.18, 1); pd("sag", "recovSec", 0.01, 0.6); pd("sag", "draw", 0, 1);
      pd("phaser", "rateHz", 0.02, 10); pd("phaser", "depth", 0, 1);
      pd("tremolo", "rateHz", 0.1, 20); pd("tremolo", "depth", 0, 1);
    }
    // the drum machine: which kit, which circuit, and the strip on every lane
    const machine = isPlainObject(sound["machine"]) ? sound["machine"] : null;
    if (machine === null) problems.push("sound.machine is missing");
    else {
      const mn = (field: string, lo: number, hi: number): void => {
        const v = machine[field];
        if (!finite(v) || v < lo || v > hi) problems.push(`sound.machine.${field} must be ${lo}..${hi}, got ${String(v)}`);
      };
      if (!(KIT_NAMES as readonly unknown[]).includes(machine["kit"])) {
        problems.push(`sound.machine.kit is ${String(machine["kit"])}, not one of ${KIT_NAMES.join(", ")}`);
      }
      if (!(CIRCUITS as readonly unknown[]).includes(machine["circuit"])) {
        problems.push(`sound.machine.circuit is ${String(machine["circuit"])}, not one of ${CIRCUITS.join(", ")}`);
      }
      mn("tune", 35, 70); mn("decay", 0.15, 1.6); mn("tone", 0, 1); mn("punch", 0, 1);
      mn("snappy", 0, 1); mn("sdtone", 0, 1); mn("chdecay", 0.01, 0.14); mn("ohdecay", 0.1, 0.9);
      mn("drive", 0.6, 2); mn("filterHz", 200, 20000);
      const channels = isPlainObject(machine["channels"]) ? machine["channels"] : null;
      if (channels === null) problems.push("sound.machine.channels is missing");
      else for (const lane of DRUM_LANES) {
        const strip = channels[lane];
        if (!isPlainObject(strip)) { problems.push(`sound.machine.channels.${lane} is missing`); continue; }
        const st = (field: string, lo: number, hi: number): void => {
          const v = strip[field];
          if (!finite(v) || v < lo || v > hi) problems.push(`sound.machine.channels.${lane}.${field} must be ${lo}..${hi}, got ${String(v)}`);
        };
        st("tune", -12, 12); st("decay", 0.2, 3); st("level", 0, 1.6); st("cut", 120, 20000);
        const sends = isPlainObject(strip["sends"]) ? strip["sends"] : null;
        if (sends === null) { problems.push(`sound.machine.channels.${lane}.sends is missing`); continue; }
        for (const sd of SENDS) {
          const v = sends[sd];
          if (!finite(v) || v < 0 || v > 1) problems.push(`sound.machine.channels.${lane}.sends.${sd} must be 0..1, got ${String(v)}`);
        }
      }
    }
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
    lead: deepFreeze(lead) as unknown as Genre["lead"],
    drone: deepFreeze(drone) as unknown as Genre["drone"],
    drums: deepFreeze(drums) as unknown as Genre["drums"],
    arrangement: deepFreeze(arr) as unknown as Genre["arrangement"],
    feel: deepFreeze(feel) as unknown as Genre["feel"],
    sound: deepFreeze(sound) as unknown as Genre["sound"],
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
