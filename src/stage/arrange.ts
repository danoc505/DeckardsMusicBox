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
}

/** The key of the material an idea's nth variant is: "A", then "A/1", "A/2". */
export const materialKey = (idea: Idea, variant: number): string => (variant === 0 ? idea : `${idea}/${variant}`);

export function makeArrangement(chart: Chart, form: Form): Arrangement {
  const A = chart.genre.arrangement;
  const lastIn = A.enter[A.enter.length - 1]!;

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
    // Enough spans for the shortest turn a loop can be, so whatever the turn
    // length is the performance can index them.
    const spans: Span[] = [];
    /**
     * A SPAN ONLY EVER TAKES AWAY, never adds, and that is forced rather
     * than chosen. How many spans a section uses depends on how long a turn
     * of its loop is, which the materials work out and this stage cannot
     * know — so more are built here than may be read. A part added in a span
     * that is never reached would sit in the union below, claim to be heard
     * in the section, and sound nowhere: exactly what "nothing silent"
     * forbids, and what it caught.
     *
     * So the rule's two upward ways are unavailable here, and a section
     * already down to the fewest a genre carries AND already thin has
     * nothing left to move. Twenty-five intros in eighty records are in that
     * position, holding one loop still for four turns. An intro cannot let
     * the next part in early either — it holds the first parts of the entry
     * order by a law of its own, tested as such. That law wins, so this is
     * the gap and not a bug, and the intro is at least the one place where
     * an ear has not yet heard the idea twice.
     */
    let shedAt = 0;
    /** One part out, the one the genre can most afford, rotating. Null if none may go. */
    const oneOut = (): Set<Role> | null => {
      if (heard.size <= A.fewest) return null;
      for (let k = 0; k < A.shed.length; k++) {
        const r = A.shed[(shedAt + k) % A.shed.length]!;
        if (!heard.has(r)) continue;
        shedAt = (shedAt + k + 1) % A.shed.length;
        const fewer = new Set(heard);
        fewer.delete(r);
        return fewer;
      }
      return null;
    };
    for (let s = 0; s < Math.max(1, Math.ceil(section.bars / 2)); s++) {
      if (s % 2 === 0) {
        // the section as the form asked for it: two turns of it, then a change
        spans.push({ heard: new Set(heard), thin });
        continue;
      }
      // A PEAK NEVER LOSES A PART — "the peak has everyone, because that is
      // what a peak is" — so at a peak the change is expression: a breath,
      // not a hole.
      if (section.peak) {
        spans.push({ heard: new Set(heard), thin: true });
        continue;
      }
      // and off the peak, alternate which axis moves, so a section is not
      // the same trick four times
      const partFirst = ((s - 1) / 2) % 2 === 0;
      const part = partFirst ? oneOut() : null;
      if (part !== null) {
        spans.push({ heard: part, thin });
      } else if (!thin) {
        spans.push({ heard: new Set(heard), thin: true });
      } else {
        // already a breath, so the change has to be a part
        const other = oneOut();
        spans.push(other !== null ? { heard: other, thin } : { heard: new Set(heard), thin });
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

  return Object.freeze({ placed: Object.freeze(placed) });
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
