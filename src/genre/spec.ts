/**
 * What a genre is, as a type.
 *
 * Two shapes, deliberately not one:
 *
 *   GenreSpec   what an author writes. Everything but the name is optional,
 *               and a genre may build on another.
 *   Genre       what the program reads. Every field present, every value
 *               final, frozen. Nothing downstream ever sees `undefined` and
 *               nothing downstream applies a default.
 *
 * Keeping them apart is the point. When a default lives at the place a value
 * is *read*, the same field ends up with several defaults in several readers
 * and no one can answer "what is this genre's value" without reading all of
 * them. Resolving once, up front, makes the answer a fact you can print.
 *
 * A FIELD ENTERS THIS FILE WHEN A READER EXISTS FOR IT — never in advance of
 * one. A declared field nothing reads is invisible, and invisible config is
 * what rots.
 */

import type { ArtName } from "../core/articulation.ts";
import type { Weighted } from "../core/rng.ts";
import type { Metre } from "../core/clock.ts";
import type { ScaleName } from "../core/theory.ts";

export type { Weighted } from "../core/rng.ts";

/**
 * The parts a record can have.
 *
 * A union rather than a string: naming a part that does not exist is a
 * compile error, not something found by rendering sixteen seeds and noticing
 * the silence.
 */
export const ROLES = ["drums", "bass", "keys", "lead", "drone"] as const;

export type Role = (typeof ROLES)[number];

export const isRole = (s: string): s is Role => (ROLES as readonly string[]).includes(s);

/** The parts that carry a pitch: every role but the drums. Derived, not listed. */
export const PITCHED_ROLES = ROLES.filter((r): r is Exclude<Role, "drums"> => r !== "drums");
export type PitchedRole = Exclude<Role, "drums">;

/**
 * Where a number came from, keyed by the field it justifies.
 *
 * Data, not prose, and not attached to the value — so it can be checked. A key
 * naming a field the genre does not have is an error at load, which is what
 * stops a citation outliving the number it was written for.
 */
export type Sources = Readonly<Record<string, string>>;

/** The section kinds a record can be built from. */
export const SECTION_FNS = [
  "intro",
  "verse",
  "chorus",
  "bridge",
  "instrumental",
  "outro",
] as const;

export type SectionFn = (typeof SECTION_FNS)[number];

/**
 * Which musical idea a section states.
 *
 * A *function* is what kind of section it is; an *idea* is what it says. Two
 * verses and an instrumental can all state idea A, and that is the thing an
 * ear counts — so the laws about repetition are stated over ideas, not over
 * function names.
 */
export const IDEAS = ["A", "B", "C"] as const;
export type Idea = (typeof IDEAS)[number];

/** A length is one number, or a pool of them by weight. */
export type Lengths = Readonly<Partial<Record<SectionFn, number | Weighted<number>>>>;

/** What an author writes about form. */
export interface FormSpec {
  readonly lengths?: Lengths;
  readonly idea?: Readonly<Partial<Record<SectionFn, Idea>>>;
  /** 0..1, how big each kind of section is meant to feel. */
  readonly energy?: Readonly<Partial<Record<SectionFn, number>>>;
  /** What may follow what, by weight. */
  readonly next?: Readonly<Partial<Record<SectionFn, Weighted<SectionFn>>>>;
  /** How often a record opens with an intro rather than starting cold. */
  readonly introChance?: number;
  /**
   * The longest an intro may run, IN SECONDS. Not in bars: eight bars is four
   * seconds at 240 bpm and twenty-three at 82, and what a listener leaves is
   * measured on a clock. "Intros that averaged more than 20 seconds in the
   * mid-80s are now only about 5 seconds long" — a 78% drop over 303 top-ten
   * singles (Léveillé Gauvin, "Drawing listener attention in popular music",
   * Musicae Scientiae 22(3), 2018); "I can't remember hearing an intro that
   * was too short, but I've heard many that were too long" (Ewer,
   * secretsofsongwriting.com). The length is drawn from the lengths that fit
   * under this, so the ceiling narrows the draw rather than truncating it.
   */
  readonly introSec?: number;
}

/** What the form stage reads. Every function answered, every length a pool. */
export interface FormRules {
  readonly lengths: Readonly<Record<SectionFn, Weighted<number>>>;
  readonly idea: Readonly<Record<SectionFn, Idea>>;
  readonly energy: Readonly<Record<SectionFn, number>>;
  readonly next: Readonly<Record<SectionFn, Weighted<SectionFn>>>;
  readonly introChance: number;
  readonly introSec: number;
}

/** A register: the lowest and highest MIDI pitch a part may play. */
export type Register = readonly [number, number];

/**
 * A chord progression as scale degrees, one per bar. Shorter than the
 * material repeats to fill it: `[0, 5]` over four bars is `0 5 0 5`.
 */
export type Progression = readonly number[];

export interface HarmonySpec {
  /** How many bars one statement of an idea runs. */
  readonly bars?: number;
  /**
   * How many bars a MOTIF runs — the sub-period of the idea, and the period
   * on which a shape comes back.
   *
   * A part draws WHAT IT PLAYS per position in the motif, not per bar of the
   * material, for the same reason the chord quality above is drawn per
   * position in the progression: drawn per bar, a two-bar shape written over
   * a four-bar material came out four unrelated shapes, and the loop
   * repeated nothing. Landing on a new chord the shape keeps its scale
   * functions and re-fits its pitches, which is a TONAL SEQUENCE — the
   * device that lets an idea stay recognisable across changes it was not
   * written over. [thejazzpianosite.com composition-and-melodic-development:
   * "reconstructing the motive on a different note in the scale while
   * keeping the same melodic shape"; jazzguitarlessons.net
   * motivic-development: "the same rhythmic ideas over different chords"]
   */
  readonly motif?: number;
  /** The changes each idea may stand on. */
  readonly progressions?: Readonly<Partial<Record<Idea, Weighted<Progression>>>>;
  /** 0..1, how often a chord takes its seventh. */
  readonly sevenths?: number;
  /**
   * 0..1, how often a chord that already took its seventh goes on to its
   * NINTH. Jazz-leaning music is not seventh chords, it is extended ones:
   * lo-fi "relies on extended chords, especially major 7ths, minor 7ths and
   * dominant 9ths" and adds "seventh and ninth intervals attached to the
   * chords for an added bit of flavour" (unison.audio lofi-chord-
   * progressions; lofiweekly.com 7-jazz-piano-chords-lofi-hip-hop).
   * Conditional on the seventh, because a ninth over a triad is a chord with
   * a hole in it; drawn unconditionally, so adding it moved no record that
   * does not ask for it.
   */
  readonly ninths?: number;
  /**
   * 0..1, how often a chord drops its THIRD and is voiced as a bare fifth.
   * A fifth is neither major nor minor, which is the whole point of it: it
   * is the medieval and modal colour, and the room it leaves is where a
   * melody puts the mode back.
   */
  readonly fifths?: number;
  /**
   * Every mode has one degree whose triad is diminished, and it is a
   * different degree in each. "avoid" draws only progressions that do not
   * land on it in the record's scale, so a loop written as degrees does not
   * come out with a diminished triad in one mode and a major one in another.
   */
  readonly diminished?: "allow" | "avoid";
}

export interface HarmonyRules {
  readonly bars: number;
  readonly ninths: number;
  readonly motif: number;
  readonly progressions: Readonly<Record<Idea, Weighted<Progression>>>;
  readonly sevenths: number;
  readonly fifths: number;
  readonly diminished: "allow" | "avoid";
}

/** Which chord tone an off-beat bass note takes. */
export const BASS_TONES = ["root", "fifth", "third", "octave", "approach"] as const;
export type BassTone = (typeof BASS_TONES)[number];

/**
 * Where in a bar something strikes, IN BEATS, fractions allowed: `[0, 2]` is
 * beats one and three, `[0, 1.5, 2]` adds the "and" of two. Beat 0 is always
 * present.
 *
 * Beats and not grid steps, because a step is a property of the metre: a list
 * written as sixteenths is silently wrong in every bar that is not sixteen of
 * them. Resolution turns beats into steps for the metre the genre actually
 * has, and refuses a beat that does not land on its grid.
 */
export type Beats = readonly number[];

export interface BassSpec {
  readonly register?: Register;
  /**
   * Which beats strike, drawn once per material — or `"kick"`: the bass
   * strikes where the drum figure's kick does, and the two are one foot.
   */
  readonly pocket?: Weighted<Beats> | "kick";
  /** What a strike that is not the downbeat plays. */
  readonly tones?: Weighted<BassTone>;
  /** How often each manner is reached for. Only what the instrument can do. */
  readonly art?: ArtSpec;
}

/** What the bass builder reads. `pocket` is in GRID STEPS here, not beats. */
export interface BassRules {
  readonly register: Register;
  readonly pocket: Weighted<readonly number[]> | "kick";
  readonly tones: Weighted<BassTone>;
  readonly art: ArtSpec;
}

