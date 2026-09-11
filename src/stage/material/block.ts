/**
 * THE BLOCKS: things that happen to a record instead of being played by it.
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
 *   - a block is not drawn into a figure; it OVERWRITES what the figure wrote
 *   - a block has a SOCKET, which is the set of conditions it can slot into,
 *     and a socket is a refusal in the same sense `deskOf` refuses a treatment
 *   - a block is RARE, and a record that fires none is a correct record
 *
 * AND A BLOCK BELONGS TO NO GENRE. A tom roll is a tom roll in lofi. What a
 * genre may say is which of them it allows — the same shape as
 * `sound.treatments` — and a genre that says nothing gets the default pool,
 * because a record with no interruptions at all was the thing this file was
 * written to stop.
 *
 * ── A BLOCK IS A FUNCTION, NOT AN INSTRUMENT ──────────────────────────────
 *
 * This file used to end its header with a paragraph that began "WHAT A BLOCK
 * MAY NOT DO. It may not write a pitch — every one here is drums". That
 * sentence had no source and it was wrong, and it cost the pool three
 * quarters of its reach: measured over 120 records, every one of the 240
 * blocks that fired, fired on the kit, because `drawDrums` was the only
 * caller. A tom roll could not happen on the keys; nothing could happen to
 * the bass at all.
 *
 * The research says a fill is a job, and names the instruments that do it:
 *
 *   "A short musical passage, riff, or rhythmic sound which helps to sustain
 *   the listener's attention during a break between the phrases of a melody"
 *   — played by "electric lead guitar, bass guitar, organ, drums, strings,
 *   horns, voice … and turntable scratching"
 *   (en.wikipedia.org/wiki/Fill_(music))
 *
 * And the drum literature's own taxonomy is by function rather than by kit:
 * "all drum fills can be grouped into three types: variation, tension, and
 * notification" (hackmusictheory.com). A tom roll and a keyboard run are the
 * same NOTIFICATION on different instruments; a snare crescendo and a tremolo
 * are the same TENSION. The shape is the thing that slots in, and the seat is
 * whatever is holding it.
 *
 * So a block declares HOW IT IS PLAYED ON A KIT and HOW IT IS PLAYED ON A
 * LINE, and either may be absent — an absence is a refusal in exactly the
 * sense a socket is. `tomroll` has no pitched half because a roll down the
 * toms is a kit gesture; `pickup` has no drum half because a grace note is a
 * pitch. Everything in between has both, and is the same gesture twice.
 *
 * `docs/genre-research/THE-BLOCKS.md` is the catalogue this list comes from,
 * and every block below cites its row in it.
 *
 * WHAT A SOCKET MAY READ, and why it is these six:
 *
 *   THE SEAT      which part is being asked. A block with no way to play this
 *                 kind of seat is not offered for it.
 *   ENERGY        the section's own, 0..1. "When the song drops down" is the
 *                 commonest socket there is: a break, a solo and a stop all
 *                 need room, and room is what a quiet section has.
 *   THE SEAM      whether this cycle is the last one before a section
 *                 boundary. A fill leads somewhere; one in the middle of a
 *                 section is a mistake, not a gesture.
 *   THE COUNT     how many times this material has already been heard. An
 *                 interruption on a first hearing breaks nothing, because
 *                 there is no pattern yet to break. This is the link to the
 *                 rule of three: a block is one more way for a third hearing
 *                 to differ, and the only one that costs notes without
 *                 costing a new idea.
 *   THE KIT       what lanes there are to play. A tom roll needs toms.
 *   THE LADDER    which pitches this seat may write: the scale, inside the
 *                 seat's own register. A block that ADDS a note may only add
 *                 one off this list, which is how the one gesture here that
 *                 invents a pitch stays inside the laws without knowing them.
 *
 * WHAT A BLOCK STILL MAY NOT DO. It may not decide WHO IS PLAYING. A tacet, a
 * stop-time chorus and a bass solo are all real, named devices and all three
 * are the arrangement's: they take a part out and leave another standing, and
 * that is `arrange.ts`'s to say. This file is the half that needs no
 * permission from the arrangement — it rewrites bars that were already this
 * seat's. (THE-BLOCKS.md §3 layer 5, marked `needs-arrangement`.)
 *
 * AND IT MAY NOT BREAK A LAW TO DO IT. Every gesture here returns a line and
 * the CALLER judges it: a block that would put a part outside its register or
 * onto a pitch somebody else is holding is refused and the round keeps what it
 * had. That is deliberate — the laws live where they already live, and a pool
 * of interruptions that had its own copy of them would be a second mechanism
 * beside the first.
 */

