/**
 * Seeded randomness, addressed by what a draw IS rather than by when it runs.
 *
 * Every value is a pure function of (seed, address). `rng(7, "lofi").at("bass")
 * .chance("rest", 0.3)` answers the same thing on every run, in any order,
 * whether or not any other draw happened first.
 *
 * That is the whole design. A generator that hands out numbers in sequence
 * couples every draw to every draw before it: adding one, or taking one inside
 * an `if`, silently shifts everything downstream and changes music the change
 * had nothing to do with. Addressing removes the coupling instead of policing
 * it — a conditional draw is harmless, a new draw moves nothing, and there is
 * no ordering discipline for anyone to remember or break.
 *
 * The cost is a hash per draw. It is not measurable next to the work of
 * deciding what to do with the number.
 */

/** A path segment. Numbers are allowed so `at("bar", 12)` reads naturally. */
export type Seg = string | number;

/**
 * FNV-1a with a murmur3 finalizer.
 *
 * The finalizer is not decoration: FNV alone leaves near-identical inputs
 * near-identical in the low bits, so `bar/11` and `bar/12` would correlate —
 * and adjacent addresses are exactly what this is asked for.
 */
export function hash32(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

const UNIT = 1 / 4294967296;

/** A weighted table: `[value, weight]`, weights any positive scale. */
export type Weighted<T> = ReadonlyArray<readonly [T, number]>;

export interface Rng {
  /** The address this generator is rooted at, for diagnostics. */
  readonly path: string;

  /** A generator rooted deeper. `r.at("bar", 3)` scopes everything below it. */
  at(...seg: Seg[]): Rng;

  /** A number in [0, 1). */
  unit(...seg: Seg[]): number;

  /** A number in [lo, hi). */
  range(name: Seg, lo: number, hi: number): number;

  /** An integer in [lo, hi], both ends included. */
  int(name: Seg, lo: number, hi: number): number;

  /** True with probability `p`. `p <= 0` is never, `p >= 1` is always. */
  chance(name: Seg, p: number): boolean;

  /** One element, uniformly. Throws on an empty list — silence is not a draw. */
  pick<T>(name: Seg, from: readonly T[]): T;

  /** One element, by weight. Throws if nothing has positive weight. */
  weighted<T>(name: Seg, table: Weighted<T>): T;

  /** A shuffled copy. The input is not touched. */
  shuffle<T>(name: Seg, from: readonly T[]): T[];

  /** `n` independent numbers in [0, 1), each addressed by its index. */
  series(name: Seg, n: number): number[];

  /**
   * `n` distinct elements, by weight, without replacement.
   * Fewer than `n` are returned when the table runs out.
   */
  sample<T>(name: Seg, table: Weighted<T>, n: number): T[];
}

const join = (base: string, seg: readonly Seg[]): string =>
  seg.length === 0 ? base : base + "/" + seg.join("/");

/** Root a generator for one song. Every draw below it is addressed. */
export function rng(seed: number, ...seg: Seg[]): Rng {
  return make(seed, join(String(seed), seg));
}

function make(seed: number, path: string): Rng {
  const u = (seg: readonly Seg[]): number => hash32(join(path, seg)) * UNIT;

  const self: Rng = {
    path,

    at: (...seg) => make(seed, join(path, seg)),

    unit: (...seg) => u(seg),

    range: (name, lo, hi) => lo + u([name]) * (hi - lo),

    int: (name, lo, hi) => {
      if (hi < lo) [lo, hi] = [hi, lo];
      return lo + Math.min(hi - lo, Math.floor(u([name]) * (hi - lo + 1)));
    },

    chance: (name, p) => u([name]) < p,

    pick: (name, from) => {
      if (from.length === 0) throw new Error(`pick from nothing at ${join(path, [name])}`);
      const i = Math.min(from.length - 1, Math.floor(u([name]) * from.length));
      return from[i]!;
    },

    weighted: (name, table) => {
      let total = 0;
      for (const [, w] of table) if (w > 0) total += w;
      if (total <= 0) throw new Error(`no positive weight at ${join(path, [name])}`);
      let x = u([name]) * total;
      for (const [v, w] of table) {
        if (w <= 0) continue;
        x -= w;
        if (x <= 0) return v;
      }
      // only reachable through floating-point drift at the very top of the range
      return table[table.length - 1]![0];
    },

    shuffle: (name, from) => {
      // Fisher-Yates, each swap addressed by its position so the permutation
      // depends on the address and the length, never on call order
      const out = from.slice();
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(u([name, i]) * (i + 1));
        const t = out[i]!;
        out[i] = out[j]!;
        out[j] = t;
      }
      return out;
    },

    series: (name, n) => {
      const out = new Array<number>(n);
      for (let i = 0; i < n; i++) out[i] = u([name, i]);
      return out;
    },

    sample: <T>(name: Seg, table: Weighted<T>, n: number): T[] => {
      const left = table.filter(([, w]) => w > 0);
      const out: T[] = [];
      for (let k = 0; k < n && left.length > 0; k++) {
        let total = 0;
        for (const [, w] of left) total += w;
        let x = u([name, k]) * total;
        let at = left.length - 1;
        for (let i = 0; i < left.length; i++) {
          x -= left[i]![1];
          if (x <= 0) {
            at = i;
            break;
          }
        }
        out.push(left.splice(at, 1)[0]![0]);
      }
      return out;
    },
  };

  return self;
}
