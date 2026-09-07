/**
 * The counter-line: the second tune, and the lesser one.
 *
 * "A sequence of notes, perceived as a melody, written to be played
 * simultaneously with a more prominent lead melody", which "performs a
 * subordinate role" — and the sentence that says what it is NOT: "whereas the
 * harmony part typically lacks its own independent musical line, a
 * countermelody is a distinct melodic line" (en.wikipedia.org/wiki/
 * Counter-melody). The keys already play the harmony. This plays a line.
 *
 * IT IS WRITTEN AGAINST THE TUNE, WHICH IS WHY IT IS BUILT AFTER IT. Every
 * other part here is written against the chords; this one is written against
 * the lead's own line for the same time round, because the whole of what makes
 * two melodies audible at once is that they do not happen at the same moment.
 * "On paper, mark where the lead rests. Those are your counter entries"
 * (versetuned.com, "How to Write a Counter Melody"). So the lead's rests are
 * the first thing this builder looks for — but never the only thing, because
 * this program's tune does not rest much and a rule that waits for silence
 * measured at zero notes per record. See the entries below.
 *
 * THREE CONSTRAINTS, AND THEY ARE THE SOURCE'S:
 *
 *   IT MOVES WHERE THE TUNE DOES NOT. A rest is the best entry; where there
 *   are none, an entry off the tune's own onsets and held longer than its
 *   notes is the other way the same source gives.
 *
 *   IT IS SPARSER. "Limit the counter to 40-60% of the lead's note density."
 *   `density` is a share OF THE LEAD's own count in this material, so a busy
 *   tune gets a busier answer and a sparse one is left alone. A ratio rather
 *   than a count is also the only version of this that survives a genre in
 *   five four.
 *
 *   IT STANDS CLEAR. "The line must occupy a different register band than the
 *   lead — at least an octave away." That is `counter.apart`, and it is not
 *   checked here: `resolve.ts` refuses a genre whose two bands are closer,
 *   so by the time this runs the bands are already clear of each other and
 *   this builder cannot place a note in the tune's way.
 *
 * AND IT IS A CONSTRAINT ON THE CHOICE, NEVER A REPAIR. Like every other
 * builder here, a pitch that would break a law is not offered: a seat another
 * part holds at that instant is not a candidate, and a step with no legal
 * pitch is left empty rather than filled with something that has to be fixed
 * afterwards.
 */

import type { Rng } from "../../core/rng.ts";
import { inScale, intoBand } from "../../core/theory.ts";
import type { Chart } from "../chart.ts";
import type { Chord, Note, Sounding } from "./note.ts";

/**
 * A counter note is quieter than the tune it answers. The lead's own weight is
 * the reference and this sits under it: "subordinate" is a level as well as a
 * position, and a second line at the tune's weight is two tunes.
 */
const COUNTER_WEIGHT = 0.62;

