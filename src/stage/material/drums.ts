/**
 * The drums: a figure, and what each bar of the phrase does to it.
 *
 * A bar is not drawn on its own. The kick pocket, the snare pocket and the
 * hat division are drawn ONCE for the material and every bar plays them —
 * that is the figure — and the phrase letters say how each bar relates to
 * it: A plays it, B makes one small change, C makes two, D fills or empties
 * into the next phrase. Independent randomness per bar is neither repetition
 * nor variation, and an ear hears both.
 *
 * A change is one of three moves, drawn: ADD a hit on a weak position,
 * SUBTRACT a hit that is not the downbeat kick, or SUBSTITUTE one hit for
 * another lane at the same step. The weak positions take light drums — a
 * kick or a snare on an "e" or an "a" loses the pulse, so an addition off
 * the eighths is a hat.
 */

import type { ArtName } from "../../core/articulation.ts";
import type { Rng } from "../../core/rng.ts";
import { FIGURES, type BarLetter, type DrumLane } from "../../genre/spec.ts";
import type { Chart } from "../chart.ts";
import { manner } from "./manner.ts";

export interface Hit {
  readonly bar: number;
  readonly step: number;
  readonly lane: DrumLane;
  /** 0..1 */
  readonly vel: number;
  /** How it is struck. A hit that does not say is struck plain. */
  readonly art?: ArtName;
}

const HEAVY: ReadonlySet<DrumLane> = new Set(["kick", "snare"]);

/** The figure: what every bar of the material plays before its letter changes it. In grid steps. */
export interface Figure {
  readonly kick: readonly number[];
  readonly snare: readonly number[];
  /** Which steps the toms strike; empty for a kit with none. */
  readonly tom: readonly number[];
  /** The hat strikes every this many steps; 0 for none. */
  readonly hatEvery: number;
  /**
   * A NAMED FIGURE IS MORE THAN ONE BAR. Where this is set, each bar plays
   * the entry at its position in the cycle instead of `kick`/`snare` above,
   * which then carry the first bar's so the bass can still stand on the kick.
   * In grid steps.
   */
  readonly cycle?: readonly { readonly kick: readonly number[]; readonly snare: readonly number[]; readonly crash: readonly number[] }[];
}

/** Drawn once per material. The bass may take its feet from the kick. */
export function drawFigure(chart: Chart, rng: Rng): Figure {
  const D = chart.genre.drums;
  const which = rng.weighted("figure", D.figure);
  const named = which === "own" ? undefined : FIGURES[which];
  if (named !== undefined) {
    // beats to grid steps, against this record's own metre
    const per = chart.metre.perBeat;
    const steps = (b: readonly number[]): number[] => b.map((x) => Math.round(x * per));
    const cycle = named.bars.map((bar) => Object.freeze({ kick: steps(bar.kick), snare: steps(bar.snare), crash: steps(bar.crash ?? []) }));
    // a NAMED figure is a transcription of a particular beat and states no
    // toms; the genre's own pocket still applies over it
    return Object.freeze({ kick: cycle[0]!.kick, snare: cycle[0]!.snare, tom: rng.weighted("tom", D.tom), hatEvery: Math.round(named.hat * per), cycle });
  }
  return Object.freeze({
    kick: rng.weighted("kick", D.kick),
    snare: rng.weighted("snare", D.snare),
    tom: rng.weighted("tom", D.tom),
    hatEvery: rng.weighted("hat", D.hat),
  });
}

/**
 * One cycle of the material. The FIGURE — the pockets and the hat — is drawn
 * once and shared by every cycle; the phrase letters and the changes they
 * make are drawn per cycle, so a section that plays the material four times
 * over hears the same beat treated four different ways rather than the same
 * four bars four times.
 */
