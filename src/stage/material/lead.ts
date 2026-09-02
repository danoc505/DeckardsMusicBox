/**
 * The lead: the tune.
 *
 * Built as PHRASES, two bars each — an antecedent and a consequent over a
 * four-bar idea, the period of the theory books: the question ends weakly
 * and the answer ends on a chord tone, which is what makes two phrases read
 * as one sentence rather than two (Wikipedia, "Period (music)"). That the
 * answer moves the other way from the question is this program's own rule,
 * not the books': it keeps the two phrases from being one gesture twice.
 *
 * HOW A LINE MOVES IS THE PART'S OWN GRAMMAR, drawn once per tune. A
 * saxophone line, a riff guitar and a chanted vocal are three different ways
 * of choosing the next pitch, not one process with different pools, and
 * measuring the examples says so plainly: Shine On's saxophone leaps 13% of
 * the time and its clean electric 79%, because the second is not a melody
 * that leaps but a chord played one note at a time. See CONTOURS in the spec
 * for the measurements and their sources.
 *
 * Every rule here is a CONSTRAINT ON THE CHOICE, applied when a pitch is
 * chosen, never a pass that corrects a line after it is written:
 *
 *   A NOTE REPEATS ITS PREDECESSOR ONLY ON A RECITING TONE. It used to be
 *   barred outright, on the grounds that a tune that hammers one note is a
 *   tune with nothing to say — and that was too strong. Chop Suey's vocal
 *   repeats its own pitch 44% of the time and is not a tune with nothing to
 *   say; chant is "the rhythmic speaking or singing of words or sounds, often
 *   primarily on one or two pitches" (en.wikipedia.org/wiki/Reciting_tone),
 *   and holding one has its own name, repercussion. So the bar stands for the
 *   two contours it is true of, and the third is allowed the thing it is
 *   made of.
 *
 *   A LEAP IS ANSWERED BY A STEP THE OTHER WAY. "Any large melodic leap will
 *   be followed by a reversal of pitch direction approximately 70% of the
 *   time" — post-skip reversal, which Huron argues listeners expect because
 *   it is cheap to learn and right most of the time (Sweet Anticipation;
 *   Von Hippel & Huron, "Why Do Skips Precede Reversals?"). Nothing here
 *   used to answer a leap at all.
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
 *   AND NOTHING RUBS ON A BEAT. A note a semitone from something already
 *   RINGING — not merely struck; the keys hold a chord for a whole bar — is
 *   an avoid note, and an avoid note is "a half-step away from a note in the
 *   chord being played" which "should be used on weak beats, as connectors,
 *   and should never be the target" (thejazzpianosite.com, "Avoid Notes";
 *   Wikipedia, "Avoid note"). So it is refused where it would be a target,
 *   and allowed to pass between the beats, where the law above already makes
 *   it resolve by step.
 *
 * Direction and leaps are drawn; everything above is arithmetic. So the tune
 * is the genre's and the seed's, and the grammar is the program's.
 *
 * A tune has two forms. The STATEMENT is the tune. The DEVELOPMENT keeps every
 * question phrase and answers each one differently: the hook is what an ear
 * holds on to, and the reply is where a line has room to go somewhere else.
 * Which form a cycle of a section plays is the material's plan.
 */

import type { Rng } from "../../core/rng.ts";
import { inScale, intoBand, pc } from "../../core/theory.ts";
import type { Contour } from "../../genre/spec.ts";
import type { Chart } from "../chart.ts";
import { manner } from "./manner.ts";
import type { Chord, Note, Sounding } from "./note.ts";

const PHRASE_BARS = 2;

/** What a tune's note weighs. Which of them are strong is the metre's to say. */
const LEAD_WEIGHT = 0.76;

/** The scale tones inside the lead's register, ascending: the rungs a tonal move steps along. */
export const ladder = (chart: Chart): number[] =>
  scaleTones(chart, chart.genre.lead.register[0], chart.genre.lead.register[1]);

/** The scale tones inside a register, ascending. */
function scaleTones(chart: Chart, lo: number, hi: number): number[] {
  const out: number[] = [];
  for (let p = lo; p <= hi; p++) if (inScale(chart.tonic, chart.scale, p)) out.push(p);
  return out;
}

