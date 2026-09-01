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

import type { Rng } from "../../core/rng.ts";
import type { BarLetter, DrumLane } from "../../genre/spec.ts";
import type { Chart } from "../chart.ts";

export interface Hit {
  readonly bar: number;
  readonly step: number;
  readonly lane: DrumLane;
  /** 0..1 */
  readonly vel: number;
}

const HEAVY: ReadonlySet<DrumLane> = new Set(["kick", "snare"]);

export function drawDrums(chart: Chart, rng: Rng, bars: number, steps: number): Hit[] {
  const D = chart.genre.drums;
  const beat = chart.metre.perBeat;
  const kick = rng.weighted("kick", D.kick);
  const snare = rng.weighted("snare", D.snare);
  const hatEvery = rng.weighted("hat", D.hat);
  const phrase = rng.weighted("phrase", D.phrase);

  const out: Hit[] = [];

  for (let bar = 0; bar < bars; bar++) {
    const letter: BarLetter = phrase[bar % phrase.length]!;
    const at = rng.at("bar", bar);

    // the figure
    const hits: Hit[] = [];
    for (const st of kick) hits.push({ bar, step: st, lane: "kick", vel: st === 0 ? 1 : 0.9 });
    for (const st of snare) hits.push({ bar, step: st, lane: "snare", vel: 1 });
    if (hatEvery > 0) {
      for (let st = 0; st < steps; st += hatEvery) {
        hits.push({ bar, step: st, lane: "hat", vel: st % beat === 0 ? 0.7 : 0.55 });
      }
    }

    // and what this bar does to it
    const changes = letter === "B" ? 1 : letter === "C" ? 2 : 0;
    for (let c = 0; c < changes; c++) change(hits, at.at("change", c), bar, steps, beat);

    if (letter === "D") {
      if (at.chance("fill", 0.6)) {
        // a fill: the snare on every step of the last beat, rising into the
        // downbeat that follows. The fill OWNS the beat — a backbeat already
        // sitting on its first step joins the ramp rather than starting it at
        // full weight, or the gesture falls instead of rising.
        const lastBeat = steps - beat;
        for (let i = hits.length - 1; i >= 0; i--) {
          if (hits[i]!.lane === "snare" && hits[i]!.step >= lastBeat) hits.splice(i, 1);
        }
        for (let st = lastBeat; st < steps; st++) {
          hits.push({ bar, step: st, lane: "snare", vel: 0.55 + (0.4 * (st - lastBeat)) / Math.max(1, beat - 1) });
        }
      } else {
        // an empty: the last beat drops out, so the next downbeat arrives from
        // nothing
        const lastBeat = steps - beat;
        for (let i = hits.length - 1; i >= 0; i--) if (hits[i]!.step >= lastBeat) hits.splice(i, 1);
      }
    }

    out.push(...hits);
  }
  return out;
}

function change(hits: Hit[], rng: Rng, bar: number, steps: number, beat: number): void {
  const has = (step: number, lane: DrumLane): boolean => hits.some((h) => h.step === step && h.lane === lane);
  const move = rng.weighted("move", [
    ["add", 4],
    ["subtract", 3],
    ["substitute", 2],
  ] as const);

  if (move === "add") {
    // an off-eighth may take a kick; anything weaker takes a hat
    const offEighths: number[] = [];
    const weaker: number[] = [];
    for (let st = 0; st < steps; st++) {
      if (st % beat === 0) continue;
      if (st % (beat / 2) === 0) offEighths.push(st);
      else weaker.push(st);
    }
    const onEighth = rng.chance("eighth", 0.4) && offEighths.length > 0;
    const spots = onEighth ? offEighths : weaker.length > 0 ? weaker : offEighths;
    if (spots.length === 0) return;
    const st = rng.pick("spot", spots);
    const lane: DrumLane = onEighth ? "kick" : "hat";
    if (!has(st, lane)) hits.push({ bar, step: st, lane, vel: lane === "kick" ? 0.7 : 0.5 });
    return;
  }

  if (move === "subtract") {
    // never the downbeat kick: that is where the bar is
    const droppable = hits.map((h, i) => [h, i] as const).filter(([h]) => !(h.lane === "kick" && h.step === 0));
    if (droppable.length === 0) return;
    const [, i] = rng.pick("drop", droppable);
    hits.splice(i, 1);
    return;
  }

  // substitute: one hit becomes another lane at the same step, light for heavy
  const swappable = hits.map((h, i) => [h, i] as const).filter(([h]) => h.step !== 0);
  if (swappable.length === 0) return;
  const [h, i] = rng.pick("swap", swappable);
  const to: DrumLane = HEAVY.has(h.lane) ? (h.step % beat === 0 ? "openhat" : "hat") : "snare";
  if (has(h.step, to)) return;
  hits[i] = { ...h, lane: to, vel: to === "snare" ? 0.8 : 0.6 };
}
