/**
 * WHICH MANNER A NOTE IS PLAYED IN.
 *
 * The genre says how often a part reaches for each manner. It does not say
 * WHERE, and it must not: a manner is not a coin flip laid over a line, it is
 * a thing a player does because of where the note is and what is either side
 * of it. Drawn blind, ghost notes land on downbeats and hammer-ons appear
 * after rests, and both are audibly wrong in a way no weight can fix.
 *
 * So the same shape as everywhere else in this program: THE LAWS FIRST, as
 * filters on what is available, then the genre's weights among whatever
 * survived. Each law is a fact about the technique, not a preference:
 *
 *   A GHOST IS AN ANTI-ACCENT and lives where an accent does not. Ghost notes
 *   are "quiet notes within drum beats" whose whole function is that "a
 *   strong accent sounds stronger when it is surrounded by softer notes"
 *   (drumstheword.com, "Ghost Notes"; blog.samplefocus.com). A ghosted
 *   downbeat is not a ghost, it is a missing downbeat.
 *
 *   AN ACCENT NEEDS SOMETHING TO BE ACCENTED AGAINST, so it goes where the
 *   metre already leans — on a beat. An accent everywhere is an accent
 *   nowhere.
 *
 *   A HAMMER-ON OR PULL-OFF IS PLAYED WITH THE HAND ALREADY ON THE STRING.
 *   It needs a note immediately before it to be hammered from, and it reaches
 *   only as far as a hand does: "use hammer-ons whenever you're ascending the
 *   scale, and pull-offs when you're descending" (guitarlessons.com, "Legato
 *   Hammer-Ons & Pull-Offs"), both of them between neighbouring fingers. So a
 *   slur needs a predecessor within a few semitones, and cannot slur from
 *   silence or across a leap.
 *
 *   A SLIDE ARRIVES FROM SOMEWHERE. It is a finger travelling along a string,
 *   so it too needs a note to have travelled from.
 *
 *   A BEND AND A TREMOLO NEED TIME. A bend "increases the pitch of a note"
 *   while it sounds (en.wikipedia.org/wiki/String_bending) and the travel
 *   takes about a tenth of a second; a tremolo is one note struck several
 *   times. Neither fits in a note that is already over.
 */

import { ART, type ArtName } from "../../core/articulation.ts";
import type { Rng } from "../../core/rng.ts";
import type { Weighted } from "../../genre/spec.ts";

/** Where a note sits, and what is either side of it. */
export interface Where {
  /** Is it on a beat? The metre's own hierarchy, decided by the caller. */
  readonly strong: boolean;
  /** How long it is, in grid steps. */
  readonly dur: number;
  /** Semitones from the note before it, or null if there is none — a rest, or the first note. */
  readonly from: number | null;
}

/** The furthest apart two notes can be and still be slurred: a hand's span on one string. */
const SLUR_REACH = 4;

/** Below this many steps a note is over before a bend or a tremolo could happen. */
const NEEDS_TIME = 2;

/** Can this manner be played on this note at all? */
function fits(name: ArtName, w: Where): boolean {
  switch (name) {
    case "ghost":
      return !w.strong;
    case "accent":
    case "marcato":
      return w.strong;
    case "slur":
      return w.from !== null && w.from !== 0 && Math.abs(w.from) <= SLUR_REACH;
    case "slide":
      return w.from !== null && w.from !== 0;
    case "bend":
    case "tremolo":
      return w.dur >= NEEDS_TIME;
    default:
      return true;
  }
}

/**
 * The manner for one note: the genre's weights, over what this position and
 * this instrument allow. `pool` has already been checked at load against what
 * the instrument can physically do, so what is filtered here is only ever
 * position — and `plain` always survives, so a note always has an answer.
 */
export function manner(rng: Rng, name: string | number, pool: Weighted<ArtName>, w: Where): ArtName {
  const legal = pool.filter(([a, weight]) => weight > 0 && a in ART && fits(a, w));
  if (legal.length === 0) return "plain";
  return rng.weighted(name, legal);
}