export interface KeysSpec {
  readonly register?: Register;
  /** Which beats the chord is struck on, drawn once per material. */
  readonly strike?: Weighted<Beats>;
  /** 0..1, how much an open voicing is preferred over a close one. */
  readonly open?: number;
  /** How often each manner is reached for. Only what the instrument can do. */
  readonly art?: ArtSpec;
}

/** What the keys builder reads. `strike` is in GRID STEPS here, not beats. */
export interface KeysRules {
  readonly register: Register;
  readonly strike: Weighted<readonly number[]>;
  readonly open: number;
  readonly art: ArtSpec;
}

/**
 * What the tune does on each cycle of a section. A states it; B keeps the
 * question and answers it differently; "." is a rest for the whole cycle.
 * A tune heard four times unchanged is a loop, and a tune changed every time
 * was never a tune — so the plan says which cycles restate and which develop.
 */
export const LEAD_CYCLES = ["A", "B", "."] as const;
export type LeadCycle = (typeof LEAD_CYCLES)[number];

/**
 * HOW A LINE MOVES. Not how fast or how loud — which pitch it reaches for
 * next, which is the thing that makes a wind line and a riff guitar and a
 * chanted vocal three different kinds of melody rather than one process with
 * different pools.
 *
 *   sung    conjunct: "in conjunct melodic motion, the melodic phrase moves
 *           in a stepwise fashion with notes moving up or down a semitone or
 *           tone, but no greater" (en.wikipedia.org/wiki/Melodic_motion), and
 *           stepwise motion is the preferred motion in every repertoire
 *           measured.
 *   riff    disjunct: the phrase "leaps upwards or downwards with movement
 *           greater than a whole tone" (the same). Not a melody that happens
 *           to leap — a chord played one note at a time, which is why it
 *           reaches for chord tones wherever they are rather than only on
 *           the beat.
 *   chant   a reciting tone. Chant is "the rhythmic speaking or singing of
 *           words or sounds, often primarily on one or two pitches (reciting
 *           tones)" (en.wikipedia.org/wiki/Reciting_tone;
 *           newworldencyclopedia.org, "Chant"), and the technique of holding
 *           one has its own name, repercussion
 *           (en.wikipedia.org/wiki/Repercussion_(singing)). This program used
 *           to forbid it outright.
 */
export const CONTOURS = ["sung", "riff", "chant"] as const;
export type Contour = (typeof CONTOURS)[number];

/**
 * HOW THE SECOND TURN OF A LOOP RELATES TO THE FIRST, where a material holds
 * more than one turn of its harmony.
 *
 *   loop      the figure again, exactly. What makes a beat a beat.
 *   sentence  the figure again, CHANGED a little — Caplin's presentation
 *             phrase, "a repeated two measure basic idea" where "the idea is
 *             then repeated, usually with some variation in contour, rhythm,
 *             voicing, or harmonization" (milnepublishing.geneseo.edu,
 *             "Sentences and Periods"; symposium.music.org, "A Taxonomy of
 *             Sentence Structures").
 *
 * Both are repetition and only one of them is exact. A record that only ever
 * tiles says the same two bars until the section ends; one that only ever
 * varies has no figure to vary. The genre says how often it does each.
 */
export const SHAPES = ["loop", "sentence"] as const;
export type Shape = (typeof SHAPES)[number];

/**
 * THE SHAPE A PHRASE WALKS, reduced the way Huron reduces one: its first
 * pitch, the mean of the middle, and its last.
 *
 *   arch        up to a height and down again. The commonest shape there is:
 *               "in 40% of approximately 10,000 phrases (5–11 notes in
 *               length), an ascending–descending (convex) melodic pattern
 *               was present" (Huron, "The Melodic Arch in Western
 *               Folksongs", Computing in Musicology 10, 1996).
 *   descending  down. The second commonest, and "descending arches are more
 *               common in the last phrase" (ibid.), which is why an
 *               answering phrase prefers it.
 *   ascending   up. Commonest in a FIRST phrase (ibid.).
 *   concave     down and back up. The rarest of the four.
 *
 * A conventional shape is also what a tune people cannot forget has:
 * "tunes with more common global melodic contour shapes … are more likely
 * to become INMI" (Jakubowski et al., "Dissecting an Earworm", Psychology of
 * Aesthetics, Creativity, and the Arts 11(2), 2017).
 */
export const ARCS = ["arch", "descending", "ascending", "concave"] as const;
export type Arc = (typeof ARCS)[number];

/**
 * THE FIGURE A PHRASE IS MADE OF. A hook is "a memorable catch phrase or
 * melody line which is REPEATED in a song" (Songwriter's Market, quoted in
 * Burns, "A typology of 'hooks' in popular records", Popular Music 6/1,
 * 1987), and Burns's own example is a phrase "repeated immediately" inside a
 * verse — a hook within a verse.
 *
 * `notes` is how many onsets the figure is; `restate` is how often a phrase
 * says it again rather than walking on. A restatement that the laws refuse
 * note for note is transposed along the scale, which is the same operation
 * `vary.ts` calls a sequence.
 */
export interface MotifSpec {
  readonly notes?: number;
  readonly restate?: number;
}
export type MotifRules = Required<MotifSpec>;

/** What a drone sits on: the key's tonic, or the fifth above it. */
export const DRONE_TONES = ["tonic", "fifth"] as const;
export type DroneTone = (typeof DRONE_TONES)[number];

/** A string on the drone instrument: the tonic, the fifth, or the tonic an octave down. */
export const DRONE_STRINGS = ["tonic", "fifth", "low"] as const;
export type DroneString = (typeof DRONE_STRINGS)[number];

export interface DroneSpec {
  readonly register?: Register;
  /** Which tone of the KEY it holds — never of the chord; a drone does not follow the changes. */
  readonly tone?: Weighted<DroneTone>;
  /** How many bars one tone RINGS for once it is struck, drawn once per material. */
  readonly hold?: Weighted<number>;
  /**
   * THE STRINGS, in the order they are plucked — because a drone is not one
   * held note, and the instruments that make drones for a living do not make
   * them that way.
   *
   * A tanpura has four: "normally the fifth (Pa) and the root tonic (Sa)",
   * with one of the tonic strings tuned "an octave below the others, adding
   * greater resonance and depth". They are "plucked in a regular, repeating
   * rhythm", one after another, and what makes the sound is that they
   * OVERLAP — "when the next strand is plucked, the two notes interact and
   * build on each other". That interaction is the shimmer, and a single
   * sustained pitch cannot have it.
   * [en.wikipedia.org/wiki/Tanpura; riyaazqawwali.com/tanpura;
   * organology.net/instrument/tanpura]
   *
   * "low" is the tone an octave under the one drawn — the tanpura's deep Sa.
   */
  readonly strings?: Weighted<readonly DroneString[]>;
  /**
   * How the cycle is plucked: how many BARS between strings, and the extra
   * bars closing each turn — "when the last note of the rhythm is played, the
   * pattern repeats after a slightly longer pause".
   */
  readonly pluck?: { readonly every?: number; readonly rest?: number };
  /** How often each manner is reached for. Only what the instrument can do. */
  readonly art?: ArtSpec;
}

export interface DroneRules {
  readonly register: Register;
  readonly tone: Weighted<DroneTone>;
  readonly hold: Weighted<number>;
  readonly strings: Weighted<readonly DroneString[]>;
  readonly pluck: { readonly every: number; readonly rest: number };
  readonly art: ArtSpec;
}

export interface LeadSpec {
  readonly register?: Register;
  /**
   * Rhythm cells for a two-bar phrase, in beats from the phrase's start —
   * so `[0, 1, 2, 4, 5.5]` reaches into the second bar. Drawn per phrase.
   */
  readonly rhythms?: Weighted<Beats>;
  /** 0..1, how often a move is a leap of a third or more rather than a step. */
  readonly leap?: number;
  /** The widest a phrase may span, in semitones. */
  readonly span?: number;
  /** One letter per cycle of a section, drawn once per material. The first must sound. */
  readonly cycles?: Weighted<readonly LeadCycle[]>;
  /** How often each manner is reached for. Only what the instrument can do. */
  readonly art?: ArtSpec;
  /** How the line moves: stepwise, arpeggiated, or on a reciting tone. Drawn once per tune. */
  readonly contour?: Weighted<Contour>;
  /** Whether the loop's second turn is the first again or the first varied. */
  readonly shape?: Weighted<Shape>;
  /** The figure a phrase states and restates: the hook, inside the phrase. */
  readonly motif?: MotifSpec;
  /** Which shape a phrase walks, drawn per phrase. */
  readonly arc?: Weighted<Arc>;
  /**
   * 0..1, how often a tune plants ONE interval wider than a perfect fifth.
   * "Any interval larger than a perfect fifth seems distinctive" (Burns
   * 1987) — one of them is the tune's signature, and two is a habit.
   */
  readonly signature?: number;
}

/** What the lead builder reads. `rhythms` is in GRID STEPS over two bars. */
export interface LeadRules {
  readonly register: Register;
  readonly rhythms: Weighted<readonly number[]>;
  readonly leap: number;
  readonly span: number;
  readonly cycles: Weighted<readonly LeadCycle[]>;
  readonly art: ArtSpec;
  readonly contour: Weighted<Contour>;
  readonly shape: Weighted<Shape>;
  readonly motif: MotifRules;
  readonly arc: Weighted<Arc>;
  readonly signature: number;
}