import { ART } from "../../core/articulation.ts";
import type { Rng } from "../../core/rng.ts";
import { BLOCKS, type BlockName, type DrumLane, type Role, type Weighted } from "../../genre/spec.ts";
import type { Hit, Note } from "./note.ts";

/** Where in the record a cycle is being played — what a block may read. */
export interface Where {
  readonly energy: number;
  /** Is this the last time round this material gets in its section? */
  readonly last: boolean;
}

/** Re-exported so a reader who lands here first finds the list. */
export { BLOCKS, type BlockName };

/**
 * WHAT FIRED, AND WHERE — the bar within the material, not only the name.
 *
 * A block is ONE BAR of one round and the round is the whole material, so a
 * reader told only the name has to draw a marker four bars wide over a
 * one-bar gesture. The piano roll is this program's main test and a picture
 * that lies is worse than no picture, so the bar comes back with the name.
 */
export interface Fired {
  readonly name: BlockName;
  /** The bar within the material it landed in. */
  readonly bar: number;
}

/** What a block is allowed to know about where it is being asked to go. */
export interface Socket {
  /** Whose round this is. */
  readonly part: Role;
  /** The section's own energy, 0..1. */
  readonly energy: number;
  /** Is this the last cycle of its section — the one that leads out? */
  readonly seam: boolean;
  /** How many times this material has been heard already, this one not counted. */
  readonly heard: number;
  /** Which lanes the kit actually strikes in this material. Empty for a pitched seat. */
  readonly lanes: ReadonlySet<DrumLane>;
  /** The pitches this seat may write, ascending. Empty for the drums. */
  readonly rungs: readonly number[];
  readonly steps: number;
  /** Grid steps per beat. */
  readonly beat: number;
  readonly bars: number;
}

/**
 * A gesture, in the two ways it can be played.
 *
 * Either half may be absent and the absence is the refusal: `withBlock` does
 * not offer a block to a seat it has no way to play. Both halves return `null`
 * for "there was nothing here to do that to" — a socket knows where a block
 * may GO and only the gesture knows whether the bar it landed in had anything
 * to work with, and a block that changed nothing must not be reported as one
 * that fired.
 */
interface Block {
  /** Where it may go. A refusal, not a preference the score will weigh. */
  readonly fits: (s: Socket) => boolean;
  /**
   * Does it lead OUT of the cycle, so it takes the last bar? A roll and a
   * build do; a stop and a doubling happen inside one. Which bar is the
   * block's own business — a caller choosing it would be deciding half of
   * what the gesture is.
   */
  readonly leads: boolean;
  readonly onHits?: (hits: readonly Hit[], bar: number, s: Socket, rng: Rng) => readonly Hit[] | null;
  readonly onNotes?: (notes: readonly Note[], bar: number, s: Socket, rng: Rng) => readonly Note[] | null;
}

/**
 * HOW LONG A FILL IS. The one useful published number found, and the one the
 * program most clearly contradicted:
 *
 *   "Most drum fills last 1 to 4 beats, commonly occupying the last beat of a
 *   4- or 8-bar phrase." — rhythmnotes.net, blog.landr.com
 *
 * `tomroll` took the WHOLE BAR — four times the upper bound and sixteen times
 * the common case. A fill that long is not a fill, it is a section. The lean
 * to one beat is the source's "commonly", and it is the right lean for the
 * music this record is being pushed toward as well: "sparse fills feel
 * enormous at slow tempos" (riffhard.com, doom metal riffs).
 */
const FILL_BEATS: Weighted<number> = [[1, 6], [2, 3], [4, 1]];

/** The last `beats` beats of a bar, as a grid step. */
const lastBeats = (beats: number, s: Socket): number => Math.max(0, s.steps - beats * s.beat);

/** Is this step where the metre leans — on a beat? `manner.ts`'s law for an accent. */
const onBeat = (step: number, s: Socket): boolean => step % s.beat === 0;

