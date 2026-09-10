/**
 * THE EVENTS: things that happen to a record instead of being played by it.
 *
 * Everything else in this stage is ORDER. A pocket is drawn once and every bar
 * plays it; a figure is tiled; a phrase letter says what each bar does to the
 * figure it already has. That is what makes a record coherent, and it is also
 * why a record made entirely of it is explicable all the way down — every bar
 * follows from a weight somewhere, and an ear that has heard eight bars has
 * heard the rules.
 *
 * Music is not written that way. A drummer drops a roll into the bar before
 * the chorus; a band stops dead for a beat; the kit doubles for one bar and
 * goes back. None of those follow from the pattern — they INTERRUPT it, and
 * they are most of what makes a record sound played rather than generated.
 *
 * THIS FILE IS `treat.ts` FOR NOTES, and that is the whole design. Treatments
 * are already a pool of special things that break a section's sound against
 * the running order: each one names what it does, each is REFUSED where it
 * would do nothing, and none of them is scheduled. What this program has never
 * had is the same pool for what is PLAYED. So:
 *
 *   - an event is not drawn into a figure; it OVERWRITES what the figure wrote
 *   - an event has a SOCKET, which is the set of conditions it can slot into,
 *     and a socket is a refusal in the same sense `deskOf` refuses a treatment
 *   - an event is RARE, and a record that fires none is a correct record
 *
 * AND EVENTS BELONG TO NO GENRE. A tom roll is a tom roll in lofi. What a
 * genre may say is which of them it allows and how often it reaches for one —
 * the same shape as `sound.treatments` — and a genre that says nothing gets
 * the default pool, because a record with no interruptions at all was the
 * thing this file was written to stop.
 *
 * WHAT A SOCKET MAY READ, and why it is these four:
 *
 *   ENERGY      the section's own, 0..1. "When the song drops down" is the
 *               commonest socket there is: a break, a solo and a stop all
 *               need room, and room is what a quiet section has.
 *   THE SEAM    whether this cycle is the last one before a section boundary.
 *               A fill leads somewhere; one in the middle of a section is a
 *               mistake, not a gesture.
 *   THE COUNT   how many times this material has already been heard. An
 *               interruption on a first hearing breaks nothing, because there
 *               is no pattern yet to break. This is the link to the rule of
 *               three: an event is one more way for a third hearing to differ,
 *               and the only one that costs notes without costing a new idea.
 *   THE KIT     what lanes there are to play. A tom roll needs toms.
 *
 * WHAT AN EVENT MAY NOT DO. It may not write a pitch — every event here is
 * drums, and the pitched events (the bass alone, everything stopping) are
 * arrangement moves rather than material ones, because they change WHO is
 * playing and that is `arrange.ts`'s to decide. This file is the half that
 * needs no permission from the arrangement: it rewrites bars that were already
 * the drums'.
 */

import type { Rng } from "../../core/rng.ts";
import { EVENTS, type DrumLane, type EventName } from "../../genre/spec.ts";
import type { Hit } from "./note.ts";

/** Where in the record a cycle is being played — what an event may read. */
export interface Where {
  readonly energy: number;
  /** Is this the last time round this material gets in its section? */
  readonly last: boolean;
}

/** Re-exported so a reader who lands here first finds the list. */
export { EVENTS, type EventName };

/** What an event is allowed to know about where it is being asked to go. */
export interface Socket {
  /** The section's own energy, 0..1. */
  readonly energy: number;
  /** Is this the last cycle of its section — the one that leads out? */
  readonly seam: boolean;
  /** How many times this material has been heard already, this one not counted. */
  readonly heard: number;
  /** Which lanes the kit actually strikes in this material. */
  readonly lanes: ReadonlySet<DrumLane>;
  readonly steps: number;
  readonly beat: number;
  readonly bars: number;
}

/**
 * WHERE EACH ONE MAY GO. A socket that returns false is not a preference the
 * score will weigh — it is a refusal, and the event is not offered at all.
 *
 * Every one of them requires `heard >= 1`. An interruption on a first hearing
 * is not an interruption; it is just what that material sounds like, and the
 * ear has nothing to be surprised against.
 */
const FITS: Readonly<Record<EventName, (s: Socket) => boolean>> = {
  // A ROLL LEADS SOMEWHERE. Into the seam, on a kit that has toms, and only
  // where there is room in front of it — a roll under a full arrangement is a
  // fill nobody hears.
  tomroll: (s) => s.heard >= 1 && s.seam && s.lanes.has("tomlo") && s.lanes.has("tomhi"),
  // A BUILD IS A CRESCENDO INTO SOMETHING. Same seam, and it wants the
  // section to be going somewhere rather than winding down.
  snarebuild: (s) => s.heard >= 1 && s.seam && s.lanes.has("snare") && s.energy >= 0.45,
  // A STOP NEEDS SILENCE TO BE AUDIBLE IN. It is the one event that belongs in
  // the MIDDLE of a section — a stop at a seam is just an early ending — and
  // it needs the record to be dense enough that its absence registers.
  stop: (s) => s.heard >= 2 && !s.seam && s.energy >= 0.5,
  // AND DOUBLING IS WHAT A KIT DOES WHEN A RECORD IS ALREADY AT ITS TOP.
  double: (s) => s.heard >= 1 && s.energy >= 0.7,
};

