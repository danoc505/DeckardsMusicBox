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
 */

import type { Clock } from "../core/clock.ts";
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
  readonly durSec: number;
  /** After the arc: what the note weighs in the record. */
  readonly gain: number;
}

export interface Performance {
  readonly events: readonly Event[];
  /** Where the record ends, in seconds: the last bar line plus a tail. */
  readonly seconds: number;
}

/** How much of a note's weight the arc may take away at its quietest. */
const ARC_DEPTH = 0.28;
const TAIL_SEC = 2.5;

export function makePerformance(
  chart: Chart,
  form: Form,
  materials: Materials,
  arrangement: Arrangement,
): Performance {
  const clock: Clock = form.clock;
  const perBeat = chart.metre.perBeat;
  const F = chart.genre.feel;
  // an off-eighth at full swing lands two thirds of the way through its beat:
  // one sixth of a beat late, in grid steps
  const swingSteps = (F.swing * perBeat) / 6;
  const offEighth = (step: number): boolean => perBeat % 2 === 0 && step % perBeat === perBeat / 2;

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

      const place = (role: Role, lane: string, step: number, dur: number, pitch: number | null, vel: number): void => {
        const jitter = chart.rng.at("perform", role, lane, bar, step).range("jitter", -F.jitterMs, F.jitterMs) / 1000;
        const swing = offEighth(step) ? swingSteps : 0;
        const playedStep = step + swing + jitter / stepSec;
        events.push({
          tSec: clock.at(bar, playedStep),
          bar,
          step,
          playedStep,
          role,
          lane,
          pitch,
          durSec: dur * stepSec,
          gain: Math.min(1.25, vel * level),
        });
      };

      for (const role of placed.heard) {
        if (role === "drums") {
          for (const h of nth(m.drums, "drums", round)) {
            if (h.bar !== mbar) continue;
            // thinning is the hat coming off: the pulse stays, the shimmer goes
            if (placed.thin && (h.lane === "hat" || h.lane === "openhat")) continue;
            place("drums", h.lane, h.step, 1, null, h.vel);
          }
        } else {
          const notes = role === "lead" ? nth(m.lead, "lead", round) : m.groove[role];
          for (const n of notes) {
            if (n.bar !== mbar) continue;
            place(role, role, n.step, n.dur, n.pitch, n.vel);
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
