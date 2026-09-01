/**
 * Stage 3 — THE MATERIALS.
 *
 * Every note a record can contain, built once per IDEA and frozen. A section
 * points at a material; it never edits one.
 *
 * ONLY WHAT THE FORM ASKS FOR IS BUILT. The form says which ideas it states
 * and which statements must vary, and this stage builds exactly that set — a
 * plain A, a first variant of A, a plain B. Nothing is composed on the chance
 * it might be played, so a material that is built and never heard cannot
 * exist. That was the commonest way the old program lied to itself, and it is
 * closed off structurally rather than checked for.
 *
 * A VARIANT KEEPS THE CHORDS AND REDRAWS THE PARTS. An idea coming back
 * changed still stands on its own changes; what differs is what is played
 * over them. Changing the harmony too would make it a different section, not
 * the same one returning.
 *
 * THE CHECKS THROW. A note outside its register, a pitch outside the scale,
 * two parts on one pitch at one instant — each is a bug in a builder, and a
 * bug that produces a record is a bug found weeks later by ear. They name
 * the material, the part, the bar, the step and the pitch.
 */

import { stepsPerBar } from "../../core/clock.ts";
import { inScale, noteName } from "../../core/theory.ts";
import type { Idea } from "../../genre/spec.ts";
import type { Chart } from "../chart.ts";
import type { Form } from "../form.ts";
import { drawBass } from "./bass.ts";
import { drawChords } from "./harmony.ts";
import { drawKeys } from "./keys.ts";
import { assertInside, at, PITCHED, type Chord, type Material, type Note, type Pitched } from "./note.ts";

export type { Chord, Material, Note, Pitched } from "./note.ts";

export interface Materials {
  readonly bars: number;
  /** Every material built, by key. */
  readonly all: ReadonlyMap<string, Material>;
  /** The key of the material each section plays, by section index. */
  readonly bySection: readonly string[];
}

export class MaterialError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MaterialError";
  }
}

const keyOf = (idea: Idea, variant: number): string => (variant === 0 ? idea : `${idea}/${variant}`);

export function makeMaterials(chart: Chart, form: Form): Materials {
  const steps = stepsPerBar(chart.metre);
  const bars = chart.genre.harmony.bars;

  // which (idea, variant) each section needs — the demand, read off the form
  const variantsSeen = new Map<Idea, number>();
  const bySection: string[] = [];
  for (const s of form.sections) {
    let variant = 0;
    if (s.vary) {
      variant = (variantsSeen.get(s.idea) ?? 0) + 1;
      variantsSeen.set(s.idea, variant);
    }
    bySection.push(keyOf(s.idea, variant));
  }

  const chordsOf = new Map<Idea, readonly Chord[]>();
  const all = new Map<string, Material>();

  for (const key of new Set(bySection)) {
    const [ideaStr, vStr] = key.split("/");
    const idea = ideaStr as Idea;
    const variant = vStr === undefined ? 0 : Number(vStr);

    let chords = chordsOf.get(idea);
    if (chords === undefined) {
      chords = Object.freeze(drawChords(chart, idea));
      chordsOf.set(idea, chords);
    }

    const rng = chart.rng.at("material", idea, variant);
    const parts: Record<Pitched, readonly Note[]> = {
      bass: Object.freeze(drawBass(chart, chords, rng.at("bass"), steps)),
      keys: Object.freeze(drawKeys(chart, chords, rng.at("keys"), steps)),
    };

    const material: Material = Object.freeze({ key, idea, variant, bars, chords, parts });
    check(chart, material, steps);
    all.set(key, material);
  }

  return Object.freeze({ bars, all, bySection: Object.freeze(bySection) });
}

/** The invariants every material holds, or the material does not exist. */
function check(chart: Chart, m: Material, steps: number): void {
  const registers: Record<Pitched, readonly [number, number]> = {
    bass: chart.genre.bass.register,
    keys: chart.genre.keys.register,
  };
  const struck = new Map<string, Pitched>();

  for (const part of PITCHED) {
    const [lo, hi] = registers[part];
    for (const n of m.parts[part]) {
      const where = `${m.key} ${part} bar ${n.bar} step ${n.step}`;
      assertInside({ bars: m.bars, steps }, n, where);

      if (n.pitch < lo || n.pitch > hi) {
        throw new MaterialError(`${where}: ${noteName(n.pitch)} is outside ${part}'s register ${lo}..${hi}`);
      }
      if (!inScale(chart.tonic, chart.scale, n.pitch)) {
        throw new MaterialError(`${where}: ${noteName(n.pitch)} is not in ${chart.scaleName}`);
      }
      if (n.vel <= 0 || n.vel > 1) throw new MaterialError(`${where}: velocity ${n.vel}`);

      const seat = `${at(n)}:${n.pitch}`;
      const other = struck.get(seat);
      if (other !== undefined && other !== part) {
        throw new MaterialError(
          `${where}: ${part} lands on ${other}'s ${noteName(n.pitch)} — two parts on one pitch at one instant`,
        );
      }
      struck.set(seat, part);
    }
  }
}

/** "A: Cm7 Ab Fm G | bass 8 · keys 16" — for tests and dumps. */
export function describeMaterial(m: Material): string {
  const parts = PITCHED.map((p) => `${p} ${m.parts[p].length}`).join(" · ");
  return `${m.key}: ${m.chords.map((c) => c.name).join(" ")} | ${parts}`;
}
