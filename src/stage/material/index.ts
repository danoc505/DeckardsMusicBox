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
import { DRUM_LANES, type Contour, type Idea, type Role } from "../../genre/spec.ts";
import type { Rng } from "../../core/rng.ts";
import type { Arrangement } from "../arrange.ts";
import type { Chart } from "../chart.ts";
import { drawBass } from "./bass.ts";
import { drawDrone } from "./drone.ts";
import { drawDrums, drawFigure } from "./drums.ts";
import { drawChords, harmonicPeriod } from "./harmony.ts";
import { drawKeys } from "./keys.ts";
import { contourOf, drawLead } from "./lead.ts";
import { assertInside, at, GROOVE, Sounding, type Chord, type Hit, type Material, type Note, type Pitched } from "./note.ts";
import { CHANGES, otherChange, varyLine, type Change } from "./vary.ts";

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

/**
 * A development that comes out note for note the statement is not one. The
 * answers are drawn again from a fresh address until they differ; where the
 * laws leave the answer only one way to go, a handful of tries is the honest
 * limit and the last is kept.
 */
function develop(chart: Chart, chords: readonly Chord[], rng: Rng, steps: number, sounding: Sounding, tune: readonly Note[], period: number, contour: Contour): Note[] {
  // WHAT IS PLAYED, not how. A line that lands on the same pitches at the
  // same instants and merely hammers one of them where the statement picked
  // it is the statement played again, and accepting it as a development is
  // how a section comes back "changed" and sounds identical.
  const notes = (l: readonly Note[]): string =>
    l.filter((n) => n.bar < period).map((n) => `${n.bar}:${n.step}:${n.dur}:${n.pitch}`).join();
  const same = (a: readonly Note[], b: readonly Note[]): boolean => notes(a) === notes(b);
  let line: Note[] = [];
  for (let attempt = 1; attempt <= 6; attempt++) {
    line = drawLead(chart, chords, rng, steps, sounding, attempt, contour);
    if (!same(line, tune)) break;
  }
  return line;
}

interface Rounds {
  /** How many times each part plays this material through, over the whole record. */
  readonly times: ReadonlyMap<Role, number>;
  /**
   * The rounds at which a SECTION begins, per part. A plan may rest a round
   * — a breath in the middle of a long stretch — but a section whose first
   * round is that rest has a part it says is heard and never hears it, which
   * is the silence-by-omission this program is built to make impossible.
   */
  readonly opens: ReadonlyMap<Role, ReadonlySet<number>>;
}

function timesRound(arrangement: Arrangement, bars: number): ReadonlyMap<string, Rounds> {
  const times = new Map<string, Map<Role, number>>();
  const opens = new Map<string, Map<Role, Set<number>>>();
  for (const p of arrangement.placed) {
    const per = times.get(p.material) ?? new Map<Role, number>();
    const firsts = opens.get(p.material) ?? new Map<Role, Set<number>>();
    for (const role of p.heard) {
      const before = per.get(role) ?? 0;
      (firsts.get(role) ?? firsts.set(role, new Set()).get(role)!).add(before);
      per.set(role, before + Math.ceil(p.section.bars / bars));
    }
    times.set(p.material, per);
    opens.set(p.material, firsts);
  }
  const out = new Map<string, Rounds>();
  for (const [key, per] of times) out.set(key, { times: per, opens: opens.get(key)! });
  return out;
}