/** The drums a kit can strike. A union: a lane that does not exist is a compile error. */
export const DRUM_LANES = ["kick", "snare", "hat", "openhat"] as const;
export type DrumLane = (typeof DRUM_LANES)[number];

/**
 * A bar's part in a four-bar phrase. A is the figure; B changes one thing
 * about it; C changes two; D is a fill or an empty leading into the next
 * phrase. Four A's is a loop, which a genre may still ask for.
 */
export const BAR_LETTERS = ["A", "B", "C", "D"] as const;
export type BarLetter = (typeof BAR_LETTERS)[number];

export interface DrumsSpec {
  readonly kick?: Weighted<Beats>;
  readonly snare?: Weighted<Beats>;
  /** The hat strikes every this many beats: 1 is quarters, 0.5 eighths, 0 none. */
  readonly hat?: Weighted<number>;
  /** One letter per bar, drawn per material. */
  readonly phrase?: Weighted<readonly BarLetter[]>;
  /** How often each manner is reached for. Only what the instrument can do. */
  readonly art?: ArtSpec;
  /**
   * How many distinct TREATMENTS of the figure a record has. Each is a
   * phrase of letters over the material, and the record cycles through them:
   * at 2, a four-bar loop is played one way, then another, then the first
   * again. A treatment drawn afresh every time round is not variation, it is
   * a beat that never repeats.
   */
  readonly treatments?: number;
}

/** What the drum builder reads. Beats resolved to GRID STEPS. */
export interface DrumsRules {
  readonly kick: Weighted<readonly number[]>;
  readonly snare: Weighted<readonly number[]>;
  readonly hat: Weighted<number>;
  readonly phrase: Weighted<readonly BarLetter[]>;
  readonly art: ArtSpec;
  readonly treatments: number;
}

/**
 * WHAT AN INTRO IS MADE OF. An intro is the record's own material with
 * something withheld, and which thing is withheld is the kind of intro it is.
 *
 *   rhythm  the drums, or the drums and the bass, and NOTHING else. "Use of
 *           solo drums, solo bass, or drums and bass in duet at the start of
 *           a record will attract especially great attention to rhythm
 *           because there is little or no melody or harmony to attend to, and
 *           no lyrics" (Burns, "A typology of 'hooks' in popular records",
 *           Popular Music 6/1, 1987). It only works because there is nothing
 *           else to attend to, which is why it is exclusive and why it is the
 *           one intro that is not thinned.
 *   bed     the foundation without the tune: the chord progression, or the
 *           chords and the beat, "one or more times through and then starting
 *           the vocals" (planetarygroup.com, "Five Different Types of
 *           Introductions"). What it withholds is the tune, and the tune's
 *           arrival is what the intro was for.
 *   hook    the tune from bar one — "don't bore us, get to the chorus", the
 *           modern short intro (ibid.), and the one the attention-economy
 *           numbers point at: intros fell from over twenty seconds to about
 *           five between 1986 and 2015 (Léveillé Gauvin, Musicae Scientiae
 *           22(3), 2018).
 */
export const INTRO_KINDS = ["rhythm", "bed", "hook"] as const;
export type IntroKind = (typeof INTRO_KINDS)[number];

/**
 * THE TREATMENTS: every change to a section that leaves the notes alone.
 *
 * Named here rather than in `stage/treat.ts` for the same reason every other
 * closed set is named here — a genre states its own weights over them, and a
 * genre may not import a stage. What each one DOES to a desk is that file's;
 * this is only the vocabulary.
 *
 * They come in pairs that pull opposite ways, because a record that can only
 * ever get darker is not developing, it is decaying.
 */
export const TREATMENTS = [
  "darken", "brighten",
  "drench", "dry",
  "push", "ease",
  "widen", "close",
  "far", "sweep",
  "wear", "echoed",
] as const;
export type Treatment = (typeof TREATMENTS)[number];

export interface ArrangementSpec {
  /**
   * The order the parts arrive in across a record. Every part appears exactly
   * once — a part left out would never enter, and that is refused at load.
   */
  readonly enter?: readonly Role[];
  /** How many of them, from the front of `enter`, an intro holds. */
  readonly introParts?: number;
  /** Which kind of intro the record opens with, drawn per record. */
  readonly intro?: Weighted<IntroKind>;
  /**
   * THE BREAK: one section, below the floor, carrying what the record opened
   * with and nothing else.
   *
   * A breakdown is "a section of a song in which various instruments have solo
   * parts (breaks)", made by "stripping away of other instruments and vocals"
   * to create contrast; it sits where a bridge would, "after the second
   * chorus", and breakdowns "usually precede or follow heightened musical
   * climaxes" (en.wikipedia.org/wiki/Breakdown_(music)). Tom Moulton's disco
   * break is the rhythm-only case of it.
   *
   * It is the one place a section may fall below `fewest`, and it is why:
   * without it nothing in a record is ever heard with room round it, because
   * the floor holds every section at three parts or more.
   */
  readonly breakdown?: boolean;
  /**
   * The fewest parts any section outside the intro carries. A section's
   * energy decides how many of the parts that have arrived actually play,
   * between this and all of them; the peak always has all of them.
   */
  readonly fewest?: number;
  /**
   * THE ORDER PARTS LEAVE IN, first to go first. Not the reverse of `enter`,
   * which is what it used to be: parts arrive foundation-first, so reversing
   * that order sheds the TUNE before the pad, and a record that drops its
   * melody to get quieter has lost the thing an ear was following. Which part
   * a genre can most afford to lose is the genre's to say.
   */
  readonly shed?: readonly Role[];
  /**
   * Each section after the intro lets one more part in, until a section at
   * or above this energy wants all of them at once. From then on every part
   * is heard until the outro.
   */
  readonly fullAbove?: number;
  /** Below this energy a section's drums lose their hat. */
  readonly thinBelow?: number;
  /**
   * HOW MUCH WITHHOLDING IT TAKES BEFORE GIVING IS WORTH MORE THAN TAKING,
   * in part-turns.
   *
   * The arrangement keeps a debt: a span quieter than the fullest the record
   * has yet been accrues part-turns, and a span fuller than the one before
   * it pays them off. How willing it is to give is owed/(owed + rest), which
   * slides from nothing to everything as the debt grows. That ratio is the
   * only number in the whole selector, and it is not a taste: one part gone
   * for exactly the span the two-loop rule names is (1/5) x 2 = 0.4
   * part-turns, so 0.4 states that one part missing for the length the rule
   * names is precisely half a reason to give it back.
   * [musictech.com two-loop-rule; musicradar.com
   * two-loop-rule-arrangement-cheatcode — the same sources the two-loop
   * clock already carries]
   */
  readonly rest?: number;
  /**
   * WHICH NOTE-PRESERVING CHANGES THIS GENRE WILL MAKE TO A SECTION, and how
   * readily.
   *
   * The two-loop rule names four ways to change an arrangement — an instrument
   * in, an instrument out, expression up, expression down — and this program
   * could only ever do the first three, reading "expression" as the drums'
   * hat. So a section could be made emptier or fuller and nothing else, and a
   * record that wanted to develop without losing anything had no move at all.
   *
   * These are the rest of the vocabulary: a section darker, wetter, wider,
   * further off, harder through the board, more worn. Every one leaves the
   * notes exactly where they were, which is what lets an idea come back a
   * fourth and fifth time and still arrive different — and what stops the rule
   * of three having to be paid for in material nobody hears twice.
   *
   * A genre states which of them are its own. Dungeon synth's development is
   * "changes in reverb and filters" (note.com/soundwitches) and it should
   * lean there; a genre that brightens its way through a record it built dark
   * has spent its identity to satisfy a counter. Weight 0 removes one.
   */
  readonly treat?: Weighted<Treatment>;
}

export interface ArrangementRules {
  readonly enter: readonly Role[];
  readonly introParts: number;
  readonly intro: Weighted<IntroKind>;
  readonly breakdown: boolean;
  readonly fewest: number;
  readonly shed: readonly Role[];
  readonly fullAbove: number;
  readonly thinBelow: number;
  readonly rest: number;
  readonly treat: Weighted<Treatment>;
}

/** Which pairs of notes swing: every two eighths, or every two sixteenths. */
export const SWING_GRIDS = [8, 16] as const;
export type SwingGrid = (typeof SWING_GRIDS)[number];

