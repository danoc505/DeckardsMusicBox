/**
 * Stage 2 — THE FORM.
 *
 * Which sections a record is made of, in what order, how long each one is, and
 * how big it is meant to feel. No notes: this decides where things go, and
 * what goes there is decided later.
 *
 * Three things here are deliberately not what the obvious version would be.
 *
 * A SECTION'S LENGTH IS DRAWN FROM A POOL, not looked up. One number per
 * function gives a record in which every section is the same length, and a
 * record whose blocks are all identical reads as formulaic however much
 * variation happens inside them. Squareness stays the strong default; the pool
 * is what lets a genre mean it rather than have it by omission.
 *
 * THE LAWS ARE NAMED OBJECTS, not conditions buried in the walk. Each one can
 * be read, tested and reported on its own, and a law that leaves the walk with
 * nothing to choose throws WITH ITS NAME rather than falling through to a
 * silent fallback — because a table that cannot be walked is a bug in the
 * table, and the fallback is what hides it.
 *
 * REPETITION IS COUNTED ON THE IDEA, NEVER ON THE FUNCTION NAME. `intro`,
 * `verse` and `instrumental` can all state idea A, so counting function names
 * lets one tune be stated four times before anything notices. What an ear
 * counts is how many times it has heard the same thing.
 */

import { clock, type Clock } from "../core/clock.ts";
import type { Rng } from "../core/rng.ts";
import type { FormRules, Idea, SectionFn } from "../genre/spec.ts";
import type { Chart } from "./chart.ts";

export interface Section {
  readonly index: number;
  readonly fn: SectionFn;
  /** Which musical idea this section states. */
  readonly idea: Idea;
  /** How many times this idea has been stated, counting this one. */
  readonly statement: number;
  /** How many times running, counting this one. */
  readonly run: number;
  /**
   * This statement must differ from the ones before it.
   *
   * THE RULE OF THREE, and it counts HEARINGS, not consecutive ones. "When an
   * idea is presented once, it piques our interest. When it is repeated, the
   * concept is reinforced. However, if it is repeated a third time, our
   * brains may begin to tune it out" (omnionsound.com, "The Rule Of Three In
   * Music Composition"); the rule "usually applies to repeating a motif,
   * section or device, three times before changing to something else".
   *
   * It used to be set on the third statement IN A ROW, which in a record that
   * alternates — verse chorus verse chorus verse — is almost never: an idea's
   * run resets every time the other one interrupts it, so five hearings of a
   * verse were five identical verses. A returning section is still a return
   * whatever came between, and it is the HEARING that wears out, not the
   * adjacency.
   *
   * What "differ" means is not decided here — the stage that writes the notes
   * owns that.
   *
   * AND IT IS NEVER SET ON AN IDEA'S LAST HEARING. A variant made where the
   * idea never comes back is material heard once: the record develops a thing
   * at the exact moment it has no time left to show anyone the development.
   * Measured over sixty dungeon synth seeds before this rule, a THIRD of every
   * variant built was heard once and never again, and 60% of records put their
   * peak on material the listener never hears a second time — while an idea
   * has to be stated twice before anyone can hold on to it at all ("when an
   * idea is presented once, it piques our interest; when it is repeated, the
   * concept is reinforced"). A rule against tuning out was manufacturing
   * things there was nothing to tune out OF.
   *
   * The order is known here — the whole section list is built before any of
   * this runs — so whether an idea returns is a fact and not a guess.
   */
  readonly vary: boolean;
  /**
   * THE RULE OF THREE FIRED HERE AND THE ANSWER MAY NOT BE NEW NOTES.
   *
   * The third hearing of an idea that never returns still owes a change; what
   * it may not do is spend the idea to pay for it. "The change may be
   * delivered at a different level than the repetition that demanded it. A
   * third chorus does not need new chorus NOTES — it can be answered by an
   * arrangement change" (`docs/FORM-RESEARCH.md`, Part 2).
   *
   * So this is the demand travelling to the stage that can meet it without
   * rewriting anything: the arrangement, which owns the treatments. A section
   * is never both `vary` and `recast` — the first says change the notes, the
   * second says change everything except the notes.
   */
  readonly recast: boolean;

  readonly startBar: number;
  readonly endBar: number;
  readonly bars: number;

  readonly energy: number;
  readonly peak: boolean;
}

