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
import type { Role } from "../genre/spec.ts";
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

export interface Performance {
  readonly events: readonly Event[];
  /** Where the record ends, in seconds: the last bar line plus a tail. */
  readonly seconds: number;
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
      const level = 1 - ARC_DEPTH + ARC_DEPTH * arc;
      const stepSec = clock.stepSec(bar);
      // THE PHRASE IS THE MATERIAL, and where this bar falls in it is where
      // the phrase has got to. Taken from the position in the MATERIAL and
      // not from the bar of the record, so the shape is the same shape every
      // time the figure comes round — the same reason the hand is addressed
      // that way, and the thing that keeps this from being another source of
      // per-bar noise.
      const through = m.bars <= 1 ? 0.5 : mbar / m.bars;

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
        const hand = chart.rng.at("perform", placed.material, role, lane, mbar, step);
        const jitter = hand.range("jitter", -F.jitterMs, F.jitterMs) / 1000;
        const missed = 1 + hand.range("weight", -F.velocityJitter, F.velocityJitter);
        const swing = swung(step) ? swingSteps : 0;
        const playedStep = step + swing + jitter / stepSec;
        // the manner decides how much of the written length the note keeps
        // and what it weighs against its neighbours; everything else about
        // it — the glide, the attack, the strikes — is the sound stage's
        const a = artOf(art);
        // where the note sits inside the phrase, to the step: a bar is not a
        // flat step of the shape either
        const shaped = 1 - F.phrase + F.phrase * phraseShape(through + step / (clock.steps * Math.max(1, m.bars)));
        events.push({
          tSec: clock.at(bar, playedStep),
          bar,
          step,
          playedStep,
          role,
          lane,
          pitch,
          durSec: dur * stepSec * a.hold,
          gain: Math.min(1.25, Math.max(0.02, vel * a.weigh * (accentAt[step] ?? 1) * missed * level * shaped)),
          art,
        });
      };

      for (const role of placed.heard) {
        if (role === "drums") {
          for (const h of nth(m.drums, "drums", round)) {
            if (h.bar !== mbar) continue;
            // thinning is the hat coming off: the pulse stays, the shimmer goes
            if (placed.thin && (h.lane === "hat" || h.lane === "openhat")) continue;
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
  });
}
