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
 * HOW A LINE MOVES IS THE PART'S OWN GRAMMAR, drawn once per tune. A wind
 * line, a riff guitar and a chanted vocal are three different ways of
 * choosing the next pitch, not one process with different pools: conjunct
 * motion moves by step, disjunct motion leaps, and a reciting tone holds. See
 * CONTOURS in the spec for what each is and where it is written down.
 *
 * Every rule here is a CONSTRAINT ON THE CHOICE, applied when a pitch is
 * chosen, never a pass that corrects a line after it is written:
 *
 *   A NOTE REPEATS ITS PREDECESSOR ONLY ON A RECITING TONE. It used to be
 *   barred outright, on the grounds that a tune that hammers one note is a
 *   tune with nothing to say — and that was too strong, because a whole
 *   documented manner of singing is made of exactly that. Chant is "the
 *   rhythmic speaking or singing of words or sounds, often primarily on one
 *   or two pitches" (en.wikipedia.org/wiki/Reciting_tone), and holding one
 *   has its own name, repercussion. So the bar stands for the two contours it
 *   is true of, and the third is allowed the thing it is made of.
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
 * AND THE LAWS ABOVE ONLY SAY WHAT A NOTE MAY NOT BE. They keep a line from
 * being wrong; none of them makes it a TUNE. These do, and every one is a
 * preference applied after the laws, so none can put a wrong note in a record
 * — only a plainer one. The sources are in docs/genre-research/
 * MELODY-AND-THE-HOOK.md and the numbers are read back out of the MIDI file
 * by tools/roll.ts.
 *
 *   A PHRASE SAYS A FIGURE AND SAYS IT AGAIN. A hook is "a memorable catch
 *   phrase or melody line which is REPEATED in a song" (Songwriter's Market,
 *   quoted in Burns, "A typology of 'hooks' in popular records", 1987), and
 *   Burns's own examples are of a segment "repeated immediately" inside a
 *   verse. The first few onsets are the figure; where the rhythm says the
 *   figure's gaps again, the phrase restates it — where it stands, or a step
 *   or two along the scale, which is what a sequence is. Measured before this
 *   existed: 3% of phrases restated anything of their own, and the only
 *   repetition in the program was the loop coming round.
 *
 *   A PHRASE WALKS A SHAPE. Huron's reduction of a contour is three points —
 *   first pitch, mean of the middle, last — and counted that way the arch is
 *   the commonest shape in the folksong corpora, then the descent, then the
 *   rise, with the concave shape rarest ("The Melodic Arch in Western
 *   Folksongs", 1996). The earworm work finds the same shapes in the tunes
 *   people cannot get rid of (Jakubowski et al., 2017). The old rule drew ONE
 *   direction per phrase and leaned that way throughout, which cannot make an
 *   arch at all.
 *
 *   AND IT CLOSES WHERE THE SHAPE WAS GOING. A lean at 70% a note is a
 *   tendency, not an outcome: the cadence is where the shape becomes a
 *   decision, so the last onsets take the side of the phrase's own opening
 *   that the shape points to, and land on the chord.
 *
 *   ONE INTERVAL WIDER THAN A FIFTH, AND ONLY ONE. "Any interval larger than
 *   a perfect fifth seems distinctive" (Burns 1987); the earworm study finds
 *   INMI tunes have conventional contours and UNUSUAL gradients between their
 *   turning points. So a tune may spend one wide leap — at a phrase's opening
 *   or on the way back into its figure — and then it is spent. Before this,
 *   no interval in any record this program made was wider than a fifth,
 *   because the reach was capped at one.
 *
 *   AND A WIDE LEAP IS ANSWERED. Post-skip reversal at Huron's 70%, and then
 *   Meyer's gap-fill: the leap leaves a DEBT and the line pays it back a step
 *   at a time while it lasts. Only a leap wider than a fifth leaves one — a
 *   third obliges a line to nothing, and a debt kept for every third fought
 *   the phrase's own shape.
 *
 *   THE TOP OF THE TUNE IS AN EVENT. "Many melodies have a single highest
 *   note, usually at or near the end" (Burns 1987): nothing takes the top
 *   note twice, and while the tune is in its first half it would rather not
 *   reach far above where it has already been.
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
import type { Arc, Contour } from "../../genre/spec.ts";
import type { Chart } from "../chart.ts";
import { manner } from "./manner.ts";
import type { Chord, Note, Sounding } from "./note.ts";

const PHRASE_BARS = 2;

/**
 * Where a phrase turns: half way through it.
 *
 * Huron's reduction of a contour is three points — the first pitch, the mean
 * of the middle, the last — so an arch is a rise through the middle and a
 * fall out of it, and the middle of a phrase is the middle. [chosen] at a
 * half; the sources rank the shapes and do not place the turn.
 */
const TURN = 0.5;

/** Which way a phrase walking this shape wants to go, `at` through it (0..1). */
function leaning(arc: Arc, at: number): number {
  switch (arc) {
    case "arch": return at < TURN ? 1 : -1;
    case "concave": return at < TURN ? -1 : 1;
    case "ascending": return 1;
    case "descending": return -1;
  }
}

/**
 * A shape that ends the other way from this one — what an answering phrase
 * takes.
 *
 * The period wants its consequent to move against its antecedent, and Huron
 * measures that "descending arches are more common in the last phrase, while
 * ascending arches predominantly occur in the first phrase" ("The Melodic
 * Arch in Western Folksongs", 1996). Those are the same statement made from
 * two directions, so the answer to a rise is a descent and the answer to a
 * descent is a rise, and an arch is answered by the shape that ends where it
 * did not.
 */
const answerTo = (arc: Arc): Arc => (arc === "descending" || arc === "concave" ? "ascending" : "descending");

/** A perfect fifth. Anything wider "seems distinctive" (Burns 1987). */
const FIFTH = 7;

/** The widest a signature leap may be: an octave, and no further. [chosen] */
const SIGNATURE_MAX = 12;

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
  /**
   * THE DEBT A LEAP LEAVES. Meyer's gap-fill: "large intervals in a melody
   * imply smaller intervals in the opposite direction", and the implication
   * is not discharged by one step — the line walks back THROUGH the gap. So a
   * leap is recorded as a signed debt and every step the other way pays some
   * of it off, which is the difference between a reversal and a fill.
   */
  let owed = 0;
  /** How many notes ago the gap was opened: an implication lapses, it does not haunt. */
  let owedFor = 0;
  /**
   * THE TUNE'S HIGH POINT. "Many melodies have a single highest note, usually
   * at or near the end of the record. The highest note usually marks a
   * climax" (Burns 1987). Two preferences fall out of that and both are only
   * preferences: nothing may equal the top once it is set, and while the tune
   * is in its first half it would rather not set a new one.
   */
  let top = -Infinity;
  /**
   * ONE INTERVAL WIDER THAN A FIFTH, and only one. "Any interval larger than
   * a perfect fifth seems distinctive" (Burns 1987); the earworm work finds
   * the same thing from the other end — a conventional contour with an
   * unusual gradient between its turning points (Jakubowski et al. 2017). A
   * tune that leaps like that twice has a habit, not a signature.
   */
  const wantsSignature = rng.chance("signature", L.signature);
  let signatureSpent = false;
  /** The shape of the phrase that closes the tune, and where it opened. */
  let closeArc: Arc = "descending";
  let closeFirst: number | null = null;
  const phrases = Math.ceil(chords.length / PHRASE_BARS);

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

    /**
     * DOES THIS PHRASE SAY ITS FIGURE TWICE, and if it does, WHAT RHYTHM CAN
     * CARRY THAT?
     *
     * Drawn once for the phrase rather than rolled at every onset, because it
     * is a fact about the phrase: a hook is "a memorable catch phrase or
     * melody line which is REPEATED" (Songwriter's Market, in Burns 1987) and
     * Burns's own example is a segment "repeated immediately" inside a verse.
     *
     * AND THE RHYTHM IS CHOSEN KNOWING IT. A figure is a shape and its feet,
     * so a restatement needs a cell whose gaps say the figure's gaps twice —
     * and a cell that cannot is not a cell this phrase can use. Measured
     * before this: the phrase drew any cell and then looked for somewhere to
     * put the restatement, and two thirds of the time the cell it had drawn
     * had nowhere. Narrowing the pool BEFORE the draw is the same move this
     * file makes everywhere else: constrain the choice, never repair it.
     */
    const restating = at.chance("restate", L.motif.restate);
    const says = (cell: readonly number[]): boolean => {
      const len = L.motif.notes;
      if (cell.length < len * 2) return false;
      for (let j = len - 1; j + len <= cell.length; j++) {
        let all = true;
        for (let k = 0; k + 1 < len && all; k++) all = cell[k + 1]! - cell[k]! === cell[j + k + 1]! - cell[j + k]!;
        if (all) return true;
      }
      return false;
    };
    const carries = L.rhythms.filter(([cell]) => says(cell));
    const rhythm = at.weighted("rhythm", restating && carries.length > 0 ? carries : L.rhythms);

    // THE SHAPE THIS PHRASE WALKS, drawn from the genre's ranking of them —
    // arch first, because it is the commonest contour in every corpus that
    // has been counted. The ANSWER takes the shape that ends the other way
    // from where the question actually went, which is arithmetic on its first
    // and last notes and is also what Huron measures about last phrases.
    const drawn = at.weighted("arc", L.arc);
    const arc: Arc = isAnswer
      ? questionDir > 0 ? "descending" : questionDir < 0 ? "ascending" : answerTo(drawn)
      : drawn;

    let phraseLo = Infinity;
    let phraseHi = -Infinity;
    const phraseStart = out.length;
    /**
     * THE FIGURE THIS PHRASE IS MADE OF, and the plan to say it again.
     *
     * A hook is "a memorable catch phrase or melody line which is REPEATED"
     * and Burns's own example is a phrase "repeated immediately" inside a
     * verse. So the first few onsets of a phrase are its figure, kept as
     * RUNGS OF THE SCALE rather than semitones — a restatement moved a step
     * up is the same figure, and moved by a semitone it is a different key.
     *
     * The plan is a PREFERENCE, note by note: each planned pitch is offered
     * to the same laws as any other candidate and dropped the moment one
     * refuses it. A hook cannot put a wrong note in a record.
     */
    const rungs: number[] = [];
    /**
     * The restatements still on the table. A figure can be said again where
     * it stands or a step or two along, and which of those the laws will
     * allow is not knowable when the plan is made — the chords under the
     * restatement have not been read yet. So every offset that has rungs to
     * stand on is kept, and each onset narrows the list to the ones whose
     * next note actually survived. The tune follows whichever is left.
     */
    let plans: number[][] = [];
    /** The onset the restatement begins on, or −1 while nothing is planned. */
    let planFrom = -1;
    /** Where this phrase opened, which is what its close is measured against. */
    let phraseFirst: number | null = null;
    /**
     * The last onset of this phrase that lands inside the loop — the one the
     * phrase closes on. Not `rhythm.length - 1`: a cell written for two bars
     * over a loop that is shorter runs off the end, and the note that closes
     * the phrase is the last one that fits.
     */
    let lastOnset = -1;
    for (let i = 0; i < rhythm.length; i++) {
      if (firstBar + Math.floor(rhythm[i]! / steps) < chords.length) lastOnset = i;
    }

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
      // the one onset of this phrase where the reach opens wide, if the tune
      // has a signature to spend and has not spent it
      // WHERE A SIGNATURE LEAP CAN LIVE: at the opening of a phrase, which is
      // where Burns's examples sit ("the first two words separated by a
      // melodic interval of a minor sixth"), or on the jump back into the
      // figure — which is the same event one layer in, a line re-entering.
      const signatureHere = wantsSignature && !signatureSpent && prev !== null
        && (i === 0 || (plans.length > 0 && i === planFrom));
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
        //
        // AND ONCE, THE TUNE MAY REACH FURTHER. The one place the reach opens
        // to an octave is the opening of a phrase after the first, which is
        // where Burns's examples of the distinctive interval sit — "the first
        // two words separated by a melodic interval of a minor sixth". A
        // dissonance still resolves by step: the signature is a leap FROM a
        // chord tone, never an excuse to strand one.
        const mayHold = contour === "chant";
        const reach = wasOff ? 2 : signatureHere ? SIGNATURE_MAX : FIFTH;
        cands = pool.filter((p) => (mayHold || p !== from) && Math.abs(p - from) <= reach);
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
        //   THE FIGURE AGAIN. If a restatement is planned for this onset and
        //   the laws have left it standing, that is what the tune plays: a
        //   hook is a hook because it comes back, and every preference below
        //   would otherwise talk it out of coming back.
        if (plans.length > 0 && i >= planFrom) {
          const want = new Set(plans.map((pl) => pl[i - planFrom]).filter((v): v is number => v !== undefined));
          const kept = cands.filter((p) => want.has(p));
          if (kept.length > 0) cands = kept;
          else plans = []; // the laws refused every one: the figure stops here
        }
        //   ONE WIDE INTERVAL, where the reach was opened for it. Before the
        //   size is drawn, because a signature leap is not a draw — it is the
        //   one move in the tune that is decided in advance.
        //   (after the figure, so that when the tune re-enters its hook with
        //   a leap — 'I dig rock and roll music', an octave between the first
        //   two words — the wide way in is the one taken)
        if (signatureHere) {
          const wide = cands.filter((p) => Math.abs(p - from) > FIFTH);
          if (wide.length > 0) cands = wide;
        }
        //   WALKING INTO THE FIGURE. When a restatement begins at the next
        //   onset, this note prefers to be one the figure can be reached
        //   from: within a fifth of where it starts, and — if this note is
        //   off the chord — a step from it, because a dissonance may only
        //   resolve by step. Measured: ten of twenty-three planned
        //   restatements were refused at their own first note, and this is
        //   where that was decided, one note earlier.
        if (plans.length > 0 && i === planFrom - 1) {
          const entries = plans.map((pl) => pl[0]!);
          const able = cands.filter((p) =>
            entries.some((e) => Math.abs(e - p) <= FIFTH && (isTone(chord, p) || Math.abs(e - p) <= 2)));
          if (able.length > 0) cands = able;
        }
        //   THE CADENCE. Where a phrase ends is not a habit like the ones
        //   below it — it is the phrase's own claim about which way it went,
        //   and an answer that closes above where it opened reads as another
        //   question however carefully it descended in between. So it outranks
        //   the leap draw, the chord-tone habits and the lean, and is outranked
        //   only by the figure itself.
        //
        //   THE LAST TWO ONSETS, not the last one: an onset can rest — the
        //   laws may leave it nothing — and then the note that actually closes
        //   the phrase is the one before it, which was never asked to close.
        const opened = phraseFirst;
        if (i >= lastOnset - 1 && opened !== null) {
          const closes = cands.filter((p) => Math.sign(p - opened) === leaning(arc, 1));
          if (closes.length > 0) cands = closes;
          // and it lands on the chord, which is what closing means — chosen
          // here rather than corrected afterwards, because "the nearest chord
          // tone" was walking the cadence back up over the phrase's opening
          const home = cands.filter((p) => isTone(chord, p));
          if (home.length > 0) cands = home;
        }
        //   A RECITING TONE STAYS PUT. It is the whole of what a chant is:
        //   the line holds its pitch and the rhythm carries the phrase, and
        //   it leaves only now and then. Applied before the size, because a
        //   held note is neither a step nor a leap.
        if (contour === "chant") {
          const holding = cands.filter((p) => p === from);
          // The draw is lower than the share it produces, because a hold
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
        //
        //   AND THEN THE GAP IS FILLED. Meyer's gap-fill is not one step and
        //   done: "large intervals in a melody imply smaller intervals in the
        //   opposite direction", and the implication is discharged by walking
        //   back THROUGH the gap. The reversal is drawn at Huron's 70%; once
        //   it has happened the debt keeps the line stepping the same way
        //   until what is left of the gap is a step, which is what makes an
        //   octave leap a gesture rather than a hole.
        if (contour !== "riff" && cands.length > 1) {
          // the reversal itself, at Huron's rate and for any leap of a third
          // or more — which is what this program has always done
          if (Math.abs(lastMove) >= 3 && at.at("note", i).chance("reverse", 0.7)) {
            const back = cands.filter((p) => Math.sign(p - from) === -Math.sign(lastMove) && Math.abs(p - from) <= 2);
            if (back.length > 0) cands = back;
          } else if (Math.abs(owed) > 2) {
            // and the FILL, which only a WIDE leap asks for: Meyer's rule is
            // about LARGE intervals, and a debt kept for every third fought
            // the phrase's own shape — measured, it turned half the answering
            // phrases back into copies of their questions. So only an
            // interval wider than a fifth leaves a debt, and the line pays it
            // off a step at a time until what is left is a step.
            const back = cands.filter((p) => Math.sign(p - from) === -Math.sign(owed) && Math.abs(p - from) <= 2);
            if (back.length > 0) cands = back;
          }
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
        //   That is what makes it a different kind of line from a sung one
        //   rather than a sung one with the leap dial turned up: it is not a
        //   melody that leaps, it is a chord taken apart.
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
        //   THE TOP OF THE TUNE IS AN EVENT, NOT A CEILING. "Many melodies
        //   have a single highest note, usually at or near the end of the
        //   record. The highest note usually marks a climax" (Burns 1987) —
        //   so nothing takes the top note twice, and while the tune is still
        //   in its first half it would rather not reach far above where it
        //   has already been. Measured before this existed: the highest note
        //   of a lofi record sounded seven and a half times, which is what a
        //   register bound sounds like when it is doing a decision's job.
        if (top > -Infinity && contour !== "chant") {
          const under = cands.filter((p) => p !== top);
          if (under.length > 0) cands = under;
          if (ph * 2 < phrases) {
            //   a step above the highest note so far, no more: an early rise
            //   is a rise and not the climax. [chosen] at a whole tone
            const modest = cands.filter((p) => p <= top + 2);
            if (modest.length > 0) cands = modest;
          }
        }
        //   AND A PHRASE ENDS WHERE ITS SHAPE WAS GOING. The shape is a lean
        //   at 70% a note, which is a tendency and not an outcome: measured,
        //   answers that had descended all the way through were closing above
        //   where they opened and reading as another question. The last onset
        //   of a phrase is the one place the shape is a decision — that is
        //   what a cadence is — so it takes the side of the phrase's own
        //   opening pitch that the shape points to.
        //   and the phrase walks its shape: up to the turn and down out of
        //   it, or down, or up. The lean is drawn at the same 70% it always
        //   was — a shape a line obeys at every note is a scale.
        const wants = leaning(arc, i / Math.max(1, rhythm.length - 1));
        const leans = cands.filter((p) => Math.sign(p - from) === wants);
        if (leans.length > 0 && at.at("note", i).chance("lean", 0.7)) cands = leans;
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
      const move = prev === null ? 0 : pitch - prev.pitch;
      lastMove = move;
      if (Math.abs(move) > FIFTH) signatureSpent = true;
      // the debt a leap leaves, and what pays it off: a step the other way
      // takes its own size off the gap, and a move that walks away from the
      // gap lets the implication lapse rather than owing it forever
      if (Math.abs(move) > FIFTH) { owed = move; owedFor = 0; }
      else if (owed !== 0) {
        owedFor++;
        // A STEP BACK PAYS THE GAP DOWN; A STEP THE OTHER WAY DOES NOT CANCEL
        // IT. The first version cleared the debt the moment the line moved
        // away from the gap, and measured, that is what happened almost every
        // time: only five of twenty-six wide leaps were ever walked back,
        // because the note after the leap often continued in the leap's own
        // direction and the implication was dropped there and then. Meyer's
        // implication is not discharged by ignoring it. It does lapse, though
        // — a line cannot owe a gap for ever — so it is forgotten four notes
        // on, which is about as long as an ear holds the leap. [chosen]
        const paid = Math.sign(move) === -Math.sign(owed) ? Math.abs(move) : 0;
        const left = Math.abs(owed) - paid;
        owed = left > 2 && owedFor < 4 ? Math.sign(owed) * left : 0;
      }
      if (pitch > top) top = pitch;
      if (phraseFirst === null) phraseFirst = pitch;
      prev = note;
      prevChord = chord;
      phraseLo = Math.min(phraseLo, pitch);
      phraseHi = Math.max(phraseHi, pitch);

      // ── THE FIGURE, AND THE PLAN TO SAY IT AGAIN ──────────────────────────
      // The first `motif.notes` onsets of the phrase are its figure, kept as
      // rungs of the scale. At the onset after it — and after every
      // restatement — the phrase either says the figure again or walks on.
      const rung = pool.indexOf(pitch);
      if (rungs.length < L.motif.notes && rung >= 0) rungs.push(rung);
      if (plans.length > 0 && i >= planFrom) {
        plans = plans.filter((pl) => pl[i - planFrom] === pitch);
        if (plans.length === 0 || i - planFrom + 1 >= plans[0]!.length) { plans = []; planFrom = -1; }
      }
      if (restating && plans.length === 0 && rungs.length === L.motif.notes) {
        // THE FIGURE AGAIN, from the top: the exact repeat first, then a step
        // or two either way, which is what a sequence is — "transposing the
        // motive to another pitch level in a stepwise manner". The first
        // offset whose whole figure has rungs to stand on is the one planned;
        // the laws still judge it note by note, and refuse it note by note.
        // AND WHERE THE RHYTHM LETS IT STAND. A figure is a shape AND its
        // feet: the same pitches at different distances are not the same
        // figure, and a listener holds the rhythm at least as tightly as the
        // pitches. So the restatement is planned at the next onset whose gaps
        // match the figure's own, and where the phrase's rhythm never says
        // the figure twice, the phrase simply walks on.
        const len = L.motif.notes;
        const gapsMatch = (j: number): boolean => {
          for (let k = 0; k + 1 < len; k++) {
            const mine = rhythm[k + 1]! - rhythm[k]!;
            const there = rhythm[j + k + 1]! - rhythm[j + k]!;
            if (there === undefined || mine !== there) return false;
          }
          return true;
        };
        const shape = rungs.map((r) => r - rungs[0]!);
        /**
         * AND WHETHER THE LAWS WILL HAVE IT, ASKED BEFORE IT IS PLANNED.
         *
         * The first version planned the figure and let the laws refuse it note
         * by note, which is the right shape for a preference and the wrong one
         * for a plan: a restatement whose third note is illegal is not two
         * thirds of a hook, it is a figure that stops in the middle, and the
         * line has already committed to it by then. Every planned note's
         * position is known here — the chord under it, what is ringing at it,
         * whether it is a beat — so the whole restatement is judged before a
         * note of it is written, and an offset that cannot stand is not
         * offered. What the laws still do at each onset is refuse a
         * restatement the line could not REACH, which is not knowable here.
         */
        const stands = (pitches: readonly number[], j: number): boolean =>
          pitches.every((p, k) => {
            const abs = rhythm[j + k]!;
            const b = firstBar + Math.floor(abs / steps);
            if (b >= chords.length) return false;
            const st = abs % steps;
            const c = chords[b]!;
            if (!clear(b, st, p, c)) return false;
            // THE LAWS, AND NOT THE PREFERENCES. A note off the chord is
            // legal exactly when the next one resolves it by step into the
            // chord under it — that is a law, and it is checked here across
            // the whole figure. That a beat would RATHER have a chord tone is
            // a preference, and a preference is not allowed to refuse a hook:
            // it was, and it threw away eighteen restatements in twenty-six.
            if (!isTone(c, p)) {
              const nx = pitches[k + 1];
              if (nx === undefined || Math.abs(nx - p) > 2) return false;
              const nb = firstBar + Math.floor(rhythm[j + k + 1]! / steps);
              if (nb >= chords.length || !isTone(chords[nb]!, nx)) return false;
            }
            // and nothing says the same pitch twice unless it is a chant
            if (k > 0 && contour !== "chant" && pitches[k - 1] === p) return false;
            return true;
          });
        for (let j = i + 1; j + len <= rhythm.length; j++) {
          if (!gapsMatch(j)) continue;
          const made = [0, 1, -1, 2, -2]
            .map((offset) => ({ offset, pitches: shape.map((d) => pool[rungs[0]! + offset + d]) }))
            .filter((pl): pl is { offset: number; pitches: number[] } => pl.pitches.every((v) => v !== undefined))
            .filter((pl) => stands(pl.pitches, j));
          if (made.length === 0) continue;
          // A SEQUENCE MOVES THE WAY THE PHRASE IS MOVING. "Transposing the
          // motive to another pitch level in a stepwise manner" says how far,
          // not which way, and the phrase's own shape answers that: a
          // descending phrase says its figure again lower. Without this the
          // restatement was free to climb through a phrase that was supposed
          // to be the answer coming down, and half the answers ran the same
          // way as their questions.
          const with_ = made.filter((pl) => Math.sign(pl.offset) === leaning(arc, 1));
          const exact = made.filter((pl) => pl.offset === 0);
          plans = (with_.length > 0 ? with_ : exact.length > 0 ? exact : made).map((pl) => pl.pitches);
          // AND THE HOOK KEEPS OFF THE CLIMAX where it can. A figure that
          // contains the tune's highest note takes that note again every time
          // it comes back, and then the top is a habit rather than an event —
          // measured: the share of phrases whose peak sounds once fell from
          // 85% to 69% when restatement arrived. Where another offset will
          // stand, the restatement takes it and the top stays a single note.
          const off = plans.filter((pl) => !pl.includes(top));
          if (off.length > 0) plans = off;
          if (plans.length === 0) continue;
          planFrom = j;
          break;
        }
      }
    }

    closeArc = arc;
    closeFirst = phraseFirst;
    // where the question ACTUALLY went, which is what the answer answers —
    // the shape it was asked to walk is only what it was leaning toward
    if (!isAnswer && out.length > phraseStart) {
      const first = out[phraseStart]!.pitch;
      const last = out[out.length - 1]!.pitch;
      questionDir = Math.sign(last - first) || leaning(arc, 1);
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
      const able = chord.tones
        .map((t) => intoBand(t, lo, hi))
        .filter((p) => clear(lastNote.bar, lastNote.step, p, chord))
        .sort((a, b) => Math.abs(a - lastNote.pitch) - Math.abs(b - lastNote.pitch));
      // ON THE SIDE THE PHRASE WAS HEADING. The nearest chord tone alone put
      // a descending answer's last note above its own first, and a phrase
      // that closes above where it opened reads as another question — which
      // measured as nearly half the answers running the same way as their
      // questions.
      const side = closeFirst === null ? [] : able.filter((p) => Math.sign(p - closeFirst) === leaning(closeArc, 1));
      const target = (side.length > 0 ? side : able)[0];
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