const isTone = (chord: Chord, p: number): boolean => chord.tones.some((t) => pc(t) === pc(p));

/**
 * How a tune will move, drawn from the same address the tune itself draws it
 * from — so the material can record what its line is without the answer
 * being computed twice and able to disagree.
 */
export function contourOf(chart: Chart, rng: Rng): Contour {
  return rng.weighted("contour", chart.genre.lead.contour);
}

/**
 * EVERY HARD LAW A TUNE OBEYS, as a test on a finished line.
 *
 * The builder applies these as filters on each choice, which is the right
 * shape when a line is being written: a constraint at the point of choice
 * cannot produce a wrong note, only a rest. But a MOTIVIC TRANSFORMATION does
 * not choose note by note — inversion flips a whole line at once, and whether
 * the result is legal is a fact about the result. So the laws are stated once
 * here and read twice: the builder filters with them, and a transformation
 * proposes a line and is refused if it breaks one.
 *
 * Only the LAWS, not the preferences. A tune that leaps where it might have
 * stepped is a tune; one that lands a semitone off a ringing chord on a beat
 * is a mistake.
 */
export function lawsFor(
  chart: Chart,
  chords: readonly Chord[],
  sounding: Sounding,
  contour: Contour,
): (line: readonly Note[]) => boolean {
  const L = chart.genre.lead;
  const [lo, hi] = L.register;
  const beatSteps = chart.metre.perBeat;
  return (line: readonly Note[]): boolean => {
    if (line.length === 0) return false;
    const ns = line.slice().sort((a, b) => a.bar - b.bar || a.step - b.step);
    for (const [i, n] of ns.entries()) {
      const chord = chords[n.bar % chords.length]!;
      // in the register, and in the scale the record stands in
      if (n.pitch < lo || n.pitch > hi) return false;
      if (!inScale(chart.tonic, chart.scale, n.pitch)) return false;
      // nothing lands on a seat another part holds, and nothing rubs a
      // semitone against something ringing where it would be heard as a target
      if (!(!sounding.holds(n.bar, n.step, n.pitch)
        && !(n.step % beatSteps === 0 && !isTone(chord, n.pitch) && sounding.rubs(n.bar, n.step, n.pitch)))) return false;
      // a note off the chord is legal only because the next one resolves it
      // by step into the chord under IT
      if (!isTone(chord, n.pitch)) {
        const next = ns[i + 1];
        if (next === undefined) return false;
        if (Math.abs(next.pitch - n.pitch) > 2) return false;
        if (!isTone(chords[next.bar % chords.length]!, next.pitch)) return false;
      }
      // only a reciting tone repeats its own pitch
      if (i > 0 && contour !== "chant" && ns[i - 1]!.pitch === n.pitch) return false;
    }
    // the tune ends on a chord tone, and its last note is not its first —
    // the line loops, and a loop whose end is its beginning repeats itself
    const last = ns[ns.length - 1]!;
    if (!isTone(chords[last.bar % chords.length]!, last.pitch)) return false;
    if (contour !== "chant" && last.pitch === ns[0]!.pitch) return false;
    // and no phrase of it spans more than the genre allows
    for (let ph = 0; ph * PHRASE_BARS < chords.length; ph++) {
      const inPhrase = ns.filter((n) => Math.floor(n.bar / PHRASE_BARS) === ph).map((n) => n.pitch);
      if (inPhrase.length > 0 && Math.max(...inPhrase) - Math.min(...inPhrase) > L.span) return false;
    }
    return true;
  };
}

