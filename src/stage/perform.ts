/**
 * Stage 5 — THE PERFORMANCE.
 *
 * The grid becomes seconds. Every note of every heard part of every section
 * becomes an event with a time, a length and a gain — and that is the whole
 * job. Nothing here decides what is played; it decides WHEN, exactly, and HOW
 * HARD.
 *
 * Micro-timing is two things and they are kept apart: SWING, which is the
 * same every bar and is the feel, and JITTER, which is a hand missing the
 * grid and is different every time. Both are addressed draws or arithmetic
 * on the clock, so a record played twice is the same record.
 *
 * Weight is three things, and they are kept apart the same way. What a note
 * IS, which the material said — a ghost snare is a ghost wherever it falls.
 * Where it SITS, which is the metre's hierarchy and is the same in every
 * bar. And the hand, which misses the weight it meant by a little and
 * differently every time. Position was doing none of this before: each part
 * wrote one weight for the downbeat and one for everywhere else, so every
 * bar of a groove weighed exactly the same as every other.
 */

import { artOf, type ArtName } from "../core/articulation.ts";
import { metricalStrength, type Clock } from "../core/clock.ts";
import type { Role, Treatment } from "../genre/spec.ts";
import type { Arrangement } from "./arrange.ts";
import type { Chart } from "./chart.ts";
import type { Form } from "./form.ts";
import type { Materials } from "./material/index.ts";

export interface Event {
  /** Seconds from the top of the record. May be slightly negative: a pushed downbeat. */
  readonly tSec: number;
  /** Grid bar of the record. */
  readonly bar: number;
  /** Where in the bar it was WRITTEN, a whole step. */
  readonly step: number;
  /** Where in the bar it is PLAYED, after swing and jitter. */
  readonly playedStep: number;
  readonly role: Role;
  /** The drum lane, or the role for a pitched part. */
  readonly lane: string;
  readonly pitch: number | null;
  /** How long it sounds: its written length, less whatever its manner holds back. */
  readonly durSec: number;
  /** After the arc: what the note weighs in the record. */
  readonly gain: number;
  /** How it is played. The sound stage renders the note this way. */
  readonly art: ArtName;
}

/**
 * THE DESK MOVING, at a moment in the record.
 *
 * The arrangement decides that a span is heard on a different desk; this is
 * that decision turned into a time, because the arrangement counts in spans
 * and the renderer counts in samples and only this stage knows how long a turn
 * of the loop actually is.
 *
 * One entry per CHANGE and not per span: a treatment that carries across four
 * spans is one entry, so the renderer rebuilds nothing while nothing moved.
 */
export interface DeskChange {
  readonly tSec: number;
  readonly treatment: Treatment | null;
  /** The part a per-part treatment is aimed at; null for a whole-desk one. */
  readonly at: Role | null;
}

export interface Performance {
  readonly events: readonly Event[];
  /** Where the record ends, in seconds: the last bar line plus a tail. */
  readonly seconds: number;
  /**
   * Every moment the record's own desk moves, in order, the first at zero.
   *
   * The genre's desk used to be one frozen object for the length of a record —
   * `render.ts` did not contain the word "section" — so the whole of the
   * board, the rack, the room and the machine was set once and never touched
   * again. This is the record moving its own knobs.
   */
  readonly desk: readonly DeskChange[];
}

/** How much of a note's weight the arc may take away at its quietest. */
const ARC_DEPTH = 0.28;
const TAIL_SEC = 2.5;

/**
 * WHERE THE HEIGHT OF A PHRASE IS. Two fifths of the way through, so a phrase
 * spends longer coming down than going up — the classic arch is not
 * symmetrical, and a phrase that peaks exactly in the middle sounds measured
 * rather than shaped.
 */
const PHRASE_PEAK = 0.4;

/**
 * A phrase, shaped: 0 at its ends and 1 at its height.
 *
 * "A classic arched contour is shaped as a dynamic rise to a peak pitch and
 * descent quieter with falling pitches", and a crescendo into the height of a
 * phrase "builds energy as you approach the climax ... and naturally draws
 * the listener's attention to the peak" (doublebasshq.com, "Phrasing Part 3:
 * Using Dynamics to build musical phrases"). Every other thing that moves a
 * note's weight here works at a different grain — the metre inside a bar, the
 * arc across the record — and between the two there was nothing at all, so a
 * phrase was a flat stretch however long it ran.
 */
function phraseShape(through: number): number {
  const t = Math.min(1, Math.max(0, through));
  return t <= PHRASE_PEAK
    ? t / PHRASE_PEAK
    : 1 - (t - PHRASE_PEAK) / (1 - PHRASE_PEAK);
}

