/**
 * The lead: the tune.
 *
 * Built as PHRASES, two bars each — a question and an answer over a four-bar
 * idea. The answer moves the other way and lands on a chord tone, which is
 * what makes two phrases read as one sentence rather than two.
 *
 * Every rule here is a CONSTRAINT ON THE CHOICE, applied when a pitch is
 * chosen, never a pass that corrects a line after it is written:
 *
 *   A NOTE NEVER REPEATS ITS PREDECESSOR. The previous pitch is simply not a
 *   candidate. A tune that hammers one note is a tune with nothing to say.
 *
 *   A NOTE OFF THE CHORD HAS TO RESOLVE BY STEP. When the previous note was
 *   not in its chord, the next one may only be a step away and must be in the
 *   chord under it. That is what makes a passing tone a passing tone rather
 *   than a wrong note: it is legal because of what follows it.
 *
 *   STRONG BEATS TAKE CHORD TONES. Where the bar's chord has a tone within
 *   reach on a beat, that is what the beat gets.
 *
 *   NOTHING LANDS ON ANOTHER PART'S NOTE. A seat the keys or bass already
 *   hold at the same instant is not offered.
 *
 * Direction and leaps are drawn; everything above is arithmetic. So the tune
 * is the genre's and the seed's, and the grammar is the program's.
 */

import type { Rng } from "../../core/rng.ts";
import { degreeMidi, inScale, intoBand, pc, nearestDegree } from "../../core/theory.ts";
import type { Chart } from "../chart.ts";
import type { Chord, Note } from "./note.ts";

const PHRASE_BARS = 2;

/** The scale tones inside a register, ascending. */
function scaleTones(chart: Chart, lo: number, hi: number): number[] {
  const out: number[] = [];
  for (let p = lo; p <= hi; p++) if (inScale(chart.tonic, chart.scale, p)) out.push(p);
  return out;
}

const isTone = (chord: Chord, p: number): boolean => chord.tones.some((t) => pc(t) === pc(p));