export interface FeelSpec {
  /**
   * Swing as a drum machine states it: the share of each pair's time the
   * first note gets, in percent. 50 is straight, 66.7 is a triplet (the
   * second note lands two thirds of the way through), 75 is dotted. Hip hop
   * machines sit at 54–62.
   */
  readonly swing?: number;
  /** The grid the pairs are on: 16 swings every second sixteenth, 8 every second eighth. */
  readonly swingGrid?: SwingGrid;
  /** How far a hand misses the grid either way, in milliseconds. */
  readonly jitterMs?: number;
  /**
   * WHERE EACH PART SITS AGAINST THE BEAT, in milliseconds, consistently.
   * Positive is behind it — laid back; negative is ahead — pushed. Keyed by
   * part, or by drum lane, which wins over the part: the whole of what a
   * laid-back drummer does is put the SNARE late against a kick that is not,
   * and a lean applied to the kit entire would move the beat rather than
   * lean on it.
   *
   * This is not jitter and does not replace it. Jitter is a hand missing;
   * this is where the hand was aiming.
   */
  readonly lean?: Readonly<Partial<Record<Role | DrumLane, number>>>;
  /**
   * 0..1: how much the metre's own hierarchy shapes a note's weight. At 0
   * every position weighs the same and the record is a machine; at 1 the
   * weakest sixteenth is a fifth of the downbeat. An instrument with no
   * touch — an organ, whose pipes do not care how a key is pressed — says
   * a low number and means it.
   */
  readonly accent?: number;
  /** 0..1: how much a hand misses the weight it meant, either way. */
  readonly velocityJitter?: number;
  /**
   * 0..1: how much a PHRASE is shaped — how far the weight rises toward the
   * height of a phrase and falls away after it. At 0 a phrase is flat and
   * only the metre and the record's arc move a note's weight.
   */
  readonly phrase?: number;
}

export interface FeelRules {
  readonly swing: number;
  readonly swingGrid: SwingGrid;
  readonly jitterMs: number;
  readonly lean: Readonly<Partial<Record<Role | DrumLane, number>>>;
  readonly accent: number;
  readonly velocityJitter: number;
  readonly phrase: number;
}

/** The instruments a pitched part may be played on. */
export const VOICES = ["rhodes", "sub", "pluck", "organ", "pad", "flute"] as const;
export type VoiceName = (typeof VOICES)[number];

/**
 * WHAT EACH INSTRUMENT CAN PHYSICALLY DO. Not taste — mechanics. A struck
 * piano cannot bend a note it has already struck, and a hammer that has
 * fallen cannot be un-struck into a slur; a string and a column of air can do
 * both, because the player is still touching the note while it sounds. A
 * genre may weight these however it likes and may not add to them.
 *
 * Every instrument can be struck plain, held, cut short, leant on, or left to
 * ring, so those are not listed: they are the floor, and they are only weight
 * and length. Laissez vibrer is on that floor because it asks nothing of the
 * player at all — it is the absence of the damping every other manner does.
 */
export const FLOOR: readonly ArtName[] = Object.freeze(["plain", "tenuto", "staccato", "marcato", "accent", "ring"]);

export const CAN: Readonly<Record<VoiceName, readonly ArtName[]>> = Object.freeze({
  /** Tines, struck. Weight and length only — and a dead-key thud for a ghost. */
  rhodes: ["ghost"],
  /** A synthesised sub: the oscillator's pitch is a knob, so it can be slid into. */
  sub: ["ghost", "slide", "slur"],
  /** A string, still under the finger: everything a guitarist writes in a tab. */
  pluck: ["ghost", "slur", "slide", "bend", "tremolo"],
  /** Pipes and a key. They do not care how the key was pressed. */
  organ: [],
  /** A pad is bowed, not struck: it can be slurred, and it can swell. */
  pad: ["slur"],
  /**
   * Breath and fingers: it can be slurred, bent and slid, and tongued into a
   * tremolo. And it can ghost — "wind instruments, including the human voice,
   * and guitars are examples of instruments generally capable of ghosting
   * notes without making them synonymous with rests"
   * (en.wikipedia.org/wiki/Ghost_note), done by "greatly reducing the airflow
   * into the instrument while fingering the ghosted note"
   * (jazzedmagazine.com, "Learning to Play Ghosted Notes").
   */
  flute: ["ghost", "slur", "slide", "bend", "tremolo"],
});

/** What a kit can do to one hit. A drum is struck; how hard, and how dead. */
export const CAN_DRUM: readonly ArtName[] = Object.freeze(["ghost", "accent", "tremolo"]);

/** How often a part reaches for each manner. What is not named is never played. */
export type ArtSpec = Weighted<ArtName>;

/**
 * THE RACK. Every unit the record can pass through, in the order it passes
 * through them, each with the two or three knobs the real box had. A genre
 * states where every knob sits; the page may move any of them for one
 * rendering without touching the genre. Mixes are 0..1 and 0 is bypass.
 */
export interface RackSpec {
  /** A resonant lowpass at the top of the chain. */
  readonly pole?: { readonly hz?: number; readonly resonance?: number; readonly mix?: number };
  /** The wet units are RETURNS: parts feed them by their sends, and `ret` is how loud each comes back. */
  readonly flange?: { readonly rateHz?: number; readonly depth?: number; readonly ret?: number };
  /** The ensemble of a multi-effect: three detuned copies on slow sweeps. */
  readonly ensemble?: { readonly rateHz?: number; readonly depth?: number; readonly ret?: number };
  /** A delay in beats, fed back on itself. */
  readonly echo?: { readonly beats?: number; readonly feedback?: number; readonly ret?: number };
  readonly spring?: { readonly sec?: number; readonly ret?: number };
  readonly room?: { readonly sec?: number; readonly ret?: number };
  /** Where the top end stops, the slow wobble, and the drive into the saturator. */
  readonly tape?: { readonly lowpassHz?: number; readonly wowHz?: number; readonly wowCents?: number; readonly drive?: number };
  /** Heard through a gramophone horn or a small radio, by this much. */
  readonly medium?: { readonly kind?: "gramophone" | "radio"; readonly mix?: number };
  /** Dust on the record; 0.08 is about −22 dB. */
  readonly vinyl?: { readonly crackle?: number };
  /** The last gain, 0..1 of the −1 dBTP ceiling. */
  readonly master?: { readonly level?: number };
}

type Total<T> = { readonly [K in keyof T]-?: Required<NonNullable<T[K]>> };
export type RackRules = Total<RackSpec>;
export const RACK_ORDER = ["pole", "flange", "ensemble", "echo", "spring", "room", "tape", "medium", "vinyl", "master"] as const satisfies readonly (keyof RackSpec)[];

/** The wet units a part may be sent to, in the rack. */
export const SENDS = ["echo", "spring", "room", "ensemble", "flange"] as const;
export type Send = (typeof SENDS)[number];

/**
 * A channel of the mixer: one per part. Level and pan are where it sits;
 * the sweep is a slow pan that moves; `pedals` is how much of it goes
 * through the pedal board; the sends feed the rack's wet units. `az` and
 * `dist` are its place in the world — degrees round the listener, with 0
 * ahead and 90 to the right, and a distance from 0 (at the ear) to 1.
 */
export interface ChannelSpec {
  readonly level?: number;
  readonly pan?: number;
  readonly sweepHz?: number;
  readonly sweepDepth?: number;
  readonly pedals?: number;
  readonly sends?: Readonly<Partial<Record<Send, number>>>;
  readonly az?: number;
  readonly dist?: number;
}
export interface ChannelRules {
  readonly level: number;
  readonly pan: number;
  readonly sweepHz: number;
  readonly sweepDepth: number;
  readonly pedals: number;
  readonly sends: Readonly<Record<Send, number>>;
  readonly az: number;
  readonly dist: number;
}

/**
 * THE WORLD: the record in space rather than on a line between two
 * speakers. A part placed round the listener arrives at the far ear later
 * (up to about 0.65 ms, Woodworth's head model) and duller (the head's
 * shadow), and a distant part is quieter, duller and more in the room.
 * `width` scales all of it; at 0 the world is a mono record.
 */
export interface WorldSpec {
  readonly width?: number;
  /** How much a part's distance darkens it and sends it to the room, 0..1. */
  readonly depth?: number;
}
export type WorldRules = Required<WorldSpec>;

/**
 * THE PEDAL BOARD, in the order a signal walks it. Mix 0 is a pedal switched
 * off — and off a board, not bypassed on it: a pedal at 0 is never built.
 *
 * THE ORDER IS A REAL BOARD'S, and every step of it is somebody's reason.
 * COMP first, because an OTA compressor is levelling the instrument and not
 * the effects. The WAH ahead of the dirt, where a filter belongs. The SUB
 * before it too, because a divider clocks off zero crossings and a fuzzed
 * signal has crossings everywhere — pitch tracking goes in front of
 * distortion on any board. Then the OCTAVE, so its rectified harmonics are
 * what gets clipped, which is what a Super-Fuzz does internally. Then the
 * dirt, the FUZZ FACE before the MUFF because stacking a Face into a Muff is
 * the ordinary sludge move and not the reverse — the Face is the raw one and
 * the Muff is the compressor and the tone stack after it. The CHAINSAW late,
 * because on an HM-2 the EQ section IS the sound: it is the last voicing
 * anything sees rather than a drive feeding another drive. The SAG last of
 * the dirt, because a supply squishes what the circuit in front of it draws.
 * Modulation at the end, where a phaser and a tremolo sit on every board that
 * has them.
 */
