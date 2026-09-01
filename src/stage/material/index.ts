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
 * A MATERIAL IS REALISED PER CYCLE. A section longer than its material plays
 * the material round again, and the second time round is not the first: the
 * drums treat their figure differently and the tune restates, develops or
 * rests by its plan. The groove under them loops, because a groove is the
 * thing that is allowed to. Exactly as many cycles are built as the longest
 * section playing the material will hear.
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
import { DRUM_LANES } from "../../genre/spec.ts";
import { drawBass } from "./bass.ts";
import { drawDrums } from "./drums.ts";
import { drawChords } from "./harmony.ts";
import { drawKeys } from "./keys.ts";
import { drawLead } from "./lead.ts";
import { assertInside, at, PITCHED, type Chord, type Cycle, type Material, type Note, type Pitched } from "./note.ts";

export type { Chord, Cycle, Hit, Material, Note, Pitched } from "./note.ts";

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

  // how many times the longest section playing each material cycles it
  const cyclesOf = new Map<string, number>();
  form.sections.forEach((s, i) => {
    const key = bySection[i]!;
    cyclesOf.set(key, Math.max(cyclesOf.get(key) ?? 1, Math.ceil(s.bars / bars)));
  });

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
    const bass = Object.freeze(drawBass(chart, chords, rng.at("bass"), steps));
    const keys = Object.freeze(drawKeys(chart, chords, rng.at("keys"), steps));
    // the tune is written last and is told every seat the others hold, so it
    // never lands on one — a rule at the point of choice, not a repair after
    const taken = new Set<string>();
    for (const n of [...bass, ...keys]) taken.add(`${at(n)}:${n.pitch}`);
    const leadRng = rng.at("lead");
    const plan = leadRng.weighted("cycles", chart.genre.lead.cycles);
    const cycles = cyclesOf.get(key)!;
    const letters = Array.from({ length: cycles }, (_, c) => plan[c % plan.length]!);
    const tune = Object.freeze(drawLead(chart, chords, leadRng, steps, taken));
    // the development is written only where a cycle will play it
    const developed = letters.includes("B") ? Object.freeze(drawLead(chart, chords, leadRng, steps, taken, true)) : null;
    const tacet: readonly Note[] = Object.freeze([]);

    const realised: Cycle[] = letters.map((letter, c) => {
      const lead = letter === "A" ? tune : letter === "B" ? developed! : tacet;
      const parts: Readonly<Record<Pitched, readonly Note[]>> = Object.freeze({ bass, keys, lead });
      const drums = Object.freeze(drawDrums(chart, rng.at("drums"), bars, steps, c));
      return Object.freeze({ parts, drums });
    });

    const material: Material = Object.freeze({ key, idea, variant, bars, chords, cycles: Object.freeze(realised) });
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
    lead: chart.genre.lead.register,
  };
  for (const [cycle, c] of m.cycles.entries()) {
  const struck = new Map<string, Pitched>();

  for (const part of PITCHED) {
    const [lo, hi] = registers[part];
    for (const n of c.parts[part]) {
      const where = `${m.key} cycle ${cycle} ${part} bar ${n.bar} step ${n.step}`;
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

  const struckDrums = new Set<string>();
  for (const h of c.drums) {
    const where = `${m.key} drums cycle ${cycle} bar ${h.bar} step ${h.step}`;
    assertInside({ bars: m.bars, steps }, { ...h, dur: 1, pitch: 0 }, where);
    if (!(DRUM_LANES as readonly string[]).includes(h.lane)) throw new MaterialError(`${where}: no lane "${h.lane}"`);
    if (h.vel <= 0 || h.vel > 1) throw new MaterialError(`${where}: velocity ${h.vel}`);
    const seat = `${at(h)}:${h.lane}`;
    if (struckDrums.has(seat)) throw new MaterialError(`${where}: ${h.lane} struck twice at one instant`);
    struckDrums.add(seat);
  }
  }
}

/** "A: Cm7 Ab Fm G | bass 8 · keys 16 · lead 14/14/11/14 · drums 40/38/41/36" — for tests and dumps. */
export function describeMaterial(m: Material): string {
  const perCycle = (f: (c: Cycle) => number): string => m.cycles.map(f).join("/");
  const parts = PITCHED.map((p) => `${p} ${perCycle((c) => c.parts[p].length)}`).join(" · ");
  return `${m.key}: ${m.chords.map((c) => c.name).join(" ")} | ${parts} · drums ${perCycle((c) => c.drums.length)}`;
}