/** A note's last step, counting from the top of the material. */
const ends = (n: Note, steps: number): number => n.bar * steps + n.step + n.dur;

/**
 * DID ANYTHING ACTUALLY MOVE? Every gesture here reports `null` for "there was
 * nothing to do that to", and for the two that rewrite a bar's spacing that is
 * not answerable by counting: a bar of two notes squeezed into half of itself
 * can come back the same length and different, or the same length and the
 * same. So they are compared where an ear would compare them — what is struck,
 * when, and at what pitch.
 */
const noteShape = (l: readonly Note[]): string =>
  l.map((n) => `${n.bar}:${n.step}:${n.dur}:${n.pitch}`).sort().join("|");
const hitShape = (l: readonly Hit[]): string =>
  l.map((h) => `${h.bar}:${h.step}:${h.lane}`).sort().join("|");
const movedNotes = (a: readonly Note[], b: readonly Note[]): boolean => noteShape(a) !== noteShape(b);
const movedHits = (a: readonly Hit[], b: readonly Hit[]): boolean => hitShape(a) !== hitShape(b);

/**
 * EVERYTHING FROM THIS STEP OF THIS BAR ONWARD IS GONE, and anything ringing
 * across the line is cut off at it. Shared by the two blocks made entirely of
 * what they take away, because the difference between a cut and a hole is
 * whether the sound that was already going stops too.
 */
function silenceFrom(notes: readonly Note[], bar: number, from: number, steps: number): readonly Note[] | null {
  const edge = bar * steps + from;
  const out: Note[] = [];
  let changed = false;
  for (const n of notes) {
    const start = n.bar * steps + n.step;
    if (start >= edge && n.bar === bar) { changed = true; continue; }
    if (start < edge && ends(n, steps) > edge) { out.push({ ...n, dur: edge - start }); changed = true; continue; }
    out.push(n);
  }
  return changed ? out : null;
}

/** The same, for a kit: nothing rings, so there is nothing to cut short. */
function stopFrom(hits: readonly Hit[], bar: number, from: number): readonly Hit[] | null {
  const out = hits.filter((h) => !(h.bar === bar && h.step >= from));
  return out.length === hits.length ? null : out;
}

/**
 * THE POOL. A socket that returns false is not a preference the score will
 * weigh — it is a refusal, and the block is not offered at all.
 *
 * Every one of them requires `heard >= 1`. An interruption on a first hearing
 * is not an interruption; it is just what that material sounds like, and the
 * ear has nothing to be surprised against.
 */