export function drawDrums(chart: Chart, rng: Rng, figure: Figure, bars: number, steps: number, cycle: number): Hit[] {
  const D = chart.genre.drums;
  const beat = chart.metre.perBeat;
  const { kick, snare, tom, hatEvery } = figure;
  const own = rng.at("cycle", cycle);
  const phrase = own.weighted("phrase", D.phrase);

  const out: Hit[] = [];

  for (let bar = 0; bar < bars; bar++) {
    const letter: BarLetter = phrase[bar % phrase.length]!;
    const at = own.at("bar", bar);

    // the figure — this bar's own where the figure is a cycle, else the one
    const here = figure.cycle ? figure.cycle[bar % figure.cycle.length]! : null;
    const kickHere = here ? here.kick : kick;
    const snareHere = here ? here.snare : snare;
    const hits: Hit[] = [];
    for (const st of kickHere) hits.push({ bar, step: st, lane: "kick", vel: 0.95 });
    // the crash is the open hat: the one ringing cymbal this kit has
    if (here) for (const st of here.crash) hits.push({ bar, step: st, lane: "openhat", vel: 0.9, art: "accent" });
    // A SNARE ON A BEAT IS THE BACKBEAT; ONE OFF THE BEAT IS A GHOST. It is
    // written as a ghost rather than as a quieter snare, because a ghost note
    // is not merely a quiet one: it is "played with little or no sound", a
    // stick dropped on the head rather than struck, and the manner carries
    // both the weight and the deadness. How much quieter is stated once, in
    // the articulation table, and not again here.
    for (const st of snareHere) {
      if (st % beat === 0) hits.push({ bar, step: st, lane: "snare", vel: 1 });
      else hits.push({ bar, step: st, lane: "snare", vel: 1, art: "ghost" });
    }
    // THE TOMS. Which of the two takes a strike is not the genre's to state:
    // a tom ON a beat is the LOW one and one off it is the HIGH one, the same
    // shape as the snare's backbeat-or-ghost rule above. A drummer's floor tom
    // carries weight and the rack tom answers it, and a genre naming the lane
    // per strike would be writing a drum part instead of stating a kit.
    for (const st of tom) {
      hits.push({ bar, step: st, lane: st % beat === 0 ? "tomlo" : "tomhi", vel: st % beat === 0 ? 0.95 : 0.8 });
    }
    if (hatEvery > 0) {
      for (let st = 0; st < steps; st += hatEvery) {
        hits.push({ bar, step: st, lane: "hat", vel: 0.66 });
      }
    }

    // and what this bar does to it
    const changes = letter === "B" ? 1 : letter === "C" ? 2 : 0;
    for (let c = 0; c < changes; c++) change(hits, at.at("change", c), bar, steps, beat);

    if (letter === "D") {
      if (at.chance("fill", 0.6)) {
        // a fill: every step of the last beat, rising into the downbeat that
        // follows. The fill OWNS the beat — anything already sitting on its
        // first step joins the ramp rather than starting it at full weight, or
        // the gesture falls instead of rising.
        //
        // AND A KIT WITH TOMS ROLLS ON THEM. A snare ramp and a tom roll are
        // the same gesture on different drums, so this is not a second kind of
        // fill: it is the one fill, played on what the kit has. The roll
        // DESCENDS — high to low — because that is the direction a fill leads
        // into a downbeat, where the floor tom lands with the kick. A kit with
        // no toms rolls on the snare exactly as it always did.
        const lastBeat = steps - beat;
        const rolls = tom.length > 0;
        for (let i = hits.length - 1; i >= 0; i--) {
          const h = hits[i]!;
          if (h.step < lastBeat) continue;
          if (rolls ? (h.lane === "tomlo" || h.lane === "tomhi") : h.lane === "snare") hits.splice(i, 1);
        }
        for (let st = lastBeat; st < steps; st++) {
          // THE ARITHMETIC IS WRITTEN EXACTLY AS IT WAS, and that is not a
          // style note. Rewriting this as `0.55 + 0.4 * (x / span)` is the
          // same number in algebra and a DIFFERENT one in IEEE 754, and a
          // velocity lands on a whole MIDI value — so the tidier form moved
          // three of five lofi records that this change must not touch at all.
          const vel = 0.55 + (0.4 * (st - lastBeat)) / Math.max(1, beat - 1);
          // high through the run, landing on the low: the roll descends
          const half = lastBeat + (steps - lastBeat) / 2;
          hits.push({ bar, step: st, lane: rolls ? (st < half ? "tomhi" : "tomlo") : "snare", vel });
        }
      } else {
        // an empty: the last beat drops out, so the next downbeat arrives from
        // nothing
        const lastBeat = steps - beat;
        for (let i = hits.length - 1; i >= 0; i--) if (hits[i]!.step >= lastBeat) hits.splice(i, 1);
      }
    }

    // AND HOW EACH HIT IS STRUCK, once the bar is settled. This is not a pass
    // that corrects what was written — every hit above chose its lane, its
    // step and its weight, and none of them chose a manner. A drummer decides
    // which hits to lean on knowing what the bar is, which is only true after
    // the changes and the fill have been made; deciding it per hit as the bar
    // was built would be deciding it without the bar.
    for (let i = 0; i < hits.length; i++) {
      const h = hits[i]!;
      if (h.art !== undefined) continue;
      hits[i] = { ...h, art: manner(at.at("hit", h.step, h.lane), "art", D.art, { strong: h.step % beat === 0, dur: 1, from: null }) };
    }

    out.push(...hits);
  }
  return out;
}