export interface PedalsSpec {
  /** An MXR Dyna Comp: how hard it squashes, and the makeup that lifts what is left. */
  readonly comp?: { readonly sustain?: number; readonly level?: number; readonly mix?: number };
  readonly wah?: { readonly rateHz?: number; readonly depth?: number; readonly mix?: number };
  /**
   * An octave DIVIDER. `two` slides the flip-flops from one octave down to
   * two, `gate` is how loud the input must be before it clocks at all, and
   * `tone` tames the square it makes. Its mix ADDS under the dry: the pedal
   * supplies the octave and the note keeps its own pitch.
   */
  readonly sub?: { readonly two?: number; readonly gate?: number; readonly tone?: number; readonly mix?: number };
  /** A Super-Fuzz's upper octave: a full-wave rectifier, added under the dry. */
  readonly octave?: { readonly mix?: number };
  /** A Fuzz Face. `bias` starves it, and a starved Fuzz Face gates. */
  readonly meat?: { readonly dirt?: number; readonly bias?: number; readonly dark?: number; readonly level?: number; readonly mix?: number };
  /** A Big Muff Pi, with the two knobs every sludge Muff on the market adds: MIDS and MASS. */
  readonly muff?: {
    readonly sustain?: number; readonly tone?: number; readonly level?: number;
    readonly cabHz?: number; readonly mids?: number; readonly mass?: number; readonly mix?: number;
  };
  readonly overdrive?: { readonly drive?: number; readonly tone?: number; readonly mix?: number };
  readonly fuzz?: { readonly gain?: number; readonly mix?: number };
  /** A Boss HM-2. `low` and `high` are the gyrators, and dimed is the setting. */
  readonly saw?: {
    readonly dist?: number; readonly low?: number; readonly high?: number;
    readonly gate?: number; readonly tameHz?: number; readonly level?: number; readonly mix?: number;
  };
  /** The power supply: a static starve (`idle`) and a dynamic droop (`depth`, `recovSec`). */
  readonly sag?: { readonly depth?: number; readonly idle?: number; readonly recovSec?: number; readonly draw?: number; readonly mix?: number };
  readonly phaser?: { readonly rateHz?: number; readonly depth?: number; readonly mix?: number };
  readonly tremolo?: { readonly rateHz?: number; readonly depth?: number; readonly mix?: number };
}
export type PedalsRules = Total<PedalsSpec>;
export const PEDAL_ORDER = [
  "comp", "wah", "sub", "octave", "meat", "muff", "overdrive", "fuzz", "saw", "sag", "phaser", "tremolo",
] as const satisfies readonly (keyof PedalsSpec)[];

/**
 * THE PEDALS THAT ADD RATHER THAN REPLACE. A fuzz is a crossfade — the wet is
 * what the dry BECAME — but an octave is a second voice beside the note, and
 * crossfading it takes away the note it was made from. So the board sums
 * these two under the dry and blends the rest, which is how the two pedals
 * are wired on a floor.
 */
export const PEDALS_ADD: readonly (keyof PedalsSpec)[] = Object.freeze(["sub", "octave"]);

/**
 * THE PATCH: the returns feeding each other. `patch[from][to]` is how much
 * of `from`'s output goes into `to`'s input — echo into the spring, the
 * spring into the room, the room back into the echo, or a unit into
 * itself. A dub desk. Feedback is real and one sample deep, held under
 * full scale in the loop and kept off DC, so a patch cannot run away.
 */
export type PatchSpec = Readonly<Partial<Record<Send, Readonly<Partial<Record<Send, number>>>>>>;
export type PatchRules = Readonly<Record<Send, Readonly<Record<Send, number>>>>;

/** The kits the drum machine can be loaded with. A kit is a lane-to-voice map. */
export const KIT_NAMES = ["acoustic", "analog"] as const;
export type KitName = (typeof KIT_NAMES)[number];

/** Which analogue engine the machine's voices are: two circuits, two instruments. */
export const CIRCUITS = ["808", "909"] as const;
export type Circuit = (typeof CIRCUITS)[number];

/**
 * ONE CHANNEL OF THE MACHINE, one per lane — the six knobs the TR-1000 puts on
 * a strip. TUNE and DECAY are OFFSETS on top of whatever the circuit already
 * decided, both neutral at their defaults, so a genre that says nothing plays
 * what it played before. The CTRLs on the real box are assignable; here they
 * are wired to the strip's filter and its sends, and the cap says so rather
 * than copying the ink.
 */
export interface StripSpec {
  /** Semitones, an offset. On a recording this is a playback rate: speed IS pitch. */
  readonly tune?: number;
  /** A multiplier on how long the drum rings. */
  readonly decay?: number;
  /** The fader. */
  readonly level?: number;
  /** The strip's own lowpass, in hertz. 20000 is open. */
  readonly cut?: number;
  /** The machine's individual outputs: this lane's own feed to each return. */
  readonly sends?: Readonly<Partial<Record<Send, number>>>;
}
export interface StripRules {
  readonly tune: number;
  readonly decay: number;
  readonly level: number;
  readonly cut: number;
  readonly sends: Readonly<Record<Send, number>>;
}

/**
 * THE DRUM MACHINE. One box, two kits, one panel: which voices are loaded is a
 * setting and not a different machine, and the strips, the drive and the
 * filter belong to the box whatever is loaded into it.
 *
 * The voicing knobs are the analogue engine's own — they are what a TR-1000's
 * front panel is — and the acoustic kit reads TUNE and DECAY through its
 * strips, as a sampler channel does. Nothing here is drawn per song: a genre
 * states where the knobs sit and the page moves them for one rendering.
 */
export interface MachineSpec {
  readonly kit?: KitName;
  readonly circuit?: Circuit;
  /** The bass drum: where it is tuned, how long it rings, its click, its weight. */
  readonly tune?: number;
  readonly decay?: number;
  readonly tone?: number;
  readonly punch?: number;
  /** The snare: how much wire, and where the band sits. */
  readonly snappy?: number;
  readonly sdtone?: number;
  /** The hats, closed and open, in seconds. */
  readonly chdecay?: number;
  readonly ohdecay?: number;
  /** ANALOG FX: one drive and one filter across the whole kit. */
  readonly drive?: number;
  readonly filterHz?: number;
  readonly channels?: Readonly<Partial<Record<DrumLane, StripSpec>>>;
}
export interface MachineRules {
  readonly kit: KitName;
  readonly circuit: Circuit;
  readonly tune: number;
  readonly decay: number;
  readonly tone: number;
  readonly punch: number;
  readonly snappy: number;
  readonly sdtone: number;
  readonly chdecay: number;
  readonly ohdecay: number;
  readonly drive: number;
  readonly filterHz: number;
  readonly channels: Readonly<Record<DrumLane, StripRules>>;
}

export interface SoundSpec {
  readonly voices?: Readonly<Partial<Record<PitchedRole, VoiceName>>>;
  readonly rack?: RackSpec;
  readonly mix?: Readonly<Partial<Record<Role, ChannelSpec>>>;
  readonly world?: WorldSpec;
  readonly pedals?: PedalsSpec;
  readonly patch?: PatchSpec;
  readonly machine?: MachineSpec;
}

export interface SoundRules {
  readonly voices: Readonly<Record<PitchedRole, VoiceName>>;
  readonly rack: RackRules;
  readonly mix: Readonly<Record<Role, ChannelRules>>;
  readonly world: WorldRules;
  readonly pedals: PedalsRules;
  readonly patch: PatchRules;
  readonly machine: MachineRules;
}

/** What an author writes. */
export interface GenreSpec {
  /** How this genre is named on screen. */
  readonly label: string;

  /** Build on another genre, overriding only what differs. Deep. */
  readonly extend?: string;

  /** Drawn per song, inclusive of both ends. */
  readonly tempo?: readonly [number, number];

  /** How a bar is divided. */
  readonly metre?: Metre;

  /** The scales a song may stand in, by weight. */
  readonly scales?: Weighted<ScaleName>;

  /** How long a record runs when nobody asks for a length, in seconds. */
  readonly lengthSec?: readonly [number, number];

  /** How the sections are laid out. */
  readonly form?: FormSpec;

  readonly harmony?: HarmonySpec;
  readonly bass?: BassSpec;
  readonly keys?: KeysSpec;
  readonly lead?: LeadSpec;
  readonly drone?: DroneSpec;
  readonly drums?: DrumsSpec;
  readonly arrangement?: ArrangementSpec;
  readonly feel?: FeelSpec;
  readonly sound?: SoundSpec;

  /** Field path -> where its value came from. */
  readonly sources?: Sources;
}

/** What the program reads. Every field final. */
export interface Genre {
  readonly name: string;
  readonly label: string;
  readonly tempo: readonly [number, number];
  readonly metre: Metre;
  readonly scales: Weighted<ScaleName>;
  readonly lengthSec: readonly [number, number];
  readonly form: FormRules;
  readonly harmony: HarmonyRules;
  readonly bass: BassRules;
  readonly keys: KeysRules;
  readonly lead: LeadRules;
  readonly drone: DroneRules;
  readonly drums: DrumsRules;
  readonly arrangement: ArrangementRules;
  readonly feel: FeelRules;
  readonly sound: SoundRules;
  readonly sources: Sources;
}

