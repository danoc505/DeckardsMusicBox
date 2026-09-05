/**
 * Stage 3 — THE ARRANGEMENT.
 *
 * Which material each section plays and which parts are heard in it. Nothing
 * but selection, decided before a note exists: the materials are built
 * afterwards, for exactly the hearings decided here.
 *
 * PARTS ARE NEVER LISTED PER SECTION. Every part the material has is heard
 * unless a rule takes it away, and the rules are few and named. A part cannot
 * be silent by omission — the way a whole voice went unheard on every seed of
 * the old program was a section table that forgot to name it, and there is
 * no table here to forget.
 *
 * PARTS ARRIVE, AND THEN THEY COME AND GO. A record opens with the first few
 * parts of the genre's entry order and each section lets the next one in, so
 * the second verse is not the first verse again: something has been added.
 *
 * BUT ARRIVING IS NOT STAYING. It used to be: once a section was big enough
 * to want everyone, everyone played to the end of the record, and every part
 * of every record after its first chorus was a solid block. That is not what
 * an arrangement is. "Five elements at one time — counting the drums as one
 * — is generally the most you'll hear (sometimes six)", and the way a record
 * moves is by "dropping out an instrument at a time" and "losing instruments
 * in stages and then building them up again to a big finish"
 * (soundonsound.com/techniques/arranging-pop). This program has exactly five
 * parts, so everyone playing IS the documented maximum, and a maximum heard
 * for two thirds of a record is not a maximum.
 *
 * So HOW MANY parts sound in a section is the section's own energy, which the
 * form has already worked out, and WHICH ones is the entry order backwards:
 * the last to arrive is the first to go, so what a quiet section keeps is its
 * foundation and what it loses is its decoration. The peak has everyone,
 * because that is what a peak is. Nothing here is drawn — a texture that
 * moves at random is not an arrangement either.
 *
 * A part is worth more where it is missing, and this program does not yet go
 * nearly as far as that idea allows: nothing here enters for the first time
 * halfway through a record, or plays once and is never heard again.
 *
 * A bridge or a quiet section also thins the drums: a breath, not a stop.
 *
 * AND IT CHANGES EVERY TWO TURNS OF THE LOOP, not once a section.
 *
 * THE TWO LOOP RULE: "the arrangement has to change every two loops of the
 * chords, because our ears naturally expect songs to change every two loops
 * of the main instruments", and "the only way to change an arrangement is to
 * add an instrument, or add expression to an existing instrument, or remove
 * an instrument, or reduce expression of an existing instrument". It is the
 * same rule the form already keeps between sections under another name —
 * "when an idea is repeated a third time our brains may begin to tune it
 * out" — counted in turns of the loop instead of in hearings of a section.
 * Two the same, then something moves. (musictech.com, "Could the Two Loop
 * Rule help electronic music producers in a rut"; musicradar.com,
 * "two-loop-rule-arrangement-cheatcode".)
 *
 * One set per section was four to eight identical turns between changes,
 * where the rule allows two. So a section now carries a set per SPAN of two
 * turns, and at each boundary the pool offers all four of the rule's ways —
 * a part in, a part out, expression up, expression down — and the desk moved
 * besides, and the score picks one. This comment used to say "one of the two
 * things the rule names ... never both, and never everyone at once"; the pool
 * had long since offered all four, and the second half was a rule the source
 * does not state. What the source's own example does is add hats, a clap, a
 * bass and a counter-melody at ONE boundary, and what measuring the old rule
 * found was a bass stating one figure for thirty-two bars while the record
 * changed eight times around it. So one move is chosen, and then every part
 * the rule of three says is owed is paid on top of it — see the span loop.
 * A change is still heard against something holding still: a part is paid
 * only when it has itself gone two turns unchanged, which is the rule.
 *
 * A different part each time, so the whole band is in the rotation and no
 * one part is always the one that goes. And the peak never loses a part —
 * "the peak has everyone, because that is what a peak is" — so at a peak the
 * change is expression only: a breath, not a hole.
 */

import type { ArrangementRules, Idea, IntroKind, Manner, Role, Treatment } from "../genre/spec.ts";
import { ROLES } from "../genre/spec.ts";
import { deskOf, isPerPart, needsDrums, reachesPart } from "./treat.ts";
import type { Chart } from "./chart.ts";
import type { Form, Section } from "./form.ts";
// A pure function of the chart, not a read of built materials — see its own
// docstring. The arrangement cannot count its spans without the turn length.
import { periodOf } from "./material/harmony.ts";

/** Nobody held back — the empty set, shared, because it is compared by content. */
const NONE: ReadonlySet<Role> = new Set();
/** Two sets of parts, the same parts. */
const same = (a: ReadonlySet<Role>, b: ReadonlySet<Role>): boolean => a.size === b.size && [...a].every((r) => b.has(r));

/** Who plays across one span of two turns of the loop, and how hard. */
export interface Span {
  readonly heard: ReadonlySet<Role>;
  /** The drums lose their hat and their fills: a breath, not a stop. */
  readonly thin: boolean;
  /**
   * THE KIT AT HALF SPEED — the half-time feel, §3 move 16.
   *
   * "The drums halve, everything else holds." A hit at step s is played at
   * step 2s and one that would fall past the bar is not played at all, so the
   * kit keeps its shape and takes twice as long to say it: the backbeat walks
   * from the second beat to the third, which is the whole of what half time
   * sounds like.
   *
   * IT IS THE DRUMS AND ONLY THE DRUMS, which is what makes it legal on a
   * span. `perform.test.ts` holds a figure played again to being played the
   * same way — Huron and Ollen's 94% — on `step` among other things, and 76%
   * of lofi's repetition pairs straddle a span boundary. The drums are
   * excluded from that comparison by name, because their phrase is written per
   * time round and does not tile. Everything else in §3 moves a step the law
   * does compare, and has to wait for a section.
   *
   * AND IT DROPS HITS, which §3's own header does not admit: the layer is
   * introduced as "every note kept, in order", and move 16 says the drums
   * halve. Halving is not keeping. The header is describing the rest of the
   * layer.
   */
  readonly halved: boolean;
  /**
   * ONE PART HELD BACK — EXPRESSION, ON ANY PART RATHER THAN ON THE DRUMS.
   *
   * The two-loop rule names four ways to change an arrangement and this file's
   * header quotes all four: "add an instrument, or add expression to an
   * existing instrument, or remove an instrument, or reduce expression of an
   * existing instrument". This stage could do three of them, and read
   * "expression" as the drums' hat — `thin` — so the keys could be taken away
   * but never played more quietly.
   *
   * §4 of THE-ALTERATIONS.md calls it a dynamic terrace, "the part a step
   * quieter, or louder, for this hearing", and the step is a number this file
   * already carries: `ARC_DEPTH`, what the arc takes off at its quietest.
   *
   * IT IS A GAIN AND NOTHING ELSE, which is what makes it legal per SPAN. The
   * hand is addressed by the material and the position in it so that a figure
   * played again is played the same way — Huron and Ollen's 94% — and
   * `perform.test.ts` holds the groove to that on `step`, `pitch`, `art` and
   * `playedStep` to the microsecond. Gain is not in that comparison and never
   * was: the arc already moves it bar by bar under the same law. So a part may
   * be held back for two turns without any figure being played differently.
   * A move that changed a part's ARTICULATION or its timing could not be here;
   * it would have to wait for a section boundary.
   */
  readonly hush: ReadonlySet<Role>;
  /**
   * A CHANGE TO THE SECTION THAT LEAVES EVERY NOTE WHERE IT IS.
   *
   * The two-loop rule names four ways to change an arrangement — an instrument
   * in, an instrument out, expression up, expression down — and this stage
   * could do the first three and read "expression" as the drums' hat alone. So
   * a section could be made emptier or fuller and nothing else, and a record
   * that wanted to develop without losing anybody had no move to make.
   *
   * This is the fourth way, properly populated: darker, wetter, wider, further
   * off, harder through the board. What each name does to a desk is
   * `stage/treat.ts`; that it happens at a SPAN and not once a record is what
   * makes it an arrangement move rather than a genre setting.
   *
   * null is the genre's own desk, which is where every span used to be.
   */
  readonly treatment: Treatment | null;
  /**
   * WHICH PART THE TREATMENT IS AIMED AT, or null for a whole-desk move.
   *
   * The catalogue lists distance, sends and the pedal feed as one part's
   * moves — "a part steps closer, or further off" — and this stage applied
   * them to the whole band. A band stepping back together is a different
   * move from the flute stepping back, and only the second is in the
   * catalogue. `treat.ts` says which treatments are per-part.
   */
  readonly at: Role | null;
}

