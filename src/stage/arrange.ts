/**
 * Stage 3 — THE ARRANGEMENT.
 *
 * Which material each section plays and which parts are heard in it. Nothing
 * but selection, decided before a note exists: the materials are built
 * afterwards, for exactly the hearings decided here.
 *
 * PARTS ARE NEVER LISTED PER SECTION. Every part the material has is heard
 * unless a rule takes it away, and the rules are few and named. A part cannot
 * be silent by omission — the way a whole voice went unheard on every seed of
 * the old program was a section table that forgot to name it, and there is
 * no table here to forget.
 *
 * PARTS ARRIVE, AND THEN THEY COME AND GO. A record opens with the first few
 * parts of the genre's entry order and each section lets the next one in, so
 * the second verse is not the first verse again: something has been added.
 *
 * BUT ARRIVING IS NOT STAYING. It used to be: once a section was big enough
 * to want everyone, everyone played to the end of the record, and every part
 * of every record after its first chorus was a solid block. That is not what
 * an arrangement is. "Five elements at one time — counting the drums as one
 * — is generally the most you'll hear (sometimes six)", and the way a record
 * moves is by "dropping out an instrument at a time" and "losing instruments
 * in stages and then building them up again to a big finish"
 * (soundonsound.com/techniques/arranging-pop). This program has exactly five
 * parts, so everyone playing IS the documented maximum, and a maximum heard
 * for two thirds of a record is not a maximum.
 *
 * So HOW MANY parts sound in a section is the section's own energy, which the
 * form has already worked out, and WHICH ones is the entry order backwards:
 * the last to arrive is the first to go, so what a quiet section keeps is its
 * foundation and what it loses is its decoration. The peak has everyone,
 * because that is what a peak is. Nothing here is drawn — a texture that
 * moves at random is not an arrangement either.
 *
 * A part is worth more where it is missing, and this program does not yet go
 * nearly as far as that idea allows: nothing here enters for the first time
 * halfway through a record, or plays once and is never heard again.
 *
 * A bridge or a quiet section also thins the drums: a breath, not a stop.
 *
 * AND IT CHANGES EVERY TWO TURNS OF THE LOOP, not once a section.
 *
 * THE TWO LOOP RULE: "the arrangement has to change every two loops of the
 * chords, because our ears naturally expect songs to change every two loops
 * of the main instruments", and "the only way to change an arrangement is to
 * add an instrument, or add expression to an existing instrument, or remove
 * an instrument, or reduce expression of an existing instrument". It is the
 * same rule the form already keeps between sections under another name —
 * "when an idea is repeated a third time our brains may begin to tune it
 * out" — counted in turns of the loop instead of in hearings of a section.
 * Two the same, then something moves. (musictech.com, "Could the Two Loop
 * Rule help electronic music producers in a rut"; musicradar.com,
 * "two-loop-rule-arrangement-cheatcode".)
 *
 * One set per section was four to eight identical turns between changes,
 * where the rule allows two. So a section now carries a set per SPAN of two
 * turns, and what moves at each boundary is one of the two things the rule
 * names: an instrument out, or an instrument's expression down. Never both,
 * and never everyone at once — a change is only heard against something
 * holding still, and five parts all moving every two turns is a row of
 * unrelated blocks rather than a record going somewhere.
 *
 * A different part each time, so the whole band is in the rotation and no
 * one part is always the one that goes. And the peak never loses a part —
 * "the peak has everyone, because that is what a peak is" — so at a peak the
 * change is expression only: a breath, not a hole.
 */

import type { Idea, Role } from "../genre/spec.ts";
import { ROLES } from "../genre/spec.ts";
import type { Chart } from "./chart.ts";
import type { Form, Section } from "./form.ts";
// A pure function of the chart, not a read of built materials — see its own
// docstring. The arrangement cannot count its spans without the turn length.
import { periodOf } from "./material/harmony.ts";

/** Who plays across one span of two turns of the loop, and how hard. */
export interface Span {
  readonly heard: ReadonlySet<Role>;
  /** The drums lose their hat and their fills: a breath, not a stop. */
  readonly thin: boolean;
}

export interface Placed {
  readonly section: Section;
  /** The key of the material this section plays. */
  readonly material: string;
  /**
   * Every part heard ANYWHERE in this section — the union of the spans below.
   * What the materials are built for, and what "a part cannot be silent by
   * omission" is judged against: a part that plays for one span of a section
   * is heard in it.
   */
  readonly heard: ReadonlySet<Role>;
  /** The drums lose their hat and their fills: a breath, not a stop. */
  readonly thin: boolean;
  /**
   * Who plays, span by span, each span being two turns of the loop. The
   * stage that writes the notes knows how long a turn is and indexes this;
   * the last span runs to the end of the section.
   */
  readonly spans: readonly Span[];
}

