/**
 * Stage 4 — THE MATERIALS.
 *
 * Every note a record can contain, built once per IDEA and frozen. A section
 * points at a material; it never edits one.
 *
 * ONLY WHAT IS HEARD IS BUILT. The arrangement says which material each
 * section plays and which parts are heard in it, and this stage builds
 * exactly that: a plain A, a first variant of A, a plain B, and for each of
 * them as many lead lines and drum phrases as those parts will play. Nothing
 * is composed on the chance it might be played, so a material — or a cycle
 * of one — that is built and never heard cannot exist. That was the
 * commonest way the old program lied to itself, and it is closed off
 * structurally rather than checked for.
 *
 * A VARIANT KEEPS THE CHORDS AND REDRAWS THE PARTS. An idea coming back
 * changed still stands on its own changes; what differs is what is played
 * over them. Changing the harmony too would make it a different section, not
 * the same one returning.
 *
 * THE TUNE AND THE DRUMS ARE WRITTEN PER TIME ROUND. Each time the lead plays
 * a material through — across the whole record, not within one section — it
 * restates, develops or rests by the material's plan, and each time the
 * drums do they treat their figure differently. A chorus heard three times
 * at eight bars is six times round, and the sixth is not the first. The
 * groove under them loops, because a groove is the thing that is allowed to.
 *
 * THE CHECKS THROW. A note outside its register, a pitch outside the scale,
 * two parts on one pitch at one instant — each is a bug in a builder, and a
 * bug that produces a record is a bug found weeks later by ear. They name
 * the material, the part, the bar, the step and the pitch.
 */

import { stepsPerBar } from "../../core/clock.ts";
import { inScale, noteName } from "../../core/theory.ts";
import { DRUM_LANES, type Idea, type Role } from "../../genre/spec.ts";
import type { Arrangement } from "../arrange.ts";
import type { Chart } from "../chart.ts";
import { drawBass } from "./bass.ts";
import { drawDrums, drawFigure } from "./drums.ts";
import { drawChords } from "./harmony.ts";
import { drawKeys } from "./keys.ts";
import { drawLead } from "./lead.ts";
import { assertInside, at, GROOVE, type Chord, type Material, type Note, type Pitched } from "./note.ts";

export type { Chord, Figure, GrooveRole, Hit, Material, Note, Pitched } from "./note.ts";
export { GROOVE } from "./note.ts";

export interface Materials {
  readonly bars: number;
  /** Every material built, by key. */
  readonly all: ReadonlyMap<string, Material>;
}

export class MaterialError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MaterialError";
  }
}

/** How many times each part plays each material through, over the whole record. */
function timesRound(arrangement: Arrangement, bars: number): ReadonlyMap<string, ReadonlyMap<Role, number>> {
  const out = new Map<string, Map<Role, number>>();
  for (const p of arrangement.placed) {
    const per = out.get(p.material) ?? new Map<Role, number>();
    for (const role of p.heard) per.set(role, (per.get(role) ?? 0) + Math.ceil(p.section.bars / bars));
    out.set(p.material, per);
  }
  return out;
}

export function makeMaterials(chart: Chart, arrangement: Arrangement): Materials {
  const steps = stepsPerBar(chart.metre);
  const bars = chart.genre.harmony.bars;
  const rounds = timesRound(arrangement, bars);

  const chordsOf = new Map<Idea, readonly Chord[]>();
  const all = new Map<string, Material>();

  for (const [key, times] of rounds) {
    const [ideaStr, vStr] = key.split("/");
    const idea = ideaStr as Idea;
    const variant = vStr === undefined ? 0 : Number(vStr);

    let chords = chordsOf.get(idea);
    if (chords === undefined) {
      chords = Object.freeze(drawChords(chart, idea));
      chordsOf.set(idea, chords);
    }

    const rng = chart.rng.at("material", idea, variant);
    // the drum figure first: the bass may take its feet from the kick
    const figure = drawFigure(chart, rng.at("drums"));
    const bass = Object.freeze(drawBass(chart, chords, rng.at("bass"), steps, figure.kick));
    const keys = Object.freeze(drawKeys(chart, chords, rng.at("keys"), steps));
    // the tune is written last and is told every seat the others hold, so it
    // never lands on one — a rule at the point of choice, not a repair after
    const taken = new Set<string>();
    for (const n of [...bass, ...keys]) taken.add(`${at(n)}:${n.pitch}`);
    const groove = Object.freeze({ bass, keys });

    // the tune's plan, applied to every time the lead plays this material
    // through; the development is written only where a time will play it
    const leadRng = rng.at("lead");
    const plan = leadRng.weighted("cycles", chart.genre.lead.cycles);
    const letters = Array.from({ length: times.get("lead") ?? 0 }, (_, n) => plan[n % plan.length]!);
    const tune = letters.length > 0 ? Object.freeze(drawLead(chart, chords, leadRng, steps, taken)) : null;
    const developed = letters.includes("B") ? Object.freeze(drawLead(chart, chords, leadRng, steps, taken, true)) : null;
    const tacet: readonly Note[] = Object.freeze([]);
    const lead = Object.freeze(letters.map((l) => (l === "A" ? tune! : l === "B" ? developed! : tacet)));

    const drums = Object.freeze(
      Array.from({ length: times.get("drums") ?? 0 }, (_, n) => Object.freeze(drawDrums(chart, rng.at("drums"), figure, bars, steps, n))),
    );

    const material: Material = Object.freeze({ key, idea, variant, bars, chords, groove, lead, figure, drums });
    check(chart, material, steps);
    all.set(key, material);
  }

  return Object.freeze({ bars, all });
}