export function makeMaterials(chart: Chart, arrangement: Arrangement): Materials {
  const steps = stepsPerBar(chart.metre);
  const bars = chart.genre.harmony.bars;
  const rounds = timesRound(arrangement, bars);

  const chordsOf = new Map<Idea, readonly Chord[]>();
  const all = new Map<string, Material>();

  // PLAIN STATEMENTS FIRST, so a variant has the thing it varies. A variant
  // is a descendant and not a sibling: it inherits its groove note for note
  // and changes the beat and the tune, which is what makes it the same idea
  // coming back rather than a different section over the same chords.
  const order = [...rounds.keys()].sort((a, b) => {
    const v = (k: string): number => (k.includes("/") ? Number(k.split("/")[1]) : 0);
    return v(a) - v(b) || a.localeCompare(b);
  });

  for (const key of order) {
    const { times, opens } = rounds.get(key)!;
    const [ideaStr, vStr] = key.split("/");
    const idea = ideaStr as Idea;
    const variant = vStr === undefined ? 0 : Number(vStr);

    let chords = chordsOf.get(idea);
    if (chords === undefined) {
      chords = Object.freeze(drawChords(chart, idea));
      chordsOf.set(idea, chords);
    }

    const rng = chart.rng.at("material", idea, variant);
    // A VARIANT INHERITS THE BEAT'S SKELETON as well as the groove: the same
    // pockets and the same hat division, treated differently. Drawing its own
    // figure while inheriting the bass would put the bass on a kick that is
    // no longer there, which is the one thing the two are written together to
    // avoid.
    const plainOf = variant > 0 ? all.get(idea) : undefined;
    // the drum figure first: the bass may take its feet from the kick
    const figure = plainOf ? plainOf.figure : drawFigure(chart, rng.at("drums"));
    // each part is told what the parts before it are SOUNDING — not merely
    // where they were struck — so it never lands on one and never rubs
    // against one. A rule at the point of choice, not a repair after.
    // THE LOOP IS AS LONG AS THE CHANGES ARE, and everything played over it
    // is written once and repeated. A four-bar material whose progression is
    // Dm7 Am Dm7 Am is a TWO-BAR loop stated twice: writing four bars of bass
    // and four of tune over it makes the record say one thing with its
    // harmony and another with everything else, and what an ear then has to
    // hold is four bars of material that never repeat instead of two that do.
    // "The pitched elements of a hip-hop beat tend to repeat in loops of one,
    // two, or four measures; exceptions to this are extremely rare", and a
    // two-bar phrase is "a default phrase expectation" (Adams, "Parameters of
    // Phrase in Hip-Hop", MTO 26.2).
    const period = harmonicPeriod(chords);
    const loop = chords.slice(0, period);
    /** One period's worth of notes, laid down for every turn of the loop. */
    const tile = (notes: readonly Note[]): Note[] => {
      const out: Note[] = [];
      for (let k = 0; k * period < bars; k++) for (const n of notes) out.push({ ...n, bar: n.bar + k * period });
      return out;
    };

    const sounding = new Sounding();
    // THE SAME PICTURE, FOLDED INTO THE LOOP. A part written for one turn is
    // played on every turn, so what it must keep clear of is what sounds at
    // that position on ANY turn — which is exactly what `Sounding` does when
    // it is told the loop is the period.
    const inLoop = new Sounding();

    // A VARIANT INHERITS ITS GROOVE, and inherits it BEFORE anything is drawn
    // against it. What makes a section recognisable as itself coming back is
    // the bass and the chords under it; redrawing them gives a new section
    // wearing the old one's harmony, which is what a "variant" used to be and
    // why a return never sounded like one.
    //
    // The picture the tune is written against has to be the groove that is
    // actually PLAYED. Drawing a groove, discarding it for the inherited one
    // and then writing a tune against the discarded one puts the lead on a
    // pitch the keys are holding — which is a bug the checks catch, and only
    // because they are there.
    const plain = plainOf;
    const taken = new Set<string>();
    const groove = plain ? plain.groove : Object.freeze((() => {
      const drawnBass = Object.freeze(tile(drawBass(chart, loop, rng.at("bass"), steps, figure.kick)));
      sounding.add(drawnBass, bars, steps);
      inLoop.add(drawnBass, period, steps);
      // the drone stands on the key, not the chord, so it is written before
      // anything that follows the changes — and it is NOT tiled: a drone is a
      // held tone whose whole nature is to be longer than the loop under it
      const drawnDrone = Object.freeze(drawDrone(chart, rng.at("drone"), steps, bars, sounding));
      sounding.add(drawnDrone, bars, steps);
      inLoop.add(drawnDrone, period, steps);
      const drawnKeys = Object.freeze(tile(drawKeys(chart, loop, rng.at("keys"), steps, inLoop)));
      sounding.add(drawnKeys, bars, steps);
      inLoop.add(drawnKeys, period, steps);
      return { bass: drawnBass, keys: drawnKeys, drone: drawnDrone };
    })());
    if (plain) {
      for (const part of GROOVE) {
        sounding.add(groove[part], bars, steps);
        inLoop.add(groove[part], period, steps);
      }
    }
    for (const n of groove.bass) taken.add(`${at(n)}:${n.pitch}`);
    for (const n of groove.drone) taken.add(`${at(n)}:${n.pitch}`);

    // the tune's plan, applied to every time the lead plays this material
    // through; the development is written only where a time will play it
    const leadRng = rng.at("lead");
    const plan = leadRng.weighted("cycles", chart.genre.lead.cycles);
    const opensLead = opens.get("lead") ?? new Set<number>();
    const letters = Array.from({ length: times.get("lead") ?? 0 }, (_, n) => {
      const letter = plan[n % plan.length]!;
      // a section opens with the tune; a rest is a breath taken inside one
      return letter === "." && opensLead.has(n) ? "A" : letter;
    });
    // the tune is written for ONE turn of the loop and played on every turn:
    // a hook is a hook because it comes back, and a lead that writes a fresh
    // melody over the loop's second turn is not a lead, it is two of them
    // AND ITS TUNE IS THE STATEMENT'S, CHANGED — thinned or held longer, one
    // of the documented motivic operations, rather than written again. See
    // vary.ts for why those two and not inversion or sequence.
    // ONE TURN OF THE LOOP is what is varied, and then it is tiled like any
    // other tune: a change applied to the tiled line would land in one turn
    // and not the next, and the loop would stop being one.
    const statedTurn = (plain?.lead.find((l) => l.length > 0) ?? []).filter((n) => n.bar < period);
    // The statement takes one change and the development takes the OTHER, so
    // the two differ from each other as well as from what they came from —
    // and a change that turned out to be a no-op falls back to writing a line,
    // because a variant identical to its statement is not one.
    // ONE CONTOUR, decided here and handed to everything that writes a line,
    // so the material's label and its notes cannot disagree. A variant plays
    // the statement's tune, so it moves the way the statement moves.
    const contour = plain ? plain.contour : contourOf(chart, leadRng);
    const first = leadRng.at("vary").pick("change", CHANGES as readonly Change[]);
    const varied = (which: Change) =>
      statedTurn.length === 0 ? null : varyLine(statedTurn, loop, leadRng.at("vary", which), steps, period, which);
    const asTune = varied(first);
    const tune = asTune?.changed === true
      ? Object.freeze(tile(asTune.line))
      : letters.length > 0 ? Object.freeze(tile(drawLead(chart, loop, leadRng, steps, inLoop, 0, contour))) : null;
    // AND THE DEVELOPMENT IS CHECKED AGAINST WHAT WAS ACTUALLY KEPT, not
    // against the intermediate it came from. `tune` above is the change if it
    // changed anything and a freshly written line if it did not, so comparing
    // the two transformations to each other answers the wrong question — and
    // answered it wrongly, shipping variants whose four times round were one
    // line four times.
    const asDev = varied(otherChange(first));
    const devLine = asDev?.changed === true ? tile(asDev.line) : null;
    const developed = letters.includes("B") && tune !== null
      ? Object.freeze(devLine !== null && JSON.stringify(devLine) !== JSON.stringify(tune)
        ? devLine
        : tile(develop(chart, loop, leadRng, steps, inLoop, tune, period, contour)))
      : null;
    const tacet: readonly Note[] = Object.freeze([]);
    const lead = Object.freeze(letters.map((l) => (l === "A" ? tune ?? tacet : l === "B" ? developed ?? tune ?? tacet : tacet)));

    // THE TREATMENTS CYCLE. A record has as many distinct treatments of a
    // figure as the genre says, and plays them round and round — the same
    // beat coming back, which is the only way a beat becomes one. Drawn per
    // time round, a sixty-four-bar record over a four-bar material had
    // sixteen different beats in it and repeated none of them.
    const treatments = Math.max(1, chart.genre.drums.treatments);
    const cut = new Map<number, readonly Hit[]>();
    const drums = Object.freeze(
      Array.from({ length: times.get("drums") ?? 0 }, (_, n) => {
        // A VARIANT TAKES THE NEXT BEAT ALONG. "Changing the drum beat works
        // every time, and you could keep everything exactly the same way and
        // change just the drum beat and it instantly feels different"
        // (secretsofsongwriting.com, "The Main Differences Between Verse 1 and
        // Verse 2") — the cheapest change there is, and the strongest.
        const which = (n + variant) % treatments;
        const already = cut.get(which);
        if (already !== undefined) return already;
        const made = Object.freeze(drawDrums(chart, rng.at("drums"), figure, bars, steps, which));
        cut.set(which, made);
        return made;
      }),
    );

    const material: Material = Object.freeze({ key, idea, variant, contour, bars, period, chords, groove, lead, figure, drums });
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
    drone: chart.genre.drone.register,
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