export interface Arrangement {
  readonly placed: readonly Placed[];
  /**
   * EVERY TIME GIVING PAID OFF WITHHOLDING, and by how much. The largest
   * entry is where this record's arc actually crested.
   *
   * Written by the bookkeeping and read by NOTHING that makes a choice — a
   * move that consulted it would be aiming at the peak, and the peak has to
   * be an observation or the arc is imposed. It is here to be printed and to
   * be measured against the peak the FORM declares, which is computed from
   * entirely different inputs: the form's from the genre's opinion about
   * what a chorus is, this one from a running integral of what was actually
   * played. Whether they land together, with no line of code relating them,
   * is the whole of the emergence claim.
   */
  readonly release: readonly { readonly section: number; readonly span: number; readonly discharged: number }[];
  /** Boundaries where every move refused. The dead end, counted rather than hidden. */
  readonly stuck: number;
}

/** The key of the material an idea's nth variant is: "A", then "A/1", "A/2". */
export const materialKey = (idea: Idea, variant: number): string => (variant === 0 ? idea : `${idea}/${variant}`);

/**
 * WHAT THE RECORD HAS ACTUALLY DONE SO FAR. Every field is a tally of what
 * was PLACED — nothing here is a plan, a target, or a curve. It is carried
 * from section to section, which is the whole of "sections informed of each
 * other": a section decides what to do by reading what the record has been.
 */
interface Ledger {
  /** The fullest any span has been. Rises ONLY by being reached. */
  ceiling: number;
  /** Part-turns spent under that ceiling, less what giving has paid back. */
  owed: number;
  /** The span before this one, so a rise is visible. */
  last: number;
  /** Turns since a part changed state: positive while sounding, negative while resting. */
  standing: Map<Role, number>;
  /** "move:role" to times made, ACROSS THE RECORD — the rule of three, applied to the arrangement's own vocabulary. */
  used: Map<string, number>;
  /**
   * Every discharge, with how much it paid off. The largest is the record's
   * peak. WRITTEN AND NEVER READ BY A CHOICE — a move that read this would be
   * aiming at it, and then the arc would be imposed rather than observed.
   */
  release: { section: number; span: number; discharged: number }[];
  /** Boundaries where every move refused. The dead end, counted rather than hidden. */
  stuck: number;
}

/** One candidate: what the span would become, and which part it moves. */
interface Move {
  readonly name: string;
  readonly heard: Set<Role>;
  readonly thin: boolean;
  readonly role: Role;
}