/** The invariants every material holds, or the material does not exist. */
function check(chart: Chart, m: Material, steps: number): void {
  const registers: Record<Pitched, readonly [number, number]> = {
    bass: chart.genre.bass.register,
    keys: chart.genre.keys.register,
    lead: chart.genre.lead.register,
  };
  const grooveSeats = new Map<string, Pitched>();

  const checkNote = (part: Pitched, n: Note, where: string, seats: Map<string, Pitched>): void => {
    const [lo, hi] = registers[part];
    assertInside({ bars: m.bars, steps }, n, where);
    if (n.pitch < lo || n.pitch > hi) {
      throw new MaterialError(`${where}: ${noteName(n.pitch)} is outside ${part}'s register ${lo}..${hi}`);
    }
    if (!inScale(chart.tonic, chart.scale, n.pitch)) {
      throw new MaterialError(`${where}: ${noteName(n.pitch)} is not in ${chart.scaleName}`);
    }
    if (n.vel <= 0 || n.vel > 1) throw new MaterialError(`${where}: velocity ${n.vel}`);
    const seat = `${at(n)}:${n.pitch}`;
    const other = seats.get(seat);
    if (other !== undefined && other !== part) {
      throw new MaterialError(
        `${where}: ${part} lands on ${other}'s ${noteName(n.pitch)} — two parts on one pitch at one instant`,
      );
    }
    seats.set(seat, part);
  };

  for (const part of GROOVE) {
    for (const n of m.groove[part]) checkNote(part, n, `${m.key} ${part} bar ${n.bar} step ${n.step}`, grooveSeats);
  }
  for (const [time, line] of m.lead.entries()) {
    const seats = new Map(grooveSeats);
    for (const n of line) checkNote("lead", n, `${m.key} lead time ${time} bar ${n.bar} step ${n.step}`, seats);
  }

  for (const [time, hits] of m.drums.entries()) {
    const struck = new Set<string>();
    for (const h of hits) {
      const where = `${m.key} drums time ${time} bar ${h.bar} step ${h.step}`;
      assertInside({ bars: m.bars, steps }, { ...h, dur: 1, pitch: 0 }, where);
      if (!(DRUM_LANES as readonly string[]).includes(h.lane)) throw new MaterialError(`${where}: no lane "${h.lane}"`);
      if (h.vel <= 0 || h.vel > 1) throw new MaterialError(`${where}: velocity ${h.vel}`);
      const seat = `${at(h)}:${h.lane}`;
      if (struck.has(seat)) throw new MaterialError(`${where}: ${h.lane} struck twice at one instant`);
      struck.add(seat);
    }
  }
}

/** "A: Cm7 Ab Fm G | bass 8 · keys 16 · lead 14/14/11/14 · drums 40/38/41/36" — for tests and dumps. */
export function describeMaterial(m: Material): string {
  const groove = GROOVE.map((p) => `${p} ${m.groove[p].length}`).join(" · ");
  const lead = m.lead.map((l) => l.length).join("/") || "-";
  const drums = m.drums.map((h) => h.length).join("/") || "-";
  return `${m.key}: ${m.chords.map((c) => c.name).join(" ")} | ${groove} · lead ${lead} · drums ${drums}`;
}