export interface Form {
  readonly sections: readonly Section[];
  readonly bars: number;
  /** The clock for the record this form actually came to. */
  readonly clock: Clock;
  /** Energy per bar, interpolated between section centres. */
  readonly arc: readonly number[];
  /** Which section is the record's biggest moment. */
  readonly peakAt: number;
}

/** What a law is shown when it is asked about a candidate. */
export interface LawContext {
  readonly rules: FormRules;
  /** The sections chosen so far, oldest first. */
  readonly sofar: readonly SectionFn[];
  /** Their ideas, in the same order. */
  readonly ideas: readonly Idea[];
}

export interface Law {
  readonly name: string;
  /** Why this is a law and not a preference. Printed when it refuses. */
  readonly why: string;
  ok(cand: SectionFn, ctx: LawContext): boolean;
}

const last = <T>(a: readonly T[]): T | undefined => a[a.length - 1];

/**
 * The hard laws of succession.
 *
 * A law ZEROES a candidate. It never scores one — what actually follows is
 * left to the genre's own weights among whatever survives, so the laws shape
 * the music without composing it.
 */
export const LAWS: readonly Law[] = [
  {
    name: "no-triple",
    why: "a third identical section running is where an ear stops listening",
    ok(cand, { sofar }) {
      const n = sofar.length;
      return !(n >= 2 && sofar[n - 1] === cand && sofar[n - 2] === cand);
    },
  },
  {
    name: "intro-opens-only",
    why: "an intro is a way in; a second one is a section pretending to be one",
    ok(cand, { sofar }) {
      return cand !== "intro" || sofar.length === 0;
    },
  },
  {
    name: "outro-closes-only",
    why: "an outro is reached by the record ending, never by being chosen",
    ok(cand) {
      return cand !== "outro";
    },
  },
  {
    name: "bridge-needs-a-departure",
    why: "a bridge leaves home, so there has to be a home to leave",
    ok(cand, { sofar, ideas }) {
      if (cand !== "bridge") return true;
      const home = ideas.filter((i) => i === "A" || i === "B").length;
      return sofar.length >= 2 && home >= 1;
    },
  },
];

/** Nothing legal is left to follow this section. The tables cannot be walked. */
export class FormError extends Error {
  readonly at: readonly SectionFn[];
  readonly blame: string;

  constructor(at: readonly SectionFn[], blame: string) {
    super(
      `no legal section can follow "${last(at) ?? "the start"}" ` +
        `(after ${at.join(" -> ") || "nothing"}): ${blame}`,
    );
    this.name = "FormError";
    this.at = at;
    this.blame = blame;
  }
}

/**
 * How much a section's energy rises simply for being late in the record.
 *
 * Without it every chorus scores identically and which one is the peak comes
 * down to a tie-break, so the biggest moment lands wherever it happens to. A
 * small lift makes the last statement of the biggest section the peak, which
 * is what a record does. Small on purpose: it orders equals, it does not
 * outrank the difference between a bridge and a chorus.
 */
const LATE_LIFT = 0.12;

/** Filter a pool by the laws, saying which law emptied it. */
function legalOnly(
  pool: readonly (readonly [SectionFn, number])[],
  ctx: LawContext,
): { kept: (readonly [SectionFn, number])[]; blame: string } {
  let kept = pool.filter(([, w]) => w > 0);
  let blame = "the genre offers nothing that follows it";
  for (const law of LAWS) {
    const next = kept.filter(([fn]) => law.ok(fn, ctx));
    if (next.length === 0 && kept.length > 0) blame = `${law.name} — ${law.why}`;
    kept = next;
    if (kept.length === 0) break;
  }
  return { kept, blame };
}