const POOL: Readonly<Record<BlockName, Block>> = {
  /**
   * NOTIFY — THE-BLOCKS.md rows 1 and 6. A ROLL LEADS SOMEWHERE: into the
   * seam, on a kit that has toms. Its length is `FILL_BEATS` now rather than
   * the bar, which is the single correction the research forced.
   */
  tomroll: {
    fits: (s) => s.heard >= 1 && s.seam && s.lanes.has("tomlo") && s.lanes.has("tomhi"),
    leads: true,
    onHits: (hits, bar, s, rng) => {
      const from = lastBeats(rng.weighted("beats", FILL_BEATS), s);
      // THE FIGURE KEEPS THE BAR UP TO THE FILL. The old whole-bar version had
      // to hold the downbeat kick back by hand so the roll had a floor to fall
      // to; a fill that is the last beat leaves the floor where the figure put
      // it, which is what a drummer playing one actually does.
      const out: Hit[] = hits.filter((h) => h.bar !== bar || h.step < from);
      const every = Math.max(1, Math.floor(s.beat / 2));
      const run = Math.max(1, s.steps - from);
      for (let st = from; st < s.steps; st += every) {
        const through = (st - from) / run;
        // it descends, and lands on the low tom under the next downbeat
        const lane: DrumLane = through < 0.7 ? "tomhi" : "tomlo";
        const vel = 0.5 + 0.45 * through;
        // `exactOptionalPropertyTypes` is on: an absent manner and a manner of
        // `undefined` are different things here, and a hit that does not say
        // is struck plain by `drums.ts` afterwards
        out.push(through > 0.85 ? { bar, step: st, lane, vel, art: "accent" } : { bar, step: st, lane, vel });
      }
      return out;
    },
  },

  /**
   * TENSE — row 6. A BUILD IS A CRESCENDO INTO SOMETHING. Same seam, and it
   * wants the section to be going somewhere rather than winding down.
   */
  snarebuild: {
    fits: (s) => s.heard >= 1 && s.seam && s.lanes.has("snare") && s.energy >= 0.45,
    leads: true,
    onHits: (hits, bar, s) => {
      // AN ACCELERATION, not a ramp. The gap halves across the bar — quarters,
      // then eighths, then sixteenths — which is what makes a build feel like
      // it is being pulled rather than turned up. The velocity rises with it
      // because both happen at once when a drummer does this.
      const out: Hit[] = hits.filter((h) => h.bar !== bar || h.lane === "kick");
      let st = 0;
      let gap = s.beat;
      while (st < s.steps) {
        const through = st / s.steps;
        out.push({ bar, step: st, lane: "snare", vel: 0.45 + 0.5 * through });
        st += gap;
        if (through > 0.45 && gap > 1) gap = Math.max(1, Math.floor(gap / 2));
      }
      return out;
    },
  },

  /**
   * NOTIFY — row 5, THE ANTI-FILL, and the one an algorithm never reaches for.
   * The last beat of the bar before the seam is EMPTIED instead of filled:
   * "the gap before the downbeat does the same job as the flurry". It is the
   * cheapest block here and the only one that announces a boundary by not
   * playing, which is why it is worth having beside the roll rather than
   * instead of it.
   */
  empty: {
    fits: (s) => s.heard >= 1 && s.seam,
    leads: true,
    onHits: (hits, bar, s) => stopFrom(hits, bar, lastBeats(1, s)),
    onNotes: (notes, bar, s) => silenceFrom(notes, bar, lastBeats(1, s), s.steps),
  },

  /**
   * SUBTRACT — row 15, THE CUT. Everything stops on a beat and the bar
   * finishes empty. It needs SILENCE TO BE AUDIBLE IN, so it is the one block
   * that belongs in the MIDDLE of a section — a stop at a seam is just an
   * early ending — and it needs the record dense enough that its absence
   * registers.
   *
   * This was called `stop` and did the same thing to a kit and nothing else.
   * The name is the catalogue's now, and so is the reach.
   */
  cut: {
    fits: (s) => s.heard >= 2 && !s.seam && s.energy >= 0.5,
    leads: false,
    onHits: (hits, bar, s) => stopFrom(hits, bar, Math.floor(s.steps / 2)),
    onNotes: (notes, bar, s) => silenceFrom(notes, bar, Math.floor(s.steps / 2), s.steps),
  },

  /**
   * ── THE VARY LAYER IS MID-SECTION, AND THAT IS ITS DEFINITION ───────────
   *
   * The three below are the only blocks here that say NOTHING structural, and
   * that is what they are for:
   *
   *   "The function of a VARIATION drum fill is to spice up a section, for
   *   example halfway through a 16-bar verse." — hackmusictheory.com
   *
   * Halfway through, not at the end. A variation that lands on a seam is read
   * as a notification, because that is what the position means — "fills occur
   * during breaks between melodic phrases and SIGNAL THE END OF A PHRASE"
   * (en.wikipedia.org/wiki/Fill_(music)) — so the same gesture in the same bar
   * of the same figure is a different device depending only on where it is.
   *
   * `!seam` is therefore a refusal and not a preference, and it is the one
   * that keeps the six layers from collapsing into each other. MEASURED, with
   * all nine fitting everywhere: `tomroll` fell from 12 firings in 60 dungeon
   * synth records to 4, and `snarebuild` from 6 to 3, because at a seam the
   * roll was one draw in nine instead of one in three. A notification layer
   * that fires four times in sixty records is a dead knob with extra steps.
   */

  /**
   * VARY — row 12. ONE HIT OF THE FIGURE IS LEANT ON that was not before, and
   * it goes where the metre already leans, because "an accent needs something
   * to be accented against" (`manner.ts`, which keeps the same law for the
   * manners a genre draws).
   *
   * IT MOVES THE WEIGHT AND NOT THE MANNER. Writing `art: "accent"` here would
   * hand a seat a manner its genre never gave it — `resolve.ts` checks those
   * pools against what the instrument can play — so the block leans on the
   * note by the published factor an accent leans by, which is the one this
   * program already keeps in `ART.accent`.
   *
   * AND IT LEANS ON A STROKE, NOT A NOTE. "One HIT of the figure" is a whole
   * strike, and on a keyboard a strike is a chord: `perform.test.ts` holds a
   * chord to being ONE stroke — every note of it at one weight — and an accent
   * that picked a single note of a four-note voicing broke that on lofi seed 2
   * at bar 44. A hand leaning into a chord leans into all of it.
   */
  accent: {
    fits: (s) => s.heard >= 1 && !s.seam,
    leads: false,
    onHits: (hits, bar, s, rng) => {
      const on = hits.filter((h) => h.bar === bar && onBeat(h.step, s) && h.vel < 1);
      if (on.length === 0) return null;
      const step = rng.pick("hit", on).step;
      return hits.map((h) =>
        h.bar === bar && h.step === step ? { ...h, vel: Math.min(1, h.vel * ART.accent.weigh) } : h);
    },
    onNotes: (notes, bar, s, rng) => {
      const on = notes.filter((n) => n.bar === bar && onBeat(n.step, s) && n.vel < 1);
      if (on.length === 0) return null;
      const step = rng.pick("note", on).step;
      return notes.map((n) =>
        n.bar === bar && n.step === step ? { ...n, vel: Math.min(1, n.vel * ART.accent.weigh) } : n);
    },
  },

  /**
   * VARY — row 13. ONE HIT OF THE FIGURE IS MISSING this pass.
   *
   * NOT THE DOWNBEAT, which is a different and much larger gesture: a bar
   * whose first beat is gone has lost its floor, and that is the cut or the
   * empty bar rather than a variation. And never the last thing in the bar,
   * because a bar reduced to nothing is a part dropping out, which is the
   * arrangement's to say and not this file's.
   *
   * A STROKE, for the same reason the accent is one: a hit that is missing
   * from a chord is a revoicing, and a revoicing is a treatment with a name of
   * its own. What is missing here is the strike.
   */
  drop: {
    fits: (s) => s.heard >= 1 && !s.seam,
    leads: false,
    onHits: (hits, bar, _s, rng) => {
      const here = hits.filter((h) => h.bar === bar);
      const loose = here.filter((h) => h.step > 0);
      if (here.length < 2 || loose.length === 0) return null;
      const step = rng.pick("hit", loose).step;
      const out = hits.filter((h) => !(h.bar === bar && h.step === step));
      return out.length === hits.length ? null : out;
    },
    onNotes: (notes, bar, _s, rng) => {
      const here = notes.filter((n) => n.bar === bar);
      const loose = here.filter((n) => n.step > 0);
      const strokes = new Set(here.map((n) => n.step));
      if (strokes.size < 2 || loose.length === 0) return null;
      const step = rng.pick("note", loose).step;
      const out = notes.filter((n) => !(n.bar === bar && n.step === step));
      return out.length === notes.length ? null : out;
    },
  },

  /**
   * VARY — row 14. A GRACE NOTE APPEARS BEFORE A FIGURE'S STRONG NOTE.
   *
   * This is the gap `THE-BLOCKS.md` §3 calls out: rows 12 to 14 are the doom
   * and sludge vocabulary — "cyclical, mantra-like repetition with subtle
   * variation (rests, pickup notes, accents)" (riffhard.com) — and the program
   * had none of them, because `vary.ts`'s operations can thin a line, stretch
   * it, turn it over or move it, and not one of them can ADD a note.
   *
   * It is the only block here that invents a pitch, and it invents it off the
   * ladder the caller handed it: the scale step below the note it leads into,
   * or the one above where the target is the bottom of the seat's register.
   *
   * ITS WEIGHT IS THE TARGET'S. A pickup is not a ghost note and nothing
   * published gives it a number; it lands off the beat, and the metre's own
   * hierarchy in `perform.ts` already plays an off-beat note lighter than the
   * one it leads to. Inventing a second number for that would be two rules
   * doing one job.
   */
  pickup: {
    fits: (s) => s.heard >= 1 && !s.seam && s.rungs.length > 1,
    leads: false,
    onNotes: (notes, bar, s, rng) => {
      const here = notes.filter((n) => n.bar === bar);
      const taken = new Set(here.map((n) => n.step));
      const into = here.filter((n) => onBeat(n.step, s) && n.step > 0 && !taken.has(n.step - 1));
      if (into.length === 0) return null;
      const it = rng.pick("note", into);
      const rung = s.rungs.indexOf(it.pitch);
      if (rung < 0) return null;
      const pitch = s.rungs[rung - 1] ?? s.rungs[rung + 1];
      if (pitch === undefined) return null;
      return [...notes, { bar, step: it.step - 1, dur: 1, pitch, vel: it.vel }];
    },
  },

  /**
   * LURCH — row 21. THE SAME BAR AGAIN AT HALF THE SPACING, which is a part
   * playing double time under an arrangement that has not moved. It belongs
   * where a record is already at its top.
   */
  double: {
    fits: (s) => s.heard >= 1 && s.energy >= 0.7,
    leads: false,
    onHits: (hits, bar, s) => {
      // EVERY HIT KEEPS ITS LANE AND ITS WEIGHT — this is a rhythm block, not
      // a loudness one — and the copies land between the originals rather
      // than on them.
      const here = hits.filter((h) => h.bar === bar);
      if (here.length === 0) return null;
      const out: Hit[] = [...hits];
      for (const h of here) {
        const st = h.step + Math.max(1, Math.floor(s.beat / 2));
        if (st >= s.steps) continue;
        if (here.some((o) => o.step === st)) continue;
        out.push({ ...h, step: st, vel: h.vel * 0.8 });
      }
      return movedHits(hits, out) ? out : null;
    },
    onNotes: (notes, bar, s) => {
      // A LINE DOUBLES BY BEING SAID TWICE, not by being decorated: the bar's
      // notes are squeezed into its first half and the half is played again.
      // That is what "the figure at half the spacing" means for something with
      // pitches in it, and it keeps the bar's shape where inserting copies
      // between the notes would invent a different figure.
      const here = notes.filter((n) => n.bar === bar);
      if (here.length < 2) return null;
      const half = Math.floor(s.steps / 2);
      const out: Note[] = notes.filter((n) => n.bar !== bar);
      const seen = new Set<string>();
      for (const off of [0, half]) {
        for (const n of here) {
          const step = off + Math.floor(n.step / 2);
          const key = `${step}:${n.pitch}`;
          if (seen.has(key)) continue;
          seen.add(key);
          out.push({ ...n, step, dur: Math.max(1, Math.floor(n.dur / 2)) });
        }
      }
      return movedNotes(notes, out) ? out : null;
    },
  },

  /**
   * LURCH — row 22, HALF TIME, and the missing partner of the one above.
   *
   *   "Use half-time feels to thicken grooves … drums that lurch between
   *   trudging slow-motion grooves and ragged mid-tempo blasts."
   *   — riffhard.com, how to play sludge metal
   *
   * The figure at TWICE the spacing: a step at s is played at 2s, and what
   * would fall past the bar is not played. The bar keeps its shape and takes
   * twice as long to say half of it, which is the whole of what half time
   * sounds like.
   *
   * THE ARRANGEMENT ALREADY HAS A HALF-TIME MOVE and this is not it. That one
   * is a SPAN of the kit at half speed, stated in the running order and drawn
   * with the rest of the arrangement's moves; this is ONE BAR of ONE SEAT,
   * fired from a pool nobody schedules. The arrangement's is a decision about
   * the record and this is a thing that happens in it — the same distinction
   * `treat.ts` and the desk keep, at a different grain.
   */
  half: {
    fits: (s) => s.heard >= 1,
    leads: false,
    onHits: (hits, bar, s) => {
      const here = hits.filter((h) => h.bar === bar);
      if (here.length < 2) return null;
      const out: Hit[] = hits.filter((h) => h.bar !== bar);
      let kept = 0;
      for (const h of here) {
        if (h.step * 2 >= s.steps) continue;
        out.push({ ...h, step: h.step * 2 });
        kept++;
      }
      // A BAR STRETCHED INTO NOTHING is a part dropping out, which is the
      // arrangement's to say. Half of a figure that lives entirely in the back
      // half of the bar is silence, and silence is not this gesture.
      return kept === 0 || !movedHits(hits, out) ? null : out;
    },
    onNotes: (notes, bar, s) => {
      const here = notes.filter((n) => n.bar === bar);
      if (here.length < 2) return null;
      const out: Note[] = notes.filter((n) => n.bar !== bar);
      let kept = 0;
      for (const n of here) {
        if (n.step * 2 >= s.steps) continue;
        // A STRETCHED NOTE STOPS AT THE END OF THE MATERIAL. Everything here
        // is laid down over `bars` and wrapped round by whoever reads it, so a
        // note left running past the end comes back at the top over its own
        // first bar — which is a collision this block would have invented.
        const room = (s.bars - n.bar) * s.steps - n.step * 2;
        out.push({ ...n, step: n.step * 2, dur: Math.max(1, Math.min(n.dur * 2, room)) });
        kept++;
      }
      // as above: a bar stretched into nothing is a part dropping out
      return kept === 0 || !movedNotes(notes, out) ? null : out;
    },
  },
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
 * expecting the next one, and nothing published gives it. `tools/blocks.ts`
 * is how a record is asked what this number actually did to it.
 */
const REACHES = 0.28;

/** Which lanes a cycle actually strikes — what a block may reach for. */
export function lanesOf(hits: readonly Hit[]): ReadonlySet<DrumLane> {
  const out = new Set<DrumLane>();
  for (const h of hits) out.add(h.lane);
  return out;
}

/** Nothing to reach for: no lanes, no ladder. Shared so callers say it once. */
export const NO_LANES: ReadonlySet<DrumLane> = new Set();

/**
 * Which block, if any, this cycle may be offered — the socket, the rate, and
 * the draw, with nothing played yet.
 *
 * Separate from playing it so that the two callers can share one answer:
 * whether a block fires is a fact about WHERE the cycle is, and how it is
 * played depends on whether the cycle is hits or notes.
 */
function reach(s: Socket, allowed: readonly BlockName[], rng: Rng, kind: "onHits" | "onNotes"): BlockName | null {
  const fits = allowed.filter((b) => POOL[b][kind] !== undefined && POOL[b].fits(s));
  if (fits.length === 0) return null;
  if (!rng.chance("reach", REACHES)) return null;
  return rng.pick("block", fits);
}

/**
 * WHICH BAR IS THE BLOCK'S OWN BUSINESS, not the caller's. A roll and a build
 * lead OUT of the cycle, so they take its last bar; everything else happens
 * inside one and takes a bar drawn from the rest.
 */
const barFor = (which: BlockName, s: Socket, rng: Rng): number =>
  POOL[which].leads ? s.bars - 1 : rng.int("bar", 0, Math.max(0, s.bars - 2));

/**
 * One cycle's hits, with a block in them or exactly as they came.
 *
 * Returns `null` for the name when nothing fired, so a caller can record which
 * happened — a record's blocks are worth reading in a dump, and one that never
 * fires has to be visible as never firing.
 */
export function withBlock(
  hits: readonly Hit[],
  socket: Socket,
  allowed: readonly BlockName[],
  rng: Rng,
): { readonly hits: readonly Hit[]; readonly block: Fired | null } {
  if (hits.length === 0) return { hits, block: null };
  const which = reach(socket, allowed, rng, "onHits");
  if (which === null) return { hits, block: null };
  const bar = barFor(which, socket, rng);
  const got = POOL[which].onHits!(hits, bar, socket, rng.at(which));
  return got === null ? { hits, block: null } : { hits: got, block: { name: which, bar } };
}

/**
 * The same for a pitched line, and the caller judges the result.
 *
 * `lawful` is the seat's own laws — its register, and whatever the parts
 * written before it are already holding — handed in rather than rebuilt here
 * for the reason the header gives: a pool of interruptions with its own copy
 * of the laws is a second mechanism beside the first, and the bill comes
 * later. A block whose line the laws refuse did not fire.
 */
export function withBlockOnLine(
  notes: readonly Note[],
  socket: Socket,
  allowed: readonly BlockName[],
  rng: Rng,
  lawful: (line: readonly Note[]) => boolean,
): { readonly notes: readonly Note[]; readonly block: Fired | null } {
  if (notes.length === 0) return { notes, block: null };
  const which = reach(socket, allowed, rng, "onNotes");
  if (which === null) return { notes, block: null };
  const bar = barFor(which, socket, rng);
  const got = POOL[which].onNotes!(notes, bar, socket, rng.at(which));
  if (got === null || !lawful(got)) return { notes, block: null };
  return { notes: got, block: { name: which, bar } };
}
