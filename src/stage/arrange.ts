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
 */

import type { ArrangementRules, Idea, IntroKind, Role } from "../genre/spec.ts";
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
  /** The break: below the floor, carrying what the record opened with. */
  readonly broken: boolean;
}

export interface Arrangement {
  readonly placed: readonly Placed[];
}

/** The key of the material an idea's nth variant is: "A", then "A/1", "A/2". */
export const materialKey = (idea: Idea, variant: number): string => (variant === 0 ? idea : `${idea}/${variant}`);

/**
 * WHAT THE RECORD OPENS WITH, by the kind of intro the genre drew.
 *
 * An intro is the record's own material with something withheld, and which
 * thing is withheld is what kind of intro it is — see INTRO_KINDS in the spec
 * for the sources. The one rule that is not a matter of degree is the rhythm
 * intro's: it is the drums, or the drums and the bass, and NOTHING else,
 * because it works "because there is little or no melody or harmony to attend
 * to" (Burns 1987). Adding the keys to it does not make a bigger rhythm
 * intro, it makes it not one.
 */
function opensWith(kind: IntroKind, A: ArrangementRules): Set<Role> {
  const first = A.enter.slice(0, Math.max(1, A.introParts));
  switch (kind) {
    case "rhythm": {
      // the drums, and the bass with them if the genre brings the bass in
      // early — "solo drums, solo bass, or drums and bass in duet"
      const out = new Set<Role>(["drums"]);
      if (A.introParts >= 2 && A.enter.indexOf("bass") <= 2) out.add("bass");
      return out;
    }
    case "hook": {
      // the tune from bar one, over whatever foundation the intro carries
      const out = new Set<Role>(first);
      out.add("lead");
      return out;
    }
    case "bed": {
      // the foundation without the tune: what the intro withholds is what
      // arrives when it ends
      const out = new Set<Role>(first);
      if (out.size > 1) out.delete("lead");
      return out;
    }
  }
}

/**
 * WHERE THE BREAK GOES, decided with the whole form in view.
 *
 * A breakdown is made by "stripping away of other instruments and vocals" and
 * breakdowns "usually precede or follow heightened musical climaxes"; it sits
 * where a bridge would, "after the second chorus"
 * (en.wikipedia.org/wiki/Breakdown_(music)). So it is the LAST quiet section
 * before the record's biggest moment — the last breath before the peak.
 *
 * Chosen here rather than inside the walk because which section is the last
 * quiet one before the peak is a fact about the whole form, and the form is
 * already finished when this runs. It is a decision made with full knowledge,
 * not a pass that repairs a choice already made.
 */
function breakAt(form: Form, thinBelow: number): number {
  // never the opening (a record cannot break away from something it has not
  // played yet) and never the outro (a break is a contrast, and the end of a
  // record is not something the record comes back from)
  const quiet = form.sections.filter(
    (s) => s.index > 0 && s.index < form.sections.length - 1 && (s.fn === "bridge" || s.energy < thinBelow),
  );
  const before = quiet.filter((s) => s.index < form.peakAt);
  // the last breath before the climax, or — "breakdowns usually precede OR
  // FOLLOW heightened musical climaxes" — the first one after it
  if (before.length > 0) return before[before.length - 1]!.index;
  const after = quiet.filter((s) => s.index > form.peakAt);
  return after.length > 0 ? after[0]!.index : -1;
}

export function makeArrangement(chart: Chart, form: Form): Arrangement {
  const A = chart.genre.arrangement;
  const lastIn = A.enter[A.enter.length - 1]!;
  // WHICH WAY IN, drawn once for the record. A cold open has no intro section
  // and still has an opening: whatever plays in bar one is what the record
  // opened with, and the rules below are about that.
  const kind = chart.rng.at("arrange").weighted("intro", A.intro);
  const breaks = A.breakdown ? breakAt(form, A.thinBelow) : -1;

  // a statement the form marks `vary` plays the idea's next variant, and
  // every statement after it that is not marked plays the plain one again
  const variantsSeen = new Map<Idea, number>();
  const sectionsHeard = new Map<Role, number>();
  // how many of the entry order have arrived; the intro's parts are in from the top
  let arrived = A.introParts;
  /** What the record opened with — the first section's parts, whatever it is. */
  let openers = new Set<Role>();
  const placed: Placed[] = form.sections.map((section) => {
    let variant = 0;
    if (section.vary) {
      variant = (variantsSeen.get(section.idea) ?? 0) + 1;
      variantsSeen.set(section.idea, variant);
    }

    let heard: Set<Role>;
    if (section.index === breaks && openers.size > 0) {
      // THE BREAK. The one section that goes below the floor, and it carries
      // what the record opened with — at most two parts, because a break with
      // three in it is a quiet verse. [chosen] at two; the source says
      // "stripping away", and does not count.
      heard = new Set(A.enter.filter((r) => openers.has(r)).slice(0, 2));
    } else if (section.fn === "intro") {
      heard = opensWith(kind, A);
      // a part the intro carries has arrived, whatever its place in the entry
      // order: a record that opens on its drums has introduced them
      arrived = Math.max(arrived, ...[...heard].map((r) => A.enter.indexOf(r) + 1));
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
      // A SHED ORDER THAT PROTECTS THE OPENING WAS TRIED HERE AND MEASURED AT
      // NOTHING. The idea was Ewer's — an intro's material "can then be used
      // to help take the end of a chorus to the beginning of the next verse,
      // or serve as an outro" — implemented as: move whatever opened the
      // record to the end of the shed order, so it is the last thing to go.
      // Measured over sixty seeds, with the rule on and off: the opening was
      // in the outro of 100% of records either way, present in 97% of sections
      // either way, and in the record's thinnest section 82% either way. It
      // changes nothing because a section here sheds ONE part at a time, and
      // the first name in the shed order is never an opener in either genre.
      // A knob that does nothing is this program's cardinal sin, so it is not
      // a knob. What the opening actually needed was somewhere to be heard
      // alone, and that is the break above.
      for (const r of A.shed) {
        if (heard.size <= playing) break;
        heard.delete(r);
      }
      // AND THE LAST PART IN IS STILL THE FIRST OUT OF AN OUTRO, once the
      // record has earned its absence: a part heard in one section is not yet
      // something an ear can miss.
      if (section.fn === "outro" && heard.size > A.fewest && (sectionsHeard.get(lastIn) ?? 0) >= 2) heard.delete(lastIn);
    }
    if (section.index === 0) openers = new Set(heard);
    for (const r of heard) sectionsHeard.set(r, (sectionsHeard.get(r) ?? 0) + 1);

    // A RHYTHM INTRO IS NOT THINNED. Every other quiet section loses its hat
    // and its fills — a breath, not a stop — but an intro whose whole subject
    // is the drums cannot introduce them with the drums taken apart: it works
    // "because there is little or no melody or harmony to attend to"
    // (Burns 1987), and what is left has to be worth attending to.
    const broken = section.index === breaks && openers.size > 0;
    // and a break is not "thinned": there is nothing left in it to thin, and
    // the drums it may consist of are the thing being heard
    const thin = !broken && !section.peak && (section.fn === "bridge" || section.energy < A.thinBelow)
      && !(section.fn === "intro" && kind === "rhythm");
    return Object.freeze({
      section,
      material: materialKey(section.idea, variant),
      heard: Object.freeze(heard) as ReadonlySet<Role>,
      thin,
      broken,
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
      return `${p.section.fn}[${who}${p.thin ? "·thin" : ""}${p.broken ? "·break" : ""}]`;
    })
    .join(" ");
}