export function makeForm(chart: Chart): Form {
  const rules = chart.genre.form;
  const draw: Rng = chart.rng.at("form");

  /** The outro is reserved before the walk starts, so a record can always end. */
  const outroBars = draw.weighted("outro-length", rules.lengths.outro);
  const target = Math.max(outroBars + 1, chart.targetBars);

  /** The smallest section a departure could return to. */
  const shortestReturn = Math.min(
    ...(["verse", "chorus", "instrumental"] as const).flatMap((fn) =>
      rules.lengths[fn].filter(([, w]) => w > 0).map(([len]) => len),
    ),
  );

  const fns: SectionFn[] = [];
  const ideas: Idea[] = [];
  const lens: number[] = [];
  let used = 0;

  const take = (fn: SectionFn, bars: number): void => {
    fns.push(fn);
    ideas.push(rules.idea[fn]);
    lens.push(bars);
    used += bars;
  };

  // An intro, or a cold open. A cold open is not "skip the intro and start on a
  // verse" — it starts on whatever WOULD have followed the intro, so the genre
  // decides how its record begins in one place instead of two.
  const opensCold = !draw.chance("intro", rules.introChance);
  const first: SectionFn = opensCold
    ? draw.weighted("cold-open", rules.next.intro)
    : "intro";
  /**
   * AND AN INTRO IS MEASURED ON A CLOCK, NOT IN BARS.
   *
   * Eight bars is four seconds at 240 bpm and twenty-three at 82, and what a
   * listener leaves is measured in seconds: intros went from over twenty of
   * them in the mid-eighties to about five (Léveillé Gauvin, "Drawing listener
   * attention in popular music", Musicae Scientiae 22(3), 2018), and the
   * songwriting advice is the same from the other end — "I can't remember
   * hearing an intro that was too short, but I've heard many that were too
   * long" (Ewer, secretsofsongwriting.com).
   *
   * So the genre's ceiling NARROWS THE POOL BEFORE THE DRAW rather than
   * truncating a length after it: a constraint on the choice, which is what
   * every other rule in this program is.
   *
   * IT USED TO GIVE UP WHEN NOTHING FIT, taking the shortest instead so that
   * "the record says what it is rather than pretending to fit". That sounds
   * careful and it was the hole: a ceiling with a silent fallback is not a
   * ceiling, it is a preference. Measured, 49% of lofi records and 100% of
   * dungeon synth's broke their own stated ceiling through this branch, and
   * because the fallback always chose the SHORTEST, every other length a
   * genre declared was dead — lofi drew 4 bars in 100% of records and dungeon
   * synth 8, their second entries never once.
   *
   * A genre whose intro pool cannot satisfy its own ceiling is now refused at
   * LOAD, with the arithmetic (`resolve.ts`), so the case this branch existed
   * for cannot reach here. If it somehow does, that is a bug in the check and
   * it throws with its name rather than quietly making a record — the same
   * rule the laws above follow.
   */
  const barSec = (60 / chart.tempo) * chart.metre.beats;
  let pool = rules.lengths[first];
  if (first === "intro") {
    pool = pool.filter(([len, w]) => w > 0 && len * barSec <= rules.introSec);
    if (pool.length === 0) {
      throw new FormError([first], `no intro length fits under ${rules.introSec}s at ${chart.tempo} bpm`);
    }
  }
  take(first, draw.at("step", 0).weighted("len", pool));

  for (let i = 1; ; i++) {
    const room = target - used - outroBars;
    if (room <= 0) break;

    const cur = fns[fns.length - 1]!;
    const ctx: LawContext = { rules, sofar: fns, ideas };
    const { kept, blame } = legalOnly(rules.next[cur], ctx);
    if (kept.length === 0) throw new FormError(fns, blame);

    // A section is taken while MORE THAN HALF of it fits: rounding to the
    // nearest, rather than flooring, which would always land short, or
    // admitting anything that starts inside the budget, which would always
    // overshoot by up to a whole section.
    //
    // A BRIDGE ALSO HAS TO LEAVE ROOM TO COME BACK. It is a departure, and one
    // with nothing after it but the outro has not departed from anywhere — it
    // has just stopped. This is a budget question rather than a law: a bridge
    // that will not fit with a return is simply not affordable here, and the
    // walk picks something else instead of refusing to build a record.
    const affordable = kept
      .map(([fn, w]) => {
        // the return has to survive the SAME rounding at the next step, so the
        // room a bridge must leave behind is half a section and not a whole
        // one — measuring it against `2 * room` lets a bridge in and then
        // leaves nothing for it to return to
        const keepBack = fn === "bridge" ? Math.ceil(shortestReturn / 2) : 0;
        const pool = rules.lengths[fn].filter(([len]) =>
          keepBack === 0 ? len <= 2 * room : len <= room - keepBack,
        );
        return [fn, w, pool] as const;
      })
      .filter(([, , pool]) => pool.length > 0);
    if (affordable.length === 0) break;

    const at = draw.at("step", i);
    const fn = at.weighted("fn", affordable.map(([f, w]) => [f, w] as const));
    const pool = affordable.find(([f]) => f === fn)![2];
    take(fn, at.weighted("len", pool));
  }

  take("outro", outroBars);

  // ── WHAT EACH SECTION IS, NOW THAT THE ORDER IS KNOWN ───────────────────
  const bars = used;
  const seen = new Map<Idea, number>();
  /** How many statements of the current idea are standing behind this one. */
  let carry = 0;
  let prevIdea: Idea | null = null;
  /** Hearings of each idea since it last varied: the rule of three counts these. */
  const since = new Map<Idea, number>();

  const built: Section[] = [];
  let startBar = 0;
  for (let i = 0; i < fns.length; i++) {
    const fn = fns[i]!;
    const idea = ideas[i]!;
    const len = lens[i]!;

    const statement = (seen.get(idea) ?? 0) + 1;
    seen.set(idea, statement);
    const run = idea === prevIdea ? carry + 1 : 1;
    prevIdea = idea;

    // the third HEARING varies, counted per idea across the whole record and
    // not merely in a row: state it, state it again, then change something
    const heard = (since.get(idea) ?? 0) + 1;
    const owed = heard >= 3;
    // BUT A VARIANT NEEDS SOMEWHERE TO BE HEARD AGAIN. The rest of the record
    // is already decided, so this is a lookup and not a forecast: if the idea
    // never comes back, new notes here would be new notes nobody hears twice.
    const returns = ideas.indexOf(idea, i + 1) >= 0;
    const vary = owed && returns;
    const recast = owed && !returns;
    // AND THE COUNT RESETS, so the record comes back round to the plain
    // statement afterwards. Without this every hearing after the third is a
    // variant and the tune itself is heard twice and never again — and coming
    // back to the thing an ear already knows is half of what a return is for.
    //
    // A recast resets it too: the demand was met, by the arrangement rather
    // than by the notes, and leaving the counter armed would make every
    // remaining hearing of a trailing idea demand a change again.
    since.set(idea, owed ? 0 : heard);
    carry = run;

    const position = fns.length > 1 ? i / (fns.length - 1) : 1;
    const energy = Math.min(1, rules.energy[fn] * (1 + LATE_LIFT * position));

    built.push({
      index: i, fn, idea, statement, run, vary, recast,
      startBar, endBar: startBar + len, bars: len,
      energy, peak: false,
    });
    startBar += len;
  }

  // the peak is the biggest section, and the LATEST of equals — a record's
  // largest moment belongs late, and without the tie-break it lands on
  // whichever equal section happens to come first
  let peakAt = 0;
  for (let i = 0; i < built.length; i++) {
    if (built[i]!.energy >= built[peakAt]!.energy) peakAt = i;
  }

  const sections = built.map((s, i) => Object.freeze({ ...s, peak: i === peakAt }));

  return Object.freeze({
    sections: Object.freeze(sections),
    bars,
    clock: clock({ tempo: chart.tempo, bars, metre: chart.metre }),
    arc: Object.freeze(arcOf(sections, bars)),
    peakAt,
  });
}