export function drawCounter(
  chart: Chart,
  chords: readonly Chord[],
  lead: readonly Note[],
  rng: Rng,
  steps: number,
  bars: number,
  sounding: Sounding,
): Note[] {
  const C = chart.genre.counter;
  const [lo, hi] = chart.register.counter;

  // WHERE THE TUNE IS TALKING, as a set of occupied instants. A note occupies
  // every step it is held for and not only the one it starts on — a counter
  // that answered into a held note would be answering over the tune.
  const busy = new Set<string>();
  for (const n of lead) {
    for (let k = 0; k < Math.max(1, n.dur); k++) {
      const at = n.step + k;
      // a note may be written past the bar line; it still occupies what it runs into
      busy.add(`${n.bar + Math.floor(at / steps)}:${at % steps}`);
    }
  }

  /** Where the tune STARTS something. Landing here is doubling it, never answering it. */
  const onset = new Set(lead.map((n) => `${n.bar}:${n.step}`));

  /**
   * THE ENTRIES, AND WHY THIS IS NOT ONLY ABOUT RESTS.
   *
   * The first version of this took only beats where the lead was silent, and
   * measured at ZERO notes in every material of every record: this program's
   * tune plays about one note a beat and holds it, so there is no instant in a
   * four-bar loop where nothing is sounding. A rule that fires nowhere is a
   * knob that does nothing, and the fault was in reading half a sentence.
   *
   * The source gives two ways in, not one: a counter "should enter on a beat
   * the melody rests, OR USE CONTRASTING DURATIONS" (versetuned.com). The
   * second clause is the sustained obbligato — the worked example in that same
   * page is "a sustained, arpeggiated line a tenth below" the voice, which is
   * not waiting for a rest at all. It contrasts by moving at a different RATE.
   *
   * So both are candidates and the true rests rank first: a step where the
   * tune is wholly silent is the better answer where one exists, and where
   * none does, a long note begun off the tune's own onsets is the other
   * documented way to be heard beside a melody rather than under it.
   */
  const beat = Math.max(1, chart.metre.perBeat);
  /**
   * ON THE HALF BEAT, because the tune is already on the beat. Offered only
   * beat positions, this measured seven notes in a record against the lead's
   * hundred and twenty-three: this program's tune plays about one note per
   * beat and puts it ON the beat, so nearly every beat is one of its own
   * onsets and an answer had nowhere to stand that was not doubling it.
   * Between them is where an answer goes, and it is the same sentence again —
   * contrasting durations against a line that does not stop.
   */
  const grid = Math.max(1, Math.floor(beat / 2));
  const rests: { bar: number; step: number }[] = [];
  const unders: { bar: number; step: number }[] = [];
  for (let bar = 0; bar < bars; bar++) {
    for (let step = 0; step < steps; step += grid) {
      if (!busy.has(`${bar}:${step}`)) rests.push({ bar, step });
      else if (!onset.has(`${bar}:${step}`)) unders.push({ bar, step });
    }
  }
  const gaps = [...rests, ...unders];
  if (gaps.length === 0) return [];

  /**
   * HOW MANY: a share of the lead's own count — and A ROUND WHERE THE TUNE IS
   * TACET IS NOT A ROUND OFF.
   *
   * An earlier version returned nothing when the lead had no line to answer,
   * on the reasoning that a counter with nothing to counter should keep quiet.
   * `all.test.ts` refused it by name — "lofi seed 9: the counter is heard in
   * the verse and plays nothing" — and it is right: the arrangement has
   * already told the record this part is playing, and a part that is heard
   * and silent is the exact fault `arrange.ts`'s header was written against.
   * Whether a part sounds is the arrangement's to decide, never a builder's
   * to decline.
   *
   * So where the tune rests, the counter has the material to itself and takes
   * a note a bar: the sustained line the sources describe, which is what this
   * part is when nothing is talking over it.
   */
  const want = Math.min(gaps.length, lead.length === 0 ? bars : Math.max(1, Math.round(lead.length * C.density)));

  // SPREAD, NOT CLUSTERED, AND THE RESTS FIRST. Taking the first `want`
  // entries in time order would put the whole counter in the material's
  // opening bars; walking a group at an even stride spends it across the
  // line, which is what "3 entries in an 8-bar loop" describes. Real rests
  // are drawn from before anything else, and only what they cannot fill is
  // taken from under the tune.
  const strided = (from: readonly { bar: number; step: number }[], n: number): { bar: number; step: number }[] => {
    if (n <= 0 || from.length === 0) return [];
    const step = from.length / n;
    return Array.from({ length: Math.min(n, from.length) }, (_, i) => from[Math.min(from.length - 1, Math.floor(i * step))]!);
  };
  const chosen = [...strided(rests, want), ...strided(unders, Math.max(0, want - rests.length))]
    .sort((a, b) => a.bar - b.bar || a.step - b.step);

  const out: Note[] = [];
  let prev: number | null = null;
  for (const g of chosen) {
    const chord = chords[g.bar % chords.length]!;
    const cell = rng.at("counter", g.bar * steps + g.step);

    // HOW LONG: up to the next thing the TUNE STARTS, never past the bar, and
    // never less than a beat. Running to the next sounding step would give a
    // note under the tune a length of one — the contrasting duration is the
    // whole reason that entry exists, so what it must clear is the next
    // onset, not the next ringing sample.
    let dur = 1;
    while (dur < beat * 2 && g.step + dur < steps && !onset.has(`${g.bar}:${g.step + dur}`)) dur++;

    // WHICH PITCH: a tone of the chord under it, in this part's own band, and
    // not a seat anything else is holding at that instant. Every octave the
    // band admits is offered, nearest the last note first — a line, not a
    // series of unrelated stabs.
    const seats: number[] = [];
    for (const t of chord.tones) {
      for (let p = intoBand(t, lo, lo + 11); p <= hi; p += 12) seats.push(p);
    }
    const nearest = (ps: number[]): number[] =>
      ps.filter((p) => !sounding.holds(g.bar, g.step, p))
        .sort((a, b) => (prev === null ? a - b : Math.abs(a - prev) - Math.abs(b - prev)));
    /**
     * A CHORD TONE IF ONE IS FREE, AND A SCALE TONE IF NOT.
     *
     * Offered chord tones alone, this wrote nothing at all in some materials
     * and `all.test.ts` named one — "dungeonsynth seed 32: the counter is
     * heard in the verse and plays nothing". That genre stacks its parts low
     * and holds them: the drone sustains a tonic, the keys hold the chord, and
     * between them every chord-tone seat inside this part's sixteen semitones
     * was literally occupied. Nothing was wrong with the band or the rule; the
     * candidate list was one idea wide.
     *
     * The wider list is still lawful. The chord-tone preference belongs to the
     * LEAD, where `lawsFor` enforces it because a tune's dissonance has to
     * resolve; a counter-line moving by step between chord tones is what a
     * passing note is. So the scale is the fallback and the chord is the
     * preference, which is the same order every builder here uses.
     */
    const inBand: number[] = [];
    for (let p = lo; p <= hi; p++) if (inScale(chart.tonic, chart.scale, p)) inBand.push(p);
    const free = nearest(seats).length > 0 ? nearest(seats) : nearest(inBand);
    if (free.length === 0) continue;
    // the nearest is the default and the draw only ever reaches the next two:
    // a counter that leapt wherever the chord allowed would not be a line
    const pitch = free[cell.weighted("seat", [[0, 5], [1, 2], [2, 1]].slice(0, free.length) as [number, number][])]!;

    out.push({ bar: g.bar, step: g.step, dur, pitch, vel: COUNTER_WEIGHT });
    prev = pitch;
  }
  return out;
}
