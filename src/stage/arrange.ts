/**
 * Stage 4 — THE ARRANGEMENT.
 *
 * Which of a material's parts are heard in each section. Nothing but
 * selection: no note is written, moved or edited here.
 *
 * PARTS ARE NEVER LISTED PER SECTION. Every part the material has is heard
 * unless a rule takes it away, and the rules are few and named: an intro
 * holds the first few parts of the genre's entry order; an outro lets the
 * last-entered part go; a bridge and any section below the genre's energy
 * threshold thin the drums. A part cannot be silent by omission — the way a
 * whole voice went unheard on every seed of the old program was a section
 * table that forgot to name it, and there is no table here to forget.
 */

import type { Role } from "../genre/spec.ts";
import { ROLES } from "../genre/spec.ts";
import type { Chart } from "./chart.ts";
import type { Form, Section } from "./form.ts";
import type { Materials } from "./material/index.ts";

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

export function makeArrangement(chart: Chart, form: Form, materials: Materials): Arrangement {
  const A = chart.genre.arrangement;
  const everything: ReadonlySet<Role> = new Set(ROLES);
  const lastIn = A.enter[A.enter.length - 1]!;

  const heardBefore = new Set<Role>();
  const placed: Placed[] = form.sections.map((section, i) => {
    let heard: Set<Role>;
    switch (section.fn) {
      case "intro":
        heard = new Set(A.enter.slice(0, A.introParts));
        break;
      case "outro":
        heard = new Set(everything);
        // the last part in lets go first — unless it has never been heard,
        // in which case the record has not earned taking it away
        if (heardBefore.has(lastIn)) heard.delete(lastIn);
        break;
      default:
        heard = new Set(everything);
    }
    for (const r of heard) heardBefore.add(r);

    const thin = !section.peak && (section.fn === "bridge" || section.energy < A.thinBelow);
    return Object.freeze({
      section,
      material: materials.bySection[i]!,
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