/**
 * HOW OFTEN A RECORD REACHES FOR ONE AT ALL.
 *
 * This is the number that decides whether the program has emergence or a new
 * kind of order, and it is deliberately low. An interruption that arrives on
 * schedule is a pattern: if every seam carries a fill then the fill IS the
 * figure, and the ear learns it inside two sections exactly as it learned the
 * pocket. What makes a roll a roll is that the seam before it did not have
 * one.
 *
 * [chosen], and the first thing to measure by ear rather than by count. The
 * honest version of this number is the rate above which a listener starts
 * expecting the next one, and nothing published gives it.
 */
const REACHES = 0.28;

/**
 * One cycle's hits, with an event in them or exactly as they came.
 *
 * Returns the hits unchanged and `null` when nothing fired, so a caller can
 * record which happened — a record's events are worth reading in a dump, and
 * an event that never fires has to be visible as never firing.
 */
export function withEvent(
  hits: readonly Hit[],
  socket: Socket,
  allowed: readonly EventName[],
  rng: Rng,
): { readonly hits: readonly Hit[]; readonly event: EventName | null } {
  if (hits.length === 0) return { hits, event: null };
  const fits = allowed.filter((e) => FITS[e](socket));
  if (fits.length === 0) return { hits, event: null };
  if (!rng.chance("reach", REACHES)) return { hits, event: null };
  const which = rng.pick("event", fits);
  // WHICH BAR IS THE EVENT'S OWN BUSINESS, not the caller's. A roll and a
  // build lead OUT of the cycle, so they take its last bar; a stop and a
  // double happen inside one and take a bar drawn from the rest. A caller
  // choosing the bar would be deciding half of what the gesture is.
  const bar = which === "tomroll" || which === "snarebuild"
    ? socket.bars - 1
    : rng.int("bar", 0, Math.max(0, socket.bars - 2));
  return { hits: play(which, hits, bar, socket), event: which };
}

/** Which lanes a cycle actually strikes — what an event may reach for. */
export function lanesOf(hits: readonly Hit[]): ReadonlySet<DrumLane> {
  const out = new Set<DrumLane>();
  for (const h of hits) out.add(h.lane);
  return out;
}

/** The gesture itself, over the bar it was given. */
function play(which: EventName, hits: readonly Hit[], bar: number, s: Socket): readonly Hit[] {
  const { steps, beat } = s;
  const inBar = (h: Hit): boolean => h.bar === bar;

  switch (which) {
    case "tomroll": {
      // THE WHOLE BAR, not the last beat — that is the difference between a
      // roll and the fill `drums.ts` already writes into a D bar. A fill
      // decorates the bar it is in; a roll REPLACES it, and the kick stays
      // only on the downbeat so the roll has a floor to fall to.
      const kept = hits.filter((h) => !inBar(h) || (h.lane === "kick" && h.step === 0));
      const out: Hit[] = [...kept];
      const every = Math.max(1, Math.floor(beat / 2));
      for (let st = 0; st < steps; st += every) {
        const through = st / steps;
        // it descends, and lands on the low tom under the next downbeat
        const lane: DrumLane = through < 0.7 ? "tomhi" : "tomlo";
        const vel = 0.5 + 0.45 * through;
        // `exactOptionalPropertyTypes` is on: an absent manner and a manner of
        // `undefined` are different things here, and a hit that does not say
        // is struck plain by `drums.ts` afterwards
        out.push(through > 0.85 ? { bar, step: st, lane, vel, art: "accent" } : { bar, step: st, lane, vel });
      }
      return out;
    }

    case "snarebuild": {
      // AN ACCELERATION, not a ramp. The gap halves across the bar — quarters,
      // then eighths, then sixteenths — which is what makes a build feel like
      // it is being pulled rather than turned up. The velocity rises with it
      // because both happen at once when a drummer does this.
      const kept = hits.filter((h) => !inBar(h) || h.lane === "kick");
      const out: Hit[] = [...kept];
      let st = 0;
      let gap = beat;
      while (st < steps) {
        const through = st / steps;
        out.push({ bar, step: st, lane: "snare", vel: 0.45 + 0.5 * through });
        st += gap;
        if (through > 0.45 && gap > 1) gap = Math.max(1, Math.floor(gap / 2));
      }
      return out;
    }

    case "stop": {
      // EVERYTHING OFF FOR THE BACK HALF OF THE BAR, and the downbeat left
      // standing so the hole has an edge. A stop is the only event here that
      // writes nothing: it is made entirely of what it takes away.
      const half = Math.floor(steps / 2);
      return hits.filter((h) => !inBar(h) || h.step < half);
    }

    case "double": {
      // THE SAME BAR AGAIN AT HALF THE SPACING, which is a kit playing double
      // time under an arrangement that has not moved. Every hit keeps its lane
      // and its weight — this is a rhythm event, not a loudness one — and the
      // copies land between the originals rather than on them.
      const here = hits.filter(inBar);
      const out: Hit[] = [...hits];
      for (const h of here) {
        const st = h.step + Math.max(1, Math.floor(beat / 2));
        if (st >= steps) continue;
        if (here.some((o) => o.step === st)) continue;
        out.push({ ...h, step: st, vel: h.vel * 0.8 });
      }
      return out;
    }
  }
}