export function drawLead(
  chart: Chart,
  chords: readonly Chord[],
  rng: Rng,
  steps: number,
  sounding: Sounding,
  /** 0 writes the statement; n ≥ 1 writes the nth attempt at a development. */
  developed = 0,
  /**
   * How the line moves. PASSED IN, not drawn here: the material records its
   * own contour, and a line that drew its own would be free to disagree with
   * the label on it — which it did, writing a reciting tone into a material
   * that called itself sung and putting repeated pitches where that contour
   * forbids them.
   */
  contour: Contour = "sung",
): Note[] {
  const L = chart.genre.lead;
  const [lo, hi] = L.register;
  const beatSteps = chart.metre.perBeat;
  const pool = scaleTones(chart, lo, hi);
  const centre = (lo + hi) / 2;
  /**
   * Every test the other parts impose on a pitch at a position: the seat is
   * not taken, and — where the note would be heard as a target, on a beat —
   * nothing already ringing is a semitone from it.
   */
  const clear = (b: number, st: number, p: number, chord: Chord): boolean =>
    !sounding.holds(b, st, p) &&
    // an avoid note is a note OFF the chord a semitone from one on it, and
    // it is refused only where it would be heard as a target: on a beat. A
    // chord tone that happens to sit a semitone from another part — the root
    // over a seventh — is a rub too, but barring those on a dense chord
    // leaves a tune nowhere to stand, so that one is a preference below.
    !(st % beatSteps === 0 && !isTone(chord, p) && sounding.rubs(b, st, p));

  // a reciting tone leaps least of all; a riff is an arpeggio, so it leaps
  // more often than not. The genre's own number is what a sung line uses.
  const leapChance = contour === "riff" ? Math.max(0.6, L.leap) : contour === "chant" ? L.leap / 2 : L.leap;

  const out: Note[] = [];
  let prev: Note | null = null;
  let prevChord: Chord | null = null;
  let questionDir = 0;
  /** Which way the last move went, and whether it was a leap: what a reversal answers. */
  let lastMove = 0;

  for (let ph = 0; ph * PHRASE_BARS < chords.length; ph++) {
    const isAnswer = ph % 2 === 1;
    // The development answers from its own draws; its questions are the
    // statement's, draw for draw — the hook is what an ear holds on to and
    // the reply is where a line has room to go somewhere else.
    //
    // UNLESS THE LOOP IS ONE PHRASE LONG, which it is whenever the changes
    // come round every two bars — the common case in loop-based music. There
    // is no answer to vary then, so a development that only redraws answers
    // redraws nothing and comes back note for note the statement. The phrase
    // itself is what varies, and the question-and-answer happens across two
    // turns of the loop instead of inside one.
    const onlyPhrase = PHRASE_BARS >= chords.length;
    const at = developed > 0 && (isAnswer || onlyPhrase) ? rng.at("answer", developed, ph) : rng.at("phrase", ph);
    const firstBar = ph * PHRASE_BARS;
    const rhythm = at.weighted("rhythm", L.rhythms);

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

      // the onset after this one, if the phrase has one — a dissonance here
      // is only allowed if it can resolve THERE
      const nextAbs = i + 1 < rhythm.length ? rhythm[i + 1]! : null;
      const nextBar = nextAbs === null ? null : firstBar + Math.floor(nextAbs / steps);
      const next = nextBar !== null && nextBar < chords.length
        ? { bar: nextBar, step: nextAbs! % steps, chord: chords[nextBar]! }
        : null;
      // THE LOOP SEAM. The material repeats, so its last note is followed by
      // its first. The last onset of the last phrase may not take the first
      // note's pitch, or the tune repeats itself every time it comes round —
      // and the note before it may only be admitted if a resolution other
      // than that pitch exists.
      const isFinalPhrase = (ph + 1) * PHRASE_BARS >= chords.length;
      const finalOnset = isFinalPhrase && next === null;
      const nextIsFinal = isFinalPhrase && next !== null && i + 2 >= rhythm.length;
      const seamPitch = out[0]?.pitch ?? null;
      const barred = (p: number, atFinal: boolean): boolean => atFinal && seamPitch !== null && p === seamPitch;
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
            !barred(r, nextIsFinal) &&
            Math.abs(r - p) <= 2 &&
            r >= lo && r <= hi &&
            Math.max(phraseHi, p, r) - Math.min(phraseLo, p, r) <= L.span &&
            clear(next.bar, next.step, r, next.chord)
          );
        });

      let cands: number[];
      if (prev === null) {
        // the record's first note is a chord tone. WHICH chord tone is a
        // matter of preference and is settled below, after the laws: the two
        // preferences that used to be applied here — near the middle of the
        // register, and away from the closing chord — could between them
        // leave two pitches, both of which the keys were already holding,
        // and then the whole first phrase rested.
        cands = pool.filter((p) => isTone(chord, p));
      } else {
        const from = prev.pitch;
        const wasOff = prevChord !== null && !isTone(prevChord, from);
        // a dissonance resolves by step; anything else may reach a fifth. A
        // reciting tone may also stay where it is, which is the one thing it
        // is made of; the other two contours may not.
        const mayHold = contour === "chant";
        cands = pool.filter((p) => (mayHold || p !== from) && Math.abs(p - from) <= (wasOff ? 2 : 7));
        // and it resolves INTO the chord — that is the law, and the note
        // before was only admitted because this resolution existed
        if (wasOff) cands = cands.filter((p) => isTone(chord, p));
      }

      // THE LAWS, FIRST. Each is a filter that may leave nothing, and nothing
      // means this onset rests: a rest is always legal and a wrong note never
      // is. They come before every preference, because a preference that is
      // allowed to empty the list is a preference deciding legality.
      //   a note off the chord must be able to resolve at the next onset;
      //   with no next onset in the phrase, only the chord will do
      cands = cands.filter((p) => isTone(chord, p) || canResolve(p));
      //   the phrase stays inside its span
      cands = cands.filter((p) => Math.max(phraseHi, p) - Math.min(phraseLo, p) <= L.span);
      //   a seat another part holds is never offered, and on a beat nothing
      //   may rub a semitone against what is ringing
      cands = cands.filter((p) => clear(bar, step, p, chord));
      //   and the last note of the loop is not its first
      cands = cands.filter((p) => !barred(p, finalOnset));
      if (cands.length === 0) continue;

      // THE PREFERENCES, AMONG WHAT IS LEGAL. Each narrows only if something
      // survives it; none can cause a rest.
      if (prev === null) {
        //   near the middle of the register, because a tune that opens at the
        //   edge of its range has nowhere to go. A fourth, then a fifth.
        for (const reach of [5, 7]) {
          const near = cands.filter((p) => Math.abs(p - centre) <= reach);
          if (near.length > 0) {
            cands = near;
            break;
          }
        }
        //   and, where the closing chord differs from the opening one, a tone
        //   the closing chord does NOT hold — then the loop's last note, which
        //   is a tone of the closing chord, cannot be the first note. The seam
        //   is decided here, at the one choice that can decide it.
        const closing = chords[chords.length - 1]!;
        const away = cands.filter((p) => !isTone(closing, p));
        if (away.length > 0) cands = away;
        //   and nothing rubs against what is ringing if anything else will do
        const smooth = cands.filter((p) => !sounding.rubs(bar, step, p));
        if (smooth.length > 0) cands = smooth;
      } else {
        const from = prev.pitch;
        //   A RECITING TONE STAYS PUT. It is the whole of what a chant is:
        //   the line holds its pitch and the rhythm carries the phrase, and
        //   it leaves only now and then. Applied before the size, because a
        //   held note is neither a step nor a leap.
        if (contour === "chant") {
          const holding = cands.filter((p) => p === from);
          // Chop Suey's vocal repeats its own pitch 44% of the time. The
          // draw is lower than the share it produces, because a hold that is
          // refused here can still be the only legal candidate below.
          if (holding.length > 0 && at.at("note", i).chance("hold", 0.28)) {
            cands = holding;
          }
        }
        //   A LEAP IS ANSWERED THE OTHER WAY, seven times in ten: "any large
        //   melodic leap will be followed by a reversal of pitch direction
        //   approximately 70% of the time" (Huron, Sweet Anticipation).
        //   Before the size is drawn, because the answer to a leap is a step
        //   and this would otherwise be arguing with the draw.
        //
        //   NOT FOR AN ARPEGGIO. Post-skip reversal is a fact about melodies,
        //   and Huron's own account of why is regression to the mean: a large
        //   leap takes a line near the edge of its range and the pull back is
        //   what shows up as a reversal (Von Hippel & Huron, "Why Do Skips
        //   Precede Reversals?"). A chord taken apart is not doing that — it
        //   is walking deliberately through its own tones — and applying the
        //   reversal to it turns every leap into a step and leaves a riff
        //   indistinguishable from a sung line, which is what it did.
        if (contour !== "riff" && Math.abs(lastMove) >= 3 && cands.length > 1 && at.at("note", i).chance("reverse", 0.7)) {
          const back = cands.filter((p) => Math.sign(p - from) === -Math.sign(lastMove) && Math.abs(p - from) <= 2);
          if (back.length > 0) cands = back;
        }
        //   a leap or a step, drawn — FIRST among the sizes, because chord
        //   tones sit thirds apart and a chord-tone preference applied before
        //   the size would make nearly every beat a leap. How often a line
        //   leaps at all is its contour's: a sung line walks, a riff is a
        //   chord played one note at a time.
        const leap = at.at("note", i).chance("leap", leapChance);
        const sized = cands.filter((p) => (leap ? Math.abs(p - from) >= 3 : Math.abs(p - from) <= 2));
        if (sized.length > 0) cands = sized;
        //   AN ARPEGGIO IS A CHORD PLAYED ONE NOTE AT A TIME, so a riff
        //   reaches for a chord tone wherever it is, not only on the beat.
        //   That is what makes Shine On's clean electric leap four times out
        //   of five where its saxophone leaps one in eight: the guitar is not
        //   a melody that leaps, it is a chord taken apart.
        if (contour === "riff") {
          const tones = cands.filter((p) => isTone(chord, p));
          if (tones.length > 0) cands = tones;
        }
        //   on a beat the chord is home, among moves of that size; when no
        //   chord tone is a step away the beat takes an appoggiatura, which
        //   is legal only because it resolves
        if (strong) {
          const tones = cands.filter((p) => isTone(chord, p));
          if (tones.length > 0) cands = tones;
        }
        //   nothing rubs against what is ringing if anything else will do —
        //   the chord-tone rubs the law above lets through, softened here
        const smooth = cands.filter((p) => !sounding.rubs(bar, step, p));
        if (smooth.length > 0) cands = smooth;
        //   and the phrase leans the way it is going
        const leaning = cands.filter((p) => Math.sign(p - from) === dir);
        if (leaning.length > 0 && at.at("note", i).chance("lean", 0.7)) cands = leaning;
      }

      const pitch = at.at("note", i).pick("pitch", cands);
      // and HOW it is played, which the position and its neighbour decide as
      // much as the genre does: a hammer-on needs the note before it to be
      // within a hand's reach, a ghost needs to be off the beat
      const art = manner(at.at("note", i), "art", L.art, {
        strong,
        dur,
        from: prev === null ? null : pitch - prev.pitch,
      });
      const note: Note = { bar, step, dur, pitch, vel: LEAD_WEIGHT, art };
      out.push(note);
      lastMove = prev === null ? 0 : pitch - prev.pitch;
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
        .filter((p) => clear(lastNote.bar, lastNote.step, p, chord))
        .sort((a, b) => Math.abs(a - lastNote.pitch) - Math.abs(b - lastNote.pitch))[0];
      if (target !== undefined && Math.abs(target - lastNote.pitch) <= 4) {
        out[out.length - 1] = { ...lastNote, pitch: target };
      }
    }
  }

  // THE SEAM, CLOSED. The barring above makes this rare; it cannot make it
  // impossible, because the final onset may rest and then the note before it
  // is the last. Both ends of the loop are only known here, so the rule is
  // applied here — and it only ever REMOVES a note, never moves one, so it
  // can create neither a wrong note nor a new repeat: two notes left adjacent
  // by a removal were adjacent already. A note whose resolution is removed
  // goes with it, which is what the loop condition is.
  const first = out[0]?.pitch;
  if (first !== undefined) {
    while (out.length > 1) {
      const last = out[out.length - 1]!;
      const onChord = isTone(chords[last.bar]!, last.pitch);
      if (onChord && last.pitch !== first) break;
      out.pop();
    }
  }
  return out;
}
