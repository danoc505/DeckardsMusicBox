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
 * The examples do this at a scale this program cannot yet reach and the
 * direction is the same: Shine On's drums enter a third of the way in and
 * its saxophone with a sixth of the record left; Televators keeps its solo
 * guitar to thirty bars in the middle and puts three bars of bongos at the
 * very end. A part is worth more where it is missing.
 *
 * A bridge or a quiet section also thins the drums: a breath, not a stop.
 */

import type { Idea, Role } from "../genre/spec.ts";
import { ROLES } from "../genre/spec.ts";
import type { Chart } from "./chart.ts";
import type { Form, Section } from "./form.ts";

export interface Placed {
  readonly section: Section;
  /** The key of the material this section plays. */
  readonly material: string;
  /** The parts heard here. */
  readonly heard: ReadonlySet<Role>;
  /** The drums lose their hat and their fills: a breath, not a stop. */
  readonly thin: boolean;
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
    for (const r of heard) sectionsHeard.set(r, (sectionsHeard.get(r) ?? 0) + 1);

    const thin = !section.peak && (section.fn === "bridge" || section.energy < A.thinBelow);
    return Object.freeze({
      section,
      material: materialKey(section.idea, variant),
      heard: Object.freeze(heard) as ReadonlySet<Role>,
      thin,
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