export interface Placed {
  readonly section: Section;
  /** The key of the material this section plays. */
  readonly material: string;
  /**
   * Every part heard ANYWHERE in this section — the union of the spans below.
   * What the materials are built for, and what "a part cannot be silent by
   * omission" is judged against: a part that plays for one span of a section
   * is heard in it.
   */
  readonly heard: ReadonlySet<Role>;
  /** The drums lose their hat and their fills: a breath, not a stop. */
  readonly thin: boolean;
  /** The break: below the floor, carrying what the record opened with. */
  readonly broken: boolean;
  /**
   * THIS SECTION BUILDS INTO WHAT FOLLOWS — the arc's rising action.
   *
   * "Exposition, rising action, climax, falling action, dénouement" (Ableton,
   * "Dramatic Arc"), and THE-ARRANGEMENT-AS-STORY §3 works through which of
   * them this program has. It had the climax: the form declares a peak and the
   * peak is the one section with everybody. It has the dénouement now, since
   * the ending gives back what the record opened with. RISING ACTION was the
   * stage nothing represented — the arc interpolates between section centres,
   * so a section approaching the peak was a flat step on the way up rather
   * than a section that goes anywhere.
   *
   * §4 of THE-ALTERATIONS.md names the same thing from the other end, as move
   * 25: a crescendo "across the section rather than a flat level".
   *
   * It is a GAIN and nothing else, which is why it may sit on a section that
   * loops without any figure being played differently — see `Span.hush`.
   */
  readonly swell: boolean;
  /**
   * HOW THIS RESTATEMENT IS PLAYED, or null for the hand the material wrote.
   *
   * The rule of three demands a third hearing differ, and this stage had two
   * answers: new notes (`vary`, which spends material) and a new desk
   * (`recast`). A plain restatement — an idea stated again with neither — came
   * back identical in everything but who was playing. This is the third
   * answer, and the one §4 of THE-ALTERATIONS.md is about: the same notes, the
   * same desk, a different hand.
   *
   * A SECTION'S, never a span's, and that is not a preference. `art` is one of
   * the six fields the repetition law compares, and 76% of lofi's repetition
   * pairs straddle a span boundary; a section boundary is the coarsest grain
   * those pairs never cross.
   */
  readonly manner: Manner | null;
  /**
   * Who plays, span by span, each span being two turns of the loop. The
   * stage that writes the notes knows how long a turn is and indexes this;
   * the last span runs to the end of the section.
   */
  readonly spans: readonly Span[];
}

export interface Arrangement {
  readonly placed: readonly Placed[];
  /**
   * EVERY TIME GIVING PAID OFF WITHHOLDING, and by how much. The largest
   * entry is where this record's arc actually crested.
   *
   * Written by the bookkeeping and read by NOTHING that makes a choice — a
   * move that consulted it would be aiming at the peak, and the peak has to
   * be an observation or the arc is imposed. It is here to be printed and to
   * be measured against the peak the FORM declares, which is computed from
   * entirely different inputs: the form's from the genre's opinion about
   * what a chorus is, this one from a running integral of what was actually
   * played. Whether they land together, with no line of code relating them,
   * is the whole of the emergence claim.
   */
  readonly release: readonly { readonly section: number; readonly span: number; readonly discharged: number }[];
  /** Boundaries where every move refused. The dead end, counted rather than hidden. */
  readonly stuck: number;
  /**
   * Boundaries at which a part the rule of three said was owed could not be
   * paid: nothing in the pool composed with the move already chosen. The
   * number that says whether the cheap moves have run out, which is the
   * condition `THE-STALENESS-CLOCK.md` sets on building partial variation.
   */
  readonly unpaid: number;
}

/** The key of the material an idea's nth variant is: "A", then "A/1", "A/2". */
export const materialKey = (idea: Idea, variant: number): string => (variant === 0 ? idea : `${idea}/${variant}`);

/**
 * WHAT THE RECORD OPENS WITH, by the kind of intro the genre drew.
 *
 * An intro is the record's own material with something withheld, and which
 * thing is withheld is what kind of intro it is — see INTRO_KINDS in the spec
 * for the sources. The one rule that is not a matter of degree is the rhythm
 * intro's: it is the drums, or the drums and the bass, and NOTHING else,
 * because it works "because there is little or no melody or harmony to attend
 * to" (Burns 1987). Adding the keys to it does not make a bigger rhythm
 * intro, it makes it not one.
 */
function opensWith(kind: IntroKind, A: ArrangementRules): Set<Role> {
  const first = A.enter.slice(0, Math.max(1, A.introParts));
  switch (kind) {
    case "rhythm": {
      // the drums, and the bass with them if the genre brings the bass in
      // early — "solo drums, solo bass, or drums and bass in duet"
      const out = new Set<Role>(["drums"]);
      if (A.introParts >= 2 && A.enter.indexOf("bass") <= 2) out.add("bass");
      return out;
    }
    case "hook": {
      // the tune from bar one, over whatever foundation the intro carries
      const out = new Set<Role>(first);
      out.add("lead");
      return out;
    }
    case "bed": {
      // the foundation without the tune: what the intro withholds is what
      // arrives when it ends
      const out = new Set<Role>(first);
      if (out.size > 1) out.delete("lead");
      return out;
    }
  }
}

/**
 * WHERE THE BREAK GOES, decided with the whole form in view.
 *
 * A breakdown is made by "stripping away of other instruments and vocals" and
 * breakdowns "usually precede or follow heightened musical climaxes"; it sits
 * where a bridge would, "after the second chorus"
 * (en.wikipedia.org/wiki/Breakdown_(music)). So it is the LAST quiet section
 * before the record's biggest moment — the last breath before the peak.
 *
 * Chosen here rather than inside the walk because which section is the last
 * quiet one before the peak is a fact about the whole form, and the form is
 * already finished when this runs. It is a decision made with full knowledge,
 * not a pass that repairs a choice already made.
 */
function breakAt(form: Form, thinBelow: number): number {
  // never the opening (a record cannot break away from something it has not
  // played yet) and never the outro (a break is a contrast, and the end of a
  // record is not something the record comes back from)
  const quiet = form.sections.filter(
    (s) => s.index > 0 && s.index < form.sections.length - 1 && (s.fn === "bridge" || s.energy < thinBelow),
  );
  const before = quiet.filter((s) => s.index < form.peakAt);
  // the last breath before the climax, or — "breakdowns usually precede OR
  // FOLLOW heightened musical climaxes" — the first one after it
  if (before.length > 0) return before[before.length - 1]!.index;
  const after = quiet.filter((s) => s.index > form.peakAt);
  return after.length > 0 ? after[0]!.index : -1;
}

/**
* WHAT THE RECORD HAS ACTUALLY DONE SO FAR. Every field is a tally of what
 * was PLACED — nothing here is a plan, a target, or a curve. It is carried
 * from section to section, which is the whole of "sections informed of each
 * other": a section decides what to do by reading what the record has been.
 */
interface Ledger {
  /** The fullest any span has been. Rises ONLY by being reached. */
  ceiling: number;
  /** Part-turns spent under that ceiling, less what giving has paid back. */
  owed: number;
  /** The span before this one, so a rise is visible. */
  last: number;
  /** Turns since a part changed state: positive while sounding, negative while resting. */
  standing: Map<Role, number>;
  /** "move:role" to times made, ACROSS THE RECORD — the rule of three, applied to the arrangement's own vocabulary. */
  used: Map<string, number>;
  /**
   * Every discharge, with how much it paid off. The largest is the record's
   * peak. WRITTEN AND NEVER READ BY A CHOICE — a move that read this would be
   * aiming at it, and then the arc would be imposed rather than observed.
   */
  release: { section: number; span: number; discharged: number }[];
  /** Boundaries where every move refused. The dead end, counted rather than hidden. */
  stuck: number;
  unpaid: number;
}