/**
 * One change to a bar, and it has to BE one: a move that would leave the bar
 * as it was — adding a hat where one already is, swapping to a lane already
 * struck there — is not taken, and the next move is tried instead. Which move
 * goes first is drawn; the order after that is fixed, so a change is made
 * whenever any is possible.
 */
function change(hits: Hit[], rng: Rng, bar: number, steps: number, beat: number): void {
  const has = (step: number, lane: DrumLane): boolean => hits.some((h) => h.step === step && h.lane === lane);
  const half = beat / 2;
  const onEighth = (st: number): boolean => Number.isInteger(half) && st % half === 0 && st % beat !== 0;

  const add = (): boolean => {
    // an off-eighth may take a kick; anything weaker takes only a hat
    const spots: [number, DrumLane][] = [];
    for (let st = 1; st < steps; st++) {
      if (st % beat === 0) continue;
      if (onEighth(st)) {
        if (!has(st, "kick")) spots.push([st, "kick"]);
        if (!has(st, "hat")) spots.push([st, "hat"]);
      } else if (!has(st, "hat")) {
        spots.push([st, "hat"]);
      }
    }
    if (spots.length === 0) return false;
    const [st, lane] = rng.pick("add", spots);
    hits.push({ bar, step: st, lane, vel: lane === "kick" ? 0.7 : 0.5 });
    return true;
  };

  const subtract = (): boolean => {
    // never the downbeat kick: that is where the bar is
    const droppable = hits.map((_, i) => i).filter((i) => !(hits[i]!.lane === "kick" && hits[i]!.step === 0));
    if (droppable.length === 0) return false;
    hits.splice(rng.pick("drop", droppable), 1);
    return true;
  };

  const substitute = (): boolean => {
    // a heavy drum becomes a light one; a light one becomes heavy only on an
    // eighth, where a heavy drum keeps the pulse, and open otherwise
    const options: [number, DrumLane][] = [];
    hits.forEach((h, i) => {
      if (h.step === 0) return;
      const to: DrumLane = HEAVY.has(h.lane)
        ? h.step % beat === 0 ? "openhat" : "hat"
        : onEighth(h.step) ? "snare" : "openhat";
      if (!has(h.step, to)) options.push([i, to]);
    });
    if (options.length === 0) return false;
    const [i, to] = rng.pick("swap", options);
    hits[i] = { ...hits[i]!, lane: to, vel: to === "snare" ? 0.8 : 0.6 };
    return true;
  };

  const moves = [add, subtract, substitute];
  const first = rng.weighted("move", [
    [0, 4],
    [1, 3],
    [2, 2],
  ] as const);
  for (let k = 0; k < moves.length; k++) {
    if (moves[(first + k) % moves.length]!()) return;
  }
}
