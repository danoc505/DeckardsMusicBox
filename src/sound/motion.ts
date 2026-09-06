/**
 * MOTION — the knobs move, and the record is what moves them.
 *
 * A mixer whose knobs never move is a mixer playing one sound for four
 * minutes. This program could already change the mixer at a boundary — a
 * treatment switches a section onto a different set of numbers, and `drift`
 * walks it there instead of jumping. What it could not do is move a knob
 * CONTINUOUSLY, on a clock of its own, independent of when the arrangement
 * happens to decide something.
 *
 * MKII HAD THIS AND MKIII LOST IT. `Deckards Orchestrator MK2.html` carries a
 * MOTION stage with four kinds — a value per STEP, a value per SECTION, a
 * tempo-synced cycle per BAR, and a one-shot per EVENT — and its own note is
 * the exact distinction this file is named for:
 *
 *   "CLOCK A and CLOCK B are free-running cycles and they only ever reached
 *    ONE destination — the detune — which makes them a drift, not an LFO.
 *    These two are LFOs in the sense the question means: a rate, a depth, a
 *    shape, and A SOCKET YOU CHOOSE."
 *
 * By that measure MKIII's `drift` is not an LFO either. It walks to wherever
 * a treatment puts the mixer and stops. This is the other thing.
 *
 * ── WHAT IS COPIED FROM MKII ───────────────────────────────────────────────
 *
 * The four wave shapes, returning −1..1 over one cycle, so depth reads the
 * same on all four. Rates IN BARS rather than in hertz, so a genre can make
 * two cycles coprime and get a pattern that does not repeat for a long time.
 * The RESET TRIGGER, which is the half most programs leave out: a free cycle
 * drifts out of phase with the music, and a reset one lands ON something.
 * MKII's own source for that is Doepfer's A-145, which has a reset input, and
 * Batumi, which has one per channel — "reset returns the LFO to the beginning
 * of its cycle so that it is in sync with the rest of your patch".
 *
 * And `off`, which MKII learned the hard way and wrote down: a knob the genre
 * has already opened all the way sits at the top of its travel, so a swing
 * either side of it spends half its cycle clamped and reads as a flattened
 * wobble. `off` moves the centre down so the swing ducks from the open
 * position, which is what a send being ridden actually does.
 *
 * ── AND WHAT IS BETTER HERE ────────────────────────────────────────────────
 *
 * MKII's LFO chooses from a numbered list of six destinations, and each one
 * needs a hand-written entry in a `SPAN` array saying how far that knob may
 * travel. Six sockets is a ceiling, and the table is a thing to keep in step.
 *
 * A move here names its destination BY PATH — `rack.pole.hz`, `mix.keys.level`
 * — so every one of the mixer's numbers is reachable and nothing has to be
 * declared to make a new one reachable. There is no SPAN table because depth
 * is a SHARE OF THE KNOB'S OWN VALUE: a filter at 3600 Hz with depth 0.4
 * swings 40% either side of 3600, and the same move written for a genre whose
 * filter sits at 900 swings 40% of 900. That is what makes one line of genre
 * data mean the same thing on two different mixers.
 *
 * A frequency swings in OCTAVES rather than in hertz, for the same reason
 * `render.ts` walks one geometrically: half way from 200 to 3200 is 800.
 *
 * ── THE LAWS ───────────────────────────────────────────────────────────────
 *
 * IT MOVES NO NOTE. Motion reaches the record through the settled mixer and
 * nowhere else, which is the same path a treatment takes. Nothing here can
 * see a pitch, a time or a gain.
 *
 * IT IS A PURE FUNCTION OF THE BAR. No state, no accumulator, no memory of
 * the last block — so a record rendered from bar 40 gives the same numbers as
 * one rendered from the top, and the byte-identical-at-any-block-size law the
 * suite holds is not in danger.
 *
 * A KNOB AT ZERO CANNOT BE SWUNG. Depth is a share of the knob's value, so a
 * genre that has switched a unit off has nothing for a move to multiply. That
 * is deliberate and it is the same rule `reach.ts` states for treatments: a
 * move on a unit the genre does not run is a knob that does nothing, and this
 * program deletes those rather than shipping them.
 */

import type { Role, SoundRules, SoundSpec } from "../genre/spec.ts";

/**
 * The shapes, all returning −1..1 over one cycle of phase 0..1, so `depth` is
 * a peak deviation and reads the same on all four. Copied from MKII, which
 * states the same reason.
 */
export const WAVES = {
  sin: (u: number): number => Math.sin(u * 2 * Math.PI),
  tri: (u: number): number => 1 - 4 * Math.abs(u - 0.5),
  /** sweeps up across the cycle, then resets */
  ramp: (u: number): number => 2 * u - 1,
  /** and its mirror: opens, then closes */
  fall: (u: number): number => 1 - 2 * u,
} as const;

export type WaveName = keyof typeof WAVES;