export function drawLead(
  chart: Chart,
  chords: readonly Chord[],
  rng: Rng,
  steps: number,
  reserved: ReadonlySet<string>,
): Note[] {
  const L = chart.genre.lead;
  const [lo, hi] = L.register;
  const beatSteps = chart.metre.perBeat;
  const pool = scaleTones(chart, lo, hi);
  const centre = (lo + hi) / 2;

  const out: Note[] = [];
  let prev: Note | null = null;
  let prevChord: Chord | null = null;
  let questionDir = 0;

  for (let ph = 0; ph * PHRASE_BARS < chords.length; ph++) {
    const at = rng.at("phrase", ph);
    const firstBar = ph * PHRASE_BARS;
    const rhythm = at.weighted("rhythm", L.rhythms);
    const isAnswer = ph % 2 === 1;

    // the question's direction is drawn; the answer is contrary to where the
    // question actually went, which is arithmetic on its first and last notes
    const dir = isAnswer ? -questionDir || (at.chance("dir", 0.5) ? 1 : -1)
                         : at.chance("dir", 0.5) ? 1 : -1;

    let phraseLo = Infinity;
    let phraseHi = -Infinity;
    const phraseStart = out.length;

    for (let i = 0; i < rhythm.length; i++) {
      const abs = rhythm[i]!;
      const bar = firstBar + Math.floor(abs / steps);
      if (bar >= chords.length) break;
      const step = abs % steps;
      const chord = chords[bar]!;
      const until = i + 1 < rhythm.length ? rhythm[i + 1]! : PHRASE_BARS * steps;
      const dur = Math.max(1, Math.min(until - abs, steps));
      const strong = step % beatSteps === 0;
      const seat = (b: number, st: number, p: number): string => `${b}:${st}:${p}`;

      // the onset after this one, if the phrase has one — a dissonance here
      // is only allowed if it can resolve THERE
      const nextAbs = i + 1 < rhythm.length ? rhythm[i + 1]! : null;
      const nextBar = nextAbs === null ? null : firstBar + Math.floor(nextAbs / steps);
      const next = nextBar !== null && nextBar < chords.length
        ? { bar: nextBar, step: nextAbs! % steps, chord: chords[nextBar]! }
        : null;
      // THE SAME TESTS THE NEXT ONSET WILL APPLY: register, span with this
      // note counted in, and a free seat. A dissonance admitted on a promise
      // the next onset then refuses is a stranded wrong note, so the promise
      // is checked with the judge's own rules.
      const canResolve = (p: number): boolean =>
        next !== null &&
        next.chord.tones.some((t) => {
          const r = intoBand(t, p - 2, p + 2);
          return (
            r !== p &&
            Math.abs(r - p) <= 2 &&
            r >= lo && r <= hi &&
            Math.max(phraseHi, p, r) - Math.min(phraseLo, p, r) <= L.span &&
            !reserved.has(seat(next.bar, next.step, r))
          );
        });

      let cands: number[];
      if (prev === null) {
        // the record's first note: a chord tone near the middle of the register
        cands = pool.filter((p) => isTone(chord, p) && Math.abs(p - centre) <= 7);
        if (cands.length === 0) cands = pool.filter((p) => isTone(chord, p));
      } else {
        const from = prev.pitch;
        const wasOff = prevChord !== null && !isTone(prevChord, from);
        // a dissonance resolves by step; anything else may reach a fifth
        cands = pool.filter((p) => p !== from && Math.abs(p - from) <= (wasOff ? 2 : 7));

        if (wasOff) {
          // and it resolves INTO the chord — that is the law, and the note
          // before was only admitted because this resolution existed
          cands = cands.filter((p) => isTone(chord, p));
        } else {
          // a leap or a step, drawn. Preferred, because the register's edge
          // can make one of them impossible.
          const leap = at.at("note", i).chance("leap", L.leap);
          const sized = cands.filter((p) => (leap ? Math.abs(p - from) >= 3 : Math.abs(p - from) <= 2));
          if (sized.length > 0) cands = sized;
          // on a beat the chord is home: a chord tone when one is in reach at
          // this size, otherwise a tone that will resolve, which is what an
          // appoggiatura is
          if (strong) {
            const tones = cands.filter((p) => isTone(chord, p));
            if (tones.length > 0) cands = tones;
          }
        }
      }

      // THE LAWS. Each is a filter that may leave nothing, and nothing means
      // this onset rests: a rest is always legal and a wrong note never is.
      //   a note off the chord must be able to resolve at the next onset;
      //   with no next onset in the phrase, only the chord will do
      cands = cands.filter((p) => isTone(chord, p) || canResolve(p));
      //   the phrase stays inside its span
      cands = cands.filter((p) => Math.max(phraseHi, p) - Math.min(phraseLo, p) <= L.span);
      //   a seat another part holds is never offered
      cands = cands.filter((p) => !reserved.has(seat(bar, step, p)));
      if (cands.length === 0) continue;

      // and, among what is legal, the phrase leans the way it is going
      if (prev !== null) {
        const from = prev.pitch;
        const leaning = cands.filter((p) => Math.sign(p - from) === dir);
        if (leaning.length > 0 && at.at("note", i).chance("lean", 0.7)) cands = leaning;
      }

      const pitch = at.at("note", i).pick("pitch", cands);
      const note: Note = { bar, step, dur, pitch, vel: strong ? 0.8 : 0.66 };
      out.push(note);
      prev = note;
      prevChord = chord;
      phraseLo = Math.min(phraseLo, pitch);
      phraseHi = Math.max(phraseHi, pitch);
    }

    if (!isAnswer && out.length > phraseStart) {
      const first = out[phraseStart]!.pitch;
      const last = out[out.length - 1]!.pitch;
      questionDir = Math.sign(last - first) || dir;
    }
  }

  // the tune ends on a chord tone: the last note is moved to the nearest one
  // of its own chord if it is not already, by the smallest step available.
  // This is a choice about the final note made with full knowledge, not a
  // pass over the line — nothing before it is touched.
  const lastNote = out[out.length - 1];
  if (lastNote !== undefined) {
    const chord = chords[lastNote.bar]!;
    if (!isTone(chord, lastNote.pitch)) {
      const target = chord.tones
        .map((t) => intoBand(t, lo, hi))
        .filter((p) => !reserved.has(`${lastNote.bar}:${lastNote.step}:${p}`))
        .sort((a, b) => Math.abs(a - lastNote.pitch) - Math.abs(b - lastNote.pitch))[0];
      if (target !== undefined && Math.abs(target - lastNote.pitch) <= 4) {
        out[out.length - 1] = { ...lastNote, pitch: target };
      }
    }
  }

  return out;
}

/** The scale degree of a lead note, for reading a line as a contour. */
export const degreeOf = (chart: Chart, p: number): number =>
  nearestDegree(chart.tonic, chart.scale, p) + 7 * Math.floor((p - degreeMidi(chart.tonic, chart.scale, 0)) / 12);