/** One candidate: what the span would become, and which part it moves. */
interface Move {
  readonly name: string;
  readonly heard: Set<Role>;
  readonly thin: boolean;
  readonly role: Role;
  /** The desk this move puts the span on, or null for the genre's own. */
  readonly treatment: Treatment | null;
  /** Which part a per-part treatment is aimed at; null for a whole-desk one. */
  readonly at: Role | null;
  /** The part this move leaves held back, if any. */
  readonly hush: ReadonlySet<Role>;
  /** Whether this move leaves the kit at half speed. */
  readonly halved: boolean;
  /**
   * HOW READILY THE GENRE PARTS WITH THIS ONE, 0..1, from its shed order.
   *
   * The pool offers every part and lets the score decide, and left to itself
   * the score picks whatever has been present longest — which is the
   * FOUNDATION. Dungeon synth enters on its drone and the drone is therefore
   * the highest-standing part in the record, so it was the likeliest thing to
   * be taken away: dropped at 48 span boundaries in sixty records, and a
   * drone that stops is not a quieter arrangement, it is the floor going out.
   *
   * "The genre says which part it can most afford" is already written in this
   * file's header, and the shed order is where it says it. This is that
   * sentence made arithmetic, so a genre founded on a part keeps it.
   */
  readonly afford: number;
}