/**
 * The one place a default lives.
 *
 * A genre that declares nothing gets these, and they are stated once so that
 * "what does this genre do about X" is answerable from the resolved table
 * alone.
 */
export const DEFAULTS: Omit<Genre, "name" | "label" | "sources"> = {
  tempo: [90, 120],
  metre: { beats: 4, perBeat: 4 },
  scales: [
    ["minor", 3],
    ["major", 2],
    ["dorian", 1],
  ],
  lengthSec: [180, 240],

  form: {
    /**
     * A length is a POOL, and squareness is a strong default rather than the
     * only option. One number per function gives a record in which every
     * section is the same length — which is what "always too safe and
     * formulaic" sounds like, and no amount of variation inside a block fixes
     * a record whose blocks are identical.
     *
     * 8 and 16 are both ordinary in popular form and 12 is a blues, so the
     * pool is conventional rather than adventurous. [chosen] — these weights
     * are convention, not measurement.
     */
    lengths: {
      intro: [
        [4, 3],
        [8, 2],
      ],
      verse: [
        [16, 6],
        [8, 3],
        [12, 1],
      ],
      chorus: [
        [16, 6],
        [8, 3],
      ],
      bridge: [
        [8, 4],
        [16, 2],
        [4, 1],
      ],
      instrumental: [
        [16, 4],
        [8, 3],
      ],
      outro: [
        [8, 3],
        [4, 2],
        [16, 1],
      ],
    },

    /** Which idea each kind of section states. */
    idea: {
      intro: "A",
      verse: "A",
      chorus: "B",
      bridge: "C",
      instrumental: "A",
      outro: "A",
    },

    /** How big each kind of section is meant to feel, 0..1. */
    energy: {
      intro: 0.25,
      verse: 0.55,
      chorus: 0.9,
      bridge: 0.4,
      instrumental: 0.7,
      outro: 0.3,
    },

    /**
     * What may follow what. [chosen] — conventional weights for a
     * verse-chorus form, with `outro` reached by the walk running out of
     * budget rather than by being drawn.
     */
    next: {
      intro: [
        ["verse", 6],
        ["chorus", 1],
      ],
      verse: [
        ["chorus", 6],
        ["verse", 2],
        ["instrumental", 1],
      ],
      chorus: [
        ["verse", 5],
        ["instrumental", 2],
        ["bridge", 2],
        ["chorus", 1],
      ],
      bridge: [
        ["chorus", 6],
        ["verse", 2],
      ],
      instrumental: [
        ["chorus", 4],
        ["verse", 3],
        ["bridge", 1],
      ],
      outro: [["outro", 1]],
    },

    introChance: 0.75,
    /**
     * TWELVE SECONDS. The measured trend runs from over twenty in the
     * mid-eighties to about five now (Léveillé Gauvin 2018), and Ewer's
     * ceiling for a plain chord intro is "no more than 10 seconds, tops" —
     * so a default that lets a record take a breath without spending a
     * quarter of a minute on it sits just above his line. [chosen] inside
     * the range the two sources bound. A genre whose whole texture is an
     * intro says its own.
     */
    introSec: 12,
  },

  harmony: {
    bars: 4,
    /** No genre extends past the seventh unless it says so. [chosen] */
    ninths: 0,
    /**
     * Two. A motif shorter than the idea is what gives a four-bar loop an
     * inside; equal to it, the idea is one long gesture and nothing within
     * it comes back. Two bars is the cell loop-based music is built from.
     * [chosen, against the two-bar progressions the genres already weight]
     */
    motif: 2,
    /**
     * Degrees from the tonic, one per bar. A stays close to home; B opens
     * off the tonic so the chorus moves the floor; C leaves further, which
     * is what a bridge is for. [chosen] — conventional changes, unmeasured.
     */
    progressions: {
      A: [
        [[0, 5, 3, 4], 3],
        [[0, 3, 4, 0], 2],
        [[0, 4, 5, 3], 2],
        [[0, 0, 5, 5], 1],
        [[0, 5], 1],
      ],
      B: [
        [[5, 3, 0, 4], 3],
        [[3, 4, 0, 0], 2],
        [[5, 5, 0, 4], 2],
        [[3, 3, 0, 0], 1],
      ],
      C: [
        [[3, 3, 0, 0], 2],
        [[5, 4, 3, 4], 2],
        [[1, 4, 0, 0], 1],
        [[2, 5, 3, 4], 1],
      ],
    },
    sevenths: 0.3,
    /** none: a bare fifth is a colour a genre reaches for on purpose */
    fifths: 0,
    diminished: "allow",
  },

  bass: {
    register: [36, 50],
    /** in beats: one-and-three is the strong default */
    pocket: [
      [[0, 2], 4],
      [[0, 1.5, 2], 2],
      [[0, 2, 3.5], 2],
      [[0], 1],
      [[0, 1, 2, 3], 1],
    ],
    tones: [
      ["root", 4],
      ["fifth", 3],
      ["approach", 2],
      ["third", 1],
      ["octave", 1],
    ],
    /**
     * THE DEFAULTS REACH ONLY FOR THE FLOOR — the manners every instrument
     * can make, which are the ones that only change weight and length. A
     * genre picks its own voices, and a default that assumed a string would
     * be refused at load the moment a genre put an organ on the part. What a
     * particular instrument can do beyond this is the genre's to say, with
     * its own sources, because only the genre knows what it is holding.
     */
    art: [
      ["plain", 10],
      ["tenuto", 3],
      ["staccato", 2],
    ],
  },

  keys: {
    register: [52, 76],
    /** in beats */
    strike: [
      [[0], 3],
      [[0, 2], 3],
      [[0, 1.5, 2], 1],
      [[0, 1, 2, 3], 1],
    ],
    open: 0.5,
    /**
     * Tines, struck, and that is nearly all a Rhodes will do. What is left is
     * how long the key is held: legato is 100% of the written value with "no
     * intervening silence", tenuto 95%, an unmarked note 80%, staccato "about
     * 50% of its notated value" (cmuse.org/staccato-length-calculator;
     * en.wikipedia.org/wiki/Legato). Weights [chosen].
     */
    art: [
      ["plain", 6],
      ["tenuto", 5],
      ["staccato", 2],
    ],
  },

  lead: {
    register: [64, 84],
    /**
     * In beats across a two-bar phrase. Each cell leaves the second bar's end
     * open so the phrase breathes before the next one. [chosen]
     */
    rhythms: [
      [[0, 1, 2, 3, 4, 5, 6], 3],
      [[0, 0.5, 1, 2, 3, 4, 4.5, 5], 3],
      [[0, 1.5, 2, 3.5, 4, 5], 2],
      [[0.5, 1, 2, 2.5, 4, 4.5, 5, 6], 2],
      [[0, 2, 3, 4, 6], 1],
      [[0, 0.5, 1.5, 2, 3, 4.5, 5, 6.5], 1],
    ],
    /**
     * A quarter of moves leap. Pop verses and folk song run about seventy
     * percent steps and fifteen percent leaps, and stepwise motion is the
     * preferred motion in every repertoire measured (cmuse.org
     * leap-to-step ratio; Daikoku 2018, doi:10.1371/journal.pone.0196493).
     * With chord tones drawn on the beats the line lands near 75% steps.
     */
    leap: 0.25,
    span: 12,
    /**
     * Statement, restatement, departure, return is the sentence a sixteen-bar
     * section most often is. A cycle of rest is offered but rare: the tune
     * stepping out for four bars is a breath, and two breaths is an absence.
     * [chosen]
     */
    cycles: [
      [["A", "A", "B", "A"], 4],
      [["A", "B", "A", "B"], 2],
      [["A", "A", "B", "B"], 1],
      [["A", ".", "A", "B"], 1],
      [["A", "B", ".", "A"], 1],
    ],
    /**
     * The tune is the part with a player's hand still on it, so it is the
     * part that carries most of the manner. A hammer-on or pull-off "removes
     * the sound of the pick attack, yielding a softer, more rounded tone",
     * and a passage full of them is a legato phrase
     * (en.wikipedia.org/wiki/Hammer-on); a bend "increases the pitch of a
     * note" by displacing the string (en.wikipedia.org/wiki/String_bending).
     * A guitar tab is written almost entirely in these four marks; the
     * pitches under them are often few. Weights [chosen].
     */
    art: [
      ["plain", 8],
      ["tenuto", 3],
      ["accent", 2],
      ["staccato", 2],
    ],
    /**
     * Mostly stepwise, because stepwise motion is the preferred motion in
     * every repertoire measured, but not only: a tune that can only walk is
     * as narrow as one that can only leap. [chosen] among the three.
     */
    contour: [
      ["sung", 5],
      ["riff", 2],
      ["chant", 1],
    ],
    /**
     * Mostly the figure again, exactly — that is what a loop is for, and the
     * thing an ear holds. But a third of the time the second turn is the
     * first CHANGED, which is Caplin's presentation phrase and the smallest
     * unit of "repetition with a small difference" a record has. [chosen]
     */
    shape: [
      ["loop", 2],
      ["sentence", 1],
    ],
    /**
     * THREE ONSETS, RESTATED TWO TIMES IN THREE. A hook is a figure that
     * comes back, and Burns's own examples are of a phrase "repeated
     * immediately" inside a verse ('Groovin''), or repeated "with a
     * variation" ('How Can I Be Sure') — a hook within a verse, not across
     * one. Three onsets is the shortest thing an ear can hold as a figure
     * rather than a pair of notes; the length and the share are [chosen]
     * inside what the source describes, which names the operation and not a
     * number.
     */
    motif: { notes: 3, restate: 0.66 },
    /**
     * Huron's ranking, as weights: the arch is the commonest shape in the
     * folksong corpora, then the descent, then the rise, with the concave
     * shape rarest ("The Melodic Arch in Western Folksongs", 1996). The
     * ratios between them are [chosen]; the order is measured.
     */
    arc: [
      ["arch", 4],
      ["descending", 3],
      ["ascending", 2],
      ["concave", 1],
    ],
    /**
     * HALF THE TUNES PLANT ONE. A wide interval is what makes a line
     * distinctive — "any interval larger than a perfect fifth seems
     * distinctive" (Burns 1987) — and the earworm work finds the same thing
     * from the other end: a conventional contour with an unusual gradient
     * between its turning points. A tune with none is plain; every tune
     * having one would make it the convention it is supposed to break.
     * [chosen] at a half.
     */
    signature: 0.5,
  },

  drone: {
    /**
     * Low and out of the way of everything that moves. A drone "may last
     * through the whole piece" and sits "upon the tonic or dominant"
     * (chromatone.center, "Drone"), so it holds a whole four-bar statement
     * more often than not.
     */
    register: [51, 65],
    tone: [
      ["tonic", 5],
      ["fifth", 2],
    ],
    /**
     * THE TANPURA'S FOUR, in its own order: the fifth, two tonics, then the
     * deep one. "Normally the fifth (Pa) and the root tonic (Sa)", with a
     * tonic string "an octave below the others, adding greater resonance and
     * depth". Thinner tunings are offered for a genre that does not want four
     * strings ringing at once.
     */
    strings: [
      [["fifth", "tonic", "tonic", "low"], 5],
      [["tonic", "fifth"], 2],
      [["tonic", "low"], 1],
    ],
    /**
     * A string every two bars, and a bar's pause closing the turn — "the
     * pattern repeats after a slightly longer pause".
     *
     * TWO BARS AND NOT ONE, because how many strings ring TOGETHER is
     * ceil(hold / every), and this program gives a ringing pitch an exclusive
     * seat. At one bar apart, four strings held four bars each meant the
     * drone owned four seats without pause, in a register that overlaps the
     * pad's — and the pad, which is drawn after it, ran out of voicings
     * that cleared it and landed on the drone's own F4. Two bars apart, two
     * ring, which is still an overlap and still a drone.
     * [chosen, from the cited cycle and this program's own seat model]
     */
    pluck: { every: 2, rest: 1 },
    hold: [
      [4, 4],
      [2, 2],
      [1, 1],
    ],
    /**
     * A plucked string is left to ring. Nothing damps a drone string between
     * plucks, so it holds every step it is written for and the next pluck
     * takes over from it — which is why the manner here is laissez vibrer and
     * not tenuto, whose missing twentieth is a gap in the one part that must
     * not have one.
     */
    art: [
      ["ring", 6],
      ["tenuto", 1],
    ],
  },

  drums: {
    /** in beats */
    kick: [
      [[0, 2], 4],
      [[0, 2.5], 2],
      [[0, 1.5, 2.5], 2],
      [[0, 0.75, 2], 1],
      [[0, 1, 2, 3], 1],
    ],
    snare: [
      [[1, 3], 6],
      [[1, 3, 3.75], 1],
      [[1.5, 3], 1],
    ],
    hat: [
      [0.5, 5],
      [0.25, 2],
      [1, 1],
      [0, 1],
    ],
    /**
     * THREE THE SAME, THEN A CHANGE. "You can repeat your pattern for several
     * bars, and at the end of a four-bar sequence, you can shake up the
     * pattern and change things for one last bar" (thedrumninja.com,
     * how-to-program-drum-machine-patterns) — the rule of three at the length
     * of a phrase, and the opposite of what these weights used to say. The
     * likeliest draw was `A B A C`, which changes on the SECOND bar of four:
     * a beat that changes every other bar has not stated itself before it
     * departs, and there is nothing for the fill at the end of the phrase to
     * be a departure FROM.
     *
     * Still no pure loop: four A's is a thing a genre may want and has to
     * say. Offered here it was drawn one cycle in ten, and two in a row
     * turned a sixteen-bar chorus into four bars four times.
     */
    phrase: [
      [["A", "A", "A", "D"], 5],
      [["A", "A", "A", "B"], 3],
      [["A", "A", "B", "D"], 2],
      [["A", "B", "A", "C"], 1],
      [["A", "B", "C", "D"], 1],
    ],
    /**
     * A kit's manner is how hard, and how dead. Ghost notes sit at 30–50 of a
     * scale whose ordinary hits are 90–100 — "well below half" — and accents
     * at 100 and over (blog.samplefocus.com how-to-produce-ghost-notes-for-
     * organic-drums; mastering.com program-realistic-midi-drums). "A strong
     * accent sounds stronger when it is surrounded by softer notes", which is
     * the reason to have both rather than one. Which HIT gets which is not
     * drawn from here — the metre decides that, in the builder. These are the
     * weights for the hits the metre leaves open. [chosen]
     */
    art: [
      ["plain", 8],
      ["ghost", 3],
      ["accent", 2],
    ],
    /**
     * TWO. The documented practice is that the pattern REPEATS and the change
     * comes at the end of the phrase: "repeat your pattern for several bars,
     * and at the end of a four-bar sequence ... change things for one last
     * bar", with bigger changes at 2, 4 and 8 bars (thedrumninja.com
     * how-to-program-drum-machine-patterns; edmprod.com/drums-guide). The
     * letters already put that break inside a phrase; this says how many
     * phrases a record has to cycle through. Drawing a fresh one every time
     * round gave a sixty-four-bar record sixteen different beats, and a beat
     * heard once is not a beat.
     */
    treatments: 2,
  },

  arrangement: {
    /** the chord first, then the beat under it, the bass, and the tune last */
    enter: ["keys", "drums", "bass", "lead", "drone"],
    introParts: 2,
    /**
     * TWO. "Five elements at one time — counting the drums as one — is
     * generally the most you'll hear (sometimes six)"
     * (soundonsound.com/techniques/arranging-pop), and this program has
     * exactly five parts: everyone playing is already that maximum, so it
     * belongs to the peak and not to two thirds of a record. The floor is
     * where "dropping out an instrument at a time" is allowed to reach — a
     * pair, which is still an arrangement and not a solo.
     */
    fewest: 3,
    /**
     * The pad goes first, then the chord part, and the TUNE is the last thing
     * to go before the rhythm section — an ear follows a melody, and a
     * quieter section that drops it has dropped what it was being followed
     * for. Reversing `enter` did exactly that, because parts arrive
     * foundation-first.
     */
    shed: ["drone", "keys", "lead", "bass", "drums"],
    /** a chorus wants everyone; a verse before it is still building */
    fullAbove: 0.8,
    thinBelow: 0.35,
    /**
     * MOSTLY A BED, which is what this program already did: the foundation
     * without the tune, so the tune's entrance is what the intro was for. A
     * quarter of records open on the beat, because that is a documented and
     * distinct way in — Billie Jean, Honky Tonk Women, 9 to 5 — and one in
     * eight opens on the tune itself, which is what the attention-economy
     * numbers say the modern record does. The kinds are the sources'; the
     * weights are [chosen], because nothing published ranks them.
     */
    intro: [
      ["bed", 5],
      ["rhythm", 2],
      ["hook", 1],
    ],
    /**
     * YES, and it is the only thing in this program that goes below the floor.
     * A record whose every section carries at least three parts has no room in
     * it anywhere; the break is where the opening is heard alone, which is
     * what makes it an opening rather than a way in.
     */
    breakdown: true,
    /** one part gone for one span is half a reason to give it back */
    rest: 0.4,
    /**
     * EVERY TREATMENT, EVENLY, and a genre narrows it.
     *
     * There is no source that ranks these against each other — the sources
     * name the moves and do not weigh them — so an even pool is the honest
     * default and every number here would be invention. [chosen]
     *
     * Two things keep an even pool from being a light show. `stage/treat.ts`
     * refuses any treatment that would not actually move THIS genre's desk,
     * so a dry genre is never offered `drench` and the pool is already the
     * genre's own; and the arrangement scores a treatment like every other
     * move, against the debt and against how recently it was used, so an even
     * pool is what it draws FROM and not what it does.
     */
    treat: TREATMENTS.map((t) => [t, 1] as const),
  },

  feel: {
    /**
     * Straight. Swing is a genre's identity and a genre says its own: 54 on
     * sixteenths "loosens a straight beat without it sounding like swing",
     * hip hop machines sit at 54–62 (melodiefabriek.com/blog/mpc-swing-reason).
     * Jitter is uniform, so its standard deviation is the number over √3:
     * 10 ms here is 5.8 ms, a machine's tightness, under the 11–19 ms
     * measured for drummers (Senn et al. 2017, doi:10.3389/fpsyg.2017.01709,
     * and the studies it reviews). A genre that is played, not programmed,
     * says so.
     */
    swing: 50,
    swingGrid: 16,
    jitterMs: 10,
    /**
     * NOTHING, by default: a machine plays on the grid, and where a genre
     * sits against the beat is its identity, so a genre says its own — the
     * same reason swing defaults to straight.
     *
     * What a genre is stating when it fills this in: "typical reported values
     * of microtiming onset asynchronies in groove-based performances range
     * from zero milliseconds to fifty milliseconds or more, depending on
     * instrument, tempo, and genre", and drummers told to play "laid-back"
     * delayed the snare by 17.4 ms on average at 96 bpm (Danielsen et al.
     * 2015; Camara et al. 2020, reviewed in Carter & von Appen, tnp.mtsnys.org
     * /vol49-50/carter_von_appen, which measures Charlie Watts's own beat 2 at
     * a mean 28 ms). The point of stating it per part rather than per record
     * is Keil's: the discrepancy is BETWEEN parts, "one plays ever so slightly
     * ahead of the other ... and the push and pull between them purportedly
     * produces the effect of swing" (Keil, "Participatory Discrepancies and
     * the Power of Music", 1987).
     */
    lean: {},
    /**
     * Programming guides put an ordinary passage between 65 and 95 of 127
     * and save 100 and over for accents — a spread of about a third across
     * the hierarchy, which is 0.3 here — and call 4% either way of a note's
     * weight realistic, 10 to 15% plenty (mastering.com program-realistic-
     * midi-drums; mixelite.com humanizing-midi-drums).
     */
    accent: 0.3,
    velocityJitter: 0.04,
    /**
     * A phrase is not a flat stretch of notes. "A classic arched contour is
     * shaped as a dynamic rise to a peak pitch and descent quieter with
     * falling pitches", and a crescendo into the height of a phrase "builds
     * energy as you approach the climax ... and naturally draws the
     * listener's attention to the peak"
     * (doublebasshq.com/learn_posts/phrasing-part-3-using-dynamics-to-build-
     * musical-phrases). 0.3 puts a fifth of the way through a phrase about
     * 4 dB under its height, which is a shape an ear follows without the
     * record appearing to swell.
     */
    phrase: 0.3,
  },

  sound: {
    voices: { keys: "rhodes", bass: "sub", lead: "pluck", drone: "pad" },
    /** every unit in the rack, every one bypassed: a clean record */
    rack: {
      pole: { hz: 18000, resonance: 0, mix: 0 },
      flange: { rateHz: 0.3, depth: 0.5, ret: 1 },
      ensemble: { rateHz: 0.6, depth: 0.5, ret: 1 },
      echo: { beats: 1.5, feedback: 0.35, ret: 1 },
      spring: { sec: 1.2, ret: 1 },
      room: { sec: 1.5, ret: 1 },
      tape: { lowpassHz: 16000, wowHz: 0.2, wowCents: 0, drive: 1 },
      medium: { kind: "gramophone", mix: 0 },
      vinyl: { crackle: 0 },
      master: { level: 1 },
    },
    /**
     * Where each part sits, and what it feeds. Nothing is sent anywhere by
     * default; a genre says. The stage is the conventional one — drums and
     * bass in the middle, keys a little left, the lead a little right, the
     * drone wide and back.
     *
     * THE LEVELS ARE A BALANCE, not a per-part trim, and that is why they
     * moved. They were set by measuring each part ALONE, which says nothing
     * about what a part does to a record: a chord part holds four sustained
     * notes and a kit is a handful of transients, so equal measured level
     * puts the chords two decibels OVER the drums and leaves the tune four
     * under. The ear "can really only pay attention to 3 separate elements"
     * (omnionsound.com, "The Rule Of Three In Music Composition"), so which
     * three are in front is a decision and not an accident: the tune first,
     * then the rhythm section, and the chords behind them holding the
     * harmony rather than standing in front of it.
     */
    mix: {
      drums: { level: 0.49, pan: 0, sweepHz: 0.1, sweepDepth: 0, pedals: 0, sends: { echo: 0, spring: 0, room: 0, ensemble: 0, flange: 0 }, az: 0, dist: 0.3 },
      bass:  { level: 0.39, pan: 0, sweepHz: 0.1, sweepDepth: 0, pedals: 0, sends: { echo: 0, spring: 0, room: 0, ensemble: 0, flange: 0 }, az: 0, dist: 0.25 },
      keys:  { level: 0.17, pan: -0.3, sweepHz: 0.1, sweepDepth: 0, pedals: 0, sends: { echo: 0, spring: 0, room: 0, ensemble: 0, flange: 0 }, az: -35, dist: 0.4 },
      lead:  { level: 0.60, pan: 0.25, sweepHz: 0.1, sweepDepth: 0, pedals: 0, sends: { echo: 0, spring: 0, room: 0, ensemble: 0, flange: 0 }, az: 30, dist: 0.35 },
      drone: { level: 0.21, pan: 0, sweepHz: 0.05, sweepDepth: 0, pedals: 0, sends: { echo: 0, spring: 0, room: 0, ensemble: 0, flange: 0 }, az: 180, dist: 0.7 },
    },
    world: { width: 0.7, depth: 0.5 },
    /** nothing patched into anything: every cell of the pin matrix empty */
    patch: {
      echo: { echo: 0, spring: 0, room: 0, ensemble: 0, flange: 0 },
      spring: { echo: 0, spring: 0, room: 0, ensemble: 0, flange: 0 },
      room: { echo: 0, spring: 0, room: 0, ensemble: 0, flange: 0 },
      ensemble: { echo: 0, spring: 0, room: 0, ensemble: 0, flange: 0 },
      flange: { echo: 0, spring: 0, room: 0, ensemble: 0, flange: 0 },
    },
    /**
     * Every pedal on the board and every one of them off it — mix 0, so
     * nothing is built. The knob positions are each pedal's own: a Dyna Comp
     * halfway up, an HM-2 dimed because "every knob turned all the way up,
     * that's all" is the only setting anybody uses it at, a fresh battery in
     * the sag, and a Fuzz Face barely starved.
     */
    pedals: {
      comp: { sustain: 0.5, level: 0.5, mix: 0 },
      wah: { rateHz: 1.2, depth: 0.7, mix: 0 },
      sub: { two: 0, gate: 0.012, tone: 900, mix: 0 },
      octave: { mix: 0 },
      meat: { dirt: 0.6, bias: 0.15, dark: 0.5, level: 0.5, mix: 0 },
      muff: { sustain: 0.45, tone: 0.35, level: 0.5, cabHz: 4500, mids: 0, mass: 0, mix: 0 },
      overdrive: { drive: 3, tone: 0.5, mix: 0 },
      fuzz: { gain: 6, mix: 0 },
      saw: { dist: 0.7, low: 1, high: 1, gate: 0.06, tameHz: 6000, level: 0.5, mix: 0 },
      sag: { depth: 0.5, idle: 1, recovSec: 0.12, draw: 0.25, mix: 0 },
      phaser: { rateHz: 0.4, depth: 0.7, mix: 0 },
      tremolo: { rateHz: 4.5, depth: 0.6, mix: 0 },
    },

    /**
     * THE MACHINE, loaded with this program's own drums and every strip at
     * rest: a kit that sounds exactly as it did before the machine existed,
     * which is what a channel strip at its defaults is for.
     *
     * The voicing numbers are the analogue engine's own defaults, off MK2's
     * panel: 47 Hz and 0.85 s on the bass drum, its click at 0.45, the punch
     * layer at 0.55, the snare a little over half wire, and hats at 45 and
     * 420 ms. They mean nothing until a genre loads the analog kit, and they
     * are stated here rather than inside the voice for the same reason every
     * other default is: so "what does this genre do about X" is answerable
     * from the resolved table alone.
     */
    machine: {
      kit: "acoustic",
      circuit: "808",
      tune: 47,
      decay: 0.85,
      tone: 0.45,
      punch: 0.55,
      snappy: 0.55,
      sdtone: 0.5,
      chdecay: 0.045,
      ohdecay: 0.42,
      drive: 1,
      filterHz: 20000,
      channels: {
        kick: { tune: 0, decay: 1, level: 1, cut: 20000, sends: { echo: 0, spring: 0, room: 0, ensemble: 0, flange: 0 } },
        snare: { tune: 0, decay: 1, level: 1, cut: 20000, sends: { echo: 0, spring: 0, room: 0, ensemble: 0, flange: 0 } },
        hat: { tune: 0, decay: 1, level: 1, cut: 20000, sends: { echo: 0, spring: 0, room: 0, ensemble: 0, flange: 0 } },
        openhat: { tune: 0, decay: 1, level: 1, cut: 20000, sends: { echo: 0, spring: 0, room: 0, ensemble: 0, flange: 0 } },
      },
    },
  },
};