export function makeArrangement(chart: Chart, form: Form): Arrangement {
  const A = chart.genre.arrangement;
  const lastIn = A.enter[A.enter.length - 1]!;

  /**
   * HOW FULL A SPAN IS, the one measured quantity: what fraction of the band
   * is sounding, less a half part where the drums are held back. A function
   * of the arrangement's own choices and nothing else.
   */
  const fullness = (h: ReadonlySet<Role>, isThin: boolean): number =>
    (h.size - (isThin && h.has("drums") ? 0.5 : 0)) / ROLES.length;

  const ledger: Ledger = {
    ceiling: 0, owed: 0, last: 0,
    standing: new Map(ROLES.map((r) => [r, 0])),
    used: new Map(), release: [], stuck: 0,
  };

  // a statement the form marks `vary` plays the idea's next variant, and
  // every statement after it that is not marked plays the plain one again
  const variantsSeen = new Map<Idea, number>();
  const sectionsHeard = new Map<Role, number>();
  // how many of the entry order have arrived; the intro's parts are in from the top
  let arrived = A.introParts;
  const placed: Placed[] = form.sections.map((section) => {
    let variant = 0;
    if (section.vary) {
      variant = (variantsSeen.get(section.idea) ?? 0) + 1;
      variantsSeen.set(section.idea, variant);
    }

    let heard: Set<Role>;
    if (section.fn === "intro") {
      heard = new Set(A.enter.slice(0, A.introParts));
    } else {
      // WHAT HAS ARRIVED still only grows: a part the record has not yet
      // introduced cannot appear, and each section lets the next one in.
      arrived = section.peak || section.energy >= A.fullAbove ? ROLES.length : Math.min(ROLES.length, arrived + 1);
      // HOW MANY OF THEM PLAY is this section's energy, between the fewest a
      // genre will carry and all of them. The peak takes everyone.
      const wanted = section.peak
        ? ROLES.length
        : Math.round(A.fewest + (ROLES.length - A.fewest) * section.energy);
      const playing = Math.min(arrived, Math.max(A.fewest, Math.min(ROLES.length, wanted)));
      // WHO GOES is the shed order, which is not the reverse of the entry
      // order. Parts arrive foundation-first — the chord, then the beat, then
      // the bass, and the tune last — so reversing that sheds the TUNE first,
      // and a record that drops its melody to get quieter has dropped what an
      // ear was following. The genre says which part it can most afford.
      heard = new Set(A.enter.slice(0, arrived));
      for (const r of A.shed) {
        if (heard.size <= playing) break;
        heard.delete(r);
      }
      // AND THE LAST PART IN IS STILL THE FIRST OUT OF AN OUTRO, once the
      // record has earned its absence: a part heard in one section is not yet
      // something an ear can miss.
      if (section.fn === "outro" && heard.size > A.fewest && (sectionsHeard.get(lastIn) ?? 0) >= 2) heard.delete(lastIn);
    }

    const thin = !section.peak && (section.fn === "bridge" || section.energy < A.thinBelow);

    // EVERY TWO TURNS, ONE THING MOVES, and it is the first of the rule's
    // four ways that is actually available here: an instrument out, an
    // instrument in, or the drums' expression down. Never up — a section the
    // form made thin is a breath, and handing the hat back halfway through a
    // bridge is not a change to it, it is the end of it.
    //
    // EXACTLY THE SPANS THAT WILL BE READ. A span is two turns of the loop,
    // and the loop length comes from the chart, so the count is known here
    // and is not a guess. Guessing "enough for the shortest turn a loop can
    // be" built 2216 spans across 60 records of which 783 were ever reached:
    // every section decided changes in spans the performance never indexed,
    // and the record heard none of them.
    const turn = 2 * Math.max(1, periodOf(chart, section.idea));
    const spanCount = Math.max(1, Math.ceil(section.bars / turn));
    const spans: Span[] = [];
    /**
     * EVERY SPAN IS A SUBSET OF SPAN 0, and that one invariant is what makes
     * the rest safe. Span 0 is always read (index 0 at the section's first
     * bar), so the union of the spans is span 0 exactly — checked over 334
     * sections, 0 differ — which means `heard` below is unchanged, every
     * part heard in a section still has a material, and nothing is silent by
     * omission. Under it a walk DOWN the subset lattice and back UP again is
     * legal: base, less the keys, less the keys and the pad, base again is
     * "losing instruments in stages and then building them up again" — which
     * this file's own header cites and the code could not do, because it
     * always restarted from the base.
     *
     * WHICH MOVE IS MADE IS NOT DRAWN. It is the one that best serves what
     * the record has already done, and a texture that moved at random would
     * not be an arrangement.
     */
    const base = heard;
    let cur: { heard: Set<Role>; thin: boolean } = { heard: new Set(base), thin };
    const turnsOf = (s: number): number =>
      Math.min(2, Math.max(1, Math.round((Math.min(section.bars, (s + 1) * turn) - s * turn) / (turn / 2))));

    for (let s = 0; s < spanCount; s++) {
      if (s > 0) {
        // ── THE POOL. Every named way this stage can change an arrangement.
        //    A move never declares which way it moves the energy: that is
        //    read off fullness afterwards, so a move cannot lie about itself.
        const pool: Move[] = [];
        const push = (name: string, h: Set<Role>, th: boolean, role: Role): void => {
          if (h.size === cur.heard.size && th === cur.thin && [...h].every((r) => cur.heard.has(r))) return;
          pool.push({ name, heard: h, thin: th, role });
        };
        // an instrument out — stacked on where the span already is, not on the base
        if (!section.peak && cur.heard.size > A.fewest) {
          for (const r of A.shed) {
            if (!cur.heard.has(r)) continue;
            const less = new Set(cur.heard); less.delete(r);
            push("part-out", less, cur.thin, r);
          }
        }
        // an instrument back — only ever one span 0 already had
        for (const r of A.enter) {
          if (cur.heard.has(r) || !base.has(r)) continue;
          const more = new Set(cur.heard); more.add(r);
          push("part-back", more, cur.thin, r);
        }
        // all of them back at one moment
        if (cur.heard.size < base.size) push("all-back", new Set(base), cur.thin, lastIn);
        // strip to the fewest the genre carries, keeping the tail of the shed order
        if (!section.peak && cur.heard.size > A.fewest) {
          const stripped = new Set(cur.heard);
          for (const r of A.shed) { if (stripped.size <= A.fewest) break; stripped.delete(r); }
          push("strip", stripped, cur.thin, A.shed[0]!);
        }
        // expression down, and back up — never above the floor the form set
        if (!cur.thin) push("hold-back", new Set(cur.heard), true, "drums");
        if (cur.thin && !thin) push("let-out", new Set(cur.heard), false, "drums");

        // ── THE SCORE. Three terms, multiplied, no coefficients: any one at
        //    zero kills the move, and there is nothing to tune.
        const established = (r: Role): number => {
          const n = sectionsHeard.get(r) ?? 0;
          return n / (n + 1);
        };
        const want = ledger.owed / (ledger.owed + A.rest);
        const before = fullness(cur.heard, cur.thin);
        let best: Move | null = null;
        let bestFit = 0;
        for (const mv of pool) {
          const after = fullness(mv.heard, mv.thin);
          const d = after - before;
          //   the debt talking: deep in debt, giving scores and taking does not
          const serve = d > 0 ? want * d : (1 - want) * -d;
          //   a part is worth more where it is missing, as arithmetic
          const st = ledger.standing.get(mv.role) ?? 0;
          const worth = (d > 0 ? Math.max(0, -st) / (Math.max(0, -st) + 1) : Math.max(0, st) / (Math.max(0, st) + 1))
            * established(mv.role);
          //   the rule of three, applied to this stage's own vocabulary: the
          //   same move on the same part wears out across the whole record
          const fresh = 1 / (1 + (ledger.used.get(`${mv.name}:${mv.role}`) ?? 0));
          const fit = serve * worth * fresh;
          if (fit > bestFit) { bestFit = fit; best = mv; }
        }
        if (best === null) {
          // nothing served the debt. The two-loop rule still owes a change,
          // so take the freshest move there is; only a genuinely empty pool
          // is a dead end, and it is counted rather than hidden.
          let alt: Move | null = null;
          let altFresh = -1;
          for (const mv of pool) {
            const f = 1 / (1 + (ledger.used.get(`${mv.name}:${mv.role}`) ?? 0));
            if (f > altFresh) { altFresh = f; alt = mv; }
          }
          if (alt === null) ledger.stuck++;
          best = alt;
        }
        if (best !== null) {
          cur = { heard: best.heard, thin: best.thin };
          ledger.used.set(`${best.name}:${best.role}`, (ledger.used.get(`${best.name}:${best.role}`) ?? 0) + 1);
        }
      }
      spans.push({ heard: new Set(cur.heard), thin: cur.thin });

      // ── THE LEDGER, in part-turns. Two entries and nothing else.
      const turns = turnsOf(s);
      const now = fullness(cur.heard, cur.thin);
      //   withholding accrues, measured against the fullest the record has
      //   ACTUALLY been — so an intro accrues nothing by being small. It is
      //   establishing, not withholding: you cannot miss what you have not
      //   yet heard, and a record that never gets full has a flat arc rather
      //   than a failed one.
      ledger.owed += Math.max(0, ledger.ceiling - now) * turns;
      //   and giving pays it off
      if (now > ledger.last) {
        const discharged = Math.min(ledger.owed, (now - ledger.last) * turns);
        ledger.owed -= discharged;
        if (discharged > 0) ledger.release.push({ section: section.index, span: s, discharged });
      }
      ledger.ceiling = Math.max(ledger.ceiling, now);
      ledger.last = now;
      for (const r of ROLES) {
        const st = ledger.standing.get(r) ?? 0;
        ledger.standing.set(r, cur.heard.has(r) ? Math.max(0, st) + turns : Math.min(0, st) - turns);
      }
    }

    // AND WHAT IS HEARD IN THE SECTION IS THE UNION OF ITS SPANS. A part that
    // plays for one span of a section is heard in it, and its material has to
    // exist — so this is read off the spans and not the other way round.
    const union = new Set<Role>();
    for (const sp of spans) for (const r of sp.heard) union.add(r);
    for (const r of union) sectionsHeard.set(r, (sectionsHeard.get(r) ?? 0) + 1);
    const held = Object.freeze(union) as ReadonlySet<Role>;
    const frozen = Object.freeze(
      spans.map((sp) => Object.freeze({ heard: Object.freeze(sp.heard) as ReadonlySet<Role>, thin: sp.thin })),
    ) as readonly Span[];

    return Object.freeze({
      section,
      material: materialKey(section.idea, variant),
      heard: held,
      thin,
      spans: frozen,
    });
  });

  return Object.freeze({
    placed: Object.freeze(placed),
    release: Object.freeze(ledger.release.map((r) => Object.freeze(r))),
    stuck: ledger.stuck,
  });
}

/** "intro[keys drums] verse[all] bridge[all·thin] outro[-lead]" */
export function describeArrangement(a: Arrangement): string {
  return a.placed
    .map((p) => {
      const all = p.heard.size === ROLES.length;
      const missing = ROLES.filter((r) => !p.heard.has(r));
      const who = all ? "all" : missing.length <= 1 && missing.length < p.heard.size
        ? missing.map((r) => "-" + r).join(" ")
        : [...p.heard].join(" ");
      return `${p.section.fn}[${who}${p.thin ? "·thin" : ""}]`;
    })
    .join(" ");
}