export function makeArrangement(chart: Chart, form: Form): Arrangement {
  const A = chart.genre.arrangement;
  const lastIn = A.enter[A.enter.length - 1]!;
  // WHICH WAY IN, drawn once for the record. A cold open has no intro section
  // and still has an opening: whatever plays in bar one is what the record
  // opened with, and the rules below are about that.
  const kind = chart.rng.at("arrange").weighted("intro", A.intro);
  const breaks = A.breakdown ? breakAt(form, A.thinBelow) : -1;

  /**
   * WHICH TREATMENTS THIS RECORD MAY USE, decided once and never again.
   *
   * Two filters, and neither answer can change inside a record. The genre's
   * own pool says which of them belong to this music at all — a weight of zero
   * removes one — and `deskOf` refuses the rest on two counts: a move whose
   * numbers come out identical to this genre's desk, so a dry genre is never
   * offered `drench` and a board nothing walks is never offered `push`, and a
   * move whose numbers travel a path this genre never patches in, so dungeon
   * synth is never offered `echoed` however far its returns move. What is left
   * is this genre's own vocabulary, and the arrangement scores it like
   * everything else.
   *
   * A move that does nothing is worse here than anywhere else in the program:
   * the two-loop rule spends a boundary on it, and the ear hears the section
   * repeat unaltered at exactly the moment it was promised a change.
   */
  const offered = A.treat
    .filter(([, w]) => w > 0)
    .map(([t]) => t)
    .filter((t) => deskOf(t, chart.genre.sound) !== null);
  /** How readily the genre reaches for one, 0..1, from its own weights. */
  const heaviest = Math.max(1e-9, ...A.treat.map(([, w]) => w));
  const weightOf = (t: Treatment): number =>
    (A.treat.find(([name]) => name === t)?.[1] ?? 0) / heaviest;
  /**
   * WHAT WEARS OUT, for the rule of three over this stage's own vocabulary.
   * A treatment wears out by NAME across the record — the desk going dark for
   * the third time is the third time however many parts were playing — where a
   * density move wears out per part, because taking the lead away and taking
   * the bass away are two different moves.
   *
   * AND THE NAME IS THE KEY EVEN NOW A TREATMENT NAMES A PART. Keying it
   * `treat:drench:drone` was tried and it broke this law from underneath:
   * with six candidates per per-part treatment and a key each, `drench` could
   * be chosen six times before any of its keys staled, while a whole-desk
   * move like `brighten` staled after one. Measured over 300 seeds, that took
   * dungeon synth from twelve distinct treatments to FIVE and gave `drench`
   * 896 of 1557 uses. The desk getting wetter is the desk getting wetter
   * whichever part it happened to, which is what this comment already said.
   */
  const keyOf = (mv: Move): string =>
    mv.treatment !== null ? `treat:${mv.treatment}` : `${mv.name}:${mv.role}`;

  /**
   * HOW FULL A SPAN IS, the one measured quantity: what fraction of the band
   * is sounding, less a half part where the drums are held back. A function
   * of the arrangement's own choices and nothing else.
   */
  const fullness = (h: ReadonlySet<Role>, isThin: boolean, hushed: ReadonlySet<Role> = NONE, isHalved = false): number => {
    let held = 0;
    // the drums' expression, held back once however many ways it is held: a kit
    // with no hat AND at half speed is still a kit playing quietly, and
    // charging twice would price it below a kit that is not there at all
    if ((isThin || isHalved) && h.has("drums")) held += 0.5;
    // a hushed part is half a part, the same price the drums' hat already
    // pays; the drums thinned AND hushed are not charged for twice
    for (const r of hushed) if (h.has(r) && !(r === "drums" && isThin)) held += 0.5;
    return (h.size - held) / ROLES.length;
  };

  const ledger: Ledger = {
    ceiling: 0, owed: 0, last: 0,
    standing: new Map(ROLES.map((r) => [r, 0])),
    used: new Map(), release: [], stuck: 0, unpaid: 0,
  };

  /**
   * AN IDEA STAYS WHERE IT HAS GOT TO.
   *
   * A statement the form marks `vary` plays the idea's next variant, and
   * every statement after it plays THAT one — not the plain statement again.
   * Going back to the plain one was the arc coming undone at the last moment:
   * a record ran intro A, verse A, verse A/1, outro A, so the rule of three
   * fired, the idea went somewhere different, and then the record ended on a
   * note-for-note repeat of how it began, as though the development had not
   * happened. An idea that has developed has developed.
   */
  const variantsSeen = new Map<Idea, number>();
  const sectionsHeard = new Map<Role, number>();
  /** The last section index each part was heard in; absent means never. */
  const lastHeardAt = new Map<Role, number>();

  /**
   * HOW READILY THE GENRE PARTS WITH A ROLE, 0..1. First in the shed order is
   * the most affordable; last is the foundation. Shared by both decisions
   * below, because it is the same sentence in both: the genre's own voice,
   * carried as a WEIGHT and never as an order.
   */
  const affords = (r: Role): number => {
    const i = A.shed.indexOf(r);
    return i < 0 ? 1 : 1 - i / A.shed.length;
  };
  // how many of the entry order have arrived; the intro's parts are in from the top
  let arrived = A.introParts;
  /** What the record opened with — the first section's parts, whatever it is. */
  let openers = new Set<Role>();
  const placed: Placed[] = form.sections.map((section) => {
    let variant = variantsSeen.get(section.idea) ?? 0;
    if (section.vary) {
      variant += 1;
      variantsSeen.set(section.idea, variant);
    }

    /** The record's last section: where the dénouement has to happen. */
    const closing = section.index === form.sections.length - 1;

    /**
     * THE FLOOR, WHICH AN ENDING DOES NOT HAVE. See the note at `wanted`
     * below: `fewest` is about a section that carries on, and the last one is
     * not. What stops an ending emptying out is the dénouement — `restate`
     * refuses to drop an opener at the close — so the end comes to rest on
     * what the record began with, and that is a fact about the record rather
     * than a number a genre states.
     *
     * AND IT ONLY EVER GOES DOWN. A floor raises a section to itself, so an
     * opening of five parts would floor the ENDING at five and make it the
     * fullest thing in the record — a floor used as a ceiling, which is a
     * different rule wearing this one's clothes. It happens in 2–3% of
     * records, which open cold on everybody. So the close is floored by its
     * openers OR by `fewest`, whichever is LOWER: an ending may come to rest
     * on less than a middle section, never on more.
     */
    const floor = closing ? Math.min(A.fewest, Math.max(1, openers.size)) : A.fewest;

    let heard: Set<Role>;
    if (section.index === breaks && openers.size > 0) {
      // THE BREAK. The one section that goes below the floor, and it carries
      // what the record opened with — at most two parts, because a break with
      // three in it is a quiet verse. [chosen] at two; the source says
      // "stripping away", and does not count.
      heard = new Set(A.enter.filter((r) => openers.has(r)).slice(0, 2));
    } else if (section.fn === "intro") {
      heard = opensWith(kind, A);
      // a part the intro carries has arrived, whatever its place in the entry
      // order: a record that opens on its drums has introduced them
      arrived = Math.max(arrived, ...[...heard].map((r) => A.enter.indexOf(r) + 1));
    } else {
      // WHAT HAS ARRIVED still only grows: a part the record has not yet
      // introduced cannot appear, and each section lets the next one in.
      arrived = section.peak || section.energy >= A.fullAbove ? ROLES.length : Math.min(ROLES.length, arrived + 1);
      // HOW MANY OF THEM PLAY is this section's energy, between the fewest a
      // genre will carry and all of them. The peak takes everyone.
      //
      // AND THE FLOOR DOES NOT APPLY TO AN ENDING, because a floor is about a
      // section that CARRIES ON. `fewest` exists so that a middle section is
      // still an arrangement and not a solo; the last section is not going
      // anywhere, and the one source that describes how one genre here ends
      // asks for exactly what the floor forbids — "gradually reduce the
      // elements until only the initial drone remains, ending quietly"
      // (note.com/soundwitches). Held at three, that happened in 0% of
      // records.
      //
      // THE END IS FLOORED BY WHAT THE RECORD OPENED WITH, WHICH IS NOT A
      // NUMBER. `restate` below already refuses to drop an opener from the
      // close, so an ending cannot empty out however low this goes — it comes
      // to rest on the parts the record began with. That is the dénouement,
      // "a restatement of established musical materials" (Ableton), acting as
      // the floor instead of a stated one. A genre that opens on one part can
      // end on that one part; a genre that opens on three ends on three. No
      // genre states a number for this and none should have to.
      const wanted = section.peak
        ? ROLES.length
        : Math.round(floor + (ROLES.length - floor) * section.energy);
      const playing = Math.min(arrived, Math.max(floor, Math.min(ROLES.length, wanted)));
      // WHO GOES IS WHAT THE RECORD CAN SPARE, and that is a fact about this
      // record rather than a list written before it existed.
      //
      // This used to walk the genre's shed order and delete until the count
      // fit. A list has no memory, so nothing that happened in a record could
      // affect it: the same names went, in the same order, in every section of
      // every seed. Measured, that produced two opposite failures of the one
      // missing idea — lofi's opening part played 91% of the record and was
      // never gone longer than three bars, so nothing ever happened to it,
      // while dungeon synth's was gone for over a third of the record in one
      // seed in four and absent from the end of nearly half of them. And in
      // seven or eight records in ten, in both genres, whatever led the first
      // half still led the second.
      //
      // That last number is the one that matters. A narrative is the listener
      // tracking "the transvaluation of changing hierarchical relationships"
      // (Almén 2008, 41) — a change of RANK. A rank that cannot change as a
      // consequence of anything is not a story, and a lookup table cannot be a
      // consequence of anything.
      //
      // So the part that goes is the one this record can most spare, by two
      // terms multiplied, in the same shape as the span score below — no
      // coefficients, nothing to tune:
      //
      //   afford   what the GENRE can most do without. Unchanged, and still
      //            its own to say; it is now a weight rather than an order.
      //   spare    what the RECORD can most do without: a part that has been
      //            playing all along is furniture and can be missed, and a
      //            part that has been away is owed its return and is not
      //            taken again.
      //
      //            THIS IS NOT AN ABSENCE CEILING, whatever it used to say
      //            here. Measured on and off over 500 seeds a genre, 2500
      //            parts each: the absence distribution does not move AT
      //            ALL — lofi median 8, p90 20, p99 32, max 36; dungeon
      //            synth 16, 40, 56, 88 — identical with the `1/(1+out)`
      //            term, without it, and with `share` dropped instead.
      //            Whatever bounds how long a part stays away, it is not
      //            this, and the claim that a ceiling "falls out of the
      //            arithmetic" was never true.
      //
      //            What the two terms DO move is abandonment, and they pull
      //            against each other, oppositely by genre:
      //
      //              gone for good      both    share only   ceiling only
      //              lofi               2.56%     2.76%         2.92%
      //              dungeon synth      2.64%     3.20%         1.96%
      //
      //            So `share` carries lofi and the ceiling term carries
      //            dungeon synth, and the product is worse than the better
      //            single term in both. Kept as the product because it is
      //            the only one that is not worst in some genre, and
      //            because which is RIGHT is a question about how the
      //            records sound, not about which column is lower.
      //
      // The opening needs no rule of its own. A part that opened the record
      // has been present since bar one and absent from nothing, so it holds
      // the most standing while a record is young and pays for itself later,
      // once being missed is something an ear can do. See
      // docs/genre-research/THE-ARRANGEMENT-AS-STORY.md.
      //
      // AND THE ENDING GIVES BACK WHAT THE RECORD OPENED WITH. A dénouement
      // is "a restatement of established musical materials" (Making Music,
      // Ableton, "Dramatic Arc"), and the two rules above do not produce one:
      // built without this, they made absence possible and then left the
      // opening part out of the last bar of HALF the records, down from three
      // quarters. Letting a part be missed is not the same as bringing it
      // back, so the close says so itself. Nothing else in the record is
      // touched by this: it is one section, and it is the last one.
      heard = new Set(A.enter.slice(0, arrived));
      while (heard.size > playing) {
        let go: Role | null = null;
        let most = -1;
        for (const r of heard) {
          // how much of the record so far this part has been in: all of it is
          // furniture, little of it is still being established
          const share = (sectionsHeard.get(r) ?? 0) / Math.max(1, section.index);
          // and how long it has been away: just played is sparable, long gone
          // is owed
          const out = section.index - (lastHeardAt.get(r) ?? -1) - 1;
          const spare = share / (1 + Math.max(0, out));
          // zero kills it, in the same way the span score's terms do
          const restate = closing && openers.has(r) ? 0 : 1;
          const fit = affords(r) * spare * restate;
          if (fit > most) { most = fit; go = r; }
        }
        if (go === null) break;
        heard.delete(go);
      }
      // AND THE LAST PART IN IS STILL THE FIRST OUT OF AN OUTRO, once the
      // record has earned its absence: a part heard in one section is not yet
      // something an ear can miss.
      if (section.fn === "outro" && heard.size > floor && (sectionsHeard.get(lastIn) ?? 0) >= 2) heard.delete(lastIn);
    }
    if (section.index === 0) openers = new Set(heard);
    for (const r of heard) {
      sectionsHeard.set(r, (sectionsHeard.get(r) ?? 0) + 1);
      lastHeardAt.set(r, section.index);
    }

    // A RHYTHM INTRO IS NOT THINNED. Every other quiet section loses its hat
    // and its fills — a breath, not a stop — but an intro whose whole subject
    // is the drums cannot introduce them with the drums taken apart: it works
    // "because there is little or no melody or harmony to attend to"
    // (Burns 1987), and what is left has to be worth attending to.
    const broken = section.index === breaks && openers.size > 0;
    // THE LAST BREATH BEFORE THE CLIMAX BUILDS INTO IT. One section, the one
    // immediately before the peak — rising action is a run-up and a record has
    // one climax to run up to. Never the break, which is the record going
    // below its floor: a breakdown that swells is not a breakdown.
    const swell = section.index === form.peakAt - 1 && form.peakAt > 0 && !broken;
    // A PLAIN RESTATEMENT IS PLAYED DIFFERENTLY, ON THE THIRD HEARING. The
    // rule of three's own threshold — "when it is repeated a third time, our
    // brains may begin to tune it out" — and not the second, which was tried
    // and handed 42% of all sections a manner. A record whose every
    // restatement is played differently has no passage literally repeated in
    // it at all, and literal repetition is the thing this program is built to
    // protect: Huron and Ollen put it at 94% of passages. The second hearing
    // is the one that makes an idea memorable, so it is left exactly alone.
    //
    // Only where the other two
    // answers are not already being given — a section given new notes or a new
    // desk has had its change, and stacking a third on top is not development,
    // it is three changes at once with nothing held still to hear them
    // against. Drawn from the genre's own pool, addressed by the section, so
    // it is a fact about this record rather than a die.
    const manner: Manner | null =
      section.statement > 2 && !section.vary && !section.recast && A.manner.some(([, w]) => w > 0)
        ? chart.rng.at("arrange", "manner", section.index).weighted("how", A.manner)
        : null;
    // and a break is not "thinned": there is nothing left in it to thin, and
    // the drums it may consist of are the thing being heard
    const thin = !broken && !section.peak && (section.fn === "bridge" || section.energy < A.thinBelow)
      && !(section.fn === "intro" && kind === "rhythm");
    // EVERY TWO TURNS, ONE THING MOVES, and it is the first of the rule's
    // four ways that is actually available here: an instrument out, an
    // instrument in, or the drums' expression down. Never up — a section the
    // form made thin is a breath, and handing the hat back halfway through a
    // bridge is not a change to it, it is the end of it.
    //
    // EXACTLY THE SPANS THAT WILL BE READ. A span is two turns of the loop,
    // and the loop length comes from the chart, so the count is known here
    // and is not a guess. Guessing "enough for the shortest turn a loop can
    // be" built 2216 spans across 60 records of which 783 were ever reached:
    // every section decided changes in spans the performance never indexed,
    // and the record heard none of them.
    const turn = 2 * Math.max(1, periodOf(chart, section.idea));
    const spanCount = Math.max(1, Math.ceil(section.bars / turn));
    const spans: Span[] = [];
    // HOW MANY TURNS EACH PART HAS PLAYED UNCHANGED, in this section. The
    // rule of three's own count, kept per part rather than per record: it is
    // the part that is stated three times, not the band.
    const stale = new Map<Role, number>();
    // and who was left standing still at the last boundary, so it is first in
    // line at this one — "a different part each time, so the whole band is in
    // the rotation"; sorted by staleness alone the ties fell the same way
    // every time and the bass was the one that held still at every boundary
    let stillLast: Role | null = null;
    /**
     * EVERY SPAN IS A SUBSET OF SPAN 0, and that one invariant is what makes
     * the rest safe. Span 0 is always read (index 0 at the section's first
     * bar), so the union of the spans is span 0 exactly — checked over 334
     * sections, 0 differ — which means `heard` below is unchanged, every
     * part heard in a section still has a material, and nothing is silent by
     * omission. Under it a walk DOWN the subset lattice and back UP again is
     * legal: base, less the keys, less the keys and the pad, base again is
     * "losing instruments in stages and then building them up again" — which
     * this file's own header cites and the code could not do, because it
     * always restarted from the base.
     *
     * WHICH MOVE IS MADE IS NOT DRAWN. It is the one that best serves what
     * the record has already done, and a texture that moved at random would
     * not be an arrangement.
     */
    const base = heard;
    /**
     * A RECAST SECTION OPENS ON A DIFFERENT DESK.
     *
     * The form sets `recast` where the rule of three fired on an idea that
     * never comes back: the third hearing still owes a change, and paying for
     * it with new notes would write material nobody hears twice. So the demand
     * arrives here instead, and it is answered where the section STARTS rather
     * than at some span boundary inside it — the whole statement is what was
     * heard too often, so the whole statement is what arrives different.
     *
     * Which one is not drawn. It is the freshest the genre carries, by the
     * same rule of three that sent the demand: the desk going dark for the
     * third time is no more a change than the tune being thinned for the third
     * time. Ties fall to the genre's own order, so this is a function of the
     * record so far and not of a die.
     */
    let opening: Treatment | null = null;
    if (section.recast && offered.length > 0) {
      let bestFit = -1;
      for (const t of offered) {
        const fit = weightOf(t) / (1 + (ledger.used.get(`treat:${t}`) ?? 0));
        if (fit > bestFit) { bestFit = fit; opening = t; }
      }
      if (opening !== null) ledger.used.set(`treat:${opening}`, (ledger.used.get(`treat:${opening}`) ?? 0) + 1);
    }
    /**
     * AND THE NEWEST PART WALKS IN PART WAY THROUGH, not at the door.
     *
     * This file's own header has said since it was written that "nothing here
     * enters for the first time halfway through a record", and it was true:
     * `arrived` grows once a SECTION, so a part's first entrance always landed
     * on a section boundary — where the material changes, the energy changes
     * and the desk may change too. An entrance there is not heard as an
     * entrance. It is masked by everything else arriving with it.
     *
     * Worse, it left long sections with nothing to do. Measured over 300
     * records, 68% of dungeon synth's sections and 74% of lofi's went by
     * without anybody arriving or leaving at all — 63% and 67% of a record —
     * because a section that starts with fewer parts than the floor can never
     * offer `part-out` (it is already under the floor) and has nobody missing
     * to offer `part-back`. All it can do is play the same people more
     * quietly, which is what a listener reported hearing as nothing happening.
     *
     * So a section that has just gained a part opens WITHOUT it and lets the
     * pool bring it in at a two-loop boundary, where it is the only thing
     * changing. `heard` is the union of the spans, so the part is still built
     * and the section still ends the size its energy asked for; what moves is
     * the moment it is first heard.
     *
     * Not the intro, whose subject is what opens the record. Not the peak,
     * which has everyone by definition. Not the break, which is a stripping
     * away. And only where there is a later span for it to arrive at.
     *
     * THE ARRIVAL IS A RULE, NOT A CANDIDATE, and it has to be. Left to the
     * score, the part often never came: `part-back` competed with every other
     * move and lost, the union of the spans came out smaller than the section
     * asked for, and the material stage then built nothing for a part the
     * section was supposed to have — one 32-bar verse came out as a drone on
     * its own. So the part is absent from span 0 and present from span 1, and
     * the score keeps every boundary after that.
     */
    // AND ONLY A PART THAT LOOPS. The tune and the drums are written per time
    // ROUND, and the tune's plan includes RESTS — so a lead that enters at the
    // second span can land on rounds where its line is a rest and play nothing
    // at all, while the section still says it is heard. That is a part built
    // and never sounded, which `all.test.ts` catches by name and which is the
    // one thing this stage promises never to do. The groove is written once
    // and repeated, so it always has notes to walk in with.
    const loops = (r: Role): boolean => r === "bass" || r === "keys" || r === "drone";
    const gained = A.enter[arrived - 1];
    const entering: Role | null =
      gained !== undefined && loops(gained) && spanCount > 1 && !section.peak && !broken
        && section.fn !== "intro" && heard.has(gained) && heard.size > 1
        ? gained
        : null;
    const opensWithout = new Set(base);
    if (entering !== null) opensWithout.delete(entering);

    let cur: { heard: Set<Role>; thin: boolean; treatment: Treatment | null; at: Role | null; hush: ReadonlySet<Role>; halved: boolean } =
      { heard: opensWithout, thin, treatment: opening, at: null, hush: NONE, halved: false };
    const turnsOf = (s: number): number =>
      Math.min(2, Math.max(1, Math.round((Math.min(section.bars, (s + 1) * turn) - s * turn) / (turn / 2))));

    for (let s = 0; s < spanCount; s++) {
      // the newest part walks in at the first boundary, and that IS this
      // boundary's change — the two-loop rule asks for one thing to move and
      // an instrument arriving is the first of the four ways it names
      const paid = new Set<Role>();
      if (s === 1 && entering !== null) {
        paid.add(entering);
        cur = { ...cur, heard: new Set([...cur.heard, entering]) };
        ledger.used.set(`part-in:${entering}`, (ledger.used.get(`part-in:${entering}`) ?? 0) + 1);
      } else if (s > 0) {
        // ── THE POOL. Every named way this stage can change an arrangement.
        //    A move never declares which way it moves the energy: that is
        //    read off fullness afterwards, so a move cannot lie about itself.
        const pool: Move[] = [];
        const push = (name: string, h: Set<Role>, th: boolean, role: Role, afford = 1, tr: Treatment | null = cur.treatment, at: Role | null = null, hush: ReadonlySet<Role> = cur.hush, halved: boolean = cur.halved): void => {
          // a move that leaves the span exactly where it already is is not a
          // move, and the desk is part of where it is
          if (h.size === cur.heard.size && th === cur.thin && tr === cur.treatment && at === cur.at
            && same(hush, cur.hush) && halved === cur.halved && [...h].every((r) => cur.heard.has(r))) return;
          // THE CLOSE KEEPS THE OPENING. Holding the opener into the last
          // SECTION is not enough: a record ends on its last SPAN, and the
          // score below was free to take the part out again four bars from
          // the end. Measured, that is the whole difference between a
          // dénouement and nearly one — so in the closing section a move
          // that removes what the record opened with is never offered. A
          // treatment-only move keeps every part, so the desk still moves
          // freely at the close: what is refused is losing the opener.
          if (closing && openers.has(role) && !h.has(role)) return;
          pool.push({ name, heard: h, thin: th, role, afford, treatment: tr, at, hush, halved });
        };
        /**
         * THE DRONE DOES NOT COME AND GO INSIDE A SECTION.
         *
         * It is the floor the section stands on, and the two-loop clock is
         * about what moves OVER that floor. Taking it out at a span boundary
         * and putting it back four bars later is a drone stopping for no
         * reason and then starting again as itself, because the drone belongs
         * to the material and one material has one drone: what came back was
         * note for note what left.
         *
         * When the record does put the drone down it does it at a SECTION,
         * which is where the material changes — so what comes back stands on
         * a different tone. A drone that stops has moved.
         */
        const movable = (r: Role): boolean => r !== "drone";
        // an instrument out — stacked on where the span already is, not on the base
        if (!section.peak && cur.heard.size > floor) {
          for (const r of A.shed) {
            if (!cur.heard.has(r) || !movable(r)) continue;
            const less = new Set(cur.heard); less.delete(r);
            push("part-out", less, cur.thin, r, affords(r));
          }
        }
        // an instrument back — only ever one span 0 already had
        for (const r of A.enter) {
          if (cur.heard.has(r) || !base.has(r)) continue;
          const more = new Set(cur.heard); more.add(r);
          push("part-back", more, cur.thin, r);
        }
        // all of them back at one moment
        if (cur.heard.size < base.size) push("all-back", new Set(base), cur.thin, lastIn);
        // strip to the fewest the genre carries, keeping the tail of the shed order
        if (!section.peak && cur.heard.size > floor) {
          const stripped = new Set(cur.heard);
          for (const r of A.shed) { if (stripped.size <= floor) break; if (movable(r)) stripped.delete(r); }
          push("strip", stripped, cur.thin, A.shed.find(movable) ?? A.shed[0]!, affords(A.shed.find(movable) ?? A.shed[0]!));
        }
        // expression down, and back up — never above the floor the form set
        if (!cur.thin) push("hold-back", new Set(cur.heard), true, "drums");
        if (cur.thin && !thin) push("let-out", new Set(cur.heard), false, "drums");
        // AND EXPRESSION ON ANY PART, which is the two-loop rule's fourth way
        // and the one this stage read as the drums' hat. A part held back is
        // half a part, priced the same as a thinned kit; it is a gain and
        // nothing else, so no figure is played differently and the peak — which
        // may never lose a player — can finally do something other than take
        // the hat off. See `Span.hush`.
        for (const r of cur.heard) {
          if (cur.hush.has(r)) continue;
          push("hush", new Set(cur.heard), cur.thin, r, affords(r), cur.treatment, cur.at, new Set([...cur.hush, r]));
        }
        for (const r of cur.hush) push("speak-up", new Set(cur.heard), cur.thin, r, 1, cur.treatment, cur.at, new Set([...cur.hush].filter((x) => x !== r)));
        // AND THE KIT AT HALF SPEED, which is the other thing "expression" can
        // mean on a drum machine and the one §3 move that does not have to
        // wait for a section: the drums are excluded from the repetition law
        // by name. Offered only where they are sounding, for the same reason
        // a drum machine treatment is.
        if (cur.heard.has("drums")) {
          if (!cur.halved) push("half-time", new Set(cur.heard), cur.thin, "drums", 1, cur.treatment, cur.at, cur.hush, true);
          else push("full-time", new Set(cur.heard), cur.thin, "drums", 1, cur.treatment, cur.at, cur.hush, false);
        }
        // ── AND THE SECTION ON A DIFFERENT DESK, WITH EVERY NOTE WHERE IT IS.
        //    The two-loop rule's fourth way, which this stage never had: not
        //    who plays, but what the record sounds like while they play it.
        //    Only treatments this genre carries and that would actually move
        //    this genre's desk are here — `offered` did both filters once, at
        //    the top, because neither answer changes inside a record.
        //    A PER-PART TREATMENT IS OFFERED PER PART. The catalogue lists
        //    these as one part's move — "a part steps closer, or further off"
        //    — and this stage used to apply them to the whole band and hand
        //    the Move a hardcoded "drums" because the type wanted a role.
        //    That placeholder was the whole reason a treatment could not be
        //    scored: `worth` reads `standing` and `established` OF ITS ROLE,
        //    so a move with a fictional role got the constant 1, and with
        //    `serve` also constant across treatments the only thing left to
        //    order them by was `fresh × afford` — which knows nothing about
        //    this record. Measured over 300 seeds, every record in a genre
        //    played its treatments in the SAME ORDER, differing only in how
        //    far down the list it got.
        //
        //    So the role is real now, and nothing had to be added to the
        //    score: the terms that already read the record start reading it
        //    for treatments too, because there is finally a part to read.
        //    WHICH DESK MOVE THIS GENRE REACHES FOR IS DRAWN FROM ITS OWN
        //    POOL, and offering all of them at once was the mistake.
        //
        //    `arrangement.treat` is a `Weighted<Treatment>` — the same type as
        //    `arrangement.intro` and every `form.lengths` pool, both of which
        //    are DRAWN, one of them nine lines above this. It was being read
        //    as a ranking instead: every treatment offered at once, ordered by
        //    weight times freshness, so a record walked the ladder from the
        //    top and stopped wherever it ran out of boundaries. A record has
        //    three or four desk moves in it, so it reached rank four and no
        //    further — identically, every record, in every seed. Measured, a
        //    genre used the same handful of its vocabulary for ever, and the
        //    five moves added to the rack fired 0, 0, 3, 0 and 0 times in 300
        //    lofi records. Moving one up its tie group only starved another:
        //    15 distinct became 13. The ladder, not the tie-break, was what
        //    made the tail unreachable, and no amount of new vocabulary can
        //    be heard through it.
        //
        //    THE SCORE STILL DECIDES WHETHER A DESK MOVE HAPPENS. That is the
        //    part that has to serve what the record has done, and it is
        //    untouched: `serve`, `worth`, `fresh` and `afford` weigh this
        //    candidate against every density move exactly as before. What is
        //    drawn is only WHICH COLOUR, out of the pool the genre wrote —
        //    which is what a genre's weighted pool is for, and the freshness
        //    of each name is folded into the draw so a record still does not
        //    repeat itself.
        //    AND A DRUM MACHINE MOVE IS NOT OFFERED WHERE THE DRUMS ARE NOT
        //    SOUNDING. `deskOf` asks whether a move changes the DESK, which is
        //    the right question for the rack and the wrong one for the machine:
        //    swapping a kit changes the machine whether or not anybody is
        //    playing it. A boundary spent on a move nobody can hear is worse
        //    than a knob that does nothing, because the two-loop rule paid for
        //    it and the ear gets the section repeated instead.
        const live = offered
          .filter((t) => !needsDrums(t) || cur.heard.has("drums"))
          .map((t) => [t, weightOf(t) / (1 + (ledger.used.get(`treat:${t}`) ?? 0))] as const)
          .filter(([, w]) => w > 0);
        if (live.length > 0) {
          const t = chart.rng.at("arrange", "treat", section.index, s).weighted("which", live);
          push(`treat-${t}`, new Set(cur.heard), cur.thin, "drums", 1, t);
          if (isPerPart(t)) {
            for (const r of cur.heard) {
              if (deskOf(t, chart.genre.sound, r) === null) continue;
              push(`treat-${t}`, new Set(cur.heard), cur.thin, r, 1, t, r);
            }
          }
        }
        //    and back to the record's own sound, which is a change like any
        //    other and the only way a treated span ever ends
        if (cur.treatment !== null) push("untreat", new Set(cur.heard), cur.thin, "drums", 1, null, null);

        // ── THE SCORE. Three terms, multiplied, no coefficients: any one at
        //    zero kills the move, and there is nothing to tune.
        const established = (r: Role): number => {
          const n = sectionsHeard.get(r) ?? 0;
          return n / (n + 1);
        };
        const want = ledger.owed / (ledger.owed + A.rest);
        const before = fullness(cur.heard, cur.thin, cur.hush, cur.halved);
        let best: Move | null = null;
        let bestFit = 0;
        const fits = new Map<Move, number>();
        //   WHICH PARTS A MOVE TOUCHES — the ones whose staleness it pays.
        //   A whole-desk treatment is under everyone sounding; a per-part one
        //   under its part; a density move touches the part it moves; the
        //   kit's expression touches the kit.
        const touches = (mv: Move): Role[] => {
          const out = new Set<Role>();
          if (mv.treatment !== cur.treatment || mv.at !== cur.at) {
            // the parts the desk move actually reaches — the machine's reverb
            // is under the drums and nobody else, a return under the parts
            // that feed it. Booked as "everyone", measured, a bass whose only
            // change in sixteen bars was `soak` on the kit counted as changed.
            // Leaving a desk reaches whoever the desk it leaves reached.
            for (const t of [mv.treatment, cur.treatment]) {
              if (t === null) continue;
              for (const r of reachesPart(t, chart.genre.sound, (t === mv.treatment ? mv.at : cur.at) ?? undefined)) if (cur.heard.has(r)) out.add(r);
            }
          }
          for (const r of cur.heard) if (!mv.heard.has(r)) out.add(r);
          for (const r of mv.heard) if (!cur.heard.has(r)) out.add(r);
          for (const r of mv.hush) if (!cur.hush.has(r)) out.add(r);
          for (const r of cur.hush) if (!mv.hush.has(r)) out.add(r);
          if (mv.thin !== cur.thin || mv.halved !== cur.halved) out.add("drums");
          return [...out];
        };
        for (const mv of pool) {
          const after = fullness(mv.heard, mv.thin, mv.hush, mv.halved);
          const d = after - before;
          const moved = mv.treatment !== cur.treatment;
          //   THE DEBT TALKING: deep in debt, giving scores and taking does not.
          //
          //   A TREATMENT ANSWERS A DIFFERENT OBLIGATION and is scored for it.
          //   It neither gives a part nor takes one — d is exactly zero, which
          //   under the line below would score zero and never be chosen — so
          //   what it serves is the case the density moves cannot serve: the
          //   record owed neither a rise nor a fall, and the two-loop rule
          //   owing a change anyway. That is `want` at neither end: 1 at
          //   want = 0.5, 0 at either extreme.
          //
          //   AND IT IS PRICED IN THE SAME CURRENCY AS EVERY OTHER MOVE, which
          //   is what the first attempt got wrong. A density move's serve is
          //   its change in fullness, so it can never exceed one part of five;
          //   a treatment scored on that shape alone reached 1 and outbid every
          //   one of them about five times over. Measured, a record went to
          //   fifteen desk moves against two of everything else — the ear got a
          //   section that changed colour every eight bars and never lost a
          //   player, which is the same failure as the texture that oscillates,
          //   wearing better clothes.
          //
          //   A treatment is worth what the drums' expression is worth, and
          //   this file has already priced that: `fullness` counts a thinned
          //   kit as half a part. So half a part is what a treatment serves at
          //   its best, and the number is the one already in the file rather
          //   than a new one to tune.
          const asPart = 0.5 / ROLES.length;
          const serve = moved
            ? (1 - Math.abs(2 * want - 1)) * asPart
            : d > 0 ? want * d : (1 - want) * -d;
          //   a part is worth more where it is missing, as arithmetic — and a
          //   treatment takes no part away, so there is no absence to price
          const st = ledger.standing.get(mv.role) ?? 0;
          //   A TREATMENT AIMED AT A PART IS WORTH WHAT THAT PART IS WORTH.
          //   This read `moved ? 1` — a constant — and with `serve` also
          //   constant across treatments there was nothing left to order them
          //   by but `fresh × afford`, which knows nothing about this record.
          //   Now that a per-part treatment carries the part it is aimed at,
          //   the term that already prices a part can price it: treating a
          //   part the record has barely established is a change nobody can
          //   register, exactly as it is for a density move. A whole-desk
          //   treatment has no part, so it keeps the 1 it had.
          //   and a WHOLE-DESK treatment is aimed at everyone, so it is worth
          //   what everyone is worth: the same term over the parts sounding.
          //   Left at a flat 1 it was a free pass that outbid every per-part
          //   move on principle rather than on merit, which is the bias that
          //   put the whole band back on one fixed playlist.
          const worthAll = (): number => {
            let sum = 0;
            for (const r of cur.heard) sum += established(r);
            return cur.heard.size === 0 ? 1 : sum / cur.heard.size;
          };
          const worth = moved
            ? (mv.at === null ? worthAll() : established(mv.at))
            : (d > 0 ? Math.max(0, -st) / (Math.max(0, -st) + 1) : Math.max(0, st) / (Math.max(0, st) + 1))
              * established(mv.role);
          //   the rule of three, applied to this stage's own vocabulary: the
          //   same move on the same part wears out across the whole record
          const fresh = 1 / (1 + (ledger.used.get(keyOf(mv)) ?? 0));
          //   and a genre does not part with its foundation as readily as with
          //   its decoration: what it can most afford is its own to say — for a
          //   treatment that is the weight the genre put on it
          const afford = mv.treatment !== null ? weightOf(mv.treatment) : mv.afford;
          //   AND THE RULE OF THREE, COUNTED PER PART. "If I say it a third
          //   time ... this is where our brain will actually begin to tune it
          //   out" — and this score kept that for the record while every part
          //   broke it, because one thing moved at each boundary and the parts
          //   it did not move went on stating their figure uncounted: bass and
          //   keys three turns or more unchanged in 42% of their runs, the
          //   worst sixteen turns. A move is worth one more for every turn the
          //   part it touches has gone unchanged, so the longest-stale part's
          //   moves rank first and nobody's move ranks less than it did.
          //   THE SUM over the parts it touches, not the largest: a move is
          //   worth the staleness it clears, and a whole-desk treatment
          //   clears everyone's — which is what makes the desk the natural
          //   answer when the whole band is owed, "automation and modulation
          //   rather than constant arrangement changes". Scored by the
          //   largest alone, measured, the desk was worth one hush.
          const due = 1 + touches(mv).reduce((sum, r) => sum + (stale.get(r) ?? 0), 0);
          const fit = serve * worth * fresh * afford * due;
          fits.set(mv, fit);
          if (fit > bestFit) { bestFit = fit; best = mv; }
        }
        if (best === null) {
          // nothing served the debt. The two-loop rule still owes a change,
          // so take the freshest move there is; only a genuinely empty pool
          // is a dead end, and it is counted rather than hidden.
          let alt: Move | null = null;
          let altFresh = -1;
          for (const mv of pool) {
            const f = 1 / (1 + (ledger.used.get(keyOf(mv)) ?? 0));
            if (f > altFresh) { altFresh = f; alt = mv; }
          }
          if (alt === null) ledger.stuck++;
          best = alt;
        }
        let deskMoved = best !== null && (best.treatment !== cur.treatment || best.at !== cur.at);
        // and the rule runs both ways: a boundary that moved who plays, or
        // the kit's expression, takes no desk move on top of it either
        let bodyMoved = best !== null && (!same(best.heard, cur.heard) || best.thin !== cur.thin || best.halved !== cur.halved);
        if (best !== null) {
          for (const r of touches(best)) paid.add(r);
          cur = { heard: best.heard, thin: best.thin, treatment: best.treatment, at: best.at, hush: best.hush, halved: best.halved };
          ledger.used.set(keyOf(best), (ledger.used.get(keyOf(best)) ?? 0) + 1);
        }
        // ── OWED AT TWO, PAID AT THREE. A part that went the whole of the last
        //    span unchanged has stated its figure twice; one more span and it
        //    is the third hearing the ear tunes out. So a boundary pays every
        //    such part, not only the one the score chose — the two-loop source
        //    never said one thing moves, and its own worked example adds hats,
        //    a clap, a bass and a counter-melody at one boundary. What can be
        //    paid ON TOP of the chosen move is what composes with it: a part
        //    held back, if nobody is; a part out, if the floor and the peak
        //    allow; the kit's expression down. A treatment cannot — a span is
        //    heard on one desk — and a walking desk has already paid everyone
        //    under it. The best-scoring of those for the part, so the ledger's
        //    freshness still turns which move it is.
        // AT TWO, because the clock counts in spans of two turns: a part that
        // has gone one span unchanged has stated its figure twice, and the
        // next span would be the third hearing. "Using it more than two times
        // is overusing it." Paid at the next even count instead — four —
        // measured: every part went a third and a fourth turn, and the number
        // this was built to move went back to where it started.
        const owed = [...cur.heard].filter((r) => !paid.has(r) && (stale.get(r) ?? 0) >= 2)
          .sort((a, b) => ((stale.get(b) ?? 0) - (stale.get(a) ?? 0)) || (a === stillLast ? -1 : b === stillLast ? 1 : 0));
        // AND SOMETHING IS LEFT HOLDING STILL. A change is only heard against
        // something that did not change, so however many parts are owed, at
        // least one part sounding is left exactly as it was. Measured without
        // this, the first boundary of a peak held four of five parts back at
        // once — everyone quieter, which is the arc's job. Measured with a
        // cap of one held back per boundary instead, three foundation parts
        // owed at the floor got one payment between them and the other two
        // went unpaid every time — `.d.d.d.d...d...` on the roll.
        for (const r of owed) {
          // this part would be the last one standing still: leave it, and
          // remember it, so it goes first next time
          if ([...cur.heard].filter((x) => !paid.has(x)).length <= 1) { stillLast = r; break; }
          let extra: Move | null = null;
          let extraFit = 0;
          for (const mv of pool) {
            if (mv.role !== r) continue;
            // A CHANGE IS HEARD AGAINST SOMETHING HOLDING STILL, so two rules
            // on what may be paid on top: where the desk moved, only a gain —
            // a section that changes colour and loses a player in the same
            // bar has nothing held still, and `arrange.test.ts` holds a
            // treatment to never taking a part away. And a section that
            // builds into the climax is not paid in expression DOWN, which
            // is the run-up cancelled by its own arrangement.
            const ok =
              (mv.name === "hush" && !swell && !cur.hush.has(r) && cur.heard.has(r))
              || (mv.name === "speak-up" && cur.hush.has(r))
              || (!deskMoved && mv.name === "part-out" && !section.peak && cur.heard.size > floor && cur.heard.has(r) && !(closing && openers.has(r)))
              || (!deskMoved && !swell && r === "drums" && mv.name === "hold-back" && !cur.thin)
              || (!deskMoved && r === "drums" && mv.name === "half-time" && !cur.halved)
              // and a treatment aimed at the part, where the span's desk is
              // still the record's own: one desk per span, so once — and then
              // the desk has moved and the rule above takes over
              || (!deskMoved && !bodyMoved && cur.treatment === null && mv.treatment !== null && mv.at === r);
            if (!ok) continue;
            // a move the score gave nothing is still a payment: a part let
            // back up scores zero while the ledger is taking, and it is the
            // only way a held-back part is ever anything else
            const f = fits.get(mv) ?? 0;
            if (extra === null || f > extraFit) { extraFit = f; extra = mv; }
          }
          if (extra === null) { ledger.unpaid++; continue; }
          if (extra.treatment !== null && extra.at === r && cur.treatment === null) { cur = { ...cur, treatment: extra.treatment, at: r }; deskMoved = true; }
          else if (extra.name === "hush") cur = { ...cur, hush: new Set([...cur.hush, r]) };
          else if (extra.name === "speak-up") cur = { ...cur, hush: new Set([...cur.hush].filter((x) => x !== r)) };
          else if (extra.name === "part-out") { const less = new Set(cur.heard); less.delete(r); cur = { ...cur, heard: less }; bodyMoved = true; }
          else if (extra.name === "hold-back") { cur = { ...cur, thin: true }; bodyMoved = true; }
          else { cur = { ...cur, halved: true }; bodyMoved = true; }
          paid.add(r);
          ledger.used.set(keyOf(extra), (ledger.used.get(keyOf(extra)) ?? 0) + 1);
        }
        // and the count: a part that was touched starts again, a part that
        // was not has stated its figure two more turns, and a part that is
        // not sounding is not stale — its absence is the change
      }
      // A PART PAID AT THE START OF THIS SPAN HAS PLAYED IT — two turns in the
      // new state — so by the end of the span it stands at two, not nought.
      // Reset to nought, measured, every part got a third and a fourth turn
      // before it was owed again: `.d.d.d.d.....` on the roll, the rule kept
      // while the desk walked and broken the span after each payment.
      for (const r of ROLES) stale.set(r, cur.heard.has(r) ? (paid.has(r) ? 2 : (stale.get(r) ?? 0) + 2) : 0);
      spans.push({ heard: new Set(cur.heard), thin: cur.thin, treatment: cur.treatment, at: cur.at, hush: cur.hush, halved: cur.halved });

      // ── THE LEDGER, in part-turns. Two entries and nothing else.
      const turns = turnsOf(s);
      const now = fullness(cur.heard, cur.thin, cur.hush, cur.halved);
      //   withholding accrues, measured against the fullest the record has
      //   ACTUALLY been — so an intro accrues nothing by being small. It is
      //   establishing, not withholding: you cannot miss what you have not
      //   yet heard, and a record that never gets full has a flat arc rather
      //   than a failed one.
      ledger.owed += Math.max(0, ledger.ceiling - now) * turns;
      //   and giving pays it off
      if (now > ledger.last) {
        const discharged = Math.min(ledger.owed, (now - ledger.last) * turns);
        ledger.owed -= discharged;
        if (discharged > 0) ledger.release.push({ section: section.index, span: s, discharged });
      }
      ledger.ceiling = Math.max(ledger.ceiling, now);
      ledger.last = now;
      for (const r of ROLES) {
        const st = ledger.standing.get(r) ?? 0;
        ledger.standing.set(r, cur.heard.has(r) ? Math.max(0, st) + turns : Math.min(0, st) - turns);
      }
    }

    // AND WHAT IS HEARD IN THE SECTION IS THE UNION OF ITS SPANS. A part that
    // plays for one span of a section is heard in it, and its material has to
    // exist — so this is read off the spans and not the other way round.
    const union = new Set<Role>();
    for (const sp of spans) for (const r of sp.heard) union.add(r);
    const held = Object.freeze(union) as ReadonlySet<Role>;
    // REBUILT FIELD BY FIELD, so every field of `Span` has to be named here
    // too. The cast at the end means a field left out is not a type error —
    // it is a field that silently stops existing downstream, which is how
    // `at` was dropped on its first outing while `npm run check` stayed
    // green. If you add to `Span`, add to this.
    const frozen = Object.freeze(
      spans.map((sp) => Object.freeze({
        heard: Object.freeze(sp.heard) as ReadonlySet<Role>,
        thin: sp.thin,
        treatment: sp.treatment,
        at: sp.at,
        hush: sp.hush,
        halved: sp.halved,
      })),
    ) as readonly Span[];
    return Object.freeze({
      section,
      material: materialKey(section.idea, variant),
      heard: held,
      thin,
      broken,
      swell,
      manner,
      spans: frozen,
    });
  });

  return Object.freeze({
    placed: Object.freeze(placed),
    release: Object.freeze(ledger.release.map((r) => Object.freeze(r))),
    stuck: ledger.stuck,
    unpaid: ledger.unpaid,
  });
}

/** "intro[keys drums] verse[all] bridge[all·thin] outro[-lead]" */
export function describeArrangement(a: Arrangement): string {
  return a.placed
    .map((p) => {
      const all = p.heard.size === ROLES.length;
      const missing = ROLES.filter((r) => !p.heard.has(r));
      const who = all ? "all" : missing.length <= 1 && missing.length < p.heard.size
        ? missing.map((r) => "-" + r).join(" ")
        : [...p.heard].join(" ");
      return `${p.section.fn}[${who}${p.thin ? "·thin" : ""}${p.broken ? "·break" : ""}]`;
    })
    .join(" ");
}