/**
 * Energy per bar, interpolated between section centres.
 *
 * DERIVED, so there is one owner. Holding a separate drawn arc beside the
 * section energies gives two numbers for one idea, and they disagree the
 * moment either is edited. A section's energy is the fact; this is the same
 * fact read at a finer grain.
 */
function arcOf(sections: readonly Section[], bars: number): number[] {
  const arc = new Array<number>(bars);
  if (sections.length === 0) return arc.fill(0);

  const centre = sections.map((s) => (s.startBar + s.endBar) / 2);
  for (let b = 0; b < bars; b++) {
    const x = b + 0.5;
    if (x <= centre[0]!) {
      arc[b] = sections[0]!.energy;
      continue;
    }
    const lastAt = sections.length - 1;
    if (x >= centre[lastAt]!) {
      arc[b] = sections[lastAt]!.energy;
      continue;
    }
    let i = 0;
    while (i + 1 < sections.length && centre[i + 1]! < x) i++;
    const a = sections[i]!;
    const z = sections[i + 1]!;
    const t = (x - centre[i]!) / (centre[i + 1]! - centre[i]!);
    arc[b] = a.energy + (z.energy - a.energy) * t;
  }
  return arc;
}

/** "intro[A] verse[A] chorus[B]^ ..." — the shape at a glance. */
export function describeForm(f: Form): string {
  return f.sections
    .map((s) => `${s.fn}[${s.idea}${s.vary ? "*" : ""}]${s.peak ? "^" : ""}:${s.bars}`)
    .join(" ");
}