export function makePerformance(
  chart: Chart,
  form: Form,
  materials: Materials,
  arrangement: Arrangement,
): Performance {
  const clock: Clock = form.clock;
  const perBeat = chart.metre.perBeat;
  const F = chart.genre.feel;
  // the second note of each pair lands where the first note's share ends:
  // at 66.7% two thirds of the way through the pair, one sixth of it late
  const pairSteps = F.swingGrid === 16 ? perBeat / 2 : perBeat;
  const swingSteps = ((F.swing - 50) / 100) * pairSteps;
  const swung = (step: number): boolean => step % pairSteps === pairSteps / 2;
  // the metre's hierarchy, as far as this genre leans on it. Worked out once
  // per step of a bar, because it is the same in every bar of the record.
  const accentAt = Array.from({ length: clock.steps }, (_, st) => 1 - F.accent * (1 - metricalStrength(st, chart.metre)));

  const events: Event[] = [];
  // how many times each part has already played each material through —
  // the tune's and the drums' lines are written per time round, and the
  // count runs across the record, not within a section
  const played = new Map<string, number>();
  const timesBefore = (material: string, role: Role): number => played.get(`${material} ${role}`) ?? 0;

  // THE RECORD'S OWN DESK, as a list of the moments it moves. It opens on the
  // genre's, so the first entry is only written if bar zero is already treated.
  const desk: DeskChange[] = [];
  let deskNow: Treatment | null = null;
  let atNow: Role | null = null;

  for (const placed of arrangement.placed) {
    const m = materials.all.get(placed.material);
    if (m === undefined) throw new Error(`section plays "${placed.material}", which was never built`);
    const { section } = placed;
    /** The nth line a part has written for this material, counted across the record. */
    const nth = <T>(lines: readonly T[], role: Role, round: number): T => {
      const n = timesBefore(placed.material, role) + round;
      const l = lines[n];
      if (l === undefined) throw new Error(`${section.fn}: the ${role} plays "${placed.material}" a ${n + 1}th time, which was never written`);
      return l;
    };

    for (let bar = section.startBar; bar < section.endBar; bar++) {
      const mbar = (bar - section.startBar) % m.bars;
      const round = Math.floor((bar - section.startBar) / m.bars);
      const arc = form.arc[bar] ?? section.energy;
      // AND A SECTION THAT BUILDS ARRIVES RATHER THAN SITS. `placed.swell` is
      // the arc's rising action — the run-up to the climax, which the form
      // declares and the arc could only ever step towards. Across the section
      // the weight climbs from the arc's own quietest to nothing held back at
      // all, so the section reaches its end at full and the peak lands on top
      // of it. The depth is `ARC_DEPTH` again: what a step down means here is
      // already written, and a crescendo is that step, taken back.
      const intoIt = section.bars <= 1 ? 1 : (bar - section.startBar) / (section.bars - 1);
      const build = placed.swell ? 1 - ARC_DEPTH * (1 - intoIt) : 1;
      const level = (1 - ARC_DEPTH + ARC_DEPTH * arc) * build;
      const stepSec = clock.stepSec(bar);
      // THE PHRASE IS THE LOOP, and where this bar falls in it is where the
      // phrase has got to. The LOOP and not the material: a four-bar material
      // of Dm7 Am Dm7 Am is a two-bar loop stated twice, everything pitched
      // over it is written once and repeated, and an arch stretched across
      // both turns would give the two identical turns different weight — the
      // one thing that stops an ear hearing them as the same loop coming
      // round. Taken from the position rather than the bar of the record, so
      // the shape is the same shape every time, which is the same reason the
      // hand is addressed that way.
      const loop = Math.max(1, m.period);
      const through = loop <= 1 ? 0.5 : (mbar % loop) / loop;
      // WHO IS PLAYING RIGHT NOW, which changes every TWO TURNS of the loop
      // and not once a section — the two loop rule, and the arrangement has
      // already decided what moves at each boundary. Here is the only place
      // that knows how long a turn actually is, so here is where a span
      // becomes a range of bars. The last span runs to the end.
      const span = placed.spans[
        Math.min(placed.spans.length - 1, Math.floor((bar - section.startBar) / (2 * loop)))
      ] ?? { heard: placed.heard, thin: placed.thin, treatment: null, at: null, hush: null };
      // AND WHERE THAT SPAN'S DESK BEGINS, in seconds. Written at the bar line
      // the treatment changes on and nowhere else, so a treatment held across
      // several spans rebuilds nothing.
      if (span.treatment !== deskNow || span.at !== atNow) {
        deskNow = span.treatment;
        atNow = span.at;
        desk.push({ tSec: clock.at(bar), treatment: deskNow, at: atNow });
      }

      const place = (role: Role, lane: string, step: number, dur: number, pitch: number | null, vel: number, art: ArtName = "plain"): void => {
        // THE HAND IS ADDRESSED BY THE FIGURE, NOT BY THE BAR OF THE RECORD.
        // Keyed on the absolute bar, every bar of a loop was missed by a
        // different amount and no bar of a record was ever the same bar
        // again — which reads as variety written down and as mush in the ear.
        // Huron and Ollen (2004), over five continents and five centuries,
        // put the share of musical passages that are LITERALLY repeated at
        // some later point at about 94% (Margulis, "On Repeat", reviewed at
        // mtosmt.org/issues/mto.14.20.4). A figure that never comes back
        // exactly is not a figure, and nothing an ear can hold on to can be
        // built out of one. So the address is the material and the position
        // inside it: the third bar of a four-bar loop is played the same way
        // every time round, and what differs between rounds is what the
        // MATERIAL says differs — the drums' phrase letter, the tune's
        // cycle, the section's variant — which is composition, not noise.
        //
        // AND BY THE PART'S OWN UNIT OF REPETITION, which is not the same for
        // everyone. Everything pitched is written for one turn of the LOOP
        // and repeated, so two turns hold the same notes and must be played
        // the same way — addressed by the bar of the material instead, the
        // two identical turns would be missed by different amounts and the
        // repetition just built would be undone by the hand. The drums do not
        // tile: their phrase is the whole material, four letters long, and a
        // bar of it is its own.
        const unit = role === "drums" ? mbar : mbar % loop;
        const hand = chart.rng.at("perform", placed.material, role, lane, unit, step);
        const jitter = hand.range("jitter", -F.jitterMs, F.jitterMs) / 1000;
        const missed = 1 + hand.range("weight", -F.velocityJitter, F.velocityJitter);
        const swing = swung(step) ? swingSteps : 0;
        // WHERE THIS PART WAS AIMING, as against where its hand landed. The
        // jitter above is symmetrical noise and always was; it makes every
        // part equally and randomly late, which is the one thing that cannot
        // produce a feel, because a feel is a RELATIONSHIP between parts:
        // "one plays ever so slightly ahead of the other ... and the push and
        // pull between them purportedly produces the effect of swing" (Keil,
        // "Participatory Discrepancies and the Power of Music", 1987). A lane
        // wins over its part, so a laid-back kit is a late snare against a
        // kick that is not — which is the whole of what laid-back means.
        const lean = (F.lean[lane as keyof typeof F.lean] ?? F.lean[role] ?? 0) / 1000;
        const playedStep = step + swing + (jitter + lean) / stepSec;
        // the manner decides how much of the written length the note keeps
        // and what it weighs against its neighbours; everything else about
        // it — the glide, the attack, the strikes — is the sound stage's
        const a = artOf(art);
        // where the note sits inside the phrase, to the step: a bar is not a
        // flat step of the shape either
        const shaped = 1 - F.phrase + F.phrase * phraseShape(through + step / (clock.steps * loop));
        events.push({
          tSec: clock.at(bar, playedStep),
          bar,
          step,
          playedStep,
          role,
          lane,
          pitch,
          durSec: dur * stepSec * a.hold,
          // AND A PART HELD BACK PLAYS AT THE ARC'S OWN QUIETEST. `span.hush`
          // is the two-loop rule's "reduce expression of an existing
          // instrument" on a part rather than on the drums' hat, and what a
          // step down means is already written here: `ARC_DEPTH` is what the
          // arc takes off at its quietest, so a hushed part is held back by
          // exactly that and no new number is invented for it.
          //
          // Gain, and nothing but gain. The law above addresses the hand by
          // the material so a figure played again is played the same way, and
          // it compares step, pitch, articulation and the played instant. A
          // weight is none of those and the arc already moves it bar by bar.
          gain: Math.min(1.25, Math.max(0.02, vel * a.weigh * (accentAt[step] ?? 1) * missed * level * shaped
            * (span.hush === role ? 1 - ARC_DEPTH : 1))),
          art,
        });
      };

      for (const role of span.heard) {
        if (role === "drums") {
          for (const h of nth(m.drums, "drums", round)) {
            if (h.bar !== mbar) continue;
            // thinning is the hat coming off: the pulse stays, the shimmer goes
            if (span.thin && (h.lane === "hat" || h.lane === "openhat")) continue;
            place("drums", h.lane, h.step, 1, null, h.vel, h.art);
          }
        } else {
          const notes = role === "lead" ? nth(m.lead, "lead", round) : m.groove[role];
          for (const n of notes) {
            if (n.bar !== mbar) continue;
            place(role, role, n.step, n.dur, n.pitch, n.vel, n.art);
          }
        }
      }
    }
    for (const role of placed.heard) {
      played.set(`${placed.material} ${role}`, timesBefore(placed.material, role) + Math.ceil(section.bars / m.bars));
    }
  }

  // sorted by time, then by everything else, so two runs are byte-identical
  events.sort(
    (a, b) =>
      a.tSec - b.tSec ||
      a.role.localeCompare(b.role) ||
      a.lane.localeCompare(b.lane) ||
      (a.pitch ?? -1) - (b.pitch ?? -1),
  );

  return Object.freeze({
    events: Object.freeze(events.map((e) => Object.freeze(e))),
    seconds: clock.at(form.bars) + TAIL_SEC,
    desk: Object.freeze(desk.map((d) => Object.freeze(d))),
  });
}