/** Where a cycle counts from. */
export type Reset =
  /** the top of the record: free-running, the way every LFO in MKII began */
  | "record"
  /** the bar this section started on, so a four-bar sweep is a sweep INTO the chorus */
  | "section"
  /** every n bars: a clock divider, the plainest reset there is */
  | number;

/** One knob, moving. */
export interface Move {
  /**
   * WHICH KNOB, by its path in the mixer — `rack.pole.hz`, `mix.keys.level`,
   * `pedals.overdrive.drive`. This is the socket, and it is a path rather
   * than a number so that every knob is reachable without a table.
   */
  readonly path: string;
  /** How long one cycle takes, IN BARS. Make two moves coprime and they will not agree for a long time. */
  readonly bars: number;
  /** How far it swings, as a share of the knob's own value. Negative turns the shape upside down. */
  readonly depth: number;
  readonly wave: WaveName;
  /** Where the cycle counts from. Default is the top of the record. */
  readonly reset?: Reset;
  /** Moves the centre, as a share of the knob's value: −0.3 lets a wide-open send duck rather than clip. */
  readonly off?: number;
  /** A per-part move names its part; a whole-mixer one does not. */
  readonly at?: Role;
}

/** A frequency swings in octaves. The same set `render.ts` walks geometrically. */
const GEOMETRIC = new Set([
  "hz", "lowpassHz", "cutHz", "tameHz", "cabHz", "tone", "rateHz", "wowHz",
]);

const leafOf = (path: string): string => path.slice(path.lastIndexOf(".") + 1);

/** Read a dotted path out of the mixer. Returns undefined where the path is not a number. */
export function readAt(rules: SoundRules, path: string): number | undefined {
  let node: unknown = rules;
  for (const key of path.split(".")) {
    if (node === null || typeof node !== "object") return undefined;
    node = (node as Record<string, unknown>)[key];
  }
  return typeof node === "number" ? node : undefined;
}

/** Build the one-key-deep object a dotted path names, so `settle` can merge it. */
function nest(path: string, value: number): Record<string, unknown> {
  const keys = path.split(".");
  const out: Record<string, unknown> = {};
  let node = out;
  for (let i = 0; i < keys.length - 1; i++) {
    const next: Record<string, unknown> = {};
    node[keys[i]!] = next;
    node = next;
  }
  node[keys[keys.length - 1]!] = value;
  return out;
}

/**
 * WHERE THIS CYCLE COUNTS FROM, in bars.
 *
 * The trigger is not a wire and not a wall clock: it is the arrangement, which
 * is the one thing that makes a reset deterministic and lets a two-bar excerpt
 * cut out of the middle of a record agree with the whole thing.
 */
function resetBar(reset: Reset | undefined, bar: number, sectionStart: number): number {
  if (reset === undefined || reset === "record") return 0;
  if (reset === "section") return sectionStart;
  const n = Math.max(1, Math.round(reset));
  return Math.floor(bar / n) * n;
}

/**
 * THE MIXER, MOVED — a partial spec for this moment, to be settled over the
 * genre's own numbers and whatever treatment is in force.
 *
 * `bar` is fractional: motion is read between bar lines, which is the whole
 * point of it. `sectionStart` is the bar the section in force began on, and is
 * the only thing here that knows about the arrangement.
 */
export function motionAt(
  moves: readonly Move[],
  rules: SoundRules,
  bar: number,
  sectionStart: number,
): SoundSpec | null {
  if (moves.length === 0) return null;
  let spec: Record<string, unknown> | null = null;
  for (const mv of moves) {
    if (mv.depth === 0 && (mv.off ?? 0) === 0) continue;
    const path = mv.at === undefined ? mv.path : mv.path.replace("*", mv.at);
    const base = readAt(rules, path);
    // a knob at zero has nothing to swing, and a path that is not a number is
    // not a knob — both are the genre's mistake to fix, not this stage's to
    // paper over, and `resolve.ts` refuses them at load
    if (base === undefined || base === 0) continue;
    const from = resetBar(mv.reset, bar, sectionStart);
    const phase = (bar - from) / Math.max(1e-9, mv.bars);
    const u = phase - Math.floor(phase);
    const swing = (mv.off ?? 0) + mv.depth * WAVES[mv.wave](u);
    const value = GEOMETRIC.has(leafOf(path))
      ? base * Math.pow(2, swing)
      : base * (1 + swing);
    const one = nest(path, value);
    spec = spec === null ? one : merge(spec, one);
  }
  return spec as SoundSpec | null;
}

/** Two partial specs into one. Objects merge; numbers are replaced. */
function merge(a: Record<string, unknown>, b: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...a };
  for (const k of Object.keys(b)) {
    const av = out[k], bv = b[k];
    out[k] = (av !== null && typeof av === "object" && bv !== null && typeof bv === "object")
      ? merge(av as Record<string, unknown>, bv as Record<string, unknown>)
      : bv;
  }
  return out;
}
